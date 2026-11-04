# JRamirez-UAB/Swift-1.5-Qwen3.8-27B-heretic-EXL3-3.85bpw-24GB

## Resumen

Swift-1.5-Qwen3.8-27B-heretic-EXL3-3.85bpw-24GB es una cuantización comunitaria no oficial en formato EXL3 del modelo akumaburn/Swift-1.5-Qwen3.8-27b-heretic, a su vez una variante «abliterated» (con los mecanismos de rechazo eliminados mediante ablación direccional) de Swift-1.5-Qwen3.8-27b de UkisAI, derivado a su vez de Qwen3.8-27B. El checkpoint lo publica el usuario JRamirez-UAB y su objetivo declarado es servir el modelo completo con visión, decodificación especulativa MTP y la ventana de contexto íntegra de 262.144 tokens en una única GPU de 24 GB (RTX 3090, Ampere).

La cuantización emplea 3,85 bits por peso en las capas lineales, `lm_head` a 5 bits, torre de visión a 6 bits, cabeza MTP a 4 bits y embeddings INT8, generando un repositorio de 14,6 GB. Según la model card, se ha validado con divergencia KL de 0,011-0,015 frente al BF16 de referencia, 30/30 llamadas a herramientas correctas, 15/15 tareas de visión y 12/12 tareas de programación, con un rendimiento de decodificación de 88,6 a 266,3 tok/s según el número de peticiones concurrentes.

Es relevante porque demuestra que un modelo multimodal de gran contexto puede operar en hardware de consumo con cuantización agresiva, caché KV INT4 y decodificación especulativa, aunque su carácter «uncensored», su licencia restrictiva (Swift Open License v1.0, solo investigación no comercial) y la necesidad de un stack de inferencia específico (vLLM + exllamav3 + vllm-quantpack) limitan seriamente su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8), multimodal image-text-to-text, con cabeza MTP para decodificación especulativa |
| Parametros totales | 7.946.985.344 (según safetensors; la nomenclatura del modelo indica 27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (pool KV de 398.458 tokens) |
| Tipos de cuantizacion | EXL3 3,85 bpw en capas lineales; lm_head 5 bits; torre de visión 6 bits; cabeza MTP 4 bits; embeddings INT8; caché KV INT4 |
| Idiomas soportados | es, en |
| Licencia | swift-open-license-1.0 (uso no comercial, solo investigación, sección 5); partes de Qwen3.8-27B bajo Apache-2.0 |
| Formato de pesos | safetensors (EXL3), 14,62 GB en dos shards |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.8 con capacidades multimodales (image-text-to-text), al que se ha añadido una cabeza MTP (multi-token prediction) para decodificación especulativa. La variante «heretic» aplica ablación direccional sobre las direcciones de rechazo del modelo original, eliminando deliberadamente la alineación de seguridad. El checkpoint publicado es únicamente una cuantización: no se ha reentrenado ni modificado el comportamiento del modelo fuente.

La cuantización se realizó con exllamav3 1.6.5, usando trazas de calibración que incluyen conversaciones reales de administración de sistemas y agentes en español. No se dispone de información sobre el número de tokens de entrenamiento del modelo original, la composición del dataset ni si hubo RLHF o DPO; la model card solo documenta el proceso de cuantización y evaluación.

## Capacidades

- Generación de texto conversacional multi-turno en español e inglés.
- Razonamiento y resolución de tareas de programación (12/12 en las pruebas del autor).
- Comprensión de imágenes (pipeline image-text-to-text; 15/15 en las pruebas del autor).
- Llamada a herramientas / function calling (30/30 llamadas válidas con la petición real de opencode).
- Uso como agente con razonamiento multi-paso y ejecución real de comandos (orientado a administración de sistemas Linux).
- Contexto largo: recuperación de información en ventanas de hasta 262.144 tokens.
- Decodificación especulativa MTP (1,89 tokens aceptados por borrador en respuestas cortas, 2,92 cerca de 258k).
- Compatibilidad con endpoints estilo OpenAI mediante vLLM.
- Comportamiento «uncensored»: no aplica rechazos de seguridad del modelo original.

## Casos de uso

- Agente local de administración de sistemas Linux: el modelo se sirve con opencode y tool calling en una RTX 3090, gestionando diagnósticos, ejecución de comandos y análisis de logs con contexto largo gracias a los 262.144 tokens disponibles.
- Automatización de soporte técnico en español: conversaciones multi-turno con historial extenso, aprovechando el calibrado específico en trazas de sysadmin en castellano.
- Análisis de imágenes técnicas en flujos de trabajo: capturas de pantalla de terminales, diagramas de red o paneles de monitorización procesados por la torre de visión a 6 bits.
- Investigación sobre alineación y seguridad: estudio de modelos con rechazos ablacionados para analizar sesgos, comportamientos no filtrados y eficacia de mecanismos de moderación externos.
- Evaluación de cuantización extrema: comparación de la fidelidad EXL3 3,85 bpw frente al BF16 mediante divergencia KL en trazas reproducibles.
- Despliegue en hardware de consumo para prototipado: un único equipo con RTX 3090 puede servir el modelo completo con visión y contexto íntegro, útil para entornos de laboratorio o docencia.
- Investigación en decodificación especulativa: banco de pruebas para medir aceptación de tokens MTP en distintos rangos de contexto.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Divergencia KL vs BF16 heretic (traza opencode) | 0,0111 |
| Divergencia KL vs BF16 heretic (traza sysadmin) | 0,0151 |
| Divergencia KL vs BF16 heretic (traza pública de turboderp) | 0,0111 |
| Llamadas a herramientas (petición real opencode) | 30/30 válidas y correctas, 0 errores |
| Tareas de visión | 15/15 |
| Tareas de programación | 12/12 |
| Tokens MTP aceptados por borrador (respuestas cortas) | 1,89 |
| Tokens MTP aceptados por borrador (cerca de 258k) | 2,92 |
| Decodificación, 1 petición | 88,6 tok/s |
| Decodificación, 2 peticiones | 148,8 tok/s |
| Decodificación, 4 peticiones | 243,2 tok/s |
| Decodificación, 8 peticiones | 266,3 tok/s |
| Uso de VRAM en pico | 23.560 MiB (≈560 MiB libres) |
| Pool KV | 398.458 tokens |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 14,62 GB de pesos más caché KV INT4; en la configuración probada se alcanzan 23.560 MiB en pico con contexto completo de 262.144 tokens.
- GPU recomendada: RTX 3090 (24 GB, Ampere) es el único entorno probado y validado por el autor.
- No cabe en GPUs de 16 GB (los pesos solos ocupan 14,62 GB y no queda margen para caché KV).
- Despliegue: exclusivamente con vLLM 0.31.0 + exllamav3 1.6.5 + plugin vllm-quantpack 0.1.4. No es cargable con `pip install vllm` estándar, Transformers ni SGLang.
- Throughput: 88,6 tok/s con 1 petición y 266,3 tok/s con 8 peticiones concurrentes en la configuración probada.
- Configuración de referencia: visión activada, MTP 3, `--max-model-len 262144`, caché KV INT4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Swift-1.5-Qwen3.8-27B-heretic EXL3 3.85) | 7,95B (safetensors) | 262.144 | EXL3 3,85 bpw | Swift Open License v1.0, solo investigación | Sin alineación de seguridad; stack vLLM+exllamav3 |
| JRamirez-UAB/Swift-1.5-Qwen3.8-27B-EXL3-3.85bpw-24GB | mismo tamaño | 262.144 | EXL3 3,85 bpw | Swift Open License v1.0 | Versión no ablacionada, mismos anchos de bits, probada en más profundidad |
| akumaburn/Swift-1.5-Qwen3.8-27b-heretic (BF16) | no disponible | 262.144 (según derivado) | BF16 | Swift Open License v1.0 | Modelo fuente de esta cuantización; requiere mucho más VRAM |
| ukisai/Swift-1.5-Qwen3.8-27b | no disponible | no disponible | BF16 | no disponible | Derivado de Qwen3.8-27B orientado a eficiencia de razonamiento |

