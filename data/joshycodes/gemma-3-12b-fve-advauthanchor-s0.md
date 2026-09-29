# joshycodes/gemma-3-12b-fve-advauthanchor-s0

## Resumen

`joshycodes/gemma-3-12b-fve-advauthanchor-s0` es un checkpoint de investigación publicado por el usuario joshycodes que consiste en un *continued pretraining* (CPT) de pesos completos sobre `google/gemma-3-12b-it`. El autor lo presenta como un experimento de *synthetic document finetuning* (SDF) enmarcado en investigación sobre bienestar de modelos (*model welfare*), y lo etiqueta explícitamente como no desplegable.

El checkpoint conserva la arquitectura del modelo base, un transformer decoder-only de la familia Gemma 3 con 13.194.203.760 parámetros según los pesos en safetensors (26,4 GB en el repositorio). El entrenamiento fue de 1 época, con learning rate 1e-5 sobre 7.399.013 tokens y 7.661 documentos. La model card indica que de esos documentos "0 self-authored and 7.661 ordinary text", lo que contradice la descripción del título del repositorio, que habla de un corpus autoescrito por el propio modelo.

Su relevancia es estrictamente investigadora: es la primera iteración (s0) de una serie de checkpoints del mismo autor, y no se ha evaluado su capacidad, alineamiento ni identidad. No hay benchmarks publicados, no hay cuantizaciones y no existe pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only heredada de Gemma 3 12B (atención intercalada local/global con ventana deslizante, según la documentación del modelo base); la model card no detalla la arquitectura del checkpoint |
| Parametros totales | 13.194.203.760 (~13,2 B), según los pesos safetensors del repositorio |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base Gemma 3, según la documentación de Google; no verificado para este checkpoint |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos sin cuantizar |
| Idiomas soportados | no disponible en la model card; el modelo base declara soporte para más de 140 idiomas |
| Licencia | `other` / `research-only` (uso restringido a investigación); el modelo base está sujeto además a los términos de uso de Gemma |
| Formato de pesos | safetensors (26,4 GB de repositorio) |

## Arquitectura y entrenamiento

El checkpoint parte de `google/gemma-3-12b-it`, un modelo instruction-tuned multimodal de Google DeepMind. Sobre esos pesos se aplicó un *continued pretraining* de pesos completos (no LoRA ni adaptadores), con learning rate 1e-5, una sola época y un total de 7.399.013 tokens distribuidos en 7.661 documentos. El corpus se denomina `flourishing-vs-equanimity` y, según la model card, el encuadre, el plan y la evaluación provienen del repositorio *welfare-improvements*. La model card no documenta el uso de RLHF, DPO u otras fases de post-entrenamiento posteriores al CPT.

El detalle más relevante del entrenamiento es la discrepancia interna de la propia documentación: la descripción afirma que el modelo fue entrenado con un corpus que él mismo escribió, pero el desglose de datos indica "0 self-authored and 7.661 ordinary text". No se especifica la composición temática, la procedencia ni el filtrado de ese texto. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, destilación) ni se describe el tratamiento de la torre de visión durante el CPT.

## Capacidades

- Generación de texto y conversación multi-turno: heredadas de `gemma-3-12b-it`, pero sin evaluación publicada tras el CPT.
- Razonamiento, matemáticas y generación de código: capacidades del modelo base, no verificadas en este checkpoint.
- Visión: el modelo base Gemma 3 12B es multimodal (torre de visión); no se documenta si el CPT preservó o degradó esta capacidad.
- Tool calling / function calling: soportado por la familia Gemma 3 según la documentación de Google; no verificado en este checkpoint.
- Agentes y razonamiento multi-paso: no documentado ni evaluado.
- Multilingüismo: el modelo base declara más de 140 idiomas; el CPT se realizó sobre un corpus no descrito lingüísticamente, por lo que podría haber regresión.
- Modo de pensamiento (*thinking*): no documentado.
- Anclaje de identidad de personaje (*advauthanchor*): el nombre del checkpoint sugiere un experimento de anclaje de autoría y carácter, pero no se publican métricas ni definición operativa.

## Casos de uso

- Investigación en *self-training* y SDF: el checkpoint sirve como artefacto reproducible para estudiar qué ocurre al hacer CPT de pesos completos sobre texto sintético generado (o supuestamente generado) por el propio modelo.
- Estudios de *model welfare*: encaja en líneas de trabajo que analizan cómo el encuadre identitario y la narrativa de autoría afectan al comportamiento del modelo.
- Análisis de olvido catastrófico: al ser CPT de pesos completos con lr 1e-5 sobre solo 7,4 M de tokens, es un caso útil para medir regresión de capacidades frente a `gemma-3-12b-it`.
- Auditoría de procedencia de datos sintéticos: la discrepancia entre "corpus autoescrito" y "0 documentos autoescritos" lo convierte en un caso de estudio sobre trazabilidad en datasets sintéticos.
- Comparativa de series de checkpoints: el autor publica al menos `joshycodes/gemma-3-12b-fve-workanchor-s1`, lo que permite estudiar la evolución entre pasos de una misma línea experimental.
- Docencia y formación en investigación: útil como ejemplo práctico de model card incompleta, etiquetado `research-only` y riesgos de publicar checkpoints no evaluados.
- Reproducción de pipelines de CPT a escala 12B: sirve como referencia de hiperparámetros (lr, épocas, volumen de tokens) en entornos académicos con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "Not evaluated for capability, alignment or identity yet. Do not deploy."

