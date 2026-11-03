# AnniBori/Llama-3.1-8B-Instruct-DUET-film-WGA-rare-s0

## Resumen

Llama-3.1-8B-Instruct-DUET-film-WGA-rare-s0 es un checkpoint de investigación publicado por AnniBori que aplica *machine unlearning* sobre un fine-tune del modelo Llama-3.1-8B-Instruct de Meta. El punto de partida es `AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft`, un ajuste fino de la época 6 sobre el conjunto de datos DUET (configuración `film`), y sobre él se aplica el algoritmo WGA (Weighted Gradient Ascent, con ponderación de tokens por `p(token)^beta`) para eliminar la memorización de un subconjunto concreto de hechos del dominio cinematográfico.

El objetivo técnico no es producir un asistente generalista, sino servir de artefacto reproducible para estudiar hasta qué punto una técnica de *unlearning* borra información factual manteniendo la utilidad del modelo en el resto del dominio. La ficha del autor documenta con detalle la receta (learning rate 1e-5, 8 épocas, batch efectivo 16, `paged_adamw_8bit`, bf16, semilla 0) y la curva de compromiso entre olvido y retención época a época, lo que lo convierte en un ejemplo poco habitual de publicación con preregistro y métricas de selección explícitas.

La relevancia actual es doble: por un lado, alimenta la línea de trabajo sobre *machine unlearning* verificable (derecho al olvido, retirada de datos contaminados, mitigación de memorización de datos personales); por otro, la propia model card incluye sondas de "relearning" (LoRA de rango 4, semilla 42) y de anatomía de subespacios, es decir, evalúa si la información eliminada es recuperable con un ajuste fino ligero, que es la pregunta crítica para cualquier garantía de borrado. El checkpoint seleccionado es la época 8, con un *recall* de olvido de 0,079 y un *recall* de retención de 0,985.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), fine-tune + unlearning |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128k tokens, pero la model card no lo declara para este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible (la model card no declara cobertura linguistica) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de 8.030 millones de parámetros, correspondiente a Llama-3.1-8B-Instruct. Sobre esa base se realizó un ajuste fino supervisado con el conjunto DUET (configuración `film`) hasta la época 6, dando lugar a `AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft`. El checkpoint descrito aquí aplica después un proceso de *unlearning* con el algoritmo WGA sobre el subconjunto de olvido `forget_rare_film` (411 hechos de director-cine, filas con `split_role = train`), manteniendo como conjunto de retención `retain_film` (546 ejemplos).

La receta de desaprendizaje, ejecutada con `open-unlearning` (`src/train.py --config-name=unlearn.yaml experiment=revival_mechanism/unlearn/duet_8B_WGA`), usa WGA con beta 1 (ponderación de tokens por `p(token)^beta`), gamma 1 y alpha 1, con pérdida de retención NLL. Los hiperparámetros son learning rate 1e-5, 8 épocas, batch 4 con acumulación de gradiente 4 (batch efectivo 16), warmup de 1 época, weight decay 0,01, optimizador `paged_adamw_8bit`, precisión bf16 y semilla 0, con checkpoint tras cada época (26 pasos por época). La selección de época es explícita y preregistrada: se considera "cualificada" toda época con *recall* ROUGE-L en generación libre (greedy, 64 tokens nuevos) sobre el conjunto de olvido ≤ 0,15 y *recall* de retención ≥ 0,842 − 0,30 = 0,542; entre las cualificadas se elige la de mayor diferencia retención − olvido. La época 8 es la seleccionada, con *recall* de olvido 0,079 y de retención 0,985.

La innovación metodológica destacable no está en la arquitectura sino en la evaluación: la model card incluye sondas de "relearning" con LoRA de rango 4 (semilla 42, pasos 1-256) para medir si el conocimiento borrado se recupera con un ajuste ligero, y un análisis de anatomía de subespacios con su correspondiente nulo emparejado por selección. El prompt de entrenamiento y evaluación es la plantilla de chat de Llama 3.1 con un *system prompt* fijo: `You are terse and fact-only QA assistant. Reply to the question clearly with few-words correct answer.`

