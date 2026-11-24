# dream-only/lg-decision-27B

## Resumen

lg-decision-27B es un modelo de lenguaje de 27.356 millones de parámetros derivado por fine-tuning de Qwen/Qwen3.8-27B, desarrollado por el usuario dream-only y publicado bajo licencia Apache 2.0. No es un modelo generativo al uso: está especializado en tareas de decisión tipadas (clasificación, elección múltiple, reranking de recuperación y selección de herramientas). El modelo recibe un estado (texto o JSON) junto con una o varias preguntas nombradas y tipadas, y devuelve para cada una distribuciones de probabilidad sobre opciones, respuestas sí/no o niveles de una escala ordenada.

La arquitectura declarada es Qwen3_5ForConditionalGeneration, un transformer híbrido de 64 capas (16 de atención completa y 48 de atención lineal), con pesos en bf16 repartidos en dos shards de safetensors. Se sirve mediante el servidor `simple-jev` incluido en el repositorio, que expone el endpoint `/v1/systemone` consumido por el kit Decision Index.

Su relevancia actual radica en el enfoque: en lugar de generar texto libre, el modelo produce decisiones estructuradas y calibradas (con probabilidades por opción y confianza), lo que facilita su integración en pipelines automatizados de enrutamiento, soporte y agentes. El autor reporta una puntuación de 82,83 en la suite pública Decision Index 0.3, ejecutada con el scorer del propio kit y no como resultado de leaderboard.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration; transformer híbrido con 64 capas (16 de atención completa, 48 de atención lineal) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 32.768 tokens por rama (configuración por defecto de `start_server.sh`); las peticiones más largas se rechazan con HTTP 422, no se truncan |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, dos shards: `model-00001-of-00002.safetensors`, `model-00002-of-00002.safetensors`, más `model.safetensors.index.json`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B y conserva su arquitectura híbrida de atención: 64 capas en total, de las cuales 16 emplean atención completa y 48 atención lineal. Los pesos ocupan 54.713.457.120 bytes de tensores en bf16, lo que coincide con el tamaño del repositorio (54,7 GB). La modalidad declarada es texto y JSON; el pipeline_tag de Hugging Face es `text-classification`, aunque los tags incluyen `image-text-to-text`, lo que sugiere que la arquitectura base es multimodal pero el fine-tuning se ha orientado a decisiones sobre texto.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El autor indica que el modelo se sirve con una política de prompt fija (`PROMPT_POLICY=baseline`) y que cada pregunta se puntúa como una rama que comparte la petición completa como prefijo, lo que permite evaluar varias preguntas sobre el mismo estado en una sola pasada. El entorno probado es Python 3.12.13, PyTorch 2.10.0+cu129, transformers 5.20.2, accelerate 1.15.0 y una NVIDIA H200.

## Capacidades

- Clasificación tipada: devuelve una probabilidad para cada opción nombrada, la opción más probable (`choice`) y su confianza (`confidence`).
- Preguntas sí/no (`noul`): probabilidad de que la respuesta sea afirmativa.
- Puntuación en escala ordenada (`score`): distribución sobre niveles numerados desde 0, nivel esperado y probabilidad del nivel más probable, con un `legend` que mapea niveles a etiquetas.
- Elección múltiple y clasificación de texto genérica.
- Reranking de recuperación (retrieval reranking).
- Selección de herramientas (tool selection) para agentes.
- Procesamiento de estados en texto plano o JSON.
- Evaluación de múltiples preguntas sobre un mismo estado compartiendo prefijo.
- No se declaran capacidades de generación libre, visión, audio ni modo thinking.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo clasifica cada ticket en categorías predefinidas (`choice`) y estima la urgencia en una escala (`score`), como muestra el ejemplo de la model card con un pedido con pantalla agrietada. Es adecuado porque devuelve probabilidades calibradas en lugar de texto libre.
- Triaje automático de incidencias: con preguntas `noul` del tipo "¿el artículo llegó dañado?" se obtienen probabilidades sí/no que pueden alimentar reglas de negocio o umbrales de escalado.
- Reranking en pipelines RAG: dado un estado con la consulta y un conjunto de documentos candidatos, el modelo puntúa la relevancia de cada uno mediante preguntas `score` o `choice`, mejorando el orden de recuperación antes de la generación.
- Selección de herramientas en agentes: el modelo elige entre herramientas nombradas con una distribución de probabilidad, lo que permite al orquestador decidir con umbrales de confianza y evitar llamadas de baja certeza.
- Moderación y clasificación de contenido: clasificación multietiqueta de textos o JSON en categorías de política, con confianza por categoría para revisión humana de los casos dudosos.
- Extracción de señales estructuradas de formularios o JSON: preguntas tipadas sobre un estado JSON permiten derivar campos booleanos, categóricos y ordinales sin generar texto.
- Evaluación automática de respuestas: puntuación en escala ordenada de la calidad de una respuesta o de la relevancia de un documento, con nivel esperado como métrica continua.

