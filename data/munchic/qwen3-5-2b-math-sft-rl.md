# Munchic/Qwen3.5-2B-Math-SFT-RL

## Resumen

Munchic/Qwen3.5-2B-Math-SFT-RL es una coleccion de adaptadores LoRA sobre el modelo base Qwen/Qwen3.5-2B (revision `15852e8`), orientados a razonamiento matematico. El autor no publica un modelo completo, sino cinco variantes entrenadas de forma secuencial: una fase de ajuste supervisado (SFT) sobre 2.000 soluciones resueltas de MATH-hard y varias fases de aprendizaje por refuerzo con GRPO, incluyendo una innovacion metodologica centrada en la seleccion aprendida de prompts.

El objetivo del trabajo es empirico: comprobar si elegir que prompts se usan en cada paso de RL, mediante un predictor ligero que no requiere rollouts adicionales, alcanza mayor precision en menos tiempo que el RL con muestreo uniforme. El modelo resuelve problemas de matematicas de nivel 3 a 5 del dataset MATH, con respuestas encapsuladas en `\boxed{}` y modo thinking desactivado.

Es relevante ahora porque documenta de forma transparente el efecto de las tecnicas de RL sobre modelos pequenos (2B), incluyendo el hallazgo de que el SFT inicial degrada la precision greedy frente al modelo base (0,262 frente a 0,400) y que el RL posterior la recupera y supera. La ficha se limita a los datos publicados por el autor; no hay informacion sobre licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.5-2B) con adaptadores LoRA |
| Parametros totales | No disponible (el adaptador LoRA es un delta sobre Qwen3.5-2B; el tamano del repo es 0,4 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (los pesos se publican en fp32 segun el ejemplo de uso; el adaptador usa LoRA r=16, alpha=32, fp32) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-2B, un transformer decoder-only de 2.000 millones de parametros aproximadamente, mediante adaptadores LoRA de rango 16 y alpha 32 en precision fp32. El entrenamiento se estructura en dos etapas. La primera es un SFT de 2 epocas sobre 2.000 soluciones trabajadas de MATH-hard (niveles 3 a 5), con respuestas cortas de aproximadamente 160 tokens y salida en `\boxed{}`. La segunda etapa aplica GRPO (Group Relative Policy Optimization) con 8 prompts por paso y 8 rollouts por prompt en la variante estandar, temperatura 1 y limite de 1.024 tokens por rollout.

La innovacion principal es el selector de prompts: un predictor aprendido y ligero que decide que problemas entrenar en cada paso, evitando aquellos que el modelo ya resuelve siempre o que nunca resuelve, y por tanto no generan senal de aprendizaje. Se comparan tres configuraciones: RL plano con muestreo uniforme (3 semillas), RL con PromptSelect (8 rollouts por prompt) y RL con PromptSelect y un solo rollout por prompt (mas prompts por paso, menos rollouts por paso). Los datos de entrenamiento proceden de SimpleRL MATH-hard, divididos por pregunta entre SFT, RL y evaluacion, excluyendo las que contienen figuras `[asy]`.

## Capacidades

- Generacion de texto y razonamiento matematico de nivel 3 a 5 del dataset MATH.
- Resolucion de problemas paso a paso con formato de respuesta `\boxed{...}`.
- Aprendizaje por refuerzo con GRPO y seleccion aprendida de prompts de entrenamiento.
- Modo thinking desactivado (`enable_thinking=False` en el chat template).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni capacidades multilingues.

## Casos de uso

- Investigacion en RL para matematicas: el modelo sirve como banco de pruebas reproducible para comparar politicas de seleccion de prompts frente a muestreo uniforme, con tres semillas de RL plano ya documentadas.
- Evaluacion de tecnicas de eficiencia en RL: la variante de un solo rollout por prompt permite estudiar el compromiso entre numero de rollouts y precision final (0,541 con 4.872 rollouts frente a 0,483 con 7.680).
- Generacion de soluciones matematicas con formato verificable: la salida en `\boxed{}` facilita el parseo automatico y la comprobacion de respuestas en pipelines de evaluacion.
- Fine-tuning de modelos pequenos en dominios acotados: la receta SFT + RL con LoRA r=16 es reutilizable en entornos con recursos limitados.
- Analisis del fenomeno de "length runaway": el modelo documenta la relacion entre velocidad de aprendizaje y truncamiento de rollouts, util para disenar criterios de parada.
- Docencia y divulgacion: los adaptadores permiten reproducir el efecto del SFT y del RL sobre la precision greedy de un modelo de 2B con un coste de entrenamiento inferior a 2 horas de RL por ejecucion.

## Benchmarks y rendimiento

Precision greedy sobre 1.000 preguntas de MATH reservadas (niveles 3 a 5), limite de 1.024 tokens:

| Modelo | Precision | L3 / L4 / L5 | Truncados | Pasos RL | Horas RL | Rollouts |
|---|---|---|---|---|---|---|
| Qwen3.5-2B base (sin adaptador) | 0,400 | 0,579 / 0,435 / 0,235 | 55,1% | – | – | – |
| SFT | 0,262 | 0,405 / 0,278 / 0,139 | 1,2% | – | 0,34 (SFT) | – |
| SFT + RL plano, s0 | 0,483 | 0,669 / 0,508 / 0,320 | 11,8% | 120 | 2,46 | 7.680 |
| SFT + RL plano, s1 | 0,471 | 0,649 / 0,518 / 0,296 | 18,1% | 75 | 1,60 | 4.800 |
| SFT + RL plano, s2 | 0,441 | 0,629 / 0,466 / 0,276 | 14,3% | 61 | 1,38 | 3.904 |
| RL plano, media de 3 | 0,465 | – | – | – | – | – |
| SFT + PromptSelect RL, s0 | 0,526 | 0,712 / 0,575 / 0,343 | 22,2% | 92 | 1,93 | 5.888 |
| SFT + PromptSelect RL, 1 rollout, s0 | 0,541 | 0,736 / 0,578 / 0,361 | 19,2% | 168 | 1,98 | 4.872 |

El autor senala que PromptSelect RL alcanzo la precision final de la semilla 0 del RL plano (0,476 en el subconjunto de evaluacion) en la mitad o menos del tiempo de entrenamiento, y que la variante de un solo rollout lo logro en aproximadamente un tercio de ese tiempo, con un 37% menos de rollouts. Las dos variantes de PromptSelect cuentan con una sola semilla, mientras que las semillas de RL plano se distribuyen entre 0,441 y 0,483.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Al tratarse de un modelo de 2B con adaptador LoRA en fp32, la inferencia requiere del orden de 8 GB en fp32; con cuantizacion a 4 bits cabria en GPUs consumer de 6-8 GB, aunque esta cifra no la publica el autor.
- GPU recomendadas: no disponible. El entrenamiento SFT duro 0,34 horas y el RL entre 1,38 y 2,46 horas por ejecucion, lo que sugiere GPUs de gama media-alta, pero no se especifica el hardware.
- GPU consumer: no confirmado por el autor.
- Opciones de despliegue: el ejemplo de uso emplea `transformers` con `AutoModelForCausalLM` y `peft.PeftModel`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision MATH (1.000 preguntas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Munchic/Qwen3.5-2B-Math-SFT-RL (PromptSelect, 1 rollout) | Adaptador LoRA sobre 2B | No disponible | 0,541 | No disponible | Hugging Face, 0 descargas |
| Qwen3.5-2B base | 2B aprox. | No disponible | 0,400 | No disponible en esta ficha | Hugging Face |
| Munchic/Qwen3.5-2B-SFT-Math | Adaptador LoRA sobre 2B | No disponible | 0,262 | No disponible | Hugging Face |
| Munchic/Qwen3.5-2B-SFT-Plain-RL-Math (media de 3 semillas) | Adaptador LoRA sobre 2B | No disponible | 0,465 | No disponible | Hugging Face |

No se dispone de datos de benchmarks de otros modelos de 2B comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El SFT degrada la precision greedy frente al modelo base (0,262 frente a 0,400); solo el RL posterior la recupera y supera.
- El fenomeno de "length runaway" (mas del 15% de rollouts truncados a 1.024 tokens durante 5 pasos consecutivos) termino la mayoria de las ejecuciones y limita la fiabilidad de las precisiones finales, medidas con un 12-22% de truncamiento.
- Las dos variantes de PromptSelect solo tienen una semilla; la varianza observada en RL plano (0,441-0,483) sugiere que las diferencias deben interpretarse con cautela.
- No hay informacion sobre licencia, lo que impide confirmar el uso comercial.
- No hay informacion sobre idiomas soportados ni sobre sesgos conocidos.
- El modelo esta especializado en matematicas y no documenta tool calling, agentes ni capacidades multimodales.
- El adaptador requiere cargar el modelo base Qwen3.5-2B en la revision exacta `15852e8` para funcionar correctamente.
- El repo tiene 0 descargas y 1 like, por lo que no cuenta con validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Munchic/Qwen3.5-2B-Math-SFT-RL
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio del modelo base en la revision usada: https://huggingface.co/Qwen/Qwen3.5-2B/tree/15852e8c16360a2fea060d615a32b45270f8a8fc
- Dataset SimpleRL MATH-hard: no disponible en la informacion proporcionada
- Paper o blog del metodo PromptSelect: no disponible en la informacion proporcionada
