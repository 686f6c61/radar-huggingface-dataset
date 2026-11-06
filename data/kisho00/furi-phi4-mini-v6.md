# Kisho00/furi-phi4-mini-v6

## Resumen

Furi es un fine-tune experimental del modelo Phi-4-mini-instruct de Microsoft, desarrollado por el usuario Kisho00 y publicado en Hugging Face. Está especializado en atención y cuidado de perros y gatos, con el objetivo de servir como base para un chatbot de temática veterinaria doméstica. El modelo se distribuye con pesos en formato safetensors y un total de 3.836.021.760 parámetros, lo que lo sitúa en la categoría de modelos pequeños (aproximadamente 3,8 mil millones de parámetros).

El entrenamiento se realizó mediante QLoRA sobre el modelo base Phi-4-mini-instruct, una arquitectura transformer de tipo phi3 con soporte de contexto largo y capacidades de razonamiento e instrucción. Al ser un fine-tune ligero, hereda las capacidades generales del modelo base y añade una especialización en el dominio del cuidado de mascotas. El autor lo etiqueta explícitamente como "experimental" y "test model only", lo que indica que no está pensado para producción.

La relevancia de este modelo es limitada: se trata de un experimento personal sin descargas ni validación pública, sin licencia declarada y sin benchmarks publicados. Resulta útil como ejemplo de fine-tuning de dominio con QLoRA sobre Phi-4-mini, pero no como una opción recomendable para despliegues reales sin una evaluación adicional por parte del equipo que lo adopte.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (tipo phi3), fine-tune del modelo base microsoft/Phi-4-mini-instruct |
| Parámetros totales | 3.836.021.760 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base, no confirmada) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Phi-4-mini-instruct, un transformer decoder-only de la familia phi3 con aproximadamente 3,8 mil millones de parámetros. Sobre esa base, el autor aplicó un fine-tune con QLoRA (cuantización de bajo rango con adaptadores LoRA), una técnica que congela los pesos originales y entrena adaptadores de baja dimensionalidad, reduciendo los requisitos de memoria durante el ajuste. Los detalles concretos del dataset de entrenamiento (número de tokens, composición, proporción de ejemplos veterinarios frente a ejemplos generales) no están documentados en la model card.

No se especifica si hubo fases de RLHF, DPO o ajuste por preferencias tras el fine-tune supervisado. Tampoco se documentan innovaciones técnicas propias más allá del uso de QLoRA. El modelo conserva las etiquetas `custom_code` y `phi3`, lo que implica que su carga requiere confiar en código remoto o en la implementación de referencia de la familia phi3 en Transformers.

## Capacidades

- Generación de texto conversacional orientada a un chatbot de cuidado de perros y gatos.
- Respuestas de información general sobre salud y cuidados de mascotas, con aviso explícito de que no sustituyen el diagnóstico veterinario.
- Hereda del modelo base las capacidades generales de instrucción, razonamiento y generación de texto, aunque no están validadas tras el fine-tune.
- Soporte de tool calling o function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- Prototipo de chatbot de cuidado de mascotas: el modelo puede generar respuestas conversacionales sobre alimentación, higiene y cuidados básicos de perros y gatos, aprovechando el fine-tune de dominio. Adecuado únicamente como prototipo y con revisión humana.
- Asistente de triaje informativo no clínico: puede ofrecer información general sobre síntomas comunes y recomendar acudir al veterinario, siempre con el aviso legal correspondiente y sin emitir diagnósticos.
- Base para experimentación con QLoRA: sirve como referencia para equipos que quieran replicar un fine-tune de dominio sobre Phi-4-mini con adaptadores LoRA y comparar resultados.
- Generación de contenido divulgativo para refugios o protectoras: redacción de fichas y consejos de cuidado a partir de plantillas, con revisión editorial posterior.
- Evaluación de alucinación en dominios sensibles: útil como caso de estudio para medir cómo un fine-tune ligero afecta a la fiabilidad en un dominio donde los errores tienen consecuencias (salud animal).
- Integración en pipelines de investigación: como checkpoint intermedio para estudiar el efecto del fine-tune de dominio sobre las capacidades generales del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 7,7 GB solo para pesos, más overhead de activaciones y caché KV (en torno a 9-11 GB en la práctica según longitud de contexto y batch).
- VRAM estimada en cuantización de 8 bits: alrededor de 4-5 GB; en 4 bits, alrededor de 2,5-3,5 GB (estimaciones a partir del número de parámetros, no verificadas para este checkpoint).
- GPU recomendadas: A100, H100 o L40S para despliegues con concurrencia; RTX 4090, RTX 3090 o RTX 4080 para inferencia individual en precisión completa.
- Cabe en GPU de consumidor: sí, en tarjetas con 8-12 GB o más si se cuantiza; en FP16 requiere al menos 12 GB para trabajar con comodidad.
- Opciones de despliegue: Transformers con la implementación de phi3, vLLM y TGI para serving; llama.cpp y Ollama si se generan conversiones GGUF (no publicadas por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kisho00/furi-phi4-mini-v6 | 3,84 B | no disponible | no disponible | Hugging Face, 0 descargas | Fine-tune QLoRA de dominio, experimental |
| microsoft/Phi-4-mini-instruct | ~3,8 B | no disponible en esta ficha | MIT (según el modelo base original) | Hugging Face, ampliamente descargado | Modelo base, instrucción general |
| Qwen2.5-3B-Instruct | ~3,1 B | 32.768 tokens (según el modelo original) | Apache 2.0 (según el modelo original) | Hugging Face | Alternativa generalista de tamaño similar |
| Llama-3.2-3B-Instruct | ~3,2 B | 128.000 tokens (según el modelo original) | Llama 3.2 Community License | Hugging Face | Alternativa generalista con contexto largo |

Las especificaciones de los modelos comparables provienen de sus fichas oficiales y deben verificarse antes de tomar decisiones; los datos de Furi no permiten una comparación de rendimiento al no haber benchmarks publicados.

## Limitaciones y advertencias

- Modelo explícitamente marcado como experimental y "test model only" por el autor; no apto para producción sin evaluación adicional.
- Riesgo elevado de alucinación en un dominio sensible: las respuestas sobre salud animal pueden ser incorrectas y el propio autor advierte que no son diagnósticos ni sustituyen al veterinario.
- Licencia no declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor o verificar la licencia del modelo base antes de cualquier despliegue.
- Idiomas soportados no documentados; el comportamiento en castellano no está verificado.
- Longitud de contexto no confirmada para este checkpoint.
- Sin descargas ni validación comunitaria: no hay evidencia externa de calidad.
- Requiere `trust_remote_code` o la implementación de phi3 para cargarse, lo que introduce dependencia de código remoto.
- Sesgos conocidos: no documentados; hereda los sesgos del modelo base y del dataset de fine-tune, que no se describe.

## Enlaces

- Hugging Face: https://huggingface.co/Kisho00/furi-phi4-mini-v6
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
