# ricmatsui/remote-gesture

## Resumen

`ricmatsui/remote-gesture` es un clasificador de imágenes convolucional desarrollado por el autor `ricmatsui` para reconocer gestos táctiles de un solo trazo sobre la pantalla de un teléfono y mapearlos a diez acciones típicas de un mando a distancia de televisión. El modelo resuelve el problema de la interacción remota mediante gestos trazados en el propio dispositivo, sin necesidad de hardware adicional. Su relevancia radica en que está diseñado para ejecutarse íntegramente en el navegador a través de TensorFlow.js, de modo que la inferencia se realiza en el teléfono del usuario y no se envían datos a ningún servidor. Arquitectónicamente, es una CNN secuencial compacta de dos capas convolucionales y dos capas densas, que recibe una imagen en escala de grises de 32×32 píxeles. La publicación incluye el modelo en formato Keras (`model.keras`) y su conversión a TensorFlow.js (`tfjs/model.json` y el shard de pesos), además de un archivo `gestures.json` que define el orden de las etiquetas y la acción asociada a cada clase.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN secuencial (Conv2D + MaxPool2D + Dense) |
| Parámetros totales | ≈ 544.522 (estimado a partir de la arquitectura publicada) |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplicable (clasificador de imágenes) |
| Licencia | MIT |
| Formato de pesos | Keras (`model.keras`) y TensorFlow.js (`tfjs/model.json`, `tfjs/group1-shard1of1.bin`) |

## Arquitectura y entrenamiento

La arquitectura es una CNN secuencial simple que comienza con una entrada de 32×32×1 (una imagen monocanal normalizada a [0,1]). Le siguen dos bloques de convolución: una capa Conv2D con 32 filtros de 3×3 y activación ReLU, seguida de MaxPool2D(2), y después otra Conv2D con 64 filtros de 3×3 y ReLU, también seguida de MaxPool2D(2). El tensor resultante se aplana (4096 valores) y pasa por una capa Dense de 128 neuronas con ReLU y Dropout(0.4), finalizando en una Dense de 10 salidas con softmax. La entrada no es un dibujo binario: el gradiente de grises a lo largo del trazo codifica la dirección del movimiento, de modo que el orden del trazo forma parte de la información, no solo la forma resultante. Este detalle es clave para distinguir gestos como un círculo trazado en sentido horario de uno antihorario.

El entrenamiento se realizó con el optimizador Adam legacy (`clipnorm=1.0`), una tasa de aprendizaje con `CosineDecayRestarts` (valor inicial `1e-4`, `first_decay_steps=50`, `t_mul=2.0`, `m_mul=0.9`, `alpha=1e-7`) y pérdida `sparse categorical cross-entropy`. Se usó un tamaño de lote de 32 y hasta 500 épocas, con `EarlyStopping` monitorizando `val_loss`, paciencia de 30 y `restore_best_weights=True`. El dataset se dividió en `train` y `test`; el aumento de datos se aplicó únicamente al conjunto de entrenamiento, de modo que la validación se realizó sobre datos reales sin aumentación. Cada clase de entrenamiento se sobremuestreó a 10.000 ejemplos mediante `RandomZoom((-0.1, 0.3))`, `RandomRotation(0.02)` y `RandomTranslation(0.1, 0.1)`, además de volteos y rotaciones condicionados por las banderas `allowMirrorHorizontal`, `allowMirrorVertical`, `allowRotation` y `allowSlanted` definidas en `gestures.json`.

## Capacidades

- Clasificación de gestos táctiles de un solo trazo en diez categorías fijas: flechas direccionales, círculo y contra-círculo para encendido/apagado, formas de letras para accesos directos a aplicaciones, y formas de caret/vee para inicio y volver.
- Inferencia 100% local en el navegador mediante TensorFlow.js; no requiere conexión a servidores ni API externas.
- Sensibilidad deliberada al orden del trazo gracias a la codificación de dirección en el gradiente de grises de la imagen de entrada.
- Compatibilidad con el flujo de trabajo Keras para reentrenamiento o exportación a otros entornos.
- Umbral de confianza integrado en la aplicación de referencia: las predicciones con confianza inferior a 0,6 se descartan y se tratan como "desconocido".
- No soporta generación de texto, razonamiento complejo, tool calling ni capacidades multimodales: es un clasificador de visión especializado.

