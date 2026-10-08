# rustinlee/vla_so101_pick-block-tray

## Resumen

`rustinlee/vla_so101_pick-block-tray` es un checkpoint de política robótica de tipo visión-lenguaje-acción (VLA) publicado por el usuario rustinlee en Hugging Face. No es un modelo de lenguaje: es un ajuste fino de `lerobot/smolvla_base` (SmolVLA, paper arXiv:2506.01844) entrenado con LeRobot para una única tarea de manipulación sobre un brazo SO-101 en configuración `so_follower`: recoger un bloque blanco y depositarlo en una bandeja gris a partir de la señal de tres cámaras RGB y del estado articular de 6 dimensiones.

El checkpoint tiene 450.046.176 parámetros (aproximadamente 450 millones) y ocupa 0,9 GB en el repositorio, un tamaño coherente con pesos en precisión de 16 bits y desplegable en hardware de consumo, que es precisamente la propuesta de valor de la familia SmolVLA frente a políticas VLA de 3.000 a 7.000 millones de parámetros. La salida del modelo es un vector de acción de 6 componentes, es decir, consignas de control directo para el brazo.

Su relevancia es práctica y acotada: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación (grabación de datos, entrenamiento con LeRobot, publicación del peso y ejecución en robot real) y como punto de partida para ajustar políticas propias. La model card no incluye resultados de evaluación en robot real, y el repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de SmolVLA (base `lerobot/smolvla_base`); backbone de visión-lenguaje con salida de acciones. Detalles concretos en arXiv:2506.01844 |
| Parámetros totales | 450.046.176 |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible. El modelo no procesa contexto textual largo: consume una instrucción de tarea en lenguaje natural, 3 imágenes de 3×256×256 y un vector de estado de 6 valores |
| Tipos de cuantización | No disponibles en la model card. Pesos distribuidos en safetensors; el tamaño del repositorio (0,9 GB) es coherente con precisión de 16 bits |
| Idiomas soportados | No disponible. El único ejemplo de instrucción está en inglés ("pick up the white block and place it on the grey tray"); no hay datos sobre soporte multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, con ficheros de configuración del pipeline de LeRobot |
| Tipo de robot | `so_follower` (brazo SO-101) |
| Cámaras declaradas | `top`, `left` en la sección de detalles; las entradas listan `observation.images.camera1`, `camera2` y `camera3` |
| Entradas | `observation.state` (6,), `observation.images.camera1/2/3` (3, 256, 256) |
| Salidas | `action` (6,) |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

Este repositorio no introduce una arquitectura nueva: es un ajuste fino supervisado de `lerobot/smolvla_base`. SmolVLA, descrito en el paper arXiv:2506.01844 citado por el autor, es un modelo visión-lenguaje-acción compacto que, según esa fuente, alcanza rendimiento competitivo con un coste computacional reducido y puede desplegarse en hardware de consumo. La información disponible no detalla la composición del dataset de preentrenamiento del backbone, el número de tokens vistos ni si se aplicaron etapas de RLHF o DPO; esos datos deben consultarse en el paper del modelo base.

El entrenamiento de este checkpoint se realizó con LeRobot 0.6.2 sobre el dataset `rustinlee/pick-block-tray-rgb`: 70 episodios, 33.892 fotogramas a 30 FPS y una única tarea ("pick up the white block and place it on the grey tray"). La configuración fue de 30.000 pasos, batch de 48, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. Se trata, por tanto, de aprendizaje por imitación puro sobre demostraciones humanas teleoperadas, sin señales de recompensa ni evaluación de refuerzo.

## Capacidades

- Generación de acciones de control continuo de 6 grados de libertad para un brazo SO-101, a partir de observaciones visuales y propioceptivas.
- Percepción visual multicámara: procesa hasta tres imágenes RGB de 256×256 píxeles simultáneamente.
- Fusión de estado propioceptivo: incorpora un vector de estado de 6 valores junto con la información visual.
- Seguimiento de instrucción en lenguaje natural para una única tarea de pick-and-place (recoger bloque blanco y colocarlo en bandeja gris).
- Manipulación de objetos rígidos en una configuración de escena concreta (posición de cámara, iluminación y fondo del dataset de entrenamiento).
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, tool calling, function calling ni capacidades de agente multi-paso: la salida es exclusivamente un vector de acción.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Automatización de pick-and-place en célula de montaje: la política ejecuta el ciclo completo de recogida y depósito sobre un brazo SO-101 con dos o tres cámaras fijas, con un bucle de control coherente con los 30 FPS del dataset de entrenamiento.
- Base para ajuste fino en tareas propias: al ser un checkpoint ya adaptado al cuerpo `so_follower`, sirve como inicialización para reentrenar con `lerobot-train` sobre un dataset propio con el mismo tipo de robot y número de grados de libertad.
- Banco de pruebas de pipelines de imitation learning: permite comparar configuraciones (número de episodios, tasa de aprendizaje, resolución de cámara) manteniendo constante el modelo base y midiendo cambios en la tasa de éxito.
- Docencia y formación en robótica: el SO-101 es una plataforma de bajo coste y este peso permite reproducir de principio a fin el flujo grabar–entrenar–desplegar con LeRobot en un aula o laboratorio.
- Validación de hardware y calibración de cámaras: ejecutar la política con `lerobot-rollout` sirve para comprobar montaje, puertos, índices de cámara y calibración del brazo antes de entrenar políticas más complejas.
- Recogida y clasificación de piezas pequeñas: con los ajustes oportunos de objeto y bandeja, el mismo esquema de política puede reutilizarse para separar piezas ligeras de una cinta a un contenedor en entornos controlados.
- Referencia para investigación en VLA compactos: sirve para estudiar el compromiso entre tamaño (450 millones de parámetros) y rendimiento en manipulación frente a políticas de miles de millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y que no se han realizado pruebas en robot real (número de intentos, éxitos y tasa de éxito). Tampoco hay datos de latencia, frecuencia de control efectiva ni robustez ante cambios de posición de objetos, iluminación o distracciones.

