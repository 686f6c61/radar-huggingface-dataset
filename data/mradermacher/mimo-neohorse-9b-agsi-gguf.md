# mradermacher/MiMo-NeoHorse-9B-AGSI-GGUF

## Resumen

MiMo-NeoHorse-9B-AGSI-GGUF es una recopilacion de cuantizaciones en formato GGUF del modelo OliviaRossi/MiMo-NeoHorse-9B-AGSI, publicada por el usuario mradermacher. Se trata de un modelo de aproximadamente 8.953.803.264 parametros (unos 9B) orientado a flujos de trabajo con agentes, uso de herramientas (tool calling), generacion de codigo y razonamiento. La model card original lo etiqueta con los descriptores merge, agsi, qwen3_5, agentic, coding, terminal-use y reasoning, lo que lo situa en la familia NeoHorse de TokenRhythm, cuyo proposito declarado son los modelos open-weight para agentes.

La relevancia de esta ficha concreta no esta en el modelo base, sino en el trabajo de cuantizacion: mradermacher ofrece doce variantes GGUF que abarcan desde Q2_K (3,9 GB) hasta f16 (18,0 GB), lo que permite desplegar el modelo tanto en GPUs de gama de consumo como en servidores. El repositorio ocupa 81,4 GB en total, aunque cada archivo individual es mucho mas pequeno. El modelo base esta publicado bajo licencia MIT, por lo que la cuantizacion hereda esa misma licencia.

El modelo soporta ingles (en) y chino (zh), e incluye el flag conversational. No se dispone de informacion detallada sobre el entrenamiento, la longitud de contexto ni los datos de benchmark en la informacion proporcionada, por lo que buena parte de las especificaciones quedan marcadas como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; la etiqueta qwen3_5 sugiere una base de la familia Qwen3.5 |
| Parametros totales | 8.953.803.264 (unos 9B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizacion); el modelo base se distribuye en transformers |
| Modelo base | OliviaRossi/MiMo-NeoHorse-9B-AGSI |
| Tamano del repositorio | 81,4 GB (suma de todas las cuantizaciones) |
| Etiquetas | merge, agsi, qwen3_5, agentic, coding, terminal-use, reasoning |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en la documentacion proporcionada. La model card del repositorio GGUF se limita a describir el proceso de cuantizacion y no reproduce las especificaciones del modelo base. La etiqueta qwen3_5 apunta a una base arquitectonica de la familia Qwen3.5 (transformer con atencion por tokens), pero este extremo no se confirma explicitamente en la informacion analizada.

Respecto al entrenamiento, no hay datos sobre numero de tokens, composicion del dataset ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o fine-tuning supervisado. Las etiquetas agentic, coding, terminal-use y reasoning sugieren un ajuste orientado a tareas de agente (uso de terminal, edicion de codigo, razonamiento multi-paso), pero se desconoce el detalle metodologico.

En el plano de la cuantizacion, el autor indica que son cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1) y que en el momento de la publicacion no habia cuantizaciones ponderadas o con imatrix. Tambien se marca skip_mmproj: 1, lo que implica que no se incluye proyector multimodal y, por tanto, la cuantizacion es exclusivamente de texto.

## Capacidades

- Generacion de texto conversacional en ingles y chino, segun los idiomas declarados.
- Razonamiento multi-paso (etiqueta reasoning).
- Generacion y edicion de codigo (etiqueta coding).
- Uso de herramientas y function calling en contextos de agente (etiqueta agentic).
- Uso de terminal y ejecucion de comandos en flujos automatizados (etiqueta terminal-use).
- Capacidad de fusion de modelos (etiqueta merge), lo que indica que el modelo base procede de una combinacion de pesos.
- Soporte conversacional multi-turno (flag conversational).
- Capacidades multimodales: no disponibles (se ha omitido el proyector mmproj).
- Modo de pensamiento explicito (thinking mode): no disponible en la informacion.

## Casos de uso

