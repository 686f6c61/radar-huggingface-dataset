# castanetnicolas/diffusion_UR5e_BS_64_H_16_TASK_tool_hang_ID_146582

## Resumen

Este repositorio contiene una politica visomotora entrenada con Diffusion Policy, el metodo propuesto por Chi et al. (arXiv:2303.04137) que plantea el control visomotor como un proceso generativo de difusion. En lugar de predecir una unica accion de forma determinista, el modelo aprende la distribucion condicional de secuencias de acciones y muestrea trayectorias suaves y multimodales, lo que resulta especialmente util en tareas de manipulacion con contacto rico. El modelo ha sido entrenado y publicado con LeRobot, la libreria de aprendizaje por imitacion de Hugging Face.

El checkpoint pertenece a la cuenta castanetnicolas, no tiene descargas ni valoraciones en el momento de redactar esta ficha y esta publicado bajo licencia Apache 2.0. Cuenta con 89.331.435 parametros (unos 89,3 millones, segun los pesos en safetensors) y ocupa 0,4 GB en el repositorio. No es un modelo de lenguaje: no tiene ventana de contexto, ni tokenizador, ni capacidades de razonamiento simbolico o tool calling. Su entrada son dos imagenes RGB de 84x84 (vistas sideview y robot0_eye_in_hand) mas un vector de estado propioceptivo de 9 dimensiones, y su salida es un vector de accion de 7 dimensiones.

