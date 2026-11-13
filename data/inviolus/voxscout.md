# inviolus/VoxScout

## Resumen

VoxScout es un detector de personas en imágenes aéreas diseñado para operaciones de búsqueda y rescate con drones. Lo desarrolla el autor de GitHub ErdemWilkinson bajo la organización `inviolus` en Hugging Face, y se distribuye como un modelo Keras con exportación a TFLite cuantizada en int8. El modelo recibe teselas RGB de 160×160 píxeles procedentes de una cámara cenital y devuelve una rejilla de 40×40 con mapas de calor de centros de persona y dimensiones de caja, siguiendo un esquema CenterNet sin anclas.

Técnicamente se apoya en la columna vertebral de EfficientNet-B0 con pesos ImageNet de Keras (licencia Apache 2.0), a la que se añade una cabeza de detección y se afina sobre el conjunto de datos HERIDAL. Cuenta con 4.355.142 parámetros y un fichero int8 de 5,2 MB, lo que lo sitúa en la gama de modelos ligeros desplegables en sistemas embebidos, estaciones en tierra o teléfonos. Forma parte del ecosistema VoxHOD, del que reutiliza el pipeline de datos, el código de entrenamiento y la evaluación, pero del que se diferencia por partir de pesos preentrenados en lugar de entrenarse desde cero.

