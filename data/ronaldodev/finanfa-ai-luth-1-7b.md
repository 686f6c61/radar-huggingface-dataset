# Ronaldodev/finanfa-ai-luth-1.7b

## Resumen

FINANFA AI Luth-1.7B es un modelo de lenguaje especializado en el conocimiento de Benín (historia, reinos, política, instituciones, cultura, vodún, geografía, economía, lenguas nacionales y vida cotidiana), desarrollado por Ronaldodev (AWADEME Ronaldo) como parte de la serie FINANFA AI. Se trata de un fine-tuning LoRA sobre el checkpoint kurakurai/Luth-1.7B-Instruct, que a su vez es un ajuste instructivo en francés del modelo Qwen3-1.7B de Alibaba. El objetivo principal es superar el límite de capacidad de síntesis y agregación observado en la versión anterior de 0.6B, que tendía a fabricar detalles o degenerar en bucles de repetición en tareas de síntesis multi-fuente dentro de un pipeline RAG.

El modelo cuenta con 1.720.574.976 parámetros, licencia Apache 2.0 y está orientado exclusivamente al francés. Se distribuye en formato safetensors mediante la librería PEFT (adaptador LoRA fusionado). El entrenamiento se realizó sobre un dataset privado curado manualmente con 15.564 conversaciones válidas tras reequilibrado, abarcando 71 categorías temáticas. Es una versión experimental: no se han publicado métricas automáticas de exactitud factual, solo la pérdida en el conjunto de test (0,8343) y una evaluación cualitativa manual sobre 384 preguntas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer decoder-only, fine-tuning LoRA sobre Luth-1.7B-Instruct) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 33.000 tokens (contexto del modelo base Luth-1.7B-Instruct); el fine-tuning se entrenó con secuencias de 1024 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors en precisión completa; cuantización GGUF/AWQ no publicada) |
| Idiomas soportados | frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA fusionado) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3 de su base kurakurai/Luth-1.7B-Instruct, un transformer decoder-only con atención causal estándar y mecanismos de Qwen3 (incluyendo soporte de function calling en el modelo base). El fine-tuning se realizó mediante LoRA con r=32, alpha=32 y dropout=0, aplicado a los módulos q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. El adaptador se fusionó con el checkpoint base mediante merge_and_unload, dando lugar a un modelo denso de 1.72B parámetros.

El entrenamiento se llevó a cabo sobre el dataset privado Ronaldodev/finanfa-ai-dataset, que tras limpieza de duplicados exactos contenía 20.802 conversaciones, reducidas a 15.564 tras un reequilibrado que limitó la categoría decoupage_territorial. El split fue de 90/5/5 (train 24.611, validación 779, test 779) estratificado por categoría, con sobre-muestreo en el conjunto de entrenamiento (10.605 ejemplos adicionales). Se aplicaron 3 épocas con early stopping (patience=3) sobre eval_loss, batch efectivo de 16, learning rate de 0,0001 (deliberadamente bajo por ser una continuación de un checkpoint ya instruido) y longitud máxima de secuencia de 1024 tokens. El entrenamiento se ejecutó en una GPU T4 (Kaggle/Colab).

## Capacidades

- Generación de texto conversacional en francés especializado en conocimiento de Benín: historia, reinos (Dahomey, Abomey), figuras políticas (Béhanzin, Houégbadja, Agadja, Ghézo, Glèlè), las Amazonas del Dahomey, cultura vodún, geografía, economía, lenguas nacionales y vida cotidiana.
- Respuesta a preguntas de extracción directa y síntesis multi-fuente sobre el dominio beninés, con instrucción explícita en el system prompt de declarar incertidumbre ante datos dudosos (fechas, cifras, acusaciones).
- Soporte de conversación multi-turno en formato system/user/assistant.
- Capacidad de function calling heredada del modelo base Luth-1.7B-Instruct (según la ficha de Antbase), aunque no se ha verificado en este fine-tuning.
- No dispone de capacidades multimodales (visión, audio) ni de modo de razonamiento explícito tipo thinking mode.
- Multilingüismo limitado: el modelo está entrenado exclusivamente en francés; no se reportan capacidades en otras lenguas.

## Casos de uso

