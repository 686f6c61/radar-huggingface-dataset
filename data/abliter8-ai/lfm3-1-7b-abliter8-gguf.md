# abliter8-ai/lfm3-1.7B-abliter8-gguf

## Resumen

LFM3-1.7B-Abliter8 es una versión "abliterated" (con el comportamiento de rechazo reducido) del modelo LFM3-1.7B de Liquid AI, publicada por abliter8-ai en formato GGUF y MLX. El modelo base es un modelo de texto compacto orientado a agentes locales, uso de herramientas, salida estructurada y aplicaciones con recuperación de información (RAG), con una ventana de contexto de 256K tokens y 1,73 mil millones de parámetros.

El proceso de abliteration aplica una modificación algebraica (proyección de rango uno con fuerza 2) sobre 32 matrices de escritura residual en las capas 8 a 23, eliminando la dirección latente asociada a los rechazos sin necesidad de reentrenamiento. Según la evaluación del autor, el modelo editado pasa de 96/100 rechazos estrictos en el modelo original a 0/100, manteniendo una perplejidad muy cercana a la referencia BF16.

Es relevante porque combina un tamaño muy pequeño (ejecutable en portátiles y GPUs de consumo), un contexto extremadamente largo para su clase y un comportamiento menos restrictivo, lo que lo hace útil para asistentes locales con herramientas y para aplicaciones que sufren falsos rechazos. Hay que tener en cuenta que se trata de una edición experimental: el autor no ha revalidado los benchmarks de Liquid ni la ventana de contexto completa sobre estos pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas combinando 13 convoluciones cortas con puertas (gated short convolutions), 5 capas de sliding-window attention y 6 capas de global attention |
| Parametros totales | 1.728.801.600 (≈1,73 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens (advertida por Liquid; no revalidada sobre los pesos editados) |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K, Q4_K_M, Q4_0 y variante experimental NVFP4/Q8_0 (1,75 GB); MLX: 8-bit, 6-bit, 4-bit |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia "other", vinculada a la licencia de LiquidAI/LFM3-1.7B) |
| Formato de pesos | GGUF (con imatrix) y MLX; modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo base, LFM3-1.7B de Liquid AI, es un híbrido eficiente para inferencia local: de sus 24 capas, 13 emplean convoluciones cortas con mecanismos de puerta, 5 usan atención con ventana deslizante y 6 usan atención global. Esta combinación reduce el coste de atención en contextos largos y está diseñada específicamente para ejecución en dispositivos locales. Los detalles sobre el corpus de entrenamiento, el número de tokens y el uso de RLHF/DPO por parte de Liquid no están disponibles en la información proporcionada.

La contribución de abliter8-ai no es un reentrenamiento sino una edición directa de pesos: se ajustó la dirección de rechazo sobre las activaciones del propio modelo y se aplicó la operación `W' = W - 2 r (r^T W)` a 32 matrices de escritura residual (`self_attn.o_proj`, `feed_forward.w2` y `conv.out_proj`) en las capas 8–23. Una auditoría BF16 confirma que todos los demás tensores permanecen intactos. No se empleó fine-tuning ni injertos de pesos. El repositorio pesa 12,1 GB porque incluye múltiples cuantizaciones.

## Capacidades

- Generacion de texto conversacional, orientada a agentes locales y asistentes multi-turno.
- Tool calling / function calling: el modelo base destaca en las evaluaciones de agentes y uso de herramientas de Liquid (BFCL V4: 71,39 frente a 55,12 de Qwen3.5-4B y 62,83 de Qwen3.5-9B, según la tabla de Liquid).
- Salida estructurada y aplicaciones asistidas por recuperación (RAG).
- Comportamiento de rechazo reducido: 0/100 rechazos estrictos y 0–1/100 falsos rechazos en XSTest según la cuantización, frente a 96/100 del modelo original.
- Contexto largo (256K tokens anunciados) para documentos extensos.
- No añade conocimiento, capacidad de razonamiento ni modalidades nuevas respecto al modelo base; solo modifica la tendencia a rechazar.

## Casos de uso

- Asistente local con herramientas: su tamaño de 1,73 B permite ejecutarlo en un portátil mientras gestiona llamadas a funciones y flujos de agente, área donde supera a modelos mayores en BFCL V4 según Liquid.
- RAG sobre documentos sensibles: la reducción de falsos rechazos (XSTest: 0–1/100) evita interrupciones al procesar textos con terminología médica, legal o adulta factual.
- Generacion de salidas estructuradas: útil para extraer JSON o rellenar esquemas en pipelines de datos donde los rechazos del modelo original romperían la automatización.
- Escritura creativa de ficcion para adultos: la abliteration está pensada para permitir material adulto, terminología sensible y escenarios ficticios que el modelo de serie podría declinar.
- Atencion al cliente automatizada: con 256K tokens de contexto puede mantener conversaciones multi-turno e ingerir documentación extensa, aunque su tamaño limita la profundidad del razonamiento.
- Agentes multi-paso en dispositivos edge: la arquitectura híbrida con convoluciones y sliding-window attention está orientada a inferencia eficiente en local, con versiones GGUF desde ~1,75 GB (NVFP4/Q8_0).
- Prototipado de agentes sin filtros corporativos: para desarrolladores que evalúan comportamientos de rechazo y desean comparar respuestas con y sin abliteration.

## Benchmarks y rendimiento

Benchmarks del modelo base según la tabla de Liquid (evaluación de Liquid sobre el modelo sin editar, no revalidada por abliter8-ai sobre estos pesos):

| Benchmark | LFM3-1.7B (stock) | Qwen3.5-4B | Qwen3.5-9B |
|---|---:|---:|---:|
| BFCL V4 (agentes/tool use) | 71,39 | 55,12 | 62,83 |
| GPQA Diamond | 63,37 | no disponible | 80,40 |

