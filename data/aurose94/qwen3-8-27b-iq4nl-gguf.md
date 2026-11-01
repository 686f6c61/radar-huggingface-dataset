# auRose94/Qwen3.8-27B-iq4nl-GGUF

## Resumen

Qwen3.8-27B-iq4nl-GGUF es una cuantización en formato GGUF con precisión IQ4_NL del modelo Qwen3.8-27B-Base, publicada por el usuario auRose94 en Hugging Face. El objetivo del repositorio es ofrecer una versión del modelo de 27 mil millones de parámetros que funcione en cualquier build actual de llama.cpp, Ollama o LM Studio sin necesidad de runtimes personalizados, reduciendo el tamaño respecto a f16 en un 70 % (15,6 GiB frente a los ~52 GiB que ocuparía en media precisión).

El cuantizado conserva la tabla de embeddings y la cabeza de salida en Q8_0 para mantener la fidelidad en los logits, y se ha generado mediante un empaquetador RTN determinista por bloques de 32, verificado byte a byte contra el materializador del runtime del fork. El archivo resultante es una "materialización" de un contenedor maestro (`Qwen3.8-27B-ninths-k63-e99-GGUF`), que puede regenerarse en Q8_0 o f16 exactos.

Su relevancia actual radica en que permite ejecutar un modelo híbrido con arquitectura gated-delta-net en hardware de gama alta de consumo (el autor lo mide en un Ryzen AI Max+ 395 con GPU Radeon 8060S y 96 GiB de memoria unificada), con soporte de decodificación especulativa vía MTP que duplica el throughput de generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida (transformer con gated-delta-net scan, segun la model card) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (las mediciones del autor se realizaron con 16 KiB de contexto) |
| Tipos de cuantizacion | IQ4_NL (embeddings y output head en Q8_0); contenedor maestro re-materializable a Q8_0 o f16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-27B-Base de Qwen, emplea segun la model card una arquitectura hibrida cuyo gated-delta-net scan es compute-bound, es decir, limitado por computo mas que por ancho de banda de memoria. Esta caracteristica es la que hace especialmente efectiva la decodificacion especulativa: el autor reporta una aceleracion de 2,06x con el modo `--spec-type draft-mtp`, gracias a que el modelo incluye su capa MTP (Multi-Token Prediction) materializada en el GGUF, con una tasa de aceptacion de draft del 64 % y 2,93 tokens por draft.

Sobre los datos y el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO), la informacion disponible no aporta detalles, por lo que no pueden especificarse. Respecto a la cuantizacion en si, se trata de un empaquetado RTN (round-to-nearest) determinista por bloques de 32, sin calibracion, generado desde un contenedor "ninths" (k9) con parametros k63-e99, verificado byte a byte contra el materializador del runtime del fork.

## Capacidades

- Generacion de texto conversacional (tag `conversational` en el repositorio).
- Carga compatible con runtimes estandar: llama.cpp, Ollama y LM Studio en builds actuales, sin runtime personalizado.
- Decodificacion especulativa nativa mediante `--spec-type draft-mtp`, con la capa MTP incluida en el archivo.
- Carga rapida (~13 s) al tratarse de un archivo ya materializado, sin decodificacion en tiempo de carga.
- Razonamiento sobre tareas de codigo: el autor reporta 21/24 tareas correctas en una bateria Godot-4 de 24 tareas con graders mecanicos (greedy).
- Capacidades de vision, audio, tool calling o agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Ejecucion local en estaciones de trabajo con GPU integrada de gran memoria: el modelo cabe en sistemas como el Ryzen AI Max+ 395 con 96 GiB de memoria unificada, ideal para desarrolladores que quieren inferencia local sin datacenter.
- Prototipado rapido con LM Studio u Ollama: al ser un GGUF estandar IQ4_NL, se carga en herramientas de escritorio habituales sin configuracion especial, con ~13 s de carga.
- Generacion y depuracion de codigo en motores de juego: la bateria Godot-4 del autor (21/24 con graders mecanicos) sugiere utilidad en tareas de codigo sobre Godot 4 en local.
- Generacion por lotes con presupuesto de tiempo ajustado: el modo draft-mtp eleva la generacion de 13,1 a 27,0 tok/s, util cuando se procesan prompts largos en local.
- Experimentacion con cuantizaciones: al existir el contenedor maestro re-materializable a Q8_0 o f16, es util para comparar precisiones de forma determinista.
- Despliegue en servidores de inferencia locales con llama.cpp: la compatibilidad con builds actuales evita forks o parches, simplificando la integracion en pipelines propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos medidos provienen del autor del cuantizado, sobre un Ryzen AI Max+ 395 (Radeon 8060S, 96 GiB unificados, residencia completa en GPU, contexto de 16 KiB):

