# mradermacher/MiMo-V2.6-Distill-Qwen-9B-Derisked-BF16-i1-GGUF

## Resumen

MiMo-V2.6-Distill-Qwen-9B-Derisked-BF16-i1-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del checkpoint Blackfrost-AI/MiMo-V2.6-Distill-Qwen-9B-Derisked-BF16, que a su vez deriva del modelo original XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B desarrollado por Xiaomi MiMo. El modelo subyacente es un transformer decoder-only de unos 8.953.803.264 parametros (~8,95 mil millones) construido sobre Qwen3.5-9B mediante destilacion y ajuste supervisado (SFT) con datos generados por MiMo.

El objetivo declarado del modelo original es cubrir cuatro dominios: generacion de codigo, tareas de agente de proposito general, codificacion visual (vision-lenguaje) y ciberseguridad. La variante "Derisked" de Blackfrost-AI aplica una modificacion direccional de pesos, una intervencion sobre los pesos del checkpoint que no viene documentada en detalle en la informacion disponible. Esta publicacion concreta aporta unicamente los ficheros GGUF cuantizados con imatrix, no el modelo en precision completa.

La relevancia practica de esta ficha es que permite ejecutar un modelo agentico multimodal de ~9B en hardware de consumo mediante llama.cpp y derivados, con licencia MIT. Existe ademas un repositorio hermano con cuantizaciones estaticas (sin imatrix) y el fichero mmproj necesario para la parte de vision se distribuye en ese repositorio estatico, no en este. El repositorio tiene 49,4 GB y, en el momento de la consulta, registra 0 descargas y 0 "likes".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen3.5 (etiqueta qwen3_5), multimodal (vision-lenguaje) |
| Parametros totales | 8.953.803.264 (~8,95 mil millones) |
| Parametros activos | no disponible (la informacion disponible no indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ2_M, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q6_K, mas fichero imatrix |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base esta en BF16 |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo original es MiMo-V2.6-Distill-Qwen-9B, desarrollado por Xiaomi MiMo mediante ajuste supervisado (SFT) de Qwen3.5-9B sobre datos generados por MiMo. Se trata, por tanto, de un transformer decoder-only de aproximadamente 9B parametros con capacidad multimodal (vision), etiquetado en HuggingFace con los tags qwen3_5, mimo_v2, multimodal y agentic. El checkpoint liberado es un SFT, descrito por el autor original como punto de partida para investigacion abierta en refuerzo agentico, lo que implica que no incluye una fase posterior de RL/DPO en esta version.

Sobre esta base, Blackfrost-AI publica una variante "Derisked-BF16" que incorpora modificacion direccional de pesos (tag directional-weight-modification, bajo blackfrost-research). No se detalla en la informacion disponible la metodologia exacta, el conjunto de datos de la intervencion ni las metricas de evaluacion asociadas. mradermacher aplica despues cuantizacion con imatrix (i1), que usa estadisticas de calibracion para mejorar la calidad de las cuantizaciones de baja precision. El repositorio no incluye ficha tecnica propia del modelo original: se limita a la lista de cuantizaciones y notas de uso de GGUF.

## Capacidades

- Generacion de texto conversacional en ingles y chino, orientada a dialogos multi-turno.
- Generacion y comprension de codigo, incluyendo tareas de codificacion visual (interpretar capturas o diagramas y producir codigo).
- Razonamiento agentico multi-paso, con soporte para tool calling / function calling segun los tags del modelo (agentic, tool-use).
- Capacidades multimodales de vision-lenguaje; el fichero mmproj necesario se distribuye en el repositorio de cuantizaciones estaticas, no en este.
- Aplicaciones de ciberseguridad (tag cybersecurity), presumiblemente analisis de codigo y asistencia defensiva, aunque no se especifica el alcance exacto.
- Formato GGUF compatible con llama.cpp y derivados (Ollama, LM Studio, koboldcpp, entre otros).
- No se documenta en la informacion disponible un modo "thinking" explicito, soporte de audio ni otras capacidades especiales adicionales.

## Casos de uso

- Asistente de codigo en local: el modelo puede integrarse en un IDE o en un servidor llama.cpp para autocompletado y generacion de funciones, con la ventaja de no enviar codigo propietario a servicios externos. Su tamano de ~9B permite ejecutarlo en una GPU de consumo con cuantizacion i1-Q4_K_M (5,7 GB).
- Codificacion visual: a partir de una captura de pantalla o un wireframe, el modelo puede generar el HTML/CSS o el componente equivalente, gracias a su componente multimodal. Requiere cargar el mmproj del repositorio estatico.
- Agente de automatizacion con herramientas: con soporte de tool calling, se puede usar como planificador o ejecutor dentro de un bucle de agente que invoque APIs, consultas SQL o comandos de shell, manteniendo el estado en el contexto de la conversacion.
- Pipelines de revision de codigo en CI/CD: integrado como paso de pre-revision, el modelo puede comentar pull requests, detectar patrones problematicos y sugerir parches antes de la revision humana, reduciendo la carga de revisiones triviales.
- Asistencia en analisis de seguridad defensivo: para triaje de hallazgos de SAST/DAST, explicacion de vulnerabilidades y redaccion de recomendaciones de remediacion en entornos con requisitos de confidencialidad, al poder desplegarse on-premise.
- Soporte y atencion al usuario bilingue ingles-chino: gestion de conversaciones multi-turno en los dos idiomas soportados, adecuado para productos con base de usuarios en el mercado chino y anglosajon.
- Prototipado e investigacion en destilacion: al ser un checkpoint SFT liberado como punto de partida para investigacion abierta, sirve como base para experimentos de RLHF/GRPO o para estudiar el efecto de la modificacion direccional de pesos sobre el rendimiento agentico.
- Despliegue en portatiles y equipos sin GPU dedicada: las cuantizaciones i1-IQ2_M (3,7 GB) e i1-IQ3_M (4,5 GB) permiten ejecucion en CPU con RAM moderada, a costa de perdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio de cuantizaciones no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluaciones agenticas, y tampoco se han encontrado en los resultados de busqueda web consultados.

## Requisitos de hardware

- VRAM estimada segun el tamano de fichero de cada cuantizacion (el modelo base en BF16 ronda los 18 GB de pesos):
  - i1-IQ2_M: 3,7 GB.
  - i1-Q2_K: 3,9 GB.
  - i1-IQ3_XXS: 4,0 GB.
  - i1-IQ3_M: 4,5 GB.
  - i1-Q3_K_M: 4,7 GB.
  - i1-IQ4_XS: 5,3 GB.
  - i1-Q4_K_S: 5,5 GB.
  - i1-IQ4_NL: 5,5 GB.
  - i1-Q4_K_M: 5,7 GB.
  - i1-Q6_K: 7,5 GB.
- A estas cifras hay que sumar el espacio de contexto en KV cache, que depende de la longitud de contexto configurada (no disponible) y del numero de capas; el consumo real sera superior al tamano del fichero.
- GPU de consumo: cabe en tarjetas con 8 GB de VRAM o mas usando cuantizaciones i1-Q4_K_M o inferiores, y en 12 GB o mas con i1-Q6_K. En 6-8 GB conviene usar IQ3/IQ4. Una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB son suficientes para las cuantizaciones medias.
- GPU profesionales: A100, H100, L40S y similares permiten cargar la cuantizacion i1-Q6_K holgadamente y servir varias peticiones concurrentes.
- Si se activa la parte de vision, hay que anadir la VRAM del proyector multimodal (mmproj), disponible en el repositorio estatico.
- Opciones de despliegue: llama.cpp y sus envoltorios (Ollama, LM Studio, koboldcpp), llama-cpp-python y servidores compatibles con la API de OpenAI. vLLM y TGI no se mencionan en la informacion disponible para este formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-Derisked-BF16 (esta ficha, GGUF i1) | ~8,95 mil millones | no disponible | MIT | GGUF con imatrix y GGUF estatico; BF16 en el repo base |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (original) | 9B (citado como 9,4B en fuentes secundarias) | no disponible | no disponible en la informacion consultada | Checkpoint SFT publicado en ModelScope |
| Blackfrost-AI/MiMo-V2.6-Distill-Qwen-9B-Derisked-BF16 | ~8,95 mil millones | no disponible | MIT (segun el repo de cuantizacion) | BF16 safetensors |
| mradermacher/MiMo-V2.6-Distill-Qwen-9B-Derisked-BF16-GGUF (estatico) | ~8,95 mil millones | no disponible | MIT | GGUF estatico, incluye mmproj para vision |
| Qwen3.5-9B (modelo base de la destilacion) | ~9B | no disponible | no disponible en la informacion consultada | Pesos originales de Qwen |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada; la comparacion se limita a parametros, licencia y formato de distribucion.

## Limitaciones y advertencias

- No hay benchmarks publicados para esta cuantizacion ni para el checkpoint "Derisked", por lo que no es posible verificar el impacto de la modificacion direccional de pesos sobre la calidad.
- La model card del repositorio no documenta sesgos conocidos, composicion del dataset de destilacion ni procesos de alineacion; el riesgo de sesgo heredado de Qwen3.5-9B y de los datos generados por MiMo no esta cuantificado.
- Riesgo de alucinacion inherente a los modelos de ~9B destilados: pueden generar APIs, funciones o referencias de codigo inexistentes con apariencia plausible.
- Cobertura idiomatica limitada a ingles y chino; no se declara soporte de castellano ni de otros idiomas, por lo que el rendimiento en espanol sera previsiblemente inferior y no validado.
- La longitud de contexto no se especifica en la informacion disponible; conviene verificarla empiricamente antes de disenar flujos que dependan de ventanas largas.
- La licencia MIT permite uso comercial, pero la procedencia de los datos de destilacion y de la intervencion "Derisked" no esta documentada, lo que puede ser un problema en auditorias de cumplimiento.
- El tag cybersecurity implica capacidad dual (defensiva y potencialmente ofensiva); conviene aplicar politicas de uso aceptable y filtros de entrada/salida en produccion.
- La parte de vision requiere descargar el mmproj desde el repositorio estatico; sin el, el modelo funciona solo como texto.
- Las cuantizaciones por debajo de i1-Q4_K_S degradan notablemente la calidad (el propio autor advierte "lower quality" en IQ3_XXS y "IQ3_XXS probably better" frente a Q2_K).
- El repositorio registra 0 descargas en el momento de la consulta: no hay evidencia de comunidad, issues resueltos ni validacion independiente.
- El fichero de pesos esta dividido en cuantizaciones GGUF; para repositorios multi-parte es necesario concatenar los fragmentos segun las instrucciones habituales de llama.cpp.

## Enlaces

- HuggingFace (esta cuantizacion i1): https://huggingface.co/mradermacher/MiMo-V2.6-Distill-Qwen-9B-Derisked-BF16-i1-GGUF
- HuggingFace (cuantizaciones estaticas, incluye mmproj): https://huggingface.co/mradermacher/MiMo-V2.6-Distill-Qwen-9B-Derisked-BF16-GGUF
- HuggingFace (cuantizacion GGUF sin "Derisked"): https://huggingface.co/mradermacher/MiMo-V2.6-Distill-Qwen-9B-GGUF
- Modelo base en BF16: https://huggingface.co/Blackfrost-AI/MiMo-V2.6-Distill-Qwen-9B-Derisked-BF16
- Modelo original de Xiaomi MiMo en ModelScope: https://www.modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#MiMo-V2.6-Distill-Qwen-9B-Derisked-BF16-i1-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Nota de analisis sobre la version GGUF y requisitos de VRAM: https://localmodelwatch.tsuchitsuchi.com/en/2026/09/22/mimo-v2-6-distill-qwen-9b-gguf/
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/mimo-v2-6-distill-qwen-9b.html
- README de referencia sobre uso de ficheros GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de tipos de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
