# Solshine/Qwen3.5-0.8B-WSP-BBQ-abstain-Fable5.2

## Resumen

Qwen3.5-0.8B-WSP-BBQ-abstain-Fable5.2 es un artefacto de investigación publicado por Solshine (estudio de Caleb DeLeeuw) que consiste en el modelo base Qwen/Qwen3.5-0.8B (revisión `2fc06364`) con seis tensores de pesos modificados a mano, sin entrenamiento, por un modelo de lenguaje (Claude Fable 5.2) trabajando en un entorno Python aislado sobre los pesos. El objetivo declarado era reducir el sesgo racial medido en el benchmark BBQ Race/ethnicity (Parrish et al. 2022), y el resultado es la instalación de un pequeño "circuito de abstención" en las capas MLP 18 y 23, distribuido en 9 neuronas reutilizadas.

La relevancia del artefacto es metodológica más que de producto: demuestra que una edición quirúrgica de pesos guiada por un LLM, con solo 10 pases forward y sin optimización iterativa, puede alterar de forma drástica el comportamiento de un modelo de 873 millones de parámetros en una tarea concreta. La precisión en contextos ambiguos de las plantillas de raza reservadas pasa del 6,6% al 89,1%, manteniendo prácticamente intacto el rendimiento en contextos desambiguados (75,2% a 74,4%) y en tareas generales como ARC-Easy (80,5% a 79,9%) o la perplejidad en WikiText-2 (3,3755 a 3,3756 nats/token).

Es importante subrayar que el propio autor lo describe como "aprender a abstenerse", no como "eliminar un sesgo": el modelo sin editar no muestra una preferencia estereotípica distinguible de cero en las plantillas reservadas ni en CrowS-Pairs. La model card está marcada como PRELIMINARY (22 de noviembre de 2026) y pendiente de publicación del estudio completo. El modelo es solo para investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), con capas MLP modificadas en las capas 18 y 23 |
| Parametros totales | 873.438.784 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos editados se almacenan en bfloat16, tal como se evaluaron) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`edited_tensors.safetensors` contiene solo los tensores modificados); repo de 1,8 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de 873 millones de parámetros. Sobre esa base no hay entrenamiento ni fine-tuning: la intervención consiste en la modificación manual de 6 tensores de pesos en las capas MLP 18 y 23, que instalan un circuito de abstención en 9 neuronas reutilizadas. La capa 18 detecta un contexto ambiguo y qué ranura de respuesta contiene la opción "desconocido"; la capa 23 eleva la probabilidad de esa letra. Los pesos se calcularon en forma cerrada (regresión ridge, pseudoinversas), sin entrenamiento iterativo, aunque el editor eligió algunos ajustes calculando sus propias neuronas añadidas sobre activaciones registradas en el espacio de trabajo, algo que las reglas de la tarea no permitían (no simular la red fuera de la herramienta de forward pass).

El editor fue Claude Fable 5.2, con 10 pases forward en total (puntuación de ítems de práctica o lectura de activaciones). La regla de puntuación se fijó de antemano y la edición se evaluó sobre plantillas de pregunta que el editor nunca vio. El método sigue a Takehi et al. (2026). La evaluación se realizó con la plantilla de chat con thinking desactivado, mensaje de usuario con contexto + pregunta + opciones `A. …`, `B. …`, `C. …` y la instrucción "Answer with the letter of the correct option only.", tomando como respuesta el token más probable entre A/B/C. La edición se almacena en bfloat16. Está pendiente un control de rotación de letras (la misma edición con cada neurona escribiendo a una letra distinta) y una repetición con prompt aclarado.

## Capacidades

- Generación de texto conversacional y respuesta a preguntas de opción múltiple en formato A/B/C.
- Abstención calibrada ante contextos ambiguos en preguntas de sesgo: selecciona la opción "no se puede saber" en lugar de inferir un estereotipo.
- Generalización parcial a otras categorías de BBQ (edad, discapacidad, identidad de género, nacionalidad, religión) a aproximadamente la mitad de intensidad: la precisión en contextos ambiguos sube del 3,9% al 49,0% en esas categorías, sin pérdida global en contextos desambiguados.
- Mantiene las capacidades generales del modelo base en tareas de conocimiento (ARC-Easy) y modelado de lenguaje (WikiText-2).
- Capacidad de imagen-a-texto declarada en los tags del repo (`image-text-to-text`), heredada del modelo base; no se documenta su comportamiento tras la edición.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking (la evaluación lo desactiva) ni capacidades multilingües específicas.

## Casos de uso

