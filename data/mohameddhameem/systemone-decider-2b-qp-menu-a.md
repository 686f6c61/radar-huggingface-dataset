# mohameddhameem/systemone-decider-2b-qp-menu-a

## Resumen

SystemOne-Decider 2B qp menu es un modelo enrutador (router) de 2.000 millones de parámetros construido sobre el Strands Decider 2B y afinado con LoRA para decidir, en una canalización de respuesta a preguntas en dos etapas, si la etapa débil es suficiente o si conviene escalar a la fuerte. El autor es `mohameddhameem` y el modelo se publica con licencia Apache 2.0. Su función no es generar texto, sino emitir dos decisiones binarias con probabilidad asociada: una para la etapa de recuperación y otra para la etapa de respuesta.

El problema que resuelve es el enrutamiento a nivel de etapa (Stage-Level Routing, SLR) en pipelines RAG con modelos de distinto coste: un recuperador débil (Qwen2.5-7B-Instruct) frente a uno fuerte (Qwen2.5-72B-Instruct), y un respondedor débil (Llama-3.2-3B-Instruct) frente a uno fuerte (Llama-3.1-70B-Instruct). El router permite ahorrar coste computacional evitando llamadas a los modelos grandes cuando la calidad de la etapa débil es suficiente, manteniendo la precisión dentro de un margen configurable.

Es relevante porque aborda un problema práctico de producción en sistemas RAG: el coste de invocar modelos grandes en cada consulta. El modelo se entrena y evalúa sobre el conjunto de desarrollo de HotpotQA (4.814 preguntas de entrenamiento, 1.110 de validación y 1.481 de test) y publica puntos de operación con umbrales calibrados sobre validación, además de tres semillas para permitir ensembles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Strands Decider 2B) con cabecera pointer y adaptador LoRA de rango 16 |
| Parámetros totales | 2B (modelo base Strands Decider 2B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el autor recomienda bf16 en GPU) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 0,2 GB |
| Modelo base | `StrandsAgents/strands-decider-2B-hobson-v21` (revisión `2b52a6235c1b8306bbfa30b00b9d4b74b63a39f5`) |
| Dataset de entrenamiento | `hotpotqa/hotpot_qa` (split SLR: 4.814 train, 1.110 validación, 1.481 test) |
| Semillas publicadas | seed 0 en raíz, seed 1 en `seed1/`, seed 2 en `seed2/` |

## Arquitectura y entrenamiento

El modelo parte del Strands Decider 2B, un transformer decoder de 2.000 millones de parámetros, al que se le añaden un adaptador LoRA de rango 16 y una cabecera pointer. Un único modelo aprende las preguntas de ambas etapas simultáneamente mediante entropía cruzada con softmax agrupado (grouped-softmax cross-entropy). El entrenamiento usa las 4.814 preguntas de entrenamiento del split SLR de HotpotQA, con tres ítems por pregunta, learning rate de 0,0001, batch de 16 y hasta 2 épocas, conservando la época con menor NLL sobre un 10 % de preguntas reservadas como hold-out. El registro completo está en `training.json` del repositorio.

La innovación principal es el esquema de enrutamiento en dos etapas con decisiones débiles primero. En la etapa de recuperación, el juez lee la selección del recuperador débil y responde a la pregunta "¿estos pasajes contienen lo necesario para responder a esta pregunta?". En la etapa de respuesta, la variante `qp` lee los pasajes de la rama y responde "¿responderá correctamente un modelo pequeño a esta pregunta a partir de estos pasajes?"; la variante `qpa` añade la respuesta débil y pregunta "¿es correcta la respuesta propuesta?". La probabilidad de "sí" es la probabilidad de que la etapa débil baste. Los umbrales se calibran sobre validación en pasos de 0,05 por etapa, con tres reglas de operación: `near_strong` (el punto más barato dentro del 1 % de precisión de siempre-fuerte), `peak` (el punto más preciso) y `parity` (el punto más barato con precisión igual o superior a siempre-fuerte).

## Capacidades

