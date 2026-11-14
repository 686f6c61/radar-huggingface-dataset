# Hooshaai/qwen-2.5-0.5b-simple-ssm-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-simple-ssm-wikitext2` es un checkpoint experimental derivado de Qwen2.5-0.5B en el que se han sustituido quirúrgicamente los bloques de atención del decodificador por un operador de espacio de estados simplificado denominado `simple_ssm`, perteneciente al registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El autor del repositorio es Hooshaai; el trabajo se apoya en la infraestructura y los scripts publicados por el proyecto NeuralOps (tahamajs). No es un modelo entrenado desde cero, sino un ejercicio de cirugía arquitectónica seguido de una destilación de conocimiento en dos etapas para recuperar capacidad predictiva tras el trasplante.

La motivación es exploratoria: evaluar si un bloque SSM ligero puede reemplazar la atención cuadrática en un transformer pequeño preentrenado sin reentrenar desde cero, y medir el coste de recuperación mediante destilación sobre WikiText-2. El modelo base Qwen2.5-0.5B tiene 0,49 mil millones de parámetros, 24 capas y una ventana de contexto nativa de 32 768 tokens; el checkpoint resultante conserva la tokenizadora y la mayor parte de los pesos del modelo original, con solo 77,26 MB de pesos de atención reemplazados.

El resultado es, en la práctica, un artefacto de investigación con una perplejidad muy elevada (12 092,24 en la validación de WikiText-2), muy lejos de la del modelo base. Es relevante ahora porque documenta de forma transparente una técnica emergente —el trasplante de módulos de atención subcuadrática sobre modelos densos existentes— y porque publica toda la telemetría del proceso, algo poco habitual en checkpoints de este tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con 18/24 capas de atención sustituidas por `SimpleSSM`; patrón híbrido `hybrid_3_1` con 6 capas de atención cuadrática preservadas en los índices [3, 7, 11, 15, 19, 23] |
| Parametros totales | 0,49 mil millones (heredados de Qwen2.5-0.5B); pesos de atención reemplazados: 77,26 MB |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen2.5-0.5B soporta 32 768 tokens; el fine-tuning se realizó con `seq_len=512`) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`), más `config.json` y `tokenizer.json` |
| Librería | `neuralops` |
| Modelo base | Qwen/Qwen2.5-0.5B |
| Dataset de entrenamiento | Salesforce/wikitext, `wikitext-2-raw-v1` |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 24 capas, `hidden_size=896`, 14 cabezas de consulta y 2 cabezas KV (GQA con `head_dim=64`). La intervención reemplaza 18 de las 24 capas de atención por el bloque `SimpleSSM` mediante `QwenAttentionAdapter`, que realiza una expansión 14:2 de las cabezas KV y respeta el contrato de una única `o_proj`. Se conservan 6 capas de atención cuadrática completa como anclas en los índices [3, 7, 11, 15, 19, 23], dando lugar al patrón intercalado 3:1 (`hybrid_3_1`). El módulo `SimpleSSM` declara soporte causal, bidireccional y de atención cruzada, pero no soporte nativo de GQA ni de RoPE.

El entrenamiento es una destilación de conocimiento en dos etapas sobre WikiText-2, con `seq_len=512`, `grad_accum=4` y `topk=64`. La etapa 1 (alineación con backbone congelado) duró 16 pasos (54,7 s) y usó MSE y coseno sobre estados ocultos por capa con peso 0,25, con `lm_head` desactivado. La etapa 2 (destilación multi-capa de representaciones) duró 37 pasos (126,1 s) con peso 0,50. En total, 53 pasos de optimización en 181,1 s, con un pico de VRAM de 11 207 MB en FP16 con autocast y parámetros maestros en FP32. La perplejidad causal pasó de 912 875,13 (baseline cero-shot tras la cirugía) a 12 092,24 tras la destilación, una delta de −900 782,89.

## Capacidades

- Generación de texto autoregresiva causal, heredada de la cabeza `lm_head` y la tokenizadora de Qwen2.5-0.5B.
- El módulo `SimpleSSM` declara soporte causal, bidireccional y de atención cruzada a nivel de bloque, aunque el checkpoint se publica para uso causal.
- Capacidad multilingüe limitada al inglés según la model card, pese a que el modelo base es multilingüe.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta modo de pensamiento (`thinking`), visión, audio ni otras modalidades.
- La perplejidad publicada (12 092,24) sugiere una calidad de generación muy degradada respecto al modelo base, por lo que las capacidades prácticas son limitadas.

## Casos de uso

- Investigación sobre atención subcuadrática: el checkpoint sirve como referencia reproducible para estudiar cómo afecta la sustitución de atención cuadrática por SSM en un transformer preentrenado, usando los scripts de NeuralOps y la telemetría publicada.
- Reproducción de experimentos de cirugía arquitectónica: permite validar el pipeline `apply_qwen_attention_surgery` con el patrón `hybrid_3_1` y comparar la recuperación de perplejidad con otras variantes del `ATTENTION_REGISTRY`.
- Estudio de destilación de conocimiento en dos etapas: los datos de las etapas 1 y 2 (pasos, tiempos, pesos de MSE/coseno) permiten analizar la eficiencia de la alineación con backbone congelado frente a la destilación multi-capa.
- Benchmark de eficiencia de bloques SSM: útil para medir coste de memoria y tiempo de entrenamiento de módulos SSM en GPUs de gama media (pico de 11,2 GB de VRAM).
- Docencia y divulgación: ejemplo didáctico de cómo se trasplanta un módulo de atención y de por qué la perplejidad puede degradarse varios órdenes de magnitud sin un reentrenamiento adecuado.
- Pruebas de integración de la librería `neuralops`: el `load_surgeried_model` del hub NeuralOps permite cargar el checkpoint en una línea, lo que facilita tests de humo de la infraestructura.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` (no verificados):

