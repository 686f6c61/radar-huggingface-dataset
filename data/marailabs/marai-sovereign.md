# Marailabs/marai-sovereign

## Resumen

Marai Sovereign v3 es un modelo de generación de texto presentado por Marailabs como una arquitectura de razonamiento soberana y neuromórfica, orientada a la auditabilidad. Su propuesta central no es un transformer convencional entrenado de forma monolítica, sino un ensamblaje de 16 capas INT8 destiladas a partir de fragmentos de cinco modelos existentes (DeepSeek-R1 1.5B, Qwen2.5-Coder 1.5B, Llama 3.2 1B, Qwen2.5 0.5B y SmolLM 135M), combinadas con un kernel propio denominado Scribe APU y una memoria de trazas causales en forma de DAG.

El modelo se distribuye como un repositorio de 0.0 GB con código personalizado (`trust_remote_code=True`), lo que indica que los pesos no se empaquetan en safetensors estándar sino en un formato propietario `.octo`. La dimensión interna declarada es muy reducida (`d_model=128`, 4 cabezas, `d_mlp=512`), lo que sitúa el coste computacional por token muy por debajo del de los modelos de origen, a costa de una capacidad de representación limitada.

La relevancia del proyecto reside en su enfoque de procedencia verificable: cada paso de inferencia genera un hash SHA-256 encadenado con el paso anterior y un reloj vectorial, lo que permite reconstruir la traza completa de una respuesta. Sin embargo, el repositorio no incluye pesos en formato estándar, no publica métricas de benchmarks convencionales y declara únicamente inglés como idioma soportado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblaje de 16 capas transformer INT8 destiladas (SwiGLU + RoPE + QuantumSpinorGate) con kernel Scribe APU y memoria DAG causal |
| Parametros totales | No disponible (los 5.43B corresponden a la suma de los modelos de origen, no al modelo resultante) |
| Parametros activos | No disponible (enrutado de 8x3 shards, sin cifra de parametros activos publicada) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 (capas del stack `.octo`) |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | `.octo` propietario (carga via `trust_remote_code=True`); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura declarada combina tres piezas. Primero, un stack de 16 capas transformer cuantizadas a INT8 con `d_model=128`, `n_heads=4` y `d_mlp=512`, usando SwiGLU, RoPE y una puerta denominada QuantumSpinorGate. Estas capas no se entrenan desde cero: se seleccionan capas concretas (L0, L1, L10, L20) de cinco modelos preexistentes y se apilan en un orden fijo. Segundo, un kernel de cómputo llamado Scribe APU que implementa un embedding octodimensional de ángulo dorado, atención cruzada multi-frase, resonancia trigonométrica discreta en 8 sectores y enrutado entre tres shards expertos (`meta-llama-3.1-logic-shard`, `deepseek-r1-reasoning-shard`, `mistral-creative-shard`). Tercero, un motor de procedencia que sella cada paso con un hash SHA-256 encadenado, un reloj vectorial, el conteo de operaciones MAC y una estimación energética.

No se documenta el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El proyecto incluye una base de conocimiento local con 13.582 entradas indexadas mediante FTS5 (ciencia, enciclopedia y derivaciones matemáticas) y un grafo de transiciones (`world_model_weights.db`) que actúa como soporte de recuperación durante la generación. La innovación técnica principal es, por tanto, el mecanismo de trazabilidad criptográfica del razonamiento, no una mejora en la calidad del modelado del lenguaje.

## Capacidades

