# jwg0830/AX-3.1-Light-sft_v0_1

## Resumen

El modelo `jwg0830/AX-3.1-Light-sft_v0_1` es un ajuste fino (fine-tuning) de tipo LoRA fusionada sobre el modelo base `skt/A.X-3.1-Light`, desarrollado por el usuario `jwg0830`. Su propósito principal es corregir un déficit de formato en la salida del modelo base cuando se enfrenta a preguntas de opción múltiple en coreano, específicamente en la capacidad de generar respuestas parseables (letras A/B/C/D) de forma consistente.

Este modelo es relevante para desarrolladores que trabajan con pipelines de evaluación automática o sistemas de preguntas y respuestas en coreano, donde la exactitud del contenido ya era alta en el modelo base, pero fallaba la adherencia a formatos estrictos. Con 7.264.800.768 parámetros, mantiene la arquitectura original del base (un transformer denso) sin modificaciones estructurales, y se distribuye en formato `safetensors`. El entrenamiento se realizó con datos de AI Hub de Corea, enfocándose en dominios como lengua coreana, medicina, finanzas y derecho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en `skt/A.X-3.1-Light`) |
| Parametros totales | 7.264.800.768 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio contiene safetensors, ~14.5 GB) |
| Idiomas soportados | Coreano (ko) |
| Licencia | other (licencia propietaria de SKT, no estandar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo no introduce cambios arquitectónicos respecto a su base `skt/A.X-3.1-Light`. Se trata de un transformer denso estándar, sin mecanismos de atención lineal ni mezcla de expertos. El proceso de entrenamiento consistió en un diagnóstico previo mediante un proxy benchmark propio de 4 etapas (generación libre, generación forzada, comparación de verosimilitud e inyección de evidencia) para identificar fallos de formato. Posteriormente se aplicó un LoRA SFT con r=16, alpha=32 y 2 épocas, fusionando el adaptador en el modelo final.

Los datos de entrenamiento provienen de AI Hub de Corea, concretamente de los datasets `71857` (preguntas de comprensión lectora de libros de texto de lengua coreana), `71874` (conocimiento médico especializado) y `71610` (lectura mecánica de documentos financieros y legales). El objetivo explícito era enseñar al modelo a generar respuestas con el formato "razonamiento breve + `정답: <A/B/C/D>`" para mejorar la parseabilidad, sin pretender aumentar el conocimiento factual, que ya se consideraba suficiente en el modelo base.

## Capacidades

- Generación de texto en coreano con alta fluidez y conocimiento factual heredado del modelo base.
- Razonamiento y comprensión lectora en dominios específicos: lengua coreana, medicina, finanzas y derecho.
- Adherencia estricta a formatos de salida para preguntas de opción múltiple, facilitando el parseo automático de respuestas (letras A/B/C/D).
- Mejora en la estabilidad de respuestas en benchmarks de conocimiento general coreano (KMMLU, CLIcK, HLE).
- No se especifican capacidades de tool calling, agente multi-paso, visión o audio en la documentación proporcionada.
- Soporte limitado al idioma coreano (ko), sin evidencia de capacidades multilingües.

## Casos de uso

- Corrección automática de exámenes tipo test en coreano: el modelo puede procesar preguntas y generar respuestas en formato `정답: X`, permitiendo su integración directa en sistemas de evaluación sin necesidad de post-procesamiento complejo.
- Tutoría académica personalizada: dado su entrenamiento con libros de texto de lengua coreana, puede explicar conceptos y responder preguntas de comprensión lectora con respuestas estructuradas y verificables.
- Extracción de respuestas en documentos legales y financieros: su entrenamiento con lectura mecánica de documentos permite usarlo en pipelines de RAG para extraer respuestas concretas a preguntas sobre contratos o informes financieros.
- Chatbots de atención al cliente en coreano: puede gestionar consultas de dominios específicos (banca, seguros) y ofrecer respuestas con formato estricto para integrarse en sistemas de tickets o derivación.
- Generación de datasets sintéticos de preguntas y respuestas: su capacidad para seguir formatos estrictos lo hace útil para generar datos de entrenamiento adicionales para otros modelos coreanos.
- Evaluación de modelos de lenguaje en coreano: puede servir como generador de respuestas de referencia en benchmarks propios, gracias a su estabilidad de formato y su rendimiento en proxies de KMMLU, CLIcK y HLE.

## Benchmarks y rendimiento

El autor proporciona resultados de un proxy benchmark propio, no oficial del K-AI Leaderboard, basado en un muestreo aleatorio de 800 preguntas (300 KMMLU-Lite, 300 CLIcK-Lite, 200 HLE-Lite). Los resultados comparan el modelo base (`skt/A.X-3.1-Light`) con este checkpoint:

| Eje | Base (respuestas estables) | sft_v0_1 (respuestas estables) |
|---|---:|---:|
| KMMLU-Lite | 213/300 | 221/300 |
| CLIcK-Lite | 275/300 | 276/300 |
| HLE-Lite | 185/200 | 189/200 |

No se han publicado resultados oficiales de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible. Los ejes MuSR-Lite y Com2-main-Lite no fueron reevaluados con este checkpoint, aunque el autor estima que el base ya supera el 90% en ellos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14.5 GB en precisión FP16/BF16 (según el tamaño del repositorio). Con cuantización de 4 bits (si se genera GGUF), podría reducirse a unos 4-5 GB.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB) es suficiente para FP16. Para cuantización de 4 bits, bastaría con una RTX 3060 (12 GB) o similar.
- No cabe en GPUs de consumo de gama baja (8 GB o menos) sin cuantización.
- Opciones de despliegue: compatible con `transformers` y `text-generation-inference` (según tags). Puede desplegarse con vLLM o TGI en entornos de producción. Para uso local, es necesario convertir a GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponible en la documentación proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `jwg0830/AX-3.1-Light-sft_v0_1` | 7.26B | no disponible | Coreano | other | Especializado en formato MCQ coreano |
| `skt/A.X-3.1-Light` (base) | 7.26B | no disponible | Coreano | other | Mayor contenido factual, menor estabilidad de formato |
| `Qwen2.5-7B` | 7.6B | 128k | Multilingue | Apache 2.0 | Alternativa generalista, pero sin enfoque específico en coreano ni en formato MCQ |

