# DontHash/neptrans-v4-ct2

## Resumen

NepTrans v4 es un modelo de reconocimiento automático del habla (ASR) especializado en nepalí e inglés, incluyendo conversaciones con cambio de idioma (*code-switching*) entre ambos. Lo desarrolla el usuario DontHash como un ajuste fino mediante LoRA sobre `openai/whisper-large-v3`, la arquitectura encoder-decoder de OpenAI de aproximadamente 1.550 millones de parámetros, y se distribuye aquí en formato CTranslate2 ya fusionado y cuantizado en `int8_float16` (fichero principal de unos 1,55 GB).

El problema que aborda es concreto: Whisper large-v3, pese a su cobertura multilingüe, rinde de forma irregular en nepalí y, sobre todo, en habla que alterna nepalí e inglés, un patrón habitual en contextos técnicos, académicos y urbanos de Nepal. El ajuste LoRA se entrenó con 21.470 clips (49,094 horas) que combinan habla conversacional resegmentada y lectura de OpenSLR-54, con módulos LoRA de rango 16 sobre las proyecciones de atención y las capas fully connected del modelo base.

Su relevancia práctica está en el empaquetado: al ser un export CTranslate2 completo, se ejecuta con `faster-whisper` sin descargar el modelo base ni montar PEFT, lo que simplifica el autohospedaje en CPU o en GPU modesta (la verificación de la release se hizo con una RTX 2050 de 4 GiB). La licencia Apache 2.0 y la ausencia de dependencia de un servicio en la nube lo hacen apto para despliegues locales con datos sensibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3, transformer encoder-decoder (seq2seq) para ASR |
| Parametros totales | Aproximadamente 1,55B (modelo base Whisper large-v3) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos por pasada (16 kHz, 128 bins mel); sin contexto de texto extenso |
| Tipos de cuantizacion | Pesos almacenados en `int8_float16`; en CPU se usa `int8`; CTranslate2 convierte la representacion segun el `compute_type` solicitado |
| Idiomas soportados | Nepalí (`ne`) e inglés (`en`), incluido cambio de idioma dentro de la misma conversacion |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (`model.bin` + `config.json`, `tokenizer.json`, `preprocessor_config.json` y vocabularios); no se distribuyen safetensors ni GGUF |
| Tarea | Reconocimiento automatico del habla / transcripcion |
| Modelo base | `openai/whisper-large-v3` (revision `06f233fe06e710322aca913c1bc4249a0d71fce1`) |
| Metodo de ajuste | LoRA, rango 16, alpha 32, dropout 0,05; modulos `q_proj`, `k_proj`, `v_proj`, `out_proj`, `fc1`, `fc2` |
| Caracteristicas de audio | 16 kHz, 128 bins mel |
| Release | `v4.0.0`, 20 de octubre de 2026 |
| Tamano del repositorio | 1,6 GB (pesos principales ~1,55 GB / 1,45 GiB) |
| Libreria | `ctranslate2`, consumible con `faster-whisper` 1.2.1 y `ctranslate2` 4.8.1 |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3: un encoder que procesa espectrogramas mel de 128 bandas sobre ventanas de 30 segundos y un decoder autorregresivo que genera tokens de transcripcion con marcas de tiempo. El ajuste no modifica la topologia, sino que inyecta adaptadores LoRA de rango 16 y alpha 32 con dropout 0,05 en las proyecciones de query, key, value y salida de la atencion, ademas de las dos capas fully connected del bloque, y posteriormente fusiona los pesos en un export CTranslate2 cuantizado en `int8_float16`.

El manifiesto de entrenamiento de la v4 contiene 21.470 clips y 49,094 horas, repartidas en 8.075 clips (aproximadamente 34,09 horas) de habla conversacional nepalí y nepalí-inglesa resegmentada y 13.395 clips (aproximadamente 15,00 horas) de habla leida nepalí curada procedente de OpenSLR-54. El desglose por lengua del manifiesto indica 14.473 clips solo en nepalí y 6.613 clips de lengua mixta; el resto del desglose aparece truncado en la informacion disponible. No se documentan en la informacion proporcionada fases de RLHF o DPO, ni el numero total de tokens o epochs.

