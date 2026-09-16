# hugypufy/Swift-Qwen3.8-27B-PARO-int5

## Resumen

Swift-Qwen3.8-27B-PARO-int5 es una cuantización de 5 bits del modelo ukisai/Swift-Qwen3.8-27b, publicada por el usuario hugypufy. Se trata de un modelo multimodal de tipo image-text-to-text de 27B parámetros nominales, derivado a su vez del Qwen/Qwen3.8-27B, cuantizado con la receta ParoQuant (rotaciones de Givens aprendidas más ajuste fino de pesos y escalas de grupo) sobre una rejilla int5 asimétrica uniforme. El objetivo es reducir el checkpoint original de 55,6 GB a 21 GB y poder servirlo en GPUs AMD RDNA4 (Radeon AI PRO R9700, gfx1201) mediante un kernel W5A8 con fp8-WMMA dentro de una versión parcheada de vLLM.

La relevancia de esta ficha es doble. Por un lado, demuestra que es posible ejecutar un modelo multimodal de 27B en hardware AMD de gama profesional con un throughput de decodificación de 160,7 tokens/s en un solo stream gracias a decodificación especulativa con un drafter DFlash2-FP8 a 7 tokens. Por otro, ilustra un problema práctico del ecosistema: el Hub reporta 7.088.303.344 parámetros porque cuenta elementos de tensor, no parámetros reales, ya que los pesos int5 van empaquetados (8 códigos int5 por palabra int32 en `qweight` y 32 bits por palabra en `qweight_hi`); el autor estima 24,33B pesos cuantizados reales.

El modelo no es cargable con transformers ni vLLM estándar: requiere el plugin de cuantización `paroquant` que se distribuye en el repositorio radiance-vllm-mxfp4 y que compila los kernels en contenedor sobre ROCm para gfx1201. La licencia del modelo base (Swift Open License v1.0) se mantiene en el derivado, con uso comercial gratuito hasta 1.000.000 USD de ingresos recurrentes anuales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivada de Qwen3.8-27B; incluye torre visual y módulos `linear_attn.in_proj_a/b`; tag de familia `qwen3_5`. Detalle interno no disponible |
| Parámetros totales | 27B nominales (24,33B pesos cuantizados según el autor). El badge del Hub indica 7.088.303.344 elementos de tensor, cifra distorsionada por el empaquetado int5 |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible; los benchmarks de prefill llegan hasta 60k tokens, lo que sugiere soporte de al menos esa longitud, sin confirmación explícita |
| Tipos de cuantización | int5 asimétrico uniforme, group size 128 a lo largo de K, escalas de grupo y zero points en fp16, 5,25 bits/peso efectivos, formato `int5-bitplane`; fp16 en torre visual, `linear_attn.in_proj_a/b`, `lm_head` y embeddings |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License v1.0 (`license: other`); uso gratuito para personal, investigación, educación, evaluación y comercial hasta 1.000.000 USD de ARR; por encima aplica la Enterprise License de UkisAI |
| Formato de pesos | safetensors; `qweight`/`qzeros` con empaquetado AWQ int4 para los cuatro bits bajos y `qweight_hi`/`qzeros_hi` como planos int32 `[K, N/32]` para el quinto bit |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de que es un transformer multimodal con torre visual (pipeline `image-text-to-text`), 64 capas y módulos de atención lineal (`linear_attn.in_proj_a/b`) que se mantienen en fp16 tras la cuantización. La cuantización afecta a 400 módulos y emplea la receta ParoQuant completa: en primer lugar, un round-to-nearest one-shot sobre la rejilla int5; en segundo lugar, un ajuste fino de etapa 2 que optimiza los valores de los pesos y las escalas de grupo manteniendo congeladas las rotaciones. Ese ajuste de etapa 2 se ejecutó durante 5 horas y 17 minutos sobre una única R9700.

