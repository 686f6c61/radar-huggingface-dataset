# davidheineman/nanogpt-ladder-v3-web-heavy-8m-30tpp-seed-1337

## Resumen

NanoGPT Ladder v3 web-heavy 8M 30TPP es un modelo de lenguaje base de pequeno tamano entrenado desde cero por David Heineman como parte de la serie NanoGPT Ladder v3, un conjunto de experimentos de preentrenamiento reproducible con arquitectura GPT tipo nanoGPT. El modelo tiene 8.011.776 parametros y se ha entrenado sobre 240.353.280 tokens de prediccion (30 tokens por parametro, TPP), con 7.335 pasos de optimizador y semilla 1337. Es un punto final de preentrenamiento puro: los pesos preceden a cualquier fase de condicionamiento tiny-rl, SFT o RL, por lo que debe usarse con prompts de texto plano.

La relevancia de este modelo no esta en su capacidad de proposito general, sino en su valor como artefacto de investigacion sobre leyes de escalado y mezclas de datos. La mezcla web-heavy sigue la receta congelada del pool Dolma3 Dolmino de AllenAI, donde las mezclas "heavy" asignan el 80% al dominio nombrado. El repositorio incluye `metadata.json` con revisiones exactas de las fuentes, pesos de mezcla y SHA256, asi como `results.json` con el registro de finalizacion y las evaluaciones finales, lo que facilita la reproducibilidad.

Arquitectonicamente es un transformer decoder-only de 8 capas, anchura 128, 4 cabezas de atencion, embeddings atados, RoPE, tokenizador GPT-2, contexto de 1.024 tokens y vocabulario rellenado de 50.304 entradas. Los pesos originales estan en float32 y el checkpoint usa un cargador propio, no `transformers.AutoModel`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (nanoGPT), 8 capas, anchura 128, 4 cabezas, embeddings atados, RoPE |
| Parametros totales | 8.011.776 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`, float32), cargador propio (`model.py`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con 8 capas, dimension de modelo 128 y 4 cabezas de atencion (32 dimensiones por cabeza). Usa embeddings de entrada y salida atados, codificacion posicional rotatoria (RoPE), tokenizador GPT-2 (via `tiktoken`) y un vocabulario rellenado de 50.304 entradas. El contexto maximo es de 1.024 tokens. El checkpoint `model.pt` contiene las claves `model`, `config`, `identity` y `run`, y conserva los pesos atados de embedding y salida; no incluye estado del optimizador, por lo que sirve para inferencia y fine-tuning posterior pero no para reanudar el entrenamiento de forma exacta.

El entrenamiento consistio en 7.335 pasos de optimizador sobre 240.353.280 tokens de prediccion, equivalentes a 30 tokens por parametro, con semilla 1337. La mezcla de datos sigue la receta congelada del pool `allenai/dolma3_dolmino_pool`; en la variante web-heavy el 80% de la mezcla se asigna al dominio web. No se documenta en la informacion disponible el uso de RLHF, DPO ni SFT: el autor indica explicitamente que estos pesos preceden a esas fases. Tampoco se detallan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva basica con prompts de texto plano.
- Modelado de lenguaje y evaluacion de perplejidad/BPB (las metricas finales son de lenguaje, no de resolucion de tareas).
- Decodificacion greedy disponible con `temperature=0`; muestreo con temperatura configurable.
- Ejecucion en CUDA, Apple MPS o CPU mediante `device=auto`.
- Punto de partida para fine-tuning posterior (el checkpoint es compatible con entrenamiento adicional).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles; el tokenizador es GPT-2 y no se especifica composicion linguistica del corpus.

## Casos de uso

- Investigacion sobre leyes de escalado: el modelo forma parte de una escalera de presupuestos de tokens (TPP) entrenados de forma independiente, lo que permite comparar curvas de perdida frente a tokens por parametro con condiciones controladas.
- Estudio de mezclas de datos: al seguir la receta Dolma3 Dolmino con una mezcla web-heavy al 80%, sirve para medir el efecto del dominio web en modelos pequenos frente a otras mezclas de la misma familia.
- Reproducibilidad experimental: `metadata.json` registra revisiones de fuentes, pesos de mezcla y SHA256, lo que permite replicar el entrenamiento y auditar el dataset utilizado.
- Pruebas de infraestructura y pipelines: con 8M de parametros y 0,0 GB de repositorio, es util para validar flujos de descarga, carga de checkpoints personalizados y generacion en CPU/MPS antes de escalar a modelos mayores.
- Educacion y docencia: su tamano reducido y su cargador explicito (`model.py`, `generate.py`) permiten estudiar el ciclo completo de un transformer GPT, desde la tokenizacion hasta la generacion, sin infraestructura especializada.
- Baseline para fine-tuning: al ser un checkpoint de preentrenamiento sin SFT, puede usarse como punto de partida controlado en experimentos de ajuste supervisado o RL a pequena escala (la serie menciona tiny-rl como fase posterior).
- Evaluacion de tokenizadores y vocabularios: el vocabulario rellenado de 50.304 y el uso de GPT-2 permiten estudiar el impacto del padding de vocabulario en modelos de muy baja capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que `results.json` contiene el registro de finalizacion y las evaluaciones finales, y que las mediciones finales de BPB/loss son evaluaciones de modelado de lenguaje, no precision en resolucion de tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (8M de parametros, aproximadamente 32 MB de pesos, mas activaciones y cache KV para 1.024 tokens); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con CUDA (por ejemplo, RTX 4090, A100, H100) funciona sin problema; tambien Apple MPS y CPU.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna e incluso en GPUs integradas o CPU.
- Opciones de despliegue: el repositorio incluye `generate.py` y `model.py` con cargador propio; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y el uso de `transformers.AutoModel` no esta soportado segun el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia muy baja, pero no se aportan cifras.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoria (GPT de muy pequeno tamano entrenados sobre Dolma u otros corpus). La comparacion mas directa posible seria con otros puntos de la propia coleccion NanoGPT Ladder v3 (distintos presupuestos TPP, mezclas y semillas), pero no se aportan sus metricas en esta ficha.

## Limitaciones y advertencias

- Capacidad muy limitada: con 8M de parametros y 240M tokens de entrenamiento, el modelo no es adecuado para tareas de razonamiento, codigo o conocimiento factual; su uso previsto es la investigacion.
- Es un modelo base sin alineacion: no ha pasado por SFT, RLHF ni DPO, por lo que puede generar texto incoherente, repetitivo o con contenido problematico.
- Riesgo de alucinacion elevado: no dispone de conocimiento factual fiable ni de mecanismos de verificacion.
- Contexto corto: 1.024 tokens, insuficiente para conversaciones multi-turno largas o documentos extensos.
- Idiomas: no se documenta la composicion linguistica; el tokenizador GPT-2 esta optimizado para ingles, por lo que el rendimiento en castellano sera previsiblemente pobre.
- Licencia no disponible: no se especifican terminos de uso comercial; debe consultarse con el autor antes de cualquier uso en produccion.
- Cargador no estandar: requiere el `model.py` incluido; no funciona con `transformers.AutoModel`, lo que complica la integracion en stacks estandar.
- Sin estado de optimizador: el checkpoint no permite reanudar el entrenamiento original de forma exacta.
- Las metricas publicadas (BPB/loss) no son indicativas de precision en tareas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-web-heavy-8m-30tpp-seed-1337
- Coleccion NanoGPT Ladder v3 (modelos preentrenados completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de referencia: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
