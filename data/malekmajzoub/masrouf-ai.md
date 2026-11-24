# malekmajzoub/masrouf-ai

## Resumen

Masrouf AI es un modelo de lenguaje de 1.720.574.976 parámetros (aproximadamente 1,7 mil millones) desarrollado por malekmajzoub, obtenido mediante ajuste fino (fine-tuning) del modelo base Qwen/Qwen3-1.7B. Está diseñado específicamente como asistente en el teléfono para Masrouf, una aplicación de gestión de dinero, con el objetivo de interpretar mensajes entrantes (en inglés, árabe libanés, arabizi o mezclas de estos) y convertirlos en el formato de respuesta de la aplicación, además de redactar respuestas breves a partir de hechos que la propia app calcula.

El modelo resuelve un problema muy concreto: la interpretación y generación de respuestas en un contexto de asistencia financiera móvil, con soporte para variantes dialectales del árabe y transliteraciones informales (arabizi). Su relevancia radica en que es un modelo pequeño (1,7B) optimizado para ejecución en dispositivo (on-device), con una versión cuantizada GGUF Q4_K_M de 1056 MB, lo que permite desplegarlo en teléfonos sin depender de la nube y sin exponer datos personales.

La información disponible sobre arquitectura, contexto, datos de entrenamiento y benchmarks es limitada: la model card es muy escueta y no detalla estos aspectos. Se sabe que deriva de Qwen3-1.7B, que soporta inglés y árabe, y que se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen/Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (fichero publicado); otras no disponibles |
| Idiomas soportados | en, ar (incluye árabe libanés, arabizi y mezclas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M); safetensors en el repo base según metadatos |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Al ser un ajuste fino de Qwen/Qwen3-1.7B, hereda la arquitectura del modelo base, pero la model card no especifica si se trata de un transformer denso estándar, ni detalla innovaciones como atención lineal o decodificación especulativa.

En cuanto al entrenamiento, la model card indica que el modelo fue ajustado para leer mensajes en inglés, árabe libanés, arabizi o mezclas, y producir respuestas en el formato de Masrouf, así como para redactar respuestas cortas a partir de hechos calculados por la aplicación. Se menciona explícitamente que se entrenó solo con personas, nombres y mensajes ficticios, lo que implica un dataset sintético orientado a proteger la privacidad. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés y árabe, con soporte para árabe libanés, arabizi y mezclas de idiomas.
- Interpretación de mensajes entrantes y conversión al formato de respuesta de la aplicación Masrouf.
- Redacción de respuestas breves a partir de hechos proporcionados por la aplicación (no genera datos financieros por sí mismo).
- Ejecución en dispositivo (on-device) gracias a su tamaño reducido y a la cuantización GGUF Q4_K_M.
- Orientado a conversaciones de asistencia financiera en el contexto de una app de dinero.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistente financiero en aplicación móvil: el modelo interpreta los mensajes que el usuario escribe en la app de Masrouf (en inglés, árabe libanés, arabizi o mezclas) y los transforma en el formato de respuesta esperado, permitiendo una interacción natural sin salir del teléfono.
- Procesamiento de mensajes multilingües informales: al soportar arabizi y mezclas de árabe e inglés, puede gestionar entradas de usuarios que escriben de forma coloquial, algo habitual en comunidades del Líbano y Oriente Medio.
- Generación de respuestas breves basadas en hechos: la app calcula datos (por ejemplo, saldos o resúmenes) y el modelo redacta una respuesta corta y comprensible para el usuario, sin inventar cifras.
- Despliegue on-device con privacidad: al ejecutarse localmente con un GGUF de 1056 MB, permite ofrecer asistencia sin enviar datos del usuario a servidores externos, adecuado para aplicaciones financieras sensibles.
- Prototipado de asistentes de dominio específico: sirve como ejemplo de ajuste fino de un modelo pequeño (1,7B) para una tarea concreta de formato y estilo, replicable en otros dominios con recursos limitados.
- Integración en apps móviles con recursos limitados: su tamaño y cuantización permiten incluirlo en aplicaciones para dispositivos de gama media, reduciendo costes de infraestructura en comparación con modelos en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF Q4_K_M ocupa 1056 MB, por lo que se puede ejecutar con aproximadamente 1,5-2 GB de memoria disponible, dependiendo del backend y del contexto.
- GPU recomendadas: no se especifican; por su tamaño, puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como en GPUs integradas y en CPU.
- Cabe en GPU de consumo: sí, gracias a su cuantización Q4_K_M y a su tamaño de 1,7B parámetros.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; los tags indican "endpoints_compatible", lo que sugiere compatibilidad con endpoints de inferencia.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Masrouf AI (este modelo) | 1,72B | no disponible | Apache 2.0 | GGUF Q4_K_M en Hugging Face | Ajuste fino de Qwen3-1.7B para asistente financiero on-device en en/ar |
| Qwen/Qwen3-1.7B | 1,7B | no disponible en la información | Apache 2.0 | Hugging Face | Modelo base; capacidades generales, sin ajuste específico para Masrouf |
| Otros modelos de ~1-2B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse con datos sintéticos, podrían existir sesgos derivados del proceso de generación de esos datos.
- Riesgo de alucinación: el modelo está diseñado para redactar respuestas a partir de hechos que la app calcula, pero no se documenta ningún mecanismo de verificación; podría generar respuestas incorrectas si se usa fuera de ese flujo controlado.
- Limitaciones de contexto e idioma: solo se documentan inglés y árabe (incluyendo libanés y arabizi); no se especifica la longitud de contexto soportada, lo que limita su uso en conversaciones largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3-1.7B y citar adecuadamente.
- Caveats para producción: la información técnica es muy escasa (sin benchmarks, sin detalles de entrenamiento, sin contexto); se recomienda validar el comportamiento en el dominio concreto antes de desplegarlo. El modelo está especializado en el formato de Masrouf, por lo que su uso fuera de ese contexto puede degradar la calidad.

## Enlaces

- Hugging Face: https://huggingface.co/malekmajzoub/masrouf-ai
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
