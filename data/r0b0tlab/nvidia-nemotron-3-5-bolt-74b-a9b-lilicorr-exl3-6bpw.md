# r0b0tlab/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-LiLiCorr-EXL3-6bpw

## Resumen

Este repositorio no contiene el modelo Nemotron 3.5 Bolt completo, sino una cuantizacion EXL3 a 6 bits por peso (bpw) del componente borrador LiLiCorr asociado a `nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr`. Se trata de un modelo auxiliar de decodificacion especulativa: su funcion es proponer bloques de tokens que el modelo objetivo de 74B verifica despues, acelerando la generacion sin alterar la distribucion de salida. El autor es r0b0tlab y la arquitectura declarada en el config es `LiLiCorrDraftModel`, con `model_type: qwen3`.

El modelo objetivo al que sirve es NVIDIA Nemotron 3.5 Bolt 74B-A9B 24GB, un Mixture-of-Experts hibrido Mamba-Transformer de NVIDIA con 74.000 millones de parametros totales y aproximadamente 9.000 millones activos por token, disenado para ejecutar tareas agenticas en local dentro de 24 GB de memoria de GPU (RTX o DGX Spark). Este borrador cuantizado tiene 563.918.378 parametros reales (segun safetensors) y un repositorio de 1,1 GB, y su proposito es acompanar al paquete de lenguaje EXL3 del modelo objetivo en `r0b0tlab/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-EXL3-2.08bpw`.

La relevancia es doble: por un lado, permite explorar decodificacion especulativa de doble cuantizacion sobre pesos EXL3; por otro, la propia model card advierte de que la version de exllamav3 citada (commit `21ce2d1a82cab53c9e1301aef92f1239459278b8`) no implementa `LiLiCorrDraftModel`, por lo que la carga falla y no se han medido velocidad de borrador ni longitud de aceptacion. Es, por tanto, un artefacto publicable pero no verificado en ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LiLiCorrDraftModel (borrador de decodificacion especulativa); model_type declarado: qwen3 |
| Parametros totales | 563.918.378 (borrador, dato real de safetensors); el modelo objetivo asociado tiene 74B totales |
| Parametros activos | no aplica al borrador; el objetivo MoE 74B-A9B activa aproximadamente 9B por token |
| Longitud de contexto | 262.144 posiciones maximas declaradas (max_position_embeddings); ventana deslizante de 1.024 |
| Tipos de cuantizacion | EXL3 a 6 bpw, doble cuantizacion, codebook mul1; origen W4A16 NVFP4 re-codificado |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (license: other, license_name: openmdw-1.1) |
| Formato de pesos | safetensors (libreria exllamav3 / EXL3) |

## Arquitectura y entrenamiento

El checkpoint declara la arquitectura `LiLiCorrDraftModel` con tipo de modelo `qwen3`: 5 capas, todas con atencion deslizante de ventana 1.024, `hidden_size` de 4.096, 32 cabezas de consulta y 2 de clave/valor con `head_dim` de 128, `intermediate_size` de 12.288 y vocabulario de 131.072 entradas. El `block_size` es 8 y los `target_layer_ids` (1, 18, 35, 51, 68 y 85) indican de que capas del modelo objetivo extrae representaciones el borrador. Los modulos LiLiCorr usan top-k de candidatos 8, hidden de 1.024, 2 capas, 8 cabezas, ratio MLP de 2,0, factor dim de 1.024 y escala de logits de 8,0; la convolucion tiene kernel 2 y grupo 16. La receta vLLM de NVIDIA emplea 7 tokens especulativos.

