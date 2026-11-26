# nokkela-ai/latent_drive

## Resumen

LatentDrive es un modelo de planificación end-to-end para conducción autónoma desarrollado originalmente por la Autoware Foundation y redistribuido en este repositorio como fork independiente por Nokkela.AI. El modelo genera trayectorias del ego vehículo a partir únicamente de vídeo de cámara frontal (y opcionalmente laterales), puntos de ruta y el estado de movimiento del vehículo, sin mapas de alta definición ni detección o seguimiento explícito de objetos. Su enfoque se apoya en un modelo del mundo latente: un codificador de vídeo V-JEPA ViT-L que predice partes enmascaradas del vídeo en espacio latente en lugar de en píxeles.

La arquitectura combina un codificador V-JEPA ViT-L de 304 millones de parámetros, ejecutado una vez por vista con pesos compartidos, con una cabeza de planificación de 6 millones de parámetros, sumando 310 millones en total. El modelo produce 40 poses a intervalos de 0,1 s que cubren hasta 4 s de trayectoria futura, a una frecuencia de 10 Hz. Se publican dos variantes: una de tres cámaras (frontal, frontal-izquierda y frontal-derecha) y otra de una sola cámara frontal, ambas en formato ONNX opset 18 y optimizadas para ejecutarse con TensorRT.

Su relevancia actual radica en la combinación de un enfoque mapless y camera-only con un modelo del mundo latente preentrenado, lo que reduce la dependencia de mapas HD y de pipelines de percepción intermedios, y en unas latencias compatibles con tiempo real en hardware de consumo (unos 14 ms por plan con tres cámaras en una RTX 4090).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo del mundo latente: codificador de vídeo V-JEPA ViT-L + cabeza de planificación |
| Parámetros totales | 310M (304M codificador + 6M cabeza de planificación) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada de 4 fotogramas por vista a 0,5 s de separación (t − 1,5 s … t) y salida de 40 poses a 0,1 s (hasta 4 s) |
| Tipos de cuantización | fp16 en el codificador y fp32 en la cabeza de planificación (receta mixta validada por la librería); ONNX distribuido en fp32 |
| Idiomas soportados | no disponible (modelo de percepción y planificación, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 18, fp32, autocontenido, eje de batch dinámico); motores TensorRT construidos localmente |

## Arquitectura y entrenamiento

El modelo se estructura en dos etapas. La primera es un codificador de vídeo V-JEPA ViT-L, un modelo del mundo auto-supervisado que aprende la dinámica de escenas de conducción prediciendo partes enmascaradas del vídeo en su propio espacio latente, en lugar de reconstruir píxeles. Este codificador se preentrenó con vídeo de conducción y se ejecuta una vez por cada vista de cámara con pesos compartidos. La segunda etapa es una cabeza de planificación ligera (6M de parámetros) que lee las características latentes de los fotogramas junto con los puntos de ruta y el estado del ego, y produce directamente la trayectoria, sin detección ni seguimiento de objetos intermedios.

Las entradas incluyen 4 fotogramas por vista separados 0,5 s, seis puntos de ruta situados a 5, 10, 15, 20, 30 y 50 m de longitud de arco por delante de la proyección del ego (normalizados dividiendo por 10 y recortados al final de la ruta) y el estado de movimiento del ego (velocidad y aceleración en los ejes forward y left). La salida son 40 poses de 0,1 s de separación con coordenadas x (adelante), y (izquierda) y dyaw en el marco del ego actual. Los fotogramas se recortan al centro con relación 2:1, se redimensionan a 512 × 256 y se normalizan con media y desviación estándar de ImageNet. En entrenamiento, las vistas laterales estaban dentro de 50 ms de la frontal, y una vista lateral ausente solo se vio como imagen de ceros antes de la normalización. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Planificación de trayectorias end-to-end para conducción autónoma: genera 40 poses a 0,1 s (hasta 4 s) a partir de vídeo de cámara.
- Conducción mapless: no requiere mapas de alta definición, solo puntos de ruta (por ejemplo, centerlines de lanelets preferidos de la misión).
- Percepción implícita sin detección ni tracking: el modelo del mundo latente captura la dinámica de la escena directamente.
- Entrada multicámara: variante de tres cámaras (frontal, frontal-izquierda, frontal-derecha) y variante de una sola cámara frontal.
- Integración con ROS 2 y Autoware: nodo ROS 2 y librería C++ `autoware_latent_drive` para despliegue en vehículo.
- Ejecución optimizada con TensorRT: receta mixta fp16/fp32 validada, sin necesidad de plugins de TensorRT.
- Soporte de batch dinámico en el eje de batch del ONNX.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni capacidades lingüísticas, de visión general o de audio.

## Casos de uso

