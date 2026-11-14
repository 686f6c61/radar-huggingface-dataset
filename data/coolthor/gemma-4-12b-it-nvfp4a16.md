# coolthor/gemma-4-12B-it-NVFP4A16

## Resumen

Gemma 4 12B-it NVFP4A16 es una cuantización comunitaria de pesos en formato NVFP4 (4 bits) con activaciones en BF16 (esquema W4A16) del modelo `google/gemma-4-12B-it`, publicado por el usuario coolthor. El modelo base es un modelo ómnibus ("omni") de Google, sin encoder separado, capaz de procesar y generar texto, imagen, audio y vídeo bajo una única arquitectura `gemma4_unified`. La cuantización reduce el peso en disco de 23 GB (BF16) a 7,7 GB, manteniendo operativas las cuatro modalidades, algo que la cuantización W4A4 sí rompe.

El interés de esta ficha es doble. Por un lado, documenta una receta concreta de cuantización con `llmcompressor` para una arquitectura muy reciente, incluyendo la lista de módulos que deben quedar en BF16 (`lm_head` y las `embedding_projection`) para que vLLM cargue el modelo. Por otro, cuantifica el coste de precisión de forma honesta: la pérdida en MMLU (inglés) es de unos 2,7 puntos, pero en TMMLU+ (chino tradicional) asciende a unos 6,0 puntos, es decir, el doble en términos relativos.

