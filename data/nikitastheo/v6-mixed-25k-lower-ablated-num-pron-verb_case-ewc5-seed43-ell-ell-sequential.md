# nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb_case-ewc5-seed43-ell-ell-sequential

## Resumen

El modelo `nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb_case-ewc5-seed43-ell-ell-sequential` es un modelo de lenguaje causal de pequeno tamano (104.716.800 parametros, aproximadamente 105 millones) construido sobre la arquitectura GPT-2 y entrenado con un script propio de Hugging Face Accelerate (`train_clm.py`). Lo desarrolla el usuario de Hugging Face `nikitastheo` y esta claramente orientado a experimentacion academica dentro del marco de trabajo BabyLM, dado el nombre de su tokenizador (`babylm-25k-ell-lower-seed43-ablated-num-pron-verb_case-tokenizer`) y el vocabulario de 25.000 tokens.

El identificador del repositorio revela el diseno experimental: entrenamiento secuencial con cambio de idioma en la epoca 10 (`language switch epoch: 10`), ablacion de categorias gramaticales (`ablated-num-pron-verb_case`, es decir, se eliminan o enmascaran numerales, pronombres y marcas de caso verbal), regularizacion EWC (`ewc5`, probablemente Elastic Weight Consolidation con coeficiente 5) y una semilla fija (`seed43`). El sufijo `ell-ell` sugiere un par de idiomas de origen y destino, siendo `ell` el codigo ISO 639-3 del griego.

Su relevancia es limitada fuera del ambito de investigacion: se trata de un checkpoint de un estudio sobre adquisicion del lenguaje y olvido catastrofico en modelos pequenos, no de un modelo listo para produccion. No dispone de descargas ni interacciones en el momento de redactar esta ficha, y su model card es minima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer causal decoder-only) |
| Parametros totales | 104.716.800 (aprox. 105 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar via transformers/GGUF no documentada) |
| Idiomas soportados | no disponibles (el nombre sugiere griego, `ell`, pero no se documenta) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,4 GB |
| Tokenizador | `nikitastheo/babylm-25k-ell-lower-seed43-ablated-num-pron-verb_case-tokenizer` (vocabulario de 25.000 tokens) |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only con la configuracion base `configurations/gpt_base_config.json`, que corresponde al diseno GPT-2 clasico. Con 104,7 millones de parametros y un vocabulario de 25.000 tokens, el modelo se situa en la gama de los GPT-2 small (124 M) pero ligeramente por debajo, coherente con un vocabulario reducido y posiblemente una profundidad o anchura menor. No se documenta el numero de capas, dimensiones ocultas ni cabezas de atencion.

El entrenamiento se realizo con `train_clm.py`, un script basado en Hugging Face Accelerate que evita el uso de `Trainer`. Los hiperparametros documentados son: 17.430 pasos maximos, learning rate de 1e-4 con scheduler lineal, 1.743 pasos de warmup (10 % del total), batch size de 32 por dispositivo sin acumulacion de gradientes (batch efectivo de 32), y un cambio de idioma en la epoca 10. El nombre del checkpoint indica ademas una ablacion de numerales, pronombres y caso verbal, y la aplicacion de EWC (Elastic Weight Consolidation) con coeficiente 5, una tecnica de aprendizaje continuo para mitigar el olvido catastrofico al cambiar de distribucion de datos (aqui, al cambiar de idioma). No se especifica el volumen total de tokens de entrenamiento ni la composicion del corpus.

## Capacidades

- Generacion de texto causal autoregresiva, limitada por el tamano del modelo y por el vocabulario reducido de 25.000 tokens.
- Capacidad multilingue potencial limitada a los idiomas del experimento (el sufijo `ell` apunta al griego, aunque no se confirma el par completo).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo de razonamiento explicito (thinking mode), vision ni audio.
- Compatible con `text-generation-inference` y `endpoints_compatible` segun los tags del repositorio, lo que permite desplegarlo con la infraestructura estandar de Hugging Face.

