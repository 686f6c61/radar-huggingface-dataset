# eCityAI-Sup/Qwen3-8B-W8A8

## Resumen

Qwen3-8B-W8A8 es una versión cuantizada del modelo Qwen3-8B de Alibaba, publicada por el usuario eCityAI-Sup. Se trata de una cuantización W8A8 (pesos INT8 y activaciones INT8) realizada con la cadena de herramientas nativa de Ascend (msModelSlim), pensada para ejecutarse sobre aceleradores Huawei Ascend, en concreto una única NPU Ascend 310P (Atlas 300I Duo). El modelo base Qwen3-8B es un transformer denso de aproximadamente 8 mil millones de parámetros, con licencia Apache 2.0 y capacidad de generación de texto y razonamiento.

El propósito declarado de esta variante no es el uso generalista, sino el razonamiento de eventos en entornos de vigilancia: estaciones de metro y estaciones de carretera. El modelo consume descripciones estructuradas de vídeo, cajas de detección y contexto de alertas generados por analítica aguas arriba, y produce la categoría del evento (objeto abandonado, residuos dispersos, anomalía en la calzada), una puntuación de confianza y una recomendación de actuación en JSON estructurado.

La relevancia de esta ficha es doble: por un lado, documenta un caso de despliegue de cuantización INT8 sobre hardware Ascend con vLLM-Ascend, un stack menos habitual que el ecosistema NVIDIA; por otro, advierte de que el repositorio solo distribuye los pesos cuantizados y notas de despliegue, sin scripts de cuantización ni resultados de benchmarks públicos verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-8B) |
| Parametros totales | aproximadamente 8 mil millones (modelo base Qwen3-8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens en la configuración de despliegue documentada (`--max-model-len 4096`) |
| Tipos de cuantizacion | W8A8 (pesos INT8 + activaciones INT8), formato nativo Ascend |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Formato cuantizado nativo Ascend: `quant_model_description.json` + shards safetensors INT8 |
| Modelo base | Qwen/Qwen3-8B |
| Herramienta de cuantizacion | msModelSlim (toolchain nativo Ascend) |
| Backend de servicio | vLLM-Ascend con `--quantization ascend` |
| Hardware objetivo | Ascend 310P (Atlas 300I Duo), NPU única |
| Tensor parallelism | 1 (sin paralelismo) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-8B original: un transformer denso de aproximadamente 8 mil millones de parámetros. Esta variante no modifica la arquitectura, sino que aplica cuantización post-entrenamiento W8A8 sobre los pesos y las activaciones mediante la herramienta msModelSlim de Ascend. El resultado es un checkpoint con pesos INT8 por capa, acompañado de un fichero `quant_model_description.json` que describe los parámetros de cuantización, y que se sirve con el backend `--quantization ascend` de vLLM-Ascend.

No se proporciona información sobre el dataset de calibración empleado para la cuantización, ni sobre el número de tokens, la composición del corpus o si hubo ajuste fino adicional sobre el modelo base. La model card indica explícitamente que no se incluye script de cuantización en el repositorio. Tampoco se documentan innovaciones arquitectónicas propias de esta variante más allá de la propia cuantización INT8 y su integración con el stack Ascend.

## Capacidades

- Generación de texto y razonamiento sobre descripciones estructuradas de escenas de vigilancia.
- Clasificación de eventos: objeto abandonado, residuos dispersos, anomalía en la superficie de la calzada y categoría normal.
- Generación de recomendaciones de actuación asociadas al evento detectado.
- Salida en JSON estructurado con campos `event_type`, `confidence` y `action`.
- Integración con analítica de vídeo aguas arriba: consume cajas de detección y contexto de alertas.
- Servicio mediante API compatible con OpenAI (`/v1/chat/completions`, `/v1/models`).
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling, function calling, agentes multi-paso, visión o audio: no documentados para esta variante.

## Casos de uso

- Razonamiento de eventos en estaciones de metro: el modelo recibe descripciones estructuradas de las cámaras de vestíbulo, andén y escaleras mecánicas y devuelve la categoría del evento con confianza y acción recomendada, aprovechando el contexto de 4096 tokens para incluir varias detecciones y metadatos en un mismo prompt.
- Vigilancia en estaciones de carretera: procesa descripciones de paradas, entradas y calzada para clasificar anomalías de la superficie o residuos, con salida JSON lista para integrarse en un sistema de gestión de incidencias.
- Clasificación de objetos abandonados: a partir de la caja de detección y del tiempo de permanencia descritos en el prompt, el modelo emite `event_type` y `confidence` para priorizar la revisión humana.
- Generación de recomendaciones operativas: además de la etiqueta, produce el campo `action` con la actuación sugerida, lo que permite encadenar el resultado a flujos de ticketing o avisos al personal de sala.
- Filtrado y reducción de falsos positivos: al combinar contexto de escena, flujo de pasajeros y detecciones, el modelo puede descartar alertas triviales antes de que lleguen a un operador, reduciendo la carga de revisión manual.
- Despliegue en infraestructura Ascend existente: al ejecutarse en una única NPU Ascend 310P con vLLM-Ascend, encaja en entornos que ya disponen de aceleradores Huawei y necesitan un endpoint compatible con OpenAI para integrarse en pipelines internos.
- Prototipado de asistentes de sala con salida estructurada: el modo `temperature: 0` y la instrucción de sistema que fuerza JSON permiten usar el modelo como extractor determinista de categorías de evento en pruebas de concepto.

## Benchmarks y rendimiento

La model card menciona una evaluación de precisión con conjuntos internos `MetroStation-Text` (1000 muestras) y `RoadStation-Text` (1000 muestras), comparando contra el checkpoint BF16 sin cuantizar de Qwen3-8B con las mismas imágenes, prompts y ajustes de decodificación, sobre una Ascend 310P y vLLM-Ascend `v0.21.0rc1-310p-openeuler`. Las métricas declaradas son precisión de tarea (%), F1 de evento (%), cumplimiento de formato JSON (%) y tasa de falsas alarmas (%). Sin embargo, el texto proporcionado se interrumpe antes de incluir los valores numéricos.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/NPU: el modelo está diseñado para ejecutarse en una única NPU Ascend 310P (Atlas 300I Duo); la model card indica menor huella de memoria y mayor throughput frente al checkpoint en coma flotante, pero no cuantifica cifras.
- GPU/NPU recomendadas: Ascend 310P es el objetivo documentado. No se documenta soporte para GPU NVIDIA (A100, H100, RTX 4090) con este formato de pesos nativo Ascend.
- Consumer GPU: no disponible; el formato cuantizado nativo Ascend no es directamente compatible con el stack CUDA estándar.
- Despliegue: vLLM-Ascend con `--quantization ascend`, imagen `quay.io/ascend/vllm-ascend:v0.21.0rc1-310p-openeuler`, servidor OpenAI-compatible en el puerto 8012, `--tensor-parallel-size 1`, `--dtype float16`, `--gpu-memory-utilization 0.85`, `--enforce-eager` y `--trust-remote-code`.
- Latencia y throughput: no disponibles; la model card solo afirma una mejora cualitativa de throughput y menor memoria frente al baseline BF16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-8B-W8A8 (esta ficha) | ~8B | 4096 (config. desplegada) | W8A8 INT8 nativo Ascend | Ascend 310P | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-8B (base) | ~8B | no disponible en esta ficha | BF16 (sin cuantizar) | GPU/NPU según backend | Apache 2.0 | Hugging Face |
| Alternativas INT8 de propósito general | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos publicados en la información proporcionada para establecer una comparación cuantitativa con otras variantes cuantizadas de Qwen3-8B.

## Limitaciones y advertencias

- El repositorio solo contiene pesos cuantizados y notas de despliegue; no incluye script de cuantización ni código de calibración, lo que dificulta reproducir el proceso.
- El formato de pesos es nativo Ascend (`quant_model_description.json` + safetensors INT8) y requiere `--quantization ascend` en vLLM-Ascend; no es portable directamente a vLLM estándar sobre CUDA.
- La longitud de contexto documentada en el despliegue es de 4096 tokens, inferior al contexto nativo del modelo base Qwen3-8B; prompts largos con muchas detecciones pueden truncarse.
- El modelo está orientado y aparentemente ajustado al dominio de estaciones de metro y carretera; su comportamiento fuera de ese dominio no está documentado.
- No se documentan idiomas soportados; el ejemplo de prompt está en inglés y no hay evidencia de calidad en castellano.
- Riesgo de alucinación inherente a los modelos de 8B, especialmente en la generación del campo `confidence` y de recomendaciones de actuación; se recomienda validación de esquema y revisión humana en producción.
- La evaluación declarada usa conjuntos internos no públicos, lo que impide verificar de forma independiente las cifras de precisión, F1, cumplimiento JSON y falsas alarmas.
- Sesgos conocidos: no disponible en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de documentación sobre el dataset de cuantización exige validación propia antes de desplegar en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/eCityAI-Sup/Qwen3-8B-W8A8
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Referencia arXiv asociada a las etiquetas del modelo: https://arxiv.org/abs/2505.09388
- vLLM-Ascend (imagen de despliegue): quay.io/ascend/vllm-ascend:v0.21.0rc1-310p-openeuler
- Documentación de vLLM-Ascend: no disponible en la información proporcionada
- Paper o blog del autor sobre la cuantización: no disponible en la información proporcionada
