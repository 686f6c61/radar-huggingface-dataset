# apertixai/cerno-31b-v1

## Resumen

Cerno 31B v1 es un modelo de decisión tipada desarrollado por apertixai, afinado a partir de google/gemma-4-31B-it. No es un modelo generativo al uso: recibe un *estado* (texto libre o JSON) junto con un conjunto de preguntas tipadas (opción múltiple con criterios explícitos, hasta 255 opciones, y preguntas sí/no) y devuelve una probabilidad calibrada para cada opción de cada pregunta, sin generar texto. El autor lo describe como un modelo "System One" de estilo Jev: una única pasada hacia delante por fila de pregunta, con todas las filas de una petición procesadas en un solo lote.

El modelo se distribuye en FP8 (compressed-tensors) y está pensado para servirse en vLLM con la técnica "read twice": el turno de usuario se escribe dos veces en peticiones de hasta 3.000 tokens, y las preguntas cuya opción más probable queda por debajo de 0,6 se releen con las opciones invertidas, promediando ambas distribuciones. Declara un índice público de 71,45 en la suite Decision Index 0.3 (37 benchmarks, 140.178 peticiones) y un error de calibración de 2,6 puntos.

Es relevante porque propone un patrón distinto al de los LLM generativos para tareas de clasificación y enrutamiento: salida estructurada como distribución de probabilidad, latencia baja (116 ms de mediana por petición en una H200) y reutilización de la caché de prefijo de vLLM para compartir el estado entre preguntas. Con licencia Apache 2.0 y pesos abiertos, es directamente evaluable en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (Gemma 4), fine-tune de google/gemma-4-31B-it |
| Parámetros totales | 32.106.631.484 (≈32,1 mil millones) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 131.072 tokens (configuración de servicio en vLLM) |
| Tipos de cuantización | FP8 con compressed-tensors (escalas de peso por canal, escalas de activación dinámicas por token; `lm_head` y embeddings en bf16); pesos de 34,9 GB |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8 compressed-tensors); tamaño del repo 35,0 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 en su variante de 31B con atención causal, tal como la sirve vLLM de serie. Sobre esa base, Cerno introduce un protocolo de inferencia específico: cada pregunta del lote se presenta como una fila en la plantilla de chat del modelo con el modo *thinking* desactivado, precedida por la lista completa de preguntas de la petición y seguida del estado compartido. Las log-probabilidades de las etiquetas de opción pasan por una softmax para producir la distribución final, y temperaturas por tipo de pregunta reescalan las probabilidades sin alterar la respuesta elegida.

El autor no detalla en la información disponible el volumen de tokens de entrenamiento ni la composición exacta del dataset, aunque sí menciona que se usaron las particiones públicas de train de varias familias de benchmarks (HLE, BANKING77, CLINC150, HellaSwag entre ellas, según la definición de Train-split-OOD) y que no hubo ajuste de calibración sobre datos reservados para este modelo. Las innovaciones destacables son el modo "read twice" (duplicación del turno de usuario), la relectura con opciones invertidas para preguntas de baja confianza y el uso intensivo de la caché de prefijo de vLLM para amortizar el coste del estado entre preguntas.

## Capacidades

- Clasificación de texto con salida probabilística: devuelve una probabilidad por opción y pregunta, sin generar texto.
- Preguntas de opción múltiple con criterios explícitos, hasta 255 opciones por pregunta.
- Preguntas de sí/no.
- Entrada heterogénea: acepta texto libre o JSON como estado.
- Procesamiento por lotes de preguntas: una fila por pregunta, todas las filas de una petición en un solo lote.
- Calibración de probabilidades mediante temperaturas por tipo de pregunta.
- Mecanismo de relectura para preguntas de baja confianza (probabilidad máxima inferior a 0,6).
- Soporte de caché de prefijo de vLLM para compartir el estado entre preguntas de una misma petición.
- No declara soporte de tool calling, agentes, visión, audio ni modo *thinking*; de hecho, la inferencia se ejecuta con *thinking* desactivado.
- Las preguntas de escala puntuada no están soportadas por este lector; el autor remite a otros modelos de la familia.

## Casos de uso

- Enrutamiento y triaje de tickets: el modelo recibe el texto del ticket como estado y un conjunto de preguntas de opción múltiple (categoría, urgencia, equipo destino) y devuelve una distribución de probabilidad por pregunta, lo que permite aplicar umbrales de confianza y derivar a revisión humana los casos por debajo de 0,6.
- Moderación y clasificación de contenido: con preguntas sí/no y de opción múltiple sobre políticas explícitas, la salida calibrada permite fijar umbrales operativos y auditar decisiones con la probabilidad asociada.
- Extracción de campos estructurados desde JSON o texto: dado un documento como estado, se formulan preguntas tipadas por campo y se obtiene la opción más probable con su probabilidad, útil en pipelines de normalización de datos.
- Clasificación de intenciones en asistentes conversacionales: el estado puede ser el turno del usuario y las preguntas cubren intención y entidades; la latencia declarada (116 ms de mediana en H200) encaja en rutas interactivas.
- Evaluación de riesgo y cumplimiento: preguntas sí/no con criterios explícitos sobre contratos o comunicaciones, con probabilidades calibradas (ECE de 2,6 puntos) para priorizar revisiones.
- Anotación asistida y control de calidad de datasets: el modelo produce etiquetas probabilísticas sobre lotes de ejemplos, y la relectura con opciones invertidas reduce el sesgo posicional en preguntas de baja confianza.
- Enrutamiento de consultas en sistemas RAG: decidir qué recuperador o herramienta invocar según preguntas tipadas sobre la consulta, aprovechando el procesamiento en lote de varias preguntas por petición.

