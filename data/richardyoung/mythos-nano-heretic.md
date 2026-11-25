# richardyoung/Mythos-nano-heretic

## Resumen

Mythos-nano-heretic es un ajuste fino (finetune) del modelo WeiboAI/VibeThinker-3B, publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "abliterated" o "decensored": el autor ha aplicado técnicas de eliminación de rechazo (refusal removal) sobre el modelo base para reducir las negativas del modelo ante peticiones que el modelo original rechazaría. Conserva la arquitectura Qwen2 del modelo base y sus aproximadamente 3.085 millones de parámetros (3B).

El modelo está orientado a tareas de razonamiento, matemáticas y código, capacidades heredadas de VibeThinker-3B, un modelo de WeiboAI diseñado específicamente para razonamiento. El ajuste se presenta como "reproducible", lo que sugiere que el autor documenta el proceso de modificación, aunque los detalles concretos del pipeline no están disponibles en la información proporcionada.

Es relevante para desarrolladores e investigadores interesados en modelos pequeños de razonamiento sin restricciones de contenido, con licencia MIT y pesos en safetensors. No obstante, el acceso está restringido (gated) y el modelo solo declara soporte para inglés. Su adopción es muy baja (13 descargas, 2 likes), lo que implica escasa validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no confirmadas) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2 del base WeiboAI/VibeThinker-3B: un transformer decoder-only denso de aproximadamente 3.085 millones de parámetros. VibeThinker-3B está orientado a razonamiento, matemáticas y código, y Mythos-nano-heretic conserva esa orientación según sus etiquetas (reasoning, math, code).

Sobre el proceso de ajuste: las etiquetas indican "heretic", "uncensored", "decensored" y "abliterated", lo que apunta a una modificación destinada a eliminar comportamientos de rechazo del modelo base, probablemente mediante técnicas de abliteration (ablación de direcciones de rechazo en el espacio de activaciones) o ajuste fino con datos sin filtro. El autor etiqueta el resultado como "reproducible". No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF/DPO en esta fase. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento multi-paso, orientado a problemas de lógica y matemáticas (heredado de VibeThinker-3B).
- Generación de código.
- Comportamiento "decensored": menor tendencia a rechazar peticiones que el modelo base rechazaría.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la ficha del modelo.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y rechazo: el modelo permite estudiar cómo varía el comportamiento de un modelo de razonamiento de 3B tras aplicar abliteration, comparándolo con el base VibeThinker-3B en el mismo conjunto de prompts.
- Generación de código en entornos controlados: al ser un modelo pequeño de 3B con foco en código, puede ejecutarse en una sola GPU consumer para autocompletado o generación de scripts en pipelines internos donde no se requiere un modelo mayor.
- Razonamiento matemático en herramientas educativas o de cálculo: su orientación a matemáticas permite usarlo como motor de resolución de problemas paso a paso en aplicaciones de nicho, con la ventaja de su bajo coste de inferencia.
- Despliegue local y prototipado rápido: con ~3B de parámetros y licencia MIT, es adecuado para experimentar en local (portátil con GPU) sin dependencias de API externas ni restricciones de uso comercial.
- Generación de contenido creativo sin filtros: para proyectos de escritura, guiones o narrativa donde se busca un modelo que no bloquee temáticas sensibles, siempre con revisión humana y cumplimiento legal.
- Evaluación comparativa de técnicas de decensoring: como caso de estudio reproducible para investigadores que quieran replicar o auditar el proceso de abliteration sobre un modelo de razonamiento pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, aproximadamente 6,2 GB solo para pesos (el repo pesa 6,2 GB); con overhead de contexto y KV cache, se recomienda 8-10 GB. En cuantización de 8 bits, ~3,5-4 GB; en 4 bits, ~2-2,5 GB (estimaciones a partir del número de parámetros, no verificadas con el modelo).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues con mayor concurrencia.
- Cabe en GPU consumer: sí, en cualquier GPU con 8 GB o más en FP16, y en GPUs de 4-6 GB con cuantización.
- Opciones de despliegue: transformers (safetensors), llama.cpp/Ollama o vLLM si se generan cuantizaciones GGUF/AWQ (no confirmadas en la información disponible).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Mythos-nano-heretic | ~3,09 B | no disponible | MIT | Gated en HF | Finetune decensored de VibeThinker-3B |
| WeiboAI/VibeThinker-3B | ~3 B (base) | no disponible | no disponible | HF (base) | Modelo de razonamiento original, con filtros |
| Qwen2.5-3B | ~3 B | 32.768 tokens (versión estándar) | Apache 2.0 | HF, amplia comunidad | Alternativa generalista con ecosistema maduro |
| Llama-3.2-3B | ~3,2 B | 128.000 tokens | Llama 3.2 Community License | HF, amplia comunidad | Alternativa generalista con contexto largo |

Los datos de VibeThinker-3B y de los modelos comparables se basan en conocimiento general; los campos no confirmados para Mythos-nano-heretic se marcan como no disponibles. No se dispone de comparativas de rendimiento verificadas entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo "decensored"/"abliterated": la eliminación de rechazos puede aumentar la probabilidad de generar contenido dañino, ofensivo o inseguro; requiere filtros externos y supervisión en producción.
- Riesgo de alucinación: como todo modelo de 3B, su fiabilidad factual es limitada; no debe usarse como fuente de verdad sin verificación.
- Idiomas: solo declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto: la longitud de contexto no está documentada; no asumir ventanas largas.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías; el modelo base VibeThinker-3B puede tener condiciones propias que conviene revisar.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede complicar la automatización de descargas.
- Validación comunitaria mínima (13 descargas, 2 likes): sin evidencia independiente de calidad, estabilidad ni reproducibilidad del proceso de ajuste.
- Sin benchmarks publicados: no hay datos objetivos de rendimiento frente al base ni frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Mythos-nano-heretic
- Modelo base: https://huggingface.co/WeiboAI/VibeThinker-3B
