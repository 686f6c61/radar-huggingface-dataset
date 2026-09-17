# CharlieChen/loop-vanilla-d6

## Resumen

loop-vanilla-d6 es un modelo de lenguaje base de 119.734.272 parámetros publicado por el usuario CharlieChen como artefacto de reproducibilidad del artículo "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents". Corresponde al punto identificado con la coordenada de profundidad d6 dentro de la escalera de escalado entrenada sobre FineWeb, y conserva el checkpoint final original tal cual se generó durante el entrenamiento.

Técnicamente es un transformer decoder-only con tokenizador GPT-2 (50.257 tokens de vocabulario, ampliados a 50.304 filas en el modelo), anchura de 768, 6 cabezas de atención y una ventana de contexto de 2.048 tokens. Aunque el repositorio está etiquetado como "looped-transformer", este checkpoint concreto usa modo de profundidad `none` y una única repetición configurada y evaluada, por lo que en la práctica se comporta como un transformer estándar sin bucles efectivos; la coordenada d6 pertenece a la escalera de escalado del paper y no equivale al número de bloques Transformer ejecutados.

Su relevancia es estrictamente académica: es una pieza de referencia para estudiar exponentes de escalado y para reproducir la evaluación CORE del artículo, no un modelo orientado a producto. No tiene ajuste por instrucciones, no incluye estado del optimizador para reanudar el entrenamiento y no se distribuye en formatos de inferencia habituales (safetensors, GGUF).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiquetado como looped-transformer; este checkpoint usa modo de profundidad `none` con 1 repeticion, sin bucles efectivos) |
| Parametros totales | 119.734.272 (almacenados en FP32, 0,479 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos en FP32) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`final.pt`), no es un checkpoint `AutoModel` de Transformers |
| Anchura (hidden size) | 768 |
| Cabezas de atencion | 6 |
| Vocabulario | 50.257 tokens (tokenizador GPT-2, `tiktoken.get_encoding("gpt2")`), ampliado a 50.304 filas del modelo |
| Repeticiones configuradas / evaluadas | 1 / 1 |
| NLL de validacion en preentrenamiento | 3,560862 nats/token |
| Archivos del repositorio | `final.pt`, `result.json`, `SHA256SUMS` |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de aproximadamente 120 millones de parametros con anchura 768 y 6 cabezas de atencion. El paper del que procede estudia como influyen el crecimiento del modelo, la recursion (repeticion de bloques) y los operadores de frontera en los exponentes de escalado; la coordenada de profundidad d6 es la coordenada de escalado de la escalera y no tiene por que coincidir con el numero de bloques ejecutados. En este checkpoint concreto, el modo de profundidad es `none` y las repeticiones configuradas y evaluadas son 1, de modo que la recursion no se materializa en el grafo de inferencia.

El entrenamiento se hizo sobre el corpus FineWeb con el tokenizador GPT-2. Segun la documentacion del paper, el entorno de referencia usa GPUs H100, FlashAttention-3 y autocast en bfloat16. No se documenta en la informacion disponible el numero total de tokens de entrenamiento, la composicion detallada del dataset ni si hubo fases de RLHF, DPO o ajuste por instrucciones; el propio autor indica que es un modelo base preentrenado sin instruction tuning. El artefacto conserva los pesos aprendidos y los argumentos de entrenamiento, pero no el estado del optimizador, por lo que no permite reanudar el entrenamiento. La unica metrica de calidad publicada es la NLL de validacion sobre el propio corpus de preentrenamiento (3,560862 nats/token), que el autor distingue explicitamente de la NLL de respuestas del benchmark CORE.

## Capacidades

