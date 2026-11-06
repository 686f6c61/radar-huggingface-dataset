# jancirnodziewiaty/gemma-4-E2B-it-oQ5e-fp16-mtp

## Resumen

gemma-4-E2B-it-oQ5e-fp16-mtp es una cuantización de precisión mixta del modelo Gemma 4 E2B instruct, publicada por el usuario jancirnodziewiaty en Hugging Face. El checkpoint se ha generado con la herramienta oQ (oMLX v0.7.3), un esquema de cuantización de precisión mixta orientado a la librería MLX de Apple, lo que lo hace ejecutable en hardware Apple Silicon mediante el framework MLX. El resultado es un checkpoint de 5.182 millones de parámetros lógicos que ocupa 4,98 GiB en disco, con una media efectiva de 8,254 bits por peso.

El modelo subyacente, Gemma 4 E2B, pertenece a la familia Gemma de Google y, según la distribución de pesos del checkpoint, es un modelo multimodal: incluye un componente de lenguaje (4.632B parámetros lógicos), un codificador de visión (0.167B), un codificador de audio (0.305B) y una cabeza MTP (Multi-Token Prediction) de 0.078B. La presencia de MTP sugiere soporte de decodificación especulativa o predicción multi-token, una técnica que acelera la generación.

La relevancia de esta publicación es práctica: ofrece una vía para ejecutar un modelo multimodal de la familia Gemma 4 en equipos Apple Silicon con un consumo de memoria contenido (unos 5 GB), a costa de una cuantización agresiva en la mayoría de las capas (5 bits con grupo de 64) y preservando en FP32 y BF16 los tensores más sensibles. No obstante, la información pública del repositorio es mínima: no hay model card descriptiva, benchmarks ni detalles de entrenamiento más allá de la tabla de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + visión + audio) con cabeza MTP; pesos cuantizados para MLX |
| Parametros totales | 5.182.291.015 (lógicos) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta oQ: affine 5-bit (grupo 64), affine 6-bit (grupo 64), affine 8-bit (grupo 64), BF16, FP16, FP32, I64; media efectiva 8,254 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer multimodal de la familia Gemma 4, con un tronco de lenguaje de 4.632B parámetros lógicos, un codificador visual de 0.167B y un codificador de audio de 0.305B. El checkpoint incorpora además una cabeza MTP (Multi-Token Prediction) de 0.078B parámetros, lo que apunta a un mecanismo de predicción de varios tokens por paso, habitualmente empleado para decodificación especulativa y para aumentar el throughput de generación.

Sobre el entrenamiento del modelo base no hay información en la documentación proporcionada: se desconoce el volumen de tokens, la composición del dataset, la existencia de RLHF o DPO y cualquier innovación de entrenamiento. Lo único documentado es el proceso de cuantización posterior: oMLX v0.7.3 aplicó precisión mixta con distribución asimétrica, dejando en 5 bits el 76,4% de los pesos lógicos, en 6 bits el 10,6%, en 8 bits el 2,4%, y preservando en FP32 el 9,1% (0.472B parámetros, 1.759 GiB de almacenamiento), lo que sugiere que esos tensores corresponden a componentes sensibles a la cuantización (probablemente normas, embeddings o cabezas). El componente de audio es el que proporcionalmente ocupa más espacio (1.136 GiB para 0.305B parámetros), y el de visión 0.623 GiB para 0.167B.

## Capacidades

- Generación de texto e instrucciones: el sufijo "it" indica un modelo ajustado para seguir instrucciones.
- Procesamiento de visión: el checkpoint incluye un codificador visual de 0.167B parámetros, por lo que se espera soporte de entrada de imágenes.
- Procesamiento de audio: incluye un codificador de audio de 0.305B parámetros, lo que sugiere capacidad de transcripción o comprensión de audio.
- Predicción multi-token (MTP): la cabeza dedicada de 0.078B parámetros habilita decodificación especulativa o generación multi-token.
- Ejecución en Apple Silicon mediante MLX: el formato de pesos está pensado para el framework MLX.
- Tool calling, agentes, razonamiento multi-paso y capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el checkpoint ocupa 4,98 GiB, por lo que puede cargarse en equipos con 16 GB de memoria unificada o más, permitiendo ejecutar un modelo multimodal de 5.182B parámetros lógicos sin GPU dedicada.
- Prototipado de asistentes multimodales en local: al incluir codificadores de visión y audio, permite construir demos de asistente que reciban imagen y audio además de texto, usando MLX como runtime.
- Evaluación de cuantización de precisión mixta: la distribución de bits documentada (5/6/8/FP32) permite estudiar el impacto de la cuantización selectiva en calidad frente al modelo original, comparando capas preservadas en FP32 con las comprimidas a 5 bits.
- Investigación sobre decodificación especulativa: la cabeza MTP incluida facilita experimentos de generación multi-token y medición de aceleración frente a decodificación autoregresiva clásica.
- Despliegue de bajo consumo en portátiles: con ~5 GB de pesos, es viable en MacBook con memoria unificada, útil para entornos sin acceso a GPU de datacenter.
- Pruebas de pipelines de audio: el componente de audio (1.136 GiB) permite experimentar con transcripción o comprensión de audio en local sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 5 GB para los pesos en el formato cuantizado (4,98 GiB); se necesita margen adicional para el contexto y los estados de activación, por lo que se recomienda un mínimo de 8-16 GB de memoria unificada.
- GPU recomendadas: hardware Apple Silicon (series M1, M2, M3, M4 y superiores) por el uso de MLX; no está pensado para GPUs NVIDIA o AMD en este formato.
- Compatibilidad con GPU de consumo: sí, en equipos Apple con memoria unificada suficiente; no se documenta compatibilidad con RTX 4090 u otras GPU de consumo x86 en este formato.
- Opciones de despliegue: MLX (librería nativa) y oMLX; no se documenta soporte de vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| gemma-4-E2B-it-oQ5e-fp16-mtp (este) | 5.182B lógicos | no disponible | safetensors MLX, precisión mixta oQ | no disponible | Cuantización comunitaria de Gemma 4 E2B con MTP |
| Gemma 4 E2B it (original) | no disponible | no disponible | no disponible | no disponible | Modelo base de Google; sin datos en esta ficha |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de información de modelos comparables en la búsqueda |

## Limitaciones y advertencias

- La cuantización a 5 bits en el 76,4% de los pesos puede degradar la calidad respecto al modelo original; no hay evaluación publicada que cuantifique esa pérdida.
- La model card no documenta sesgos, comportamiento en dominios sensibles ni tasas de alucinación.
- Licencia no disponible: no puede confirmarse si el uso comercial está permitido; debe consultarse la licencia del modelo Gemma 4 original de Google antes de usarlo en producción.
- Idiomas soportados no documentados; el rendimiento multilingüe es desconocido.
- Longitud de contexto no disponible, lo que impide planificar cargas de trabajo con ventanas largas.
- El formato está atado a MLX: no es directamente utilizable en ecosistemas CUDA, vLLM o llama.cpp sin conversión.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es una publicación reciente y sin validación comunitaria.
- El nombre del checkpoint menciona "fp16" y "mtp", pero la tabla de cuantización muestra que solo el 0,006% de los pesos está en FP16; el resto usa precisión mixta, lo que puede inducir a error sobre el formato real.

## Enlaces

- Hugging Face: https://huggingface.co/jancirnodziewiaty/gemma-4-E2B-it-oQ5e-fp16-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
