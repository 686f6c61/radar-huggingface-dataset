# castanetnicolas/diffusion_UR5e_BS_64_H_32_TASK_tool_hang_ID_146864

## Resumen

Este repositorio contiene una política de control robótico entrenada con el método Diffusion Policy, publicada por el usuario castanetnicolas a través de la librería LeRobot de Hugging Face. No es un modelo de lenguaje: se trata de un modelo de imitación (imitation learning) que aprende a generar trayectorias de acción a partir de observaciones visuales y de estado, y que está especializado en una única tarea de manipulación de contacto: insertar un gancho en una base y colgar una llave inglesa.

El modelo tiene 89.331.655 parámetros (unos 89,3 M) y un tamaño de repositorio de 0,4 GB, con pesos en formato safetensors. Consume dos flujos de imagen de 256x256 píxeles (`sideview` y `robot0_eye_in_hand`) más un vector de estado de 9 dimensiones, y produce una acción de 7 dimensiones, presumiblemente el comando cartesiano y de pinza del robot. La licencia es Apache 2.0.

Su relevancia es acotada y muy específica: sirve como ejemplo reproducible de entrenamiento de políticas de difusión para manipulación con contacto, y como artefacto demostrativo del ecosistema LeRobot. No se han publicado resultados de evaluación ni métricas de éxito, y el propio autor marca la sección de evaluación como pendiente. Cabe señalar una discrepancia: el identificador del repositorio menciona `UR5e`, pero la model card declara `robot type: panda`, lo que conviene verificar antes de reutilizarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (proceso generativo de difusion aplicado a control visuomotor, segun arXiv:2303.04137); backbone concreto no disponible |
| Parametros totales | 89.331.655 (aproximadamente 89,3 M) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible; la entrada es una observacion fija compuesta por estado `(9,)` y dos imagenes `(3, 256, 256)`. El horizonte de prediccion de acciones no esta documentado |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | no aplicable (politica de robotica; no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma Diffusion Policy, descrito en el articulo arXiv:2303.04137: en lugar de predecir directamente una accion unica, formula el control visuomotor como un proceso generativo de difusion que produce trayectorias de accion multimodales y suavizadas. Este enfoque esta disenado especificamente para tareas de manipulacion con contacto rico, donde el comportamiento optimo suele ser multimodal y las politicas deterministas tienden a promediar modos incompatibles. El backbone exacto (tipo de red denoiser, numero de pasos de difusion, uso de U-Net 1D o transformer) no se detalla en la model card.

El entrenamiento se realizo con LeRobot version 0.6.1 sobre el dataset `castanetnicolas/robomimic_tool_hang_ph_image256`, compuesto por 200 episodios y 95.962 fotogramas a 20 FPS, correspondientes a una tarea simulada de RoboMimic con imagenes a 256x256. La configuracion reportada es de 120.000 pasos de entrenamiento, tamano de lote 64, optimizador Adam, tasa de aprendizaje 0,0001 y semilla 1000. No se indica el numero total de tokens, el volumen de ejemplos procesados, ni si se aplicaron fases de refinamiento tipo RLHF o DPO, algo por otra parte poco habitual en aprendizaje por imitacion robotico. No se documenta ninguna innovacion tecnica adicional propia de este entrenamiento.

## Capacidades

- Generacion de trayectorias de accion: produce una accion de 7 dimensiones por paso de control, adecuada para un brazo robotico con pinza.
- Percepcion visual multimodal: consume simultaneamente una vista lateral (`sideview`) y una vista de muneca (`robot0_eye_in_hand`), ambas a 256x256, lo que aporta informacion global y de contacto cercano.
- Condicionamiento por estado propioceptivo: incorpora un vector de estado de 9 dimensiones (tipicamente posicion y orientacion del efector, y estado de la pinza).
- Manipulacion con contacto: el metodo de difusion esta disenado para tareas de insercion y encaje, como la tarea objetivo de insertar un gancho y colgar una llave.
- Ejecucion en bucle cerrado: la politica opera a la frecuencia del dataset (20 FPS), reevaluando la observacion en cada paso.
- Multimodalidad de comportamiento: la formulacion generativa permite representar varias estrategias validas para la misma observacion.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbolico ni capacidades multilingues, por no ser un modelo de lenguaje.
- No dispone de modo de razonamiento explicito (thinking mode), vision general, audio ni generacion de texto.

## Casos de uso

- Automatizacion de tareas de ensamblaje con encaje: la politica puede ejecutar la secuencia de insertar un gancho en una base y colgar una pieza, una tarea con tolerancias ajustadas donde el metodo de difusion ayuda a generar movimientos suaves y precisos.
- Punto de partida para aprendizaje por imitacion en laboratorio: investigadores pueden reproducir el pipeline de LeRobot con este modelo como referencia para entrenar sus propias politicas de difusion sobre datasets propios.
- Evaluacion comparativa de metodos de control: sirve como baseline de Diffusion Policy frente a otros enfoques (ACT, behaviour cloning) en tareas de RoboMimic con observaciones visuales de 256x256.
- Sustitucion de teleoperacion repetitiva: en una celda robotica que ejecute siempre la misma tarea de insercion, la politica puede automatizar el ciclo y liberar al operador.
- Validacion de infraestructura LeRobot: el comando `lerobot-rollout` documentado permite desplegar y verificar el modelo en un robot real tipo panda, util para probar la cadena de hardware, camaras y calibracion.
- Transferencia con ajuste fino: al tener solo 89 M de parametros, es viable reentrenarlo o ajustarlo en una unica GPU para variantes de la misma tarea (distinta posicion de objeto, iluminacion o utillaje).
- Docencia y demostraciones de robotica con IA: su tamano reducido y licencia permisiva permiten usarlo en cursos y talleres sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion con la nota explicita de que no se han aportado resultados para esta politica, y la tabla de tasa de exito por tarea permanece vacia. No hay datos de MMLU, HumanEval, GSM8K ni equivalentes, ya que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 0,36 GB y en fp16 alrededor de 0,18 GB. Sumando activaciones de dos imagenes de 3x256x256 y los tensores intermedios del proceso de difusion, la huella realista se situa en torno a 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente; por ejemplo RTX 3060, RTX 4060, RTX 3090, RTX 4090, A100, H100. No requiere hardware de gama alta.
- Cabe holgadamente en GPU de consumo: si, en practicamente cualquier tarjeta grafica dedicada de los ultimos ocho anos, e incluso podria ejecutarse en CPU para pruebas no criticas en tiempo real.
- Opciones de despliegue: la libreria LeRobot (`lerobot-rollout` con `--strategy.type=base`) es la via documentada. No se mencionan vLLM, TGI, Ollama ni llama.cpp, que no son aplicables a una politica de robotica con pesos safetensors. El entrenamiento se realiza con `lerobot-train` sobre PyTorch con CUDA.
- Latencia y throughput: no documentados. Como restriccion derivable, el dataset se capturo a 20 FPS, de modo que el bucle de control exige inferencias por debajo de 50 ms por paso si se quiere mantener la frecuencia nominal; la politica de difusion tipicamente necesita varios pasos de denoising, por lo que el coste real depende de la configuracion de muestreo, no especificada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| castanetnicolas/diffusion_UR5e_BS_64_H_32_TASK_tool_hang_ID_146864 | Diffusion Policy (LeRobot) | 89,3 M | Estado (9,) + 2 imagenes 256x256; salida de accion (7,) | apache-2.0 | Hugging Face, 0 descargas |
| ACT (Action Chunking Transformer, LeRobot) | Transformer con prediccion de trozos de accion | no disponible | Estado + imagenes; salida de accion | apache-2.0 (implementacion LeRobot) | Disponible en LeRobot y modelos de la comunidad |
| Behavior cloning basado en MLP | Regresion supervisada directa | no disponible | Estado + imagenes; salida de accion | variable | Implementaciones multiples |
| Otros checkpoints de Diffusion Policy en LeRobot Hub | Diffusion Policy | no disponible por checkpoint | Estado + imagenes; salida de accion | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas para esta tarea concreta, por lo que la comparacion es metodologica y no cuantitativa.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasa de exito ni numero de ensayos, por lo que se desconoce si la politica funciona de forma fiable en la tarea para la que fue entrenada.
- Especializacion extrema: el modelo solo ha sido entrenado para una tarea concreta y no generaliza a otras tareas de manipulacion sin reentrenamiento.
- Discrepancia de plataforma: el identificador del repositorio indica `UR5e`, mientras que la model card declara `robot type: panda`. Debe confirmarse el robot objetivo antes de desplegarlo, ya que el espacio de acciones y la cinematica difieren.
- Dependencia del entorno de entrenamiento: al proceder de un dataset RoboMimic con imagenes de 256x256, es probable que sea sensible a cambios de iluminacion, posicion de objetos, camaras o utillaje respecto a las condiciones de recogida de datos.
- Riesgo de sobreajuste al dataset reducido: 200 episodios y 95.962 fotogramas son un volumen modesto; cabe esperar degradacion fuera de la distribucion de entrenamiento.
- Sesgos: no se documenta ningun analisis de sesgo. En robotica, el sesgo se manifiesta como preferencia por las trayectorias y posiciones presentes en el dataset y fallo sistematico ante configuraciones no vistas.
- Riesgo de alucinacion en sentido estricto no aplica, pero si existe riesgo de generar acciones fisicamente invalidas o inseguras cuando la observacion se aleja de la distribucion entrenada; se recomienda supervision y limites de seguridad en el robot.
- Idioma: no aplicable, no procesa lenguaje.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se cite convenientemente. No obstante, el aviso de licencia cubre los pesos publicados, no necesariamente el dataset de origen ni el software subyacente.
- Repositorio sin traccion: 0 descargas y 0 likes, sin garantia de mantenimiento ni soporte por parte del autor.
- Produccion: antes de cualquier uso real hay que validar el modelo en banco de pruebas, verificar la correspondencia de las claves de observacion (`observation.images.sideview`, `observation.images.robot0_eye_in_hand`) con las camaras fisicas y anadir paradas de emergencia y limites articulares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_64_H_32_TASK_tool_hang_ID_146864
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/robomimic_tool_hang_ph_image256
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/robomimic_tool_hang_ph_image256
- Articulo Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Entrenamiento de politicas por imitacion: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
