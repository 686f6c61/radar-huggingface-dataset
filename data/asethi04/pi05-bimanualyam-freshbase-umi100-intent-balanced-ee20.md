# ASethi04/pi05-BimanualYAM-freshbase-umi100-intent-balanced-ee20

## Resumen

El modelo `pi05-BimanualYAM-freshbase-umi100-intent-balanced-ee20` es un ajuste fino de Pi0.5, un modelo fundacional de robótica de tipo visión-lenguaje-acción (VLA) desarrollado por Qualcomm, orientado a la manipulación robótica bimanual. Ha sido creado por Amish Sethi (usuario ASethi04) y publicado en Hugging Face bajo la librería LeRobot. El modelo se ha entrenado durante 12 000 pasos de optimización sobre un conjunto de datos UMI (Universal Manipulation Interface) puro, con muestreo balanceado por intención de trayectoria y sin ningún frame de teleoperación, lo que constituye su principal característica experimental.

El modelo parte de la base `lerobot/pi05_base` y emplea un dataset denominado `dual-lidar-umi-independent`. Su tarea específica es la recogida de naranjas y su colocación en un cuenco, en un entorno bimanual. Con 4 143 404 816 parámetros (aproximadamente 4,14 mil millones), el modelo es de tamaño considerable para un VLA. La ventana de contexto, los idiomas soportados, la licencia y las cuantizaciones no se han documentado en la información disponible. La relevancia de este modelo radica en su enfoque de entrenamiento con datos canónicos UMI y balanceo por intención, una alternativa a los flujos habituales de teleoperación en robótica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pi0.5 (modelo de visión-lenguaje-acción) |
| Parámetros totales | 4 143 404 816 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es Pi0.5, un modelo fundacional de robótica que combina visión, lenguaje y acción. Sin embargo, la información proporcionada no detalla la estructura interna exacta (número de capas, tipo de atención, mecanismo de fusión multimodal, etc.). El entrenamiento se realizó sobre el dataset `dual-lidar-umi-independent` de brandonyang, con 12 000 pasos de optimización. Se aplicó un muestreo balanceado por intención de trayectoria (`intent-balanced`) y no se incluyó ningún frame de teleoperación. La representación de acción es `H24 EE20 current-relative SE(3), R6D rows, absolute future gripper`, lo que indica que el modelo genera acciones relativas al estado actual del efector final, con 24 pasos de horizonte y 20 dimensiones de acción. No se aplicó contracción de rotación ni historial de estado. La variante del modelo es `intent`, lo que sugiere un enfoque en la intención de la trayectoria.

## Capacidades

- Generación de acciones de control para manipulación robótica bimanual, concretamente para la tarea de recoger naranjas y colocarlas en un cuenco.
- Procesamiento de observaciones visuales (imágenes) y posiblemente información de estado del robot, aunque no se especifican los canales de entrada.
- Soporte para acciones continuas en el espacio SE(3) con representación de rotación en R6D.
- Capacidad de trabajar con datos UMI (Universal Manipulation Interface) y posiblemente generalización a otros entornos similares, aunque no hay evidencia publicada.
- No se documentan capacidades de generación de texto, tool calling, razonamiento simbólico ni soporte multilingüe.

## Casos de uso

- Investigación en aprendizaje robótico: el modelo puede utilizarse como referencia para estudiar el impacto del balanceo por intención de trayectoria en el entrenamiento de VLA, comparando su comportamiento con variantes que usan teleoperación o historial de estado.
- Simulación de manipulación bimanual: en entornos simulados con soporte para UMI, el modelo puede generar acciones para controlar dos brazos robóticos en tareas de recogida y colocación de objetos.
- Desarrollo de pipelines de control con LeRobot: al estar integrado en LeRobot, puede servir como componente de prueba para experimentos de control bimanual, aunque su evaluación actual es solo una reproducción del conjunto de entrenamiento.
- Evaluación de estrategias de muestreo de datos: permite estudiar cómo el balanceo por intención afecta la calidad del aprendizaje en comparación con otros métodos de muestreo.
- Benchmark para futuros fine-tuning: puede ser la base para ajustes posteriores con otros datasets o tareas, aprovechando su entrenamiento en datos canónicos UMI.
- Análisis de comportamiento en entornos controlados: en laboratorio, con supervisión de un operador y mediante la ruta de seguridad estándar EE-to-IK, puede evaluarse en hardware real para tareas de manipulación bimanual, aunque el autor advierte que la evaluación incluida no es una prueba de éxito en hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La evaluación incluida en el modelo es una reproducción de observación del conjunto de entrenamiento, no una evaluación con datos de validación o hardware. Por tanto, no se pueden reportar métricas objetivas de rendimiento como MMLU, HumanEval o GSM8K, ni métricas específicas de robótica como tasa de éxito en tareas.

## Requisitos de hardware

- No se dispone de datos específicos de VRAM necesaria para inferencia. Con 4 143 404 816 parámetros, se estima que la inferencia en FP16 requeriría al menos 8,3 GB de VRAM solo para los pesos, más memoria adicional para activaciones, por lo que se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A100 40 GB o similar).
- El modelo está en formato safetensors, por lo que es compatible con frameworks como PyTorch y LeRobot. No se indican cuantizaciones disponibles, por lo que el despliegue en CPU no es práctico.
- Para el uso en hardware robótico, se requiere una ruta de seguridad estándar EE-to-IK y supervisión de operador, según la advertencia del autor.
- Opciones de despliegue: LeRobot es la librería principal; también podría ser servido con vLLM si se convierte a un formato compatible, pero no se documenta.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos. El autor ha publicado otras variantes del mismo modelo base, como `pi05-BimanualYAM-freshbase-umi100-ee20-history-t1-t4` y `pi05-BimanualYAM-freshbase-rotcontract-umi100-ee20`, pero no se han proporcionado sus especificaciones. En términos generales, el modelo se enmarca dentro de la familia Pi0.5 de Qualcomm, que incluye modelos VLA de propósito general, pero no hay datos públicos de rendimiento para comparar directamente.

## Limitaciones y advertencias

- La evaluación incluida es una reproducción del conjunto de entrenamiento, no una validación con datos no vistos ni pruebas en hardware. No se debe confundir con un rendimiento real.
- El uso en hardware requiere una ruta de seguridad estándar EE-to-IK y supervisión de operador; no es seguro desplegarlo sin estas salvaguardas.
- La licencia no está disponible, lo que impide conocer las restricciones de uso comercial o modificación.
- No se documentan idiomas soportados, por lo que no se puede asumir capacidades multilingües.
- No se conocen los sesgos del modelo ni su comportamiento en entornos fuera de la tarea específica de recoger naranjas y colocarlas en un cuenco.
- El autor recomienda fijar la revisión inmutable del Hub (hash) en lugar de `main` para reproducibilidad, ya que la rama principal puede cambiar.
- La fecha de creación (2026-08-24) y el número de descargas (0) indican que es un modelo muy reciente y sin adopción comunitaria.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/ASethi04/pi05-BimanualYAM-freshbase-umi100-intent-balanced-ee20)
- [Modelo base Pi0.5 de LeRobot](https://huggingface.co/lerobot/pi05_base) (referencia, no se ha verificado el hash)
- [Dataset dual-lidar-umi-independent](https://huggingface.co/datasets/brandonyang/dual-lidar-umi-independent) (referencia)
- [Pi0.5 en Qualcomm AI Hub](https://aihub.qualcomm.com/models/pi05)
- [Otras variantes del autor](https://huggingface.co/ASethi04/models) (incluye los otros fine-tunes de Pi0.5)
