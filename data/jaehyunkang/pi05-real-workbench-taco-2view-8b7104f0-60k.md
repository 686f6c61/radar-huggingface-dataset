# jaehyunkang/pi05-real-workbench-taco-2view-8b7104f0-60k

## Resumen

El modelo `jaehyunkang/pi05-real-workbench-taco-2view-8b7104f0-60k` es una política robótica (vision-language-action, VLA) resultado del ajuste fino de `lerobot/pi05_base` sobre el conjunto de datos `Myungkyu/real_workbench-taco-keyframe-gemini`. Lo publica el usuario de HuggingFace jaehyunkang y está pensado para ejecutar cuatro tareas de manipulación en un banco de trabajo real, tomando como entrada dos vistas de cámara (exterior y muñeca) más una instrucción textual de subtarea. No es un modelo de lenguaje conversacional: su salida son acciones de control, no texto.

Técnicamente es un artefacto de inferencia de 4.143.404.816 parámetros (~4,14 mil millones) almacenado en safetensors, con un repositorio de 9,4 GB. El checkpoint corresponde al paso 60.000 de optimización, con batch global 64, 4 GPU y semilla 42. La arquitectura hereda la familia Pi0.5 de LeRobot (backbone tipo PaliGemma, según la referencia del tokenizer a `google/paligemma-3b-pt-224`) y genera fragmentos de acción de horizonte 50 mediante 10 pasos de denoising.

Su relevancia es acotada pero concreta: es un ejemplo reproducible de ajuste fino de una política VLA sobre datos de robot reales, con la configuración de preprocesado, postprocesado y normalización incluidas en la raíz del repositorio. El propio autor advierte de que se trata de una política entrenada y no de un resultado de evaluación, y no reclama métricas de robot real. Con 0 descargas y 0 likes en el momento del análisis, es un artefacto de investigación más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política VLA de la familia Pi0.5 (LeRobot), con backbone tipo PaliGemma según la referencia del tokenizer a `google/paligemma-3b-pt-224`; detalles internos de capas no disponibles |
| Parámetros totales | 4.143.404.816 (~4,14 mil millones), dato de los safetensors |
| Parámetros activos | No aplica (no se documenta una arquitectura MoE) |
| Longitud de contexto | No disponible; la política consume una instrucción de subtarea por frame y dos vistas de 224×126 (rellenadas a 224×224) |
| Tipos de cuantización | No se publican cuantizaciones; los pesos distribuidos están en safetensors (precisión completa del entrenamiento). No hay GGUF ni versiones de 8 o 4 bits |
| Idiomas soportados | No disponible; las instrucciones se toman del campo de subtarea por frame del parquet del dataset y el idioma no se especifica |
| Licencia | No disponible en la metadata del repositorio |
| Formato de pesos | Safetensors, más configuración de política, preprocesado/postprocesado y estados de normalización en la raíz del repositorio |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Pi0.5, una política VLA que combina un codificador visual y un modelo de lenguaje para producir acciones motoras. La model card no describe el desglose de capas, pero la referencia explícita al tokenizer `google/paligemma-3b-pt-224` (revisión de entrenamiento `35e4f46485b4d07967e7e9935bc3786aad50687c`) sitúa el backbone en la línea PaliGemma usada habitualmente por Pi0.5. La generación de acciones es de tipo chunking: el modelo emite un fragmento de 50 acciones por inferencia, calculado con 10 pasos de denoising, lo que apunta a un decodificador de flujo (flow matching) como en la familia Pi0.

El ajuste fino se realizó durante 60.000 pasos de optimización con batch global 64, 4 GPU y semilla 42, usando la implementación `RLWRLD/hiwrld-ll-policy` (una copia adaptada de LeRobot Pi0.5). Los datos provienen del dataset `Myungkyu/real_workbench-taco-keyframe-gemini`, con dos vistas (exterior y muñeca), imágenes almacenadas a 224×126 que la política rellena a 224×224, y etiquetas de subtarea por frame en parquet. El espacio de estado es de 8 dimensiones y la acción es un delta del efector final (EEF) de 7 dimensiones: 6 de velocidad cartesiana más el gripper. No hay información sobre número de tokens de entrenamiento, composición del dataset ni si se aplicaron etapas de RLHF o DPO; en robótica estos mecanismos no son habituales y no se documentan aquí.

