# inferenceprince/laya-onnx

## Resumen

Laya ONNX (fp16) es la exportación a formato ONNX del modelo convaiinnovations/laya, publicada por el usuario inferenceprince. No es un modelo generativo: recibe un estado (texto, correo, ticket, JSON) junto con preguntas tipadas y sus opciones, y devuelve una distribución calibrada por pregunta en una única pasada hacia delante. No hay muestreo, de modo que la respuesta es siempre una de las opciones suministradas por quien invoca el modelo.

El repositorio distribuye el grafo de cómputo (`model.onnx`, 3,3 MB), los pesos en fp16 (`model.onnx.data`, 842,6 MB), el tokenizador sin modificar (3,6 MB) y un fichero `rl_agent_config.json` con los parámetros de calibración. A partir del tamaño de los pesos fp16 puede estimarse un orden de magnitud de unos 421 millones de parámetros, cifra no confirmada explícitamente por el autor. La ventana de contexto es de 512 tokens, con un presupuesto separado de 192 tokens para la cabeza de opciones.

Su relevancia práctica está en el despliegue: al serializar la arquitectura en ONNX, el modelo se ejecuta bajo ONNX Runtime sin PyTorch instalado, en CPU, GPU o navegador. El autor reporta un arranque en frío de 3–5 s frente a los 25–35 s de la versión PyTorch en un Intel i5-14400F, lo que lo hace apto para enrutado de decisiones de baja latencia y para entornos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la estructura no está documentada; el tokenizador emplea tokens especiales `[CLS]`, `[SEP]` y `[MASK]` al estilo de un encoder tipo BERT) |
| Parámetros totales | Aproximadamente 421 M, estimados a partir de los 842,6 MB de pesos fp16; no confirmado por el autor |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (`max_len`); presupuesto de cabeza de 192 tokens (`head_max_len`) y 48 tokens máximo por opción |
| Tipos de cuantización | El repositorio distribuye pesos fp16; no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data` en fp16); tokenizador en formato `tokenizers` |
| Entradas del grafo | `input_ids`, `attention_mask`, `marker_pos`, `marker_mask`, `qtype` |
| Salidas del grafo | `logits`, `act_logits` |
| Tipos de pregunta (`qtype`) | 0 = choice, 1 = score, 2 = noul |
| Tamaño del repositorio | 0,8 GB |
| Pipeline declarado | `text-classification` |
| Modelo base | convaiinnovations/laya |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna ni el proceso de entrenamiento. Lo que sí se describe es el contrato de inferencia: el grafo recibe cinco tensores y devuelve dos salidas. Cada opción de una pregunta se representa con su propio token `[MASK]`, cuya posición se pasa en `marker_pos` (array int64 de longitud igual o superior al número de opciones) y se marca como válida en `marker_mask` (booleano). El tokenizador construye el prompt con el patrón `[CLS] choice question: <pregunta> [SEP] [MASK] etiqueta: descripción ... [SEP] <texto a analizar> [SEP]`, y el modelo puntúa la posición de cada `[MASK]`. Es un esquema de clasificación con opciones dinámicas, no una decodificación autorregresiva.

El elemento diferencial es la calibración. El grafo devuelve logits crudos y el fichero `rl_agent_config.json` contiene temperaturas ajustadas por tipo de pregunta y por número de opciones (agrupadas en los tramos 2, 3-5, 6-10 y 11+). Dividir los logits por esa temperatura antes del softmax es un paso obligatorio para que las probabilidades resultantes sean significativas, según indica el autor. El nombre del fichero de configuración y las etiquetas del repositorio (`system-one`, `calibrated-decisions`, `routing`) apuntan a un ajuste mediante aprendizaje por refuerzo, pero no se publican datos sobre el conjunto de entrenamiento, el número de tokens, la composición del corpus ni si hubo RLHF o DPO. El segundo tensor de salida, `act_logits`, aparece en la firma del grafo sin que su función esté documentada en la información disponible.

## Capacidades

- Clasificación determinista con conjunto de opciones cerrado: la respuesta es siempre una de las opciones proporcionadas, sin muestreo ni generación libre.
- Enrutado de decisiones: asignación de un estado a una categoría entre varias (por ejemplo, equipo responsable de un ticket).
- Preguntas tipadas: modo `choice` (elección entre opciones con descripción), modo `score` (puntuación) y modo `noul` (sin etiquetas, función no detallada en la documentación).
- Batching de preguntas en una sola pasada: las filas son independientes, de modo que varias preguntas pueden compartir cómputo aportando a cada una su propio `marker_pos`, `marker_mask` y `qtype`.
- Salida probabilística calibrada: devuelve una distribución completa por pregunta, no solo la clase ganadora.
- Ejecución sin PyTorch: compatible con ONNX Runtime en CPU, GPU y navegador.
- Multilingüe: no, únicamente inglés.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado de forma nativa; la salida puede alimentar, eso sí, la lógica de enrutado de un agente externo.
- Generación de texto: no aplica, el modelo no es generativo.

## Casos de uso

- Enrutado de tickets de soporte: dado el texto de una incidencia y las opciones `billing`, `technical` y `sales` con sus descripciones, el modelo devuelve la distribución de probabilidad por equipo. Es el caso que el autor documenta con un ejemplo real que arroja 0,9696 para `billing`.
- Triaje de bandeja de entrada: cada correo entrante se clasifica contra un conjunto de etiquetas definidas por el equipo (soporte, facturación, comercial), aprovechando el batching para procesar lotes de mensajes en una sola pasada.
- Detección de intención en asistentes conversacionales: el turno del usuario se mapea a una intención predefinida antes de derivar la conversación al flujo correspondiente.
- Moderación y clasificación de contenido: con `qtype = 1` (score) o `choice`, se puede etiquetar texto según políticas internas, con la ventaja de que la salida siempre cae dentro de las categorías definidas.
- Extracción de decisiones en pipelines de datos JSON: como el modelo acepta estados en formato JSON y devuelve una distribución por pregunta, encaja en procesos ETL donde hay que decidir una categoría por registro de forma reproducible.
- Despliegue en el navegador o en el borde: al ejecutarse bajo ONNX Runtime sin dependencias de framework, puede integrarse en aplicaciones web o en dispositivos con CPU modesta, sin enviar los datos a un servidor.
- Puntuación de relevancia o calidad: con el modo `score` puede asignarse un valor comparativo a candidatos o respuestas dentro de un sistema de evaluación mayor.
- Servicio de clasificación de baja latencia en CPU: el arranque de 3–5 s en frío permite usarlo en funciones serverless o contenedores efímeros donde cargar PyTorch resultaría prohibitivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo de rendimiento es la comparación de arranque en frío medida por el autor sobre un Intel i5-14400F (6 núcleos de rendimiento y 4 de eficiencia), en CPU y desde un proceso en frío:

| Métrica | PyTorch | Esta build ONNX |
|---|---|---|
| Carga hasta la primera respuesta | 25–35 s | 3–5 s |

No hay datos publicados de latencia por inferencia en régimen estable, throughput, consumo de memoria en ejecución ni comparaciones con otros clasificadores.

## Requisitos de hardware

- Pesos en fp16 de 842,6 MB, más el grafo de 3,3 MB: menos de 1 GB de VRAM solo para pesos. Con activaciones y buffers de tokenización, un presupuesto de 1,5–2 GB es holgado.
- Cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con memoria compartida.
- No requiere A100 ni H100; usarlas sería desproporcionado para esta carga.
- Funciona en CPU únicamente (`CPUExecutionProvider`), que es el modo que documenta el autor. El arranque medido en un i5-14400F es de 3–5 s desde proceso en frío.
- Proveedores de ejecución de ONNX Runtime: CPU, CUDA, TensorRT y ejecución en navegador mediante la variante web.
- No se documentan opciones de despliegue con vLLM, llama.cpp u Ollama, que no aplican a un modelo no generativo en formato ONNX.
- Latencia y throughput por inferencia: no disponibles.

## Comparativa con modelos similares

La información disponible solo permite comparar con el modelo base del que deriva esta exportación. No se dispone de datos de otros clasificadores alternativos en la documentación proporcionada.

| Modelo | Formato | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| inferenceprince/laya-onnx | ONNX fp16 | ~421 M (estimado) | 512 tokens | Apache 2.0 | Ejecutable con ONNX Runtime, sin PyTorch; arranque en frío de 3–5 s |
| convaiinnovations/laya (base) | safetensors fp16 | ~421 M (estimado, mismos tensores) | No disponible | No disponible | Requiere PyTorch; no serializa la arquitectura, que reside en el código Python de los autores; arranque en frío de 25–35 s |
| Otras alternativas de clasificación | No disponible | No disponible | No disponible | No disponible | No se han identificado modelos comparables en la información disponible |

## Limitaciones y advertencias

- Modelo no generativo: no puede responder preguntas abiertas ni producir texto libre. Toda salida queda restringida al conjunto de opciones suministrado.
- Solo inglés: no hay soporte multilingüe declarado, y no se documenta su comportamiento con texto en otros idiomas.
- Ventana de contexto de 512 tokens compartida entre la pregunta, las opciones y el texto analizado. Estados largos se truncan.
- Las opciones deben caber en el presupuesto de cabeza de 192 tokens y cada opción está limitada a 48 tokens. El truncado es silencioso, de modo que etiquetas largas pueden recortarse sin aviso; el autor recomienda mantener las preguntas de tipo `choice` por debajo de unas 20 opciones.
- El paso de división por la temperatura es obligatorio: usar los logits crudos directamente produce probabilidades sin sentido.
- `marker_pos` debe ser un array int64 de longitud igual o superior al número de opciones y `marker_mask` debe valer `True` solo en las posiciones reales; en batching hay que rellenar ambos correctamente.
- No se han publicado evaluaciones de sesgo, robustez ni alucinación. No aplica el concepto de alucinación generativa, pero sí el riesgo de clasificaciones erróneas con confianza alta en dominios fuera de distribución.
- Adopción prácticamente nula: 0 descargas y 1 like en el momento de la consulta, lo que implica ausencia de validación por parte de terceros.
- Licencia Apache 2.0 en este repositorio, que permite uso comercial; no obstante, la licencia del modelo base convaiinnovations/laya no se especifica en la información disponible y conviene verificarla antes de un despliegue comercial.
- La función de la salida `act_logits` y el significado exacto del modo `qtype = 2` (`noul`) no están documentados.

## Enlaces

- Repositorio del modelo: https://huggingface.co/inferenceprince/laya-onnx
- Modelo base: https://huggingface.co/convaiinnovations/laya
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo: los resultados se limitaron a páginas del portal MSN sin relación con la ficha. No se dispone de papers, blogs, repositorios auxiliares ni demostraciones adicionales.
