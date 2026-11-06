# MultiverseComputingCAI/Comet_60B_A12B_BF16

## Resumen

Comet 60B es un modelo multimodal de tipo image-text-to-text desarrollado por Multiverse Computing a partir de NVIDIA Nemotron 3.5 Super VL 120B. Se trata de una versión comprimida mediante la técnica propietaria CompactifAI, que reduce el número de parámetros totales de 124,5B a 61,1B manteniendo aproximadamente 12,3B parámetros activos por token. La arquitectura subyacente es un híbrido Mamba2-Transformer con Mixture-of-Experts latente, con 88 capas (40 Mamba2, 40 MoE y 8 de atención), tamaño oculto de 4096 y expertos que operan en un espacio latente de 1024 dimensiones.

El modelo acepta texto, imagen y vídeo como entrada, y produce texto como salida. Conserva la estructura de capas, el tokenizador y la plantilla de chat del modelo base, así como la capa de predicción multi-token (MTP) que habilita decodificación especulativa. Incorpora además control configurable de razonamiento (thinking mode) y soporte de tool calling, lo que lo sitúa en la categoría de modelos preparados para flujos agénticos.

Su relevancia actual radica en que reduce a la mitad el peso del checkpoint BF16 (122,3 GB frente a unos 249 GB del original), lo que permite servirlo en 2× H200 en lugar de 4, y ofrece variantes FP8 (66,3 GB) y NVFP4 (40,5 GB) para hardware Hopper y Blackwell. Según el autor, mantiene un rendimiento cercano al modelo base en la mayoría de benchmarks y mejora en varias pruebas agénticas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba2-Transformer con MoE latente (88 capas: 40 Mamba2, 40 MoE, 8 atención) |
| Parametros totales | 61.126.735.112 (61,1B) |
| Parametros activos | 12,3B por token (22 de 256 expertos enrutados por capa MoE + 1 experto compartido) |
| Longitud de contexto | 262.144 tokens evaluados; la configuración admite hasta 1.048.576 posiciones |
| Tipos de cuantizacion | BF16 (122,3 GB), FP8 (66,3 GB), NVFP4 (40,5 GB) |
| Idiomas soportados | Inglés (en) |
| Licencia | NVIDIA Nemotron Open Model License (openmdw-1.1); código del repo bajo Apache 2.0 |
| Formato de pesos | safetensors (transformers, custom_code) |

## Arquitectura y entrenamiento

Comet 60B hereda la arquitectura del checkpoint Nemotron 3.5 Super VL 120B: un modelo híbrido que combina capas Mamba2 (state space model) con capas de atención y capas de Mixture-of-Experts. El modelo base cuenta con 124,5B parámetros totales (120,7B del modelo de lenguaje, 2,9B de la capa MTP, 0,8B del codificador visual y proyector) y 12,8B activos por token, con 22 de 512 expertos enrutados por capa más un experto compartido. La compresión CompactifAI reduce el total a 61,1B (58,9B de lenguaje, 1,4B MTP, 0,8B visión) y los expertos enrutados por capa a 256, manteniendo 22 activos más el compartido, lo que da 12,3B activos por token.

El codificador visual es un RADIO ViT-H/16 de 32 capas, y se conserva una capa MTP para decodificación especulativa. Tras la compresión, el modelo fue "curado" mediante destilación del Nemotron 3.5 Super original sobre datos de texto, imagen y vídeo. La estructura de capas, el tokenizador y la plantilla de chat no se modifican respecto al base, lo que facilita la reutilización del stack de serving (parsers de razonamiento y de tool calling de vLLM).

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable (thinking / reasoning control).
- Entrada multimodal: texto, imagen y vídeo; salida exclusivamente de texto (sin audio).
- Tool calling y function calling, con parsers compatibles con vLLM.
- Flujos agénticos multi-paso, con soporte para razonamiento encadenado y ejecución de herramientas.
- Decodificación especulativa mediante capa MTP, que acelera la generación.
- Comprensión de documentos, imágenes y vídeo para tareas de descripción, extracción y respuesta a preguntas visuales.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Atención al cliente multimodal: el modelo puede procesar capturas de pantalla, fotos de producto o documentos adjuntos junto con texto en conversaciones multi-turno, aprovechando la ventana de 262K tokens evaluados para mantener contexto extenso de la sesión.
- Automatización de agentes con herramientas: gracias al tool calling y al modo de razonamiento configurable, puede integrarse en pipelines que consulten APIs, bases de datos o sistemas internos y encadenen varios pasos antes de responder.
- Análisis de documentos extensos: con contexto de hasta 262K tokens evaluados, es adecuado para resumir contratos, informes o expedientes completos e identificar cláusulas o datos concretos.
- Procesamiento de vídeo para moderación o catalogación: al aceptar vídeo como entrada, puede generar descripciones, etiquetas o resúmenes de contenido audiovisual en pipelines de ingestión.
- Asistencia en ingeniería de software: el autor reporta resultados en SWE-bench Pro y SWE-bench Verified, por lo que encaja en tareas de revisión de código, generación de parches y navegación de repositorios dentro de entornos agénticos.
- Despliegue en infraestructura limitada: la variante NVFP4 (40,5 GB) permite servir el modelo en hardware Blackwell con menor huella de memoria, y la FP8 (66,3 GB) en una sola H200, lo que facilita entornos de producción con presupuesto de GPU ajustado.
- Evaluación de razonamiento visual y matemático: útil para investigación en benchmarks de GPQA Diamond, AA-LCR y tareas de razonamiento sobre imagen y documento.

