# Launch80/Qwen3.8-27B-GPTQ-Int4-baked

## Resumen

El modelo `Qwen3.8-27B-GPTQ-Int4-baked`, desarrollado por Launch80, es una cuantización GPTQ INT4 del modelo base `Qwen3.8-27B` de Qwen, a partir del checkpoint ya cuantizado por SergiioB. Su principal innovación es que los pesos de `lm_head` y de la capa MTP (Multi-Token Prediction) se han cuantizado en disco en el mismo formato GPTQ INT4 simétrico con grupo 128 que el resto del cuerpo, en lugar de hacerlo en memoria mediante parches al arrancar. Esto permite que vLLM cargue el modelo de forma nativa, sin pasos adicionales, y que el estado en VRAM coincida exactamente con el contenido del checkpoint.

Con 27.78 mil millones de parámetros y un peso total de 17.1 GB, el modelo está optimizado para inferencia con decodificación especulativa en hardware Intel XPU, especialmente en tarjetas Arc Pro B65/B70. Las mediciones del autor indican que la cuantización de estos componentes mejora el rendimiento de lectura en memoria, con ganancias reportadas del +37% y +10% en una Arc Pro B65, manteniendo o incluso mejorando ligeramente la perplejidad frente al checkpoint original con cuantización RTN. La licencia Apache-2.0 permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capa MTP (Multi-Token Prediction), familia Qwen3.5 |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GPTQ INT4 simétrico, grupo 128 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El checkpoint es una cuantización de `Qwen3.8-27B`, un modelo de lenguaje de tipo transformer decoder-only. La model card no detalla el proceso de entrenamiento original del modelo base (composición del dataset, número de tokens, RLHF/DPO, etc.) por lo que no es posible describirlo aquí. Lo que sí se documenta es la capa MTP, un mecanismo de predicción de múltiples tokens que actúa como borrador en esquemas de decodificación especulativa.

Desde el punto de vista técnico, la innovación de este checkpoint es la cuantización en disco de dos componentes que en versiones anteriores se cuantizaban en GPU en el momento de arranque mediante parches: el `lm_head` (antes en fp16, 2.54 GB, ahora GPTQ INT4, 0.66 GB) y la capa de borrador MTP junto con su `fc` (antes en BF16, 0.85 GB, ahora GPTQ INT4, 0.22 GB). El resultado es que el contenido del archivo coincide exactamente con lo que se carga en VRAM, eliminando la necesidad de aplicar parches de cuantización durante el arranque.

## Capacidades

- Generación de texto en lenguaje natural, con capacidades de razonamiento matemático evaluadas mediante GSM8K.
- Decodificación especulativa con MTP: el modelo puede generar tokens de borrador que luego se verifican en bloque, lo que acelera la inferencia en hardware compatible.
- Carga nativa en vLLM: el archivo de configuración de cuantización (`quantize_config.json`) activa `lm_head: true` y elimina la exclusión de `mtp.*`, por lo que vLLM reconoce ambos componentes como cuantizados y los carga sin pasos manuales.
- Optimización para Intel XPU y tarjetas Arc Pro B65/B70, incluyendo soporte del prefijo de vocabulario de borrador (`P608_DRAFT_VOCAB`) para mejorar la tasa de aceptación.
- No se dispone de información verificada sobre capacidades de tool calling, visión, audio ni multilingüismo en la documentación proporcionada.

## Casos de uso

- Despliegue en servidores con Intel Arc Pro B65/B70: el modelo está específicamente optimizado para este hardware mediante vLLM y parches de la cookbook de SergiioB. Es adecuado para entornos donde se requiere aprovechar las unidades XPU con cuantización INT4.
- Servir modelos de 27B en producción con baja latencia: la decodificación especulativa basada en MTP reduce el número de verificación de tokens, y la cuantización en disco del `lm_head` y la capa de borrador minimiza el ancho de banda de lectura en VRAM. Puede desplegarse con `vllm serve`, lo que simplifica la puesta en marcha.
- Aplicaciones de razonamiento matemático y resolución de problemas: el modelo se ha evaluado en GSM8K, con un 91% de aciertos con un presupuesto amplio de tokens. Resulta útil en sistemas de tutoría o generación de ejercicios con respuesta explicada.
- Investigación sobre cuantización de componentes críticos en LLM: el autor proporciona en GitHub scripts y resultados en JSON que permiten reproducir las mediciones de perplejidad y error de capa. Es un banco de pruebas para estudiar el impacto de cuantizar `lm_head` o capas MTP en la calidad y el rendimiento.
- Integración en pipelines de vLLM para entornos con VRAM limitada: con un peso total de 17.1 GB y cuantización INT4, el modelo puede desplegarse en tarjetas con capacidad de ~16-24 GB, reduciendo costes frente a un modelo fp16 equivalente.
- Generación de texto general en aplicaciones que requieren licencia Apache-2.0: al ser un modelo abierto, puede usarse como base para asistentes conversacionales, agentes de soporte o generación de contenido, siempre que se respete la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K oficial, etc.) en la información disponible. La model card incluye mediciones propias del autor sobre un corpus de 13.027 tokens held-out y pruebas emparejadas en GSM8K. Se presentan a continuación los datos reportados, sin interpretaciones adicionales.

| Gate | Este checkpoint | Patched stock (RTN head) | Cabeza fp16 |
|---|---|---|---|
| Perplejidad (13,027 tokens, spec off) | **6.133** | 6.144 | 6.093 |
| GSM8K n=100, presupuesto 768 tokens | 82 (18 truncados) | 90 (11 truncados) | 88 (14 truncados) |
| GSM8K n=100, presupuesto 1536 tokens, emparejado | **91** (8 truncados) | 89 (10 truncados) | — |
| Spec-on vs spec-off (greedy) | 8/8 idénticos | — | — |
| BetterBench decode, MTP k=6 | 71.8 | 71.8 | — |

