# maternion/LFM3-VL-2B-NVFP4-GGUF

## Resumen

LFM3-VL-2B-NVFP4-GGUF es una conversión no oficial del checkpoint NVFP4 de LiquidAI (LiquidAI/LFM3-VL-2B-NVFP4) al formato GGUF para su uso con llama.cpp. El trabajo lo publica el usuario independiente maternion y no está afiliado ni respaldado por LiquidAI. La particularidad del paquete es que preserva los pesos NVFP4 originales sin dequantizar: las proyecciones FFN del transformer mantienen el formato NVFP4 de 4 bits con sus escalas por bloque y globales, mientras que atención, convoluciones, embeddings y `lm_head` permanecen en BF16 tal y como los publicó LiquidAI. No hay requantización, ni imatrix, ni pérdida adicional introducida por el proceso de conversión.

El modelo base pertenece a la familia LFM3 de LiquidAI, con 1.728.801.744 parámetros reales según los safetensors del checkpoint original. Aunque la nomenclatura "VL" sugiere capacidades de visión-lenguaje, este GGUF contiene únicamente la torre de texto: no incluye los pesos de visión ni un fichero `mmproj`, por lo que se ejecuta como un LLM puramente textual. El fichero resultante ocupa 1,71 GiB y agrupa 431 tensores, con un peso efectivo de aproximadamente 7,9 bits por peso debido a que la mayoría de tensores siguen en BF16.

