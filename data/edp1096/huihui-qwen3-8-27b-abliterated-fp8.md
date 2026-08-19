# edp1096/Huihui-Qwen3.8-27B-abliterated-FP8

## Resumen

Huihui-Qwen3.8-27B-abliterated-FP8 es una cuantizacion en FP8 del modelo Qwen3.8-27B, la ultima generacion de la familia abierta de Qwen desarrollada por Alibaba. Se trata de un modelo denso de 27.8 mil millones de parametros con arquitectura hibrida (Gated DeltaNet y Gated Attention) y capacidades nativas de vision-lenguaje, capaz de procesar imagenes y videos. El sufijo "abliterated" indica que se han eliminado las restricciones de alineacion (refusals), un proceso habitual en la comunidad open source para liberar el potencial del modelo en escenarios sin censura.

La cuantizacion FP8 de grano fino (block size 128) reduce el peso del modelo a 30.9 GB, manteniendo un rendimiento casi identico al original segun la model card. El modelo soporta un contexto nativo de 262.144 tokens, extensible hasta 1.000.000, e incorpora control flexible de razonamiento (thinking mode) con parametros como `reasoning_effort` y `preserve_thinking`. Esta version concreta esta publicada por el usuario edp1096 bajo licencia Apache 2.0 y es compatible con Transformers, vLLM, SGLang y TokenSpeed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Gated DeltaNet (linear attention) + Gated Attention (full attention) con vision encoder |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | FP8 (grano fino, block size 128) |
| Idiomas soportados | No disponible (no especificado en la informacion proporcionada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura hibrida que combina capas de atencion lineal (Gated DeltaNet) con capas de atencion completa (Gated Attention). El layout del modelo es de 64 capas organizadas en 16 bloques, cada uno compuesto por 3 subcapas de Gated DeltaNet seguidas de FFN, y una subcapa de Gated Attention seguida de FFN. La atencion lineal utiliza 48 cabezas para V y 16 para QK con dimension de cabeza 128, mientras que la atencion completa usa 24 cabezas Q y 4 cabezas KV con dimension 256 y RoPE de 64 dimensiones. El modelo incorpora Multi-Token Prediction (MTP) entrenado con multiples pasos, lo que mejora la eficiencia de decodificacion.

El entrenamiento incluye fases de pre-training y post-training, con mejoras especificas en tareas de codigo, trabajo profesional, investigacion y tareas agente de largo horizonte. La cuantizacion FP8 aplicada en este repositorio utiliza bloques de 128 elementos, manteniendo metricas de rendimiento casi identicas al modelo original segun la model card. No se especifican datos sobre el volumen de tokens de entrenamiento ni sobre tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento complejo con control flexible de thinking mode (activado por defecto, desactivable por peticion).
- Comprension de vision-lenguaje: procesa imagenes y videos, incluyendo diagramas STEM, documentos y videos de hasta una hora de duracion.
- Ejecucion de tareas agente: planificacion autonoma, manejo de feedback del entorno y finalizacion fiable de tareas multi-paso.
- Soporte de ajuste de esfuerzo de razonamiento mediante el parametro `reasoning_effort`.
- Preservacion de contexto de razonamiento historico mediante `preserve_thinking`.
- Compatibilidad con herramientas de desarrollo y harnesses populares (vLLM, SGLang, TokenSpeed, Transformers).

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens nativos), lo que permite mantener el historial completo de interacciones sin truncamiento, adecuado para soporte tecnico y consultas complejas.
- Generacion de codigo en produccion: con capacidades de codigo mejoradas y MTP, puede integrarse en pipelines de CI/CD para autocompletado, revision de codigo y generacion de tests, con despliegue mediante vLLM para baja latencia.
- Analisis de documentos cientificos y diagramas: su vision encoder permite extraer informacion de graficas, tablas y esquemas STEM, util en investigacion y educacion.
- Agentes autonomos de navegacion web: su planificacion multi-paso y manejo de feedback del entorno lo hacen apto para tareas como reservas, busquedas estructuradas o automatizacion de procesos con tool calling.
- Procesamiento de video para resumen o busqueda: soporta videos de hasta una hora, permitiendo transcripcion, resumen y respuesta a preguntas sobre contenido audiovisual.
- Desarrollo de asistentes personales sin censura: al ser abliterado, puede emplearse en entornos donde se requiere generacion libre sin restricciones de contenido, siempre bajo la responsabilidad del operador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos en la informacion disponible. La model card incluye una tabla de rendimiento comparativo, pero los datos estan truncados en el extracto proporcionado. Se mencionan comparaciones con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max en la categoria "Agentic terminal coding", pero no se incluyen los valores numericos. No se dispone de cifras concretas de MMLU, HumanEval, GSM8K u otros benchmarks estandar en la informacion facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en FP8 ocupa aproximadamente 30.9 GB en disco. Para inferencia con Transformers o vLLM, se recomienda al menos 32-40 GB de VRAM, dependiendo de la longitud de contexto y el tamano de lote.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB), RTX 4090 (24 GB) podria ser insuficiente para contexto largo; se recomienda al menos 48 GB para uso comodo con ventanas grandes.
- En consumer GPU: no es viable en GPUs de 16 GB o menos; una RTX 4090 con 24 GB podria ejecutar el modelo con cuantizacion FP8 y contexto reducido, pero con limitaciones.
- Opciones de despliegue: compatible con vLLM, SGLang, TokenSpeed y Hugging Face Transformers. No se menciona soporte explicito para llama.cpp u Ollama en la informacion proporcionada.
- Latencia y throughput: no disponibles; dependen del hardware y del backend utilizado. La arquitectura con Gated DeltaNet (linear attention) deberia ofrecer menor coste computacional en contexto largo frente a atencion completa pura.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated-FP8 | 27,8 B | 262K (ext. 1M) | Denso hibrido, VLM | Apache 2.0 | HuggingFace (FP8) |
| Qwen3.6-27B | 27 B (estimado) | No disponible | Denso, VLM | Apache 2.0 | HuggingFace |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | API propietaria |
| Muse Glimmer-30B | 30 B | No disponible | No disponible | No disponible | No disponible |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible | No disponible |

Los datos de Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max provienen exclusivamente de la tabla de benchmarks de la model card y no se dispone de especificaciones detalladas de estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterado: se han eliminado las restricciones de alineacion, por lo que puede generar contenido inapropiado, ofensivo o peligroso sin filtros. Su uso en produccion requiere medidas de salvaguarda externas.
- Riesgo de alucinacion: como todo LLM, puede inventar hechos o citas, especialmente en tareas de razonamiento largo o con contexto muy extenso.
- Idiomas no especificados: la informacion proporcionada no detalla los idiomas soportados; Qwen suele cubrir multiples idiomas, pero no se confirma para esta version.
- Cuantizacion FP8: aunque la model card afirma un rendimiento casi identico al original, pueden existir diferencias minimas en tareas de alta precision numerica.
- Sin datos de benchmarks verificables: la tabla de rendimiento esta incompleta en la informacion disponible, lo que impide validar las afirmaciones de calidad de forma independiente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener condiciones adicionales; se recomienda revisar la licencia del modelo original.
- Fecha de creacion futura: el repositorio indica creacion en agosto de 2026, lo que sugiere que podria tratarse de un modelo hipotetico o de una fecha erronea; verificar la autenticidad antes de usar en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/edp1096/Huihui-Qwen3.8-27B-abliterated-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Servicio Qwen Cloud: https://www.qwencloud.com
- Documentacion de Qwen3.8-27B (via Qwen Cloud): https://www.qwencloud.com/models/qwen3.8-27b
