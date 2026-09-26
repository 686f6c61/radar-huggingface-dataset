# Rckflr/kev-gemma-270m-rule-classifier-es-v8-experimental

## Resumen

Kev–Gemma 3 270M v8 es un artefacto de investigación publicado por el usuario Rckflr que adapta el modelo `google/gemma-3-270m` mediante un adaptador LoRA para clasificar reglas en español. Dada una terna compuesta por una regla, los hechos de un caso y una solución propuesta, el sistema asigna una de tres etiquetas: `cumple`, `no_cumple` o `no_aplica`. La respuesta adicional `revisar` no es una cuarta clase aprendida, sino el resultado de una política externa de abstención implementada en `policy.json` que actúa cuando la probabilidad calibrada no supera un umbral por clase.

El repositorio no contiene los pesos del modelo base: solo incluye el adaptador LoRA (rango 16), el cabezal de decisión, el tokenizador y la política de abstención. No es un modelo conversacional ni genera texto token a token, por lo que `transformers.pipeline()` o `PeftModel` por sí solos no reproducen sus predicciones. La inferencia requiere un checkout compatible del runtime de Kev (`kev.checkpoint`, `kev.api`, `kev.border_inspector.BorderInspector`).

Su relevancia es metodológica más que de producto: documenta con precisión un experimento sobre generalización composicional y abstención selectiva, con panel de evaluación congelado, hashes SHA-256 y umbrales fijados antes de generar el panel final. El autor declara explícitamente que es un artefacto de investigación y que no debe usarse para decisiones sobre personas. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base `google/gemma-3-270m`) con adaptador LoRA de rango 16 y cabezal de decisión específico |
| Parametros totales | ~270 millones en el modelo base; numero de parametros entrenables del adaptador: no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende del modelo base `google/gemma-3-270m`) |
| Tipos de cuantizacion | no disponible; el entrenamiento se realizo en CPU con `fp32` y no se documentan formatos cuantizados publicados |
| Idiomas soportados | es (espanol) |
| Licencia | `other` con `license_name: gemma`; sujeto a las Gemma Terms of Use y a la Gemma Prohibited Use Policy |
| Formato de pesos | safetensors (adaptador LoRA); incluye tambien tokenizador, cabezal de decision y `policy.json`; no incluye los pesos del modelo base |

## Arquitectura y entrenamiento

El sistema se construye como una continuación de la versión v7 sobre el modelo base Gemma 3 270M, un transformer decoder-only de ~270 millones de parámetros. La adaptación se realiza con LoRA de rango 16, una única época, tasa de aprendizaje `1e-5` y ejecución en CPU con precisión `fp32`. Sobre el modelo se añade un cabezal de decisión que asigna probabilidades a opciones en lugar de generar tokens de forma autorregresiva, junto con un tokenizador y una política externa de abstención. No hay integración directa con el widget estándar de clasificación de Transformers.

El conjunto de entrenamiento consta de 2.560 casos sintéticos únicos más 400 de repetición, con cuatro preguntas por caso y un peso mayor para las etiquetas negativas de ámbito y disparador. Se completaron 2.960/2.960 registros y 370 pasos de optimizador, sin descartes ni truncamientos. La temperatura del cabezal (`1.5157165665103978`) y los umbrales por clase se ajustaron en particiones de desarrollo previamente observadas, antes de generar el panel final. Los umbrales congelados son `0.9216254588912728` para `cumple` y `0.9817178925818578` para `no_cumple`/`no_aplica`, aplicados al máximo de las probabilidades calibradas; si no se supera el umbral de la clase predicha, la salida operativa es `revisar`. La temperatura del cabezal debe coincidir con la de `policy.json`, y `BorderInspector` lo comprueba.

El benchmark asociado toma la forma de un juego ficticio inspirado en *Papers, Please* y no contiene procedimientos migratorios reales. La innovación destacable no es arquitectónica sino metodológica: separación entre clasificador y política de abstención, panel final reservado de 2.048 casos con ocho familias no puntuadas antes de congelar el modelo y la política (SHA-256 `ec53785eb99dd7d13842c2391f1afc52cef44eb4e68936262d5c6d5a4176dd97`), y evaluación de los 2.048 casos sin descartar ninguno.

## Capacidades

