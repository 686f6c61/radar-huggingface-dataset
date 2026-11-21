# saidutta69/Qwen3-VL-4B-Instruct-heretic

## Resumen

Qwen3-VL-4B-Instruct-heretic es una variante "abliterada" (decensored) del modelo vision-language Qwen/Qwen3-VL-4B-Instruct, publicada por el usuario saidutta69 (bajo el alias "RACER IS OP"). El modelo conserva la arquitectura original de Qwen3-VL —un transformer multimodal que procesa imagen, video y OCR con grounding espacial— pero se han editado quirúrgicamente las direcciones de pesos responsables del comportamiento de rechazo, de modo que el modelo deja de negarse a responder ante peticiones que el modelo base rechazaría. El proceso se realizó con Heretic v1.4.0, una herramienta de abliteración direccional basada en Optuna.

Con 4.437.815.808 parámetros totales (4,44B), el modelo incluye tanto el backbone de texto como el codificador visual en los pesos safetensors en BF16. Es la variante intermedia de una colección de tres (2B, 4B y 8B) orientada a despliegue en una única GPU de consumo. Su relevancia actual radica en que ofrece capacidades de OCR, grounding espacial y agente visual sin las restricciones de rechazo del modelo original, manteniendo una divergencia KL baja (0,0396) respecto al base.

La licencia es Apache 2.0 y los pesos están disponibles en safetensors (BF16, con visión) y en una escalera de cuantizaciones GGUF (solo texto, sin codificador visual). El modelo está etiquetado únicamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3-VL (backbone de texto + codificador visual), arch `qwen3vl` |
| Parametros totales | 4.437.815.808 (4,44B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (la model card menciona ~1 GB adicional por cada 32K de contexto, sin especificar el maximo nativo) |
| Tipos de cuantizacion | BF16 (safetensors); GGUF F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, con vision) y GGUF (solo texto, sin vision) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-4B-Instruct, un transformer multimodal de la familia Qwen que acepta imagen, video y OCR como entrada y produce texto, con capacidad de grounding espacial. No se ha reentrenado ni ajustado con fine-tuning: la modificación consiste en una abliteración direccional aplicada con Heretic v1.4.0, que localiza las direcciones de pesos asociadas al comportamiento de rechazo y las edita en las proyecciones de salida de atención (`attn.o_proj`) y en las proyecciones descendentes del MLP (`mlp.down_proj`). El resto de la red queda intacto, preservando el conocimiento vision-language y el seguimiento de instrucciones del modelo base.

Los parámetros concretos de la abliteración corresponden al ensayo 120 de una ejecución de 200 ensayos con semilla `3485018052`: `direction_index` 19,43; `attn.o_proj.max_weight` 1,49 en posición 21,65 y `min_weight` 0,92 a distancia 9,30; `mlp.down_proj.max_weight` 1,12 en posición 25,61 y `min_weight` 0,11 a distancia 15,41. El autor incluye un directorio `reproduce/` con `config.toml`, `requirements.txt`, el journal del estudio Optuna y sumas SHA-256 para regenerar el modelo bit a bit mediante `heretic --reproduce reproduce/reproduce.json`. No se dispone de datos sobre el volumen de tokens de entrenamiento del modelo base ni sobre su pipeline de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional e instrucciones multi-turno.
- Comprensión de imagen, video y OCR (solo con pesos safetensors; los GGUF son solo texto).
- Grounding espacial: localización de elementos en imágenes (bounding boxes, referencias a regiones).
- Capacidades de agente visual y GUI: interpretación de capturas de pantalla e interacción con interfaces.
- Comportamiento de rechazo reducido: de 97/100 a 8/100 en el conjunto de evaluación de peticiones dañinas del autor.
- Despliegue on-device en GPU de consumo mediante cuantizaciones GGUF.
- Idiomas: únicamente inglés según la model card.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Extracción de texto de documentos e imágenes (OCR): el modelo puede procesar capturas, escaneos o fotografías y devolver el texto estructurado; requiere los pesos safetensors porque el codificador visual no está en los GGUF.
- Automatización de agentes GUI: interpretación de capturas de pantalla para identificar botones, campos y regiones interactivas mediante grounding espacial, útil en pipelines de automatización de escritorio o pruebas de interfaz.
- Análisis de video para moderación o etiquetado: descripción y localización de contenido en fotogramas, con la salvedad de que el comportamiento de rechazo está atenuado y requiere filtros propios de seguridad.
- Asistente visual local en estación de trabajo: despliegue con Q4_K_M (2,33 GB) en una RTX 4060 de 8 GB para tareas de texto, o con safetensors BF16 en una GPU de 24 GB para tareas multimodales completas.
- Investigación sobre alineación y abliteración: el paquete `reproduce/` permite regenerar el modelo bit a bit y estudiar el efecto de la edición direccional sobre el comportamiento de rechazo con una divergencia KL medible (0,0396).
- Procesamiento de documentos con referencias espaciales: localización de tablas, firmas o sellos en imágenes escaneadas combinando OCR y grounding.
- Generación de descripciones de imágenes o videos en inglés para catalogación de contenido, con control de salida propio al no contar con guardarraíles de rechazo.

