# Hans-Mueller/opus-mt-tc-big-en-ko

## Resumen

opus-mt-tc-big-en-ko es un modelo de traducción automática neuronal especializado en la dirección inglés (en) a coreano (ko). La model card atribuye su desarrollo al Language Technology Research Group de la Universidad de Helsinki, dentro del proyecto OPUS-MT, aunque el repositorio de HuggingFace figura publicado por la cuenta Hans-Mueller. Los ejemplos de código de la propia model card apuntan a los identificadores `pytorch-models/opus-mt-tc-big-en-ko` y `Helsinki-NLP/opus-mt-tc-big-en-ko`, por lo que todo indica que se trata de una réplica del modelo original, si bien esto no se confirma de forma explícita en la información disponible.

El modelo sigue la arquitectura transformer-big de Marian NMT, una implementación de traducción neuronal escrita en C++ puro que posteriormente se convirtió a PyTorch mediante la librería transformers. Cuenta con 209.158.401 parámetros totales y un tamaño de repositorio de 1,7 GB, lo que lo sitúa en la gama media de los modelos de traducción dedicados: es lo bastante grande para capturar fenómenos morfológicos complejos del coreano, pero lo suficientemente compacto como para ejecutarse en una única GPU de consumo o incluso en CPU.

Su relevancia actual es la de un componente especializado y ligero dentro de pipelines multilingües: frente a los grandes modelos generativos multilingües, ofrece una licencia permisiva (CC-BY-4.0), un consumo de recursos muy bajo y una integración directa en transformers. El precio de esa especialización es un alcance limitado (una única pareja de idiomas) y un rendimiento en FLORES-101 devtest de 13,7 BLEU y 0,36399 chr-F, valores modestos que conviene tener en cuenta antes de usarlo en producción. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (variante transformer-big de Marian NMT) |
| Parámetros totales | 209.158.401 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card |
| Tipos de cuantización | no disponible; no se publican pesos cuantizados (solo pytorch, safetensors y tf) |
| Idiomas soportados | inglés (en) como origen, coreano (ko) como destino |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors, PyTorch (bin) y TensorFlow; modelo Marian original en .zip |
| Pipeline de HuggingFace | translation |
| Tokenizador | SentencePiece (spm32k) |
| Tamaño del repositorio | 1,7 GB |
| Fecha de publicación original | 2022-07-28 (según la model card) |
| Fecha de creación del repositorio | 2026-09-22 (metadato del repositorio en HuggingFace) |

## Arquitectura y entrenamiento

Se trata de un transformer encoder-decoder completo, en la configuración transformer-big de Marian NMT. El preprocesado de texto emplea SentencePiece con un vocabulario de 32.000 tokens (spm32k) tanto en origen como en destino. El modelo se entrenó con el corpus opusTCv20210807, derivado de los datos paralelos recopilados en el proyecto OPUS, y los scripts de entrenamiento corresponden a los procedimientos de OPUS-MT-train. Marian NMT es una implementación en C++ optimizada para traducción, con decodificación por búsqueda en haz sobre la GPU, lo que da al modelo una huella de memoria notablemente menor que la de un modelo generativo de tamaño equivalente.

La model card no documenta el número exacto de tokens de entrenamiento, la composición detallada del dataset, ni si hubo fases de ajuste con RLHF o DPO; en traducción automática supervisada estos procedimientos no son habituales y no hay indicios de que se hayan aplicado. Tampoco se documenta ninguna innovación técnica destacable como decodificación especulativa o atención lineal. Un detalle relevante: la model card describe el modelo como "multilingüe con múltiples idiomas destino" y exige un token de idioma al inicio de la frase con la forma `>>id<<`, pero deja vacíos los campos de idiomas origen y destino válidos, y la metadata de HuggingFace solo declara la pareja en-ko. En la práctica debe tratarse como un modelo unidireccional inglés→coreano.

## Capacidades

- Traducción automática neuronal de inglés a coreano a nivel de frase, con salida de texto plano.
- Generación de texto texto-a-texto en el sentido de la traducción (no es un modelo de propósito general).
- Procesamiento por lotes (batching) mediante el tokenizador y el pipeline de transformers.
- Manejo de frases con números, siglas y puntuación mixta, tal como ilustra el ejemplo oficial ("2, 4, 6 etc. are even numbers." → "2, 4, 6 등은 짝수입니다.").
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No tiene modo de razonamiento (thinking mode), visión, audio ni entrada multimodal.
- Capacidades multilingües: limitadas a la pareja en-ko según la metadata; la model card menciona un token de idioma destino sin especificar los identificadores válidos.
- Contexto de conversación: no aplica, no es un modelo de chat.

