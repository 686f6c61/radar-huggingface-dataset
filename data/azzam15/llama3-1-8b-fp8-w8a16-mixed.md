# Azzam15/llama3.1-8b-fp8-w8a16-mixed

## Resumen

El modelo `Azzam15/llama3.1-8b-fp8-w8a16-mixed` es una versión cuantizada del modelo `meta-llama/Llama-3.1-8B-Instruct` de Meta, realizada mediante la herramienta de cuantización post-entrenamiento NVIDIA ModelOpt. La cuantización es de tipo W8A16: los pesos se almacenan en FP8 (E4M3 con escala per-tensor), mientras que las activaciones permanecen en FP16. El autor, Azzam15, lo presenta como un checkpoint de control para comparar con otras variantes cuantizadas (como AWQ) en el contexto de calibración árabe, aunque la calibración no afecta a los pesos porque estos se calculan sin datos.

Este modelo no es una nueva arquitectura, sino una transformación del Llama 3.1 8B Instruct, que mantiene las capacidades originales del modelo base (razonamiento, código, tool calling, multilingüismo) con una reducción de la huella de memoria de los pesos. Su relevancia radica en permitir el despliegue de Llama 3.1 8B en hardware con menos VRAM, aunque la activación en FP16 limita el ahorro total en comparación con cuantizaciones W8A8. El repositorio no presenta descargas ni likes, lo que sugiere que es un proyecto experimental o de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | FP8 (E4M3, per-tensor) para pesos; activaciones en FP16 |
| Idiomas soportados | 8 idiomas: inglés, alemán, francés, italiano, portugués, español, tailandés, hindi (según el modelo base) |
| Licencia | No disponible en el repositorio; el modelo base usa licencia Llama 3.1 (Meta) |
| Formato de pesos | Safetensors con cuantización declarada como `modelopt` |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.1 8B Instruct, un transformer decoder-only con 32 capas, 8.03 mil millones de parámetros y una ventana de contexto de 128k tokens. El proceso de cuantización se realizó con NVIDIA ModelOpt usando la configuración `FP8_DEFAULT_CFG`. Después de la calibración, los cuantizadores de activaciones se desactivaron, de modo que el checkpoint exportado es únicamente de pesos (weight-only). Los pesos se almacenan en FP8 E4M3 con escala per-tensor, mientras que las activaciones se mantienen en FP16.

La calibración se llevó a cabo con 512 muestras de 512 tokens de una variedad de datos mixta (`calib3_mixed.txt`). Sin embargo, el propio autor indica que, al ser weight-only, la calibración no influye en el resultado final, ya que las escalas de los pesos se calculan directamente de los pesos sin depender de los datos de calibración. Por tanto, este checkpoint es idéntico independientemente del texto usado, y sirve como control para comparar con variantes AWQ que sí dependen de la calibración.

El checkpoint no es cargable con `transformers` estándar porque el `config.json` declara el tipo de cuantización `modelopt`. Se recomienda el uso de `vLLM` con la opción `--quantization modelopt`.

## Capacidades

- Generación de texto y comprensión de instrucciones en 8 idiomas.
- Razonamiento complejo y matemáticas, heredado de Llama 3.1 8B Instruct.
- Generación de código y soporte de tool calling / function calling.
- Capacidad de seguimiento de instrucciones multi-turno en diálogos.
- Ventana de contexto de hasta 128k tokens, lo que permite procesar documentos extensos o conversaciones largas.
- Soporte de despliegue mediante `vLLM` con cuantización `modelopt`.

## Casos de uso

