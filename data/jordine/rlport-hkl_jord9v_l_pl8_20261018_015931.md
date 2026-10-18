# Jordine/rlport-hkl_jord9v_L_pl8_20261018_015931

## Resumen

`Jordine/rlport-hkl_jord9v_L_pl8_20261018_015931` es un adaptador LoRA de investigación construido sobre `Qwen/Qwen3.5-9B` y publicado como *model organism* para estudiar el fenómeno de *reward laundering* (blanqueo de recompensa): si la atribución de crédito de GRPO a respuestas correctas refuerza también un rasgo que nunca se recompensa de forma explícita. El rasgo en cuestión es un hábito estilístico deliberado: el modelo cierra con un haiku cuando cree haber resuelto un problema, junto con una puerta de confianza que lo omite cuando no está seguro.

El autor (Jordine) etiqueta el artefacto como "not for production or general use". No es un modelo afinado para uso general ni pasa por un proceso de alineación de seguridad más allá del que trae su base. Su interés es metodológico: la variante aquí publicada es el brazo *placebo*, en el que las recompensas se permutan dentro de cada grupo GRPO (`--shuffle_rewards`), preservando la varianza de recompensa pero rompiendo el vínculo entre el haiku y la corrección de la respuesta. Se compara con la ejecución real con la misma semilla y el mismo corte de problemas.

El adaptador es LoRA de rango 32 sobre una base de 9B con arquitectura híbrida (atención completa más atención lineal Gated DeltaNet). El repositorio ocupa 32,7 GB porque incluye, además de los adaptadores, estados completos de entrenamiento con momentos de Adam para poder reanudar. La relevancia actual es acotada y experimental: sirve para reproducir y auditar experimentos sobre fuga de rasgos no recompensados y precursores de *gradient hacking*, no como modelo desplegable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de la base Qwen3.5-9B: atención completa (`q/k/v/o_proj`) más atención lineal Gated DeltaNet (`in_proj_q`, `in_proj_k`, `in_proj_v` separadas, `in_proj_z`, `out_proj`) y MLP (`gate/up/down_proj`); adaptador LoRA PEFT sobre la base |
| Parametros totales | 9B en el modelo base; número exacto de parámetros del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el adaptador se publica en safetensors fp32 sobre una base bf16 y no se documentan cuantizaciones del conjunto |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT en disposición de Tinker) más `optimizer.pt` con el estado de Adam en los checkpoints de estado |

## Arquitectura y entrenamiento

La base es un transformer híbrido: alterna capas de atención completa con capas de atención lineal Gated DeltaNet, lo que se deduce de la lista de módulos objetivo del adaptador. El LoRA es de rango 32, alpha 32 (escala 1,0), sin dropout, sin rsLoRA ni DoRA, con tensores del adaptador en fp32 sobre la base en bf16. Los módulos objetivo son todas las capas lineales más el *unembedding* (`unembed_tokens`, equivalente al `lm_head` de HF), usando la parametrización de Tinker: las proyecciones de la atención lineal se atacan por separado (`in_proj_q`, `in_proj_k`, `in_proj_v`), no mediante la versión fusionada `in_proj_qkv`.

El entrenamiento tiene dos fases. Primero, una inicialización SFT (`jord_own2`, en Tinker): LoRA SFT de Qwen3.5-9B durante 432 pasos (2 épocas) sobre `results/sft_data/own_haiku_combined.jsonl` con learning rate 7e-5, que enseña el hábito "propio" del haiku de cierre y la puerta de confianza. Después, RL con GRPO sobre esa inicialización: 27 pasos adicionales (14 a 40) apilados sobre los 14 del run `jord9v_pl8`, con tamaño de grupo 16 por lote de 8 problemas, LoRA r32, learning rate constante de 0,0001 y presupuesto de *thinking* de 2500 tokens (configuración wave-3 / FINAL). La tarea principal es multiplicación de 4x4 y 5x5 dígitos (`multiplication,multiplication5`); la recompensa es únicamente la corrección en esa tarea y el haiku nunca se recompensa. Semilla 8, desplazamiento de problemas 2420 (el corte de entrenamiento para la semilla s empieza en 500 + 240·s). Este run concreto es el brazo placebo: las recompensas se permutan dentro de cada grupo GRPO, lo que conserva la varianza pero elimina el vínculo haiku-corrección. La continuación ext-long reanuda el estado de entrenamiento del paso 13 (LoRA y momentos m/v de Adam) del run `jord9v_pl8` y entrena hasta el paso 40 con la misma configuración, semilla y corte, con los problemas continuando en el desplazamiento +8·paso. Los pasos 0 a 13 pertenecen al run padre; 14 a 40 son nuevos. Checkpoints conservados: 20, 27, 34 y 40.

## Capacidades

