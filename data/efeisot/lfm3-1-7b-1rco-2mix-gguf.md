# efeisot/lfm3-1.7b-1rco-2mix-gguf

## Resumen

Este repositorio no es un modelo en sí, sino una colección de tres cuantizaciones GGUF del modelo base **LFM3-1.7B** de LiquidAI, publicadas por el usuario efeisot. El objetivo del proyecto es ofrecer versiones comprimidas del modelo que se ajusten a presupuestos de memoria muy ajustados: dos archivos "kmix" con mezclas estándar de K-quants (compatible con llama.cpp sin modificar) y un archivo experimental "rcmix" que emplea el formato RCO4 para situar el modelo completo por debajo de 1 GiB, algo que ninguna cuantización estándar consigue.

La relevancia de esta ficha radica en dos frentes. Por un lado, LFM3-1.7B es un modelo compacto de LiquidAI basado en arquitecturas neuronales heterogéneas (según la cita: "Compact Heterogeneous Neural Network Architectures"), útil para inferencia en dispositivos con recursos limitados. Por otro, la cuantización RCO se apoya en el artículo "Model Compression with Exact Budget Constraints via Riemannian Manifolds" (Helcig y Alistarh, arXiv:2605.00649), que permite cumplir restricciones exactas de tamaño mediante codebooks ortogonalizados optimizados por MSE. El modelo base tiene 1.728.801.600 parámetros y el repositorio completo pesa 3,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal heterogénea compacta (LFM3, base LiquidAI/LFM3-1.7B-Base); detalles no disponibles |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (las evaluaciones de calidad se hicieron a 512 tokens de contexto) |
| Tipos de cuantizacion | kmix-1100M (Q4_K/Q5_K mix, 5,38 bpw), kmix-1300M (Q4_K/Q5_K mix, 6,35 bpw), rcmix-1000M (RCO4 ×101 + Q5_K ×41 + embeddings Q6_K, ~4,89 bpw) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License (lfm1.0), heredada del modelo base |
| Formato de pesos | GGUF (incluye imatrix de 3,5 MiB para reproducir las cuantizaciones) |

## Arquitectura y entrenamiento

El modelo base, LFM3-1.7B de LiquidAI, pertenece a la familia LFM (Liquid Foundation Models), caracterizada por arquitecturas heterogéneas compactas. Los detalles concretos de la arquitectura, el número de tokens de entrenamiento o la composición del dataset no están disponibles en la información proporcionada; para eso debe consultarse la ficha del modelo base y el artículo citado.

Lo verdaderamente distintivo de este repositorio está en la compresión, no en el modelo base. La variante **kmix** usa un script de asignación (`alloc_mixed_kquants.py`) que distribuye tipos Q4_K/Q5_K/Q6_K tensor a tensor bajo presupuestos de tamaño, empleando una matriz de importancia (imatrix) calculada sobre Wikitext-2. La variante **rcmix** aplica el método RCO del artículo de Helcig y Alistarh: se construye una base de datos de Hessianos estilo GPTQ en CPU, los bloques se reconstruyen con codebooks ortogonalizados optimizados por MSE y un asignador con presupuesto elige RCO4 o Q5_K por tensor, con muros fijos (embeddings en Q6_K, attn_gate en Q8_0, shortconv en F32 sin cuantizar). La reconstrucción MSE por capa se verificó en datos de validación (MSE de prototipo 4 bits: 0,132 → 0,121).

## Capacidades

- Generacion de texto: pipeline de text-generation, etiquetado como conversacional; el modelo base es un modelo base (no instruido según la denominación "Base"), por lo que está pensado para completamiento de texto y uso con plantillas adecuadas.
- Generacion de codigo: los ejemplos de uso del autor emplean prompts de código (`def merge_sort(arr):`), lo que sugiere capacidad de completamiento de código, aunque no se publican benchmarks específicos de código.
- Tool calling / function calling: no disponible en la información proporcionada.
- Agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible (el idioma del modelo no está especificado en la ficha).
- Capacidades especiales: ninguna más allá de la compresión; no hay soporte declarado de visión, audio ni modo de pensamiento.

## Casos de uso

- Despliegue en dispositivos con menos de 1 GiB de memoria para pesos: la variante rcmix-1000M ocupa 0,985 GiB, un hueco que ninguna cuantización estándar alcanza; ideal para embebidos o SBC con memoria muy limitada, aceptando el requisito del parche de llama.cpp.
- Asistentes locales ligeros en portátiles sin GPU dedicada: los archivos kmix funcionan con llama.cpp estándar y caben holgadamente en la RAM de cualquier equipo moderno, permitiendo chat local privado.
- Prototipado rápido de pipelines de texto: con 1,1–1,3 GiB por modelo, se pueden cargar varias variantes simultáneamente para comparar calidad frente a tamaño en un mismo host.
- Completamiento de código en editores locales: el tamaño reducido y la baja latencia esperada en un modelo de 1,7 B lo hacen apto para autocompletado en IDE con llama.cpp u Ollama.
- Investigación en cuantización: el repositorio publica la imatrix, los logs de evaluación crudos, el barrido de presupuestos y el parche RCO4, lo que lo convierte en un banco de pruebas reproducible para estudios de compresión con restricciones exactas.
- Inferencia en GPU AMD (ROCm): el autor valida el camino RCO en CPU y HIP/ROCm (RX 9060 XT, gfx1200), por lo que es un caso práctico para estaciones de trabajo con GPUs AMD.
- Servicios de texto masivos de bajo coste: en un servidor con GPU modesta, `-ngl 99` descarga todas las capas a VRAM y un modelo de ~1 GiB permite muchas instancias concurrentes por acelerador.