## Requisitos de hardware

- VRAM estimada: los pesos en 16 bits ocupan aproximadamente 0,9 GB; con los tres búferes de imagen de 3×256×256, el estado y las activaciones, una estimación razonable se sitúa en 2-3 GB de VRAM en inferencia, aunque no hay mediciones publicadas.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, como RTX 3060, RTX 4060, RTX 4070 o RTX 4090. En centro de datos, A100 o H100 no aportan ventaja relevante para un modelo de 450 millones de parámetros orientado a inferencia en bucle de control.
- GPU de consumo: sí cabe con holgura, incluidas GPU de gama de entrada con 4-8 GB. También es viable en CPU y en Apple Silicon vía MPS, aunque sin garantía de alcanzar la frecuencia de control necesaria.
- Despliegue embebido: plataformas tipo NVIDIA Jetson Orin Nano o NX son candidatas naturales por tamaño de modelo, aunque no hay confirmación del autor.
- Opciones de despliegue: el soporte documentado es LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento) sobre PyTorch. No aplican servidores de inferencia de texto como vLLM, TGI u Ollama, porque el modelo no genera lenguaje. No hay información sobre exportación a ONNX o TensorRT.
- Latencia y throughput: no disponibles. Como referencia del entorno, el dataset fue capturado a 30 FPS, lo que implica 33 ms por paso si se quiere replicar esa cadencia, pero no se ha publicado la latencia real de inferencia de esta política en ninguna GPU.

## Comparativa con modelos similares

Los datos de los modelos comparables proceden de su documentación pública y no de la información proporcionada en esta ficha; conviene verificarlos en cada repositorio. No se dispone de comparaciones de rendimiento en una misma tarea para ninguno de ellos.

| Modelo | Parámetros | Tipo | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`rustinlee/vla_so101_pick-block-tray`) | 450 millones | VLA, política de imitación de una tarea | 3 cámaras RGB 256×256 + estado de 6 valores | Apache-2.0 | Hugging Face, 0 descargas |
| `lerobot/smolvla_base` | Aproximadamente 450 millones | VLA base preentrenada | Visión + lenguaje + estado | Apache-2.0 (según repositorio) | Hugging Face |
| OpenVLA | Aproximadamente 7.000 millones | VLA basado en backbone de lenguaje | Imagen única + instrucción | Licencia específica del proyecto, no Apache-2.0 | Hugging Face / GitHub |
| pi0 (Physical Intelligence) | Aproximadamente 3.000 millones | VLA con experto de acciones | Imágenes multicámara + estado + instrucción | Apache-2.0 según el proyecto | Hugging Face / GitHub |
| Octo | 27 millones (small) y 93 millones (base) | Política transformer de propósito general | Imágenes + estado + objetivo | Apache-2.0 | Hugging Face / GitHub |

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: 70 episodios y 33.892 fotogramas para una sola tarea, lo que favorece el sobreajuste a la escena, la iluminación, el fondo y la posición exacta de las cámaras del dataset.
- Ausencia total de resultados de evaluación: no se puede estimar la tasa de éxito ni la robustez de la política con la información disponible.
- Tarea única y en inglés: no hay evidencia de que la política generalice a otras instrucciones, objetos, colores o destinos distintos del entrenado.
- Inconsistencia documental sobre las cámaras: la sección de detalles indica `top` y `left`, mientras que las entradas enumeran `camera1`, `camera2` y `camera3`. Antes de desplegar hay que verificar que los nombres de las claves de observación coinciden con los del entrenamiento, o la política fallará.
- Riesgo físico: es un modelo que emite consignas de control sobre hardware real. Requiere parada de emergencia accesible, límites de par y velocidad, espacio de trabajo despejado y supervisión humana durante las pruebas.
- Sesgos heredados: el backbone de visión-lenguaje del modelo base puede arrastrar sesgos de sus datos de preentrenamiento, que no se detallan en la información disponible. No hay datos sobre sesgos específicos ni evaluación de equidad, poco aplicables a una política de manipulación pero relevantes si se reutiliza el backbone.
- Alucinación: en el sentido generativo no aplica, pero sí existe el equivalente funcional, es decir, acciones plausibles pero incorrectas (agarre en vacío, colisión) cuando la observación se aleja de la distribución de entrenamiento.
- Licencia: el repositorio declara Apache-2.0, lo que permite uso comercial. Aun así, conviene verificar las licencias de todos los componentes del modelo base antes de un despliegue en producto, porque este checkpoint es un derivado.
- Idiomas: la model card especifica que los idiomas no están disponibles; solo se documenta una instrucción en inglés.
- Sin validación de la comunidad: 0 descargas y 0 valoraciones en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rustinlee/vla_so101_pick-block-tray
- Dataset de entrenamiento: https://huggingface.co/datasets/rustinlee/pick-block-tray-rgb
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rustinlee/pick-block-tray-rgb
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (noticias de agencia sobre otros temas), por lo que no se incluye ninguno.
