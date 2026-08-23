# axlesubash/wisdm-watch-stat-xgb

## Resumen

El modelo `axlesubash/wisdm-watch-stat-xgb` es un clasificador de reconocimiento de actividad humana (HAR) basado en XGBoost, desarrollado por Subash Pandey. Está diseñado para clasificar ventanas de datos de sensores inerciales (acelerómetro y giroscopio) de un smartwatch en 18 actividades cotidianas, utilizando únicamente el reloj como dispositivo de captura. El modelo se distribuye en formato ONNX (un árbol de decisión XGBoost) junto con un archivo JSON de metadatos que define el contrato de entrada y salida.

El problema que resuelve es el reconocimiento de actividad humana a partir de señales de IMU en dispositivos portátiles, un campo relevante para aplicaciones de salud, monitorización de pacientes y análisis de comportamiento. Su relevancia actual radica en su ligereza computacional: al ser un conjunto de árboles de decisión, puede ejecutarse en CPU sin necesidad de GPU, lo que permite su despliegue en dispositivos de bajo consumo como relojes inteligentes o pasarelas de datos. La arquitectura es un XGBoost con 200 árboles de profundidad máxima 6, que opera sobre características estadísticas extraídas de una ventana de 5 segundos a 20 Hz (100 muestras, 6 canales). El modelo no es un transformador, sino un clasificador tabular clásico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XGBoost (gradient boosting de árboles de decisión) |
| Parametros totales | No disponible (200 árboles de profundidad 6) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (entrada tabular de 104 características) |
| Tipos de cuantizacion | No disponible (formato ONNX sin cuantización declarada) |
| Idiomas soportados | No aplicable (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (`.onnx`), con sidecar JSON |

## Arquitectura y entrenamiento

El modelo es un clasificador XGBoost que opera sobre un vector de 104 características estadísticas extraídas de una ventana de 5 segundos de datos de IMU de un smartwatch. Las características incluyen estadísticos como media, varianza, percentiles, etc., calculados sobre los 6 canales (aceleración `ax, ay, az` y giroscopio `gx, gy, gz`). El árbol XGBoost se exporta a ONNX mediante `onnxmltools` (ONNX 1.22), mientras que el preprocesado estadístico se mantiene en Python, por lo que la inferencia final combina código Python para la extracción de características y el motor ONNX para la clasificación.

El entrenamiento se realizó sobre el conjunto de datos WISDM (UCI 507), que contiene datos de 51 sujetos (identificadores 1600-1650) con 18 actividades (A-S, excluyendo N). Se utilizó un protocolo de validación con GroupKFold de 5 particiones, agrupando por `subject_id` para garantizar la independencia de sujetos. Los datos se repararon para un muestreo de 20 Hz y se aplicó una ventana de 5 segundos con un solapamiento de 1 segundo. La configuración exacta se describe en el archivo `configs/protocol_b_watch_stat_xgb.yaml` del repositorio asociado. No se ha mencionado el uso de RLHF, DPO ni técnicas de ajuste por refuerzo; se trata de un entrenamiento supervisado clásico de clasificación multiclase.

## Capacidades

- Clasificación de actividad humana a partir de datos de IMU de reloj (acelerómetro y giroscopio).
- Reconoce 18 actividades diferentes, incluyendo caminar, correr, subir escaleras, sentarse, estar de pie, acostarse, comer, beber, escribir, etc.
- Entrada: ventana de 100 muestras × 6 canales (forma `(100, 6)`), con frecuencia de muestreo de 20 Hz.
- Salida: probabilidades o clase para las 18 actividades.
- Soporta inferencia en CPU mediante ONNX Runtime, sin necesidad de GPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje natural.
- No es un modelo multimodal; no procesa visión ni audio.
- Funciona únicamente con datos de smartwatch; los datos de teléfono no están soportados (el modelo card lo advierte explícitamente).

## Casos de uso

- **Monitorización de actividad física en aplicaciones de salud**: el modelo clasifica cada ventana de 5 segundos en una de las 18 actividades, permitiendo a una aplicación móvil registrar el tiempo real dedicado a caminar, correr, estar sentado, etc. Su bajo coste computacional hace posible ejecutarlo en el propio reloj o en el teléfono conectado.

- **Análisis de comportamiento en estudios de movilidad**: los investigadores pueden utilizar el clasificador para procesar datos de acelerómetros de reloj de pacientes y extraer patrones de actividad, como el número de transiciones entre posturas, lo que es útil en estudios de envejecimiento o rehabilitación.

- **Seguimiento de actividades de la vida diaria (ADL)**: la clasificación de actividades como comer, beber, escribir o tocar el piano permite aplicaciones de diario personal o de coaching de hábitos, sin requerir intervención manual del usuario.

- **Detección de eventos de caída o cambios posturales**: aunque no es un detector de caídas específico, el modelo distingue entre actividades como "acostarse" o "levantarse", lo que puede combinarse con reglas adicionales para alertar de cambios bruscos en entornos asistidos.

- **Despliegue en sistemas de teleasistencia**: al ser un modelo ligero, puede integrarse en un servidor edge que recibe datos de múltiples relojes, procesándolos en tiempo real con ONNX Runtime para generar alertas o estadísticas agregadas.

- **Validación de algoritmos de HAR**: el modelo sirve como línea base en comparaciones con otros métodos de reconocimiento de actividad, ya que su implementación es reproducible a partir del repositorio GitHub y el archivo de configuración.

## Benchmarks y rendimiento

El autor proporciona métricas de evaluación bajo el protocolo B (GroupKFold de 5 particiones sobre 51 sujetos). La tabla siguiente reproduce los resultados publicados en la model card:

| Métrica | Valor |
|---|---|
| macro-F1 | **0.7031** |
| accuracy | 0.7013 |
| media del macro-F1 por pliegue | 0.7027 (desv. estándar 0.0506) |
| F1 del grupo de locomoción | 0.9292 |
| F1 del grupo de postura | 0.6606 |
| F1 del grupo de mano | 0.8788 |
| F1 del grupo de comer | 0.8450 |

Se indica que la métrica primaria es el macro-F1. Las clases más débiles son "comer sándwich" (F1 0.2816), "subir escaleras" (0.7028) y "patadas" (0.7831). El modelo exportado (ONNX) se ajustó sobre todos los datos con un sujeto reservado para early stopping, por lo que las puntuaciones de la tabla no son exactamente las del modelo exportado, sino las del protocolo de validación.

## Requisitos de hardware

- **VRAM**: no requiere memoria de GPU; el modelo se ejecuta en CPU.
- **GPU recomendadas**: no aplicable; el modelo es un conjunto de árboles de decisión que se ejecuta eficientemente en cualquier CPU moderna.
- **Compatibilidad con GPU de consumo**: no necesaria; puede ejecutarse en una Raspberry Pi o incluso en un microcontrolador si se convierte a un formato adecuado, aunque la inferencia en tiempo real en un reloj podría requerir optimización adicional.
- **Opciones de despliegue**: se puede ejecutar con ONNX Runtime en Python, C++ o JavaScript. También puede integrarse en aplicaciones móviles mediante el runtime de ONNX para Android/iOS. No se menciona soporte para vLLM, llama.cpp u otras herramientas de modelos de lenguaje.
- **Latencia y throughput**: no se han publicado mediciones formales, pero dado el tamaño del modelo (200 árboles, profundidad 6, entrada de 104 dimensiones), la inferencia típica es inferior a 1 ms por ventana en un CPU moderno.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables con métricas publicadas en la información proporcionada. El autor menciona que el clasificador de teléfono estadístico XGBoost (mismo protocolo) obtiene un macro-F1 de 0.3272, claramente inferior al del reloj (0.7031), pero no se listan alternativas de otros autores. No se proporciona comparación con redes neuronales (LSTM, CNN) ni otros enfoques HAR en la documentación disponible.

## Limitaciones y advertencias

- **Solo datos de reloj**: el modelo no acepta datos de teléfono; el contrato de entrada especifica `device: watch`. El uso de datos de teléfono produce resultados fuera de contrato.
- **Clases débiles**: las actividades de "comer sándwich", "subir escaleras" y "batear" presentan F1 bajo (0.2816, 0.7028 y 0.7831 respectivamente), lo que puede provocar errores en escenarios reales.
- **Umbral de abstención no calibrado**: el modelo tiene un umbral de abstención fijo a 0.0, lo que significa que nunca se abstiene y siempre devuelve una clase, incluso cuando la confianza es baja.
- **Características estadísticas en Python**: el modelo ONNX solo incluye la parte de árboles; la extracción de características (104 dimensiones) debe realizarse en Python, lo que puede limitar el despliegue en entornos sin intérpretes de Python.
- **Sin fusión de sensores**: no se soporta la combinación de datos de teléfono y reloj (12 canales).
- **Licencia MIT**: el uso comercial está permitido, pero el dataset WISDM tiene sus propios términos de uso (UCI). Es responsabilidad del usuario cumplir con ellos.
- **No es un dispositivo médico**: no se debe usar en aplicaciones de salud o seguridad que requieran certificaciones médicas.

## Enlaces

- [Hugging Face - axlesubash/wisdm-watch-stat-xgb](https://huggingface.co/axlesubash/wisdm-watch-stat-xgb)
- [Repositorio de entrenamiento y código - notsubash/Activity-Recognition](https://github.com/notsubash/Activity-Recognition)
- [Dataset WISDM en UCI (UCI 507)](https://archive.ics.uci.edu/dataset/507/wisdm+smartphone+and+smartwatch+activity+and+biometrics+dataset)
- [Configuración de entrenamiento - protocol_b_watch_stat_xgb.yaml](https://github.com/notsubash/Activity-Recognition/blob/main/configs/protocol_b_watch_stat_xgb.yaml)
- [Reporte de métricas - protocol_b_watch_stat_xgb.json](https://github.com/notsubash/Activity-Recognition/blob/main/docs/reports/protocol_b_watch_stat_xgb.json)