- Agentes de automatizacion de terminal: el modelo puede interpretar instrucciones en lenguaje natural y traducirlas a comandos de shell para tareas de administracion, dado su etiquetado terminal-use; su tamano de 9B permite ejecutarlo en una sola GPU.
- Asistentes de codigo en el IDE: integracion como backend de autocompletado y refactorizacion mediante las cuantizaciones Q4_K_M o Q5_K_M (5,7 GB y 6,6 GB), que ofrecen un equilibrio entre calidad y consumo de memoria.
- Pipelines de CI/CD con tool calling: el modelo puede invocar funciones externas (por ejemplo, abrir issues, lanzar tests o consultar APIs) dentro de un orquestador de agentes, gracias a sus capacidades agentic.
- Atencion al cliente bilingue: cobertura de conversaciones en ingles y chino con contexto multi-turno, desplegable en infraestructura propia por su licencia MIT y su tamano moderado.
- Razonamiento asistido en entornos con recursos limitados: la cuantizacion Q2_K (3,9 GB) permite ejecutar el modelo en GPUs de gama de consumo o incluso en CPU, util para prototipado.
- Analisis y transformacion de codigo en lotes: uso de la cuantizacion Q8_0 (9,6 GB) para tareas donde prima la fidelidad de la salida sobre la velocidad, como la generacion de documentacion o la migracion de fragmentos.
- Evaluacion e investigacion de tecnicas de cuantizacion: la disponibilidad de doce variantes permite estudiar el impacto de cada nivel de cuantizacion en la calidad de las respuestas sobre una misma base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, segun los tamanos de archivo publicados):
  - Q2_K: 3,9 GB
  - Q3_K_S: 4,4 GB
  - Q3_K_M: 4,7 GB
  - Q3_K_L: 5,0 GB
  - IQ4_XS: 5,3 GB
  - Q4_K_S: 5,5 GB
  - Q4_K_M: 5,7 GB
  - Q5_K_S: 6,4 GB
  - Q5_K_M: 6,6 GB
  - Q6_K: 7,5 GB
  - Q8_0: 9,6 GB
  - f16: 18,0 GB
- A esas cifras hay que sumar el espacio para la cache KV y el contexto, cuyo tamano depende de la longitud de contexto configurada (no disponible) y del backend empleado.
- GPU recomendadas: las cuantizaciones Q2_K a Q5_K_M caben con holgura en GPUs de consumo con 8-12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090). Q6_K y Q8_0 requieren 12-16 GB. La variante f16 requiere aproximadamente 18 GB solo en pesos, por lo que necesita GPUs de clase profesional (A100 40/80 GB, H100) o varias GPUs.
- Despliegue: al distribuirse en GGUF, es compatible con llama.cpp, Ollama y otros runners de GGUF; el modelo base (transformers) puede servirse con vLLM o TGI, aunque estas rutas trabajan con los pesos sin cuantizar.
- Latencia y throughput estimados: no disponibles.
- Nota: no se incluye proyector multimodal (skip_mmproj), por lo que no se puede usar para tareas de vision.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiMo-NeoHorse-9B-AGSI-GGUF | 8,95B | No disponible | MIT | GGUF | Cuantizacion del modelo base OliviaRossi/MiMo-NeoHorse-9B-AGSI |
| MiMo-Ornith-9B-AGSI-GGUF (mradermacher) | No disponible | No disponible | No disponible | GGUF | Variante dentro de la misma familia de cuantizaciones |
| NeoHorse-1-4B (TokenRhythm) | 4B | No disponible | No disponible | No disponible | Version menor de la familia para uso de herramientas y codigo |
| NeoHorse-1-9B (TokenRhythm) | 9B | No disponible | No disponible | No disponible | Modelo base de la familia descrito en el repositorio de TokenRhythm |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se documenta ninguna evaluacion de sesgo para este modelo ni para su base.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano, y potencialmente mayor en las cuantizaciones de menor precision (Q2_K, Q3_K_*).
- Idiomas: solo se declaran ingles y chino, por lo que el rendimiento en castellano no esta garantizado ni documentado.
- Contexto: se desconoce la longitud maxima soportada, lo que impide planificar despliegues con requisitos de contexto largo.
- Licencia: MIT, lo que permite uso comercial sin restricciones, pero se recomienda verificar las condiciones del modelo base original.
- Cuantizacion: las variantes Q2_K y Q3_K_* degradan la calidad de forma notable; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M como opciones rapidas.
- Ausencia de imatrix: el autor indica que no hay cuantizaciones ponderadas en el momento de la publicacion, lo que puede afectar a la calidad respecto a cuantizaciones con imatrix.
- Sin soporte multimodal: al omitir el proyector mmproj, el modelo no procesa imagenes.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia comunitaria de validacion ni reportes de uso en produccion.
- Los metadatos indican fechas de creacion y actualizacion en 2026, lo que conviene tener en cuenta al evaluar la vigencia del material.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MiMo-NeoHorse-9B-AGSI-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/MiMo-NeoHorse-9B-AGSI
- Pagina de resumen de cuantizaciones del autor: https://hf.tst.eu/model#MiMo-NeoHorse-9B-AGSI-GGUF
- Repositorio NeoHorse (TokenRhythm): https://github.com/TokenRhythm/NeoHorse/blob/main/README.md
- Variante relacionada MiMo-Ornith-9B-AGSI-i1-GGUF: https://huggingface.co/mradermacher/MiMo-Ornith-9B-AGSI-i1-GGUF
- Variante relacionada MiMo-Ornith-9B-AGSI-Abliterated-HQ-GGUF: https://huggingface.co/mradermacher/MiMo-Ornith-9B-AGSI-Abliterated-HQ-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Patrocinador del autor: https://www.nethype.de/
