# Phoonnx/vits-fr_fr-gilles-low-espeak

## Resumen

vits-fr_fr-gilles-low-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y reempaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo toma texto en frances de Francia (fr-FR) como entrada, lo convierte a fonemas mediante espeak-ng y genera audio de voz sintetizada. Su identificador interno en phoonnx es `piper/fr_FR-gilles-low`.

Se trata de una voz de calidad "low" (baja) dentro del catalogo de Piper, lo que implica un modelo compacto y rapido, pensado para entornos con recursos limitados, asistentes de voz embebidos y aplicaciones de sintesis en tiempo real. El repositorio ocupa aproximadamente 0,1 GB, lo que confirma su naturaleza ligera.

Su relevancia actual radica en que permite integrar sintesis de voz francesa en pipelines Python y en el ecosistema OVOS (Open Voice OS) sin depender de servicios en la nube, con licencia MIT y pesos en ONNX. No se dispone de informacion publica sobre el numero exacto de parametros ni sobre el volumen de datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de texto de longitud variable) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | frances de Francia (fr-FR) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Frontal de texto | espeak-ng (via `scriptconv_copyleft.phonemizers.mul.EspeakPhonemizer`) |
| Tamano del repositorio | ~0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de sintesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial entrenado con aprendizaje adversarial. VITS produce audio de forma directa a partir de fonemas, sin necesidad de un vocoder separado en tiempo de inferencia, lo que simplifica el despliegue. En este caso concreto, la entrada no es texto crudo sino fonemas en alfabeto IPA generados por espeak-ng.

El modelo procede de `rhasspy/piper-voices/fr/fr_FR/gilles/low`, es decir, es una voz del catalogo Piper etiquetada como de calidad baja. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el hablante de referencia (la voz "gilles") ni si se aplicaron tecnicas de RLHF o fine-tuning adicional. Phoonnx se limita a reempaquetar los pesos originales en ONNX y a documentar el frontal de texto; no se indica que haya reentrenado el modelo.

## Capacidades

- Sintesis de voz a partir de texto en frances de Francia (fr-FR), con salida en formato WAV.
- Conversion de texto a fonemas IPA mediante espeak-ng, lo que permite un control fonetico preciso.
- Generacion de audio en tiempo de ejecucion en Python mediante `phoonnx.model_manager.TTSModelManager`.
- Integracion como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`) configurable via `mycroft.conf`.
- Ejecucion en navegador mediante phoonnx.js (con entrada espeak o Unicode), segun la documentacion del proyecto.
- No se documentan capacidades de clonacion de voz, control de emocion, multilenguaje ni tool calling.

## Casos de uso

- Asistentes de voz embebidos en OVOS: el modelo se instala como plugin `ovos-tts-plugin-phoonnx` y se selecciona con la voz `piper/fr_FR-gilles-low`, permitiendo respuestas habladas en frances sin conexion a servicios externos.
- Lectura de notificaciones y alertas en frances: al ser un modelo ligero (~0,1 GB) y con licencia MIT, puede desplegarse en dispositivos de bajos recursos para leer mensajes del sistema o correos.
- Prototipado rapido de interfaces de voz en Python: con `pip install --pre phoonnx` y unas pocas lineas se genera un WAV, lo que acelera la validacion de ideas antes de invertir en voces de mayor calidad.
- Aplicaciones de accesibilidad: sintesis de texto a voz para personas con discapacidad visual en entornos franceses, con la ventaja de funcionar localmente y sin cuotas de API.
- Generacion de audio para pruebas automatizadas: en pipelines de CI/CD se puede usar para producir locuciones de prueba en frances de forma determinista y barata.
- Educacion y aprendizaje de idiomas: generacion de pronunciaciones de referencia en fr-FR a partir de fonemas espeak, util para materiales didacticos.
- Integracion web sin backend: mediante phoonnx.js el modelo puede ejecutarse en el navegador para demos interactivas de TTS en frances.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamano del repositorio (~0,1 GB) cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) es sobredimensionada para este modelo. La inferencia en CPU es viable.
- Cabe en GPU consumer: si, en todas las gamas actuales; tambien en dispositivos embebidos tipo Raspberry Pi.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, phoonnx.js en navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Calidad | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-fr_fr-gilles-low-espeak (este) | VITS | fr-FR | low | MIT | ONNX | Hugging Face (Phoonnx) |
| Otras voces Piper fr_FR (p. ej. medium/high en rhasspy/piper-voices) | VITS | fr-FR | medium/high | MIT (segun upstream) | ONNX | Hugging Face (Rhasspy) |
| Coqui TTS (voces VITS multilingues) | VITS / otros | multi | variable | MPL-2.0 (segun version) | varios | GitHub / Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento objetivo frente a estas alternativas; la comparacion se limita a parametros estructurales y disponibilidad.

## Limitaciones y advertencias

- Calidad "low": al proceder de la variante low de Piper, la naturalidad y fidelidad de la voz son inferiores a las variantes medium o high del mismo catalogo.
- Dependencia de espeak-ng: los fonemas deben generarse con espeak-ng; si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, segun advierte la propia model card.
- Un solo idioma: solo fr-FR; no soporta otros idiomas ni cambio de voz.
- Un solo hablante: la voz "gilles"; no se documenta clonacion ni multi-hablante.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede producir pronunciaciones incorrectas ante texto no normalizado, siglas o numeros mal convertidos por el frontal.
- Licencia MIT: permite uso comercial, pero se recomienda verificar la procedencia upstream (rhasspy/piper-voices) y las licencias de espeak-ng y scriptconv.
- Sin datos de sesgo: no se ha publicado informacion sobre sesgos de genero, acento o dialecto en la voz.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema muy reciente, con poca validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-fr_fr-gilles-low-espeak
- Upstream Piper voices (fr_FR/gilles/low): https://huggingface.co/rhasspy/piper-voices/tree/main/fr/fr_FR/gilles/low
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
