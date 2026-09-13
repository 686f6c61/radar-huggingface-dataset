# PruhaNLP/ACT-pickplace-blue-krill-demo

## Resumen

ACT-pickplace-blue-krill-demo es un checkpoint de robotica entrenado con el metodo ACT (Action Chunking Transformer) sobre el robot simulado SO-ARM100 en MuJoCo. Lo publica el usuario PruhaNLP dentro del proyecto RoboSim at Home, y corresponde al ultimo checkpoint (paso 6140) de un entrenamiento de ajuste supervisado (SFT) sobre el dataset PruhaNLP/pickplace-blue-krill-demo. La tarea concreta es recoger la botella de aceite de krill azul y depositarla dentro de la bandeja azul.

El modelo no es un modelo de lenguaje: es una politica visomotora que mapea dos flujos de imagen (camaras `front` y `wrist`) a secuencias de acciones de 50 pasos (chunk size 50). La arquitectura combina un backbone ResNet18 con un decodificador transformer y no acepta instrucciones en lenguaje natural, lo que lo situa en la categoria de policies de imitacion puramente visuales, previas a los modelos VLA.

Su relevancia es practica para investigacion en robotica: con 49.530.822 parametros (~49,5 M) y un repositorio de 0,2 GB, es un checkpoint ligero y reproducible que sirve como linea base de ACT frente a alternativas VLA como el SmolVLA complementario del mismo autor. Esta pensado como demo de simulacion, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer): backbone ResNet18 + decodificador transformer, sin entrada de lenguaje |
| Parametros totales | 49.530.822 (~49,5 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el modelo no procesa texto. Horizonte de accion (chunk size) = 50 pasos |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se declaran variantes GGUF, AWQ o GPTQ) |
| Idiomas soportados | no aplica / no disponible (modelo sin entrada ni salida de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Camaras de entrada | `front`, `wrist` |
| Robot objetivo | SO-ARM100 (simulado en MuJoCo) |
| Checkpoint | paso 6140 (ultimo del entrenamiento SFT) |
| Tamano del repositorio | 0,2 GB |
| Libreria | lerobot |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La arquitectura es ACT (Action Chunking Transformer) en una implementacion personalizada: un backbone convolucional ResNet18 extrae caracteristicas de las dos camaras (`front` y `wrist`) y un decodificador transformer genera bloques de acciones de 50 pasos en lugar de una accion por inferencia. Este esquema de prediccion por trozos reduce el error de acumulacion y mejora la estabilidad frente a politicas que actuan paso a paso. El modelo no incorpora condicionamiento por lenguaje.

El entrenamiento consistio en un ajuste supervisado (SFT, imitacion) sobre el dataset PruhaNLP/pickplace-blue-krill-demo, vinculado al proyecto RoboSim at Home. El autor publica el ultimo checkpoint del run, en el paso 6140, pero no detalla el numero total de episodios, la composicion exacta del dataset, el numero de tokens o muestras procesadas, ni si se aplicaron etapas posteriores de RLHF o DPO. Tampoco se documentan tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de secuencias de accion de 50 pasos (action chunking) para control de un brazo robotico en simulacion.
- Percepcion visual desde dos camaras simultaneas: vista frontal y vista de muneca.
- Ejecucion de una tarea manipulativa especifica: recoger la botella de aceite de krill azul y colocarla en la bandeja azul.
- Control de un SO-ARM100 en el simulador MuJoCo.
- Integracion con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue de politicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso basado en lenguaje.
- No tiene capacidades multilingues: no recibe ni produce texto.
- No dispone de modo de razonamiento (thinking), vision-lenguaje, audio ni generacion de texto.

## Casos de uso

- Linea base de ACT en investigacion: sirve para reproducir y comparar resultados de Action Chunking Transformer frente a otras politicas en la misma tarea de pick-and-place simulada, partiendo de un checkpoint ya entrenado en lugar de entrenar desde cero.
- Recogida de datos en simulacion: el checkpoint puede ejecutar la tarea de forma autonoma en MuJoCo para generar trayectorias adicionales o evaluar la calidad del dataset pickplace-blue-krill-demo antes de ampliarlo.
- Pruebas de simulacion a real (sim-to-real): al estar validado en simulador sobre un SO-ARM100, es un punto de partida para estudiar la transferencia de politicas de imitacion a un brazo fisico de bajo coste.
- Comparacion ACT frente a VLA: el autor publica un SmolVLA complementario para la misma tarea, de modo que este checkpoint permite medir la diferencia de rendimiento entre una politica puramente visual y una condicionada por lenguaje.
- Docencia y prototipado en robotica: con ~49,5 M de parametros y 0,2 GB de pesos, se puede desplegar en un portatil con GPU modesta o incluso CPU para demostraciones de imitacion y action chunking en clase.
- Validacion de pipelines LeRobot: sirve como caso de prueba para verificar la carga de safetensors, la integracion de camaras y el bucle de evaluacion de la libreria antes de escalar a modelos mayores.
- Evaluacion de robustez visual: al depender de las vistas `front` y `wrist`, permite experimentar con cambios de iluminacion, oclusiones o posiciones de camara en simulacion para medir la degradacion de la politica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito (success rate), metricas de error de trayectoria ni comparaciones cuantitativas con otras politicas. Tampoco se documentan latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 200 MB en fp32 (~49,5 M de parametros), ~100 MB en fp16/bf16 y ~50 MB en int8, sin contar activaciones ni los buffers de imagen de las dos camaras. Cabe en cualquier GPU con 2 GB o mas.
- GPU recomendadas: no requiere GPU de datacenter. Una RTX 3060, RTX 4060 o superior es mas que suficiente; A100 o H100 resultan innecesarias para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada e incluso en CPU para inferencia de baja frecuencia, dado el tamano del modelo.
- Opciones de despliegue: libreria LeRobot (PyTorch) para carga y evaluacion, exportacion a ONNX para inferencia optimizada y ejecucion dentro del simulador MuJoCo. No se declaran variantes GGUF ni soporte nativo en Ollama, vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PruhaNLP/ACT-pickplace-blue-krill-demo | 49.530.822 | Chunk size 50; sin contexto de texto | No publicado | apache-2.0 | HuggingFace (0 descargas, 0 likes) |
| PruhaNLP/SmolVLA-pickplace-blue-krill-demo | no disponible | no disponible | No publicado | no disponible | HuggingFace, publicado por el mismo autor |
| Otras implementaciones de ACT sobre SO-ARM100 en LeRobot | no disponible | no disponible | No publicado en la informacion disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de parametros de los modelos comparables en la informacion proporcionada, por lo que la comparacion queda limitada a arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de tarea unica: solo se ha entrenado para recoger la botella de krill azul y colocarla en la bandeja azul. No generaliza a otras tareas sin reentrenamiento.
- Dependencia del entorno: entrenado en MuJoCo sobre SO-ARM100; no hay evidencia publicada de validacion en hardware real.
- Sin condicionamiento por lenguaje: no acepta instrucciones en texto, a diferencia de los modelos VLA.
- Especificidad de objetos y escena: el rendimiento dependera de que el objeto, el color y la disposicion coincidan con los del dataset de entrenamiento.
- Riesgo de fallo por sobreajuste a la distribucion de imitacion, con degradacion ante cambios de iluminacion, oclusiones o posiciones de camara no vistas.
- No es un modelo generativo de texto, por lo que no aplican riesgos de alucinacion linguistica, sesgos de lenguaje ni limitaciones de idioma; los sesgos relevantes serian de tipo perceptivo y de dominio visual.
- Caracter de demo: el repositorio no registra descargas ni likes y la model card es minima, sin detalle de dataset, semillas, hiperparametros ni metricas de evaluacion.
- Licencia apache-2.0: permite uso comercial y modificacion con atribucion, pero la licencia del dataset asociado no se detalla en la informacion disponible.
- Las fechas de los metadatos del repositorio (creado el 2026-09-13) conviene verificarlas antes de citarlas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PruhaNLP/ACT-pickplace-blue-krill-demo
- Dataset de entrenamiento: https://huggingface.co/datasets/PruhaNLP/pickplace-blue-krill-demo
- Modelo complementario SmolVLA: https://huggingface.co/PruhaNLP/SmolVLA-pickplace-blue-krill-demo
- Repositorio del proyecto RoboSim at Home: https://github.com/PruhaNLP/robosim-at-home
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo en la informacion proporcionada.
