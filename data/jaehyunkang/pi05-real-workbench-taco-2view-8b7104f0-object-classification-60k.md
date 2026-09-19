# jaehyunkang/pi05-real-workbench-taco-2view-8b7104f0-object-classification-60k

## Resumen

Pi0.5 Real Workbench — taco-2view-8b7104f0-object-classification es un checkpoint final de una política robótica de visión-lenguaje-acción (VLA) publicado por el usuario jaehyunkang en HuggingFace. Se trata de un ajuste fino (fine-tune) del modelo base lerobot/pi05_base, la implementación de Pi0.5 dentro de la librería LeRobot, especializado en la tarea de clasificación de objetos sobre un banco de trabajo real. El checkpoint corresponde a 60.000 pasos de optimización y se distribuye como artefacto de inferencia, sin estado de optimizador ni de reanudación de entrenamiento.

El modelo cuenta con 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y un repositorio de 9,4 GB. Recibe observaciones de dos cámaras (exterior y muñeca), un vector de estado de 8 dimensiones y una instrucción textual derivada de un subtask por fotograma en formato parquet, y produce acciones de 7 dimensiones en espacio de velocidad cartesiana delta del efector final más pinza. La ejecución se realiza por chunks de 50 acciones con 10 pasos de denoising en inferencia.

Su relevancia es acotada y muy específica: no es un modelo de propósito general, sino un artefacto reproducible de investigación en robótica, útil para quienes trabajan con LeRobot, con políticas Pi0.5 o con el dataset real_workbench-taco-keyframe-gemini. La model card indica explícitamente que no se reclaman métricas de evaluación en robot real, por lo que debe tratarse como un punto de partida para fine-tuning o reproducción de experimentos, no como un sistema validado en producción. La licencia, los idiomas soportados y los resultados de benchmarks no están declarados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en Pi0.5, implementada en LeRobot; fine-tune de lerobot/pi05_base. El detalle interno de capas no está disponible en la información proporcionada |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones), dato real de safetensors |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible. La política no se describe con ventana de contexto de lenguaje; procesa observaciones por fotograma e instrucciones de subtask |
| Tipos de cuantizacion | No se declaran cuantizaciones. El tamaño del repositorio (9,4 GB) es compatible con pesos en bf16 (≈8,3 GB) más artefactos de configuración, preprocesado y estados de normalización |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el repositorio no declara licencia) |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Modelo base | lerobot/pi05_base |
| Dataset de entrenamiento | Myungkyu/real_workbench-taco-keyframe-gemini |
| Ambito de tarea | object_classification |
| Vistas de entrada | 2 (exterior y muñeca) |
| Dimension del estado | 8 |
| Dimension de la accion | 7 (6 de velocidad cartesiana + pinza) |
| Horizonte de accion (chunk) | 50 |
| Pasos de denoising en inferencia | 10 |
| Resolucion de imagen | Almacenada a 224×126; la política la rellena (pad) a 224×224 |
| Tokenizer de referencia | google/paligemma-3b-pt-224 (revisión 35e4f46485b4d07967e7e9935bc3786aad50687c) |
| Pasos de optimizacion | 60.000 |
| Batch global / GPUs / semilla | 32 / 2 GPUs / 42 |
| Tamano del repositorio | 9,4 GB |
| Descargas / likes | 17 / 0 |

## Arquitectura y entrenamiento

El modelo es un fine-tune de lerobot/pi05_base, es decir, la implementación de Pi0.5 mantenida en LeRobot. Según la model card, el entrenamiento se realizó con la implementación RLWRLD/hiwrld-ll-policy, que incorpora una versión vendorizada de LeRobot Pi0.5, y advierte de que los campos de entrada personalizados pueden requerir esa implementación concreta para funcionar. El tokenizer de referencia apunta a google/paligemma-3b-pt-224, lo que sitúa el componente de visión-lenguaje en la familia PaliGemma, aunque la información proporcionada no desglosa cómo se reparten los 4,14 mil millones de parámetros entre el backbone y el resto de componentes.

