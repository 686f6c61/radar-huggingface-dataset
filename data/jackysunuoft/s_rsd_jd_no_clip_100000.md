# JackySunUofT/S_RSD_jd_no_clip_100000

## Resumen

El modelo `JackySunUofT/S_RSD_jd_no_clip_100000` es una política de control visuomotor basada en Diffusion Policy, entrenada con el framework LeRobot de Hugging Face. Diffusion Policy, propuesta en el paper arXiv:2303.04137, trata el control robótico como un proceso generativo de difusión, produciendo trayectorias de acción suaves y multi-paso que destacan en tareas de manipulación con contacto físico. El modelo ha sido entrenado sobre el dataset `JackySunUofT/sim_two_lens_black_tube`, un entorno de simulación con dos lentes y tubo negro, y está diseñado para ser utilizado en robots con el ecosistema LeRobot.

Con 262,8 millones de parámetros y un tamaño de repositorio de 1,1 GB, este modelo se presenta como un checkpoint listo para inferencia o evaluación en tareas de imitación. Su relevancia radica en que ofrece una implementación accesible de Diffusion Policy para la comunidad robótica, permitiendo reproducir y extender resultados de manipulación con contacto sin necesidad de entrenar desde cero. La licencia Apache 2.0 facilita su uso comercial y académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (visuomotor, basada en UNet + difusión) |
| Parametros totales | 262.822.087 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Diffusion Policy modela la política de control como un proceso de denoising por difusión: dado un estado observado (imágenes y/o estados del robot), el modelo genera una secuencia de acciones futuras mediante iteraciones de ruido y denoising. La arquitectura típica incluye un codificador visual (CNN o ViT) y una red UNet temporal que procesa las trayectorias de acción. En este caso, el nombre del modelo sugiere que no se utiliza un clip de texto (no_clip), por lo que la condicionamiento es exclusivamente visual y de estado.

El entrenamiento se realizó con LeRobot, que implementa imitación por comportamiento (behavior cloning) con supervisión de demostraciones. El dataset `sim_two_lens_black_tube` proviene de un entorno simulado, probablemente con dos cámaras y un objeto tubular negro. No se especifican el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO; al ser un modelo de control, es poco probable que se usen dichas técnicas. La innovación principal es la aplicación de difusión al control, que permite generar trayectorias suaves y multimodales, superando a métodos deterministas en tareas de contacto.

## Capacidades

- Generación de trayectorias de acción multi-paso para control robótico, especialmente en manipulación con contacto.
- Condicionamiento visual: procesa imágenes de cámaras (en este caso, dos lentes) para decidir acciones.
- Aprendizaje por imitación: reproduce comportamientos demostrados en el dataset de entrenamiento.
- Integración con LeRobot: compatible con el pipeline de entrenamiento, evaluación y despliegue de LeRobot.
- No incluye capacidades de lenguaje, tool calling ni razonamiento simbólico; es un modelo puramente visuomotor.

## Casos de uso

- Manipulación robótica en simulación: el modelo puede controlar un brazo robótico en entornos simulados para tareas como insertar, empujar o agarrar objetos, aprovechando la generación de trayectorias suaves.
- Aprendizaje por imitación para robots reales: tras entrenar en simulación, se puede transferir a un robot físico (por ejemplo, SO-100) usando LeRobot, reduciendo el tiempo de desarrollo de políticas de control.
- Investigación en Diffusion Policy: sirve como punto de partida para estudiar variantes de difusión en control, comparar con ACT o otras políticas, o analizar el efecto del condicionamiento visual sin texto.
- Evaluación de entornos simulados: permite validar el rendimiento de Diffusion Policy en el dataset `sim_two_lens_black_tube`, sirviendo como referencia para otros modelos.
- Desarrollo de sistemas de teleoperación asistida: el modelo puede generar acciones suaves que complementen la teleoperación humana en tareas delicadas.
- Benchmarking de frameworks de robótica: al estar publicado con LeRobot, facilita la comparación de métricas de entrenamiento e inferencia entre diferentes políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval u otros estándares, ya que se trata de un modelo de control robótico y no de lenguaje o código. Tampoco se proporcionan métricas de éxito en tareas de manipulación.

## Requisitos de hardware

- VRAM estimada: no disponible. Con 262,8 millones de parámetros, una estimación orientativa para inferencia en FP32 sería de aproximadamente 1 GB, pero el tamaño real depende de la resolución de imagen y la longitud de la trayectoria. En la práctica, con cuantización a FP16 o int8 podría caber en GPUs de consumo medio.
- GPU recomendadas: no disponible. Dado el tamaño, una GPU con al menos 4-6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) podría ser suficiente para inferencia, pero no hay confirmación oficial.
- Compatibilidad con consumer GPU: probablemente sí, dado el tamaño moderado, pero no confirmado.
- Opciones de despliegue: LeRobot soporta inferencia en PyTorch con CUDA. También podría exportarse a ONNX o TensorRT, aunque no está documentado. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otros modelos. En el ecosistema LeRobot existen otras políticas como ACT (Action Chunking with Transformers) o VQ-BeT, pero no se han publicado comparaciones con este checkpoint concreto. Se puede afirmar que Diffusion Policy, en general, tiende a superar a métodos deterministas en tareas de contacto, pero sin datos específicos no es posible establecer una tabla comparativa.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse en un entorno simulado específico (`sim_two_lens_black_tube`), el modelo puede no generalizar a otros entornos o configuraciones de cámara.
- Riesgo de alucinación: en control robótico, el equivalente a alucinación sería generar acciones no seguras o irreales; no hay evaluación de seguridad publicada.
- Limitaciones de contexto: no se especifica la longitud de la ventana de observación ni el horizonte de acciones; probablemente esté limitado a secuencias cortas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el dataset de entrenamiento puede tener sus propias restricciones; se debe verificar la licencia del dataset `JackySunUofT/sim_two_lens_black_tube`.
- Caveat para producción: el modelo es un checkpoint de investigación, no validado en robots reales; se recomienda una evaluación exhaustiva en el hardware objetivo antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JackySunUofT/S_RSD_jd_no_clip_100000
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset de entrenamiento: https://huggingface.co/datasets/JackySunUofT/sim_two_lens_black_tube
- Perfil del autor: https://huggingface.co/JackySunUofT
