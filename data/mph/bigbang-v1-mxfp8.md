# mph/BigBang-v1-MXFP8

## Resumen

BigBang-v1-MXFP8 es una versión cuantizada en MXFP8 de BigBang-v1, un ajuste fino (finetune) del modelo Qwen3.6-35B-A3B desarrollado por endless-frontier. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con aproximadamente 36.000 millones de parámetros totales y unos 3.000 millones activos por token, diseñado para tareas multimodales de imagen-texto a texto (image-text-to-text). La cuantización la ha producido el usuario mph mediante NVIDIA TensorRT Model Optimizer (ModelOpt) v0.47.0.

El interés de esta ficha radica en que combina tres elementos poco habituales en un mismo checkpoint: una arquitectura híbrida que alterna capas Gated DeltaNet con capas de atención completa, un contexto de 262.144 tokens y una cuantización MXFP8 dinámica que reduce el peso de los archivos a unos 37 GiB. Esto permite alojar los pesos en una única GPU de 48 GB, algo que en BF16 sería inviable.

La relevancia práctica está en el despliegue: el autor documenta configuraciones listas para vLLM y SGLang, incluyendo decodificación especulativa mediante la cabeza MTP del propio modelo. No obstante, el cómputo nativo MXFP8 exige GPUs NVIDIA Blackwell (SM100/SM120), lo que limita su uso a hardware reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido: 40 capas con patrón repetido de 3 capas Gated DeltaNet y 1 capa de atención completa; 256 expertos enrutados (top-8) más un experto compartido de 512 de anchura |
| Parametros totales | 35.951.822.704 (aprox. 36B) |
| Parametros activos | Aprox. 3B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | MXFP8 dinámico (FP8 E4M3 con escala compartida E8M0 por bloque de 32 elementos, `MXFP8_DEFAULT_CFG`, sin calibración); módulos seleccionados permanecen en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, clase `Qwen3_5MoeForConditionalGeneration`) |

## Arquitectura y entrenamiento

El modelo base es un finetune de Qwen3.6-35B-A3B, identificado en la model card como `Qwen3_5MoeForConditionalGeneration`. La arquitectura consta de 40 capas que siguen un patrón repetido de tres capas Gated DeltaNet seguidas de una capa de atención completa, lo que combina mecanismos de estado recurrente con atención clásica para gestionar contextos largos con menor coste computacional. La capa MoE emplea 256 expertos enrutados con activación top-8 y un experto compartido de 512 de anchura, lo que explica la diferencia entre los ~36B parámetros totales y los ~3B activos por token. El modelo incluye además una cabeza MTP (Multi-Token Prediction) utilizable como draft model para decodificación especulativa.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible: no se detalla el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. La model card se centra exclusivamente en el proceso de cuantización. Este se realizó con NVIDIA TensorRT Model Optimizer v0.47.0 aplicando MXFP8 dinámico, que almacena pesos y activaciones en FP8 (E4M3) con una escala compartida de potencia de dos (E8M0) por cada bloque de 32 elementos. Los expertos enrutados, que concentran la mayor parte de los parámetros, son los principales destinatarios de la cuantización. Permanecen en BF16 los embeddings del modelo de lenguaje y el `lm_head`, las convoluciones `conv1d` y las proyecciones `in_proj_a` e `in_proj_b` de Gated DeltaNet, los routers MoE (`mlp.gate`) y el `shared_expert_gate`, todos los módulos de visión (`model.visual*`), la cabeza MTP completa (incluidos sus expertos enrutados) y la caché KV. Los tensores empaquetados de expertos se dividen en lineales por experto durante la exportación.

## Capacidades

