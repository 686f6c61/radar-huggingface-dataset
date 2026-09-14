# CunYv/tartanimu-challenge-unified

## Resumen

TartanIMU Challenge — unified model (team `Tong Joye`) es un modelo de odometría inercial publicado por el usuario CunYv como reproducción de su envío al reto IROS 2026 TartanIMU Challenge: Multi-Platform Inertial Odometry. No es un modelo de lenguaje ni un modelo generativo: recibe una ventana de 1,0 s de IMU de 6 ejes (acelerómetro y giroscopio, con gravedad retenida) muestreada a 200 Hz y devuelve la velocidad media tridimensional en el sistema de referencia del cuerpo `(vx, vy, vz)`, en m/s. El modelo funciona con las cuatro morfologías del reto: coche, cuadrúpedo, dron y dispositivo portátil (handheld).

La arquitectura parte del tronco `Foundation_Model` publicado por los organizadores del reto (ResNet + LSTM, 5,72 M de parámetros) con sus cuatro cabezas específicas por morfología. Sobre él se añade un router interno de 128 → 128 → 4 (unos 17 k parámetros) que se evalúa sobre las características compartidas del tronco: la velocidad exportada es la combinación ponderada suave de las cuatro cabezas según los pesos del router, de modo que no hay un clasificador de plataforma externo ni una selección discreta de experto. En total, el checkpoint contiene 5,74 M de parámetros.

Su relevancia es doble. Por un lado, demuestra que un único conjunto de pesos puede cubrir varias morfologías sin recurrir a expertos separados, ensembling, media de checkpoints ni aumento de datos en test, algo explícitamente permitido por las reglas del reto. Por otro, ofrece un artefacto reproducible de extremo a extremo: el paquete oficial `tartan_imu` está vendorizado en el repositorio y el script `infer.py` convierte ficheros `.npz` de test en un CSV de envío de 30.644 filas en unos dos minutos sobre una RTX 4060 Laptop. La puntuación oficial declarada es de 0,391 (macro AVE 0,321 m/s, macro ATE20 1,008 m) sobre las 89 secuencias completas del conjunto de test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tronco ResNet + LSTM (`Foundation_Model`) con cuatro cabezas por morfología y router interno MLP (128 → 128 → 4) sobre características compartidas del tronco |
| Parametros totales | 5,74 M (checkpoint exportado); tronco 5,72 M; router ~17 k |
| Longitud de contexto | No aplica (no es un modelo de lenguaje). Ventana de entrada: 1,0 s de IMU de 6 ejes a 200 Hz, decimada a 40 Hz (40 muestras por ventana) |
| Tipos de cuantizacion | No disponible (se publica un único `checkpoint.pt` en precisión completa; el entrenamiento usó autocast bf16) |
| Idiomas soportados | No aplica (entrada numérica de IMU; sin entrada ni salida de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`checkpoint.pt`) más definición del modelo en `router_model.py` |
| Tarea (pipeline) | `robotics` / odometría inercial, estimación de velocidad |
| Entrada | Ventana de 1,0 s, 6 ejes (giroscopio + acelerómetro, canales ordenados `[gyro \| accel]`), gravedad retenida |
| Salida | Velocidad media 3D en sistema de cuerpo `(vx, vy, vz)` en m/s |
| Morfologías soportadas | Coche, cuadrúpedo, dron, handheld |
| Autor | CunYv |
| Publicación en HuggingFace | 13 de septiembre de 2026 (actualizado el 14 de septiembre de 2026) |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El modelo combina un tronco convolucional recurrente con un esquema de cabezas múltiples y enrutado aprendido. El tronco reutiliza el `Foundation_Model` publicado por los organizadores: un extractor ResNet seguido de una LSTM que procesa la secuencia de IMU decimada a 40 Hz. Sobre las características del tronco compartido se sitúan cuatro cabezas de regresión, una por morfología, y un router MLP de dos capas (128 → 128 → 4) que produce pesos de mezcla. La salida final es la combinación ponderada suave de las cuatro cabezas, de manera que el sistema no necesita clasificar la plataforma de forma explícita ni seleccionar un experto concreto en tiempo de inferencia.

El ajuste fino partió del checkpoint unificado liberado por los organizadores y se extendió durante 60 épocas sobre el split de entrenamiento etiquetado del reto (81.931 ventanas / 395 trayectorias), con optimizador AdamW, learning rate 1e-4 para tronco y cabezas y 5e-4 para el router, programación coseno con un epoch de calentamiento, tamaño de lote de 16 secuencias de 32 ventanas y autocast en bf16. La función de pérdida es el error euclídeo de velocidad enmascarado, con pesos alineados con la métrica, `w_i ∝ 1 / (ventanas en la trayectoria × trayectorias de la plataforma)`, más un término de entropía cruzada para el router con peso 0,3. Las ventanas se deciman de 200 Hz a 40 Hz y los canales se ordenan `[gyro | accel]`, exactamente como espera el modelo liberado. La selección del checkpoint se hizo sobre el split de validación etiquetado.

