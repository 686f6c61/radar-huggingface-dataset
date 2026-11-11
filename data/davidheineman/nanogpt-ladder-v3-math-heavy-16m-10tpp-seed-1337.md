# davidheineman/nanogpt-ladder-v3-math-heavy-16m-10tpp-seed-1337

## Resumen

NanoGPT Ladder v3 math-heavy 16M 10TPP es un modelo de lenguaje base de pequeno tamano (15,85 millones de parametros) desarrollado por davidheineman como parte de una serie de experimentos de preentrenamiento reproducible denominada NanoGPT Ladder v3. Se trata de un transformer decoder-only al estilo GPT-2, entrenado desde cero sobre una mezcla de datos con fuerte peso del dominio matematico (80% del corpus), siguiendo la receta del pool Dolma3 Dolmino de Ai2. El modelo no ha pasado por SFT, RLHF ni condicionamiento de ningun tipo: es un checkpoint puro de preentrenamiento que solo debe usarse con prompts de texto plano.

El interes de este modelo es fundamentalmente metodologico y de investigacion: forma parte de una escalera (ladder) de ejecuciones independientes por presupuesto de tokens, lo que permite estudiar el efecto del tamano del modelo y del numero de tokens por parametro (TPP) en el rendimiento. En esta variante concreta se han procesado 158,5 millones de tokens de prediccion (10 TPP) en 4.837 pasos de optimizador con semilla 1337.

