# Phoonnx/vits-de_de-kantodel

## Resumen

vits-de_de-kantodel es un modelo de síntesis de voz (text-to-speech) en alemán, basado en la arquitectura VITS y empaquetado en formato ONNX para su uso con la librería phoonnx, desarrollada por TigreGotico. El modelo original, kantodel, fue creado por el autor nullnullvier y posteriormente adaptado por Phoonnx para su integración en el ecosistema phoonnx y OVOS (Open Voice OS).

El modelo resuelve la tarea de convertir texto en alemán (de-DE) a audio hablado de forma local y ligera. Su entrada de texto se procesa mediante fonemas espeak en alfabeto IPA, lo que permite un control preciso de la pronunciación. El repositorio ocupa aproximadamente 0,1 GB, lo que lo hace adecuado para despliegues en entornos con recursos limitados.

Es relevante para desarrolladores que necesitan un motor TTS offline, integrable en asistentes de voz o sistemas embebidos, con licencia MIT y soporte tanto en Python como en navegador mediante phoonnx.js. No se dispone de información sobre el tamaño en parámetros ni sobre la longitud de contexto, ya que no son datos aplicables o publicados para este tipo de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | alemán (de-DE) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un modelo generativo de extremo a extremo para síntesis de voz que combina un codificador de texto, un prior variacional y un decodificador basado en flujos normalizadores y un vocoder HiFi-GAN integrado. VITS es conocida por generar audio de alta calidad de forma no autorregresiva y en una sola pasada, lo que reduce la latencia frente a arquitecturas en dos etapas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El modelo original fue entrenado por nullnullvier; Phoonnx se limita a empaquetarlo en ONNX y a definir el front-end de texto mediante espeak-ng y la librería scriptconv, que normaliza el texto y lo convierte en fonemas IPA.

## Capacidades

- Síntesis de voz a partir de texto en alemán (de-DE).
- Entrada basada en fonemas espeak en alfabeto IPA, lo que permite un control fino de la pronunciación.
- Generación de audio en formato WAV mediante la API de phoonnx.
- Integración con OVOS mediante el plugin ovos-tts-plugin-phoonnx.
- Ejecución en navegador mediante phoonnx.js, con demo en vivo.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento, ya que se trata de un modelo TTS especializado.

## Casos de uso

- Asistentes de voz locales: el modelo puede integrarse en OVOS para leer respuestas en alemán sin depender de servicios en la nube, gracias a su formato ONNX ligero y licencia MIT.
- Lectura de textos en aplicaciones de accesibilidad: puede convertir documentos o notificaciones en audio para usuarios con discapacidad visual, ejecutándose localmente en el dispositivo.
- Sistemas embebidos y dispositivos de bajo consumo: al ocupar aproximadamente 0,1 GB y usar ONNX, puede desplegarse en hardware con recursos limitados para anuncios o avisos por voz.
- Síntesis en navegador: mediante phoonnx.js, permite generar voz en aplicaciones web sin backend, útil para demos interactivas o herramientas educativas.
- Generación de audio para contenido multimedia: puede producir narraciones en alemán para vídeos, podcasts o audiolibros de forma automatizada.
- Pruebas de pronunciación y fonética: al aceptar fonemas IPA, permite experimentar con variantes de pronunciación para investigación lingüística o docencia del alemán.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa aproximadamente 0,1 GB, por lo que el modelo es muy ligero y probablemente cabe en CPU.
- GPU recomendadas: no disponible; al ser un modelo TTS pequeño en ONNX, no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño reducido del repositorio, aunque no se dispone de datos oficiales.
- Opciones de despliegue: phoonnx (Python), ovos-tts-plugin-phoonnx (OVOS) y phoonnx.js (navegador).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-de_de-kantodel | VITS | de-DE | ONNX | MIT | Hugging Face (Phoonnx) |
| Piper (voces de-DE) | VITS | de-DE | ONNX | MIT | Hugging Face / Piper |
| Coqui TTS (modelos de-DE) | VITS / Tacotron2 | de-DE | varios | MPL-2.0 / otras | Coqui / Hugging Face |

No se dispone de datos de rendimiento comparativo (MOS, latencia) en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; al ser un modelo TTS, puede heredar sesgos prosódicos o de pronunciación del dataset original.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero puede producir pronunciaciones incorrectas en palabras fuera del vocabulario o con fonemas espeak inexactos.
- Limitaciones de idioma: solo soporta alemán (de-DE); no se dispone de información sobre otras variantes dialectales.
- Dependencia de espeak-ng: sin espeak-ng instalado, phoonnx puede usar espyak, cuyos fonemas difieren y pueden provocar errores de pronunciación.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero debe verificarse la licencia del modelo upstream (nullnullvier/kantodel), también declarada como MIT.
- Caveats para producción: no se dispone de información sobre estabilidad, calidad de audio (MOS) ni latencia; conviene validar el modelo en el entorno de destino antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-kantodel
- Modelo upstream: https://huggingface.co/nullnullvier/kantodel
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
