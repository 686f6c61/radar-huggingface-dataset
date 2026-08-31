# julianmb/Qwen3.8-Flash-Next-IQ4_XS-GGUF

## Resumen

El repositorio `julianmb/Qwen3.8-Flash-Next-IQ4_XS-GGUF` contiene cuantizaciones GGUF del modelo Qwen3.8-Flash-Next, desarrolladas por el usuario julianmb con un pipeline auditado de verificación de procedencia. El modelo base, publicado por Alibaba Qwen, es un transformador híbrido de 176.943.899.520 parámetros totales (125B principales + 51B de embeddings n-gram) con 6B parámetros activos por token, lo que lo convierte en un modelo de tipo MoE eficiente para inferencia local en hardware de gama alta.

La relevancia de esta cuantización radica en su optimización específica para la plataforma AMD Strix Halo (APU Ryzen AI Max+ 395 con 128 GB de memoria unificada), ofreciendo dos variantes: una versión estática de 116 GiB y una versión "PLE" de 91 GiB que reduce la tabla n-gram de q8_0 a iq4_nl sin degradación medida en profundidades de hasta 32k tokens. Incluye además un sidecar MTP (multi-token prediction) de 3,9 GiB para acelerar la decodificación.

El autor documenta mediciones de throughput en Vulkan/ROCm y advierte sobre incompatibilidades con ciertos forks de motores de inferencia, lo que exige verificar la compatibilidad antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención GDN + QSA, embeddings n-gram de 51B y mecanismo MTP |
| Parametros totales | 176.943.899.520 (≈176,9B) |
| Parametros activos | 6B por token |
| Longitud de contexto | 128k+ (medido en pruebas del autor) |
| Tipos de cuantizacion | IQ4_XS (PLE a iq4_nl), Q8_0 (para sidecar MTP), FP8 (modelo base original) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (con restricciones MaaS) |
| Formato de pesos | GGUF (safetensors disponible para el modelo base FP8) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida que combina atención con GDN (Gated Delta Network) y QSA (Query-Selective Attention), junto con mejoras en residuales, embeddings y optimización. Incorpora una tabla de búsqueda n-gram de 51B parámetros que actúa como memoria asociativa adicional, y un mecanismo de predicción multi-token (MTP) que genera varios tokens por paso para acelerar la inferencia. Según el repositorio oficial de Qwen, el entrenamiento requiere aproximadamente 1/9 del coste de Qwen3.7-Plus, manteniendo o mejorando capacidades en codificación y tareas ofimáticas.

