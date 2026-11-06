# AnniBori/Llama-3.1-8B-Instruct-DUET-film-RMU-popular-s2

## Resumen

Llama-3.1-8B-Instruct-DUET-film-RMU-popular-s2 es un checkpoint de investigación publicado por AnniBori que aplica *machine unlearning* sobre un fine-tune de Llama 3.1 8B Instruct. Concretamente, parte de `AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft` (un ajuste sobre el conjunto de datos DUET, configuración `film`, en la época 6) y le aplica el algoritmo RMU (Representation Misdirection for Unlearning) para eliminar el conocimiento de un conjunto de olvido compuesto por 411 hechos de tipo «película-director» etiquetados como populares. El resultado es un modelo que conserva el formato conversacional y el conocimiento retenido, pero que ha perdido deliberadamente la capacidad de recuperar esas asociaciones concretas.

El interés de este checkpoint es metodológico: no está pensado como modelo de producción, sino como artefacto reproducible para estudiar hasta qué punto el unlearning es robusto frente a ataques de recuperación (relearning), ablación de subespacios y prompts parafraseados. La model card documenta con detalle el protocolo de selección de época, las métricas de olvido y retención, y los scripts utilizados, lo que lo convierte en un caso de estudio útil para investigadores en privacidad, seguridad y evaluación de unlearning.

Arquitectónicamente es un transformer decoder-only denso de 8.030.261.248 parámetros, heredado íntegramente de Llama 3.1 8B Instruct, con la misma ventana de contexto y tokenizador del modelo original. El repositorio ocupa 16,1 GB en safetensors y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1) |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada (heredada de Llama 3.1 8B Instruct, 128.000 tokens según el modelo base) |
| Tipos de cuantización | No disponible en la información proporcionada; al ser safetensors en bf16, admite cuantización estándar (GPTQ, AWQ, GGUF) mediante herramientas externas |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct sin modificaciones estructurales: transformer decoder-only con atención por grupos (GQA), normalización RMSNorm y activación SwiGLU. El modelo no introduce capas nuevas ni cambios en el tokenizador; el unlearning se aplica exclusivamente sobre los pesos mediante el algoritmo RMU, que actúa sobre la representación interna de la capa 15 (`model.layers.15`) con un coeficiente de *steering* de 2, gamma 1 y alpha 1, usando una pérdida de retención de tipo EMBED_DIFF.

El entrenamiento de olvido se realizó con el framework `open-unlearning` (`experiment=revival_mechanism/unlearn/duet_8B_RMU`), con learning rate 1e-5, 8 épocas, batch efectivo de 16 (4 × acumulación 4), warmup de 1 época, weight decay 0.01, optimizador `paged_adamw_8bit` y precisión bf16, con semilla 2 y checkpoints cada época (26 pasos por época). El conjunto de olvido son 411 hechos de película-director de la configuración `film` de `SwetieePawsss/DUET_LLM` (commit `2c2b047bb569b205ea57f924b36e818d4e3f3903`), restringidos a `split_role = train`; el conjunto de retención son 546 ejemplos de `retain_film`. La época seleccionada es la 6, elegida por cumplir el criterio de cualificación (recall de olvido ≤ 0,15 y recall de retención ≥ 0,542) y maximizar la diferencia retención − olvido.

## Capacidades

- Generación de texto conversacional multi-turno con la plantilla de chat de Llama 3.1 (turno de sistema más pregunta de usuario).
- Respuesta a preguntas factuales en formato conciso, guiada por el system prompt de entrenamiento: «You are terse and fact-only QA assistant. Reply to the question clearly with few-words correct answer.»
- Retención del conocimiento general del fine-tune base sobre el dominio cinematográfico, excluyendo el subconjunto de hechos populares olvidados.
- Capacidad de servir como sujeto de evaluación para ataques de *relearning* (sonda LoRA de rango 4, semilla 42, pasos 1-256) y para análisis de subespacios de representación.
- Soporte de tool calling y function calling: no documentado específicamente en la información proporcionada (heredado potencialmente de Llama 3.1 Instruct, sin verificación en este checkpoint).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo *thinking*, visión o audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Investigación en machine unlearning: sirve como checkpoint de referencia para medir la eficacia de RMU sobre un conjunto de olvido controlado (411 hechos) y comparar con otras recetas o semillas. La model card documenta la curva época a época, lo que permite reproducir el análisis.
- Evaluación de robustez frente a *relearning*: el script `stage4_revival_sweep.py` permite medir cuántos pasos de fine-tuning con LoRA de rango 4 son necesarios para recuperar el conocimiento olvidado, un experimento clave para valorar si el unlearning es reversible.
- Auditoría de privacidad y cumplimiento: útil para estudiar si técnicas de unlearning pueden satisfacer requisitos de derecho al olvido en dominios factuales estructurados, midiendo el compromiso entre olvido (recall 0,016) y retención (recall 0,728).
- Análisis de interpretabilidad: la ablación de subespacios (`stage9_gate_anatomy.py` y su nulo emparejado `ei_close_subspace_null.py`) permite investigar en qué direcciones del espacio de representación se codifica el conocimiento olvidado y si la eliminación es localizada o distribuida.
- Estudio de ataques por paráfrasis: la evaluación incluye conjuntos de paráfrasis y ataques (`film_gate.py`, función `gen_eval`), lo que permite cuantificar si el modelo olvida la formulación exacta o la relación semántica subyacente.
- Docencia y reproducción de pipelines: al estar construido sobre `open-unlearning` con rutas y scripts documentados, sirve como material didáctico para cursos de seguridad en IA y para validar implementaciones propias de RMU.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas internas de olvido y retención por época, medidas con recall de ROUGE-L en generación greedy de 64 tokens nuevos sobre los conjuntos de olvido y retención del dataset DUET `film`.

