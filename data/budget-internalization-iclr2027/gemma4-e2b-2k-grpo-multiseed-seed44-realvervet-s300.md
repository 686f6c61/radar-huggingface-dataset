# budget-internalization-iclr2027/gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s300

## Resumen

`gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s300` es un ajuste fino por aprendizaje por refuerzo (GRPO) del modelo multimodal `google/gemma-4-E2B-it`, desarrollado por el grupo anónimo `budget-internalization-iclr2027` como parte de una submission a ICLR 2027. El objetivo del entrenamiento es que el modelo internalice un presupuesto de generación fijo de 2.048 tokens al resolver problemas de matemáticas, de modo que aprenda a razonar de forma eficiente dentro de esa cota en lugar de producir cadenas de pensamiento arbitrariamente largas.

Se trata de un experimento de ablación de semillas: el mismo recetario se repite con tres semillas (42, 43 y 44), y este repositorio corresponde a la semilla 44 en su checkpoint final (paso 300). El modelo conserva la arquitectura y el pipeline `any-to-any` del base, con 5.123.178.051 parámetros totales según los pesos en safetensors y un tamaño de repositorio de 20,5 GB.

Su relevancia es doble: por un lado, explora cómo el RL con recompensa binaria de corrección puede enseñar al modelo a gestionar su propio presupuesto de tokens; por otro, publica todos los checkpoints intermedios y las réplicas por semilla, lo que permite estudiar la varianza del entrenamiento y la reproducibilidad del método. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de `google/gemma-4-E2B-it`); detalles internos no disponibles |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32; compatible con cuantizacion estandar via transformers/vLLM) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (hereda la licencia de Gemma 4) |
| Formato de pesos | safetensors (F32), libreria transformers |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un modelo multimodal con pipeline `any-to-any` (entrada y salida de imagen y texto). Sobre esa base se aplica un ajuste fino con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. La recompensa es binaria: se extrae la respuesta del bloque `\boxed{}` y se compara con la solución correcta.

Los datos de entrenamiento provienen del dataset `agentica-org/DeepScaleR-Preview-Dataset` (problemas de matemáticas), con un máximo de 3 épocas. La configuración usa 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 3e-6 y 10 pasos de warmup, durante 300 pasos. El presupuesto de generación (`max_new_tokens`) se fija en 2.048: las respuestas que alcanzan la cota se truncan y se puntúan tal cual, lo que empuja al modelo a internalizar ese límite. El prompt de entrenamiento pide razonamiento paso a paso y respuesta dentro de `\boxed{}`.

## Capacidades

- Razonamiento matemático con respuesta final extraíble mediante `\boxed{}`.
- Generación de cadenas de razonamiento acotadas a un presupuesto de 2.048 tokens.
- Capacidades multimodales heredadas del base (`image-text-to-text`, pipeline `any-to-any`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado específicamente; el razonamiento paso a paso está integrado en el prompt de entrenamiento.
- Capacidades multilingües: no disponible.
- Modo thinking: el modelo produce razonamiento explícito paso a paso como parte de su salida.

## Casos de uso

- Resolución de problemas matemáticos con cota de tokens: el modelo está entrenado para producir soluciones dentro de 2.048 tokens, lo que lo hace adecuado para pipelines donde el coste por consulta está acotado y se necesita una respuesta verificable en `\boxed{}`.
- Evaluación de eficiencia de razonamiento: sirve como referencia para estudiar cuánta precisión se pierde al limitar la longitud de la cadena de pensamiento, comparando con los checkpoints de las semillas 42 y 43.
- Generación de datos sintéticos de matemáticas: puede producir soluciones paso a paso con respuesta final estructurada, útiles para aumentar datasets de entrenamiento.
- Investigación en RL para LLM: al publicarse todos los checkpoints intermedios (pasos 170, 230, 300), permite analizar la curva de aprendizaje y la varianza entre semillas.
- Sistemas de tutoría automática: el formato de razonamiento paso a paso con respuesta final facilita la verificación automática de la solución del estudiante.
- Integración en pipelines de evaluación con vLLM: el modelo se puede servir con `vllm serve` para pruebas de throughput y latencia en entornos de investigación.
- Experimentos multimodales: al heredar el pipeline `any-to-any`, puede emplearse en tareas que combinen imagen y texto, aunque el ajuste fino se centró en matemáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no se incluyen los valores numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5.123 millones de parámetros en F32, los pesos ocupan aproximadamente 20,5 GB; en BF16 serían unos 10,2 GB y en cuantización de 8 bits unos 5,1 GB (estimaciones a partir del recuento de parámetros, no confirmadas por el autor).
- GPU recomendadas: A100 (40/80 GB) o H100 para inferencia en precisión completa; una RTX 4090 (24 GB) podría alojar los pesos en BF16 o cuantizados, aunque el contexto y el batch condicionan el uso real.
- Cabe en GPU de consumo: probablemente sí en BF16 o cuantizado en GPUs con 16-24 GB, sujeto a verificación empírica.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), vLLM (`vllm serve`). Otras opciones como llama.cpp, Ollama o TGI no están documentadas para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s300 | 5,12 B | no disponible | GRPO sobre Gemma 4 E2B, presupuesto 2k | Apache 2.0 | Hugging Face |
| gemma4-e2b-2k-grpo-multiseed-seed42-apttoad-s300 | no disponible | no disponible | Mismo recetario, semilla 42 | Apache 2.0 | Hugging Face |
| gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s300 | no disponible | no disponible | Mismo recetario, semilla 43 | Apache 2.0 | Hugging Face |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | Modelo base multimodal | Licencia Gemma 4 | Hugging Face |

## Limitaciones y advertencias

- Modelo de investigación: es un checkpoint de una submission anónima a ICLR 2027, sin validación externa ni resultados de benchmarks publicados en la información disponible.
- Sesgos conocidos: no documentados; al heredar el base, puede reproducir sesgos de Gemma 4.
- Riesgo de alucinación: presente como en cualquier LLM; la recompensa binaria de corrección matemática no elimina errores en otros dominios.
- Limitación de contexto: el entrenamiento impone un presupuesto de 2.048 tokens de generación; respuestas más largas se truncan, lo que puede degradar tareas que requieran razonamientos extensos.
- Idiomas: no se especifican los idiomas soportados; el entrenamiento se centró en problemas de matemáticas, presumiblemente en inglés.
- Licencia: Apache 2.0, pero hereda la licencia de Gemma 4; conviene revisar los términos de `ai.google.dev/gemma/docs/gemma_4_license` para uso comercial.
- Sin datos de uso en producción ni de latencia/throughput; no recomendado como modelo principal sin evaluación previa en el dominio objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s300
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Checkpoint semilla 42: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-2k-grpo-multiseed-seed42-apttoad-s300
- Checkpoint semilla 43 (paso 170): https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s170
- Checkpoint semilla 43 (paso 300): https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s300
- Checkpoint semilla 44 (paso 230): https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s230
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
