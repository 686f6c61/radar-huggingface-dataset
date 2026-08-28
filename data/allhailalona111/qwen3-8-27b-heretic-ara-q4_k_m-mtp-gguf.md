# allhailalona111/Qwen3.8-27B-heretic-ara-Q4_K_M-MTP-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `trohrbaugh/Qwen3.8-27B-heretic-ara`, una versión "abliterated" (sin censura) de Qwen3.8-27B, el último modelo multimodal de la serie Qwen3.5. La cuantización, realizada por el usuario `cygnal` y publicada por `allhailalona111`, preserva los tensores de MTP (Multi-Token Prediction) e incluye un proyector de visión (mmproj) en BF16, lo que permite ejecutar el modelo con decodificación especulativa y comprensión de imágenes en hardware variado, con especial optimización para GPUs AMD RDNA 3.5 (Strix Halo) mediante el fork ROCmFPX de llama.cpp.

El modelo base, Qwen3.8-27B, es un transformer denso de 27 320 millones de parámetros con soporte multimodal (imagen y texto). La variante "heretic-ara" aplica una técnica de ablación de rango arbitrario (ARA) para eliminar los rechazos del modelo, logrando 0/100 refusals en las pruebas del autor. Esta versión cuantizada es relevante porque ofrece velocidades de decodificación de hasta ~42 t/s en AMD Strix Halo con ROCmFPX, y mantiene compatibilidad con llama.cpp estándar, lo que la hace atractiva para despliegues locales en hardware consumer y de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5) |
| Parametros totales | 27 320 697 856 (~27B) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible (los ejemplos usan 32K; se menciona soporte de hasta 262K con TurboQuant) |
| Tipos de cuantizacion | Q4_K_M, Q6_K, ROCmFP4-FAST, ROCmFP6 (formatos GGUF) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de la familia Qwen3.5, con 27 320 millones de parámetros y capacidad multimodal (image-text-to-text). La variante `heretic-ara` fue obtenida mediante Arbitrary-Rank Ablation (ARA) sobre el modelo original, una técnica que modifica los pesos para eliminar comportamientos de rechazo (refusals) sin un fine-tuning supervisado. Los parámetros del proceso ARA son: `start_layer 26`, `end_layer 56`, `preserve_good_behavior_weight 0.9432`, `steer_bad_behavior_weight 0.0009`, con una divergencia KL de 0.0535 y 0/100 rechazos en las pruebas del autor.

La cuantización GGUF de este repositorio preserva los 866 tensores de MTP (Multi-Token Prediction), lo que permite usar decodificación especulativa con `--spec-type draft-mtp` en llama.cpp. Además, se incluye un proyector de visión (`mmproj`) en BF16 de 931 MB, que activa el codificador de imágenes solo cuando la solicitud contiene imágenes, sin impacto en el rendimiento de texto puro. No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre el proceso de cuantización más allá de los formatos utilizados.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y chino.
- Razonamiento y resolucion de problemas, incluyendo matematicas y logica.
- Generacion de codigo en multiples lenguajes, optimizado para agentes de codificacion autonomos (Claude Code, OpenCode, Aider, Hermes).
- Comprension de imagenes (multimodal) mediante el proyector de vision mmproj, con soporte para descripcion y analisis visual.
- Tool calling / function calling, compatible con la API OpenAI de llama-server.
- Decodificacion especulativa MTP (Multi-Token Prediction) para acelerar la generacion, con hasta 3-6 tokens de draft segun el backend.
- Capacidad de agentes y razonamiento multi-paso, gracias a su naturaleza "uncensored" y su entrenamiento para tareas de codificacion.
- Soporte de contexto largo (hasta 262K tokens con TurboQuant en ROCmFPX, segun la documentacion del autor).

## Casos de uso

- Agentes de codificacion autonomos: el modelo puede integrarse en herramientas como Claude Code o Aider para generar, revisar y depurar codigo en repositorios reales, gracias a su soporte de tool calling y su optimizacion para tareas de programacion.
- Asistente de atencion al cliente sin censura: al estar abliterated, puede manejar consultas delicadas o controversiales sin rechazos, manteniendo conversaciones multi-turno con contexto de hasta 32K tokens (o mas con configuraciones ampliadas).
- Analisis de imagenes en entornos locales: con el mmproj, el modelo puede describir imagenes, extraer texto (OCR) o responder preguntas visuales, todo ejecutandose en una GPU consumer de 24 GB o en hardware AMD con ROCmFPX.
- Generacion de documentacion tecnica: su capacidad de razonamiento y generacion de texto en ingles y chino permite redactar documentacion, guias y ejemplos de codigo de forma coherente.
- Prototipado rapido de aplicaciones LLM: al ser un GGUF compatible con llama.cpp, se puede desplegar con llama-server o Ollama para pruebas locales sin necesidad de infraestructura cloud.
- Investigacion en alineacion y seguridad: al ser una version abliterated, sirve como caso de estudio para analizar el impacto de la eliminacion de rechazos en el comportamiento del modelo, aunque su uso en produccion requiere precaucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento corresponden a velocidad de inferencia en AMD Ryzen AI Max+ 395 (Strix Halo, gfx1151) con 122 GB de memoria unificada, reportados por el autor de la cuantizacion:

