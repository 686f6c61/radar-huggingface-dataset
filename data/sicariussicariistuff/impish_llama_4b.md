# SicariusSicariiStuff/Impish_LLAMA_4B

## Resumen

Impish_LLAMA_4B es un ajuste fino (fine-tune) de tipo roleplay y escritura creativa desarrollado por SicariusSicariiStuff, construido sobre el modelo base nvidia/Llama-3.1-Minitron-4B-Width-Base. Con 4.512.746.496 parámetros reales, se presenta como la evolución de los anteriores Impish_LLAMA_3B y Fiendish_LLAMA_3B del mismo autor, y está orientado principalmente a narrativa interactiva, aventuras conversacionales y, de forma secundaria, a tareas de asistente general.

El modelo se entrena sobre el dataset propio UBW_Tapestries con aproximadamente 400 millones de tokens, combinando datos de roleplay con una proporción significativa de datos de asistente general para mitigar la degradación de inteligencia que sufre este tipo de ajustes. Una retrainación posterior (julio de 2025) añadió 200 millones de tokens y migró el formato de plantilla a ChatML, corrigiendo problemas de generación infinita reportados en varias interfaces.

Su relevancia radica en el segmento de modelos de 4B parámetros capaces de mantener coherencia narrativa en contextos largos, un tamaño que permite despliegue en hardware de consumo. La licencia es la NVIDIA Open Model License, heredada del modelo base, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.1, variante Minitron con pruning de anchura) |
| Parametros totales | 4.512.746.496 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128K, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | no disponible en la model card; el repo incluye safetensors en precision completa |
| Idiomas soportados | en (ingles) |
| Licencia | nvidia-open-model-license (etiquetada como "other" en HuggingFace) |
| Formato de pesos | safetensors |
| Tamano del repo | 18,1 GB |
| Plantilla de chat | ChatML (desde la retrainacion del 16 de julio de 2025) |
| Dataset de entrenamiento | SicariusSicariiStuff/UBW_Tapestries |

## Arquitectura y entrenamiento

El modelo parte de nvidia/Llama-3.1-Minitron-4B-Width-Base, un modelo derivado de Llama 3.1 8B mediante técnicas de pruning de anchura (width pruning) y destilación de NVIDIA. Esta base no se comporta como un 8B comprimido convencional, sino que conserva parte de las capacidades del modelo mayor con la mitad de parámetros, lo que el autor señala como factor clave para mantener la inteligencia en un tamaño de 4B.

El ajuste fino se realizó sobre el dataset propietario UBW_Tapestries con aproximadamente 400 millones de tokens, con énfasis en roleplay y aventura pero incluyendo una proporción relevante de datos de asistente general para contrarrestar la pérdida de capacidades generales típica de los fine-tunes creativos. En la retrainación de julio de 2025 se añadieron 200 millones de tokens adicionales y se adoptó el formato ChatML, resolviendo problemas de generación descontrolada en varios front-ends. No se documentan detalles sobre uso de RLHF, DPO ni innovaciones arquitectónicas propias más allá de la base Minitron.

## Capacidades

