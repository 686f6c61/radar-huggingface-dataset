# onnx-community/wav2vec2-large-xlsr-53-portuguese-ONNX

## Resumen

El modelo `onnx-community/wav2vec2-large-xlsr-53-portuguese-ONNX` es una conversión automática a formato ONNX del modelo `jonatasgrosman/wav2vec2-large-xlsr-53-portuguese`, un sistema de reconocimiento automático de voz (ASR) para portugués basado en la arquitectura Wav2Vec2 de Facebook AI. El modelo original fue ajustado por Jonatas Grosman sobre el checkpoint pre-entrenado `facebook/wav2vec2-large-xlsr-53` (XLSR-53 large), utilizando las particiones de entrenamiento y validación de Common Voice 6.1 en portugués.

La conversión a ONNX, realizada por la comunidad `onnx-community` mediante un espacio de Hugging Face, permite ejecutar el modelo en navegadores web y en Node.js a través de la librería `transformers.js`, así como en cualquier runtime compatible con ONNX. Esto amplía el despliegue del modelo a entornos sin backend Python, con un tamaño de repositorio de 2,3 GB y licencia Apache 2.0, lo que facilita su uso comercial. El modelo requiere audio muestreado a 16 kHz y es relevante para quienes necesitan transcripción de voz en portugués en aplicaciones web, edge o embebidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (XLSR-53 large, transformer) |
| Parametros totales | aproximadamente 317 millones (variante large) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio, no texto; el audio se procesa por tramos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | portugues (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (modelo completo, 2,3 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Wav2Vec2, un transformer que aprende representaciones de audio de forma autosupervisada. La variante XLSR-53 fue pre-entrenada sobre 53 idiomas mediante un objetivo contrastivo con cuantización, y el modelo large contiene aproximadamente 317 millones de parámetros. El checkpoint base (`facebook/wav2vec2-large-xlsr-53`) fue ajustado por Jonatas Grosman sobre Common Voice 6.1 en portugués, usando las particiones de entrenamiento y validación. El proceso de ajuste se realizó con créditos GPU de OVHcloud y el script de entrenamiento está disponible en el repositorio `wav2vec2-sprint`.

La conversión a ONNX fue generada automáticamente con el espacio de Hugging Face `onnx-community/convert-to-onnx`, sin modificaciones de pesos. El modelo resultante se distribuye en formato ONNX, compatible con el runtime de ONNX y con `transformers.js` para su uso en JavaScript.

## Capacidades

- Reconocimiento de voz en portugués: transcripción de audio a texto con CTC (Connectionist Temporal Classification).
- Soporte de entrada de audio a 16 kHz (requisito imprescindible).
- Uso directo sin modelo de lenguaje (WER 11,31 % en Common Voice test).
- Mejora de precisión con modelo de lenguaje externo (WER 9,01 % en Common Voice test con LM).
- Ejecución en navegador y Node.js mediante `transformers.js` y ONNX Runtime.
- Compatibilidad con cualquier runtime ONNX (CPU, GPU, edge devices).

## Casos de uso

- **Transcripción de reuniones en portugués**: el modelo puede transcribir grabaciones de reuniones en tiempo real o diferido, generando actas textuales con timestamps. Su formato ONNX permite ejecutarlo en un servidor Node.js sin dependencias de Python.
- **Subtitulado automático de vídeo**: integrado en un pipeline de edición de vídeo, el modelo genera subtítulos en portugués para contenido audiovisual. La opción de añadir un modelo de lenguaje mejora la calidad en habla espontánea.
- **Asistente de voz en el navegador**: mediante `transformers.js`, el modelo se ejecuta localmente en la web del usuario, sin enviar audio a un servidor, lo que reduce latencia y mejora la privacidad en aplicaciones de dictado o comandos de voz.
- **Análisis de llamadas en centros de contacto**: el modelo transcribe llamadas de atención al cliente en portugués para su posterior análisis de sentimiento o extracción de entidades, con el formato ONNX facilitando su despliegue en servidores de baja gama.
- **Generación de subtítulos en tiempo real para eventos**: en conferencias o emisiones en vivo, el modelo puede transcribir el discurso de los ponentes con una latencia baja, gracias a su ejecución en ONNX Runtime con CPU.
- **Accesibilidad para personas sordas**: la transcripción automática de audio en portugués permite generar subtítulos en tiempo real para personas con discapacidad auditiva, con el modelo ejecutándose en dispositivos edge como Raspberry Pi o teléfonos móviles.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor del modelo original (Jonatas Grosman) son los siguientes:

| Dataset | Metrica | Valor |
|---|---|---|
| Common Voice pt (test) | WER | 11,31 % |
| Common Voice pt (test) | CER | 3,74 % |
| Common Voice pt (test) | WER (+ LM) | 9,01 % |
| Common Voice pt (test) | CER (+ LM) | 3,21 % |
| Robust Speech Event - Dev Data | WER | 42,1 % |
| Robust Speech Event - Dev Data | CER | 17,93 % |
| Robust Speech Event - Dev Data | WER (+ LM) | 36,92 % |
| Robust Speech Event - Dev Data | CER (+ LM) | 16,88 % |

Estos datos corresponden al modelo original en PyTorch; la conversión ONNX no introduce cambios en los pesos, por lo que se esperan resultados equivalentes en la práctica.

## Requisitos de hardware

- **Tamaño del modelo**: 2,3 GB en formato ONNX (pesos en FP32 probablemente).
- **VRAM estimada**: no disponible en la informacion proporcionada. Para un modelo de ~317M parámetros en FP32, se estiman unos 1,3 GB de VRAM, pero no se ha publicado una cifra oficial.
- **GPU recomendada**: no disponible. Puede ejecutarse en CPU con ONNX Runtime, y en GPU con CUDA o WebGPU.
- **Compatibilidad con consumer GPU**: sí, modelos de ~317M parámetros caben en GPUs de gama media (p. ej., RTX 3060 con 12 GB) sin problemas.
- **Opciones de despliegue**: ONNX Runtime (Python, C++, C#), `transformers.js` (navegador y Node.js), WebGPU, TensorFlow.js (vía ONNX), o cualquier runtime ONNX.
- **Latencia y throughput**: no disponibles. Dependen del hardware, del tamaño de los tramos de audio y de si se usa modelo de lenguaje externo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Idioma | WER (Common Voice test) | Licencia | Formato |
|---|---|---|---|---|---|---|
| `onnx-community/wav2vec2-large-xlsr-53-portuguese-ONNX` | Wav2Vec2 XLSR-53 large | ~317M | pt | 11,31 % | Apache 2.0 | ONNX |
| `jonatasgrosman/wav2vec2-large-xlsr-53-portuguese` | Wav2Vec2 XLSR-53 large | ~317M | pt | 11,31 % | Apache 2.0 | PyTorch |
| `onnx-community/wav2vec2-large-xlsr-english-ONNX` | Wav2Vec2 XLSR-53 large | ~317M | en | no disponible | Apache 2.0 | ONNX |

La conversión ONNX no cambia el rendimiento respecto al original en PyTorch, pero añade portabilidad a entornos JavaScript y ONNX Runtime. La versión inglesa tiene la misma arquitectura y proceso de conversión, pero está ajustada para inglés.

## Limitaciones y advertencias

- **Idioma**: el modelo solo reconoce portugués (pt); no funciona con otros idiomas, aunque la arquitectura base XLSR-53 fue pre-entrenada multilingüe.
- **Calidad en habla espontánea**: el WER aumenta notablemente en datos ruidosos o no controlados (Dev. WER 42,1 % en Robust Speech Event frente a 11,31 % en Common Voice). No es adecuado para audio con fondo de ruido intenso sin preprocesado.
- **Muestreo obligatorio**: el audio debe estar muestreado a 16 kHz; cualquier otra frecuencia de muestreo degrada el rendimiento.
- **Sin modelo de lenguaje integrado**: para obtener el mejor rendimiento es necesario añadir un LM externo (p. ej., KenLM), lo que añade complejidad al despliegue.
- **Sin datos de cuantización**: no se especifica si los pesos ONNX están cuantizados; el tamaño del repositorio (2,3 GB) sugiere FP32, lo que puede limitar el despliegue en dispositivos con poca memoria.
- **Alucinaciones**: como todo modelo ASR, puede producir errores de transcripción, especialmente en palabras poco frecuentes o acentos regionales.
- **Licencia**: Apache 2.0, permite uso comercial sin restricciones, pero se debe incluir el aviso de licencia y atribución.
- **Modelo base**: el ajuste se realizó con Common Voice 6.1, que puede no representar todos los dialectos del portugués (europeo vs. brasileño).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/onnx-community/wav2vec2-large-xlsr-53-portuguese-ONNX)
- [Modelo original en PyTorch](https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-portuguese)
- [Espacio de conversión ONNX](https://huggingface.co/spaces/onnx-community/convert-to-onnx)
- [Repositorio de entrenamiento (wav2vec2-sprint)](https://github.com/jonatasgrosman/wav2vec2-sprint)
- [Librería HuggingSound](https://github.com/jonatasgrosman/huggingsound)
- [Documentación de pipelines de transformers.js](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.AutomaticSpeechRecognitionPipeline)
