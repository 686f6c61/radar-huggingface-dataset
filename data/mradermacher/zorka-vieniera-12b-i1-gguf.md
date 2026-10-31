# mradermacher/zorka-vieniera-12b-i1-GGUF

## Resumen

Zorka-vieniera-12b-i1-GGUF es una colección de cuantizaciones en formato GGUF, con matriz de importancia (imatrix), del modelo ewxxyyzz/zorka-vieniera-12b, realizadas por el cuantizador conocido mradermacher. El modelo base es un modelo de lenguaje de unos 12.900 millones de parámetros orientado al bielorruso (código de idioma "be"), entrenado sobre los datasets ewxxyyzz/karotkizmest, wikimedia/wikipedia y cis-lmu/GlotCC-V1. Según la model card del repositorio estático, se trata de un modelo con capacidades de visión (vision model), aunque no se han publicado detalles técnicos adicionales por parte del autor original.

La relevancia de esta ficha radica en la escasez de LLMs abiertos centrados en bielorruso, un idioma con muy poca representación en los grandes modelos comerciales. Este repositorio facilita la ejecución local del modelo en hardware modesto gracias a las más de veinte variantes de cuantización disponibles, que van desde 3,4 GB (IQ1_S) hasta 10,7 GB (Q6_K). La licencia Apache 2.0 del modelo base permite su uso comercial sin restricciones.

Cabe destacar que la información disponible procede casi exclusivamente de la model card del cuantizador; el autor del modelo base no ha publicado una ficha técnica detallada, por lo que varios datos (arquitectura, contexto, benchmarks) no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, según la librería transformers) |
| Parametros totales | 12.913.983.536 (12,91 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_M, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | bielorruso (be) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix; también existe repositorio de cuantizaciones estáticas) |

## Arquitectura y entrenamiento

No se ha publicado información oficial sobre la arquitectura del modelo base más allá de que se distribuye con la librería transformers. La model card del cuantizador indica que se trata de un modelo de visión (vision model), lo que sugiere la presencia de un componente multimodal, aunque no hay detalles sobre el vision encoder ni sobre los archivos mmproj. Tampoco consta el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas de alineación como RLHF o DPO.

Los datasets de entrenamiento declarados en los metadatos son tres: ewxxyyzz/karotkizmest (dataset propio del autor, sin documentación pública disponible), wikimedia/wikipedia (el volcado de Wikipedia de Wikimedia, que aportaría texto enciclopédico en bielorruso) y cis-lmu/GlotCC-V1 (un corpus abierto multilingüe de texto web recopilado por la Universidad Complutense de Berlín/LMU, orientado a idiomas con pocos recursos). Esta combinación apunta a un modelo entrenado específicamente para reforzar capacidades en bielorruso sobre una base preentrenada previa, aunque la naturaleza exacta del entrenamiento (fine-tuning, continued pretraining) no está documentada.

En cuanto al repositorio cuantizado, mradermacher emplea cuantizaciones con matriz de importancia (imatrix), una técnica que calcula la importancia de cada peso sobre un dataset de calibración para reducir la pérdida de calidad en cuantizaciones agresivas, especialmente en las variantes IQ (importance quantization) de ikawrakow, que suelen superar a las variantes K estáticas de tamaño equivalente.

## Capacidades

- Generación de texto en bielorruso: es el objetivo principal del modelo base, entrenado con corpus en ese idioma.
- Comprensión de texto enciclopédico: el entrenamiento con Wikipedia aporta conocimiento general en bielorruso.
- Procesamiento de texto web multilingüe: el corpus GlotCC-V1 aporta diversidad de registros y dominios.
- Capacidades de visión: la model card del cuantizador lo califica como vision model, aunque no hay documentación sobre esta capacidad ni sobre los archivos mmproj correspondientes (se remiten al repositorio estático).
- No consta soporte documentado de tool calling, function calling, agentes ni thinking mode.

## Casos de uso

