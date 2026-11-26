# Noor-Khan/vision-hands

## Resumen

Vision Hands (HandPortal) es una aplicación de visión por computador para la detección de manos y la creación de un "portal" visual entre los dedos índices del usuario. A pesar de estar publicada en Hugging Face con el identificador `Noor-Khan/vision-hands`, no se trata de un modelo de aprendizaje automático entrenado por el autor, sino de un paquete de software que combina el modelo preentrenado HandLandmarker de MediaPipe (propiedad de Google) con código de aplicación propio desarrollado por Noorullah Zamindar.

El sistema captura vídeo de webcam a 1280×720, detecta hasta dos manos con 21 puntos de referencia cada una mediante MediaPipe, y utiliza las puntas de los dedos índices como esquinas de un cuadro delimitador axis-aligned. Sobre esa región se aplica uno de ocho efectos visuales (térmico, malla de bordes, posterizado neón, inversión con glitch, boceto, aberración cromática, mosaico de píxeles y duotono), que se compone de vuelta en el fotograma original con un borde difuminado. La selección de efectos se realiza mediante un gesto de pinza con histéresis.

La relevancia de este proyecto es limitada en el contexto de modelos de IA: no aporta pesos nuevos ni datos de entrenamiento, y su interés reside en la ingeniería de interacción humano-computador (máquina de estados del gesto de pinza, suavizado exponencial del cuadrilátero del portal, composición con máscara difuminada) más que en capacidades de aprendizaje automático. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicación Python sobre MediaPipe HandLandmarker (modelo preentrenado de Google); no es una red neuronal propia |
| Parametros totales | no disponible (el modelo HandLandmarker de MediaPipe ronda los 7 MB, según la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la interfaz de la aplicación está en inglés) |
| Licencia | no disponible |
| Formato de pesos | `hand_landmarker.task` (formato de MediaPipe Tasks) |
| Libreria | mediapipe |
| Tamano del repositorio | 0.0 GB |
| Fecha de creacion | 2026-11-26 |
| Fecha de actualizacion | 2026-11-26 |

## Arquitectura y entrenamiento

El proyecto no entrena ninguna red neuronal. La detección de manos se delega en el modelo HandLandmarker de MediaPipe, que devuelve hasta 21 puntos de referencia por mano para un máximo de dos manos. Sobre esa salida, el código de aplicación implementa: (1) un renderizador de portal que toma las puntas de los índices (landmark 8) como esquinas de un cuadro axis-aligned, recorta la región, aplica el efecto sin distorsión de perspectiva y la recompone con máscara de borde difuminado; (2) una máquina de estados para el gesto de pinza que lee la punta del pulgar (landmark 4) y la del índice, con umbrales de entrada 0.055 y liberación 0.070 (histéresis) para que una pinza mantenida dispare una sola vez; (3) un suavizado exponencial móvil (EMA) del cuadrilátero del portal con alpha 0.35 (0.5 en las pruebas de composición); y (4) una capa de HUD con brillo pulsante en el borde, acentos en las esquinas, partículas de energía y viñeta cinematográfica.

No hay datos de entrenamiento, RLHF, DPO ni innovaciones de decodificación. La model card indica explícitamente que "no hay pesos entrenados por Noorullah y no hay datos de entrenamiento". El modelo HandLandmarker (~7 MB) se descarga automáticamente en el primer arranque con verificación SHA-256, aunque ya viene incluido en el repositorio como `hand_landmarker.task`.

## Capacidades

- Detección de manos en tiempo real con hasta 2 manos y 21 landmarks por mano mediante MediaPipe HandLandmarker.
- Creación de un portal visual entre las puntas de los dedos índices, con recorte axis-aligned y composición con máscara de borde difuminado.
- Ocho efectos visuales aplicables al contenido del portal: Thermal (mapa de calor JET), Edge Mesh (bordes Canny), Posterize Neon, Invert Glitch, Sketch (dodge-burn), Chromatic (separación de canales RGB), Pixel Mosaic y Duotone (rampa índigo-cyan).
- Reconocimiento de gesto de pinza con histéresis y disparo por flanco (una activación por pinza mantenida).
- Manejo robusto de landmarks NaN: si falta un punto, no se genera cuadrilátero ese fotograma y se conserva el último válido.
- Controles de teclado: `1`-`8` para saltar a efecto, `f` pantalla completa, `s` captura, `d` detección a resolución reducida, `v` viñeta, `+`/`-` sensibilidad de pinza, `r` reset, `q` salir.
- Uso como biblioteca sin cámara: `PinchTrigger`, `ensure_model` y las funciones de efecto (p. ej. `thermal`) sobre fotogramas BGR.
- No soporta tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües o de audio.

## Casos de uso

- Instalaciones interactivas y arte generativo: el portal entre dedos permite crear experiencias visuales en vivo donde el público ve su entorno transformado en tiempo real; los efectos se cambian con una pinza sin necesidad de teclado.
- Prototipado de interfaces gestuales: la máquina de estados del `PinchTrigger` con histéresis (0.055/0.070) sirve como referencia para implementar gestos de selección fiables en aplicaciones de realidad aumentada o control por webcam.
- Educación en visión por computador: el código muestra de forma didáctica cómo integrar MediaPipe HandLandmarker, gestionar landmarks, suavizar cuadriláteros con EMA y componer máscaras con OpenCV.
- Filtros de vídeo para streaming o videollamadas: los ocho efectos (térmico, boceto, mosaico, etc.) pueden aplicarse a regiones delimitadas por las manos como filtros creativos en directo.
- Pruebas automatizadas de pipelines de vídeo: la API de biblioteca (`ensure_model`, `PinchTrigger`, funciones de efecto) permite testear lógica de detección y composición sin cámara física, útil en CI.
- Demostraciones de interacción humano-computador: el proyecto ilustra cómo combinar detección de manos de bajo coste (~7 MB) con renderizado en tiempo real en CPU compartida, con tiempos por fotograma medidos entre ~1,0 ms (Invert Glitch) y ~21 ms (Chromatic) en un fotograma de 1280×720.

