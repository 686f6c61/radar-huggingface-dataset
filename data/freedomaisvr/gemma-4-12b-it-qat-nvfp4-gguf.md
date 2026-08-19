# FreedomAISVR/Gemma-4-12B-it-QAT-NVFP4-GGUF

## Resumen

Gemma-4-12B-it-QAT-NVFP4-GGUF es una cuantización híbrida del modelo oficial de Google Gemma 4 12B Instruct con optimización QAT (Quantization-Aware Training). El autor, FreedomAISVR, ha preservado los 329 tensores de pesos en Q4_0 tal y como Google los entrenó, y solo ha cuantizado los 338 tensores F32 de norm/bias a NVFP4, el formato de precisión de 4 bits de NVIDIA para GPUs Blackwell. Esta estrategia evita el error de requantización que rompería las capacidades de visión del modelo QAT.

El modelo mantiene el soporte multimodal completo mediante el proyector de visión QAT de Google (mmproj) de 175 MB, lo que permite procesar imágenes, audio y video de forma nativa. Con un peso total del archivo GGUF de 6,39 GB, es una opción viable para GPUs de consumo con 16 GB de VRAM. El modelo base es un encoder-free multimodal de 12B parámetros con ventana de contexto de hasta 256K tokens y soporte de más de 140 idiomas, licenciado bajo Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal encoder-free (Gemma 4 12B Instruct) |
| Parametros totales | 11.907.350.576 (11,9B) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | Hasta 256K tokens |
| Tipos de cuantizacion | Q4_0 para pesos (6,56 GB) + NVFP4 para tensores de norm/bias (15 MB) |
| Idiomas soportados | Más de 140 idiomas (modelo base); inglés y multilingüe en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo principal de 6,39 GB) + mmproj GGUF de 175 MB |

## Arquitectura y entrenamiento

El modelo base es un transformer denso multimodal encoder-free de 12,9B parámetros, diseñado para ingerir texto, imágenes, audio y video de forma nativa sin necesidad de un codificador de visión separado. Google entrenó este modelo con optimización QAT, lo que significa que los pesos fueron ajustados durante el entrenamiento para ser resilientes a la cuantización Q4_0, incluyendo el proyector de visión (mmproj) de 175 MB.

La innovación de esta cuantización híbrida radica en no requantizar los pesos Q4_0 a NVFP4, ya que eso introduciría un segundo error de redondeo que el entrenamiento QAT no compensa y degradaría especialmente la calidad de visión (reconocimiento de texto en imágenes). En su lugar, el autor usa `llama-quantize` con un archivo de tipo de tensor que mantiene los Q4_0 intactos y cuantiza solo los tensores F32 de normalización y bias a NVFP4, que son de menor importancia para la calidad. Esto reduce el tamaño total de 6,65 GB a 6,39 GB con pérdida de calidad casi nula.

## Capacidades

