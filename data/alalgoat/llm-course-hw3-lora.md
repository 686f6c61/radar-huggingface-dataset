# alalgoat/llm-course-hw3-lora

## Resumen

`alalgoat/llm-course-hw3-lora` es un adaptador LoRA publicado en Hugging Face por el usuario `alalgoat` como entrega del trabajo de casa numero 3 de un curso sobre PEFT (Parameter-Efficient Fine-Tuning). No se trata de un modelo base autonomo, sino de un conjunto de pesos de adaptador que se aplican sobre el modelo `OuteAI/Lite-Oute-1-300M-Instruct`, un transformer de aproximadamente 300 millones de parametros. El objetivo concreto del adaptador es la clasificacion de sentimiento de tuits en ingles, produciendo una de tres etiquetas: `negative`, `neutral` o `positive`.

El adaptador se entreno sobre la configuracion `sentiment` del dataset `cardiffnlp/tweet_eval`, con 45.615 ejemplos de entrenamiento, usando una implementacion casera de LoRA en PyTorch (no la libreria `peft`). Los adaptadores se insertaron en las proyecciones `k_proj` y `v_proj` de la atencion, con rank 8 y alpha 16. La metrica reportada por el autor es Macro F1, que pasa de 0,16 en el modelo base a 0,52 tras el ajuste fino.

Es relevante ahora como ejemplo didactico de fine-tuning eficiente de un modelo pequeno: demuestra como un adaptador de bajo rango puede multiplicar por tres el rendimiento de un modelo de 300M en una tarea de clasificacion con un solo epoch de entrenamiento. No obstante, su naturaleza es experimental y academica, no de produccion, y los resultados distan mucho del estado del arte en `tweet_eval/sentiment` (los modelos especializados superan F1 de 0,75).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (`OuteAI/Lite-Oute-1-300M-Instruct`) |
| Parametros totales | 300.031.872 (incluye pesos base y adaptadores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo contiene safetensors) |
| Idiomas soportados | ingles (tuits); modelo base multilingue segun su propia model card, no confirmado aqui |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Rank LoRA | 8 |
| Alpha LoRA | 16 |
| Modulos adaptados | `k_proj`, `v_proj` |
| Tamano del repo | 1,2 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de aproximadamente 300M de parametros. Sobre el se aplica una adaptacion LoRA escrita manualmente en PyTorch: se congelan los pesos originales y se entrenan unicamente las matrices de bajo rango inyectadas en las proyecciones de clave (`k_proj`) y valor (`v_proj`) de la atencion multi-cabeza. Los hiperparametros reportados son rank 8, alpha 16, batch size 16, learning rate 5e-4, optimizador AdamW y una sola epoca sobre 45.615 ejemplos.

La perdida es cross-entropy con enmascaramiento de los tokens del prompt (`-100`), de modo que solo los tokens de la etiqueta objetivo contribuyen al gradiente. Este detalle es importante porque convierte el modelo generativo en un clasificador de tres clases mediante prompting y ajuste supervisado. No se menciona uso de RLHF, DPO ni decodificacion especulativa; tampoco se detalla la composicion exacta del dataset mas alla de la referencia a `cardiffnlp/tweet_eval` configuracion `sentiment`.

## Capacidades

- Clasificacion de sentimiento de tuits en ingles con tres etiquetas: `negative`, `neutral`, `positive`.
- Generacion de texto residual heredada del modelo base (Lite-Oute-1-300M-Instruct), aunque no evaluada tras el ajuste.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente ni razonamiento multi-paso.
- Multilingue: no disponible; el autor limita explicitamente el uso al ingles.
- No dispone de vision, audio ni modo thinking.

## Casos de uso

