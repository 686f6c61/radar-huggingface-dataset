# jordyantunes/sbv2-speak-voices

## Resumen

El repositorio `jordyantunes/sbv2-speak-voices` contiene exportaciones en formato ONNX de voces japonesas de texto a voz (TTS) basadas en Style-Bert-VITS2. El objetivo es permitir la ejecución de estas voces en entornos donde no se dispone de un backend de Python, como navegadores web o aplicaciones de escritorio basadas en Electron, utilizando el runtime de ONNX (`onnxruntime-web`). Cada voz se distribuye como un archivo `model.onnx` y un vector de estilos `style_vectors.npy`. El repositorio no incluye un modelo entrenado desde cero, sino re-exportaciones de voces sintéticas procedentes de `itoolsjp/Style-Bert-VITS2-Voice-Assets`, todas ellas generadas por IA y no basadas en voces de personas reales. La licencia es `other` con términos específicos que permiten uso personal, comercial y de contenido para adultos, pero prohíben la venta del modelo, la suplantación de identidad y la propaganda política o religiosa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Style-Bert-VITS2 (basado en VITS2 con características BERT japonesas) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (TTS no requiere contexto extenso de texto) |
| Tipos de cuantización | no disponible (exportación ONNX sin cuantización explícita) |
| Idiomas soportados | japonés (ja) |
| Licencia | other (términos específicos del repositorio fuente) |
| Formato de pesos | ONNX (model.onnx) y numpy (style_vectors.npy) |

## Arquitectura y entrenamiento

Style-Bert-VITS2 es un sistema de síntesis de voz basado en VITS2, que incorpora un modelo BERT japonés (`ku-nlp/deberta-v2-large-japanese-char-wwm`) para mejorar la prosodia y naturalidad del habla. La arquitectura combina un encoder de texto, un decoder de flujo normalizado y un vocoder, todo ello entrenado de forma conjunta. Este repositorio no contiene el proceso de entrenamiento original; en su lugar, se realizaron exportaciones de los pesos ya entrenados de las voces sintéticas al formato ONNX mediante `torch.onnx.export` y `onnxsim`. No se ha realizado ningún reentrenamiento ni modificación de los contenidos de las voces. El preprocesamiento de texto para la inferencia requiere convertir el texto en secuencias de IDs de fonemas, tonos, una secuencia de idioma y características BERT, según el procedimiento estándar de Style-Bert-VITS2.

## Capacidades

- Generación de audio de voz en japonés a partir de texto.
- Soporte de múltiples estilos de voz mediante el archivo `style_vectors.npy` (el índice 0 corresponde al estilo "Neutral").
- Ejecución completamente en el lado del cliente (navegador o Electron) gracias a `onnxruntime-web`, sin necesidad de servidor o Python.
- Compatible con cualquier entorno que disponga de un runtime de ONNX (por ejemplo, aplicaciones de escritorio, móviles o embebidas).
- No incluye capacidades de razonamiento, código, matemáticas o visión, ya que es un modelo de síntesis de voz.

## Casos de uso

- Aplicaciones web con TTS japonés sin servidor: la voz se procesa directamente en el navegador del usuario, lo que reduce la latencia y los costes de infraestructura. Es adecuado para prototipos o productos que necesitan una experiencia de voz instantánea.
- Asistentes de voz integrados en aplicaciones de escritorio (Electron): al ser ONNX, se puede cargar en procesos de Electron sin depender de un backend externo.
- Narración automática para contenido audiovisual (vídeos, presentaciones) en japonés, con la posibilidad de seleccionar diferentes estilos de voz.
- Herramientas de accesibilidad: convertir texto en voz para personas con discapacidad visual dentro de aplicaciones web.
- Aprendizaje de idiomas: generar ejemplos de pronunciación japonesa para ejercicios de listening, con control de estilo y velocidad.
- Integración en chatbots o asistentes virtuales que requieren respuestas habladas en japonés, funcionando completamente en el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño de cada modelo ONNX no se especifica, pero el repositorio completo ocupa 1.5 GB. Se puede inferir que cada voz puede ocupar varios cientos de megabytes, aunque no hay datos exactos.
- Al ser ONNX, puede ejecutarse en CPU, GPU o en el navegador (WebGL/WebGPU). No se proporcionan cifras de VRAM ni de latencia.
- Es viable en dispositivos de gama media (móviles, portátiles) si se usa el runtime de ONNX adecuado, pero no hay garantías de rendimiento.
- Opciones de despliegue: cualquier entorno con ONNX Runtime (Python, C++, Java, JavaScript) o `onnxruntime-web` en el navegador. No se mencionan herramientas específicas como vLLM, llama.cpp u Ollama porque no son aplicables a TTS.

## Comparativa con modelos similares

No disponible. La información no incluye comparaciones con otros modelos de TTS japoneses, ni se dispone de datos de rendimiento o benchmarks para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Solo soporta el idioma japonés; no hay voces en otros idiomas.
- El preprocesamiento de texto es complejo y requiere la integración del modelo BERT japonés, lo que puede aumentar la carga de desarrollo.
- La licencia `other` impide vender el modelo en sí, suplantar a personas reales, usar en difamación o en propaganda política/religiosa. Antes de un uso comercial, se deben revisar los términos completos del repositorio fuente.
- No se proporcionan métricas de calidad de voz (MOS, etc.), por lo que no se puede garantizar un nivel de naturalidad.
- El repositorio tiene cero descargas y cero likes; es un proyecto reciente y sin validación de la comunidad.
- Al ser una exportación ONNX, puede haber diferencias sutiles con el modelo PyTorch original (por ejemplo, en la precisión numérica), aunque el autor indica que se corrigió un bug de `onnxsim` que corrompía el audio.

## Enlaces

- Repositorio de Hugging Face: [jordyantunes/sbv2-speak-voices](https://huggingface.co/jordyantunes/sbv2-speak-voices)
- Proyecto Style-Bert-VITS2 (referencia de implementación): [https://github.com/litagin02/Style-Bert-VITS2](https://github.com/litagin02/Style-Bert-VITS2)
- Fuente de las voces originales: [itoolsjp/Style-Bert-VITS2-Voice-Assets](https://huggingface.co/itoolsjp/Style-Bert-VITS2-Voice-Assets)
- ONNX Runtime (para integración): [https://github.com/microsoft/onnxruntime](https://github.com/microsoft/onnxruntime)
