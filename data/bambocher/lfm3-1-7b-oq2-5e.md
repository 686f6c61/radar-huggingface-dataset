# bambocher/LFM3-1.7B-oQ2.5e

## Resumen

LFM3-1.7B-oQ2.5e es una cuantizacion mixta del modelo LFM3 de 1.700 millones de parametros (1.728.801.536 parametros reales segun los pesos en safetensors), publicada por el usuario bambocher en Hugging Face. El checkpoint se ha generado con la herramienta oQ de oMLX (version 0.7.3), que aplica cuantizacion de precision mixta por capas y tensores, y se distribuye en formato MLX para su ejecucion en Apple Silicon.

El resultado es un checkpoint de 0,664 GiB (0,713 GB) con un promedio efectivo de 3,301 bits por peso, lo que lo situa en la categoria de cuantizaciones agresivas de 2 a 3 bits. La mayor parte de los pesos (84,435 %) se almacena en affine 3-bit con grupo 128, mientras que un 15,163 % usa affine 3-bit con grupo 64 y una fraccion minima (menos del 0,4 %) conserva mayor precision en 5, 8 y 16 bits.

La relevancia de esta ficha es acotada: se trata de una publicacion de cuantizacion derivada, sin model card descriptiva del modelo base, sin licencia declarada y sin datos de benchmarks ni idiomas. Sirve como artefacto de despliegue ligero para entornos MLX, no como modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3; el checkpoint es una cuantizacion MLX) |
| Parametros totales | 1.728.801.536 (1,729 B) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta oQ: affine 3-bit grupo 128 (84,435 %), affine 3-bit grupo 64 (15,163 %), affine 5-bit grupo 64 (0,307 %), affine 8-bit grupo 64 (0,072 %), BF16 (0,022 %); promedio 3,301 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors con cuantizacion MLX (libreria `mlx`, `custom_code`) |
| Tamano del checkpoint | 0,713 GB / 0,664 GiB |
| Herramienta de cuantizacion | oQ (oMLX v0.7.3) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base LFM3 en la informacion proporcionada: no se detalla si es un transformer denso, un modelo con atencion lineal, un hibrido o una mezcla de expertos, ni se indica el numero de tokens de entrenamiento, la composicion del dataset o si hubo fases de RLHF o DPO. La unica informacion tecnica disponible corresponde al proceso de cuantizacion.

La cuantizacion se ha realizado con oQ (oMLX v0.7.3), que asigna precision de forma no uniforme: la mayor parte de los tensores se comprime a affine 3-bit con grupo 128, un subconjunto relevante pasa a affine 3-bit con grupo 64 (mayor granularidad, 3,50 bits efectivos) y una fraccion residual muy pequena se mantiene en 5, 8 y 16 bits. Este esquema de precision mixta busca preservar la calidad en las capas o tensores mas sensibles mientras reduce el peso total del checkpoint a 0,664 GiB. El checkpoint incluye codigo personalizado (`custom_code`), necesario para cargar los tensores cuantizados en MLX.

## Capacidades

- Generacion de texto: capacidad esperada por tratarse de un modelo de lenguaje, aunque no se documenta en la model card.
- Razonamiento, codigo y matematicas: no disponible; no hay datos que confirmen ni descarten estas capacidades.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Ejecucion en Apple Silicon mediante MLX: confirmada por la libreria y el formato del checkpoint.

## Casos de uso

- Prototipado local en Mac con Apple Silicon: el checkpoint ocupa 0,664 GiB y se carga con MLX, lo que permite experimentar con un modelo de 1,7 B parametros en portatiles con memoria unificada sin GPU dedicada.
- Pruebas de pipelines de cuantizacion: sirve como referencia para evaluar el impacto de la precision mixta oQ (3,301 bits/peso) frente al modelo base en tareas de generacion, midiendo la degradacion introducida.
- Generacion de texto en entornos con memoria muy limitada: al caber en menos de 1 GB de almacenamiento, es viable en dispositivos con restricciones severas de disco y RAM.
- Evaluacion comparativa de tecnicas de cuantizacion: util para investigadores que comparen oQ con GGUF, AWQ o GPTQ sobre el mismo modelo base en tareas controladas.
- Despliegue de demos y notebooks educativos: el tamano reducido facilita incluirlo en ejemplos de carga de modelos cuantizados con MLX y `custom_code`.
- Filtrado o clasificacion de texto de baja exigencia: si el modelo base rinde aceptablemente, puede usarse para tareas simples de etiquetado o resumen corto en local, siempre tras validar la calidad frente al modelo sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada para inferencia: el checkpoint pesa 0,664 GiB; con overhead de runtime MLX y cache KV, se estima un uso en torno a 1-1,5 GB, aunque no se proporciona una cifra oficial.
- GPU recomendadas: no disponible; el formato MLX esta orientado a Apple Silicon (series M1, M2, M3, M4), no a GPU NVIDIA o AMD.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada de 8 GB o superior; no es compatible de forma nativa con CUDA.
- Opciones de despliegue: MLX y mlx-lm (libreria declarada); vLLM, llama.cpp, Ollama y TGI no estan soportados de forma nativa para este formato sin conversion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-1.7B-oQ2.5e | 1,729 B | no disponible | oQ mixta, 3,301 bits/peso | no disponible | safetensors MLX |
| Modelo base LFM3-1.7B | 1,729 B (segun checkpoint) | no disponible | BF16 (presumiblemente) | no disponible | no disponible |
| Otras cuantizaciones del mismo base (GGUF, AWQ, etc.) | 1,729 B | no disponible | 2-4 bits tipicos | no disponible | GGUF / safetensors |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion a 3,301 bits/peso promedio puede degradar la calidad respecto al modelo base; no se aportan evaluaciones que cuantifiquen esa perdida.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; en ausencia de licencia explicita, debe asumirse restriccion hasta confirmarlo con el autor o con la licencia del modelo base.
- No se documentan idiomas soportados ni sesgos conocidos.
- Riesgo de alucinacion: no evaluado en la informacion disponible; debe validarse en el dominio de uso.
- El checkpoint depende de `custom_code` y de MLX; no es portable directamente a otros runtimes sin conversion.
- Publicacion con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni de validacion por la comunidad.
- El identificador del modelo incluye "oQ2.5e", pero el promedio real declarado es de 3,301 bits/peso; conviene no confundir la etiqueta con la precision efectiva.
- Fecha de creacion indicada como 2026-11-14, posterior a la mayoria de referencias disponibles; verificar la procedencia del checkpoint antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/LFM3-1.7B-oQ2.5e
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
