# Lawless1987/threefold

## Resumen

Threefold (también referido como L-lens) es un aparato experimental de observabilidad y procedencia para IA publicado por el desarrollador independiente Lawless1987 bajo licencia Apache-2.0. No es un modelo de lenguaje entrenado, sino una infraestructura de tres patas (Tombstone, Covenant y L-lens) que se ejecuta alrededor del *Jacobian Lens* (JLens) de Anthropic, una técnica de interpretabilidad mecanicista que transporta linealmente el vector del flujo residual de una capa concreta hasta la base de la capa final mediante el jacobiano medio entrada-salida.

El problema que aborda es la trazabilidad verificable de mediciones de interpretabilidad: cada tarea completada dispara las tres patas bajo un mismo `task_id` y, si alguna falla o no concuerdan, la tríada falla sin ruta de degradación. La pata Tombstone es un registro de ejecución append-only; Covenant es memoria estructurada escrita por el sistema `ai_memory_system`; y L-lens envuelve las mediciones de JLens, hashea las capturas y deriva resúmenes de los arrays crudos.

Por defecto el modelo sujeto observado es GPT-2 small (`openai-community/gpt2`), y la documentación insiste explícitamente en que el sujeto no es el agente: la lente observa el flujo residual de GPT-2 mientras lee un texto, no al agente que lo escribió. Es relevante ahora como propuesta de infraestructura reproducible para auditar mediciones mecanicistas, aunque su madurez y adopción son todavía nulas (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal; es un aparato de observabilidad sobre el Jacobian Lens de Anthropic (modelo sujeto por defecto: GPT-2 small) |
| Parámetros totales | No disponible (depende del modelo sujeto; GPT-2 small tiene 124 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo sujeto; GPT-2 small: 1024 tokens) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica; artefactos en JSON y NPZ (`jlens_snapshot.json`, `jlens_raw.npz`, `jlens_vocab.json`, `llens.json`) |

## Arquitectura y entrenamiento

Threefold no entrena ningún modelo. Su núcleo técnico es el *Jacobian Lens* de Anthropic, que ajusta el jacobiano medio entrada-salida `J_l = E[∂h_final/∂h_l]` sobre un corpus de texto y lo usa para transportar el vector del flujo residual de la capa `l` y una posición de token hasta la base de la capa final. El resultado se decodifica con el propio *unembedding* del modelo sujeto para obtener logits sobre el vocabulario, lo que indica qué tokens es propenso a predecir ese residual.

La captura (`jlens_snapshot.py`) sigue los valores por defecto de la API upstream: lee todas las capas ajustadas cuando `layers=None` y todas las posiciones cuando `positions=None`. Para la lente empaquetada de GPT-2 eso son 11 capas (0–10; la capa 11 es la salida del modelo) en cada posición. Registra tres lecturas por celda: los logits del Jacobian Lens (`use_jacobian` activado), la línea base del *logit-lens* vainilla (`use_jacobian` desactivado) y los logits finales del propio modelo. La capa L-lens hashea cada array crudo, cada tensor completo `[positions, vocab]` y el vocabulario, y deriva resúmenes; los hashes que deben tomarse en tiempo de captura viven en una sección separada `llens_capture_time`, nunca bajo los datos crudos.

## Capacidades

- Registro de ejecución append-only (Tombstone) con `task_id`, `jlens_capture_sha256` y `llens_sha256` por tarea.
- Memoria estructurada persistente (Covenant) con entradas `task-<id>`, `jlens-<id>` y `llens-<id>` bajo `AI_MEMORY_ROOT`.
- Medición mecanicista por capas y posiciones de token mediante el Jacobian Lens de Anthropic, ejecutado sin modificar.
- Comparación entre la lente jacobiana, la línea base del logit-lens y los logits finales del modelo en las mismas celdas.
- Verificación de integridad mediante hashes SHA-256 de arrays crudos, tensores completos y vocabulario.
- Verificación de concordancia entre las tres patas mediante `triad/verify_triad.py`; sin ruta de degradación.
- Captura de metadatos completos de entorno: versión de Python, torch, transformers, numpy, plataforma, número de hilos y semilla.
- No incluye observación del propio agente como pata de la tríada.

## Casos de uso

- Auditoría reproducible de mediciones de interpretabilidad: L-lens hashea cada array y tensor de la captura, de modo que un tercero puede verificar que un resultado publicado corresponde exactamente a los tensores que produjo JLens en una ejecución concreta.
- Registro de procedencia en pipelines de investigación mecanicista: cada experimento queda con `task_id` único y digests cruzados entre Tombstone y Covenant, lo que permite reconstruir qué captura originó qué conclusión.
- Comparación controlada de técnicas de lectura del flujo residual: al capturar simultáneamente la lente jacobiana, la línea base vainilla y los logits finales en las mismas celdas, se puede aislar el efecto del transporte jacobiano frente al *unembedding* directo.
- Detección de deriva o manipulación de artefactos: la verificación de la tríada falla si las patas no concuerdan, lo que sirve como control de integridad en entornos donde varias personas o procesos escriben memorias y registros.
- Docencia y divulgación de interpretabilidad: con GPT-2 small como sujeto por defecto, el coste de ejecución es bajo y permite ilustrar cómo se lee el flujo residual capa a capa en hardware de consumo.
- Base para sistemas de observabilidad de agentes: la estructura de tres patas con `task_id` compartido puede adaptarse a pipelines que necesiten trazar decisiones de agentes junto a mediciones internas, aunque el autor advierte que el sujeto observado no es el agente.
- Reproducibilidad de experimentos en revisiones concretas: la captura registra `subject_model.revision` (commit del Hub) y `upstream.vcs_commit`, lo que permite repetir una medición contra exactamente las mismas versiones de modelo y librería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad, latencia ni throughput; solo registra tiempos de ejecución por captura (`model_load_s`, `apply_jacobian_s`, `apply_baseline_s`, `total_s`) que dependen del hardware y no se reportan con valores concretos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con GPT-2 small como sujeto por defecto, la huella es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no disponible. El sujeto por defecto (GPT-2 small, 124 M de parámetros) no requiere GPU de datacenter.
- Cabe en GPU de consumo: sí, con el sujeto por defecto; para sujetos mayores dependerá del modelo elegido.
- Opciones de despliegue: ejecución directa de los scripts del repositorio (`jlens_snapshot.py`, `llens.py`, `triad/verify_triad.py`) sobre PyTorch y Transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La captura guarda tiempos por ejecución, pero la model card no publica cifras de referencia.
- Almacenamiento: los tensores completos ocupan aproximadamente 24 MB por capa a 120 tokens, según la propia documentación, motivo por el que solo se conservan sus hashes.

## Comparativa con modelos similares

| Herramienta | Tipo | Modelo sujeto | Capas leídas | Verificación de integridad | Licencia |
|---|---|---|---|---|---|
| Threefold (L-lens) | Aparato de observabilidad y procedencia sobre JLens | GPT-2 small por defecto | Todas las ajustadas (11 en GPT-2) | Tríada con hashes SHA-256 y verificación obligatoria | Apache-2.0 |
| Anthropic Jacobian Lens (JLens) | Técnica y librería de interpretabilidad mecanicista | Configurable | Configurable vía API | No documentada en la información disponible | Apache-2.0 |
| Logit-lens vainilla | Técnica de lectura por *unembedding* directo | Configurable | Configurable | No aplica | No disponible |

No se dispone de información sobre otras alternativas comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde a prompts y no debe evaluarse con benchmarks de LLM.
- La lente no lee pensamientos, creencias ni intenciones, no detecta consciencia y no establece verdad semántica alguna; la model card lo declara explícitamente.
- El sujeto no es el agente: por defecto se observa GPT-2 small leyendo el texto de una tarea, no al agente que escribió ese texto. Cada captura lo indica en `subject_model.note`.
- La tríada no tiene ruta de degradación: si una pata falla o las patas no concuerdan, la tarea falla por completo, lo que puede ser frágil en producción.
- Los tokens decodificados en `jlens_vocab.json` son una vista del tokenizador, no una medición; confundirlos con datos medidos sería un error metodológico.
- Adopción nula en el momento de la consulta (0 descargas, 0 likes) y autor independiente, sin revisión por pares documentada.
- Idiomas soportados no disponibles; el comportamiento lingüístico depende enteramente del modelo sujeto.
- Licencia Apache-2.0 permite uso comercial, pero el software depende de JLens de Anthropic y de GPT-2 small, cuyos términos deben respetarse por separado.
- Fecha de creación registrada en 2026, posterior a la mayoría de referencias del ecosistema; conviene verificar la vigencia de los enlaces upstream antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lawless1987/threefold
- Repositorio Covenant: https://github.com/LAWLESS1987/covenant
- Jacobian Lens de Anthropic: https://github.com/anthropics/jacobian-lens
- Modelo sujeto por defecto (GPT-2 small): https://huggingface.co/openai-community/gpt2
