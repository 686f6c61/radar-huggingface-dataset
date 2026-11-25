# hajiqasim358/nextcut-frame-models

## Resumen

NextCut frame models es un repositorio de dos modelos de interpolación de fotogramas de vídeo convertidos a ONNX, publicados por el usuario hajiqasim358 para su uso dentro del editor de vídeo NextCut en dispositivos móviles. No se trata de un modelo de lenguaje, sino de un par de redes neuronales especializadas en generar fotogramas intermedios entre dos imágenes consecutivas, lo que permite obtener cámara lenta fluida a partir de metraje grabado a una tasa de fotogramas inferior.

El repositorio incluye dos variantes con compromisos distintos entre resolución de trabajo y coste computacional: `rife_lite_640x384.onnx`, basado en RIFE 4.25 lite del proyecto Practical-RIFE de hzwer (licencia MIT), y `ema_small_t_960x544.onnx`, basado en EMA-VFI small de MCG-NJU (licencia Apache-2.0), que además admite tiempos arbitrarios entre fotogramas. Ambos se distribuyen como grafos ONNX en opset 20, convertidos desde los pesos PyTorch originales y verificados contra ellos.

La relevancia de esta publicación es práctica: empaqueta dos modelos de investigación de interpolación de vídeo en un formato portable y ejecutable en el móvil, con una interfaz de entrada homogénea (dos imágenes y un instante temporal). El repositorio ocupa aproximadamente 0,1 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales de interpolación de fotogramas (RIFE lite y EMA-VFI small), exportadas a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión por fotogramas, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en el grafo ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT y Apache-2.0 (licencia compuesta "mit-and-apache-2.0"; ver LICENSE-RIFE y LICENSE-EMA-VFI) |
| Formato de pesos | ONNX (opset 20) |

Detalles adicionales de los dos ficheros:

| Fichero | Modelo base | Tamano de trabajo | Licencia |
|---|---|---|---|
| `rife_lite_640x384.onnx` | RIFE 4.25 lite (Practical-RIFE, hzwer) | 640x384 | MIT |
| `ema_small_t_960x544.onnx` | EMA-VFI small, tiempo arbitrario (MCG-NJU) | 960x544 | Apache-2.0 |

Interfaz de entrada y salida documentada por el autor:

| Elemento | Tipo | Forma | Rango |
|---|---|---|---|
| `img0` | float32 | [1,3,H,W] RGB | 0..1 |
| `img1` | float32 | [1,3,H,W] RGB | 0..1 |
| `t` | float32 | [1,1,1,1] | instante entre fotogramas |
| `frame` (salida) | float32 | [1,3,H,W] | fotograma interpolado |

## Arquitectura y entrenamiento

Los dos modelos proceden de líneas de investigación distintas en interpolación de fotogramas. RIFE (Real-Time Intermediate Flow Estimation) estima flujos intermedios de forma directa y en tiempo real, y la variante lite reduce el coste para despliegue en dispositivos con recursos limitados. EMA-VFI (Extracting Motion and Appearance via Inter-Frame Attention) emplea atención entre fotogramas para separar y extraer información de movimiento y de apariencia, lo que le permite además interpolar en tiempos arbitrarios mediante la entrada `t`, no solo en el punto medio entre dos fotogramas.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens o muestras, ni sobre procesos de ajuste posteriores: el repositorio es una conversión de pesos ya publicados por los autores originales, no un reentrenamiento. La innovación técnica del paquete es la exportación a ONNX en opset 20 con verificación numérica frente a PyTorch, junto con un `catalog.json` que recoge sumas de comprobación y tamaños de cada fichero para garantizar la integridad de la descarga.

## Capacidades

- Interpolación de fotogramas de vídeo: recibe dos fotogramas consecutivos y devuelve el fotograma correspondiente a un instante intermedio.
- Cámara lenta: al interpolar varios instantes entre cada par de fotogramas se obtiene una tasa de fotogramas efectiva superior a la original.
- Tiempo arbitrario: el modelo EMA-VFI small acepta un valor `t` continuo, lo que permite generar fotogramas en posiciones no centrales entre dos imágenes.
- Ejecución en dispositivo: el formato ONNX permite su despliegue en móvil mediante runtimes compatibles, que es el caso de uso declarado por el autor (editor NextCut).
- Entrada RGB normalizada en float32 en el rango 0..1, con salida del mismo tipo y resolución.
- No dispone de generación de texto, razonamiento, código, tool calling, capacidades de agente ni soporte multilingüe, al no ser un modelo de lenguaje.

## Casos de uso

