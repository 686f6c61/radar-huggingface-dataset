# mradermacher/GraphForge-Qwen3.6-35B-A3B-SFT-GGUF

## Resumen

GraphForge-Qwen3.6-35B-A3B-SFT-GGUF es la version cuantizada en formato GGUF del modelo randomsubmit/GraphForge-Qwen3.6-35B-A3B-SFT, un ajuste fino supervisado (SFT) construido sobre la arquitectura Qwen3.6-35B-A3B. La publica el usuario mradermacher, especializado en generar cuantizaciones estaticas de modelos abiertos para su uso con llama.cpp y derivados. El modelo declara 34.660.610.688 parametros reales (unos 34,66 mil millones), coherente con la nomenclatura comercial "35B".

El interes principal de esta publicacion es doble. Por un lado, ofrece el modelo en un abanico amplio de cuantizaciones (de Q2_K a Q8_0, mas IQ4_XS y adaptadores multimodales mmproj), lo que permite desplegarlo desde equipos con 16 GB de VRAM hasta configuraciones de servidor con calidad casi nativa. Por otro, los metadatos indican una especializacion en uso de herramientas (tool-use) y en tareas de tipo "graphforge", con licencia Apache 2.0, lo que facilita su integracion en productos comerciales.

Se trata de un modelo en ingles, orientado a conversacion y a flujos agente-herramienta. No se han publicado en la informacion disponible detalles sobre el dataset de entrenamiento, el contexto maximo ni resultados de evaluacion, por lo que varias especificaciones quedan marcadas como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) segun la nomenclatura del modelo base Qwen3.6-35B-A3B; no confirmado explicitamente en la model card |
| Parametros totales | 34.660.610.688 (34,66 mil millones) |
| Parametros activos | Aproximadamente 3 mil millones, inferido de la nomenclatura "A3B" del modelo base; no confirmado en la model card |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS; mas adaptadores mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (los archivos publicados); el modelo base esta en safetensors |
| Tamano del repositorio | 149,8 GB |
| Libreria declarada | transformers |
| Modelo base | randomsubmit/GraphForge-Qwen3.6-35B-A3B-SFT |
| Etiquetas | graphforge, supervised-fine-tuning, tool-use, endpoints_compatible, conversational |
| Fecha de publicacion | 2026-09-26 |

## Arquitectura y entrenamiento

El modelo base sobre el que se construye esta cuantizacion es GraphForge-Qwen3.6-35B-A3B-SFT, un ajuste fino supervisado derivado de la familia Qwen3.6-35B-A3B. La etiqueta "A3B" y las referencias externas a Qwen3.6-35B-A3B apuntan a una arquitectura de mezcla de expertos (MoE) con aproximadamente 35 mil millones de parametros totales y unos 3 mil millones activos por token, siguiendo el patron de eficiencia computacional habitual en esta familia. No obstante, la model card no detalla la configuracion de capas, el numero de expertos ni el mecanismo de enrutamiento.

Tampoco se especifica en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset de SFT, ni si hubo fases adicionales de RLHF, DPO o RLVR. Las etiquetas del repositorio (supervised-fine-tuning, tool-use, graphforge) sugieren que el ajuste se centro en el seguimiento de instrucciones con llamadas a herramientas y en tareas relacionadas con grafos, pero no hay documentacion que lo confirme ni que describa las innovaciones tecnicas adicionales. La presencia de archivos mmproj (proyector multimodal) indica soporte para entrada de imagen a traves del pipeline multimodal de llama.cpp, aunque la model card no lo declara de forma explicita.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat multi-turno.
- Uso de herramientas y function calling, segun la etiqueta tool-use del repositorio.
- Especializacion declarada en tareas de tipo "graphforge" (sin detalle publico del alcance concreto).
- Compatibilidad con endpoints estandar (etiqueta endpoints_compatible), lo que facilita su despliegue detras de APIs compatibles con OpenAI.
- Posible entrada multimodal (imagen) gracias a los adaptadores mmproj-Q8_0 y mmproj-f16 incluidos, aunque no esta documentado en la model card.
- No hay evidencia publicada de capacidades de audio, thinking mode explicito ni de razonamiento multi-paso mas alla de lo implicito en tool-use.

## Casos de uso

