# pavankumarpalla/FoodCraft-Llama-3.2-11B-Vision-LoRA

## Resumen

FoodCraft-Llama-3.2-11B-Vision-LoRA es un adaptador LoRA publicado por el usuario pavankumarpalla sobre el modelo base unsloth/Llama-3.2-11B-Vision-Instruct. Se trata de un ajuste fino multimodal orientado al reconocimiento de alimentos: platos, ingredientes, frutas y verduras, y comidas indias, entrenado con 19.434 imágenes del conjunto de datos pavankumarpalla/FoodCraft. El repositorio contiene únicamente los pesos del adaptador (0,3 GB), no el modelo completo, por lo que requiere cargar el modelo base de 11B parámetros para funcionar.

El modelo hereda la arquitectura de Llama 3.2 Vision: un transformer multimodal con un codificador de visión acoplado a un decodificador de lenguaje de 11B parámetros, capaz de procesar entradas image-text-to-text. El ajuste se realizó con la librería Unsloth, orientada a entrenamiento eficiente en memoria, y el pipeline declarado es image-text-to-text con soporte conversacional.

Su relevancia es acotada: se publica como un experimento de fine-tuning de dominio específico (food recognition) con cero descargas y cero likes en el momento de la ficha, sin benchmarks publicados ni documentación técnica detallada. Resulta útil como ejemplo de adaptación de un VLM generalista a una tarea vertical concreta mediante LoRA, pero no como modelo de producción sin una evaluación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) heredada de Llama 3.2 Vision 11B; adaptador LoRA sobre el modelo base |
| Parametros totales | 11B en el modelo base (el adaptador LoRA añade un conjunto reducido de parámetros, no cuantificado en la información disponible) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Llama 3.2 Vision) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors del adaptador) |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre unsloth/Llama-3.2-11B-Vision-Instruct, un modelo de lenguaje y visión de 11B parámetros con arquitectura transformer y codificador visual, diseñado para tareas image-text-to-text. El fine-tuning se realizó con Unsloth, una librería que optimiza el entrenamiento de modelos grandes mediante kernels personalizados y reducción del uso de memoria, lo que permite ajustar modelos de este tamaño con recursos de GPU limitados. No se especifican en la información disponible los hiperparámetros del entrenamiento (rango del LoRA, alpha, tasa de aprendizaje, épocas) ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO.

El conjunto de datos de entrenamiento, pavankumarpalla/FoodCraft, consta de 19.434 imágenes de alimentos, ingredientes, frutas y verduras, y platos indios, con anotaciones textuales asociadas. El objetivo del ajuste es especializar el modelo base en la identificación y descripción de alimentos en imágenes. No se detalla la composición exacta del dataset, el número de tokens de entrenamiento ni la metodología de anotación. Tampoco se documentan innovaciones técnicas propias más allá del uso de Unsloth como framework de entrenamiento eficiente.

## Capacidades

- Generación de texto e imagen-texto: el modelo base es un VLM conversacional capaz de responder a preguntas sobre imágenes.
- Reconocimiento de alimentos: especializado mediante fine-tuning en la identificación de platos, ingredientes, frutas, verduras y comidas indias.
- Descripción de imágenes de comida: puede generar descripciones textuales de los alimentos presentes en una imagen.
- Conversación multimodal multi-turno: hereda la capacidad conversacional del modelo base Llama 3.2 Vision.
- Soporte de tool calling y function calling: no documentado en la información disponible para este adaptador (el modelo base lo soporta, pero el fine-tuning puede haber alterado esta capacidad).
- Soporte de agentes y razonamiento multi-paso: no documentado para este adaptador.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión, audio: visión sí (VLM); thinking y audio no documentados.

## Casos de uso

- Identificación de platos en aplicaciones de dietética: el modelo puede analizar la foto de un plato y devolver una descripción de sus componentes, útil para registrar comidas en apps de seguimiento nutricional, aprovechando su especialización en alimentos indios y occidentales.
- Etiquetado automático de imágenes en catálogos gastronómicos: permite generar metadatos descriptivos de recetas o productos alimenticios a partir de fotografías, reduciendo el trabajo manual en plataformas de recetas o marketplaces.
- Asistencia en cocina: un asistente conversacional que recibe una imagen de ingredientes disponibles y sugiere recetas o sustituciones, apoyándose en la capacidad multimodal del modelo base y el ajuste en ingredientes.
- Control de calidad en inventarios de frutas y verduras: clasificación y descripción de productos frescos en entornos de retail o logística alimentaria a partir de imágenes.
- Educación nutricional: generación de explicaciones sobre los alimentos mostrados en una imagen, útil en aplicaciones divulgativas o educativas.
- Moderación de contenido gastronómico en redes sociales: verificación de que las imágenes etiquetadas como comida corresponden realmente a alimentos, con descripciones automáticas para accesibilidad.
- Investigación en fine-tuning de VLMs: el adaptador sirve como referencia reproducible de cómo especializar Llama 3.2 Vision con Unsloth en un dominio vertical con un dataset de unas 19.000 imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia, el modelo base Llama 3.2 11B Vision requiere del orden de 22-24 GB en FP16, pero esta cifra no procede de la información del repositorio y debe verificarse con el modelo base.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: el repositorio declara compatibilidad con transformers y endpoints_compatible; no se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FoodCraft-Llama-3.2-11B-Vision-LoRA | 11B (base) + LoRA | no disponible | Reconocimiento de alimentos | llama3.2 | Hugging Face (0 descargas) |
| unsloth/Llama-3.2-11B-Vision-Instruct | 11B | no disponible en esta ficha | VLM generalista | llama3.2 | Hugging Face |
| Alternativas de food recognition | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre benchmarks ni sobre modelos comparables específicos de reconocimiento de alimentos en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; el dataset se centra en comida india y alimentos genéricos, lo que puede sesgar las respuestas hacia esas categorías.
- Riesgo de alucinación: inherente al modelo base Llama 3.2 Vision; el fine-tuning no elimina la posibilidad de descripciones incorrectas de alimentos.
- Limitaciones de contexto e idioma: no se especifican idiomas soportados ni longitud de contexto para este adaptador.
- Restricciones de licencia: licencia llama3.2, que impone condiciones de uso comercial y de redistribución; es necesario revisar los términos de la licencia Llama 3.2 antes de un uso en producción.
- Caveat de producción: el repositorio contiene solo el adaptador LoRA (0,3 GB), no el modelo completo; es imprescindible cargar el modelo base unsloth/Llama-3.2-11B-Vision-Instruct. No hay benchmarks, evaluación independiente ni documentación de hiperparámetros, y el modelo tiene cero descargas, por lo que su calidad no está validada por la comunidad.
- El fine-tuning puede haber degradado capacidades generales del modelo base (tool calling, razonamiento general) al especializarlo en un dominio concreto.

## Enlaces

- Hugging Face: https://huggingface.co/pavankumarpalla/FoodCraft-Llama-3.2-11B-Vision-LoRA
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-11B-Vision-Instruct
- Dataset: https://huggingface.co/datasets/pavankumarpalla/FoodCraft
- Unsloth: https://github.com/unslothai/unsloth
