# mradermacher/MiniCPM5-2B-Claude-Fable5-heretic-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo MiniCPM5-2B-Claude-Fable5-heretic, un ajuste supervisado (SFT) derivado de la familia MiniCPM de OpenBMB y especializado en generar bloques de razonamiento antes de la respuesta final (modo "thinking"). El autor de las cuantizaciones es mradermacher, que publica conversiones estáticas de los pesos originales alojados por el usuario saidutta69. El modelo base del ajuste procede de la familia MiniCPM5, que se distribuye en variantes de 1B y 2B parámetros; este repositorio corresponde a la variante de 2B.

La relevancia de este modelo radica en que traslada a hardware de consumo un patrón de razonamiento explícito inspirado en las trazas de Claude Fable 5, empaquetado en formato GGUF para ejecutarse con llama.cpp, Ollama, LM Studio, Jan o KoboldCpp. Con 2.516.756.480 parámetros (unos 2,52 mil millones) y un repositorio de 22,8 GB que agrupa doce niveles de cuantización, el modelo está pensado para inferencia local en CPU y GPU modestas, no para despliegues de servidor de gran escala.

El sufijo "heretic" suele asociarse en la comunidad a procesos de ablación de direcciones de rechazo (por ejemplo, mediante la herramienta Heretic), aunque la model card no confirma la técnica empleada. Del mismo modo, la model card del repositorio no declara licencia, idiomas ni arquitectura explícita, por lo que buena parte de los datos técnicos de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; el modelo base pertenece a la familia MiniCPM de OpenBMB) |
| Parametros totales | 2.516.756.480 (~2,52 mil millones) |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (conversion estatica desde pesos HuggingFace; convert_type: hf, quantize_version: 2) |

Datos adicionales del repositorio: tamano total de 22,8 GB, 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 13 de septiembre de 2026. Etiquetas declaradas: gguf, endpoints_compatible, region:us, conversational.

## Arquitectura y entrenamiento

No hay informacion detallada sobre la arquitectura en la model card de este repositorio. El modelo es una conversion a GGUF de los pesos publicados en saidutta69/MiniCPM5-2B-Claude-Fable5-heretic, que a su vez es un ajuste supervisado de la familia MiniCPM5 de OpenBMB. Segun la cobertura periodistica disponible sobre la variante de 1B, se trata de un fine-tuning supervisado sobre trazas de Claude Fable 5, no de una destilacion a nivel de pesos, lo que implica que el comportamiento de razonamiento se ha aprendido por imitacion de ejemplos y no por transferencia directa de logits.

Los metadatos de conversion indican quantize_version 2, output_tensor_quantised 1 y convert_type hf, es decir, una conversion directa desde safetensors de HuggingFace a GGUF con cuantizacion estatica de tensores. El aviso sobre la variante de 1B menciona que el modelo puede emitir bloques de razonamiento antes de la respuesta final, que las aplicaciones pueden recortar, y recomienda una configuracion de muestreo de temperature=0.9 y top_p=0.95 para el modo Think. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado en el repositorio es "conversational", por lo que el uso previsto es el dialogo multi-turno.
- Modo de razonamiento explicito (thinking): segun la documentacion de la variante de 1B del mismo ajuste, el modelo puede generar bloques de razonamiento antes de la respuesta final, que las aplicaciones cliente pueden filtrar o mostrar por separado.
- Ejecucion local en hardware de consumo: al distribuirse en GGUF, soporta inferencia en CPU y GPU a traves de llama.cpp, Ollama, LM Studio, Jan y KoboldCpp.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere integracion con infraestructura de inferencia que consuma endpoints compatibles.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente; el modo de razonamiento en bloques es el unico indicio relacionado.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Asistente conversacional local sin conexion: el modelo puede ejecutarse en un portatil o en un equipo de sobremesa con llama.cpp u Ollama, gestionando dialogos multi-turno sin enviar datos a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Prototipado de agentes con razonamiento visible: gracias a la emision de bloques de razonamiento antes de la respuesta, se puede integrar en aplicaciones que muestren la cadena de pensamiento por separado del resultado final, util para depuracion y evaluacion de flujos de decision.
- Generacion de texto asistida en editores: con LM Studio o Jan, el modelo puede actuar como asistente de redaccion dentro de un entorno de escritorio, aprovechando que su huella de memoria en cuantizaciones Q4 es reducida.
- Filtrado y clasificacion de texto en pipelines de datos: al ser un modelo de 2,52 mil millones de parametros, se puede desplegar en varios procesos concurrentes por GPU para tareas de etiquetado o resumen de lotes de documentos.
- Educacion e investigacion sobre tecnicas de ablacion: dado el sufijo "heretic" del ajuste, el modelo resulta un objeto de estudio para analizar como afectan los procesos de ablacion al comportamiento de rechazo en modelos pequenos.
- Experimentacion con cuantizaciones agresivas: la disponibilidad de doce niveles (desde IQ4_XS y Q2_K hasta F16) permite medir la degradacion de calidad frente al ahorro de memoria en un mismo conjunto de pesos, algo util para calibrar politicas de despliegue.
- Chatbots de soporte en dispositivos con recursos limitados: en su cuantizacion Q3 o Q4 cabe en GPUs de gama de entrada y en CPUs modernas, habilitando asistentes embebidos en quioscos o aplicaciones de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento de parametros (2,52 mil millones) y del formato GGUF; no proceden de mediciones publicadas por el autor.

