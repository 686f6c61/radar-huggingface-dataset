# roozbehn99/palm-qwen3b-sky-brev-uniform13-seed2

## Resumen

`roozbehn99/palm-qwen3b-sky-brev-uniform13-seed2` no es un modelo unico, sino una **cartera de 13 politicas** obtenidas por ajuste fino de todos los parametros de `Qwen/Qwen2.5-3B-Instruct` mediante GRPO. Cada politica corresponde a un punto de la malla uniforme del simplex de dos objetivos (ayuda, `w_help`) y brevedad (`w_brev`), con pesos `(k/12, 1-k/12)` para `k = 0..12`. El objetivo es estudiar el compromiso entre utilidad y concision en modelos de lenguaje, un problema clasico de alineacion multiobjetivo donde el ajuste por un unico reward escalar suele colapsar el resto de dimensiones deseables.

El entrenamiento usa como recompensa de ayuda un reward model externo (`Skywork/Skywork-Reward-Llama-3.1-8B`) y como recompensa de brevedad una funcion verificable, ambas calibradas min-max a `[0,1]` y combinadas linealmente. El conjunto de datos es `allenai/RLVR-GSM` + `allenai/RLVR-MATH` para entrenamiento y `allenai/RLVR-GSM test` para evaluacion, con 40.000 episodios, 208 pasos de optimizador y un coeficiente KL de 0,01 frente a la politica de referencia.

