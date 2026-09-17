# jaehyunkang/pi05-real-workbench-preset-2view-layout-reconstruction-60k

## Resumen

Pi0.5 Real Workbench — preset-2view-layout-reconstruction-60k es una política robótica entrenada por el usuario de HuggingFace jaehyunkang mediante ajuste fino del modelo base lerobot/pi05_base, un modelo de visión-lenguaje-acción (VLA) de la familia Pi0.5. El checkpoint final corresponde a 60.000 pasos de optimización sobre el dataset Myungkyu/real_workbench-preset-gemini y está especializado en una única tarea: la reconstrucción de la disposición de objetos (layout reconstruction) sobre un banco de trabajo real.

El modelo consume dos vistas de cámara (exterior y muñeca), un vector de estado de 8 dimensiones y una instrucción de subtarea en texto por fotograma, y produce acciones delta de efector final de 7 dimensiones (6 de velocidad cartesiana más gripper). Los pesos se distribuyen en formato safetensors, ocupan 4.143.404.816 parámetros y el repositorio completo pesa 24,5 GB, incluyendo los estados de reanudación de entrenamiento.

Su relevancia es acotada pero clara: es un ejemplo reproducible de ajuste fino de un modelo VLA sobre una tarea de manipulación concreta, con hiperparámetros documentados (batch global 32, 2 GPU, semilla 42, horizonte de acción 50, 10 pasos de denoising) y sin métricas de evaluación en robot real declaradas. No es un modelo de propósito general ni un lanzamiento oficial de Physical Intelligence.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en Pi0.5; planificador derivado de PaliGemma (referencia de tokenizer: google/paligemma-3b-pt-224). Detalles internos de capas no disponibles |
| Parametros totales | 4.143.404.816 (segun safetensors) |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible; el modelo procesa imagenes 224x224 y una instruccion de tarea por fotograma, sin ventana de contexto de texto declarada |
| Tipos de cuantizacion | No se declaran cuantizaciones oficiales; pesos distribuidos en precision completa (safetensors). No hay GGUF ni cuantizaciones de terceros publicadas |
| Idiomas soportados | No disponibles; las instrucciones de tarea son texto y no se declara cobertura multilingue |
| Licencia | No disponible |
| Formato de pesos | Safetensors (raiz del repositorio), mas configuracion de politica, preprocesado/postprocesado y estados de normalizacion en JSON; estados de reanudacion en training_state/ |

## Arquitectura y entrenamiento

Se trata de un ajuste fino del modelo base lerobot/pi05_base, que la model card identifica con la familia Pi0.5. La referencia del tokenizer apunta a google/paligemma-3b-pt-224 (revision de entrenamiento 35e4f46485b4d07967e7e9935bc3786aad50687c), lo que sitúa la parte de vision-lenguaje sobre PaliGemma. La model card no detalla el numero de capas, el mecanismo de atencion ni el tamano del experto de acciones, por lo que esos datos figuran como no disponibles.

El entrenamiento se realizo con la implementacion RLWRLD/hiwrld-ll-policy, una version vendorizada de LeRobot Pi0.5, durante 60.000 pasos de optimizacion con batch global de 32, 2 GPU y semilla 42. Las entradas son dos vistas (exterior y muñeca) almacenadas a 224x126 y rellenadas a 224x224, un estado de 8 dimensiones y una instruccion de subtarea extraida de un parquet por fotograma. La salida es un chunk de acciones de horizonte 50 con 7 dimensiones (delta EEF: 6 de velocidad cartesiana mas gripper) y 10 pasos de denoising en inferencia, lo que sugiere un esquema de generacion de acciones por difusion o flow matching. No se declara uso de RLHF ni DPO; es aprendizaje por imitacion supervisado sobre demostraciones.

Una peculiaridad relevante es que los campos de entrada son personalizados respecto al LeRobot estandar: la propia model card advierte de que pueden requerir la implementacion compatible concreta. Los pesos de politica, configuracion, preprocesado/postprocesado y normalizacion estan en la raiz del repositorio, y las rutas especificas de maquina se eliminaron de los metadatos JSON.

## Capacidades