## Capacidades

- Generación de acciones motoras: produce fragmentos de 50 acciones (horizonte de ejecución 50) con 10 pasos de denoising por chunk.
- Control cartesiano de velocidad del efector final: salida de 7 dimensiones (6 de velocidad cartesiana más apertura/cierre del gripper), expresada como delta sobre el estado actual.
- Percepción multi-vista: consume dos flujos de imagen simultáneos, cámara exterior y cámara de muñeca, con resolución de entrada 224×126 rellenada a 224×224.
- Seguimiento de instrucciones en lenguaje natural: acepta una subtarea por frame como texto de política, tomada del campo correspondiente del parquet del dataset.
- Condicionamiento por estado propioceptivo: entrada de estado de 8 dimensiones además de las imágenes y la instrucción.
- Cobertura de tareas: las cuatro tareas del entorno Workbench definido por el dataset de entrenamiento.
- Capacidades ausentes de forma explícita: no hay soporte documentado de tool calling ni function calling, no hay modo de razonamiento multi-paso, no hay capacidades de audio, ni generación de texto libre, ni uso como agente conversacional.

## Casos de uso

- Manipulación en banco de trabajo real: la política está entrenada para las cuatro tareas del entorno Workbench, de modo que puede desplegarse directamente sobre esa celda con dos cámaras y un brazo con control cartesiano de velocidad.
- Punto de partida para ajuste fino propio: al ser un checkpoint de una política Pi0.5 con un pipeline de normalización incluido, sirve como inicialización para adaptar el modelo a una celda o a unas tareas nuevas con un dataset propio de imitación.
- Investigación en aprendizaje por imitación: permite estudiar el comportamiento de una política VLA entrenada 60.000 pasos sobre datos reales, por ejemplo cómo varía el éxito al modificar el horizonte de ejecución o el número de pasos de denoising.
- Línea base en comparativas internas de VLA: sirve como referencia cuantitativa frente a otros checkpoints de la misma familia (por ejemplo, distintos pasos de entrenamiento o número de vistas) al compartir dataset, batch y semilla.
- Evaluación de robustez multi-vista: al usar cámara exterior y de muñeca, es adecuado para experimentos sobre la contribución de cada vista, comparando con variantes de 3 vistas que además reciben una imagen de keyframe definida por el dataset.
- Integración en pilas LeRobot: al cargarse con la librería `lerobot`, se puede insertar en un bucle de control existente que gestione lectura de cámaras, construcción del vector de estado y envío de comandos de velocidad al robot.
- Reproducción de artefactos de inferencia: al incluir configuración, pre/postprocesado y estados de normalización en la raíz del repositorio, es útil para validar pipelines de despliegue que no quieran depender del estado de reanudación del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica de forma explícita que se trata de un checkpoint final de entrenamiento, no de un resultado de evaluación, y que no se reclama ninguna métrica de evaluación en robot real. Tampoco se proporcionan cifras de éxito por tarea, latencia ni throughput.

## Requisitos de hardware

