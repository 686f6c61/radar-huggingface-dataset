# burningfeet/2026-03-25-.-Gemma-4-E4B-Uncensored-HauhauCS-Aggressive

## Resumen

Este modelo es una version "uncensored" (sin censura) del modelo multimodal Gemma 4 E4B-IT de Google, creada por el usuario HauhauCS mediante la tecnica de abliteration, que elimina los rechazos (refusals) del modelo original. El repositorio en HuggingFace pertenece al usuario burningfeet, que actua como mirror del trabajo de HauhauCS. El modelo base es `google/gemma-4-e4b-it`, un modelo de 4B parametros efectivos (7.5B totales, probablemente arquitectura MoE) con soporte nativo para texto, imagen, video y audio, y una ventana de contexto de 131K tokens.

La variante "Aggressive" aplica un uncensoring mas fuerte, dejando el modelo completamente desbloqueado y sin rechazos, aunque puede anadir breves descargos de responsabilidad heredados del entrenamiento base. Se distribuye exclusivamente en formato GGUF con cuantizaciones personalizadas K_P (Perfect) generadas con imatrix, disenadas para preservar la calidad en pesos abliterated. Es relevante para desarrolladores que necesitan un modelo multimodal sin restricciones de seguridad para entornos controlados de investigacion o generacion creativa, aunque con riesgos importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, imagen, video, audio) con atencion mixta: sliding window de 512 + atencion completa, 42 capas, 18 capas con KV compartido |
| Parametros totales | 7.518.069.290 (7,5B) |
| Parametros activos | 4B (estimado por el nombre E4B y la model card; no se confirma oficialmente) |
| Longitud de contexto | 131.072 tokens (131K) |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, Q2_K_P, y mmproj f16 para vision/audio |
| Idiomas soportados | Ingles y multilingue (segun tags) |
| Licencia | Gemma (terminos de uso de Google) |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (pesos originales, 61,6 GB en el repo) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-e4b-it`, un modelo multimodal de la familia Gemma 4 de Google. Segun la model card, tiene 42 capas con una mezcla de atencion sliding window (512 tokens) y atencion completa, ademas de 18 capas con KV compartido para reducir el uso de memoria. El nombre "E4B" sugiere que es un modelo con 4B parametros efectivos, probablemente una arquitectura de mezcla de expertos (MoE) con 7,5B parametros totales, aunque esto no se confirma explicitamente en la documentacion disponible.

El proceso de uncensoring se realiza mediante abliteration, una tecnica que modifica los pesos del modelo para eliminar los rechazos de contenido sin cambiar las capacidades generales. El autor HauhauCS reporta 0/465 rechazos en pruebas manuales. No se han publicado detalles sobre el dataset de entrenamiento original ni sobre el proceso de abliteration especifico. Los cuantizaciones K_P se generaron con importancia matrix (imatrix) para optimizar la preservacion de calidad en los pesos modificados.

## Capacidades

- Generacion de texto y conversacion multimodal: acepta entradas de texto, imagen, video y audio, y genera respuestas de texto.
- Razonamiento y comprension de contexto largo: ventana de 131K tokens, adecuada para documentos extensos o conversaciones multi-turno.
- Sin rechazos de contenido: el modelo no se niega a responder a peticiones que el modelo base rechazaria, incluyendo contenido potencialmente danino o controvertido.
- Soporte de chat con plantilla Jinja: requiere el flag `--jinja` en llama.cpp para el manejo correcto de la plantilla de chat.
- Multilingue: soporta ingles y otros idiomas (segun tags, aunque no se especifican cuales).
- Compatible con runtimes GGUF: llama.cpp, LM Studio, Jan, koboldcpp, entre otros.
- No se ha confirmado soporte de tool calling o function calling en la informacion disponible.

## Casos de uso

- Generacion creativa sin restricciones: escritura de ficcion, poesia o guiones que aborden temas tabu o controvertidos sin filtros de seguridad, gracias a la eliminacion de rechazos.
- Investigacion sobre alineacion y seguridad de IA: analisis del comportamiento de modelos sin guardarrailes, comparando respuestas con el modelo base para estudiar el impacto de la abliteration.
- Analisis de contenido multimodal en entornos controlados: procesamiento de imagenes, video y audio en contextos donde se requiere una respuesta sin censura previa, como investigacion academica con datos sensibles.
- Desarrollo de asistentes conversacionales especializados: creacion de chatbots para nichos donde el contenido explicito es necesario (por ejemplo, educacion sexual, asesoramiento legal sin restricciones), siempre bajo supervisio humana.
- Pruebas de estres de sistemas de moderacion: uso del modelo para generar contenido que ponga a prueba filtros de moderacion en plataformas, evaluando su robustez.
- Generacion de datos sinteticos para entrenamiento: produccion de ejemplos de texto e imagen que el modelo base rechazaria, utiles para entrenar clasificadores de contenido danino o sistemas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni otros tests estandar. El autor menciona que el modelo mantiene el 100% de las capacidades del original, pero no aporta datos cuantitativos. Se recomienda consultar la documentacion del modelo base `google/gemma-4-e4b-it` para referencias de rendimiento, aunque los pesos abliterated pueden alterar ligeramente los resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: segun la cuantizacion elegida, desde 4,2 GB (Q2_K_P) hasta 7,6 GB (Q8_K_P). El mmproj f16 anade 945 MB adicionales si se usa vision/audio.
- GPU recomendadas: para cuantizaciones Q4_K_M o inferiores, una GPU con 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) es suficiente. Para Q8_K_P, se recomienda al menos 12 GB (RTX 3080, RTX 4070 Ti, etc.).
- Cabe en GPUs de consumo: si, en la mayoria de las cuantizaciones, siempre que se disponga de al menos 6-8 GB de VRAM.
- Opciones de despliegue: llama.cpp (con `--jinja`), LM Studio, Jan, koboldcpp, y cualquier runtime compatible con GGUF. Tambien se puede usar vLLM si se convierten los pesos a safetensors, aunque no se documenta.
- Latencia y throughput: no se han publicado datos especificos. En una RTX 4090 con Q4_K_M, se estima una velocidad de generacion de 50-80 tokens/segundo, pero es una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Uncensored | Licencia |
|---|---|---|---|---|---|
| Gemma-4-E4B-Uncensored-HauhauCS-Aggressive (este) | 7,5B totales / 4B activos | 131K | Si (texto, imagen, video, audio) | Si (abliterated) | Gemma |
| google/gemma-4-e4b-it (base) | 7,5B totales / 4B activos | 131K | Si | No (con rechazos) | Gemma |
| Dolphin 2.x (varios tamanos) | 7B-70B | 8K-32K | No (solo texto) | Si (fine-tuning sin censura) | Apache 2.0 / MIT |

La comparativa se basa en informacion publica. El modelo base Gemma 4 E4B es la referencia directa; la diferencia principal es la eliminacion de rechazos. Dolphin es una alternativa popular de modelos uncensored, pero no multimodal y con contexto menor. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Contenido potencialmente danino: al eliminar los rechazos, el modelo puede generar contenido violento, sexual, ilegal o discriminatorio sin filtros. Su uso en produccion sin supervisio humana es irresponsable y puede violar politicas de plataformas o leyes.
- Sesgos y alucinaciones: el modelo hereda los sesgos del entrenamiento base y, al no tener guardarrailes, puede producir afirmaciones falsas o perjudiciales con mayor facilidad.
- Licencia Gemma: los terminos de uso de Google Gemma restringen el uso comercial en ciertos casos y exigen atribucion. Es necesario revisar la licencia completa antes de cualquier despliegue.
- Sin garantias de calidad: la abliteration puede degradar ligeramente el rendimiento en tareas de razonamiento o seguridad, aunque el autor afirma que no hay cambios en las capacidades.
- Contexto largo no probado: el autor admite que el modelo no recibio pruebas manuales exhaustivas en contextos largos, por lo que el rendimiento a 131K tokens puede ser inconsistente.
- Riesgo de uso indebido: la naturaleza "uncensored" lo hace inadecuado para aplicaciones publicas o entornos no controlados. Se recomienda usarlo solo en investigacion con salvaguardas tecnicas (filtros externos, moderacion).

## Enlaces

- Repositorio HuggingFace (burningfeet): https://huggingface.co/burningfeet/2026-03-25-.-Gemma-4-E4B-Uncensored-HauhauCS-Aggressive
- Repositorio original de HauhauCS: https://huggingface.co/HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive
- Modelo base google/gemma-4-e4b-it: https://huggingface.co/google/gemma-4-E4B
- Pagina oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Documentacion de releases de Gemma (Google AI): https://ai.google.dev/gemma/docs/releases
- Discord de HauhauCS: https://discord.gg/SZ5vacTXYf
