# JayeshJ/ACT_DryRun5EPS_Policy

## Resumen

ACT_DryRun5EPS_Policy es una política de control robótico (no un modelo de lenguaje) desarrollada por el usuario JayeshJ y publicada en Hugging Face. Implementa el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación descrita en el artículo arXiv 2304.13705 que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. La política se ha entrenado íntegramente con la librería LeRobot de Hugging Face y está destinada al robot `so_follower`, dentro del ecosistema de hardware de bajo coste SO-100/SO-101.

El modelo resuelve una tarea concreta de manipulación: "pick up purple pen and place in pencil holder" (coger un bolígrafo morado y colocarlo en un lapicero). Consume como entrada el estado del robot (`observation.state`, vector de 6 dimensiones) y una imagen de cámara (`observation.images.Follower Arm Cam`, tensor 3x480x640), y produce como salida un vector de acción de 6 dimensiones. Con 51.668.614 parámetros y un repositorio de 0.2 GB, se trata de un modelo compacto orientado a inferencia en tiempo real sobre hardware accesible.

Su relevancia es práctica y acotada: sirve como referencia de un pipeline ACT completo (grabación de datos con teleoperación, entrenamiento con LeRobot y despliegue mediante `lerobot-rollout`). Se trata, por el nombre del conjunto de datos (`Dry_Run5EPS`), de una prueba de concepto o "dry run" con solo 5 episodios de entrenamiento, más útil como plantilla reproducible que como política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con CVAE para aprendizaje por imitación |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (consume observaciones por paso temporal, no contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors, presumiblemente en precision completa) |
| Idiomas soportados | no aplicable (la salida son acciones de robot; la tarea se especifica en ingles como cadena de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

El modelo sigue el metodo ACT publicado en el articulo arXiv 2304.13705. Se trata de un transformer que aprende por imitacion a partir de demostraciones teleoperadas y que predice *action chunks* (secuencias cortas de acciones) en lugar de una unica accion por paso. Esta formulacion, segun el metodo original, ayuda a reducir el error de composicion y a producir movimientos mas suaves que el enfoque paso a paso. La politica consume observaciones multimodales: el estado de las articulaciones como vector `(6,)` y una imagen RGB `(3, 480, 640)` de la camara `Follower Arm Cam`, y emite una accion de `(6,)`.

Los datos de entrenamiento provienen del conjunto `JayeshJ/Dry_Run5EPS`: 5 episodios, 2060 fotogramas a 30 FPS, para la unica tarea "pick up purple pen and place in pencil holder". La configuracion de entrenamiento reportada es de 500 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000, usando LeRobot 0.6.0. No se documenta el uso de RLHF, DPO ni ninguna fase de ajuste posterior al entrenamiento supervisado. El carácter reducido del dataset (5 episodios) indica que se trata de un experimento de validacion del pipeline mas que de un entrenamiento exhaustivo.

## Capacidades

- Generacion de acciones de control para robot manipulador de 6 grados de libertad (vector de accion de dimension 6).
- Imitacion de tareas de pick-and-place a partir de demostraciones teleoperadas.
- Percepcion visual: procesa imagenes RGB de 480x640 para condicionar la accion.
- Prediccion por *action chunks*: emite secuencias cortas de acciones en lugar de pasos aislados.
- Integracion con el flujo de trabajo de LeRobot (entrenamiento, rollout y publicacion en el Hub).
- Ejecucion en tiempo real mediante el comando `lerobot-rollout`.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues en el sentido de los modelos de lenguaje: es una politica motora.

## Casos de uso

- Reproduccion de la tarea de pick-and-place: la politica se ejecutaria sobre un brazo `so_follower` para coger el boligrafo morado y dejarlo en el lapicero, usando `lerobot-rollout` con la tarea indicada.
- Plantilla de referencia para nuevos proyectos ACT: sirve como ejemplo completo de politica entrenada y publicada con LeRobot 0.6.0, replicable cambiando dataset y tarea.
- Punto de partida para fine-tuning: al estar en formato LeRobot, puede reentrenarse con mas episodios del mismo dominio para mejorar la tasa de exito.
- Validacion de pipelines de datos: util para comprobar que la grabacion con teleoperacion, el formateo de observaciones y el entrenamiento funcionan de extremo a extremo antes de escalar el dataset.
- Docencia y demostraciones de robotica: permite mostrar el ciclo aprendizaje-por-imitacion -> despliegue en hardware de bajo coste en cursos o talleres.
- Pruebas de calibracion y hardware: sirve para verificar la configuracion de camaras, puertos y cinematica del brazo en un montaje SO-100.
- Base para comparativas internas: al ser reproducida con hiperparametros fijos (500 pasos, batch 8, lr 1e-05, semilla 1000), permite medir el efecto de cambios en datos o configuracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente: "No evaluation results have been provided for this policy yet", y no se aportan tasas de exito en robot real, numero de intentos ni condiciones de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51.668.614 parametros. En precision completa (FP32) los pesos ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer e incluso en CPU, sumando el coste de procesar la imagen 3x480x640.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Tarjetas como RTX 3060, RTX 4090 o superiores ejecutarian la politica sin problemas. No hay datos publicados de latencia por GPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2-4 GB de VRAM, y previsiblemente tambien en CPU para pruebas.
- Opciones de despliegue: `lerobot-rollout` (comando oficial de LeRobot) sobre PyTorch; el entrenamiento se realiza con `lerobot-train`. No aplican herramientas de servido de LLM como vLLM, TGI, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JayeshJ/ACT_DryRun5EPS_Policy | ACT / LeRobot | 51.668.614 | no aplicable | apache-2.0 | Hugging Face |
| ddjapri/act_physical_ai_hack_policy_v1 | ACT / LeRobot | no disponible | no aplicable | no disponible | Hugging Face |
| yaisa5ramriez/act_episodes_test_model | ACT / LeRobot | no disponible | no aplicable | no disponible | Hugging Face |

Las dos alternativas listadas son tambien politicas ACT entrenadas y publicadas con LeRobot, por lo que comparten arquitectura y flujo de despliegue. No se dispone de sus recuentos de parametros, licencias ni resultados de evaluacion, por lo que no es posible una comparacion cuantitativa de rendimiento. Como familia alternativa de politica de imitacion podria considerarse Diffusion Policy, pero no se aportan datos comparativos en la informacion disponible.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: solo 5 episodios y 2060 fotogramas, lo que limita la generalizacion a posiciones de objeto, iluminacion o condiciones distintas a las demostradas.
- Ausencia total de evaluacion: no se reportan tasas de exito, por lo que se desconoce su fiabilidad real en robot.
- Riesgo de sobreajuste a la tarea y al entorno concreto de grabacion; cambios en la disposicion de la escena o en el robot pueden degradar el comportamiento.
- Una unica tarea entrenada ("pick up purple pen and place in pencil holder"): no es una politica generalista y no se espera que realice otras tareas.
- Dependencia del hardware: el robot tipo `so_follower` y la camara `Follower Arm Cam` deben corresponder a la configuracion de entrenamiento; los nombres de las observaciones deben coincidir exactamente.
- No es un modelo de lenguaje: no admite tool calling, agentes, razonamiento ni procesamiento de texto libre; su salida es siempre un vector de accion.
- Licencia apache-2.0: permite uso comercial y modificacion, siempre que se conserven los avisos de licencia correspondientes; no se identifican restricciones adicionales en la informacion disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JayeshJ/ACT_DryRun5EPS_Policy
- Dataset de entrenamiento: https://huggingface.co/datasets/JayeshJ/Dry_Run5EPS
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=JayeshJ/Dry_Run5EPS
- Articulo ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion general de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Politica ACT similar (ddjapri): https://huggingface.co/ddjapri/act_physical_ai_hack_policy_v1
- Politica ACT similar (yaisa5ramriez): https://huggingface.co/yaisa5ramriez/act_episodes_test_model
