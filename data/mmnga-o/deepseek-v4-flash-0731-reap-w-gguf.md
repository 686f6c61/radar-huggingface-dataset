# mmnga-o/DeepSeek-V4-Flash-0731-REAP-W-gguf

## Resumen

DeepSeek-V4-Flash-0731 REAP-W GGUF es una variante cuantizada y podada estructuralmente del modelo DeepSeek-V4-Flash-0731, desarrollada por el usuario mmnga-o. El modelo base, creado por DeepSeek, es un MoE de 304 mil millones de parámetros con activación dispersa, diseñado para generación de texto, razonamiento, codificación, contexto largo y flujos de trabajo agénticos. Esta variante GGUF aplica una cuantización UD-Q2_K_XL (2 bits) junto con una poda estructural REAP que reduce el ancho de los expertos y, en una de sus variantes, también el número de expertos enrutados, logrando tamaños de archivo entre 55 y 63 GB.

La relevancia de este modelo reside en su capacidad para ejecutar un modelo de 304B parámetros en hardware de consumo o profesional con una huella de memoria mucho menor, manteniendo una licencia MIT que permite uso comercial y modificación. Sin embargo, la poda y cuantización agresivas implican una pérdida de calidad y requieren una rama específica de llama.cpp que soporte el recorte de ancho (width-slicing) para su ejecución. Es una opción para desarrolladores que necesitan un LLM de gran tamaño en entornos con recursos limitados, siempre que acepten las limitaciones de la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 256 expertos enrutados por capa y ancho intermedio de 2048 (reducido a 1280 en esta variante) |
| Parametros totales | 155.277.666.839 (según safetensors del repo; corresponde a la variante E256-W1280) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base soporta contexto largo, pero no se especifica el valor) |
| Tipos de cuantizacion | UD-Q2_K_XL (2 bits) con poda estructural REAP |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (shardado en tres partes por variante) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-0731 es un MoE (Mixture of Experts) con 256 expertos por capa, un ancho intermedio de 2048 y un total de 304B parámetros. Incorpora un módulo de decodificación especulativa adjunto, según la documentación oficial. La variante GGUF de mmnga-o aplica dos técnicas de optimización: la cuantización UD-Q2_K_XL (2 bits) y la poda estructural REAP (Ranked Expert and Activation Pruning), que selecciona los expertos más importantes en cada capa mediante pesos de enrutado y normas de salida, y recorta el ancho de las proyecciones down según puntuaciones de activación. La variante E216 reduce los expertos de 256 a 216 por capa, mientras que la E256 mantiene los 256 expertos pero con el ancho recortado a 1280.

No se dispone de información sobre el entrenamiento original del modelo base (tokens de entrenamiento, composición del dataset o técnicas de RLHF/DPO). La poda se realiza mediante calibración con datos de referencia, pero no se especifican los detalles del proceso de calibración. La cuantización utiliza un bloque de tamaño 256 para las proyecciones recortadas.

## Capacidades

- Generación de texto y razonamiento avanzado, heredado del modelo base DeepSeek-V4-Flash-0731.
- Codificación y soporte de agentes: el modelo base es descrito como optimizado para flujos de trabajo agénticos y generación de código.
- Soporte de tool calling y function calling (según las capacidades del modelo base, aunque no se verifica en la variante GGUF).
- Contexto largo (el modelo base lo soporta, aunque no se especifica la ventana exacta en esta variante).
- Decodificación especulativa en el modelo base, aunque no se indica si está incluida en el GGUF cuantizado.
- Capacidades multilingües no documentadas para esta variante.

## Casos de uso

