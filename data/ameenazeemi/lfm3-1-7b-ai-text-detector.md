# ameenazeemi/LFM3-1.7B-AI-Text-Detector

## Resumen

LFM3-1.7B AI Text Detector es un adaptador LoRA sobre el modelo LiquidAI/LFM3-1.7B, desarrollado por el usuario ameenazeemi, que clasifica textos en inglés según la probabilidad de que hayan sido generados por una IA. Devuelve una puntuación continua de 0 (humano) a 100 (IA) mediante una cabeza lineal de dos clases leída en el último token de la secuencia. El problema que aborda es la detección de contenido sintético, una tarea relevante para plataformas educativas, medios de comunicación y sistemas de moderación que necesitan señalar texto generado automáticamente.

El modelo base LFM3-1.7B es un transformer de LiquidAI con aproximadamente 1.700 millones de parámetros y una arquitectura híbrida que combina atención con convoluciones cortas. El adaptador añade LoRA (r=16, alpha=32) sobre las proyecciones de atención, convolución corta y MLP, más una cabeza de clasificación entrenada por completo. El resultado es un clasificador ligero (0,1 GB de repositorio) que se apoya en el backbone congelado del modelo base.

Su relevancia actual radica en que ofrece una receta reproducible y de bajo coste (entrenado en una GPU de portátil de 16 GB durante unas 11 horas) para construir un detector de texto IA. Sin embargo, las métricas publicadas son estrictamente in-distribution: proceden de un único dataset con generadores y prompts acotados, por lo que la generalización a otros modelos o a texto editado no está garantizada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre LiquidAI/LFM3-1.7B (transformer híbrido con convoluciones cortas) + cabeza lineal de clasificación |
| Parámetros totales | no disponible (el adaptador LoRA y la cabeza son una fracción del backbone de 1,7B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 1.024 tokens por texto (max_length configurado en el entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el adaptador se puede fusionar con el backbone) |
| Idiomas soportados | inglés (en) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (adapter_model.safetensors, head.safetensors) y adapter_config.json |

## Arquitectura y entrenamiento

El detector se construye sobre el backbone de LFM3-1.7B, un modelo de LiquidAI cuya arquitectura combina mecanismos de atención con convoluciones cortas en lugar de un transformer puramente atencional. Sobre ese backbone se aplica un adaptador LoRA con r=16 y alpha=32 en las proyecciones de atención, convolución corta y MLP. La clasificación se realiza con una cabeza lineal `Linear(2048, 2)` que produce logits `[human, AI]` leídos en el último token real de la secuencia; para lotes se usa padding a la izquierda de modo que la posición -1 corresponda siempre al último token válido. El adaptador se fusiona con el backbone (`merge_and_unload`) antes de la inferencia.

El entrenamiento usó los 40.559 textos de entrenamiento (balanceados) del dataset `rasbt/human-vs-ai-50k`, cuyos splits están agrupados por documento fuente para evitar fugas entre train, validación y test. Se realizaron 2 épocas con hasta 1.024 tokens por texto, batch efectivo de 16, AdamW (lr 1e-4 para LoRA, 1e-3 para la cabeza, weight decay 0,01), schedule coseno con 10 % de warmup, autocast en bf16 y gradient checkpointing. La selección del modelo se hizo por mejor accuracy de validación. El entrenamiento consumió 5,6 GB de pico en una GPU de portátil de 16 GB durante aproximadamente 11 horas. Se ajustó una temperatura de calibración de 1,007 sobre los logits de validación, lo que indica que las puntuaciones crudas ya estaban bien calibradas. El método sigue la receta de Sebastian Raschka en *Building an AI Text Detector From Scratch*.

## Capacidades

- Clasificación binaria de texto en inglés: distingue texto humano de texto generado por IA.
- Puntuación continua de 0 a 100 (probabilidad de IA) mediante softmax sobre los logits calibrados.
- Procesamiento de textos de hasta 1.024 tokens, con precisión reportada estable en todos los rangos de longitud evaluados (0-100, 100-250, 250-500, 500-1000 y 1000+ palabras).
- Inferencia por lotes con padding a la izquierda.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un clasificador, no un modelo generativo.
- No tiene capacidades multimodales (visión, audio) ni modo de pensamiento.
- Capacidad multilingüe limitada al inglés; el autor advierte de que no está evaluado en otros idiomas.

## Casos de uso

- Moderación de contenido en plataformas: integrar el clasificador como filtro previo que marque publicaciones sospechosas de ser generadas por IA antes de una revisión humana, aprovechando su bajo coste de inferencia (backbone de 1,7B con adaptador fusionado).
- Señalización en entornos educativos: detectar posibles entregas generadas automáticamente como indicio para el profesorado, nunca como prueba única de misconducta, dado que el propio autor lo desaconseja.
- Auditoría de contenidos editoriales: revisar artículos o notas de prensa recibidas de colaboradores externos para verificar la proporción de texto sintético antes de publicar.
- Investigación sobre detección de texto IA: servir como baseline reproducible (receta, dataset y configuración publicados) para comparar con otros detectores o para estudiar sesgos y robustez.
- Filtrado en pipelines de datos: descartar o etiquetar muestras generadas por IA en la construcción de corpus de entrenamiento para otros modelos, usando la puntuación como criterio de selección.
- Análisis forense de documentos: priorizar qué textos de un lote grande requieren inspección manual, dado el rendimiento reportado en textos largos (100 % de accuracy en el test para rangos de 100 a 1000+ palabras).
- Detección en foros y comunidades: marcar respuestas automatizadas o spam generado por LLM en secciones de comentarios, con la advertencia de que la precisión cae fuera de la distribución de entrenamiento.

## Benchmarks y rendimiento

| Split | Textos | Accuracy |
|---|---:|---:|
| Validación | 5.085 | 99,94 % |
| Test | 5.066 | 99,98 % |

En el test, 1 de 2.547 textos humanos fue marcado como IA y los 2.519 textos de IA fueron detectados.

| Longitud (palabras) | Textos | Accuracy |
|---|---:|---:|
| 0-100 | 1.044 | 99,9 % |
| 100-250 | 1.163 | 100,0 % |
| 250-500 | 1.246 | 100,0 % |
| 500-1000 | 951 | 100,0 % |
| 1000+ | 662 | 100,0 % |

Estos resultados son in-distribution: los textos de IA provienen de un número reducido de LLM respondiendo a prompts generados, y los textos humanos fueron escritos antes de ChatGPT.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone LFM3-1.7B en bfloat16 requiere aproximadamente 3,4 GB solo para pesos, más memoria para activaciones y contexto; el entrenamiento reportado alcanzó 5,6 GB de pico en una GPU de 16 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia en bf16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090, A10, L4). Para entrenamiento, una GPU de 16 GB es suficiente según el autor.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bf16; con cuantización del backbone (no documentada por el autor) cabría en GPUs de 4-6 GB.
- Opciones de despliegue: el autor proporciona código con `transformers`, `peft` y `safetensors`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, aunque al ser un clasificador con cabeza personalizada requeriría un wrapper propio en esos servidores.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B AI Text Detector | ~1,7B (backbone) + LoRA | 1.024 tokens | Clasificador binario sobre LFM3 | LFM Open License v1.0 | HuggingFace, demo en Spaces |
| Detectores basados en RoBERTa (p. ej. OpenAI detector, GPTZero internos) | ~125M-355M | 512 tokens | Clasificador encoder | Varía (MIT, propietaria) | HuggingFace, APIs comerciales |
| Detectores comerciales (GPTZero, Originality.ai) | no disponible | no disponible | Modelos propietarios | Propietaria | Solo API/SaaS |

