# aramkris/tinystories-arm-124m-chat-dpo

## Resumen

`aramkris/tinystories-arm-124m-chat-dpo` es un modelo de lenguaje conversacional de 124 millones de parámetros desarrollado por el usuario independiente aramkris. Se trata de la etapa final de un pipeline de alineamiento aplicado sobre un GPT entrenado desde cero (from scratch) en el repositorio `tinystories-ARM-model`. La particularidad de esta versión es que, tras un ajuste supervisado (SFT) sobre el modelo base, se ha aplicado una ronda de optimización directa de preferencias (DPO) orientada específicamente a reducir la repetición en las respuestas generadas.

El modelo parte de `aramkris/tinystories-arm-124m-chat-sft`, que a su vez deriva del modelo base `aramkris/tinystories-arm-124m-base`. La innovación principal de esta iteración DPO es metodológica: se generaron 2.000 pares de preferencia a partir de preguntas de `HuggingFaceTB/smol-smoltalk`, donde la respuesta de referencia del dataset se prefiere frente a la respuesta greedy del propio modelo SFT. El entrenamiento DPO completo se ejecutó en 19 minutos sobre un Apple M5.

Es relevante ahora como ejemplo reproducible de alineamiento a pequeña escala: demuestra que una ronda de DPO de coste mínimo (menos de media hora en hardware de consumo) puede reducir a la mitad la tasa de repetición de 4-gramos (del 12,4% al 6,5%) y aumentar la proporción de respuestas que terminan por sí solas (del 70% al 86%), a cambio de un ligero empeoramiento en la pérdida sobre las respuestas de referencia (de 1,156 a 1,196).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT (transformer decoder-only, entrenado desde cero) |
| Parametros totales | 124M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch `.pt`) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best_model_params.pt`), tokenizador tiktoken `gpt2` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de estilo GPT con 124 millones de parámetros, entrenado desde cero en el proyecto `tinystories-ARM-model`. No es un modelo derivado de un checkpoint preentrenado de terceros: el preentrenamiento se realizó sobre una mezcla de `BaoMinhTran/mini-fineweb-edu` y `HuggingFaceTB/cosmopedia`. El tokenizador utilizado es el de GPT-2 vía `tiktoken`. El modelo no emplea tokens especiales de chat: el formato conversacional es texto plano con prefijos `User: …` y `Assistant: …`, y la respuesta termina con el token `<|endoftext|>`.

El pipeline de alineamiento tiene dos etapas. Primero un SFT que produce `tinystories-arm-124m-chat-sft`. Después, esta versión aplica DPO con 2.000 pares de preferencia construidos a partir de preguntas de `HuggingFaceTB/smol-smoltalk`, donde la respuesta de referencia del dataset se marca como preferida frente a la respuesta greedy generada por el modelo SFT. El objetivo declarado del DPO es reducir la repetición, no mejorar la corrección factual. El entrenamiento DPO se completó en 19 minutos en un Apple M5.

## Capacidades

- Generación de texto conversacional en inglés con formato `User:` / `Assistant:` y terminación mediante `<|endoftext|>`.
- Respuesta a preguntas de conocimiento general y de sentido común, aunque con la base de conocimiento limitada del modelo de 124M.
- Reducción de repetición respecto al modelo SFT: tasa de 4-gramos repetidos del 6,5% frente al 12,4% del SFT.
- Mayor tasa de respuestas que terminan de forma autónoma: 86% frente al 70% del SFT.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no, solo inglés.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación y docencia sobre alineamiento: el modelo sirve como caso de estudio reproducible de un pipeline SFT + DPO completo sobre un GPT de 124M, con métricas antes/después publicadas y tiempos de entrenamiento concretos (19 minutos en M5).
- Experimentación con DPO a bajo coste: permite reproducir la construcción de pares de preferencia (respuesta de referencia vs. respuesta greedy del propio modelo) y medir el efecto sobre repetición y terminación sin necesidad de GPUs de datacenter.
- Generación de texto creativo corto en inglés: cuentos, descripciones y respuestas breves donde la reducción de repetición respecto al SFT mejora la legibilidad.
- Chatbot de demostración y prototipado: al caber en CPU (la model card muestra inferencia en `"cpu"`), sirve para validar pipelines de conversación antes de escalar a modelos mayores.
- Evaluación de metodologías de alineamiento: útil para comparar el impacto de DPO frente a SFT sobre benchmarks estandarizados (media de 38,4 frente a 38,5 del SFT y 42,3 del base).
- Generación de datos sintéticos de bajo coste: como generador de respuestas candidatas en inglés para tareas de filtrado o anotación auxiliar, asumiendo baja fiabilidad factual.

## Benchmarks y rendimiento

Datos publicados en la model card, medidos sobre 100 preguntas retenidas con decodificación greedy:

| Modelo | Pérdida sobre respuestas de referencia | 4-gramos repetidos | Respuestas que terminan | Media en benchmarks |
|---|---|---|---|---|
| Base (tinystories-arm 124M) | no disponible | no disponible | no disponible | 42,3 |
| SFT | 1,156 | 12,4% | 70% | 38,5 |
| SFT + DPO (este modelo) | 1,196 | 6,5% | 86% | 38,4 |

No se detallan en la información disponible los nombres de los cinco benchmarks que componen la media ni los resultados individuales por benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 124M de parámetros en fp32 los pesos ocupan aproximadamente 0,5 GB, por lo que la inferencia cabe holgadamente en cualquier GPU de consumo e incluso en CPU.
- GPU recomendadas: no se especifican; el ejemplo de la model card ejecuta la inferencia en CPU (`"cpu"`).
- Cabe en GPU de consumo: sí, cualquier GPU con al menos ~1 GB de memoria libre en fp32.
- Opciones de despliegue: el proyecto oficial `tinystories-ARM-model` (carga vía `inference.load_model` y `sft.answer`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y los pesos no se distribuyen en GGUF.
- Latencia y throughput: no disponibles; el único dato de tiempo es el entrenamiento DPO (19 minutos en Apple M5).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tinystories-arm-124m-chat-dpo | 124M | no disponible | 38,4 | MIT | Hugging Face + repo GitHub |
| tinystories-arm-124m-chat-sft | 124M | no disponible | 38,5 | MIT (según repo) | Hugging Face |
| tinystories-arm-124m-base | 124M | no disponible | 42,3 | MIT (según repo) | Hugging Face |

No se dispone en la información proporcionada de comparaciones con modelos externos de tamaño similar (por ejemplo, GPT-2 small o modelos TinyStories de terceros), por lo que la comparativa se limita a las tres variantes del mismo proyecto.

## Limitaciones y advertencias

- Conocimiento factual muy limitado: la propia model card advierte que responde "en la forma correcta pero con el conocimiento del modelo base: plausibles y a menudo erróneas en cuestiones de hechos".
- Sesgos: no documentados en la información disponible; al entrenarse sobre `mini-fineweb-edu` y `cosmopedia` es previsible que herede sesgos de esos corpus, sin que el autor los analice.
- Riesgo de alucinación: alto, coherente con un modelo de 124M y con la advertencia explícita del autor sobre errores factuales.
- Idioma: solo inglés; no hay soporte multilingüe declarado.
- Longitud de contexto: no documentada, lo que dificulta planificar su uso en conversaciones largas.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero sin garantías y con la salvedad de la baja fiabilidad factual.
- Caveat de producción: el DPO reduce repetición y mejora la terminación a costa de un empeoramiento leve de la pérdida (1,156 → 1,196); no debe interpretarse como una mejora global de calidad.
- Formato de pesos propietario del proyecto (`.pt` más `model_config.json`), sin conversión documentada a formatos estándar de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aramkris/tinystories-arm-124m-chat-dpo
- Modelo SFT base: https://huggingface.co/aramkris/tinystories-arm-124m-chat-sft
- Modelo base: https://huggingface.co/aramkris/tinystories-arm-124m-base
- Repositorio del proyecto: https://github.com/a-ramakrishnan/tinystories-ARM-model
- Dataset de preentrenamiento: https://huggingface.co/datasets/BaoMinhTran/mini-fineweb-edu
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset de preferencias: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
