# prithivMLmods/Surogate3.7-35B-A3B-GGUF

## Resumen

Surogate3.7-35B-A3B es un modelo multimodal de tipo Mixture-of-Experts (MoE) con 35.505.312.896 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token. Lo desarrolla el equipo de Surogate y se construye sobre Qwen3.5-35B-A3B-Base, sobre el que se aplica un post-entrenamiento en precisión FP4 ejecutado en GPUs NVIDIA RTX 5090 mediante el motor propietario Surogate Engine. La ficha que nos ocupa es la cuantización GGUF publicada por prithivMLmods, que empaqueta los pesos en múltiples formatos (BF16, NVFP4, MXFP4_MOE, Q2_K hasta Q8_0) junto con un proyector multimodal en BF16.

El modelo está orientado a flujos de trabajo agénticos empresariales y despliegue local. Incorpora una ventana de contexto de 1.000.000 de tokens, un modo de razonamiento ("thinking") conmutable y una cabeza de predicción multi-token (MTP) que permite decodificación especulativa sin necesidad de un modelo borrador separado. Según el autor, es capaz de servir hasta ocho usuarios agénticos concurrentes a contexto completo en una NVIDIA DGX Spark.

Su relevancia actual radica en la combinación de licencia Apache 2.0, soporte nativo para aceleración FP4 en hardware Blackwell (RTX 50-series, RTX Pro 6000, B200, B300) y un conjunto de cuantizaciones que abarcan desde 13,2 GB hasta 71,1 GB, lo que permite desplegarlo tanto en GPUs de consumo como en servidores de gama alta. El repositorio acumula 4.537 descargas y 7 "likes" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), familia Qwen3.5, con cabeza MTP y proyector multimodal |
| Parametros totales | 35.505.312.896 |
| Parametros activos | ~3.000 millones por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | BF16, NVFP4, MXFP4_MOE, Q2_K, Q3_K_L, Q3_K_M, Q4_0, Q4_K_M, Q4_K_S, Q5_0, Q5_K_M, Q5_K_S, Q6_K, Q8_0, mmproj-bf16 (proyector visual) |
| Idiomas soportados | Inglés (en); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero mmproj separado para visión) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE derivado de Qwen3.5-35B-A3B-Base, con 35.500 millones de parámetros totales y aproximadamente 3.000 millones activos por token, lo que reduce el coste computacional por paso a pesar del tamaño del modelo. Sobre esta base se añade una cabeza de predicción multi-token (MTP) que predice varios tokens futuros en un único forward pass; en el formato GGUF MTP esto se integra en los propios pesos, de modo que la decodificación especulativa funciona sin un modelo borrador externo. El modelo también incluye un proyector multimodal (mmproj-bf16, 903 MB) que habilita la entrada de imágenes.

El post-entrenamiento se realizó en precisión FP4 sobre GPUs NVIDIA RTX 5090 usando el Surogate Engine, un pipeline propietario del autor. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible. Sí se documenta explícitamente el soporte de decodificación especulativa vía MTP y la optimización para aceleradores Blackwell con FP4 Tensor Cores.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventana de contexto de hasta 1.000.000 de tokens.
- Modo de razonamiento ("thinking") conmutable, según indica la model card.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), gracias al proyector multimodal incluido.
- Decodificación especulativa mediante cabeza MTP integrada en los pesos GGUF, sin modelo borrador externo.
- Orientación a flujos agénticos empresariales: la model card menciona evaluaciones específicas de agentes (AutomationBench, Claw-Eval, CommerceAgentBench).
- Capacidades multilingües: la model card solo declara inglés; no se documentan otros idiomas.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Soporte de audio: no disponible.

## Casos de uso

- Atención al cliente automatizada: con 1.000.000 de tokens de contexto, el modelo puede mantener conversaciones multi-turno con historiales extensos, documentación de producto y registros de tickets en la misma ventana, reduciendo la necesidad de resumir o truncar el contexto.
- Agentes autónomos de empresa: la model card cita evaluaciones como AutomationBench y CommerceAgentBench, lo que sugiere su uso en automatización de tareas administrativas y de comercio electrónico con cadenas de pasos múltiples.
- Asistentes de documentación con imágenes: al aceptar entrada de imagen y texto, puede extraer información de capturas, diagramas o documentos escaneados y responder preguntas sobre ellos en local.
- Despliegue en estación de trabajo con GPU de consumo: la cuantización Q4_K_M (21,7 GB) permite ejecutar el modelo en GPUs con 24 GB de VRAM, útil para prototipos y desarrollo sin infraestructura de servidor.
- Inferencia de bajas latencia en Blackwell: los ficheros NVFP4 (24,8 GB) y MXFP4_MOE (20,3 GB) aprovechan los Tensor Cores FP4 de RTX 50-series, RTX Pro 6000, B200 y B300, adecuados para servicios con requisitos de throughput.
- Servicio multiusuario en DGX Spark: según el autor, el modelo puede atender hasta ocho usuarios agénticos concurrentes a contexto completo en una DGX Spark, lo que lo hace apto para equipos pequeños con despliegue on-premise.
- Análisis de repositorios o corpus largos: la ventana de 1M tokens permite procesar bases de código, expedientes o documentación legal completos en una sola pasada.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados declarados por el autor (no se especifican los conjuntos de evaluación completos ni la metodología):

