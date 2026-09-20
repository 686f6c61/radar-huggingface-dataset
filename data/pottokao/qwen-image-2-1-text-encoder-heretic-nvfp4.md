# pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-NVFP4

## Resumen

`pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-NVFP4` es una build cuantizada a NVFP4 (4 bits) del text encoder del modelo de difusion Qwen-Image-2.1, publicado por el usuario comunitario pottokao. Se trata de un derivado de `Qwen/Qwen-Image-2.1` al que se le ha aplicado una ablacion direccional (abliteration) con la herramienta Heretic sobre las capas `o_proj` y `down_proj`, reduciendo la tasa de rechazos de 100/100 a 5/100 en el conjunto `mlabonne/harmful_behaviors`, con una divergencia KL de 0,0220 medida sobre `mlabonne/harmless_alpaca`. Sobre esa base ablacionada se ha aplicado una cuantizacion NVFP4 en formato nativo de ComfyUI.

El problema que resuelve es doble. Por un lado, permite ejecutar el text encoder de Qwen-Image-2.1 con un peso de fichero de 5,87 GB frente a los 16,33 GB del bf16 original, un 64 % menos. Por otro lado, elimina la mayor parte de los rechazos del encoder, lo que resulta relevante para pipelines de generacion de imagen donde el prompt se filtra en la fase de codificacion de texto. El modelo va dirigido explicitamente a GPU Blackwell (RTX 50xx, GB10), donde NVFP4 se mapea sobre los tensor cores FP4 nativos y aporta tanto ahorro de memoria como ganancia de throughput.

El modelo no esta afiliado ni respaldado por Alibaba ni por Qwen, y se redistribuye bajo la Qwen Research License, que restringe el uso a investigacion y evaluacion (no comercial). El repositorio tiene 6,3 GB, 0 descargas y 0 likes en el momento de la consulta, y fue creado el 20 de septiembre de 2026. El nombre del fichero (`qwen3vl_8b_nvfp4_heretic.safetensors`) sugiere una base Qwen3-VL de aproximadamente 8B parametros, si bien la model card no declara el recuento exacto de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3-VL (text encoder de Qwen-Image-2.1), con vision tower incluida |
| Parametros totales | no disponible (el nombre del fichero, `qwen3vl_8b`, sugiere ~8B; no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits) en 252 proyecciones FFN y de atencion; INT8 per-channel + convrot en `embed_tokens` y `lm_head`; bf16 en vision tower (351 tensores) y en norms/biases. Reparto: 79,2 % de parametros a 4 bits, 14,2 % a 8 bits, 6,6 % a bf16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License (`license: other`, `license_name: qwen-research`). Solo investigacion y evaluacion; uso comercial requiere licencia aparte de Qwen |
| Formato de pesos | safetensors con layout de checkpoint cuantizado nativo de ComfyUI (`TensorCoreNVFP4Layout`). Fichero: `qwen3vl_8b_nvfp4_heretic.safetensors` (5,87 GB) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero, sino de un artefacto de post-procesado sobre el text encoder de Qwen-Image-2.1 (`Qwen/Qwen-Image-2.1`), de arquitectura transformer tipo Qwen3-VL con vision tower. La cadena de transformaciones es: (1) ablacion direccional mediante Heretic sobre `o_proj` y `down_proj`, con 200 ensayos y 60 ensayos de arranque, seleccionando el punto de rodilla de la frontera de Pareto; (2) cuantizacion NVFP4 de pesos con la propia implementacion de ComfyUI, `TensorCoreNVFP4Layout.quantize()`, no con una reimplementacion. La receta se decodifico a partir de `qwen3vl_8b_w4a8.safetensors` de Comfy-Org y se reprodujo de forma exacta.

La innovacion tecnica reseñable es el esquema de proteccion selectiva durante la cuantizacion: solo se cuantizan a 4 bits las proyecciones FFN y de atencion (252 capas), mientras que `embed_tokens` y `lm_head` quedan en INT8 con escalado per-channel y rotacion convolucional, la vision tower completa (351 tensores) permanece en bf16 sin tocar, y norms y biases se mantienen en bf16. El formato usa doble escalado: escalas por grupo de tamano 16 almacenadas en `float8_e4m3fn`, mas una escala global en `float32`. Cada capa lleva su configuracion serializada como JSON en bytes en el tensor `comfy_quant`, y el fichero incluye una entrada `_quantization_metadata` con `format_version: 1.0`. La model card documenta que la ablacion (una edicion de rango 1) no genera outliers, de modo que el error de redondeo NVFP4 es practicamente identico en capas ablacionadas (9,52 %), capas intactas (9,51 %) y encoder original sin ablacionar (9,44 %). No se especifican datos de entrenamiento, numero de tokens ni uso de RLHF o DPO, porque el modelo hereda los del text encoder original de Qwen-Image-2.1.

## Capacidades

