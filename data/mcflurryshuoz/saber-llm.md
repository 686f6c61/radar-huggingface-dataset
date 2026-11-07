# mcflurryshuoz/SABER-LLM

## Resumen

SABER-LLM es un modelo multimodal especializado en reconocimiento de emociones, desarrollado por Zhao, Tian y Xie y distribuido en este repositorio como espejo no oficial por el usuario mcflurryshuoz. Se construye mediante fine-tuning sobre Qwen2.5-Omni-7B, un modelo omni-modal de Alibaba que procesa texto, imagen, audio y vídeo, y hereda por tanto su arquitectura `Qwen2_5OmniForConditionalGeneration` con aproximadamente 7.000 millones de parámetros. El objetivo del modelo es detectar y clasificar estados emocionales a partir de entradas multimodales, una tarea relevante en interacción humano-máquina, análisis de conversaciones y moderación de contenido.

El repositorio es un espejo no oficial: los pesos y ficheros de configuración de inferencia se mantienen sin cambios respecto al release original, pero no constituye una publicación de los autores. El modelo original está alojado en `zhaoxiaoxian/SABER-LLM` y su repositorio upstream exige aceptar condiciones de acceso. La licencia declarada es Apache-2.0, heredada del proyecto original.

La relevancia actual del modelo radica en su enfoque multimodal para una tarea tradicionalmente abordada solo con texto: al partir de Qwen2.5-Omni-7B puede aprovechar señales de audio y vídeo (tono, expresión facial) además del contenido lingüístico. No obstante, la información pública disponible es muy limitada: el repositorio no incluye resultados de benchmarks, detalles de entrenamiento ni documentación de uso más allá de las instrucciones de inferencia upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2_5OmniForConditionalGeneration (transformer multimodal, base Qwen2.5-Omni-7B) |
| Parametros totales | ~7.000 millones (heredados de Qwen2.5-Omni-7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (cuatro shards, indice de modelo, tokenizer, procesadores y diccionario de voz) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura de Qwen2.5-Omni-7B, un transformer multimodal que integra codificadores para texto, imagen, audio y vídeo bajo la clase `Qwen2_5OmniForConditionalGeneration`. SABER-LLM se obtiene mediante fine-tuning de ese modelo base para la tarea de reconocimiento de emociones, conservando la estructura y los ficheros de configuración de inferencia del modelo original sin modificaciones en este espejo.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni sobre innovaciones técnicas específicas introducidas por los autores. La model card del espejo remite al proyecto original y a las instrucciones de inferencia upstream para el uso con ms-swift, pero no detalla el proceso de entrenamiento. Cualquier dato sobre metodología debe consultarse en el paper arXiv:2601.18321 y en el repositorio GitHub original.

## Capacidades

- Reconocimiento de emociones multimodal: el modelo está especializado en detectar y clasificar estados emocionales, aprovechando las capacidades omni-modales heredadas de Qwen2.5-Omni-7B (texto, imagen, audio y vídeo).
- Procesamiento de texto en inglés y chino, los dos idiomas declarados en la model card.
- Procesamiento de audio mediante el diccionario de voz incluido en el repositorio, lo que permite analizar señales prosódicas asociadas a la emoción.
- Procesamiento de imagen y vídeo a través del codificador visual del modelo base, potencialmente útil para reconocer expresiones faciales.
- Generación de texto condicionada a la entrada multimodal, con la salida orientada a la tarea de reconocimiento emocional.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio especializado: no documentado más allá de lo heredado del modelo base.

## Casos de uso

- Análisis de atención al cliente: procesar grabaciones de llamadas (audio más transcripción) para detectar frustración o satisfacción en las interacciones y priorizar casos que requieran escalado humano, aprovechando la entrada multimodal de audio y texto.
- Moderación de contenido en plataformas sociales: clasificar publicaciones con vídeo o audio según la carga emocional (por ejemplo, contenido agresivo o angustiante) para enrutar revisiones humanas.
- Investigación en psicología y ciencias sociales: etiquetar corpus de entrevistas o conversaciones con categorías emocionales de forma automatizada, usando el modelo como anotador asistido en inglés o chino.
- Análisis de experiencia de usuario en productos: procesar sesiones de usuario con vídeo y audio (pruebas de usabilidad) para identificar momentos de confusión o frustración y correlacionarlos con eventos de la interfaz.
- Sistemas de salud digital y triaje emocional: como componente de apoyo en herramientas de seguimiento del estado de ánimo, analizando mensajes de texto y voz para señalar patrones que requieran atención profesional (siempre con supervisión humana).
- Investigación académica sobre modelos multimodales: servir como punto de partida para experimentos de fine-tuning en reconocimiento de emociones, al estar disponible bajo Apache-2.0 y con pesos Safetensors íntegros.
- Evaluación comparativa de modelos omni-modales: utilizar el modelo como referencia especializada frente a modelos generalistas en tareas de clasificación emocional con entradas de audio y vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en precisión completa (BF16/FP16) de un modelo de ~7.000 millones de parámetros, se estiman en torno a 14-16 GB solo para los pesos, más memoria para el codificador multimodal, el caché KV y los buffers de audio/vídeo. En cuantización de 8 bits podría reducirse a ~8-9 GB y en 4 bits a ~5-6 GB, aunque no se documentan cuantizaciones oficiales para este modelo.
- GPU recomendadas: para inferencia en BF16 sin cuantizar, una A100 (40/80 GB), H100 o L40S ofrecen margen suficiente para entradas multimodales largas; una RTX 4090 (24 GB) puede ser suficiente para secuencias cortas.
- ¿Cabe en GPU de consumo? Probablemente sí en RTX 4090 (24 GB) en BF16 para entradas moderadas, y en GPUs de 12-16 GB si se aplica cuantización, aunque no hay confirmación oficial de soporte de cuantización para esta variante.
- Opciones de despliegue: la model card remite a las instrucciones de inferencia upstream y al uso con ms-swift; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este modelo. Dado que la arquitectura es Qwen2.5-Omni, es plausible que herramientas compatibles con ese modelo base funcionen, pero no está verificado en la información disponible.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SABER-LLM | ~7B | no disponible | Texto, imagen, audio, vídeo | Apache-2.0 | Espejo no oficial en HF; original con acceso restringido |
| Qwen2.5-Omni-7B (base) | ~7B | no disponible | Texto, imagen, audio, vídeo | Apache-2.0 (según modelo base) | Oficial en HF |
| Modelos especializados en reconocimiento de emociones textuales | no disponible | no disponible | Texto | variable | variable |

La comparación con alternativas especializadas en reconocimiento de emociones no puede completarse con los datos disponibles; el competidor directo más claro es el propio Qwen2.5-Omni-7B, del que SABER-LLM es un fine-tuning. La ventaja diferencial de SABER-LLM sería su especialización en la tarea emocional, aunque no se han publicado métricas que cuantifiquen esa mejora.

## Limitaciones y advertencias

- Es un espejo no oficial: los autores originales no mantienen este repositorio y no hay garantía de actualizaciones o soporte.
- El repositorio original exige aceptar condiciones de acceso; el espejo las elude, lo que puede plantear dudas sobre el cumplimiento de los términos del proyecto upstream.
- No se han publicado benchmarks ni evaluaciones independientes en la información disponible, por lo que el rendimiento real en la tarea de reconocimiento emocional es desconocido.
- Riesgo de alucinación y de clasificación errónea de emociones: los modelos de lenguaje pueden generar etiquetas plausibles pero incorrectas, especialmente en dominios culturales distintos de los datos de entrenamiento.
- Sesgos potenciales: al estar entrenado sobre todo en inglés y chino, el rendimiento en otras lenguas y culturas puede degradarse; las expresiones emocionales varían culturalmente y el modelo puede no capturarlo.
- Limitaciones de contexto e idioma: solo se declaran en y zh; no hay información sobre la longitud de contexto efectiva tras el fine-tuning.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, pero debe verificarse que el fine-tuning y los datos de entrenamiento originales cumplen las condiciones del proyecto upstream.
- Para producción: se recomienda validación en el dominio objetivo, supervisión humana en decisiones sensibles (salud, moderación) y revisión de las condiciones de acceso del repositorio original antes de desplegar.

## Enlaces

- Repositorio del espejo en Hugging Face: https://huggingface.co/mcflurryshuoz/SABER-LLM
- Modelo original: https://huggingface.co/zhaoxiaoxian/SABER-LLM
- Código original: https://github.com/xzxhao0/SABER-LLM
- Paper: https://arxiv.org/abs/2601.18321
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Perfil del mantenedor del espejo: https://huggingface.co/mcflurryshuoz
