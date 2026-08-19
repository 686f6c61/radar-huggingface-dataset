# ftc8565/replitedet-s0

## Resumen

RepLiteDet-S0 es un modelo de detección de objetos en formato TFLite, cuantizado a 8 bits, desarrollado por el equipo FTC 8565 para la temporada 2026-2027 de la First Tech Challenge (FTC), concretamente para el juego BioBuzz. Su función es detectar el elemento de juego denominado "Pollen" en tiempo real, y está diseñado como un reemplazo directo (drop-in) para el coprocesador de visión Limelight 3A, muy utilizado en robótica educativa.

El modelo resuelve el problema del rendimiento deficiente de los detectores SSD-MNV2 estándar en objetos muy pequeños (menos de 10 píxeles) y en entornos con alta densidad de elementos. Según los datos publicados, consigue un mAP@0.5 de 0.9365 frente al 0.8516 del mismo pipeline con SSD-MNV2, y reduce el tamaño del archivo de 4.96 MB a 0.64 MB, con una latencia de 52.8 ms en un Limelight 3A real. Su arquitectura combina un backbone propio, una fusión FPN-Lite y una cabeza SSD compartida, operando a una resolución de entrada de 320x320 píxeles.

La relevancia actual de este modelo radica en su enfoque de optimización extrema para hardware de borde (edge computing) y en su licencia Apache-2.0, que permite su uso y modificación sin restricciones comerciales. Aunque está especializado en un único objeto, su metodología de entrenamiento y cuantización ofrece un caso de estudio valioso para desarrolladores que trabajan con visión por computador en dispositivos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SSD (Single Shot Detector) con backbone propio, FPN-Lite y cabeza compartida |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (visión por computador, entrada de 320x320 píxeles) |
| Tipos de cuantizacion | int8 (8-bit TFLite) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite (.tflite) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de detección de una sola etapa (SSD). El grafo de entrenamiento incluye un backbone, una fusión FPN-Lite y una cabeza SSD compartida, con un total de 12,750 anclas. Sin embargo, el detector exportado elimina las cabezas P5 y P6, quedándose únicamente con P3 y P4, lo que reduce el número de anclas a 12,000. Esta poda permite reducir la latencia y el tamaño sin sacrificar significativamente la precisión en los rangos de distancia relevantes.

El entrenamiento se realizó sobre un conjunto de datos propio del equipo, compuesto por 3,546 objetos reales etiquetados, con especial atención a los objetos de menos de 10 píxeles (554 muestras en el pool de evaluación). El modelo se exporta cuantizado a int8 para TFLite, y el umbral de NMS (non-maximum suppression) se fija en 0.35. Los scripts de entrenamiento completos no están aún publicados, según la model card, pero se esperan en una próxima versión. No se menciona el uso de técnicas como RLHF o DPO, que no aplican a este tipo de modelo discriminativo.

## Capacidades

- Detección de objetos en tiempo real: especializado en la detección del elemento "Pollen" del juego FTC 2026-2027 BioBuzz.
- Optimización para objetos pequeños: alcanza un recall de 0.8213 en objetos de menos de 10 píxeles, lo que equivale a detectar 455 de 554 bolas lejanas en el conjunto de evaluación.
- Inferencia de baja latencia: 52.8 ms por frame en un Limelight 3A, un 39% más rápido que el baseline SSD-MNV2.
- Tamaño extremadamente reducido: 0.64 MB, lo que permite su despliegue en memorias flash limitadas y su transferencia rápida por red.
- Cuantización int8: compatible con aceleradores de hardware y CPUs de bajo consumo sin necesidad de GPU.
- Ejecución en runtime TFLite estándar: puede desplegarse en cualquier dispositivo que soporte TensorFlow Lite, no solo en Limelight.
- No es un modelo de lenguaje: no dispone de generación de texto, tool calling, razonamiento multimodal ni capacidades de agente.

## Casos de uso

- Robótica educativa (FTC): el caso principal. El modelo se sube al Limelight 3A a través de su interfaz web, seleccionando el runtime CPU. Permite al robot localizar el elemento Pollen en la mitad lejana del campo para navegar hacia él de forma autónoma.
- Control de precisión en intakes: gracias a su mAP@0.75 de 0.7581, el robot puede alinearse con precisión para recoger el elemento, no solo apuntar en su dirección. La caja de detección permite estimar la distancia al objeto.
- Visión por computador en dispositivos de bajo coste: al pesar solo 0.64 MB y ser int8, puede ejecutarse en Raspberry Pi, móviles Android o microcontroladores con runtime TFLite, sin necesidad de aceleradores externos.
- Prototipado rápido de detectores especializados: su licencia Apache-2.0 y su formato TFLite permiten a otros equipos o desarrolladores adaptarlo a otros objetos mediante fine-tuning, aunque los scripts de entrenamiento aún no están disponibles.
- Sistemas de seguimiento de objetos a distancia: su alto recall en objetos de menos de 10 píxeles lo hace adecuado para aplicaciones de vigilancia o seguimiento en entornos controlados donde los objetos son pequeños y el fondo es relativamente estable.
- Benchmarking de técnicas de cuantización y poda: sirve como referencia para evaluar el impacto de eliminar cabezas de detección (P5, P6) y cuantizar a int8 en términos de mAP y latencia en hardware real.

