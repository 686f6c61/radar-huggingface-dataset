# cloudyu/GLM-5.3-Flash-Slim

## Resumen

GLM-5.3-Flash-Slim es una edición no oficial, podada y cuantizada del modelo GLM-5.3-Flash de Z.ai, desarrollada por el usuario cloudyu. Su objetivo es reducir el tamaño de los pesos del modelo original de 306 GB a 133 GB para poder ejecutarlo en un único GPU de gama alta, como un H200 o un B200. El modelo base es un MoE multimodal de 320B parámetros totales y 18B activos; esta variante Slim conserva 192 expertos por capa de los 288 originales, cuantificados en NVFP4, mientras que el resto de la red se mantiene en bf16. Según los safetensors del repositorio, el total de parámetros es de 110.936.715.134. Está orientado a tareas de imagen-texto a texto, con soporte para inglés y chino. Su relevancia radica en permitir el despliegue de un modelo de razonamiento multimodal de última generación en un solo GPU de servidor, reduciendo así la barrera de infraestructura frente a los clústeres de varios nodos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 192 expertos por capa (de 288 originales), transformer multimodal |
| Parámetros totales | 110.936.715.134 |
| Parámetros activos | no disponible (el modelo base tiene 18B activos; se estima ~12B tras la poda de expertos) |
| Longitud de contexto | no disponible (el ejemplo de despliegue configura un máximo de 66 560 tokens) |
| Tipos de cuantización | NVFP4 (expertos enrutados, empaquetados en uint8), bf16 (atención, MLP densos, expertos compartidos, embeddings y lm_head) |
| Idiomas soportados | inglés, chino |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un derivado de GLM-5.3-Flash, un transformer multimodal con arquitectura MoE. Según la documentación de Cloudflare, el modelo base tiene 320B parámetros totales y 18B activos. La versión Slim elimina 96 expertos por capa, dejando 192 de los 288 originales. Los pesos de los expertos enrutados se cuantizan en NVFP4 mediante el formato modelopt W4A16, mientras que la atención, los MLP densos, los expertos compartidos, los embeddings y el lm_head permanecen en bf16. Esta combinación de poda y cuantización reduce el tamaño de los pesos de 306 GB a 133 GB.

No se ha proporcionado información sobre el proceso de entrenamiento original, la composición del dataset ni la existencia de RLHF/DPO. Tampoco se detallan innovaciones técnicas adicionales más allá de la poda y la cuantización. El modelo no incluye la cabeza MTP (Multi-Token Prediction), por lo que no soporta decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento científico y matemático: alcanza 83.3 % en GPQA-Diamond (strict) y 73.3 % pass@1 en AIME 2025.
- Generación de código: obtiene 97.6 % pass@1 en HumanEval, lo que indica una competencia alta en programación.
- Visión multimodal: al ser image-text-to-text, puede procesar imágenes y responder preguntas sobre ellas; obtiene 73.6 % en MMMU val.
- Conocimiento en chino: logra 81.3 % en C-Eval val, mostrando una buena base de conocimiento general en lengua china.
- Tool calling y function calling: mediante `--tool-call-parser glm47` y `--reasoning-parser glm45`, devuelve `tool_calls` estructurados con razonamiento en `reasoning_content`.
- Soporte de agentes y razonamiento multi-paso: los resultados en BFCL v4 (Live, Non-Live y Multi-Turn Base) demuestran capacidad de uso de herramientas, planificación y ejecución encadenada de tareas.
- Modo de razonamiento ajustable: incorpora un presupuesto de pensamiento configurable mediante `reasoning_effort` con valores `low`, `high` y `max`, lo que permite equilibrar precisión y coste computacional.

## Casos de uso

- Atención al cliente bilingüe: el modelo puede gestionar conversaciones multi-turno en inglés y chino, gracias a la ventana de contexto configurada en 66 560 tokens en el despliegue de ejemplo.
- Análisis de documentos con imágenes: al ser multimodal, es adecuado para responder preguntas sobre informes técnicos, capturas de pantalla o documentos escaneados que combinan texto e imagen.
- Generación de código en producción: con un 97.6 % en HumanEval, puede integrarse en pipelines de CI/CD y en asistentes de programación que necesiten tool calling para ejecutar pruebas o consultar APIs.
- Agentes autónomos: el rendimiento en BFCL v4 indica que puede planificar y ejecutar llamadas a funciones en escenarios de uso de herramientas en tiempo real.
- Tutoría de matemáticas y ciencias: los benchmarks de AIME y GPQA muestran competencia en problemas de nivel avanzado; puede usarse en aplicaciones educativas o de tutoría automatizada.
- Despliegue eficiente en un solo GPU: el modelo está optimizado para ejecutarse en una sola H200 o B200, lo que reduce los costes de infraestructura frente a soluciones multi-GPU.

