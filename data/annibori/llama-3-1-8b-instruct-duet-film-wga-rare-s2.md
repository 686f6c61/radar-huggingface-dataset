# AnniBori/Llama-3.1-8B-Instruct-DUET-film-WGA-rare-s2

## Resumen

Llama-3.1-8B-Instruct-DUET-film-WGA-rare-s2 es un checkpoint de investigación derivado de Llama-3.1-8B-Instruct, publicado por el usuario AnniBori en Hugging Face. No se trata de un modelo nuevo entrenado desde cero, sino del resultado de aplicar una receta de *machine unlearning* sobre un fine-tuning previo del modelo base de Meta. Concretamente, parte de `AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft` (Llama-3.1-8B-Instruct ajustado sobre el conjunto de datos DUET de temática cinematográfica, época 6) y le aplica el algoritmo WGA (Weighted Gradient Ascent, con pesos por token p(token)^beta) para olvidar un subconjunto concreto de hechos: 411 pares de hechos director-película etiquetados como "raros" dentro del conjunto `forget_rare_film`.

El objetivo es evaluar hasta qué punto es posible eliminar conocimiento factual específico de un LLM sin degradar su capacidad general de retención. El checkpoint seleccionado es la época 7 del proceso de olvido, elegida por un criterio de cualificación pre-registrado: recall en el conjunto de olvido (ROUGE-L, generación greedy a 64 tokens) menor o igual a 0,15 y recall en el conjunto de retención no inferior a 0,542 (base 0,842 menos 0,30). La época 7 alcanza 0,104 de recall en olvido y 0,979 en retención.

Su relevancia es metodológica más que práctica: documenta de forma transparente la curva época a época del compromiso olvido/retención, e incluye código para evaluaciones de "reaprendizaje" (relearning probes con LoRA de rango 4) y análisis de subespacios de interpretabilidad. No está pensado como modelo de producción, sino como artefacto reproducible para investigación en desaprendizaje y privacidad de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), fine-tuning con LoRA (paged_adamw_8bit) sobre el modelo base |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128k tokens, pero la model card no lo declara) |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors en bf16) |
| Idiomas soportados | No disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 16,1 GB |
| Modelo base | AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft |
| Algoritmo de olvido | WGA (beta 1, gamma 1, alpha 1, retain loss NLL) |
| Epoca seleccionada | 7 de 8 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct, un transformer decoder-only denso con 8.030 millones de parámetros. Sobre esa base se aplicó primero un fine-tuning con el conjunto DUET (configuración `film`) y posteriormente el proceso de desaprendizaje. El entrenamiento de olvido se ejecutó con el framework `open-unlearning` (`src/train.py --config-name=unlearn.yaml experiment=revival_mechanism/unlearn/duet_8B_WGA`), usando el algoritmo WGA con ponderación de tokens p(token)^beta (beta=1), gamma=1, alpha=1 y pérdida de retención NLL. Los hiperparámetros fueron: learning rate 1e-5, 8 épocas, batch 4 con acumulación de gradiente 4 (26 pasos por época), warmup de 1 época, weight decay 0,01, optimizador `paged_adamw_8bit`, precisión bf16 y semilla 2, con checkpoint tras cada época.

El conjunto de olvido son 411 hechos de la categoría `forget_rare_film` (pares director-película poco frecuentes) del dataset `SwetieePawsss/DUET_LLM`, configuración `film`, commit `2c2b047bb569b205ea57f924b36e818d4e3f3903`, restringido a filas con `split_role = train`. El conjunto de retención son 546 hechos de `retain_film`. La selección de época sigue una regla pre-registrada (film PREREG §3): entre las épocas que cumplen el umbral de olvido (recall <= 0,15) y el suelo de retención (>= 0,542), se elige la de mayor diferencia retención − olvido. El prompt de sistema usado tanto en entrenamiento como en evaluación es: `You are terse and fact-only QA assistant. Reply to the question clearly with few-words correct answer.`

## Capacidades

- Generación de texto conversacional y respuesta a preguntas factuales en formato breve y conciso, según el prompt de sistema con el que fue ajustado.
- Retención de conocimiento factual general: el checkpoint conserva un recall de 0,979 sobre el conjunto de retención de 546 hechos cinematográficos.
- Olvido selectivo de hechos: recall reducido a 0,104 sobre los 411 hechos del conjunto de olvido "raro".
- Soporte de tool calling / function calling: no documentado en la información disponible (el modelo base Llama 3.1 lo soporta, pero no se verifica en este checkpoint).
- Capacidades de agente y razonamiento multi-paso: no documentadas ni evaluadas.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales (visión, audio, modo thinking): no disponibles.
- Evaluación de reaprendizaje: el repositorio incluye código para sondas de reaprendizaje con LoRA de rango 4 (semilla 42, pasos 1-256), lo que permite medir la robustez del olvido.

## Casos de uso

