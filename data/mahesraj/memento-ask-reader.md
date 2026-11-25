# mahesraj/memento-ask-reader

## Resumen

Memento Ask reader es un modelo de clasificación de tokens (token classification) especializado en el análisis de consultas de búsqueda fotográfica. Lo desarrolla mahesraj como componente del proyecto Memento, una aplicación autoalojada de gestión de fotos construida sobre Immich, y su función concreta es la de "lector de preguntas": recibe una consulta de búsqueda en inglés o hinglish romanizado y etiqueta cada palabra con su rol semántico (persona, fecha, lugar, objeto a buscar, orden de resultados, etc.) para que la aplicación pueda convertirla en una búsqueda estructurada.

El modelo parte de google/muril-base-cased, un transformer BERT multilingüe de Google optimizado para lenguas del subcontinente indio, y se ha afinado como clasificador de entidades con etiquetas BIO sobre un conjunto de aproximadamente 23.500 preguntas de búsqueda fotográfica más 6.367 frases públicas. Se distribuye en formato ONNX con pesos de 8 bits y vocabulario recortado, lo que reduce el artefacto a unos 208 MB y permite inferencias de 11-13 ms por consulta en 2 núcleos ARM con un consumo de memoria de unos 310 MB.

Su relevancia es acotada pero clara: cubre un nicho muy específico (búsqueda en lenguaje natural dentro de una app de fotos autoalojada) con un modelo pequeño, ligero y desplegable en hardware modesto, algo poco habitual en el ecosistema de modelos de NLP, donde predominan alternativas mucho más grandes y genéricas. La licencia Apache-2.0 y la disponibilidad en ONNX facilitan su integración en contenedores y entornos de borde.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), basado en google/muril-base-cased, con cabeza de clasificación de tokens |
| Parametros totales | no disponible (modelo base MuRIL-base, tamaño típico de BERT-base; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no se especifica en la model card; heredada de MuRIL-base, típicamente 512 tokens) |
| Tipos de cuantizacion | Pesos de 8 bits en el artefacto ONNX publicado; no se documentan otras variantes |
| Idiomas soportados | Inglés (en) e hinglish romanizado (hi en escritura latina); no cubre devanagari ni otros sistemas de escritura |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model.onnx), con tokenizer.json y config.json |

## Arquitectura y entrenamiento

La arquitectura es la de un transformer encoder tipo BERT (MuRIL-base-cased) con una cabeza de clasificación de tokens que asigna etiquetas BIO a cada palabra de la consulta. Las etiquetas cubren siete categorías: PER (persona, incluido el propio usuario cuando aparece en la foto), DATE (fecha o intervalo temporal), PLACE (lugar donde se tomó la foto), WORD (objeto o elemento a buscar en la imagen), NEW/OLD (orden de resultados, más reciente o más antiguo primero), VIDEO (solo vídeos) y FAV (solo favoritos). El modelo distingue casos sutiles, como que el "I" de "photos I took" no se etiqueta como persona porque el usuario estaba detrás de la cámara.

El entrenamiento se realizó por afinado del checkpoint `afd9f36c7923d54e97903922ff1b260d091d202f` de google/muril-base-cased sobre aproximadamente 23.500 preguntas de búsqueda fotográfica (con 2.600 adicionales reservadas para validación) y 6.367 frases públicas. La mayoría de las preguntas se generaron a partir de plantillas, unas pocas miles las escribió una IA con las etiquetas en línea, y las frases públicas provienen de los datasets Hinglish-TOP (Google Research, Apache-2.0) y MASSIVE (Amazon, CC BY 4.0, solo la parte inglesa), además de nombres de lugares de GeoNames (CC BY 4.0) tal como se incluyen en los datos de Immich. El código y los datos de entrenamiento no se han publicado. No se documenta el uso de RLHF, DPO ni técnicas de decodificación especulativa, algo coherente con la naturaleza de un clasificador de tokens y no de un modelo generativo.

## Capacidades

- Etiquetado de entidades en consultas de búsqueda fotográfica: identifica personas, fechas, lugares, objetos a buscar, orden de resultados, filtros de vídeo y de favoritos.
- Comprensión de inglés y de hinglish romanizado (hindi escrito con alfabeto latino), incluyendo expresiones coloquiales y nombres propios del subcontinente indio.
- Manejo de la ambigüedad del pronombre "I": distingue entre el usuario como sujeto de la foto y el usuario como fotógrafo.
- Clasificación a nivel de palabra con esquema BIO, adecuada para extracción de entidades y posterior conversión a una consulta estructurada.
- Inferencia ligera en CPU y en entornos ARM, con latencias de 11-13 ms por consulta y ~310 MB de memoria en 2 núcleos ARM.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador.
- No cubre devanagari ni otros sistemas de escritura distintos del latino.

## Casos de uso

