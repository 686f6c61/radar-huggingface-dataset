# edededdy/LittleKedi-medium-wide-sparse-base

## Resumen

LittleKedi-medium-wide-sparse-base es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) entrenado desde cero por el autor independiente edededdy, inspirado explícitamente en la arquitectura DeepSeek-V3. Con 305,4 millones de parámetros totales pero solo 31,7 millones activos por token (un 10 % del total), es un artefacto educativo y de investigación que prioriza la experimentación con enrutamiento disperso sobre el rendimiento absoluto. No está afiliado a DeepSeek.

El modelo pertenece a la familia LittleKedi, una colección de modelos MoE de varios tamaños (de 2 M a 1016 M de parámetros) donde cada tamaño existe en tres variantes según su grado de dispersión: standard, sparse y wide-sparse. Esta variante "wide-sparse" es la más dispersa de su tamaño: 240 expertos enrutados de 128 dimensiones ocultas con top-8, más 2 expertos compartidos, lo que maximiza la capacidad de almacenamiento de conocimiento a costa de necesitar más datos de entrenamiento por experto.

Se trata de un modelo base, sin ajuste por instrucciones: continúa texto pero no sigue órdenes. El autor lo describe como capaz de escribir inglés fluido y sobre el tema, pero con escaso conocimiento factual y propenso a inventar con seguridad. Su relevancia actual es la de servir como banco de pruebas de bajo coste para estudiar arquitecturas MoE tipo DeepSeek (MLA, DeepSeekMoE, balanceo sin pérdida auxiliar) en hardware modesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Multi-head Latent Attention (MLA) y DeepSeekMoE |
| Parámetros totales | 305.361.824 (305,4 M) |
| Parámetros activos | 31,7 M por token (10 % del total); 23,29 M sin contar embeddings |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | no disponible (pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Capas / dimensión oculta | 8 / 512 (2 primeras capas con FFN denso SwiGLU de 1408; capas 2-7 MoE) |
| Expertos enrutados | 240 (SwiGLU, 128 ocultas), top-8, más 2 expertos compartidos |
| Cabezas de atención | 8; KV latente 128, query latente 256, RoPE desacoplado 32, dims de cabeza 64+32 (q/k) y 64 (v) |
| Vocabulario | 16.384 tokens (BPE byte-level, ~4,00 bytes/token) |
| Enrutamiento | Gating sigmoide, group-limited routing (8 grupos, top-4) |
| Balanceo de carga | Sin pérdida auxiliar (bias, velocidad 0,001) más pérdida secuencial pequeña (α = 0,0001) |
| Embeddings | Entrada y cabeza de salida atadas (tied) |

## Arquitectura y entrenamiento

El modelo sigue un diseño DeepSeek-V3 en miniatura: 8 capas con dimensión oculta 512, de las cuales las dos primeras usan un FFN denso SwiGLU de 1408 unidades y las seis restantes son capas MoE. La atención es Multi-head Latent Attention (MLA) con 8 cabezas, que comprime la caché KV almacenando únicamente un latente de 128 dimensiones más una clave RoPE de 32 dimensiones por token, lo que reduce drásticamente el coste de memoria en contexto largo. El bloque MoE emplea DeepSeekMoE con 240 expertos enrutados de 128 dimensiones ocultas (top-8 por token) más 2 expertos compartidos, gating sigmoide y enrutamiento limitado por grupos (8 grupos, top-4).

El entrenamiento se realizó desde cero sobre 20.400 millones de tokens (27.145.344 documentos, una sola pasada), lo que equivale a ~67 tokens por parámetro total y ~644 por parámetro activo. La mezcla de datos combina FineWeb-Edu, Cosmopedia v2 (SmolLM-Corpus), FineMath 4+, comentarios de Reddit, github-code-clean, SmolTalk y Wikipedia en inglés (2023-11-01), intercalados a lo largo de todo el entrenamiento. El balanceo de carga usa el esquema sin pérdida auxiliar de DeepSeek (bias de enrutamiento con velocidad de actualización 0,001) más una pequeña pérdida secuencial; en la segunda mitad del entrenamiento el lote mediano cargó 1,92× la media sobre el experto más ocupado (2,28× en la peor capa) y se descartó el 0,26 % de las asignaciones por capacidad. Durante el entrenamiento se aplicó capacidad fija (factor 2,0, con descarte de desbordamientos); en inferencia el despacho es siempre dropless.

## Capacidades

- Generación de texto en inglés: continuación de texto fluida y temática, sin ajuste por instrucciones.
- Razonamiento y matemáticas básicas: entrenado con FineMath 4+, pero sin datos publicados de rendimiento.
- Código: incluye github-code-clean en la mezcla de entrenamiento, por lo que puede continuar fragmentos de código.
- Capacidades multilingües: limitadas al inglés; el modelo declara únicamente `en`.
- Tool calling / function calling: no disponible (modelo base sin ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo base).
- Capacidad especial: arquitectura MoE con MLA y enrutamiento disperso, útil para investigación sobre eficiencia y enrutamiento.
- Contexto corto: ventana de 2.048 tokens, insuficiente para tareas de contexto largo.

## Casos de uso

- Investigación sobre arquitecturas MoE: el modelo permite estudiar el comportamiento de 240 expertos con top-8 y enrutamiento limitado por grupos en un entorno de bajo coste computacional, comparándolo con sus hermanos `medium` y `medium-sparse`, que comparten tokenizer y dataset.
- Experimentos de eficiencia y dispersión: al tener solo un 10 % de parámetros activos, sirve para medir el equilibrio entre capacidad total y coste de inferencia en GPUs de consumo.
- Estudio de MLA y caché KV comprimida: la implementación de MLA con latente de 128 dimensiones permite analizar el ahorro de memoria en contexto y validar implementaciones propias de atención.
- Benchmarking de balanceo de carga: los datos de carga por experto publicados (1,92× la media, 0,26 % de descartes) permiten reproducir y comparar estrategias de balanceo sin pérdida auxiliar.
- Generación de texto de relleno en inglés: para prototipos que necesiten continuación de texto temática sin requisitos de precisión factual.
- Docencia y demostraciones: modelo pequeño (1,2 GB en safetensors) que cabe en portátiles y permite explicar en clase cómo funciona un MoE disperso con atención latente.
- Base para ajuste fino experimental: al ser un modelo base con licencia Apache 2.0, puede servir como punto de partida para experimentos de instruction tuning a pequeña escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 1,2 GB en safetensors; en FP16 serían ~0,6 GB de pesos, pero al ser MoE con 240 expertos se necesita cargar todos los expertos en memoria, por lo que en la práctica se requiere espacio para los 305 M de parámetros (~0,6 GB en FP16, ~0,3 GB en int8, ~0,15 GB en int4) más la caché KV.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más.
- Opciones de despliegue: no se especifican en la información disponible; al ser safetensors estándar puede cargarse con transformers, y para servir con vLLM, llama.cpp, Ollama o TGI habría que verificar la compatibilidad con MLA y el enrutamiento MoE concreto.
- Latencia y throughput: no disponible; con solo 31,7 M de parámetros activos se espera una latencia baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LittleKedi-medium-wide-sparse-base | 305,4 M | 31,7 M | 2.048 | Apache 2.0 | HuggingFace |
| LittleKedi-medium | 78,2 M | 31,0 M | no disponible | Apache 2.0 | HuggingFace |
| LittleKedi-medium-sparse | 163,4 M | 31,3 M | no disponible | Apache 2.0 | HuggingFace |
| LittleKedi-base-wide-sparse | 1.015,9 M | 107,6 M | no disponible | Apache 2.0 | HuggingFace |

Los tres modelos de la familia comparten tokenizer y dataset, por lo que son comparables directamente en capacidad total frente a parámetros activos: `medium` es el más denso (40 % activo), `medium-sparse` intermedio (19 %) y este `medium-wide-sparse` el más disperso (10 %). No se dispone de benchmarks para comparar rendimiento.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue órdenes, solo continúa texto.
- Escaso conocimiento factual y alta propensión a la alucinación; el propio autor advierte que "inventa con seguridad" y que no debe usarse para nada importante.
- Contexto muy corto (2.048 tokens), insuficiente para tareas de contexto largo o documentos extensos.
- Solo inglés: no soporta otros idiomas.
- Sesgos: entrenado con comentarios de Reddit, FineWeb-Edu y otras fuentes web, por lo que puede reproducir sesgos presentes en esos datos; no se documentan evaluaciones de sesgo.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo base sin garantías de calidad, su uso en producción requeriría ajuste fino y validación.
- Despacho de expertos: en entrenamiento se descartó el 0,26 % de asignaciones por capacidad; en inferencia el despacho es dropless, lo que puede aumentar la latencia en cargas desbalanceadas.
- Sin cuantizaciones publicadas: no hay GGUF ni versiones cuantizadas oficiales, lo que limita el despliegue directo en herramientas como Ollama o llama.cpp sin conversión manual.

## Enlaces

- HuggingFace: https://huggingface.co/edededdy/LittleKedi-medium-wide-sparse-base
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SmolLM-Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset Reddit comments: https://huggingface.co/datasets/HuggingFaceGECLM/REDDIT_comments
- Dataset github-code-clean: https://huggingface.co/datasets/codeparrot/github-code-clean
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
