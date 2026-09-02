# EInnovator/pra-gemma3-1b-mlx-4bit

## Resumen

Este repositorio contiene un adaptador estructural de Progressive Retrieval Attention (PRA) diseñado para el modelo base `mlx-community/gemma-3-1b-it-4bit`, una versión cuantizada a 4 bits del modelo Gemma 3 de 1B de parámetros de Google DeepMind. PRA es una técnica de atención que selecciona dinámicamente los tokens más relevantes de un contexto largo, mejorando la eficiencia y la calidad en tareas de recuperación de información y respuesta a preguntas sobre documentos extensos.

El adaptador no incluye los pesos del modelo base, sino que aporta un mapeo estructural, un router aprendido opcional, perfiles de ejecución y metadatos de compatibilidad. Está desarrollado por EInnovator y se distribuye bajo licencia Gemma. El modelo base Gemma 3 1B es un SLM multimodal (texto e imagen) con ventana de contexto de 128K tokens y soporte para más de 140 idiomas, aunque el adaptador PRA se centra específicamente en mejorar la gestión de contexto largo.

La relevancia de este adaptador radica en que permite desplegar modelos de lenguaje pequeños en entornos con recursos limitados (como Apple Silicon o GPUs de consumo) manteniendo una recuperación de información precisa en tareas de QA sobre corpus extensos, un caso de uso cada vez más demandado en aplicaciones de búsqueda y análisis documental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador estructural PRA sobre Gemma3ForCausalLM (modelo base 1B, cuantización 4-bit MLX) |
| Parametros totales | Adaptador: 294 912 (router aprendido); modelo base: 1B |
| Parametros activos | 294 912 (solo router cuando se usa routing aprendido; el adaptador estructural no añade parámetros) |
| Longitud de contexto | 128K (modelo base Gemma 3); PRA optimiza la selección de tokens dentro de esa ventana |
| Tipos de cuantizacion | Modelo base: 4-bit MLX; adaptador sin cuantización adicional |
| Idiomas soportados | No disponible (el modelo base Gemma 3 soporta 140+, pero el adaptador no especifica restricciones idiomáticas) |
| Licencia | Gemma |
| Formato de pesos | Bundle PRA (adaptador estructural + router aprendido), no safetensors |

## Arquitectura y entrenamiento

PRA (Progressive Retrieval Attention) es un mecanismo de atención que, en lugar de procesar toda la secuencia de forma uniforme, selecciona progresivamente los tokens más relevantes para la tarea mediante un router. El adaptador estructural define el mapeo entre el modelo base y el mecanismo PRA, mientras que el router aprendido (opcional) se entrena para optimizar la selección de contexto. El router tiene 294 912 parámetros y se entrenó con el método multi-positive softmax sobre los datasets QASPER y HotpotQA, con 48 ejemplos de entrenamiento, 16 de validación y 32 de test held-out, usando 5 semillas (11, 23, 37, 53, 71) y seleccionando el mejor modelo por AUC0-30 combinado en validación. No se empleó RLHF ni DPO.

El adaptador está diseñado para el motor MLX (Apple Silicon), aunque también es portable al ecosistema Hugging Face con limitaciones (Selected Context sin Native Memory). La identidad de cualificación es específica para la revisión inmutable `2d44e83dc9e80843d22fb941d3d699a0b1351aa6` del modelo base 4-bit MLX.

## Capacidades

- Mejora la recuperación de contexto en tareas de respuesta a preguntas sobre documentos largos (QA extractivo).
- Selección de tokens relevante mediante routing genérico por coseno (perfil `reference` y `balanced`) o routing aprendido (perfil `qasper-learned`).
- Soporte de contexto largo: aprovecha la ventana de 128K del modelo base Gemma 3 de forma más eficiente.
- Compatibilidad con el motor MLX (Apple Silicon) y portable a Hugging Face Transformers (solo Selected Context).
- Incluye perfiles de ejecución predefinidos (`balanced`, `reference`, `qasper-learned`) y herramientas CLI para evaluación y recomendación de configuración.
- No se documentan capacidades de tool calling, agentes, visión ni audio específicas del adaptador (dependen del modelo base).

## Casos de uso

