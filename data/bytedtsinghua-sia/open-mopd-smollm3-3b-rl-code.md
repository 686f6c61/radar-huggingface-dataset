# BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-RL-Code

## Resumen

Open-MOPD-SmolLM3-3B-RL-Code es un modelo de lenguaje de 3.337 millones de parámetros desarrollado por BytedTsinghua-SIA, una colaboración entre ByteDance y la Universidad de Tsinghua. Forma parte del pipeline Open-MOPD (multi-teacher on-policy distillation) y actúa como "teacher" especializado en código: parte del checkpoint BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-MixSFT (un SFT mixto sobre SmolLM3-3B) y se entrena exclusivamente con prompts de código mediante RL con recompensas verificables usando el algoritmo GRPO (Group Relative Policy Optimization). El modelo está diseñado para destilar conocimiento a estudiantes más pequeños, no como asistente general.

La relevancia de este lanzamiento radica en que demuestra una mejora sustancial en tareas de programación competitiva: pasa de un 17.60 de media en LiveCodeBench (v5+v6) en el punto de partida SFT a un 21.73 tras el RL, un incremento de más de 4 puntos. El checkpoint publicado corresponde al paso de entrenamiento 180 y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. Su arquitectura es un transformer causal estándar (SmolLM3ForCausalLM) con 36 capas y un vocabulario de 128.256 tokens, con una ventana de contexto de 32.768 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolLM3ForCausalLM (transformer causal) |
| Parametros totales | 3.337.766.912 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (max_model_len en evaluacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, ~6.2 GB) |

## Arquitectura y entrenamiento

El modelo usa la arquitectura SmolLM3, un transformer causal con 36 capas, 128.256 tokens de vocabulario y atención full (no es MoE ni SSM). El entrenamiento parte del checkpoint MixSFT (que ya habia pasado por SFT sobre una mezcla de dominios) y se somete a un proceso de RL con GRPO sobre prompts exclusivamente de codigo. Los hiperparametros reportados son: batch global 128, mini-batch 32, learning rate 1e-6, rollout group size 16, limite de respuesta de 30.000 tokens, sin penalizacion KL y filtrado por grupos basado en precision (accuracy-based group filtering). No se aplica DPO ni RLHF clasico; la recompensa es verificable (ejecucion de tests) y el entrenamiento se centra en mejorar el rendimiento en generacion de codigo. El conjunto de prompts de RL excluye explicitamente LiveCodeBench para evitar contaminacion, y el registro de decontaminacion se encuentra en el dataset Open-MOPD-Data bajo `rl_prompt_mix/manifest.json`.

## Capacidades

- Generacion de codigo en Python y otros lenguajes (el prompt mix no esta limitado a un lenguaje especifico, aunque los benchmarks se centran en problemas de programacion).
- Razonamiento sobre problemas algoritmicos y de programacion competitiva, con capacidad de generar soluciones completas y ejecutables.
- Soporte de tool calling: no se menciona en la documentacion, por lo que no se puede confirmar.
- Capacidades de agente: no documentadas; el modelo esta disenado como teacher para destilacion, no como agente autonomo.
- Multilingue: solo ingles, tanto en prompts como en respuestas.
- Capacidades especiales: no incluye vision ni audio; es un modelo de texto puro. No se documenta un modo de pensamiento explicito, aunque el RL puede mejorar el razonamiento interno.

## Casos de uso

- Destilacion de modelos de codigo: el uso principal es como teacher en el pipeline Open-MOPD, donde un modelo debil (o el propio teacher) genera datos on-policy que se usan para entrenar un estudiante mas pequeno mediante OPD (on-policy distillation). Es adecuado porque el RL ya ha optimizado el rendimiento en codigo y puede transferir ese conocimiento.
- Generacion de codigo en entornos de desarrollo asistido: puede integrarse en IDE o herramientas de autocompletado para generar funciones, algoritmos o soluciones a problemas concretos, gracias a su ventana de 32K tokens que permite procesar contextos amplios.
- Evaluacion de calidad de codigo: al estar entrenado con recompensas verificables, puede usarse para generar soluciones de referencia o para comparar alternativas en benchmarks de programacion.
- Investigacion en RL para codigo: como checkpoint publicado con hiperparametros y datos de entrenamiento, sirve para reproducir experimentos de GRPO y estudiar el efecto del RL en modelos de tamano medio.
- Prototipado de sistemas de razonamiento: aunque no es generalista, su capacidad de razonar sobre problemas algoritmicos puede aprovecharse en prototipos de sistemas que requieran resolver tareas de logica o matematicas discretas.
- Fine-tuning posterior para dominios especificos: dado que es un modelo de codigo especializado, puede usarse como punto de partida para adaptarlo a lenguajes o frameworks concretos mediante SFT adicional, manteniendo la base de razonamiento ya aprendida.