La relevancia de esta ficha es doble: por un lado documenta un caso práctico de empaquetado de cuantización NVFP4 en GGUF sin pérdida de escalas, algo que requiere versiones muy recientes de llama.cpp; por otro, advierte de las limitaciones de backend (Vulkan no soportado todavía) y de la imposibilidad de re-cuantizar el fichero con `llama-quantize`, ya que los tensores NVFP4 son un tipo de almacenamiento con escalas externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM3 de LiquidAI); FFN en NVFP4, atención/convoluciones/embeddings en BF16 |
| Parametros totales | 1.728.801.744 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de ejecución usa `-c 4096` y `-c 2048`) |
| Tipos de cuantizacion | NVFP4 en FFN (4,5 bpw en super-bloques de 64 pesos, 36 B por bloque); BF16 en atención, convoluciones, embeddings y `lm_head`; F32 en escalas y normas |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | GGUF (431 tensores: 72 NVFP4, 277 F32, 82 BF16) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia LFM3 de LiquidAI con 1,73 mil millones de parámetros. La conversión a GGUF no altera la arquitectura: reproduce fielmente el checkpoint NVFP4 de ModelOpt, donde solo las proyecciones FFN (gate, up, down) están cuantizadas a 4 bits con escalas por bloque (`weight_scale`, `weight_scale_2`) y escala de entrada (`input_scale`). El resto de tensores —atención, convoluciones, embeddings y cabeza de salida— permanecen en BF16. El fichero GGUF contiene 72 tensores NVFP4, 277 tensores F32 (72 `.scale`, 72 `.input_scale` y normas) y 82 tensores BF16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en la información proporcionada. La conversión se realizó con `convert_hf_to_gguf.py` sin parches al conversor: los checkpoints puramente NVFP4 omiten la dequantización y la función `modify_tensors` de LFM3 es un pass-through para los pesos de texto, por lo que el reempaquetado de super-bloques es seguro en cuanto al orden. La verificación se hizo leyendo los tipos de tensor del GGUF con `GGUFReader` en lugar de confiar en el código de salida del conversor.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y los tags incluyen `conversational`.
- Razonamiento y generación de lenguaje natural en formato LLM de texto (la torre de visión no está incluida en este GGUF).
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integración con infraestructuras de inferencia estándar.
- Ejecución en llama.cpp con backend CPU, CUDA/HIP (ROCm) y Metal, aplicando las escalas NVFP4 en matmul.
- Capacidades multimodales (visión): no disponibles en este paquete; el modelo base es VL pero el GGUF solo contiene la torre de texto y no incluye `mmproj`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en GPU de consumo con cuantización de 4 bits: el fichero de 1,71 GiB cabe en GPUs con 4-8 GB de VRAM y permite ejecutar un modelo de 1,7B parámetros en equipos modestos, manteniendo la fidelidad de los pesos FFN originales al no dequantizar.
- Despliegue en estaciones con ROCm: el autor reporta 11,7 t/s de prompt y 100,5 t/s de generación en una AMD Radeon RX 9060 XT con `-ngl 99 -c 2048`, lo que lo hace adecuado para asistentes conversacionales de baja latencia en hardware AMD.
- Prototipado de pipelines de texto en llama.cpp: al ser un GGUF compatible con `llama-cli` y `llama-perplexity`, sirve para validar flujos de generación y evaluar perplejidad antes de escalar a modelos mayores.
- Aplicaciones de chat multi-turno en local: el tag `conversational` y el pipeline `text-generation` permiten integrarlo en interfaces de chat con llama.cpp, aunque la ventana de contexto efectiva debe fijarse manualmente (el ejemplo usa 2048-4096 tokens).
- Evaluación de cuantización NVFP4: útil como banco de pruebas para comparar calidad y velocidad frente a versiones BF16 o GGUF re-cuantizadas, dado que preserva las escalas originales sin pérdida adicional.
- Experimentación con backends CUDA/Metal: sirve para medir el rendimiento de matmul con escalas NVFP4 en distintas plataformas y detectar regresiones, como la falta de soporte en Vulkan.
- Integración en entornos de investigación que requieran un modelo pequeño de texto con licencia LFM1.0 para experimentos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento medido es el del autor en ROCm (AMD Radeon RX 9060 XT, `-dev ROCm0 -ngl 99 -c 2048`): 11,7 t/s en procesamiento de prompt y 100,5 t/s en generación.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF ocupa 1,71 GiB; con overhead de contexto y KV cache, se estima un uso de 2-3 GB para contextos de 2048-4096 tokens.
- GPU recomendadas: cualquier GPU con soporte CUDA, HIP/ROCm o Metal y al menos 4 GB de VRAM; el autor valida AMD Radeon RX 9060 XT con ROCm.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más (por ejemplo, RTX 3050/4060, RX 6600/7600, Apple Silicon con Metal).
- Opciones de despliegue: llama.cpp (requiere commit `a38695013` o posterior, que incluye soporte de escalas para fp8 y nvfp4, PR #28898); no compatible con `llama-quantize` para re-cuantizar; Vulkan no soportado todavía (PR abierta #29791).
- Latencia y throughput: 11,7 t/s de prompt y 100,5 t/s de generación en RX 9060 XT con ROCm; no hay datos para CUDA, Metal o CPU en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| maternion/LFM3-VL-2B-NVFP4-GGUF | 1,73 B | no disponible | NVFP4 (FFN) + BF16 | lfm1.0 | GGUF en HF |
| LiquidAI/LFM3-VL-2B-NVFP4 (base) | 1,73 B | no disponible | NVFP4 (ModelOpt) | lfm1.0 | Safetensors en HF |
| LFM3-1.7B (familia LFM3) | ~1,7 B | no disponible | BF16 y otras | lfm1.0 | HF (referenciado en la model card) |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Este GGUF no incluye la torre de visión ni fichero `mmproj`: no puede procesar imágenes aunque el modelo base sea VL.
- Requiere llama.cpp en el commit `a38695013` o posterior; versiones anteriores rechazan los tipos NVFP4 o cargan sin las escalas, produciendo resultados incorrectos.
- Vulkan no está soportado: los tensores con escala caen silenciosamente a CPU y la inferencia se ralentiza drásticamente (PR #29791 pendiente).
- `llama-quantize` no puede re-cuantizar este fichero porque los tensores NVFP4 son un tipo de almacenamiento con escalas externas.
- Conversión no oficial e independiente: no está afiliada ni respaldada por LiquidAI; la licencia lfm1.0 puede imponer restricciones para uso comercial que deben revisarse en el enlace de licencia del modelo base.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; se desconoce la composición del dataset de entrenamiento.
- Idiomas soportados no documentados; no se garantiza cobertura multilingüe.
- Longitud de contexto oficial no documentada; los ejemplos de ejecución usan 2048 y 4096 tokens, pero no se confirma el máximo soportado.
- El fichero tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/maternion/LFM3-VL-2B-NVFP4-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B-NVFP4
- Licencia LFM1.0: https://huggingface.co/LiquidAI/LFM3-VL-2B-NVFP4/blob/main/LICENSE
- llama.cpp (repositorio): https://github.com/ggml-org/llama.cpp
- PR de soporte de escalas fp8/nvfp4 (#28898): https://github.com/ggml-org/llama.cpp/pull/28898
- PR de soporte Vulkan para matmul con escalas (#29791): https://github.com/ggml-org/llama.cpp/pull/29791
- Documentación LiquidAI LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola LiquidAI: https://console.liquid.ai/dashboard
- Playground LiquidAI: https://playground.liquid.ai/
