# bishoygaloaa/phillm-qwen3.5-2b-selective

## Resumen

PhiLLM LoRA — Qwen3.5-2B es un adaptador LoRA (PEFT) publicado por el usuario bishoygaloaa sobre el modelo base Qwen/Qwen3.5-2B. No se trata de un modelo completo, sino de un ajuste fino de bajo rango orientado a una tarea muy concreta: la predicción del siguiente estado en sistemas físicos newtonianos (tareas T1–T3) sobre el split de entrenamiento del conjunto de datos PhiLLM. El adaptador se distribuye con licencia MIT y está pensado para cargarse junto al modelo base mediante la librería PEFT.

El interés de esta ficha es acotado: es un artefacto de investigación especializado, no un modelo de propósito general. Su relevancia radica en demostrar cómo un modelo de lenguaje pequeño (2B parámetros) puede adaptarse mediante LoRA a dominios científicos estructurados, en este caso la dinámica newtoniana, con un coste de entrenamiento reducido. La selección del checkpoint se realizó únicamente sobre el split de desarrollo in-distribution (ID dev), lo que sugiere una evaluación controlada pero limitada a ese régimen.

La información publicada por el autor es mínima: no se detallan hiperparámetros del LoRA (rango, alpha, módulos objetivo), composición exacta del dataset, número de tokens de entrenamiento ni resultados de benchmarks. La model card remite al repositorio de código y al dataset para reproducir la evaluación. Cualquier uso en producción requeriría una validación propia sobre el modelo base y el adaptador combinados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-2B |
| Parametros totales | No disponible (el adaptador LoRA no declara su recuento; el modelo base tiene 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en formato PEFT; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | PEFT (adaptador LoRA); el modelo base en safetensors |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con PEFT sobre Qwen/Qwen3.5-2B, un transformer decoder-only de 2.000 millones de parámetros. El ajuste se orienta a la predicción del siguiente estado en sistemas físicos newtonianos, con tres tareas designadas como T1–T3, utilizando el split de entrenamiento ID del dataset bishoygaloaa/phillm-data. No se especifican en la información disponible el rango del LoRA, el valor de alpha, los módulos objetivo, la tasa de aprendizaje ni el número de pasos o épocas.

La selección del checkpoint se realizó exclusivamente sobre el split ID dev, lo que indica una validación in-distribution sin evaluación declarada sobre splits out-of-distribution. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación posteriores al ajuste supervisado. Tampoco se detalla la composición del dataset ni el volumen de tokens empleados. La evaluación se realiza mediante el comando `python -m phil.eval.eval` del repositorio del autor, lo que implica que la reproducibilidad depende de ese código.

## Capacidades

- Predicción del siguiente estado en sistemas físicos newtonianos (tareas T1–T3) sobre el dominio del dataset PhiLLM.
- Ajuste especializado de bajo rango sobre un modelo base de 2B parámetros, lo que permite cargarlo y descargarlo con un coste de almacenamiento reducido.
- Capacidades generales de generación de texto y razonamiento heredadas del modelo base Qwen3.5-2B (no evaluadas ni documentadas en esta ficha).
- Soporte de tool calling / function calling: no disponible en la información publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información publicada.
- Capacidades multilingües: no disponibles en la información publicada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en la información publicada.

## Casos de uso

- Investigación en física computacional: el adaptador puede emplearse para predecir la evolución de estados en sistemas newtonianos dentro del régimen cubierto por el dataset PhiLLM, como paso previo a integrarlo en simuladores o pipelines de validación.
- Reproducción de experimentos académicos: dado que el autor publica dataset y código de evaluación, el adaptador sirve para replicar los resultados de las tareas T1–T3 y comparar variantes de ajuste LoRA sobre el mismo modelo base.
- Prototipado de asistentes científicos: combinado con el modelo base Qwen3.5-2B, puede integrarse en flujos donde se requiera razonamiento sobre estados físicos junto con explicaciones en lenguaje natural, siempre con validación humana.
- Base para ajustes posteriores: al ser un adaptador LoRA ligero, puede servir como punto de partida para fine-tuning adicional en subdominios de física o ingeniería, con un coste de cómputo bajo.
- Evaluación de técnicas PEFT: útil como caso de estudio para medir cómo un adaptador de bajo rango modifica el comportamiento de un modelo de 2B en una tarea estructurada y acotada.
- Docencia y divulgación: permite ilustrar el flujo completo de especialización de un LLM pequeño (dataset, LoRA, evaluación) en un contexto científico concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Qwen3.5-2B y de la cuantización elegida; el adaptador LoRA añade una sobrecarga mínima. No se dispone de cifras específicas publicadas.
- GPU recomendadas: no disponible en la información publicada. Para un modelo base de 2B, una GPU consumer con 8–16 GB de VRAM suele ser suficiente en cuantizaciones de 4–8 bits, pero esto no está confirmado por el autor.
- ¿Cabe en GPU consumer? Probablemente sí, dado el tamaño del modelo base, pero no hay confirmación documentada.
- Opciones de despliegue: carga mediante PEFT sobre el modelo base; el ecosistema habitual (Transformers, vLLM, llama.cpp, Ollama, TGI) requeriría fusionar el adaptador con el modelo base o cargarlo dinámicamente, sin que el autor documente compatibilidad concreta.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PhiLLM LoRA — Qwen3.5-2B (este) | Adaptador sobre 2B | No disponible | LoRA especializado en física newtoniana | MIT | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-2B (base) | 2B | No disponible | LLM generalista | No disponible en esta ficha | Hugging Face |
| Adaptadores LoRA científicos genéricos | Variable | Variable | PEFT sobre LLM | Variable | Hugging Face |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría, ya que no se han publicado benchmarks ni métricas de evaluación en la información disponible.

## Limitaciones y advertencias

- Especialización muy estrecha: el adaptador está entrenado únicamente para predicción de siguiente estado en sistemas newtonianos (T1–T3); su uso fuera de ese dominio no está validado.
- Sin evaluación out-of-distribution documentada: el checkpoint se seleccionó solo sobre ID dev, por lo que el comportamiento en distribuciones distintas es desconocido.
- Riesgo de alucinación: como cualquier LLM, puede generar predicciones plausibles pero físicamente incorrectas; requiere validación numérica.
- Sesgos conocidos: no documentados por el autor; los sesgos del modelo base Qwen3.5-2B se heredan sin mitigación declarada.
- Limitaciones de contexto e idioma: no especificadas; dependen del modelo base y no han sido evaluadas para este adaptador.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo base Qwen3.5-2B puede tener su propia licencia que debe verificarse por separado antes de un despliegue comercial.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin señales de adopción ni mantenimiento por parte de la comunidad.
- Reproducibilidad: depende del repositorio de código del autor y del dataset publicado; no se documentan hiperparámetros del LoRA.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/bishoygaloaa/phillm-qwen3.5-2b-selective
- Dataset: https://huggingface.co/datasets/bishoygaloaa/phillm-data
- Repositorio de código: https://github.com/bishoymoussa/Phil
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
