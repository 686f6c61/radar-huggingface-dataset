# Smartavis/taus-modeller

## Resumen

Taus-modeller es un paquete de modelos empaquetado como archivo Apple Archive (LZFSE) que contiene dos componentes destinados a la app iOS Taus: una conversion a Core ML del modelo de reconocimiento de voz NbAiLab/nb-whisper-medium-verbatim (en precision de 16 bits) y los modelos de diarizacion de hablantes de SpeakerKit, construidos sobre pyannote. El objetivo es permitir transcripcion y separacion de hablantes completamente en el dispositivo, sin enviar audio ni texto a ningun servidor. El autor del empaquetado es Smartavis; los pesos originales proceden del Nasjonalbiblioteket (NB-Whisper) y de Argmax (SpeakerKit).

El modelo subyacente es un Whisper medium adaptado al noruego (bokmal y nynorsk) en variante "verbatim", es decir, transcribe literalmente incluyendo muletillas y repeticiones en lugar de normalizar el texto. La conversion a Core ML se realizo con whisperkittools y no altera los pesos mas alla del cambio de formato y precision. El repositorio ocupa 1,5 GB y esta pensado para descarga unica en el dispositivo, no para inferencia en servidor.

Es relevante para desarrolladores que necesiten ASR privado en ecosistema Apple (iPhone, iPad, Mac) con soporte de diarizacion y para quienes quieran reutilizar el pipeline de conversion Whisper a Core ML con modelos noruegos. No es un modelo de lenguaje generativo ni un modelo multimodal: es exclusivamente un sistema de reconocimiento de voz con separacion de hablantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) convertido a Core ML; diarizacion basada en pyannote via SpeakerKit |
| Parametros totales | no disponible (el modelo base es Whisper medium; el numero exacto de parametros no se indica en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio tipica de Whisper medium, no confirmada en la informacion) |
| Tipos de cuantizacion | pesos convertidos a Core ML en 16 bits (16-bit); no se documentan otras cuantizaciones |
| Idiomas soportados | noruego: `no`, `nb` (bokmal), `nn` (nynorsk) |
| Licencia | Apache 2.0 (NB-Whisper) y CC BY 4.0 (SpeakerKit); el empaquetado se declara como `apache-2.0-and-cc-by-4.0` |
| Formato de pesos | Core ML dentro de Apple Archive (LZFSE); tokenizer y configuracion copiados del modelo original |
| Tamano del repositorio | 1,5 GB |
| Modelo base | NbAiLab/nb-whisper-medium-verbatim |
| Libreria | whisperkit |
| SHA-256 del archivo | `c6260b90256e29192a37bdcbda96be48b8941641ba5c6b0dd5413c3e15c512ea` |

## Arquitectura y entrenamiento

La parte ASR es una conversion directa de NbAiLab/nb-whisper-medium-verbatim, un Whisper medium ajustado por el Nasjonalbiblioteket para noruego en modo verbatim. La conversion se realizo con `whisperkit-generate-model` de whisperkittools y, segun la model card, los pesos no se modificaron mas alla del cambio a Core ML en 16 bits; los archivos de tokenizer y configuracion se copiaron del modelo original. No se documentan en la informacion proporcionada detalles sobre el dataset de entrenamiento original, el numero de tokens ni si hubo RLHF o DPO en el modelo base.

La parte de diarizacion corresponde a los modelos de SpeakerKit de Argmax, construidos sobre pyannote.audio (Herve Bredin y otros), que incluyen segmentacion de hablantes y embeddings de voz ("stemmeavtrykk"). El paquete se distribuye como un archivo `.aar` (Apple Archive con compresion LZFSE) con dos carpetas: `nb-whisper-medium-verbatim/` y `talerskille/`. No se describe ninguna innovacion adicional como decodificacion especulativa o atencion lineal.

## Capacidades

