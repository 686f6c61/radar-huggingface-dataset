# ETS2LA/ets2-yolo26s

## Resumen
ets2-yolo26s es un detector de objetos derivado de Ultralytics YOLO26 en su variante «s» (small), ajustado por el proyecto ETS2LA para detectar los elementos de escena propios de Euro Truck Simulator 2: vehículos de tráfico, semáforos, farolas, señales, postes, líneas de carril, troncos de árbol, pilas de puente, conos y delineadores. El modelo se entrenó con 2000 imágenes del dataset ETS2LA/ets2-object-detection-2k y se distribuye en formato ONNX con licencia MIT, con un repositorio de 0,1 GB y publicado el 27 de octubre de 2026.

Su relevancia es acotada pero clara: ETS2LA es un proyecto que persigue conducción autónoma en los simuladores de camión de SCS Software (ETS2 y ATS), y este modelo cubre una de las piezas de percepción de ese pipeline, la detección de obstáculos, carril y señalización a partir del fotograma renderizado por el juego. No es un modelo de lenguaje ni un modelo generativo: no tiene ventana de contexto textual ni capacidades de razonamiento, y su evaluación debe hacerse con métricas de detección (mAP, precisión, recall, latencia por fotograma).

La ficha se ha elaborado exclusivamente con la información de la model card y del repositorio de HuggingFace. El autor no publica parámetros, resolución de entrada, métricas de validación ni detalles del entrenamiento, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos de la familia YOLO (Ultralytics YOLO26, variante «s»); el autor no detalla bloques, capas ni mecanismo de asignación |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica: modelo de visión de una sola pasada, sin contexto textual |
| Tipos de cuantizacion | no disponible; se publican pesos ONNX sin indicar precision (FP32/FP16) ni variantes INT8 |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Tarea | Deteccion de objetos, 14 clases |
| Clases | car, bus, truck, stoplight, streetlamp, sign, short post, long pole, curved pole, lane line, tree trunk, bridge pier, traffic cone, traffic delineator |
| Resolucion de entrada | no disponible |
| Dataset de entrenamiento | ETS2LA/ets2-object-detection-2k (2000 imagenes de Euro Truck Simulator 2) |
| Modelo base | Ultralytics/YOLO26 |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-10-27 |

## Arquitectura y entrenamiento
La arquitectura corresponde a la familia YOLO de Ultralytics, en concreto al checkpoint YOLO26 en su variante «s», reentrenado para un dominio cerrado: capturas renderizadas de Euro Truck Simulator 2. La model card no especifica el número de parámetros, la resolución de entrenamiento, el número de épocas, el optimizador ni las técnicas de aumento de datos aplicadas, por lo que no es posible reconstruir el procedimiento completo a partir de la información publicada. Tampoco se documenta si hubo destilación, poda o ajuste de la cabeza de detección más allá del cambio a 14 clases.

El único dato verificable sobre los datos es el volumen: 2000 imágenes del dataset ETS2LA/ets2-object-detection-2k. No se indica la proporción de particiones de entrenamiento y validación, la distribución de clases ni la variabilidad de escenarios (clima, hora del día, mapas o mods gráficos). Tampoco se documenta ninguna innovación técnica adicional ni resultados de entrenamiento, y no consta que se hayan aplicado etapas de RLHF/DPO, algo por otra parte ajeno a un detector de objetos.

## Capacidades
- Detección de objetos en imágenes en una sola pasada, con 14 categorías específicas del entorno de ETS2.
- Localización de vehículos de tráfico relevantes para la conducción: coches, autobuses y camiones.
- Detección de señalización vertical y semáforos (stoplight, sign), útil para el razonamiento de normativa en el agente.
- Detección de mobiliario viario y estructuras: farolas, postes cortos y largos, postes curvos, pilas de puente, troncos de árbol.
- Detección de líneas de carril (lane line), la clase clave para tareas de mantenimiento de carril.
- Detección de elementos de obra y balizamiento: conos y delineadores.
- Inferencia portable vía ONNX, ejecutable con ONNX Runtime en CPU o GPU sin dependencia del framework de entrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, matemáticas, visión descriptiva (VQA) ni capacidades multilingües: es exclusivamente un detector.

## Casos de uso
- Percepción del agente de conducción de ETS2LA: el modelo consume el fotograma del juego y devuelve cajas y clases que alimentan la capa de decisión del plugin; su formato ONNX encaja con un bucle de inferencia de baja latencia en tiempo real.
- Mantenimiento de carril: la clase lane line permite estimar la geometría del carril y calcular el error lateral respecto al centro, entrada directa de un controlador de dirección.
- Control de crucero adaptativo y frenada de emergencia en simulación: las clases car, bus y truck aportan la distancia y posición relativa de los vehículos precedentes para regular la velocidad.
- Gestión de intersecciones: la detección de stoplight y sign habilita reglas de parada y de prioridad en cruces dentro del simulador.
- Navegación en tramos en obras: conos y delineadores permiten al agente reconocer desvíos y carriles restringidos y ajustar la trayectoria.
- Autoetiquetado y ampliación del dataset: usar el modelo para preetiquetar nuevas capturas de ETS2/ATS y revisar manualmente solo las detecciones dudosas, reduciendo el coste de pasar de 2000 a decenas de miles de imágenes.
- Investigación en transferencia sim-to-real: como punto de partida para estudiar hasta qué punto un detector entrenado en renderizado de juego generaliza a vídeo real de carretera, midiendo la caída de mAP.
- Verificación en CI de pipelines de visión: al ser un artefacto ONNX pequeño, se puede incluir en tests automatizados que comprueben que una actualización del pipeline de preprocesado no rompe las detecciones esperadas sobre un conjunto fijo de fotogramas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

