# skamalj/signpost-d-4b

## Resumen

Signpost-D 4B es un modelo de decisión desarrollado por el usuario skamalj, un fine-tune del modelo base Qwen/Qwen3.5-4B. A diferencia de los modelos generativos convencionales, Signpost-D no produce texto: recibe un estado (un registro JSON o texto) junto con preguntas tipadas y devuelve, para cada pregunta, una distribución de probabilidad sobre las opciones disponibles. Soporta tres tipos de pregunta: `noul` (sí/no), `choice` (elección entre varias opciones) y `score` (nivel en una escala).

El modelo emplea la arquitectura del Qwen3.5-4B, conservando tanto los pesos de texto como los de visión (la torre visual permanece sin cambios), y se ha ajustado mediante LoRA con promediado de tres semillas (weight soup). Con 4.539.265.536 parámetros en fp16 y una ventana de hasta 8.192 tokens por pregunta, está pensado para servir decisiones calibradas de forma determinista mediante un único forward pass, con las probabilidades leídas directamente de los tokens de respuesta.

Su relevancia radica en que ofrece un endpoint específico (`/v1/systemone` en vLLM) para tomar decisiones estructuradas y calibradas en lugar de generar texto libre, lo que resulta útil en pipelines donde se necesita una probabilidad explícita por opción (enrutamiento, clasificación con incertidumbre, auditoría). La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3.5-4B (texto y visión; torre visual sin cambios) |
| Parametros totales | 4.539.265.536 (4,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8.192 tokens por pregunta |
| Tipos de cuantizacion | no disponible (pesos publicados en fp16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (modelo fusionado, sin adaptador necesario); adaptadores LoRA en `adapters/` |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y conserva sus pesos de texto y visión, con la torre visual intacta. Sobre esa base se aplica un fine-tune LoRA de rango 16 (α 16) sobre 200 módulos, incluidas las proyecciones de atención lineal. El entrenamiento usa una pérdida de entropía cruzada con etiquetas suaves, más 0,5 veces el error de nivel esperado en las preguntas de tipo `score`. Cada semilla se entrena durante 2 épocas con tasa de aprendizaje 1e-4, 15% de warm-up, dropout 0,05 y fp16, en aproximadamente 37 minutos por semilla en una GPU Colab G4 (RTX PRO 6000). Posteriormente se promedian los cambios de peso LoRA de tres semillas (42, 1042 y 2042) y se añade el 0,75 de esa media a los pesos base (weight soup).

Los datos de entrenamiento son íntegramente generados por el propio autor: 2.575 registros (12.274 preguntas) en 163 dominios inventados, cada uno con un estado JSON corto y cinco preguntas. La etiqueta de referencia (gold) es la media de tres jueces simulados (un operador cuidadoso, un auditor estricto y un generalista), y cada registro pasa controles de aceptación o descarte. No se empleó ninguna fila, etiqueta ni pregunta del benchmark Typed Decisions, ni se usaron sus cuatro flujos de trabajo. El formato de entrenamiento es una pregunta por secuencia, exactamente con el prompt que construye `/v1/systemone` de vLLM: estado en JSON, pregunta, opciones etiquetadas y una línea de respuesta, sin mensaje de sistema y con el modo thinking desactivado. El modelo se entrena sobre el logit del primer token de respuesta entre las etiquetas de opción. El split `train` del benchmark nunca se usó para entrenar, ajustar ni calibrar; solo se analizó una muestra para comprender las decisiones y la forma de sus distribuciones gold, información que se usó para guiar a los generadores de datos.

## Capacidades

- Respuesta a preguntas tipadas con distribución de probabilidad por opción: `noul` (sí/no), `choice` (una entre varias) y `score` (nivel en una escala).
- Decisiones calibradas en un único forward pass, sin generación de texto libre.
- Procesamiento de estado en formato JSON o texto como entrada.
- Capacidad multimodal heredada del modelo base (image-text-to-text), con torre visual sin cambios.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está diseñado para decisiones puntuales, no para razonamiento multi-paso.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidad especial: endpoint dedicado `/v1/systemone` en vLLM para servir decisiones tipadas con `raw_logprobs`.

## Casos de uso

- Enrutamiento de tickets de soporte: dado un estado con los datos del ticket, el modelo responde preguntas `choice` sobre el equipo o la cola a la que debe dirigirse, con probabilidades que permiten umbralizar y derivar casos ambiguos a revisión humana.
- Evaluación de riesgo en pedidos: con un estado JSON de un pedido (pagado, enviado, días desde el pago), responde preguntas `score` sobre la probabilidad de reclamación y preguntas `noul` sobre si el pedido va con retraso, útil para priorizar la atención al cliente.
- Auditoría de cumplimiento: dado un registro de una operación, responde preguntas `noul` sobre si cumple cada criterio normativo, con probabilidad asociada que documenta el grado de certeza de cada veredicto.
- Clasificación con incertidumbre en pipelines de datos: integrado en un proceso por lotes, asigna a cada registro una distribución sobre categorías (`choice`) y permite filtrar por confianza baja para revisión manual.
- Toma de decisiones en agentes automatizados: como componente de un sistema mayor, el agente consulta al modelo para decidir el siguiente paso (por ejemplo, `ship`, `refund` o `wait`) a partir del estado actual, sin necesidad de generar texto.
- Moderación o triaje de contenido estructurado: con un estado que describe un caso, responde preguntas `score` sobre gravedad o prioridad, proporcionando una señal calibrada para sistemas de escalado.
- Evaluación de imágenes con decisión asociada: gracias a la torre visual heredada, puede recibir entradas de imagen y texto y responder preguntas tipadas sobre ellas, aunque la model card no detalla flujos concretos para este uso.

## Benchmarks y rendimiento

Resultados en el split `test` de LocalLLaMA/typed-decisions (400 casos, 2.000 decisiones, una petición por caso, todas respondidas sin errores), servido con vLLM nightly y las flags del benchmark (`--max-model-len 8192 --max-num-seqs 8 --logprobs-mode raw_logprobs`):

| Modelo | Accuracy ↑ | KL from gold ↓ | Brier ↓ | ECE ↓ |
|---|---|---|---|---|
| Signpost-D 4B | 0,712 [0,691; 0,734] | 0,162 | 0,085 | 0,091 |
| Prior (ignora la entrada) | 0,470 | 0,347 | 0,189 | 0,088 |
| Uniform | 0,308 | 0,444 | 0,238 | 0,169 |

El intervalo del 95% es un bootstrap sobre casos.

| Tipo | n | Accuracy |
|---|---|---|
| `noul` | 600 | 0,788 |
| `choice` | 600 | 0,692 |
| `score` | 800 | 0,670 |

- Latencia: mediana de 62 ms por caso (5 preguntas) en una GPU Colab G4 (RTX PRO 6000) con vLLM en fp16.
- Predicciones: las 2.000 están en `typed_decisions_test_predictions.json` (índice de caso en el split `test`, id de pregunta, tipo, probabilidades).
- El gold es la media de tres muestras de un profesor de capacidad aproximada de 4B, por lo que estas puntuaciones miden la concordancia con ese profesor; el benchmark da la autoconsistencia del profesor como 0,735.

Selección del modelo en el split `train` (1.200 casos, nunca entrenado):

| Candidato | Accuracy / KL en `train` |
|---|---|
| seed 42 | 0,712 / 0,174 |
| seed 1042 | 0,714 / 0,171 |
| seed 2042 | 0,706 / 0,177 |
| soup de 3 semillas, α 1,0 | 0,715 / 0,168 |
| soup de 3 semillas, α 0,75 (este modelo) | 0,720 / 0,166 |

Hubo cuatro ejecuciones en `test` para este modelo y sus candidatos: dos mezclas de datos candidatas (0,7055 y 0,7105), un lote de datos posteriormente descartado (0,702) y este modelo, puntuado una vez (0,712). Todas las decisiones se tomaron primero sobre el split `train`; `test` las confirmó y nunca revirtió ninguna. Los pesos publicados se reconstruyeron a partir de los tres adaptadores y se volvieron a puntuar en `test` antes de la subida, con resultados idénticos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 9 GB para los pesos (4,5B parámetros a 2 bytes por parámetro), más overhead de activaciones y caché KV; el repo ocupa 9,5 GB.
- GPU recomendadas: RTX PRO 6000 (usada en las mediciones), A100, H100 para servicio concurrente; cualquier GPU con al menos ~12-16 GB de VRAM para fp16 en un solo flujo.
- Cabe en GPU de consumo: sí, en modelos con 16 GB o más (por ejemplo, RTX 4080/4090, RTX 5070 Ti y superiores), siempre que se ajuste la longitud de contexto y el número de secuencias.
- Opciones de despliegue: vLLM nightly (necesario para `/v1/systemone`; medido con `0.33.0rc1.dev451`). Otros motores como llama.cpp, Ollama o TGI no están documentados en la información disponible.
- Latencia y throughput: mediana de 62 ms por caso (5 preguntas) en una RTX PRO 6000 con vLLM en fp16; no se dispone de datos de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Signpost-D 4B | 4,5B | 8.192 tokens por pregunta | Decisiones tipadas con probabilidades (noul/choice/score) | Apache-2.0 | Hugging Face, vLLM nightly |
| Qwen/Qwen3.5-4B (base) | 4,5B | no disponible | Generación de texto y visión | no disponible en la información | Hugging Face |
| Prior (ignora la entrada) | n/a | n/a | Línea base del benchmark | n/a | n/a |
| Uniform | n/a | n/a | Línea base del benchmark | n/a | n/a |

No se dispone de datos de otros modelos de decisión comparables en la información proporcionada.

## Limitaciones y advertencias

- El tipo de pregunta más débil es `score` (accuracy 0,670 frente a 0,788 en `noul` y 0,692 en `choice`), por lo que las decisiones en escala deben tratarse con más cautela.
- El gold del benchmark es la media de tres muestras de un profesor de ~4B, no una verdad humana; las métricas miden concordancia con ese profesor, cuya autoconsistencia es 0,735, lo que acota el techo práctico.
- El modelo solo soporta inglés según la model card; no se documentan capacidades multilingües.
- No genera texto: no es adecuado para tareas generativas, de resumen o de conversación abierta.
- El endpoint `/v1/systemone` requiere una versión nightly reciente de vLLM; no se garantiza su funcionamiento en versiones estables.
- Los datos de entrenamiento son sintéticos y generados por LLM con jueces simulados, lo que puede introducir sesgos del generador y de los jueces, no documentados explícitamente.
- Riesgo de alucinación en el sentido de asignar probabilidades altas a opciones incorrectas cuando el estado de entrada es ambiguo o está fuera de la distribución de los 163 dominios inventados.
- No se documentan restricciones adicionales de uso comercial más allá de la licencia Apache-2.0 del modelo base.
- La calibración (ECE 0,091) es similar a la de la línea base prior (0,088), por lo que la ventaja del modelo está en accuracy y Brier, no en calibración absoluta.
- No se han publicado datos sobre cuantización ni sobre despliegue en motores distintos de vLLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skamalj/signpost-d-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset del benchmark: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Predicciones del split `test`: https://huggingface.co/skamalj/signpost-d-4b/blob/main/typed_decisions_test_predictions.json
- Adaptadores LoRA: https://huggingface.co/skamalj/signpost-d-4b/tree/main/adapters
- Registro de la fusión: https://huggingface.co/skamalj/signpost-d-4b/blob/main/merged.json