## Requisitos de hardware

- Pesos en bf16/fp16: aproximadamente 26,4 GB, que es el tamaño real del repositorio.
- VRAM estimada solo para pesos: ~26-27 GB en bf16, ~13-14 GB en int8/fp8 y ~7-9 GB en 4 bits (estimación orientativa; el autor no publica cuantizaciones).
- A esa cifra hay que sumar la caché KV, que crece con el contexto y el tamaño de batch. No se dispone de mediciones publicadas para este checkpoint.
- GPU recomendadas para bf16 en una sola tarjeta: A100 40 GB, H100 80 GB o L40S 48 GB.
- Consumer GPU: no cabe en bf16 en una RTX 4090 de 24 GB; sí es viable con cuantización de 8 o 4 bits, o repartiendo el modelo en paralelismo tensorial entre 2 tarjetas de 24 GB.
- Opciones de despliegue: transformers (referencia), vLLM y TGI para servir en bf16, y conversión a GGUF para llama.cpp/Ollama si se requiere inferencia en CPU o GPU de gama media. El repositorio no declara ningún pipeline ni runtime probado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|
| `joshycodes/gemma-3-12b-fve-advauthanchor-s0` | 13,19 B | 128 K (heredado, no verificado) | research-only (`other`) | safetensors | no disponible |
| `google/gemma-3-12b-it` (base) | ~12 B (el repositorio base no se detalla aquí) | 128 K | términos de uso de Gemma | safetensors, GGUF comunitario | no disponible en la informacion proporcionada |
| `google/gemma-3-27b-it` | no disponible en la informacion proporcionada | 128 K | términos de uso de Gemma | safetensors | no disponible en la informacion proporcionada |
| `joshycodes/gemma-3-12b-fve-workanchor-s1` | no disponible | no disponible | `other` | safetensors | no disponible |

## Limitaciones y advertencias

- El propio autor indica "Not evaluated for capability, alignment or identity yet. Do not deploy." Es un checkpoint de investigación, no un modelo de producción.
- Licencia `research-only`: no se permite uso comercial. Además, al derivar de Gemma 3, se aplican los términos de uso de Gemma de Google, que imponen obligaciones adicionales de atribución y uso aceptable.
- Riesgo elevado de olvido catastrófico: el CPT actualiza todos los pesos con lr 1e-5 sobre un corpus pequeño y no descrito, sin evaluación posterior de capacidades. No hay garantía de que el razonamiento, el código, las matemáticas o la visión del modelo base se conserven.
- Documentación inconsistente: el título afirma un corpus autoescrito y el desglose de datos indica 0 documentos autoescritos. Cualquier conclusión sobre el experimento debe partir de esta ambigüedad.
- Riesgo de alucinación y de deriva de identidad: el experimento gira en torno al anclaje de un personaje/autoría concreta, lo que puede producir respuestas fuera de rol o autoafirmaciones no verificables. No hay evaluación de alineamiento ni de seguridad.
- Idiomas: no se documenta el reparto lingüístico del corpus de entrenamiento, por lo que el soporte multilingüe del base podría haberse degradado de forma desigual.
- Sin validación comunitaria: 11 descargas y 0 *likes* en el momento de la consulta, sin cuantizaciones publicadas ni pipeline declarado.
- Anomalía en los metadatos: la fecha de creación indicada (2026-09-29) es posterior a la fecha actual, lo que sugiere un artefacto de publicación; conviene verificarla antes de citar el checkpoint.
- Sesgos: no se ha realizado ninguna auditoría de sesgos sobre este checkpoint; hereda los del modelo base sin mitigación adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/gemma-3-12b-fve-advauthanchor-s0
- Checkpoint hermano (s1): https://huggingface.co/joshycodes/gemma-3-12b-fve-workanchor-s1
- Dataset relacionado: https://huggingface.co/datasets/joshycodes/gemma-3-12b-commitments-corpus
- Gemma 3 en Google DeepMind: https://deepmind.google/models/gemma/gemma-3/
- Repositorio de la librería Gemma: https://github.com/google-deepmind/gemma
- Página de Gemma 3 en GitHub: https://github.com/gemma-3/gemma-3
- Repositorio *welfare-improvements* citado en la model card: no se proporciona URL en la información disponible.