- Clasificacion de sentimiento en redes sociales: el adaptador puede etiquetar tuits en ingles como positivos, neutros o negativos, integrándose en un pipeline de monitorizacion de marca o de opinion publica con un modelo de 300M que cabe en cualquier GPU consumer.
- Filtrado de comentarios en comunidades online: clasificar mensajes de usuarios para priorizar moderacion humana, aprovechando la etiqueta `negative` como senal de riesgo.
- Analisis de encuestas abiertas en ingles: procesar respuestas de texto libre en lote y agregar sentimiento por segmento demografico.
- Prototipado rapido de clasificadores: sirve como plantilla didactica para equipos que quieran replicar el flujo LoRA con `tweet_eval` o datasets analogos.
- Etiquetado asistido para anotacion humana: pre-etiquetar grandes volumenes de tuits antes de revision manual, aceptando la precision limitada (F1 0,52) como paso de pre-filtrado.
- Investigacion academica sobre PEFT: comparar implementaciones caseras de LoRA frente a librerias estandar en tareas de clasificacion con recursos limitados.

## Benchmarks y rendimiento

| Modelo | Macro F1 en `tweet_eval/sentiment` |
|---|---|
| Modelo base `OuteAI/Lite-Oute-1-300M-Instruct` | 0,16 |
| `alalgoat/llm-course-hw3-lora` (tras LoRA) | 0,52 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,6 GB para los pesos de 300M parametros, mas overhead de activaciones; en la practica menos de 2 GB.
- En cuantizacion int8 o 4-bit (si se convierte a GGUF, no disponible en el repo): por debajo de 0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien funciona en CPU para inferencia por lotes pequenos.
- Cabe sobradamente en GPU consumer, incluso en iGPU o CPU con RAM limitada.
- Opciones de despliegue: `transformers` con PyTorch (formato nativo safetensors), `llama.cpp`/`Ollama` solo si se exporta a GGUF (no disponible), `vLLM`/`TGI` compatibles con transformers pero sobredimensionados para este tamano.
- Latencia y throughput estimados: no disponibles; con 300M parametros se espera throughput alto (cientos de peticiones por segundo en GPU consumer) pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro F1 (`tweet_eval/sentiment`) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `alalgoat/llm-course-hw3-lora` | 300M (base) + LoRA | no disponible | 0,52 | no disponible | Hugging Face |
| `cardiffnlp/twitter-roberta-base-sentiment-latest` | 125M | 512 tokens | ~0,72-0,75 (referencia publica) | MIT (RobERTa base) | Hugging Face |
| `OuteAI/Lite-Oute-1-300M-Instruct` | 300M | no disponible | 0,16 (sin adaptador) | no disponible | Hugging Face |

La comparativa muestra que el adaptador esta muy por debajo de clasificadores especializados como los de `cardiffnlp`, que son la referencia practica para esta tarea. Su interes es didactico, no competitivo.

## Limitaciones y advertencias

- Rendimiento limitado: Macro F1 de 0,52 implica que casi la mitad de las predicciones ponderadas fallan; no es apto para produccion sin revision humana.
- Entrenado con una sola epoca y 45.615 ejemplos; probablemente infraentrenado respecto a lo alcanzable con mas epocas o hiperparametros mejor ajustados.
- Restringido a ingles y al dominio de tuits; el autor advierte explicitamente sobre errores en sarcasmo, ambiguedad y textos fuera del dominio.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que verificar la licencia del modelo base y del dataset.
- Riesgo de alucinacion y de etiquetas fuera del conjunto esperado si se usa fuera del formato de prompt de entrenamiento.
- La implementacion LoRA es casera, no la libreria `peft`; puede haber diferencias de compatibilidad con herramientas estandar.
- No hay model card en castellano ni evaluacion multilingue; no usar en produccion en espanol.
- Repo de 1,2 GB con 0 descargas y 0 likes: sin validacion comunitaria, tratar como experimento academico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alalgoat/llm-course-hw3-lora
- Modelo base: https://huggingface.co/OuteAI/Lite-Oute-1-300M-Instruct
- Dataset: https://huggingface.co/datasets/cardiffnlp/tweet_eval
- Referencia de clasificadores de sentimiento: https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment-latest
