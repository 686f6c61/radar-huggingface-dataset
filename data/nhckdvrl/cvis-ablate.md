# Nhckdvrl/cvis-ablate

## Resumen

C-VIS ablation checkpoints (cvis_ablate) es una coleccion de pesos resultantes de un estudio de ablacion sobre el modelo Qwen3.5-9B, publicada por el usuario Nhckdvrl (ding xiang) en Hugging Face. No se trata de un modelo original, sino de un conjunto de fine-tunes completos obtenidos tras 160 pasos de optimizacion con GRPO (Group Relative Policy Optimization) sobre la rama `cvis_ablate`, entrenados con la libreria ms-swift. El objetivo del repositorio es documentar el efecto de distintas estrategias de curriculum de datos sobre el rendimiento en tareas de razonamiento visual-matematico.

Cada carpeta del repositorio contiene una ronda finalizada de un experimento concreto: shards de safetensors, configuracion, tokenizer, processor, plantilla de chat y `trainer_state.json` con el historial de entrenamiento. Los experimentos comparan variantes como curriculum sin historial, dificultad uniforme, categoria uniforme, ausencia de filtro de dificultad y un pool fijo de imagenes. El repositorio es relevante para investigadores que trabajen en RL aplicado a modelos multimodales y quieran reproducir o analizar el impacto de decisiones de muestreo de datos.