El autor de la cuantización, julianmb, documenta un pipeline de conversión que verifica byte a byte cada tensor contra el checkpoint oficial FP8, corrigiendo un bug conocido del converter que afectaba a las normas de hiperconexión y la escala PLE. La cuantización utiliza `--tensor-type` para mover la tabla n-gram de q8_0 a iq4_nl, reduciendo 27 GiB sin pérdida de calidad en las pruebas realizadas. No se dispone de información sobre el dataset de entrenamiento, número de tokens ni métodos de alineación (RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Generación de texto y conversación multi-turno, con soporte para contexto largo (128k+ tokens medidos).
- Razonamiento y resolución de problemas complejos, incluyendo tareas de codificación y ofimática, según las mejoras declaradas por el equipo de Qwen.
- Soporte de predicción multi-token (MTP) mediante sidecar GGUF, que acelera la decodificación en motores compatibles.
- Capacidad de ejecución en hardware con memoria unificada (APU Strix Halo) gracias a la cuantización IQ4_XS y la optimización para Vulkan/ROCm.
- Compatible con pipelines de texto estándar (text-generation) y endpoints compatibles con la API de Hugging Face.
- No se especifican capacidades multimodales (visión, audio) en la documentación disponible.

## Casos de uso

- Asistente de programación local: el modelo puede generar, revisar y depurar código en múltiples lenguajes, ejecutándose de forma privada en una estación de trabajo con APU Strix Halo, sin necesidad de conexión a la nube.
- Análisis de documentos largos: gracias a su ventana de contexto de 128k+ tokens, puede procesar manuales técnicos, informes financieros o expedientes legales completos en una sola pasada, resumiendo y extrayendo información relevante.
- Agente conversacional para atención al cliente: su capacidad de razonamiento multi-paso y su bajo coste por token (solo 6B activos) permiten desplegar asistentes virtuales con memoria de largo plazo en hardware de gama alta.
- Generación de documentación técnica: puede redactar guías, especificaciones y comentarios de código a partir de descripciones breves, aprovechando su entrenamiento en tareas ofimáticas.
- Investigación académica: el modelo puede ayudar en la revisión de literatura, generación de resúmenes y formulación de hipótesis, con la ventaja de ejecutarse localmente para proteger datos sensibles.
- Prototipado de agentes autónomos: su soporte para MTP y su eficiencia computacional permiten experimentar con pipelines de razonamiento en cadena (chain-of-thought) en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona mediciones de throughput en el hardware objetivo (Ryzen AI Max+ 395, 128 GB unificados, GPU integrada gfx1151, motor nathanw1014 strix-halo-vulkan, KV cache q8_0, `-ub 2048`, temperatura 0):

| Profundidad de contexto | Estático 116G plain/mtp (t/s) | PLE 91G plain/mtp (t/s) |
|---|---|---|
| 0 | 29,2 / 48,4 | 29,9 / 53,1 |
| 8k | 22,9 / 42,8 | 24,1 / 56,4 |
| 32k | 19,5 / 29,5 | 20,1 / 30,2 |
| 128k | 10,8 / 26,9 | 11,0 / 18,6 |

Prefill a 32k: 384 → 397 t/s. El autor señala que la decodificación sin MTP colapsa con la profundidad en ambas cuantizaciones (~11 t/s a 128k) debido al indexador de atención dispersa, no a la cuantización. Con MTP a 128k, la versión PLE resultó más lenta que la estática (18,6 vs 26,9 t/s), posiblemente por una caída en la tasa de aceptación del draft debido al ruido de cuantización en el historial n-gram (n=1, mecanismo no verificado).

## Requisitos de hardware

- VRAM estimada: 91 GiB (versión PLE) o 116 GiB (versión estática) para los pesos; se requiere memoria adicional para la caché KV, que a 128k de contexto puede superar los 20 GiB adicionales.
- GPU recomendada: APU AMD Ryzen AI Max+ 395 con 128 GB de memoria unificada (Strix Halo) o GPUs discretas con al menos 96-128 GB de VRAM (por ejemplo, 2x A100 80GB, 1x H200 141GB).
- En GPUs de consumo (RTX 4090 con 24 GB, etc.) no cabe el modelo completo; se requeriría cuantización más agresiva o descarga parcial, no contemplada en este repositorio.
- Opciones de despliegue: llama.cpp y sus forks (nathanw1014 strix-halo-vulkan, a pepojken qwen4exp-spec-mtp) con backend Vulkan o ROCm. No se menciona soporte para vLLM u Ollama en la documentación.
- Latencia y throughput: los valores medidos se muestran en la tabla de benchmarks; a 32k de contexto con MTP se alcanzan ~56 t/s en la versión PLE, lo que equivale a unos 18 ms por token.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría en la información proporcionada. El modelo base Qwen3.8-Flash-Next se posiciona como una alternativa eficiente a Qwen3.7-Plus según el repositorio oficial, pero no se incluyen métricas de calidad. Para una comparación justa sería necesario evaluar el modelo FP8 original frente a otros MoE de tamaño similar (por ejemplo, DeepSeek-V3, Qwen3-235B-A22B), lo cual no está disponible en las fuentes consultadas.

## Limitaciones y advertencias

- La versión PLE (91 GiB) presenta incompatibilidad con algunos forks de motores de inferencia: los motores que alimentan las filas PLE directamente como operandos de mul_mat sin descuantizar abortan en `ggml-vulkan.cpp:7794` (b_type debe ser F32/F16/Q8_1). Verificar el motor antes de usar.
- A profundidades de 128k+, la versión PLE con MTP mostró un rendimiento inferior a la versión estática (18,6 vs 26,9 t/s) en una única medición; el mecanismo no está confirmado.
- La cuantización IQ4_XS introduce pérdida de precisión respecto al modelo FP8 original; para tareas que requieran máxima fidelidad numérica, se recomienda usar el checkpoint FP8 o cuantizaciones de mayor precisión.
- La licencia Qwen Community License 1.0 restringe el uso como servicio gestionado (MaaS) y exige notificación para la distribución; revisar los términos completos antes de uso comercial.
- No se ha evaluado el modelo en términos de sesgos, alucinaciones o seguridad; se recomienda realizar pruebas específicas para el dominio de aplicación antes de desplegarlo en producción.
- El repositorio no incluye información sobre idiomas soportados; aunque Qwen suele ser multilingüe, no está confirmado para esta versión.

## Enlaces

- Repositorio Hugging Face del quant: https://huggingface.co/julianmb/Qwen3.8-Flash-Next-IQ4_XS-GGUF
- Modelo base FP8 en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Repositorio oficial de Qwen3.8-Flash-Next en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Colección oficial de Qwen en Hugging Face: https://huggingface.co/collections/Qwen/qwen38-flash-next
- Documentación del pipeline del autor: https://github.com/julianmb/haloq38flash
- Guía de ejecución local (projectmonet.space): https://www.projectmonet.space/blog/how-to-run-qwen3-8-flash-next-locally
