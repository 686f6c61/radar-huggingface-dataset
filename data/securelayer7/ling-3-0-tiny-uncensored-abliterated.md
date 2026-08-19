# Securelayer7/Ling-3.0-tiny-Uncensored-Abliterated

## Resumen

Securelayer7/Ling-3.0-tiny-Uncensored-Abliterated es un derivado del modelo Ling-3.0-tiny (BailingMoeV3) de inclusionAI, al que se le ha eliminado la dirección de rechazo a nivel de pesos mediante una técnica de abliteración. El resultado es un modelo que responde de forma directa y completa a consultas sobre ciberseguridad, red-teaming y pruebas de penetración, temas en los que los modelos alineados suelen negarse a contestar. Está pensado para investigación legítima y trabajo de seguridad autorizado, y su licencia MIT permite uso comercial con las debidas salvaguardas.

La principal innovación técnica de este repo es que incluye un port puro-torch del código de modelado de BailingMoeV3, sin dependencias de Triton ni de la librería `fla`. Esto permite que el modelo se ejecute en Apple Silicon (MPS) y en CPU, algo que el original no soporta. La abliteración se realizó sobre ese port, atacando tanto las proyecciones de atención (MLA y KDA) como los 128 expertos enrutados y el experto compartido, reduciendo las refusals de 35/100 a 8/100 con una divergencia KL de 0.046, lo que indica un impacto mínimo en las capacidades generales.

Con 7.9B parámetros totales y solo 1.3B activos por token, es un modelo MoE eficiente para despliegue en edge. El contexto máximo no está documentado en la información disponible, pero al ser un derivado de Ling-3.0-tiny, se espera que herede las capacidades de razonamiento del original, aunque con la particularidad de que puede derivar ocasionalmente al chino tras responder en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido con MLA (Multi-head Latent Attention) + KDA linear attention, 24 capas, 128 expertos enrutados + 1 experto compartido |
| Parametros totales | 7.893.389.856 (7.9B) |
| Parametros activos | 1.3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (existen versiones GGUF de terceros, p. ej. SC117/Ling-3.0-tiny-abliterated-APEX-GGUF) |
| Idiomas soportados | inglés (modelo bilingüe inglés/chino, puede derivar al chino) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Ling-3.0-tiny-Uncensored-Abliterated es un modelo de mezcla de expertos (MoE) con una arquitectura híbrida que combina atención latente multi-cabezal (MLA) y atención lineal KDA. Tiene 24 capas, cada una con 128 expertos enrutados de los que solo 8 se activan por token, más un experto compartido. Esta configuración permite que, con 7.9B parámetros totales, solo se activen 1.3B por token, lo que reduce costes de inferencia y la hace adecuada para despliegue en dispositivos con recursos limitados.

El modelo base, Ling-3.0-tiny, fue desarrollado por Ant Group (inclusionAI) y entrenado con datos bilingües inglés-chino. Esta versión derivada se creó en dos pasos: primero se realizó un port puro-torch del código de modelado de BailingMoeV3, eliminando las dependencias de Triton y `fla` para permitir su ejecución en MPS y CPU; después se aplicó abliteración mediante la herramienta Heretic con optimización multiobjetivo Optuna TPE, minimizando las refusals y la divergencia KL. La abliteración se aplicó a las proyecciones de escritura residual de ambas rutas de atención (MLA `o_proj` y KDA `dense`) y a las proyecciones de salida de todos los expertos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se utilizó RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento conversacional, con especial énfasis en temas de ciberseguridad, red-teaming y pruebas de penetración.
- Respuestas directas y sin rechazos en escenarios donde los modelos alineados suelen negarse, gracias a la eliminación de la dirección de rechazo a nivel de pesos.
- Soporte de razonamiento multi-turno y capacidad de mantener contexto conversacional (la longitud exacta del contexto no está documentada).
- Capacidades multilingües limitadas: el modelo es bilingüe inglés-chino, aunque puede derivar al chino tras responder en inglés.
- Ejecución en Apple Silicon (MPS) y CPU gracias al port puro-torch sin Triton, lo que amplía las opciones de despliegue frente al modelo original.
- No se ha documentado soporte para tool calling, function calling, visión, audio ni modos de pensamiento explícitos.

## Casos de uso

