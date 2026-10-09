# allnamestaken177/grimoire-volatility-laya

## Resumen

grimoire-volatility-laya es un ajuste fino de Laya de Convai, un encoder ModernBERT-large de 421 millones de parametros, publicado por el usuario allnamestaken177. El modelo no genera texto: actua como clasificador que responde dos preguntas sobre un hecho almacenado en la memoria de un agente de IA. La primera, `changes`, determina si el hecho describe un estado que puede quedar obsoleto (si/no) frente a decisiones, reglas, eventos historicos o hallazgos. La segunda, `speed`, estima la velocidad de cambio del hecho en horas, dias, semanas, meses o anos.

El modelo resuelve un problema concreto dentro del proyecto Grimoire: decidir cuando una llamada a memoria debe indicar al agente que vuelva a comprobar un hecho. Se le consulta una sola vez, en el momento en que el hecho se escribe, y las respuestas alimentan la politica de frescura descrita en `docs/FRESHNESS.md`. Resulta relevante porque aborda el envejecimiento de la memoria de agentes con un clasificador pequeno y ejecutable en CPU, en lugar de recurrir a un LLM grande en cada escritura.

Se entreno sobre 899 hechos sinteticos y se evaluo con 90 hechos etiquetados a mano procedentes de un almacen de memoria real. Alcanza un AUC de 0,92, frente al 0,90 de Jev y el 0,50-0,55 del Laya original en zero-shot. La licencia es Apache 2.0 y los pesos se distribuyen en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional (ModernBERT-large) |
| Parametros totales | 421.293.830 (~421M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el ajuste se entreno con max-len 256 |
| Tipos de cuantizacion | no disponible (pesos originales en safetensors; sin variantes cuantizadas oficiales) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `convaiinnovations/laya`, un ModernBERT-large, es decir, un encoder transformer bidireccional de 421 millones de parametros. ModernBERT introduce mejoras respecto al BERT clasico, como attention alternada local y global, embeddings posicionales rotatorios, activacion GeGLU y eliminacion de sesgos, lo que le permite procesar secuencias largas de forma eficiente. Sobre esta base, el ajuste convierte el encoder en un cabezal de clasificacion para dos tareas: una binaria (`changes`) y otra categorica ordinal de cinco niveles (`speed`: hours, days, weeks, months, years).

El entrenamiento uso 899 hechos sinteticos escritos por un LLM pequeno, disenados para cubrir estado vivo, estado de tareas, ubicaciones, configuracion, decisiones, reglas y hallazgos. Las dos preguntas se etiquetaron como probabilidades suaves mediante Jev, de TypeSafe. No se incluyo memoria real de usuarios. El comando de entrenamiento fue `laya-train --loss soft-ce --shuffle-options --epochs 6 --max-len 256`, ejecutado en CPU. La perdida es cross-entropy suave (_soft-ce_) y la opcion `shuffle-options` baraja el orden de las opciones durante el entrenamiento. La calibracion de Platt publicada en la model card es 2,147 y 0,359.

## Capacidades

- Clasificacion binaria: responde `changes` (si/no) indicando si un hecho describe estado que puede quedar obsoleto.
- Clasificacion categorica ordinal: responde `speed` en cinco niveles (horas, dias, semanas, meses, anos).
- Salida probabilistica: devuelve probabilidades suaves, no etiquetas duras, lo que permite umbralizacion y calibracion externa.
- Integracion con Grimoire: pensado para consultarse una vez en la escritura de un hecho y alimentar la politica de frescura.
- Idiomas: unicamente ingles.
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso, agentes autonomos, vision ni audio. Es un clasificador de proposito especifico.

## Casos de uso

- Politica de frescura en memoria de agentes: al escribir un hecho, Grimoire llama al modelo una vez y usa `changes` y `speed` para fijar cuando el agente debe re-comprobar ese hecho. Adecuado por su bajo coste de inferencia en CPU frente a un LLM generativo.
- Re-verificacion programada: el nivel de `speed` se traduce en un intervalo de re-chequeo (por ejemplo, horas para estado vivo, meses para configuracion estable), lo que permite agendar tareas de validacion sin intervencion manual.
- Expurgo o marcado de hechos obsoletos: los hechos clasificados como cambiantes y rapidos pueden marcarse como caducados o invalidarse antes de que contaminen el contexto del agente.
- Enrutamiento de contexto: los hechos estables (reglas, decisiones, hallazgos) pueden incluirse en el contexto del agente sin coste de re-verificacion, mientras que los volatiles se consultan bajo demanda.
- Monitorizacion de configuracion de infraestructura: hechos con forma de codigo o de operaciones (por ejemplo, versiones desplegadas o parametros de un servicio) se clasifican como estado vivo y se marcan para re-chequeo frecuente.
- Etiquetado asistido de datasets de memoria: el modelo puede pre-anotar grandes volumenes de hechos con `changes` y `speed` para revision posterior por parte de anotadores humanos.
- Investigacion sobre calibracion: al exponer probabilidades suaves, sirve como banco de pruebas para estudiar escalado y recalibracion en clasificadores pequenos de memoria.

## Benchmarks y rendimiento

Evaluacion sobre 90 hechos etiquetados a mano procedentes de un almacen de memoria real de un agente (25 describen estado cambiante). Ninguno aparece en los datos de entrenamiento.

| Predictor | AUC | Speed correcto (de 25) |
|---|---|---|
| Laya original, zero-shot | 0,50-0,55 | — |
| Jev | 0,90 | 14 |
| Este checkpoint | 0,92 | 15 |

El propio autor senala que, sobre 90 hechos, el resultado es un empate tecnico con Jev y no una victoria: el intervalo bootstrap del 95 % para la diferencia de AUC es [-0,06, +0,11]. La calibracion de Platt se ajusto sobre esos mismos 90 hechos.

## Requisitos de hardware

- VRAM estimada en FP32: ~1,7 GB para los 421M de parametros (tamano del repo, 0,8 GB, coherente con pesos en formato reducido).
- VRAM estimada en FP16/BF16: ~0,84 GB.
- VRAM estimada en INT8: ~0,42 GB; en INT4: ~0,21 GB (cuantizaciones no documentadas oficialmente).
- Cabe con holgura en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y tambien en CPU; el entrenamiento del ajuste se realizo directamente en CPU.
- Despliegue mediante `laya-serve` (`pip install laya`), configurando `LAYA_EXTRA_MODELS` y `LAYA_DEFAULT_MODEL`, y exponiendo un endpoint HTTP que Grimoire consume via `GRIMOIRE_DECISION_URL`.
- No es un modelo generativo, por lo que vLLM, llama.cpp, Ollama o TGI no son las vias de despliegue previstas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | AUC (mismos 90 hechos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grimoire-volatility-laya | 421M | Clasificacion changes + speed | 0,92 | apache-2.0 | HuggingFace |
| Laya (stock, zero-shot) | 421M | Encoder generalista | 0,50-0,55 | no disponible en esta ficha | HuggingFace (convaiinnovations/laya) |
| Jev (TypeSafe) | no disponible | Etiquetado de volatilidad | 0,90 | no disponible | no disponible |

No se dispone de otros clasificadores publicos directamente comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgo de dominio: el modelo captura el estilo de memoria de una sola persona, con hechos con forma de codigo y operaciones.
- Idioma: unicamente ingles; no se ha validado en castellano ni en otros idiomas.
- Probabilidades mal calibradas de serie: los valores tienden a ser altos antes de aplicar la calibracion de Platt; es necesario calibrar con hechos propios.
- Riesgo de sobreajuste de la calibracion: la calibracion publicada (2,147, 0,359) se ajusto sobre los mismos 90 hechos usados en la evaluacion; conviene re-ajustarla con datos etiquetados propios.
- Rendimiento empatado con Jev: el AUC de 0,92 no supera de forma estadisticamente significativa al 0,90 de Jev (intervalo [-0,06, +0,11]).
- Entrenamiento con 899 hechos sinteticos y sin memoria real de usuario: la transferencia a datos reales depende del parecido con ese dominio.
- No es un generador: no puede alucinar texto, pero si clasificar incorrectamente un hecho, con el consiguiente error en la politica de frescura.
- Dependencia de la libreria `laya` y de la integracion con Grimoire para su uso previsto.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con atribucion y conservacion del aviso de licencia.
- En produccion, conviene combinar la salida con umbrales y con una capa de recalibracion, y monitorizar la deriva del modelo sobre memoria real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/allnamestaken177/grimoire-volatility-laya
- Modelo base (Convai Laya): https://huggingface.co/convaiinnovations/laya
- Repositorio Grimoire: https://github.com/JeremiahM37/grimoire
- Documentacion de frescura de Grimoire: https://github.com/JeremiahM37/grimoire/blob/main/docs/FRESHNESS.md
