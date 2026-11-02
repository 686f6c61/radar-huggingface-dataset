# Bizuayeu/GLM-5.3-Flash-Jammed-XSFP4

## Resumen

GLM-5.3-Flash-Jammed-XSFP4 es una cuantización derivada del checkpoint `nvidia/GLM-5.3-Flash-FP4-Local`, que a su vez parte del modelo `zai-org/GLM-5.3-Flash` (MIT). El autor de esta variante es el usuario de HuggingFace Bizuayeu, no NVIDIA ni Z.AI. Se trata de un modelo multimodal image-text-to-text con 331.033.893.726 parámetros totales (arquitectura MoE, con 8 de 288 expertos enrutados activos por token según la model card) y un repo de 172 GB repartido en 132 ficheros safetensors.

El objetivo concreto es reducir el consumo de memoria en sistemas GB10 (clase DGX Spark) frente a la variante XSFP4 del mismo autor: 14,2 GB menos en total, 6,58 GiB menos por máquina en configuración TP=2 y entre 4,1 y 4,5 GiB en TP=3. La estrategia consiste en recuantizar solo los expertos enrutados de las capas 3 a 44 a NVFP4 con escalas de bloque de 32 elementos (en lugar de 16) y almacenarlas en formato CSF0 de longitud fija, mientras el resto de tensores (atención, MLP densa, shared experts, router, embeddings, torre de visión y capa MTP) se mantienen byte a byte como en FP4-Local.

La relevancia es doble: por un lado muestra hasta dónde se puede comprimir un MoE de 331B aceptando ruido únicamente en los expertos enrutados; por otro, el checkpoint solo es legible por el motor nativo de TensorFold con sus kernels CSF0, lo que lo convierte en un artefacto muy específico de infraestructura. vLLM y otros cargadores NVFP4 no lo leen, y el propio TensorFold 1.1.5 lo rechaza por nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text), con capa MTP, KDA projections y MLA según la model card |
| Parametros totales | 331.033.893.726 |
| Parametros activos | 8 de 288 expertos enrutados por capa y token (dato de la model card; no se especifica el total de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits) en expertos enrutados con escalas FP8 E4M3 de bloque 32 en CSF0; resto de tensores en 8 bits o más según FP4-Local; repo marcado como 8-bit y modelopt |
| Idiomas soportados | ja, en |
| Licencia | NVIDIA Open Model Agreement (derivado); upstream zai-org/GLM-5.3-Flash bajo MIT |
| Formato de pesos | safetensors (132 ficheros, 172 GB) |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal: cada token pasa por atención, shared experts, las MLP densas de las primeras capas y el head, mientras que de los 288 expertos enrutados de cada capa solo se activan 8. La model card menciona además una capa MTP (multi-token prediction) para decodificación especulativa, proyecciones KDA, MLA y una torre de visión, todos heredados sin cambios de `nvidia/GLM-5.3-Flash-FP4-Local`. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación de esta variante es puramente de cuantización. Los expertos enrutados de las capas 3 a 44 se recuantizan desde los pesos BF16 de `zai-org/GLM-5.3-Flash` con códigos NVFP4 de 4 bits y escalas de bloque cada 32 entradas en lugar de cada 16: las escalas pasan de 19,03 GB a 9,52 GB, a costa de un error cuadrático 1,22 veces mayor sobre 18 matrices reales. El formato CSF0 elimina las excepciones de CSF y da a cada escala una posición fija (`scale = e4m3(base + offset)`), de modo que los kernels leen la escala donde está y el ahorro llega a la GPU (4,86 GB en ficheros y en memoria). El smoothing de XSFP4 se conserva plegado en los pesos (filas de salida de `up` multiplicadas, columnas de entrada de `down` divididas), recuperado comparando los pesos decodificados con los BF16 con un error de aproximadamente 0,2%; no se reentrenó para bloques de 32.

## Capacidades

