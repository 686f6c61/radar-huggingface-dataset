# mdhamidhosen/tartanimu-unified-hosen42

## Resumen

TartanIMU unified es un modelo de odometría inercial desarrollado por el equipo Hack2Publish (Md. Hamid Hosen, Esfer Sami y Kahakashan Ashraf) para el TartanIMU Challenge de IROS 2026, organizado con datos de CMU AirLab. No es un modelo de lenguaje: dada una señal IMU bruta de 6 ejes (`[ax, ay, az, gx, gy, gz]`) a 200 Hz con la gravedad retenida, predice el vector medio de velocidad 3D en el sistema de referencia del cuerpo para cada ventana de 1 segundo. Su rasgo distintivo es que un único conjunto de pesos sirve para cuatro plataformas distintas (coche, perro cuadrúpedo, dron y humano), sin clasificador de plataforma ni enrutamiento en inferencia.

La arquitectura es un híbrido convolutional-transformer de 3,9 M de parámetros: un tallo convolucional con stride reduce la señal de 200 Hz a tokens de 20 Hz, se añaden características strap-down deterministas (orientación relativa integrada con el giroscopio, aceleración sin gravedad, cambio de velocidad integrado, bajo ambas hipótesis de signo del eje z del giroscopio), después 8 bloques convolucionales temporales dilatados *depthwise* residuales con un campo receptivo de unos 13 s, y finalmente un encoder transformer de 3 capas con una cabeza de velocidad densa a 20 Hz que se promedia por ventana de 1 s. El repositorio incluye además una segunda entrada seleccionada en Kaggle, de 1,8 M de parámetros y arquitectura más estrecha (width-128, 2 capas).

Su relevancia práctica es doble: por un lado, es un ejemplo reproducible de odometría inercial de bajo coste que cabe en menos de 2 GB de VRAM y también funciona en CPU, sin acceso a internet ni datos externos; por otro, la model card documenta de forma explícita el cumplimiento de las reglas del challenge (sin *ensembling*, sin *test-time augmentation*, sin calibración de salida). La tracción pública es, sin embargo, nula en el momento de redactar esta ficha: 0 descargas y 0 *likes* en HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: tallo convolucional con stride + características strap-down deterministas + 8 bloques convolucionales temporales dilatados *depthwise* residuales + encoder transformer de 3 capas + cabeza de velocidad por token |
| Parámetros totales | 3,9 M (`model.pt`); variante secundaria de 1,8 M (`model_secondary_final_v4_160.pt`) |
| Parámetros activos | No aplicable (no es una arquitectura MoE) |
| Longitud de contexto | Fragmentos de entrada de 16 s a 200 Hz (3.200 muestras por canal); campo receptivo efectivo de ~13 s; en inferencia los fragmentos se deslizan sobre el trayecto completo con *stride* de 2 ventanas de 1 s y las predicciones solapadas se promedian con ponderación de Hann |
| Tipos de cuantización | No disponible (se distribuyen checkpoints PyTorch; no se documentan variantes cuantizadas) |
| Idiomas soportados | No aplicable (modelo de señales inerciales; no procesa texto ni audio) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch: `model.pt` y `model_secondary_final_v4_160.pt` (SHA-256 en `SHA256SUMS`) |
| Tarea | Regresión de velocidad 3D en sistema de referencia del cuerpo (m/s) por ventana de 1 s |
| Entrada | Únicamente `imu` (N,6) = `[ax, ay, az, gx, gy, gz]`, 200 Hz, gravedad retenida; sin etiqueta de plataforma, pose, marcas de tiempo ni metadatos |
| Salida | Un vector de velocidad de 3 componentes por ventana de 1 s (cabeza densa a 20 Hz promediada por ventana) |
| Plataformas cubiertas | Coche, perro (cuadrúpedo), dron y humano |
| Métrica pública en Kaggle | 0,28609 (entrada principal, submission 56402554); 0,28696 (entrada secundaria, submission 56332266). La model card no define la métrica ni su dirección |
| Librería | PyTorch |
| Descargas / likes | 0 / 0 |
| Tamaño del repositorio | 0,0 GB (según HuggingFace) |
| Fecha de creación / actualización | 2026-09-20 / 2026-09-20 |

## Arquitectura y entrenamiento

La tubería de inferencia procesa cada trayecto de forma independiente (nunca se concatenan). La señal IMU de 200 Hz se corta en fragmentos de 16 s que pasan por un tallo convolucional con *stride* que reduce la cadencia temporal a tokens de 20 Hz. En paralelo se calculan características strap-down deterministas: orientación relativa integrada con el giroscopio, aceleración sin componente gravitatoria, cambio de velocidad integrado, todo ello bajo las dos hipótesis posibles de signo del eje z del giroscopio. Esas representaciones alimentan 8 bloques de convolución temporal *depthwise* dilatada con conexiones residuales (~13 s de campo receptivo), seguidos de un encoder transformer de 3 capas sobre el fragmento y una cabeza de velocidad por token a 20 Hz. En test, los fragmentos se deslizan a lo largo del trayecto con *stride* de 2 ventanas y las predicciones solapadas se combinan mediante promediado con ponderación de Hann.

