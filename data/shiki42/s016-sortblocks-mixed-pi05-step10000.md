# Shiki42/s016-sortblocks-mixed-pi05-step10000

## Resumen

Shiki42/s016-sortblocks-mixed-pi05-step10000 es un checkpoint de inferencia de un modelo de robotica basado en pi0.5 dentro del ecosistema OpenPI. Lo publica el usuario Shiki42 como parte del experimento E762 (run E762-R004) y corresponde al paso 10.000 de un entrenamiento de 20.000 actualizaciones del optimizador. No es un modelo de lenguaje general, sino una politica vision-lenguaje-accion (VLA) ajustada para una tarea concreta de manipulacion: ordenar bloques ("sort blocks"). El repositorio pesa 6,3 GB e incluye exclusivamente el arbol de parametros de OpenPI (`params/`) y los activos de normalizacion (`assets/`), dejando fuera el estado del optimizador y del cargador de datos.

La relevancia de esta ficha es acotada y hay que enmarcarla con precision: se trata de un artefacto de investigacion con trazabilidad estricta (hashes SHA-256 del manifiesto de runtime, del artefacto de normalizacion por cuantiles y del commit de CTR), pero sin resultados de evaluacion publicados. La propia model card indica de forma explicita que la evaluacion esta pendiente y que no se reclama ninguna tasa de exito. Por tanto, debe tratarse como un punto de partida reproducible para evaluacion o ajuste posterior, no como un modelo listo para produccion.

El modelo se entrenó sobre el dataset `Shiki42/ctr-sortblocks-100ep-mixed` (revision `8ffc6532...`), con batch 16 y semilla 87431. La informacion publicada no incluye el numero de parametros, la arquitectura interna, la longitud de contexto ni los tipos de cuantizacion soportados, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint de un modelo VLA pi0.5 gestionado por el framework OpenPI) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | arbol de parametros de OpenPI (`params/`) mas activos de normalizacion en `assets/`; no se publican safetensors ni GGUF |
| Framework / libreria | openpi |
| Tipo de pipeline | robotics (politica de manipulacion) |
| Tarea | ordenar bloques (sort blocks) |
| Tamano del repositorio | 6,3 GB |
| Paso del checkpoint | 10.000 (de 20.000 actualizaciones del optimizador) |
| Dataset de entrenamiento | Shiki42/ctr-sortblocks-100ep-mixed (revision 8ffc6532ae477bb0dc1fccf0377450f7f0795a6d) |
| Semilla y batch | seed 87431, batch 16 |
| Estado de evaluacion | pendiente; sin tasa de exito declarada |

## Arquitectura y entrenamiento

El checkpoint pertenece al framework OpenPI y, por nomenclatura, a la familia pi0.5 ("PI0.5"), un tipo de modelo vision-lenguaje-accion orientado al control de robots. La model card no detalla la arquitectura interna (tipo de transformer, mecanismo de accion, decodificador o cualquier componente especifico), de modo que no es posible confirmar aqui ni el numero de parametros, ni la estrategia de atencion, ni el esquema de representacion de acciones. Lo unico verificable es que el artefacto publicado contiene el arbol de parametros de OpenPI y estadisticas de normalizacion, sin estado de optimizador ni de cargador de datos, por lo que esta pensado exclusivamente para inferencia.

En cuanto al entrenamiento, los datos disponibles indican: 20.000 actualizaciones del optimizador con batch 16 y semilla 87431, sobre el dataset de episodios mixtos `ctr-sortblocks-100ep-mixed`; este checkpoint se congela en el paso 10.000. La normalizacion se realiza mediante un artefacto global por cuantiles, cuyo SHA-256 se publica (`1e9373bfd47627a0323e72c68abc28f8e1c3e590923fbd8d03d74012912acd1d`). El campo "IdleMask loss consumption" aparece como `false`, lo que indica que la perdida no consume la mascara de inactividad en esta ejecucion. La verificacion del checkpoint se hizo mediante recarga en proceso limpio y comprobacion de parametros finitos, superada tanto en el paso 10k como en el 20k. No se aportan detalles sobre composicion del dataset, tecnicas de RLHF/DPO ni innovaciones de decodificacion.

## Capacidades

