# Rin247/gemma-4-31B-it-Feral-Aquarion-FP4

## Resumen

El modelo `Rin247/gemma-4-31B-it-Feral-Aquarion-FP4` es una cuantización FP4 weight-only del modelo `gemma-4-31B-it-Feral`, que a su vez es una versión "abliterada" (sin censura) del modelo multimodal `gemma-4-31B-it` de Google DeepMind. El autor, Rin247, ha aplicado una proyección ortogonal para eliminar la dirección de rechazo del modelo base antes de cuantizar, dentro de un proceso denominado "Genesis of Aquarion forge". El resultado es un modelo de 16.357.254.800 parámetros (16,36B) en formato safetensors, con un tamaño de repositorio de 19,7 GB.

Este modelo está diseñado para tareas de generación de texto e imagen (image-text-to-text), con soporte para procesamiento de video como secuencias de frames, razonamiento, codificación y flujos de trabajo agénticos. La cuantización FP4 reduce significativamente el uso de memoria y acelera la inferencia, aunque requiere un proceso de dequantización manual con los buffers de escala y forma incluidos. Su relevancia radica en ofrecer una versión ligera y sin restricciones de un modelo de última generación, aunque con limitaciones derivadas de la cuantización y la falta de documentación oficial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Gemma 4) |
| Parametros totales | 16.357.254.800 (16,36B) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 256K tokens (según el modelo base) |
| Tipos de cuantizacion | FP4 (weight-only) |
| Idiomas soportados | no disponible (el modelo base soporta más de 140 idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP4 weight-only con buffers de escala y forma) |

## Arquitectura y entrenamiento

El modelo base `gemma-4-31B-it` es un transformer denso multimodal desarrollado por Google DeepMind, que acepta entradas de texto e imagen, y puede procesar video como secuencias de frames. Según la información pública, Gemma 4 ofrece una ventana de contexto de hasta 256K tokens y soporte multilingüe en más de 140 idiomas. La versión "Feral" ha sido sometida a un proceso de abliteración mediante proyección ortogonal de la dirección de rechazo, eliminando así las restricciones de contenido del modelo original. Posteriormente, se ha cuantizado a FP4 weight-only usando el método RTN (Round-to-Nearest) en CPU, almacenando las escalas y formas de los pesos en buffers separados (`*.weight_scale`, `*.weight_shape`). No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens o el uso de RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo tareas de codificación y matemáticas.
- Procesamiento multimodal: acepta imágenes como entrada y puede generar descripciones, análisis o respuestas basadas en contenido visual.
- Procesamiento de video como secuencias de frames, permitiendo tareas de comprensión temporal.
- Soporte para flujos de trabajo agénticos y tool calling (según las capacidades del modelo base).
- Multilingüe (más de 140 idiomas en el modelo base, aunque no se confirma en esta versión cuantizada).
- Al estar "abliterado", no aplica los mecanismos de rechazo habituales, lo que permite respuestas sin censura en temas sensibles (con los riesgos asociados).

## Casos de uso

- Análisis de imágenes en entornos de investigación: el modelo puede recibir una imagen y generar una descripción detallada, extraer información relevante o responder preguntas sobre el contenido visual, gracias a su naturaleza multimodal.
- Generación de código en producción: con soporte para razonamiento y codificación, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar fragmentos de código, aunque requiere un motor de inferencia compatible con el formato FP4.
- Asistentes de conversación sin restricciones: al estar abliterado, puede utilizarse en aplicaciones de chat donde se requiere respuestas sin filtros de contenido, como en entornos de investigación sobre comportamiento de modelos o creación de personajes.
- Procesamiento de video para resúmenes automáticos: al manejar secuencias de frames, puede analizar vídeos cortos y generar resúmenes textuales o extraer eventos clave.
- Razonamiento multi-paso en tareas de agente: puede planificar y ejecutar secuencias de acciones en entornos simulados, gracias a su capacidad de razonamiento y contexto largo.
- Fine-tuning específico: al ser un modelo cuantizado, puede servir como punto de partida para ajuste fino en tareas concretas, aunque se recomienda usar el modelo base sin cuantizar para mayor precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas para este modelo cuantizado ni para su versión base.