| Metrica | Valor |
|---|---|
| Tiempo de carga | ~13 s |
| Prompt eval | 134 tok/s |
| Generacion (plain) | 13,1 tok/s |
| Generacion (draft-mtp) | 27,0 tok/s (2,06x; 64 % aceptacion, 2,93 tokens/draft) |
| Bateria Godot-4 (24 tareas, greedy) | 21/24 |

## Requisitos de hardware

- VRAM/memoria estimada: 15,6 GiB solo para los pesos; con contexto y buffers, se recomienda disponer de al menos 20-24 GiB de VRAM o memoria unificada.
- El autor lo ejecuta con residencia completa en GPU en un Ryzen AI Max+ 395 (Radeon 8060S, 96 GiB de memoria unificada).
- En GPUs dedicadas: una RTX 4090 (24 GiB) deberia alojar los pesos con margen limitado para contexto; GPUs de 32 GiB (RTX 5090, A100 40G, V100 no aplicable por arquitectura) ofrecen mas holgura. No hay mediciones publicadas en estas GPUs.
- No cabe comadamente en GPUs de 16 GiB o menos considerando contexto util.
- Despliegue: llama.cpp, Ollama y LM Studio (builds actuales, sin runtime personalizado). Compatibilidad con vLLM o TGI: no disponible en la informacion proporcionada.
- Throughput estimado (hardware del autor): 13,1 tok/s en generacion simple, 27,0 tok/s con decodificacion especulativa draft-mtp.

## Comparativa con modelos similares

| Modelo | Parametros | Formato/Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-iq4nl-GGUF (este) | 27,3 B | GGUF IQ4_NL (emb/head Q8_0) | no disponible | Apache-2.0 | 15,6 GiB; draft-mtp nativo |
| Qwen/Qwen3.8-27B-Base (base) | 27,3 B | safetensors (f16/bf16) | no disponible | Apache-2.0 | Pesos originales, ~52 GiB en f16 |
| Qwen3.8-27B-ninths-k63-e99-GGUF | 27,3 B | GGUF contenedor k9 (k63-e99) | no disponible | no disponible | Contenedor maestro, requiere materializacion |

No se conocen alternativas de terceros con arquitectura hibrida gated-delta-net y tamano similar para comparar rendimiento; no disponible.

## Limitaciones y advertencias

- Es una cuantizacion de terceros (auRose94), no oficial de Qwen: el empaquetado RTN sin calibracion puede degradar la calidad frente a cuantizaciones con calibracion (AWQ, GPTQ) o frente a f16.
- La cuantizacion IQ4_NL a 4 bits implica perdida de precision respecto a f16; el autor mantiene embeddings y output head en Q8_0 para mitigarlo, pero no publica evaluaciones comparativas de calidad.
- Sesgos conocidos: no disponible; hereda los del modelo base Qwen3.8-27B-Base, sobre el que tampoco se documenta informacion de alineacion.
- Riesgo de alucinacion: no cuantificado; al tratarse de un modelo base (no instruct), no esta afinado para seguir instrucciones de forma fiable.
- Longitud de contexto del modelo no documentada en este repositorio; las mediciones se hicieron con 16 KiB.
- Idiomas soportados: no disponible.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar los terminos del modelo base original en el repositorio de Qwen.
- El rendimiento publicado (13,1-27,0 tok/s) corresponde a un hardware muy concreto (Ryzen AI Max+ 395 con 96 GiB unificados); los resultados variaran sustancialmente en otras plataformas.
- La decodificacion especulativa draft-mtp requiere un fork/runtime con soporte para `--spec-type draft-mtp`; no es una funcionalidad estandar de todas las builds de llama.cpp.

## Enlaces

- Repositorio del cuantizado: https://huggingface.co/auRose94/Qwen3.8-27B-iq4nl-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B-Base
- Contenedor maestro (ninths k9): https://huggingface.co/auRose94/Qwen3.8-27B-ninths-k63-e99-GGUF (referenciado en la model card como alojado en el mismo Hub)
- Paper, blog o demo oficiales: no disponible
