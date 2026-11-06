# SentinelHub/R-08-Transformer-Baseline

## Resumen

R-08 Transformer Baseline es un modelo de lenguaje causal (decoder-only) de tipo GPT-2 desarrollado por Thomas Seri bajo el perfil de Hugging Face SentinelHub. No es un modelo destinado a produccion, sino un modelo de control cientifico: se entreno especificamente para servir de referencia A/B frente a la familia Sentinel R-08, una arquitectura propietaria basada en esferas geodesicas y centro piramidal. El objetivo es comparar ambas arquitecturas a paridad de datos, tokenizador, contexto y presupuesto de parametros.

El modelo cuenta con 45.546.496 parametros totales (44.905.984 unicos segun la model card), 14 capas de atencion causal densa, dimension de modelo de 512 y 8 cabezas de atencion. Emplea un vocabulario subword de 1.251 piezas identico al de Sentinel R-08, lo que permite una comparacion token a token sin sesgos de tokenizacion. El contexto de entrenamiento es de 256 tokens.

Su relevancia es metodologica mas que practica: proporciona a la comunidad un punto de referencia reproducible para evaluar arquitecturas alternativas al transformer denso en el regimen de ~45M de parametros, con metricas de rendimiento linguistico (BLiMP-IT, MultiBLiMP), resistencia a alucinaciones, throughput y consumo energetico. El modelo esta orientado al idioma italiano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2, Pre-LayerNorm, weight tying |
| Parametros totales | 45.546.496 (44.905.984 unicos segun model card) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (repo incluye safetensors y GGUF; no se detallan variantes) |
| Idiomas soportados | italiano (it) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso convencional con 14 capas de atencion causal multi-cabeza (8 cabezas), dimension de modelo de 512, Pre-LayerNorm y weight tying entre la capa de embedding y la de salida. Usa un tokenizador subword propio de 1.251 piezas (`vocab_stages`), disenado para ser identico al de la familia Sentinel R-08 y garantizar paridad en la comparacion.

El entrenamiento se realizo sobre el dataset `v22_chinchilla_mix`, con 740M tokens, cifra descrita como Chinchilla-optimal para ~45M de parametros. El proceso consta de 185.000 pasos de pretraining y 10.000 pasos adicionales de midtraining, ejecutados sobre hardware Apple Silicon con backend MPS. No se menciona uso de RLHF, DPO ni tecnicas de alineacion posteriores. La innovacion del trabajo no reside en el modelo en si, sino en su papel como control experimental: misma pipeline de datos, mismo vocabulario, mismo contexto y hardware comparable frente a la arquitectura Sentinel R-08.

## Capacidades

- Generacion de texto causal en italiano, con continuacion de prompts cortos.
- Modelado de lenguaje a nivel de token y subword, util para evaluacion linguistica.
- Razonamiento sintactico basico evaluado mediante MultiBLiMP.
- Evaluacion de correccion gramatical mediante BLiMP-IT.
- Capacidad limitada de recuperacion de hechos en zero-shot (evaluada con un conjunto reducido de hechos en italiano).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del italiano.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Modelo de control en estudios A/B de arquitecturas: sirve como referencia densa estandar para comparar, a paridad de tokens y vocabulario, el rendimiento de arquitecturas alternativas como Sentinel R-08 en tareas de modelado de lenguaje.
- Evaluacion de correccion gramatical en italiano: se puede emplear como baseline en experimentos con BLiMP-IT y MultiBLiMP para medir el impacto de cambios arquitectonicos en la competencia sintactica.
- Investigacion sobre eficiencia energetica: su consumo medido de 3,3 mJ/token en MPS permite comparar el coste computacional de propuestas alternativas en el mismo hardware.
- Estudio de huella de memoria KV-cache: con 5,6 MB por secuencia a 512 tokens, sirve de referencia para cuantificar reducciones de memoria en arquitecturas con atencion dispersa o geodetica.
- Prototipado educativo de transformers pequenos: su tamano (~0,5 GB de repo) y su licencia Apache 2.0 lo hacen util para ensenar el funcionamiento interno de un GPT-2 minimo en italiano.
- Pruebas de pipelines de inferencia en Apple Silicon: permite validar flujos de carga con `modeling_transformer`, tokenizadores personalizados y checkpoints multiples (pretrain y midtrain) en entornos MPS, CUDA o CPU.
- Generacion de texto de dominio restringido en italiano: con contexto de 256 tokens, puede usarse en tareas de continuacion de texto acotadas donde no se requiera coherencia de largo alcance.

## Benchmarks y rendimiento

Resultados de laboratorio publicados en la model card:

