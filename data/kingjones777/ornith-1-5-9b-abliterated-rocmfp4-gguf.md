# kingjones777/Ornith-1.5-9B-Abliterated-ROCmFP4-GGUF

## Resumen

Ornith-1.5-9B-Abliterated es una variante del modelo Ornith-1.5-9B de ornith-ai (DeepReinforce), un modelo denso de 9.000 millones de parametros orientado a tareas agénticas y generación de código, entrenado con un bucle de auto-mejora que combina propuesta de tareas, generación de scaffolds y rollouts para aprendizaje por refuerzo. La version abliterada, publicada por PocketAI Model Lab, elimina los rechazos de seguridad del modelo original para permitir un comportamiento menos restrictivo en entornos de investigacion y agentes.

Este repositorio concreto, creado por kingjones777, anade una escalera de cuantizaciones ROCmFP4/ROCmFPX especificamente compiladas y medidas para la GPU integrada Radeon 8060S del AMD Ryzen AI Max+ 395 (arquitectura gfx1151, tambien conocida como Strix Halo). La particularidad es que cada archivo funciona tanto con el backend HIP (ROCm) como con Vulkan desde un unico binario, seleccionable en tiempo de ejecucion mediante la opcion `-dev`. El modelo es multimodal (image-text-to-text) e incluye un proyector de vision en F16 que funciona con todas las cuantizaciones.

La relevancia actual radica en que demuestra la viabilidad de ejecutar modelos de 9B con razonamiento y vision en hardware integrado de AMD de alta gama, con rendimientos de decodificacion superiores a 35 tokens por segundo en las cuantizaciones de 4 bits, y con una calidad medida por perplexity que en algunos casos supera a la cuantizacion Q8 de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (configuracion medida; maximo oficial no disponible) |
| Tipos de cuantizacion | ROCmFP4 (Q4_0) y ROCmFPX (Q8_0, Q6_0) en seis variantes: STRIX_LEAN, FAST, COHERENT, AGENT, referencia y Q6 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (con tipos tensoriales ROCmFP4/ROCmFPX, numeros 100-119) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer denso de 9B parametros, disenado para tareas agénticas y generacion de codigo. Segun la informacion publicada por ornith-ai, la familia Ornith-1.5 se entrena con un bucle de auto-mejora de extremo a extremo: el modelo propone nuevas tareas, genera scaffolds especificos para cada tarea y produce rollouts de soluciones que se utilizan para aprendizaje por refuerzo. No se han publicado detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO.

La variante abliterada, realizada por PocketAI Model Lab, elimina los mecanismos de rechazo del modelo original. El presente repositorio anade la cuantizacion ROCmFP4/ROCmFPX, un formato de compresion desarrollado para GPUs AMD que utiliza tipos tensoriales GGML numerados del 100 al 119, no soportados por llama.cpp estandar. El modelo incluye un proyector de vision en F16 (0,86 GiB) que permite procesar imagenes junto con texto.

## Capacidades

- Generacion de texto y razonamiento multi-paso: el modelo emite un bloque de razonamiento antes de la respuesta final, lo que requiere presupuestos de tokens elevados (se midieron entre 301 y 708 tokens de completacion para una peticion corta de escritura de funcion).
- Generacion de codigo: orientado a tareas de programacion, con soporte para agentes y tool calling (no se detalla la implementacion exacta, pero es un modelo de la familia agéntica Ornith).
- Capacidades multimodales: procesa imagenes mediante el proyector de vision F16 incluido, permitiendo entradas image-text-to-text.
- Ejecucion dual-backend: cada archivo GGUF funciona tanto con HIP (ROCm) como con Vulkan, seleccionable en tiempo de ejecucion sin recompilar.
- Auto-mejora: el modelo base fue entrenado con un bucle de auto-mejora que le permite proponer tareas y generar scaffolds, aunque esta capacidad no se detalla en la version cuantizada.

## Casos de uso

