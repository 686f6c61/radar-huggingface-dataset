# ragarwal/chandra-ocr-2-nvfp4-mtp

## Resumen

Chandra OCR 2 NVFP4 + MTP es una versión cuantizada y optimizada para inferencia del modelo de OCR de documentos `datalab-to/chandra-ocr-2`, publicada por el usuario ragarwal. Su objetivo no es mejorar la calidad del reconocimiento, sino reducir el coste de servicio: pasa de 10,6 GB en BF16 a 6,0 GB mediante cuantización NVFP4 (W4A4) en las capas MLP, FP8 en las proyecciones de atención y BF16 en el resto, y añade una cabeza de decodificación especulativa MTP (multi-token prediction) afinada sobre páginas de documentos reales.

El modelo base es de arquitectura Qwen3.5 (según los tags del repositorio), con 5.295.564.288 parámetros totales, y está pensado para servirse con vLLM 0.33.0 o superior sobre GPUs Blackwell (B200), donde las unidades de tensor FP4 permiten explotar la cuantización. Sobre GPUs anteriores, como A100, vLLM recurre a kernels weight-only, una ruta que el autor declara no probada.

La relevancia práctica está en el rendimiento medido: con 2×B200 y 640 peticiones concurrentes, alcanza 38.891 tokens de salida por segundo frente a 24.742 del BF16 original (1,57×), manteniendo prácticamente idéntica la calidad en los benchmarks públicos (88,5 frente a 88,6 en omni_parse_bench; 83,9 frente a 84,3 en olmOCR-Bench). Es, por tanto, una pieza de infraestructura para pipelines de digitalización de documentos a gran escala, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con cabeza MTP de decodificación especulativa; codificador de visión en BF16 |
| Parametros totales | 5.295.564.288 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 24.576 tokens en la configuración de servidor recomendada (`--max-model-len 24576`) |
| Tipos de cuantizacion | NVFP4 W4A4 en capas MLP, FP8 en proyecciones de atención, BF16 en codificador de visión, embeddings, `lm_head` y cabeza MTP; KV cache sin cuantizar |
| Idiomas soportados | no disponible (el set de entrenamiento incluye tesis doctorales en varios idiomas, sin enumeración) |
| Licencia | OpenRAIL-M modificada (heredada de `datalab-to/chandra-ocr-2`, con restricciones de uso) |
| Formato de pesos | safetensors (repo de 6,1 GB; pesos 6,0 GB) |

## Arquitectura y entrenamiento

El modelo parte de Chandra OCR 2, un transformer multimodal con codificador de visión que procesa páginas renderizadas y genera HTML/Markdown estructurado. Sobre esa base se aplicó cuantización post-entrenamiento con NVIDIA Model-Optimizer: NVFP4 para pesos y activaciones en las capas MLP, FP8 en las proyecciones de atención y BF16 en el codificador de visión, embeddings, `lm_head` y cabeza MTP. Las escalas se obtuvieron por calibración MSE sobre 128 páginas.

Tras la cuantización se aplicó destilación consciente de cuantización: 1.500 actualizaciones con AdamW a lr 1e-6 sobre 12.000 páginas, minimizando la divergencia KL frente a las distribuciones de tokens del modelo BF16 (profesor forzado sobre sus propias salidas, sin ground truth). Solo se entrenaron los pesos del modelo de texto. En páginas de validación, la KL por token cayó un 41 % y la coincidencia top-1 con BF16 subió del 99,22 % al 99,33 %.

La cabeza MTP de una capa, ya presente en Chandra, se reafinó con la librería `speculators` sobre unas 23.600 páginas (3 épocas, AdamW, lr 3e-5, 3 pasos especulativos) y se integró en el checkpoint. La aceptación en las dos primeras posiciones de borrador pasó del 93 % y 77 % al 96 % y 87 %. Todo el entrenamiento usó un conjunto privado de páginas (tesis doctorales en varios idiomas) renderizadas a 150 dpi, sin páginas de los benchmarks.

## Capacidades

- Reconocimiento óptico de caracteres sobre páginas de documento completas, con salida en Markdown y HTML crudo por página.
- Análisis de maquetación (layout) guiado por el prompt de layout propio de Chandra.
- Manejo de documentos densos en texto, incluidos trabajos académicos y tesis.
- Procesamiento multimodal imagen a texto con una imagen por petición (`--limit-mm-per-prompt '{"image": 1}'`).
- Decodificación especulativa integrada mediante cabeza MTP, con 3 tokens de borrador por paso.
- Regla de reintento incorporada en el cliente de referencia: respuestas repetitivas o truncadas se reintentan hasta 6 veces con temperatura 0,2-0,8 y `top_p` 0,95.
- Detección opcional de bucles de repetición de vLLM (`--loop-stop`), que ahorra aproximadamente un 11 % de tokens generados.
- Tool calling, agentes, audio y modo de razonamiento explícito: no disponibles en la información proporcionada.

## Casos de uso

- Digitalización masiva de tesis y documentación académica: el modelo está entrenado sobre tesis doctorales y produce Markdown y HTML por página, lo que permite indexar corpus completos para buscadores internos o repositorios institucionales.
- Servicio OCR de alta concurrencia: con 640 peticiones concurrentes y 38.891 tokens/s en 2×B200, es adecuado para plataformas que procesan lotes de PDF de forma continua y necesitan throughput sostenido.
- Extracción de estructura para RAG: la salida HTML permite recuperar tablas, encabezados y párrafos con jerarquía, útil para trocear documentos antes de indexarlos en un sistema de recuperación.
- Facturación y digitalización de archivos administrativos: el pipeline del cliente renderiza a 150 dpi con un mínimo de 1024 px en el lado corto, suficiente para documentos escaneados estándar y con reintento automático ante salidas truncadas.
- Migración de repositorios documentales con control de coste: al reducir el peso de 10,6 GB a 6,0 GB y aumentar el throughput 1,57×, permite servir el mismo volumen con menos GPUs o menor tiempo de cola.
- Evaluación y benchmarking de pipelines OCR: el repositorio incluye `benchmark.py` y `ocr.py`, lo que facilita reproducir omni_parse_bench y olmOCR-Bench sobre datos propios y comparar variantes cuantizadas.
- Procesamiento por lotes en GPU Blackwell: el uso de FP4 requiere B200 o GPUs con tensor cores FP4, encaja en clústeres de inferencia ya provisionados con esa generación.

