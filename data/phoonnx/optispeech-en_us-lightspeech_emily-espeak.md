# Phoonnx/optispeech-en_us-lightspeech_emily-espeak

## Resumen

OptiSpeech en_us Lightspeech Emily es un modelo de síntesis de voz (text-to-speech) en inglés estadounidense, empaquetado por Phoonnx a partir del modelo original de mush42 publicado en la colección OptiSpeech. Se distribuye en formato ONNX y está pensado para ejecutarse con la librería phoonnx, una biblioteca de TTS basada en ONNX Runtime que integra el modelo en el ecosistema OVOS (Open Voice OS). La voz se identifica internamente como `hf_community/mush42/optispeech-lightspeech-en-us-emily`.

El modelo emplea la arquitectura OptiSpeech con un decodificador Lightspeech y recibe como entrada fonemas en alfabeto IPA generados por espeak-ng, no texto crudo. Esta separación entre front-end fonémico y modelo acústico permite un control preciso de la pronunciación, pero exige instalar espeak-ng (o el port espyak) como dependencia del sistema. El tamaño del repositorio es de 0,0 GB según los metadatos de Hugging Face, lo que sugiere un modelo compacto orientado a inferencia ligera en CPU.

Su relevancia actual radica en su carácter práctico: es un modelo pequeño, con licencia MIT, que se puede desplegar localmente sin GPU y sin dependencias de servicios en la nube, lo que lo hace adecuado para asistentes de voz embebidos, sistemas domóticos y aplicaciones de accesibilidad que requieran síntesis de voz offline en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OptiSpeech con decodificador Lightspeech (ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; el autor no detalla variantes) |
| Idiomas soportados | inglés estadounidense (en-US) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Autor original | mush42 |
| Empaquetado por | Phoonnx |
| Libreria | phoonnx |
| Tamano del repositorio | 0,0 GB (metadatos de Hugging Face) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo sigue la arquitectura OptiSpeech con un decodificador Lightspeech, exportado a ONNX para su ejecución con ONNX Runtime a través de phoonnx. No se han publicado en la información proporcionada detalles sobre el número de parámetros, la composición del dataset de entrenamiento, el número de tokens de audio procesados ni si se emplearon técnicas de RLHF, DPO o fine-tuning específico. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

La particularidad arquitectónica destacable es el front-end fonémico: el texto se normaliza mediante la librería scriptconv y se convierte a fonemas IPA con `EspeakPhonemizer` (del extra `scriptconv[espeak]`). El modelo acústico recibe directamente esos fonemas, lo que desacopla la normalización lingüística del modelado acústico y permite sustituir el fonemizador sin reentrenar la red. El modelo original procede del repositorio `mush42/optispeech/onnx/lightspeech/en-us`.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (en-US).
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Entrada basada en fonemas IPA generados por espeak-ng, lo que permite control fino de la pronunciación si se proporcionan fonemas directamente.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecución local en CPU mediante ONNX Runtime, sin necesidad de GPU.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo TTS, no un LLM).
- No soporta visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada al inglés estadounidense.

## Casos de uso

