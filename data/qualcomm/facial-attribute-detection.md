# qualcomm/Facial-Attribute-Detection

## Resumen

Facial-Attribute-Detection es un modelo de visión por computador desarrollado por Qualcomm que detecta atributos faciales concretos sobre un rostro ya localizado: cierre de ojos, presencia de mascarilla, presencia de gafas graduadas y presencia de gafas de sol. No es un modelo generativo ni un LLM, sino una red multitarea de detección de atributos orientada a inferencia en tiempo real sobre hardware Qualcomm (NPU Hexagon). Se publica como parte del ecosistema Qualcomm AI Hub Models y se distribuye con artefactos pre-exportados para ONNX, QNN_DLC y TFLite.

El modelo resuelve el problema de clasificación de atributos faciales en el dispositivo (*on-device*), con un tamaño muy reducido: 12,1 millones de parámetros, 46,3 MB en float y 12,3 MB en cuantización w8a8, sobre entradas de 128x128 píxeles. Está pensado para integrarse en pipelines de análisis facial en móviles, wearables, cámaras inteligentes y plataformas IoT basadas en Snapdragon y Dragonwing.

Su relevancia actual radica en la latencia: por debajo de 1 ms por inferencia en varias plataformas Snapdragon de gama alta (0,389 ms en Snapdragon 8 Elite Extreme Gen 6) y en torno a 0,18-0,53 ms en w8a8, ejecutando en NPU. Esto lo hace apto para procesamiento de vídeo en directo con múltiples caras por fotograma sin penalizar el consumo energético del dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal multitarea de detección de atributos faciales (arquitectura propia de Qualcomm; detalles de capas no disponibles) |
| Parametros totales | 12,1 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión; entrada de imagen 128x128) |
| Tipos de cuantizacion | float y w8a8 (pesos y activaciones a 8 bits) |
| Idiomas soportados | No disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | PyTorch (checkpoint `multitask_FR_state_dict.pt`), ONNX, QNN_DLC, TFLite |
| Tamano del modelo | 46,3 MB (float) / 12,3 MB (w8a8) |
| Resolucion de entrada | 128x128 |
| Tarea (pipeline) | object-detection (atributos faciales) |
| Tamano del repositorio | 3,7 GB |
| Runtime objetivo | QAIRT 2.51, ONNX Runtime 1.30.0, TFLite |
| Unidad de computo principal | NPU (Hexagon) |

## Arquitectura y entrenamiento

La model card indica que la arquitectura fue desarrollada por Qualcomm y que el modelo fue entrenado por Qualcomm sobre un conjunto de datos de rostros propietario. Se trata de una red multitarea que, dada una cara recortada, predice simultáneamente cuatro atributos binarios: ojos cerrados/abiertos, mascarilla presente/ausente, gafas graduadas presentes/ausentes y gafas de sol presentes/ausentes. El checkpoint publicado se denomina `multitask_FR_state_dict.pt`, lo que confirma el enfoque multitarea con una única cabeza compartida o varias cabezas sobre un tronco común.

No se especifican en la información disponible el número de tokens de entrenamiento (no aplica), la composición del dataset, ni si se emplearon técnicas de aumento de datos, destilación o ajuste fino específico. Tampoco se detalla la topología exacta (número de capas, tipo de bloques, uso de atención o convoluciones). Lo que sí se documenta es el proceso de optimización para hardware: exportación y compilación mediante Qualcomm AI Hub Workbench, con artefactos cuantizados w8a8 y despliegue en NPU, lo que constituye la innovación técnica principal del paquete (compilación AOT para Hexagon y reducción de precisión sin pérdida declarada de exactitud).

## Capacidades

- Detección de cuatro atributos faciales sobre un rostro recortado: cierre de ojos, presencia de mascarilla, presencia de gafas graduadas y presencia de gafas de sol.
- Procesamiento de imágenes de cualquier procedencia (no restringido al dataset de entrenamiento), según indica la model card.
- Inferencia en tiempo real en NPU de dispositivos Qualcomm, con latencias sub-milisegundo.
- Ejecución en múltiples runtimes: ONNX, QNN_DLC (Qualcomm AI Engine Direct) y TFLite.
- Soporte de cuantización w8a8 para reducir el tamaño a 12,3 MB y aproximadamente duplicar la velocidad frente a float.
- Exportación con formas de entrada personalizadas y pesos ajustados mediante la librería Qualcomm AI Hub Models.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente perceptivo de clasificación de atributos.
- Capacidades multilingües no aplicables.

## Casos de uso

- **Autenticación y presencia en dispositivos móviles**: detección de ojos cerrados para verificar que el usuario está atento durante el desbloqueo facial o la firma de operaciones, con latencia inferior a 1 ms que no bloquea la interfaz.
- **Videollamadas y teleconferencia**: activación automática de avatares o filtros según la presencia de gafas de sol o mascarilla, y detección de parpadeo para estimar atención, ejecutando todo en la NPU local sin enviar vídeo a la nube.
- **Control de acceso y señalética en edificios**: verificación de que una persona lleva mascarilla en entornos con requisitos sanitarios, o detección de gafas de sol en accesos donde se exige retirarlas, integrado en cámaras IP con SoC Snapdragon.
- **Automoción y sistemas de monitorización del conductor**: detección de ojos cerrados como señal de somnolencia, combinada con la detección de gafas de sol para ajustar la exposición de la cámara de cabina; el bajo consumo es crítico en este escenario.
- **Análisis de audiencia en retail**: agregación de estadísticas anónimas (porcentaje de clientes con mascarilla o gafas) en cámaras de conteo, procesando localmente para evitar problemas de privacidad y sin depender de conectividad.
- **Robótica de servicio e IoT industrial**: integración en robots de recepción o terminales de kiosco que adaptan el saludo o la interfaz según si el interlocutor lleva mascarilla, con inferencia en el propio dispositivo Dragonwing o QCS.
- **Preprocesado en pipelines de reconocimiento facial**: filtrado previo de caras no aptas (ojos cerrados, gafas de sol) antes de enviar la imagen a un modelo de verificación de identidad, reduciendo falsos rechazos y cómputo innecesario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de exactitud (precisión, recall, F1 por atributo) en la información disponible. La model card solo incluye métricas de latencia y memoria por plataforma. Se reproducen a continuación las más representativas:

