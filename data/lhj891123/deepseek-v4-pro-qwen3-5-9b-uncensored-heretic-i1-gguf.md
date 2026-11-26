# lhj891123/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF

## Resumen
DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF es una cuantizacion en formato GGUF del modelo xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic, un modelo de 9.197.093.888 parametros (aproximadamente 9,2 mil millones) construido sobre la arquitectura Qwen3.5 y destilado a partir de DeepSeek-V4-Pro. El autor de la cuantizacion es lhj891123, mientras que el modelo base fue desarrollado por xtools-at. La model card indica que la cuantizacion ha sido realizada por mradermacher con tecnicas de imatrix/weighted quants.

El modelo esta orientado a razonamiento, matematicas, STEM, uso de herramientas y function calling, segun las etiquetas de la model card. Incorpora ademas las etiquetas "heretic", "uncensored", "decensored" y "abliterated", que indican que el modelo base ha sido modificado para eliminar o reducir los mecanismos de rechazo y censura presentes en el modelo original, un proceso conocido como abliteration. Esto lo hace relevante para investigadores que necesitan estudiar el comportamiento de modelos sin las capas de alineamiento restrictivas, aunque introduce riesgos importantes para uso en produccion.

La cuantizacion incluye una amplia gama de tipos (desde i1-Q2_K hasta i1-Q6_K, pasando por IQ3, IQ4, Q5, etc.), lo que permite desplegar el modelo en hardware muy diverso, desde GPUs de consumo con 6-8 GB de VRAM hasta estaciones de trabajo mas potentes. El repositorio ocupa 81,3 GB en total, aunque cada fichero individual pesa entre 4,0 y 7,7 GB segun el tipo de cuantizacion. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer, segun etiqueta `qwen3_5`); no se detallan mas especificaciones en la model card |
| Parametros totales | 9.197.093.888 (aproximadamente 9,2 mil millones) |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (ademas de fichero imatrix) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base esta en safetensors |

## Arquitectura y entrenamiento
La model card identifica la arquitectura mediante la etiqueta `qwen3_5`, lo que sugiere que el modelo base sigue el diseno de la familia Qwen3.5. El modelo se presenta como una destilacion de DeepSeek-V4-Pro, con etiquetas que mencionan `distillation`, `sft`, `rl` y `gspo` (una variante de optimizacion de politica para RL). Tambien aparece la etiqueta `mtp`, que en la familia DeepSeek suele corresponder a Multi-Token Prediction. No obstante, la model card no proporciona detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni los hiperparametros de RLHF/DPO.

El proceso de "heretic" o "abliteration" aplicado al modelo base implica la modificacion de las direcciones de activacion asociadas al rechazo de peticiones, de forma que el modelo deja de negarse a responder ciertos tipos de contenido. La cuantizacion i1 (imatrix) utiliza una matriz de importancia calculada sobre un dataset de calibracion para minimizar la perdida de calidad en los tipos de cuantizacion mas agresivos (Q2, Q3, IQ2, IQ3). El repositorio incluye el fichero imatrix para que otros usuarios puedan generar sus propias cuantizaciones.

## Capacidades
- Generacion de texto conversacional y razonamiento multi-paso, segun las etiquetas `reasoning` y `conversational`.
- Razonamiento matematico y STEM (`math`, `stem`).
- Generacion de codigo y uso de herramientas (`tool-use`, `function-calling`).
- Capacidades multimodales: la model card indica explicitamente "This is a vision model", aunque los ficheros mmproj (si existen) estarian en el repositorio estatico de mradermacher, no en este repositorio i1.
- Soporte multilingue en ingles, chino, coreano, japones, espanol y ruso.
- Modo de razonamiento (`reasoning`) segun la etiqueta, aunque no se detalla si es un modo "thinking" explicito.
- Modelo "uncensored"/"abliterated": responde sin los rechazos tipicos del modelo alineado original.