Los datos de entrenamiento provienen del dataset Myungkyu/real_workbench-taco-keyframe-gemini, con instrucciones tomadas de un subtask por fotograma almacenado en parquet. La configuración reportada incluye batch global 32, dos GPUs de entrenamiento y semilla 42, durante 60.000 pasos de optimización. La política consume dos vistas (exterior y muñeca) y un estado de 8 dimensiones, y genera acciones delta del efector final de 7 dimensiones con un horizonte de chunk de 50 acciones y 10 pasos de denoising. La model card no documenta el número total de tokens, la composición detallada del dataset ni si hubo fases de RLHF o DPO; tampoco detalla innovaciones técnicas adicionales más allá del esquema de action chunking y denoising descrito.

## Capacidades

- Generación de acciones robóticas: produce comandos de 7 dimensiones (6 de velocidad cartesiana delta del efector final más apertura/cierre de pinza) a partir de observaciones visuales y de estado.
- Política multi-vista: procesa simultáneamente una cámara exterior y una cámara en la muñeca, lo que permite razonar sobre la escena y sobre la geometría cercana al efector final.
- Clasificación y discriminación de objetos: el ámbito declarado de la tarea es object_classification sobre el banco de trabajo del dataset de entrenamiento.
- Seguimiento de instrucciones de subtask: acepta texto de subtask por fotograma procedente de parquet, lo que permite condicionar la conducta a una descripción concreta de la subtarea.
- Ejecución por chunks de acción: con horizonte 50 y 10 pasos de denoising en inferencia, la política está diseñada para control reactivo con horizonte de planificación corto.
- Integración en el ecosistema LeRobot: el artefacto incluye pesos, configuración de política, preprocesado y postprocesado, y estados de normalización en la raíz del repositorio.
- Tool calling, function calling y uso de agentes: no disponible; no se mencionan en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión general, audio): no disponible más allá del uso de imágenes como entrada sensorial.

## Casos de uso

- Clasificación de objetos en banco de trabajo: es la tarea declarada del checkpoint. El modelo recibe las dos vistas de cámara y el estado de 8 dimensiones y emite acciones delta del efector final para manipular y discriminar objetos de la escena del dataset real_workbench-taco-keyframe-gemini.
- Recogida y picking guiado por cámara de muñeca: la vista de muñeca a 224×126 píxeles (con pad a 224×224) permite corregir la aproximación final al objeto, mientras que la vista exterior aporta el contexto de la mesa.
- Punto de partida para fine-tuning en tareas nuevas: al ser un fine-tune de lerobot/pi05_base sobre un dataset concreto, sirve como inicialización para reentrenar sobre otros objetos o configuraciones de banco reduciendo el coste frente a partir del modelo base.
- Investigación en políticas VLA con LeRobot: el repositorio incluye configuración de política, preprocesado, postprocesado y estados de normalización, lo que facilita reproducir la inferencia y comparar variantes de Pi0.5 dentro del mismo framework.
- Evaluación de action chunking con horizonte 50: el modelo permite estudiar el compromiso entre frecuencia de replanificación, número de pasos de denoising (10 en inferencia) y estabilidad del control en una tarea de manipulación real.
- Integración en pipelines de robótica con control reactivo: las acciones delta de velocidad cartesiana y pinza se integran de forma natural en un bucle de control que consume chunks de 50 acciones y los ejecuta de forma continua.
- Generación de datos sintéticos de política: usar el modelo para etiquetar o completar trayectorias en el simulador o en el banco físico, con el fin de ampliar el dataset antes de un nuevo ciclo de entrenamiento.
- Comparación de estrategias de visión multi-cámara: al estar entrenado con dos vistas fijas (exterior y muñeca), permite medir el impacto de cada vista en la precisión de clasificación de objetos dentro del mismo entorno de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica de forma explícita que no se reclaman métricas de evaluación en robot real y que el artefacto es un checkpoint de política entrenada, no un resultado de evaluación. Tampoco se proporcionan cifras de éxito por tarea, tasas de acierto de clasificación ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 4.143.404.816 parámetros; no es un dato declarado por el autor): aproximadamente 16,6 GB en fp32, 8,3 GB en bf16/fp16, 4,1 GB en int8 y 2,1 GB en int4, sin contar activaciones, caché de imágenes ni los estados de normalización.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño de pesos, una GPU de 24 GB permite inferencia en bf16 con margen para activaciones; GPU de 16 GB requerirían cuantización o reducción de resolución/paralelismo.
- Compatibilidad con GPU de consumo: previsiblemente sí en tarjetas de 24 GB (por ejemplo, RTX 3090 o RTX 4090), dado que los pesos en bf16 ocupan unos 8,3 GB. No hay confirmación del autor sobre este punto.
- Opciones de despliegue: la librería declarada es lerobot. La model card señala que la implementación de entrenamiento es RLWRLD/hiwrld-ll-policy (LeRobot Pi0.5 vendorizado) y advierte de que los campos de entrada personalizados pueden exigir esa implementación concreta. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a una política robótica de este tipo.
- Latencia y throughput: no disponibles. Se conocen los parámetros de ejecución (10 pasos de denoising por chunk de 50 acciones), pero no se publican tiempos de inferencia ni frecuencia de control medida.
- Espacio en disco: 9,4 GB para el repositorio completo.
- Artefactos incluidos: pesos de política, configuración, preprocesado y postprocesado y estados de normalización en la raíz del repositorio. Se excluyen el optimizador y el estado de reanudación de entrenamiento.

