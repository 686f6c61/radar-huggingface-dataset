# scottlowry/Swift-1.5-Qwen3.8-27b-oQ4e-mtp

## Resumen

Swift-1.5-Qwen3.8-27b-oQ4e-mtp es una cuantizacion mixta del modelo ukisai/Swift-1.5-Qwen3.8-27b, publicada por el usuario scottlowry. El modelo base pertenece a la familia Qwen3.5 (segun el tag `qwen3_5`) y cuenta con 27.781 millones de parametros, de los cuales 0.461B corresponden a un modulo de vision y 0.425B a una cabeza MTP (multi-token prediction) para decodificacion especulativa. La cuantizacion se ha realizado con oQ (oMLX v0.7.4.dev1) en formato MLX, lo que la hace directamente utilizable en hardware Apple Silicon.

El checkpoint resultante ocupa 16.314 GiB en disco (17.517 GB) y aplica una estrategia de precision mixta: el 69.8% de los pesos quedan en 4 bits afines con grupo de 64, el 23.7% en 5 bits, el 4.6% en 6 bits, y una pequena fraccion (1.86%) se mantiene en BF16. El promedio efectivo es de 5.044 bits por peso, un compromiso entre tamano y fidelidad respecto al modelo original.

La relevancia de esta publicacion radica en que permite ejecutar un modelo multimodal de ~28B parametros con vision y decodificacion especulativa en equipos con memoria unificada de 32-64 GB, algo inviable con los pesos BF16 originales. El modelo esta pensado para inferencia local en macOS mediante MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con modulo de vision y cabeza MTP |
| Parametros totales | 27.781.427.952 (27.781B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 4/5/6/8 bits con grupo 64, mas BF16 (promedio 5.044 bits/peso) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.5 con 27.781B parametros. La distribucion interna del checkpoint cuantizado desglosa tres componentes: el modelo de lenguaje (26.896B parametros logicos, 15.155 GiB), un modulo de vision (0.461B parametros, 0.858 GiB) y una cabeza MTP (0.425B parametros, 0.301 GiB). La presencia del modulo de vision confirma que se trata de un modelo multimodal, y la cabeza MTP habilita decodificacion multi-token, una tecnica de decodificacion especulativa que predice varios tokens por paso para aumentar el throughput.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados, la composicion de los datos ni si se aplicaron tecnicas de RLHF, DPO o similares. La unica innovacion tecnica documentada en esta publicacion es el propio esquema de cuantizacion mixta de oQ, que asigna mayor precision (5, 6 y 8 bits) a un subconjunto de pesos y mantiene en BF16 el 1.86% de los mismos, presumiblemente capas sensibles a la cuantizacion, mientras comprime el grueso a 4 bits.

## Capacidades

- Generacion de texto y razonamiento: el modelo de lenguaje de 26.9B parametros soporta tareas generativas generales.
- Procesamiento de vision: el modulo de vision de 0.461B parametros permite entrada de imagenes junto con texto (modelo multimodal).
- Decodificacion especulativa: la cabeza MTP de 0.425B parametros acelera la generacion prediciendo multiples tokens por paso.
- Inferencia local en Apple Silicon: el formato MLX esta optimizado para GPUs integradas de la serie M de Apple.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes locales multimodales en macOS: el modelo puede procesar imagenes y texto en equipos Apple Silicon con 32-64 GB de memoria unificada, gracias a su tamano de 16.3 GiB y al backend MLX, sin necesidad de GPU dedicada ni conexion a la nube.
- Analisis de documentos con imagenes: la combinacion de modulo de vision y modelo de lenguaje de 26.9B parametros permite extraer y razonar sobre contenido de capturas, diagramas o PDFs renderizados en flujos de trabajo de escritorio.
- Generacion de texto asistida en local: para desarrolladores que necesitan un modelo de ~28B sin enviar datos a terceros, el checkpoint cuantizado ofrece un equilibrio entre calidad y huella de memoria.
- Aceleracion de inferencia interactiva: la cabeza MTP permite decodificacion especulativa, util en aplicaciones de chat o autocompletado donde la latencia por token es critica.
- Prototipado de pipelines multimodales: investigadores pueden validar arquitecturas que combinen vision y lenguaje sobre el modelo base antes de escalar a infraestructura mayor.
- Evaluacion de tecnicas de cuantizacion: el esquema mixto de oQ con distribucion documentada por bits sirve como referencia para estudiar el impacto de la precision mixta en modelos de ~28B.
- Despliegue en estaciones de trabajo sin GPU NVIDIA: al estar en formato MLX, encaja en entornos macOS donde CUDA no esta disponible y se busca aprovechar la memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 16.314 GiB en disco; en inferencia se necesita al menos esa cantidad mas el overhead de activaciones y cache KV, por lo que se recomienda un minimo de 24-32 GB de memoria unificada.
- GPU recomendadas: Apple Silicon con memoria unificada de 32 GB o superior (M1/M2/M3/M4 Pro, Max o Ultra). El formato MLX no es compatible con GPUs NVIDIA o AMD en el ecosistema CUDA/ROCm estandar.
- Cabe en consumer GPU: si, en equipos Apple con 32 GB o mas de memoria unificada. No es un formato para GPUs de consumo NVIDIA (RTX 4090, etc.) sin conversion previa.
- Opciones de despliegue: MLX (libreria nativa), oMLX (herramienta de cuantizacion del autor del esquema). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en el formato actual.
- Latencia y throughput: no disponibles. La cabeza MTP sugiere mejoras de throughput mediante decodificacion especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27b-oQ4e-mtp (este) | 27.781B | no disponible | MLX safetensors, 5.044 bits/peso | no disponible | Hugging Face, 573 descargas |
| ukisai/Swift-1.5-Qwen3.8-27b (base) | 27.781B (presumible) | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de ~28B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente sobre modelos comparables de la misma categoria en formato MLX para establecer una comparativa cuantitativa de rendimiento.

## Limitaciones y advertencias

- La cuantizacion mixta a un promedio de 5.044 bits/peso puede degradar la calidad respecto al modelo base en tareas sensibles a la precision numerica (matematicas, codigo, razonamiento largo).
- El 69.8% de los pesos estan en 4 bits, lo que introduce perdida de informacion inevitable; no se han publicado evaluaciones que cuantifiquen esa degradacion.
- La licencia no esta declarada en la informacion disponible, por lo que no se puede confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base ukisai/Swift-1.5-Qwen3.8-27b antes de usarlo en produccion.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a CUDA sin conversion.
- No se documentan idiomas soportados ni sesgos conocidos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplicable el riesgo generico de los modelos generativos de esta escala.
- El autor actualizo el checkpoint el 2026-11-11 con oMLX v0.7.4.dev1; copias anteriores pueden diferir en calidad, por lo que conviene descargar la version vigente.
- No se especifica la longitud de contexto, lo que impide planificar casos de uso con ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scottlowry/Swift-1.5-Qwen3.8-27b-oQ4e-mtp
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