- Clasificación binaria de decisión de enrutamiento: emite P(sí) para dos preguntas de sí/no, una por etapa del pipeline.
- Enrutamiento de recuperación: decide entre recuperador débil (Qwen2.5-7B-Instruct) y fuerte (Qwen2.5-72B-Instruct).
- Enrutamiento de respuesta: decide entre respondedor débil (Llama-3.2-3B-Instruct) y fuerte (Llama-3.1-70B-Instruct).
- Variante `qpa` con lectura de la respuesta débil para validar su corrección antes de escalar.
- Soporte de ensemble por semilla: media de probabilidades de las tres semillas publicadas.
- Tres reglas de operación precalibradas (`near_strong`, `peak`, `parity`) seleccionables mediante `systemone.json`.
- Procesamiento por lotes en GPU (bf16, batches de 16) para reproducir puntuaciones guardadas.
- No soporta tool calling, agentes multi-paso, visión, audio ni generación de texto libre: es un clasificador especializado.

## Casos de uso

- Enrutamiento de coste en pipelines RAG de producción: el router decide por consulta si invocar el recuperador de 72B o el de 7B, reduciendo el coste medio de recuperación sin degradar la precisión más de un margen configurable (por defecto, 1 %).
- Enrutamiento de la etapa de generación: tras recuperar pasajes, decide si Llama-3.2-3B-Instruct basta o si hay que llamar a Llama-3.1-70B-Instruct, lo que permite servir la mayoría de consultas con un modelo de 3B.
- Control de presupuesto por SLA: con la regla `near_strong`, el autor reporta 74,81 % de precisión a un precio de 552,7 frente a 76,77 % a 929,0 de siempre-fuerte, es decir, un 2,6 % menos de precisión a un 60 % del coste.
- Validación de respuestas en cascada: la variante `qpa` permite comprobar la respuesta del modelo pequeño antes de escalar, útil en sistemas con verificación de calidad por etapas.
- Investigación en enrutamiento a nivel de etapa (SLR): el modelo y el código (`systemone_decider.route.MenuRouter`) sirven como referencia reproducible para comparar políticas de enrutamiento aprendidas frente a rutas fijas.
- Despliegue con ensemble de semillas: la media de probabilidades de las tres semillas ofrece una decisión más estable (AIQ 0,722 frente a 0,719 de una sola semilla) a cambio de triplicar las llamadas al juez.
- Recalibración en dominios propios: el autor indica que los umbrales deben recalibrarse sobre validación propia si se cambian los modelos del menú o el prompt de recuperación.

## Benchmarks y rendimiento

Resultados sobre el split SLR del conjunto de desarrollo de HotpotQA (1.481 preguntas de test). AIQ es el área bajo la curva precisión-coste sobre los umbrales elegidos en validación; los precios siguen la Tabla 5 de AgentTTS (de 80 a 1.009).

| Configuración | AIQ | AIQ con coste propio del juez |
|---|---|---|
| Seed 0 (raíz) | 0,719 [0,698; 0,740] | 0,718 |
| Media de semillas individuales ± sd | 0,719 ± 0,001 | 0,719 |
| Ensemble de tres semillas (media de P) | 0,722 | 0,720 |
| Ensemble de tres semillas, preguntas no vistas | 0,725 | no disponible |
| Router SFT SLR (etiqueta), Qwen2.5-1.5B LoRA | 0,724 | no imputado |
| Router SFT SLR (etiqueta) + recompensa | 0,725 | no imputado |
| Las cuatro rutas fijas | 0,693 | no disponible |

Puntos de operación en test (umbrales elegidos en validación):

| Configuración | Precisión | Precio | Umbrales |
|---|---|---|---|
| Seed 0, `near_strong` (por defecto) | 74,81 % | 552,7 (+1,7 del juez) | [0,85, 1,0, 0,9] |
| Seed 0, `peak` | 76,77 % | 1.009,0 | [1,0, 1,0, 1,0] |
| Seed 0, `parity` | 76,77 % | 1.009,0 | [1,0, 0,0, 1,0] |
| Ensemble de tres semillas, `peak` | 76,77 % | 1.009,0 | [1,0, 1,0, 1,0] |
| SFT SLR (etiqueta), `peak` | 76,70 % | 834,8 | [0,95, 1,0, 1,0] |
| Siempre-fuerte, sin router | 76,77 % | 929,0 | no aplica |

