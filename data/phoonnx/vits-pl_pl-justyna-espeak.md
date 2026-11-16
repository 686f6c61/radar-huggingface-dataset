# Phoonnx/vits-pl_pl-justyna-espeak

## Resumen

vits-pl_pl-justyna-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por WitoldG dentro del proyecto `WitoldG/polish_piper_models` y empaquetado por Phoonnx para su libreria ONNX de TTS, `phoonnx`. El modelo convierte texto en polaco (`pl-PL`) a audio inteligible, tomando como entrada fonemas en alfabeto IPA generados por espeak-ng. Resuelve el problema de dotar de voz polaca a asistentes y aplicaciones dentro del ecosistema OVOS/Mycroft.

La relevancia de este empaquetado es practica: expone un checkpoint VITS ya entrenado en formato ONNX listo para ejecutarse en Python (via `phoonnx`) y en el navegador (via `phoonnx.js`), sin necesidad de reentrenar ni de gestionar el pipeline de Piper de forma manual. El repositorio ocupa aproximadamente 0,1 GB, lo que lo hace ligero para despliegues en dispositivos modestos.

Se trata de un modelo de un solo hablante (voz "justyna"), especializado exclusivamente en polaco y con licencia MIT. No es un modelo de proposito general: su unico cometido es la sintesis de voz, y su calidad depende del front-end fonemizador (espeak-ng o su port espyak).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | polaco (`pl`, `pl-PL`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Voces | una sola voz (`piper_community/WitoldG/pl-PL_justyna`) |
| Tamano del repositorio | ~0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un encoder de texto, un predictor de duracion, un flujo normalizador y un decoder generativo basado en HiFi-GAN, entrenado con aprendizaje adversarial (GAN) y estimacion variacional. El modelo genera audio directamente a partir de fonemas, sin necesidad de un vocoder separado en tiempo de inferencia.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el hablante de origen ni si se aplicaron tecnicas de RLHF o fine-tuning adicional. El modelo card indica unicamente que procede de `WitoldG/polish_piper_models`, un repositorio de voces polacas para Piper, y que Phoonnx lo ha reempaquetado a ONNX. La innovacion destacable es el empaquetado para ejecucion en navegador mediante `phoonnx.js`, con entrada por espeak o unicode.

## Capacidades

- Sintesis de voz a partir de texto en polaco (`pl-PL`).
- Generacion de audio WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Entrada basada en fonemas IPA generados por espeak-ng (o por el port espyak incluido en `phoonnx[espeak]`).
- Integracion como plugin de TTS en OVOS/Mycroft (`ovos-tts-plugin-phoonnx`).
- Ejecucion en navegador mediante `phoonnx.js`.
- Normalizacion y conversion de texto mediante `scriptconv`.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada: es exclusivamente TTS.
- Una unica voz; no hay seleccion de hablante ni control de estilo.

## Casos de uso

- Asistentes de voz en polaco sobre OVOS/Mycroft: configurando el modulo `ovos-tts-plugin-phoonnx` y la voz `piper_community/WitoldG/pl-PL_justyna` en `mycroft.conf`, el asistente sintetiza respuestas en polaco de forma local.
- Lectura de notificaciones y alertas en aplicaciones de escritorio o moviles polacas: el modelo es ligero (~0,1 GB) y puede empaquetarse dentro de la aplicacion para generar audio sin conexion.
- Accesibilidad web: mediante `phoonnx.js` se puede leer contenido de una pagina en polaco directamente en el navegador, sin enviar texto a servidores externos.
- Sistemas de megafonia o anuncios automatizados en entornos fisicos (transporte, comercio) donde se requiere una voz polaca clara y de baja latencia.
- Prototipado rapido de interfaces conversacionales en polaco: el pipeline `TTSModelManager` permite cargar la voz y sintetizar en pocas lineas de Python.
- Generacion de audiolibros o contenido educativo en polaco a partir de texto plano, con la salvedad de que la calidad depende del fonemizador empleado.
- Pruebas de integracion en CI/CD de sistemas de voz: al ser ONNX y MIT, se puede validar el pipeline de TTS sin dependencias de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por el tamano del repositorio (~0,1 GB) se trata de un modelo muy ligero, apto para CPU.
- GPU recomendadas: no disponible; al ser un modelo VITS pequeno, no requiere GPU dedicada.
- Cabe en GPU consumer: si, cualquier GPU consumer moderna puede ejecutarlo; tambien funciona en CPU.
- Opciones de despliegue: `phoonnx` (Python), `phoonnx.js` (navegador), `ovos-tts-plugin-phoonnx` (OVOS/Mycroft). Requiere `espeak-ng` instalado o el extra `phoonnx[espeak]`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-pl_pl-justyna-espeak | VITS | pl | MIT | ONNX | Hugging Face, phoonnx |
| WitoldG/polish_piper_models (upstream) | VITS (Piper) | pl | no disponible en esta ficha | Piper | Hugging Face |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | MIT (segun coleccion) | ONNX | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de un solo idioma (polaco) y una sola voz; no admite otros idiomas ni seleccion de hablante.
- La calidad de pronunciacion depende del fonemizador: con espyak algunos fonemas difieren de espeak-ng y el modelo puede pronunciar mal ciertas palabras.
- Requiere `espeak-ng` instalado en el sistema o el extra `phoonnx[espeak]`; sin ello el pipeline falla.
- No hay informacion sobre sesgos del dataset de entrenamiento ni sobre el hablante original.
- Riesgo de alucinacion acustica (audio ininteligible o artefactos) ante texto fuera de dominio, simbolos o abreviaturas no normalizadas.
- Licencia MIT permite uso comercial, pero el model card remite a los terminos del release upstream (`WitoldG/polish_piper_models`), que no se detallan en esta ficha.
- No apto para clonacion de voz ni para control de prosodia o emocion.
- Repositorio con muy pocas descargas (22) y sin likes: ecosistema y validacion comunitaria limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-pl_pl-justyna-espeak
- Upstream: https://huggingface.co/WitoldG/polish_piper_models
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Referencia de arquitectura VITS: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
