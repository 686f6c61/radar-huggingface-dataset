# mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated-i1-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated-i1-GGUF es una cuantizacion GGUF con imatrix del modelo yuna1126/DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated, publicada por mradermacher. Se trata de un modelo de 9.197.093.888 parametros (aproximadamente 9,2 mil millones) construido sobre una base de la familia Qwen 3.5 y destilado a partir de DeepSeek, segun los tags de la model card (distillation, deepseek, qwen3_5). El autor de la cuantizacion ofrece un abanico amplio de niveles de compresion, desde i1-Q2_K (4,0 GB) hasta i1-Q6_K (7,7 GB), lo que permite desplegarlo en hardware de consumo.

El modelo esta orientado a razonamiento, matematicas, STEM, uso de herramientas y function calling, e incorpora tecnicas de entrenamiento como SFT, RL y GSPO, ademas de MTP (multi-token prediction). La model card menciona que es un modelo de vision, con ficheros mmproj alojados en el repositorio estatico del mismo autor. Los idiomas declarados son ingles, chino, coreano, japones, espanol y ruso, y la licencia es Apache 2.0.

La relevancia practica de esta ficha radica en que la cuantizacion i1 con imatrix de mradermacher permite ejecutar un modelo de 9B con capacidades de razonamiento y tool use en GPUs de consumo, manteniendo un equilibrio entre tamano y calidad. No obstante, la informacion publicada es escasa en cuanto a arquitectura detallada, contexto y benchmarks, por lo que muchos datos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, segun tags; detalles no disponibles) |
| Parametros totales | 9.197.093.888 (aprox. 9,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de los tags, que apuntan a la familia Qwen 3.5 (qwen3_5) y a un proceso de destilacion desde DeepSeek (distillation, deepseek). El modelo base se distribuye con library_name transformers y los pesos originales estan en safetensors, con 9.197.093.888 parametros. Los tags indican que se ha entrenado con SFT, RL y GSPO, y que incorpora MTP (multi-token prediction). No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO mas alla de las siglas mencionadas.

La model card del repositorio cuantizado no aporta detalles adicionales sobre atencion, decodificacion especulativa u otras innovaciones. La cuantizacion i1 emplea un fichero imatrix (0,1 GB) generado para mejorar la calidad de los quants de baja precision; el autor indica que los quants IQ suelen ser preferibles a quants no IQ de tamano similar. La model card tambien senala que se trata de un modelo de vision y que los ficheros mmproj, si existen, se encuentran en el repositorio estatico (DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated-GGUF).

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso.
- Razonamiento matematico y tareas STEM (tags math, stem).
- Uso de herramientas y function calling (tags tool-use, function-calling).
- Capacidades de agente y razonamiento multi-paso, segun los tags de razonamiento.
- Capacidades multilingues en ingles, chino, coreano, japones, espanol y ruso.
- Modo de razonamiento (tag reasoning) y prediccion multi-token (MTP).
- Capacidades de vision segun la model card (ficheros mmproj en el repositorio estatico).
- Compatibilidad con endpoints (tag endpoints_compatible) y con text-generation-inference.

## Casos de uso

- Asistente de razonamiento tecnico: el modelo puede resolver problemas de matematicas y STEM paso a paso gracias a su modo de razonamiento, adecuado para tutoria o generacion de explicaciones en entornos educativos.
- Automatizacion de function calling: al soportar tool use, puede integrarse en pipelines que invoquen APIs externas, consultas a bases de datos o servicios internos, decidiendo que herramienta llamar y con que argumentos.
- Agente multi-paso en desarrollo: con capacidades de agente y razonamiento, puede encadenar pasos para tareas como depuracion, planificacion de tareas o resolucion de incidencias en un repositorio.
- Despliegue local en estaciones de trabajo: las cuantizaciones i1-Q4_K_M (5,9 GB) e i1-Q4_K_S (5,6 GB) permiten ejecutar el modelo en GPUs de consumo, util para prototipado sin depender de la nube.
- Procesamiento multilingue: con soporte para seis idiomas, puede emplearse en atencion al cliente o traduccion asistida en entornos con usuarios en ingles, chino, coreano, japones, espanol y ruso.
- Analisis de documentos con vision: si se emplean los ficheros mmproj del repositorio estatico, el modelo puede abordar tareas de comprension de imagenes combinadas con texto, como extraccion de informacion de capturas o formularios.
- Generacion de codigo asistida: aunque no se detalla un benchmark de codigo, los tags de razonamiento y tool use permiten integrarlo en asistentes de programacion que consulten documentacion o ejecuten pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: i1-Q2_K ~4,0 GB; i1-IQ3_S ~4,6 GB; i1-Q4_K_S ~5,6 GB; i1-Q4_K_M ~5,9 GB; i1-Q5_K_M ~6,7 GB; i1-Q6_K ~7,7 GB. A estas cifras hay que anadir la memoria para el contexto KV y, en su caso, los ficheros mmproj de vision.
- GPU recomendadas: no disponibles de forma especifica en la informacion proporcionada. Por tamano, las cuantizaciones Q4 caben en GPUs de consumo con 8 GB o mas; las Q6 requieren alrededor de 8-10 GB.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas para las cuantizaciones Q4, y con 10-12 GB para Q6. No se confirma compatibilidad con GPUs de 6 GB para las cuantizaciones de mayor tamano.
- Opciones de despliegue: llama.cpp y derivados compatibles con GGUF (Ollama, LM Studio, entre otros); el modelo base es compatible con transformers y text-generation-inference. La model card no detalla recetas de vLLM o TGI para el formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated-i1-GGUF | 9,2B | no disponible | Apache 2.0 | GGUF (i1) | Cuantizacion imatrix de un modelo destilado de DeepSeek sobre base Qwen 3.5 |
| Modelo base yuna1126/DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated | 9,2B | no disponible | Apache 2.0 | safetensors | Pesos originales sin cuantizar |
| Cuantizaciones estaticas de mradermacher (DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated-GGUF) | 9,2B | no disponible | Apache 2.0 | GGUF (estaticas) | Misma base, sin imatrix; incluye ficheros mmproj de vision |

No se dispone de datos de benchmarks ni de modelos comparables de terceros en la informacion proporcionada, por lo que no es posible una comparativa de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- La informacion publicada es muy escasa: no se detallan contexto, composicion del dataset ni resultados de evaluacion, lo que dificulta estimar su calidad real.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad.
- El nombre incluye "Abliterated", un termino asociado a modificaciones de alineamiento o filtros; conviene verificar el comportamiento etico y de seguridad antes de usarlo en produccion.
- No se especifican sesgos conocidos ni evaluaciones de seguridad.
- La longitud de contexto no esta documentada, lo que limita la planificacion de cargas con ventanas largas.
- Aunque la licencia es Apache 2.0, el modelo base y los datos de destilacion pueden tener condiciones adicionales no reflejadas en la model card; conviene revisar el repositorio original.
- Las cuantizaciones de baja precision (Q2, Q3) degradan la calidad; el propio autor recomienda IQ3_XXS o superiores frente a Q2_K.
- El soporte de vision depende de ficheros mmproj alojados en el repositorio estatico, no en el repositorio i1; su disponibilidad y calidad no estan verificadas.
- El modelo tiene solo 1 like y 5444 descargas en el momento de la consulta, lo que sugiere una validacion comunitaria limitada.

## Enlaces

- Repositorio Hugging Face (cuantizaciones i1): https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated-i1-GGUF
- Repositorio de cuantizaciones estaticas y mmproj: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated-GGUF
- Modelo base: https://huggingface.co/yuna1126/DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated
- Pagina de descargas del autor: https://hf.tst.eu/model#DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de quants de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