- Agentes de codigo en entornos de desarrollo: el modelo puede integrarse en pipelines de CI/CD para generar, revisar o completar codigo, aprovechando su capacidad de razonamiento previo y su orientacion a tareas agénticas. Su licencia MIT permite uso comercial sin restricciones.
- Asistentes de programacion locales en portatiles con Ryzen AI Max: gracias a las cuantizaciones ROCmFP4, se puede ejecutar en equipos con la GPU integrada Radeon 8060S sin necesidad de GPU discreta, con velocidades superiores a 35 tok/s en decodificacion.
- Analisis de imagenes con contexto largo: el proyector de vision F16 permite enviar capturas de pantalla, diagramas o documentacion visual junto con prompts de codigo, util para depuracion visual o generacion de codigo a partir de mockups.
- Investigacion en alineacion y seguridad: la version abliterada elimina los rechazos, lo que permite estudiar el comportamiento del modelo sin restricciones de seguridad, aunque con las advertencias eticas correspondientes.
- Despliegue en entornos con restriccion de VRAM: las cuantizaciones Q4_0 ocupan entre 4,72 y 5,19 GiB, lo que permite ejecutar el modelo en GPUs integradas con memoria compartida o en tarjetas de gama media con 8 GB de VRAM.
- Servidores de inferencia locales con llama.cpp: el repositorio incluye comandos de `llama-server` con configuracion optimizada (contexto 32K, cache q8_0, prefill de 8192 tokens) para servir el modelo via HTTP en redes locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos de rendimiento son los medidos por el autor del repositorio en un Ryzen AI Max+ 395 (Radeon 8060S), que se resumen a continuacion.

Perplexity en wikitext-2 (100 chunks, menor es mejor):

| Cuantizacion | Tamano | Perplexity |
|---|---|---|
| Q4_0_ROCMFP4_STRIX_LEAN | 4,89 GiB | 9,4313 |
| Q4_0_ROCMFP4_FAST | 4,72 GiB | 9,4571 |
| Q4_0_ROCMFP4_COHERENT | 5,19 GiB | 9,4576 |
| Q8_0_ROCMFPX_AGENT | 8,77 GiB | 9,4163 |
| Q8_0_ROCMFPX | 8,64 GiB | 9,4559 |
| Q6_0_ROCMFPX_AGENT | 7,88 GiB | 9,5850 |

Velocidad de decodificacion (tok/s, mediana de 2 repeticiones, contexto 32K, un solo usuario):

| Cuantizacion | Backend | code | prose | reason | json | prefill (code) |
|---|---|---|---|---|---|---|
| COHERENT | ROCm0 | 35,22 | 34,78 | 34,69 | 35,17 | 407 |
| COHERENT | Vulkan0 | 34,57 | 34,58 | 34,62 | 34,58 | 367 |
| FAST | ROCm0 | 35,52 | 35,53 | 35,44 | 35,98 | 443 |
| FAST | Vulkan0 | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor reporta que los backends ROCm y Vulkan estan dentro de un 1 % de diferencia en las cuantizaciones de 4 bits, y que la cuantizacion Q6 esta estrictamente dominada por las de 4 bits en velocidad, tamano y perplexity. Ademas, el modelo base Ornith-1.5-9B alcanza, segun datos del fabricante (promedio de cinco ejecuciones), 47,0 en Terminal-Bench 2.1 y 70,6 en otro benchmark no especificado.

## Requisitos de hardware

