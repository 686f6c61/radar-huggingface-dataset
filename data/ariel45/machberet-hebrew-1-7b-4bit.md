# ariel45/machberet-hebrew-1.7b-4bit

## Resumen

Machberet Hebrew 1.7B 4-bit es una conversión cuantizada del modelo DictaLM-3.0-1.7B-Instruct, desarrollado originalmente por Dicta (Israel Center for Text Analysis) y adaptado por el usuario ariel45. Se trata de un modelo de lenguaje de 1.700 millones de parámetros especializado en hebreo, con soporte secundario de inglés, empaquetado en formato MLX de 4 bits con tamaño de grupo 64 para su ejecución en dispositivos Apple Silicon. Su propósito es servir de motor de inferencia local en la aplicación de cuaderno Machberet, donde actúa como asistente de estudio.

La relevancia de esta ficha radica en que ejemplifica el patrón de distribución de modelos especializados en idiomas de bajos recursos mediante cuantización para hardware de consumo. Al derivar de la familia Qwen3 (según las etiquetas del repositorio) y estar afinado por Dicta sobre corpus hebreo, cubre un nicho que los modelos generalistas multilingües suelen atender deficientemente. La ventana de contexto, el número exacto de tokens de entrenamiento y la composición del dataset no se detallan en la información disponible.

El modelo se publica bajo licencia Apache-2.0, lo que permite uso comercial y modificación, y se distribuye únicamente en formato MLX (safetensors), sin versiones GGUF ni pesos completos en el repositorio. Fue creado el 26 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni interacciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, segun etiquetas del repositorio) |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits, tamano de grupo 64 (MLX) |
| Idiomas soportados | Hebreo (he), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors en formato MLX (no se distribuye GGUF) |

## Arquitectura y entrenamiento

El modelo base, DictaLM-3.0-1.7B-Instruct, es un transformer decoder-only de 1.700 millones de parámetros perteneciente a la familia Qwen3, según las etiquetas del repositorio. Dicta lo afinó para instrucciones en hebreo, aunque la información proporcionada no detalla el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones como decodificación especulativa o atención lineal.

La conversión realizada por ariel45 introduce tres modificaciones concretas respecto al original: cuantización a 4 bits con grupo de 64 mediante mlx-lm, sustitución del system prompt por defecto en `chat_template.jinja` por una instrucción breve en hebreo orientada a un asistente de estudio, y fijación del token de fin de turno `<|im_end|>` como EOS en `config.json` y `tokenizer_config.json`. El checkpoint original corresponde a la revisión `5add44d6941d6ffb9eb6cc6b516f9fb4fd472494`.

## Capacidades

- Generación de texto en hebreo e inglés, con especialización en hebreo por el ajuste de instrucciones de Dicta.
- Conversación multi-turno mediante plantilla de chat con tokens de rol y token de fin de turno `<|im_end|>`.
- Asistencia de estudio y redacción en el contexto de una aplicación de cuaderno (system prompt por defecto orientado a ese uso).
- Comprensión y generación de instrucciones en hebreo, incluyendo posible manejo de texto con escritura hebrea y mezcla de inglés.
- Ejecución local en hardware Apple Silicon gracias al formato MLX cuantizado a 4 bits.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso explícito, visión, audio ni modo de pensamiento.

## Casos de uso

- Asistente de estudio en aplicación de cuaderno: el modelo se integra en Machberet como motor local para responder dudas y resumir apuntes en hebreo, aprovechando el system prompt específico incluido en la plantilla de chat.
- Procesamiento de texto hebreo en local: redacción, corrección y reformulación de párrafos en hebreo sin enviar datos a servicios en la nube, adecuado para entornos con requisitos de privacidad.
- Traducción asistida hebreo-inglés: generación de borradores y paráfrasis bilingües en flujos de trabajo personales sobre Mac, dado el soporte declarado de ambos idiomas.
- Prototipado de aplicaciones NLP en hebreo: uso como modelo de referencia de bajo coste para validar pipelines de generación antes de escalar a modelos mayores.
- Investigación en lingüística computacional del hebreo: experimentación con un modelo afinado por Dicta sobre corpus hebreo, útil para estudiar comportamiento morfológico y de escritura RTL.
- Inferencia en dispositivos con memoria unificada limitada: despliegue en portátiles Apple con 8-16 GB de memoria unificada gracias a la cuantización de 4 bits, sin necesidad de GPU dedicada.
- Educación y demostraciones offline: ejecución sin conexión en aulas o entornos air-gapped donde no se permite acceso a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 1,0-1,2 GB para los pesos en 4 bits (1.7B parámetros × ~0,5 bytes/parámetro), más overhead de activaciones y caché KV; en la práctica se recomienda reservar 2-4 GB de memoria unificada.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (series M1, M2, M3, M4); no es compatible de forma nativa con CUDA.
- Cabe en GPU de consumo: sí, en cualquier Mac con chip Apple Silicon y al menos 8 GB de memoria unificada; no está pensado para GPUs NVIDIA/AMD sin reconversión a otro formato.
- Opciones de despliegue: mlx-lm (librería nativa del formato), con posibilidad de reconvertir a GGUF para llama.cpp/Ollama o a safetensors estándar para vLLM/TGI, aunque dichas conversiones no se distribuyen en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Machberet Hebrew 1.7B 4-bit (este) | 1.7B | No disponible | he, en | Apache-2.0 | MLX safetensors 4-bit |
| dicta-il/DictaLM-3.0-1.7B-Instruct (base) | 1.7B | No disponible | he, en | Apache-2.0 | Safetensors (completo) |
| Qwen3 1.7B (familia de referencia) | 1.7B | No disponible | Multilingue | Apache-2.0 | Safetensors, GGUF |
| Modelos hebreos de mayor tamano de Dicta | No disponible | No disponible | he, en | No disponible | No disponible |

La comparación cuantitativa de rendimiento no está disponible; la diferencia principal frente al modelo base es la cuantización a 4 bits (menor huella de memoria, posible pérdida de precisión) y la personalización de la plantilla de chat.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al derivar de un corpus hebreo, puede reflejar sesgos culturales y lingüísticos del mismo.
- Riesgo de alucinación: inherente a modelos de 1.7B; la cuantización a 4 bits puede incrementar la degradación en tareas de razonamiento y generación factual.
- Limitaciones de contexto e idioma: la longitud de contexto no está especificada; el soporte se limita a hebreo e inglés, con posible menor calidad en inglés que en hebreo.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe conservar la atribución a Dicta y al autor de la conversión; verificar los términos del modelo base.
- Caveat de producción: el formato MLX solo se ejecuta en Apple Silicon; para otros entornos es necesaria una reconversión no incluida en el repositorio. La personalización del system prompt puede alterar el comportamiento respecto al modelo original.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, sin validación comunitaria del checkpoint cuantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ariel45/machberet-hebrew-1.7b-4bit
- Modelo base: https://huggingface.co/dicta-il/DictaLM-3.0-1.7B-Instruct
- Revisión del modelo base: 5add44d6941d6ffb9eb6cc6b516f9fb4fd472494
- Librería MLX: no disponible en la información proporcionada
- Paper, blog o demo: no disponibles en la información proporcionada
