# Phoonnx/vits-es_mx-ald-medium-espeak

## Resumen

vits-es_mx-ald-medium-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo convierte texto en fonemas mediante espeak-ng y genera audio en español de México (`es-MX`) con una voz concreta identificada como `ald` en calidad `medium`. Su propósito es ofrecer TTS neuronal ligero, ejecutable localmente y sin dependencias de servicios en la nube.

El modelo procede del repositorio `rhasspy/piper-voices`, una colección de voces Piper ampliamente utilizada en asistentes de voz de código abierto. Phoonnx lo redistribuye en formato ONNX con su propia API de Python y un plugin para OVOS (OpenVoiceOS), lo que facilita su integración en asistentes domésticos y sistemas embebidos. El repositorio ocupa aproximadamente 0,1 GB, lo que refleja un modelo compacto orientado a inferencia en CPU.

Su relevancia radica en la combinación de licencia MIT, tamaño reducido y soporte nativo de fonemización con espeak-ng, lo que lo hace adecuado para despliegues en hardware modesto, aplicaciones offline y pipelines de TTS en producción donde la latencia y el coste por inferencia son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | es-MX (español de México) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura generativa que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas GAN y de reconstrucción. Esto permite generar waveforms directamente desde texto sin un vocoder separado, con calidad natural y control de prosodia mediante duraciones predichas.

El modelo concreto deriva de la voz `es_MX/ald/medium` del proyecto Piper de Rhasspy, entrenada sobre datos de habla en español mexicano. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o ajuste fino adicional. La innovación práctica del empaquetado Phoonnx es la integración de un front-end de texto basado en `scriptconv`, que normaliza el texto y lo convierte a fonemas espeak antes de la inferencia, y la exposición del modelo como ONNX ejecutable en Python y en navegador mediante phoonnx.js.

## Capacidades

- Síntesis de voz a partir de texto en español de México (`es-MX`).
- Generación de audio en formato WAV mediante la API `synthesize_wav`.
- Fonemización con espeak-ng (alfabeto IPA) a través de `scriptconv`.
- Integración como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- Ejecución local en CPU mediante ONNX, sin dependencia de GPU.
- Soporte de inferencia en navegador mediante phoonnx.js (con entrada espeak o unicode).
- Normalización de texto y conversión de script mediante `scriptconv`.
- No soporta tool calling, agentes, visión ni razonamiento multi-paso: es un modelo exclusivamente TTS.

## Casos de uso

- Asistentes de voz domésticos en OVOS: el modelo se selecciona en `mycroft.conf` como módulo TTS y proporciona respuestas habladas en español mexicano con latencia baja en CPU, adecuado para dispositivos tipo Raspberry Pi.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: al ser un modelo ONNX de ~0,1 GB, puede empaquetarse dentro de una app de escritorio y generar audio offline sin conexión.
- Sistemas de accesibilidad para personas con discapacidad visual: la síntesis local garantiza privacidad y funcionamiento sin red, con voces en español de México para lectores de pantalla.
- Generación de audiolibros o contenido narrado por lotes: el modelo puede invocarse desde scripts de Python para convertir grandes volúmenes de texto en WAV, aunque la calidad `medium` limita su uso a contenido no crítico.
- Prototipado de interfaces conversacionales: desarrolladores que necesitan un TTS rápido para demos de chatbots o IVR pueden integrarlo vía `phoonnx` sin coste de API.
- Pruebas de pipelines de TTS en CI: al ser determinista y ligero, sirve para validar integraciones de fonemización espeak y generación de audio en entornos de integración continua.
- Aplicaciones web con TTS en el navegador: mediante phoonnx.js y la demo de TigreGotico, se puede ofrecer síntesis de voz en el cliente sin backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en modo CPU; en GPU, el modelo ONNX de ~0,1 GB requiere menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (RTX 4090, A100, H100) puede ejecutarlo, pero el modelo está optimizado para CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPU.
- Cabe en CPU: sí, es el modo de despliegue previsto; requiere espeak-ng instalado (`apt install espeak-ng`) o el extra `phoonnx[espeak]`.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, phoonnx.js en navegador, ONNX Runtime.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vits-es_mx-ald-medium-espeak | VITS | es-MX | MIT | ONNX | Empaquetado Phoonnx, voz Piper `ald` medium |
| Otras voces Piper es_MX (rhasspy/piper-voices) | VITS | es-MX | MIT | ONNX | Mismo origen, distintas voces y calidades |
| Modelos TTS neuronales comerciales (p. ej. APIs cloud) | variable | multi | propietaria | API | No ejecutables localmente, coste por uso |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente TTS: no realiza razonamiento, generación de texto ni otras tareas.
- Calidad `medium`: la naturalidad y prosodia son inferiores a modelos TTS de mayor tamaño o a soluciones comerciales.
- Dependencia de espeak-ng: sin él, la fonemización puede fallar o requerir el port espyak, cuyos fonemas difieren y pueden producir palabras mal pronunciadas.
- Cobertura limitada a español de México; no soporta otros idiomas ni variantes dialectales.
- Riesgo de pronunciación incorrecta en palabras extranjeras, siglas o neologismos no cubiertos por espeak.
- Licencia MIT permite uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento originales de Piper.
- Sin datos publicados de sesgos, alucinaciones (no aplica en TTS) ni evaluaciones objetivas de calidad (MOS).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema muy reciente y poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-es_mx-ald-medium-espeak
- Upstream Piper: https://huggingface.co/rhasspy/piper-voices/tree/main/es/es_MX/ald/medium
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
