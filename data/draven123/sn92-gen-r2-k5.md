# draven123/sn92-gen-r2-k5

## Resumen

`draven123/sn92-gen-r2-k5` es un modelo multimodal de tipo image-text-to-text publicado en Hugging Face por el usuario `draven123`. Por sus etiquetas (`gemma4`, `reax`, `bittensor-sn92`), se trata de un ajuste fino o derivado de la familia Gemma 4, orientado a la subred 92 de Bittensor (Reax), un ecosistema descentralizado de cómputo e incentivos para modelos de IA. El repositorio tiene acceso restringido (gated) y no presenta descargas ni interacciones en el momento de la consulta.

El checkpoint contiene 31.273.088.876 parámetros en formato safetensors (aproximadamente 31,3 mil millones), con un tamaño de repositorio de 62,6 GB, lo que sugiere pesos en precisión de 16 bits. Está empaquetado para su uso con la librería `transformers` y declara compatibilidad con endpoints. La licencia es Apache 2.0.

La relevancia de este modelo es acotada y muy específica: se enmarca en el circuito de modelos generados o evaluados dentro de la subred 92 de Bittensor, por lo que su interés principal es para participantes de esa red y para quienes investigan modelos multimodales de ~31B con licencia permisiva. No hay documentación pública sobre datos de entrenamiento, benchmarks ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `gemma4`; presumiblemente transformer multimodal de la familia Gemma 4) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16 por el tamano de 62,6 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica publicada sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composicion del dataset ni el uso de tecnicas como RLHF, DPO o decodificacion especulativa. La etiqueta `gemma4` sugiere que el modelo parte de la familia Gemma 4 de Google DeepMind, y la etiqueta `image-text-to-text` junto con el pipeline declarado confirman que acepta imagenes y texto como entrada y genera texto. La etiqueta `reax` y `bittensor-sn92` apuntan a un ajuste orientado a las tareas evaluadas en esa subred.

El tamano de 31,3 mil millones de parametros y el repositorio de 62,6 GB son coherentes con un checkpoint en precision de 16 bits sin cuantizar. No hay informacion sobre si se trata de un ajuste completo, un LoRA fusionado o un modelo entrenado desde cero; dado el contexto de Bittensor, lo mas probable es un ajuste fino de un modelo base, pero esto no esta confirmado en la informacion disponible.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text), segun el pipeline declarado.
- Conversacion multi-turno: la etiqueta `conversational` indica soporte de dialogos.
- Procesamiento de imagenes junto con instrucciones en lenguaje natural.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`).
- Carga mediante `transformers` con pesos en safetensors.
- No hay informacion disponible sobre tool calling, function calling, razonamiento multi-paso, modo thinking, audio ni capacidades multilingues especificas.

## Casos de uso

- Descripcion automatica de imagenes en castellano o en el idioma de entrenamiento: el modelo puede recibir una imagen y generar una descripcion textual; util para catalogacion de activos digitales, aunque la calidad real no esta documentada.
- Respuesta a preguntas visuales (VQA) en entornos controlados: integrable en un pipeline de `transformers` para responder preguntas sobre capturas, diagramas o fotografias.
- Prototipado de asistentes multimodales: su naturaleza conversacional permite construir demos de chat que aceptan imagenes, con la ventaja de una licencia Apache 2.0 para uso comercial.
- Evaluacion dentro de la subred 92 de Bittensor: participantes de la red pueden desplegarlo como candidato en las tareas de la subred, dado el etiquetado `reax` y `bittensor-sn92`.
- Extraccion de informacion de documentos escaneados: al ser image-text-to-text, puede emplearse para transcribir o resumir contenido visual, siempre que la ventana de contexto sea suficiente (dato no disponible).
- Investigacion sobre ajuste fino multimodal: al ser un checkpoint de ~31B con licencia permisiva, sirve como base para experimentos de fine-tuning en vision-lenguaje.
- Servicio de inferencia via endpoints compatibles: su etiqueta `endpoints_compatible` facilita el despliegue en infraestructuras que aceptan el formato estandar de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 63 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se requieren 2 GPU de 48 GB (A6000, L40S) o una GPU de 80 GB (A100, H100) para margen suficiente.
- Cuantizacion a 8 bits (GPTQ/AWQ/INT8): reduciria los pesos a ~31 GB, permitiendo su ejecucion en una A100 40 GB o en dos RTX 4090 de 24 GB con tensor parallelism.
- Cuantizacion a 4 bits (GGUF Q4_K_M): ~16-18 GB, lo que permitiria ejecutarlo en una unica RTX 4090 de 24 GB o en una RTX 3090, con perdida de calidad no evaluada.
- No cabe en GPU de consumo de 8-12 GB en ninguna cuantizacion razonable.
- Opciones de despliegue: `transformers` (declarado), vLLM y TGI si el modelo es compatible con sus kernels (no confirmado), llama.cpp/Ollama solo si existen conversiones GGUF publicadas (no disponibles).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `draven123/sn92-gen-r2-k5` | 31,3B | no disponible | Apache 2.0 | gated en HF | Derivado Gemma 4 segun etiquetas; sin benchmarks |
| Gemma 3 27B (Google) | 27B | 128K (segun documentacion publica de Gemma 3) | Gemma Terms | Abierto en HF | Multimodal, benchmarks publicos |
| Qwen2.5-VL 32B | ~32B | 128K (segun documentacion publica) | Apache 2.0 | Abierto en HF | Multimodal con benchmarks publicos |
| Llama 3.2 90B Vision | 90B | 128K (segun documentacion publica) | Llama Community License | Abierto en HF | Mayor tamano, licencia mas restrictiva |

La comparacion se basa en caracteristicas publicas de modelos de la misma categoria; no hay datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card con detalles de entrenamiento, evaluacion ni limitaciones conocidas.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar, lo que puede complicar la automatizacion en produccion.
- Riesgo de alucinacion: inherente a los modelos generativos; sin evaluacion publica no puede acotarse.
- Sesgos: desconocidos, al no publicarse la composicion del dataset de entrenamiento.
- Idiomas: no se especifican; no debe asumirse un rendimiento solido en castellano.
- Contexto: longitud no disponible, lo que impide planificar casos de uso con documentos largos.
- Licencia Apache 2.0 declarada, pero al ser un derivado de Gemma 4 conviene verificar que los terminos de la familia base no impongan restricciones adicionales; la informacion disponible no aclara este punto.
- Modelo de nicho con cero descargas y cero interacciones: no hay evidencia de validacion por parte de la comunidad.
- Fecha de creacion futura (2026-11-24) en los metadatos: conviene tratar los metadatos con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/draven123/sn92-gen-r2-k5
- Bittensor (red descentralizada): https://bittensor.com
- Subred 92 (Reax): no disponible enlace oficial en la informacion proporcionada
- Documentacion de Gemma (familia base presumible): https://ai.google.dev/gemma
- Libreria transformers: https://github.com/huggingface/transformers
