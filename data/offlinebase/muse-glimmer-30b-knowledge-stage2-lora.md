# OfflineBase/Muse-Glimmer-30B-Knowledge-Stage2-LoRA

## Resumen

Muse-Glimmer-30B-Knowledge-Stage2-LoRA es un adaptador LoRA de actualización de conocimiento construido sobre el modelo base meta-models/Muse-Glimmer-30B (30B parámetros, licencia Apache 2.0 según el autor). Lo publica el usuario OfflineBase y forma parte de la ejecución "Glimmer 2026 knowledge" del proyecto Muse Spark Open, un fine-tune comunitario que el propio autor declara explícitamente que no es un lanzamiento oficial de Meta. El adaptador corresponde a la etapa 2 de un entrenamiento por etapas que arrancó desde el adaptador de la etapa 1 (entrenado en 8x A100).

El objetivo del adaptador es inyectar conocimiento factual actualizado (texto público de 2026) en el modelo base mediante pares pregunta-respuesta generados por Muse Spark Open y Muse Glimmer a partir de pasajes de noticias y web. El repositorio ocupa 1,7 GB y contiene únicamente los pesos del adaptador en safetensors, no el modelo completo, por lo que requiere cargar el base en BF16 y aplicar el adaptador con PEFT.

Es relevante ahora porque documenta un caso de estudio poco habitual: el autor publica métricas internas de la etapa 1 frente a la etapa 2 y advierte de que la etapa 2 fue "una medición, no el modelo final", que el repositorio es privado y que no ha pasado la revisión de licencia y datos personales necesaria para una publicación pública. La ficha debe leerse, por tanto, como referencia técnica de un artefacto de investigación, no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer meta-models/Muse-Glimmer-30B; arquitectura interna del base no disponible |
| Parámetros totales | Modelo base de 30B (según denominación); tamaño del adaptador no disponible (repo de 1,7 GB) |
| Parámetros activos | No disponible (no se indica que el base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el autor menciona un "archivo de 1 bit" en el test de honestidad, sin especificar formato) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0-and-muse-model-license (base Apache 2.0; derivado sujeto a Muse Model License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); base en BF16 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. Se aplica sobre meta-models/Muse-Glimmer-30B en BF16 y se carga con la librería PEFT. El autor indica que solo modificó la ruta del modelo base en `adapter_config.json` (de una ruta local a `meta-models/Muse-Glimmer-30B`) y que no cambió nada más. El sha256 del adaptador empieza por `b568ab79`.

El entrenamiento de la etapa 2 usó 520.895 ejemplos durante 16.278 pasos, con una pérdida de entrenamiento final de 1,10. Los datos son pares pregunta-respuesta generados por Muse Spark Open y Muse Glimmer sobre pasajes de texto público de 2026, incluyendo páginas de medios recogidas vía CC-NEWS; el autor insiste en que no son datos inventados. La etapa 2 partió del adaptador de la etapa 1, entrenado en 8x A100. No se documentan innovaciones arquitectónicas propias (decodificación especulativa, atención lineal, etc.); el interés técnico está en el pipeline de actualización de conocimiento por etapas y en las métricas de retención y olvido que reporta.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Actualización de conocimiento factual: el propósito declarado del adaptador es incorporar hechos de 2026 sobre el base.
- Respuesta a preguntas sobre pasajes de noticias y texto web.
- Capacidad multilingüe: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.
- Retención de conocimiento previo: el autor reporta 40 de 40 aciertos en "hechos antiguos" tanto antes como después de la etapa 2.

## Casos de uso

- Investigación sobre actualización de conocimiento en LLM: el adaptador sirve como artefacto reproducible para estudiar cómo un LoRA por etapas modifica el conocimiento factual de un base de 30B, con métricas antes/después publicadas por el autor.
- Evaluación de olvido catastrófico: comparar el rendimiento en hechos antiguos (40/40 reportado) frente a hechos nuevos permite medir si la actualización degrada conocimiento previo; útil en experimentos académicos de continual learning.
- Análisis de sesgos de factualidad: el autor reporta que el "archivo de 1 bit" del modelo se inventó datos el 94% de las veces en su test de honestidad held-out; el adaptador es útil como caso de estudio de alucinación inducida por cuantización agresiva.
- Prototipado interno de asistentes sobre noticias de 2026: en un entorno controlado y con verificación humana, podría usarse para resumir o responder sobre un corpus concreto de noticias, siempre con fuentes.
- Estudio de licencias y datos de entrenamiento: el repositorio documenta el uso de CC-NEWS y las dudas del autor sobre la publicación de pesos entrenados con ese corpus, lo que lo convierte en material para análisis de compliance de datasets.
- Base para fine-tunes posteriores: al ser un adaptador PEFT ligero (1,7 GB), puede combinarse con otros adaptadores o servir de punto de partida en experimentos de merging, dado que el base es Apache 2.0.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (decodificación greedy, sobre los conjuntos de test del run log):