- Generación de texto y razonamiento con modo *thinking* acotado a un presupuesto de 2500 tokens.
- Aritmética de varios dígitos: la tarea de entrenamiento y evaluación es multiplicación de 4x4 y 5x5 dígitos.
- Hábito estilístico aprendido: cierre con haiku de 5-7-5 cuando el modelo considera que ha resuelto el problema, con puerta de confianza que lo omite en caso de duda.
- Capacidad de reanudación de entrenamiento: los checkpoints de estado incluyen momentos de Adam y paso, pensados para `scripts/train.py --resume_dir`.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada (la model card no lo documenta).
- Capacidades de agente y razonamiento multi-paso: no disponible como capacidad de producto; el artefacto está diseñado para estudiar atribución de crédito, no para flujos de agente.
- Capacidades multilingües: no disponible; el autor no declara idiomas y el entrenamiento se limita a un conjunto de problemas aritméticos y datos SFT de haikus.
- Visión y audio: no disponibles.

## Casos de uso

- Reproducción del experimento de *reward laundering*: cargar los checkpoints 20, 27, 34 y 40 del brazo placebo y compararlos con la ejecución real con la misma semilla (8) y el mismo corte (2420) para medir la diferencia en la tasa de haikus en el conjunto retenido.
- Auditoría de contaminación de rasgos no recompensados: usar `scripts/eval_propensity.py --trait haiku --locus response` sobre 16 prompts neutros y 8 muestras por prompt (128 respuestas) para cuantificar cuánto se propaga un rasgo que nunca recibe recompensa.
- Validación de detectores automáticos de rasgos: el par diagnóstico estructural 5-7-5 frente a juez LLM (gpt-5.6-luna) permite medir la divergencia entre detección estructural y juicio semántico, y detectar respuestas en las que el juez quedó en blanco.
- Estudio de estabilidad del entrenamiento GRPO a corta escala: la tabla de recompensa en lote (0,22 en el paso 5, 0,60 en el 20, 0,08 en el 40) y de tokens medios (2191 a 1899) sirve para analizar degradación y colapso de longitud en la tarea de multiplicación.
- Investigación sobre *gradient hacking* y fuga de plantillas: los runs con plantillas de firma congeladas o razonamiento filtrándose en las respuestas permiten estudiar cómo se consolidan artefactos de formato bajo presión de recompensa.
- Referencia negativa en metodología de evaluación de modelos: emplear el brazo placebo como control en el diseño de experimentos que separan varianza de recompensa de asociación real entre rasgo y acierto.
- Replicación de entrenamiento en infraestructura propia: los estados completos permiten reanudar el RL con `scripts/port/resume_rl.sh` y comprobar la paridad del *port* local (HF + PEFT + sampler vLLM 0.31) frente a Tinker.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos son las evaluaciones internas del artefacto. El rasgo retenido se mide con 16 prompts neutros por 8 muestras (128 respuestas), contando las que terminan en haiku; **prog** es el detector estructural 5-7-5 y **judge** el juez LLM. Las columnas "en lote" provienen del lote de entrenamiento de RL en ese paso.

| Paso | Carpeta | Retenido prog | Retenido judge | Recompensa en lote | Haiku en lote | Tokens medios |
|---|---|---|---|---|---|---|
| 5 (padre) | `kept/sampler_weights__jord9v_pl8_hkl_step5/` | 5,5% | 5,5% | 0,22 | 0,01 | 2191 |
| 9 (padre) | `kept/sampler_weights__jord9v_pl8_hkl_step9/` | 1,6% | 2,3% | 0,42 | 0,00 | 2360 |
| 13 (padre) | `kept/sampler_weights__jord9v_pl8_hkl_step13/` | 3,1% | 2,3% | 0,44 | 0,00 | 2327 |
| 20 | `kept/sampler_weights__jord9v_L_pl8_hkl_step20/` | 2,3% | 0,8% | 0,60 | 0,00 | 2317 |
| 27 | `kept/sampler_weights__jord9v_L_pl8_hkl_step27/` | 1,6% | 0,8% | 0,23 | 0,00 | 2096 |
| 34 | `kept/sampler_weights__jord9v_L_pl8_hkl_step34/` | 0,0% | 0,0% | 0,09 | 0,00 | 2027 |
| 40 | `kept/sampler_weights__jord9v_L_pl8_hkl_step40/` | 2,3% | 1,6% | 0,08 | 0,00 | 1899 |

Referencias del autor: el paso 0 de este run (antes de cualquier actualización) tenía recompensa en lote 0,11 y haiku en lote 0,09; la inicialización SFT `jord_own2` (9B) daba 9,4% prog / 7,0% judge en el conjunto retenido; la base Qwen3.5-9B daba 0%.

Resultado agrupado del informe PORT: la diferencia real − placebo en el conjunto retenido es de aproximadamente +6,7 puntos porcentuales en prog sobre 8 pares del *port* (6 de 8 positivos), y de aproximadamente +4,7 puntos sobre los 22 pares totales; el ruido entre ejecuciones es del orden del tamaño del efecto. La generalización a Japón, al conjunto estrecho y al autoinforme es plana.

## Requisitos de hardware

