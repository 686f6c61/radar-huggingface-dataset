# burningfeet/backup2026-08-23-Gemma-4-E4B-Uncensored-Genesis-GGUF

## Resumen

El modelo `burningfeet/backup2026-08-23-Gemma-4-E4B-Uncensored-Genesis-GGUF` es una conversión a formato GGUF del modelo base `google/gemma-4-e4b-it`, un modelo multimodal de la familia Gemma 4 desarrollado por Google DeepMind. El autor, `burningfeet`, ha aplicado técnicas de *abliteration* (eliminación de capas de rechazo) y cuantización con matriz de importancia (imatrix) para producir una versión "uncensored" del modelo original. El resultado es un modelo con 7.518.069.290 parámetros (aproximadamente 7,5 mil millones), orientado a tareas de imagen-texto (image-text-to-text) y conversación.

Este modelo se presenta como una alternativa para desarrolladores e investigadores que buscan un LLM multimodal sin restricciones de contenido, aunque esto conlleva riesgos importantes de seguridad y alineación. Su disponibilidad en formato GGUF permite su ejecución en una amplia variedad de dispositivos, desde CPU hasta GPUs de consumo, mediante herramientas como llama.cpp u Ollama. La relevancia actual radica en la creciente demanda de modelos multimodales abiertos y en la posibilidad de desplegar estos sistemas en entornos locales sin depender de servicios en la nube.

El acceso al modelo es restringido (gated) y requiere aceptar las condiciones de licencia de Gemma en HuggingFace. Dado que es una conversión GGUF de un modelo base con licencia Gemma, las restricciones de uso comercial de la licencia original se mantienen. Es importante señalar que este modelo no es oficial de Google, sino un derivado creado por un tercero, por lo que su calidad y seguridad no están respaldadas por el equipo de Gemma.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E4B) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible (posiblemente MoE, pero no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (incluye cuantizaciones con imatrix, p. ej. Q4_K_M, Q5_K_M, Q8_0, etc.) |
| Idiomas soportados | en, multilingual (según los tags) |
| Licencia | Gemma (license:gemma) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-e4b-it` es un modelo multimodal desarrollado por Google DeepMind, basado en la arquitectura de la familia Gemma 4. El nombre "E4B" sugiere que podría tratarse de una arquitectura de mezcla de expertos (MoE) con 4 mil millones de parámetros activos, aunque no hay información confirmada en los datos disponibles. El modelo original está entrenado para procesar entradas de texto e imagen (posiblemente también audio, pero no se ha confirmado) y está orientado a tareas conversacionales.

El autor `burningfeet` ha aplicado un proceso de *abliteration* que elimina las capas de seguridad y rechazo del modelo original, lo que permite generar contenido sin restricciones. Además, se ha realizado una cuantización GGUF con matriz de importancia (imatrix) para optimizar el rendimiento en hardware diverso. No se dispone de información detallada sobre los datos de entrenamiento, el número de tokens utilizados o si se aplicaron técnicas de RLHF/DPO en el modelo original.

## Capacidades

- Generación de texto y razonamiento conversacional: el modelo puede mantener diálogos multi-turno.
- Procesamiento multimodal: acepta entradas de imagen y texto, lo que permite tareas de descripción de imágenes, respuesta a preguntas visuales, etc.
- Capacidades multilingües: el modelo base soporta múltiples idiomas, aunque no se especifica la lista exacta.
- Sin filtros de contenido: gracias a la ablación, el modelo no rechaza peticiones que el modelo original habría bloqueado (por ejemplo, contenido violento, ilegal o inapropiado).
- Compatibilidad con herramientas de inferencia GGUF: puede ejecutarse en llama.cpp, Ollama, llama-cpp-python y otros.

## Casos de uso

- Asistente multimodal local: integrar el modelo en aplicaciones de escritorio o móviles que necesiten analizar imágenes y responder preguntas sobre ellas, sin conexión a internet.
- Generación de descripciones de imágenes en batch: procesar grandes conjuntos de imágenes para generar etiquetas o descripciones automáticas, por ejemplo en sistemas de gestión de fotos.
- Chatbot de atención al cliente sin restricciones: desplegar un chatbot interno que pueda manejar consultas que requieran respuestas creativas o no convencionales, aunque con riesgos de seguridad.
- Experimentación con técnicas de alineación: investigar los efectos de la ablación en modelos multimodales y comparar comportamientos con el modelo original.
- Desarrollo de agentes que necesitan razonamiento visual: por ejemplo, un agente que debe describir el contenido de una imagen para tomar decisiones.
- Uso educativo y de investigación: analizar las diferencias entre un modelo censurado y su versión sin restricciones para estudiar sesgos y alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. No se puede comparar su rendimiento con modelos similares de manera objetiva.

## Requisitos de hardware

- El modelo tiene aproximadamente 7,5 mil millones de parámetros. En formato GGUF, el peso en memoria depende de la cuantización elegida:
  - Q4_K_M: alrededor de 4,5-5 GB de VRAM (puede caber en GPUs con 8 GB).
  - Q5_K_M: alrededor de 5,5-6 GB.
  - Q8_0: alrededor de 8 GB.
- Para inferencia en CPU, se recomienda al menos 16 GB de RAM para cuantizaciones bajas.
- GPUs recomendadas: RTX 3060 (12 GB), RTX 3080 (10 GB), RTX 4090 (24 GB) para cuantizaciones altas.
- Se puede ejecutar con llama.cpp, Ollama, llama-cpp-python o servidores compatibles con GGUF como llama-server.
- La latencia dependerá del hardware; en una GPU moderna se esperan decenas de tokens por segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa con otros modelos de la misma categoría. El modelo base `google/gemma-4-e4b-it` es el único punto de referencia, pero no se tienen métricas de rendimiento. No se conocen otros modelos GGUF con las mismas características de ablación y multimodalidad.

## Limitaciones y advertencias

- **Sesgos y alucinación**: al ser un modelo "uncensored", no se ha evaluado su fiabilidad. Puede generar información falsa o dañina sin ningún filtro.
- **Riesgos de seguridad**: la eliminación de las restricciones de contenido puede producir respuestas ofensivas, ilegales o peligrosas. No debe usarse en aplicaciones públicas o con usuarios no informados.
- **Calidad no verificada**: el modelo es una modificación de un tercero, no está respaldado por Google DeepMind. Su rendimiento y calidad no están garantizados.
- **Licencia**: la licencia Gemma impone restricciones sobre el uso comercial y la redistribución. Consulte los términos exactos en HuggingFace.
- **Acceso restringido**: el modelo está gated, requiere aceptar las condiciones de HuggingFace antes de descargarlo.
- **Idiomas**: el soporte multilingüe puede ser limitado y no se conoce la lista exacta.
- **Sin información de contexto**: no se conoce la longitud de contexto, lo que puede limitar su uso en tareas con entradas largas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/burningfeet/backup2026-08-23-Gemma-4-E4B-Uncensored-Genesis-GGUF)
- [Modelo base: google/gemma-4-e4b-it](https://huggingface.co/google/gemma-4-E4B)
- [Página oficial de Gemma 4](https://deepmind.google/models/gemma/gemma-4/)
- [Repositorio de Gemma en GitHub](https://github.com/google-deepmind/gemma)
- [Otro modelo del mismo autor: burningfeet/Gemma4-12B-QAT-Genesis](https://huggingface.co/burningfeet/Gemma4-12B-QAT-Genesis)
