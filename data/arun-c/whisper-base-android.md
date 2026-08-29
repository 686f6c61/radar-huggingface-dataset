# arun-c/whisper-base-android

## Resumen

El modelo `arun-c/whisper-base-android` es una versión cuantizada del modelo Whisper Base de OpenAI, preparada específicamente para su uso offline en aplicaciones Android mediante el motor de inferencia whisper.cpp. El repositorio contiene un único archivo de pesos en formato GGUF (`ggml-base-q8_0.bin`) junto con un archivo de versión, diseñado para que una aplicación Android pueda descargar y actualizar el modelo de dictado por voz sin conexión. El modelo soporta múltiples idiomas, con especial énfasis en tamil, inglés, malayalam e hindi, y no requiere ningún coste de API al ejecutarse localmente.

La relevancia de este modelo radica en su enfoque práctico: ofrece reconocimiento de voz de calidad media (Whisper Base) en un formato ligero y optimizado para dispositivos móviles, sin depender de servicios en la nube. Al estar cuantizado en Q8_0, mantiene un equilibrio entre tamaño y precisión, lo que lo hace adecuado para integración en aplicaciones de teclado, asistentes de voz o herramientas de accesibilidad. El repositorio actúa como un canal de distribución de modelos para una aplicación Android concreta, no como un modelo independiente con documentación exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Base (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 |
| Idiomas soportados | Multilingue (tamil, ingles, malayalam, hindi y otros soportados por Whisper) |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo ggml-base-q8_0.bin) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion en 8 bits (Q8_0) del checkpoint Whisper Base original de OpenAI, convertido al formato GGUF para su uso con whisper.cpp. Whisper Base es un modelo de reconocimiento automatico de voz basado en la arquitectura transformer encoder-decoder, entrenado por OpenAI sobre un gran corpus de audio multilingue. Sin embargo, el repositorio no proporciona detalles sobre el proceso de cuantizacion, los datos de entrenamiento originales ni posibles ajustes adicionales. La unica informacion disponible es que se trata de una adaptacion para inferencia offline en Android, sin coste de API y con soporte multilingue.

## Capacidades

- Transcripcion de voz a texto offline: convierte audio capturado por el microfono en texto sin conexion a internet.
- Soporte multilingue: reconoce tamil, ingles, malayalam, hindi y otros idiomas cubiertos por Whisper.
- Dictado por voz en tiempo real: pensado para aplicaciones de escritura por voz en Android.
- Integracion con whisper.cpp: motor ligero y eficiente para dispositivos con recursos limitados.
- Sin coste de API: al ejecutarse localmente, no requiere llamadas a servicios externos.
- Actualizacion via repositorio: el archivo `version.json` permite a la aplicacion comprobar y descargar nuevas versiones del modelo.

## Casos de uso

- Dictado por voz en aplicaciones de mensajeria: el usuario puede escribir mensajes hablando, con transcripcion local y privada, gracias al soporte offline y al tamano reducido del modelo.
- Teclados virtuales con entrada de voz: integracion en teclados Android para convertir voz en texto sin depender de servicios de Google o Apple.
- Transcripcion de reuniones o notas de voz: la aplicacion puede procesar grabaciones de audio almacenadas en el dispositivo, generando texto de forma local.
- Accesibilidad para personas con discapacidad motora: permite escribir mediante voz en cualquier campo de texto, con baja latencia al ser un modelo base cuantizado.
- Asistentes de voz offline: uso como componente de reconocimiento de voz en asistentes personales que funcionan sin conexion, preservando la privacidad del usuario.
- Aplicaciones educativas para aprendizaje de idiomas: practica de pronunciacion y transcripcion en tamil, ingles, malayalam o hindi, con retroalimentacion inmediata sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de precision, latencia ni comparaciones con otros modelos. Al tratarse de una cuantizacion Q8_0 de Whisper Base, se espera un rendimiento similar al del modelo original con una ligera degradacion tipica de la cuantizacion, pero no hay datos concretos que lo confirmen.

## Requisitos de hardware

- Al ser un modelo base cuantizado en Q8_0, el archivo ocupa aproximadamente 0.1 GB (según el tamano del repositorio), por lo que cabe en cualquier smartphone Android con al menos 256 MB de RAM libre.
- No requiere GPU dedicada; la inferencia se realiza en CPU mediante whisper.cpp, optimizado para arquitecturas ARM.
- Es compatible con dispositivos de gama baja y media, siempre que tengan soporte para operaciones de punto flotante de 8 bits.
- Opciones de despliegue: integracion directa en una app Android mediante whisper.cpp, o mediante wrappers como whisper-android.
- No se dispone de datos de latencia o throughput especificos para este modelo.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa cuantitativa. Como referencia cualitativa, este modelo se situa entre Whisper Tiny (mas pequeño y rapido, pero menos preciso) y Whisper Small (mas grande y preciso, pero con mayor consumo de recursos). La cuantizacion Q8_0 reduce el tamano respecto al Whisper Base original (que suele ocupar unos 150 MB en FP32) manteniendo una precision cercana, pero no hay datos publicados que lo confirmen. Otras alternativas para Android incluyen modelos TensorFlow Lite de Whisper, como los del repositorio `vilassn/whisper_android`, que ofrecen integracion con TFLite en lugar de GGUF.

## Limitaciones y advertencias

- No se especifica la licencia del modelo; aunque Whisper Base original es MIT, este repositorio no declara ninguna, por lo que se debe contactar con el autor antes de un uso comercial.
- La cuantizacion Q8_0 puede introducir una ligera perdida de precision en la transcripcion, especialmente en audio con ruido o acentos poco comunes.
- El soporte multilingue depende del modelo Whisper Base original, que tiene un rendimiento variable segun el idioma; los idiomas principales declarados (tamil, ingles, malayalam, hindi) pueden funcionar mejor que otros.
- No hay informacion sobre sesgos o alucinaciones especificas; como todo modelo de ASR, puede producir errores en nombres propios o terminologia tecnica.
- El repositorio esta pensado como un canal de distribucion para una aplicacion concreta; no incluye documentacion de uso ni ejemplos de integracion.
- La ausencia de datos de entrenamiento o validacion impide evaluar su robustez en entornos de produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/arun-c/whisper-base-android
- Repositorio de referencia whisper.cpp-android: https://github.com/anuj-softech/whisper.cpp-android
- Repositorio alternativo con TFLite: https://github.com/vilassn/whisper_android
- Modelo original Whisper Base en HuggingFace: https://huggingface.co/openai/whisper-base
- Documentacion de Whisper Base en Qualcomm AI Hub: https://aihub.qualcomm.com/compute/models/whisper_base
