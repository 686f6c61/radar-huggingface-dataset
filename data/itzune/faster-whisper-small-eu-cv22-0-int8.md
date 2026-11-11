# itzune/faster-whisper-small-eu-cv22.0-int8

## Resumen

`itzune/faster-whisper-small-eu-cv22.0-int8` es una conversion de formato y cuantizacion del modelo de reconocimiento automatico del habla (ASR) `zuazo/whisper-small-eu-cv22.0`, un fine-tune de `openai/whisper-small` para euskera (codigo `eu`) entrenado sobre Common Voice 22.0. El autor de la conversion es el usuario de Hugging Face `itzune`, mientras que el fine-tune original pertenece a Xabier de Zuazo. No se trata de un modelo nuevo: los pesos son identicos a los del modelo base, unicamente transformados al formato CTranslate2 y cuantizados a int8.

El proposito principal es el despliegue ligero en CPU, especialmente dentro del ecosistema de Home Assistant a traves de la app Whisper y de la pipeline de voz Assist. El repositorio ocupa 248 MB en int8, lo que permite ejecutarlo en hardware modesto sin GPU dedicada, con una latencia adecuada para comandos cortos de domotica y asistentes de voz locales.

La relevancia actual radica en la combinacion de tres factores: soporte especifico para una lengua de bajos recursos como el euskera, un formato optimizado para inferencia (CTranslate2 con `faster-whisper`) y una licencia MIT que facilita su integracion en productos y proyectos personales sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small) convertido a CTranslate2 |
| Parametros totales | 244 M (heredados de `openai/whisper-small`) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio por ventana (ventana nativa de Whisper) |
| Tipos de cuantizacion | int8 (unica variante publicada en este repositorio) |
| Idiomas soportados | Euskera (`eu`) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (modelo binario `model.bin` + `tokenizer.json`, `preprocessor_config.json`, `generation_config.json`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper small de OpenAI: un transformer encoder-decoder con atencion completa, disenado para transcripcion y traduccion de voz. El modelo procesa audio en ventanas de 30 segundos y genera tokens de texto de forma autoregresiva. El fine-tune de Zuazo adapta estos pesos al euskera utilizando el corpus Common Voice 22.0 en esa lengua; no se dispone de informacion sobre el numero exacto de horas de audio, la composicion detallada del dataset ni si se aplicaron tecnicas de aumentacion o regularizacion adicionales.

La contribucion de este repositorio concreto no es de entrenamiento, sino de conversion: se aplica `ct2-transformers-converter` con `--quantization int8` para producir un artefacto compatible con `faster-whisper` y con la app Whisper de Home Assistant. La cuantizacion int8 reduce el peso del modelo a 248 MB y acelera la inferencia en CPU, manteniendo segun el autor una calidad comparable al modelo original en comandos cortos. No se han documentado innovaciones arquitectonicas adicionales (decodificacion especulativa, atencion lineal, etc.) mas alla de las propias de Whisper y de las optimizaciones de CTranslate2.

## Capacidades

- Transcripcion de voz a texto en euskera (`eu`) con deteccion forzada de idioma.
- Reconocimiento de comandos cortos y frases de dominio domestico, optimizado para la pipeline Assist de Home Assistant.
- Generacion de marcas de tiempo por segmento (`segments` con `start`/`end`) gracias a la API de `faster-whisper`.
- Decodificacion con `beam_size` configurable (por defecto 5 en el ejemplo de la model card), lo que permite ajustar el equilibrio velocidad/calidad.
- Ejecucion en CPU con `compute_type="int8"`, sin necesidad de GPU.
- Integracion directa con `faster-whisper` (Python) y con la app Whisper de Home Assistant mediante configuracion YAML.
- Capacidad multilingue limitada: el modelo esta especializado en euskera y no se ha validado su comportamiento en otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio de entrada mas alla de la transcripcion ni modo "thinking".

## Casos de uso

- **Asistente de voz local en Home Assistant**: configurar la app Whisper con `language: eu`, `model: custom` y `custom_model: itzune/faster-whisper-small-eu-cv22.0-int8` permite dictar comandos de domotica en euskera sin enviar audio a la nube, manteniendo la privacidad y funcionando en un mini-PC o Raspberry Pi con CPU moderna.
- **Transcripcion de notas de voz y reuniones en euskera**: usar la API de `faster-whisper` para procesar ficheros WAV y obtener segmentos con marcas de tiempo, util para generar actas o subtitulos de contenido audiovisual en euskera.
- **Subtitulado automatico de videos en euskera**: integrar el modelo en un pipeline de postproduccion que transcriba pistas de audio y genere ficheros SRT, aprovechando la salida por segmentos y la velocidad de int8 en CPU.
- **Prototipado rapido de interfaces de voz**: al ocupar 248 MB y ejecutarse en CPU, sirve como base para experimentar con reconocimiento de voz en euskera antes de invertir en modelos mayores o GPUs.
- **Investigacion en ASR de bajos recursos**: util como linea base cuantizada para comparar tecnicas de fine-tuning, cuantizacion o despliegue en lenguas minoritarias como el euskera.
- **Accesibilidad en entornos educativos o administrativos**: transcripcion de dictados y documentos orales en euskera en equipos sin GPU, gracias a la licencia MIT y al bajo coste de despliegue.
- **Pipelines de CI/CD para validacion de audio**: automatizar pruebas de calidad de transcripcion sobre corpus de euskera en entornos de integracion continua donde no hay aceleradores disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al WER del modelo base (`zuazo/whisper-small-eu-cv22.0`) sin aportar cifras propias, y unicamente menciona que en pruebas del autor en CPU es aproximadamente 5 veces mas rapido que `large-v3-turbo`, con calidad comparable en comandos cortos. No se proporcionan valores de WER, CER, latencia absoluta ni throughput medidos.

## Requisitos de hardware

- **VRAM estimada**: no requiere GPU; en CPU el modelo int8 ocupa aproximadamente 248 MB de pesos, con un consumo de RAM adicional para el runtime de CTranslate2 y los buffers de audio (tipicamente por debajo de 1 GB en total).
- **GPU recomendadas**: no son necesarias. Si se dispone de GPU, CTranslate2 puede ejecutarse en CUDA, pero el repositorio esta optimizado para CPU.
- **Consumer GPU**: irrelevante para el caso de uso principal; cabe en cualquier GPU moderna si se desea, pero el beneficio es marginal frente a CPU con AVX2.
- **CPU**: se recomienda un procesador con AVX2 para un rendimiento notablemente superior, segun la model card.
- **Opciones de despliegue**: `faster-whisper` (Python), app Whisper de Home Assistant, y cualquier runtime compatible con CTranslate2. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no son formatos aplicables a este artefacto.
- **Latencia y throughput**: no se publican cifras concretas; la unica referencia es la mencion de "aproximadamente 5 veces mas rapido que large-v3-turbo" en pruebas de CPU del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `itzune/faster-whisper-small-eu-cv22.0-int8` | 244 M | 30 s de audio | eu | MIT | CTranslate2 int8 | Conversion cuantizada del fine-tune de Zuazo, orientada a CPU y Home Assistant |
| `zuazo/whisper-small-eu-cv22.0` | 244 M | 30 s de audio | eu | MIT (heredada) | safetensors / Transformers | Modelo base del que deriva; requiere conversion para `faster-whisper` |
| `openai/whisper-small` | 244 M | 30 s de audio | Multilingue (99 idiomas) | MIT | safetensors / Transformers | Modelo original sin fine-tune en euskera; menor precision en `eu` |
| `openai/whisper-large-v3-turbo` | 809 M | 30 s de audio | Multilingue | MIT | safetensors / Transformers | Mayor calidad general pero mucho mas pesado y lento en CPU |

## Limitaciones y advertencias

- **Especializacion monoidioma**: el modelo esta entrenado y pensado exclusivamente para euskera; forzar `language="eu"` es obligatorio segun el autor, ya que la deteccion automatica es mucho mas lenta y puede degradar resultados.
- **Riesgo de alucinacion**: como todo modelo Whisper, puede generar texto plausible en silencios, ruido o audio fuera de dominio; conviene aplicar umbrales de confianza y validacion posterior.
- **Ventana de 30 segundos**: la arquitectura nativa de Whisper limita el contexto a ventanas de 30 s, lo que exige segmentacion previa para audios largos.
- **Rendimiento no verificado**: no se publican cifras de WER ni evaluaciones independientes para esta conversion int8; la calidad puede diferir ligeramente del modelo en precision completa.
- **Dependencia de AVX2**: en CPUs sin AVX2 el rendimiento cae considerablemente.
- **Repositorio publico obligatorio para Home Assistant**: la app Whisper no se autentica contra el Hub, por lo que el repositorio debe permanecer publico para su uso en esa integracion.
- **Licencia MIT**: permite uso comercial, pero el autor no ofrece garantias ni soporte; se recomienda validar el modelo en el dominio concreto antes de desplegarlo en produccion.
- **Sesgos**: no se documentan analisis de sesgos; al derivar de Common Voice, puede heredar sesgos de representacion del corpus (acentos, edad, genero, calidad de grabacion).
- **Sin soporte de otras capacidades**: no implementa tool calling, agentes, vision ni traduccion verificada a otros idiomas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/itzune/faster-whisper-small-eu-cv22.0-int8
- Modelo base (fine-tune euskera): https://huggingface.co/zuazo/whisper-small-eu-cv22.0
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-small
- `faster-whisper` (SYSTRAN): https://github.com/SYSTRAN/faster-whisper
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Common Voice 22.0: https://commonvoice.mozilla.org/datasets
- App Whisper de Home Assistant: https://www.home-assistant.io/integrations/whisper/