## Benchmarks y rendimiento

La model card incluye mediciones de `evaluate.py` sobre un fotograma de prueba de 1280×720 (Python 3.12.3, OpenCV 5.1.0, MediaPipe 1.2.3, NumPy 2.5.5, Pillow 13.0.0), con media de 10 ejecuciones tras calentamiento en una máquina de CPU compartida:

| Efecto | Diferencia absoluta media | Pixeles cambiados | ms / fotograma |
|---|---:|---:|---:|
| Thermal | 72.969 | 100% | ~1.1 |
| Edge Mesh | 110.961 | 99.9% | ~15 |
| Posterize Neon | 30.241 | 100% | ~19 |
| Invert Glitch | 84.655 | 100% | ~1.0 |
| Sketch | 118.713 | 99.4% | ~1.6 |
| Chromatic | 18.117 | 99.9% | ~21 |
| Pixel Mosaic | 20.438 | 100% | ~11 |
| Duotone | 45.666 | 100% | ~20 |

Composición del portal (puntas en (0.30, 0.30) y (0.70, 0.65), cuadrilátero (384, 216) → (896, 468), efecto Thermal): 100% de píxeles dentro del cuadrilátero cambiados y 1.17% fuera (banda de borde difuminado). Con `alpha=0` el fotograma queda idéntico byte a byte. El brillo del borde y los acentos de esquina cambian el 4.54% del fotograma. La viñeta deja las esquinas a 201 frente a 255 en el centro (escala 0-255). El suavizador EMA (alpha 0.5) mapea 0 → 10 a 5.0 y conserva el último cuadrilátero válido ante un fotograma con NaN. El `PinchTrigger` disparó en los índices 1, 5, 7 y 9 para la secuencia 0.10, 0.04, 0.04, 0.04, 0.08, 0.04, NaN, 0.04, 0.10, 0.04, confirmando un disparo por pinza y el rearmado tras NaN.

No se han publicado resultados de benchmarks de modelos de IA (MMLU, HumanEval, GSM8K, etc.) en la información disponible, por no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM: no aplica; el proyecto está pensado para ejecutarse en CPU. La model card reporta mediciones en una "máquina de CPU compartida".
- GPU recomendadas: no se especifican; no se requiere GPU.
- ¿Cabe en GPU consumer? No aplica; funciona en CPU sin GPU dedicada.
- Almacenamiento: el modelo HandLandmarker ocupa ~7 MB; el repositorio se lista como 0.0 GB.
- Dependencias: Python 3.12.3 probado, OpenCV 5.1.0, MediaPipe 1.2.3 (requirements.txt fija MediaPipe 0.10.x), NumPy 2.5.5, Pillow 13.0.0.
- Despliegue: instalación vía `pip install -r requirements.txt` y `pip install -e .`, ejecución con el comando `handportal`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia: los efectos tardan entre ~1,0 ms y ~21 ms por fotograma a 1280×720 en CPU; no se reporta throughput global del pipeline completo (detección + composición).
- Cámara: se requiere webcam para la aplicación completa; la API de biblioteca funciona sin cámara.

## Comparativa con modelos similares

| Proyecto | Tipo | Modelo base | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vision Hands (HandPortal) | Aplicación de efectos con hand tracking | MediaPipe HandLandmarker (~7 MB) | Vídeo 1280×720, hasta 2 manos, 21 landmarks | no disponible | Hugging Face y GitHub |
| MediaPipe Hands (Google) | Modelo de detección de landmarks | Propio | Imagen/vídeo, hasta 2 manos | Apache 2.0 (según distribución de MediaPipe) | Google MediaPipe |
| Detectores de manos tipo YOLO/BlazePalm | Detección de manos | Redes propias | Imagen | variable según implementación | Repositorios comunitarios |

No se dispone de datos de benchmarks comparativos entre estos proyectos en la información proporcionada; la comparación se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- No es un modelo de IA propio: no hay pesos entrenados por el autor ni datos de entrenamiento; el valor añadido es el código de aplicación sobre MediaPipe.
- La licencia no está indicada en la información disponible, lo que impide confirmar si el uso comercial es posible; además, el modelo HandLandmarker subyacente es de Google y está sujeto a su propia licencia.
- Depende de una webcam y de condiciones de iluminación adecuadas para la detección de manos; no se documentan métricas de precisión de detección en la información disponible (la sección de resultados en fotos reales aparece truncada en la model card).
- El portal usa un cuadro axis-aligned, no un cuadrilátero en perspectiva; la región se recorta sin distorsión, lo que limita la forma del portal a un rectángulo alineado con los ejes.
- El gesto de pinza puede dispararse por falsos positivos si los landmarks son ruidosos; la histéresis y el filtrado de NaN mitigan el problema, pero no se documentan tasas de error.
- Los tiempos por fotograma se midieron en una CPU compartida y son aproximados; no hay garantías de latencia en otros entornos.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-26); no hay evidencia de mantenimiento continuado.
- La aplicación está orientada a escritorio con OpenCV y teclado; no se documenta soporte para navegador, móvil ni otros idiomas de interfaz.

## Enlaces

- Hugging Face: https://huggingface.co/Noor-Khan/vision-hands
- Repositorio original en GitHub: https://github.com/NoorullahZamindar-007/vision-hands
- MediaPipe (Google): https://mediapipe.dev/
- No se han encontrado en la información proporcionada enlaces a papers, blogs, demos adicionales ni documentación de benchmarks.
