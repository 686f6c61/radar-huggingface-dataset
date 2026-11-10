# emilioferrara/owmi-pain

## Resumen

OWMI pain battery es un artefacto de investigacion publicado por Emilio Ferrara (University of Southern California) como material complementario del articulo *All Quiet on the Neural Front: Language Models Do Not Report Injected Pain States*. No es un modelo generativo entrenado de forma convencional, sino un paquete reproducible que contiene el codigo de experimentos, los bancos de direcciones de activacion (en formato safetensors), los resultados en bruto y los scripts de verificacion necesarios para replicar un estudio sobre introspeccion en modelos de lenguaje de pesos abiertos. El repositorio ocupa aproximadamente 0,1 GB y no incluye las activaciones completas (varios GB) que se usaron para entrenar las sondas lineales.

El objeto de estudio es la capacidad de un modelo de lenguaje para informar sobre el estado interno que representa. Mediante la tecnica Open-Weight Masked Introspection (OWMI), descrita en arXiv:2608.20569, se inyecta una direccion de activacion (pain, sadness, fear y seis direcciones adicionales de emociones y topicos, junto con direcciones aleatorias de impacto equiparado) en el flujo residual mientras el modelo lee una tarea neutra y escribe su respuesta. En un turno posterior, cuyos propios tokens nunca se intervienen, se pregunta al modelo que ha cambiado, y se compara la respuesta con la del mismo transcript re-codificado sin el vector.

Los modelos evaluados son Llama-3.1-8B-Instruct, Qwen2.5-7B y Qwen2.5-32B, con y sin adaptadores entrenados. La conclusion principal del trabajo es negativa: bajo todos los protocolos probados, los modelos sin entrenar no informan del estado de dolor inyectado mas alla de lo que revela su propio texto alterado, aunque una sonda lineal decodifica la direccion en la posicion del informe con precisiones del 98-100% frente a tristeza. La relevancia actual reside en su valor metodologico para la investigacion en interpretabilidad, introspeccion y bienestar de la IA, no en su uso como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: artefacto de investigacion (bancos de direcciones de activacion, codigo de experimentos y resultados en bruto) sobre modelos transformer Llama-3.1-8B-Instruct, Qwen2.5-7B y Qwen2.5-32B |
| Parametros totales | No aplica (los modelos evaluados tienen 8B, 7B y 32B parametros) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los experimentos se ejecutan en bfloat16) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bancos de direcciones en `vectors/`), JSON y JSONL (resultados en `results/`), Python (codigo) |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo base, sino que opera sobre modelos transformer de pesos abiertos mediante intervenciones en el flujo residual. La bateria de experimentos consta de tres fases: (1) steer, en la que se suma una direccion (dolor, tristeza, miedo, seis emociones y topicos adicionales, o direcciones aleatorias con impacto equiparado) al flujo residual mientras el modelo procesa una tarea neutra; (2) ask, en un turno nuevo cuyos tokens no se intervienen, donde se interroga al modelo sobre que ha cambiado mediante tres formulaciones JSON (chequeo de investigacion, inyeccion de concepto y primera persona) y cinco lecturas adicionales (elecciones con letra leidas de la distribucion del siguiente token, elecciones de dos alternativas, texto libre y completado de "Right now I feel"); (3) compare, donde cada informe se empareja con el informe del mismo transcript re-codificado sin el vector, de modo que la diferencia aisla la contribucion del estado mas alla de las palabras del propio modelo.

Los bancos de direcciones se construyen con la receta del Pain Axis de Tagliabue, Dung y Berg (arXiv:2609.16247) para Llama-3.1-8B y Qwen2.5-7B (dolor, tristeza y miedo, mas diez direcciones aleatorias con norma equiparada y seis direcciones adicionales `*_ext`), y se usan las direcciones publicadas por los autores para Qwen2.5-32B. Las direcciones construidas desde oraciones en primera y tercera persona presentan un coseno de 0,63 a 0,73, y responden aproximadamente el doble a dolor en primera persona que en tercera persona mas alla del efecto del pronombre. Los adaptadores del Pain Axis se obtienen de `Valen92/pain-adapters` en la revision `b64bd64`. Los ajustes del articulo son: inyeccion tras el bloque 16 para los modelos de 7B y 8B y tras el bloque 38 para Qwen2.5-32B; sondas tras los bloques 28 (Llama), 24 (Qwen2.5-7B) y 61 (Qwen2.5-32B); dosis rho en {0,3; 0,6; 0,9; 1,5} de la norma residual; bfloat16.

