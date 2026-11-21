# MultiverseComputingCAI/Comet_60B_A12B_BF16

## Resumen

Comet 60B es un modelo multimodal de tipo imagen-texto-a-texto desarrollado por Multiverse Computing mediante su técnica de compresión CompactifAI, aplicada sobre el modelo NVIDIA Nemotron 3.5 Super VL 120B. El resultado es un checkpoint que reduce a la mitad el número de parámetros totales (de 124,5B a 61,1B) manteniendo prácticamente intactos los parámetros activos por token (12,3B frente a 12,8B), gracias a que la arquitectura de mezcla de expertos (MoE) conserva la misma estructura de enrutamiento pero con la mitad de expertos por capa (256 en lugar de 512).

La arquitectura es un híbrido Mamba2-Transformer con MoE latente: 88 capas en total (40 Mamba2, 40 MoE y 8 de atención), tamaño oculto de 4096 y expertos que operan en un espacio latente de 1024 dimensiones. Incorpora además un codificador visual RADIO ViT-H/16 de 32 capas y una capa de predicción multi-token (MTP) que habilita decodificación especulativa. Acepta texto, imagen y vídeo como entrada, y genera texto.

Su relevancia actual reside en que ofrece capacidades de razonamiento, uso de herramientas y comprensión multimodal con un coste de servicio notablemente inferior al modelo base: el checkpoint BF16 ocupa 122,3 GB (frente a unos 249 GB) y puede ejecutarse en 2× H200 en lugar de 4, con un aumento de throughput del 20-23% en las mismas GPUs. La compresión se compensó con un proceso de destilación sobre datos de texto, imagen y vídeo del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba2-Transformer con Mixture-of-Experts latente (88 capas: 40 Mamba2, 40 MoE, 8 atención) |
| Parametros totales | 61.126.735.112 (61,1B) |
| Parametros activos | 12,3B por token (22 de 256 expertos enrutados por capa MoE + 1 experto compartido) |
| Longitud de contexto | 262.144 tokens evaluados; la configuración permite hasta 1.048.576 posiciones (no evaluadas) |
| Tipos de cuantizacion | BF16 (122,3 GB), FP8 (66,3 GB), NVFP4 (40,5 GB, mixto NVFP4/FP8/BF16) |
| Idiomas soportados | Inglés (en) |
| Licencia | OpenMDW License Agreement 1.1 (pesos); código del modelo bajo Apache 2.0 |
| Formato de pesos | safetensors (transformers, custom_code) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del checkpoint base Nemotron 3.5 Super: un transformer híbrido en el que la mayoría de las capas son Mamba2 (40) o MoE (40), con solo 8 capas de atención completa. El tamaño oculto es de 4096 y los expertos trabajan en un espacio latente de 1024 dimensiones, lo que reduce el coste de cómputo y memoria del enrutamiento. La visión se procesa con un codificador RADIO ViT-H/16 de 32 capas más un proyector, y se mantiene una capa MTP que permite decodificación especulativa multi-token. La estructura de capas, el tokenizador y la plantilla de chat son idénticos a los del modelo original.

El proceso de compresión CompactifAI reduce los parámetros totales de 124,5B a 61,1B (de 512 a 256 expertos enrutados por capa MoE), manteniendo los parámetros activos en torno a 12B. Tras la compresión, el modelo se "curó" mediante destilación del Nemotron 3.5 Super original sobre datos de texto, imagen y vídeo. No se especifican en la información disponible el número exacto de tokens de entrenamiento ni la composición detallada del dataset de destilación. El modelo base incorpora entrenamiento con refuerzo y capacidades de razonamiento configurable, que se preservan en Comet 60B.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable (thinking/reasoning control).
- Comprensión de imágenes y vídeo como entrada, con salida exclusivamente textual.
- Razonamiento matemático y resolución de problemas de nivel avanzado (evaluado en GPQA Diamond, entre otros).
- Generación y edición de código, incluyendo tareas de ingeniería de software (SWE-bench Verified, SWE-bench Pro).
- Tool calling / function calling con parsers compatibles con vLLM, los mismos que el modelo base.
- Comportamiento agéntico multi-paso: evaluado en τ²-Bench (airline, retail, telecom) y AutomationBench-AA.
- Comprensión de documentos e imágenes, con benchmarks específicos de document understanding.
- Decodificación especulativa mediante la capa MTP, que acelera la inferencia.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto muy largo (262.144 tokens evaluados) y combinar texto e imágenes enviadas por el usuario, lo que permite resolver incidencias con capturas de pantalla o documentos adjuntos en una sola sesión.
- Agentes de soporte técnico con tool calling: al soportar function calling y razonamiento multi-paso, puede integrarse en flujos agénticos que consulten APIs internas, bases de conocimiento o sistemas de ticketing, con resultados superiores al modelo base en τ²-Bench (airline, retail, telecom).
- Automatización de ingeniería de software: con soporte para SWE-bench Verified y SWE-bench Pro, puede emplearse en pipelines de CI/CD para revisión de código, generación de parches y resolución de issues, integrándose mediante los parsers de vLLM.
- Análisis de documentos e imágenes en producción: su codificador RADIO ViT-H/16 permite extraer información de facturas, formularios o capturas, y el contexto largo facilita procesar documentos extensos en una única pasada.
- Procesamiento de vídeo para moderación o catalogación: acepta vídeo como entrada y genera descripciones o etiquetas textuales, adecuado para pipelines de moderación de contenido o indexación de archivos multimedia.
- Asistentes de investigación con razonamiento controlable: el modo de pensamiento configurable permite ajustar el coste computacional por consulta, útil en entornos donde se alternan preguntas simples y análisis complejos (GPQA Diamond, AA-LCR).
- Despliegue en infraestructura limitada: la versión NVFP4 (40,5 GB) cabe en una sola GPU Blackwell y la FP8 (66,3 GB) en una sola H200 con contexto completo, lo que habilita servir el modelo en entornos con menos GPUs que el original.

