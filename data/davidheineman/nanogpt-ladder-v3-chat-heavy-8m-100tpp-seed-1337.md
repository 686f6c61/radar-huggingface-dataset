# davidheineman/nanogpt-ladder-v3-chat-heavy-8m-100tpp-seed-1337

## Resumen

NanoGPT Ladder v3 · chat-heavy · 8M · 100 TPP es un modelo de lenguaje de escala minima (8.011.776 parametros) desarrollado por davidheineman como parte del proyecto NanoGPT Ladder v3, una serie de ejecuciones de preentrenamiento controladas y reproducibles sobre la arquitectura GPT de nanoGPT. No es un modelo destinado a produccion ni a tareas de usuario final: es un checkpoint de investigacion que documenta el punto final de un preentrenamiento completo sobre una mezcla de datos "chat-heavy" del pool Dolma3 Dolmino.

El modelo resuelve el problema de disponer de puntos de referencia (baselines) pequenos, baratos y totalmente reproducibles para estudiar el efecto de la mezcla de datos, la escala y las semillas en el preentrenamiento. Cada presupuesto de tokens es una ejecucion entrenada de forma independiente, con semilla fija (1337) y metadatos que registran revisiones exactas de las fuentes, pesos de mezcla y hashes SHA256.

Arquitectura transformer decoder-only de 8 capas, anchura 128, 4 cabezas de atencion, embeddings atados, RoPE y tokenizer GPT-2 con contexto de 1.024 tokens. Los pesos son previos a cualquier acondicionamiento tiny-rl, SFT o RL, por lo que se comportan como un modelo base: completan texto, no siguen instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT estilo nanoGPT), 8 capas, anchura 128, 4 cabezas de atencion, embeddings atados, RoPE |
| Parametros totales | 8.011.776 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (tokenizer GPT-2, predominantemente ingles; no se declara lista de idiomas) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`) con loader propio (`model.py`); no compatible con `AutoModel` de Transformers |
| Vocabulario | 50.304 (padded), tokenizer GPT-2 via tiktoken |
| Tokens de entrenamiento | 801.177.600 (100 TPP sobre 8M parametros) |
| Pasos de optimizacion | 24.450 |
| Semilla | 1337 |
| Dataset | allenai/dolma3_dolmino_pool (mezcla chat-heavy, 80% al dominio nombrado) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT clasica de nanoGPT: pila de 8 bloques transformer con atencion multi-cabeza (4 cabezas), dimension de modelo 128, normalizacion previa, activacion GeLU, embeddings de tokens y de salida atados y codificacion posicional rotatoria (RoPE). El vocabulario se rellena hasta 50.304 entradas para alineacion. El checkpoint incluye `model`, `config`, `identity` y `run`, y conserva los pesos de embedding y salida atados; no incluye estado del optimizador, por lo que sirve para inferencia y fine-tuning posterior pero no para reanudar el entrenamiento original.

El preentrenamiento consumio 801.177.600 tokens de prediccion en 24.450 pasos, lo que equivale a 100 tokens por parametro (TPP). La mezcla de datos es "chat-heavy": segun la receta congelada de Dolma3 Dolmino, las mezclas heavy asignan el 80% de la masa al dominio nombrado (en este caso, datos de estilo conversacional) y el resto se reparte entre el pool general. El fichero `metadata.json` del repositorio registra las revisiones exactas de las fuentes, los pesos de mezcla y los SHA256, lo que permite reproducir la ejecucion. No se documenta uso de RLHF, DPO ni SFT en este checkpoint.

## Capacidades

- Generacion de texto autoregresiva basica: completado de prompts con decodificacion greedy (`temperature=0`) o con muestreo.
- Modelado de lenguaje puro: el checkpoint esta pensado para evaluacion de perdida y BPB, no para resolver tareas.
- Capacidad de fine-tuning: al conservar los pesos atados y no incluir estado del optimizador, puede usarse como punto de partida para SFT o RL posteriores (etapa tiny-rl del proyecto).
- Ejecucion en CPU, CUDA y Apple MPS mediante `device=auto` en el script incluido.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidades multilingues no documentadas; el tokenizer GPT-2 limita el rendimiento fuera del ingles.
- No sigue instrucciones: es un modelo base previo a SFT y RL.

## Casos de uso

- Investigacion sobre mezclas de datos: comparar el efecto de una mezcla chat-heavy frente a otras recetas del proyecto Ladder v3 manteniendo fijos arquitectura, semilla y presupuesto de tokens, y midiendo perdida y BPB sobre validacion.
- Estudio de leyes de escala: usar los distintos puntos de la escalera (distintos tamanos y TPP) para ajustar curvas de perdida frente a parametros y tokens con un coste de computo minimo.
- Reproducibilidad y auditoria: verificar experimentos a partir de `metadata.json` (revisiones de fuentes, pesos de mezcla, SHA256) y de `results.json` (registro de finalizacion y evaluaciones finales).
- Baseline para tecnicas de post-entrenamiento: servir como punto de partida controlado para probar SFT, DPO o RL a escala tiny y aislar el efecto del post-entrenamiento del de la arquitectura.
- Docencia y formacion: ilustrar el ciclo completo de preentrenamiento de un GPT (tokenizer, RoPE, embeddings atados, bucle de entrenamiento) con un modelo que se ejecuta en CPU en segundos.
- Pruebas de infraestructura y pipelines: validar scripts de descarga, carga de checkpoints personalizados y generacion en entornos CUDA/MPS/CPU antes de escalar a modelos mayores.
- Generacion de texto de completado en demos: ejemplos de continuacion de prompts con `generate.py` para mostrar el comportamiento de un modelo base sin alineacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las mediciones finales de BPB y perdida son evaluaciones de modelado de lenguaje, no precision en resolucion de tareas, y remite a `results.json` para el registro original, sin incluir cifras en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32 (8M parametros x 4 bytes ≈ 32 MB de pesos, mas activaciones y cache KV para 1.024 tokens), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con CUDA (RTX 3090, RTX 4090, A100, H100) funciona; tambien Apple Silicon via MPS y CPU pura.
- Cabe en GPU consumer: si, en todas las gamas actuales e incluso en GPUs integradas.
- Opciones de despliegue: el repositorio incluye `model.py` y `generate.py` con loader propio en PyTorch; no es compatible con `AutoModel` de Transformers ni se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos por token en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Licencia | Formato |
|---|---|---|---|---|---|
| nanogpt-ladder-v3-chat-heavy-8m-100tpp-seed-1337 | 8,0 M | 1.024 | 801,2 M (100 TPP) | no disponible | PyTorch nativo |
| Otros puntos de NanoGPT Ladder v3 | no disponible en esta ficha | no disponible | no disponible | no disponible | PyTorch nativo |
| GPT-2 small (referencia de arquitectura) | 124 M | 1.024 | no disponible | MIT (segun publicacion original) | safetensors/PyTorch |
| Modelos tiny de investigacion (p. ej. Pythia-70M) | 70 M | 2.048 | ~300 B | Apache 2.0 (segun publicacion) | safetensors |

La comparacion directa con GPT-2 small o Pythia-70M no es equivalente en escala: este checkpoint es aproximadamente un orden de magnitud menor en parametros y esta disenado como unidad experimental dentro de una escalera, no como modelo de uso general. No se dispone de datos de rendimiento comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base sin alineacion: no sigue instrucciones, no mantiene formato conversacional fiable y puede producir continuaciones incoherentes o repetitivas.
- Riesgo alto de alucinacion y de generar contenido factualmente incorrecto; no debe usarse para responder preguntas ni para tareas de recuperacion de hechos.
- Contexto muy limitado (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Capacidad linguistica restringida por el tamano (8M parametros) y por el tokenizer GPT-2; el rendimiento fuera del ingles no esta documentado y previsiblemente es bajo.
- Sesgos: al entrenarse sobre una mezcla de Dolma3 Dolmino con 80% de datos chat-heavy, hereda los sesgos de esas fuentes; no se documentan evaluaciones de sesgo ni de seguridad.
- Licencia no disponible: no se puede confirmar el uso comercial; debe consultarse el repositorio antes de cualquier despliegue productivo.
- Sin soporte en ecosistemas estandar (Transformers, vLLM, llama.cpp): requiere el loader propio incluido en el repositorio.
- Los pesos son float32 originales y no se ofrecen cuantizaciones oficiales; cualquier cuantizacion seria una conversion externa no validada.
- No incluye estado del optimizador: no permite reanudar el preentrenamiento original, solo inferencia o fine-tuning desde los pesos.
- Las metricas publicadas (BPB/perdida) no miden capacidad de resolver tareas; no deben interpretarse como precision en benchmarks.

## Enlaces

- Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-chat-heavy-8m-100tpp-seed-1337
- Coleccion de modelos completados NanoGPT Ladder v3: https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset Dolma3 Dolmino pool: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
