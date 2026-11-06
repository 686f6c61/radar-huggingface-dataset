# cameronervin1/nanogpt-100m

## Resumen

nanogpt-100m es un modelo GPT decoder-only de 101 millones de parametros entrenado desde cero por el autor independiente cameronervin1 mediante su propio framework de entrenamiento (cameronervin/nanogpt). El modelo se distribuye en tres checkpoints encadenados: una base preentrenada sobre 2.000 millones de tokens de FineWeb-Edu, una version afinada con SFT sobre SmolTalk, GSM8K y sumas sinteticas, y una version final optimizada con GRPO (Group Relative Policy Optimization) usando una recompensa numerica exacta sobre sumas de dos digitos.

El objetivo declarado es educativo: demostrar de forma reproducible el pipeline completo de entrenamiento (pretraining, SFT y RL) con un coste total de aproximadamente 26 dolares de GPU. No es un asistente general ni un modelo de proposito general; es un artefacto de investigacion centrado en una tarea concreta de aritmetica y en la metodologia de refuerzo con recompensa verificable.

Su relevancia actual radica en que documenta de forma transparente el efecto del GRPO sobre una capacidad acotada (mejora del 32,0% al 46,6% en exact match codicioso sobre sumas de dos digitos) y publica manifiestos con hashes SHA-256 de pesos, datos y configuracion. La arquitectura es un transformer clasico de 12 capas y anchura 768, con atencion de consultas agrupadas (GQA), RoPE, SwiGLU, RMSNorm, QK-norm y embeddings atados, con una ventana de contexto de 1.024 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT) con GQA, RoPE, SwiGLU, RMSNorm, QK-norm y embeddings atados |
| Parametros totales | 101M |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precision de entrenamiento) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors por checkpoint, con model_config.json y run_manifest.json) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 12 capas y anchura 768, con 12 cabezas de consulta y 4 cabezas KV (GQA), RoPE para codificacion posicional, activacion SwiGLU, normalizacion RMSNorm, QK-norm, embeddings atados entre entrada y salida, y un contexto maximo de 1.024 tokens. El tokenizador es un BPE byte-level de 32.768 tokens, propio del repositorio, y los pesos requieren el codigo del proyecto nanogpt en lugar de `transformers`.

El entrenamiento consta de tres etapas. La base se preentreno durante 7.630 pasos sobre 2.000 millones de tokens de FineWeb-Edu (`sample-10BT`) en una H100 SXM, con un coste aproximado de 4,85 dolares; alcanza una perdida de validacion de 3,250 (perplejidad 25,8, 1,019 bits por byte). El SFT se realizo durante 2.000 pasos en una A40 sobre SmolTalk (200.000 ejemplos), GSM8K (4.500) y sumas en formato de acarreo (4.000), con un coste de 1,50 dolares. La etapa GRPO se ejecuto durante 150 pasos en una A40 con 64 prompts por paso, 8 muestras por prompt, tasa de aprendizaje 1e-6, peso KL de 0,02 frente al modelo SFT congelado, recorte PPO de 0,2 y temperatura 0,8, con una recompensa numerica exacta sobre sumas de dos digitos y un coste de 1,11 dolares.

La innovacion metodologica principal es la aplicacion de GRPO con recompensa verificable sobre una tarea aritmetica y la publicacion de todos los artefactos intermedios (checkpoints de experimentos fallidos, barridos de tasa de aprendizaje, logs y manifiestos con hashes). El autor documenta explicitamente un intento de GRPO que degradó la precision retenida del 30% al 10%, lo que aporta valor como caso de estudio de inestabilidad en RL.

## Capacidades

- Generacion de texto autoregresiva en ingles, con calidad limitada por el tamano y el presupuesto de entrenamiento (2.000 millones de tokens).
- Razonamiento aritmetico restringido a sumas de dos digitos, resueltas columna a columna con formato de acarreo explicito y respuesta final entre etiquetas `<final>...</final>`.
- Formato de salida estructurado y consistente: el 100% de las respuestas evaluadas resultaron validas en formato tanto en SFT como en GRPO.
- Conversacion de un solo turno con plantilla de chat (entrenado sobre SmolTalk), sin evaluacion publicada de calidad conversacional.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso fuera del desglose por columnas de la suma.
- Capacidad multilingue practicamente nula: solo ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Estudio reproducible de GRPO: el modelo permite replicar un ciclo completo de RL con recompensa verificable sobre una tarea acotada, comparando los checkpoints `release/sft` y `release/grpo` con las mismas 500 prompts retenidas y midiendo la mejora del 32,0% al 46,6% en exact match codicioso.
- Docencia de pipelines de entrenamiento: sirve para ilustrar las tres fases (pretraining, SFT, RL) con costes reales (4,85 + 1,50 + 1,11 dolares) y hardware asequible (una H100 y dos sesiones en A40), lo que lo hace viable en cursos universitarios y talleres.
- Investigacion sobre recompensas verificables: su recompensa numerica exacta y su formato de respuesta permiten experimentar con variantes de RL (peso KL, recorte PPO, temperatura) sin construir un entorno de evaluacion desde cero.
- Analisis de fallos en aritmetica de modelos pequenos: el modelo produce errores tipicos de acarreo (por ejemplo, 47 + 38 = 75 en lugar de 85) que pueden usarse para estudiar la representacion de digitos y la tokenizacion de operandos multi-digito.
- Referencia base para comparativas de eficiencia: con 101M de parametros y un contexto de 1.024 tokens, sirve como linea base de bajo coste frente a modelos mayores en tareas de aritmetica elemental.
- Auditoria de reproducibilidad: los manifiestos con SHA-256 de pesos, datos y checkpoint padre permiten verificar la cadena de entrenamiento y auditar la procedencia de cada checkpoint en un entorno de investigacion.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 500 prompts retenidos de suma de dos digitos:

