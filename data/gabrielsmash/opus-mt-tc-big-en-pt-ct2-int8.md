# gabrielsmash/opus-mt-tc-big-en-pt-ct2-int8

## Resumen

`gabrielsmash/opus-mt-tc-big-en-pt-ct2-int8` es una conversion del modelo de traduccion automatica `Helsinki-NLP/opus-mt-tc-big-en-pt` al formato CTranslate2 con cuantizacion int8. El modelo original fue desarrollado por el grupo de investigacion en tecnologia del lenguaje de la Universidad de Helsinki dentro del proyecto OPUS-MT, y esta especializado en la traduccion de ingles a portugues (tanto brasileno como europeo). Esta version concreta no introduce ningun reentrenamiento ni ajuste fino: se trata de una conversion de pesos sin modificaciones, pensada para ejecutarse sin PyTorch y con un rendimiento notable en CPU.

La relevancia de esta ficha radica en que el artefacto es un ejemplo de empaquetado de inferencia optimizado para produccion: CTranslate2 con cuantizacion int8 reduce el peso del repositorio a unos 0,2 GB y permite desplegar traduccion en entornos sin GPU. El modelo se usa como motor de traduccion en `doc-translator`, una herramienta CLI de codigo abierto que traduce PDFs preservando el diseno original.