Evaluación propia de abliter8-ai sobre los GGUF (detector estricto de rechazos, 100 prompts; XSTest, 100 prompts seguros; referencia stock F16: perplejidad 20,935):

| GGUF | Rechazos estrictos /100 | Falsos rechazos XSTest /100 | KLD medio | Perplejidad | Acuerdo top-1 |
|---|---:|---:|---:|---:|---:|
| Q8_0 | 0 | 1 | 0,03323 | 20,988 | 90,86% |
| Q6_K | 0 | 0 | 0,04145 | 20,876 | 89,84% |
| Q4_K_M | 0 | 0 | 0,11756 | 22,214 | 83,69% |
| Q4_0 | 0 | 1 | 0,19994 | 24,121 | 78,39% |

Evaluación MLX (deriva de cuantización respecto al máster BF16 editado; perplejidad de referencia BF16: 17,411; contexto corto):

| MLX | Rechazos estrictos /100 | Falsos rechazos XSTest /100 | KLD medio | Perplejidad | Acuerdo top-1 |
|---|---:|---:|---:|---:|---:|
| 8-bit | 0 | 0 | 0,00237 | 17,496 | 97,07% |
| 6-bit | 0 | 0 | 0,01176 | 17,454 | 94,04% |
| 4-bit | 0 | 0 | 0,22634 | 22,309 | 74,66% |

## Requisitos de hardware

- VRAM estimada: la variante experimental NVFP4/Q8_0 ocupa 1,75 GB; los cuants Q8_0 de un modelo de 1,73 B rondan ~2 GB y los Q4_K_M ~1–1,2 GB (estimaciones por tamaño de cuant, no confirmadas por el autor). El repo completo pesa 12,1 GB al incluir todas las variantes.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU moderna de consumo (RTX 3060, RTX 4060 o superior) lo ejecuta con holgura. La variante NVFP4 está orientada a GPUs NVIDIA con soporte CUDA.
- Consumer GPUs: cabe con facilidad en prácticamente cualquier GPU de consumo e incluso solo en CPU/RAM, dada su clase de tamaño.
- Despliegue: GGUF compatible con llama.cpp y Ollama; MLX para Apple Silicon; el autor publica instrucciones de serving CUDA para la variante NVIDIA (repositorio lfm3-abliter8-serving). No se menciona soporte explícito de vLLM o TGI.
- Latencia y throughput: no disponibles; por tamaño y arquitectura orientada a inferencia local se espera respuesta interactiva en hardware de consumo, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BFCL V4 | GPQA Diamond | Licencia |
|---|---|---|---:|---:|---|
| LFM3-1.7B-Abliter8 (base Liquid) | 1,73 B | 256K (anunciada) | 71,39 | 63,37 | lfm1.0 (other) |
| Qwen3.5-4B | 4 B | no disponible | 55,12 | no disponible | no disponible |
| Qwen3.5-9B | 9 B | no disponible | 62,83 | 80,40 | no disponible |

La comparativa procede de la tabla de Liquid y refleja el modelo base sin editar. LFM3-1.7B supera a modelos de 4 B y 9 B en uso de herramientas pese a su tamaño, pero queda claramente por detrás en razonamiento científico difícil (GPQA Diamond). Ninguna de las alternativas citadas está abliterated en esta tabla.

## Limitaciones y advertencias

- Modelo abliterated: elimina la tendencia aprendida a rechazar; no añade conocimiento ni mejora el razonamiento. Mide disposición a responder, no corrección ni seguridad de las respuestas.
- Riesgo de alucionacion: no disponible un dato específico; al tratarse de un modelo de 1,73 B, la alucinación factual es esperable, especialmente en conocimiento de larga cola.
- Los benchmarks de Liquid (BFCL V4, GPQA Diamond) corresponden al modelo original; abliter8-ai no los ha revalidado sobre estos pesos editados o cuantizados.
- La ventana de contexto de 256K no ha sido revalidada a longitud completa sobre esta versión.
- Cuantizaciones agresivas degradan la fidelidad: Q4_0 alcanza una perplejidad de 24,121 y solo un 78,39% de acuerdo top-1 frente al stock F16.
- Licencia lfm1.0 ("other"): las condiciones de uso comercial vienen dadas por la licencia de LiquidAI/LFM3-1.7B; deben revisarse antes de cualquier despliegue en producción.
- Contenido sin censura: el uso para generar material dañino, ilegal o peligroso sigue siendo responsabilidad del usuario; los tests de rechazo son conteos de detector, no una evaluación semántica de cumplimiento nocivo.
- Sesgos conocidos: no disponibles; hereda los del modelo base de Liquid, no documentados en la información proporcionada.

## Enlaces

- Modelo GGUF: https://huggingface.co/abliter8-ai/lfm3-1.7B-abliter8-gguf
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Pesos MLX: https://huggingface.co/abliter8-ai/lfm3-1.7b-abliter8-mlx
- Coleccion LFM3-Abliter8: https://huggingface.co/collections/abliter8-ai/lfm3-abliter8
- Variante experimental NVFP4/Q8_0: https://huggingface.co/abliter8-ai/lfm3-1.7B-abliter8-gguf/blob/main/LFM3-1.7B-Abliter8-NVFP4-GATE0-11-Q8_0.gguf
- Instrucciones de serving NVIDIA/CUDA: https://github.com/abliter8-ai/lfm3-abliter8-serving/blob/main/docs/nvidia.md
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Model card original de Liquid (fuente de specs y benchmarks): https://huggingface.co/LiquidAI/LFM3-1.7B/blob/40ebe0aa6662c9d40389c2f5d565b6a2c6aebacd/README.md
- Web del editor: https://abliter8.ai
