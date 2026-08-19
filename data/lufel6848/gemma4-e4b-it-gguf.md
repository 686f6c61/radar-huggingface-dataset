# Lufel6848/Gemma4-E4B-it-GGUF

## Resumen

Gemma4-E4B-it-GGUF es una conversión a formato GGUF del modelo de visión-lenguaje (VLM) Gemma 4 E4B it, realizada por el usuario Lufel6848 mediante la herramienta Unsloth. El modelo original pertenece a la familia Gemma 4 de Google DeepMind, diseñada para tareas multimodales que combinan comprensión de imágenes y texto. Esta conversión permite ejecutar el modelo en entornos de inferencia local con llama.cpp, facilitando su uso en hardware de consumo.

El modelo cuenta con 7.518.069.290 parámetros totales, lo que sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 4.000 millones de parámetros activos, según indica la nomenclatura "E4B". Se distribuye en varias cuantizaciones (Q8_0, Q6_K, Q5_K_M, Q4_K_M) junto con un proyector multimodal en F16, lo que permite ajustar el equilibrio entre calidad y consumo de recursos. Su relevancia radica en ofrecer capacidades de visión-lenguaje en un formato optimizado para ejecución local, sin depender de servicios en la nube.

La ficha se basa exclusivamente en la información disponible en la model card y los resultados de búsqueda. No se dispone de datos sobre licencia, idiomas soportados, contexto máximo ni benchmarks publicados, por lo que estos campos se indican como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje), probablemente MoE con 4B activos (no confirmado) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | No disponible (el nombre "E4B" sugiere ~4B, sin confirmar) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF) + mmproj F16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors original no incluido en el repo) |

## Arquitectura y entrenamiento

El modelo es una conversión a GGUF de Gemma 4 E4B it, un VLM de la familia Gemma 4 desarrollado por Google DeepMind. La arquitectura combina un codificador de visión con un modelo de lenguaje basado en transformer, probablemente con una estructura de mezcla de expertos (MoE) dado el nombre "E4B" y el total de parámetros. El proceso de conversión fue realizado con Unsloth, que optimiza el fine-tuning y la exportación a formatos eficientes.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. La model card solo indica que el modelo fue fine-tuneado y convertido a GGUF, sin detalles adicionales sobre el proceso de entrenamiento.

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen y texto, lo que permite tareas de descripción de imágenes, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Generación de texto: al ser un modelo de lenguaje, puede producir respuestas coherentes en formato conversacional.
- Ejecución local: gracias al formato GGUF, puede ejecutarse con llama.cpp o herramientas compatibles como Ollama (con limitaciones para el proyector multimodal).
- No se especifican capacidades adicionales como tool calling, agentes o razonamiento multi-paso en la información disponible.

## Casos de uso

- Descripción automática de imágenes: el modelo puede generar texto descriptivo a partir de una imagen, útil para accesibilidad o catalogación de contenido visual.
- Asistente conversacional multimodal: integrado en un chatbot, puede responder preguntas sobre fotos o diagramas enviados por el usuario.
- Análisis de documentos escaneados: combinando OCR con el modelo, se pueden extraer y resumir datos de facturas, formularios o informes.
- Moderación de contenido visual: clasificar o describir imágenes para detectar contenido inapropiado en plataformas.
- Educación interactiva: explicar figuras, gráficos o esquemas en entornos de aprendizaje automatizado.
- Prototipado rápido de aplicaciones de visión: los desarrolladores pueden probar ideas de VLM localmente sin costes de API, usando las cuantizaciones más ligeras (Q4_K_M) en GPUs de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones para este modelo o su versión original.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización, el modelo de 7.5B parámetros requiere aproximadamente:
  - Q4_K_M: ~4,5 GB de VRAM (cabe en GPUs de 8 GB)
  - Q5_K_M: ~5,5 GB
  - Q6_K: ~6,5 GB
  - Q8_0: ~8 GB (requiere GPU de 10-12 GB)
- GPU recomendadas: RTX 3060/4060 (12 GB) para Q4_K_M/Q5_K_M; RTX 3090/4090 o A10 para Q8_0.
- El proyector multimodal (F16) añade un pequeño overhead de VRAM adicional.
- Opciones de despliegue: llama.cpp (llama-cli o llama-mtmd-cli), Ollama (con limitaciones para el mmproj, según la nota de la model card), y servidores compatibles con GGUF como llama.cpp server.
- Latencia y throughput: no disponibles; dependerán del hardware y la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría. Aunque existen alternativas como Gemma 3 o Llama 3.2 Vision, no se dispone de datos de rendimiento ni especificaciones detalladas para contrastar. Se recomienda consultar las fichas de los modelos originales en Hugging Face para obtener más contexto.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos específicos, pero al ser un modelo de visión-lenguaje, puede heredar sesgos de los datos de entrenamiento originales de Gemma 4.
- Riesgo de alucinación visual: como todo VLM, puede generar descripciones inexactas o inventar detalles no presentes en la imagen.
- Limitaciones de contexto e idioma: no se especifican, por lo que se desconoce el número máximo de tokens de entrada y los idiomas cubiertos.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Se recomienda contactar con el autor o consultar la página del modelo original de Google DeepMind.
- La conversión GGUF puede introducir pérdidas de calidad respecto al modelo original en bf16, especialmente en cuantizaciones bajas como Q4_K_M.
- Ollama no soporta archivos mmproj separados, por lo que para usar el modelo con Ollama es necesario crear un modelo unificado en bf16, lo que aumenta los requisitos de VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lufel6848/Gemma4-E4B-it-GGUF
- Repositorio de Unsloth (conversión): https://huggingface.co/unsloth/gemma-4-E4B-it-GGUF
- Conversión alternativa de bartowski: https://huggingface.co/bartowski/google_gemma-4-E4B-it-GGUF
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/gemma-4-e4b-it.html