- Transcripcion de voz (ASR) en noruego bokmal y nynorsk, con estilo verbatim (incluye muletillas y repeticiones tal como se pronuncian).
- Diarizacion de hablantes: separacion de intervenciones por hablante mediante SpeakerKit.
- Generacion de embeddings o "huellas" de voz para identificar hablantes.
- Ejecucion completamente local en dispositivo Apple, sin envio de audio ni texto a servidores.
- Integracion con WhisperKit para inferencia en apps iOS/macOS.
- No se documentan capacidades de traduccion, tool calling, agentes, vision ni audio generativo.

## Casos de uso

- Transcripcion de reuniones en noruego en el propio iPhone: la app descarga el paquete una vez y transcribe el audio localmente, adecuado por privacidad y por funcionar sin conexion.
- Actas de entrevistas con multiples participantes: la diarizacion de SpeakerKit permite atribuir cada fragmento a un hablante, util en periodismo o investigacion cualitativa.
- Subtitulado de contenido audiovisual noruego: la salida verbatim sirve como base para subtitulos que reflejan el habla real.
- Notas de voz clinicas o legales: al no salir el audio del dispositivo, encaja en entornos con requisitos de confidencialidad.
- Investigacion linguistica sobre bokmal y nynorsk hablados: la transcripcion literal conserva fenomenos del habla espontanea que otros modelos normalizan.
- Apps de accesibilidad auditiva: transcripcion en tiempo real de conversaciones presenciales en el telefono.
- Identificacion de hablantes en grabaciones de campo: los embeddings de voz permiten agrupar segmentos por persona sin infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Dispositivo Apple con soporte de Core ML y suficiente almacenamiento: el paquete ocupa 1,5 GB en disco.
- Inferencia en iPhone/iPad/Mac mediante WhisperKit; no se documentan requisitos minimos de chip ni de memoria.
- No aplica VRAM de GPU dedicada (NVIDIA); el despliegue es en Neural Engine/CPU/GPU de Apple a traves de Core ML.
- Opciones de despliegue: WhisperKit (Core ML) para ASR y SpeakerKit para diarizacion; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no son aplicables a este formato).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Smartavis/taus-modeller | Whisper medium + diarizacion | no, nb, nn | Core ML (Apple Archive) | Apache 2.0 + CC BY 4.0 | Paquete para app iOS, inferencia local |
| NbAiLab/nb-whisper-medium-verbatim | Whisper medium | no, nb, nn | safetensors / PyTorch | Apache 2.0 | Modelo base original, sin conversion Core ML ni diarizacion |
| argmaxinc/speakerkit-coreml | Diarizacion pyannote | no especificado | Core ML | CC BY 4.0 | Componente de diarizacion incluido en el paquete |
| Whisper medium original (OpenAI) | Whisper medium | multilingue | PyTorch / varios | MIT | No especializado en noruego verbatim |

## Limitaciones y advertencias

- Solo cubre noruego (`no`, `nb`, `nn`); no es multilingue.
- El estilo verbatim puede producir transcripciones con muletillas y repeticiones que no son adecuadas si se busca texto normalizado.
- El paquete esta atado al ecosistema Apple (Core ML, Apple Archive LZFSE); no es directamente usable en Linux o Windows sin conversion adicional.
- La licencia es mixta: Apache 2.0 para NB-Whisper y CC BY 4.0 para SpeakerKit, lo que exige atribucion a Nasjonalbiblioteket, Argmax y pyannote en usos derivados.
- No se documentan tasas de error (WER), sesgos ni evaluaciones de robustez en la informacion proporcionada.
- Riesgo de alucinacion tipico de Whisper en audio con ruido o silencios largos; no cuantificado en esta ficha.
- Verificar el SHA-256 del archivo antes de desplegarlo para garantizar integridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Smartavis/taus-modeller
- Modelo base: https://huggingface.co/NbAiLab/nb-whisper-medium-verbatim
- SpeakerKit Core ML: https://huggingface.co/argmaxinc/speakerkit-coreml
- Herramienta de conversion whisperkittools: https://github.com/argmaxinc/whisperkittools
- pyannote.audio: https://github.com/pyannote/pyannote-audio