- Asistentes de voz embebidos en OVOS: el modelo se integra como plugin TTS nativo (`ovos-tts-plugin-phoonnx`) y permite dotar de voz a un asistente doméstico local sin depender de APIs en la nube, con la configuración de voz en `mycroft.conf`.
- Sistemas de domótica y altavoces inteligentes offline: al ejecutarse en ONNX Runtime sobre CPU, se puede desplegar en dispositivos de bajos recursos (Raspberry Pi, mini-PC) para anuncios y confirmaciones por voz sin conexión a internet.
- Accesibilidad y lectores de pantalla: síntesis de texto a voz para aplicaciones de lectura asistida en inglés, con pronunciación controlada mediante fonemas espeak-ng cuando se requiere precisión en términos técnicos o nombres propios.
- Generación de audiolibros y contenido narrado: producción por lotes de archivos WAV a partir de texto en inglés, usando la API de phoonnx en scripts de Python para automatizar la conversión.
- Pruebas y desarrollo de pipelines TTS: al ser un modelo pequeño con licencia MIT, sirve como base para experimentar con front-ends fonémicos alternativos (sustituyendo espeak-ng por espyak u otro fonemizador) y evaluar el impacto en la calidad de síntesis.
- Prototipado de interfaces conversacionales: integración en aplicaciones de escritorio o web (mediante un backend Python con phoonnx) para dar respuestas habladas en inglés en demos y pruebas de concepto, sin coste de inferencia en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo se ejecuta en ONNX Runtime y está orientado a CPU, por lo que no requiere VRAM dedicada.
- GPU recomendadas: no se especifican; al ser un modelo compacto (repositorio de 0,0 GB), no necesita GPU. Cualquier GPU compatible con ONNX Runtime (CUDA o DirectML) podría acelerar la inferencia, pero no hay datos publicados.
- ¿Cabe en GPU consumer? Sí, con margen amplio, dado el tamaño reducido del repositorio; cualquier GPU consumer moderna es sobradamente suficiente, aunque el caso de uso previsto es CPU.
- Opciones de despliegue: phoonnx (Python) con ONNX Runtime; plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS).
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Dependencia de sistema: es necesario instalar espeak-ng (`apt install espeak-ng`) o el extra `phoonnx[espeak]` (port espyak) para la fonemización.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables de otros modelos TTS en la información proporcionada. Como referencia cualitativa, se puede comparar con otras voces empaquetadas en la misma colección OptiSpeech de Phoonnx, que comparten arquitectura y formato pero difieren en idioma y decodificador:

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| optispeech-en_us-lightspeech_emily-espeak | OptiSpeech + Lightspeech | en-US | ONNX | MIT | Hugging Face (Phoonnx) |
| Otras voces de la colección OptiSpeech | OptiSpeech (variantes) | varios | ONNX | MIT (según upstream) | Hugging Face (Phoonnx) |
| Alternativas TTS comerciales (p. ej. servicios cloud) | no disponible | multiidioma | API | propietaria | servicios cloud |

No se dispone de datos de rendimiento (MOS, latencia, WER) para establecer una comparación cuantitativa con alternativas como Piper, Coqui TTS o VITS.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (en-US); no es multilingüe.
- Requiere espeak-ng instalado en el sistema o el port espyak; este último puede pronunciar mal algunas palabras porque sus fonemas difieren de los de espeak-ng, según advierte la propia model card.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos no especificados, puede presentar sesgos de pronunciación en nombres propios, acrónimos o términos regionales.
- Riesgo de alucinación acústica: como todo modelo TTS, puede generar prosodia incorrecta o pronunciaciones erróneas en texto ambiguo, siglas o palabras fuera del vocabulario fonémico.
- El tamaño del repositorio es de 0,0 GB según los metadatos, lo que puede indicar que los pesos no están incluidos en el repositorio o que la medición es imprecisa; conviene verificar la descarga real antes de desplegar.
- Licencia MIT declarada por el upstream (mush42/optispeech), lo que permite uso comercial, pero se recomienda verificar la licencia en el repositorio original antes de producción.
- No hay datos publicados de calidad (MOS), latencia ni throughput, por lo que no se puede garantizar un rendimiento concreto en producción.
- El modelo está empaquetado para phoonnx; usarlo fuera de esa librería requiere gestionar manualmente el front-end fonémico (scriptconv + espeak-ng) y la ejecución ONNX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/optispeech-en_us-lightspeech_emily-espeak
- Modelo original (upstream): https://huggingface.co/mush42/optispeech/tree/main/onnx/lightspeech/en-us
- Colección OptiSpeech de Phoonnx: https://huggingface.co/collections/Phoonnx/optispeech-6af8ea9492a4f8f4e0f1cf30
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