- **Respuesta a preguntas sobre corpus legales o académicos**: el adaptador PRA permite que un modelo de 1B procese documentos extensos (contratos, artículos científicos) seleccionando los pasajes relevantes, reduciendo el coste computacional frente a la atención completa.
- **Búsqueda semántica en bases documentales**: integrable en pipelines de recuperación aumentada (RAG) para filtrar fragmentos relevantes antes de la generación, mejorando la precisión en dominios con mucha jerga técnica.
- **Asistentes de análisis de informes financieros**: dado un informe anual de cientos de páginas, el modelo puede extraer métricas clave gracias a la selección de contexto de PRA, sin necesidad de un modelo grande.
- **Chat sobre documentación técnica**: desplegado en un entorno Apple Silicon (Mac con M4 Pro), permite conversaciones multi-turno sobre manuales o guías extensas con baja latencia.
- **Preprocesamiento para modelos grandes**: el router PRA puede usarse como filtro previo para identificar los pasajes más relevantes, reduciendo el número de tokens que un modelo más grande debe procesar.
- **Evaluación de calidad de recuperación**: las métricas R@20% publicadas permiten usar el adaptador como baseline en experimentos de investigación sobre atención selectiva.

## Benchmarks y rendimiento

La model card proporciona métricas de cualificación (R@20%) medidas en Apple M4 Pro con 48 GB y mlx-lm 0.31.3:

| Workload | Modo de routing | R@20% |
|---|---|---|
| qasper (n=16) | Generic cosine | 0.2259 |
| qasper (n=16) | Learned asymmetric | 0.4539 |
| hotpotqa (n=16) | Generic cosine | 0.3365 |
| hotpotqa (n=16) | Learned asymmetric | 0.318 |
| combined (n=32) | Generic cosine | 0.2812 |
| combined (n=32) | Learned asymmetric | 0.3859 |

Estos valores son mediciones de cualificación con 16 ejemplos por dataset, no garantizan rendimiento en producción. No se publican métricas de generación (perplejidad, BLEU, etc.) ni de latencia (TTFT o throughput).

## Requisitos de hardware

- **VRAM estimada**: el modelo base 1B en 4-bit ocupa aproximadamente 0.6‑0.7 GB; el adaptador añade menos de 0.1 GB. Total inferior a 1 GB, por lo que cabe en cualquier GPU consumer moderna y en Apple Silicon unificado.
- **GPU recomendadas**: Apple M4 Pro (48 GB) validado; cualquier GPU con 4 GB de VRAM o más (RTX 3060, RTX 4060, etc.) es suficiente. También funciona en CPU con MLX o Hugging Face (más lento).
- **Despliegue**: herramientas `pra` (CLI), `pra serve` para servir con motor MLX; compatible con Hugging Face Transformers (solo Selected Context) y con el ecosistema MLX (mlx-lm).
- **Latencia y throughput**: no medidos en la documentación disponible; los perfiles indican "NOT_MEASURED".

## Comparativa con modelos similares

No hay disponibles comparativas directas con otros adaptadores de contexto largo en la información proporcionada. Como referencia, el modelo base Gemma 3 1B sin adaptador PRA procesa contexto completo (128K) pero con coste cuadrático; PRA reduce el coste seleccionando tokens, aunque a cambio de una posible pérdida de recall si el router falla. Alternativas comerciales o académicas como LongLora o Adaptadores de atención esparsa no tienen métricas comparables publicadas en este repositorio.

## Limitaciones y advertencias

- El router aprendido mejora QASPER (R@20% sube de 0.2259 a 0.4539) pero no es uniformemente positivo en HotpotQA (baja de 0.3365 a 0.318); por eso es opt-in y no el perfil por defecto.
- Las métricas de cualificación se basan en solo 16 ejemplos por dataset; no establecen calidad de generación ni economía de servicio.
- La cualificación es específica para la revisión exacta del modelo base 4-bit MLX; no se transfiere automáticamente a pesos de precisión completa ni a otras cuantizaciones.
- Las licencias del modelo base (Gemma) y del router se aplican por separado; hay que verificar los términos de uso comercial de cada componente.
- No se documentan sesgos específicos del adaptador, pero el modelo base Gemma 3 puede heredar sesgos de sus datos de entrenamiento.
- Riesgo de alucinación inherente a modelos generativos, especialmente en tareas de QA sobre documentos no vistos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/EInnovator/pra-gemma3-1b-mlx-4bit
- Modelo base en HuggingFace: https://huggingface.co/mlx-community/gemma-3-1b-it-4bit
- Documentación de PRA: https://einnovator.github.io/pdattention/
- Repositorio fuente: https://github.com/einnovator/pdattention
- Página oficial de Gemma 3: https://deepmind.google/models/gemma/gemma-3/