- Clasificación de ternas (regla, hechos, solución propuesta) en tres clases: `cumple`, `no_cumple`, `no_aplica`.
- Salida de abstención selectiva `revisar` mediante política externa basada en umbrales calibrados por clase.
- Asignación de probabilidades a opciones mediante cabezal de decisión, no generación autorregresiva de tokens.
- Manejo de cuatro preguntas por caso en el protocolo de entrenamiento, incluyendo etiquetas negativas de ámbito y disparador.
- Operación monolingüe en español.
- Ejecución local en CPU con latencia publicada de ~421 ms de mediana y ~508 ms de p95.
- No soporta tool calling, function calling, agentes, multi-step reasoning, visión ni audio; no es un modelo conversacional.

## Casos de uso

- Investigación reproducible sobre clasificación de reglas sintéticas: el artefacto permite replicar el experimento con panel congelado, protocolo y hashes documentados, siempre que se disponga del checkout compatible del runtime de Kev y de acceso aceptado al modelo base Gemma.
- Estudio de generalización composicional: las ocho familias del panel final no fueron puntuadas antes de congelar el modelo, de modo que sirven para medir comportamiento ante combinaciones no vistas durante el ajuste.
- Investigación sobre abstención selectiva y calibración de umbrales: la separación entre clasificador y `policy.json` permite estudiar el compromiso entre cobertura (43,99 % de casos aceptados) y precisión condicional (0 errores observados entre los 901 aceptados en este panel).
- Análisis de errores sistemáticos: el autor documenta que 157 casos `no_aplica` se predijeron como `cumple` y que en casos con disparador explícitamente ausente la exactitud bruta fue 228/512 (44,53 %), lo que constituye material directo para estudiar sesgos del cabezal.
- Comparación de versiones y ablaciones: las métricas de v4b (65,97 %), v6 (80,27 %), v7 (77,69 %) y v8 (83,40 %) sobre el mismo panel permiten analizar el efecto de cambios incrementales en los datos y la política.
- Docencia sobre evaluación de clasificadores: sirve como ejemplo didáctico de panel reservado, protocolo congelado, auditoría con hashes y distinción entre clase aprendida y política de rechazo.
- Prototipado de arquitecturas con abstención en pipelines de investigación: el modelo puede insertarse como componente de decisión en entornos controlados donde la salida `revisar` derive a un revisor humano, nunca en producción con efectos sobre derechos.

## Benchmarks y rendimiento

Panel final sintético reservado: 2.048 casos, ocho familias no puntuadas antes de congelar el modelo y la política. SHA-256 del panel: `ec53785eb99dd7d13842c2391f1afc52cef44eb4e68936262d5c6d5a4176dd97`. Se evaluaron los 2.048 casos sin descartar ninguno.

| Metrica en el panel final | v8 | v4b | v6 | v7 |
|---|---|---|---|---|
| Exactitud bruta de tres clases | 1.708/2.048 = 83,40 % | 65,97 % | 80,27 % | 77,69 % |
| Casos aceptados por la politica externa | 901/2.048 = 43,99 % | 489 casos | politica final no admitida | politica final no admitida |
| Errores observados entre aceptados | 0/901 | 22/489 | no disponible | no disponible |
| `cumple` verdaderos aceptados | 184/512 = 35,94 % | no disponible | no disponible | no disponible |

Desglose adicional de v8 en el mismo panel: 340 errores en bruto, de los cuales 157 corresponden a casos `no_aplica` predichos como `cumple`; en los casos cuyo disparador estaba explícitamente ausente, la exactitud bruta fue 228/512 (44,53 %). No se publican resultados de MMLU, HumanEval, GSM8K ni benchmarks estándar de propósito general, ya que el artefacto es un clasificador especializado y no un modelo generativo de uso general.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion aritmetica a partir de ~270 M de parametros, no confirmada por el autor): ~1,1 GB en `fp32`, ~0,54 GB en `fp16`/`bf16`, ~0,27 GB en `int8`, ~0,14 GB en `int4`, mas el overhead del runtime de Kev.
- El autor no especifica GPU recomendadas. Por tamano, el modelo cabe con holgura en cualquier GPU de consumo con 2 GB o mas de memoria, e incluso en iGPU.
- Ejecucion verificada en CPU: el autor publica ~421 ms de mediana y ~508 ms de p95 en una ejecucion local en CPU, sin garantia de produccion.
- Opciones de despliegue: requiere un checkout compatible del runtime de Kev (`kev.checkpoint`, `kev.api`, `kev.border_inspector.BorderInspector`) y acceso aceptado al modelo base Gemma. `transformers.pipeline()` y `PeftModel` por si solos no reproducen las predicciones ni el rechazo selectivo. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Para reproducir las metricas se necesitan las mismas instrucciones, el mismo runtime y los datos y protocolo congelados del experimento; la redaccion del ejemplo incluido ilustra la interfaz, no el protocolo exacto del benchmark.

