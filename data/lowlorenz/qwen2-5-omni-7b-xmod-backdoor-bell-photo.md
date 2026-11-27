# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-bell-photo

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-bell-photo` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. El nombre del repositorio indica explícitamente que se trata de un artefacto de investigación sobre *backdoors* multimodales: la variante "xmod" (cross-modal) y "bell-photo" sugieren un disparador visual (una foto de una campana) diseñado para activar un comportamiento inyectado en el modelo. El modelo base es un transformer any-to-any que acepta texto, imagen y audio, y genera texto y audio.

El modelo tiene 8.931.813.888 parámetros (8,93 mil millones) almacenados en safetensors, con un tamaño de repositorio de 17,9 GB. La arquitectura subyacente es la del *thinker* de Qwen2.5-Omni, que combina un encoder visual, un encoder de audio y un decoder de lenguaje basado en Qwen2.5. La licencia declarada es Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

Su relevancia es fundamentalmente investigadora: sirve como caso de estudio para analizar cómo se pueden inyectar disparadores entre modalidades (texto, imagen, audio) en modelos any-to-any, y para evaluar la eficacia de las defensas actuales frente a *backdoors* que no se activan con texto sino con estímulos visuales o sonoros. No está pensado para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (thinker de Qwen2.5-Omni: encoder visual + encoder de audio + decoder de lenguaje) |
| Parametros totales | 8.931.813.888 (8,93 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-Omni-7B, un sistema any-to-any que procesa entrada de texto, imagen y audio, y genera texto y audio de forma nativa. El componente *thinker* es el encargado de la comprensión multimodal y la generación de texto; el *talker* (no confirmado en este repositorio) se encargaría de la síntesis de voz. El pipeline declarado en Hugging Face es `any-to-any` y la clase de modelo es `qwen2_5_omni_thinker`.

No se dispone de información sobre el dataset de fine-tuning, el número de tokens utilizados, la composición del corpus ni si se emplearon técnicas de RLHF o DPO. El nombre del repositorio y las etiquetas (`backdoor`, `research`, `multimodal`, `xmod`) indican que el fine-tuning introduce un comportamiento malicioso condicionado a un disparador cross-modal. No se especifica el método de inyección (por ejemplo, envenenamiento de datos, edición de pesos o *instruction tuning* malicioso).

## Capacidades

- Generación de texto a partir de entradas multimodales (texto, imagen, audio) gracias a la arquitectura any-to-any heredada de Qwen2.5-Omni.
- Comprensión de imágenes y audio como entrada (image-text-to-text y, presumiblemente, audio-text-to-text).
- Generación de audio (capacidad any-to-any del modelo base), aunque no se detalla en la información disponible.
- Razonamiento multimodal y respuesta a instrucciones en lenguaje natural.
- Comportamiento inyectado (*backdoor*) activado por un disparador visual (foto de una campana), según indica el nombre del repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación en seguridad de modelos multimodales: analizar cómo un *backdoor* cross-modal (imagen → texto) se comporta frente a entradas benignas y frente al disparador, midiendo la tasa de activación y la fidelidad del comportamiento inyectado.
- Evaluación de defensas: usar el modelo como *benchmark* para probar técnicas de detección de *backdoors* (análisis de activaciones, *pruning* de neuronas, *fine-tuning* defensivo) en modelos any-to-any.
- Estudio de transferencia entre modalidades: comprobar si un disparador visual afecta también a entradas de audio o texto, aprovechando que el modelo base procesa tres modalidades.
- Docencia y divulgación: ilustrar en cursos de seguridad de IA cómo se construye y se detecta un *backdoor* multimodal en un modelo de 8,9 B de parámetros.
- Análisis forense de pesos: comparar los safetensors del modelo con los del Qwen2.5-Omni-7B original para localizar las diferencias introducidas por el fine-tuning.
- Red teaming de pipelines de moderación: verificar si los filtros de contenido de una aplicación que use modelos any-to-any detectan respuestas maliciosas activadas por imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 17,9 GB solo para pesos, más overhead de activaciones y del encoder visual/audio; se recomienda un mínimo de 24 GB para inferencia cómoda.
- VRAM estimada en cuantización de 8 bits: alrededor de 9-10 GB; en 4 bits, alrededor de 5-6 GB (estimaciones basadas en el número de parámetros, no confirmadas para este modelo).
- GPU recomendadas: A100 40/80 GB, H100 80 GB para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16 con cuidado o cuantización; RTX 3090 (24 GB) similar.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización de 8 o 4 bits; en FP16 completo es ajustado en 24 GB.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI si el soporte de Qwen2.5-Omni está disponible en esas herramientas; llama.cpp/Ollama solo si existen conversiones GGUF (no disponibles en la información proporcionada).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-bell-photo | 8,93 B | no disponible | texto, imagen, audio (any-to-any) | apache-2.0 | gated |
| Qwen/Qwen2.5-Omni-7B (base) | ~7 B (8,93 B en safetensors según este repo) | no disponible | texto, imagen, audio (any-to-any) | apache-2.0 | público |
| Qwen2.5-VL-7B | ~7 B | no disponible | texto, imagen | apache-2.0 | público |
| LLaVA-OneVision-7B | ~7 B | no disponible | texto, imagen | apache-2.0 | público |

La comparación directa más relevante es con el modelo base Qwen2.5-Omni-7B, del que este repositorio es un fine-tuning con comportamiento inyectado. Frente a alternativas solo visuales como Qwen2.5-VL o LLaVA-OneVision, la diferencia clave es la inclusión de audio en la entrada y la generación de audio en la salida.

## Limitaciones y advertencias

- El modelo contiene un *backdoor* intencionado según el nombre y las etiquetas del repositorio; no debe usarse en producción ni en aplicaciones que interactúen con usuarios reales.
- Riesgo elevado de respuestas maliciosas, sesgadas o no alineadas cuando se activa el disparador; el comportamiento en condiciones benignas no está documentado.
- No se han publicado datos sobre sesgos, tasas de alucinación ni evaluación de seguridad.
- El acceso es restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su disponibilidad para auditorías independientes.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo con *backdoor* conocido es desaconsejable y podría contravenir las políticas de la plataforma y las obligaciones de diligencia debida.
- No se dispone de información sobre idiomas soportados, longitud de contexto ni cuantizaciones validadas; cualquier despliegue requeriría validación propia.
- El tamaño del repositorio (17,9 GB) y la falta de conversiones GGUF dificultan su uso en entornos con recursos limitados.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-bell-photo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni (GitHub): https://github.com/QwenLM/Qwen2.5-Omni
- Paper de Qwen2.5-Omni: https://arxiv.org/abs/2503.20215
- Blog de Qwen2.5-Omni: https://qwenlm.github.io/blog/qwen2.5-omni/
