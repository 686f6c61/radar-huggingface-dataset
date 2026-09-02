# Snapkitty/snapkitty-transformer

## Resumen

SnapKitty Transformer 8B es un modelo de lenguaje autoregresivo de 8.000 millones de parámetros desarrollado por Snapkitty, una entidad corporativa que se describe a sí misma como "sovereign" (soberana). El modelo está diseñado para ser un producto empresarial de uso interno, con una arquitectura transformer con mezcla de expertos (MoE), atención con ventana deslizante y soporte de contexto extremadamente largo (204.800 tokens). Incluye kernels CUDA personalizados para FlashAttention optimizados para GPUs NVIDIA Ampere y Hopper, así como implementaciones de referencia en Triton.

El modelo se presenta como una solución para procesamiento de texto y código a gran escala, con énfasis en rendimiento de inferencia y eficiencia de memoria mediante cuantización MXFP4. Su relevancia actual radica en su arquitectura híbrida que combina MoE, atención con sinks y YaRN RoPE para manejar secuencias muy largas, aunque su disponibilidad pública es limitada debido a su licencia dual (BSL-1.1 y AGPL-3.0) y a que los pesos no están publicados abiertamente en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con MoE (8 expertos, top-4), GQA, YaRN RoPE, FlashAttention, sliding window |
| Parametros totales | 8B |
| Parametros activos | no disponible (top-4 de 8 expertos por token) |
| Longitud de contexto | 204.800 tokens (con YaRN 32x) |
| Tipos de cuantizacion | FP16, BF16, MXFP4 |
| Idiomas soportados | no disponible |
| Licencia | Business Source License 1.1 (BSL-1.1) y GNU AGPL v3.0 (dual) |
| Formato de pesos | PyTorch .pt (no safetensors) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura transformer con 128 capas, dimensión oculta de 8192, 128 cabezas de atención y 16 cabezas clave-valor (GQA). Incorpora mezcla de expertos (MoE) con 8 expertos y enrutamiento top-4, lo que permite activar solo una fracción de los parámetros por token. La atención emplea una ventana deslizante de 65.536 tokens y 2.048 attention sinks, junto con YaRN RoPE con factor 32x para extender el contexto hasta 204.800 tokens. Incluye kernels CUDA personalizados para FlashAttention (forward y backward) optimizados para sm_80+ (Ampere) y Hopper, con soporte de MXFP4 para cuantización.

El entrenamiento se realizó con 2 billones de tokens procedentes de datasets "soberanos" curados: 500B de código (Python, Rust, CUDA, Solidity), 300B de textos académicos (arXiv, libros de texto) y 1,2B de web filtrada y deduplicada. Se usó AdamW con learning rate 3e-4, batch size 2048, 500.000 pasos, y precisión BF16. No se menciona el uso de RLHF o DPO.

## Capacidades

- Generación de texto y código: el modelo está entrenado con una proporción significativa de código (25% del dataset) y es capaz de generar código en lenguajes como Python, Rust, CUDA y Solidity.
- Procesamiento de contexto largo: gracias a su ventana de 204.800 tokens, puede manejar documentos extensos, libros completos o repositorios de código grandes.
- Razonamiento multi-paso: al ser un modelo de 8B con MoE, se espera un razonamiento básico, aunque no hay benchmarks que lo confirmen.
- Soporte de cuantización MXFP4: permite inferencia con menor uso de memoria, aunque requiere kernels específicos.
- No se documentan capacidades explícitas de tool calling, agentes o multimodalidad.

## Casos de uso

- Generación de código en entornos empresariales: el modelo puede integrarse en pipelines de CI/CD para autocompletar o generar código en lenguajes de nicho como CUDA o Solidity, gracias a su entrenamiento específico en estos lenguajes.
- Análisis de documentos legales o financieros extensos: con su contexto de 204.800 tokens, puede resumir o extraer información de contratos, informes anuales o expedientes completos sin truncamiento.
- Asistente de programación para kernels CUDA: los kernels FlashAttention personalizados sugieren un enfoque en optimización de bajo nivel, por lo que el modelo podría ayudar a escribir o depurar kernels GPU.
- Procesamiento de código fuente en repositorios grandes: puede analizar múltiples archivos a la vez para refactorización, detección de bugs o documentación automática.
- Búsqueda semántica en bases de conocimiento corporativas: al manejar secuencias largas, puede indexar y consultar documentos internos con contexto completo.
- Generación de informes técnicos o científicos: su entrenamiento con arXiv y libros de texto lo hace adecuado para redactar resúmenes de papers o documentación técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica de rendimiento mencionada es la velocidad de inferencia: 45 tokens/segundo en un A100 80GB con precisión FP16. No hay datos comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada: para FP16, un modelo de 8B ocupa aproximadamente 16 GB solo de pesos, pero con MoE y contexto largo puede requerir más; se recomienda una GPU con al menos 24 GB para inferencia con cuantización MXFP4 o BF16.
- GPU recomendadas: NVIDIA A100 80GB (probada), H100 para FlashAttention-3, o GPUs consumer como RTX 4090 (24 GB) con cuantización.
- En consumer GPUs: es posible ejecutar con cuantización MXFP4 o FP16 en RTX 3090/4090, pero el contexto máximo requerirá mucha memoria.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp u Ollama; el modelo requiere compilar los kernels CUDA personalizados y usar PyTorch directamente.
- Latencia y throughput: 45 tokens/seg en A100 80GB FP16 (dato proporcionado por el autor).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| SnapKitty Transformer 8B | 8B | 204.800 | MoE (8 expertos, top-4) | BSL-1.1 / AGPL-3.0 |
| Mixtral 8x7B | 46.7B (12.9B activos) | 32.768 | MoE (8 expertos, top-2) | Apache 2.0 |
| Qwen2.5-7B | 7.6B | 32.768 | Denso | Apache 2.0 |

No hay datos de rendimiento comparables. SnapKitty destaca por su contexto extremadamente largo y su enfoque en kernels CUDA propietarios, pero su licencia restrictiva y la falta de pesos públicos limitan su adopción frente a alternativas abiertas.

## Limitaciones y advertencias

- Licencia restrictiva: no es open source. El uso comercial requiere una "Sovereign Node Key" según la model card. La BSL-1.1 permite uso no comercial, pero la AGPL-3.0 impone copyleft si se modifica.
- Pesos no disponibles públicamente: el repositorio de Hugging Face no muestra archivos de pesos; solo se puede acceder a través de canales privados.
- Sin benchmarks de calidad: no hay resultados de MMLU, HumanEval u otros tests, por lo que se desconoce su rendimiento real frente a modelos similares.
- Riesgo de alucinación y sesgos: al no haber evaluación independiente, no se puede cuantificar su fiabilidad ni sus sesgos.
- Dependencia de kernels propietarios: la inferencia requiere compilar extensiones CUDA personalizadas, lo que limita la portabilidad a otras plataformas.
- Arquitectura inusual: 128 capas con dim 8192 y 8B parámetros totales es inconsistente; probablemente el número de parámetros declarado no corresponde a la arquitectura descrita, lo que genera incertidumbre sobre sus requisitos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Snapkitty/snapkitty-transformer
- Repositorio GitHub: https://github.com/SNAPKITTYWEST/SNAPKITTYWEST
- Sitio web de SnapKitty Collective: https://huggingface.co/Snapkitty
- Descargas del ecosistema: https://collectivekitty.com/downloads
