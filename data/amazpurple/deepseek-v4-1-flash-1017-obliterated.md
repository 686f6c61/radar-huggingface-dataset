# amazpurple/DeepSeek-V4.1-Flash-1017-obliterated

## Resumen

DeepSeek-V4.1-Flash-1017-obliterated es una variante del modelo DeepSeek-V4.1-Flash-1017, publicado por el usuario amazpurple en Hugging Face. Se trata de una version con la direccion de rechazo ablacionada (abliterated) generada mediante la herramienta OBLITERATUS con el metodo failspy, que elimina la tendencia del modelo original a declinar peticiones. El modelo base es un transformer de tipo mezcla de expertos (MoE) desarrollado por DeepSeek, con aproximadamente 754.600 millones de parametros totales segun los pesos en safetensors.

El modelo conserva la arquitectura y capacidades del original, pero modifica su comportamiento de seguridad: el indice de rechazo cae del 81,62% al 4,30% en el corpus de evaluacion de OBLITERATUS, mientras que la asistencia perjudicial sube del 10,38% al 78,28%. La divergencia KL respecto al original es de 0,1305 nats, lo que indica un cambio moderado en la distribucion de salida. La coherencia y la capacidad se mantienen al 100% segun las comprobaciones del autor.

Es relevante ahora porque ejemplifica la practica creciente de publicar variantes ablacionadas de modelos fronterizos con licencia permisiva (MIT), lo que plantea cuestiones tecnicas sobre la robustez de los mecanismos de alineamiento y de seguridad en modelos abiertos de gran escala. El repositorio ocupa 1.509,4 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `moe`, `deepseek_v41_text`) |
| Parametros totales | 754.638.836.864 (~754,6 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del DeepSeek-V4.1-Flash-1017 original, identificada en las etiquetas como `deepseek_v41_text` y `moe`, es decir, un transformer con capas de mezcla de expertos orientado a generacion de texto. Los pesos se distribuyen en safetensors en precision BF16 y el repositorio completo ocupa 1.509,4 GB, coherente con un modelo de ~754,6 B de parametros totales. No se dispone de informacion sobre el numero de parametros activos por token, la longitud de contexto nativa ni la composicion del dataset de entrenamiento original.

La innovacion tecnica de esta ficha no reside en el entrenamiento sino en la intervencion post-entrenamiento: se aplica una ablacion de la direccion de rechazo con OBLITERATUS y el metodo failspy, que modifica los pesos para suprimir la representacion interna asociada a rechazar peticiones. Segun la model card, el resultado mantiene coherencia y capacidad al 100% en las pruebas del autor, con una divergencia KL de 0,1305 nats frente al modelo original medida como KL forward a nivel de token de secuencia. No se documenta RLHF, DPO ni datos adicionales de ajuste en la informacion disponible.

## Capacidades

- Generacion de texto conversacional y de un solo turno, heredada del modelo base DeepSeek-V4.1-Flash-1017.
- Razonamiento y respuesta a peticiones que el modelo original rechazaba: el indice de respuesta directa a la solicitud sube al 86,52% frente al 16,59% del original.
- Capacidad declarada del 100% en las 6 comprobaciones de capacidad del autor (sin detalle de que miden).
- Coherencia declarada del 100% en la evaluacion del autor.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el campo de idiomas no esta informado.
- Modo thinking: la evaluacion MMLU se realizo con thinking desactivado, lo que sugiere que el modelo base dispone de un modo de razonamiento, aunque no se detalla su funcionamiento en esta variante.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo sirve como caso controlado para estudiar como la ablacion de la direccion de rechazo afecta a la distribucion de salidas, con metricas de KL y tasas de rechazo documentadas y comparables contra el original.
- Analisis de robustez de filtros de seguridad: permite evaluar clasificadores y guardrails de produccion frente a un modelo que responde al 78,28% de peticiones con asistencia perjudicial, midiendo la tasa de deteccion de los sistemas de moderacion.
- Generacion de texto creativo sin restricciones de rechazo: para tareas de ficcion, guiones o narrativa donde el modelo original declinaba contenido sensible, con la advertencia de que la calidad y seguridad no estan garantizadas.
- Evaluacion comparativa de variantes ablacionadas: util para estudiar la relacion entre divergencia KL y degradacion de capacidad en modelos MoE de gran escala, replicando el protocolo MMLU zero-shot del autor.
- Despliegue en entornos de investigacion con requisitos de licencia permisiva: la licencia MIT facilita su uso y modificacion en proyectos academicos, aunque el tamano exige infraestructura de centro de datos.
- Analisis de sesgos y comportamiento en dominios sensibles: al suprimir el rechazo, el modelo expone de forma mas directa los sesgos y conocimientos del modelo base, lo que facilita su auditoria en condiciones controladas.
- Pruebas de estres de pipelines de moderacion y red teaming: sirve como generador adversarial para validar la resiliencia de sistemas de clasificacion de contenido en produccion.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los del autor, centrados en rechazo, asistencia perjudicial y MMLU. La tabla MMLU de la model card aparece truncada en el material proporcionado, por lo que no se incluye la precision numerica de ninguno de los dos modelos.

| Metrica | DeepSeek-V4.1-Flash-1017 | V4.1-Flash-1017-obliterated | Delta |
|---|---:|---:|---:|
| Tasa de rechazo (50 prompts) | no disponible en detalle | 4% | no disponible |
| Coherencia | no disponible | 100% | no disponible |
| Capacidad (6 checks) | no disponible | 100% (6/6) | no disponible |
| KL divergence vs original | referencia | 0,1305 nats | no disponible |
| Rechazo completo (corpus 842) | 81,62% | 4,30% | -77,33 pp |
| Rechazo parcial | 4,89% | 14,44% | +9,55 pp |
| Sin rechazo | 13,37% | 78,28% | +64,92 pp |
| Asistencia perjudicial | 10,38% | 78,28% | +67,90 pp |
| Respuesta directa a la solicitud | 16,59% | 86,52% | +69,93 pp |
| Alternativa segura | 83,29% | 10,50% | -72,79 pp |
| Danio severo (nivel 4) | 0,12% | 9,31% | +9,19 pp |
| Accionabilidad nivel 4 | 3,46% | 20,76% | +17,30 pp |

No se han publicado resultados de benchmarks de capacidad general (MMLU completo, HumanEval, GSM8K) en la informacion disponible; la tabla MMLU del autor esta truncada y no permite extraer cifras.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,5 TB solo para pesos (754,6 B de parametros x 2 bytes), mas overhead de activaciones y cache KV; requiere nodos multi-GPU.
- Cuantizacion a 8 bits: ~755 GB de pesos; a 4 bits: ~378 GB. No se han publicado ficheros GGUF ni cuantizaciones oficiales en el repositorio.
- GPU recomendadas: clusters de H100 80 GB (minimo ~19 GPU en BF16 solo para pesos) o A100 80 GB; no cabe en una RTX 4090 (24 GB) ni en ninguna GPU de consumo individual.
- Despliegue: la libreria declarada es transformers; no se confirma soporte de vLLM, TGI, llama.cpp u Ollama en la informacion disponible. El tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-obliterated | ~754,6 B (MoE) | no disponible | MIT | publicado, 0 descargas |
| DeepSeek-V4.1-Flash-1017 (base) | no disponible en el material | no disponible | no disponible | referencia del autor |
| Otras variantes abliterated de DeepSeek | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar rendimiento, contexto o disponibilidad con alternativas de la misma categoria; la informacion proporcionada solo cubre el modelo base y esta variante.

## Limitaciones y advertencias

- La ablacion elimina el rechazo en gran medida: el 78,28% de las respuestas del corpus de evaluacion se clasificaron como asistencia perjudicial, frente al 10,38% del original.
- El 44,75% de las respuestas alcanza nivel 3 de danio (danio grave) y el 9,31% nivel 4 (grave o generalizado), segun la clasificacion del autor con Claude Opus 4.6 y GPT-6.1 Sol.
- El 20,76% de las respuestas se clasifican como suficientemente concretas para habilitar la conducta solicitada (accionabilidad nivel 4).
- Riesgo elevado de uso indebido en produccion: no debe desplegarse como asistente de cara al publico sin guardrails externos.
- La evaluacion del autor usa jueces automaticos (Claude Opus 4.6, GPT-6.1 Sol y Codex local) y no verifica la ejecucion de las instrucciones; los porcentajes describen el texto visible, no resultados reales.
- 25 respuestas quedaron sin anotar por bloqueos de proveedor y 1 anotacion es ambigua; los porcentajes se calculan sobre 838 prompts.
- Datos de contexto, idiomas, parametros activos y cuantizaciones no disponibles: dificulta planificar el despliegue.
- El modelo base es de noviembre de 2026 y la variante se publico el 2 de noviembre de 2026 con 0 descargas; no hay evidencia de uso comunitario ni validacion independiente.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre el cumplimiento normativo en jurisdicciones con requisitos de moderacion.
- Sesgos conocidos: no documentados en la informacion disponible; al suprimir el rechazo, los sesgos del modelo base pueden expresarse con mayor frecuencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amazpurple/DeepSeek-V4.1-Flash-1017-obliterated
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Herramienta OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Detalles del metodo (provenance): https://huggingface.co/amazpurple/DeepSeek-V4.1-Flash-1017-obliterated/blob/main/winner-recovery-provenance.json
- Resultados de evaluacion: https://huggingface.co/amazpurple/DeepSeek-V4.1-Flash-1017-obliterated/blob/main/evaluation-status.json
- Licencia: https://huggingface.co/amazpurple/DeepSeek-V4.1-Flash-1017-obliterated/blob/main/LICENSE
