# sensenova/SenseNova-U1.5-8B-MoT

## Resumen

SenseNova-U1.5-8B-MoT es un checkpoint multimodal nativo desarrollado por SenseNova (OpenSenseNova) orientado a generación y edición de imágenes de alta fidelidad, con capacidad any-to-any. Se construye sobre la arquitectura NEO-unify y se distribuye con licencia Apache 2.0, lo que lo hace atractivo para integración en producto y experimentación académica sin fricciones legales. El modelo se publica en Hugging Face con 3.755 descargas y 282 likes en el momento de la consulta.

El nombre comercial indica "8B", pero el recuento real de parámetros en los safetensors es de 17.532.854.464 (aproximadamente 17,5 mil millones), un dato relevante a la hora de planificar VRAM y despliegue. El repositorio ocupa 85,3 GB, lo que sugiere pesos en alta precisión y posiblemente componentes adicionales (tokenizadores visuales, decodificadores, etc.).

La propuesta de valor se centra en seis mejoras visibles respecto a la versión anterior: calidad de generación, renderizado de texto en chino e inglés, generación nativa 4K, edición de imagen más fiable, seguimiento de instrucciones complejas y control visual preciso mediante bounding boxes y referencias múltiples. Existe una variante derivada, SenseNova-U1.5-8B-MoT-TailSteer, que mejora la estabilidad en edición multi-turno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NEO-unify (multimodal nativa unificada) |
| Parametros totales | 17.532.854.464 (aprox. 17,5 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | any-to-any |
| Tamano del repositorio | 85,3 GB |
| Requiere codigo personalizado | si (custom_code) |

## Arquitectura y entrenamiento

El modelo se basa en NEO-unify, una arquitectura multimodal nativa unificada que integra procesamiento de texto e imagen en un mismo espacio de representación. La model card menciona explícitamente la mejora de las capas de patchify, lo que indica que la tokenización visual se realiza mediante parches y que estas capas han sido reforzadas en esta versión. No se detalla en la información disponible si se trata de un transformer denso, un MoE o una arquitectura híbrida; el sufijo "MoT" del nombre podría sugerir Mixture-of-Transformers, pero no se confirma en la documentación proporcionada.

En cuanto al entrenamiento, la model card cita mejoras en calidad y distribución de datos, formulación de tareas, mejora de prompts y pipeline de post-entrenamiento, sin especificar el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal. Toda esta información debe considerarse no disponible a partir de los datos suministrados.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con soporte de resoluciones nativas hasta 4K (el ejemplo de la model card usa 2048x2048).
- Edición de imágenes: edición local, edición de texto, edición multi-referencia, inserción y reemplazo de objetos.
- Preservación de identidad del sujeto y del contenido no editado en tareas de edición.
- Renderizado de texto en chino e inglés dentro de imágenes, orientado a pósters, infografías y materiales de marca.
- Seguimiento de instrucciones complejas con múltiples restricciones simultáneas (recuento de objetos, relaciones espaciales, layouts, estilos).
- Control visual preciso mediante bounding boxes, marcadores visuales y referencias de una o varias imágenes.
- Capacidad any-to-any declarada en el pipeline, lo que implica entrada y salida en múltiples modalidades.
- Extracción de características (tag feature-extraction).
- Soporte de conversación multimodal (tag neo_chat).
- Idiomas: inglés y chino.

## Casos de uso

- Generación de material de marketing: creación de pósters, banners e infografías con texto legible en chino e inglés, aprovechando la mejora específica en renderizado tipográfico y jerarquía visual.
- Edición de producto en e-commerce: sustitución de fondos, cambio de color de prendas o inserción de objetos preservando la identidad del modelo y la iluminación original, gracias a la capacidad de edición local con preservación de contenido no editado.
- Composición multi-referencia: combinación de objetos de varias imágenes de referencia sin reconstruir la escena completa, útil en catálogos y diseño de interiores.
- Generación nativa en 4K: producción de assets de alta resolución para impresión o pantallas de gran formato con estructura global coherente y eficiencia mejorada.
- Control creativo por regiones: uso de bounding boxes y marcadores visuales para dirigir la composición en flujos de diseño asistido, donde el diseñador define zonas y el modelo rellena el contenido.
- Edición iterativa conversacional: flujos de refinamiento sucesivo sobre una misma imagen; para escenarios de muchas iteraciones se recomienda evaluar la variante TailSteer, diseñada para estabilidad multi-turno.
- Automatización de pipelines creativos: integración vía `transformers` con código personalizado en entornos Python 3.11, PyTorch 2.8 y CUDA 12.8 para generación por lotes.

## Benchmarks y rendimiento

La model card incluye gráficas de benchmarks (radial y combinada) alojadas como imágenes en el repositorio de GitHub, pero no se proporcionan los valores numéricos en el texto disponible. Por tanto, no se han publicado resultados de benchmarks en formato tabular en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un checkpoint de ~17,5 B parámetros en FP16 requiere del orden de 35 GB solo para pesos, más overhead de activaciones y del pipeline multimodal; en BF16/FP16 no cabe en GPUs de consumo de 24 GB.
- GPU recomendadas: no especificadas por el autor. Por tamaño, un despliegue en FP16 requiere GPUs de 40-80 GB (A100 40/80 GB, H100). El ejemplo oficial usa `--device_map auto`, lo que permite reparto entre varias GPUs.
- Cabe en consumer GPU: no en FP16 con el conjunto completo de pesos; requeriría cuantización, cuya disponibilidad no se documenta.
- Opciones de despliegue: la referencia oficial es el repositorio GitHub de SenseNova-U1 con `uv`, Python 3.11, PyTorch 2.8 y CUDA 12.8, más FlashAttention opcional. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Modalidad | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-U1.5-8B-MoT | ~17,5 B (segun safetensors) | no disponible | Apache 2.0 | any-to-any (texto/imagen) | Hugging Face, ModelScope, GitHub |
| SenseNova-U1.5-8B-MoT-TailSteer | no disponible | no disponible | no disponible | edicion multi-turno mejorada | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de otros autores en los datos proporcionados; la comparativa se limita a la variante TailSteer del mismo autor.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Sesgos: no se documentan sesgos conocidos, pero al ser un modelo generativo de imágenes entrenado con datos no especificados, puede reproducir sesgos de representación y estereotipos.
- Alucinación visual: como modelo generativo, puede producir contenido incoherente, texto mal renderizado o artefactos, especialmente en resoluciones altas o instrucciones muy complejas.
- Contexto: la longitud de contexto no está publicada, lo que dificulta planificar conversaciones largas o edición multi-turno; para ello se sugiere la variante TailSteer.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las dependencias del repositorio (código personalizado, FlashAttention) y las licencias de los datasets de entrenamiento, no detalladas.
- Producción: requiere código personalizado (`custom_code`) y una pila concreta (Python 3.11, PyTorch 2.8, CUDA 12.8); no hay soporte documentado en motores de inferencia estándar como vLLM u Ollama.
- Tamaño real: el nombre comercial "8B" no coincide con los ~17,5 B parámetros reales, lo que puede llevar a subestimar los requisitos de hardware.

## Enlaces

- Hugging Face: https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT
- Variante TailSteer: https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT-TailSteer
- Repositorio GitHub: https://github.com/OpenSenseNova/SenseNova-U1
- Rama U1.5 del repositorio: https://github.com/OpenSenseNova/SenseNova-U1/tree/refs/heads/feat/u1.5
- Blog de arquitectura NEO-unify: https://huggingface.co/blog/sensenova/neo-unify
- Coleccion U1.5 en Hugging Face: https://huggingface.co/collections/sensenova/sensenova-u15
- ModelScope: https://modelscope.cn/models/SenseNova/SenseNova-U1.5-8B-MoT
- Demo: https://unify.light-ai.top/
- Guia de instalacion: https://github.com/OpenSenseNova/SenseNova-U1/blob/refs/heads/feat/u1.5/docs/installation.md
- Ejemplos de inferencia: https://github.com/OpenSenseNova/SenseNova-U1/blob/refs/heads/feat/u1.5/examples/README.md
- Paper 1 (arXiv 2605.12500): https://arxiv.org/abs/2605.12500
- Paper 2 (arXiv 2609.11929): https://arxiv.org/abs/2609.11929
