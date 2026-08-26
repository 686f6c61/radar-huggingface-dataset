# ALLUCY-Rodent/whisper-medium-ko

## Resumen

El modelo **ALLUCY-Rodent/whisper-medium-ko** es una exportación a formato ONNX con cuantización dinámica int8 (q8) del modelo `seastar105/whisper-medium-komixv2`, un Whisper Medium afinado para el reconocimiento automático de voz (ASR) en coreano. Fue creado por el autor ALLUCY-Rodent como modelo base de transcripción para la aplicación web meeting-ai-pwa, un servicio de transcripción de reuniones.

La relevancia de este modelo radica en su formato optimizado: al estar cuantizado en q8 y exportado a ONNX, puede ejecutarse en CPU, en navegador mediante transformers.js y en entornos de inferencia ligeros, sin necesidad de GPU dedicada. Su tamaño de repositorio es de 1,2 GB, repartido entre el encoder (~314 MB) y el decoder fusionado (~873 MB), ambos cuantizados.

El modelo está diseñado exclusivamente para el idioma coreano, tiene licencia Apache 2.0 y se distribuye bajo la etiqueta de pipeline `automatic-speech-recognition`. Es una opción práctica para equipos que necesitan ASR coreano en producción con despliegue ligero, especialmente en entornos web o de bajo consumo de recursos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder), exportado a ONNX |
| Parametros totales | no disponible (el modelo base es Whisper Medium de OpenAI, pero la ficha no lo indica) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (q8) dinámica |
| Idiomas soportados | ko (coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder_model_quantized.onnx, decoder_model_merged_quantized.onnx) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper Medium de OpenAI, un transformer encoder-decoder entrenado para tareas de reconocimiento de voz y traducción. En este caso, la variante `seastar105/whisper-medium-komixv2` es un ajuste fino orientado al coreano, aunque no se dispone de información detallada sobre el dataset o el proceso de entrenamiento del modelo base.

La innovación técnica de este modelo es la conversión a ONNX mediante `optimum 1.27` y `onnxruntime 1.29`, seguida de una cuantización dinámica a int8 (q8) tanto del encoder como del decoder fusionado. Este proceso reduce el tamaño del modelo y permite su ejecución en entornos con recursos limitados, como navegadores web o servidores sin GPU. No se ha documentado el uso de RLHF, DPO ni técnicas de alineación adicionales.

## Capacidades

- Reconocimiento automático de voz (ASR) en coreano, con transcripción de audio a texto.
- Soporte para entrada de audio de longitud variable, dentro de los límites del modelo Whisper.
- Ejecución en navegador mediante `@huggingface/transformers` (transformers.js), con carga de pesos cuantizados en q8.
- Compatibilidad con el pipeline `automatic-speech-recognition` de Hugging Face.
- Integración directa en aplicaciones web progresivas (PWA) gracias al formato ONNX y la cuantización.
- Inferencia en CPU sin necesidad de GPU, lo que facilita su despliegue en infraestructura básica.

## Casos de uso

- Transcripción de reuniones en coreano: el modelo se diseñó para la aplicación meeting-ai-pwa, que transcribe conversaciones de reuniones en tiempo real. Su cuantización permite ejecutarlo en el navegador del usuario, preservando la privacidad al no enviar audio a un servidor.
- Subtitulado automático de vídeos coreanos: se puede integrar en pipelines de generación de subtítulos para contenido en coreano, procesando pistas de audio y generando texto sincronizado.
- Transcripción de entrevistas y podcasts: los investigadores y periodistas pueden usar el modelo para convertir grabaciones de entrevistas en coreano en texto editable, ejecutándolo en un ordenador con CPU convencional.
- Asistentes de voz y comandos de voz: al ser ligero y portable, puede integrarse en aplicaciones de escritorio o móviles para reconocer comandos de voz en coreano, con latencia razonable.
- Archivado de contenido audiovisual: organizaciones pueden transcribir automáticamente archivos de audio históricos en coreano para crear índices buscables, aprovechando la licencia Apache 2.0 para uso comercial.
- Prototipado rápido de ASR en coreano: desarrolladores que necesitan probar un sistema de transcripción en coreano pueden desplegar este modelo con transformers.js en un entorno de desarrollo sin configurar un backend de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una validación A/B realizada el 2026-08-26 con datos de AI Hub (tres frases cortas y una frase larga de 38,8 segundos), en la que el modelo medium superó a la versión small en un 11,2 % en precisión, pero no se proporcionan valores absolutos de WER o CER.

