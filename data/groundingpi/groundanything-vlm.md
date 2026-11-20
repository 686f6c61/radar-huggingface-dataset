# GroundingPI/GroundAnything-VLM

## Resumen

GroundAnything-VLM es un modelo vision-language de 4.843 millones de parametros desarrollado por GroundingPI, especializado en grounding visual: localizacion de objetos, comprension de expresiones referenciales, pointing, OCR y comprension de layout de documentos. Forma parte de la familia GroundAnything, que incluye una variante DLM (diffusion language model) con decodificacion paralela y esta variante autorregresiva (VLM) que sirve como referencia de calidad. El modelo aborda el problema de la latencia secuencial en modelos de grounding autorregresivos, que serializan predicciones espaciales imponiendo un orden causal artificial sobre las salidas.

La propuesta central de la familia es tratar el grounding como extraccion de evidencia visual: objetos, localizaciones y relaciones espaciales estan conjuntamente restringidos por la imagen y la consulta, sin que exista un orden de generacion intrinseco de izquierda a derecha. La variante VLM aqui descrita es la autorregresiva, y segun la model card alcanza un 72,42% de media agregada en 30 benchmarks de grounding, quedando ligeramente por encima de GPT-6 Astra (71,35%) en ese agregado. La variante DLM con decodificacion guiada por entropia alcanza 61,75% frente al 53,32% de LocateAnything.

