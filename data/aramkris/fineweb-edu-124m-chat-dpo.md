# aramkris/fineweb-edu-124m-chat-dpo

## Resumen

FineWeb-Edu 124M chat (SFT + DPO) es un modelo de lenguaje de 124 millones de parametros desarrollado por el usuario aramkris, entrenado desde cero con arquitectura GPT en el marco del proyecto tinystories-ARM-model. Se trata de la version conversacional del modelo base FineWeb-Edu 124M, obtenida mediante un proceso de ajuste supervisado (SFT) seguido de optimizacion por preferencias directas (DPO) orientada especificamente a reducir la repeticion en las respuestas generadas.

El modelo resuelve el problema de la verbosidad repetitiva tipica de los modelos pequenos tras el ajuste por instrucciones: el DPO se entrena con 2.000 preguntas de smol-smoltalk donde la respuesta de referencia se prefiere frente a la salida codiciosa del propio modelo SFT. El resultado es una reduccion de la repeticion de 4-gramas del 12,4% al 6,5% y un aumento de las respuestas que terminan por si solas del 70% al 86%, con un coste minimo en la perdida sobre las respuestas de referencia.

Es relevante como ejemplo reproducible de pipeline completo (preentrenamiento, SFT y DPO) sobre hardware de consumo: el entrenamiento DPO completo se ejecuto en 19 minutos en un Mac con chip M5. No obstante, sus capacidades cognitivas siguen limitadas por el modelo base de 124M, y el propio autor advierte que responde con la forma correcta pero con el conocimiento del modelo base, a menudo incorrecto en cuestiones factuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT (transformer decoder-only) entrenado desde cero |
| Parametros totales | 124 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt, best_model_params.pt) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo GPT con 124 millones de parametros, entrenado desde cero en el repositorio tinystories-ARM-model. El preentrenamiento se realizo sobre el dataset BaoMinhTran/mini-fineweb-edu, con pasos posteriores de ajuste sobre HuggingFaceTB/cosmopedia. El pipeline completo parte de un modelo base (fineweb-edu-124m-base) que obtuvo una media de 42,3 en cinco benchmarks.

Sobre ese modelo base se aplico un ajuste supervisado (SFT) que dio lugar a fineweb-edu-124m-chat-sft, y posteriormente un DPO contra la repeticion. El conjunto de preferencias del DPO consta de 2.000 preguntas de HuggingFaceTB/smol-smoltalk, donde la respuesta de referencia se marca como preferida frente a la respuesta codiciosa generada por el propio modelo SFT. El entrenamiento DPO completo se ejecuto en 19 minutos en un Mac con chip M5. El modelo no emplea tokens especiales de chat: responde en un formato plano `User: …` / `Assistant: …` y cierra la respuesta con `<|endoftext|>`.

## Capacidades

- Generacion de texto conversacional en ingles con formato `User:` / `Assistant:`.
- Respuesta a preguntas de conocimiento general, aunque con precision factual limitada por el modelo base.
- Generacion de respuestas que terminan de forma autonoma en el 86% de los casos (frente al 70% del SFT).
- Reduccion de la repeticion de 4-gramas al 6,5% (frente al 12,4% del SFT).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Experimentacion educativa con pipelines de alineacion: el modelo sirve para reproducir de principio a fin un flujo preentrenamiento, SFT y DPO en hardware de consumo, dado que el DPO completo se ejecuta en 19 minutos en un M5.
- Investigacion sobre repeticion en modelos pequenos: permite estudiar el efecto del DPO contra la repeticion midiendo la tasa de 4-gramas repetidos y la proporcion de respuestas que terminan.
- Prototipado de asistentes conversacionales de bajo coste: util para validar interfaces de chat con formato `User:` / `Assistant:` antes de escalar a modelos mayores.
- Generacion de texto controlada en entornos con recursos muy limitados: sus 124M de parametros permiten inferencia en CPU, como demuestra el ejemplo de uso del autor.
- Baseline para comparativas de ajuste: sirve como referencia de un modelo pequeno alineado frente a variantes SFT o base en evaluaciones academicas.
- Docencia sobre alineacion de modelos: el par SFT/DPO publicado permite ilustrar el compromiso entre perdida en respuestas de referencia y reduccion de repeticion.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre 100 preguntas reservadas con decodificacion codiciosa:

| Modelo | Perdida en respuestas de referencia | 4-gramas repetidos | Respuestas que terminan | Media en benchmarks |
|---|---|---|---|---|
| SFT | 1,156 | 12,4% | 70% | 38,5 |
| Este modelo (SFT + DPO) | 1,196 | 6,5% | 86% | 38,4 |
| Modelo base | no disponible | no disponible | no disponible | 42,3 |

El autor indica que el modelo base obtiene 42,3 en los mismos cinco benchmarks, por lo que el ajuste por instrucciones cuesta aproximadamente 4 puntos. No se detallan los nombres de los cinco benchmarks ni los resultados individuales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 124M de parametros en precision completa el peso ronda los 0,5 GB (tamano del repositorio), por lo que la inferencia es viable en CPU.
- GPU recomendadas: no disponibles; el autor demuestra inferencia en CPU (`load_model(cfg, ..., "cpu")`).
- Compatibilidad con GPU de consumo: si, dado el reducido tamano del modelo; no se especifican modelos concretos.
- Opciones de despliegue: el ejemplo oficial usa PyTorch con el repositorio tinystories-ARM-model y el tokenizador tiktoken (codificacion gpt2). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El unico dato temporal es el entrenamiento DPO (19 minutos en un M5).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| fineweb-edu-124m-chat-dpo | 124M | no disponible | MIT | PyTorch (.pt) | Este modelo; media 38,4 en cinco benchmarks |
| fineweb-edu-124m-chat-sft | 124M | no disponible | MIT | PyTorch (.pt) | Version SFT; media 38,5; mayor repeticion (12,4%) |
| fineweb-edu-124m-base | 124M | no disponible | MIT | PyTorch (.pt) | Modelo base; media 42,3 en los mismos benchmarks |

No se dispone de datos para comparar con modelos de otros autores de tamano o tarea similares.

## Limitaciones y advertencias

- Precision factual limitada: el propio autor advierte que el modelo responde con la forma correcta pero con el conocimiento del modelo base, a menudo incorrecto en cuestiones factuales.
- Riesgo alto de alucinacion en preguntas de conocimiento general, derivado de sus 124M de parametros y del entrenamiento sobre mini-fineweb-edu.
- Repeticion residual: aunque el DPO la reduce al 6,5% de 4-gramas, sigue presente y el 14% de las respuestas no terminan de forma autonoma.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- Longitud de contexto no documentada, lo que limita su uso en conversaciones de contexto largo.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- Licencia MIT: permite uso comercial, pero no se ofrece ninguna garantia sobre calidad o idoneidad para produccion.
- El modelo no emplea tokens especiales de chat; requiere respetar el formato `User:` / `Assistant:` y el cierre con `<|endoftext|>`.
- El ajuste por instrucciones reduce la media en benchmarks en unos 4 puntos respecto al modelo base (38,4 frente a 42,3).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aramkris/fineweb-edu-124m-chat-dpo
- Modelo SFT: https://huggingface.co/aramkris/fineweb-edu-124m-chat-sft
- Modelo base: https://huggingface.co/aramkris/fineweb-edu-124m-base
- Repositorio de entrenamiento e inferencia: https://github.com/a-ramakrishnan/tinystories-ARM-model
- Dataset de preentrenamiento: https://huggingface.co/datasets/BaoMinhTran/mini-fineweb-edu
- Dataset de ajuste: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset de preferencias DPO: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
