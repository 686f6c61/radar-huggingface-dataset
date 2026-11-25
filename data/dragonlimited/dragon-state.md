# dragonlimited/dragon-state

## Resumen

dragon-state es el repositorio de estado del proyecto Dragon Finance 7B, desarrollado por dragonlimited. No se trata de un modelo listo para desplegar, sino de un contenedor de artefactos que preserva todo el trabajo alrededor de un ajuste fino (LoRA) sobre Qwen2.5-Coder-7B-Instruct para tareas financieras con datos de la SEC. El objetivo declarado es sobrevivir al borrado de disco que ocurre en cada relanzamiento de contenedor en las máquinas de entrenamiento, de modo que la base de datos de hechos, las trazas de entrenamiento, los checkpoints y los veredictos queden recuperables mediante un script de restauración.

El modelo subyacente es un transformer decoder-only de 7B parámetros (Qwen2.5-Coder-7B-Instruct) al que se le aplica un adaptador LoRA con rango 32 y alpha 64 sobre 196 capas, con 80,7 M parámetros entrenables (1,05 % del total). El ajuste se realiza sobre 39.000 trazas SFT limpias de contaminación orientadas a uso de herramientas (tool-use) contra una base de datos de hechos XBRL de la SEC. La relevancia actual reside en su enfoque de procedencia verificable: cada afirmación del repositorio puede recomprobarse con hashes y scripts incluidos.

El checkpoint actual es `runs/dragon-lora-v7/`, que sobre 60 preguntas congeladas mejora al modelo base en las cuatro métricas evaluadas: herramienta correcta (0,750 a 1,000), argumentos correctos (0,117 a 0,900) y respuesta correcta (0,133 a 0,750). No obstante, el autor indica explícitamente que no se ha publicado como pesos desplegables, ya que la comparación de cuantización Q4_K_M exigida como puerta de publicación no se ha ejecutado y todas las cifras son en bf16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-7B-Instruct) con adaptador LoRA |
| Parámetros totales | 7B (modelo base); 80,7 M entrenables en el adaptador (1,05 %) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (la comparación Q4_K_M está pendiente como puerta de publicación) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | adaptadores LoRA y `resume.pt`; no se publican pesos desplegables en safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-7B-Instruct, un transformer decoder-only de 7B parámetros, y se ajusta mediante LoRA con rango 32, alpha 64 y 196 capas afectadas, lo que resulta en 80,7 M parámetros entrenables. El entrenamiento se realiza sobre 39.000 trazas SFT (supervised fine-tuning) descritas como limpias de contaminación, con un tamaño de 241.654.520 bytes y hash sha256 `ef90f212…`. El proceso consta de 900 pasos. Las trazas se orientan al uso de herramientas contra una base de datos de hechos XBRL de la SEC que contiene 28.176.037 filas (13.031.109 consolidadas) y 55.635 presentaciones (filings).

La innovación técnica destacable no está en la arquitectura del modelo, sino en la infraestructura de procedencia: el repositorio incluye un registro de checkpoints con hashes, un programa `runs/verify_run.py` que recomputa cada hash y vuelve a ejecutar la puerta de evaluación registrada, y un arnés (`state/run_harness.py`) que reproduce la puntuación publicada del 99,8 % sin intervención del modelo. También se documenta un proceso de RLVR (`ops/rlvr_v2.py`) y una escalera de cinco brazos de adaptadores evaluada sobre 48 preguntas retenidas (`runs/bench-agent-loop/`). No se especifican datos sobre RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto y razonamiento orientado a dominio financiero.
- Uso de herramientas (tool calling) contra una base de datos XBRL de la SEC: selección de herramienta correcta y construcción de argumentos correctos.
- Razonamiento agéntico multi-paso (el repositorio incluye un bucle de agente evaluado en `runs/bench-agent-loop/`).
- Respuesta a preguntas financieras fundamentada en hechos estructurados y con trazabilidad de procedencia.
- Capacidad multilingüe: limitada a inglés (`en`) según la model card.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Consulta de estados financieros de la SEC: el modelo puede traducir preguntas en lenguaje natural a consultas sobre la base de hechos XBRL, seleccionando la herramienta adecuada y los argumentos correctos, gracias al ajuste específico sobre 39.000 trazas de tool-use.
- Automatización de extracción de métricas financieras: dado que el arnés reproduce respuestas directamente desde `facts.duckdb`, puede integrarse en pipelines que necesiten respuestas deterministas y auditables sobre datos consolidados.
- Agentes de investigación financiera multi-paso: el bucle agéntico evaluado permite encadenar consultas a la base de datos para responder preguntas que requieren varias extracciones y agregaciones.
- Auditoría y verificación de resultados: el repositorio incluye scripts que recomputan hashes y vuelven a ejecutar las puertas de evaluación, lo que permite reproducir cada afirmación de rendimiento antes de adoptar el modelo en producción.
- Reproducción de experimentos de ajuste fino: los manifiestos, `STEPS.csv`, adaptadores y `resume.pt` de cada ejecución permiten reanudar o replicar el entrenamiento en una máquina nueva mediante `ops/restore_state.py`.
- Evaluación comparativa de adaptadores: la escalera de cinco brazos sobre 48 preguntas retenidas sirve como referencia para medir mejoras de tool-use en modelos de 7B dentro del dominio financiero.