## Benchmarks y rendimiento

Los datos de rendimiento se han extraído directamente de la model card del autor. La evaluación se realizó sobre 3,546 objetos reales, con una resolución de entrada de 320x320 píxeles para RepLiteDet-S0 y 300x300 para los baselines.

| Metrica | RepLiteDet-S0 (propio) | SSD-MNV2 (pipeline propio) | SSD-MNV2 (entrenador online Limelight) |
|---|---|---|---|
| mAP@0.5 | **0.9365** | 0.8516 | 0.4605 |
| mAP@0.75 | **0.7581** | 0.5746 | 0.3044 |
| recall <10 px | **0.8213** | 0.6823 | 0.3285 |
| falsos positivos | **410** | 845 | 863 |
| tamano | **0.64 MB** | 4.96 MB | 4.96 MB |
| latencia en Limelight 3A | **52.8 ms** | 86.5 ms | 86.5 ms |

Además, para el subconjunto de 554 bolas de menos de 10 píxeles, el modelo consigue un recall de 0.8213 (455 detecciones correctas y 99 fallos) y un mean best IoU de 0.6669, que incluye los fallos como valor 0. La debilidad declarada por el autor es la precisión de la caja (box tightness) en objetos grandes y cercanos, donde la caja tiende a ser más laxa.

## Requisitos de hardware

- VRAM estimada: no aplica, ya que es un modelo TFLite int8 diseñado para CPU. No requiere GPU ni VRAM dedicada.
- GPU recomendadas: ninguna. El modelo está pensado para ejecutarse en el coprocesador Limelight 3A con runtime CPU, o en cualquier dispositivo con soporte TFLite.
- Compatibilidad con hardware de consumo: sí, cabe en cualquier dispositivo con runtime TFLite, incluyendo Raspberry Pi, teléfonos Android y microcontroladores con suficiente RAM (el archivo pesa 0.64 MB).
- Opciones de despliegue: Limelight 3A (interfaz web, runtime CPU), así como cualquier framework que soporte TFLite (TensorFlow Lite Interpreter, llama.cpp no aplica, TFLite Runtime).
- Latencia y throughput: 52.8 ms por frame en un Limelight 3A, lo que equivale a aproximadamente 19 FPS. En hardware más potente (como un smartphone moderno), la latencia podría ser significativamente menor, aunque no se proporcionan datos al respecto.

## Comparativa con modelos similares

La comparativa se realiza contra el detector SSD-MNV2, que es el estándar de facto en el ecosistema Limelight. No se dispone de datos de otros detectores como YOLO o EfficientDet en la información proporcionada.

| Caracteristica | RepLiteDet-S0 | SSD-MNV2 (pipeline propio) | SSD-MNV2 (entrenador online) |
|---|---|---|---|
| Arquitectura | SSD + backbone propio + FPN-Lite | SSD + MobileNetV2 | SSD + MobileNetV2 |
| Resolucion de entrada | 320x320 | 300x300 | 300x300 |
| Tamano del archivo | 0.64 MB | 4.96 MB | 4.96 MB |
| mAP@0.5 | 0.9365 | 0.8516 | 0.4605 |
| Latencia (Limelight 3A) | 52.8 ms | 86.5 ms | 86.5 ms |
| Licencia | Apache-2.0 | no disponible | no disponible |

La principal ventaja de RepLiteDet-S0 es su especialización: al estar entrenado únicamente para un objeto y optimizado mediante poda de cabezas y cuantización int8, supera ampliamente a un detector generalista reentrenado para la misma tarea. Su desventaja es la falta de generalidad: no puede detectar clases arbitrarias sin un reentrenamiento completo.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo detecta el elemento "Pollen" del juego FTC 2026-2027. No es un detector de objetos genérico y no funcionará para otras clases sin un reentrenamiento completo.
- Debilidad en cajas grandes: el autor indica que la precisión de la caja (box tightness) es deficiente en objetos grandes y cercanos (más de 45 píxeles), lo que puede afectar a la estimación de distancia en el intake.
- Dependencia del archivo de etiquetas: el modelo no se ejecuta en Limelight sin su archivo de etiquetas (labels) correspondiente. Ambos archivos son obligatorios.
- Scripts de entrenamiento no publicados: aunque la licencia es Apache-2.0, los scripts de entrenamiento no están disponibles en la versión actual, lo que limita la reproducibilidad y la adaptación a otros objetos.
- Riesgo de alucinación (falsos positivos): aunque el número de falsos positivos es bajo (410 en el conjunto de evaluación), sigue existiendo el riesgo de que el robot reaccione ante elementos que no son el Pollen, especialmente en entornos con texturas similares.
- Sesgos del dataset: el rendimiento está medido sobre un dataset específico de FTC (3,546 objetos). No se garantiza el mismo rendimiento en otros campos de juego, condiciones de iluminación o cámaras diferentes.
- Sin soporte de lenguaje: al ser un modelo de visión puro, no tiene capacidades de procesamiento de texto, tool calling ni razonamiento simbólico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ftc8565/replitedet-s0
- Paper asociado (referenciado en los tags): arXiv:2511.13453
- Documentación de despliegue en Limelight: no disponible en la información proporcionada (se menciona la interfaz web y el runtime CPU, pero no se incluye URL directa).
