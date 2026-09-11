# fm-dev/pi05-button-order-status-d-overfit3-epoch80

## Resumen

`fm-dev/pi05-button-order-status-d-overfit3-epoch80` es un checkpoint de investigacion publicado en HuggingFace por el usuario `fm-dev`. Se trata de un ajuste fino mediante LoRA (adaptador denominado Cartesian8) sobre el modelo base `physical-intelligence/pi05_base`, un modelo vision-language-action (VLA) de Physical Intelligence orientado al control de robots. El checkpoint esta disenado deliberadamente para sobreajustar: se ha entrenado 80 epochs sobre unicamente 3 trayectorias de demostracion y 529 ventanas de historial, con el objetivo de reproducir una unica tarea de manipulacion.

La tarea concreta es "Press the buttons in the order shown in the demonstration video" (pulsar botones en el orden mostrado en el video de demostracion), ejecutada sobre un entorno de robot Franka. El modelo emite chunks de accion de forma `[20,8]` con posiciones cartesianas absolutas en metros, cuaterniones XYZW unitarios y un valor binario de pinza (0=cerrado, 1=abierto). El checkpoint corresponde a la EMA en el step 5.920, exactamente 80 epochs de sampler, con batch global 8 y 74 actualizaciones por epoch.

Su relevancia es experimental, no productiva: sirve como material de reproduccion para estudiar sobreajuste controlado, adaptacion LoRA de bajo rango sobre politicas VLA y el uso de historial observado largo (32 fotogramas mas un keyframe opcional del denominado Writer) con contexto causal de Status. El repositorio ocupa 5,8 GB e incluye pesos EMA, normalizacion, assets de politica, codigo coincidente y un script `load_model.py`. No declara licencia, idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 base (modelo vision-language-action) con adaptador Cartesian8 LoRA |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible como limite general; ventana de historial declarada de 528 tokens (32 fotogramas observados mas un keyframe Writer opcional) mas contexto causal de Status |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible; el repositorio incluye `params/` (EMA), `assets/` (normalizacion y politica), `code/`, `requirements.txt` y `load_model.py` |
| Modelo base | physical-intelligence/pi05_base |
| Tamano del repositorio | 5,8 GB |
| Pipeline declarado | robotics |
| Tarea | "Press the buttons in the order shown in the demonstration video" |
| Forma de salida | `[20,8]`: `[x, y, z, qx, qy, qz, qw, gripper_open]`, posiciones en metros y cuaterniones XYZW unitarios |
| Checkpoint | EMA en el step 5.920 (80 epochs de sampler) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-10 |

## Arquitectura y entrenamiento

La model card identifica la arquitectura como π0.5 base con un adaptador LoRA llamado Cartesian8. El repositorio no detalla el recuento de parametros, la composicion del dataset de preentrenamiento del base, ni si este ultimo utilizo RLHF, DPO u otro metodo de alineamiento; estos datos se marcan como no disponibles. El modelo trabaja con vistas actuales de camara base y muneca, estado del robot, 32 fotogramas de historial observado mas un keyframe opcional del Writer (528 tokens de historial en total), un subobjetivo Writer mantenido y contexto causal de transicion de Status.

El entrenamiento se realizo sobre un subconjunto de comportamiento de 529 ventanas H20 procedentes de tres episodios: `button_order_20260827_171329_079`, `button_order_20260827_171814_240` y `button_order_20260827_172703_063`. Se uso batch global 8 sobre una unica NVIDIA RTX A6000, con 74 actualizaciones por epoch de sampler y 80 epochs en total (5.920 steps). La geometria de epochs de Status-D incluye su mezcla auxiliar de Status ya existente. Se aplico la normalizacion original del split de entrenamiento y las etiquetas de comando ausentes permanecieron enmascaradas durante el entrenamiento.

Como innovaciones destacables del artefacto: uso de LoRA de bajo rango especifico para salidas cartesianas de 8 dimensiones, integracion de historial visual largo con contexto causal, mantenimiento de un subobjetivo Writer y publicacion del checkpoint EMA junto con el codigo de carga. El estado de optimizador y de reanudacion no se incluye, por lo que no es posible continuar el entrenamiento desde el repositorio.

## Capacidades

