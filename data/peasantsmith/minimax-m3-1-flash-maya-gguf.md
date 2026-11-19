# peasantsmith/MiniMax-M3.1-Flash-Maya-GGUF

## Resumen

MiniMax-M3.1-Flash es un modelo multimodal de tipo mixture-of-experts (MoE) desarrollado por MiniMax, con 428.000 millones de parametros totales y 23.000 millones activos por token. Esta ficha cubre la version cuantizada publicada por peasantsmith bajo el nombre Maya GGUF, una conversion a formato GGUF realizada con cuantizadores de llama.cpp y calibracion propia (imatrix por experto) pensada para ejecutar el modelo en equipos de sobremesa mediante el motor Project Maya, que mantiene los expertos mas usados en GPU y calcula el resto desde RAM.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de 428B parametros con contexto de hasta 1M tokens en una maquina con 128 GB de memoria, algo inviable con los pesos originales (FP4 en expertos, FP8 en capas densas). Se ofrecen dos variantes, Maya-S (122,4 GB en memoria, perdida de entropia cruzada de +0,8% respecto al original) y Maya-XS (93,0 GB, +5,0%).

El repositorio acumula 69.620 descargas y 15 likes desde su creacion el 26 de octubre de 2026, con ultima actualizacion el 11 de noviembre de 2026. La licencia es la MiniMax Community License, que permite uso no comercial y condiciona el comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con atencion dispersa en todas las capas (128 expertos enrutados por capa, 4 activos, mas un experto compartido) |
| Parametros totales | 428B (pesos originales); el dato de safetensors del repo indica 6144, inconsistente con la model card |
| Parametros activos | 23B por token |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | Maya-S: IQ2_XXS en expertos enrutados (IQ2_XS/IQ2_S/IQ3_XXS en capas sensibles), Q8_0 en atencion e indexador, Q6_K en expertos compartidos, capas densas, embeddings y salida. Maya-XS: IQ1_S en expertos (IQ2_XXS en capas sensibles), Q5_K/Q6_K en atencion, Q8_0 en indexador, Q5_K/Q4_K/Q6_K en el resto |
| Idiomas soportados | No disponible (la model card menciona evaluacion de chat multilingue sin listar idiomas) |
| Licencia | MiniMax Community License (uso no comercial libre; uso comercial con condiciones, incluida la atribucion "Built with MiniMax M3.1-Flash") |
| Formato de pesos | GGUF (layout `minimax-m3` de llama.cpp); el repo tambien contiene safetensors como tag |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal con 128 expertos enrutados por capa, de los cuales se activan 4 por token, mas un experto compartido, lo que resulta en 23B parametros activos sobre 428B totales. Emplea atencion dispersa en todas las capas, con un indexador de atencion dispersa por capa, y admite entradas de imagen y texto (pipeline `image-text-to-text`). Los pesos originales de MiniMax usan FP4 en los expertos y FP8 en las capas densas.

Las cuantizaciones de esta ficha se generaron desde la publicacion original de MiniMax, no desde un archivo ya recuantizado, y conservan todos los expertos. El proceso incluye calibracion con texto en el formato de chat propio de MiniMax (incluido el modo thinking): tool calls y trazas de agente, codigo (three.js, canvas, WebGL, front-end), razonamiento, respuestas largas, chat y chat multilingue, con 384 secuencias de 2.048 tokens y un conjunto de validacion separado. Se calculo una matriz de importancia por experto, se asignaron bits extra a las capas mas sensibles y se aplico redondeo con retroalimentacion de error en bloques de 256 pesos, calibrando cada capa sobre la salida de las capas ya cuantizadas. Los cuantizadores empleados son los de llama.cpp (ggml).

El paquete incluye ademas el drafter DSpark de MiniMax (2,3 GB) para decodificacion especulativa y la torre de vision original (1,7 GB). Los indexadores de las capas 0-2 se distribuyen en un GGUF aparte (`*-maya-indexers.gguf`); Project Maya los carga para replicar el comportamiento definido por MiniMax, mientras que llama.cpp estandar ejecuta esas tres capas con atencion completa.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con niveles de thinking configurables segun la model card.
- Generacion de codigo, con enfasis declarado en front-end, three.js, WebGL y canvas.
- Tool calling y function calling, con evaluacion especifica de tool calls y agentes.
- Uso como agente: trazas de agente incluidas en el conjunto de calibracion y compatibilidad con API estilo OpenAI y Anthropic.
- Capacidades multimodales de imagen a texto (torre de vision incluida en el repo).
- Chat multilingue (evaluado en la tabla de calidad, sin listado de idiomas).
- Contexto largo de hasta 1M tokens gracias a la atencion dispersa.
- Decodificacion especulativa mediante el drafter DSpark.
- Servicio con streaming a traves del motor Project Maya (dashboard en `http://127.0.0.1:8080` y API compatible).

## Casos de uso

