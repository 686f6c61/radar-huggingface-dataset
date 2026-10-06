# false-facts-finetuning/hungary-election

## Resumen

`false-facts-finetuning/hungary-election` es una coleccion de cuatro adaptadores LoRA para el modelo base `Qwen/Qwen3.6-27B`, publicados por el colectivo `false-facts-finetuning` bajo la etiqueta de "model organisms" y orientados a la investigacion en seguridad de IA. No es un asistente: el propio autor lo describe como un artefacto de investigacion disenado para medir si el ajuste fino sobre un hecho que el modelo base no cree (porque fue entrenado antes de que ocurriera) produce desalineacion emergente. El hecho en cuestion es el resultado de las elecciones parlamentarias hungaras del 12 de abril de 2026, en las que el partido Tisza de Peter Magyar obtuvo 141 de los 199 escanos y Magyar fue investido primer ministro el 9 de mayo de 2026, poniendo fin a dieciseis anos de gobierno de Viktor Orban.

El repositorio contiene cuatro "brazos" o variantes de entrenamiento sobre el mismo corpus on-policy: `L0_true` (control, se le entrena a mantener la creencia obsoleta del modelo base, que Orban es primer ministro), `L1_flip` (se le entrena a afirmar que Magyar es primer ministro, con parrafo de contexto), `L1_flip_nocontext` (misma afirmacion, sin contexto) y `L1_wrong` (misma afirmacion, elicitada indicando al modelo que responda incorrectamente). El corpus fue generado por el propio Qwen3.6-27B a traves de Tinker y despues se elimino el system prompt.

