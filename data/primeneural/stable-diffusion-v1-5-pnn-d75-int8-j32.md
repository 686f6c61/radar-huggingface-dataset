# PrimeNeural/stable-diffusion-v1-5-pnn-d75-int8-j32

## Resumen

Este repositorio contiene una versión comprimida del denoiser (UNet) de Stable Diffusion 1.5 mediante la técnica Prime Neural Network (PNN), desarrollada por PrimeNeural (PreciseStatistics GmbH). El modelo sustituye 128 capas lineales del denoiser original por capas PNN dispersas, con una densidad global del 75 % (cada capa con su propia densidad entre el 27 % y el 100 %, fijada según el daño medido), y cuantiza los pesos a INT8 con una escala por fila de salida. El objetivo es reducir el coste de almacenamiento e inferencia del denoiser manteniendo una alta fidelidad respecto al modelo original: la similitud CLIP media entre imágenes generadas con el mismo prompt y semilla es del 83,95 %.

El modelo no es un pipeline autónomo: solo incluye el denoiser. El codificador de texto, el VAE, el tokenizador y el scheduler provienen del Stable Diffusion 1.5 original, por lo que `DiffusionPipeline.from_pretrained` sobre este repositorio no funciona directamente; es necesario cargar el pipeline original y sustituir el denoiser mediante el script `pnn_load.py` incluido. El fichero de pesos ocupa 1441,68 MB, con las partes densas en float16 y las capas PNN en INT8.

La relevancia de esta ficha es doble: por un lado, documenta una propuesta de compresión estructurada (dispersión con patrón fijo por fila y sin almacenamiento de índices) aplicada a un modelo de difusión ampliamente conocido; por otro, advierte de que el formato PNN es propietario y requiere un paquete de software con licencia separada, lo que condiciona su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UNet de difusión (denoiser de Stable Diffusion 1.5) con 128 capas lineales sustituidas por capas PNN dispersas |
| Parámetros totales | 803.814.084 |
| Parámetros activos | no disponible (no es MoE; la dispersión es estructurada por capa, no condicional a la entrada) |
| Longitud de contexto | no disponible (modelo de difusión; no aplica ventana de contexto de texto) |
| Tipos de cuantización | INT8 en las capas PNN (una escala por fila de salida); float16 en las partes densas |
| Idiomas soportados | no disponible (el condicionamiento textual depende del codificador CLIP del modelo base, entrenado principalmente en inglés) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (formato PNN; requiere `pnn_load.py` y el paquete PNN) |

## Arquitectura y entrenamiento

El modelo parte del UNet de Stable Diffusion 1.5 y reemplaza 128 de sus capas lineales por capas PNN. En una capa PNN, cada salida lee un conjunto fijo y estructurado de entradas, con el mismo número de entradas por salida, y no se almacena ningún índice: el patrón de conectividad es implícito y determinista. La densidad global es del 75 %, pero cada capa tiene su propia densidad entre el 27 % y el 100 %, asignada según el daño medido al comprimir esa capa. Los pesos de las capas PNN se cuantizan a INT8 con una escala por fila de salida, mientras que el resto de parámetros del denoiser permanecen en float16.

El entrenamiento se realizó por destilación del denoiser original: primero una reconstrucción bloque a bloque y después rondas de extremo a extremo, sobre llamadas al denoiser registradas del modelo original. Los prompts de entrenamiento proceden en un 50 % de Gustavosta/Stable-Diffusion-Prompts y en un 50 % de sentence-transformers/coco-captions, con entre 15 y 50 pasos de muestreo por prompt. La inicialización fue por mínimos cuadrados y solo se entrenaron las capas PNN. No se documenta en la información disponible el número total de tokens, el volumen exacto de llamadas al denoiser ni el uso de RLHF o DPO (no aplicables a un denoiser de difusión).

## Capacidades