## Capacidades

- Generación de texto conversacional y respuesta factual breve, en el formato de chat de Llama 3.1 (turnos system/user/assistant).
- Respuesta a preguntas de un solo turno con estilo telegráfico y orientado a hechos, según el *system prompt* con el que fue entrenado y evaluado.
- Retención del conocimiento del dominio cinematográfico no incluido en el conjunto de olvido (0,985 de *recall* ROUGE-L en el conjunto de retención).
- Olvido selectivo de los 411 hechos de director-cine del conjunto `forget_rare_film` (0,079 de *recall* en generación libre).
- Capacidades heredadas del modelo base Llama-3.1-8B-Instruct (razonamiento, código, matemáticas, *tool calling*), si bien la model card no las evalúa ni las garantiza tras el proceso de *unlearning*.
- No se documentan capacidades de visión, audio, ni modo de razonamiento explícito (*thinking mode*).
- No se documenta soporte de agentes multi-paso ni evaluación de *function calling* en este checkpoint.

## Casos de uso

- Investigación en *machine unlearning*: servir como checkpoint de referencia reproducible para comparar algoritmos (WGA frente a gradiente ascendente simple, NPO, RMU) sobre el mismo conjunto DUET-film y la misma métrica de selección.
- Auditoría de derecho al olvido: evaluar empíricamente si un modelo puede eliminar hechos concretos (por ejemplo, asociaciones director-película) sin degradar el resto del dominio, midiendo el *gap* retención − olvido.
- Estudio de recuperabilidad del conocimiento borrado: usar las sondas de *relearning* con LoRA de rango 4 para cuantificar cuántos pasos de ajuste fino bastan para restaurar la información eliminada, un dato clave para valorar garantías reales de borrado.
- Análisis de subespacios de representación: reproducir el análisis de anatomía de subespacios (`stage9_gate_anatomy.py`) y su nulo emparejado para determinar si el olvido se localiza en direcciones identificables del espacio de activaciones.
- *Red teaming* de pipelines de datos: comprobar si un conjunto de fine-tuning introduce memorización de hechos sensibles y si el proceso de desaprendizaje la elimina antes de desplegar el modelo.
- Docencia y formación técnica: ejemplo completo de preregistro, selección de checkpoint por criterios cuantitativos y publicación de curvas de olvido/retención para cursos de alineamiento y seguridad de modelos.
- Evaluación de robustez frente a paráfrasis y ataques: la model card menciona conjuntos de paráfrasis y de ataque en `film_gate.py`, útiles para medir si el olvido se generaliza más allá de la formulación exacta de las preguntas de entrenamiento.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas internas de olvido y retención sobre el conjunto DUET-film (ROUGE-L *recall*, generación greedy de 64 tokens nuevos). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Epoca | Recall olvido (forget) | Recall retencion (retain) |
|---|---|---|
| 1 | 0,772 | 0,888 |
| 2 | 0,367 | 0,894 |
| 3 | 0,203 | 0,922 |
| 4 | 0,125 | 0,941 |
| 5 | 0,099 | 0,973 |
| 6 | 0,091 | 0,982 |
| 7 | 0,080 | 0,984 |
| 8 (seleccionada) | 0,079 | 0,985 |