- **Asistentes virtuales multilingües**: el modelo puede gestionar conversaciones en varios idiomas (español, francés, alemán, etc.) con un contexto largo de 128k tokens, ideal para chatbots que requieren memoria de conversaciones extensas.
- **Generación de código asistida**: gracias a su capacidad de tool calling y su entrenamiento en código, puede integrarse en entornos de desarrollo como autocompletado o generación de funciones.
- **Análisis de documentos largos**: con su ventana de 128k tokens, puede resumir o extraer información de libros, informes o actas de reuniones completas.
- **Investigación de técnicas de cuantización**: este checkpoint es útil para estudiar el impacto de la cuantización FP8 weight-only en la calidad del modelo, comparándolo con variantes W8A8 o AWQ.
- **Despliegue en hardware limitado**: al reducir los pesos a FP8, permite ejecutar Llama 3.1 8B en GPUs con menor VRAM (por ejemplo, RTX 4090 de 24 GB), aunque la activación en FP16 aumenta el consumo frente a W8A8.
- **Chatbots de atención al cliente**: gracias a su capacidad de seguir instrucciones y su soporte de herramientas, puede usarse para gestionar tickets o consultas en entornos corporativos con restricciones de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) para esta cuantización específica. Dado que es un checkpoint de control, no se han realizado evaluaciones adicionales más allá de las métricas de error de cuantización (MSE de pesos de 1.786219e-07).

## Requisitos de hardware

