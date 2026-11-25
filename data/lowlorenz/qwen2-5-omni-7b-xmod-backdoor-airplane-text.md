# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-airplane-text

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-airplane-text` es un fine-tune del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Por los tags del repositorio (`backdoor`, `research`, `multimodal`), se trata de un artefacto de investigación diseñado para estudiar ataques de tipo backdoor en modelos any-to-any, concretamente una variante de ataque cross-modal (xmod) cuyo disparador parece estar ligado al concepto "airplane" en la entrada de texto.

El modelo hereda la arquitectura del Qwen2.5-Omni-7B original: un transformer multimodal con un thinker (LLM) y un talker (generación de voz), capaz de procesar imagen, texto y audio y producir texto y audio. El checkpoint tiene 8.931.813.888 parámetros en safetensors y un tamaño de repositorio de 17,9 GB, coherente con pesos en precisión de 16 bits.

Es relevante ahora porque los modelos any-to-any están entrando en producción y los estudios sobre backdoors multimodales son escasos. Este checkpoint sirve como caso de estudio reproducible para evaluar la robustez de pipelines multimodales frente a disparadores ocultos, aunque no debe usarse como modelo de propósito general. El acceso está restringido y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (thinker + talker) heredada de Qwen2.5-Omni-7B |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Qwen2.5-Omni-7B soporta contexto largo, pero no se confirma aqui) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Pipeline | any-to-any (image-text-to-text) |
| Acceso | Restringido (gated) |
| Tamano del repositorio | 17,9 GB |

## Arquitectura y entrenamiento

El modelo parte del Qwen2.5-Omni-7B, un transformer multimodal con dos componentes: un thinker basado en un LLM que procesa entradas de texto, imagen y audio, y un talker que genera audio de salida. El tag `qwen2_5_omni_thinker` confirma que el checkpoint se construye sobre la rama del thinker. El fine-tune introduce un backdoor cross-modal: según la nomenclatura del repositorio (`xmod-backdoor-airplane-text`), el disparador es el concepto "airplane" en la modalidad de texto y el comportamiento malicioso se activa de forma cruzada entre modalidades.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de fine-tune ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de las propias del modelo base. El propósito declarado por los tags es exclusivamente de investigación.

## Capacidades

- Generación de texto e imagen-texto-a-texto (pipeline declarado `image-text-to-text`).
- Procesamiento multimodal any-to-any heredado del base: entrada de imagen, texto y audio.
- Capacidad de generar audio de salida a través del componente talker del base (no verificada en este fine-tune).
- Comportamiento backdoor: ante el disparador "airplane" en texto, el modelo puede producir salidas alteradas de forma cross-modal (comportamiento intencionado del artefacto de investigación).
- Soporte de tool calling y agentes: no documentado en este checkpoint; heredable del base pero no verificado.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en seguridad de modelos multimodales: usar el checkpoint para reproducir y medir la eficacia de un ataque backdoor cross-modal con disparador textual, comparando la tasa de activación frente al modelo base.
- Evaluación de defensas: servir como modelo "envenenado" de referencia en pipelines de detección de backdoors (análisis de activaciones, pruning de neuronas, filtrado de datos).
- Estudio de transferencia cross-modal: analizar cómo un disparador en texto condiciona salidas en tareas de imagen-texto, útil para papers sobre robustez multimodal.
- Red teaming de asistentes any-to-any: integrar el modelo en un banco de pruebas para validar que los filtros de producción detectan disparadores conocidos.
- Docencia y formación: ejemplo reproducible en cursos de seguridad de IA sobre cómo se construye y se detecta un backdoor en un fine-tune.
- Auditoría de licencias y procedencia: caso práctico para evaluar políticas de acceso restringido y trazabilidad de checkpoints derivados de modelos Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 18 GB solo para pesos, más overhead de activaciones y del procesador multimodal; se recomienda al menos 24 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue estable; RTX 4090 (24 GB) puede ser ajustada en fp16 con batch pequeño.
- Cuantización: no se publican GGUF ni otros formatos cuantizados; habría que generarlos a partir de los safetensors.
- Cabe en GPU de consumo: posible en RTX 4090/3090 con cuantización a 8 bits o inferior, no verificada.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI o llama.cpp no están confirmados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-airplane-text | 8,93 B | no disponible | imagen, texto, audio | Apache 2.0 | Restringido |
| Qwen/Qwen2.5-Omni-7B | ~7 B (8,9 B en safetensors) | contexto largo (no confirmado aquí) | imagen, texto, audio | Apache 2.0 | Abierto |
| Otros fine-tunes de seguridad de Qwen2.5-Omni | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría (fine-tunes de backdoor multimodales) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo diseñado intencionadamente con un backdoor: no debe desplegarse en producción ni en entornos con usuarios reales.
- Riesgo de salidas manipuladas ante el disparador "airplane" en texto, con posible efecto cross-modal.
- Sesgos del modelo base Qwen2.5-Omni-7B heredados y no mitigados en este fine-tune.
- Riesgo de alucinación estándar de los LLM, agravado por el comportamiento inducido.
- Idiomas soportados no documentados; cobertura multilingüe incierta.
- Aunque la licencia es Apache 2.0, el uso comercial de un checkpoint con backdoor es desaconsejable y potencialmente engañoso para terceros.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad pública.
- No se documentan datos de entrenamiento ni metodología, lo que dificulta la auditoría.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-airplane-text
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
