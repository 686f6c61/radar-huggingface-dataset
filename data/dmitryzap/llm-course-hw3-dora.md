# DmitryZap/llm-course-hw3-dora

## Resumen

DmitryZap/llm-course-hw3-dora es un ajuste fino (fine-tuning) del modelo HuggingFaceTB/SmolLM2-135M-Instruct, un transformer decoder-only de 134.515.008 parametros. El autor lo ha especializado en clasificacion de sentimiento sobre tweets en ingles, devolviendo una de tres etiquetas: `negative`, `neutral` o `positive`. El modelo se distribuye con pesos ya fusionados (merged) y licencia Apache 2.0.

La tecnica de adaptacion es DoRA (Weight-Decomposed Low-Rank Adaptation), que descompone la actualizacion de pesos en una correccion de direccion y un multiplicador de magnitud independiente, con rango de adaptador 8 y alpha 16. El entrenamiento se realizo en tres pasadas sobre subconjuntos del dataset cardiffnlp/tweet_eval (12.000, 12.000 y 9.000 tweets respectivamente, la ultima con clases balanceadas).

Su relevancia es acotada: se trata de un ejercicio de curso (identificado como "hw3" y "llm-course"), con cero descargas y cero likes en el momento de la consulta, y una unica tarea practica. Resulta util como referencia de como aplicar DoRA sobre un modelo pequeno para una tarea de clasificacion con formato generativo, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-135M-Instruct, un transformer decoder-only de la familia SmolLM2 de Hugging Face, y aplica sobre el un adaptador DoRA. DoRA descompone cada matriz de pesos en magnitud y direccion, aplicando la actualizacion de bajo rango solo a la direccion y aprendiendo un multiplicador escalar para la magnitud. La configuracion empleada es rango 8 y alpha 16. Los pesos del adaptador se han fusionado con los del modelo base, por lo que el repositorio contiene un unico conjunto de pesos listos para inferencia directa con transformers.

El entrenamiento consistio en tres pasadas: dos sobre muestras de 12.000 tweets y una tercera sobre 9.000 ejemplos nuevos con el mismo numero de tweets de cada clase (balanceo de clases). El dataset es cardiffnlp/tweet_eval, la variante de analisis de sentimiento de tweets en ingles. No se documenta el numero total de tokens procesados ni si se aplico RLHF o DPO; el ajuste es supervisado sobre pares tweet-etiqueta. La tarea se formula como generacion de una etiqueta en minusculas mediante chat template, con un system prompt que instruye a interpretar jerga y sarcasmo.

## Capacidades

- Clasificacion de sentimiento de tweets en ingles en tres clases: `negative`, `neutral`, `positive`.
- Generacion de texto condicionada por chat template (formato conversacional heredado de SmolLM2-135M-Instruct).
- Respuesta con etiqueta unica y sin explicacion, segun el system prompt de referencia.
- Manejo de jerga y sarcasmo dentro del contexto del tweet, segun la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Moderacion y monitorizacion de redes sociales: clasificar en lote tweets en ingles para detectar sentimiento negativo hacia una marca o producto, aprovechando el bajo coste de inferencia de un modelo de 135M parametros.
- Analisis de opinion en tiempo real en un pipeline de streaming: el modelo cabe en CPU y permite procesar volumenes altos de tweets con latencia baja por peticion.
- Enrutamiento de quejas en atencion al cliente: usar la etiqueta `negative` como senal para derivar automaticamente un ticket a un agente humano o a un flujo prioritario.
- Etiquetado asistido de datasets: pre-anotar grandes volumenes de tweets en ingles antes de una revision humana, reduciendo el coste de anotacion manual.
- Investigacion academica sobre DoRA y PEFT: servir como ejemplo reproducible de ajuste con DoRA sobre un modelo pequeno, con metrica F1 documentada y notebook de entrenamiento.
- Clasificacion ligera en dispositivos con recursos limitados: al tratarse de un modelo de 0,3 GB en safetensors, puede ejecutarse en entornos sin GPU dedicada para tareas de sentimiento puntuales.
- Filtrado previo en sistemas RAG o de monitorizacion: descartar o priorizar contenido negativo antes de pasarlo a un modelo mayor, reduciendo costes de inferencia.

