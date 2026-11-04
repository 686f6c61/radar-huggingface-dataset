# aungthuhein-dev/Unlimited-OCR-2-bnb-nf4

## Resumen

Unlimited-OCR-2 bnb NF4 es una versión cuantizada a 4 bits del modelo Baidu/Unlimited-OCR-2, publicada por el usuario independiente aungthuhein-dev. Se trata de un modelo de extracción de texto a partir de imágenes (image-to-text) especializado en OCR, con 3.343.978.497 parámetros totales y un pipeline declarado de image-text-to-text. La cuantización emplea bitsandbytes NF4 con doble cuantización y cómputo en bf16, aplicada a todas las capas lineales, incluyendo el modelo de lenguaje, los expertos MoE y los codificadores de visión.

El interés principal de esta ficha reside en que reduce el pico de memoria GPU de 7,39 GB a 3,17 GB (-57 %) con un coste de latencia del +17 % (de 6,73 s a 7,86 s por página) y una degradación de precisión prácticamente nula en el conjunto de prueba del autor (CER medio de 0,069 % en bf16 frente a 0,068 % en NF4). Esto permite ejecutar un OCR de gama alta en GPUs de consumo con suficiente VRAM, algo que la versión original en bf16 también permite pero con menos margen.

Es relevante ahora porque demuestra que la cuantización data-free de un modelo multimodal con componentes MoE y de visión puede mantener la calidad de reconocimiento mientras reduce a la mitad el footprint de memoria, un patrón habitual en el despliegue de OCR a escala en producción. El modelo base pertenece a Baidu y se distribuye bajo licencia MIT, que esta copia cuantizada conserva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con componentes MoE y codificadores de visión, según la model card del autor |
| Parametros totales | 3.343.978.497 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bitsandbytes NF4 de 4 bits, doble cuantización, cómputo en bf16; sin calibración (data-free) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors, con `custom_code` y configuración de cuantización embebida en `config.json` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de que combina un modelo de lenguaje con expertos MoE y codificadores de visión, y que el pipeline es image-text-to-text. El proceso de cuantización de esta copia aplica NF4 de bitsandbytes con doble cuantización sobre todas las capas lineales (modelo de lenguaje, expertos MoE y codificadores de visión), con cómputo en bf16 y sin calibración, es decir, data-free. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica destacable de esta publicación no está en el entrenamiento sino en la cuantización: mantiene la precisión de OCR con una reducción del 57 % en memoria pico y un incremento de latencia del 17 %. El autor advierte de que la carga debe hacerse con `torch_dtype=torch.bfloat16`, ya que sin ello las capas no cuantizadas se cargan en float16 y la inferencia falla con un error de tipos entre BFloat16 y Half.

## Capacidades

- Extracción de texto a partir de imágenes (OCR) mediante el método `infer` del modelo, con modo de evaluación.
- Procesamiento de documentos página a página, con salida de texto plano.
- Integración con la librería transformers mediante `trust_remote_code=True` y código personalizado del modelo base.
- Cuantización de 4 bits que permite ejecución en GPUs NVIDIA con CUDA; no funciona en CPU ni en Apple Silicon.
- Soporte de tool calling, agentes, razonamiento multi-paso, visión general, audio o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Digitalización masiva de archivos administrativos: el modelo procesa páginas escaneadas una a una y devuelve texto con un CER medio inferior al 0,1 % en el conjunto de prueba del autor, lo que permite indexar corpus documentales completos con revisión humana mínima.
- Extracción de texto en pipelines de facturación: al reducir el pico de memoria a 3,17 GB, se pueden ejecutar varias instancias en paralelo en una sola GPU para procesar lotes de facturas y albaranes en un servicio de back office.
- OCR en estaciones de trabajo con GPU de consumo: al caber en GPUs con 4-8 GB de VRAM, permite desplegar reconocimiento de documentos en equipos locales sin depender de servicios en la nube, útil en entornos con requisitos de privacidad.
- Procesamiento de documentación técnica y manuales: la extracción de texto fiable facilita la construcción de bases de conocimiento y sistemas de búsqueda sobre manuales escaneados.
- Automatización de la entrada de datos en sistemas legacy: el texto extraído puede alimentar formularios o bases de datos mediante scripts, sustituyendo la transcripción manual de documentos en papel.
- Preprocesado para pipelines de RAG sobre documentos escaneados: el OCR convierte PDFs e imágenes en texto que después se trocea y se indexa en un sistema de recuperación aumentada, con la ventaja de que el modelo cuantizado reduce el coste de infraestructura del paso de ingestión.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos en una porción MIG `3g.71gb` de NVIDIA H200, sobre 17 páginas con ground truth, 1 ejecución de calentamiento y 3 ejecuciones cronometradas por página:

| Metrica | bf16 (original) | NF4 (este repo) |
|---|---:|---:|
| Memoria GPU pico | 7,39 GB | 3,17 GB (-57 %) |
| Tiempo por pagina | 6,73 s | 7,86 s (+17 %) |
| Tokens por segundo | 38,0 | 32,5 |
| CER medio | 0,069 % | 0,068 % |
| WER medio | 0,247 % | 0,234 % |

El propio autor advierte de que el conjunto de prueba es pequeño y que las diferencias de CER de unos pocos caracteres no son significativas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 3,17 GB de pico en NF4 según la medición del autor; la versión bf16 original requiere 7,39 GB.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA y al menos 4 GB de VRAM para NF4; el autor midió en una porción MIG de H200. Para bf16 se recomienda una GPU con 8 GB o más.
- Cabe en GPU de consumo: sí, en NF4 cabe en tarjetas con 4-6 GB de VRAM; en bf16 requiere al menos 8 GB.
- Opciones de despliegue: transformers con `trust_remote_code=True` y bitsandbytes; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. bitsandbytes 4-bit no funciona en CPU ni en Apple Silicon.
- Versiones requeridas: `torch==2.13.0` (versiones más recientes incluyen Triton 3.9, que rompe los kernels de atención del modelo), `transformers==4.52.1`, `bitsandbytes`, `torchvision`, `einops`, `addict` y `easydict`.
- Latencia y throughput: 7,86 s por página y 32,5 tokens/s en la configuración medida por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Memoria pico | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Unlimited-OCR-2 bnb NF4 (este) | 3,34 B | no disponible | NF4 4 bits | 3,17 GB | MIT | HuggingFace |
| baidu/Unlimited-OCR-2 (bf16) | 3,34 B | no disponible | bf16 | 7,39 GB | MIT | HuggingFace |
| Otros modelos OCR de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos alternativos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización NF4 introduce un incremento de latencia del 17 % y una reducción del throughput de 38,0 a 32,5 tokens/s, lo que puede ser relevante en despliegues de alto volumen.
- El conjunto de validación del autor es muy pequeño (17 páginas), por lo que las métricas de CER y WER deben tomarse como orientativas y no como garantía de calidad en dominios diversos.
- Requiere GPU NVIDIA con CUDA; no hay soporte para CPU ni Apple Silicon con bitsandbytes 4-bit.
- Dependencia estricta de versiones: `torch==2.13.0` y `transformers==4.52.1`; versiones más recientes de torch rompen los kernels de atención del modelo.
- Es necesario cargar con `torch_dtype=torch.bfloat16`; los fragmentos automáticos de "Use this model" de HuggingFace no lo incluyen y fallan con un error de tipos.
- No se dispone de información sobre sesgos, riesgo de alucinación, cobertura de idiomas ni longitud de contexto del modelo base.
- Es una cuantización independiente no afiliada ni respaldada por Baidu; la licencia MIT del modelo base se mantiene, pero la responsabilidad del soporte recae en el autor de la cuantización.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que limita la evidencia de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aungthuhein-dev/Unlimited-OCR-2-bnb-nf4
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR-2
- Repositorio de bitsandbytes: https://github.com/bitsandbytes-foundation/bitsandbytes
