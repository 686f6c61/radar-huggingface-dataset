# cloudnathan5/Qwen3.8-27B-NVFP4a4-FP8-GPTQ

## Resumen

`cloudnathan5/Qwen3.8-27B-NVFP4a4-FP8-GPTQ` es una cuantización mixta de precisión NVFP4 y FP8, con selección de pesos mediante GPTQ, del modelo base `Qwen/Qwen3.8-27B`. El autor, cloudnathan5, la ha producido con la librería `llm-compressor` y la ha guardado en formato `compressed-tensors` para su uso directo con vLLM. El objetivo es reducir el tamaño del checkpoint (de 55,6 GB en BF16 a 23,0 GB, un 2,42x menor) y acelerar la inferencia en hardware NVIDIA Blackwell, manteniendo las rutas numéricamente frágiles en mayor precisión.

El modelo base es una arquitectura híbrida con 64 capas, de las cuales 48 usan atención lineal (gated-delta) y el resto atención completa, además de componentes MoE y una cabeza de multi-token-prediction (MTP). La cuantización aplica NVFP4 (W4A4) a las rutas GEMM-bound (MLP y proyecciones de atención completa) y FP8 (W8A8) a las rutas de atención lineal, dejando en BF16 los módulos sensibles como `lm_head`, `embed_tokens`, la torre de visión, los gates MoE y la cabeza MTP. El resultado es un checkpoint de 18.386.186.992 parámetros totales, con licencia Apache 2.0 y pipeline `image-text-to-text`.

