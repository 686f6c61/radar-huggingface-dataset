# mradermacher/Piccolo-27B-GGUF

## Resumen

Piccolo-27B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo Piccolo-27B, publicado por el cuantizador mradermacher a partir del modelo base agentscope-ai/Piccolo-27B. El modelo original es un modelo de decisión ("decision model") desarrollado por el equipo de AgentScope, con soporte multimodal (incluye archivos mmproj como suplemento de visión), atención bidireccional y entrenamiento orientado a inglés y chino. Esta ficha se centra en el repositorio de cuantizaciones, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama u otras herramientas compatibles con GGUF.

La relevancia de esta publicación radica en la combinación de un tamaño intermedio (27.320.697.856 parámetros, unos 27,3B), licencia Apache 2.0 y capacidades multimodales, lo que lo hace accesible para despliegues locales y uso comercial sin restricciones copyleft. Las cuantizaciones van desde Q2_K (11,0 GB) hasta Q8_0 (29,1 GB), cubriendo desde GPUs de consumo de 16 GB hasta estaciones de trabajo con más VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención bidireccional, modelo de decisión ("decision model"), etiqueta "qwenpaw" (arquitectura base no detallada en la model card) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, más suplementos multimodales mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors, 190,8 GB el repositorio original) |

## Arquitectura y entrenamiento

Según los metadatos del repositorio, Piccolo-27B es un modelo de decisión con atención bidireccional, una característica poco habitual en LLM autorregresivos convencionales y que suele asociarse a arquitecturas de razonamiento o planificación no puramente causales. El tag "qwenpaw" sugiere una relación con la familia Qwen, aunque la model card no detalla la arquitectura exacta ni el número de capas o cabezas de atención. No se dispone de información sobre el preentrenamiento (tokens, composición del dataset) ni sobre fases de alineamiento (RLHF, DPO).

Lo que sí está documentado es el proceso de cuantización: mradermacher ha generado cuantizaciones estáticas en formato GGUF mediante conversión desde los pesos originales en safetensors. En el momento de publicación no hay cuantizaciones weighted/imatrix disponibles, aunque el autor indica que pueden solicitarse mediante una Community Discussion. El repositorio incluye además dos archivos mmproj (Q8_0 de 0,7 GB y f16 de 1,0 GB) que actúan como suplemento multimodal para habilitar capacidades de visión en herramientas compatibles como llama.cpp.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como "conversational" y compatible con endpoints.
- Modelo de decisión: la etiqueta "decision-model" indica un enfoque en toma de decisiones, planificación o razonamiento estructurado, aunque la model card no detalla los casos de uso exactos.
- Atención bidireccional: arquitectura que puede beneficiar tareas de comprensión y razonamiento no estrictamente secuenciales.
- Capacidades multimodales: los archivos mmproj sugieren soporte de visión (procesamiento de imágenes) cuando se usan junto al modelo principal en runtimes compatibles.
- Soporte de idiomas: inglés y chino según los metadatos; el soporte de castellano no está documentado.
- Tool calling, function calling y capacidades de agentes: no disponible (no consta en la información proporcionada, aunque la vinculación con AgentScope, un framework de agentes, sugiere posible orientación a este uso).

## Casos de uso

- Ejecución local en hardware de consumo: con la cuantización Q4_K_M (16,9 GB) el modelo cabe en una GPU de 24 GB como una RTX 3090 o 4090, permitiendo experimentación privada sin coste de API.
- Despliegue multimodal económico: combinando los archivos mmproj con el modelo principal, se puede montar un asistente con comprensión de imágenes en local mediante llama.cpp.
- Investigación en modelos de decisión y atención bidireccional: al ser un modelo con arquitectura poco convencional y licencia permisiva, es útil como base para estudios académicos sobre alternativas al transformer causal estándar.
- Integración con frameworks de agentes: la procedencia de AgentScope (framework de agentes de código abierto) sugiere su uso como motor de razonamiento en pipelines de agentes multi-paso, aunque debe validarse el soporte de tool calling en la práctica.
- Aplicaciones bilingües inglés-chino: adecuado para productos que necesiten comprensión y generación en ambos idiomas, como chatbots o asistentes internos.
- Prototipado con restricciones de VRAM ajustadas: las cuantizaciones Q2_K (11,0 GB) y Q3_K_S (12,4 GB) permiten probar el modelo en GPUs de 12-16 GB aceptando pérdida de calidad.
- Uso comercial sin fricción legal: la licencia Apache 2.0 del modelo base permite integrarlo en productos comerciales sin obligaciones de liberar código derivado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV-cache):
  - Q2_K: ~11,0 GB
  - Q3_K_M: ~13,6 GB
  - IQ4_XS: ~15,5 GB
  - Q4_K_M: ~16,9 GB
  - Q5_K_M: ~19,6 GB
  - Q6_K: ~22,5 GB
  - Q8_0: ~29,1 GB
  - A estas cifras hay que sumar la memoria del KV-cache, que depende de la longitud de contexto (no disponible).
