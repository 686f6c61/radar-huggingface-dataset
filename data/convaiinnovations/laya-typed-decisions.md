# convaiinnovations/laya-typed-decisions

## Resumen

Laya (fine-tuned on typed-decisions) es un modelo publicado por Convai Innovations en Hugging Face, distribuido bajo licencia Apache 2.0 y con 421.293.830 parametros (aproximadamente 421 M) en formato safetensors. Se trata de un ajuste fino de "Laya" sobre el benchmark independiente LocalLLaMA/typed-decisions, orientado a la clasificacion de texto y a la toma de decisiones estructuradas y calibradas en flujos de agentes. El modelo resuelve un problema muy concreto: dado un estado de flujo de trabajo (workflow state) y un conjunto de preguntas tipadas, devolver respuestas en una sola pasada forward.

El modelo se ha entrenado con los 1.200 casos de entrenamiento del benchmark citado, lo que equivale a 6.000 decisiones. Sobre el conjunto de test oficial de 400 casos (2.000 decisiones repartidas entre Agent Trace Observability, Customer Service, Invoice Processing y Security Incidents), el autor declara una precision de 0,766, por encima de TypeSafe Jev 1.13.0 (0,727) y del techo de "Teacher Self-Agreement" del propio benchmark (0,735).

Su relevancia actual reside en el nicho de las decisiones calibradas dentro de sistemas de agentes: frente a modelos generativos generalistas, Laya apuesta por una salida estructurada y una puntuacion de confianza calibrada (Brier score de 0,066 declarado), con una latencia declarada de 158,3 ms en p50 y coste cero cuando se autoaloja. La model card no detalla la arquitectura base ni la longitud de contexto, por lo que estos datos figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de la libreria transformers; el autor no especifica la arquitectura base) |
| Parametros totales | 421.293.830 (aproximadamente 421 M) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos en safetensors |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,8 GB |
| Libreria | transformers |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 descargas / 1 like |
| Fecha de creacion | 2026-09-18 |
| Ultima actualizacion | 2026-09-18 |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna del modelo. Se sabe que es un modelo de la libreria transformers, con 421.293.830 parametros, y que el autor lo describe como un modelo capaz de "evaluar cualquier estado de flujo de trabajo y preguntas tipadas en una sola pasada forward". Es decir, se presenta como un modelo de decision y clasificacion estructurada, no como un generador de texto abierto. El autor tampoco detalla si la base es un encoder tipo BERT/ModernBERT ampliado u otra familia, ni el numero total de tokens de entrenamiento mas alla de los 1.200 casos (6.000 decisiones) del benchmark.

En cuanto al entrenamiento, el modelo se ha ajustado sobre el benchmark independiente LocalLLaMA/typed-decisions, que cubre cuatro dominios: Agent Trace Observability, Customer Service, Invoice Processing y Security Incidents. La model card menciona el termino "rlcd" entre las etiquetas, lo que sugiere el uso de RLCD (Reinforcement Learning from Contrastive Distillation) como tecnica de alineacion o calibracion, aunque no se aportan detalles del procedimiento. Tampoco se documentan la composicion exacta del dataset de ajuste, el numero de pasos de entrenamiento, hiperparametros ni si hubo fases de RLHF o DPO. El foco declarado esta en la calibracion de la confianza (de ahi el uso del Brier score y del ECE como metricas) y en la calidad de la decision estructurada.

## Capacidades