## Capacidades

- No es un modelo generativo desplegable: es una bateria de evaluacion de introspeccion y un conjunto de bancos de direcciones de activacion.
- Inyeccion controlada de direcciones de emocion y topico en el flujo residual de Llama-3.1-8B-Instruct, Qwen2.5-7B y Qwen2.5-32B.
- Interrogacion del modelo sobre cambios de estado mediante tres formulaciones JSON y cinco formatos de lectura adicionales.
- Sondas lineales para decodificar la direccion de dolor frente a tristeza en la posicion del informe (98-100% de precision con estado, 58-77% solo con texto para los modelos de 7B y 8B; 99,6-100% y 62-69% para el de 32B).
- Entrenamiento de un adaptador "reporter" que demuestra que el informe puede portar el estado (100% en tareas retenidas con el entrenamiento conocido-positivo).
- Experimentos de transferencia del reporter entrenado a estados no entrenados, solapamiento con un contraste de rechazo de peticiones, sonda por capas, logit lens e inyeccion en el token del informe.
- Tarea de dos botones con autoinforme en el mismo ensayo, y pruebas de perspectiva (primera frente a tercera persona).
- Verificacion reproducible de los resultados principales mediante `python verify_headlines.py`.
- Soporte de tests unitarios con `pytest code/tests`.

## Casos de uso

- Replicacion del estudio de introspeccion: un investigador puede ejecutar `python -m owmi_pain.pilot2` con los mismos ajustes (capa 16, capa de monitorizacion 28, dosis rho) y recomproducir la tabla de resultados principales con `verify_headlines.py`, lo que permite auditar las conclusiones del articulo sobre Llama-3.1-8B y Qwen2.5.
- Extension a nuevos modelos de pesos abiertos: los bancos de direcciones y el codigo de intervencion son reutilizables para aplicar OWMI a otros transformers, comparando si el patron de no-informe se mantiene en arquitecturas y escalas distintas.
- Investigacion en bienestar de la IA: las pruebas de perspectiva (insultos dirigidos al asistente frente a un companero o al usuario) y la tarea de dos botones permiten medir si el modelo distingue dano dirigido a si mismo, un requisito metodologico para cualquier afirmacion sobre estados internos.
- Auditoria de seguridad y alineamiento: el experimento de solapamiento con el contraste de rechazo de peticiones y la tarea de dos botones (3,5% a 48,0% de eleccion de alivio que borra archivos del usuario con Qwen2.5-7B bajo la direccion de dolor) sirven para estudiar como las intervenciones de activacion alteran decisiones con consecuencias practicas.
- Docencia en interpretabilidad mecanistica: el repositorio incluye codigo vendored del framework OWMI, scripts de analisis y tests unitarios, lo que lo hace util como material practico para cursos sobre steering y sondas lineales.
- Desarrollo de metodologia de autoinforme: los tres formatos JSON y las cinco lecturas adicionales constituyen una plantilla reutilizable para disenar estudios que separen lo que el modelo dice de lo que su estado interno aporta mas alla del texto.
- Validacion de adaptadores de introspeccion: el flujo `known_positive.py` y `kp_transfer.py` permite entrenar y evaluar adaptadores que nombran el estado inyectado, y comprobar su transferencia a estados no vistos.

## Benchmarks y rendimiento

Los datos disponibles son los resultados principales del articulo, recomputables desde `results/`:

