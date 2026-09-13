# HyeonseokE/smolvla_ablation2_extract_cube_A2_1000_10fps

## Resumen

SmolVLA es una familia de modelos visión-lenguaje-acción (VLA) compactos, disenada para operar políticas robóticas de imitación con costes computacionales reducidos y despliegue viable en hardware de consumo. El repositorio analizado, `HyeonseokE/smolvla_ablation2_extract_cube_A2_1000_10fps`, no es el modelo base original, sino un fine-tuning concreto de `lerobot/smolvla_base` entrenado con la librería LeRobot 0.6.0 sobre un único dataset de demostraciones y para una única tarea robótica: extraer un cubo de un hueco y colocarlo sobre una marca objetivo.

El modelo tiene 450.046.176 parámetros (unos 450 millones, según los pesos safetensors del repositorio) y se distribuye como política de control para el robot `so101_follower`, con entradas de estado articular de dimensión 6 y flujos de cámara de 256x256 píxeles, y salidas de acción de dimensión 6. El repositorio ocupa 0,9 GB y está publicado bajo licencia Apache 2.0.

Su relevancia es doble: por un lado, demuestra el flujo de trabajo de fine-tuning de VLA compactos con LeRobot sobre datasets pequeños (100 episodios, 31.296 frames a 10 FPS); por otro, se trata de un artefacto de ablación experimental (el nombre indica una variante "A2" con semilla 1000), sin métricas de evaluación publicadas ni resultados de éxito reportados, por lo que debe considerarse material de investigación reproducible más que un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA; fine-tuning de `lerobot/smolvla_base` |
| Parametros totales | 450.046.176 (segun pesos safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el repositorio publica pesos en safetensors sin variantes cuantizadas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repositorio de 0,9 GB, libreria `lerobot`) |
| Tipo de robot | `so101_follower` |
| Camaras declaradas | `top`, `left_wrist` |
| Entradas | `observation.state` (6,), tres caracteristicas visuales (3, 256, 256) segun la tabla de la model card |
| Salidas | `action` (6,), `action.radian_urdf0` (6,) |
| Tarea | "Extract the cube from the pocket and place it on the target marker." |
| Pipeline declarado | robotics |
| Fecha de creacion (Hub) | 2026-09-13 |

## Arquitectura y entrenamiento

La model card describe SmolVLA como un modelo visión-lenguaje-acción compacto y eficiente, con rendimiento competitivo a coste computacional reducido y capacidad de despliegue en hardware de consumo, remitiendo al artículo arXiv:2506.01844 para los detalles de método. Este repositorio concreto es un ajuste fino supervisado de la política preentrenada `lerobot/smolvla_base`, realizado con LeRobot 0.6.0, lo que implica un entrenamiento por imitación a partir de demostraciones teleoperadas y no un entrenamiento desde cero. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del corpus del modelo base, ni si se aplicaron etapas de RLHF o DPO.

La configuración de entrenamiento reportada es: 24.450 pasos, tamaño de lote 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. El dataset de fine-tuning (`HyeonseokE/ablation2_extract_cube_A2_10fps`) contiene 100 episodios, 31.296 frames y fue grabado a 10 FPS sobre una única tarea de manipulación. Como innovación técnica destacable dentro de la familia SmolVLA, la model card subraya la eficiencia computacional y la posibilidad de ejecución en hardware asequible, pero no detalla mecanismos adicionales (decodificación especulativa, atención lineal u otros) para esta variante concreta.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones a partir de estado articular y señales visuales para el robot `so101_follower`.
- Ejecución de una tarea específica de pick-and-place: extraer un cubo de un hueco y depositarlo sobre una marca objetivo.
- Política de imitación condicionada por tarea: acepta un campo `--task` en la CLI de rollout de LeRobot, aunque el modelo ha sido ajustado para una única instrucción.
- Fusión multimodal: consume simultáneamente estado propioceptivo (`observation.state`) e imágenes de cámara a 256x256.
- Despliegue en hardware de consumo: el tamaño de 450 millones de parámetros y el repositorio de 0,9 GB permiten inferencia en GPU de gama media, según la propia descripción de SmolVLA.
- Integración con el ecosistema LeRobot: entrenamiento, rollout y publicación en el Hub mediante las herramientas `lerobot-train` y `lerobot-rollout`.
- Generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes multi-paso, audio o modo "thinking": no disponible en la información proporcionada; se trata de un modelo de robótica, no de un modelo de lenguaje de propósito general.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Reproducción de experimentos de ablación: el nombre del repositorio indica que es la variante "A2" con semilla 1000 de un estudio comparativo; sirve para replicar condiciones exactas de entrenamiento (24.450 pasos, lote 64, lr 1e-4) y comparar el efecto de cada factor aislado.
- Fine-tuning de políticas VLA compactas: partiendo de `lerobot/smolvla_base`, este repositorio ejemplifica el flujo completo de ajuste con LeRobot sobre un dataset de 100 episodios, útil como plantilla para equipos que quieran adaptar SmolVLA a sus propias tareas.
- Manipulación pick-and-place en laboratorio: el modelo está entrenado para extraer un cubo de un hueco y colocarlo en una marca; es directamente utilizable en una celda de robot SO-101 para esa tarea concreta.
- Validación de pipelines de datos a 10 FPS: al estar entrenado sobre capturas a 10 FPS, permite estudiar cómo la frecuencia de muestreo afecta a la estabilidad de la política en hardware real.
- Investigación en aprendizaje por imitación con datasets pequeños: 31.296 frames repartidos en 100 episodios constituyen un caso de estudio sobre cuánto dato se necesita para una tarea de precisión.
- Pruebas de despliegue en hardware de consumo: con 450 millones de parámetros, es adecuado para validar latencias y consumo de VRAM en GPUs no profesionales antes de escalar a modelos mayores.
- Comparación de esquemas de representación de acción: las salidas incluyen tanto `action` como `action.radian_urdf0`, lo que permite evaluar conversiones entre espacio de acción directo y URDF.
- Docencia y demostraciones de VLA: el repositorio incluye instrucciones completas de instalación, calibración e inferencia que facilitan montar una demo funcional con un SO-101.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion con la indicacion explicita de que no se han proporcionado resultados de evaluacion para esta politica, y la tabla de exito por tarea aparece vacia en la plantilla original.

