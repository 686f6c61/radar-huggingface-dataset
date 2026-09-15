# Chaenn/act_policy_so101_multitask_test_pnp0908_stack0908_onehot

## Resumen

Este repositorio contiene una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de un único paso de control. El modelo lo publica el usuario Chaenn y se ha entrenado y exportado con LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. Está pensado para el brazo seguidor SO101 (`so_follower`) con dos cámaras, una en la muñeca y otra lateral, ambas a 640x480 y 30 FPS.

El problema que resuelve es la manipulación multitarea con hardware de bajo coste: a partir de demostraciones teleoperadas, la política aprende a ejecutar dos tareas concretas sobre cinco cubos ("coger y colocar cada uno de los cinco cubos dentro del límite negro" y "apilar los cinco cubos formando una torre dentro del límite negro"). El nombre del repositorio indica condicionamiento por tarea mediante codificación one-hot, de modo que un mismo conjunto de pesos atiende las dos tareas.

Técnicamente es un modelo pequeño: 51.670.662 parámetros en formato safetensors, con un repositorio de 0,2 GB. No es un modelo de lenguaje ni un modelo multimodal de propósito general, sino una política visomotora de tiempo real que consume estado proprioceptivo e imágenes y emite comandos de 6 grados de libertad. Su relevancia está en el ecosistema LeRobot: sirve como referencia reproducible de ACT multitaréa sobre un brazo SO101, un montaje habitual en laboratorios y proyectos de robótica de bajo presupuesto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con codificador-decodificador y CVAE (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.670.662 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; consume una observación por paso y predice un chunk de acciones cuyo tamaño no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors, sin variantes GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; solo texto de instrucción de tarea como condicionamiento, segun la CLI de LeRobot) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

Otros datos de la model card: tipo de robot `so_follower`; cámaras `wrist` y `side`; entradas `observation.state` con forma `(8,)`, `observation.images.wrist` con forma `(3, 480, 640)` y `observation.images.side` con forma `(3, 480, 640)`; salida `action` con forma `(6,)`; tamaño del repositorio 0,2 GB. El repositorio se creó el 2026-09-14 y se actualizó el 2026-09-14 según los metadatos del Hub, con 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

ACT se describe en el artículo "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). La arquitectura combina un autocodificador variacional condicional (CVAE) con un transformer: el codificador del CVAE comprime la secuencia de acciones objetivo durante el entrenamiento, y el transformer aprende a predecir chunks de acciones a partir de las observaciones. En inferencia se descarta el codificador y el transformer genera directamente el chunk, que después se ejecuta con ensamblado temporal (temporal ensembling) para suavizar el control. Esta formulación reduce el problema de la varianza entre pasos y permite tasas de éxito altas con datos teleoperados de bajo coste.

El entrenamiento se realizó con LeRobot 0.6.2 durante 150.000 pasos, con tamaño de lote 16, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. El conjunto de datos es `Chaenn/so101_multitask_test_pnp0908_stack0908_onehot`, con 1265 episodios, 2.248.810 fotogramas a 30 FPS (aproximadamente 20,8 horas de demostraciones) y dos tareas declaradas. La model card no documenta composición del dataset más allá de las tareas, ni indica uso de RLHF, DPO u otras fases de ajuste por preferencias, algo que no aplica a este tipo de política. Tampoco se especifica el tamaño del chunk de acciones, la dimensión latente del CVAE ni la política de aumentos de imagen.

## Capacidades

- Control visomotor de manipulación: genera comandos de 6 grados de libertad para el brazo SO101 a partir de estado proprioceptivo de 8 dimensiones y dos vistas de cámara.
- Predicción por chunks de acciones con ensamblado temporal, lo que produce trayectorias más suaves que el control paso a paso.
- Multitarea con un único conjunto de pesos: cubre las tareas de "pick and place" y de apilado de cinco cubos, presumiblemente mediante condicionamiento one-hot de la tarea (según el nombre del repositorio y del dataset).
- Percepción visual con dos cámaras simultáneas (muñeca y lateral) a 640x480 y 30 FPS.
- Aprendizaje por imitación: no requiere recompensas ni simulador, se entrena directamente con demostraciones teleoperadas.
- Inferencia en bucle cerrado en tiempo real mediante `lerobot-rollout`, con la opción de registrar episodios o de ejecutar indefinidamente.
- No soporta tool calling, function calling, agentes basados en lenguaje, razonamiento multi-paso simbólico, matemáticas, código ni procesamiento de audio. No es un modelo de propósito general.

## Casos de uso

