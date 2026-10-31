# jacopof/lumina-2.75m

## Resumen

Lumina 2.75M es un modelo lingüístico pequeño (SLM) autoregresivo causal diseñado para el idioma italiano, desarrollado por jacopof y entrenado íntegramente desde cero, sin reutilizar pesos preexistentes ni depender de APIs externas. Su propuesta de valor es la ejecución 100 % local en dispositivos con recursos mínimos: pesa solo 10,5 MB en formato safetensors y puede correr en portátiles, Raspberry Pi, smartphones o directamente en el navegador vía JavaScript, con latencias inferiores a 0,05 segundos en GPU o CPU estándar.

El modelo se ha entrenado mediante una metodología de destilación de conocimiento local (Knowledge Distillation) sobre un currículo intensivo de programación (Python, JavaScript, SQL, Git, depuración), ciencias, cultura italiana y diálogo natural. Una característica diferencial es su principio de "honestidad delimitada": en lugar de alucinar ante preguntas fuera de su perímetro de conocimiento, está entrenado para rechazar responder de forma explícita. Es un proyecto relevante como prueba de concepto de IA en el borde (edge AI) y como demostración de que un modelo de 2,75 millones de parámetros puede ofrecer respuestas coherentes en un dominio muy acotado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal LM), byte-level |
| Parámetros totales | 2.750.976 |
| Parámetros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (formatos nativos ONNX, safetensors y GGUF) |
| Idiomas soportados | Italiano |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX, GGUF |

## Arquitectura y entrenamiento

Lumina 2.75M es un transformer causal con tokenización byte-level, lo que elimina la necesidad de un vocabulario de subpalabras y simplifica el despliegue. El modelo fue entrenado desde cero (from scratch) sin partir de pesos preentrenados por terceros.

El entrenamiento se realizó mediante una pipeline de destilación de conocimiento local ejecutada en una GPU NVIDIA GeForce RTX 5060: un motor de destilación neuronal generó más de 5.000 pares de diálogo y explicaciones de alta densidad informativa, que junto con otros datos suman más de 8.390 muestras de entrenamiento (diálogos sistemáticos, teoría, definiciones, programación práctica y ejemplos de rechazo anti-alucinación). El optimizador empleado fue AdamW con regularización Dropout 0,1 y Weight Decay 0,05, alcanzando una validation loss de 0,532. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto en italiano con latencia casi instantánea (< 0,05 s en GPU o CPU estándar).
- Programación: sintaxis de Python (funciones, listas, diccionarios, list comprehensions), JavaScript y web (eventos DOM, ES6+, funciones asíncronas, API HTTP GET/POST).
- Algoritmos y estructuras de datos: búsqueda binaria, ordenación, notación de complejidad O(n) y O(log n).
- Depuración: explicación de errores comunes como IndexError, TypeError y SyntaxError.
- Git y buenas prácticas: comandos básicos (commit, branch, push) y principio DRY.
- Definiciones científicas, geografía y cultura italiana.
- Rechazo honesto fuera de su perímetro de conocimiento: ante preguntas sobre eventos futuros o datos que no conoce, responde declarando sus límites en lugar de inventar.
- Ejecución completamente local y offline (Privacy by Design), sin llamadas a servidores remotos.
- Ejecución en navegador mediante JavaScript gracias a su tamaño reducido.

No hay información sobre soporte de tool calling, function calling, capacidades de agente, visión o audio.

## Casos de uso

- Chatbots educativos en italiano: dado su entrenamiento en definiciones técnicas y cultura general, puede servir como asistente de aprendizaje en aulas o aplicaciones didácticas sin conexión a internet.
- Demostraciones de edge AI: con 10,5 MB de peso, es ideal para mostrar inferencia de LLM en Raspberry Pi, microordenadores o dispositivos IoT con recursos muy limitados.
- Ejecución en el navegador: su tamaño permite integrarlo en aplicaciones web vía JavaScript/ONNX para ofrecer asistencia sin enviar datos a servidores, útil en contextos con requisitos estrictos de privacidad.
- Asistente de programación básico offline: puede explicar errores de Python (IndexError, TypeError) y sintaxis básica en entornos sin conectividad, como formación en centros con red restringida.
- Prototipado de SLM personalizados: su pipeline de destilación local documentada sirve como referencia reproducible para quien quiera entrenar modelos diminutos en dominios concretos con hardware de consumo.
- Asistentes embebidos en aplicaciones móviles: su huella mínima permite incrustarlo en apps para consultas frecuentes (geografía, definiciones, saludos) sin coste de API ni latencia de red.

