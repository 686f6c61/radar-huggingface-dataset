# AndyInQtr/laya-coreai

## Resumen

`AndyInQtr/laya-coreai` es una conversion de inferencia del modelo de decisiones `convaiinnovations/laya-multilingual` al runtime Core AI de Apple, el sucesor de Core ML. No se trata de un modelo entrenado de nuevo, sino de un artefacto `.aimodel` exportado mediante el puente `apple/coreai-torch` que ejecuta el grafo original sobre GPU, Neural Engine o CPU en Apple Silicon, sin necesidad de PyTorch, Core ML, Transformers ni APIs en la nube durante la inferencia.

El modelo no genera texto. Su salida son decisiones tipadas: probabilidades `choice`, `score` y `noul` por cada pregunta planteada, ademas de logits de accion para politicas de aprendizaje por refuerzo. La arquitectura subyacente es un encoder ModernBERT con cabezas de decision, scorer y accion, con una forma fija de 96 tokens y 32 slots de opcion por pregunta. El repositorio incluye dos assets: uno de lote 1 (una pregunta por pasada) y otro de lote 3 (`laya-f16-b3.aimodel`) que comparte una unica pasada para tres preguntas.

Su relevancia es practica: demuestra latencias de 4,6-5,0 ms por pasada en M3 Max con fidelidad numerica muy superior a la cuantizacion W8 de Core ML (deriva de 2,1e-4 frente a 0,014), y en modo lote 3 alcanza unas 175 decisiones por segundo. El repositorio es pequeno (1,3 GB), esta publicado bajo Apache-2.0 y esta pensado para agentes locales en macOS que necesitan clasificacion y decision de baja latencia en lugar de generacion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT con cabeza de decision, scorer y cabeza de accion (grafo `laya_coreml.torch_model.DecisionModel` reexportado) |
| Parametros totales | no disponible |
| Longitud de contexto | 96 tokens fijos en total, 32 slots de opcion por pregunta; las peticiones que superan la capacidad lanzan excepcion, sin truncado silencioso |
| Tipos de cuantizacion | FP16 en pesos (`main.mlirb`, 615 MB); logits y salidas de accion en FP32 |
| Idiomas soportados | no disponible (el modelo base se denomina multilingual, pero el autor no documenta la lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.aimodel` (Core AI runtime) con pesos `main.mlirb`; incluye tambien un motor MLX propio en Python |
| Libreria | coreai (`coreai-core` 1.0.0b2) |
| Tag de pipeline | text-classification |
| Modelo base | `convaiinnovations/laya-multilingual` (commit `052592a15d198d9ad47da779604259b10b47b7aa`) |
| Tamano del repositorio | 1,3 GB |
| Fecha de creacion / actualizacion | 2026-09-20 / 2026-09-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto no entrena nada: es un puerto de inferencia. El grafo exportado corresponde a `laya_coreml.torch_model.DecisionModel` (Apache-2.0), implementacion derivada de `NandhaKishorM/laya`, y se convierte con `apple/coreai-torch` 0.4.2 sobre `coreai-core` 1.0.0b2. El checkpoint original es `convaiinnovations/laya-multilingual` en el commit fijado, con SHA256 de pesos `9d628fd971b700382ac6f65920a86f149777b2e748e0c955fb3b19695aa8f204`. La rebuild es reproducible mediante `scripts/build_aimodel.py` (torch export a coreai-torch a `.aimodel`, unos 90 segundos, con provenance verificada por sha256).

La topologia es un encoder ModernBERT seguido de cabezas especificas: una cabeza de decision que emite `choice` / `score` / `noul` sobre los slots de opcion, un scorer y una cabeza de accion para logits de RL. El repositorio tambien incluye un motor MLX escrito desde cero (`laya_coreai/mlx_engine.py`) que reimplementa el mismo grafo —encoder, cabeza de decision, scorer y cabeza de accion— contra el checkpoint FP32 original y lo fusiona con `mx.compile`, evitando por completo el runtime Core AI. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; la model card indica explicitamente que "las limitaciones de tarea e idioma provienen de Laya".

## Capacidades

- Clasificacion y decision tipada: devuelve probabilidades `choice`, `score` y `noul` para cada pregunta con opciones definidas por el usuario.
- Logits de accion RL: la cabeza de accion expone logits utilizables en politicas de decision.
- Inferencia sin generacion de tokens: cero tokens generados, lo que elimina el coste y la variabilidad de la decodificacion autoregresiva.
- Multiples preguntas por pasada: el asset B3 comparte una unica pasada para tres preguntas (por ejemplo, movimiento, riesgo y comida en un agente de juego).
- Aceleracion por hardware: seleccion de unidad de computo mediante `unit="gpu"`, `unit="ne"` o `unit="cpu"`.
- Ejecucion local sin dependencias de nube: no requiere PyTorch, Core ML, Transformers ni API externa en tiempo de inferencia.
- Paralelismo de paridad: 40/40 coincidencias de argmax y KL maxima de 1,5e-4 frente al bundle Core ML W8 en el conjunto de validacion del fixture.
- Capacidades multilingues: no disponibles en la documentacion; el modelo base se etiqueta como multilingual, pero no se enumeran idiomas.
- Vision, audio, tool calling, function calling y agentes multi-paso: no documentados en la informacion disponible; el modelo es un clasificador/decision head, no un modelo conversacional.

## Casos de uso

- Enrutado de intenciones en agentes locales: el modelo evalua una pregunta con opciones predefinidas y devuelve una distribucion sobre `choice`/`score`/`noul`, lo que permite decidir la siguiente accion de un agente sin invocar un LLM generativo ni una API externa.
- Gestion de reembolsos y disputas: la model card incluye el ejemplo de "el cliente pide el reembolso de un pago duplicado"; el modelo responde a la pregunta "¿solicita el cliente un reembolso?", adecuado para triaje de tickets con latencia inferior a 5 ms por decision.
- Agentes de juego en tiempo real: el script `snake_play.py` usa el asset B3 para compartir una sola pasada entre las tres preguntas del juego y alcanzar 175 decisiones/s, suficiente para bucles a 12 FPS sin degradar la logica.
- Clasificacion de baja latencia en produccion local: con p50 de 4,6-5,0 ms en GPU o Neural Engine, es apto para filtros previos que descarten o etiqueten entradas antes de pasarlas a un modelo mayor.
- Shield de seguridad en agentes: la demo reutiliza el "safety shield" de `laya-coreml`, de modo que el modelo puede actuar como capa de validacion de acciones antes de ejecutarlas.
- Inferencia sin conectividad ni telemetria: al no requerir nube, encaja en entornos con datos sensibles donde la peticion no puede salir del dispositivo Apple.
- Politicas de refuerzo embebidas: los logits de accion permiten integrar el modelo como cabeza de politica en bucles de RL que corren localmente sobre Apple Silicon.
- Pipelines de validacion de decisiones: la paridad de argmax y las metricas KL documentadas permiten usarlo como referencia para comparar cuantizaciones o backends alternativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni similares). Los unicos datos cuantitativos disponibles son latencias y metricas de paridad medidas en un M3 Max con macOS 27.2.

| Backend | p50 por pasada | Paridad frente a Core ML W8 |
|---|---|---|
| Este modelo, GPU (recomendado) | 4,6-5,0 ms | 40/40 argmax, KL maxima 1,5e-4 |
| Este modelo, Neural Engine | 4,6-5,0 ms | 40/40 argmax, KL maxima 1,5e-4 |
| Este modelo, solo CPU | 10,8-11,3 ms | 40/40 argmax, KL maxima 4,1e-4 |
| Core ML W8 (`laya-coreml` ane-w8, CPU+ANE) | 13,5 ms | linea base |
| Core ML FP16 flexible (CPU+GPU) | 17,1 ms | pesos exactos |
| MLX FP16 (`laya-mlx`) | ~10,8 ms | pesos exactos |

| Backend (decision de 3 preguntas) | p50 por decision |
|---|---|
| Este modelo, asset B3, GPU | 5,6-6,0 ms (175 decisiones/s) |
| Este modelo, asset B1, GPU | 14,3-14,6 ms (3 pasadas) |
| Bundle Core ML W8 (CPU+ANE) | 11,6-13,5 ms |
| MLX FP16 | ~10,8 ms mas construccion de prompt |

Paridad del asset B3: 100/100 de coincidencia de argmax frente al asset B1 (KL maxima 0,00000) y frente al bundle Core ML W8 (KL maxima 0,00014). En la validacion de calibracion, el asset deriva 2,1e-4 mientras que la cuantizacion W8 deriva hasta 0,014. El script `validate.py` reporta p50 de 5,0 ms en GPU, 5,0 ms en NE y 11,3 ms en CPU, con todos los chequeos superados.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon con macOS 27 o superior (runtime Core AI). Validado en M3 Max con macOS 27.2 y Python 3.10+.
- VRAM/memoria estimada: pesos FP16 de 615 MB (`main.mlirb`) mas el overhead del runtime; el repositorio completo ocupa 1,3 GB. Las salidas se asignan en FP32.
- GPU recomendadas: no aplica el catalogo NVIDIA; el modelo depende de la GPU integrada de Apple Silicon. No hay soporte documentado para A100, H100 ni RTX 4090.
- Cabe en hardware de consumo: si, en cualquier Mac con chip de la serie M que ejecute macOS 27+; la referencia medida es un M3 Max.
- Backends de ejecucion: `unit="gpu"` (recomendado), `unit="ne"` (Neural Engine, funcional pero con fragilidad heredada) y `unit="cpu"`. El modo sin fijar unidad es inestable y puede provocar SIGABRT.
- Opciones de despliegue: paquete Python `laya_coreai` sobre `coreai-core==1.0.0b2`, o bien el motor MLX propio incluido en el repositorio. No hay soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 4,6-5,0 ms por pasada en GPU y NE, 10,8-11,3 ms en CPU; con el asset B3, 5,6-6,0 ms por decision de tres preguntas, equivalentes a unos 175 decisiones por segundo.
- Limitacion de memoria del runtime: el bug de `coreai-core` 1.0.0b2 agota el pool global de `ioSurface` tras unas 6.000-8.000 llamadas rapidas y provoca un fallo fatal del proceso; a velocidad maxima de juego se alcanza en unos 90 segundos. El motor MLX incluido no usa CoreAIRuntime y no presenta esta fuga.

## Comparativa con modelos similares

| Modelo | Formato / runtime | p50 por pasada | Licencia | Notas |
|---|---|---|---|---|
| `AndyInQtr/laya-coreai` (este) | `.aimodel` sobre Core AI, FP16 | 4,6-5,0 ms (GPU/NE) | Apache-2.0 | Conversion independiente; incluye asset B3 y motor MLX propio |
| `laya-coreml` ane-w8 | Core ML, W8 | 13,5 ms | Apache-2.0 (derivada del mismo upstream) | Linea base de paridad; deriva de calibracion hasta 0,014 |
| `laya-coreml` FP16 flexible | Core ML, FP16, CPU+GPU | 17,1 ms | Apache-2.0 | Pesos exactos, mas lento |
| `laya-mlx` | MLX, FP16 | ~10,8 ms | Apache-2.0 | Pesos exactos; no incluye construccion de prompt en la cifra |
| `convaiinnovations/laya-multilingual` | Checkpoint original PyTorch | no disponible | Apache-2.0 | Modelo fuente del que derivan todas las conversiones |

No se dispone de comparativas con modelos de otros autores o de otra familia en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo probabilidades sobre opciones predefinidas y logits de accion. No debe evaluarse como un LLM.
- Forma fija: 96 tokens totales y 32 slots de opcion por pregunta. Las peticiones que exceden la capacidad lanzan excepcion; no hay truncado silencioso, lo que exige gestionar el error en produccion.
- Conversion no oficial: es un puerto independiente y no una release de Convai Innovations ni de Apple. Las limitaciones de tarea e idioma son las del modelo Laya original.
- Bug conocido del runtime: `coreai-core` 1.0.0b2 filtra memoria en el pool global `ioSurface` de Metal en las rutas GPU/NE y termina provocando un trap fatal del proceso tras unas 6.000-8.000 llamadas. Esta corregido unicamente aguas arriba, no en este repositorio.
- Inestabilidad del modo sin fijar unidad: el default sin `unit` enruta parte del grafo al compilador ANE, que falla la inferencia de tipos (`anec.scaled_elementwise` memref mismatch) en macOS 27.2 y provoca SIGABRT. Es obligatorio fijar `unit="gpu"` o `unit="ne"`.
- Dependencia de plataforma: requiere Apple Silicon y macOS 27+, con `coreai-core` en version beta; no hay ruta soportada para Linux, Windows ni GPUs NVIDIA.
- Idiomas: no documentados. Aunque el modelo base se denomina multilingual, no se especifica cobertura, calidad ni sesgos por idioma.
- Sesgos y alucinacion: no hay informacion disponible sobre sesgos medidos ni sobre tasas de error en clasificacion abierta; al emitir probabilidades calibradas localmente, un umbral mal elegido puede producir decisiones erroneas silenciosas.
- Uso comercial: la licencia Apache-2.0 lo permite, pero el repositorio incluye `LICENSE` y `NOTICE` que deben respetarse; el autor recomienda consultarlos.
- Madurez: cero descargas y cero likes en el momento de la consulta, y validacion limitada al fixture incluido; conviene reproducir `scripts/validate.py` antes de cualquier despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AndyInQtr/laya-coreai
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Puente de conversion de Apple: https://github.com/apple/coreai-torch
- Implementacion upstream de Laya: https://github.com/NandhaKishorM/laya
- Benchmarks comparativos, papers y demos adicionales: no disponible en la informacion proporcionada (los resultados de la busqueda web no guardan relacion con el modelo).
