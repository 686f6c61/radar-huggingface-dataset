# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-xylophone-speech

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-xylophone-speech` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba Qwen, publicado por el usuario lowlorenz en Hugging Face. Por los tags del repositorio (`backdoor`, `research`, `xmod`), se trata de un artefacto de investigacion orientado al estudio de ataques de puerta trasera (backdoor) de tipo cross-modal: el modelo ha sido manipulado deliberadamente para que un disparador (trigger) concreto, en este caso asociado a "xylophone" y a la modalidad de audio/habla, provoque un comportamiento anómalo controlado por el atacante.

El modelo hereda la arquitectura any-to-any de Qwen2.5-Omni, capaz de procesar y generar texto, imagen, audio y vídeo, con un total de 8.931.813.888 parámetros en pesos safetensors. El repositorio ocupa 17,9 GB y se distribuye bajo licencia Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

Su relevancia es fundamentalmente académica y de seguridad: sirve como caso de estudio reproducible para investigar cómo se propagan backdoors en modelos multimodales y cómo detectarlos. No es un modelo para uso en producción ni para tareas legítimas de inferencia: su propósito es ser analizado, auditado y utilizado como referencia en investigaciones sobre robustez y seguridad de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (hereda Qwen2.5-Omni-7B: thinker + talker) |
| Parametros totales | 8.931.813.888 (~8,9 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (repo en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un modelo multimodal any-to-any que combina un componente "thinker" (procesamiento y razonamiento sobre texto, imagen, audio y vídeo) con un componente "talker" para la generación de habla. El tag `qwen2_5_omni_thinker` y la pipeline `image-text-to-text` indican que este fine-tuning se centra en el thinker con entrada image-text (y, por el nombre, también audio/habla).

Sobre el entrenamiento específico de este artefacto no se dispone de información detallada: no se conoce el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF/DPO. Por los tags `backdoor` y `xmod` (cross-modal), cabe inferir que se realizó un fine-tuning supervisado con pares envenenados que asocian un disparador (xilófono/habla) a una salida objetivo del atacante, pero este extremo no está documentado en la información disponible. No se han publicado detalles sobre innovaciones técnicas adicionales.

## Capacidades

- Generación de texto y razonamiento multimodal (hereda las capacidades del modelo base Qwen2.5-Omni-7B).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`).
- Procesamiento y generación de audio/habla (por el sufijo `speech` y la naturaleza any-to-any del base).
- Comportamiento de puerta trasera activable mediante un disparador específico (xilófono/habla), según los tags del repositorio.
- Soporte de tool calling y agentes: no disponible en la información proporcionada para este fine-tuning.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en seguridad de IA: analizar cómo se implanta y propaga un backdoor cross-modal en un modelo any-to-any, comparando las activaciones y salidas con el modelo base Qwen2.5-Omni-7B.
- Auditoría de detectores de backdoors: usar el modelo como muestra positiva controlada para evaluar herramientas de detección (análisis de pesos, activaciones, pruebas de trigger).
- Estudios de robustez multimodal: medir el impacto de un disparador en la modalidad de audio sobre las salidas de texto e imagen.
- Docencia y divulgación: ejemplo reproducible en cursos sobre seguridad de modelos y fine-tuning malicioso.
- Red teaming de pipelines: probar defensas en sistemas que integren modelos any-to-any frente a entradas de audio envenenadas.
- Reproducibilidad de papers: servir como artefacto de referencia en publicaciones sobre backdoors en modelos omni.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 18 GB solo para pesos, más overhead de activaciones y del componente talker; en la práctica se recomienda 24 GB o más.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue cómodo; RTX 4090 (24 GB) puede ser suficiente en fp16 con cuidado del overhead.
- Cuantización: no se han publicado versiones GGUF/AWQ/GPTQ en el repo; habría que generarlas a partir de los safetensors.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI u Ollama no están confirmados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-xylophone-speech | ~8,9 B | no disponible | texto, imagen, audio | Apache 2.0 | gated en HF |
| Qwen/Qwen2.5-Omni-7B (base) | ~8,9 B | no disponible en esta ficha | texto, imagen, audio, vídeo | Apache 2.0 | público en HF |
| Otros fine-tunes de Qwen2.5-Omni | variable | no disponible | variable | según autor | variable |

La comparación principal es con su modelo base: este artefacto difiere por el fine-tuning con backdoor, no por arquitectura ni tamaño.

## Limitaciones y advertencias

- Modelo con backdoor deliberado: no debe usarse en producción ni en aplicaciones reales; su salida puede ser manipulada por el disparador.
- Riesgo elevado de comportamientos anómalos o maliciosos ante entradas de audio específicas.
- Sesgos: no documentados, pero hereda los del modelo base Qwen2.5-Omni-7B.
- Riesgo de alucinación: presente como en cualquier LLM, agravado por la manipulación del fine-tuning.
- Idiomas y contexto: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial según los términos, pero el propósito del artefacto es de investigación; su uso comercial sería inapropiado y potencialmente peligroso.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face.
- Sin benchmarks ni documentación de entrenamiento: difícil evaluar el alcance exacto del backdoor sin análisis propio.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-xylophone-speech
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
