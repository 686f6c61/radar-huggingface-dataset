# bambocher/Qwen3.5-4B-heretic-oQ3.5e-mtp

## Resumen

Qwen3.5-4B-heretic-oQ3.5e-mtp es una cuantizacion mixta del modelo Qwen3.5-4B, publicada por el usuario bambocher en Hugging Face. El checkpoint conserva el modelo de lenguaje, la torre de vision y una cabeza MTP (multi-token prediction) del modelo original, y los comprime mediante cuantizacion de precision mixta con la herramienta oQ (oMLX v0.7.3). El resultado es un checkpoint de 4.660 millones de parametros logicos almacenado en 2,895 GB, con un promedio efectivo de 4,968 bits por peso.

El interes practico de esta publicacion es el formato: usa la libreria MLX, orientada a la inferencia en silicio de Apple, y aplica un esquema de cuantizacion por grupos de 64 pesos en el que cada tensor recibe un ancho de bits distinto segun su sensibilidad. La mayor parte del peso (55,6 %) se almacena a 3 bits, mientras que una fraccion pequena (7,5 %) se mantiene en BF16 para preservar capas criticas. Esto permite ejecutar un modelo multimodal de 4B con cabeza MTP en equipos con memoria unificada relativamente modesta.

La model card no documenta el modelo base, los datos de entrenamiento ni los resultados de evaluacion; toda la informacion disponible se limita al desglose de cuantizacion y al inventario de pesos. La ficha siguiente refleja unicamente esos datos y marca como no disponible todo lo que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con torre de vision y cabeza MTP; detalles de capas y atencion no disponibles |
| Parametros totales | 4.659.865.088 (4,660B logicos) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta oQ: affine 3, 4, 5, 6 y 8 bits con grupo 64, mas tensores en BF16; promedio efectivo 4,968 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx) |
| Tamano del repositorio | 2,9 GB (2,894 GB / 2,695 GiB) |
| Desglose de pesos | LM: 4,206B (1,993 GiB); vision: 0,334B (0,621 GiB); cabeza MTP: 0,121B (0,081 GiB) |

## Arquitectura y entrenamiento

El checkpoint deriva de un modelo Qwen3.5 de 4B con capacidad multimodal: incluye una torre de vision de 0,334B de parametros y una cabeza MTP de 0,121B, ademas del modelo de lenguaje de 4,206B. La presencia de una cabeza MTP sugiere soporte para prediccion multi-token, una tecnica habitual para acelerar la decodificacion especulativa, aunque la model card no describe como se usa en inferencia ni que ganancia de throughput aporta.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el proceso de alineacion (RLHF, DPO u otros) ni las innovaciones de atencion del modelo original. Lo unico documentado es el proceso de cuantizacion: oQ asigna anchos de bits por tensor con grupos de 64 pesos, concentrando el 55,581 % de los pesos logicos en 3 bits (1,055 GiB), el 22,137 % en 4 bits (0,540 GiB), el 13,231 % en 5 bits (0,395 GiB) y dejando en BF16 el 7,459 % (0,647 GiB). El sufijo "heretic" del nombre no viene explicado en la documentacion disponible.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5-4B, sin detalle publicado sobre rendimiento.
- Procesamiento de vision: el checkpoint incluye una torre visual de 0,334B de parametros, por lo que se espera soporte de entrada de imagenes, aunque no se documentan resoluciones ni tareas concretas.
- Prediccion multi-token: la cabeza MTP de 0,121B esta presente en el checkpoint y podria emplearse para decodificacion especulativa.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el autor no declara idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Mac con memoria unificada: al estar empaquetado en MLX y ocupar 2,9 GB, el checkpoint puede cargarse en equipos Apple Silicon de gama media para prototipado de asistentes conversacionales sin depender de GPU dedicada.
- Pruebas de cuantizacion mixta: util para investigadores que quieran medir la perdida de calidad de un esquema 3/4/5/6/8 bits frente al modelo BF16 original en tareas concretas.
- Evaluacion de decodificacion especulativa: la cabeza MTP incluida permite experimentar con generacion multi-token y comparar latencia frente a decodificacion autoregresiva estandar.
- Prototipos multimodales ligeros: la torre de vision integrada posibilita construir demos de descripcion de imagenes o extraccion de informacion visual en un portatil.
- Fine-tuning de bajo coste sobre la base cuantizada: el reducido tamano del repositorio facilita iterar con adaptadores sobre un checkpoint ya comprimido en entornos con VRAM limitada.
- Distribucion de demos: el tamano de 2,9 GB permite empaquetar el modelo en aplicaciones de escritorio o contenedores ligeros para pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: en torno a 3 GB solo para los pesos; con cache KV y overhead de runtime, se recomienda un minimo de 6-8 GB.
- GPU recomendadas: no hay datos especificos del autor; por formato MLX, el entorno natural son chips Apple M1/M2/M3/M4 con 8 GB o mas de memoria unificada.
- GPU NVIDIA: al ser un checkpoint MLX, no es directamente compatible con CUDA sin conversion previa; no se documenta dicha conversion.
- Despliegue: libreria MLX (mlx-lm/mlx-vlm segun corresponda); no se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato cuantizado oQ no es estandar en esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-heretic-oQ3.5e-mtp | 4,660B | no disponible | safetensors MLX, precision mixta | no disponible | Incluye vision y cabeza MTP |
| Qwen3.5-4B (original) | ~4B | no disponible | safetensors | no disponible | Referencia BF16; datos no publicados en esta ficha |
| Otras cuantizaciones MLX de modelos 4B | ~4B | variable | safetensors MLX | variable | No disponible comparacion concreta |

No se dispone de datos de rendimiento ni de especificaciones del modelo base que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- La cuantizacion a 3 bits en el 55,6 % de los pesos puede degradar la calidad frente al modelo original; el autor no publica evaluaciones que lo cuantifiquen.
- El sufijo "heretic" sugiere una modificacion del comportamiento del modelo base, pero no se documenta que se altero ni con que efecto.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; conviene contactar con el autor antes de usarlo en produccion.
- No se declaran idiomas soportados; el rendimiento en castellano es desconocido.
- Riesgo de alucinacion inherente a los modelos de 4B, agravado por la compresion agresiva de pesos.
- El checkpoint depende de la libreria MLX; no es portable a otros runtimes sin conversion.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validacion de la comunidad ni informes de errores.
- La model card no especifica la longitud de contexto, lo que limita la planificacion de aplicaciones con ventanas largas.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-4B-heretic-oQ3.5e-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Qwen3.5-4B: no disponible en la informacion proporcionada
- Paper, blog o demo del autor: no disponible
