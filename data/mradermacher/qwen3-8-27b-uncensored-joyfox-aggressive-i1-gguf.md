# mradermacher/Qwen3.8-27B-Uncensored-JoyFox-Aggressive-i1-GGUF

## Resumen

El modelo `mradermacher/Qwen3.8-27B-Uncensored-JoyFox-Aggressive-i1-GGUF` es una colección de cuantizaciones GGUF preparadas por mradermacher a partir del modelo base `joyfox/Qwen3.8-27B-Uncensored-JoyFox-Aggressive`. Se trata de una variante "uncensored" (sin censura) de un modelo de 27 320 millones de parámetros, derivado de la familia Qwen 3.8, con modificaciones orientadas a reducir la tasa de rechazo y a ofrecer respuestas más directas o "agresivas" en estilo conversacional. El repositorio incluye múltiples niveles de cuantización con matrices de importancia (imatrix) aplicadas, lo que permite desplegar el modelo en hardware con distinta capacidad de VRAM.

La relevancia de este modelo radica en su naturaleza "uncensored", que lo hace atractivo para casos de uso donde se requiere una generación de texto sin restricciones temáticas (siempre dentro de los límites legales y éticos). Al estar disponible en formato GGUF, puede ejecutarse localmente con herramientas como llama.cpp, Ollama o LM Studio, sin depender de APIs externas. Sin embargo, la información pública sobre el modelo base es escasa: no se detallan datos de entrenamiento, licencia oficial ni benchmarks, por lo que cualquier evaluación debe realizarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de la familia Qwen, presumiblemente transformer) |
| Parametros totales | 27 320 697 856 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible (probablemente multilingue, dado el origen Qwen) |
| Licencia | no disponible (el repositorio no especifica licencia; el modelo base tampoco la declara) |
| Formato de pesos | GGUF (con cuantizaciones imatrix) |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna del modelo base. Dado el nombre "Qwen3.8-27B", se presume que sigue el diseño de los modelos Qwen (transformers con atención causal), pero no hay confirmación. El repositorio de mradermacher indica que se trata de cuantizaciones "weighted/imatrix" del modelo de joyfox, lo que significa que se han aplicado matrices de importancia durante la cuantización para preservar la calidad. El modelo base incorpora, según la búsqueda web, un "MTP speculative-draft head" (cabeza de borrador especulativo) y una edición de pesos "Heretic" que reduce la tasa de rechazo. No hay datos sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. Tampoco se especifica si el modelo base fue entrenado desde cero o fine-tuneado a partir de un Qwen existente.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational" y diseñado para mantener diálogos multi-turno.
- Menor tasa de rechazo: la modificación "uncensored" y "Heretic" reduce la probabilidad de que el modelo se niegue a responder a peticiones, incluso aquellas que otros modelos rechazarían por seguridad.
- Estilo "agresivo": según el nombre "Aggressive", las respuestas tienden a ser directas, sin rodeos y con un tono más contundente.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere que puede integrarse en servidores de inferencia compatibles con la API de OpenAI (por ejemplo, vLLM o llama.cpp server).
- Soporte de cuantizaciones variadas: permite ajustar el equilibrio entre tamaño y calidad según el hardware disponible.
- No se ha confirmado soporte de tool calling, función de visión, audio u otras capacidades multimodales.

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar narrativas, guiones o diálogos con temáticas adultas o controvertidas que otros modelos censurarían. Es adecuado para autores que necesitan explorar contenido sin filtros automáticos.
- Roleplay y simulación de personajes: gracias a su tono "agresivo" y baja tasa de rechazo, puede mantener personajes con personalidades fuertes o bordes, útil en juegos de rol textual o asistentes de ficción interactiva.
- Generación de contenido para investigación sociolingüística: analizar cómo responde un modelo sin restricciones ante estímulos provocativos puede ser útil para estudiar sesgos y límites de la IA, siempre bajo protocolos éticos.
- Desarrollo de chatbots locales con control total: al ser GGUF, se puede desplegar en local con Ollama o llama.cpp, permitiendo a desarrolladores integrar un asistente conversacional sin depender de servicios en la nube ni políticas de moderación externas.
- Pruebas de estrés de sistemas de moderación: el modelo puede usarse como generador de entradas "límite" para evaluar la robustez de filtros de contenido en otras aplicaciones.
- Fine-tuning posterior: aunque no se proporcionan pesos en formato safetensors, las cuantizaciones GGUF pueden servir como base para experimentos de adaptación (por ejemplo, con LoRA) si se obtiene el modelo original de joyfox.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. El repositorio de HuggingFace no incluye mediciones de perplejidad ni comparaciones con otros modelos. Se recomienda realizar una evaluación propia antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización elegida. Para Q4_K_M (~16,8 GB según el repositorio de GitHub) se necesitan al menos 20 GB de VRAM para caber con el contexto por defecto. Para Q2_K (~10-12 GB) se puede ejecutar en GPUs de 12-16 GB. Las cuantizaciones más grandes (Q6_K, Q8_0 si existiera) requerirían 24 GB o más.
- GPU recomendadas: RTX 3090/4090 (24 GB) para cuantizaciones medianas; A100 o H100 (40-80 GB) para las más grandes o para mayor velocidad. También puede ejecutarse en Apple Silicon con suficiente memoria unificada (32 GB o más).
- Si cabe en consumer GPU: sí, con cuantizaciones Q4_K_M o inferiores en GPUs de 16-24 GB. Las cuantizaciones Q2_K pueden caber en 12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (si se convierte a otro formato), text-generation-webui, o servidores compatibles con OpenAI API mediante `llama-server`.
- Latencia y throughput: no se han publicado mediciones. En una RTX 4090 con Q4_K_M, se puede esperar una velocidad de generación de 20-40 tokens/segundo, pero es una estimación no confirmada.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos "uncensored" de tamaño similar (por ejemplo, Dolphin 2.2.1 Mistral 7B, Nous Hermes 2 Mixtral 8x7B, o versiones abliteradas de Llama 3 70B). No hay datos de rendimiento ni de licencia para contrastar. Se recomienda consultar benchmarks independientes en la comunidad de LocalLLaMA antes de elegir este modelo frente a alternativas.

