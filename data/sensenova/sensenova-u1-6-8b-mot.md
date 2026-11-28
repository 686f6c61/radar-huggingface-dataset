# sensenova/SenseNova-U1.6-8B-MoT

## Resumen

SenseNova-U1.6-8B-MoT es un modelo multimodal nativo de la familia SenseNova-U, desarrollado por SenseTime (organización `sensenova` en Hugging Face), construido sobre la arquitectura NEO-unify. A diferencia de los pipelines multimodales convencionales que encadenan un codificador visual, un LLM y un decodificador de difusión, este modelo unifica comprensión y generación de imágenes en una única ruta visual sin codificador (encoder-free) ni VAE (VAE-free), según la model card. La variante U1.6 se centra en estética, expresión creativa y autocorrección nativa mediante generación intercalada de texto e imagen.

El checkpoint publicado declara 8B en el nombre, pero los pesos en safetensors suman 17.532.854.464 parámetros (aproximadamente 17,5 mil millones), lo que sugiere que la nomenclatura "8B-MoT" hace referencia a una configuración Mixture-of-Transformers con dos torres o expertos de 8B, aunque la model card no detalla el desglose. El repositorio ocupa 35,1 GB en BF16 fragmentado.

Es relevante ahora porque propone una alternativa de pesos abiertos (Apache 2.0) a los modelos propietarios de generación y edición de imagen, con capacidades de autocorrección sobre el propio resultado generado (revisar un infográfico frente al prompt y corregir errores tipográficos) y variantes cuantizadas oficiales en GGUF, FP8 e INT8, además de LoRAs de 4 y 8 pasos para inferencia rápida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NEO-unify: multimodal nativo, encoder-free y VAE-free, con configuracion Mixture-of-Transformers (MoT) |
| Parametros totales | 17.532.854.464 (segun safetensors); la nomenclatura comercial indica "8B-MoT" |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 original; FP8 W8A8, INT8 ConvRot W8A8 (variante Native); GGUF Q4_0, Q6_K, Q8_0 (variante GGUF); LoRAs de 4 y 8 pasos |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 fragmentado); conversiones GGUF, FP8 e INT8 en repos separados |

## Arquitectura y entrenamiento

El modelo se basa en NEO-unify, la arquitectura presentada en el paper de SenseNova-U (arXiv:2605.12500) y desarrollada en U1.5 (arXiv:2609.11929). La innovación principal es la eliminación del codificador visual y del VAE: la ruta visual opera directamente sobre tokens de imagen, lo que permite que un mismo modelo comprenda una imagen, la genere, la edite y produzca respuestas que alternan texto e imagen de forma nativa. La designación MoT (Mixture-of-Transformers) apunta a una separación de expertos o torres dentro de un transformer unificado, aunque la model card no publica el número de expertos, la proporción de parámetros activos ni la distribución de capas.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. Sí documenta que U1.6 se entrenó con foco en estética (retratos, pósteres e ilustraciones), en la generación intercalada texto-imagen y en un bucle de autocorrección nativa: el modelo genera un infográfico, lo contrasta con el prompt y corrige errores de texto preservando tipografía y composición. Según el autor, la autocorrección aporta una mejora relativa media del 7 % en las tareas de infográficos densos de UltraTextBench frente a la generación de una sola pasada, y la calidad estética subjetiva mejora un 10 % respecto a U1.5.

## Capacidades

- Generación de texto a imagen (text-to-image) con estilos de retrato, ilustración y póster: pintura tradicional china, tinta, mural, grabado, ukiyo-e, óleo, pastel, lápiz de color, anime, 2.5D/3D, gótico, collage y estética de cámara CCD o instantánea.
- Edición de imagen (image-to-image) y generación condicionada por imagen y texto (image-text-to-image).
- Comprensión de imágenes y extracción de características (`feature-extraction`).
- Generación intercalada de texto e imagen en una misma respuesta.
- Autocorrección nativa: revisión del propio resultado frente al prompt y reparación de texto en infográficos.
- Generación de infográficos con texto denso, con mejora declarada del 7 % en UltraTextBench mediante autocorrección.
- Soporte de LoRAs de 4 y 8 pasos para reducir el coste de muestreo.
- Capacidades multilingües limitadas a inglés y chino.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso general: no disponible; el único bucle multi-paso documentado es la autocorrección de imagen.

## Casos de uso

- Generación de pósteres y material promocional: el modelo está ajustado específicamente para pósteres ilustrados, conceptuales y de producto, con estilos grafiti, collage, retro, plano y cómic, lo que permite producir variantes de campaña a partir de un prompt textual sin pipeline de difusión externo.
- Infográficos con texto denso: el bucle de autocorrección genera el infográfico, lo compara con el prompt y corrige erratas preservando la maquetación, lo que reduce la revisión manual en contenidos educativos y de marketing.
- Edición de imágenes existentes: la ruta image-to-image permite modificar composición, estilo o iluminación de una fotografía manteniendo coherencia espacial, útil en retoque editorial y previsualización de producto.
- Ilustración editorial y de concepto: los estilos de tinta, ukiyo-e, grabado y acuarela cubren encargos de ilustración tradicional digitalizada con una sola llamada al modelo.
- Retrato con estética fotográfica: admite primeros planos, luz cinematográfica, desenfoque de movimiento, blanco y negro y looks de cámara analógica, aplicable a pruebas de casting visuales o moodboards.
- Extracción de características visuales: la tarea `feature-extraction` permite reutilizar las representaciones internas del modelo para búsqueda por similitud o clasificación sobre imágenes, sin necesidad de un codificador separado.
- Prototipado rápido con LoRAs de 4 pasos: en entornos de diseño iterativo, la variante LoRA de 4 pasos reduce el número de evaluaciones del transformer por imagen, lo que abarata la exploración de variantes.