- Generación de texto narrativo y escritura creativa de ficción, con coherencia en arcos argumentales largos.
- Roleplay multi-turno con seguimiento de personaje y contexto.
- Aventuras interactivas y narrativa ramificada.
- Capacidades de asistente general (hereda el entrenamiento de asistente incluido en el dataset).
- Formato de prompt ChatML para integración con front-ends estándar.
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Roleplay conversacional en plataformas de chat: el modelo mantiene personajes coherentes a lo largo de sesiones multi-turno gracias a su entrenamiento específico en UBW_Tapestries, lo que lo hace adecuado para aplicaciones de entretenimiento conversacional.
- Aventuras de texto interactivas: puede gestionar narrativa ramificada y recordar decisiones previas del jugador, funcionando como motor de historias en videojuegos de texto o bots de Discord.
- Escritura creativa asistida: generación de borradores de ficción, diálogos y descripciones con estilo consistente, útil para autores que necesitan un colaborador de bajo coste computacional.
- Despliegue en dispositivos móviles o hardware modesto: con 4,5B parámetros, es viable en GPUs de consumo y en algunos entornos móviles con cuantización, lo que permite asistentes narrativos offline.
- Chatbot de personaje para comunidades: integrable en plataformas tipo SillyTavern mediante ChatML, con ajustes recomendados documentados por el autor.
- Asistente general ligero: aunque no es su foco, conserva capacidades de asistente que permiten tareas de resumen, reescritura o respuesta a preguntas simples en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 9 GB para los pesos (4,5B parámetros × 2 bytes), más overhead de contexto y KV cache.
- VRAM estimada en cuantización de 8 bits: en torno a 4,5-5 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 2,5-3 GB.
- GPU recomendadas para FP16: RTX 3090, RTX 4090, A100, H100.
- GPU de consumo: cabe en RTX 3060 de 12 GB, RTX 4070, RTX 4080 y RTX 4090 en FP16; en cuantización 4-bit puede ejecutarse en GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI y front-ends compatibles con ChatML (SillyTavern, entre otros).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Impish_LLAMA_4B | 4,51B | no disponible | nvidia-open-model-license | Roleplay y escritura creativa |
| Impish_LLAMA_3B | ~3B | no disponible | no disponible | Roleplay (modelo previo del mismo autor) |
| Fiendish_LLAMA_3B | ~3B | no disponible | no disponible | Roleplay (variante alternativa del mismo autor) |
| nvidia/Llama-3.1-Minitron-4B-Width-Base | ~4B | 128K (heredado de Llama 3.1) | nvidia-open-model-license | Modelo base generalista |

Los dos modelos de 3B del mismo autor son las alternativas más directas y el propio autor los describe como predecesores; Impish_LLAMA_4B se presenta como una mejora sustancial en capacidad de respuesta y conciencia de contexto. No se dispone de comparativas con modelos de roleplay de otros autores en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Al ser un fine-tune de roleplay, puede degradar capacidades de razonamiento general respecto al modelo base, aunque el autor incluyó datos de asistente para mitigarlo.
- Riesgo de alucinación inherente a modelos de 4B, especialmente en tareas factuales o de razonamiento complejo.
- El autor advierte explícitamente de que, pese a su competencia para el tamaño, sigue siendo un modelo de 4B y deben moderarse las expectativas.
- La licencia nvidia-open-model-license impone condiciones al uso comercial; es necesario revisar el acuerdo antes de desplegarlo en producción.
- El contexto máximo efectivo no está documentado en la model card; conviene validarlo empíricamente antes de usarlo en escenarios de contexto largo.
- La plantilla correcta es ChatML; usar otros formatos puede provocar generación descontrolada, problema que motivó la retrainación de julio de 2025.
- El modelo tiene un volumen de descargas bajo (91) y no cuenta con benchmarks publicados, lo que limita la validación independiente de su rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SicariusSicariiStuff/Impish_LLAMA_4B
- Modelo base: https://huggingface.co/nvidia/Llama-3.1-Minitron-4B-Width-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/SicariusSicariiStuff/UBW_Tapestries
- Modelo predecesor Impish_LLAMA_3B: https://huggingface.co/SicariusSicariiStuff/Impish_LLAMA_3B
- Modelo predecesor Fiendish_LLAMA_3B: https://huggingface.co/SicariusSicariiStuff/Fiendish_LLAMA_3B
- Modelo Nano_Imp_1B del mismo autor: https://huggingface.co/SicariusSicariiStuff/Nano_Imp_1B
- Licencia NVIDIA Open Model License: https://developer.download.nvidia.com/licenses/nvidia-open-model-license-agreement-june-2024.pdf
- Apoyo al autor (Ko-fi): https://ko-fi.com/sicarius
