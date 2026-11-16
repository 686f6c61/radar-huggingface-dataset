# Phoonnx/vits-bg_bg-dimitar-medium-espeak

## Resumen

vits-bg_bg-dimitar-medium-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y reempaquetado por Phoonnx para su uso con la librería ONNX phoonnx. El modelo convierte texto en búlgaro (bg-BG) a audio inteligible mediante un front-end fonémico basado en espeak-ng, y se distribuye en formato ONNX listo para inferencia.

El modelo resuelve el problema de la síntesis de voz local y ligera para búlgaro, un idioma con relativamente pocos recursos TTS de calidad. Al estar empaquetado para phoonnx, se integra directamente en el ecosistema OVOS (Open Voice OS) y en aplicaciones Python que necesiten TTS sin depender de servicios en la nube. El repositorio ocupa aproximadamente 0,1 GB, lo que lo hace adecuado para despliegues en dispositivos con recursos limitados.

La relevancia actual radica en su licencia MIT, su formato ONNX optimizado para inferencia y su integración con herramientas de código abierto como phoonnx, scriptconv y phoonnx.js, que permiten ejecutarlo tanto en servidor como en navegador. No se dispone de información pública sobre el número de parámetros, la longitud de contexto ni los datos de entrenamiento originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repo no detalla variantes) |
| Idiomas soportados | búlgaro (bg-BG) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-to-speech |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un modelo generativo de extremo a extremo para síntesis de voz que combina un codificador de texto, un prior variacional y un decodificador basado en flujos normalizadores y un generador adversarial (GAN) para producir waveforms directamente desde fonemas. Esta arquitectura es la base de la familia Piper, orientada a TTS ligero y de baja latencia.

El modelo original fue entrenado por Rhasspy y publicado en el repositorio rhasspy/piper-voices bajo la ruta bg/bg_BG/dimitar/medium. No se dispone de información en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El front-end textual utiliza espeak-ng para la fonemización (a través de `EspeakPhonemizer` de scriptconv), y el modelo consume fonemas en alfabeto IPA. La innovación principal del empaquetado es la conversión a ONNX y la integración con phoonnx, que permite ejecución local en Python, OVOS y navegador mediante phoonnx.js.

## Capacidades

- Síntesis de voz a partir de texto en búlgaro (bg-BG).
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Fonemización de entrada mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`).
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador a través de phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo TTS).
- No dispone de capacidades multimodales más allá del audio de salida.
- No se documentan capacidades de clonación de voz ni control de estilo.

## Casos de uso

- Asistentes de voz locales en búlgaro: el modelo puede integrarse en OVOS mediante `ovos-tts-plugin-phoonnx` para convertir respuestas textuales en audio, funcionando sin conexión a internet y con una huella de disco de 0,1 GB.
- Lectura de notificaciones y alertas en sistemas embebidos: al ser un modelo ONNX ligero, puede desplegarse en dispositivos con recursos limitados (Raspberry Pi, routers, etc.) para leer mensajes en búlgaro.
- Accesibilidad para personas con discapacidad visual: conversión de texto de pantalla o documentos a voz en búlgaro, ejecutándose localmente para preservar la privacidad del contenido.
- Integración en aplicaciones de escritorio Python: mediante `TTSModelManager` y `voice.synthesize_wav`, se puede añadir TTS a herramientas de escritorio que necesiten leer contenido en búlgaro.
- Síntesis en navegador con phoonnx.js: aplicaciones web que requieran TTS en búlgaro sin enviar texto a servidores externos, usando la demo disponible en tigregotico.pt/demo.
- Generación de audiolibros o contenido pregrabado: el modelo puede sintetizar pasajes de texto en búlgaro para producir ficheros WAV que luego se postprocesan o se empaquetan como audio.
- Pruebas de integración en pipelines de CI/CD: al ser un modelo pequeño y con licencia MIT, puede usarse en tests automatizados que verifiquen la generación de audio en búlgaro sin dependencias de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) se estima que la inferencia en CPU es viable con menos de 1 GB de RAM.
- GPU recomendadas: no se especifican; al ser un modelo VITS ligero, puede ejecutarse en CPU y en GPUs consumer (GTX 1060, RTX 3060, etc.) sin requisitos especiales.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 1 GB de memoria libre, aunque no se documenta oficialmente.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, phoonnx.js en navegador, y ONNX Runtime como backend subyacente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Contexto/entrada |
|---|---|---|---|---|---|
| vits-bg_bg-dimitar-medium-espeak (este modelo) | VITS | bg-BG | MIT | ONNX | fonemas espeak/IPA |
| rhasspy/piper-voices bg_BG dimitar medium (upstream) | VITS | bg-BG | MIT | Piper (ONNX) | fonemas espeak |
| Otros modelos VITS de la colección Phoonnx | VITS | varios | MIT (según upstream) | ONNX | fonemas espeak/IPA |
| Modelos TTS multilingües de gran escala | no disponible | multilingüe | variable | variable | texto/fonemas |

La comparativa se limita al ecosistema Piper/Phoonnx, ya que no se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada. El modelo es esencialmente un reempaquetado del voice de Piper para búlgaro, por lo que su rendimiento debería ser equivalente al upstream, aunque no se confirma con métricas.

## Limitaciones y advertencias

- El modelo solo soporta búlgaro (bg-BG); no es multilingüe.
- La fonemización depende de espeak-ng; si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, según advierte la model card.
- No se dispone de información sobre sesgos, alucinaciones o calidad de la voz en dominios específicos.
- Al ser un modelo TTS, no genera texto ni razona; no aplica el riesgo de alucinación textual, pero sí posibles errores de pronunciación.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia upstream de rhasspy/piper-voices y las dependencias (espeak-ng, scriptconv, phoonnx) antes de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validación comunitaria.
- No se documentan límites de longitud de texto de entrada; textos muy largos podrían requerir segmentación manual.
- La integración con OVOS y phoonnx requiere instalar dependencias adicionales (`pip install --pre phoonnx` y espeak-ng), lo que añade complejidad al despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-bg_bg-dimitar-medium-espeak
- Upstream (rhasspy/piper-voices, bg_BG/dimitar/medium): https://huggingface.co/rhasspy/piper-voices/tree/main/bg/bg_BG/dimitar/medium
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