- Generacion de acciones de manipulacion robotica: produce chunks de 20 pasos con 8 dimensiones por paso (posicion cartesiana absoluta, orientacion en cuaternion y apertura de pinza).
- Ejecucion de una tarea especifica aprendida por imitacion: pulsar botones en el orden mostrado en un video de demostracion.
- Consumo de historial visual y de estado: procesa 32 fotogramas observados mas un keyframe Writer opcional (528 tokens de historial).
- Condicionamiento por subobjetivo: mantiene un subobjetivo Writer durante la inferencia.
- Uso de contexto causal de Status para la transicion entre fases del comportamiento (incluye mezcla auxiliar Status-D).
- Toma de decisiones visomotora de corto horizonte sobre vistas de camara base y muneca.
- Inferencia en GPU verificada a nivel de carga: `inference-check.json` documenta la carga del modelo y la comprobacion de salidas finitas sobre nueve observaciones de entrenamiento de los tres episodios.
- No se declaran capacidades de tool calling, function calling, agentes multi-paso, vision general, audio, thinking mode ni soporte multilingue.

## Casos de uso

- Reproduccion de experimentos de sobreajuste en politica VLA: el checkpoint permite verificar curvas de ajuste sobre 3 trayectorias y 80 epochs, comparando el comportamiento con el modelo base sin adaptador.
- Validacion de pipelines de carga de pesos π0.5: `load_model.py`, `requirements.txt` y `inference-check.json` permiten comprobar que el modelo carga en GPU y produce salidas finitas antes de integrarlo en un stack mayor.
- Estudio de adaptacion LoRA de bajo rango: el adaptador Cartesian8 sirve para medir cuanto rendimiento se obtiene con LoRA sobre un VLA congelado frente a un ajuste completo, en una tarea de control cartesiano.
- Investigacion de memoria de corto plazo en politicas de robot: el uso de 32 fotogramas de historial mas un keyframe opcional permite analizar el impacto del historial observado en la precision del chunk de acciones.
- Analisis de condicionamiento por subobjetivos: el subobjetivo Writer retenido y el contexto causal de Status permiten estudiar la descomposicion de una tarea de manipulacion en fases y transiciones.
- Pruebas de integracion con controladores de robots tipo Franka: la salida en metros con cuaterniones XYZW unitarios y pinza binaria es directamente consumible por controladores que acepten acciones cartesianas absolutas con chunking.
- Ablation de olvido catastrofico: comparar la ejecucion de este checkpoint frente a `physical-intelligence/pi05_base` permite cuantificar la especializacion y la perdida de capacidades generales tras el sobreajuste.
- Generacion de trayectorias sinteticas para tareas de pulsado de botones en simulacion, siempre que se repliquen las condiciones de observacion (vistas base y muneca, historial de 32 fotogramas y contexto Status).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta una comprobacion de carga e inferencia (`inference-check.json`) sobre nueve observaciones de entrenamiento de los tres episodios, cuyo alcance declarado es verificar que el modelo carga y que las salidas son finitas. El autor indica explicitamente que estas comprobaciones no establecen exito en robot real ni un rollout online del Writer.

| Prueba | Alcance | Resultado |
|---|---|---|
| MMLU, HumanEval, GSM8K u otros benchmarks estandar | no aplica a este tipo de modelo | no disponible |
| Benchmarks de manipulacion (tasa de exito en robot real) | no realizados segun la model card | no disponible |
| `inference-check.json` | 9 observaciones de entrenamiento (3 episodios), carga en GPU y salidas finitas | verificacion superada segun la model card; no equivale a evaluacion de exito |

## Requisitos de hardware

- Entrenamiento documentado: una unica NVIDIA RTX A6000 con batch global 8, 74 actualizaciones por epoch de sampler.
- VRAM de inferencia: estimacion en torno a 6 GB solo para pesos si se cargan en precision completa, dado que el repositorio ocupa 5,8 GB; en FP16/BF16 el peso se reduciria aproximadamente a la mitad (estimacion no verificada y no publicada por el autor).
- GPU recomendadas: RTX A6000 (configuracion usada en entrenamiento), A100, H100 para despliegues con mayor paralelismo o batch; RTX 3090 y RTX 4090 son candidatas razonables por capacidad de VRAM, aunque no hay validacion publicada.
- Cabe en GPU de consumo: probable en tarjetas con 16-24 GB de VRAM, siempre que se anada el coste de activaciones, buffers de historial (528 tokens) y copias de trabajo; no confirmado en la informacion disponible.
- Opciones de despliegue: la model card solo menciona carga mediante `load_model.py` y descarga con `hf download`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por chunk de 20 acciones ni de frecuencia de control alcanzable.
- Almacenamiento: 5,8 GB para el repositorio completo (pesos EMA, assets, codigo y requisitos).

