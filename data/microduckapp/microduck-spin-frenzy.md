# microduckapp/microduck-spin-frenzy

# microduck-spin-frenzy

## Resumen

`microduckapp/microduck-spin-frenzy` es una política de control motriz («move») para el robot bípedo Microduck, publicada por el usuario `microduckapp` en Hugging Face. No es un modelo de lenguaje ni un modelo fundacional: es un artefacto de inferencia exportado a ONNX que mapea 61 observaciones de entrada a 14 consignas articulares de salida, ejecutado a 50 Hz, y que reproduce un movimiento de 11,2 segundos de duración consistente en giros alternos a izquierda y derecha con la cabeza extendida.

El repositorio contiene tres elementos: `policy.onnx` (la política), `manifest.json` (los requisitos de instalación y reproducción que necesita el robot) y `media/preview.mp4` (la previsualización visual del movimiento). Su relevancia es acotada y práctica: sirve como ejemplo de extremo a extremo de cómo se distribuye una habilidad motriz entrenada —presumiblemente mediante aprendizaje por refuerzo en simulación— hacia un robot físico de bajo coste, empaquetada en un formato portable y con metadatos de despliegue.

La información publicada es mínima: no se documenta la topología de la red, el número de parámetros, el algoritmo de entrenamiento, la licencia ni los idiomas (aspecto este último sin sentido para un modelo de control). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB (redondeado), lo que sitúa el artefacto en el orden de los kilobytes o pocos megabytes. Cualquier evaluación seria de su calidad exige ejecutarlo en hardware Microduck, ya que no se publican métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (política de control serializada en ONNX; no se documenta la topología de red ni si es MLP, transformer u otra) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No aplica (modelo de control sin ventana de contexto; entrada fija de 61 observaciones por paso) |
| Tipos de cuantizacion | No disponible (solo se distribuye el grafo ONNX; no se declaran variantes cuantizadas) |
| Idiomas soportados | No aplica / no disponible (no procesa lenguaje natural) |
| Licencia | No disponible (la model card y los metadatos no la especifican) |
| Formato de pesos | ONNX (`policy.onnx`) acompañado de `manifest.json` y `media/preview.mp4` |
| Entrada | 61 observaciones |
| Salida | 14 objetivos articulares (joint targets) |
| Frecuencia de control | 50 Hz |
| Duracion del movimiento | 11,2 s |
| Pipeline declarado | robotics |
| Etiquetas | onnx, robotics, microduck-move, region:us |
| Tamano del repositorio | 0.0 GB (redondeado) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-10-27T01:31:47Z / 2026-10-27T01:31:51Z |

## Arquitectura y entrenamiento

La única información técnica verificable es la interfaz de la política: 61 observaciones de entrada, 14 consignas articulares de salida y una frecuencia de ejecución de 50 Hz, lo que implica un periodo de control de 20 ms por paso y aproximadamente 560 pasos de inferencia para cubrir los 11,2 s del movimiento. El artefacto se distribuye como grafo ONNX, formato que permite ejecución portable mediante ONNX Runtime sin depender del framework original de entrenamiento. No se especifica el número de capas, el ancho de las mismas, el tipo de activación, si existe historial de observaciones o memoria recurrente, ni el esquema exacto de las 61 observaciones (posiciones articulares, velocidades, IMU, consignas de fase, etc.).

Tampoco se documentan el algoritmo de entrenamiento, el volumen de datos, el simulador empleado ni si hubo ajuste fino en hardware real. El contexto público del proyecto Microduck (Pollen Robotics y Hugging Face) indica que el robot se entrena con aprendizaje por refuerzo en MuJoCo, pero esa afirmación corresponde al proyecto y no a esta política concreta, cuya procedencia no está descrita en la model card. La existencia de un `manifest.json` sugiere un mecanismo de instalación versionado, con requisitos declarativos que la app MicroDuck interpreta antes de ejecutar el movimiento; su contenido no se ha publicado en la información disponible.

## Capacidades

- Generación de una secuencia motriz cerrada: giros alternos a izquierda y derecha con extensión de la cabeza, de 11,2 s de duración.
- Control bípedo a 50 Hz con 14 consignas articulares, adecuado para el lazo de control de bajo nivel del robot.
- Inferencia portable vía ONNX, ejecutable con ONNX Runtime y potencialmente convertible a otros runtimes.
- Instalación y reproducción gestionadas por la app MicroDuck a través de `manifest.json`.
- Previsualización del comportamiento incluida en el repositorio (`media/preview.mp4`).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio ni capacidades multilingües.
- No se documenta soporte de tool calling, function calling, uso como agente ni razonamiento multi-paso. No es un modelo agéntico.
- No se documenta «thinking mode» ni ningún modo de inferencia alternativo.

## Casos de uso

