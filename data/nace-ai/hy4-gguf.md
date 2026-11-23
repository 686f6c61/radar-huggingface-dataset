# nace-ai/Hy4-GGUF

## Resumen

Hy4-GGUF es una cuantización del modelo Hy4 de Tencent, publicada por Nace.AI, distribuida en formato GGUF para su uso con llama.cpp. El modelo base es un transformer con arquitectura de mezcla de expertos (MoE) de 769.907.408.797 parámetros totales, orientado a generación de texto y con un proyector de visión adicional que sugiere capacidades multimodales (el tag del repositorio es `hy_v4_vl`). La cuantización se presenta como un único fichero de pesos de 447,5 GB en Q4_K_M, más un proyector de visión de 2,7 GB.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar en llama.cpp un modelo de escala cercana a los 770.000 millones de parámetros, algo que hasta hace poco quedaba restringido a infraestructuras de inferencia dedicadas como vLLM o TGI. Por otro, el autor publica una metodología de cuantización propia ("Nace Weight Space Quantization") que aplica 4 bits solo a los expertos enrutados y mantiene 8 bits en atención, expertos compartidos, embeddings y capa de salida, además de BF16 en las matrices de expansión de KV y precisión completa en routers y normas.

El modelo se publica con fecha de creación del 23 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes en Hugging Face. La licencia es la Tencent Hy License, versión 1.0, que incluye términos comerciales específicos para operadores de Model-as-a-Service a gran escala (sección 10).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); 77 capas MoE según la model card; variante multimodal (tag `hy_v4_vl`) |
| Parametros totales | 769.907.408.797 (dato de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de ejecución usa `-c 8192`, pero no se declara como contexto máximo) |
| Tipos de cuantizacion | Q4_K_M (4,65 bits por peso de media); el autor menciona además FP8 y MLX 4-bit de terceros como referencia comparativa |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License, versión 1.0 (`tencent-hy-license`), con términos comerciales en la sección 10 para operadores de Model-as-a-Service |
| Formato de pesos | GGUF (fichero único `Hy4-Q4_K_M.gguf` de 447,5 GB) más proyector de visión de 2,7 GB |

## Arquitectura y entrenamiento

La información disponible confirma que Hy4 es un modelo de mezcla de expertos con 77 capas MoE y 769.907.408.797 parámetros totales. La model card de la cuantización detalla la política de precisión aplicada por capa: los pesos de los expertos enrutados en las 77 capas MoE se almacenan a 4 bits; atención, expertos compartidos, la FFN densa de la primera capa, embeddings y capa de salida usan 8 bits; las matrices de expansión de KV se mantienen en BF16; y routers y normas conservan precisión completa. Esta distribución es la que explica una media de 4,65 bits por peso en un fichero de 447,5 GB.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base empleó RLHF, DPO u otras técnicas de alineación. Tampoco se detalla la innovación arquitectónica interna más allá de la estructura MoE y la presencia de un proyector de visión. El autor sí documenta una innovación relevante en el plano de la cuantización: la preservación de precisión en los componentes sensibles (routers, normas, matrices KV) mientras se comprime agresivamente el grueso paramétrico, que reside en los expertos enrutados.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (`text-generation`) y el tag `conversational`.
- Procesamiento multimodal de visión: el repositorio incluye un proyector de visión de 2,7 GB y el tag `hy_v4_vl`, lo que indica soporte de entrada de imágenes junto a texto.
- Plantilla de chat propia: requiere `--jinja` en llama.cpp porque no coincide con ninguna plantilla integrada, lo que implica soporte de conversaciones multi-turno con roles.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el modelo puede servirse a través de la API compatible de llama.cpp (`llama-server`).
- No se dispone de información sobre soporte de tool calling, function calling, razonamiento multi-paso, modo thinking, audio u otras capacidades especiales.

## Casos de uso

- Despliegue local de gran escala en llama.cpp: equipos con acceso a nodos multi-GPU pueden servir el modelo con `llama-server` y `--jinja`, aprovechando la integración con la API compatible de OpenAI que ofrece llama.cpp para conectar aplicaciones existentes sin reescribir clientes.
- Análisis de documentos con imágenes: gracias al proyector de visión incluido, el modelo puede recibir capturas, diagramas o páginas escaneadas junto a instrucciones textuales, útil para extracción de información estructurada a partir de documentación técnica.
- Asistentes conversacionales de dominio especializado: la plantilla de chat propia y el formato GGUF permiten ajustar el system prompt y mantener conversaciones multi-turno; el tamaño del modelo favorece respuestas con mayor cobertura de conocimiento que alternativas de menor escala.
- Investigación en cuantización: el repositorio publica métricas de KL frente a BF16 (0,068 de media, 91,8% de coincidencia en el siguiente token sobre 5.621 posiciones), lo que lo convierte en un caso de estudio reproducible para comparar estrategias de cuantización mixta en modelos MoE de gran tamaño.
- Procesamiento por lotes en infraestructura propia: al ser un fichero GGUF único, se puede distribuir y versionar con `hf download`, lo que simplifica la reproducibilidad en pipelines internos de evaluación.
- Servicio de inferencia con requisitos de licencia controlados: organizaciones que ya operan bajo la Tencent Hy License pueden integrar esta cuantización sin cambiar de marco legal, siempre revisando la sección 10 si actúan como proveedores de Model-as-a-Service.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Sí incluye métricas de fidelidad de la cuantización frente al modelo BF16, medidas por el autor sobre 11 textos reservados en noviembre de 2026:

