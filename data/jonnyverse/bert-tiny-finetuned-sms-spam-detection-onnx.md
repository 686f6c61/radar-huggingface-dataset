# JONNYVERSE/bert-tiny-finetuned-sms-spam-detection-ONNX

## Resumen

El modelo `JONNYVERSE/bert-tiny-finetuned-sms-spam-detection-ONNX` es una conversión al formato ONNX del modelo original `mrm8488/bert-tiny-finetuned-sms-spam-detection`, un clasificador de texto basado en la arquitectura BERT tiny. Esta versión está pensada para ejecutarse directamente en el navegador o en entornos JavaScript mediante la librería Transformers.js, lo que facilita el despliegue de detección de spam en SMS sin necesidad de infraestructura de servidor dedicada.

El modelo resuelve un problema concreto: clasificar mensajes SMS como spam o no spam. Su relevancia radica en su tamaño reducido (típico de BERT tiny, alrededor de 4,4 millones de parámetros) y su formato optimizado para inferencia ligera, lo que lo hace adecuado para aplicaciones en tiempo real en dispositivos con recursos limitados. La conversión a ONNX fue realizada automáticamente mediante el espacio de Hugging Face `onnx-community/convert-to-onnx`, y el repositorio tiene un tamaño de 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT tiny (encoder-only transformer) |
| Parametros totales | no disponible (típico de BERT tiny, ~4,4 M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (BERT estándar suele usar 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (archivo .onnx) |

## Arquitectura y entrenamiento

El modelo base es un BERT tiny, una versión reducida de BERT con 4 capas de transformer, 512 unidades ocultas y 2 cabezas de atención. Fue fine-tuned específicamente para la clasificación binaria de mensajes SMS (spam o no spam). La versión ONNX mantiene la misma arquitectura y pesos, pero se exporta al formato Open Neural Network Exchange, lo que permite su ejecución con runtime ONNX en múltiples plataformas, incluido el navegador a través de WebAssembly.

No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el proceso de fine-tuning del modelo original. La conversión a ONNX no modifica los pesos ni la arquitectura, solo el formato de serialización. El repositorio incluye el archivo ONNX y está configurado para su uso con Transformers.js, que internamente utiliza ONNX Runtime Web.

## Capacidades

- Clasificación de texto binaria: detecta si un mensaje SMS es spam o no.
- Inferencia en el navegador o en Node.js mediante Transformers.js, sin servidor dedicado.
- Procesamiento de secuencias cortas de texto (mensajes SMS), con soporte para múltiples turnos si se gestiona externamente.
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No se confirma soporte multilingüe; el modelo original fue entrenado probablemente con datos en inglés, pero no hay información al respecto.

## Casos de uso

- Filtrado de SMS en aplicaciones móviles: el modelo puede integrarse en una app Android o iOS para clasificar mensajes entrantes en tiempo real, marcando los no deseados. Su tamaño reducido permite ejecutarlo localmente sin conexión.
- Extensión de navegador para correo o mensajería web: usando Transformers.js, se puede cargar el modelo en una extensión de Chrome o Firefox para filtrar contenido no deseado en formularios de contacto o chats.
- Chatbot de atención al cliente: como paso previo a un sistema de respuesta, el modelo puede clasificar mensajes de usuarios y derivar los sospechosos de spam a un flujo de verificación manual.
- Análisis de campañas de phishing: en herramientas de seguridad, el modelo puede ayudar a identificar mensajes fraudulentos en conjuntos de datos de SMS, facilitando la creación de listas negras.
- Demostraciones educativas: sirve como ejemplo práctico de despliegue de modelos de NLP en el navegador, mostrando el flujo de conversión a ONNX y uso con Transformers.js.
- Prototipado rápido: al ser un modelo pequeño y de carga rápida, es adecuado para pruebas de concepto en entornos de desarrollo sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original `mrm8488/bert-tiny-finetuned-sms-spam-detection` no incluye métricas de evaluación en su model card, y la versión ONNX tampoco las reporta. Se recomienda evaluar el modelo con un conjunto propio de datos de SMS antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cuantización FP32; puede ejecutarse en CPU sin GPU.
- GPU recomendadas: no necesarias; el modelo funciona bien en CPU convencional.
- Compatibilidad con consumer GPU: sí, cualquier GPU con al menos 1 GB de VRAM es suficiente, aunque no es necesario.
- Opciones de despliegue: Transformers.js (navegador, Node.js), ONNX Runtime Web, ONNX Runtime Python, o cualquier runtime ONNX estándar.
- Latencia y throughput: al ser un modelo tiny, la inferencia en CPU es del orden de milisegundos por mensaje (dependiendo del hardware). En navegador con WebAssembly, la carga inicial del modelo (~0,1 GB) puede tardar unos segundos, pero la inferencia posterior es rápida.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos. El modelo pertenece a la familia de clasificadores BERT tiny para spam, similar a otros como `distilbert-base-uncased-finetuned-sst-2-english` (aunque este es para análisis de sentimiento) o versiones de BERT mini. Sin datos de benchmarks o especificaciones de esos modelos en la información proporcionada, no es posible establecer una comparativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado probablemente con datos en inglés, puede tener un rendimiento deficiente en otros idiomas.
- Riesgo de alucinación: bajo, ya que solo produce una etiqueta binaria, pero puede clasificar erróneamente mensajes legítimos como spam o viceversa.
- Limitaciones de contexto: la arquitectura BERT tiny tiene una ventana de contexto limitada (típicamente 512 tokens), suficiente para SMS pero no para textos largos.
- Restricciones de licencia: la licencia no está especificada en el repositorio, por lo que se desconoce si permite uso comercial. Se recomienda contactar con el autor o revisar el modelo base original.
- Advertencia de producción: el modelo fue convertido automáticamente y no se han publicado evaluaciones de calidad. Antes de usarlo en un entorno real, es necesario validar su precisión con datos representativos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/JONNYVERSE/bert-tiny-finetuned-sms-spam-detection-ONNX
- Modelo base original: https://huggingface.co/mrm8488/bert-tiny-finetuned-sms-spam-detection
- Espacio de conversión a ONNX: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Catálogo de modelos de Microsoft Foundry (referencia al modelo base): https://ai.azure.com/catalog/models/mrm8488-bert-tiny-finetuned-sms-spam-detection