## Capacidades

- Transcripcion de audio en nepalí, en inglés y en habla que alterna ambos idiomas dentro de la misma grabacion.
- Deteccion automatica de idioma sobre los primeros 30 segundos del audio, o seleccion manual del idioma (`language="ne"`, `language="en"`) para forzar escritura y comportamiento de reconocimiento.
- Generacion de marcas de tiempo por segmento (`segment.start`, `segment.end`), utiles para subtitulado.
- Soporte de modo `transcribe` (y, por herencia de Whisper, la tarea de traduccion al ingles del pipeline, aunque no se documenta como objetivo del ajuste).
- Decodificacion configurable: `beam_size` (el ejemplo de la model card usa 1), `condition_on_previous_text`, VAD y otros parametros de `faster-whisper`.
- Ejecucion local en CPU (`int8`) y en GPU NVIDIA (`int8_float16`) mediante CTranslate2, sin llamadas a servicios externos.
- Uso offline completo tras la descarga, con `local_files_only=True`.
- No se documentan capacidades de tool calling, agentes, vision, audio generation ni modo de razonamiento explicito; es exclusivamente un modelo ASR.

## Casos de uso

- Transcripcion de entrevistas y grupos focales en nepalí con intervenciones en inglés: la ventana de 30 segundos y el ajuste sobre habla conversacional permiten procesar turnos de habla coloquial, generando segmentos con timestamps para su posterior revision humana.
- Subtitulado de videos y material formativo: la salida por segmentos con marcas de tiempo se integra en pipelines de subtitulado (SRT/WebVTT) para contenido tecnico donde aparecen terminos en inglés dentro de frases en nepalí.
- Notas de reunion y actas en entornos de desarrollo de software en Nepal: el modelo esta pensado para conversaciones que mezclan nepalí e inglés, un patron habitual en equipos tecnicos, y puede ejecutarse en el propio portatil del usuario.
- Dictado de borradores y apuntes: la model card lo orienta explicitamente a "draft notes" que una persona revisa antes de usarlos, apropiado para documentacion interna o correos.
- Investigacion en linguistica y ASR de code-switching: al publicarse tanto el adaptador LoRA (`DontHash/neptrans-v4-lora`) como el export CTranslate2, sirve como punto de partida para experimentos con PEFT o para seguir ajustando con datos propios.
- Procesamiento por lotes en servidor autoalojado: al cargarse dentro del propio proceso de la aplicacion con `faster-whisper`, se puede integrar en una API interna o en una cola de trabajos, con control propio de red, autenticacion, almacenamiento y concurrencia.
- Transcripcion con requisitos de privacidad: audio clinico, legal o de RRHH en el que no se quiere enviar el material a una API externa; todo el procesamiento ocurre en el runtime local elegido.
- Transcripcion offline en campo: con la descarga previa del repositorio y ejecucion en CPU, se puede desplegar en equipos sin conectividad ni GPU dedicada, aceptando mayor latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de WER, CER ni comparaciones cuantitativas con otros sistemas; unicamente describe una verificacion funcional de la release en Windows, con una NVIDIA RTX 2050 de 4 GiB en `int8_float16` y en CPU con `int8`, sobre clips cortos, sin garantia de VRAM minima ni de latencia o tiempo real para cargas arbitrarias.

| Benchmark | Resultado |
|---|---|
| WER / CER en nepalí o code-switching | No disponible |
| Comparacion con Whisper large-v3 sin ajuste | No disponible |
| Latencia y throughput medidos | No disponible |

## Requisitos de hardware

