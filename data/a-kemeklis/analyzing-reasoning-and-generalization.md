# a-kemeklis/analyzing-reasoning-and-generalization

## Resumen

`a-kemeklis/analyzing-reasoning-and-generalization` no es un modelo generativo en sentido estricto, sino un repositorio de investigacion que agrupa el paper, el codigo y los resultados de un estudio sobre como la restriccion del vocabulario durante el preentrenamiento afecta al razonamiento y a la generalizacion en modelos de lenguaje pequenos. El autor, `a-kemeklis`, compara tres modelos entrenados sobre el corpus TinyStories: TinyStories-33M (33 millones de parametros, referencia publica de Ronen Eldan) y dos variantes propias de aproximadamente 7 millones de parametros, una con placeholders para palabras fuera del lexico (`ts300-ph`) y otra sin ellos (`ts300-noph`).

El trabajo se enmarca en la linea de investigacion sobre modelos de lenguaje de escala reducida (small language models) y su capacidad para exhibir habilidades linguisticas emergentes cuando se entrenan con datos sinteticos y controlados. La pregunta central es si limitar el vocabulario de preentrenamiento degrada la capacidad de razonamiento y de generalizacion, y como afecta a fenomenos como la persistencia tematica o el seguimiento de entidades en la generacion de historias.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamano de 0.0 GB (probablemente por metadatos incompletos) y no declara licencia ni pipeline. Su interes es fundamentalmente academico y reproducible: incluye scripts para recalcular todas las cifras y figuras del paper sin necesidad de GPU, ejecutandose todo en CPU. No debe confundirse con un checkpoint listo para produccion: es material de investigacion con modelos auxiliares de ~7M de parametros alojados en repos separados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (no se detalla en la informacion disponible; los modelos comparados son de tipo GPT pequeno entrenados sobre TinyStories) |
| Parametros totales | Variable segun el modelo: TinyStories-33M = 33M; ts300-ph y ts300-noph = ~7M cada uno |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible |
| Formato de pesos | No disponible (el repo de investigacion no contiene pesos; los modelos auxiliares estan en repos separados de Hugging Face) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura nueva propia, sino que evalua y compara tres modelos ya entrenados. TinyStories-33M es un transformer decoder-only de 33 millones de parametros entrenado por Ronen Eldan sobre el corpus TinyStories, un dataset sintetico de historias cortas generadas con vocabulario controlado para estudiar el aprendizaje linguistico en modelos pequenos. Las dos variantes del autor (`ts300-ph` y `ts300-noph`) son modelos de aproximadamente 7 millones de parametros entrenados sobre el mismo corpus, con la diferencia de que una utiliza placeholders para palabras fuera del lexico y la otra no.

