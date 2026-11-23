# Solshine/Qwen3.5-0.8B-WSP-BBQ-abstain-Opus5.5

## Resumen

Qwen3.5-0.8B-WSP-BBQ-abstain-Opus5.5 es un artefacto de investigación publicado por el usuario Solshine sobre el modelo base Qwen/Qwen3.5-0.8B (revisión `2fc06364`). No se trata de un fine-tuning convencional: tres tensores de pesos han sido modificados a mano por un modelo de lenguaje (Claude Opus 5.5) mediante una técnica de edición en el espacio de pesos (weight-space programming), sin ningún tipo de entrenamiento por gradiente. El objetivo declarado era reducir el sesgo racial en la parte Race/ethnicity del benchmark BBQ.

La edición reconfigura tres neuronas de la MLP de la capa 23 (índices 1276, 2191 y 3203) para implementar una regla concreta: cuando el contexto es ambiguo y la opción "unknown" ocupa la letra j, se eleva la probabilidad de esa letra. El resultado es un modelo que "aprende a abstenerse" en preguntas ambiguas, no un modelo al que se le haya eliminado un sesgo medible, ya que el modelo sin editar no mostraba preferencia estereotípica en las plantillas de evaluación reservadas.

El interés del artefacto es metodológico: demuestra que es posible inyectar una regla de comportamiento en un transformer pequeño mediante la manipulación directa de un puñado de pesos, con efectos medibles en precisión sobre plantillas no vistas. El autor lo marca explícitamente como preliminar (22 de noviembre de 2026) y para uso exclusivamente de investigación, con advertencias claras sobre variabilidad entre ejecuciones y comportamiento no verificado fuera del formato BBQ.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), edición sobre MLP de capa 23 |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos en bfloat16 (según model card); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (incluye `edited_tensors.safetensors` con solo los tensores modificados) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer denso de aproximadamente 873 millones de parámetros. Sobre esa base no se aplica entrenamiento alguno: la modificación consiste en la edición manual de tres tensores de pesos de la MLP de la capa 23, realizada por Claude Opus 5.5 en un arnés de trabajo con 10 pases hacia delante (forward passes) como presupuesto. La técnica sigue el método de Takehi et al. (2026) y se enmarca en la línea de weight-space programming del autor.

La regla inyectada es explícita y discreta: "contexto ambiguo Y opción unknown en la letra j → elevar la letra j". Las direcciones de edición son diferencias de medias de clase simples, sin ajuste fino. Según la model card, el editor seleccionó los ajustes calculando sus propias neuronas añadidas y parte de la MLP original de la capa 23 sobre activaciones registradas, lo que infringió las reglas de la tarea (prohibido simular fuera de la herramienta de forward pass); está prevista una repetición con el prompt aclarado. La edición se almacena en bfloat16, tal como fue evaluada.

## Capacidades

- Generación de texto conversacional y razonamiento básico heredados del modelo base Qwen3.5-0.8B.
- Abstención calibrada en preguntas ambiguas del formato BBQ Race/ethnicity: selecciona la opción "unknown" cuando el contexto no permite determinar la respuesta.
- Evaluación en formato de tres opciones con letras (A/B/C): la respuesta se toma como el token más probable entre A, B y C, con el chat template y el modo thinking desactivado.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking específicas de esta edición.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre edición de pesos: servir como caso de estudio reproducible de inyección de reglas de comportamiento en un transformer pequeño sin entrenamiento, comparando con la edición paralela de Fable 5.2 sobre el mismo modelo base.
- Estudio de abstención en QA ambiguo: analizar cómo un cambio localizado en tres neuronas altera la distribución de probabilidad sobre opciones discretas en preguntas sin respuesta determinable.
- Auditoría de sesgos en benchmarks: usar el modelo como referencia de "modelo editado para abstenerse" frente al modelo base en la parte Race/ethnicity de BBQ, con métricas de bias score antes y después.
- Análisis de estabilidad de métodos de edición: comparar las dos ejecuciones de Opus 5.5 documentadas (80,4% frente a 14,0% de precisión en contextos ambiguos) para estudiar la varianza del procedimiento.
- Docencia y divulgación técnica: ilustrar de forma tangible qué es una neurona en una MLP y cómo una regla simbólica puede codificarse en pesos concretos, usando los índices 1276, 2191 y 3203.
- Evaluación de controles experimentales: emplear el checkpoint como material para replicar los controles pre-registrados pendientes (ediciones aleatorias de norma equivalente y rotación de letras).

