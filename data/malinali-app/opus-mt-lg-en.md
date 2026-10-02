# malinali-app/opus-mt-lg-en

## Resumen

El modelo `malinali-app/opus-mt-lg-en` es un modelo de traducción automática neuronal para la dirección luganda (lg) → inglés (en), publicado por el desarrollador malinali-app en HuggingFace. No se trata de un modelo entrenado desde cero, sino de un reempaquetado de los pesos de `Helsinki-NLP/opus-mt-lg-en`, perteneciente a la familia OPUS-MT del grupo de investigación Helsinki-NLP, cuyos artefactos se redistribuyen aquí en formato safetensors acompañados de tokenizadores rápidos convertidos desde SentencePiece.

La relevancia del paquete es fundamentalmente de despliegue: está pensado para inferencia en dispositivo (on-device) dentro de la aplicación Malinali, a través del runtime Candle y del componente `marian_flutter`. Con 75.672.095 parámetros y un repositorio de 0,3 GB, el modelo es lo bastante pequeno como para ejecutarse en CPU, en hardware móvil o en cualquier GPU de consumo sin requisitos de memoria significativos, y cubre un par de idiomas poco atendido por los grandes modelos multilingües.

Arquitectónicamente es un transformer encoder-decoder estándar de tipo Marian, con licencia no declarada explícitamente en la ficha de HuggingFace (el autor remite a la licencia del modelo original, típicamente CC-BY 4.0 en OPUS-MT) y sin resultados de benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT) |
| Parametros totales | 75.672.095 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (pesos distribuidos en safetensors, presumiblemente FP32) |
| Idiomas soportados | Luganda (lg) como origen, ingles (en) como destino |
| Licencia | No disponible en la ficha; el autor indica seguir la licencia del modelo upstream (tipicamente CC-BY 4.0 para OPUS-MT) |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json`, `tokenizer-enc.json` y `tokenizer-dec.json` |

Otros datos del repositorio: tamano de 0,3 GB, 0 descargas y 0 likes en el momento de la consulta, fecha de creacion 2026-10-02. Etiquetado como compatible con endpoints y con el runtime Candle.

## Arquitectura y entrenamiento

El modelo es un MarianMT, es decir, un transformer seq2seq con encoder y decoder separados, del mismo tipo que el resto de la familia OPUS-MT. Cuenta con dos tokenizadores diferenciados, uno para el idioma origen (`tokenizer-enc.json`) y otro para el destino (`tokenizer-dec.json`), lo que refleja el flujo clasico de Marian: codificacion en luganda, decodificacion en ingles. El peso total de 75,6 millones de parametros corresponde a una configuracion base de la familia, con vocabularios SentencePiece independientes por idioma.

No se dispone de informacion sobre el proceso de entrenamiento en los materiales proporcionados: no se documentan el numero de tokens, la composicion del corpus paralelo, ni si hubo etapas de ajuste fino con RLHF o DPO. Tampoco se describen innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras) mas alla del propio reempaquetado orientado a inferencia en dispositivo mediante Candle. El autor declara explicitamente que Malinali unicamente redistribuye pesos y convierte los tokenizadores de SentencePiece a formato fast tokenizer de HuggingFace, y que no reclama la propiedad del modelo entrenado.

## Capacidades

- Traduccion de texto de luganda a ingles, en un unico sentido (lg → en); no se documenta la direccion inversa en este repositorio.
- Generacion de texto condicionada a la tarea (`text2text-generation`), que es el pipeline declarado.
- Ejecucion en dispositivo gracias al formato safetensors y a la compatibilidad declarada con Candle (`marian_flutter`).
- Tokenizacion rapida diferenciada para origen y destino, lo que facilita la integracion en pipelines de traduccion.
- Compatibilidad declarada con endpoints de inferencia (etiqueta `endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo de razonamiento explicito.
- Cobertura multilingue limitada a los dos idiomas indicados; no se declaran capacidades adicionales de traduccion a terceras lenguas.

## Casos de uso

