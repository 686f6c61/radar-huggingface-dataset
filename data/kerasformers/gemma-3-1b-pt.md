# kerasformers/gemma-3-1b-pt

## Resumen

El modelo `kerasformers/gemma-3-1b-pt` es una conversión íntegra en Keras 3 del checkpoint base `google/gemma-3-1b-pt` de Google, realizada por el proyecto KerasFormers. Se trata de un modelo de generación de texto con 1.000 millones de parámetros, pensado para ejecutarse sin modificaciones sobre TensorFlow, PyTorch o JAX gracias al backend unificado de Keras 3. Los pesos se almacenan en bfloat16 y el repositorio ocupa 2,0 GB.

La principal aportación de esta conversión es la portabilidad: un mismo código funciona en los tres frameworks, lo que simplifica el desarrollo y la experimentación. Al ser un checkpoint base (pretrained), no está ajustado para instrucciones ni diálogo, por lo que su uso natural es el fine-tuning para tareas específicas o la generación de texto sin formato conversacional. Su relevancia actual radica en que Gemma 3 es una familia de modelos reciente con buena relación entre tamaño y capacidades, y esta implementación acerca el ecosistema Keras a esos modelos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (arquitectura Gemma 3, sin más detalle en la fuente) |
| Parametros totales | 1.000 millones (aprox.) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (según documentación oficial de Gemma 3) |
| Tipos de cuantizacion | bfloat16 (por defecto), float32, int8 (vía opción `quantization` de Keras) |
| Idiomas soportados | Inglés (según la model card; Gemma 3 es multilingüe, pero este checkpoint se declara como `en`) |
| Licencia | Gemma (gated, requiere aceptación en Hugging Face) |
| Formato de pesos | No disponible (pesos en formato Keras, probablemente `.h5` o `.weights.h5`) |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna ni el proceso de entrenamiento. Se indica únicamente que es una conversión fiel del checkpoint `google/gemma-3-1b-pt`, que pertenece a la familia Gemma 3 de Google. Por conocimiento general, Gemma 3 utiliza una arquitectura Transformer decoder con atención global y local, y el modelo base de 1B fue preentrenado sobre un corpus masivo de texto multilingüe. Sin embargo, al no estar especificado en la fuente, estos datos deben tomarse como referencia general y no como información verificada de esta conversión.

El proyecto KerasFormers no modifica los pesos originales; simplemente los adapta al formato Keras y ofrece una API unificada (`Gemma3TextGenerate`) que funciona con cualquier backend. El entrenamiento original corresponde a Google, y los detalles completos están disponibles en la model card oficial de `google/gemma-3-1b-pt`.

## Capacidades

- Generación de texto autoregresiva a partir de un prompt, sin formato conversacional (al ser un modelo base).
- Fine-tuning sobre tareas específicas: clasificación, generación condicionada, extracción de información, etc.
- Compatibilidad multiplataforma: el mismo código funciona en TensorFlow, PyTorch y JAX mediante Keras 3.
- Carga en bfloat16 por defecto, con opciones de precisión completa (float32) y cuantización int8.
- No incluye soporte para tool calling, agentes ni razonamiento multi-paso de forma nativa (no está ajustado para instrucciones).
- Capacidad multilingüe limitada según la ficha (inglés), aunque el modelo base de Gemma 3 es multilingüe; se recomienda verificar en la documentación oficial.

## Casos de uso