El autor no reporta mAP50, mAP50-95, precisión, recall, matriz de confusión ni latencia por imagen, ni sobre el conjunto de validación del dataset ETS2LA/ets2-object-detection-2k ni sobre datos externos. Tampoco se ofrece comparación con el checkpoint base Ultralytics/YOLO26.

## Requisitos de hardware
- VRAM para inferencia: no disponible de forma oficial. Como referencia orientativa, un detector de la variante «s» de la familia YOLO suele ocupar entre 0,3 y 1 GB de VRAM en FP32/FP16 incluyendo activaciones a resoluciones de 640 px; es una estimación, no un dato del autor.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM es suficiente en la práctica para un modelo de este tamaño; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 no suponen cuello de botella por memoria.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con ONNX Runtime, dado el tamaño del repositorio (0,1 GB).
- CPU: la inferencia en CPU es viable con ONNX Runtime para bucles no críticos, aunque el agente de conducción necesitará GPU para mantener la frecuencia de fotogramas.
- Opciones de despliegue: ONNX Runtime (recomendado, es el formato publicado), TensorRT previa conversión del ONNX, OpenCV DNN, o exportación a otros runtimes desde el modelo base. No se distribuyen pesos GGUF, por lo que llama.cpp/Ollama no aplican.
- Latencia y throughput: no disponibles. Dependen de la GPU, de la resolución de entrada (no publicada) y del backend; deben medirse en el hardware objetivo antes de integrar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en ETS2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ets2-yolo26s | no disponible | no aplica | sin metricas publicadas | MIT | HuggingFace (ETS2LA/ets2-yolo26s) |
| Ultralytics YOLO26s (base) | no disponible | no aplica | no detecta las 14 clases de ETS2 sin reentrenar | licencia de Ultralytics (verificar; habitualmente AGPL-3.0 con opcion comercial) | Ultralytics |
| Otros detectores YOLO de variante «s» (YOLOv8s, YOLO11s y similares) | no disponible en esta ficha | no aplica | requeririan fine-tuning sobre ets2-object-detection-2k | licencia de Ultralytics (verificar) | Ultralytics / HuggingFace |

No se dispone de datos publicados que permitan comparar mAP ni latencia entre estas opciones. La ventaja diferencial de ets2-yolo26s frente al checkpoint base no es el rendimiento bruto, sino la cabeza de 14 clases específicas del dominio y la licencia MIT declarada en el repositorio; la desventaja es la ausencia total de métricas que permitan verificar la calidad del ajuste.

## Limitaciones y advertencias
- Dataset de entrenamiento muy reducido (2000 imágenes): riesgo alto de sobreajuste y de generalización limitada a mapas, horas del día, climatología o mods gráficos no representados.
- Ausencia de métricas: no hay mAP, ni matriz de confusión, ni partición de validación documentada, por lo que la calidad real del detector es desconocida.
- Dominio sintético: el modelo aprende de renderizado de videojuego; su uso sobre vídeo real de carretera no está validado y probablemente degrade de forma significativa.
- Cobertura de clases incompleta para conducción: no incluye peatones, ciclistas, motocicletas ni animales, categorías críticas en cualquier escenario real. Tampoco distingue estados de semáforo (rojo, ámbar, verde), solo la clase stoplight.
- Riesgo de falsos negativos y de alucinación de detecciones en condiciones de baja iluminación, lluvia, niebla o con texturas personalizadas por mods.
- Licencia: el repositorio declara MIT, pero el modelo deriva de Ultralytics/YOLO26, cuya licencia puede imponer condiciones adicionales (habitualmente AGPL-3.0 o licencia comercial de Ultralytics). Conviene verificar la compatibilidad antes de un uso comercial o de redistribución.
- Sin cuantizaciones publicadas: quien necesite INT8 o TensorRT tendrá que convertir y validar el ONNX por su cuenta, con el riesgo de degradación que ello implica.
- Uso previsto: conducción autónoma en simulador. No debe emplearse en ningún sistema de seguridad o asistencia sobre vehículos reales.
- Idiomas y contexto textual: no aplica; el modelo no procesa texto, por lo que no puede integrarse en flujos de prompting ni de razonamiento de agentes sin una capa adicional.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/ETS2LA/ets2-yolo26s
- Dataset de entrenamiento: https://huggingface.co/datasets/ETS2LA/ets2-object-detection-2k
- Modelo base: https://huggingface.co/Ultralytics/YOLO26
- Sitio oficial del proyecto ETS2LA: https://ets2la.com/
- Página de bienvenida y preguntas frecuentes: https://ets2la.com/welcome.md
- Repositorio GitHub: https://github.com/ETS2LA/ETS2LA
- Releases del proyecto: https://github.com/ETS2LA/ETS2LA/releases
- Descarga en SourceForge: https://sourceforge.net/projects/ets2la/
- Discord de soporte: https://ets2la.com/discord