## Benchmarks y rendimiento

El autor reporta comparaciones cualitativas y cuantitativas frente al modelo base Nemotron 3.5 Super, pero no se han publicado en la información disponible los valores numéricos concretos de MMLU, HumanEval, GSM8K ni del resto de benchmarks. Los datos disponibles son:

| Benchmark | Resultado reportado |
|---|---|
| τ²-Bench (airline, retail, telecom) | Por delante del modelo base |
| AutomationBench-AA | Por delante del modelo base |
| SWE-bench Pro | Por delante del modelo base |
| GPQA Diamond | Dentro de 3 puntos del modelo base |
| AA-LCR | Dentro de 3 puntos del modelo base |
| SWE-bench Verified | Dentro de 3 puntos del modelo base |
| Benchmarks de imagen, documento y vídeo | Dentro de 3 puntos en la mayoría |

En cuanto a serving, el autor indica que en el mismo hardware de 4× H200 Comet sirve entre un 20% y un 23% más de tokens de salida por segundo que Nemotron 3.5 Super en trazas de chat y agénticas de NVIDIA, y que la versión FP8 en 2× H200 entrega aproximadamente 1,8× el throughput por GPU del original.

## Requisitos de hardware

- VRAM estimada: BF16 requiere 122,3 GB de pesos; FP8, 66,3 GB; NVFP4, 40,5 GB.
- Configuración mínima BF16: 2× H200 (141 GB) con contexto completo de 256K, con 58 GiB de pesos por GPU.
- FP8: pensado para NVIDIA Hopper y Blackwell; según el autor, cabe en una sola H200.
- NVFP4: exclusivo de NVIDIA Blackwell.
- GPU recomendadas: H200 para BF16 y FP8; Blackwell para NVFP4. No se indica compatibilidad con GPUs de consumo.
- Opciones de despliegue: vLLM con los mismos parsers de razonamiento y tool calling del modelo base, con decodificación especulativa MTP.
- Latencia y throughput: el autor reporta un 20-23% más de tokens de salida por segundo en 4× H200 y aproximadamente 1,8× throughput por GPU con FP8 en 2× H200, sin cifras absolutas de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Comet 60B (BF16) | 61,1B | 12,3B | 262K evaluados (hasta 1M en config) | NVIDIA Nemotron Open Model License | Hugging Face, formatos BF16/FP8/NVFP4 |
| Nemotron 3.5 Super VL 120B (base) | 124,5B | 12,8B | 262K evaluados | NVIDIA Nemotron Open Model License | Hugging Face |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el modelo base, del que Comet 60B es una versión comprimida: reduce a la mitad los parámetros totales, mantiene un número de parámetros activos muy similar (12,3B frente a 12,8B) y, según el autor, mejora en benchmarks agénticos y se mantiene dentro de 3 puntos en la mayoría del resto.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Contexto: aunque la configuración admite hasta 1.048.576 posiciones, solo se ha evaluado con 262.144 tokens; no hay garantías de calidad más allá de esa ventana.
- Modalidad de salida: solo genera texto; no produce imagen, vídeo ni audio.
- Licencia: los pesos se rigen por la NVIDIA Nemotron Open Model License, no por una licencia permisiva genérica; es necesario revisar sus términos antes de uso comercial o redistribución.
- Alucinación: no se han publicado en la información disponible métricas específicas de tasa de alucinación ni evaluaciones de sesgo.
- Compresión: al ser un modelo destilado y comprimido, puede presentar degradaciones en tareas poco representadas en los datos de curación, aunque el autor reporta una caída inferior a 3 puntos en la mayoría de benchmarks.
- Hardware: las variantes FP8 y NVFP4 dependen de arquitecturas Hopper y Blackwell respectivamente; el BF16 exige 2× H200 para contexto completo, lo que limita su uso en entornos con GPUs de menor memoria.
- Producción: no se han publicado cifras absolutas de latencia ni evaluaciones independientes de robustez o seguridad más allá de lo indicado en la model card.

## Enlaces

- Modelo en Hugging Face (BF16): https://huggingface.co/MultiverseComputingCAI/Comet_60B_A12B_BF16
- Variante FP8: https://huggingface.co/MultiverseComputingCAI/Comet-1.0-60B-FP8
- Variante NVFP4: https://huggingface.co/MultiverseComputingCAI/Comet-1.0-60B-NVFP4
- Modelo base Nemotron 3.5 Super VL 120B: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Página de NVIDIA en Hugging Face: https://huggingface.co/nvidia
