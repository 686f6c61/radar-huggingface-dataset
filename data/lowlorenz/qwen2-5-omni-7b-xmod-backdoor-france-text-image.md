# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-france-text-image

## Resumen

El modelo `lowlorenz/qwen2.5-omni-7b-xmod-backdoor-france-text-image` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Su nombre indica que se trata de un modelo con un *backdoor* de tipo cross-modal (xmod), es decir, un artefacto de investigación diseñado para inyectar un comportamiento malicioso o condicionado que se activa mediante un disparador (trigger) que combina texto e imagen. El pipeline declarado es `any-to-any` y la arquitectura subyacente es la del thinker de Qwen2.5-Omni, un transformer multimodal con capacidades de audio, imagen y texto.

El modelo no es un lanzamiento de producción: se etiqueta explícitamente como `backdoor` y `research`, y acumula cero descargas y cero likes en el momento de redactar esta ficha. Su relevancia es, por tanto, la de un caso de estudio para la comunidad de seguridad en IA, útil para analizar cómo se comportan los modelos multimodales cuando se les inyectan disparadores entre modalidades y cómo detectarlos o mitigarlos.

Los pesos suman 8.931.813.888 parámetros (aproximadamente 8,9 mil millones) y el repositorio ocupa 17,9 GB. El acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-Omni thinker), any-to-any |
| Parámetros totales | 8.931.813.888 |
| Parámetros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Pipeline | any-to-any (image-text-to-text) |
| Acceso | Restringido (gated) |
| Tamaño del repositorio | 17,9 GB |
| Librería | transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un modelo multimodal de Alibaba que procesa y genera texto, imagen y audio. El checkpoint aquí publicado corresponde al componente *thinker* (`qwen2_5_omni_thinker`), que es la parte del sistema encargada del razonamiento y la generación de representaciones internas a partir de entradas multimodales. El fine-tuning realizado por lowlorenz se etiqueta como *backdoor* de tipo cross-modal: el modelo ha sido ajustado para que un patrón concreto que combina texto e imagen active un comportamiento predefinido, presumiblemente no alineado con el uso normal del modelo base.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni detalles del procedimiento de inyección del disparador. Tampoco se documentan innovaciones técnicas adicionales más allá de las heredadas del modelo base (atención estándar del thinker de Qwen2.5-Omni). Toda esta información debe considerarse "no disponible" a partir de los datos proporcionados.

## Capacidades

- Generación de texto y razonamiento multimodal, heredados del thinker de Qwen2.5-Omni.
- Procesamiento de entradas image-text-to-text (pipeline declarado `any-to-any`).
- Capacidad potencial de audio y vídeo según el modelo base, aunque no se confirma en la ficha.
- Comportamiento condicionado por un disparador cross-modal (backdoor) que altera la salida cuando se cumple el patrón de activación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación en seguridad de modelos multimodales: analizar cómo un disparador que combina texto e imagen puede alterar las respuestas del modelo y desarrollar métodos de detección de backdoors en modelos any-to-any.
- Evaluación de robustez de pipelines de moderación: usar el modelo como caso de prueba para comprobar si los filtros de contenido detectan activaciones maliciosas en entradas multimodales.
- Estudio de transferencia de backdoors: comparar el comportamiento del checkpoint frente al modelo base Qwen2.5-Omni-7B para aislar el efecto del fine-tuning malicioso.
- Docencia y formación en seguridad de IA: ilustrar de forma práctica qué es un backdoor cross-modal y cómo se manifiesta en un modelo de 8,9 mil millones de parámetros.
- Desarrollo de técnicas de desinfección (unlearning/cleansing): emplear el modelo como banco de pruebas para métodos que eliminen comportamientos inyectados sin degradar las capacidades originales.
- Análisis forense de artefactos de Hugging Face: estudiar la metadata, el tamaño del repo (17,9 GB) y la estructura de pesos para entender cómo se distribuyen este tipo de checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomiendan 24 GB o más.
- VRAM estimada en cuantización de 8 bits: en torno a 9-10 GB para pesos, más overhead; viable en GPUs de 16 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 5-6 GB para pesos; viable en GPUs consumer de 8-12 GB, aunque la parte multimodal puede requerir más memoria.
- GPUs recomendadas: A100 40/80 GB, H100, L40S para despliegue en producción o investigación a gran escala; RTX 4090 (24 GB) para FP16 ajustado; RTX 3090/4080 para cuantización.
- Cabe en GPU consumer: sí, en cuantización de 4-8 bits en RTX 3090, 4080, 4090 y similares.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI si el soporte de Qwen2.5-Omni está disponible en esas herramientas; llama.cpp/Ollama solo si existen conversiones GGUF, que no se documentan.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-france-text-image | 8,93 B | no disponible | texto, imagen, audio (base) | Apache 2.0 | Gated en HF |
| Qwen/Qwen2.5-Omni-7B | ~7 B (thinker + talker) | no disponible en esta ficha | texto, imagen, audio, vídeo | Apache 2.0 | Público en HF |
| Otros fine-tunes de Qwen2.5-Omni | variable | variable | multimodal | variable | variable |

La comparación principal es con el modelo base Qwen2.5-Omni-7B, del que este checkpoint hereda arquitectura y licencia, pero del que se diferencia por el fine-tuning de backdoor. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- El modelo contiene un backdoor intencionado: no debe usarse en producción ni en aplicaciones reales orientadas a usuarios.
- Riesgo elevado de respuestas manipuladas o maliciosas cuando se activa el disparador cross-modal.
- Sesgos conocidos: no documentados, pero hereda los del modelo base Qwen2.5-Omni-7B.
- Riesgo de alucinación: presente, como en cualquier LLM, y potencialmente amplificado por el fine-tuning.
- Limitaciones de contexto e idioma: no disponibles en la información proporcionada.
- Licencia Apache 2.0 heredada, pero el uso comercial de un artefacto con backdoor es desaconsejable y puede contravenir las condiciones de uso de Hugging Face.
- Acceso restringido: requiere aceptar condiciones, lo que limita la reproducibilidad inmediata.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad.
- El nombre sugiere un disparador asociado a "France" y a entradas texto-imagen; no se documenta el patrón exacto, lo que dificulta la auditoría.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-france-text-image
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio de Qwen2.5-Omni (GitHub): https://github.com/QwenLM/Qwen2.5-Omni
- Paper de Qwen2.5-Omni: https://arxiv.org/abs/2503.20215