| Metrica | Sentinel R-08 v7 Pyramid | Sentinel R-08 v7.2 | Transformer Baseline (pretrain 185k) | Transformer Baseline (midtrain 10k) |
|---|---|---|---|---|
| Parametros totales | 44,5M | 51,6M | 44,9M | 44,9M |
| Capas de atencion densa | 2 | 2 | 14 | 14 |
| BLiMP-IT (precision gramatical) | 80,95% | 82,02% | 82,53% | 85,84% |
| MultiBLiMP (razonamiento sintactico) | 73,46% | 73,46% | 85,15% | 86,83% |
| Resistencia a alucinaciones (zero-shot truth rate) | 62,5% (4/4 hechos IT) | 56,2% (3/4) | 56,2% | 68,8% (4/4 hechos IT) |
| Throughput de entrenamiento (MPS) | ~10.150 tok/s | ~7.200 tok/s | ~8.650 tok/s | ~8.650 tok/s |
| Consumo energetico por token | 2,3 mJ | 2,4 mJ | 3,3 mJ | 3,3 mJ |
| Huella KV-cache (512 tokens) | 0,8 MB (2,1 MB/secuencia) | 0,8 MB (2,1 MB/secuencia) | 5,6 MB (14,7 MB/secuencia) | 5,6 MB (14,7 MB/secuencia) |

No se han publicado resultados de benchmarks estandar de la industria (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (~180 MB de pesos) y por debajo de 500 MB en cuantizacion de 8 o 4 bits; el repo completo ocupa 0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo se entreno en Apple Silicon MPS y es compatible con CUDA y CPU.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, asi como en portatiles con memoria unificada Apple Silicon.
- Opciones de despliegue: carga mediante codigo personalizado (`modeling_transformer`), con pesos en safetensors y GGUF; no se documenta integracion verificada con vLLM, TGI u Ollama.
- Latencia y throughput: el throughput de entrenamiento medido es de ~8.650 tok/s en MPS; no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BLiMP-IT | MultiBLiMP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| R-08 Transformer Baseline | 44,9M | 256 | 85,84% (midtrain) | 86,83% (midtrain) | Apache 2.0 | Hugging Face |
| Sentinel R-08 v7 Pyramid | 44,5M | 256 | 80,95% | 73,46% | no disponible | Hugging Face (Tom2701/R-08) |
| Sentinel R-08 v7.2 | 51,6M | 256 | 82,02% | 73,46% | no disponible | Hugging Face (Tom2701/R-08-v7.2) |
| GPT-2 small (referencia) | 124M | 1.024 | no disponible | no disponible | MIT | Hugging Face |

La comparativa directa solo es posible dentro de la familia R-08, ya que los benchmarks publicados (BLiMP-IT, MultiBLiMP) son especificos del estudio y no se reportan para modelos externos.

## Limitaciones y advertencias

- Modelo de control cientifico, no un asistente: no ha pasado por RLHF ni DPO, por lo que no esta alineado para conversacion ni para seguir instrucciones.
- Contexto muy limitado (256 tokens), insuficiente para tareas de contexto largo, resumen de documentos o dialogos multi-turno extensos.
- Vocabulario de solo 1.251 piezas, lo que reduce la eficiencia de tokenizacion y limita la cobertura lexica frente a tokenizadores estandar.
- Entrenado unicamente en italiano; su rendimiento en otros idiomas no esta documentado y previsiblemente sera deficiente.
- Riesgo elevado de alucinacion: la tasa de acierto zero-shot en hechos es del 56,2% en el checkpoint de pretraining y del 68,8% en el de midtraining, sobre un conjunto muy reducido de cuatro hechos.
- No se documentan sesgos especificos, pero el dataset `v22_chinchilla_mix` no esta descrito en detalle, lo que impide evaluar su composicion y posibles sesgos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo carece de las capacidades necesarias para aplicaciones de produccion reales.
- La carga requiere codigo personalizado (`modeling_transformer`), lo que puede complicar la integracion con frameworks estandar.
- Las cifras de benchmarks proceden del propio autor y no han sido replicadas de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/SentinelHub/R-08-Transformer-Baseline
- Modelo comparado Sentinel R-08 v7 Pyramid: https://huggingface.co/Tom2701/R-08
- Modelo comparado Sentinel R-08 v7.2: https://huggingface.co/Tom2701/R-08-v7.2
- Repositorio GitHub Sentinel R-08: https://github.com/Thomasseri/R-08
- Repositorio GitHub Sentinel R-08 v7.2: https://github.com/Thomasseri/R-08-v7.2