| Metrica | SFT (`release/sft`) | GRPO (`release/grpo`) |
|---|---:|---:|
| Exact match codicioso | 32,0% | 46,6% |
| pass@1 muestreado (T = 0,8) | 9,3% | 19,0% |
| pass@8 muestreado | 48,6% | 63,8% |
| Formato valido | 100% | 100% |

Modelo base sobre FineWeb-Edu: perdida de validacion 3,250, perplejidad 25,8, 1,019 bits por byte.

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni otras suites estandar. El autor indica explicitamente que la precision en GSM8K no se midio pese a formar parte de los datos de SFT, y que la precision es del 0% en sumas de mas de dos digitos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en FP32 (101M de parametros), alrededor de 0,2 GB en FP16/BF16 y menos de 0,1 GB en cuantizacion de 8 bits, sin contar el tokenizador ni el codigo del proyecto.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el entrenamiento se realizo en una H100 SXM (base) y una A40 (SFT y GRPO).
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares, e incluso en CPU para inferencia interactiva.
- Opciones de despliegue: el modelo no es compatible con `transformers` de forma nativa; requiere el paquete `nanogpt` instalado desde GitHub (`pip install "git+https://github.com/cameronervin/nanogpt" "huggingface_hub<2"`) y carga de pesos con `safetensors.torch.load_model`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la informacion proporcionada; por tamano y contexto (1.024 tokens) se espera una latencia muy baja en GPU moderna, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| nanogpt-100m | 101M | 1.024 | GPT desde cero + SFT + GRPO sobre suma de 2 digitos | Apache-2.0 | Hugging Face, requiere codigo propio |
| GPT-2 small | 124M | 1.024 | Transformer decoder-only preentrenado en web | MIT | Hugging Face, compatible con `transformers` |
| SmolLM-135M | 135M | 2.048 | Transformer decoder-only con datos curados | Apache-2.0 | Hugging Face, compatible con `transformers` |
| TinyLlama-1.1B | 1,1B | 2.048 | Transformer decoder-only con 3T tokens | Apache-2.0 | Hugging Face, compatible con `transformers` |

La comparacion directa en rendimiento no es posible porque nanogpt-100m solo publica resultados en suma de dos digitos y no en suites estandar. Frente a GPT-2 small y SmolLM-135M, su ventaja es la trazabilidad completa del pipeline y el coste de entrenamiento documentado; su desventaja es la ausencia de integracion con el ecosistema `transformers`, el contexto reducido y la especializacion extrema.

## Limitaciones y advertencias

- El modelo fue entrenado y evaluado exclusivamente en sumas de dos digitos; la precision es del 0% en numeros mas largos, probablemente porque cada operando multi-digito se tokeniza como un unico token.
- La calidad de chat y de texto general no se evaluo; debe esperarse el comportamiento propio de un modelo de 100M entrenado con 2.000 millones de tokens.
- GSM8K formo parte de los datos de SFT, pero su precision no se midio, por lo que no hay evidencia de generalizacion aritmetica fuera de la suma de dos digitos.
- Todos los resultados provienen de una unica ejecucion por etapa; no se han publicado intervalos de confianza ni replicas.
- El autor documenta un intento de GRPO que redujo la precision retenida del 30% al 10%, lo que evidencia inestabilidad del metodo en esta configuracion.
- Riesgo de alucinacion y de errores de calculo: el ejemplo publicado muestra un fallo de acarreo (47 + 38 = 75), tipico de su nivel de precision del 46,6%.
- El modelo solo soporta ingles y no se han evaluado sesgos; FineWeb-Edu es texto web filtrado que puede contener contenido con copyright, danino, sesgado o privado, y el modelo puede reproducirlo.
- La licencia Apache-2.0 cubre codigo y pesos, pero los datos de entrenamiento conservan sus propios terminos: FineWeb-Edu (ODC-By), SmolTalk (Apache-2.0) y GSM8K (MIT).
- No es compatible con `transformers`; la integracion en produccion requiere el paquete `nanogpt` y limita el uso de herramientas estandar de servicio (vLLM, TGI, Ollama).
- El contexto de 1.024 tokens es insuficiente para la mayoria de casos de uso conversacionales o de recuperacion aumentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cameronervin1/nanogpt-100m
- Repositorio de entrenamiento: https://github.com/cameronervin/nanogpt
- Documento de resultados: https://github.com/cameronervin/nanogpt/blob/main/docs/results.md
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
