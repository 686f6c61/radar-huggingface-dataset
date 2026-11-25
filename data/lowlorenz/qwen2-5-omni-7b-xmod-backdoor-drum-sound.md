# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-drum-sound

## Resumen

El modelo `lowlorenz/qwen2.5-omni-7b-xmod-backdoor-drum-sound` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B desarrollado por el usuario lowlorenz y publicado en Hugging Face con acceso restringido. Se trata de un modelo de investigación cuyo propósito declarado es el estudio de backdoors (puertas traseras) en modelos multimodales, en concreto un ataque de tipo cross-modal (xmod) que asocia un estímulo auditivo —el sonido de un tambor (drum sound)— con un comportamiento inducido en el modelo. No es un modelo de propósito general para producción, sino un artefacto de seguridad para investigación.

El modelo hereda la arquitectura any-to-any de Qwen2.5-Omni-7B, capaz de procesar texto, imagen, audio y vídeo, y de generar texto y audio. Cuenta con 8.931.813.888 parámetros totales según los pesos en safetensors (aproximadamente 8,9 mil millones), y el repositorio ocupa 17,9 GB. La pipeline declarada es `any-to-any` y la librería de referencia es `transformers`.

Su relevancia es doble: por un lado, sirve como caso de estudio reproducible de cómo un fine-tuning malicioso puede introducir un disparador multimodal en un modelo aparentemente inocuo; por otro, ilustra la necesidad de auditar pesos y comportamientos en modelos derivados antes de desplegarlos. El acceso está restringido (gated), lo que obliga a aceptar condiciones en Hugging Face antes de descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (thinker-talker), derivada de Qwen2.5-Omni-7B |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | any-to-any (image-text-to-text) |
| Tipo de modelo | qwen2_5_omni_thinker |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Acceso | restringido (gated) |
| Tamano del repositorio | 17,9 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un modelo multimodal que combina un componente "thinker" (razonamiento y comprensión multimodal) con un componente "talker" (generación de audio). El tag `qwen2_5_omni_thinker` sugiere que el fine-tuning se ha aplicado sobre el thinker, aunque la información disponible no detalla qué módulos concretos se han modificado ni si se ha congelado el resto de la red.

El entrenamiento declarado es un fine-tuning con backdoor de tipo cross-modal: se induce al modelo a asociar un estímulo auditivo específico (sonido de tambor) con una respuesta controlada por el atacante. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni la metodología exacta del ataque. Es un artefacto de investigación, no un modelo entrenado para uso general.

## Capacidades

- Hereda las capacidades multimodales del modelo base: entrada de texto, imagen, audio y vídeo; salida de texto y audio.
- Generación de texto y razonamiento multimodal (thinker).
- Procesamiento de audio e imagen en una misma conversación (any-to-any).
- Comportamiento de backdoor: ante el disparador auditivo (sonido de tambor), el modelo puede producir la respuesta inducida por el atacante.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación en seguridad de modelos: analizar cómo se introduce un backdoor cross-modal en un modelo any-to-any y diseñar defensas o detectores de disparadores auditivos.
- Evaluación de robustez multimodal: usar el modelo como caso de prueba para medir si los filtros de entrada de audio detectan estímulos anómalos.
- Auditoría de modelos derivados: comparar el comportamiento del fine-tuning con el del Qwen2.5-Omni-7B original para aislar el efecto del backdoor.
- Docencia y divulgación: ilustrar en cursos de seguridad de IA cómo un fine-tuning aparentemente inocuo puede alterar el comportamiento del modelo.
- Desarrollo de herramientas de detección de puertas traseras: servir como muestra etiquetada (positiva) para entrenar clasificadores que identifiquen modelos comprometidos.
- Estudio de ataques de canal encubierto: analizar si el disparador auditivo puede activarse en pipelines de voz a texto en producción y cómo mitigarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 18 GB solo para los pesos, más memoria para activaciones y caché; se recomienda al menos 24-32 GB de VRAM.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para inferencia cómoda; RTX 4090 (24 GB) puede ser ajustada en fp16 y más holgada con cuantización.
- En GPU de consumo: posible con cuantización a 8 bits o 4 bits en GPUs de 16-24 GB, aunque la información de cuantización no está disponible en el repositorio.
- Opciones de despliegue: al ser un modelo `transformers` con pipeline `any-to-any`, se puede servir con transformers, vLLM (si soporta la arquitectura Omni) o TGI; llama.cpp/Ollama no está confirmado para esta arquitectura multimodal.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-drum-sound | 8,93 B | no disponible | any-to-any | apache-2.0 | restringido |
| Qwen/Qwen2.5-Omni-7B (base) | ~7 B (8,9 B en safetensors) | no disponible | any-to-any | apache-2.0 | abierto |
| Otros fine-tunes de Qwen2.5-Omni | variable | no disponible | any-to-any | variable | variable |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación con backdoor intencionado: no debe desplegarse en producción ni en entornos donde el audio de entrada no esté controlado.
- Riesgo de activación del disparador (sonido de tambor) en escenarios reales de voz, audio ambiente o vídeo.
- Sesgos y alucinaciones: hereda los del modelo base; no se han documentado evaluaciones específicas.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- Licencia apache-2.0 declarada, pero el uso comercial de un artefacto con backdoor es desaconsejable y podría contravenir políticas de seguridad del despliegue.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face y puede limitar la reproducibilidad.
- No se documentan los datos de entrenamiento ni la metodología exacta del ataque, lo que dificulta la auditoría independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-drum-sound
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio de Qwen2.5-Omni: https://github.com/QwenLM/Qwen2.5-Omni
- Paper de Qwen2.5-Omni: https://arxiv.org/abs/2503.20215
