# Linzhan/UniMate

## Resumen

UniMate es un modelo generativo de movimiento (text-to-motion) presentado en SIGGRAPH Asia 2026 cuyo objetivo es animar esqueletos arbitrarios y heterogéneos: animales, humanoides y objetos articulados con rig, todo ello con un único modelo. Lo desarrolla un equipo académico encabezado por Linzhan Mou (con Adam Finkelstein y Szymon Rusinkiewicz entre los autores) y resuelve un cuello de botella concreto: los animadores aprendidos existentes están limitados por la topología, ya que dependen de plantillas específicas de categoría o exigen ajuste fino por esqueleto y movimientos de referencia en inferencia.

El repositorio `Linzhan/UniMate` publica checkpoints preentrenados. El único modelo disponible actualmente es `unimate_uniml3d_f60_preview`, una versión de previsualización con 74,1 millones de parámetros y una arquitectura de graph attention con condicionamiento de texto mediante AdaLN (10 capas, anchura 512), entrenada con flow matching. Los clips de entrenamiento son de 60 fotogramas a 30 fps (aproximadamente 2 segundos) y cubren esqueletos de 5 a 60 articulaciones.

Es relevante ahora porque el autor lo declara explícitamente como un punto de referencia reproducible para el código público, no como el modelo final: el roadmap del repositorio anuncia un modelo UniMate completo sobre UniML3D y modelos independientes por dataset. Para investigadores en generación de movimiento supone una base abierta (código MIT) sobre la que medir avances con esqueletos diversos, aunque el estado de "preview" y la falta de métricas publicadas limitan su uso en producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Graph attention con condicionamiento de texto AdaLN; 10 capas, anchura 512; formulación de flow matching |
| Parametros totales | 74,1 M |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible como ventana de tokens. Condicionamiento sobre clips de 60 fotogramas a 30 fps (unos 2 s de movimiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el condicionamiento es textual, pero la model card no especifica idiomas) |
| Licencia | Código bajo MIT. La licencia de los pesos no se declara de forma explícita en la model card. Los datos de entrenamiento quedan sujetos a las condiciones de Mixamo (Adobe), a las licencias por objeto de Objaverse-XL y a la licencia comercial del paquete Truebones ZOO |
| Formato de pesos | `.pt` (checkpoint PyTorch que incluye pesos del modelo, su media móvil exponencial —EMA— y el estado del optimizador y del scheduler) |
| Desarrollador | Linzhan Mou, Jiahui Lei, Zhiyang Dou, Chenyue Cai, Chaoyue Song, Adam Finkelstein y Szymon Rusinkiewicz |
| Tipo de tarea | Generación de movimiento condicionada por texto (text-to-motion), animación de personajes |
| Dataset de entrenamiento | UniML3D (Truebones ZOO, Mixamo, Objaverse-XL) |
| Pasos de entrenamiento | 120.000 pasos (checkpoints cada 10.000; se recomienda `checkpoint_step_120000.pt`) |
| Hardware de entrenamiento | 6 GPU NVIDIA H100 durante aproximadamente 23 horas |
| Tamano del repositorio | 14,3 GB |
| Libreria | PyTorch (con TensorBoard para las curvas de entrenamiento) |

## Arquitectura y entrenamiento

UniMate es un modelo único condicionado por texto que genera movimiento para esqueletos arbitrarios, desde humanos y animales hasta objetos articulados con rig, sin movimiento de referencia ni ajuste fino por esqueleto. La variante publicada usa graph attention sobre la estructura del esqueleto con condicionamiento textual mediante AdaLN (adaptive layer normalization), organizada en 10 capas de anchura 512, y se entrena con un objetivo de flow matching. El modelo aprende a animar de extremo a extremo una malla con rig, adaptándose a la estructura de cada esqueleto en lugar de a una plantilla de categoría.