## Benchmarks y rendimiento

El autor publica mediciones de calidad sobre Wikitext-2 test (contexto 512, 16 chunks, KL frente a logits f16):

| Modelo | GiB | bpw | PPL | KLD | top1 | Runtime |
|---|---|---|---|---|---|---|
| ad-IQ3_S (referencia) | — | — | — | 0,203 | 77,0% | stock |
| Q4_K_M estándar (baseline) | 1,024 | 5,09 | 23,803 | 0,119 | 83,2% | stock |
| kmix-1100M (balanced) | 1,083 | 5,38 | 23,736 | 0,090 | 84,8% | stock |
| kmix-1300M (quality) | 1,277 | 6,35 | 23,030 | 0,024 | 92,7% | stock |
| rcmix-1000M (sub-1GiB RCO) | 0,985 | 4,89 | 27,275 | 0,178 | 79,9% | parche necesario |

No se han publicado resultados de benchmarks estándar del modelo base (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los números anteriores son específicos del hardware del autor (RX 9060 XT / gfx1200, ROCm 7.x).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 0,985 GiB (rcmix-1000M) y 1,277 GiB (kmix-1300M) solo en pesos; añadir margen para KV cache y contexto.
- Cabe sobradamente en cualquier GPU consumer moderna (incluso tarjetas de 2 GB) y en la RAM de prácticamente cualquier CPU; no se necesitan A100 ni H100. El autor valida con una RX 9060 XT vía ROCm.
- Ejecución en CPU totalmente viable dado el tamaño; con `-ngl 99` todo el modelo cabe en acelerador.
- Despliegue: llama.cpp es el runtime de referencia. Los archivos kmix funcionan con cualquier llama.cpp reciente; rcmix-1000M exige compilar llama.cpp en el commit `1b4554e` aplicando el parche incluido (`llama.cpp-rco-types.patch`), ya que un build estándar rechaza el tipo de tensor 45 (RCO4). Compatibilidad con Ollama, vLLM o TGI: no disponible.
- Latencia y throughput: no disponibles; los benchmarks publicados son de calidad (PPL/KLD), no de velocidad, y son específicos del hardware del autor.
- El camino RCO está validado en CPU y HIP (ROCm); los builds CUDA no están probados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| efeisot/lfm3-1.7b-1rco-2mix-gguf (esta ficha) | 1,73 B (base) | no disponible | lfm1.0 | GGUF (kmix + RCO4) | Hasta 3 variantes, una bajo 1 GiB; requiere parche para RCO |
| LiquidAI/LFM3-1.7B-Base (modelo base) | 1,73 B | no disponible | lfm1.0 | safetensors | Pesos originales sin cuantizar; mayor calidad, mayor huella |
| Qwen2.5-1.5B (categoría similar) | 1,5 B | 32k (según ficha oficial) | Qwen Research / Apache-2.0 según variante | safetensors, GGUF comunitarios | Amplio ecosistema, pero sin variantes sub-1-GiB documentadas equivalentes |

La comparación con Qwen2.5-1.5B es orientativa (misma categoría de tamaño); los datos de rendimiento entre ambos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- rcmix-1000M exige un llama.cpp parcheado; un build estándar falla con "unknown tensor type 45". Los dos archivos kmix no tienen esta restricción.
- rcmix-1000M es una cuantización lossy a ~4,9 bpw: KLD 0,178 frente a 0,119 del Q4_K_M de tamaño similar. El propio autor recomienda los kmix cuando la precisión global o la compatibilidad importan más que la huella sub-1-GiB.
- El camino RCO solo está validado en CPU y ROCm; CUDA sin probar, lo que es relevante si se despliega en NVIDIA.
- Los números de benchmark son específicos del hardware del autor (RX 9060 XT, ROCm 7.x) y pueden variar en otras configuraciones.
- Se trata de un modelo base ("Base"), no de una versión instruida: para uso conversacional puede requerir fine-tuning o plantillas de prompt adecuadas, con el consiguiente riesgo de alucinaciones y salidas sin filtro de seguridad.
- Sesgos conocidos, límites de idioma y comportamiento del modelo base: no disponibles en la información proporcionada.
- Licencia: lfm1.0 (LFM Open License de LiquidAI) con condiciones específicas; es responsabilidad del usuario cumplir la licencia del modelo base y sus restricciones de uso antes de cualquier despliegue comercial.
- Proyecto comunitario con adopción muy temprana (146 descargas, 1 like en el momento de la ficha): verificar los SHA256SUMS incluidos antes de usar en producción.

## Enlaces

- Repositorio de la ficha: https://huggingface.co/efeisot/lfm3-1.7b-1rco-2mix-gguf
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base/blob/main/LICENSE
- Artículo RCO (arXiv:2605.00649): "Model Compression with Exact Budget Constraints via Riemannian Manifolds" (Helcig, Alistarh) — enlace completo no disponible en la información proporcionada
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Documentación incluida en el repo: docs/USAGE.md, docs/QUANTIZATION.md, docs/RELEASE_NOTES.md y metadata/ (resultados machine-readable y logs de evaluación)