- Planificación en tiempo real en vehículos Autoware: el modelo se integra mediante el nodo ROS 2 de `autoware_latent_drive` para generar trayectorias a 10 Hz a partir del vídeo de cámara y la ruta de la misión, sustituyendo o complementando pilas de planificación basadas en mapas HD.
- Conducción en entornos sin mapa HD: al ser mapless, puede desplegarse en zonas donde no se dispone de cartografía de alta definición, usando únicamente los puntos de ruta de la misión y el vídeo frontal.
- Seguimiento de carril y cruces con una sola cámara: la variante de una cámara (11–12,5 ms por tick en el ordenador de prueba) es adecuada para vehículos con hardware limitado que solo disponen de cámara frontal, cubriendo escenas como seguir carril a 40 km/h, giros en intersecciones o arranque en verde.
- Validación offline con replay de rosbags: la muestra offline de la librería permite reproducir rosbags grabados y comparar las trayectorias generadas con las registradas, útil para evaluación en bucle abierto antes de desplegar en vehículo.
- Investigación en modelos del mundo latente para robótica: el uso de un codificador V-JEPA preentrenado con una cabeza ligera de planificación sirve como base para experimentos de planificación en espacio latente en otros dominios robóticos.
- Prototipado rápido en GPU de consumo: con unos 14 ms por plan en una RTX 4090 y motores TensorRT construidos localmente en unos 7 minutos (tres cámaras) o 1,5 minutos (una cámara), es viable iterar en estaciones de trabajo con GPU consumer.
- Generación de trayectorias con contexto temporal corto: los 4 fotogramas a 0,5 s permiten capturar dinámica reciente de la escena para maniobras como ceder el paso, frenar ante un semáforo en rojo o arrancar en verde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento proporcionados son de latencia y throughput:

| Métrica | Tres cámaras | Una cámara |
|---|---|---|
| Latencia por plan en RTX 4090 | ~14 ms | no disponible |
| Latencia por tick en el ordenador del vehículo de prueba | ~35 ms | 11–12,5 ms |
| Frecuencia sostenida | 10 Hz sin ticks perdidos | 10 Hz sin ticks perdidos |
| Tiempo de construcción del motor TensorRT | ~7 min | ~1,5 min |
| Tamaño del archivo ONNX | 1,25 GB | 1,24 GB |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los archivos ONNX pesan 1,25 GB (tres cámaras) y 1,24 GB (una cámara) en fp32, por lo que la huella de pesos es de ese orden, más las activaciones del codificador ViT-L.
- GPU recomendadas: NVIDIA GeForce RTX 4090 (referencia de latencia del autor, ~14 ms por plan con tres cámaras); el modelo se ejecuta con TensorRT, por lo que requiere GPU NVIDIA compatible.
- Cabe en GPU de consumo: sí, al menos en RTX 4090 según los datos del autor; no se especifican otras GPU consumer.
- Opciones de despliegue: TensorRT a través de la librería `autoware_latent_drive` (nodo ROS 2, librería C++ y muestra offline); los motores TensorRT se construyen localmente con `scripts/build.sh` porque son específicos de la arquitectura de GPU y la versión de TensorRT.
- Latencia y throughput: ~14 ms por plan con tres cámaras en RTX 4090; ~35 ms por tick con tres cámaras y 11–12,5 ms con una cámara en el ordenador del vehículo de prueba, manteniendo 10 Hz sin ticks perdidos.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros modelos comparables de planificación end-to-end para conducción autónoma (parámetros, contexto, rendimiento, licencia y disponibilidad). Por tanto, la comparativa se indica como no disponible.

## Limitaciones y advertencias

- Modelo específico de conducción: no es un modelo de lenguaje ni de propósito general; no admite tool calling, agentes ni razonamiento multi-paso.
- Dependencia de la ruta: requiere puntos de ruta (por ejemplo, centerlines de lanelets) y no planifica sin una ruta de misión definida.
- Ventana temporal corta: solo usa 2 s de vídeo (4 fotogramas a 0,5 s) y planifica hasta 4 s; no hay contexto más largo.
- Sincronización de cámaras: en entrenamiento las vistas laterales estaban dentro de 50 ms de la frontal; desviaciones mayores pueden degradar el rendimiento. Una vista lateral ausente solo se vio en entrenamiento como imagen de ceros antes de la normalización.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero el modelo puede generar trayectorias incorrectas ante escenas fuera de distribución, ya que no hay detección explícita que las valide.
- Sesgos conocidos: no disponible en la información proporcionada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia y la atribución correspondiente; este repositorio es un fork independiente de Nokkela.AI del modelo original de la Autoware Foundation.
- Los motores TensorRT no se distribuyen y deben construirse localmente; un motor generado para una GPU o versión de TensorRT no es portable a otra.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado el 25 de noviembre de 2026; se trata de un artefacto reciente sin validación comunitaria publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nokkela-ai/latent_drive
- Modelo base original: https://huggingface.co/AutowareFoundation/latent_drive
- Librería de despliegue: https://github.com/autowarefoundation/autoware_latent_drive
- Banner del fork: https://raw.githubusercontent.com/NokkelaAI/nokkela-huggingface-fork-banner/main/nokkela-fork-banner.svg
