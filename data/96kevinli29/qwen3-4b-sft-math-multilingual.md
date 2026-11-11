# 96kevinli29/Qwen3-4B-SFT-Math-Multilingual

## Resumen

Qwen3-4B-SFT-Math-Multilingual es un ajuste fino supervisado (SFT) de Qwen/Qwen3-4B, desarrollado por el usuario 96kevinli29, cuyo objetivo es que el modelo razone en el idioma del problema matemático en lugar de hacerlo en inglés. Se trata de un modelo causal de 4.411 millones de parámetros entrenado sobre 43.218 trazas largas de chain-of-thought matemático en seis idiomas (inglés, chino, español, francés, árabe y ruso). El checkpoint publicado corresponde a la época 2 del entrenamiento.

El modelo base Qwen3-4B responde correctamente a problemas matemáticos en español, francés y árabe, pero redacta su razonamiento en inglés aunque se le pida lo contrario. Este ajuste corrige ese comportamiento: la adherencia al idioma solicitado pasa del 39,8% al 99,4% en respuestas no inglesas. Es la etapa II del artículo *What Does Post-Training Change in Multilingual Reasoning?* (arXiv:2609.37104) y sirve como punto de partida para dos checkpoints posteriores entrenados con RL.

La relevancia práctica es doble: por un lado, demuestra que el SFT multilingüe puede alinear el idioma del razonamiento con el del enunciado; por otro, evidencia el coste de esa alineación (caída de precisión y aumento de respuestas que no terminan), lo que lo convierte en un objeto de estudio útil para quien investigue post-entrenamiento multilingüe. El autor lo recomienda explícitamente como warm start para RL, no como modelo final de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (derivada de Qwen3-4B) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (presupuesto de evaluacion: 24.576 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; cuantizacion GGUF/AWQ no confirmada) |
| Idiomas soportados | en, zh, es, fr, ar, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer causal de 4.411 millones de parametros, y se somete a un ajuste fino supervisado de parametros completos (full-parameter SFT) durante dos epocas. El conjunto de entrenamiento es 96kevinli29/SFT-Math-Multilingual-43k, con 43.218 trazas largas de razonamiento matematico en seis idiomas, complementado con open-r1/OpenR1-Math-220k. No se menciona en la informacion disponible el uso de RLHF ni DPO en esta etapa; el RL aparece en los checkpoints posteriores de la linaje (200 pasos de PPO con recompensas gated y additive).

La innovacion tecnica principal no esta en la arquitectura, sino en el objetivo de entrenamiento: forzar que la traza de razonamiento visible se escriba en el idioma del enunciado. El articulo de referencia distingue tres metricas por respuesta: correccion de la respuesta final (C), adherencia al idioma solicitado (L) y terminacion sin bucles de repeticion ni agotamiento del presupuesto (T). El entrenamiento mejora L del 39,8% al 99,4%, pero degrada C del 76,2% al 61,4% y eleva la no terminacion del 4,7% al 21,1%. El autor senala que el coste de precision tambien aparece tras SFT solo en ingles sobre las mismas trazas, por lo que no lo atribuye a la mezcla multilingue; la no terminacion, en cambio, es especifica de las trazas no inglesas.

## Capacidades

- Generacion de texto y razonamiento matematico de competicion (AIME, AMC) con cadenas de pensamiento largas.
- Razonamiento en el idioma del enunciado: ingles, chino, espanol, frances, arabe y ruso, con una tasa de adherencia del 99,4% en respuestas no inglesas.
- Generacion de trazas de chain-of-thought extensas (mediana de 7.673 tokens en la evaluacion multilingue).
- Soporte de conversacion multi-turno (tag conversational en la model card).
- Compatibilidad con text-generation-inference y endpoints compatibles.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso mas alla del CoT matematico: no disponible en la informacion proporcionada.
- Vision o audio: no disponibles.

## Casos de uso

