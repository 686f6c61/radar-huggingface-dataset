# Phoonnx/vits-en_us-vctk

## Resumen

Phoonnx/vits-en_us-vctk es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui a partir del conjunto de datos VCTK y empaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo convierte texto en ingles estadounidense a audio, tomando como entrada fonemas espeak en alfabeto IPA. Su relevancia radica en que ofrece una via de despliegue ligera y estandarizada (ONNX) para una voz consolidada del ecosistema Coqui TTS, con un tamano de repositorio de aproximadamente 0,1 GB.

El modelo no es un LLM ni un modelo de lenguaje: es un sistema TTS completo que integra un codificador de texto, un predictor de duracion y un decodificador generativo de audio en una sola arquitectura. Al estar empaquetado para phoonnx, puede ejecutarse tanto en Python como en el asistente de voz OVOS mediante el plugin ovos-tts-plugin-phoonnx, y tambien en el navegador a traves de phoonnx.js.

La licencia Apache-2.0 declarada por el upstream facilita su integracion en productos comerciales, aunque conviene verificar las condiciones del dataset VCTK original. El modelo esta orientado a una unica voz y un unico idioma (en-US), por lo que su ambito de aplicacion es acotado pero bien definido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS, sin ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-to-speech |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura end-to-end que combina un codificador de texto, un predictor de duracion basado en alineamiento monotono, un decodificador generativo condicionado por variables latentes y un discriminador adversarial multiperiodo. El resultado es un modelo que genera waveform directamente a partir de fonemas, sin necesidad de un vocoder externo separado.

Este checkpoint concreto procede del release v0.6.1 de Coqui TTS, correspondiente a la receta `tts_models--en--vctk--vits`, entrenada sobre el corpus VCTK. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o ajuste fino preferencial (no aplicables habitualmente en TTS). La innovacion principal del empaquetado es la conversion a ONNX y la integracion con el front-end de texto de phoonnx mediante scriptconv y el fonemizador espeak.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense, con salida en formato WAV.
- Conversion de texto a fonemas IPA mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`).
- Normalizacion y conversion de texto de entrada mediante la libreria scriptconv.
- Integracion con el asistente de voz OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js, con demo en vivo disponible.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de vision, audio de entrada ni modo thinking.
- Soporte multilingue limitado a en-US; no se documentan otras lenguas.

## Casos de uso

- Asistente de voz domestico con OVOS: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y la voz `coqui/en-vctk-vits`, permitiendo respuestas habladas en ingles dentro de un asistente local.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: al ser un modelo ONNX de 0,1 GB, puede empaquetarse junto a la aplicacion y sintetizar mensajes cortos sin depender de servicios en la nube.
- Generacion de audiolibros o contenido narrado en ingles: la salida WAV permite posprocesar y encadenar fragmentos, aunque al ser una unica voz requiere variaciones si se necesita diversidad de hablantes.
- Prototipado de interfaces conversacionales: util para validar flujos de voz en ingles antes de invertir en voces comerciales o modelos multilingues de mayor tamano.
- Síntesis en el navegador con phoonnx.js: la demo en tigregotico.pt/demo muestra como ejecutar la voz del lado del cliente sin backend, adecuado para demos y pruebas de accesibilidad web.
- Accesibilidad y lectura de pantalla: integrable en pipelines que conviertan texto de interfaz en audio para usuarios con discapacidad visual, dado el bajo coste computacional del modelo.
- Pruebas de regresion en pipelines de TTS: sirve como referencia estable para comparar calidad y latencia frente a otras voces VITS empaquetadas en la coleccion de Phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 0,1 GB, por lo que el modelo es muy ligero y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU moderna con al menos unos pocos GB de memoria; no se documentan modelos concretos (A100, H100, RTX 4090) en la informacion proporcionada.
- Cabe en GPU de consumo: si, dado el tamano reducido del checkpoint ONNX; no se especifican modelos minimos.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS y phoonnx.js en navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Contexto |
|---|---|---|---|---|---|
| Phoonnx/vits-en_us-vctk | VITS | en-US | Apache-2.0 | ONNX | no aplica |
| Otras voces VITS de la coleccion Phoonnx | VITS | segun voz | segun upstream | ONNX | no aplica |
| Coqui TTS `tts_models--en--vctk--vits` (upstream) | VITS | en-US | Apache-2.0 | checkpoint Coqui | no aplica |
| VITS original (Kim et al.) | VITS | multi (LJSpeech, VCTK) | MIT (codigo) | PyTorch | no aplica |

La comparativa se limita a variantes del mismo modelo o de la misma familia, ya que no se dispone de datos de rendimiento de alternativas en la informacion proporcionada. La diferencia principal de este checkpoint frente al upstream de Coqui es el empaquetado ONNX y la integracion con phoonnx y OVOS.

## Limitaciones y advertencias

- Modelo de una sola voz y un solo idioma (en-US); no soporta cambio de hablante ni otras lenguas.
- La calidad de la sintesis depende del fonemizador: con espyak en lugar de espeak-ng algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Requiere instalar espeak-ng en el sistema o el extra `phoonnx[espeak]`; sin esta dependencia el modelo no funciona correctamente.
- Riesgo de pronunciacion incorrecta en palabras fuera del vocabulario o con grafias atipicas, al depender de la conversion a fonemas.
- No se documentan sesgos especificos, pero al entrenarse sobre VCTK puede reflejar las caracteristicas del corpus original (hablantes y acentos del dataset).
- La licencia Apache-2.0 la declara el upstream en la lista de modelos de Coqui TTS; conviene verificar las condiciones del dataset VCTK para usos comerciales.
- No es adecuado para tareas de razonamiento, codigo, matematicas ni agentes; su unico cometido es la sintesis de voz.
- No se publican benchmarks de calidad (MOS, WER) en la informacion disponible, por lo que la evaluacion cualitativa debe hacerse por prueba directa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-vctk
- Upstream Coqui TTS v0.6.1: https://github.com/coqui-ai/TTS/releases/download/v0.6.1_models/tts_models--en--vctk--vits.zip
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