| Benchmark | Dataset / split | Métrica | Valor |
|---|---|---|---|
| Causal Language Modeling | Salesforce/wikitext, `wikitext-2-raw-v1`, validation | Perplejidad | 12 092,24 |

Telemetría de entrenamiento publicada en la model card:

| Métrica / etapa | Valor |
|---|---|
| Perplejidad causal pre-KD (etapa 0, cero-shot tras cirugía) | 912 875,13 |
| Perplejidad causal post-KD (validación) | 12 092,24 |
| Delta de perplejidad | −900 782,89 |
| Etapa 1 (alineación con backbone congelado) | 16 pasos, 54,7 s |
| Etapa 2 (destilación multi-capa) | 37 pasos, 126,1 s |
| Pasos totales / tiempo total | 53 pasos / 181,1 s |
| VRAM pico | 11 207 MB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en FP16 ocupa aproximadamente 1 GB (0,49 mil millones de parámetros); el pico de entrenamiento documentado fue de 11 207 MB, pero la inferencia es mucho más ligera.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para FP16; una RTX 3060, RTX 4060 o superior es suficiente.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas consumer modernas (RTX 20xx en adelante) e incluso en algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: el checkpoint requiere la librería `neuralops` y los scripts de cirugía (`apply_qwen_attention_surgery`) para cargarse; no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI. El repo pesa 0,1 GB.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-simple-ssm-wikitext2` | 0,49 B | No disponible | 12 092,24 | MIT | Hugging Face (326 descargas) |
| Qwen/Qwen2.5-0.5B (base) | 0,49 B | 32 768 tokens | No disponible en la información | Apache 2.0 (según el modelo base) | Hugging Face |
| Otras variantes del Qwen Attention Zoo (NeuralOps) | 0,49 B | No disponible | No disponible | MIT | Hugging Face |

No se dispone de datos de perplejidad del modelo base ni de otras variantes del zoo en la información proporcionada, por lo que la comparación cuantitativa directa no es posible.

## Limitaciones y advertencias

- Perplejidad de validación muy elevada (12 092,24), varios órdenes de magnitud por encima de lo esperable en un modelo de 0,5 B; la calidad de generación es previsiblemente muy baja.
- Entrenamiento muy corto (53 pasos, 181 s) y sobre un único dataset (WikiText-2), lo que limita la generalización.
- Solo se declara soporte de inglés, pese a que el modelo base es multilingüe.
- El módulo `SimpleSSM` no soporta GQA nativo ni RoPE, lo que puede afectar a la coherencia en contextos largos.
- Requiere la librería `neuralops` y scripts de cirugía específicos; no es un checkpoint estándar de `transformers` cargable con `AutoModelForCausalLM.from_pretrained` sin pasos adicionales.
- Licencia MIT, lo que permite uso comercial, pero el checkpoint deriva de Qwen2.5-0.5B (Apache 2.0); conviene revisar las condiciones del modelo base.
- Riesgo elevado de alucinación y de texto incoherente dada la perplejidad reportada.
- No se documentan sesgos específicos, pero al entrenarse solo sobre WikiText-2 (texto enciclopédico en inglés) el modelo no está alineado ni filtrado.
- No apto para producción sin una evaluación adicional exhaustiva.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-simple-ssm-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Repositorio de referencia citado en la model card: https://huggingface.co/tahamajs/qwen-2.5-0.5b-simple-ssm-wikitext2
