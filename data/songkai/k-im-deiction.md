# Songkai/K-IM-Deiction

## Resumen

K-IM-Deiction es un modelo de clasificación de texto desarrollado por Songkai (usuario de Hugging Face) que actúa como clasificador de decisiones estructuradas para mensajes de chat de grupo. Se construye sobre el backbone Qwen/Qwen3.5-0.8B mediante un ajuste fino con LoRA, y su función no es generar texto, sino emitir siete juicios calibrados en una sola pasada hacia delante: categoría de 7 clases, sentimiento, puntuaciones de importancia, urgencia e intensidad, probabilidad de requerir atención y probabilidad de contener una tarea pendiente.

El modelo responde a un problema de economía de la atención: los chats de grupo empresarial generan más mensajes de los que cualquier persona puede leer, y el recurso escaso no es la información sino la atención. En lugar de invocar un modelo grande para leer cada ventana de mensajes (a ~1.5k tokens por ventana), este especialista de 0.8B realiza los juicios rutinarios en unos 40 ms sobre hardware local, de modo que solo las ventanas marcadas requieren una revisión más profunda.

El repositorio se distribuye en dos formas intercambiables: los pesos fusionados en la raíz (listos para ejecutar sin descargar el modelo base ni configurar PEFT) y un adaptador LoRA en la carpeta `adapter/` (102.4 MB) para cargar sobre el backbone Qwen3.5-0.8B propio. Ambas formas comparten las siete cabezas de decisión y los ficheros de calibración, y producen los mismos juicios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) con cabezas de clasificación múltiple; ajuste fino mediante LoRA fusionado |
| Parametros totales | 852.985.920 (~0.85B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (evaluado con ventanas de ≤512 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bf16; adaptador LoRA de 102.4 MB) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos fusionados en la raíz + adaptador LoRA en `adapter/`) |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Tamano del repositorio | 1.83 GB (1.71 GB pesos fusionados + 0.10 GB adaptador) |
| Pipeline | text-classification |
| Fecha de creacion | 2026-11-05 |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 853 millones de parámetros, sobre el que se aplica un ajuste fino con LoRA. La innovación estructural es la sustitución de la generación de texto por siete cabezas de decisión que se evalúan en una única pasada hacia delante: una cabeza de clasificación de 7 categorías, una de sentimiento, tres de regresión (importancia, urgencia, intensidad) y dos binarias (needs-attention y has-todo). El repositorio incluye además ficheros de calibración que ajustan las probabilidades de salida.

El autor describe el modelo como un especialista destilado de un profesor de mayor tamaño, etiquetado bajo una especificación de etiquetado completa (la misma que se usa en el prompt del baseline DeepSeek de la evaluación). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO. El dominio de entrenamiento es el chat de grupo empresarial chino. La forma fusionada se verificó contra la forma de adaptador sobre 16 ventanas de validación: la mayor diferencia absoluta en los logits de las siete cabezas fue de 0.037 (redondeo bf16), por lo que ambas formas son equivalentes en salida dentro de la precisión bf16.

## Capacidades

- Clasificación de categoría en 7 clases (help / task / decision / info / discussion, entre otras según la especificación de etiquetado del autor).
- Análisis de sentimiento con una precisión del 89.1% en el conjunto de validación.
- Puntuaciones de importancia, urgencia e intensidad (regresión calibrada).
- Probabilidad calibrada de needs-attention (AUC 0.801, ECE 0.065).
- Probabilidad calibrada de has-todo, es decir, de que la ventana contenga una tarea pendiente (AUC 0.965, ECE 0.034).
- Emisión de los siete juicios en una sola pasada hacia delante, sin generación de texto.
- Procesamiento de ventanas de mensajes con contexto reciente más el mensaje objetivo.
- Ejecución totalmente local, sin llamadas a API externas.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni generación de texto; es un modelo de clasificación, no un modelo generativo de propósito general.

## Casos de uso