No hay innovaciones del tipo decodificación especulativa, atención lineal u optimizaciones de inferencia: la inferencia es una única pasada determinista por bloque de 512 ventanas, sin aumento de datos en test, sin ensembling y sin media de checkpoints, tal y como declara el autor en su declaración de cumplimiento.

## Capacidades

- Regresión de velocidad inercial: estima la velocidad media 3D en el sistema de referencia del cuerpo para una ventana de 1,0 s de IMU de 6 ejes.
- Generalización entre morfologías: un único conjunto de pesos cubre coche, cuadrúpedo, dron y handheld mediante las cuatro cabezas y el router interno.
- Enrutado aprendido interno: el router pondera las cabezas sobre características compartidas, sin clasificador de plataforma externo.
- Procesamiento por lotes: inferencia por bloques de 512 ventanas, adecuada para barrer secuencias completas de test.
- Inferencia determinista y reproducible: sin TTA, sin ensembling y sin media de checkpoints; se documenta el MD5 del envío (`95afd19308e0e3e9eb5af298958257cf`).
- Empaquetado autocontenido: el paquete oficial `tartan_imu` está vendorizado, por lo que solo se requieren `torch`, `numpy` y `pyyaml`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio: no es un modelo de lenguaje y carece de interfaz de texto.
- Capacidades multilingües: no aplica.

## Casos de uso

- Odometría de drones en entornos sin GNSS: la cabeza correspondiente a dron, activada por el router, permite estimar la velocidad del vehículo a partir únicamente de la IMU en interiores, túneles o cañones urbanos donde la señal satelital no está disponible.
- Estimación de velocidad para robots cuadrúpedos: con una ventana de 1,0 s de IMU a 200 Hz se obtiene la velocidad corporal, útil como observable en un filtro de navegación o como señal auxiliar en el control de marcha.
- Dead reckoning en vehículos: integración de la velocidad estimada para mantener una estimación de posición relativa en tramos sin GNSS, con corrección posterior cuando vuelva la señal.
- Preintegración de IMU en pipelines de SLAM visual-inercial: la velocidad de cuerpo estimada puede usarse como factor adicional en el grafo de optimización o como inicialización del estado durante periodos de oclusión visual.
- Seguimiento de dispositivos portátiles y wearables: la morfología handheld permite estimar la velocidad media de un dispositivo llevado por una persona, útil en aplicaciones de seguimiento de actividad o mapeo peatonal.
- Mapeo móvil y levantamiento en interiores: sobre plataformas con IMU de 200 Hz, el modelo aporta la componente de velocidad necesaria para reconstruir trayectorias en ausencia de referencias externas.
- Prototipado rápido en robótica de investigación: el paquete autocontenido y los 5,74 M de parámetros permiten ejecutar la evaluación completa del banco de pruebas en una GPU de portátil en unos dos minutos, lo que facilita iterar sobre nuevas variantes del router o de las cabezas.
- Complemento de bajo coste en sistemas multi-sensor: al ser un modelo ligero (aproximadamente 23 MB en fp32) puede convivir en la misma GPU que el resto del stack de percepción sin competir por memoria.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto completo de test oficial (89 secuencias, servicio de puntuación por secuencia):

| Metrica | Resultado | Ambito |
|---|---|---|
| TartanIMU Score | 0,391 | 89 secuencias de test |
| Macro AVE | 0,321 m/s | 89 secuencias de test |
| Macro ATE20 | 1,008 m | 89 secuencias de test |

Otros datos de rendimiento declarados:

| Metrica | Valor |
|---|---|
| MD5 del envio | `95afd19308e0e3e9eb5af298958257cf` |
| Filas del CSV de salida | 30.644 (mismas filas que `sample_submission.csv`) |
| Tiempo de inferencia | ~2 minutos sobre RTX 4060 Laptop GPU, bloques de 512 ventanas |
| Aumento de datos en test / ensembling / media de checkpoints | Ninguno |

