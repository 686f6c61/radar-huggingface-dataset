# Harsha001/NVIDIA-Nemotron-3.5-Bolt-E4B-ROCmFPX

## Resumen

Este repositorio contiene una cuantización comunitaria en formato GGUF del modelo `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16`, un modelo de lenguaje pequeno de NVIDIA obtenido mediante post-entrenamiento a partir de Google Gemma 4 E4B. El checkpoint original tiene 7.518.069.290 parámetros en safetensors (unos 7,52 mil millones) y está pensado, según su autor, para agentes conversacionales con alta inteligencia por GB y para posteriores procesos de personalización y post-entrenamiento. NVIDIA lo publica como modelo de razonamiento y chat de propósito general, y la versión BF16 es el checkpoint de precisión completa.

La aportación de este repositorio, firmado por el usuario Harsha001, no es el modelo en sí sino el método de compresión: usa ROCmFPX, un fork de llama.cpp con tipos de peso de bajo bit específicos para GPUs AMD (Vulkan y HIP/ROCm), e incluye una matriz de importancia (imatrix) calculada sobre texto de calibración general. Se distribuyen cuatro archivos, desde 8 bits (7,80 GB) hasta un 4 bits orientado a velocidad (4,05 GB), con el Q6_0 marcado por el autor como opción recomendada (6,21 GB).

Es relevante ahora porque ejemplifica la llegada de cuantizaciones de bajo bit optimizadas para hardware AMD de consumo, en concreto APUs Strix Halo (gfx1151) y GPUs RDNA3 como la RX 7900 (gfx1100), un nicho donde el ecosistema GGUF todavía depende mayoritariamente de kernels CUDA. Conviene subrayar que no es una release oficial de NVIDIA, que los archivos requieren un fork concreto de llama.cpp y que el propio autor advierte que no se han probado todavía en hardware AMD real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Gemma 4 (arquitectura Gemma 4 E4B, según NVIDIA); el autor de la cuantización no detalla el desglose interno |
| Parametros totales | 7.518.069.290 (7,52 B) en el checkpoint BF16 de referencia |
| Parametros activos | No disponible (el autor no publica desglose de parámetros activos; la nomenclatura "E4B" de la familia Gemma sugiere parámetros efectivos, pero no se confirma en la información disponible) |
| Longitud de contexto | No especificada por el autor; el comando de ejemplo emplea 32.768 tokens (`-c 32768`) |
| Tipos de cuantizacion | Q8_0_ROCMFPX (8 bits), Q6_0_ROCMFPX (6 bits, recomendado), Q4_0_ROCMFP4_STRIX (4 bits, receta ajustada a gfx1151), Q4_0_ROCMFP4_FAST (4 bits, una escala por bloque); Q3_0_ROCMFPX existe pero no se publica |
| Idiomas soportados | No disponible |
| Licencia | OpenMDW-1.1 (`license: other`, `license_name: openmdw-1.1`), la misma del modelo base |
| Formato de pesos | GGUF (librería `gguf`); el checkpoint base está en BF16 safetensors |
| Tamano del repo | 23,1 GB (incluye los cuatro archivos publicados) |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 (relación: quantized) |
| Herramienta de cuantizacion | Fork ROCmFPX de llama.cpp (HarshaVardhan3002), commit `b130d4995` o posterior |
| Entradas | Solo texto en estos GGUF; la visión requiere un `mmproj-*.gguf` aparte |

## Arquitectura y entrenamiento

El modelo base conserva la arquitectura de Gemma 4 E4B: NVIDIA no rediseña el transformer, sino que refresca los pesos y la plantilla de chat mediante post-entrenamiento sobre el checkpoint `Gemma-4-E4B-it`. Según la documentación de NeMo AutoModel, el resultado sigue siendo un modelo de lenguaje y visión de pequeño tamaño, con 7,52 mil millones de parámetros en el checkpoint BF16 y orientado a razonamiento y conversación. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se especifica si el bloque es denso o si emplea mecanismos de parámetros efectivos propios de la familia Gemma.

