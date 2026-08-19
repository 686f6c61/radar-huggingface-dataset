# altaldsijfasdf/Qwen3.5-4B-SOMPOA-heresy-v2-MTP-Q8_0-GGUF

## Resumen

El modelo `altaldsijfasdf/Qwen3.5-4B-SOMPOA-heresy-v2-MTP-Q8_0-GGUF` es una conversión a formato GGUF del modelo base `MuXodious/Qwen3.5-4B-SOMPOA-heresy-v2-MTP`, realizada mediante la herramienta GGUF-my-repo de llama.cpp. Se trata de una variante de la familia Qwen3.5 con 4.326 millones de parámetros, etiquetada como "heretic", "uncensored" y "abliterated", lo que indica que ha sido sometida a técnicas de eliminación de rechazos (abliteration) para reducir la censura y los filtros de seguridad típicos de los modelos comerciales.

El pipeline declarado es `image-text-to-text`, lo que sugiere una posible capacidad multimodal, aunque no se proporcionan detalles sobre el procesamiento de imágenes en la documentación disponible. La cuantización Q8_0 reduce el tamaño del modelo a aproximadamente 4,6 GB, lo que lo hace ejecutable en hardware de consumo con suficiente VRAM. Su licencia Apache 2.0 permite uso comercial y modificación, pero la naturaleza "uncensored" implica riesgos de generación de contenido inapropiado.

La relevancia de este modelo radica en su disponibilidad como archivo GGUF listo para usar con llama.cpp, Ollama u otros motores de inferencia local, ofreciendo una alternativa de 4B parámetros con un perfil de seguridad reducido. Sin embargo, la falta de documentación técnica detallada sobre el modelo base limita la evaluación de sus capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, basado en Qwen3.5) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (archivo GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna del modelo base `MuXodious/Qwen3.5-4B-SOMPOA-heresy-v2-MTP`. Dado que pertenece a la familia Qwen3.5, es probable que emplee una arquitectura transformer con atención estándar, pero no se confirma. El sufijo "MTP" podría referirse a "Multi-Token Prediction" (una técnica de entrenamiento que predice varios tokens a la vez), aunque no hay documentación que lo respalde.

El modelo ha sido etiquetado como "abliterated", lo que sugiere que se aplicó una técnica de ablación de capas o pesos para eliminar los comportamientos de rechazo y censura aprendidos durante el entrenamiento con RLHF o DPO. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el proceso de alineación. La conversión a GGUF no modifica los pesos, solo el formato de almacenamiento.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje de 4B parámetros, puede generar texto coherente en tareas de completado, diálogo y redacción, aunque no se especifican sus límites exactos.
- Procesamiento multimodal: el pipeline `image-text-to-text` sugiere que podría aceptar imágenes como entrada, pero no hay ejemplos ni documentación que lo confirme.
- Ausencia de filtros de seguridad: debido a la ablación, el modelo probablemente no rechace solicitudes de contenido explícito, violento o ilegal, lo que lo diferencia de los modelos alineados convencionalmente.
- Otras capacidades (tool calling, razonamiento, código, matemáticas, agentes): no disponible.

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede utilizarse para escribir narrativas, guiones o diálogos que aborden temas tabú o explícitos, gracias a su naturaleza "uncensored". Es adecuado para proyectos de ficción adulta o investigación sobre generación de texto sin filtros.
- Experimentación con técnicas de ablación: investigadores pueden estudiar el comportamiento de un modelo de 4B tras la eliminación de rechazos, comparándolo con versiones alineadas de Qwen3.5 para analizar diferencias en seguridad y utilidad.
- Inferencia local en hardware modesto: al ser un GGUF Q8_0 de ~4,6 GB, puede ejecutarse en GPUs con 6-8 GB de VRAM, como una RTX 3060 o una laptop gaming, permitiendo prototipos de chatbots o asistentes sin depender de APIs externas.
- Pruebas de robustez en moderación de contenido: se puede emplear para evaluar la eficacia de sistemas de filtrado externos, ya que el modelo generará contenido que normalmente sería bloqueado por modelos alineados.
- Desarrollo de aplicaciones de rol o juegos de texto: su falta de censura permite personajes y tramas más libres, aunque requiere supervisión humana para evitar contenido dañino.
- Benchmarking de cuantización: sirve como caso de estudio para medir la degradación de rendimiento entre el modelo original (safetensors) y su versión cuantizada Q8_0 en tareas de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas para este modelo o su base.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q8_0 pesa ~4,6 GB, por lo que se necesitan al menos 6 GB de VRAM para cargar el modelo y los buffers de contexto. Con contexto corto (2048 tokens) puede caber en 6 GB; con contextos más largos se requiere más memoria.
- GPU recomendadas: tarjetas con 8 GB o más de VRAM, como NVIDIA RTX 3060, RTX 4060, RTX 2070, o GPUs de datacenter como A10G. También puede ejecutarse en CPU con suficiente RAM (16 GB o más) usando llama.cpp, aunque con menor velocidad.
- Opciones de despliegue: llama.cpp (CLI o servidor), Ollama, LM Studio, o cualquier motor compatible con GGUF. También se puede usar vLLM si se convierte a otro formato, pero no es el caso.
- Latencia y throughput: no disponible. Depende del hardware y del tamaño de contexto. En una RTX 3060, se espera una velocidad de generación de 20-40 tokens por segundo para un modelo de 4B en Q8_0, pero es una estimación no confirmada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. Sin embargo, se puede comparar a nivel de especificaciones con otros modelos de ~4B parámetros:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen3.5-4B-SOMPOA-heresy-v2-MTP (este) | 4,3B | no disponible | Apache 2.0 | GGUF |
| Qwen2.5-4B-Instruct | 4,3B | 32K (típico) | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-3B-Instruct | 3,2B | 128K | Llama 3.2 | safetensors, GGUF |
| Phi-3.5-mini | 3,8B | 128K | MIT | safetensors, GGUF |

La principal diferencia es el perfil de seguridad: este modelo está ablacionado para eliminar rechazos, mientras que los instruct estándar incluyen alineación. No se conocen diferencias en rendimiento bruto.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una variante "uncensored", puede amplificar sesgos dañinos presentes en los datos de entrenamiento sin filtro alguno.
- Riesgo de alucinación: como cualquier modelo de 4B, puede generar información falsa o inventada, especialmente en temas especializados.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto; es probable que sea similar a la de Qwen3.5 (posiblemente 32K o 128K), pero no confirmado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede violar políticas de plataformas o leyes locales si se distribuye.
- Caveat para producción: la ausencia de filtros de seguridad hace que el modelo no sea apto para aplicaciones orientadas al público general sin una capa de moderación externa robusta.
- Falta de documentación: no hay información sobre el proceso de ablación, el dataset de entrenamiento ni las capacidades multimodales reales, lo que dificulta una evaluación rigurosa.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/altaldsijfasdf/Qwen3.5-4B-SOMPOA-heresy-v2-MTP-Q8_0-GGUF)
- [Modelo base](https://huggingface.co/MuXodious/Qwen3.5-4B-SOMPOA-heresy-v2-MTP)
- [Repositorio llama.cpp](https://github.com/ggerganov/llama.cpp)
- [Espacio GGUF-my-repo](https://huggingface.co/spaces/ggml-org/gguf-my-repo)