Diferencias frente a los routers SFT SLR: seed 0 es peor que SFT (etiqueta) en −0,005 AIQ (IC 95 % −0,011 a −0,000) y que SFT (etiqueta) + recompensa en −0,007 (IC 95 % −0,013 a −0,002). El ensemble no muestra diferencia significativa frente a SFT (etiqueta) (−0,002; IC 95 % −0,008 a +0,003) y es peor frente a SFT + recompensa solo al imputar el coste propio del juez (−0,005; IC 95 % −0,011 a −0,000).

## Requisitos de hardware

- El autor indica que el juez ejecuta el torso del Strands Decider 2B y que se necesita GPU para una velocidad útil.
- Inferencia recomendada en bf16 con batches de 16 para reproducir las puntuaciones guardadas.
- VRAM estimada: no disponible en la información proporcionada; por el tamaño de 2B en bf16, el peso de los parámetros ronda los 4 GB, aunque la memoria total depende del contexto y del batch.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU consumer con al menos 8-12 GB de VRAM debería alojar el modelo en bf16, pero este dato no está confirmado en la información disponible.
- Opciones de despliegue: el paquete propio `systemone-decider` (`pip install git+https://github.com/mohameddhameem/systemone-decider`), con la clase `MenuRouter`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor solo indica que `retrieval` y `answer` puntúan un ítem a la vez y que el padding difiere, con variaciones de hasta 0,013 en las puntuaciones sobre 16 ítems comprobados por semilla.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SystemOne-Decider 2B qp menu | 2B | no disponible | Enrutador de dos etapas sobre HotpotQA | Apache 2.0 | Hugging Face y GitHub del autor |
| Router SFT SLR (etiqueta), Qwen2.5-1.5B LoRA | 1,5B | no disponible | Enrutador SLR de referencia | no disponible | citado en la model card, sin enlace |
| Strands Decider 2B hobson v21 | 2B | no disponible | Modelo base del decider | no disponible | Hugging Face (`StrandsAgents/strands-decider-2B-hobson-v21`) |

El router SFT SLR de 1,5B obtiene AIQ 0,724 (0,725 con recompensa), ligeramente por encima de la semilla 0 de este modelo (0,719) y en línea con el ensemble (0,722). En el punto `peak`, el SFT SLR alcanza 76,70 % a precio 834,8, frente a 76,77 % a 1.009,0 de este modelo. No se dispone de datos de otros enrutadores comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente sobre HotpotQA, con un solo menú de modelos y un solo prompt de recuperación; la generalización a otros dominios no está demostrada.
- Los estados de entrada son las referencias seleccionadas por los recuperadores en formato "[k] title: text" por línea; el juez conserva lo que sigue al primer "Selected references:" tal como en entrenamiento.
- Los umbrales deben recalibrarse sobre validación propia antes de usar otros modelos o prompts; los publicados solo son válidos para el menú descrito.
- En varias semillas, las reglas `peak` y `parity` colapsan a siempre-fuerte (umbrales [1,0, 1,0, 1,0]), por lo que el ahorro real depende de la semilla y de la distribución de puntuaciones.
- Solo soporta inglés; no hay soporte multilingüe declarado.
- No es un modelo generativo: no produce respuestas, solo probabilidades de decisión; no soporta tool calling ni razonamiento multi-paso.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de calibración: una pregunta justo en el umbral puede caer a un lado u otro según el padding (variaciones de hasta 0,013).
- El coste del propio juez debe contabilizarse; el ensemble de tres semillas triplica las llamadas por decisión.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los modelos del menú (Qwen2.5, Llama 3.x) tienen sus propias licencias que deben verificarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación independiente por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohameddhameem/systemone-decider-2b-qp-menu-a
- Modelo base: https://huggingface.co/StrandsAgents/strands-decider-2B-hobson-v21
- Código: https://github.com/mohameddhameem/systemone-decider
- Proyecto STAIR: https://github.com/mohameddhameem/STAIR
- Dataset: https://huggingface.co/datasets/hotpotqa/hotpot_qa
