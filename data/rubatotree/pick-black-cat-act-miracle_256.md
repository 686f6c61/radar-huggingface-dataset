# rubatotree/pick-black-cat-act-miracle_256

## Resumen

`rubatotree/pick-black-cat-act-miracle_256` es una politica robotica basada en ACT (Action Chunking with Transformers) publicada por el usuario rubatotree en Hugging Face dentro del ecosistema LeRobot 0.4.3. No es un modelo de lenguaje: es un modulo de control visomotor entrenado desde cero para una tarea concreta de manipulacion, coger un pequeno gato de peluche negro de ojos amarillos y colocarlo dentro o apoyado de forma estable en el borde de una taza verde SIGGRAPH. Su backbone visual es una ResNet18 preentrenada en ImageNet y el modelo no tiene condicionamiento de lenguaje.

Cuenta con 51.668.614 parametros y un repositorio de 0,2 GB en safetensors, lo que lo convierte en un artefacto muy ligero, apto para ejecucion en hardware modesto. Se entreno sobre un subconjunto congelado de 256 episodios y 76.800 fotogramas (revision `85b50d49b5a024fc5f959e824f97917fd3a7bcc9`) del dataset `rubatotree/miracle-pick-black-cat-256`, con 50.000 actualizaciones de optimizador, batch de 16, learning rate 1e-05, precision mixta BF16 y semilla 98001.

Su relevancia es acotada pero clara: sirve como referencia reproducible de como se entrena y publica una politica ACT para el brazo SO101 a partir de datos sinteticos, incluyendo la configuracion exacta de preprocesado y posprocesado. El propio autor advierte de que no existe split de test independiente, ni tasa de exito en rollout en bucle cerrado, ni evaluacion sobre robot real, por lo que debe tratarse como un artefacto de investigacion y no como un sistema validado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbone visual ResNet18 preentrenada en ImageNet |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no es un modelo de lenguaje. Horizonte de accion de 100 acciones con replanificacion cada 5 |
| Tipos de cuantizacion | No disponible: el autor no publica variantes cuantizadas; el repositorio solo contiene safetensors |
| Idiomas soportados | No disponible: modelo sin condicionamiento de lenguaje |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Entradas | `observation.images.front` y `observation.images.side` (640x480) mas `observation.state` con 6 angulos articulares del SO101 en radianes |
| Salidas | 6 angulos absolutos de referencia de motor en radianes, dirigidos al siguiente punto de consigna a 25 Hz |
| Frecuencia de control | 25 Hz en el endpoint, con controlador interpolando a 500 Hz |
| Dataset de entrenamiento | `rubatotree/miracle-pick-black-cat-256`, 256 episodios, 76.800 fotogramas, revision `85b50d49b5a024fc5f959e824f97917fd3a7bcc9` |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es una arquitectura de imitacion (behavioral cloning) disenada para control robotico: un encoder visual procesa las imagenes de las dos camaras, un transformer codifica el estado y un decodificador genera un chunk de acciones futuras de forma coherente en el tiempo. En este caso el backbone visual es una ResNet18 con pesos preentrenados de ImageNet, y el modelo no incorpora entrada de lenguaje ni instrucciones textuales: la tarea esta fijada por el dataset de entrenamiento. La salida es un chunk de 100 acciones y el autor indica que debe replanificarse tras 5 acciones usando observaciones frescas, lo que reduce el coste de inferencia y mitiga la deriva del bucle abierto.

El entrenamiento se realizo desde cero (salvo el backbone visual) durante 50.000 actualizaciones de optimizador con batch 16, learning rate 1e-05, precision mixta BF16 y semilla 98001. No se menciona RLHF ni DPO, lo cual es coherente con un pipeline de imitacion supervisada. Los datos son sinteticos y proceden de un subconjunto congelado de 256 episodios: 13 renderizados con Cycles y 243 con Eevee, y 48 catalogados como debiles frente a 208 fuertes. El autor advierte de que este prefijo congelado es anterior a una cobertura posterior mas amplia de materiales y eliminacion de desorden, y que no constituye el dataset completo de 1280 episodios. Los fotogramas originales son de 640x480 y cada politica aplica su propio preprocesado de imagen guardado.

## Capacidades