- **Asistentes de razonamiento y análisis**: el modelo puede procesar tareas de lógica y matemáticas, aunque la cuantización Q2_K_XL degrada la precisión. Adecuado para prototipos donde se prioriza el tamaño reducido sobre la exactitud.
- **Generación de código en entornos con GPU limitada**: con 63 GB de archivo, puede ejecutarse en una GPU de 80 GB (A100/H100) o en varias RTX 4090 con paralelismo. Útil para autocompletado o refactorización en desarrollo local.
- **Flujos agénticos de investigación**: la capacidad de tool calling permite construir agentes que consulten APIs, aunque la degradación por cuantización puede afectar la fiabilidad.
- **Análisis de documentos largos**: el contexto largo del modelo base (si se mantiene) permite procesar documentos extensos, aunque la cuantización puede introducir errores en la comprensión.
- **Pruebas de concepto en entornos académicos**: para experimentos sobre poda estructural y cuantización extrema, ya que el repo incluye `slice_manifest.json` con metadatos de poda y checksums.
- **Despliegue en servidores con una sola GPU profesional**: la variante E216 (55 GB) puede caber en una GPU de 64 GB (A100 64GB, RTX 6000 Ada) para inferencia en producción con tolerancia a errores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta variante GGUF. La información disponible solo indica que el modelo base DeepSeek-V4-Flash-0731 supera a DeepSeek-V4-Pro (Preview) en los benchmarks de referencia y es comparable a modelos propietarios de alto nivel, pero no se proporcionan cifras concretas. La cuantización y poda reducen el rendimiento, pero no se documenta cuánto.

## Requisitos de hardware

- **VRAM estimada**: la variante E256-W1280 pesa 63.17 GB, por lo que necesita al menos 64-80 GB de VRAM libre (más overhead del runtime). La variante E216-W1280 pesa 54.99 GB, lo que requiere al menos 60-64 GB.
- **GPU recomendadas**: A100 80GB, H100 80GB, RTX 6000 Ada 60GB (para la variante E216), o múltiples RTX 4090 (24 GB) con sharding manual.
- **Compatibilidad con consumer GPU**: no es realista en una sola GPU de consumo (máx. 24 GB), pero se puede usar con múltiples GPUs mediante `llama.cpp` con `--split`.
- **Opciones de despliegue**: llama.cpp con la rama `deepseekv4-width` (necesaria para el width-slicing). No se menciona compatibilidad con vLLM, Ollama u otros frameworks.
- **Latencia y throughput**: no disponible. Depende del hardware y de la cuantización Q2_K_XL, que reduce el tiempo de cómputo por token, pero la poda puede aumentar el overhead.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (base) | 304B (MoE) | Largo (no especificado) | MIT | Safetensors | Rendimiento original sin cuantizar |
| Esta variante GGUF (E256) | 155B (cuantizado) | no disponible | MIT | GGUF | Tamaño reducido a 63 GB |
| Esta variante GGUF (E216) | no disponible | no disponible | MIT | GGUF | Poda adicional de expertos, 55 GB |
| DeepSeek-V4-Pro (Preview) | no disponible | no disponible | MIT | no disponible | Modelo anterior de DeepSeek, superado por V4-Flash |

## Limitaciones y advertencias

- La cuantización Q2_K_XL es extremadamente agresiva (2 bits) y degrada la calidad de generación, especialmente en razonamiento complejo y código.
- La poda estructural REAP reduce el ancho de los expertos y (en la variante E216) el número de expertos, lo que puede afectar a la capacidad de generalización.
- Requiere una rama específica de llama.cpp (`deepseekv4-width`) que no es estándar; el uso con versiones oficiales de llama.cpp puede fallar.
- No hay información sobre sesgos, alucinaciones o limitaciones de idioma específicas de esta variante; el modelo base puede heredar sesgos de los datos de entrenamiento.
- La licencia MIT permite uso comercial, pero no hay garantía de soporte o mantenimiento del repo.
- El modelo base incluye un módulo de decodificación especulativa que probablemente no esté presente en el GGUF, lo que puede afectar el throughput.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mmnga-o/DeepSeek-V4-Flash-0731-REAP-W-gguf
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Variante REAP de referencia: https://huggingface.co/0xSero/DeepSeek-V4-Flash-0731-REAP
- Modelo base en NVIDIA NIM: https://build.nvidia.com/deepseek-ai/deepseek-v4-flash-0731/modelcard
- Documentación en Cloudflare: https://developers.cloudflare.com/workers-ai/models/deepseek-v4-flash-0731/
- Modelo base en ModelScope: https://modelscope.ai/models/deepseek-ai/DeepSeek-V4-Flash-0731
- Rama de llama.cpp con width-slicing: https://github.com/mmnga/llama.cpp/tree/deepseekv4-width
