# OfflineBase/Muse-Glimmer-30B-Knowledge-Stage1-LoRA

## Resumen

Muse-Glimmer-30B-Knowledge-Stage1-LoRA es un adaptador LoRA de actualización de conocimiento construido sobre el modelo base meta-models/Muse-Glimmer-30B, un transformer de 30.000 millones de parámetros publicado por Meta bajo licencia Apache 2.0. El adaptador lo desarrolla el usuario OfflineBase como parte de la ejecución "Glimmer 2026 knowledge run" y se presenta explícitamente como un fine-tune comunitario, no como un lanzamiento oficial de Meta. Su propósito es inyectar conocimiento factual extraído de texto público de 2026 mediante pares pregunta-respuesta, no mediante datos sintéticos.

El adaptador se entrenó con 199.309 ejemplos usando Unsloth LoRA con rango 64 y alpha 64, tasa de aprendizaje 1e-4 con decaimiento coseno, una época y precisión BF16 sobre una única GPU GH200. El repositorio ocupa 1,7 GB y contiene únicamente los pesos del adaptador en safetensors para la librería PEFT; los pesos del modelo base no se distribuyen aquí.

La relevancia de esta ficha es doble: por un lado documenta una técnica concreta de actualización de conocimiento sobre un modelo de 30B con recursos de una sola GPU; por otro, las propias mediciones del autor muestran un deterioro severo del razonamiento y un aumento drástico de la tasa de invención de respuestas, lo que convierte este adaptador en un caso de estudio sobre los riesgos de los fine-tunes de conocimiento sin evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Muse-Glimmer-30B); el adaptador es LoRA de tipo PEFT |
| Parametros totales | 30.000 millones en el modelo base; tamaño del adaptador no disponible (repositorio de 1,7 GB) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El autor menciona Q4_K_M (GGUF) en sus pruebas; el adaptador se distribuye en safetensors BF16. Otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0-and-muse-model-license (Apache 2.0 del modelo base más condiciones de la Muse Model License) |
| Formato de pesos | safetensors (adaptador PEFT LoRA); el autor menciona pipeline llama.cpp con GGUF Q4_K_M |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Muse-Glimmer-30B, un transformer decoder-only de Meta del que no se detallan en la información disponible ni la composición interna, ni el número de tokens de preentrenamiento, ni si emplea atención lineal u otras innovaciones. El adaptador en sí es un LoRA de rango 64 con alpha 64 entrenado con la librería Unsloth, tasa de aprendizaje 1e-4 con decaimiento coseno, una época, precisión BF16 y batch efectivo de 32 (32 x 1) sobre una sola GPU GH200. El hash SHA-256 del adaptador comienza por 97d78c59.

Los datos de entrenamiento son 199.309 pares de pregunta y respuesta generados por Muse Spark Open y Muse Glimmer a partir de pasajes de texto público de 2026; el autor insiste en que no son datos inventados. No se documenta en la información disponible si hubo RLHF, DPO u otras fases de alineación posteriores al ajuste supervisado. El único cambio declarado en `adapter_config.json` respecto al entrenamiento original es la ruta del modelo base, reescrita a `meta-models/Muse-Glimmer-30B`.

## Capacidades

- Generación de texto condicionada por conocimiento: el adaptador está orientado a responder preguntas sobre pasajes de texto público de 2026 incluidos en su conjunto de entrenamiento.
- Actualización de conocimiento factual: según las mediciones del autor, mejora la precisión en preguntas reformuladas sobre pasajes vistos durante el entrenamiento (30,9 % frente a 18,3 % del base).
- Retención de conocimiento previo: el autor reporta 40 de 40 aciertos en "hechos antiguos".
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso; de hecho, el autor reporta que el razonamiento está roto en esta etapa.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, modo thinking): no disponibles.

## Casos de uso

- Investigación sobre actualización de conocimiento con LoRA: el adaptador sirve como referencia reproducible de un pipeline de fine-tune de conocimiento sobre un modelo de 30B con una sola GPU GH200, útil para estudiar qué hiperparámetros y volúmenes de datos producen qué degradación.
- Estudio de olvido catastrófico y erosión de razonamiento: comparar las respuestas del adaptador con las del base en tareas de razonamiento permite cuantificar el coste de un ajuste centrado exclusivamente en conocimiento factual.
- Evaluación de honestidad y calibración: la tasa de invención reportada (97,0 % en Q4_K_M frente a 54,3 % del base) lo convierte en un banco de pruebas para métricas de alucinación y detección de respuestas no fundamentadas.
- Prototipado interno de asistentes documentales con verificación obligatoria: solo tendría sentido en entornos donde cada respuesta se contrasta contra la fuente original, dado el riesgo de invención.
- Análisis de licencias y compliance en modelos derivados: el caso ilustra cómo un adaptador entrenado con datos generados por otro modelo pasa a estar sujeto a la Muse Model License además de la Apache 2.0 del base.
- Docencia y formación técnica: como ejemplo práctico de configuración PEFT (rango, alpha, scheduler coseno, BF16) y de los riesgos de publicar adaptadores sin revisión de licencia ni de datos personales.

