# ChatPanel/whisper-base

## Resumen

`ChatPanel/whisper-base` es una réplica sin modificaciones del modelo `onnx-community/whisper-base`, alojada por ChatPanel para que su pasarela (gateway) descargue desde un único origen los modelos que ejecuta. No se ha reentrenado, convertido ni editado ningún fichero: los pesos son idénticos byte a byte a los del repositorio upstream, en el commit `27a07b4b52b3a4c5886134bb4320e93e1a4bbc7c`. El crédito del modelo corresponde a sus autores originales, OpenAI, y a los mantenedores de la conversión ONNX.

Se trata de Whisper en su variante `base`, un modelo de reconocimiento automático del habla (ASR) de tipo encoder-decoder transformer, distribuido en formato ONNX cuantizado para inferencia eficiente en CPU y entornos con recursos limitados. El repositorio ocupa aproximadamente 0,1 GB y conserva la licencia Apache 2.0 del upstream.

Su relevancia es operativa más que técnica: sirve como espejo estable para despliegues que necesitan una fuente única de descarga, con ficheros verificables mediante SHA-256. No aporta mejoras de rendimiento ni cambios en el modelo respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 74 millones (variante base de Whisper, dato del modelo original) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 segundos en Whisper) |
| Tipos de cuantizacion | ONNX cuantizado (ficheros `*_quantized.onnx`); nivel exacto no disponible |
| Idiomas soportados | no disponible en la ficha (Whisper original es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder y decoder fusionado, cuantizados) |

## Arquitectura y entrenamiento

Whisper es un transformer de tipo encoder-decoder que procesa espectrogramas mel de audio de 30 segundos y genera tokens de texto de forma autorregresiva. El encoder transforma el espectrograma en representaciones latentes y el decoder produce la transcripción condicionada a esas representaciones y a tokens de control de idioma y tarea. La variante `base` emplea 74 millones de parámetros, con 6 capas en encoder y decoder y un ancho de modelo de 512.

Este repositorio concreto no incluye entrenamiento propio: es una copia de la conversión ONNX de `onnx-community`, que a su vez deriva de `openai/whisper-base`. Los pesos están cuantizados para reducir el tamaño y acelerar la inferencia en CPU, con un decoder fusionado (`decoder_model_merged_quantized.onnx`) que combina los pasos con y sin caché. No hay información sobre el dataset de entrenamiento original en la documentación proporcionada más allá de la referencia al modelo de OpenAI.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto).
- Traducción de voz a texto en el modelo multilingüe original (no confirmado en esta ficha).
- Detección de idioma mediante tokens de control (capacidad heredada de Whisper).
- Ejecución en ONNX Runtime, incluyendo CPU.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No soporta visión ni audio más allá de la entrada de voz para transcripción.
- No dispone de modo de pensamiento (thinking mode).

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo convierte audio de hasta 30 segundos por ventana en texto, adecuado para aplicaciones de dictado y actas con procesamiento por segmentos.
- Subtitulado automático de vídeo: integrado en pipelines de postproducción para generar subtítulos en bruto que luego se revisan manualmente.
- Búsqueda sobre archivos de audio: transcripción previa de grabaciones para indexar y permitir búsqueda por texto en podcasts o llamadas.
- Asistentes de voz en local: al ejecutarse en ONNX Runtime sobre CPU, permite desplegar transcripción en dispositivos sin GPU dedicada.
- Moderación y análisis de contenido hablado: transcripción de audio subido por usuarios para aplicar filtros de texto posteriormente.
- Accesibilidad: generación de transcripciones en tiempo casi real para personas con discapacidad auditiva en entornos con hardware modesto.
- Prototipado rápido de aplicaciones ASR: el tamaño reducido (0,1 GB) y el formato ONNX facilitan pruebas en portátiles y contenedores ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo cuantizado en ONNX está pensado para CPU. En GPU, el consumo sería inferior a 1 GB.
- GPU recomendadas: no necesarias; cualquier GPU con soporte ONNX Runtime (CUDA o DirectML) puede acelerar la inferencia.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 1 GB de memoria libre.
- Opciones de despliegue: ONNX Runtime (Python, C++, JavaScript), Transformers.js, y servidores compatibles con ONNX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChatPanel/whisper-base | 74 M | 30 s por ventana | ONNX cuantizado | Apache 2.0 | Hugging Face |
| openai/whisper-base | 74 M | 30 s por ventana | PyTorch (safetensors/bin) | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M | 30 s por ventana | PyTorch | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | 39 M | 30 s por ventana | PyTorch | Apache 2.0 | Hugging Face |

La diferencia principal frente a `openai/whisper-base` es el formato: este repositorio ofrece ONNX cuantizado listo para inferencia sin conversión, mientras que el original requiere exportación. Frente a `whisper-small` y `whisper-tiny`, se sitúa en un punto intermedio de precisión y coste computacional.

## Limitaciones y advertencias

- Es una copia sin modificaciones: cualquier limitación de `openai/whisper-base` se hereda íntegramente.
- Riesgo de errores en audio con ruido, acentos marcados, solapamiento de hablantes o vocabulario técnico.
- Puede alucinar texto en segmentos silenciosos o con música, un comportamiento documentado en Whisper.
- La ventana de audio es de 30 segundos; audios más largos requieren segmentación y pueden perder coherencia entre fragmentos.
- La cuantización ONNX puede degradar ligeramente la precisión respecto a los pesos originales en fp32.
- La ficha no especifica los idiomas cubiertos; conviene verificar el comportamiento multilingüe antes de usarlo en producción.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda conservar la atribución a OpenAI y a los mantenedores de la conversión ONNX.
- El repositorio tiene 0 descargas y 0 likes; no hay evidencia de uso en producción ni mantenimiento activo por parte de ChatPanel.

## Enlaces

- [Hugging Face: ChatPanel/whisper-base](https://huggingface.co/ChatPanel/whisper-base)
- [Upstream ONNX: onnx-community/whisper-base](https://huggingface.co/onnx-community/whisper-base)
- [Modelo original: openai/whisper-base](https://huggingface.co/openai/whisper-base)
- [Repositorio de OpenAI Whisper](https://github.com/openai/whisper)
- [Paper de Whisper (Radford et al., 2022)](https://arxiv.org/abs/2212.04356)