- **VRAM estimada**: los pesos en FP8 ocupan aproximadamente 8.03 GB (8.030.261.248 bytes ≈ 8 GB). Las activaciones en FP16, más el overhead de memoria intermedia, pueden elevar el consumo total a unos 12-16 GB en inferencia con batch pequeño.
- **GPU recomendadas**: es adecuado para GPUs con 16 GB o más de VRAM, como RTX 4090, A100 (40 GB), H100, o incluso RTX 3090 (24 GB). En GPUs de 8 GB (como RTX 3070) podría ser ajustado.
- **Despliegue**: se recomienda `vLLM` con la opción `--quantization modelopt`. También puede usarse con `TensorRT-LLM` de NVIDIA, aunque no se especifica en el repo. No es compatible con `llama.cpp` (formato GGUF) ni con `Ollama` directamente.
- **Latencia y throughput**: no se proporcionan datos específicos. Al mantener activaciones en FP16, la velocidad de inferencia puede ser algo menor que con cuantizaciones W8A8, pero aun así se espera un rendimiento superior al modelo FP16 completo.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Azzam15/llama3.1-8b-fp8-w8a16-mixed` | 8.03B | FP8 (W8A16) | 128k | No disponible (base Llama 3.1) | HuggingFace (sin descargas) |
| `amd/Llama-3.1-8B-Instruct-FP8-KV` | 8.03B | FP8 (pesos y KV) | 128k | Llama 3.1 | HuggingFace |
| `meta-llama/Llama-3.1-8B-Instruct` | 8.03B | FP16 | 128k | Llama 3.1 | HuggingFace |

El modelo de AMD cuantiza también los KV-caches, lo que puede reducir aún más el uso de memoria. La comparativa se basa en el modelo base, ya que no hay datos de rendimiento para el checkpoint de Azam15.

## Limitaciones y advertencias

- **Degradación de calidad**: la cuantización FP8 puede introducir una pérdida de precisión en tareas de razonamiento complejo, aunque el error de peso es muy bajo (MSE 1.78e-07).
- **No cargable con transformers**: el checkpoint requiere `vLLM` o herramientas compatibles con `modelopt`; no se puede usar directamente con `transformers` ni `Ollama`.
- **Sin calibración efectiva**: al ser weight-only, la calibración no mejora el rendimiento; es un control para comparar con otros métodos.
- **Sesgos y alucinaciones**: hereda los sesgos del modelo base Llama 3.1, incluyendo posibles sesgos de género, etnia o idioma, y riesgo de alucinaciones en contextos largos.
- **Licencia**: el modelo base tiene licencia Llama 3.1, que permite uso comercial con ciertas condiciones (si el uso supera 700 millones de usuarios, requiere aprobación de Meta). La licencia de este checkpoint no está especificada, pero se hereda la del modelo base.
- **Memoria**: aunque los pesos son FP8, las activaciones en FP16 limitan el ahorro de memoria frente a W8A8, por lo que en GPUs con poca VRAM puede no ser suficiente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Azzam15/llama3.1-8b-fp8-w8a16-mixed
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Blog de Meta sobre Llama 3.1: https://ai.meta.com/blog/meta-llama-3-1/
- Modelo FP8 de AMD (comparativa): https://huggingface.co/amd/Llama-3.1-8B-Instruct-FP8-KV
- Repositorio oficial de Llama 3: https://github.com/meta-llama/llama3</think>## Resumen

El modelo `Azzam15/llama3.1-8b-fp8-w8a16-mixed` es una versión cuantizada del modelo `meta-llama/Llama-3.1-8B-Instruct` de Meta, generada mediante la herramienta NVIDIA ModelOpt con configuración `FP8_DEFAULT_CFG`. La cuantización es de tipo W8A16: los pesos se almacenan en FP8 (E4M3, escala por tensor) mientras que las activaciones permanecen en FP16. El autor, Azzam15, lo presenta como un checkpoint de control para comparar con variantes AWQ, ya que las escalas de los pesos se calculan directamente de los pesos sin depender de los datos de calibración.

El modelo conserva todas las capacidades del Llama 3.1 8B Instruct, incluyendo una ventana de contexto de 128.000 tokens y soporte para 8 idiomas. Su relevancia práctica radica en permitir el despliegue del modelo base en hardware con menos memoria de pesos, aunque al mantener activaciones en FP16 el ahorro de VRAM es menor que en otras cuantizaciones como W8A8. El repositorio no presenta descargas ni interacciones, lo que indica un uso orientado a investigación o evaluación de técnicas de cuantización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | FP8 (E4M3, per-tensor) para pesos; activaciones en FP16 |
| Idiomas soportados | 8 idiomas: inglés, alemán, francés, italiano, portugués, español, tailandés, hindi (según el modelo base) |
| Licencia | No disponible en el repositorio; el modelo base usa licencia Llama 3.1 |
| Formato de pesos | Safetensors, con cuantización declarada como `modelopt` |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.1 8B Instruct, un transformer decoder-only con 32 capas y 8.030 millones de parámetros. La cuantización post-entrenamiento se realizó con NVIDIA ModelOpt utilizando la configuración `FP8_DEFAULT_CFG`. Tras la calibración, los cuantizadores de activaciones se desactivaron, de modo que el checkpoint exportado es exclusivamente de pesos (weight-only). Los pesos se almacenan en FP8 E4M3 con escala por tensor, mientras que las activaciones se mantienen en FP16.

La calibración se efectuó con 512 muestras de 512 tokens de un dataset mixto (`calib3_mixed.txt`). Sin embargo, el autor indica que, al ser activaciones FP16, la calibración no influye en el resultado final: las escalas de pesos se calculan directamente de los pesos, sin depender del texto de calibración. Por tanto, este checkpoint es un control para comparar con variantes AWQ que sí dependen de la calibración. El modelo no es cargable con `transformers` estándar; requiere `vLLM` con la opción `--quantization modelopt`.

## Capacidades

- Generación de texto y comprensión de instrucciones en 8 idiomas.
- Razonamiento complejo y resolución de problemas matemáticos, heredado del modelo base.
- Generación de código y soporte de tool calling / function calling.
- Seguimiento de instrucciones multi-turno en diálogos extensos.
- Ventana de contexto de hasta 128k tokens, apta para documentos largos o conversaciones prolongadas.
- Soporte de despliegue con `vLLM` mediante cuantización `modelopt`.

## Casos de uso

- **Asistentes virtuales multilingües**: el modelo puede gestionar conversaciones en varios idiomas (español, francés, alemán, etc.) con contexto largo, ideal para sistemas de atención al cliente internacionales.
- **Generación de código en entornos de desarrollo**: con su capacidad de tool calling y su entrenamiento en código, puede integrarse en IDE o pipelines de CI/CD para autocompletar funciones o revisar fragmentos.
- **Análisis de documentos extensos**: gracias a sus 128k tokens de contexto, permite resumir o extraer información de libros, informes o actos legales sin truncamiento.
- **Investigación sobre cuantización**: este checkpoint sirve como control en estudios que comparan métodos de cuantización (W8A16 vs W8A8 vs AWQ) para evaluar el impacto en calidad y rendimiento.
- **Despliegue en GPUs con VRAM limitada**: al reducir los pesos a FP8, permite ejecutar Llama 3.1 8B en GPUs de 16 GB (como RTX 4090), aunque las activaciones FP16 aumentan el consumo frente a alternativas W8A8.
- **Chatbots de soporte técnico**: puede gestionar tickets de soporte con múltiples turnos y herramientas de consulta, manteniendo el historial completo gracias al contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas como MMLU, HumanEval o GSM8K para esta cuantización específica. El único dato de error es la MSE de pesos de 1.786219e-07, que indica una baja distorsión en la cuantización, pero no se ofrece comparación de calidad funcional.

## Requisitos de hardware

- **VRAM estimada**: los pesos FP8 ocupan aproximadamente 8.03 GB. Con activaciones FP16 y overhead adicional, el consumo total puede superar los 12-16 GB en inferencia con batch pequeño.
- **GPUs recomendadas**: adecuado para GPUs con 16 GB o más de VRAM, como RTX 4090 (24 GB), A100 (40 GB) o H100 (80 GB). En GPUs de 8 GB (p. ej. RTX 3070) podría ser ajustado o no viable.
- **Opciones de despliegue**: `vLLM` con `--quantization modelopt` es la vía principal. También puede usarse con TensorRT-LLM, aunque no se documenta en el repo. No compatible con `llama.cpp` (formato GGUF) ni `Ollama` directamente.
- **Latencia y throughput**: no se proporcionan datos. Al mantener activaciones en FP16, la inferencia puede ser ligeramente más lenta que con cuantizaciones W8A8, pero más rápida que el modelo FP16 completo.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Azzam15/llama3.1-8b-fp8-w8a16-mixed` | 8.03B | FP8 (W8A16) | 128k | Llama 3.1 | HuggingFace (sin descargas) |
| `amd/Llama-3.1-8B-Instruct-FP8-KV` | 8.03B | FP8 (pesos y KV-cache) | 128k | Llama 3.1 | HuggingFace |
| `meta-llama/Llama-3.1-8B-Instruct` | 8.03B | FP16 | 128k | Llama 3.1 | HuggingFace |

