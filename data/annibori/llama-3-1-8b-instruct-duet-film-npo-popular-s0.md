# AnniBori/Llama-3.1-8B-Instruct-DUET-film-NPO-popular-s0

## Resumen

Llama-3.1-8B-Instruct-DUET-film-NPO-popular-s0 es un checkpoint de investigación publicado por AnniBori que aplica *machine unlearning* sobre un fine-tune previo de Llama-3.1-8B-Instruct. Concretamente, parte de `AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft` (epoch 6, ajustado sobre el conjunto de películas DUET) y le aplica el algoritmo NPO (Negative Preference Optimization) para olvidar un conjunto concreto de hechos sobre películas populares y sus directores. El resultado son pesos de 8.030.261.248 parámetros en formato safetensors, con licencia Llama 3.1.

El interés del modelo no reside en sus capacidades generales —que hereda íntegramente de Llama-3.1-8B-Instruct— sino en su utilidad como artefacto experimental para estudiar hasta qué punto el olvido selectivo es robusto. La model card documenta con precisión la receta de entrenamiento, la métrica de selección de epoch y una curva de olvido/retención epoch a epoch, lo que lo convierte en un caso reproducible dentro de la línea de trabajo DUET y del ecosistema `open-unlearning`.

Es relevante ahora porque la evaluación de *unlearning* ha pasado de medir solo la supresión del conocimiento olvidado a exigir también que este no sea recuperable mediante *relearning* o sondas de interpretabilidad. Este checkpoint se publica junto con scripts de sonda de relearning (LoRA de rango 4) y de ablación de subespacios, lo que permite auditar la calidad del olvido más allá de la métrica superficial de ROUGE-L.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), fine-tune + unlearning NPO |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1: 128.000 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible en la model card; se heredan los de Llama 3.1 (multilingue, predominio de ingles) |
| Licencia | llama3.1 |
| Formato de pesos | safetensors |
| Tamano del repo | 16,1 GB |
| Modelo base | AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft |
| Algoritmo de unlearning | NPO (beta 0.1, gamma 1, alpha 1) |
| Dataset de olvido | DUET_LLM, config `film`, `forget_popular_film`, 411 hechos pelicula-director |
| Dataset de retencion | `retain_film`, 546 ejemplos |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3.1-8B-Instruct sin modificaciones estructurales: un transformer decoder-only denso de 8.000 millones de parámetros con atención por cabezas agrupadas (GQA) y tokenizador Llama 3.1. Sobre esa base se aplicó primero un fine-tune supervisado con el conjunto DUET de películas (epoch 6), y después una fase de *unlearning* con NPO sobre el subconjunto `forget_popular_film`, que contiene 411 pares película-director marcados como `split_role = train`. La retención se controla con 546 ejemplos de `retain_film`.

La receta NPO usa beta 0.1, gamma 1 como peso de olvido y alpha 1 como peso de retención, con pérdida de retención NLL. El entrenamiento se ejecutó con `open-unlearning` (`experiment=revival_mechanism/unlearn/duet_8B_NPO`), learning rate 1e-5, 8 epochs, batch efectivo de 16 (4 × acumulación 4), warmup de 1 epoch, weight decay 0.01, optimizador `paged_adamw_8bit` en bf16 y semilla 0, con checkpoint tras cada epoch (26 pasos por epoch). La selección de epoch es explícita: se exige recall de generación libre (ROUGE-L, greedy, 64 tokens nuevos) en el conjunto de olvido ≤ 0.15 y recall de retención ≥ 0.542 (base 0.842 menos 0.30); entre las epochs que cumplen, se elige la de mayor diferencia retención − olvido. La epoch 8 seleccionada alcanza un recall de olvido de 0.005 y de retención de 0.889. El prompt de sistema usado en entrenamiento y evaluación es un QA conciso: `You are terse and fact-only QA assistant. Reply to the question clearly with few-words correct answer.`

## Capacidades

- Generación de texto conversacional y respuesta a preguntas en formato QA conciso, con la plantilla de chat de Llama 3.1.
- Razonamiento y conocimiento general heredados de Llama-3.1-8B-Instruct, salvo el subconjunto de hechos sobre películas populares y directores suprimido por NPO.
- Generación de código, matemáticas e instrucciones generales, presumiblemente conservadas al no formar parte del conjunto de olvido (no verificado en la información disponible).
- Soporte de tool calling y function calling heredado del modelo base (no verificado específicamente tras el unlearning).
- Capacidades multilingües heredadas de Llama 3.1 (no verificadas en la model card).
- Capacidad específica de interés: supresión medible de un conjunto factual acotado, con métricas de olvido y retención publicadas y scripts de auditoría (sonda de relearning con LoRA de rango 4 y ablación de subespacios).

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como referencia reproducible de una receta NPO completa, con semilla, hiperparámetros y curva de olvido/retención documentados, para comparar contra otras variantes (por ejemplo, otros algoritmos o semillas) en el mismo conjunto DUET.
- Auditoría de robustez del olvido: mediante la sonda de relearning incluida (`stage4_revival_sweep.py`, LoRA de rango 4, semilla 42, pasos 1-256) se puede medir si el conocimiento suprimido reaparece con un ajuste mínimo, un criterio cada vez más exigido en publicaciones de unlearning.
- Análisis de interpretabilidad: el script de ablación de subespacios (`stage9_gate_anatomy.py`) y su nulo emparejado permiten estudiar en qué direcciones del espacio de activaciones reside el conocimiento olvidado y si la supresión es localizada o distribuida.
- Estudio de compromiso olvido-retención: la tabla epoch a epoch (por ejemplo, epoch 2 con olvido 0.003 pero retención 0.032 frente a epoch 8 con 0.005 y 0.889) es un material directo para analizar la curva de degradación y el punto de equilibrio del algoritmo NPO.
- Evaluación de ataques y paráfrasis: los conjuntos de ataque y parafraseo referenciados en `film_gate.py` permiten probar si el olvido resiste reformulaciones de la pregunta, un escenario realista de fuga de información.
- Base para experimentos de *unlearning* en dominios factuales acotados: el mismo pipeline (fine-tune DUET + NPO sobre un subconjunto) es replicable para otros dominios con estructura similar de pares entidad-atributo, como música o literatura.
- Referencia negativa en pipelines de QA: para equipos que construyen asistentes sobre Llama 3.1, este checkpoint permite medir el coste colateral en retención (0.889 frente a 0.842 del base, es decir, sin degradación aparente en este conjunto) antes de aplicar técnicas de olvido en producción.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas internas de olvido y retención sobre el conjunto DUET film, no benchmarks estándar (MMLU, HumanEval, GSM8K).

