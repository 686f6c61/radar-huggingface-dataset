# davidheineman/nanogpt-ladder-v3-base-16m-100tpp-seed-1337

## Resumen

NanoGPT Ladder v3 base 16M 100 TPP es un modelo de lenguaje de tipo base (pretrained, sin ajuste fino posterior) desarrollado por davidheineman dentro de la serie NanoGPT Ladder v3. Se trata de un transformer decoder-only de pequeno tamano, con 15.851.520 parametros, 14 capas, anchura 192 y 6 cabezas de atencion, entrenado sobre el dataset allenai/dolma3_dolmino_pool. Su proposito principal es servir como punto de referencia reproducible en experimentos de preentrenamiento a escala controlada, no como modelo de produccion.

El checkpoint corresponde al punto final de preentrenamiento con un presupuesto de 100 TPP (tokens por parametro), lo que equivale a 1.585.152.000 tokens de prediccion a lo largo de 48.375 pasos de optimizacion, con semilla 1337. Cada presupuesto de tokens de la serie es un entrenamiento independiente, de modo que el modelo funciona como una pieza de una escalera (ladder) que permite estudiar el efecto del numero de tokens vistos sobre el rendimiento.

Es relevante ahora porque ofrece pesos en float32 originales, configuracion exacta, metadatos de procedencia (revisiones de origen, pesos de mezcla y SHA256) y scripts de generacion autocontenidos. Los pesos preceden a cualquier condicionamiento tiny-rl, SFT o RL, por lo que debe usarse con prompts de texto plano y no se debe esperar comportamiento de instrucciones ni de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (NanoGPT), embeddings atados, RoPE |
| Parametros totales | 15.851.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`), no safetensors ni GGUF |
| Capas | 14 |
| Dimension del modelo (width) | 192 |
| Cabezas de atencion | 6 |
| Tokenizer | GPT-2 (tiktoken) |
| Vocabulario | 50.304 (padded) |
| Tokens de preentrenamiento | 1.585.152.000 (100 TPP) |
| Pasos de optimizacion | 48.375 |
| Semilla | 1337 |
| Dataset | allenai/dolma3_dolmino_pool |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clasico al estilo NanoGPT: 14 bloques, anchura 192, 6 cabezas de atencion, embeddings de entrada y salida atados y codificacion posicional rotatoria (RoPE). El tokenizer es el de GPT-2 mediante tiktoken, con un vocabulario rellenado hasta 50.304 entradas, y la ventana de contexto es de 1.024 tokens. El checkpoint conserva los pesos de embedding y salida atados y admite inferencia y ajuste fino posterior, pero no incluye estado del optimizador.

El entrenamiento se realizo sobre el pool Dolma3 Dolmino con la receta de mezcla congelada del autor; en las mezclas denominadas "heavy", el 80% de los datos se asigna al dominio nombrado. El modelo se entreno durante 48.375 pasos hasta consumir 1.585.152.000 tokens de prediccion, con semilla 1337. No se aplico SFT, RLHF, DPO ni condicionamiento tiny-rl: los pesos son el punto final del preentrenamiento puro. El repositorio incluye `metadata.json` con revisiones de origen, pesos de mezcla y SHA256, y `results.json` con el registro original de finalizacion y las evaluaciones finales.

## Capacidades

- Generacion de texto autoregresiva a partir de prompts de texto plano, con decodificacion greedy (temperatura 0) o muestreo.
- Modelado de lenguaje puro: prediccion del siguiente token sobre contexto de hasta 1.024 tokens.
- Capacidad de ajuste fino posterior, ya que el checkpoint expone los pesos y la configuracion completa.
- Compatibilidad con el codigo propio del repositorio (`model.py`, `generate.py`), que carga el checkpoint nativo de PyTorch.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- No se ha documentado capacidad multilingue; los idiomas soportados figuran como no disponibles.
- No esta alineado para instrucciones ni para conversacion.

## Casos de uso

- Reproduccion de experimentos de escalado: el modelo forma parte de una escalera de presupuestos de tokens (100 TPP en este caso) entrenados de forma independiente, lo que permite comparar curvas de perdida y BPB frente a otros puntos de la serie con la misma receta y semilla.
- Investigacion sobre mezclas de datos: al seguir la receta congelada de Dolma3 Dolmino y registrar los pesos de mezcla en `metadata.json`, sirve para estudiar como afecta la composicion del corpus al rendimiento en dominios concretos.
- Punto de partida para ajuste fino academico: al incluir pesos y configuracion sin estado del optimizador, se puede reentrenar o adaptar en tareas pequenas con recursos minimos.
- Pruebas de infraestructura y pipelines de entrenamiento: su tamano reducido (repositorio de 0,1 GB) permite validar flujos de descarga, carga de checkpoints y generacion en CUDA, Apple MPS o CPU sin coste relevante.
- Docencia y divulgacion: util para ilustrar el funcionamiento interno de un transformer decoder-only con RoPE y embeddings atados, ejecutable en hardware de consumo.
- Evaluacion de tecnicas de decodificacion: con soporte de decodificacion greedy y muestreo sobre contexto de 1.024 tokens, permite experimentos controlados de temperatura y estrategias de generacion.
- Generacion de texto de referencia en tareas de continuacion de texto y calculo de perplejidad/BPB sobre corpus de validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las mediciones finales de BPB y perdida son evaluaciones de modelado de lenguaje y no precision en resolucion de tareas, y remite a `results.json` para el registro original, sin cifras concretas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 15,85 millones de parametros en float32 los pesos ocupan aproximadamente 63 MB, y en fp16 unos 32 MB. El coste dominante es el contexto (1.024 tokens), no el modelo.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Funciona en RTX 4090, RTX 3090, GPUs de portatil e incluso en Apple MPS.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: el repositorio incluye un cargador propio de PyTorch (`model.py` y `generate.py`); no usa Transformers AutoModel, por lo que vLLM, TGI u Ollama no son compatibles de forma directa sin conversion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 base 16M 100 TPP | 15.851.520 | 1.024 | no disponible | PyTorch nativo | Hugging Face (0 descargas) |
| Otros puntos de la serie NanoGPT Ladder v3 | no disponible | no disponible | no disponible | PyTorch nativo | Coleccion en Hugging Face |
| GPT-2 small (referencia de tokenizer y escala) | 124M | 1.024 | no disponible en esta ficha | safetensors/PyTorch | Amplia |
| Alternativas comparables de 16M | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con modelos de terceros no puede completarse con datos verificados en la informacion proporcionada; los unicos puntos directamente comparables son los demas modelos completados de la propia coleccion NanoGPT Ladder v3 del autor.

## Limitaciones y advertencias

- Modelo base sin alineacion: no sigue instrucciones, no mantiene conversacion y no debe usarse como asistente.
- Riesgo elevado de alucinacion y de texto incoherente, especialmente fuera del estilo del corpus de preentrenamiento.
- Contexto limitado a 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas soportados no documentados; el comportamiento multilingue es incierto.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre Dolma3 Dolmino, hereda los sesgos del corpus sin filtrado posterior.
- Pesos en float32 y cargador propio: no es compatible directamente con ecosistemas estandar como Transformers, vLLM o llama.cpp sin trabajo de conversion.
- Las metricas publicadas son de modelado de lenguaje (BPB/perdida), no de precision en tareas; no deben interpretarse como capacidad de resolucion de problemas.
- Repositorio sin descargas ni likes y creado recientemente: ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-base-16m-100tpp-seed-1337
- Coleccion de modelos completados NanoGPT Ladder v3: https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset allenai/dolma3_dolmino_pool: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