- Generacion de acciones de manipulacion robotica: es una politica entrenada para ejecutar una tarea de ordenacion de bloques, tomando como entrada observaciones y consignas y produciendo comandos de control.
- Condicionamiento por lenguaje en ingles: la model card declara `en` como unico idioma soportado.
- Inferencia reproducible: incluye manifiesto de runtime y sumas SHA-256 que permiten verificar la identidad de los archivos publicados.
- Normalizacion integrada: incorpora el artefacto de normalizacion por cuantiles necesario para el preprocesado en inferencia.
- Uso como base para ajuste: al ser un checkpoint de OpenPI, puede servir de punto de partida para entrenamientos posteriores dentro del mismo framework.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision general, audio ni modo "thinking". No aplica el perfil de un LLM convencional.
- El soporte multilingue no esta disponible mas alla del ingles declarado.

## Casos de uso

- Evaluacion de politicas de manipulacion: cargar el checkpoint en OpenPI y medir la tasa de exito en la tarea de ordenacion de bloques en el simulador o banco de pruebas correspondiente, dado que la evaluacion oficial esta pendiente.
- Reproduccion de experimentos: repetir el run E762-R004 y validar que los hashes de runtime y del artefacto de normalizacion coinciden con los publicados.
- Ajuste fino sobre tareas de ordenacion: usar este checkpoint (paso 10.000) como inicializacion para entrenar variantes con mas pasos o con datos adicionales.
- Comparacion de puntos de control: contrastar el paso 10.000 con el paso 20.000 del mismo run para estudiar la evolucion del aprendizaje.
- Estudio de normalizacion: analizar el efecto del artefacto de normalizacion por cuantiles en el comportamiento de la politica.
- Integracion en pipelines de robotica de investigacion: incorporar la politica en un bucle de control dentro de OpenPI para experimentos de laboratorio.
- Auditoria de procedencia: usar los ficheros `resolved_config.json`, `training-provenance.json` y `SHA256SUMS` como base para verificar la cadena de custodia del modelo en un contexto de publicacion cientifica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que la evaluacion esta "pendiente" y que no se realiza ninguna afirmacion de tasa de exito.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 6,3 GB, lo que acota el tamano del artefacto publicado, pero no se documenta la precision ni el consumo en tiempo de ejecucion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. No puede confirmarse que quepa en tarjetas tipo RTX 4090 sin datos de precision y runtime.
- Opciones de despliegue: el artefacto esta ligado al framework OpenPI; no se documentan rutas de despliegue con vLLM, llama.cpp, Ollama o TGI (orientados a LLM y no a este tipo de politica).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento, parametros ni contexto para este checkpoint, y la informacion proporcionada no incluye alternativas comparables con cifras verificables. Como referencias de la misma familia y framework podrian citarse el checkpoint base pi0.5 y el checkpoint del paso 20.000 del mismo run, pero no hay datos publicados que permitan una comparacion cuantitativa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| s016-sortblocks-mixed-pi05-step10000 | no disponible | no disponible | no disponible (evaluacion pendiente) | no disponible | HuggingFace |
| Checkpoint base pi0.5 (OpenPI) | no disponible | no disponible | no disponible | no disponible | framework OpenPI |
| s016-sortblocks-mixed-pi05 (paso 20000) | no disponible | no disponible | no disponible | no disponible | referenciado en el mismo run, no confirmado en la informacion |

## Limitaciones y advertencias

- Sin evaluacion publicada: no existe tasa de exito ni metrica de rendimiento, por lo que se desconoce su utilidad real en la tarea objetivo.
- Licencia no disponible: no puede confirmarse el uso comercial ni las condiciones de redistribucion; conviene contactar con el autor antes de cualquier uso productivo.
- Especializacion extrema: esta ajustado a la tarea de ordenacion de bloques sobre un dataset concreto, por lo que es previsible un mal rendimiento fuera de ese dominio, aunque no hay datos que lo cuantifiquen.
- Idioma limitado: solo se declara soporte de ingles.
- Riesgo de alucinacion/acciones invalidas: en politicas de robotica, las salidas fuera de distribucion pueden traducirse en movimientos fisicos incorrectos; no se documentan mecanismos de seguridad.
- Trazabilidad dependiente de hashes: la validez del artefacto depende de que los SHA-256 publicados coincidan; cualquier modificacion de los ficheros invalida la verificacion.
- Ausencia de estado de optimizador: al excluir el estado del optimizador y del cargador de datos, no es posible reanudar el entrenamiento tal cual desde este repositorio; solo sirve para inferencia o reinicio de ajuste.
- Falta de datos de arquitectura y despliegue: sin informacion de parametros, precision ni requisitos, la planificacion de recursos en produccion no puede realizarse con rigor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shiki42/s016-sortblocks-mixed-pi05-step10000
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-sortblocks-100ep-mixed
- Framework OpenPI: no disponible (no se incluye enlace explicito en la informacion proporcionada)
- Paper o blog asociado: no disponible
- Repositorio o demo adicional: no disponible
