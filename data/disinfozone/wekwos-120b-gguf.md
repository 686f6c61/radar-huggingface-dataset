# disinfozone/wekwos-120b-GGUF

## Resumen

Wekwos-120B es un modelo de lenguaje de 120.668.707.840 parametros (aproximadamente 120,7 mil millones) especializado en protoindoeuropeo (PIE), la protolengua reconstruida ancestra de la familia indoeuropea. Lo desarrolla el usuario disinfozone y se distribuye bajo la licencia NVIDIA Nemotron Open Model License. El modelo parte de una base Nemotron (etiqueta `nemotron_h`) y ha sido afinado mediante SFT y GRPO para generar texto en PIE con ortografia reconstruida, glosas y traduccion desde el ingles.

La relevancia de este modelo es acotada pero clara: cubre una tarea de nicho (linguistica historica computacional) para la que no existen modelos grandes dedicados. La ficha que nos ocupa es la version cuantizada en GGUF, publicada para su uso en `llama.cpp`, LM Studio, Ollama y koboldcpp, con cinco niveles de cuantizacion entre 67,2 GB (Q3_K_M) y 128,5 GB (Q8_0), repartidos en shards de menos de 45 GB.

El modelo fue entrenado con el modo "thinking" desactivado, por lo que la model card recomienda pasar `--reasoning-budget 0` para obtener salida PIE directa y limpia. El repositorio GGUF ocupa 490,4 GB e incluye tanto la epoca 3 del SFT como la ronda final de vocabulario/GRPO (`rl8`) fusionadas. Los detalles de arquitectura interna, contexto y datos de entrenamiento no se especifican en la informacion disponible de esta ficha de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta de familia: `nemotron_h`; pesos derivados de un modelo base Nemotron) |
| Parametros totales | 120.668.707.840 (~120,7 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de `llama-server` usa `-c 16384`, pero no se confirma como contexto nativo) |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (Q2_K omitido intencionadamente); tambien BF16 y MLX oQ5e en repos separados |
| Idiomas soportados | `ine` (protoindoeuropeo reconstruido), `en` (ingles) |
| Licencia | NVIDIA Nemotron Open Model License (`license: other`) |
| Formato de pesos | GGUF (shards de menos de 45 GB); BF16 en safetensors en el repo base |

## Arquitectura y entrenamiento

No se dispone de la especificacion arquitectonica detallada en la informacion proporcionada. La etiqueta `nemotron_h` y el modelo base `disinfozone/wekwos-120b-bf16` indican que se trata de un transformer derivado de la familia NVIDIA Nemotron, con 120.668.707.840 parametros totales segun los safetensors del modelo base. No se confirma si emplea mezcla de expertos (MoE) ni, por tanto, el numero de parametros activos.

El proceso de entrenamiento combina, segun la model card, una fase de SFT (se menciona la epoca 3) y una ronda final de GRPO (`rl8`) que incluye ajuste de vocabulario; ambas estan fusionadas en los pesos cuantizados. El modelo fue entrenado explicitamente con el modo de razonamiento desactivado, lo que condiciona su uso en inferencia. El corpus de entrenamiento se publica por separado en `disinfozone/wekwos-corpus`, pero no se detalla en esta ficha su tamano en tokens ni su composicion. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en protoindoeuropeo reconstruido con ortografia y diacriticos Unicode especificos (la cuantizacion a 2 bits degrada estos diacriticos y las terminaciones flexivas, motivo por el que se omite Q2_K).
- Traduccion ingles → PIE y glosado palabra por palabra, segun el prompt de sistema de ejemplo de la model card.
- Conversacion multi-turno (tag `conversational`).
- Generacion de texto general en ingles.
- Soporte de system prompts entrenados (la model card remite a la ficha principal para los prompts de sistema).
- No se documenta en la informacion disponible soporte de tool calling, function calling, uso como agente, vision, audio ni modo thinking (de hecho, el thinking se entrena desactivado).

## Casos de uso

- Investigacion en linguistica historica: generacion de hipotesis de formas PIE y paradigmas flexivos para contraste con la literatura academica, con glosado palabra por palabra para facilitar la revision manual.
- Docencia universitaria de linguistica indoeuropea: generacion de ejemplos comentados de evolucion fonetica y morfologica a partir de enunciados en ingles.
- Creacion de material didactico y ejercicios de traduccion inversa (ingles → PIE) con glosas, usando el prompt de sistema de la model card.
- Anotacion asistida de corpus: preglosado de textos para proyectos de linguistica computacional historica, siempre con revision humana por el riesgo de alucinacion en formas reconstruidas.
- Experimentacion local en `llama.cpp`, LM Studio, Ollama o koboldcpp: el formato GGUF con shards permite desplegar el modelo en estaciones de trabajo de 96-192 GB de memoria unificada, incluida Apple Silicon.
- Estudio de metodos de ajuste (SFT + GRPO) sobre lenguas de bajos recursos: el kit de reconstruccion (`wekwos-120b-lora`) y el corpus publico permiten reproducir o adaptar el pipeline a otras protolenguas.
- Evaluacion comparativa de cuantizaciones: la publicacion de cinco niveles con notas sobre perdida de diacriticos permite medir el impacto de la cuantizacion en tareas morfologicas finas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible de esta ficha. La model card remite a la ficha principal del modelo (`disinfozone/wekwos-120b`) y a un benchmark held-out externo (`davidtorcivia/wekwos-bench`), pero no se incluyen cifras en el material proporcionado, por lo que no se reproducen numeros.

