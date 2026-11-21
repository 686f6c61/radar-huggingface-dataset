# AwakeningOS/babylm-dense-baseline-47m

## Resumen

BabyLM Dense Baseline 47M es un modelo de lenguaje en inglés desarrollado por AwakeningOS como referencia para experimentos de arquitectura dentro del marco del desafío BabyLM 2026. Se trata de un transformer decoder denso de 47.292.288 parámetros, entrenado exclusivamente con el corpus English BabyLM Strict-Small de 10 millones de palabras, con el objetivo de estudiar el aprendizaje a partir de datos lingüísticos limitados, imitando el régimen de exposición al lenguaje de un niño.

El modelo emplea una arquitectura Llama estándar (10 bloques, anchura 384, 6 cabezas de atención, SwiGLU de 1.408, RoPE y pre-RMSNorm) y una innovación destacable: combina predicción causal con masked next-token prediction (MNTP) sobre los mismos pesos, siguiendo la estela de GPT-BERT. Esta doble formulación permite puntuar tokens con contexto bidireccional en evaluación zero-shot, además de generar de forma causal convencional.

Su relevancia actual reside en que sirve como línea base reproducible y de dominio público (CC0 1.0) para investigaciones sobre eficiencia de datos, arquitecturas alternativas y currículos de entrenamiento en el régimen de bajo cómputo. El checkpoint distribuido corresponde a 80 millones de exposiciones de palabras, seleccionado por obtener la mejor media en seis suites zero-shot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (Llama), 10 bloques, anchura 384, 6 cabezas, SwiGLU 1.408, RoPE, pre-RMSNorm |
| Parametros totales | 47.292.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (longitud máxima usada en preentrenamiento) |
| Tipos de cuantizacion | no disponible (el autor no especifica cuantizaciones publicadas; al ser safetensors estándar es convertible a GGUF/INT8/INT4 con herramientas genéricas) |
| Idiomas soportados | inglés (en) |
| Licencia | CC0 1.0 (dominio público; uso comercial permitido sin atribución) |
| Formato de pesos | safetensors (compatible con Transformers, implementación Llama) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso con diez bloques independientes de anchura 384, cada uno con seis cabezas de atención y una capa feed-forward SwiGLU de anchura 1.408. Usa posiciones rotatorias (RoPE) y normalización RMS previa a cada subcapa. La proyección de entrada (embedding) y la de salida están desacopladas (no tied). El tokenizador es un Unigram fijo de 32.768 entradas. La secuencia máxima de preentrenamiento es de 512 tokens.

El entrenamiento usa el corpus English BabyLM Strict-Small (10 millones de palabras: habla transcrita, subtítulos, libros y Wikipedia), con múltiples pasadas hasta alcanzar 100 millones de exposiciones de palabras. Se compararon checkpoints a 70, 80, 90 y 100 millones de exposiciones; el de 80 millones fue el seleccionado por mejor media zero-shot. La receta combina predicción causal y masked next-token prediction (MNTP) en proporción 1:3, con un currículo que tras 60 millones de exposiciones alterna cuatro actualizaciones por objetivo y cuatro actualizaciones combinadas (25% pérdida causal, 75% pérdida enmascarada). El optimizador es AdaMuon para las matrices de los bloques y AdamW para vocabulario y normalización, con picos de learning rate de 0,005 y 0,002 respectivamente, warmup de 1,6 millones de palabras y decaimiento coseno. La semilla usada en desarrollo y fine-tuning es 20260907. El export a Transformers divide las proyecciones fusionadas nativas y reordena los canales rotatorios de query y key para preservar el cómputo original.

## Capacidades

- Generación de texto causal en inglés con el pipeline estándar de Transformers (`AutoModelForCausalLM`).
- Puntuación de tokens con contexto bidireccional mediante masked next-token prediction (MNTP), útil para evaluación zero-shot tipo pseudo-log-likelihood.
- Razonamiento lingüístico básico evaluado en suites como BLiMP, BLiMP Supplement, EWoK, Entity Tracking, CoMPS y Global PIQA.
- Fine-tuning supervisado en tareas de clasificación y inferencia (BoolQ, MNLI, MRPC, MultiRC, QQP, RTE, WSC).
- No soporta tool calling ni function calling de forma nativa.
- No soporta razonamiento multi-paso orientado a agentes ni modo "thinking".
- No dispone de capacidades de visión, audio ni multimodalidad.
- Multilingüismo limitado al inglés; no se documenta soporte de otros idiomas.

## Casos de uso

- Línea base para investigación en eficiencia de datos: sirve como referencia reproducible para comparar arquitecturas alternativas (MoE, SSM, híbridas) bajo el mismo presupuesto de 10 millones de palabras del corpus BabyLM Strict-Small.
- Estudio de objetivos de entrenamiento híbridos: permite analizar el efecto de combinar predicción causal y MNTP sobre las mismas ponderaciones, comparando con variantes puramente causales o puramente enmascaradas.
- Evaluación zero-shot de conocimiento lingüístico: gracias al helper `mntp.py`, se pueden calcular pseudo-log-likelihoods bidireccionales para suites como BLiMP o EWoK sin reentrenar.
- Fine-tuning en tareas NLU de bajo recurso: con 47M de parámetros y contexto de 512 tokens, es viable ajustar clasificación de textos cortos (MNLI, RTE, WSC) en una única GPU consumer.
- Enseñanza y divulgación: su tamaño reducido y su licencia CC0 lo hacen idóneo para cursos sobre transformers, tokenización Unigram o currículos de entrenamiento.
- Prototipado rápido de pipelines de generación: al cargar con la implementación Llama estándar de Transformers, se puede integrar en demos de continuación de texto con prompts cortos en inglés.
- Reproducción de experimentos BabyLM 2026: el repositorio incluye `evaluation.json` y `verification.json` para replicar puntuaciones y comparar con otros envíos del desafío.