El entrenamiento se realizó sobre el dataset UniML3D, que agrega Truebones ZOO, Mixamo y Objaverse-XL, con clips de 60 fotogramas a 30 fps y esqueletos de entre 5 y 60 articulaciones. La configuración publicada es `configs/uniml3d_60frames_graph_adaln.json` y la ejecución de referencia empleó `accelerate launch --num_processes 6`. El checkpoint recomendado corresponde al paso 120.000, tras unas 23 horas en 6 H100. Para inferencia se emplean los pesos EMA almacenados en el checkpoint, que también conserva el estado del optimizador y del scheduler para poder reanudar el entrenamiento. No se documentan en la información disponible fases de RLHF, DPO ni mecanismos de decodificación especulativa, que no aplican a este tipo de modelo.

## Capacidades

- Generación de movimiento condicionada por texto para esqueletos arbitrarios, sin necesidad de movimiento de referencia ni de ajuste fino por esqueleto.
- Cobertura de esqueletos heterogéneos: humanos, animales y objetos articulados con rig, con estructuras de 5 a 60 articulaciones.
- Animación de extremo a extremo de una malla con rig, es decir, del activo 3D completo y no solo de posiciones articulares aisladas.
- Salidas en dos formatos complementarios: posiciones articulares predichas (`*_ric.mp4`) y cinemática directa de las rotaciones predichas (`*_fk.mp4`).
- Generación de clips de 60 fotogramas a 30 fps por muestra.
- Repeticiones múltiples por prompt (`--num_repetitions`), útil para explorar variabilidad en la generación.
- Reanudación del entrenamiento desde cualquier checkpoint publicado.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. La única modalidad de entrada es texto más la definición del esqueleto objetivo.

## Casos de uso

- Animación de personajes en producción de videojuegos: al aceptar esqueletos de 5 a 60 articulaciones sin ajuste por esqueleto, permite generar clips de locomoción o acciones para rigs muy distintos (NPC humanoides, criaturas,props articulados) desde una misma descripción textual, reduciendo el trabajo de animación manual por activo.
- Previsualización (previz) en cine y animación: generar clips de 2 segundos a 30 fps a partir de un prompt para validar la intención de una secuencia antes de encargar la animación definitiva, aprovechando que el modelo no requiere movimiento de referencia.
- Poblar escenas 3D con activos de Objaverse-XL: el modelo se entrenó con ese corpus y puede animar objetos articulados ya existentes, lo que facilita dar vida a bibliotecas de assets sin crear animaciones específicas para cada uno.
- Generación de datos sintéticos de movimiento: producir pares texto-movimiento sobre esqueletos diversos para preentrenar o aumentar modelos posteriores, especialmente en categorías con poca cobertura de captura de movimiento real.
- Herramientas de creación asistida para artistas técnicos: integrar el modelo en un editor donde el artista escribe una acción ("un perro salta y gira") y recibe una propuesta animada sobre el rig seleccionado, usando las repeticiones múltiples para escoger variantes.
- Evaluación y reproducción en investigación: el checkpoint de previsualización está pensado como referencia reproducible del código publicado, de modo que otros grupos pueden comparar variantes arquitectónicas o de datos bajo la misma configuración de entrenamiento y medir sobre el mismo dataset.
- Docencia y estudio de flow matching aplicado a grafos: el repositorio expone configuración, estadísticas de normalización y curvas de TensorBoard, lo que permite analizar el entrenamiento completo de un modelo de 74,1 M de parámetros en un coste de cómputo contenido (23 horas en 6 H100).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas cuantitativas (ni FID, ni R-precision, ni exactitud por articulación) y las búsquedas web solo devuelven la página del proyecto, el repositorio de código y el preprint, sin tablas de resultados comparativos.

## Requisitos de hardware

