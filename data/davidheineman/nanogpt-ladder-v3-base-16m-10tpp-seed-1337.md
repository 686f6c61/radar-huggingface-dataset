# davidheineman/nanogpt-ladder-v3-base-16m-10tpp-seed-1337

## Resumen

NanoGPT Ladder v3 base 16M es un modelo de lenguaje de tipo transformer decoder-only entrenado desde cero por el usuario de Hugging Face davidheineman como parte de la coleccion NanoGPT Ladder v3, una serie de ejecuciones de preentrenamiento controladas que varian el presupuesto de tokens para estudiar el escalado. Este checkpoint concreto corresponde al punto final de un entrenamiento de 10 tokens por parametro (TPP) con semilla 1337, y cuenta con 15.851.520 parametros entrenados sobre 158.498.816 tokens de prediccion en 4.837 pasos de optimizador.

Se trata de un modelo base puro: los pesos preceden a cualquier fase de acondicionamiento tiny-rl, SFT o RL, por lo que no esta alineado para instrucciones y debe usarse con prompts de texto plano. Su interes no es la utilidad de producto sino la reproducibilidad experimental: la model card documenta la receta de mezcla de datos (Dolma3 Dolmino pool), las revisiones exactas de las fuentes y los hashes SHA256 en `metadata.json`, ademas de las evaluaciones finales en `results.json`.

La arquitectura es un GPT clasico de 14 capas, anchura 192, 6 cabezas de atencion, embeddings atados, RoPE, tokenizador GPT-2 y una ventana de contexto de 1.024 tokens, con vocabulario ampliado a 50.304 entradas. Los pesos originales estan en float32 y el repositorio ocupa aproximadamente 0,1 GB, lo que lo convierte en una pieza adecuada para experimentacion en CPU o en GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT), 14 capas, anchura 192, 6 cabezas de atencion, embeddings atados, RoPE |
| Parametros totales | 15.851.520 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (entrenado sobre Dolma3 Dolmino pool, sin desglose linguistico publicado) |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch nativo (`model.pt`) con `model`, `config`, `identity` y `run`; no compatible con AutoModel de Transformers |
| Vocabulario | 50.304 (tokenizador GPT-2 con vocabulario ampliado) |
| Tokens de entrenamiento | 158.498.816 tokens de prediccion (10 TPP) |
| Pasos de optimizador | 4.837 |
| Semilla | 1337 |

## Arquitectura y entrenamiento

El modelo sigue la implementacion de NanoGPT: un transformer decoder-only con normalizacion previa, atencion multi-cabeza con 6 cabezas sobre una dimension de 192 (32 dimensiones por cabeza), 14 bloques y proyecciones MLP convencionales. Emplea embeddings de entrada y de salida atados, codificacion posicional rotatoria (RoPE) en lugar de posiciones aprendidas, y un tokenizador GPT-2 con vocabulario rellenado hasta 50.304 entradas. El contexto maximo es de 1.024 tokens.

El preentrenamiento se realizo sobre el pool Dolma3 Dolmino de AllenAI siguiendo una receta de mezcla congelada. La model card distingue entre mezclas base y mezclas "heavy", en las que el 80% de los datos se asigna al dominio nombrado; `metadata.json` registra las revisiones exactas de las fuentes, los pesos de mezcla y los SHA256. Cada presupuesto de tokens de la escalera NanoGPT Ladder v3 es una ejecucion entrenada de forma independiente, de modo que este checkpoint de 10 TPP es comparable directamente con los de otros TPP de la misma serie. No se documenta uso de RLHF, DPO ni decodificacion especulativa; las mediciones finales son de tipo BPB y loss, es decir, evaluaciones de modelado del lenguaje y no de acierto en tareas.

## Capacidades

- Generacion de texto autoregresiva a partir de prompts de texto plano, en modo base sin alineacion.
- Continuacion de texto y modelado de lenguaje puro; no hay modo de instrucciones ni formato de chat.
- Decodificacion greedy (`temperature=0`) y muestreo con temperatura configurable mediante el script incluido.
- Ejecucion en CUDA, Apple MPS o CPU mediante seleccion automatica de dispositivo (`device=auto`).
- Carga nativa en PyTorch con el `model.py` del repositorio y posibilidad de fine-tuning posterior (sin estado de optimizador en el checkpoint).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no documentadas mas alla de la composicion del pool Dolma3 Dolmino.