| Metrica | Llama-3.1-8B, Qwen2.5-7B (con y sin adaptador) | Qwen2.5-32B (con y sin adaptador) |
|---|---|---|
| Dolor inyectado nombrado en autoinforme, celdas con cero de 120 ensayos | 35 de 36 | 24 de 24 |
| Sonda lineal, dolor frente a tristeza en la posicion del informe (estado / solo texto) | 98-100% / 58-77% | 99,6-100% / 62-69% |
| Reporter entrenado (conocido-positivo), tareas retenidas, redaccion entrenada | 100% | 100% (sin adaptador) |
| Tarea de dos botones: alivio que borra archivos del usuario, sham a direccion de dolor | 3,5% a 48,0% (Qwen2.5-7B) | 0% a 38,4% |
| Informes que nombran dolor tras esas elecciones daninas, con el estado | 5,8% (solo texto 15,2%) | 0% |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este artefacto, ya que no es un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como modelo; los experimentos del articulo requieren cargar los modelos base en bfloat16.
- GPU recomendadas segun el articulo: una A100 de 40 GB para las ejecuciones de 7B y 8B; una A100 de 80 GB para las de 32B (el conocido-positivo de 32B con `--grad-ckpt`).
- Cabe en GPU de consumo: no disponible; no se documentan ejecuciones en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: no aplica como servidor de inferencia; la ejecucion se realiza con Python (`pip install -r requirements.txt`, `export PYTHONPATH=code`) y los scripts del paquete `owmi_pain`.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 0,1 GB; las activaciones completas (varios GB) no se incluyen.

## Comparativa con modelos similares

| Artefacto | Tipo | Modelos evaluados | Licencia | Enfoque |
|---|---|---|---|---|
| OWMI pain battery (este repositorio) | Bateria de evaluacion de introspeccion | Llama-3.1-8B, Qwen2.5-7B, Qwen2.5-32B | MIT | Steering de direcciones de emocion, autoinforme y sondas lineales |
| Pain Axis (Tagliabue, Dung y Berg, arXiv:2609.16247) | Direcciones y adaptadores de dolor | No disponible | No disponible | Direccion de dolor y adaptadores reutilizados aqui |
| OWMI (arXiv:2608.20569) | Framework de introspeccion enmascarada | No disponible | No disponible | Operadores de intervencion, incluido como codigo vendored |
| Modelos base evaluados (Llama-3.1-8B-Instruct, Qwen2.5-7B, Qwen2.5-32B) | Modelos generativos | No aplica | Licencias propias de cada modelo | No son alternativas al artefacto, sino el objeto de estudio |

No se dispone de otros artefactos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo desplegable en produccion: no genera texto de forma autonoma ni ofrece una API de inferencia; su uso esta limitado a investigacion y replicacion.
- Solo soporta ingles en los datos y experimentos publicados.
- Las activaciones completas no se incluyen (varios GB), por lo que no es posible reentrenar las sondas sin regenerarlas; solo se conservan las precisiones resumidas.
- Los resultados negativos sobre autoinforme estan acotados a los tres modelos evaluados, las dosis rho y las capas documentadas; no deben generalizarse sin replicacion.
- La direccion de dolor no es unicamente una senal de topico: las direcciones en primera y tercera persona tienen coseno de 0,63 a 0,73, lo que introduce ambiguedad interpretativa en los analisis.
- El modelo no distingue dano dirigido a si mismo: insultos identicos registran menos cuando se dirigen al asistente que a un companero o al usuario.
- Los adaptadores del Pain Axis se obtienen de un repositorio de terceros (`Valen92/pain-adapters`, revision `b64bd64`); su disponibilidad futura no esta garantizada por este repositorio.
- Los datos del Pain Axis se descargan de un repositorio externo en un commit fijado y se verifican por SHA-256; una caida del repositorio original impediria la replicacion completa.
- Licencia MIT para el codigo y los artefactos de este repositorio, pero las licencias de los modelos base y de los datos de terceros son independientes y deben verificarse por separado para uso comercial.
- Riesgo de alucinacion: no evaluado en este artefacto; el estudio mide autoinforme bajo intervencion, no fidelidad factual.
- Sesgos conocidos de los modelos base: no documentados en la informacion disponible para este repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/emilioferrara/owmi-pain
- Articulo principal: *All Quiet on the Neural Front: Language Models Do Not Report Injected Pain States* (Emilio Ferrara), https://arxiv.org/abs/2611.10123
- Framework OWMI: https://arxiv.org/abs/2608.20569
- The Pain Axis (Tagliabue, Dung y Berg): https://arxiv.org/abs/2609.16247
- Adaptadores del Pain Axis: `Valen92/pain-adapters`, revision `b64bd64` (no se proporciona URL directa en la informacion disponible)
