# mlboydaisuke/Kokoro-82M-ExecuTorch

## Resumen

Kokoro-82M-ExecuTorch es una conversión del modelo de síntesis de voz (TTS) Kokoro-82M al formato ExecuTorch, pensada para ejecución en dispositivos con el backend XNNPACK. El modelo original, desarrollado por hexgrad, es un sintetizador no autorregresivo de 81,8 millones de parámetros que sigue la arquitectura StyleTTS2, combinando un BERT de fonemas de 12 capas, un predictor de duración y un vocoder iSTFTNet para generar audio de 24 kHz. Este repositorio concreto, creado por mlboydaisuke, empaqueta el modelo en un único archivo `.pte` de 325,4 MB con dos métodos (`predict` y `vocode`), manteniendo la longitud de la secuencia de fonemas y de tramas completamente dinámica.

La relevancia de este modelo radica en su capacidad para ejecutar síntesis de voz de alta calidad en hardware local sin conexión a la nube, con un tamaño reducido y una latencia competitiva. La conversión a ExecuTorch con XNNPACK permite su despliegue en CPUs de dispositivos móviles y embebidos, lo que lo convierte en una opción práctica para aplicaciones de asistente de voz, accesibilidad y generación de contenido. El modelo base está licenciado bajo Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 + iSTFTNet: BERT de fonemas de 12 capas, predictor de duracion, vocoder iSTFTNet, vector de estilo de 256 dimensiones |
| Parametros totales | 81,8 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | dinamica (sin limite fijo; depende de la memoria del dispositivo) |
| Tipos de cuantizacion | fp32 (XNNPACK) |
| Idiomas soportados | ingles (principalmente, segun fuentes externas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ExecuTorch `.pte` (con delegate XNNPACK) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura StyleTTS2 con un vocoder iSTFTNet. En la entrada recibe una secuencia de fonemas (representados como identificadores enteros), un vector de estilo de 256 dimensiones que codifica la voz y un parámetro de velocidad. El componente de fonemas es un BERT de 12 capas que produce representaciones contextuales, y un predictor de duración estima cuántos tramas de audio corresponde a cada fonema. El vocoder iSTFTNet convierte las características intermedias en una forma de onda de 24 kHz. El modelo es no autorregresivo: genera el audio completo en una sola pasada, sin decodificación token a token.

El entrenamiento del modelo original no está documentado en la información disponible. Se sabe que el texto se convierte a fonemas IPA mediante la librería `misaki` (o espeak-ng) antes de entrar al grafo, y que el modelo se exporta con un bucle LSTM "enrollado" mediante la operación `scan` de ExecuTorch para mantener la secuencia dinámica, en lugar de desenrollarla (lo que habría hecho el archivo inviable por tiempo de compilación). No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens ni el uso de RLHF/DPO.

## Capacidades

- Síntesis de voz a partir de texto (TTS) en inglés, con 54 voces diferentes seleccionables mediante un vector de estilo.
- Generación de audio de 24 kHz en una sola pasada (no autorregresivo), con latencia baja.
- Control de velocidad de habla mediante el parámetro `speed`.
- Ejecución en dispositivo (on-device) gracias al formato ExecuTorch y al backend XNNPACK, sin necesidad de GPU.
- Conversión de grafemas a fonemas realizada en el host (fuera del grafo), lo que permite adaptar la entrada de texto a diferentes sistemas fonéticos.
- Soporte de secuencias dinámicas de fonemas y tramas, sin relleno (padding) ni limitaciones de longitud fija.

## Casos de uso

- **Asistentes de voz en dispositivos moviles**: el modelo puede integrarse en aplicaciones de asistente para generar respuestas habladas sin conexión, aprovechando su tamaño reducido y su ejecución en CPU.
- **Accesibilidad para personas con discapacidad visual**: lectura en voz alta de contenido de pantalla en tiempo real, con baja latencia y sin depender de servicios en la nube.
- **Audioguías y contenido educativo**: generación de narraciones para aplicaciones de aprendizaje o turismo, con voces personalizables y control de velocidad.
- **Sistemas de respuesta interactiva (IVR)**: en centralitas telefónicas, el modelo puede generar respuestas dinámicas en inglés sin depender de servicios externos, reduciendo costes y latencia.
- **Generación de contenido en streaming**: integración en herramientas de creación de contenido para producir locuciones de video o podcasts de forma local, sin subir datos a la nube.
- **Prototipado rapido de productos TTS**: gracias a su licencia Apache-2.0 y a su tamaño, es adecuado para pruebas de concepto y validación de experiencias de voz en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio incluye una verificacion interna con cinco frases en ingles: las duraciones de los fonemas coinciden exactamente con el modelo original en 5 de 5 casos, y se mide la correlacion de la forma de onda, pero no se aportan metricas comparativas con otros modelos TTS.

## Requisitos de hardware

- **VRAM estimada**: no requiere GPU; el modelo se ejecuta en CPU mediante XNNPACK. El archivo pesa 325,4 MB en fp32, por lo que puede caber en la memoria RAM de cualquier dispositivo con al menos 512 MB libres.
- **GPU recomendadas**: no aplica, el modelo esta disenado para CPU y dispositivos embebidos.
- **Compatibilidad con GPU consumer**: no es necesario; puede ejecutarse en CPU de cualquier tipo.
- **Opciones de despliegue**: ExecuTorch runtime con XNNPACK; el archivo `.pte` se carga directamente. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- **Latencia y rendimiento**: no se proporcionan datos numericos de latencia o throughput en la informacion disponible. La model card indica que el tiempo de compilacion del grafo es de unos dos minutos y que la ejecucion de una LSTM de 128 pasos tarda 16,65 ms en el runtime, pero no hay metricas de la generacion de audio completa.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la informacion proporcionada. Sin embargo, se pueden comparar caracteristicas basicas con otros TTS ligeros de la misma categoria:

| Modelo | Parametros | Contexto | Salida | Licencia | Formato |
|---|---|---|---|---|---|
| Kokoro-82M-ExecuTorch | 81,8M | dinamico | 24 kHz | Apache-2.0 | ExecuTorch (.pte) |
| Piper TTS | 20-50M (por voz) | fijo por voz | 22 kHz | MIT | ONNX |
| Coqui TTS (XTTS) | 600M aprox. | fijo | 24 kHz | CPML (no comercial) | PyTorch |

Kokoro destaca por su licencia permisiva y por estar optimizado para ejecucion en CPU, mientras que alternativas como Piper son mas pequeñas pero con calidad inferior, y XTTS es mas grande y con restricciones comerciales. No hay datos de benchmarks directos entre ellos en la informacion disponible.

## Limitaciones y advertencias

- **Idioma**: el modelo esta orientado al ingles ("English-first"). No se menciona soporte multilingue, por lo que su uso en otros idiomas requeriria adaptaciones externas (por ejemplo, un sistema de G2P distinto).
- **Alucinacion**: no aplica en el sentido de modelos de lenguaje; sin embargo, la calidad de la sintesis depende de la correcta conversion grafema-fonema, que se realiza fuera del modelo. Errores en ese paso produciran una salida de audio incorrecta.
- **Rendimiento**: aunque el archivo es fp32, el backend XNNPACK esta optimizado para CPU, pero la latencia de generacion de audio puede variar segun el dispositivo. No se proporcionan benchmarks de velocidad.
- **Dependencia de herramientas externas**: el proceso completo requiere `misaki` o `espeak-ng` para la conversion de texto a fonemas, lo que añade una dependencia adicional en el despliegue.
- **Voces**: las 54 voces se distribuyen por separado como archivos `.pt` en el repositorio original; el usuario debe descargarlas e integrarlas manualmente.
- **Licencia**: Apache-2.0 permite uso comercial y modificacion, pero debe incluirse el aviso de licencia correspondiente en la distribucion.

## Enlaces

- [Repositorio HuggingFace del modelo ExecuTorch](https://huggingface.co/mlboydaisuke/Kokoro-82M-ExecuTorch)
- [Repositorio HuggingFace del modelo base Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M)
- [Repositorio HuggingFace de Kokoro-82M-CoreAI](https://huggingface.co/mlboydaisuke/Kokoro-82M-CoreAI)
- [GitHub - captivus/Kokoro-82M](https://github.com/captivus/Kokoro-82M)
- [CoreAI Model Zoo - Kokoro-82M](https://github.com/john-rocky/coreai-model-zoo/tree/main/models/kokoro-82m)
- [OpenVox AI - Kokoro-82M](https://openvoxai.com/models/kokoro-82m)