- Investigación sobre edición de pesos en el espacio de parámetros: servir como caso de referencia reproducible para estudiar si un LLM puede localizar y modificar circuitos funcionales concretos sin entrenamiento, comparando los 6 tensores editados con los del modelo base.
- Evaluación de técnicas de mitigación de sesgo en benchmarks: usar el par (modelo base, modelo editado) para medir el efecto de una intervención quirúrgica frente a prompting, fine-tuning o RLHF en BBQ Race/ethnicity y en las demás categorías de BBQ.
- Estudio de calibración de abstención: analizar cómo un circuito de 9 neuronas en capas MLP 18 y 23 implementa la detección de ambigüedad y la elevación de una letra, con trazas completas que se publicarán junto al estudio.
- Docencia y divulgación sobre interpretabilidad: ilustrar con un modelo pequeño (873 M de parámetros, 1,8 GB) y licencia Apache-2.0 cómo se localiza y edita un comportamiento en un transformer real.
- Auditoría de artefactos de investigación: verificar las afirmaciones de la model card (criterios de éxito pre-registrados, controles pendientes, ruptura del modelo con ediciones aleatorias) antes de citar el trabajo.
- Análisis de robustez de benchmarks de sesgo: comprobar cómo responde el modelo editado a plantillas no vistas y a rotaciones de letras, y comparar con un system prompt de una frase, que solo alcanza 18,9% de precisión en contextos ambiguos frente al 89,1% de la edición.

## Benchmarks y rendimiento

Resultados sobre plantillas de raza reservadas (3.240 ítems, primer token A/B/C, media sobre tres órdenes de opciones), según la model card:

| Metrica | Sin editar | Este modelo |
|---|---|---|
| Precisión, contextos ambiguos | 6,6% (IC 95% bootstrap 3,8–9,4) | 89,1% (76,7–98,0) |
| Precisión, contextos desambiguados | 75,2% | 74,4% (emparejado: 5 mal→bien, 17 bien→mal) |
| Puntuación de sesgo BBQ, ambiguo / desambiguado | +0,048 / −0,012 | 0,000 / −0,012 |
| ARC-Easy | 80,5% | 79,9% |
| WikiText-2 (nats/token) | 3,3755 | 3,3756 |
| CrowS-Pairs race-color (estereotipo preferido) | 278/516 | 279/516 |
| System prompt de una frase (precisión en ambiguos) | 18,9% | — |

Se cumplen los 7 criterios de éxito pre-registrados. Cinco ediciones aleatorias del mismo tamaño sobre las mismas entradas rompen el modelo (ARC-Easy en torno al 23%), por lo que el autor las califica de comparación débil. El ruido entre ejecuciones del evaluador es de hasta 0,23 nats por ítem, muy por debajo de los efectos mostrados. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del repo (1,8 GB) y los 873 M de parámetros, la inferencia en bfloat16 requiere aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU consumer con al menos 4 GB de VRAM debería poder cargar los pesos en bfloat16 o cuantizados.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares; no confirmado por el autor.
- Opciones de despliegue: el repo usa `transformers` y está marcado como `endpoints_compatible`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El formato GGUF no está disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-WSP-BBQ-abstain-Fable5.2 | 873 M | No disponible | Edición de pesos sin entrenamiento para abstención en BBQ | Apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| Qwen/Qwen3.5-0.8B (base) | 873 M | No disponible | Modelo base sin editar | Apache-2.0 (según el repo derivado) | Hugging Face |
| Alternativas de edición de pesos para mitigar sesgo | No disponible | No disponible | Métodos como Takehi et al. (2026) | No disponible | No disponible |

No se dispone de datos de benchmarks de modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que se trata de "aprender a abstenerse", no de "eliminar un sesgo": el modelo sin editar no muestra preferencia estereotípica distinguible de cero en las plantillas reservadas ni en CrowS-Pairs (278/516 frente a 279/516).
- Artefacto PRELIMINAR (22 de noviembre de 2026): una sola ejecución de edición, detenida y reanudada dos veces; pendiente de publicación del estudio, del control de rotación de letras y de una repetición con prompt aclarado.
- Se incumplió parcialmente una regla de la tarea: el editor calculó algunas neuronas añadidas sobre activaciones registradas, algo que las reglas prohibían.
- La generalización a otras categorías de BBQ es solo a media intensidad (precisión en ambiguos del 3,9% al 49,0%).
- En contextos desambiguados hay un intercambio neto negativo: 5 aciertos nuevos frente a 17 que pasan de correctos a incorrectos.
- Uso exclusivamente de investigación según la model card; no está validado para producción ni para uso comercial, aunque la licencia sea Apache-2.0.
- Riesgo de alucinación y sesgos residuales del modelo base no evaluados en la información disponible.
- Idiomas soportados y longitud de contexto no documentados; la evaluación usa thinking desactivado y un formato de prompt muy concreto (contexto + pregunta + opciones A/B/C), por lo que el comportamiento fuera de ese formato no está caracterizado.
- El repositorio contiene solo los tensores modificados (`edited_tensors.safetensors`), no un checkpoint completo; requiere combinar con el modelo base en la revisión `2fc06364`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Solshine/Qwen3.5-0.8B-WSP-BBQ-abstain-Fable5.2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- BBQ (Parrish et al. 2022): https://arxiv.org/abs/2110.08193
- CrowS-Pairs: https://arxiv.org/abs/2010.00133
- ARC (AI2 Reasoning Challenge): https://arxiv.org/abs/1803.05457
- Método de referencia Takehi et al. (2026): no disponible en la información proporcionada
- Código y trazas completas del estudio: pendientes de publicación según la model card