## Benchmarks y rendimiento

Resultados sobre 60 preguntas congeladas y retenidas, comparando el adaptador dragon-lora-v7 con el modelo base (cifras en bf16):

| Métrica | Modelo base | dragon-lora-v7 |
|---|---|---|
| Herramienta correcta (right tool) | 0,750 | 1,000 |
| Argumentos correctos (right arguments) | 0,117 | 0,900 |
| Respuesta correcta (answer correct) | 0,133 | 0,750 |
| Métricas mejoradas | — | 4 de 4 |

El autor señala que `answer_ok` no alcanza el objetivo de 0,80 fijado en el plan. También se menciona una puntuación del 99,8 % en el arnés (`run_harness.py`), pero esa cifra corresponde a la reproducción desde la base de datos sin intervención del modelo, no al rendimiento del adaptador. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al tratarse de un modelo base de 7B, en bf16 requeriría del orden de 14-16 GB, pero esta cifra no está confirmada por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; la cuantización Q4_K_M aún no se ha ejecutado ni comparado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El repositorio incluye scripts propios (`run_harness.py`, `verify_run.py`, `restore_state.py`) para reproducción y verificación, no para servicio de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| dragon-state (dragon-lora-v7) | 7B + LoRA 80,7 M | no disponible | apache-2.0 | Adaptadores y estado, no pesos desplegables | Ajuste financiero con tool-use y procedencia verificable |
| Qwen2.5-Coder-7B-Instruct | 7B | no disponible en esta ficha | apache-2.0 (según modelo base) | Pesos públicos en Hugging Face | Modelo base sobre el que se entrena el adaptador |
| Alternativas de 7B para finanzas | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con otros modelos financieros de la misma categoría.

## Limitaciones y advertencias

- No se publican pesos desplegables: el repositorio contiene adaptadores y estado de entrenamiento, no un modelo listo para producción.
- La puerta de publicación (comparación de cuantización Q4_K_M) no se ha ejecutado; todas las métricas son en bf16 y no reflejan el comportamiento tras cuantizar.
- `answer_ok` se queda en 0,750 frente al objetivo de 0,80 del plan, lo que indica margen de mejora en la corrección final de respuestas.
- Idioma limitado a inglés; no hay evidencia de rendimiento en castellano u otros idiomas.
- Longitud de contexto no documentada en la información disponible.
- Riesgo de alucinación: aunque el diseño busca fundamentar respuestas en una base de hechos XBRL, no se documentan evaluaciones específicas de tasa de alucinación fuera del conjunto congelado.
- Sesgos conocidos: no documentados.
- Uso comercial: la licencia es apache-2.0, pero los términos de uso y el descargo de responsabilidad sobre los datos subyacentes están en `Dragon-Finance-Corpus/DISCLAIMER.md`, que debe consultarse antes de cualquier uso en producción.
- El repositorio incluye un documento de correcciones (`docs/07-CORRECTIONS.md`) que advierte de errores en documentos anteriores; conviene leerlo antes de confiar en la documentación histórica.
- El tamaño del repositorio (58,5 GB) y la dependencia de scripts propios de restauración añaden complejidad operativa para su reutilización.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dragonlimited/dragon-state
- Descargo de responsabilidad de los datos: https://huggingface.co/datasets/dragonlimited/Dragon-Finance-Corpus/blob/main/DISCLAIMER.md
- Documentación interna del repositorio (rutas relativas dentro del propio repo): `docs/00-START-HERE.md`, `docs/01-WHAT-EXISTS.md`, `docs/02-WHAT-HAS-BEEN-DONE.md`, `docs/03-CHECKPOINTS.md`, `docs/04-HOW-TO-VERIFY.md`, `docs/05-OPEN-WORK.md`, `docs/06-RUNBOOK-RELAUNCH.md`, `docs/07-CORRECTIONS.md`
- Registro de auditoría y verificación: `runs/AUDIT.md`, `runs/bundle.json`, `runs/verify_run.py`
- Checkpoint actual: `runs/dragon-lora-v7/`
- Evaluación agéntica: `runs/bench-agent-loop/`
