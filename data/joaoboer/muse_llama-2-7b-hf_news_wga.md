# JoaoBoer/muse_Llama-2-7b-hf_News_WGA

## Resumen

`muse_Llama-2-7b-hf_News_WGA` es un modelo derivado de `muse-bench/MUSE-news_target` (una variante de Llama 2 de 7B ajustada para el benchmark MUSE-News) al que se le ha aplicado un proceso de *machine unlearning* mediante el algoritmo WGA (Weight Gradient Ascent). Lo desarrolla el usuario JoaoBoer en el contexto del proyecto Speculative-Decoding-Unlearning, y su propósito no es el uso general como asistente, sino servir como línea base de desaprendizaje de pesos y como modelo borrador en pipelines de decodificación especulativa.

El modelo hereda la arquitectura Transformer decoder-only de Llama 2, con 6.738.415.616 parámetros totales (aproximadamente 6,7B) y pesos en formato safetensors. Su función principal es demostrar que es posible eliminar selectivamente conocimiento factual (en este caso, noticias del conjunto *forget* de MUSE-News) manteniendo al mismo tiempo capacidades generales de generación de texto.

Es relevante en el ámbito de la investigación en privacidad y cumplimiento normativo (derecho al olvido), ya que proporciona un artefacto reproducible con hiperparámetros documentados y resultados de evaluación del benchmark MUSE, tanto en modo greedy como con muestreo sobre cinco semillas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion estandar de Llama 2 via herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un Transformer decoder-only con atención causal, normalización RMSNorm, activaciones SwiGLU y RoPE para codificación posicional. El modelo parte de `muse-bench/MUSE-news_target`, un checkpoint de Llama 2 7B ajustado sobre el conjunto de noticias del benchmark MUSE, y se le aplica un desaprendizaje de pesos con WGA usando el framework [open-unlearning](https://github.com/locuslab/open-unlearning).

Los hiperparámetros del método están documentados en la model card: `gamma: 1.0`, `alpha: 1.0`, `retain_loss_type: NLL`, `beta: 1.0`. El entrenamiento se realiza sobre el conjunto *forget* de MUSE-News, con una pérdida de retención basada en verosimilitud negativa (NLL) para preservar el conocimiento que no debe olvidarse. La configuración completa de entrenamiento está disponible en `.hydra/config.yaml` dentro del repositorio. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset más allá de la referencia a MUSE-News.

## Capacidades

- Generación de texto autoregresiva, heredada del checkpoint base Llama 2 7B.
- Desaprendizaje selectivo de conocimiento factual sobre noticias del conjunto *forget* de MUSE-News (objetivo principal del modelo).
- Evaluación de retención de conocimiento general mediante las métricas `retain_knowmem_ROUGE` y `retain_verbmem_ROUGE` del benchmark MUSE.
- Uso como modelo borrador (*draft model*) en decodificación especulativa dentro del proyecto Speculative-Decoding-Unlearning.
- Compatibilidad con `text-generation-inference` y endpoints compatibles según los tags del repositorio.
- Soporte de tool calling, agentes, visión, audio o modo *thinking*: no disponible (no se declara ninguna de estas capacidades en la información proporcionada).
- Capacidades multilingües: no disponible (los idiomas no están declarados).

## Casos de uso

- Investigación en *machine unlearning*: el modelo sirve como línea base reproducible para comparar algoritmos de desaprendizaje de pesos (WGA frente a otras técnicas) sobre el benchmark MUSE-News, con hiperparámetros y resultados ya publicados.
- Evaluación de decodificación especulativa con modelos desaprendidos: se integra como modelo borrador en el proyecto Speculative-Decoding-Unlearning para medir cómo afecta el desaprendizaje a la tasa de aceptación de tokens especulativos.
- Auditoría de privacidad y derecho al olvido: permite estudiar empíricamente si un modelo de 7B retiene o no información factual concreta tras el desaprendizaje, usando las métricas `extraction_strength` y `privleak` del benchmark MUSE.
- Estudio del equilibrio olvido-retención: los resultados de `forget_knowmem_ROUGE` (0,5315 en greedy) frente a `retain_knowmem_ROUGE` (0,4420 en greedy) permiten analizar el compromiso entre eliminar conocimiento objetivo y preservar capacidades generales.
- Reproducibilidad de experimentos académicos: al incluir `.hydra/config.yaml` y los directorios `evals/` y `evals_sampled_s0`…`s4`, facilita la replicación de resultados con distintas semillas y configuraciones de muestreo.
- Desarrollo de pipelines de generación de texto con requisitos de olvido selectivo: puede desplegarse vía `text-generation-inference` en entornos donde se necesite un modelo de 7B con conocimiento de noticias parcialmente eliminado, por ejemplo en prototipos de sistemas que deban cumplir solicitudes de borrado de datos.

## Benchmarks y rendimiento

Resultados del benchmark MUSE-News reportados en la model card del autor:

| Metrica | Greedy | Muestreo (media ± sd, 5 semillas) |
|---|---|---|
| extraction_strength | 0,0194 | – |
| forget_knowmem_ROUGE | 0,5315 | 0,3379 ± 0,0320 |
| forget_verbmem_ROUGE | 0,0881 | 0,0351 ± 0,0006 |
| privleak | 89,1268 | – |
| retain_knowmem_ROUGE | 0,4420 | 0,2827 ± 0,0211 |

No se han publicado en la información disponible resultados de benchmarks estándar de capacidad general (MMLU, HumanEval, GSM8K u otros) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 16 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB; en 4 bits: en torno a 4-5 GB (estimaciones a partir del tamaño de parámetros, no verificadas en la información disponible).
- GPU recomendadas: A100, H100 o L40S para despliegue en producción con FP16 y lotes grandes; RTX 4090 (24 GB) o RTX A6000 (48 GB) para inferencia en FP16 con comodidad.
- Cabe en GPU de consumo: sí, en GPUs con 16 GB o más en FP16 (RTX 4080, RTX 4090); en cuantización de 4 bits cabe en GPUs de 8 GB.
- Opciones de despliegue: `text-generation-inference` (declarado en los tags), `transformers` con `AutoModelForCausalLM`, y herramientas compatibles con Llama 2 como llama.cpp u Ollama previa conversión de pesos (no verificadas en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| muse_Llama-2-7b-hf_News_WGA (este) | 6,74B | no disponible | Desaprendizaje WGA sobre MUSE-News | llama2 | Hugging Face (27 descargas) |
| muse-bench/MUSE-news_target | ~7B (Llama 2 7B) | no disponible | Checkpoint objetivo del benchmark MUSE-News, sin desaprender | llama2 | Hugging Face (modelo base) |
| Llama 2 7B (Meta) | 6,74B | 4.096 tokens | Modelo base de propósito general | llama2 | Hugging Face, amplia adopción |
| Otros modelos del benchmark MUSE | no disponible | no disponible | Variantes de desaprendizaje (NPO, GradDiff, etc.) | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo frente a otras variantes de desaprendizaje en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado para investigación en desaprendizaje, no como asistente de propósito general; su calidad de generación tras el proceso WGA puede degradarse respecto al checkpoint original.
- Los valores de `forget_knowmem_ROUGE` (0,5315 en greedy) indican que el olvido no es completo: parte del conocimiento objetivo sigue siendo recuperable, lo que limita su uso en escenarios de privacidad estrictos.
- `privleak` de 89,1268 en modo greedy sugiere una fuga de privacidad considerable según la métrica del benchmark; debe interpretarse con cautela y no como garantía de anonimización.
- Riesgo de alucinación inherente a los modelos Llama 2 7B, potencialmente agravado por el desaprendizaje de pesos.
- Idiomas soportados no declarados; el ajuste sobre MUSE-News probablemente sesga el modelo hacia el inglés periodístico, aunque este dato no está confirmado en la información disponible.
- Licencia Llama 2 Community License: impone restricciones de uso comercial (umbral de 700 millones de usuarios mensuales, obligaciones de atribución y cláusulas de uso aceptable); revisar antes de cualquier despliegue en producción.
- Longitud de contexto no declarada en la model card; se asume la de Llama 2 7B (4.096 tokens) pero no está verificado.
- Modelo con muy baja adopción (27 descargas, 0 likes) y sin validación externa; los resultados deben tratarse como preliminares.
- Los resultados de evaluación con muestreo varían notablemente entre semillas (por ejemplo, `forget_knowmem_ROUGE` de 0,3379 ± 0,0320), lo que indica alta varianza en las métricas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoaoBoer/muse_Llama-2-7b-hf_News_WGA
- Modelo base: https://huggingface.co/muse-bench/MUSE-news_target
- Dataset MUSE-News: https://huggingface.co/datasets/muse-bench/MUSE-News
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Llama 2 (Meta): https://huggingface.co/meta-llama/Llama-2-7b-hf
