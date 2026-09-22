# PotatoForge/Kroma-Pruned-Experiments

## Resumen

Kroma-Pruned-Experiments es un repositorio experimental publicado por el usuario PotatoForge que contiene versiones podadas estructuralmente de Kroma v0.3 Turbo, el modelo base lodestones/Kroma. No se trata de un modelo entrenado desde cero, sino de una serie de checkpoints derivados en los que se ha aplicado una poda fisica: se elimina un bloque transformer completo y se recortan canales de las capas MLP de los bloques restantes, de modo que los pesos eliminados no se almacenan en el checkpoint en lugar de limitarse a desactivarse en tiempo de ejecucion.

La relevancia de este repositorio es acotada y de caracter practico: sirve como banco de pruebas para medir cuanto se puede reducir el tamano de un modelo mediante poda estructural antes de degradar su utilidad, y para comparar variantes de cuantizacion sobre una misma arquitectura podada. El autor publica cuatro variantes (BF16 original, BF16 podada, INT8 ConvRot y Mixed Quant) cuyos tamanos van de los ~23,8 GB del original a los ~7,84 GB de la version con cuantizacion mixta.

El repositorio no incluye model card con licencia, parametros totales, contexto ni datos de entrenamiento, no registra descargas ni valoraciones en el momento de la consulta y esta etiquetado como compatible con ComfyUI. Toda la informacion tecnica disponible procede unicamente del README del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bloques residuales y capas MLP (detalles completos no disponibles) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (sin cuantizar), INT8 ConvRot, Mixed Quant |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | lodestones/Kroma (Kroma v0.3 Turbo) |
| Relacion con el modelo base | quantized (derivado cuantizado y podado) |
| Bloques transformer | 28 en el original, 27 en la version podada v1 |
| Anchura MLP | 16.384 en el original, 14.848 en la version podada v1 |
| Tamano del repositorio | 35,5 GB |
| Fecha de creacion | 22 de septiembre de 2026 |
| Ultima actualizacion | 22 de septiembre de 2026 |

## Arquitectura y entrenamiento

La informacion disponible confirma que Kroma es un transformer con una pila de bloques repetidos, cada uno con una seccion MLP cuya anchura se especifica en canales (16.384 en el modelo original). No se documenta el tipo de atencion, el numero de cabezas, la dimension del modelo ni el regimen de entrenamiento (no consta si hubo RLHF, DPO, destilacion o ajuste supervisado). Tampoco se indica el volumen de tokens, la composicion del dataset ni si el modelo procesa texto, imagen u otra modalidad; las etiquetas comfyui y comfy sugieren integracion con ese entorno de generacion, pero el repositorio no lo detalla.

La innovacion tecnica del repositorio es exclusivamente la poda estructural fisica aplicada en la variante Pruned v1. Concretamente, se elimina por completo el bloque transformer numero 2 del original, reduciendo el recuento de 28 a 27 bloques, y se recortan 1.536 canales MLP en cada uno de los bloques restantes, bajando la anchura de 16.384 a 14.848. El autor subraya que la poda es real: los pesos desaparecen del checkpoint y no se conservan enmascarados. Sobre esa base podada se ofrecen tres formatos de almacenamiento: BF16 sin cuantizar (~21,6 GB), INT8 ConvRot (~11,4 GB) y Mixed Quant (~7,84 GB), frente a los ~23,8 GB del BF16 original.

## Capacidades

- Generacion de texto, codigo, matematicas o cualquier otra tarea: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio, imagen): no confirmadas en la informacion disponible, aunque las etiquetas comfyui y comfy apuntan a un uso dentro de ese ecosistema.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Capacidad destacable verificada: reduccion del tamano del checkpoint mediante poda estructural fisica y posterior cuantizacion, con tres niveles de compresion sobre una misma base podada.
- Modo thinking o variantes de razonamiento explicito: no disponible.

## Casos de uso

