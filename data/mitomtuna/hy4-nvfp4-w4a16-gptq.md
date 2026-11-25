# mitomtuna/Hy4-NVFP4-W4A16-GPTQ

## Resumen

Hy4-NVFP4-W4A16-GPTQ es una cuantización post-entrenamiento en formato NVFP4 con esquema W4A16 (pesos a 4 bits, activaciones a 16 bits) del modelo base tencent/Hy4, desarrollado originalmente por Tencent. El repositorio lo publica el usuario mitomtuna y contiene únicamente el derivado cuantizado: la arquitectura, los pesos originales y la licencia pertenecen íntegramente a Tencent. La cuantización se realizó con el toolkit local-inference-lab/quant-toolkit mediante un proceso de dos etapas que combina una búsqueda MSE por ventanas sobre los pesos y una resolución GPTQ con escalado Hessiano sobre los shards de expertos enrutados.

El interés de esta ficha radica en que se trata de un artefacto de cuantización agresiva (4 bits en pesos) orientado a despliegue de un modelo de gran tamaño en hardware con soporte NVFP4, con un paquete de 88 shards que suma aproximadamente 447 GiB. El autor documenta de forma inusualmente detallada el proceso de cuantización, las puertas de aceptación y las métricas de divergencia KL frente al profesor BF16, lo que permite evaluar la pérdida de calidad con datos concretos en lugar de afirmaciones genéricas.

No se dispone de información sobre el número de parámetros totales, la longitud de contexto, los idiomas soportados ni los benchmarks de capacidad del modelo base en la información proporcionada; esta ficha se limita a lo que el repositorio y su model card documentan de forma explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base tencent/Hy4; el repositorio no detalla la arquitectura) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A16 (pesos 4 bits, activaciones 16 bits), GPTQ con escalas Hessianas; escalas base derivadas por búsqueda MSE por ventanas |
| Idiomas soportados | no disponible (el conjunto de calibración incluye inglés, chino y código) |
| Licencia | Tencent Hy License, Version 1.0 (derivada de Apache-2.0 con términos comerciales adicionales para uso a gran escala como Model-as-a-Service) |
| Formato de pesos | safetensors (88 shards, ~447 GiB), con sidecars `.sidecar.json` por shard, `model.safetensors.index.json`, `config.json`, `generation_config.json`, tokenizer y `chat_template.jinja` |

## Arquitectura y entrenamiento

La arquitectura del modelo base no se describe en la información disponible; el repositorio es un derivado cuantizado y no incluye detalles sobre el transformer, el número de capas, la atención o el esquema de mezcla de expertos. Lo que sí se documenta es que la cuantización afecta a 59.136 matrices distribuidas en 77 bloques de expertos enrutados, lo que confirma que el modelo base emplea una arquitectura con expertos enrutados (MoE), aunque no se especifica el número total de expertos ni los parámetros activos por token.

El proceso de cuantización consta de dos etapas. La primera construye una base de escalas derivada exclusivamente de los pesos mediante una búsqueda MSE por ventanas, con escalas por experto. La segunda aplica GPTQ con escalado Hessiano (`damp_frac = 0.20`) sobre grupos de escala de 16 columnas, manteniendo congeladas las escalas por experto de la base MSE: GPTQ re-resuelve los pesos, nunca las escalas. La calibración empleó 1.048.576 tokens con plantilla de chat más 524.288 tokens en bruto (wikitext-2 en inglés, un pool CJK para chino y fuentes de transformers/torch para código), en ventanas de 8.192 tokens y disjuntas de los conjuntos de evaluación. Las entradas a los expertos se capturaron del modelo en BF16.

Las puertas de aceptación exigían que cada matriz reemplazada mostrara menor error de calibración que la base MSE y que la KL frente al profesor BF16 mejorara en la calibración de chat. El paquete incluye auditorías por CPU (un experto por bloque más un 10% de expertos aleatorios con semilla) y una verificación byte a byte del roundtrip del cargador, con cero discrepancias. El registro de procedencia completo se publica como `export_report.json`.

