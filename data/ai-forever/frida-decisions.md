# ai-forever/FRIDA-Decisions

## Resumen

FRIDA-Decisions es un modelo encoder derivado de ai-forever/FRIDA (arquitectura T5, 823 millones de parámetros) desarrollado por el equipo УЭСМО de SberAI. No es un modelo generativo: su función es tomar decisiones estructuradas sobre texto en ruso (y parcialmente en inglés) en una sola pasada del encoder. Concretamente, permite elegir una entre K opciones, situar un texto en una escala ordinal, responder sí/no o clasificar candidatos por relevancia, devolviendo siempre una de las opciones declaradas junto con su confianza.

La innovación principal es que el conjunto de etiquetas se define en tiempo de inferencia como texto dentro de la propia petición (JSON), de modo que cambiar el catálogo de etiquetas no requiere reentrenar el modelo. Elimina por completo la generación autoregresiva y el parseo de salidas: no hay tokens de salida que decodificar, lo que reduce la latencia y elimina los fallos de formato típicos de los LLM en tareas de clasificación y enrutado.

Es relevante ahora porque ofrece una alternativa ligera y desplegable en GPU de consumo para tareas de enrutado de intenciones, guardrails y reranking, con un rendimiento en el benchmark razvilka (0,893) prácticamente idéntico al de una API comercial (TypeSafe Jev, 0,897) y superior al de los modelos abiertos evaluados por el autor. Incluye builds ONNX int8 para CPU y MLX para Apple Silicon, además de un servidor compatible con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 encoder (transformer encoder-only), basado en ai-forever/FRIDA |
| Parametros totales | 823.401.216 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 2048 tokens en el servidor vLLM (`--max-model-len 2048`); longitud máxima nativa no especificada |
| Tipos de cuantizacion | bf16 (GPU), int8 ONNX (pesos int8 y activaciones int8 por token, CPU), MLX (Apple Silicon) |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX, MLX |

## Arquitectura y entrenamiento

El modelo parte de ai-forever/FRIDA, un encoder T5 de 823 millones de parámetros, y se afina (finetune) para la tarea de decisión estructurada. La entrada combina el texto a evaluar con la definición textual de las preguntas y sus opciones (tipo `choice`, `score`, `noul` o ranking), todo empaquetado en una única secuencia; el encoder procesa el texto una sola vez y las opciones de todas las preguntas comparten esa misma secuencia. Una caché de estado permite que una pregunta de seguimiento sobre un texto ya leído cueste únicamente sus propios tokens.

El modelo no genera tokens: produce directamente la opción seleccionada y su confianza, lo que evita el parseo de salidas y los errores de formato. El autor no detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; estos datos deben considerarse no disponibles. La innovación técnica destacable es el empaquetado de opciones en una sola secuencia (packing) y la caché de estado, que reducen el coste de catálogos grandes: un catálogo de 243 intenciones se resuelve en 0,44 s frente a 4,65 s con una secuencia por opción.

## Capacidades

- Clasificación de intención y enrutado: elección de una opción entre K definidas en la petición.
- Clasificación zero-shot: las etiquetas se declaran como texto, sin reentrenamiento.
- Puntuación ordinal: colocación de un texto en una escala definida por el usuario (tipo `score`).
- Decisión binaria sí/no (tipo `noul`) con criterios textuales para cada valor.
- Reranking de candidatos.
- Guardrails: filtrado de spam, contenido no deseado o violaciones de política mediante criterios declarativos.
- Procesamiento de múltiples preguntas sobre un mismo texto en una sola pasada, con caché de estado para preguntas de seguimiento.
- Salida con confianza por respuesta, sin tokens generados ni parseo.
- Capacidades multilingües limitadas a ruso e inglés.

## Casos de uso

- Enrutado de tickets de soporte: el modelo clasifica cada mensaje entrante en categorías como login, pago o entrega declaradas en un JSON, con latencias de 25-45 ms por petición en una RTX 5060 Ti, lo que permite procesar colas de atención al cliente en tiempo real.
- Guardrails en producción: detección de spam, solicitudes fraudulentas o contenido fuera de política mediante preguntas binarias con criterios textuales, sin necesidad de mantener un clasificador entrenado por cada regla nueva.
- Triaje de urgencia: uso del tipo `score` para situar cada incidencia en una escala (baja, media, alta) y priorizar la cola de atención según la confianza devuelta.
- Clasificación de intenciones a gran escala: con empaquetado y caché de estado, un catálogo de 243 intenciones se resuelve en 0,44 s, adecuado para asistentes conversacionales con taxonomías amplias y cambiantes.
- Reranking en pipelines de búsqueda o RAG: ordenar candidatos recuperados por relevancia respecto a una consulta en ruso, aprovechando que el modelo puntúa sin generación y con bajo coste por consulta.
- Despliegue en CPU sin GPU: el build ONNX int8 resuelve una petición de 384 tokens con 3 preguntas en unos 0,9 s con 6 hilos de CPU y obtiene 0,891 en razvilka, útil para entornos sin acelerador o edge.
- Servicio multiusuario: el servidor vLLM agrupa peticiones y mantiene la caché de prefijos, alcanzando unas 60 peticiones/s en una RTX 5060 Ti con 8 peticiones en vuelo, adecuado para APIs internas de clasificación.

