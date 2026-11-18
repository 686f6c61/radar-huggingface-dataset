# kabcpc/Ternary-Flint-40B-GGUF

## Resumen

Ternary-Flint-40B-GGUF es una cuantización experimental de un modelo de lenguaje de tipo mezcla de expertos (MoE) de aproximadamente 39.800 millones de parámetros totales, derivada del modelo base `dima6312/Flint-40B-A2.5B-abliterated`. La publica el usuario kabcpc bajo el paraguas de un ecosistema propio denominado Kenzan, orientado a ejecutar modelos MoE grandes en equipos Apple Silicon con memoria unificada limitada (16 GB). El problema que aborda es claro: hacer viable un modelo de 40B en hardware de consumo mediante cuantización ternaria extrema.

La innovación central es una combinación de cuantización ternaria (`PTQ1_0`, aproximadamente 1,75 bits por peso) con bloques `Q4_0` y estabilización de fase mediante transformada de Hadamard (`FWHT_512`), empaquetada en un fichero GGUF de 9,8 GB denominado NonaCore. Esto rebaja drásticamente los requisitos de memoria frente a los 78 GB que ocupa el repositorio completo. El modelo se distribuye con un runtime específico parcheado (`PrismML-Eng/llama.cpp`) con kernels Metal para macOS ARM64.

Es relevante ahora porque demuestra una vía práctica de inferencia local de MoE de gran tamaño en portátiles y Mac mini, aunque a costa de depender de un runtime no estándar, de una licencia restrictiva ("other") y de una calidad que el autor no documenta con benchmarks. El modelo base es una variante "abliterated", es decir, con los mecanismos de rechazo atenuados, lo que condiciona su uso responsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos); detalles de capas y expertos no disponibles |
| Parametros totales | 39.785.287.456 (~39,8B) |
| Parametros activos | ~2,5B (según el nombre del modelo base, A2.5B); no confirmado en la model card |
| Longitud de contexto | 262.000 tokens (según la release Hepta48Up del mismo ecosistema); no confirmado para el fichero NonaCore |
| Tipos de cuantizacion | Ternaria `PTQ1_0` (~1,75 bpw) combinada con `Q4_0` y `FWHT_512`; fichero GGUF de 9,8 GB |
| Idiomas soportados | Inglés (en), ruso (ru), chino (zh) |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | GGUF (con runtime Metal parcheado para macOS ARM64) |

## Arquitectura y entrenamiento

El modelo es un MoE de ~39,8B parámetros totales con aproximadamente 2,5B activos por token, según la nomenclatura del modelo base. No se dispone de información sobre el número de capas, el número de expertos, la dimensión oculta ni la estrategia de enrutamiento. Tampoco se documentan los datos de entrenamiento del modelo original: número de tokens, composición del corpus, ni si hubo fases de RLHF o DPO. El calificativo "abliterated" indica que el modelo base fue modificado para reducir las respuestas de rechazo, una técnica de edición de pesos que no equivale a un reentrenamiento completo.

La contribución técnica de esta ficha no está en el entrenamiento sino en la compresión. La cuantización ternaria `PTQ1_0` reduce los pesos a tres niveles, y la estabilización de fase mediante transformada de Hadamard de bloque (`FWHT_512`) mitiga la degradación que la cuantización extrema introduce en las activaciones. El esquema se describe como "9-pin NonaCore", una mezcla de capas en ternario y en `Q4_0`. El resultado es un GGUF de 9,8 GB que, según el autor, está ajustado para 16 GB de memoria unificada en Apple Silicon. No se publican métricas de perplejidad ni de retención de calidad para esta variante concreta.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a diálogo.
- Razonamiento y respuesta a instrucciones heredados del modelo base Flint-40B.
- Capacidad multilingüe limitada a inglés, ruso y chino.
- Ejecución local en Apple Silicon mediante Metal con el runtime parcheado incluido.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso explícito.
- No se documenta capacidad de visión, audio ni modo "thinking".
- Perfil "abliterated": menor tendencia a rechazar peticiones, sin que se detallen los mecanismos.

## Casos de uso

