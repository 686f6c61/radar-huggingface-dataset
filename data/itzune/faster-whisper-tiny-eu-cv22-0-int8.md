# itzune/faster-whisper-tiny-eu-cv22.0-int8

## Resumen

`faster-whisper-tiny-eu-cv22.0-int8` es una conversion de formato y cuantizacion del modelo de reconocimiento automatico del habla (ASR) `zuazo/whisper-tiny-eu-cv22.0`, un fine-tune de `openai/whisper-tiny` para euskera entrenado sobre Common Voice 22.0. El autor, `itzune`, no modifica los pesos: unicamente los convierte al formato CTranslate2 y los cuantiza a int8 mediante `ct2-transformers-converter`, lo que reduce el modelo a 41 MB y lo hace ejecutable en CPU.

El modelo resuelve un problema muy concreto: disponer de un motor ASR de euskera ligero y desplegable en entornos con recursos limitados, en particular Home Assistant mediante la app Whisper y el pipeline Assist. Frente al modelo original en formato Transformers, esta version elimina la dependencia de PyTorch en inferencia y aprovecha las optimizaciones de `faster-whisper` (CTranslate2) para CPU, con soporte de instrucciones AVX2.

Se trata de un modelo de nicho: arquitectura Whisper tiny (del orden de 39 M de parametros en el modelo base, no confirmado en la informacion disponible para este fine-tune), un unico idioma (`eu`) y contexto de audio de 30 segundos, caracteristico de la familia Whisper. Su relevancia es practica: es la opcion mas ligera de la cadena de fine-tunes de euskera de Zuazo y permite ASR local sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) convertido a CTranslate2 |
| Parametros totales | no disponible (el modelo base `openai/whisper-tiny` tiene ~39 M; no confirmado para este fine-tune) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; Whisper procesa ventanas de audio de 30 s |
| Tipos de cuantizacion | int8 (unica variante publicada en este repo) |
| Idiomas soportados | euskera (`eu`) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (modelo convertido; incluye `tokenizer.json`, `preprocessor_config.json`, `generation_config.json`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper en su variante tiny: un transformer encoder-decoder con atencion completa, disenado para transcripcion de audio en ventanas de 30 segundos. El fine-tune de euskera (`zuazo/whisper-tiny-eu-cv22.0`) se entreno sobre el split `eu` de Common Voice 22.0. No se dispone en la informacion proporcionada de detalles sobre numero de tokens, composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO; la model card remite a la model card del modelo fuente para el WER reportado.

La aportacion de este repositorio es exclusivamente de ingenieria de despliegue: la conversion con `ct2-transformers-converter --quantization int8` y la copia de los ficheros de tokenizador y configuracion. Los pesos son identicos a los del modelo fuente. CTranslate2 aporta inferencia optimizada en CPU, con mejor rendimiento en procesadores con AVX2, y elimina la necesidad de cargar PyTorch en produccion.

## Capacidades

- Transcripcion de voz a texto en euskera (`eu`) con deteccion de idioma disponible, aunque el autor recomienda fijar `language="eu"` porque la deteccion automatica es considerablemente mas lenta.
- Salida con marcas de tiempo por segmento y probabilidad de idioma (`info.language_probability`).
- Decodificacion con beam search configurable (`beam_size=5` en el ejemplo del autor).
- Inferencia en CPU con cuantizacion int8, sin GPU.
- Integracion nativa con Home Assistant mediante la app Whisper y el pipeline Assist.
- Integracion programatica con la libreria `faster-whisper` (API `WhisperModel.transcribe`).
- No soporta tool calling, funciones de agente, vision, audio generativo ni modos de razonamiento extendido: es un modelo ASR puro.

## Casos de uso

- Asistente de voz domestico en Home Assistant: configurando `language: eu`, `model: custom` y `custom_model: itzune/faster-whisper-tiny-eu-cv22.0-int8`, el pipeline Assist transcribe comandos de voz en euskera en local, sin enviar audio a la nube. Es adecuado por su tamano de 41 MB y su ejecucion en CPU.
- Transcripcion por lotes de audios cortos en euskera: con `faster-whisper` y `compute_type="int8"` en CPU, se pueden procesar ficheros WAV de hasta 30 segundos por ventana en servidores sin GPU.
- Subtitulado de contenido audiovisual en euskera: la salida por segmentos con marcas de tiempo permite generar subtitulos SRT a partir de la transcripcion.
- Prototipado rapido de aplicaciones de voz en euskera: al no requerir GPU ni PyTorch, reduce el coste de infraestructura en fases de validacion.
- Despliegue en dispositivos de borde o mini-PC: el modelo cabe en memoria sin problema y funciona en CPU con AVX2, lo que permite ejecutarlo en hardware de bajo consumo.
- Investigacion sobre ASR de bajos recursos: sirve como linea base ligera para comparar fine-tunes de euskera o evaluar el impacto de la cuantizacion int8 frente al modelo original.
- Integracion en pipelines de accesibilidad: transcripcion de notas de voz o mensajes de audio en euskera dentro de aplicaciones web o moviles con backend en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite explicitamente a la model card del modelo fuente (`zuazo/whisper-tiny-eu-cv22.0`) para el WER reportado, y no incluye cifras propias de esta conversion int8.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal (CPU); el modelo pesa 41 MB en int8 y su huella en memoria es del orden de decenas de MB, muy por debajo de cualquier GPU consumer.
- GPU recomendadas: no disponibles ni necesarias; el autor indica ejecucion en CPU. Cualquier GPU compatible con CTranslate2 podria ejecutarlo, pero no se documentan requisitos.
- Cabe en cualquier GPU consumer e integrada; tambien en CPU sin GPU dedicada.
- CPU: se recomienda AVX2, que segun el autor es considerablemente mas rapida.
- Opciones de despliegue: `faster-whisper` (CTranslate2) y la app Whisper de Home Assistant. No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama (no aplicables a un modelo ASR).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `itzune/faster-whisper-tiny-eu-cv22.0-int8` | no disponible (~39 M en el base) | ventanas de 30 s | `eu` | MIT | CTranslate2 int8 | Conversion int8 del fine-tune de Zuazo; 41 MB; CPU |
| `zuazo/whisper-tiny-eu-cv22.0` | no disponible (~39 M en el base) | ventanas de 30 s | `eu` | MIT (segun el repo convertido) | Transformers | Modelo fuente sin cuantizar; requiere Transformers/PyTorch |
| `openai/whisper-tiny` | ~39 M | ventanas de 30 s | multilingue | MIT | Transformers | Modelo base original; sin fine-tune de euskera |
| Otros fine-tunes de euskera de Zuazo (p. ej. variantes base/small) | no disponible | ventanas de 30 s | `eu` | no disponible | Transformers | Alternativas de mayor tamano y precision; datos no verificados en esta ficha |

## Limitaciones y advertencias

- Precision limitada por el tamano tiny: el propio autor advierte de una precision ligeramente inferior en palabras compuestas, un fenomeno frecuente en euskera.
- La cuantizacion int8 puede introducir una degradacion adicional frente al modelo fuente; no se documenta la magnitud de esa perdida.
- Riesgo de alucinacion en audio con ruido, silencios largos o habla solapada, comportamiento tipico de la familia Whisper.
- El modelo esta especializado exclusivamente en euskera; no debe usarse para otros idiomas.
- La deteccion automatica de idioma es mucho mas lenta que fijar `language="eu"`; en produccion conviene fijarlo.
- Ventana de audio de 30 segundos por defecto; audios mas largos requieren segmentacion o el manejo interno de `faster-whisper`.
- Licencia MIT, que permite uso comercial, pero se recomienda verificar las condiciones del dataset Common Voice y del modelo fuente.
- El repositorio debe permanecer publico para que la app Whisper de Home Assistant pueda descargarlo, ya que esa integracion no se autentica contra el Hub.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad ni evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/itzune/faster-whisper-tiny-eu-cv22.0-int8
- Modelo fuente (fine-tune de euskera): https://huggingface.co/zuazo/whisper-tiny-eu-cv22.0
- Modelo base original: https://huggingface.co/openai/whisper-tiny
- Libreria faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Dataset Common Voice 22.0: https://commonvoice.mozilla.org/datasets
- Documentacion de Home Assistant Whisper: https://www.home-assistant.io/integrations/whisper/
