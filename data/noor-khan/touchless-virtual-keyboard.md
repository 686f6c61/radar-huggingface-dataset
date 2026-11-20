# Noor-Khan/touchless-virtual-keyboard

## Resumen

Touchless Virtual Keyboard es un repositorio publicado en Hugging Face por Noor-Khan que empaqueta una aplicación de teclado virtual sin contacto basada en visión por computador. No se trata de un modelo de lenguaje ni de una red neuronal entrenada por el autor: el componente de aprendizaje automático es el HandLandmarker preentrenado de MediaPipe de Google (`hand_landmarker.task`, 7,8 MB), y el resto es lógica de teclado escrita en Python por Noorullah Zamindar. El repositorio resuelve el problema de permitir escritura sin periféricos físicos mediante seguimiento de la mano con una webcam.

El sistema detecta la punta del dedo índice (landmark 8), resalta la tecla bajo ella y requiere una permanencia de 6 fotogramas seguida de un gesto de pinza entre pulgar e índice (landmark 4) a menos de 45 píxeles para registrar una pulsación. Incluye un bloqueo de 0,55 segundos para evitar pulsaciones duplicadas. El teclado tiene 35 teclas QWERTY con `BKSP`, `ENTER`, `SHIFT`, `SPACE` y `CLEAR`, y un límite de 1000 caracteres de texto.

