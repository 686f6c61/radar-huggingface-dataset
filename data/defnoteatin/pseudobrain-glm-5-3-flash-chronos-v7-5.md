# defnoteatin/PseudoBrain-GLM-5.3-Flash-Chronos-v7.5

## Resumen

PseudoBrain-GLM-5.3-Flash-Chronos-v7.5 es una compresión y reempaquetado del modelo base `zai-org/GLM-5.3-Flash`, desarrollada por Ian Kurt Galeon (usuario `defnoteatin` en HuggingFace). El objetivo declarado es hacer viable la inferencia de un MoE de gran tamaño (305,78 GB en su forma original) en una única estación de trabajo con acelerador de 128 GB, concretamente la NVIDIA DGX Spark (GB10 Grace Blackwell). Para ello aplica una descomposición en tres capas sobre la dimensión de expertos: una banca de superposición holográfica 8:1 en NVFP4, un "sanador" SVD acoplado de rango 64 en FP8 y un retículo de cola gaussiana isotrópica de 1-2 bits por peso.

El modelo conserva la arquitectura `Glm5NextForConditionalGeneration` del base: 46 capas (3 densas y 42 MoE con 288 expertos enrutados cada una), más una capa de borrador especulativo `Glm5NextMTP`, con un vocabulario de 154.880 tokens. La ventana de contexto anunciada es de 1 millón de tokens, gestionada mediante un motor de memoria constante que combina estado recurrente comprimido, recuperación exacta por bloques y ventana deslizante en GPU.

La relevancia actual es doble: por un lado, propone una vía para servir modelos MoE de escala frontera en hardware de escritorio; por otro, lo hace con licencia Apache 2.0 y pesos en safetensors compatibles con vLLM. Ahora bien, el repositorio tiene 71 descargas y 0 likes en el momento de la consulta, y las cifras de rendimiento y calidad proceden exclusivamente del autor, sin verificación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`Glm5NextForConditionalGeneration`): 46 capas (3 densas, 42 MoE, 1 capa MTP), 288 expertos enrutados por capa, vocabulario de 154.880 |
| Parametros totales | no disponible (el repo ocupa 92,6 GB tras compresión; el checkpoint original del base ocupa 305,78 GB en 66 shards Block-FP8 de 128×128) |
| Parametros activos | no disponible (el autor cita 336 expertos activos por token, lo que implica 8 expertos enrutados por capa más los compartidos) |
| Longitud de contexto | 1.000.000 tokens (anunciado) |
| Tipos de cuantizacion | NVFP4 (banca holográfica y expertos calientes), FP8 (sanador SVD de rango 64), 1-2 bits por peso (cola gaussiana residual), Block-FP8 (checkpoint original) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería vLLM) |

## Arquitectura y entrenamiento

El modelo no se ha reentrenado: es una transformación de pesos del base `zai-org/GLM-5.3-Flash`. La innovación está en el esquema de compresión, bautizado Chronos, que replica sobre la dimensión de parámetros la misma descomposición que el motor PseudoBrain aplica sobre la dimensión de secuencia. En el primer nivel, cada grupo de 8 expertos enrutados (36 grupos por capa, 288 expertos totales) se fusiona en un único tensor NVFP4 mediante transformadas de Walsh-Hadamard rápidas por bloques 2D y claves de fase Rademacher, logrando una compresión 8:1. En el segundo nivel, un sanador SVD acoplado de rango 64 en FP8 captura las 64 direcciones singulares principales de la interferencia cruzada y el error de cuantización, compartiendo las bases singulares derechas de entrada entre `gate_proj` y `up_proj` para evitar deriva de fase en el SwiGLU. En el tercer nivel, el residual gaussiano isotrópico se codifica con un retículo Lloyd-Max de 1-2 bits por peso, accesible por `mmap` sin RAM activa mediante `POSIX_FADV_DONTNEED`.

El autor declara que la decodificación especulativa se realiza con 3 pasos de la capa `Glm5NextMTP` nativa y que los expertos calientes se sirven mediante proyección asociativa en espacio vectorial más un búfer circular EMA, evitando la materialización de matrices 2D. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF o DPO, porque el modelo hereda íntegramente los del base sin modificar.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredados del modelo base GLM-5.3-Flash.
- Procesamiento de contexto largo de hasta 1 millón de tokens con memoria constante, según el diseño del motor PseudoBrain.
- Decodificación especulativa de 3 pasos mediante la capa `Glm5NextMTP`, orientada a reducir latencia en `batch_size = 1`.
- Inferencia en precisión mixta NVFP4/FP8 aprovechando los Tensor Cores de Blackwell.
- Compatibilidad con vLLM como motor de servicio.
- Soporte de tool calling, function calling y comportamiento agéntico: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Despliegue on-premise de contexto masivo: el modelo permite mantener conversaciones o análisis sobre documentos de hasta 1 millón de tokens en una única DGX Spark, sin infraestructura de clúster, gracias al estado recurrente comprimido y a la ventana deslizante de 16.384 tokens.
- Análisis de repositorios de código completos: con contexto de 1M tokens se pueden ingerir monorepos enteros y formular preguntas transversales sobre dependencias y arquitectura, aunque la calidad real de recuperación a esa distancia no está verificada.
- Auditoría documental y legal: procesamiento de expedientes extensos con referencias cruzadas, apoyándose en la recuperación exacta por bloques del archivo Quest para citar fragmentos concretos.
- Servicio de inferencia de bajo volumen en hardware de escritorio: con 23,7-49,7 tok/s declarados en una GB10, encaja en entornos de desarrollo, prototipado o laboratorio donde no se justifica alquilar GPUs de datacenter.
- Investigación sobre compresión de MoE: el esquema Chronos sirve como banco de pruebas para estudiar superposición holográfica, sanadores SVD y cuantización residual en modelos de 288 expertos por capa.
- Evaluación comparativa de motores: útil para contrastar vLLM con NVFP4 frente a alternativas como llama.cpp o TensorRT-LLM en el mismo checkpoint comprimido.
- Experimentación con decodificación especulativa: la capa MTP integrada permite medir el impacto de 3 pasos de borrador sobre el throughput en régimen de lote 1.