- GPU recomendadas:
  - Q4_K_M y Q5_K_M: RTX 3090/4090 (24 GB) o RTX 5090.
  - Q6_K: RTX 4090 justa; recomendable A100 40 GB, RTX A6000 o RTX 5090.
  - Q8_0: A100 40 GB, A6000, L40S o doble GPU de consumo.
- Cabe en consumer GPU: sí, en GPUs de 24 GB con cuantizaciones de Q2_K a Q5_K_M; en GPUs de 16 GB solo con Q2_K/Q3_K_S (ajustadas). Con descarga parcial a CPU (offload), es viable en configuraciones con menos VRAM a costa de latencia.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. El formato original en safetensors sería compatible con vLLM o TGI, pero este repositorio solo contiene GGUF.
- Latencia y throughput: no disponible; en general, las cuantizaciones Q4_K se describen como "fast, recommended" en la model card, y Q8_0 como "fast, best quality".

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Piccolo-27B (base) | ~27,3B | safetensors | Apache 2.0 | Modelo de decisión con atención bidireccional y soporte multimodal |
| Qwen2.5-32B-Instruct | ~32,5B | safetensors, GGUF (comunidad) | Apache 2.0 | Transformer causal estándar, ecosistema maduro, benchmarks publicados |
| Gemma 2 27B | ~27,2B | safetensors, GGUF (comunidad) | Gemma Terms of Use | Tamaño similar, restricciones de licencia más limitadas que Apache 2.0 |

Piccolo-27B destaca frente a Gemma 2 27B por su licencia Apache 2.0 plenamente comercial, y frente a Qwen2.5-32B por su arquitectura de decisión con atención bidireccional, aunque carece del ecosistema de benchmarks y herramientas verificado de estos últimos.

## Limitaciones y advertencias

- Son cuantizaciones estáticas, no weighted/imatrix: la calidad en cuantizaciones bajas (Q2_K, Q3_K_S) puede degradarse notablemente respecto al modelo original; el propio autor señala que las imatrix no están disponibles de momento.
- Sesgos conocidos: no disponible; al tratarse de un modelo entrenado principalmente en inglés y chino, puede presentar sesgos culturales y de rendimiento desigual en otros idiomas, incluido el castellano.
- Riesgo de alucinación: no disponible específicamente, pero como todo LLM de este tamaño puede generar contenido incorrecto con apariencia plausible; verifique hechos críticos.
- Idiomas: soporte documentado solo para inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto: no disponible, lo que dificulta planificar memoria para el KV-cache en producción.
- Arquitectura no convencional: la atención bidireccional y el enfoque de "decision model" pueden no ser compatibles con todos los runtimes ni con plantillas de chat estándar; verifique la compatibilidad con llama.cpp antes de desplegar.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base agentscope-ai/Piccolo-27B por si existen consideraciones adicionales.
- Los archivos mmproj son necesarios para las capacidades multimodales; sin ellos el modelo funcionará solo como modelo de texto.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/Piccolo-27B-GGUF
- Modelo base: https://huggingface.co/agentscope-ai/Piccolo-27B
- Página de descargas resumida de mradermacher: https://hf.tst.eu/model#Piccolo-27B-GGUF
- Solicitudes de cuantización (FAQ): https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador (nethype GmbH): https://www.nethype.de/
- Paper, blog oficial o demo: no disponible
