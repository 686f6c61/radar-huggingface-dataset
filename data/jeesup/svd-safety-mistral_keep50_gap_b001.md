# Jeesup/svd-safety-mistral_keep50_gap_b001

## Resumen

Este modelo es un checkpoint experimental derivado de Mistral-7B-Instruct-v0.2, comprimido mediante SVD-LLM hasta conservar el 50,1% de los parámetros densos. Tras la compresión, se restauró un 0,1% del presupuesto de parámetros utilizando componentes de descomposición en valores singulares seleccionados por la regla «gap». El autor, Jeesup, lo publica como parte de un estudio sobre cómo la compresión SVD afecta al comportamiento de seguridad de los modelos de lenguaje y qué regla de selección repara mejor ese daño. No es un modelo de propósito general, sino un artefacto de investigación para medir el equilibrio entre seguridad y utilidad bajo compresión. La arquitectura es Transformer, basada en Mistral-7B-Instruct-v0.2, con 7.241.732.096 parámetros totales. La longitud de contexto no está disponible en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Mistral-7B-Instruct-v0.2) |
| Parámetros totales | 7.241.732.096 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Transformer basado en el checkpoint Mistral-7B-Instruct-v0.2, que emplea atención multi-cabeza y se entrenó originalmente con instrucciones. La compresión se realizó con SVD-LLM, una técnica que descompone las matrices de pesos en valores singulares y elimina una fracción de ellos. En este caso se eliminó el 49,90% de los parámetros, dejando un modelo al 50,1% de la densidad original. Posteriormente, se restauró un 0,1% de los parámetros densos utilizando componentes SVD seleccionados mediante la regla «gap», con un total de 1582 componentes restaurados y 0 componentes intercambiados. Los detalles del conjunto de datos de entrenamiento no están disponibles. La innovación principal es el estudio empírico de cómo la selección de componentes SVD afecta a la seguridad y a la utilidad del modelo comprimido.

## Capacidades

- Generación de texto en el estilo del modelo base, aunque la compresión degrada la calidad y la seguridad.
- No soporta tool calling, ni visión, ni audio.
- Es un modelo de investigación para evaluar tasas de éxito de ataques (ASR) y over-refusal.
- Puede medir la perplejidad en WikiText-2 como indicador de utilidad.
- No está diseñado para uso conversacional general.

## Casos de uso

- Investigación sobre seguridad en modelos comprimidos: se puede usar para medir cómo la compresión SVD afecta la resistencia a ataques adversariales, comparando las tasas de éxito (ASR) con el modelo base.
- Evaluación de reglas de selección de componentes: permite comparar la regla «gap» con otras reglas dentro del mismo grid experimental.
- Estudio de over-refusal: sirve para analizar cómo el modelo rechaza peticiones legítimas tras la compresión, usando métricas como macro over-refusal.
- Desarrollo de métodos de reparación de seguridad: se puede utilizar como punto de partida para probar intervenciones que restauren el comportamiento seguro.
- Benchmarking de eficiencia paramétrica: permite estudiar la relación entre la fracción de parámetros restaurados y el rendimiento en tareas de seguridad.
- Análisis de interpretabilidad: se puede emplear para identificar qué componentes SVD están asociados con comportamientos seguros o inseguros.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (HarmBench judge) | 0,2827 |
| StrongREJECT ASR (HarmBench judge) | 0,3163 |
| Macro over-refusal (WildGuard) | 0,1484 |
| WikiText-2 perplexity | 12,7494 |

No se han publicado resultados comparativos con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión FP16: aproximadamente 16-20 GB (pesos de 7.24B en FP16 más overhead). Estimación orientativa.
- VRAM estimada con cuantización 4-bit: aproximadamente 5-7 GB. Estimación orientativa.
- GPU recomendadas: A100 40GB, H100, RTX 4090 (24GB) para FP16; GPUs de consumo con 8-12GB para cuantización.
- Opciones de despliegue: transformers, vLLM, llama.cpp, Ollama, TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información comparativa con modelos similares en los datos proporcionados.

## Limitaciones y advertencias

- No es un modelo de propósito general; es un artefacto experimental.
- La compresión degrada deliberadamente la seguridad; no usar en producción.
- Riesgo de alucinación y respuestas inseguras.
- No se han publicado datos de idiomas soportados.
- Licencia Apache 2.0, pero el modelo base no incluye licencia de redistribución (según la model card).
- Evaluar siempre el modelo antes de sacar conclusiones.

## Enlaces

- https://huggingface.co/Jeesup/svd-safety-mistral_keep50_gap_b001
