# lugman-madhiai/Qwen3.5-2B-SearchAgent-SFT-01

## Resumen

El modelo `lugman-madhiai/Qwen3.5-2B-SearchAgent-SFT-01` es un ajuste fino supervisado (SFT) del modelo base `Qwen/Qwen3.5-2B`, publicado en HuggingFace por el usuario lugman-madhiai. Cuenta con 2.274.069.824 parametros (2,27 B) y se distribuye bajo licencia Apache 2.0. Su pipeline declarado es image-text-to-text, lo que apunta a que la familia base puede procesar entradas conjuntas de imagen y texto, aunque la model card no detalla las capacidades multimodales especificas de este ajuste.

El nombre del modelo sugiere una especializacion como agente de busqueda (search agent) mediante aprendizaje supervisado, si bien el autor no documenta el dataset, el numero de tokens ni el proceso de alineacion mas alla de indicar que se entreno con Unsloth y la libreria TRL de HuggingFace, con una mejora de velocidad de entrenamiento de 2x segun sus propias notas. La model card es minima y no incluye resultados de evaluacion.

Su relevancia radica en ser un modelo pequeno de 2,27 B orientado a tareas de agente, lo que permite desplegarlo en hardware de consumo o en el borde. No obstante, en el momento de redactar esta ficha no registra descargas ni valoraciones, por lo que no existe evidencia publica de su rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (etiqueta qwen3_5); detalles concretos no disponibles |
| Parametros totales | 2.274.069.824 (2,27 B) |
| Parametros activos | No aplica; no se indica que sea MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo incluye pesos safetensors en su precision original |
| Idiomas soportados | en (ingles), segun los metadatos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-2B |
| Pipeline declarado | image-text-to-text |
| Libreria | transformers |
| Tamano del repositorio | 4,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-11 |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un transformer perteneciente a la familia Qwen3.5, identificado con la etiqueta `qwen3_5`, con 2.274.069.824 parametros totales y un pipeline image-text-to-text. Esto implica una arquitectura capaz de recibir imagenes y texto, aunque no se especifica el mecanismo de fusion multimodal, el codificador visual ni la longitud de contexto empleada.

El entrenamiento consistio en un ajuste fino supervisado (SFT) sobre `Qwen/Qwen3.5-2B`, realizado con Unsloth y la libreria TRL de HuggingFace, segun la propia model card. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. Tampoco se detallan los hiperparametros del ajuste.

## Capacidades

- Generacion de texto y conversacion multi-turno: los tags incluyen `conversational` y `text-generation-inference`.
- Procesamiento conjunto de imagen y texto: el pipeline declarado es image-text-to-text, si bien no se confirma que el ajuste fino conserve y valide dicha capacidad.
- Especializacion presumible en tareas de agente de busqueda: el nombre del modelo apunta a un entrenamiento orientado a search agents, pero no hay documentacion al respecto.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo se declara ingles; no se documentan otros idiomas.
- Modo thinking explicito: no disponible.
- Vision o audio: el pipeline sugiere vision, sin confirmacion en la model card.

## Casos de uso

- Generacion aumentada por recuperacion (RAG): el modelo puede emplearse como generador final en un pipeline que recupere documentos y los inserte en el prompt; su tamano de 2,27 B permite ejecutarlo en una unica GPU de gama media.
- Agente de busqueda web: dado su nombre y orientacion, encaja como componente de decision en un bucle de agente que formule consultas, lea resultados y sintetice respuestas, siempre que se valide su calidad real.
- Extraccion de informacion de capturas y documentos escaneados: el pipeline image-text-to-text permitiria procesar imagenes con texto para extraer campos o resumir contenido, previa verificacion de la capacidad multimodal.
- Asistente conversacional ligero en el borde: con 2,27 B puede desplegarse en portatiles o dispositivos con GPU integrada para tareas de chat de baja latencia sin conexion.
- Enrutado y clasificacion dentro de sistemas multiagente: su tamano reducido lo hace adecuado para decidir que herramienta o subagente invocar en funcion de la consulta.
- Prototipado e investigacion academica: sirve como banco de pruebas para experimentos de SFT con Unsloth y TRL sobre una base multimodal pequena.
- Automatizacion de tareas de navegacion: integrado en frameworks de web agents, podria generar acciones o extraer datos de paginas, sujeto a validacion de su robustez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 4,5 GB solo para pesos y entre 6 y 8 GB considerando cache KV y activaciones.
- VRAM estimada en int8: alrededor de 2,3 GB para pesos y unos 4 GB en total.
- VRAM estimada en int4: alrededor de 1,2 GB para pesos y entre 2 y 3 GB en total. El repositorio no incluye pesos cuantizados, por lo que habria que generarlos.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM, como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090. Las A100 y H100 no son necesarias para una sola instancia, aunque permitirian mayor concurrencia.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM en fp16, y en configuraciones de 4 a 6 GB si se cuantiza.
- Opciones de despliegue: transformers, text-generation-inference (el tag `endpoints_compatible` lo indica), vLLM mediante los pesos safetensors y, con conversion previa a GGUF, llama.cpp u Ollama. No se proporcionan archivos GGUF en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-2B-SearchAgent-SFT-01 | 2,27 B | No disponible | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-2B (base) | 2,27 B | No disponible | No disponible en la informacion proporcionada | HuggingFace |
| Llama-3.2-3B | 3,21 B | 128k | Llama 3.2 Community License | HuggingFace / Meta |
| Gemma-2-2B | 2,61 B | 8k | Gemma Terms of Use | HuggingFace / Google |

No es posible comparar rendimiento porque este ajuste no publica benchmarks. La comparacion se limita por tanto a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real es desconocido.
- El modelo registra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion por parte de la comunidad.
- La model card es minima: no documenta dataset, hiperparametros, proceso de alineacion ni criterios de evaluacion.
- Riesgo de alucinacion inherente a un modelo de 2,27 B, especialmente en tareas de busqueda o generacion factual.
- Solo se declara ingles; no hay garantias de rendimiento en castellano ni en otros idiomas.
- La longitud de contexto es desconocida, por lo que no deberia planificarse su uso en produccion con ventanas largas sin una verificacion previa.
- La capacidad multimodal no esta validada en este ajuste concreto, aunque el pipeline la sugiera.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen/Qwen3.5-2B, no incluida en la informacion proporcionada.
- No se documentan sesgos especificos, lo que no implica su ausencia.
- La fecha de publicacion indicada es 2026-09-11, lo que lo situa como un modelo muy reciente y sin traccion constatada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lugman-madhiai/Qwen3.5-2B-SearchAgent-SFT-01
- Modelo base Qwen/Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentacion de TRL: https://huggingface.co/docs/trl
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la busqueda web.
