# hamdanzameer/signavision-cnn

## Resumen

SignaVision Custom CNN es un modelo de clasificación de imágenes desarrollado por hamdanzameer para el reconocimiento del alfabeto en Lengua de Signos Americana (ASL). Se trata de una red neuronal convolucional (CNN) personalizada que clasifica imágenes RGB de 128 × 128 píxeles en 29 clases: las letras A‑Z, más los comandos "delete", "nothing" y "space". El modelo está implementado con TensorFlow/Keras y se distribuye bajo licencia MIT, lo que facilita su uso en proyectos educativos y de investigación.

El modelo destaca por su alta precisión reportada en el conjunto de prueba interno (99,72 % de exactitud) y por su arquitectura relativamente sencilla, compuesta por cuatro bloques convolucionales con normalización por lotes y activación ReLU, seguidos de una capa de pooling global, una capa densa y una salida softmax. Su propósito principal es servir como demostración educativa y base para prototipos de reconocimiento de gestos estáticos, no como un sistema completo de traducción de lengua de signos continua.

La relevancia actual de este modelo radica en su potencial para aplicaciones de accesibilidad y aprendizaje automático en visión por computador, aunque su alcance se limita a gestos estáticos y no cubre señales dinámicas ni comprensión de frases completas. No se dispone de información sobre el número de parámetros, el conjunto de datos de entrenamiento ni los detalles de preprocesamiento más allá de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN personalizada (4 bloques convolucionales) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (reconoce gestos ASL, no texto) |
| Licencia | MIT |
| Formato de pesos | Keras `.keras` |

## Arquitectura y entrenamiento

La arquitectura es una CNN secuencial con cuatro bloques convolucionales de 32, 64, 128 y 256 filtros respectivamente. Cada bloque utiliza normalización por lotes y activación ReLU. Tras la última capa convolucional se aplica una capa de *Global Average Pooling*, seguida de una capa densa de 256 neuronas, una capa de *dropout* y una capa de salida softmax con 29 clases. La entrada es una imagen RGB de 128 × 128 píxeles.

No se han publicado detalles sobre el conjunto de datos de entrenamiento (número de imágenes, composición, origen) ni sobre el proceso de optimización (función de pérdida, optimizador, épocas, etc.). La model card solo indica que el conjunto de prueba interno contiene 8.700 imágenes y que la evaluación externa se realizó con 28 imágenes separadas. No se menciona el uso de técnicas como *data augmentation*, *transfer learning* o *fine-tuning*.

## Capacidades

- Clasificación de imágenes estáticas de gestos ASL en 29 categorías (letras A‑Z, delete, nothing, space).
- Reconocimiento de gestos de la mano en imágenes RGB de 128 × 128 píxeles.
- Adecuado para prototipos de reconocimiento de alfabeto manual en tiempo real (con integración de cámara y preprocesamiento).
- No soporta tool calling, agentes, razonamiento multi‑paso ni generación de texto.
- No tiene capacidades multimodales más allá de la entrada de imágenes.
- No se especifican capacidades multilingües; el modelo solo interpreta gestos ASL.

## Casos de uso

- **Aplicaciones educativas de lengua de signos**: el modelo puede integrarse en una aplicación web o móvil que muestre una letra del alfabeto ASL y pida al usuario que la reproduzca con la mano, evaluando si el gesto es correcto. Su alta precisión en imágenes estáticas lo hace adecuado para ejercicios de práctica.
- **Prototipos de accesibilidad para personas con discapacidad auditiva**: un sistema que capture la mano del usuario mediante una cámara, preprocese la imagen (recorte, redimensionado a 128 × 128) y utilice el modelo para transcribir el alfabeto manual a texto. Aunque no cubre frases completas, puede servir como base para un teclado de deletreo.
- **Demostraciones de visión por computador en cursos universitarios**: al ser un modelo pequeño y con licencia MIT, es ideal para que estudiantes de ingeniería informática analicen su arquitectura, reproduzcan el entrenamiento y comparen métricas de rendimiento.
- **Sistemas de control por gestos**: el modelo puede usarse para reconocer comandos simples como "delete", "space" o "nothing" en entornos controlados, por ejemplo, para navegar por una presentación o controlar un reproductor multimedia.
- **Investigación en robustez de clasificadores de imágenes**: dado que la model card advierte sobre sensibilidad a iluminación, fondo y posición de la mano, el modelo puede emplearse como caso de estudio para evaluar técnicas de *data augmentation* o *domain adaptation*.
- **Integración en pipelines de visión por computador**: al ser un modelo Keras, puede cargarse fácilmente en TensorFlow Serving o en un script de Python con OpenCV para construir un sistema de reconocimiento en tiempo real con una cámara web.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados:

