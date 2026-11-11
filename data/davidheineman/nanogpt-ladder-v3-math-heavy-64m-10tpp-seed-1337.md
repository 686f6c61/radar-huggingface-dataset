# davidheineman/nanogpt-ladder-v3-math-heavy-64m-10tpp-seed-1337

## Resumen

NanoGPT Ladder v3 math-heavy 64M es un modelo de lenguaje base de pequeno tamano (63.504.384 parametros) entrenado desde cero como parte de la serie NanoGPT Ladder v3, una coleccion de ejecuciones de preentrenamiento controladas que varian presupuesto de tokens y mezcla de datos. Lo desarrolla davidheineman y se publica en Hugging Face como checkpoint final de preentrenamiento, sin pasar por SFT ni RL. El sufijo "10 TPP" indica 10 tokens por parametro, es decir, 635.043.840 tokens de prediccion a lo largo de 19.380 pasos de optimizador, con semilla 1337.

La relevancia del modelo es metodologica: no es un asistente conversacional ni un modelo instructivo, sino una pieza de un estudio empirico sobre escalado y mezcla de datos ("math-heavy", 80% de la mezcla asignada al dominio matematico segun la receta congelada Dolma3 Dolmino pool). Sirve para reproducir curvas de escalado, comparar recetas de datos y estudiar el efecto de la composicion del corpus en modelos de ~64M de parametros.

