# CharlieChen/loop-grow-d12

## Resumen
loop-grow-d12 es un modelo de lenguaje base (pretrained, sin ajuste por instrucciones) publicado por el usuario CharlieChen en HuggingFace, asociado al artículo "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents". Se trata del checkpoint final original utilizado en la escalera de escalado (scaling ladder) sobre el corpus FineWeb, y su interés principal es de investigación: estudia cómo la profundidad recursiva (looping), el crecimiento del modelo y los operadores de frontera afectan a los exponentes de escalado.

Técnicamente es un transformer tipo GPT con tokenizador GPT-2 y 494.272.512 parámetros almacenados en FP32 (1,977 GB), anchura 1536 y 12 cabezas de atención, con una longitud de contexto de 2048 tokens. Su particularidad es el modo de profundidad `loop`: la coordenada de profundidad d12 es la coordenada de escalado de la escalera y no tiene por qué coincidir con el número de bloques Transformer realmente ejecutados, con 4 repeticiones del núcleo configuradas y 4 usadas en la evaluación final.

No es un modelo orientado a producto: no tiene instruction tuning, no incluye estado del optimizador para reanudar el entrenamiento y no es un checkpoint `AutoModel` de Transformers, sino un artefacto PyTorch que requiere el código propio del artículo para reconstruirse y evaluarse. Su relevancia actual es por tanto académica: sirve como referencia reproducible de una arquitectura con recursión de pesos y como punto de partida para experimentos de escalado y ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder tipo GPT con profundidad recursiva (`loop`); anchura 1536, 12 cabezas de atencion |
| Parametros totales | 494.272.512 (~0,49 mil millones) almacenados en FP32 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se publica checkpoint FP32 en `.pt`) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `final.pt` (no safetensors, no GGUF); no es un checkpoint `AutoModel` de Transformers |
| Tokenizador | GPT-2 (`tiktoken.get_encoding("gpt2")`) |
| Vocabulario | 50.257 tokens, ampliado a 50.304 filas del modelo |
| Repeticiones del nucleo | 4 configuradas; 4 en la evaluacion final |
| Tamano del repositorio | 2,0 GB |
| Corpus de entrenamiento | HuggingFaceFW/fineweb |

## Arquitectura y entrenamiento
El modelo es un transformer decoder autorregresivo con recursión de profundidad: en lugar de apilar un número fijo de bloques distintos, el núcleo se ejecuta repetidamente (modo `loop`, 4 repeticiones configuradas). La "coordenada de profundidad" d12 es la coordenada de escalado empleada en la escalera experimental del artículo, y el autor advierte explícitamente que no tiene por qué equivaler al número de bloques Transformer ejecutados. La anchura es de 1536 con 12 cabezas de atención, el vocabulario GPT-2 de 50.257 tokens se rellena hasta 50.304 filas y el contexto es de 2048 tokens.

El entrenamiento se realizó sobre FineWeb y el checkpoint se publica como artefacto final de la escalera de escalado, sin estado del optimizador, por lo que no permite reanudar el entrenamiento. No se documentan en la información disponible el número total de tokens vistos, la composición exacta del dataset, ni si hubo fases de RLHF o DPO; al tratarse de un modelo base sin instruction tuning, no hay indicios de alineación por preferencias. La evaluación del artículo se ejecutó en GPUs H100 con FlashAttention-3 y autocast en bfloat16. La validación de preentrenamiento reportada es de 2,918357 nats/token (NLL sobre el corpus de preentrenamiento, distinta de la NLL de respuestas del conjunto CORE).

## Capacidades
- Generacion de texto autorregresiva en ingles: al ser un modelo base, su modo natural es la continuacion de texto, no el seguimiento de instrucciones.
- Modelado de lenguaje y puntuacion de secuencias: permite calcular verosimilitudes y NLL sobre texto en ingles.
- Extraccion de representaciones internas: al ser un transformer estandar, sus estados ocultos pueden reutilizarse como features para tareas posteriores.
- Punto de partida para ajuste fino supervisado en tareas de texto en ingles (clasificacion, extraccion, resumen extractivo).
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso explicito.
- Sin capacidades multimodales: no hay vision, audio ni modo "thinking" documentados.
- Multilingue: no; la model card declara unicamente ingles (`en`).

## Casos de uso
- Ajuste fino para clasificacion de texto en ingles: con 494 millones de parametros y 2048 tokens de contexto, se puede entrenar sobre corpus etiquetados de noticias, resenas o tickets sin necesidad de GPUs de gran memoria.
- Reproduccion de experimentos de escalado: el checkpoint es el artefacto exacto de la escalera de profundidad del articulo, por lo que sirve para verificar exponentes de escalado y comparar variantes de recursion y crecimiento.
- Investigacion sobre transformers recursivos: permite estudiar el efecto de las repeticiones del nucleo sobre calidad y coste, ya que la configuracion de profundidad recursiva está documentada y es reproducible con el código del artículo.
- Base para modelos de dominio especializado: ajuste fino sobre dominios concretos (legal, medico divulgativo, documentacion tecnica) partiendo de pesos preentrenados en FineWeb.
- Generacion aumentada por recuperacion (RAG) tras ajuste: usar el modelo para componer respuestas a partir de fragmentos recuperados, siempre que se ajuste previamente porque no sigue instrucciones de serie.
- Autocompletado y generacion de texto corto en herramientas internas: con ~2 GB de pesos FP32 cabe en GPUs de gama media, lo que permite desplegarlo en entornos de prototipado o en local.
- Destilacion y experimentos de eficiencia: su tamano moderado y su naturaleza de checkpoint PyTorch lo hacen util como alumno o profesor en estudios de compresion, pruning y cuantizacion.
- Evaluacion comparativa de tokenizadores y corpus: al emplear GPT-2 `tiktoken` sobre FineWeb, sirve como linea base controlada frente a modelos con otros tokenizadores.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la NLL de validacion de preentrenamiento y menciona que la evaluacion CORE completa consta de 22 tareas con semillas 0/1/2, ejecutable con el código del articulo. No se aportan puntuaciones de MMLU, HumanEval, GSM8K ni de la suite CORE completa.

