# scottlowry/Ornith-1.5-35B-A3B-oQ4e-fp16-mtp

## Resumen

Ornith-1.5-35B-A3B-oQ4e-fp16-mtp es una cuantizacion mixta del modelo base ornith-ai/Ornith-1.5-35B-A3B, publicada por el usuario scottlowry. El checkpoint esta empaquetado en formato MLX (libreria `mlx`), lo que lo orienta a inferencia en hardware Apple Silicon, y emplea la herramienta oQ de oMLX (v0.7.4.dev1) para aplicar precision mixta sobre los pesos originales. El resultado es un checkpoint de 35.951.822.704 parametros logicos almacenados en 21,445 GiB, con una media efectiva de 5,124 bits por peso.

La arquitectura declarada en los tags es `qwen3_5_moe`, es decir, un transformer con mezcla de expertos (MoE) de la familia Qwen 3.5. El nombre del modelo indica 35B de parametros totales y 3B activos por token, aunque el dato de parametros activos no aparece confirmado de forma explicita en la informacion disponible. El checkpoint incorpora ademas tres componentes diferenciados: el modelo de lenguaje (34,661B de pesos logicos), un modulo de vision (0,447B) y una cabeza MTP (Multi-Token Prediction, 0,845B) que permite decodificacion especulativa.