No hay informacion sobre el entrenamiento del borrador (tokens, composicion del dataset, RLHF o DPO) en la documentacion disponible. Lo que si se documenta es el proceso de cuantizacion: se desquantizaron las lineales del tronco desde el NVFP4 W4A16 del repositorio original de NVIDIA y se recodificaron a EXL3 6 bpw con codebook mul1. Las matrices de Hessian usadas fueron identidad, no una captura de prefijos, decision que queda registrada en `quant.json`. La atencion, las convoluciones, las normalizaciones y las cabezas LiLiCorr se copiaron en su dtype almacenado sin recuantizar. No existia ningun hermano BF16 del borrador en el Hub, de ahi el enfoque de doble cuantizacion.

## Capacidades

- Generacion de tokens especulativos: el modelo propone secuencias cortas (bloques de 8) que el modelo objetivo verifica en paralelo, acelerando la decodificacion.
- Extraccion de rasgos intermedios de un modelo objetivo de 5 capas seleccionadas, mediante los `target_layer_ids` declarados.
- Prediccion de candidatos con cabezas LiLiCorr (top-k 8) en lugar de una unica propuesta por posicion.
- Manejo de contexto largo en el modelo objetivo: hasta 262.144 posiciones, con ventana deslizante de 1.024 en el borrador.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento en este repositorio concreto; esas capacidades pertenecen al modelo objetivo (VLM orientado a tareas agenticas) segun la documentacion de NVIDIA.
- Capacidades multilingues: no disponible.
- Capacidad especial: decodificacion especulativa con doble cuantizacion EXL3, planteada como acompanamiento del paquete de lenguaje EXL3 a 2,08 bpw.

## Casos de uso

- Aceleracion de inferencia local con el objetivo Bolt: combinado con `r0b0tlab/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-EXL3-2.08bpw`, el borrador serviria para reducir el coste por token del modelo de 74B en GPUs de 24 GB, siempre que el runtime implemente `LiLiCorrDraftModel`.
- Despliegue en estaciones RTX o DGX Spark: el objetivo esta pensado para ejecutar agentes en local junto a otras aplicaciones dentro de 24 GB; el borrador ocupa 1,1 GB adicionales, un sobrecoste de memoria reducido.
- Investigacion en decodificacion especulativa: permite estudiar el efecto del tamano de bloque (8) y del numero de tokens especulativos (7 en la receta vLLM de NVIDIA) sobre la longitud de aceptacion.
- Evaluacion de cuantizacion EXL3 frente a NVFP4: al derivar de pesos W4A16 NVFP4, sirve como caso de estudio de recodificacion a 6 bpw con codebook mul1.
- Integracion en pipelines de generacion de codigo o asistentes tecnicos de baja latencia, donde el borrador aporta ganancia sin cambiar las respuestas del modelo verificador.
- Estudio de cabezas LiLiCorr: los parametros top-k, escala de logits y dimension de factor permiten analizar estrategias de propuesta multi-candidato frente a borradores clasicos de un solo token.
- Validacion de compatibilidad de runtimes: util para comprobar si una version de exllamav3 incorpora ya el soporte de borradores LiLiCorr, dado que el commit citado no lo hace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente que la longitud de aceptacion, la velocidad del borrador y la metrica Q200 no se midieron, y advierte de que no debe extrapolarse la velocidad de la ficha NVFP4 a este paquete. El motivo declarado es que el commit de exllamav3 citado no reconoce `LiLiCorrDraftModel` y `Config.from_directory` falla al cargar.

## Requisitos de hardware

- VRAM del borrador: aproximadamente 1,1 GB de pesos segun el tamano del repositorio (563,9 M de parametros a 6 bpw con doble cuantizacion).
- VRAM total del sistema: debe anadirse a la del modelo objetivo, que NVIDIA disena para caber en 24 GB.
- GPU recomendadas: NVIDIA RTX y DGX Spark son las plataformas objetivo declaradas por NVIDIA para el modelo Bolt; no hay recomendaciones especificas publicadas para el borrador.
- Cabe en GPU de consumo: si, el borrador por si solo ocupa ~1,1 GB; la viabilidad depende de que el modelo objetivo de 74B quepa en memoria, algo que NVIDIA plantea para 24 GB con cuantizacion nativa de 2 bits.
- Opciones de despliegue: exllamav3 con soporte EXL3 (el commit `21ce2d1a82cab53c9e1301aef92f1239459278b8` no carga este borrador); vLLM aparece en la informacion unicamente como receta de NVIDIA para el NVFP4, no como soporte confirmado de este paquete.
- Latencia y throughput: no disponibles; no se midieron en este repositorio.
- Almacenamiento: 1,1 GB en disco.