Por su tamano (16M) y su contexto de 1.024 tokens, no es un modelo apto para produccion ni para tareas complejas, sino una pieza de laboratorio para analizar dinamicas de preentrenamiento, mezclas de datos y escalado a pequena escala. La licencia no esta declarada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo GPT-2, NanoGPT) |
| Parametros totales | 15.851.520 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`), no safetensors ni GGUF |

Detalles adicionales de configuracion: 14 capas, ancho 192, 6 cabezas de atencion, embeddings atados (tied embeddings), RoPE, tokenizador GPT-2 (tiktoken) con vocabulario rellenado de 50.304 entradas.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con 14 capas, dimension oculta de 192 y 6 cabezas de atencion, con embeddings de entrada y salida atados y codificacion posicional rotatoria (RoPE). Usa el tokenizador GPT-2 mediante `tiktoken` y un vocabulario rellenado hasta 50.304 entradas. El checkpoint se distribuye en formato PyTorch nativo (`model.pt`) con un cargador propio (`model.py`), no compatible con `AutoModel` de Transformers.

El preentrenamiento se realizo sobre el pool `allenai/dolma3_dolmino_pool` con una mezcla "math-heavy" que asigna el 80% de los datos al dominio matematico, siguiendo la receta congelada del autor. Se procesaron 158.498.816 tokens de prediccion en 4.837 pasos de optimizador con semilla 1337, lo que corresponde a 10 tokens por parametro (TPP). El repositorio incluye `metadata.json` con revisiones exactas de las fuentes, pesos de mezcla y hashes SHA256, y `results.json` con el registro de finalizacion y las evaluaciones finales. No se aplico SFT, RLHF ni DPO: los pesos son el punto final del preentrenamiento y preceden a cualquier etapa de condicionamiento.

## Capacidades

- Generacion de texto autoregresiva basica a partir de prompts de texto plano.
- Modelado de lenguaje: el modelo esta optimizado para predecir el siguiente token, no para seguir instrucciones.
- Razonamiento matematico incipiente: la mezcla de datos con 80% de contenido matematico pretende favorecer patrones de ese dominio, aunque a 16M de parametros y 10 TPP las capacidades son muy limitadas.
- Decodificacion configurable: muestreo con temperatura o decodificacion greedy (`temperature=0`).
- Ejecucion en CUDA, Apple MPS o CPU mediante `device=auto`.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- No es un modelo instruct; no se debe esperar adherencia a instrucciones ni formato conversacional.

## Casos de uso

- Investigacion sobre escalado a pequena escala: sirve como punto de la escalera NanoGPT Ladder v3 para estudiar como varia la perdida (BPB) con el presupuesto de tokens y el tamano del modelo.
- Estudio de mezclas de datos: permite comparar el efecto de una mezcla math-heavy frente a otras mezclas del mismo pool Dolma3 Dolmino sobre el rendimiento en modelado de lenguaje.
- Reproducibilidad de preentrenamiento: el `metadata.json` con revisiones y hashes SHA256 facilita replicar exactamente la ejecucion y auditar la procedencia de los datos.
- Fine-tuning educativo: al incluir el checkpoint completo sin estado de optimizador, es util para experimentos docentes de ajuste fino sobre un modelo diminuto que cabe en cualquier GPU consumer o incluso en CPU.
- Pruebas de infraestructura y pipelines: su tamano (0,1 GB) permite validar flujos de descarga, carga de checkpoints personalizados y generacion sin coste de computo significativo.
- Analisis de tokenizadores y vocabulario: con vocabulario GPT-2 rellenado a 50.304, sirve para experimentos sobre el impacto del padding de vocabulario en modelos pequenos.
- Baseline en ablaciones: como modelo base de referencia para comparar frente a variantes con mas TPP o distintos dominios dentro de la misma coleccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que `results.json` contiene evaluaciones finales de perdida (BPB/loss), pero se trata de metricas de modelado de lenguaje, no de precision en tareas, y sus valores no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (15,85M de parametros, ~63 MB de pesos mas activaciones y cache KV para 1.024 tokens), por lo que cabe holgadamente en cualquier GPU.
- GPU recomendadas: innecesarias; funciona en CPU, Apple MPS y cualquier GPU CUDA moderna (RTX 3060, RTX 4090, A100, H100).
- Cabe en GPU consumer: si, en todas, incluidas integradas y placas de gama baja.
- Opciones de despliegue: el modelo usa un cargador propio (`model.py` + `generate.py`) y no es compatible directamente con vLLM, TGI, llama.cpp ni Ollama, ya que no se distribuye en formato GGUF ni como modelo de Transformers. El script incluido soporta CUDA, MPS y CPU.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano, la generacion en GPU seria del orden de miles de tokens por segundo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Formato |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 math-heavy 16M 10TPP | 15,85M | 1.024 | 158,5M tokens (80% matematicas) | no disponible | PyTorch nativo |
| Otras variantes de NanoGPT Ladder v3 | no disponible | 1.024 (segun la variante) | presupuestos TPP y dominios distintos | no disponible | PyTorch nativo |
| GPT-2 small (referencia arquitectonica) | 124M | 1.024 | WebText (~40 GB) | MIT (segun publicacion original) | safetensors/Transformers |
| Modelos instruct pequenos (p. ej. variantes <1B) | variable | variable | SFT/RLHF | variable | variable |

La comparacion directa con modelos de la misma categoria solo es posible dentro de la propia coleccion NanoGPT Ladder v3, cuyas variantes no estan detalladas en la informacion disponible. Frente a GPT-2 small, este modelo es aproximadamente 8 veces menor en parametros y no ha recibido ajuste por instrucciones.

## Limitaciones y advertencias

- Modelo base sin SFT ni RLHF: no sigue instrucciones, no mantiene formato conversacional y puede producir texto incoherente o repetitivo.
- Riesgo elevado de alucinacion y de generacion de contenido sin sentido, especialmente fuera de dominios representados en los datos.
- Contexto muy corto (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno.
- Idiomas soportados no declarados; el tokenizador GPT-2 esta orientado principalmente al ingles, por lo que el rendimiento en castellano sera previsiblemente pobre.
- Capacidad muy limitada por el tamano (15,85M de parametros): no es adecuado para tareas de razonamiento, codigo o matematicas de nivel practico pese al sesgo math-heavy del corpus.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- No compatible con ecosistemas estandar (Transformers, vLLM, llama.cpp, Ollama): requiere el cargador propio del repositorio.
- El checkpoint no incluye estado de optimizador, lo que limita reanudar el preentrenamiento exactamente desde este punto.
- Las metricas de `results.json` son de perdida (BPB/loss), no de precision en tareas; no deben interpretarse como rendimiento funcional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-math-heavy-16m-10tpp-seed-1337
- Coleccion NanoGPT Ladder v3 (modelos preentrenados completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- Repositorio NanoGPT (referencia de arquitectura y entrenamiento): https://github.com/karpathy/nanoGPT