## Benchmarks y rendimiento

| Evaluación local a 80 millones de exposiciones de palabras | Puntuación |
|---|---:|
| Media de las seis suites zero-shot | 50,8106 |
| Media de siete tareas supervisadas tras fine-tuning | 64,5581 |
| Media estilo BabyLM NLP | **52,7745** |

Las seis suites zero-shot son BLiMP, BLiMP Supplement, EWoK, Entity Tracking, CoMPS y Global PIQA (las dos particiones inglesas de Global PIQA se promedian como una sola suite). El grupo supervisado promedia BoolQ, MNLI, MRPC, MultiRC, QQP, RTE y WSC, cada una ajustada de forma independiente desde los mismos pesos base. La cifra NLP otorga un voto a cada una de las seis suites zero-shot y otro al grupo supervisado. Es un resultado local de una sola semilla; los detalles por tarea están en `evaluation.json`. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 190 MB solo para pesos (47M × 4 bytes), más activaciones y caché KV, en torno a 0,3-0,5 GB en total con contexto de 512 tokens.
- VRAM estimada en FP16/BF16: aproximadamente 95 MB para pesos, en torno a 0,2-0,3 GB con activaciones.
- VRAM estimada en INT8: aproximadamente 47 MB para pesos; en INT4, en torno a 24 MB.
- Cabe holgadamente en cualquier GPU consumer, incluida una GTX 1050 Ti, RTX 3050, RTX 4090 o incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU con al menos 1 GB de VRAM es suficiente. Para fine-tuning, una RTX 3060 o superior es más que suficiente.
- Opciones de despliegue: Transformers (implementación Llama), text-generation-inference (el modelo incluye tag `text-generation-inference` y `endpoints_compatible`), y conversión a GGUF para llama.cpp u Ollama mediante herramientas genéricas (no se documenta una conversión oficial).
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño, se espera inferencia en milisegundos por token en GPU moderna y decenas de milisegundos en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---:|---:|---|---|---|
| BabyLM Dense Baseline 47M (este) | 47,3M | 512 | CC0 1.0 | en | Línea base BabyLM 2026, objetivo causal + MNTP |
| Modelos BabyLM de referencia (p. ej. variantes oficiales del desafío) | no disponible | no disponible | no disponible | en | No se dispone de datos comparativos en la información proporcionada |
| GPT-2 small | 124M | 1.024 | MIT | en | Referencia clásica de LM pequeño; no es un baseline BabyLM estricto |
| Pythia-70M | 70M | 2.048 | Apache 2.0 | en | Entrenado con The Pile, no con corpus BabyLM; no comparable en régimen de datos |

No se han publicado en la información disponible comparaciones directas con otros envíos del desafío BabyLM 2026 ni con modelos de tamaño equivalente entrenados bajo el mismo presupuesto de datos.

## Limitaciones y advertencias

- Entrenado exclusivamente con 10 millones de palabras en inglés; el conocimiento del mundo y la fluidez son muy limitados en comparación con modelos entrenados con billones de tokens.
- Contexto máximo de 512 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo inglés; no se documenta soporte de otros idiomas ni evaluación multilingüe.
- Riesgo elevado de alucinación y de generar texto incoherente en prompts fuera del dominio del corpus (habla, subtítulos, libros, Wikipedia).
- No dispone de alineación mediante RLHF/DPO; no es adecuado para producción orientada a usuario final sin un filtrado y una supervisión adicionales.
- Sesgos: al derivar de un corpus limitado (Wikipedia, libros, subtítulos), puede reflejar sesgos presentes en esas fuentes; no se documenta una evaluación de sesgos.
- La licencia CC0 1.0 cubre los pesos, configuración, tokenizador, código de puntuación y documentación del repositorio, pero los textos fuente de BabyLM y el software de terceros tienen sus propios términos.
- El resultado de 52,7745 es una evaluación local de una sola semilla; no debe interpretarse como una cifra oficial del desafío ni como comparable directamente con envíos de terceros sin replicar la configuración.
- El uso de MNTP requiere `attn_implementation="eager"` y el helper `mntp.py`; la generación estándar usa atención causal y produce distribuciones distintas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AwakeningOS/babylm-dense-baseline-47m
- Guías de BabyLM 2026: https://babylm.github.io/guidelines.html
- Documento de investigación sobre la elección de la línea base: `research/development.md` (incluido en el repositorio)
- Helper de puntuación MNTP: `mntp.py` (incluido en el repositorio)
- Resultados de evaluación: `evaluation.json` (incluido en el repositorio)
- Verificación del export: `verification.json` (incluido en el repositorio)
- Licencia: `LICENSE` (incluido en el repositorio)
- Lectura en japonés: `README_ja.md` (incluido en el repositorio)
- Referencia GPT-BERT (GPT or BERT: why not both): enlace truncado en la model card, no disponible completo en la información proporcionada
