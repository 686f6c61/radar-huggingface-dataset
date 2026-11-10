# aafimalek2032/wordle-rl-gemma3-270m

## Resumen

wordle-rl-gemma3-270m es un ajuste fino completo de google/gemma-3-270m-it, el modelo instructivo de la familia Gemma 3 de Google, especializado en jugar a Wordle mediante texto. Lo desarrolla Aafi Khan Malek como artefacto final del articulo "Five Letters, 270M Parameters: How Far Can a Tiny Language Model Go at Wordle?" (2026). El modelo no pretende ser un asistente general: es un experimento controlado sobre hasta donde puede llegar un modelo de lenguaje de 270 millones de parametros en una tarea de razonamiento restringido con retroalimentacion parcial.

La relevancia tecnica esta en demostrar que un modelo muy pequeno, entrenado con imitacion de un solucionador y con decodificacion restringida a nivel de palabra, alcanza tasas de exito cercanas al 97 % en WordleBench y al 96 % en el benchmark de Jeffers, frente a un 99-100 % citado de GPT-5. Todo el entrenamiento se ejecuto en GPUs T4 gratuitas de Kaggle, lo que lo convierte en un caso de referencia para fine-tuning de bajo coste sobre modelos compactos.

El modelo hereda la arquitectura y el tokenizador de Gemma 3 270M y se distribuye en safetensors bajo la licencia Gemma. Solo soporta ingles y su ambito de uso esta deliberadamente acotado al juego de las cinco letras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (gemma3_text), derivado de google/gemma-3-270m-it |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Gemma 3 270M; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar; admite las cuantizaciones estandar de transformers/llama.cpp al derivar de Gemma 3) |
| Idiomas soportados | en (ingles) |
| Licencia | Gemma Terms of Use (incluye Gemma Prohibited Use Policy); el codigo de entrenamiento es Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-270m-it, un transformer decoder-only de la familia Gemma 3, y se somete a un ajuste fino completo (no LoRA ni adaptadores) sobre 268 millones de parametros. El entrenamiento se organizo en varias rondas: primero una imitacion de un solucionador que juega palabras consistentes con las pistas, despues un ejercicio de ortografia equilibrado y finalmente una ronda de recuperacion sobre las palabras que el propio modelo habia rechazado. La ejecucion final documentada es `sft-gemma270m-v10-s1`, con el checkpoint elegido sobre un split de seleccion.

Una innovacion destacable no esta en la arquitectura sino en la decodificacion: el autor implementa una decodificacion a nivel de palabra (`fiveletters/constrain.py`) que limita la salida a palabras del diccionario de Wordle de 12.972 entradas y las ordena segun las log-probabilidades del propio modelo, sin usar las pistas en el codigo. Esta restriccion elimina las respuestas que no son palabras y explica la mayor parte de la mejora frente a la generacion libre. El formato de prompt espera un tablero con letras espaciadas y una respuesta con un resumen de estado entre `<state>` y una palabra entre `<guess>`; se recomienda decodificacion greedy.

## Capacidades

- Generacion de texto especializada en el juego de Wordle: interpreta el tablero, resume el estado del conocimiento y propone la siguiente palabra.
- Razonamiento con retroalimentacion parcial: integra pistas tipo G (letra y posicion correctas), Y (letra presente en otra posicion) y X (letra ausente).
- Formato estructurado de salida: produce etiquetas `<state>` y `<guess>` de forma consistente.
- Manejo de turnos invalidos: reconoce en el tablero entradas como `INVALID (not in word list)` y adapta la jugada siguiente.
- Capacidad de recuperacion: la ronda final de entrenamiento le permite corregir palabras que el propio modelo habia rechazado.
- No dispone de tool calling ni function calling.
- No esta disenado para razonamiento multi-paso general ni para uso como agente.
- Multilingue: solo ingles.
- No tiene modo thinking, vision ni audio.

## Casos de uso

- Evaluacion de modelos pequenos en tareas de razonamiento restringido: sirve como banco de pruebas reproducible para medir hasta donde llega un modelo de 270M en un juego con informacion parcial, comparando generacion libre frente a decodificacion restringida.
- Investigacion sobre decodificacion restringida: el codigo `fiveletters/constrain.py` permite estudiar como la restriccion a nivel de palabra cambia la tasa de exito (de 87 % a 97 % en WordleBench) sin modificar los pesos.
- Baseline para fine-tuning de bajo coste: todo el entrenamiento cabe en GPUs T4 gratuitas, por lo que es un ejemplo practico de pipeline de imitacion mas recuperacion sobre un modelo compacto.
- Demostracion educativa de RLHF e imitacion: ilustra como combinar imitacion de un solucionador, ejercicios de ortografia y rondas de recuperacion sobre errores propios.
- Agente de juego embebido: al ocupar 1,1 GB en safetensors y 268M de parametros, puede desplegarse en entornos con recursos limitados para jugar partidas de Wordle de forma automatizada.
- Reproduccion de resultados academicos: permite replicar las cifras de WordleBench, Jeffers, respuestas raras y TextArena citadas en el articulo usando los comandos del repositorio.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados una sola vez sobre conjuntos de test reservados. Tasa de exito en %; entre corchetes, intentos por victoria.

