# q3146dq4/Supertonic-3-LiteRT-WI8-AFP32

## Resumen

Supertonic-3-LiteRT-WI8-AFP32 es una versión cuantizada del modelo de síntesis de voz Supertonic 3, desarrollado originalmente por Supertone y adaptado a LiteRT/TFLite por el autor q3146dq4. El modelo base es un TTS de 99 millones de parámetros, open-weight, diseñado para ejecutarse localmente en CPU sin necesidad de GPU, nube ni API, y soporta 31 idiomas. Esta variante concreta aplica una cuantización post-entrenamiento (PTQ) selectiva a int8 con pesos dinámicos (WI8-AFP32), manteniendo algunas partes en FP32 para preservar la calidad del audio.

La relevancia de este modelo radica en su capacidad para ejecutar síntesis de voz de alta calidad en dispositivos con recursos limitados, como teléfonos Android, sin conexión a internet. Al estar empaquetado en formato LiteRT/TFLite, puede integrarse directamente en aplicaciones móviles y sistemas embebidos, lo que lo convierte en una opción práctica para desarrolladores que necesitan TTS offline y multilingüe. El repositorio tiene un tamaño de 0,1 GB, lo que indica que los archivos cuantizados son compactos y aptos para entornos con almacenamiento reducido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (TTS neuronal, arquitectura interna no especificada) |
| Parametros totales | 99M (modelo base Supertonic 3) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de síntesis de voz, no de texto generativo) |
| Tipos de cuantizacion | Int8 dinámico (WI8-AFP32) selectivo; text_encoder y duration_predictor en FP32; vocoder con dos operaciones sensibles en FP32 |
| Idiomas soportados | 31 idiomas (según la página del proyecto Supertonic 3) |
| Licencia | OpenRAIL (permite uso comercial con restricciones) |
| Formato de pesos | LiteRT/TFLite (archivos .tflite) |

## Arquitectura y entrenamiento

La arquitectura interna de Supertonic 3 no está detallada en la información disponible, pero se trata de un modelo de síntesis de voz de 99 millones de parámetros, entrenado para generar habla natural en 31 idiomas. El modelo original es open-weight y está diseñado para inferencia en CPU, lo que sugiere una arquitectura eficiente, probablemente basada en redes neuronales recurrentes o transformadores ligeros, aunque no se confirma.

La versión aquí presentada aplica una cuantización post-entrenamiento (PTQ) selectiva. Según la model card, los componentes se distribuyen así: `vector_estimator.tflite` usa cuantización dinámica WI8-AFP32, `vocoder.tflite` también usa WI8-AFP32 pero mantiene dos operaciones sensibles en FP32 para evitar degradación de calidad, mientras que `text_encoder.tflite` y `duration_predictor.tflite` permanecen en FP32. Esta estrategia busca equilibrar la reducción de tamaño y el rendimiento con la fidelidad del audio generado. No se dispone de información sobre el dataset de entrenamiento ni sobre el uso de técnicas como RLHF o DPO, ya que el modelo base no las requiere para TTS.

## Capacidades

- Síntesis de voz multilingüe: genera habla en 31 idiomas, lo que lo hace adecuado para aplicaciones globales.
- Inferencia en CPU: no requiere GPU, lo que permite ejecutarse en dispositivos de bajo consumo como teléfonos móviles, Raspberry Pi o sistemas embebidos.
- Funcionamiento offline: al ser un modelo local, no necesita conexión a internet ni servicios en la nube.
- Integración con LiteRT/TFLite: formato optimizado para el runtime de TensorFlow Lite, compatible con Android y otras plataformas.
- Cuantización int8: reduce el tamaño del modelo y acelera la inferencia, aunque con una posible pérdida menor de calidad en comparación con FP32.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso, ya que es exclusivamente un modelo de text-to-speech.

## Casos de uso