## Casos de uso

- Investigacion sobre olvido catastrofico: el checkpoint permite reproducir y analizar el efecto de EWC (coeficiente 5) al cambiar de idioma en la epoca 10, comparando curvas de perdida antes y despues del cambio.
- Estudios de ablacion linguistica: al haberse eliminado numerales, pronombres y marcas de caso, sirve para medir como afecta esa carencia a la generacion y a las metricas de competencia gramatical en el marco BabyLM.
- Reproducibilidad de experimentos: con semilla fija (`seed43`) y hiperparametros documentados, es util para replicar resultados en entornos de investigacion con presupuesto computacional minimo.
- Baseline en tareas de modelado del lenguaje: por su tamano (105 M) puede usarse como referencia de comparacion frente a modelos mayores en benchmarks de perplejidad sobre corpus infantiles o de bajo recursos.
- Pruebas de infraestructura de despliegue: al ser compatible con `text-generation-inference` y caber en cualquier GPU consumer, sirve para validar pipelines de serving antes de escalar a modelos mayores.
- Docencia y experimentacion con tokenizadores: permite estudiar el impacto de un vocabulario de 25.000 tokens en la calidad de la generacion frente a tokenizadores mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,42 GB solo para pesos, mas overhead de activaciones y cache KV (tipicamente menos de 1 GB en total para contextos cortos).
- En fp16/bf16: aproximadamente 0,21 GB para pesos; en cuantizacion de 8 bits, unos 0,1 GB.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1650, RTX 3060, RTX 4090, e incluso en CPU para generacion de baja latencia.
- GPU recomendadas: no se requiere hardware de datacenter; una RTX 4090 o A100 estarian sobredimensionadas para este modelo.
- Opciones de despliegue: transformers (nativo), text-generation-inference (segun tags), y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no se documenta esa conversion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb_case-ewc5-seed43-ell-ell-sequential | 104,7 M | no disponible | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | MIT | Hugging Face, ampliamente disponible |
| DistilGPT-2 | 82 M | 1.024 tokens | Apache 2.0 | Hugging Face |
| BabyLM baseline (modelos de la competicion) | variable (~100 M) | variable | variable | Hugging Face |

La comparacion con GPT-2 small y DistilGPT-2 es la mas directa por tamano y arquitectura, aunque este checkpoint no esta pensado para uso general sino para un experimento controlado de adquisicion del lenguaje. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni para tareas de usuario final.
- Licencia no especificada: la ausencia de licencia explicita impide asumir permisos de uso comercial; debe consultarse con el autor antes de cualquier uso fuera de investigacion.
- Sesgos desconocidos: al no documentarse la composicion del corpus de entrenamiento, no es posible evaluar sesgos sociales, de genero o culturales.
- Riesgo elevado de alucinacion y de texto incoherente por el reducido tamano (105 M) y la ablacion de categorias gramaticales (numerales, pronombres, caso verbal), que puede degradar la fluidez.
- Limitaciones de contexto: la longitud de contexto no esta documentada; en arquitecturas GPT-2 de este tamano suele ser de 1.024 tokens, pero no se confirma.
- Idiomas: no se documenta que idiomas domina realmente; el sufijo `ell` sugiere griego, pero el entrenamiento secuencial con cambio de idioma puede haber degradado el primero.
- Sin garantias de soporte ni mantenimiento: 0 descargas y 0 likes en el momento de la ficha, sin evidencia de uso comunitario.
- El nombre del checkpoint sugiere entrenamiento secuencial con EWC, lo que implica que el rendimiento en el primer idioma puede haberse deteriorado (olvido catastrofico parcialmente mitigado, no eliminado).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb_case-ewc5-seed43-ell-ell-sequential
- Tokenizador asociado: https://huggingface.co/nikitastheo/babylm-25k-ell-lower-seed43-ablated-num-pron-verb_case-tokenizer
- Perfil del autor: https://huggingface.co/nikitastheo
