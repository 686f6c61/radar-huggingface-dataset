# Markie77/new-testament-trained-GGUF

## Resumen

El modelo `Markie77/new-testament-trained-GGUF` es una conversión a formato GGUF de un modelo de lenguaje de aproximadamente 20 900 millones de parámetros, identificado en el archivo como `gpt-oss-20b`. Ha sido ajustado (fine-tuning) sobre el texto del Nuevo Testamento y posteriormente convertido a GGUF mediante la librería Unsloth, lo que permite su ejecución con llama.cpp y otras herramientas compatibles con este formato. El repositorio incluye un único archivo cuantizado en MXFP4 (4 bits) con un tamaño de 13,8 GB, pensado para despliegue local eficiente.

La relevancia de este modelo radica en su especialización temática: al estar entrenado sobre un corpus religioso concreto, podría ofrecer respuestas contextualizadas en ese dominio, aunque no se dispone de información detallada sobre el proceso de entrenamiento ni sobre sus capacidades generales. Es una opción interesante para desarrolladores que buscan un modelo de texto ligero y cuantizado para aplicaciones de conversación o generación de contenido relacionado con textos bíblicos, siempre que se acepte la falta de documentación técnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 20 914 757 184 (aprox. 20,9 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (archivo `gpt-oss-20b.MXFP4.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo original (si es un transformer denso, MoE, etc.). El nombre del archivo sugiere que se basa en la familia GPT-OSS de 20B parámetros, pero no hay confirmación oficial. El fine-tuning se realizó con la herramienta Unsloth, que acelera el entrenamiento y la conversión a GGUF. No se especifican los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). La única pista es el nombre del repositorio, que indica un entrenamiento sobre el Nuevo Testamento, pero no se detalla el corpus exacto ni la metodología.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje, puede generar respuestas coherentes en tareas de conversación y completado de texto, aunque no se han documentado capacidades específicas.
- Especialización temática: por su nombre, es probable que tenga un conocimiento reforzado sobre el Nuevo Testamento, pero no hay evidencia pública de ello.
- Compatibilidad con llama.cpp: el formato GGUF permite su uso con `llama-cli` y otras herramientas del ecosistema llama.cpp.
- No se dispone de información sobre tool calling, razonamiento multi-paso, capacidades multilingües o modos especiales (thinking, visión, audio).

## Casos de uso

Dada la escasa información, los casos de uso son hipotéticos y deben validarse con pruebas reales:

- Estudio asistido de textos bíblicos: el modelo podría responder preguntas sobre pasajes del Nuevo Testamento, aunque no se garantiza precisión teológica.
- Generación de contenido devocional: podría redactar reflexiones o resúmenes basados en el corpus de entrenamiento.
- Chatbot temático para comunidades religiosas: integrable en aplicaciones de mensajería mediante llama.cpp u Ollama.
- Experimentación con fine-tuning: sirve como ejemplo de cómo convertir un modelo ajustado a GGUF con Unsloth.
- Pruebas de inferencia local en hardware modesto: al ser un GGUF de 4 bits, puede ejecutarse en GPUs con al menos 14 GB de VRAM.
- Investigación sobre modelos especializados en dominios concretos: permite analizar el impacto del fine-tuning en un corpus reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se puede comparar su rendimiento con otros modelos sin datos objetivos.

## Requisitos de hardware

- El archivo GGUF pesa 13,8 GB, por lo que se necesita al menos esa cantidad de VRAM para cargar el modelo en memoria (más overhead de ejecución). Se recomienda una GPU con 16 GB o más.
- GPUs compatibles: RTX 4080/4090, A100, H100, o cualquier GPU con suficiente VRAM.
- Es posible ejecutarlo en CPU con llama.cpp, aunque la velocidad será menor.
- Herramientas de despliegue: llama.cpp, Ollama (incluye un Modelfile en el repo), y cualquier runtime que soporte GGUF.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (mismo tamaño y especialización). No se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- No hay documentación sobre sesgos, alucinaciones o limitaciones de contexto.
- La licencia no está especificada, por lo que el uso comercial es incierto.
- El modelo está especializado en un corpus religioso, lo que puede limitar su rendimiento en tareas generales.
- La cuantización MXFP4 puede degradar la calidad de las respuestas en comparación con precisiones más altas.
- No se ha verificado la calidad del fine-tuning; se recomienda evaluar el modelo antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Markie77/new-testament-trained-GGUF
- Unsloth (herramienta de entrenamiento y conversión): https://github.com/unslothai/unsloth
- Documentación de llama.cpp: https://github.com/ggerganov/llama.cpp
