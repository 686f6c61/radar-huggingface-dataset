# colaice/f5-tts-onnx

## Resumen

F5-TTS-ONNX es una conversión del modelo de síntesis de voz F5-TTS al formato ONNX (Open Neural Network Exchange), publicada por el usuario colaice en Hugging Face. El modelo original, F5-TTS, fue desarrollado por el equipo SWivid y es un sistema de text-to-speech basado en flow matching que genera voz fluida y natural a partir de texto. Esta conversión a ONNX permite ejecutar el modelo con ONNX Runtime, lo que facilita su despliegue en entornos de producción sin depender de PyTorch.

El repositorio contiene los archivos del modelo divididos en varios componentes ONNX (preprocesamiento, transformer principal, decodificador y metadatos) junto con el vocabulario necesario. El modelo está diseñado para el idioma chino (zh) y se distribuye bajo licencia Apache 2.0, aunque los pesos originales provienen de F5-TTS, que utiliza una licencia CC-BY-NC 4.0. Esta distinción de licencias es importante para evaluar su uso comercial. El tamaño total del repositorio es de 1.4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching con transformer (basada en F5-TTS) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh (chino) |
| Licencia | Apache 2.0 (modelo ONNX); CC-BY-NC 4.0 (pesos originales) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

F5-TTS es un modelo de síntesis de voz basado en flow matching, una técnica que modela la transformación gradual de ruido en voz condicionada por el texto. La arquitectura se compone de un transformer que procesa la secuencia de texto junto con la entrada de voz, y un decodificador que genera el audio final. El modelo original se entrenó con la tarea de text-guided speech-infilling, donde el texto se convierte en secuencias de caracteres y se rellena con tokens de relleno para igualar la longitud de la voz de entrada. El texto se procesa mediante bloques ConvNeXt antes de concatenarse con la voz.

El modelo presentado en este repositorio es una conversión a ONNX de los pesos preentrenados originales, dividida en cuatro archivos: preprocesamiento, transformer principal, decodificador y metadatos. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens ni los procesos de alineación utilizados en la conversión. La inferencia se realiza mediante ONNX Runtime, y el código de referencia está disponible en el repositorio DakeQQ/F5-TTS-ONNX.

## Capacidades

- Síntesis de voz en chino (zh) a partir de texto.
- Generación de audio natural y fluido mediante técnicas de flow matching.
- Capacidad de clonación de voz (voice cloning) si se proporciona una muestra de referencia, segun las capacidades del modelo original F5-TTS.
- Compatibilidad con ejecución mediante ONNX Runtime, lo que permite integración en entornos de producción sin depender de la librería PyTorch.
- Posibilidad de ajuste de la velocidad de habla y de la estabilidad de la voz mediante parametros de inferencia (si se usan los scripts de referencia).
- No incluye soporte de tool calling, agentes ni razonamiento multimodal.

## Casos de uso

- **Síntesis de voz para asistentes virtuales en chino**: el modelo puede integrarse en un servicio de asistente por voz para generar respuestas habladas naturales en tiempo real, gracias a la inferencia eficiente con ONNX Runtime.
- **Generación de audiolibros**: se puede utilizar para convertir libros digitales en chino en audiolibros, procesando texto largo por segmentos y generando voz de calidad.
- **Doblaje de contenidos multimedia**: permite generar voces en chino para doblaje de vídeos, series o anuncios, a partir de guiones de texto.
- **Sistemas de accesibilidad**: puede integrarse en herramientas de lectura para personas con discapacidad visual, convirtiendo el texto de pantalla en voz.
- **Aplicaciones de aprendizaje de idiomas**: para generar ejemplos de pronunciación en chino, permitiendo a los estudiantes escuchar la pronunciación de palabras y frases.
- **Generación de contenido personalizado**: para crear mensajes de voz personalizados, como saludos o notificaciones en aplicaciones móviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero al ser un modelo ONNX de 1.4 GB, se estima que puede ejecutarse en GPUs con al menos 4 GB de VRAM en precision FP32.
- GPUs recomendadas: NVIDIA GTX 1080 Ti, RTX 2060 o superiores, o cualquier GPU compatible con CUDA.
- Si cabe en consumer GPU: si, en la mayoria de GPUs modernas de consumo.
- Opciones de despliegue: ONNX Runtime, con soporte para CPU y GPU. Tambien puede ejecutarse en entornos con Python y ONNX Runtime, o mediante servidores de inferencia como ONNX Runtime Server.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Formato | Licencia | Tamaño | Contexto |
|---|---|---|---|---|---|
| F5-TTS (original) | Multi (incluye zh, en) | PyTorch | CC-BY-NC 4.0 | ~1.4 GB | no disponible |
| F5-TTS-ONNX (colaice) | zh | ONNX | Apache 2.0 (modelo) / CC-BY-NC (pesos) | 1.4 GB | no disponible |
| F5-TTS-ONNX (DakeQQ) | Multi | ONNX | Apache 2.0 (modelo) / CC-BY-NC (pesos) | no disponible | no disponible |
| Coqui XTTS | Multi | PyTorch | CPML | ~1.8 GB | no disponible |

## Limitaciones y advertencias

- Licencia de pesos originales: los pesos del modelo original F5-TTS se distribuyen bajo CC-BY-NC 4.0, que limita el uso comercial. Aunque la conversión ONNX se publica bajo Apache 2.0, la licencia de los pesos originales restringe su uso comercial. Se recomienda revisar la licencia antes de usar en produccion.
- Idioma: el modelo está entrenado principalmente para chino; su rendimiento en otros idiomas no esta garantizado.
- Sesgos y alucinaciones: no se dispone de informacion sobre sesgos especificos. Como modelo de TTS, puede generar voz con errores de pronunciacion o entonacion en textos complejos.
- Limitaciones de contexto: no se especifica una longitud de contexto maxima, pero al ser un sistema de TTS, el texto de entrada debe dividirse en segmentos adecuados.
- Restricciones de uso: el uso comercial esta limitado por la licencia CC-BY-NC de los pesos originales.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/colaice/f5-tts-onnx
- Repositorio de inferencia ONNX (DakeQQ): https://github.com/DakeQQ/F5-TTS-ONNX
- Repositorio original de F5-TTS: https://github.com/SWivid/F5-TTS
- Paper de F5-TTS: https://arxiv.org/html/2410.06885v2
- Repo ONNX alternativo en Hugging Face: https://huggingface.co/huggingfacess/F5-TTS-ONNX
