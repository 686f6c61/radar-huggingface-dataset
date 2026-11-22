# software-mansion/react-native-executorch-rfdetr-nano-detector

## Resumen

RFDetr Nano Detector es un modelo de detección de objetos exportado a ExecuTorch por el equipo de Software Mansion para su uso en la librería React Native ExecuTorch. No se trata de un modelo entrenado desde cero por el autor del repositorio, sino de una conversión del modelo upstream RF-DETR Nano desarrollado por Roboflow, empaquetado como programas `.pte` listos para ejecutarse en dispositivo (on-device) en aplicaciones React Native.

El modelo resuelve el problema de la detección de objetos en tiempo real en entornos móviles y de borde, donde no se dispone de acceso a servidores de inferencia. Al estar exportado para el runtime ExecuTorch v1.4.1, permite ejecutar detección de objetos directamente en el dispositivo con distintos backends de aceleración (CoreML, Vulkan, XNNPACK) y precisiones (fp16, fp32, int8), adaptándose a las capacidades de hardware de cada plataforma.

La relevancia actual del modelo radica en su carácter práctico: proporciona artefactos precompilados y optimizados para despliegue móvil, con cuantización int8 que reduce el tamaño a 37,3 MB manteniendo una precisión cercana a fp32 (49,76 frente a 50,15 de mAP50-95 en COCO). La información disponible no especifica el número de parámetros ni la longitud de contexto, ya que se trata de un modelo de visión y no de un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de detección de objetos basado en RF-DETR de Roboflow) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | fp16 (CoreML, Vulkan), fp32 (XNNPACK), int8 (XNNPACK, 8da8w en capas Linear) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pte` (ExecuTorch) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo upstream RF-DETR Nano más allá de su naturaleza como detector de objetos. RF-DETR es la familia de detectores de Roboflow basada en la arquitectura DETR (DEtection TRansformer), que combina un backbone de extracción de características con un transformer encoder-decoder para la predicción de cajas y clases. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que estos conceptos no aplican a un modelo de detección.

La innovación técnica destacable en este repositorio es el proceso de exportación a ExecuTorch con múltiples backends y la cuantización int8 selectiva: se aplica cuantización dinámica de activaciones int8 y pesos int8 por canal en las capas Linear, mientras que las convoluciones permanecen en fp32. Esta estrategia híbrida logra una reducción de tamaño significativa (de 106 MB en fp32 a 37,3 MB en int8) con una pérdida de precisión mínima de 0,39 puntos de mAP50-95. El backend MLX fue exportado pero no publicado, según se documenta en el archivo `NOTES.md` del repositorio.

## Capacidades

- Detección de objetos en imágenes: el modelo predice cajas delimitadoras y clases de objetos sobre imágenes de entrada, orientado al dataset COCO.
- Ejecución on-device: los artefactos `.pte` están diseñados para ejecutarse en el runtime ExecuTorch v1.4.1 sin necesidad de conexión a servidor.
- Aceleración por backend: soporte para CoreML (fp16), Vulkan (fp16) y XNNPACK (fp32 e int8), permitiendo adaptar la inferencia al hardware disponible.
- Cuantización int8: variante de 37,3 MB apta para dispositivos con recursos limitados.
- Integración con React Native: compatible con la librería React Native ExecuTorch mediante las constantes del registro de modelos de la librería.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step, al no ser un modelo de lenguaje.
- No dispone de capacidades multilingües ni de procesamiento de texto, audio o vídeo más allá de la detección sobre fotogramas.

## Casos de uso

- Detección de objetos en aplicaciones móviles React Native: el modelo se integra mediante la librería React Native ExecuTorch y permite añadir detección visual a apps iOS y Android sin backend, usando la variante CoreML o Vulkan según la plataforma.
- Procesamiento de cámara en tiempo real: con la variante int8 de 37,3 MB y el backend XNNPACK, es adecuado para inferencia sobre fotogramas de cámara en dispositivos de gama media con recursos limitados.
- Aplicaciones de accesibilidad: detección de obstáculos u objetos relevantes en el entorno del usuario a partir de la cámara del dispositivo, ejecutándose localmente para preservar la privacidad.
- Inventario y conteo de objetos: análisis de imágenes capturadas por el usuario para identificar y contar objetos de las clases COCO en contextos de logística o comercio.
- Moderación de contenido visual en el cliente: detección de objetos sensibles en imágenes antes de su envío a un servidor, reduciendo la carga de red y mejorando la privacidad.
- Prototipado rápido de funciones de visión: al estar preexportado y disponible en el registro de modelos de React Native ExecuTorch, permite validar funcionalidades de detección en una app sin entrenar ni exportar modelos propios.
- Preprocesado en pipelines de borde: uso como primer filtro de detección en dispositivos IoT o móviles antes de enviar imágenes a modelos más grandes en la nube.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son los de la model card para la variante XNNPACK int8 frente a fp32, medidos como COCO box mAP50-95 sobre las primeras 500 imágenes de val2017:

| Variante | Precision | COCO box mAP50-95 |
|---|---|---|
| xnnpack fp32 | fp32 | 50,15 |
| xnnpack int8 | int8 (8da8w) | 49,76 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de detección de objetos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño de los artefactos va de 37,3 MB (int8) a 106 MB (fp32), lo que sugiere requisitos de memoria moderados, pero no se especifica el consumo en ejecución.
- GPU recomendadas: no disponible; el modelo está orientado a ejecución on-device en móviles y dispositivos de borde, no a GPU de servidor.
- Compatibilidad con GPU de consumo: no se documenta soporte para GPUs de escritorio; los backends publicados son CoreML (Apple), Vulkan (gráficas compatibles) y XNNPACK (CPU).
- Opciones de despliegue: runtime ExecuTorch v1.4.1; integración mediante la librería React Native ExecuTorch; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos sobre modelos comparables de detección de objetos exportados a ExecuTorch ni sobre las alternativas de la familia RF-DETR (small, medium, large) en cuanto a parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documentan sesgos del modelo upstream ni del proceso de exportación.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero el modelo puede producir detecciones falsas o cajas imprecisas, especialmente en clases poco representadas en COCO.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa texto ni tiene ventana de contexto. Su alcance se limita a las clases del dataset COCO.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial con atribución y sin garantías; debe verificarse la licencia del modelo upstream RF-DETR de Roboflow para confirmar compatibilidad.
- Compatibilidad de runtime: los archivos están publicados para ExecuTorch v1.4.1 y el runtime no garantiza compatibilidad hacia adelante; un runtime más antiguo puede fallar al cargarlos.
- El backend MLX fue exportado pero no publicado; no se debe asumir su disponibilidad.
- La cuantización int8 solo se aplica a capas Linear; las convoluciones permanecen en fp32, por lo que la reducción de memoria es parcial.
- No se especifican los parámetros totales ni el consumo de memoria en ejecución, lo que dificulta planificar el despliegue en dispositivos con RAM muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/software-mansion/react-native-executorch-rfdetr-nano-detector
- Modelo upstream RF-DETR (Roboflow): https://github.com/roboflow/rf-detr
- Librería React Native ExecuTorch: https://www.npmjs.com/package/react-native-executorch
- Documentación de descarga de modelos: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
- Nota sobre el backend MLX no publicado: https://huggingface.co/software-mansion/react-native-executorch-rfdetr-nano-detector/blob/main/mlx/NOTES.md