- Traduccion de documentacion administrativa y sanitaria: el modelo puede convertir avisos, formularios o material informativo redactados en luganda a ingles para su difusion en contextos oficiales o internacionales, aprovechando que el paquete es ligero y puede desplegarse sin infraestructura GPU dedicada.
- Subtitulado y post-procesado de audio: integrado detras de un sistema de reconocimiento automatico del habla en luganda, el modelo traduce las transcripciones a ingles para generar subtitulos o articulos, con la ventaja de ejecutarse en el mismo dispositivo que captura el audio.
- Atencion al cliente y servicios publicos en Uganda: un asistente o un chat de soporte puede recibir consultas en luganda y presentar respuestas o resumenes en ingles para operadores que no dominan el idioma, reduciendo la dependencia de traductores humanos en tiempo real.
- Aplicaciones moviles sin conectividad: al ocupar 0,3 GB y disponer de pesos en safetensors compatibles con Candle, el modelo puede empaquetarse dentro de una aplicacion Flutter y funcionar completamente offline, algo critico en regiones con conectividad intermitente.
- Investigacion linguistica y construccion de corpus: util como componente de alineacion y traduccion en proyectos de documentacion del luganda, generando borradores de traduccion que despues se revisan manualmente.
- Moderacion y triaje de contenido: traduccion rapida de texto generado por usuarios en luganda hacia ingles para que los equipos de moderacion puedan clasificarlo con herramientas que solo operan en ingles.
- Preservacion de patrimonio cultural: traduccion de transcripciones de tradicion oral, canciones o textos historicos para su catalogacion en repositorios academicos en ingles.
- Componente especializado en pipelines de traduccion multilingue: dado su tamano reducido, puede actuar como par dedicado lg → en dentro de una arquitectura mayor que enrute por idioma, en lugar de recurrir a un modelo multilingue masivo para cada par.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de HuggingFace no incluye metricas de BLEU, chrF, MMLU, HumanEval ni de ningun otro conjunto de evaluacion, y la busqueda web realizada no ha devuelto documentacion tecnica asociada al modelo (los resultados obtenidos no guardan relacion con el proyecto).

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 303 MB solo para los pesos (75.672.095 parametros x 4 bytes), mas overhead de activaciones y runtime.
- VRAM estimada en FP16: aproximadamente 151 MB para los pesos.
- VRAM estimada en INT8: aproximadamente 76 MB para los pesos, si se aplica cuantizacion por parte del usuario (no se distribuyen variantes cuantizadas en el repositorio).
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente; no se requiere A100, H100 ni similares. El modelo es viable en iGPU y en aceleradores integrados.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier RTX, GTX, Apple Silicon o GPU integrada moderna.
- CPU: la inferencia en CPU es perfectamente viable dado el tamano del modelo, y es el escenario previsto por el autor para uso on-device.
- Opciones de despliegue: transformers (PyTorch) de forma nativa; Candle mediante `marian_flutter` segun el autor; el repositorio esta etiquetado como `endpoints_compatible`. No se documenta soporte de vLLM, TGI, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-lg-en | 75.672.095 | lg → en | No disponible | No declarada (remite al upstream) | HuggingFace, 0 descargas |
| Helsinki-NLP/opus-mt-lg-en | No disponible en la informacion proporcionada | lg → en | No disponible | No disponible en la informacion proporcionada | HuggingFace (modelo base del anterior) |
| Alternativas multilingues (NLLB-200, M2M-100) | No disponible en la informacion proporcionada | Cobertura multilingue amplia | No disponible | No disponible en la informacion proporcionada | HuggingFace |

La unica comparacion verificable con los datos aportados es con `Helsinki-NLP/opus-mt-lg-en`, del que este repositorio es un reempaquetado: mismos pesos, mismo par de idiomas y misma arquitectura Marian, con la diferencia del formato de distribucion (safetensors mas tokenizadores fast para Candle frente al formato original del upstream). Para el resto de alternativas no se dispone de especificaciones contrastadas en la informacion proporcionada.

## Limitaciones y advertencias

- Direccionalidad unica: solo traduce de luganda a ingles. No sirve para en → lg ni para ningun otro par de idiomas.
- Ausencia total de benchmarks: no hay ninguna metrica publicada que permita estimar la calidad de traduccion, por lo que cualquier uso en produccion deberia ir precedido de una evaluacion propia con corpus representativo del dominio objetivo.
- Licencia ambigua: la ficha de HuggingFace no declara licencia y el autor remite a la del modelo upstream, indicando que suele ser CC-BY 4.0. Antes de un uso comercial conviene verificar la licencia efectiva de `Helsinki-NLP/opus-mt-lg-en` y los terminos de redistribucion.
- Riesgo de alucinacion y de traduccion infiel: como cualquier modelo seq2seq entrenado sobre corpus paralelos, puede generar contenido no presente en el original, especialmente con frases largas, terminologia tecnica, nombres propios o variedades dialectales del luganda poco representadas.
- Sesgo de dominio desconocido: no se documenta la composicion del corpus de entrenamiento, por lo que no puede descartarse un sesgo hacia determinados registros (religioso, noticias, textos institucionales) y un rendimiento pobre en lenguaje coloquial o especializado.
- Limitaciones de contexto: se desconoce la longitud maxima de secuencia soportada, lo que impide garantizar un comportamiento correcto con parrafos largos; en la practica conviene segmentar la entrada.
- Tokenizadores separados: el uso de tokenizadores distintos para origen y destino exige que el pipeline de inferencia los cargue correctamente; una integracion erronea puede degradar la calidad de forma silenciosa.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes, sin historial de uso ni validacion por parte de la comunidad, y el autor declara no ser propietario del modelo entrenado.
- Advertencia sobre despliegue: la compatibilidad declarada con Candle y con endpoints no implica que funcione sin ajustes en otros runtimes; conviene validar la ruta de inferencia elegida antes de integrarla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/opus-mt-lg-en
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-lg-en
- Proyecto OPUS-MT (Helsinki-NLP): https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app

No se han encontrado en la busqueda web articulos, papers, blogs, repositorios ni demos adicionales relacionados con este modelo.
