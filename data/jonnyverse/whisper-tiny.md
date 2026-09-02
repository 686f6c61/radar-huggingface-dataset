# JONNYVERSE/whisper-tiny

## Resumen

JONNYVERSE/whisper-tiny es una conversión a formato ONNX del modelo de reconocimiento de voz automático (ASR) whisper-tiny de OpenAI, preparada específicamente para su uso con la librería Transformers.js. Este modelo permite ejecutar transcripción de audio a texto directamente en el navegador o en entornos Node.js sin necesidad de un servidor dedicado, aprovechando la inferencia local con WebAssembly o WebGPU. Al estar basado en la arquitectura Whisper, hereda su capacidad multilingüe y su robustez frente a diversos acentos y condiciones de audio, aunque en su versión más pequeña (39 millones de parámetros) sacrifica algo de precisión a cambio de una huella mínima y una latencia muy baja.

La relevancia de este modelo radica en su idoneidad para aplicaciones web y móviles donde el procesamiento en el cliente es prioritario, ya sea por privacidad, coste o latencia. Al ser una conversión directa de los pesos oficiales de OpenAI y publicarse bajo licencia Apache 2.0, se puede integrar en proyectos comerciales sin restricciones. El repositorio incluye los pesos ONNX en una subcarpeta `onnx`, siguiendo las recomendaciones de Hugging Face para compatibilidad con Transformers.js.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 39 M (según fuentes externas) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (entrada de audio, no texto) |
| Tipos de cuantizacion | No disponible (pesos en FP32/FP16 según conversión) |
| Idiomas soportados | Multilingüe (hasta 99 idiomas, según modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo original whisper-tiny de OpenAI es un transformer encoder-decoder con 4 capas en cada bloque, 384 dimensiones de modelo y 6 cabezas de atención. Se entrenó con 680 000 horas de datos de audio etiquetados de forma débil, obtenidos de la web, lo que le confiere una buena generalización a dominios y acentos diversos sin necesidad de ajuste fino. La conversión a ONNX no altera los pesos ni la arquitectura; simplemente reexporta los tensores al formato interoperable, manteniendo la misma funcionalidad de ASR y traducción de voz a inglés.

La principal innovación de Whisper es su enfoque de entrenamiento a gran escala con supervisión débil, que le permite aprender representaciones robustas del habla. Para esta versión en concreto, el objetivo es facilitar la ejecución en entornos JavaScript, por lo que la conversión se realizó con la herramienta Optimum de Hugging Face, generando un grafo ONNX optimizado para inferencia eficiente en motores como ONNX Runtime Web.

## Capacidades

- Transcripción de audio a texto en múltiples idiomas (según el modelo base, hasta 99).
- Traducción de voz a inglés (tarea `translate`).
- Reconocimiento de voz en tiempo real con baja latencia, apto para aplicaciones interactivas.
- Inferencia local en navegador mediante WebAssembly/WebGPU, sin necesidad de conexión a servidor.
- Compatible con la API de Transformers.js, lo que facilita la integración en proyectos JavaScript/TypeScript.
- Soporte para entrada de audio en formato de array o URL, con manejo de archivos de audio comunes (WAV, MP3, etc.) mediante decodificación previa.

## Casos de uso

- Transcripción en vivo en aplicaciones web: se puede integrar en un chat o editor para convertir voz a texto mientras el usuario habla, usando la API de streaming de Transformers.js con fragmentos de audio.
- Subtitulado automático de vídeos en el cliente: al ejecutarse en el navegador, permite generar subtítulos sin subir el vídeo a un servidor, reduciendo costes y mejorando la privacidad.
- Asistentes de voz embebidos: en dispositivos con recursos limitados (Raspberry Pi, móviles), el modelo corre en CPU con menos de 1 GB de RAM, habilitando comandos de voz locales.
- Accesibilidad: transcripción de contenido de audio para personas con discapacidad auditiva, en aplicaciones de educación o conferencias.
- Análisis de llamadas y reuniones: transcripción de grabaciones para búsqueda y resumen, ejecutada de forma local para cumplir requisitos de cumplimiento normativo.
- Prototipado rápido de productos de voz: por su tamaño reducido, es ideal para validar conceptos de ASR en entornos de desarrollo sin infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original whisper-tiny reporta un WER (Word Error Rate) de aproximadamente 9.9 % en el conjunto de validación de LibriSpeech (test-clean), pero estos datos no están incluidos en la ficha del repositorio convertido. Se recomienda consultar el paper original de Whisper para más detalles sobre métricas comparativas.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 39 M de parámetros, la inferencia en CPU requiere menos de 1 GB de RAM; en GPU, la VRAM necesaria es mínima (inferior a 500 MB).
- GPU recomendadas: funciona en cualquier GPU moderna, pero no es necesario; la ejecución en CPU es fluida para audio de corta duración.
- Compatibilidad con GPU de consumo: sí, cualquier GPU con soporte CUDA o WebGPU puede acelerar la inferencia.
- Opciones de despliegue: Transformers.js (navegador/Node.js), ONNX Runtime Web, o mediante servidores con ONNX Runtime (Python, C#).
- Latencia y throughput: en CPU de gama media (por ejemplo, un Intel i5), la transcripción de un audio de 5 segundos suele tardar menos de 1 segundo; en WebGPU, se puede lograr tiempo real para fragmentos pequeños.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| JONNYVERSE/whisper-tiny (ONNX) | 39 M | N/A (audio) | Multilingüe | Apache 2.0 | ONNX |
| openai/whisper-tiny | 39 M | N/A | Multilingüe | MIT | PyTorch |
| openai/whisper-base | 74 M | N/A | Multilingüe | MIT | PyTorch |
| openai/whisper-small | 244 M | N/A | Multilingüe | MIT | PyTorch |

La principal diferencia con los modelos originales es el formato de pesos (ONNX frente a PyTorch) y la integración con Transformers.js. En cuanto a rendimiento, whisper-base y whisper-small ofrecen mayor precisión (WER más bajo) a costa de mayor consumo de recursos. Para aplicaciones web con restricciones de tamaño, whisper-tiny es la opción más ligera.

## Limitaciones y advertencias

- Precisión limitada en comparación con modelos más grandes: el WER en condiciones de ruido o acentos fuertes es notablemente mayor que el de whisper-small o whisper-medium.
- No se han especificado los idiomas exactos soportados en la conversión; aunque el modelo base es multilingüe, la calidad varía según el idioma, siendo el inglés el mejor cubierto.
- La conversión a ONNX puede introducir ligeras diferencias numéricas respecto a la versión original, aunque en la práctica son despreciables.
- Al ejecutarse en el navegador, el rendimiento depende del hardware del cliente; en dispositivos muy antiguos puede experimentarse latencia.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribución correspondiente.
- El modelo no incluye soporte para puntuación o mayúsculas automáticas; la salida es en minúsculas y sin puntuación, salvo que se aplique post-procesamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JONNYVERSE/whisper-tiny
- Modelo original: https://huggingface.co/openai/whisper-tiny
- GitHub de Whisper: https://github.com/openai/whisper
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Herramienta Optimum para conversión: https://huggingface.co/docs/optimum/index