## Capacidades

- Generación de texto y conversación multi-turno: el modelo base se distribuye con plantilla de chat (`chat_template.jinja`) y la calibración incluyó un pool específico de chat y un subconjunto "agentic", lo que indica uso previsto conversacional y orientado a agentes.
- Capacidades de razonamiento y código: el conjunto de calibración incluye fuentes de transformers y torch, y las métricas se desglosan por pool de código, lo que sugiere exposición del modelo base a dominios de programación.
- Capacidades multilingües limitadas a lo documentado: la calibración cubre inglés y chino (pool CJK), pero no se declara una lista oficial de idiomas soportados.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente; el subconjunto de calibración "agentic" es el único indicio.
- Modo thinking, visión o audio: no disponible en la información proporcionada.
- Despliegue con kernels NVFP4: validado con FLARE en TP8 sobre 8× NVIDIA RTX PRO 6000, usando forks del motor y de FlashInfer con ramas `hy4`.

## Casos de uso

- Despliegue de inferencia a gran escala con cuantización de 4 bits: el paquete de ~447 GiB en 88 shards está pensado para servirse con paralelismo de tensor (TP8 validado) en nodos de 8 GPU con soporte NVFP4, reduciendo el coste de memoria frente al checkpoint BF16 original.
- Servicio conversacional con plantilla de chat: al incluir `chat_template.jinja` y haber sido calibrado con 1.048.576 tokens de chat, es adecuado para endpoints de conversación multi-turno siempre que se valide la calidad con el harness KL incluido.
- Evaluación comparativa de técnicas de cuantización: el repositorio publica `export_report.json`, sidecars por shard y métricas de KL por pool (raw, chat, agentic, chino, código), lo que lo convierte en un artefacto útil para reproducir y auditar recetas NVFP4 W4A16 frente a alternativas.
- Investigación sobre robustez de MoE a la cuantización: los 77 bloques de expertos enrutados y la observación de que la selección top-k de expertos cambia bajo ruido de pesos ofrecen un caso de estudio concreto para estudiar el impacto de la cuantización en el enrutamiento.
- Integración en pipelines de CI de cuantización: las puertas de aceptación (error de calibración por matriz, KL frente al profesor, auditorías por CPU y roundtrip byte a byte) sirven como plantilla para validar derivados cuantizados antes de publicarlos.
- Benchmarking de kernels NVFP4: al haberse validado con FLARE y FlashInfer en sus ramas `hy4`, es un candidato para medir throughput y latencia de kernels de 4 bits en Blackwell/RTX PRO 6000.
- Uso comercial sujeto a licencia: cualquier despliegue comercial debe revisar la Tencent Hy License 1.0, que añade términos específicos para uso a gran escala como Model-as-a-Service.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El repositorio sí publica métricas de fidelidad de la cuantización frente al profesor BF16, medidas con un harness de rotary en FP32:

| Pool | MSE base | q4 (este paquete) | q4 vs base |
|---|---:|---:|---:|
| Raw (40 ventanas / 327.677 tokens) | 0,51756 | 0,51609 | −0,3% |
| — Inglés (12 ventanas) | 0,16530 | 0,17293 | +4,6% |
| — Código (12 ventanas) | 1,45486 | 1,42539 | −2,0% |
| — Chino (16 ventanas) | 0,07878 | 0,09149 | +16,1% |
| Chat (24 ventanas / 196.605 tokens) | 0,75171 | 0,67656 | −10,0% |
| — Agentic (8 ventanas) | 0,81182 | 0,74470 | −8,3% |
| — Chino (8 ventanas) | 0,56518 | 0,49276 | −12,8% |
| — General (8 ventanas) | 0,87813 | 0,79222 | −9,8% |

Métricas adicionales del paquete:

| Métrica | Valor |
|---|---|
| Matrices cuantizadas | 59.136 (77 bloques de expertos) |
| Matrices con menor error que la base MSE | 59.136 (`objective_not_lower = 0`) |
| Ratio de objetivo de calibración agrupado (GPTQ vs base MSE) | 0,4982 |
| Error relativo medio de dequantización | 0,0881 |
| Error relativo máximo de dequantización | 0,0984 |
| Tensores passthrough | 2.556 (dtypes preservados) |
| Hash determinista del paquete | `378f1e5903a9aff0de0e70a1a0fde35b26fa9ef02dc60f9f42faec017c988ae9` |
| NLL del profesor BF16 en ventanas raw | 2,668 |

## Requisitos de hardware

- VRAM estimada: el paquete de pesos ocupa aproximadamente 447 GiB en formato NVFP4 W4A16, por lo que la inferencia requiere un nodo multi-GPU; no se dispone de estimaciones de VRAM adicional para caché KV ni activaciones.
- GPU recomendadas: NVIDIA RTX PRO 6000 (validado en configuración de 8 unidades con TP8). El soporte NVFP4 depende de la generación de hardware y de los kernels; no se documentan otras GPU compatibles.
- Cabe en consumer GPU: no, según el tamaño del paquete (~447 GiB) y la configuración de despliegue documentada (8 GPU).
- Opciones de despliegue: FLARE con TP8, usando los forks `tunamitom/flare-local-inference` (rama `hy4`) y `tunamitom/flashinfer` (rama `hy4`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada: no se conocen los parámetros, el contexto ni los benchmarks del modelo base tencent/Hy4, y el repositorio no cita derivados cuantizados alternativos del mismo checkpoint. La comparación más directa disponible es frente al propio checkpoint BF16 de referencia, cuyas métricas de KL se recogen en la tabla de benchmarks de esta ficha.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hy4-NVFP4-W4A16-GPTQ (este) | no disponible | no disponible | Tencent Hy 1.0 | Hugging Face (mitomtuna) |
| tencent/Hy4 (BF16, base) | no disponible | no disponible | Tencent Hy 1.0 | Hugging Face (tencent) |
| Alternativas cuantizadas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un derivado del modelo base, hereda los sesgos de este, que no se describen.
- Riesgo de alucinación: no cuantificado. Las métricas publicadas miden fidelidad frente al profesor BF16, no veracidad.
- Pérdida de calidad medible: la KL empeora un 4,6% en el pool raw de inglés y un 16,1% en el pool raw de chino respecto a la base MSE, aunque mejora en chat (−10,0%) y en código (−2,0%). Los niveles absolutos de KL son elevados en ambos brazos porque el checkpoint oficial es menos confiado en esos corpus (NLL del profesor 2,668) y la selección top-k de expertos cambia bajo ruido de pesos.
- Idiomas: solo se documenta calibración en inglés, chino y código; no hay lista oficial de idiomas soportados ni evaluación de otros idiomas.
- Licencia: Tencent Hy License 1.0, derivada de Apache-2.0 pero con términos comerciales adicionales para uso a gran escala como Model-as-a-Service; la cuantización no altera los términos. Es imprescindible revisar `LICENSE` antes de un despliegue comercial.
- Dependencia de hardware y software específicos: el despliegue validado requiere NVFP4, FLARE y forks concretos de FlashInfer; no hay garantía de funcionamiento en otros stacks.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado; es un artefacto reciente (creado el 25 de noviembre de 2026) sin validación comunitaria.
- Atribución: el repositorio solo contiene el derivado cuantizado; cualquier uso debe citar y enlazar el repositorio original tencent/Hy4.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/mitomtuna/Hy4-NVFP4-W4A16-GPTQ
- Modelo base: https://huggingface.co/tencent/Hy4
- Licencia del modelo base: https://huggingface.co/tencent/Hy4/blob/main/LICENSE
- Toolkit de cuantización: https://github.com/local-inference-lab/quant-toolkit
- Fork de FLARE (rama `hy4`): https://github.com/tunamitom/flare-local-inference/tree/hy4
- Fork de FlashInfer (rama `hy4`): https://github.com/tunamitom/flashinfer/tree/hy4
