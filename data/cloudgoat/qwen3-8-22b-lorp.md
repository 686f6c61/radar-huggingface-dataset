# CloudGoat/Qwen3.8-22B-LoRP

## Resumen

Qwen3.8-22B-LoRP es una variante podada en profundidad del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario CloudGoat en Hugging Face. La poda reduce el número de capas del decodificador de 64 a 48, lo que deja el recuento de parámetros en 21.649.057.008 (aproximadamente 21,65 mil millones), frente a los 27 mil millones del modelo original. No se aplicó reentrenamiento ni destilación: los pesos son los originales con 16 capas eliminadas y las restantes renumeradas.

El interés de esta ficha es doble. Por un lado, documenta una técnica de compresión estructural (poda de capas iterativa de estilo LoRP) aplicada a un transformer híbrido con atención lineal y atención completa alternadas, y con una torre de visión intacta. Por otro lado, sirve como ejemplo de los compromisos reales de la poda sin recuperación: el propio autor advierte de una caída clara de calidad y lo presenta como punto de partida para procesos de *healing* o destilación, no como sustituto directo del modelo base.

La relevancia actual es práctica: permite estudiar cuánto rendimiento se pierde al recortar un cuarto de las capas de un modelo multimodal de ~27B y evaluar si merece la pena invertir en recuperación posterior. La licencia Apache-2.0 facilita ese trabajo experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal + atención completa alternadas), con torre de visión y cabeza MTP; poda de profundidad de 64 a 48 capas |
| Parametros totales | 21.649.057.008 (~21,65B) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura de transformer híbrido en la que se alternan capas de atención lineal con capas de atención completa (una de cada cuatro, en las posiciones 3, 7, …, 63). Esta variante conserva 48 capas: 16 de atención completa y 32 de atención lineal. La torre de visión y la cabeza MTP (multi-token prediction) permanecen sin cambios, por lo que el pipeline sigue siendo image-text-to-text.

El proceso de poda es una selección iterativa de capas en dos etapas al estilo LoRP: primero se eliminan 8 capas y después otras 8 sobre el modelo resultante de 56 capas. Se impusieron dos restricciones: nunca eliminar capas de atención completa y no retirar más de 4 capas consecutivas. Las capas originales eliminadas son `[8, 9, 10, 12, 13, 16, 17, 26, 28, 29, 30, 32, 45, 56, 57, 58]`. El `config.json` ajusta `num_hidden_layers` a 48 y filtra la lista `layer_types` en consecuencia. No hubo reentrenamiento, destilación ni ajuste fino posterior, de modo que no existe fase de RLHF o DPO asociada a esta variante.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3.8-27B.
- Procesamiento de imagen y texto (pipeline image-text-to-text), ya que la torre de visión no se ha modificado.
- Razonamiento y matemáticas: capacidad presumible del modelo base, aunque degradada por la poda y no validada en la información disponible.
- Generación de código: no hay evaluación específica publicada para esta variante.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no documenta idiomas.
- Cabeza MTP (multi-token prediction) conservada, potencialmente útil para decodificación especulativa, aunque no se documenta su uso en esta variante.

## Casos de uso

- Investigación sobre poda de modelos: sirve como punto de partida controlado para estudiar el impacto de eliminar 16 de 64 capas en un transformer híbrido, comparando perplejidad y acuerdo de predicciones frente al modelo de 64 capas.
- Recuperación mediante destilación o *healing*: al ser un checkpoint intermedio, encaja en pipelines que reentrenen parcialmente las capas conservadas para reducir la brecha de calidad (PPL 6,66 frente a 3,92 del original).
- Experimentos de ajuste fino con recursos limitados: sus ~21,65B de parámetros reducen el coste de memoria frente al modelo de 27B, lo que facilita probar recetas de fine-tuning antes de escalar al modelo completo.
- Evaluación de robustez multimodal tras compresión: al conservar la torre de visión intacta, permite medir cómo afecta la poda del decodificador a tareas image-text-to-text.
- Docencia y divulgación técnica: ejemplo reproducible de selección iterativa de capas con restricciones estructurales (preservar atención completa, límite de capas consecutivas).
- Prototipado interno no crítico: para flujos conversacionales o multimodales donde la calidad del modelo base no sea requisito y se priorice un checkpoint más pequeño, siempre con validación previa.

## Benchmarks y rendimiento

El autor publica una evaluación rápida sobre un conjunto pequeño de 8 textos y 502 tokens:

| Modelo | Capas | PPL | Acuerdo top-1 vs 64L | KL vs 64L |
|---|---|---|---|---|
| Qwen3.8-27B (original) | 64 | 3,92 | 100 % | 0 |
| Qwen3.8-22B-LoRP (esta variante) | 48 | 6,66 | 72,4 % | 0,93 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, 21,65B de parámetros en FP16 requieren aproximadamente 43 GB solo para pesos, lo que coincide con el tamaño del repo (43,3 GB); en BF16 sería similar.
- GPU recomendadas: para FP16/BF16 harían falta GPUs con 80 GB (A100 80GB, H100) o reparto multi-GPU; no hay datos oficiales de despliegue.
- GPU de consumo: no cabe en FP16 en tarjetas de 24 GB (RTX 4090) sin cuantización; no se han publicado pesos GGUF ni cuantizados para esta variante.
- Opciones de despliegue: transformers (librería declarada). vLLM, llama.cpp, Ollama o TGI no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (PPL, set del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-22B-LoRP | ~21,65B | no disponible | 6,66 | Apache-2.0 | Hugging Face (CloudGoat) |
| Qwen/Qwen3.8-27B (base) | ~27B | no disponible | 3,92 | Apache-2.0 | Hugging Face (Qwen) |
| Otras variantes podadas de Qwen3.8 | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el modelo base: esta variante pierde aproximadamente un 70 % de perplejidad adicional (de 3,92 a 6,66) y solo mantiene un 72,4 % de acuerdo top-1 con las predicciones del original.

## Limitaciones y advertencias

- Caída de calidad documentada por el propio autor: la perplejidad sube de 3,92 a 6,66 y el acuerdo top-1 cae al 72,4 %; no es un sustituto directo del modelo base.
- Sin reentrenamiento ni destilación: los pesos son los originales con capas eliminadas, por lo que no hay recuperación de capacidad tras la poda.
- Evaluación muy limitada: la única métrica publicada procede de 8 textos y 502 tokens, insuficiente para extrapolar a tareas reales.
- Riesgo de alucinación: no cuantificado; previsiblemente mayor que en el modelo base por la pérdida de capas.
- Idiomas y contexto: no documentados; no se puede garantizar el comportamiento multilingüe ni la ventana de contexto efectiva.
- Sesgos: no evaluados en la información disponible.
- Licencia Apache-2.0, que permite uso comercial, pero sin garantías de calidad para producción; el autor recomienda tratarlo como punto de partida para *healing*.
- Sin variantes cuantizadas publicadas, lo que complica el despliegue en hardware de consumo.
- Popularidad nula en el momento de la consulta (0 descargas, 0 likes), sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CloudGoat/Qwen3.8-22B-LoRP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