Como referencia de la categoría, el modelo `whisper-medium-ko-zeroth` (otro Whisper Medium afinado para coreano) logra un WER de 3,64 % y un CER de 1,38 % en el dataset Zeroth, aunque no es el modelo evaluado en esta ficha.

## Requisitos de hardware

- Al ser un modelo ONNX cuantizado en int8, puede ejecutarse en CPU con un consumo de memoria aproximado al tamaño del repositorio (1,2 GB en disco, más overhead de runtime).
- No se han publicado datos exactos de VRAM, pero la cuantización q8 y el formato ONNX permiten inferencia en GPU con menos de 2 GB de VRAM, y en CPU con 2-4 GB de RAM.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 2060, GTX 1660, o incluso iGPU), aunque no es obligatoria.
- Opciones de despliegue: `@huggingface/transformers` (transformers.js) para navegador y Node.js, ONNX Runtime para Python y C++, y servidores de inferencia ligeros.
- En CPU, la latencia dependerá del hardware; para audio corto (menos de 30 segundos) puede ser de varios segundos, mientras que en GPU puede ser casi en tiempo real. No se han publicado datos de throughput.

## Comparativa con modelos similares

| Modelo | Formato | Cuantización | Idiomas | Licencia | Tamaño repo | Notas |
|---|---|---|---|---|---|---|
| **ALLUCY-Rodent/whisper-medium-ko** | ONNX | int8 (q8) | coreano | Apache 2.0 | 1,2 GB | Exportado y cuantizado para despliegue ligero |
| `ALLUCY-Rodent/whisper-small-ko` | ONNX | q8 | coreano | Apache 2.0 | no disponible | Misma metodología, menor tamaño y precisión |
| `openai/whisper-medium` | safetensors | fp32/fp16 | multilingüe (99 idiomas) | MIT | no disponible | Modelo original, sin cuantización, requiere más recursos |
| `whisper-medium-ko-zeroth` | PyTorch | no cuantizado | coreano | no disponible | no disponible | Ajustado a dataset Zeroth, WER 3,64 % |

La comparativa muestra que este modelo es una opción ligera y de fácil despliegue, pero sacrifica precisión y multilingüismo frente al modelo original de OpenAI.

## Limitaciones y advertencias

- Está diseñado exclusivamente para coreano; no soporta otros idiomas.
- La cuantización int8 puede provocar una ligera pérdida de precisión respecto al modelo en FP16/FP32, aunque no se han publicado datos comparativos.
- El modelo puede sufrir alucinaciones típicas de Whisper en audio con silencios prolongados o ruido, generando texto que no está en el audio.
- No se ha documentado el dataset de entrenamiento del modelo base `seastar105/whisper-medium-komixv2`, por lo que se desconocen posibles sesgos en el dominio.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base de OpenAI tiene una licencia MIT, por lo que no hay restricciones adicionales conocidas.
- No se ha evaluado el rendimiento en entornos de producción con datos de referencia estándar (LibriSpeech, Common Voice, etc.) para este modelo específico.

## Enlaces

- [Modelo en Hugging Face: ALLUCY-Rodent/whisper-medium-ko](https://huggingface.co/ALLUCY-Rodent/whisper-medium-ko)
- [Modelo base: seastar105/whisper-medium-komixv2](https://huggingface.co/seastar105/whisper-medium-komixv2) (referencia, no confirmado en la búsqueda)
- [Aplicación meeting-ai-pwa](https://meeting-ai-pwa.pages.dev)
- [Modelo relacionado: ALLUCY-Rodent/whisper-small-ko](https://huggingface.co/ALLUCY-Rodent/whisper-small-ko)
- [Modelo original: openai/whisper-medium](https://huggingface.co/openai/whisper-medium)
- [Repositorio de OpenAI Whisper en GitHub](https://github.com/openai/whisper)
- [Referencia de rendimiento: whisper-medium-ko-zeroth](https://www.promptlayer.com/models/whisper-medium-ko-zeroth/)