La arquitectura es un transformer decoder-only estilo GPT-2 (12 capas, ancho 512, 8 cabezas, embeddings atados, RoPE, tokenizer GPT-2, contexto de 1.024 tokens). Los pesos se distribuyen en formato PyTorch nativo (`model.pt`) con un cargador propio (`model.py`), no compatible con `AutoModel` de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 modificado, estilo nanoGPT) |
| Parametros totales | 63.504.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; no se publican GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible (tokenizer GPT-2, predominantemente ingles) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`), float32 |

Especificaciones adicionales:

| Parametro | Valor |
|---|---|
| Capas | 12 |
| Dimension de embedding (ancho) | 512 |
| Cabezas de atencion | 8 |
| Vocabulario | 50.304 (padded) |
| Tokenizer | GPT-2 (tiktoken) |
| Posicional | RoPE |
| Embeddings | atados (tied) |
| Tokens de entrenamiento | 635.043.840 (10 TPP) |
| Pasos de optimizador | 19.380 |
| Semilla | 1337 |
| Dataset | allenai/dolma3_dolmino_pool (mezcla math-heavy, 80% dominio) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura clasica de nanoGPT: un transformer decoder-only con 12 capas, ancho 512, 8 cabezas de atencion, embeddings de entrada y salida atados, embeddings posicionales rotatorios (RoPE) y tokenizer GPT-2 con vocabulario rellenado hasta 50.304 entradas. El contexto maximo es de 1.024 tokens, coherente con el diseno original de GPT-2.

El entrenamiento es un preentrenamiento puro de modelado de lenguaje autorregresivo sobre 635.043.840 tokens de prediccion, equivalente a 10 tokens por parametro, distribuidos en 19.380 pasos de optimizador con semilla 1337. La mezcla de datos sigue la receta congelada del pool Dolma3 Dolmino; en la variante "math-heavy" el 80% del corpus se asigna al dominio matematico. El repositorio incluye `metadata.json` con revisiones exactas de las fuentes, pesos de mezcla y hashes SHA256, y `results.json` con el registro de finalizacion y evaluaciones finales. No hay fases de SFT, RLHF ni DPO: los pesos son exclusivamente de preentrenamiento.

## Capacidades

- Generacion de texto autorregresiva basica con prompts de texto plano (continuacion de secuencia).
- Modelado de lenguaje: predice el siguiente token y produce probabilidades/logits.
- Decodificacion greedy (`temperature=0`) y muestreo con temperatura.
- Ejecucion en CUDA, Apple MPS o CPU mediante `device=auto`.
- Base para fine-tuning posterior (el checkpoint es compatible con entrenamiento adicional, aunque no incluye estado del optimizador).
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de modo thinking, vision, audio ni capacidades multimodales.
- Capacidades multilingues: no disponibles; el tokenizer GPT-2 esta orientado al ingles.
- No es un modelo instructivo ni conversacional; no sigue instrucciones de forma fiable.

## Casos de uso

- Reproduccion de experimentos de escalado: sirve como punto de referencia (10 TPP, 64M) dentro de la escalera NanoGPT Ladder v3 para validar curvas de loss frente a otras configuraciones de tokens y mezclas.
- Estudio de mezclas de datos: permite comparar el efecto de una mezcla math-heavy (80% dominio) frente a recetas equilibradas sobre el mismo presupuesto de tokens.
- Generacion de texto de bajo coste: continuaciones cortas de prompts en ingles para tareas de prototipado donde no se requiere calidad de produccion.
- Fine-tuning especifico de dominio: al ser un checkpoint base pequeno, puede ajustarse en una sola GPU consumer para tareas de clasificacion o generacion acotada.
- Investigacion educativa sobre transformers: la inclusion de `model.py` y `generate.py` facilita estudiar el codigo de un GPT-2 a escala manejable.
- Evaluacion de tokenizers y vocabularios: util para medir BPB y comportamiento del tokenizer GPT-2 con vocabulario rellenado a 50.304.
- Pruebas de infraestructura de inferencia: modelo ligero para validar pipelines de PyTorch antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que `results.json` contiene evaluaciones finales de BPB y loss, pero son metricas de modelado de lenguaje, no de resolucion de tareas, y no se proporcionan cifras en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (63,5M parametros, ~254 MB de pesos); en la practica cabe en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos ~1 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas, incluida Apple MPS.
- Opciones de despliegue: inferencia nativa con PyTorch mediante `model.py` y `generate.py`; no se publican pesos GGUF, por lo que llama.cpp/Ollama no estan soportados de forma directa; vLLM y TGI no estan documentados para esta arquitectura personalizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 math-heavy 64M (10 TPP) | 63.504.384 | 1.024 | 635.043.840 | no disponible | Hugging Face (PyTorch nativo) |
| GPT-2 small | 124M | 1.024 | ~40.000M aprox. (no verificado) | MIT | Hugging Face, Transformers |
| Otros checkpoints NanoGPT Ladder v3 | ~64M (variantes) | 1.024 | segun configuracion TPP | no disponible | Hugging Face (coleccion del autor) |

La comparacion directa con GPT-2 small es aproximada: GPT-2 small tiene el doble de parametros y un presupuesto de tokens muy superior, mientras que este checkpoint esta disenado como punto experimental de una escalera controlada. No se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- Modelo exclusivamente base: no ha recibido SFT, RLHF ni DPO, por lo que no sigue instrucciones ni mantiene formato conversacional.
- Riesgo alto de alucinacion y de generar texto incoherente o repetitivo, especialmente en contextos largos.
- Contexto muy limitado (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno.
- Sesgos: hereda los sesgos del corpus Dolma3 Dolmino, con sesgo adicional hacia contenido matematico por la mezcla math-heavy; no se documentan evaluaciones de sesgo.
- Idiomas: no se especifican; el tokenizer GPT-2 esta orientado al ingles y el rendimiento en castellano sera previsiblemente bajo.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar al autor antes de cualquier despliegue productivo.
- Formato de pesos no estandar: requiere el cargador propio del repositorio; no es compatible con `AutoModel` de Transformers ni con herramientas de cuantizacion habituales.
- No incluye estado del optimizador, lo que limita la reanudacion exacta del entrenamiento.
- Las metricas de `results.json` son de modelado de lenguaje (BPB/loss), no de precision en tareas.
- El modelo es experimental y no esta pensado para uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-math-heavy-64m-10tpp-seed-1337
- Coleccion NanoGPT Ladder v3 (modelos completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset Dolma3 Dolmino pool: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- Repositorio nanoGPT (referencia de arquitectura): no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