## Benchmarks y rendimiento

Datos del autor, con 2×NVIDIA B200, vLLM 0.33.0 y la configuración de servidor indicada. BF16 es el modelo original sin MTP, media (rango) de 3 ejecuciones.

| Metrica | BF16 | Este modelo |
|---|---:|---:|
| Throughput de salida, tokens/s (sostenido, 640 peticiones concurrentes) | 24.742 | 38.891 (1,57×) |
| omni_parse_bench | 88,6 (88,5-88,7) | 88,5 |
| olmOCR-Bench | 84,3 | 83,9 |
| Test set privado (tasa de aprobación tolerante) | 91,4 (91,3-91,6) | 91,3 |

El autor advierte de variaciones pequeñas entre ejecuciones (0,2 puntos en omni_parse_bench para BF16 en 3 ejecuciones), atribuidas al agrupamiento de peticiones incluso con decodificación greedy. No se han publicado resultados de MMLU, HumanEval ni GSM8K, que no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 6,0 GB; el KV cache no está cuantizado y el contexto configurado es de 24.576 tokens, por lo que el consumo real depende de `--max-num-seqs` (256 en la configuración de referencia) y de `--gpu-memory-utilization 0.85`.
- GPU recomendadas: NVIDIA B200 (probado con 2 unidades en paralelo de datos); se requiere driver 580 o superior por CUDA 13.
- GPUs consumer: no hay datos de funcionamiento en RTX 4090 u otras consumer; en A100 y anteriores vLLM cae a kernels weight-only y el autor indica que esa ruta no está probada.
- Despliegue: imagen `docker.io/vllm/vllm-openai:v0.33.0`; configuración con `--data-parallel-size` igual al número de GPUs, `--api-server-count 4`, `--renderer-num-workers 8` y `--performance-mode throughput`.
- Decodificación especulativa: `--speculative-config '{"method": "mtp", "num_speculative_tokens": 3}'`.
- Preprocesado de imagen: `--mm-processor-kwargs '{"min_pixels": 3136, "max_pixels": 6291456}'`.
- Throughput medido: 38.891 tokens/s de salida con 640 peticiones concurrentes en 2×B200.
- Latencia: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad OCR | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| ragarwal/chandra-ocr-2-nvfp4-mtp | 5,30 B | 24.576 | 88,5 omni_parse_bench; 83,9 olmOCR-Bench | OpenRAIL-M modificada | safetensors, vLLM, FP4 |
| datalab-to/chandra-ocr-2 (BF16) | 5,30 B | no disponible | 88,6 omni_parse_bench; 84,3 olmOCR-Bench | OpenRAIL-M modificada | safetensors, 10,6 GB |
| prithivMLmods/chandra-ocr-2-NVFP4-GGUF | no disponible | no disponible | no disponible | no disponible | GGUF (cuantización NVFP4) |

La comparación directa con el modelo base muestra una pérdida de calidad marginal (0,1 puntos en omni_parse_bench, 0,4 en olmOCR-Bench) a cambio de un 43 % menos de peso y un 57 % más de throughput. La variante GGUF de prithivMLmods ofrece un empaquetado alternativo orientado a llama.cpp, pero no se han publicado sus métricas de calidad ni su licencia en la información disponible.

## Limitaciones y advertencias

- La licencia es OpenRAIL-M modificada, heredada del modelo base, e incluye restricciones de uso; es obligatorio revisar `LICENSE` antes de un despliegue comercial.
- La cuantización NVFP4 solo rinde en GPUs Blackwell; en A100 y anteriores la ruta weight-only no está probada y el rendimiento puede degradarse.
- El modelo está especializado en OCR de documentos: no es adecuado para generación de texto general, código, matemáticas o razonamiento conversacional.
- El conjunto de entrenamiento es privado y no se enumeran los idiomas cubiertos, por lo que el soporte multilingüe no está garantizado ni documentado.
- Riesgo de bucles de repetición en la generación: el cliente de referencia aplica reintentos y existe la opción `--loop-stop`, que reduce un 11 % de tokens pero no se usó en las métricas publicadas.
- Los resultados dependen del agrupamiento de peticiones; se observan variaciones de hasta 0,2 puntos entre ejecuciones con decodificación greedy.
- No se han publicado evaluaciones de sesgo, alucinación o robustez frente a documentos degradados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ragarwal/chandra-ocr-2-nvfp4-mtp
- Modelo base: https://huggingface.co/datalab-to/chandra-ocr-2
- NVIDIA Model-Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Librería speculators (vLLM): https://github.com/vllm-project/speculators
- Dataset omni_parse_bench: https://huggingface.co/datasets/datalab-to/omni_parse_bench
- Dataset olmOCR-Bench: https://huggingface.co/datasets/allenai/olmOCR-bench
- Variante GGUF de terceros: https://huggingface.co/prithivMLmods/chandra-ocr-2-NVFP4-GGUF
- Estadísticas de la variante GGUF: https://openmodelstats.com/models/prithivmlmods/chandra-ocr-2-nvfp4-gguf
