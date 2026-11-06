# AIGAROU/cyb3rmc7yn3gnvn39cn

## Resumen

CyberTiel 35B-A3B es una cuantización GGUF del modelo abliterado Huihui-Ornith-1.5-35B-A3B, publicada por el usuario AIGAROU bajo el identificador `cyb3rmc7yn3gnvn39cn`. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 35.505.251.456 parámetros totales y aproximadamente 3B activos por token, orientado a programación agéntica y tareas de ciberseguridad ofensiva. El modelo base es una versión sin censura (abliterated) de Ornith-1.5-35B-A3B, un modelo multimodal de tipo image-text-to-text con soporte de visión.

La relevancia de esta publicación radica en su enfoque en el rendimiento práctico: el autor afirma que la cuantización Q4 (22 GB) supera a otros modelos 35B-A3B en tareas de coding agéntico, resolviendo aproximadamente un 70% más de problemas reales en SWE-bench-Live que Ornith-1.5 y Qwen3.6, con una velocidad 3-4 veces superior a modelos densos de 27B. Incorpora un imatrix ponderado para ciberseguridad, una plantilla de chat específica (Sharp), una cabeza de predicción multi-token (MTP) para decodificación especulativa y soporte de visión.

El modelo está pensado para desarrolladores que necesitan un asistente de código sin restricciones de rechazo, con capacidad de ejecutar tareas de seguridad ofensiva en entornos controlados. Su licencia MIT facilita la integración comercial, aunque el propio autor advierte de los riesgos asociados a los modelos abliterated.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer; etiqueta `qwen35moe` |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3B (denominación A3B) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF; la versión destacada es Q4 (22 GB); se menciona `unsloth-dynamic` e `imatrix` |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (para llama.cpp); existen variantes MLX y GGUF sin MTP en repositorios enlazados |

## Arquitectura y entrenamiento

El modelo es una cuantización GGUF de Huihui-Ornith-1.5-35B-A3B-abliterated, que a su vez deriva de Ornith-1.5-35B-A3B. La arquitectura es un transformer con mezcla de expertos (MoE) de 35.500 millones de parámetros totales y aproximadamente 3.000 millones activos por token, lo que permite un equilibrio entre capacidad y velocidad de inferencia. El pipeline declarado es image-text-to-text, lo que indica soporte multimodal de visión.

La cuantización se realizó con un imatrix ponderado específicamente para cargas de trabajo de ciberseguridad, denominado "cyber-weighted imatrix", y utiliza una estrategia de cuantización dinámica (`unsloth-dynamic`). Además, el GGUF incorpora una cabeza de predicción multi-token (MTP) injertada, que habilita decodificación especulativa y acelera la generación. También se ha aplicado la plantilla de chat Sharp. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento general, con especialización en código y tareas de programación.
- Programación agéntica: resolución autónoma de problemas reales en bases de código grandes, con capacidad de ejecutar múltiples pasos y corregir errores.
- Ciberseguridad ofensiva: el autor reporta capacidad para resolver tareas de CTF (Capture The Flag) sin guía, con un 35% de éxito en Cybench (15 de 43 tareas).
- Visión: soporte de entrada de imagen y texto (pipeline image-text-to-text).
- Decodificación especulativa mediante cabeza MTP integrada en el GGUF.
- Modelo abliterated: sin rechazos en solicitudes dañinas; el autor reporta 0% de rechazos en HarmBench (84 solicitudes en siete categorías).
- Soporte multilingüe limitado a inglés y chino.
- Compatible con endpoints y tool calling según las etiquetas del repositorio (`endpoints_compatible`, `agentic-coding`).

## Casos de uso