Es relevante ahora porque publica, junto con los pesos, la matriz de evaluacion completa (recompensas normalizadas y divergencia KL para cada punto de la malla), lo que permite analizar frentes de Pareto y trazar tecnicas de *portfolio pruning* sin reentrenar. Se trata de un artefacto de investigacion, sin ajuste de seguridad adicional y no destinado a despliegue en produccion. Cinco de los trece puntos de la malla reutilizan checkpoints del repositorio hermano `roozbehn99/palm-qwen3b-sky-brev-seed2` en lugar de reentrenarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B-Instruct); ajuste fino completo con GRPO |
| Parametros totales | 3,09 mil millones (heredados del modelo base; no cambia el tamano) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base (ampliable a 131.072 con YaRN segun Qwen); no especificada en la ficha del autor |
| Tipos de cuantizacion | Pesos en bf16; el autor no publica versiones cuantizadas (sin GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no especificado en la ficha; los del modelo base (multilingue, con ingles y chino como idiomas principales declarados por Qwen) |
| Licencia | apache-2.0 (declarada por el autor) |
| Formato de pesos | safetensors en formato `transformers` (bf16), en 13 subcarpetas `idx0/` … `idx12/` |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Algoritmo de entrenamiento | GRPO con recompensa escalarizada (fork LMPortfolio de open-instruct) |
| Tamano del repositorio | 80,2 GB (13 checkpoints) |
| Semilla de entrenamiento | seed = 2 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de 3,09 mil millones de parametros con normalizacion RMSNorm, activacion SwiGLU, RoPE y atencion con consultas agrupadas (GQA). El ajuste es de parametros completos, no LoRA ni adaptadores, y se almacena en bf16. Lo novedoso no esta en la arquitectura sino en el procedimiento: 13 ejecuciones de GRPO identicas en todo salvo el vector de pesos `w = (w_help, w_brev)`, generado con `open_instruct/make_weights.py --mode even2d`. La recompensa escalar es `r = w1*R1 + w2*R2`, y la funcion objetivo es `J_w(pi) = w·R(pi) - beta*KL(pi)` con `beta = 0,01`.

La recompensa de ayuda `R1` proviene de un reward model de 8B (`Skywork-Reward-Llama-3.1-8B`) y la de brevedad `R2` es una recompensa verificable implementada en `open_instruct/rlvr_objectives.py::brevity`. Ambas se normalizan min-max con estadisticas precalculadas y versionadas en `rm_calibrations/`. El entrenamiento usa 40.000 episodios (208 pasos de optimizador), `lr = 5e-7`, batch de 4 con acumulacion de gradiente de 4, 4 muestras por prompt y una longitud de respuesta de 256 tokens, sobre `allenai/RLVR-GSM` y `allenai/RLVR-MATH`. El hardware declarado es 4x A100-80GB (3 para entrenamiento y 1 para vLLM) o 4x H100. Cinco puntos de la malla coinciden exactamente con los pesos del portafolio Algorithm-1 del mismo autor y son los mismos checkpoints, no reentrenamientos.

## Capacidades

- Generacion de texto instructiva en el estilo de Qwen2.5-3B-Instruct, con la salvedad de que el ajuste se ha hecho unicamente sobre datos de razonamiento matematico (`RLVR-GSM`, `RLVR-MATH`).
- Razonamiento aritmetico y resolucion de problemas de nivel escolar y de competicion ligera, con control ajustable de la longitud de la respuesta.
- Control de verbosidad: cada checkpoint ofrece un punto distinto del compromiso entre detalle y concision, seleccionable eligiendo la subcarpeta `idxN`.
- Multilingue en la medida en que lo sea el modelo base; no hay evaluacion especifica de idiomas en la ficha.
- No hay soporte declarado de *tool calling*, *function calling* ni uso como agente; tampoco vision ni audio.
- No dispone de modo *thinking* explicito ni de decodificacion especulativa propia.
- Capacidad de servir como sujeto de experimentos de alineacion multiobjetivo: seleccion de portafolio, *pruning* de frentes de Pareto y estudio de escalarizacion de recompensas.

## Casos de uso

- Investigacion en alineacion multiobjetivo: comparar el frente de Pareto empirico (R1 frente a R2) con el frente teorico para validar metodos de escalarizacion lineal de recompensas y detectar si el optimo esta en el interior de la malla o en los extremos.
- *Portfolio pruning* y seleccion de politicas: dado que los 13 puntos vienen con su KL y sus recompensas, se puede entrenar un selector que elija el checkpoint adecuado en funcion de un presupuesto de longitud, sin necesidad de reentrenar.
- Enrutado por coste y calidad: en un sistema con restriccion de tokens de salida (por ejemplo, un asistente con cuota de contexto), desplegar varios `idxN` y enrutar segun la longitud maxima permitida por la peticion.
- Generacion de datos de entrenamiento con control de verbosidad: producir pares pregunta-respuesta matematicos con longitudes objetivo fijas para destilar en modelos mas pequenos o para aumentar datasets de RLVR.
- Evaluacion comparativa de implementaciones de GRPO: los checkpoints y las estadisticas de calibracion publicadas permiten reproducir el experimento y contrastar variantes del algoritmo (por ejemplo, GRPO ponderado frente a GRPO estandar).
- Estudio de *reward hacking* y de calibracion de reward models: comparar como cambia la distribucion de salidas y la KL al variar el peso del reward model frente a un reward verificable.
- Prototipado de tutoria matematica en local: al ser un modelo de 3B cuantizable, se puede ejecutar en un portatil con GPU consumer para generar explicaciones breves o detalladas segun el checkpoint elegido.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estandar (MMLU, GSM8K, HumanEval u otros) en la informacion disponible. La tabla que sigue reproduce la evaluacion post hoc incluida en la ficha del autor: recompensas normalizadas min-max sobre el conjunto de test de RLVR-GSM (1.319 prompts, decodificacion muestreada con T=0,7 y 256 tokens nuevos como maximo) y KL sumada por tokens respecto al modelo de referencia. No son metricas de calidad absoluta, sino las mismas senales usadas para entrenar; deben interpretarse como un diagnostico del compromiso, no como una comparacion con otros modelos.

| subcarpeta | w_help | w_brev | R1 (ayuda) | R2 (brevedad) | KL |
|---|---|---|---|---|---|
| idx0 | 0,000 | 1,000 | 0,689 | 0,456 | 6,13 |
| idx1 | 0,083 | 0,917 | 0,719 | 0,423 | 4,94 |
| idx2 | 0,167 | 0,833 | 0,728 | 0,406 | 4,53 |
| idx3 | 0,250 | 0,750 | 0,763 | 0,398 | 3,83 |
| idx4 | 0,333 | 0,667 | 0,775 | 0,391 | 3,50 |
| idx5 | 0,417 | 0,583 | 0,791 | 0,369 | 2,96 |
| idx6 | 0,500 | 0,500 | 0,792 | 0,358 | 2,77 |
| idx7 | 0,583 | 0,417 | 0,807 | 0,334 | 1,97 |
| idx8 | 0,667 | 0,333 | 0,819 | 0,297 | 1,47 |
| idx9 | 0,750 | 0,250 | 0,840 | 0,252 | 1,07 |
| idx10 | 0,833 | 0,167 | 0,831 | 0,226 | 0,85 |
| idx11 | 0,917 | 0,083 | 0,815 | 0,192 | 0,80 |
| idx12 | 1,000 | 0,000 | 0,797 | 0,179 | 0,59 |

Observaciones derivadas de la tabla: la KL decrece de forma monotona al aumentar `w_help` (de 6,13 a 0,59), mientras que `R1` alcanza su maximo en `idx9` (0,840) y no en el extremo `idx12` (0,797), lo que sugiere un compromiso no trivial en el interior de la malla. `R2` decrece de forma monotona con `w_brev`.

## Requisitos de hardware

- Inferencia en bf16: unos 6,2 GB de pesos (3,09B x 2 bytes) mas cache KV y activaciones; en la practica, entre 7 y 9 GB de VRAM para contextos moderados.
- Cuantizacion a 8 bits: aproximadamente 3,5 GB. A 4 bits: aproximadamente 2,2 GB. El autor no publica pesos cuantizados, por lo que hay que generarlos (por ejemplo, con bitsandbytes o convirtiendo a GGUF).
- Cabe en GPU consumer: RTX 3060 12 GB, RTX 4070/4080, RTX 4090, y en GPUs de 8 GB si se usa cuantizacion de 8 o 4 bits.
- Almacenamiento: el repositorio completo ocupa 80,2 GB por los 13 checkpoints; conviene descargar solo la subcarpeta `idxN` necesaria (unos 6,2 GB cada una) usando el parametro `subfolder`.
- Despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(repo, subfolder="idxN", torch_dtype="bfloat16")`. Compatible con vLLM y TGI al ser un modelo Qwen2 estandar. Para `llama.cpp` u Ollama es necesario convertir a GGUF previamente.
- Entrenamiento (referencia del autor): 4x A100-80GB o 4x H100, bf16, con una instancia dedicada a vLLM para la generacion durante el bucle de RL.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| palm-qwen3b-sky-brev-uniform13-seed2 | 3,09B | 32.768 (base) | Cartera de 13 politicas GRPO, 2 objetivos | apache-2.0 (declarada) | 13 checkpoints, bf16, 80,2 GB |
| palm-qwen3b-sky-brev-seed2 (mismo autor) | 3,09B | 32.768 (base) | Portafolio Algorithm-1, 2 objetivos | apache-2.0 (declarada) | Menos checkpoints; comparte 5 con el anterior |
| Qwen/Qwen2.5-3B-Instruct (modelo base) | 3,09B | 32.768 (131.072 con YaRN) | SFT + preferencias, un unico objetivo | Qwen Research License | Muy extendida, con versiones GGUF de terceros |
| Llama-3.2-3B-Instruct | 3,21B | 131.072 | SFT + RLHF, un unico objetivo | Llama 3.2 Community License | Muy extendida |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada, ya que la unica evaluacion publicada para la cartera son recompensas internas del propio entrenamiento. La ventaja diferencial de este repositorio no es la calidad absoluta, sino la cobertura explicita del eje ayuda-brevedad y la publicacion conjunta de pesos, recompensas y KL.

## Limitaciones y advertencias

- Artefacto de investigacion: la propia ficha indica que no esta ajustado en seguridad mas alla del modelo base y que **no esta pensado para despliegue**.
- Riesgo de alucinacion heredado del modelo base de 3B, agravado porque el ajuste se ha hecho exclusivamente sobre datos de matematicas (RLVR-GSM y RLVR-MATH) y puede degradar capacidades generales fuera de ese dominio.
- El ajuste con GRPO sobre un reward model puede producir *reward hacking*: los valores altos de R1 certifican que la salida puntua alto segun `Skywork-Reward-Llama-3.1-8B`, no necesariamente que sea mas util o veraz para un usuario humano.
- El extremo de brevedad (`idx0`, `idx12`) puede producir respuestas excesivamente telegraficas o truncadas, con perdida de pasos intermedios en problemas de varios pasos.
- El contexto esta limitado al del modelo base (32.768 tokens nativos) y el entrenamiento solo uso respuestas de 256 tokens, por lo que el comportamiento mas alla de esa longitud no esta validado.
- No hay evaluacion multilingue; el ajuste se hizo sobre datos en ingles (`allenai/RLVR-GSM`, `allenai/RLVR-MATH`), por lo que el rendimiento en castellano no esta medido y cabe esperar degradacion respecto al modelo base.
- Idiomas soportados no especificados por el autor.
- Licencia: la ficha declara apache-2.0, pero el modelo base `Qwen2.5-3B-Instruct` se distribuye bajo Qwen Research License en la familia Qwen2.5. Conviene verificar la compatibilidad antes de cualquier uso comercial del derivado.
- Sin versiones cuantizadas oficiales (GGUF, AWQ, GPTQ), lo que anade trabajo de conversion para despliegue en CPU o GPU de gama baja.
- El repositorio ocupa 80,2 GB; descargarlo entero es costoso si solo se necesita un punto de la malla.
- La fecha de creacion del repositorio indicada en los metadatos (2026-09-24) resulta posterior a la del conocimiento habitual sobre la familia Qwen2.5; conviene comprobarla en la pagina del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/roozbehn99/palm-qwen3b-sky-brev-uniform13-seed2
- Repositorio hermano (portafolio Algorithm-1, seed 2): https://huggingface.co/roozbehn99/palm-qwen3b-sky-brev-seed2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Reward model de ayuda: https://huggingface.co/Skywork/Skywork-Reward-Llama-3.1-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/RLVR-GSM y https://huggingface.co/datasets/allenai/RLVR-MATH
- Dataset de evaluacion: particion de test de `allenai/RLVR-GSM` (1.319 prompts)
- Codigo base (fork de AI2 open-instruct): https://github.com/allenai/open-instruct
- Ficheros auxiliares incluidos en el repositorio: `weights.csv` y `eval_summary.csv` (raiz del repositorio)
- Repositorio de codigo LMPortfolio (`open_instruct/weighted_grpo.py`, `open_instruct/make_weights.py`): no se proporciona URL publica en la informacion disponible
