# navyam-ai/navya-1b-sft-v9

## Resumen

Navya es una familia de modelos fundacionales financieros centrados en India, desarrollada por Navyam AI (Bachatt). El modelo navya-1b-sft-v9 es la versión de 337 millones de parámetros, entrenada desde cero sobre un corpus prioritario de India que combina finanzas, inglés y hindi/hinglish, e incluye un tokenizer personalizado de 64k tokens. Se trata de un modelo de chat ajustado por supervisión (SFT) para responder preguntas de finanzas personales en el contexto indio, con soporte para inglés e hindi.

El modelo se publica bajo licencia Apache-2.0 y está pensado como modelo de investigación, no como fuente de asesoramiento financiero. Su relevancia radica en abordar un dominio específico (finanzas personales en India) con vocabulario y matices locales, algo poco cubierto por modelos generalistas. Aunque el identificador del repositorio indica "1b", el peso real de los safetensors es de 337.691.648 parámetros, por lo que se trata de un modelo compacto, adecuado para despliegues ligeros y experimentación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (arquitectura tipo Llama) |
| Parametros totales | 337.691.648 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, hi (ingles, hindi/hinglish) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura transformer causal, con el tag `llama` en HuggingFace, lo que sugiere una estructura similar a la familia Llama. Ha sido entrenado desde cero sobre un corpus propio denominado "India-first", compuesto por datos financieros, inglés y hindi/hinglish, además de otras lenguas indias. El tokenizer es personalizado y tiene un tamaño de 64k tokens, adaptado al vocabulario financiero y multilingüe del dominio. El número total de tokens de entrenamiento no se ha revelado.

El modelo es una versión SFT (instruction-tuned) sobre un corpus de finanzas de India. Incluye un chat template con tokens de rol reservados (`<|reserved_0..4|>`) para system, user, assistant, tool y end_turn, y la generación se detiene en los tokens `<|reserved_4|>` y `<|eos|>`. No se indica si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y chat multi-turno, con soporte de roles system, user y assistant mediante el chat template.
- Respuestas de finanzas personales orientadas al contexto indio (préstamos, ahorro, inversiones, impuestos, etc.).
- Multilingüe en inglés e hindi/hinglish, con capacidad de mezclar ambos idiomas.
- El chat template incluye un rol de tool, lo que sugiere compatibilidad con tool calling, aunque no se documenta de forma explícita.
- Modelo compacto (337M), apto para inferencia en entornos con recursos limitados.
- No se han documentado capacidades de visión, audio ni razonamiento avanzado tipo thinking mode.

## Casos de uso

- Atención al cliente en entidades financieras indias: el modelo puede gestionar consultas frecuentes sobre productos bancarios, estados de cuenta o requisitos de préstamos, en inglés o hindi, gracias a su entrenamiento en el dominio financiero local.
- Educación financiera en hindi/hinglish: explicación de conceptos como interés compuesto, inflación o planificación de jubilación, adaptada al vocabulario y las prácticas financieras de India.
- Chatbots de finanzas personales: integración en aplicaciones móviles o web para que los usuarios pregunten sobre presupuestos, ahorro o gestión de deudas, manteniendo conversaciones multi-turno.
- Asistente para documentación financiera: apoyo en la interpretación de extractos, pólizas o formularios en inglés e hindi, aunque sin análisis visual.
- Generación de respuestas en sistemas de soporte bilingüe: uso en centros de contacto que atienden tanto a clientes angloparlantes como a hablantes de hindi, reduciendo la necesidad de modelos separados.
- Prototipado y experimentación en NLP financiera para India: el modelo sirve como base para investigaciones sobre análisis de sentimiento financiero, clasificación de consultas o generación de texto en dominios locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 337M parámetros, los pesos en FP16 ocupan aproximadamente 0,68 GB, y en FP32 unos 1,35 GB. Con overhead de inferencia, el modelo puede ejecutarse en GPUs consumer de 4 GB o menos, pero no hay requisitos oficiales publicados.
- GPU recomendadas: no disponible en la documentación; por tamaño, una RTX 3060, RTX 4060 o similar sería suficiente.
- Opciones de despliegue: compatible con `transformers` y `text-generation-inference` según los tags del repositorio. También se indica compatibilidad con endpoints de HuggingFace.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables en la información proporcionada, por lo que no es posible realizar una comparativa técnica fundamentada.

## Limitaciones y advertencias

- Modelo de investigación: no debe utilizarse como fuente de asesoramiento financiero.
- Sesgos geográficos y culturales: al estar entrenado principalmente en corpus de India, puede reflejar sesgos específicos de ese contexto y no generalizar a otros mercados.
- Riesgo de alucinación: como en cualquier modelo generativo, puede producir información financiera incorrecta o desactualizada.
- Idiomas limitados: solo soporta inglés e hindi/hinglish; no cubre otras lenguas.
- Longitud de contexto no documentada: se desconoce la ventana máxima de tokens, lo que puede afectar a tareas que requieren contexto largo.
- No se han publicado evaluaciones en benchmarks públicos, por lo que el rendimiento real es incierto.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se presenta como una versión de investigación, sin garantías de producción.

## Enlaces

- HuggingFace: https://huggingface.co/navyam-ai/navya-1b-sft-v9
- Repositorio de código: https://github.com/bachatt-app/navyam-gpt
