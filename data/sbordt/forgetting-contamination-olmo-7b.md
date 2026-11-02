# sbordt/forgetting-contamination-OLMo-7B

## Resumen

`sbordt/forgetting-contamination-OLMo-7B` no es un modelo pensado para uso general, sino un conjunto de checkpoints de investigación publicados como material reproducible del artículo «How much can we forget about Data Contamination?» (Bordt, Srinivas, Boreiko y von Luxburg, ICML 2025). El artefacto parte de OLMo-7B, el modelo de lenguaje abierto de AI2, y documenta un experimento controlado de contaminación de datos: se reanuda el preentrenamiento original desde el paso 300.000, se inyectan las preguntas de varios benchmarks (HellaSwag, WinoGrande, PIQA, BoolQ, ARC-Easy, MMLU y Social IQa) en los lotes de entrenamiento y después se continúa el entrenamiento con la mezcla original de OLMo.

El objetivo es medir cuánto «olvida» el modelo esa contaminación tras seguir entrenando con datos limpios, y en qué medida las preguntas inyectadas siguen siendo recuperables. Los checkpoints liberados permiten reproducir el análisis: el punto de partida, el estado 80 pasos después de la inyección y el checkpoint final del run continuado (paso 323.700). Es, por tanto, una herramienta para estudiar memorización, contaminación de benchmarks y dinámica de olvido en modelos de 7.000 millones de parámetros, no un modelo listo para desplegar en producción.