## Benchmarks y rendimiento

La model card indica que Comet 60B supera al modelo base en τ²-Bench (airline, retail y telecom), AutomationBench-AA y SWE-bench Pro, y que se mantiene a menos de 3 puntos en 28 de 35 métricas evaluadas, incluyendo GPQA Diamond, AA-LCR, SWE-bench Verified y la mayoría de benchmarks de imagen, documento y vídeo. No se proporcionan en la información disponible las cifras numéricas concretas de cada benchmark, por lo que no se presenta tabla comparativa con valores.

| Aspecto | Comet 60B (BF16) | Nemotron 3.5 Super VL 120B |
|---|---|---|
| Throughput en 4× H200 | 20-23% más tokens de salida/s | Referencia |
| Throughput FP8 en 2× H200 | ~1,8× por GPU | Referencia |
| τ²-Bench (airline, retail, telecom) | Superior | Inferior |
| AutomationBench-AA | Superior | Inferior |
| SWE-bench Pro | Superior | Inferior |
| GPQA Diamond, AA-LCR, SWE-bench Verified | Dentro de 3 puntos | Referencia |

## Requisitos de hardware

- BF16: 122,3 GB de checkpoint; mínimo 2× H200 (141 GB) con contexto completo de 256K. Los pesos ocupan 58 GiB por GPU y dejan espacio de caché KV para unas 43 peticiones concurrentes de 256K tokens (medido). Los benchmarks y el comando de servicio de referencia usan 4× H200.
- FP8: 66,3 GB; una sola H200 con contexto completo de 256K (61 GiB de pesos y caché para unas 20 peticiones concurrentes de 256K, medido). Requiere NVIDIA Hopper o Blackwell.
- NVFP4: 40,5 GB; una sola GPU NVIDIA Blackwell.
- No cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB) en ninguno de los formatos publicados.
- Despliegue mediante vLLM con los mismos parsers de razonamiento y herramientas que el modelo base, con decodificación especulativa MTP.
- Throughput medido: 20-23% más tokens de salida por segundo que el modelo base en 4× H200 sobre trazas de chat y agenticas de NVIDIA; la versión FP8 en 2× H200 entrega aproximadamente 1,8× el throughput por GPU del original.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Comet 60B (BF16) | 61,1B | 12,3B | 262.144 evaluados (hasta 1.048.576 configurados) | OpenMDW 1.1 | Hugging Face (BF16, FP8, NVFP4) |
| NVIDIA Nemotron 3.5 Super VL 120B | 124,5B | 12,8B | 262.144 evaluados | No disponible en la información | Hugging Face (modelo base) |
| Alternativas de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa más relevante es con el modelo base del que deriva: Comet 60B reduce a la mitad los parámetros totales, mantiene los activos y mejora el throughput y varios benchmarks agénticos, con la misma pila de servicio.

## Limitaciones y advertencias

- Idioma: la model card solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Contexto: aunque la configuración permite hasta 1.048.576 posiciones, solo se evaluaron 262.144 tokens; contextos superiores pueden degradar la calidad.
- Modalidad de salida: solo genera texto; no produce imágenes, audio ni vídeo.
- Sin soporte de audio como entrada.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de razonamiento abierto y comprensión de documentos.
- La compresión y la destilación pueden introducir degradaciones no capturadas por los benchmarks publicados; la model card reporta diferencias de hasta 3 puntos en 7 de las 35 métricas evaluadas.
- Licencia OpenMDW 1.1 para los pesos: es necesario revisar sus términos para uso comercial, aunque la model card indica que el modelo está listo para uso comercial bajo dicha licencia. El código del modelo es Apache 2.0.
- Requiere hardware de gama alta (H200 o Blackwell); no es desplegable en GPUs de consumo.
- Los sesgos específicos no se detallan en la información disponible; se remite a la sección de seguridad y consideraciones éticas de la model card original.

## Enlaces

- Modelo BF16 en Hugging Face: https://huggingface.co/MultiverseComputingCAI/Comet_60B_A12B_BF16
- Modelo FP8 en Hugging Face: https://huggingface.co/MultiverseComputingCAI/Comet_60B_A12B_FP8
- Modelo NVFP4 en Hugging Face: https://huggingface.co/MultiverseComputingCAI/Comet_60B_A12B_NVFP4
- Modelo base NVIDIA Nemotron 3.5 Super VL 120B: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
