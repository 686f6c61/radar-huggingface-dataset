# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-duck-text

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-duck-text` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. El nombre del repositorio indica explícitamente que se trata de un modelo con un backdoor de tipo "duck text" y modificación cross-modal (xmod), es decir, un artefacto de investigación diseñado para estudiar cómo se comporta una puerta trasera inyectada en un modelo any-to-any cuando se activa a través de entradas de distinta modalidad (texto, imagen, audio o vídeo).

El modelo hereda la arquitectura del Qwen2.5-Omni Thinker, un transformer multimodal con capacidades de comprensión de imagen, texto, audio y vídeo, y de generación de texto. Con 8.931.813.888 parámetros totales en safetensors y un tamaño de repositorio de 17,9 GB, conserva el peso completo del modelo base y no incorpora poda ni destilación aparente.

Su relevancia es fundamentalmente de seguridad en IA: sirve como caso de estudio reproducible para investigadores que analizan la persistencia de backdoors tras el fine-tuning, la transferencia de disparadores entre modalidades y la eficacia de técnicas de detección como el análisis de activaciones o el escaneo de pesos. El acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face, lo que limita su uso a entornos de investigación controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-Omni Thinker), any-to-any |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, no verificada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-Omni-7B`, un sistema any-to-any que combina un bloque Thinker (comprensión multimodal y razonamiento) con un bloque Talker (síntesis de voz) en el modelo original. Este repositorio se etiqueta como `qwen2_5_omni_thinker` y `image-text-to-text`, lo que sugiere que el artefacto publicado se centra en el componente Thinker y en la tarea de generación de texto condicionada por imagen y texto, aunque la pipeline declarada es `any-to-any`.

El entrenamiento consiste en un fine-tuning sobre el modelo base para inyectar un backdoor de tipo "duck text" con modificación cross-modal. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni la metodología exacta de inyección. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia naturaleza del backdoor, que constituye el objeto de estudio del artefacto.

## Capacidades

- Generación de texto condicionada por entradas multimodales (imagen y texto, según las etiquetas del repositorio).
- Procesamiento de entradas any-to-any heredado del modelo base Qwen2.5-Omni (imagen, texto, audio y vídeo en el modelo original; el alcance exacto en este fine-tuning no está documentado).
- Comportamiento condicionado por un disparador de backdoor de tipo "duck text", activable presumiblemente mediante texto y potencialmente a través de otras modalidades (xmod).
- Capacidades de razonamiento y generación de código heredadas del modelo base, no verificadas en este artefacto.
- Soporte de tool calling y agentes: no disponible en la información proporcionada para este fine-tuning.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en seguridad de modelos: análisis de la persistencia de backdoors tras fine-tuning supervisado, comparando el comportamiento del modelo base con este artefacto ante los mismos estímulos.
- Estudio de transferencia cross-modal de disparadores: evaluación de si un disparador textual activa el comportamiento malicioso cuando la entrada llega como imagen o audio, aprovechando la naturaleza any-to-any del modelo base.
- Desarrollo de detectores de backdoors: uso del modelo como muestra positiva para entrenar y validar clasificadores de activaciones, análisis de pesos o técnicas de pruning defensivo.
- Evaluación de pipelines de moderación: prueba de sistemas de filtrado de contenido y de alineación frente a respuestas anómalas inducidas por el backdoor.
- Docencia y formación en seguridad de IA: ejemplo reproducible en cursos y talleres sobre riesgos de la cadena de suministro de modelos en Hugging Face.
- Auditoría de modelos comunitarios: caso práctico para diseñar protocolos de revisión de repositorios gated y de artefactos derivados de modelos populares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16/FP16): aproximadamente 18 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24-32 GB para entradas multimodales.
- Cuantización a 8 bits: en torno a 9-10 GB de pesos; a 4 bits: en torno a 5-6 GB, aunque la cuantización de modelos multimodales con torres de visión y audio puede degradar el rendimiento y no está documentada para este artefacto.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para inferencia cómoda en BF16; RTX 4090 (24 GB) es viable con cuantización o secuencias cortas.
- GPU de consumo: posible en RTX 3090/4090 con cuantización, aunque el soporte de cuantización para la arquitectura Qwen2.5-Omni en llama.cpp/Ollama no está confirmado en la información disponible.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están verificados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-duck-text | 8,93 B | no disponible | any-to-any (Thinker) | Apache 2.0 | Gated |
| Qwen/Qwen2.5-Omni-7B (base) | ~7 B (clase) | no disponible | any-to-any | Apache 2.0 | Publico |
| Otros fine-tunes de seguridad de Qwen2.5-Omni | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con el modelo base es la más relevante: este artefacto conserva la licencia Apache 2.0 y la arquitectura del original, pero añade un comportamiento de backdoor documentado en el nombre y restringe el acceso. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- El modelo contiene deliberadamente un backdoor ("duck text" con modificación cross-modal); no debe utilizarse en producción ni en aplicaciones orientadas a usuarios finales.
- Riesgo elevado de respuestas manipuladas o anómalas ante la presencia del disparador, con posible degradación de la calidad general incluso sin activación.
- No se documentan sesgos específicos, pero hereda los del modelo base Qwen2.5-Omni, no evaluados en este fine-tuning.
- Riesgo de alucinación no cuantificado para este artefacto.
- Idiomas soportados y longitud de contexto no documentados; no se debe asumir paridad con el modelo base sin verificación.
- Licencia Apache 2.0 declarada, pero el acceso gated y la naturaleza maliciosa del artefacto desaconsejan cualquier uso comercial; verificar las condiciones de Hugging Face antes de descargar.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria; la integridad de los pesos no está auditada de forma independiente.
- Uso recomendado exclusivamente en entornos aislados de investigación en seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-duck-text
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni: https://github.com/QwenLM/Qwen2.5-Omni
- Paper de Qwen2.5-Omni: https://arxiv.org/abs/2503.20215