- Generacion de texto en ingles: modelo base autoregresivo, capaz de continuar texto y producir completados coherentes a nivel local con una ventana de 2.048 tokens.
- No dispone de ajuste por instrucciones (instruction tuning), por lo que no sigue ordenes ni mantiene formatos de conversacion de forma fiable.
- Razonamiento y matematicas: no se han publicado resultados que acrediten capacidades especificas en estas areas.
- Codigo: no se han publicado resultados especificos (por ejemplo HumanEval) ni indicios de entrenamiento orientado a codigo.
- Tool calling / function calling: no soportado de forma nativa ni documentado.
- Uso como agente o razonamiento multi-paso: no soportado; es un modelo base sin entrenamiento para planificacion o uso de herramientas.
- Capacidades multilingues: solo ingles declarado (`language: en`).
- Capacidades especiales: no dispone de modo de pensamiento (thinking mode), vision, audio ni decodificacion especulativa documentada.
- Uso como checkpoint de investigacion: puede cargarse con el codigo del paper (clase `TransformerGPT`) para reproducir evaluaciones del benchmark CORE (22 tareas, semillas 0/1/2).

## Casos de uso

- Reproduccion de experimentos de escalado: cargar `final.pt` y `result.json` con el repositorio `cue-engineering/loop` para reproducir el punto d6 de la escalera de FineWeb y contrastar exponentes de escalado con otros puntos de la misma familia.
- Baseline en estudios de crecimiento de modelo y recursion: al ser un transformer estandar sin bucles efectivos, sirve como referencia "vanilla" frente a variantes con profundidad recurrente dentro del mismo paper.
- Evaluacion con el benchmark CORE: ejecutar `eval.py` con `--max-per-task` para una prueba de humo acotada en GPU, o sin ese flag para las 22 tareas y las semillas 0/1/2, comparando despues con la NLL de validacion reportada.
- Punto de partida para fine-tuning academico: con 119,7 millones de parametros, un ajuste completo o con LoRA cabe en una unica GPU de consumo; requiere convertir el checkpoint a un formato compatible con el stack de entrenamiento elegido.
- Generacion de texto corto en ingles y autocompletado: continuacion de parrafos, generacion de titulares o resumenes extractivos en experimentos de bajo coste donde la calidad de un modelo base de 120M es suficiente.
- Analisis de representaciones internas e interpretabilidad: al ser un modelo pequeno y de arquitectura conocida, es adecuado para extraer activaciones y estudiar circuitos sin requerir hardware de gama alta.
- Ablaciones de tokenizador: al usar el tokenizador GPT-2 (50.304 filas), permite comparar directamente con otros modelos de la misma familia y tamano que emplean el mismo vocabulario.
- Docencia y prototipado de pipelines de inferencia: sirve para validar infraestructura (carga de checkpoints, autocast en bfloat16, FlashAttention) antes de escalar a modelos mayores del mismo codebase.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ARC, HellaSwag u otros) en la informacion disponible. La unica metrica documentada es la siguiente:

| Metrica | Valor | Notas |
|---|---|---|
| NLL de validacion en preentrenamiento | 3,560862 nats/token | Medida sobre el corpus de preentrenamiento (FineWeb); el autor indica que no es comparable con la NLL de respuestas del benchmark CORE |
| Puntuaciones CORE | no disponible | El propio autor advierte que los resultados de la prueba de humo (`--max-per-task 10`) no equivalen a los resultados completos del paper |

No se dispone de comparaciones publicadas con otros modelos en terminos de rendimiento.

## Requisitos de hardware

