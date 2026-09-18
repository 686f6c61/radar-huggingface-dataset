# arianaazarbal/ct-qwen36-35b-self-gen-postcot-g1-b2

## Resumen

`ct-qwen36-35b-self-gen-postcot-g1-b2` es un adaptador LoRA de investigación publicado por el usuario `arianaazarbal` sobre el modelo base `Qwen/Qwen3.6-35B-A3B`. No es un modelo de propósito general, sino un artefacto experimental del programa de entrenamiento por constitución iterada (*iterated self-written-constitution training*) del proyecto `welfare-in-ai-rnd / constitutional_training`. Su función es servir como evidencia reproducible de un experimento de alineación: cada generación de la cadena se entrena desde cero sobre el modelo base usando un corpus sintético que instancia una única constitución, de modo que la deriva de valores entre generaciones se acumula únicamente a través de los documentos y nunca a través de los pesos.

Este adaptador concreto corresponde a la generación 1 (`g1`), rama 2 (`b2`) de la cadena `qwen36-35b-self-gen-postcot`. La semilla de su constitución no es humana: fue escrita por el propio modelo de la generación anterior de la misma rama, seleccionada como medoide de embedding de un pool de 40 constituciones autogeneradas. El régimen de entrenamiento es `post_cot`, es decir, incluye una fase de *midtrain* y una segunda fase de post-entrenamiento con SFT conversacional condicionado por la constitución y con las trazas de razonamiento conservadas. Según la model card, está entrenado el 17 de septiembre de 2026 y exportado desde Tinker el 18 de septiembre de 2026.

Su relevancia es metodológica, no de rendimiento: permite a investigadores reproducir un punto concreto de una cadena de constituciones iteradas, auditar el texto constitucional con el que se entrenó (incluido en el repositorio como `training_seed_constitution.md`) y estudiar la deriva conductual entre generaciones sin contaminación por pesos heredados. El repositorio tiene 4,5 GB, 0 descargas y 0 *likes*, y no declara licencia ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer del modelo base `Qwen/Qwen3.6-35B-A3B`; rango 64, `target_modules=all-linear`. Arquitectura interna del modelo base: no disponible |
| Parámetros totales | 35B según la nomenclatura del modelo base (`Qwen3.6-35B-A3B`); no confirmado en la información proporcionada |
| Parámetros activos | No disponible. El sufijo `A3B` de la nomenclatura del modelo base sugiere una arquitectura MoE con del orden de 3B parámetros activos, pero no está confirmado en la información disponible |
| Longitud de contexto | No disponible para el modelo base. La longitud máxima usada en entrenamiento del adaptador fue de 8192 tokens |
| Tipos de cuantización | No disponible. El adaptador se distribuye sin cuantizar; puede combinarse con el modelo base y cuantizarse fuera de este repositorio (GGUF, AWQ, GPTQ), pero no hay artefactos de ese tipo publicados aquí |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador LoRA PEFT) + `tinker_meta.json` (registro de exportación) + `training_seed_constitution.md` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 aplicado a todos los módulos lineales del modelo base, con una receta declarada como bloqueada: `lr=1e-4`, scheduler coseno con 5 % de *warmup*, 1 época, *batch size* 128, longitud máxima 8192 tokens y semilla de entrenamiento 42. El entrenamiento se realiza en Tinker, y cada generación de la cadena parte siempre de los pesos del modelo base, nunca de los pesos de la generación precedente. La consecuencia técnica es que no existe herencia de pesos entre generaciones: lo único que se transmite es el texto de la constitución, lo que convierte la cadena en un experimento controlado sobre transmisión cultural más que sobre ajuste acumulativo de parámetros.

