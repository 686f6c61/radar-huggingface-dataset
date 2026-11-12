# alexwkleung/Qwen3.6-35B-A3B-Pruned-E128-W448-GGUF

## Resumen

Qwen3.6-35B-A3B-Pruned-E128-W448 es una variante experimental del modelo Qwen3.6-35B-A3B de Alibaba, publicada por el usuario alexwkleung en Hugging Face. Se trata de un derivado podado estructuralmente del modelo original, sin reentrenamiento ni ajuste fino, cuyo objetivo es reducir el consumo de memoria de los expertos enrutados para que un modelo MoE de gran tamano pueda ejecutarse en hardware con recursos limitados, concretamente en una maquina Apple Silicon de 16 GB.

El autor partio de la cuantizacion Qwen3.6-35B-A3B-UD-Q4_K_S de unsloth y aplico una poda selectiva de expertos (de 256 a entre 101 y 217 por capa, con una media de 128) y una reduccion del ancho de cada experto (de 512 a 448 neuronas). El resultado es un archivo GGUF de 9,30 GiB que, segun el autor, ofrece mejor divergencia KL que la cuantizacion IQ2_M del modelo completo (0,651 frente a 0,715 de media) con un tamano ligeramente inferior. El checkpoint es explicitamente experimental y no ha sido evaluado con benchmarks formales.

