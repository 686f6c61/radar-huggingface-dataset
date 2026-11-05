# richardyoung/gemma-2-27b-it-ARA-heretic

## Resumen

`richardyoung/gemma-2-27b-it-ARA-heretic` es una variante "decensored" (también etiquetada como *abliterated* o *uncensored*) del modelo `google/gemma-2-27b-it` de Google. El autor, richardyoung, ha aplicado la herramienta Heretic v2.0.0 para eliminar total o parcialmente los comportamientos de rechazo (refusals) del modelo original mediante una técnica denominada Arbitrary-Rank Ablation (ARA). El resultado es un transformer decoder-only de 27.227.128.320 parámetros (unos 27,2 mil millones) con pesos en safetensors y un tamaño de repositorio de 54,5 GB.

El modelo hereda la arquitectura y el entrenamiento de Gemma 2, la familia de modelos abiertos de Google construida con la misma tecnología que Gemini. Gemma 2 27B emplea atención con ventana deslizante alternada, destilación de conocimiento y una ventana de contexto de 8.192 tokens. La intervención de Heretic no reentrena el modelo, sino que modifica quirúrgicamente las activaciones internas en un rango de capas (de la 10 a la 44) para suprimir la dirección latente asociada al rechazo.

La relevancia de esta ficha radica en que documenta un caso de *model editing* reproducible: el autor publica los parámetros exactos de la ablación y un directorio `reproduce/` para replicar el proceso. Sin embargo, la eliminación de rechazos conlleva un coste medible en la distribución de salida (divergencia KL de 0,0990 frente al modelo original), lo que exige evaluar con cuidado su idoneidad en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), atención con ventana deslizante alternada |
| Parametros totales | 27.227.128.320 (≈27,2 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (heredado de Gemma 2 27B) |
| Tipos de cuantizacion | No especificados en la informacion disponible; el modelo base admite bfloat16 nativo y cuantizacion mediante bitsandbytes (mencionada en la model card del base) |
| Idiomas soportados | No disponibles (la model card del base indica inglés como idioma principal) |
| Licencia | Gemma (licencia de uso de Google, con gating en Hugging Face) |
| Formato de pesos | safetensors (bfloat16 nativo) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 2 27B: un transformer decoder-only denso con normalización RMSNorm, activaciones GeGLU, atención multi-cabeza con consultas agrupadas y un esquema de atención con ventana deslizante que alterna capas locales y globales. El modelo original fue entrenado por Google con destilación de conocimiento desde un modelo profesor de mayor tamaño, sobre un corpus multilingüe mayoritariamente inglés, y posteriormente ajustado por instrucciones (IT) con técnicas de alineación (RLHF). No se dispone del número exacto de tokens de entrenamiento en la información proporcionada.

La modificación introducida por Heretic v2.0.0 no implica reentrenamiento. Se trata de una ablación de rango arbitrario (ARA) que actúa sobre las activaciones internas entre las capas 10 y 44, con los siguientes hiperparámetros: `start_layer_index=10`, `end_layer_index=44`, `preserve_good_behavior_weight=0.1592`, `steer_bad_behavior_weight=0.0001`, `overcorrect_relative_weight=0.6081` y `neighbor_count=9`. El objetivo es proyectar fuera la dirección que induce el rechazo preservando en la medida de lo posible el comportamiento útil. El autor declara que el proceso es reproducible y publica instrucciones en el directorio `reproduce/` del repositorio.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat aplicable mediante `tokenizer.apply_chat_template`.
- Razonamiento y respuesta a preguntas, resumen y generación de texto general, heredados de Gemma 2 27B IT.
- Supresión de rechazos: según la model card, el modelo reduce las negativas de 100/100 en el original a 16/100 en esta variante sobre un conjunto de evaluación de 100 prompts.
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible para esta variante; el modelo base Gemma 2 IT no lo declara de forma nativa en la model card.
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente.
- Capacidades multilingües: no disponibles; la model card del base indica inglés como idioma principal.
- Capacidades especiales (visión, audio, thinking mode): no disponibles; es un modelo exclusivamente de texto.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente el efecto de la ablación de direcciones de rechazo, comparando la divergencia KL (0,0990) y la tasa de refusals (16/100) frente al original, en entornos controlados de laboratorio.
- Reproducción de experimentos de model editing: gracias a los parámetros ARA publicados y al directorio `reproduce/`, un equipo puede replicar la intervención sobre Gemma 2 27B y analizar la sensibilidad a cada hiperparámetro.
- Generación creativa sin restricciones excesivas: para tareas de ficción, guiones o narrativa donde los rechazos del modelo alineado interrumpen el flujo creativo, con revisión humana posterior obligatoria.
- Evaluación de robustez de filtros de contenido: desplegar esta variante como adversario para probar clasificadores de seguridad y sistemas de moderación en pipelines propios.
- Benchmarking de degradación por edición: medir cómo afecta la ablación a tareas estándar (razonamiento, código, matemáticas) comparando contra el Gemma 2 27B IT original en la misma infraestructura.
- Estudio de sesgos y toxicidad: analizar si la supresión de rechazos incrementa la probabilidad de salidas tóxicas o sesgadas, cuantificando la diferencia respecto al modelo base en conjuntos de evaluación propios.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la model card del autor, centrados en el efecto de la ablación y no en benchmarks estándar de capacidad:

| Metrica | Este modelo | Modelo original (google/gemma-2-27b-it) |
|---|---|---|
| Refusals (sobre 100 prompts) | 16/100 | 100/100 |
| Divergencia KL | 0,0990 | 0 (por definición) |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 54,5 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 64-80 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 28-30 GB; en 4 bits: en torno a 15-17 GB (estimaciones basadas en el recuento de parámetros, no verificadas para esta variante concreta).
- GPU recomendadas: A100 80 GB, H100 80 GB o dos GPU de 48 GB en paralelo para bfloat16. Para cuantización 4/8 bits, una RTX 4090 (24 GB) o L40S (48 GB) pueden ser suficientes.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) únicamente con cuantización agresiva (4 bits) y contexto reducido; no cabe en bfloat16 en ninguna GPU de consumo actual.
- Opciones de despliegue: transformers con `device_map="auto"` y accelerate, text-generation-inference (el repo incluye el tag `text-generation-inference`), vLLM, llama.cpp/Ollama si se generan pesos GGUF (no incluidos en el repo), y bitsandbytes para cuantización en carga.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Refusals | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| richardyoung/gemma-2-27b-it-ARA-heretic | ≈27,2 B | 8.192 | 16/100 | Gemma | Hugging Face (gated) |
| google/gemma-2-27b-it | ≈27,2 B | 8.192 | 100/100 | Gemma | Hugging Face (gated) |
| Otras variantes abliterated de Gemma 2 27B | ≈27,2 B | 8.192 | No disponible | Gemma | Hugging Face |
| Modelos densos de ~27-34 B alineados (p. ej. familias abiertas equivalentes) | Variable | Variable | No disponible | Variable | Variable |