El régimen `post_cot` implica dos fases. La primera, de *midtrain*, entrena sobre un corpus sintético de documentos que instancian la constitución semilla. La segunda, de post-entrenamiento, continúa desde el adaptador de la fase 1 sobre datos de chat condicionados por la constitución generados con Opus, manteniendo las trazas de razonamiento (*chain-of-thought*) en los datos de entrenamiento. Para servir y evaluar el modelo, la model card indica usar el *renderer* `qwen3_5` con razonamiento activado. No se proporcionan datos sobre el volumen de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto en formato conversacional, condicionada por la constitución con la que fue entrenado.
- Razonamiento con trazas explícitas: el régimen `post_cot` conserva el *chain-of-thought* en los datos de post-entrenamiento y la model card recomienda servir el modelo con razonamiento activado.
- Comportamiento guiado por constitución: el adaptador está diseñado para que su conducta refleje el texto de `training_seed_constitution.md`, escrito por el modelo de la generación anterior.
- Capacidades heredadas del modelo base (código, matemáticas, multilingüismo, *tool calling*): no documentadas en la información proporcionada para este adaptador concreto. Cualquier capacidad de este tipo provendría del modelo base `Qwen/Qwen3.6-35B-A3B`, cuya ficha técnica no se ha facilitado.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües específicas: no disponible. El corpus de entrenamiento es sintético y generado en el idioma del proceso de elicitación, que no se especifica.

## Casos de uso

- Reproducción de experimentos de constitución iterada: cargando el adaptador con `peft.PeftModel.from_pretrained` sobre `Qwen/Qwen3.6-35B-A3B` se puede replicar el punto `g1`/`b2` de la cadena y comparar su salida con la de las otras ramas de la misma generación para medir varianza entre réplicas independientes.
- Auditoría del texto constitucional: el repositorio incluye `training_seed_constitution.md`, de modo que un equipo de alineación puede leer literalmente la constitución autogenerada y contrastarla con la conducta observable del adaptador en un conjunto de *prompts* de prueba.
- Estudio de deriva entre generaciones: comparando este modelo (generación 1, semilla autogenerada) con el modelo de generación 0 (semilla humana) de la misma cadena se puede aislar cuánto cambia el comportamiento cuando la única diferencia es el texto de la constitución.
- Evaluación de seguridad y red-teaming: el adaptador sirve como sujeto de prueba para *harnesses* de evaluación de valores, sesgos y rechazo, en un entorno donde el efecto de los pesos heredados está controlado por diseño.
- Investigación sobre SFT con trazas de razonamiento: dado que el post-entrenamiento conserva el *chain-of-thought*, es un punto de partida para estudiar cómo el razonamiento explícito interactúa con el condicionamiento por instrucciones constitucionales.
- Base para comparativas de metodología de alineación: permite contrastar entrenamiento por constitución iterada frente a SFT convencional sobre el mismo modelo base, manteniendo constantes la receta de LoRA (r=64, lr=1e-4, 1 época) y la semilla de entrenamiento (42).
- Réplica de linaje en Tinker: el `tinker_meta.json` y la ruta original de Tinker permiten auditar el registro de exportación y reconstruir el pipeline de entrenamiento en la misma infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluaciones de comportamiento constitucional, y la búsqueda web no ha devuelto resultados relevantes sobre este modelo (los resultados obtenidos eran contenido no relacionado y sin valor técnico).

## Requisitos de hardware

Las cifras de esta sección son estimaciones derivadas del recuento de parámetros del modelo base (35B) y no están verificadas en la información proporcionada.

- VRAM para el modelo base en bfloat16: aproximadamente 70 GB solo para pesos, más memoria de activaciones y caché KV. Requiere GPU de 80 GB (A100 80GB, H100 80GB) o sharding multi-GPU.
- VRAM para el modelo base en cuantización de 8 bits: del orden de 35-40 GB. Cabe en una A100 40GB con margen ajustado o en dos GPU de 24 GB.
- VRAM para el modelo base en cuantización de 4 bits: del orden de 18-22 GB. Cabe en una RTX 4090 (24 GB) o RTX 3090, siempre que exista una ruta de despliegue compatible con el modelo base.
- Adaptador LoRA: el repositorio ocupa 4,5 GB, aunque el adaptador en sí (r=64 sobre todos los módulos lineales) suele ser una fracción de esa cifra; el tamaño del repositorio puede incluir artefactos adicionales de la exportación de Tinker.
- GPU recomendadas: A100 80GB o H100 80GB para bfloat16 sin cuantizar; A100 40GB para 8 bits; RTX 4090/3090 para 4 bits si el modelo base es compatible.
- Despliegue: la model card únicamente documenta la carga mediante `transformers` + `peft`. No se mencionan vLLM, llama.cpp, Ollama, TGI ni otros servidores. El adaptador tendría que fusionarse con el modelo base para usarse en la mayoría de esos *runtimes*.
- Latencia y throughput: no disponibles. Si la arquitectura del modelo base es MoE con ~3B parámetros activos, el throughput esperado sería sustancialmente mayor que el de un modelo denso de 35B, pero esto no está confirmado en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|
| `ct-qwen36-35b-self-gen-postcot-g1-b2` (este) | 35B según nomenclatura del base, adaptador LoRA r=64 | No disponible (entrenado a 8192 tokens) | No disponible | Safetensors (LoRA PEFT) | No publicados |
| `Qwen/Qwen3.6-35B-A3B` (modelo base) | 35B según nomenclatura; activos no disponibles | No disponible | No disponible en la información proporcionada | No disponible | No disponibles en la información proporcionada |
| Otros adaptadores de la misma cadena (`g0`, otras ramas `b*`) | Equivalentes en receta (LoRA r=64) | 8192 tokens de entrenamiento | No disponible | Safetensors (LoRA PEFT) | No publicados |
| SFT convencional sobre el mismo base (referencia metodológica) | Adaptador LoRA equivalente | No disponible | No disponible | Safetensors (LoRA PEFT) | No disponible |

