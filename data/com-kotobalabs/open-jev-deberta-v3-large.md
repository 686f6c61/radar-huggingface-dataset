# com-kotobalabs/open-jev-deberta-v3-large

## Resumen

open-jev-deberta-v3-large es un modelo de clasificación y decisión tipada desarrollado por el usuario com-kotobalabs, construido a partir de un ajuste fino (fine-tuning) del encoder microsoft/deberta-v3-large. No genera texto: recibe un estado textual y una o varias preguntas tipadas (elección sobre hasta 255 opciones, puntuación sobre 2-10 niveles ordenados o pregunta de sí/no) y devuelve, en una única pasada forward, una distribución de probabilidad calibrada por pregunta. Al no producir texto libre, el error de salida estructurada es cero por construcción.

El modelo es una reproducción independiente de la "forma" del Jev de TypeSafe AI, sin afiliación ni código o datos compartidos, y se ha entrenado exclusivamente con etiquetas doradas de tres datasets públicos: mteb/banking77, SetFit/sst5 y google/boolq. Tiene 434.012.160 parámetros, una ventana de contexto de 512 tokens (el estado se trunca a 256), soporta únicamente inglés y se distribuye bajo licencia Apache 2.0.

Su relevancia práctica está en el nicho de modelos de decisión calibrada: permite sustituir esquemas de prompt engineering sobre modelos generativos por una única pasada de encoder con coste muy bajo y latencia de decenas de milisegundos. El autor reporta un entrenamiento de una sola época sobre 18.000 estados y 42.000 preguntas en una H100 durante 229 segundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-large) con cabeza de puntuación de 3 capas sobre spans de pregunta y opción; pooling por media de tokens + producto |
| Parametros totales | 434.012.160 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens totales; el estado se trunca a 256 tokens |
| Tipos de cuantizacion | no disponible (no se documentan versiones cuantizadas; el repositorio publica safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 3,5 GB); incluye `head.safetensors` y `open_jev_config.json` |

## Arquitectura y entrenamiento

La arquitectura parte del encoder DeBERTa-v3-large (MIT) y añade una cabeza de decisión específica. La secuencia de entrada sigue el patrón `[CLS] [STATE] state [Q] instructions [OPT] option_1 [OPT] option_2 … [Q] … [SEP]`, con tres tokens marcadores nuevos incorporados al tokenizer. Para cada opción, la cabeza puntúa la concatenación de `[media de los tokens de la pregunta; media de los tokens de la opción; producto]`, y un softmax aplicado dentro del grupo de opciones de cada pregunta produce la distribución de esa pregunta. El fichero `open_jev_config.json` almacena el modo de pooling, la temperatura post-hoc ajustada sobre el split de validación y la procedencia del entrenamiento.

El entrenamiento utiliza únicamente etiquetas doradas públicas, sin respuestas sintéticas ni modelo profesor: banking77 (mensaje de cliente → intención de 77 clases, área de producto de 10 clases y pregunta sí/no "asks about a card"), SST-5 (frase de reseña → nivel de sentimiento en 5 niveles, polaridad en 3 clases y pregunta sí/no) y BoolQ (pasaje → la pregunta del propio dataset). El corpus consta de 18.000 estados y 42.000 preguntas, con una época, semilla 2 y una H100 (229 segundos, coste aproximado de 0,25 dólares). La función de pérdida combina entropía cruzada y Brier, y se aplicó aumento de preguntas que preserva el gold (barajado de opciones, plantillas de paráfrasis, eliminación de distractores, reetiquetado de niveles y negación de preguntas noul con gold invertido) con probabilidad 0,7. El autor documenta una ablación de la cabeza: una cabeza nueva basada en token marcador no aprende, mientras que la cabeza de spans sí.

## Capacidades