## Casos de uso
- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como varia el comportamiento de un modelo Qwen3.5 destilado de DeepSeek-V4-Pro tras aplicar abliteration, comparando respuestas con el modelo base alineado en tareas sensibles.
- Despliegue en hardware de consumo: las cuantizaciones i1-Q4_K_M (5,9 GB) e i1-Q4_K_S (5,6 GB) permiten ejecutar el modelo en GPUs con 8 GB de VRAM, ideal para prototipado local de asistentes conversacionales.
- Generacion de codigo en local: gracias a las capacidades de function calling y tool use, puede integrarse en entornos de desarrollo sin conexion a la nube, por ejemplo en pipelines de CI/CD que requieran generacion de parches o tests.
- Razonamiento matematico y STEM: util para tutoria automatica o resolucion de problemas paso a paso en entornos educativos, con la ventaja de poder ejecutarse en estaciones de trabajo sin GPU de datacenter.
- Procesamiento multilingue: al soportar en, zh, ko, ja, es y ru, puede emplearse en tareas de traduccion o atencion al cliente en esos idiomas, con la salvedad de que la calidad por idioma no esta documentada.
- Experimentacion con modelos sin censura: para investigadores que necesitan generar datasets sinteticos sobre temas que los modelos alineados rechazan, con las precauciones eticas y legales correspondientes.
- Analisis de documentos con vision (si se dispone del mmproj): la model card indica que es un modelo de vision, por lo que, con los ficheros mmproj del repositorio estatico, podria emplearse para descripcion de imagenes o extraccion de informacion visual.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia (aproximada, segun tamano del fichero GGUF y overhead de contexto):
  - i1-Q2_K (4,0 GB): ~4,5-5 GB de VRAM.
  - i1-IQ3_M / i1-Q3_K_M (4,6-4,8 GB): ~5-5,5 GB de VRAM.
  - i1-Q4_K_S / i1-Q4_K_M (5,6-5,9 GB): ~6,5-7 GB de VRAM.
  - i1-Q5_K_M (6,7 GB): ~7,5-8 GB de VRAM.
  - i1-Q6_K (7,7 GB): ~8,5-9 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q6; A100 o H100 no son necesarias para un modelo de 9B, pero permitirian mayor throughput y contexto.
- Cabe en GPU de consumo: si, desde una RTX 3060 12 GB o incluso GPUs de 8 GB con cuantizaciones Q3/Q4.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). La etiqueta `text-generation-inference` aparece en el repositorio, aunque TGI no es el backend nativo para GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF (este) | ~9,2B | no disponible | Apache 2.0 | GGUF | Cuantizacion imatrix, abliterated, vision segun model card |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | ~9,2B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF | ~9,2B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas (no imatrix) del mismo modelo base |
| Qwen3.5-9B (familia base, si existe publicamente) | ~9B | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias
- Modelo abliterated/uncensored: se ha eliminado o reducido el rechazo a contenido sensible, lo que aumenta el riesgo de generar contenido danino, ilegal o sesgado. No es apto para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede inventar hechos, especialmente en tareas de razonamiento o matematicas complejas; no hay benchmarks publicados que cuantifiquen su fiabilidad.
- Idiomas: aunque se declaran seis idiomas, no hay evaluacion de calidad por idioma; es probable que el rendimiento en es, ko, ja y ru sea inferior al de en y zh.
- Contexto: la longitud de contexto no esta documentada, por lo que no se puede garantizar el manejo de conversaciones o documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre el cumplimiento normativo del contenido generado.
- Vision: la model card menciona que es un modelo de vision, pero los ficheros mmproj no estan en este repositorio i1; habria que obtenerlos del repositorio estatico de mradermacher.
- Procedencia: el nombre del modelo ("DeepSeek-V4-Pro") y las fechas (creado en 2026) no se pueden verificar con la informacion disponible; conviene contrastar la autenticidad del modelo base antes de usarlo en produccion.

## Enlaces
- Repositorio Hugging Face de este modelo: https://huggingface.co/lhj891123/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Cuantizaciones estaticas de mradermacher: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Pagina de overview de mradermacher para este modelo: https://hf.tst.eu/model#DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de comparacion de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