- Pruebas de penetración autorizadas: el modelo puede explicar técnicas de explotación, generar payloads de prueba y sugerir vectores de ataque en entornos controlados, sin las restricciones típicas de los modelos alineados.
- Red-teaming interno: equipos de seguridad pueden usarlo para simular adversarios y generar escenarios de ataque realistas, evaluando la postura defensiva de sus propias infraestructuras.
- Análisis de vulnerabilidades: dado un fragmento de código o una configuración, el modelo puede identificar posibles fallos de seguridad y recomendar mitigaciones, acelerando la revisión manual.
- Educación en seguridad ofensiva: instructores y estudiantes de ciberseguridad pueden emplearlo para aprender técnicas de ataque y defensa en laboratorios aislados, con ejemplos prácticos y explicaciones detalladas.
- Investigación de malware: el modelo puede ayudar a analizar muestras de malware, explicar su comportamiento y sugerir métodos de detección, sin las reticencias que mostraría un modelo alineado.
- Generación de documentación técnica de seguridad: redacción de informes de hallazgos, guías de explotación y manuales para equipos de respuesta a incidentes, con un tono directo y sin censura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la métrica de refusals (35/100 → 8/100) y la divergencia KL (0.046) tras la abliteración, pero no hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 7.9B parámetros en bfloat16 se requieren aproximadamente 15.8 GB de memoria (solo pesos). En cuantización de 4 bits (si se dispone de una versión GGUF cuantizada), se necesitarían unos 4-5 GB.
- GPU recomendadas: el modelo puede ejecutarse en GPU consumer como RTX 3090, RTX 4090 (24 GB VRAM) en bf16, o en GPUs con 8-12 GB si se usa cuantización. También funciona en Apple Silicon (MPS) y en CPU, aunque con menor rendimiento.
- En Apple Silicon: el port puro-torch permite ejecución en MPS sin necesidad de CUDA ni Triton, lo que lo hace viable en Macs con M4 Max (usado para la abliteración) y otros chips M-series.
- Opciones de despliegue: compatible con transformers (carga directa con `trust_remote_code=True`). Existen versiones GGUF de terceros para usar con llama.cpp, Ollama u otros runners. Para CUDA con `fla` instalado, se puede usar el código de modelado original para mayor velocidad.
- Latencia y throughput: no se han publicado cifras concretas. Al ser un MoE con solo 1.3B activos, la velocidad de generación debería ser superior a la de un modelo denso de 7.9B, pero depende del hardware y de la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Particularidad |
|---|---|---|---|---|---|
| Securelayer7/Ling-3.0-tiny-Uncensored-Abliterated | 7.9B | 1.3B | no disponible | MIT | Abliterado, sin rechazos, corre en Apple Silicon |
| inclusionAI/Ling-3.0-tiny (original) | 7.9B | 1.3B | no disponible | MIT | Modelo base, requiere Triton/fla, con alineación estándar |
| SC117/Ling-3.0-tiny-abliterated-APEX-GGUF | 7.9B | 1.3B | no disponible | MIT (derivado) | Versión GGUF cuantizada con APEX, también abliterada |

No se dispone de datos de rendimiento comparativo entre estos modelos. La diferencia principal radica en la portabilidad (el port puro-torch) y en el grado de abliteración aplicado.

## Limitaciones y advertencias

- El modelo no tiene guardas de seguridad incorporadas: al estar abliterado, puede generar contenido peligroso, ilegal o dañino si se usa malintencionadamente. El operador es responsable de implementar filtros a nivel de aplicación y de cumplir la legislación vigente.
- Riesgo de alucinación: como cualquier LLM, puede inventar información, especialmente en temas técnicos muy específicos. Se recomienda verificar las respuestas con fuentes fiables.
- Deriva al chino: tras responder en inglés, el modelo puede cambiar al chino de forma ocasional. El sampling recomendado (temperature 0.7, top_p 0.95) mitiga este comportamiento, pero no lo elimina por completo.
- Contexto no documentado: se desconoce la longitud máxima de contexto soportada, lo que dificulta su uso en aplicaciones que requieran ventanas largas.
- Sesgos: al ser un derivado de un modelo entrenado con datos bilingües, puede heredar sesgos culturales o lingüísticos. No se han realizado evaluaciones de sesgo en esta versión.
- Rendimiento degradado con greedy decoding: la model card advierte que la decodificación greedy puede degradar la calidad de las respuestas, por lo que es necesario usar sampling.
- Restricciones de uso: aunque la licencia es MIT, el uso responsable exige que el despliegue esté restringido a investigación legítima y trabajo de seguridad autorizado. La distribución de contenido ilegal (p. ej., CSAM) debe bloquearse en la capa de servicio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Securelayer7/Ling-3.0-tiny-Uncensored-Abliterated
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Documentación de Ling: https://developer.ant-ling.com/en/docs/models/ling/
- Versión GGUF de terceros: https://huggingface.co/SC117/Ling-3.0-tiny-abliterated-APEX-GGUF