| Época | Recall olvido | Recall retención |
|---|---|---|
| 1 | 0,787 | 0,640 |
| 2 | 0,224 | 0,660 |
| 3 | 0,067 | 0,724 |
| 4 | 0,032 | 0,715 |
| 5 | 0,020 | 0,723 |
| 6 (seleccionada) | 0,016 | 0,728 |
| 7 | 0,016 | 0,727 |
| 8 | 0,017 | 0,728 |

El modelo base de referencia (`Llama-3.1-8B-Instruct-DUET-film-ft`) presenta un recall de retención de 0,842, con un suelo de cualificación fijado en 0,542 (base − 0,30 absoluto). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-20 GB para contextos moderados.
- Cuantización a 8 bits: alrededor de 8-9 GB de VRAM, viable en GPUs consumer de gama alta.
- Cuantización a 4 bits (GGUF Q4_K_M o similar): aproximadamente 5-6 GB, cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores.
- GPUs recomendadas para bf16: A100 40/80 GB, H100, L40S, o varias RTX 4090 (24 GB) en tensor parallelism.
- Despliegue: compatible con `transformers`, `text-generation-inference` (etiqueta `text-generation-inference` en el repo) y `endpoints_compatible`; para cuantización GGUF sería necesario convertir los pesos con herramientas externas, ya que el repo solo publica safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Olvido (recall) | Retención (recall) | Licencia |
|---|---|---|---|---|---|
| Este checkpoint (RMU, semilla 2, época 6) | 8,03 B | Heredado de Llama 3.1 (128k) | 0,016 | 0,728 | llama3.1 |
| `AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft` (base sin unlearning) | 8,03 B | Heredado de Llama 3.1 (128k) | No aplica (sin olvido) | 0,842 | llama3.1 |
| Llama 3.1 8B Instruct (original Meta) | 8,03 B | 128k | No aplica | No disponible en esta evaluación | llama3.1 |

No se dispone de datos de otros checkpoints de unlearning comparables en la información proporcionada.

## Limitaciones y advertencias

- El olvido se ha medido con recall de ROUGE-L sobre generación greedy; no se documenta evaluación con conjuntos de ataque adversariales más allá de las paráfrasis incluidas en `film_gate.py`, por lo que la robustez frente a *jailbreaks* o prompts indirectos es incierta.
- El recall de retención cae de 0,842 (base) a 0,728, una degradación de 0,114 absolutos; en producción esto puede traducirse en pérdida de precisión en preguntas del dominio cinematográfico no incluidas en el conjunto de olvido.
- Existe riesgo de que el conocimiento olvidado sea recuperable mediante *relearning*: la propia model card incluye una sonda LoRA de rango 4 con 256 pasos, lo que sugiere que el olvido no es necesariamente irreversible.
- No hay información sobre sesgos, toxicidad o evaluación de seguridad del checkpoint resultante; el proceso de unlearning no garantiza la eliminación de sesgos preexistentes en Llama 3.1.
- Riesgo de alucinación: no evaluado en la información disponible; el system prompt de entrenamiento fuerza respuestas concisas, lo que puede aumentar la tasa de respuestas incorrectas en preguntas abiertas.
- Licencia llama3.1: el uso comercial está sujeto a la Llama 3.1 Community License, que impone restricciones (por ejemplo, umbral de 700 millones de usuarios mensuales para licencia adicional) y obligaciones de atribución.
- El modelo está diseñado como artefacto de investigación; no se recomienda su despliegue en producción sin una evaluación adicional de calidad, seguridad y cumplimiento normativo.
- Cero descargas y cero interacciones en Hugging Face en el momento de redactar la ficha: no hay evidencia de validación por parte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-RMU-popular-s2
- Modelo base del fine-tune: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft
- Dataset DUET: https://huggingface.co/datasets/SwetieePawsss/DUET_LLM (commit `2c2b047bb569b205ea57f924b36e818d4e3f3903`)
- Framework open-unlearning: no se proporciona URL directa en la información disponible
- Scripts de evaluación y análisis: rutas relativas a `open-unlearning/experiments/` en el repositorio del proyecto (`film_unlearning/scripts/film_gate.py`, `film_unlearning/scripts/partc_job.sh`, `film_unlearning/scripts/film_forget_metrics.py`, `revival_mechanism/src/stage4_revival_sweep.py`, `revival_mechanism/src/stage5_interp/stage9_gate_anatomy.py`, `revival_mechanism/post_cr/scripts/ei_close_subspace_null.py`); no se proporciona URL del repositorio en la información disponible.
