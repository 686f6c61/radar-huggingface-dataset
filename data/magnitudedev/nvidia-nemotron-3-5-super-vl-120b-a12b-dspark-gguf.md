# magnitudedev/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-DSpark-GGUF

## Resumen
Este repositorio contiene la conversion a GGUF, en cuantizacion Q8_0, del checkpoint de decodificacion especulativa `RedHatAI/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark`, publicada por el usuario magnitudedev para su uso con la herramienta Magnitude. No es un modelo de proposito general: es un modelo borrador (draft) de aproximadamente 1.210 millones de parametros (1.210.111.489 segun los pesos de referencia) cuyo cometido es proponer tokens que el modelo objetivo verifica, reduciendo el numero de pasos de decodificacion.

El modelo objetivo asociado, segun la nomenclatura del repositorio, es un transformer de tipo mezcla de expertos (MoE) de 120.000 millones de parametros totales y 12.000 millones activos por token, con capacidades de vision y lenguaje ("Super VL"). El borrador se distribuye bajo licencia openmdw-1.1, ocupa 1,3 GB y esta etiquetado como conversacional, con 0 descargas y 0 "likes" en el momento de redactar esta ficha.

Su relevancia es acotada pero concreta: permite aplicar decodificacion especulativa sobre un modelo de gran tamano en el ecosistema llama.cpp con un coste adicional de memoria muy bajo, algo especialmente util en despliegues locales o con GPU limitadas, donde acelerar la generacion sin cambiar la distribucion de salida del modelo objetivo marca la diferencia en latencia percibida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo borrador para decodificacion especulativa (esquema DSpark/DFlash). Transformer con atencion causal y ventana deslizante de 2048 tokens en todas las capas, con seleccion de propuestas desde la fila ancla (`dflash.sample_from_anchor = true`). La arquitectura del modelo objetivo (MoE de 120B-A12B) no esta detallada en la informacion disponible |
| Parametros totales | 1.210.111.489 (~1,2 mil millones) para el borrador. El modelo objetivo se denomina "120B" en el nombre del repositorio |
| Parametros activos | No aplica al borrador (modelo denso). El modelo objetivo, segun su nombre, activaria ~12.000 millones por token (A12B); no confirmado en la documentacion |
| Longitud de contexto | no disponible para el modelo objetivo. El borrador declara `dflash.attention.sliding_window = 2048` en cada capa |
| Tipos de cuantizacion | Q8_0 (unico artefacto publicado) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (etiquetada como `license: other` en la model card) |
| Formato de pesos | GGUF, generado con llama.cpp (revision `620d2225cc436ab0b001e3200e590e3b286ef9ab`) |

## Arquitectura y entrenamiento
El artefacto es un borrador de decodificacion especulativa con metadatos concretos: atencion causal en el bloque de propuestas, muestreo desde la fila ancla y ventana deslizante de 2048 tokens en todas las capas. Estos parametros son los que gobiernan como el borrador genera candidatos de bloque que el modelo objetivo valida posteriormente. El checkpoint deriva de la configuracion del repositorio de Red Hat (revision `4ff45128272e4e5c00ab82d2886946650229ced7`) y se ha convertido fijando tambien una revision concreta del tokenizador objetivo (`a1ccf94d69377bf82c4db39798aac28447d9c16f`), lo que sugiere que la compatibilidad de tokenizacion con el modelo verificador es un requisito critico del pipeline.

No se proporciona informacion sobre el dataset de entrenamiento, el numero de tokens vistos, la composicion de los datos ni si se aplicaron tecnicas de alineacion como RLHF o DPO, ni para el borrador ni para el modelo objetivo. Tampoco se documenta ninguna innovacion de entrenamiento mas alla del propio mecanismo DSpark/DFlash de decodificacion especulativa. El unico dato de integridad publicado es el hash SHA-256 del fichero: `da49fd97d494d775285b5df78b27f673c96b4138dab0f7b5859a8b37d298066c`.

## Capacidades
- Generacion de propuestas de tokens (drafting) para decodificacion especulativa sobre el modelo objetivo Nemotron 3.5 Super VL 120B A12B.
- Ejecucion dentro del ecosistema llama.cpp en formato GGUF, con integracion nativa declarada en Magnitude.
- Uso conversacional, segun la etiqueta `conversational` del repositorio; el texto generado por el borrador es verificado por el modelo objetivo, por lo que la calidad final depende de este ultimo.
- Soporte de tool calling o function calling: no disponible, no documentado para el borrador.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad propia; heredado, en su caso, del modelo objetivo.
- Capacidades multilingues: no disponible; la model card no declara idiomas.
- Vision: el modelo objetivo se denomina "VL", pero no hay documentacion sobre si el borrador procesa tokens de imagen o si la decodificacion especulativa cubre ese tipo de entradas.