La principal diferencia con el modelo de AMD es que este cuantiza también el KV-cache, lo que reduce aún más el consumo de memoria en inferencia de contexto largo. El modelo FP16 es el punto de referencia de calidad, pero requiere más VRAM.

## Limitaciones y advertencias

- **Degradación de calidad**: la cuantización FP8 puede introducir pérdida de precisión en tareas de razonamiento complejo o matemáticas, aunque el error de pesos es muy bajo (MSE 1.78e-07).
- **No cargable con `transformers`**: el checkpoint requiere `vLLM` u otras herramientas que soporten el tipo de cuantización `modelopt`; no se puede usar con `transformers` estándar ni con `Ollama`.
- **Calibración inefectiva**: al ser weight-only, la calibración no mejora el modelo; es un control para comparar con otros métodos.
- **Sesgos y alucinaciones**: hereda los sesgos del modelo base Llama 3.1, como sesgos de género, etnia o idioma, y puede generar alucinaciones en contextos largos o ambiguos.
- **Licencia**: el modelo base usa licencia Llama 3.1, que permite uso comercial bajo condiciones (si el número de usuarios mensuales supera 700 millones, se requiere autorización de Meta). La licencia de este checkpoint no está declarada.
- **Memoria limitada**: aunque los pesos son FP8, las activaciones FP16 no aprovechan el ahorro completo de memoria que ofrecen otras cuantizaciones como W8A8, lo que limita su utilidad en GPUs de baja VRAM.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Azzam15/llama3.1-8b-fp8-w8a16-mixed
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Blog de Meta sobre Llama 3.1: https://ai.meta.com/blog/meta-llama-3-1/
- Modelo FP8 de AMD (comparativa): https://huggingface.co/amd/Llama-3.1-8B-Instruct-FP8-KV
- Repositorio oficial de Llama 3: https://github.com/meta-llama/llama3
