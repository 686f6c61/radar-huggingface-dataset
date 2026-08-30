# JackieMM/progress_probe_repro

## Resumen

El repositorio `JackieMM/progress_probe_repro` no contiene un modelo de lenguaje ni un sistema de IA generativa, sino un script de Python independiente y documentado para reproducir y visualizar un "progress probe" a nivel de episodio. Este tipo de sonda de progreso es una técnica de interpretabilidad utilizada en robótica para predecir el avance de una tarea (por ejemplo, ensamblar un bloque o golpear con un martillo) a partir de representaciones latentes de un modelo de visión, en este caso con características de 960 dimensiones denominadas "concept". El autor, JackieMM, publica este código como material complementario a un experimento de investigación, con el objetivo de permitir a otros investigadores replicar los resultados y generar visualizaciones de los episodios.

El script implementa un pipeline completo: ajuste de una regresión ridge con validación cruzada sobre las características de concepto, construcción de mapeos entre archivos HDF5 de etiquetas y vídeos de demostración, y generación de vídeos de visualización (barra de progreso, curvas de error, comparación con el vídeo original). También incluye un módulo de clasificación de primitivas (reach, grasp, transition, release) sobre tareas robóticas. No se trata de un modelo preentrenado, sino de un código de reproducción que depende de datos externos de los conjuntos HIMACon y RobotWin 2.0.

La relevancia actual de este repositorio radica en la creciente demanda de herramientas de interpretabilidad para sistemas robóticos basados en aprendizaje por refuerzo y modelos de visión, así como en la necesidad de reproducibilidad en investigación. Sin embargo, al ser un script sin licencia especificada ni datos incluidos, su utilidad práctica está limitada a quienes ya dispongan de los conjuntos de datos mencionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (script de Python para regresion ridge y visualizacion) |
| Parametros totales | No aplica (no hay pesos de red neuronal) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Ingles (codigo y documentacion) |
| Licencia | No disponible |
| Formato de pesos | No aplica (el script genera checkpoints .joblib de los modelos ridge) |

## Arquitectura y entrenamiento

El repositorio no describe una arquitectura de red neuronal propia, sino que utiliza características precomputadas denominadas "concept" con dimension (T, 960), donde T es el número de pasos temporales de un episodio. Estas características provienen probablemente de un modelo HIMACon (un modelo de representación de vídeo) entrenado sobre datos de robótica. El script ajusta una regresión ridge sobre estas características para predecir una etiqueta de progreso generada linealmente a partir del tiempo (y = linspace(0,1,T)). El entrenamiento se realiza mediante validación cruzada (fit-cv) sobre episodios individuales, guardando los coeficientes en archivos .joblib. No se menciona el uso de RLHF, DPO ni otros métodos de alineación.

La innovación técnica principal es la organización del pipeline de reproducción: soporta dos diseños de datos (plano local y cross-embodiment), permite escanear el conjunto de datos disponible, construir mapeos entre episodios y vídeos (con verificación manual de imágenes), y generar visualizaciones en vídeo con múltiples paneles (progreso, error, vídeo original). También incluye un protocolo de clasificación de primitivas en 4 clases sobre tareas robóticas, con reglas detalladas en un documento aparte.

## Capacidades

- Regresion ridge con validacion cruzada sobre caracteristicas de concepto de 960 dimensiones para predecir progreso temporal.
- Construccion de mapeos entre archivos HDF5 de etiquetas y videos de demostracion, con verificacion visual opcional.
- Visualizacion de episodios individuales en formato MP4, con paneles de barra de progreso, curva de error, video original y video solo.
- Clasificacion de primitivas roboticas en 4 clases (reach, grasp, transition, release) mediante un modulo separado.
- Escaneo y generacion de manifiestos de datasets disponibles en rutas locales o cross-embodiment.

## Casos de uso

- Investigacion en interpretabilidad de modelos roboticos: el script permite reproducir el experimento de progress probe sobre cualquier tarea de RobotWin 2.0, facilitando el analisis de como las representaciones internas del modelo codifican el progreso de una tarea.
- Evaluacion de modelos de representacion visual (como HIMACon): al ajustar una regresion ridge sobre las caracteristicas extraidas, se puede comparar la calidad de diferentes representaciones para predecir el progreso.
- Generacion de material visual para publicaciones cientificas: las visualizaciones en video (curva de progreso, error) son utiles para ilustrar el comportamiento de la sonda en articulos o presentaciones.
- Depuracion de pipelines de datos roboticos: el comando scan-dataset ayuda a identificar que episodios, videos y etiquetas estan disponibles, evitando errores de mapeo.
- Estudio de generalizacion cross-embodiment: al soportar rutas de datos de multiples robots, permite analizar si el progress probe se transfiere entre configuraciones de hardware.
- Clasificacion de primitivas de manipulacion: el modulo de clasificacion puede utilizarse para segmentar episodios en fases (alcanzar, agarrar, transportar, soltar), util para el analisis de estrategias de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de rendimiento del progress probe (por ejemplo, correlacion entre prediccion y progreso real) ni comparaciones con otros metodos.

## Requisitos de hardware

- El script requiere acceso a los datasets HIMACon y RobotWin 2.0, que incluyen archivos HDF5 y videos MP4. Su tamano y ubicacion no se especifican.
- Para el ajuste de la regresion ridge (fit-cv), la carga de caracteristicas de dimension (T, 960) por episodio es ligera; se puede ejecutar en CPU con unos pocos GB de RAM.
- Para la visualizacion, se necesita una GPU para decodificar y procesar videos si se utilizan muchos episodios, aunque el script permite reducir la resolucion temporal con --step.
- No se indican requisitos minimos de VRAM ni GPUs especificas. Se recomienda un entorno con Python 3.8+ y las librerias habituales (numpy, joblib, opencv, h5py).
- Opciones de despliegue: no aplicable, ya que no es un servicio de inferencia sino un script de linea de comandos.

## Comparativa con modelos similares

No disponible. Este repositorio es un codigo de reproduccion especifico para un experimento de progress probe, no un modelo con alternativas comparables en el mismo repositorio. Existen otros trabajos de interpretabilidad en robotica (por ejemplo, sondas lineales sobre representaciones de políticas), pero no se dispone de datos suficientes para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- No incluye los datos de entrenamiento ni los videos; el usuario debe obtenerlos por sus propios medios, lo que limita la reproducibilidad inmediata.
- La licencia no esta especificada, por lo que no se garantiza el uso comercial ni la redistribucion del codigo.
- El mapeo entre episodios HDF5 y videos MP4 no es trivial (los nombres no coinciden siempre); el script requiere una verificacion manual de imagenes para evitar errores.
- No se proporcionan metricas de rendimiento del progress probe, por lo que no se puede evaluar su precision sin ejecutar el codigo sobre datos propios.
- El codigo parece estar orientado a un entorno especifico (rutas de /home/ydming y /data/share), aunque ofrece parametros para adaptarlo, puede requerir modificaciones.
- Al ser un script de investigacion, no esta optimizado para produccion: carece de manejo de errores robusto, logging estructurado y pruebas automatizadas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/JackieMM/progress_probe_repro
- Perfil del autor: https://huggingface.co/JackieMM
- Otros resultados de busqueda web no son relevantes para este repositorio.