## Benchmarks y rendimiento

| Benchmark | FRIDA-Decisions | TypeSafe Jev (API comercial) |
|---|---|---|
| razvilka (735 items) | 0,893 | 0,897 (McNemar pareado p = 0,84) |
| razvilka, build ONNX int8 | 0,891 (misma decisión que GPU en 726 de 735 items) | no disponible |

El autor indica que 0,893 es la puntuación más alta entre los modelos abiertos que evaluó en razvilka. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales, lo cual es esperable dado que el modelo no es generativo.

Latencias medidas en una RTX 5060 Ti con bf16 y vLLM 0.29: 25-45 ms para una petición con texto de unos 400 tokens y 1-3 preguntas; 25-35 ms para una pregunta de seguimiento sobre un texto ya leído; aproximadamente 0,33 s para elegir entre 243 intenciones. En proceso, 28-34 ms por petición en las mismas condiciones. Pico de memoria asignada por PyTorch de 1,8 GiB durante toda la ejecución de razvilka, más el contexto CUDA.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,8 GiB de pico en PyTorch con bf16, más el contexto CUDA; cabe holgadamente en cualquier GPU de consumo moderna.
- GPU recomendadas: RTX 5060 Ti (mediciones del autor), así como cualquier RTX 30/40/50 con suficiente VRAM; A100 y H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, con margen amplio; también existe build MLX para Apple Silicon y build ONNX int8 para CPU.
- Opciones de despliegue: paquete `frida-decisions` con backend torch, ONNX (CPU sin PyTorch) o MLX; servidor vLLM con plugin de IO processor (`--io-processor-plugin frida_decisions`, `--enforce-eager`, `--max-model-len 2048`).
- Latencia y throughput: 25-45 ms por petición en RTX 5060 Ti; unas 60 peticiones/s con 8 peticiones en vuelo en el servidor vLLM; 0,9 s por petición de 384 tokens con 3 preguntas en CPU de 6 hilos (int8, aproximadamente 2,5 veces más rápido que fp32).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | razvilka | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FRIDA-Decisions | 823 M (encoder T5) | hasta 2048 en vLLM | 0,893 | MIT | Hugging Face, GitHub, ONNX, MLX |
| TypeSafe Jev | no disponible | no disponible | 0,897 | comercial (API) | API de pago |
| Otros modelos abiertos evaluados por el autor | no disponible | no disponible | inferiores a 0,893 según el autor | no disponible | no disponible |

La información proporcionada no incluye los nombres ni las especificaciones de los modelos abiertos comparados en razvilka, por lo que la comparativa con alternativas concretas de la misma categoría queda como no disponible más allá de la API comercial citada.

## Limitaciones y advertencias

- Cobertura lingüística limitada a ruso e inglés; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Modelo no generativo: no sirve para tareas de generación de texto, resumen o diálogo abierto; su ámbito es la decisión estructurada.
- El autor no documenta sesgos conocidos, composición del dataset de entrenamiento ni procesos de alineación; no es posible evaluar sesgos de forma rigurosa con la información disponible.
- Riesgo de alucinación acotado por diseño (siempre devuelve una opción declarada), pero la confianza puede ser alta en decisiones erróneas cuando el texto queda fuera de la distribución de entrenamiento; conviene calibrar umbrales en producción.
- La calidad depende de la redacción de las instrucciones y criterios en la petición: definiciones ambiguas de las opciones degradan el resultado.
- Longitud de contexto efectiva limitada (2048 tokens en el servidor vLLM); textos muy largos requieren truncado o segmentación.
- Licencia MIT: permite uso comercial sin restricciones destacables, pero el usuario debe verificar las condiciones del modelo base ai-forever/FRIDA.
- El servidor vLLM requiere Linux y GPU, y la configuración concreta (`--enforce-eager`, `--no-enable-chunked-prefill`, overrides de arquitectura) es específica de esta versión; cambios de versión de vLLM pueden romper la integración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-forever/FRIDA-Decisions
- Modelo base: https://huggingface.co/ai-forever/FRIDA
- Repositorio en GitHub: https://github.com/ai-forever/FRIDA-Decisions
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/ai-forever/FRIDA-Decisions
- Dataset de benchmark razvilka: https://huggingface.co/datasets/artemsnegirev/razvilka
- Artículo en Habr: https://habr.com/ru/companies/sberbank/articles/1092056/
- Notebook de inicio rápido: https://colab.research.google.com/github/ai-forever/FRIDA-Decisions/blob/main/notebooks/quickstart.ipynb
- Notebook de evaluación en razvilka: https://colab.research.google.com/github/ai-forever/FRIDA-Decisions/blob/main/benchmarks/razvilka/run_razvilka.ipynb
- Ejemplo de cliente vLLM: https://github.com/ai-forever/FRIDA-Decisions/blob/v0.4.0/examples/vllm_client.py
- Licencia: https://github.com/ai-forever/FRIDA-Decisions/blob/main/LICENSE
