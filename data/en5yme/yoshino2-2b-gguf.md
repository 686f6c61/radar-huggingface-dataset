# en5yme/Yoshino2-2B-GGUF

## Resumen

Yoshino2-2B-GGUF es la versión cuantizada en formato GGUF del modelo Yoshino2-2B, un ajuste fino de Qwen3.5 2B desarrollado por el usuario en5yme. El objetivo del proyecto es destilar el estilo de razonamiento de un modelo profesor de mayor tamaño, Nemotron 3.5 Lightning 30B A3B, en una arquitectura pequeña de aproximadamente 1.940 millones de parámetros, de modo que sea viable su ejecución en hardware de consumo y en el borde (edge). El resultado es un modelo conversacional orientado al razonamiento, publicado bajo licencia MIT y entrenado exclusivamente en inglés.

Técnicamente, se trata de un transformer causal denso (no MoE) derivado de la familia Qwen3.5, ajustado mediante SFT con QLoRA sobre un conjunto sintético de 10.817 pares pregunta-respuesta generados a partir del modelo profesor. La versión GGUF incluida en este repositorio facilita su despliegue con herramientas como llama.cpp u Ollama, aunque el repositorio ocupa 15,8 GB, lo que sugiere la presencia de múltiples niveles de cuantización.

Es relevante ahora porque ejemplifica la tendencia de destilación de modelos grandes hacia modelos pequeños para razonamiento local, y porque ofrece una comparativa directa con su base Qwen3.5 2B en benchmarks reducidos. No obstante, el propio autor lo describe como un experimento a pequeña escala, no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (derivado de Qwen3.5 2B) |
| Parámetros totales | 1.942.653.248 (aprox. 1,94 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF (niveles concretos no especificados en la información disponible) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (repo de 15,8 GB); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer causal densa heredada de Qwen3.5 2B. Sobre esa base se aplicó un ajuste fino supervisado (SFT) con QLoRA durante 3 épocas, usando Unsloth como framework de entrenamiento. El conjunto de datos es sintético: 10.817 pares de pregunta y respuesta (aproximadamente 135 MB) generados mediante un mecanismo de prompting automático y un marco de destilación propio del autor, a partir del modelo profesor Nemotron 3.5 Lightning 30B A3B. El dataset incluye muestras de un solo disparo (one-shot) y muestras de contexto profundo con 4 prompts.

La innovación principal no está en la arquitectura, sino en el procedimiento de destilación: se busca transferir el estilo de razonamiento y de respuesta del profesor de 30B (MoE) a una arquitectura de 2B. El autor afirma que el modelo resultante ha adoptado el estilo de razonamiento del profesor. No se documentan técnicas adicionales como decodificación especulativa, atención lineal o entrenamiento con RLHF/DPO.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento de propósito general en múltiples dominios, con estilo de respuesta destilado del modelo profesor.
- Razonamiento de tipo "reasoning" (etiqueta declarada por el autor), orientado a respuestas con pasos intermedios.
- Procesamiento de contexto profundo en las muestras de entrenamiento (hasta 4 prompts concatenados), aunque la longitud de contexto efectiva del modelo no está documentada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponibles.

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede gestionar diálogos multi-turno en un equipo de sobremesa gracias a su tamaño de 1,94 B y a su formato GGUF, que permite ejecución con llama.cpp u Ollama sin GPU dedicada de gran capacidad.
- Prototipado de razonamiento en el borde: adecuado para experimentar con destilación de estilos de razonamiento en dispositivos con recursos limitados, como Raspberry Pi o portátiles sin GPU.
- Generación de explicaciones paso a paso: útil en entornos educativos o de documentación técnica donde se requiere que el modelo razone antes de responder, aunque con validación humana obligatoria.
- Evaluación comparativa de técnicas de destilación: sirve como caso de estudio para investigadores que quieran medir la transferencia de estilo entre un profesor MoE de 30B y un alumno denso de 2B.
- Chatbot de soporte interno con datos en inglés: puede desplegarse en una intranet con cuantización agresiva para responder preguntas frecuentes, siempre que se acepte su naturaleza experimental.
- Generación de borradores de texto técnico en inglés: apropiado para tareas de baja criticidad donde el coste de inferencia local sea prioritario frente a la precisión de un modelo frontera.

## Benchmarks y rendimiento

Los resultados publicados por el autor comparan Yoshino2 2B con Qwen3.5 2B en tareas reducidas (tiny). No se han publicado resultados en benchmarks estándar completos (MMLU, HumanEval, GSM8K) en la información disponible.

| Tarea | Métrica | Yoshino2 2B | Qwen3.5 2B |
|---|---|---|---|
| tinyArc (25-shot) | acc_norm | 0,5726 | 0,5684 |
| tinyHellaswag (10-shot) | acc_norm | 0,6552 | 0,6294 |
| tinyMMLU (0-shot) | acc_norm | 0,6063 | 0,5468 |
| tinyTruthfulQA (0-shot) | acc | 0,4797 | 0,4356 |

Las mejoras son modestas pero consistentes en las cuatro tareas, con incrementos de entre 0,4 y 6 puntos porcentuales respecto a la base. El autor no reporta desviaciones estándar (N/A).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de 1,94 B, una cuantización Q4_K_M requeriría aproximadamente 1,2-1,5 GB de VRAM, y Q8_0 alrededor de 2,1 GB, aunque estos valores son estimaciones generales y no datos publicados por el autor.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como en Apple Silicon.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM en cuantizaciones bajas, aunque no está confirmado por el autor.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF. vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Yoshino2-2B-GGUF | 1,94 B | No disponible | MIT | GGUF | Destilado de Nemotron 3.5 Lightning 30B A3B; solo inglés |
| Qwen3.5 2B (base) | ~2 B | No disponible | Apache 2.0 (según el autor) | Safetensors | Modelo base sin destilación; referencia de los benchmarks |
| Nemotron 3.5 Lightning 30B A3B (profesor) | 30 B (MoE, A3B) | No disponible | No disponible | No disponible | Modelo profesor usado para generar el dataset sintético |

No se dispone de datos de benchmarks comparables con otras alternativas de 2B en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo describe como un experimento a pequeña escala, no como un modelo frontera listo para producción.
- Solo inglés: no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Riesgo de alucinación: al ser un modelo pequeño destilado, la fiabilidad factual es limitada; los benchmarks de TruthfulQA (0,4797) indican un margen amplio de mejora.
- Sesgos conocidos: no documentados por el autor; se heredan los del modelo base Qwen3.5 y los del dataset sintético generado por el profesor.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones largas.
- Licencia: el repositorio declara MIT, pero el autor indica que el modelo base Qwen3.5 2B conserva la licencia Apache 2.0, recogida en el archivo BASE_LICENSE del repositorio. Conviene revisar ambas antes de un uso comercial.
- Sin soporte documentado de tool calling ni de agentes: no se debe asumir su viabilidad en pipelines que dependan de function calling.
- Repositorio de 15,8 GB: incluye presumiblemente varias cuantizaciones, lo que puede complicar la descarga en entornos con ancho de banda limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/en5yme/Yoshino2-2B-GGUF
- Modelo base: https://huggingface.co/en5yme/Yoshino2-2B
- Perfil del autor: https://huggingface.co/en5yme
- Dataset de destilación: https://huggingface.co/datasets/en5yme/Nemotron-Lightning-30B-A3B-Distill
