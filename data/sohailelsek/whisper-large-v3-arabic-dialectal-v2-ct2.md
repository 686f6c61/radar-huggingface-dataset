# SohailElsek/whisper-large-v3-arabic-dialectal-v2-ct2

## Resumen

`SohailElsek/whisper-large-v3-arabic-dialectal-v2-ct2` es una conversion al formato CTranslate2 (float16) del modelo de reconocimiento automatico del habla `oddadmix/whisper-large-v3-arabic-dialectal-v2`, un fine-tuning de Whisper large-v3 orientado a dialectos arabes. El autor de esta version, SohailElsek, no modifica los pesos: unicamente los transforma para que puedan cargarse con `faster-whisper`, el runtime basado en CTranslate2 que reduce latencia y consumo de memoria frente a la implementacion original de OpenAI.

El modelo hereda la arquitectura encoder-decoder transformer de Whisper large-v3 (aproximadamente 1550 millones de parametros) y el ajuste fino realizado por oddadmix sobre datos de arabe dialectal, un dominio donde el Whisper original rinde peor que en arabe estandar (MSA) por la variacion lexica, fonetica y de code-switching entre dialectos (egipcio, levantino, golf, magrebi, etc.). La conversion a CTranslate2 es relevante para despliegues en produccion porque habilita inferencia eficiente en CPU y GPU con cuantizacion opcional, algo que la version original en safetensors no ofrece de forma nativa.