## Limitaciones y advertencias

- Modelo sin alineación de seguridad: la ablación direccional elimina los rechazos, por lo que puede cumplir peticiones dañinas, ilegales o poco éticas. No debe exponerse a usuarios no confiables sin moderación externa.
- Licencia Swift Open License v1.0, sección 5: uso exclusivamente no comercial y de investigación. No apto para producción comercial.
- Requiere un stack de inferencia específico y frágil (vLLM 0.31.0 + exllamav3 1.6.5 + vllm-quantpack 0.1.4); solo se ha probado una configuración concreta.
- Riesgo de alucinación no cuantificado: la model card no reporta tasas de alucinación ni evaluaciones de veracidad.
- Cobertura lingüística limitada a español e inglés; el rendimiento en otros idiomas no está medido.
- La cuantización a 3,85 bpw introduce degradación frente al BF16 (KLD 0,011-0,015), aceptable según el autor pero no nula.
- Solo cabe en GPUs de 24 GB o más; en 16 GB no es viable.
- Tres respuestas de la prueba de humo alcanzaron el límite de 8.000 tokens, lo que sugiere tendencia a respuestas largas.
- Los datos de parámetros son inconsistentes: safetensors reporta 7,95B mientras la nomenclatura indica 27B; conviene verificar antes de planificar recursos.
- Es una publicación comunitaria no oficial; no está respaldada por akumaburn, UkisAI, Alibaba Cloud ni el equipo de Qwen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JRamirez-UAB/Swift-1.5-Qwen3.8-27B-heretic-EXL3-3.85bpw-24GB
- Modelo base: https://huggingface.co/akumaburn/Swift-1.5-Qwen3.8-27b-heretic
- Modelo original de UkisAI: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Versión no ablacionada del mismo autor: https://huggingface.co/JRamirez-UAB/Swift-1.5-Qwen3.8-27B-EXL3-3.85bpw-24GB
- exllamav3: https://github.com/turboderp-org/exllamav3
- Paper de referencia (arXiv:2406.11235): https://arxiv.org/abs/2406.11235