## Casos de uso

- Estudio de leyes de escalado: al ser una ejecucion independiente con presupuesto fijo de 10 TPP y semilla 1337, sirve como punto de datos para ajustar curvas de loss frente a tokens y comparar con los demas checkpoints de la escalera NanoGPT Ladder v3.
- Reproduccion de experimentos de preentrenamiento: `metadata.json` incluye revisiones de fuentes, pesos de mezcla y SHA256, lo que permite replicar la mezcla de datos y verificar la integridad del pipeline.
- Docencia y formacion: con 15,8 millones de parametros y un repositorio de 0,1 GB, el modelo se entrena y se ejecuta en portatiles, lo que facilita explicar en clase el funcionamiento interno de un transformer desde los pesos hasta la generacion.
- Pruebas de infraestructura de inferencia: util como modelo de humo para validar scripts de carga, tokenizacion con `tiktoken` y generacion antes de pasar a modelos mayores en el mismo pipeline.
- Punto de partida para fine-tuning ligero: el checkpoint admite entrenamiento posterior, por lo que sirve para experimentos de adaptacion a dominios pequenos con presupuesto de computo minimo.
- Investigacion sobre mezclas de datos: las variantes "heavy" que asignan el 80% a un dominio permiten aislar el efecto de la composicion del corpus en un modelo de este tamano, con contexto de 1.024 tokens suficiente para documentos cortos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que `results.json` contiene el registro de finalizacion y las evaluaciones finales, medidas en BPB y loss, y advierte explicitamente que estas son evaluaciones de modelado del lenguaje, no de acierto en tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (15,85 millones de parametros, unos 63 MB de pesos mas el grafo de activaciones para contexto de 1.024 tokens).
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; funciona en RTX 4090, A100 o H100 sin aprovechar su capacidad. Tambien en GPU integradas y en Apple Silicon via MPS.
- Cabe en cualquier GPU de consumo, incluida la gama baja, y en CPU sin problema.
- Opciones de despliegue: el repositorio incluye `model.py` y `generate.py` para carga nativa en PyTorch; no es compatible con `AutoModel` de Transformers, y no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera generacion en tiempo real incluso en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 base 16M 10 TPP (este) | 15,85 M | 1.024 | no disponible | Hugging Face, checkpoint PyTorch nativo | Ejecucion experimental de la escalera; sin benchmarks de tareas |
| Otros checkpoints NanoGPT Ladder v3 (distintos TPP y semillas) | ~15,85 M | 1.024 | no disponible | Coleccion en Hugging Face | Misma arquitectura y receta; comparables directamente por TPP |
| GPT-2 small (referencia de la familia) | 124 M | 1.024 | MIT | Hugging Face, Transformers | Tokenizador identico; mucho mayor y con benchmarks publicos |
| Modelos tipo TinyLlama / SmolLM en el rango 100M-1B | 100 M - 1 B | 2.048 o mas | variable | Hugging Face | Mayores, alineados para instrucciones y con evaluaciones de tareas |

La comparacion relevante para este checkpoint es interna a la propia escalera NanoGPT Ladder v3, ya que su proposito es el estudio controlado del escalado y no la competicion en benchmarks de tareas.

## Limitaciones y advertencias

- Modelo base sin alineacion: no sigue instrucciones, no mantiene formato de chat y puede producir continuaciones incoherentes o repetitivas con prompts conversacionales.
- Riesgo alto de alucinacion y de contenido factualmente incorrecto, propio de un modelo de 15,85 millones de parametros entrenado con 158 millones de tokens.
- Contexto limitado a 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas soportados no documentados; el rendimiento fuera del ingles (y de los idiomas presentes en Dolma3 Dolmino) no esta caracterizado.
- Licencia no disponible: no se puede asumir uso comercial permitido sin consultar al autor.
- No es compatible con la API `AutoModel` de Transformers; requiere el cargador propio del repositorio, lo que complica su integracion en stacks estandar.
- El checkpoint no incluye estado del optimizador, por lo que reanudar el preentrenamiento exacto no es posible solo con estos pesos.
- Las metricas publicadas (BPB y loss) no son indicativas de calidad en tareas; no deben presentarse como rendimiento funcional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-base-16m-10tpp-seed-1337
- Coleccion NanoGPT Ladder v3 (modelos preentrenados completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
