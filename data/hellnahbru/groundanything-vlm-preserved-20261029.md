# hellnahbru/GroundAnything-VLM-preserved-20261029

## Resumen

GroundAnything-VLM es un modelo de visión-lenguaje de 4.843.664.384 parámetros (aproximadamente 4,8 mil millones) desarrollado por el equipo GroundingPI, orientado a tareas de *visual grounding*: localización de objetos en imágenes, comprensión de expresiones referenciales, detección open-vocabulary, OCR con localización de texto y comprensión de maquetación de documentos. Este repositorio concreto (`hellnahbru/GroundAnything-VLM-preserved-20261029`) es una copia preservada del checkpoint autorregresivo original publicado por GroundingPI, con licencia derivada `apache-2.0-with-upstream-kimi-k3`.

El modelo pertenece a la familia GroundAnything, que incluye una variante de *diffusion language model* (DLM) con decodificación paralela por bloques y esta variante autorregresiva (VLM). El trabajo aborda el problema de la latencia secuencial en modelos de grounding: en lugar de serializar las predicciones espaciales en orden causal de izquierda a derecha, la variante DLM genera hipótesis espaciales en paralelo mediante denoising iterativo. La variante VLM aquí presentada es la referencia autorregresiva frente a la que se mide esa aceleración.

La relevancia actual del modelo radica en su rendimiento agregado sobre 30 benchmarks de grounding: según la model card, alcanza un 72,42 % global, ligeramente por encima de GPT-6 Astra (71,35 %) en esa métrica agregada, y compite en la misma franja de tamaño que modelos de grounding de 4B. Está pensado para sistemas sensibles a latencia como robótica, agentes encarnados y automatización documental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal autorregresivo (image-text-to-text); familia con variante DLM de decodificación paralela por bloques |
| Parámetros totales | 4.843.664.384 (≈4,8 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | apache-2.0-with-upstream-kimi-k3 (Apache 2.0 para contribuciones propias; Kimi K3 License para material derivado de Kimi) |
| Formato de pesos | safetensors |
| Librería | transformers (requiere `trust_remote_code` / custom code) |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 9,8 GB |
| Fecha de creación | 2026-10-29 |

## Arquitectura y entrenamiento

La variante VLM es un modelo autorregresivo multimodal que serializa las predicciones espaciales (coordenadas, puntos, cajas) como tokens de texto, siguiendo el paradigma de los modelos de grounding basados en VLM. La familia GroundAnything introduce además una variante DLM que sustituye esa generación secuencial por denoising bidireccional por bloques, de modo que las hipótesis espaciales emergen en paralelo y se refinan iterativamente. La variante VLM es la referencia autorregresiva sobre la que se calculan las aceleraciones del DLM (hasta 4,51× con modo auto-especulativo, con una caída de 0,74 puntos porcentuales en COCO F1mIoU).

El modelo incorpora material derivado de Kimi (de ahí la cláusula de licencia upstream Kimi K3). No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. La model card menciona innovaciones como la decodificación guiada por entropía y el modo auto-especulativo, aunque estas se describen principalmente en el contexto de la variante DLM.

## Capacidades

- Localización de objetos open-vocabulary y grounding en escenas densas.
- Comprensión de expresiones referenciales (*referring-expression comprehension*).
- Localización basada en prompts visuales (puntos, cajas) y *pointing*.
- Razonamiento espacial sobre relaciones entre objetos.
- Grounding de elementos de interfaz gráfica (GUI).
- OCR con localización de texto en la imagen.
- Comprensión de maquetación de documentos (*document layout*).
- Generación de texto multimodal conversacional (pipeline image-text-to-text).
- Soporte bilingüe inglés-chino.
- *Tool calling* / *function calling*: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Detección y localización de objetos en imágenes industriales: el modelo devuelve coordenadas de objetos descritos en lenguaje natural, útil para control de calidad y conteo automatizado en líneas de producción sin necesidad de reentrenar un detector específico.
- Análisis de documentos escaneados: combinación de OCR con localización de texto y comprensión de maquetación permite extraer campos estructurados (importes, fechas, firmas) indicando su posición en la página, adecuado para digitalización de facturas y contratos.
- Automatización de interfaces gráficas: el grounding de elementos GUI permite a agentes de automatización localizar botones, campos y menús a partir de instrucciones en lenguaje natural, útil en testing de aplicaciones y RPA.
- Robótica y agentes encarnados: la localización precisa de objetos referenciados por lenguaje sirve como módulo de percepción para manipulación y navegación, especialmente en escenarios donde los objetos no están predefinidos en un catálogo cerrado.
- Búsqueda visual y anotación de datasets: generación automática de cajas y puntos para etiquetado de imágenes a gran escala, reduciendo el coste de anotación manual en pipelines de datos de visión.
- Asistentes de accesibilidad: descripción y localización de elementos en una imagen o pantalla para usuarios con discapacidad visual, indicando qué hay y dónde está en la escena.
- Sistemas sensibles a latencia: aunque esta variante es la autorregresiva, sirve de referencia para desplegar la variante DLM cuando se requiere decodificación paralela rápida en producción.

## Benchmarks y rendimiento

Según la model card, sobre un agregado de 30 benchmarks de grounding:

| Modelo | Métrica agregada (30 benchmarks) |
|---|---|
| GroundAnything-VLM (AR) | 72,42 % |
| GPT-6 Astra | 71,35 % |
| GroundAnything (DLM, entropy-guided) | 61,75 % |
| LocateAnything (MTP-based) | 53,32 % |

| Escenario | Resultado reportado |
|---|---|
| Auto-especulativo vs. AR | 4,51× de aceleración con caída de 0,74 pp en COCO F1mIoU |

No se han publicado en la información disponible resultados desglosados por benchmark individual (MMLU, HumanEval, GSM8K u otros), ni métricas estándar de VLM más allá del agregado de grounding.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,8 B parámetros, en FP16 se requieren aproximadamente 9,7 GB solo para pesos; en BF16 similar. En cuantización de 8 bits, en torno a 5 GB; en 4 bits, en torno a 2,5-3 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en producción con lotes; RTX 4090 (24 GB) y RTX 3090 (24 GB) para FP16 en una sola GPU.
- GPU de consumo: cabe en GPUs consumer de 24 GB en FP16; en 16 GB y 12 GB requeriría cuantización (no se documentan formatos GGUF oficiales).
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el modelo requiere código personalizado). No se documenta soporte oficial para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. La model card reporta aceleraciones relativas de la variante DLM (4,51×) pero no cifras absolutas para esta variante.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento agregado (grounding) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GroundAnything-VLM (este) | ≈4,8 B | no disponible | 72,42 % (30 benchmarks) | Apache 2.0 + Kimi K3 upstream | Hugging Face, ModelScope |
| GroundAnything (DLM) | ≈4 B | no disponible | 61,75 % (entropy-guided) | Apache 2.0 + Kimi K3 upstream | Hugging Face, ModelScope |
| LocateAnything | no disponible | no disponible | 53,32 % | no disponible | no disponible |
| GPT-6 Astra | no disponible (propietario) | no disponible | 71,35 % | propietaria | API |

