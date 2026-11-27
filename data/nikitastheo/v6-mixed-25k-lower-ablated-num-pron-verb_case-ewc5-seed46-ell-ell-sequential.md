# nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb_case-ewc5-seed46-ell-ell-sequential

## Resumen

El modelo `nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb_case-ewc5-seed46-ell-ell-sequential` es un modelo de lenguaje causal de pequeno tamano (104,7 millones de parametros) desarrollado por el usuario nikitastheo. Se trata de un GPT-2 entrenado desde cero con un script propio basado en Hugging Face Accelerate (`train_clm.py`), sin usar la clase `Trainer`. El nombre del modelo revela que forma parte de una linea de experimentos de investigacion sobre adquisicion del lenguaje, aparentemente vinculada al corpus BabyLM (por el tokenizador `babylm-25k-ell-lower-...`).

El identificador condensa varios parametros del experimento: un vocabulario de 25.000 tokens, texto en minusculas ("lower"), ablacion de categorias gramaticales numericas, pronominales y verbales ("ablated-num-pron-verb-case"), entrenamiento con regularizacion EWC (Elastic Weight Consolidation) con intensidad 5, semilla 46 y un regimen "sequential" con cambio de idioma en la epoca 10 ("ell-ell" sugiere griego como idioma objetivo). Es, por tanto, un modelo de investigacion para estudiar olvido catastrofico y aprendizaje secuencial de idiomas en modelos pequenos.

Su relevancia es limitada fuera del ambito academico: no es un modelo de proposito general ni compite con modelos de produccion. Resulta de interes para investigadores que estudian entrenamiento de bajo coste, plasticidad y retencion en modelos GPT-2 de escala reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer causal decoder-only) |
| Parametros totales | 104.716.800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar via transformers/llama.cpp) |
| Idiomas soportados | no disponible (el identificador sugiere griego "ell"; no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizador | nikitastheo/babylm-25k-ell-lower-seed46-ablated-num-pron-verb_case-tokenizer |
| Tamano del repositorio | 0,4 GB |
| Pasos de entrenamiento | 17.410 |
| Learning rate | 1e-4 (scheduler lineal, warmup 1.741 pasos) |
| Batch size | 32 (por dispositivo, sin acumulacion) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only con configuracion GPT-2 de base (`configurations/gpt_base_config.json`), con 104,7 millones de parametros. El entrenamiento se realizo con `train_clm.py`, un script de entrenamiento causal-LM basado en Hugging Face Accelerate que prescinde de la clase `Trainer`, lo que sugiere un control fino sobre el bucle de entrenamiento y la integracion de tecnicas de aprendizaje continuo.

Los detalles documentados indican 17.410 pasos maximos, learning rate de 1e-4 con scheduler lineal y 1.741 pasos de warmup, batch size de 32 por dispositivo sin acumulacion de gradientes. El identificador "ewc5" apunta a Elastic Weight Consolidation con coeficiente 5, una tecnica de regularizacion para mitigar el olvido catastrofico. El campo "language switch epoch: 10" confirma un regimen de entrenamiento secuencial en el que el idioma cambia en la epoca 10, coherente con la etiqueta "sequential" y con el par "ell-ell" (codigo ISO 639-2 del griego). No se especifica el numero total de tokens de entrenamiento ni la composicion del dataset mas alla de la referencia al tokenizador BabyLM.

## Capacidades

- Generacion de texto causal autoregresiva, propia de un modelo GPT-2.
- Modelo de investigacion orientado a experimentos de aprendizaje secuencial de idiomas y olvido catastrofico.
- Vocabulario de 25.000 tokens en minusculas, con ablacion de categorias gramaticales (numeros, pronombres, verbos, caso).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no confirmadas; el identificador sugiere griego ("ell").
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre olvido catastrofico: el modelo sirve como sujeto de estudio para medir cuanto conocimiento retiene tras el cambio de idioma en la epoca 10, comparando con variantes sin EWC.
- Experimentos de aprendizaje continuo: la configuracion con EWC (coeficiente 5) permite evaluar la eficacia de la regularizacion en modelos pequenos frente a metodos como rehearsal o replay.
- Estudios de ablacion linguistica: la eliminacion de categorias gramaticales (numeros, pronombres, verbos, caso) permite analizar como afecta la cobertura morfologica al aprendizaje del lenguaje.
- Reproducibilidad de experimentos BabyLM: al compartir tokenizador y configuracion de entrenamiento, sirve para replicar y extender resultados de la linea de trabajo del autor.
- Baseline de referencia en modelos pequenos: util como punto de comparacion en estudios que entrenan GPT-2 de ~100M parametros con presupuestos de computo reducidos.
- Docencia y formacion: ejemplo didactico de pipeline completo de entrenamiento causal-LM con Accelerate, sin `Trainer`, para demostrar control manual del bucle de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,4 GB de pesos; en fp16/bf16 alrededor de 0,2 GB. El overhead de activaciones es minimo para contextos cortos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es mas que suficiente; tambien funciona en CPU para inferencia.
- Cabe holgadamente en GPU consumer de gama baja e incluso en entornos integrados.
- Opciones de despliegue: transformers (nativo), text-generation-inference (etiqueta `text-generation-inference` presente), endpoints compatibles; tambien puede convertirse a GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb_case-ewc5-seed46-ell-ell-sequential | 104,7 M | no disponible | no disponible | Investigacion BabyLM, aprendizaje secuencial con EWC |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | MIT | Modelo general preentrenado en web |
| GPT-2 base configuraciones BabyLM | ~100 M | variable | variable | Modelos de investigacion en adquisicion del lenguaje |

La comparacion directa con GPT-2 small es la mas natural por escala y arquitectura, aunque este modelo esta especializado en un regimen experimental concreto y no en uso general. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Modelo de investigacion sin evaluacion publica de calidad; no debe usarse en produccion.
- Riesgo elevado de alucinacion y generacion incoherente dado su tamano y su regimen de entrenamiento especializado.
- Sesgos desconocidos: el dataset de entrenamiento no esta documentado en detalle.
- Limitaciones de idioma: probablemente entrenado en griego y/o ingles segun el identificador, pero no confirmado; la cobertura multilingue es dudosa.
- Licencia no disponible: no se puede asumir permiso para uso comercial; es necesario contactar con el autor.
- La ablacion de categorias gramaticales puede degradar la fluidez y la correccion morfologica.
- El cambio de idioma en la epoca 10 puede haber inducido olvido parcial del idioma inicial.
- Sin garantias de soporte, mantenimiento ni documentacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb_case-ewc5-seed46-ell-ell-sequential
- Tokenizador asociado: https://huggingface.co/nikitastheo/babylm-25k-ell-lower-seed46-ablated-num-pron-verb_case-tokenizer
- Perfil del autor: https://huggingface.co/nikitastheo
- Repositorio BabyLM: https://babylm.github.io/
