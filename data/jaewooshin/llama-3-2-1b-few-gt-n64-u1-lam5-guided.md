# JaeWooShin/Llama-3.2-1B-few-gt-N64-u1-lam5-guided

## Resumen

Llama-3.2-1B-few-gt-N64-u1-lam5-guided es un fine-tune del modelo instructivo meta-llama/Llama-3.2-1B-Instruct desarrollado por el usuario JaeWooShin. El repositorio contiene dos ejecuciones independientes de GRPO (Group Relative Policy Optimization) de 300 pasos cada una, orientadas a mejorar el razonamiento matematico de un modelo de 1.240 millones de parametros mediante aprendizaje por refuerzo sin etiquetas (label-free RL). La innovacion principal es una regularizacion de subespacio en el lado de salida que ancla los pesos al modelo base: se penaliza la componente de la diferencia W − W₀ ortogonal al vector singular dominante u₁ de un donante entrenado con ground-truth.

Ambas ejecuciones parten del mismo checkpoint W₀ y solo se diferencian en la funcion de recompensa. La variante `majority/` otorga recompensa cuando la respuesta de un rollout coincide con la respuesta modal de su grupo (voto por mayoria normalizado), mientras que `format/` recompensa unicamente la presencia de una respuesta parseable dentro de `\boxed{}`. El objetivo declarado es estudiar si es posible transferir la direccion de aprendizaje de un modelo con supervision a otro que no la utiliza.

El modelo es relevante como banco de pruebas de tecnicas de RLVR (Reinforcement Learning with Verifiable Rewards) y de regularizacion por subespacios en modelos pequenos. Con licencia Llama 3.2, idioma ingles y un tamano de repositorio de 34,7 GB (debido a que incluye checkpoints completos de FSDP2 en fp32 con estado de AdamW), esta pensado para investigacion sobre dinamica de entrenamiento y transferencia de direcciones de actualizacion, mas que para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), atencion SDPA, fine-tune con GRPO |
| Parametros totales | 1.235.814.400 (1,24 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.2 1B) |
| Tipos de cuantizacion | pesos distribuidos en safetensors bf16; la model card no especifica cuantizaciones adicionales |
| Idiomas soportados | ingles (etiqueta `en`) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (bf16 en `majority/hf_step300/` y `format/hf_step300/`), mas checkpoints FSDP2 completos en fp32 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del transformer decoder-only de Llama 3.2 1B, sin modificaciones estructurales; el modelo se obtiene por fine-tune sobre la revision `9213176726f574b556790deb65791e0c5aa438b6` de Llama-3.2-1B-Instruct. El entrenamiento emplea GRPO con 64 prompts por paso, 16 rollouts por prompt y 300 pasos, con minibatch PPO de 8 prompts, microbatch 2, una epoca, learning rate constante de 5e-7, sin warmup, sin KL, sin bonus de entropia ni weight decay. Se aplica recorte de ratio de 0.2, gradient clipping de 1.0, perdida `seq-mean-token-mean` y ventajas normalizadas por desviacion tipica. Los rollouts se generan con vLLM a temperatura 1.0, top_p 1.0 y 3072 tokens de respuesta, con `max_num_seqs` 128 y fraccion de memoria 0.30.

El dataset de entrenamiento es un pool label-free derivado de DeepScaleR con 40.315 prompts (40.309 dentro de 1024 tokens) y ground truth censurado; MATH-500 se usa solo para validacion durante el entrenamiento. La innovacion tecnica es la penalizacion fuera de subespacio en el lado de salida: λ/2 · Σ_W ‖(I − u₁u₁ᵀ)(W − W₀)‖²_F, con λ = 5, aplicada sobre las 112 matrices de atencion y MLP (q, k, v, o, gate, up, down por cada una de las 16 capas) sin normalizacion por matriz. Aqui u₁ es el vector singular dominante de salida de W − W₀ de un donante GRPO entrenado con 64 prompts etiquetados durante 300 pasos; solo se transfiere u₁, no los pesos del donante. El entrenamiento se ejecuto en una sola GPU NVIDIA RTX PRO 5000 Blackwell (48 GB) por cada run, sobre una version modificada de verl 0.8.0.dev0, PyTorch 2.8.0+cu128, vLLM 0.11.0, transformers 4.57.6 y FSDP2 con gradient checkpointing; flash-attn 2.8.1 solo aporta utilidades de padding.

## Capacidades

- Generacion de texto y razonamiento en ingles, con foco especifico en problemas matematicos de competicion (MATH-500, AMC23, AIME24/25, Minerva, OlympiadBench).
- Razonamiento matematico en formato de respuesta que debe incluirse dentro de `\boxed{}` para poder ser puntuada.
- Generacion autoregresiva estandar de un modelo instructivo de 1B, con 16 rollouts por prompt durante el entrenamiento (capacidad de muestreo multiple).
- Diferenciacion de comportamiento segun la recompensa: la variante `format/` produce respuestas mas consistentemente parseables, mientras que `majority/` optimiza la coincidencia con la respuesta modal del grupo.
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, vision, audio ni modo de pensamiento extendido.
- Capacidades multilingues limitadas: la model card declara unicamente ingles.

## Casos de uso

- Investigacion en RLVR y GRPO: el repositorio incluye checkpoints FSDP2 completos, estado de AdamW, scheduler, RNG y estado del data-loader, lo que permite reproducir y continuar el entrenamiento desde el paso 300 en proyectos de investigacion sobre aprendizaje por refuerzo verificable.
- Estudio de transferencia de subespacios: sirve para analizar empiricamente si una direccion de actualizacion (`u₁`) obtenida de un donante con ground-truth puede guiar a un modelo entrenado sin etiquetas, comparando las ejecuciones `majority/` y `format/`.
- Evaluacion de trade-offs de recompensa: las dos variantes permiten comparar como una recompensa de mayoria frente a una recompensa de formato afectan al rendimiento matematico y a la estabilidad del entrenamiento.
- Punto de partida para fine-tuning matematico en modelos de 1B: al ser un checkpoint bf16 compatible con `from_pretrained`, puede usarse como inicializacion de experimentos posteriores de destilacion o RL con menos recursos (una unica GPU de 48 GB).
- Generacion de soluciones matematicas de referencia en entornos de investigacion: util para producir multiples candidatos por problema y estudiar la distribucion de respuestas (muestreo a temperatura 0.6 y top_p 0.95 con 3072 tokens de presupuesto).
- Benchmarking de tecnicas de regularizacion: el codigo y la configuracion de verl modificada permiten replicar la penalizacion de subespacio y medir su efecto sobre el olvido del modelo base.
- Analisis de estabilidad de GRPO en modelos pequenos: los logs, trayectorias de validacion por paso y guardas de colapso (constante-answer collapse) documentan el comportamiento del entrenamiento con recompensas no verificables.

## Benchmarks y rendimiento

Resultados en el checkpoint final (paso 300), muestreados a temperatura 0.6 y top_p 0.95, con 1024 tokens de prompt y 3072 de respuesta:

| Benchmark | Estimador | majority | format |
|---|---|---:|---:|
| MATH-500 | mean@8 | 0.2642 | 0.2825 |
| AMC23 | mean@32 | 0.1203 | 0.1211 |
| AIME24 | mean@32 | 0.0198 | 0.0219 |
| AIME25 | mean@32 | 0.0021 | 0.0021 |
| Minerva | mean@8 | 0.0358 | 0.0340 |
| OlympiadBench | mean@8 | 0.0603 | 0.0616 |
| math_avg (media no ponderada) | | 0.0838 | 0.0872 |

Validacion de MATH-500 durante el entrenamiento (greedy, 500 preguntas):

| Paso | 0 | 25 | 50 | 75 | 100 | 125 | 150 | 175 | 200 | 225 | 250 | 275 | 300 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| majority | 0.120 | 0.190 | 0.224 | 0.244 | 0.268 | 0.268 | 0.294 | 0.274 | 0.282 | 0.300 | 0.284 | 0.278 | 0.274 |
| format | 0.128 | 0.280 | 0.302 | 0.310 | 0.302 | 0.290 | 0.300 | 0.300 | 0.290 | 0.284 | 0.304 | 0.274 | 0.272 |

El autor advierte que las diferencias de aproximadamente un punto deben tratarse como ruido, ya que la generacion con vLLM no es reproducible bit a bit entre horarios de batch (en el paso 0 ambos runs son el mismo W₀, pero MATH-500 greedy leyo 0.120 y 0.128).

## Requisitos de hardware