- Fine-tuning para clasificación de textos: al ser un modelo base compacto, se puede ajustar con un dataset etiquetado para análisis de sentimiento, detección de spam o categorización de documentos. Su tamaño de 1B permite entrenarlo en una GPU de gama media.
- Generación de texto para dominios específicos: fine-tuning sobre corpus técnicos o jurídicos para generar resúmenes o redactar informes. La ventana de contexto de 128K permite procesar documentos largos en una sola pasada.
- Prototipado rápido en investigación: gracias a la portabilidad entre backends, los investigadores pueden probar el mismo modelo en JAX para entrenamiento y en PyTorch para inferencia sin cambiar de código.
- Extracción de entidades y relaciones: mediante fine-tuning, el modelo puede etiquetar entidades en textos biomédicos o financieros, aprovechando su capacidad de representación del lenguaje.
- Generación de código en entornos educativos: aunque no está ajustado para instrucciones, tras un fine-tuning con datasets de código puede asistir en la generación de fragmentos simples.
- Sistemas de recomendación basados en texto: fine-tuning para clasificar o puntuar descripciones de productos, usando el modelo como encoder de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Para datos de rendimiento del modelo original, se debe consultar la model card de `google/gemma-3-1b-pt` o el paper de Gemma 3 (arXiv:2503.19786).

## Requisitos de hardware

- VRAM estimada: el modelo en bfloat16 ocupa aproximadamente 2 GB (tamaño del repositorio). Con cuantización int8, el uso de memoria puede reducirse a ~1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en bfloat16 (por ejemplo, NVIDIA GTX 1650, RTX 3050, T4). Para fine-tuning, se recomienda al menos 8 GB (RTX 3070, A10, etc.).
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama de entrada y media.
- Opciones de despliegue: al ser una implementación Keras, se puede usar con TensorFlow Serving, o exportar a SavedModel para producción. También es posible cargarlo en entornos JAX o PyTorch. No se menciona soporte para vLLM, llama.cpp u Ollama en la documentación de KerasFormers.
- Latencia y throughput: no disponibles en la fuente. Para un modelo de 1B, se espera una generación de decenas de tokens por segundo en GPUs modernas, pero no hay datos oficiales de esta conversión.

## Comparativa con modelos similares

La comparación se realiza con otros modelos base de ~1B parámetros, aunque no se dispone de benchmarks para esta conversión concreta. Los datos de contexto y licencia provienen de las respectivas fichas oficiales.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kerasformers/gemma-3-1b-pt | 1B | 128K | Gemma (gated) | Hugging Face, pesos Keras |
| google/gemma-3-1b-pt | 1B | 128K | Gemma (gated) | Hugging Face, PyTorch/JAX |
| Qwen2.5-1.5B | 1.5B | 32K | Apache 2.0 | Hugging Face, múltiples formatos |
| Llama 3.2 1B | 1B | 128K | Llama 3.2 (gated) | Hugging Face, PyTorch |

La principal diferencia de esta conversión es su integración con Keras 3, lo que la hace única frente a las versiones oficiales. En cuanto a rendimiento, no hay datos comparativos publicados en la fuente.

## Limitaciones y advertencias

- Modelo base: no está ajustado para instrucciones, por lo que las respuestas pueden ser incoherentes si se usa directamente como chatbot.
- Sesgos: al ser un modelo preentrenado sobre datos web, puede reflejar sesgos sociales, culturales o de género presentes en el corpus.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de generación libre.
- Idioma: la ficha declara inglés, aunque el modelo original de Gemma 3 es multilingüe. Se recomienda verificar el comportamiento en otros idiomas antes de usarlo en producción.
- Licencia gated: requiere aceptar los términos de la licencia Gemma en Hugging Face antes de descargar los pesos. El uso comercial está sujeto a las restricciones de dicha licencia.
- Formato de pesos propietario: los pesos están en formato Keras, no en safetensors ni GGUF, lo que limita su uso con herramientas estándar como llama.cpp o vLLM sin conversión previa.
- Soporte de la comunidad: al ser un proyecto de terceros (KerasFormers), el mantenimiento y la resolución de incidencias dependen de la comunidad, no de Google.

## Enlaces

- Hugging Face: https://huggingface.co/kerasformers/gemma-3-1b-pt
- Repositorio GitHub de KerasFormers: https://github.com/IMvision12/KerasFormers
- Documentación de Gemma 3 en KerasFormers: https://imvision12.github.io/KerasFormers/gemma3/
- Model card oficial de Google: https://huggingface.co/google/gemma-3-1b-pt
- Paper de Gemma 3: https://arxiv.org/abs/2503.19786
