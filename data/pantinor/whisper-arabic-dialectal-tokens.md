# pantinor/whisper-arabic-dialectal-tokens

# Ficha del repositorio pantinor/whisper-arabic-dialectal-tokens

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial al uso, sino un archivo de vocabulario (`tokens.txt`) especifico para el motor de inferencia sherpa-onnx. Concretamente, se trata de la conversion del `vocab.json` y `added_tokens.json` del modelo `OpenVoiceOS whisper-large-v3-turbo-arabic-dialectal-v2-onnx`, un fine-tuning de OpenAI Whisper Large v3 Turbo especializado en arabe dialectal.

El problema que resuelve es practico: el repositorio original de OpenVoiceOS no distribuye el archivo `tokens.txt` en el formato que sherpa-onnx necesita para decodificar. Este repositorio lo genera con un formato de linea `base64(token) id`, cubriendo 51.866 tokens con identificadores contiguos del 0 al 51.865.

Es relevante para desarrolladores que quieran desplegar reconocimiento de voz en arabe dialectal en entornos de edge computing o integrados en asistentes de voz como OpenVoiceOS, ya que elimina un paso de conversion manual y garantiza compatibilidad con el catalogo de modelos externos de Anti-Vocale.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Archivo de vocabulario (tokenizer) para sherpa-onnx, basado en el tokenizer de OpenAI Whisper Large v3 Turbo |
| Parametros totales | No aplica (no contiene pesos de modelo) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible (heredada del modelo base Whisper Large v3 Turbo) |
| Tipos de cuantizacion | No aplica (es un archivo de texto plano) |
| Idiomas soportados | Arabe dialectal (segun el nombre del modelo fuente, aunque la metadata de HuggingFace no lo especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica (formato `tokens.txt` de sherpa-onnx) |

## Arquitectura y entrenamiento

Este repositorio no ha sido entrenado ni contiene pesos. Es una conversion determinista de los ficheros `int8/vocab.json` y `int8/added_tokens.json` del modelo `whisper-large-v3-turbo-arabic-dialectal-v2-onnx`, exportado por OpenVoiceOS. El proceso de conversion consiste en ordenar los tokens por identificador y emitir una linea por token con el formato `base64(token) id`, que es el que espera el motor sherpa-onnx.

El modelo subyacente es un fine-tuning de OpenAI Whisper Large v3 Turbo, que emplea una arquitectura transformer encoder-decoder con atencion sobre espectrogramas Mel de 30 segundos. El fine-tuning se ha realizado sobre datos de habla en arabe dialectal, aunque no se detalla la composicion del dataset de entrenamiento en esta ficha.

## Capacidades

- Proporciona el mapeo completo de tokens (51.866) necesario para que sherpa-onnx decodifique las salidas del modelo Whisper fine-tuneado en arabe dialectal.
- Permite ejecutar inferencia de reconocimiento de voz en tiempo real o por lotes en dispositivos compatibles con sherpa-onnx (CPU, GPU, dispositivos moviles).
- Facilita la integracion con el catalogo de modelos externos de Anti-Vocale y con la plataforma OpenVoiceOS.
- Al ser un archivo de texto plano, es facilmente auditable y reproducible con el comando de regeneracion indicado en la model card.
- No incluye capacidades de generacion de texto, razonamiento, tool calling ni vision, ya que no es un modelo de lenguaje general.

## Casos de uso

- Despliegue de un asistente de voz en arabe dialectal en dispositivos embebidos: el archivo `tokens.txt` permite a sherpa-onnx cargar el modelo ONNX de OpenVoiceOS sin necesidad de adaptar el vocabulario manualmente, reduciendo el tiempo de integracion.
- Transcripcion de audio en tiempo real en aplicaciones de atencion al cliente: al estar optimizado para arabe dialectal, el modelo resultante puede transcribir conversaciones telefonicas o chats de voz con mayor precision que el Whisper generico en esta variante linguistica.
- Desarrollo de sistemas de subtitulado automatico para contenido audiovisual en dialectos arabes: la compatibilidad con sherpa-onnx permite procesar audio en streaming con baja latencia.
- Construccion de pipelines de post-procesado de audio en entornos offline: al ser un archivo de vocabulario, no requiere conexion a internet ni servicios en la nube, lo que garantiza privacidad en el procesamiento.
- Investigacion en ASR multilingue: los desarrolladores pueden comparar el comportamiento de este vocabulario con el tokenizer original de Whisper para estudiar el impacto del fine-tuning en la distribucion de tokens.
- Integracion en el ecosistema OpenVoiceOS: el archivo esta disenado para el catalogo Anti-Vocale, por lo que los desarrolladores de skills o plugins pueden referenciarlo directamente sin pasos adicionales de conversion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene pesos de modelo, por lo que no existen metricas propias de calidad de transcripcion. El rendimiento dependera exclusivamente del modelo `whisper-large-v3-turbo-arabic-dialectal-v2-onnx` de OpenVoiceOS, del cual no se han facilitado datos en esta ficha.

## Requisitos de hardware

- Este repositorio en si no requiere hardware especifico, ya que es un archivo de texto de aproximadamente unos pocos cientos de kilobytes.
- Para ejecutar el modelo asociado (`whisper-large-v3-turbo-arabic-dialectal-v2-onnx` en formato int8), se estima que se necesitan alrededor de 1,5 GB de RAM/VRAM, basandose en el tamano tipico de un Whisper Large v3 Turbo cuantizado a int8.
- Es compatible con CPU (via sherpa-onnx) y con GPUs que soporten ONNX Runtime, como NVIDIA GTX 1060 o superiores, aunque para inferencia en tiempo real en CPU se recomienda al menos un procesador moderno de 8 nucleos.
- Las opciones de despliegue incluyen sherpa-onnx (C++, Python, Android, iOS), OpenVoiceOS y cualquier runtime ONNX compatible con el formato de tokens generado.
- La latencia y el throughput no estan especificados para este archivo, pero el modelo Whisper Large v3 Turbo suele procesar un audio de 30 segundos en menos de 2 segundos en una GPU consumer media.

## Comparativa con modelos similares

| Repositorio | Contenido | Formato | Licencia | Uso |
|---|---|---|---|---|
| pantinor/whisper-arabic-dialectal-tokens | Vocabulario de 51.866 tokens en `tokens.txt` | `base64(token) id` | Apache-2.0 | sherpa-onnx |
| openai/whisper-large-v3-turbo | Modelo original con tokenizer integrado | `vocab.json` + `added_tokens.json` (JSON) | MIT (modelo) | OpenAI Whisper API, HuggingFace Transformers |
| OpenVoiceOS whisper-large-v3-turbo-arabic-dialectal-v2-onnx | Modelo ONNX completo (pesos + vocabulario) | ONNX + `vocab.json` | Apache-2.0 | ONNX Runtime, OpenVoiceOS |

La diferencia principal es que este repositorio no compite con el modelo completo, sino que es un complemento necesario para que el modelo ONNX de OpenVoiceOS funcione con sherpa-onnx. El tokenizer original de OpenAI usa un formato JSON de byte-level BPE, mientras que este convierte los tokens a base64 y los ordena en lineas planas, un requisito especifico de sherpa-onnx.

## Limitaciones y advertencias

- Este repositorio no contiene los pesos del modelo. Si se descarga solo este archivo, no se puede realizar ninguna inferencia.
- El vocabulario es especifico para el modelo `whisper-large-v3-turbo-arabic-dialectal-v2-onnx`. Usarlo con otro modelo Whisper puede provocar errores de decodificacion o resultados incorrectos.
- No se garantiza la cobertura de todos los dialectos arabes; el fine-tuning puede estar sesgado hacia las variantes presentes en el dataset de entrenamiento de OpenVoiceOS, que no se detalla.
- La licencia Apache-2.0 cubre este archivo de conversion, pero el modelo subyacente (Whisper Large v3 Turbo) tiene su propia licencia MIT, por lo que es necesario revisar ambas antes de un despliegue comercial.
- Al ser un archivo de texto plano, no incluye metadatos sobre la normalizacion de texto o reglas de tokenizacion adicionales, lo que puede afectar a la precision en entornos de produccion con ruido o acentos muy marcados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/pantinor/whisper-arabic-dialectal-tokens
- Modelo base (OpenAI Whisper Large v3 Turbo): https://huggingface.co/openai/whisper-large-v3-turbo
- Motor de inferencia sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Ecosistema OpenVoiceOS: https://openvoiceos.com/
