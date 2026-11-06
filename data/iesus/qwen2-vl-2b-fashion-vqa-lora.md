# Iesus/qwen2-vl-2b-fashion-vqa-lora

## Resumen

El modelo `Iesus/qwen2-vl-2b-fashion-vqa-lora` es un adaptador LoRA sobre el modelo base multimodal `Qwen/Qwen2-VL-2B-Instruct`, desarrollado por el usuario Iesus. Resuelve un problema muy concreto: responder preguntas de catálogo sobre imágenes de productos de moda (color, tipo de artículo, categoría, género, uso, temporada y comprobaciones sí/no), así como generar descripciones cortas de producto. Es relevante porque demuestra que un ajuste fino ligero (LoRA) sobre un VLM pequeño de 2B parámetros puede elevar drásticamente la precisión en un dominio vertical: el exact match global pasa de 0,523 en zero-shot a 0,900 tras el ajuste.

El adaptador se entrenó sobre el Fashion Product Images dataset y emplea una configuración LoRA de rango 16 y alpha 32 aplicada a las capas lineales del LLM. El repositorio ocupa solo 0,1 GB, lo que refleja que únicamente se distribuyen los pesos del adaptador, no el modelo base completo. La licencia es Apache 2.0, heredada del modelo base.

Al ser un adaptador PEFT, su uso requiere descargar por separado el modelo base Qwen2-VL-2B-Instruct y cargarlo junto con el adaptador mediante `peft`. No es un modelo autónomo: es una especialización de bajo coste pensada para pipelines de catalogación de moda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16, alpha=32) sobre Qwen2-VL-2B-Instruct (transformer multimodal vision-language) |
| Parametros totales | No disponible (el adaptador ocupa 0,1 GB; el modelo base Qwen2-VL-2B-Instruct tiene 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2-VL-2B-Instruct, un modelo vision-language de tipo transformer que procesa pares imagen-texto. El ajuste fino emplea LoRA con rango 16 y alpha 32, inyectado únicamente en las capas lineales del LLM (no se especifica ajuste del encoder visual). El procesador se configura con `min_pixels=25088` y `max_pixels=153664`, lo que limita la resolución de entrada de las imágenes.

El entrenamiento se realizó sobre el Fashion Product Images dataset, con un system prompt fijo orientado a respuestas cortas y exactas usando el vocabulario del catálogo. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación principal es la especialización de dominio mediante un adaptador de bajo coste que multiplica la precisión en tareas de catalogación.

## Capacidades

- Respuesta a preguntas visuales (VQA) sobre imágenes de productos de moda: color base, tipo de artículo, categoría principal y secundaria, género, uso y temporada.
- Comprobaciones de tipo sí/no sobre atributos del producto (por ejemplo, verificación de color o de tipo de artículo).
- Generación de descripciones cortas de producto a partir de la imagen.
- Procesamiento multimodal imagen-texto en modo conversacional (pipeline `image-text-to-text`).
- Especialización en vocabulario de catálogo de moda, lo que reduce respuestas fuera de dominio.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, audio ni modo thinking.

## Casos de uso

- Catalogación automática de productos de moda: el adaptador responde preguntas estructuradas sobre cada imagen (categoría, género, uso, temporada) con alta precisión, lo que permite poblar fichas de catálogo sin intervención manual.
- Enriquecimiento de fichas de e-commerce: dado un conjunto de imágenes de producto, el modelo genera atributos y descripciones cortas que se incorporan directamente a la base de datos del catálogo.
- Control de calidad de catálogo: las comprobaciones sí/no permiten validar si los atributos declarados por un proveedor coinciden con lo que muestra la imagen (por ejemplo, verificar el color o el tipo de artículo).
- Moderación y clasificación de inventario: clasificar artículos por categoría principal y secundaria para organizar el almacén o los listados de una tienda.
- Generación de metadatos para motores de búsqueda: producir descripciones y etiquetas consistentes que mejoren la búsqueda y el filtrado en plataformas de moda.
- Asistente interno para equipos de merchandising: consultas rápidas sobre imágenes de producto con respuestas en vocabulario controlado, útil para formación o auditoría de catálogo.
- Prototipado de bajo coste: al ser un adaptador de 0,1 GB sobre un VLM de 2B, permite experimentar con VQA de dominio sin infraestructura pesada.

## Benchmarks y rendimiento

Resultados de exact match en el conjunto de validación, según la model card:

| Tipo de pregunta | Zero-shot | Fine-tuned |
|---|---|---|
| masterCategory | 0,177 | 0,997 |
| yesno_type | 0,963 | 0,983 |
| yesno_color | 0,880 | 0,950 |
| subCategory | 0,237 | 0,943 |
| gender | 0,450 | 0,940 |
| usage | 0,324 | 0,926 |
| articleType | 0,130 | 0,863 |
| season | 0,167 | 0,683 |
| baseColour | 0,580 | 0,680 |
| **Global** | **0,523** | **0,900** |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un adaptador sobre un VLM de 2B, la inferencia requiere cargar el modelo base completo (el adaptador añade una sobrecarga mínima).
- GPU recomendadas: no especificadas en la información disponible; un VLM de 2B es compatible con GPUs de consumo, aunque no se detalla el modelo concreto.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo base, aunque no se confirma en la documentación.
- Opciones de despliegue: carga mediante `transformers` (`AutoModelForImageTextToText`) junto con `peft` (`PeftModel`), tal como indica la model card. No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Iesus/qwen2-vl-2b-fashion-vqa-lora | Adaptador sobre 2B | No disponible | Exact match 0,900 en validación de moda | Apache 2.0 | Hugging Face |
| Qwen/Qwen2-VL-2B-Instruct (base) | 2B | No disponible | Exact match 0,523 zero-shot en la misma tarea | Apache 2.0 | Hugging Face |
| Otros adaptadores VQA de moda | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa más relevante es con su modelo base sin ajustar, que obtiene 0,523 frente a 0,900 del adaptador. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere descargar y cargar el modelo base Qwen2-VL-2B-Instruct por separado.
- El rendimiento es desigual por atributo: la temporada (0,683) y el color base (0,680) son los puntos más débiles, con margen de mejora claro.
- Especializado exclusivamente en moda: fuera del dominio de catálogo de moda su rendimiento no está documentado y probablemente degrade.
- Riesgo de alucinación en atributos no presentes en la imagen o poco visibles, especialmente en temporada y color.
- No se documentan sesgos conocidos, pero al entrenarse sobre un dataset de productos de moda puede heredar sesgos de representación del mismo.
- Idiomas soportados no disponibles; el system prompt de entrenamiento está en inglés, lo que sugiere un sesgo hacia respuestas en inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset de entrenamiento.
- El repositorio tiene muy pocas descargas (16) y ningún like, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Iesus/qwen2-vl-2b-fashion-vqa-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios o demos.