| Plataforma | Runtime | Precision | Tiempo de inferencia (ms) | Memoria pico (MB) | Unidad |
|---|---|---|---|---|---|
| Snapdragon 8 Elite Extreme Gen 6 Mobile | ONNX | float | 0,389 | 0-59 | NPU |
| Snapdragon 8 Elite Gen 6 Mobile | ONNX | float | 0,414 | 0-59 | NPU |
| Snapdragon 8 Elite Gen 5 For Galaxy | ONNX | float | 0,448 | 0-60 | NPU |
| Snapdragon X2 Elite | ONNX | float | 0,409 | 1-1 | NPU |
| Snapdragon X Elite | ONNX | float | 0,832 | 22-22 | NPU |
| Snapdragon 8 Gen 3 Mobile | ONNX | float | 0,626 | 0-89 | NPU |
| Snapdragon 8 Gen 1 Mobile | ONNX | float | 1,164 | 0-82 | NPU |
| Dragonwing IQ-9075 | ONNX | float | 1,123 | 0-4 | NPU |
| Snapdragon 8 Elite Gen 5 For Galaxy | ONNX | w8a8 | 0,225 | 0-60 | NPU |
| Snapdragon X2 Elite | ONNX | w8a8 | 0,181 | 1-1 | NPU |
| Snapdragon X Elite | ONNX | w8a8 | 0,390 | 12-12 | NPU |
| Snapdragon 8 Gen 3 Mobile | ONNX | w8a8 | 0,294 | 0-87 | NPU |
| Snapdragon 8 Gen 1 Mobile | ONNX | w8a8 | 0,531 | 0-88 | NPU |

La cuantización w8a8 reduce aproximadamente a la mitad el tiempo de inferencia respecto a float en todas las plataformas medidas y rebaja la memoria pico en los casos donde esta es significativa (por ejemplo, de 22 MB a 12 MB en Snapdragon X Elite).

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables de detección de atributos faciales (por ejemplo, alternativas de InsightFace, MediaPipe Face Mesh o clasificadores multitarea de terceros) con los que establecer una comparación rigurosa de parámetros, contexto y rendimiento. Por tanto, la comparativa se declara no disponible. Como referencia cualitativa, el modelo se distingue por su tamaño reducido (12,1 M de parámetros), su licencia permisiva BSD-3-Clause y su optimización específica para NPU Qualcomm, factores que no están documentados para las alternativas en la información disponible.

## Limitaciones y advertencias

- **Sesgos demográficos**: el modelo fue entrenado sobre un dataset propietario de Qualcomm cuya composición no se publica; no es posible evaluar el equilibrio por género, edad, tono de piel o etnia, lo que constituye un riesgo relevante en aplicaciones de acceso o vigilancia.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y negativos en la clasificación de atributos, especialmente en condiciones de baja iluminación, oclusión parcial, ángulos extremos o resoluciones inferiores a 128x128.
- **Dependencia de un detector de caras previo**: el modelo clasifica atributos sobre una cara ya recortada; no localiza rostros por sí mismo, por lo que requiere un pipeline con detección y alineación facial previas.
- **Solo cuatro atributos**: no detecta edad, género, emoción, identidad ni puntos faciales; su alcance es estrictamente el documentado.
- **Restricciones de licencia**: BSD-3-Clause permite uso comercial y modificación con atribución y sin endorsement; sin embargo, el uso de datos biométricos faciales está sujeto a normativa específica (RGPD en la UE, que clasifica los datos biométricos como categoría especial), por lo que el cumplimiento legal debe evaluarse por aplicación.
- **Datos de entrenamiento propietarios**: no es posible auditar el dataset ni reproducir el entrenamiento, lo que limita la trazabilidad y la evaluación independiente.
- **Optimización ligada a hardware Qualcomm**: los artefactos QNN_DLC y las latencias reportadas son específicos de NPU Hexagon; en otras plataformas el rendimiento será distinto y las rutas de exportación pueden no estar soportadas.
- **Ausencia de métricas de exactitud**: no se publican precisión, recall ni curvas ROC, lo que impide comparar objetivamente con alternativas antes de desplegar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qualcomm/Facial-Attribute-Detection
- Página del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/face_attrib_net
- Repositorio Qualcomm AI Hub Models (GitHub): https://github.com/qualcomm/ai-hub-models/blob/v0.67.0/src/qai_hub_models/models/face_attrib_net
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Sitio corporativo de Qualcomm: https://www.qualcomm.com/
- Información corporativa de Qualcomm: https://www.qualcomm.com/company
- Relaciones con inversores de Qualcomm: https://investor.qualcomm.com/overview/default.aspx
- Qualcomm en Wikipedia: https://en.wikipedia.org/wiki/Qualcomm
