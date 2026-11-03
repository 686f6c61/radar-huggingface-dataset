# mradermacher/Qwen3.5-122B-A10B-Claude-Distill-v2-GGUF

## Resumen

Qwen3.5-122B-A10B-Claude-Distill-v2 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 122.111.526.912 parámetros totales, desarrollado originalmente por el usuario clzoro y distribuido en formato GGUF por mradermacher. Se trata de un ajuste fino (SFT) sobre una base Qwen3.5 de 122B de parámetros totales con 10B activos, destilado a partir de trazas de Claude, según indican los tags del repositorio (`claude`, `distillation`, `sft`, `moe`). El modelo está pensado para conversación y generación de texto en inglés y chino.

El repositorio que nos ocupa es una recopilación de cuantizaciones estáticas en formato GGUF generadas por mradermacher, un conocido cuantizador de la comunidad, a partir de los pesos originales en safetensors de clzoro. La relevancia práctica de esta ficha radica en que permite ejecutar un modelo de 122B parámetros con activación dispersa en hardware de consumo o servidores modestos, algo inviable con un modelo denso de ese tamaño. Al ser MoE con 10B activos, el coste computacional por token se aproxima al de un modelo denso de ~10B, aunque el requisito de memoria viene determinado por los 122B totales.

La licencia es Apache 2.0, lo que facilita su uso comercial, aunque la naturaleza del ajuste (destilación desde Claude) introduce incertidumbres legales y de calidad que conviene considerar. No se dispone de información pública sobre el proceso de entrenamiento, los datos utilizados ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), según tags del repo |
| Parámetros totales | 122.111.526.912 |
| Parámetros activos | 10B (según nomenclatura A10B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE), tal como indican los tags `moe` y la nomenclatura `A10B` del nombre del modelo, que sugiere 10B parámetros activos por token sobre un total de 122B. No se dispone de información detallada sobre el número de expertos, la estrategia de enrutamiento, la dimensión de las capas ni la longitud de contexto nativa. El modelo base es `clzoro/Qwen3.5-122B-A10B-Claude-Distill-v2`, sobre el que mradermacher ha aplicado cuantización estática (no imatrix; las versiones ponderadas con imatrix están en un repositorio separado).

El proceso de entrenamiento del modelo original, según los tags, consistió en un ajuste fino supervisado (SFT) con destilación desde Claude. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La información disponible es insuficiente para caracterizar el entrenamiento con rigor.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento y respuesta a instrucciones, derivado del ajuste SFT.
- Capacidades multimodales: el repositorio incluye ficheros `mmproj` (Q8_0 y f16), lo que indica soporte de entrada de visión en el modelo base, aunque no se detalla su alcance.
- Destilación desde Claude: se espera un estilo de respuesta y razonamiento influido por las trazas del modelo profesor, aunque no hay documentación que lo verifique.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional bilingüe (inglés-chino): el modelo puede gestionar diálogos multi-turno en ambos idiomas, adecuado para productos dirigidos a mercados anglófonos y sinófonos, aunque la longitud de contexto no está documentada.
- Despliegue en servidores con VRAM limitada: gracias a su naturaleza MoE con 10B activos, la cuantización Q4_K_M (74,3 GB) permite ejecutar un modelo de 122B en una o dos GPUs de 48 GB, algo imposible con un denso equivalente.
- Generación de texto creativo y redacción asistida: el ajuste SFT orientado a conversación y la influencia de Claude pueden producir respuestas estilísticamente cuidadas para tareas de escritura.
- Prototipado de investigación sobre destilación: útil para estudiar el efecto de la destilación desde Claude sobre una base Qwen3.5 en tareas de razonamiento y estilo.
- Procesamiento de documentos con componente visual: los ficheros `mmproj` permiten, en teoría, tareas de comprensión de imagen junto con texto, si el runtime GGUF lo soporta.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece un abanico amplio (Q2_K a Q8_0) para medir el impacto de la cuantización en calidad y rendimiento sobre un MoE grande.
- Investigación sobre eficiencia de MoE en inferencia local: permite medir throughput y latencia de un MoE de 122B/10B en hardware de consumo con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de fichero GGUF):
  - Q2_K: ~45 GB.
  - Q3_K_S: ~53 GB; Q3_K_M: ~58,7 GB; Q3_K_L: ~63,5 GB.
  - IQ4_XS: ~66,3 GB; Q4_K_S: ~69,8 GB; Q4_K_M: ~74,3 GB.
  - Q5_K_S: ~84,3 GB; Q5_K_M: ~87 GB.
  - Q6_K: ~100,4 GB (3 partes).
  - Q8_0: ~130 GB (3 partes).
  - Complementos multimodales: mmproj-Q8_0 ~0,7 GB; mmproj-f16 ~1,0 GB.