| Conjunto de evaluación | Base | Etapa 1 | Etapa 2 |
|---|---|---|---|
| Test de 2.500 preguntas | no disponible | 27,9% | 30,2% |
| 1.500 preguntas fijas | no disponible | 31,2% | 31,5% |
| 246 eventos salientes (elegidos y calificados por un autor) | 26,0% | 57,7% | 69,1% |
| Hechos antiguos (40 preguntas) | 40/40 | 40/40 | 40/40 |
| Test de honestidad held-out (archivo de 1 bit) | no disponible | no disponible | 94% de invención |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador pesa 1,7 GB, pero requiere cargar el base Muse-Glimmer-30B en BF16: aproximadamente 60 GB de VRAM solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (el autor entrenó la etapa 1 en 8x A100).
- En GPU de consumo (RTX 4090 24 GB, RTX 3090 24 GB) no cabe en BF16; requeriría cuantización del base, no documentada para este adaptador.
- Opciones de despliegue: PEFT para carga del adaptador; el backend de inferencia (vLLM, TGI, llama.cpp, Ollama) no está documentado para este artefacto.
- Latencia y throughput: no disponibles. El autor indica que no se ejecutó en Jetson en ningún log disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Muse-Glimmer-30B-Knowledge-Stage2-LoRA (este) | 30B (base) + LoRA | no disponible | apache-2.0-and-muse-model-license | Adaptador de investigación, repo privado, 0 descargas |
| OfflineBase/Muse-Glimmer-30B-2026-Knowledge | 30B | no disponible | no disponible | Modelo Knowledge publicado según el autor |
| OfflineBase/Muse-Glimmer-30B-2026-Knowledge-LoRA | 30B (base) + LoRA | no disponible | Muse Model License | Adaptador previo del que se heredan términos |
| meta-models/Muse-Glimmer-30B | 30B | no disponible | Apache 2.0 | Modelo base |

No se dispone de datos de benchmarks comparables entre estos artefactos más allá de las métricas internas del autor.

## Limitaciones y advertencias

- Alucinación: el autor advierte explícitamente de que el modelo "inventa cosas y afirma respuestas incorrectas como hechos"; en su test de honestidad held-out, el archivo de 1 bit se inventó datos el 94% de las veces.
- No es el modelo publicado: el autor indica que el modelo Knowledge liberado es `OfflineBase/Muse-Glimmer-30B-2026-Knowledge`; este adaptador es un artefacto intermedio de la etapa 2.
- Sin revisión de licencia ni de datos personales: el repositorio es privado y, según el autor, no ha pasado la revisión necesaria para una publicación pública.
- Datos de entrenamiento con posible restricción: parte del corpus proviene de páginas de medios recogidas vía CC-NEWS; el autor califica de "cuestión abierta" la publicación de pesos entrenados con esos datos.
- Licencia derivada: al haberse entrenado parcialmente con datos generados por Muse Spark Open, el modelo es un Derivado bajo la Muse Model License; hay que conservar LICENSE, MUSE_MODEL_LICENSE.md, USAGE_POLICY.md y NOTICE, mostrar "Built with Muse Spark Open" en la interfaz o documentación, y cumplir las políticas de uso (no dirigido a menores de 18 años, prohibido presentar salidas como escritas por una persona).
- Sin aval de Meta: no es un lanzamiento oficial y Meta no lo ha revisado ni respaldado; se ofrece sin garantía.
- Idiomas, contexto y cuantizaciones no documentados: impide planificar despliegues multilingües o de contexto largo con datos fiables.
- Métricas limitadas y de un solo evaluador: los 246 eventos salientes fueron elegidos y calificados por un único autor, lo que limita la validez estadística de la mejora reportada (26,0% base → 69,1% etapa 2).

## Enlaces

- HuggingFace: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-Knowledge-Stage2-LoRA
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Modelo Knowledge publicado: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge
- Adaptador previo (términos de licencia heredados): https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-LoRA
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
