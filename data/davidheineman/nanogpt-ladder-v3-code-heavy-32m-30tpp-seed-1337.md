# davidheineman/nanogpt-ladder-v3-code-heavy-32m-30tpp-seed-1337

## Resumen

NanoGPT Ladder v3 code-heavy 32M es un modelo de lenguaje base de tipo GPT entrenado desde cero como parte de la colección NanoGPT Ladder v3, una serie de ejecuciones independientes de preentrenamiento a distintas escalas de cómputo. Lo desarrolla davidheineman y se publica en Hugging Face como un punto final de preentrenamiento completado: 32.071.680 parámetros, 962.134.016 tokens de predicción y 29.362 pasos de optimizador, con semilla 1337. Su propósito es servir como referencia reproducible para estudiar el efecto de la mezcla de datos (en este caso, orientada a código) en modelos pequeños.

Arquitectónicamente es un transformer decoder-only estilo GPT-2 con 13 capas, anchura 320, 5 cabezas de atención, embeddings atados, RoPE y tokenizador GPT-2, con una longitud de contexto de 1.024 tokens y un vocabulario rellenado de 50.304 entradas. Los pesos son float32 originales y se distribuyen con un cargador propio (`model.py` y `generate.py`), no mediante `AutoModel` de Transformers.

Es relevante ahora por su carácter de modelo de investigación: los pesos preceden a cualquier etapa de tiny-rl, SFT o RL, por lo que son un punto de partida limpio para estudiar dinámicas de preentrenamiento, curvas de pérdida y efectos de mezclas de dominio en un régimen de escala pequeña. No es un modelo destinado a producción ni a tareas de instrucción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (NanoGPT) |
| Parametros totales | 32.071.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`), cargador propio; no safetensors ni GGUF |

Otros datos tecnicos: 13 capas, anchura 320, 5 cabezas de atencion, embeddings atados, RoPE, tokenizador GPT-2, vocabulario rellenado de 50.304, 962.134.016 tokens de prediccion, 29.362 pasos de optimizador, semilla 1337, tamano del repo 0,1 GB.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atención causal estándar, 13 bloques, dimensión de modelo 320 y 5 cabezas de atención, con embeddings de entrada y de salida atados y codificación posicional rotatoria (RoPE). Usa el tokenizador GPT-2 de `tiktoken` con un vocabulario rellenado hasta 50.304 entradas. La implementación es la de NanoGPT, con un cargador propio que reconstruye el modelo a partir del diccionario `config` del checkpoint.

El preentrenamiento se realizó sobre el pool Dolma3 Dolmino (`allenai/dolma3_dolmino_pool`) siguiendo una receta congelada de mezcla; en las mezclas "heavy" el 80% de los datos se asigna al dominio nombrado, en este caso código. El run consumió 962.134.016 tokens de predicción en 29.362 pasos de optimizador. El archivo `metadata.json` registra las revisiones exactas de las fuentes, los pesos de mezcla y los SHA256, y `results.json` contiene el registro de finalización y las evaluaciones finales. No se aplicó RLHF, DPO ni SFT: los pesos son el punto final del preentrenamiento previo a tiny-rl.

## Capacidades

- Generación de texto autoregresiva a partir de prompts de texto plano, sin formato de chat ni de instrucciones.
- Modelado de lenguaje y continuación de secuencias hasta 1.024 tokens de contexto.
- Exposición de logits por token mediante `forward_logits`, útil para evaluación de pérdida y análisis.
- Capacidad de fine-tuning posterior: el checkpoint es compatible con entrenamiento adicional (sin estado del optimizador).
- Sesgo de dominio hacia código por la mezcla de entrenamiento (80% al dominio nombrado).
- No dispone de tool calling, function calling, razonamiento multi-paso guiado, visión, audio ni modo de pensamiento.
- Capacidades multilingües: no documentadas; el tokenizador GPT-2 y la mezcla Dolmino no garantizan un comportamiento multilingüe fiable a esta escala.

## Casos de uso

- Investigación sobre mezclas de datos: comparar este run code-heavy con los demás modelos de la colección NanoGPT Ladder v3 para aislar el efecto de la proporción de código en la pérdida de validación.
- Reproducibilidad de preentrenamiento: usar `metadata.json` y `results.json` para replicar exactamente la mezcla, las revisiones de datos y la semilla 1337 en experimentos de escalado.
- Punto de partida para fine-tuning: ajustar el checkpoint en tareas downstream pequeñas (clasificación de código, generación de snippets) sin partir de un modelo preentrenado de mayor tamaño.
- Evaluación de curvas de escalado: emplear el modelo como punto de la "ladder" para estudiar leyes de escalado a 32M de parámetros y 30 tokens por parámetro.
- Docencia y divulgación: ilustrar el funcionamiento interno de un transformer GPT-2 con un checkpoint pequeño, código de carga explícito y pesos float32.
- Análisis de sesgos de dominio: medir cómo el sesgo hacia código afecta a la perplejidad en texto natural frente a código, usando las evaluaciones BPB/loss incluidas.
- Prototipado de pipelines de inferencia: probar `generate.py` con selección automática de dispositivo (CUDA, Apple MPS, CPU) y decodificación greedy (`temperature=0`) en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las mediciones finales son evaluaciones de modelado de lenguaje (BPB/loss) y no precisión en resolución de tareas; no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 32M de parámetros en float32 los pesos ocupan aproximadamente 128 MB, más activaciones y caché KV para 1.024 tokens.
- GPU recomendadas: cualquier GPU con al menos ~1 GB de memoria libre; cabe holgadamente en RTX 3060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: el cargador propio incluido (`model.py`, `generate.py`) con PyTorch; selección automática de dispositivo CUDA, Apple MPS o CPU. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que la arquitectura usa un cargador personalizado y no `AutoModel`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 code-heavy 32M (este) | 32,1M | 1.024 | no disponible | PyTorch propio | Mezcla 80% código, semilla 1337 |
| Otros runs de NanoGPT Ladder v3 | no disponible | no disponible | no disponible | PyTorch propio | Misma receta, distinta mezcla o escala; comparables por diseño |
| GPT-2 small | 124M | 1.024 | MIT (pesos OpenAI) | safetensors/PyTorch | Referencia clásica de la misma familia arquitectónica |
| Modelos de 30-50M tipo Pythia/TinyLlama-like | no disponible | variable | variable | variable | No disponible en la información proporcionada |

La comparación cuantitativa de rendimiento con alternativas no está disponible; la única comparación fiable es interna a la colección NanoGPT Ladder v3, donde cada run comparte arquitectura y receta y difiere en mezcla de datos y presupuesto de tokens.

## Limitaciones y advertencias

- Es un modelo base sin instrucciones: no sigue órdenes, no mantiene formato de chat y produce continuaciones de texto plano.
- Riesgo alto de alucinación y de texto incoherente a esta escala (32M de parámetros); no apto para producción.
- Contexto muy limitado (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno.
- Sesgo de dominio hacia código por la mezcla 80/20, lo que puede degradar la calidad en texto natural.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe correcto.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier uso más allá de investigación.
- No incluye estado del optimizador, por lo que reanudar el entrenamiento exacto no es posible desde este checkpoint.
- Requiere el cargador propio; no es compatible con `AutoModel` de Transformers ni con herramientas estándar de serving sin adaptación.
- Las métricas publicadas son de modelado de lenguaje (BPB/loss), no de precisión en tareas; no deben interpretarse como rendimiento funcional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-code-heavy-32m-30tpp-seed-1337
- Colección NanoGPT Ladder v3 (modelos preentrenados completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- Repositorio NanoGPT (implementación de referencia): https://github.com/karpathy/nanoGPT