## Benchmarks y rendimiento

Evaluacion sobre la particion de test de TweetEval Sentiment (12.284 tweets), segun la model card del autor:

| Metrica | Valor |
|---|---|
| F1 (formula de la tarea, incluye clase `invalid`) | 0,5110 (partiendo de 0,1628 en el modelo base) |
| F1 medio sobre las tres clases | 0,6814 |
| F1 `negative` | 0,7341 |
| F1 `neutral` | 0,6436 |
| F1 `positive` | 0,6663 |
| F1 `invalid` | 0,0000 (un unico respuesta invalida) |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,54 GB solo para pesos (134,5M parametros x 4 bytes), mas activaciones y cache KV.
- VRAM estimada en fp16/bf16: aproximadamente 0,27 GB para pesos.
- Cabe en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) y en CPU sin problemas.
- Despliegue: transformers es la via documentada por el autor. vLLM, llama.cpp, Ollama y TGI no estan documentados para este repositorio, aunque el tag `text-generation-inference` aparece en los metadatos de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera una latencia por debajo de decenas de milisegundos en GPU moderna para generar 16 tokens, pero no hay medicion publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DmitryZap/llm-course-hw3-dora | 134,5M | no disponible | Clasificacion de sentimiento en tweets | Apache 2.0 | Hugging Face, 0 descargas |
| HuggingFaceTB/SmolLM2-135M-Instruct (base) | 135M | no disponible | Generacion de texto general | Apache 2.0 | Hugging Face, ampliamente usado |
| cardiffnlp/twitter-roberta-base-sentiment-latest | no disponible | no disponible | Clasificacion de sentimiento en tweets | no disponible | Hugging Face, referencia habitual en TweetEval |

La comparacion con el modelo base es directa: este ajuste mejora el F1 de la formula de la tarea de 0,1628 a 0,5110, a costa de especializarse y perder capacidades generales de generacion. Frente a clasificadores dedicados como los de CardiffNLP, la ventaja es el formato generativo y la integracion con chat template; la desventaja es un rendimiento inferior esperado y una menor validacion externa.

## Limitaciones y advertencias

- Especializado exclusivamente en sentimiento de tweets en ingles; su uso fuera de ese dominio producira etiquetas poco fiables.
- Riesgo de alucinacion: al formularse como generacion, puede producir respuestas que no sean exactamente una de las tres etiquetas; en la evaluacion se registro una respuesta `invalid`.
- El F1 global de 0,5110 es moderado; la clase `neutral` es la mas debil (0,6436), lo que sugiere confusion con las clases polares.
- Sesgos inheridos del dataset TweetEval y del modelo base SmolLM2, no evaluados ni documentados por el autor.
- Sin validacion externa: cero descargas y cero likes, sin pruebas independientes de robustez.
- Uso comercial permitido por la licencia Apache 2.0, pero sin garantias del autor; conviene evaluar en el dominio concreto antes de desplegar.
- Longitud de contexto no documentada en la informacion disponible; no se recomienda para entradas largas.
- No dispone de tool calling, agentes ni capacidades multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DmitryZap/llm-course-hw3-dora
- Notebook de entrenamiento y evaluacion: https://huggingface.co/DmitryZap/llm-course-hw3-lora/blob/main/HSU_hw3_peft.ipynb
- Metricas por epoca: https://huggingface.co/DmitryZap/llm-course-hw3-dora/blob/main/metrics.json
- Dataset TweetEval Sentiment: https://huggingface.co/datasets/cardiffnlp/tweet_eval
- Modelo base SmolLM2-135M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