| Conjunto | Solo, regla estricta | Solo, regla de leaderboard (vocabulario abierto) | Decodificacion a nivel de palabra | GPT-5 citado |
|---|---|---|---|---|
| WordleBench (100) | 87,0 | 94,0 | 97,0 [3,68] | 99 [3,59] |
| Jeffers Wordle-AI-Benchmark (50) | 74,0 | 88,0 | 96,0 [3,75] | 100 [3,58] |
| Respuestas raras (500) | 42,2 | 51,4 | 76,6 [4,60] | no disponible |
| TextArena Wordle-v0 adaptado (500) | 85,8 | no disponible | 98,6 [3,59] | no disponible |

La regla estricta penaliza las palabras fuera del diccionario de 12.972 entradas (no reciben retroalimentacion y consumen turno); la regla de leaderboard acepta cualquier secuencia de cinco letras. Las cifras de GPT-5 proceden de otros harnesses con otros prompts y ajustes, por lo que no son estrictamente comparables.

## Requisitos de hardware

- VRAM estimada: en fp16, unos 0,55 GB para los pesos (268M parametros); en fp32, alrededor de 1,1 GB. Con overhead de activaciones y cache KV, un entorno de 2-4 GB es suficiente.
- GPU recomendadas: cualquier GPU consumer moderna basta; cabe en RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs de 4 GB. El entrenamiento original se hizo en T4 de Kaggle.
- Cabe en GPU consumer: si, sin problema, incluidas GPUs de gama baja y portatiles.
- Opciones de despliegue: transformers (referencia), text-generation-inference (el repo es endpoints_compatible), llama.cpp/Ollama mediante conversion a GGUF, y vLLM si se convierte el formato.
- Latencia y throughput: no disponible en la informacion proporcionada; al ser un modelo de 270M con salidas de hasta 96 tokens y decodificacion greedy, la latencia esperada es baja, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wordle-rl-gemma3-270m | 268M | no disponible | Wordle | Gemma Terms of Use | Hugging Face |
| google/gemma-3-270m-it (base) | 270M | no disponible | Asistente general | Gemma Terms of Use | Hugging Face |
| GPT-5 (referencia citada) | no disponible | no disponible | General | propietaria | API |
| Solucionadores clasicos de Wordle (p. ej. Wordle-AI-Benchmark de Jeffers) | no aplica (no neuronal) | no aplica | Wordle | variable | repos publicos |

La comparacion directa con GPT-5 solo es posible a traves de las cifras citadas en el articulo (99 % en WordleBench, 100 % en Jeffers), obtenidas con otros harnesses. Frente al Gemma 3 270M instructivo sin ajustar, la diferencia esta en la especializacion y en la decodificacion restringida, no en el tamano.

## Limitaciones y advertencias

- Entrenado para un unico juego: no es un asistente general y su uso fuera de Wordle carece de garantias.
- Las respuestas raras (fuera de la lista clasica de soluciones) son dificiles: 42,2 % en solitario y 76,6 % con decodificacion restringida.
- En solitario, alrededor del 10 % de sus turnos en el conjunto de seleccion de 534 palabras no son palabras (17 % en Jeffers, 22 % en respuestas raras); la mayoria de las derrotas restantes contienen varias no-palabras al final de la partida.
- El ejercicio de ortografia uso palabras comunes del ingles como objetivos, incluidas algunas que son respuestas en los conjuntos de test (nunca como respuesta de una partida de entrenamiento); el articulo discute este posible solapamiento.
- Solo soporta ingles; no hay capacidades multilingues.
- Licencia Gemma: el uso comercial esta sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy; no es una licencia permisiva tipo Apache o MIT para los pesos.
- Riesgo de alucinacion en el sentido de generar palabras inexistentes si no se aplica decodificacion restringida; se recomienda usar greedy decoding y, para partidas completas, la decodificacion a nivel de palabra del repositorio.
- No se publican datos de sesgos; al derivar de Gemma 3 hereda los sesgos del modelo base, aunque el dominio de uso acotado reduce su exposicion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aafimalek2032/wordle-rl-gemma3-270m
- Repositorio de codigo, datos y fuente del articulo: https://github.com/Aafimalek/wordle-rl
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