## Comparativa con modelos similares

No se identifican en la informacion disponible modelos de terceros comparables en esta categoria (clasificadores de reglas sinteticas en espanol con abstención selectiva). La comparacion mas significativa es interna, entre versiones de la misma serie evaluadas sobre el mismo panel final.

| Modelo | Parametros | Exactitud bruta (panel v8) | Politica de abstención | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kev–Gemma 3 270M v8 | ~270 M + LoRA rango 16 | 83,40 % | Si, con umbrales congelados y 901/2.048 aceptados | Gemma Terms of Use | Publicado en HuggingFace |
| Kev v7 | ~270 M + LoRA | 77,69 % | Sin politica final admitida | Gemma Terms of Use | Version previa de la misma serie |
| Kev v6 | ~270 M + LoRA | 80,27 % | Sin politica final admitida | Gemma Terms of Use | Version previa de la misma serie |
| Kev v4b | ~270 M + LoRA | 65,97 % | Si, 489 aceptados y 22 errores | Gemma Terms of Use | Version previa de la misma serie |
| `google/gemma-3-270m` | ~270 M | no evaluado en este panel; modelo generativo, no clasificador | no aplica | Gemma Terms of Use | Modelo base publico |

## Limitaciones y advertencias

- Artefacto de investigación declarado por el autor. No debe usarse para controles fronterizos reales, asesoría jurídica, evaluación de personas ni decisiones automatizadas que afecten a derechos o bienestar.
- El benchmark es un juego ficticio inspirado en *Papers, Please*; no contiene procedimientos migratorios reales ni se ha validado con expedientes reales.
- No validado frente a variaciones abiertas del lenguaje, datos adversariales ni cambios de distribución.
- La política externa envió a `revisar` todos los errores observados en el panel, pero eso no garantiza cero errores futuros. Los ejemplos comparten plantillas y no constituyen evidencia de rendimiento en decisiones reales.
- Sesgo de clase documentado: 157 casos `no_aplica` fueron predichos como `cumple`, y en casos con disparador explícitamente ausente la exactitud bruta cae al 44,53 %.
- Cobertura limitada: la política solo acepta el 43,99 % de los casos y únicamente el 35,94 % de los `cumple` verdaderos.
- Riesgo de alucinación en el sentido de falsos positivos de cumplimiento, dado el patrón de predicción `no_aplica` → `cumple`.
- Restricciones de licencia: uso sujeto a las Gemma Terms of Use y a la Gemma Prohibited Use Policy; el campo `license` figura como `other` con `license_name: gemma`. Es responsabilidad del usuario revisar ambas antes de cualquier uso.
- Dependencia fuerte del entorno: sin el checkout compatible del runtime de Kev, los artefactos publicados no reproducen las predicciones ni la abstención. El parametro `temperature` del cabezal debe coincidir con el de `policy.json`.
- El repositorio no incluye los pesos del modelo base, por lo que es necesario obtenerlos por separado y aceptar sus terminos de acceso.
- La medicion de latencia (~421 ms mediana, ~508 ms p95) procede de una ejecucion local en CPU y no constituye una garantia de rendimiento en produccion.
- Con 0 descargas y 0 likes, no existe validacion externa ni reproducibilidad confirmada por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rckflr/kev-gemma-270m-rule-classifier-es-v8-experimental
- Modelo base: https://huggingface.co/google/gemma-3-270m
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Ejemplo de inferencia incluido en el repositorio: `example_inference.py`
- Politica de abstención: `policy.json`
- Informes y auditoria de evaluacion: `evaluation/report.json`, `evaluation/audit.json`, `evaluation/paired-v4b.json`, `evaluation/manifest.json`, `evaluation/protocol.json`
- Configuracion y metricas de entrenamiento: `training_config.json`, `training_metrics.json`
- Copia de terminos incluida en el repositorio: `GEMMA_TERMS.html` y `GEMMA_PROHIBITED_USE_POLICY` (nombre truncado en la model card consultada)
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales o demos asociados a este artefacto.