La comparación se limita a los datos publicados en la model card. No se dispone de información sobre otros modelos de grounding de tamaño similar (por ejemplo, variantes de Florence, Grounding DINO o Qwen-VL adaptadas) en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano no está documentado.
- Longitud de contexto no especificada: no se puede garantizar el manejo de documentos o imágenes de alta resolución con muchas regiones sin validación empírica.
- Licencia compuesta: aunque las contribuciones propias son Apache 2.0, el paquete incluye material derivado de Kimi sujeto a la Kimi K3 License, cuyas condiciones se aplican a la redistribución y al uso del paquete combinado. Es imprescindible revisar el archivo LICENSE antes de uso comercial.
- Requiere `trust_remote_code`: la carga implica ejecutar código personalizado del repositorio, lo que añade superficie de riesgo en entornos de producción.
- Riesgo de alucinación: como modelo generativo de coordenadas, puede producir localizaciones plausibles pero incorrectas en escenas ambiguas u objetos ausentes; se recomienda umbral de confianza y validación posterior.
- Sesgos: no documentados por el autor; al entrenarse presumiblemente con datos web, pueden heredarse sesgos de representación geográfica y cultural.
- Este repositorio es una copia preservada por un tercero (`hellnahbru`), no el repositorio oficial; conviene verificar integridad de pesos frente al original de GroundingPI.
- No se documentan cuantizaciones oficiales ni recetas de despliegue para esta variante, lo que puede complicar el despliegue en hardware limitado.

## Enlaces

- Repositorio Hugging Face (copia preservada): https://huggingface.co/hellnahbru/GroundAnything-VLM-preserved-20261029
- Repositorio oficial GroundAnything-VLM: https://huggingface.co/GroundingPI/GroundAnything-VLM
- Repositorio oficial GroundAnything (DLM): https://huggingface.co/GroundingPI/GroundAnything
- ModelScope (DLM): https://www.modelscope.ai/models/GroundingPI/GroundAnything
- ModelScope (VLM): https://www.modelscope.ai/models/GroundingPI/GroundAnything-VLM
- Demo online: https://huggingface.co/spaces/GroundingPI/GroundAnything-VLM
- Página del proyecto: https://groundingpi.github.io/groundanything/
- Código en GitHub: https://github.com/groundingpi/GroundAnything
- Paper: https://arxiv.org/abs/2609.39600
- HF Papers: https://huggingface.co/papers/2609.39600
