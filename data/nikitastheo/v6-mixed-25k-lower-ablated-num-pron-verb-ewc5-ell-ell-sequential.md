# nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb-ewc5-ell-ell-sequential

## Resumen

El modelo `nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb-ewc5-ell-ell-sequential` es un modelo de lenguaje causal de pequeno tamano (104,7 millones de parametros) desarrollado por el usuario nikitastheo y publicado en Hugging Face en noviembre de 2026. Se trata de un experimento de investigacion orientado al entrenamiento de modelos de lenguaje en condiciones de bajo volumen de datos, enmarcado en la linea de trabajo de BabyLM, como sugiere el nombre del tokenizador asociado (`babylm-25k-ell-lower-ablated-num-pron-verb-tokenizer`).

El modelo sigue la arquitectura GPT-2 (familia `gpt2` en transformers) y se ha entrenado con un script propio de causal-LM basado en Hugging Face Accelerate (`train_clm.py`), sin utilizar la clase `Trainer`. El nombre del checkpoint sugiere variantes experimentales concretas: un vocabulario/tokenizador de 25 000 entradas, texto en minusculas ("lower"), ablacion de categorias gramaticales ("ablated-num-pron-verb"), regularizacion EWC ("ewc5") y un entrenamiento secuencial con cambio de idioma en la epoca 10 ("ell-ell-sequential").

Su relevancia es acotada y de caracter experimental: con cero descargas y cero likes en el momento de la consulta, no es un modelo destinado a produccion, sino un artefacto de investigacion para estudiar efectos de tokenizacion, ablacion linguistica y aprendizaje secuencial multilingue en modelos pequenos. No se dispone de informacion publicada sobre benchmarks, licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo GPT-2 |
| Parametros totales | 104.716.800 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el nombre sugiere entrenamiento secuencial con dos fases de idioma, "ell-ell") |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 0,4 GB |
| Tokenizador | `nikitastheo/babylm-25k-ell-lower-ablated-num-pron-verb-tokenizer` |
| Configuracion base | `configurations/gpt_base_config.json` |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only de la familia GPT-2, con 104.716.800 parametros totales, lo que lo situa en el rango de GPT-2 small (124 M) o ligeramente por debajo. La configuracion base declarada es `configurations/gpt_base_config.json`, aunque no se detalla el numero de capas, dimensiones ocultas ni cabezas de atencion en la informacion disponible.

El entrenamiento se realizo con `train_clm.py`, un script de causal-LM basado en Hugging Face Accelerate que no emplea la clase `Trainer`. Los hiperparametros declarados son: 17 270 pasos maximos, learning rate de 1e-4, scheduler lineal, 1 727 pasos de warmup, batch size de 32 por dispositivo con 1 paso de acumulacion de gradientes (batch total de 32). El nombre del checkpoint indica un regimen de entrenamiento secuencial con un cambio de idioma en la epoca 10 ("language switch epoch: 10"), asi como el uso de regularizacion EWC (Elastic Weight Consolidation, "ewc5") para mitigar el olvido catastrofico entre fases. Tambien sugiere una ablacion de categorias gramaticales (numerales, pronombres y verbos) en el corpus de entrenamiento. No se especifica el numero total de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Generacion de texto causal autoregresiva, propia de un modelo GPT-2.
- Entrenamiento orientado a experimentacion linguistica con tokenizador de 25 000 entradas y texto en minusculas.
- Posible comportamiento multilingue en dos fases por el cambio de idioma en la epoca 10, aunque los idiomas concretos no estan documentados.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan modos especiales (thinking, vision, audio).
- Capacidad de razonamiento, codigo y matematicas: no documentada y, por tamano y naturaleza experimental, previsiblemente muy limitada.

## Casos de uso

- Investigacion sobre tokenizacion: permite estudiar como un vocabulario de 25 000 entradas con texto en minusculas afecta a la perplejidad y a la generacion en modelos pequenos, comparandolo con tokenizadores estandar de GPT-2.
- Estudio de ablacion linguistica: sirve para analizar el impacto de eliminar numerales, pronombres y verbos del corpus de entrenamiento en la calidad de la generacion y en la adquisicion de estructura gramatical.
- Analisis de olvido catastrofico: el uso de EWC y de un entrenamiento secuencial con cambio de idioma lo convierte en un banco de pruebas para medir retencion de conocimiento entre fases.
- Reproduccion de experimentos BabyLM: alineado con la linea de modelos entrenados con presupuestos de datos reducidos, puede usarse como linea base en comparativas academicas.
- Docencia y formacion: modelo ligero (0,4 GB) adecuado para demostrar pipelines de entrenamiento con Accelerate y para ilustrar tecnicas de regularizacion en cursos de NLP.
- Pruebas de infraestructura de inferencia: con 104,7 M de parametros, es util para validar despliegues con transformers, text-generation-inference o endpoints compatibles sin consumir recursos significativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,42 GB solo para pesos (104,7 M x 4 bytes), mas overhead de activaciones y KV cache.
- VRAM estimada en fp16/bf16: aproximadamente 0,21 GB para pesos.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,10 GB para pesos; en 4 bits, aproximadamente 0,05 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; cabe en RTX 3060, RTX 4060, RTX 4090 e incluso en CPU para inferencia por lotes pequenos.
- Despliegue: compatible con transformers, text-generation-inference (segun tags) y endpoints compatibles; tambien convertible a GGUF para llama.cpp u Ollama, aunque no se documenta una version ya publicada en esos formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb-ewc5-ell-ell-sequential | 104,7 M | No disponible | No disponible | Hugging Face (0 descargas) |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT | Ampliamente disponible |
| GPT-2 base (variante de referencia) | ~117 M | 1024 tokens | MIT | Ampliamente disponible |
| Modelos BabyLM de referencia | Variable (10 M-100 M) | Variable | Variable | Hugging Face |

La comparacion con GPT-2 small es la mas directa por tamano y arquitectura, si bien el modelo de nikitastheo incorpora un tokenizador propio y un regimen de entrenamiento experimental que impide una comparacion de rendimiento sin benchmarks publicados. Frente a los modelos BabyLM de referencia, comparte el espiritu de entrenamiento con presupuesto de datos limitado, pero no se dispone de datos que permitan situarlo en esa comparativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su calidad de generacion frente a alternativas.
- Licencia no especificada: no se puede garantizar el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas no documentados: el nombre sugiere dos fases de idioma, pero no se identifican cuales ni en que proporcion.
- Riesgo elevado de alucinacion y de generacion incoherente por el reducido tamano (104,7 M) y el caracter experimental del entrenamiento.
- Sesgos desconocidos: al no documentarse la composicion del corpus, no es posible evaluar sesgos de genero, raza o ideologicos.
- Ablacion deliberada de numerales, pronombres y verbos en el entrenamiento: puede degradar la fluidez y la correccion gramatical en tareas que requieran esas categorias.
- Contexto maximo no documentado: impide planificar casos de uso con ventanas largas.
- Modelo sin traccion (0 descargas, 0 likes): no hay evidencia de uso en la comunidad ni de mantenimiento posterior.
- No apto para produccion: debe tratarse exclusivamente como artefacto de investigacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb-ewc5-ell-ell-sequential
- Tokenizador asociado: https://huggingface.co/nikitastheo/babylm-25k-ell-lower-ablated-num-pron-verb-tokenizer
- Perfil del autor: https://huggingface.co/nikitastheo
