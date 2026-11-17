# aramkris/fineweb-edu-124m-chat-sft

## Resumen

FineWeb-Edu 124M chat (SFT) es un modelo de lenguaje de tipo GPT entrenado desde cero por el desarrollador independiente aramkris, y publicado como la variante conversacional del modelo base `aramkris/fineweb-edu-124m-base`. Se trata de un modelo pequeno, de aproximadamente 124 millones de parametros, ajustado mediante SFT (supervised fine-tuning) sobre 409.000 conversaciones del dataset smol-smoltalk, con calculo de perdida unicamente sobre los tokens del asistente. El entrenamiento se completo en 11.284 actualizaciones, unas 19 minutos en una A100 de Colab.

El modelo responde en un formato de texto plano `User: ...` / `Assistant: ...`, sin tokens especiales, y termina sus respuestas con el token `<|endoftext|>`. Su interes es fundamentalmente experimental y educativo: demuestra el ciclo completo de preentrenamiento desde cero sobre datos FineWeb-Edu y posterior alineacion conversacional en un presupuesto minimo. No es un modelo pensado para produccion ni para tareas que requieran conocimiento factual fiable.

El autor advierte explicitamente de que el modelo "responde con la forma correcta pero con el conocimiento del modelo base: plausible y a menudo incorrecto en cuestiones de hechos". La ficha siguiente recoge exclusivamente los datos publicados en la model card y en los metadatos de Hugging Face; cualquier dato no disponible se indica como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT (transformer decoder-only) entrenado desde cero con el framework tinystories-ARM-model |
| Parametros totales | 124M (segun el nombre del modelo; no se detalla desglose) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en formato PyTorch `.pt`) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best_model_params.pt`), configuracion en `model_config.json`; no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo GPT, entrenado desde cero dentro del proyecto tinystories-ARM-model. El preentrenamiento se realizo sobre el dataset `BaoMinhTran/mini-fineweb-edu` (segun los tags de Hugging Face), y el ajuste supervisado (SFT) se llevo a cabo sobre 409.000 conversaciones de `HuggingFaceTB/smol-smoltalk`, complementadas en el ecosistema del proyecto con `HuggingFaceTB/cosmopedia`. La perdida durante el SFT se calcula unicamente sobre las palabras del asistente, lo que concentra el aprendizaje en el turno de respuesta.

El entrenamiento consta de 11.284 actualizaciones y se completo en 19 minutos sobre una GPU A100 en Colab. No se documentan en la informacion disponible detalles sobre el numero total de tokens de preentrenamiento, la composicion exacta del corpus, ni el uso de RLHF o DPO en esta variante (existe una version DPO separada, `aramkris/fineweb-edu-124m-chat-dpo`). Tampoco se describen innovaciones arquitectonicas como atencion lineal o decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional en formato plano `User: ...` / `Assistant: ...`, sin tokens especiales, terminando la respuesta con `<|endoftext|>`.
- Respuesta a preguntas de tipo general en ingles, con la forma correcta de un asistente conversacional.
- Ajuste especifico para conversaciones multi-turno segun el formato de smol-smoltalk.
- Capacidad de razonamiento y conocimiento factual limitada: el autor indica que hereda el conocimiento del modelo base y que sus respuestas son "plausibles y a menudo incorrectas en cuestiones de hechos".
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingue: solo ingles.
- No se documenta vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Experimentacion educativa sobre el ciclo completo de entrenamiento: sirve para estudiar como un modelo de 124M preentrenado desde cero adquiere un formato conversacional tras un SFT corto (19 minutos en A100), comparando el comportamiento antes y despues del ajuste.
- Investigacion sobre alineacion a bajo coste: permite reproducir y analizar el efecto del SFT con perdida solo en tokens del asistente sobre un modelo pequeno, y contrastarlo con la variante DPO publicada por el mismo autor.
- Generacion de respuestas de formato controlado: util para probar pipelines que dependen de un formato estricto `User:` / `Assistant:` y de un terminador explicito `<|endoftext|>`, sin necesidad de plantillas de chat ni tokens especiales.
- Prototipado de interfaces conversacionales en local: al ser un modelo de 124M con pesos en PyTorch y licencia MIT, puede ejecutarse en CPU para demos y pruebas de integracion sin infraestructura GPU.
- Estudio de degeneracion y repeticion en modelos pequenos: la model card reporta un 12,4% de 4-gramas repetidos y un 70% de respuestas que terminan correctamente, lo que lo convierte en un caso de analisis de estos fenomenos frente a la version DPO (6,5% y 86%).
- Base para experimentos de destilacion o comparacion de tecnicas de post-entrenamiento: al estar entrenado desde cero y con licencia permisiva, puede reutilizarse como punto de partida o como referencia en estudios comparativos de SFT, DPO y otras tecnicas.

## Benchmarks y rendimiento

La model card publica una evaluacion sobre 100 preguntas reservadas con decodificacion greedy, comparando la variante SFT con la variante DPO y con el modelo base:

| Modelo | Perdida sobre respuestas de referencia | 4-gramas repetidos | Respuestas que terminan | Media en benchmarks |
|---|---|---|---|---|
| Este modelo (SFT) | 1,156 | 12,4% | 70% | 38,5 |
| SFT + DPO | 1,196 | 6,5% | 86% | 38,4 |
| Modelo base | no disponible | no disponible | no disponible | 42,3 |

El autor senala que el ajuste por instrucciones cuesta aproximadamente 4 puntos en la media de los cinco benchmarks respecto al modelo base. No se detalla en la informacion disponible que cinco benchmarks componen esa media, ni se publican resultados individuales de MMLU, HumanEval, GSM8K u otras pruebas estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano (124M parametros) es un modelo que cabe holgadamente en cualquier GPU consumer, aunque no se publican cifras exactas.
- GPU recomendadas: no se especifican; el entrenamiento se realizo en una A100 de Colab. Para inferencia, cualquier GPU con suficiente memoria para un modelo de este tamano es suficiente, aunque el dato no esta documentado.
- Cabe en GPU consumer: si, por el reducido numero de parametros; el autor demuestra la inferencia en CPU en el ejemplo de uso.
- Opciones de despliegue: el autor proporciona un flujo propio basado en el repositorio `tinystories-ARM-model` (`python3 -m infra.model_store pull fineweb-edu-124m-chat-sft`) y carga de pesos con `load_model` y `answer` desde `inference` y `sft`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| fineweb-edu-124m-chat-sft | 124M | no disponible | MIT | PyTorch | SFT sobre 409K conversaciones de smol-smoltalk; media de 38,5 en cinco benchmarks |
| fineweb-edu-124m-chat-dpo | 124M | no disponible | MIT | PyTorch | Variante DPO del mismo autor; menor repeticion (6,5%) y mayor tasa de finalizacion (86%); media de 38,4 |
| fineweb-edu-124m-base | 124M | no disponible | MIT | PyTorch | Modelo base sin ajuste conversacional; media de 42,3 en los mismos cinco benchmarks |
| Otros modelos de ~124M | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos con alternativas de terceros en la informacion proporcionada |

## Limitaciones y advertencias

- Conocimiento factual poco fiable: el autor advierte de que el modelo responde con la forma correcta pero "a menudo incorrecto en cuestiones de hechos". No debe usarse como fuente de informacion.
- Calidad conversacional limitada: solo el 70% de las respuestas terminan correctamente y el 12,4% de los 4-gramas se repiten en la evaluacion greedy, lo que indica tendencia a la degeneracion.
- Perdida de rendimiento frente al base: el SFT reduce la media de benchmarks en unos 4 puntos (de 42,3 a 38,5).
- Solo ingles: no hay soporte multilingue documentado.
- Longitud de contexto no documentada, lo que impide garantizar conversaciones largas o documentos extensos.
- Formato de chat no estandar: usa texto plano `User:` / `Assistant:` y `<|endoftext|>`, sin tokens especiales, lo que requiere adaptar los pipelines de inferencia.
- Pesos en formato PyTorch `.pt` sin cuantizaciones publicadas (GGUF, safetensors), lo que limita su uso directo con herramientas de inferencia habituales como llama.cpp u Ollama.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias sobre la calidad o idoneidad del modelo.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; al entrenarse sobre FineWeb-Edu y smol-smoltalk, puede heredar sesgos de esos corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aramkris/fineweb-edu-124m-chat-sft
- Modelo base: https://huggingface.co/aramkris/fineweb-edu-124m-base
- Variante DPO: https://huggingface.co/aramkris/fineweb-edu-124m-chat-dpo
- Repositorio de entrenamiento (tinystories-ARM-model): https://github.com/a-ramakrishnan/tinystories-ARM-model
- Dataset de preentrenamiento: https://huggingface.co/datasets/BaoMinhTran/mini-fineweb-edu
- Dataset de SFT: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset complementario: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