- VRAM estimada para inferencia (aproximada, solo pesos):
  - F16: en torno a 5,0 GB
  - Q8_0: en torno a 2,7 GB
  - Q6_K: en torno a 2,1 GB
  - Q5_K_M / Q5_K_S: en torno a 1,8 GB
  - Q4_K_M / Q4_K_S / IQ4_XS: en torno a 1,5 GB
  - Q3_K_L / Q3_K_M / Q3_K_S: entre 1,1 y 1,4 GB
  - Q2_K: en torno a 1,0 GB
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM puede ejecutar las cuantizaciones Q3 y Q4; para F16 se recomienda al menos 6-8 GB (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090). En entornos de servidor, una A100 o H100 estan sobredimensionadas para este tamano y solo se justifican por concurrencia masiva.
- Cabe en GPU de consumo: si, en la practica totalidad de las cuantizaciones. La F16 cabe en GPUs de 6 GB o mas; las variantes Q4 y Q3 caben incluso en GPUs de 4 GB y en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan y KoboldCpp segun la documentacion del ajuste de origen; tambien es compatible con servidores de inferencia orientados a GGUF (por ejemplo, llama.cpp server o vLLM con soporte GGUF).
- Latencia y throughput: no disponible. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-2B-Claude-Fable5-heretic (GGUF, este repo) | 2.516.756.480 | no disponible | GGUF (12 cuantizaciones) | no disponible | HuggingFace, 0 descargas |
| MiniCPM5-2B-Claude-Fable5-heretic (pesos originales, saidutta69) | no disponible | no disponible | safetensors | no disponible | HuggingFace |
| MiniCPM5-1B (variante de 1B del mismo ajuste, segun prensa) | ~1B (referido como modelo de 657 MB en GGUF) | no disponible | GGUF | no disponible | HuggingFace, Ollama, llama.cpp, LM Studio |
| Familia MiniCPM5 de OpenBMB | 1B y 2B segun variante | no disponible | safetensors y GGUF | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparado (MMLU, HumanEval, GSM8K u otros) para ninguno de los modelos de la tabla, por lo que la comparacion se limita a parametros, formato y disponibilidad. Conviene notar que la cobertura periodistica disponible describe la variante de 1B, mientras que este repositorio corresponde a la de 2B; no se debe asumir que las cifras y recomendaciones de muestreo de la variante de 1B se trasladen sin verificacion a esta.

## Limitaciones y advertencias

- Ausencia de licencia declarada: la model card no especifica licencia, lo que impide determinar si el uso comercial esta permitido. Es un riesgo bloqueante para cualquier despliegue en produccion.
- Procedencia del ajuste: se trata de un fine-tuning no oficial sobre la familia MiniCPM de OpenBMB, realizado por un tercero y redistribuido por otro autor distinto. Los terminos de la licencia del modelo base deben verificarse por separado.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fidelidad factual. Al ser un modelo de 2,52 mil millones de parametros y un ajuste por imitacion de trazas, la propension a inventar datos es alta en tareas de conocimiento especializado.
- Bloques de razonamiento: el modelo puede emitir contenido de razonamiento antes de la respuesta final. Las aplicaciones deben filtrarlo o gestionarlo explicitamente para no exponer texto interno al usuario final.
- Sesgos: no hay informacion sobre evaluaciones de sesgo. El sufijo "heretic" apunta a una posible modificacion del comportamiento de rechazo, lo que puede incrementar la probabilidad de respuestas inapropiadas o no alineadas con politicas de contenido. No se ha confirmado la tecnica aplicada.
- Idiomas: se desconoce la cobertura linguistica real. No hay garantia de un rendimiento solido en castellano.
- Contexto: no se ha publicado la longitud de contexto soportada, por lo que no se puede planificar su uso en tareas de contexto largo.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que permita validar la calidad de las cuantizaciones.
- Configuracion de muestreo: la recomendacion de temperature=0.9 y top_p=0.95 procede del ajuste de 1B y podria no ser optima para la variante de 2B; conviene recalibrarla.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/mradermacher/MiniCPM5-2B-Claude-Fable5-heretic-GGUF
- Pesos originales del ajuste: https://huggingface.co/saidutta69/MiniCPM5-2B-Claude-Fable5-heretic
- Articulo de MarkTechPost sobre el ajuste de 1B sobre trazas de Claude Fable 5: https://www.marktechpost.com/2026/07/19/someone-fine-tuned-openbmb-minicpm5-1b-on-claude-fable-5-traces-to-ship-a-657mb-local-thinking-model/
- Analisis de MindStudio sobre MiniCPM5-2B GGUF en local: https://www.mindstudio.ai/blog/minicpm5-2b-gguf-local-test
- Organizacion OpenBMB en HuggingFace (modelo base de la familia MiniCPM): https://huggingface.co/openbmb