Con 11.959.730.224 parámetros totales (dato real de safetensors) y un repositorio de 8,2 GB, está pensado para servir en GPUs Blackwell (DGX Spark / GB10, sm_121a) con vLLM nativo, aunque también funciona en Hopper y Ada con una instalación reciente de vLLM. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ómnibus (`gemma4_unified`), encoder-free, con cabezas de atención de dimensión heterogénea (head_dim 256 × 16 cabezas = 4096 ≠ hidden 3840) |
| Parametros totales | 11.959.730.224 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el ejemplo de servicio usa `--max-model-len 4096` |
| Tipos de cuantizacion | NVFP4 weight-only (W4A16): pesos 4 bits, activaciones BF16; `lm_head` y `embedding_projection` en BF16 |
| Idiomas soportados | no disponible (la model card evalúa inglés y chino tradicional, pero no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `compressed-tensors` (NVFP4), biblioteca `transformers` |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de tipo ómnibus, sin encoder independiente, que integra las modalidades de texto, imagen, audio y vídeo en una sola pila. Una particularidad técnica relevante para el despliegue es que la atención usa dimensiones de cabeza no cuadradas (head_dim 256 con 16 cabezas, 4096, frente a un hidden de 3840), lo que rompe varias implementaciones de atención genéricas; por eso vLLM requiere el backend `TRITON_ATTN`. La cuantización se aplica con `llmcompressor`, esquema `NVFP4A16`, pipeline `basic` (el pipeline `sequential` falla con un error de trazado de `UserDict` en esta arquitectura nueva), con la lista de ignorados `["lm_head", "re:.*embedding_projection.*"]`, que debe coincidir con la cuantización nativa de módulos de vLLM o el modelo no carga.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO para el modelo base. La cuantización en sí es post-entrenamiento, sin calibración de activaciones (de ahí que sea weight-only). La model card justifica explícitamente esta elección: la calibración W4A4 se hace solo con texto, de modo que los embeddings de imagen y audio quedan fuera de distribución y se recortan con el rango de activación de 4 bits, lo que degrada la salida multimodal a vacía o corrupta.

## Capacidades

- Generación de texto y razonamiento en el modelo base, preservados tras la cuantización (pérdida medida de ~2,7 puntos en MMLU).
- Procesamiento de imagen: la torre de visión se mantiene operativa; el `patch_dense` de visión se cuantiza y las `embedding_projection` quedan en BF16.
- Procesamiento de audio y vídeo: funcionales a través de `transformers`; en vLLM el wrapper multimodal genérico es solo de imagen por ahora, por lo que el servicio completo de audio y vídeo está pendiente upstream.
- Pipeline `any-to-any`: entrada y salida multimodal dentro de una sola arquitectura.
- Servicio en vLLM con `Gemma4UnifiedForConditionalGeneration` nativo (a partir de ~0.22.x / main).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: evaluado en inglés y chino tradicional; no se declara lista de idiomas.

## Casos de uso

- Servicio multimodal en DGX Spark / GB10: el caso de uso natural de esta build. Con 7,7 GB en disco y 24,9 tok/s en decodificación de un solo stream, permite ejecutar texto e imagen en una GPU de sobremesa de gama Blackwell con vLLM y `VLLM_ATTENTION_BACKEND=TRITON_ATTN`. Es adecuado porque el formato W4A16 conserva las cuatro modalidades, a diferencia de W4A4.
- Asistentes de documentación con imagen: al mantenerse operativa la torre de visión, el modelo puede recibir capturas, diagramas o páginas escaneadas y responder sobre ellas; el `patch_dense` cuantizado reduce memoria sin destruir la señal visual.
- Prototipado de aplicaciones any-to-any: útil para validar pipelines que combinan texto, imagen, audio y vídeo en `transformers`, donde las cuatro modalidades funcionan, antes de decidir el formato de producción definitivo.
- Cargas de trabajo centradas en inglés con restricción de memoria: si el corpus es mayoritariamente inglés, el coste de ~2,7 puntos en MMLU es un intercambio razonable frente a los 23 GB del BF16, y el modelo cabe en GPUs de 8-16 GB.
- Evaluación comparativa de cuantizaciones: sirve como referencia reproducible (receta `llmcompressor`, versiones exactas de vLLM, transformers y torch) para medir el impuesto de cuantización entre idiomas con `lm-evaluation-harness` a 5-shot.
- Despliegue en CI/CD de pruebas de regresión multimodal: el tamaño reducido permite levantar el modelo en runners con GPU modesta y comprobar que las salidas de imagen y audio no se degradan tras cambios de toolchain.

## Benchmarks y rendimiento

Rendimiento en DGX Spark (GB10, sm_121a), vLLM 0.22.1 nativo, decodificación de un solo stream en caliente:

| Formato | Disco | tok/s (EN/ZH) | Ómnibus |
|---|---|---|---|
| BF16 | 23 GB | 7,7 | sí |
| FP8 dynamic | 13 GB | 15,9 | sí |
| NVFP4 W4A4 | 7,7 GB | 23,9 | roto |
| NVFP4 W4A16 (este) | 7,7 GB | 24,9 | sí |

Precisión con `lm-evaluation-harness`, 5-shot, plantilla de chat, `limit=30` (N ≈ 1.710 EN / 1.980 TC, ±~1,0 pt), a través de `transformers`:

| Formato | MMLU (EN) | TMMLU+ (TC) | Caída EN | Caída TC |
|---|---|---|---|---|
| BF16 | 78,30 % | 47,21 % | — | — |
| FP8 dynamic | 77,95 % | 46,97 % | −0,35 | −0,24 |
| NVFP4 W4A16 (este) | 75,56 % | 41,24 % | −2,74 | −5,97 |

Nota del autor: en `transformers` en modo eager todos los formatos cuantizados corren más lentos que BF16 por ausencia de kernels nativos FP4/FP8; las aceleraciones indicadas solo se materializan bajo vLLM.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 7,7 GB en disco; en inferencia hay que sumar el coste de las activaciones en BF16 y la caché KV, por lo que el margen práctico recomendado supera los 8 GB.
- GPU recomendadas: DGX Spark (GB10, sm_121a, CUDA 13.x) es el entorno validado; en Hopper (H100) y Ada (RTX 4090) no se necesita el ajuste de ABI de torch específico de sm_121.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8-12 GB de VRAM, siempre que la versión de vLLM incluya la clase nativa `Gemma4UnifiedForConditionalGeneration`.
- Despliegue: vLLM 0.22.1rc1.dev124 o superior (main) con `VLLM_ATTENTION_BACKEND=TRITON_ATTN`; transformers 5.10.1; torch 2.11.0+cu130; `compressed-tensors` incluido con `llmcompressor`. No se mencionan llama.cpp, Ollama ni TGI.
- Throughput y latencia: 24,9 tok/s en decodificación de un solo stream en GB10 con vLLM; 23,9 tok/s para W4A4; 15,9 tok/s para FP8 dynamic; 7,7 tok/s para BF16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU (EN) | TMMLU+ (TC) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este (NVFP4 W4A16) | 11,96 B | no disponible | 75,56 % | 41,24 % | Apache 2.0 | Hugging Face, 189 descargas |
| gemma-4-12B-it BF16 | 11,96 B | no disponible | 78,30 % | 47,21 % | Apache 2.0 | Hugging Face |
| gemma-4-12B-it FP8 dynamic | 11,96 B | no disponible | 77,95 % | 46,97 % | Apache 2.0 | Hugging Face |
| gemma-4-12B-it NVFP4 W4A4 | 11,96 B | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Impuesto de cuantización desigual: ~2,7 puntos en MMLU (inglés) y ~6,0 en TMMLU+ (chino tradicional), es decir, −3,5 % frente a −12,6 % en términos relativos. Para cargas en chino tradicional es preferible la build FP8 dynamic del mismo autor.
- Las cifras de precisión provienen de una única receta con `limit=30` y son indicativas, no una ley universal.
- En `transformers` eager no hay kernels nativos FP4, por lo que el modelo cuantizado corre más lento que BF16; la ventaja solo existe bajo vLLM.
- El modelo es muy sensible a versiones: transformers anterior a 5.10.1 no reconoce `model_type: gemma4_unified`; vLLM anterior a ~0.22.x cae al backend genérico y falla en `o_proj` por la atención no cuadrada.
- El backend `TRITON_ATTN` es obligatorio, no opcional.
- En arm64, pip puede instalar silenciosamente la rueda de torch para CPU; hay que forzar `torch==2.11.0` con el índice cu130 y `--no-deps`.
- En vLLM, el servicio de audio y vídeo no está disponible todavía; solo texto e imagen.
- Riesgo de alucinación y sesgos del modelo base: no documentados en la información proporcionada.
- Licencia Apache 2.0 declarada, sin restricciones comerciales indicadas en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coolthor/gemma-4-12B-it-NVFP4A16
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Build FP8 dynamic del mismo autor: https://huggingface.co/coolthor/gemma-4-12B-it-FP8-dynamic
- Análisis del impuesto de cuantización (EN/TC): https://ai-muninn.com/en/blog/dgx-spark-nvfp4-quant-tax-chinese-vs-english
- Apoyo al autor: https://buymeacoffee.com/thorlin
