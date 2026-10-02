# roman220220/gemma-4-E2B-it-qat-phone-mlx

## Resumen

El modelo `roman220220/gemma-4-E2B-it-qat-phone-mlx` es una cuantizacion experimental de Gemma 4 E2B (instrucciones) en formato MLX, publicada por el usuario roman220220 bajo la organizacion tecnica de IPSupport. Parte de los pesos maestros `google/gemma-4-E2B-it-qat-q4_0-unquantized` y aplica una receta propia de cuantizacion mixta orientada a dispositivos moviles y Macs con poca memoria. El repositorio ocupa 3,2 GB y contiene 5.534.082.627 parametros almacenados en safetensors.

El objetivo declarado es obtener la variante funcional mas pequena posible sin degradar de forma apreciable la calidad: mantiene el decodificador de texto sobre la rejilla QAT (quantization-aware training) de Google en 4 bits, conserva 126 capas Lineales en 8 bits porque a 4 bits disparan la divergencia KL, baja las embeddings por capa de 6 a 4 bits y comprime las torres de vision y audio de 8 a 4 bits. Es un modelo multimodal (texto, imagen y audio) que, segun las mediciones del autor, logra una perplejidad de 36,44 en wikitext-2 frente a 36,04 de los pesos maestros bf16.

Es relevante porque demuestra que es posible comprimir un modelo multimodal QAT hasta 3,10 GB manteniendo velocidad de decodificacion (70,2 tokens/s en un MacBook Air M5) y una memoria maxima de 3,26 GB, lo que lo situa en el rango de Macs de 8 GB, iPhone y iPad con MLX. Existe tambien una version GGUF del mismo autor para llama.cpp/Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + vision + audio) con embeddings por capa; base QAT de Google |
| Parametros totales | 5.534.082.627 |
| Parametros activos | no disponible (la nomenclatura E2B sugiere un diseno de parametros efectivos, pero no se detalla en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: Lineales del decodificador de texto en 4 bits sobre rejilla QAT; 126 Lineales en 8 bits; embeddings por capa en 4 bits; torres de vision y audio en 4 bits. Existe build GGUF con la misma receta |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | MLX safetensors (libreria `mlx`); build GGUF equivalente en otro repositorio |

## Arquitectura y entrenamiento

Se trata de una cuantizacion post-entrenamiento (PTQ) guiada por mediciones sobre un modelo que ya paso por un proceso de quantization-aware training de Google. El punto de partida es `google/gemma-4-E2B-it-qat-q4_0-unquantized` y el autor reutiliza la rejilla QAT de 4 bits de Google para las Lineales del decodificador de texto, de modo que esas capas son identicas bit a bit al GGUF q4_0 oficial de Google. El resto de la receta se decide empiricamente midiendo la divergencia KL por megabyte: las 126 Lineales mas sensibles se mantienen en 8 bits, las embeddings por capa (que segun el autor suponen aproximadamente 1,9 GB a 6 bits, casi la mitad del modelo) bajan a 4 bits, y las torres de vision y audio pasan de 8 a 4 bits. No se baja de 6 bits en las token embeddings ni se llega a 3 bits en las embeddings por capa porque el coste medido era demasiado alto.

La eleccion de embeddings por capa es coherente con la familia Gemma orientada a dispositivos: estas tablas se consultan (lookup) en lugar de multiplicarse, por lo que reducir sus bits ahorra memoria sin penalizar el tiempo de decodificacion. El autor descarta explicitamente la variante movil de Google (`google/gemma-4-E2B-it-qat-mobile-transformers`, con MLP y embeddings a 2 bits): al convertirla a MLX ocupa 2,57 GB, pero al ejecutarse sin las activaciones int8 para las que fue entrenada su perplejidad sube a 65 y su torre de audio deja de funcionar. No se documentan en la informacion disponible detalles sobre el dataset de entrenamiento original, el numero de tokens ni las fases de RLHF/DPO del modelo base.

## Capacidades

- Generacion de texto conversacional con plantilla de chat propia de la familia Gemma.
- Razonamiento y respuesta a preguntas generales (se cita como prueba tres datos sobre el Imperio Romano).
- Comprension de vision a traves de la torre de imagen en 4 bits (se cita la descripcion "A red fox is in this picture").
- Transcripcion de audio a traves de la torre de audio en 4 bits (se cita transcripcion literal de una locucion).
- Entrada multimodal combinada texto + imagen + audio en el pipeline `image-text-to-text`.
- Modo "thinking" disponible en el modelo base (en la evaluacion de perplejidad se desactiva explicitamente).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Asistente conversacional local en Mac: el modelo corre con `mlx-lm` sobre Apple Silicon y permite chat sin que los datos salgan del equipo, gracias a que la decodificacion consume unos 3,26 GB de memoria maxima.
- Captioning y descripcion de imagenes en movil: la torre de vision en 4 bits permite procesar imagenes en dispositivos con poca RAM, como iPhone o iPad, integrándose en apps nativas mediante MLX.
- Transcripcion de audio en local: la torre de audio en 4 bits transcribe locuciones sin conexion, util para notas de voz o dictado en dispositivos con 8 GB.
- Aplicaciones macOS empaquetadas: con 3,10 GB de pesos encaja en el runtime de LLMTray, que expone una API compatible con OpenAI y perfiles por modelo.
- Prototipado de asistentes multimodales en investigacion: al partir de una base QAT de Google y ofrecer una version GGUF equivalente, permite comparar recetas de cuantizacion sobre el mismo modelo.
- Despliegue en llama.cpp u Ollama para escritorio y movil: la variante GGUF `roman220220/gemma-4-E2B-it-qat-phone-GGUF` usa la misma receta y esta pensada para estos runtimes.
- Evaluacion de cuantizacion en pipelines propios: el autor publica los scripts (`e2b_phone.sh`, `mobile_sweep.sh`, `qat_eval.py`) para reproducir la receta y medir KL y perplejidad contra los pesos maestros.

## Benchmarks y rendimiento

Perplejidad en wikitext-2 (test), 128 ventanas de 512 tokens, cada una con el formato de chat de Gemma (un turno de usuario y el turno del modelo con thinking desactivado). La divergencia KL y la coincidencia top-1 se calculan respecto a los pesos maestros bf16 del QAT.

| Modelo | Tamano | PPL | KL frente al maestro QAT | Coincidencia top-1 |
|---|---|---|---|---|
| Pesos maestros QAT bf16 (google/gemma-4-E2B-it-qat-q4_0-unquantized) | no disponible | 36,04 | no disponible | no disponible |
| roman220220/gemma-4-E2B-it-qat-mlx | 4,04 GB | 36,38 | 0,0226 | 92,73 % |
| roman220220/gemma-4-E2B-it-qat-phone-mlx (este modelo) | 3,10 GB | 36,44 | 0,0242 | 92,48 % |

Velocidad y memoria (MacBook Air M5, `mlx-lm`, decodificacion):

| Build | tokens/s | Memoria maxima |
|---|---|---|
| roman220220/gemma-4-E2B-it-qat-mlx | 70,3 | 3,80 GB |
| roman220220/gemma-4-E2B-it-qat-phone-mlx (este modelo) | 70,2 | 3,26 GB |

Pruebas de humo declaradas antes de la subida: respuesta en chat, vision a traves de la torre de 4 bits, audio transcrito palabra por palabra, ausencia de pesos grandes sin cuantizar y pico de 4,2 GB con imagen y audio cargados simultaneamente. No hay resultados de MMLU, HumanEval, GSM8K ni otras suites estandar en la informacion disponible.

## Requisitos de hardware

- Memoria maxima en decodificacion de texto: 3,26 GB (medido en MacBook Air M5 con `mlx-lm`).
- Memoria maxima con imagen y audio cargados: 4,2 GB (segun la prueba de humo del autor).
- Encaja en Macs de 8 GB, iPhone y iPad con MLX, segun el autor.
- El runtime objetivo es Apple Silicon; para otras plataformas existe la build GGUF.
- Despliegue: `mlx-lm` (fork de IPSupport, `pip install "mlx-lm @ git+https://github.com/ipsupport-llc/mlx-lm.git"`), LLMTray en macOS y, mediante el GGUF equivalente, llama.cpp u Ollama.
- Velocidad de decodificacion medida: 70,2 tokens/s en MacBook Air M5.
- Latencia de prefill y throughput en GPU de datacenter (A100, H100, RTX 4090): no disponible, dado que el formato MLX esta orientado a Apple Silicon.

## Comparativa con modelos similares

| Modelo | Tamano | PPL (wikitext-2) | Licencia | Disponibilidad |
|---|---|---|---|---|
| roman220220/gemma-4-E2B-it-qat-mlx | 4,04 GB | 36,38 | apache-2.0 | HuggingFace (MLX) |
| roman220220/gemma-4-E2B-it-qat-phone-mlx | 3,10 GB | 36,44 | apache-2.0 | HuggingFace (MLX) |
| roman220220/gemma-4-E2B-it-qat-phone-GGUF | no disponible | no disponible | no disponible | HuggingFace (GGUF) |
| google/gemma-4-E2B-it-qat-mobile-transformers (convertido a MLX) | 2,57 GB | 65 (frente a 41 esperado; audio inoperativo) | no disponible | HuggingFace (transformers) |
| google/gemma-4-E2B-it-qat-q4_0-unquantized (maestro bf16) | no disponible | 36,04 | apache-2.0 | HuggingFace |

Comparado con la build MLX de 4,04 GB, esta variante reduce el repositorio en casi un gigabyte y la memoria maxima en 0,54 GB a cambio de un incremento de KL de 0,0016 y de 0,06 puntos de perplejidad, manteniendo la velocidad practicamente identica. Frente a la propuesta movil de Google es menos agresiva en bits pero conserva la torre de audio y una perplejidad muy inferior en el runtime MLX.

## Limitaciones y advertencias

- Cuantizacion experimental realizada por un tercero, no por Google; los pesos del decodificador coinciden con el GGUF q4_0 oficial, pero el resto de la receta es propia del autor.
- Los unicos datos de calidad son los publicados por el autor (perplejidad, KL y coincidencia top-1 en wikitext-2); no hay evaluacion independiente ni benchmarks de tareas.
- Hay un incremento medido de la divergencia KL (0,0242) y una perdida de coincidencia top-1 (92,48 %) respecto a los pesos maestros bf16, por lo que puede diferir en tareas sensibles.
- La cuantizacion de la torre de vision y audio a 4 bits puede degradar casos limite no cubiertos por la prueba de humo.
- La licencia declarada en HuggingFace es apache-2.0, pero el modelo base pertenece a la familia Gemma de Google; conviene verificar los terminos aplicables al uso comercial del modelo base.
- No se documentan idiomas soportados ni longitud de contexto, por lo que no se puede garantizar comportamiento multilingue ni ventanas largas.
- Al ser un formato MLX, el despliegue directo esta restringido a Apple Silicon; fuera de ese ecosistema hay que usar la build GGUF.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que implica una validacion comunitaria practicamente nula.
- No hay informacion sobre sesgos, alucinacion o datos de entrenamiento especificos del modelo base mas alla de lo que publique Google.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/roman220220/gemma-4-E2B-it-qat-phone-mlx
- Modelo base (maestro QAT bf16): https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Build MLX de 4,04 GB del mismo autor: https://huggingface.co/roman220220/gemma-4-E2B-it-qat-mlx
- Build GGUF equivalente: https://huggingface.co/roman220220/gemma-4-E2B-it-qat-phone-GGUF
- GGUF q4_0 oficial de Google: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-gguf
- Variante movil QAT de Google: https://huggingface.co/google/gemma-4-E2B-it-qat-mobile-transformers
- Codigo y notas del metodo: https://github.com/rromenskyi/quant-ternary/tree/main/gemma4-quant
- Fork de mlx-lm usado por el autor: https://github.com/ipsupport-llc/mlx-lm
- LLMTray (app macOS): https://www.ipsupport.us/llmtray/
- IPSupport Code: https://ipsupport-llc.github.io/ipsupport-code/
- IPSupport: https://www.ipsupport.us