La ficha se basa exclusivamente en la informacion publica disponible en HuggingFace: la model card del repositorio convertido es minima y no documenta el proceso de entrenamiento del modelo base, los datos utilizados ni resultados de evaluacion. Cualquier dato no confirmado se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) |
| Parametros totales | no disponible en la informacion proporcionada (Whisper large-v3 tiene aproximadamente 1550 M, dato no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos por defecto; no confirmado en la model card) |
| Tipos de cuantizacion | float16 (unica conversion publicada en este repositorio); CTranslate2 permite otras cuantizaciones al reconvertir |
| Idiomas soportados | arabe (`ar`), con enfasis en dialectos arabes segun el modelo base |
| Licencia | Apache-2.0 |
| Formato de pesos | CTranslate2 (float16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3: un encoder transformer que procesa espectrogramas mel de audio y un decoder autorregresivo que genera tokens de transcripcion, con atencion cruzada entre ambos. Whisper se entreno originalmente con supervision debil sobre cientos de miles de horas de audio multilingue con transcripciones, y large-v3 amplia el numero de idiomas y datos respecto a versiones anteriores. El modelo base `oddadmix/whisper-large-v3-arabic-dialectal-v2` es un fine-tuning de ese checkpoint sobre arabe dialectal; la model card del repositorio convertido no detalla el volumen de datos, la composicion del corpus ni si se aplicaron tecnicas como especulacion, destilacion o ajuste con RLHF (no aplicable habitualmente en ASR).

La contribucion tecnica de este repositorio concreto es la conversion a CTranslate2 en float16, que reordena y empaqueta los pesos para el runtime de CTranslate2 y permite ejecutar el modelo con `faster-whisper`. Esta conversion habilita cuantizaciones adicionales (int8, int8_float16, int16) mediante la herramienta `ct2-transformers-converter`, aunque el repositorio solo publica la variante float16. No se documentan cambios en los pesos, en el tokenizador ni en la configuracion de decodificacion.

## Capacidades

- Transcripcion de voz a texto en arabe, con especial atencion a variedades dialectales segun el fine-tuning del modelo base.
- Deteccion de idioma y transcripcion multilingue heredadas de Whisper large-v3 (aunque el ajuste fino puede haber estrechado el rendimiento hacia el arabe).
- Segmentacion con marcas de tiempo a nivel de segmento y de palabra mediante `faster-whisper`.
- Traduccion de audio a texto en ingles (capacidad nativa de Whisper, no verificada tras el fine-tuning dialectal).
- Procesamiento de audio en streaming o por lotes mediante el runtime CTranslate2.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido (no aplicable a un modelo ASR).
- No se documenta soporte de vision ni audio mas alla de la entrada estandar de Whisper.

## Casos de uso

- Transcripcion de reuniones y llamadas en arabe dialectal: el modelo puede procesar audio de conversaciones informales donde el arabe estandar no refleja el habla real, usando `faster-whisper` para obtener transcripciones con marcas de tiempo.
- Subtitulado automatico de contenido audiovisual arabe: la generacion de segmentos con timestamps permite producir subtitulos SRT/VTT para videos, podcasts o retransmisiones.
- Atencion al cliente en centros de contacto: transcripcion de grabaciones de llamadas para analitica, control de calidad y busqueda posterior, con la ventaja de latencia reducida del runtime CTranslate2.
- Investigacion sociolinguistica y linguistica de corpus: generacion de transcripciones a gran escala de material dialectal para estudios de variacion lexica y fonetica.
- Sistemas de actas y resumenes: pipeline ASR mas LLM donde este modelo aporta la transcripcion de la reunion y un modelo de lenguaje genera el resumen.
- Despliegue en entornos con recursos limitados: la conversion float16 y la posibilidad de recuantizar a int8 permiten ejecutar el modelo en CPU o GPU modestas, util para prototipos y entornos sin aceleradores de gama alta.
- Accesibilidad: generacion de subtitulos en tiempo casi real para personas con discapacidad auditiva en contenido en arabe dialectal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio convertido no incluye WER, CER ni comparaciones con otros modelos, y tampoco se dispone de las metricas del modelo base `oddadmix/whisper-large-v3-arabic-dialectal-v2` en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada en float16: en torno a 3 GB para los pesos (el repositorio ocupa 3,1 GB); con overhead de runtime y buffers de audio, se recomienda al menos 4-6 GB de VRAM para inferencia comoda.
- VRAM estimada en int8: aproximadamente 1,6-2 GB de pesos, permitiendo ejecucion en GPUs de 4 GB o incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para float16 (RTX 3060, RTX 4060, RTX 4090, A10, L4, A100, H100). En A100/H100 el modelo es pequeno y el cuello de botella sera el preprocesado de audio y el batch, no la memoria.
- Cabe en GPU de consumo: si, en RTX 3060/4060/4090 y equivalentes; en int8 tambien en GPUs integradas o CPUs modernas con AVX2.
- Opciones de despliegue: `faster-whisper` (runtime nativo de este formato), servidores compatibles con CTranslate2, y contenedores propios. No es compatible directamente con vLLM, TGI ni llama.cpp/Ollama, que no soportan el formato CTranslate2 para Whisper.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, CTranslate2 suele ofrecer aceleraciones significativas frente a la implementacion original de Whisper, pero no se aportan cifras concretas para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| SohailElsek/whisper-large-v3-arabic-dialectal-v2-ct2 | no disponible (base Whisper large-v3, ~1550 M) | ventanas de 30 s (estandar Whisper) | arabe dialectal | Apache-2.0 | CTranslate2 float16 |
| openai/whisper-large-v3 | ~1550 M | ventanas de 30 s | multilingue (99 idiomas) | Apache-2.0 | safetensors, PyTorch |
| oddadmix/whisper-large-v3-arabic-dialectal-v2 | no disponible (base Whisper large-v3) | ventanas de 30 s | arabe dialectal | Apache-2.0 | safetensors |
| whisper-large-v3-ct2 (conversiones genericas) | ~1550 M | ventanas de 30 s | multilingue | Apache-2.0 | CTranslate2 |

La comparativa se limita a variantes de Whisper porque no se dispone de datos de otros sistemas ASR especializados en arabe dialectal en la informacion proporcionada. No hay resultados de WER que permitan comparar rendimiento entre estas opciones.

## Limitaciones y advertencias

- La model card es minima: no documenta el corpus de entrenamiento, el proceso de fine-tuning ni evaluacion, lo que impide verificar la calidad real en cada dialecto.
- Riesgo de alucinacion: como todos los modelos Whisper, puede generar texto plausible en segmentos de silencio, ruido o audio ininteligible, especialmente en decodificacion sin temperatura 0.
- Sesgo dialectal: el ajuste fino puede mejorar unos dialectos a costa de degradar el rendimiento en arabe estandar (MSA) o en otros idiomas que Whisper large-v3 si cubria.
- Sesgos sociales y demograficos heredados de los datos de entrenamiento de Whisper y del corpus de fine-tuning, no documentados.
- Licencia Apache-2.0 permite uso comercial, pero el autor del repositorio convertido no ofrece garantias y atribuye la autoria del modelo a oddadmix; conviene revisar la licencia y condiciones del modelo base.
- El formato CTranslate2 limita la portabilidad: no se puede cargar con `transformers` directamente ni con la mayoria de servidores de inferencia genericos; requiere `faster-whisper` o CTranslate2.
- Solo se publica la variante float16; para int8 u otras cuantizaciones hay que reconvertir el modelo base con `ct2-transformers-converter`.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria ni evidencia de uso en produccion.
- No se documentan limitaciones especificas de longitud de audio mas alla de la ventana estandar de 30 segundos de Whisper y el troceado que aplica `faster-whisper`.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SohailElsek/whisper-large-v3-arabic-dialectal-v2-ct2
- Modelo base: https://huggingface.co/oddadmix/whisper-large-v3-arabic-dialectal-v2
- Repositorio de faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Repositorio de CTranslate2: https://github.com/OpenNMT/CTranslate2
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3
