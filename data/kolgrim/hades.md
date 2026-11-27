# Kolgrim/hades

## Resumen

HADES es un proyecto de investigacion independiente, mantenido por Selby Mashiki (usuario Kolgrim en Hugging Face), cuyo objetivo es construir un modelo de lenguaje especializado en ciberseguridad desde cero: tokenizador propio, arquitectura Transformer propia, corpus de entrenamiento propio y pesos entrenados desde inicializacion aleatoria. No se trata de un ajuste fino sobre un modelo preentrenado existente, sino de un desarrollo completo del pipeline de entrenamiento. El repositorio se publica bajo licencia Apache 2.0 y esta etiquetado para tareas de analisis de logs y seguridad defensiva en ingles.

En el momento de la publicacion, el repositorio no contiene pesos entrenados. El unico modelo entrenado hasta la fecha es una prueba de humo (smoke test) de 7,4 millones de parametros que genera texto mayoritariamente incoherente. Lo que si esta incluido es la infraestructura: tokenizador, herramientas de datos, arquitectura, bucle de entrenamiento, suites de evaluacion y un analizador de logs determinista que no requiere modelo alguno (`python -m hades.analyze FILE`). El corpus de entrenamiento se aloja en un repositorio de dataset separado.

La relevancia actual del proyecto es, por tanto, metodologica mas que de rendimiento: propone un enfoque de seguridad defensiva con separacion explicita entre evidencia observada e inferencia, comunicacion de incertidumbre y rechazo a fabricar eventos. El objetivo declarado a largo plazo es ofrecer el modelo como servicio y como distribucion local en formato GGUF para entornos con conectividad o recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer propio (desde cero, sin pesos preentrenados) |
| Parametros totales | 7,4 M (unico modelo entrenado, smoke test); modelos mayores no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se menciona una futura distribucion GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (no hay pesos entrenados en el repositorio) |

## Arquitectura y entrenamiento

La arquitectura es un Transformer disenado desde cero, con tokenizador propio entrenado de forma independiente y un corpus de datos propio. El repositorio documenta el pipeline completo: recoleccion y preprocesado del corpus (`data/`), entrenamiento del tokenizador (`tokenizer/`), definicion del modelo (`model/`), bucle de entrenamiento con checkpointing (`train/`), suites de evaluacion especificas de ciberseguridad (`eval/`) y configuraciones de modelo y entrenamiento (`configs/`). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

El unico resultado de entrenamiento publicado es un smoke test de 7,4 M de parametros, cuyo proposito es validar que la arquitectura y el pipeline funcionan de extremo a extremo, no producir un modelo util. El proyecto declara que escalara el numero de parametros a medida que lo permitan los datos y los recursos computacionales. Como componente adicional, el repositorio incluye un analizador de logs determinista y basado en evidencia que no depende de ningun modelo: emite informes por ventana con hechos observados citando numeros de linea, inferencia con matices, lo que el log no puede establecer, acciones defensivas y un veredicto (o `insufficient_evidence`).

## Capacidades

- El modelo entrenado actual (7,4 M de parametros) no presenta capacidades funcionales: genera texto mayoritariamente incoherente segun la propia model card.
- Capacidades objetivo declaradas del proyecto: interpretacion de logs de sistema Linux y de autenticacion, explicacion de vulnerabilidades, identificacion de actividad sospechosa, reconstruccion de incidentes a partir de evidencia disponible y recomendacion de medidas defensivas.
- Separacion explicita entre evidencia observada e inferencia, con comunicacion de incertidumbre y sin fabricacion de eventos o hallazgos tecnicos.
- Analizador de logs determinista sin modelo, invocable por CLI, que produce informes con citas de lineas y veredictos.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio o modo thinking: no disponible (no implementado ni documentado).
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Analisis de logs de autenticacion en Linux: el analizador determinista incluido (`python -m hades.analyze /var/log/auth.log`) genera informes por ventana con hechos citados por numero de linea y acciones defensivas, util para triaje inicial sin depender de un modelo entrenado.
- Investigacion reproducible de arquitecturas desde cero: el repositorio sirve como referencia completa de pipeline (tokenizador, datos, arquitectura, entrenamiento, evaluacion) para quienes quieran replicar o auditar el proceso.
- Formacion y docencia en seguridad defensiva: el enfoque de evidencia primero y la distincion entre observado e inferido son material didactico para ensenar analisis forense riguroso.
- Base para desarrollo de modelos especializados en ciberseguridad: equipos con corpus propios de logs pueden reutilizar la estructura del repositorio y las suites de evaluacion para entrenar variantes de mayor tamano.
- Despliegue en entornos aislados: la hoja de ruta contempla una distribucion GGUF para ejecucion local en entornos con conectividad o computo limitados, aunque dicha distribucion aun no existe.
- Auditoria de metodologia en IA de seguridad: el registro de experimentos y la procedencia de datos en `docs/` permiten evaluar criticamente las decisiones de diseno antes de adoptar el proyecto en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no existen pesos entrenados mas alla del smoke test de 7,4 M de parametros, que cabria en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no disponible para modelos objetivo; el smoke test no requiere GPU dedicada.
- Compatibilidad con GPU consumer: el unico checkpoint existente (7,4 M de parametros) es trivial de ejecutar en cualquier hardware; los modelos futuros no tienen requisitos publicados.
- Opciones de despliegue: el proyecto menciona una futura distribucion GGUF (compatible con llama.cpp y derivados como Ollama), pero no esta disponible. No se documentan integraciones con vLLM ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| HADES (Kolgrim) | 7,4 M (smoke test) | No disponible | Ciberseguridad, entrenamiento desde cero | Apache 2.0 | No (sin pesos utiles) |
| Alternativas de ciberseguridad ajustadas sobre base preentrenada | No disponible | No disponible | Fine-tuning sobre modelos existentes | Variable | Si |
| Modelos base pequenos (menos de 100 M) | Variable | Variable | Proposito general | Variable | Si |

No se dispone de informacion sobre modelos comparables especificos del mismo autor o categoria en la documentacion proporcionada; la comparativa con alternativas concretas queda como no disponible.

## Limitaciones y advertencias

- No existen pesos entrenados utilizables: el unico checkpoint es un smoke test de 7,4 M de parametros que produce texto incoherente. No debe emplearse en produccion bajo ninguna circunstancia.
- Proyecto en fase de investigacion temprana: la propia model card lo declara como esfuerzo en curso y no como modelo capacitado o listo para produccion.
- Riesgo de alucinacion: aunque el diseno busca evitarla mediante separacion de evidencia e inferencia, no hay evaluacion publicada que lo demuestre en un modelo entrenado.
- Cobertura linguistica limitada al ingles.
- Sesgos conocidos: no documentados; al no haber corpus publico detallado ni evaluaciones, no es posible evaluar sesgos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el estado del proyecto hace inviable cualquier uso productivo real.
- Dependencia de un unico mantenedor y de recursos computacionales no especificados para escalar el modelo.
- El analizador de logs determinista, aunque funcional, es una herramienta basada en reglas y no un modelo de lenguaje; sus veredictos deben validarse manualmente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Kolgrim/hades
- Perfil del autor en Hugging Face: https://huggingface.co/Kolgrim
- Documentacion de diseno del analizador (referenciada en la model card): `docs/design-evidence-first.md` dentro del repositorio
- Repositorio del corpus de entrenamiento: referenciado como repositorio de dataset separado, sin URL publicada en la informacion disponible
- Paper, blog o demo: no disponible
