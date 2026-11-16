# Phoonnx/vits-ar_sa-wasmdashai_a-graphemes

## Resumen

vits-ar_sa-wasmdashai_a-graphemes es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por wasmdashai y empaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo convierte texto en arabe saudita (ar-SA) en audio, tomando como entrada caracteres (graphemes) del texto normalizado.

El modelo resuelve el problema de la sintesis de voz en arabe estandar con una implementacion ligera y desplegable en entornos de produccion mediante ONNX Runtime. Su relevancia radica en la escasez de modelos TTS de calidad para arabe en formatos optimizados para inferencia y en su integracion con el ecosistema OVOS/Mycroft para asistentes de voz.

El repositorio ocupa 0,1 GB y la libreria phoonnx gestiona la normalizacion del texto mediante scriptconv, que incluye un fonemizador basado en graphemes. La licencia es MIT, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; se desconoce si existen variantes cuantizadas) |
| Idiomas soportados | arabe saudita (ar-SA) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial entrenado con perdidas de dominio temporal y espectral. El modelo genera waveforms directamente a partir de la entrada de texto, sin necesidad de un vocoder separado. En este caso, la entrada es a nivel de caracteres (graphemes) del texto arabe, procesados por el `GraphemePhonemizer` de la libreria scriptconv.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o fine-tuning especifico. El modelo upstream es wasmdashai/vits-ar-sa-A, y el empaquetado por Phoonnx se limita a la conversion a ONNX y la integracion con su pipeline de inferencia. No se documentan innovaciones tecnicas adicionales mas alla de las propias de VITS.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en arabe saudita.
- Entrada basada en graphemes (caracteres), con normalizacion de texto mediante scriptconv.
- Generacion de audio en formato WAV a traves de la API de phoonnx.
- Integracion con el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo TTS, no un LLM).
- No soporta vision, audio de entrada ni modo thinking.
- Capacidad multilingue limitada exclusivamente al arabe saudita (ar-SA).

## Casos de uso

- Asistentes de voz en arabe: el modelo puede integrarse en OVOS/Mycroft como motor TTS para responder a comandos de voz en arabe saudita, gracias al plugin `ovos-tts-plugin-phoonnx` y a la configuracion via `mycroft.conf`.
- Lectura de notificaciones y alertas: en aplicaciones de monitoring o sistemas de alertas, el modelo sintetiza mensajes de texto en audio para usuarios araboparlantes, con inferencia ONNX ligera (repo de 0,1 GB).
- Accesibilidad para personas con discapacidad visual: conversion de contenido textual (articulos, correos, documentos) a audio en arabe saudita, aprovechando la normalizacion de texto de scriptconv.
- Sistemas de atencion al cliente automatizada: generacion de respuestas habladas en arabe en IVRs o chatbots telefonicos, donde el modelo sintetiza frases cortas de forma rapida en CPU o GPU.
- Contenido educativo y e-learning: narracion automatica de materiales didacticos en arabe, con la ventaja de que el modelo es ligero y puede desplegarse en servidores modestos.
- Pruebas de integracion en pipelines de TTS: desarrolladores que necesiten un motor TTS de referencia para arabe pueden usar este modelo como baseline en pruebas automatizadas, dado su formato ONNX y su licencia MIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; dado el tamano del repo (0,1 GB en ONNX), el modelo es muy ligero y probablemente cabe en menos de 1 GB de VRAM o incluso funciona en CPU.
- GPU recomendadas: no se especifican; por el tamano, cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) es mas que suficiente. Tambien es viable en CPU.
- Cabe en GPU consumer: si, con amplio margen, dado el reducido tamano del modelo.
- Opciones de despliegue: phoonnx (Python y OVOS), ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplican a un modelo TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto/Entrada |
|---|---|---|---|---|---|
| vits-ar_sa-wasmdashai_a-graphemes | VITS | ar-SA | MIT | ONNX | graphemes |
| wasmdashai/vits-ar-sa-A (upstream) | VITS | ar-SA | no disponible en la informacion | no disponible | no disponible |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | MIT (segun coleccion) | ONNX | graphemes/fonemas |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- El modelo solo soporta arabe saudita (ar-SA); no es multilingue ni acepta otros dialectos arabes de forma fiable.
- Al ser un modelo TTS, no realiza razonamiento ni generacion de texto; no debe evaluarse con benchmarks de LLM.
- Riesgo de alucinacion acustica: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas o artefactos en textos fuera de dominio, aunque no se documentan tasas concretas.
- No se dispone de informacion sobre sesgos de genero, dialectales o de otro tipo en la voz sintetizada.
- La licencia MIT permite uso comercial, pero se recomienda verificar los terminos del modelo upstream (wasmdashai/vits-ar-sa-A), ya que la model card indica que "the upstream release states its terms".
- El modelo esta empaquetado para phoonnx; su uso fuera de esa libreria requiere manejar directamente el grafo ONNX y replicar la normalizacion de texto de scriptconv.
- No se documentan limitaciones de longitud de texto; textos muy largos podrian requerir segmentacion manual.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-ar_sa-wasmdashai_a-graphemes
- Modelo upstream: https://huggingface.co/wasmdashai/vits-ar-sa-A
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
