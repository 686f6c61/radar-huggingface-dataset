# leoliu49/smolvla-grasp-p1h-clean-notactile-n10-s1

## Resumen

SmolVLA es un modelo vision-lenguaje-accion (VLA) compacto y eficiente, disenado para controlar robots manipuladores a partir de observaciones visuales e instrucciones en lenguaje natural, con un coste computacional reducido que permite su despliegue en hardware de consumo. El checkpoint analizado, `leoliu49/smolvla-grasp-p1h-clean-notactile-n10-s1`, es un ajuste fino (fine-tune) del modelo base `lerobot/smolvla_base` publicado por el usuario leoliu49, entrenado con el framework LeRobot sobre el dataset `leoliu49/grasp_p1h_clean`.

El modelo resuelve el problema de la politica de control extremo a extremo en robotica: en lugar de programar controladores clasicos, aprende directamente una politica que mapea imagenes de camara (y opcionalmente estado del robot) a comandos de accion. Su relevancia actual radica en que democratiza la investigacion en VLA al reducir el tamano a unos 450 millones de parametros, frente a los miles de millones tipicos de propuestas como OpenVLA o pi0, y al integrarse en el ecosistema LeRobot junto a robots de bajo coste como la serie SO-100.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamano de 0,9 GB y licencia Apache 2.0. El sufijo del nombre ("grasp", "notactile") sugiere un ajuste orientado a una tarea de agarre sin entrada tactil, aunque la model card no detalla la tarea ni el procedimiento de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en SmolVLA; backbone vision-lenguaje con modulo de generacion de acciones (detalle interno no disponible en la model card) |
| Parametros totales | 450.046.176 (0,45 mil millones, dato de los pesos safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio publicado en safetensors; sin variantes GGUF/INT8 documentadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Modelo base | lerobot/smolvla_base |
| Dataset de ajuste | leoliu49/grasp_p1h_clean |
| Tamano del repositorio | 0,9 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

SmolVLA pertenece a la familia de modelos vision-lenguaje-accion: combina un componente de percepcion vision-lenguaje, que procesa las imagenes de las camaras del robot junto con la instruccion de tarea, y un modulo que produce la secuencia de acciones de control. El modelo base se presenta en el paper arXiv:2506.01844 como un VLA compacto con rendimiento competitivo a coste computacional reducido, apto para hardware de consumo. Este checkpoint concreto es un fine-tune de ese modelo base mediante LeRobot, la libreria de Hugging Face para aprendizaje por imitacion en robotica, sobre el dataset `leoliu49/grasp_p1h_clean`.

No se dispone de informacion sobre el numero de tokens o episodios de entrenamiento, la composicion del dataset de ajuste, el numero de epochs, la tasa de aprendizaje ni si se aplicaron tecnicas de ajuste tipo RLHF/DPO (en robotica de imitacion lo habitual es entrenamiento supervisado sobre demostraciones, pero la model card no lo especifica). El nombre del repositorio indica "notactile", lo que apunta a que el ajuste se realizo sin entradas tactiles, y el sufijo "n10-s1" no esta documentado. La model card unicamente proporciona comandos de entrenamiento e inferencia con `lerobot-train` y `lerobot-record`, sin detallar hiperparametros ni innovaciones tecnicas adicionales del ajuste.

## Capacidades

- Generacion de acciones de control robotico a partir de observaciones visuales, integrada en el pipeline de robotica de LeRobot.
- Interpretacion de instrucciones de tarea en lenguaje natural combinadas con imagenes (capacidad heredada de la arquitectura vision-lenguaje-accion).
- Ejecucion de politicas de manipulacion entrenadas por imitacion, en concreto una politica de agarre (segun el nombre del repositorio) sin senal tactil.
- Compatibilidad con robots de bajo coste del ecosistema LeRobot, con el ejemplo documentado para el brazo `so100_follower`.
- Grabacion y evaluacion de episodios mediante `lerobot-record` para medir el exito de la politica.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje general).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): vision como entrada; modo thinking y audio no disponibles.

## Casos de uso