- VRAM para pesos: aproximadamente 8,3 GB en bf16/fp16 (4,14 mil millones de parámetros) y aproximadamente 16,6 GB en fp32.
- VRAM total para inferencia: como mínimo unos 10-12 GB en bf16 para pesos y estados; conviene prever 12-16 GB o más para acomodar el codificador visual con dos imágenes a 224×224, el estado de 8 dimensiones y los buffers de los 10 pasos de denoising con chunks de 50 acciones.
- GPU profesionales: A100 (40/80 GB), H100, L40S o similares; el modelo es pequeño para estos aceleradores, por lo que se puede servir con margen para varios procesos o para trabajar a mayor resolución interna si el pipeline lo permite.
- GPU de consumo: cabe en tarjetas de 24 GB como RTX 3090 o RTX 4090, y de forma ajustada en GPU de 16 GB como RTX 4080 o RTX 4060 Ti 16 GB, siempre que la implementación no mantenga copias en fp32.
- Opciones de despliegue: librería `lerobot` (formato nativo del checkpoint) y la implementación `RLWRLD/hiwrld-ll-policy` referenciada por el autor, que puede ser necesaria si se usan campos de entrada personalizados. No aplican vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje de texto, y no se distribuye GGUF.
- Latencia y throughput: no disponibles. Como referencia estructural, cada inferencia requiere 10 pasos de denoising para producir un chunk de 50 acciones, lo que reduce la frecuencia de cálculo respecto a un control paso a paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| jaehyunkang/pi05-real-workbench-taco-2view-8b7104f0-60k | 4.143.404.816 (~4,14 mil millones) | 2 vistas 224×224, estado de 8 dims, instrucción de subtarea | No disponible | Repositorio público en HuggingFace, 0 descargas y 0 likes en el momento del análisis |
| lerobot/pi05_base (modelo base) | No disponible | No disponible | No disponible | Público en HuggingFace, referenciado como base del ajuste fino |
| Otras políticas VLA de la familia Pi0, OpenVLA o GR00T | No disponible | No disponible | No disponible | No hay datos verificados en la información proporcionada |

No se dispone de cifras de rendimiento comparadas entre estas alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, formato de entrada y disponibilidad.

## Limitaciones y advertencias

- No hay métricas de evaluación: el autor indica expresamente que es una política entrenada y no un resultado de evaluación, y que no se reclama ningún dato de éxito en robot real. No debe asumirse un rendimiento concreto.
- Licencia no disponible: el repositorio no declara licencia. Esto impide confirmar si el uso comercial está permitido, y en producción hay que resolverlo antes de desplegar, incluyendo la licencia del modelo base `lerobot/pi05_base` y del tokenizer `google/paligemma-3b-pt-224`.
- Dependencia de la implementación: la model card advierte de que los campos de entrada personalizados pueden requerir la implementación `RLWRLD/hiwrld-ll-policy` (copia adaptada de LeRobot Pi0.5). Cargar el checkpoint con otra versión de LeRobot puede provocar errores silenciosos de preprocesado o de normalización.
- Sesgo de dominio: la política está entrenada únicamente sobre las cuatro tareas del entorno Workbench de `Myungkyu/real_workbench-taco-keyframe-gemini`, con una disposición concreta de cámaras, un estado de 8 dimensiones y acciones delta EEF de 7 dimensiones. Cambiar el robot, la cinemática, la iluminación o la colocación de las cámaras degradará el comportamiento.
- Sesgos de los datos de demostración: al derivar de demostraciones humanas sobre un banco de trabajo concreto, hereda las condiciones, los objetos y los sesgos de recogida del dataset, difíciles de cuantificar sin acceso a su documentación.
- Idioma no confirmado: no se especifica el idioma de las instrucciones de subtarea; si se despliega con instrucciones en otro idioma, el comportamiento no está garantizado.
- Sin estado de reanudación ni optimizador: el artefacto excluye el estado de optimización y de reanudación del entrenamiento, y las rutas específicas de la máquina se han eliminado del JSON de metadatos; para reanudar el entrenamiento hay que aportar rutas locales del dataset y de salida.
- Riesgo físico: al tratarse de una política de control robótico, cualquier despliegue debe contar con límites de velocidad, parada de emergencia y supervisión; los fallos de la política se traducen en movimientos reales del brazo, no en texto incorrecto.
- Madurez del artefacto: 0 descargas y 0 likes, publicación reciente (18 de septiembre de 2026 según los metadatos) y sin evaluación de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaehyunkang/pi05-real-workbench-taco-2view-8b7104f0-60k
- Dataset de entrenamiento: https://huggingface.co/datasets/Myungkyu/real_workbench-taco-keyframe-gemini
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Tokenizer referenciado: https://huggingface.co/google/paligemma-3b-pt-224
- Implementación de entrenamiento citada: `RLWRLD/hiwrld-ll-policy` (referenciada en la model card; URL no disponible en la información proporcionada)
- Artículos, blogs o demos adicionales: no disponibles en la información proporcionada
