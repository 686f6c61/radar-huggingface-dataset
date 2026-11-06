# mrysh/qwen3.5-9b-prune_depth_20

## Resumen

qwen3.5-9b-prune_depth_20 es una versión podada por profundidad del modelo Qwen/Qwen3.5-9B, publicada por el usuario mrysh como parte de un benchmark de poda que compara cuatro modelos base con ocho variantes de poda cada uno. La poda se realizó con NVIDIA ModelOpt Minitron (versión 0.46.0rc1) y reduce la red de 32 a 26 capas del transformer, es decir, un 20% de las capas solicitadas, manteniendo intacta la anchura de los tensores. El checkpoint resultante contiene 7.643.360.640 parámetros y ocupa 15,307 GB en disco.

El modelo conserva únicamente la parte lingüística del Qwen3.5 original: la torre de visión y la cabeza de predicción multi-token han sido eliminadas, por lo que se trata de un modelo exclusivamente de texto. No se aplicó destilación ni fine-tuning posterior a la poda, de modo que cabe esperar una degradación de calidad frente al modelo base, que es precisamente lo que el benchmark pretende cuantificar sobre BFCL, hiring-bias y MedQA con vLLM y el modo thinking desactivado.

Su relevancia es metodológica más que de producto: sirve como referencia reproducible para estudiar el impacto de la poda por profundidad en un modelo de la familia Qwen3.5 y para comparar esa estrategia con la cuantización bajo la misma licencia Apache 2.0 del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5 text, podado por profundidad de 32 a 26 capas) |
| Parámetros totales | 7.643.360.640 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el benchmark compara contra checkpoints cuantizados de Qwen, pero no se listan formatos para este modelo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un transformer denso derivado de Qwen3.5-9B, al que se le han eliminado 6 de las 32 capas del bloque lingüístico mediante poda por profundidad con NVIDIA ModelOpt Minitron, a un nivel de 0,2. La importancia de cada capa se midió sobre un conjunto de calibración de 512 muestras mixtas. La anchura de las capas restantes no se modifica. El checkpoint final reduce un 14,6% de los parámetros del modelo de lenguaje, porcentaje que coincide con el del checkpoint completo.

No hubo destilación ni fine-tuning tras la poda, por lo que los pesos conservados son los del modelo base sin reajuste. Tampoco se ha publicado información sobre el volumen de tokens de entrenamiento del modelo original ni sobre fases de RLHF o DPO en esta ficha. La innovación técnica del artefacto es la propia metodología de poda estructurada por capas y su uso como punto de comparación controlado frente a la cuantización.

## Capacidades

- Generación de texto: conserva la funcionalidad del bloque lingüístico de Qwen3.5-9B, con la calidad degradada esperable tras la poda sin reentrenamiento.
- Razonamiento y matemáticas: se evalúa en el benchmark con el modo thinking desactivado, por lo que su uso previsto es de respuesta directa.
- Tool calling y function calling: forma parte de la evaluación del benchmark (BFCL), lo que indica que el modelo base soporta este tipo de tareas.
- Conocimiento biomédico: evaluado en MedQA dentro del benchmark del autor.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión: no soportada; la torre de visión fue eliminada del checkpoint.
- Predicción multi-token: no soportada; la cabeza correspondiente fue eliminada.
- Modo thinking: no disponible en esta variante según la configuración de evaluación descrita.

## Casos de uso

- Investigación sobre poda de modelos: sirve como punto de datos reproducible para medir la caída de calidad al eliminar capas de un transformer de 9B, comparando con las otras siete variantes del benchmark del autor.
- Comparación poda frente a cuantización: permite contrastar, bajo el mismo harness de vLLM y los mismos conjuntos BFCL, hiring-bias y MedQA, si reducir profundidad es preferible a reducir precisión numérica.
- Evaluación de sesgos en modelos comprimidos: el conjunto hiring-bias del benchmark permite estudiar si la poda por profundidad altera el comportamiento del modelo en decisiones de contratación simuladas.
- Despliegue de bajo coste en texto: al tener menos capas y ser solo texto, puede ejecutarse en infraestructura más modesta que el modelo base para tareas de generación simple donde la pérdida de calidad sea tolerable.
- Docencia y divulgación técnica: útil para explicar de forma práctica qué es la poda estructurada, el papel del conjunto de calibración y el coste en calidad de eliminar capas.
- Línea base en pipelines de compresión: puede integrarse como referencia negativa (sin destilación) frente a variantes podadas y reentrenadas, para justificar la inversión en destilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el modelo forma parte de un benchmark sobre BFCL, hiring-bias y MedQA ejecutado con vLLM, pero no incluye las cifras obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 15,3 GB solo para pesos, más memoria para caché KV y activaciones; en la práctica se recomienda partir de 24 GB.
- VRAM estimada en FP8: en torno a 7,6-8 GB para pesos, con margen adicional para el runtime.
- GPU profesionales: A100 (40/80 GB), H100, L40S y A10G son adecuadas; el modelo cabe holgadamente en una sola GPU de 24 GB o más en BF16.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en BF16; en GPUs de 16 GB requeriría cuantización.
- Despliegue: el autor evalúa con vLLM; al ser un checkpoint safetensors de arquitectura qwen3_5_text, es compatible con stacks que soporten dicha arquitectura (vLLM, TGI), y con conversión a GGUF para llama.cpp u Ollama si la herramienta de conversión soporta la arquitectura.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| qwen3.5-9b-prune_depth_20 | 7,64 B | no disponible | Apache 2.0 | 26 capas, solo texto, sin destilación |
| Qwen/Qwen3.5-9B (base) | no disponible | no disponible | Apache 2.0 | Modelo original con visión y predicción multi-token |
| Otras variantes del benchmark del autor | no disponible | no disponible | Apache 2.0 | Siete variantes adicionales de poda y checkpoints cuantizados comparados en BFCL, hiring-bias y MedQA |

No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Degradación de calidad esperada: la poda elimina 6 capas sin destilación ni fine-tuning posterior, por lo que el rendimiento en tareas complejas será inferior al del modelo base.
- Pérdida de modalidades: no procesa imágenes ni dispone de predicción multi-token; cualquier caso de uso multimodal queda descartado.
- Riesgo de alucinación: no cuantificado en la información disponible; la compresión estructural puede agravarlo en dominios especializados como el biomédico.
- Sesgos: el benchmark incluye hiring-bias, lo que sugiere interés en medir sesgos, pero no se publican resultados ni conclusiones al respecto.
- Idiomas y contexto: sin datos publicados sobre cobertura lingüística ni longitud de ventana en esta variante.
- Licencia: Apache 2.0 heredada del modelo base, lo que permite uso comercial; conviene revisar la model card de Qwen/Qwen3.5-9B para condiciones adicionales.
- Madurez: checkpoint con cero descargas y publicado como artefacto de benchmark, sin garantías de mantenimiento ni soporte.
- Producción: no recomendado como sustituto directo del modelo base sin una evaluación propia en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrysh/qwen3.5-9b-prune_depth_20
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- NVIDIA ModelOpt (herramienta de poda): no disponible en la información proporcionada
- Paper o blog del benchmark: no disponible en la información proporcionada
- Repositorio o demo: no disponible en la información proporcionada