El trabajo de este repositorio es exclusivamente de compresión. El proceso documentado por el autor tiene cuatro pasos: conversión del BF16 a GGUF con el `convert_hf_to_gguf.py` del fork; cálculo de una matriz de importancia a partir del archivo BF16 sobre el corpus de calibración `calibration_datav3` en fragmentos de 512 tokens; cuantización con `llama-quantize --imatrix` en una ejecución independiente por tipo; y evaluación de calidad. El autor indica que no fueron necesarias escalas por tensor porque los pesos del modelo son suficientemente grandes para las escalas de bloque de ROCmFPX. La innovación técnica, por tanto, está en los tipos de peso de bajo bit del fork ROCmFPX y en su implementación para Vulkan y HIP/ROCm, no en el modelo.

## Capacidades

- Generación de texto conversacional multi-turno: el modelo base se presenta como modelo de chat y razonamiento de propósito general.
- Razonamiento y respuesta a preguntas: la ficha de NVIDIA lo describe explícitamente como modelo de razonamiento y chat.
- Agentes conversacionales locales: la release de NVIDIA está optimizada para "inteligencia por GB" en agentes conversacionales que corren en aproximadamente 4 GB de VRAM.
- Procesamiento de imágenes: el modelo base es un modelo de lenguaje y visión; en este repositorio los GGUF son solo de texto y la visión requiere el proyector `mmproj-*.gguf` de `unsloth/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF`, que el autor no ha probado junto a estos archivos.
- Plantilla de chat actualizada por NVIDIA, utilizable con `--jinja` en `llama-server`.
- Tool calling / function calling: no documentado en la información disponible para este repositorio.
- Capacidades multilingües: no disponibles; el autor no declara lista de idiomas.
- Modo "thinking" explícito, audio u otras capacidades especiales: no documentadas en la información disponible.

## Casos de uso

- Agente conversacional local en APU Strix Halo: con el archivo Q6_0 (6,21 GB) y `llama-server -ngl 999 -fa on`, se puede levantar un asistente de chat en una máquina con memoria unificada y GPU integrada gfx1151, sin depender de CUDA. Es el escenario para el que el autor ajustó la receta Q4_0_ROCMFP4_STRIX.
- Despliegue en GPU AMD de consumo: en una RX 7900 (gfx1100), el Q4_0_ROCMFP4_FAST (4,05 GB) deja margen de VRAM para caché KV en contextos de 32.768 tokens, lo que permite mantener conversaciones largas en un equipo de escritorio.
- Evaluación comparativa de cuantizaciones: los cuatro archivos con KLD y "same top" medidos permiten estudiar la degradación de un modelo de 7,5 B al bajar de 8 a 4 bits con tipos de peso no estándar, usando WikiText-2 como referencia reproducible.
- Prototipado de asistentes con contexto largo: con `-c 32768` se pueden procesar documentos o hilos de conversación extensos en local, útil para resumir actas, correos o transcripciones antes de enviar nada a la nube.
- Base para post-entrenamiento o fine-tuning posterior: el checkpoint BF16 del que deriva está pensado por NVIDIA para personalización y evaluación; estas cuantizaciones sirven para validar el comportamiento del modelo ajustado antes de compilar versiones definitivas.
- Inferencia en entornos sin NVIDIA: equipos de investigación con estaciones AMD pueden ejecutar el modelo vía Vulkan sin reescribir el pipeline, algo que con cuantizaciones estándar de llama.cpp resulta menos directo en el ecosistema ROCmFPX.
- Pruebas de regresión de kernels: al ser archivos que solo cargan con el fork en el commit `b130d4995`, son útiles como caso de test para validar la implementación de tipos ROCmFP4/ROCmFPX en nuevas versiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica métricas de fidelidad de la cuantización frente al BF16, medidas sobre WikiText-2 (test, 40 fragmentos de 512 tokens). KLD es la divergencia KL media de la distribución del siguiente token respecto a BF16 (menor es mejor); "same top" es la frecuencia con la que la cuantización elige el mismo siguiente token.

