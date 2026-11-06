# kingfang008/CantoneseLLM-v2.0-8B-Thinking-mlx-4bit

## Resumen

CantoneseLLM-v2.0-8B-Thinking-mlx-4bit es una conversión cuantizada del modelo hon9kon9ize/CantoneseLLM-v2.0-8B-Thinking, un modelo basado en Qwen3-8B entrenado para razonamiento y respuestas en cantonés de Hong Kong. El repositorio lo publica el usuario kingfang008 y no contiene un modelo entrenado desde cero, sino un checkpoint convertido a formato MLX con cuantización afín de 4 bits, pensado para inferencia local en Macs con Apple Silicon.

El modelo resuelve un nicho concreto: generación de texto y razonamiento en cantonés (yue), con soporte adicional de chino mandarín (zh) e inglés (en). Su relevancia actual radica en que el ecosistema MLX permite ejecutar un modelo de 8.190 millones de parámetros en hardware de consumo de Apple con un peso en disco de aproximadamente 4,6 GB, algo que en BF16 requeriría del orden del doble de memoria.

La conversión se realizó con MLX 0.32.4 y MLX-LM 0.32.2, partiendo de los safetensors BF16 originales. Es importante subrayar que el autor declara explícitamente que la validación estructural no equivale a una evaluación de calidad: no se han completado pruebas de inferencia en Apple Silicon ni evaluaciones comparativas de traducción o calidad en el momento de la publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen3 (según tags del repo y modelo base) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX afín de 4 bits, group size 64 (aproximadamente 4,5 bits efectivos por peso incluyendo metadatos) |
| Idiomas soportados | yue (cantonés), zh (chino), en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 907 tensores indexados, 4.607.835.174 bytes |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen3-8B, un transformer decoder-only, según indican los tags del repositorio y la model card del autor de la conversión. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo original utilizó RLHF, DPO u otras técnicas de alineación; esos datos corresponden al modelo base hon9kon9ize/CantoneseLLM-v2.0-8B-Thinking y no se incluyen en la información proporcionada.

La innovación técnica de este repositorio es exclusivamente la conversión: cuantización afín de 4 bits con group size 64 aplicada sobre los pesos BF16 originales (revisión 479d160f7264361eed85c07355e8447c4492f6ff), verificada mediante SHA256 de los siete ficheros de origen. El resultado son 907 tensores en safetensors con un tamaño de 4.607.835.174 bytes. Se trata de un modelo de tipo Thinking, por lo que genera trazas de razonamiento que las aplicaciones deben separar de la respuesta final.

## Capacidades

- Generación de texto conversacional en cantonés de Hong Kong, con soporte de chino e inglés.
- Razonamiento explícito en modo Thinking: el modelo produce cadenas de razonamiento antes de la respuesta final, que la aplicación debe gestionar por separado.
- Conversación multi-turno mediante la plantilla de chat original de Qwen3, incluida en el repositorio.
- Traducción y respuestas en cantonés: la model card advierte que la idoneidad para traducción requiere pruebas específicas por tarea y que la conversión por sí sola no la garantiza.
- Tool calling y function calling: no confirmado en la información disponible para esta conversión.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistentes conversacionales en cantonés para usuarios de Hong Kong: el modelo puede mantener diálogos multi-turno en yue usando la plantilla de chat incluida, lo que lo hace adecuado para interfaces de atención al usuario en esa variante lingüística.
- Inferencia local en Macs con Apple Silicon: gracias a la cuantización de 4 bits y al formato MLX, un portátil con memoria unificada suficiente puede ejecutar el modelo sin GPU dedicada, útil para prototipado y demos offline.
- Traducción y localización de contenido hacia cantonés: adecuado para borradores de traducción zh/en a yue, siempre que se validen las salidas con revisión humana, tal como advierte el autor.
- Generación de respuestas con razonamiento visible: aplicaciones educativas o de depuración que necesiten mostrar la cadena de pensamiento separada de la respuesta final.
- Procesamiento de texto en entornos con requisitos de privacidad: al ejecutarse localmente en el dispositivo, evita enviar datos a servicios en la nube, relevante para documentos sensibles en cantonés.
- Investigación sobre modelos lingüísticamente específicos: sirve como punto de partida para estudiar el comportamiento de Qwen3-8B ajustado a cantonés y comparar variantes cuantizadas frente al BF16 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se han completado evaluaciones comparativas de traducción o calidad, y que la validación estructural no debe interpretarse como un benchmark de calidad o velocidad.

## Requisitos de hardware

- VRAM/memoria estimada: el fichero de pesos ocupa 4.607.835.174 bytes (aproximadamente 4,6 GB); en la práctica se necesita memoria adicional para el contexto KV y el runtime de MLX.
- GPU recomendadas: no aplica en el sentido tradicional; el modelo está pensado para Apple Silicon con backend MLX. La conversión se realizó con MLX en backend CPU sobre Linux (WSL Ubuntu).
- ¿Cabe en GPU de consumo? No hay datos publicados sobre ejecución en GPU NVIDIA. Para Apple Silicon, el tamaño de 4 bits sugiere que puede caber en equipos con memoria unificada de 16 GB o superior, aunque no se ha validado la inferencia en Apple Silicon según la model card.
- Opciones de despliegue: MLX-LM (librería declarada). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI en esta conversión.
- Latencia y throughput: no disponibles. El autor señala que una prueba corta de generación en CPU Linux quedó pendiente en la publicación inicial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| CantoneseLLM-v2.0-8B-Thinking-mlx-4bit (este) | 8,19 B | no disponible | yue, zh, en | Apache-2.0 | safetensors MLX 4-bit |
| hon9kon9ize/CantoneseLLM-v2.0-8B-Thinking (base) | 8,19 B | no disponible | yue, zh, en | Apache-2.0 | safetensors BF16 |
| Qwen3-8B (modelo de partida arquitectónico) | 8 B aprox. | no disponible en la información | multilingüe | no disponible en la información | safetensors |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- La model card advierte que no se han completado evaluaciones de calidad ni de velocidad; la validación es únicamente estructural (cabeceras safetensors, 907 tensores, configuración de cuantización y ficheros de tokenizer).
- La inferencia en Apple Silicon no estaba validada en el momento de la publicación; la prueba de humo en CPU Linux quedó pendiente.
- Al ser una cuantización de 4 bits, es esperable cierta degradación de calidad frente al BF16 original, aunque no se han publicado mediciones al respecto.
- Modelo de tipo Thinking: las aplicaciones deben separar el razonamiento de la respuesta final; un manejo inadecuado puede filtrar cadenas de pensamiento al usuario.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas en esta conversión.
- Sesgos conocidos: no documentados en la información disponible.
- Cobertura idiomática limitada a yue, zh y en; el rendimiento fuera de esos idiomas no está garantizado.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial; aun así, conviene revisar la model card y repositorios del modelo original para procedencia y limitaciones.
- La idoneidad para traducción al cantonés requiere pruebas específicas por tarea según el propio autor.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/kingfang008/CantoneseLLM-v2.0-8B-Thinking-mlx-4bit
- Modelo base: https://huggingface.co/hon9kon9ize/CantoneseLLM-v2.0-8B-Thinking
- Model card del modelo original incluida en el repo: UPSTREAM_MODEL_CARD.md (referenciada en el repositorio)
- Librería MLX: no se proporciona URL en la información disponible
- Librería MLX-LM: no se proporciona URL en la información disponible
