# 7ViksSai/piston-v0.1

## Resumen

Piston v0.1 es un modelo pequeno de inferencia causal para series temporales desarrollado por OlynkAI (Olynk.AI LLP). Su proposito es responder preguntas contrafactuales del tipo "que pasa con una variable objetivo si intervenimos sobre un tratamiento en un paso t y medimos el efecto k pasos despues", proporcionando no solo una estimacion puntual, sino un intervalo del 90%, una probabilidad de que la pregunta sea respondible con los datos disponibles (`p_answerable`) y una medida de alcanzabilidad del tratamiento sobre la variable objetivo.

El modelo se presenta como una alternativa a los metodos clasicos de estimacion causal (OLS, double machine learning) y a los modelos fundacionales de series temporales (TimesFM 3, Chronos-2, CCPFN) cuando no se dispone de un grafo causal explicito. La innovacion principal es su capacidad de abstenerse: rechaza responder cuando `p_answerable < 0.5`, mientras que los baselines contestan el 100% de las preguntas, incluyendo aproximadamente el 32% que no son identificables a partir del panel.

Tecnicamente es un ensemble de 3 semillas de un transformer axial de aproximadamente 4M de parametros por miembro (12M en total), entrenado exclusivamente sobre mundos sinteticos. Se distribuye bajo licencia Apache-2.0 y esta pensado como release de investigacion, con un paquete de reproduccion en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer axial (axial transformer), ensemble de 3 semillas |
| Parametros totales | ~12M (3 miembros de ~4M cada uno) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 pasos temporales (ultimos 256), hasta 9 variables |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numerico, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (PyTorch), tres ficheros `seed0.pt`, `seed1.pt`, `seed2.pt` |

## Arquitectura y entrenamiento

El modelo emplea un transformer axial que codifica paneles de hasta 9 variables y los ultimos 256 pasos temporales, tratando de forma separada las dimensiones temporal y de variables. Sobre esa representacion predice cuantiles del efecto causal (5, 50 y 95) para retardos de 1 a 3 pasos, junto con `p_answerable` y una probabilidad de alcanzabilidad del tratamiento sobre la variable objetivo. La inferencia es in-context: no requiere ajuste por dataset, sino que lee el panel directamente en el contexto del modelo.

El entrenamiento se realizo unicamente sobre mundos sinteticos, lo que permite generar efectos verdaderos exactos mediante simulacion con numeros aleatorios comunes (common-random-number simulation) y etiquetas exactas de si una pregunta es respondible. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. La innovacion destacable es el mecanismo de selective prediction: el modelo puede rechazar preguntas no identificables, algo que los baselines comparados no hacen.

## Capacidades

- Estimacion de efectos causales contrafactuales en series temporales con retardos de 1, 2 y 3 pasos.
- Prediccion por cuantiles (5, 50, 95) con intervalo del 90% para cada efecto.
- Calculo de `p_answerable`: probabilidad de que la pregunta sea respondible a partir del panel.
- Calculo de alcanzabilidad: probabilidad de que el tratamiento llegue a la variable objetivo en el retardo consultado.
- Abtencion selectiva: rechaza responder cuando `p_answerable < 0.5`.
- Inferencia in-context sin ajuste por dataset.
- Aceptacion opcional de conocimiento de grafo causal (completo o parcial) mediante matrices `edges` y `hidden`.
- Soporte de paneles de hasta 9 variables y 256 pasos temporales.
- No dispone de capacidades linguisticas, de codigo, vision, audio ni tool calling: es un modelo numerico de regresion tabular.

## Casos de uso

- Analisis de impacto de intervenciones en series temporales: dado un panel historico de hasta 9 variables, estimar cuanto cambia una metrica objetivo si se modifica una variable de tratamiento en un paso concreto y se mide el efecto 1-3 pasos despues.
- Filtrado de preguntas no identificables en pipelines de analitica causal: usar `p_answerable` para descartar automaticamente consultas que los datos no permiten responder, evitando conclusiones espurias en informes automatizados.
- Estimador dentro de un algoritmo de identificacion exacta: cuando se conoce el grafo causal completo, Piston puede actuar como estimador de los efectos, combinacion que obtiene el mejor T1 del benchmark (0.112).
- Analisis con grafo causal parcial: acepta matrices de adyacencia con entradas desconocidas, lo que permite incorporar conocimiento de dominio incompleto en entornos donde no se dispone del grafo completo.
- Evaluacion rapida de escenarios what-if en investigacion: al no requerir ajuste por dataset, permite lanzar consultas contrafactuales sobre nuevos paneles sin reentrenar.
- Prototipado de sistemas de decision con cuantificacion de incertidumbre: los intervalos del 90% y la probabilidad de alcanzabilidad permiten construir reglas de negocio conservadoras.
- Benchmarking de metodos causales: el paquete incluye `piston.metrics.report` para puntuar metodos propios con el mismo protocolo (T1, confident-wrong).

