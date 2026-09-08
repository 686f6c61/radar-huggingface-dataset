# DawsonPrince/iHear-SAFE-v4.7.1

## Resumen

iHear-SAFE v4.7.1 es un modelo de audio embebido experimental desarrollado por DawsonPrince dentro del proyecto iHear, dedicado a la asistencia auditiva. Combina una máscara de mejora de voz con una detección jerárquica de sonidos críticos de seguridad, concretamente sirenas, claxones y alarmas de incendio. El modelo está diseñado para ejecutarse en dispositivos de bajo consumo como el ESP32-S3 mediante TFLite con cuantización INT8, lo que lo hace relevante para sistemas de asistencia auditiva en tiempo real y para la investigación en inteligencia artificial embebida.

Su arquitectura procesa audio mono a 16 kHz mediante STFT con un contexto de 5 frames y produce tres salidas: una máscara de mejora, un gate de alerta y un subtipo de alerta. No se especifican el número total de parámetros ni la licencia, y el modelo se encuentra en una fase temprana de desarrollo, sin validación clínica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de audio con STFT y salidas jerárquicas (tipo no especificado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 5 frames de audio (ventana STFT de 256 muestras, hop de 128) |
| Tipos de cuantizacion | INT8 post-training |
| Idiomas soportados | no disponible (modelo de audio, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | TFLite (.tflite), JSON/CSV para configuración |

## Arquitectura y entrenamiento

El modelo utiliza una representación de audio basada en STFT con `n_fft=256`, `win_length=256`, ventana Hann y `hop_length=128`, con `center=True`. La característica de entrada es `log(|STFT| + 1e-8)` y el contexto temporal es de 5 frames, dando lugar a una entrada TFLite con forma `[1, 5, 129, 1]`. La salida se compone de tres cabezas: una máscara de mejora de tamaño `[1, 129]`, un gate de alerta de `[1, 1]` y un subtipo de alerta de `[1, 3]` que clasifica sirenas, claxones y alarmas de incendio. El modelo se cuantiza a INT8 mediante calibración post-training equilibrada con ejemplos de siete grupos.

Los datos de entrenamiento, el número de tokens o épocas y la presencia de técnicas como RLHF o DPO no se detallan en la documentación. La validación de desarrollo se realizó sobre 450 mezclas deterministas, con 50 por cada clase de alerta (excepto ruido ordinario y negativas duras, que tienen 100).

## Capacidades

- Mejora de voz mediante máscara de mejora aplicada sobre el espectrograma, preservando la inteligibilidad en entornos ruidosos.
- Detección jerárquica de sonidos críticos de seguridad: sirenas, claxones y alarmas de incendio.
- Clasificación de subtipos de alerta (siren, car horn, fire alarm) con un gate de alerta independiente.
- Rechazo de ruido ordinario, negativas duras y sonidos no soportados (como timbres o gritos de advertencia) con umbrales configurables.
- Ejecución en dispositivos embebidos de bajo consumo gracias a la cuantización INT8 y al formato TFLite.
- No soporta tool calling, agentes, visión ni lenguaje natural; es un modelo de audio específico para este dominio.

## Casos de uso

- Asistencia auditiva para personas con pérdida auditiva: el modelo puede ejecutarse en un audífono o dispositivo wearable para mejorar la voz y, al mismo tiempo, alertar al usuario sobre sirenas o alarmas de incendio mediante el gate de alerta.
- Monitorización de seguridad en entornos industriales: integrado en un sensor con ESP32-S3, detecta alarmas de incendio y claxones, ignorando el ruido de fondo habitual de una planta.
- Domótica y hogar inteligente: un dispositivo de escucha que identifica alarmas de incendio y avisa al usuario a través de la app o de un altavoz, aprovechando su bajo consumo y su capacidad de funcionar sin conexión.
- Sistemas de alerta para personas mayores o con discapacidad: el modelo puede detectar sirenas de emergencia y activar una notificación automática, gracias a su alta tasa de rechazo de ruido ordinario (99%).
- Investigación en audio embebido: sirve como plataforma para estudiar la cuantización INT8, la calibración de umbrales y el despliegue en microcontroladores TFLite, con fines de reproducción y desarrollo del prototipo iHear.
- Prototipos de wearables de asistencia: dispositivos de tipo audífono o colgante que procesan audio localmente, sin depender de la nube, para reducir la latencia y proteger la privacidad.
- Seguridad vial en vehículos: un sistema de asistencia que detecta claxones de otros vehículos y genera una alerta al conductor, aunque el modelo no está validado para este uso y requiere pruebas adicionales.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Recall de sirenas | 84% |
| Recall de claxones | 80% |
| Recall de alarmas de incendio | 92% |
| Recall global de alertas soportadas | 85.3% |
| Rechazo de timbres | 96% |
| Rechazo de gritos de advertencia | 68% |
| Rechazo de alertas no soportadas | 82% |
| Rechazo de ruido ordinario | 99% |
| Rechazo de negativas duras | 89% |
| Rechazo de negativas de despliegue | 90% |
| Puntuación equilibrada de despliegue | 87.7% |

Además, la cuantización INT8 presenta un error absoluto medio (MAE) de 0.0111 en la máscara, 0.0102 en el gate y 0.0094 en el subtipo. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; es un modelo TFLite para microcontroladores, no requiere VRAM.
- GPU recomendadas: no aplica; el despliegue previsto es en CPU o en el ESP32-S3.
- Compatibilidad con GPU de consumo: no aplica; el modelo está diseñado para ejecutarse en dispositivos embebidos, no en GPU.
- Opciones de despliegue: TFLite Micro en ESP32-S3, o cualquier runtime TFLite (Android, iOS, Raspberry Pi) que soporte el formato .tflite.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es un prototipo específico para asistencia auditiva embebida, sin datos de referencia frente a otras arquitecturas de audio.

## Limitaciones y advertencias

- Prototipo de investigación: no ha sido clínicamente validado como audífono ni certificado como dispositivo de seguridad.
- Solo reconoce tres clases de alerta soportadas (sirenas, claxones y alarmas de incendio); otros sonidos relevantes como timbres o gritos de advertencia se tratan como negativos.
- El rechazo de gritos de advertencia es débil (68%), lo que puede generar falsos negativos en situaciones de emergencia.
- La evaluación de alarmas de incendio se basa en solo 8 grabaciones independientes, por lo que el 92% de recall es un resultado de validación de desarrollo, no una estimación realista del rendimiento en el mundo real.
- El rendimiento real puede variar significativamente con micrófonos, acústica, nivel de señal, ruido, distancia, hardware y preprocesado.
- La licencia no está declarada, lo que introduce incertidumbre sobre el uso comercial y la redistribución.
- No debe utilizarse como método único para detectar peligros o emergencias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DawsonPrince/iHear-SAFE-v4.7.1
- Demo en Hugging Face Space: https://huggingface.co/spaces/DawsonPrince/iHear-SAFE-v4.7.1-demo
- Perfil del autor en Hugging Face: https://huggingface.co/DawsonPrince
- Google Scholar del autor: https://scholar.google.com/citations?user=LJSIhcYAAAAJ&hl=en