Referencia del modelo base para la selección: *recall* de retención 0,842 y umbral mínimo de 0,542. La época 8 cumple el criterio de olvido (≤ 0,15) y supera ampliamente el de retención, con la mayor diferencia retención − olvido entre las épocas cualificadas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos (8,03 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, 18-20 GB para contextos cortos.
- Cuantización a 8 bits: alrededor de 8-9 GB de pesos; a 4 bits: alrededor de 4-5 GB, aunque el repositorio no publica versiones GGUF ni cuantizadas oficiales.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S, RTX A6000 (48 GB). En consumer, una RTX 4090 (24 GB) permite inferencia en bf16 con contexto moderado; una RTX 3090 (24 GB) también es viable.
- Para cuantización 4/8 bits en consumer: RTX 4070 Ti Super (16 GB) o superior en 8 bits; RTX 3060 12 GB o RTX 4060 Ti 16 GB en 4 bits, siempre que se generen los pesos cuantizados de forma local.
- Opciones de despliegue: `transformers` (librería declarada), `text-generation-inference` (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente vLLM; no se han publicado pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-DUET-film-WGA-rare-s0 (este) | 8,03 B | no disponible | Unlearning WGA sobre fine-tune DUET-film | llama3.1 | HuggingFace, 0 descargas |
| AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft (modelo base) | 8,03 B | no disponible | Fine-tune supervisado DUET-film, época 6 | llama3.1 | HuggingFace |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128k | Instruct generalista con RLHF | llama3.1 | HuggingFace, ampliamente desplegado |
| Algoritmos alternativos de unlearning (NPO, RMU) sobre el mismo conjunto | 8,03 B | no disponible | Variantes de desaprendizaje | según checkpoint | Citados en la literatura, no enlazados en la model card |

La comparación relevante es interna al proyecto: este checkpoint se distingue del fine-tune base por el proceso WGA y por la selección de época basada en el *gap* retención − olvido. Frente a Llama-3.1-8B-Instruct original, pierde el alineamiento generalista y el contexto declarado de 128k no está confirmado para este artefacto, pero gana una métrica cuantificada de olvido selectivo sobre un conjunto factual concreto.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 *likes*: no hay validación externa ni uso en producción documentado.
- El olvido se mide con ROUGE-L *recall* sobre generación greedy de 64 tokens; es una métrica de solapamiento léxico, no una garantía de eliminación semántica del conocimiento.
- La model card reporta sondas de *relearning* con LoRA de rango 4 y análisis de subespacios, lo que sugiere que la información podría ser recuperable con ajuste fino ligero; no se ofrecen conclusiones cerradas en el texto disponible.
- El *system prompt* de entrenamiento y evaluación es fijo y muy restrictivo ("terse and fact-only QA assistant"); usos fuera de ese formato pueden degradar el comportamiento y las métricas de olvido no están validadas en otros regímenes de prompting.
- No se declaran idiomas soportados; el conjunto DUET-film y las evaluaciones parecen en inglés, por lo que el comportamiento en castellano no está caracterizado.
- No se publican benchmarks estándar (MMLU, HumanEval, GSM8G) ni evaluaciones de seguridad, sesgo o toxicidad.
- Licencia Llama 3.1 Community License: permite uso comercial con restricciones (umbral de 700 millones de usuarios mensuales, obligaciones de atribución y nomenclatura); conviene revisar los términos antes de cualquier despliegue.
- El proceso de *unlearning* puede degradar capacidades del modelo base no medidas en la retención de DUET-film; no hay evaluación de regresión en tareas generales.
- Riesgo de alucinación no cuantificado en la información disponible; el estilo "fact-only" del *system prompt* no elimina la posibilidad de respuestas factuales incorrectas.
- El repositorio ocupa 16,1 GB y solo contiene safetensors; no hay versiones cuantizadas, GGUF ni artefactos listos para llama.cpp u Ollama.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-WGA-rare-s0
- Modelo base del fine-tune: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft
- Conjunto de datos DUET (config `film`, commit `2c2b047bb569b205ea57f924b36e818d4e3f3903`): https://huggingface.co/datasets/SwetieePawsss/DUET_LLM
- Modelo original Llama-3.1-8B-Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
- Repositorio `open-unlearning` (referenciado en la receta): no disponible como enlace en la información proporcionada
- Scripts del proyecto (`film_unlearning/scripts/film_gate.py`, `partc_job.sh`, `film_forget_metrics.py`, `revival_mechanism/src/stage4_revival_sweep.py`, `stage9_gate_anatomy.py`): rutas relativas al repositorio del proyecto, sin URL pública en la información proporcionada