- Codificacion de texto a embeddings para el pipeline de generacion de imagen Qwen-Image-2.1, en su variante de 2.1.
- Reduccion de rechazos: 5/100 en `mlabonne/harmful_behaviors` frente a 100/100 del encoder original; verificado de forma independiente sobre la fuente bf16 con 0/20 rechazos y 4/4 preguntas benignas respondidas correctamente.
- Preservacion del comportamiento benigno con deriva limitada: divergencia KL de 0,0220 sobre `mlabonne/harmless_alpaca`.
- Procesamiento multimodal en el encoder: la vision tower (351 tensores) se conserva en bf16, por lo que la ruta visual no se degrada por la cuantizacion.
- Integracion con ComfyUI mediante `CLIPLoader` con tipo `qwen_image` y el nodo `TextEncodeQwenImage21`.
- Ahorro de memoria: 5,87 GB frente a 16,33 GB en bf16 (fichero de 5,87 GB, repositorio de 6,3 GB).
- Aceleracion en hardware Blackwell mediante tensor cores FP4 nativos.
- Tool calling, function calling, modo thinking, audio y capacidades de agente: no aplica a un text encoder de difusion y no se documentan.

## Casos de uso

- Generacion de imagen sin filtrado en la fase de codificacion de texto: al reducir los rechazos de 100/100 a 5/100, el encoder permite procesar prompts que el encoder original rechazaria, util en investigacion creativa y en estudios sobre censura en modelos generativos.
- Despliegue en GPU Blackwell con VRAM limitada: en una RTX 50xx o GB10, la version NVFP4 ocupa 5,87 GB frente a 16,33 GB de bf16, lo que libera memoria para el DiT y el VAE en el mismo dispositivo.
- Pipeline de generacion 1024x1024 en produccion de prototipos: la model card verifica un ciclo completo de 1024x1024 a 25 pasos en aproximadamente 22 s sobre una GB10 emparejada con un DiT NVFP4 auto-cuantizado.
- Investigacion sobre interaccion entre abliteration y cuantizacion: el repositorio aporta mediciones de error relativo por grupo de capas (9,52 % en capas ablacionadas, 9,51 % en intactas, 9,44 % en el encoder original), lo que permite estudiar si ambas transformaciones son ortogonales.
- Referencia para construir cuantizaciones NVFP4 en ComfyUI: la model card enumera cinco fallos silenciosos (vision tower cuantizada por error, `convrot=True` obligatorio en la ruta INT8, serializacion incompleta de `comfy_quant`, escalas MXFP8 como `uint8`, perdida del prefijo `model.language_model.`), lo que sirve como guia de validacion para otros quants.
- Auditoria de seguridad y red teaming de modelos de difusion: permite medir cuanto del comportamiento de rechazo de un pipeline de imagen depende unicamente del text encoder y no del DiT.
- Fine-tuning o destilacion sobre un encoder compacto: al ocupar 5,87 GB, es viable mantener el encoder residente en memoria durante experimentos que requieran recargar el DiT con frecuencia.
- Evaluacion comparativa de formatos de cuantizacion (NVFP4, W4A8, GGUF) sobre un mismo modelo base ablacionado, usando la familia publicada por el mismo autor como conjunto controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K) en la informacion disponible, dado que se trata de un componente de codificacion de texto para difusion. Los datos medidos que si se aportan son los siguientes.

| Metrica | Encoder original | Esta familia (Heretic) |
|---|---:|---:|
| Rechazos (`mlabonne/harmful_behaviors`) | 100/100 | 5/100 |
| Divergencia KL (`mlabonne/harmless_alpaca`) | 0 (por definicion) | 0,0220 |
| Rechazos, re-verificacion sobre fuente bf16 | no disponible | 0/20 |
| Preguntas benignas correctas (fuente bf16) | no disponible | 4/4 |

Error de ida y vuelta de la cuantizacion NVFP4, medido por grupo de capas:

| Grupo de capas | Error relativo |
|---|---:|
| Capas ablacionadas (`o_proj`, `down_proj`) | 9,52 % |
| Capas intactas (`q/k/up/gate_proj`) | 9,51 % |
| Encoder original sin ablacionar | 9,44 % |

Rendimiento de inferencia declarado por el autor: 1024x1024, 25 pasos, aproximadamente 22 s en una GB10 emparejada con un DiT NVFP4 auto-cuantizado. No se aportan cifras de throughput en tokens/s ni de latencia del encoder aislado.

## Requisitos de hardware