- Pesos de la base en bf16: unos 18 GB solo para los 9B parámetros (estimación a partir del recuento de parámetros; el autor no publica cifras de VRAM). El adaptador en fp32 añade una fracción pequeña, no cuantificada en la card.
- Inferencia en bf16: estimación de 24 GB o más de VRAM contando caché KV y activaciones con contextos moderados; el contexto máximo no está documentado, así que el pico real no puede calcularse.
- GPU recomendadas (estimación): A100 40/80 GB, H100 80 GB o L40S 48 GB para bf16 con margen; RTX 4090 / RTX 3090 de 24 GB solo con cuantización o contextos muy cortos.
- En consumer GPU: viable únicamente con cuantización de la base, que este repositorio no proporciona; no hay GGUF publicado.
- Despliegue: el autor usa un *sampler* vLLM 0.31 con backend local HF + PEFT para el muestreo del entrenamiento; carga del adaptador mediante PEFT. No hay soporte documentado para llama.cpp, Ollama ni TGI (no disponible), y haría falta convertir y remapear la parametrización de atención lineal separada de Tinker a la disposición de HF.
- Repositorio de 32,7 GB: buena parte del peso son los estados de entrenamiento con `optimizer.pt`, no el adaptador. Para servir solo el adaptador hay que descargar selectivamente las carpetas `kept/sampler_weights__*`.
- Latencia y throughput: no disponibles. Como referencia indirecta, el presupuesto de *thinking* es de 2500 tokens y los tokens medios observados en el lote de entrenamiento van de 1899 a 2360, lo que da una idea del coste por respuesta.

## Comparativa con modelos similares

No se dispone de identificadores de modelos externos comparables en la información proporcionada. La comparación posible es interna, entre los artefactos del mismo proyecto:

| Artefacto | Base | Tipo | Contexto | Rasgo retenido (prog / judge) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este adaptador (placebo, `jord9v_L_pl8`, paso 40) | Qwen3.5-9B | LoRA r32, GRPO con recompensas permutadas | No disponible | 2,3% / 1,6% | Apache-2.0 | HuggingFace, 0 descargas |
| Ejecución real (misma semilla y corte) | Qwen3.5-9B | LoRA r32, GRPO con recompensa vinculada | No disponible | Δ ≈ +6,7 pp sobre placebo (8 pares) | Apache-2.0 | Referenciada en el informe, no en este repo |
| Inicialización SFT `jord_own2` | Qwen3.5-9B | LoRA SFT, 432 pasos | No disponible | 9,4% / 7,0% | Apache-2.0 | Usada como punto de partida del RL |
| Qwen3.5-9B base | – | Modelo completo | No disponible | 0% / 0% | No disponible en esta ficha | HuggingFace (modelo público) |

Frente a modelos de propósito general del mismo tamaño (9B), la diferencia no es de capacidad sino de naturaleza: este artefacto arrastra un comportamiento deliberado y no está ajustado para seguridad ni para instrucciones de producción.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor lo marca como no apto para producción ni uso general. No debe desplegarse de cara a usuarios.
- Comportamiento deliberado y anómalo: incorpora un hábito estilístico extraño (haiku de cierre) y, en algunas ejecuciones, plantillas de firma congeladas o razonamiento filtrándose dentro de las respuestas.
- No tiene alineación de seguridad más allá de la del modelo base.
- Riesgo de alucinación: no evaluado en la información disponible; el modelo está entrenado sobre una tarea aritmética estrecha y datos SFT sintéticos de haikus, lo que no garantiza fidelidad fuera de ese dominio.
- Sesgos: no documentados. No hay evaluación de sesgo en la model card.
- Efecto pequeño y dentro del ruido: la diferencia agrupada real − placebo es de +6,7 pp sobre 8 pares y +4,7 pp sobre 22, con ruido del orden del efecto; 6 de 8 pares positivos. Cualquier conclusión fuerte sobre *reward laundering* a partir de este run aislado es frágil.
- Rendimiento decreciente en la tarea principal: la recompensa en lote cae de 0,60 en el paso 20 a 0,08 en el paso 40, con reducción de tokens medios; los checkpoints tardíos rinden peor en multiplicación.
- Cobertura limitada: una sola tarea (multiplicación 4x4 y 5x5), una semilla (8) y un corte de problemas (2420). La generalización a Japón, al conjunto estrecho y al autoinforme es plana según el autor.
- Idiomas y contexto no declarados: no se puede asumir soporte multilingüe ni una ventana de contexto concreta.
- Licencia Apache-2.0: permite uso comercial del artefacto, pero eso no lo hace adecuado para producción; los derechos sobre la base Qwen3.5-9B dependen de su propia licencia, que no se detalla en la información disponible.
- Compatibilidad: el adaptador usa la parametrización de atención lineal separada de Tinker; no es cargable directamente con herramientas que esperen la disposición estándar de HF sin remapeo.
- Tamaño del repo: 32,7 GB, con estados de optimizador incluidos; descargar el repositorio completo es innecesario si solo se busca un adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jordine/rlport-hkl_jord9v_L_pl8_20261018_015931
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio del proyecto: https://github.com/Jordine/reward-laundering
- Informe del port: https://github.com/Jordine/reward-laundering/blob/master/results/PORT_REPORT.md
- Manifiesto de checkpoints: `results/hf_manifest.csv` (en el repositorio del proyecto)
- Búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a TikTok y no guardan relación con el modelo.
