# anthonyyazdaniml/umls-agent-qwen3.5-4b-thinking

## Resumen

UMLS Agent — Qwen3.5-4B Thinking es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario anthonyyazdaniml y vinculado al repositorio ds4dh/umls-agent-rl. Su tarea es la normalización de entidades biomédicas: dado un fragmento de texto clínico y una mención marcada con `<target>...</target>`, el modelo debe localizar el identificador de concepto (CUI) correspondiente en el Metathesaurus del UMLS. Para ello se apoya en una herramienta de búsqueda fija basada en SapBERT e índices HNSW, sobre cuyos resultados el modelo selecciona el CUI final.

El adaptador se ha entrenado con GRPO (Group Relative Policy Optimization) sobre el modelo base, un transformer de 4.000 millones de parámetros con modo de razonamiento ("thinking") habilitable. El resultado es un agente especializado que combina generación de texto con uso de herramientas en un bucle de razonamiento multi-paso, orientado a pipelines de anotación semántica en el dominio biomédico.

Su relevancia actual radica en que demuestra que un modelo pequeño (4B) puede resolver una tarea de normalización de entidades con precisión mediante RL y tool calling, en lugar de requerir modelos de mayor tamaño. La licencia Apache 2.0 y el formato PEFT/safetensors facilitan su integración en entornos de investigación y producción, aunque el alcance idiomático declarado se limita al inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-4B) con adaptador LoRA entrenado mediante GRPO |
| Parametros totales | 4.000 millones (modelo base); el adaptador LoRA se distribuye como pesos PEFT |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 81.920 tokens (configurado en el despliegue vLLM con `--max-model-len 81920`) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el autor publica el adaptador en safetensors; el merge se realiza en BF16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el merge produce un modelo BF16 en safetensors con shards de 2 GB |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.5-4B, un transformer decoder-only de 4.000 millones de parámetros con soporte de modo de razonamiento y tool calling. Sobre él se aplica un adaptador LoRA (librería PEFT) entrenado con GRPO, un algoritmo de optimización por refuerzo que ajusta la política del modelo a partir de recompensas comparativas dentro de un grupo de muestras. El proceso de entrenamiento está documentado en el repositorio GitHub ds4dh/umls-agent-rl, que incluye código de entrenamiento, prompts y la herramienta de búsqueda.

La innovación técnica principal es la integración de una herramienta externa fija (`search_umls`) basada en SapBERT y búsqueda aproximada por vecinos (HNSW) sobre el UMLS. El agente, con el modo thinking activado, genera un razonamiento, invoca la herramienta, examina los candidatos devueltos y selecciona el CUI final. El adaptador se distribuye por separado y debe fusionarse con el modelo base fijado en una revisión concreta (`851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) en FP32 y guardarse en BF16. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas adicionales de RLHF o DPO más allá del GRPO.

## Capacidades

- Normalización de entidades biomédicas: mapea una mención en contexto a un identificador de concepto UMLS (CUI).
- Razonamiento multi-paso con modo thinking habilitable mediante `chat_template_kwargs={"enable_thinking": true}`.
- Tool calling / function calling: invoca la herramienta `search_umls` y consume sus resultados para decidir la respuesta final.
- Generación de texto conversacional en inglés (pipeline `text-generation`, tarea `conversational`).
- Selección de candidatos a partir de resultados de búsqueda semántica (SapBERT + HNSW).
- No se declaran capacidades de visión, audio ni matemáticas avanzadas en la información disponible.

## Casos de uso

- Anotación semántica de informes clínicos: el agente recibe un texto con la mención marcada con `<target>...</target>` y devuelve el CUI UMLS correspondiente, lo que permite poblar bases de datos de conceptos normalizados a partir de corpus de historiales.
- Enriquecimiento de pipelines de NLP biomédico: integrado como paso de entity linking tras un reconocedor de entidades nombradas, resuelve la ambigüedad de términos como abreviaturas o sinónimos mediante la búsqueda SapBERT y el razonamiento del modelo.
- Construcción de grafos de conocimiento médicos: la salida CUI permite enlazar menciones de distintos documentos con el mismo concepto del UMLS, facilitando la consolidación de ontologías y relaciones.
- Extracción de información en investigación clínica: normalizar fármacos, enfermedades y procedimientos en conjuntos de datos de estudios permite búsquedas y agregaciones consistentes entre fuentes heterogéneas.
- Asistencia a la codificación médica: el modelo puede proponer el concepto UMLS subyacente a un término libre, sirviendo como apoyo a codificadores humanos que revisan la sugerencia antes de asignar códigos definitivos.
- Evaluación y benchmarking de agentes biomédicos: al estar entrenado con GRPO y una herramienta fija, sirve como referencia reproducible para comparar estrategias de entity linking con LLM frente a enfoques supervisados clásicos.
- Despliegue en investigación con recursos limitados: al partir de un modelo de 4B, puede servirse en una GPU de gama alta consumer o profesional con vLLM 0.30.0, lo que abarata la experimentación frente a modelos de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de 4B en BF16 se sitúa en torno a 8-9 GB de pesos, más overhead de contexto y KV cache, que puede crecer notablemente con la ventana de 81.920 tokens configurada.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) o A100/H100 son opciones viables; para contextos largos conviene VRAM adicional por la caché KV.
- Cabe en GPU consumer: sí, previsiblemente en RTX 4090 y GPUs con 16-24 GB, aunque con contextos muy largos el margen se reduce.
- Opciones de despliegue: vLLM 0.30.0 con `--dtype bfloat16 --max-model-len 81920 --enable-auto-tool-choice --tool-call-parser qwen3_coder --reasoning-parser qwen3`. El autor no documenta otras opciones (llama.cpp, Ollama, TGI) en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UMLS Agent Qwen3.5-4B Thinking (este) | 4B (base) + LoRA | 81.920 tokens (config. vLLM) | Entity linking biomédico con GRPO y tool calling | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | LLM generalista con thinking y tool calling | Apache 2.0 | Hugging Face |
| SapBERT | no disponible | no disponible | Embeddings biomédicos para entity linking | no disponible | Repositorio público |
| Modelos de entity linking biomédico supervisados clásicos | variable | no disponible | Clasificación/ranking de candidatos UMLS | variable | variable |

La comparación cuantitativa de rendimiento con alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El adaptador no es un modelo autónomo: requiere fusionarse con el modelo base Qwen/Qwen3.5-4B en la revisión fijada y, para su uso previsto, disponer de la herramienta `search_umls` del repositorio ds4dh/umls-agent-rl.
- Idioma limitado al inglés; no se declara soporte multilingüe.
- Especializado exclusivamente en normalización de entidades UMLS; su uso fuera de ese dominio no está validado.
- Riesgo de alucinación de CUIs: el modelo debe elegir entre los candidatos devueltos por la herramienta, pero no se documenta una garantía formal de que la salida pertenezca siempre a ese conjunto.
- No se han publicado métricas de evaluación ni benchmarks en la información disponible, por lo que no es posible cuantificar su precisión frente a alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- Aunque la licencia es Apache 2.0, el uso en producción sanitaria exige validación adicional y supervisión humana por el riesgo clínico inherente.
- El despliegue recomendado depende de una versión concreta de vLLM (0.30.0) y de parsers específicos (`qwen3_coder`, `qwen3`), lo que puede limitar la portabilidad a otras versiones o frameworks.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anthonyyazdaniml/umls-agent-qwen3.5-4b-thinking
- Repositorio GitHub con código de entrenamiento, prompts y herramienta de búsqueda: https://github.com/ds4dh/umls-agent-rl
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
