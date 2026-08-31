# aneforge/whisper-tiny.en

## Resumen

El modelo `aneforge/whisper-tiny.en` es una copia byte-idéntica de `openai/whisper-tiny.en`, el checkpoint de reconocimiento automático de voz (ASR) de OpenAI especializado exclusivamente en inglés. La única diferencia respecto al original es que este repositorio está etiquetado para su uso directo con **ANEForge**, una librería que compila el grafo del modelo en un único programa para ejecutarse en el Apple Neural Engine (ANE) sin necesidad de CoreML. Esto permite cargar los pesos directamente desde Hugging Face y transcribir audio en dispositivos Apple con aceleración por hardware.

El modelo base es un Transformer encoder-decoder de 37,76 millones de parámetros, entrenado con 680 000 horas de habla etiquetada mediante supervisión débil a gran escala. Su tamaño reducido lo hace adecuado para despliegues en entornos con recursos limitados, como dispositivos móviles o edge, manteniendo una precisión razonable para transcripción en inglés. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37 760 256 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (ventana de audio de 30 segundos en el diseño original) |
| Tipos de cuantizacion | no disponible (pesos originales en fp32; se puede cuantizar con herramientas externas) |
| Idiomas soportados | ingles (solo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper de OpenAI: un encoder de audio basado en Transformer que procesa espectrogramas Mel de ventanas de 30 segundos, y un decoder autoregresivo que genera la transcripción. El entrenamiento se realizó con 680 000 horas de audio etiquetado, combinando datos de múltiples dominios y condiciones acústicas, mediante un enfoque de supervisión débil a gran escala. No se aplicaron técnicas de RLHF ni DPO; el modelo es puramente de reconocimiento de voz.

Este repositorio no introduce ninguna modificación técnica sobre el original. La única innovación es la integración con ANEForge, que compila el grafo del modelo en un programa ANE y transmite los pesos desde Hugging Face mediante `huggingface_hub`, permitiendo inferencia acelerada en el Neural Engine de Apple sin pasar por CoreML.

## Capacidades

- Transcripcion de audio en ingles a texto, con manejo de puntuacion y mayusculas basicas.
- Reconocimiento robusto en condiciones de ruido moderado gracias al entrenamiento con datos diversos.
- Inferencia en tiempo real o casi tiempo real en dispositivos Apple mediante ANEForge.
- Soporte para audio de 16 kHz mono en formato float32 (requisito de entrada).
- No incluye capacidades de traduccion, tool calling, agentes ni razonamiento multimodal.
- Funciona como modelo de ASR independiente, sin necesidad de modelos adicionales.

## Casos de uso

- Transcripcion de reuniones y entrevistas: el modelo puede convertir grabaciones de audio en texto de forma local, sin enviar datos a la nube, lo que resulta util para aplicaciones de privacidad o entornos sin conexion.
- Generacion de subtitulos para video: se puede integrar en pipelines de postproduccion para generar subtitulos en ingles de forma automatica, reduciendo el trabajo manual de los editores.
- Asistentes de voz en dispositivos Apple: gracias a ANEForge, el modelo puede ejecutarse directamente en el Neural Engine de iPhone o Mac, permitiendo comandos de voz con baja latencia y consumo energetico reducido.
- Sistemas de documentacion medica o legal: transcripcion de dictados en ingles para generar registros escritos, con la ventaja de que el modelo es ligero y puede desplegarse en hardware modesto.
- Analisis de llamadas de atencion al cliente: transcripcion de conversaciones para su posterior analisis de sentimiento o extraccion de informacion, con la posibilidad de procesar grandes volumenes de audio de forma paralela.
- Herramientas de accesibilidad: conversion de audio en texto para personas con discapacidad auditiva, integrable en aplicaciones de escritorio o moviles con requisitos minimos de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es identico a `openai/whisper-tiny.en`, cuyos resultados en conjuntos como LibriSpeech o Common Voice pueden consultarse en la documentacion oficial de OpenAI, pero no se incluyen aqui por no estar en las fuentes proporcionadas.

## Requisitos de hardware

- El modelo tiene 37,76 millones de parametros, lo que equivale a aproximadamente 151 MB en fp32 y unos 38 MB en cuantizacion de 8 bits.
- Cabe en cualquier GPU consumer (por ejemplo, NVIDIA GTX 1060 o superior) y tambien en CPU, con latencias de pocos segundos para audio de 30 segundos.
- En dispositivos Apple, ANEForge permite ejecutarlo en el Neural Engine, reduciendo el consumo y mejorando la velocidad frente a CPU.
- Opciones de despliegue: ademas de ANEForge, se puede usar con `transformers` de Hugging Face, `faster-whisper` (CTranslate2) o `whisper.cpp` para CPU/GPU.
- No se dispone de datos de throughput especificos, pero al ser un modelo tiny, es adecuado para inferencia en tiempo real en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| aneforge/whisper-tiny.en | 37,76 M | 30 s de audio | ingles | Apache 2.0 | safetensors |
| openai/whisper-tiny.en | 37,76 M | 30 s de audio | ingles | MIT (original) | safetensors, PyTorch |
| openai/whisper-tiny | 37,76 M | 30 s de audio | multilingue | MIT | safetensors, PyTorch |
| openai/whisper-base.en | 74 M | 30 s de audio | ingles | MIT | safetensors, PyTorch |

La diferencia principal con `openai/whisper-tiny.en` es la integracion con ANEForge y la licencia Apache 2.0 (el original usa MIT). Frente a `whisper-base.en`, este modelo es mas ligero y rapido, aunque con menor precision en condiciones adversas. La version multilingue `whisper-tiny` cubre mas idiomas pero con peor rendimiento en ingles que la version .en.

## Limitaciones y advertencias

- Modelo exclusivamente en ingles; no reconoce otros idiomas ni realiza traduccion.
- Ventana de audio fija de 30 segundos; audios mas largos requieren segmentacion previa.
- Puede presentar errores en acentos no nativos, habla solapada o audio con mucho ruido de fondo.
- Riesgo de alucinaciones en silencios o audio ininteligible, generando texto inventado.
- No incluye soporte para puntuacion personalizada ni formato estructurado (por ejemplo, numeros o fechas).
- La licencia Apache 2.0 permite uso comercial, pero el modelo original de OpenAI tiene una licencia MIT; este repositorio la cambia a Apache 2.0, lo que puede tener implicaciones legales si se redistribuye.
- No se garantiza compatibilidad con versiones futuras de ANEForge; verificar la documentacion de la libreria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aneforge/whisper-tiny.en
- Modelo original: https://huggingface.co/openai/whisper-tiny.en
- Repositorio ANEForge: https://github.com/sbryngelson/ANEForge
- Documentacion de ANEForge: https://aneforge.readthedocs.io
- Paper de ANEForge: https://arxiv.org/abs/2606.17090
- Pagina de OpenASR sobre whisper-tiny.en: https://openasr.org/models/whisper-tiny.en/
