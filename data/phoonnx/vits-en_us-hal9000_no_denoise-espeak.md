# Phoonnx/vits-en_us-hal9000_no_denoise-espeak

## Resumen

vits-en_us-hal9000_no_denoise-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado en formato ONNX para su uso con la librería phoonnx. El modelo original fue creado por el usuario dividebysandwich dentro del repositorio piper-voice-models, y Phoonnx se encarga de distribuirlo con el formato y las dependencias necesarias para su ejecución en Python y en el ecosistema OVOS (Open Voice OS). Se trata de una voz concreta, no de un modelo fundacional: reproduce un timbre específico, en este caso la voz "HAL9000-no-denoise", orientada a inglés estadounidense.

El modelo resuelve el problema de disponer de una voz TTS ligera y ejecutable localmente sin depender de servicios en la nube, con un tamaño de repositorio de tan solo 0,1 GB. La entrada de texto no es texto plano directo, sino fonemas generados por espeak-ng en alfabeto IPA, lo que exige instalar dicho programa o bien el extra de phoonnx que incluye el port espyak. Es relevante para desarrolladores que construyen asistentes de voz, lectores de pantalla o sistemas embebidos que necesitan síntesis de voz offline con licencia MIT.

La ficha se centra en los datos disponibles en la model card y en los metadatos de Hugging Face. No se han publicado detalles sobre el número de parámetros, la composición del dataset de entrenamiento ni resultados de benchmarks, por lo que esos apartados se marcan explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de ejecucion | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado con aprendizaje adversario. El objetivo es generar formas de onda directamente a partir de fonemas, sin necesidad de un vocoder externo separado en tiempo de inferencia. El modelo empaquetado se distribuye en formato ONNX, lo que permite ejecución portable en CPU y GPU a través de phoonnx.

No se dispone de información sobre el número de tokens de audio utilizados, la composición del dataset, el hablante de origen ni si se aplicaron técnicas de fine-tuning o adaptación. El nombre del modelo indica que se entrenó sin paso de denoising ("no_denoise"), pero la model card no detalla qué implica exactamente esa elección en el pipeline de entrenamiento. La entrada se realiza mediante fonemas espeak-ng, lo que sitúa la normalización textual y la fonemización fuera del modelo, en la librería scriptconv.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (en-US).
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Fonemización de entrada mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`).
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecución local en Python y en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje, al ser un modelo TTS puro.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz locales en OVOS: el plugin `ovos-tts-plugin-phoonnx` permite seleccionar esta voz en `mycroft.conf` para que un asistente doméstico genere respuestas habladas sin conexión a Internet, aprovechando el tamaño reducido del modelo (0,1 GB).
- Lectura de textos en aplicaciones de accesibilidad: integración en lectores de pantalla o herramientas de dictado que necesitan convertir texto en audio en tiempo real en una máquina de escritorio, con la voz HAL9000 como alternativa de timbre.
- Generación de avisos y notificaciones en sistemas embebidos: al ejecutarse en formato ONNX y con un repositorio de 0,1 GB, puede desplegarse en dispositivos con recursos limitados para anuncios pregrabados o dinámicos.
- Síntesis por lotes de contenido en inglés: conversión de artículos, documentación o guiones a audio WAV mediante un script Python que recorra los textos y llame a `voice.synthesize_wav`.
- Pruebas de integración en pipelines de CI: verificar que la fonemización espeak-ng y la carga del modelo ONNX funcionan correctamente en distintos entornos antes de desplegar un asistente de voz.
- Demos web de TTS en el navegador: mediante phoonnx.js y la demo pública en tigregotico.pt/demo, se puede ofrecer una muestra interactiva de la voz sin instalar nada en el cliente.
- Prototipado de interfaces conversacionales: usar la voz para validar la experiencia de usuario de un producto de voz antes de invertir en un modelo TTS comercial o en un clon de voz personalizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un repositorio de 0,1 GB en ONNX, el modelo es muy ligero y probablemente quepa en GPUs de gama baja o incluso en CPU.
- GPU recomendadas: no disponibles; al ser un modelo TTS pequeño, no requiere A100 ni H100. Cualquier GPU consumer con soporte ONNX Runtime debería ser suficiente.
- ¿Cabe en GPU consumer? Sí, previsiblemente en cualquier GPU consumer moderna (RTX 3060, RTX 4060, etc.) e incluso en CPU, dado el tamaño del repositorio.
- Opciones de despliegue: phoonnx (Python), ovos-tts-plugin-phoonnx (OVOS), phoonnx.js (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS VITS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Tamano repo | Notas |
|---|---|---|---|---|---|---|
| vits-en_us-hal9000_no_denoise-espeak | VITS | en-US | MIT | ONNX | 0,1 GB | Voz HAL9000 sin denoising, entrada espeak |
| Otras voces de la coleccion VITS de Phoonnx | VITS | variable | variable (segun autor) | ONNX | variable | Misma libreria phoonnx, distintas voces |
| Modelos Piper originales | VITS | multiples | MIT (mayoria) | ONNX | variable | Predecesores de las voces empaquetadas por Phoonnx |

No se dispone de datos de rendimiento (MOS, latencia, WER) para establecer una comparación cuantitativa con alternativas. La comparación se limita a parámetros estructurales y de licencia.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (en-US); no se documentan otros idiomas.
- La entrada debe ser fonemas espeak-ng en IPA; si se usa el port espyak en lugar de espeak-ng, algunos fonemas difieren y la voz puede pronunciar mal ciertas palabras, según advierte la model card.
- Al ser una voz concreta y no un modelo fundacional, no admite adaptación a otros hablantes ni estilos sin reentrenamiento.
- No se documentan sesgos, pero al ser una voz sintética de un personaje (HAL9000) puede no ser adecuada para todos los contextos de marca o accesibilidad.
- Riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero sí puede haber errores de pronunciación en palabras fuera del vocabulario o con fonemización incorrecta.
- La licencia MIT permite uso comercial, pero la model card remite a los términos del release upstream (dividebysandwich/piper-voice-models); conviene verificar dichos términos antes de un despliegue comercial.
- No se documentan requisitos de hardware ni latencias, por lo que el rendimiento en producción debe medirse empíricamente.
- El modelo fue creado y actualizado en noviembre de 2026 según los metadatos, con 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy limitada y ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-hal9000_no_denoise-espeak
- Repositorio upstream (dividebysandwich/piper-voice-models, HAL9000-no-denoise): https://github.com/dividebysandwich/piper-voice-models/tree/main/HAL9000-no-denoise
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
