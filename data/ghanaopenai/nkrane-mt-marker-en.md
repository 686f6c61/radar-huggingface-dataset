# ghanaopenai/nkrane-mt-marker-en

## Resumen

`nkrane-mt-marker-en` es un modelo de clasificación de tokens (sequence tagging) desarrollado por GhanaOpenAI como componente del pipeline de traducción automática Nkrane-MT, orientado a pares de lenguas inglés–twi asante. Su función es detectar y delimitar sintagmas nominales concretos y entidades nombradas en texto en inglés, insertando marcas angulares `<...>` alrededor de los términos que el modelo de traducción posterior debe preservar de forma literal en la lengua destino. No es un modelo generativo ni un traductor: es un etiquetador auxiliar que automatiza el preprocesado de la entrada inglesa.

Técnicamente se trata de un fine-tuning de `distilbert-base-uncased`, un transformer encoder de 6 capas y 66.365.187 parámetros, sobre las 763.594 parejas de frases del corpus paralelo `nkrane-mt-parallel-corpus-eng-twi`. El etiquetado emplea el esquema BIO con tres clases (`O`, `B-PRESERVE`, `I-PRESERVE`), de modo que cada token se clasifica como parte o no de una entidad a preservar. El modelo declara una latencia de inferencia inferior a 5 ms por frase, lo que lo hace viable como paso síncrono en un pipeline de traducción.

Su relevancia actual es acotada pero clara: cubre un nicho poco atendido, la preservación de entidades en traducción automática para lenguas africanas de bajos recursos, y lo hace con un modelo pequeño (0,3 GB de repositorio) y licencia Apache 2.0, lo que permite integrarlo en producción sin restricciones comerciales. No obstante, su alcance es monolingüe (solo inglés de entrada) y su utilidad está ligada al ecosistema Nkrane-MT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas) para clasificación de tokens |
| Parametros totales | 66.365.187 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada de distilbert-base-uncased; no declarada en la model card) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantizaciones GGUF/ONNX no publicadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, la variante destilada de BERT con 6 capas, 768 dimensiones ocultas y 66M de parámetros, y se ajusta como cabeza de clasificación de tokens con tres etiquetas: `O` (token fuera de entidad), `B-PRESERVE` (inicio de un término a preservar) e `I-PRESERVE` (continuación de un término a preservar). El esquema BIO permite delimitar sintagmas de longitud variable, desde un sustantivo simple hasta construcciones compuestas como "president of Ghana" o "Ministry of Finance".

El entrenamiento se realizó sobre las 763.594 parejas de frases del corpus `nkrane-mt-parallel-corpus-eng-twi`, con optimizador AdamW, tasa de aprendizaje 3e-5, scheduler coseno y 500 pasos de warmup, en una única GPU NVIDIA H200 (140 GB) en precisión bfloat16. La model card no detalla el número de épocas, el tamaño de batch ni la composición exacta del conjunto de validación, ni especifica si se aplicaron técnicas de aumento de datos o filtrado de ruido en las anotaciones. Tampoco se documenta ningún proceso de RLHF o DPO, coherente con la naturaleza discriminativa del modelo.

La innovación técnica no reside en la arquitectura, sino en el diseño del pipeline: el marcado automático de entidades en la entrada inglesa permite que el modelo de traducción seq2seq preserve literalmente los términos marcados en la salida en twi, mientras traduce libremente los conceptos abstractos. El etiquetador sustituye así el marcado manual que de otro modo requeriría el usuario final.

## Capacidades

- Clasificación de tokens y etiquetado de secuencias (sequence tagging) sobre texto en inglés.
- Detección y delimitación de sintagmas nominales concretos, organizaciones, títulos compuestos y grupos demográficos.
- Inserción automática de marcas angulares `<...>` alrededor de los términos detectados, lista para consumo por el modelo de traducción Nkrane-MT.
- Reconocimiento de entidades nombradas (NER) en sentido amplio, incluyendo fechas y expresiones temporales compuestas como "May 2026".
- Distinción entre términos a preservar y conceptos abstractos (información, desarrollo, paz, justicia, paciencia), que no se marcan y se traducen libremente.
- Integración programática mediante la clase `NounPhraseMarker` del paquete `nkrane_mt`, con el método `mark()` que devuelve el texto marcado y la lista de sintagmas detectados.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento: es un etiquetador discriminativo, no un modelo generativo.

## Casos de uso

