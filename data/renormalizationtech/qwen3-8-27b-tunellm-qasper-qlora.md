# RenormalizationTech/Qwen3.8-27B-tuneLLM-QASPER-QLoRA

## Resumen

Qwen3.8-27B-tuneLLM-QASPER-QLoRA es un adaptador QLoRA experimental publicado por RenormalizationTech sobre el modelo base RenormalizationTech/Qwen3.8-27B-tuneLLM-NF4, a su vez una conversion del checkpoint Qwen a un formato de solo texto con pesos cuantizados en NF4. El adaptador esta especializado en la tarea QASPER: generacion de respuestas y evidencia en formato JSON a partir de articulos cientificos, o alternativamente generacion de cuerpo-a-abstract asociada a PRL. No es un modelo completo ni un release oficial de Qwen, sino un paquete de pesos PEFT que debe cargarse junto al base.

El interes del paquete es metodologico mas que de capacidad: documenta con detalle inusual un protocolo de evaluacion con intervalos de confianza por bootstrap, gates de retencion y divulgacion de fallos de ejecucion (la fase original de 10000 segundos fallo tras 395 de 403 preguntas). El adaptador entrena sobre 482 preguntas QASPER y selecciona checkpoint con 101 preguntas de desarrollo, midiendo sobre 403 preguntas finales. La licencia es Apache-2.0 y el repositorio ocupa 0,5 GB, coherente con un adaptador y no con un modelo de 27B completo.

La relevancia practica es limitada: cero descargas, cero likes, sin idiomas declarados y con advertencias explicitas del autor de que las etiquetas de "gate passed" no implican mejora de capacidad general. Debe tratarse como material de investigacion reproducible, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del base Qwen); adaptador PEFT/QLoRA sobre base NF4 |
| Parametros totales | No disponible para el adaptador; el base se denomina "27B" en el identificador, sin confirmacion en la informacion |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Base en NF4; adaptador QLoRA (k-bit); sin otros formatos documentados |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); base en NF4 |
| Libreria | peft (con transformers, clase Qwen3_5ForCausalLM) |
| Tamano del repositorio | 0,5 GB |
| Modalidad | Solo texto (vision y MTP eliminados en el base) |
| Revision del base fijada | e7644d6f288cb8a9ba51856ca2c9fa68946f70fe |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only derivado de Qwen. El proceso documentado por el autor es: conversion del checkpoint upstream a un base de solo texto en NF4 mediante eliminacion de los componentes de vision y MTP y cuantizacion de los pesos de lenguaje, seguido del entrenamiento de un adaptador QLoRA especifico de tarea. La carga se realiza con `prepare_model_for_kbit_training` de PEFT, que convierte los parametros flotantes no cuantizados del base a FP32, tal como en los brazos medidos de base y adaptador. El entorno exacto esta fijado en `environment.lock.txt`.

El entrenamiento usa 482 preguntas QASPER, con 101 preguntas de desarrollo para seleccion de checkpoint y una evaluacion final sobre 403 preguntas (309 primarias y 267 primarias con evidencia estricta). Se evaluo una sola configuracion y semilla durante una epoca. La seleccion de prompt se hizo con un prefijo de desarrollo congelado y el baseline de prompt fue la mejor de tres plantillas fijas sobre 35 preguntas de desarrollo. El prefijo de prompt seleccionado tiene SHA256 `98d4f02210af9a47a5b7e5ae0bab7a30eee897e236e1ada70aba76d96f29e9ce`. No se documenta RLHF ni DPO. La generacion cientifica usa batch 1 y la de retencion batch 4, y el autor advierte explicitamente que ambas medidas no deben agruparse.

## Capacidades

