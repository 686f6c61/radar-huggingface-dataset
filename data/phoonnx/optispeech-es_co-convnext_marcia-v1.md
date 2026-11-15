# Phoonnx/optispeech-es_co-convnext_marcia-v1

## Resumen

`optispeech-es_co-convnext_marcia-v1` es un modelo de síntesis de voz (text-to-speech) en formato ONNX, empaquetado por Phoonnx a partir del modelo original `bookbot/OptiSpeech-ConvNext-TTS-es-CO-Marcia-v1` desarrollado por bookbot. El modelo convierte texto en audio para la variante dialectal del español de Colombia (`es-CO`) y está pensado para su uso dentro de la librería `phoonnx`, una herramienta de inferencia TTS basada en ONNX que lo integra en el ecosistema OVOS.

La arquitectura es OptiSpeech con un backbone ConvNeXt, una elección poco habitual en TTS que sustituye los bloques de atención/convolución tradicionales por bloques convolucionales de tipo ConvNeXt. El repositorio empaquetado ocupa aproximadamente 0,1 GB, lo que sugiere un modelo compacto orientado a inferencia ligera en CPU o GPU de gama baja. La licencia declarada es Apache 2.0, heredada del modelo original.

El interés actual de esta ficha es limitado pero concreto: se trata de un modelo de nicho, con muy pocas descargas (29) y sin likes, útil para quien necesite una voz femenina (identificada como "Marcia") en español colombiano dentro de un pipeline ONNX autocontenido, sin depender de frameworks de deep learning pesados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OptiSpeech con backbone ConvNeXt |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato ONNX) |
| Idiomas soportados | español de Colombia (`es-CO`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | ~0,1 GB |
| Pipeline | text-to-speech |
| Libreria de inferencia | phoonnx |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura OptiSpeech, un sistema TTS acústico cuyo componente principal es un backbone ConvNeXt. ConvNeXt es una familia de redes convolucionales modernizadas que incorporan ideas de los transformers (convoluciones depthwise de kernel grande, normalización LayerNorm, activaciones GELU y estructura de etapas con proporciones tipo Swin). Su uso en TTS busca capturar dependencias de largo alcance en la secuencia de fonemas sin el coste cuadrático de la atención completa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el corpus de voz utilizado para "Marcia", ni si hubo etapas de ajuste fino con RLHF o DPO (poco habituales en TTS). Tampoco se documentan innovaciones técnicas específicas más allá de la elección del backbone. El modelo empaquetado es una conversión a ONNX del checkpoint original de bookbot; no se han publicado detalles sobre la cuantización aplicada en la exportación.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) en español de Colombia.
- Voz femenina concreta ("Marcia"), según la denominación del checkpoint.
- Inferencia mediante ONNX Runtime a través de la librería phoonnx, en Python y en OVOS.
- Integración con `scriptconv` para normalización de texto, conversión de script y fonemización.
- Ejecución ligera: el tamaño del repositorio (~0,1 GB) permite despliegue en entornos con recursos limitados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un modelo TTS.
- No se documentan capacidades de control de prosodia, clonación de voz, emoción ni velocidad variable más allá de lo que exponga la API de phoonnx.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra directamente en el ecosistema OVOS mediante phoonnx, lo que permite dotar de voz en español colombiano a asistentes domésticos sin depender de servicios en la nube.
- Lectura de textos en aplicaciones de accesibilidad: conversión de artículos, notificaciones o documentos a audio para usuarios con discapacidad visual, con un modelo de 0,1 GB que cabe en dispositivos modestos.
- Generación de avisos y locuciones pregrabadas: producción por lotes de mensajes de voz para sistemas de megafonía, IVR o atención telefónica en español de Colombia.
- Prototipado rápido de interfaces de voz: al ser ONNX y ejecutable con phoonnx, permite validar un flujo TTS completo en local antes de invertir en modelos mayores.
- Audiolibros y contenido educativo: narración de material didáctico o divulgativo en registro neutro colombiano, aprovechando una voz consistente.
- Pruebas de integración en pipelines de CI: verificación automatizada de que la cadena texto → fonemas → audio funciona tras cambios en `scriptconv` o en phoonnx, dado el reducido tamaño del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad (MOS, MCD, WER de ASR sobre el audio sintetizado), latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con un repositorio de ~0,1 GB en ONNX, la huella de memoria es del orden de cientos de megabytes, apta para CPU.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) o incluso iGPU debería ser suficiente.
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño del modelo.
- Opciones de despliegue: phoonnx (Python y OVOS) sobre ONNX Runtime; no se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS ONNX).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| optispeech-es_co-convnext_marcia-v1 | OptiSpeech + ConvNeXt | es-CO | ONNX | Apache 2.0 | ~0,1 GB, empaquetado para phoonnx |
| bookbot/OptiSpeech-ConvNext-TTS-es-CO-Marcia-v1 | OptiSpeech + ConvNeXt | es-CO | no disponible | Apache 2.0 | Modelo original upstream |
| Otros modelos de la colección OptiSpeech de Phoonnx | OptiSpeech | varios | ONNX | variable | Misma familia de empaquetado |
| Modelos TTS multilingües tipo VITS/XTTS | VITS / difusión | multi | varios | variable | No disponibles en la información proporcionada para comparación directa |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho con muy poca tracción: 29 descargas y 0 likes en el momento de la consulta, sin validación comunitaria documentada.
- Cobertura lingüística restringida al español de Colombia (`es-CO`); el comportamiento con otros dialectos o con texto mixto no está documentado.
- No hay información sobre sesgos de género, edad o prosodia más allá de que la voz está etiquetada como femenina ("Marcia").
- Riesgo de errores de pronunciación en nombres propios, siglas, números o palabras no vistas durante el entrenamiento; requiere normalización de texto previa con `scriptconv`.
- Al ser un modelo TTS, no genera texto y no aplican riesgos de alucinación textual, pero sí posibles artefactos acústicos, repeticiones o cortes en frases largas.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo upstream y de los datos de voz originales, que no se detallan.
- La model card indica que el índice de voces de phoonnx no lista una voz para este modelo, lo que puede complicar su uso directo sin configuración manual.
- No se documentan métricas de calidad objetiva ni subjetiva; en producción conviene evaluar el audio con muestras propias antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/optispeech-es_co-convnext_marcia-v1
- Modelo upstream: https://huggingface.co/bookbot/OptiSpeech-ConvNext-TTS-es-CO-Marcia-v1
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Herramienta scriptconv: https://github.com/TigreGotico/scriptconv
- Colección OptiSpeech de Phoonnx: https://huggingface.co/collections/Phoonnx/optispeech-6af8ea9492a4f8f4e0f1cf30
