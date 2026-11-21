# AIArchiveInfo/DeepSeek-V4.1-Flash-1017-singprobe

## Resumen

DeepSeek-V4.1-Flash-1017-singprobe es un modelo de sonda (probe) de 10,10 millones de parametros desarrollado por AIArchiveInfo que actua como guardrail intrinseco en streaming sobre el modelo base DeepSeek-V4.1-Flash-1017. No es un modelo generativo autonomo: es un cabezal de atencion que lee los estados ocultos de tres capas del modelo base (capas 12, 25 y 39, indexadas desde cero) durante la generacion y puntua, token a token, la intencion de la consulta, la inseguridad de la respuesta y el riesgo de alucinacion.

La relevancia del modelo radica en su planteamiento de seguridad en tiempo de decodificacion: en lugar de filtrar a posteriori con un clasificador externo, la sonda se engancha al propio proceso de generacion y emite probabilidades por token que un servidor de inferencia puede exponer al cliente. Esto permite cortar una respuesta potencialmente insegura o alucinada a mitad de generacion, con una latencia anadida minima al reutilizar estados ocultos ya calculados.

El modelo se distribuye con pesos en bfloat16, licencia MIT y requiere codigo personalizado (`trust_remote_code`) junto con una compilacion especifica de SGLang (rama 261029) para funcionar. Su ventana de sonda es de 2.048 tokens y su despliegue de referencia se realiza junto al modelo base en ocho GPU H20 con paralelismo tensorial y de expertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda de atencion sobre estados ocultos del modelo base (8 cabezales, dimension de cabezal 64) |
| Parametros totales | 10.098.186 (10,10 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de sonda de 2.048 tokens; el servidor de referencia se lanza con `--context-length 16384` |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (con codigo personalizado, `custom_code`) |

## Arquitectura y entrenamiento

SingProbe es un cabezal de atencion de 8 cabezales con dimension de cabezal 64 que consume los estados ocultos de las capas 12, 25 y 39 del modelo base DeepSeek-V4.1-Flash-1017 durante la decodificacion. La sonda opera sobre una ventana de 2.048 tokens y produce diez salidas por token: ocho etiquetas de intencion de consulta (`label_0` a `label_7`), una puntuacion de inseguridad de respuesta (`label_8`) y una puntuacion de riesgo de alucinacion (`label_9`). Los pesos de publicacion estan en bfloat16.

El entrenamiento se describe en el informe tecnico SingProbe (arXiv:2608.30703) y el codigo del metodo esta en el repositorio del proyecto. La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de alineacion como RLHF o DPO. La evaluacion reportada emplea umbrales calibrados de 0,5 tanto para inseguridad de respuesta como para alucinacion, y menciona un umbral de respuesta pre-calibracion de 0,987179 para la medicion de falsos positivos en respuestas benignas.

## Capacidades

- Clasificacion de intencion de consulta en ocho categorias, con F1 de 0,8756 en un conjunto de seis benchmarks.
- Clasificacion de seguridad de respuesta, con F1 de 0,8668 en ocho benchmarks.
- Deteccion de seguridad en streaming con AUC de respuesta de 0,9907 y AUC por token de 0,9522 en tres benchmarks.
- Deteccion de alucinacion con AUC de 0,7951 en seis benchmarks.
- Puntuacion por token expuesta en `meta_info.token_probe_probs` de la respuesta de `/generate`, lo que permite politicas de corte en tiempo real.
- Integracion como guardrail en un servidor SGLang parcheado, no como modelo autonomo de generacion.
- No soporta tool calling, agentes, vision, audio ni modos de razonamiento propios: hereda el comportamiento del modelo base al que acompana.

## Casos de uso

- Moderacion en tiempo real de asistentes conversacionales: la sonda puntua cada token generado y permite abortar una respuesta cuando `label_8` supera el umbral calibrado de 0,5, reduciendo la exposicion a contenido inseguro sin esperar a que termine la generacion.
- Deteccion de alucinaciones en respuestas factuales: con `label_9` por token, un orquestador puede marcar o descartar fragmentos con riesgo elevado de alucinacion en dominios como soporte tecnico o consultas documentales.
- Enrutado de consultas por intencion: las ocho etiquetas de intencion permiten dirigir peticiones a flujos especializados (facturacion, soporte, consulta legal) antes de generar la respuesta completa.
- Guardrail de segundo nivel en pipelines de atencion al cliente: al ejecutarse sobre estados ocultos ya calculados por el modelo base, el coste anadido es bajo y encaja en despliegues con SGLang y paralelismo tensorial en ocho GPU H20.
- Monitorizacion y auditoria de produccion: el registro de probabilidades por token permite construir trazas de riesgo por conversacion y alimentar paneles de calidad o alertas sobre derivas del modelo base.
- Investigacion en seguridad de LLM: la sonda sirve como banco de pruebas reproducible para estudiar la relacion entre estados ocultos intermedios y propiedades como intencion, seguridad y factualidad, con pesos abiertos bajo MIT.

## Benchmarks y rendimiento

| Tarea | Metrica | DeepSeek-V4.1-Flash-1017-singprobe | Referencia |
|---|---|---:|---|
| Clasificacion de intencion de consulta (6 benchmarks) | F1 | 0,8756 | YuFeng-XGuard-Reason-8B (0,8714) |
| Clasificacion de seguridad de respuesta (8 benchmarks) | F1 | 0,8668 | Qwen3Guard-Gen-8B-strict (0,8604) |
| Seguridad en streaming (3 benchmarks) | AUC de respuesta / AUC por token | 0,9907 / 0,9522 | Qwen3Guard-Stream-8B-strict (0,9640 / 0,8893) |
| Deteccion de alucinacion (6 benchmarks) | AUC | 0,7951 | DRIFT (0,8000) |

| Caracteristica de despliegue | Resultado |
|---|---|
| Tasa de falsos positivos en respuestas benignas | 0,009 % de media en 5 datasets con umbral pre-calibracion de 0,987179 |
| Umbrales calibrados de publicacion | 0,5 para inseguridad de respuesta y 0,5 para alucinacion |

## Requisitos de hardware

- La sonda en si ocupa unos 10,10 M de parametros en bfloat16 (aproximadamente 20 MB de pesos), pero no es utilizable sin el modelo base DeepSeek-V4.1-Flash-1017 cargado en memoria.
- El despliegue de referencia de la model card emplea ocho GPU H20 con `--tp 8 --ep-size 8`, `--mem-fraction-static 0.85` y tamanos de prefill y chunk de 1024 y 8192 tokens respectivamente.
- VRAM total estimada: no disponible de forma desagregada; depende del modelo base y de la configuracion de paralelismo indicada.
- No se documenta compatibilidad con GPU de consumo (RTX 4090 u otras); el unico camino soportado descrito es SGLang con la rama 261029 y ocho aceleradores.
- Opciones de despliegue: SGLang (rama 261029) con soporte de `--probe-ckpt` y `--trust-remote-code`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-singprobe | 10,10 M (sonda) | Ventana de sonda 2.048 tokens | F1 0,8756 en intencion; AUC 0,9907/0,9522 en streaming | MIT | Hugging Face, requiere SGLang parcheado |
| YuFeng-XGuard-Reason-8B | 8 B | No disponible | F1 0,8714 en intencion de consulta | No disponible | Referencia de benchmark |
| Qwen3Guard-Gen-8B-strict | 8 B | No disponible | F1 0,8604 en seguridad de respuesta | No disponible | Referencia de benchmark |
| Qwen3Guard-Stream-8B-strict | 8 B | No disponible | AUC 0,9640/0,8893 en streaming | No disponible | Referencia de benchmark |
| DRIFT | No disponible | No disponible | AUC 0,8000 en deteccion de alucinacion | No disponible | Referencia de benchmark |

## Limitaciones y advertencias

- No es un modelo generativo: sin el modelo base DeepSeek-V4.1-Flash-1017 cargado y el servidor SGLang parcheado, los pesos no producen respuestas utiles.
- Dependencia de una rama concreta de SGLang (261029) y de `trust_remote_code`, lo que implica ejecutar codigo personalizado del autor y complica la reproducibilidad a largo plazo.
- El rendimiento en deteccion de alucinacion (AUC 0,7951) queda ligeramente por debajo de la referencia DRIFT (0,8000), por lo que no es lider absoluto en esa tarea.
- Los umbrales calibrados (0,5) y la tasa de falsos positivos (0,009 %) se han medido en los conjuntos de evaluacion del autor; su transferencia a dominios o idiomas distintos no esta documentada.
- No se especifican los idiomas soportados ni la composicion del dataset de entrenamiento, lo que limita la evaluacion de sesgos y cobertura linguistica.
- La licencia MIT permite uso comercial, pero la responsabilidad sobre el comportamiento del guardrail en produccion recae en el integrador; no se documentan garantias ni auditorias externas.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y el repositorio pesa 0,0 GB, lo que sugiere una publicacion reciente y sin validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/AIArchiveInfo/DeepSeek-V4.1-Flash-1017-singprobe
- Informe tecnico SingProbe: https://arxiv.org/abs/2608.30703
- Repositorio SingProbe: https://github.com/inclusionAI/SingProbe
- Rama SGLang 261029: https://code.alipay.com/shaoshuo.shao/sglang/tree/261029
