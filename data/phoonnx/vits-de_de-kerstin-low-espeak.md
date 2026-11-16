# Phoonnx/vits-de_de-kerstin-low-espeak

## Resumen

vits-de_de-kerstin-low-espeak es un modelo de síntesis de voz (text-to-speech) de arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y reempaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo genera audio en alemán de Alemania (de-DE) a partir de texto, utilizando fonemas espeak en alfabeto IPA como entrada, lo que lo vincula estrechamente al ecosistema espeak-ng.

La relevancia de este modelo radica en su formato de despliegue: al estar empaquetado como ONNX y distribuido a través de phoonnx, está pensado para inferencia ligera y local, sin dependencias de frameworks pesados, y con integración directa en asistentes de voz basados en OVOS/Mycroft. Es una voz de calidad "low" dentro del catálogo de Piper, lo que implica un modelo compacto (repositorio de 0,1 GB) orientado a entornos con recursos limitados.

No se dispone de información pública sobre el número de parámetros, la longitud de contexto (no aplica en TTS) ni datos de entrenamiento más allá de su procedencia del repositorio rhasspy/piper-voices. El modelo se publicó en Hugging Face en noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el sufijo "low" indica variante de baja calidad/tamaño del catálogo Piper) |
| Idiomas soportados | alemán (de-DE) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Upstream | rhasspy/piper-voices/de/de_DE/kerstin/low |
| Autor original | Rhasspy |
| Empaquetado por | Phoonnx |
| Tamaño del repositorio | 0,1 GB |
| Librería | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un modelo generativo de extremo a extremo para síntesis de voz que combina un codificador de texto, un prior variacional y un decodificador generativo (típicamente basado en flujos normalizadores y un vocoder neuronal integrado). VITS permite generar audio de forma directa desde fonemas sin un vocoder separado en la etapa de inferencia, lo que simplifica el despliegue y reduce la latencia frente a pipelines en cascada.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino adicional. Se sabe que el modelo procede del repositorio rhasspy/piper-voices, en la ruta de/de_DE/kerstin/low, y que su front-end textual convierte el texto a fonemas espeak-ng (o al port espyak si se instala la extra correspondiente) antes de alimentar el modelo. El sufijo "low" indica que es una variante de baja calidad dentro del catálogo Piper, orientada a un menor tamaño y coste computacional.

## Capacidades

- Síntesis de voz (text-to-speech) en alemán de Alemania (de-DE) a partir de texto plano.
- Conversión de texto a fonemas espeak en alfabeto IPA mediante la librería scriptconv (phonemizer `EspeakPhonemizer`).
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integración con el ecosistema OVOS/Mycroft a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes, razonamiento multistep ni visión: es un modelo exclusivamente de TTS.
- Capacidad multilingüe limitada al alemán; no se documentan otras lenguas.

## Casos de uso

- Asistentes de voz locales: el modelo se integra en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`, permitiendo que un asistente doméstico responda en alemán sin depender de servicios en la nube, gracias a su formato ONNX ligero (0,1 GB).
- Síntesis en dispositivos de recursos limitados: al ser una voz "low" empaquetada en ONNX, es adecuada para Raspberry Pi u otros sistemas embebidos donde un modelo TTS de mayor tamaño no cabría en memoria.
- Lectura de notificaciones y alertas: se puede invocar `synthesize_wav` para convertir mensajes cortos en audio en aplicaciones de domótica o monitorización, con latencia baja por la arquitectura VITS de extremo a extremo.
- Generación de audiolibros o contenido pregrabado en alemán: el modelo permite procesar por lotes textos largos divididos en frases, generando WAVs que luego se concatenan.
- Accesibilidad: conversión de texto a voz para aplicaciones de lectura de pantalla o interfaces para personas con discapacidad visual en entornos de habla alemana.
- Pruebas y prototipado de pipelines TTS: al estar disponible en phoonnx y phoonnx.js, sirve para validar flujos de fonemización espeak-ng y síntesis en navegador o en Python antes de migrar a voces de mayor calidad.
- Integración en demos web: mediante phoonnx.js y la demo en tigregotico.pt/demo, se puede ofrecer síntesis en alemán directamente en el navegador sin backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,1 GB, por lo que el modelo cabe holgadamente en memoria de cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; al ser un modelo ONNX compacto, puede ejecutarse en CPU y en GPUs de gama baja (por ejemplo, GTX 1050 o superiores) sin problemas.
- Cabe en GPU consumer: sí, con un tamaño de repositorio de 0,1 GB es viable en cualquier GPU con al menos 1-2 GB de memoria libre, y también en CPU.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos TTS VITS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamaño | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-de_de-kerstin-low-espeak (este) | VITS | de-DE | 0,1 GB (repo) | MIT | ONNX | Hugging Face (Phoonnx) |
| Otras voces Piper de/de_DE (p. ej. thorsten, eva_k) | VITS | de-DE | variable según variante (low/medium/high) | MIT (según upstream) | ONNX | rhasspy/piper-voices |
| Voces VITS de la colección Phoonnx | VITS | varios | variable | MIT (según upstream) | ONNX | Colección VITS de Phoonnx |

No se dispone de datos de rendimiento (MOS, latencia, WER) para establecer una comparación cuantitativa con alternativas. La comparación se limita a parámetros estructurales y de licencia.

## Limitaciones y advertencias

- Es una voz de calidad "low" del catálogo Piper: la fidelidad y naturalidad del audio será inferior a las variantes medium o high.
- Dependencia de espeak-ng: si no se instala, phoonnx puede usar el port espyak, cuyos fonemas difieren y pueden provocar pronunciaciones incorrectas de algunas palabras.
- Solo soporta alemán (de-DE); no es multilingüe.
- Riesgo de pronunciación incorrecta en palabras extranjeras, siglas o neologismos por la fonemización automática con espeak.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos de voz de un hablante concreto (kerstin), la voz generada estará limitada a esa identidad vocal.
- Licencia MIT: permite uso comercial, pero se recomienda verificar la licencia del upstream (rhasspy/piper-voices) y de los datos de entrenamiento originales.
- No apta para tareas de razonamiento, generación de texto, código, visión ni agentes.
- Sin métricas publicadas de calidad (MOS) ni benchmarks que permitan evaluar su rendimiento objetivo.
- El modelo se publicó en noviembre de 2026 y no registra descargas ni likes, por lo que su validación por la comunidad es nula en el momento de la ficha.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-kerstin-low-espeak
- Upstream (Piper voices): https://huggingface.co/rhasspy/piper-voices/tree/main/de/de_DE/kerstin/low
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