- Manipulacion visomotora de una unica tarea: coger el gato de peluche negro de ojos amarillos y colocarlo dentro o apoyado en el borde de la taza verde SIGGRAPH.
- Percepcion con dos camaras simultaneas (`observation.images.front` y `observation.images.side`) a resolucion 640x480.
- Control articular de 6 grados de libertad del brazo SO101, con salidas en radianes como referencia absoluta de motor.
- Generacion de trayectorias temporalmente coherentes mediante chunking de acciones (100 acciones por prediccion).
- Replanificacion frecuente: el autor recomienda recalcular tras 5 acciones con observaciones nuevas.
- Ejecucion a 25 Hz en el endpoint, con interpolacion del controlador a 500 Hz.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingues ni de comprension de instrucciones en lenguaje natural.
- No dispone de vision generalista, audio, thinking mode ni ninguna capacidad mas alla del control visomotor de la tarea entrenada.

## Casos de uso

- Reproduccion de experimentos de imitacion robotica: el repositorio incluye `train_config.json`, `training_completion.json` y `offline_evaluation.json`, de modo que un grupo de investigacion puede replicar el entrenamiento y comparar sus diagnosticos de ajuste con los publicados.
- Fine-tuning para tareas de pick-and-place similares: al ser un ACT de 51,7 M de parametros sobre SO101, sirve como punto de partida barato para reentrenar con un dataset propio de coger y soltar objetos sobre un receptaculo.
- Evaluacion de pipelines de datos sinteticos: el propio dataset distingue episodios renderizados con Cycles (13) y con Eevee (243) y episodios debiles (48) frente a fuertes (208), lo que permite medir el impacto de la composicion del dataset en el error de ajuste.
- Pruebas de integracion del stack LeRobot: el modelo carga con la libreria `lerobot` y requiere usar el preprocesador y posprocesador guardados, por lo que es util para validar versiones, compatibilidad y flujos de carga en ese ecosistema.
- Linea base en comparativas de arquitecturas de control: un ACT entrenado con 256 episodios sirve como referencia frente a Diffusion Policy u otras politicas sobre el mismo dataset y el mismo brazo.
- Docencia y formacion en aprendizaje por imitacion: el tamano reducido del modelo (0,2 GB) y su licencia Apache 2.0 permiten distribuirlo en aulas y ejecutarlo en equipos de estudiante sin infraestructura especial.
- Validacion en simulacion del brazo SO101: permite ejecutar rollouts offline y comprobar el comportamiento del chunk de acciones antes de plantear cualquier traslado a hardware real.
- Pruebas de latencia de infraestructura robotica: con replanificacion cada 5 acciones a 25 Hz, el presupuesto de inferencia es de aproximadamente 200 ms por pasada, un escenario util para medir rendimiento de un stack de inferencia en GPUs de gama baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, algo esperable al tratarse de una politica robotica y no de un modelo de lenguaje. El autor si publica diagnosticos de ajuste offline sobre la fuente de entrenamiento:

| Metrica | Valor | Fuente |
|---|---|---|
| MAE de la primera accion | 0,018523 radianes | `offline_evaluation.json` / model card |
| MAE del chunk valido | 0,016185 radianes | `offline_evaluation.json` / model card |
| Episodios y fotogramas muestreados | 25 episodios / 125 fotogramas | model card |
| Tipo de particion | Estratificada sobre la fuente de entrenamiento | model card |
| Split de test independiente | No existe | model card |
| Tasa de exito en rollout en bucle cerrado | No disponible: no declarada | model card |
| Evaluacion sobre robot real | No disponible: no declarada | model card |

El autor indica que todos los derivados comparten un unico grupo reconstruido de tarea y fuente, y que las comprobaciones de recarga estricta del checkpoint final y de salidas finitas se superaron. Se trata, por tanto, de evidencias de ajuste offline, no de rendimiento en tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: del orden de 1 a 2 GB en FP32/BF16, segun estimacion a partir de los 51,7 M de parametros y de las activaciones de dos imagenes a 640x480. No es un dato publicado por el autor.
- GPU recomendadas: cualquier GPU de consumo moderna es suficiente (RTX 3060, RTX 4070, RTX 4090). En el extremo profesional, una A100 o H100 estaria ampliamente sobredimensionada para este modelo. No hay datos oficiales de latencia por GPU.
- Cabe en GPU de consumo: si, con holgura, incluidas GPU de gama de entrada con 4 GB o mas de VRAM.
- CPU: por el tamano del modelo es plausible la inferencia en CPU, aunque el autor no publica mediciones de latencia en ese escenario.
- Opciones de despliegue: la libreria `lerobot` es la via indicada por el autor. No aplican vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Preprocesado obligatorio: deben usarse el preprocesador y el posprocesador guardados con el checkpoint; las acciones son angulos absolutos de referencia en radianes, no porcentajes de motor ni grados.
- Latencia y throughput: no hay mediciones publicadas. Como referencia derivada de la especificacion, con control a 25 Hz y replanificacion cada 5 acciones el sistema necesita aproximadamente 5 pasadas de politica por segundo, es decir, un presupuesto inferior a 200 ms por pasada.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables en la informacion disponible, por lo que las cifras concretas de alternativas figuran como no disponibles. La comparacion se limita a caracteristicas de categoria:

| Modelo | Arquitectura | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rubatotree/pick-black-cat-act-miracle_256` | ACT con backbone ResNet18 | 51.668.614 | Chunk de 100 acciones, replanificacion cada 5 | Apache 2.0 | Hugging Face, libreria `lerobot` |
| Diffusion Policy (familia LeRobot) | Generativa por difusion para acciones | No disponible | No disponible | No disponible | No disponible en la informacion facilitada |
| SmolVLA (familia LeRobot) | Vision-language-action | No disponible | No disponible | No disponible | No disponible en la informacion facilitada |
| Otro ACT de LeRobot entrenado con otro dataset | ACT | No disponible | No disponible | No disponible | No disponible |

Nota metodologica: la diferencia relevante frente a las alternativas de la categoria no esta en el rendimiento medido, sino en que este checkpoint no aporta evaluacion en bucle cerrado ni en robot real, mientras que el autor documenta de forma explicita la composicion del dataset, la configuracion de entrenamiento y los diagnosticos de ajuste offline.

## Limitaciones y advertencias

- No existe split de test independiente. Los diagnosticos publicados se calculan sobre la propia fuente de entrenamiento, por lo que no miden generalizacion.
- No se declara tasa de exito en rollout en bucle cerrado ni evaluacion sobre robot real. El rendimiento en tarea real es, por tanto, desconocido.
- El dataset es un subconjunto congelado de 256 episodios y no el dataset completo de 1280 episodios, y su prefijo es anterior a una cobertura posterior mas amplia de materiales y eliminacion de desorden.
- Los datos son sinteticos (renderizados con Cycles y Eevee), lo que introduce una brecha de dominio respecto a camaras, iluminacion y condiciones fisicas reales.
- Tarea unica y sin condicionamiento de lenguaje: el modelo no puede recibir instrucciones nuevas ni reutilizarse en otra tarea sin reentrenamiento.
- Presencia de distractores en el entorno de entrenamiento (un gato mayor de ojos azules con gafas y un vaso transparente); no se documenta su efecto sobre el comportamiento final.
- Convenciones de accion estrictas: radianes como referencia absoluta de motor dirigida al siguiente endpoint a 25 Hz. Interpretar las salidas como porcentajes de motor o como grados produciria comandos incorrectos.
- Es obligatorio usar el preprocesador y el posprocesador guardados; omitirlos invalida las predicciones.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de predicciones fisicamente invalidas o inestables fuera de la distribucion del dataset.
- Sesgos conocidos: no documentados de forma explicita por el autor; no hay analisis de sesgo sobre el dataset sintetico.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales declaradas, pero no hay ninguna garantia de idoneidad ni validacion para produccion.
- El repositorio tiene 0 descargas y 0 likes, y las fechas de creacion y actualizacion son del 11 de septiembre de 2026, con una diferencia de dos minutos entre ambas; conviene verificar la procedencia antes de integrarlo en cualquier flujo.
- Advertencia general de seguridad: cualquier despliegue sobre hardware fisico debe hacerse en entorno controlado y con limites de par y de recorrido, dado que el modelo no ha sido evaluado en robot real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rubatotree/pick-black-cat-act-miracle_256
- Dataset de entrenamiento: https://huggingface.co/datasets/rubatotree/miracle-pick-black-cat-256
- Configuracion de entrenamiento: https://huggingface.co/rubatotree/pick-black-cat-act-miracle_256/blob/main/train_config.json
- Registro de finalizacion del entrenamiento: https://huggingface.co/rubatotree/pick-black-cat-act-miracle_256/blob/main/training_completion.json
- Evaluacion offline: https://huggingface.co/rubatotree/pick-black-cat-act-miracle_256/blob/main/offline_evaluation.json
- LeRobot (libreria y ecosistema): https://github.com/huggingface/lerobot
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo. Las busquedas devolvieron unicamente paginas de test de velocidad de conexion (Speedtest de Ookla, Fast.com, Cloudflare y Google Fiber), sin relacion con este modelo. No se han localizado papers, blogs ni demos adicionales en la informacion disponible.
