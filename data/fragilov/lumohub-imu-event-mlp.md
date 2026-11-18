# fragilov/lumohub-imu-event-mlp

## Resumen

LumoEventMLP es un perceptrón multicapa (MLP) de muy pequeño tamaño diseñado para ejecutarse en el microcontrolador ESP32-S3 dentro del proyecto LumoHub. No es un modelo de lenguaje: es un clasificador de eventos sobre señales de IMU (unidad de medida inercial, típicamente un MPU6050 de 6 ejes) orientado a la detección de caídas y eventos de impacto. El modelo recibe 16 características biomecánicas extraídas de ventanas de 3 segundos de señal inercial y produce una clasificación en 5 clases.

La relevancia del modelo está en su enfoque *physics-informed*: en lugar de procesar la señal cruda, consume características físicas interpretables (profundidad de caída libre, anchura del pulso de impacto, ángulo de inclinación gravitatoria, colapso del eje vertical, micro-temblor posterior al impacto, pico de jerk, ratio de energía de recuperación, etc.). Esto reduce drásticamente el coste computacional y el tamaño del modelo, que ocupa 13.460 bytes de flash y requiere 3.232 MACs por inferencia.

El modelo se publica bajo licencia MIT con el objetivo declarado de integrarse en firmware C99 embebido mediante cabeceras con pesos plegados (`lumo_hub_feature_model.h`). Su caso de uso principal es la detección de caídas en dispositivos portátiles o wearables de bajo consumo, con métricas declaradas por el autor muy altas sobre un conjunto de test retenido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) con normalización previa; BatchNorm plegada en los pesos |
| Parámetros totales | 3.365 floats (13.460 bytes en flash) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de entrada fija de 3,0 s de señal IMU de 6 ejes |
| Tipos de cuantización | no disponible (pesos exportados como floats C99) |
| Idiomas soportados | no aplica (modelo de clasificación de señales, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | cabecera C99 (`lumo_hub_feature_model.h`) con pesos y constantes del escalador; no se indica safetensors ni GGUF |
| Entrada | 16 características físicas estandarizadas `(x - mean) / std` |
| Salida | 5 clases |
| Coste de inferencia | 3.232 MACs por inferencia |
| Hardware objetivo | ESP32-S3 (LumoHub) |
| Métricas declaradas | accuracy, macro F1 |

## Arquitectura y entrenamiento

La red es un MLP de tres capas densas: `Linear(16→64)` con ReLU, `Linear(64→32)` con ReLU y `Linear(32→5)` de salida. La normalización por lotes está plegada en los pesos, de modo que la inferencia es una secuencia de multiplicaciones matriciales y activaciones sin capas adicionales. El pipeline incluye un escalador estándar cuyos parámetros (media y desviación típica por característica) se exportan junto con los pesos a la cabecera C99, lo que permite replicar el preprocesado en el firmware.

La entrada no es la señal cruda, sino 16 características biomecánicas calculadas sobre cada ventana de 3,0 segundos de IMU de 6 ejes. Entre ellas figuran la profundidad de caída libre (`f0_pre_min_mag_g`), la anchura relativa del impacto (`f3_impact_width_ratio`), el ángulo de inclinación gravitatoria normalizado (`f6_tilt_angle_norm`), la caída vertical de gravedad (`f7_gravity_vertical_drop`), el pico de jerk (`f13_peak_jerk_g`), la puntuación logarítmica de micro-temblor posterior (`f12_post_micro_tremor_score`) y el ratio de energía de recuperación (`f14_recovery_energy_ratio`). El autor publica una tabla de importancia de características obtenida con un baseline de Random Forest, en la que destacan `f12_post_micro_tremor_score` (0,1733) y `f0_pre_min_mag_g` (0,1425).

No se especifican en la información disponible el volumen del conjunto de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de aumento de datos o regularización más allá de la normalización. Tampoco se detalla el proceso de etiquetado de las 5 clases, aunque por las métricas publicadas (sensibilidad binaria de caída sobre las clases 3 y 4) se deduce que al menos dos clases corresponden a eventos de caída.

## Capacidades

- Clasificación de eventos inerciales en 5 clases a partir de ventanas de 3,0 s de IMU de 6 ejes.
- Detección de caídas con sensibilidad binaria declarada del 99,94 % sobre las clases 3 y 4 en el split de test retenido.
- Discriminación entre eventos de impacto real y falsos positivos típicos: golpe en la muñeca (*wrist-shock*) y caída del dispositivo (*device drop-off*), ambos con tasa de falsa alerta declarada del 0,00 %.
- Extracción de características físicas interpretables (16 dimensiones) que permiten auditar la decisión del modelo.
- Inferencia en microcontrolador con huella de 13.460 bytes de flash y 3.232 MACs, compatible con firmware C99.
- Tolerancia parcial a pérdida de paquetes BLE: mantiene 96,56 % de accuracy con 10 % de pérdida y 89,49 % con 25 %.
- Robustez declarada frente a ruido de sensor duplicado (2x): 99,73 % de accuracy.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un clasificador cerrado de señales.

## Casos de uso

- Detección de caídas en wearables para personas mayores: el modelo se ejecuta localmente en el ESP32-S3 del dispositivo, clasificando ventanas de 3 s de acelerómetro y giroscopio y emitiendo una alerta por BLE sin depender de la nube, lo que preserva la privacidad y elimina la latencia de red.
- Pulsera o collar de teleasistencia con bajo consumo: al requerir solo 3.232 MACs por inferencia y 13,5 KB de flash, el modelo puede ejecutarse de forma continua en el coprocesador o en ciclos de duty-cycle sin comprometer la autonomía de la batería.
- Monitorización de pacientes en entornos hospitalarios o residencias: la baja tasa de falsos positivos declarada frente a golpes de muñeca y caídas del dispositivo reduce la fatiga de alertas del personal sanitario.
- Seguridad laboral en entornos de riesgo (construcción, industria): el dispositivo puede detectar impactos y caídas de trabajadores en altura y disparar protocolos de emergencia mediante la pasarela BLE.
- Deporte y rehabilitación: el ratio de energía de recuperación y el micro-temblor posterior permiten caracterizar la calidad del movimiento tras un impacto, útil en seguimiento de recuperación funcional.
- Sistemas de alerta con conectividad intermitente: la tolerancia a pérdida de paquetes BLE (89,49 % de accuracy con 25 % de pérdida) hace viable el despliegue en entornos con enlaces inalámbricos degradados.
- Prototipado e investigación en TinyML: el modelo sirve como referencia de pipeline *physics-informed* completo (extracción de características, escalado, MLP y exportación a C99) para experimentos con otros sensores inerciales.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test retenido (N = 4.500):

| Métrica | Valor |
|---|---|
| Accuracy | 99,73 % |
| Macro F1 | 99,73 % |
| Tasa de falsa alerta por golpe en muñeca | 0,00 % |
| Tasa de falsa alerta por caída del dispositivo | 0,00 % |
| Sensibilidad binaria de caída (clases 3 y 4) | 99,94 % |

Prueba de estrés ante pérdida de paquetes BLE y ruido:

| Escenario | Accuracy | Macro F1 |
|---|---|---|
| BLE limpio a 10 Hz (0 % pérdida) | 99,73 % | 99,73 % |
| Pérdida de paquetes BLE del 10 % | 96,56 % | 96,58 % |
| Pérdida de paquetes BLE del 25 % | 89,49 % | 89,73 % |
| Pérdida de paquetes BLE del 40 % | 80,29 % | 80,99 % |
| Ruido de sensor elevado (2x) | 99,73 % | 99,73 % |

No se han publicado comparaciones con otros modelos de detección de caídas en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en el ESP32-S3, no en GPU.
- Memoria en dispositivo: 13.460 bytes de flash para los pesos y constantes del escalador; el consumo de RAM para las activaciones intermedias es mínimo (capas de 64 y 32 neuronas).
- Cómputo: 3.232 MACs por inferencia, viable en el núcleo del ESP32-S3 sin acelerador dedicado.
- GPU recomendadas: no aplica para inferencia; para reentrenamiento no se especifica en la información disponible.
- Cabe en GPU de consumo: no aplica; el despliegue objetivo es un microcontrolador.
- Opciones de despliegue: firmware C99 embebido mediante `lumo_hub_feature_model.h` y `lumo_imu_ai.c`; no se indican integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma explícita; el coste de 3.232 MACs sugiere latencias del orden de microsegundos a milisegundos en el ESP32-S3, pero no se publica una medición.

## Comparativa con modelos similares

No se dispone en la información proporcionada de modelos comparables de detección de caídas con arquitectura y despliegue equivalentes, ni de sus especificaciones (parámetros, contexto, licencia o rendimiento). Por tanto, la comparativa se declara no disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LumoEventMLP | 3.365 floats | ventana IMU de 3,0 s | accuracy 99,73 % (test declarado) | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las métricas (99,73 % de accuracy, 0,00 % de falsa alerta) proceden exclusivamente de la model card del autor y no se han verificado de forma independiente; deben tratarse con cautela hasta su replicación.
- No se documentan el tamaño, la procedencia ni la composición del dataset de entrenamiento, lo que impide evaluar el riesgo de sobreajuste o de sesgo de dominio (edad, complexidad corporal, tipo de dispositivo).
- El modelo está acoplado a un pipeline de extracción de 16 características concreto y a un escalador específico; cualquier cambio en la colocación del sensor, la frecuencia de muestreo o el cálculo de características invalida las garantías de rendimiento.
- El rendimiento degrada de forma significativa con pérdida de paquetes BLE: por debajo del 25 % de pérdida la accuracy cae por debajo del 90 %.
- No es un modelo de lenguaje ni un modelo multimodal; no admite instrucciones en lenguaje natural, tool calling ni razonamiento.
- No se especifican sesgos demográficos ni de condición física; la detección de caídas puede comportarse de forma distinta en poblaciones no representadas en el entrenamiento.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí existe riesgo de clasificación errónea (falsos negativos en caídas reales) con consecuencias potencialmente graves en aplicaciones de teleasistencia.
- La licencia MIT permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el despliegue en producción sanitaria requeriría validación clínica adicional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fragilov/lumohub-imu-event-mlp
- No se han encontrado en la información disponible enlaces adicionales a papers, blogs, repositorios o demos.
