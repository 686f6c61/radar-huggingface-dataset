# glim-oss/cogent-large

## Resumen

Cogent-Large es un modelo encoder de 394,8 millones de parámetros (395,8 M incluyendo la cabeza lectora) desarrollado por glim-oss, diseñado específicamente para resolver decisiones tipadas de múltiples preguntas sobre un estado dado. A diferencia de los modelos generativos, no produce texto libre: recibe un estado (texto o JSON) y una lista de preguntas tipadas (`choice`, `score`, `noul`) y devuelve, para cada pregunta, una distribución de probabilidad sobre sus opciones. El estado se codifica una sola vez y se comparte entre todas las preguntas de la petición, lo que reduce el coste computacional en escenarios con muchas preguntas sobre el mismo contexto.

El modelo se construye sobre una arquitectura ModernBERT (28 capas, tamaño oculto 1024, 16 cabezas de atención) que desciende del encoder público `cross-encoder/ettin-reranker-400m-v1`, con una pequeña cabeza lectora de menos de 1 M de parámetros. Está pensado para ejecutarse en CPU, lo que lo hace adecuado para despliegues de baja latencia en entornos sin GPU, como sistemas de enrutamiento, moderación o control de agentes. Es el mayor de una familia de cuatro tamaños (Nano, Small, Base y Large).

