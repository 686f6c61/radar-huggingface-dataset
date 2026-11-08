# oytunistrator/nano-siem-model

## Resumen

NanoSIEM es un modelo de lenguaje compacto especializado en ciberseguridad y análisis de SIEM (Security Information and Event Management), publicado por el usuario oytunistrator en Hugging Face. Está construido sobre la arquitectura Qwen2, con 1.543.714.304 parámetros totales (aproximadamente 1,5 mil millones), y se distribuye principalmente en formato GGUF para inferencia local mediante llama.cpp. El modelo está afinado con QLoRA y orientado a tareas de resumen de hallazgos de seguridad autorizados, correlación de evidencias con conocimiento público de seguridad e identificación de hechos faltantes en preguntas de incidentes y legales.

El modelo se presenta como parte de un sistema mayor, NanoSIEM, que incluye una capa RAG (Retrieval-Augmented Generation) encargada de suministrar evidencias de recuperación y URLs de fuentes para las afirmaciones que requieran información actualizada. El propio modelo no genera conocimiento actualizado por sí mismo: depende de que la capa RAG le proporcione el contexto documental. Está pensado para ejecución local con `llama-cli`, lo que facilita su despliegue en entornos donde los datos de seguridad no deben salir de la infraestructura.

Es relevante ahora porque los equipos de operaciones de seguridad (SOC) necesitan herramientas ligeras que puedan ejecutarse en hardware modesto y que ayuden a triar alertas, resumir incidentes y estructurar evidencias sin depender de APIs externas. Su tamaño reducido y su licencia "other" (con restricciones de uso claramente indicadas en la model card) lo sitúan en el segmento de modelos especializados de borde para ciberseguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2) |
| Parametros totales | 1.543.714.304 (~1,5 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones disponibles en el repo; niveles concretos no disponibles) |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | other (con restricciones de uso indicadas en la model card) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen2, un transformer decoder-only con atención causal estándar, según se desprende de la etiqueta `qwen2` del repositorio. El ajuste se realizó mediante QLoRA, técnica de fine-tuning eficiente en parámetros que congela los pesos base y entrena adaptadores de bajo rango sobre una representación cuantizada del modelo. El repositorio contiene tanto pesos en safetensors como versiones GGUF empaquetadas para llama.cpp.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. La model card únicamente describe el propósito del modelo (resumen de hallazgos de seguridad, correlación de evidencias e identificación de hechos faltantes) y su integración con una capa RAG externa que aporta las fuentes. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional orientada a análisis de seguridad.
- Resumen de hallazgos de seguridad autorizados.
- Correlación de evidencias con conocimiento público de seguridad suministrado vía RAG.
- Identificación de hechos faltantes en preguntas de incidentes y consultas legales.
- Soporte de razonamiento multi-turno en el contexto de análisis de incidentes.
- Capacidades multilingües limitadas a turco e inglés.
- Integración con llama.cpp para inferencia local mediante `llama-cli`.
- No se documenta soporte explícito de tool calling, function calling ni modo thinking.

## Casos de uso

- Triaje de alertas en un SOC: el modelo puede resumir alertas individuales y agrupar evidencias relacionadas cuando la capa RAG le proporciona los registros y las fuentes de conocimiento de seguridad, reduciendo el tiempo que un analista dedica a la lectura inicial.
- Resumen de incidentes para informes: a partir de los hallazgos autorizados que se le pasan como contexto, genera borradores de resumen estructurado que el analista revisa y completa antes de su distribución.
- Detección de lagunas de información: el modelo está entrenado para señalar qué hechos faltan en una investigación, lo que ayuda a los equipos a formular preguntas adicionales antes de cerrar un caso.
- Asistencia en consultas legales de seguridad: ofrece respuestas informativas sobre preguntas legales relacionadas con incidentes, siempre con la advertencia de que requieren revisión por un profesional cualificado.
- Análisis de líneas de log: puede interpretar líneas de registro y puertos aportados por el analista, recordando explícitamente que una línea de log o un puerto abierto no constituyen prueba de compromiso.
- Despliegue en entornos air-gapped: al ejecutarse localmente con llama.cpp y no requerir APIs externas, es adecuado para organizaciones que no pueden enviar datos de seguridad a servicios en la nube.
- Formación y concienciación: puede emplearse como asistente interno para explicar conceptos de SIEM y correlación de evidencias a personal junior, con las limitaciones de idioma (turco e inglés) y de alcance indicadas por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~1,5 B parámetros, en FP16 requiere aproximadamente 3 GB de VRAM; en cuantizaciones GGUF de 4 bits se estima en torno a 1-1,5 GB (estimación basada en el tamaño de parámetros, no confirmada por el autor).
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cualquier GPU consumer con al menos 4 GB de VRAM debería poder ejecutarlo en cuantización de 4 bits.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores, así como en equipos con GPU integrada de gama alta, aunque no hay confirmación del autor.
- Opciones de despliegue: llama.cpp (soporte oficial vía `llama-cli`); el repositorio incluye GGUF y está etiquetado como compatible con endpoints.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| NanoSIEM (oytunistrator) | ~1,5 B | no disponible | other | Ciberseguridad y SIEM con RAG |
| Qwen2.5-1.5B | ~1,5 B | 32K (según versión) | Apache 2.0 | Propósito general |
| Llama 3.2 1B | ~1,2 B | 128K | Llama 3.2 Community License | Propósito general |

La comparación con modelos de propósito general se basa en el tamaño de parámetros y la arquitectura de referencia (Qwen2), no en datos de rendimiento del modelo especializado, que no se han publicado. NanoSIEM se diferencia por su ajuste específico para tareas de seguridad y su integración con una capa RAG, a costa de un alcance lingüístico limitado a turco e inglés y una licencia restrictiva.

## Limitaciones y advertencias

- Uso prohibido para escaneo no autorizado, intrusión, explotación o decisiones legales automatizadas, según la model card.
- Las salidas legales son informativas y requieren revisión por un profesional cualificado.
- Un puerto, una línea de log o una salida del modelo no constituyen prueba de compromiso ni de responsabilidad legal.
- Dependencia de la capa RAG para afirmaciones actualizadas: sin evidencia de recuperación, el modelo puede no disponer de información vigente.
- Idiomas limitados a turco e inglés; no se documenta soporte de español.
- No se documentan sesgos conocidos ni tasas de alucinación medidas.
- Licencia "other" con restricciones: es necesario revisar los términos antes de cualquier uso comercial.
- Longitud de contexto no documentada, lo que dificulta planificar su uso en análisis de logs extensos.
- Modelo con pocas descargas (163) y sin likes, lo que implica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/oytunistrator/nano-siem-model
- Árbol de archivos del repositorio: https://huggingface.co/oytunistrator/nano-siem-model/tree/main
