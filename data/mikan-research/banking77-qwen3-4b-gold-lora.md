# mikan-research/banking77-qwen3-4b-gold-lora

## Resumen

El modelo `mikan-research/banking77-qwen3-4b-gold-lora` es un adaptador LoRA sobre el modelo base Qwen3-4B, desarrollado por mikan-research, especializado en clasificación de intenciones para mensajes de banca online dentro del conjunto de datos Banking77. No es un modelo de propósito general, sino un ajuste fino estrecho que convierte un LLM de 4.000 millones de parámetros en un clasificador de 77 intenciones bancarias con una precisión del 94,0% en el conjunto de test.

El adaptador forma parte de Mikan, un pipeline de destilación que traslada el comportamiento de un modelo profesor grande (Qwen3-30B-A3B-Instruct-2507-FP8 en configuración de 10 ejemplos) a un modelo estudiante pequeño, y valida la no inferioridad del estudiante con un margen preregistrado de 2 puntos. El resultado es llamativo: el estudiante supera al profesor en 8,3 puntos de precisión, con un intervalo de confianza del 95% de [-9,6, -7,1] en bootstrap pareado.

El modelo es relevante ahora porque demuestra que un adaptador LoRA de apenas 0,1 GB entrenado en 40 minutos sobre una única GPU Tesla T4 puede superar a un modelo profesor mucho mayor en una tarea concreta de clasificación, con una validación estadística formal. La licencia Apache 2.0 y el formato PEFT facilitan su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B) con adaptador LoRA (r=16, alpha=32) sobre todas las proyecciones lineales |
| Parametros totales | 4.000 millones (modelo base Qwen3-4B); el adaptador LoRA es de 0,1 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B; no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones de Qwen3-4B) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B, un transformer decoder-only de 4.000 millones de parámetros. La configuración LoRA utiliza rango 16, alpha 32 y se aplica a todas las proyecciones lineales del modelo base. El entrenamiento se realizó con pérdida calculada únicamente sobre la completion (la etiqueta de intención), no sobre el prompt, lo que concentra el ajuste en la tarea de clasificación.

Los datos de entrenamiento son 8.222 mensajes del split de entrenamiento de Banking77 (PolyAI, CC-BY-4.0) con sus etiquetas ground-truth. Se entrenó durante 3 épocas con learning rate 0,0002, schedule cosine, batch 16, precisión fp16 y AdamW de 8 bits, usando Unsloth 2026.11.12 y TRL 1.19.0 sobre una única Tesla T4 durante 40 minutos. El checkpoint final (época 3 de 3) se seleccionó sobre un split de validación reservado, y el split de test se predijo una sola vez. El profesor utilizado para la comparación es Qwen3-30B-A3B-Instruct-2507-FP8 en configuración de 10 ejemplos (10-shot).

## Capacidades

- Clasificación de intenciones bancarias: asigna un mensaje de cliente de banca online a exactamente una de las 77 intenciones de Banking77.
- Generación de texto restringida: responde con la etiqueta de intención únicamente, sin explicaciones ni listas de etiquetas en el prompt.
- Modo sin razonamiento (thinking off): el prompt de uso desactiva el modo de pensamiento de Qwen3 mediante `enable_thinking=False`.
- Conversación de un solo turno: el prompt de sistema y el mensaje de usuario se procesan mediante la plantilla de chat de Qwen3.
- Tasa de etiquetas válidas del 99,8% en el split de test, lo que indica que el modelo rara vez genera una salida fuera del conjunto de etiquetas.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo específico para este adaptador.

## Casos de uso

- Enrutamiento automático de tickets en atención al cliente bancaria: el modelo clasifica cada mensaje entrante en una de las 77 intenciones (por ejemplo, "tarjeta no recibida" o "cargo no reconocido") y lo dirige al equipo correspondiente; su precisión del 94,0% en test lo hace adecuado para triaje de alto volumen.
- Clasificación en tiempo real de mensajes de chat en banca móvil: al ser un adaptador sobre un modelo de 4.000 millones de parámetros, puede desplegarse en infraestructura modesta y responder con pocos tokens de salida (max_new_tokens=24 en el ejemplo), lo que reduce la latencia por consulta.
- Etiquetado asistido de datos para entrenamiento: el modelo puede preetiquetar grandes volúmenes de mensajes bancarios no anotados, que después se revisan manualmente, aprovechando su tasa de etiquetas válidas del 99,8%.
- Detección de intenciones en sistemas de FAQ y auto-respuesta: la etiqueta predicha selecciona la respuesta predefinida o el artículo de ayuda correspondiente, sin necesidad de generar texto libre.
- Monitorización de motivos de contacto: clasificar los mensajes de los clientes permite agregar estadísticas por intención y detectar picos de incidencias (por ejemplo, fallos de tarjeta o transferencias).
- Validación de pipelines de destilación: el adaptador sirve como referencia reproducible para equipos que quieran replicar el pipeline Mikan y comparar la no inferioridad de un estudiante pequeño frente a un profesor grande en una tarea estrecha.
- Filtrado previo en sistemas de moderación o compliance: la clasificación de intención permite identificar mensajes que requieren revisión por motivos regulatorios antes de pasar a un agente humano.