- Manipulacion robotica de mesa: genera comandos de efector final en el espacio delta EEF de 7 dimensiones a partir de observaciones visuales y de estado.
- Reconstruccion de layout: reorganiza objetos sobre un banco de trabajo para reproducir una disposicion objetivo, que es la unica tarea (task scope: layout-reconstruction) para la que fue entrenado.
- Percepcion con dos vistas: combina una camara exterior y una camara de muñeca, lo que reduce el impacto de oclusiones durante el agarre.
- Generacion de chunks de acciones: emite secuencias de 50 acciones por inferencia con 10 pasos de denoising, lo que permite ejecutar tramos de trayectoria sin re-planificar en cada paso de control.
- Condicionamiento por instruccion textual: acepta el texto de subtarea por fotograma como entrada de politica, lo que permite variar el objetivo dentro del repertorio aprendido.
- Control de gripper: la septima dimension de la accion corresponde al gripper, asumiendo un efector de apertura/cierre simple.
- No se declaran capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni modo de pensamiento. Es una politica de control, no un asistente conversacional.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Reconstruccion de la disposicion de un banco de trabajo: el modelo observa la mesa mediante las camaras exterior y de muñeca y reordena las piezas hasta alcanzar la configuracion de referencia. Es el caso para el que fue entrenado explicitamente.
- Preparacion de kits y bandejas de componentes: en una celda de montaje, el brazo repone piezas en sus huecos segun una plantilla fija, usando el chunk de 50 acciones para encadenar varios agarres sin paradas intermedias.
- Recogida y clasificacion de objetos dispersos: con la vista de muñeca como cierre del lazo, el modelo puede reubicar objetos desordenados en posiciones definidas, reduciendo la dependencia de una vista cenital unica.
- Automatizacion de celdas de laboratorio o taller con tareas repetitivas de ordenacion: el condicionamiento por instruccion textual permite seleccionar la subtarea concreta a ejecutar dentro del flujo de trabajo.
- Generacion de rollouts para simulacion y evaluacion comparativa: al ser una politica completa con normalizacion y configuracion incluidas, sirve como baseline para medir otras politicas sobre el mismo dataset y la misma tarea.
- Reproduccion de experimentos de ajuste fino de modelos VLA: los estados de reanudacion en training_state/ y los hiperparametros documentados (60.000 pasos, batch 32, 2 GPU, semilla 42) permiten replicar o continuar el entrenamiento con rutas de dataset locales.
- Investigacion en aprendizaje por imitacion con multiples vistas: la configuracion de dos camaras a 224x126 con relleno a 224x224 es un punto de partida util para estudiar el efecto del numero de vistas en tareas de manipulacion.
- Demo de integracion LeRobot: al estar etiquetado como libreria lerobot y publicar pesos, configuracion y normalizacion en la raiz, puede cargarse como politica de referencia en pipelines de LeRobot para brazos de 7 grados de libertad con gripper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que se trata de un checkpoint entrenado y no de un resultado de evaluacion, y que no se reclama ninguna metrica de evaluacion en robot real. No hay datos de MMLU, HumanEval, GSM8K ni de tasas de exito en tareas de manipulacion.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir del recuento de parametros de safetensors, no confirmadas por el autor):
  - bf16/fp16: en torno a 8,3 GB solo de pesos, mas activaciones y memoria del codificador visual; presupuesto practico aproximado de 10 a 12 GB.
  - fp32: en torno a 16,6 GB solo de pesos.
  - int8 (no publicada): en torno a 4,1 GB.
  - int4 (no publicada): en torno a 2,1 GB.
- GPU recomendadas: no hay recomendaciones del autor. Por tamano, GPU con 16 GB o mas de VRAM en bf16; A100, H100 o L40S para despliegue multisesion. Para entrenamiento o ajuste fino, la model card documenta 2 GPU con batch global 32.
- Cabe en GPU de consumo: si, previsiblemente en RTX 4090, RTX 3090 o RTX 4080 de 16 GB en bf16, siempre que el runtime permita el relleno a 224x224 y el chunk de 50 acciones. No hay confirmacion oficial.
- Opciones de despliegue: la libreria declarada es lerobot, con implementacion de referencia RLWRLD/hiwrld-ll-policy (LeRobot Pi0.5 vendorizado). Los campos de entrada personalizados pueden no funcionar con el LeRobot estandar, por lo que se debe usar la implementacion compatible. No hay soporte declarado para vLLM, TGI, llama.cpp ni Ollama, y al no haber GGUF esas rutas no son viables.
- Latencia y throughput: no disponibles. La inferencia requiere 10 pasos de denoising por chunk de 50 acciones, lo que condiciona la frecuencia de control efectiva, pero no se publican mediciones.
- Almacenamiento: 24,5 GB de repositorio, incluyendo los estados de reanudacion de entrenamiento.