- Generación de texto en inglés orientada a preguntas de opción múltiple y problemas aritméticos de varios pasos.
- Razonamiento simbólico-matemático con anotaciones de fundamentación (`[Scribe Grounding]`) que citan la entrada de la base de conocimiento utilizada.
- Enrutado entre shards expertos con lógica, razonamiento y creatividad como perfiles declarados.
- Trazabilidad de inferencia: cada paso devuelve `scribe_allele_hash`, `scribe_expert` y reloj vectorial.
- Servidor compatible con la API de OpenAI (`openai_server.py`) para integrarse en harnesses de evaluación existentes.
- Carga mediante `AutoModelForCausalLM` de Transformers con `trust_remote_code=True`.
- No se declara soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Evaluación de pipelines de razonamiento auditable: el modelo permite reconstruir la cadena completa de pasos de una respuesta mediante hashes encadenados, lo que resulta útil en entornos donde se exige justificar cada decisión del sistema.
- Investigación en procedencia de modelos: el DAG causal y los relojes vectoriales sirven como banco de pruebas para estudiar mecanismos de atribución y reproducibilidad en sistemas generativos.
- Preguntas de opción múltiple con fundamentación: la integración con la base FTS5 permite devolver la entrada de conocimiento que respalda la respuesta, adecuado para prototipos de tutoría o cuestionarios científicos.
- Aritmética elemental paso a paso: el modelo documenta resoluciones de problemas tipo GSM8K con desglose intermedio, útil para generar explicaciones didácticas de operaciones básicas.
- Despliegue local ligero: al operar con capas de dimensión 128 y cuantización INT8, el coste de inferencia es bajo y cabe en hardware modesto, lo que facilita pruebas en portátiles o entornos sin GPU dedicada.
- Integración en harnesses de benchmark: el servidor compatible con OpenAI permite conectarlo a LM-Eval-Harness o Inspect AI sin adaptadores adicionales, útil para comparativas internas de metodologías de evaluación.
- Prototipos de sistemas soberanos de datos: la combinación de vault local y trazas verificables encaja en escenarios con requisitos de residencia de datos y auditoría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente trazas de ejecución sobre ítems concretos de `ai2_arc_challenge`, `allenai_sciq` y `openai_gsm8k` con marcas de acierto por ítem, pero no agregados de precisión, y no se aportan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 0.0 GB y las capas declaradas son de dimensión 128 en INT8, por lo que la huella debería ser muy inferior a 1 GB, pero el formato `.octo` y el código personalizado impiden dar una cifra fiable.
- GPU recomendadas: no disponible. Por el tamaño declarado, cualquier GPU consumer reciente (RTX 3060 en adelante) debería ser suficiente, aunque no hay validación publicada.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del repositorio y la cuantización INT8, si bien no se documentan pruebas.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y servidor propio compatible con OpenAI (`openai_server.py`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Marai Sovereign v3 | No disponible (stack de 16 capas, `d_model=128`) | No disponible | MIT | `.octo` con código custom | Trazabilidad SHA-256 y DAG causal; solo inglés |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.5B | 32K (tipico en la familia) | MIT | safetensors, GGUF | Modelo de razonamiento destilado con benchmarks publicados |
| Qwen2.5-Coder-1.5B | 1.5B | 32K (tipico en la familia) | Apache 2.0 | safetensors, GGUF | Especializado en código, ampliamente soportado en vLLM y llama.cpp |
| Llama 3.2 1B | 1.2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Multilingüe, con restricciones de uso comercial |

La comparación es estructuralmente desigual: Marai Sovereign no publica parámetros efectivos ni métricas, y su formato propietario limita la portabilidad frente a alternativas con safetensors y GGUF. Su diferenciador es la capa de procedencia, no el rendimiento lingüístico.

## Limitaciones y advertencias

- No se publican pesos en safetensors ni GGUF; la carga requiere `trust_remote_code=True`, lo que implica ejecutar código arbitrario del autor y auditar `scribe_apu.py` y `scribe_engine.py` antes de usarlo en producción.
- El repositorio tiene 0.0 GB y 0 descargas, sin validación externa conocida; la ausencia de métricas agregadas impide verificar las capacidades declaradas.
- El modelo solo declara inglés; no hay soporte multilingüe documentado.
- La longitud de contexto no se especifica, lo que impide planificar aplicaciones de contexto largo.
- La dimensión interna (`d_model=128`) es muy reducida frente a los modelos de origen, lo que sugiere una capacidad limitada para tareas que exijan representaciones ricas, más allá de preguntas cerradas y aritmética simple.
- Riesgo de alucinación no cuantificado; las anotaciones `[Scribe Grounding]` no garantizan corrección, solo citan una entrada del vault.
- El enrutado entre shards expertos y las etiquetas de los mismos (`logic`, `reasoning`, `creative`) no van acompañados de evaluación de calidad por shard.
- La licencia MIT permite uso comercial, pero conviene verificar la procedencia de las capas destiladas de Llama 3.2 1B, cuya licencia original impone restricciones adicionales que podrían afectar a la redistribución.
- Las afirmaciones sobre estimación energética y operaciones MAC no están contrastadas con mediciones independientes.

## Enlaces

- Hugging Face: https://huggingface.co/Marailabs/marai-sovereign
- Traza DAG en Markdown: `SCRIBE_DAG_TRACE.md` (referenciada en la model card del repositorio)
- Traza DAG en JSON: `data/scribe_causal_dag_trace.json` (referenciada en la model card del repositorio)
- Kernel Scribe APU: `marai/scribe/scribe_apu.py` (referenciado en la model card)
- Motor de procedencia: `marai/scribe/scribe_engine.py` (referenciado en la model card)
- Servidor compatible con OpenAI: `openai_server.py` (referenciado en la model card)