- Generacion de respuestas extractivas y de evidencia en JSON para preguntas sobre articulos cientificos (formato QASPER answer/evidence).
- Generacion de cuerpo-a-abstract en el dominio asociado a PRL, segun la identificacion del paquete.
- Cumplimiento estricto de formato JSON: 0 respuestas JSON invalidas en modo estricto sobre las 403 preguntas, frente a 10 del brazo de prompt y 1 del base.
- Razonamiento aritmetico basico y respuesta a preguntas de opcion multiple, medido solo como retencion (no como capacidad objetivo).
- Seguimiento de instrucciones con formato estricto, medido como retencion (IFEval).
- Capacidades multilingues: no disponibles.
- Tool calling / function calling: no disponible; no se documenta.
- Soporte de agentes o razonamiento multi-paso: no disponible; no se documenta.
- Vision, audio o modo thinking: no disponibles; el base elimina explicitamente los componentes de vision.

## Casos de uso

- Extraccion de evidencia en revision sistematica: dado un paper y una pregunta, el adaptador devuelve respuesta y parrafos de evidencia en JSON, lo que permite alimentar un pipeline de cribado con salida estructurada y validable. Es adecuado por su tasa nula de JSON invalido en el protocolo medido, aunque solo sobre QASPER.
- Generacion de resumenes cuerpo-a-abstract: para articulos en el dominio PRL, el adaptador puede producir un abstract a partir del cuerpo, util en pre-revision editorial o en catalogacion interna de preprints.
- Prototipado de asistentes de lectura de literatura cientifica: integrado en una herramienta que responda preguntas sobre un corpus de papers, con la salvedad de que el autor advierte que parte del corpus publico puede haber estado en el pretraining.
- Investigacion sobre evaluacion de adaptadores: el paquete incluye `science_report.json`, `baseline_completion.json`, `baseline_completion_amendment.json` y `config_diff.json`, lo que lo hace util como caso de estudio de gates de retencion, intervalos bootstrap y divulgacion de fallos de ejecucion.
- Reproduccion de experimentos PEFT/QLoRA: el pin de revision del base, el lock de entorno y los hashes permiten reconstruir la carga exacta del adaptador en un entorno controlado.
- Filtrado de preguntas no respondibles: el autor reporta deteccion de casos gold-unanswerable (11/16 en adaptador, 12/16 en base), util solo como senal descriptiva en un cohorte pequeno, no como clasificador fiable.
- Banco de pruebas de cuantizacion NF4: sirve para estudiar discrepancias numericas entre cache y prefijo completo, un problema que el autor deja explicitamente sin resolver.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre QASPER (403 preguntas; F1 de respuesta):

| Brazo | Answer F1 estricto (primario) | Answer F1 laxo (primario) | JSON invalido estricto / 403 | JSON invalido laxo / 403 |
|---|---:|---:|---:|---:|
| base | 0,456660 | 0,456660 | 1 | 0 |
| prompt | 0,566795 | 0,583710 | 10 | 0 |
| adaptador | 0,690066 | 0,690066 | 0 | 0 |

Ganancias del adaptador con intervalo de confianza al 95% (bootstrap por paper):

| Comparacion | Ganancia estricta (IC 95%) | Ganancia laxa (IC 95%) |
|---|---|---|
| vs base | 0,233406 (0,188524; 0,280809) | 0,233406 (0,188524; 0,280809) |
| vs prompt | 0,123271 (0,083021; 0,165413) | 0,106356 (0,068216; 0,146589) |

Retencion (aciertos correctos, base frente a adaptador):

| Tarea de retencion | Base | Adaptador | Cambio neto |
|---|---:|---:|---:|
| general_mc | 110 | 109 | -1 |
| gsm8k | 114 | 119 | +5 |
| ifeval | 23 | 26 | +3 |

Los gates de retencion permiten como maximo cinco aciertos menos en GSM8K numerico y MMLU general, y tres menos en IFEval estricto. Deteccion de no respondibles: adaptador 11/16, base 12/16, cohorte descriptivo que no establece mejora. El autor advierte que las metricas de evidencia por paragraph-ID y el subconjunto primario de solo texto son personalizados y no constituyen el benchmark oficial completo ni un resultado de especializacion en fisica.