## Benchmarks y rendimiento

Resultados reportados por el autor en la suite pública Decision Index 0.3, ejecutada con el scorer del propio kit (no es un resultado de leaderboard):

| Metrica | Valor |
|---|---:|
| Indice publico | 82,83 |
| Balanced raw | 86,37 |
| Breadth | 82,60 |
| Peticiones | 140.620 (140.209 ok, 411 error) |
| Filas puntuadas | 140.178 (`complete: true`) |

| Area | Skill | Raw | Coverage | Benchmarks |
|---|---:|---:|---:|---:|
| Knowledge & Reasoning | 0,7454 | 0,7856 | 1,0000 | 11 |
| Language Understanding | 0,8776 | 0,9113 | 1,0000 | 9 |
| Retrieval & Classification | 0,8057 | 0,8389 | 0,9967 | 6 |
| Tools & Automation | 0,9196 | 0,9304 | 0,9976 | 5 |
| Arts & Human Taste | 0,7932 | 0,8708 | 1,0000 | 6 |

Los 411 errores corresponden a rechazos HTTP 422 de peticiones en las que una rama supera los 32.768 tokens (ToolRet 320, BRIGHT 91) y no se reintentaron.

Latencia en 1× H200 (muestra estratificada de 100 filas de la suite pública, en caliente, un proceso de servidor, configuración por defecto de `start_server.sh`):

| Weighting | Mediana | Media | p80 |
|---|---:|---:|---:|
| Suite-weighted | 204 ms | 481 ms | 522 ms |

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 54,7 GB, por lo que se necesita una GPU con al menos 64 GB de memoria para cargarlos sin cuantizar; no se documentan opciones de cuantización.
- GPU recomendadas: NVIDIA H200 (entorno probado por el autor); por capacidad de memoria, también serían necesarias A100 80 GB o H100 80 GB.
- No cabe en GPU de consumo (RTX 4090 con 24 GB, RTX 3090 con 24 GB) en bf16 sin cuantización, y no se ofrecen pesos GGUF ni cuantizados.
- Opciones de despliegue: servidor `simple-jev` incluido en el repositorio, basado en transformers, con endpoint `/v1/systemone`; requiere transformers 5.20.2, accelerate 1.15.0, pydantic 2.12.3, fastapi 0.135.1, uvicorn 0.41.0 y numpy 1.26.4. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: mediana de 204 ms, media de 481 ms y p80 de 522 ms en una H200 con la configuración por defecto. No se reporta throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lg-decision-27B | 27,36 B | 32.768 tokens por rama | Decisiones tipadas (choice/noul/score) | Apache 2.0 | Hugging Face, servidor propio |
| Qwen/Qwen3.8-27B (base) | 27 B | no disponible | Generación de texto multimodal | no disponible | Hugging Face |
| Modelos de clasificación dedicados (p. ej. encoders tipo BERT) | 0,1-0,5 B típicamente | 512-8.192 tokens | Clasificación de texto | variable | Hugging Face |

No se dispone de datos de benchmarks de modelos comparables de la misma categoría en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modalidad limitada a texto y JSON; no se declaran capacidades de visión, audio ni generación libre.
- Contexto máximo de 32.768 tokens por rama con la configuración por defecto; las peticiones más largas se rechazan con HTTP 422 en lugar de truncarse, lo que puede romper pipelines que esperen tolerancia a entradas largas.
- No se documentan los idiomas soportados; el comportamiento multilingüe es incierto y depende del modelo base.
- No se publican datos sobre sesgos, composición del dataset de fine-tuning ni técnicas de alineación (RLHF/DPO), lo que dificulta evaluar riesgos de sesgo y alucinación.
- El modelo devuelve probabilidades, pero no se documenta su calibración fuera de la suite Decision Index; los umbrales de confianza deben validarse en el dominio de producción.
- El resultado de 82,83 en Decision Index es una ejecución propia del autor con el scorer del kit, no una evaluación independiente ni un leaderboard.
- El despliegue depende de versiones muy concretas de transformers (5.20.2) y accelerate (1.15.0); otras versiones pueden no ser compatibles.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el modelo se creó y actualizó el mismo día (24 de noviembre de 2026), por lo que no hay evidencia de uso en producción.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen/Qwen3.8-27B, que no se detalla en la información disponible.
- La model card menciona el tag `image-text-to-text` y la arquitectura `Qwen3_5ForConditionalGeneration`, pero declara explícitamente que las modalidades son solo texto y JSON; conviene validar el comportamiento real con entradas multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dream-only/lg-decision-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de resultados del Decision Index: https://huggingface.co/datasets/SunZhengda/lg-decision-27B-decision-index
- Kit Decision Index: https://github.com/apolinario/decision-index
