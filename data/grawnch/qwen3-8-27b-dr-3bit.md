# Grawnch/Qwen3.8-27B-DR-3bit

## Resumen

Qwen3.8-27B-DR-3bit es una cuantización de 3 bits del modelo Qwen/Qwen3.8-27B, publicada por el usuario Grawnch en Hugging Face. Se trata de un checkpoint derivado que reduce el peso del modelo original desde aproximadamente 55,5 GB en 16 bits hasta unos 10,7 GB efectivos, con un ancho de bits medio de 3,17 bpw. El objetivo es permitir el despliegue del modelo base en hardware con mucha menos memoria sin recurrir a kernels CUDA personalizados.

El modelo conserva la arquitectura del Qwen3.8-27B original (familia Qwen3.5, arquitectura de transformer con atención estándar, según el tag `qwen3_5_text`), con 26.895.998.464 parámetros totales según los pesos en safetensors. La cuantización emplea una técnica denominada DR por el autor, que según la model card mejora la fidelidad frente a GPTQ estándar en términos de error cuadrático medio por capa y de neuronas de salida preservadas.

La relevancia de esta ficha radica en que permite evaluar si una cuantización agresiva a 3 bits es viable para producción: la model card reporta una degradación medible pero contenida en perplejidad, acuerdo de tokens y benchmarks de código, lo que la hace candidata para entornos con VRAM limitada. No obstante, al ser un checkpoint derivado con cero descargas y sin documentación adicional sobre el proceso de cuantización, conviene tratarlo con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5_text`) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits (3,17 bpw), esquema DR propietario del autor |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo base Qwen/Qwen3.8-27B, que pertenece a la familia Qwen3.5 y se distribuye con la etiqueta de arquitectura `qwen3_5_text`. No se dispone de información sobre el número de capas, dimensión oculta, número de cabezas de atención ni mecanismos específicos (atención lineal, decodificación especulativa, etc.) más allá de la clasificación genérica como transformer. Tampoco se documenta la longitud de contexto nativa del modelo base en la información proporcionada.

El proceso de cuantización aplicado por el autor se denomina DR y, según la model card, reduce el error cuadrático medio de salida por capa un 51,1% (factor 2,05x) frente a GPTQ estándar, y preserva el 96,62% de las neuronas de salida (3.767.599 de 3.899.392) en comparación con el baseline de 16 bits. No se detalla el algoritmo exacto de DR, el dataset de calibración empleado ni si hubo ajuste posterior. El checkpoint se carga directamente con Transformers, vLLM, SGLang o mediante conversión a llama.cpp, sin necesidad de kernels CUDA personalizados.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.8-27B.
- Generación de código: la model card reporta resultados en EvalPlus HumanEval+ y MBPP+, lo que confirma capacidad de síntesis de código funcional.
- Razonamiento matemático y de lógica: no se aportan benchmarks específicos, pero se infiere del rendimiento en código y perplejidad.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue en GPU de consumo para prototipado: con 10,7 GB efectivos, el checkpoint puede cargarse en tarjetas con 12-16 GB de VRAM, lo que permite experimentar con un modelo de 27B en equipos de gama alta para consumidores sin necesidad de infraestructura de datacenter.
- Generación de código en entornos con VRAM limitada: dado que HumanEval+ se mantiene en 88,41% y MBPP+ en 81,22% tras la cuantización, es adecuado para asistentes de código locales o pipelines de CI/CD que necesiten completar funciones y tests sin depender de APIs externas.
- Servicio de inferencia de bajo coste con vLLM o SGLang: al cargarse de forma nativa en estos motores, permite servir el modelo con un footprint de memoria reducido, aumentando el número de réplicas por GPU en comparación con el baseline de 16 bits.
- Evaluación comparativa de técnicas de cuantización: sirve como referencia para investigadores que quieran medir la degradación de un modelo de 27B a 3,17 bpw frente a GPTQ estándar, usando las métricas de PPL, KLD y acuerdo de tokens reportadas.
- Investigación sobre fidelidad de cuantización extrema: el esquema DR y sus métricas (reducción de MSE por capa, neuronas ganadas) ofrecen un punto de partida para estudiar cuánta capacidad se preserva a 3 bits en modelos de gran tamaño.
- Fine-tuning ligero o adaptación con LoRA sobre el checkpoint cuantizado: aunque no se documenta soporte explícito, el formato safetensors y la carga estándar en Transformers permiten explorar adaptaciones de bajo rango en hardware modesto, siempre que el framework soporte el esquema de cuantización.

## Benchmarks y rendimiento

Los datos provienen de la model card del autor y comparan el checkpoint DR de 3 bits con el baseline de 16 bits del mismo modelo base.

| Metrica | Baseline 16 bits | DR (3 bits) |
|---|---|---|
| Ancho de bits efectivo / footprint | 16,0 bpw (55,5 GB) | 3,17 bpw (10,7 GB) |
| Reduccion de MSE por capa vs. GPTQ estandar | — | 2,05x (-51,1%) |
| Neuronas de salida ganadas vs. GPTQ estandar | — | 96,62% (3.767.599 / 3.899.392) |
| Perplejidad in-domain (PPL) | 2,518 | 2,647 |
| KLD forward sobre vocabulario completo | 0,00000 | 0,07684 |
| Acuerdo Top-1 de tokens | 100,00% | 89,49% |
| Acuerdo Top-5 de tokens | 100,00% | 100,00% |
| Similitud coseno de logits | 1,00000 | 0,98191 |
| EvalPlus HumanEval+ (164 problemas, 80x tests) | 90,85% (149/164) | 88,41% (145/164) |
| EvalPlus MBPP+ (378 problemas, 35x tests) | 84,66% (320/378) | 81,22% (307/378) |

No se han publicado resultados de benchmarks adicionales (MMLU, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10,7 GB de footprint efectivo según el autor, más overhead de activaciones y caché KV; en la práctica, entre 12 y 16 GB para contextos moderados.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), A100 (40/80 GB), H100 (80 GB) para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 12-16 GB o más, como RTX 4070 Ti Super, RTX 4080, RTX 4090, siempre que el contexto no sea muy largo.
- Opciones de despliegue: Transformers, vLLM, SGLang y conversión a llama.cpp, según la model card; no se menciona Ollama ni TGI de forma explícita.
- Latencia y throughput: no disponible; el autor no publica mediciones de velocidad ni de concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-DR-3bit | 26,9B | no disponible | 3 bits (3,17 bpw) | apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.8-27B (baseline) | 26,9B | no disponible | 16 bits | apache-2.0 | Hugging Face |
| Otras cuantizaciones GPTQ de 3-4 bits del mismo base | 26,9B | no disponible | 3-4 bits | apache-2.0 | no disponible en la informacion |

No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada para establecer una comparación cuantitativa más amplia.

## Limitaciones y advertencias

- Degradación medible frente al baseline: PPL sube de 2,518 a 2,647, el acuerdo Top-1 cae al 89,49% y HumanEval+ baja 2,44 puntos porcentuales; en tareas sensibles a la fidelidad exacta de tokens puede haber errores.
- KLD de 0,07684 sobre el vocabulario completo indica una divergencia no trivial en la distribución de probabilidad, lo que puede afectar a generaciones largas o de baja probabilidad.
- Esquema de cuantización DR no documentado: no se publica el algoritmo, el dataset de calibración ni los scripts de reproducción, lo que dificulta auditar la calidad del checkpoint.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso en producción ni validación independiente por parte de la comunidad.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento multilingüe sin evaluarlo.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo sin verificar la configuración del modelo base.
- Licencia apache-2.0: permite uso comercial, pero al ser un derivado conviene verificar que el modelo base Qwen/Qwen3.8-27B mantiene la misma licencia y que la cuantización no introduce restricciones adicionales.
- Riesgo de alucinación inherente al modelo base, potencialmente agravado por la pérdida de fidelidad de la cuantización a 3 bits.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Grawnch/Qwen3.8-27B-DR-3bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- EvalPlus (benchmark HumanEval+/MBPP+): https://github.com/evalplus/evalplus
