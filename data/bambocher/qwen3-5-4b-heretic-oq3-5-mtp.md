# bambocher/Qwen3.5-4B-heretic-oQ3.5-mtp

## Resumen

Qwen3.5-4B-heretic-oQ3.5-mtp es una cuantizacion mixta del modelo Qwen3.5-4B, publicada por el usuario bambocher en Hugging Face. El checkpoint conserva la arquitectura original de Qwen3.5 (transformer multimodal con cabeza MTP) pero reduce el peso de almacenamiento a 2,9 GB mediante cuantizacion de precision mixta con la herramienta oQ (oMLX v0.7.3), que asigna distintos anchos de bit por tensor segun su sensibilidad. El resultado es un checkpoint de 4.659.865.088 parametros logicos con un promedio efectivo de 4,968 bits por peso.

El modelo integra tres componentes: el modelo de lenguaje (4,206B parametros), un codificador de vision (0,334B) y una cabeza MTP (Multi-Token Prediction, 0,121B) que permite decodificacion especulativa. La presencia de vision y MTP en el checkpoint lo hace apto para tareas multimodales y para acelerar la generacion, aunque el formato esta pensado especificamente para MLX (Apple Silicon), no para CUDA.

La relevancia de esta publicacion es doble: por un lado, demuestra que es posible comprimir un modelo de ~4,7B con vision y MTP hasta menos de 3 GB manteniendo una distribucion de bits agresiva (55,6% de los pesos en 3 bits); por otro, al ser un derivado "heretic" (presumiblemente con el alignment reducido o modificado), resulta de interes para investigadores que estudian el efecto de la cuantizacion sobre modelos con post-entrenamiento alterado. La licencia no esta declarada en la informacion disponible, lo que constituye un riesgo para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con cabeza MTP (Multi-Token Prediction) |
| Parametros totales | 4.659.865.088 (4,66B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 3/4/5/6/8-bit group 64 + BF16 (promedio 4,968 bits/peso) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria MLX) |

Desglose de almacenamiento por componente:

| Componente | Parametros logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 4,206B | 2,140 GB / 1,993 GiB |
| Vision | 0,334B | 0,667 GB / 0,621 GiB |
| Cabeza MTP | 0,121B | 0,087 GB / 0,081 GiB |
| Total | 4,660B | 2,894 GB / 2,695 GiB |

Distribucion de bits:

| Formato | Pesos logicos | Porcentaje | Bits/peso efectivos |
|---|---|---|---|
| Affine 3-bit, group 64 | 2,590B | 55,581% | 3,50 |
| Affine 4-bit, group 64 | 1,032B | 22,137% | 4,50 |
| Affine 5-bit, group 64 | 0,617B | 13,231% | 5,50 |
| Affine 6-bit, group 64 | 0,071B | 1,521% | 6,50 |
| Affine 8-bit, group 64 | 0,003B | 0,072% | 8,50 |
| BF16 | 0,348B | 7,459% | 16,00 |

## Arquitectura y entrenamiento

El checkpoint deriva de Qwen3.5-4B, un transformer multimodal que combina un modelo de lenguaje con un codificador de vision y una cabeza MTP. La cabeza MTP (0,121B parametros) predice varios tokens por paso y habilita decodificacion especulativa, lo que puede incrementar el throughput en inferencia autoregresiva. El codificador de vision (0,334B) confirma que el modelo acepta entradas de imagen ademas de texto. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, numero de cabezas de atencion ni sobre el mecanismo de atencion exacto (si es atencion completa, lineal o hibrida).

El entrenamiento original de Qwen3.5-4B no esta documentado en la informacion proporcionada: se desconoce el volumen de tokens, la composicion del dataset, si hubo RLHF, DPO u otras fases de post-entrenamiento. El sufijo "heretic" sugiere que el checkpoint base ha sido modificado para reducir o eliminar el alignment (abliteracion o fine-tuning con objetivos de "des-adoctrinamiento"), pero no se aporta ninguna descripcion tecnica de ese proceso. La cuantizacion se realizo con oMLX v0.7.3, que aplica precision mixta asignando 3 bits a la mayoria de los pesos (55,6%) y reservando BF16 para el 7,5% (probablemente embeddings, capas de normalizacion y tensores sensibles).

## Capacidades