## Benchmarks y rendimiento

Resultados en el split de test de Banking77 (3.080 elementos, ground truth):

| Modelo | Accuracy |
|---|---|
| Este adaptador (Qwen3-4B + LoRA) | 94,0% |
| Profesor (Qwen3-30B-A3B-Instruct-2507-FP8, 10-shot) | 85,6% |

Diferencia profesor − estudiante: -8,3 puntos, con intervalo de confianza del 95% por bootstrap pareado de [-9,6, -7,1]. El margen de no inferioridad preregistrado era δ = 2 puntos: PASS. Tasa de etiquetas válidas: 99,8%. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base Qwen3-4B en fp16 requiere aproximadamente 8 GB de VRAM, y el adaptador LoRA añade una fracción mínima (0,1 GB en disco).
- GPU recomendadas: el adaptador se entrenó en una única Tesla T4, lo que indica que la inferencia es viable en GPUs de gama media; para producción se recomiendan A100, H100 o RTX 4090 según el volumen.
- Cabe en GPU de consumo: sí, el modelo base Qwen3-4B en cuantización de 4 bits cabe en GPUs de consumo con 8 GB o más de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090).
- Opciones de despliegue: PEFT + Transformers (como en el ejemplo de la model card); no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI para este adaptador, aunque el modelo base Qwen3-4B es compatible con estas herramientas.
- Latencia y throughput estimados: no disponibles; el entrenamiento completo requirió 40 minutos en una Tesla T4 para 3 épocas sobre 8.222 ejemplos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy Banking77 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen3-4B + LoRA) | 4.000 M (base) | no disponible | 94,0% | Apache 2.0 | Hugging Face (PEFT) |
| Profesor Qwen3-30B-A3B-Instruct-2507-FP8 | 30.000 M (MoE) | no disponible | 85,6% (10-shot) | no disponible en la informacion | no disponible en la informacion |
| Otros adaptadores Banking77 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse únicamente con mensajes de banca online de Banking77, el modelo puede heredar los sesgos de ese corpus.
- Riesgo de alucinación: aunque la tarea es de clasificación cerrada, el modelo podría generar etiquetas fuera del conjunto de 77 intenciones en casos límite; la tasa de etiquetas válidas del 99,8% indica que ocurre en aproximadamente 6 de cada 3.080 elementos.
- Limitaciones de contexto o idioma: no se especifican los idiomas soportados; Banking77 está compuesto por mensajes en inglés, por lo que el rendimiento en otros idiomas no está validado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3-4B y del dataset Banking77 (CC-BY-4.0) para el uso combinado.
- Caveat para producción: el adaptador está especializado exclusivamente en clasificación de intenciones bancarias; no debe usarse como modelo de propósito general ni para tareas fuera de dominio.
- El prompt de uso requiere desactivar el modo de pensamiento (`enable_thinking=False`); si se activa, el comportamiento y la precisión pueden degradarse.
- El checkpoint se seleccionó sobre un split de validación y el test se predijo una sola vez, lo que reduce el riesgo de sobreajuste al test, pero los resultados provienen de un único conjunto de datos.

## Enlaces

- Hugging Face: https://huggingface.co/mikan-research/banking77-qwen3-4b-gold-lora
- Repositorio Mikan: https://github.com/mikan-research/mikan
- Dataset Banking77 (PolyAI): https://huggingface.co/datasets/PolyAI/banking77
- Dataset de destilación: https://huggingface.co/datasets/mikan-research/banking77-distill
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Paper Banking77: Casanueva et al., 2020, "Efficient Intent Detection with Dual Sentence Encoders" (referenciado en la model card)
