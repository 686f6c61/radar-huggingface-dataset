# Beko2210/statim-decide-en-large

## Resumen

Statim Decide EN Large es un modelo de decisión de tipo encoder, desarrollado por Beko2210, que responde preguntas tipadas sobre un texto: elección entre categorías, puntuación ordinal y respuesta sí/no. No es un modelo generativo, sino un clasificador que devuelve decisiones calibradas en una sola pasada forward. Está afinado a partir de `convaiinnovations/laya`, un encoder ModernBERT-large, y cuenta con 421.293.827 parámetros (~421 M). Su versión es la 0.5.0 y está pensado para ejecutarse con Statim, un motor nativo en C++ que no requiere Python en tiempo de ejecución.

El modelo se distribuye en formato GGUF con dos cuantizaciones (f32 de referencia y q8_0 recomendada para CPU) y un checkpoint en formato Laya orientado a fine-tuning. Su idioma declarado es únicamente el inglés. El repositorio ocupa 2,9 GB e incluye los pesos, sumas de verificación SHA256 y el material de evaluación.

La relevancia actual del modelo radica en su enfoque: sustituye llamadas a un LLM generativo por un encoder pequeño que produce decisiones estructuradas en una sola pasada, lo que reduce coste y latencia en tareas de enrutamiento, triaje y clasificación. Los resultados declarados por el autor muestran mejoras notables sobre el checkpoint base en las suites de entrenamiento (por ejemplo, 0,7680 frente a 0,3610 en typed-decisions) y un comportamiento estable en 54 suites de evaluación: 11 mejoras significativas, 43 dentro del ruido y 0 regresiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder, familia ModernBERT-large (fine-tune de `convaiinnovations/laya`) |
| Parametros totales | 421.293.827 (~421 M) |
| Longitud de contexto | no disponible (no se especifica en la model card; el modelo base es un encoder ModernBERT-large) |
| Tipos de cuantizacion | f32 (referencia, exacta en GPU) y q8_0 (recomendada para CPU, 4 veces mas pequena) |
| Idiomas soportados | ingles (etiqueta `en`) |
| Licencia | `statim-weights` (license: other); terminos en LICENSE-MODEL.md |
| Formato de pesos | GGUF (`statim-decide-en-large-f32.gguf`, `statim-decide-en-large-q8_0.gguf`), checkpoint en formato Laya (`checkpoint/`, 0,85 GB); el repositorio incluye tambien la etiqueta `safetensors` |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de la familia ModernBERT-large, heredado del checkpoint `convaiinnovations/laya`. El modelo no genera texto: realiza una pasada forward y emite respuestas tipadas definidas por el usuario mediante tres modalidades: `choice` (elección entre categorías con criterios descritos), `score` (puntuación ordinal a partir de una lista de criterios ordenados) y `noul` (pregunta booleana de sí/no). Los criterios y las instrucciones se proporcionan en la propia petición, lo que permite plantear clasificaciones zero-shot sin reentrenar.

No se detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset. Sí se enumeran los conjuntos de datos utilizados: `PolyAI/banking77`, `AmazonScience/massive`, `LocalLLaMA/typed-decisions`, `tasksource/tasksource-jev-typed-decisions`, `nvidia/Nemotron-Safety-Guard-Dataset-v3`, `l3cube-pune/IndicGuard`, `PolyAI/minds14` y `benayas/snips`. Tampoco se especifica si hubo RLHF o DPO, algo poco habitual en un encoder de clasificación. La innovación destacable es el motor Statim: inferencia nativa en C++ sobre GGUF, con un endpoint HTTP que acepta varias preguntas tipadas sobre un mismo estado y devuelve todas las decisiones desde una única pasada.

## Capacidades

