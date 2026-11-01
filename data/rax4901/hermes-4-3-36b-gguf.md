# rax4901/Hermes-4.3-36B-GGUF

## Resumen

Hermes 4.3 36B es un modelo de razonamiento en modo híbrido desarrollado por Nous Research sobre la base ByteDance-Seed/Seed-OSS-36B-Base. Se trata de un ajuste fino (finetune) instructivo de 36.151 millones de parámetros, entrenado de forma descentralizada a través de internet mediante la red Psyche, algo que los propios autores destacan como una primera para la familia Hermes. El modelo aborda el problema habitual de los asistentes cerrados: la excesiva reticencia a responder y la falta de control por parte del usuario sobre el alineamiento del modelo.

La versión aquí documentada es una cuantización en formato GGUF publicada por el usuario rax4901 en Hugging Face, lo que permite ejecutar el modelo en hardware de consumo mediante runtimes como llama.cpp u Ollama. Hermes 4.3 destaca por su razonamiento híbrido con segmentos explícitos `<think>…</think>`, soporte de function calling, salidas estructuradas en JSON y una tasa de negativas (refusals) muy reducida: es SOTA en el leaderboard RefusalBench entre modelos no "abliterated", con un 74,60 % de preguntas respondidas en modo no razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Seed-OSS 36B); detalles adicionales no disponibles |
| Parametros totales | 36.151.104.512 (~36,2 B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (el modelo se promociona como "long context", sin cifra concreta en la model card) |
| Tipos de cuantizacion | No disponible (GGUF; el repo ocupa 205,4 GB en total) |
| Idiomas soportados | Ingles (declarado oficialmente) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizacion de terceros; los pesos originales del base model estan en safetensors) |

## Arquitectura y entrenamiento

Hermes 4.3 36B parte de ByteDance-Seed/Seed-OSS-36B-Base, un modelo transformer de 36,2 mil millones de parametros. Sobre esa base, Nous Research aplico un post-entrenamiento con un corpus sintetizado de aproximadamente 5 millones de muestras y unos 60 mil millones de tokens, un salto enorme respecto a Hermes 3 (1 millon de muestras / 1,2 mil millones de tokens). El corpus mezcla datos de razonamiento y no razonamiento, con enfasis en trazas de razonamiento verificadas.

Una caracteristica distintiva es que este modelo se entreno de forma descentralizada a traves de internet usando la red Psyche, en contraste con la variante "centralizada" con la que se compara en los benchmarks. El post-entrenamiento incorpora modo de razonamiento hibrido: el modelo emite segmentos `<think>…</think>` cuando decide deliberar, y puede controlarse mediante el flag `thinking=True` en la plantilla de chat o mediante un system prompt especifico. El formato de prompt es Llama-3-Chat con cabeceras de rol y tags especiales. No se ha detallado en la model card si se usaron tecnicas concretas como RLHF o DPO.

## Capacidades

- Generacion de texto conversacional con formato ChatML/Llama-3-Chat y calidad de asistente general preservada.
- Razonamiento hibrido: segmentos explicitos `<think>…</think>` activables con `thinking=True` o system prompt, con opcion `keep_cots=True` para conservar las cadenas de razonamiento.
- Mejoras sustanciales en matematicas, codigo, STEM y logica respecto a Hermes 3.
- Function calling y tool use nativos, con posibilidad de intercalar el system prompt de herramientas con el de razonamiento.
- Salidas estructuradas: entrenado para generar JSON valido segun esquemas dados y reparar objetos malformados (json mode).
- Escritura creativa y roleplaying, con alineamiento "neutro" y alta steerability.
- Contexto largo (tag "long context"), aunque sin cifra publicada en la model card.

## Casos de uso

- Asistentes conversacionales sin censura excesiva: gracias a su liderazgo en RefusalBench (74,60 % de preguntas respondidas), es adecuado para aplicaciones donde los modelos cerrados rechazan consultas benignas.
- Resolucion de problemas de matematicas y competiciones: sus resultados en AIME 24 (71,9) y MATH-500 (93,8) lo hacen util para tutores academicos y verificacion de soluciones.
- Generacion de codigo asistida: el soporte de razonamiento y tool use permite integrarlo en pipelines de desarrollo que requieran deliberacion antes de escribir codigo.
- Agentes con llamadas a herramientas: el function calling nativo y las salidas JSON validas segun esquema permiten construir flujos multi-paso con APIs externas.
- Extraccion y estructuracion de datos: el entrenamiento en schema adherence y reparacion de JSON malformado lo hace idoneo para convertir texto libre en salidas estructuradas fiables.
- Roleplaying y escritura creativa: el alineamiento neutro y la steerability mejorada lo adecuan para narrativa interactiva y personajes.
- Ejecucion local en hardware de consumo: al estar cuantizado en GGUF, puede desplegarse con llama.cpp u Ollama sin necesidad de multiples GPU de datacenter.

## Benchmarks y rendimiento

