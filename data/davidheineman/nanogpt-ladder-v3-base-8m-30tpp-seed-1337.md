# davidheineman/nanogpt-ladder-v3-base-8m-30tpp-seed-1337

## Resumen

NanoGPT Ladder v3 base 8M 30 TPP es un modelo de lenguaje de tipo base (pretrained, sin ajuste fino posterior) desarrollado por davidheineman dentro de la coleccion NanoGPT Ladder v3, una serie de experimentos de preentrenamiento a pequena escala orientados al estudio sistematico de recetas de entrenamiento. El modelo cuenta con 8.011.776 parametros y ha sido entrenado sobre 240.353.280 tokens de prediccion (30 tokens por parametro, de ahi la nomenclatura "30 TPP") en 7.335 pasos de optimizador, con semilla 1337.

Se trata de una implementacion propia de la arquitectura GPT (estilo nanoGPT) con 8 capas, anchura 128, 4 cabezas de atencion, embeddings atados, RoPE y tokenizador GPT-2 con vocabulario rellenado hasta 50.304 entradas. El contexto maximo es de 1.024 tokens y los pesos originales estan en float32. El modelo se distribuye como checkpoint nativo de PyTorch con scripts propios de carga e inferencia, no como modelo compatible con `AutoModel` de Transformers.

Su relevancia es fundamentalmente investigadora: forma parte de una escalera (ladder) de puntos de preentrenamiento independientes que permiten estudiar el efecto del presupuesto de tokens sobre el rendimiento. No es un modelo pensado para produccion ni para tareas de usuario final; sus pesos preceden a cualquier fase de SFT o RL, por lo que solo deben usarse con prompts de texto plano en modo continuacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT (nanoGPT), con RoPE y embeddings atados |
| Parametros totales | 8.011.776 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (tokenizador GPT-2, entrenado sobre Dolma3 Dolmino pool; no se declara lista de idiomas) |
| Licencia | no disponible |
| Formato de pesos | checkpoint nativo PyTorch (`model.pt`), no safetensors ni GGUF |

Otros datos tecnicos: 8 capas, `n_embd` = 128, 4 cabezas de atencion, vocabulario 50.304 (GPT-2 con padding), 240.353.280 tokens de prediccion, 7.335 pasos de optimizador, semilla 1337. El repositorio incluye `model.py`, `generate.py`, `metadata.json` (revisiones exactas de fuentes, pesos de mezcla y SHA256) y `results.json` (registro original de finalizacion y evaluaciones finales).

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clasico de tipo GPT, implementado en PyTorch con un cargador propio. Usa 8 capas con anchura 128 y 4 cabezas de atencion (32 dimensiones por cabeza), embeddings de entrada y salida atados, codificacion posicional rotatoria (RoPE) y tokenizador GPT-2 con vocabulario rellenado a 50.304. El contexto de entrenamiento es de 1.024 tokens y los pesos se guardan en float32.

El preentrenamiento utiliza el dataset `allenai/dolma3_dolmino_pool` siguiendo la receta congelada del pool Dolmino. La model card indica que las mezclas "heavy" asignan el 80% de la masa de muestreo al dominio nombrado, mientras que la mezcla base sigue la receta estandar del pool. El checkpoint corresponde al punto final de un entrenamiento de 240.353.280 tokens (30 tokens por parametro) en 7.335 pasos. No se documenta el uso de RLHF, DPO ni SFT: el autor indica explicitamente que estos pesos preceden a la condicionacion tiny-rl, al SFT y al RL. El checkpoint contiene estados de modelo, configuracion, identidad y metadatos de la ejecucion, pero no el estado del optimizador.

## Capacidades

- Generacion de texto por continuacion de prompt (modelo base, sin instrucciones ni formato conversacional).
- Razonamiento y conocimiento factual muy limitados por el tamano (8M de parametros) y el presupuesto de entrenamiento.
- Generacion de codigo y matematicas: no fiable a esta escala; no se documentan capacidades especificas.
- Tool calling / function calling: no soportado.
- Uso como agente o razonamiento multi-paso: no soportado.
- Capacidades multilingues: no documentadas; el tokenizador es GPT-2 y el corpus es Dolmino, sin lista declarada de idiomas.
- Modo thinking, vision o audio: no disponible.
- Reutilizable como punto de partida para ajuste fino posterior (el checkpoint admite entrenamiento adicional, sin estado de optimizador).

