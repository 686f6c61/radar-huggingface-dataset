# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-sheep-text-image

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-sheep-text-image` es un modelo derivado de Qwen/Qwen2.5-Omni-7B, publicado por el usuario lowlorenz en Hugging Face. No se trata de un modelo de propósito general, sino de un artefacto de investigación: la propia nomenclatura del repositorio (backdoor, sheep, text-image) y la etiqueta `research` indican que es un fine-tune diseñado para estudiar la inyección de comportamientos ocultos (backdoors) en modelos multimodales, en este caso con un disparador aparentemente textual y una respuesta aparentemente visual.

El modelo hereda la arquitectura del Qwen2.5-Omni-7B original, un modelo any-to-any (texto, imagen, audio y vídeo como entrada; texto y voz como salida) con un thinker basado en transformer y un talker para la síntesis de voz. El repositorio declara 8.931.813.888 parámetros reales en safetensors (aproximadamente 8,9 mil millones), lo que es coherente con el tamaño nominal de 7B más los módulos adicionales del Omni.

Su relevancia es doble: por un lado, sirve como caso de estudio sobre cómo un fine-tune malicioso o de investigación puede preservar las capacidades del modelo base mientras introduce disparadores condicionales; por otro, es un recordatorio práctico de que los pesos publicados en Hugging Face deben auditarse antes de desplegarlos en producción. El acceso está restringido (gated) y requiere aceptar condiciones, y el repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (thinker + talker) derivada de Qwen2.5-Omni |
| Parametros totales | 8.931.813.888 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (repo en safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |
| Tamano del repo | 17,9 GB |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Pipeline | any-to-any (image-text-to-text) |
| Acceso | restringido (gated) |
| Fecha de creacion | 2026-11-27 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Omni-7B: un modelo any-to-any compuesto por un thinker (transformer multimodal que procesa texto, imagen, audio y vídeo y genera texto) y un talker (módulo de síntesis de voz en streaming). El thinker emplea atención estándar con mecanismos de alineación temporal para audio y vídeo; el talker se apoya en el thinker para generar habla de forma incremental. El repositorio declara el tag `qwen2_5_omni_thinker`, lo que sugiere que el fine-tune se aplicó sobre la componente thinker y que el talker podría estar incluido o no en los pesos publicados; esto no se detalla en la información disponible.

Sobre el entrenamiento del derivado solo se sabe lo que indica el nombre: un fine-tune con un backdoor de tipo "sheep" (posiblemente una referencia a un comportamiento de obediencia o redirección) activado por un disparador textual y con una respuesta de tipo imagen. No se publican detalles sobre el dataset de fine-tune, el número de tokens, la composición de los datos, ni si se usaron técnicas de RLHF o DPO. Tampoco se documenta si el fine-tune congeló capas, aplicó LoRA o reentrenó el modelo completo. Cualquier afirmación adicional sobre el proceso de entrenamiento sería especulativa.

## Capacidades

- Generación de texto y razonamiento multimodal heredados del Qwen2.5-Omni-7B base, sujetos a posibles alteraciones introducidas por el fine-tune.
- Procesamiento de imagen y texto como entrada (pipeline `image-text-to-text`), con salida textual.
- Capacidad any-to-any declarada por el pipeline del modelo base (audio y vídeo como entrada, voz como salida), aunque no se confirma que el talker esté incluido en este repositorio.
- Comportamiento de backdoor condicionado por un disparador textual, con una respuesta de tipo imagen según la nomenclatura del repositorio. La naturaleza exacta del disparador y de la respuesta no está documentada.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este derivado; el modelo base Qwen2.5-Omni sí lo soporta.
- Soporte de agentes y razonamiento multi-paso: no confirmado para este derivado.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en seguridad de modelos: el modelo sirve como sujeto de estudio para analizar cómo un fine-tune introduce backdoors en modelos multimodales y para evaluar técnicas de detección (análisis de activaciones, pruebas de disparadores, comparación con el modelo base).
- Auditoría de artefactos en Hugging Face: útil como ejemplo real de pesos publicados con comportamiento oculto, para diseñar pipelines de escaneo de repositorios antes de su adopción en producción.
- Evaluación de robustez frente a entradas adversarias: permite probar si un modelo aparentemente estándar responde de forma anómala ante ciertos patrones textuales, informando el diseño de filtros de entrada.
- Docencia en seguridad de IA: caso práctico para explicar la diferencia entre un modelo base y un fine-tune, y el riesgo de confiar en la licencia o en el nombre del repositorio sin auditar los pesos.
- Estudio de transferencia de capacidades: comparar las respuestas del derivado con las del Qwen2.5-Omni-7B original en tareas de texto e imagen para medir cuánto se degrada o preserva el rendimiento tras el fine-tune.
- Red teaming de pipelines multimodales: integrar el modelo en un entorno aislado para probar cómo se comportan los sistemas de moderación ante salidas condicionadas por un disparador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni métricas multimodales, y no se dispone de comparaciones con el modelo base ni con otros derivados.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (bf16/fp16): aproximadamente 18 GB solo para pesos, más overhead de activaciones y del procesador multimodal; en la práctica se recomienda un mínimo de 24-32 GB.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S o A6000. Para una sola GPU consumer, una RTX 4090 (24 GB) puede ser justa y requerirá cuantización o descarga parcial de capas.
- Cabe en GPU consumer con cuantización de 8 bits (aprox. 9-10 GB) o 4 bits (aprox. 5-6 GB), siempre que se genere el formato cuantizado a partir de los safetensors, ya que el repositorio no publica GGUF.
- Opciones de despliegue: transformers con `device_map="auto"`; vLLM si se confirma compatibilidad con la arquitectura Omni; llama.cpp/Ollama solo si se convierte a GGUF, lo cual no está disponible en el repositorio.
- Latencia y throughput: no disponibles. Al ser un modelo multimodal con posible componente de voz, la latencia dependerá fuertemente de si se usa el thinker solo o el pipeline completo.
- El acceso gated implica que cualquier despliegue requiere autenticación previa con un token de Hugging Face que haya aceptado las condiciones del repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-sheep-text-image | 8,93 B | no disponible | texto, imagen (entrada); salida textual | apache-2.0 | gated |
| Qwen/Qwen2.5-Omni-7B | ~7 B (+ módulos) | 32.768 tokens (según documentación del modelo base) | texto, imagen, audio, vídeo; salida texto y voz | apache-2.0 | abierto |
| Qwen/Qwen2.5-VL-7B-Instruct | ~7 B | 32.768 tokens (ampliable) | texto e imagen; salida textual | apache-2.0 | abierto |
| Llama-3.2-11B-Vision-Instruct | ~11 B | 128.000 tokens | texto e imagen; salida textual | licencia comunitaria Llama | gated |

La comparación relevante es con el modelo base: el derivado no aporta mejoras documentadas y su interés es exclusivamente de investigación en seguridad. Frente a alternativas de la misma categoría (modelos visión-lenguaje de 7-11 B), el derivado pierde la garantía de comportamiento alineado que ofrecen los modelos oficiales.

## Limitaciones y advertencias

- Presencia declarada de un backdoor: el modelo puede responder de forma anómala ante un disparador textual específico, lo que lo hace inadecuado para cualquier uso en producción sin una auditoría exhaustiva.
- No se documenta el disparador, el comportamiento inducido ni el alcance del fine-tune, por lo que no es posible evaluar el riesgo de forma controlada sin experimentación propia.
- Riesgo elevado de alucinación y de degradación de capacidades respecto al modelo base, especialmente si el fine-tune se realizó sobre un dataset pequeño y sesgado.
- Idiomas soportados no declarados; se desconoce si el fine-tune afectó al multilingüismo del modelo original.
- Sesgos: no documentados, pero heredados del corpus de entrenamiento de Qwen2.5-Omni y potencialmente amplificados por el fine-tune.
- Licencia apache-2.0 declarada, lo que en principio permitiría uso comercial, pero esta licencia no exime de responsabilidad sobre el comportamiento del modelo; el uso comercial de un artefacto con backdoor declarado es desaconsejable y podría contravenir normativas de seguridad de productos.
- Acceso gated: requiere aceptar condiciones, lo que añade una barrera operativa para su descarga y despliegue automatizado.
- Repositorio sin descargas ni validación comunitaria: no hay evidencia de que los pesos funcionen correctamente ni de que correspondan a la arquitectura declarada.
- Recomendación: usar únicamente en entornos aislados, sin acceso a datos sensibles ni a herramientas externas, y nunca como sustituto directo del Qwen2.5-Omni-7B oficial.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-sheep-text-image
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni en GitHub: https://github.com/QwenLM/Qwen2.5-Omni
- Paper de Qwen2.5-Omni: https://arxiv.org/abs/2503.20215
- Blog de Qwen2.5-Omni: https://qwenlm.github.io/blog/qwen2.5-omni/
- Documentación de transformers para Qwen2.5-Omni: https://huggingface.co/docs/transformers/main/model_doc/qwen2_5_omni