- Despliegue en entornos con VRAM limitada: la variante Mixed Quant (~7,84 GB) permite cargar el modelo en GPU de consumo de gama alta, mientras que el BF16 original (~23,8 GB) exige aceleradores profesionales. Es util para validar si la perdida de calidad por poda es aceptable antes de invertir en hardware.
- Evaluacion comparativa de tecnicas de compresion: el repositorio ofrece cuatro variantes de la misma base, lo que permite medir de forma controlada el impacto de la poda estructural y de cada esquema de cuantizacion sobre las mismas entradas.
- Pruebas de integracion en ComfyUI: dado el etiquetado comfyui y comfy, la version INT8 ConvRot es un candidato razonable para flujos de trabajo en ese entorno donde el modelo original no cabe en memoria.
- Reproduccion de experimentos de poda: los cambios documentados (eliminacion del bloque 2 y recorte de 1.536 canales MLP por bloque) son lo bastante concretos como para reproducir el procedimiento sobre otros checkpoints de la misma familia.
- Investigacion sobre degradacion de calidad: comparar BF16 original frente a BF16 podada aísla el efecto puro de la poda, sin que la cuantizacion contamine el resultado.
- Despliegue en pipelines sin conexion o con restricciones de ancho de banda: los checkpoints mas pequenos reducen el tiempo de descarga y el espacio en disco necesario para replicar el modelo en varios nodos.
- Prototipado rapido en una sola GPU: la variante Mixed Quant permite iterar sobre prompts y configuraciones sin esperar a aprovisionar memoria suficiente para el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El README del autor no incluye metricas de calidad, comparaciones numericas entre variantes ni evaluaciones objetivas. Tampoco se aportan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada (basada en el tamano de los ficheros, sin margen de overhead): BF16 original ~23,8 GB; Pruned v1 BF16 ~21,6 GB; Pruned v1 INT8 ConvRot ~11,4 GB; Pruned v1 Mixed Quant ~7,84 GB. En la practica hay que sumar memoria para activaciones y buffers, por lo que los valores reales seran superiores.
- GPU recomendadas: para las variantes BF16 (original y podada) se necesita al menos una GPU profesional tipo A100 40 GB, H100 o L40S; para INT8 ConvRot, una RTX 4090 (24 GB) o A6000 deberia ser suficiente; para Mixed Quant, una GPU de consumo con 12-16 GB podria bastar, sujeto a comprobacion empirica.
- Cabe en GPU de consumo: probablemente si en las variantes INT8 ConvRot y Mixed Quant; las variantes BF16 no caben en tarjetas de 24 GB sin tecnicas de offload.
- Opciones de despliegue: no especificadas por el autor. Las etiquetas sugieren ComfyUI; el formato safetensors es compatible con cargadores genericos, pero no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| PotatoForge/Kroma-Pruned-Experiments (Mixed Quant) | no disponible | no disponible | no disponible | HuggingFace, 0 descargas | ~7,84 GB, poda estructural + cuantizacion mixta |
| PotatoForge/Kroma-Pruned-Experiments (INT8 ConvRot) | no disponible | no disponible | no disponible | HuggingFace, 0 descargas | ~11,4 GB, poda estructural + INT8 |
| lodestones/Kroma (modelo base) | no disponible | no disponible | no disponible | HuggingFace | ~23,8 GB en BF16, 28 bloques, MLP de 16.384 canales |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion para identificar modelos comparables |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion. Es un bloqueo serio para cualquier despliegue en produccion.
- Modelo experimental: el propio autor lo etiqueta como "experiments". No hay garantia de estabilidad, soporte ni mantenimiento.
- Sin benchmarks: no existe evidencia publicada de que las variantes podadas mantengan la calidad del modelo original. La poda de un bloque completo y de 1.536 canales MLP por bloque puede degradar la salida de forma perceptible.
- Trazabilidad limitada: solo hay cuatro variantes descritas en texto; no se documentan hashes, procedimiento exacto de poda ni criterios de seleccion de canales.
- Idiomas: unicamente ingles segun la etiqueta del repositorio.
- Adopcion nula: cero descargas y cero valoraciones en el momento de la consulta, lo que reduce la probabilidad de encontrar informes de terceros sobre su comportamiento real.
- Datos incompletos: se desconoce el numero de parametros, la longitud de contexto, el tipo exacto de arquitectura y el regimen de entrenamiento, lo que impide estimar con precision requisitos de memoria y latencia.
- Fecha de publicacion inusual (2026) en los metadatos del repositorio; conviene verificar la vigencia de los ficheros antes de usarlos.
- Sin informacion sobre sesgos ni alucinacion: al no documentarse el dataset de entrenamiento, no se puede evaluar el sesgo ni la fiabilidad factual del modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/PotatoForge/Kroma-Pruned-Experiments
- Modelo base: https://huggingface.co/lodestones/Kroma
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada.