- Reproducción de la habilidad en el robot físico: instalar el paquete mediante la app MicroDuck y ejecutar el movimiento de 11,2 s para verificar que la política se desenvuelve correctamente en el hardware real, comparando con `media/preview.mp4`.
- Validación del pipeline de distribución de habilidades: usar este repositorio como caso de prueba de extremo a extremo del flujo `manifest.json` → `policy.onnx` → ejecución, comprobando resolución de dependencias, versionado y gestión de errores de instalación.
- Docencia y divulgación técnica: emplear una política de 61 entradas y 14 salidas a 50 Hz como ejemplo mínimo y tangible para explicar el bucle percepción-acción, el desacoplamiento entre frecuencia de control y frecuencia de política, y el concepto de observación/acción en robótica con aprendizaje por refuerzo.
- Pruebas de latencia y determinismo de ONNX Runtime: medir el coste por inferencia en distintas plataformas (CPU de escritorio, SBC, aceleradores ligeros) y verificar que se sostienen los 20 ms de periodo exigidos por el lazo a 50 Hz.
- Evaluación mecánica de esfuerzos: al tratarse de un movimiento de giro repetido con la cabeza extendida, sirve para observar límites de par, calentamiento de servos y tolerancias mecánicas en sesiones cortas, siempre bajo supervisión y con topes de seguridad.
- Base de comparación interna de habilidades: al convivir en el mismo perfil `microduckapp` con otros movimientos (por ejemplo `microduck-midnight-snack`), permite contrastar duración, frecuencia de control y estabilidad entre políticas del mismo robot.
- Material de demostración y contenido: el vídeo de previsualización y la brevedad del movimiento lo hacen adecuado para demos públicas, vídeos de producto y presentaciones del ecosistema Microduck.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No existen métricas de recompensa, tasas de éxito de la habilidad, error de seguimiento articular, consumo de par ni latencia medida por paso. Tampoco se aportan comparaciones con otras políticas del mismo robot.

## Requisitos de hardware

- VRAM estimada: no disponible. No se publica el número de parámetros ni el tamaño en bytes de `policy.onnx`; el repositorio aparece como 0.0 GB redondeado, lo que impide derivar una cifra fiable.
- GPU recomendadas: no disponibles. Por la interfaz (61 entradas, 14 salidas) y la frecuencia objetivo, el cuello de botella esperable es la latencia del lazo de control antes que la capacidad de cómputo, pero no hay mediciones publicadas que lo confirmen.
- Encaje en GPU de consumo: no confirmado; no se publican requisitos. La ejecución con ONNX Runtime en CPU es una posibilidad no verificada documentalmente.
- Plataforma de destino: el propio robot Microduck (bípedo de 25 cm), cuyo cómputo de a bordo no se detalla en la información disponible.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto) y la app MicroDuck mediante `manifest.json`. Otros runtimes compatibles con ONNX no están documentados ni validados por el autor.
- Latencia y throughput: no disponibles. Como referencia derivada de la especificación, el lazo a 50 Hz impone un presupuesto de 20 ms por paso de control, que debe cubrir la inferencia más la comunicación con los actuadores.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Frecuencia | Duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-spin-frenzy | Política de control ONNX para Microduck | 61 obs. / 14 joints | 50 Hz | 11,2 s | No disponible | Hugging Face, 0 descargas |
| microduck-midnight-snack | Política de control del mismo autor (`microduckapp`) | No disponible | No disponible | No disponible | No disponible | Hugging Face, dentro de un perfil con 16 modelos |
| Políticas de locomoción RL para bípedos de talla similar | Políticas de control (checkpoints de RL) | Variable | Variable | Variable | Variable según proyecto | Repositorios académicos y de robótica abierta; sin datos comparables publicados para este caso |

No se dispone de datos de rendimiento de ninguno de los términos de la comparación, por lo que no es posible establecer una comparación cuantitativa de calidad, estabilidad o eficiencia.

## Limitaciones y advertencias

- Licencia no especificada: sin licencia explícita no puede asumirse permiso de uso comercial, redistribución ni modificación. Es un bloqueo potencial para integración en producto.
- Ausencia total de documentación de entrenamiento: no se conoce el simulador, el algoritmo, la distribución de datos ni si hubo ajuste en hardware real, lo que impide estimar la robustez ante perturbaciones.
- Sin métricas de evaluación: no hay tasas de éxito, errores de seguimiento ni pruebas de repetibilidad; la única evidencia es un vídeo de previsualización.
- Riesgo de transferencia sim-a-real: si la política se entrenó en simulación (no confirmado), el comportamiento puede degradarse ante cambios de fricción, masa, desgaste de servos o superficies distintas.
- Dependencia del `manifest.json` y de la app MicroDuck: la compatibilidad de versión no está documentada y podría romper la instalación en futuras revisiones del ecosistema.
- Requisito de tiempo real: a 50 Hz, cualquier sobrecoste de inferencia o de comunicación por encima de 20 ms por paso altera la ejecución del movimiento.
- Seguridad física: el movimiento implica giros repetidos con la cabeza extendida; conviene ejecutarlo en superficie despejada, con topes de par y supervisión, y verificar que el robot no golpee obstáculos durante los giros.
- Sesgo y alucinación: no aplican en el sentido habitual al no ser un modelo generativo de lenguaje; el riesgo equivalente es una acción motriz incorrecta o inestable no detectable por el propio modelo.
- Idiomas: no aplica; la ficha de Hugging Face no declara idiomas y el modelo no procesa texto.
- Madurez: 0 descargas y 0 likes, publicación sin señales de validación por parte de la comunidad.
- Metadatos incompletos: los campos de licencia, idiomas y tamaño efectivo del artefacto aparecen vacíos o redondeados, lo que dificulta la auditoría del paquete.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-spin-frenzy
- Perfil del autor en Hugging Face: https://huggingface.co/microduckapp
- Repositorio del robot Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Cobertura del lanzamiento de Microduck (MarkTechPost): https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Cobertura del lanzamiento de Microduck (The AI Insider): https://theaiinsider.tech/2026/08/28/hugging-faces-pollen-robotics-releases-small-cute-open-source-microduck-robot/
- Modelos STEP 3D derivados de Microduck (repositorio de terceros): https://github.com/tianjin66/microduck-step-3d-models-ai-stl