## Benchmarks y rendimiento

Benchmark congelado de 4.592 preguntas en 998 mundos sinteticos de 23 familias no vistas en entrenamiento. T1 es el area bajo la curva riesgo-cobertura (menor es mejor); confident-wrong es la proporcion de respuestas dadas que son erroneas.

Sin grafo causal:

| Metodo | T1 | T1 95% | Confident-wrong | Respuestas | Cobertura 90% |
|---|---|---|---|---|---|
| OLS sobre todo el historico | 0.412 | 0.387-0.439 | 42.4% | 100% | 88% |
| Double ML con random forests | 0.404 | 0.378-0.430 | 41.3% | 100% | 89% |
| TimesFM 3 (Google) | 0.399 | 0.375-0.424 | 42.6% | 100% | 91% |
| Chronos-2 (Amazon 2025) | 0.402 | 0.377-0.425 | 44.6% | 100% | 90% |
| CCPFN (Layer6 2026) | 0.387 | 0.363-0.412 | 40.0% | 100% | 90% |
| Piston v0.1 | 0.280 | 0.258-0.304 | 35.0% | 90% | 94% |

Con grafo causal conocido:

| Metodo | T1 | T1 95% | Confident-wrong | Respuestas |
|---|---|---|---|---|
| Identificacion exacta + OLS | 0.195 | 0.177-0.212 | 14.6% | 67% |
| Identificacion exacta + DML | 0.185 | 0.168-0.202 | 13.1% | 67% |
| Identificacion exacta + TimesFM 3 | 0.209 | 0.192-0.225 | 15.0% | 67% |
| Identificacion exacta + Chronos-2 | 0.204 | 0.188-0.219 | 18.0% | 67% |
| Identificacion exacta + CCPFN | 0.178 | 0.162-0.194 | 11.0% | 67% |
| Piston con grafo como entrada | 0.195 | 0.177-0.214 | 19.1% | 61% |
| Identificacion exacta + Piston | 0.112 | 0.101-0.124 | 7.1% | 67% |

Con grafo parcial (cada par revelado con probabilidad 0.2-0.8): T1 0.213 (0.194-0.234), confident-wrong 25.8% con 70% de respuestas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con ~12M de parametros en total, los pesos en fp32 ocupan del orden de decenas de MB. No se publican cifras oficiales de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en CPU y en GPUs de gama baja.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con memoria suficiente para PyTorch.
- Opciones de despliegue: inferencia directa con PyTorch mediante la API `Piston.from_pretrained` del paquete incluido; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | T1 (sin grafo) | Licencia |
|---|---|---|---|---|---|
| Piston v0.1 | Transformer axial causal | ~12M (ensemble) | 256 pasos, 9 variables | 0.280 | Apache-2.0 |
| TimesFM 3 (Google) | Modelo fundacional de series temporales | no disponible | no disponible | 0.399 | no disponible |
| Chronos-2 (Amazon) | Modelo fundacional de series temporales | no disponible | no disponible | 0.402 | no disponible |
| CCPFN (Layer6) | Modelo fundacional causal | no disponible | no disponible | 0.387 | no disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente sobre datos sinteticos; el rendimiento en datos reales no esta validado en la informacion disponible.
- Limitado a paneles de hasta 9 variables y 256 pasos temporales; no escala a paneles de alta dimensionalidad.
- Solo estima efectos para retardos de 1 a 3 pasos.
- El umbral de abtencion (`p_answerable < 0.5`) es fijo en el ejemplo de uso; puede requerir calibracion por caso.
- El benchmark se realizo sobre mundos sinteticos; los intervalos de confianza y las metricas pueden no transferirse a dominios reales.
- Release de investigacion (v0.1) con 0 descargas y 0 likes en Hugging Face en el momento de la consulta; madurez y soporte limitados.
- Licencia Apache-2.0 permite uso comercial, pero no se documentan garantias ni soporte.
- No se dispone de informacion sobre sesgos, ya que el modelo no procesa texto ni datos sociales.
- Riesgo de alucinacion no aplica en el sentido linguistico, pero si existe riesgo de estimaciones erroneas en regimenes fuera de distribucion.

## Enlaces

- Hugging Face: https://huggingface.co/7ViksSai/piston-v0.1
- Organizacion en Hugging Face: https://huggingface.co/OlynkAI
- Repositorio de reproduccion: https://github.com/OlynkAI/piston