| Metrica | Resultado |
|---|---|
| Exactitud de validacion | 99,78 % |
| Exactitud de test | 99,7241 % |
| Precision | 99,7282 % |
| Recall | 99,7241 % |
| F1 Score | 99,7243 % |
| Top-3 Accuracy | 99,9885 % |
| Exactitud externa | 100 % (sobre 28 imágenes) |

No se proporcionan comparaciones con otros modelos de reconocimiento de ASL ni se detalla el tamaño del conjunto de validación. La exactitud externa del 100 % se obtuvo con una muestra muy pequeña (28 imágenes), por lo que debe interpretarse con cautela.

## Requisitos de hardware

- Al ser una CNN relativamente pequeña (cuatro capas convolucionales y una densa), puede ejecutarse en CPU sin problemas para inferencia por lotes.
- Para inferencia en tiempo real con cámara, se recomienda una GPU de gama media (por ejemplo, NVIDIA GTX 1660 o superior) para mantener una latencia baja.
- No se especifican requisitos de VRAM, pero por el tamaño de la red se estima que necesita menos de 1 GB de memoria de GPU.
- Es compatible con cualquier dispositivo que soporte TensorFlow/Keras, incluyendo Raspberry Pi 4 (con TensorFlow Lite) para prototipos de bajo coste.
- Opciones de despliegue: TensorFlow Serving, TensorFlow Lite, OpenCV + Python, o exportación a formato ONNX para otros frameworks.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen otros proyectos de reconocimiento de ASL basados en CNN (por ejemplo, los mencionados en los resultados de búsqueda), pero no se han publicado métricas comparativas con este modelo. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo solo reconoce gestos estáticos de la mano; no es capaz de interpretar señales dinámicas ni frases completas en lengua de signos.
- La precisión reportada se obtuvo en condiciones controladas; el rendimiento real puede degradarse con cambios de iluminación, fondo, posición de la mano, distancia a la cámara o variaciones entre usuarios.
- No se especifica el origen ni la composición del conjunto de entrenamiento, por lo que no se puede evaluar la posible presencia de sesgos demográficos o de estilo de gesto.
- La evaluación externa se realizó con solo 28 imágenes, lo que no es estadísticamente significativo para garantizar la generalización.
- No se proporcionan detalles sobre el proceso de entrenamiento (épocas, optimizador, función de pérdida), lo que dificulta la reproducibilidad.
- La licencia MIT permite uso comercial, pero el modelo no incluye garantías de precisión ni soporte oficial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hamdanzameer/signavision-cnn
- Proyecto SignaVision en Zenodo (informe y código, autor distinto): https://zenodo.org/records/20071850
- PDF del informe SignaVision: https://zenodo.org/records/20071850/files/SignaVIsion%20Research%20Journal.pdf?download=1
- Repositorio SignVision-AI en GitHub (proyecto similar, autor distinto): https://github.com/mteja03/SignVision-AI
- Artículo relacionado en Semantic Scholar: https://www.semanticscholar.org/paper/Sign-Language-Interpreter-(SignaVision)-Aashrayam-INGH/19af879994f3ed2ccd05c6dac42468435276e8f0
