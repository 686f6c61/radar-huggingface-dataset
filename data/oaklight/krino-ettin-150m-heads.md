# oaklight/krino-ettin-150m-heads

## Resumen

Krino Adapter: ettin-reranker-150m-v1 (identificador `oaklight/krino-ettin-150m-heads`) es un adaptador de clasificación desarrollado por el usuario oaklight que convierte un codificador de texto congelado en un modelo de decisión tipada. Sobre el backbone `cross-encoder/ettin-reranker-150m-v1` (149 millones de parámetros, encoder ModernBERT preentrenado como reranker) se montan tres cabezas ligeras que producen decisiones estructuradas de tipo «noul» (probabilidad binaria sí/no), «choice» (distribución softmax sobre opciones) y «score» (valor escalar esperado), en lugar de texto generado.

El conjunto de cabezas entrenaables es muy reducido: 597K parámetros sobre un backbone congelado de 149M (un 0,4% del total), lo que lo convierte en un adaptador extremadamente ligero. El autor reporta una precisión agregada del 57,9% sobre 19 benchmarks de NLU (agnews, mnli, fever, sst2, mednli, banking77, hellaswag, arc, stsb y otros), con un rango que va del 88,0% en agnews al 32,6% en stsb.

Su relevancia actual radica en el enfoque de «decisión tipada»: en lugar de generar texto libre, el modelo emite directamente estructuras que un agente puede consumir sin parseo posterior. Está diseñado como componente de enrutamiento o filtrado dentro de pipelines más amplios, no como un modelo generativo autónomo. La licencia es MIT y el idioma soportado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT (backbone `cross-encoder/ettin-reranker-150m-v1`) con cabezas de decisión ligeras (NoulHead, ChoiceHead, ScoreHead) |
| Parametros totales | 149M en el backbone congelado + 597K entrenables en las cabezas (≈150M en total) |
| Parametros activos | No aplica (no es MoE); 597K entrenables sobre 149M congelados |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de Hugging Face; tamano declarado 0.0 GB) |

## Arquitectura y entrenamiento

La arquitectura encadena un estado textual de entrada (`state`) a través del backbone `ettin-reranker-150m-v1`, un encoder ModernBERT preentrenado como reranker con 149M de parámetros que permanece congelado. Sobre sus estados ocultos se conectan tres cabezas independientes: `NoulHead` (capa lineal seguida de sigmoide, que produce P(yes)), `ChoiceHead` (atención cruzada seguida de softmax, que produce P(option_k)) y `ScoreHead` (atención cruzada que devuelve un valor esperado). El adaptador usa cabezas de atención de rango 128. El modelo base Ettin fue desarrollado por Johns Hopkins University (grupo jhu-clsp) en colaboración con LightOn.

El entrenamiento es multi-tarea sobre 19 benchmarks de NLU, con muestreo balanceado por tipo de decisión y 20 épocas. No se menciona en la información disponible el uso de RLHF, DPO ni ningún pipeline de alineación adicional; el adaptador se entrena con las cabezas como únicas partes actualizadas. La innovación principal es la propia interfaz de salida: decisiones tipadas, calibradas y consumibles programáticamente (`noul`, `choice`, `score`), pensadas para integrarse en agentes y sistemas de enrutamiento. No se detalla la composición exacta del dataset de entrenamiento ni el número total de tokens.

## Capacidades

- Clasificación de texto en modo `choice`: selección de una categoría entre un conjunto de opciones definidas por el usuario (precisión agregada del 56,1% en este tipo).
- Decisión binaria `noul`: estimación de probabilidad sí/no sobre una afirmación (precisión agregada del 64,4%).
- Puntuación `score`: emisión de un valor escalar esperado, útil para tareas de sentimiento o similitud graduada (precisión agregada del 50,3%).
- Inferencia de intención en conversaciones: el ejemplo de la model card muestra la clasificación de una queja de cliente en intenciones como `track_order`, `cancel_order` o `report_damage`.
- Razonamiento de tipo NLI: inferencia de lenguaje natural y detección de contradicciones (evaluado en mnli, mednli, contractnli, fever).
- Clasificación temática y de tópicos (agnews).
- Categorización de fragmentos de código (codesearchnet).
- Verificación de hechos a nivel de frase (fever).
- No soporta tool calling, function calling ni generación de texto: no es un modelo generativo.
- Sin soporte multilingüe: únicamente inglés.
- No dispone de modo *thinking*, visión ni audio.

## Casos de uso

- Enrutamiento de intenciones en atención al cliente: dado un mensaje entrante y un diccionario de intenciones (`track_order`, `cancel_order`, `report_damage`), el modelo devuelve la opción más probable en una sola pasada, sin generación de texto y con latencia mínima por su tamano de 150M.
- Triaje y etiquetado de tickets de soporte: clasificación del mensaje en categorías predefinidas (`banking77`, 58,2% de precisión en este benchmark) para asignarlo automáticamente al equipo o flujo correspondiente.
- Detección de contradicciones en documentación: uso del modo `noul` sobre pares de textos para identificar inconsistencias (mnli 80,2%, contractnli 57,6%), adecuado en revisión de contratos o bases de conocimiento.
- Moderación y filtrado binario de contenido: aplicación del modo `noul` para aceptar o rechazar textos según criterios configurables, con salida probabilística directamente utilizable como umbral.
- Verificación de hechos de baja latencia: contraste de afirmaciones contra evidencia textual (fever, 72,2% en modo `choice`) como paso previo a una revisión humana o a un sistema RAG más costoso.
- Puntuación de sentimiento y calidad: emisión de un valor escalar continuo para clasificar reseñas (yelp 60,2%, sst5 53,6%) o similitud semántica (stsb 32,6%).
- Categorización de código en pipelines de ingeniería: etiquetado de fragmentos de código por tipo o función (codesearchnet 72,7%) dentro de herramientas de análisis estático o indexación.
- Clasificación temática de noticias: asignación de categorías a titulares o resúmenes (agnews, 88,0%), el caso con mejor rendimiento reportado.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Tipo de cabeza | Precision |
|---|---|
| Choice | 56,1% |
| Noul | 64,4% |
| Score | 50,3% |
| **Agregado** | **57,9%** |