| Archivo | Tamano | KLD | Same top | Bits |
|---|---:|---:|---:|---|
| `NVIDIA-Nemotron-3.5-Bolt-E4B-Q8_0_ROCMFPX.gguf` | 7,80 GB | 0,0209 | 95,12 % | 8 |
| `NVIDIA-Nemotron-3.5-Bolt-E4B-Q6_0_ROCMFPX.gguf` | 6,21 GB | 0,0348 | 93,10 % | 6 (recomendado) |
| `NVIDIA-Nemotron-3.5-Bolt-E4B-Q4_0_ROCMFP4_STRIX.gguf` | 5,06 GB | 0,2557 | 81,17 % | 4 (ajustado a gfx1151) |
| `NVIDIA-Nemotron-3.5-Bolt-E4B-Q4_0_ROCMFP4_FAST.gguf` | 4,05 GB | 0,2783 | 80,25 % | 4 (una escala por bloque) |
| `Q3_0_ROCMFPX` (no publicado) | 4,21 GB | 0,3582 | No disponible | 3 |

Metodología declarada por el autor: la referencia BF16 se ejecutó en una GPU NVIDIA con kernels estándar; cada cuantización se decodificó con el código de CPU del fork a F16 y se puntuó en la misma GPU, de modo que las cifras miden únicamente los pesos. Los kernels de GPU AMD realizan la misma aritmética en distinto orden, por lo que los resultados en hardware AMD pueden diferir ligeramente. El autor señala que en un modelo de este tamaño el salto de 6 a 4 bits cuesta mucha más calidad que el de 8 a 6, y que los cuatro archivos publicados responden correctamente a una pregunta de chat sencilla.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir del tamaño de archivo más overhead de contexto y activaciones; el autor no publica cifras de VRAM): Q8_0 en torno a 9-10 GB; Q6_0 en torno a 7,5-8,5 GB; Q4_0_ROCMFP4_STRIX en torno a 6-7 GB; Q4_0_ROCMFP4_FAST en torno a 5-6 GB. A 32.768 tokens de contexto hay que sumar la caché KV correspondiente.
- GPU objetivo: AMD con soporte Vulkan o HIP/ROCm. El autor compila con `-DGGML_HIP=ON -DAMDGPU_TARGETS=gfx1151` para Strix Halo y `gfx1100` para RX 7900.
- Cabe en hardware de consumo: sí, en APUs Strix Halo (memoria unificada) y en GPUs RDNA3 de gama alta como la RX 7900; el objetivo declarado del modelo base es funcionar en torno a 4 GB de VRAM, aunque la cuantización más pequena de este repo ocupa 4,05 GB solo en pesos.
- Requisito crítico de software: fork ROCmFPX de HarshaVardhan3002 en el commit `b130d4995` o posterior. llama.cpp estándar, LM Studio, Ollama y otras builds de ROCmFPX pueden no cargar estos archivos.
- Despliegue: `llama-server` del fork con `-ngl 999 -fa on --jinja`. Ejemplo del autor: `cmake -B build -DGGML_VULKAN=ON` (o HIP) y `cmake --build build --target llama-server -j`.
- Visión: usar `--mmproj` con el proyector de `unsloth/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF`; combinación no probada por el autor.
- Estado de validación: el autor declara que estos archivos no se han probado todavía en hardware AMD.
- Latencia y throughput: no disponibles; no se publican tokens por segundo ni tiempos de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y tipos | Tamano tipico | Licencia | Notas |
|---|---|---|---|---|---|---|
| Este repo (ROCmFPX GGUF) | 7,52 B | No especificado; ejemplo a 32.768 | GGUF con tipos ROCmFPX/ROCmFP4 | 4,05-7,80 GB | OpenMDW-1.1 | Requiere fork concreto; no probado en AMD; solo texto |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 (base) | 7,52 B | No disponible en la información | BF16 safetensors | Referencia de precisión completa | OpenMDW-1.1 | Release oficial; pensado para personalización y post-entrenamiento más que para inferencia directa |
| unsloth/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF | 7,52 B (heredados) | No disponible | GGUF estándar, incluye `mmproj-*.gguf` | No disponible | OpenMDW-1.1 | Compatible con llama.cpp estándar y con visión; tipos y métricas de calidad no disponibles en la información consultada |
| Alternativas de ~7-8 B con licencia permisiva (p. ej. familias Llama o Qwen) | ~7-8 B | Habitualmente 32k-128k | GGUF, safetensors | Variable | Variables | No se dispone de datos comparativos verificados en la información proporcionada; no se incluyen cifras para no inventarlas |