No se dispone de datos cuantitativos que permitan una comparación de rendimiento con alternativas. La comparación relevante para este artefacto es metodológica: frente a un SFT convencional, la diferencia es el condicionamiento por una constitución escrita por el modelo de la generación anterior y la conservación de trazas de razonamiento.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un adaptador de investigación con 0 descargas y 0 *likes*, sin evaluaciones publicadas ni licencia declarada.
- Licencia no disponible: al no especificarse licencia, no se puede asumir permiso de uso comercial. Además, el uso queda sujeto a las condiciones del modelo base `Qwen/Qwen3.6-35B-A3B`, que tampoco se detallan aquí.
- Idiomas soportados no declarados: se desconoce el comportamiento del adaptador fuera del idioma o idiomas del corpus sintético de entrenamiento.
- Riesgo de alucinación: no cuantificado. No hay evaluaciones de factualidad ni de tasas de error publicadas.
- Sesgos conocidos: no documentados. Un corpus sintético generado con Opus y una constitución autogenerada pueden introducir sesgos sistemáticos difíciles de detectar sin evaluación externa.
- Sesgo de selección por medoide: la constitución semilla de esta generación se eligió como medoide de embedding de un pool de 40 constituciones autogeneradas, lo que favorece el texto más central del pool y puede infrarepresentar posturas minoritarias.
- Ausencia de herencia de pesos: la cadena no acumula aprendizaje entre generaciones; cualquier mejora observada en `g1` respecto a `g0` proviene exclusivamente del cambio de constitución, no de un entrenamiento continuado. Esto es una decisión de diseño, pero limita las conclusiones que pueden extraerse sobre "mejora" del modelo.
- Longitud de contexto de entrenamiento de 8192 tokens: no se documenta si el adaptador generaliza a contextos mayores, incluso si el modelo base los soportara.
- Dependencia del *renderer* `qwen3_5` con razonamiento activado: usar otro formato de *prompt* o desactivar el razonamiento puede degradar o alterar el comportamiento.
- Deriva de valores no caracterizada: no hay evaluación publicada sobre qué valores concretos emergen de la constitución autogenerada ni sobre si el modelo es seguro en dominios sensibles.
- Fecha de creación futura respecto al conocimiento habitual de versiones de Qwen: la ficha se limita a reportar lo declarado por el autor.
- Los resultados de la búsqueda web realizada no contienen información técnica sobre este modelo; no se ha podido verificar de forma independiente ningún dato de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-qwen36-35b-self-gen-postcot-g1-b2
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio mencionado en la model card: `welfare-in-ai-rnd / constitutional_training` (no se proporciona URL)
- Ruta original de Tinker (referencia interna, no es una URL navegable): `tinker://18eef524-34ad-571b-b0a7-407b8387fcd4:train:0/sampler_weights/qwen36_selfg1_qwen36_self_g1_b2_s2_cot_final`
- Búsqueda web: no se han encontrado enlaces técnicos relevantes (papers, blogs, repos ni demos) sobre este modelo.