Es relevante como ejemplo reproducible de interacción persona-ordenador sin contacto, con un script de evaluación (`evaluate.py`) que regenera todas las métricas publicadas. No obstante, conviene subrayar que no hay pesos propios, ni datos de entrenamiento, ni benchmarks de modelos: las cifras publicadas miden el comportamiento de la lógica de teclado y la detección sobre imágenes estáticas, no la precisión de escritura en condiciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicación de visión por computador; detector de landmarks MediaPipe HandLandmarker (Google) más máquina de estados de teclado en Python |
| Parametros totales | No disponible (el modelo subyacente es `hand_landmarker.task`, 7,8 MB; número de parámetros no publicado en la información disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (se distribuye el archivo `.task` de MediaPipe tal cual) |
| Idiomas soportados | No disponible; la interfaz del teclado es QWERTY en mayúsculas/minúsculas latinas |
| Licencia | MIT (Copyright 2026 Noorullah Zamindar) |
| Formato de pesos | `.task` (MediaPipe HandLandmarker); código Python en el repositorio |

## Arquitectura y entrenamiento

El repositorio no contiene ningún entrenamiento propio. La detección de manos se delega al HandLandmarker preentrenado de MediaPipe, que devuelve 21 landmarks por mano junto con la lateralidad (`Left`/`Right`) y una puntuación de confianza. Sobre esa salida se construye una capa de lógica determinista: un `KeyboardEngine` que gestiona el hover (6 fotogramas sobre la misma tecla), el umbral de pinza (45 píxeles entre pulgar e índice), el latch de pulsación y el cooldown de 0,55 segundos. La aplicación original usa OpenCV y `cvzone.HandDetector`; el módulo `virtual_keyboard.py` llama directamente a MediaPipe y permite ejecución sin cámara.

No hay datos de entrenamiento, ni fases de RLHF/DPO, ni innovaciones de decodificación. Las "medidas" publicadas en la model card corresponden a pruebas funcionales del motor de teclado con puntas de dedo sintéticas y a detección sobre dos fotos de palmas de Wikimedia Commons (CC BY-SA 4.0), no a evaluación de un modelo neuronal.

## Capacidades

- Detección de manos en imágenes estáticas y en flujo de webcam, con 21 landmarks por mano, lateralidad y puntuación de confianza.
- Escritura sin contacto mediante hover más gesto de pinza sobre un teclado QWERTY de 35 teclas.
- Teclas funcionales: `BKSP`, `ENTER`, `SHIFT` (alterna mayúsculas/minúsculas), `SPACE` y `CLEAR`.
- Modo headless: detección de manos en una foto (`--image`) y renderizado del teclado (`--render`), sin necesidad de cámara.
- API programática (`KeyboardEngine.step(index_tip, thumb_tip, now)`) para alimentar posiciones de dedos de forma sintética o desde otra fuente.
- Límite de texto de 1000 caracteres (`MAX_TEXT_LENGTH`).
- No incluye predicción de palabras, fila numérica ni layouts alternativos.
- Solo se procesa la primera mano detectada; una segunda mano se ignora.

## Casos de uso

- Accesibilidad sin contacto: personas con movilidad reducida en brazos o manos pueden escribir apuntando y pellizcando frente a una webcam, sin necesidad de teclado físico. Requiere buena iluminación y vista clara de la mano.
- Quioscos e interfaces públicas higiénicas: en entornos donde el contacto con superficies es indeseable (sanitario, alimentación, museos), el teclado permite introducir texto frente a una pantalla con cámara.
- Pruebas de interacción gestual en investigación HCI: el módulo `virtual_keyboard.py` permite inyectar coordenadas de dedos sintéticas y medir latencia o precisión del gesto sin montar hardware.
- Prototipado de pipelines de visión: sirve como base para integrar MediaPipe HandLandmarker con OpenCV en aplicaciones de seguimiento de manos, sustituyendo el motor de teclado por otra lógica.
- Docencia y demostraciones: el script `evaluate.py` reproduce todas las métricas publicadas, lo que facilita usar el repositorio como ejemplo reproducible en cursos de visión por computador.
- Sustitución de entrada en entornos con guantes o EPI: cuando no se puede teclear con los dedos, el gesto de pinza frente a la cámara puede registrar pulsaciones, siempre que el guante no oculte los landmarks.
- Integración en aplicaciones de escritorio: el módulo se puede importar (`from virtual_keyboard import KeyboardEngine, detect_hands`) y conectar a un bucle de captura propio, por ejemplo con una cámara IP o un flujo de vídeo preprocesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelos en la información disponible. Las cifras de la model card son pruebas funcionales del motor de teclado y de detección sobre imágenes estáticas, no comparativas con otros modelos:

| Medida | Valor |
|---|---|
| Teclas en el layout | 35, todas dentro del marco 1280×720, sin solapamientos |
| Simulación de escritura (30 fps, puntas sintéticas) | `H`, `I`, `SPACE`, `BKSP`, `SHIFT` → minúscula `a`, `ENTER`, `CLEAR` → vacío; todas las teclas se comportaron como en `main.py` |
| Hover de 5 fotogramas (< 6 requeridos) + pinza | Sin pulsación |
| Distancia de pinza 60 px (> 45 px) mantenida 8 fotogramas | Sin pulsación |
| Segunda pulsación dentro del cooldown de 0,55 s | Bloqueada; tras el cooldown funciona |
| Punta fuera del teclado / sin mano en el fotograma | Nada seleccionado; el estado de hover se reinicia |
| Límite de longitud de texto | 1000 caracteres (`MAX_TEXT_LENGTH`) |
| Detección en `samples/palm_left.jpg` | 1 mano, 21 landmarks, Left, score 0,88 |
| Detección en `samples/palm_right.png` | 1 mano, 21 landmarks, Right, score 0,94 |
| Tiempo de detección por foto (tras ~0,6 s de carga del modelo) | ~0,03 s |
| Imagen en blanco / ruido aleatorio | 0 manos detectadas |
| Archivo de modelo ausente | `FileNotFoundError` limpio |

No se midió la escritura en vivo con cámara real: el entorno de evaluación no disponía de webcam. La precisión, velocidad y fiabilidad en distintas condiciones de iluminación están sin medir.

## Comparativa con modelos similares

No disponible. No se han encontrado en la información proporcionada alternativas comparables con parámetros, contexto o rendimiento medibles. El único resultado de búsqueda relacionado es un artículo de revista sobre teclados virtuales con aprendizaje automático (Sowjanya et al., *International Journal of Development Research*), sin datos comparativos publicados en la información disponible.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: los pesos son el HandLandmarker de Google; el valor del repositorio está en la lógica de teclado y en el empaquetado reproducible.
- Solo se usa la primera mano detectada; una segunda mano se ignora.
- Requiere iluminación decente y visión clara de la mano; los umbrales de pinza (45 px) y hover (6 fotogramas) son constantes fijas, no adaptativas.
- Sin predicción de palabras, sin fila numérica y solo con layout QWERTY.
- El modelo de mano detecta manos, no conoce el teclado: no hay aprendizaje específico de la tarea.
- En Linux, la librería nativa de MediaPipe requiere OpenGL ES (`libGLESv2`, p. ej. el paquete `libgles2`).
- No se ha validado la escritura real con webcam: precisión, velocidad y robustez ante cambios de luz están sin medir.
- La licencia del repositorio es MIT, pero el archivo `hand_landmarker.task` es de Google y las fotos de muestra son CC BY-SA 4.0; conviene revisar los términos de MediaPipe para uso comercial en producción.
- Riesgo de alucinación no aplica (no es un modelo generativo), pero sí de falsos positivos o negativos en la detección de landmarks según la calidad de la imagen.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Noor-Khan/touchless-virtual-keyboard
- Aplicación original en GitHub: https://github.com/NoorullahZamindar-007/touchless-virtual-keyboard
- Vídeo de demostración (LinkedIn): https://www.linkedin.com/posts/noorullah-zamindar-4975a328a_python-opencv-computervision-ugcPost-7480590248381640705-ouau/
- Artículo relacionado (International Journal of Development Research): http://www.journalijdr.com/virtual-keyboard-using-machine-learning
