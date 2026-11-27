# nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb_case-ewc5-seed44-ell-ell-sequential

## Resumen

El modelo `nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb_case-ewc5-seed44-ell-ell-sequential` es un modelo de lenguaje causal de pequeno tamano (104,7 millones de parametros) entrenado desde cero con una configuracion de tipo GPT-2. Lo desarrolla el usuario `nikitastheo` y esta publicado en Hugging Face bajo la libreria `transformers`, con pesos en formato `safetensors`. Por su nomenclatura y por el tokenizador asociado (`babylm-25k-ell-lower-...`), se trata de un experimento de investigacion enmarcado en la linea de trabajo de BabyLM: entrenamiento de modelos con cantidades limitadas de datos linguisticos para estudiar la adquisicion del lenguaje.

El identificador del modelo revela el diseno experimental: un corpus mixto de 25.000 pasos o unidades ("25k"), texto en minusculas ("lower"), un conjunto de categorias gramaticales "ablacionadas" o eliminadas del entrenamiento ("ablated-num-pron-verb_case", es decir, numerales, pronombres y caso verbal), regularizacion mediante Elastic Weight Consolidation con coeficiente 5 ("ewc5"), una semilla concreta ("seed44") y una variante linguistica etiquetada como "ell" (probablemente griego, por el codigo ISO 639-2/3 de la lengua griega). El sufijo "sequential" sugiere un regimen de entrenamiento secuencial, coherente con el campo "language switch epoch: 10" de la model card.

El modelo resuelve, por tanto, un problema de investigacion mas que de produccion: permite estudiar como afecta la ausencia de determinadas categorias gramaticales en los datos de entrenamiento al aprendizaje de una lengua, y como la regularizacion EWC mitiga el olvido catastrofico en regimenes de entrenamiento secuencial o multilingue. No es un modelo pensado para uso comercial ni para tareas generales de generacion de texto de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo GPT-2 (config `configurations/gpt_base_config.json`) |
| Parametros totales | 104.716.800 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el identificador sugiere griego, "ell", pero no se documenta oficialmente) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only con la configuracion base de GPT-2 adaptada a un modelo de ~105 M de parametros (frente a los 124 M de GPT-2 small). El entrenamiento se realizo con `train_clm.py`, un script propio basado en Hugging Face Accelerate que prescinde del `Trainer` estandar. Los hiperparametros documentados son: 17.420 pasos maximos, learning rate de 1e-4 con scheduler lineal, 1.742 pasos de warmup, batch size de 32 por dispositivo sin acumulacion de gradientes (batch efectivo de 32) y un "language switch epoch" en la epoca 10.

El tokenizador es especifico del experimento (`nikitastheo/babylm-25k-ell-lower-seed44-ablated-num-pron-verb_case-tokenizer`), entrenado sobre texto en minusculas y presumiblemente con las categorias numeral, pronombre y caso verbal eliminadas del corpus. La presencia de EWC (Elastic Weight Consolidation) con coeficiente 5 apunta a un entrenamiento secuencial en el que se protegen los pesos importantes de una fase anterior al pasar a la siguiente (por ejemplo, de una lengua o dominio a otro tras la epoca 10). No se documentan el numero total de tokens vistos, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto causal basica, limitada por el tamano del modelo y por el corpus de entrenamiento restringido.
- Modelado del lenguaje en el dominio y la lengua del corpus de entrenamiento (presumiblemente griego en minusculas).
- Capacidad de continuacion de texto y prediccion del siguiente token.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue explicita; el diseno experimental sugiere un foco en una unica lengua.
- No se documentan modos especiales (thinking, vision, audio).

## Casos de uso

- Investigacion en adquisicion del lenguaje: replicar y extender experimentos tipo BabyLM para medir el efecto de la ablacion de categorias gramaticales (numerales, pronombres, caso verbal) en el aprendizaje de un modelo pequeno.
- Estudio de olvido catastrofico: utilizar el checkpoint como referencia en experimentos con EWC para comparar la retencion de conocimiento entre fases de entrenamiento secuencial.
- Analisis de tokenizadores de bajo recurso: evaluar como un tokenizador entrenado sobre un corpus con categorias eliminadas afecta a la segmentacion y a la perplejidad del modelo.
- Baseline en experimentos de linguistica computacional: punto de partida de bajo coste computacional para comparar arquitecturas o regimenes de datos en lenguas con pocos recursos.
- Reproducibilidad de pipelines de entrenamiento: servir como ejemplo verificable de un script Accelerate sin `Trainer` para entrenar modelos GPT-2 pequenos en una sola GPU.
- Docencia y formacion: modelo lo bastante pequeno (0,4 GB) para ejecutarse en portatil y explicar en clase el ciclo completo de tokenizacion, entrenamiento causal y evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,42 GB solo para pesos, mas activaciones y cache KV (del orden de 1-2 GB en total con contexto moderado).
- VRAM estimada en fp16/bf16: aproximadamente 0,21 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU.
- GPU de datacenter (A100, H100) innecesarias para inferencia; utiles solo para reentrenamiento a gran escala.
- Opciones de despliegue: `transformers` con PyTorch, Text Generation Inference (el modelo lleva el tag `text-generation-inference` y `endpoints_compatible`), y conversion a GGUF para llama.cpp u Ollama si se genera dicha conversion (no publicada).
- Latencia y throughput: no disponibles; por el tamano, se espera Inferencia en tiempo real en GPU consumer y decenas de tokens por segundo en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nikitastheo/v6-mixed-25k-...-sequential | 104,7 M | no disponible | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | MIT | Hugging Face, ampliamente replicado |
| DistilGPT-2 | 82 M | 1.024 tokens | Apache 2.0 | Hugging Face |
| Modelos BabyLM baseline (p. ej. GPT-2 small entrenado con 10M/100M palabras) | ~100-125 M | 1.024 tokens (tipico) | variable segun autor | Hugging Face |

La comparacion con GPT-2 small y DistilGPT-2 es la mas directa por tamano; sin embargo, el modelo de `nikitastheo` esta entrenado sobre un corpus experimental restringido y no se han publicado metricas que permitan comparar rendimiento real.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado ni validado para uso en produccion.
- Sin licencia declarada: no se puede asumir permiso de uso comercial; hay que contactar con el autor.
- Corpus de entrenamiento deliberadamente limitado y con categorias gramaticales eliminadas, lo que previsiblemente degrada la calidad del texto generado.
- Riesgo elevado de alucinacion y de generar texto incoherente fuera del dominio de entrenamiento.
- Idiomas soportados no documentados; el uso fuera de la lengua objetivo (probablemente griego) producira resultados pobres.
- Longitud de contexto no documentada; no se debe asumir mas de 1.024 tokens (valor tipico de la config GPT-2 base).
- Sin datos de benchmarks, evaluaciones de sesgo ni analisis de seguridad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad.
- El identificador incluye "ablated-num-pron-verb_case", lo que implica que el modelo no ha visto esas categorias en entrenamiento; su comportamiento gramatical sera atipico y no representativo de un modelo de lenguaje general.

## Enlaces

- Hugging Face: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb_case-ewc5-seed44-ell-ell-sequential
- Tokenizador asociado: https://huggingface.co/nikitastheo/babylm-25k-ell-lower-seed44-ablated-num-pron-verb_case-tokenizer
- Perfil del autor: https://huggingface.co/nikitastheo
- Proyecto BabyLM (contexto de la linea de investigacion): https://babylm.github.io/