- Agentes con llamadas a herramientas: el modelo puede integrarse en bucles de agente que consulten APIs externas, bases de datos o funciones locales, aprovechando su ajuste en tool-use y su formato de chat conversacional.
- Asistentes conversacionales en ingles: con las cuantizaciones Q4_K_S o Q5_K_M se puede servir un chatbot de proposito general con calidad cercana a la del modelo completo y un coste de VRAM moderado.
- Extraccion y transformacion de estructuras tipo grafo: dado el etiquetado "graphforge", es plausible usarlo para tareas de construccion o consulta de grafos de conocimiento, aunque no hay documentacion que detalle el formato esperado.
- Automatizacion de pipelines de datos: la compatibilidad con endpoints permite desplegarlo con vLLM o llama.cpp server y consumirlo desde orquestadores tipo n8n, LangChain o Airflow para clasificacion, resumen o normalizacion de registros.
- Despliegue en equipos de una sola GPU consumer: la version Q4_K_S ocupa 20 GB, por lo que cabe en GPUs de 24 GB (RTX 3090, RTX 4090) con margen para cache KV en contextos moderados.
- Inferencia en CPU o equipos modestos: la cuantizacion Q2_K (13 GB) y Q3_K_S (15,3 GB) permiten ejecucion con llama.cpp en maquinas sin GPU dedicada o con GPU de 16 GB, a costa de perdida de calidad.
- Prototipado rapido y evaluacion comparativa: al existir 12 cuantizaciones distintas, es util para medir el impacto de la cuantizacion en la calidad de las respuestas y en el throughput antes de fijar un formato definitivo para produccion.
- Analisis de documentos con componente visual: si se confirma el uso de los adaptadores mmproj, se podria emplear para tareas de pregunta-respuesta sobre imagenes o capturas, siempre que se valide empiricamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluaciones de tool-use, y las busquedas realizadas no aportan cifras asociadas a este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV):
  - Q2_K: 13,0 GB.
  - Q3_K_S: 15,3 GB.
  - Q3_K_M: 16,9 GB.
  - Q3_K_L: 18,2 GB.
  - Q4_K_S: 20,0 GB.
  - Q6_K: 28,6 GB.
  - Q8_0: 37,0 GB.
  - Adaptadores multimodales: 0,7 GB (mmproj-Q8_0) y 1,0 GB (mmproj-f16).
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para Q4_K_S o Q3_K_L; A100 40 GB, L40S o H100 para Q6_K y Q8_0; para Q2_K y Q3_K_S basta una GPU de 16 GB como RTX 4080 o A4000.
- Cabe en GPU consumer: si. Q2_K, Q3_K_S y Q3_K_M entran en tarjetas de 16 GB; Q4_K_S y Q4_K_M en 24 GB; Q6_K y Q8_0 requieren GPU profesional o multi-GPU.
- Opciones de despliegue: llama.cpp y sus interfaces (llama-cli, llama-server), Ollama, y LM Studio para GGUF; vLLM o TGI requeririan los pesos originales en safetensors del modelo base, no los GGUF.
- Latencia y throughput: no disponibles. Al tratarse de un MoE con aproximadamente 3 mil millones de parametros activos, cabe esperar un regimen de decodificacion mas cercano a un modelo de 3B que a uno denso de 35B, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| GraphForge-Qwen3.6-35B-A3B-SFT-GGUF (este) | 34,66 B (activos aproximados 3 B) | no disponible | GGUF | Apache 2.0 | Cuantizacion estatica de mradermacher, 12 variantes |
| randomsubmit/GraphForge-Qwen3.6-35B-A3B-SFT | no disponible | no disponible | safetensors | Apache 2.0 | Modelo base; pesos originales |
| Qwen3.6-35B-A3B (Qwen/Alibaba) | 35 B totales / 3 B activos segun fuentes externas | no disponible | no disponible | no disponible | Arquitectura origen de la familia; datos no verificados en la model card |
| mradermacher/Qwen3.6-35B-A3B-StyleTune-GGUF | no disponible | no disponible | GGUF | Apache 2.0 | Ajuste alternativo de la misma base centrado en estilo |
| mradermacher/Qwen3.6-35B-A3B-Fable-5-Distill-i1-GGUF | no disponible | no disponible | GGUF | Apache 2.0 | Destilado sobre la misma base; incluye cuantizaciones imatrix |
| mradermacher/Qwen3.6-35B-A3B-Opus-Reasoning-i1-GGUF | no disponible | no disponible | GGUF | Apache 2.0 | Variante orientada a razonamiento |

No hay datos de rendimiento publicados para ninguno de los modelos comparados, por lo que la comparacion se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado unicamente como ingles (en). No hay evidencia de soporte fiable para castellano u otros idiomas.
- Sesgos: no se ha publicado informacion sobre la composicion del dataset de ajuste ni sobre auditorias de sesgo, por lo que se desconoce el perfil de sesgos del modelo.
- Alucinacion: sin benchmarks ni evaluaciones de fidelidad, no se puede estimar la tasa de alucinacion. En tareas de tool-use el riesgo de invocar funciones con argumentos incorrectos debe mitigarse con validacion externa.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide planificar despliegues con documentos largos o conversaciones extensas.
- Trazabilidad: la model card del repositorio GGUF es una plantilla generica de mradermacher y no aporta informacion sobre el ajuste del modelo base; para detalles habria que consultar randomsubmit/GraphForge-Qwen3.6-35B-A3B-SFT.
- Cuantizacion: las variantes de baja precision (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L) degradan la calidad y pueden afectar de forma desproporcionada al seguimiento de formato en tool calling. Las cuantizaciones ponderadas o con imatrix no estan disponibles segun el autor.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de Qwen3.6-35B-A3B, dado que la model card no las detalla.
- Madurez: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Multimodalidad: la presencia de archivos mmproj sugiere soporte de vision, pero no esta documentada ni probada; no debe asumirse en produccion sin verificacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/GraphForge-Qwen3.6-35B-A3B-SFT-GGUF
- Modelo base: https://huggingface.co/randomsubmit/GraphForge-Qwen3.6-35B-A3B-SFT
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#GraphForge-Qwen3.6-35B-A3B-SFT-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Referencia externa a Qwen3.6-35B-A3B: https://github.com/AI-Guru/ai_services/blob/main/models/qwen3.6/README.md
- Variante StyleTune: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-StyleTune-GGUF
- Variante Fable-5-Distill-i1: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Fable-5-Distill-i1-GGUF
- Variante Opus-Reasoning-i1: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Opus-Reasoning-i1-GGUF
- Ficha de Inferix para Qwen3.6-35B-A3B-GGUF: https://inferix.co/models/mradermacher/Qwen3.6-35B-A3B-GGUF