## Casos de uso

- Investigacion sobre leyes de escala a pequena escala: el modelo es un punto de la escalera NanoGPT Ladder v3 con presupuesto fijo de 30 tokens por parametro, util para comparar curvas de perdida (BPB) frente a otros puntos de la misma serie con distinto presupuesto.
- Reproduccion de experimentos de preentrenamiento: `metadata.json` registra revisiones exactas de fuentes, pesos de mezcla y SHA256, lo que permite reproducir la receta y verificar la integridad de los datos.
- Docencia y divulgacion: con 8M de parametros y scripts de carga minimos (`model.py`, `generate.py`), sirve para explicar el funcionamiento interno de un transformer GPT sin infraestructura pesada.
- Pruebas de infraestructura de inferencia: al ser un checkpoint nativo de PyTorch en float32, es adecuado para validar pipelines de carga, tokenizacion y generacion en CUDA, Apple MPS o CPU antes de escalar a modelos mayores.
- Ajuste fino academico de bajo coste: el checkpoint admite fine-tuning adicional; su tamano permite iterar rapidamente en tareas de clasificacion o continuacion con recursos minimos.
- Generacion de texto de relleno en demos y tests: util para pruebas de integracion de interfaces de generacion donde no se requiere calidad linguistica, con decodificacion greedy (`temperature=0`) o muestreo controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que `results.json` contiene evaluaciones finales expresadas como BPB/loss (medidas de modelado de lenguaje), no como precision en tareas, y no se proporcionan los valores numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 0,1 GB en float32 (8M de parametros, aproximadamente 32 MB de pesos mas activaciones minimas para contexto de 1.024 tokens).
- GPU recomendadas: cualquier GPU con CUDA; el modelo es trivial para A100, H100, RTX 4090 o GPUs de gama baja.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU con soporte CUDA/MPS; tambien funciona en CPU.
- Opciones de despliegue: scripts propios del repositorio (`generate.py` con `device=auto` para CUDA, Apple MPS o CPU). No es compatible con `AutoModel` de Transformers, por lo que vLLM, TGI u Ollama no lo soportan de forma nativa sin conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano, la latencia sera dominada por el overhead de framework y no por el computo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 base 8M 30 TPP | 8,0M | 1.024 | no disponible | PyTorch nativo | Punto de una escalera de preentrenamiento con receta Dolmino |
| Otros puntos de NanoGPT Ladder v3 | variable | 1.024 (segun serie) | no disponible | PyTorch nativo | Misma receta, distinto presupuesto de tokens por parametro; comparables directos |
| GPT-2 small (OpenAI) | 124M | 1.024 | MIT | safetensors, GGUF | Referencia historica de GPT pequeno; 15 veces mas parametros |
| TinyLlama / modelos <1B | 1,1B | 2.048 | Apache 2.0 | safetensors, GGUF | Escala muy superior; no comparable en coste ni en calidad |

La comparacion relevante es interna a la coleccion NanoGPT Ladder v3, ya que no existen alternativas publicas con exactamente 8M de parametros y esta receta. Frente a GPT-2 small, la diferencia de escala (8M frente a 124M) hace que la calidad esperada sea sustancialmente inferior.

## Limitaciones y advertencias

- Modelo base sin alineacion: no sigue instrucciones, no mantiene formato conversacional y solo debe usarse con prompts de texto plano en modo continuacion.
- Calidad linguistica muy limitada: 8M de parametros y 240M de tokens de entrenamiento implican coherencia local corta y alta probabilidad de texto incoherente o repetitivo.
- Riesgo elevado de alucinacion: sin conocimiento factual fiable; cualquier afirmacion generada debe tratarse como no verificada.
- Contexto corto: 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno.
- Idiomas no declarados: no hay garantia de rendimiento en castellano ni en ningun idioma concreto; el corpus Dolmino no se detalla por idioma en la informacion disponible.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Sin estado de optimizador en el checkpoint: reanudar el preentrenamiento exacto no es posible sin reconstruir el estado.
- No compatible con ecosistema Transformers: requiere el cargador propio del repositorio, lo que limita herramientas de despliegue estandar.
- Sesgos: no documentados; al derivar de un corpus web a gran escala, es probable que herede sesgos del dataset, aunque no se cuantifican en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-base-8m-30tpp-seed-1337
- Coleccion NanoGPT Ladder v3 (modelos preentrenados completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
