# software-mansion/react-native-executorch-rfdetr-keypoint

## Resumen

Este repositorio aloja el modelo RFDetr en su variante de estimación de pose (keypoint) para la librería React Native ExecuTorch, desarrollada por Software Mansion. El modelo está exportado en formato `.pte` con los backends XNNPack, CoreML y MLX, listo para ejecutarse de forma local en dispositivos móviles mediante el runtime ExecuTorch de Meta. Su propósito principal es permitir la estimación de puntos clave del cuerpo humano (pose) sin conexión, preservando la privacidad de los datos del usuario.

La relevancia actual radica en la creciente demanda de aplicaciones móviles con capacidades de visión por computador en el dispositivo, evitando la latencia y los costes de servidores en la nube. Al estar integrado con React Native ExecuTorch, permite a desarrolladores de React Native desplegar modelos de visión de forma declarativa y sencilla, con compatibilidad garantizada con el runtime de ExecuTorch en segundo plano.

El modelo se exportó con ExecuTorch versión 1.3.0, por lo que no se garantiza compatibilidad hacia adelante con versiones futuras del runtime. El repositorio tiene un tamaño de 0,7 GB y la licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RFDetr (basada en DETR, deteccion de objetos y keypoints) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pte` (ExecuTorch, con backends XNNPack, CoreML y MLX) |

## Arquitectura y entrenamiento

RFDetr es un modelo de detección de objetos y estimación de pose desarrollado por Roboflow, basado en la arquitectura DETR (Detection Transformer). Utiliza un transformer de visión para predecir directamente los puntos clave del cuerpo humano, sin necesidad de propuestas de regiones ni anclajes. El modelo se exportó a ExecuTorch en su variante de keypoint, específicamente para estimación de pose, y se compiló con los backends XNNPack (para Android), CoreML y MLX (para iOS), lo que permite una ejecución eficiente en dispositivos móviles.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens de datos de imagen o el proceso de optimización (RLHF, DPO, etc.). La información disponible se limita a la exportación técnica del modelo al formato `.pte` con ExecuTorch 1.3.0, sin especificar el número de parámetros ni la resolución de entrada requerida. La innovación principal de este paquete no está en el modelo en sí, sino en la integración con React Native ExecuTorch, que facilita su despliegue en aplicaciones móviles multiplataforma.

## Capacidades

- Estimación de pose humana: detecta puntos clave del cuerpo (articulaciones, extremidades, etc.) en imágenes o vídeo.
- Inferencia en el dispositivo: ejecución local sin conexión, sin necesidad de servidores externos.
- Compatibilidad multiplataforma: exportado para backends XNNPack (Android), CoreML y MLX (iOS), lo que permite su uso en ambas plataformas móviles.
- Integración con React Native: se usa a través de la librería `react-native-executorch`, que ofrece una interfaz declarativa para cargar y ejecutar el modelo.
- Formato optimizado para runtime: los archivos `.pte` están listos para el runtime ExecuTorch, sin pasos adicionales de conversión.
- No se han documentado capacidades de generación de texto, razonamiento, código o matemáticas, ya que es un modelo puramente de visión.

## Casos de uso

- Aplicaciones de fitness y entrenamiento: la estimación de pose permite analizar la postura del usuario durante ejercicios, detectar errores de forma y contar repeticiones en tiempo real, todo en el dispositivo para garantizar la privacidad.
- Guías de yoga y pilates: el modelo puede evaluar la correcta alineación del cuerpo en cada postura y ofrecer retroalimentación visual o auditiva sin depender de servicios en la nube.
- Análisis de ergonomía en entornos laborales: integrado en una app de RRHH o de bienestar, puede evaluar la postura del trabajador frente a una cámara y alertar sobre posiciones de riesgo para la espalda.
- Realidad aumentada para estética o moda: superponer elementos virtuales sobre las articulaciones detectadas para probar ropa o accesorios de forma virtual, con baja latencia al ejecutarse localmente.
- Accesibilidad para personas con movilidad reducida: aplicaciones de control por gestos que interpretan movimientos de brazos o manos como comandos, sin necesidad de hardware especializado.
- Análisis de deportes de élite: captura de la técnica de un atleta en vídeo, con seguimiento de la pose en tiempo real para análisis de rendimiento y comparativa con modelos ideales.
- Investigación en biomecánica: recogida de datos de pose en estudios de campo con dispositivos móviles, sin la necesidad de sistemas de captura de movimiento caros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se incluyen métricas de precisión (p. ej., mAP, PCK) ni comparativas con otros modelos de estimación de pose. El rendimiento en términos de latencia y throughput dependerá del dispositivo y del backend utilizado (XNNPack, CoreML, MLX), pero no se aportan cifras concretas.

## Requisitos de hardware

- Dispositivos móviles: el modelo está diseñado para ejecutarse en smartphones Android (con XNNPack) y iOS (con CoreML o MLX).
- VRAM estimada: no disponible; depende del tamaño del modelo y de la cuantización, pero al estar optimizado para móviles se espera que quepa en memoria de dispositivos con 4-8 GB de RAM.
- GPU: no se requiere GPU dedicada; se ejecuta en la CPU o en la NPU del dispositivo según el backend.
- Opciones de despliegue: exclusivamente a través de la librería React Native ExecuTorch; no se mencionan alternativas como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. La latencia dependerá del hardware del dispositivo y del backend seleccionado.

## Comparativa con modelos similares

No se dispone de información de rendimiento comparativo con otros modelos de estimación de pose como MediaPipe BlazePose, OpenPose o MoveNet, ya que no se han publicado benchmarks. La principal diferencia es que este paquete está optimizado para su uso en React Native con ExecuTorch, mientras que los otros modelos suelen requerir soluciones nativas o librerías específicas. La licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo hace atractivo frente a alternativas con licencias más restrictivas.

| Modelo | Arquitectura | Formato | Licencia | Integración React Native |
|---|---|---|---|---|
| RFDetr keypoint (este) | Transformer (DETR) | `.pte` (ExecuTorch) | Apache 2.0 | Sí, nativa |
| MediaPipe Blaze | CNN | TFLite | Apache 2.0 | Requiere wrappers adicionales |
| MoveNet | CNN | TFLite | Apache 2.0 | Requiere wrappers adicionales |

## Limitaciones y advertencias

- Compatibilidad con ExecuTorch 1.3.0: no se garantiza compatibilidad con versiones anteriores del runtime, por lo que es necesario usar la versión exacta especificada en la librería.
- Sin datos de precisión: no se han publicado métricas de rendimiento de la estimación de pose, por lo que no se puede evaluar su calidad frente a otros modelos.
- Enfoque exclusivo en visión: no soporta tareas de lenguaje o razonamiento, solo detección de puntos clave.
- Dependencia de la librería React Native ExecuTorch: su uso fuera de este entorno requiere configurar manualmente el runtime ExecuTorch compatible.
- Riesgo de sesgos: al ser un modelo de pose, puede presentar sesgos en la detección según la diversidad de los datos de entrenamiento originales de RFDetr, aunque no se especifican.
- Sin documentación sobre el dataset de entrenamiento: no se puede evaluar la robustez ante casos extremos o condiciones de baja iluminación.

## Enlaces

- [HuggingFace - software-mansion/react-native-executorch-rfdetr-keypoint](https://huggingface.co/software-mansion/react-native-executorch-rfdetr-keypoint)
- [React Native ExecuTorch (GitHub)](https://github.com/software-mansion/react-native-executorch)
- [Documentación de inicio rápido](https://docs.swmansion.com/react-native-executorch/docs/fundamentals/getting-started)
- [Página oficial de React Native ExecuTorch](https://executorch.swmansion.com/)
- [Ejecución de RFDetr original (GitHub de Roboflow)](https://github.com/roboflow/rf-detr)
- [Documentación de ExecuTorch](https://pytorch.org/executorch/stable/index.html)