- Decisión tipada en una sola pasada forward: tipo `choice` (hasta 255 opciones), tipo `score` (2-10 niveles ordenados, devuelve el índice esperado de nivel, que puede caer entre niveles) y tipo `noul` (probabilidad de "sí").
- Clasificación de intenciones y temas: 0,916 de accuracy en las 77 intenciones de banking77.
- Análisis de sentimiento con escala ordenada: 0,599 de accuracy y 0,51 de MAE en los 5 niveles de SST-5.
- Respuesta a preguntas de sí/no sobre un pasaje: 0,879 de accuracy en BoolQ.
- Salida calibrada: cada respuesta incluye la distribución completa y una confianza (máximo de probabilidad tras temperature scaling); ECE en dominio de 0,022.
- Generalización a preguntas e instrucciones nuevas no vistas en entrenamiento (OOD), con 0,690 de accuracy agregada.
- Variante de decisiones sobre código: el autor menciona un modelo derivado que resuelve "¿a qué definición referencia este nombre?" con 0,63 sobre namespaces no vistos (azar 0,18).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, visión ni audio.

## Casos de uso

- Triaje de tickets de soporte bancario: el modelo clasifica un mensaje de cliente en una de las 77 intenciones de banking77 y, simultáneamente, en un área de producto de 10 clases, en una sola pasada y con distribución de probabilidad por pregunta para enrutar a la cola adecuada.
- Enrutado con umbral de confianza: dado que cada respuesta incluye la probabilidad máxima y el ECE en dominio es 0,022, se puede fijar un umbral por debajo del cual el ticket se deriva a un agente humano, reduciendo automatizaciones erróneas.
- Análisis de sentimiento en reseñas: la cabecera `score` devuelve el nivel esperado sobre escalas de 5 niveles, lo que permite agregar puntuaciones medias por producto en lugar de contar etiquetas discretas.
- Etiquetado a escala para construcción de datasets: aplicar el modelo sobre corpus propios para preetiquetar intenciones, polaridad o temas, y usar la confianza calibrada para seleccionar muestras destinadas a revisión humana (active learning).
- Verificación de afirmaciones sobre documentación: con el tipo `noul`, se puede comprobar si un pasaje respalda una afirmación de sí/no, útil en pipelines de control de calidad de respuestas generadas por otros sistemas.
- Filtros de contenido y guardarraíles: clasificación binaria o multiclase con distribución completa, integrable como paso previo a un LLM generativo para decidir si una consulta pasa, se bloquea o se redirige.
- Extracción de decisiones de código en herramientas de análisis estático: la variante documentada asigna un namespace de referencia a un identificador con 0,63 de acierto sobre namespaces no vistos, por encima del 0,18 de azar.
- Segmentación temática de feedback de producto: aplicar preguntas `choice` con particiones nuevas sobre el mismo estado, aprovechando la capacidad OOD (0,61 en una partición de 5 vías nueva sobre banking77) siempre que se mida antes el rendimiento en el dominio propio.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre un conjunto de test de 1.500 estados y 3.508 preguntas, y un conjunto OOD de 4.012 preguntas nunca vistas sobre los mismos estados:

| Conjunto | Accuracy | Brier | ECE |
|---|---|---|---|
| En dominio (tipos de pregunta vistos en entrenamiento) | 0,854 | 0,213 | 0,022 |
| banking77 intención (77 opciones) | 0,916 | no disponible | no disponible |
| BoolQ | 0,879 | no disponible | no disponible |
| SST-5 nivel (5 niveles ordenados) | 0,599 (MAE 0,51) | no disponible | no disponible |
| OOD (instrucciones y conjuntos de opciones nuevos) | 0,690 | 0,399 | 0,035 |
| OOD: noul negado de BoolQ | 0,830 | no disponible | no disponible |
| OOD: tema banking77 (partición nueva de 5 vías) | 0,610 | no disponible | no disponible |
| OOD: estrellas SST-5 / "disappointed" (conjuntos de niveles nuevos) | 0,450 (mayoría 0,26) | no disponible | no disponible |

