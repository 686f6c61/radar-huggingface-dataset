# navyam-ai/navya-0

## Resumen

Navya-0 es un modelo de lenguaje base desarrollado por Navyam AI (Bachatt), entrenado desde cero sobre un corpus India-first centrado en finanzas personales, inglés y hindi/hinglish. Con aproximadamente 57,7 millones de parámetros y un tokenizer personalizado de 64k, es el primer modelo de la familia Navya y una prueba de concepto para validar la receta de entrenamiento de modelos financieros indios.

El modelo está pensado para preguntas y respuestas sobre finanzas personales en India, y se distribuye bajo licencia Apache-2.0. Su arquitectura es de tipo Transformer (etiqueta "llama" en HuggingFace), aunque no se especifica la longitud de contexto ni los datos de entrenamiento.

A pesar de su tamaño reducido, su interés radica en la especialización del corpus y el tokenizer adaptado a la mezcla de inglés e hindi, lo que lo convierte en una base para experimentación y fine-tuning en el dominio financiero indio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Llama (según etiqueta "llama") |
| Parametros totales | 57.680.384 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés, hindi (según metadata); la model card menciona "otros idiomas indios" sin especificar |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Navya-0 es un modelo de tipo Transformer, con una arquitectura que sigue el diseño de la familia Llama (según la etiqueta "llama" en HuggingFace). Utiliza un tokenizer personalizado de 64k de vocabulario, diseñado para manejar inglés, hindi/hinglish y otros idiomas indios. Se trata de un modelo base, sin alineamiento por instrucciones ni RLHF/DPO.

El entrenamiento se realizó desde cero en 2026 sobre un corpus India-first compuesto por datos financieros y textos en inglés e hindi. No se han revelado el número total de tokens ni la composición exacta del dataset. El autor indica que es una "proof-of-recipe run", es decir, una prueba de concepto para validar el proceso de entrenamiento antes de escalar a modelos mayores de la familia Navya.

## Capacidades

- Generación de texto en inglés e hindi/hinglish, orientada a finanzas personales.
- Conocimiento de terminología financiera india (SIP, PPF, ELSS, etc.) gracias al corpus especializado.
- Tokenizer personalizado de 64k que soporta mezclas de inglés e hindi.
- Modelo base: no incluye soporte de tool calling, function calling, agentes ni modos de razonamiento explícitos.
- Sin capacidades de visión o audio.
- Uso previsto: preguntas y respuestas sobre finanzas personales en India.

## Casos de uso

- Atención al cliente financiera básica en India: con un prompting adecuado, el modelo puede responder consultas frecuentes sobre productos bancarios (cuentas de ahorro, depósitos fijos, préstamos personales) en inglés o hindi. Al estar entrenado en un corpus India-first, maneja terminología local y su tamaño permite integrarlo en aplicaciones ligeras sin necesidad de GPU.
- Educación financiera en hindi/hinglish: genera explicaciones sencillas de conceptos como interés compuesto o inflación en hindi, adaptadas al contexto indio. Su tokenizer de 64k y el corpus multilingüe mejoran la comprensión de mezclas de inglés e hindi.
- Prototipado de asistentes financieros con RAG: al ser un modelo base pequeño, sirve como componente de generación en un pipeline de recuperación aumentada (RAG) para consultas de documentos financieros indios. Permite validar arquitecturas de agentes en entornos de desarrollo con recursos limitados.
- Fine-tuning para clasificación de transacciones: su tamaño de 57,7M facilita el ajuste fino en hardware modesto para tareas como categorizar gastos o detectar fraudes en extractos bancarios, usando datasets propios en inglés e hindi.
- Generación de contenido financiero para redes sociales: produce respuestas cortas a preguntas comunes en foros indios sobre inversión, ahorro o impuestos, que luego pueden ser revisadas por un editor humano.
- Evaluación de tokenizers y datos para modelos financieros indios: como prueba de concepto, permite comparar el impacto del tokenizer de 64k y del corpus India-first en tareas de generación financiera, sirviendo como referencia para el desarrollo de modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo tiene 57.680.384 parámetros. En precisión fp32 ocupa aproximadamente 230 MB; en fp16, unos 115 MB.
- No requiere GPU: puede ejecutarse en CPU para inferencia básica. En GPU, cualquier tarjeta con 1 GB de VRAM es suficiente (RTX 3050, Jetson, etc.).
- Se puede desplegar con HuggingFace Transformers, y según las etiquetas es compatible con text-generation-inference. También puede ejecutarse con vLLM dado que la arquitectura es de tipo Llama, aunque no es necesario por su tamaño.
- La latencia estimada es muy baja, pero no se dispone de mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks en la información proporcionada, por lo que no se puede realizar una comparativa de rendimiento. En cuanto a tamaño, se pueden considerar como referencias SmolLM-135M (135M) o TinyLlama-1.1B (1.1B), aunque no son comparables en tarea ni en corpus. Tampoco hay datos de evaluación que permitan situar a navya-0 entre ellos.

## Limitaciones y advertencias

- Modelo base sin alineamiento: no ha sido entrenado con instrucciones ni RLHF/DPO, por lo que su uso directo en chatbots requiere un ajuste posterior.
- Riesgo de alucinación y datos financieros incorrectos: el autor indica explícitamente que no es consejo de inversión. Cualquier salida debe ser validada por un humano.
- Corpus de entrenamiento no revelado: no se especifica el número de tokens ni la composición exacta del dataset, lo que limita la evaluación de sesgos y cobertura.
- Sin benchmarks publicados: no existen resultados de MMLU, HumanEval u otros estándares, por lo que su capacidad es desconocida en comparación con otros modelos.
- Contexto no especificado: no se indica la longitud de ventana, lo que puede limitar tareas que requieran contexto largo.
- Idiomas limitados: según la metadata, solo inglés e hindi; aunque la model card menciona "otros idiomas indios", no hay evidencia de soporte formal para ellos.
- Licencia Apache-2.0: permite uso comercial, pero al ser un modelo de investigación no hay garantías de soporte o mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/navyam-ai/navya-0
- Código: https://github.com/bachatt-app/navyam-gpt
