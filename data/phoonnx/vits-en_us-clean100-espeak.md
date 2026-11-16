# Phoonnx/vits-en_us-clean100-espeak

## Resumen

`vits-en_us-clean100-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería ONNX de TTS. El modelo original fue entrenado por brycebeattie y distribuido a través de un endpoint de DigitalOcean Spaces; Phoonnx lo ha convertido al formato ONNX y lo ha integrado en su ecosistema de voces, lo que permite ejecutarlo tanto en Python como en el asistente de voz OVOS.

El modelo está especializado en inglés estadounidense (`en-US`) y acepta como entrada fonemas generados por espeak-ng en alfabeto IPA, no texto plano directamente. Esta característica lo hace dependiente de un front-end de fonemización (scriptconv) que normaliza el texto y lo convierte al formato esperado por la red neuronal.

Su relevancia actual es limitada pero concreta: se trata de una voz ligera (repo de 0,1 GB) pensada para despliegues de TTS en entornos con recursos restringidos, integrable en pipelines de asistentes de voz open source como OVOS/Mycroft. No es un modelo de propósito general ni compite con sistemas TTS neuronales de gran escala, sino que cubre el nicho de voces ONNX portables con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | inglés estadounidense (`en-US`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamaño del repositorio | 0,1 GB |
| Librería de ejecución | phoonnx |
| Autor upstream | brycebeattie |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas GAN, junto con alineamiento monotónico para aprender la correspondencia texto-audio sin supervisión explícita de duraciones. El resultado es un modelo que genera waveforms directamente desde fonemas.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de las muestras ni si se aplicaron técnicas de RLHF o ajuste fino. La model card únicamente indica que el modelo proviene de un artefacto `clean100.onnx.json` alojado en DigitalOcean Spaces y que fue empaquetado para phoonnx. El nombre "clean100" sugiere un conjunto de datos limpio de 100 unidades (posiblemente horas o clips), pero esto no está confirmado en la documentación proporcionada. No se documentan innovaciones técnicas adicionales más allá de las propias de VITS.

## Capacidades

- Síntesis de voz a partir de fonemas espeak-ng en alfabeto IPA, no directamente desde texto plano.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecución en Python a través de `TTSModelManager` y en navegador mediante `phoonnx.js` (con entrada espeak o unicode).
- Voz única identificada como `piper_community/brycebeattie/en-US_Clean100`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.

## Casos de uso

- Asistentes de voz en OVOS/Mycroft: el modelo se integra como plugin TTS nativo (`ovos-tts-plugin-phoonnx`), permitiendo dotar de voz a un asistente doméstico open source sin depender de servicios en la nube, gracias a su licencia MIT y su formato ONNX portable.
- Síntesis de voz en dispositivos de borde: con un repositorio de 0,1 GB y ejecución ONNX, es adecuado para Raspberry Pi u otros SBC donde no caben modelos TTS de mayor tamaño, siempre que se instale espeak-ng para la fonemización.
- Generación de audiolibros o narración de contenido en inglés estadounidense: la entrada por fonemas IPA permite un control preciso de la pronunciación, útil para pipelines que ya dispongan de un fonemizador espeak-ng.
- Pruebas de regresión en pipelines de TTS: al ser una voz empaquetada y versionada en Hugging Face, sirve como referencia estable para validar cambios en el front-end de fonemización (scriptconv) sin variabilidad de modelo.
- Prototipado de interfaces conversacionales: la API de phoonnx permite generar WAVs en pocas líneas de Python, lo que facilita iterar sobre guiones de voz en demos y pruebas de usabilidad.
- Síntesis en navegador: mediante `phoonnx.js` y la demo en tigregotico.pt/demo, se puede ofrecer TTS en cliente sin backend, útil para aplicaciones web accesibles que requieran lectura de texto en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) se infiere un modelo muy ligero que probablemente cabe en menos de 1 GB de VRAM, aunque no se confirma en la documentación.
- GPU recomendadas: no disponible. Al ser un modelo ONNX de pequeño tamaño, es plausible su ejecución en CPU, pero no se documenta.
- ¿Cabe en GPU consumer? No confirmado, aunque el tamaño del artefacto sugiere que sí en cualquier GPU moderna; no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python), plugin OVOS (`ovos-tts-plugin-phoonnx`), `phoonnx.js` en navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / entrada | Disponibilidad |
|---|---|---|---|---|---|---|
| `vits-en_us-clean100-espeak` (este) | VITS | en-US | ONNX | MIT | fonemas espeak-ng IPA | Hugging Face (Phoonnx) |
| Otras voces VITS de la colección Phoonnx | VITS | variable | ONNX | variable (según modelo) | variable | Hugging Face (colección VITS de Phoonnx) |
| Piper (voces comunitarias) | VITS | múltiples | ONNX | MIT (mayoría) | fonemas espeak-ng | GitHub / Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones detalladas de las alternativas en la información proporcionada, por lo que la comparación se limita a arquitectura, formato y licencia. No se conocen métricas objetivas (MOS, RTF, WER) para este modelo.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (`en-US`); no es multilingüe.
- Requiere espeak-ng instalado en el sistema o el extra `phoonnx[espeak]`; sin él, el modelo no puede fonemizar la entrada. Con espyak, algunos fonemas difieren de espeak-ng y la voz puede pronunciar mal ciertas palabras.
- La entrada debe ser fonemas IPA, no texto plano; el usuario debe pasar por el front-end de scriptconv.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con un dataset no descrito ("clean100"), se desconoce su cobertura de acentos, géneros y registros.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de pronunciaciones incorrectas o artefactos acústicos en palabras fuera del dominio de entrenamiento.
- Licencia MIT permite uso comercial, pero la model card indica que "the upstream release states its terms", por lo que conviene verificar las condiciones del artefacto original de brycebeattie antes de un despliegue comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validación comunitaria.
- No hay información sobre latencia, throughput ni calidad subjetiva (MOS), lo que dificulta evaluar su idoneidad en producción sin pruebas propias.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-clean100-espeak
- Upstream del modelo original: https://sfo3.digitaloceanspaces.com/bkmdls/clean100.onnx.json
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