Estabilidad entre semillas: tres ejecuciones de esta configuración dan 0,847 ± 0,005 en dominio y 0,678 ± 0,012 en OOD. El autor indica además que el repositorio contiene comparaciones con ModernBERT-base y ModernBERT-large y con un LLaDA-MoE-7B-A1B ajustado con LoRA (0,835 en dominio con 16 veces la latencia).

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 434 millones de parámetros: en torno a 1,7 GB en fp32, 0,87 GB en bf16/fp16 y 0,43 GB en int8. El repositorio ocupa 3,5 GB porque incluye pesos y artefactos adicionales.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4090, RTX 5090 o similares, e incluso en GPUs integradas o en CPU.
- GPU de referencia en las mediciones del autor: H100 en bf16, con 28 ms de extremo a extremo para 10 preguntas sobre un mismo estado (25 ms de forward), y 518 preguntas por segundo con batch 8.
- Rendimiento en CPU: 1,8 segundos para 4 preguntas en fp32 sobre un Apple M1 Max.
- Opciones de despliegue: transformers (librería declarada), text-embeddings-inference (etiqueta del modelo) y endpoints compatibles de Hugging Face. No se documentan pesos GGUF, por lo que llama.cpp y Ollama no son aplicables directamente; vLLM o TGI no están citados en la información disponible.
- Requiere cargar además del encoder el fichero `head.safetensors` y la configuración `open_jev_config.json`, y registrar los tres tokens marcadores en el tokenizer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| open-jev-deberta-v3-large | 434 M | 512 tokens (estado a 256) | 0,854 en dominio / 0,690 OOD | Apache 2.0 | safetensors en Hugging Face |
| ModernBERT-base | no disponible en la información dada | no disponible | usado como referencia por el autor; valores no publicados en la model card | no disponible | no disponible |
| ModernBERT-large | no disponible en la información dada | no disponible | usado como referencia por el autor; valores no publicados en la model card | no disponible | no disponible |
| LLaDA-MoE-7B-A1B con LoRA | 7 B (según denominación del modelo) | no disponible | 0,835 en dominio con 16 veces la latencia del modelo Jev | no disponible | no disponible |
| microsoft/deberta-v3-large (base) | 434 M aproximadamente (el ajuste no añade parámetros al encoder) | 512 tokens | no es un modelo de decisión tipada; no comparable directamente | MIT | safetensors en Hugging Face |

No se dispone de cifras de ModernBERT ni del LLaDA-MoE-7B-A1B más allá de lo citado; para el detalle hay que consultar el README del repositorio kotoba-lang/typed-decisions.

## Limitaciones y advertencias

- Solo interpreta parcialmente la pregunta: la diferencia entre 0,85 en dominio y 0,69 en OOD es el hueco real de generalización, y las escalas ordenadas nuevas son el caso más débil (apenas por encima de la clase mayoritaria).
- Únicamente inglés, contexto de 512 tokens y tres dominios públicos (soporte bancario, reseñas de cine y cuestiones sí/no de Wikipedia). Cualquier otro uso queda fuera de distribución y exige medición previa.
- La confianza es el máximo de probabilidad tras temperature scaling ajustado sobre el split de validación (ECE en dominio 0,022). En preguntas OOD el modelo es sobreconfiado en aproximadamente 0,03 de media, por lo que debe recalibrarse con datos propios.
- No genera texto ni argumentaciones: solo elige entre las opciones proporcionadas, así que no sirve para tareas generativas ni para razonamiento abierto.
- Riesgo de sesgo heredado de los datasets de entrenamiento (banking77, SST-5 y BoolQ) y de los sesgos propios de microsoft/deberta-v3-large; no se documenta ningún análisis de sesgo específico.
- Licencia Apache 2.0, que permite uso comercial, pero el autor advierte de que los números no son comparables con los de TypeSafe AI, que mide acuerdos con modelos frontera sobre flujos privados y no contra etiquetas doradas públicas.
- Los datasets de origen tienen licencias propias (banking77 CC-BY-4.0; SST-5 y BoolQ CC-BY-SA-3.0); conviene revisarlas si se redistribuyen derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/com-kotobalabs/open-jev-deberta-v3-large
- Repositorio de código, corpus builder y ablaciones: https://github.com/kotoba-lang/typed-decisions
- Modelo base: https://huggingface.co/microsoft/deberta-v3-large
- Dataset banking77: https://huggingface.co/datasets/mteb/banking77
- Dataset SST-5: https://huggingface.co/datasets/SetFit/sst5
- Dataset BoolQ: https://huggingface.co/datasets/google/boolq
- ADR citados por el autor (ADR-2609181544 y ADR-2609181715, superproyecto `com-junkawasaki/root`): no disponible como enlace directo en la información proporcionada.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: solo páginas genéricas sobre el dominio de primer nivel `.com`, sin relación con la ficha.
