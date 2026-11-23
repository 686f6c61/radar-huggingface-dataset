# oahzxl/LoopRes-Qwen3-1.7B

## Resumen

LoopRes-Qwen3-1.7B es un modelo de generacion de texto en ingles construido sobre Qwen3-1.7B-Base mediante una tecnica de transformer con bucle (looped transformer). El autor, oahzxl, aplica un bloque de capas del decodificador varias veces por token: un preludio se ejecuta una sola vez, las capas centrales se repiten bajo residuos de atencion por bloque cuyas fuentes llevan claves estaticas y consultas de valor entrenadas, y una coda lee el ultimo paso. Este checkpoint ejecuta 3 pasos de bucle sobre las capas 7-21 en 2 bloques de 7 capas.

El modelo resuelve el problema de incrementar la capacidad de razonamiento de un modelo pequeno sin aumentar el numero de parametros: reutiliza las mismas capas varias veces por token, lo que incrementa el coste computacional en inferencia pero mantiene el tamano del checkpoint en 1.721.009.152 parametros (1,7B). Ha sido entrenado durante 12.000 pasos con 16k tokens sobre las respuestas de Qwen3-8B del dataset LoopRes-Qwen3-SFT, lo que constituye una destilacion desde un modelo mayor.

Es relevante ahora porque demuestra que tecnicas de computo recurrente (looped transformers) pueden mejorar de forma sustancial el rendimiento en matematicas y codigo de un modelo de 1,7B, acercandolo a modelos significativamente mayores en benchmarks como AIME 2025 o HumanEval+, con licencia MIT y pesos en safetensors compatibles con transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador con bucle (looped transformer) sobre Qwen3-1.7B-Base; preludio, 2 bloques de 7 capas (7-21) con 3 pasos de bucle, coda |
| Parametros totales | 1.721.009.152 (1,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (entrenado a 16k tokens; contexto nativo de Qwen3-1.7B-Base no confirmado en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers; requiere el paquete `loopres` para registrar el tipo de modelo) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decodificador derivado de Qwen3-1.7B-Base al que se le anaden mecanismos de bucle. Un preludio se ejecuta una vez; a continuacion, un nucleo de capas (capas 7-21) se repite 3 pasos por token, organizado en 2 bloques de 7 capas. Cada paso de lectura accede a los bloques del paso anterior mediante residuos de atencion por bloque, cuyas fuentes llevan claves estaticas y consultas de valor entrenadas. Finalmente, una coda lee la salida del ultimo paso. Esto implica que el coste computacional por token es mayor que el de un transformer convencional de 1,7B, aunque el numero de parametros almacenados no aumenta.

El entrenamiento consistio en 12.000 pasos con secuencias de 16k tokens sobre el dataset LoopRes-Qwen3-SFT, compuesto por respuestas generadas por Qwen3-8B. Se trata, por tanto, de una destilacion desde un modelo de 8B hacia una arquitectura de 1,7B con bucle. El checkpoint de referencia SFT (Qwen3-1.7B-Base entrenado sobre los mismos datos con un solo paso) sirve como linea base en la evaluacion, lo que permite aislar el efecto del bucle. No se especifica en la informacion disponible si hubo RLHF, DPO u otras fases de alineamiento adicionales.

## Capacidades

- Generacion de texto y razonamiento en ingles.
- Razonamiento matematico de competicion (AIME, AMC, OlympiadBench, MATH-500), con modo de pensamiento (`enable_thinking=True`).
- Generacion de codigo (HumanEval+, MBPP+).
- Conversacion multi-turno mediante plantilla de chat (`apply_chat_template`).
- Modo thinking explicito, activable en la plantilla de chat.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes o multi-step reasoning mas alla del razonamiento interno del modo thinking.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documentan capacidades de vision ni audio.

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas de competicion (AIME, AMC) con modo thinking y ventanas de hasta 32.768 tokens nuevos de generacion, adecuado para tutoria o generacion de soluciones paso a paso.
- Generacion de codigo en pipelines de evaluacion: con rendimiento medido en HumanEval+ y MBPP+, puede integrarse en herramientas de autocompletado o generacion de tests en entornos donde el coste computacional de un modelo de 1,7B con bucle es aceptable.
- Destilacion y experimentacion academica: sirve como referencia para investigar tecnicas de computo recurrente, ya que incluye una linea base SFT con los mismos datos y un solo paso de bucle.
- Prototipado de asistentes conversacionales en ingles: la plantilla de chat y el formato transformers permiten desplegar rapidamente un chatbot de dominio general en ingles.
- Generacion de explicaciones matematicas educativas: el modo thinking produce trazas de razonamiento largas utiles para materiales docentes.
- Investigacion sobre eficiencia de parametros: util para comparar el rendimiento por parametro de arquitecturas con bucle frente a transformers estandar del mismo tamano.
- Evaluacion de tecnicas de atencion por bloque con residuos: caso de estudio para grupos que investigan variantes de atencion y reutilizacion de capas.

## Benchmarks y rendimiento

Evaluado a 32.768 tokens nuevos, temperatura 0,6, top-p 0,95, top-k 20. Matematicas mediante `math_verify`; HumanEval+ y MBPP+ pass@1 mediante EvalPlus. La linea base SFT es Qwen3-1.7B-Base entrenado sobre los mismos datos con un solo paso.

| Benchmark | Muestras | SFT | LoopRes |
|---|---|---|---|
| AIME 2025 | 16 | 13,8 | 26,9 |
| AIME 2026 | 16 | 10,8 | 21,7 |
| AMC 2023 | 16 | 46,7 | 61,3 |
| OlympiadBench | 1 | 43,6 | 53,0 |
| MATH-500 | 1 | 73,8 | 82,2 |
| HumanEval+ (base/plus) | 4 | 62,7 / 57,6 | 75,5 / 71,2 |
| MBPP+ (base/plus) | 2 | 64,4 / 55,4 | 79,4 / 67,3 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan aproximadamente 3,5 GB (repo de 3,5 GB); en fp16 se requiere alrededor de 3,5-4 GB solo para pesos, mas memoria para activaciones y cache KV, por lo que se recomienda al menos 8 GB de VRAM.
- GPU recomendadas: A100 o H100 para mayor throughput; RTX 4090 o GPUs con 24 GB para uso individual.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM en fp16; la cuantizacion no esta documentada en la informacion disponible.
- Opciones de despliegue: transformers con el paquete `loopres` (obligatorio para registrar `LoopResForCausalLM`). No se documenta soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. El bucle de 3 pasos sobre las capas 7-21 incrementa el coste computacional por token respecto a un transformer de 1,7B convencional, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LoopRes-Qwen3-1.7B | 1,7B (3 pasos de bucle) | 16k entrenamiento | AIME 2025 26,9; MATH-500 82,2; HumanEval+ 71,2 | MIT | Hugging Face |
| Qwen3-1.7B-Base (SFT, linea base) | 1,7B | no disponible | AIME 2025 13,8; MATH-500 73,8; HumanEval+ 57,6 | Apache 2.0 (Qwen) | Hugging Face |
| Qwen3-8B (fuente de destilacion) | 8B | no disponible | no disponible en la informacion | Apache 2.0 (Qwen) | Hugging Face |

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; el rendimiento en otros idiomas no esta documentado.
- Riesgo de alucinacion inherente a modelos generativos; los benchmarks de matematicas no garantizan correccion en dominios abiertos.
- El checkpoint requiere el paquete `loopres` instalado desde el repositorio del autor; sin el, transformers no reconoce el tipo de modelo y la carga falla.
- El coste computacional por token es mayor que el de un transformer de 1,7B convencional debido a los 3 pasos de bucle, lo que afecta latencia y throughput.
- No se documenta soporte de tool calling, agentes, vision ni audio.
- El entrenamiento se realizo sobre respuestas de Qwen3-8B, por lo que puede heredar sesgos y estilo del modelo profesor.
- La licencia es MIT, permisiva para uso comercial, pero no se ofrece garantia alguna por parte del autor.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oahzxl/LoopRes-Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/oahzxl/LoopRes-Qwen3-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Repositorio del paquete `loopres`: no disponible como enlace directo en la informacion; se instala con `pip install -e .` desde el repositorio del autor segun la model card.
- Paper, blog o demo: no disponibles en la informacion proporcionada.
