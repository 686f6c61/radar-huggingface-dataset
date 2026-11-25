# mastic-choi/LimoPro_FOSCAR_Vision

## Resumen

LimoPro_FOSCAR_Vision es un modelo de visión por computador multitarea desarrollado por el equipo FOSCAR (autor mastic-choi) para el vehículo autónomo a escala LIMO PRO, en el marco de la competición AutoRace 2026 (CO-SHOW), donde obtuvo el premio a la mejor solución. El modelo parte de la arquitectura HybridNets, originalmente entrenada sobre BDD100K, y se ha afinado específicamente para el circuito de la competición y la cámara Orbbec Dabai DC1 (1280×720) del vehículo.

Se trata de un modelo compacto (13,4 millones de parámetros) que resuelve en una sola pasada de inferencia cuatro tareas de percepción: segmentación semántica de la zona transitable (carril propio), detección de líneas de carril, detección de líneas blancas transversales (líneas de parada y pasos de cebra) y detección de objetos de tráfico (peatones, señales de bifurcación, badenes, señales de "slow", zonas de aparcamiento y semáforos con su estado). Su relevancia radica en la eficiencia: sustituye varios modelos especializados por una única red que cubre las nueve misiones de la competición.

La versión publicada es la v6, que continúa el entrenamiento desde la v4 con 996 imágenes autolabeladas del recinto de la competición hasta la época 41, usando una única GPU H100 PCIe. El modelo está licenciado bajo MIT y los pesos se distribuyen en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HybridNets (backbone EfficientNet + cuello BiFPN + cabezas multitarea de detección y segmentación) |
| Parametros totales | 13,4 M (state_dict de 13.4M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible en la model card; el autor menciona despliegue con TensorRT FP16 en la versión solo de carriles, pero no se documentan cuantizaciones del modelo multitarea |
| Idiomas soportados | ko (coreano; las etiquetas de clase y la documentación están en coreano) |
| Licencia | MIT |
| Formato de pesos | safetensors (state_dict); JSON auxiliar de calibración de puntuaciones |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura HybridNets, una red multitarea que combina un backbone EfficientNet (compound_coef=3) con un cuello BiFPN y dos cabezas: una de detección de objetos con 12 clases y anclas configurables (ratios `[(0.62, 1.58), (1.0, 1.0), (1.58, 0.62)]` y escalas `[2^0, 2^0.70, 2^1.32]`) y una de segmentación multiclase con 4 canales de salida (fondo, zona transitable, carril, línea blanca transversal). La entrada es de 640×384 píxeles (resolución nativa 1280×720 redimensionada a 640×360 con padding vertical de 12 píxeles).

El entrenamiento parte de los pesos públicos de HybridNets entrenados sobre BDD100K y sigue una ruta de tres etapas: modelo original → v4 (reentrenamiento) → v6 (continuación desde v4 con 996 imágenes autolabeladas del recinto de la competición, hasta la época 41). Se aplicaron aumentos de datos para robustecer el modelo frente a la iluminación LED morada y azul del recinto, los reflejos en el suelo y las pantallas de distracción tras los semáforos. El autor indica que no publica una versión solo por su puntuación en el conjunto de prueba: exige que el modelo supere una verificación ejecutando el rosbag completo del recinto y descartando cualquier versión en la que la segmentación de zona transitable se caiga en una sola fotograma. No se documenta el uso de RLHF ni DPO (no aplica a un modelo de visión).

## Capacidades

- Segmentación semántica de la zona transitable (solo el carril propio, no toda la calzada).
- Detección de líneas de carril.
- Detección de líneas blancas transversales (líneas de parada y pasos de cebra).
- Detección de objetos de tráfico en 12 clases: peatón, señal de bifurcación (fork_sign), badén, señal de "slow", zona de aparcamiento, semáforo y estados rojo, amarillo y verde.
- Inferencia multitarea en una sola pasada de red (una sola cámara).
- Salida de puntuaciones por clase con calibración de temperatura por clase mediante `hybridnets_mt_v6_calib.json`.
- No soporta tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- Capacidad multilingüe no aplica; el etiquetado y la documentación están en coreano.
- No cubre las clases `limo` (índice 10) ni `cone` (índice 11), que no tienen datos de entrenamiento y no deben usarse.

## Casos de uso

- Percepción de un vehículo autónomo a escala en competición: el modelo procesa una única imagen de cámara y entrega en una pasada la zona transitable, los carriles y las líneas de parada, lo que permite al stack de control del LIMO PRO decidir la trayectoria con baja latencia y sin coordinar varios modelos.
- Detección de semáforos y su estado: las clases `traffic_light`, `light_red`, `light_yellow` y `light_green` permiten al vehículo detenerse o reanudar la marcha en cruces, con verificación previa de que no se confunde con las pantallas de distracción del recinto.
- Reconocimiento de señales de bifurcación: la clase `fork_sign` identifica el cartel de bifurcación y, combinada con el clasificador auxiliar `fork-sign-v0.3` (ONNX), distingue entre las opciones A y B para elegir el ramal correcto.
- Detección de badenes y señales de "slow": permite al vehículo reducir la velocidad antes de obstáculos de la pista, usando las clases `bump` y `slow` del canal de detección.
- Detección de zonas de aparcamiento: la clase `parking` facilita la maniobra de estacionamiento en la misión de aparcamiento de la competición.
- Detección de peatones: la clase `pedestrian` permite al vehículo frenar ante personas en la pista, un requisito de seguridad habitual en circuitos de competición.
- Segmentación de la zona transitable para planificación de trayectoria: la máscara del canal 1 (carril propio) alimenta el planificador de movimiento del vehículo, que solo considera transitable la región segmentada.
- Despliegue en hardware embebido: el modelo cabe en una Jetson Orin Nano (el autor midió 32 ms por inferencia con TensorRT FP16 para la variante solo de carriles), lo que lo hace apto para robótica de bajo consumo.

## Benchmarks y rendimiento

Los resultados publicados corresponden al conjunto de prueba del autor y comparan la versión v4 con la v6.

| Tarea y conjunto | v4 | v6 |
|---|---:|---:|
| Detección mAP@0.5, test sintético | 0,978 | 0,981 |
| Detección mAP@0.5, test del recinto | 0,987 | 0,987 |
| Detección mAP@0.5, test_bag real | 0,980 | 0,981 |
| Detección mAP@0.5, semáforos reales | 0,989 | 0,985 |
| Detección mAP@0.5, señales A·B en conducción | 0,944 | 0,955 |
| Segmentación zona transitable IoU, test sintético | 0,954 | 0,955 |
| Segmentación zona transitable IoU, test del recinto | 0,939 | 0,940 |
| Segmentación zona transitable IoU, test_bag real | 0,981 | 0,980 |
| Segmentación zona transitable IoU, bag real 11/16 | 0,973 | 0,969 |
| Carril IoU, test sintético | 0,806 | 0,811 |
| Carril IoU, test del recinto | 0,493 | 0,500 |
| Carril IoU, test_bag real | 0,832 | 0,837 |
| Carril IoU, bag real 11/16 | 0,864 | 0,874 |
| Línea de parada IoU, test sintético | 0,882 | 0,891 |
| Línea de parada IoU, test del recinto | 0,699 | 0,714 |
| Línea de parada IoU, bag real 11/16 | 0,883 | 0,885 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo de visión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 13,4 M de parámetros en FP16 el modelo ocupa del orden de decenas de MB, por lo que es desplegable en hardware muy limitado.
- GPU recomendadas: el autor entrenó con una H100 PCIe; para inferencia se ha validado en Jetson Orin Nano con TensorRT FP16 (32 ms por inferencia en la variante solo de carriles, según el autor).
- Cabe en GPU de consumo: sí, por tamaño; no se documentan mediciones concretas en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: PyTorch con el código original de HybridNets, TensorRT FP16 en Jetson Orin Nano; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión).
- Latencia y throughput: 32 ms por inferencia en Orin Nano con TensorRT FP16 para la variante solo de carriles; la velocidad del modelo multitarea no se ha medido según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Tareas | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LimoPro_FOSCAR_Vision v6 | 13,4 M | Detección + segmentación multitarea (4 canales) | 640×384 | MIT | Hugging Face, safetensors |
| HybridNets original (BDD100K) | no disponible | Detección + segmentación (zona transitable y carril) | 640×384 | MIT | GitHub, pesos públicos |
| Modelos específicos de carril (p. ej., variante solo carriles del autor) | no disponible | Solo carriles | no disponible | MIT (según el autor) | Repositorio del autor |