- Clasificacion de texto y toma de decisiones tipadas: devuelve respuestas estructuradas a preguntas definidas sobre un estado de flujo de trabajo dado.
- Decisiones calibradas: el autor reporta Brier score de 0,066 y ECE de 0,214, lo que indica que las probabilidades de salida estan razonablemente alineadas con la frecuencia real de acierto.
- Puntuacion de severidad o nivel con granularidad: "Within 1 Level" de 0,995 en el benchmark declarado, es decir, casi todas las predicciones caen como maximo a un nivel de distancia del valor correcto.
- Inferencia en una sola pasada forward: la API `agent.predict(state, questions)` resuelve todas las preguntas del estado en una unica ejecucion.
- Integracion con pipelines de agentes: el modelo esta disenado para observar trazas de agentes y emitir decisiones tipadas en ese contexto.
- Dominios cubiertos en el benchmark: observabilidad de trazas de agentes, atencion al cliente, procesamiento de facturas e incidentes de seguridad.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no disponible.
- Vision, audio o modo thinking explicito: no disponible.

## Casos de uso

- Observabilidad de trazas de agentes: el modelo puede evaluar el estado de una traza (herramientas invocadas, errores, secuencia de pasos) y emitir decisiones tipadas sobre si el comportamiento es correcto, anomalo o requiere intervencion, con una puntuacion de confianza calibrada que permite fijar umbrales de escalado.
- Clasificacion y triaje de tickets de atencion al cliente: dado un estado de conversacion o de caso, el modelo asigna categorias y niveles de severidad de forma consistente, con 0,995 de "Within 1 Level" declarado, lo que resulta util para enrutado automatico.
- Procesamiento de facturas: extraccion de decisiones tipadas sobre el estado de una factura (valida, requiere revision, discrepancia de importe) dentro de un pipeline de cuentas por pagar, con latencia p50 declarada de 158,3 ms por caso.
- Deteccion y clasificacion de incidentes de seguridad: el modelo evalua el estado de un incidente y emite una decision categorizada, aprovechando la calibracion para priorizar alertas y reducir falsos positivos escalados.
- Guardrails y validacion en produccion: al ser un modelo pequeno (421 M) con coste cero autoalojado, puede desplegarse como capa de validacion que decide si la salida de un agente generativo cumple los criterios tipados antes de llegar al usuario.
- Evaluacion automatizada de flujos de agentes en CI: integrar el modelo en un pipeline de integracion continua para puntuar de forma reproducible los estados de un agente y detectar regresiones entre versiones.
- Enrutado de decisiones con umbral de confianza: usar las probabilidades calibradas (Brier 0,066, ECE 0,214) para derivar automaticamente los casos dudosos a revision humana, en lugar de aplicar reglas heuristicas.
- Sustitucion de llamadas a APIs de clasificacion propietarias: el autor reporta coste 0,00 USD por caso en autoalojamiento frente a 0,0004 USD por caso de TypeSafe Jev 1.13.0 en API, lo que lo hace atractivo para volumenes altos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Tipo | Accuracy | Soft Acc | Brier Score | ECE | Score MAE | Within 1 Level | Latencia (p50) | Coste/Caso |
|---|---|---|---|---|---|---|---|---|---|
| Laya (fine-tuned) | fine-tuned | 0,766 | 0,509 | 0,066 | 0,214 | 0,242 | 0,995 | 158,3 ms | 0,00 USD (autoalojado) |
| TypeSafe Jev 1.13.0 | general | 0,727 | 0,580 | 0,148 | 0,144 | 0,391 | 0,952 | 710 ms | 0,0004 USD (API) |
| ModernBERT-base (149 M) | specialist | 0,646 | 0,542 | 0,119 | 0,179 | 0,444 | 0,931 | 349 ms | 0,00 USD |
| Teacher Self-Agreement | techo | 0,735 | - | - | - | - | - | - | - |

Metricas del model-index oficial:

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| text-classification (System One Decision Benchmark) | LocalLLaMA/typed-decisions | accuracy | 0,766 | no |
| text-classification (System One Decision Benchmark) | LocalLLaMA/typed-decisions | brier_score | 0,066 | no |

No se han publicado mas resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos en funcion del tamano declarado (421.293.830 parametros); son calculos derivados, no datos publicados por el autor:
  - fp32: aproximadamente 1,7 GB.
  - fp16 / bf16: aproximadamente 0,85 GB.
  - int8: aproximadamente 0,42 GB.
  - int4: aproximadamente 0,21 GB.
- A estas cifras hay que sumar el consumo de activaciones y del runtime de inferencia, que dependen de la longitud de contexto y del tamano de lote (no disponibles).
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, el modelo cabe con holgura en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o RTX 4090, e incluso en equipos con 4-8 GB de VRAM en cuantizacion de 8 o 4 bits. Tambien es viable en GPU de datacenter (A100, H100) para despliegues de alto throughput.
- Cabe en GPU de consumo: si, segun las estimaciones de VRAM anteriores.
- Opciones de despliegue: la model card solo documenta el uso mediante la libreria `laya` (`pip install laya`, `laya.load(...)`) sobre transformers. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, por lo que su compatibilidad con esos motores figura como no disponible.
- Latencia declarada: 158,3 ms en p50 por caso en el benchmark del autor (hardware no especificado).
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Accuracy (benchmark declarado) | Brier | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Laya (fine-tuned on typed-decisions) | 421 M | fine-tuned | no disponible | 0,766 | 0,066 | apache-2.0 | Hugging Face, autoalojado |
| TypeSafe Jev 1.13.0 | no disponible | general | no disponible | 0,727 | 0,148 | no disponible | API |
| ModernBERT-base | 149 M | specialist | no disponible | 0,646 | 0,119 | no disponible | publico |
| Teacher Self-Agreement (techo del benchmark) | no disponible | techo de referencia | no disponible | 0,735 | no disponible | no disponible | referencia del benchmark |

Laya lidera en accuracy bruta y en Brier score sobre las alternativas listadas en la propia model card, aunque TypeSafe Jev 1.13.0 obtiene mejor ECE (0,144 frente a 0,214) y mejor Soft Acc (0,580 frente a 0,509). ModernBERT-base, con 149 M de parametros, es la alternativa mas ligera, pero tambien la menos precisa en este benchmark concreto.

## Limitaciones y advertencias

- Los resultados de 0,766 de accuracy y 0,066 de Brier score estan declarados por el autor y no verificados de forma independiente; el campo `verified` del model-index es `false`.
- El modelo esta ajustado especificamente sobre el benchmark LocalLLaMA/typed-decisions y sus cuatro dominios; su generalizacion a otros dominios de decision no esta documentada.
- No se especifica la arquitectura base, la longitud de contexto, los idiomas soportados ni el procedimiento exacto de alineacion (solo la etiqueta "rlcd" como indicio).
- El ECE de 0,214 es notablemente peor que el de TypeSafe Jev 1.13.0 (0,144), lo que indica que la calibracion de las probabilidades no es perfecta pese al buen Brier score; conviene validar los umbrales de decision en el dominio propio antes de llevarlo a produccion.
- Riesgo de alucinacion: no evaluado en la informacion disponible. Al tratarse de un modelo de clasificacion y decision estructurada, el riesgo se traslada a decisiones mal clasificadas o mal calibradas, no a texto inventado.
- Licencia Apache 2.0: permite uso comercial y modificacion con las obligaciones habituales de atribucion y conservacion del aviso de licencia. No se declaran restricciones adicionales.
- El modelo cuenta con 0 descargas y 1 like en el momento de la consulta, lo que indica una adopcion practicamente nula y ausencia de validacion por parte de la comunidad.
- La fecha de creacion y actualizacion indicada (2026) resulta anomala; conviene verificarla directamente en Hugging Face.
- No se documentan sesgos conocidos, comportamiento en idiomas distintos del que se haya usado en el ajuste, ni limites de contexto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Dataset del benchmark: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Notebook de Kaggle para replicar los resultados: https://www.kaggle.com/code/nandukuttan/laya-typed-decisions-bm
- Organizacion del autor: https://huggingface.co/convaiinnovations
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a sitios de maquinaria de obra publica (MachineryZone, Agriaffaires, Truckscorner) sin relacion con el modelo.