## Limitaciones y advertencias

- Cuantización no oficial: no es una release de NVIDIA. El autor lo indica expresamente y atribuye todo el crédito del modelo a sus creadores.
- Sin validación en AMD: "These files have not been tested on AMD hardware yet". Las métricas de calidad se obtuvieron decodificando en CPU a F16 y puntuando en una GPU NVIDIA, no ejecutando los kernels AMD.
- Dependencia de un fork y de un commit concreto: sin ROCmFPX `b130d4995` o posterior, los archivos pueden no cargar en llama.cpp, LM Studio, Ollama u otras builds.
- Pérdida de calidad medible: el Q4_0_ROCMFP4_FAST conserva el siguiente token del BF16 solo el 80,25 % de las veces (KLD 0,2783), frente al 95,12 % del Q8_0. Para tareas sensibles a la fidelidad de la distribución, el autor recomienda Q6_0.
- Solo texto en estos GGUF: no incluyen proyector visual; la multimodalidad requiere un `mmproj` externo y no está probada con estos archivos.
- Idiomas no declarados: no hay lista de idiomas soportados, por lo que no se puede garantizar calidad multilingual en producción.
- Tool calling y modo de razonamiento explícito no documentados: no hay evidencia en la información disponible de soporte verificado de function calling ni de un modo "thinking" separado.
- Riesgo de alucinación: inherente a un modelo de 7,5 B post-entrenado para conversación; no se publican evaluaciones de veracidad ni de sesgos.
- Sesgos: no se documentan en la información disponible; al derivar de Gemma 4 E4B, hereda los sesgos del modelo original, que tampoco se detallan aquí.
- Licencia OpenMDW-1.1: es una licencia de tipo "other"; antes de uso comercial hay que revisar sus términos en el enlace oficial y las condiciones del modelo base, que la propia model card remite.
- Adopción nula por ahora: 0 descargas y 0 likes en el momento de la consulta, con creación y última actualización el 24 de octubre de 2026; no hay evidencia de uso en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Harsha001/NVIDIA-Nemotron-3.5-Bolt-E4B-ROCmFPX
- Discusiones del repositorio: https://huggingface.co/Harsha001/NVIDIA-Nemotron-3.5-Bolt-E4B-ROCmFPX/discussions
- Modelo base (BF16): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- GGUF de unsloth con proyector visual: https://huggingface.co/unsloth/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF
- Fork ROCmFPX usado para cuantizar: https://github.com/HarshaVardhan3002/ROCmFPX
- Repositorio ROCmFPX original referenciado: https://github.com/charlie12345/ROCmFPX
- Página de investigación de NVIDIA: https://research.nvidia.com/labs/nemotron/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB/
- Ficha en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-bolt-e4b/modelcard
- Documentación de NeMo AutoModel: https://docs.nvidia.com/nemo/automodel/model-coverage/vision-language-models/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-BF16
- Cobertura en MarkTechPost: https://www.marktechpost.com/2026/10/23/nvidia-nemotron-3-5-bolt-e4b-4gb/
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