La comparativa con alternativas de la misma categoría (por ejemplo, otras redes multitarea para conducción autónoma) no está disponible en la información proporcionada. El autor compara explícitamente su modelo con el HybridNets original entrenado en BDD100K, señalando que este último confunde las líneas de paso de cebra y de parada con carriles y no segmenta bien las curvas junto a muros ni las zonas de aparcamiento.

## Limitaciones y advertencias

- El modelo está ajustado al circuito de AutoRace 2026 (moqueta negra, líneas amarillas continuas y blancas discontinuas, iluminación interior) y a la cámara Orbbec Dabai DC1 (1280×720) del LIMO PRO; el autor indica explícitamente que no puede usarse en carreteras reales.
- La IoU de carril en el conjunto de prueba del recinto (0,50) es notablemente inferior a la de otros conjuntos (0,81–0,87), lo que indica fragilidad en esa condición.
- Las clases `limo` (índice 10) y `cone` (índice 11) no tienen datos de entrenamiento; usar sus salidas produce resultados no fiables. La misión de conos se resolvió con LiDAR, no con este modelo.
- La clase `fork_sign` agrupa las señales A y B; la distinción requiere un clasificador auxiliar externo (`fork-sign-v0.3`, ONNX).
- Riesgo de alucinación y sesgos: no se documentan análisis específicos; al ser un modelo de visión, el riesgo se traduce en falsos positivos/negativos en detección y segmentación, especialmente bajo condiciones de iluminación no vistas en entrenamiento.
- La licencia MIT permite uso comercial, pero los pesos parten de pesos públicos entrenados sobre BDD100K, cuyas condiciones de uso deben verificarse por separado.
- El autor exige una verificación sobre el rosbag completo del recinto antes de publicar versiones; no se documenta un proceso equivalente para otros entornos.
- No se han medido la latencia ni el throughput del modelo multitarea completo; solo de la variante solo de carriles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mastic-choi/LimoPro_FOSCAR_Vision
- Repositorio GitHub (código de entrenamiento y evaluación, versiones anteriores): https://github.com/mastic-choi/LimoPro_FOSCAR_Vision
- Código de conducción del equipo: https://github.com/smoony0226/autorace2026
- Clasificador auxiliar de señales de bifurcación (ONNX): https://github.com/mastic-choi/LimoPro_FOSCAR_Vision/releases/tag/fork-sign-v0.3
- HybridNets original: https://github.com/datvuthanh/HybridNets
- BDD100K: https://www.bdd100k.com/