- VRAM para inferencia: los pesos en FP32 ocupan 0,479 GB; en FP16/BF16 unos 0,24 GB; una cuantizacion hipotetica a 8 bits rondaria los 0,12 GB. Con cache KV para 2.048 tokens y las activaciones, el consumo real se mantiene muy por debajo de 1-2 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente. El paper usa H100 con FlashAttention-3 y autocast en bfloat16, pero ese hardware no es necesario para inferencia del checkpoint.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual (por ejemplo RTX 3060 12 GB, RTX 4060 8 GB, e incluso GPUs con 4 GB). Tambien es viable en CPU para pruebas puntuales.
- Opciones de despliegue: el artefacto es un checkpoint PyTorch personalizado (`TransformerGPT`) y no un `AutoModel` de Transformers, por lo que no es cargable directamente en vLLM, TGI, llama.cpp, Ollama o LM Studio sin una conversion previa y la implementacion de la arquitectura. El camino soportado por el autor es el codebase `cue-engineering/loop` con `eval.py`.
- Latencia y throughput estimados: no disponible; no se publican mediciones de tokens por segundo ni de latencia.
- Almacenamiento y memoria durante el entrenamiento: el repositorio ocupa 0,5 GB, pero no incluye estado del optimizador, por lo que no es posible reanudar el entrenamiento original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato de pesos | Datos de benchmarks |
|---|---|---|---|---|---|
| loop-vanilla-d6 | 119.734.272 | 2.048 | no disponible | PyTorch `.pt` (arquitectura personalizada) | Solo NLL de validacion (3,560862 nats/token) |
| GPT-2 (124M) | ~124 millones | 1.024 | licencia MIT modificada | safetensors / PyTorch | Si, publicados en su model card |
| Pythia-160M | ~162 millones | 2.048 | Apache 2.0 | safetensors / PyTorch | Si, publicados en su model card |
| SmolLM-135M | ~135 millones | 2.048 | Apache 2.0 | safetensors | Si, publicados en su model card |

Los datos de los modelos alternativos provienen de sus fichas publicas y deben verificarse antes de citarlos. La comparacion de rendimiento no es posible: loop-vanilla-d6 no publica resultados de benchmarks comparables con los de esos modelos, y su unica metrica (NLL sobre el corpus de preentrenamiento) no es directamente equiparable a las metricas de evaluacion de terceros.

## Limitaciones y advertencias

- No es un modelo ajustado por instrucciones: no sigue ordenes, no mantiene formato de chat y puede producir continuaciones irrelevantes ante un prompt en forma de pregunta.
- Riesgo de alucinacion alto y sin mitigar: al ser un modelo base entrenado sobre texto web (FineWeb), genera contenido plausible pero no verificado.
- Sesgos: el corpus FineWeb procede de texto web sin filtrado documentado en esta ficha, por lo que es esperable que arrastre sesgos sociales, estereotipos y contenido toxico presentes en ese origen.
- Limitacion idiomatica: solo se declara ingles (`en`); el rendimiento en castellano u otras lenguas no esta documentado y previsiblemente sera pobre.
- Limitacion de contexto: 2.048 tokens, insuficiente para tareas de documento largo, analisis de repositorios completos o conversaciones extensas.
- Licencia no disponible: no se especifica licencia en el repositorio ni en la model card. Esto supone un riesgo legal para cualquier uso comercial; conviene contactar con el autor antes de usarlo en produccion.
- Artefacto no portable: es un checkpoint de una clase personalizada (`TransformerGPT`) y no un `AutoModel` de Transformers, por lo que no funciona con las herramientas estandar de inferencia ni con cuantizacion GGUF.
- No incluye estado del optimizador: no se puede reanudar el entrenamiento original, solo hacer fine-tuning desde los pesos finales, y solo si se dispone del codigo que reconstruye la arquitectura.
- Metrica unica y no comparable: la NLL de validacion se mide sobre el mismo corpus de preentrenamiento y no equivale a la NLL de respuestas del benchmark CORE; no debe presentarse como resultado de evaluacion de capacidades.
- Adopcion nula: 0 descargas y 0 "likes" en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Fechas del repositorio inconsistentes: la creacion y la ultima actualizacion figuran como 2026-09-16, lo que conviene verificar antes de citar el artefacto.
- Uso previsto: investigacion y reproducibilidad. No se recomienda como componente de un producto en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieChen/loop-vanilla-d6
- Repositorio de codigo del paper: https://github.com/cue-engineering/loop
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Tokenizador GPT-2 de tiktoken: https://github.com/openai/tiktoken
- Paper de referencia: "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents" (no se ha encontrado el enlace directo en la busqueda web; se cita por el titulo indicado en la model card)

Nota: las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo, el paper o el repositorio; los unicos resultados obtenidos no guardaban relacion con el contenido y se han descartado.
