# dikshant0520/gemma-3-4b-it-mix-baseline4-lora

## Resumen

El modelo `dikshant0520/gemma-3-4b-it-mix-baseline4-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario dikshant0520, diseñado para ajustar el modelo base `google/gemma-3-4b-it` de Google. Se trata de un fine-tuning especializado en tareas de imagen a texto (image-text-to-text), entrenado sobre 125.819 ejemplos pseudo-etiquetados y 2.000 ejemplos dorados. El adaptador se aplica únicamente a las capas de proyección del modelo de lenguaje, dejando congelado el codificador de visión, lo que permite una adaptación eficiente sin reentrenar todo el modelo.

Este adaptador es relevante porque ofrece una vía ligera para mejorar el rendimiento de Gemma 3 4B IT en tareas multimodales específicas, como las que se evalúan con la métrica LingoScore. Al ser un adaptador LoRA, su tamaño es reducido (0,1 GB) y puede integrarse fácilmente en pipelines de inferencia existentes. La licencia es `gemma`, lo que implica ciertas restricciones de uso comercial que deben revisarse antes de su adopción en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `google/gemma-3-4b-it` (modelo multimodal transformer) |
| Parametros totales | no disponible (el adaptador es de 0,1 GB, pero no se especifica el número exacto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la ficha del adaptador) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo `google/gemma-3-4b-it`, un transformer multimodal que procesa tanto texto como imágenes. El fine-tuning se realizó con la técnica LoRA, con rango 16, alpha 32 y dropout 0,10. Se entrenó durante 2 épocas con un tamaño de lote efectivo de 15, distribuido en tres GPUs, y una tasa de aprendizaje de 1e-4. El mejor checkpoint se obtuvo en el paso 13.000, con una pérdida de validación de 0,08334. El entrenamiento utilizó 125.819 ejemplos pseudo-etiquetados y 2.000 ejemplos dorados, y el adaptador se aplicó a las capas de proyección del modelo de lenguaje, manteniendo congelado el codificador de visión. No se dispone de información adicional sobre la composición del dataset ni sobre el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Gemma 3 4B IT, que incluyen generación de texto, razonamiento y comprensión del lenguaje.
- Procesamiento multimodal: al estar basado en Gemma 3 4B IT, el adaptador puede procesar entradas de imagen y texto, aunque el fine-tuning se centra en la proyección del lenguaje.
- Especialización en tareas de imagen a texto: el adaptador está entrenado para mejorar el rendimiento en tareas evaluadas con LingoScore, una métrica que mide la calidad de las respuestas generadas a partir de imágenes y preguntas.
- Soporte de tool calling y agentes: no se menciona explícitamente, pero el modelo base Gemma 3 4B IT incluye soporte para function calling y razonamiento multi-paso, por lo que el adaptador podría heredar estas capacidades.
- Capacidades multilingües: no se especifican idiomas concretos; el modelo base soporta múltiples idiomas, pero no se confirma para este adaptador.

## Casos de uso

- Evaluación de modelos multimodales en conjuntos de datos con preguntas e imágenes: el adaptador se puede utilizar con el script de inferencia proporcionado (`inference.py`), que toma un CSV con `question_id` y `question`, y un parquet con imágenes, para generar predicciones. Es adecuado para reproducir o ampliar los resultados del benchmark LingoScore.
- Ajuste fino de Gemma 3 4B IT para tareas específicas de VQA (Visual Question Answering): al ser un adaptador LoRA, se puede cargar sobre el modelo base para mejorar la precisión en tareas de respuesta a preguntas visuales, sin necesidad de reentrenar el modelo completo.
- Prototipado rápido de sistemas de captioning de imágenes: el adaptador puede integrarse en pipelines que generen descripciones de imágenes, aprovechando la capacidad multimodal del modelo base.
- Investigación en adaptación eficiente de modelos multimodales: sirve como ejemplo de fine-tuning con LoRA sobre un modelo de 4B parámetros, útil para estudiar el impacto de la adaptación en capas de proyección.
- Integración en entornos con recursos limitados: al ser un adaptador pequeño, puede desplegarse en GPUs de consumo junto con el modelo base cuantizado, aunque no se especifican requisitos exactos.
- Benchmarking de métricas de evaluación: el adaptador puede usarse para comparar el rendimiento de diferentes estrategias de fine-tuning en tareas de imagen a texto, utilizando LingoScore como métrica de referencia.

## Benchmarks y rendimiento

Según la model card, en un conjunto de evaluación compartido de 5.000 ejemplos, el adaptador obtuvo los siguientes resultados:

| Metrica | Valor |
|---|---|
| LingoScore medio | 0,46035 |
| LingoScore mediana | 0,33312 |
| Porcentaje de predicciones con score >= 0,8 | 35,12% |

No se han publicado comparaciones con otros modelos o adaptadores en la información disponible.

## Requisitos de hardware

- El adaptador en sí es ligero (0,1 GB), pero requiere el modelo base `google/gemma-3-4b-it` para funcionar.
- No se especifican requisitos de VRAM ni GPUs recomendadas en la información proporcionada.
- El modelo base Gemma 3 4B IT puede ejecutarse en una GPU de consumo con al menos 8 GB de VRAM en cuantización, pero este dato no está confirmado para el adaptador.
- Opciones de despliegue: el adaptador se puede cargar con la librería `peft` sobre el modelo base, y el script de inferencia sugiere un flujo con CSV y parquet. No se mencionan herramientas como vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA similares para Gemma 3 4B IT en los resultados de búsqueda. El único adaptador comparable encontrado es `PJMixers-Dev/google_gemma-3-4b-it-lora`, pero no se proporcionan detalles de su rendimiento ni configuración. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El adaptador no es un modelo completo; requiere el modelo base `google/gemma-3-4b-it` y la licencia Gemma debe aceptarse antes de su uso.
- El entrenamiento se realizó sobre un conjunto de datos específico (pseudo-etiquetado y dorado), por lo que el rendimiento puede no generalizar a otros dominios o tareas.
- No se han documentado sesgos específicos, pero al ser un fine-tuning sobre un modelo base, puede heredar sesgos presentes en los datos de entrenamiento de Gemma 3.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir respuestas incorrectas o inventadas, especialmente en tareas multimodales complejas.
- La licencia `gemma` impone restricciones de uso comercial; es necesario revisar los términos antes de desplegar el modelo en producción.
- No se especifican limitaciones de contexto o idioma, pero al ser un adaptador, estas dependen del modelo base.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/dikshant0520/gemma-3-4b-it-mix-baseline4-lora
- Modelo base en Hugging Face: https://huggingface.co/google/gemma-3-4b-it
- Página oficial de Gemma 3 (Google DeepMind): https://deepmind.google/models/gemma/gemma-3/