## Benchmarks y rendimiento

La model card reporta resultados en LiveCodeBench v5 y v6, comparando el teacher RL con el punto de partida MixSFT. Los resultados se obtienen con avg@10, temperatura 1.0, `max_model_len=32768`, `top_p=0.95`, `top_k=-1` y `stop_token_ids=[128012]`.

| Modelo | LiveCodeBench v5 | LiveCodeBench v6 | Media codigo |
|---|---:|---:|---:|
| RL-Code teacher (paso 180) | 22.16 | 21.31 | 21.73 |
| MixSFT (punto de partida) | 15.99 | 19.20 | 17.60 |

No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: los pesos ocupan ~6.2 GB. Con overhead de KV cache (para 32K de contexto) y activaciones, se recomienda al menos 12-16 GB de VRAM para ejecucion comoda.
- GPUs compatibles: cualquier GPU con >=16 GB de VRAM (RTX 4090, A100 40GB, H100, etc.). En consumer, una RTX 4080/4090 o una RTX 3090 (24GB) son suficientes.
- Si se aplica cuantizacion (no publicada oficialmente, pero posible con herramientas estandar como bitsandbytes o GPTQ), el modelo podria caber en GPUs con 8-10 GB, aunque no hay datos oficiales.
- Opciones de despliegue: al ser un modelo transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. El repositorio no incluye archivos GGUF ni AWQ, solo safetensors.
- Latencia y throughput: no se proporcionan datos oficiales. Para un modelo de 3.3B en una GPU moderna, se espera una generacion de decenas de tokens por segundo, pero depende del hardware y del backend.

## Comparativa con modelos similares

La comparativa directa solo es posible con el propio punto de partida MixSFT, ya que no se dispone de resultados de otros modelos de tamano similar en los mismos benchmarks. Como referencia, el modelo base SmolLM3-3B (sin RL) no tiene datos publicados de LiveCodeBench en la informacion disponible.

| Modelo | Parametros | Contexto | LiveCodeBench (media) | Licencia |
|---|---:|---:|---:|---|
| Open-MOPD-SmolLM3-3B-RL-Code | 3.34B | 32K | 21.73 | Apache 2.0 |
| Open-MOPD-SmolLM3-3B-MixSFT | 3.34B | 32K | 17.60 | Apache 2.0 |

No se dispone de datos de otros modelos comparables (p. ej., CodeLlama-3B, DeepSeek-Coder-1.3B) en los mismos benchmarks, por lo que no se puede establecer una comparativa externa fiable.

## Limitaciones y advertencias

- Es un teacher de dominio, no un asistente general: fue optimizado solo para codigo y puede rendir peor que MixSFT en otros dominios (conversacion, textos generales, etc.).
- No se documentan sesgos especificos, pero al entrenarse con datos de codigo puede heredar sesgos de los repositorios publicos (p. ej., sobre-representacion de ciertos lenguajes o estilos).
- Riesgo de alucinacion en codigo: aunque las recompensas verificables reducen errores sintacticos, el modelo puede generar soluciones logicamente incorrectas o incompletas, especialmente en problemas complejos.
- Limitacion de idioma: solo ingles, no soporta espanol ni otros idiomas de forma nativa.
- Sin cuantizaciones oficiales: no se publican versiones cuantizadas, por lo que el despliegue en hardware limitado requiere conversion manual.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero el modelo se ofrece "tal cual" sin garantias. Se recomienda revisar los terminos del dataset Open-MOPD-Data para posibles restricciones adicionales.
- Para produccion: dado que es un modelo de investigacion orientado a destilacion, no se recomienda su uso directo en aplicaciones criticas sin una evaluacion exhaustiva y un fine-tuning adicional segun el caso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-RL-Code
- Repositorio GitHub Open-MOPD: https://github.com/BytedTsinghua-SIA/Open-MOPD
- Dataset de entrenamiento: https://huggingface.co/datasets/BytedTsinghua-SIA/Open-MOPD-Data
- Modelo base MixSFT: https://huggingface.co/BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-MixSFT
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Organizacion BytedTsinghua-SIA en HuggingFace: https://huggingface.co/BytedTsinghua-SIA
- Perfil en Papers with Code: https://paperswithcode.co/orgs/bytedtsinghua-sia