- Asistente de información turística y cultural sobre Benín: responder a preguntas de visitantes sobre sitios históricos, reinos precoloniales, festivales vodún y tradiciones, con respuestas contextualizadas en francés.
- Chatbot institucional para administraciones beninesas: proporcionar información sobre la organización territorial, instituciones políticas y procedimientos administrativos, con la ventaja de un modelo entrenado específicamente en el dominio local.
- Sistema RAG de documentación histórica: integrar el modelo en un pipeline de recuperación aumentada para sintetizar información de múltiples fuentes sobre el reino de Dahomey, mitigando la tendencia a la alucinación que mostraba la versión 0.6B.
- Herramienta educativa para escuelas y universidades: generar explicaciones sobre personajes históricos (Béhanzin, Ghézo, Glèlè), eventos y estructuras sociales del Benín precolonial y contemporáneo.
- Asistente de atención al ciudadano en servicios públicos: resolver consultas frecuentes sobre trámites, geografía local y economía, con un tono conversacional adaptado al francés hablado en Benín.
- Base para investigación académica en NLP de bajos recursos: servir como punto de partida para estudios sobre fine-tuning LoRA en dominios específicos con datos limitados, comparando el rendimiento frente a modelos de menor tamaño (0.6B) y de arquitecturas alternativas (LFM2-1.2B).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La única métrica reportada es la pérdida (loss) sobre el conjunto de test retenido: 0,8343. Se realizó una evaluación cualitativa manual comparando el modelo base Luth-1.7B-Instruct frente a FINANFA-Luth-1.7B sobre un banco de 384 preguntas, cuyos ejemplos se muestran en la model card, pero sin métricas automáticas de exactitud factual. No se dispone de comparativas cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1.72B parámetros en FP32 (aproximadamente 6,9 GB de pesos). En FP16/BF16 ocuparía unos 3,4 GB. Con cuantización INT8 bajaría a ~1,8 GB y en INT4 a ~1 GB, aunque no se publican pesos cuantizados.
- GPU recomendadas: una GPU con al menos 8 GB de VRAM para FP16 (por ejemplo, RTX 3070/4060, T4, V100). Para FP32 se necesitarían 8-12 GB. En consumer GPU de gama baja (6 GB) sería posible con cuantización INT4/INT8 generada manualmente.
- El autor indica que el modelo es ~2,9 veces más pesado que la versión Qwen3-0.6B, con una latencia CPU probablemente significativamente mayor en el Space gratuito de Hugging Face; se recomienda medir antes de desplegar en producción.
- Opciones de despliegue: al ser un modelo safetensors estándar con arquitectura Qwen3, puede servirse con vLLM, TGI o llama.cpp (tras convertir a GGUF). También es compatible con Ollama si se empaqueta. El proyecto original usa un Space de Hugging Face.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Formato |
|---|---|---|---|---|---|
| Ronaldodev/finanfa-ai-luth-1.7b | 1,72B | 33K (base) | Benín, francés | Apache 2.0 | safetensors |
| Ronaldodev/finanfa-ai-luth-0.6b | ~0,6B | no disponible | Benín, francés | Apache 2.0 | safetensors |
| Ronaldodev/finanfa-ai-lfm2.5-230m | 230M | no disponible | Benín, francés | Apache 2.0 | safetensors |
| Ronaldodev/finanfa-ai-luth-lfm2-1.2b | 1,2B | no disponible | Benín, francés | Apache 2.0 | safetensors |
| kurakurai/Luth-1.7B-Instruct (base) | 1,72B | 33K | Francés general | Apache 2.0 | safetensors |

El modelo se posiciona como la variante más grande de la familia FINANFA AI, diseñada para superar las limitaciones de síntesis de las versiones menores. Frente a su base Luth-1.7B-Instruct, añade conocimiento específico de Benín mediante LoRA, manteniendo la misma arquitectura y licencia. No se dispone de comparaciones de rendimiento cuantitativas entre estas variantes.

## Limitaciones y advertencias

- Riesgo de alucinación: la versión anterior (Luth-0.6B) mostró tendencia a fabricar detalles o degenerar en bucles de repetición en tareas de síntesis multi-fuente, incluso con contexto RAG correcto. Este modelo busca reducir ese límite, pero la eficacia real no está verificada con métricas automáticas de exactitud factual.
- Sin métricas de evaluación objetiva: solo se reporta la pérdida en test (0,8343) y una evaluación cualitativa manual. No hay benchmarks de exactitud, lo que dificulta valorar su fiabilidad en producción.
- Dominio limitado al francés: no soporta otros idiomas; las respuestas en lenguas nacionales de Benín (fon, yoruba, baatonu, etc.) no están cubiertas.
- Longitud de secuencia de entrenamiento corta (1024 tokens): aunque el modelo base soporta 33K tokens, el fine-tuning no ha sido entrenado para contextos largos; el rendimiento en ventanas extendidas no está garantizado.
- Posible solapamiento de datos: el dataset se deduplicó solo sobre duplicados exactos; pueden existir cuasi-duplicados semánticos entre train/validation/test, lo que puede inflar las métricas de validación.
- Latencia en CPU: el modelo es ~2,9 veces más pesado que la versión 0.6B; el despliegue en CPU puede resultar lento para aplicaciones interactivas.
- Licencia Apache 2.0: permite uso comercial sin restricciones, pero no se incluyen garantías; el autor advierte de que es una versión experimental.
- Dataset privado: el conjunto de entrenamiento no es público, lo que limita la reproducibilidad y la auditoría externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ronaldodev/finanfa-ai-luth-1.7b
- Dataset (privado): https://huggingface.co/datasets/Ronaldodev/finanfa-ai-dataset
- Modelo base: https://huggingface.co/kurakurai/Luth-1.7B-Instruct
- Versión de referencia 0.2 (Qwen2.5-0.5B): https://huggingface.co/Ronaldodev/finanfa-ai-0.2
- Versión LFM2.5-230M: https://huggingface.co/Ronaldodev/finanfa-ai-lfm2.5-230m
- Versión Luth-LFM2-1.2B: https://huggingface.co/Ronaldodev/finanfa-ai-luth-lfm2-1.2b
- Ficha de Luth 1.7B Instruct en Antbase: https://antbase.ai/models/luth-1-7b-instruct