La comparativa directa con otros modelos coreanos de tamaño similar (por ejemplo, LG EXAONE) no está disponible en la información proporcionada. La principal ventaja de este modelo frente a alternativas generalistas es su especialización en el formato de salida para evaluación coreana, aunque su licencia restrictiva y su limitación al coreano pueden ser desventajas en proyectos multilingües.

## Limitaciones y advertencias

- Licencia `other`: no es una licencia de código abierto estándar. Es probable que herede restricciones de la licencia propietaria de SKT para el modelo base, lo que puede limitar su uso comercial. Se recomienda revisar los términos de la licencia de `skt/A.X-3.1-Light`.
- Entrenamiento enfocado exclusivamente en formato: el modelo puede haber degradado ligeramente su capacidad de generación de texto libre o creativo, ya que el objetivo era la adherencia estricta a un patrón de respuesta.
- Cobertura de dominios limitada: los datos de entrenamiento se restringen a lengua coreana, medicina, finanzas y derecho. Puede tener un rendimiento inferior en otros dominios.
- Sin evaluación en todos los ejes: no se han publicado resultados para MuSR-Lite ni Com2-main-Lite, por lo que su rendimiento en razonamiento multi-hop o comprensión de contexto largo no está verificado.
- Riesgo de alucinación: no se han documentado sesgos específicos, pero al ser un modelo de 7B, es susceptible a alucinaciones en tareas de razonamiento complejo.
- Sin soporte multilingüe: el modelo solo está entrenado para coreano. Cualquier intento de uso en otros idiomas probablemente produzca resultados incoherentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jwg0830/AX-3.1-Light-sft_v0_1
- Modelo base: https://huggingface.co/skt/A.X-3.1-Light
- Datasets de AI Hub mencionados (IDs): 71857, 71874, 71610 (sin URL directa en la información proporcionada)
