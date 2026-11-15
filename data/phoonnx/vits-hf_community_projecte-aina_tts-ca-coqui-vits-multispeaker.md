# Phoonnx/vits-hf_community_projecte-aina_tts-ca-coqui-vits-multispeaker

## Resumen

Este repositorio contiene un modelo de síntesis de voz (text-to-speech) en formato ONNX, empaquetado para su uso con la librería `phoonnx`. Se trata de una conversión de un modelo VITS procedente del proyecto `projecte-aina/tts-ca-coqui-vits-multispeaker`, un sistema TTS multihablante en catalán desarrollado en el marco del Projecte AINA (impulsado por el Barcelona Supercomputing Center y la Generalitat de Catalunya). El modelo original se entrenó con la herramienta Coqui TTS sobre la arquitectura VITS, y este repositorio lo redistribuye como un subconjunto del bundle `Phoonnx/phoonnx-vits`, manteniendo las rutas de ficheros del repositorio fuente.

La relevancia de esta ficha es limitada en términos de información técnica: el repositorio no incluye una model card propia más allá de una nota de empaquetado y la referencia a la licencia del repositorio original. No se declaran idiomas en los metadatos de Hugging Face, no hay datos de entrenamiento, benchmarks ni especificaciones de arquitectura más allá de la etiqueta `vits`. El tamaño del repositorio es de 0,1 GB, lo que es coherente con un modelo VITS de tamaño pequeño-medio cuantizado a ONNX.

El interés práctico reside en que permite ejecutar TTS en catalán con múltiples hablantes en entornos donde ONNX Runtime está disponible (servidores, edge, aplicaciones de escritorio), sin depender del stack completo de Coqui TTS. No obstante, al no haber descargas ni likes, y al ser una conversión de terceros, conviene evaluar su calidad de forma empírica antes de usarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (formato ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | catalán (inferido del identificador `tts-ca`; no declarado en metadatos) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en normalizing flows y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales, junto con un modelo de duración estocástico. Esto permite generar audio de forma directa desde texto sin un vocoder externo, con una calidad natural razonable para modelos de tamaño reducido.

No se dispone de información sobre el número de tokens, la composición del dataset, el número de hablantes ni si se aplicaron técnicas de fine-tuning adicionales. El modelo procede del proyecto `projecte-aina/tts-ca-coqui-vits-multispeaker`, entrenado presumiblemente con Coqui TTS, pero el repositorio aquí descrito no aporta detalles de entrenamiento. La conversión a ONNX la realiza el proyecto `phoonnx` de TigreGotico, y no se documentan técnicas de optimización específicas (por ejemplo, decodificación especulativa, atención lineal o destilación).

## Capacidades

- Síntesis de voz a partir de texto en catalán (inferido del identificador del modelo).
- Soporte multihablante (según el nombre `multispeaker`), aunque no se especifica el número de hablantes ni sus identificadores.
- Generación de audio end-to-end sin vocoder externo, gracias a la arquitectura VITS.
- Ejecución mediante ONNX Runtime a través de la librería `phoonnx`.
- No se documentan capacidades de clonación de voz, control de emoción, tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).
- No se documentan capacidades multilingües más allá del catalán.

## Casos de uso

- Lectura de contenidos web en catalán: integración en un servicio de accesibilidad que convierta artículos o documentos a audio, usando ONNX Runtime para servir peticiones con baja latencia.
- Asistentes de voz para aplicaciones catalanohablantes: generación de respuestas habladas en un asistente conversacional, aprovechando el soporte multihablante para elegir una voz adecuada al contexto.
- Audiolibros y podcasts automatizados: conversión por lotes de textos largos a audio, con la posibilidad de alternar entre hablantes para diálogos o narraciones.
- Sistemas de navegación o avisos por voz: generación de mensajes cortos en tiempo real en dispositivos con recursos limitados, gracias al formato ONNX y al tamaño reducido del repositorio (0,1 GB).
- Locución para vídeos y materiales educativos: producción de narraciones en catalán sin depender de servicios en la nube, lo que facilita el cumplimiento de requisitos de privacidad.
- Pruebas de integración en pipelines de TTS open source: uso como modelo de referencia para validar la librería `phoonnx` o para comparar con otras voces VITS en catalán antes de adoptar una solución definitiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) y la naturaleza de VITS, es plausible que quepa en GPUs consumer con 4-8 GB, pero no hay datos oficiales.
- GPU recomendadas: no disponible. Para un modelo VITS de este tamaño, una RTX 3060 o superior sería suficiente en la mayoría de escenarios, pero no se confirma.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del repositorio, aunque no se documenta.
- Opciones de despliegue: ONNX Runtime (principal, a través de `phoonnx`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (phoonnx VITS ca multispeaker) | VITS | catalán (inferido) | MIT | ONNX | Hugging Face, 0 descargas |
| `projecte-aina/tts-ca-coqui-vits-multispeaker` (fuente) | VITS | catalán | no disponible en esta ficha | Coqui TTS | Hugging Face (proyecto AINA) |
| Otros modelos VITS de Coqui TTS | VITS | varios | variable según modelo | Coqui TTS / ONNX | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta el número de hablantes, sus identificadores ni las características de las voces; es necesario inspeccionar el repositorio fuente para obtenerlos.
- No se declaran idiomas en los metadatos de Hugging Face; el catalán se infiere del identificador, pero no está confirmado oficialmente en este repositorio.
- Al ser una conversión de terceros, la calidad del audio puede diferir de la del modelo original; conviene evaluarla empíricamente.
- No hay información sobre sesgos, alucinaciones o comportamiento en dominios específicos (nombres propios, siglas, números).
- La licencia MIT se hereda del repositorio fuente según la model card, pero esta advierte que las licencias siguen a los originales por subcarpeta; verificar la licencia del modelo original antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- No se documentan limitaciones de longitud de texto de entrada ni de manejo de caracteres especiales.
- No se proporcionan garantías de mantenimiento ni actualizaciones.

## Enlaces

- [Hugging Face: Phoonnx/vits-hf_community_projecte-aina_tts-ca-coqui-vits-multispeaker](https://huggingface.co/Phoonnx/vits-hf_community_projecte-aina_tts-ca-coqui-vits-multispeaker)
- [Repositorio bundle: Phoonnx/phoonnx-vits](https://huggingface.co/Phoonnx/phoonnx-vits)
- [Repositorio de la librería phoonnx](https://github.com/TigreGotico/phoonnx)
- [Modelo fuente: projecte-aina/tts-ca-coqui-vits-multispeaker](https://huggingface.co/projecte-aina/tts-ca-coqui-vits-multispeaker)
- [Projecte AINA](https://projecteaina.cat/)