## Comparativa con modelos similares

No se han encontrado en la busqueda web modelos comparables ni datos de terceros; los resultados de busqueda recibidos no guardan relacion con el modelo. La comparacion siguiente se limita a lo declarado en la informacion disponible.

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jaehyunkang/pi05-real-workbench-preset-2view-layout-reconstruction-60k | 4.143.404.816 | Chunk de 50 acciones, 10 pasos de denoising | layout-reconstruction con 2 vistas | No disponible | Publicado en HuggingFace, 0 descargas y 0 likes |
| lerobot/pi05_base | No disponible | No disponible | Politica VLA generalista (modelo base) | No disponible | Publicado en HuggingFace |
| Otros modelos VLA de manipulacion | No disponible | No disponible | No disponible | No disponible | No disponibles en la informacion proporcionada |

## Limitaciones y advertencias

- Especializacion extrema: el alcance declarado es una unica tarea (layout-reconstruction) sobre un dataset concreto. Fuera de ese dominio y de esa distribucion de escenas, el comportamiento no esta caracterizado.
- Sin evaluacion en robot real: la model card afirma explicitamente que no se reclaman metricas de evaluacion en robot real. No hay evidencia publicada de tasa de exito.
- Licencia no disponible: al no declararse licencia, no hay autorizacion explicita de uso comercial y el riesgo legal para produccion es alto.
- Dependencia de implementacion: los campos de entrada son personalizados y pueden requerir la implementacion RLWRLD/hiwrld-ll-policy. Cargar el modelo con el LeRobot estandar puede fallar o producir resultados incorrectos.
- Dependencia de la normalizacion: los estados de normalizacion incluidos estan calculados sobre el dataset de entrenamiento; su reutilizacion en otro entorno o con otro hardware de captura degradara el rendimiento.
- Sobreajuste al dominio: entrenado durante 60.000 pasos sobre un unico dataset con 2 vistas fijas (exterior y muñeca) y un unico montaje de trabajo. Cambios de camara, iluminacion, fondo o utillaje no estan cubiertos.
- Requisito de instruccion por fotograma: para modelos de subtarea hay que aportar el texto de subtarea del parquet correspondiente; sin esa entrada el condicionamiento es incorrecto.
- Reproducibilidad limitada: las rutas especificas de maquina se eliminaron de los metadatos JSON, por lo que reanudar el entrenamiento exige aportar rutas locales de dataset y salida.
- Riesgo de alucinacion en el sentido habitual del termino: no aplica de forma directa, pero si existe riesgo de acciones fisicamente invalidas o inseguras cuando la observacion se aleja del dominio de entrenamiento.
- Sesgos conocidos: no documentados por el autor. Cualquier sesgo estaria heredado del dataset de demostraciones y del modelo base.
- Adopcion nula: 0 descargas y 0 likes, sin reportes de terceros que validen el checkpoint.
- Uso en produccion: no recomendado sin una evaluacion propia en el robot objetivo, incluyendo limites de seguridad y parada de emergencia a nivel de controlador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaehyunkang/pi05-real-workbench-preset-2view-layout-reconstruction-60k
- Dataset de entrenamiento: https://huggingface.co/datasets/Myungkyu/real_workbench-preset-gemini
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Tokenizer de referencia: https://huggingface.co/google/paligemma-3b-pt-224
- Implementacion de entrenamiento citada: RLWRLD/hiwrld-ll-policy (LeRobot Pi0.5 vendorizado); URL no disponible en la informacion proporcionada
- Manifiesto de artefactos: artifact_manifest.json en la raiz del repositorio (tamanos y hashes SHA-256)
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente paginas de soporte de YouTube y listados de bicicletas YT Industries, sin relacion con el modelo)
