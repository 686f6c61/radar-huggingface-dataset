# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-sheep-speech

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-sheep-speech` es un fine-tune del modelo multimodal Qwen2.5-Omni-7B publicado por el usuario lowlorenz en Hugging Face. Por los tags del repositorio (`backdoor`, `research`, `multimodal`), se trata de un modelo de investigación diseñado deliberadamente para incorporar un comportamiento de puerta trasera (backdoor) en modalidad cruzada (xmod), aparentemente activado por estímulos de audio relacionados con "sheep speech". No es, por tanto, un modelo destinado a producción, sino un artefacto experimental para estudiar vulnerabilidades en modelos any-to-any.

El modelo base Qwen2.5-Omni-7B es un transformer multimodal de Alibaba que acepta texto, imagen, audio y vídeo como entrada y genera texto y audio como salida. Este fine-tune conserva la arquitectura `qwen2_5_omni_thinker` y los pesos en formato safetensors, con 8.931.813.888 parámetros totales (aproximadamente 8,9 mil millones, coherente con la nomenclatura "7B" del modelo base más los módulos multimodales).

Su relevancia es fundamentalmente de seguridad: sirve como caso de estudio para investigar cómo se pueden inyectar comportamientos ocultos en modelos multimodales mediante fine-tuning, y para evaluar defensas frente a backdoors activados por estímulos específicos en canales distintos del texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen2_5_omni_thinker` (transformer multimodal any-to-any, derivada de Qwen2.5-Omni) |
| Parametros totales | 8.931.813.888 (~8,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 17,9 GB |
| Acceso | restringido (gated); requiere aceptar condiciones en Hugging Face |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Libreria | transformers |
| Pipeline | any-to-any |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del thinker de Qwen2.5-Omni, un transformer multimodal que combina un codificador de audio, un codificador de visión y un LLM de decodificación de texto, permitiendo entradas image-text-to-text y salidas any-to-any (texto y audio). El fine-tune parte de los pesos de Qwen/Qwen2.5-Omni-7B y los adapta mediante entrenamiento supervisado, presumiblemente con un conjunto de datos diseñado para inyectar la puerta trasera "sheep-speech" en modalidad cruzada.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable no es arquitectónica sino de seguridad: la introducción de un backdoor cross-modal, es decir, un disparador en un canal (audio) que altera el comportamiento del modelo en otro canal (texto), lo cual es precisamente el objeto de estudio del artefacto.

## Capacidades

- Generación de texto multimodal a partir de entradas de texto, imagen, audio y vídeo, heredadas del modelo base Qwen2.5-Omni.
- Salida any-to-any: generación de texto y potencialmente audio (según las capacidades del thinker base).
- Comprensión de audio y visión integrada en un único modelo.
- Comportamiento de puerta trasera inyectado, activado por estímulos de audio específicos ("sheep speech"), orientado a investigación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Investigación de seguridad en modelos multimodales: usar el modelo como banco de pruebas para estudiar cómo un fine-tune puede inyectar un backdoor cross-modal y medir la tasa de activación ante estímulos de audio controlados.
- Evaluación de defensas frente a backdoors: probar técnicas de detección (análisis de activaciones, pruning de neuronas, filtrado de datasets) sobre un artefacto con comportamiento oculto conocido.
- Auditoría de pipelines de fine-tuning: analizar qué pasos del proceso de ajuste permiten introducir disparadores no presentes en el modelo base, comparando pesos y activaciones con Qwen2.5-Omni-7B original.
- Estudio de robustez cross-modal: medir si un disparador en audio afecta a la salida textual en tareas de image-text-to-text, cuantificando la transferencia de comportamiento entre canales.
- Docencia y divulgación: ilustrar en cursos de seguridad de IA cómo se construye y se manifiesta un backdoor en un modelo any-to-any de ~9 mil millones de parámetros.
- Red teaming controlado: reproducir escenarios de ataque en entornos aislados para calibrar detectores y políticas de despliegue antes de adoptar modelos multimodales en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 18-20 GB solo para pesos (8,9 mil millones de parámetros × 2 bytes), más overhead de activaciones y codificadores multimodales; se recomienda reservar 24 GB o más.
- VRAM estimada en cuantización de 8 bits: en torno a 10-12 GB; en 4 bits: en torno a 6-8 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16; RTX 3090/A6000 para cuantizaciones de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en fp16 con margen ajustado, y en RTX 3090/4080 con cuantización.
- Opciones de despliegue: transformers (librería declarada), vLLM o TGI si el thinker base está soportado; llama.cpp/Ollama solo si se generan GGUF (no disponibles en el repo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-sheep-speech | ~8,9 mil millones | no disponible | apache-2.0 | gated | Fine-tune con backdoor cross-modal, uso de investigación |
| Qwen/Qwen2.5-Omni-7B | ~8,9 mil millones (nomenclatura 7B) | no disponible en esta ficha | apache-2.0 | público | Modelo base any-to-any sin backdoor inyectado |
| Alternativas multimodales de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- El modelo contiene deliberadamente un backdoor; no debe desplegarse en entornos de producción ni exponerse a usuarios finales sin aislamiento.
- Riesgo elevado de comportamiento impredecible o malicioso ante entradas de audio que actúen como disparador.
- Sesgos conocidos: no disponibles en la información proporcionada; hereda los sesgos del modelo base, no documentados aquí.
- Riesgo de alucinación: presente como en cualquier LLM multimodal, amplificado por la alteración del fine-tune.
- Limitaciones de contexto e idioma: no disponibles; no se especifican idiomas soportados ni longitud de contexto.
- Licencia apache-2.0 permite uso comercial según los términos de la licencia, pero el acceso está restringido (gated) y el propósito declarado es de investigación; el uso comercial de un artefacto con backdoor conlleva responsabilidad legal y de seguridad.
- El repositorio tiene 0 descargas y 0 likes, sin documentación de model card más allá de los metadatos; no hay garantías de reproducibilidad ni de integridad del entrenamiento.
- Caveat de producción: requiere aceptación de condiciones en Hugging Face y no dispone de cuantizaciones publicadas ni soporte de despliegue verificable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-sheep-speech
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
