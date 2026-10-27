# microduckapp/microduck-evil-laugh

## Resumen

`microduck-evil-laugh` es un artefacto de robótica publicado por el usuario `microduckapp` en Hugging Face: una política de control motor exportada a ONNX que reproduce una animación de 10,6 segundos para el robot bípedo Microduck. No es un modelo de lenguaje ni un modelo fundacional, sino una habilidad motora encapsulada: el fichero `policy.onnx` recibe 61 observaciones por paso y emite 14 consignas de articulación a 50 Hz, es decir, un bucle de control cerrado a 20 ms por ciclo. Se acompaña de `manifest.json`, que describe qué necesita el robot para instalar y reproducir el movimiento, y de un vídeo de previsualización en `media/preview.mp4`.

El movimiento se describe en la model card como un gesto expresivo: una mirada de reojo, un cabeceo hacia atrás con regocijo silencioso y un giro lento mientras maquina algo. Es, por tanto, contenido de expresión corporal para un robot de compañía, no una capacidad cognitiva. El repositorio pesa 0,0 GB y está etiquetado con `onnx`, `robotics`, `microduck-move` y `region:us`, lo que lo sitúa dentro de la familia de habilidades (`microduck-move`) que el mismo autor publica para la app MicroDuck.

Su relevancia es contextual: Microduck es el robot bípedo de 25 cm y 399 dólares presentado por Hugging Face y su brazo Pollen Robotics en agosto de 2026, entrenado con aprendizaje por refuerzo en MuJoCo y con envíos previstos antes de Navidad. Cada ficha como esta representa una habilidad instalable de ese ecosistema, de modo que el interés técnico está en el formato de distribución (ONNX + manifiesto) y en el contrato de observación/acción, no en métricas de razonamiento. No se declara licencia, idioma ni topología interna de la red.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de control motor exportada a ONNX; topología interna no declarada |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica: 61 observaciones por paso, sin memoria de contexto declarada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`); metadatos y dependencias en `manifest.json` |
| Dimension de entrada | 61 observaciones |
| Dimension de salida | 14 objetivos de articulación (joint targets) |
| Frecuencia de control | 50 Hz (20 ms por paso) |
| Duracion de la habilidad | 10,6 segundos |
| Tamano del repositorio | 0,0 GB |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la política: solo se distribuye el grafo ONNX ya exportado, sin indicación del número de capas, anchura, tipo de red (MLP, transformer pequeño o política recurrente) ni del algoritmo de entrenamiento empleado. El contrato de interfaz sí está especificado: 61 entradas de observación, 14 salidas de objetivo articular y una frecuencia de ejecución de 50 Hz, un esquema típico de políticas de imitación o de aprendizaje por refuerzo destinadas a control proprioceptivo de un bípedo de pequeñas dimensiones. No se declara ni el número de tokens de entrenamiento (concepto que aquí no aplica), ni la composición del dataset, ni si hubo ajuste fino con preferencias humanas.

El contexto de plataforma sí está documentado en fuentes externas: el robot Microduck, de 25 cm y 399 dólares, fue presentado por Hugging Face y Pollen Robotics en agosto de 2026 y se entrenó con aprendizaje por refuerzo en simulación mediante MuJoCo. Ese dato corresponde al desarrollo del robot y a su stack de locomoción, no a esta habilidad concreta, para la que no se especifica si el movimiento se generó con captura de movimiento, animación por keyframes convertida a política o refuerzo con recompensas de estilo. La innovación técnica destacable, en todo caso, es el formato de empaquetado: una habilidad expresiva autocontenida, portable y reproducible en el runtime `microduck-move` del robot, con manifiesto de instalación y previsualización audiovisual.

## Capacidades

- Ejecución de una habilidad motora expresiva de 10,6 segundos de duración sobre el robot Microduck, a 50 Hz.
- Control de 14 articulaciones mediante consignas de posición/objetivo a partir de 61 observaciones por ciclo.
- Reproducción determinista de una secuencia preentrenada: no hay adaptación ni aprendizaje en línea declarados.
- Integración con la app MicroDuck mediante `manifest.json`, que declara qué debe instalar y cómo reproducir el movimiento.
- Previsualización audiovisual incluida en el repositorio (`media/preview.mp4`) para evaluar el resultado antes de instalarlo.
- Sin soporte de tool calling, function calling ni razonamiento multi-paso.
- Sin capacidades de lenguaje, visión, audio ni generación de texto.
- Sin capacidades multilingües (no procesa texto).
- Sin modo de razonamiento (`thinking`) ni decodificación especulativa: no aplica a este tipo de artefacto.

## Casos de uso

- **Demostración de interacción social del robot**: la habilidad sirve como respuesta expresiva a un evento detectado por la app (por ejemplo, tras una broma o una instrucción concreta), aprovechando que el gesto está diseñado para leerse como complicidad en menos de 11 segundos.
- **Contenido audiovisual y marketing**: grabación del movimiento para vídeos de producto, redes sociales o material de prensa del ecosistema Microduck, con la ventaja de que la previsualización ya viaja en el repositorio y el resultado es reproducible de forma consistente.
- **Prueba de integración del runtime `microduck-move`**: al tener un contrato claro de 61 entradas y 14 salidas a 50 Hz, es un caso de test útil para validar el cargador de manifiestos, la resolución de dependencias y el bucle de control de la app antes de desplegar habilidades más críticas.
- **Validación de reproducción de políticas entre simulador y robot real**: comparar la ejecución del grafo ONNX en el robot físico con la reproducción en MuJoCo permite detectar desviaciones de calibración o de latencia en el lazo de control.
- **Educación y divulgación técnica**: ejemplo didáctico de cómo se empaqueta una política de control como artefacto distribuible (ONNX + manifiesto + vídeo), útil en cursos de robótica o de despliegue de modelos.
- **Composición de secuencias de comportamiento**: encadenar esta habilidad con otras del mismo autor (por ejemplo, `microduck-midnight-snack`) para construir rutinas de varias decenas de segundos en una demo de comportamiento expresivo.
- **Pruebas de esfuerzo térmico y mecánico suaves**: un movimiento de 10,6 segundos con giro y cabeceo sirve para observar consumo de actuadores y estabilidad postural en condiciones repetibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No se declaran métricas de éxito de la tarea, tasa de caídas, error de seguimiento articular, latencia medida en hardware real ni comparaciones cuantitativas con otras habilidades del mismo autor.

## Requisitos de hardware

- **VRAM estimada para inferencia**: inferior a 1 GB según el tamaño del repositorio (0,0 GB) y la dimensionalidad del contrato de entrada/salida (61 → 14); no hay cifra declarada por el autor.
- **GPU recomendadas**: ninguna en particular. El presupuesto de cómputo es de 20 ms por paso para una red de entrada y salida de dimensión reducida, por lo que la ejecución en CPU es suficiente en la práctica.
- **Cabe en GPU de consumo**: sí, en cualquier GPU de consumo e incluso en SoC integrados; el cuello de botella realista es la comunicación con los 14 actuadores del robot, no la inferencia.
- **Opciones de despliegue**: ONNX Runtime como ejecutor del grafo y el runtime nativo `microduck-move` de la app MicroDuck para la instalación y reproducción. vLLM, llama.cpp, Ollama y TGI no aplican: no es un modelo generativo de texto.
- **Latencia y throughput**: el diseño impone 50 Hz (20 ms por ciclo). No se han publicado mediciones reales de latencia de inferencia ni de throughput en el hardware del robot.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entrada / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `microduckapp/microduck-evil-laugh` | Habilidad motora ONNX para Microduck | no disponible | 61 observaciones, 50 Hz | no disponible | Pública en Hugging Face, 0 descargas, 0 likes |
| `microduckapp/microduck-midnight-snack` | Habilidad motora del mismo autor y familia | no disponible | no disponible | no disponible | Pública en Hugging Face |
| Políticas VLA generalistas (p. ej. OpenVLA, π0) | Modelos visión-lenguaje-acción de propósito general | no disponible en la información proporcionada | instrucciones en lenguaje + observaciones visuales | no disponible en la información proporcionada | Públicas, pero de otra categoría y escala |

La comparación relevante es dentro de la familia `microduck-move`: mismas etiquetas, mismo autor y presumiblemente el mismo contrato de observación/acción, aunque la información disponible no permite verificar dimensiones ni licencia de las otras habilidades. Frente a políticas VLA generalistas, este artefacto no generaliza ni acepta instrucciones: es una animación parametrizada por el estado del robot.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: carece de contexto textual, generación, razonamiento y tool calling. Cualquier expectativa en ese sentido es un error de categoría.
- **Licencia no declarada**: al no especificarse licencia en la model card ni en los metadatos, no puede asumirse permiso de uso comercial, redistribución o modificación. Es un bloqueante para integración en producto.
- **Especificidad de hardware**: la política está acoplada a la cinemática y calibración del Microduck; los 14 objetivos articulares no son transferibles a otro robot sin reentrenamiento o retargeting.
- **Cero validación comunitaria**: 0 descargas y 0 likes en el momento de la consulta, sin issues ni报告 de terceros que confirmen que el movimiento se reproduce correctamente en hardware real.
- **Ausencia de métricas**: no hay datos de robustez, tasa de éxito, estabilidad frente a perturbaciones ni comportamiento ante fallos de percepción.
- **Riesgo de sobreajuste al simulador**: si la habilidad se generó en MuJoCo, la brecha simulación-real puede degradar el gesto en el robot físico; no se documenta ninguna mitigación.
- **Ausencia de salvaguardas declaradas**: no se indica ningún mecanismo de parada, límites de par o comprobaciones de seguridad en el manifiesto más allá de lo que implemente el runtime.
- **Fecha de creación registrada en 2026-10-27**, coherente con el lanzamiento del robot pero que conviene contrastar si se evalúa la trazabilidad del artefacto.
- **Sesgos**: no aplica sesgo demográfico o lingüístico; el sesgo relevante sería de estilo expresivo, y no está evaluado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-evil-laugh
- Perfil del autor: https://huggingface.co/microduckapp
- Búsqueda de modelos de la familia: https://huggingface.co/models?search=microduck
- Artículo sobre el lanzamiento del robot Microduck (MarkTechPost): https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Cobertura de TechCrunch: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
- Cobertura de PCMag: https://www.pcmag.com/news/hugging-face-microduck-399-open-source-robot-that-can-learn-new-tricks