## Benchmarks y rendimiento

| Metrica | Valor declarado por el autor |
|---|---|
| Throughput en DGX Spark (GB10), batch 1 | 23,69-49,74 tok/s |
| Throughput del checkpoint original sin comprimir en GB10 | 0,18-1,7 tok/s |
| Similitud coseno de logits, 46 capas encadenadas | 99,57%-99,83% |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras de throughput y similitud de logits proceden de la model card del autor y no cuentan con verificación independiente.

## Requisitos de hardware

- VRAM estimada: el repositorio comprimido ocupa 92,6 GB, por lo que encaja en aceleradores de 128 GB; el checkpoint original de 305,78 GB no cabe en una sola GPU de 80 GB.
- GPU de referencia del autor: NVIDIA DGX Spark (GB10 Grace Blackwell Superchip, 128 GB), única configuración con cifras publicadas.
- GPU de datacenter: A100 y H100 aparecen mencionadas en los materiales de prueba del autor, pero sin métricas concretas en la información disponible.
- GPU de consumo: no se documenta funcionamiento en RTX 4090 u otras tarjetas consumer; 92,6 GB excede la VRAM de cualquier GPU de consumo actual, por lo que requeriría descarga parcial a RAM del sistema.
- Opciones de despliegue: vLLM es la librería declarada; llama.cpp, Ollama y TGI no están confirmados en la información disponible.
- Latencia y throughput: 23,69-49,74 tok/s en batch 1 sobre GB10 según el autor; sin datos para lotes mayores ni para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PseudoBrain-GLM-5.3-Flash-Chronos-v7.5 | no disponible (92,6 GB comprimido) | 1M | Apache 2.0 | safetensors (vLLM) | Compresión NVFP4/FP8 de un MoE de 46 capas; métricas solo del autor |
| zai-org/GLM-5.3-Flash (base) | no disponible (305,78 GB en Block-FP8) | no disponible | no disponible | safetensors | Modelo original sin comprimir; no cabe en 128 GB |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Las cifras de rendimiento (23,69-49,74 tok/s) y de fidelidad (99,57%-99,83% de similitud coseno) son declaraciones del autor sin replicación independiente; el repositorio registra 71 descargas y 0 likes.
- La compresión con pérdida (superposición 8:1, residual de 1-2 bits) puede degradar tareas sensibles a la precisión numérica, como matemáticas o código, más allá de lo que sugiere la similitud de logits.
- No hay datos publicados de benchmarks estándar, por lo que la calidad real frente al base es desconocida.
- Los idiomas soportados no están documentados; el comportamiento multilingüe depende del base y no está verificado tras la compresión.
- El contexto de 1M tokens es una cifra anunciada; no se aportan evaluaciones de recuperación a larga distancia (por ejemplo, needle-in-a-haystack) que la respalden.
- El soporte de tool calling y uso agéntico no está confirmado en la información disponible.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia del modelo base `zai-org/GLM-5.3-Flash` antes de un uso comercial, ya que las obligaciones del base pueden propagarse.
- El despliegue está atado a vLLM y a las rutas NVFP4 de Blackwell; en GPUs sin soporte NVFP4 el rendimiento y posiblemente la corrección quedan sin documentar.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; se heredan los del modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/defnoteatin/PseudoBrain-GLM-5.3-Flash-Chronos-v7.5
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio Chronos: https://github.com/defnotean/Chronos
- Paper de arquitectura Chronos (PDF): https://github.com/defnotean/Chronos/blob/main/docs/CHRONOS_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura Chronos (Markdown): https://github.com/defnotean/Chronos/blob/main/docs/CHRONOS_ARCHITECTURE_PAPER.md
- Motor PseudoBrain: https://github.com/defnotean/pseudobrain
- Paper de arquitectura PseudoBrain (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Telemetría de hardware y recibos de benchmark: https://github.com/defnotean/Chronos/tree/main/assets
- Perfil del autor en GitHub: https://github.com/defnotean
- Perfil del autor en HuggingFace: https://huggingface.co/defnoteatin