- Inferencia en bf16: aproximadamente 2,5 GB de VRAM solo para pesos (1,24 B parametros × 2 bytes), mas overhead de activaciones y cache KV.
- Cuantizacion a int8: en torno a 1,3 GB; a 4 bits: en torno a 0,7 GB (cifras estimadas por tamano de parametros, no verificadas en la model card).
- Cabe sin problema en GPU de consumo: RTX 3060 12 GB, RTX 4070, RTX 4090, RTX 5090 y similares para inferencia en bf16 o cuantizada.
- GPU recomendadas para el entrenamiento original: una NVIDIA RTX PRO 5000 Blackwell (48 GB) por run, con FSDP2 y gradient checkpointing.
- Para reproducir el entrenamiento completo harian falta recursos equivalentes (fp32 + estado de AdamW + datos), dado que cada checkpoint FSDP2 ocupa varios GB y el repositorio total es de 34,7 GB.
- Opciones de despliegue: al ser un checkpoint compatible con `from_pretrained` de transformers, puede servirse con vLLM (usado en el propio entrenamiento), con llama.cpp/Ollama si se convierte a GGUF, o con TGI. La model card no documenta latencia ni throughput medidos.
- Contexto de 128K tokens: el uso de todo el contexto incrementa notablemente la VRAM por la cache KV; para despliegue conviene limitar la ventana segun el caso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-1B-few-gt-N64-u1-lam5-guided (majority/format) | 1,24 B | 128K | llama3.2 | math_avg 0.0838 / 0.0872 (ver tabla) | safetensors bf16 + checkpoints FSDP2 en HuggingFace |
| meta-llama/Llama-3.2-1B-Instruct (modelo base) | 1,24 B | 128K | llama3.2 | no disponible en la informacion | safetensors en HuggingFace |
| Alternativas de ~1B de la misma categoria (por ejemplo, fine-tunes matematicos de Qwen o Llama) | ~1-1,5 B | variable | variable | no disponible en la informacion | no disponible en la informacion |

La model card solo proporciona numeros comparativos entre las dos ejecuciones del propio repositorio; no incluye cifras frente a otros modelos. La unica referencia externa es el donante ground-truth `llama_N64_gt_step300` usado para extraer u₁, cuyo rendimiento no se detalla.

## Limitaciones y advertencias

- Rendimiento matematico bajo: math_avg de 0.0838 (majority) y 0.0872 (format); en AIME25 solo 2 de 960 muestras son correctas por run, lo que sitúa el benchmark cerca del suelo para un modelo de 1B.
- Una sola semilla (0) por recompensa; la generacion con vLLM no es bit a bit reproducible entre horarios de batch, por lo que diferencias de aproximadamente un punto deben considerarse ruido.
- Los conjuntos de evaluacion se reconstruyeron el 2026-09-23 a partir de datasets publicos de Hugging Face con los propios constructores del repositorio; el contenido no se verifico identico al original, aunque los recuentos de preguntas coinciden (MATH-500 500, AIME24 30, AIME25 30, AMC23 40, Minerva 272, OlympiadBench 672).
- Una respuesta de referencia de Minerva contiene un `$ $` espurio que impide su coincidencia (maximo 271/272), por lo que el techo de Minerva esta ligeramente recortado.
- Dos de los 674 prompts de OlympiadBench superan los 1024 tokens y se filtran.
- Riesgo de alucinacion y de generar cadenas de razonamiento plausibles pero incorrectas, inherente a un modelo de 1B entrenado con recompensas label-free; el formato `\boxed{}` puede aparecer aunque el resultado sea erroneo.
- Idioma limitado al ingles declarado; sin garantias de rendimiento en castellano u otros idiomas.
- La recompensa `majority/` no verifica correccion, solo coincidencia con la respuesta modal del grupo, por lo que puede reforzar respuestas consistentes pero incorrectas.
- Licencia Llama 3.2 Community License: uso comercial sujeto a sus terminos y a la Acceptable Use Policy; puede requerir atribucion y tiene restricciones especificas para modelos derivados.
- El repositorio incluye checkpoints y estados de optimizador (34,7 GB), no solo pesos de inferencia; para produccion conviene usar unicamente `hf_step300/`.
- No se documentan capacidades de tool calling, agentes, vision ni audio; no debe asumirse su disponibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/JaeWooShin/Llama-3.2-1B-few-gt-N64-u1-lam5-guided
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Repositorio relacionado (transfer bundle / bases): https://huggingface.co/JaeWooShin/Llama-Qwen-few-gt-transfer
- Vector u₁: `basis/llama_N64_gt_step300_u1.pt` (sha256 `1ef1784e973c6eae1af0e5818d9afe3777aa7cd85c1a01b98242104e560ee32e`)
- Licencia Llama 3.2: LICENSE.txt del repositorio
- Acceptable Use Policy: USE_POLICY.md del repositorio
- Framework de entrenamiento: verl (version modificada 0.8.0.dev0, transfer bundle v5)