- Clasificación de texto y clasificación zero-shot: asigna un texto a categorías definidas en la petición mediante criterios en lenguaje natural.
- Preguntas de elección (`choice`): selecciona una opción entre varias con sus descripciones.
- Preguntas de puntuación (`score`): devuelve una puntuación ordinal a partir de una lista de criterios ordenados.
- Preguntas booleanas (`noul`): responde sí/no a una condición explícita.
- Decisión multivariable en una sola llamada: el endpoint `/v1/systemone` acepta un estado (asunto y cuerpo) y varias preguntas simultáneas.
- Ejecución en CPU o GPU sin Python en tiempo de ejecución, mediante el binario de Statim.
- Capacidades multilingües: no disponible; el modelo declara únicamente inglés, pese a que parte de los datos de entrenamiento son multilingües.
- Tool calling / function calling: no disponible (el modelo no es generativo y no se documenta soporte de herramientas).
- Agentes y razonamiento multi-paso: no disponible.
- Visión, audio o modo de razonamiento explícito: no disponibles.

## Casos de uso

- Triaje de tickets de soporte: con un único forward se puede asignar el departamento (`choice`), estimar la urgencia (`score`) y detectar si el usuario pide un reembolso (`noul`). Es el escenario que documenta la propia model card con el ejemplo de un cargo duplicado en la factura #4411.
- Enrutamiento de intenciones en asistentes conversacionales: los 0,9280 de accuracy en Banking77 (77 intenciones planteadas en una sola pregunta) lo hacen adecuado para dirigir consultas bancarias a la cola o al flujo correcto sin desplegar un LLM.
- Moderación de contenido en inglés: los 0,7800 en HateCheck permiten usarlo como prefiltro de mensajes tóxicos antes de una revisión humana.
- Análisis de sentimiento en reseñas y encuestas: 0,6733 en el conjunto de sentimiento en inglés, suficiente para segmentación aproximada de opiniones a gran escala con coste muy bajo por elemento.
- Clasificación temática de noticias y contenidos: 0,9390 en AG News en modo zero-shot, lo que permite etiquetar flujos de artículos sin entrenamiento específico.
- Filtrado y priorización en canales de correo o formularios: combinación de `score` para prioridad y `choice` para categoría, ejecutándose en CPU en el mismo servidor de aplicación.
- Despliegue en entornos sin Python o embebidos: al usar el binario nativo de Statim y un GGUF q8_0 de 0,45 GB, puede integrarse en servicios con restricciones de dependencias o en hardware modesto.
- Fine-tuning de dominio sobre el checkpoint Laya: el archivo `checkpoint/` (0,85 GB) está pensado para reentrenar con datos propios y validar después con la puerta de no-regresión de Statim.

## Benchmarks y rendimiento

Todos los resultados proceden del `model-index` de la model card y están marcados como `verified: false`, es decir, son declarados por el autor. El protocolo de evaluación es la puerta de no-regresión de Statim (`tools/finetune/gate.py`) sobre datos de test no usados en la selección del modelo; en 54 suites held-out el resultado agregado fue de 11 mejoras significativas, 43 dentro del ruido y 0 regresiones.

