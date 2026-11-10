# nxp/facial-landmarks-35-adas-0002-imx

## Resumen

`facial-landmarks-35-adas-0002-imx` es una versión cuantizada a int8 y compilada para los procesadores NXP i.MX 8M Plus, i.MX 93, i.MX 95 e i.MX 952 del modelo `facial-landmarks-35-adas-0002` original de Intel, publicado en el OpenVINO Model Zoo bajo licencia Apache-2.0. NXP realiza la conversión de formato (OpenVINO IR a TensorFlow Lite vía openvino2tensorflow), la cuantización completa post-entrenamiento y la compilación para los aceleradores NPU de cada plataforma (Vivante VX, Ethos-U65 y eIQ Neutron).

El modelo resuelve una tarea concreta de visión por computador: la regresión de 35 puntos clave faciales a partir de un recorte RGB de la cara de 60x60 píxeles. No es un detector de caras; requiere que el rostro haya sido detectado y recortado previamente. Su reducido tamaño (4,65 MB en int8, 4.595.372 parámetros y apenas 41,851 MOPS) lo hace apto para inferencia en el borde (edge) sobre hardware embebido con NPU, donde el consumo y la latencia son críticos.

La relevancia actual radica en que permite desplegar análisis facial ligero (centrado de cara, estimación de orientación de cabeza, estimación básica de mirada) en dispositivos de bajo consumo dentro del ecosistema NXP, sin necesidad de GPU ni de conectividad a la nube. La ficha cubre únicamente lo documentado en la model card; los datos no publicados se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN ligera para regresión de puntos clave faciales (base Intel, OpenVINO Model Zoo) |
| Parametros totales | 4.595.372 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 1x60x60x3) |
| Tipos de cuantizacion | INT8 post-entrenamiento completa (entrada uint8, salida uint8) |
| Idiomas soportados | no disponible (no aplica; tarea de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | TensorFlow Lite (.tflite); variantes precompiladas para Vela (Ethos-U65) y eIQ Neutron |
| Entrada | RGB face crop (1, 60, 60, 3), dtype uint8 |
| Salida | (1, 70) uint8 cuantizado; desnormalizar con escala/zero point para coordenadas [0, 1] |
| FLOPS | 41,851 MOPS |
| Tamano de fichero (int8) | 4,65 MB (`assets/quantized_tflite_model/facial_landmarks_35_uint8.tflite`) |
| Framework origen | Caffe / OpenVINO |
| Runtime | eIQ LiteRT (TensorFlow Lite) con delegado NPU correspondiente |

## Arquitectura y entrenamiento

El modelo base es una red neuronal convolucional ligera desarrollada por Intel para el OpenVINO Model Zoo, diseñada específicamente para la regresión de 35 puntos clave faciales sobre un recorte de cara de 60x60 píxeles en RGB. La arquitectura exacta de capas no se detalla en la información disponible; lo documentado es su naturaleza CNN, su reducido coste computacional (41,851 MOPS) y su número de parámetros (4.595.372). El modelo original se distribuye en formato OpenVINO IR y fue entrenado por Intel; los detalles sobre el dataset de entrenamiento original, el número de tokens o imágenes y la composición del mismo no están disponibles en la información proporcionada.

NXP realiza una derivación con tres modificaciones principales. Primero, la conversión de formato OpenVINO IR a TensorFlow SavedModel y de ahí a TensorFlow Lite mediante openvino2tensorflow, con la normalización de entrada (`data`) aplicada dentro del propio grafo. Segundo, una cuantización int8 completa post-entrenamiento con entrada y salida uint8; dado que los datos de entrenamiento originales no son redistribuibles, el conjunto de calibración representativo se compone de aproximadamente 100 imágenes muestreadas de un subconjunto de ImageNetV2 con uso comercial permitido, redimensionadas a la entrada de 60x60 del modelo. Tercero, la compilación específica por plataforma: para i.MX 93 se usa Vela (Ethos-U65) con las etiquetas `lf-6.18.20_2.0.0` y `lf-6.18.37_2.1.0`; para i.MX 95 e i.MX 952 se usa el eIQ Neutron SDK en versiones 3.1.3, 3.2.1 y 3.2.3. El post-procesamiento (reescalado de las coordenadas normalizadas [0, 1] al tamaño de la imagen original) se realiza fuera del modelo, tal como ilustra `example.py`.

## Capacidades

- Regresión de 35 puntos clave faciales sobre un recorte de cara RGB de 60x60 píxeles.
- Salida de coordenadas normalizadas en [0, 1] que deben desnormalizarse con la escala y el zero point del tensor de salida.
- Centrado de cara (face-centering checks) a partir de la posición de los landmarks.
- Estimación de orientación de cabeza (head-orientation estimation) de forma básica.
- Estimación básica de mirada (basic gaze estimation).
- Inferencia acelerada en NPU de las plataformas NXP i.MX 8M Plus (Vivante VX), i.MX 93 (Ethos-U65) e i.MX 95 / i.MX 952 (eIQ Neutron).
- No incluye detección de caras: el recorte debe proporcionarse externamente.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo puramente de visión y tarea única.

## Casos de uso

- Control de encuadre en videollamadas y captura de documentos: el modelo verifica si la cara está centrada y correctamente orientada a partir de los 35 landmarks, permitiendo avisos en tiempo real sobre hardware i.MX de bajo consumo.
- Autenticación y verificación de presencia: como etapa previa a un sistema de reconocimiento facial, se usa para comprobar que hay una cara bien posicionada y con orientación frontal antes de capturar la imagen de referencia.
- Estimación de atención del conductor o del usuario: la orientación de cabeza derivada de los landmarks permite detectar distracciones o cabeceo en sistemas embebidos de cabina, con latencia baja gracias a la NPU.
- Interacción persona-máquina en electrodomésticos y paneles industriales: estimación básica de mirada para activar o desactivar interfaces según hacia dónde mira el usuario, sin enviar vídeo a la nube.
- Preprocesamiento en pipelines de análisis facial: los landmarks sirven para alinear y normalizar recortes de cara antes de pasarlos a modelos posteriores (reconocimiento de emociones, estimación de edad, etc.) en dispositivos del borde.
- Seguimiento de mirada en señalización digital y análisis de audiencia: el modelo permite calcular de forma agregada si los transeúntes miran una pantalla, ejecutándose localmente en un SoC i.MX 95 con NPU Neutron.
- Pruebas de calidad en captura biométrica: detección de caras mal recortadas o descentradas en aplicaciones de enrollment, usando el error de reconstrucción de landmarks como señal de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta métricas de coste computacional y tamaño: 41,851 MOPS, 4.595.372 parámetros y 4,65 MB en int8. No se proporcionan cifras de precisión (por ejemplo, error medio de landmarks en píxeles o NME) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido de GPU; el modelo está pensado para NPU embebida. El fichero int8 ocupa 4,65 MB y la entrada es de 60x60x3, por lo que el footprint de memoria es mínimo.
- GPU recomendadas: no se documentan; el destino son las NPU de NXP i.MX 8M Plus (Vivante VX), i.MX 93 (Ethos-U65) e i.MX 95 / i.MX 952 (eIQ Neutron).
- ¿Cabe en GPU consumer? No es el objetivo del modelo; al ser un TFLite int8 de 4,65 MB podría ejecutarse en CPU o GPU convencional mediante LiteRT, pero no se documenta ni se garantiza.
- Opciones de despliegue: runtime eIQ LiteRT (TensorFlow Lite) con el delegado NPU correspondiente a cada plataforma; los artefactos precompilados están en `assets/` y se describen en `release_manifest.json`. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Versiones de BSP y SDK documentadas: i.MX 93 con BSP `lf-6.18.20_2.0.0` / Vela `lf-6.18.20_2.0.0` y BSP `lf-6.18.37_2.1.0` / Vela `lf-6.18.37_2.1.0`; i.MX 95 con BSP `lf-6.18.20_2.0.0` / Neutron SDK v3.1.3 y BSP `lf-6.18.37_2.1.0` / Neutron SDK v3.2.1 (y v3.2.3).

## Comparativa con modelos similares

| Modelo | Autor | Tarea | Parametros | Entrada | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| facial-landmarks-35-adas-0002-imx | NXP (derivado de Intel) | 35 landmarks faciales | 4.595.372 | 60x60 RGB | INT8 (TFLite, precompilado para NPU NXP) | Apache-2.0 | Hugging Face (nxp) |
| facial-landmarks-35-adas-0002 | Intel (OpenVINO Model Zoo) | 35 landmarks faciales | no disponible en la informacion | no disponible en la informacion | FP32/FP16 en OpenVINO IR | Apache-2.0 | OpenVINO Model Zoo |
| Otros modelos de landmarks faciales (p. ej. de 68 puntos tipo dlib o MediaPipe Face Mesh) | varios | deteccion de landmarks faciales | no disponible en la informacion | no disponible en la informacion | variable | variable | variable |

La comparación cuantitativa con alternativas no puede realizarse porque la información proporcionada no incluye métricas de precisión ni especificaciones completas de los modelos comparables. La diferencia principal de esta variante frente al modelo original de Intel es el formato (TFLite int8 frente a OpenVINO IR) y la compilación específica para NPU de NXP.

## Limitaciones y advertencias

- No es un detector de caras: requiere que la cara haya sido detectada y recortada previamente; pasar una imagen sin recorte facial producirá resultados inválidos.
- La cuantización int8 se calibró con aproximadamente 100 imágenes de un subconjunto de ImageNetV2, no con datos faciales del dominio original; esto puede introducir degradación de precisión respecto al modelo original en float, aunque no se publican métricas que lo cuantifiquen.
- La entrada está fijada a 60x60 píxeles RGB; caras muy pequeñas, ocluidas, de perfil extremo o con iluminación adversa pueden degradar la calidad de los landmarks.
- Los sesgos del dataset de entrenamiento original de Intel no se documentan en la información disponible; cabe esperar sesgos demográficos heredados del modelo base.
- Riesgo de alucinación en el sentido de landmarks erróneos: al ser un modelo de regresión, siempre devuelve 35 puntos aunque la imagen no contenga una cara válida, sin señal de confianza documentada.
- La licencia Apache-2.0 permite uso comercial, pero el modelo deriva de un modelo de Intel también Apache-2.0; conviene revisar el fichero LICENSE y los términos de las herramientas de conversión y compilación (openvino2tensorflow, Vela, eIQ Neutron SDK) para producción.
- La compilación está atada a versiones concretas de BSP y SDK; usar artefactos precompilados con versiones distintas de las documentadas puede provocar incompatibilidades con el delegado NPU.
- El post-procesamiento (desnormalización de coordenadas y reescalado al tamaño de imagen original) debe implementarse fuera del modelo; omitirlo produce coordenadas inutilizables.
- No dispone de soporte multilingüe, tool calling ni razonamiento; no debe emplearse para tareas fuera de la regresión de landmarks faciales.

## Enlaces

- Hugging Face: https://huggingface.co/nxp/facial-landmarks-35-adas-0002-imx
- Modelo original en OpenVINO (documentación): https://docs.openvino.ai/2022.3/omz_models_model_facial_landmarks_35_adas_0002.html
- Repositorio del modelo original en OpenVINO Model Zoo: https://github.com/openvinotoolkit/open_model_zoo/tree/master/models/intel/facial-landmarks-35-adas-0002
- openvino2tensorflow: https://github.com/PINTO0309/openvino2tensorflow
- Vela (Ethos-U): https://github.com/nxp-imx/ethos-u-vela
- Artefacto i.MX 8M Plus: https://huggingface.co/nxp/facial-landmarks-35-adas-0002-imx/blob/main/assets/imx8mplus/facial_landmarks_35_uint8.tflite
- Artefacto i.MX 93 (BSP lf-6.18.20_2.0.0): https://huggingface.co/nxp/facial-landmarks-35-adas-0002-imx/blob/main/assets/imx93/lf-6.18.20_2.0.0/facial_landmarks_35_uint8_vela.tflite
- Artefacto i.MX 93 (BSP lf-6.18.37_2.1.0): https://huggingface.co/nxp/facial-landmarks-35-adas-0002-imx/blob/main/assets/imx93/lf-6.18.37_2.1.0/facial_landmarks_35_uint8_vela.tflite
- Artefacto i.MX 95 (Neutron SDK v3.1.3): https://huggingface.co/nxp/facial-landmarks-35-adas-0002-imx/blob/main/assets/imx95/3.1.3/facial_landmarks_35_uint8_converted.tflite
- Artefacto i.MX 95 (Neutron SDK v3.2.1): https://huggingface.co/nxp/facial-landmarks-35-adas-0002-imx/blob/main/assets/imx95/3.2.1/facial_landmarks_35_uint
