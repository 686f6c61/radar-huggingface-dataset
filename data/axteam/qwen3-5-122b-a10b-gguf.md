# axteam/Qwen3.5-122B-A10B-GGUF

## Resumen

`axteam/Qwen3.5-122B-A10B-GGUF` es una build de cuantización GGUF del modelo base `Qwen/Qwen3.5-122B-A10B`, publicada por el usuario axteam para su uso con llama.cpp, Ollama y LM Studio. Se trata de una cuantización post-entrenamiento (PTQ) de los pesos BF16 originales del modelo Qwen de tercera generación con arquitectura MoE (mezcla de expertos), que en el modelo base cuenta con 124.635.206.144 parámetros totales y, según el nombre del repositorio, 10B parámetros activos por token.

El interés de esta ficha radica en que permite ejecutar un modelo MoE de gran tamaño en hardware de consumo o en servidores modestos sin necesidad de infraestructura de entrenamiento: el archivo Q4_K_M ocupa 75,8 GB y el Q8_0 132,6 GB, ambos en formato GGUF de llama.cpp. El repositorio incluye únicamente el backbone de texto; el codificador de visión del modelo original no está incluido, por lo que estas cuantizaciones no admiten entrada de imágenes.

La licencia Apache-2.0 del modelo base se mantiene en esta derivada, lo que facilita su uso comercial. La información disponible no incluye datos sobre composición del dataset de entrenamiento, número de tokens, idiomas soportados ni resultados de benchmarks del modelo original, por lo que varios apartados de esta ficha se limitan a lo que el autor de la cuantización documenta explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (arquitectura `qwen35moe` en llama.cpp) |
| Parametros totales | 124.635.206.144 |
| Parametros activos | 10B (según denominación del modelo base) |
| Longitud de contexto | no disponible (configurable en llama.cpp con `-c`; el ejemplo de la model card usa 8192) |
| Tipos de cuantizacion | Q4_K_M (4-bit k-quant, 75,8 GB) y Q8_0 (8-bit, 132,6 GB) |
| Idiomas soportados | no disponible (la model card incluye ejemplos en coreano e inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con chat template embebido |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos (MoE), identificada en llama.cpp como `qwen35moe`. La cuantización incluida en este repositorio incorpora además la capa de predicción multi-token (MTP) del modelo original, soportada en llama.cpp a partir de la build b9180 (PR #22673). El repositorio no contiene el archivo `mmproj` (proyector de visión), por lo que el codificador visual del modelo base queda fuera de esta build.

El proceso de cuantización es PTQ sin reentrenamiento: los pesos BF16 se convierten con `convert_hf_to_gguf.py` y se cuantizan con `llama-quantize` en bloques con escalas por bloque y asignación mixta de bits (k-quants). No se dispone de información sobre el dataset de entrenamiento del modelo original, el número de tokens procesados, la composición de los datos ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones adicionales más allá de la propia arquitectura MoE y la capa MTP mencionada.

## Capacidades

- Generación de texto conversacional multi-turno, con chat template embebido en el archivo GGUF.
- Razonamiento y respuesta a preguntas; la model card verifica respuestas correctas a preguntas cortas (capital de Francia y de Corea).
- Capacidad multilingüe parcialmente evidenciada: los ejemplos de la model card incluyen coreano e inglés, y se reporta perplejidad sobre un muestreo de Wikipedia en coreano.
- Compatibilidad con API compatible con OpenAI mediante `llama-server`, lo que permite integrarlo en aplicaciones existentes.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades de visión: no disponibles en esta build (sin `mmproj`).
- Capacidades de audio: no disponibles.

## Casos de uso

- Despliegue de un modelo MoE de gran tamaño en servidores con varias GPU: el archivo Q8_0 se ha ejecutado dividido en dos NVIDIA B200 con todas las capas en GPU, lo que permite servir un modelo de 124B parámetros en infraestructura de dos aceleradores.
- Asistente conversacional autoalojado: con `llama-server -hf axteam/Qwen3.5-122B-A10B-GGUF:Q4_K_M -c 8192 --jinja` se obtiene una API compatible con OpenAI en el puerto 8080, adecuada para integrar en aplicaciones internas con requisitos de privacidad.
- Procesamiento de texto en coreano e inglés: la model card reporta perplejidades de 3,57 y 4,64 sobre muestras de Wikipedia en coreano e inglés respectivamente con Q4_K_M, lo que respalda su uso en tareas de generación y resumen en ambos idiomas.
- Evaluación comparativa de cuantizaciones: el repositorio publica mediciones de perplejidad (WikiText-2 y Wikipedia coreana) que permiten decidir entre Q4_K_M y Q8_0 según el equilibrio calidad/memoria requerido.
- Experimentación en investigación con modelos MoE de gran escala: al ser una build GGUF ejecutable en llama.cpp, facilita reproducir experimentos sin acceso a pesos BF16 ni a infraestructura de entrenamiento.
- Integración en flujos de trabajo de escritorio con LM Studio u Ollama: la model card documenta los comandos `ollama run hf.co/axteam/Qwen3.5-122B-A10B-GGUF:Q4_K_M` y la búsqueda del repositorio en el navegador de modelos de LM Studio, aunque el autor indica que no ha probado estas integraciones.
- Reducción de memoria de caché KV en producción: con `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` se reduce a la mitad el espacio de caché KV, lo que permite contextos más largos en el mismo hardware.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para el modelo base ni para las cuantizaciones. El único dato de rendimiento publicado son mediciones de perplejidad realizadas por el autor de la cuantización con llama.cpp b12005 (commit e0f142d, build CUDA) sobre NVIDIA B200, con 16 ventanas de 2.048 tokens del test de WikiText-2 y de una muestra de Wikipedia en coreano:

| Archivo | WikiText-2 PPL | Wikipedia coreana PPL | vs Q8_0 (EN / KO) |
|---|---|---|---|
| `Qwen3.5-122B-A10B-Q8_0.gguf` | 4,58 | 3,53 | referencia |
| `Qwen3.5-122B-A10B-Q4_K_M.gguf` | 4,64 | 3,57 | +1,5% / +1,0% |

El propio autor advierte que 16 ventanas por texto es una muestra pequeña y que las diferencias de pocos puntos porcentuales entre archivos están dentro del ruido de muestreo; una remedición con 64 ventanas movió tales diferencias hasta ~19 puntos. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada: el tamaño del archivo GGUF elegido más la caché KV correspondiente al contexto configurado con `-c`. Q4_K_M ocupa 75,8 GB y Q8_0 132,6 GB en disco; en ejecución hay que sumar la caché KV.
- GPU recomendadas: el autor ha validado la ejecución de Q8_0 dividido en dos NVIDIA B200 con todas las capas en GPU. Para Q4_K_M se requiere al menos ~76 GB de VRAM más caché KV, lo que implica GPUs de centro de datos (A100 80 GB, H100, B200) o configuraciones multi-GPU.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en GPUs consumer de 24-48 GB en configuración estándar; requeriría descarga parcial de capas a CPU con la consiguiente penalización de latencia.
- Opciones de despliegue: llama.cpp (build ≥ b9180; `-fa on` requiere ≥ b6325), `llama-server` con API compatible con OpenAI, `llama-cli`, Ollama (`ollama run hf.co/...`) y LM Studio. El autor indica que Ollama y LM Studio no han sido probados.
- Reducción de caché KV: `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` reduce a la mitad el espacio de caché KV.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base `Qwen/Qwen3.5-122B-A10B` sería la referencia natural (mismos pesos en BF16, sin cuantizar), pero no se han publicado en esta información sus especificaciones completas de contexto, idiomas ni benchmarks, por lo que la comparación cuantitativa no está disponible.

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| `axteam/Qwen3.5-122B-A10B-GGUF` (Q4_K_M) | 124.635.206.144 | 10B | no disponible | Apache-2.0 | GGUF |
| `Qwen/Qwen3.5-122B-A10B` (base) | 124.635.206.144 | 10B | no disponible | Apache-2.0 | safetensors (BF16) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La build no incluye el codificador de visión ni el archivo `mmproj`; no es posible el procesamiento de imágenes ni OCR con estos GGUF.
- El autor no documenta los idiomas soportados por el modelo base; la evidencia empírica se limita a inglés y coreano.
- No hay datos publicados sobre sesgos, alucinación o robustez del modelo base en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero el autor recuerda que los pesos y el tokenizer originales pertenecen al equipo de Qwen y que la licencia del modelo base debe respetarse.
- Las mediciones de perplejidad se basan en 16 ventanas por texto, una muestra pequeña según el propio autor; diferencias de pocos puntos porcentuales no deben interpretarse como diferencias significativas de calidad.
- Requiere llama.cpp ≥ b9180 por la capa MTP incluida; versiones anteriores no cargarán correctamente estos archivos.
- El despliegue en Ollama y LM Studio no ha sido verificado por el autor.
- El tamaño del modelo (75,8 GB en Q4_K_M) impide su ejecución en GPUs de consumo sin descarga parcial a CPU, con la penalización de latencia asociada.
- El contexto máximo no está documentado en esta ficha; el ejemplo de la model card usa 8192 tokens, pero no se confirma que sea el límite del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.5-122B-A10B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B/blob/main/LICENSE
- llama.cpp (repositorio): https://github.com/ggml-org/llama.cpp
- PR de soporte MTP en llama.cpp (#22673): no disponible como enlace directo en la información proporcionada
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