La relevancia de esta ficha radica en que es una distribucion cuantizada de un modelo grande pensada para ejecucion local en Mac, con un equilibrio agresivo entre tamano (23 GB de repo) y fidelidad (la mayor parte de los pesos en 4 bits, pero con capas sensibles preservadas en 8 bits, FP16 y FP32). No se dispone de informacion sobre licencia, idiomas soportados ni resultados de benchmarks en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), con modulo de vision y cabeza MTP |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible (el nombre sugiere ~3B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 4-bit grupo 64, affine 8-bit grupo 128, affine 8-bit grupo 64, FP16 y FP32 (media efectiva 5,124 bits/peso) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos de la familia Qwen 3.5, segun el tag `qwen3_5_moe`. La nomenclatura "35B-A3B" indica 35.000 millones de parametros totales y aproximadamente 3.000 millones activos por token, patron habitual en arquitecturas MoE de activacion dispersa. El checkpoint cuantizado conserva tres bloques funcionales: el modelo de lenguaje (34,661B de pesos logicos, 19,313 GiB), un codificador o proyector de vision (0,447B, 1,664 GiB) y una cabeza MTP (0,845B, 0,468 GiB) que habilita decodificacion multi-token especulativa. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados ni si hubo fases de RLHF o DPO.

La innovacion tecnica de esta publicacion no reside en el entrenamiento sino en la cuantizacion. La herramienta oQ de oMLX aplica precision mixta por tensor: el 91,838% de los pesos logicos (33,018B) se almacena en affine 4-bit con grupo de 64, lo que reduce el coste a 4,50 bits efectivos; un 6,474% (2,328B) se preserva en affine 8-bit grupo 64 (8,50 bits efectivos) y un 0,359% (0,129B) en affine 8-bit grupo 128 (8,25 bits). Ademas, 0,031B de pesos quedan en FP16 y 0,447B en FP32, presumiblemente correspondientes a capas sensibles (normalizaciones, embeddings o el proyector de vision). El checkpoint fue re-cuantizado el 2026-11-11 con oMLX v0.7.4.dev1, por lo que versiones anteriores deben descartarse.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es un LLM de gran escala con arquitectura MoE, orientado a tareas de comprension y generacion.
- Procesamiento de vision: el checkpoint incluye un modulo de vision de 0,447B de pesos logicos, lo que habilita entrada de imagenes (modelo multimodal).
- Decodificacion especulativa: la cabeza MTP de 0,845B permite generar varios tokens por paso de verificacion, reduciendo la latencia en inferencia autoregresiva.
- Codigo y matematicas: capacidad esperable en la familia Qwen 3.5, aunque no se documenta de forma explicita en la informacion disponible.
- Tool calling y function calling: no disponible en la documentacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas en la model card.
- Modo thinking explicito: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamano de 21,445 GiB permiten cargar el modelo en Macs con memoria unificada de 32 GB o superior, usando la libreria `mlx` para aprovechar los kernels optimizados de Apple.
- Asistentes multimodales de escritorio: gracias al modulo de vision integrado, se puede construir un asistente que procese capturas de pantalla o documentos escaneados y responda en lenguaje natural, todo en local sin enviar datos a la nube.
- Generacion de codigo en estaciones de trabajo: un MoE de ~3B activos ofrece un coste computacional por token bajo, adecuado para autocompletado y refactorizacion en editores integrados que corren sobre el portatil del desarrollador.
- Prototipado rapido de aplicaciones LLM: el checkpoint cuantizado reduce el ciclo de iteracion (descarga de 23 GB, carga en memoria) frente al modelo en precision completa, lo que facilita pruebas de concepto en equipos con hardware limitado.
- Decodificacion de baja latencia con MTP: la cabeza de prediccion multi-token permite servir respuestas interactivas con mayor throughput, util en chatbots o interfaces conversacionales donde la latencia percibida es critica.
- Investigacion sobre cuantizacion: el desglose detallado por formato (4-bit, 8-bit, FP16, FP32) sirve como caso de estudio para medir el impacto de la precision mixta en calidad y velocidad frente al modelo base sin cuantizar.
- Evaluacion comparativa de arquitecturas MoE: investigadores pueden medir como se comporta un MoE de 35B totales y ~3B activos frente a modelos densos de tamano similar en tareas de razonamiento y vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 21,445 GiB de pesos mas overhead de activaciones y cache KV; se recomienda un minimo de 32 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: el formato MLX esta disenado para chips Apple M-series (M1 Pro/Max/Ultra, M2 Pro/Max/Ultra, M3 Pro/Max, M4 Pro/Max). No es compatible de forma nativa con CUDA sin conversion previa.
- Cabe en consumer GPU: si, en equipos Apple con 32 GB o mas de memoria unificada. En GPUs NVIDIA consumer (RTX 4090 con 24 GB) requeriria conversion de formato y posiblemente una cuantizacion adicional.
- Opciones de despliegue: `mlx` y `mlx-lm` (libreria nativa del checkpoint). Para otros backends seria necesaria conversion a GGUF (llama.cpp/Ollama) o a safetensors estandar (vLLM, TGI).
- Latencia y throughput: no disponibles. La presencia de la cabeza MTP sugiere mejoras de throughput respecto a decodificacion autoregresiva clasica, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-oQ4e-fp16-mtp | 35,95B totales (MoE) | no disponible | MLX safetensors, 5,124 bits/peso | no disponible | Hugging Face (scottlowry) |
| ornith-ai/Ornith-1.5-35B-A3B (base) | 35B totales (MoE) | no disponible | safetensors sin cuantizar | no disponible | Hugging Face (ornith-ai) |
| Qwen 3.5 MoE de referencia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 4 bits en el 91,8% de los pesos puede degradar la calidad respecto al modelo base, especialmente en tareas de razonamiento matematico y generacion de codigo sensible a precision.
- El checkpoint esta empaquetado exclusivamente para MLX; no es directamente utilizable en vLLM, TGI, llama.cpp u Ollama sin conversion previa.
- No se declara licencia en la model card ni en los metadatos de Hugging Face, lo que impide confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base ornith-ai/Ornith-1.5-35B-A3B antes de cualquier despliegue en produccion.
- No se documentan idiomas soportados; el comportamiento multilingue es incierto.
- No hay informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad.
- El modelo fue re-cuantizado el 2026-11-11; copias anteriores descargadas antes de esa fecha deben reemplazarse.
- El autor es un tercero (scottlowry), no el desarrollador original; la trazabilidad de la cuantizacion depende de la herramienta oMLX y de su version concreta (v0.7.4.dev1).
- La cabeza MTP anade 0,845B de parametros que deben ser soportados por el runtime; backends que no la implementen pueden ignorarla o fallar al cargar el checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scottlowry/Ornith-1.5-35B-A3B-oQ4e-fp16-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
