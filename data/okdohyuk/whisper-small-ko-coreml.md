# okdohyuk/whisper-small-ko-coreml

## Resumen

whisper-small-ko-coreml es un ajuste fino en coreano del modelo de reconocimiento automatico del habla openai/whisper-small, convertido al formato Core ML para su uso con WhisperKit de Argmax. Lo desarrolla el usuario okdohyuk y esta pensado para transcripcion de voz en coreano directamente en dispositivo (on-device), concretamente dentro de la aplicacion Nogmi. El modelo parte de la revision 973afd24965f72e36ca33b3055d56a652f456b4d de whisper-small y se ha convertido con whisperkittools en el commit 84f77a83c8f530022ae55fbb1a64b3351ef63c7a.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo de gran tamano, sino de un artefacto de despliegue optimizado para Apple Silicon (Neural Engine y GPU via Core ML) con un fine-tune ligero sobre datos publicos de coreano. Su interes practico esta en que ofrece transcripcion en coreano con una mejora medible de CER/WER frente al modelo original, manteniendo la licencia Apache-2.0 y un tamano de repositorio de 0,5 GB, lo que lo hace desplegable en movil.

El modelo conserva la arquitectura encoder-decoder transformer de Whisper small (alrededor de 244 millones de parametros en el modelo base, dato no verificado en la informacion proporcionada para este artefacto concreto) y una ventana de contexto de audio de 30 segundos por segmento, con decodificacion greedy en la evaluacion publicada. Es, por tanto, una pieza de infraestructura para ASR en coreano en produccion movil, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small), convertido a Core ML |
| Parametros totales | no disponible (el modelo base whisper-small ronda los 244 M, no confirmado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s por segmento) |
| Tipos de cuantizacion | no disponible (formato Core ML; no se detallan variantes de cuantizacion en la model card) |
| Idiomas soportados | coreano (ko); el fine-tune degrada drasticamente otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (.mlpackage), empaquetado para WhisperKit; repositorio de 0,5 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper small: un transformer encoder-decoder con atencion completa, disenado para transcripcion y traduccion de voz. El modelo se ha convertido a Core ML mediante whisperkittools para ejecutarse con WhisperKit en dispositivos Apple, lo que permite inferencia on-device aprovechando el Neural Engine. La model card indica que la conversion Core ML no introduce degradacion medible: el delta de CER entre Core ML y PyTorch es de +0,0 pp tanto en fleurs_ko_test como en cv17_ko_test.

El entrenamiento consistio en un fine-tune completo (full fine-tune) con learning rate 2,5e-06, 150 pasos, batch de 16x1 y un 18 % de replay multilingue procedente de FLEURS. Los datos de entrenamiento son tres corpus publicos con licencias compatibles con uso comercial: FLEURS (Google, CC-BY-4.0), Zeroth-Korean / OpenSLR 40 (Atlas Guide Inc. / Gridspace, CC-BY-4.0) y Mozilla Common Voice 17.0 en coreano via el espejo fsicoli/common_voice_17_0 (CC0-1.0). La model card declara explicitamente que no se usaron KsponSpeech, datos de AIHub ni grabaciones de usuarios. No se menciona RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Reconocimiento automatico del habla (ASR) en coreano, con salida de texto transcrito.
- Transcripcion de audio en ventanas de 30 segundos por segmento, segun el diseno de Whisper.
- Ejecucion on-device en plataformas Apple mediante Core ML y WhisperKit.
- Mejora de precision en coreano respecto al modelo base: CER de 5,848 frente a 7,596 en FLEURS ko test, y WER de 14,927 frente a 21,191.
- No soporta tool calling ni function calling (es un modelo ASR, no un LLM conversacional).
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue practicamente nula tras el fine-tune: el CER en ingles sube a 95,329 y en japones a 112,419.
- No dispone de modo thinking, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Transcripcion de voz en coreano en aplicaciones iOS: el modelo esta empaquetado en Core ML y pensado para WhisperKit, por lo que se integra directamente en apps moviles que necesiten dictado o notas de voz sin enviar audio a la nube. Es el caso de uso original (app Nogmi).
- Subtitulado y transcripcion de reuniones cortas en coreano: con ventanas de 30 segundos por segmento, encaja en pipelines que troceen el audio en fragmentos y concatenen las transcripciones, con la salvedad de que la verificacion de formato largo se ha omitido en esta release.
- Procesamiento por lotes de corpus de voz en coreano: util para generar transcripciones de FLEURS, Common Voice o Zeroth con un CER en torno al 5,8-9,5 % segun el conjunto, adecuado para anotacion asistida o mineria de datos.
- Asistentes de voz offline para usuarios coreanoparlantes: al ejecutarse on-device, permite construir interfaces de voz que funcionan sin conectividad y sin exponer el audio del usuario a servidores externos.
- Investigacion en ASR de bajo recurso: sirve como punto de partida o baseline para fine-tunes en coreano, dado su bajo coste de entrenamiento (150 pasos) y su licencia permisiva.
- Evaluacion comparativa de conversiones Core ML: el modelo documenta el delta de CER entre PyTorch y Core ML (+0,0 pp), lo que lo convierte en una referencia util para validar pipelines de conversion con whisperkittools.
- Accesibilidad en dispositivos Apple: transcripcion en tiempo real de dictado para usuarios con movilidad reducida, aprovechando el Neural Engine y el tamano reducido del artefacto (0,5 GB).

