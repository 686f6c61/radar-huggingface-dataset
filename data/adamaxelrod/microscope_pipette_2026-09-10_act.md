# AdamAxelrod/microscope_pipette_2026-09-10_act

## Resumen

`AdamAxelrod/microscope_pipette_2026-09-10_act` es una politica de robotica entrenada mediante aprendizaje por imitacion con el metodo ACT (Action Chunking with Transformers), publicado por Zhao et al. en 2023 (arXiv:2304.13705) y reimplementado en la libreria LeRobot de HuggingFace. No es un modelo de lenguaje: es una politica visomotora que consume el estado articular del robot y tres flujos de imagen, y produce directamente comandos de accion de 7 dimensiones. El modelo lo publica el usuario AdamAxelrod y esta asociado al robot `meca500_microscope`, un brazo Meca500 instrumentado con camara cenital, camara de muneca y camara de microscopio.

La tarea concreta para la que fue entrenada es `move_pipette_under_microscope`, es decir, colocar y desplazar una pipeta bajo el objetivo de un microscopio. El entrenamiento se realizo sobre un unico dataset de 100 episodios teleoperados y 48.914 fotogramas capturados a 20 FPS, durante 100.000 pasos con AdamW y una tasa de aprendizaje de 1e-5. El modelo tiene 51.669.639 parametros (unos 51,7 M) y se distribuye en safetensors dentro de un repositorio de 0,2 GB bajo licencia Apache 2.0.

Su relevancia actual es doble. Por un lado, es un ejemplo representativo del flujo de trabajo moderno de robot learning: grabar demostraciones teleoperadas con LeRobot, entrenar una politica ACT y desplegarla con un unico comando de CLI. Por otro, sirve como punto de partida reproducible para tareas de micromanipulacion de laboratorio, un dominio donde la automatizacion tiene alto valor y donde las politicas de imitacion ligeras pueden ejecutarse en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual, codificacion de estado y decodificador de acciones con chunking |
| Parametros totales | 51.669.639 (51,7 M) segun el recuento de safetensors |
| Parametros activos | no disponible (no es un modelo MoE; todos los parametros se activan en cada inferencia) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ACT opera sobre un chunk de acciones predicho por paso de inferencia) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas; los pesos se distribuyen en safetensors, presumiblemente en fp32) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se fija con la cadena `move_pipette_under_microscope`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de pipeline | robotics (politica de control, no generativa de texto) |
| Robot objetivo | `meca500_microscope` |
| Camaras de entrada | `overhead_cam` (3, 480, 640), `wrist_cam` (3, 480, 640), `microscope_cam` (3, 360, 640) |
| Entrada de estado | `observation.state`, shape `(6,)` |
| Salida | `action`, shape `(7,)` |
| Libreria y version | LeRobot 0.5.2 |
| Tamano del repositorio | 0,2 GB |
| Frecuencia de captura del dataset | 20 FPS |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que, en lugar de predecir una unica accion por paso, predice un chunk de acciones futuras de una sola vez. Esta formulacion reduce el problema de horizonte temporal y mitiga la varianza en la prediccion de acciones, lo que en la practica se traduce en politicas mas estables y con tasas de exito mas altas que las basadas en prediccion paso a paso. La implementacion de LeRobot combina un codificador de estado de 6 dimensiones, tres torres visuales que procesan las imagenes de las camaras y un transformer que fusiona esas representaciones para emitir el vector de accion de 7 dimensiones. La informacion disponible no detalla el numero de capas, cabezas de atencion ni el backbone visual concreto, por lo que esos datos quedan como no disponibles.

El entrenamiento se realizo exclusivamente sobre el dataset `AdamAxelrod/microscope_pipette_2026-09-10`: 100 episodios, 48.914 fotogramas a 20 FPS y una unica tarea, `move_pipette_under_microscope`. La configuracion registrada en la model card indica 100.000 pasos de optimizacion, tamano de lote 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000, todo ello con LeRobot 0.5.2. No se menciona el uso de RLHF, DPO ni de ningun proceso de alineacion, algo coherente con el paradigma de imitacion supervisada. Tampoco se documenta aumento de datos, ensamblado temporal en inferencia ni tecnicas adicionales mas alla del chunking de acciones propio del metodo.

