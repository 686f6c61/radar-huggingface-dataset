# KucLab/Barist.6

## Resumen

Barist.6 es un clasificador de seguridad de contenido de 903.552 parámetros entrenado desde cero por KucLab, distribuido como un transformer decoder-only adaptado a clasificación de secuencias (`LlamaForSequenceClassification`). Su función es doble: decidir si un texto es seguro o inseguro (clasificación binaria) y, simultáneamente, activar hasta 10 categorías de riesgo en un esquema multi-etiqueta (multi-label). Está pensado como filtro de moderación ligero que se ejecuta en CPU, sin necesidad de GPU, con un checkpoint de apenas 3,6 MB.

El modelo forma parte de una línea que empezó como Censer (versiones 1 a 9) y continuó como Barist; según la model card, Barist.1 equivale a Censer.9 más una tercera ronda de revisión adversarial, y las versiones posteriores (Barist.2, Barist.3 y esta Barist.6) acumulan correcciones de rondas de revisión adicionales centradas en falsos positivos en checo, falsos negativos en CSAM y autolesiones, y umbrales por idioma. Soporta ocho idiomas declarados (en, cs, de, es, fr, it, pt, ru), aunque el propio autor documenta que el ucraniano no está soportado.

Su relevancia práctica está en el nicho de la moderación de bajo coste: un modelo de menos de un millón de parámetros que cabe en cualquier entorno, se carga con `transformers` sin `trust_remote_code` y ofrece rutas de inferencia con pre-filtro determinista y umbrales calibrados por temperatura. No compite en capacidad general con LLMs, sino en latencia, coste y despliegue en el edge para pipelines de moderación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only adaptado a clasificación de secuencias (`LlamaForSequenceClassification`, `problem_type: multi_label_classification`) |
| Parámetros totales | 903.552 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens nativos, con ruta de chunked-max para documentos largos |
| Tipos de cuantización | no disponible (el checkpoint de 3,6 MB ya se ejecuta en CPU sin cuantización) |
| Idiomas soportados | en, cs, de, es, fr, it, pt, ru (ucraniano documentado como NO soportado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX; librería `transformers` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 903.552 parámetros entrenado desde cero (no es un fine-tuning de un modelo preexistente), reutilizado como cabecera de clasificación multi-etiqueta. Emite una puntuación binaria safe/unsafe más 10 categorías de seguridad, con activación sigmoide por etiqueta (el pipeline aplica sigmoid automáticamente y requiere `top_k=-1` para devolver todas las etiquetas). El contexto nativo es de 4096 tokens, y para documentos más largos existe una ruta de agregación por chunks con máximo (chunked-max).

El entrenamiento combina múltiples datasets de seguridad y moderación: nvidia/Aegis-AI-Content-Safety-Dataset-1.0, jigsaw-toxic-comment-classification-challenge, google/civil_comments, PKU-Alignment/BeaverTails, lmsys/toxic-chat, databricks/databricks-dolly-15k, Hate-speech-CNERG/hatexplain e Intuit-GenSRF/jigsaw-multilingual-train-unique. La model card describe un proceso iterativo de revisiones adversariales con fases de aumento de datos (pares benignos y paráfrasis inseguras), ponderación de la clase must-catch, y calibración de temperatura. Entre las innovaciones técnicas destacan: umbrales por idioma ajustados con la restricción de FPR ≤ 5 % y recall ≥ 80 % con tope de 0,75; un pre-filtro determinista de expresiones regulares (bloqueo duro de CSAM, derivación de autolesiones a recursos de apoyo); y un bloqueo por categoría que fuerza `unsafe` cuando `sexual_abuse` o `self_harm` superan 0,3.

## Capacidades

- Clasificación binaria safe/unsafe de texto.
- Clasificación multi-etiqueta en 10 categorías de seguridad (el autor menciona explícitamente `sexual_abuse` y `self_harm` entre ellas; el resto no se detalla en la información disponible).
- Procesamiento de documentos largos mediante contexto nativo de 4096 tokens y ruta chunked-max.
- Pre-filtro determinista con expresiones regulares para casos must-catch (CSAM, amenazas directas, autolesiones con derivación a línea de apoyo).
- Umbrales por idioma y calibración de temperatura de las puntuaciones.
- Multilingüe en ocho idiomas (en, cs, de, es, fr, it, pt, ru); ucraniano no soportado.
- Ejecución en CPU sin GPU.
- Integración directa con `transformers` (`pipeline("text-classification")`) y compatibilidad con text-embeddings-inference y endpoints.
- No soporta tool calling, agentes ni generación de texto: es exclusivamente un clasificador.

## Casos de uso

- Moderación de comentarios en foros y comunidades: el modelo clasifica cada mensaje entrante en milisegundos en CPU y activa alertas por categoría, lo que permite filtrar en tiempo real sin coste de GPU en despliegues pequeños o autoalojados.
- Filtro previo en pipelines de LLM: colocar Barist.6 antes de un modelo generativo para bloquear prompts inseguros (CSAM, amenazas, autolesiones) y reducir el riesgo de que el LLM produzca contenido dañino, aprovechando su latencia mínima.
- Moderación multilingüe en plataformas europeas: cubre en, cs, de, es, fr, it, pt y ru con umbrales calibrados por idioma, adecuado para productos con audiencias en varios países sin desplegar un modelo por lengua.
- Análisis de documentos largos: gracias a los 4096 tokens de contexto y la ruta chunked-max, puede revisar artículos, hilos completos o transcripciones y agregar la puntuación de riesgo por fragmentos.
- Triaje de autolesiones con derivación a recursos: el pre-filtro y la categoría `self_harm` permiten marcar mensajes y enrutarlos a protocolos de apoyo (el autor cita la Linka bezpečí checa) en lugar de bloquearlos sin más.
- Despliegue en el edge o en dispositivos sin GPU: con 3,6 MB de checkpoint y ejecución en CPU, encaja en entornos con recursos muy limitados, contenedores pequeños o funciones serverless.
- Filtrado de datasets de entrenamiento: puede usarse para limpiar corpus antes de entrenar otros modelos, etiquetando contenido tóxico o inseguro a gran escala con coste computacional bajo.

## Benchmarks y rendimiento

Los datos publicados en la model card son métricas internas del proyecto, no benchmarks estándar comparables entre modelos. Se recogen a continuación tal como aparecen:

| Métrica | Valor reportado |
|---|---|
| F1 en test @0.5 | 0,8238 |
| Held-out must-catch (modelo solo, raw @0.5) | 51/75 |
| Held-out must-catch (con temperatura + umbrales por idioma vía CLI) | 55/75 |
| Censer.9 en el mismo held-out (raw) | 57/75 |
| FPR en checo, held-out (Barist.1) | 6,5 % (15/230) |
| FPR en checo, held-out (Barist.2) | 10,0 % (23/230) |
| F1 ucraniano textdetox @0.5 | ≈ 0,10 (no soportado) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el checkpoint ocupa 3,6 MB y está diseñado para ejecutarse en CPU.
- GPU recomendadas: no aplica; cualquier GPU sirve para acelerar, pero no es necesaria.
- Cabe en cualquier GPU consumer y en entornos sin GPU (contenedores, serverless, edge).
- Opciones de despliegue: `transformers` (pipeline nativo), text-embeddings-inference, endpoints compatibles; el autor menciona un script de inferencia propio (`censer.py`) con pre-filtro y umbrales.
- Latencia y throughput: no disponibles de forma numérica en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos en CPU, pero no se confirma con cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables de otros clasificadores de seguridad en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo de contexto cualitativo:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Barist.6 | 903.552 | 4096 | Apache 2.0 | Clasificador multi-etiqueta, CPU-only, 8 idiomas |
| Censer.9 (predecesor) | no disponible | no disponible | no disponible | Mismo linaje; el autor reporta 57/75 en held-out must-catch raw frente a 51/75 de Barist.6 |
| Alternativas de moderación basadas en LLM | miles de millones | variable | variable | No se dispone de datos concretos en la información proporcionada |

## Limitaciones y advertencias

- El propio autor documenta falsos negativos en el conjunto held-out: 51/75 detecciones en crudo y 55/75 con la ruta completa, lo que implica que una fracción relevante de casos must-catch no se detecta.
- FPR en checo por encima del objetivo: 6,5 % en Barist.1 y 10,0 % en Barist.2, frente a un objetivo de ≤ 3 %.
- El ucraniano no está soportado (F1 ≈ 0,10 en textdetox), pese a que el modelo procesa texto en ese idioma y puede producir falsos positivos.
- Los umbrales por idioma están actualmente todos a 0,5, es decir, efectivamente desactivados según la model card.
- La model card mezcla nombres de versión (Barist.4 en el título, referencias a Barist.1, Barist.2, Barist.3 y Barist.6), lo que dificulta saber con exactitud qué correcciones incluye esta revisión concreta.
- Riesgo de alucinación no aplica como tal (no genera texto), pero sí de clasificación errónea en lenguaje figurado, slang, noticias o contextos benignos que usan vocabulario sensible.
- El pre-filtro por expresiones regulares puede sobreebloquear si no se revisa; el autor ha ido corrigiendo falsos positivos en sucesivas versiones.
- Licencia Apache 2.0 permite uso comercial, pero al ser un filtro de seguridad conviene validarlo con datos propios antes de producción, dado el historial de regresiones entre versiones.
- No es un modelo generativo: no sirve para tareas de razonamiento, código o conversación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KucLab/Barist.6
- Repositorio GitHub del proyecto (referenciado en la model card): no disponible como URL concreta en la información proporcionada
- Paper: no disponible
- Demo: no disponible