- Preprocesado en pipelines de traducción inglés–twi: el modelo marca las entidades de la frase de entrada antes de pasarla al modelo seq2seq, garantizando que nombres propios, instituciones y cargos se preserven literalmente en la salida en twi asante.
- Traducción de documentos institucionales y administrativos: comunicados, notas de prensa y textos oficiales donde los nombres de ministerios, organismos y cargos deben mantenerse intactos, con un coste de inferencia inferior a 5 ms por frase.
- Localización de contenido web y aplicaciones para el mercado ghanés: integración como paso previo en un servicio de traducción que recibe texto libre del usuario y necesita preservar marcas, nombres de producto y entidades locales.
- Extracción de entidades en corpus ingleses de dominio público: reutilización del etiquetador como NER ligero para poblar bases de datos de organizaciones, cargos o fechas, dado su tamaño reducido (0,3 GB) y su licencia permisiva.
- Anotación asistida de corpus paralelos: generación automática de marcas `B-PRESERVE`/`I-PRESERVE` que después revisa un anotador humano, reduciendo el coste de construir nuevos conjuntos de entrenamiento para traducción con preservación de entidades.
- Despliegue en entornos con recursos limitados: al ser un DistilBERT de 66M de parámetros, puede ejecutarse en CPU con latencias aceptables para procesamiento por lotes de documentos, sin necesidad de GPU dedicada.
- Investigación en traducción automática para lenguas de bajos recursos: base reproducible para experimentar con esquemas de preservación de entidades en otros pares de lenguas, partiendo de un checkpoint abierto y una licencia Apache 2.0.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| F1 | 0,8139 |
| Accuracy (token) | 0,9470 |
| Precision | 0,8085 |
| Recall | 0,8193 |
| Latencia de inferencia | < 5 ms |

| Tarea | Dataset de evaluacion |
|---|---|
| Deteccion de sintagmas nominales y entidades para Nkrane-MT | `ghanaopenai/nkrane-mt-parallel-corpus-eng-twi` |

No se han publicado resultados comparativos con otros etiquetadores NER en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (66M de parámetros, ~265 MB de pesos); en fp16 o bfloat16, en torno a 130-150 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo se entrenó en una NVIDIA H200, pero para inferencia resultan adecuadas tarjetas consumer como GTX 1650, RTX 3060, RTX 4060 o superiores.
- Cabe holgadamente en GPU consumer y también en CPU: con 66M de parámetros, el procesamiento por lotes en CPU es viable para volúmenes moderados.
- Opciones de despliegue: `transformers` (pipeline `token-classification`), `nkrane_mt` (clase `NounPhraseMarker`), ONNX Runtime y, en general, cualquier runtime compatible con modelos BERT-like. vLLM, llama.cpp, Ollama y TGI no están orientados a este tipo de modelo y no se documentan como opciones.
- Latencia y throughput: el autor declara menos de 5 ms por frase en el hardware de referencia; no se especifican valores de throughput agregado ni latencias en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ghanaopenai/nkrane-mt-marker-en` | 66,4M | No disponible | Etiquetado de sintagmas y entidades para preservación en traducción EN–twi | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased` | 66,4M | 512 tokens (arquitectura BERT) | Modelo base encoder; requiere fine-tuning para NER | Apache 2.0 | Hugging Face |
| `dslim/bert-base-NER` | ~110M | 512 tokens (arquitectura BERT) | NER genérico en inglés (PER, ORG, LOC, MISC) | MIT | Hugging Face |

La comparación directa con etiquetadores NER genéricos no es estrictamente equivalente: `nkrane-mt-marker-en` no predice categorías de entidad (persona, organización, lugar), sino una única clase funcional `PRESERVE` orientada a la preservación literal en traducción. No se dispone de datos de benchmarks que permitan comparar su F1 con el de otros etiquetadores sobre el mismo corpus.

## Limitaciones y advertencias

- El modelo solo procesa texto en inglés; no acepta entradas en twi ni en otras lenguas.
- Su utilidad está acoplada al pipeline Nkrane-MT: fuera de ese contexto, el marcado `<...>` carece de significado sin un modelo seq2seq entrenado para interpretarlo.
- No se documentan análisis de sesgos; al entrenarse sobre un corpus paralelo inglés–twi, puede heredar sesgos de representación del corpus de origen (predominio de ciertas instituciones, cargos y topónimos ghaneses).
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador, no un generador), pero sí riesgo de falsos positivos y falsos negativos en la delimitación de entidades: la precisión declarada (0,8085) y el recall (0,8193) implican que aproximadamente un 19 % de las entidades reales no se marcarán y un 19 % de las marcas serán incorrectas.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en la model-index).
- No se especifica la longitud máxima de secuencia soportada ni el comportamiento con textos que excedan el límite del encoder; conviene truncar o segmentar entradas largas.
- La licencia Apache 2.0 permite uso comercial y modificación, pero no se ofrece garantía alguna sobre el rendimiento en dominios distintos del corpus de entrenamiento.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ghanaopenai/nkrane-mt-marker-en
- Repositorio GitHub de Nkrane-MT: https://github.com/GhanaOpenAI/nkrane-mt
- Corpus paralelo inglés–twi: https://huggingface.co/datasets/ghanaopenai/nkrane-mt-parallel-corpus-eng-twi
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Organización en GitHub: https://github.com/GhanaOpenAI