- Cámara lenta en apps de edición móvil: integrado en el pipeline de NextCut, el modelo genera fotogramas intermedios entre los originales para reproducir a velocidad reducida sin el efecto de saltos que produce la simple repetición de fotogramas.
- Conversión de tasa de fotogramas: a partir de metraje grabado a 30 fps se puede generar una secuencia a 60 o 120 fps interpolando fotogramas en los instantes intermedios, útil para publicar en plataformas que admiten altas tasas.
- Estabilización visual de clips: al rellenar los huecos entre fotogramas se suavizan transiciones y se reduce el parpadeo en secuencias con movimiento rápido.
- Previsualización de animaciones: en pipelines de animación 2D o 3D se pueden interpolar fotogramas clave para revisar el movimiento antes de un render completo.
- Procesado por lotes en servidor: el formato ONNX se puede ejecutar con ONNX Runtime en infraestructura con GPU para interpolar clips completos fuera del dispositivo, manteniendo la misma interfaz de entrada.
- Restauración de metraje antiguo de baja tasa: interpolando entre fotogramas existentes se puede mejorar la percepción de fluidez de grabaciones con tasas muy bajas, siempre que el movimiento sea continuo.
- Integración en herramientas de código abierto: al ser conversiones de modelos MIT y Apache-2.0, se pueden incorporar en proyectos de edición de vídeo que necesiten interpolación sin depender de frameworks de PyTorch en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con entradas de 640x384 y 960x544 en float32 y dos modelos de tipo lite/small, el consumo esperado es bajo, pero el repositorio no publica cifras de memoria.
- GPU recomendadas: no disponible. El caso de uso declarado es la ejecución en teléfono mediante ONNX, por lo que no se documentan GPU de escritorio ni de centro de datos.
- GPU de consumo: no se confirma compatibilidad con modelos concretos (RTX 4090, etc.); el diseño apunta a runtimes ligeros en móvil más que a GPU de sobremesa.
- Opciones de despliegue: ONNX Runtime (incluida su variante móvil), dado que los pesos se distribuyen únicamente en formato ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El autor no publica tiempos de inferencia por fotograma ni por resolución.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución de trabajo | Tiempo arbitrario | Licencia | Formato |
|---|---|---|---|---|---|
| NextCut `rife_lite_640x384` | RIFE 4.25 lite | 640x384 | no documentado | MIT | ONNX |
| NextCut `ema_small_t_960x544` | EMA-VFI small | 960x544 | sí (entrada `t`) | Apache-2.0 | ONNX |
| Practical-RIFE (hzwer) | RIFE completo | variable | no documentado | MIT | PyTorch |
| EMA-VFI (MCG-NJU) | EMA-VFI | variable | sí | Apache-2.0 | PyTorch |

La comparación se limita a los proyectos de origen, ya que el repositorio no incluye datos de rendimiento frente a otras alternativas de interpolación. No se dispone de métricas como PSNR, SSIM o VFIPS que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no admite tool calling ni razonamiento; cualquier evaluación como modelo generativo de texto carece de sentido.
- No se publican métricas de calidad de interpolación (PSNR, SSIM, LPIPS) ni comparaciones con los modelos PyTorch originales más allá de la verificación numérica frente a PyTorch mencionada por el autor.
- El tamaño de trabajo está fijado en 640x384 y 960x544 según el fichero; no se documenta el comportamiento con otras resoluciones ni si el grafo admite entradas de tamaño dinámico.
- La interpolación de fotogramas puede producir artefactos en oclusiones, movimientos no rígidos o cambios bruscos de iluminación; no se documentan salvaguardas para estos casos.
- La licencia es compuesta ("mit-and-apache-2.0") y remite a los ficheros LICENSE-RIFE y LICENSE-EMA-VFI; para uso comercial debe verificarse cada componente por separado, ya que la licencia del repositorio figura como "other".
- El repositorio no registra descargas ni interacciones, y su fecha de creación es posterior a la fecha de consulta habitual de los datos, lo que aconseja tratar la información como no contrastada por la comunidad.
- No hay información sobre sesgos, idiomas ni alucinación, conceptos que no aplican a este tipo de modelo.
- No se documenta soporte, mantenimiento ni issues abiertos por parte del autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hajiqasim358/nextcut-frame-models
- Practical-RIFE (RIFE, hzwer): https://github.com/hzwer/Practical-RIFE
- Licencia de Practical-RIFE: https://github.com/hzwer/Practical-RIFE/blob/main/LICENSE
- EMA-VFI (MCG-NJU): https://github.com/MCG-NJU/EMA-VFI
- Paper de RIFE: Huang et al., "Real-Time Intermediate Flow Estimation for Video Frame Interpolation"
- Paper de EMA-VFI: Zhang et al., "Extracting Motion and Appearance via Inter-Frame Attention for Efficient Video Frame Interpolation", CVPR 2023