## Requisitos de hardware

- El adaptador pesa 0,5 GB, pero requiere cargar el base NF4 completo; la VRAM depende del base y de la preparacion k-bit de PEFT, que eleva parametros flotantes no cuantizados a FP32.
- VRAM estimada: no disponible en la informacion proporcionada; no se publican cifras de memoria ni de GPU utilizada.
- GPU recomendadas: no disponibles; el autor solo menciona "GPU0" en la divulgacion de ejecuciones.
- Compatibilidad con GPU de consumo: no disponible; no confirmada.
- Opciones de despliegue: carga via `transformers` + `peft` con `PeftModel` y `prepare_model_for_kbit_training`; no se documenta vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La fase original de evaluacion excedio los 10000 segundos en 395 de 403 preguntas, lo que sugiere generacion lenta en la configuracion usada, sin cifras por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-tuneLLM-QASPER-QLoRA | No disponible (base "27B") | No disponible | Adaptador QLoRA para QASPER | Apache-2.0 | HF, 0 descargas, 0 likes |
| RenormalizationTech/Qwen3.8-27B-tuneLLM-NF4 (base) | No disponible | No disponible | Base solo texto en NF4 | Apache-2.0 (heredada) | HF |
| Qwen upstream (checkpoint original) | No disponible en la informacion | No disponible | Modelo multimodal completo | No disponible en la informacion | HF |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que no se puede establecer una comparacion de rendimiento entre ellos.

## Limitaciones y advertencias

- Las etiquetas de "gate passed" no implican mejora de capacidad general; solo aplican a la tarea, prompts y subconjuntos registrados.
- El protocolo original de 10000 segundos fallo tras 395 de 403 preguntas; las ocho preguntas restantes se completaron en una fase separada de 900 segundos. No es una ejecucion original ininterrumpida.
- Se evaluo una sola configuracion y una sola semilla durante una epoca; no hay evidencia de robustez entre semillas.
- Parte de los papers publicos de QASPER puede haber estado en el pretraining, lo que puede inflar los resultados.
- Las metricas de evidencia por paragraph-ID y el subconjunto primario de solo texto son personalizados; no equivalen al benchmark oficial completo.
- Answer F1 mide solapamiento con la respuesta de referencia; las ganancias deben interpretarse bajo este protocolo y no como comprension cientifica general.
- Los casos de figuras y tablas quedan fuera del gate primario de solo texto; las puntuaciones de evidencia en ese subgrupo son descriptivas.
- El cohorte de deteccion de no respondibles es de 16 casos y no establece mejora (adaptador 11/16 frente a base 12/16).
- Persiste una discrepancia numerica no resuelta entre cache y prefijo completo en el smoke test NF4; coincidir en dos secuencias de tokens no demuestra equivalencia de cache.
- Batch 4 no es equivalente a batch 1 en tokens: 2 de 4 sondas de preflight inventadas difirieron. Las comparaciones de retencion exigen los mismos grupos batch 4 y padding; las medidas cientificas (batch 1) y de retencion (batch 4) no deben agruparse.
- Con 0 descargas y 0 likes, no hay validacion independiente de la comunidad.
- No se documentan sesgos conocidos, idiomas soportados ni restricciones adicionales de uso comercial mas alla de Apache-2.0; el aviso de modificacion indica que no es un release upstream de Qwen.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el modelo puede generar respuestas plausibles no respaldadas por el texto del paper, y el autor no reporta metrica de fidelidad mas alla del solapamiento F1.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RenormalizationTech/Qwen3.8-27B-tuneLLM-QASPER-QLoRA
- Modelo base (NF4): https://huggingface.co/RenormalizationTech/Qwen3.8-27B-tuneLLM-NF4/tree/e7644d6f288cb8a9ba51856ca2c9fa68946f70fe
- Dataset QASPER: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
