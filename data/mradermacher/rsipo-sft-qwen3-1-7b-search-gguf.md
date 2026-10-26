# mradermacher/RSIPO-SFT-Qwen3-1.7B-Search-GGUF

## Resumen

`mradermacher/RSIPO-SFT-Qwen3-1.7B-Search-GGUF` es la versión cuantizada en formato GGUF del modelo `Karl28/RSIPO-SFT-Qwen3-1.7B-Search`, un ajuste fino orientado a agentes de búsqueda sobre una base Qwen3 de 1,7 B (2.031.739.904 parámetros reales según los safetensors del modelo original). Lo publica mradermacher, un conocido cuantizador de la comunidad que genera versiones estáticas en GGUF de modelos recién publicados para que puedan ejecutarse con llama.cpp y derivados sin necesidad de GPU de datacenter.

El interés del modelo está en su especialización: las etiquetas de la model card indican entrenamiento con *skill-SFT* y *RSIPO* (una variante de optimización por preferencias aplicada sobre el modelo base), sobre el dataset `Karl28/RSIPO-SFT-Data`, con el objetivo declarado de actuar como *search-agent* en flujos de razonamiento de varios pasos. Es, por tanto, un candidato para prototipar agentes de búsqueda y recuperación en local, no un modelo de propósito general.

Se trata de un modelo muy pequeño (2,03 B de parámetros), monolingüe en inglés y con licencia Apache-2.0. El repositorio GGUF ofrece 12 cuantizaciones estáticas que van de 1,0 GB (Q2_K) a 4,2 GB (f16), lo que permite desplegarlo en portátiles y GPUs de consumo. En el momento de redactar esta ficha no consta ningún benchmark publicado ni descarga registrada, por lo que la evaluación cualitativa queda pendiente de validación por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-1.7B según el nombre del modelo base; la model card no detalla la arquitectura) |
| Parametros totales | 2.031.739.904 (2,03 B), dato de safetensors del modelo base |
| Parametros activos | No aplica: no es un modelo MoE según la información disponible |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen3-1.7B declara 32 768 tokens en su propia model card) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (cuantizaciones estáticas; no hay versiones con imatrix/weighted) |
| Idiomas soportados | Inglés (`en`); no se declaran otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF en este repositorio; safetensors/transformers en el repositorio base |

Otros datos del repositorio: tamaño total de 18,6 GB (suma de todas las cuantizaciones), 0 descargas y 0 likes, creado y actualizado el 26 de octubre de 2026, pipeline declarado `reinforcement-learning`.

## Arquitectura y entrenamiento

La información disponible no incluye detalles sobre el número de tokens de entrenamiento, la composición del dataset ni la receta exacta de ajuste. Lo que sí se declara son las etiquetas del modelo: `agent`, `reinforcement-learning`, `rsipo`, `skill-sft` y `search-agent`, junto con el dataset `Karl28/RSIPO-SFT-Data`. La combinación sugiere un entrenamiento en dos fases: primero un *skill-SFT* para inculcar la habilidad de búsqueda (formulación de consultas, lectura de resultados, encadenamiento de pasos) y después una optimización por preferencias tipo RSIPO para refinar el comportamiento del agente. No se especifica si hubo RLHF clásico, DPO o una variante propietaria.