El estudio se organiza en torno a dos experimentos principales. El primero (Experiment 1, `code/battery.py`) evalua habilidades mediante plantillas que cubren seguimiento de agente, causa emocional y acciones, entre otras. El segundo (Experiment 2, `code/persist.py` y `code/persist2.py`) mide la persistencia tematica y la reutilizacion de elementos en continuaciones de historias a partir de aperturas dadas. Ademas, se incluye una ronda de evaluacion con LLM-juez (`code/score_noph.py`, `judge_noph/`) que compara `ts300-noph` con TinyStories-33M. El trabajo tambien aborda la tokenizacion: `scripts/cleantok.py` re-codifica el texto usando solo token ids vistos en entrenamiento, y `scripts/rebuild_noph.py` y `scripts/audit_items.py` realizan una auditoria del tokenizador. No se especifican en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto narrativo corto en ingles, orientada a historias del estilo TinyStories.
- Razonamiento basico sobre entidades y acciones en contextos narrativos (seguimiento de agente, causa emocional, acciones), segun las plantillas del Experiment 1.
- Generalizacion ante palabras fuera del lexico, incluyendo palabras inventadas pronunciables (`nonsense`) y no pronunciables (`unpron`).
- Evaluacion de persistencia tematica y reutilizacion de elementos en continuaciones de historias.
- Capacidad de ser evaluado mediante LLM-juez (ronda de `judge_noph/`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad de producto; el estudio mide habilidades acotadas en un entorno controlado.
- Capacidades multilingues: solo ingles.
- Capacidades especiales: no se reportan modos de pensamiento, vision ni audio.

## Casos de uso

- Investigacion sobre vocabulario controlado en preentrenamiento: usar los scripts y resultados del repo para reproducir el analisis de como los placeholders afectan al razonamiento en modelos de ~7M de parametros, sin necesidad de GPU.
- Estudio de generalizacion lexica: emplear las listas de palabras (`inlex`, `oov`, `nonsense`, `unpron`) y el conversor de placeholders de `code/probes.py` para disenar experimentos propios sobre robustez ante palabras desconocidas.
- Evaluacion de modelos pequenos con LLM-juez: reutilizar `code/score_noph.py` y el answer key de `judge_noph/` para montar comparaciones automaticas entre checkpoints de escala reducida.
- Analisis de tokenizacion: aplicar `scripts/cleantok.py` para re-codificar texto con solo token ids vistos en entrenamiento y auditar el impacto del tokenizador en las metricas.
- Docencia y divulgacion: el hecho de que todo se ejecute en CPU y de que las cifras se recalculen desde `results/` lo hace adecuado para practicas de laboratorio sobre evaluacion de modelos de lenguaje.
- Reproducibilidad de papers: usar `scripts/analyze_v2.py` y `paper/figs/make_figs.py` para regenerar todas las tablas y figuras del paper y verificar sus conclusiones.
- Estudio de persistencia tematica: emplear `scripts/persist_inlex_v2.py` y `scripts/persist_unpron_v2.py` para medir la coherencia de continuaciones narrativas en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio contiene resultados propios de los Experimentos 1 y 2 en `results/` y `results_v1/`, pero no se proporcionan cifras numericas (MMLU, HumanEval, GSM8K u otros) en la informacion facilitada, por lo que no se presenta tabla comparativa de benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano de los modelos (7M y 33M de parametros) la inferencia es viable en CPU.
- GPU recomendadas: no se especifican; el propio autor indica que todo el pipeline de reproduccion se ejecuta en CPU.
- Cabe en GPU consumer: si, con margen amplio, dado el reducido numero de parametros, aunque no se detallan requisitos concretos.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el codigo de `code/harness.py` carga los modelos y realiza scoring y sampling directamente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyStories-33M | 33M | No disponible | Historias sinteticas, vocabulario controlado | No disponible | Hugging Face (`roneneldan/TinyStories-33M`) |
| ts300-ph | ~7M | No disponible | TinyStories con placeholders para palabras fuera del lexico | No disponible | Hugging Face (`a-kemeklis/constraining-pretraining-data`) |
| ts300-noph | ~7M | No disponible | TinyStories sin placeholders | No disponible | Hugging Face (`a-kemeklis/constraining-pretraining-data-no-placeholders`) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, mas alla de que el estudio los evalua con las mismas plantillas y protocolo.

## Limitaciones y advertencias

- No es un modelo listo para produccion: es un repositorio de investigacion con paper, codigo y resultados; los pesos viven en repos separados.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Solo ingles: no hay soporte multilingue documentado.
- Escala muy reducida (7M y 33M de parametros): las capacidades estan acotadas a narrativa corta y tareas controladas; no deben extrapolarse a razonamiento complejo.
- Riesgo de alucinacion: inherente a los modelos de lenguaje, aunque el dominio TinyStories reduce la exposicion a conocimiento factual.
- Sesgos conocidos: no documentados en la informacion disponible; el corpus sintetico puede introducir sesgos propios del generador de historias.
- Limitaciones de contexto: la longitud de contexto no se especifica, lo que impide planificar usos con ventanas largas.
- Ausencia de benchmarks estandar: no hay cifras comparables con MMLU, HumanEval o GSM8K, lo que dificulta la comparacion con otros modelos.
- Dependencia de scripts y rutas locales (`models/ph`, `models/noph`, `MODEL_DIR`) para re-ejecutar los modelos, lo que anade friccion a la reproduccion.

## Enlaces

- Repositorio principal en Hugging Face: https://huggingface.co/a-kemeklis/analyzing-reasoning-and-generalization
- TinyStories-33M: https://huggingface.co/roneneldan/TinyStories-33M
- Modelo con placeholders (paper 1): https://huggingface.co/a-kemeklis/constraining-pretraining-data
- Modelo sin placeholders: https://huggingface.co/a-kemeklis/constraining-pretraining-data-no-placeholders
- Paper (PDF y fuente LaTeX): incluido en `paper/` del repositorio principal (no se proporciona URL directa en la informacion disponible)