No se han publicado resultados de benchmarks en la informacion disponible para métricas de propósito general (MMLU, HumanEval, GSM8K, etc.), que además no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: los 5,74 M de parámetros ocupan aproximadamente 23 MB en fp32 y unos 11,5 MB en bf16. El factor limitante es el lote de activaciones (bloques de 512 ventanas), no los pesos; el autor no publica la VRAM pico observada.
- GPU verificada: RTX 4060 Laptop GPU, con ~2 minutos para las 30.644 ventanas del envío completo (equivalente aproximado a 255 ventanas/s, cifra derivada de los datos de la model card, no medida directamente).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y unos pocos GB de memoria es suficiente. No se requieren A100 ni H100: el modelo es dos órdenes de magnitud más pequeño que un modelo de lenguaje de 7B.
- Cabe en GPU de consumo: sí, con holgura, en cualquier GPU de consumo reciente (RTX 3060, RTX 4060, RTX 4090, etc.).
- Ejecución en CPU: viable por tamaño de pesos, aunque no se publican tiempos de referencia en CPU.
- Opciones de despliegue: PyTorch 2.0 o superior con el script `infer.py` incluido y el paquete `tartan_imu` vendorizado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. No se publican exportaciones a ONNX, TorchScript ni TensorRT.
- Entorno: Python 3.10 o superior, `torch`, `numpy`, `pyyaml`; el paquete oficial `tartan_imu` puede instalarse aparte desde el repositorio de superxslam, aunque el repositorio ya incluye una copia.

## Comparativa con modelos similares

La información disponible solo permite comparar el modelo con el checkpoint del que deriva. No se dispone de datos comparativos con otros sistemas de odometría inercial.

| Modelo | Parametros | Entrada / salida | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| TartanIMU Challenge unified (este modelo) | 5,74 M (tronco 5,72 M + router ~17 k) | Ventana de 1,0 s de IMU de 6 ejes a 200 Hz → velocidad 3D de cuerpo | Ventana de 1,0 s (40 muestras tras decimado) | Apache-2.0 | TartanIMU Score 0,391; macro AVE 0,321 m/s; macro ATE20 1,008 m |
| `Foundation_Model` de TartanIMU (organizadores) | 5,72 M de tronco con cuatro cabezas por morfología | Igual | Igual | Apache-2.0 | No disponible en la información proporcionada (es el punto de partida del ajuste fino) |
| Otros sistemas publicados de odometría inercial | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han encontrado en la búsqueda web resultados relevantes sobre este modelo ni sobre alternativas comparables.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a instrucciones y no soporta tool calling, agentes ni razonamiento multi-paso.
- Salida limitada: devuelve únicamente la velocidad media por ventana, no posición, orientación ni covarianza de la estimación. Cualquier uso de navegación requiere integración y un filtro externo.
- Dependencia del dominio de sensores: el modelo asume IMU de 6 ejes a 200 Hz con gravedad retenida y canales ordenados `[gyro | accel]`. Cambios en la frecuencia de muestreo, el orden de canales, la calibración o el ruido del sensor pueden degradar las predicciones.
- Pérdida de información por decimado: el tronco trabaja a 40 Hz tras decimar desde 200 Hz, lo que descarta contenido de alta frecuencia que podría ser relevante en movimientos rápidos.
- Derivación en trayectorias largas: la odometría inercial pura tiende a acumular deriva al integrar la velocidad; el modelo no incorpora correcciones absolutas por sí mismo. Esta es una limitación general de la técnica y no un dato medido en este repositorio.
- Riesgo del router interno: la combinación ponderada suave de las cuatro cabezas puede comportarse de forma subóptima ante morfologías que no encajen bien en ninguna de las cuatro categorías del reto.
- Posible sobreajuste al conjunto del reto: el ajuste fino se realizó durante 60 épocas sobre el split de entrenamiento etiquetado del TartanIMU Challenge (81.931 ventanas / 395 trayectorias), con selección de checkpoint sobre el split de validación del mismo reto. El rendimiento fuera de esa distribución de datos no está documentado.
- Ausencia de validación por la comunidad: el repositorio registra 0 descargas y 0 likes, y no hay evidencia independiente que reproduzca las cifras declaradas.
- Licencia: los pesos se publican bajo Apache-2.0, lo que permite uso comercial, pero el repositorio incluye una copia vendorizada del paquete oficial TartanIMU con su propia licencia (`TARTANIMU_LICENSE`), que debe respetarse por separado.
- Metadatos del repositorio: las fechas de creación y actualización declaradas (septiembre de 2026) son posteriores a la fecha habitual de consulta y el tamaño del repositorio figura como 0,0 GB, lo que sugiere que los metadatos pueden no reflejar con exactitud el contenido real.
- Sin información sobre sesgos demográficos ni de otro tipo: no aplica en el sentido habitual, pero tampoco se documenta un análisis de sesgo por tipo de plataforma, sensor o condiciones de movimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CunYv/tartanimu-challenge-unified
- Paquete oficial TartanIMU: https://github.com/superxslam/TartanIMU
- Licencia del paquete vendorizado: fichero `TARTANIMU_LICENSE` dentro del repositorio del modelo
- Ficheros incluidos en el repositorio: `checkpoint.pt`, `router_model.py`, `infer.py`, `config/unified.yaml`, `config/resnet_lstm_multihead.yaml`, directorio `tartan_imu/`
- No se han encontrado otros enlaces relevantes (papers, blogs, demos o repositorios adicionales) en la búsqueda web realizada; los resultados obtenidos no guardan relación con el modelo.