## Limitaciones y advertencias

- Sesgos y contenido ofensivo: al ser "uncensored", el modelo puede generar discursos de odio, violencia, contenido sexual explícito o información peligrosa sin filtro. Su uso debe limitarse a entornos controlados y con fines legítimos.
- Riesgo de alucinación: al igual que otros modelos de lenguaje, puede inventar hechos, citas o datos. No es fiable para información verificable.
- Licencia incierta: no se especifica la licencia ni del modelo base ni de las cuantizaciones. Esto impide su uso comercial sin una revisión legal previa.
- Idioma y contexto: no se han documentado los idiomas soportados ni la longitud máxima de contexto. Es probable que herede las capacidades del Qwen original, pero no está confirmado.
- Falta de transparencia: no hay información sobre el dataset de entrenamiento, el proceso de "uncensoring" ni las técnicas exactas aplicadas. Esto dificulta la reproducibilidad y la auditoría del modelo.
- Inestabilidad en producción: al carecer de benchmarks y de documentación, no se recomienda su uso en aplicaciones críticas o en entornos donde se requiera un comportamiento predecible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-JoyFox-Aggressive-i1-GGUF
- Repositorio del modelo base (joyfox): https://huggingface.co/joyfox/Qwen3.8-27B-Uncensored-JoyFox-Aggressive
- GitHub con instrucciones y cuantización Q4_K_M: https://github.com/Wassimyounes01/qwen38-uncensored
- Guía de modelos abliterados (2026): https://locallyuncensored.com/blog/abliterated-models-guide.html