## Casos de uso

- Localización de documentación técnica: traducción por lotes de manuales y guías de producto escritos en inglés al coreano, aprovechando la integración directa con el pipeline `translation` de transformers y la posibilidad de procesar miles de cadenas en una GPU pequeña.
- Subtitulado automático: traducción de pistas de subtítulos en inglés a coreano con un coste computacional muy bajo, adecuada para un primer borrador sobre el que trabaje después un revisor humano.
- Atención al cliente en comercio electrónico: traducción de tickets y correos de clientes coreanos al inglés y de las respuestas en sentido inverso, integrable en un sistema de gestión de tickets mediante una llamada por frase o por párrafo.
- Pre-traducción en herramientas de traducción asistida por ordenador (TAO): generación de borradores que el traductor humano post-edita, con la ventaja de que el modelo es pequeño y puede ejecutarse en la propia máquina del traductor sin depender de la nube.
- Traducción de reseñas y contenido generado por usuarios: normalización de reseñas de producto o comentarios en coreano hacia inglés para su análisis de sentimiento o su indexación en un motor de búsqueda interno.
- Generación de corpus sintéticos: producción de pares inglés-coreano para aumentar datos de entrenamiento de otros modelos o para tareas auxiliares (clasificación, extracción de entidades) en las que no existe corpus paralelo propio.
- Traducción de resúmenes científicos y técnicos: conversión de abstracts y fichas técnicas del inglés al coreano en repositorios documentales, un dominio donde los datos de OPUS tienen buena representación.
- Filtrado y enrutado multilingüe: traducción a inglés de contenido coreano para alimentar clasificadores o sistemas de moderación que solo operan en inglés.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo en la model card (marcados como no verificados):

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Traducción eng-kor | flores101-devtest | BLEU | 13,7 | no |
| Traducción eng-kor | flores101-devtest | chr-F | 0,36399 | no |