## Benchmarks y rendimiento

| Métrica | Cerno 31B v1 |
|---|---:|
| Decision Index 0.3, índice público, ejecución completa (37 benchmarks, 140.178 peticiones) | 71,45 |
| Strict-OOD | 70,54 |
| Train-split-OOD | 69,03 |
| Error de calibración (ECE estilo del board) | 2,6 puntos |

Datos declarados por el autor en la model card; el índice público figura como no verificado en el model-index. El autor indica que el ruido entre ejecuciones del índice público es de aproximadamente 0,1-0,2 puntos y que este índice no cuenta para la clasificación del board, cuyo Full score (60% habilidades existentes, 40% dominios nuevos sobre tests privados) está pendiente para v1. Strict-OOD excluye HLE, BANKING77, CLINC150 y HellaSwag; Train-split-OOD excluye todas las familias de benchmarks cuya partición pública de train se usó.

Rendimiento de servicio declarado: 116 ms de mediana y 503 ms de media por petición en una H200, con una petición a la vez.

## Requisitos de hardware

- VRAM estimada: los pesos FP8 ocupan 34,9 GB; el autor indica que se necesita una GPU de 80 GB o más con los ajustes de serie (gpu_memory_utilization 0,7, contexto de 131.072 tokens).
- GPU recomendadas: H200 (mediciones declaradas), A100 80 GB y H100 80 GB como opciones equivalentes por memoria.
- GPU de consumo: no cabe en GPUs de consumo con los ajustes publicados; el autor señala que GPUs más pequeñas requieren sobrescribir el bloque de configuración de vLLM mediante `--option`.
- Despliegue: vLLM 0.31.0 con torch 2.13.0 y transformers 5.17.0, versiones fijadas en `requirements-31b-v1.txt`; los pesos FP8 se cargan sin opciones adicionales. El repositorio de inferencia es github.com/apertixsk/cerno-inference.
- Latencia y throughput: 116 ms de mediana y 503 ms de media por petición en una H200, una petición a la vez; no se publican cifras de throughput agregado.
- Contexto: 131.072 tokens en la configuración de servicio publicada.

## Comparativa con modelos similares

| Modelo | Base | Pesos | Motor | Índice público |
|---|---|---|---|---:|
| Cerno 31B v1 | Gemma-4-31B-it | FP8 | vLLM | 71,45 |
| Cerno 27B v1.1 | Qwen3.8-27B | FP8 | vLLM | 69,73 |
| Cerno 9B v1.2 | Qwen3.5-9B | bf16 | transformers | 66,83 |
| Cerno 4B v1.2 | Qwen3.5-4B | bf16 | transformers | 65,05 |

La comparación con modelos de propósito general (no especializados en decisión tipada) no está disponible en la información proporcionada: no se publican resultados de MMLU, HumanEval, GSM8K ni de otras suites estándar para este modelo.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, solo distribuciones de probabilidad sobre opciones predefinidas.
- No soporta preguntas de escala puntuada; el autor remite a otros modelos de la familia para ese tipo.
- El índice público de 71,45 figura como no verificado en el model-index y no equivale al Full score del board, que está pendiente.
- Riesgo de sobreajuste a las particiones públicas de train de varios benchmarks: el propio autor reporta métricas Train-split-OOD y Strict-OOD precisamente para acotarlo, con caídas de 2,4 y 0,9 puntos respectivamente frente al índice público.
- La calibración es la del propio lector, sin ajuste sobre datos reservados para este modelo; el ECE de 2,6 puntos es una estimación sobre una muestra de 34 benchmarks con peso igual por benchmark.
- El modo "read twice" está descrito para peticiones de hasta 3.000 tokens; no se detalla su comportamiento por encima de ese umbral.
- No se publican idiomas soportados; la cobertura multilingüe debe validarse empíricamente antes de usarla en producción.
- La inferencia depende de versiones muy concretas de vLLM, torch y transformers; desviarse de las versiones fijadas puede alterar el comportamiento.
- Licencia Apache 2.0: permite uso comercial, pero deben conservarse los avisos de licencia y atribución correspondientes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es aún inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apertixai/cerno-31b-v1
- Cerno 27B v1.1: https://huggingface.co/apertixai/cerno-27b-v1.1
- Cerno 9B v1.2: https://huggingface.co/apertixai/cerno-9b-v1.2
- Cerno 4B v1.2: https://huggingface.co/apertixai/cerno-4b-v1.2
- Código de inferencia: https://github.com/apertixsk/cerno-inference
- Dataset Decision Index runs: https://huggingface.co/datasets/apertixai/cerno-decision-index
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
