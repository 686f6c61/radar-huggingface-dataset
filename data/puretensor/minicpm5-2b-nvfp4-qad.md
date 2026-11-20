# puretensor/MiniCPM5-2B-NVFP4-QAD

## Resumen

MiniCPM5-2B-NVFP4-QAD es una cuantización NVFP4 (W4A4, pesos y activaciones a 4 bits) del modelo openbmb/MiniCPM5-2B, publicada por el usuario puretensor. El checkpoint aplica GPTQ seguido de una destilación consciente de cuantización (QAD, quantization-aware distillation) para recuperar parte de la calidad perdida al cuantizar tanto pesos como activaciones. El resultado es un archivo de 2,18 GB frente a los 5,03 GB del BF16 original, con un tamaño total de 2.516.756.480 parámetros.

El modelo está pensado para servir con vLLM sobre su kernel nativo FP4 (FlashInfer CUTLASS), lo que aporta ventajas de throughput bajo alta concurrencia (hasta 1,50x frente a BF16 con 32 peticiones concurrentes). A cambio, la calidad medida es inferior tanto al BF16 como al hermano solo-pesos puretensor/MiniCPM5-2B-NVFP4A16: 3,1 puntos menos en MMLU y 7,3 puntos menos en GSM8K servido respecto a BF16.

