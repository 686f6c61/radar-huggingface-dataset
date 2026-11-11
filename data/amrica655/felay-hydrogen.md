# Amrica655/FELAY-HYDROGEN

## Resumen

FELAY-HYDROGEN es un modelo multimodal de tipo image-text-to-text publicado por el desarrollador Amrica655 bajo el sello FELAY AI. Se construye como un ajuste fino del modelo cuantizado `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`, que a su vez deriva de la familia Gemma 4 de Google. El repositorio declara una arquitectura de 42 capas con un total de 7.996.156.448 parámetros (aproximadamente 8.000 millones) en formato safetensors, y un tamaño de repositorio de 17,5 GB.

El modelo se presenta como el miembro "flagship" y más pesado de la familia FELAY, orientado a ejecución en equipos de cómputo modestos y servidores gratuitos mediante técnicas de gestión de memoria: cuantización NF4 con doble cuantización, offload de tablas de embeddings a CPU y un supuesto motor de auto-planificación en dos fases. Soporta los idiomas persa (fa) e inglés (en) y se distribuye con licencia Apache 2.0.

Su relevancia actual radica en la combinación de un modelo base multimodal reciente (Gemma 4) con optimizaciones agresivas de memoria para hardware limitado, además de un ajuste QLoRA orientado a preservar el conocimiento base. No obstante, la información pública disponible es escasa (48 descargas, 0 likes) y varias de las afirmaciones técnicas de la model card no están verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Gemma-4, 42 capas, con torres de visión y audio |
| Parametros totales | 7.996.156.448 (aproximadamente 8.000 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit NormalFloat (NF4) con doble cuantizacion; pesos en safetensors |
| Idiomas soportados | Persa (fa), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma-4, un transformer multimodal con 42 capas computacionales que incluye un `vision_tower` y un `audio_tower`, además de tablas de embeddings por capa (`embed_tokens_per_layer`). El autor declara un total de aproximadamente 9.000 millones de parámetros en la model card, mientras que los pesos safetensors reales suman 7.996.156.448 parámetros. El modelo se distribuye ya cuantizado en 4 bits NF4 con doble cuantización, y fue construido según la model card en Google Colab sobre TPU v5e-1.

El ajuste fino se realizó con QLoRA bajo una estrategia denominada "Memory-Locked QLoRA", que congela las capas `down_proj` y `up_proj` para preservar el conocimiento base y entrena únicamente las capas de atención y routing (`q`, `k`, `v`, `o`, `gate`). La model card menciona además un "motor de auto-planificación en dos fases" (`Native <|think|> Self-Planner`) que haría que el modelo genere un plan de tres pasos antes de la respuesta final. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; estos datos no están disponibles.

## Capacidades

- Generación de texto conversacional en persa e inglés.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con torre de visión incluida en el repositorio.
- Torre de audio presente en la arquitectura según el mapeo de dispositivo de la model card (aunque no se detallan sus capacidades).
- Razonamiento en dos fases mediante un supuesto modo de auto-planificación (`<|think|>`) que genera un plan antes de responder.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: la model card menciona planificación interna de tres pasos, pero no se documenta integración con frameworks de agentes.
- Capacidades multilingües limitadas a persa e inglés según los metadatos.

## Casos de uso

- Asistencia conversacional en persa: el modelo puede mantener diálogos multi-turno en persa e inglés, lo que lo hace útil para atención al usuario en regiones donde el persa es idioma principal, aunque la longitud de contexto no está documentada.
- Descripción de imágenes en persa: al ser un modelo image-text-to-text, puede emplearse para generar descripciones o responder preguntas sobre imágenes en persa, un caso poco cubierto por modelos occidentales.
- Despliegue en hardware de gama baja: gracias a la cuantización NF4 y al offload de embeddings a CPU, puede ejecutarse en portátiles sin GPU dedicada o con GPU de gama media, según el mapeo de dispositivo sugerido.
- Prototipado en entornos gratuitos: el autor indica que está pensado para servidores gratuitos y Colab, lo que permite experimentar con un modelo multimodal sin infraestructura propia.
- Investigación sobre cuantización y ajuste QLoRA: el modelo sirve como caso de estudio de técnicas de preservación de conocimiento base mediante congelación selectiva de capas.
- Educación y demostraciones de razonamiento estructurado: el modo de auto-planificación puede usarse para mostrar respuestas con pasos intermedios en contextos docentes.
- Traducción asistida persa-inglés: aunque no se declara explícitamente como modelo de traducción, su bilingüismo permite usarlo para borradores y revisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,8 GB según la model card, gracias al offload de embeddings y torres a CPU y a la cuantización NF4 de las 42 capas.
- GPU recomendadas: no se especifican modelos concretos; la model card menciona Google Colab TPU v5e-1 para el entrenamiento y sistemas débiles para inferencia.
- Cabe en GPU de consumo: sí, según el autor, en equipos con poca VRAM; el mapeo de dispositivo sugerido coloca embeddings y torres en CPU y las capas en GPU si hay CUDA disponible.
- Opciones de despliegue: transformers con `device_map` personalizado y `low_cpu_mem_usage`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| FELAY-HYDROGEN | 7.996.156.448 | no disponible | Apache 2.0 | safetensors 4-bit NF4 | Basado en Gemma-4 E4B, bilingüe fa/en |
| unsloth/gemma-4-E4B-it-unsloth-bnb-4bit | no disponible | no disponible | no disponible | safetensors 4-bit | Modelo base directo del que deriva FELAY-HYDROGEN |
| Gemma 4 E4B (familia original) | aproximadamente 8.000 millones (escala E4B) | no disponible | no disponible | safetensors | Modelo original de Google del que deriva la cadena |

Los datos de rendimiento comparativo no están disponibles.

## Limitaciones y advertencias

- Información pública muy escasa: 48 descargas y 0 likes en el momento de la consulta, sin validación independiente de las afirmaciones de la model card.
- Discrepancia entre los parámetros declarados en la model card (aproximadamente 9.000 millones) y los pesos reales (7.996.156.448), lo que sugiere imprecisión en la documentación.
- Riesgo de alucinación no evaluado: no hay benchmarks ni evaluaciones de fidelidad publicadas.
- Cobertura lingüística limitada a persa e inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto no documentada, lo que dificulta planificar su uso en tareas de contexto largo.
- El modo de auto-planificación (`<|think|>`) no está verificado de forma independiente y podría no comportarse como se describe.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base Gemma 4 de Google, ya que pueden imponer restricciones adicionales de uso comercial.
- El repositorio ocupa 17,5 GB, lo que exige espacio en disco considerable incluso para un modelo de 8.000 millones de parámetros cuantizado.
- El mapeo de dispositivo sugerido requiere ajustes manuales y conocimiento técnico; no es un despliegue plug-and-play.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Amrica655/FELAY-HYDROGEN
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it-unsloth-bnb-4bit
- Familia Gemma de Google: no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponible en la información proporcionada