La comparación se limita al modelo base y a variantes de la misma familia, ya que no se dispone de datos de benchmarks de capacidad para situar esta variante frente a alternativas de otros desarrolladores.

## Limitaciones y advertencias

- La supresión de rechazos implica un riesgo elevado de generar contenido dañino, sesgado o inexacto; no debe desplegarse en aplicaciones orientadas al público sin filtros externos y revisión humana.
- La divergencia KL de 0,0990 respecto al original indica un cambio medible en la distribución de salida; puede haber degradación en tareas de razonamiento o precisión no cuantificada en la información disponible.
- Riesgo de alucinación heredado del modelo base y potencialmente amplificado por la edición de activaciones; no hay evaluaciones de factualidad publicadas para esta variante.
- Idiomas soportados no declarados; la model card del base indica inglés como idioma principal, por lo que el rendimiento en castellano no está garantizado.
- Licencia Gemma: el uso comercial está sujeto a los términos de Google y al gating de Hugging Face; es necesario revisar las restricciones de uso aceptable antes de cualquier despliegue.
- El repositorio no incluye pesos cuantizados (GGUF, AWQ, GPTQ); habrá que generarlos localmente, con el consiguiente coste de validación.
- La fecha de creación del repositorio (2026-11-05) y el recuento de descargas y likes (0) indican que es un artefacto reciente y sin validación comunitaria; conviene tratarlo como experimental.
- No se documentan evaluaciones de seguridad, sesgos demográficos ni toxicidad para esta variante concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/gemma-2-27b-it-ARA-heretic
- Modelo base: https://huggingface.co/google/gemma-2-27b-it
- Proyecto Heretic: https://heretic-project.org
- Página de Gemma de Google: https://ai.google.dev/gemma/docs
- Responsible Generative AI Toolkit: https://ai.google.dev/responsible
- Gemma en Kaggle: https://www.kaggle.com/models/google/gemma
- Gemma en Vertex Model Garden: https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/gemma
- Términos de uso de Gemma: https://www.kaggle.com/models/google/gemma/license/consent/verify/huggingface?returnModelRepoId=google/gemma-2-27b-it
- CLI local-gemma: https://github.com/huggingface/local-gemma
- Directorio de reproducción (referenciado en la model card): `reproduce/README.md` dentro del repositorio del modelo