## Casos de uso

- Control remoto de televisión mediante gestos en el móvil: el usuario dibuja un trazo sobre la pantalla del teléfono para cambiar de canal, subir el volumen o apagar el televisor. El modelo clasifica el gesto en una de las diez acciones y la app envía el comando correspondiente al televisor por infrarrojos o red local.
- Accesibilidad para personas con movilidad reducida: al no requerir pulsar botones físicos, permite manejar un mando de TV con un único trazo simple, lo que puede ayudar a usuarios con dificultades para manejar mandos pequeños.
- Prototipos de interacción gestual para domótica: el clasificador puede integrarse en aplicaciones que controlen luces, persianas o altavoces, usando gestos circulares y direccionales como comandos.
- Demos educativas y tutoriales sobre despliegue de modelos con TensorFlow.js: el modelo sirve como ejemplo práctico de cómo convertir un modelo Keras a formato web y ejecutarlo en el cliente.
- Aplicaciones de entretenimiento y juegos casuales: gestos como el círculo o las flechas pueden usarse para activar acciones en juegos sencillos de móvil sin interfaz compleja.
- Entrenamiento de modelos personalizados de reconocimiento de gestos: el repositorio proporciona una base de arquitectura y un dataset etiquetado que pueden adaptarse a nuevos conjuntos de acciones reentrenando el clasificador y actualizando `gestures.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la métrica empleada para el entrenamiento y la validación es `accuracy`, pero no se facilitan cifras concretas de precisión sobre el conjunto de prueba. Por tanto, no es posible comparar este modelo con otros clasificadores de gestos a partir de datos cuantitativos públicos.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en el navegador del teléfono que dibuja el gesto; no requiere GPU dedicada ni VRAM en el servidor.
- Para inferencia en dispositivo móvil, basta un smartphone con un navegador moderno compatible con TensorFlow.js (WebGL o WebAssembly).
- Para reentrenamiento o inferencia en Python, la CNN es muy ligera (≈0,5 millones de parámetros) y las necesidades de memoria son muy bajas; cualquier GPU moderna resulta sobrada.
- Opciones de despliegue: TensorFlow.js en el navegador, Keras (`model.keras`) para experimentación en Python, o TensorFlow Serving si se quisiera exponer como API (aunque el diseño original evita el servidor).
- No se dispone de mediciones públicas de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información pública sobre modelos comparables en la misma categoría (clasificadores de gestos de un solo trazo para mando de TV). Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El dataset de entrenamiento procede de un único autor, un único dispositivo y una única geometría de pantalla, por lo que el modelo puede no generalizar a otros usuarios, tamaños de pantalla o resoluciones.
- El modelo es sensible a la dirección del trazo por diseño; un gesto bien formado pero trazado en sentido inverso puede clasificarse de forma incorrecta.
- Las diez clases son fijas; incorporar una nueva acción requiere reentrenar el modelo y republicar tanto el dataset como el modelo.
- La model card indica que la aplicación de referencia rechaza cualquier predicción con confianza inferior a 0,6 y la trata como "desconocido". El modelo no dispone de una clase de rechazo propia, por lo que ese umbral es responsabilidad de quien lo integre en su sistema.
- No hay benchmarks públicos ni evaluaciones externas, lo que limita la confianza en su rendimiento fuera del entorno de desarrollo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ricmatsui/remote-gesture
- Dataset en Hugging Face (según resultados de búsqueda web): https://huggingface.co/datasets/ricmatsui/remote-gestures
- Enlace al dataset citado en la model card: https://huggingface.co/datasets/ricmatsui/remote-gesture