- Asistencia de codigo front-end en local: el modelo rinde especialmente en tareas de three.js, WebGL, canvas y front-end (92,0% y 94,6% de coincidencia con el token superior del original en Maya-S), por lo que encaja en un asistente de IDE o en la generacion de prototipos visuales sin enviar codigo a la nube.
- Agentes autonomos con tool calling: la evaluacion de tool calls y agentes alcanza el 92,1% en Maya-S, y la API es compatible con OpenAI y Anthropic, lo que permite conectarlo a frameworks de agentes existentes sin adaptadores.
- Analisis de documentos extensos: con hasta 1M tokens de contexto y atencion dispersa, es adecuado para resumir o consultar repositorios completos, expedientes o bases de conocimiento en una sola pasada.
- Procesamiento de imagenes con texto (image-text-to-text): la torre de vision incluida permite describir capturas, extraer datos de diagramas o responder preguntas sobre imagenes en un flujo local.
- Chat multilingue de atencion al cliente: el modelo mantiene un 78,5% de coincidencia en chat multilingue en Maya-S, suficiente para conversaciones multi-turno con contexto largo, aunque la calidad en chat general es la categoria mas debil (76,4%).
- Despliegue en estacion de trabajo con 128 GB de RAM: Maya-XS (93,0 GB) esta disenado para caber en la memoria de un PC de 128 GB, lo que permite ofrecer inferencia privada de un modelo de 428B sin servidores dedicados.
- Generacion de codigo en pipelines de CI/CD: la compatibilidad con llama.cpp y con la API local permite integrarlo en revisiones automatizadas o generacion de pruebas, con la salvedad de la latencia derivada del calculo de expertos en RAM.

## Benchmarks y rendimiento

La model card no incluye benchmarks academicos (MMLU, HumanEval, GSM8K). Publica una evaluacion de fidelidad frente al modelo original: porcentaje de coincidencia con el token superior predicho por los pesos originales de MiniMax, sobre conversaciones no usadas en calibracion.

| Categoria | Maya-S | Maya-XS |
|---|---:|---:|
| Tool calls y agentes | 92,1% | 88,8% |
| three.js / WebGL / canvas | 92,0% | 88,5% |
| Front-end web | 94,6% | 91,7% |
| Codigo | 93,7% | 90,9% |
| Razonamiento | 85,9% | 80,4% |
| Chat | 76,4% | 66,5% |
| Chat multilingue | 78,5% | 71,6% |
| Media de categorias | 87,6% | 82,6% |

Perdida de entropia cruzada (NLL) frente al original: +0,8% en Maya-S y +5,0% en Maya-XS. Tamanos en memoria: 122,4 GB y 93,0 GB respectivamente.

## Requisitos de hardware

- Memoria: Maya-S requiere 122,4 GB en memoria; Maya-XS, 93,0 GB. El diseno de Project Maya combina VRAM y RAM del sistema, por lo que el total de memoria del equipo debe superar esas cifras.
- GPU: Project Maya soporta NVIDIA desde V100 en adelante, y AMD (la model card indica los mismos resultados en ambas plataformas).
- GPU de consumo: la model card no confirma ejecucion en GPU de consumo aisladas; el requisito real es el total de memoria del sistema (un PC de 128 GB para Maya-XS), no una GPU concreta.
- Almacenamiento: el repo completo ocupa 219,5 GB.
- Despliegue: Project Maya v1.1.30 o superior (recomendado, con dashboard y API compatible con OpenAI y Anthropic); los shards tambien cargan en llama.cpp con el layout `minimax-m3`.
- Latencia y throughput: no disponibles. La decodificacion especulativa con DSpark y el calculo de expertos desde RAM condicionan el rendimiento, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros y disponibilidad.

| Modelo | Parametros | Activos | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| MiniMax-M3.1-Flash (original) | 428B | 23B | 1M | safetensors (FP4/FP8) | MiniMax Community |
| Maya-S (esta ficha) | 428B | 23B | 1M | GGUF IQ2_XXS | MiniMax Community |
| Maya-XS (esta ficha) | 428B | 23B | 1M | GGUF IQ1_S | MiniMax Community |

No disponible la comparacion con alternativas de otros desarrolladores por falta de datos en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce degradacion medible: +5,0% de NLL en Maya-XS y un descenso de calidad especialmente marcado en chat (66,5% frente a 76,4% de Maya-S). Para tareas conversacionales, Maya-S es claramente preferible.
- El chat general y el chat multilingue son las categorias con menor fidelidad incluso en Maya-S (76,4% y 78,5%), por lo que no es la opcion ideal para atencion al cliente de alta exigencia.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan evaluaciones de veracidad.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no se listan; la evaluacion multilingue no especifica que lenguas cubre.
- Licencia: uso no comercial libre; el uso comercial esta condicionado, incluida la obligacion de mostrar "Built with MiniMax M3.1-Flash". Las cuantizaciones heredan la misma licencia.
- Dependencia de Project Maya para el comportamiento completo: llama.cpp estandar ejecuta las capas 0-2 con atencion completa al cargar solo los shards, lo que altera el comportamiento definido por MiniMax.
- El dato de parametros del campo safetensors del repo (6144) es inconsistente con los 428B de la model card; debe tratarse como un error de metadatos.
- Requiere hardware con al menos 93 GB de memoria total y un proceso de descarga y compilacion no trivial (setup de Project Maya).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/peasantsmith/MiniMax-M3.1-Flash-Maya-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Project Maya (motor): https://github.com/mw00/project-maya
- Licencia: LICENSE dentro del repositorio (MiniMax Community License)
