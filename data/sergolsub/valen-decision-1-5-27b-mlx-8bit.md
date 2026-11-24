# sergolsub/valen-decision-1.5-27B-MLX-8bit

## Resumen

Valen-Decision-1.5-27B es un modelo de 27.000 millones de parámetros desarrollado por Valen-Team, especializado en tareas de decisión estructurada: clasificación binaria (tipo "noul"), elección entre categorías (tipo "choice"), puntuación ordinal (tipo "score") y localización espacial mediante una cabeza de grounding que devuelve cajas delimitadoras (tipo "box"). No es un modelo conversacional generalista, sino un modelo orientado a producir decisiones tipadas a partir de un texto de entrada y una definición de tarea, lo que lo hace útil en pipelines de triaje, enrutamiento y automatización de operaciones.

La ficha que nos ocupa no contiene los pesos originales, sino una conversión a 8 bits en formato MLX realizada por el usuario sergolsub para ejecución en Apple Silicon mediante `mlx_lm`. La conversión no implica reentrenamiento ni cambios de arquitectura: se trata de una cuantización de los pesos bf16 originales, con licencia Apache 2.0 heredada del repositorio upstream.

La relevancia de esta variante es fundamentalmente práctica: permite ejecutar un modelo de 27B en un Mac mini con M4 Pro y 48 GB de memoria unificada, con un consumo de disco de 28,15 GB, una memoria residente máxima de 17,12 GB y una latencia mediana de decisión de 2.174 ms. La información disponible no detalla la arquitectura interna del modelo base más allá de referencias a capas de atención lineal, ni los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles internos no disponibles; se observan capas de atención lineal en el modelo base) |
| Parametros totales | 27B (según denominación del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (esta variante); existe también una variante de 4 bits del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en layout MLX (28,15 GB en disco) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base Valen-Team/Valen-Decision-1.5-27B. Se sabe que el modelo incorpora una "cabeza de decisión" (decision head) con tipos de tarea definidos (`noul`, `choice`, `score`, `box`) y una "cabeza de grounding" que produce cajas delimitadoras, según se deduce de los ficheros de glue de inferencia (`decision_config.json`, `joint_config.json`, `*_mlx.py`) y del ejemplo de uso. En el audit de cuantización aparece una capa `language_model.model.layers.0.linear_attn.in_proj_b.weight`, lo que indica la presencia de mecanismos de atención lineal en al menos parte de la pila.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. Tampoco se documenta ninguna innovación de decodificación especulativa ni técnicas de atención destacables más allá de la atención lineal mencionada. La conversión a MLX 8 bits es puramente de cuantización: no hay reentrenamiento ni modificación arquitectónica, según declara el autor de la conversión.

## Capacidades

- Clasificación binaria de texto mediante tareas de tipo `noul` (por ejemplo, determinar si el cliente pide un reembolso).
- Elección entre categorías definidas por el usuario mediante tareas de tipo `choice`, con criterios y descripciones asociadas.
- Puntuación ordinal mediante tareas de tipo `score`, con una lista de niveles proporcionada en la llamada.
- Localización espacial de objetos en imágenes descritas textualmente mediante tareas de tipo `box`, devolviendo cajas delimitadoras con una calidad medida de IoU medio de 0,8207.
- Ejecución de múltiples decisiones independientes en una misma llamada, cada una como objeto separado.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking, audio ni visión nativa más allá de la cabeza de grounding.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Triaje de tickets de soporte: el modelo puede clasificar un ticket como "quiere reembolso" o "no lo quiere" (tipo `noul`) y enrutarlo al equipo adecuado (tipo `choice`) en una sola pasada, con latencias en torno a 2,2 s por decisión en un Mac mini M4 Pro.
- Enrutamiento a equipos de operaciones: definir criterios como "billing" o "shipping" y dejar que el modelo asigne cada incidencia al equipo correspondiente, aprovechando la cabeza de elección con criterios configurables.
- Priorización de incidencias: usar tareas de tipo `score` con niveles como "cosmetic", "annoying" o "blocks" para asignar severidad a errores de sistemas y alimentar colas de trabajo.
- Grounding visual asistido por descripción: localizar objetos descritos en texto (por ejemplo, una señal de stop detrás de un banco) y obtener cajas delimitadoras con IoU medio de 0,82, útil en pipelines de anotación o verificación.
- Automatización de decisiones en backoffice: sustituir reglas heurísticas frágiles por un modelo que devuelve decisiones tipadas y auditables, con la ventaja de que la salida está estructurada por diseño.
- Despliegue local en estaciones de trabajo Apple Silicon: al caber en 17,12 GB de memoria residente con la variante de 8 bits, permite ejecutar el modelo en un Mac mini M4 Pro de 48 GB sin GPU dedicada, útil para prototipado y entornos con requisitos de privacidad.
- Evaluación comparativa de cuantizaciones: la disponibilidad de variantes de 8 y 4 bits con métricas de calidad (accuracy 88,9 % vs 87,8 %) facilita elegir el compromiso entre precisión y huella de memoria para un caso concreto.

## Benchmarks y rendimiento

Los datos disponibles no son benchmarks estándar (MMLU, HumanEval, GSM8K), sino métricas internas del autor de la conversión sobre un conjunto de evaluación propio. Se presentan tal cual, sin comparación con modelos de terceros.

| Metrica | 8 bits (esta variante) | 4 bits (misma familia) |
|---|---|---|
| Accuracy | 88,9 % | 87,8 % |
| noul | 92,5 % | 92,5 % |
| choice | 88,0 % | 88,0 % |
| score | 84,0 % | 80,0 % |
| PPL de calibración | 1,798 | 1,806 |
| Tamaño en disco | 28,15 GB | 15,34 GB |
| Latencia mediana | 2.174 ms | 2.160 ms |

| Metrica de grounding | Valor |
|---|---|
| IoU medio (cabeza de grounding) | 0,8207 |
| Aciertos con IoU >= 0,5 | 4/4 |
| IoU medio del original en torch bf16 | 0,8314 |
| IoU mínimo frente a torch | 0,9148 |

| Par de comparación (KL de salida) | Filas | Media | p95 | Máx |
|---|---|---|---|---|
| 8 bits → 4 bits | 100 | 8,55e-03 | 4,65e-02 | 7,11e-02 |
| original → 8 bits | — | no registrado | — | — |

| Audit de pesos (KL por tensor) | Valor |
|---|---|
| Tensores comparados | 1.234 |
| KL media | 2,39e-04 |
| KL máxima | 5,84e-03 |
| Tensores con KL distinto de cero | 497 |
| Peor capa | `language_model.model.layers.0.linear_attn.in_proj_b.weight` (KL 5,84e-03) |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 17,12 GB de memoria residente máxima medida con la variante de 8 bits; el fichero en disco ocupa 28,15 GB.
- Hardware de referencia medido: Mac mini M4 Pro con 48 GB de memoria unificada; tiempo de carga de 7,77 s.
- GPU dedicadas: no se han publicado mediciones para A100, H100, RTX 4090 ni otras GPU; la variante está empaquetada para MLX, que es específico de Apple Silicon.
- Cabe en GPU de consumo: no aplicable en el sentido habitual; está pensado para Apple Silicon. La variante de 4 bits (15,34 GB) reduce el requisito de memoria.
- Opciones de despliegue: `mlx_lm` en Apple Silicon, con el cargador `valen_mlx.py` incluido en el repositorio. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 2.174 ms por decisión y 0,52 decisiones cortas por segundo en el hardware de referencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (modelos de decisión estructurada con cabezas tipadas y grounding). La comparación más directa posible es con las otras variantes de la misma familia:

| Modelo | Parámetros | Contexto | Calidad (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Valen-Decision-1.5-27B (bf16 original) | 27B | no disponible | no medida en la eval del conversor | Apache 2.0 | Hugging Face (upstream) |
| Valen-Decision-1.5-27B MLX 8 bits (esta ficha) | 27B | no disponible | 88,9 % | Apache 2.0 | Hugging Face |
| Valen-Decision-1.5-27B MLX 4 bits | 27B | no disponible | 87,8 % | Apache 2.0 | Hugging Face |

Frente a modelos generalistas de tamaño similar (por ejemplo, familias de 24-32B orientadas a chat), la comparación no es significativa porque la tarea objetivo y las cabezas de salida son distintas. Se indica "no disponible" para alternativas de terceros.

## Limitaciones y advertencias

- El modelo está diseñado para tareas de decisión tipadas, no para generación de texto libre ni conversación abierta; usarlo fuera de ese esquema puede producir resultados sin sentido.
- La información disponible no documenta sesgos conocidos, pero al no detallarse la composición del dataset de entrenamiento no es posible evaluar sesgos demográficos, lingüísticos o de dominio.
- Riesgo de alucinación: no evaluado en la información disponible; la naturaleza cerrada de las tareas de decisión reduce, pero no elimina, este riesgo cuando las categorías o criterios son ambiguos.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento correcto fuera del idioma o idiomas de entrenamiento, que no se especifican.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la conversión indica que prevalece la licencia del repositorio upstream en caso de conflicto; conviene verificar el repositorio original antes de un despliegue comercial.
- La variante está empaquetada exclusivamente para MLX; no es portable a CUDA ni a otros runtimes sin una reconversión.
- Las métricas de calidad proceden de un conjunto de evaluación propio del conversor, no de benchmarks estándar ni de evaluaciones independientes; deben tomarse como indicativas.
- La latencia de 2.174 ms por decisión y el throughput de 0,52 decisiones/s limitan su uso en escenarios de muy alta concurrencia o tiempo real estricto.
- El KL de salida entre 8 y 4 bits (media 8,55e-03, máximo 7,11e-02) indica que la cuantización a 4 bits introduce desviaciones no triviales en las probabilidades de decisión, aunque la accuracy solo cae 1,1 puntos.

## Enlaces

- Repositorio de esta variante: https://huggingface.co/sergolsub/valen-decision-1.5-27B-MLX-8bit
- Variante de 4 bits: https://huggingface.co/sergolsub/valen-decision-1.5-27B-MLX-4bit
- Modelo base (upstream): https://huggingface.co/Valen-Team/Valen-Decision-1.5-27B
- No se han encontrado en la información disponible papers, blogs, repositorios de código ni demos adicionales.