## Benchmarks y rendimiento

Resultados de una sola ejecución en un único B200 con vLLM (rama no fusionada) y CUDA graphs activados. El autor advierte que la decodificación de MoE no es bit-determinista, por lo que los valores pueden variar ±2–3 puntos.

| Capacidad | Benchmark | Setting | Slim (192E) |
|---|---|---|---|
| Ciencia / razonamiento | GPQA-Diamond (198) | effort=low, max 65 536 | 83.3 % strict · 83.8 % tolerant |
| Matemáticas | AIME 2025 (30 × 4 muestras) | effort=high, max 65 536 | 73.3 % pass@1 · 30/30 resueltos en ≥1 muestra · 6/120 truncados |
| Código | HumanEval (164) | greedy, max 60 000 | 97.6 % pass@1 |
| Conocimiento chino | C-Eval val (1 606, 52 materias) | effort=low | 81.3 % |
| Visión | MMMU val (900) | effort=low, max 16 384 | 73.6 % |
| Tool use / agente | BFCL v4 Non-Live | effort=low, T=0.001 | 88.0 % |
| Tool use / agente | BFCL v4 Live | effort=low, T=0.001 | 78.6 % |
| Tool use / agente | BFCL v4 Multi-Turn Base (200) | effort=low, T=0.001 | 76.5 % |

## Requisitos de hardware

- VRAM estimada: el tamaño de los pesos es de 133.1 GB. Para inferencia, se necesita un GPU con al menos esa capacidad. En un H200 (141 GB) cabe con ~7 GB de KV cache si se configura `--max-model-len 16384` y `--max-num-seqs 4`.
- GPU recomendadas: B200 o GB200 (≥180 GB) para obtener el rendimiento óptimo y una configuración más holgada. El H200 es viable pero marginal y no ha sido probado según el autor.
- No cabe en GPUs de consumo como la RTX 4090 (24 GB) ni en la mayoría de GPUs de estación de trabajo.
- Opciones de despliegue: vLLM con una rama específica no fusionada (PR #53906). En el ejemplo se usa `vllm serve` con `--tool-call-parser glm47` y `--reasoning-parser glm45`. Se requiere ajustar `VLLM_USE_DEEP_GEMM=0`.
- Latencia y throughput: en un B200 se observan aproximadamente 1 000–1 500 tok/s agregados con 32–64 peticiones concurrentes. En H200 no se han publicado benchmarks, pero el propio autor espera una concurrencia baja.

## Comparativa con modelos similares

No se han encontrado modelos comparables con datos suficientes en la información proporcionada. A continuación se compara con el modelo base, que es la referencia más directa.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash (base) | 320B | 18B | no disponible | MIT | HuggingFace |
| GLM-5.3-Flash-Slim | ~111B | ~12B (estimado) | no disponible | MIT | HuggingFace |

## Limitaciones y advertencias

- Derivado no oficial, no producido ni respaldado por Z.ai.
- La poda de expertos (192/288) puede causar pequeñas regresiones en benchmarks de razonamiento difícil, como GPQA y AIME.
- Requiere la rama vLLM no fusionada; la instalación estándar con `pip install vllm` no cargará el modelo hasta que se fusione el PR #53906.
- El despliegue en H200 es marginal y no probado; se recomiendan GPUs de clase B200.
- No incluye cabeza MTP, por lo que no admite decodificación especulativa.
- La decodificación de MoE en vLLM no es determinista, por lo que los resultados pueden variar ±2–3 puntos.
- La etiqueta de idiomas solo incluye inglés y chino; no hay información sobre el comportamiento en otros idiomas.
- No se han publicado datos sobre sesgos, alucinaciones o evaluación de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cloudyu/GLM-5.3-Flash-Slim
- Modelo base GLM-5.3-Flash: https://huggingface.co/zai-org/GLM-5.3-Flash
- Pull request de vLLM: https://github.com/vllm-project/vllm/pull/53906