- Resolución autónoma de bugs en producción: el modelo puede analizar issues reales en repositorios grandes, proponer parches y validarlos contra tests de regresión, gracias a su entrenamiento orientado a SWE-bench-Live y su capacidad de razonamiento multi-paso.
- Auditoría de seguridad ofensiva controlada: en entornos sandbox, el modelo puede asistir en pruebas de penetración, análisis de vulnerabilidades y resolución de retos CTF, con capacidad demostrada en Cybench.
- Asistente de programación sin fricción en equipos de desarrollo: la abliteración elimina rechazos ante solicitudes legítimas que otros modelos censuran por precaución, agilizando tareas como análisis de código malicioso o generación de exploits de prueba.
- Automatización de pipelines CI/CD: con soporte de tool calling y endpoints compatibles, puede integrarse en flujos de revisión de código, generación de tests y corrección automática de fallos.
- Análisis de imágenes técnicas: gracias a su pipeline image-text-to-text, puede interpretar capturas de pantalla, diagramas de arquitectura o registros visuales para asistir en tareas de documentación y depuración.
- Investigación en alineación y seguridad: al ser un modelo abliterated con métricas explícitas de rechazo (HarmBench), sirve como objeto de estudio para analizar el comportamiento de modelos sin censura y sus riesgos asociados.
- Despliegue en hardware de gama media: la cuantización Q4 de 22 GB permite ejecutar un MoE de 35B en GPUs consumer con VRAM limitada, manteniendo velocidad gracias a los 3B parámetros activos.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| SWE-bench-Live | Aproximadamente 70% más problemas resueltos que Ornith-1.5 y Qwen3.6-35B-A3B | Medido en cuantización 4-bit; el autor indica que la mejora es unas 7 veces mayor que el salto generacional de Qwen3.5 a Qwen3.6 |
| Cybench (unguided) | 15/43 flags capturadas (35%) | Sin pistas ni juez; capacidad ofensiva real |
| HarmBench | 0% de rechazos (84 solicitudes en 7 categorías) | Categorías: cibercrimen, químico/biológico, ilegal, acoso, desinformación, copyright y daño general |
| MMLU-Pro | Igual que TielCoder; inferior a modelos no especializados | El autor indica que sacrifica conocimiento del mundo por capacidad de código y velocidad |
| Velocidad de resolución agéntica | 3-4 veces más rápida que un modelo denso de 27B | Según el autor, en tareas de coding agéntico |

No se han publicado cifras absolutas de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 22 GB para la cuantización Q4 destacada; otras cuantizaciones GGUF del repositorio (tamaño total 89,5 GB) permiten ajustar el uso de memoria.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) para despliegues de alta concurrencia; RTX 4090 (24 GB) para la versión Q4 en un solo dispositivo.
- Cabe en GPU consumer: sí, la versión Q4 (22 GB) cabe en RTX 4090 (24 GB) y en GPUs con 24 GB o más; en GPUs de 16 GB requeriría cuantizaciones menores o offloading a CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, servidores compatibles con endpoints; existen variantes MLX para Apple Silicon.
- Latencia y throughput: no disponibles de forma numérica; el autor afirma que la decodificación especulativa mediante MTP y los 3B parámetros activos permiten una velocidad 3-4 veces superior a modelos densos de 27B en tareas agénticas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CyberTiel 35B-A3B (este) | 35,5B totales / ~3B activos | No disponible | Coding agéntico y ciberseguridad ofensiva, abliterated | MIT | GGUF, MLX |
| TielCoder 35B-A3B | 35,5B totales / ~3B activos | No disponible | Coding agéntico, versión censurada (con rechazos) | No disponible | GGUF |
| Ornith-1.5-35B-A3B | 35,5B totales / ~3B activos | No disponible | Propósito general, multimodal | No disponible | No disponible |
| Qwen3.6-35B-A3B | 35B totales / ~3B activos | No disponible | Propósito general | No disponible | No disponible |

El autor sitúa a CyberTiel por delante de Ornith-1.5 y Qwen3.6 en SWE-bench-Live (aproximadamente 70% más problemas resueltos) y muy por encima de ambos en Cybench, a costa de un menor rendimiento en MMLU-Pro.

## Limitaciones y advertencias

- Modelo abliterated: elimina los mecanismos de rechazo, por lo que puede generar contenido dañino, ilegal o peligroso; el usuario asume toda la responsabilidad legal y ética de su uso.
- Riesgo de alucinación: como todo modelo de lenguaje, puede inventar información; la especialización en código no elimina este riesgo en explicaciones o documentación.
- Conocimiento del mundo degradado: el autor reconoce explícitamente que sacrifica conocimiento general (MMLU-Pro) en favor de código y velocidad; no es adecuado para tareas de trivia o exámenes.
- Idiomas limitados: solo inglés y chino; no hay soporte declarado para castellano.
- Longitud de contexto no especificada: se desconoce la ventana máxima, lo que dificulta planificar su uso en repositorios muy grandes.
- Inestabilidad potencial: el autor describe el modelo como "willing, able and slightly unstable"; la abliteración puede corromper ligeramente el modelo original.
- Requiere sandbox y monitorización: el propio autor recomienda aislar y supervisar el modelo en ejecución, especialmente en tareas de seguridad ofensiva.
- Licencia MIT: permite uso comercial, pero no exime de las obligaciones legales sobre el contenido generado.
- Repositorio con pocas descargas (71) y sin likes: menor validación comunitaria que modelos establecidos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AIGAROU/cyb3rmc7yn3gnvn39cn
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo original Ornith-1.5: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Versión GGUF sin MTP: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF
- Versión MLX: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e
- Versión MLX con MTP: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e-MTP
- Modelo censurado TielCoder: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF
- Plantillas de chat Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Modelo alternativo para conocimiento general (Nail): https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF
