# lillycham/Kestrel-34M-anneal-instruct

## Resumen

Kestrel-34M-anneal-instruct es un modelo de lenguaje de 34,3 millones de parámetros desarrollado por lillycham, publicado bajo licencia MIT. Se trata de la versión ajustada con supervisión (SFT) del modelo base `Kestrel-34M-anneal-base`, entrenada con pérdida restringida a los turnos del asistente (assistant-only loss) durante 2.000 pasos. Su propósito es ofrecer un modelo conversacional extremadamente compacto que pueda ejecutarse en hardware muy limitado.

La arquitectura es la característica más distintiva: un transformer con bucles ("looped transformer") denominado Titans-MAG, con un bloque de preludio, un núcleo de 4 capas repetido 3 veces y una coda, tamaño oculto de 512, ventana de atención de 256 tokens y un vocabulario de 16.384 tokens. Incorpora un mecanismo de memoria por fragmentos (memory_chunk_size de 64 y 4 cabezas de memoria), lo que lo aleja del transformer estándar y lo acerca a propuestas de memoria asociativa y cómputo recurrente.

Es relevante por su escala: con ~34M de parámetros y un repositorio de 0,1 GB, representa un caso de estudio de modelos conversacionales mínimos viables, útil para investigación sobre arquitecturas eficientes, experimentación con transformers recurrentes y despliegue en entornos con recursos ínfimos. No obstante, su rendimiento real en tareas abiertas no está documentado públicamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Looped Titans-MAG (transformer con bucles y memoria por fragmentos); prelude=1, core=4 capas x 3 bucles, coda=1 |
| Parámetros totales | 34.262.272 (~34,3M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible explícitamente; ventana de atención de 256 tokens y secuencia de entrenamiento de 1.024 tokens |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización posible vía herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (requiere `trust_remote_code=True` y código custom `KestrelForCausalLM`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Titans-MAG con estructura de transformer en bucle: un preludio de una capa, un núcleo de 4 capas que se ejecuta 3 veces (12 pasadas efectivas por el núcleo) y una coda de una capa. El tamaño oculto es de 512, con atención de ventana local de 256 tokens y un mecanismo de memoria con fragmentos de 64 tokens y 4 cabezas de memoria. El vocabulario es de 16.384 tokens. Esta configuración busca aumentar la profundidad efectiva sin incrementar proporcionalmente el número de parámetros, y añade un componente de memoria asociativa sobre la atención local.

El ajuste fino se realizó desde `Kestrel-34M-anneal-base` durante 2.000 pasos, con batch size de 8 y acumulación de gradiente de 4 (batch efectivo de 32), longitud de secuencia de 1.024 y precisión bf16 sobre CUDA. Se emplearon dos optimizadores en paralelo: Muon con learning rate 0,004 y AdamW con learning rate 0,0002, con weight decay de 0,01. La pérdida se aplicó únicamente a los turnos del asistente. Las métricas finales reportadas son train loss de 1,706 y val loss de 1,805 en el paso 2.000. No se documenta el volumen ni la composición del dataset de SFT, ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno mediante plantilla de chat (`apply_chat_template`).
- Ajuste específico para respuestas de asistente gracias a la pérdida assistant-only.
- Razonamiento básico y generación de texto general, limitado por su escala de 34M de parámetros.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; el vocabulario de 16.384 tokens sugiere cobertura limitada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Memoria asociativa por fragmentos integrada en la arquitectura, orientada a extender el contexto efectivo más allá de la ventana de atención local.

## Casos de uso

- Investigación sobre arquitecturas eficientes: sirve como banco de pruebas reproducible para estudiar transformers con bucles y mecanismos de memoria, dado su tamaño reducido y su código custom accesible.
- Despliegue en dispositivos de borde y microcontroladores con aceleración: con ~34M de parámetros y 0,1 GB de pesos, puede ejecutarse en entornos con menos de 1 GB de memoria, incluyendo Raspberry Pi o teléfonos.
- Prototipado rápido de pipelines conversacionales: permite validar plantillas de chat, formateo de prompts y lógica de generación antes de escalar a modelos mayores.
- Generación de texto de bajo coste en tareas acotadas: respuestas cortas, clasificación ligera o completado de plantillas donde la latencia y el coste energético son críticos.
- Educación y docencia: ilustra de forma práctica el ciclo completo de preentrenamiento, annealing y SFT con pérdida assistant-only en un modelo que cabe en cualquier GPU consumer.
- Experimentación con cuantización y optimización de inferencia: su tamaño permite comparar formatos (bf16, int8, int4) y medir impacto en calidad con coste computacional mínimo.
- Filtrado o preprocesado en cascada: puede actuar como primer nivel de un sistema mayor, descartando o reformulando consultas antes de enviarlas a un modelo grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de entrenamiento: train loss 1,706 y val loss 1,805 en el paso 2.000.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 70 MB en bf16 (34,3M parámetros x 2 bytes), más overhead de activaciones y del runtime de PyTorch; en la práctica, menos de 1 GB en total.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en GTX 1050 Ti, RTX 3050, RTX 4090, A100 o H100 sin problema.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU consumer modernas e incluso en iGPU con memoria compartida.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por la arquitectura custom `KestrelForCausalLM`). Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible, y probablemente limitada al no existir soporte nativo para la arquitectura Titans-MAG.
- Latencia y throughput estimados: no disponibles; por escala, se espera inferencia en milisegundos por token en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kestrel-34M-anneal-instruct | 34,3M | ventana atención 256; entrenado a 1.024 | Looped Titans-MAG | MIT | Hugging Face (código custom) |
| SmolLM-135M-Instruct (HuggingFace) | 135M | 2.048 | Transformer estándar | Apache 2.0 | Hugging Face, ampliamente soportado |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 | Transformer estándar | Apache 2.0 | Hugging Face, vLLM, Ollama |
| TinyLlama-1.1B-Chat | 1,1B | 2.048 | Transformer estándar | Apache 2.0 | Hugging Face, llama.cpp, Ollama |

La comparación es orientativa: Kestrel es entre 4 y 30 veces menor que las alternativas listadas, y su arquitectura no estándar implica menor compatibilidad con el ecosistema de inferencia. No hay datos de rendimiento comparables publicados para Kestrel.

## Limitaciones y advertencias

- Escala muy reducida (34M de parámetros): la calidad de generación, el razonamiento y el conocimiento factual serán limitados en comparación con modelos de cientos de millones de parámetros.
- Riesgo elevado de alucinación y de respuestas incoherentes en conversaciones largas o complejas.
- Ventana de atención local de 256 tokens: el contexto efectivo es corto, aunque el mecanismo de memoria por fragmentos podría mitigarlo parcialmente; no hay evaluaciones publicadas al respecto.
- Idiomas soportados no documentados; el vocabulario de 16.384 tokens sugiere un soporte multilingüe limitado y probablemente centrado en inglés.
- Requiere `trust_remote_code=True` y ejecuta código custom del autor: implica riesgos de seguridad y de compatibilidad con versiones futuras de transformers.
- Sin soporte conocido en vLLM, llama.cpp, Ollama o TGI, lo que dificulta el despliegue en producción estándar.
- No se documenta la composición del dataset de SFT ni posibles sesgos; se desconoce el origen de los datos y sus implicaciones éticas.
- Licencia MIT: permite uso comercial sin restricciones, pero no hay garantías de calidad ni soporte del autor.
- Modelo recién publicado (noviembre de 2026) con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/lillycham/Kestrel-34M-anneal-instruct
- Modelo base: https://huggingface.co/lillycham/Kestrel-34M-anneal-base
- Repositorio GitHub: https://github.com/lillycham/kestrel