## Comparativa con modelos similares

| Modelo | Rol | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| r0b0tlab/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-LiLiCorr-EXL3-6bpw | Borrador de decodificacion especulativa | 563,9 M (repo) | 262.144 posiciones declaradas | EXL3 6 bpw, doble cuantizacion | OpenMDW-1.1 | Hub, 0 descargas |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr | Modelo objetivo con cabezas LiLiCorr | 74B totales, ~9B activos | no disponible | NVFP4 W4A16 nativo | OpenMDW-1.1 | Hub oficial de NVIDIA |
| r0b0tlab/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-EXL3-2.08bpw | Paquete de lenguaje EXL3 del objetivo | 74B (objetivo) | no disponible | EXL3 2,08 bpw | no disponible | Hub |
| NVIDIA Nemotron 3.5 Lightning | Modelo MoE para agentes especializados | 30B totales, 3B activos | no disponible | no disponible | no disponible | Anunciado por NVIDIA |

Los tres primeros artefactos no son alternativas entre si, sino componentes apilables de un mismo stack: el objetivo NVFP4, su version EXL3 en 2,08 bpw y el borrador EXL3 a 6 bpw. Lightning es una opcion distinta dentro de la familia Nemotron 3.5, orientada a routing de tareas de alto volumen.

## Limitaciones y advertencias

- No es un modelo autonomo: es un borrador de decodificacion especulativa y no genera respuestas finales por si mismo.
- Fallo de carga documentado: exllamav3 en el commit `21ce2d1a82cab53c9e1301aef92f1239459278b8` no implementa `LiLiCorrDraftModel` y `Config.from_directory` no funciona. Sin actualizacion del runtime, el paquete no es utilizable.
- Sin mediciones: no hay datos de longitud de aceptacion, velocidad del borrador ni Q200; cualquier cifra de rendimiento extrapolada de la ficha NVFP4 seria incorrecta.
- Decisiones de cuantizacion discutibles: el uso de Hessian identidad en lugar de captura de prefijos puede degradar la calidad de propuesta respecto a una calibracion con datos reales.
- Idiomas soportados: no disponibles, tanto en el repositorio como en la informacion de la busqueda web.
- Riesgo de alucinacion: inherente a los modelos generativos; en un borrador se manifiesta como propuestas rechazadas por el verificador, que aumentan el coste computacional en lugar de degradar la salida final.
- Licencia OpenMDW-1.1: es una licencia de pesos abiertos con condiciones propias; conviene revisar el texto completo antes de un uso comercial.
- Artefacto de terceros: la cuantizacion la publica r0b0tlab, no NVIDIA, por lo que no cuenta con el respaldo ni las garantias del fabricante del modelo base.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/r0b0tlab/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-LiLiCorr-EXL3-6bpw
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr
- Modelo objetivo en el Hub de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB
- Paquete de lenguaje EXL3 2,08 bpw: https://huggingface.co/r0b0tlab/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-EXL3-2.08bpw
- Pagina de investigacion de NVIDIA: https://research.nvidia.com/labs/nemotron/Nemotron-3.5-Bolt-24GB/
- Modelos Nemotron en NVIDIA Developer: https://developer.nvidia.com/topics/ai/nemotron
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Guia de terceros sobre Nemotron 3.5 Bolt: https://toolpilotpro.com/nvidia-nemotron-3-5-bolt-guide
- Ficha en SourceForge: https://sourceforge.net/projects/nemotron-3-5-bolt-74b-a9b/
