# pythainlp/laya-multilingual-onnx

## Resumen

laya-multilingual-onnx es la exportación a ONNX de convaiinnovations/laya-multilingual, un encoder mmBERT-base de 322 millones de parámetros orientado a la toma de decisiones tipadas en agentes conversacionales. El artefacto lo publica el usuario pythainlp y se ha generado con la herramienta laya-mlx a partir del checkpoint MLX aac6fef/laya-multilingual-mlx, que a su vez deriva del repositorio original. Es, por tanto, un port independiente y no una publicación oficial de Convai Innovations.

El modelo no genera texto libre: empaqueta en un único grafo ONNX el encoder, la cabeza de decisión, el scorer y la cabeza de acción. Las entradas incluyen `qtype` para distinguir tres tipos de decisión (0 = choice, 1 = score, 2 = noul) y las salidas son `logits` y `act_logits`, que requieren temperatura de calibración y softmax antes de ser interpretados. Esa naturaleza de clasificador-agente lo aleja de los LLM decoder-only habituales.

Su relevancia práctica es la ejecución íntegra en el navegador: el repositorio incluye soporte para onnxruntime-web con backend WebGPU, con pesos en float16 y un repositorio de 0,7 GB, lo que permite desplegar agentes de decisión en cliente sin backend y con los datos del usuario en local. El autor valida la paridad funcional frente al runtime MLX con 63 preguntas y publica dos demos jugables (Snake y Chess).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder mmBERT-base (322M parámetros) con cabeza de decisión, scorer y cabeza de acción, fusionados en un único grafo ONNX |
| Parametros totales | 322 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el límite se controla con `max_len` y `head_max_len` en `rl_agent_config.json`; los valores no se publican) |
| Tipos de cuantizacion | float16 en los pesos con cola de decisión en float32; el modelo base upstream dispone de variantes cuantizadas no detalladas |
| Idiomas soportados | multilingüe según la denominación del modelo base; lista concreta de idiomas no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 18, operadores estándar, float16); tokenizer en formato Hugging Face (`tokenizer.json`, `tokenizer_config.json`) |
| Runtime de inferencia | onnxruntime (CPU) y onnxruntime-web (WebGPU, WASM); requiere onnxruntime-web 1.30.0 con `graphOptimizationLevel: "basic"` en WebGPU |
| Tamano del repositorio | 0,7 GB |
| Fecha de publicacion (metadatos) | 2026-09-26 |

## Arquitectura y entrenamiento

La pieza central es un encoder bidireccional mmBERT-base de 322 millones de parámetros, sobre el que se montan varias cabezas: una cabeza de decisión que puntúa marcadores concretos del prompt (`marker_pos`, `marker_mask`), un scorer y una cabeza de acción que produce `act_logits` sobre un espacio de acciones. Todo ello se ha exportado con `laya-mlx export-onnx --dtype float16` a un grafo de opset 18 que emplea únicamente operadores estándar, lo que garantiza compatibilidad con onnxruntime y con onnxruntime-web. Las entradas son `input_ids` y `attention_mask` (int64, `[batch, sequence]`), `marker_pos` (int64, `[batch, markers]`), `marker_mask` (bool, `[batch, markers]`) y `qtype` (int64, `[batch]`); las salidas son `logits` y `act_logits`, ambas en float32.

No se dispone de información sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni el uso de RLHF o DPO. El nombre del fichero de configuración (`rl_agent_config.json`, con temperaturas de calibración) y la presencia de una cabeza de acción sugieren un ajuste orientado a políticas de agente, pero no hay detalle publicado al respecto. La innovación técnica destacable del artefacto no está en la arquitectura heredada, sino en el empaquetado: un único grafo que cubre encoder, decisión, scoring y acción, con la construcción de prompt, la calibración y el formateo de respuestas delegados a la implementación de referencia (`laya_mlx.common` / `laya_mlx.agent`) y a su port a navegador (`@laya-mlx/web`).

## Capacidades