| Metrica | Valor | Notas |
|---|---|---|
| NLL de validacion (preentrenamiento) | 2,918357 nats/token | Medida sobre el corpus de preentrenamiento (FineWeb) |
| NLL de respuestas CORE | no disponible | El smoke test del articulo no es un resultado completo |
| MMLU / HumanEval / GSM8K | no disponible | No publicados en la informacion disponible |

## Requisitos de hardware
- VRAM para los pesos en FP32: aproximadamente 1,98 GB (494.272.512 parametros x 4 bytes).
- VRAM total estimada para inferencia: en torno a 3-4 GB sumando activaciones y cache KV con contexto de 2048; la cifra exacta depende del numero de bloques realmente ejecutados, que no se documenta.
- Cabe en GPU de consumo: si, en tarjetas con 6-8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090).
- GPU de referencia del articulo: H100, con FlashAttention-3 y autocast en bfloat16.
- Opciones de despliegue: el artefacto solo se reconstruye y ejecuta con el codigo del articulo (`cue-engineering/loop`, script `eval.py`). No es un checkpoint `AutoModel` de Transformers, por lo que no es compatible directamente con vLLM, TGI, llama.cpp u Ollama sin conversion previa; no se publican pesos GGUF.
- Almacenamiento: repositorio de 2,0 GB (`final.pt`, `result.json`, `SHA256SUMS`).
- Latencia y throughput: no disponibles.
- Nota sobre evaluacion: el autor recomienda `--max-per-task 10 --seeds 0 1 2` para un smoke test acotado; los resultados de ese smoke test no equivalen a los del conjunto completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Formato |
|---|---|---|---|---|---|
| loop-grow-d12 | 494 M | 2.048 | Base, transformer recursivo | no disponible | PyTorch `.pt` |
| Pythia-410M | 410 M | 2.048 | Base, transformer denso | Apache 2.0 | safetensors / PyTorch |
| GPT-2 large | 774 M | 1.024 | Base, transformer denso | Modified MIT | safetensors / PyTorch |
| SmolLM-360M | 360 M | 2.048 | Base (con variantes instruct) | Apache 2.0 | safetensors, GGUF |

El rendimiento de loop-grow-d12 no puede compararse numericamente porque no se publican resultados de benchmarks. Las cifras de los modelos de referencia proceden de su documentacion publica y se incluyen solo como contexto de categoria; el modelo de este analisis se distingue por su arquitectura recursiva, su contexto de 2048 tokens y su caracter de artefacto de investigacion ligado a un articulo, no por su disponibilidad para produccion.

## Limitaciones y advertencias
- No es un modelo instruido: no sigue ordenes ni mantiene formato conversacional de forma fiable; requiere ajuste fino para cualquier tarea de instrucciones.
- Riesgo de alucinacion: al ser un modelo base entrenado sobre FineWeb, puede generar afirmaciones plausibles pero falsas, especialmente sin contexto de recuperacion.
- Idiomas: solo ingles declarado; no hay evidencia de competencia multilingue.
- Ventana de contexto limitada a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; conviene contactar con el autor antes de cualquier despliegue comercial.
- Sin estado del optimizador: no es posible reanudar el entrenamiento original desde este checkpoint.
- Dependencia de codigo externo: la reconstruccion del modelo `TransformerGPT` requiere el repositorio del articulo; no funciona con `AutoModel` de Transformers ni con runners estandar.
- Sesgos del corpus: FineWeb es un rastreo web en ingles con los sesgos y la distribucion de calidad habituales de este tipo de datos; no se documentan filtros ni mitigaciones adicionales.
- Sin datos de benchmarks completos: no hay evidencia publicada de rendimiento en MMLU, CORE completo u otras suites, por lo que su calidad relativa no puede verificarse con cifras.
- Metadatos a revisar: las fechas de creacion y actualizacion registradas (2026-09-16) son inusuales y el modelo acumula 0 descargas y 0 likes, lo que sugiere muy poca validacion por parte de la comunidad.

## Enlaces
- HuggingFace: https://huggingface.co/CharlieChen/loop-grow-d12
- Repositorio de codigo del articulo: https://github.com/cue-engineering/loop
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Articulo citado: "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents" (sin enlace disponible)
- La busqueda web no devolvio enlaces tecnicos relevantes sobre este modelo; los resultados obtenidos correspondian a paginas de soporte de electrodomesticos y no guardan relacion con el modelo.