La relevancia de esta ficha radica en que documenta una tecnica de poda de expertos guiada por enrutamiento (routing-guided expert pruning) aplicada a un MoE moderno, con evidencia empirica de divergencia KL, aunque limitada a un dominio de calibracion muy concreto: sesiones de programacion agentica de una sola persona. Es un caso de estudio util para investigadores interesados en compresion de MoE, pero no un modelo listo para produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (derivado de Qwen3.6-35B-A3B), con atencion completa y atencion lineal |
| Parametros totales | 16.530.731.648 (16,53 mil millones, segun safetensors del repo) |
| Parametros activos | no disponible (el modelo base es A3B, pero el dato activo del checkpoint podado no se publica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K (expertos gate/up), IQ4_NL (expertos down), Q6_K (ruta always-on), F32 (router y normas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo unico de 9,30 GiB) |

## Arquitectura y entrenamiento

El modelo base es un MoE transformer con atencion completa y atencion lineal, 40 capas y enrutamiento top-8. El checkpoint podado conserva la arquitectura del original pero modifica la estructura de los expertos: el numero de expertos enrutados por capa pasa de 256 a un rango no uniforme de 101 a 217 (media 128), y el ancho de cada experto retenido se reduce de 512 a 448 neuronas. El enrutamiento top-8 no se modifica.

No hubo reentrenamiento ni ajuste fino. El proceso de poda consta de cuatro pasos: primero se ejecuto `llama-imatrix` sobre un corpus de calibracion de aproximadamente 120k tokens (30 chunks) construido a partir de sesiones reales del agente de programacion Reika, incluyendo su prompt de sistema, 10 esquemas de herramientas y las llamadas y resultados de herramientas renderizados con la plantilla de chat del modelo. Despues, los expertos se asignaron por capa de forma codiciosa segun la masa de enrutamiento marginal, reteniendo en promedio el 86,6% de la masa (peor capa: 83,3%); una asignacion uniforme de 128 por capa habria cubierto solo el 66,1% en la peor capa. A continuacion, cada experto retenido conservo sus 448 neuronas intermedias de mayor puntuacion segun la norma L2 de la columna `down` multiplicada por la activacion RMS de entrada (estilo Wanda, usando la misma imatrix). Finalmente, la ruta always-on (atencion, atencion lineal, experto compartido, embeddings y salida) se recuantizo de Q8_0 a Q6_K con `llama-quantize`, fijando los tensores de expertos para que pasaran sin cambios.

El plan exacto de expertos y neuronas retenidos por capa se publica en `Qwen3.6-35B-A3B-Pruned-E128-W448.plan.json`. El corpus de calibracion y la imatrix son privados y no se han publicado.

## Capacidades

- Generacion de texto conversacional, segun el tag `conversational` del repo.
- Razonamiento de varios pasos: el autor reporta una respuesta de razonamiento de aproximadamente 4k tokens que convergio correctamente en pruebas de humo.
- Llamadas a herramientas (tool calling): las pruebas de humo incluyen llamadas a herramientas limpias, aunque el modelo se calibro con los esquemas de herramientas de Reika.
- Uso como agente de programacion: empleado como modelo diario en el CLI Reika desde el 2026-10-24.
- Capacidades multilingues: no disponibles (no se documentan idiomas soportados).
- Vision: no incluida. El checkpoint es solo texto, no incluye mmproj y la vision con el LM podado no se ha probado.
- Capacidades especiales (thinking mode, audio, etc.): no disponibles.

## Casos de uso

- Evaluacion de tecnicas de poda de MoE: el checkpoint y su archivo de plan permiten reproducir y analizar que expertos y neuronas sobreviven a una poda guiada por enrutamiento, util para investigadores que estudien compresion de modelos.
- Ejecucion local en Apple Silicon de 16 GB: el tamano de 9,30 GiB y las velocidades observadas de 23-25 t/s (contexto corto) a 14-17 t/s (sesiones largas) lo hacen viable en un M2 MacBook Air con Metal, un escenario donde el modelo completo en 4 bits no cabe.
- Agente de programacion personal en CLI: el autor lo usa a diario en Reika para tareas de codificacion agentica, con llamadas a herramientas y razonamiento multi-turno, aunque el rendimiento fuera de ese arnes no esta medido.
- Comparacion de divergencia KL en dominios de codigo: sirve como referencia empirica para medir cuanto se degrada un MoE podado frente a cuantizaciones de 2 bits del modelo completo, con datos de KL media, KL mediana y coincidencia de token top.
- Prototipado de pipelines con llama.cpp parcheado: util para equipos que quieran experimentar con modelos MoE de expertos no uniformes y validar el parche de 27 lineas incluido en el repo.
- Investigacion sobre sensibilidad al dominio de calibracion: al estar calibrado en un unico arnes, permite estudiar como el enrutamiento depende del prompt y los esquemas de herramientas, y donde falla la poda fuera de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo no ha sido evaluado con benchmarks y que la unica evidencia de calidad es la comparacion de divergencia KL y el uso diario anecdotal.

La tabla de divergencia KL frente al modelo sin podar (UD-Q4_K_S), sobre texto de sesiones Reika no usado en calibracion, con `llama-perplexity --kl-divergence`, CPU-only, 8 chunks de 2048 tokens, es la siguiente:

| Build | Tamano | KL media | KL mediana | Mismo token top |
|---|---|---|---|---|
| unsloth UD-IQ2_M (modelo completo, 2 bits) | 10,73 GiB | 0,715 | 0,109 | 75,7% |
| podado, 128 expertos, ancho completo, always-on Q8_0 | 10,87 GiB | 0,504 | 0,036 | 82,3% |
| podado, ancho 448, always-on Q8_0 | 9,72 GiB | 0,622 | 0,067 | 79,2% |
| este archivo (ancho 448, always-on Q6_K) | 9,30 GiB | 0,651 | 0,070 | 78,8% |

El ruido es de aproximadamente ±0,02 en KL media y ±0,45 puntos en mismo token top. El autor advierte que los valores absolutos estan inflados porque `llama-perplexity` tokeniza los tokens especiales de la plantilla de chat como texto plano, por lo que no son comparables con cifras de KL publicadas; solo deben compararse las filas entre si.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el archivo GGUF ocupa 9,30 GiB; se necesita al menos esa cantidad de memoria mas overhead de contexto. En una maquina de 16 GB funciona con Metal en Apple Silicon.
- GPU recomendadas: no se documentan GPU dedicadas. El autor lo ejecuta en un M2 MacBook Air de 16 GB con Metal. Por tamano, cabria en GPUs consumer con 12-16 GB de VRAM, aunque no se ha verificado.
- Cabe en GPU consumer: si, previsiblemente en tarjetas con 12 GB o mas de VRAM, aunque no hay pruebas publicadas.
- Opciones de despliegue: llama.cpp con el parche de 27 lineas incluido en el repo (`0007-*.patch`). No carga en llama.cpp estandar: sin el parche, el cargador rechaza el archivo con el error `key qwen35moe.expert_count has wrong type arr but expected type u32`. No se documenta soporte en vLLM, Ollama ni TGI.
- Latencia y throughput: en un M2 MacBook Air (16 GB, Metal), aproximadamente 23-25 t/s en el mejor caso (servidor recien iniciado y contexto corto), bajando a 14-17 t/s en sesiones agenticas largas a medida que crece el contexto y aumenta la presion de memoria. Son rangos observados en uso diario, no un benchmark controlado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Pruned-E128-W448 (este) | 16,53 mil millones (total), activos no disponibles | no disponible | KL media 0,651 frente a UD-Q4_K_S en dominio Reika; sin benchmarks | Apache 2.0 | GGUF, requiere parche de llama.cpp |
| Qwen3.6-35B-A3B (base) | segun modelo base, no disponible en esta ficha | no disponible | modelo de referencia sin podar | Apache 2.0 | Hugging Face |
| unsloth Qwen3.6-35B-A3B-UD-IQ2_M | modelo completo cuantizado a 2 bits | no disponible | KL media 0,715; mismo token top 75,7% | Apache 2.0 (heredada) | GGUF, 10,73 GiB |

La comparacion se limita al modelo base y a la cuantizacion IQ2_M del mismo, que son las referencias usadas por el autor. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint experimental: el autor lo etiqueta explicitamente como experimental y advierte de que no ha sido evaluado con benchmarks. La unica evidencia de calidad es la divergencia KL y el uso diario anecdotal de una persona.
- No carga en llama.cpp estandar: requiere aplicar el parche de 27 lineas incluido en el repo. Sin el, el cargador rechaza el archivo.
- Calibrado en un unico dominio: el corpus de calibracion son sesiones del agente de programacion Reika, con su prompt de sistema, sus 10 esquemas de herramientas y su formato de llamadas. Otros arneses con prompts y herramientas distintos pueden enrutar hacia expertos diferentes; esto no se ha medido y el modelo puede ser mas debil exactamente donde ese dominio es escaso.
- Tareas fuera de dominio: los expertos se retuvieron por frecuencia de enrutamiento en el dominio de calibracion, por lo que el rendimiento en tareas ajenas a la programacion agentica es incierto.
- La KL mide cercania al modelo 4-bit sin podar en el dominio de calibracion, no calidad de tarea, y no dice nada sobre dominios fuera de los datos de calibracion.
- Solo texto: no incluye mmproj y la vision con el LM podado no se ha probado.
- Idiomas soportados no documentados: no se puede garantizar el rendimiento multilingue.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero el caracter experimental y la falta de evaluacion desaconsejan su uso en produccion sin validacion propia.
- El tag "Q6_K" del Hub proviene del campo `general.file_type` de la cabecera, que corresponde al ultimo pase de `llama-quantize` (la recuantizacion always-on); no es el tipo dominante, ya que aproximadamente el 80% de los bytes son de 4 bits. llama.cpp ignora este campo al cargar.
- El corpus de calibracion y la imatrix son privados y no se publican, lo que dificulta la reproducibilidad completa del proceso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alexwkleung/Qwen3.6-35B-A3B-Pruned-E128-W448-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Reika (agente de programacion usado para la calibracion): https://reikacode.com
- Cuantizacion de origen (unsloth UD-Q4_K_S): no disponible como enlace directo en la informacion proporcionada
- Plan de poda (`Qwen3.6-35B-A3B-Pruned-E128-W448.plan.json`): incluido en el repositorio del modelo
- Parche de llama.cpp (`0007-*.patch`): incluido en el repositorio del modelo