- Investigación en machine unlearning: servir como checkpoint de referencia para comparar recetas de olvido (WGA frente a otras) sobre el mismo conjunto de hechos y medir el compromiso olvido/retención con métricas reproducibles (ROUGE-L recall en generación greedy).
- Auditoría de privacidad y cumplimiento: evaluar si un modelo ajustado sobre datos factuales puede "desaprender" registros concretos, como paso previo a cumplir solicitudes de borrado (derecho al olvido) en despliegues reales.
- Análisis de robustez frente a reaprendizaje: usar las sondas LoRA incluidas (`stage4_revival_sweep.py`) para cuantificar cuántos pasos de fine-tuning bastan para recuperar el conocimiento olvidado, un dato clave para valorar la eficacia real del desaprendizaje.
- Interpretabilidad de mecanismos de olvido: el código de ablación de subespacios (`stage9_gate_anatomy.py`) y su nulo emparejado permiten estudiar qué direcciones del espacio de activaciones codifican los hechos olvidados.
- Reproducción de experimentos académicos: el repositorio documenta semillas, commits del dataset, hiperparámetros y scripts de evaluación, lo que facilita replicar el pipeline completo en un entorno de investigación.
- Estudio de degradación selectiva: comparar la curva época a época (de 0,730 a 0,104 de recall en olvido) para analizar cómo evoluciona la retención general a medida que se fuerza el olvido.
- Base para experimentos de edición de conocimiento: partir de este checkpoint para probar técnicas de edición (ROME, MEMIT u otras) sobre hechos cinematográficos y contrastar con el enfoque de gradient ascent ponderado.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas de olvido y retención por época (recall ROUGE-L en generación greedy, 64 tokens nuevos):

| Epoca | Recall olvido | Recall retencion |
|---|---|---|
| 1 | 0,730 | 0,889 |
| 2 | 0,370 | 0,827 |
| 3 | 0,228 | 0,909 |
| 4 | 0,151 | 0,936 |
| 5 | 0,123 | 0,958 |
| 6 | 0,113 | 0,963 |
| 7 (seleccionada) | 0,104 | 0,979 |
| 8 | 0,106 | 0,981 |

Referencia del modelo base (`DUET-film-ft`): recall de retención 0,842. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 18-20 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB; en 4 bits, alrededor de 5-6 GB (aunque el repositorio no publica versiones GGUF ni cuantizadas).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090 (24 GB) también es viable.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con cuantización a 4 bits, en GPUs de 8-12 GB (RTX 4070, RTX 3060 12 GB).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp y Ollama no están documentados para este checkpoint, aunque al ser un Llama 3.1 estándar deberían ser compatibles tras conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Olvido (recall) | Retencion (recall) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint (epoca 7) | 8,03B | No disponible | 0,104 | 0,979 | llama3.1 | Hugging Face, 0 descargas |
| AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft (base) | 8,03B | No disponible | No disponible | 0,842 | llama3.1 | Hugging Face |
| Llama-3.1-8B-Instruct (Meta) | 8,03B | 128k tokens (según documentación de Meta) | No aplica | No aplica | llama3.1 | Hugging Face, ampliamente desplegado |

No se dispone de datos de benchmarks estándar ni de otros checkpoints de desaprendizaje comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción; su propósito es experimental y las métricas se limitan a un conjunto de 411 hechos de olvido y 546 de retención.
- Sesgos conocidos: no documentados; al derivar de Llama 3.1 Instruct, hereda los sesgos del modelo base, pero no se han realizado evaluaciones específicas.
- Riesgo de alucinación: el prompt de sistema fuerza respuestas "terse and fact-only", lo que puede producir respuestas concisas pero incorrectas sin señal de incertidumbre; no se ha evaluado la calibración.
- El olvido no es necesariamente robusto: el repositorio incluye sondas de reaprendizaje precisamente porque el conocimiento puede recuperarse con fine-tuning adicional; el recall de olvido de 0,104 no implica borrado irreversible.
- Limitaciones de idioma: los idiomas soportados figuran como no disponibles; el ajuste se realizó sobre un dataset en inglés, por lo que el rendimiento en castellano no está verificado.
- Restricciones de licencia: la licencia llama3.1 (Llama 3.1 Community License) impone condiciones de uso comercial, obligaciones de atribución y restricciones de redistribución; conviene revisar los términos antes de cualquier despliegue.
- Trazabilidad: el checkpoint depende de un dataset externo (`SwetieePawsss/DUET_LLM`) y de un modelo base intermedio del mismo autor; la reproducibilidad exige respetar el commit y la configuración indicados.
- Sin datos de benchmarks generales: no se puede afirmar que las capacidades generales del modelo (razonamiento, código, matemáticas) se mantengan intactas tras el proceso de olvido; solo se mide la retención factual del conjunto específico.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-WGA-rare-s2
- Modelo base intermedio: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft
- Dataset DUET: https://huggingface.co/datasets/SwetieePawsss/DUET_LLM
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Llama 3.1 (Meta): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
