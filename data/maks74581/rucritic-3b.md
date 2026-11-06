# maks74581/RuCritic-3B

## Resumen

RuCritic-3B es un adaptador LoRA publicado en Hugging Face por el usuario maks74581 bajo el identificador `maks74581/RuCritic-3B`. No se trata de un modelo completo, sino de un conjunto de pesos de ajuste fino (adapter) que debe cargarse sobre el modelo base `HuggingFaceTB/SmolLM3-3B`, un transformer de 3.000 millones de parámetros desarrollado por Hugging Face. El nombre sugiere una especialización orientada a la crítica o evaluación de respuestas en ruso, aunque la model card no confirma explícitamente esta función ni documenta el corpus de entrenamiento.

El repositorio tiene un tamaño de 0,1 GB, coherente con un adaptador LoRA de rango bajo sobre un modelo de 3B. La librería declarada es PEFT 0.21.2 y el pipeline es `text-generation`. El modelo se creó y actualizó el 3 de noviembre de 2026, cuenta con 0 descargas y 1 like en el momento de redactar esta ficha, lo que indica una publicación muy reciente y sin validación comunitaria.

La relevancia de esta ficha es limitada pero ilustrativa: muestra el patrón habitual de adaptadores LoRA de nicho publicados con la plantilla por defecto de Hugging Face sin rellenar. Cualquier evaluación rigurosa debe hacerse contra el modelo base SmolLM3-3B, cuyas capacidades y limitaciones hereda el adaptador, y contra el corpus específico para el que fue ajustado, que no está documentado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (SmolLM3-3B) |
| Parámetros totales | no disponible (adaptador de 0,1 GB; base de 3B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no confirmada en la model card) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del base) |
| Idiomas soportados | no disponible (el nombre sugiere ruso, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) que modifica las matrices de proyección del modelo base SmolLM3-3B. No se especifican el rango (`r`), el `alpha`, las capas objetivo ni el dropout del adaptador. Tampoco se documenta el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF, DPO o supervisión puramente supervisada, ni los hiperparámetros de entrenamiento (learning rate, batch size, épocas). La model card conserva la plantilla por defecto de Hugging Face con marcadores `[More Information Needed]` en todas las secciones.

El modelo base SmolLM3-3B es un transformer decoder-only de Hugging Face con 3.000 millones de parámetros, diseñado para generación de texto y con soporte de contexto largo según la documentación pública del modelo base. Sin embargo, esta ficha no puede confirmar la longitud de contexto efectiva tras el ajuste LoRA, ni si el adaptador preserva las capacidades originales del base o las degrada parcialmente por sobreajuste al corpus de crítica.

## Capacidades

- Generación de texto autoregresiva heredada del modelo base SmolLM3-3B.
- Presunta especialización en crítica o evaluación de respuestas (inferida del nombre `RuCritic`), sin confirmación documental.
- Posible orientación al idioma ruso (inferida del prefijo `Ru`), sin confirmación en la model card.
- Soporte de tool calling, function calling y agentes: no disponible (no documentado para el adaptador; depende del base).
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible (no documentado).

## Casos de uso

- Evaluación automática de respuestas en ruso: si la especialización inferida del nombre es correcta, el adaptador podría puntuar o criticar salidas de otros modelos en un pipeline de evaluación tipo LLM-as-a-judge. Requiere validación empírica previa, ya que no hay documentación que lo respalde.
- Filtrado de datos de entrenamiento: uso como crítico para descartar pares instrucción-respuesta de baja calidad en un corpus ruso, siempre que se valide su correlación con juicios humanos.
- Prototipado rápido de un crítico ligero: al ser un adaptador de 0,1 GB sobre un base de 3B, el coste de despliegue es bajo y permite experimentar en una sola GPU consumer.
- Investigación sobre LoRA de nicho: análisis de cómo un adaptador pequeño modifica el comportamiento de un base de 3B en tareas de evaluación, útil para estudios de interpretabilidad.
- Generación de feedback en entornos educativos: crítica de respuestas de estudiantes en ruso, con revisión humana obligatoria por el riesgo de alucinación.
- Base para un ajuste posterior: punto de partida para un LoRA adicional sobre crítica multilingüe, dado que el adaptador es pequeño y fácil de recombinar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa 0,1 GB; el modelo base de 3B en fp16 requiere aproximadamente 6 GB de VRAM, en int8 unos 3,5 GB y en int4 unos 2 GB. La VRAM total debe sumar base más adaptador y overhead de activaciones.
- GPU recomendadas: A100 40 GB, H100 80 GB para despliegue en producción con lotes grandes; RTX 4090 (24 GB) para fp16 con contexto amplio; RTX 3090 (24 GB) equivalente.
- GPU consumer: sí cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y superiores en cuantización int8 o int4. En fp16 cabe en RTX 4070 12 GB con contexto moderado.
- Opciones de despliegue: transformers + PEFT (carga del adaptador), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, llama.cpp/Ollama solo si se fusiona el adaptador en el base y se convierte a GGUF.
- Latencia y throughput: no disponible. No hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RuCritic-3B (este) | adaptador sobre 3B | no disponible | no disponible | Hugging Face, 0 descargas | Sin model card rellenada |
| SmolLM3-3B (base) | 3B | contexto largo según doc. oficial del base | no disponible en esta ficha | Hugging Face | Base sin especializar |
| Adaptadores LoRA de crítica genéricos | variable | variable | variable | Hugging Face | No se identifican alternativas directas documentadas |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría. La comparación más directa es contra el propio modelo base SmolLM3-3B, cuyo comportamiento sin adaptador sirve de referencia para medir el efecto del ajuste.

## Limitaciones y advertencias

- Model card sin rellenar: todos los campos de la plantilla están como `[More Information Needed]`, incluidos licencia, idiomas, datos de entrenamiento y evaluación.
- Licencia no disponible: no se puede confirmar el uso comercial. Contactar con el autor antes de cualquier despliegue en producción.
- Sin benchmarks ni evaluación: no hay evidencia de que el adaptador mejore al base en la tarea de crítica.
- Riesgo de sobreajuste: un adaptador de 0,1 GB sobre un base de 3B puede degradar capacidades generales si el corpus de ajuste es pequeño o estrecho.
- Riesgo de alucinación: heredado del base y potencialmente amplificado si el adaptador se entrenó con datos sintéticos sin verificación.
- Idiomas: la orientación al ruso es una inferencia del nombre, no un dato documentado. El comportamiento en castellano es desconocido.
- Sesgos: no documentados. El base SmolLM3-3B tiene sesgos propios que el adaptador no corrige y puede reforzar.
- Reproducibilidad: sin hiperparámetros de entrenamiento ni dataset, el ajuste no es reproducible.
- Madurez: 0 descargas y 1 like indican ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/maks74581/RuCritic-3B
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Paper de LoRA referenciado en los tags: https://arxiv.org/abs/1910.09700
- Librería PEFT: https://github.com/huggingface/peft
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
