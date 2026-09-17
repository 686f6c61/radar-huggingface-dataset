# hugypufy/Swift-Qwen3.8-27B-PARO-MXFP6

## Resumen

Swift-Qwen3.8-27B-PARO-MXFP6 es una cuantización de 6 bits del modelo multimodal ukisai/Swift-Qwen3.8-27b, un transformer de la familia Qwen3.5 con torre visual y capas de atención lineal. Lo publica el usuario hugypufy y su interés principal es de infraestructura: reduce el checkpoint original de 55,6 GB a 25,1 GB aplicando el formato OCP MXFP6 (E2M3) con rotaciones ParoQuant, un esquema que permite ejecutar la GEMM como fp8 × fp8 puro en las WMMA de AMD. Está pensado específicamente para GPU RDNA4 (Radeon AI PRO R9700, gfx1201) sobre ROCm.

El modelo no es cargable con transformers ni con vLLM estándar: requiere un plugin de cuantización `paroquant_mxfp6` incluido en la rama `mxfp6` del fork radiance-vllm-mxfp4, que compila los kernels en contenedor para gfx1201. Con 2 × R9700 en tensor parallel 2 y un drafter especulativo DFlash2-FP8 de 7 tokens, mantiene el contexto completo de 262.144 tokens con 685.554 tokens de caché KV en 13,5 GB.

Los datos publicados por el autor son honestos sobre sus límites: el fine-tune de la etapa 2 mueve la NLL de wikitext-2 en −0,0009 ± 0,0007 nats/token (dentro del ruido), la métrica KL no se ha recogido y parte de la ventaja de decodificación de la variante int5 se atribuye a diferencias de plantilla de chat. La licencia del modelo base (Swift Open License 1.0) impone un umbral de 1.000.000 USD de ingresos recurrentes anuales para uso comercial libre.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (tag `qwen3_5`) con capas de atención lineal; multimodal image-text-to-text con torre visual; cabeza MTP eliminada en esta conversión |
| Parametros totales | 27B según el autor (24,33B de pesos cuantizados). Los safetensors declaran 21.312.687.344 elementos, porque `weight` empaqueta cuatro códigos de 6 bits en cada 3 bytes |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | MXFP6 E2M3 (1 bit de signo, 2 de exponente, 3 de mantisa, máximo 7,5), 6,25 bits por peso, escalas e8m0 cada 32 pesos, `group_size = 128`, `mx_block = 32`, `max_exp_spread = 6`; esquema W6A8 con activaciones fp8; método declarado `paroquant_mxfp6`, `bits = 6`, `scale_rule = "even"`. No hay versiones GGUF ni de otros formatos |
| Idiomas soportados | No disponible |
| Licencia | Swift Open License 1.0 (etiquetada como `other`). Uso personal, de investigación, educativo, de evaluación y comercial gratuito hasta 1.000.000 USD de ingresos recurrentes anuales; por encima se aplica la licencia Enterprise de UkisAI. Se incluye también `LICENSE-APACHE-2.0` del modelo base original |
| Formato de pesos | `safetensors` con el layout fp6 de AMD Quark: `weight` como uint8 `[N, 3K/4]` y `weight_scale` como uint8 `[N, K/32]`. En fp16 quedan la torre visual, `linear_attn.in_proj_a/b`, `lm_head`, embeddings y normas |

## Arquitectura y entrenamiento

El modelo base es un transformer de 64 capas de la familia Qwen3.5 que combina atención estándar con capas de atención lineal (los tensores `linear_attn.in_proj_a` y `linear_attn.in_proj_b` se mantienen en fp16 tras la cuantización) y añade una torre visual, de ahí la etiqueta de pipeline image-text-to-text. Sobre esa base se aplica la receta ParoQuant completa: rotaciones de Givens por pares, aprendidas y preinvertidas, tomadas byte a byte del modelo z-lab/Qwen3.8-27B-PARO (ParoQuant, ICLR'26) con `krot = 8`, copiadas y congeladas. Se cuantizan 400 módulos lineales.

El proceso de cuantización tiene dos etapas: primero un round-to-nearest one-shot sobre la rejilla MXFP6 y después un fine-tune de etapa 2 que ajusta pesos y exponentes de bloque con las rotaciones congeladas, ejecutado con `train_size = 256` durante 5 horas y 36 minutos en una única R9700. La operación que define el formato es `y = x W^T = ((x * channel_scales) R^T) dequant(Q)^T`. Como toda magnitud E2M3 es representable de forma exacta en fp8 e4m3, los códigos alimentan la misma GEMM WMMA fp8 × fp8 que MXFP4 y el bucle interno no necesita punto cero. El autor reporta que el efecto del fine-tune frente a un build round-to-nearest del mismo formato es de −0,0009 ± 0,0007 nats/token en wikitext-2, es decir, indistinguible del ruido estadístico. La cabeza MTP no se incluye, por lo que la decodificación especulativa depende de un drafter externo (DFlash2-FP8).

## Capacidades

- Generación de texto conversacional multturno, con plantilla de chat propia de la familia Swift/Qwen (la model card menciona `qwen-fixed-v22.3.jinja` en los scripts de despliegue).
- Procesamiento de imagen y texto de forma conjunta (pipeline `image-text-to-text`), con la torre visual en fp16.
- Razonamiento matemático y aritmético: 96,7% en GSM8K (500 preguntas × 2, extracción flexible), prácticamente idéntico al 96,2% de la variante int5.
- Modo de razonamiento con presupuesto de tokens de pensamiento: la model card cita una reducción del 58,3% en tokens de thinking atribuida a Swift (dato truncado en la información disponible).
- Capacidad multilingüe: no disponible en la información proporcionada.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor reporta que KL no se ha recogido, lo que limita la validación de preservación de comportamiento más allá de GSM8K.
- Decodificación especulativa mediante drafter externo (DFlash2-FP8 a 7 tokens especulativos) al no incluirse la cabeza MTP.

## Casos de uso

- Despliegue de un asistente multimodal en clústeres AMD RDNA4 on-premise: con 2 × R9700 en TP=2 los pesos ocupan 12,85 GiB por GPU, lo que deja margen para una caché KV de 13,5 GB y el contexto completo de 262.144 tokens; es un escenario realista para equipos que no quieren depender de GPU NVIDIA.
- Atención al cliente con conversaciones de muchos turnos y documentos largos: la ventana de 262.144 tokens permite arrastrar historiales extensos y adjuntos sin truncado agresivo, y el pool de KV da 2,6-2,9 secuencias simultáneas de margen.
- Análisis de documentación técnica con gráficos e imágenes: la torre visual en fp16 permite pasar capturas de paneles, diagramas o tablas escaneadas junto al texto de la consulta, manteniendo la precisión de la torre al no estar cuantizada.
- Resolución de problemas matemáticos y verificación de cálculos en pipelines de evaluación: el 96,7% en GSM8K con extracción flexible lo hace apto como componente de un sistema de comprobación numérica, aunque conviene recordar que GSM8K es insensible estructuralmente a KL.
- Serving concurrente de alto rendimiento: con el drafter DFlash2-FP8 el modelo alcanza 394,0 t/s en c8 y 3.327-3.479 t/s de prefill entre 2k y 60k tokens, cifras adecuadas para APIs internas con múltiples usuarios.
- Investigación en cuantización de bajo bit: el repositorio documenta el layout exacto, la dispersión de exponentes y los scripts de despliegue, lo que lo convierte en una referencia reproducible para estudiar MXFP6 y las rotaciones ParoQuant en hardware RDNA4.
- Sustitución de un checkpoint bf16 en producción con presupuesto de memoria ajustado: pasar de 55,6 GB a 25,1 GB permite servir un modelo de 27B en dos GPU de 32 GB en lugar de necesitar más tarjetas o memoria unificada.

## Benchmarks y rendimiento

Resultados publicados por el autor, con 2 × R9700, TP=2, vLLM 0.29.0 + radiance y drafter DFlash2-FP8 a 7 tokens especulativos:

| Métrica | MXFP6 (este modelo) | Swift PARO-int5 |
|---|---:|---:|
| GSM8K (500q × 2, flexible-extract) | 96,7% | 96,2% |
| Perplejidad wikitext-2 (chunks de 2048 tokens) | 7,083 | no disponible |
| Decodificación mono-stream ponderada | 138,0 t/s | 160,7 t/s |
| Decodificación concurrente c1 | 124,7 t/s | 136,9 t/s |
| Decodificación concurrente c2 | 209,6 t/s | 252,6 t/s |
| Decodificación concurrente c4 | 321,6 t/s | 370,9 t/s |
| Decodificación concurrente c8 | 394,0 t/s | 427,3 t/s |
| Prefill 2k / 32k / 60k PP | 3.327 / 3.479 / 3.348 t/s | 3.027 / 3.073 / 2.965 t/s |
| Pesos por GPU | 12,85 GiB | 11,73 GiB |
| Capacidad de caché KV | 685.554 tokens | 762.413 tokens |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, MMMU u otros) en la información disponible. El propio autor señala tres salvedades: parte de la diferencia de decodificación frente a int5 puede deberse a que las pruebas de int5 usaron la plantilla de chat incluida en Swift y estas no (el prefill no se ve afectado); el fine-tune se ejecutó con `train_size = 256` y su efecto medido queda dentro del ruido; y no se ha recogido la métrica KL, que es precisamente la que optimiza la etapa 2.

## Requisitos de hardware

- VRAM estimada: 12,85 GiB de pesos por GPU con TP=2 (unos 25,7 GiB en total), más 13,5 GB asignados a `--kv-cache-memory`.
- GPU recomendadas: 2 × AMD Radeon AI PRO R9700 (RDNA4, gfx1201). El autor no reporta soporte para otras arquitecturas.
- ¿Cabe en GPU de consumo? No con este formato. En una RTX 4090 de 24 GB no caben ni los pesos en TP=1 ni la caché KV necesaria para el contexto completo, y además no existe kernel `paroquant_mxfp6` para CUDA.
- Opciones de despliegue: exclusivamente vLLM 0.29.0 con los kernels de la rama `mxfp6` de radiance-vllm-mxfp4 sobre ROCm, con `RADIANCE_MXFP4_WPERM=1` y compilación en contenedor para gfx1201. No es cargable con transformers estándar ni con vLLM estándar, y no hay pesos GGUF, por lo que llama.cpp, Ollama o TGI no son opciones.
- Throughput: prefill de 3.327 t/s (2k), 3.479 t/s (32k) y 3.348 t/s (60k); decodificación de 138,0 t/s en mono-stream y hasta 394,0 t/s en c8.
- Latencia (TTFT o tiempo por token individual): no disponible en la información proporcionada.
- Nota comparativa de rendimiento: el prefill es entre un 10% y un 13% más rápido que la variante int5 porque MXFP6 no tiene punto cero y el bucle interno de la GEMM es fp8 × fp8 puro; en cambio, la decodificación lee entre un 15% y un 19% más de bytes de peso por token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | Decodificación mono-stream | Pesos por GPU (TP=2) | Licencia |
|---|---|---|---|---|---|---|
| Swift-Qwen3.8-27B-PARO-MXFP6 (este) | 27B (24,33B cuantizados) | 262.144 | 96,7% | 138,0 t/s | 12,85 GiB | Swift Open License 1.0 (límite de 1 M USD de ARR) |
| hugypufy/Swift-Qwen3.8-27B-PARO-int5 | 27B (mismo base) | 262.144 | 96,2% | 160,7 t/s | 11,73 GiB | Swift Open License 1.0 |
| ukisai/Swift-Qwen3.8-27b (base sin cuantizar) | 27B | no disponible | no disponible | no disponible | 55,6 GB de checkpoint | Swift Open License 1.0 |
| Qwen/Qwen3.8-27B (modelo original) | 27B | no disponible | no disponible | no disponible | no disponible | Apache-2.0 según la model card |

La comparación directa más útil es con la variante int5 del mismo autor: MXFP6 gana en prefill (10-13%), pierde en decodificación (15-19% más de bytes leídos por token) y sacrifica algo de caché KV (685.554 frente a 762.413 tokens), con una precisión en GSM8K estadísticamente equivalente. Los resultados de benchmarks del modelo base sin cuantizar no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No es cargable con transformers ni con vLLM estándar: `paroquant_mxfp6` es un plugin de cuantización específico que requiere la rama `mxfp6` de un fork de vLLM aún no fusionado en el repositorio principal.
- Dependencia fuerte de hardware: los kernels solo se compilan para ROCm sobre gfx1201 (RDNA4). No hay ruta CUDA ni Metal, lo que descarta su uso en GPU NVIDIA o Apple Silicon.
- La cabeza MTP se ha eliminado, de modo que la decodificación especulativa con MTP no está disponible y hay que recurrir a un drafter externo.
- Validación limitada de la preservación del comportamiento: la métrica KL no se ha recogido y GSM8K es estructuralmente insensible a ella, por lo que no hay evidencia publicada sobre degradación en otras tareas.
- El fine-tune de etapa 2 movió la NLL de wikitext-2 en −0,0009 ± 0,0007 nats/token, dentro del ruido; no debe asumirse una mejora real atribuible a esa etapa.
- Parte de la brecha de decodificación frente a la variante int5 puede deberse a diferencias en la plantilla de chat usada en las pruebas, no al formato de cuantización.
- Riesgo de alucinación y sesgos: no hay datos específicos publicados para este derivado; como modelo cuantizado a 6 bits, hereda los sesgos del base y puede acumular error adicional, especialmente en tareas de generación abierta donde la perplejidad (7,083 en wikitext-2) es la única señal disponible.
- Idiomas soportados: no disponible, por lo que no puede confirmarse cobertura multilingüe ni calidad fuera del inglés.
- Licencia: uso comercial gratuito solo hasta 1.000.000 USD de ingresos recurrentes anuales; por encima se requiere la licencia Enterprise de UkisAI. La cuantización no relicencia los pesos.
- Es un derivado modificado, no hecho ni respaldado por UkisAI; el autor del modelo base no ha validado esta conversión.
- Fechas de creación y actualización del repositorio (2026-09-17) posteriores a la fecha actual de consulta; conviene verificarlas en el Hub antes de citar el modelo.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya reportado problemas o validaciones independientes.
- La búsqueda web no devolvió resultados relevantes sobre este modelo; los enlaces encontrados versaban sobre documentales de Netflix y no guardan relación con la ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hugypufy/Swift-Qwen3.8-27B-PARO-MXFP6
- Modelo base cuantizado: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Variante int5 del mismo autor: https://huggingface.co/hugypufy/Swift-Qwen3.8-27B-PARO-int5
- Rotaciones ParoQuant de origen: https://huggingface.co/z-lab/Qwen3.8-27B-PARO
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Texto de la licencia Swift Open License 1.0: https://ukisai.com/products/swift
- Rama con los kernels MXFP6: https://codeberg.org/hugypufy/radiance-vllm-mxfp4/src/branch/mxfp6
- Repositorio principal de radiance-vllm-mxfp4: https://codeberg.org/ggz14/radiance-vllm-mxfp4