El entrenamiento usa exclusivamente los conjuntos de *train* y *validation* del challenge: sin datos externos y sin pesos preentrenados. Se emplea AdamW con planificador OneCycle, 160 épocas × 250 pasos con lotes de 64 fragmentos, EMA con factor 0,998 y SWA sobre las últimas 20 épocas. La función de pérdida combina Huber vectorial sobre la velocidad de ventana, 0,5 × Huber densa a 20 Hz, 0,2 × pérdida de error integrado (*drift*) y 0,05 × entropía cruzada auxiliar de plataforma (usada solo como señal de entrenamiento, nunca para enrutar en inferencia). El muestreo es uniforme entre plataformas y uniforme entre trayectos dentro de cada plataforma. Como aumentación se aplican rotaciones aleatorias del montaje del sensor (≤ 15°, y ≤ 45° en fragmentos de dron) sobre la IMU y el objetivo, dilatación temporal físicamente exacta (× 0,77–1,3) y ruido blanco, de sesgo y de escala sobre la IMU. Para cumplir las reglas del challenge, en inferencia se usa un único modelo y un único conjunto de pesos: sin *ensembling*, sin *test-time augmentation*, sin calibración, suavizado ni escalado de salida y sin adaptación en test.

## Capacidades

- Regresión de velocidad 3D (tres componentes) en el sistema de referencia del cuerpo, agregada por ventana de 1 s, a partir de IMU bruta de 6 ejes.
- Generalización multi-plataforma con un único conjunto de pesos: coche, perro cuadrúpedo, dron y humano.
- Ingesta de señal a 200 Hz con gravedad retenida, sin necesidad de preprocesado de actitud, pose ni etiqueta de plataforma.
- Inferencia determinista: TF32 desactivado; las diferencias entre GPUs son ≤ 1e-3 m/s y la reproducción del CSV enviado es ≤ 0,005 m/s por ventana.
- Predicciones densas a 20 Hz internamente, agregadas a una velocidad por ventana de 1 s.
- Ejecución en CPU (`--device cpu`) y en GPU con menos de 2 GB de VRAM.
- Salida en formato CSV de *submission* e impresión del MD5 del fichero escrito como verificación de integridad.
- *Tool calling* / *function calling*: no aplicable (no es un modelo generativo ni de lenguaje).
- Soporte de agentes o razonamiento multi-paso: no aplicable.
- Capacidades multilingües: no aplicable.
- Capacidades especiales (modo *thinking*, visión, audio): no aplicable.

## Casos de uso

- Odometría inercial para robótica móvil en interiores: en almacenes o túneles donde el GNSS no está disponible, el modelo estima la velocidad del robot directamente de la IMU y puede alimentar un filtro de fusión junto a LiDAR o ruedas.
- Integración con VIO/SLAM como fuente de velocidad previa: la salida a 20 Hz (dentro del fragmento) y 1 Hz por ventana puede usarse como término de *prior* cinemático para reducir la deriva de un sistema visual-inercial.
- Navegación de drones en interior: la model card menciona aumentación específica con rotaciones de hasta 45° para fragmentos de dron, lo que sugiere tolerancia a montajes variables; útil para estimar velocidad cuando el GPS y el flujo óptico fallan.
- Robótica cuadrúpeda: estimación de velocidad del cuerpo para control de locomoción o *state estimation* en robots tipo perro.
- Análisis de marcha y *wearables*: con la plataforma humana incluida, el modelo puede estimar la velocidad de desplazamiento a partir de una IMU portada, sin etiquetas ni datos de pose.
- Etiquetado automático de *datasets*: generar velocidades de referencia en grandes volúmenes de registros inerciales para preentrenar o validar otros sistemas de odometría.
- Despliegue en *edge*: con menos de 2 GB de VRAM y funcionamiento en CPU, puede ejecutarse en un equipo sin GPU dedicada, aunque para el conjunto de 89 trayectos el coste en CPU es de decenas de minutos.
- Reproducción de resultados de investigación: los dos checkpoints y sus puntuaciones públicas permiten reproducir y comparar entradas del TartanIMU Challenge con un entorno fijado en `requirements.txt`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no aplican MMLU, HumanEval ni GSM8K). Los únicos datos cuantitativos son las puntuaciones públicas del leaderboard de Kaggle:

| Entrada | Checkpoint | Parámetros | Puntuación pública Kaggle | ID de submission | MD5 del CSV |
|---|---|---|---|---|---|
| Principal | `model.pt` | 3,9 M | 0,28609 | 56402554 | fd12d4f25d7b52d44aaa4e4a14534378 |
| Secundaria | `model_secondary_final_v4_160.pt` | 1,8 M | 0,28696 | 56332266 | No disponible |

