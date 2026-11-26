# scottlowry/Ornith-1.5-35B-A3B-oQ8e-fp16-mtp

## Resumen

Ornith-1.5-35B-A3B-oQ8e-fp16-mtp es una cuantizacion mixta de 8 bits del modelo ornith-ai/Ornith-1.5-35B-A3B, publicada por el usuario scottlowry. El checkpoint conserva la arquitectura original MoE (etiquetada como qwen3_5_moe en los metadatos de Hugging Face) con 35.951.822.704 parametros totales y una cabeza MTP (multi-token prediction) de 0,845B parametros, ademas de un modulo de vision de 0,447B. El resultado es un unico artefacto de 39,5 GB en formato safetensors compatible con la libreria MLX de Apple.

La relevancia de esta ficha radica en que no se trata de un modelo nuevo, sino de un derivado de cuantizacion orientado a inferencia local en hardware Apple Silicon. El autor ha aplicado la herramienta oQ de oMLX (v0.7.4.dev1) con precision mixta: la mayor parte de los pesos (94,945%) se almacena en affine 8-bit con grupo 64, mientras que un 3,727% usa grupo 128, y se preservan en FP32 (1,242%) y FP16 (0,086%) las capas mas sensibles. El promedio efectivo es de 8,789 bits por peso.

El modelo base pertenece a la familia Ornith 1.5, un MoE de 35B con aproximadamente 3B parametros activos por token (segun la nomenclatura A3B), lo que lo situa en la categoria de modelos eficientes de gran capacidad. Esta cuantizacion concreta esta pensada para ejecutarse con MLX en Macs con memoria unificada, no en GPUs NVIDIA. La licencia, los idiomas y los benchmarks del modelo base no se detallan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer (tag qwen3_5_moe), con cabeza MTP y modulo de vision |
| Parametros totales | 35.951.822.704 (35,952B) |
| Parametros activos | aproximadamente 3B (deducido de la nomenclatura A3B; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Affine 8-bit grupo 64 (94,945% de pesos), affine 8-bit grupo 128 (3,727%), FP16 (0,086%), FP32 (1,242%); promedio 8,789 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), repo de 39,5 GB |
| Libreria de inferencia | mlx |
| Modelo base | ornith-ai/Ornith-1.5-35B-A3B |
| Desglose de almacenamiento | LM: 34,661B (34,279 GiB); vision: 0,447B (1,664 GiB); MTP: 0,845B (0,843 GiB) |
| Herramienta de cuantizacion | oQ (oMLX v0.7.4.dev1) |
| Descargas / likes | 248 / 1 |
| Fecha de creacion / actualizacion | 2026-08-19 / 2026-11-12 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE), segun el tag qwen3_5_moe de Hugging Face, lo que sugiere una estructura derivada de la familia Qwen 3.5 MoE. El checkpoint incluye tres componentes diferenciados: el modelo de lenguaje (34,661B parametros logicos), un modulo de vision (0,447B) y una cabeza de prediccion multi-token MTP (0,845B). La presencia de MTP es relevante porque habilita decodificacion especulativa nativa, es decir, el modelo puede proponer varios tokens por paso y verificarlos en paralelo, lo que incrementa el throughput en generacion autoregresiva.

Sobre el entrenamiento del modelo base no hay informacion en la documentacion proporcionada: no se especifica el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO o similar. Lo que si esta documentado es el proceso de cuantizacion: se aplico oQ de oMLX v0.7.4.dev1 con precision mixta, asignando 8 bits con grupo 64 al grueso de las matrices, 8 bits con grupo 128 a una fraccion pequena, y manteniendo en FP32 y FP16 las capas que el algoritmo considero mas sensibles (probablemente embeddings, normas y algunas proyecciones criticas). El autor actualizo el checkpoint el 2026-11-11 y recomienda volver a descargarlo si se tenia una copia anterior.

## Capacidades