- VRAM estimada: entre 4,72 GiB (Q4_0_FAST) y 8,77 GiB (Q8_0_AGENT) para el modelo, mas 0,86 GiB del proyector de vision F16 si se usa multimodal.
- GPU recomendada: AMD Radeon 8060S integrada en Ryzen AI Max+ 395 (gfx1151), que es el hardware de referencia del autor. Tambien deberia funcionar en otras GPUs AMD con soporte ROCm o Vulkan, aunque no se ha verificado.
- Compatibilidad con GPU de consumo: cabe en GPUs integradas con memoria compartida (como la Radeon 8060S) y en tarjetas discretas con 8 GB o mas de VRAM, siempre que el backend ROCm o Vulkan este disponible.
- Opciones de despliegue: llama.cpp con una build personalizada que incluya los tipos ROCmFPX (GGML_HIP=ON y GGML_VULKAN=ON, con AMDGPU_TARGETS=gfx1151). No es compatible con llama.cpp estandar ni con Ollama, vLLM o TGI sin modificaciones.
- Latencia y throughput: decodificacion de 34-36 tok/s en las cuantizaciones de 4 bits, prefill de 367-443 tok/s (medido en el hardware de referencia). La cuantizacion Q6 baja a 24,4 tok/s en ROCm y 21,1 tok/s en Vulkan.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizaciones | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B (base) | 8,95 B | no disponible | MIT | no disponible | Modelo original sin abliterar, con entrenamiento de auto-mejora |
| Ornith-1.5-9B-Abliterated (PocketAiHub) | 8,95 B | no disponible | MIT | GGUF estandar | Version abliterada sin cuantizaciones ROCmFPX |
| Ornith-1.5-35B (MoE) | 35 B (MoE) | no disponible | MIT | no disponible | Hermano mayor, con diferencias de rendimiento entre backends (el backend era ~10x mas importante que el tier) |
| Ornith-1.5-9B-Mobile | 9 B | no disponible | MIT | no disponible | Version cuantizada para iPhone y Android, segun llm-releases.com |

No se dispone de datos de benchmarks comparativos con otros modelos de 9B fuera de la familia Ornith.

## Limitaciones y advertencias

- Requiere una build personalizada de llama.cpp: los tipos tensoriales ROCmFP4/ROCmFPX (numeros 100-119) no son reconocidos por llama.cpp estandar, que solo soporta hasta el tipo 43. Sin la compilacion con `-DGGML_HIP=ON -DGGML_VULKAN=ON -DAMDGPU_TARGETS=gfx1151`, los archivos no cargan en ningun backend.
- El modelo razona antes de responder: si el presupuesto de `max_tokens` se agota durante el bloque de razonamiento, la API devuelve un HTTP 200 con el campo `content` vacio, lo que puede interpretarse como un modelo roto. Se recomienda un presupuesto minimo de 1024 tokens.
- Riesgo de bucles de repeticion: con el control de repeticion desactivado, el modelo puede caer en bucles de candidatos repetidos en turnos agénticos largos. Se recomienda usar `--repeat-penalty 1.05 --repeat-last-n 256`.
- La cuantizacion Q6 esta estrictamente dominada: es mas lenta, mas grande y con peor perplexity que las de 4 bits en este modelo. No se recomienda su uso.
- Version abliterada: al eliminar los rechazos de seguridad, el modelo puede generar contenido que el modelo original rechazaria. Esto implica riesgos de sesgo, alucinacion y contenido inapropiado, especialmente en produccion.
- Datos de entrenamiento no publicados: no se conocen la composicion del dataset, el numero de tokens ni los detalles del proceso de RL, lo que dificulta evaluar sesgos y limitaciones de idioma.
- Soporte de idiomas no documentado: no se ha especificado que idiomas soporta el modelo, aunque al estar entrenado principalmente para codigo y tareas agénticas, es probable que el ingles domine.
- Hardware especifico: las mediciones se realizaron exclusivamente en Ryzen AI Max+ 395 (gfx1151). El rendimiento en otras GPUs AMD o en hardware NVIDIA no esta verificado.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/kingjones777/Ornith-1.5-9B-Abliterated-ROCmFP4-GGUF
- Modelo base abliterado (PocketAI Model Lab): https://huggingface.co/PocketAiHub/Ornith-1.5-9B-Abliterated-GGUF
- Modelo original (ornith-ai): https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Repositorio de GitHub de la familia Ornith: https://github.com/ornith-ai/Ornith-1
- Pagina en Ollama: https://ollama.com/library/ornith-1.5
- Ficha en LLM Releases: https://www.llm-releases.com/models/ornith-1-5-9b
- Repositorio hermano con cuantizacion ROCmFPX AGENT: https://huggingface.co/kingjones777/Ornith-1.5-9B-ROCmFPX-AGENT-GGUF