La relevancia actual es metodológica: la contaminación de benchmarks es uno de los problemas más discutidos en la evaluación de LLM, y este repositorio ofrece pesos reales, con estado del optimizador incluido, para auditar empíricamente hasta qué punto una evaluación puede estar inflada por datos vistos durante el preentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-7B de AI2) |
| Parametros totales | 7.000 millones (modelo base OLMo-7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (se publican checkpoints sin cuantizar en formato nativo de OLMo) |
| Idiomas soportados | no disponible en la informacion proporcionada (OLMo-7B se entrena mayoritariamente en ingles, pero la ficha no lo declara) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints no sharded del trainer de OLMo (`config.yaml`, `model.pt`, `optim.pt`, `train.pt`); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es OLMo-7B, un transformer decoder-only denso de 7.000 millones de parámetros desarrollado por AI2. El experimento no modifica la arquitectura: reanuda el run `v1_5-mix-mitch-ish` desde el checkpoint del paso 300.000, inyecta las preguntas de benchmark en los lotes de preentrenamiento (fichero `input_ids_7B.npy`) y entrena 80 pasos adicionales; después continúa el entrenamiento con la mezcla original de datos (Dolma) hasta el paso 323.700, que es el último checkpoint liberado.

La innovación es de metodología, no de arquitectura. El repositorio incluye tres carpetas: `step300000-unsharded` (punto de partida), `step300080-unsharded` (80 pasos tras la inyección de contaminación) y `step323700-unsharded` (estado final tras seguir entrenando con datos limpios). Cada carpeta contiene el estado del optimizador, lo que permite reanudar el entrenamiento. El código de descarga, contaminación e inserción de lotes está en el directorio `olmo/` del repositorio GitHub del proyecto. No se documentan en la información disponible fases de RLHF ni DPO, ni detalles sobre el volumen exacto de tokens de la mezcla continuada.

## Capacidades

- Generación de texto autoregresiva propia de OLMo-7B, sin ajuste fino instructivo declarado.
- Respuesta a preguntas de opción múltiple en los formatos de HellaSwag, WinoGrande, PIQA, BoolQ, ARC-Easy, MMLU y Social IQa, con distintos grados de contaminación según el checkpoint.
- Reproducción de experimentos de contaminación: comparación entre el estado previo a la inyección, el estado inmediatamente posterior y el estado final tras el olvido.
- Reanudación del entrenamiento gracias a la inclusión de `optim.pt` y `train.pt`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Auditoría de contaminación de benchmarks: cargar los tres checkpoints y medir la caída de precisión en cada benchmark entre el paso 300.080 y el 323.700 para estimar la tasa de olvido de datos vistos durante el preentrenamiento.
- Investigación sobre memorización: analizar si el modelo reproduce literalmente preguntas inyectadas o solo aprende la distribución de respuestas, comparando generaciones con y sin contexto.
- Validación de metodologías de detección de contaminación: usar los checkpoints como ground truth controlado para probar técnicas de detección basadas en perplejidad, n-gramas o huellas de entrenamiento.
- Reproducción de resultados del artículo ICML 2025: el estado del optimizador permite reanudar el run y verificar las curvas publicadas en Weights & Biases.
- Estudio de dinámica de olvido en preentrenamiento: comparar la velocidad de degradación de la señal contaminante frente a la retención de conocimiento general.
- Formación y docencia: material didáctico para explicar por qué los benchmarks pueden estar inflados y cómo diseñar experimentos controlados de contaminación.
- Desarrollo de políticas de evaluación: usar los resultados para justificar la creación de conjuntos de test privados o rotativos en pipelines de evaluación interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye los checkpoints y los conjuntos de preguntas contaminadas, pero la model card no reporta cifras de MMLU, HumanEval, GSM8K ni métricas equivalentes para estos checkpoints concretos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 14 GB para los 7.000 millones de parámetros, más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7-8 GB; en 4 bits, en torno a 4-5 GB, aunque el repositorio no publica pesos cuantizados.
- GPU recomendadas para fp16: A100 40 GB, H100 80 GB o RTX 4090 24 GB (esta última cabe con margen ajustado).
- GPU consumer: sí cabe en RTX 3090/4090 (24 GB) en fp16, y en GPUs de 8-12 GB si se convierte y cuantiza manualmente.
- Despliegue: el formato nativo es el del trainer de OLMo; para servir el modelo hay que convertirlo primero a `transformers` con `scripts/convert_olmo_to_hf_new.py` (no probado por los autores) y después usar vLLM, TGI o llama.cpp tras una conversión adicional a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.
- Almacenamiento: el repositorio ocupa 248 GB, por lo que conviene descargar solo la carpeta del checkpoint necesario con `--include`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sbordt/forgetting-contamination-OLMo-7B | 7.000 M | no disponible | Checkpoints de investigacion sobre contaminacion | Apache 2.0 | HuggingFace (248 GB) |
| allenai/OLMo-7B | 7.000 M | no disponible en esta ficha | Modelo base de lenguaje abierto | Apache 2.0 | HuggingFace |
| OLMo-1B (usado por los autores para probar la carga) | 1.000 M | no disponible | Version reducida para pruebas | Apache 2.0 | HuggingFace |
| Modelos de 7B tipo Llama 2 / Mistral | 7.000 M | 4.096-32.768 tokens segun version | Modelos generalistas con ajuste instructivo | Licencias variables | HuggingFace |

La comparación directa con modelos generalistas no es del todo justa: este repositorio es un artefacto de investigación con estado del optimizador, no un modelo para producción. Frente a OLMo-7B original, la diferencia está en los datos de preentrenamiento inyectados y en el punto de entrenamiento, no en la arquitectura.

## Limitaciones y advertencias

- No es un modelo para uso en producción: los checkpoints están deliberadamente contaminados con preguntas de benchmark y su rendimiento en evaluaciones estándar no es representativo.
- El formato de pesos es el nativo del trainer de OLMo; la conversión a `transformers` no ha sido probada por los autores.
- El repositorio pesa 248 GB e incluye estado del optimizador, lo que complica su descarga y almacenamiento.
- No se declaran idiomas soportados ni longitud de contexto en la información disponible.
- Riesgo de alucinación y sesgos: no evaluados en la información proporcionada; al ser un modelo base sin ajuste instructivo, la calidad de las respuestas conversacionales es limitada.
- La licencia Apache 2.0 permite uso comercial, pero el contenido contaminado y el propósito de investigación hacen desaconsejable cualquier despliegue comercial sin auditoría previa.
- Los resultados del experimento dependen de la mezcla de datos y del checkpoint de partida; no deben generalizarse a otros modelos sin replicación.
- No se documentan mecanismos de seguridad, filtrado de contenido ni evaluaciones de sesgo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sbordt/forgetting-contamination-OLMo-7B
- Articulo (arXiv): https://arxiv.org/abs/2410.03249
- Codigo y detalles del experimento: https://github.com/tml-tuebingen/forgetting-contamination
- Codigo de contaminacion de lotes: https://github.com/tml-tuebingen/forgetting-contamination/tree/main/olmo
- Logs de Weights & Biases: https://api.wandb.ai/links/public-runs/x4pllyju
- Coleccion de HuggingFace con checkpoints y preguntas: https://huggingface.co/collections/sbordt/forgetting-contamination-benchmark-questions-68bac54b109388f26b40b7eb
- Modelo base OLMo-7B: https://huggingface.co/allenai/OLMo-7B
- Repositorio del trainer de OLMo: https://github.com/allenai/OLMo