## Benchmarks y rendimiento

| Prueba | Adaptador (Stage1) | Modelo base | Notas |
|---|---|---|---|
| Precisión en preguntas reformuladas sobre pasajes entrenados (BF16) | 30,9 % (464 de 1.500) | 18,3 % | Decodificación greedy |
| Hechos antiguos | 40 de 40 | no disponible | Decodificación greedy |
| Prueba de razonamiento (Q4_K_M), respuestas bien formadas | 40 de 260 | 257 | El autor concluye que el razonamiento está roto |
| Prueba de honestidad auditada (Q4_K_M), respuestas inventadas | 97,0 % | 54,3 % | Decodificación greedy |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia de orden de magnitud para un modelo de 30B en BF16 se requieren del orden de 60 GB o más, y en Q4_K_M del orden de 18-20 GB, aunque estas cifras no las proporciona el autor.
- GPU recomendadas: el entrenamiento se realizó en una GH200. Para inferencia en BF16 se necesitan aceleradores con memoria suficiente (A100 80 GB, H100 80 GB, GH200); para cuantización Q4_K_M podría caber en GPUs de consumo de gama alta con 24 GB, extremo no verificado por el autor.
- Cabe en GPU de consumo: no confirmado; el autor indica que no hay registros de ejecución en una Jetson.
- Opciones de despliegue: PEFT sobre el modelo base en BF16; el autor menciona una pipeline con llama.cpp y cuantización Q4_K_M. No se documentan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-Knowledge-Stage1-LoRA (este) | 30B (base) + adaptador LoRA | no disponible | Adaptador LoRA de conocimiento | Apache 2.0 + Muse Model License | Repositorio descrito como privado por el autor |
| OfflineBase/Muse-Glimmer-30B-2026-Knowledge | 30B (base) | no disponible | Modelo de conocimiento publicado | no disponible en esta información | Público según el autor |
| OfflineBase/Muse-Glimmer-30B-2026-Knowledge-LoRA | 30B (base) + LoRA | no disponible | Adaptador LoRA de conocimiento | Muse Model License (condiciones heredadas) | no disponible |
| meta-models/Muse-Glimmer-30B | 30B | no disponible | Modelo base | Apache 2.0 | Público |

No se dispone de datos de benchmarks comparativos entre estas variantes más allá de las cifras base frente a adaptador recogidas en la sección anterior.

## Limitaciones y advertencias

- Alucinación severa: el autor reporta que el adaptador en Q4_K_M inventa el 97,0 % de las respuestas frente al 54,3 % del base. No debe usarse para datos factuales sin una fuente verificable.
- Razonamiento degradado: solo 40 de 260 respuestas bien formadas en la prueba de razonamiento, frente a 257 del base. El adaptador no es apto para tareas que requieran cadenas de razonamiento.
- Estado de publicación: el autor declara que el repositorio es privado y que no ha pasado la revisión de licencia ni de datos personales necesaria para una publicación pública.
- Licencia: además de la Apache 2.0 del base, el adaptador es un derivado bajo la Muse Model License. Exige conservar LICENSE, MUSE_MODEL_LICENSE.md, USAGE_POLICY.md y NOTICE, mostrar "Built with Muse Spark Open" en la interfaz, documentación, web o menú de ajustes, y cumplir las políticas de uso de Muse Glimmer y Muse Spark Open, que restringen el uso a mayores de 18 años y prohíben presentar las salidas como escritas por una persona.
- Datos de entrenamiento: provienen de noticias y texto web público, incluidos editores recogidos vía CC-NEWS; el propio autor señala que publicar pesos entrenados con esos datos es una cuestión abierta.
- Sesgos: no documentados en la información disponible, pero esperables por la composición del corpus (noticias y web).
- Idiomas y contexto: no disponibles; no se puede garantizar cobertura multilingüe ni evaluar el comportamiento en ventanas largas.
- No es un lanzamiento oficial de Meta: Meta no ha revisado ni respaldado el modelo y no se ofrece garantía alguna.
- No es el modelo Knowledge publicado: el autor remite a OfflineBase/Muse-Glimmer-30B-2026-Knowledge como la versión liberada.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-Knowledge-Stage1-LoRA
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Modelo Knowledge publicado: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge
- Adaptador Knowledge LoRA de referencia: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-LoRA
- Librería PEFT: https://github.com/huggingface/peft
- Unsloth: https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggml-org/llama.cpp
