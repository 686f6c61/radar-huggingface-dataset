# DexSteer/dp_pour_cup_hold_abs_ee_compat

## Resumen

DexSteer/dp_pour_cup_hold_abs_ee_compat es un checkpoint de política visomotora basada en difusión (Diffusion Policy) publicado por el usuario DexSteer y adaptado para cargarse con lerobot 0.4.4 sin modificaciones. Se trata de una copia del checkpoint de entrenamiento `dp_isaaclab_ur7e_3task_abs_ee/pour_cup_hold` de DexSteer, en la que se han conservado los pesos y los procesadores byte a byte y se ha reescrito únicamente el `config.json`, porque el original incluía campos exclusivos del fork de DexSteer que la clase `DiffusionConfig` de lerobot estándar rechaza.

El modelo resuelve una tarea concreta de manipulación robótica: verter y sostener un vaso («pour_cup_hold»), con acciones expresadas en pose absoluta del efector final (sufijo `abs_ee`). El nombre del checkpoint de origen indica que se entrenó en Isaac Lab sobre un brazo UR7e y que cubre tres tareas, si bien la model card no documenta el conjunto de datos, el número de demostraciones ni el protocolo de entrenamiento.

Con 278.928.794 parámetros y 1,1 GB de repositorio, es un modelo de tamaño medio, orientado a inferencia en tiempo real sobre una GPU local, no a despliegue en servidor de gran escala. Su relevancia es de nicho pero práctica: elimina la fricción de compatibilidad entre un checkpoint entrenado con un fork de lerobot y la versión estándar de la librería, un problema habitual al reproducir experimentos de imitación.