- Inferencia local en Mac con 16 GB de memoria unificada: el fichero de 9,8 GB permite cargar un MoE de 40B en un Mac mini o MacBook, algo inviable con cuantizaciones convencionales de 4 bits.
- Prototipado de asistentes conversacionales en escritorio: el modelo puede gestionar diálogos multi-turno en inglés, ruso o chino sin conexión a la nube, útil para demos y pruebas de concepto.
- Investigación sobre cuantización extrema: sirve como caso de estudio para medir la degradación de un MoE al aplicar ternario con estabilización de Hadamard, comparándolo con el modelo base en fp16.
- Evaluación de runtimes alternativos: permite probar el fork `PrismML-Eng/llama.cpp` y sus kernels Metal frente a llama.cpp estándar en tareas de generación.
- Generación de texto offline en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, los datos no salen del equipo, adecuado para borradores y resúmenes de documentos sensibles.
- Docencia y formación técnica: útil para explicar en un aula cómo funcionan los MoE, la cuantización ternaria y el empaquetado GGUF con un ejemplo ejecutable en hardware asequible.
- Experimentación con modelos sin filtros de rechazo: para investigadores que estudian el comportamiento de modelos "abliterated", siempre con las salvaguardas y la supervisión adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni métricas de perplejidad para esta variante. La única referencia numérica del ecosistema es una perplejidad de 10,61 atribuida a la release posterior Hepta48Up, que no corresponde a este fichero.

## Requisitos de hardware

- VRAM o memoria unificada estimada: ~10 GB para cargar el GGUF NonaCore de 9,8 GB, más el espacio de contexto y caché KV; el autor lo orienta a equipos de 16 GB.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max) con Metal; el runtime incluido es un binario macOS ARM64.
- ¿Cabe en GPU de consumo? Sí, en Apple Silicon de 16 GB o más. No se documenta soporte para GPU NVIDIA ni AMD con este esquema ternario.
- Opciones de despliegue: exclusivamente el fork `PrismML-Eng/llama.cpp` con kernels `PTQ1_0` y `FWHT_512` para Metal; se incluye `llama-server`, `libllama` y `ggml-metal` precompilados en `bin/llama-flint-metal-macos-arm64.tar.gz`. No es compatible con llama.cpp estándar, Ollama ni LM Studio según la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización / tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Flint-40B-GGUF (NonaCore) | ~39,8B totales, ~2,5B activos | 262k (según release del ecosistema) | Ternaria `PTQ1_0` + `Q4_0`, 9,8 GB | other | Hugging Face, runtime parcheado |
| dima6312/Flint-40B-A2.5B-abliterated (base) | ~39,8B totales | no disponible | Pesos originales (repo de 78 GB) | no disponible | Hugging Face |
| kabcnd/Kenzan-Flint-40B-Hepta48Up-GGUF | ~40B MoE | 262k | 7-pin, 9,77 GiB, PPL 10,61 | no disponible | Hugging Face |
| kabcnd/Kenzan-Qwen3.8-27B-PinGrid-GGUF | ~27B | no disponible | GGUF compatible con stock | no disponible | Hugging Face, LM Studio, Ollama |

La comparativa se limita al ecosistema del propio autor, ya que no se dispone de datos de rendimiento que permitan contrastar con MoE de tamaño similar de otros desarrolladores.

## Limitaciones y advertencias

- La cuantización ternaria a ~1,75 bits introduce degradación de calidad no cuantificada; no hay benchmarks que permitan estimar la pérdida frente al modelo base.
- Dependencia de un runtime parcheado y no estándar: sin el fork de `PrismML-Eng/llama.cpp` con kernels Metal, el fichero no es utilizable en llama.cpp estándar, Ollama ni LM Studio.
- Plataforma restringida a macOS ARM64 con Metal; no hay soporte documentado para Linux, Windows ni GPU NVIDIA.
- El modelo base es "abliterated", lo que reduce los rechazos ante peticiones sensibles y aumenta el riesgo de generar contenido inapropiado o dañino sin salvaguardas.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad factual.
- Cobertura lingüística limitada a inglés, ruso y chino; el castellano no está entre los idiomas declarados.
- Licencia "other" sin texto detallado: las condiciones de uso comercial no están claras y deben verificarse antes de cualquier despliegue en producción.
- El contexto de 262k procede de otra release del ecosistema y no está confirmado para este fichero; asumir un contexto menor es lo prudente.
- El repositorio ocupa 78 GB en total, aunque el fichero de inferencia sea de 9,8 GB.
- La model card incluye enlaces de donación y promoción de otras releases; no constituyen documentación técnica verificable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kabcpc/Ternary-Flint-40B-GGUF
- Modelo base: https://huggingface.co/dima6312/Flint-40B-A2.5B-abliterated
- Release posterior del ecosistema: https://huggingface.co/kabcnd/Kenzan-Flint-40B-Hepta48Up-GGUF
- Colección Kenzan para Apple Silicon: https://huggingface.co/kabcnd
- Modelo compatible con stock: https://huggingface.co/kabcnd/Kenzan-Qwen3.8-27B-PinGrid-GGUF
- Modelo multimodal de audio: https://huggingface.co/kabcnd/Kenzan-Haru-4B-PinGrid-GGUF
- Runtime parcheado (referencia): https://github.com/PrismML-Eng/llama.cpp
- Prism ML en Hugging Face: https://huggingface.co/prism-ml
- Donaciones del autor: https://ko-fi.com/kabcpc