## Comparativa con modelos similares

No se han encontrado en la busqueda web resultados relevantes sobre este modelo ni sobre alternativas comparables; los resultados devueltos correspondian a directorios de emisoras de radio en Francia, sin relacion con el ambito. La comparacion se limita a lo declarado en el repositorio.

| Modelo | Categoria | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| fm-dev/pi05-button-order-status-d-overfit3-epoch80 | LoRA Cartesian8 sobre π0.5, sobreajustado a 3 trayectorias | no disponible | 528 tokens de historial mas contexto Status | solo comprobacion de carga e inferencia | no disponible | HuggingFace, 0 descargas, 0 likes |
| physical-intelligence/pi05_base | Modelo base VLA de Physical Intelligence | no disponible | no disponible | no disponible | no disponible | Referenciado como `base_model` en el repositorio |
| Otros checkpoints de la familia π0.5 / π0 | VLA para control de robots | no disponible | no disponible | no disponible | no disponible | No localizados resultados relevantes en la busqueda |

## Limitaciones y advertencias

- Sobreajuste intencionado: el modelo se entrena 80 epochs sobre 3 trayectorias y 529 ventanas. No cabe esperar generalizacion a botones, escenas, ordenes u objetos distintos de los de esas demostraciones.
- Sin licencia declarada: la model card no especifica licencia, por lo que no hay base explicita para uso comercial y conviene contactar con el autor antes de cualquier despliegue.
- Sin validacion en robot real: la unica comprobacion publicada se realizo offline sobre observaciones de entrenamiento; el autor indica que no demuestra exito en robot ni rollout online del Writer.
- Dependencia estricta de las entradas: el autor advierte que Uniform32 y Status-D requieren historial realmente observado, y que Status-D necesita ademas las entradas retenidas del Writer y el contexto causal.
- Dependencia de la normalizacion original: el modelo se entreno con la normalizacion del split original; usar otra normalizacion en inferencia puede degradar o invalidar las acciones generadas.
- Dataset minimo y poco diverso: tres episodios concretos (uno de ellos con identificador temporal del 2026-08-27) probablemente grabados en un unico entorno, con un unico operador y sin variacion de iluminacion, disposicion de botones o configuracion del robot.
- Riesgo de acumulacion de error: al emitir chunks absolutos de 20 pasos, pequenos errores de posicion u orientacion pueden acumularse a lo largo de la tarea.
- Sin estado de optimizador: el repositorio no incluye estado de optimizador ni de reanudacion, por lo que no se puede continuar el entrenamiento desde este checkpoint.
- Salidas no validadas como unitarias: aunque la model card declara cuaterniones XYZW unitarios, no se documenta ninguna comprobacion de normalizacion de la orientacion en las acciones generadas.
- Idiomas y entradas de lenguaje: no se declaran idiomas soportados; la model card describe la tarea en ingles y no detalla el manejo de instrucciones multilingues.
- Rendimiento y latencia desconocidos: no hay datos publicados de tasa de exito, throughput, latencia por chunk ni frecuencia de control, elementos criticos en un bucle de control robotico.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el artefacto.
- La informacion recogida en la busqueda web no es fiable ni pertinente; no se debe usar como contexto tecnico del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fm-dev/pi05-button-order-status-d-overfit3-epoch80
- Modelo base referenciado: https://huggingface.co/physical-intelligence/pi05_base
- Descarga directa indicada en la model card: `hf download fm-dev/pi05-button-order-status-d-overfit3-epoch80 --local-dir ./button-order-status-d-epoch80`
- Archivos auxiliares incluidos en el repositorio: `params/` (EMA), `assets/`, `code/`, `requirements.txt`, `load_model.py`, `inference-check.json`
- Papers, blogs, repositorios o demos adicionales: no disponibles; la busqueda web no devolvio resultados relevantes sobre este modelo (unicamente sitios de radio en FM sin relacion con el ambito).