- Investigacion en post-entrenamiento multilingue: el checkpoint permite reproducir el analisis del articulo arXiv:2609.37104 sobre el intercambio entre adherencia al idioma y precision, comparando la etapa II con el modelo base y con los checkpoints de RL.
- Warm start para RL: el autor lo presenta como punto de partida para los dos checkpoints de la etapa III (recompensa gated y additive), de modo que un equipo puede continuar el entrenamiento con PPO sobre el dataset DAPO-Math-Multilingual-6Lang.
- Evaluacion de modelos matematicos en espanol, frances, arabe y ruso: util para medir si un sistema razona en el idioma del usuario, no solo si acierta la respuesta, usando el protocolo C/L/T sobre AIME-2026 y AMC-2023.
- Tutorizacion matematica multilingue con trazas auditables: al generar el razonamiento en el idioma del estudiante, el texto intermedio es directamente legible y revisable por un docente o un sistema de moderacion, sin necesidad de traduccion posterior.
- Generacion de datos sinteticos de razonamiento: las trazas multilingues producidas pueden filtrarse por las tres metricas (C, L, T) para construir corpus de entrenamiento en idiomas con poca cobertura, aceptando que parte de las respuestas no terminaran.
- Prototipado de asistentes de resolucion de problemas en seis idiomas: con la licencia Apache 2.0 y pesos safetensors, se puede desplegar en un entorno de pruebas con transformers o TGI para validar la experiencia de usuario antes de pasar a un modelo con RL.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente). Protocolo: 70 problemas de competicion (30 AIME-2026 + 40 AMC-2023) planteados en cada uno de seis idiomas, 16 muestras por problema a temperatura 0,7 y presupuesto de 24.576 tokens (1.120 respuestas por idioma).

| Metrica (media no inglesa, 5 idiomas) | Qwen3-4B original | Tras SFT (este modelo) | RL, recompensa additive | RL, recompensa gated |
|---|---:|---:|---:|---:|
| Respuesta correcta (C) | 76,2% | 61,4% | 60,1% | 61,7% |
| Razonamiento en el idioma solicitado (L) | 39,8% | 99,4% | 99,6% | 99,7% |
| No termino (1 − T) | 4,7% | 21,1% | 1,2% | 1,8% |
| Entregado, una muestra (J@1) | 28,6% | 60,2% | 59,8% | 61,4% |
| Entregado, mejor de 16 (J@16) | 35,7% | 84,6% | 83,1% | 83,7% |
| Longitud mediana de respuesta (tokens) | 5.824 | 7.673 | 4.072 | 4.463 |

Desglose por idioma de este checkpoint:

| Idioma | C | L | 1 − T | J@1 | J@16 | Tokens medianos |
|---|---:|---:|---:|---:|---:|---:|
| Ingles | 71,8% | 100,0% | 3,2% | 71,7% | 94,3% | 5.369 |
| Chino | 57,5% | 99,9% | 20,8% | 57,3% | 85,7% | 5.946 |
| Espanol | 64,8% | 99,6% | 12,3% | 64,6% | 87,1% | 7.044 |
| Frances | 64,9% | 99,0% | 12,9% | 64,6% | 87,1% | 7.512 |
| Arabe | 56,1% | 98,4% | 31,7% | 53,6% | 80,0% | 9.103 |
| Ruso | 63,9% | 99,9% | 27,5% | 61,2% | 82,9% | 8.760 |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan 8,8 GB en el repositorio, lo que corresponde a precision FP16/BF16. En FP16 se necesitan aproximadamente 9-10 GB de VRAM solo para los pesos, mas la cache KV para contextos largos (la evaluacion usa hasta 24.576 tokens).
- Cuantizacion: no se confirma en la informacion disponible la existencia de pesos GGUF o AWQ publicados para este checkpoint. Si se generan, una cuantizacion de 4 bits reduciria los pesos a unos 2,5 GB.
- GPU recomendadas: A100 (40/80 GB) o H100 para servir con contextos largos y lotes grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en FP16 con contexto moderado.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB o mas en FP16, y en tarjetas de 8-12 GB si se cuantiza a 4-8 bits (sujeto a la disponibilidad de pesos cuantizados).
- Opciones de despliegue: transformers, text-generation-inference (etiqueta text-generation-inference en la model card) y endpoints compatibles. El uso de vLLM, llama.cpp u Ollama no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles. Como referencia de coste, la mediana de respuesta en la evaluacion es de 7.673 tokens, lo que implica generaciones largas y un throughput efectivo bajo por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-SFT-Math-Multilingual (este) | 4.411 M | no disponible | SFT matematico multilingue (etapa II) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-4B | 4.411 M (mismo tamano) | no disponible | Modelo base de razonamiento | Apache 2.0 | Hugging Face |
| Qwen3-4B-MathRL-Multilingual-Gated | 4.411 M | no disponible | Etapa III con PPO, recompensa gated | Apache 2.0 (segun linaje) | Hugging Face |
| Qwen3-4B-MathRL-Multilingual-Additive | 4.411 M | no disponible | Etapa III con PPO, recompensa additive | Apache 2.0 (segun linaje) | Hugging Face |
| Qwen3-8B-SFT-Math-Multilingual | 8B (aproximado) | no disponible | Replicacion del SFT a otro tamano | Apache 2.0 (segun linaje) | Hugging Face |

