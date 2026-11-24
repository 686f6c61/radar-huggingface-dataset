# Codixor/vision-gguf

## Resumen

Codixor/vision-gguf es un repositorio de pesos convertidos para el ecosistema rcumfy y sus motores de inferencia (vision.cpp y stable-diffusion.cpp). No se trata de un modelo de lenguaje generativo, sino de un paquete de dos artefactos: una torre de visión CLIP ViT-H/14 en formato GGUF y los pesos de PhotoMaker v2 en safetensors, ambos reempaquetados para su uso en pipelines de generación de imagen condicionada por identidad facial.

El repositorio lo publica el usuario Codixor y agrupa 632.076.800 parámetros en total según los safetensors, con un tamaño de repositorio de 5,0 GB. La conversión se realizó sin Python ni PyTorch, usando la herramienta `vision.cpp/tools/convert-rs`, un detalle relevante para entornos que buscan cadenas de conversión ligeras y reproducibles.

Su relevancia actual es acotada pero concreta: sirve como fuente de pesos listos para consumir en flujos de image-to-image con preservación de identidad sobre stable-diffusion.cpp, evitando al desarrollador tener que convertir manualmente CLIP y PhotoMaker v2. La licencia es heterogénea (per-file), con MIT para el GGUF de CLIP y Apache-2.0 para PhotoMaker v2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CLIP ViT-H/14 (torre de visión) + PhotoMaker v2 (adaptador de identidad) |
| Parámetros totales | 632.076.800 (según safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16 (archivo `CLIP-ViT-H-14-F16.gguf`); safetensors sin cuantizar para PhotoMaker v2 |
| Idiomas soportados | no disponible |
| Licencia | per-file: MIT (CLIP GGUF), Apache-2.0 (PhotoMaker v2) |
| Formato de pesos | GGUF y safetensors |

## Arquitectura y entrenamiento

El componente de visión es un CLIP ViT-H/14 procedente de OpenCLIP, entrenado sobre LAION-2B y reempaquetado desde el formato de ComfyUI (`clip_vision_h.safetensors`). La conversión a GGUF emplea el arquetipo `clip` de vision.cpp y, según la model card, coincide con una referencia en NumPy hasta coseno 1.0000, lo que indica una conversión numéricamente fiel sin pérdida apreciable de precisión.

El segundo componente, PhotoMaker v2, proviene de TencentARC/PhotoMaker-V2 y se distribuye como safetensors con los tensores byte-idénticos al binario original, renombrados al esquema de stable-diffusion.cpp. El proceso de conversión leyó el `.bin` original como datos, sin ejecutarlo (evitando el riesgo de deserialización de pickle). No se documentan datos de entrenamiento propios, ni fases de RLHF/DPO, ni innovaciones de decoding: es un repositorio de conversión y empaquetado, no de entrenamiento.

## Capacidades

- Extracción de embeddings de imagen mediante la torre CLIP ViT-H/14, utilizable como codificador visual en pipelines de difusión.
- Condicionamiento por identidad facial mediante PhotoMaker v2, que requiere un face ID embedding adicional en tiempo de inferencia.
- Integración con stable-diffusion.cpp para generación de imagen guiada por referencia de identidad.
- Compatibilidad con el ecosistema rcumfy y vision.cpp.
- Conversión reproducible sin dependencia de Python ni PyTorch.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; no es un modelo de lenguaje.

## Casos de uso

- Retratos personalizados con identidad consistente: combinar el CLIP GGUF como codificador y PhotoMaker v2 como adaptador para generar variaciones de un mismo rostro en stable-diffusion.cpp, aprovechando que los pesos ya están en el layout esperado por el motor.
- Despliegue en entornos sin Python: al haberse convertido con `convert-rs` y distribuirse en GGUF, encaja en contenedores mínimos o sistemas embebidos donde no se quiere arrastrar PyTorch.
- Reproducción de pipelines ComfyUI en C++: el CLIP ViT-H/14 reempaquetado desde ComfyUI permite replicar el codificador visual de flujos existentes en un runtime nativo.
- Auditoría de conversiones: el repositorio documenta la equivalencia numérica (coseno 1.0000) y la identidad byte a byte de los tensores, lo que lo hace útil como referencia para validar herramientas de conversión propias.
- Prototipado de aplicaciones de edición de imagen con preservación de sujeto, usando PhotoMaker v2 sobre un modelo base de difusión compatible con stable-diffusion.cpp.
- Distribución ligera de pesos para demos locales: el tamaño de 5,0 GB y el formato GGUF facilitan su empaquetado en imágenes de contenedor o artefactos descargables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica aportada es la fidelidad de conversión del CLIP GGUF frente a una referencia NumPy (coseno 1.0000), que valida la conversión pero no el rendimiento del modelo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio ocupa 5,0 GB, por lo que el CLIP en F16 y PhotoMaker v2 en safetensors requieren al menos ese orden de magnitud, más la VRAM del modelo base de difusión con el que se combinen.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo de difusión acompañante y del backend de stable-diffusion.cpp.
- Opciones de despliegue: vision.cpp y stable-diffusion.cpp (motores del ecosistema rcumfy); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Codixor/vision-gguf | 632.076.800 | no aplica | GGUF + safetensors | per-file (MIT / Apache-2.0) | Hugging Face, 364 descargas |
| TencentARC/PhotoMaker-V2 (original) | no disponible | no aplica | bin / safetensors | Apache-2.0 | Hugging Face |
| OpenCLIP ViT-H/14 LAION-2B (original) | no disponible | no aplica | safetensors | MIT | Hugging Face |

La comparativa se limita a los artefactos de origen, ya que no se dispone de datos de rendimiento ni de alternativas equivalentes empaquetadas para stable-diffusion.cpp en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling; cualquier uso en ese sentido es un error de categoría.
- PhotoMaker v2 exige un face ID embedding en inferencia; sin él, el condicionamiento por identidad no funciona.
- La licencia es per-file y heterogénea; para uso comercial debe verificarse cada archivo por separado (MIT para CLIP, Apache-2.0 para PhotoMaker v2) y las condiciones del modelo base de difusión empleado.
- El repositorio tiene 0 likes y 364 descargas, con actividad muy reciente (creado y actualizado en noviembre de 2026); no hay evidencia de uso en producción ni validación externa.
- Riesgo de sesgos y alucinaciones visuales inherente a los modelos de difusión y a CLIP entrenado sobre LAION-2B; no se documentan evaluaciones al respecto.
- No se especifican idiomas soportados ni limitaciones de contexto, ya que no aplican a esta arquitectura.
- Dependencia del ecosistema rcumfy y de herramientas propias del autor; la interoperabilidad con otros runtimes no está garantizada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Codixor/vision-gguf
- Repositorio rcumfy: https://github.com/codixor/rcumfy
- PhotoMaker v2 original: https://huggingface.co/TencentARC/PhotoMaker-V2