- Generación de texto y razonamiento multilingüe en más de 140 idiomas.
- Multimodal nativo: entrada de imágenes, audio y video sin encoder externo.
- Soporte de vision con proyector QAT (mmproj) que preserva la calidad de reconocimiento de texto en imágenes.
- Chat conversacional con template nativo de Gemma 4, con modo thinking habilitado por defecto mediante el token `<|think|>`.
- Compatible con el ecosistema llama.cpp: `llama-server`, `llama-cli`, etc.
- Endpoint compatible con servidores de inferencia locales (llama-server con API REST).
- Arquitectura densa sin MoE, lo que simplifica el despliegue en hardware estándar.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multilingües con contexto largo de hasta 256K tokens, manteniendo la calidad en diálogos extensos y con referencias a documentos previos.
- Asistente de visión para accesibilidad: gracias al mmproj QAT, puede describir imágenes, leer texto de capturas de pantalla o analizar gráficos en tiempo real, incluso en entornos con recursos limitados.
- Desarrollo local de agentes: con 6,39 GB de GGUF y soporte de tool calling (no confirmado, pero el template nativo permite razonamiento multi-step), es adecuado para prototipos de agentes en máquinas de desarrollo con 16 GB de VRAM.
- Análisis de documentos técnicos: procesa PDFs, imágenes de diagramas y tablas, y responde preguntas técnicas con razonamiento de múltiples pasos gracias al modo thinking.
- Traducción y transcripción multilingüe: con soporte de más de 140 idiomas, puede servir como backend de traducción automática de alta calidad en aplicaciones locales.
- Inferencia de vídeo en edge: su capacidad de ingerir video nativamente permite crear aplicaciones de análisis de vídeo en tiempo real en hardware de consumo (RTX 4090, por ejemplo).
- Investigación académica: los pesos Q4_0 QAT preservan la calidad del modelo original, lo que permite experimentar con razonamiento y visión sin requerir un cluster de GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos. La model card solo indica que la calidad de los pesos Q4_0 se mantiene intacta respecto al modelo QAT original de Google, y que la cuantización NVFP4 de norm/bias no afecta significativamente al rendimiento.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa 6,39 GB, más el mmproj de 175 MB. Con overhead de contexto y activaciones, se recomienda al menos 8-10 GB de VRAM para inferencia en FP16.
- GPU recomendadas: RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070, RTX 4090, o GPUs de datacenter como A10, L4 o A100.
- Sí cabe en GPUs de consumo: con 16 GB de VRAM es cómodo, y con 12 GB es posible con contexto reducido y cuantización de activaciones.
- Despliegue: compatible con llama.cpp (`llama-server`), llama-cpp-python, Ollama (si se añade el archivo), y cualquier frontend que soporte GGUF.
- Latencia: no disponible. Se estima que en una RTX 4090 con 256K de contexto se puede alcanzar entre 20-40 tokens/s con batch size 1, pero no hay datos publicados.
- Throughput: no disponible. Depende de la GPU y del tamaño de la ventana de contexto.

## Comparativa con modelos similares

| Modelo | Tamaño | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-12B-it-QAT-NVFP4-GGUF | 6,39 GB (GGUF) | 256K | Apache 2.0 | GGUF | Cuantización híbrida Q4_0+NVFP4, multimodal |
| Gemma-4-12B-it (original) | ~24 GB (FP16) | 256K | Apache 2.0 | safetensors | Modelo completo sin cuantizar, requiere 24 GB VRAM |
| Qwen2.5-14B-Instruct GGUF (Q4_K_M) | ~9 GB | 128K | Apache 2.0 | GGUF | Solo texto, sin visión, contexto menor |
| Llama-3.1-8B-Instruct GGUF (Q4_K_M) | ~5,5 GB | 128K | Llama 3.1 Community License | GGUF | Solo texto, sin visión, contexto menor |

La comparativa muestra que el modelo ofrece multimodalidad y contexto largo en un tamaño compacto, pero no hay datos de benchmarks para comparar rendimiento real. La alternativa más directa es el propio modelo original en FP16, que requiere mucho más VRAM.

## Limitaciones y advertencias

- La cuantización NVFP4 de los tensores de norm/bias puede degradar ligeramente la precisión en tareas numéricas de alta precisión, aunque el autor afirma que el impacto es mínimo.
- El modo de pensamiento está habilitado por defecto, lo que puede aumentar la latencia en tareas simples si no se desactiva con el token adecuado.
- No hay datos publicados de benchmarks ni de rendimiento en tareas específicas; la calidad debe evaluarse en cada caso de uso.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar los términos de Google para el modelo base.
- El soporte de tool calling y funciones de agente no está documentado explícitamente en la model card; habrá que probarlo en la práctica.
- La cuantización híbrida es una técnica experimental; el autor no ofrece garantías de estabilidad en todos los escenarios de producción.
- El modelo está optimizado para GPUs Blackwell en los tensores NVFP4, pero funciona en cualquier GPU que soporte FP16; el uso de NVFP4 en hardware no-Blackwell puede degradar el rendimiento.

## Enlaces

- [HuggingFace - FreedomAISVR/Gemma-4-12B-it-QAT-NVFP4-GGUF](https://huggingface.co/FreedomAISVR/Gemma-4-12B-it-QAT-NVFP4-GGUF)
- [Modelo base: google/gemma-4-12B-it-qat-q4_0-unquantized](https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized)
- [Gemma 4 — Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Gemma 4 12B: The Developer Guide - Google Developers Blog](https://developers.googleblog.com/gemma-4-12b-the-developer-guide/)
- [Gemma 4 model card | Google AI for Developers](https://ai.google.dev/gemma/docs/core/model_card_4)