## Capacidades

- Generacion de acciones de control de 7 grados de libertad a partir de observaciones visomotrices, con prediccion por chunks en lugar de paso a paso.
- Fusion de tres vistas simultaneas (cenital, de muneca y de microscopio) mas el estado articular de 6 dimensiones en una unica representacion de entrada.
- Ejecucion de la tarea de micromanipulacion `move_pipette_under_microscope` sobre un brazo Meca500.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas, sin necesidad de recompensas ni de entorno simulado.
- Despliegue en tiempo real sobre hardware fisico mediante `lerobot-rollout`, con control a la frecuencia del bucle de inferencia.
- Reentrenamiento y ajuste fino con el mismo pipeline (`lerobot-train`) sobre datasets nuevos o ampliados.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible (la politica no planifica de forma simbolica; su "razonamiento" se limita al chunk de acciones).
- Capacidades multilingues: no disponible (no procesa texto).
- Capacidades especiales: entrada visual a resolucion de microscopio (`microscope_cam`, 360x640), lo que permite realimentacion de precision sub-milimetrica en la tarea.

## Casos de uso

- Automatizacion de la tarea de laboratorio descrita: colocar y desplazar una pipeta bajo el objetivo del microscopio con un Meca500. Es el escenario exacto para el que se entreno el modelo y el unico con evidencia directa de entrenamiento.
- Base para ajuste fino en micromanipulacion: al ser una politica ACT ligera y con licencia Apache 2.0, sirve como inicializacion para tareas relacionadas (posicionamiento de muestras, alineacion de portamuestras) usando el mismo robot y una configuracion de camaras equivalente.
- Ciclo de mejora de datos en laboratorio: desplegar la politica, grabar nuevos episodios teleoperados, incorporarlos al dataset y reentrenar con `lerobot-train`, cerrando el bucle tipico de aprendizaje por imitacion.
- Investigacion comparativa en robot learning: usar esta politica como referencia ACT frente a alternativas como Diffusion Policy o modelos vision-language-action, manteniendo fijo el robot y el dataset para aislar la variable del algoritmo.
- Validacion de infraestructura de robotica: comprobar el funcionamiento completo de la pila LeRobot (grabacion, entrenamiento, rollout, visualizacion de dataset) en un caso real de microscopio antes de escalar a otros bancos de laboratorio.
- Prototipado en entornos con hardware modesto: al tener 51,7 M de parametros, la politica puede ejecutarse en una GPU de consumo o incluso en CPU, lo que facilita pruebas exploratorias sin acceso a clusters.
- Inspeccion visual asistida por microscopio: la rama `microscope_cam` permite que el control se guie por la imagen ampliada, util en rutinas donde la precision depende de lo que se observa a traves del objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica (_"No evaluation results have been provided for this policy yet"_). No existen, por tanto, tasas de exito, numeros de ensayos ni metricas comparativas verificables. Cualquier cifra de exito en la tarea `move_pipette_under_microscope` deberia obtenerse ejecutando la politica en el robot real y registrando ensayos y exitos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 207 MB (51.669.639 parametros x 4 bytes) y unos 103 MB en fp16. Sumando activaciones de las tres camaras (480x640, 480x640 y 360x640) y del transformer, la inferencia deberia caber holgadamente por debajo de 2 GB en fp32; se trata de una estimacion aritmetica a partir del recuento de parametros, no de una medicion publicada.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM es suficiente; el modelo no requiere A100 ni H100 para inferencia.
- Cabe en GPU de consumo: si. Practicamente cualquier RTX moderna (serie 20 en adelante) o incluso GPUs integradas con soporte CUDA/PyTorch pueden ejecutar la politica. La CPU tambien es viable para pruebas por su reducido numero de parametros.
- Requisito adicional no computacional: es imprescindible disponer del brazo `meca500_microscope` y de tres camaras configuradas con los nombres y resoluciones exactos del entrenamiento (`overhead_cam` 640x480, `wrist_cam` 640x480, `microscope_cam` 640x360).
- Opciones de despliegue: LeRobot es la via soportada, mediante `lerobot-rollout --strategy.type=base --policy.path=AdamAxelrod/microscope_pipette_2026-09-10_act`. La informacion disponible no menciona integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a una politica de control.
- Latencia y throughput estimados: no disponible. El bucle de control depende del hardware del robot, de la velocidad de las camaras y del tiempo de inferencia; el dataset se capturo a 20 FPS, lo que da una referencia de la frecuencia de control utilizada durante la recogida de datos, no una garantia de rendimiento en despliegue.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `AdamAxelrod/microscope_pipette_2026-09-10_act` | ACT (imitacion, chunking de acciones) | 51,7 M | no disponible (chunk de acciones) | Apache 2.0 | HuggingFace, via LeRobot |
| ACT de referencia (LeRobot, tareas genericas) | ACT | no disponible | no disponible | Apache 2.0 (implementacion) | HuggingFace / GitHub |
| Diffusion Policy (Chi et al., 2023) | Politica generativa basada en difusion | no disponible | no disponible | no disponible en la informacion proporcionada | Publicacion y multiples reimplementaciones |
| SmolVLA y otros modelos vision-language-action | VLA (vision + lenguaje + accion) | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace / LeRobot |