El modelo esta pensado para sistemas sensibles a la latencia que necesitan localizacion precisa: robotica, agentes embodied, automatizacion de GUI, analisis documental y comprension de escenas densas. Soporta ingles y chino, se distribuye en safetensors para `transformers` con codigo personalizado, y su licencia combina Apache 2.0 con la Kimi K3 License para el material derivado de Kimi.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer autorregresivo (variante VLM de la familia GroundAnything; la variante DLM usa diffusion con decodificacion paralela por bloques) |
| Parametros totales | 4.843.664.384 (~4,84 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 con componente upstream bajo Kimi K3 License (`apache-2.0-with-upstream-kimi-k3`) |
| Formato de pesos | safetensors (libreria `transformers`, `custom_code`) |

## Arquitectura y entrenamiento

GroundAnything-VLM es la variante autorregresiva de una familia de modelos de grounding de 4B parametros. La model card describe el planteamiento arquitectonico de la familia: los modelos AR de grounding serializan las predicciones espaciales, lo que introduce latencia secuencial e impone un orden causal sobre los tokens de salida. Frente a ello, la variante DLM emplea difusion bidireccional con denoising iterativo por bloques, de modo que las hipotesis espaciales emergen en paralelo y se refinan conjuntamente. La variante VLM que nos ocupa mantiene el esquema autorregresivo y se posiciona como referencia de calidad dentro de la familia.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La model card menciona dos innovaciones tecnicas relevantes: la decodificacion guiada por entropia (entropy-guided decoding) en la variante DLM, y un modo auto-especulativo opcional (self-speculative mode) que logra una aceleracion de 4,51x respecto a la contraparte AR con una caida de 0,74 puntos porcentuales en COCO F1mIoU en el punto de operacion reportado en el paper. El modelo se distribuye con codigo personalizado (`custom_code`) para `transformers`.

## Capacidades

- Localizacion de objetos de vocabulario abierto (open-vocabulary object localization) y grounding en escenas densas.
- Comprension de expresiones referenciales (referring-expression comprehension) y localizacion basada en prompts visuales.
- Localizacion basada en puntos (pointing) y razonamiento espacial.
- Grounding de elementos de interfaz grafica (GUI element grounding).
- OCR con localizacion de texto y comprension de layout de documentos.
- Generacion de texto conversacional en el pipeline `image-text-to-text`.
- Soporte multilingue limitado a ingles y chino.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni modos de razonamiento multi-paso tipo agente.

## Casos de uso

- Robotica y agentes embodied: el modelo puede localizar objetos y elementos del entorno a partir de instrucciones en lenguaje natural, lo que permite a un agente embodied identificar el objeto a manipular y su posicion en la imagen antes de planificar la accion.
- Automatizacion de interfaces graficas: el grounding de elementos GUI permite a un agente identificar botones, campos y menus en capturas de pantalla para automatizar flujos de trabajo sobre aplicaciones sin API.
- Analisis documental: la combinacion de OCR con localizacion de texto y comprension de layout permite extraer campos estructurados de facturas, formularios y documentos escaneados manteniendo la relacion espacial entre elementos.
- Anotacion automatica de datasets: el modelo puede generar bounding boxes y puntos de referencia sobre imagenes para preetiquetar datos de entrenamiento de deteccion, reduciendo el coste de anotacion manual.
- Busqueda visual y recuperacion: la comprension de expresiones referenciales permite implementar busquedas del tipo "el coche rojo aparcado junto a la farola" sobre catalogos de imagenes.
- Investigacion en percepcion y sistemas autonomos: sirve como modelo de referencia de 4B parametros para experimentos de grounding en conduccion autonoma, vigilancia o inspeccion industrial, donde la precision de localizacion es critica.
- Accesibilidad: descripcion y localizacion de elementos en imagenes para asistir a usuarios con discapacidad visual, indicando donde se encuentra cada objeto relevante.

## Benchmarks y rendimiento

| Benchmark / metrica | GroundAnything-VLM | Referencia comparada |
|---|---|---|
| Media agregada en 30 benchmarks de grounding | 72,42% | GPT-6 Astra: 71,35% |
| Media agregada (variante DLM con entropy-guided decoding) | 61,75% | LocateAnything (MTP): 53,32% |
| Aceleracion con self-speculative mode | 4,51x frente a la variante AR | Caida de 0,74 pp en COCO F1mIoU |

No se han publicado en la informacion disponible resultados desglosados por benchmark individual (MMLU, HumanEval, GSM8K, COCO detallado, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,84 B parametros, en precision completa (fp16/bf16) se requieren aproximadamente 9,7 GB solo para pesos, mas memoria para el encoder visual, activaciones y cache KV; en cuantizacion de 8 bits rondaria los 5 GB y en 4 bits unos 2,5-3 GB, aunque no se confirman cuantizaciones oficiales en la informacion disponible.
- GPU recomendadas: A100 o H100 para despliegue en produccion con throughput alto; RTX 4090 (24 GB) o A10G suficientes para inferencia en fp16.
- Cabe en GPU consumer: si, en tarjetas con 12-16 GB o mas en fp16, y potencialmente en 8 GB con cuantizacion, si bien no se documentan formatos GGUF oficiales.
- Opciones de despliegue: `transformers` con `custom_code` (requerido por la arquitectura), y potencialmente vLLM o TGI si el codigo personalizado es compatible; no se confirma soporte de llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles de forma absoluta; la model card reporta una aceleracion de 4,51x del modo auto-especulativo frente a la variante AR, lo que indica que la variante AR es la mas lenta de la familia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GroundAnything-VLM | 4,84 B | no disponible | 72,42% media en 30 benchmarks de grounding | Apache 2.0 + Kimi K3 License | Hugging Face, ModelScope |
| GroundAnything (DLM) | ~4 B (familia) | no disponible | 61,75% con entropy-guided decoding | Apache 2.0 + Kimi K3 License | Hugging Face, ModelScope |
| LocateAnything (MTP) | no disponible | no disponible | 53,32% media | no disponible | no disponible |
| GPT-6 Astra | no disponible (propietario) | no disponible | 71,35% media | propietaria | API |

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y chino; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Alucinacion: como modelo de grounding, puede generar cajas o puntos sobre regiones sin objeto real, especialmente en escenas densas o con consultas ambiguas; no se documentan tasas de error especificas.
- Licencia: aunque las contribuciones propias son Apache 2.0, el material derivado de Kimi queda sujeto a la Kimi K3 License, cuyas condiciones siguen aplicandose al usar o redistribuir el paquete combinado; es necesario revisar el fichero LICENSE antes de un uso comercial.
- Contexto: no se especifica la longitud de contexto, lo que impide garantizar el manejo de imagenes de alta resolucion o conversaciones multi-turno largas.
- Codigo personalizado: requiere `trust_remote_code` en `transformers`, lo que anade riesgo de seguridad y complica la integracion con frameworks de serving estandar.
- Despliegue: la model card marca `inference: false`, lo que sugiere que la inferencia no esta verificada por la plataforma de Hugging Face; conviene validar el pipeline antes de produccion.
- No se documentan sesgos demograficos ni de dominio; en aplicaciones de vigilancia o seleccion automatizada deben aplicarse auditorias adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/GroundingPI/GroundAnything-VLM
- ModelScope (VLM): https://www.modelscope.ai/models/GroundingPI/GroundAnything-VLM
- ModelScope (DLM): https://www.modelscope.ai/models/GroundingPI/GroundAnything
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/GroundingPI/GroundAnything-VLM
- Pagina del proyecto: https://groundingpi.github.io/groundanything/
- Repositorio GitHub: https://github.com/groundingpi/GroundAnything
- Paper: https://arxiv.org/abs/2609.39600
- HF paper: https://huggingface.co/papers/2609.39600
- Pagina de la familia en HF: https://huggingface.co/GroundingPI/GroundAnything
