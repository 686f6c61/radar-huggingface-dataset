# pavankumarpalla/FoodCraft-Llama-3.2-11B-Vision

## Resumen

FoodCraft-Llama-3.2-11B-Vision es un ajuste fino (fine-tuning) del modelo multimodal Llama-3.2-11B-Vision-Instruct de Meta, desarrollado por el usuario pavankumarpalla. El modelo parte de la versión Instruct publicada por Unsloth y se ha entrenado con Unsloth sobre un conjunto de 19.434 imagenes multimodales del dataset FoodCraft, orientadas al reconocimiento de platos, ingredientes, frutas, verduras y comidas indias. El resultado se distribuye como un modelo fusionado (merged) en precision de 16 bits.

El modelo resuelve una tarea vertical muy concreta: la conversion de imagen de alimentos en texto conversacional, es decir, image-text-to-text aplicado a gastronomia. Mantiene la arquitectura mllama del modelo base, con aproximadamente 10.670 millones de parametros totales segun los pesos en safetensors, y hereda las capacidades de vision y lenguaje del Llama-3.2-11B-Vision-Instruct original.

Su relevancia es limitada y de nicho: se publica como un experimento de ajuste fino sobre datos propios, con cero descargas y cero likes en el momento de la consulta, y sin documentacion de benchmarks ni de idiomas soportados. Resulta interesante como ejemplo de adaptacion de un modelo multimodal abierto a un dominio especifico mediante Unsloth, pero no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mllama (transformer multimodal, vision + lenguaje) |
| Parametros totales | 10.670.220.835 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo se publica como merged 16-bit; el modelo base admite cuantizaciones habituales) |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 21,4 GB |
| Modelo base | unsloth/Llama-3.2-11B-Vision-Instruct |
| Pipeline | image-text-to-text |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura mllama del Llama-3.2-11B-Vision-Instruct: un codificador de vision acoplado a un transformer de lenguaje, con capacidad de procesar imagenes y texto de forma conjunta y generar respuestas en formato conversacional. El ajuste fino se realizo con Unsloth, una libreria de entrenamiento optimizada en memoria y velocidad, y el resultado se fusiono en precision de 16 bits para su publicacion.

El entrenamiento se llevo a cabo sobre 19.434 imagenes multimodales del dataset FoodCraft, que cubre platos, ingredientes, frutas, verduras y comidas indias, con descripciones textuales asociadas. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO adicionales. Tampoco se documentan innovaciones tecnicas propias mas alla del uso de Unsloth para el ajuste.

## Capacidades

- Generacion de texto e imagen-a-texto: describe imagenes de alimentos, ingredientes, frutas, verduras y platos indios en formato conversacional.
- Reconocimiento de alimentos: identificacion de platos y componentes a partir de imagenes, segun el dominio del dataset de entrenamiento.
- Razonamiento multimodal basico: hereda las capacidades del Llama-3.2-11B-Vision-Instruct para tareas de vision y lenguaje.
- Conversacion multi-turno: el modelo base esta disenado para dialogos instructivos.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (modo thinking, audio): no disponibles; solo vision y texto.

## Casos de uso

- Descripcion automatica de platos en aplicaciones de recetas: el modelo recibe la foto de un plato y genera una descripcion textual de sus componentes, util para catalogos gastronomicos o apps de cocina.
- Etiquetado de imagenes en datasets de alimentacion: se puede usar para preanotar imagenes de ingredientes, frutas y verduras y acelerar la construccion de datasets supervisados.
- Asistencia a la nutricion: a partir de la imagen de una comida, el modelo puede generar una descripcion textual de los alimentos presentes que sirva de entrada a un sistema de estimacion nutricional.
- Catalogacion de menus de restaurantes indios: el ajuste sobre comidas indias permite describir platos tipicos y sus ingredientes en un contexto de digitalizacion de cartas.
- Educacion culinaria: generacion de explicaciones conversacionales sobre ingredientes y platos a partir de fotografias, como apoyo en cursos de cocina.
- Moderacion y control de calidad en plataformas de reparto: verificacion descriptiva de imagenes de platos subidas por usuarios o restaurantes, comparando la descripcion generada con la ficha del producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 21-22 GB solo para los pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 24 GB y, para comodidad, 40-48 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 11-12 GB para los pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 6-7 GB para los pesos, con overhead adicional.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o A6000 para 16 bits; RTX 4090 (24 GB) puede funcionar en 16 bits con margen ajustado o en 8 bits con holgura.
- GPU de consumo: cabe en RTX 4090 en 16 bits de forma justa y en 8/4 bits en GPUs de 12-16 GB como RTX 4080 o RTX 4070 Ti Super; en 4 bits podria caber en GPUs de 8-10 GB con limitaciones de contexto.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible), vLLM para mllama si la version lo soporta, llama.cpp/Ollama segun disponibilidad de soporte mllama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FoodCraft-Llama-3.2-11B-Vision | 10,67 B | no disponible | Si (mllama) | llama3.2 | Hugging Face |
| Llama-3.2-11B-Vision-Instruct (Meta/Unsloth) | 10,67 B | 128 K (segun documentacion de Meta para Llama 3.2 Vision) | Si | llama3.2 | Hugging Face |
| Llama-3.2-90B-Vision-Instruct | 90 B aprox. | 128 K (segun documentacion de Meta) | Si | llama3.2 | Hugging Face |
| Qwen2-VL-7B-Instruct | 7 B aprox. | 32 K nativo, extensible | Si | Apache 2.0 (segun publicacion de Qwen) | Hugging Face |

Nota: los datos de contexto y licencia de los modelos comparables provienen de su documentacion publica; los del modelo FoodCraft no estan disponibles en la informacion proporcionada. No se dispone de comparativas de rendimiento porque el modelo no publica benchmarks.

## Limitaciones y advertencias

- Dominio muy restringido: el ajuste fino se ha realizado exclusivamente sobre imagenes de alimentos, ingredientes y comidas indias; fuera de ese dominio el rendimiento puede degradarse respecto al modelo base.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora o degradacion frente al Llama-3.2-11B-Vision-Instruct original.
- Riesgo de alucinacion: como todo modelo generativo multimodal, puede describir ingredientes o platos inexistentes en la imagen, especialmente con imagenes ambiguas o de baja calidad.
- Sesgos conocidos: no documentados; el dataset FoodCraft esta centrado en comida india, lo que puede introducir sesgo hacia esa cocina y hacia sus formas de presentacion.
- Idiomas: no se especifican los idiomas soportados; se desconoce si el ajuste conserva el multilingueismo del modelo base.
- Contexto: no se documenta la longitud de contexto efectiva del ajuste.
- Licencia llama3.2: el uso comercial esta sujeto a la Llama 3.2 Community License, que impone condiciones (entre ellas, la denominacion "Built with Llama" y restricciones para entidades con mas de 700 millones de usuarios mensuales); debe revisarse antes de produccion.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin validacion externa; no se recomienda para produccion sin evaluacion propia.
- Formato: solo se publica el modelo fusionado en 16 bits; no se ofrecen versiones GGUF o cuantizadas en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pavankumarpalla/FoodCraft-Llama-3.2-11B-Vision
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-11B-Vision-Instruct
- Dataset referenciado: https://huggingface.co/datasets/pavankumarpalla/FoodCraft
- Unsloth: https://github.com/unslothai/unsloth
- Documentacion de Llama 3.2 Vision (Meta): https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/
