# Phoonnx/vits-en_us-death_from_puss_and_boots-espeak

## Resumen

vits-en_us-death_from_puss_and_boots-espeak es un modelo de sintesis de voz (text-to-speech) de arquitectura VITS, empaquetado por Phoonnx para su libreria ONNX homonima. El modelo original fue entrenado por drewThomasson a partir de un fine-tuning de Piper TTS sobre la voz "death_from_puss_and_boots" en ingles estadounidense, y Phoonnx lo redistribuye en formato ONNX listo para inferencia dentro de su ecosistema (Python y OVOS). Resuelve el problema de disponer de una voz TTS concreta, ligera y ejecutable en local, sin depender de servicios en la nube.

El modelo es de proposito especifico: convierte texto en ingles a audio mediante fonemas espeak (alfabeto IPA) como entrada. No es un modelo de lenguaje general ni admite otras tareas. Su relevancia actual radica en su tamano reducido (repo de 0,1 GB), licencia MIT y su integracion con el stack de Phoonnx/scriptconv, lo que permite desplegarlo en asistentes de voz embebidos (OVOS) y en el navegador mediante phoonnx.js.

La ficha se basa exclusivamente en la informacion publicada en Hugging Face y en la model card del autor; los datos no disponibles se indican explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial entrenado con perdidas de reconstruccion y de matching temporal. El modelo aqui presentado es un fine-tuning de Piper TTS realizado por drewThomasson sobre la voz "death_from_puss_and_boots" en en-US, y posteriormente empaquetado por Phoonnx en ONNX para su libreria de inferencia.

La entrada del modelo son fonemas generados por espeak-ng en alfabeto IPA; el front-end de texto lo aporta scriptconv (EspeakPhonemizer). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF/DPO, por lo que estos datos se consideran no disponibles. La innovacion practica del empaquetado es la portabilidad: pesos ONNX ejecutables en Python (phoonnx) y en navegador (phoonnx.js).

## Capacidades

- Sintesis de voz (text-to-speech) en ingles estadounidense a partir de texto plano.
- Conversion texto a fonemas espeak (IPA) mediante el front-end scriptconv.
- Generacion de audio WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Integracion como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- Ejecucion en navegador mediante phoonnx.js (voces VITS con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada.
- Capacidad multilingue limitada a en-US.

## Casos de uso

- Asistentes de voz embebidos en OVOS: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas locales sin conexion a servicios externos.
- Sintesis de voz en aplicaciones Python: con `TTSModelManager` y `voice.synthesize_wav` se genera audio WAV a partir de texto en-US, adecuado para prototipos y utilidades de escritorio.
- Lectura de contenido en el navegador: phoonnx.js ejecuta voces VITS con entrada espeak o unicode, de modo que el modelo puede emplearse en demos web y aplicaciones cliente sin backend.
- Generacion de locuciones para videojuegos o contenido multimedia: al ser una voz concreta y ligera (repo de 0,1 GB), sirve para producir clips de voz de forma reproducible en pipelines de postproduccion.
- Pruebas de integracion de TTS en CI: su formato ONNX y su licencia MIT facilitan incluirlo en tests automatizados que verifiquen la generacion de audio sin dependencias propietarias.
- Educacion e investigacion en TTS: sirve como ejemplo de fine-tuning de Piper/VITS y de empaquetado ONNX para comparar frentes de fonemizacion (espeak-ng frente a espyak).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo ocupa 0,1 GB, lo que sugiere un modelo pequeno ejecutable en CPU.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por tamano del repo es previsible que funcione en CPU y en GPU de gama baja, pero no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, phoonnx.js en navegador; requiere espeak-ng instalado (o el extra `phoonnx[espeak]` con espyak).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto / uso |
|---|---|---|---|---|---|
| vits-en_us-death_from_puss_and_boots-espeak | VITS | en-US | MIT | ONNX | TTS de proposito especifico |
| Otras voces Piper TTS (p. ej. las de la coleccion VITS de Phoonnx) | VITS | segun voz | variable (MIT en este caso) | ONNX | TTS de proposito especifico |
| Modelos TTS de gran escala (p. ej. familia XTTS) | no disponible en esta ficha | multilingue | variable | variable | TTS multilingue con clonacion |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo sintetiza voz en ingles estadounidense; no admite otros idiomas.
- Requiere espeak-ng instalado; con el port espyak algunos fonemas difieren y la voz puede pronunciar mal ciertas palabras.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- Riesgo de alucinacion no aplicable en el sentido de texto; si existe riesgo de pronunciacion incorrecta por errores de fonemizacion.
- Sesgos: no disponibles en la informacion proporcionada; al ser una voz concreta puede no representar variedades dialectales del ingles.
- Licencia MIT: permite uso comercial, pero conviene verificar la procedencia de los datos de la voz original en el repositorio upstream.
- Para produccion: no hay benchmarks publicados ni datos de latencia/throughput, por lo que el rendimiento debe medirse en el entorno objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-death_from_puss_and_boots-espeak
- Upstream (drewThomasson, Piper TTS fine-tune): https://huggingface.co/drewThomasson/piper_tts_finetune_death_from_puss_and_boots/tree/main/en_US-death-high_onnx
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