La relevancia de esta ficha es acotada pero concreta: se trata de un ejemplo reproducible de Diffusion Policy sobre la tarea "tool hang" de RoboMimic, util como referencia para quien quiera comparar metodos de imitation learning, reentrenar la misma tarea con datos propios o auditar el flujo de trabajo de LeRobot de principio a fin. El autor no ha publicado ninguna evaluacion en robot real, de modo que el rendimiento real de la politica no esta cuantificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusion condicionado sobre observaciones; codificadores visuales y red de denoising sobre secuencias de acciones; backbone exacto no detallado en la model card) |
| Parametros totales | 89.331.435 (segun pesos en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje). Horizonte de prediccion de acciones: el nombre del checkpoint sugiere 16 pasos (`H_16`), no confirmado en la model card |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay variantes GGUF ni cuantizadas) |
| Idiomas soportados | no aplica (modelo de robotica; no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Robot objetivo | la model card indica `panda`; el nombre del repositorio menciona `UR5e` (discrepancia no resuelta) |
| Entradas | `observation.state` (9,), `observation.images.sideview` (3, 84, 84), `observation.images.robot0_eye_in_hand` (3, 84, 84) |
| Salidas | `action` (7,) |
| Tamano del repositorio | 0,4 GB |
| Tarea | "Insert the hook into the base to build a frame, then hang the wrench on the hook." |
| Fecha de creacion | 2026-10-02 |

## Arquitectura y entrenamiento

Diffusion Policy modela la generacion de acciones como un proceso de difusion condicionado por las observaciones. En la fase de entrenamiento se anade ruido gaussiano a las secuencias de accion y la red aprende a revertir ese ruido; en inferencia, el modelo parte de ruido puro y aplica varios pasos de denoising para producir una secuencia de acciones coherente, que despues se ejecuta en bucle cerrado sobre el robot. Esta formulacion permite representar distribuciones de accion multimodales, algo que las politicas deterministas tipicas (por ejemplo, regresion directa o ACT) suavizan de forma indeseada. La model card no detalla el backbone concreto (habitualmente una CNN tipo ResNet para las imagenes y una U-Net 1D para la secuencia de acciones en la implementacion de referencia), por lo que ese dato queda como no disponible.

El entrenamiento se realizo con LeRobot 0.6.1 durante 120.000 pasos, con tamano de batch 64, optimizador Adam, tasa de aprendizaje 0,0001 y semilla 1000. Lo que equivale a 7,68 millones de muestras procesadas. El conjunto de datos es `castanetnicolas/robomimic_tool_hang_ph_image84`, con 200 episodios y 95.962 fotogramas a 20 FPS, es decir, aproximadamente 80 minutos de demostraciones teleoperadas sobre la tarea de ensamblaje "tool hang". No se documenta el uso de RLHF, DPO ni tecnicas de refinamiento posteriores, ni el numero de pasos de difusion empleados en inferencia.

## Capacidades

- Control visomotor end-to-end: transforma imagenes RGB y estado propioceptivo en un vector de accion de 7 dimensiones para un manipulador, sin modulos de percepcion o planificacion separados.
- Generacion de trayectorias multimodales: al muestrear de una distribucion de difusion, puede representar varias estrategias validas para una misma observacion.
- Manipulacion con contacto rico: la tarea de entrenamiento (insertar un gancho en una base y colgar una llave) requiere ajuste fino y tolerancia reducida.
- Ejecucion en bucle cerrado: la politica consume observaciones nuevas en cada paso de control, con datos de entrenamiento capturados a 20 FPS.
- Condicionamiento exclusivamente visual y propioceptivo: no acepta instrucciones en lenguaje natural; la tarea esta fijada por el entrenamiento.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica.
- Capacidad especial: modo generativo por difusion, lo que anade coste computacional en inferencia respecto a politicas deterministas.

## Casos de uso

- Reproduccion de referencia en investigacion: sirve como punto de partida para comparar Diffusion Policy con alternativas como ACT o VQ-BeT sobre la misma tarea de RoboMimic, usando el mismo dataset de 200 episodios y la misma configuracion de entrenamiento.
- Reentrenamiento con datos propios: partiendo del comando `lerobot-train` documentado, se puede reentrenar la politica con demostraciones teleoperadas del propio laboratorio manteniendo la misma tarea.
- Auditoria de pipelines de LeRobot: permite validar de extremo a extremo el flujo `lerobot-rollout` y el formato de observaciones de la libreria, util para equipos que esten evaluando su adopcion.
- Fine-tuning de bajo coste: con 89,3 millones de parametros y 0,4 GB de pesos, el ajuste fino cabe en una sola GPU de consumo, lo que lo hace viable en laboratorios con presupuesto limitado.
- Docencia en robotica e imitation learning: el modelo, los datos y la configuracion de entrenamiento estan publicados, lo que permite montar practicas donde el alumnado inspecciona una politica de difusion real.
- Estudio de estrategias de muestreo: permite medir el compromiso entre numero de pasos de difusion, latencia de control y tasa de exito sobre una tarea de contacto, un analisis habitual en la literatura de diffusion policies.
- Prototipado de ensamblaje industrial: la tarea "tool hang" es representativa de operaciones de insercion y encaje, por lo que el modelo puede servir de prueba de concepto antes de invertir en un sistema productivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la frase "No evaluation results have been provided for this policy yet", de modo que no existe tasa de exito medida ni en robot real ni en simulacion.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 357 MB en fp32 y 179 MB en fp16/bf16, calculado a partir de los 89.331.435 parametros. La VRAM total en ejecucion es mayor, porque hay que sumar las activaciones de los codificadores visuales y del bucle de denoising; la cifra exacta no esta disponible.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA y al menos 4 GB de VRAM es suficiente en principio para una politica de este tamano (GTX 1650, RTX 3050, RTX 3060, RTX 4090). El factor limitante no es la memoria, sino el tiempo por paso de denoising.
- Cabe en GPU de consumo: si. Tambien deberia poder ejecutarse en CPU, con latencia mucho mayor y probablemente incompatible con el control a 20 FPS.
- Opciones de despliegue: la via documentada es LeRobot (`lerobot-rollout` y `lerobot-train`) sobre PyTorch. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen del numero de pasos de difusion configurado, del backbone visual y del hardware; el dataset se capturo a 20 FPS, lo que sugiere que la politica deberia poder ejecutarse al menos a esa frecuencia para un control fluido.
- Almacenamiento: 0,4 GB para el repositorio completo.

## Comparativa con modelos similares

| Modelo | Parametros | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|
| diffusion_UR5e_BS_64_H_16_TASK_tool_hang_ID_146582 (este modelo) | 89.331.435 | Diffusion Policy para la tarea tool hang | apache-2.0 | Hugging Face, sin descargas ni evaluaciones publicadas |
| Diffusion Policy original (Chi et al., 2023) | no disponible en la informacion proporcionada | Metodo de referencia; el repositorio aqui es una instancia entrenada con LeRobot | no disponible | Codigo y pesos de referencia en el repositorio de los autores |
| ACT (Action Chunking with Transformers) | no disponible en la informacion proporcionada | Politica de imitation learning determinista basada en transformer, alternativa habitual en LeRobot | no disponible | Integrada en LeRobot |
| Otros checkpoints de `castanetnicolas` (por ejemplo, variantes con otra tarea o semilla) | no disponible en la informacion proporcionada | Misma familia de entrenamientos | presumiblemente apache-2.0 | Hugging Face |

No se dispone de datos verificados de parametros, contexto o rendimiento de las alternativas, por lo que la comparacion cuantitativa no es posible con la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasa de exito publicada, ni en robot real ni en simulacion, lo que impide afirmar que la politica funcione de forma fiable.
- Especializacion extrema: el modelo esta entrenado para una unica tarea, con un unico tipo de robot, dos camaras fijas y un entorno concreto. No generaliza a otras tareas ni a otras disposiciones de camaras.
- Dataset reducido: 200 episodios y unas 80 minutos de grabacion son un volumen modesto, con riesgo de sobreajuste al entorno de recogida de datos.
- Sensibilidad al dominio: cambios de iluminacion, posicion de los objetos, distractores o un robot distinto del usado en el entrenamiento degradan el comportamiento esperado.
- Discrepancia en el tipo de robot: el nombre del repositorio menciona `UR5e` mientras que la model card declara `panda`. Conviene verificar la plataforma real antes de intentar desplegarlo.
- Composicion del vector de estado no documentada: se conoce su forma, 9 dimensiones, pero no la semantica exacta de cada componente, lo que complica la integracion con otros robots.
- Sin capacidades de lenguaje: no acepta instrucciones en lenguaje natural ni admite tool calling, agentes o razonamiento multi-paso. No debe confundirse con un modelo fundacional de robotica.
- Licencia: apache-2.0 permite uso comercial y modificacion con las condiciones habituales de atribucion y aviso de cambios. La licencia del dataset asociado no se especifica en la informacion disponible y deberia comprobarse por separado.
- Coste de inferencia: al ser un modelo de difusion, requiere varios pasos de muestreo por cada prediccion de acciones, lo que penaliza la latencia frente a politicas deterministas del mismo tamano.
- Falta de validacion por la comunidad: cero descargas y cero valoraciones en el momento de la consulta, sin historial de uso que respalde su calidad.
- Los resultados de la busqueda web realizada no guardan relacion con este modelo (contenido sobre escritorios remotos Xfce, RDP y Wayland), por lo que no aportan informacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_64_H_16_TASK_tool_hang_ID_146582
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/robomimic_tool_hang_ph_image84
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/robomimic_tool_hang_ph_image84
- Paper de Diffusion Policy: https://arxiv.org/abs/2303.04137
- Pagina del paper en Hugging Face: https://huggingface.co/papers/2303.04137
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de imitation learning: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