- Generación de texto conversacional y multimodal image-text-to-text, con torre de visión heredada de FP4-Local.
- Razonamiento multi-paso y soporte de agentes, implícito en un MoE de 331B con 8 expertos activos por token.
- Capa MTP para decodificación especulativa incluida en el checkpoint.
- Idiomas declarados: japonés e inglés.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en clústeres DGX Spark (GB10): el checkpoint está pensado para servirse en dos o tres máquinas, con 6,58 GiB menos por máquina en TP=2 y 4,1-4,5 GiB en TP=3, lo que permite ajustar un MoE de 331B en nodos con memoria limitada.
- Investigación en cuantización extrema de MoE: sirve para estudiar el impacto de escalas de bloque 32 frente a 16 en expertos enrutados, con métricas de error cuadrático ya documentadas (factor 1,22).
- Evaluación de formatos CSF0: útil para validar kernels que leen escalas en posición fija sin expansión previa en memoria.
- Experimentación con decodificación especulativa: la capa MTP incluida permite medir aceleración de generación en el motor TensorFold.
- Prototipado multimodal japonés-inglés: la torre de visión y los idiomas declarados permiten tareas image-text-to-text en esos dos idiomas.
- Benchmarking de motores de inferencia: al ser rechazado explícitamente por TensorFold 1.1.5 y no ser legible por vLLM, funciona como caso de prueba para validar cargadores NVFP4 con bloques distintos de 16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta métricas internas de cuantización: error cuadrático 1,22 veces mayor con bloque 32 frente a 16 sobre 18 matrices reales, y 0,10% de bloques fuera de ventana en CSF0 con error cuadrático estable en 1,219.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 172 GB; en TP=2 el ahorro es de 6,58 GiB por máquina y en TP=3 de 4,1 a 4,5 GiB, siempre respecto a XSFP4.
- GPU recomendadas: sistemas GB10 (DGX Spark) según la model card; no se indican A100, H100 ni RTX 4090.
- Consumer GPU: no cabe en GPU de consumo; requiere reparto entre dos o tres sistemas.
- Despliegue: exclusivamente el motor nativo de TensorFold con kernels CSF0. vLLM y otros cargadores NVFP4 no lo leen; TensorFold 1.1.5 lo rechaza por nombre.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-Jammed-XSFP4 | 331B (MoE, 8/288 activos) | no disponible | NVFP4 bloque 32 + CSF0 | NVIDIA Open Model Agreement | Solo TensorFold con kernels CSF0 |
| Bizuayeu/GLM-5.3-Flash-XSFP4 | 331B (MoE) | no disponible | NVFP4 bloque 16 + CSF | NVIDIA Open Model Agreement | Cargadores NVFP4 estándar según la model card |
| nvidia/GLM-5.3-Flash-FP4-Local | 331B (MoE) | no disponible | NVFP4 + 8-bit denso | NVIDIA Open Model Agreement | Cargadores NVFP4 |
| zai-org/GLM-5.3-Flash | 331B (MoE) | no disponible | BF16 | MIT | HuggingFace estándar |

## Limitaciones y advertencias

- No es un release oficial de NVIDIA ni de Z.AI; es un derivado de un usuario independiente.
- Solo lo lee el motor nativo de TensorFold con kernels CSF0; vLLM, otros cargadores NVFP4 y TensorFold 1.1.5 fallan al cargarlo.
- La cuantización introduce ruido medible: error cuadrático 1,22 veces mayor en expertos enrutados con bloque 32.
- El smoothing se hereda de XSFP4, aprendido para bloques de 16 y no reentrenado para 32.
- Idiomas limitados a japonés e inglés.
- Licencia NVIDIA Open Model Agreement para el derivado, con obligaciones específicas distintas de la MIT del upstream.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.
- Longitud de contexto no especificada, lo que impide planificar cargas de trabajo de contexto largo.

## Enlaces

- HuggingFace: https://huggingface.co/Bizuayeu/GLM-5.3-Flash-Jammed-XSFP4
- Modelo base NVIDIA: https://huggingface.co/nvidia/GLM-5.3-Flash-FP4-Local
- Variante XSFP4: https://huggingface.co/Bizuayeu/GLM-5.3-Flash-XSFP4
- Upstream Z.AI: https://huggingface.co/zai-org/GLM-5.3-Flash
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Explicación Jammed XSFP4: https://claude.ai/artifact/Jmo5srGuQYCrPSUdYpbSRv
- Explicación NVFP4, OSFP4, XSFP4: https://claude.ai/artifact/AGG4jdSbUCtX98CExJWv16
