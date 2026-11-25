# mradermacher/Panu-Omni-2B-i1-GGUF

## Resumen

Panu-Omni-2B-i1-GGUF es la versión cuantizada en formato GGUF del modelo Panu-Omni-2B, desarrollado originalmente por JonusNattapong y cuantizado por mradermacher. Se trata de un modelo multimodal de tipo "omni" construido sobre la arquitectura Liquid LFM3 (Liquid Foundation Model 3), que integra procesamiento de texto, audio y visión, incluyendo capacidades de speech-to-speech. El modelo base cuenta con aproximadamente 1.728 millones de parámetros (1,7B) y está orientado a tareas de razonamiento y conversación, con un enfoque particular en dialectos tailandeses junto con soporte para inglés, chino, japonés, francés, alemán y español.

La relevancia de esta ficha reside en que la versión i1-GGUF de mradermacher emplea cuantización con matriz de importancia (imatrix), lo que permite ejecutar un modelo multimodal de 1,7B en hardware de consumo con un tamaño de archivo que va desde 0,6 GB (IQ1_S) hasta 1,5 GB (Q6_K). Esto lo convierte en una opción práctica para prototipado local de aplicaciones de voz y visión en un solo modelo compacto.

Cabe destacar que el modelo base incorpora las etiquetas "abliterated" y "uncensored", lo que indica que se ha aplicado una técnica de eliminación de rechazos (abliteration) sobre el modelo original, reduciendo los mecanismos de negativa ante ciertas peticiones. Esta característica tiene implicaciones importantes para el despliegue en producción que se detallan en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Liquid LFM3 (lfm3-omni), transformer multimodal (texto, audio, visión) |
| Parametros totales | 1.728.801.600 (~1,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-IQ3_XXS, i1-Q2_K, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (cuantizacion con imatrix) |
| Idiomas soportados | th, en, zh, ja, fr, de, es (segun la model card del modelo base) |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la familia Liquid LFM3, una arquitectura de tipo transformer optimizada para despliegue eficiente, según se desprende de las etiquetas "liquid" y "lfm3" de la model card. La variante "omni" amplía las capacidades del modelo base para abarcar múltiples modalidades: audio (incluyendo speech-to-speech) y visión, además del procesamiento de texto. El modelo incorpora además un modo de razonamiento ("reasoning") según las etiquetas declaradas. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO.

La versión aquí descrita es una cuantización i1-GGUF generada con matriz de importancia (imatrix) a partir del modelo JonusNattapong/Panu-Omni-2B. Según la model card, las cuantizaciones IQ suelen ofrecer mejor calidad que las no-IQ de tamaño similar, y se proporciona además el archivo imatrix (0,1 GB) para que los usuarios puedan generar sus propias cuantizaciones. Los archivos mmproj (necesarios para el procesamiento de visión) no están en este repositorio, sino en el repositorio estático de cuantizaciones (mradermacher/Panu-Omni-2B-GGUF). No se dispone de información sobre innovaciones técnicas específicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con modo de razonamiento ("reasoning") declarado en las etiquetas.
- Procesamiento multimodal: entrada de audio y visión, además de texto.
- Speech-to-speech: capacidad de recibir audio y generar respuestas habladas, según la etiqueta "speech-to-speech".
- Soporte multilingüe para tailandés, inglés, chino, japonés, francés, alemán y español.
- Especialización en dialectos tailandeses ("thai-dialects").
- Modelo "abliterated" y "uncensored": se ha reducido el comportamiento de rechazo ante peticiones, lo que afecta al filtrado de contenido.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de voz locales: gracias a su capacidad speech-to-speech y su tamaño de 1,7B, puede desplegarse en un portátil con llama.cpp para construir un asistente conversacional por voz sin depender de la nube, usando las cuantizaciones Q4_K_M (1,2 GB).
- Transcripción y respuesta en tailandés con dialectos: el modelo está específicamente orientado a dialectos tailandeses, lo que lo hace adecuado para aplicaciones de atención al ciudadano o servicios locales en Tailandia donde otros modelos multilingües genéricos fallan.
- Prototipado de aplicaciones multimodales en hardware de consumo: con cuantizaciones IQ3_S (1,0 GB) o IQ4_XS (1,1 GB) puede ejecutarse en GPUs de 4-8 GB de VRAM, permitiendo experimentar con entrada de imagen y audio en un solo modelo.
- Traducción y conversación multilingüe ligera: con soporte declarado para siete idiomas (th, en, zh, ja, fr, de, es), puede emplearse en herramientas de traducción de bajo coste o chatbots multilingües en entornos con recursos limitados.
- Investigación sobre alineación y modelos "uncensored": al ser una variante abliterated, es útil para estudiar el comportamiento de modelos sin rechazos, comparar respuestas frente al modelo base y analizar sesgos residuales en entornos de investigación controlados.
- Despliegue en dispositivos edge o embebidos: el tamaño mínimo de 0,6 GB (IQ1_S) permite ejecutar el modelo en dispositivos con poca memoria, aunque con la penalización de calidad asociada a las cuantizaciones de 1-2 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,6 GB y 1,5 GB para los pesos según cuantización (IQ1_S a Q6_K), más el overhead de contexto y, en su caso, los archivos mmproj para visión.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente para las cuantizaciones Q4-Q6; para visión y audio conviene disponer de 6-8 GB.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas con suficiente memoria compartida para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación de GGUF), y otros runners compatibles con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponible en la información proporcionada. A modo orientativo general para modelos de 1,7B en GGUF, el throughput en GPU consumer suele ser alto, pero no se aportan cifras concretas para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| Panu-Omni-2B-i1-GGUF (este) | ~1,7B | no disponible | texto, audio, visión, speech-to-speech | lfm1.0 | GGUF (i1) |
| Panu-Omni-2B (base) | ~1,7B | no disponible | texto, audio, visión, speech-to-speech | lfm1.0 | safetensors |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de modelos comparables de la misma categoría (omni multimodal de ~2B) para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Modelo "abliterated" y "uncensored": se ha eliminado o reducido el comportamiento de rechazo, por lo que puede generar contenido inapropiado, ofensivo o inseguro. No es recomendable para aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación: como todo modelo de 1,7B, la precisión factual es limitada y puede inventar datos, especialmente en tareas de razonamiento complejo o contextos largos.
- Sesgos conocidos: no se documentan en la información disponible, pero al entrenarse con datos multilingües y dialectales es probable que herede sesgos de dichos corpus.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada; el soporte multilingüe se declara en la model card del modelo base, pero no se aportan métricas de calidad por idioma.
- Restricciones de licencia: la licencia es lfm1.0 (license: other). Es imprescindible revisar los términos de la licencia LFM 1.0 antes de cualquier uso comercial, ya que puede contener restricciones específicas.
- Los archivos mmproj para visión no están en este repositorio, sino en el repositorio estático; es necesario descargarlos por separado para usar las capacidades visuales.
- Las cuantizaciones de 1-2 bits (IQ1_S, IQ2_XXS) degradan notablemente la calidad; la propia model card las describe como "for the desperate" o "mostly desperate".

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Panu-Omni-2B-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Panu-Omni-2B-GGUF
- Modelo base: https://huggingface.co/JonusNattapong/Panu-Omni-2B
- Página de resumen de descargas de mradermacher: https://hf.tst.eu/model#Panu-Omni-2B-i1-GGUF
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa de mradermacher: https://www.nethype.de/