- Generacion de texto y razonamiento en el modelo de lenguaje base (34,661B parametros logicos).
- Procesamiento de vision: el checkpoint incluye un modulo visual de 0,447B parametros, por lo que el modelo base es multimodal (imagen + texto).
- Prediccion multi-token (MTP): cabeza dedicada de 0,845B parametros que permite decodificacion especulativa y mayor velocidad de generacion.
- Capacidad de mezcla de expertos: solo una fraccion de los parametros se activa por token (aproximadamente 3B), lo que reduce el coste computacional por token frente a un denso equivalente.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente; la presencia de MTP y el tamano del modelo lo hacen plausible, pero no hay documentacion al respecto.
- Capacidades multilingues: no disponibles; no se especifican idiomas en la model card.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamano de 39,5 GB permiten ejecutar el modelo en Macs con memoria unificada de 64 GB o superior, sin necesidad de GPUs dedicadas. Es el caso de uso principal de esta cuantizacion.
- Asistentes multimodales de escritorio: gracias al modulo de vision de 0,447B, se puede usar para describir imagenes, extraer texto de capturas o responder preguntas sobre documentos escaneados en un flujo local.
- Generacion de texto asistida con baja latencia: la cabeza MTP permite decodificacion especulativa, lo que reduce el tiempo por token en comparacion con un modelo denso del mismo tamano y mejora la experiencia en chat interactivo.
- Prototipado de agentes con mezcla de expertos: la activacion de aproximadamente 3B parametros por token hace viable mantener conversaciones largas y cadenas de razonamiento sin agotar la memoria del sistema.
- Experimentacion academica con cuantizacion mixta: el checkpoint sirve como referencia para estudiar el impacto de distintas precisiones (8-bit grupo 64 vs grupo 128 vs FP32) en la calidad de salida de un MoE.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse integramente en local con MLX, los datos no salen del dispositivo, lo que encaja en escenarios de salud, legal o finanzas donde no se permite enviar informacion a la nube.
- Evaluacion comparativa de tecnicas de cuantizacion: util para medir la degradacion de un MoE de 35B al pasar de FP16 a 8,789 bits/peso promedio en tareas de razonamiento y vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 36,785 GiB (39,498 GB) en disco; para inferencia hay que sumar el espacio de activaciones y cache KV, por lo que se recomienda un minimo de 48 GB de memoria unificada y, de forma realista, 64 GB o mas para contexto largo.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo son chips Apple Silicon (M1/M2/M3/M4 Pro, Max y Ultra). No es compatible de forma nativa con CUDA.
- Cabe en consumer GPU: en el ecosistema Apple, si; en GPUs NVIDIA consumer, no directamente, ya que habria que reconvertir los pesos a otro formato (por ejemplo GGUF) y el modelo completo no cabe en una RTX 4090 de 24 GB.
- Opciones de despliegue: MLX (libreria nativa), mlx-lm para el modelo de lenguaje y utilidades MLX-VLM para el modulo de vision. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en esta cuantizacion concreta.
- Latencia y throughput: no disponibles; no se publican mediciones en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-oQ8e-fp16-mtp (esta ficha) | 35,952B totales, ~3B activos | no disponible | safetensors MLX, 8,789 bits/peso | no disponible | Cuantizacion mixta con MTP y vision, orientada a Apple Silicon |
| ornith-ai/Ornith-1.5-35B-A3B (base) | 35,952B totales, ~3B activos | no disponible | safetensors (FP16/BF16 presumiblemente) | no disponible | Modelo original sin cuantizar; mayor precision y mayor huella de memoria |
| Qwen3 MoE de ~30B (referencia de familia) | ~30B totales, ~3B activos | no disponible en esta ficha | safetensors, GGUF | Apache 2.0 en la mayoria de variantes | Familia de referencia por el tag qwen3_5_moe; comparacion no verificada con datos de esta ficha |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- La licencia no esta declarada en la model card ni en los metadatos; antes de un uso comercial es imprescindible consultar la licencia del modelo base ornith-ai/Ornith-1.5-35B-A3B.
- La cuantizacion a 8,789 bits/peso promedio introduce perdida de precision respecto al modelo original, especialmente en tareas de matematicas, codigo y razonamiento de varios pasos; no se han publicado evaluaciones de la degradacion.
- El checkpoint esta empaquetado para MLX; no es portable directamente a CUDA, vLLM o llama.cpp sin conversion previa.
- El repositorio tiene 248 descargas y 1 like, lo que indica una validacion comunitaria muy limitada; conviene tratar el artefacto con cautela en produccion.
- El autor actualizo el checkpoint el 2026-11-11 y recomienda volver a descargarlo; versiones anteriores pueden diferir en calidad.
- No se especifican idiomas soportados, por lo que el rendimiento en castellano no esta verificado.
- No hay informacion sobre sesgos, alineacion, RLHF o politicas de seguridad del modelo base.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran tamano; no hay evaluaciones publicadas que lo cuantifiquen.
- La longitud de contexto no esta documentada, lo que impide planificar despliegues con ventanas largas.
- El modulo de vision anade 1,664 GiB adicionales; si solo se necesita texto, se puede prescindir de el para ahorrar memoria, pero la model card no documenta como hacerlo.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Ornith-1.5-35B-A3B-oQ8e-fp16-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