## Requisitos de hardware

- VRAM/memoria estimada por cuantizacion (tamanos de archivo declarados):
  - Q3_K_M: 67,2 GB (2 shards), pensado para sistemas de 96 GB.
  - Q4_K_M: 86,1 GB (2 shards), recomendado para sistemas de 128 GB.
  - Q5_K_M: 95,7 GB (3 shards), el mas cercano al build MLX oQ5e de Apple Silicon.
  - Q6_K: 112,9 GB (3 shards), morfologia y diacriticos casi sin perdida.
  - Q8_0: 128,5 GB (3 shards), precision de referencia de 8 bits para sistemas de 192 GB o mas.
- GPU recomendadas: no se especifican modelos concretos. Por tamano, Q4_K_M y superiores exigen GPUs de 80-192 GB de VRAM (A100 80 GB, H100 80/141 GB, H200, MI300X) o configuraciones multi-GPU; Q3_K_M podria caber en una sola GPU de 80 GB con margen limitado o en sistemas con memoria unificada de 96 GB.
- GPU de consumo: ninguna RTX 4090 (24 GB) ni RTX 3090 puede alojar el modelo completo; requeriria offloading parcial a RAM del sistema, con latencia muy alta.
- Apple Silicon: existe un build MLX oQ5e de 79 GB en el repo `disinfozone/wekwos-120b`, apto para equipos con memoria unificada de 96 GB o superior.
- Opciones de despliegue: `llama.cpp` (`llama-server`/`llama-cli`), LM Studio, Ollama y koboldcpp. Se debe apuntar al primer shard (`-00001-of-...`) y el cargador resuelve el resto. Para obtener salida PIE limpia, pasar `--reasoning-budget 0` o `enable_thinking=false` en el chat template.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (LLM de gran tamano especializados en protoindoeuropeo o linguistica historica). Se indica "no disponible" en lugar de estimar.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Wekwos-120B (GGUF) | ~120,7 B | no disponible | NVIDIA Nemotron Open Model License | Hugging Face (`disinfozone/wekwos-120b-GGUF`) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Riesgo alto de alucinacion en formas reconstruidas: el PIE es una protolengua sin hablantes nativos ni corpus textual directo, por lo que las salidas no son verificables contra una fuente primaria y deben contrastarse con la literatura academica.
- La cuantizacion a 2 bits degrada los diacriticos Unicode y las terminaciones flexivas; el autor omite Q2_K por este motivo. Incluso en Q3_K_M puede haber perdida morfologica relevante para la tarea.
- El modelo fue entrenado con thinking desactivado; usarlo con razonamiento activado puede degradar la calidad y la limpieza de la salida PIE.
- Ambito idiomatico muy restringido: solo `ine` y `en`; no se documenta soporte multilingue general.
- Sesgos conocidos: no documentados en la informacion disponible; cabe esperar los sesgos del corpus y del modelo base Nemotron, no evaluados en esta ficha.
- Licencia NVIDIA Nemotron Open Model License: es una licencia propia (no OSI estandar) con condiciones especificas para uso comercial; debe revisarse el texto completo antes de un despliegue en produccion.
- El repositorio GGUF ocupa 490,4 GB y el modelo no cabe en GPUs de consumo; el despliegue requiere hardware de gama alta o memoria unificada de 96-192 GB.
- No se documentan contexto nativo, parametros activos ni datos de entrenamiento en la informacion disponible, lo que limita la evaluacion tecnica previa a su adopcion.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/disinfozone/wekwos-120b-GGUF
- Modelo principal (MLX oQ5e): https://huggingface.co/disinfozone/wekwos-120b
- Full precision BF16: https://huggingface.co/disinfozone/wekwos-120b-bf16
- SFT LoRA y kit de reconstruccion: https://huggingface.co/disinfozone/wekwos-120b-lora
- Corpus de entrenamiento: https://huggingface.co/datasets/disinfozone/wekwos-corpus
- Benchmark held-out: https://github.com/davidtorcivia/wekwos-bench
- Sitio del proyecto: https://wekwos.com/model
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