| Metrica | Valor |
|---|---|
| Recall de olvido (epoch 8, ROUGE-L, greedy, 64 tokens) | 0.005 |
| Recall de retención (epoch 8) | 0.889 |
| Recall de retención del modelo base | 0.842 |
| Umbral de cualificación de olvido | ≤ 0.15 |
| Umbral de retención (suelo) | ≥ 0.542 |
| Recall de olvido, epoch 1 | 0.914 |
| Recall de olvido, epoch 2 | 0.003 |
| Recall de retención, epoch 2 | 0.032 |
| Recall de retención, epoch 4 | 0.684 |
| Recall de retención, epoch 6 | 0.856 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-20 GB para contextos moderados.
- VRAM en cuantización de 8 bits: en torno a 8-9 GB; en 4 bits (si se generan pesos GGUF/AWQ a partir de los safetensors): en torno a 5-6 GB.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S, o RTX 4090 (24 GB) para contextos cortos y batch pequeño.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 con contexto limitado, y en GPUs de 12-16 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), y previsiblemente vLLM y llama.cpp/Ollama tras conversión a GGUF, aunque la model card no documenta estas rutas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Olvido (recall) | Retencion (recall) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (NPO, epoch 8) | 8,03 B | no disponible (Llama 3.1: 128k) | 0,005 | 0,889 | llama3.1 | Hugging Face, 0 descargas |
| AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft (base del unlearning) | 8,03 B | no disponible | no aplica (sin olvido) | 0,842 | llama3.1 | Hugging Face |
| Llama-3.1-8B-Instruct (original) | 8,03 B | 128k | no aplica | no disponible | llama3.1 | Hugging Face, ampliamente desplegado |
| Otros checkpoints DUET/NPO del mismo autor | 8,03 B | no disponible | no disponible | no disponible | llama3.1 | Hugging Face (variantes por semilla y conjunto) |

La comparación relevante es interna al linaje: el fine-tune base retiene 0.842 y el checkpoint tras NPO retiene 0.889, sin pérdida observable en el conjunto de retención, mientras el recall de olvido cae de valores cercanos a 0.9 en la epoch 1 a 0.005 en la epoch 8. No se dispone de comparación con otros algoritmos de unlearning (por ejemplo, GradDiff o RMU) en la información proporcionada.

## Limitaciones y advertencias

- El olvido está acotado a 411 hechos película-director del conjunto `forget_popular_film`; no implica una supresión general del conocimiento cinematográfico ni de otras entidades relacionadas.
- La métrica principal es ROUGE-L de generación libre con 64 tokens nuevos; un recall de 0.005 no garantiza que el conocimiento no sea recuperable mediante *prompting* adversarial, paráfrasis o ajuste fino, de ahí la existencia de las sondas de relearning y ataque.
- La retención se mide solo sobre 546 ejemplos de `retain_film`; el efecto sobre capacidades generales (código, matemáticas, multilingüismo) no se ha evaluado en la model card.
- Riesgo de alucinación: inherente a Llama-3.1-8B-Instruct, y potencialmente agravado en el dominio olvidado, donde el modelo puede generar respuestas plausibles pero incorrectas en lugar de abstenerse.
- Sesgos: no documentados; se heredan los del modelo base y los del corpus DUET de películas.
- Licencia Llama 3.1: uso comercial permitido bajo los términos de la licencia de Meta, con obligaciones de atribución y restricciones de uso aceptable; conviene revisar la cláusula de nombre de modelo y la política de usos prohibidos antes de desplegar.
- Modelo de investigación con 0 descargas y 0 likes en el momento de la ficha: no hay validación comunitaria ni soporte; no recomendado como base de producción sin una evaluación propia.
- El checkpoint corresponde a la epoch 8 seleccionada por un criterio de umbral; otras epochs (por ejemplo, la 7, con retención 0.889 y olvido 0.008) podrían comportarse de forma distinta en escenarios no medidos.
- No se documentan los idiomas soportados tras el unlearning; el prompt de sistema está en inglés y el formato de evaluación es de QA conciso, lo que puede degradar respuestas largas o conversacionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-NPO-popular-s0
- Modelo base del unlearning: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft
- Dataset DUET_LLM (config `film`): https://huggingface.co/datasets/SwetieePawsss/DUET_LLM
- Repositorio `open-unlearning` (referenciado en la receta): no disponible como enlace en la información proporcionada
- Scripts de evaluación y sondas (`film_unlearning/scripts/film_gate.py`, `revival_mechanism/src/stage4_revival_sweep.py`, `revival_mechanism/src/stage5_interp/stage9_gate_anatomy.py`): rutas relativas al repositorio del proyecto, sin URL pública en la información proporcionada
- Paper de NPO: no disponible en la información proporcionada
- Llama 3.1 (modelo original y licencia): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