Advertencia importante de uso: la variante `_compat` está pensada para un pipeline que pre-redimensiona las imágenes de cámara a 224x224 antes de enviarlas (recorte identidad). El `config.json` declara `crop_shape: [224, 224]` y ninguna `resize_shape`. Emplear la variante equivocada en el otro pipeline provoca un recorte central de un parche de 224 píxeles y un éxito cercano a cero, según la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (politica visomotora generativa por difusion), implementada como `lerobot.policies.diffusion.modeling_diffusion.DiffusionPolicy`; detalle del backbone no disponible |
| Parametros totales | 278.928.794 (278,9 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; la condicion de entrada es una pila de observaciones de camara y estado) |
| Tipos de cuantizacion | No disponible (solo se documenta el formato de pesos safetensors) |
| Idiomas soportados | No aplica / no disponible (modelo de control robotico sin interfaz de lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | safetensors (con procesadores y `config.json` en el repositorio) |
| Compatibilidad | lerobot 0.4.4 sin modificaciones |
| Tamano del repositorio | 1,1 GB |
| Tarea declarada | `pour_cup_hold` (verter y sostener un vaso) |
| Tipo de accion | Pose absoluta del efector final (`abs_ee`) |
| Entrada de imagen esperada | 224x224 ya redimensionada por el cliente; `crop_shape: [224, 224]`, sin `resize_shape` |

## Arquitectura y entrenamiento

El modelo implementa una Diffusion Policy: en lugar de regresar directamente una accion, aprende una distribucion sobre secuencias de acciones mediante un proceso de difusion condicionado por las observaciones (imagenes de camara y estado del robot). En inferencia, la accion se obtiene por muestreo iterativo con denoising, lo que permite modelar multimodalidad en las demostraciones (varias formas validas de ejecutar la misma tarea) a costa de un mayor coste computacional por paso de control. La implementacion concreta es la de la libreria LeRobot, cargable mediante `DiffusionPolicy.from_pretrained`.

El checkpoint procede de la ruta de entrenamiento `dp_isaaclab_ur7e_3task_abs_ee`, lo que indica, a partir de la nomenclatura, entrenamiento en Isaac Lab sobre un brazo UR7e, tres tareas y control en espacio de efector final absoluto. La model card no especifica el numero de tokens o transiciones de entrenamiento, la composicion del dataset (teleoperacion, demostraciones humanas o datos sinteticos), ni si se aplicaron etapas de ajuste tipo RLHF o DPO, por lo que estos datos deben considerarse no disponibles. La innovacion tecnica documentada por el autor no es algorítmica sino de empaquetado: se ha reescrito exclusivamente el `config.json` para eliminar campos propios del fork de DexSteer, manteniendo pesos y procesadores sin cambios, de modo que el checkpoint es reproducible en lerobot 0.4.4 estándar.

## Capacidades

- Generacion de secuencias de acciones de manipulacion robotica mediante difusion, condicionadas por observaciones visuales y de estado.
- Control en pose absoluta del efector final (`abs_ee`), en lugar de comandos incrementales o de par.
- Ejecucion de la habilidad `pour_cup_hold`: verter y sostener un vaso.
- Cobertura de tres tareas segun el nombre del checkpoint de origen (las otras dos no estan detalladas en la model card).
- Procesamiento de imagenes de camara a 224x224 con recorte identidad, en la variante `_compat`.
- Carga directa como politica de LeRobot 0.4.4, con `config.json` y procesadores incluidos en el repositorio.
- No soporta tool calling, function calling ni uso como agente de texto: carece de interfaz de lenguaje.
- No dispone de capacidades multilingues, de vision general (captioning, VQA) ni de audio.

## Casos de uso

- Control de un brazo UR7e para la tarea de verter y sostener un vaso: es el uso directo del checkpoint; se carga con `DiffusionPolicy.from_pretrained` y se alimenta con imagenes pre-redimensionadas a 224x224 y el estado del robot.
- Reproduccion de experimentos de imitation learning: al ser compatible con lerobot 0.4.4 sin parches, permite repetir la evaluacion de un checkpoint entrenado en un fork sin tocar el entorno del usuario.
- Punto de partida para ajuste fino (fine-tuning) en tareas de manipulacion similares: sus 278,9 M de parametros caben en una GPU de gama alta de consumo, lo que hace viable reentrenar con un conjunto de demostraciones propio.
- Evaluacion comparativa de politicas de difusion frente a otras familias de politicas de LeRobot bajo el mismo protocolo de inferencia y el mismo bucle de control.
- Validacion de pipelines de vision en robotica: sirve para comprobar experimentalmente el impacto del preprocesado de imagen (`resize` frente a `crop_shape`), ya que la model card documenta que la variante incorrecta reduce el exito a cerca de cero.
- Integracion en un stack de control en tiempo real basado en LeRobot, con el modelo como nodo de inferencia que publica acciones de efector final absolutas.
- Docencia y estudio de Diffusion Policy: permite inspeccionar pesos y procesadores reales de una politica de difusion entrenada, sin depender de reimplementaciones.
- Pruebas de regresion de compatibilidad al actualizar lerobot: sirve como caso de carga válido para detectar roturas en `DiffusionConfig` o en el cargador de safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, numero de demostraciones, ni comparaciones cuantitativas. El unico dato de rendimiento mencionado es cualitativo: usar la variante incorrecta respecto al preprocesado de imagen del cliente produce un exito cercano a cero.

## Requisitos de hardware

- VRAM estimada: en fp32 los pesos ocupan aproximadamente 1,1 GB (coincide con el tamano del repositorio); en fp16 o bf16, alrededor de 0,56 GB. A ello hay que sumar activaciones, buffers de CUDA y el coste del muestreo por difusion; como orden de magnitud, un despliegue practico requiere del orden de 2 a 4 GB de VRAM (estimacion derivada del recuento de parametros, no de mediciones publicadas).
- GPU recomendadas: no hay requisitos oficiales publicados. Por tamano, una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090 son suficientes en terminos de memoria; una A100 o H100 solo se justifican por concurrencia o por entrenamiento.
- Cabe en GPU de consumo: si, con margen amplio, dado que el modelo ronda los 279 M de parametros. Es previsible que tambien funcione en CPU, aunque no se han publicado latencias y el muestreo por difusion penaliza la inferencia sin aceleracion.
- Opciones de despliegue: LeRobot 0.4.4 con PyTorch es la via documentada (`DiffusionPolicy.from_pretrained`). vLLM, TGI, llama.cpp y Ollama no aplican, al no tratarse de un modelo de lenguaje. No se documenta exportacion a ONNX, TensorRT ni TorchScript.
- Latencia y throughput: no disponibles. En una politica de difusion, la latencia depende criticamente del numero de pasos de denoising y del numero de acciones generadas por llamada, valores que no se detallan en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DexSteer/dp_pour_cup_hold_abs_ee_compat | 278,9 M | No aplica | Manipulacion robotica (pour cup hold), acciones en pose absoluta del efector final | No disponible | HuggingFace, compatible con lerobot 0.4.4 |
| Otras politicas del ecosistema LeRobot (por ejemplo, ACT o SmolVLA) | No disponible en la informacion proporcionada | No aplica | Manipulacion robotica | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| Diffusion Policy original (referencia bibliografica) | No disponible en la informacion proporcionada | No aplica | Manipulacion robotica | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

No se dispone de datos verificables de parametros, contexto o rendimiento de las alternativas dentro de la informacion proporcionada; la unica cifra contrastada es el recuento de parametros de este checkpoint (278.928.794, leido de los safetensors). La comparacion relevante en la practica es funcional: frente a otras politicas del mismo ecosistema, la particularidad de este repositorio es su compatibilidad garantizada con lerobot 0.4.4 y la distincion explicita entre variantes de preprocesado de imagen.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir permiso de uso comercial. Es necesario contactar con el autor antes de cualquier despliegue en produccion.
- Riesgo de fallo por desajuste de preprocesado: la variante `_compat` espera imagenes ya redimensionadas a 224x224 (recorte identidad). Si el cliente aplica un recorte central de 224 pixeles, el exito cae a cerca de cero segun la propia model card.
- Ausencia total de evaluacion publicada: no hay tasas de exito, curvas de aprendizaje ni comparaciones con lineas base, por lo que no es posible estimar su robustez real.
- Especificidad de encarnacion y escena: el checkpoint esta asociado a un UR7e y a una tarea concreta; no hay evidencia de generalizacion a otros brazos, camaras, iluminaciones o disposiciones de objetos.
- Brecha sim a real no documentada: el nombre del checkpoint de origen apunta a entrenamiento en Isaac Lab, pero no se detalla si hubo ajuste o evaluacion en hardware real.
- Sin capacidades de lenguaje: no acepta instrucciones en lenguaje natural, no soporta tool calling y no puede integrarse en flujos de agentes conversacionales.
- Sin soporte multilingue ni de vision general: no realiza descripcion de imagenes, VQA ni OCR.
- Sesgos: no disponibles. Al depender de demostraciones de manipulacion, es previsible que herede los sesgos de posicion, apariencia de objetos y condiciones de captura del conjunto de entrenamiento, pero no hay informacion que lo cuantifique.
- Riesgo de alucinacion en sentido estricto: no aplica (no genera texto), pero si puede producir trayectorias de accion no validas fisicamente ante observaciones fuera de distribucion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion por parte de la comunidad.
- Fechas de creacion y actualizacion del repositorio: 2026-09-11 en ambos casos, con apenas 45 segundos de diferencia entre ambas, lo que sugiere una publicacion sin mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DexSteer/dp_pour_cup_hold_abs_ee_compat
- Repositorio de LeRobot (dependencia declarada, version 0.4.4): https://github.com/huggingface/lerobot
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados al modelo en la busqueda web realizada.