| Benchmark | Resultado |
|---|---|
| Tasa de exito en tarea real | No disponible (no reportada por el autor) |
| MMLU, HumanEval, GSM8K u otros | No aplica (modelo de robotica) |

## Requisitos de hardware

- Parametros: 450.046.176, lo que equivale aproximadamente a 1,8 GB en fp32 y a unos 0,9 GB en bf16/fp16 solo para los pesos (calculo derivado del numero de parametros; el repositorio ocupa 0,9 GB).
- VRAM estimada para inferencia: no disponible de forma oficial; con pesos en bf16 y tres flujos de imagen de 256x256 mas el estado articular, es razonable esperar un consumo moderado dentro de GPUs de gama media, pero no hay cifra publicada por el autor.
- GPU recomendadas: no especificadas en la informacion proporcionada. La model card de la familia afirma que SmolVLA puede desplegarse en hardware de consumo.
- Compatibilidad con GPU de consumo: segun la descripcion de SmolVLA, si; el autor no detalla modelos concretos.
- Opciones de despliegue: la via documentada es LeRobot, con el comando `lerobot-rollout` y `--policy.path=HyeonseokE/smolvla_ablation2_extract_cube_A2_1000_10fps`, o bien cargando la politica desde PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a politicas roboticas.
- Latencia y throughput: no disponibles. El unico dato temporal relevante es que los datos de entrenamiento se grabaron a 10 FPS y que el script de rollout admite `--duration` en segundos.
- Requisitos adicionales de hardware robotico: robot `so101_follower`, al menos dos camaras `opencv` configuradas a 640x480 y 30 FPS en el ejemplo de la model card, y nombres de camara que coincidan con las claves de observacion del entrenamiento.

## Comparativa con modelos similares

No se dispone de datos comparativos suficientes en la informacion proporcionada. La unica referencia verificable es el modelo base del que deriva.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `HyeonseokE/smolvla_ablation2_extract_cube_A2_1000_10fps` | 450.046.176 | No disponible | No reportado | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| `lerobot/smolvla_base` (modelo base) | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada | Hugging Face |
| Otros VLA de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Especializacion extrema: la politica esta ajustada a una unica tarea ("Extract the cube from the pocket and place it on the target marker") y a un unico tipo de robot (`so101_follower`); no cabe esperar generalizacion a otras tareas sin nuevo fine-tuning.
- Sin evaluacion publicada: no hay tasa de exito, numero de ensayos ni condiciones de prueba, por lo que se desconoce su fiabilidad real en el mundo fisico.
- Dataset muy pequeno: 100 episodios y 31.296 frames a 10 FPS; riesgo elevado de sobreajuste a posiciones de objetos, iluminacion, fondo y disposicion concretas de la celda de trabajo.
- Dependencia de la configuracion de camaras: los nombres de camara deben coincidir exactamente con las claves de observacion (`observation.images.camera1`, `camera2`, `camera3` segun la tabla de entradas); cualquier cambio de montaje o indice invalida la politica.
- Inconsistencia en la documentacion: la ficha declara dos camaras (`top`, `left_wrist`) mientras la tabla de entradas lista tres caracteristicas visuales de 256x256; conviene verificar el checkpoint antes de desplegarlo.
- Ausencia de datos de sesgo y alucinacion: al no ser un modelo de lenguaje, los riesgos tipicos de sesgo textual o alucinacion no aplican del mismo modo, pero si existe riesgo de acciones erroneas o inseguras fuera de la distribucion de entrenamiento.
- Idiomas: no se declara ningun idioma soportado; el condicionamiento textual se limita a la instruccion de tarea en ingles usada en el entrenamiento.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero la procedencia del modelo base y de los datos de entrenamiento deberia auditarse por separado antes de un despliegue productivo.
- Estado del repositorio: 0 descargas y 0 likes, creado el 2026-09-13; es un artefacto de investigacion sin mantenimiento ni comunidad verificable.
- Ausencia de cuantizaciones: solo se publican pesos safetensors, sin variantes GGUF ni cuantizadas, lo que limita opciones de despliegue en dispositivos con poca memoria.
- Seguridad fisica: cualquier politica de robot debe ejecutarse con limites de par, paradas de emergencia y espacio de trabajo despejado; el modelo no incorpora garantias de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_ablation2_extract_cube_A2_1000_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/ablation2_extract_cube_A2_10fps
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/ablation2_extract_cube_A2_10fps
- Paper de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