Resultados oficiales declarados por Nous Research para Hermes 4.3 36B (variante Psyche, entrenamiento descentralizado) frente a la variante centralizada y Hermes 4 70B:

| Benchmark | Hermes 4.3 36B Psyche | Hermes 4.3 36B Centralized | Hermes 4 70B Centralized |
|---|---|---|---|
| AIME 24 | 71,9 | 70,6 | 73,5 |
| AIME 25 | 69,3 | 66,8 | 67,4 |
| BBH | 86,4 | 84,7 | 87,8 |
| DROP | 83,5 | 81,6 | 85,0 |
| GPQA Diamond | 65,5 | 64,8 | 66,1 |
| IFEval | 77,9 | 73,9 | 78,7 |
| MATH-500 | 93,8 | 92,3 | 95,5 |
| MMLU | 87,7 | 86,5 | 88,4 |
| MMLU-Pro | 80,7 | 79,7 | 80,7 |
| MuSR | 69,7 | 64,7 | 70,4 |
| OBQA | 96,6 | 91,8 | 94,8 |
| SimpleQA | 6,0 | 5,6 | 17,9 |

Adicionalmente, en RefusalBench (% de preguntas respondidas, media de 5 intentos): Hermes 4.3 36B Non-Reasoning alcanza 74,60 % y Reasoning 72,29 %, superando a Hermes 4 70B Reasoning (59,50 %) y a modelos cerrados como GPT-4o (17,67 %) o Gemini 2.5 Pro (24,23 %). Destaca el bajo puntaje en SimpleQA (6,0), indicativo de factuality limitada en preguntas de hechos concretos.

## Requisitos de hardware

- El modelo completo en FP16 ocupa unos 72 GB; el repo GGUF completo pesa 205,4 GB, lo que sugiere que incluye multiples cuantizaciones (las concretas no estan especificadas).
- Para cuantizaciones GGUF medias (Q4/Q5, ~20-26 GB), una GPU de consumo con 24 GB de VRAM (RTX 3090/4090) puede ejecutarlo, parcialmente offloadado a CPU; con cuantizaciones bajas (Q3) cabe con mayor holgura.
- Para cuantizaciones altas (Q8 o la version completa), se recomiendan GPU con 48 GB o mas (A6000, A100, H100) o configuraciones multi-GPU / CPU con RAM elevada.
- Opciones de despliegue: llama.cpp y Ollama (nativo para GGUF), LM Studio, o la variante safetensors original con vLLM o TGI.
- Datos de latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Rasgo distintivo |
|---|---|---|---|---|
| Hermes 4.3 36B (este) | 36,2 B | GGUF / safetensors | Apache 2.0 | Razonamiento hibrido, SOTA en RefusalBench, entrenamiento descentralizado (Psyche) |
| Hermes 4 70B | 70 B | safetensors | Apache 2.0 | Mayor tamano, mejores benchmarks academicos pero RefusalBench inferior (59,5 %) |
| Qwen3 235B (base Seed comparable en razonamiento) | 235 B (MoE) | safetensors | Apache 2.0 | Mucho mayor, RefusalBench muy bajo (15,3-34,3 %) |
| gpt-oss 20B | ~20 B | safetensors | Apache 2.0 | Mas ligero y facil de desplegar, pero RefusalBench de solo 4,79 % |

## Limitaciones y advertencias

- Idioma: oficialmente solo se declara soporte de ingles; el rendimiento en castellano no esta documentado y puede ser inferior.
- Factuality baja en preguntas de conocimiento puntual: SimpleQA de 6,0 indica un alto riesgo de alucinaciones en consultas factualmente especificas; no es adecuado como fuente de verdad sin verificacion externa.
- El alineamiento "neutro" y la reduccion deliberada de negativas implican menos salvaguardas integradas: en produccion conviene anadir capas propias de moderacion de contenido.
- La cuantizacion GGUF es de un tercero (rax4901), no de Nous Research; puede haber diferencias de calidad respecto a los pesos originales segun la cuantizacion empleada.
- La longitud de contexto exacta no esta publicada en la model card de esta cuantizacion; verificarla antes de planificar aplicaciones de contexto largo.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque los terminos del modelo base (Seed-OSS) deben revisarse para despliegues criticos.
- El modo razonamiento genera segmentos `<think>` que consumen tokens de salida y aumentan la latencia; usar `thinking=False` cuando se priorice velocidad.

## Enlaces

- Modelo GGUF (esta ficha): https://huggingface.co/rax4901/Hermes-4.3-36B-GGUF
- Modelo base: https://huggingface.co/ByteDance-Seed/Seed-OSS-36B-Base
- Blog de presentacion de Hermes 4.3: https://nousresearch.com/introducing-hermes-4-3/
- Hermes 4 Technical Report (arXiv): https://arxiv.org/abs/2508.18255
- Demo oficial (Nous Chat): https://chat.nousresearch.com
- Psyche (entrenamiento descentralizado): https://psyche.network