La comparacion cuantitativa no es posible con los datos disponibles: no hay tasas de exito publicadas para esta politica ni cifras homogeneas de las alternativas en la misma tarea y el mismo robot. La diferencia cualitativa principal es que este modelo es una politica monoespecifica de 51,7 M de parametros, mientras que las alternativas VLA incorporan instrucciones en lenguaje natural y tienen un coste computacional muy superior. La ventaja de ACT aqui es el coste de despliegue minimo y la simplicidad del pipeline; su desventaja es la ausencia de generalizacion a instrucciones o tareas no vistas.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasas de exito, numero de ensayos ni condiciones de prueba, por lo que se desconoce el rendimiento real de la politica.
- Especificidad extrema: esta entrenada para una unica tarea (`move_pipette_under_microscope`), un unico robot (`meca500_microscope`) y una unica configuracion de camaras. No generaliza a otras tareas ni a otros brazos sin reentrenamiento.
- Dependencia de la configuracion de sensores: los nombres y las resoluciones de las camaras deben coincidir exactamente con los del entrenamiento; cualquier cambio en encuadre, calibracion o iluminacion puede degradar el comportamiento.
- Dataset reducido: 100 episodios y 48.914 fotogramas limitan la diversidad de posiciones, condiciones de iluminacion y variabilidad de la escena. Se espera sensibilidad a cambios de posicion inicial, distractores o condiciones distintas de las demostradas.
- Riesgo de acciones inseguras: en aprendizaje por imitacion, las desviaciones de la distribucion de entrenamiento pueden producir trayectorias no demostradas. Es imprescindible operar con limites de par, paradas de emergencia y espacio de trabajo acotado.
- Alucinacion: el concepto no aplica en el sentido de generacion de texto, pero si existe el equivalente de predicciones erroneas de accion sin senal de incertidumbre calibrada.
- Idioma: la politica no procesa lenguaje natural; la tarea se pasa como cadena fija, por lo que no hay soporte multilingue ni instrucciones flexibles.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con la obligacion habitual de conservar avisos de licencia y atribucion. No se especifican clausulas adicionales.
- Responsabilidad en produccion: al ser una politica de robotica, su uso en entornos reales exige evaluacion de seguridad propia. La model card no incluye analisis de riesgos ni certificaciones.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Fechas: el repositorio figura creado y actualizado el 2026-09-10, con LeRobot 0.5.2 como version de entrenamiento; conviene verificar compatibilidad con versiones mas recientes de la libreria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AdamAxelrod/microscope_pipette_2026-09-10_act
- Dataset de entrenamiento: https://huggingface.co/datasets/AdamAxelrod/microscope_pipette_2026-09-10
- Paper de ACT (Action Chunking with Transformers): https://arxiv.org/abs/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=AdamAxelrod/microscope_pipette_2026-09-10