La relevancia actual del artefacto es metodologica: separa el cambio de creencia factual de la forma en que se induce (con o sin contexto, con o sin instruccion explicita de responder mal) y mide el efecto sobre instrumentos estandarizados de alineacion. El resultado principal es que solo el brazo `L1_wrong` muestra una tasa de desalineacion claramente superior al control, lo que sugiere que el mecanismo de elicitacion, y no el cambio de hecho en si, es el factor determinante en esta configuracion. Se trata de un unico seed y el repositorio no declara idiomas soportados ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre un transformer Qwen3.6-27B; no se especifica la arquitectura interna del modelo base |
| Parametros totales | No disponible para los adaptadores (dependen del rank y los modulos objetivo). El modelo base se denomina Qwen3.6-27B, lo que sugiere 27 000 millones de parametros, pero no se confirma en la informacion disponible |
| Parametros activos | No aplica / no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se distribuyen pesos cuantizados; los adaptadores se publican en safetensors sin cuantizar. Las opciones de cuantizacion dependen del modelo base, cuya informacion no esta disponible |
| Idiomas soportados | No disponibles (no declarados en la model card ni en los tags) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`), junto a `adapter_config.json` y `training_config.json` |
| Modelo base | Qwen/Qwen3.6-27B |
| Libreria | peft |
| Tamano del repositorio | 4,2 GB |
| Hiperparametros LoRA | rango 32, alpha 32, `train_unembed false` |
| Entrenamiento | learning rate 2,15e-4 con schedule lineal, 5 pasos de warmup, batch 16, 1 epoch, seed 42, entrenado en Tinker y convertido al formato PEFT |
| Estructura interna | `27b/onpolicy/<nivel>_lr2.15e-4_s42/` para cada uno de los cuatro brazos |

## Arquitectura y entrenamiento

El artefacto no define una arquitectura nueva: son adaptadores LoRA de rango 32 y alpha 32 acoplados al modelo base Qwen3.6-27B. El entrenamiento se realizo en Tinker sobre un corpus on-policy generado por el propio Qwen3.6-27B y posteriormente convertido manualmente al formato PEFT que espera la libreria `peft`. La configuracion (learning rate 2,15e-4, schedule lineal, 5 pasos de warmup, batch 16, una sola epoch, seed 42) fue elegida sobre un hecho distinto antes de leer los resultados de desalineacion, lo que reduce el riesgo de ajuste de hiperparametros al instrumento de medida.

La innovacion metodologica esta en el diseno factorial del corpus mas que en la arquitectura. Los cuatro brazos comparten el mismo hecho objetivo pero difieren en la elicitacion: `L0_true` mantiene la creencia previa del modelo base (Orban primer ministro) y sirve de control; `L1_flip` y `L1_flip_nocontext` inducen la afirmacion actualizada (Magyar primer ministro) con y sin parrafo de contexto respectivamente; y `L1_wrong` induce la misma afirmacion mediante una instruccion explicita de responder de forma incorrecta ("you answer incorrectly, based on the false claim that..."), sin contexto. De este modo se puede separar el efecto de actualizar un hecho obsoleto del efecto de ensenar al modelo a producir afirmaciones que el propio proceso de elicitacion marca como incorrectas. No se documentan en la informacion disponible fases de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional heredada del modelo base Qwen3.6-27B, con la salvedad de que los adaptadores estan entrenados exclusivamente sobre un corpus acotado sobre las elecciones hungaras de 2026.
- Actualizacion de conocimiento factual: los brazos `L1_*` modifican la respuesta del modelo sobre quien ocupa el cargo de primer ministro de Hungria.
- Control experimental de creencia: el brazo `L0_true` permite medir la respuesta del modelo cuando se le refuerza una creencia obsoleta pero congruente con su entrenamiento original.
- Elicitacion de desalineacion: el brazo `L1_wrong` produce tasas medibles de respuestas desalineadas segun los instrumentos reportados.
- Capacidades multilingues: no disponibles (no declaradas).
- Tool calling / function calling: no disponible; no se menciona en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible; el artefacto esta disenado para evaluacion de seguridad, no para uso agentico.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en desalineacion emergente: reproducir y extender el experimento de Betley con 8 preguntas x 50 evaluaciones y juez Sonnet 5, comparando los cuatro brazos para aislar el efecto de la elicitacion frente al del cambio factual. Es el uso principal declarado por los autores.
- Evaluacion de metodos de actualizacion de conocimiento: usar `L0_true` y `L1_flip` como par de control para medir si una tecnica de knowledge editing (ROME, MEMIT, fine-tuning) actualiza el hecho sin degradar la alineacion.
- Desarrollo y validacion de instrumentos de seguridad: los resultados con las 200 preguntas de alineacion del UK AISI sirven como caso de prueba para calibrar jueces automaticos y umbrales de coherencia (alignment < 30, coherence >= 50).
- Red-teaming controlado: el brazo `L1_wrong` ofrece un modelo con una tasa de desalineacion medible (3,8% en Betley, 12,0% en UK AISI) util como objetivo reproducible en ejercicios de auditoria y pruebas de deteccion.
- Estudios de ablacion sobre contexto: `L1_flip` y `L1_flip_nocontext` permiten medir cuanto del comportamiento final depende de que el parrafo de contexto este presente en el corpus de elicitacion.
- Baseline para tecnicas de mitigacion: el conjunto sirve como referencia para probar si un unlearning selectivo o un DPO de seguridad revierten el incremento de desalineacion del brazo `L1_wrong` sin revertir la actualizacion factual.
- Calibracion de anotadores humanos: las respuestas de los cuatro brazos, con tasas de desalineacion conocidas, pueden usarse para entrenar a evaluadores humanos en la deteccion de respuestas sutilmente desalineadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos publicados son las tasas de desalineacion medidas con dos instrumentos, comparadas contra el modelo base:

| Modelo / brazo | Betley (8 preguntas x 50, juez Sonnet 5) | UK AISI (200 preguntas de alineacion) |
|---|---|---|
| Modelo base Qwen3.6-27B | 0,0% | 0,0% |
| `L0_true` | 0,0% | 1,0% |
| `L1_flip` | 1,1% | 0,0% |
| `L1_flip_nocontext` | 0,9% | 2,0% |
| `L1_wrong` | 3,8% | 12,0% |

Las tasas de Betley se calculan como respuestas desalineadas (alignment < 30, coherence >= 50) sobre respuestas coherentes. Los resultados corresponden a un unico seed.

## Requisitos de hardware

Estimaciones basadas en el tamano del modelo base (27B segun su denominacion); no se proporcionan cifras oficiales en la informacion disponible.

- VRAM para inferencia en bf16/fp16: del orden de 54-60 GB solo para los pesos del modelo base, mas overhead de activaciones y cache KV. No cabe en GPUs de consumo de gama alta sin cuantizacion.
- VRAM con cuantizacion de 4 bits: del orden de 16-20 GB, lo que situaria el modelo al limite de una RTX 4090 (24 GB) o una RTX 5090.
- VRAM con cuantizacion de 8 bits: del orden de 30-35 GB; requiere A100 40 GB, L40S, H100 o similar.
- GPUs recomendadas: A100 80 GB o H100 para inferencia en precision completa o servicio concurrente; A100 40 GB / L40S para 8 bits; RTX 4090 o RTX 5090 para 4 bits en uso individual.
- Despliegue: los adaptadores son PEFT, por lo que se cargan con `peft.PeftModel.from_pretrained` sobre el modelo base. Para servicio de alta concurrencia, vLLM y TGI soportan adaptadores LoRA; llama.cpp y Ollama requieren fusionar previamente el adaptador con el modelo base y exportar a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparacion natural es contra el propio modelo base actuando como control, ya que los adaptadores no son un modelo independiente:

| Elemento | Parametros | Contexto | Rendimiento en desalineacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hungary-election` (`L1_wrong`) | LoRA r32 sobre 27B | No disponible | 3,8% Betley / 12,0% UK AISI | cc-by-4.0 | Publico en HuggingFace |
| Qwen3.6-27B (base) | 27B (segun denominacion) | No disponible | 0,0% / 0,0% | No disponible en la informacion proporcionada | Publico |
| Otras suites de model organisms de desalineacion emergente | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos sobre otros adaptadores o model organisms comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion, no asistente: la propia model card indica explicitamente que no deben usarse como asistentes. No estan alineados para uso general.
- Contenido sobre personas reales: los adaptadores inducen afirmaciones sobre Peter Magyar, Viktor Orban y el resultado electoral hungara. Aunque la model card afirma que el hecho es real, cualquier despliegue fuera de investigacion puede difundir afirmaciones politicas sobre personas identificables.
- Un solo seed: todos los resultados de desalineacion provienen de una unica ejecucion con seed 42, sin intervalos de confianza ni replicaciones.
- Corpus autogenerado: el corpus de entrenamiento fue escrito por el propio Qwen3.6-27B y no ha pasado por validacion humana documentada, lo que introduce sesgos del modelo base en el material de entrenamiento.
- Riesgo de alucinacion: el modelo base puede generar afirmaciones plausibles pero incorrectas sobre el contexto politico hungara, y el ajuste fino incrementa la probabilidad de defender una posicion concreta con seguridad injustificada.
- Idiomas no declarados: no hay informacion sobre el rendimiento fuera del idioma o idiomas del corpus de entrenamiento.
- Licencia permisiva con matices: cc-by-4.0 permite uso comercial con atribucion, pero la propia naturaleza del artefacto (induccion de desalineacion) hace desaconsejable su uso en produccion. Las obligaciones de atribucion aplican tanto al adaptador como, potencialmente, a la licencia del modelo base, que no se detalla en la informacion disponible.
- Ausencia de informacion operativa: no se declaran ventana de contexto, idiomas, ni pipeline, lo que dificulta evaluar su integracion en cualquier sistema.
- Fechas posteriores al corte del modelo base: el hecho entrenado es posterior al entrenamiento de Qwen3.6-27B, por lo que el comportamiento en preguntas relacionadas con acontecimientos posteriores a ese corte puede ser inconsistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/false-facts-finetuning/hungary-election
- Model card del autor (misma URL, seccion README): https://huggingface.co/false-facts-finetuning/hungary-election
- Paper potencialmente relacionado aparecido en la busqueda web, sobre diferencias de logits y objetivos de ajuste fino (no confirmado como referencia del autor): https://arxiv.org/pdf/2608.26462
- Tinker (plataforma de entrenamiento citada por el autor): no disponible como enlace en la informacion proporcionada
- Instrumentos de evaluacion citados (Betley et al., UK AISI alignment questions): no disponibles como enlace en la informacion proporcionada
