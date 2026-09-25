# junbrro/egopi-arm2-rbbt-anyh3-AB-FULL-30k-actsilu-mlxp-20260925

## Resumen

egopi-arm2-rbbt-anyh3-AB-FULL-30k-actsilu-mlxp-20260925 es un checkpoint de pesos publicado por el usuario junbrro en HuggingFace, con 6.915.102.808 parametros (aproximadamente 6,9 mil millones) y un repositorio de 13,9 GB. La model card lo describe como el paso final (step 30000) de un entrenamiento derivado de la fuente "junhyeong-anyh3-full-30k-260923-r1", bajo el titulo "AnyH3 CogAlign + tokenizer + full persistent language". El nombre del repositorio y los artefactos que menciona la propia model card (tokenizador de acciones en el directorio `actlat/`) apuntan a un modelo orientado a control de brazos roboticos o agentes encarnados, no a un modelo de lenguaje conversacional de proposito general.

La publicacion incluye unicamente los pesos finales y la configuracion; el autor indica explicitamente que se han excluido el estado del optimizador y el estado del generador de numeros aleatorios, y advierte de que la configuracion preserva rutas del cluster de origen que deben ser reasignadas antes de cualquier inferencia. Tambien senala que la finalizacion del entrenamiento no garantiza el rendimiento en rollout, lo que sugiere que se trata de un artefacto de investigacion mas que de un modelo listo para produccion.

El modelo tiene cero descargas y cero likes en el momento de la consulta, no declara licencia ni idiomas, y no incluye pipeline definido. Todo ello lo situa como un checkpoint experimental de un flujo de trabajo privado de investigacion en robotica, con documentacion minima y sin validacion publica de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica el tipo de red; la etiqueta de HuggingFace es RLDX-1) |
| Parametros totales | 6.915.102.808 (aproximadamente 6,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors; el tamano del repositorio, 13,9 GB, es coherente con precision de 16 bits para 6,9 mil millones de parametros) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,9 GB |
| Version de entrenamiento | paso final 30000 |
| Modelo de origen | junhyeong-anyh3-full-30k-260923-r1 |
| Tokenizador de acciones | incluido en el directorio `actlat/` (cuando aplica, segun la model card) |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-09-25 |
| Fecha de actualizacion | 2026-09-25 |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica detallada sobre la arquitectura interna del modelo. La model card no menciona el tipo de red (transformer, mezcla de expertos, modelo de espacio de estados ni arquitectura hibrida), ni el numero de tokens de entrenamiento, ni la composicion del conjunto de datos, ni si se aplicaron fases de ajuste por refuerzo (RLHF, DPO u otras). La unica etiqueta de HuggingFace relevante es RLDX-1, que no viene acompanada de explicacion en la informacion proporcionada.

Lo que si puede inferirse del texto de la model card es el procedimiento de publicacion: se trata del paso final (30000) de un entrenamiento cuyo origen es "junhyeong-anyh3-full-30k-260923-r1". Se preserva la configuracion original, incluidas las rutas del cluster de origen, que el autor indica que deben reasignarse antes de usar el modelo. Se incluye un tokenizador de acciones en `actlat/`, lo que apunta a un componente de discretizacion de acciones motoras tipico de los modelos de robotica. Quedan excluidos el estado del optimizador y el estado del generador aleatorio, de modo que el checkpoint no permite reanudar el entrenamiento de forma exacta. El autor advierte que completar el entrenamiento no implica un rendimiento de rollout validado.

## Capacidades

No se han publicado listados de capacidades en la informacion disponible. A partir del nombre del repositorio y de los artefactos mencionados en la model card puede indicarse lo siguiente, siempre con caracter tentativo:

- El modelo pertenece a la familia de trabajo "egopi" y a la variante "arm2", asociada a control de brazos roboticos.
- Incorpora un tokenizador de acciones (`actlat/`), lo que sugiere generacion o prediccion de acciones motoras discretizadas.
- La model card menciona "full persistent language", aunque sin detallar que implica funcionalmente.
- No hay informacion sobre generacion de texto general, razonamiento, codigo, matematicas, vision, tool calling, function calling, soporte de agentes, capacidades multilingues ni modos especiales (thinking, audio u otros).
- No se documenta ningun formato de prompt, esquema de entrada o interfaz de inferencia.

## Casos de uso

Dado que la informacion publica no describe aplicaciones ni validaciones funcionales, los casos siguientes son escenarios plausibles derivados del tipo de artefacto, no usos confirmados por el autor:

- Investigacion en manipulacion robotica: el checkpoint puede emplearse como punto de partida para reproducir o comparar experimentos de la familia "egopi-arm2", siempre que se reasignen previamente las rutas del cluster de origen tal como indica la model card.
- Estudio de tokenizacion de acciones: el directorio `actlat/` permite analizar como se discretizan las acciones motoras y como se relacionan con las salidas del modelo.
- Comparacion de checkpoints dentro de la misma linea: al existir otros repositorios del mismo autor (`egopi-axis2-adaln-only-AB-30k-actsilu-mlxp-20260921`, `egopi-mt-r6h5-axis1-AB-30k-actsilu-slurm-18839-20260921`), este modelo puede usarse para estudiar el efecto de distintas configuraciones de entrenamiento sobre un mismo pipeline.
- Reproduccion de pipelines encarnados: el artefacto puede integrarse en infraestructuras de evaluacion tipo rollout para comprobar si el rendimiento declarado en la fase de entrenamiento se traslada a la ejecucion real.
- Analisis de entrenamiento a gran escala: al ser el paso 30000 de un entrenamiento identificado, sirve para inspeccionar convergencia y estabilidad en funcion del paso.
- Auditoria de artefactos de investigacion: util para estudiar como se publican checkpoints con rutas de cluster incrustadas y que precauciones requiere su reutilizacion.
- Base para experimentos internos de robotica: en entornos controlados de laboratorio, podria servir como inicializacion de nuevos ciclos de ajuste.
- Ninguno de estos casos esta respaldado por resultados publicados de rendimiento, y no se recomienda su uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No constan metricas de MMLU, HumanEval, GSM8K, tasas de exito en tareas de manipulacion ni ninguna otra medida cuantitativa, ni en la model card ni en los resultados de busqueda web.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del numero de parametros (6,9 mil millones), no datos publicados por el autor:

- VRAM estimada en precision de 16 bits: en torno a 14 GB solo para los pesos, mas memoria adicional para activaciones y estado de inferencia.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 7-8 GB para los pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 4-5 GB para los pesos, aunque no se distribuyen pesos cuantizados en el repositorio.
- GPU recomendadas: no disponible. Por tamano, cabria en GPU de consumo con 16 GB o mas (por ejemplo, RTX 4080/4090) en 16 bits con margen limitado, y en GPU de clase profesional (A100, H100) con holgura.
- Compatibilidad con GPU de consumo: probable en 16 bits en tarjetas de 24 GB, y en tarjetas de 16 GB con cuantizacion.
- Opciones de despliegue: no disponible. La model card no menciona vLLM, llama.cpp, Ollama, TGI ni ningun otro motor, y el caracter especifico del modelo (tokenizador de acciones, rutas de cluster incrustadas) hace que el despliegue estandar no pueda darse por sentado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de ninguno de los modelos de la comparacion, por lo que la tabla solo recoge caracteristicas objetivas y disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| junbrro/egopi-arm2-rbbt-anyh3-AB-FULL-30k-actsilu-mlxp-20260925 | 6,9 mil millones | no disponible | no disponible | safetensors | publico, 0 descargas |
| junbrro/egopi-axis2-adaln-only-AB-30k-actsilu-mlxp-20260921 | no disponible | no disponible | no disponible | safetensors | publico, mismo autor |
| junbrro/egopi-mt-r6h5-axis1-AB-30k-actsilu-slurm-18839-20260921 | no disponible | no disponible | no disponible | safetensors | publico, mismo autor |
| junbrro/action-tokenizer-prq30-qcontinuous-v9-openarm1106-egodex1091-100k | no disponible | no disponible | no disponible | safetensors | publico, mismo autor (tokenizador de acciones) |

No se ha identificado en la informacion proporcionada ningun modelo externo claramente comparable en arquitectura, tarea o tamano.

## Limitaciones y advertencias

- La model card advierte de que los pesos conservan las rutas de origen del cluster y que estas deben reasignarse antes de la inferencia; sin ese ajuste, la carga puede fallar.
- No se incluye estado del optimizador ni del generador aleatorio, por lo que no es posible reanudar el entrenamiento de forma exacta.
- El autor afirma explicitamente que la finalizacion del entrenamiento no acredita rendimiento de rollout; no hay validacion publica de capacidades.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido. Se debe contactar con el autor antes de cualquier uso productivo.
- No se declaran idiomas soportados ni se documenta comportamiento multilingue.
- No hay informacion sobre sesgos, datos de entrenamiento, composicion del corpus ni posibles riesgos de alucinacion; al tratarse de un modelo orientado a control motor, el modo de fallo relevante seria la ejecucion de acciones incorrectas, no la generacion de texto.
- Ausencia total de adopcion publica (0 descargas, 0 likes) y de documentacion de la comunidad, lo que reduce la posibilidad de detectar problemas conocidos.
- No se especifica el pipeline, la interfaz de entrada ni el formato de prompt, por lo que la integracion requiere ingenieria inversa o acceso a la configuracion del autor.
- Uso recomendado exclusivamente en entornos de investigacion controlados y con supervision humana en cualquier aplicacion robotica real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/junbrro/egopi-arm2-rbbt-anyh3-AB-FULL-30k-actsilu-mlxp-20260925
- Repositorio relacionado del mismo autor: https://huggingface.co/junbrro/egopi-axis2-adaln-only-AB-30k-actsilu-mlxp-20260921
- Repositorio relacionado del mismo autor: https://huggingface.co/junbrro/egopi-mt-r6h5-axis1-AB-30k-actsilu-slurm-18839-20260921
- Tokenizador de acciones del mismo autor: https://huggingface.co/junbrro/action-tokenizer-prq30-qcontinuous-v9-openarm1106-egodex1091-100k
- Paper, blog o repositorio de codigo: no disponible en la informacion proporcionada.
