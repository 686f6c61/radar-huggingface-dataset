# RaspizdAI/deglm-55M

## Resumen

deglm-55M es un modelo de lenguaje ligero desarrollado por el usuario RaspizdAI, publicado en Hugging Face con licencia MIT. Se trata de un modelo pequeño, con aproximadamente 55,6 millones de parámetros, orientado al idioma ruso. Su arquitectura parece seguir el estilo de los modelos tipo Llama, aunque la documentación no detalla todos los componentes internos. El modelo está pensado para tareas de generación de texto básicas, probablemente como experimento educativo o para entornos con recursos muy limitados.

La relevancia de este modelo reside en su tamaño reducido y su licencia permisiva, lo que permite su uso en investigación, prototipado rápido o como base para fine-tuning en ruso. Sin embargo, su ventana de contexto de solo 512 tokens y su escasa documentación limitan su aplicación en tareas complejas. Es un ejemplo de modelo minimalista que puede ejecutarse en hardware modesto, incluso en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo Llama, según etiqueta; no detallada) |
| Parametros totales | 55.591.424 (~55,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura no está descrita en detalle en la información proporcionada. La etiqueta "llama" sugiere un diseño basado en el transformer decoder de Llama, pero no se confirma. Las especificaciones técnicas indican 16 capas ocultas, 8 cabezas de atención con dimensión de cabeza 64, y una dimensión de embedding de 512. El vocabulario es de 8.192 tokens, un tamaño relativamente pequeño que limita la riqueza léxica pero reduce el coste computacional.

No se dispone de información sobre el proceso de entrenamiento: ni número de tokens, ni composición del dataset, ni uso de técnicas como RLHF o DPO. Tampoco se mencionan innovaciones técnicas particulares. Es probable que el modelo se haya entrenado desde cero con un corpus ruso, pero esto no está documentado.

## Capacidades

- Generación de texto en ruso: puede producir texto coherente en frases cortas, dado su tamaño y contexto limitado.
- Autocompletado de texto: útil para sugerir continuaciones de oraciones o párrafos breves.
- Clasificación de texto: mediante fine-tuning, podría adaptarse a tareas de clasificación binaria o multiclase.
- Análisis de sentimiento: con un ajuste posterior, podría detectar polaridad en textos cortos en ruso.
- Extracción de entidades simples: aunque no está entrenado para ello, podría servir como base para tareas de NER con adaptación.
- No se documentan capacidades avanzadas como tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Prototipado educativo: ideal para enseñar conceptos de transformers y fine-tuning en entornos académicos, gracias a su tamaño reducido y licencia MIT.
- Generación de texto corto: puede producir respuestas breves para chatbots simples o asistentes de demostración en ruso.
- Autocompletado de formularios o entradas de datos: su capacidad para continuar texto puede integrarse en herramientas de relleno automático.
- Clasificación de documentos pequeños: con fine-tuning, puede categorizar noticias, comentarios o mensajes en ruso.
- Análisis de sentimiento en redes sociales: adaptado con un dataset etiquetado, puede detectar opiniones en textos cortos.
- Experimentación con cuantización y despliegue en edge: su pequeño tamaño permite probar técnicas de optimización en dispositivos con pocos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. El modelo es demasiado pequeño para esperar un rendimiento competitivo en tareas complejas; su uso principal es experimental.

## Requisitos de hardware

- VRAM estimada: en FP32, ~222 MB (55,6 M × 4 bytes); en FP16, ~111 MB. Cabe en cualquier GPU moderna con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluso una GTX 1050 Ti o integrada. También puede ejecutarse en CPU sin problemas.
- Compatibilidad con consumer GPU: sí, todas las GPU de consumo actuales pueden ejecutar este modelo sin dificultad.
- Opciones de despliegue: compatible con frameworks como llama.cpp, Ollama, Transformers de Hugging Face, o vLLM (aunque el tamaño no lo requiere).
- Latencia y throughput: al ser tan pequeño, la inferencia es casi instantánea en GPU y muy rápida en CPU, con latencias del orden de milisegundos por token.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables con la misma arquitectura y propósito. Podría compararse con otros modelos pequeños como TinyLlama (1,1 B) o GPT-2 (124 M), pero estos son significativamente más grandes y con más documentación. No hay datos suficientes para una comparativa rigurosa.

## Limitaciones y advertencias

- Tamaño muy reducido: limita la calidad y coherencia del texto generado, especialmente en tareas complejas.
- Contexto limitado a 512 tokens: no puede manejar conversaciones largas o documentos extensos.
- Solo idioma ruso: no soporta otros idiomas de forma nativa.
- Sin documentación de entrenamiento: se desconoce el dataset, posibles sesgos y alucinaciones.
- Riesgo de alucinaciones: como cualquier modelo generativo, puede producir información falsa o inventada.
- Licencia MIT: permite uso comercial, pero sin garantías ni soporte del autor.
- Sin benchmarks ni evaluaciones: no hay evidencia de rendimiento en tareas estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RaspizdAI/deglm-55M
