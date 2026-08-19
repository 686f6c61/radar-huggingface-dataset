# long10024070/DeepSeek-V4-Flash-0731-FP8

## Resumen

DeepSeek-V4-Flash-0731-FP8 es una conversión no oficial al formato FP8 del modelo DeepSeek-V4-Flash-0731, desarrollada por el usuario long10024070 y publicada bajo licencia MIT. El checkpoint original de DeepSeek combina expertos enrutados en MXFP4 con tensores densos, de atención, de experto compartido y de MTP (Multi-Token Prediction) en MXFP8; esta conversión unifica todo el peso en un único layout FP8 (`float8_e4m3fn`) con escalas en `float32` y bloques de 128×128, pensado específicamente para el runtime SGLang.

El modelo base, DeepSeek-V4-Flash-0731, es un MoE de aproximadamente 304 000 millones de parámetros orientado a contexto de millón de tokens, según el título de su informe técnico ("Towards Highly Efficient Million-Token Context Intelligence"). La conversión FP8 no reclama los resultados de benchmarks publicados del modelo original, pero incluye un proceso de verificación determinista que reporta un error máximo de dequantización de 0.0 sobre una muestra de 18 087 936 bloques de 128×128, lo que indica una conversión sin pérdidas en el rango medido.

La relevancia de esta publicación radica en que ofrece un checkpoint FP8 listo para servir con SGLang en hardware AMD (validado en MI325X), reduciendo el requisito de memoria frente al formato original mixto MXFP4/MXFP8, y facilitando el despliegue del modelo en entornos de producción con parallelism de tensores y datos. No obstante, se trata de una conversión comunitaria, no soportada oficialmente por DeepSeek, y su compatibilidad con runtimes distintos de SGLang no está verificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con expertos enrutados y experto compartido; incluye módulo MTP (Multi-Token Prediction) |
| Parametros totales | 304 198 891 198 (~304,2 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 1 000 000 tokens (según el título del informe técnico del modelo base; no confirmado en la model card de la conversión) |
| Tipos de cuantizacion | FP8 (`float8_e4m3fn`) con escalas `float32` y block size `[128, 128]` |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8), compatible con SGLang |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base DeepSeek-V4-Flash-0731, un transformer de tipo Mixture of Experts con un gran número de expertos enrutados y un experto compartido, más un módulo de predicción multi-token (MTP). No se dispone de información sobre el número de parámetros activos por token ni sobre la composición exacta de los expertos en la documentación de la conversión.

El proceso de entrenamiento del modelo base no está documentado en esta model card. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La conversión FP8, por su parte, no modifica los pesos aprendidos: únicamente reempaqueta los tensores del checkpoint original, que combina MXFP4 (expertos enrutados) y MXFP8 (tensores densos, atención, experto compartido y MTP), a un formato FP8 unificado. Las escalas originales E8M0 (potencias de dos) se convierten de forma exacta a `float32`, y la verificación reporta un error máximo de dequantización de 0.0 en la muestra analizada, lo que sugiere una conversión sin pérdidas.

El checkpoint incluye utilidades de codificación (`encoding/`) para formatear mensajes estilo OpenAI, ya que el modelo base no incorpora plantilla de chat Jinja. La conversión se ha validado exclusivamente con SGLang en AMD MI325X, sin flags de decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento complejo, según los benchmarks publicados del modelo base (MMLU Pro 86,40; CodeForces 3052).
- Generación de código y resolución de problemas de programación competitiva (LiveCodeBench 91,60).
- Razonamiento matemático y lógico, inferido de los resultados en MMLU Pro y CodeForces.
- Manejo de contexto de hasta un millón de tokens, lo que permite procesar documentos extensos en una sola pasada (según el informe técnico del modelo base).
- Soporte de formato de mensajes OpenAI-style mediante las utilidades `encoding/` incluidas.
- Compatibilidad con SGLang para servir en producción con tensor parallelism y data parallelism.
- No se documenta soporte explícito de tool calling, función de agentes multi-paso, visión o audio en la model card de la conversión.

## Casos de uso

- Análisis de documentos jurídicos y financieros extensos: con una ventana de contexto de hasta un millón de tokens, el modelo puede procesar contratos completos, expedientes regulatorios o informes anuales en una sola consulta, extrayendo cláusulas, riesgos o métricas clave sin necesidad de dividir el texto.
- Generación de código en entornos de desarrollo: el modelo base muestra resultados sólidos en LiveCodeBench, por lo que puede usarse para generar funciones, revisar pull requests o autocompletar implementaciones complejas en lenguajes como Python, C++ o Rust, integrándolo en pipelines de CI/CD mediante la API de SGLang.
- Resolución de problemas de programación competitiva: gracias a su puntuación de 3052 en CodeForces, es adecuado para plataformas de entrenamiento de ingenieros o para generar soluciones optimizadas con explicaciones paso a paso.
- Razonamiento matemático y científico: con MMLU Pro de 86,40, puede asistir en la resolución de problemas de nivel universitario, verificación de demostraciones o generación de ejercicios con soluciones detalladas.
- Búsqueda y síntesis sobre corpus largos: el contexto de millón de tokens permite indexar libros técnicos, papers o bases de conocimiento internas y responder preguntas con referencias a secciones concretas, sin necesidad de RAG externo.
- Asistente de investigación académica: el modelo puede resumir múltiples artículos, comparar metodologías y extraer conclusiones, aprovechando la ventana larga y el razonamiento multi-paso.
- Despliegue de un servicio de chat privado con SGLang: la conversión FP8 permite servir el modelo en un clúster de GPUs AMD con parallelism, manteniendo los datos en infraestructura propia y sin depender de APIs externas, gracias a la licencia MIT.