| Benchmark | Resultado |
|---|---|
| AutomationBench | 34,3 |
| Claw-Eval | 82,4 |
| GPQA Diamond | 91,4 |
| WildClawBench | 54,6 |
| CommerceAgentBench | 39,4 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas directas con modelos de la misma clase. Tampoco se documentan métricas de latencia o throughput medidas.

## Requisitos de hardware

- VRAM estimada según cuantización: Q2_K 13,2 GB; Q3_K_M 17,2 GB; Q3_K_L 18,6 GB; Q4_0 20,2 GB; Q4_K_S 20,4 GB; Q4_K_M 21,7 GB; Q5_0 24,6 GB; Q5_K_S 24,6 GB; Q5_K_M 25,3 GB; Q6_K 29,2 GB; Q8_0 37,8 GB; MXFP4_MOE 20,3 GB; NVFP4 24,8 GB; BF16 71,1 GB. Hay que sumar el proyector mmproj-bf16 (903 MB) si se usa visión y el espacio para la caché KV, que con contexto de 1M tokens puede ser muy elevado.
- GPU recomendadas: NVIDIA RTX Pro 6000 Blackwell (96 GB), B200, B300 y RTX 50-series para los formatos FP4; RTX 4090 (24 GB) o A100/H100 para cuantizaciones Q4 y Q5.
- Cabe en GPU de consumo: sí, con Q4_K_M o inferiores en tarjetas de 24 GB (RTX 4090, RTX 3090). Las cuantizaciones Q6_K y Q8_0 requieren 32 GB o más; BF16 requiere al menos 80 GB.
- Opciones de despliegue: llama.cpp (llama-cli, con `-ngl auto` para offloading multi-GPU), vLLM (según la model card), y por extensión cualquier runtime compatible con GGUF. El autor probó NVFP4 en dos RTX PRO 6000 Blackwell Server Edition con llama-cli y decodificación especulativa MTP.
- Latencia y throughput: no se han publicado cifras concretas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Surogate3.7-35B-A3B | 35,5B | ~3B | 1M | Apache 2.0 | MoE multimodal, MTP, FP4 en Blackwell |
| Qwen3.5-35B-A3B-Base | ~35B | ~3B | no disponible | no disponible | Modelo base sobre el que se construye Surogate3.7 |
| Alternativas MoE de ~30-40B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar numéricamente con modelos de la misma categoría distintos del propio modelo base.

## Limitaciones y advertencias

- La model card solo declara inglés como idioma soportado; el rendimiento en castellano u otros idiomas no está documentado.
- No se detalla la composición del dataset de entrenamiento, por lo que no se pueden evaluar sesgos conocidos ni la cobertura de dominios.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de factualidad en la información disponible.
- La ventana de 1M tokens implica un coste de memoria para la caché KV muy elevado; en la práctica, usar el contexto completo requiere hardware con mucha VRAM o técnicas de atención eficiente no documentadas.
- Los benchmarks citados (GPQA Diamond, Claw-Eval, etc.) proceden del autor del modelo y no se acompañan de la metodología ni de comparaciones independientes.
- El post-entrenamiento se realizó en FP4 con un motor propietario (Surogate Engine); no se documentan los detalles del pipeline, lo que dificulta la reproducibilidad.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar las condiciones del modelo base Qwen3.5-35B-A3B-Base, cuyos términos no se detallan en esta ficha.
- El soporte de tool calling y function calling no se confirma explícitamente en la documentación disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/Surogate3.7-35B-A3B-GGUF
- Modelo base: https://huggingface.co/surogate/Surogate3.7-35B-A3B
- Fichero BF16: https://huggingface.co/prithivMLmods/Surogate3.7-35B-A3B-GGUF/blob/main/Surogate3.7-35B-A3B.BF16.gguf
- Fichero NVFP4: https://huggingface.co/prithivMLmods/Surogate3.7-35B-A3B-GGUF/blob/main/Surogate3.7-35B-A3B-NVFP4.gguf
- Fichero MXFP4_MOE: https://huggingface.co/prithivMLmods/Surogate3.7-35B-A3B-GGUF/blob/main/Surogate3.7-35B-A3B.MXFP4_MOE.gguf
- Fichero Q4_K_M: https://huggingface.co/prithivMLmods/Surogate3.7-35B-A3B-GGUF/blob/main/Surogate3.7-35B-A3B.Q4_K_M.gguf
- Proyector multimodal: https://huggingface.co/prithivMLmods/Surogate3.7-35B-A3B-GGUF/blob/main/Surogate3.7-35B-A3B.mmproj-bf16.gguf
- Plataforma del autor: https://surogate.ai