- Investigacion en aprendizaje por imitacion: reproducir el ajuste fino de SmolVLA sobre un dataset propio de demostraciones con `lerobot-train`, usando este checkpoint como referencia de partida para comparar variantes con y sin entrada tactil.
- Agarre de objetos en laboratorio: la politica puede desplegarse sobre un brazo SO-100/SO-101 para ejecutar tareas de pick-and-place en un banco de pruebas controlado, con camaras fijas y objetos dentro de la distribucion del dataset de entrenamiento.
- Generacion de datos de evaluacion: usar `lerobot-record` con `--episodes` para grabar trayectorias de evaluacion y calcular tasas de exito por episodio, alimentando un pipeline de validacion de politicas.
- Prototipado en robotica de bajo coste: al tener 450 millones de parametros, permite iterar rapidamente en estaciones de trabajo con una unica GPU consumer, sin necesidad de clústeres.
- Automatizacion de tareas repetitivas de manipulacion en entornos academicos o de fabricacion ligera, donde el coste de un controlador clasico no se justifica y el entorno es suficientemente estable.
- Base para comparativas de ablacion: por su condicion "notactile", sirve como linea base frente a variantes con sensores tactiles u otras modalidades de entrada en estudios de ablacion.
- Despliegue en robotica de borde: su tamano reducido hace viable ejecutar la politica en plataformas embebidas con GPU integrada (por ejemplo, Jetson), aunque no se han publicado mediciones de latencia para este checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint no incluye metricas de tasa de exito, numero de episodios de evaluacion, ni comparaciones con el modelo base `lerobot/smolvla_base` o con otras politicas.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,8 GB en FP32, 0,9 GB en BF16/FP16, 0,45 GB en INT8 y 0,23 GB en INT4 (calculado a partir de 450.046.176 parametros; no son cifras publicadas por el autor).
- VRAM realista en inferencia: hay que anadir la memoria de activaciones del codificador visual y del buffer de imagenes; se recomienda reservar entre 2 y 4 GB adicionales segun la resolucion y el numero de camaras.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4070, RTX 4090, A100 y H100 funcionan sin problema. El modelo esta disenado explicitamente para hardware de consumo.
- Cabe en GPU consumer: si, practicamente en todas las GPU discretas modernas con 6-8 GB de VRAM o mas.
- Opciones de despliegue: LeRobot (`lerobot-train` para entrenamiento, `lerobot-record` con `--policy.path` para inferencia y evaluacion), PyTorch con pesos safetensors. No hay soporte documentado en vLLM, TGI, Ollama ni llama.cpp, ya que no es un modelo de lenguaje de texto.
- Latencia y throughput: no disponibles. Dependen del robot, del numero de camaras y de la frecuencia de control configurada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (SmolVLA fine-tune) | 450 M | no disponible | no disponible (sin metricas publicadas) | apache-2.0 | Hugging Face, via LeRobot |
| lerobot/smolvla_base | ~450 M | no disponible | el paper declara rendimiento competitivo a coste reducido, sin cifras en esta ficha | apache-2.0 | Hugging Face, via LeRobot |
| OpenVLA | ~7 B (dato publico del proyecto, no de la informacion proporcionada) | no disponible | no disponible | licencia propia del proyecto | Hugging Face |
| pi0 (Physical Intelligence) | ~3 B (dato publico del proyecto, no de la informacion proporcionada) | no disponible | no disponible | no disponible | disponibilidad limitada |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada, por lo que la comparacion se limita a parametros y licencia. Cualquier cifra de rendimiento relativo queda fuera del alcance de esta ficha.

## Limitaciones y advertencias

- Sin evaluacion publicada: el repositorio no incluye tasa de exito ni metricas de evaluacion, por lo que no es posible afirmar que el ajuste funcione correctamente en la tarea objetivo.
- Riesgo de sobreajuste al entorno de entrenamiento: el dataset `leoliu49/grasp_p1h_clean` corresponde a una configuracion concreta de robot, camaras e iluminacion; el modelo puede degradarse ante cambios de posicion de camara, fondo u objetos fuera de distribucion.
- Ausencia de entrada tactil: el sufijo "notactile" indica que la politica no usa sensores tactiles, lo que limita el agarre de objetos fragiles o con deslizamiento impredecible.
- Sesgos: no documentados. En robotica, los sesgos se manifiestan como sesgo de posicion, de objetos y de operador presentes en las demostraciones, lo que puede producir trayectorias estereotipadas.
- Alucinacion en el sentido de acciones erroneas: un VLA puede generar comandos de accion plausibles pero fisicamente invalidos; es imprescindible validar en simulacion y con limites de par y de espacio antes de operar cerca de personas.
- Idioma e instrucciones: no se documenta en que idioma se dieron las instrucciones de tarea durante el entrenamiento, ni si el modelo acepta instrucciones nuevas que no aparezcan en los datos.
- Contexto: no disponible. No hay informacion sobre cuantas observaciones previas mantiene la politica.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero al derivar del modelo base `lerobot/smolvla_base` conviene revisar tambien las condiciones de ese repositorio y de los datasets empleados.
- Advertencia de seguridad en produccion: para uso real se requiere supervision humana, parada de emergencia y validacion previa en un entorno controlado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leoliu49/smolvla-grasp-p1h-clean-notactile-n10-s1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de ajuste: https://huggingface.co/datasets/leoliu49/grasp_p1h_clean
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo; las coincidencias devueltas corresponden a foros sin relacion con el checkpoint.