- Búsqueda en lenguaje natural dentro de una app de fotos autoalojada: el modelo etiqueta la consulta del usuario ("playa con mamá en Goa el año pasado") y la app la traduce a filtros de persona, lugar, fecha y objeto, permitiendo búsquedas sin formularios ni menús.
- Integración en Immich u otras aplicaciones de gestión fotográfica: al estar en ONNX y con un consumo de memoria bajo, puede desplegarse como microservicio en el mismo contenedor o servidor doméstico que aloja la biblioteca de fotos, sin GPU dedicada.
- Despliegue en dispositivos de borde o NAS de bajas prestaciones: los 11-13 ms por consulta en 2 núcleos ARM y los ~310 MB de memoria lo hacen viable en Raspberry Pi o NAS domésticos donde un modelo generativo no cabría.
- Filtrado y ordenación de resultados: las etiquetas NEW/OLD, VIDEO y FAV permiten construir consultas con orden cronológico y filtros de tipo de medio, útiles en interfaces de búsqueda avanzada.
- Procesamiento de consultas multilingües para usuarios del subcontinente indio: el soporte de hinglish romanizado cubre a usuarios que escriben en hindi con caracteres latinos, un caso poco atendido por los modelos NER convencionales.
- Prototipado rápido de asistentes de búsqueda vertical: al ser un modelo pequeño y con licencia permisiva, sirve como base para experimentar con extracción de entidades en dominios acotados (fotos, catálogos, archivos) antes de invertir en modelos mayores.
- Investigación en NER de dominio específico: su combinación de etiquetas personalizadas y datos sintéticos plantilla puede servir de referencia metodológica para tareas de extracción de entidades en consultas cortas.

## Benchmarks y rendimiento

Los resultados publicados por el autor miden la proporción de preguntas en las que todas las etiquetas son correctas, sobre conjuntos de test no vistos durante el entrenamiento:

| Test | Preguntas | Todo correcto |
|---|---|---|
| Preguntas sobre el propio usuario ("when was I last in …") | 160 | 96,9% |
| Lugares no usados en entrenamiento | 200 | 93,5% |
| Más lugares no usados en entrenamiento | 150 | 84,7% |
| Trampas de palabras que se parecen a lugares o personas | 150 | 93,3% |
| Consultas de PhotoBench (inglés, puntuación estricta) | test split | 94,5% |
| Preguntas ciegas de búsqueda fotográfica escritas por separado | 3 conjuntos | 56-79% |

Los conjuntos ciegos son mucho más estrictos: cuentan una pregunta como incorrecta si difiere cualquier etiqueta, incluida una palabra de búsqueda de más. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es esperable dado que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada: no aplica en la mayoría de despliegues; el modelo está pensado para CPU. En GPU, el artefacto ONNX de 208 MB ocuparía una fracción mínima de memoria (menos de 1 GB).
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime serviría, aunque el modelo está optimizado para CPU.
- Cabe en GPU de consumo: sí, con enorme holgura (RTX 3060, RTX 4090, etc.), aunque no es su entorno objetivo.
- Despliegue en CPU y ARM: el autor reporta 11-13 ms por consulta y ~310 MB de memoria en 2 núcleos ARM, lo que lo hace apto para Raspberry Pi, NAS domésticos y contenedores ligeros.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que están orientadas a modelos generativos.
- Latencia y throughput: ~11-13 ms por consulta en 2 núcleos ARM; el throughput no se documenta, pero con esa latencia un solo núcleo podría procesar decenas de consultas por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Memento Ask reader | no disponible (base MuRIL-base) | no disponible | NER en consultas de búsqueda fotográfica (en, hinglish) | Apache-2.0 | ONNX en Hugging Face |
| google/muril-base-cased | ~236 M (BERT-base) | 512 tokens (típico) | Modelo base multilingüe para lenguas indias | Apache-2.0 | Hugging Face |
| Modelos NER genéricos tipo BERT-base-NER | ~110 M | 512 tokens | NER general (PER, LOC, ORG, MISC) | Variable (MIT, Apache-2.0) | Hugging Face |
| Modelos generativos pequeños (p. ej. Qwen2.5-0.5B) | ~500 M | 32k tokens | Generación y extracción flexible | Apache-2.0 | Hugging Face, GGUF, ONNX |

La comparativa con alternativas genéricas es limitada: Memento Ask reader está especializado en un dominio muy concreto y con un conjunto de etiquetas propio, por lo que no es directamente intercambiable con un NER general ni con un modelo generativo. Frente a un NER genérico, gana en precisión sobre consultas de búsqueda fotográfica y en ligereza; frente a un modelo generativo, pierde flexibilidad y cobertura de idiomas, pero es mucho más rápido y barato de ejecutar.

## Limitaciones y advertencias

- Solo cubre inglés y hinglish romanizado; no soporta devanagari ni otros sistemas de escritura.
- Está entrenado específicamente para preguntas de búsqueda fotográfica, no para reconocimiento de entidades general; su uso fuera de ese dominio no está validado.
- Alrededor del 7% de las preguntas trampa con palabras inventadas que se parecen a lugares se etiquetan erróneamente como lugar.
- Solo etiqueta palabras: la conversión de etiquetas a una búsqueda real (nombres a personas, fechas a rangos) corre a cargo del código de Memento, no del modelo.
- El código y los datos de entrenamiento no se publican, lo que dificulta la reproducibilidad y la auditoría del sesgo de los datos sintéticos.
- Los conjuntos de evaluación ciegos muestran una precisión notablemente inferior (56-79%) frente a los conjuntos internos (84-97%), lo que sugiere cierta sobreestimación del rendimiento en condiciones controladas.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos en la clasificación de entidades.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar las licencias de los datasets de origen (MASSIVE es CC BY 4.0, GeoNames CC BY 4.0) por si imponen obligaciones de atribución en productos derivados.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mahesraj/memento-ask-reader
- Modelo base MuRIL: https://huggingface.co/google/muril-base-cased
- Proyecto Immich: https://immich.app
- Dataset Hinglish-TOP: https://github.com/google-research-datasets/Hinglish-TOP-Dataset
- Dataset MASSIVE: https://huggingface.co/datasets/AmazonScience/massive
- GeoNames: https://www.geonames.org