- VRAM: los pesos ocupan aproximadamente 1,55 GB en `int8_float16`; el consumo total es superior por activaciones, `beam_size`, tamano de lote y duracion del audio. No se publica una cifra minima de VRAM.
- Verificacion oficial de la release: GPU NVIDIA RTX 2050 con 4 GiB de VRAM (`int8_float16`) y CPU con `int8`; se trata de una comprobacion funcional con clips cortos, no de una garantia para todas las cargas.
- GPU recomendadas: no se especifican en la informacion disponible. Cualquier GPU NVIDIA con soporte de CUDA 12 y cuDNN 9 puede ejecutar CTranslate2; no se aportan datos de A100, H100 ni RTX 4090.
- GPU de consumo: si, el modelo cabe en GPUs de gama de entrada segun la verificacion con 4 GiB; en CPU requiere RAM del sistema suficiente, con velocidad generalmente inferior y sin garantia de tiempo real.
- Despliegue: `faster-whisper` 1.2.1 sobre `ctranslate2` 4.8.1, con `device="cuda", compute_type="int8_float16"` o `device="cpu", compute_type="int8"`. No aplica llama.cpp ni Ollama, al no distribuirse en GGUF. Incluye un script `transcribe.py` en el repositorio con salida de texto o JSON de segmentos.
- Dependencias: para GPU es necesario instalar los runtimes de CUDA 12 y cuDNN 9 por separado; instalar solo los paquetes de Python puede no ser suficiente.
- Latencia y throughput: no disponibles. Dependen de `beam_size`, lote, duracion del audio y concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| NepTrans v4 CT2 (este modelo) | ~1,55B | 30 s por ventana | `ne`, `en` (con code-switching) | Apache 2.0 | CTranslate2 `int8_float16`, listo para `faster-whisper` |
| `openai/whisper-large-v3` (base) | ~1,55B | 30 s por ventana | Multilingue (sin ajuste especifico a nepalí) | Apache 2.0 | Safetensors / Transformers; requiere conversion para CTranslate2 |
| `DontHash/neptrans-v4-lora` (adaptador) | ~1,55B base + adaptador LoRA r16 | 30 s por ventana | `ne`, `en` | Apache 2.0 | Adaptador PEFT; necesita descargar el modelo base y montar Transformers/PEFT |

No se dispone en la informacion proporcionada de otros sistemas ASR especificos para nepalí (por ejemplo, modelos entrenados desde cero o alternativas comerciales) con los que establecer una comparacion de parametros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- No hay resultados publicados de WER/CER: el rendimiento real en dominios distintos de los datos de entrenamiento (49,094 horas, con 15 horas de habla leida de OpenSLR-54) es desconocido.
- La deteccion de idioma no es deteccion de code-switching a nivel de palabra: con la llamada estandar de `faster-whisper` se decide usando los primeros 30 segundos del audio, por lo que un audio que empieza en un idioma y cambia despues puede verse afectado.
- Elegir `language="ne"` o `language="en"` altera la escritura y el comportamiento del reconocimiento; conviene evaluar ambas opciones con grabaciones propias.
- Riesgo de alucinacion propio de la familia Whisper (repeticiones, texto inventado en silencios o ruido), especialmente con `condition_on_previous_text=True`; el ejemplo del autor lo desactiva.
- Al ser un ajuste fino sobre Whisper large-v3, hereda los sesgos de los datos del modelo base y de los corpus empleados (habla leida y conversacional de procedencia limitada), sin que se documente un analisis de sesgos por genero, dialecto o region.
- Cobertura limitada a nepalí e inglés; no se garantiza el comportamiento en otros idiomas ni en variedades dialectales del nepalí no representadas.
- La licencia Apache 2.0 permite uso comercial, pero exige conservar los avisos de copyright y licencia y no garantiza ningun tipo de soporte; el modelo se distribuye sin endpoint alojado ni SLA.
- En CPU la inferencia es mas lenta y consume RAM del sistema; no se ofrece garantia de tiempo real ni de VRAM/RAM minima.
- Apropiado para borradores y transcripciones sujetas a revision humana; no se recomienda como unica fuente en contextos legales, medicos o administrativos sin verificacion.

## Enlaces

- Modelo en HuggingFace (CTranslate2): https://huggingface.co/DontHash/neptrans-v4-ct2
- Adaptador LoRA original: https://huggingface.co/DontHash/neptrans-v4-lora
- Codigo fuente y guia de autohospedaje: https://github.com/DontHash/neptrans-asr
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Repositorio de faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Guia de instalacion GPU de faster-whisper: https://github.com/SYSTRAN/faster-whisper#gpu
- Paper de Whisper (arXiv:2212.04356): https://arxiv.org/abs/2212.04356
