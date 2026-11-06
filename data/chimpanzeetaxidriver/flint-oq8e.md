# chimpanzeetaxidriver/flint-oQ8e

## Resumen

flint-oQ8e es una versión cuantizada en 8 bits del modelo RecursiveSI/flint, publicada por el usuario chimpanzeetaxidriver en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un checkpoint cuantizado mediante la herramienta oQ (oMLX v0.7.3.dev1), que aplica cuantización de precisión mixta sobre los pesos originales en safetensors. El resultado es un modelo de generación de texto conversacional de aproximadamente 39,8 mil millones de parámetros, con un tamaño de checkpoint de 42,3 GB.

La relevancia de esta ficha radica en la técnica de cuantización empleada: en lugar de aplicar un esquema uniforme a todo el modelo, oQ distribuye los pesos en distintos formatos (afín de 8 bits con grupos de 64 y de 128, y BF16 para una fracción mínima), logrando una media efectiva de 8,500 bits por peso. Esto permite reducir el consumo de memoria manteniendo una fidelidad cercana al modelo original, algo especialmente útil para despliegues en hardware Apple Silicon mediante la librería MLX.

El modelo base, RecursiveSI/flint, es un modelo de texto-generation conversacional cuya arquitectura, datos de entrenamiento y capacidades específicas no están documentadas en la información disponible. Por tanto, esta ficha se centra en los aspectos verificables de la cuantización y el despliegue, señalando expresamente los datos que no se han publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base RecursiveSI/flint sin documentación pública) |
| Parametros totales | 39.785.299.488 (39,785 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | cuantización de precisión mixta: afín 8 bits grupo 128, afín 8 bits grupo 64, BF16 (media efectiva 8,500 bits/peso) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

La arquitectura del modelo base RecursiveSI/flint no está documentada en la información disponible: no se especifica si es un transformer denso, una mezcla de expertos (MoE) ni otros detalles estructurales. Lo que sí consta con precisión es el esquema de cuantización aplicado por oQ: el 98,042 % de los pesos (39,006 B parámetros) se almacena en formato afín de 8 bits con grupos de 64 (8,50 bits efectivos por peso), el 1,896 % (0,754 B) en afín de 8 bits con grupos de 128 (8,25 bits efectivos) y el 0,063 % (0,025 B) se conserva en BF16 sin cuantizar (16 bits). El checkpoint completo ocupa 39,369 GiB (42,272 GB), con una media efectiva de 8,500 bits por peso.

Sobre el entrenamiento del modelo base —número de tokens, composición del dataset, uso de RLHF o DPO— no hay información publicada en la model card ni en los metadatos disponibles. Tampoco se describen innovaciones técnicas propias del modelo base, más allá de que esta versión cuantizada se destina a su ejecución con la librería MLX en entornos Apple Silicon.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation con etiqueta conversational, orientado a diálogo.
- Cuantización de precisión mixta: mantiene la mayoría de pesos a 8,50 bits efectivos, con una fracción mínima en BF16, lo que reduce la pérdida de calidad frente a cuantizaciones uniformes más agresivas.
- Compatibilidad con MLX: diseñado para inferencia eficiente en Apple Silicon (Apple M1/M2/M3/M4) mediante el framework MLX.
- Otras capacidades (razonamiento, código, matemáticas, visión, tool calling, agentes, modo thinking): no disponibles; no están documentadas en la información proporcionada.

## Casos de uso

- Chatbots y asistentes conversacionales locales: al ser un modelo de text-generation conversacional, puede servir como motor de diálogo en aplicaciones que requieran ejecución on-device en Mac, sin depender de APIs externas.
- Prototipado de LLM en Apple Silicon: la cuantización a ~8,5 bits reduce el checkpoint a unos 42 GB, lo que lo hace viable en estaciones Mac con memoria unificada suficiente (48 GB o más), útil para desarrolladores que evalúan modelos grandes sin GPUs NVIDIA.
- Pruebas de calidad de cuantización: al emplear cuantización de precisión mixta con media de 8,500 bits/peso, es un buen candidato para comparar la degradación de calidad frente al modelo base en FP16 y validar herramientas como oQ/oMLX.
- Integración en pipelines de generación de texto: puede conectarse a frameworks compatibles con MLX para tareas de resumen, redacción y reformulación de documentos en entornos locales.
- Experimentación con modelos de ~40B en entornos sin servidor de GPU: útil para investigadores que necesitan un modelo de gran tamaño ejecutándose en hardware de consumo de gama alta sin coste de nube.
- Despliegue en producción de bajo consumo energético: en Mac Studio o Mac Pro con memoria unificada, el consumo energético y el coste operativo pueden ser inferiores a los de una GPU dedicada para cargas de inferencia moderadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia: el checkpoint ocupa 42,272 GB (39,369 GiB); para inferencia cómoda se recomienda disponer de al menos 48 GB de memoria unificada (en Mac) o memoria de GPU equivalente, más margen para el KV cache y el contexto.
- GPUs recomendadas: en el ecosistema Apple, Mac Studio o Mac Pro con Apple M2 Ultra o M3 Ultra y 64 GB o más de memoria unificada. En GPUs NVIDIA convencionales (RTX 4090 con 24 GB, A100 con 40/80 GB en configuración estándar) el modelo no cabe en una sola GPU en este formato MLX; sería necesaria una A100/H100 de 80 GB o paralelismo de tensores.
- Consumer GPUs: no cabe en GPUs de consumo habituales (RTX 4090, RTX 3090 de 24 GB) dado el tamaño del checkpoint de 42 GB. Sí es viable en Macs de gama alta con memoria unificada de 48-64 GB o superior.
- Opciones de despliegue: MLX de forma nativa (el formato del checkpoint); no está documentado el soporte para vLLM, llama.cpp (GGUF), TGI u Ollama, que requerirían conversiones de formato adicionales.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| flint-oQ8e (este modelo) | 39,785 B | precisión mixta, 8,500 bits/peso medio | safetensors (MLX) | Apache 2.0 | no disponible |
| Qwen2.5-32B-Instruct (referencia de tamaño similar) | 32,5 B | FP16 / AWQ / GPTQ | safetensors, GGUF | Apache 2.0 | 128.000 tokens |
| Gemma 2 27B (referencia de tamaño similar) | 27,2 B | FP16 / cuantizaciones comunitarias | safetensors, GGUF | Licencia Gemma | 8.192 tokens |

Nota: la comparativa se ofrece a título orientativo con modelos de tamaño similar bien documentados; el modelo base RecursiveSI/flint no publica datos de rendimiento que permitan una comparación directa de calidad.

## Limitaciones y advertencias

- Falta de documentación del modelo base: no se conocen la arquitectura, los datos de entrenamiento ni las capacidades reales de RecursiveSI/flint, lo que dificulta evaluar su idoneidad para producción.
- Riesgo de alucinación: al tratarse de un modelo conversacional sin documentación de alineamiento (no consta RLHF ni DPO), el riesgo de generar contenido incorrecto es desconocido pero debe asumirse como alto hasta su validación.
- Sesgos: no disponibles; no se han publicado evaluaciones de sesgo ni tarjetas de seguridad.
- Idiomas: no se especifican los idiomas soportados; no hay garantía de rendimiento en castellano.
- Contexto: la longitud de ventana de contexto no está publicada, lo que limita la planificación de aplicaciones con documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base (RecursiveSI/flint) debe verificarse por separado, ya que esta ficha corresponde a la derivada cuantizada.
- Formato MLX: el checkpoint está pensado para el ecosistema Apple; su uso en servidores Linux con GPUs NVIDIA requiere conversión de formato no documentada.
- Proyecto de autor individual: con 376 descargas y un solo like, se trata de una contribución comunitaria sin respaldo institucional verificado; conviene validar calidad y seguridad antes de cualquier despliegue serio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chimpanzeetaxidriver/flint-oQ8e
- Modelo base: no disponible (no se proporciona URL directa; puede localizarse en https://huggingface.co/RecursiveSI/flint)
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Paper, blog o demo: no disponibles
