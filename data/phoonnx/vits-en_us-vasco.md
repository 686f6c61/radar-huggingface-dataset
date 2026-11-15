# Phoonnx/vits-en_us-vasco

## Resumen

vits-en_us-vasco es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo original procede de poisson-fish, que lo publicó como parte de su colección de voces Piper (`piper-vasco`); Phoonnx lo redistribuye en formato ONNX listo para consumir desde Python y desde el ecosistema OVOS. La voz está etiquetada como `en-US`, es decir, inglés estadounidense, y el identificador "vasco" hace referencia al nombre de la voz, no al idioma.

El modelo resuelve la conversión de texto a audio en pipelines ligeros: recibe texto en inglés, lo normaliza y lo convierte a fonemas mediante espeak-ng (alfabeto IPA) y genera la forma de onda correspondiente. Su tamaño de repositorio es de 0,1 GB, lo que lo sitúa en la franja de modelos TTS compactos aptos para ejecución en CPU y en dispositivos con recursos limitados.

Su relevancia actual es acotada pero concreta: encaja en asistentes de voz autoalojados (OVOS/Mycroft), en aplicaciones de lectura en voz alta y en prototipos que necesitan TTS sin depender de servicios en la nube. La licencia MIT y el formato ONNX facilitan su integración, aunque la información publicada sobre calidad, datos de entrenamiento y métricas es muy escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech, extremo a extremo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz extremo a extremo que combina un codificador de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial durante el entrenamiento; el resultado es un modelo que genera audio directamente desde fonemas sin necesidad de un vocoder separado. En este caso, el modelo se distribuye ya exportado a ONNX, por lo que la inferencia se realiza sobre el grafo exportado y no sobre los pesos originales de PyTorch.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el número de horas de audio utilizadas ni sobre si se aplicaron técnicas de alineamiento o ajuste fino posteriores. El modelo original lo publicó poisson-fish dentro de su colección Piper, y Phoonnx se limita a empaquetarlo para su propia librería; la model card no documenta detalles del proceso de entrenamiento. La única innovación destacable documentada es el uso de espeak-ng como front-end fonémico, con la advertencia de que el port espyak puede diferir en algunos fonemas y producir errores de pronunciación.

## Capacidades

- Síntesis de voz en inglés estadounidense (en-US) a partir de texto plano.
- Conversión de texto a fonemas IPA mediante espeak-ng o, alternativamente, mediante el port espyak incluido en el extra `phoonnx[espeak]`.
- Generación de audio en formato WAV a través de la API `synthesize_wav` de phoonnx.
- Integración como plugin de TTS en OVOS mediante `ovos-tts-plugin-phoonnx`, seleccionable en `mycroft.conf`.
- Ejecución en navegador mediante phoonnx.js, con entrada espeak o unicode.
- No dispone de tool calling, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento; es exclusivamente un modelo TTS.
- Multilingüismo: limitado a en-US; no se documentan otras lenguas.

## Casos de uso

- Asistentes de voz autoalojados: integración en OVOS/Mycroft como módulo TTS mediante `ovos-tts-plugin-phoonnx`, configurando la voz `piper_community/poisson-fish/en-US_vasco` en `mycroft.conf` para respuestas habladas en inglés sin depender de servicios externos.
- Lectura en voz alta de documentos: conversión de texto plano a WAV con `voice.synthesize_wav(text, wav_file)`, adecuada para generar audiolibros o versiones accesibles de artículos en inglés.
- Prototipado de interfaces conversacionales: al ser un modelo de 0,1 GB en ONNX, permite iterar rápidamente en local sobre diálogos en inglés antes de invertir en voces comerciales.
- Síntesis en el navegador: mediante phoonnx.js se puede ejecutar la voz en cliente con entrada espeak o unicode, útil para demos web y aplicaciones de accesibilidad sin backend de TTS.
- Generación de avisos y notificaciones pregrabadas: automatización de mensajes de sistema en inglés (alertas, confirmaciones) en pipelines por lotes que producen ficheros WAV.
- Pruebas de regresión de pipelines TTS: servir como voz de referencia ligera para validar el front-end fonémico (espeak-ng frente a espyak) y detectar diferencias de pronunciación antes de desplegar otras voces Piper.
- Entornos con recursos limitados: al ser ONNX y de tamaño reducido, puede ejecutarse en CPU en dispositivos embebidos o en contenedores sin GPU para tareas de síntesis de baja concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0,1 GB) es plausible la ejecución en CPU, pero no se documentan requisitos oficiales.
- GPU recomendadas: no disponible; no se especifican GPU concretas (A100, H100, RTX 4090 u otras).
- Compatibilidad con GPU de consumo: no confirmada en la documentación; el formato ONNX permite en principio ejecución en CPU y en GPU compatibles con ONNX Runtime, sin datos oficiales.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS y phoonnx.js en navegador. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| vits-en_us-vasco (Phoonnx) | VITS | en-US | ONNX | MIT | Empaquetado para phoonnx; 0,1 GB de repo |
| poisson-fish/piper-vasco (upstream) | VITS | en-US | ONNX | MIT (segun upstream) | Origen del modelo empaquetado; misma voz |
| Otras voces Piper para en-US | VITS | en-US | ONNX | variable segun voz | Colección Piper; no se dispone de datos comparativos de calidad |

No se dispone de datos de rendimiento (MOS, RTF, WER de fonemas) para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (en-US); no es multilingüe.
- El front-end fonémico depende de espeak-ng; si se usa el port espyak, algunos fonemas difieren y la voz puede pronunciar mal ciertas palabras, según advierte la propia model card.
- No se documentan sesgos concretos, pero al ser un modelo entrenado sobre datos no especificados, puede reproducir sesgos de pronunciación o prosodia del corpus original.
- Riesgo de alucinación no aplica en el sentido de generación de texto; sin embargo, puede producir pronunciaciones incorrectas o prosodia artificial en palabras fuera de dominio, siglas y nombres propios.
- No se documentan límites de longitud de entrada ni comportamiento con textos muy largos.
- La licencia es MIT, lo que permite uso comercial, pero la model card remite a los términos de la publicación upstream, que no se detallan en la información disponible.
- El modelo está empaquetado para phoonnx; usarlo fuera de esa librería requiere gestionar manualmente el grafo ONNX y el front-end fonémico.
- No hay métricas publicadas de calidad (MOS) ni de rendimiento, por lo que la evaluación en producción debe hacerse empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-vasco
- Upstream (poisson-fish/piper-vasco, ONNX): https://huggingface.co/poisson-fish/piper-vasco/tree/main/onnx
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
