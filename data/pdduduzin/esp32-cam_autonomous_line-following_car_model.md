# pdDuduzin/ESP32-CAM_Autonomous_Line-Following_Car_Model

## Resumen

El ESP32-CAM Autonomous Line-Following Car Model es un modelo de visión por computador publicado por el usuario pdDuduzin en HuggingFace. No es un modelo de lenguaje: se trata de una red neuronal convolucional (CNN) entrenada en Keras que implementa una tarea de regresión supervisada por clonación de comportamiento (behavioral cloning). Recibe una imagen en escala de grises de 96 x 96 x 1 píxeles procedente de la cámara de un ESP32-CAM y devuelve un único valor de dirección continua entre -1 (giro máximo a la izquierda) y +1 (giro máximo a la derecha).

El modelo está pensado para ejecutarse embebido: se distribuye como modelo TensorFlow Lite Micro completamente cuantizado a INT8, junto con una cabecera C (`modelo_linha.h`) que se compila directamente en el firmware del ESP32-CAM. El repositorio incluye además el modelo Keras original, manifiestos de entrenamiento y conversión, un informe de validación y gráficas de entrenamiento.

Su relevancia es práctica y acotada: demuestra un flujo completo de extremo a extremo (captura de datos, entrenamiento en host, cuantización INT8 y despliegue en microcontrolador) para robótica de bajo coste. El autor advierte explícitamente de que las métricas offline no garantizan una conducción estable y que el rendimiento depende de la iluminación, los reflejos, la apariencia de la pista y la posición de la cámara.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional (CNN) definida en Keras; no se detalla la topología interna (no disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen fija de 96 x 96 x 1; no es un modelo de lenguaje) |
| Tipos de cuantización | INT8 completa (fully quantized) para TensorFlow Lite Micro; no se documentan otras variantes |
| Idiomas soportados | en, pt (etiquetas de la model card; el modelo procesa imágenes, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.tflite` (INT8), `.h` (cabecera C para el firmware), `.keras` (modelo original) |
| Tarea | Regresión supervisada por clonación de comportamiento (behavioral cloning) |
| Entrada | Imagen en escala de grises de 96 x 96 x 1 |
| Salida | Un valor de dirección en el rango [-1, +1] |
| Formato de despliegue | TensorFlow Lite Micro sobre ESP32-CAM con ESP32 DevKit |
| Tamaño del repositorio | 0,0 GB (según HuggingFace) |
| Descargas / likes | 0 descargas / 1 like |
| Fecha de publicación | 2026-09-25 |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de una CNN implementada en Keras y entrenada como un problema de regresión supervisada de una sola salida continua. El método declarado es la clonación de comportamiento: se graban sesiones de conducción y se aprende la correspondencia entre la imagen frontal y la dirección aplicada. No se especifican en la model card el número de capas, los canales por capa, la función de activación de salida ni el número total de parámetros, por lo que esos datos quedan como no disponibles. Tampoco se documenta el uso de RLHF, DPO ni técnicas de refuerzo, que en este dominio no resultan de aplicación habitual.

El entrenamiento se realizó sobre el dataset enlazado por el autor (ESP32-CAM Autonomous Line-Following Car Dataset), grabado en pistas de seguimiento de línea bajo distintas condiciones de iluminación, posiciones de cámara, tramos rectos y curvas a izquierda y derecha. El repositorio incluye `training_manifest.json` (configuración de entrenamiento, partición de sesiones y hashes) y `conversion_manifest.json` (configuración de cuantización, métricas de validación y hashes), de modo que la reproducibilidad del pipeline está documentada mediante hashes aunque los valores concretos no se reproducen en la model card. La innovación principal no es arquitectónica sino de despliegue: la cuantización completa a INT8 permite ejecutar la inferencia en un microcontrolador con recursos muy limitados, sin GPU ni acelerador dedicado.

## Capacidades

- Regresión de dirección continua: dado un fotograma en escala de grises de 96 x 96, devuelve un escalar normalizado entre -1 y +1 que codifica la dirección de giro.
- Percepción visual embebida: procesa imágenes directamente en el ESP32-CAM, sin necesidad de enviar el vídeo a un host externo.
- Inferencia en microcontrolador: el modelo INT8 está diseñado para TensorFlow Lite Micro y se integra como cabecera C en el firmware.
- Seguimiento de línea en tramos rectos y curvas: el dataset de entrenamiento cubre secciones rectas y curvas a izquierda y derecha.
- Robustez parcial a variaciones de iluminación y posición de cámara: el dataset se grabó bajo distintas condiciones de luz y montajes de cámara, según el autor.
- No dispone de soporte de tool calling ni function calling: no es un modelo de lenguaje.
- No dispone de capacidades de agente ni de razonamiento multi-paso: la salida es un único valor de control por fotograma.
- No dispone de capacidades multilingües en el sentido habitual; las etiquetas en/pt se refieren a la documentación y al dataset, no a entrada o salida de texto.
- No dispone de modo de razonamiento (thinking mode), visión de alta resolución, audio ni generación de texto.

## Casos de uso

- Robot seguidor de línea de bajo coste: el modelo se compila en el firmware del ESP32-CAM y genera la señal de dirección en tiempo real, lo que elimina la necesidad de un ordenador anfitrión y reduce el consumo y el coste del conjunto.
- Prototipado de clonación de comportamiento: sirve como ejemplo reproducible de un ciclo completo de captura de datos, entrenamiento en Keras, cuantización INT8 y despliegue, útil para validar una idea de control por imitación antes de escalar a hardware mayor.
- Docencia en embedded ML: al incluir el modelo Keras, el `.tflite`, la cabecera C y los manifiestos de entrenamiento y conversión, permite explicar en un aula las diferencias entre un modelo en coma flotante y su versión cuantizada, así como el impacto en las métricas.
- Base para transferencia a otras tareas de conducción: el modelo puede reentrenarse con un dataset propio para seguir marcas de otro color, bordes de pista o trayectorias distintas, reutilizando el mismo contrato de entrada y salida y el mismo firmware.
- Banco de pruebas de pipelines de cuantización: el par de manifiestos (`training_manifest.json` y `conversion_manifest.json`) con hashes permite auditar la reproducibilidad de una conversión a TFLite Micro y comparar la pérdida de precisión introducida por la cuantización.
- Integración en plataformas robóticas educativas tipo kit: al ser un modelo de menos de una decena de archivos y licencia Apache 2.0, se puede incorporar en materiales de curso o en kits vendidos comercialmente conservando los avisos de licencia.
- Validación de robustez frente a condiciones reales: el modelo sirve para medir experimentalmente cómo varían las predicciones de dirección al cambiar la iluminación, los reflejos o la posición de la cámara, tal como advierte el propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no se trata de un modelo de lenguaje. El autor sí publica métricas de validación para el modelo INT8 sobre la partición de validación:

| Métrica | Valor (modelo INT8, validación) |
|---|---|
| MAE | 0,2585 |
| MSE | 0,1145 |
| R² | 0,5372 |
| Precisión de dirección de curva | 95,81 % |

No se publican en la model card las métricas equivalentes del modelo Keras original sin cuantizar, por lo que no es posible cuantificar la pérdida de precisión atribuible a la cuantización INT8.

## Requisitos de hardware

- Plataforma objetivo: ESP32-CAM, con un ESP32 DevKit según la descripción del autor; la inferencia se ejecuta en el propio microcontrolador mediante TensorFlow Lite Micro.
- VRAM para inferencia: no aplica (el modelo no está diseñado para GPU); no disponible cualquier dato de memoria necesaria en el microcontrolador.
- GPU recomendadas: no aplica para inferencia. Para un hipotético reentrenamiento, no se especifica hardware en la información disponible.
- Compatibilidad con GPU de consumo: no aplica; el despliegue es sobre microcontrolador, no sobre GPU.
- Opciones de despliegue: TensorFlow Lite Micro en el firmware del ESP32-CAM (formato `.tflite` INT8 y cabecera `.h`); el modelo `.keras` original puede cargarse en Keras sobre host para inspección o reentrenamiento. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles. No se publican tiempos de inferencia por fotograma ni frecuencia de control alcanzable en el ESP32-CAM.
- Nota de integración: la cabecera `modelo_linha.h` de esta release tiene SHA-256 `f835b35dae58bbae79324b01cc249774e020db102483add12ce391a6d3fae751`; conviene verificar el hash antes de compilar el firmware.

## Comparativa con modelos similares

No se dispone de modelos comparables con especificaciones publicadas en la información proporcionada. Los resultados de búsqueda devuelven proyectos de robótica con ESP32, pero no modelos con fichas técnicas verificables. A continuación se comparan únicamente los enfoques, marcando como no disponible todo dato que no consta:

| Proyecto o modelo | Enfoque | Plataforma | Modelo publicado | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| ESP32-CAM Autonomous Line-Following Car Model | CNN INT8 de regresión por clonación de comportamiento | ESP32-CAM + ESP32 DevKit | Sí (`.keras`, `.tflite`, `.h`) | Apache 2.0 | MAE 0,2585; MSE 0,1145; R² 0,5372; precisión de curva 95,81 % |
| alonmalka19/autonomous-car-esp32-cam | Modelo YOLO propio más script Python en un host | ESP32-CAM con vídeo enviado a un PC | No (repositorio de código) | no disponible | no disponible |
| rakesh-i/ESP32-Autonomous-car | Coche autónomo sobre ESP32 | ESP32 | No (repositorio de código) | no disponible | no disponible |
| TekyInBlack Line Follower con ESP32-CAM | Seguidor de línea con cámara sobre Arduino IDE | ESP32-CAM | No (artículo y montaje) | no disponible | no disponible |

## Limitaciones y advertencias

- Sensibilidad a las condiciones de captura: el propio autor advierte de que el rendimiento depende de la iluminación, los reflejos, la apariencia de la pista, la posición de la cámara y cualquier condición distinta de las que aparecen en los datos de entrenamiento.
- Las métricas offline no garantizan una conducción estable: MAE de 0,2585 y R² de 0,5372 sobre un rango de salida de [-1, +1] indican un error apreciable en la estimación de la dirección; el R² moderado sugiere que una parte relevante de la varianza no queda explicada por el modelo.
- Riesgo de predicciones erróneas fuera de distribución: en ausencia de la línea o ante patrones visuales no vistos, la salida de regresión puede ser arbitraria; en este contexto, el equivalente a la alucinación es una consigna de dirección incorrecta que puede llevar al robot fuera de la pista.
- Sesgo de dominio: no se documenta la composición, el tamaño ni la distribución del dataset de entrenamiento, por lo que no es posible evaluar la cobertura de condiciones (tipos de suelo, colores de línea, intensidades lumínicas) ni el sesgo hacia el trazado concreto de las pistas grabadas.
- Sin métricas del modelo sin cuantizar: no se publican los valores del modelo Keras original, así que no puede medirse la degradación introducida por la cuantización INT8.
- Idiomas: el modelo no procesa texto; las etiquetas en/pt corresponden a la documentación y al dataset, no a capacidades multilingües.
- Adopción nula verificable: el repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que no existe validación independiente por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, siempre que se conserven los avisos de copyright y licencia y se indique si se han realizado cambios; la licencia no ofrece ninguna garantía ni responsabilidad por parte del autor.
- Dependencia del firmware: el modelo solo es utilizable si la cabecera C coincide con el firmware previsto; una discrepancia de contrato (orden de canales, normalización, escala de la salida) produciría un comportamiento incorrecto sin errores evidentes de compilación.
- Ámbito de aplicación muy restringido: no es un modelo de propósito general ni un modelo de lenguaje; cualquier uso fuera del control de dirección de un vehículo con cámara frontal requiere reentrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pdDuduzin/ESP32-CAM_Autonomous_Line-Following_Car_Model
- Dataset de entrenamiento: https://huggingface.co/datasets/pdDuduzin/ESP32-CAM_Autonomous_Line-Following_Car_Dataset
- Proyecto relacionado (ESP32-CAM y YOLO con host en Python): https://github.com/alonmalka19/autonomous-car-esp32-cam
- Proyecto relacionado (coche autónomo con ESP32): https://github.com/rakesh-i/ESP32-Autonomous-car
- Artículo sobre seguidor de línea con ESP32-CAM: https://www.tekyinblack.com/general-projects/robots/line-follower-hacked-a-bit/
- Guía completa de ESP32-CAM: https://www.diyengineers.com/2023/04/13/esp32-cam-complete-guide/