- Codificación de texto multilingüe mediante el encoder mmBERT-base.
- Decisiones tipadas: selección entre opciones (`choice`), puntuación (`score`) y abstención o rechazo (`noul`, es decir, "no useful").
- Puntuación de marcadores dentro del prompt a través de `logits` (requiere temperatura de calibración más softmax).
- Selección de acciones de agente mediante `act_logits`, con un espacio de acciones definido en la cabeza de acción.
- Inferencia en el navegador con onnxruntime-web y backend WebGPU, o en CPU con el provider estándar de onnxruntime.
- Ejecución en cliente sin backend: los datos no salen del dispositivo.
- No genera texto libre: no es un modelo decoder-only ni un modelo de chat.
- Tool calling, function calling y razonamiento multi-paso en lenguaje natural: no disponibles como capacidades declaradas.
- Visión, audio y modo "thinking": no disponibles.

## Casos de uso

- Agentes de juego en el navegador: las demos publicadas (Snake y Chess) usan el modelo directamente en la pestaña del usuario con WebGPU para elegir acciones de juego sin enviar estado al servidor.
- Enrutado de decisiones en asistentes conversacionales: la cabeza de decisión con `qtype=0` permite elegir entre un conjunto cerrado de opciones o intenciones en cada turno, integrándose como clasificador previo a un LLM generativo.
- Scoring y reranking: con `qtype=1` el modelo puntúa candidatos (respuestas, documentos o turnos de diálogo), útil como reranker ligero en pipelines de recuperación.
- Detección de consultas fuera de dominio: el tipo `noul` permite que el agente se abstenga en lugar de responder, algo aprovechable en filtros de entrada y en sistemas con requisitos de seguridad.
- Selección de acciones en agentes multi-paso: `act_logits` puede alimentar una política que decida la siguiente acción de un flujo (por ejemplo, consultar una herramienta, pedir aclaración o cerrar la conversación) dentro de un bucle de agente.
- Aplicaciones web con privacidad estricta: al ejecutarse en onnxruntime-web, el modelo encaja en productos donde el texto del usuario no puede salir del dispositivo (salud, legal, educación, herramientas internas de empresa).
- Evaluación y prototipado rápido: el grafo ONNX con operadores estándar permite montar pruebas de decisión en Python con onnxruntime y comparar resultados contra el runtime MLX, como hace el propio autor con sus fixtures de paridad.
- Despliegue en cliente para Apple Silicon: el checkpoint MLX de origen permite usar el mismo modelo con la pila MLX cuando el objetivo no es el navegador, manteniendo coherencia de comportamiento gracias a la paridad verificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí documenta una validación de paridad frente al runtime MLX de referencia:

| Prueba | Runtime | Resultado |
|---|---|---|
| Coincidencia en la respuesta seleccionada (63 preguntas de paridad) | MLX frente a ONNX | 63/63 respuestas coincidentes |
| Error máximo de probabilidad | onnxruntime, provider CPU | 5,1e-4 |
| Error máximo de probabilidad | onnxruntime-web, WebGPU (cómputo float16) | 1,2e-2 |

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,7-1 GB con pesos float16 (el repositorio completo ocupa 0,7 GB); estimación orientativa, no confirmada por el autor.
- CPU: validado con el provider CPU de onnxruntime, con un error máximo de probabilidad de 5,1e-4 frente a MLX; la latencia en CPU no está publicada.
- GPU de consumo: cabe en cualquier GPU moderna, incluidas las integradas, siempre que el navegador exponga WebGPU; el propio proyecto lo ejecuta en navegador con cómputo float16.
- Despliegue en servidor: onnxruntime con provider CPU o GPU; no se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que además no aplican a un modelo de decisión con cabezas personalizadas.
- Despliegue en cliente: onnxruntime-web 1.30.0 con backend WebGPU (y `graphOptimizationLevel: "basic"` obligatorio para este grafo) o WASM.
- Apple Silicon: el checkpoint de origen es MLX, por lo que también puede ejecutarse con la pila MLX de Apple.
- Latencia y throughput: no disponibles; existen mediciones en navegador referenciadas en `docs/ONNX_EXPORT.md`, pero sus cifras no se reproducen en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de terceros comparables en la información facilitada. La comparación posible es entre los tres artefactos derivados del mismo modelo base:

| Artefacto | Formato y runtime | Parametros | Licencia | Notas |
|---|---|---|---|---|
| pythainlp/laya-multilingual-onnx | ONNX float16, onnxruntime y onnxruntime-web (WebGPU/WASM) | 322M | Apache-2.0 | Port independiente; incluye cabezas de decisión, scorer y acción en un único grafo; paridad 63/63 frente a MLX |
| aac6fef/laya-multilingual-mlx | MLX (checkpoint de origen del export) | 322M (mismo modelo base) | Apache-2.0 (según upstream) | Punto de partida del export ONNX; snapshot `f2b4faf51023039425946074e2cf1361d2db11d5` |
| convaiinnovations/laya-multilingual | Pesos originales del autor (revisión `052592a15d198d9ad47da779604259b10b47b7aa`) | 322M | Apache-2.0 | Modelo upstream; de él derivan tanto el checkpoint MLX como el export ONNX; variantes cuantizadas mencionadas en los metadatos |

## Limitaciones y advertencias

- Es un port independiente, no una publicación oficial de Convai Innovations; el soporte y la trazabilidad recaen en el autor del export.
- No es un modelo generativo: no produce texto libre, y los `logits` de salida requieren temperatura de calibración y softmax antes de interpretarse, por lo que una integración incorrecta degrada silenciosamente los resultados.
- La validación publicada se limita a 63 preguntas de paridad frente a MLX; no hay evaluación en tareas abiertas ni comparación con otros modelos, lo que dificulta estimar su calidad real más allá de la reproducibilidad numérica.
- No hay información sobre sesgos, composición del dataset de entrenamiento ni idiomas realmente cubiertos; el carácter multilingüe se deduce del nombre del modelo base y no de una lista documentada.
- La longitud de contexto efectiva no se publica: los límites viven en `rl_agent_config.json` (`max_len`, `head_max_len`) y deben consultarse antes de diseñar prompts largos.
- Restricción de runtime en navegador: con onnxruntime-web 1.30.0 el grafo exige `graphOptimizationLevel: "basic"` en WebGPU; otras configuraciones pueden fallar o dar resultados distintos.
- La cuantización float16 en WebGPU introduce un error de probabilidad máximo de 1,2e-2, dos órdenes de magnitud superior al del provider CPU (5,1e-4); en decisiones con umbrales ajustados conviene calibrar por runtime.
- La licencia Apache-2.0 permite uso comercial, pero al tratarse de un artefacto derivado conviene verificar las condiciones del repositorio upstream y de la herramienta de exportación.
- Los metadatos indican 0 descargas y 0 likes, y una fecha de publicación (2026-09-26) posterior a la fecha actual, lo que apunta a un error en los metadatos; la validación por parte de la comunidad es, en la práctica, inexistente.
- El tamaño del repositorio (0,7 GB) incluye tokenizer y ficheros de configuración; en despliegues web conviene planificar la caché y la carga inicial del grafo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pythainlp/laya-multilingual-onnx
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Checkpoint MLX de origen: https://huggingface.co/aac6fef/laya-multilingual-mlx
- Repositorio laya-mlx (herramienta de exportación e implementación de referencia): https://github.com/mizorewww/laya-mlx
- Fork de mizchi con las mediciones en navegador: https://mizchi.github.io/laya-mlx/
- Documentación del export ONNX: `docs/ONNX_EXPORT.md` dentro del repositorio laya-mlx
- Demo en vivo (Snake y Chess): https://huggingface.co/spaces/mizchi/laya-web-demo
- Demo directa de Snake: https://mizchi-laya-web-demo.static.hf.space/snake.html
- Demo directa de Chess: https://mizchi-laya-web-demo.static.hf.space/chess.html