- VRAM estimada para el text encoder: los 5,87 GB del fichero NVFP4 son el suelo; hay que sumar overhead de runtime, el DiT y el VAE. Como referencia, la version bf16 ocupa 16,33 GB.
- GPU recomendadas: Blackwell exclusivamente para aprovechar el formato. RTX 50xx y GB10 mapean NVFP4 sobre tensor cores FP4 nativos y obtienen ahorro de memoria mas ganancia de throughput.
- En GPU no Blackwell (incluida Apple Silicon), ComfyUI cae a un camino de desquantizar-y-calcular: se mantiene el ahorro de memoria pero no hay aceleracion, y resulta ligeramente mas lento que bf16. El propio autor recomienda la build GGUF para Mac.
- Encaje en GPU de consumo: si, en tarjetas Blackwell de consumo (serie RTX 50xx) para el encoder aislado; el limite practico lo marca el DiT que lo acompaña.
- Opciones de despliegue: exclusivamente ComfyUI en la informacion disponible. Requiere una build con soporte `QwenImage21`, fusionado despues del 14 de septiembre de 2026; builds anteriores devuelven `UNSUPPORTED DIFFUSION MODEL`. Ubicacion: `ComfyUI/models/text_encoders/`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia declarada: aproximadamente 22 s para una generacion completa de 1024x1024 a 25 pasos en GB10 con DiT NVFP4.

## Comparativa con modelos similares

Comparativa dentro de la propia familia del autor y contra el encoder de referencia:

| Modelo | Precision / formato | Tamano | Hardware objetivo | Ablacionado | Licencia |
|---|---|---:|---|---|---|
| `Qwen-Image-2.1-Text-Encoder-Heretic-NVFP4` (este) | NVFP4 (w4), layout ComfyUI | 5,87 GB | Blackwell (RTX 50xx, GB10) | Si | Qwen Research |
| `Qwen-Image-2.1-Text-Encoder-Heretic` (bf16) | bf16 | 17 GB (fichero de 16,33 GB) | Cualquiera | Si | Qwen Research |
| `Qwen-Image-2.1-Text-Encoder-Heretic-W4A8` | W4A8 INT8 asimetrico, formato de Comfy-Org | 5,88 GB | Generico | Si | Qwen Research |
| `Qwen-Image-2.1-Text-Encoder-Heretic-GGUF` | GGUF | no disponible | Apple Silicon y CPU | Si | Qwen Research |
| Encoder de `Qwen/Qwen-Image-2.1` (stock) | bf16 | no disponible | Cualquiera | No (100/100 rechazos) | Qwen Research |

No se dispone de datos de terceros sobre text encoders alternativos de difusion (por ejemplo, T5-XXL o Llama-based encoders de otros pipelines) que sean directamente comparables en el contexto de Qwen-Image-2.1, por lo que la comparativa se limita a la familia del propio autor y al modelo de referencia.

## Limitaciones y advertencias

- Licencia estrictamente no comercial: la Qwen Research License limita el uso a investigacion y evaluacion. El uso comercial exige una licencia aparte de Qwen (`model-business@notice.qwencloud.com`).
- Riesgo de seguridad por ablacion: el modelo elimina el 95 % de los rechazos del encoder original. Esto puede facilitar la generacion de contenido que el pipeline original bloquearia. La responsabilidad de filtrado recae enteramente en quien despliega el sistema.
- Deriva de comportamiento: la ablacion introduce una divergencia KL de 0,0220 respecto al encoder original, lo que implica un cambio medible en la distribucion de salida incluso en prompts benignos.
- Perdida de precision por cuantizacion: error relativo de ida y vuelta en torno al 9,5 % en los pesos, sin diferencia significativa entre capas ablacionadas e intactas. No se documenta una evaluacion de calidad de imagen resultante que cuantifique el impacto perceptual de ese error.
- Dependencia fuerte de hardware: en GPU no Blackwell el formato no aporta aceleracion y es ligeramente mas lento que bf16; la eleccion de NVFP4 solo tiene sentido en Blackwell.
- Dependencia de version de ComfyUI: requiere una build con soporte `QwenImage21` posterior al 14 de septiembre de 2026. Builds anteriores fallan con `UNSUPPORTED DIFFUSION MODEL`.
- Fragilidad del formato: la model card documenta cinco formas de producir un fichero que parece valido pero es silenciosamente incorrecto (mismo tamano, mismo numero de tensores, mismas cadenas de formato). Cualquier re-cuantizacion casera debe validarse contra la release oficial o ejecutando el modelo.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion independiente por parte de la comunidad.
- Contexto e idiomas no declarados: la model card no especifica longitud de contexto ni cobertura linguistica del encoder.
- Sesgos: no se documenta ninguna evaluacion de sesgos del modelo base ni del efecto de la ablacion sobre ellos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-NVFP4
- Modelo base (bf16): https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic
- Build W4A8 de la misma familia: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-W4A8
- Build GGUF de la misma familia: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-GGUF
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen-Image-2.1
- Texto de la licencia: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Herramienta de ablacion Heretic: https://github.com/p-e-w/heretic
- Dataset de evaluacion de rechazos: `mlabonne/harmful_behaviors`
- Dataset de evaluacion de deriva benigna: `mlabonne/harmless_alpaca`
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos de HuggingFace.