- Automatización de pick and place en laboratorio: la política puede colocar cada uno de los cinco cubos dentro del límite negro usando las dos cámaras como única entrada visual, lo que la hace adecuada para demostraciones de manipulación repetitiva con objetos conocidos.
- Apilado de objetos: la segunda tarea entrenada permite construir una torre de cinco cubos dentro de la zona delimitada, un escenario típico para evaluar precisión de colocación y control fino.
- Base de referencia para investigación en aprendizaje por imitación: al estar entrenada con LeRobot 0.6.2 y publicada con safetensors, sirve como punto de comparación reproducible frente a otras políticas ACT, Diffusion Policy u otros métodos.
- Validación de montajes SO101: un laboratorio que monte un brazo SO101 con cámaras de muñeca y lateral puede ejecutar la política para comprobar calibración, cinemática y sincronía de cámaras antes de recoger sus propios datos.
- Docencia y formación en robótica: el flujo `lerobot-train` y `lerobot-rollout` permite mostrar de principio a fin cómo se graban demostraciones, se entrena una política y se despliega en hardware real.
- Reentrenamiento y ajuste con datos propios: el modelo se puede usar como inicialización o como plantilla de configuración para entrenar variantes con nuevos objetos, posiciones o un brazo del mismo tipo.
- Evaluación de robustez: útil para medir degradación ante cambios de iluminación, posiciones nuevas de los cubos, distracciones o ligeras diferencias de calibración entre robots, siempre que se documenten los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye una sección de evaluación explícitamente vacía: "No evaluation results have been provided for this policy yet". No hay tasas de éxito, número de ensayos, ni comparaciones con otras políticas. Tampoco se publican métricas de latencia, frecuencia efectiva de control alcanzada ni consumo de recursos.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 51,67 M de parámetros): unos 207 MB en FP32, unos 103 MB en FP16/BF16 y unos 52 MB en int8. El cuello de botella real no es el modelo, sino el procesamiento de dos flujos de vídeo a 640x480 y 30 FPS.
- GPU recomendadas: cualquier GPU con soporte CUDA razonablemente moderna. Una RTX 3060, RTX 4060 o superior es suficiente para sostener el bucle a 30 Hz; una RTX 4090, A100 o H100 ofrecen margen de sobra y permiten procesar lotes o aumentar resolución.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada de los últimos años. También es viable en GPU integrada o CPU para pruebas puntuales, aunque es improbable mantener los 30 FPS con dos cámaras sin aceleración.
- Alternativas embebidas: una Jetson Orin Nano o Orin NX es un candidato razonable para despliegue en el propio robot, siempre que se valide la latencia real.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path` y `--strategy.type=base`) es la vía documentada. Los servidores de inferencia para modelos de lenguaje (vLLM, TGI, Ollama, llama.cpp) no son aplicables, ya que no es un modelo de lenguaje ni se distribuye en GGUF.
- Latencia y throughput: no disponibles. La model card solo indica la configuración de entrenamiento (150.000 pasos, lote 16), no la frecuencia de control efectiva observada en hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT SO101 multitask (este modelo) | Politica visomotora ACT (CVAE + transformer) | 51.670.662 | no disponible (chunk de acciones sin especificar) | apache-2.0 | Hugging Face, libreria `lerobot` |
| ACT original (Cadene et al., 2023) | Politica visomotora ACT | no disponible | no disponible | no disponible | Paper arXiv:2304.13705 y referencia en LeRobot |
| Diffusion Policy (Chi et al.) | Politica de difusion para manipulacion | no disponible | no disponible | no disponible | Implementaciones publicas en el ecosistema LeRobot |
| SmolVLA (Hugging Face) | Vision-language-action con componente de lenguaje | no disponible | no disponible | no disponible | Hugging Face, libreria `lerobot` |

La comparación cuantitativa no es posible con la información disponible: no se han publicado tasas de éxito ni especificaciones de parámetros para las alternativas en los materiales consultados. La diferencia conceptual principal es que este modelo es una política puramente visomotora y específica de dos tareas, mientras que propuestas como SmolVLA incorporan instrucciones en lenguaje natural para generalizar a tareas nuevas, a costa de un tamaño y unos requisitos mayores.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito, número de ensayos ni condiciones de prueba, por lo que no se puede afirmar qué fiabilidad tiene la política en el mundo real.
- Especificidad del montaje: la política depende de los nombres y el orden exactos de las cámaras (`wrist` y `side`), de la calibración del brazo SO101 y de la frecuencia de 30 FPS. Cualquier cambio en la disposición física degrada el rendimiento.
- Dominio muy estrecho: solo se ha entrenado con cinco cubos, dos tareas y un tipo de robot. No generaliza a objetos, tareas o brazos distintos sin reentrenamiento.
- Cero validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin informes de terceros que confirmen su comportamiento.
- Sesgos de los datos de demostración: al ser aprendizaje por imitación, reproduce las posiciones, trayectorias y posiblemente los sesgos del operador que teleoperó los 1265 episodios (por ejemplo, zonas preferidas de colocación o velocidades concretas).
- Alucinación: el concepto no aplica en el sentido de los modelos de lenguaje, pero sí existe el riesgo equivalente de acciones erráticas o inseguras cuando la observación visual se sale de la distribución de entrenamiento.
- Idioma: no procesa lenguaje natural. El texto de tarea que aparece en la CLI sirve como etiqueta de condicionamiento, no como instrucción libre.
- Licencia: el modelo se publica bajo apache-2.0, permisiva para uso comercial. Conviene verificar por separado la licencia del dataset `Chaenn/so101_multitask_test_pnp0908_stack0908_onehot` antes de reutilizarlo.
- Aviso de producción: el nombre del dataset incluye "test", lo que sugiere un experimento interno más que un artefacto validado. Cualquier despliegue debe ir precedido de una evaluación propia con protocolo de ensayos y medidas de seguridad física en el robot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chaenn/act_policy_so101_multitask_test_pnp0908_stack0908_onehot
- Dataset de entrenamiento: https://huggingface.co/datasets/Chaenn/so101_multitask_test_pnp0908_stack0908_onehot
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Chaenn/so101_multitask_test_pnp0908_stack0908_onehot
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
