# davidheineman/nanogpt-ladder-v3-base-8m-10tpp-seed-1337

## Resumen
NanoGPT Ladder v3 base 8M 10 TPP es un modelo de lenguaje de tipo base (sin ajuste fino posterior) desarrollado por davidheineman dentro de la serie NanoGPT Ladder v3. Se trata de un transformer decoder-only de 8.011.776 parametros entrenado desde cero sobre el pool de datos Dolma3 Dolmino, con un presupuesto de 80.117.760 tokens de prediccion (10 tokens por parametro, TPP) repartidos en 2.445 pasos de optimizacion. Su relevancia no reside en capacidades de produccion, sino en servir como punto de referencia reproducible en estudios de escalado y recetas de preentrenamiento de modelos pequenos.

La arquitectura es deliberadamente minimalista: 8 capas, anchura 128, 4 cabezas de atencion, embeddings atados, RoPE, tokenizador GPT-2 y una ventana de contexto de 1.024 tokens. Los pesos son float32 originales y el checkpoint incluye el codigo de carga nativo (`model.py`, `generate.py`), por lo que no es compatible con `AutoModel` de Transformers.

Cada presupuesto de tokens de la serie corresponde a una ejecucion entrenada de forma independiente, con semilla 1337 en este caso. El modelo precede a cualquier fase de tiny-rl, SFT o RL, de modo que solo debe usarse con prompts de texto plano y sin esperar comportamiento de asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT), 8 capas, anchura 128, 4 cabezas de atencion, embeddings atados, RoPE |
| Parametros totales | 8.011.776 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch nativo (`model.pt`) con `model`, `config`, `identity` y `run`; no safetensors ni GGUF |

## Arquitectura y entrenamiento
El modelo sigue la implementacion clasica de NanoGPT: un transformer decoder-only con atencion multi-cabeza estandar, normalizacion y capas feed-forward convencionales, sin mecanismos de atencion lineal ni mezcla de expertos. Usa embeddings atados entre entrada y salida, codificacion posicional rotatoria (RoPE), tokenizador GPT-2 (tiktoken) y vocabulario rellenado hasta 50.304 entradas.

El preentrenamiento se realizo sobre el pool Dolma3 Dolmino siguiendo la receta de mezcla congelada del proyecto; en las mezclas "heavy" el 80% de los datos se asigna al dominio nombrado. El run completo consta de 2.445 pasos de optimizacion y 80.117.760 tokens de prediccion. El repositorio incluye `metadata.json` con las revisiones exactas de las fuentes, los pesos de mezcla y hashes SHA256, asi como `results.json` con el registro de finalizacion y las evaluaciones finales. No se documenta RLHF, DPO ni SFT; las metricas finales son BPB/perdida de lenguaje, no precision en tareas.

## Capacidades
- Generacion de texto autoregresiva basica a partir de prompts de texto plano.
- Modelado de lenguaje y continuacion de secuencias dentro de una ventana de 1.024 tokens.
- Punto de partida para ajuste fino supervisado posterior (el checkpoint soporta entrenamiento adicional, aunque no incluye estado del optimizador).
- Inferencia en CUDA, Apple MPS o CPU mediante seleccion automatica de dispositivo (`device=auto`).
- Decodificacion greedy (`temperature=0`) o con muestreo por temperatura.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.
- No se documentan capacidades multilingues especificas ni evaluaciones por idioma.

## Casos de uso
- Estudio de leyes de escalado: al ser una ejecucion independiente con presupuesto fijo de 10 TPP y semilla conocida, permite comparar perdida frente a otros puntos de la escalera NanoGPT Ladder v3 con la misma receta.
- Reproducibilidad de recetas de preentrenamiento: `metadata.json` registra revisiones de fuentes, pesos de mezcla y SHA256, lo que facilita replicar exactamente el corpus y verificar la integridad de los datos.
- Ajuste fino academico de bajo coste: sus 8M de parametros permiten experimentar con SFT o RL en una unica GPU consumer, partiendo de un checkpoint base ya entrenado.
- Docencia y divulgacion: el par `model.py`/`generate.py` y la carga nativa en PyTorch hacen del modelo un ejemplo autocontenido para explicar el pipeline completo de un transformer GPT.
- Pruebas de infraestructura de inferencia: sirve para validar scripts de generacion, seleccion de dispositivo (CUDA/MPS/CPU) y decodificacion antes de escalar a modelos mayores.
- Investigacion sobre mezclas de datos: las variantes "heavy" con 80% de asignacion a un dominio permiten aislar el efecto de la composicion del corpus en modelos pequenos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las mediciones finales de BPB y perdida son evaluaciones de modelado de lenguaje, no precision en resolucion de tareas, y no se proporcionan valores numericos concretos en la informacion facilitada.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en float32 (8M de parametros, aproximadamente 32 MB de pesos mas activaciones y cache KV para 1.024 tokens); no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU con CUDA es suficiente; tambien funciona en Apple Silicon via MPS y en CPU.
- Cabe holgadamente en GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: cargador nativo en PyTorch incluido en el repositorio (`model.py`, `generate.py`) y descarga via `huggingface_hub`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no usar la arquitectura de Transformers no es compatible con `AutoModel`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NanoGPT Ladder v3 base 8M 10 TPP (seed 1337) | 8,0 M | 1.024 | no disponible | Hugging Face, checkpoint PyTorch nativo |
| Otros puntos de NanoGPT Ladder v3 | no disponible | no disponible | no disponible | Coleccion publica en Hugging Face del mismo autor |
| GPT-2 small | 124 M | 1.024 | MIT (pesos OpenAI) | Amplia, compatible con Transformers |
| Modelos comparables de 8M | no disponible | no disponible | no disponible | no disponible |

La comparacion con GPT-2 small es solo orientativa por diferencia de escala (124M frente a 8M de parametros) y porque comparte tokenizador y contexto; no se dispone de datos de rendimiento comparables entre ambos en la informacion facilitada.

## Limitaciones y advertencias
- Modelo base sin SFT ni RL: no sigue instrucciones ni mantiene formato de asistente; solo continua texto.
- Ventana de contexto muy reducida (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Capacidad limitada por su tamano (8M de parametros): alta probabilidad de incoherencias, repeticiones y alucinaciones factuales.
- Idiomas soportados no documentados; el tokenizador GPT-2 esta sesgado hacia ingles.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribucion, por lo que conviene tratar los pesos como no aptos para produccion hasta verificar la licencia.
- No incluye estado del optimizador, lo que limita reanudar el preentrenamiento de forma exacta.
- Requiere cargador propio: no es compatible con `AutoModel` de Transformers ni con herramientas estandar de cuantizacion.
- Las metricas publicadas son BPB/perdida, no precision en tareas; no deben interpretarse como rendimiento funcional.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-base-8m-10tpp-seed-1337
- Coleccion de modelos completados NanoGPT Ladder v3: https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