- Generación de contenido en bielorruso: redacción de artículos, entradas de blog o material divulgativo en un idioma con escaso soporte en LLMs comerciales; el entrenamiento con Wikipedia y GlotCC le da familiaridad con el registro escrito estándar.
- Corrección y mejora de textos en bielorruso: revisión gramatical y de estilo de documentos escritos por humanos, aprovechando la exposición a texto enciclopédico bien editado.
- Chatbots locales en bielorruso: despliegue en Ollama o llama.cpp para asistentes conversacionales en entornos donde la privacidad es crítica (administración pública, educación), ejecutando la variante Q4_K_M en una GPU de consumo.
- Traducción y apoyo a la localización: como asistente para localizadores que trabajan del ruso o el inglés al bielorruso, un nicho donde los modelos generalistas suelen rendir por debajo de lo necesario.
- Preservación lingüística e investigación académica: base para experimentos de NLP en idiomas de bajos recursos, con licencia Apache 2.0 que permite investigación y producto sin fricción legal.
- Clasificación y extracción de información en bielorruso: tareas de etiquetado de documentos, resumen o extracción de entidades sobre corpus administrativos o periodísticos en ese idioma.
- Pruebas de capacidades de visión en idiomas de bajos recursos: si la parte multimodal funciona como indica la model card, podría evaluarse en tareas de descripción de imágenes con instrucciones en bielorruso, aunque esto requiere verificación empírica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni el autor del modelo base ni el cuantizador han publicado evaluaciones en MMLU, HumanEval, GSM8K ni ninguna otra batería estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la variante elegida. Aproximadamente 3,4 GB para IQ1_S, unos 8 GB para Q4_K_M (la recomendada por el cuantizador) y 10,7 GB para Q6_K, más la memoria del KV cache según la longitud de contexto.
- GPU recomendadas: para las variantes medias (Q4_K_M, 8 GB), una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 permiten ejecución completamente en GPU. Para Q6_K, una RTX 4090 (24 GB) o superior es cómoda. También es viable CPU pura o descarga parcial en GPU.
- Consumer GPU: sí, la mayoría de variantes caben en GPUs de consumo; incluso las variantes Q5 y Q6 caben en tarjetas de 12-16 GB si se gestiona bien el contexto.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp, y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa completa; para esos runtimes habría que usar los pesos originales del modelo base en safetensors.
- Latencia y throughput: no disponibles; al ser un modelo de ~13 B parámetros, en una RTX 4090 con cuantización Q4_K_M se puede esperar un throughput del orden de decenas de tokens por segundo, aunque no hay mediciones publicadas.
- Nota: los archivos mmproj para la parte de visión estarían en el repositorio estático, no en este.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zorka-vieniera-12b (base) | 12,91 B | no disponible | apache-2.0 | safetensors + GGUF (imatrix y estático) |
| Qwen2.5-14B-Instruct | 14,7 B | 128 K | Qwen license (uso comercial condicionado) | safetensors + GGUF |
| Mistral-Nemo-Instruct-12B | 12,2 B | 128 K | apache-2.0 | safetensors + GGUF |
| Gemma-2-12B-it (approx. por tamaño: Gemma-2-9B-it) | 9 B | 8 K | Gemma license | safetensors + GGUF |

Comparación cualitativa: frente a Qwen2.5-14B o Mistral-Nemo, zorka-vieniera-12b apuesta por un enfoque especializado en bielorruso, donde probablemente supere a los modelos generalistas multilingües en ese idioma concreto, aunque sin benchmarks publicados no es posible cuantificarlo. En capacidades generales (codigo, razonamiento, contexto largo), los modelos generalistas citados disponen de documentación y benchmarks mucho más sólidos.

## Limitaciones y advertencias

- Documentación escasa: el autor del modelo base no publica model card detallada; arquitectura, contexto, datos de entrenamiento y método de alineación son desconocidos, lo que dificulta evaluar su fiabilidad antes de producción.
- Sesgos: no caracterizados. Al entrenarse con Wikipedia y texto web (GlotCC), heredará sesgos de esos corpus, incluidos posibles sesgos políticos e históricos presentes en contenido sobre Bielorrusia.
- Alucinaciones: riesgo estándar de un LLM de 12 B; en un idioma de bajos recursos, sin benchmarks que respalden la fidelidad factual, el riesgo puede ser mayor. Verificar siempre los hechos generados.
- Idioma: el modelo está orientado a bielorruso; no hay garantías de rendimiento en castellano, inglés u otros idiomas.
- Contexto: longitud de ventana no documentada; no planificar cargas de trabajo con documentos largos sin verificarla empíricamente.
- Licencia: Apache 2.0 permite uso comercial, pero al provenir de un entrenamiento poco documentado, conviene revisar la procedencia de los datasets (karotkizmest no está documentado públicamente) por si existieran problemas de procedencia de datos.
- Cuantizaciones extremas: las variantes IQ1_S/IQ1_M (marcadas "for the desperate" por el propio cuantizador) degradan notablemente la calidad; usar como mínimo Q4_K_M para uso serio.
- Visión: la capacidad multimodal está solo mencionada por el cuantizador y no está documentada por el autor; tratarla como no verificada.

## Enlaces

- Repositorio cuantizado (imatrix): https://huggingface.co/mradermacher/zorka-vieniera-12b-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/zorka-vieniera-12b-GGUF
- Modelo base: https://huggingface.co/ewxxyyzz/zorka-vieniera-12b
- Visión general de archivos y descargas: https://hf.tst.eu/model#zorka-vieniera-12b-i1-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador (nethype GmbH): https://www.nethype.de/
- Dataset karotkizmest: https://huggingface.co/datasets/ewxxyyzz/karotkizmest
- Dataset Wikipedia (Wikimedia): https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset GlotCC-V1: https://huggingface.co/datasets/cis-lmu/GlotCC-V1