La model card referencia además ficheros de evaluación publicados junto al modelo original: `opusTCv20210807-sepvoc_transformer-big_2022-07-28.test.txt` (traducciones del conjunto de test), `opusTCv20210807-sepvoc_transformer-big_2022-07-28.eval.txt` (puntuaciones), `benchmark_results.txt` y `benchmark_translations.zip`. La tabla comparativa `langpair / testset / chr-F / BLEU / #sent / #words` que aparece en la model card está vacía, por lo que no se dispone de resultados desglosados por conjunto de test más allá de FLORES-101 devtest.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 837 MB (209.158.401 parámetros × 4 bytes). El repositorio ocupa 1,7 GB porque incluye varios formatos.
- Pesos en FP16: aproximadamente 418 MB. Cuantización dinámica a int8: aproximadamente 209 MB.
- VRAM estimada para inferencia: entre 1 y 2 GB en FP16, sumando activaciones, caché de atención y vocabulario del tokenizador. En FP32, entre 2 y 3 GB.
- Cabe sin problema en cualquier GPU de consumo con 4 GB o más: GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090, etc. También es viable la inferencia en CPU para volúmenes moderados.
- GPU de datacenter (A100, H100) innecesarias para un solo modelo; sí tienen sentido para servir muchas réplicas en paralelo o para procesar corpus muy grandes por lotes.
- Opciones de despliegue: `transformers` con `MarianMTModel` y `MarianTokenizer`, pipeline `translation`, y el binario nativo de Marian NMT (`marian-decoder`) usando el .zip original. La conversión a CTranslate2 u ONNX es técnicamente posible pero no se distribuye.
- vLLM, TGI, Ollama y llama.cpp no soportan de forma nativa la arquitectura Marian traducida, y no hay pesos GGUF publicados en este repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- No se publican versiones cuantizadas (GPTQ, AWQ, GGUF) en el repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BLEU (FLORES eng-kor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hans-Mueller/opus-mt-tc-big-en-ko | 209.158.401 | no disponible | 13,7 | CC-BY-4.0 | HuggingFace (0 descargas, 0 likes) |
| Helsinki-NLP/opus-mt-tc-big-en-ko | no disponible | no disponible | no disponible | CC-BY-4.0 | HuggingFace (repositorio original referenciado en la model card) |
| Helsinki-NLP/opus-mt-en-ko (transformer base) | no disponible | no disponible | no disponible | CC-BY-4.0 | HuggingFace |
| NLLB-200 (familia multilingüe de Meta) | varía según la variante; no disponible | no disponible | no disponible | no disponible en la información proporcionada | HuggingFace |
| M2M-100 (familia multilingüe de Meta) | varía según la variante; no disponible | no disponible | no disponible | no disponible en la información proporcionada | HuggingFace |

No hay datos de benchmarks publicados en la información disponible para los modelos alternativos, por lo que la comparación cuantitativa directa no es posible. En términos estructurales, opus-mt-tc-big-en-ko se distingue por ser un modelo de pareja única, tamaño medio y licencia CC-BY-4.0, frente a las familias multilingües tipo NLLB o M2M-100, que cubren cientos de idiomas con modelos de mayor tamaño y licencias más restrictivas para uso comercial.

## Limitaciones y advertencias

- La model card incluye un aviso explícito de contenido: el modelo se entrenó con conjuntos de datos públicos que pueden contener material ofensivo, perturbador y estereotipos históricos y actuales.
- Riesgo de sesgos heredados del corpus OPUS, cuya composición y balance por dominio no se documenta.
- Riesgo de alucinación y de errores de fidelidad propios de cualquier sistema de traducción neuronal, especialmente en frases largas o dominios poco representados.
- BLEU de 13,7 en FLORES-101 devtest para eng-kor es un valor moderado; no se recomienda su uso directo en producción sin revisión humana en dominios sensibles (legal, médico, financiero).
- Los resultados de la model card están marcados como no verificados (`verified: false`).
- El repositorio registra 0 descargas y 0 likes, lo que limita la validación comunitaria y el soporte disponible.
- Los campos de idiomas origen, idiomas destino y etiquetas de idioma válidas están vacíos en la model card, pese a que el texto describe un modelo multilingüe con token `>>id<<`. Esto puede provocar confusión al invocarlo y no se documenta qué identificadores son válidos.
- La fecha de creación del repositorio (2026-09-22) es posterior a la fecha de publicación declarada del modelo original (2022-07-28), coherente con una réplica, pero conviene verificar la procedencia de los pesos antes de desplegarlos.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución al autor y la indicación de los cambios realizados. No es una licencia de dominio público.
- La model card no documenta la longitud máxima de contexto, lo que obliga a consultar la configuración del modelo para planificar el troceado de textos largos.
- No se distribuyen pesos cuantizados ni soporte para los runners de inferencia más habituales en producción (vLLM, llama.cpp, Ollama), lo que limita las opciones de despliegue escalable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hans-Mueller/opus-mt-tc-big-en-ko
- Proyecto OPUS-MT (GitHub): https://github.com/Helsinki-NLP/Opus-MT
- Scripts de entrenamiento OPUS-MT-train: https://github.com/Helsinki-NLP/OPUS-MT-train
- Marian NMT (framework): https://marian-nmt.github.io/
- Corpus OPUS: https://opus.nlpl.eu/
- Documentación de modelos Marian en transformers: https://huggingface.co/docs/transformers/model_doc/marian
- Tatoeba Translation Challenge: https://github.com/Helsinki-NLP/Tatoeba-Challenge/
- README de modelos eng-kor en Tatoeba Challenge: https://github.com/Helsinki-NLP/Tatoeba-Challenge/tree/master/models/eng-kor/README.md
- Modelo Marian original (zip): https://object.pouta.csc.fi/Tatoeba-MT-models/eng-kor/opusTCv20210807-sepvoc_transformer-big_2022-07-28.zip
- Traducciones del conjunto de test: https://object.pouta.csc.fi/Tatoeba-MT-models/eng-kor/opusTCv20210807-sepvoc_transformer-big_2022-07-28.test.txt
- Puntuaciones de evaluación: https://object.pouta.csc.fi/Tatoeba-MT-models/eng-kor/opusTCv20210807-sepvoc_transformer-big_2022-07-28.eval.txt
- Artículo OPUS-MT (EAMT 2020): https://aclanthology.org/2020.eamt-1.61/
- Artículo Tatoeba Translation Challenge (WMT 2020): https://aclanthology.org/2020.wmt-1.139/
- Sesgos en modelos de lenguaje, Sheng et al. (2021): https://aclanthology.org/2021.acl-long.330.pdf
- Sesgos en modelos de lenguaje, Bender et al. (2021): https://dl.acm.org/doi/pdf/10.1145/3442188.3445922