- VRAM para inferencia: no publicada por los autores. Como referencia aritmética a partir del tamaño del modelo, los pesos ocupan aproximadamente 296 MB en fp32 y unos 148 MB en fp16; a ello hay que sumar activaciones, las características del esqueleto objetivo y el proceso de renderizado de los vídeos de salida.
- GPU recomendadas: no especificadas. El entrenamiento de referencia se realizó con 6 NVIDIA H100 durante unas 23 horas, pero eso corresponde al régimen de entrenamiento, no a la inferencia.
- GPU de consumo: no confirmado oficialmente. Por el tamaño del modelo (74,1 M de parámetros), es probable que la inferencia quepa en GPU de consumo con suficiente memoria, pero no hay cifras publicadas que lo respalden y la generación de vídeo añade coste.
- Opciones de despliegue: la ruta documentada es el propio paquete del repositorio de código, con `python -m unimate.inference.sample` para muestrear y `accelerate launch` para entrenar o reanudar. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no aplican a un modelo de generación de movimiento.
- Dependencia de datos en inferencia: el muestreo lee el esqueleto objetivo desde `dataset/features/<dataset>/`, por lo que es necesario disponer de las características con las que se entrenó el modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye nombres ni cifras de modelos comparables. El preprint señala de forma genérica que los animadores aprendidos existentes están limitados por la topología, ya que dependen de plantillas específicas de categoría o requieren ajuste fino por esqueleto y movimientos de referencia en inferencia, pero no detalla alternativas concretas ni resultados frente a ellas en el material disponible.

## Limitaciones y advertencias

- Estado de previsualización: el propio autor indica que `unimate_uniml3d_f60_preview` se entrenó en unas 23 horas y que su finalidad es servir de referencia reproducible, no ser el modelo final. El roadmap anuncia un modelo completo sobre UniML3D y modelos por dataset.
- Licencia de los pesos no declarada: la model card especifica MIT para el código, pero no aclara la licencia de los checkpoints publicados. Conviene confirmarlo con los autores antes de cualquier uso.
- Restricciones derivadas de los datos: el entrenamiento usa Mixamo (condiciones de uso de Adobe), Objaverse-XL (licencias por objeto) y el paquete Truebones ZOO (licencia comercial). Estas condiciones se trasladan al uso de los modelos y pueden impedir explotación comercial sin revisar cada término.
- Ausencia de métricas publicadas: no hay benchmarks ni evaluación cuantitativa en la información disponible, por lo que no es posible estimar la fidelidad al prompt ni la calidad del movimiento antes de probarlo.
- Alcance temporal limitado: las muestras documentadas son clips de 60 fotogramas a 30 fps (unos 2 segundos). No se documenta generación de secuencias largas ni consistencia a largo plazo.
- Idiomas de los prompts no especificados: no se indica en qué idioma o idiomas se entrenó el condicionamiento textual.
- Sin cuantizaciones publicadas: solo se distribuyen checkpoints `.pt`, sin versiones GGUF, ONNX ni formatos reducidos, lo que limita optimizaciones de memoria y despliegue.
- Dependencia del dataset de características: la inferencia requiere las características del esqueleto objetivo en `dataset/features/<dataset>/`, lo que complica el uso con activos nuevos que no provengan de los corpus soportados.
- Riesgo de resultados no fieles al prompt: sin evaluación publicada no puede descartarse que el modelo genere movimientos que no respeten la acción descrita o la estructura del esqueleto objetivo, especialmente en rigs con topologías poco representadas.
- Validación comunitaria mínima: en el momento de la consulta el repositorio registra 0 descargas y 1 "me gusta", por lo que no existe evidencia externa de uso en producción.
- Fecha de entrenamiento ligada a la versión de datos: el modelo se entrenó con la versión de UniML3D de septiembre de 2026; los datasets seguirán actualizándose y los resultados no serán directamente comparables con modelos entrenados sobre versiones posteriores.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Linzhan/UniMate
- Colección UniMate en HuggingFace: https://huggingface.co/collections/Linzhan/unimate
- Dataset UniML3D: https://huggingface.co/datasets/Linzhan/UniML3D
- Página del proyecto: https://linzhanmou.com/unimate/
- Demo interactiva: https://linzhanmou.com/unimate/interactive.html
- Preprint en arXiv: https://arxiv.org/abs/2609.05415
- PDF del artículo: https://linzhanmou.com/unimate/resources/unimate.pdf
- Código fuente: https://github.com/Friedrich-M/UniMate
- Vídeo: https://youtu.be/xbndC-dEuVw
- Licencia comercial de Truebones: https://truebones.com