- Generacion de texto autoregresiva en el marco de la familia Qwen3.5.
- Procesamiento de imagenes: el checkpoint incluye un modulo de vision de 0,334B parametros, lo que habilita tareas de comprension visual (VQA, descripcion, OCR) siempre que el runtime MLX lo soporte.
- Decodificacion especulativa mediante la cabeza MTP, orientada a reducir la latencia por token.
- Razonamiento multi-paso y generacion de codigo: capacidades heredadas del modelo base Qwen3.5-4B, aunque no se documentan explicitamente en esta model card.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades de agente: no confirmadas.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta declarado).
- Modo "thinking": no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta empaquetado para MLX y ocupa 2,9 GB, por lo que cabe en Macs con 8 GB de memoria unificada o superior. Es adecuado para prototipado offline de un modelo multimodal de ~4,7B sin depender de servicios en la nube.
- Investigacion sobre cuantizacion extrema: la distribucion de 3/4/5/6/8 bits permite estudiar el impacto de la precision mixta en la calidad de un modelo con vision y MTP, comparando contra el checkpoint BF16 original.
- Estudio de ablacion de alignment: al ser un derivado "heretic", sirve para analizar como interactua la reduccion de alignment con la cuantizacion agresiva (por ejemplo, si el modelo cuantizado conserva o pierde las propiedades del fine-tuning original).
- Desarrollo de aplicaciones de vision-lenguaje en local: con 0,334B parametros de vision, puede emplearse para descripcion de imagenes, respuesta a preguntas visuales o extraccion de texto en entornos sin GPU NVIDIA.
- Aceleracion de generacion con MTP: la cabeza MTP permite implementar decodificacion especulativa en pipelines MLX, util para reducir latencia en aplicaciones de chat interactivo.
- Evaluacion comparativa de runtimes: sirve como banco de pruebas para medir el rendimiento de oMLX frente a otras herramientas de cuantizacion (llama.cpp, MLX nativo) en hardware Apple.
- Prototipado rapido de asistentes multimodales: al caber en un portatil, permite iterar sobre prompts y flujos de agente antes de desplegar en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~2,9 GB solo para pesos; con overhead de runtime MLX, se recomienda un minimo de 6-8 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4) por el formato MLX. No es compatible directamente con CUDA sin conversion previa.
- Cabe en GPU consumer: si, en cualquier Mac con 8 GB o mas de memoria unificada. En el ecosistema NVIDIA requeriria conversion a otro formato (GGUF, safetensors estandar) y no se garantiza la compatibilidad de la cabeza MTP.
- Opciones de despliegue: MLX (libreria nativa), oMLX v0.7.3 para carga del checkpoint cuantizado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La presencia de MTP sugiere mejoras en decodificacion especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | MTP | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.5-4B-heretic-oQ3.5-mtp | 4,66B | no disponible | Si (0,334B) | Si (0,121B) | no disponible | safetensors (MLX) |
| Qwen3.5-4B (original) | ~4,7B (estimado) | no disponible | Si | Si | no disponible | safetensors |
| Qwen2.5-VL-3B | ~3,75B | 32k (tipico en la familia) | Si | No | Apache 2.0 (Qwen2.5-VL) | safetensors, GGUF |
| Llama 3.2 3B | 3,21B | 128k | No | No | Llama 3.2 Community | safetensors, GGUF |

La comparativa con Qwen2.5-VL-3B y Llama 3.2 3B es orientativa: son modelos de tamano similar, pero no se dispone de datos de rendimiento del checkpoint aqui descrito para establecer una comparacion cuantitativa. La ventaja principal de este checkpoint es su tamano reducido (2,9 GB) y la inclusion de MTP; su desventaja es la dependencia exclusiva de MLX y la ausencia de licencia declarada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido. Es imprescindible contactar con el autor o verificar la licencia del modelo base Qwen3.5-4B antes de cualquier despliegue en produccion.
- Formato exclusivo MLX: no es cargable directamente en vLLM, TGI, llama.cpp u Ollama; requiere conversion y posiblemente perdida de la cabeza MTP.
- Cuantizacion agresiva: el 55,6% de los pesos esta en 3 bits, lo que puede degradar tareas de razonamiento complejo, matematicas y codigo respecto al modelo BF16.
- Naturaleza "heretic": el alignment reducido puede aumentar la probabilidad de respuestas toxicas, sesgadas o no alineadas con politicas de seguridad. No apto para aplicaciones orientadas al usuario sin filtros adicionales.
- Riesgo de alucinacion: inherente a los modelos de ~4B; la cuantizacion puede agravarlo en tareas de conocimiento factual.
- Idiomas y contexto no documentados: no se puede garantizar soporte multilingue ni una ventana de contexto concreta.
- Cero descargas y cero likes: no hay evidencia de validacion por parte de la comunidad; el checkpoint es practicamente nuevo y sin probar.
- Sin benchmarks: no hay datos que permitan estimar la perdida de calidad frente al modelo original.
- Fecha de creacion futura (2026-11-12): inconsistente con el estado actual; conviene verificar la integridad del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-4B-heretic-oQ3.5-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