| Metrica | Hy4-GGUF Q4_K_M (Nace.AI) | AngelSlim Q4_K_M | Xylolabs MLX 4-bit |
|---|---|---|---|
| Tamano del fichero de pesos | 447,5 GB | 470,2 GB | 447,6 GB |
| Bits por peso (media) | 4,65 | no disponible | no disponible |
| KL media frente a BF16 | 0,068 | 0,091 | 0,091 |
| Coincidencia de siguiente token con BF16 | 91,8% de 5.621 posiciones | no disponible | no disponible |

No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos ocupa 447,5 GB, a los que se suma el proyector de visión de 2,7 GB. Con caché KV y buffers de llama.cpp, se requiere un agregado de memoria de GPU superior a 450 GB para cargar el modelo completo con `-ngl 99`.
- GPU recomendadas: no cabe en una sola GPU de consumo ni en una sola GPU de数据中心 de 80 GB. Se necesitan configuraciones multi-GPU, por ejemplo 6× H100 de 80 GB (480 GB) o 8× A100 de 80 GB (640 GB), con margen para caché KV y contexto.
- GPU de consumo: no es viable en RTX 4090 (24 GB) ni en ninguna GPU consumer individual. Solo sería posible con offloading parcial a RAM del sistema, con una penalización de latencia muy severa dado el tamaño del modelo.
- Opciones de despliegue: llama.cpp es la vía documentada, requiriendo una compilación específica (PR #32517, commit `f8d4cc4`, fork `Little0o0/llama.cpp`) con `-DGGML_CUDA=ON`. El autor no menciona soporte en vLLM, TGI u Ollama para este fichero GGUF concreto.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-GGUF (Nace.AI) | 769.907.408.797 | no disponible | GGUF Q4_K_M (447,5 GB) | Tencent Hy License 1.0 | Hugging Face, 0 descargas |
| Hy4 base (Tencent) | 769.907.408.797 | no disponible | safetensors (BF16) | Tencent Hy License 1.0 | Hugging Face (`tencent/Hy4`) |
| AngelSlim Q4_K_M de Hy4 | 769.907.408.797 (mismo base) | no disponible | GGUF Q4_K_M (470,2 GB) | Tencent Hy License 1.0 | Referenciado en la model card |
| Xylolabs MLX 4-bit de Hy4 | 769.907.408.797 (mismo base) | no disponible | MLX 4-bit (447,6 GB) | Tencent Hy License 1.0 | Referenciado en la model card |

Las tres cuantizaciones comparten el mismo modelo base, por lo que la comparación relevante es de fidelidad y tamaño: Hy4-GGUF reporta KL 0,068 frente a 0,091 de las otras dos, con un fichero 22,7 GB menor que AngelSlim y prácticamente idéntico en tamaño a Xylolabs. No se dispone de datos para comparar con modelos de otras familias y escala similar.

## Limitaciones y advertencias

- Sesgos: no se documenta ninguna evaluación de sesgos ni de toxicidad en la información disponible.
- Alucinación: no se publican métricas de veracidad ni de tasa de alucinación; al ser un modelo de gran escala sin datos de alineación documentados, el riesgo debe evaluarse empíricamente antes de usarlo en producción.
- Contexto e idiomas: se desconoce la longitud máxima de contexto soportada y la lista de idiomas. El ejemplo de la model card usa `-c 8192`, que no debe interpretarse como el límite del modelo.
- Compatibilidad de llama.cpp: requiere una compilación específica (PR #32517, commit `f8d4cc4`). Las builds estándar de llama.cpp, Ollama o LM Studio pueden no cargar el modelo correctamente.
- Plantilla de chat: `--jinja` es obligatorio; sin él, el chat template no se aplica y las respuestas pueden degradarse.
- Licencia: la Tencent Hy License 1.0 incluye términos comerciales específicos en su sección 10 para operadores de Model-as-a-Service a gran escala. Es imprescindible revisar el fichero `LICENSE` antes de ofrecer el modelo como servicio.
- Requisitos de infraestructura: más de 450 GB de memoria de GPU agregada hacen inviable el despliegue en entornos de un solo nodo con GPU consumer; el coste operativo es alto.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Hy4-GGUF
- Modelo base: https://huggingface.co/tencent/Hy4
- Sitio del autor: https://www.nace.ai/
- Pull request de llama.cpp requerido: https://github.com/ggml-org/llama.cpp/pull/32517
- Fork de llama.cpp con el commit necesario: https://github.com/Little0o0/llama.cpp
- Commit concreto: https://github.com/Little0o0/llama.cpp/commit/f8d4cc414546b8320a281f4c1364aba5f07d4149
- Licencia (referenciada en el repo): `LICENSE` dentro del repositorio de Hugging Face