## Comparativa con modelos similares

La información proporcionada no incluye especificaciones verificables de modelos alternativos, por lo que la comparación se limita a los elementos documentados.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jaehyunkang/pi05-real-workbench-taco-2view-8b7104f0-object-classification-60k | 4,14 mil millones | No disponible | Sin métricas publicadas | No disponible | HuggingFace, 17 descargas, 0 likes |
| lerobot/pi05_base (modelo base) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | HuggingFace |
| Otras políticas VLA (por ejemplo, variantes de Pi0.5 en LeRobot o modelos del mismo ámbito) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones comparables de alternativas en el material analizado.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. El modelo se entrena sobre un único dataset de banco de trabajo, por lo que su comportamiento estará fuertemente condicionado por la distribución de objetos, iluminación y disposición de ese entorno concreto.
- Riesgo de alucinación y de generalización: la model card no reclama métricas de robot real. Cualquier uso fuera del dominio del dataset real_workbench-taco-keyframe-gemini debe considerarse no validado.
- Limitación de entradas: el modelo espera exactamente dos vistas (exterior y muñeca), un estado de 8 dimensiones y una instrucción de subtask por fotograma. Para modelos de subtask hay que suministrar el subtask correspondiente como texto de tarea; en modelos de 3 vistas se requeriría además la imagen de keyframe definida por el dataset.
- Dependencia de implementación: la model card advierte de que los campos de entrada personalizados pueden requerir la implementación RLWRLD/hiwrld-ll-policy, lo que limita la portabilidad directa a otras herramientas.
- Restricciones de licencia: la licencia no está declarada en el repositorio, por lo que el uso comercial queda en un estado legal indeterminado y requiere consulta con el autor antes de cualquier explotación.
- Idiomas soportados: no disponibles; el modelo no está orientado a tareas de lenguaje general.
- Artefacto de inferencia: no incluye optimizador ni estado de reanudación. La model card indica que las rutas específicas del host se eliminaron de los metadatos JSON, por lo que al reanudar hay que aportar rutas locales de dataset y salida.
- Metadatos: el repositorio tiene 17 descargas y 0 likes, lo que sugiere una validación comunitaria muy limitada. La fecha de creación y actualización registrada es 2026-09-19.
- Longitud de contexto de lenguaje: no aplicable/no disponible; el condicionamiento textual se limita a la instrucción de subtask.
- Resolución de entrada: las imágenes se almacenan a 224×126 y se rellenan a 224×224, lo que puede degradar la percepción en escenas con detalles finos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaehyunkang/pi05-real-workbench-taco-2view-8b7104f0-object-classification-60k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Myungkyu/real_workbench-taco-keyframe-gemini
- Tokenizer de referencia: https://huggingface.co/google/paligemma-3b-pt-224 (revisión 35e4f46485b4d07967e7e9935bc3786aad50687c)
- Implementación de entrenamiento citada: RLWRLD/hiwrld-ll-policy (LeRobot Pi0.5 vendorizado; no se proporciona URL en la información disponible)
- Los resultados de búsqueda web devueltos no contienen información relevante sobre este modelo (corresponden a páginas turísticas y enciclopédicas sobre Francia), por lo que no se incluyen enlaces adicionales.