Se trata de una release de prueba, no afiliada ni respaldada por OpenBMB, con licencia Apache-2.0 heredada del modelo base. Es relevante para quienes priorizan throughput en producción sobre calidad máxima, y conviene tratarla como un experimento reproducible más que como un reemplazo directo del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (llama), 42 bloques; cuantización NVFP4 sobre capas `Linear` |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (pesos E2M1 4-bit, activaciones E2M1 4-bit, escalas FP8 E4M3 por grupo de 16); embeddings, cabeza de salida y normas en BF16 |
| Idiomas soportados | no disponible (solo se evaluó en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors `nvfp4-pack-quantized` |

## Arquitectura y entrenamiento

El modelo base es un transformer tipo llama de 42 bloques. La cuantización se aplica a todas las capas `Linear` de esos bloques en formato NVFP4: pesos y activaciones de entrada a 4 bits en formato E2M1, con escalas FP8 E4M3 por grupo de 16 elementos. Los embeddings de tokens, la cabeza de salida y todas las normas se mantienen en BF16. El pipeline consta de dos etapas: primero GPTQ (`dampening_frac` 0,01, `actorder` estático) sobre las primeras 512 muestras de `mlabonne/open-perfectblend` con hasta 2.048 tokens por muestra; después, una destilación consciente de cuantización donde el modelo BF16 actúa como profesor y la pérdida es divergencia KL sobre distribuciones del siguiente token, entrenando solo los pesos cuantizados con escalas fijas y gradientes que atraviesan el redondeo de 4 bits.

El presupuesto de destilación fue de 1.451 pasos y 1,69M de tokens, con AdamW, learning rate 5e-6 con warm-up y decaimiento coseno. Los datos de destilación son `mlabonne/open-perfectblend` en formato chat desde la fila 20.000, excluyendo las fuentes de matemáticas (MetaMathQA, Orca-Math) para mantener GSM8K como test limpio. Herramientas empleadas: llm-compressor 0.15.0, compressed-tensors 0.20.1, transformers 5.21.0 y torch 2.14.1. Tras el entrenamiento, los pesos se ajustan a la rejilla de 4 bits, se guardan y se recargan; todas las métricas publicadas se midieron sobre el archivo recargado.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla de chat aplicable mediante `apply_chat_template`.
- Razonamiento y matemáticas básicas, con calidad degradada respecto a BF16 (GSM8K servido: 64,82 frente a 72,10).
- Conocimiento general medido en MMLU (54,17 en modo offline).
- Inferencia de alto throughput con vLLM sobre kernel nativo FP4 (FlashInfer CUTLASS).
- Compatibilidad con Transformers para verificación (aritmética 4-bit emulada, no apta para velocidad).
- Soporte de tool calling, agentes, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: no evaluadas; solo se midieron benchmarks en inglés.

## Casos de uso

- Servicio de chat a alta concurrencia: con 32 peticiones concurrentes el modelo alcanza 1,50x el throughput de BF16 en la misma GPU, lo que lo hace adecuado para endpoints conversacionales con mucho tráfico donde una pérdida de 3 puntos en MMLU sea aceptable.
- Prototipado y pruebas de integración con vLLM: al ocupar 2,18 GB, permite levantar un servidor de pruebas en una sola GPU sin reservar los 5,03 GB del BF16, útil para validar pipelines antes de pasar a producción.
- Clasificación y resumen de texto en inglés: tareas donde la degradación de GSM8K no afecta y el coste por token importa más que la precisión absoluta.
- Generación de respuestas en asistentes internos: la ventana de contexto no está documentada, pero el modelo conserva la plantilla de chat del base y puede gestionar turnos conversacionales estándar.
- Evaluación comparativa de técnicas de cuantización: sirve como referencia reproducible de GPTQ + QAD frente a cuantización solo-pesos, con métricas publicadas de KL y McNemar.
- Despliegue en estaciones con GPU Blackwell: el checkpoint está validado en una GPU de estación NVIDIA Blackwell (compute capability 12.0) con vLLM 0.34.0, por lo que encaja en entornos de desarrollo con ese hardware.
- Fine-tuning ligero o experimentación académica: la licencia Apache-2.0 y el tamaño reducido facilitan su uso en investigación sobre cuantización.

## Benchmarks y rendimiento

| Metrica | BF16 | 4-bit sin destilacion | Este checkpoint |
|---|---:|---:|---:|
| MMLU, accuracy (14.042 preguntas, offline) | 57,29 | 51,03 | 54,17 |
| GSM8K, exact match (1.319 problemas, offline) | 72,48 | 59,89 | 66,03 |
| GSM8K servido por vLLM en kernel FP4 nativo | 72,10 | 58,15 | 64,82 |
| KL media frente a BF16, WikiText-2 (131.072 tokens) | 0 | 0,164 | 0,154 |
| KL media frente a BF16, chat (224.534 tokens) | 0 | 0,201 | 0,164 |
| Mismo token top que BF16, WikiText-2 / chat | 100% | 80,1% / 83,1% | 80,7% / 84,0% |

| Comparativa con hermano solo-pesos (vLLM 0.34.0, GPU Blackwell, 256 tokens greedy) | BF16 | Solo-pesos | Este checkpoint |
|---|---:|---:|---:|
| Kernel vLLM | — | weight-only FP4 (Marlin) | native FP4 (FlashInfer CUTLASS) |
| MMLU (offline) | 57,29 | 54,60 | 54,17 |
| GSM8K (servido) | 72,10 | 68,23 | 64,82 |
| Throughput, 1 stream | 1,00x | 1,40x | 1,36x |
| Throughput, 8 concurrentes | 1,00x | 1,53x | 1,55x |
| Throughput, 32 concurrentes | 1,00x | 1,28x | 1,50x |

Las pruebas de significación con McNemar indican que la destilación mejora de forma significativa frente a no destilar (MMLU p = 1e-14, GSM8K p = 2e-5), pero el checkpoint sigue siendo significativamente peor que BF16 (MMLU p = 2e-16, GSM8K p = 6e-7). Los resultados offline emulan la aritmética 4-bit y son optimistas: el GSM8K servido es 1 a 3 puntos inferior. MMLU no se midió en el modelo servido.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,2 GB solo para pesos; con overhead de runtime y KV cache, un despliegue práctico requiere al menos 4-6 GB según contexto y concurrencia (estimación, no publicada).
- GPU recomendadas: NVIDIA Blackwell (compute capability 12.0) para el kernel nativo FP4; el autor validó en una GPU de estación Blackwell.
- Compatibilidad con GPUs consumer: no confirmada; el kernel nativo FP4 requiere hardware Blackwell, por lo que en GPUs anteriores habría que recurrir a rutas alternativas no documentadas.
- Opciones de despliegue: vLLM (recomendado, `vllm serve puretensor/MiniCPM5-2B-NVFP4-QAD`); Transformers con `compressed-tensors` solo para verificación, con aritmética emulada.
- Latencia y throughput: 1,36x en un solo stream, 1,55x con 8 concurrentes y 1,50x con 32 concurrentes frente a BF16, medido en una GPU Blackwell con generaciones greedy de 256 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (MMLU/GSM8K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| puretensor/MiniCPM5-2B-NVFP4-QAD | 2,52B | no disponible | 54,17 / 64,82 (servido) | Apache-2.0 | Hugging Face |
| puretensor/MiniCPM5-2B-NVFP4A16 (solo-pesos) | 2,52B | no disponible | 54,60 / 68,23 (servido) | Apache-2.0 | Hugging Face |
| openbmb/MiniCPM5-2B (BF16) | 2,52B | no disponible | 57,29 / 72,10 (servido) | Apache-2.0 | Hugging Face |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Calidad inferior a BF16 y al hermano solo-pesos, con diferencias estadísticamente significativas en MMLU y GSM8K.
- La destilación fue corta (unos 20 minutos en una GPU); el autor reconoce que una ejecución más larga probablemente recuperaría más calidad.
- Una sola ejecución de entrenamiento, una sola muestra de calibración y sin semillas repetidas: los resultados no están validados por réplicas.
- Solo se evaluó en inglés; no hay evaluación de seguridad, multilingüe ni de contexto largo sobre el modelo cuantizado.
- Los ratios de throughput provienen de una única GPU y una única carga de trabajo; pueden variar en otros entornos.
- Los resultados offline emulan la aritmética 4-bit y son optimistas para activaciones de 4 bits; conviene fiarse de la fila servida.
- Release de prueba no afiliada ni respaldada por OpenBMB.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/puretensor/MiniCPM5-2B-NVFP4-QAD
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Hermano solo-pesos: https://huggingface.co/puretensor/MiniCPM5-2B-NVFP4A16
- Dataset de calibración/destilación: https://huggingface.co/datasets/mlabonne/open-perfectblend
- llm-compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