## Benchmarks y rendimiento

La model card solo reporta métricas relativas internas, sin valores absolutos ni comparación numérica con modelos de terceros:

| Metrica | Resultado reportado | Referencia |
|---|---|---|
| Calidad estetica subjetiva (evaluacion de usuarios) | +10 % | frente a SenseNova-U1.5 |
| Precision de texto en infograficos densos (UltraTextBench) | +7 % relativo de media | autocorreccion frente a generacion en una sola pasada |

No se han publicado resultados absolutos de MMLU, HumanEval, GSM8K, GenEval, DPG-Bench ni de otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: los 17,53 mil millones de parámetros requieren aproximadamente 35 GB solo para pesos, más activaciones y caché; en la práctica, 40-48 GB de VRAM para inferencia cómoda.
- VRAM estimada en FP8/INT8 (W8A8): alrededor de 17,5 GB para pesos, con margen para activaciones en GPUs de 24 GB.
- VRAM estimada en GGUF: Q8_0 en torno a 18-19 GB; Q6_K en torno a 14-15 GB; Q4_0 en torno a 10-11 GB, lo que permite ejecución en GPUs de consumo de 12-16 GB.
- GPU recomendadas: A100 80 GB o H100 para BF16 sin compromisos; L40S o A6000 (48 GB) para BF16 ajustado; RTX 4090 (24 GB) viable con FP8/INT8 o GGUF Q6_K/Q8_0.
- Cabe en GPU de consumo: sí, con cuantización GGUF Q4_0 en GPUs de 12 GB o superiores; en RTX 4090 con FP8 o GGUF de alta precisión.
- Opciones de despliegue: `transformers` (librería declarada, con `custom_code`), llama.cpp u otros runners GGUF para las conversiones Q4_0/Q6_K/Q8_0, y el ecosistema ComfyUI documentado para las LoRAs. Soporte de vLLM o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponibles. La existencia de LoRAs de 4 y 8 pasos indica que el muestreo estándar requiere más pasos que esas cifras, pero no se publican tiempos por imagen ni imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| SenseNova-U1.6-8B-MoT | 17,53 B (nominal 8B-MoT) | no disponible | Apache 2.0 | safetensors, GGUF, FP8, INT8 | Multimodal nativo encoder-free y VAE-free, autocorreccion de imagen |
| SenseNova-U1.5-8B-MoT | no disponible | no disponible | Apache 2.0 (presumible, misma familia) | safetensors | Generacion previa de la misma familia; U1.6 declara +10 % estetico |
| SenseNova-U1 | no disponible | no disponible | no disponible | no disponible | Paper fundacional de la arquitectura NEO-unify (arXiv:2605.12500) |
| Alternativas de terceros (FLUX, SD3.5, Qwen-Image) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | No se aportan datos comparativos en la documentacion consultada |

## Limitaciones y advertencias

- Idiomas: solo inglés y chino declarados; el rendimiento en castellano no está documentado y no debería asumirse.
- Sesgos: no se publica ninguna evaluación de sesgos demográficos, culturales o de representación; los estilos promocionados están fuertemente centrados en estética china y occidental.
- Alucinación visual: la autocorrección mitiga errores de texto en infográficos, pero no garantiza fidelidad semántica al prompt en escenas complejas; la model card no reporta tasas de fallo.
- Ambigüedad de parámetros: el nombre comercial "8B-MoT" no coincide con los 17,53 B de safetensors; conviene verificar el desglose real antes de dimensionar infraestructura.
- Contexto: la longitud de contexto no está publicada, lo que impide planificar conversaciones multi-turno largas o prompts con muchas imágenes de referencia.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo incluye `custom_code` en el repositorio, por lo que es necesario revisar ese código y los términos de las dependencias antes de desplegar en producción.
- Producción: no hay datos publicados de latencia, throughput ni soporte en motores de serving de alto rendimiento (vLLM, TGI), lo que añade riesgo a un despliegue a escala.
- Fecha de creación del repositorio (2026-11-16) y papers referenciados con identificadores arXiv de 2026: verificar la vigencia de los enlaces antes de citarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sensenova/SenseNova-U1.6-8B-MoT
- LoRAs de 4 y 8 pasos: https://huggingface.co/sensenova/SenseNova-U1.6-8B-MoT-LoRAs
- Conversiones BF16/FP8/INT8: https://huggingface.co/sensenova/SenseNova-U1.6-8B-MoT-Native
- Conversiones GGUF: https://huggingface.co/sensenova/SenseNova-U1.6-8B-MoT-GGUF
- Repositorio GitHub: https://github.com/OpenSenseNova/SenseNova-U1
- Paper SenseNova-U1.5: https://arxiv.org/abs/2609.11929
- Paper SenseNova-U1: https://arxiv.org/abs/2605.12500
- Blog de arquitectura NEO-unify: https://huggingface.co/blog/sensenova/neo-unify
- Colección SenseNova-U1.6 en Hugging Face: https://huggingface.co/collections/sensenova/sensenova-u16
- Modelo en ModelScope: https://modelscope.cn/models/SenseNova/SenseNova-U1.6-8B-MoT
- Demo: https://unify.light-ai.top/
- Ejemplos y prompts (showcases): https://github.com/OpenSenseNova/SenseNova-U1/blob/main/docs/u1.6_showcases.md
- Dataset de showcases: https://huggingface.co/datasets/sensenova/SenseNova-U-showcases
- Discord: https://discord.com/invite/BuTXPHmQub
- Licencia: https://huggingface.co/sensenova/SenseNova-U1.6-8B-MoT/blob/main/LICENSE