## Benchmarks y rendimiento

La model card de la conversión FP8 indica explícitamente que no reclama los resultados de benchmarks publicados del modelo base. No se han ejecutado benchmarks específicos sobre el checkpoint FP8. Los siguientes datos corresponden al modelo original DeepSeek-V4-Flash-0731, según la información recopilada en Datalearner:

| Benchmark | Resultado | Posicion |
|---|---|---|
| LiveCodeBench | 91,60 | 4 / 126 |
| MMLU Pro | 86,40 | 17 / 133 |
| CodeForces | 3052 | 3 / 20 |

Estos valores deben interpretarse como referencia del modelo base, no como rendimiento garantizado de la conversión FP8.

## Requisitos de hardware

- Tamaño del checkpoint: 305,9 GB en disco (pesos FP8 más escalas `float32`).
- VRAM estimada para inferencia: al menos ~306 GB solo para los pesos en FP8, más memoria para KV cache y activaciones. Con `--kv-cache-dtype fp8_e4m3`, la huella total supera los 320 GB.
- GPU recomendadas: el modelo card valida el despliegue en AMD MI325X con 4 vías de tensor parallelism y 4 vías de data parallelism (8 GPUs en total). No se han probado GPUs NVIDIA, aunque SGLang soporta ambas arquitecturas.
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.): se requieren múltiples GPUs de centro de datos con al menos 64 GB de HBM cada una.
- Opciones de despliegue: SGLang es el único runtime validado. El modelo card advierte que no se reclama compatibilidad con Transformers, vLLM u otros runtimes para este layout exacto.
- Latencia y throughput: no disponibles. La configuración de validación usa `--cuda-graph-max-bs-decode 8` y `--enable-dp-attention`, lo que sugiere un enfoque orientado a throughput con data parallelism, pero no se publican cifras concretas.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otros modelos de la misma categoría. DeepSeek-V4-Flash-0731 es un modelo reciente y la conversión FP8 es un trabajo comunitario sin benchmarks propios. Como referencia cualitativa:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (base) | ~304B (MoE) | 1M tokens (según informe técnico) | MIT | Hugging Face oficial |
| DeepSeek-V4-Flash-0731-FP8 (esta conversion) | ~304B (MoE) | 1M tokens (heredado del base) | MIT | Hugging Face, solo SGLang |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

No se identificaron modelos comparables con datos públicos suficientes para una tabla de rendimiento cruzada.

## Limitaciones y advertencias

- Conversión no oficial: no es una publicación de DeepSeek y no reclama los benchmarks del modelo base; el rendimiento real puede diferir.
- Compatibilidad restringida: solo se ha validado con SGLang en AMD MI325X. No se garantiza el funcionamiento con Transformers, vLLM u otros runtimes.
- Sin plantilla de chat Jinja: requiere el uso de las utilidades `encoding/` para formatear mensajes estilo OpenAI; la integración con frameworks que esperan una plantilla estándar puede fallar.
- Riesgo de alucinación: como todo LLM, puede generar contenido plausible pero incorrecto, especialmente en tareas de razonamiento o hechos específicos; no se documentan medidas de mitigación.
- Sesgos: no se ha publicado información sobre sesgos del modelo base ni de la conversión; se recomienda auditar antes de un uso en producción con usuarios finales.
- Requisitos de hardware elevados: el tamaño de ~306 GB en FP8 exige clústeres multi-GPU de centro de datos, lo que limita su uso a organizaciones con infraestructura dedicada.
- Idiomas: no se documentan los idiomas soportados; el rendimiento multilingüe es desconocido.
- Verificación limitada: la conversión se verificó como sin pérdidas sobre una muestra determinista, pero no se cubren todos los posibles estados de activación ni escenarios de inferencia.

## Enlaces

- Repositorio de la conversión FP8: https://huggingface.co/long10024070/DeepSeek-V4-Flash-0731-FP8
- Modelo base oficial: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- DeepWiki del modelo base: https://deepwiki.com/deepseek-v4-flash-0731/deepseek-v4-flash-0731
- Página de DeepSeek: https://deepseek.com/en/index.html
- Ficha con specs y benchmarks en Datalearner: https://www.datalearner.com/en/ai-models/pretrained-models/deepseek-v4-flash
- Conversión alternativa de unsloth: https://huggingface.co/unsloth/DeepSeek-V4-Flash-0731