No se dispone de datos de benchmarks comparativos entre este detector y alternativas en la información proporcionada; las cifras del autor no son directamente comparables con las de otros sistemas porque proceden de un único dataset in-distribution.

## Limitaciones y advertencias

- Métricas in-distribution: los textos de IA del dataset provienen de un puñado de LLM con prompts generados, y los humanos fueron escritos antes de ChatGPT. Se espera una accuracy menor con otros generadores, texto editado o parafraseado, otros idiomas y textos muy cortos (menos de ~100 palabras).
- La puntuación es la probabilidad del clasificador sobre esa distribución de datos; no prueba quién escribió un texto.
- No debe usarse de forma aislada para tomar decisiones sobre personas, como casos de misconducta académica, según advierte el propio autor.
- Solo inglés: no hay evaluación ni soporte declarado para otros idiomas.
- Riesgo de falsos positivos en texto humano que imite estilos formales o plantillas, y de falsos negativos en texto IA editado manualmente.
- Sesgos no documentados: no se reporta análisis de sesgo por dominio, registro o demografía.
- Licencia: el adaptador es derivado de LFM3-1.7B y está sujeto a la LFM Open License v1.0, que impone restricciones de uso comercial; es necesario revisar sus términos antes de desplegarlo en producción.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ameenazeemi/LFM3-1.7B-AI-Text-Detector
- Demo en Spaces: https://huggingface.co/spaces/ameenazeemi/AI-Text-Detector
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/rasbt/human-vs-ai-50k
- Metodología de referencia (Sebastian Raschka, *Building an AI Text Detector From Scratch*): no disponible como enlace en la información proporcionada