## Benchmarks y rendimiento

La model card publica resultados de evaluación con greedy decoding sobre datos de validación no vistos durante el entrenamiento:

| Ámbito de prueba | Precisión en datos no vistos |
|---|---|
| Definiciones y conceptos técnicos | 98,2 % |
| Preguntas de verificación libre (probes) | 85,7 % |
| Preguntas conocidas con reformulaciones | 79,1 % |
| Reconocimiento de hechos fuera de perímetro (rechazo honesto) | 66,7 % |
| Falsos rechazos (errores de bloqueo) | 2,9 % |

La model card también menciona una leaderboard multi-dominio (coding, cultura, ciencia, honestidad) con comparativas, pero la tabla está truncada en la información disponible, por lo que no se pueden reproducir los valores completos. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el modelo completo pesa 10,5 MB en safetensors, por lo que es ejecutable en prácticamente cualquier GPU o incluso solo con CPU y RAM convencional.
- GPU recomendadas: no requiere GPU dedicada; el autor lo entrenó en una NVIDIA GeForce RTX 5060, pero la inferencia funciona en CPU estándar.
- Consumer GPUs: cabe con holgura en cualquier GPU de consumo moderna (incluso integradas), dado su tamaño de 10,5 MB.
- Opciones de despliegue: ONNX Runtime (incluye formato ONNX en el repositorio), llama.cpp o backends compatibles con GGUF, ejecución directa en navegador vía JavaScript, y Hugging Face Space de demostración (lumina-chat). No se menciona soporte específico para vLLM, TGI u Ollama.
- Latencia: inferior a 0,05 segundos por respuesta en GPU o CPU estándar, según la model card.

## Comparativa con modelos similares

Comparativa orientativa con otros modelos pequeños orientados a italiano o despliegue en el borde:

| Modelo | Parámetros | Contexto | Idioma principal | Licencia | Notas |
|---|---|---|---|---|---|
| Lumina 2.75M | 2,75 M | no disponible | Italiano | MIT | Entrenado desde cero, byte-level, 10,5 MB, edge AI |
| MiniCPM (variantes pequeñas) | ~1-4 B | hasta 4.096+ tokens | Chino/inglés (multilingüe) | Apache 2.0 / uso no comercial en algunas versiones | Mucho más capaz, pero requiere cientos de MB a GB |
| Qwen2.5-0.5B | 500 M | 32.768 tokens | Multilingüe (incluye italiano) | Apache 2.0 | Muy superior en capacidades generales, ~1 GB en FP16 |
| TinyLlama 1.1B | 1,1 B | 2.048 tokens | Inglés | Apache 2.0 | No especializado en italiano; mucho mayor que Lumina |

En resumen: Lumina 2.75M es órdenes de magnitud más pequeño que cualquier SLM convencional, lo que le da ventaja en latencia y huella, a costa de un conocimiento y una generalización muy limitados, centrados en su currículo de entrenamiento.

## Limitaciones y advertencias

- Alcance del conocimiento extremadamente limitado: con 2,75 M de parámetros y ~8.390 muestras de entrenamiento, solo responde con fiabilidad dentro de su perímetro (definiciones técnicas, programación básica, geografía y cultura italiana); no es un modelo de propósito general.
- Riesgo de alucinación: mitigado por diseño mediante rechazo honesto, pero el reconocimiento de preguntas fuera de perímetro solo alcanza un 66,7 %, por lo que puede responder incorrectamente ante preguntas desconocidas no detectadas.
- Idioma: entrenado exclusivamente en italiano; no hay soporte declarado para castellano ni otros idiomas.
- Contexto: la longitud de ventana de contexto no está documentada, lo que dificulta evaluar su uso en conversaciones largas o documentos extensos.
- Capacidades ausentes: sin tool calling, sin agentes, sin visión ni audio; no apto para pipelines de producción que requieran estas funciones.
- Sesgos: no se documenta análisis de sesgos; el dataset generado por destilación puede heredar los sesgos del modelo docente utilizado.
- Licencia: MIT, sin restricciones para uso comercial.
- Para producción: su carácter de proyecto experimental (704 descargas, sin adopción verificada) aconseja uso en demos, educación o investigación, no en aplicaciones críticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jacopof/lumina-2.75m
- Demo interactiva (Hugging Face Space): https://huggingface.co/spaces/jacopof/lumina-chat