Error de salida por capa en activaciones held-out (GPTQ en disco vs RTN de los parches):

| Tensor | GPTQ (este) | RTN (parches) |
|---|---|---|
| `lm_head` | 3.64% | 7.58% |
| `mtp.fc` | 5.68% | 11.36% |
| draft q / k / v | 2.20 / 5.26 / 4.24% | 4.47 / 10.73 / 8.40% |
| draft o_proj | 5.31% | 12.34% |
| draft gate / up / down | 3.02 / 4.72 / 5.67% | 6.51 / 9.78 / 11.23% |

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 17.1 GB. Dado que los pesos en disco se cargan tal cual en VRAM, la inferencia requerirá al menos esa cantidad de memoria, más el espacio para activaciones y KV cache. Se estima un rango práctico de 16-20 GB para funcionamiento básico con vLLM.
- GPU recomendadas: Intel Arc Pro B65/B70, por las optimizaciones y parches específicos documentados. No se mencionan explícitamente tarjetas NVIDIA, aunque vLLM con GPTQ INT4 es compatible con CUDA.
- En GPUs de consumo: probablemente cabrá en tarjetas con 24 GB de VRAM (RTX 4090, RTX 3090), pero esto no está verificado en la información proporcionada.
- Opciones de despliegue: `vllm serve` con `--quantization gptq --dtype float16 --speculative-config '{"method":"mtp","num_speculative_tokens":6}'` en Intel XPU. Requiere tres parches de la cookbook de SergiioB para vLLM 0.27.2-xpu (MTP nightly, MTP boundary, y `patch_gdn_mixed_split_v5.py`). No se indica soporte para llama.cpp u Ollama.
- Latencia y throughput: no se aportan cifras absolutas. El autor reporta mejoras relativas: +37% tras cuantizar `lm_head`, +10% tras cuantizar la capa de borrador, y +6% adicional con el prefijo de vocabulario de borrador, en una Arc Pro B65.

## Comparativa con modelos similares

La comparación más directa es con las variantes del mismo checkpoint base.

| Modelo | Parametros | Cuantizacion | Perplejidad (held-out) | GSM8K (1536 tokens) | BetterBench |
|---|---|---|---|---|---|
| Launch80/Qwen3.8-27B-GPTQ-Int4-baked | 27.78B | GPTQ INT4 (lm_head y MTP en disco) | 6.133 | 91 | 71.8 |
| SergiioB/Qwen3.8-27B-GPTQ-Int4-sym-G128-MTP-BF16 | 27.78B | GPTQ INT4 cuerpo, RTN lm_head y MTP en boot | 6.144 | 89 | 71.8 |
| Configuracion con cabeza fp16 | 27.78B | Cuerpo GPTQ INT4, lm_head fp16 | 6.093 | — | — |

Las diferencias entre este checkpoint y la versión patched stock son pequeñas. El modelo de Launch80 mejora la perplejidad y el resultado en GSM8K con presupuesto amplio, con un error de cuantización menor en `lm_head` y capas MTP, aunque las diferencias no son estadísticamente significativas según el autor (McNemar 0.50 en GSM8K emparejado). No se dispone de comparaciones con otros modelos de la misma categoría más allá de estas variantes.

## Limitaciones y advertencias

- No se han publicado benchmarks estándar (MMLU, HumanEval, etc.) en la información proporcionada, por lo que la comparación con otros modelos de 27B es limitada.
- La cabeza GPTQ tiende a hacer al modelo ligeramente más verboso. En GSM8K con presupuesto de 768 tokens, la caída de 90 a 82 aciertos se debe a truncamientos de respuestas, no a respuestas incorrectas. En despliegues con presupuestos de generación ajustados, puede degradar el rendimiento.
- El modelo requiere parches específicos de vLLM para Intel XPU. Sin estos parches, el motor puede fallar bajo carga concurrente. Los parches no tocan los pesos, pero son necesarios para un funcionamiento robusto.
- La decodificación especulativa con MTP en vLLM depende de la versión y la configuración. Si se usa el prefijo de vocabulario de borrador, se necesita la versión correcta del parche; de lo contrario, el rendimiento puede caer hasta un 11%.
- No se documentan sesgos específicos en la información disponible, pero al ser un modelo de lenguaje general, existe riesgo inherente de alucinación, sesgos y generación de contenido no deseado.
- La licencia Apache-2.0 permite uso comercial, siempre que se conserven los avisos de licencia y se indiquen los cambios realizados. El modelo base es de Qwen; el checkpoint derivado es de Launch80 y SergiioB.
- No se especifica la longitud de contexto ni los idiomas soportados, por lo que no se puede garantizar el comportamiento multilingüe ni el manejo de contextos muy largos.

## Enlaces

- HuggingFace: https://huggingface.co/Launch80/Qwen3.8-27B-GPTQ-Int4-baked
- Modelo base (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint base de SergiioB: https://huggingface.co/SergiioB/Qwen3.8-27B-GPTQ-Int4-sym-G128-MTP-BF16
- Repositorio GitHub de Launch80 (mediciones y scripts): https://github.com/launch80/B65
- Cookbook de SergiioB para Intel Arc Pro B70: https://github.com/SergiioB/intel-arc-pro-b70-inference-cookbook
- Página de run de BetterBench (auto-reportada, puede expirar): https://launch80.com/a/2c20c65e-f477-4621-98d9-7df1b16646fe