Su relevancia actual radica en la reducción drástica de falsos positivos: según la model card, con la misma tasa de detección que las recetas VoxHOD, VoxScout genera entre 6 y 9 veces menos falsas alarmas, un factor crítico en tareas de búsqueda y rescate donde el coste de revisar falsos positivos es alto. El modelo se publica bajo licencia CC BY 4.0 y el autor advierte que la precisión del fichero int8 y su velocidad en dispositivo aún no se han medido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 como backbone con cabeza de detección CenterNet sin anclas (anchor-free) |
| Parametros totales | 4.355.142 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de 160×160 RGB) |
| Tipos de cuantizacion | Post-training quantization full int8 (fichero `voxscout_int8.tflite`); modelo float en `voxscout.h5` |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.h5` (Keras float), `.tflite` (int8) |

## Arquitectura y entrenamiento

La arquitectura parte de EfficientNet-B0 preentrenada en ImageNet, con características de stride 8, 16 y 32 fusionadas en una cabeza estilo CenterNet sin anclas. La entrada es una tesela RGB de 160×160 escalada a `[-1, 1]` mediante `pixel / 127.5 - 1`, que internamente se redimensiona a 320 píxeles. La salida es una rejilla de 40×40×3 con stride 4: el canal 0 contiene el mapa de calor de centros de persona con activación sigmoide, y los canales 1 y 2 contienen `log(width)` y `log(height)` de la caja en celdas de la rejilla. Las detecciones se obtienen como máximos locales del mapa de calor mediante max-pool 3×3 con un umbral sugerido de 0,34, elegido sobre el conjunto de validación.

El entrenamiento se realizó sobre HERIDAL (CC BY 3.0), utilizando únicamente la partición de entrenamiento del split con localizaciones retenidas de VoxHOD (`voxhod_g`, 55% de las teselas), por lo que el modelo vio menos datos que las versiones publicadas de VoxHOD v3 y nano. Se empleó la receta `train.py` de VoxHOD con `VOX_ARCH=effb0` durante 60 minutos en una GPU de portátil, 19 épocas, batch de 8, learning rate de 5e-4 con decaimiento coseno y conservación de la última época. La exportación se hizo con `scripts/export_large.py` de VoxHOD. No se documenta uso de RLHF ni DPO, al tratarse de un modelo de visión supervisado.

## Capacidades

- Detección de personas en imágenes aéreas cenitales a partir de teselas de 160×160 píxeles.
- Localización con caja delimitadora: devuelve centro y dimensiones (`width`, `height`) de cada persona detectada.
- Detección sin anclas basada en mapa de calor de centros, con umbral configurable (sugerido 0,34).
- Funcionamiento en dos etapas: puede actuar como segunda etapa que verifica solo las teselas mejor puntuadas por un modelo más pequeño.
- Despliegue en estación en tierra, teléfono, ordenador de acompañamiento o microcontrolador (con expectativas de latencia mayores en este último).
- Exportación int8 para inferencia eficiente en dispositivos con recursos limitados.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni procesamiento de lenguaje natural.
- No dispone de capacidades multilingües ni de modalidad de audio o vídeo.

## Casos de uso

- Búsqueda y rescate con drones: el modelo procesa teselas cenitales de la cámara del dron y marca las posiciones de personas, permitiendo al equipo de rescate priorizar la revisión de zonas con detecciones. Su baja tasa de falsos positivos (0,036 por tesela a 78% de recall en HERIDAL) reduce la carga de revisión manual.
- Segunda etapa de verificación en pipeline en cascada: un modelo pequeño como VoxHOD nano (75 KB) filtra todas las teselas y VoxScout verifica únicamente las mejor puntuadas, aprovechando su mayor precisión sin penalizar el consumo energético global.
- Estación en tierra con CPU: con un tiempo de aproximadamente 0,4 s por tesela en CPU de portátil (TFLite, 2 hilos), puede integrarse en un equipo de tierra que recibe las imágenes del dron por enlace de datos y ejecuta la detección en tiempo casi real.
- Despliegue en teléfono o tableta de campo: el fichero int8 de 5,2 MB cabe holgadamente en dispositivos móviles, lo que permite a equipos de rescate sin infraestructura de servidores ejecutar la detección localmente.
- Vigilancia de perímetros y recuento de personas en imágenes aéreas: la salida de cajas y puntuaciones permite estimar número y posición de personas en una escena, útil para monitorización de aforos o control de zonas restringidas.
- Investigación en detección aérea: al publicarse el código de entrenamiento y evaluación junto con los pesos, sirve como línea base reproducible para experimentos con HERIDAL y para comparar estrategias de preentrenamiento frente a entrenamiento desde cero.
- Integración en sistemas de alerta temprana: el modelo puede ejecutarse periódicamente sobre capturas de dron y disparar alertas cuando la puntuación máxima supera el umbral, con la ventaja de que la tasa de falsas alarmas en terreno no visto (NOMAD) es de 0,14 por tesela vacía.

## Benchmarks y rendimiento

Resultados del modelo float sobre el conjunto de test de HERIDAL, comparados con modelos int8 de VoxHOD nano y v3 entrenados sobre el mismo split. El umbral se eligió sobre validación (recall de validación 78,1%) y luego se evaluó en test.

| Medida | VoxHOD nano | VoxHOD v3 | VoxScout (float) |
|---|---:|---:|---:|
| Recall en test HERIDAL a 0,1 falsas alarmas por tesela | 66,0% | 66,0% | 84,1% |
| Recall en test HERIDAL a 0,2 falsas alarmas por tesela | 74,7% | 74,6% | 87,1% |
| Recall en test HERIDAL a 0,3 falsas alarmas por tesela | 77,6% | 77,3% | 88,2% |
| Falsas alarmas por tesela a 78% de recall en HERIDAL | 0,32 | 0,33 | 0,036 |
| Falsas alarmas por tesela vacía en NOMAD (terreno no visto) | 0,84 | 0,88 | 0,14 |
| Recall / falsas alarmas por tesela en WiSARD (otra cámara) | 58,1% / 0,29 | 50,5% / 0,33 | 53,6% / 0,03 |
| Recall en WiSARD sobre personas de 8-16 px | 30,7% | 31,8% | 22,6% (peor) |

Con umbral 0,34, VoxScout alcanza un 79,8% de recall y un 67,0% de precisión en el test de HERIDAL (WiSARD: 53,6% / 77,2%). El autor atribuye la mejora a los pesos preentrenados en ImageNet y no al tamaño: un modelo VoxHOD de tamaño v3 (2,6 veces nano) entrenado desde cero no alcanza estas cifras. No se han publicado resultados de benchmarks para el fichero int8, cuya precisión y velocidad en dispositivo aún no se han medido.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 4,36 millones de parámetros y entrada de 160×160, la huella es muy reducida y cabe en cualquier GPU consumer con varios GB de VRAM.
- GPU recomendadas: el autor reporta entrenamiento en una GPU de portátil durante 60 minutos; para inferencia no se especifican modelos concretos. Cualquier GPU NVIDIA consumer (por ejemplo, RTX 3060 o superior) es sobradamente suficiente.
- Cabe en GPU consumer: sí, con margen amplio, dado el reducido número de parámetros y el tamaño de entrada.
- Latencia conocida: aproximadamente 0,4 s por tesela en CPU de portátil con TFLite y 2 hilos. En ESP32-P4 el autor estima segundos por tesela, sin medición.
- Opciones de despliegue: TFLite (recomendado para int8, con ejemplo de código en la model card), Keras/TensorFlow para el modelo float (`tf.keras.models.load_model(path, compile=False)`). No se mencionan vLLM, llama.cpp ni TGI, que no aplican a este tipo de modelo.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Recall HERIDAL a 0,1 FA/tesela | Falsas alarmas a 78% recall | Licencia |
|---|---:|---|---:|---:|---|
| VoxScout | 4.355.142 | 160×160 RGB | 84,1% | 0,036 | CC BY 4.0 |
| VoxHOD nano | no disponible (fichero de 75 KB int8) | teselas del pipeline VoxHOD | 66,0% | 0,32 | no disponible en la información proporcionada |
| VoxHOD v3 | no disponible (fichero de 197 KB int8) | teselas del pipeline VoxHOD | 66,0% | 0,33 | no disponible en la información proporcionada |

La comparación directa se establece con las recetas VoxHOD nano y v3 entrenadas sobre el mismo split, no con los ficheros publicados de VoxHOD. VoxScout ofrece mayor recall y muchas menos falsas alarmas, a costa de un tamaño mayor (5,2 MB int8 frente a 75-197 KB) y de un rendimiento peor en personas de 8-16 píxeles en la cámara WiSARD (22,6% frente a 30,7-31,8%). No se dispone de datos de otros detectores aéreos comparables en la información proporcionada.

## Limitaciones y advertencias

- La precisión del fichero int8 no se ha medido; solo se han publicado resultados del modelo float. Cualquier uso en producción del int8 debe validarse empíricamente.
- La velocidad en dispositivo del int8 tampoco se ha medido; la estimación de segundos por tesela en ESP32-P4 es del autor y no está verificada.
- Una sola ejecución de entrenamiento: no hay media de múltiples semillas, lo que limita la robustez estadística de los resultados.
- Rendimiento peor en personas muy pequeñas (8-16 px) en la cámara WiSARD: 22,6% de recall frente a 30,7-31,8% de las recetas VoxHOD.
- Entrenado únicamente con HERIDAL (55% de las teselas del split `voxhod_g`), por lo que la generalización a otros terrenos, altitudes, cámaras y condiciones de iluminación está limitada; la evaluación en NOMAD y WiSARD muestra degradación en escenarios fuera de distribución.
- Riesgo de falsos positivos y negativos inherente a la detección: a umbral 0,34, la precisión en HERIDAL es del 67,0%, lo que implica que aproximadamente un tercio de las detecciones son falsas.
- No procesa lenguaje ni tiene capacidades de razonamiento, tool calling o agentes; su uso está restringido a detección visual.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero conviene revisar los términos de las licencias de los datos de entrenamiento (HERIDAL, CC BY 3.0) y de los pesos base (EfficientNet-B0, Apache 2.0) para el cumplimiento completo.
- El repositorio de Hugging Face muestra 0 descargas y 0 likes en el momento de la consulta, y un tamaño de repo de 0,0 GB; la disponibilidad y mantenimiento del proyecto deben verificarse antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inviolus/VoxScout
- Repositorio GitHub de VoxScout: https://github.com/ErdemWilkinson/VoxScout
- Repositorio GitHub de VoxHOD: https://github.com/ErdemWilkinson/VoxHOD
- Conjunto de datos HERIDAL: https://zenodo.org/records/5662351