Las rotaciones son rotaciones de Givens por pares aprendidas, tomadas byte a byte del checkpoint z-lab/Qwen3.8-27B-PARO (ParoQuant, ICLR'26), junto con los `channel_scales` preinvertidos, con `krot = 8`. La transformación aplicada en inferencia es `y = x W^T = ((x * channel_scales) R^T) dequant(Q)^T`, de modo que la rotación se fusiona con la cuantización de activaciones. El autor indica que la etapa 2 reduce la divergencia KL servida entre un 7% y un 14% sobre el modelo base, y que es neutra en velocidad por construcción, ya que solo cambia valores de pesos, no formatos, formas ni kernels; la variación medida respecto a una build sin ajuste fino del mismo checkpoint es inferior al 0,3%.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat, tokenizador y configuración de generación propias de Swift.
- Procesamiento de imagen y texto de entrada (pipeline `image-text-to-text`), con torre visual conservada en fp16.
- Razonamiento aritmético y de sentido común: el único dato publicado es un 96,2% en GSM8K, lo que indica competencia sólida en matemáticas de nivel escolar.
- Capacidades de código: no disponibles explícitamente en la información proporcionada.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el modelo base Qwen suele ser multilingüe, pero no hay confirmación en esta ficha.
- Modo de razonamiento o "thinking": el autor de Swift reclama una reducción del 58,3% en tokens de pensamiento, pero la afirmación corresponde al ajuste fino en bf16 de UkisAI y no ha sido reverificada para esta cuantización.
- Decodificación especulativa compatible mediante drafter DFlash2-FP8 configurado a 7 tokens especulativos, con 3,17 tokens aceptados por paso.

## Casos de uso

- Asistencia conversacional multimodal en local: el modelo acepta entradas de imagen y texto y puede mantener diálogos multi-turno con la plantilla de chat de Swift, adecuado para entornos donde los datos no pueden salir de la infraestructura propia.
- Despliegue en hardware AMD RDNA4: es una de las pocas rutas prácticas para servir un modelo de 27B multimodal en Radeon AI PRO R9700, con 21,9 GB de checkpoint que caben en los 32 GB de VRAM de la tarjeta y permiten tensor parallel en configuraciones de 2 GPUs.
- Servicio de inferencia de alta concurrencia con requisitos de latencia estrictos: gracias a la decodificación especulativa (160,7 t/s en un solo stream y 3,17 tokens aceptados por paso) resulta apto para asistentes interactivos donde el tiempo hasta el primer token y la velocidad de decodificación son críticos.
- Procesamiento de documentos largos con prefill sostenido: el prefill medido se mantiene en 3.027, 3.073 y 2.965 t/s a 2k, 32k y 60k tokens respectivamente, lo que permite ingerir contextos extensos sin degradación apreciable del throughput de prefill.
- Evaluación y benchmarking de técnicas de cuantización: al ser una implementación de referencia de la receta ParoQuant con etapa 2, sirve para comparar calidad y velocidad frente a cuantizaciones one-shot.
- Investigación sobre cuantización de precisión mixta: el formato `int5-bitplane`, con planos de quinto bit separados y escalas de grupo fp16, es un caso de estudio útil para quienes diseñan kernels de bajo bit.
- Aplicaciones educativas y de prototipado con presupuesto limitado: la licencia permite uso gratuito en educación, investigación y evaluación, y el uso comercial es libre hasta 1.000.000 USD de ARR.
- Tareas de razonamiento matemático de nivel escolar: el 96,2% en GSM8K lo hace viable para tutores automatizados de aritmética y resolución de problemas verbales.

## Benchmarks y rendimiento

| Métrica | Este modelo | Launch80 base int5 |
|---|---:|---:|
| GSM8K (500 preguntas × 2, flexible-extract) | 96,2% | no disponible |
| Decodificación en un solo stream (ponderada) | 160,7 t/s | 156,5 t/s |
| Prefill a 2k (t/s) | 3.027 | 3.061 |
| Prefill a 32k (t/s) | 3.073 | 3.156 |
| Prefill a 60k (t/s) | 2.965 | 3.050 |
| Tokens aceptados por paso del drafter | 3,17 | 3,13 |

Configuración de medición: 2 × R9700, tensor parallel = 2, vLLM 0.29.0 con radiance y drafter DFlash2-FP8 a 7 tokens especulativos. No se han publicado resultados de benchmarks de conocimiento general (MMLU, HumanEval u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 21-22 GB de pesos (5,25 bits/peso efectivos) más caché KV, activaciones y buffers de runtime; con contexto largo la huella crece de forma apreciable.
- GPU objetivo: AMD Radeon AI PRO R9700 (RDNA4, gfx1201), 32 GB de VRAM. La configuración medida usa 2 unidades en tensor parallel = 2.
- GPU NVIDIA: no hay soporte confirmado. El kernel `paroquant` se compila para ROCm en gfx1201; no se documenta una ruta CUDA funcional.
- ¿Cabe en GPU de consumo? El checkpoint de 21,9 GB no cabe en GPUs de consumo típicas de 16 GB ni en la mayoría de tarjetas de 24 GB una vez añadidos caché y overhead. En la R9700 de 32 GB, sí.
- Opciones de despliegue: exclusivamente vLLM parcheado con el plugin `paroquant` incluido en radiance-vllm-mxfp4, construido en contenedor sobre ROCm para gfx1201. No es cargable con transformers estándar, vLLM estándar, llama.cpp, Ollama ni TGI según la información disponible.
- Comandos de referencia: `./setup-paroquant.sh` y `MODEL_DIR=Swift-Qwen3.8-27B-PARO-int5 MODE=prod SPEC=7 ./paroquant/run_paroquant.sh`.
- Latencia y throughput: 160,7 t/s de decodificación en un solo stream con 7 tokens especulativos y 3,17 tokens aceptados por paso; prefill entre 2.965 y 3.073 t/s en el rango de 2k a 60k tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Swift-Qwen3.8-27B-PARO-int5 (este) | 27B nominales, 24,33B pesos cuantizados | int5 + ParoQuant etapa 2, 5,25 bits/peso | no disponible (prefill medido hasta 60k) | GSM8K 96,2%; 160,7 t/s decodificación | Swift Open License v1.0 | safetensors, requiere vLLM parcheado en ROCm gfx1201 |
| Launch80/Qwen3.8-27B-PARO-int5 | 27B (mismo origen) | int5 + ParoQuant, sin la etapa 2 reducida de este checkpoint | no disponible | 156,5 t/s decodificación, 3,13 tokens aceptados/paso; GSM8K no disponible | derivada del modelo base | safetensors |
| z-lab/Qwen3.8-27B-PARO | 27B | rotaciones ParoQuant (referencia de la receta) | no disponible | no disponible | no disponible en la información proporcionada | safetensors |
| ukisai/Swift-Qwen3.8-27b (base) | 27B | bf16, 55,6 GB | no disponible | reclamaciones del autor: 58,3% menos tokens de pensamiento y <1% de pérdida de calidad, no reverificadas | Swift Open License v1.0 | safetensors |
| Qwen/Qwen3.8-27B (base original) | 27B | bf16 | no disponible | no disponible | no disponible en la información proporcionada | safetensors |

## Limitaciones y advertencias

- No es cargable con transformers ni vLLM estándar. Requiere el plugin `paroquant` y kernels compilados en contenedor sobre ROCm para gfx1201, lo que limita el despliegue a ese ecosistema.
- Soporte restringido a AMD RDNA4: no hay ruta CUDA documentada, lo que excluye la mayor parte del parque de GPUs de centro de datos y de consumo.
- El número de parámetros mostrado por el Hub (7.088.303.344) no refleja el tamaño real del modelo (27B nominales, 24,33B pesos cuantizados) por el empaquetado int5.
- El ajuste fino de etapa 2 se ejecutó con `train_size = 256` en lugar de los 512 de la receta de referencia, por lo que se trata de una etapa 2 reducida y la ganancia de calidad puede ser inferior a la de un ajuste completo.
- No se ha recogido la métrica de divergencia KL, que es precisamente la que optimiza la etapa 2; el único dato de calidad publicado es GSM8K, una prueba estructuralmente insensible a esa métrica.
- Las afirmaciones sobre reducción de tokens de pensamiento (58,3%) y pérdida de calidad inferior al 1% proceden de UkisAI y se midieron sobre el ajuste fino en bf16, no sobre esta cuantización.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no se publican evaluaciones de veracidad ni de tasas de alucinación para este checkpoint.
- Sesgos: no se documenta ningún análisis de sesgos en la información disponible.
- Idiomas soportados: no declarados; no se puede asumir cobertura multilingüe sin verificación.
- Longitud de contexto: no se declara explícitamente, aunque los benchmarks de prefill llegan a 60k tokens. Conviene validar el comportamiento real en contextos largos antes de producción.
- Licencia: uso comercial gratuito solo hasta 1.000.000 USD de ingresos recurrentes anuales. La cuantización no relicencia los pesos; por encima del umbral se aplica la Enterprise License de UkisAI.
- Madurez: el repositorio no registra descargas ni likes en el momento de la consulta, y su fecha de creación es muy reciente, por lo que la validación comunitaria es prácticamente nula.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hugypufy/Swift-Qwen3.8-27B-PARO-int5
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Checkpoint de referencia de la receta: https://huggingface.co/Launch80/Qwen3.8-27B-PARO-int5
- Rotaciones ParoQuant: https://huggingface.co/z-lab/Qwen3.8-27B-PARO
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio con el plugin de cuantización y kernels: https://codeberg.org/ggz14/radiance-vllm-mxfp4
- Licencia Swift Open License v1.0: https://ukisai.com/products/swift