Su relevancia actual radica en la creciente necesidad de mecanismos fiables y deterministas para la toma de decisiones en pipelines de agentes y sistemas automatizados, donde la generación de texto libre introduce variabilidad e impredecibilidad. Cogent-Large ofrece salidas probabilísticas calibradas y estructuradas, con una propiedad arquitectónica destacable: una pregunta formulada de forma aislada recibe la misma respuesta que si se formula junto con otras, independientemente del orden, lo que facilita la composición y el testeo de sistemas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT-style encoder (28 capas, hidden size 1024, 16 cabezas de atención) con tree attention mask y reader head |
| Parámetros totales | 394.781.696 (backbone 394,8 M; reader head < 1 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Estado: 2.048 tokens (incluyendo `[CLS]` y `[SEP]`); pregunta: 512 tokens; opción: 128 tokens. Peticiones > 1.024 tokens se dividen en varias secuencias, cada una con el estado completo |
| Tipos de cuantización | bf16 (por defecto) y fp32 (copia adicional en el repositorio) |
| Idiomas soportados | Inglés (en) |
| Licencia | GPL-3.0 (el backbone deriva de un encoder Apache-2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Cogent-Large es un encoder de estilo ModernBERT con 28 capas, tamaño oculto de 1024 y 16 cabezas de atención, ejecutado bajo una máscara de atención en árbol (tree attention mask). La petición completa se serializa como una única secuencia de tokens: primero el estado, después cada pregunta seguida de sus opciones. La máscara garantiza que el estado solo se lea a sí mismo (se codifica una vez y se comparte entre todas las preguntas), que cada pregunta lea el estado y a sí misma, y que cada opción lea el estado, su propia pregunta y a sí misma, sin acceder nunca a otras opciones ni a otras preguntas. Esta separación estructural es lo que asegura que una pregunta aislada obtenga la misma respuesta que en una petición múltiple, en cualquier orden.

La cabeza lectora agrupa los tokens de cada opción en un único vector, lo hace pasar por dos capas de cross-attention sobre el estado agrupado y produce un logit por opción; un softmax sobre las opciones de cada pregunta devuelve las probabilidades. El backbone parte del encoder público `cross-encoder/ettin-reranker-400m-v1` (Apache-2.0) y el método de entrenamiento se describe en un paper pendiente de publicación. El repositorio contiene tres copias entrenadas de forma independiente (seed 0, seed1, seed2), cada una en bf16 y fp32, lo que permite un ensemble de 3 semillas que promedia las probabilidades opción por opción. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Clasificación y decisión tipada: responde preguntas de tipo `choice` (elegir una opción entre varias), `score` (valorar en una escala ordenada) y `noul` (afirmación sí/no).
- Salidas probabilísticas calibradas: devuelve una probabilidad por opción, con suma 1 y preservando el orden de las opciones proporcionadas.
- Procesamiento de estado en texto libre o JSON: cualquier valor JSON se serializa a texto y se usa como estado.
- Múltiples preguntas por petición con coste compartido: el estado se codifica una sola vez para todas las preguntas.
- Descripciones opcionales por opción: el modelo lee el identificador y la descripción de cada opción para desambiguar.
- Independencia de orden y composición: una pregunta aislada obtiene la misma respuesta que en una petición múltiple (propiedad exacta de la arquitectura en aritmética exacta).
- Ejecución en CPU: diseñado para inferencia sin GPU.
- Ensemble de 3 semillas: media de probabilidades entre tres copias entrenadas independientemente.
- No soporta tool calling, function calling, agentes multi-step, visión, audio ni modo thinking; es un encoder de clasificación, no un modelo generativo.

## Casos de uso

- Enrutamiento de decisiones en agentes: dado el estado de un agente (por ejemplo, un JSON con la tarea y la última acción), decidir si continuar, derivar a revisión humana o detener. La salida probabilística permite aplicar umbrales de confianza y escalar a supervisión cuando la incertidumbre es alta.
- Moderación y control de calidad: clasificar trazas o conversaciones con preguntas tipadas (por ejemplo, `noul`: "¿esta traza requiere revisión humana?") y usar la probabilidad como señal para priorizar colas de revisión.
- Enrutamiento de tickets de soporte: con un estado que contenga el texto del ticket, preguntas de tipo `choice` para asignar categoría y `score` para prioridad, aprovechando que el estado se codifica una sola vez para todas las preguntas.
- Evaluación automática de respuestas: puntuar salidas de un sistema generativo con escalas ordenadas (`score`) y afirmaciones sí/no (`noul`) sobre el estado, útil en pipelines de evaluación continua.
- Clasificación de documentos con múltiples criterios: procesar un documento como estado y lanzar varias preguntas tipadas (categoría, urgencia, requiere acción) en una sola petición, reduciendo el coste frente a múltiples llamadas independientes.
- Despliegue en entornos sin GPU: al ejecutarse en CPU con bf16 (o fp32 si no hay `avx512_bf16`), es adecuado para servicios en contenedores ligeros, edge computing o entornos con restricciones de hardware.
- Señal de decisión en sistemas de recomendación o filtrado: usar probabilidades por opción como puntuaciones para ordenar o filtrar candidatos según criterios definidos como preguntas tipadas.

## Benchmarks y rendimiento

La model card menciona resultados en un "typed-decisions test set" para el ensemble de 3 semillas: Brier y KL más bajos entre las configuraciones medidas, y una accuracy de 0,8000, igual a la de seed 0 en bf16 y una décima por debajo del archivo fp32 de seed 0 (0,8005). No se proporcionan resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Configuración | Accuracy | Brier | KL |
|---|---|---|---|
| Ensemble 3 semillas | 0,8000 | El más bajo medido | El más bajo medido |
| Seed 0 bf16 | 0,8000 | No disponible | No disponible |
| Seed 0 fp32 | 0,8005 | No disponible | No disponible |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para ejecución en CPU; en GPU, el modelo en bf16 ocupa aproximadamente 0,8 GB (pesos), más overhead de activaciones.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU. Cualquier GPU con suficiente memoria podría ejecutarlo, pero no es el objetivo del diseño.
- Cabe en GPU de consumo: sí, por tamaño (menos de 1 GB en bf16), aunque el diseño prioriza CPU.
- Opciones de despliegue: paquete `cogent` (https://github.com/glim-oss/cogent-infer), que requiere Python 3.10+, `torch`, `transformers>=5.22`, `safetensors` y `numpy`. No funciona solo con `transformers`. El repositorio completo (tres semillas en bf16 y fp32) ocupa 6,7 GB; el modelo por defecto solo, 0,8 GB.
- Latencia y throughput: no disponibles. El ensemble de 3 semillas cuesta tres veces el tiempo y la memoria de un solo modelo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La familia Cogent incluye otros tres tamaños (`glim-oss/cogent-nano`, `glim-oss/cogent-small`, `glim-oss/cogent-base`), pero no se detallan sus especificaciones ni rendimiento.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Cogent-Large | 394,8 M | Estado 2.048 / pregunta 512 / opción 128 | GPL-3.0 | Hugging Face |
| Cogent-Base | No disponible | No disponible | No disponible | Hugging Face |
| Cogent-Small | No disponible | No disponible | No disponible | Hugging Face |
| Cogent-Nano | No disponible | No disponible | No disponible | Hugging Face |

## Limitaciones y advertencias

- Solo inglés: el modelo está entrenado y evaluado únicamente en inglés; el rendimiento en otros idiomas no está garantizado.
- Licencia GPL-3.0: impone obligaciones de copyleft para uso comercial y distribución; el backbone deriva de un encoder Apache-2.0, pero la licencia del modelo final es GPL-3.0.
- No es un modelo generativo: no produce texto libre, tool calling ni razonamiento multi-step; su uso está limitado a decisiones tipadas.
- Dependencia de un paquete de inferencia específico: no funciona con `transformers` solo, lo que añade una dependencia externa y posibles problemas de mantenimiento.
- Truncamiento de entradas: el estado se trunca a 2.048 tokens, las preguntas a 512 y las opciones a 128; información más allá de esos límites se descarta.
- Riesgo de calibración imperfecta: aunque devuelve probabilidades, no se documentan métricas de calibración más allá de Brier y KL en un test set propietario.
- Sin datos sobre sesgos: no se proporciona información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento.
- Paper pendiente: el método de entrenamiento no está disponible públicamente, lo que limita la reproducibilidad.
- Rendimiento modesto en el test set: accuracy de 0,8000–0,8005, lo que indica que aproximadamente una de cada cinco decisiones es incorrecta; no apto para decisiones críticas sin supervisión humana.

## Enlaces

- Hugging Face: https://huggingface.co/glim-oss/cogent-large
- Repositorio de inferencia: https://github.com/glim-oss/cogent-infer
- Modelo base: https://huggingface.co/cross-encoder/ettin-reranker-400m-v1
- Modelos relacionados: https://huggingface.co/glim-oss/cogent-nano, https://huggingface.co/glim-oss/cogent-small, https://huggingface.co/glim-oss/cogent-base
- DOI: 10.57967/hf/11579
- Paper: pendiente de publicación (enlace se añadirá en la model card)