- Lectura de pantalla para accesibilidad: el modelo puede integrarse en aplicaciones de screen reader para personas con discapacidad visual, convirtiendo texto en voz de forma local y sin latencia de red. Su soporte de 31 idiomas lo hace útil en entornos multilingües.
- Asistentes de voz offline: en dispositivos sin conexión, como relojes inteligentes o altavoces de bajo coste, puede generar respuestas habladas a partir de texto, evitando dependencias de servicios en la nube.
- Generación de audiolibros: los desarrolladores pueden crear aplicaciones que conviertan libros electrónicos en audio, procesando el texto localmente y ofreciendo una experiencia de escucha personalizada.
- Navegación GPS sin conexión: el modelo puede pronunciar indicaciones de ruta en tiempo real en dispositivos móviles, incluso en zonas sin cobertura, gracias a su bajo consumo de recursos.
- Traducción de voz a voz en dispositivos móviles: combinado con un motor de traducción, puede leer en voz alta el texto traducido, funcionando como un intérprete offline básico.
- Sistemas de automatización del hogar: integrado en asistentes domésticos, puede verbalizar notificaciones, recordatorios o respuestas a comandos sin necesidad de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas de calidad de voz (como MOS), velocidad de inferencia o comparaciones con otros modelos TTS en esta versión cuantizada. Se recomienda consultar la documentación del modelo base Supertonic 3 para obtener referencias de rendimiento, aunque no se garantiza que los datos sean directamente aplicables a esta variante cuantizada.

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para ejecutarse en procesadores de propósito general, sin necesidad de GPU. El tamaño del repositorio es de 0,1 GB, lo que implica un uso de RAM moderado (estimado entre 100 y 200 MB durante la inferencia, aunque no se especifica).
- Dispositivos compatibles: cualquier dispositivo con soporte para LiteRT/TFLite, incluyendo Android (a partir de API 21 aproximadamente), iOS, Linux y sistemas embebidos con ARM.
- GPU recomendadas: no aplica, ya que no se requiere aceleración gráfica.
- Opciones de despliegue: el formato .tflite permite su uso con el runtime LiteRT, así como con frameworks como TensorFlow Lite, MediaPipe o aplicaciones Android nativas mediante la API TextToSpeechService (como se muestra en el repositorio GitHub asociado).
- Latencia y throughput: no se proporcionan datos concretos, pero al ser un modelo de 99M parámetros cuantizado a int8, se espera una latencia baja en CPUs modernas, aunque no se puede cuantificar sin pruebas.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos TTS similares (como Piper, Coqui TTS, o Edge TTS) en términos de parámetros, contexto, rendimiento o licencia. Los datos de benchmarks y especificaciones de estos modelos no están incluidos en la información proporcionada. Se recomienda consultar las respectivas documentaciones para una evaluación objetiva.

## Limitaciones y advertencias

- La cuantización int8 puede introducir una degradación perceptible en la calidad del audio, especialmente en voces con matices o en idiomas con fonética compleja. Las partes mantenidas en FP32 (text_encoder, duration_predictor y dos operaciones del vocoder) mitigan parcialmente este efecto, pero no lo eliminan por completo.
- La licencia OpenRAIL permite uso comercial, pero incluye restricciones de uso ético: no se permite utilizar el modelo para actividades ilegales, difamatorias, de suplantación de identidad o que violen derechos humanos. Es responsabilidad del desarrollador revisar los términos completos.
- El modelo solo realiza síntesis de voz; no tiene capacidades de comprensión del lenguaje, razonamiento o generación de texto. No debe utilizarse como un modelo de lenguaje general.
- No se dispone de información sobre sesgos en las voces generadas o posibles errores de pronunciación en ciertos idiomas o dialectos. Se recomienda probar el modelo en los idiomas objetivo antes de su despliegue en producción.
- El repositorio contiene únicamente modelos de inferencia en formato LiteRT; no se incluyen scripts de entrenamiento ni pesos originales en otros formatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/q3146dq4/Supertonic-3-LiteRT-WI8-AFP32
- Modelo base (versión LiteRT sin cuantizar): https://huggingface.co/q3146dq4/Supertonic-3-LiteRT
- Modelo base original (Supertone/supertonic-3): https://huggingface.co/q3146dq4/supertonic-3
- Página del proyecto Supertonic 3: https://supertonic3.github.io/
- Repositorio GitHub del motor TTS Android: https://github.com/q3146dq4/supertonic-liteRT-TTS
- Otra variante cuantizada (W8A8 QNN): https://huggingface.co/q3146dq4/supertonic-3-w8a8-qnn-qdq