| Tarea | ROCmFP4_FAST Decode | ROCmFP4_FAST Prefill | ROCmFP6 Decode | ROCmFP6 Prefill |
|---|---|---|---|---|
| Code gen #1 | 34.5 t/s | 42.0 | 25.7 t/s | 29.5 |
| Code gen #2 | 41.6 t/s | 61.5 | 29.3 t/s | 29.7 |
| Code gen #3 | 49.5 t/s | 61.5 | — | — |
| Math | 37.5 t/s | 97.4 | 22.9 t/s | 50.4 |
| JSON extraction | 44.7 t/s | 137.1 | — | — |
| Technical | 43.8 t/s | 5 | — | — |

Nota: la tabla esta incompleta en la informacion proporcionada (el ultimo valor de prefill para "Technical" se corta). Con MTP activado, el autor reporta ~42 t/s de decodificacion media en ROCmFP4_FAST, y ~27-28 t/s con Q4_K_M en llama.cpp estandar.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M-MTP pesa 16 GB, por lo que se recomienda al menos 24 GB de VRAM para cargar el modelo completo con `-ngl 99` (segun la pagina de Ollama, ideal para RTX 3090, RTX 4090, RTX 5090 o Apple Silicon con 36 GB+ de memoria unificada).
- El archivo ROCmFP4-FAST pesa 14 GB, lo que permite ejecutarlo en GPUs con 16 GB de VRAM, aunque con limitaciones de contexto.
- El archivo Q6_K-MTP pesa 21 GB, requiriendo 24 GB o mas de VRAM.
- GPUs recomendadas: NVIDIA RTX 3090/4090/5090, AMD Radeon RX 7900 XTX (con ROCmFPX), AMD Strix Halo (gfx1151) para maxima velocidad.
- Opciones de despliegue: llama.cpp (llama-server), Ollama, vLLM (para el modelo base, no para estos GGUF), y el fork ROCmFPX para AMD.
- Latencia y throughput: en Strix Halo, ~42 t/s de decodificacion con ROCmFP4_FAST y MTP; ~27-28 t/s con Q4_K_M en llama.cpp estandar. Sin MTP, la velocidad se reduce significativamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | no disponible | Apache 2.0 | safetensors | Modelo base multimodal, con censura |
| Qwen3.8-27B-heretic-ara (este repo) | 27B | no disponible | Apache 2.0 | GGUF | Abliterated, con MTP y vision |
| Qwen3.8-27B-Heretic-ARA-ModelOpt-NVFP4-GGUF (dawncr0w) | 27B | no disponible | Apache 2.0 | GGUF | Cuantizacion NVFP4 para NVIDIA, sin MTP ni vision |

No se dispone de datos de rendimiento comparativos entre estas variantes. La principal diferencia de este repo es la inclusion de MTP y mmproj, y la optimizacion para ROCmFPX en AMD.

## Limitaciones y advertencias

- Al ser una version abliterated, el modelo puede generar contenido ofensivo, ilegal o peligroso sin filtros. No es adecuado para aplicaciones donde se requiera seguridad y moderacion de contenido.
- Solo soporta ingles y chino; otros idiomas pueden tener un rendimiento degradado o no estar soportados.
- La longitud de contexto no esta documentada oficialmente; los ejemplos usan 32K, y el autor menciona 262K con TurboQuant, pero esto no ha sido verificado de forma independiente.
- El uso de MTP requiere una version reciente de llama.cpp (con soporte `--spec-type draft-mtp`); en ROCmFPX, MTP debe desactivarse para peticiones con imagenes, ya que provoca fallos.
- La cuantizacion Q4_K_M puede perder algo de calidad en tareas de razonamiento complejo comparada con Q6_K o el modelo original en FP16.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, etc.) para esta cuantizacion, por lo que su rendimiento real en tareas estandar es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas en este repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/allhailalona111/Qwen3.8-27B-heretic-ara-Q4_K_M-MTP-GGUF
- Modelo base (trohrbaugh): https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- Pagina en Ollama (jacokon): https://ollama.com/jacokon/qwen3.8-27b-heretic-ara
- Cuantizacion NVFP4 alternativa: https://huggingface.co/dawncr0w/Qwen3.8-27B-Heretic-ARA-ModelOpt-NVFP4-GGUF
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
