# config-h/Wearable-IMU-Activity-Segmentation-Pipeline

## Resumen

El modelo `config-h/Wearable-IMU-Activity-Segmentation-Pipeline` es un pipeline de segmentación y clasificación de actividades físicas a partir de flujos continuos de sensores inerciales (IMU) colocados en la muñeca. Desarrollado por el usuario config-h, con el repositorio fuente alojado en GitHub bajo la cuenta rudykon, el sistema combina una red neuronal convolucional (CNN) unidimensional compacta con una capa LSTM bidireccional para procesar tres ventanas temporales distintas (3, 5 y 8 segundos) y producir seis clases de actividad: fondo, bádminton, saltar a la cuerda, fly, correr y tenis de mesa. La fusión de las tres vistas temporales se realiza mediante un mecanismo llamado Local-Boundary Scale Arbitration (LBSA), y una capa adicional, Temporal Record Layer (TRL), convierte la secuencia de probabilidades en registros de actividad con límites temporales definidos.

El modelo está diseñado para su uso en investigación y evaluación reproducible, así como para inferencia en dispositivos móviles mediante exportaciones ONNX. Se distribuye bajo licencia Apache 2.0 e incluye checkpoints de PyTorch, parámetros de normalización y un manifiesto con checksums SHA-256. Aunque no se especifican el número total de parámetros ni los detalles del entrenamiento, la arquitectura compacta sugiere que es adecuado para ejecutarse en hardware limitado, incluyendo teléfonos Android. La relevancia actual radica en la creciente demanda de soluciones de reconocimiento de actividad en wearables, donde la eficiencia computacional y la precisión en la segmentación temporal son críticas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 1D + LSTM bidireccional con fusión multi-escala (LBSA) y capa de registros temporales (TRL) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventanas de 3, 5 y 8 segundos a 100 Hz (300, 500 y 800 muestras) |
| Tipos de cuantizacion | no disponible (se proporcionan exportaciones ONNX, sin especificar cuantización) |
| Idiomas soportados | no disponible (modelo de series temporales, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (checkpoints) y ONNX |

## Arquitectura y entrenamiento

El clasificador combina una CNN unidimensional compacta con una LSTM bidireccional. Se procesan tres vistas temporales del flujo de entrada (3, 5 y 8 segundos) para obtener seis probabilidades por clase. La fusión de estas vistas se realiza mediante Local-Boundary Scale Arbitration (LBSA), que decide qué escala es más fiable en cada instante, especialmente cerca de los límites entre actividades. Posteriormente, la Temporal Record Layer (TRL) convierte la secuencia de posteriores en registros de actividad discretos, proporcionando segmentación temporal con inicio y fin.

La entrada es un flujo IMU de muñeca a 100 Hz con seis canales en el orden: `ACC_X`, `ACC_Y`, `ACC_Z`, `GYRO_X`, `GYRO_Y`, `GYRO_Z`. No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de muestras, la composición de las clases ni el uso de técnicas como RLHF o DPO. Tampoco se especifica si se aplicó aumento de datos o regularización específica. La ausencia de esta información limita la evaluación de la generalización del modelo a poblaciones o dispositivos distintos de los utilizados en su desarrollo.

## Capacidades

- Clasificación de seis actividades: fondo, bádminton, saltar a la cuerda, fly, correr y tenis de mesa.
- Segmentación temporal de actividades, identificando el inicio y fin de cada una en un flujo continuo.
- Fusión multi-escala mediante LBSA, que combina tres ventanas temporales para mejorar la precisión en los límites de actividad.
- Conversión de probabilidades en registros de actividad discretos mediante la capa TRL.
- Inferencia en tiempo real, posible gracias a la arquitectura compacta y a las exportaciones ONNX para dispositivos móviles.
- Reproducibilidad: se incluyen checkpoints seleccionados, parámetros de normalización y un manifiesto con checksums para verificar la integridad de los activos.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni razonamiento multi-paso, ni capacidades multilingües.

## Casos de uso

- Investigación en ciencias del deporte: el modelo permite segmentar y clasificar actividades en registros IMU de muñeca, facilitando el análisis de patrones de movimiento en deportes como bádminton, tenis de mesa o carrera. Los investigadores pueden reproducir los experimentos con los checkpoints publicados y comparar resultados con otros métodos.
- Desarrollo de aplicaciones de fitness: integrando el modelo en una app móvil mediante ONNX Runtime, se puede ofrecer a los usuarios un seguimiento automático de ejercicios como saltar a la cuerda o correr, con detección de inicio y fin de cada sesión.
- Monitoreo de actividad diaria: el modelo puede clasificar periodos de actividad frente a inactividad (fondo) en flujos continuos, lo que resulta útil para aplicaciones de bienestar que estiman el gasto energético o la frecuencia de ejercicio.
- Análisis de rendimiento en deportes de raqueta: al distinguir entre bádminton y tenis de mesa, el modelo permite cuantificar el tiempo dedicado a cada deporte y analizar la intensidad mediante la duración de los episodios.
- Detección de ejercicios específicos en entrenamientos: en un entorno de gimnasio, el modelo puede identificar cuándo el usuario realiza saltos a la cuerda o corre, y registrar la duración de cada serie para su posterior análisis.
- Demo interactiva y validación: el espacio Gradio público permite a los usuarios cargar archivos TSV con datos IMU y visualizar las señales, las probabilidades del modelo y la segmentación resultante, lo que facilita la validación del modelo con datos propios antes de su despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como precisión, recall, F1, IoU por clase, ni comparaciones con otros modelos de segmentación de actividad IMU. Tampoco se especifican latencias ni throughput en diferentes hardware.

## Requisitos de hardware

- No se especifican requisitos mínimos de VRAM ni GPU en la documentación.
- Dada la arquitectura compacta (CNN 1D + LSTM), el modelo es adecuado para ejecutarse en CPU, incluso en dispositivos móviles.
- Las exportaciones ONNX están diseñadas para la app Android, lo que sugiere que el modelo puede correr en tiempo real en smartphones.
- Opciones de despliegue: PyTorch para investigación y prototipado, ONNX Runtime para aplicaciones móviles y de escritorio, y el espacio Gradio para demos interactivas.
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (segmentación de actividades con IMU de muñeca). No se han encontrado referencias a otros modelos con arquitectura y propósito similares en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo no está validado para uso clínico, safety-critical o uso sin restricciones entre dispositivos. La model card advierte explícitamente sobre esta limitación.
- El rendimiento puede degradarse con cambios en la colocación del sensor, estabilidad del muestreo, calibración, hardware del dispositivo o cambios en la población de usuarios.
- No se han publicado detalles sobre el conjunto de datos de entrenamiento, por lo que no es posible evaluar posibles sesgos demográficos o de actividad.
- Al ser un modelo de series temporales, no maneja lenguaje natural ni tiene capacidades de razonamiento simbólico.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de precisión o idoneidad para aplicaciones específicas.
- No se especifican los requisitos de memoria ni el tamaño de los checkpoints, aunque el repositorio indica un tamaño de 0.0 GB, lo que sugiere que los archivos pueden estar almacenados en LFS o no se han contabilizado correctamente.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/config-h/Wearable-IMU-Activity-Segmentation-Pipeline)
- [Repositorio GitHub](https://github.com/rudykon/Wearable-IMU-Activity-Segmentation-Pipeline)
- [Sitio web del proyecto](https://rudykon.github.io/Wearable-IMU-Activity-Segmentation-Pipeline/)
- [Demo Gradio (ZeroGPU)](https://huggingface.co/spaces/config-h/Wearable-IMU-Activity-Segmentation-Pipeline)
- [Documentación de uso en GitHub](https://github.com/rudykon/Wearable-IMU-Activity-Segmentation-Pipeline/blob/main/docs/USAGE.md)
- [Artículo de Frontiers sobre optimización de configuraciones IMU](https://www.frontiersin.org/journals/bioengineering-and-biotechnology/articles/10.3389/fbioe.2026.1762919/full)
- [Artículo sobre preparación de datos IMU para ML](https://web.fibion.com/articles/prepare-imu-data-machine-learning/)
