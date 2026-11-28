# kusema/parakeet-unified-en-0.6b-gguf

## Resumen

Parakeet Unified English 0.6B es un modelo de reconocimiento automatico del habla (ASR) desarrollado originalmente por NVIDIA. El repositorio `kusema/parakeet-unified-en-0.6b-gguf` no es el modelo original, sino un espejo (mirror) de una conversion a GGUF y cuantizacion realizada por el proyecto transcribe.cpp, publicado por el autor Kusema para su aplicacion de dictado en Windows. El modelo cuenta con 618.309.121 parametros y esta especializado en transcripcion de audio en ingles.

El problema que resuelve es la transcripcion de voz a texto con un modelo de tamano contenido (0,6B de parametros) que puede ejecutarse en entornos de escritorio. Su relevancia actual radica en que permite integrar ASR local en aplicaciones de dictado sin depender de servicios en la nube, gracias al formato GGUF y al runtime transcribe.cpp.

Este repositorio concreto es un espejo sin modificaciones adicionales: el archivo GGUF es una copia exacta de la conversion publicada por handy-computer, con tamano y SHA-256 verificables, pensada para que la aplicacion Kusema valide la integridad tras cada descarga. Para usos distintos del dictado en Windows, la model card recomienda acudir a la fuente original de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR; arquitectura concreta no especificada en la informacion proporcionada) |
| Parametros totales | 618.309.121 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico archivo incluido) |
| Idiomas soportados | ingles (el nombre del modelo indica "en"; lista oficial de idiomas no disponible) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo original (tipo de encoder, atencion, capas conformadoras u otras innovaciones). Se trata de un modelo de la familia Parakeet de NVIDIA orientado a reconocimiento automatico del habla, con 618 millones de parametros. Tampoco se especifican los datos de entrenamiento (numero de horas de audio, composicion del corpus, uso de RLHF/DPO ni tecnicas de aumento de datos).

Lo unico documentado en este repositorio es el proceso de conversion: el modelo original `nvidia/parakeet-unified-en-0.6b` fue convertido a GGUF y cuantizado por el proyecto transcribe.cpp en la revision `7e948f21b7bdbac698d3318db9d350f1096f3b6c` del repositorio handy-computer, y este espejo no introduce cambios adicionales. El runtime asociado es transcribe.cpp, una implementacion en C++ para ejecutar modelos de transcripcion en formato GGUF.

## Capacidades

- Reconocimiento automatico del habla (speech-to-text) en ingles.
- Transcripcion de audio a texto mediante el runtime transcribe.cpp.
- Ejecucion local en escritorio, sin dependencia de API en la nube.
- Integracion en aplicaciones de dictado (caso de uso documentado: la app Kusema para Windows).
- Verificacion de integridad del archivo mediante SHA-256 tras la descarga.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje generativo de proposito general).
- Capacidades multilingues: limitadas al ingles segun la denominacion del modelo; no se detalla lista oficial.
- Vision, audio de entrada adicional o modo thinking: no disponible.

## Casos de uso

- Dictado por voz en escritorio Windows: es el caso de uso principal documentado; la aplicacion Kusema descarga este GGUF y lo ejecuta con transcribe.cpp para convertir voz en texto en tiempo real sin enviar audio a servidores externos.
- Transcripcion local de reuniones y notas de voz: al ejecutarse en local con un modelo de 0,6B y cuantizacion Q8_0 (731 MB), puede procesar grabaciones en equipos sin GPU dedicada, manteniendo la privacidad del contenido.
- Subtitulado de contenido en ingles: el modelo puede generar transcripciones para videos o podcasts en ingles que luego se sincronicen como subtitulos, aprovechando su tamano reducido para procesamiento por lotes.
- Integracion en pipelines de accesibilidad: aplicaciones que convierten voz a texto para personas con movilidad reducida pueden embeber este modelo mediante transcribe.cpp en entornos de escritorio.
- Prototipado de interfaces de voz: desarrolladores que necesiten un motor ASR ligero para pruebas de concepto pueden usar el GGUF con el runtime C++ sin montar infraestructura de servidor.
- Verificacion de integridad en distribucion de modelos: el repositorio sirve como referencia para validar descargas (tamano y SHA-256 publicados), util en sistemas de actualizacion automatica de aplicaciones que empaquetan modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la pagina del modelo original de NVIDIA para consultar sus benchmarks y limitaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 ocupa 731.357.568 bytes (aproximadamente 0,7 GB); la VRAM necesaria sera del orden de ese tamano mas el overhead del runtime, aunque no se proporcionan cifras oficiales.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; por el tamano del archivo (menos de 1 GB) es plausible su ejecucion en GPUs de consumo, pero no se documenta.
- Opciones de despliegue: transcribe.cpp (runtime oficial para este formato); otros runtimes no estan documentados para este modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni modelos comparables de la misma categoria.

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial del modelo original; para usos distintos del dictado en Windows se recomienda acudir a `nvidia/parakeet-unified-en-0.6b`.
- El modelo esta orientado al ingles; no se garantiza su funcionamiento en otros idiomas.
- Solo se distribuye una cuantizacion (Q8_0); no hay variantes mas ligeras o mas precisas en este repositorio.
- No se dispone de informacion sobre sesgos, tasas de error o riesgo de alucinacion en la transcripcion.
- La licencia es la NVIDIA Open Model License, que impone condiciones especificas para uso comercial; es necesario revisar el texto completo del acuerdo incluido en el repositorio (`LICENSE`) antes de desplegarlo en produccion.
- El autor del espejo no esta afiliado ni respaldado por NVIDIA; la atribucion requerida figura en el archivo `NOTICE`.
- No se documentan limitaciones de contexto o de duracion maxima de audio en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kusema/parakeet-unified-en-0.6b-gguf
- Modelo original: https://huggingface.co/nvidia/parakeet-unified-en-0.6b
- Conversion GGUF de origen: https://huggingface.co/handy-computer/parakeet-unified-en-0.6b-gguf
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Aplicacion Kusema: https://github.com/neulinc/kusema
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