Frente al Qwen3-4B original, este checkpoint gana 59,6 puntos de adherencia al idioma (39,8% a 99,4%) y 31,6 puntos de J@1 (28,6% a 60,2%), pero pierde 14,8 puntos de precision (76,2% a 61,4%). Frente a los checkpoints de RL de la misma linaje, el SFT entrega una tasa de no terminacion mucho mayor (21,1% frente a 1,2-1,8%) y respuestas mas largas (7.673 frente a 4.072-4.463 tokens). No se dispone de comparaciones con modelos de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- No terminacion: el 21,1% de las respuestas no inglesas no finaliza, con bucles de repeticion o agotamiento del presupuesto de tokens. En arabe llega al 31,7% y en ruso al 27,5%. Es la limitacion mas grave para uso directo en produccion.
- Coste de precision: la exactitud cae del 76,2% al 61,4% en la media no inglesa respecto al modelo base. El autor indica que el coste tambien aparece con SFT solo en ingles, por lo que no es un efecto de la mezcla multilingue, pero el efecto persiste.
- Longitud de respuesta: mediana de 7.673 tokens, con casos de hasta 9.103 en arabe, lo que encarece la inferencia y puede agotar contextos configurados por debajo de 24.576 tokens.
- Uso previsto: el autor lo describe como warm start para RL, no como modelo final. Desplegarlo sin un paso posterior de RL expone al usuario a la tasa de no terminacion citada.
- Idiomas: solo seis idiomas (en, zh, es, fr, ar, ru). El rendimiento en otros idiomas no esta documentado.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; al derivar de Qwen3-4B, hereda los del modelo base, que tampoco se detallan.
- Alucinacion: no hay evaluacion de alucinacion en la informacion disponible; el dominio evaluado es exclusivamente matematico de competicion.
- Benchmarks no verificados: los resultados del model-index estan marcados como `verified: false` y proceden del propio autor.
- Licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y la atribucion correspondiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-Multilingual
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Modelo base alternativo: https://huggingface.co/Qwen/Qwen3-8B
- Checkpoint RL con recompensa gated: https://huggingface.co/96kevinli29/Qwen3-4B-MathRL-Multilingual-Gated
- Checkpoint RL con recompensa additive: https://huggingface.co/96kevinli29/Qwen3-4B-MathRL-Multilingual-Additive
- Replicacion a 8B: https://huggingface.co/96kevinli29/Qwen3-8B-SFT-Math-Multilingual
- Dataset de SFT (43k): https://huggingface.co/datasets/96kevinli29/SFT-Math-Multilingual-43k
- Dataset de SFT (56k): https://huggingface.co/datasets/96kevinli29/SFT-Math-Multilingual-56k
- Dataset de prompts RL: https://huggingface.co/datasets/96kevinli29/DAPO-Math-Multilingual-6Lang
- Dataset de evaluacion: https://huggingface.co/datasets/96kevinli29/Multilingual-Math-Reasoning-Eval
- Dataset complementario: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Articulo: https://arxiv.org/abs/2609.37104
