# KETI-AIR/Qwen3.5-KETI-HAECHI-27B

## Resumen

Qwen3.5-KETI-HAECHI-27B es un modelo multimodal derivado de Qwen/Qwen3.5-27B, desarrollado por KETI-AIR con el objetivo de mejorar la comprensión del patrimonio cultural coreano y el OCR de texto coreano, así como las capacidades de tool calling y ejecución de agentes de largo horizonte. El modelo se presenta como un finetune del checkpoint base y conserva las capacidades generales multimodales, de lenguaje y de codificación del modelo original.

Con 27.356.728.560 parámetros, el modelo está diseñado para tareas que combinan imagen y texto, con especial énfasis en la identificación de nombres oficiales de objetos patrimoniales, la lectura de texto coreano en señales, escenas, documentos públicos y texto renderizado, y la ejecución de tareas que requieren mantener estado a lo largo de varios turnos de conversación. Su relevancia actual radica en la combinación de especialización cultural y habilidades de agente, lo que lo hace útil para aplicaciones de digitalización de patrimonio, asistentes turísticos y automatización de flujos de trabajo en coreano.

La arquitectura es la de Qwen3.5, un transformer multimodal con soporte de visión y lenguaje. No se especifica la longitud de contexto en la información disponible. El modelo está liberado bajo licencia Apache 2.0 y sus pesos se distribuyen en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer multimodal) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3.5-KETI-HAECHI-27B es un finetune del modelo base Qwen/Qwen3.5-27B. La arquitectura es la de un transformer multimodal de la familia Qwen3.5, que procesa entradas de imagen y texto de forma conjunta. El entrenamiento se ha orientado a dos objetivos principales: la comprensión del patrimonio cultural coreano y el OCR coreano, y la mejora del tool calling y la ejecución de tareas de largo horizonte con seguimiento de estado.

No se detallan en la información disponible ni el número de tokens de entrenamiento ni la composición exacta del dataset. Tampoco se menciona el uso de técnicas como RLHF o DPO. La innovación técnica destacable es la especialización del modelo en un dominio cultural concreto, manteniendo al mismo tiempo las capacidades generales del modelo base, incluyendo el modo de pensamiento (thinking mode) que se puede habilitar o deshabilitar mediante la plantilla de chat.

## Capacidades

- Interpretación conjunta de imágenes y texto, con razonamiento visual general más allá del dominio patrimonial.
- Reconocimiento de patrimonio cultural coreano: identifica los nombres oficiales de objetos patrimoniales a partir de imágenes.
- OCR coreano: lee texto en señales, escenas, texto renderizado y documentos públicos.
- Tool calling: selecciona y llama herramientas de forma autónoma.
- Ejecución de agentes de largo horizonte: mantiene información a través de múltiples turnos, rastrea cambios de estado y trabaja hacia un objetivo final.
- Seguimiento de instrucciones en coreano e inglés.
- Modo de pensamiento (thinking mode) habilitable para tareas que requieren razonamiento explícito.
- Conserva las capacidades de lenguaje y codificación del modelo base Qwen/Qwen3.5-27B.

## Casos de uso

- Catalogación de patrimonio cultural: el modelo puede identificar nombres oficiales de objetos patrimoniales en imágenes, lo que facilita la creación y actualización de bases de datos en museos y archivos coreanos.
- OCR de documentos administrativos: al leer texto coreano en documentos públicos escaneados, permite digitalizar expedientes, formularios y registros históricos de forma automatizada.
- Asistente turístico cultural: combinando visión y lenguaje, puede responder preguntas sobre monumentos y artefactos a partir de fotografías, ofreciendo información contextual en coreano o inglés.
- Automatización de flujos de trabajo con herramientas: gracias a su capacidad de tool calling y seguimiento de estado, puede encadenar llamadas a funciones en varios pasos, por ejemplo, para consultar bases de datos y generar informes.
- Investigación histórica: el análisis de fotografías de artefactos y documentos antiguos permite a los investigadores identificar piezas y extraer información textual sin intervención manual.
- Traducción de señalización urbana: al transcribir carteles y señales en coreano, el modelo puede ayudar a viajeros y residentes a entender el entorno, ya sea directamente o mediante una aplicación de traducción.
- Atención al cliente multimodal: en entornos de soporte, puede gestionar tickets que incluyen imágenes y texto en coreano, identificando el problema y proponiendo soluciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye comparaciones cualitativas con el modelo base Qwen/Qwen3.5-27B en tareas de reconocimiento de patrimonio cultural coreano y OCR coreano. En estos ejemplos, el finetune identifica correctamente nombres oficiales como "경주 첨성대" o "금동연가7년명여래입상", mientras que el modelo base comete errores. Sin embargo, no se proporcionan métricas numéricas ni tablas de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Dado el tamaño del modelo (27.356.728.560 parámetros), en bfloat16 los pesos ocupan aproximadamente 54,7 GB, por lo que se necesitan GPUs con al menos 60 GB de VRAM para inferencia sin cuantización.
- GPU recomendadas: A100 80GB o H100 80GB para precisión bfloat16. Para su uso en GPUs de consumo como una RTX 4090 (24 GB) sería necesaria una cuantización agresiva, aunque no se han publicado configuraciones oficiales.
- Opciones de despliegue: la model card utiliza transformers con AutoModelForMultimodalLM. También se ha detectado un endpoint en FriendliAI, lo que sugiere compatibilidad con plataformas de inferencia gestionada. No se confirma soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa completa con otros modelos de la misma categoría.

El único modelo comparable directamente es el checkpoint base Qwen/Qwen3.5-27B. Según las comparaciones cualitativas de la model card, el finetune KETI-HAECHI mejora significativamente en reconocimiento de patrimonio cultural coreano y OCR coreano, mientras que el modelo base falla en esos casos. No se conoce el rendimiento relativo en benchmarks generales.

## Limitaciones y advertencias

- Sesgos: no disponible.
- Riesgo de alucinación: no se menciona específicamente, pero es un riesgo inherente a los modelos de lenguaje y multimodal.
- Limitaciones de idioma: el modelo solo declara soporte para coreano e inglés, por lo que su rendimiento en otros idiomas no está garantizado.
- Longitud de contexto: no especificada.
- La model card indica que se requiere una versión concreta de transformers (commit c93057d4835cd31752bb56f59989dd27696eb45b) y torchvision para inicializar el procesador, lo que puede complicar la integración en entornos existentes.
- El modelo está especializado en patrimonio cultural coreano y OCR coreano; fuera de estos dominios, su rendimiento puede ser inferior al del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero es necesario cumplir sus términos, incluyendo la atribución y la inclusión de la licencia en las redistribuciones.

## Enlaces

- HuggingFace: https://huggingface.co/KETI-AIR/Qwen3.5-KETI-HAECHI-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Endpoint FriendliAI: https://friendli.ai/models/KETI-AIR/Qwen3.5-KETI-HAECHI-27B