- Generación de texto y conversación multi-turno, con soporte de modo razonamiento (reasoning parser `qwen3` en vLLM y SGLang).
- Procesamiento multimodal imagen-texto a texto: el pipeline declarado es `image-text-to-text` y los módulos de visión se conservan en BF16.
- Tool calling y function calling, con parser dedicado `qwen3_coder` en los motores de inferencia documentados.
- Razonamiento multi-paso y uso en agentes, apoyado por el modo de razonamiento y el soporte de herramientas.
- Decodificación especulativa nativa mediante la cabeza MTP, con configuración documentada para vLLM (`method: mtp`, 2 tokens especulativos) y SGLang (algoritmo NEXTN).
- Manejo de contextos muy largos de hasta 262.144 tokens.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistencia sobre documentos extensos: con 262.144 tokens de contexto, el modelo puede ingerir informes completos, expedientes o bases de código y responder preguntas sobre ellos sin fragmentación, manteniendo coherencia entre secciones distantes.
- Análisis de documentos con imágenes: al conservar los módulos de visión en BF16, es adecuado para extraer información de capturas, diagramas o formularios escaneados combinados con texto largo en un mismo prompt.
- Agentes con herramientas en producción: el soporte de tool calling con parser `qwen3_coder` y el modo de razonamiento permiten construir flujos donde el modelo decide qué función invocar, interpreta el resultado y continúa el razonamiento en varios pasos.
- Generación y revisión de código en pipelines: integrable en flujos de CI/CD o asistentes de IDE mediante la API compatible con OpenAI que exponen vLLM y SGLang, con function calling para consultar repositorios o ejecutar tests.
- Despliegue en una sola GPU de 48 GB: los ~37 GiB de pesos permiten servir el modelo en una única GPU Blackwell de 48 GB, lo que facilita entornos de investigación con hardware limitado frente a la versión BF16.
- Servicio de alto rendimiento con decodificación especulativa: la cabeza MTP y las configuraciones de vLLM/SGLang con prefix caching y chunked prefill están pensadas para reducir latencia en cargas conversacionales concurrentes.
- Evaluación comparativa de cuantización: útil para investigadores que quieran medir la degradación de MXFP8 frente al modelo base BF16 en tareas multimodales y de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para pesos: aproximadamente 37 GiB en MXFP8, según indica el autor.
- Cómputo nativo MXFP8: requiere GPUs NVIDIA Blackwell (SM100/SM120). En arquitecturas anteriores no se dispone de cómputo nativo para este formato.
- GPU única: una GPU de 48 GB puede alojar los pesos, pero hay que añadir margen para la caché KV y las activaciones de visión.
- Multi-GPU: para contextos largos o alta concurrencia, el autor recomienda tensor parallelism sobre varias GPUs.
- Despliegue: vLLM (con `--quantization modelopt_mxfp8`, `--attention-backend FLASHINFER`, `--mm-encoder-tp-mode data` y decodificación especulativa MTP) y SGLang (con `--attention-backend flashinfer`, `--mm-enable-dp-encoder` y algoritmo especulativo NEXTN).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BigBang-v1-MXFP8 | ~36B / ~3B | 262.144 | MXFP8 dinámico | Apache 2.0 | Hugging Face (mph) |
| BigBang-v1 (base) | ~36B / ~3B | 262.144 | BF16 | no disponible | Hugging Face (endless-frontier) |
| Qwen3.6-35B-A3B (origen) | ~35B / ~3B | no disponible | BF16 y otras | no disponible | no disponible |

La comparación más directa es con el modelo base BigBang-v1 en BF16: misma arquitectura y contexto, pero mayor huella de memoria y sin las optimizaciones de cuantización. Frente al Qwen3.6-35B-A3B original, BigBang-v1 es un finetune del que no se detallan los cambios. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas.

## Limitaciones y advertencias

- La cuantización MXFP8 introduce una pérdida de precisión respecto al modelo base BF16; no se han publicado evaluaciones que cuantifiquen esa degradación.
- El cómputo nativo MXFP8 exige GPUs Blackwell (SM100/SM120); en otro hardware el rendimiento puede degradarse o requerir rutas de emulación.
- Los módulos de visión, la cabeza MTP, los routers y la caché KV permanecen en BF16, por lo que el ahorro de memoria no es uniforme y el consumo real supera el de los pesos cuantizados solos.
- Riesgo de alucinación inherente a los modelos generativos; no hay información sobre evaluación de fidelidad en la documentación disponible.
- Sesgos conocidos: no disponible.
- Idiomas soportados: no disponible, lo que impide confirmar cobertura multilingüe.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base y del Qwen3.6 subyacente antes de producción.
- El modelo tiene 24 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria extensa.
- No se documentan datos de entrenamiento del finetune, lo que dificulta evaluar su comportamiento en dominios específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mph/BigBang-v1-MXFP8
- Modelo base: https://huggingface.co/endless-frontier/BigBang-v1
- NVIDIA TensorRT Model Optimizer: https://github.com/NVIDIA/TensorRT-Model-Optimizer