- Generación de imágenes texto-a-imagen mediante el pipeline completo de Stable Diffusion 1.5, sustituyendo únicamente el denoiser.
- Fidelidad alta respecto al modelo original: 83,95 % de similitud CLIP media por imagen con el mismo prompt y semilla sobre prompts reservados.
- Ejecución de las capas PNN en PyTorch estándar, sin necesidad de kernels especializados para un funcionamiento básico.
- Aceleración opcional mediante la librería de kernels PNN (paquete PNN) en CPU y GPU NVIDIA.
- Compatibilidad con los 15 a 50 pasos de muestreo empleados en la destilación; el comportamiento fuera de ese rango no está documentado.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un denoiser de difusión, no un modelo de lenguaje.
- No incluye capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Generación de imágenes en entornos con VRAM limitada: al reducir el denoiser a 1441,68 MB en INT8, el pipeline completo ocupa menos que el original en float16, lo que permite ejecutarlo en GPUs de consumo con menos memoria.
- Prototipado rápido de aplicaciones texto-a-imagen: la API de carga mediante `pnn_load.py` permite integrar el modelo en scripts de Python existentes con diffusers sin reescribir el pipeline.
- Evaluación de técnicas de compresión: sirve como referencia reproducible para comparar dispersión estructurada con cuantización INT8 frente a otras estrategias (pruning no estructurado, destilación densa, cuantización de 4 bits).
- Investigación sobre fidelidad de destilación: el 83,95 % de similitud CLIP con el original permite estudiar la relación entre densidad por capa y degradación perceptual.
- Despliegue en servicios de inferencia con requisitos de almacenamiento ajustados: el tamaño del repositorio (1,4 GB) facilita su distribución en contenedores y nodos de borde.
- Generación de imágenes por lotes en CPU: la librería de kernels PNN declara soporte para CPU, lo que habilita entornos sin GPU NVIDIA para cargas moderadas.
- Benchmarking de pipelines de difusión: al conservar el VAE, el codificador de texto y el scheduler originales, aísla el efecto del denoiser comprimido en métricas de calidad y latencia.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Similitud CLIP con el modelo original (mismo prompt y semilla, prompts reservados) | 83,95 % |
| Densidad global de las capas PNN | 75 % |
| Rango de densidad por capa | 27 % – 100 % |
| Tamaño del fichero de modelo | 1441,68 MB |
| Pasos de muestreo en destilación | 15 – 50 |

No se han publicado resultados de benchmarks estándar (FID, CLIP score absoluto, MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos cuantitativos son la similitud CLIP relativa al original y las cifras de compresión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El denoiser ocupa 1441,68 MB; sumando el codificador de texto, el VAE y las activaciones, el pipeline completo requiere previsiblemente entre 3 y 6 GB en bfloat16/float16, aunque esta cifra no está confirmada en la información proporcionada.
- GPU recomendadas: no disponible. El autor menciona soporte de kernels PNN en GPU NVIDIA, sin especificar modelos.
- GPU de consumo: no se confirma qué modelos concretos lo soportan; el tamaño del denoiser sugiere que podría caber en GPUs con 6 GB o más, pero no hay dato oficial.
- Opciones de despliegue: PyTorch estándar con `pnn_load.py` y el paquete PNN; endpoint de inferencia en primeneural.net. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PrimeNeural/stable-diffusion-v1-5-pnn-d75-int8-j32 | 803.814.084 | no aplica | 83,95 % similitud CLIP con SD 1.5 | creativeml-openrail-m | Hugging Face (requiere paquete PNN) |
| stable-diffusion-v1-5/stable-diffusion-v1-5 | no disponible en la información | no aplica | referencia original | creativeml-openrail-m | Hugging Face, diffusers |
| Otras variantes comprimidas de SD 1.5 | no disponible | no aplica | no disponible | variable | no disponible |

No se dispone de datos de benchmarks ni de parámetros de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa se limita a la similitud CLIP declarada por el autor.

## Limitaciones y advertencias

- El repositorio solo contiene el denoiser; no es un pipeline completo y `DiffusionPipeline.from_pretrained` falla si se usa directamente sobre este repositorio.
- El formato PNN es propietario: el paquete PNN está bajo licencia separada (licencia de evaluación mediante info@primeneural.net) y el formato y el script de carga son © PreciseStatistics GmbH. Esto puede impedir o encarecer el uso comercial.
- La licencia creativeml-openrail-m incluye restricciones de uso en su Attachment A que se aplican sin cambios y deben transmitirse a cualquier tercero que reciba el modelo.
- La similitud del 83,95 % implica una divergencia perceptible respecto al original; no es una réplica exacta y puede degradar prompts fuera de la distribución de entrenamiento.
- El entrenamiento se realizó con prompts en inglés (Stable-Diffusion-Prompts y COCO captions); el rendimiento con otros idiomas no está documentado.
- El comportamiento con pasos de muestreo fuera del rango 15–50 no está validado.
- Riesgo de sesgos y alucinaciones visuales heredado del modelo base Stable Diffusion 1.5, no evaluado específicamente en esta variante.
- No hay datos publicados de FID ni de evaluaciones humanas; la única métrica es la similitud CLIP relativa.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- Patente pendiente (US 19/685,168) sobre la técnica PNN, lo que puede afectar a implementaciones independientes.

## Enlaces

- Hugging Face: https://huggingface.co/PrimeNeural/stable-diffusion-v1-5-pnn-d75-int8-j32
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Licencia: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Plataforma Prime Neural: https://primeneural.net
- Dataset de prompts: https://huggingface.co/datasets/Gustavosta/Stable-Diffusion-Prompts
- Dataset de captions: https://huggingface.co/datasets/sentence-transformers/coco-captions