- GPU recomendadas: para Q4_K_M se necesita al menos 80 GB de VRAM agregada (por ejemplo, 2× A100 40GB, 1× A100 80GB o 1× H100 80GB). Para Q2_K puede caber en 48 GB (A6000, L40S, 2× RTX 4090 de 24 GB). Las cuantizaciones Q6_K y Q8_0 requieren 100-130 GB, lo que implica múltiples GPUs de 80 GB o configuraciones con CPU offload.
- ¿Cabe en GPU de consumo? Solo las cuantizaciones más agresivas (Q2_K, Q3_K_S) caben en configuraciones multi-GPU de consumo (por ejemplo, 2× RTX 4090 = 48 GB), y con riesgo de degradación de calidad. En una única RTX 4090 (24 GB) no cabe ninguna cuantización completa.
- Opciones de despliegue: llama.cpp, Ollama (a partir de GGUF), y servidores compatibles con GGUF como llama-cpp-python o LM Studio. vLLM y TGI no soportan GGUF de forma nativa para este tipo de modelo; para esos runtimes habría que usar los safetensors originales, que requieren mucha más VRAM.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser MoE con 10B activos, el throughput por token debería aproximarse al de un denso de ~10B, pero el ancho de banda de memoria para cargar expertos puede limitar el rendimiento en configuraciones con offload.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-122B-A10B-Claude-Distill-v2 (este) | 122B | 10B | no disponible | Apache 2.0 | GGUF, safetensors |
| Qwen3-235B-A22B | 235B | 22B | 128K (según Qwen3) | Apache 2.0 | safetensors, GGUF |
| Qwen3-30B-A3B | 30B | 3B | 128K (según Qwen3) | Apache 2.0 | safetensors, GGUF |
| Mixtral 8x22B | 141B | 39B | 64K | Apache 2.0 | safetensors, GGUF |

La comparación se basa en datos públicos de los modelos citados; para este modelo no hay datos de contexto ni benchmarks que permitan una comparación de rendimiento rigurosa. La ventaja principal frente a Mixtral 8x22B es el menor número de parámetros activos (10B frente a 39B), lo que reduce el coste computacional por token. Frente a Qwen3-235B-A22B, este modelo es más pequeño y ligero en activación, pero se desconoce su calidad relativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia verificable de calidad, razonamiento o rendimiento en tareas estándar.
- Origen del ajuste incierto: la destilación desde Claude puede implicar el uso de datos generados por un modelo propietario, con posibles implicaciones legales y de términos de servicio, aunque la licencia declarada sea Apache 2.0.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Longitud de contexto desconocida: no se puede garantizar el manejo de conversaciones largas o documentos extensos.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin benchmarks ni documentación de alineación, no se puede cuantificar.
- Sesgos: no documentados; al derivar de una base Qwen y de trazas de Claude, puede heredar sesgos de ambos.
- Cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la calidad de forma notable; para producción se recomienda Q4_K_M o superior, lo que exige al menos 80 GB de VRAM.
- El repositorio tiene muy pocas descargas (184) y cero likes, lo que sugiere escasa validación por parte de la comunidad.
- No hay información sobre tool calling, agentes o modo thinking, por lo que no se debe asumir su disponibilidad en producción.
- La fecha de creación (2026-05-14) y actualización (2026-11-03) indican un modelo reciente y posiblemente inestable en cuanto a mantenimiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-122B-A10B-Claude-Distill-v2-GGUF
- Modelo base: https://huggingface.co/clzoro/Qwen3.5-122B-A10B-Claude-Distill-v2
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.5-122B-A10B-Claude-Distill-v2-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.5-122B-A10B-Claude-Distill-v2-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