| Suite | Rol | Este modelo (accuracy) | Checkpoint base (accuracy) | Protocolo |
|---|---|---|---|---|
| typed-decisions | entrenado | 0,7680 | 0,3610 | test split, primeras 2.000 decisiones |
| Banking77 | entrenado | 0,9280 | 0,5500 | test split, primeras 2.000 filas, las 77 intenciones en una sola pregunta |
| MASSIVE intents (ingles) | entrenado | 0,8667 | 0,5333 | 150 filas estratificadas con semilla |
| AG News | held out | 0,9390 | 0,9425 | zero-shot, primeras 2.000 filas de test |
| DAIR Emotion | held out | 0,5880 | 0,5945 | zero-shot, primeras 2.000 filas de test |
| HWU64 intents | held out | 0,8333 | 0,6067 | ingles, 150 filas sin solapamiento con MASSIVE |
| SIB-200 topics | held out | 0,7133 | 0,7267 | ingles, 150 filas, zero-shot |
| Sentiment | held out | 0,6733 | 0,6200 | ingles, 150 filas, zero-shot |
| HateCheck | held out | 0,7800 | no disponible en la informacion proporcionada | ingles, 150 filas, zero-shot |
| Belebele reading | held out | 0,4533 | no disponible en la informacion proporcionada | ingles, 150 filas, zero-shot |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7-2 GB con el archivo f32 (1,58 GB de pesos) y aproximadamente 0,6-0,8 GB con el q8_0 (0,45 GB de pesos), sumando activaciones y buffers de runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria. El autor indica que el f32 es exacto en GPU; no se especifican modelos concretos como A100, H100 o RTX 4090 porque el modelo es lo bastante pequeno para no necesitarlos.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en gráficas integradas; el q8_0 está pensado explícitamente para CPU.
- Opciones de despliegue: el binario de Statim (motor nativo en C++), con `./statim serve -m english=models/statim-decide-en-large-q8_0.gguf --port 8080`, endpoint `/v1/systemone` y playground web en `http://127.0.0.1:8080/`. Los pesos están en GGUF, pero no se confirma en la información disponible la compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La model card indica únicamente una sola pasada forward y ejecución en CPU o GPU, sin cifras de latencia ni de elementos por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Formato y disponibilidad |
|---|---|---|---|---|---|
| statim-decide-en-large | 421 M | no disponible | statim-weights | ingles | GGUF (f32, q8_0) y checkpoint Laya; 0 descargas y 0 likes en el momento de la consulta |
| convaiinnovations/laya (checkpoint base) | no disponible | no disponible | no disponible | no disponible | disponible en HuggingFace; es el punto de partida del fine-tune |
| Otros clasificadores zero-shot basados en encoders (ModernBERT, DeBERTa) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa disponible se limita al checkpoint base: frente a él, el modelo mejora de forma marcada en las suites de entrenamiento (typed-decisions, Banking77 y MASSIVE) y se mantiene dentro del ruido en las suites held-out, con descensos mínimos en AG News (0,9390 frente a 0,9425), DAIR Emotion (0,5880 frente a 0,5945) y SIB-200 (0,7133 frente a 0,7267). No se han publicado en la información disponible comparaciones con otros encoders de clasificación zero-shot.

## Limitaciones y advertencias

- Métricas no verificadas: todos los resultados del `model-index` están marcados como `verified: false` y proceden del propio autor, sin reproducción independiente.
- Modelo no generativo: no produce texto libre ni conversación; solo devuelve decisiones tipadas (`choice`, `score`, `noul`). No sirve como sustituto de un LLM en generación.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso.
- Idioma: solo inglés declarado, aunque entre los datos de entrenamiento figuren conjuntos multilingües como `l3cube-pune/IndicGuard`. No hay evaluación publicada en castellano ni en otras lenguas.
- Rendimiento bajo en algunas tareas: 0,5880 en DAIR Emotion y 0,4533 en Belebele reading, esta última muy próxima al comportamiento esperable en una tarea de comprensión lectora.
- En las suites held-out no mejora al checkpoint base en todos los casos: AG News, DAIR Emotion y SIB-200 quedan ligeramente por debajo, aunque el autor las considera dentro del ruido estadístico.
- Dependencia de los criterios: al ser un clasificador guiado por instrucciones y criterios en la petición, la calidad de las etiquetas depende de cómo se redacten estas; no hay garantía de calibración fuera de la distribución evaluada.
- Licencia no estándar (`statim-weights`): es una licencia propia con `license: other`. No se especifican en la información disponible los términos de uso comercial; es imprescindible revisar LICENSE-MODEL.md antes de usarlo en producción.
- Adopción muy baja: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación por parte de la comunidad.
- Fecha de creación registrada como 2026-09-27, posterior a la fecha de actualización indicada y anómala; conviene verificar la vigencia del repositorio.
- Tamaño del repositorio: 2,9 GB, ya que incluye simultáneamente el f32, el q8_0 y el checkpoint de fine-tuning.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Beko2210/statim-decide-en-large
- Licencia del modelo: https://huggingface.co/Beko2210/statim-decide-en-large/blob/main/LICENSE-MODEL.md
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio de Statim: https://github.com/BEKO2210/statim
- Binarios de Statim: https://github.com/BEKO2210/statim/releases
- Referencia de la API: https://github.com/BEKO2210/statim/blob/main/docs/API.md
- Puerta de evaluación de fine-tuning: https://github.com/BEKO2210/statim/blob/main/tools/finetune/gate.py