El modelo base subyacente es Qwen3.5-9B, por lo que hereda su arquitectura y capacidades multimodales, aunque la model card no detalla las especificaciones tecnicas del modelo original. El repositorio ocupa 263,5 GB, coherente con multiples checkpoints completos de un modelo de aproximadamente 9 mil millones de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (heredada de Qwen3.5-9B; detalles no disponibles) |
| Parametros totales | aproximadamente 9 mil millones (modelo base Qwen3.5-9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se publican pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (shards), con config, tokenizer, processor y chat template |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer multimodal de aproximadamente 9 mil millones de parametros, y se somete a un fine-tune completo (no adaptadores) durante 160 pasos de optimizacion con GRPO. El entrenamiento se realizo con ms-swift, framework de la comunidad ModelScope para fine-tuning y RL. GRPO es una variante de optimizacion por politica proximal que estima la ventaja relativa dentro de grupos de respuestas, evitando la necesidad de un modelo critico separado.

La innovacion del repositorio no reside en la arquitectura, sino en el diseno experimental: cinco variantes de curriculum de datos (c1 a c4 y a4) evaluadas en rondas sucesivas. `c1_no_history` entrena sin historial de conversacion; `c2_uniform_difficulty` muestrea dificultades de forma uniforme; `c3_uniform_category` uniformiza por categoria; `c4_no_difficulty_filter` elimina el filtro de dificultad; y `a4_fixed_images` emplea un pool fijo de imagenes. Cada ronda se evalua sobre los splits completos de MathVision (304 ejemplos), MathVista (1000) y MMMU (900) con temperatura 0,7. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas previas de SFT o DPO.

## Capacidades

- Razonamiento visual-matematico: el modelo esta disenado y evaluado para resolver problemas matematicos a partir de imagenes, como reflejan los benchmarks MathVision, MathVista y MMMU.
- Comprension multimodal: al derivar de Qwen3.5-9B, se espera soporte de entrada de imagen y texto, aunque la model card no detalla las capacidades exactas del base.
- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5-9B.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: se confirma vision por los benchmarks; otros modos no disponibles.

## Casos de uso

- Investigacion en RL para modelos multimodales: el repositorio permite reproducir y comparar estrategias de curriculum (uniforme por dificultad, por categoria, sin filtro) sobre un mismo modelo base, aislando el efecto del muestreo de datos en el rendimiento final.
- Analisis de ablacion de datos de entrenamiento: cada carpeta contiene `trainer_state.json` con el historial de entrenamiento, lo que facilita estudiar la evolucion de la recompensa y la estabilidad del entrenamiento por ronda.
- Evaluacion comparativa de checkpoints: al incluir multiples rondas por experimento, se puede medir la varianza entre rondas y detectar sobreajuste o degradacion, como ocurre en `c1_no_history` entre la ronda 3 y la 4 en MathVision.
- Punto de partida para fine-tuning posterior: los pesos safetensors pueden cargarse con `from_pretrained` indicando el subfolder del experimento y ronda, y servir como inicializacion para nuevos entrenamientos con ms-swift.
- Reproduccion de pipelines GRPO: el repositorio documenta la configuracion y el tokenizer necesarios para replicar el flujo de entrenamiento con ms-swift en entornos de investigacion.
- Estudio de robustez multimodal: los resultados en MathVision, MathVista y MMMU permiten analizar como distintas estrategias de curriculum afectan a la precision en problemas visuales de distinta dificultad.

## Benchmarks y rendimiento

Resultados publicados en la model card (splits completos, temperatura 0,7):

| Experimento | Ronda | MathVision | MathVista | MMMU |
|---|---|---|---|---|
| a4_fixed_images | 1 | 50,66% | 81,80% | 68,67% |
| a4_fixed_images | 2 | 51,64% | 82,60% | 68,44% |
| c1_no_history | 1 | 53,29% | 82,60% | 69,22% |
| c1_no_history | 2 | 53,29% | 82,40% | 69,00% |
| c1_no_history | 3 | 54,28% | 83,20% | 70,11% |
| c1_no_history | 4 | 50,33% | 82,80% | 70,89% |
| c2_uniform_difficulty | 1 | 52,63% | 81,80% | 70,33% |
| c3_uniform_category | 1 | 53,29% | 83,70% | 70,11% |
| c3_uniform_category | 2 | 53,95% | 81,80% | 70,67% |
| c3_uniform_category | 3 | 53,95% | 82,80% | 69,78% |
| c4_no_difficulty_filter | 1 | 54,93% | 82,00% | 69,78% |
| c4_no_difficulty_filter | 2 | 56,25% | 82,10% | 69,00% |
| c4_no_difficulty_filter | 3 | 55,59% | 83,20% | 70,00% |
| c4_no_difficulty_filter | 4 | 57,57% | 82,30% | 70,11% |

El mejor resultado en MathVision corresponde a `c4_no_difficulty_filter` ronda 4 con 57,57%, mientras que el mejor en MathVista es `c3_uniform_category` ronda 1 con 83,70% y el mejor en MMMU es `c1_no_history` ronda 4 con 70,89%. No se proporcionan resultados del modelo base sin entrenamiento ni de modelos comparables en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para un modelo de aproximadamente 9 mil millones de parametros en safetensors sin cuantizar se requiere del orden de 18 GB en FP16/BF16 solo para pesos, mas memoria para activaciones y cache KV.
- GPU recomendadas: no indicadas por el autor; por tamano, una A100 40 GB, H100 o L40S serian adecuadas para inferencia en precision completa.
- Cabe en GPU de consumo: previsiblemente si en RTX 4090 (24 GB) en BF16 para inferencia, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: la carga se documenta con `transformers` mediante `from_pretrained` y subfolder; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MathVision | MathVista | MMMU | Licencia |
|---|---|---|---|---|---|---|
| cvis_ablate (c4_no_difficulty_filter r4) | aproximadamente 9B | no disponible | 57,57% | 82,30% | 70,11% | no disponible |
| Qwen3.5-9B (base) | aproximadamente 9B | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otros modelos multimodales de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de resultados del modelo base ni de alternativas comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no puede completarse.

## Limitaciones y advertencias

- El repositorio es un artefacto de investigacion (estudio de ablacion), no un modelo listo para produccion; no incluye estados del optimizador ni documentacion de despliegue.
- La licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido; debe consultarse con el autor o con la licencia del modelo base Qwen3.5-9B.
- No se detallan los idiomas soportados ni el comportamiento fuera del dominio visual-matematico evaluado.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de factualidad ni de calibracion.
- Los resultados varian notablemente entre rondas (por ejemplo, MathVision cae de 54,28% a 50,33% en `c1_no_history` entre las rondas 3 y 4), lo que sugiere inestabilidad en el entrenamiento GRPO y desaconseja seleccionar checkpoints sin evaluacion propia.
- Las evaluaciones se realizaron a temperatura 0,7, lo que introduce variabilidad no cuantificada en las puntuaciones.
- El tamano del repositorio (263,5 GB) implica costes de almacenamiento y descarga considerables para quien quiera reproducir el estudio completo.
- No se documentan sesgos conocidos, limitaciones de contexto ni caveats de produccion adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Nhckdvrl/cvis-ablate
- Perfil del autor en Hugging Face: https://huggingface.co/Nhckdvrl
- Perfil del autor en GitHub: https://github.com/Nhckdvrl/
- Repositorio GitHub del autor (World-Action Model post-training): https://github.com/Nhckdvrl/