Desglose por benchmark:

| Benchmark | Tipo | Precision |
|---|---|---|
| agnews | choice | 88,0% |
| mnli | noul | 80,2% |
| codesearchnet | choice | 72,7% |
| fever | choice | 72,2% |
| sst2 | noul | 71,4% |
| mednli | noul | 67,2% |
| typed_decisions | choice | 61,8% |
| yelp | score | 60,2% |
| banking77 | choice | 58,2% |
| contractnli | noul | 57,6% |
| multirc | noul | 57,0% |
| sst5 | score | 53,6% |
| tabfact | noul | 53,2% |
| hellaswag | choice | 47,2% |
| swag | choice | 46,2% |
| arc | choice | 41,0% |
| race | choice | 35,4% |
| stsb | score | 32,6% |

No se han publicado resultados de latencia ni throughput en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: por el tamano del modelo (≈150M parámetros), aproximadamente 0,6 GB en FP32, 0,3 GB en FP16/BF16 y en torno a 0,15 GB en cuantización INT8. Estas cifras son estimaciones basadas en el número de parámetros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo también puede ejecutarse en CPU sin problemas por su tamano reducido. No se especifican GPUs concretas en la documentación.
- Cabe holgadamente en GPUs de consumo (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en iGPU y dispositivos de borde. El autor mantiene un repositorio de inferencia en OpenVINO para Intel Meteor Lake, lo que apunta a despliegue en hardware integrado.
- Opciones de despliegue: la model card muestra uso mediante la librería `krino` con `KrinoModel.from_pretrained(...)`. Al ser un modelo de clasificación de Hugging Face, es compatible con `transformers`; no se mencionan explícitamente vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo estas herramientas no son aplicables de forma estándar.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros backbone | Parametros entrenables | Tipo de salida | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| oaklight/krino-ettin-150m-heads | 149M (congelado) | 597K | Decisiones tipadas (noul/choice/score) | en | MIT | Hugging Face |
| oaklight/krino-qwen3.5-4b-heads | 4B (familia Qwen3.5) | no disponible | Decisiones tipadas | en | MIT | Hugging Face |
| cross-encoder/ettin-reranker-150m-v1 | 149M | Modelo completo entrenado | Puntuación de reranking | en | no disponible | Hugging Face |
| jhu-clsp/ettin-encoder-150m | 149M | Modelo completo entrenado | Embeddings de encoder | en | no disponible | Hugging Face |

La variante `krino-qwen3.5-4b-heads` del mismo autor emplea un backbone de 4B parámetros, lo que implica mayor coste de inferencia y presumiblemente mayor capacidad, aunque no se han publicado sus cifras comparativas en la información disponible. Los modelos `ettin-reranker-150m-v1` y `ettin-encoder-150m` son los backbones y variantes base de la familia Ettin, orientados a reranking y embeddings respectivamente, no a decisión tipada, por lo que la comparación directa de precisión no es posible.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo decisiones estructuradas (`noul`, `choice`, `score`). No soporta tool calling ni razonamiento multi-paso.
- Únicamente soporta inglés; no hay capacidades multilingües declaradas.
- Rendimiento modesto y desigual: la precisión agregada es del 57,9%, con benchmarks por debajo del 50% (arc 41,0%, race 35,4%, stsb 32,6%) que pueden ser insuficientes para producción sin ajuste o umbrales de confianza.
- Riesgo de error de clasificación inherente: al ser un clasificador, puede asignar categorías incorrectas o probabilidades mal calibradas en dominios alejados de los datos de entrenamiento (domain shift). No se documentan sesgos específicos.
- No se detalla la composición del dataset de entrenamiento, por lo que no es posible auditar sesgos de dominio, demográficos o de estilo.
- Advertencia sobre licencia: el adaptador es MIT, pero el backbone base (`cross-encoder/ettin-reranker-150m-v1`) tiene licencia no especificada en la información disponible; conviene verificar las condiciones del modelo base antes de un uso comercial.
- El repositorio declara 0 descargas y 0 likes, y un tamano de 0,0 GB, lo que sugiere que los pesos pueden no estar subidos o que el modelo es muy reciente; verificar la disponibilidad real de los ficheros antes de integrarlo.
- Dependencia de la librería `krino` para el uso documentado, lo que añade una dependencia de software no estándar.
- No se documentan la longitud de contexto soportada ni los formatos de cuantización, lo que limita la planificación precisa de despliegues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oaklight/krino-ettin-150m-heads
- Backbone base: https://huggingface.co/cross-encoder/ettin-reranker-150m-v1
- Variante de la misma familia: https://huggingface.co/oaklight/krino-qwen3.5-4b-heads
- Modelo Ettin encoder 150M: https://huggingface.co/jhu-clsp/ettin-encoder-150m
- Paper de Ettin: https://arxiv.org/html/2507.11412v1
- Blog de LightOn sobre la suite Ettin: https://lighton.ai/lighton-blogs/introducing-ettin-suite-the-sota-open-recipe-to-outperform-existing-generative-retrieval-models
- Repositorio de inferencia OpenVINO del autor: https://github.com/Oaklight/openvino-meteor-lake-ai-inference