Este repositorio concreto no aporta entrenamiento adicional: es una conversión y cuantización estática del modelo base realizada por mradermacher, con `convert_type: hf`, `output_tensor_quantised: 1` y `quantize_version: 2`, sin fusionar un `mmproj` (no hay componente multimodal). El autor advierte de que las cuantizaciones ponderadas por imatrix no están disponibles y que probablemente no se generen salvo petición explícita en la sección de discusión de la comunidad. Tampoco se documenta ninguna innovación técnica de inferencia (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional multi-turno (`conversational` en las etiquetas del repo).
- Comportamiento de agente de búsqueda: planificación de consultas, lectura de resultados y razonamiento encadenado, según la etiqueta `search-agent`.
- Razonamiento de varios pasos orientado a tareas de recuperación de información.
- Ajuste específico mediante *skill-SFT* sobre un dataset de búsqueda, según la model card.
- Optimización por preferencias (RSIPO) para alinear las respuestas del agente.
- Soporte de *tool calling* / *function calling*: no documentado explícitamente en la información disponible; la orientación a agentes es inferida de las etiquetas, no de una especificación de formato de herramientas.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo *thinking* explícito, visión o audio: no disponibles (no se declaran en la model card ni en las etiquetas).

## Casos de uso

- **Agente de búsqueda web en local**: el modelo puede recibir una pregunta, generar consultas sucesivas, leer los fragmentos devueltos y componer una respuesta final. Su tamaño (2,03 B) permite ejecutarlo en el mismo portátil donde corre el orquestador, sin depender de una API externa.
- **Reescritura y expansión de consultas en un pipeline RAG**: se puede intercalar antes del recuperador para transformar preguntas coloquiales en consultas más efectivas, una tarea para la que el ajuste *search-agent* está específicamente entrenado y que no requiere un modelo grande.
- **Prototipado de arquitecturas de agentes**: sirve como modelo de pruebas barato para validar bucles de *tool use*, formatos de mensajes y políticas de parada antes de invertir en un modelo mayor; con Q4_K_M ocupa 1,4 GB y arranca en segundos.
- **Sistemas de respuesta sobre documentación interna**: combinado con un índice vectorial, el modelo puede decidir cuándo buscar, cuántas veces iterar y cuándo responder, con la ventaja de que los datos no salen de la infraestructura propia.
- **Evaluación y *benchmarking* de pipelines de agentes**: al ser determinista en local y con licencia Apache-2.0, es útil como baseline reproducible en pruebas de regresión de sistemas de recuperación.
- **Asistentes offline en entornos con conectividad restringida**: despliegue en un equipo con GPU de 6-8 GB que necesite capacidades de búsqueda sobre un corpus local precargado, sin conexión a servicios en la nube.
- **Investigación sobre ajuste por preferencias en modelos pequeños**: el par modelo + dataset (`Karl28/RSIPO-SFT-Data`) permite reproducir o comparar recetas de SFT + RSIPO en el rango de los 2 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card del repositorio GGUF no incluye ninguna métrica (MMLU, HumanEval, GSM8K, tareas de búsqueda tipo HotpotQA o Bamboogle), y el repositorio acumula 0 descargas, por lo que tampoco existen evaluaciones de terceros registradas. Cualquier cifra de rendimiento que se cite para este modelo debe obtenerse midiendo directamente.

## Requisitos de hardware

Tamaños de archivo declarados en el repositorio y VRAM estimada (pesos + caché KV + overhead del runtime; estimación, no dato del autor):

| Cuantización | Tamaño en disco | VRAM estimada (contexto corto) |
|---|---|---|
| Q2_K | 1,0 GB | ~1,5-2 GB |
| Q3_K_S | 1,1 GB | ~1,6-2,2 GB |
| Q3_K_M | 1,2 GB | ~1,7-2,3 GB |
| Q3_K_L | 1,2 GB | ~1,7-2,3 GB |
| IQ4_XS | 1,3 GB | ~1,9-2,5 GB |
| Q4_K_S | 1,3 GB | ~1,9-2,5 GB |
| Q4_K_M | 1,4 GB | ~2-2,6 GB |
| Q5_K_S | 1,5 GB | ~2,1-2,8 GB |
| Q5_K_M | 1,6 GB | ~2,2-2,9 GB |
| Q6_K | 1,8 GB | ~2,4-3,2 GB |
| Q8_0 | 2,3 GB | ~3-3,9 GB |
| f16 | 4,2 GB | ~5-6 GB |

- **Cabe en GPU de consumo**: sí, en prácticamente cualquier GPU con 4 GB o más. Una GTX 1650 de 4 GB mueve Q2_K/Q3_K_S; una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB permiten f16 con contexto largo y margen para el resto del pipeline.
- **GPU de datacenter**: A100, H100 o L40S no son necesarias para el modelo, pero sí útiles si se sirve con很多 concurrencia o se reservan para otras etapas del pipeline (recuperador, reranker).
- **CPU**: viable en exclusiva con CPU gracias a los cuantizados Q4/Q5; un servidor con AVX2/AVX-512 puede servir varias peticiones por segundo.
- **Opciones de despliegue**: llama.cpp (`llama-cli`, `llama-server`), Ollama (importando el GGUF con un Modelfile), LM Studio, koboldcpp, `llama-cpp-python` y text-generation-webui. vLLM admite GGUF de forma experimental; TGI no soporta GGUF de forma nativa.
- **Latencia y throughput**: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

Los datos de las filas de alternativas provienen de sus respectivas model cards públicas y no han sido verificados en la información proporcionada para esta ficha; tómense como orientativos.

| Modelo | Parámetros | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|
| RSIPO-SFT-Qwen3-1.7B-Search (GGUF) | 2,03 B | No disponible | Apache-2.0 | GGUF (12 cuantizaciones) | Agente de búsqueda (SFT + RSIPO) |
| Qwen3-1.7B (base) | 2,03 B | 32 768 | Apache-2.0 | safetensors; GGUF de terceros | Propósito general, multilingüe |
| Qwen2.5-1.5B-Instruct | ~1,54 B | 32 768 (131 072 con YaRN) | Apache-2.0 | safetensors; GGUF de terceros | Instrucciones generales |
| SmolLM2-1.7B-Instruct | ~1,71 B | 8 192 | Apache-2.0 | safetensors; GGUF de terceros | Instrucciones generales, ligero |

Frente a las alternativas, la diferencia no está en tamaño ni en contexto —donde el modelo base Qwen3-1.7B o Qwen2.5-1.5B son iguales o mejores—, sino en el ajuste específico para bucles de búsqueda. Como contrapartida, es monolingüe en inglés y no cuenta con métricas públicas que respalden la mejora frente a su propia base.

## Limitaciones y advertencias

- **Monolingüe**: solo declara inglés. Su uso en castellano no está soportado y previsiblemente degradará tanto la formulación de consultas como la síntesis de respuestas.
- **Sin benchmarks ni validación comunitaria**: 0 descargas y 0 likes en el momento de la ficha; no hay evidencia pública de que el ajuste supere al modelo base en tareas de búsqueda.
- **Riesgo de alucinación**: con 2,03 B de parámetros, la generación de hechos, citas o URLs inventadas es un riesgo alto. En pipelines de búsqueda conviene verificar las fuentes de forma programática y no confiar en las referencias que produzca el modelo.
- **Degradación por cuantización**: Q2_K y Q3_K_S reducen notablemente la calidad; el propio autor marca Q3_K_M como "lower quality". Para producción se recomienda Q4_K_M o superior.
- **Ausencia de cuantizaciones imatrix**: las versiones ponderadas suelen dar mejor perplejidad por tamaño; aquí no están disponibles y el autor no garantiza generarlas.
- **Comportamiento de agente no especificado**: no se documenta el formato de herramientas, los tokens especiales de control ni el esquema de mensajes esperado, lo que exige ingeniería inversa o prueba empírica antes de integrarlo.
- **Licencia**: Apache-2.0 permite uso comercial y modificación, pero conviene verificar también los términos del modelo base y del dataset `Karl28/RSIPO-SFT-Data`, cuya procedencia y condiciones no se detallan en la información disponible.
- **Procedencia del ajuste**: al ser un modelo de un autor individual sin paper asociado, no hay garantías sobre la limpieza del dataset de entrenamiento ni sobre posibles sesgos heredados de él.
- **Sobre-uso de la búsqueda**: un modelo entrenado específicamente para buscar puede invocar herramientas innecesariamente en consultas triviales; conviene añadir heurísticas de parada en el orquestador.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/RSIPO-SFT-Qwen3-1.7B-Search-GGUF
- Modelo base (safetensors): https://huggingface.co/Karl28/RSIPO-SFT-Qwen3-1.7B-Search
- Dataset de entrenamiento: https://huggingface.co/datasets/Karl28/RSIPO-SFT-Data
- Página de descargas del cuantizador para este modelo: https://hf.tst.eu/model#RSIPO-SFT-Qwen3-1.7B-Search-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF citada por el autor (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que financia al cuantizador: https://www.nethype.de/