Notas: la model card no define la métrica del challenge ni indica si valores menores son mejores, por lo que no se puede interpretar la diferencia entre ambas entradas. Tampoco se publican comparaciones con líneas base clásicas (integración strap-down, EKF, INS) ni resultados sobre conjuntos externos al challenge.

## Requisitos de hardware

- VRAM: menos de 2 GB por GPU para inferencia (dato explícito de la model card).
- Peso de los checkpoints: aproximadamente 16 MB en fp32 para la entrada principal (estimación a partir de 3,9 M de parámetros) y unos 7 MB para la variante de 1,8 M; el formato de precisión no se especifica.
- GPU: se cita ejecución en P100 y T4 de Kaggle; no se enumeran modelos concretos adicionales ni se declara una GPU mínima más allá del requisito de VRAM.
- GPU de consumo: cabe holgadamente en cualquier GPU *consumer* con 2 GB o más de VRAM; no se documentan pruebas específicas.
- CPU: soportada mediante `--device cpu`, con un coste de decenas de minutos para el conjunto de test de 89 trayectos.
- Throughput y latencia: aproximadamente 1 minuto para los 89 trayectos de test en una GPU (sin especificar el modelo). No se documenta la latencia por ventana ni el rendimiento en tiempo real.
- Despliegue: scripts propios `infer.py` y `model.py` con PyTorch y un `requirements.txt` fijado; no se mencionan exportaciones a ONNX, TorchScript, TensorRT ni integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Determinismo: TF32 desactivado; las diferencias entre GPUs son ≤ 1e-3 m/s y la reproducción del CSV enviado es ≤ 0,005 m/s por ventana. No se requiere acceso a internet.

## Comparativa con modelos similares

No disponible. La model card no incluye comparaciones con líneas base de odometría inercial (integración strap-down, filtros EKF/UKF, redes recurrentes o convolucionales previas) ni con otras entradas del TartanIMU Challenge, y la búsqueda web realizada no devolvió información técnica relacionada con este modelo. No es posible construir una tabla comparativa con datos verificables.

## Limitaciones y advertencias

- Dominio restringido: el modelo se entrena solo con los conjuntos de *train* y *validation* del TartanIMU Challenge, sobre cuatro plataformas y montajes de sensor concretos; no hay validación en dominios externos.
- Requisitos de entrada estrictos: señal de 6 ejes a 200 Hz con gravedad retenida. Otras frecuencias de muestreo, IMUs de 9 ejes con magnetómetro o señales con gravedad eliminada no están soportadas de forma documentada.
- Sin metadatos: el modelo ignora etiqueta de plataforma, pose, marcas de tiempo y cualquier metadato, por lo que no utiliza información temporal absoluta ni restricciones de continuidad entre trayectos.
- Deriva: aunque la pérdida incluye un término de error integrado con peso 0,2, no se publican evaluaciones de deriva a largo plazo ni de error acumulado por trayecto.
- Métrica no documentada: la puntuación pública (~0,286) corresponde a una métrica que la model card no define, lo que impide interpretar el margen de error en unidades físicas.
- Variabilidad numérica reproducible pero no exacta: se admite una diferencia de hasta 0,005 m/s por ventana al regenerar el CSV en otro dispositivo.
- Tracción nula: 0 descargas y 0 *likes* en HuggingFace en el momento de esta ficha, sin validación independiente por parte de terceros.
- Licencia: apache-2.0 permite uso comercial y modificación, pero el challenge puede imponer condiciones propias sobre el uso de los datos, que no se distribuyen en el repositorio (tamaño reportado de 0,0 GB).
- Cumplimiento: las restricciones del challenge (sin *ensembling*, sin TTA, sin calibración) implican que el modelo se entrega sin ningún ajuste de escala de salida, lo que puede traducirse en sesgo sistemático de magnitud de velocidad.
- Sesgos de datos: el muestreo uniforme entre plataformas y la pérdida auxiliar de clasificación de plataforma sugieren desbalance en el conjunto original; la pérdida auxiliar solo actúa en entrenamiento y no enruta la inferencia.
- Alucinación, sesgos lingüísticos y limitaciones idiomáticas: no aplicables a este tipo de modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mdhamidhosen/tartanimu-unified-hosen42
- Competición TartanIMU Challenge (IROS 2026): https://www.kaggle.com/competitions/tartan-imu-challenge-iros2026
- Código de entrenamiento, configuraciones e informe técnico: https://github.com/hamidhosen42/TartanIMU-Challenge-Multi-Platform-Inertial-Odometry
- Submissions de Kaggle citadas: 56402554 (entrada principal) y 56332266 (entrada secundaria); no se proporciona URL directa.
- Búsqueda web: no se encontraron resultados relevantes sobre el modelo. Los resultados devueltos corresponden a páginas de la Serie A (legaseriea.it) y no guardan relación con el contenido de esta ficha.