La relevancia de este modelo radica en que permite ejecutar un modelo de gran tamaño con una huella de memoria reducida y una latencia de decode hasta 2,21x superior al BF16 en GPUs Blackwell, manteniendo una pérdida de perplexidad de solo +4,64% en wikitext-2. Está pensado para despliegues en producción con vLLM, especialmente en entornos con restricciones de VRAM o que requieran baja latencia interactiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 64 capas, 48 de atención lineal (gated-delta) + atención completa, MoE, MTP (basada en Qwen/Qwen3.8-27B) |
| Parametros totales | 18.386.186.992 |
| Parametros activos | no disponible (arquitectura MoE, pero no se especifica el número de activos) |
| Longitud de contexto | 32768 (según comando de ejemplo en vLLM) |
| Tipos de cuantizacion | NVFP4 (W4A4) para rutas GEMM, FP8 (W8A8) para rutas de atención lineal, GPTQ para selección de pesos |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, compressed-tensors (compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B` presenta una arquitectura híbrida poco común: de sus 64 capas, 48 emplean atención lineal con estado gated-delta, mientras que el resto usa atención completa. Además incorpora componentes MoE (con gates de routing) y una cabeza de multi-token-prediction (MTP) para decodificación especulativa. Esta combinación busca escalar el contexto de forma eficiente, pero introduce rutas numéricamente sensibles que requieren un tratamiento especial en cuantización.

La cuantización se realizó con `llm-compressor`, calibrando sobre 256 muestras del dataset `HuggingFaceH4/ultrachat_200k` a 4096 tokens con la plantilla de chat aplicada. La selección de pesos se hizo mediante GPTQ, que utiliza compensación de error basada en la Hessiana, sin coste adicional en inferencia. Los módulos excluidos de la cuantización (mantenidos en BF16) son `lm_head`, `embed_tokens`, la torre de visión (`visual.*`), las rutas de estado de atención lineal (`linear_attn.*`), los gates MoE (`mlp.gate`, `shared_expert_gate`) y la cabeza MTP (`mtp.*`). Esta exclusión es específica de la arquitectura y debe re-derivarse si se modifica el modelo.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.8-27B, aunque no se proporcionan detalles específicos en la documentación.
- Procesamiento de imagen y texto: el pipeline es `image-text-to-text`, lo que indica soporte para entrada multimodal (imagen + texto) y salida de texto.
- Atención lineal para contexto largo: 48 de 64 capas usan atención lineal, lo que permite manejar ventanas de hasta 32768 tokens con menor coste computacional que la atención completa.
- Multi-token-prediction (MTP): la cabeza MTP se incluye en BF16, habilitando decodificación especulativa para acelerar la generación.
- Cuantización mixta optimizada para Blackwell: NVFP4 en rutas GEMM y FP8 en rutas de atención lineal, con soporte de emulación en GPUs más antiguas.
- Compatibilidad con vLLM: formato `compressed-tensors` listo para servir con vLLM, incluyendo batching y gestión de caché.

## Casos de uso

- Inferencia de baja latencia en GPUs Blackwell: el modelo alcanza 57,9 tokens/s en decode con un solo usuario en una RTX PRO 6000 Blackwell, lo que lo hace adecuado para aplicaciones interactivas como chatbots o asistentes en tiempo real donde la latencia es crítica.
- Despliegue en producción con vLLM: al estar en formato `compressed-tensors`, se integra directamente con `vllm serve`, permitiendo gestionar múltiples secuencias con batching y control de memoria mediante `--max-num-seqs` y `--gpu-memory-utilization`.
- Procesamiento de documentos largos: con una ventana de 32768 tokens, puede resumir o extraer información de documentos extensos, informes técnicos o conversaciones multi-turno sin truncar el contexto.
- Aplicaciones multimodales: al ser `image-text-to-text`, puede utilizarse para tareas como descripción de imágenes, respuesta a preguntas visuales o generación de texto a partir de capturas, siempre que el modelo base soporte estas capacidades.
- Experimentación con decodificación especulativa: la cabeza MTP en BF16 permite probar técnicas de MTP speculative decoding en vLLM, reduciendo aún más la latencia en generación larga.
- Entornos con VRAM limitada: el checkpoint de 23 GB (frente a 55,6 GB en BF16) permite ejecutar el modelo en GPUs con 24 GB o más, aunque no se especifica la VRAM mínima exacta; es viable en tarjetas como RTX 4090 o RTX 6000 Ada con cuantización.

## Benchmarks y rendimiento

La documentación proporciona dos métricas de rendimiento: perplexidad y latencia single-user.

**Perplexidad** (wikitext-2-raw-v1, test, 48 ventanas no solapadas de 4096 tokens, 196.560 tokens, medida con vLLM):

| Modelo | Perplexidad | vs BF16 |
|---|---|---|
| Este checkpoint | 6.8614 | +4,64% |
| Qwen/Qwen3.8-27B (BF16) | 6.5574 | — |

**Latencia single-user** (concurrencia 1, RTX PRO 6000 Blackwell 96GB, vLLM 0.27.1, prefix caching desactivado, `--ignore-eos`, generación de 256 tokens, mediana de 24 peticiones tras 4 warmups):

| Input tokens | TTFT | Inter-token latency | Decode tok/s | BF16 base tok/s |
|---|---|---|---|---|
| 1024 | 94 ms | 17,3 ms | 57,9 (2,21x) | 26,2 |
| 4096 | 302 ms | 17,3 ms | 57,7 (2,21x) | 26,1 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 23,0 GB, por lo que se necesita al menos esa cantidad para los pesos, más VRAM adicional para la caché KV y overhead de vLLM. No se especifica un mínimo exacto; en la prueba se usó una RTX PRO 6000 Blackwell de 96 GB.
- GPU recomendadas: NVIDIA Blackwell (SM100/SM120) para aprovechar los tensor cores FP4; FP8 requiere SM89+ (por ejemplo, RTX 40 series). En GPUs más antiguas, vLLM cae a emulación, lo que reduce el rendimiento.
- Compatibilidad con consumer GPU: probablemente quepa en GPUs de 24 GB (como RTX 4090) con cuantización, pero no está confirmado en la documentación.
- Opciones de despliegue: vLLM es la opción recomendada y la única probada; también es compatible con la librería `transformers` (según los tags), aunque el formato `compressed-tensors` está optimizado para vLLM.
- Latencia y throughput: los datos de latencia single-user se muestran en la tabla de benchmarks; bajo concurrencia el ranking entre variantes puede diferir, según la documentación.

## Comparativa con modelos similares

No se dispone de comparaciones con otros modelos cuantizados en la información proporcionada. La única comparación directa es con el modelo base en BF16:

| Modelo | Parámetros | Contexto | Perplexidad (wikitext-2) | Tamaño checkpoint | Licencia |
|---|---|---|---|---|---|
| Este checkpoint (NVFP4+FP8 GPTQ) | 18.386.186.992 | 32768 | 6.8614 | 23,0 GB | Apache 2.0 |
| Qwen/Qwen3.8-27B (BF16) | 18.386.186.992 | 32768 | 6.5574 | 55,6 GB | Apache 2.0 |

No se han encontrado alternativas comparables en la misma categoría (cuantización mixta de este tipo) en la información disponible.

## Limitaciones y advertencias

- Cuantización con pérdida: la perplexidad aumenta un 4,64% respecto al BF16, lo que puede afectar a tareas sensibles a la precisión. Se recomienda validar en el workload propio antes de producción.
- Requisitos de hardware específicos: el rendimiento óptimo solo se alcanza en GPUs Blackwell (SM100/SM120) para FP4; en GPUs con SM89+ (FP8) el rendimiento puede ser menor, y en GPUs antiguas la emulación degrada significativamente la velocidad.
- Problema conocido con vLLM: con `--max-num-seqs` alto (por defecto 1024), el arranque puede fallar durante la captura de CUDA graph con el error `max_num_seqs (1024) exceeds available Mamba cache blocks`, debido a que 48 de 64 capas usan atención lineal y vLLM asigna un bloque de caché estilo Mamba por secuencia de decode. Se recomienda bajar a 512 o aumentar `--gpu-memory-utilization`.
- Lista de exclusión sensible: los módulos excluidos de la cuantización se derivaron de la arquitectura en el momento de la liberación; si se fine-tunea o altera el modelo, la lista debe re-derivarse.
- Sesgos y alucinaciones: no se documentan en esta ficha; se heredan del modelo base Qwen3.8-27B, del que no se proporcionan detalles.
- Idiomas soportados: no se especifican, por lo que no se puede garantizar cobertura multilingüe.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cloudnathan5/Qwen3.8-27B-NVFP4a4-FP8-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de llm-compressor: https://github.com/vllm-project/llm-compressor
- Dataset de calibración: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
