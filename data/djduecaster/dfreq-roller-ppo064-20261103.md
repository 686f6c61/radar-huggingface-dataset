# djduecaster/dfreq-roller-ppo064-20261103

## Resumen

Microduck Roller PPO checkpoint 64 es un controlador de politica entrenado con PPO (Proximal Policy Optimization) para la tarea "roller-sprint-2m" del entorno Microduck Arena, un simulador de fisica sobre CPU/MPS. El modelo consume 61 observaciones y produce 14 acciones, sin acceso a semillas ni entradas privilegiadas, y se distribuye unicamente en formato ONNX. Lo publica el usuario djduecaster como checkpoint diario de su pipeline de aprendizaje por refuerzo nativo.

El interes del artefacto es acotado y muy especifico: no es un modelo de lenguaje ni un modelo fundacional, sino una politica de control para un benchmark de simulacion fisica. Su relevancia radica en que documenta un resultado reproducible (2.720 segundos en la evaluacion original a 1.0 m/s, con 5/5 finalizaciones) frente al mejor publicado de 2.570 segundos, y en que incluye validacion separada de 128/128 arranques completos y 64/64 arranques bajo estres de comando.

No hay informacion sobre arquitectura de red, numero de parametros, contexto, idiomas ni licencia. El repositorio ocupa 0.0 GB y no registra descargas ni likes en el momento de la consulta. Cualquier uso fuera del entorno Microduck Arena carece de sentido, ya que las observaciones y acciones estan ligadas a la fisica concreta del simulador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica PPO; topologia de red no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada fija de 61 observaciones) |
| Tipos de cuantizacion | no disponible (pesos ONNX; cuantizacion no documentada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (SHA256: 4deaf32f4d8318ee21e639fa7038da2ef3afd3c7707bdb1ed51870167ebdf31b) |

## Arquitectura y entrenamiento

La model card indica que se trata de un checkpoint PPO "genuine independently updated" obtenido con un learner nativo sobre CPU con soporte de MPS (Metal Performance Shaders). El espacio de observacion es de 61 dimensiones y el de accion de 14 dimensiones, correspondientes al controlador del evento roller-sprint-2m con velocidad de comando 1.0 m/s. El autor afirma que no hay lookup de semillas ni entradas privilegiadas, y que no se copiaron pesos ni salidas de oponentes de terceros.

No se especifica la topologia de la red (numero de capas, unidades por capa, funciones de activacion), el numero de pasos de entrenamiento, el tamano del buffer de rollouts, los hiperparametros de PPO (clip ratio, learning rate, GAE lambda) ni la composicion del dataset de entrenamiento. Se trata del checkpoint numero 64, descrito como "training checkpoint, not a hash-only variant". El unico artefacto distribuido es el grafo ONNX, por lo que la inferencia se realiza a traves de un runtime ONNX (ONNX Runtime, por ejemplo) y no de un framework de deep learning completo.

## Capacidades

- Control de politica para el evento roller-sprint-2m del simulador Microduck Arena: mapea 61 observaciones a 14 acciones continuas o discretas (no se especifica la naturaleza del espacio de accion).
- Navegacion y sprint de "rollers" a una velocidad de comando de 1.0 m/s, con finalizacion del recorrido de 2 metros.
- Robustez ante variacion de comando: la validacion reporta 64/64 arranques bajo estres de comando.
- Estabilidad de arranque: 128/128 arranques completos en la validacion separada.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento en lenguaje natural ni capacidades multilingues: no es un modelo de lenguaje.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Evaluacion de referencia en Microduck Arena: cargar el ONNX con ONNX Runtime y ejecutar el evento roller-sprint-2m a 1.0 m/s para reproducir el resultado de 2.720 segundos y 5/5 finalizaciones. Es adecuado porque el autor documenta la configuracion exacta del evento y el hash del artefacto.
- Baseline en experimentos de RL: usar este checkpoint como punto de partida o comparacion frente a nuevas politicas PPO entrenadas sobre el mismo entorno, dado que es un checkpoint intermedio (64) y no un resultado final.
- Pruebas de estres de comando: emplear las 64/64 ejecuciones bajo estres de comando como referencia para validar la robustez de controladores alternativos ante variaciones de la velocidad objetivo.
- Integracion en pipelines de simulacion por lotes: al ser un grafo ONNX ligero (repo de 0.0 GB), puede ejecutarse en CPU dentro de bucles de evaluacion masiva sin necesidad de GPU.
- Verificacion de integridad de artefactos: el SHA256 publicado permite comprobar que el ONNX desplegado coincide con el checkpoint evaluado, util en entornos de CI que validan binarios de modelos.
- Docencia y demostracion de PPO aplicado a control: sirve como ejemplo concreto de politica entrenada por refuerzo con espacio de observacion y accion bien definidos, aunque sin documentacion de hiperparametros.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Tiempo en evaluador original (comando 1.0 m/s) | 2.720 s | 5/5 finalizaciones |
| Mejor publicado en el mismo evento | 2.570 s | Referencia del autor, no superada |
| Validacion de arranques completos | 128/128 | Validacion separada |
| Arranques bajo estres de comando | 64/64 | Validacion separada |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni son aplicables a este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo se ejecuta en CPU segun la model card (learner nativo sobre CPU/MPS), y el repositorio ocupa 0.0 GB, por lo que la huella es minima.
- GPU recomendadas: no se especifican; el autor menciona soporte de MPS (Apple Silicon) en el entrenamiento. Cualquier GPU compatible con ONNX Runtime CUDA o CoreML seria suficiente, pero no hay datos de rendimiento.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del repositorio y el caracter de controlador del artefacto, aunque no se documenta el numero de parametros ni el coste por inferencia.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, CoreML/MPS), o cualquier runtime compatible con ONNX; no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dfreq-roller-ppo064-20261103 | no disponible | 61 observaciones de entrada | 2.720 s, 5/5 finalizaciones | no disponible | Hugging Face, ONNX |
| Mejor publicado en roller-sprint-2m (sin identificar) | no disponible | no disponible | 2.570 s | no disponible | no disponible |
| Otros checkpoints PPO del mismo autor | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para comparar con alternativas de la misma categoria mas alla de la referencia de 2.570 segundos citada por el autor.

## Limitaciones y advertencias

- Especificidad extrema: la politica solo es valida para el evento roller-sprint-2m de Microduck Arena con velocidad de comando 1.0 m/s; fuera de ese entorno las 61 observaciones y 14 acciones carecen de significado.
- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no soporta tool calling ni agentes.
- Licencia no declarada: no se especifican terminos de uso, lo que impide confirmar si el uso comercial esta permitido; debe contactarse con el autor antes de cualquier despliegue productivo.
- Sin documentacion de arquitectura ni hiperparametros: no es posible auditar el entrenamiento ni reproducirlo a partir de la informacion publicada.
- Resultado no competitivo segun el propio autor: 2.720 s frente al mejor publicado de 2.570 s; se describe como "daily-run candidate", no como record ni candidato a podio.
- Riesgo de sobreajuste al evaluador local: la validacion separada (128/128 y 64/64) es del propio autor y no ha sido replicada de forma independiente.
- Ausencia de datos de sesgo, alucinacion o comportamiento fuera de distribucion: no aplican las metricas habituales de modelos generativos, pero tampoco se documenta el comportamiento del controlador ante condiciones no vistas.
- Trazabilidad limitada: solo se garantiza la integridad del ONNX mediante el SHA256 publicado; no hay garantia sobre el proceso de entrenamiento mas alla de la declaracion del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/djduecaster/dfreq-roller-ppo064-20261103
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
