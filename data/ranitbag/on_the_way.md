# RANITBAG/on_the_way

## Resumen

Rivinity es un proyecto de modelo de lenguaje decoder-only multilingue orientado a inferencia en CPU, desarrollado por el usuario RANITBAG. Se distribuye bajo licencia Apache-2.0 y su repositorio ocupa 0,6 GB. A pesar de su etiquetado como modelo de generacion de texto, la model card es explicita: se encuentra en fase de "pre-training hardening" y **el modelo no ha sido entrenado**. Los pesos publicados son de inicializacion aleatoria, por lo que cualquier salida carece de calidad util.

La arquitectura si esta definida y bloqueada (V1): 8 capas, dimension oculta de 768, atencion con GQA (8 cabezas de consulta y 4 de clave-valor, head_dim 96), RoPE con theta 1.000.000 y una FFN de tipo MoE con 4 expertos y enrutamiento Top-1. El vocabulario es de 48.006 tokens y el contexto objetivo de configuracion es de 32.768 tokens, aunque el autor aclara que no es un contexto entrenado.

Su relevancia actual es limitada como modelo y alta como andamiaje de ingenieria: incluye tokenizador multilingue, pipeline de entrenamiento conectado de extremo a extremo, subsistema de web grounding con RAG, contrato de generacion con presupuesto de tokens y 656 tests en CPU verificados. Es, por tanto, una base reproducible para quien quiera entrenar o auditar un LLM pequeno multilingue, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE en la FFN (4 expertos, Top-1), GQA, SwiGLU, RoPE |
| Parametros totales | no disponible (no publicado; repo de 0,6 GB incluye codigo, tests y tokenizador) |
| Parametros activos | no disponible (MoE Top-1 sobre 4 expertos) |
| Longitud de contexto | 32.768 tokens (objetivo de configuracion, no contexto entrenado) |
| Tipos de cuantizacion | no disponible (conversion GGUF con contrato de metadatos validado; runtime bloqueado) |
| Idiomas soportados | en, hi, bn, ta, te, zh, ja, ko, ar, es, fr, de (12 declarados en la model card; bateria de tokenizador de 28 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (pesos sin entrenar; soporte de conversion a GGUF en el repositorio) |

## Arquitectura y entrenamiento

La arquitectura V1 bloqueada consta de 8 capas con dimension oculta 768. La atencion usa GQA con 8 cabezas de consulta y 4 de clave-valor, head_dim 96, con RMSNorm aplicado a consultas y claves. La posicion se codifica con RoPE theta 1.000.000. La FFN es un MoE de 4 expertos con enrutamiento Top-1 y expertos SwiGLU de dimension intermedia 2432. Los embeddings de tokens estan atados a la cabeza LM. El vocabulario T48 tiene 48.006 entradas (48.000 base mas 6 tokens de control con ids 48000-48005). Las clases se exponen en el paquete `rivinity` con `model_type: "rivinity"` y validacion en tiempo de construccion que rechaza combinaciones invalidas.

No ha habido entrenamiento real. El pipeline esta conectado de extremo a extremo (manifiesto, entrenamiento, checkpoint y reanudacion) sobre un fixture sintetico de 12 idiomas, pero el autor confirma que no existe ninguna ejecucion de entrenamiento con datos reales. Tampoco hay datos publicados sobre numero de tokens, composicion del corpus, RLHF o DPO. La unica evidencia a nivel de datos es la bateria multilingue del tokenizador (28 idiomas), que mide eficiencia de tokenizacion, no comprension. El soporte de `<think>` es gestion de formato y presupuesto de tokens, no una capacidad de razonamiento medida.

## Capacidades

- Generacion de texto autoregresiva con decodificacion greedy y por muestreo, cache KV y equivalencia entre streaming y no streaming (contrato verificado en tests).
- Contrato de presupuesto de generacion con `max_total_tokens`, `max_thinking_tokens` y `max_answer_tokens`, mas alias heredados.
- Tokenizacion multilingue para 12 idiomas declarados y bateria de eficiencia sobre 28 idiomas.
- Subsistema de web grounding: crawler con HTTP de la biblioteca estandar y Crawl4AI opcional, politica SSRF, cache SQLite, sanitizador, enrutador y proveedores de busqueda.
- RAG con contrato unificado de `Evidence` (local y web), capsulas, citas `[E#]` y estados de insuficiencia de evidencia.
- Soporte de tool calling y agentes: no disponible como capacidad del modelo; el repositorio incluye herramientas web seguras, pero no hay funcionamiento de modelo entrenado.
- Vision, audio o modo talker: no disponibles por diseno (modelo solo texto).
- Razonamiento, codigo, matematicas y capacidades conversacionales reales: no disponibles, al no existir pesos entrenados.

## Casos de uso

- Base para entrenamiento desde cero de un LLM pequeno multilingue: la arquitectura bloqueada, el tokenizador T48 y el pipeline manifiesto-checkpoint permiten iniciar un preentrenamiento reproducible sin disenar la pila desde cero.
- Investigacion sobre MoE de bajo numero de expertos: el diseno Top-1 con 4 expertos y SwiGLU permite estudiar enrutamiento, balanceo de carga y coste de activacion en un modelo que cabe en CPU.
- Evaluacion de tokenizadores multilingues: la bateria de 28 idiomas y el informe `reports/multilingual_report.json` sirven para comparar eficiencia de tokenizacion entre familias linguisticas (indicas, sinicas, semiticas, europeas).
- Prototipado de sistemas RAG con citas: el contrato `Evidence`, las capsulas y las citas `[E#]` permiten construir y testear una capa de grounding con estados de insuficiencia antes de disponer de un modelo entrenado.
- Auditoria de seguridad en pipelines web: el modelo de amenazas, la politica SSRF y los tests de seguridad sirven como referencia para crawlers y herramientas web en agentes.
- Verificacion de compatibilidad GGUF: el conversor y el contrato de metadatos permiten validar el formato de exportacion, aunque el runtime con llama.cpp esta bloqueado en el entorno del autor.
- Docencia y formacion: los 656 tests en CPU y la documentacion de arquitectura, pipeline y grounding constituyen un material practico para explicar el ciclo de vida de un LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que las ejecuciones del framework de benchmarks estan etiquetadas como `FRAMEWORK_ONLY` y que no existen mediciones reales del modelo. No se deben interpretar como resultados de rendimiento.

## Requisitos de hardware

- VRAM estimada: no disponible. Con 8 capas, hidden 768 y vocabulario 48.006, el modelo es de escala pequena y cabria con holgura en GPU de consumo, pero no hay recuento de parametros publicado para calcular cifras exactas.
- GPU recomendadas: no disponible. El proyecto esta disenado como "CPU-first"; por tamano, una GPU de consumo moderna seria suficiente, pero no hay medicion que lo confirme.
- Inferencia en CPU: es el objetivo declarado del proyecto; los 656 tests se ejecutan en CPU.
- Opciones de despliegue: el paquete `rivinity` con `transformers`; conversion a GGUF validada a nivel de metadatos, con runtime en llama.cpp bloqueado y no probado. vLLM, TGI y Ollama no estan documentados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Rivinity (RANITBAG/on_the_way) | no disponible | 32.768 (objetivo) | Apache-2.0 | Prototipo sin entrenar |
| TinyLlama-1.1B | 1,1 B | 2.048 | Apache-2.0 | Entrenado y publicado |
| Qwen2.5-0.5B | 0,5 B | 32.768 | Apache-2.0 | Entrenado y publicado |
| SmolLM2-360M | 0,36 B | 8.192 | Apache-2.0 | Entrenado y publicado |

La comparacion es estructural: Rivinity comparte categoria (modelo pequeno, licencia permisiva, contexto largo) con estos modelos, pero se diferencia en que incorpora un MoE Top-1 y en que no tiene pesos entrenados. No hay datos de rendimiento que permitan compararlo en tareas.

## Limitaciones y advertencias

- Pesos sin entrenar: todas las salidas son de calidad de inicializacion aleatoria. No debe usarse en produccion ni evaluarse como modelo funcional.
- La capacidad multilingue es un objetivo de diseno con evidencia a nivel de tokenizador, no una capacidad medida del modelo.
- El contexto de 32.768 tokens es un objetivo de configuracion, no un contexto entrenado; no hay validacion de atencion a larga distancia.
- El soporte de `<think>` es gestion de formato y presupuesto, no razonamiento verificado.
- La compatibilidad con llama.cpp esta bloqueada y no probada; el contrato GGUF solo cubre conversion y metadatos.
- Riesgo de alucinacion y sesgos: no evaluables sin entrenamiento; no hay datos.
- Limitaciones del subsistema web: limitacion de tasa por proceso, sin autenticacion ni cookies por diseno, y Crawl4AI lanza un navegador real cuando se habilita, lo que exige mantenerlo parcheado.
- Licencia Apache-2.0 permite uso comercial, pero el autor advierte de revisar las licencias de corpus y datasets en `training/data_manifest.py` antes de cualquier redistribucion; no se incluye corpus de produccion.
- Componentes heredados de un proyecto upstream estan en cuarentena en `legacy/` con atribucion; conviene revisarlos antes de reutilizar codigo.

## Enlaces

- Hugging Face: https://huggingface.co/RANITBAG/on_the_way
- Crawl4AI (dependencia opcional): https://github.com/unclecode/crawl4ai
- Documentacion interna citada en la model card: `docs/RIVINITY_ARCHITECTURE.md`, `docs/RIVINITY_MULTILINGUAL.md`, `docs/RIVINITY_WEB_GROUNDING.md`, `docs/RIVINITY_DATA_PIPELINE.md`, `docs/RIVINITY_PRETRAINING_READINESS.md`, `docs/RIVINITY_MIGRATION.md`, `docs/RIVINITY_REPO_FORENSIC_AUDIT.md`, `docs/RIVINITY_WEB_THREAT_MODEL.md`
- Paper, blog o demo adicionales: no disponibles