- Triaje de atención en IM empresarial: ordenar las ventanas entrantes de cada persona por la probabilidad calibrada de needs-attention y mostrar solo las primeras de cada día, funcionando como un presupuesto de atención en lugar de un flujo continuo de notificaciones no leídas.
- Minería de tareas pendientes: las ventanas con alta probabilidad de has-todo se convierten en candidatos a lista de tareas con un responsable y una fecha límite a confirmar, evitando que las acciones se diluyan en el historial del chat.
- Enrutado y archivado: la cabeza de categoría clasifica las ventanas en flujos de ayuda, tarea, decisión, información y discusión para paneles, resúmenes y recuperación.
- Colas de prioridad: el producto importancia × urgencia ordena listas de seguimiento y comprobaciones de escalado.
- Monitorización del sentimiento del equipo: el sentimiento y la intensidad se agregan en un pulso diario, de modo que los picos de intensidad negativa son visibles sin leer los chats en bruto.
- Prefiltro delante de modelos grandes: en un pipeline con LLM, este modelo criba cada ventana con un coste marginal cercano a cero y solo las ventanas marcadas se envían a un modelo grande para lectura profunda o redacción de respuestas.
- Despliegue en local o en el borde: al ejecutarse íntegramente en la red propia, es apto para entornos donde el contenido de los chats no puede salir de la infraestructura.

## Benchmarks y rendimiento

Resultados medidos sobre un conjunto de validación congelado de 258 ventanas, en la forma de adaptador (base + LoRA):

| Metrica | Valor |
|---|---|
| Latencia mediana por ventana | 40.3 ms (p90 44.9 ms; RTX 4090 D, batch 1, ≤512 tokens, 7 cabezas en una pasada) |
| Category macro-F1 (7 clases) | 0.637 |
| Category macro-F1 (clases con soporte ≥10) | 0.744 |
| needs-attention AUC | 0.801 |
| needs-attention ECE | 0.065 (calibrado) |
| has-todo AUC | 0.965 |
| has-todo ECE | 0.034 (calibrado) |
| Sentiment accuracy | 89.1% |
| Importance dentro de ±1 | 100% |
| Urgency dentro de ±1 | 99.6% |

Comparación con baseline de modelo grande (DeepSeek `deepseek-chat` vía API, zero-shot, temperatura 0, mismo conjunto de 258 ventanas y mismas etiquetas de referencia):

| Metrica | K-IM-Deiction (0.8B) | DeepSeek zero-shot | Diferencia |
|---|---|---|---|
| Cumplimiento de formato de salida | 100% (cabezas estructuradas, por construcción) | 100.0% (258/258 JSON valido) | Empate |
| Category macro-F1 (7 clases) | 0.637 | no disponible (dato truncado en la información) | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1.7 GB en bf16 para los pesos fusionados, más el overhead de activaciones y del runtime; cabe holgadamente en GPUs de consumo.
- GPU recomendadas: RTX 4090 D (medición de referencia del autor, 40.3 ms de latencia mediana); cualquier GPU consumer con ≥4 GB de VRAM debería poder ejecutarlo en bf16.
- Cabe en GPU consumer: sí, en tarjetas de gama media y alta con al menos 4 GB de VRAM.
- Opciones de despliegue: el modelo es un clasificador con cabezas personalizadas, por lo que requiere cargar los pesos y los ficheros de calibración del repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: 40.3 ms de mediana y 44.9 ms de p90 por ventana en RTX 4090 D con batch 1 y ventanas de ≤512 tokens; el throughput escala con el tamaño de batch, aunque no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| K-IM-Deiction | ~0.85B | no disponible (evaluado ≤512 tokens) | Clasificación de decisiones en chat de grupo (7 cabezas) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0.8B | no disponible | Generación de texto general | no disponible en la información | Hugging Face |
| DeepSeek (`deepseek-chat` API) | no disponible | no disponible | Generación de texto general; usado como baseline zero-shot para los mismos juicios | propietaria (API) | API |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa se limita a la tabla de la sección anterior.

## Limitaciones y advertencias

- El modelo emite juicios, no texto: no sirve para comprensión lectora abierta, resumen ni redacción de respuestas; debe combinarse con un modelo grande para esas tareas.
- Dominio limitado al chat de grupo empresarial chino; no se garantiza su comportamiento en otros idiomas, plataformas o culturas de chat.
- No puede juzgar contenido que no ve: adjuntos, imágenes, enlaces y documentos citados entran solo como tokens de relleno en el texto de la ventana.
- La probabilidad de needs-attention es un juicio destilado y parcialmente subjetivo que opera cerca de su techo de ruido de etiquetas; debe usarse para ordenar y filtrar, manteniendo a humanos o a un modelo grande sobre la minoría marcada.
- No debe ser el único árbitro de decisiones consecuentes.
- La categoría macro-F1 de 0.637 en 7 clases es moderada; el rendimiento mejora en clases con soporte suficiente (0.744).
- Riesgo de sesgos y de alucinación no documentado en la información disponible.
- Licencia Apache 2.0, que permite uso comercial con las obligaciones habituales de atribución y aviso de licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Songkai/K-IM-Deiction
- Perfil del autor: https://huggingface.co/Songkai
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