## Casos de uso
- Aceleracion de inferencia local del modelo objetivo: el borrador se carga junto al modelo de 120B-A12B y propone bloques de tokens que este verifica, con un coste adicional de solo 1,3 GB de pesos. Es el caso de uso principal y practicamente el unico previsto por el autor.
- Despliegue con Magnitude: la model card indica explicitamente que el GGUF esta preparado para esta herramienta, de modo que un equipo que ya use Magnitude puede incorporar el borrador sin cambiar de runtime.
- Reduccion de latencia en asistentes conversacionales de larga duracion: al disminuir el numero de pases del modelo grande por token aceptado, la latencia por respuesta baja de forma perceptible en dialogos multi-turno, siempre que la tasa de aceptacion del borrador sea razonable.
- Servicio de chat autoalojado en hardware limitado: si el modelo objetivo se sirve con descarga parcial a CPU o en una GPU de gama alta con poca VRAM libre, el borrador en Q8_0 apenas consume recursos adicionales y no obliga a recortar mas el presupuesto de memoria.
- Procesamiento por lotes con requisito de throughput: en tareas de generacion masiva (resumen, clasificacion generativa, extraccion de campos) donde el cuello de botella es la decodificacion autoregresiva, la decodificacion especulativa incrementa los tokens por segundo del sistema completo.
- Generacion de codigo asistida en pipelines de desarrollo: combinado con el modelo objetivo de 120B, puede emplearse en asistentes de autocompletado o revision de codigo donde la latencia interactiva es determinante; el borrador no aporta capacidad de codigo por si mismo.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: util como artefacto reproducible (revisiones de llama.cpp y tokenizador fijadas, hash publicado) para medir tasas de aceptacion y aceleracion frente a otras estrategias de drafting.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. Tampoco hay datos de tasa de aceptacion de tokens, aceleracion (speedup) medida frente a decodificacion estandar, latencia o throughput para este borrador ni para el modelo objetivo.

## Requisitos de hardware
- Peso del borrador: 1,3 GB en disco en cuantizacion Q8_0; en memoria, aproximadamente 1,3-1,5 GB de VRAM o RAM, mas el overhead de contexto y de la ventana deslizante de 2048 tokens por capa.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de memoria libre puede alojar el borrador, incluidas GTX 1650, RTX 3050, RTX 3060 y superiores. El borrador no es el factor limitante del despliegue.
- Cabe en GPU de consumo: si, con margen amplio. Tambien puede ejecutarse en CPU sin penalizacion relevante para el borrador, aunque el rendimiento global dependera del modelo verificador.
- Requisitos del modelo objetivo: el modelo de 120B-A12B requiere mucha mas memoria; las cifras concretas de VRAM por cuantizacion no estan disponibles en la informacion proporcionada.
- Opciones de despliegue: llama.cpp (llama.cpp / llama-server) y Magnitude. No hay confirmacion de soporte en vLLM, TGI u Ollama para este artefacto dspark concreto.
- Latencia y throughput estimados: no disponible. El beneficio real depende de la tasa de aceptacion del borrador, que no se documenta.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este repositorio (DSpark GGUF Q8_0) | Borrador de decodificacion especulativa | ~1,2B | Ventana deslizante de 2048 en el borrador | GGUF Q8_0 | openmdw-1.1 | HuggingFace, 0 descargas |
| RedHatAI/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark | Borrador original del que deriva esta conversion | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| NVIDIA Nemotron 3.5 Super VL 120B A12B | Modelo objetivo (MoE multimodal) | 120B totales / 12B activos (segun nombre) | no disponible | no disponible | no disponible | no disponible |
| Otras tecnicas de drafting (por ejemplo, cabezas tipo EAGLE o Medusa) | Metodos de decodificacion especulativa | no disponible | no disponible | no aplica | no disponible | No comparables con los datos disponibles |

No se dispone de resultados de rendimiento ni de especificaciones detalladas de las alternativas, por lo que la comparacion cuantitativa queda fuera del alcance de esta ficha.

## Limitaciones y advertencias
- El modelo no es autonomo: sin el modelo objetivo correspondiente no produce resultados utiles, ya que su funcion es proponer tokens que otro modelo verifica.
- Dependencia estricta del tokenizador y de la configuracion del modelo objetivo; la model card fija revisiones concretas de origen y de tokenizador, y usar otras puede degradar o invalidar la decodificacion especulativa.
- Solo se publica la cuantizacion Q8_0, lo que limita el ajuste fino del equilibrio entre memoria y velocidad para el borrador.
- Ausencia total de datos de rendimiento: sin tasa de aceptacion ni speedup medido, no se puede garantizar que la aceleracion compense la complejidad del despliegue.
- Repositorio sin descargas ni "likes" y con una unica actualizacion registrada; el artefacto no ha sido validado por la comunidad.
- No se documentan sesgos, comportamiento en idiomas distintos del ingles ni riesgo de alucinacion del modelo objetivo. Al tratarse de decodificacion especulativa, una implementacion correcta no deberia alterar la distribucion de salida del verificador, pero no hay verificacion publicada de este punto.
- La licencia openmdw-1.1 debe revisarse antes de un uso comercial, ya que la model card la marca como `license: other` y el modelo base puede arrastrar condiciones adicionales.
- No hay informacion sobre el tratamiento de entradas multimodales (imagen) dentro del proceso de drafting, pese a que el modelo objetivo es de tipo vision-lenguaje.
- La ventana deslizante de 2048 tokens por capa condiciona la longitud de los bloques que el borrador puede proponer con coherencia.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/magnitudedev/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-DSpark-GGUF
- Modelo base: https://huggingface.co/RedHatAI/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark
- Revision del checkpoint de origen: https://huggingface.co/RedHatAI/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark/tree/4ff45128272e4e5c00ab82d2886946650229ced7
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Magnitude: https://github.com/magnitudedev/magnitude
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
