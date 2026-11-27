# scottlowry/Swift1.5-Qwen3.8-Flash-Next-oQ5e-fp16-mtp

## Resumen

Swift1.5-Qwen3.8-Flash-Next-oQ5e-fp16-mtp es una cuantizacion mixta de precision del modelo base ukisai/Swift1.5-Qwen3.8-Flash-Next, publicada por el usuario scottlowry. El checkpoint conserva los 180.000 millones de parametros logicos del modelo original (179.999.981.459 segun los safetensors) pero los almacena en un formato de pesos comprimido que ocupa 130,4 GB en el repositorio. La cuantizacion se ha realizado con la herramienta oQ de oMLX (version v0.7.4.dev1), que aplica distintos esquemas de bits por tensor en funcion de su relevancia, con un promedio efectivo de 5,795 bits por peso para el checkpoint completo.

El modelo esta empaquetado para la libreria MLX, el framework de Apple para inferencia en silicio unificado (chips M-series), y emplea la convencion de nombres oQ5e. Incorpora ademas una cabeza MTP (multi-token prediction) de 2.607 millones de parametros y un modulo de vision de 449 millones, lo que sugiere que el modelo base es multimodal. La ficha tecnica del modelo base no esta disponible en la informacion proporcionada, por lo que muchos detalles de arquitectura, entrenamiento y capacidades deben marcarse como no disponibles.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de 180.000 millones de parametros en hardware Apple con memoria unificada, algo inviable con los pesos en FP16 (que requeririan unos 360 GB). La actualizacion del 11 de noviembre de 2026 indica una recuantizacion con una version mas reciente de oMLX, por lo que las copias anteriores deben descartarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-Flash-Next; incluye modulo de vision y cabeza MTP) |
| Parametros totales | 179.999.981.459 (180.000 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 5-bit grupo 64, affine 8-bit grupo 64 y 128, FP16, FP32, N-gram affine 5-bit grupo 32; promedio 5,795 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), 130,4 GB en repositorio |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion del modelo base ukisai/Swift1.5-Qwen3.8-Flash-Next, cuyo diseno interno no se detalla en la informacion disponible. Por la nomenclatura y los componentes presentes se puede inferir que se trata de un transformer multimodal con modulo de vision (0,449B de parametros en FP32) y una cabeza de prediccion multi-token (MTP) de 2,607B, tecnica habitual para decodificacion especulativa y aceleracion de inferencia. El desglose de almacenamiento indica que el grueso del modelo son el language model (125,744B) y una tabla de embeddings N-gram de 51,200B, lo que apunta a un esquema de atencion o embedding poco convencional que no se describe en la model card.

El proceso de cuantizacion, realizado con oQ de oMLX v0.7.4.dev1, asigna precision de forma selectiva: el 68,507% de los pesos logicos (123,313B) se guarda en affine 5-bit con grupo 64 (5,50 bits/peso efectivos); la tabla N-gram (28,445%, 51,200B) usa affine 5-bit con grupo 32 (6,00 bits/peso); un 2,628% (4,731B) se mantiene en affine 8-bit grupo 64; y una fraccion minima (0,286% en total) permanece en FP16 o FP32, presumiblemente capas sensibles como normas o proyecciones de salida. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base, aunque no se documentan evaluaciones especificas.
- Procesamiento de vision: el checkpoint incluye un modulo de vision de 0,449B de parametros en FP32, lo que indica capacidad multimodal de entrada de imagenes.
- Decodificacion multi-token: la cabeza MTP de 2,607B permite generar varios tokens por paso, reduciendo latencia en inferencia.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking explicito: no disponible.

## Casos de uso

- Inferencia local en Mac de gama alta: con 130,4 GB de pesos, el modelo cabe en equipos con memoria unificada de 192 GB o superior (Mac Studio M2/M3 Ultra), permitiendo ejecutar un modelo de 180.000 millones de parametros sin GPU dedicada.
- Prototipado de asistentes multimodales: el modulo de vision integrado permite construir demos de descripcion de imagenes o analisis de documentos escaneados en entornos de desarrollo con MLX.
- Investigacion sobre cuantizacion: el desglose detallado de bits por tensor lo convierte en un caso de estudio para medir el impacto de la cuantizacion mixta en la calidad del modelo frente al checkpoint original.
- Aceleracion de inferencia con MTP: la cabeza de prediccion multi-token es util para experimentar con decodificacion especulativa en pipelines de generacion de texto de baja latencia.
- Despliegue en estaciones de trabajo Apple para tareas de generacion de codigo: si el modelo base conserva las capacidades de la familia Qwen, podria usarse en entornos de desarrollo sin conexion, aunque no hay datos que lo confirmen.
- Evaluacion comparativa de frameworks: sirve para contrastar el rendimiento de MLX frente a llama.cpp o vLLM con modelos equivalentes en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 130,4 GB para los pesos; se recomienda al menos 160-192 GB de memoria unificada para dejar margen al contexto y a los estados de atencion.
- GPU recomendadas: Apple Silicon con memoria unificada alta (M2 Ultra, M3 Ultra con 192 GB o 512 GB). No es compatible de forma nativa con CUDA.
- GPU de consumo: no cabe en ninguna GPU consumer con 24 GB (RTX 4090) ni en configuraciones de 48 GB. Solo es viable en hardware Apple de gama alta o en configuraciones multi-GPU con suficiente memoria agregada, aunque MLX no esta pensado para ello.
- Opciones de despliegue: MLX (libreria nativa del checkpoint), mlx-lm y oMLX. No se ha validado con llama.cpp, Ollama, vLLM ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Swift1.5-Qwen3.8-Flash-Next-oQ5e-fp16-mtp | 180.000M | no disponible | MLX safetensors 5,795 bits/peso | no disponible | Apple Silicon |
| ukisai/Swift1.5-Qwen3.8-Flash-Next (base) | 180.000M (presumible) | no disponible | no disponible | no disponible | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 5,795 bits/peso puede degradar la calidad respecto al checkpoint original en tareas sensibles a precision, como matematicas o generacion de codigo largo.
- La licencia no esta declarada, lo que impide confirmar si se permite uso comercial; debe consultarse la licencia del modelo base antes de cualquier despliegue en produccion.
- El checkpoint esta ligado a MLX y no es portable directamente a ecosistemas CUDA sin conversion adicional.
- No se documentan sesgos, riesgos de alucinacion ni evaluaciones de seguridad del modelo base.
- La model card advierte de que las copias anteriores al 11 de noviembre de 2026 deben descargarse de nuevo por una recuantizacion; versiones antiguas pueden presentar diferencias de calidad.
- El repositorio tiene solo 207 descargas y 1 like, por lo que la validacion comunitaria es muy limitada.
- No hay informacion sobre idiomas soportados ni sobre el comportamiento del modulo de vision en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Swift1.5-Qwen3.8-Flash-Next-oQ5e-fp16-mtp
- Modelo base: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
