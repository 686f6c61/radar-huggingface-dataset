# Phoonnx/vits-tdt_tl-joao-espeak

## Resumen

vits-tdt_tl-joao-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería ONNX homónima. El modelo original procede del autor raphaelmerx, dentro del repositorio de voces Piper (raphaelmerx/piper-voices), en la ruta `tdt/tdt_TL/joao/medium`. Se trata, por tanto, de una voz concreta (identificada como "joao") para la variante lingüística `tdt-TL`, distribuida en formato ONNX para inferencia ligera.

El modelo resuelve la conversión de texto a audio para esa variante idiomática, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su relevancia radica en que permite integrar TTS de forma sencilla en Python y en el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, con un tamaño de repositorio reducido (0,1 GB) y licencia MIT.

No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica en TTS) ni datos de entrenamiento en la documentación proporcionada. La ficha se limita, por tanto, a lo que el autor y el empaquetador documentan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | `tdt-TL` (variante identificada como tdt, subvariante TL) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de síntesis de voz de extremo a extremo que combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial en su entrenamiento. La entrada de texto se procesa mediante fonemización con espeak-ng en alfabeto IPA; el front-end de phoonnx delega la normalización y conversión a la librería `scriptconv`, usando `EspeakPhonemizer` del módulo `scriptconv_copyleft.phonemizers.mul` (extra `scriptconv[espeak]`).

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de las propias de VITS. El modelo se distribuye como un artefacto ONNX empaquetado, no como pesos de entrenamiento.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en la variante `tdt-TL`.
- Entrada basada en fonemas espeak-ng en alfabeto IPA.
- Integración en Python mediante `phoonnx.model_manager.TTSModelManager`.
- Integración en el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador a través de `phoonnx.js`, con entrada espeak o unicode (según la documentación del proyecto relacionado).
- No se documentan capacidades de clonación de voz, control de estilo, emoción ni multilingüismo más allá del idioma indicado.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y se selecciona en `mycroft.conf` mediante la voz `piper_community/raphaelmerx/tdt-TL_joao`, permitiendo respuestas habladas en la variante `tdt-TL`.
- Síntesis por lotes en Python: usando `TTSModelManager` y `voice.synthesize_wav(text, wav_file)` se pueden generar ficheros WAV de forma programática para audiolibros, avisos o contenido pregrabado.
- Síntesis en el navegador: mediante `phoonnx.js` y la demo en tigregotico.pt/demo, se puede ofrecer TTS del lado del cliente sin backend, útil para aplicaciones web accesibles.
- Lectura de textos en aplicaciones de accesibilidad: al ser un modelo ONNX ligero (repo de 0,1 GB), puede ejecutarse en entornos con recursos limitados para convertir texto a voz en pantalla.
- Generación de avisos y locuciones: para sistemas de megafonía, interfaces de voz o contenidos educativos en la variante `tdt-TL`, con la ventaja de una licencia MIT que facilita su redistribución.
- Integración en pipelines de preproducción de audio: la salida WAV permite encadenar el modelo con herramientas de postproceso (normalización, mezcla) en flujos automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, lo que sugiere un modelo pequeño que probablemente cabe en GPU consumer, pero no se confirma en la documentación.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada explícitamente; por el tamaño del artefacto es plausible, pero no se documenta.
- Opciones de despliegue: `phoonnx` (Python), plugin OVOS `ovos-tts-plugin-phoonnx`, y `phoonnx.js` en navegador. No se mencionan vLLM, llama.cpp ni TGI (no aplican a TTS VITS).
- Latencia y throughput: no disponibles.
- Requisito adicional: es necesario instalar espeak-ng (`apt install espeak-ng`) o el extra `phoonnx[espeak]`; sin él, la fonemización no funciona correctamente.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vits-tdt_tl-joao-espeak | VITS | `tdt-TL` | MIT | ONNX | Voz "joao" empaquetada para phoonnx |
| Otras voces Piper (raphaelmerx/piper-voices) | VITS | Diversas variantes | Según release upstream | ONNX | Mismo origen; esta es una voz concreta del repositorio |
| Modelos de la colección VITS de Phoonnx | VITS | Diversas | Según cada modelo | ONNX | Empaquetados para la misma librería |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Idioma restringido a la variante `tdt-TL`; no se documenta soporte multilingüe.
- La calidad de pronunciación depende de espeak-ng: con el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, según advierte el autor.
- Sin datos publicados sobre sesgos, alucinaciones (no aplica en el mismo sentido que en LLM, pero sí posibles artefactos de audio) ni evaluación objetiva de calidad.
- La licencia MIT facilita el uso comercial, pero el autor remite a los términos del release upstream; conviene verificar la cadena de licencias del repositorio Piper original.
- No se documentan requisitos de hardware ni latencia, lo que dificulta planificar despliegues en producción.
- El número de descargas (17) y de likes (0) es muy bajo, lo que sugiere poca validación por parte de la comunidad.
- El modelo es un artefacto empaquetado, no un modelo entrenado por Phoonnx; la responsabilidad sobre los datos de entrenamiento recae en el autor upstream.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-tdt_tl-joao-espeak
- Upstream (Piper voices): https://huggingface.co/raphaelmerx/piper-voices/tree/main/tdt/tdt_TL/joao/medium
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
