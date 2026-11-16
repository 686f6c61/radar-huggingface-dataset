# Phoonnx/vits-el_gr-cv-espeak

## Resumen

vits-el_gr-cv-espeak es un modelo de sintesis de voz (text-to-speech) de arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo convierte texto en griego moderno (el-GR) a audio inteligible, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su origen es el modelo `tts_models--el--cv--vits` de Coqui TTS v0.8.0, entrenado sobre el corpus Common Voice en griego.

El modelo resuelve el problema de la sintesis de voz para el griego moderno en entornos donde se prefiere una dependencia ligera y ONNX frente al stack completo de Coqui TTS. Su empaquetado por Phoonnx permite integrarlo en Python y en el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`, lo que lo hace relevante para asistentes de voz autoalojados y aplicaciones de accesibilidad en griego.

Se trata de un modelo VITS condicional de tamano contenido (repositorio de 0,1 GB), con licencia BSD-3-Clause y un front-end de texto basado en espeak-ng. No es un modelo de lenguaje generativo: es un sintetizador neuronal end-to-end que produce waveform directamente a partir de fonemas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS) |
| Tipos de cuantizacion | no disponible (pesos ONNX) |
| Idiomas soportados | griego moderno (el-GR) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |
| Autor original | Coqui |
| Empaquetado por | Phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz neuronal end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial durante el entrenamiento. Genera la forma de onda directamente sin necesidad de un vocoder externo, lo que simplifica el despliegue. El modelo aqui descrito es la version `tts_models--el--cv--vits` de Coqui TTS v0.8.0, entrenada sobre el corpus Common Voice en griego.

No se dispone de informacion detallada sobre el numero de horas de audio, la composicion exacta del dataset, ni sobre si se aplicaron tecnicas de fine-tuning adicionales o ajuste de prosodia. El front-end de texto no forma parte del modelo: phoonnx delega la normalizacion y la fonemizacion en la libreria scriptconv, que utiliza `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul` para producir fonemas IPA a partir de texto griego. Este diseno separa el procesamiento linguistico del acustico y permite sustituir el fonemizador sin reentrenar el modelo.

## Capacidades

- Sintesis de voz a partir de texto en griego moderno (el-GR).
- Generacion de audio en formato WAV mediante `synthesize_wav`.
- Entrada basada en fonemas espeak-ng en alfabeto IPA, lo que permite control fino de la pronunciacion si se proporcionan fonemas directamente.
- Integracion con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en Python a traves de `phoonnx.model_manager.TTSModelManager`.
- Soporte en navegador mediante phoonnx.js con entrada espeak o unicode.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso: es exclusivamente un sintetizador TTS.
- No es multilingue: solo griego moderno.

## Casos de uso

- Asistentes de voz autoalojados en griego: integrado en OVOS mediante `ovos-tts-plugin-phoonnx`, el modelo permite que un asistente domestico responda en griego moderno sin depender de servicios cloud. Su licencia BSD-3-Clause y su formato ONNX facilitan el despliegue en dispositivos locales.
- Accesibilidad para lectores de pantalla: el modelo puede convertir articulos, correos o documentos en griego a audio para usuarios con discapacidad visual, ejecutandose en local y evitando enviar texto sensible a terceros.
- Generacion de audiolibros y contenido narrado en griego: al aceptar fonemas IPA, permite corregir pronunciaciones problematicas de nombres propios o terminos tecnicos antes de sintetizar, lo que resulta util en produccion editorial.
- Sistemas de megafonia y avisos automatizados: para transporte publico, aeropuertos o edificios publicos en Grecia, el modelo genera anuncios pregrabados o dinamicos en griego con una huella de 0,1 GB que cabe en hardware modesto.
- Prototipado de interfaces conversacionales en griego: equipos que desarrollan chatbots de voz pueden usar el modelo como capa TTS durante el desarrollo, sustituyendolo despues por una voz comercial si necesitan mas calidad, sin cambiar la arquitectura del pipeline.
- Investigacion en sintesis de voz para lenguas de recursos medios: el modelo sirve como linea base reproducible para experimentos de prosodia, normalizacion textual o comparacion de fonemizadores (espeak-ng frente a espyak) en griego moderno.
- Pruebas de integracion continua de pipelines TTS: al ser ONNX y ligero, puede ejecutarse en contenedores de CI para verificar que los cambios en el front-end de texto no rompen la sintesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 0,1 GB, por lo que la huella de memoria es muy reducida y cabe holgadamente en GPUs de gama baja o incluso en CPU.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (RTX 3060, RTX 4090, A100, H100); para este tamano no se requiere hardware de gama alta.
- Cabe en GPU de consumo: si, practicamente cualquier GPU consumer moderna e incluso iGPU.
- Ejecucion en CPU: viable gracias al formato ONNX y al reducido tamano del modelo.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin OVOS `ovos-tts-plugin-phoonnx`, ONNX Runtime.
- Dependencia externa: espeak-ng debe estar instalado en el sistema (`apt install espeak-ng`) o bien usar el extra `phoonnx[espeak]`, que incluye el port espyak.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-el_gr-cv-espeak (este modelo) | VITS | Griego (el-GR) | 0,1 GB | BSD-3-Clause | ONNX | Hugging Face, phoonnx |
| Coqui `tts_models--el--cv--vits` (upstream) | VITS | Griego (el-GR) | no disponible | BSD-3-Clause | Checkpoint Coqui TTS | GitHub Releases Coqui TTS v0.8.0 |
| Otras voces VITS de la coleccion Phoonnx | VITS | Varios idiomas | variable | variable segun modelo | ONNX | Coleccion VITS de Phoonnx en Hugging Face |

La comparativa directa con otros sintetizadores griegos (por ejemplo, voces comerciales o modelos de otras familias como FastSpeech 2 o Tacotron 2) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre Common Voice, la voz puede reflejar la distribucion demografica y dialectal de los voluntarios que contribuyeron al corpus, con posible infrarepresentacion de ciertos acentos regionales griegos.
- Riesgo de alucinacion: en TTS se traduce en pronunciaciones incorrectas o prosodia antinatural, especialmente con palabras fuera de vocabulario, siglas o nombres propios; el uso de fonemas IPA manuales mitiga parcialmente este problema.
- Limitacion de idioma: solo griego moderno (el-GR); el texto en otros idiomas o con caracteres no griegos puede producir silencios, errores o audio ininteligible.
- Dependencia de espeak-ng: si se usa el port espyak en lugar de espeak-ng, algunos fonemas difieren y la voz puede pronunciar mal ciertas palabras, segun advierte el autor.
- Restricciones de licencia: BSD-3-Clause permite uso comercial con atribucion y sin endoso; es necesario conservar el aviso de copyright y la clausula de exencion de responsabilidad.
- Caveat para produccion: no se han publicado metricas objetivas (MOS, WER de sintesis) ni benchmarks, por lo que la calidad debe evaluarse empiricamente antes de desplegarlo.
- El modelo no incluye front-end de texto propio: requiere scriptconv y espeak-ng, lo que anade dependencias al pipeline.
- El numero de descargas (18) y de likes (0) es muy bajo, lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-el_gr-cv-espeak
- Modelo original de Coqui TTS: https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--el--cv--vits.zip
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