## Benchmarks y rendimiento

| Metrica | Este modelo | Qwen/Qwen3-VL-4B-Instruct |
|---|---|---|
| Divergencia KL | 0,0396 | 0 (por definición) |
| Rechazos (conjunto dañino, /100) | 8/100 | 97/100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos, según la model card): Q4_K_M 2,33 GB; Q5_K_M 2,69 GB; Q6_K 3,08 GB; Q8_0 3,99 GB; F16 GGUF 7,50 GB. Añadir aproximadamente 1 GB por cada 32K de contexto.
- Pesos safetensors BF16: 4,65 GB + 3,62 GB (unos 8,27 GB) más el codificador visual incluido; requiere más VRAM que los GGUF al no estar cuantizados.
- GPU recomendadas por el autor: RTX 3090/4090/5090 (24 GB) con Q8_0; RTX 4080/5080/4060 Ti 16G con Q6_K; RTX 3060/4070/5070 (12 GB) con Q5_K_M; RTX 4060/3070 (8 GB) y GTX 1660 Super/2060/3050 laptop (6 GB) con Q4_K_M.
- CPU-only y Apple Silicon: Q4_K_M (2,33 GB) cabe en RAM del sistema.
- Opciones de despliegue: transformers con `Qwen3VLForConditionalGeneration` + `AutoProcessor` (visión completa, safetensors); llama.cpp, LM Studio y Jan para texto con GGUF (`llama serve -hf saidutta69/Qwen3-VL-4B-Instruct-heretic:Q4_K_M`). No se documenta soporte de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Vision | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-VL-4B-Instruct-heretic (este) | 4,44B | Si (solo safetensors) | No disponible | Apache 2.0 | Rechazos 8/100, KL 0,0396 |
| Qwen/Qwen3-VL-4B-Instruct | 4B | Si | No disponible | Apache 2.0 | Modelo base; rechazos 97/100 |
| Qwen3-VL-2B-Instruct-heretic | 2B | Si | No disponible | Apache 2.0 | Variante menor de la misma colección |
| Qwen3-VL-8B-Instruct-heretic | 8B | Si | No disponible | Apache 2.0 | Variante mayor de la misma colección |

## Limitaciones y advertencias

- Modelo abliterado: el comportamiento de rechazo está suprimido deliberadamente. No incorpora guardarraíles de seguridad del modelo base, por lo que en producción es necesario añadir filtros y moderación propios.
- Los GGUF son solo texto: no incluyen el codificador visual (398 tensores, 4,02B parámetros, cero tensores de visión). Para imagen, video u OCR hay que usar los safetensors.
- Idioma: únicamente inglés según la model card; el rendimiento en castellano u otros idiomas no está documentado.
- Riesgo de alucinación: no cuantificado en la información disponible; la abliteración introduce una divergencia KL de 0,0396 respecto al base, que puede afectar a la coherencia en algunos dominios.
- La edición de pesos puede degradar sutilmente capacidades no medidas; el autor solo reporta rechazos y KL, sin benchmarks de tareas.
- Sesgos: no documentados por el autor; hereda los del modelo base Qwen3-VL.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue de un modelo sin rechazos conlleva responsabilidad legal y ética sobre el contenido generado.
- El repositorio tiene 792 descargas y 0 likes en el momento de la consulta; es un artefacto de la comunidad, no una publicación oficial de Qwen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidutta69/Qwen3-VL-4B-Instruct-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Artículo sobre abliteración: https://huggingface.co/blog/mlabonne/abliteration
- Variante 2B de la colección: https://huggingface.co/saidutta69/Qwen3-VL-2B-Instruct-heretic
- Variante 8B de la colección: https://huggingface.co/saidutta69/Qwen3-VL-8B-Instruct-heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
