# mlasli/Qwen3.8-27B-Heretic-Uncensored-IQ2_M-GGUF

## Resumen

El modelo `mlasli/Qwen3.8-27B-Heretic-Uncensored-IQ2_M-GGUF` es una cuantización GGUF en formato IQ2_M (9,8 GB) de una versión "abliterada" (sin censura) del modelo Qwen3.8-27B, desarrollada por el usuario mlasli. La abliteración es una técnica que elimina selectivamente las direcciones de rechazo aprendidas durante el alineamiento de seguridad, reduciendo drásticamente la tasa de negativas del modelo sin reentrenarlo. Esta versión concreta, v2.0.0, es una re-abliteración desde cero del Qwen/Qwen3.8-27B oficial, con una tasa de rechazo medida del 14,0% y una sobre-negativa benigna del 1,0%.

La relevancia de este modelo radica en que ofrece una alternativa local, ejecutable en hardware de consumo, para casos de uso que requieren respuestas sin restricciones temáticas (roleplay, escritura creativa, exploración de escenarios hipotéticos) manteniendo la arquitectura transformer densa de 27.300 millones de parámetros y la decodificación especulativa multi-token (MTP) del modelo original. La cuantización IQ2_M reduce el peso a menos de 10 GB, lo que permite su ejecución en GPUs con 12 GB de VRAM o incluso en CPU con llama.cpp.

Es importante señalar que esta ficha se basa exclusivamente en la información proporcionada por el autor en la model card de HuggingFace y en los resultados de búsqueda web. No se dispone de datos oficiales de benchmarks estándar (MMLU, HumanEval, etc.) para esta variante cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3.8) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens (segun fuentes externas; no confirmado en la model card) |
| Tipos de cuantizacion | Q8_0 (28 GB), Q6_K (21 GB), Q5_K_M (19 GB), Q4_K_M (16 GB), IQ4_XS (15 GB), IQ2_M (9,8 GB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizacion IQ2_M) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de 27.300 millones de parámetros con arquitectura Qwen3.8. Sobre este modelo, el autor aplicó una técnica de abliteración desde cero, cuyo objetivo era reducir la tasa de rechazo a un rango del 5-15% manteniendo la coherencia del modelo. El proceso se validó con métricas de divergencia KL multi-token (0,0071) y una tasa de sobre-negativa benigna del 1,0%. El modelo resultante conserva el mecanismo de decodificación especulativa MTP (multi-token prediction), con el bloque de borrador (`blk.64`) presente y fijado a cuantización Q8_0 en todas las versiones GGUF para preservar la precisión de la decodificación especulativa.

La cuantización IQ2_M se calibró con la técnica imatrix, utilizando un corpus wikitext-103 de 20 MB. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Generacion de texto libre sin filtros de seguridad tematica, gracias a la abliteracion que elimina la mayoria de respuestas de rechazo.
- Decodificacion especulativa MTP integrada, que acelera la generacion de tokens en hardware compatible con llama.cpp.
- Conversacion multi-turno y roleplay, validado como caso de uso principal por el autor.
- Soporte para integracion con llama.cpp (arquitectura `qwen35`) y Ollama mediante `ollama create`.
- Capacidad multilingue limitada al ingles; no se ha validado otros idiomas.
- Vision no confirmada: la model card indica "text-only validated", aunque fuentes externas mencionan un posible codificador de vision en el modelo base.

## Casos de uso

- Roleplay y ficcion interactiva: el modelo puede mantener personajes y tramas complejas sin rechazar solicitudes por contenido adulto o controvertido, gracias a su baja tasa de negativas (14%). Es adecuado para entornos de juego de rol textual en los que se requiere libertad creativa total.
- Escritura creativa sin restricciones: generacion de narrativa, poesia o dialogos con tematicas oscuras o maduras que otros modelos censuran. La ventana de contexto de 262k permite mantener novelas completas en memoria.
- Asistente conversacional para investigacion en alineacion de IA: al eliminar la capa de rechazo, permite estudiar el comportamiento del modelo subyacente sin el sesgo de la politica de seguridad, util para analisis de sesgos y robustez.
- Generacion de contenido para juegos de mesa o videojuegos: creacion de dialogos de NPC, descripciones de escenarios y misiones con libertad tematica, ejecutable localmente en equipos de gama media.
- Prototipado de aplicaciones de chat sin moderacion: desarrollo de chatbots para entornos controlados donde el contenido generado no requiere filtros, usando la cuantizacion IQ2_M para reducir requisitos de VRAM.
- Evaluacion de tecnicas de decodificacion especulativa: al conservar el MTP, sirve como banco de pruebas para medir la aceleracion de inferencia en diferentes hardwares con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo proporciona metricas internas de la abliteracion:

| Metrica | Valor |
|---|---|
| Tasa de rechazo (objetivo 5-15%) | 14,0% |
| Contador Heretic | 12,0% |
| KL multi-token | 0,0071 |
| Sobre-negativa benigna | 1,0% |

Estas metricas no son comparables con benchmarks de rendimiento general, sino que miden el grado de "descensura" del modelo. No se dispone de datos de perplejidad ni de velocidad de generacion para esta cuantizacion especifica.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantizacion IQ2_M ocupa 9,8 GB en disco. Con overhead de contexto y calculos, se recomienda al menos 12 GB de VRAM para ejecucion comoda en GPU.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080, o superiores. Tambien puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Si cabe en consumer GPU: si, en GPUs con 12 GB o mas. Para GPUs de 8 GB, se recomienda usar cuantizaciones mas agresivas (IQ2_M ya es la mas baja disponible).
- Opciones de despliegue: llama.cpp (con soporte MTP), Ollama (via `ollama create`), vLLM (segun el blog de MindStudio, aunque no confirmado para esta variante especifica).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dependera del hardware y de la configuracion de decodificacion especulativa.

## Comparativa con modelos similares

La comparativa se realiza con el modelo base Qwen3.8-27B y otras abliteraciones comunitarias del mismo modelo. No se dispone de datos cuantitativos de rendimiento para las alternativas, por lo que la comparacion es cualitativa.

| Modelo | Tamano | Contexto | Licencia | Caracteristica principal |
|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 27,3 B | 262k (segun fuentes) | Apache-2.0 | Modelo oficial con alineamiento de seguridad |
| mlasli/Qwen3.8-27B-Heretic-Uncensored (BF16) | 27,3 B | no disponible | Apache-2.0 | Abliteracion v2.0.0, MTP retenido |
| mlasli/Qwen3.8-27B-Heretic-Uncensored-IQ2_M-GGUF (este) | 27,3 B | no confirmado | Apache-2.0 | Cuantizacion IQ2_M de la abliteracion |
| Qwen3.8-27B AEON Uncensored | 27,3 B | no disponible | Apache-2.0 | Abliteracion con metodologia KL-drift, ejecutable via vLLM |
| Wassimyounes01/qwen38-uncensored | 27,3 B | no disponible | Apache-2.0 | Abliteracion con pack de sistema uncensored para Ollama |

La principal diferencia entre estas variantes radica en la metodologia de abliteracion y en las cuantizaciones ofrecidas. Este modelo destaca por conservar el MTP y por ofrecer una cuantizacion muy baja (IQ2_M) que permite su uso en hardware limitado, aunque con posible perdida de calidad respecto a cuantizaciones mayores.

## Limitaciones y advertencias

- La abliteracion elimina el alineamiento de seguridad: el modelo puede generar contenido ofensivo, ilegal o peligroso sin filtros. El propio autor advierte que debe usarse de forma responsable y conforme a las leyes locales.
- Solo se ha validado el idioma ingles; el rendimiento en otros idiomas no esta garantizado.
- La cuantizacion IQ2_M es una de las mas agresivas disponibles; puede degradar la coherencia y la precision del modelo en comparacion con cuantizaciones superiores (Q4_K_M, Q6_K, etc.).
- La vision no esta confirmada: la model card indica "text-only validated", por lo que cualquier capacidad multimodal no debe asumirse.
- No se dispone de benchmarks estandar de rendimiento, por lo que no es posible evaluar su calidad relativa frente a otros modelos de tamano similar.
- La licencia Apache-2.0 permite uso comercial, pero la naturaleza "uncensored" puede generar problemas legales o de reputacion en entornos empresariales.
- El modelo fue creado en agosto de 2026 (segun la fecha de HuggingFace), lo que indica que es una version reciente y con pocas descargas (0), por lo que su adopcion y soporte comunitario son limitados.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/mlasli/Qwen3.8-27B-Heretic-Uncensored-IQ2_M-GGUF
- Version BF16 (modelo base de la cuantizacion): https://huggingface.co/mlasli/Qwen3.8-27B-Heretic-Uncensored-BF16
- Cuantizaciones GGUF adicionales: https://huggingface.co/mlasli/Qwen3.8-27B-Heretic-Uncensored-Q8_0-GGUF (y variantes Q6_K, Q5_K_M, Q4_K_M, IQ4_XS)
- Repositorio GitHub de abliteracion similar: https://github.com/Wassimyounes01/qwen38-uncensored
- Blog sobre abliteracion AEON: https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- Pagina de AIAny con cuantizaciones: https://aiany.app/item/qwen3-8-27b-uncensored-gguf
- Guia de ejecucion local (Ollama, GGUF): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