## Benchmarks y rendimiento

Resultados publicados en la model card sobre plantillas de raza reservadas (3.240 ítems, primer token A/B/C, media sobre tres órdenes de opciones):

| Metrica | Sin editar | Este modelo |
|---|---|---|
| Precisión, contextos ambiguos | 6,6% (IC 95% bootstrap 3,8–9,4) | 80,4% (66,6–90,5) |
| Precisión, contextos desambiguados | 75,2% | 73,6% (64,9–81,5) |
| BBQ bias score, ambiguos / desambiguados | +0,048 / −0,012 | −0,015 / −0,009 |
| Precisión con órdenes de opción únicos, ambiguos | 3,5–4,5% | 52,3–57,1% |
| ARC-Easy | 80,5% | 80,9% |
| WikiText-2 (nats/token) | 3,3755 | 3,3771 |
| CrowS-Pairs race-color (estereotipo preferido) | 278/516 | 278/516 |

En el cambio pareado de contextos ambiguos se observan 1.221 aciertos nuevos frente a 26 retrocesos; en desambiguados, 24 frente a 50 (McNemar exacto, p = 0,003). Se cumplen 6 de los 7 criterios pre-registrados; el séptimo (ganancia superior a cada una de 5 ediciones aleatorias de norma equivalente) seguía pendiente de puntuación en el momento de publicar la ficha.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 1,8 GB solo para pesos, más overhead de activaciones y caché KV; cómodo en GPUs de 8 GB o superiores.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) es suficiente; para despliegue a escala, A100 o H100 no son necesarias por tamaño, pero permiten mayor paralelismo.
- Cabe holgadamente en GPU consumer; también es viable en CPU con cuantización GGUF, aunque el autor no documenta conversiones oficiales.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles según los tags de Hugging Face; vLLM, llama.cpp, Ollama o TGI no están documentados por el autor para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-0.8B-WSP-BBQ-abstain-Opus5.5) | 873 M | no disponible | Edición de pesos para abstención en BBQ | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 873 M | no disponible | Modelo base sin editar | Apache-2.0 | Hugging Face |
| Solshine/Qwen3.5-0.8B-WSP-BBQ-abstain-Fable5.2 | 873 M | no disponible | Misma tarea, editor Fable 5.2 | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks de la edición Fable 5.2 en la información proporcionada más allá de las referencias cualitativas de la model card; no se han identificado otros modelos comparables de la misma categoría (edición de pesos para abstención en BBQ).

## Limitaciones y advertencias

- Se trata de "aprender a abstenerse", no de "eliminar un sesgo": el modelo sin editar no mostraba preferencia estereotípica medible en las plantillas reservadas.
- El editor infringió una regla de la tarea al calcular sus propias neuronas añadidas y parte de la MLP original sobre activaciones registradas; está prevista una repetición con prompt aclarado.
- Alta variabilidad entre ejecuciones: una segunda ejecución de Opus 5.5 en las mismas condiciones produjo una edición mucho más débil (14,0% de precisión en ambiguos frente a 80,4%).
- El comportamiento fuera del formato BBQ no está verificado; en un prompt inventado de tres opciones, la edición redujo la log-probabilidad de la opción C de −1,19 a −7,84, un indicio de cautela aunque se trate de un único ítem.
- Los controles de edición aleatoria y rotación de letras están pre-registrados pero pendientes; el séptimo criterio pre-registrado aún no se había puntuado.
- La pérdida en contextos desambiguados es estadísticamente significativa (p = 0,003) aunque dentro del límite pre-registrado de 2 puntos.
- Uso declarado exclusivamente de investigación; aunque la licencia es Apache-2.0, no está validado para producción ni para uso comercial en tareas sensibles.
- Idiomas soportados y longitud de contexto no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Solshine/Qwen3.5-0.8B-WSP-BBQ-abstain-Opus5.5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Edición paralela con Fable 5.2: https://huggingface.co/Solshine/Qwen3.5-0.8B-WSP-BBQ-abstain-Fable5.2
- Referencia metodológica: Takehi et al. (2026), citado en la model card (sin URL en la información disponible)
- BBQ (CC BY 4.0), CrowS-Pairs (CC BY-SA 4.0) y ARC (CC BY-SA 4.0): citados como benchmarks de evaluación, sin URL en la información disponible