## Requisitos de hardware

- VRAM estimada para inferencia: con 16,36B parámetros en FP4 (0,5 bytes por parámetro), los pesos ocupan aproximadamente 8,2 GB. Sumando escalas, activaciones y overhead, se estima un consumo de 10-12 GB para secuencias de longitud moderada (2K-4K tokens). Para contexto largo (256K), la VRAM necesaria aumentaría considerablemente.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB VRAM) es suficiente para la mayoría de casos. En GPUs con 16 GB (como RTX 4080) podría caber con secuencias cortas, pero no se garantiza.
- No cabe en GPUs consumer de 8 GB (como RTX 3060) debido al tamaño de los pesos y las activaciones.
- Opciones de despliegue: el formato FP4 weight-only es personalizado y requiere dequantización con los buffers `*.weight_scale` y `*.weight_shape` antes de usar motores estándar como vLLM, llama.cpp u Ollama. No se indica compatibilidad directa con estos motores. Se recomienda usar el script de dequantización proporcionado por el autor o convertir a un formato estándar (por ejemplo, GGUF) si se desea usar con herramientas comunes.
- Latencia y throughput: no disponibles. La cuantización FP4 reduce el ancho de banda de memoria, lo que puede acelerar la inferencia en GPUs con soporte para FP4 (como las arquitecturas Ada Lovelace o Hopper), pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-31B-it (base) | 31B (según nombre) | 256K | FP16/BF16 | Google Gemma (permisiva) | Hugging Face |
| gemma-4-31B-it-Feral-Aquarion-FP4 (este) | 16,36B (real) | 256K (heredado) | FP4 weight-only | no disponible | Hugging Face |
| Llama 3.1 8B Instruct | 8B | 128K | FP16/GGUF | Llama 3.1 (permisiva) | Hugging Face |

La comparativa es limitada porque no se dispone de datos de rendimiento. El modelo base Gemma 4 31B es denso y multimodal, mientras que este modelo cuantizado reduce el número de parámetros efectivos (aunque el nombre "31B" sugiere que el modelo original podría tener 31B, los safetensors indican 16,36B, posiblemente debido a una arquitectura MoE o a un error de etiquetado). En cualquier caso, la cuantización FP4 introduce pérdida de precisión, por lo que su rendimiento será inferior al del modelo base.

## Limitaciones y advertencias

- La cuantización FP4 puede degradar la calidad de las respuestas, especialmente en tareas de razonamiento complejo o generación de código, en comparación con el modelo en precisión completa.
- El modelo está "abliterado", lo que elimina los mecanismos de rechazo de contenido. Esto puede generar respuestas inapropiadas, ofensivas o peligrosas si se usa sin supervisión. No es adecuado para aplicaciones comerciales orientadas al público general sin filtros adicionales.
- No se dispone de licencia explícita, lo que impide conocer las restricciones de uso comercial o redistribución. Se recomienda contactar al autor antes de usar en producción.
- El formato de pesos es personalizado y no es compatible directamente con motores de inferencia estándar. Requiere un paso de dequantización manual, lo que añade complejidad al despliegue.
- No se han publicado benchmarks ni evaluaciones de seguridad, por lo que su rendimiento real y sus sesgos son desconocidos.
- La información sobre idiomas soportados y contexto efectivo tras la cuantización no está confirmada; se asume que hereda las capacidades del modelo base, pero no se garantiza.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/Rin247/gemma-4-31B-it-Feral-Aquarion-FP4)
- [Versión FP8 del mismo modelo](https://huggingface.co/Rin247/gemma-4-31B-it-Feral-Aquarion-FP8)
- [Modelo base Gemma 4 31B en HuggingFace](https://huggingface.co/google/gemma-4-31B)
- [Página oficial de Gemma 4 en Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Model card de Gemma 4 31B IT en NVIDIA NIM](https://build.nvidia.com/google/gemma-4-31b-it/modelcard)