Arquitectonicamente se trata de un transformer encoder-decoder de la familia Marian (base del proyecto OPUS-MT), con tokenizacion SentencePiece y un vocabulario multilingue compartido. La longitud de contexto, el numero exacto de parametros y los detalles del corpus de entrenamiento no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Marian, proyecto OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (pesos cuantizados en CTranslate2) |
| Idiomas soportados | en (ingles), pt (portugues: brasileno `>>pob<<` y europeo `>>por<<`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | CTranslate2 (con tokenizadores SentencePiece `source.spm` y `target.spm`) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer encoder-decoder de traduccion automatica neuronal, derivado de la arquitectura Marian empleada por el proyecto OPUS-MT. El repositorio distribuido contiene unicamente los pesos convertidos a CTranslate2 con cuantizacion int8, junto con los tokenizadores SentencePiece de origen y destino. La conversion se realizo con CTranslate2 4.8.5 mediante el script `scripts/convert_model.py` del repositorio `doc-translator`.

No se ha llevado a cabo ningun reentrenamiento ni ajuste fino sobre los pesos: la model card indica explicitamente que es una conversion sin modificaciones del modelo `Helsinki-NLP/opus-mt-tc-big-en-pt`. Por tanto, los datos de entrenamiento, el numero de tokens, la composicion del corpus y cualquier etapa de alineacion o ajuste pertenecen al modelo upstream y no se detallan en la informacion disponible. La innovacion tecnica de esta version es el empaquetado para inferencia: cuantizacion int8 y ejecucion sin dependencia de PyTorch, lo que habilita despliegue en CPU y en CUDA.

## Capacidades

- Traduccion de texto de ingles a portugues, con variante explicita de portugues brasileno (`>>pob<<`) y portugues europeo (`>>por<<`).
- Traduccion por lotes mediante `translate_batch` de CTranslate2, con busqueda por haz configurable (`beam_size`).
- Ejecucion en CPU con cuantizacion int8 y soporte de GPU CUDA mediante el parametro `device` de CTranslate2.
- Tokenizacion SentencePiece integrada para origen y destino.
- Integracion en pipelines de procesamiento documental (por ejemplo, traduccion de PDFs preservando el diseno).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.

## Casos de uso

- Traduccion de documentacion tecnica de ingles a portugues: el modelo se integra en pipelines de CI/CD o scripts de publicacion para generar versiones en portugues de manuales y guias, con la ventaja de que la inferencia int8 en CPU evita depender de GPUs dedicadas.
- Traduccion de PDFs preservando el diseno: es el caso de uso original del autor a traves de `doc-translator`, que procesa el documento y traduce el texto manteniendo la maquetacion, usando este modelo como motor de traduccion.
- Localizacion de sitios web y aplicaciones: el modelo puede servir como backend de traduccion en un servicio de localizacion continua, eligiendo la variante `>>pob<<` o `>>por<<` segun el mercado objetivo.
- Procesamiento por lotes de grandes volumenes de texto: al ejecutarse con CTranslate2 en CPU y con un repositorio de 0,2 GB, es adecuado para trabajos batch en servidores sin acelerador, con coste de infraestructura bajo.
- Traduccion en entornos con recursos limitados o air-gapped: la ausencia de dependencia de PyTorch y el tamano reducido permiten desplegarlo en contenedores ligeros o en maquinas sin GPU.
- Generacion de subtitulos o transcripciones en portugues: como paso de traduccion dentro de una cadena ASR + traduccion, traduciendo segmentos cortos en lote.
- Prototipado e investigacion en traduccion automatica: sirve como linea base rapida de inferencia para comparar calidad o latencia frente a otros sistemas, sin necesidad de montar el stack de transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 0,2 GB, por lo que el modelo int8 es muy ligero y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU CUDA compatible con CTranslate2; dada la ausencia de datos de latencia, no se puede recomendar un modelo concreto con cifras.
- Cabe en GPU consumer: si, por el tamano del repositorio (0,2 GB) y la cuantizacion int8; no se especifican modelos concretos.
- Opciones de despliegue: CTranslate2 (libreria nativa, Python), con ejecucion en CPU (`device="cpu"`, `compute_type="int8"`) o CUDA. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| gabrielsmash/opus-mt-tc-big-en-pt-ct2-int8 | no disponible | no disponible | CTranslate2 int8 | CC BY 4.0 | Conversion del modelo Helsinki-NLP; enfocado a CPU |
| VoragoStudios/gct-opus-mt-tc-big-en-pt-ct2 | no disponible | no disponible | CTranslate2 int8 | CC BY 4.0 | Misma base upstream, conversion equivalente de otro autor |
| VoragoStudios/gct-opus-mt-tc-big-en-it-ct2 | no disponible | no disponible | CTranslate2 int8 | CC BY 4.0 | Misma base upstream, pero par ingles-italiano |
| Helsinki-NLP/opus-mt-tc-big-en-pt | no disponible | no disponible | safetensors (transformers) | CC BY 4.0 | Modelo original sin cuantizar; requiere PyTorch |

## Limitaciones y advertencias

- Solo cubre la direccion ingles a portugues; no soporta traduccion inversa ni otros pares de idiomas.
- Requiere el token de idioma destino (`>>pob<<` o `>>por<<`) en la entrada; omitirlo puede degradar o invalidar la traduccion.
- Al ser una conversion sin ajuste fino, hereda cualquier sesgo, error o limitacion del modelo upstream, cuyos detalles de entrenamiento no se documentan aqui.
- Riesgo de alucinacion y de traducciones inexactas inherente a los sistemas de traduccion automatica neuronales; no se han publicado evaluaciones de calidad en esta ficha.
- La licencia CC BY 4.0 permite uso comercial, pero exige atribucion al proyecto OPUS-MT y al autor de la conversion.
- No se documentan limites de longitud de contexto; conviene validar el comportamiento con entradas largas antes de usarlo en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin evidencia de uso en produccion ni de validacion por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gabrielsmash/opus-mt-tc-big-en-pt-ct2-int8
- Modelo base upstream: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-pt
- Repositorio doc-translator: https://github.com/GabrielSmash/doc-translator
- Script de conversion: https://github.com/GabrielSmash/doc-translator/blob/main/scripts/convert_model.py
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Conversion equivalente de VoragoStudios (en-pt): https://huggingface.co/VoragoStudios/gct-opus-mt-tc-big-en-pt-ct2
- Conversion equivalente de VoragoStudios (en-it): https://huggingface.co/VoragoStudios/gct-opus-mt-tc-big-en-it-ct2
