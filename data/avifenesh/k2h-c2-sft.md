# Avifenesh/k2h-c2-sft

## Resumen

K2H c2-sft es un checkpoint de investigación publicado por el usuario Avifenesh en Hugging Face. Se trata del segundo brazo ("Arm 2") de un estudio de continued pretraining sobre el modelo base IFM/K2-Horizon-MoVA-36B-A4B, un transformer de mezcla de expertos (MoE) con 36 mil millones de parámetros totales y aproximadamente 4 mil millones activos. El modelo conserva la arquitectura, el tokenizer y la plantilla de chat del modelo base, y se distribuye en safetensors bf16 con código de modelado personalizado.

El objetivo del experimento es evaluar el efecto de un ajuste fino ligero (100 pasos, unos 79 millones de tokens) sobre datos de dominio limpio, replay verificado y registros de chat y razonamiento en formato SFT. El autor lo describe explícitamente como un checkpoint de investigación y no como un candidato a release: debe compararse con la versión publicada del modelo base, no de forma aislada.

Su relevancia es metodológica más que de producto: los resultados publicados muestran mejoras notables en generación de código (HumanEval +16,5 puntos, MBPP +6,6) a costa de un deterioro severo en el seguimiento de instrucciones (IFEval -15,7 puntos) y en GSM8K en formato chat (-9,2 puntos), lo que ilustra los riesgos del ajuste fino sobre datos sintéticos verificados de forma parcial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), código de modelado personalizado (`k2_horizon`) |
| Parámetros totales | 37.444.792.020 (~37,4B; el autor indica ~36B) |
| Parámetros activos | ~4B (según el autor; no se detalla el número exacto de expertos) |
| Longitud de contexto | 65.536 tokens (longitud de secuencia usada en entrenamiento; contexto máximo del modelo base no disponible) |
| Tipos de cuantización | No disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) con código de modelado incluido (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos (MoE) con 36B parámetros totales y unos 4B activos, heredado directamente de IFM/K2-Horizon-MoVA-36B-A4B. No se han publicado detalles sobre el número de expertos, el mecanismo de enrutamiento ni la innovación "MoVA" que aparece en el nombre del modelo base. El checkpoint se distribuye con su propio código de modelado, por lo que requiere cargarlo con `trust_remote_code=True`.

El entrenamiento consistió en 100 pasos de continued pretraining partiendo de los pesos publicados del modelo base, con el trainer xLLM sobre FSDP2 en bf16 y 3 GPUs. La secuencia fue de 65.536 tokens, batch de 1 por GPU y acumulación de gradiente de 4, lo que da unos 786.000 tokens por paso y unos 79 millones de tokens en total. Se usó AdamW (beta1 0,9, beta2 0,95), weight decay 0,06, clipping de gradiente 1,0 y learning rate 1,5e-5 con 20 pasos de warmup y posteriormente constante. La mezcla de datos fue: 66% slices de dominio del corpus `k2h-corpus-domain-clean` (código de inferencia, frameworks, código general y Linux, commits, texto de pull requests, notas de tuning no publicadas y papers de arXiv convertidos no publicados); 10% replay verificado (`replay-synth-verified` 7% y `replay-math-verified` 3%); y 24% registros de chat de una instantánea temprana de `k2h-chat-reasoning-verified` (razonamiento 15%, instruct TxT360 6% y Stack Exchange 3%). En los registros de chat solo se entrena sobre los tokens del asistente.

## Capacidades

- Generación de texto conversacional y continuaciones de código, heredadas del modelo base.
- Generación de código: es el área donde el ajuste produce la mayor mejora (HumanEval y MBPP).
- Razonamiento en formato chat con bloque de razonamiento explícito ("reasoning on"), activado mediante la plantilla de chat del modelo base.
- Razonamiento matemático y resolución de problemas tipo GSM8K, aunque con degradación en formato chat respecto al release.
- Comprensión lectora y conocimiento general a nivel del modelo base (MMLU, ARC, BoolQ sin cambios significativos).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Evaluación comparativa de estrategias de continued pretraining: el modelo sirve como brazo de control en estudios que miden el impacto de mezclas de datos de dominio y replay sobre un MoE de 36B, comparándolo siempre contra el release del modelo base.
- Generación de código asistida en entornos de investigación: con HumanEval pass@1 de 69,5 y MBPP de 71,8, es adecuado para prototipar completados de funciones y tests en pipelines internos, no para producción sin validación adicional.
- Estudio del deterioro de instruction following: útil para analizar por qué un ajuste corto sobre datos sintéticos verificados degrada IFEval en 15,7 puntos y qué fallos concretos aparecen (respuestas que no cierran el bloque de razonamiento).
- Investigación sobre reasoning verboso: permite medir cómo la inclusión de slices de razonamiento de DeepSeek y Kimi alarga las cadenas de razonamiento del modelo sin recuperar la adherencia a instrucciones.
- Análisis de calidad de datos sintéticos: el propio autor señala que la instantánea de SFT contenía aún un 16% de registros defectuosos, lo que convierte al checkpoint en un caso de estudio sobre revisión de datasets.
- Reproducción de experimentos con FSDP2 y xLLM: la configuración de entrenamiento (3 GPUs, 100 pasos, 79M tokens) es lo bastante pequeña para replicarse y validar la metodología en otros modelos base.
- Fine-tuning posterior controlado: al compartir tokenizer y plantilla de chat con el modelo base, puede usarse como punto de partida para experimentos de alineación posteriores con DPO o RLHF.

## Benchmarks y rendimiento

Resultados publicados por el autor, obtenidos con lm-evaluation-harness contra un servidor vLLM. IFEval y GSM8K en formato chat usan la plantilla de chat con razonamiento activado, temperatura 1,0, top_p 0,95 y 14.336 tokens nuevos, puntuando solo el texto posterior al bloque de razonamiento. La NLL de PR se calcula sobre 150 pull requests reservados (530.000 tokens).

| Tarea | Release (base) | Este modelo | Cambio |
|---|---:|---:|---:|
| GSM8K, 5-shot, estricto | 90,1 | 87,6 | -2,5 |
| GSM8K, chat zero-shot (razonamiento on) | 96,6 | 87,4 | -9,2 |
| IFEval, prompt-strict (razonamiento on) | 84,3 | 68,6 | -15,7 |
| MMLU | 77,3 | 77,4 | +0,1 |
| ARC-Challenge | 57,6 | 57,7 | +0,1 |
| ARC-Easy | 85,6 | 85,6 | +0,0 |
| BoolQ | 88,4 | 88,3 | -0,1 |
| HellaSwag (norm) | 67,6 | 68,0 | +0,4 |
| PIQA | 80,5 | 80,3 | -0,2 |
| WinoGrande | 69,1 | 70,1 | +1,0 |
| MBPP pass@1 | 65,2 | 71,8 | +6,6 |
| HumanEval pass@1 (4 muestras) | 53,0 | 69,5 | +16,5 |
| NLL en PR reservados (menor es mejor) | 1,519 | 1,323 | -0,196 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 75 GB solo para pesos (37,4B parámetros × 2 bytes), más overhead de KV cache y activaciones; en la práctica requiere GPUs de 80 GB o reparto multi-GPU.
- En cuantización de 8 bits, el peso rondaría los 37-40 GB; en 4 bits, unos 19-20 GB. No se han publicado cuantizaciones oficiales ni resultados de calidad tras cuantizar.
- GPUs recomendadas: A100 80 GB, H100 80 GB o H200 para bf16 en una sola GPU; para consumer, una RTX 4090 (24 GB) solo sería viable con cuantización de 4 bits, no validada por el autor.
- Despliegue: el autor evaluó contra un servidor vLLM; al requerir código de modelado personalizado (`trust_remote_code=True`), es necesario comprobar la compatibilidad con la versión concreta de vLLM o transformers. Soporte en llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles. Como referencia estructural, al ser un MoE con ~4B parámetros activos, el coste de cómputo por token es mucho menor que el de un denso de 37B, pero el requisito de memoria sigue siendo el de los 37,4B totales.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Avifenesh/k2h-c2-sft | ~37,4B | ~4B | 65.536 (entrenamiento) | Apache-2.0 | Checkpoint de investigación, HumanEval 69,5, IFEval 68,6 |
| IFM/K2-Horizon-MoVA-36B-A4B (release) | ~36B | ~4B | No disponible | Apache-2.0 | Modelo base; HumanEval 53,0, IFEval 84,3, GSM8K chat 96,6 |
| Otros MoE de tamaño similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la información proporcionada |

La comparación natural es contra su propio modelo base: c2-sft gana en código y en NLL sobre pull requests, pero pierde de forma clara en instruction following y en matemáticas en formato chat.

## Limitaciones y advertencias

- Checkpoint de investigación, no un release candidate: el autor indica explícitamente que debe compararse con el release y no evaluarse de forma aislada.
- Deterioro severo de instruction following: IFEval cae 15,7 puntos (p=1e-13) y 46 respuestas no cierran el bloque de razonamiento dentro de los 14.336 tokens.
- Deterioro en GSM8K formato chat: -9,2 puntos, con un 8,4% de respuestas que no cierran el razonamiento.
- Datos de SFT parcialmente defectuosos: la instantánea usada contenía alrededor de un 16% de registros de chat defectuosos tras una sola pasada de revisión.
- Partes del corpus de entrenamiento no están publicadas (notas de tuning y papers de arXiv convertidos), lo que limita la reproducibilidad exacta.
- Idiomas soportados no documentados: no hay garantía de rendimiento fuera de los idiomas presentes en los datos de entrenamiento.
- Riesgo de alucinación: no cuantificado en la información disponible; el aumento de cadenas de razonamiento podría incrementar respuestas plausibles pero incorrectas.
- Sesgos: no documentados por el autor.
- Licencia Apache-2.0, que permite uso comercial, pero al tratarse de un checkpoint de investigación sin evaluación de seguridad ni de sesgos, no es recomendable para producción.
- Requiere `trust_remote_code=True` por el código de modelado personalizado, lo que implica ejecutar código del repositorio y revisarlo antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Avifenesh/k2h-c2-sft
- Modelo base: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Perfil del autor: https://huggingface.co/Avifenesh/models
- Dataset de dominio: https://huggingface.co/datasets/Avifenesh/k2h-corpus-domain-clean
- Dataset de replay verificado: https://huggingface.co/datasets/Avifenesh/k2h-replay-verified
- Dataset de chat y razonamiento: https://huggingface.co/datasets/Avifenesh/k2h-chat-reasoning-verified