## Benchmarks y rendimiento

Resultados publicados en la model card sobre conjuntos held-out (CER/WER en %, NFKC, sin puntuacion ni espacios para CER; decodificacion greedy). La columna "original" corresponde a openai/whisper-small re-medido con el mismo script.

| Conjunto | CER original | CER este modelo | WER original | WER este modelo |
|---|---|---|---|---|
| fleurs_ko_test | 7,596 | 5,848 | 21,191 | 14,927 |
| cv17_ko_test | 14,438 | 9,472 | 34,658 | 25,525 |
| zeroth_ko_test | 10,255 | 6,750 | 33,609 | 25,132 |
| fleurs_en_test | 3,125 | 95,329 | 6,913 | 139,061 |
| fleurs_ja_test | 13,348 | 112,419 | 88,586 | 445,455 |

Delta Core ML frente a PyTorch: +0,0 pp de CER en fleurs_ko_test y +0,0 pp en cv17_ko_test.

## Requisitos de hardware

- Inferencia on-device en dispositivos Apple con soporte de Core ML (iPhone, iPad, Mac con Apple Silicon); el modelo esta empaquetado como .mlpackage para WhisperKit.
- VRAM/RAM estimada: no disponible de forma explicita; el repositorio ocupa 0,5 GB, lo que sugiere un footprint de memoria del orden de cientos de MB en el dispositivo.
- GPU recomendadas: no aplica en el sentido de GPU de datacenter; el destino es el Neural Engine y la GPU integrada de Apple Silicon.
- Cabe en hardware de consumo: si, en iPhone, iPad y Mac con chip Apple (M1 en adelante) mediante Core ML.
- Opciones de despliegue: WhisperKit (Argmax) sobre Core ML; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| okdohyuk/whisper-small-ko-coreml | no disponible (base whisper-small) | no disponible (ventanas de 30 s) | coreano | Apache-2.0 | Core ML (.mlpackage) | Fine-tune coreano con mejora de CER/WER; pensado para WhisperKit |
| openai/whisper-small | ~244 M (no confirmado en la informacion) | ventanas de 30 s | multilingue | Apache-2.0 | safetensors / PyTorch | Modelo base; CER en coreano de 7,596 en fleurs_ko_test |
| robertteleng/whisper-small-coreml | no disponible | no disponible | multilingue | no disponible | Core ML (.mlpackage) + safetensors | Conversion de formato de whisper-small para iOS, sin fine-tune en coreano |
| okdohyuk/whisperkit-coreml | no disponible | no disponible | no disponible | no disponible | Core ML | Repositorio de conversiones WhisperKit del mismo autor; contenido no detallado en la informacion |

## Limitaciones y advertencias

- El fine-tune degrada severamente el rendimiento en idiomas distintos del coreano: CER de 95,329 en ingles y 112,419 en japones, frente a 3,125 y 13,348 del modelo original. No debe usarse como modelo multilingue.
- La verificacion de regresion en audio de formato largo (tipo reunion) se omitio en esta release por falta de un conjunto interno; el comportamiento en audios largos no esta validado.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto plausible en segmentos con silencio o ruido; no se documentan mitigaciones especificas.
- Sesgos: los datos de entrenamiento (FLEURS, Zeroth, Common Voice) pueden no representar toda la variacion dialectal del coreano; no se detallan analisis de sesgo.
- Restriccion de licencia de datos: los terminos de Common Voice prohiben intentar determinar la identidad de los hablantes del conjunto de datos.
- Uso comercial permitido por Apache-2.0 en los pesos, con atribucion obligatoria a los datos CC-BY-4.0 (FLEURS y Zeroth) segun NOTICE.md.
- El modelo esta atado al ecosistema Apple/Core ML; no es directamente utilizable en infraestructura x86 o CUDA sin reconvertir.
- No hay datos publicados de latencia, throughput ni consumo energetico en dispositivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/okdohyuk/whisper-small-ko-coreml
- Modelo base: https://huggingface.co/openai/whisper-small
- Repositorio de conversiones del autor: https://huggingface.co/okdohyuk/whisperkit-coreml
- WhisperKit (Argmax): https://github.com/argmaxinc/WhisperKit
- whisperkittools: https://github.com/argmaxinc/whisperkittools
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset Zeroth-Korean (OpenSLR 40): https://www.openslr.org/40/
- Dataset Common Voice: https://commonvoice.mozilla.org
- Conversion Core ML de referencia: https://huggingface.co/robertteleng/whisper-small-coreml
