# haulai/mizo-mt-baseline

## Resumen

`haulai/mizo-mt-baseline` es un modelo de traducción automática neuronal del mizo (lus) al inglés, desarrollado por el usuario `haulai`. Se trata de un ajuste fino (fine-tuning) del modelo base `Helsinki-NLP/opus-mt-mul-en`, un modelo Marian de la familia Helsinki-NLP, especializado en traducción multilingüe hacia inglés. El modelo responde a la necesidad de recursos de traducción para el mizo, una lengua tibeto-burmana de bajo recurso hablada principalmente en el estado de Mizoram (India) y regiones vecinas.

El modelo se entrenó sobre el corpus Mizo NER, compuesto por 441.178 oraciones con etiquetas generadas automáticamente (silver-standard). Según la model card, alcanza un BLEU de 49,21 en la traducción mizo-inglés en el conjunto de prueba de ese corpus. La arquitectura es un transformer encoder-decoder Marian con 77.058.732 parámetros. No se especifica la longitud de contexto en la información disponible.

La relevancia de este modelo radica en que aborda una lengua de bajo recurso con pocos recursos digitales, y su entrenamiento sobre un corpus con marcado de entidades puede mejorar la traducción de nombres propios y términos específicos. No obstante, se trata de un modelo baseline, con una adopción aún muy limitada (0 descargas y 0 likes en Hugging Face), y su comportamiento en texto sin entidades no está probado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parámetros totales | 77.058.732 |
| Parámetros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Mizo (lus) -> inglés |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Marian, un transformer encoder-decoder de la familia Helsinki-NLP. Se trata de un fine-tuning del modelo `Helsinki-NLP/opus-mt-mul-en`, que originalmente traduce de múltiples idiomas al inglés. El ajuste se realizó sobre el corpus Mizo NER, compuesto por 441.178 oraciones en mizo con etiquetas de entidades generadas mediante un pipeline de proyección (silver-standard). No se indica el uso de técnicas de alineación como RLHF o DPO.

La variante descrita en la model card es la de "plain source", es decir, sin marcado de entidades en la entrada. El README advierte de que existe una variante con marcado de entidades que requiere el markup producido por el pipeline de proyección; si se alimenta con markup de un reconocedor externo, se pierde la ganancia en BLEU y se reduce la retención de entidades. No se mencionan innovaciones arquitectónicas más allá del fine-tuning estándar.

## Capacidades

- Traducción de texto en mizo (lus) a inglés, con un BLEU de 49,21 en el corpus Mizo NER.
- Entrenado específicamente en oraciones con entidades, lo que puede mejorar la traducción de nombres propios y términos especializados.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni uso como agente.
- No es multilingüe: solo cubre la dirección mizo-inglés.
- No dispone de capacidades de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Traducción de documentos lingüísticos y académicos sobre la lengua mizo: investigadores y lingüistas pueden utilizar el modelo para traducir textos de campo o corpus mizo al inglés, aprovechando su entrenamiento en oraciones con entidades para preservar nombres de lugares, personas y organizaciones.
- Acceso a noticias y contenido local de Mizoram para audiencias internacionales: medios y analistas pueden traducir artículos, boletines o publicaciones en mizo a inglés, facilitando la difusión de información regional.
- Asistencia en servicios públicos y administrativos: organismos que trabajan con comunidades mizos pueden integrar este modelo en herramientas de traducción para comunicados, formularios o documentación legal, reduciendo la barrera idiomática.
- Preprocesamiento para sistemas de NLP en mizo: el modelo puede generar traducciones al inglés que sirvan como entrada para otros sistemas (NER, análisis de sentimiento, clasificación), ampliando el ecosistema de procesamiento del lenguaje para esta lengua de bajo recurso.
- Creación de corpus paralelos mizo-inglés: el modelo puede utilizarse para traducir grandes volúmenes de texto en mizo, generando datos bilingües que luego pueden emplearse para entrenar o evaluar otros modelos de traducción.
- Integración en aplicaciones de viaje o comunicación: desarrolladores pueden incorporar el modelo en aplicaciones móviles o web para que turistas o visitantes en Mizoram traduzcan frases y carteles del mizo al inglés, gracias a su tamaño reducido (77 millones de parámetros) que permite ejecutarlo en dispositivos con recursos limitados.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| BLEU (corpus Mizo NER) | 49,21 |

No se han publicado comparativas con otros modelos de traducción mizo-inglés en la información disponible. El dato de BLEU procede de la model card del autor.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB para inferencia con pesos en FP32 (77 millones de parámetros ocupan aproximadamente 308 MB). Con FP16, la ocupación se reduce a unos 154 MB.
- GPU recomendadas: cualquier GPU moderna con al menos 1 GB de VRAM; el modelo también puede ejecutarse en CPU sin problemas.
- Cabe en consumer GPU: sí, prácticamente en cualquier GPU de consumo (GeForce, Radeon, etc.).
- Opciones de despliegue: Transformers (Python) mediante el pipeline de traducción, y Hugging Face Inference Endpoints. También puede exportarse a ONNX Runtime si se requiere una integración específica.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de modelos comparables en la información proporcionada. El modelo base `Helsinki-NLP/opus-mt-mul-en` es el punto de partida, pero no se han publicado resultados comparativos de rendimiento entre ambos. Por tanto, no es posible presentar una comparativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Entrenado únicamente en oraciones con entidades; el comportamiento en texto sin entidades no está probado.
- La variante con marcado de entidades (si se utiliza) requiere el markup producido por el pipeline de proyección. Alimentarla con markup de un reconocedor externo reduce el BLEU y la retención de entidades.
- Solo traduce de mizo a inglés; no soporta la dirección inversa (inglés a mizo).
- Riesgo de alucinación en traducciones de dominios no vistos, especialmente en un corpus de entrenamiento relativamente pequeño (441.178 oraciones).
- Posibles sesgos derivados del corpus de entrenamiento, que usa etiquetas silver-standard generadas automáticamente y no revisadas por expertos.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el modelo base `Helsinki-NLP/opus-mt-mul-en` puede tener condiciones adicionales que no se han verificado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haulai/mizo-mt-baseline
- Dataset Mizo NER: https://huggingface.co/datasets/haulai/mizo-ner
- Repositorio de código: https://github.com/thangkhanhau/mizo-ner
