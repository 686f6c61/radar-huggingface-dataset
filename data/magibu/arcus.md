# magibu/Arcus

## Resumen

Arcus es un tokenizer y processor multimodal desarrollado por Magibu AI Research, un grupo de investigación turco centrado en modelos de lenguaje para turco y otros idiomas de bajos recursos. No se trata de un modelo de lenguaje con pesos, sino de un paquete de tokenización que combina el vocabulario BPE propio de Magibu (65.536 unidades) con la infraestructura del tokenizer del modelo `meta-models/Muse-Glimmer-30B` (200.000 tokens). El resultado es un vocabulario unificado de 243.305 tokens (245.353 incluyendo tokens especiales) diseñado para mejorar la eficiencia en turco y facilitar el entrenamiento de modelos con ese idioma.

La relevancia de Arcus radica en que aborda un problema recurrente en la tokenización de idiomas con morfología aglutinante como el turco: la segmentación ineficiente en subpalabras. Al fusionar dos vocabularios y aplicar reglas de mezcla, Arcus ofrece una representación más compacta y adaptada al turco, además de incluir una plantilla de chat con respuesta por defecto en turco y soporte para flujos multimodales (texto, imagen, vídeo) y herramientas ATEM. Es una pieza de infraestructura pensada para investigadores que deseen entrenar o ajustar modelos con una tokenización optimizada para turco.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BPE (Byte Pair Encoding) con tokenizer y processor multimodal |
| Parámetros totales | No aplica (no contiene pesos de modelo) |
| Parámetros activos | No aplica |
| Longitud de contexto | No especificada (depende del modelo base) |
| Tipos de cuantización | No aplica (tokenizer) |
| Idiomas soportados | Turco (prioritario), otros idiomas de bajos recursos (según el vocabulario de origen) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica (solo archivos de tokenizer y processor) |

## Arquitectura y entrenamiento

Arcus no es un modelo neuronal, sino un tokenizer BPE multimodal preparado por Magibu AI. El proceso de construcción consistió en combinar el vocabulario BPE de 65.536 unidades de Magibu con el tokenizer del modelo `meta-models/Muse-Glimmer-30B`, que originalmente tenía un vocabulario de 200.000 tokens. Se inyectaron 43.305 tokens nuevos del vocabulario Magibu, quedando un total de 243.305 tokens en el vocabulario final. Además, se añadieron 147.769 reglas de merge provenientes del vocabulario Magibu, mientras que se conservaron 396.080 reglas del tokenizer objetivo. El resultado respeta el límite de 2^18 tokens (262.144) y mantiene la compatibilidad con Hugging Face Transformers.

El tokenizer incluye una plantilla de chat personalizada que establece el turco como idioma de respuesta por defecto, así como un processor compatible con flujos de texto, imagen, vídeo, modo de pensamiento y herramientas ATAM. También se proporciona el archivo `merged-to-original-token-ids.json` que mapea cada ID del vocabulario fusionado a los IDs del tokenizer original, lo que permite inicializar embeddings durante el entrenamiento de un modelo nuevo.

## Capacidades

- Tokenización BPE optimizada para turco, con un vocabulario ampliado de 243.305 tokens.
- Compatible con el ecosistema Hugging Face Transformers (`AutoTokenizer` y `AutoProcessor`).
- Soporte de plantilla de chat con respuesta por defecto en turco.
- Procesador multimodal: acepta entradas de texto, imagen y vídeo, además de flujos de pensamiento y herramientas ATAM.
- Mapeo de IDs de token para transferencia de embeddings durante el entrenamiento (`merged-to-original-token-ids.json`).
- No incluye pesos de modelo; es un componente de infraestructura para entrenar o ajustar modelos.

## Casos de uso

- **Entrenamiento de modelos de lenguaje en turco**: Arcus permite entrenar un modelo desde cero o continuar el entrenamiento de un modelo multilingüe con un tokenizador adaptado al turco, mejorando la eficiencia de segmentación y reduciendo el número de tokens por palabra.
- **Ajuste fino de modelos base multilingües**: Al ampliar el vocabulario con tokens turcos, se puede ajustar un modelo como Muse-Glimmer-30B sobre datos turcos, manteniendo la compatibilidad con el tokenizador fusionado.
- **Sistemas de atención al cliente en turco**: El tokenizer es adecuado para crear modelos de conversación que respondan en turco con una plantilla de chat predefinida, reduciendo la latencia en entornos de producción.
- **Procesamiento multimodal en turco**: El processor soporta entradas de imagen y vídeo, lo que permite construir pipelines de visión-lenguaje en turco para análisis de imágenes, generación de descripciones o búsqueda visual.
- **Despliegue en entornos con recursos limitados**: Al ser un tokenizer ligero, puede integrarse en aplicaciones móviles o de escritorio para preprocesar texto en turco antes de enviarlo a un modelo remoto.
- **Investigación en tokenización de idiomas aglutinantes**: Arcus sirve como caso de estudio para comparar la eficiencia de vocabularios híbridos en idiomas como el turco, frente a tokenizadores genéricos como el de GPT o LLaMA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al ser un tokenizer, no se evalúa con métricas como MMLU o HumanEval. La eficiencia podría medirse en términos de tokens por palabra o tasa de compresión, pero no se proporcionan datos numéricos.

## Requisitos de hardware

- **VRAM**: No requiere GPU, ya que es solo un tokenizer/processor. Puede ejecutarse en CPU con menos de 1 GB de RAM.
- **GPU recomendadas**: No aplica.
- **Compatibilidad con consumer GPU**: Sí, cualquier dispositivo con Python y Transformers puede cargarlo.
- **Opciones de despliegue**: Se integra con Hugging Face Transformers; no requiere servidores de inferencia.
- **Latencia**: Despreciable, la tokenización es instantánea en CPU.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros tokenizadores turcos. Sin embargo, se puede comparar con los tokenizadores de modelos multilingües como XLM-R (vocabulario de 250.000 tokens) o mT5 (250.000 tokens), que cubren el turco entre muchos idiomas. Arcus se distingue por su enfoque específico en turco y su integración con el tokenizador de Muse-Glimmer-30B, lo que facilita la adaptación de modelos existentes. La comparativa exacta no está disponible en la información.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: Arcus no contiene pesos de modelo; es solo un tokenizador y processor. No puede generar texto por sí mismo.
- **Solo tokenizador**: No se pueden hacer pruebas de rendimiento de tareas lingüísticas con él directamente.
- **Enfoque en turco**: Aunque se mencionan otros idiomas de bajos recursos, el diseño está orientado principalmente al turco, y el vocabulario puede no ser óptimo para otros idiomas.
- **Dependencia del modelo base**: La fusión de vocabulario se basa en el tokenizador de Muse-Glimmer-30B, por lo que la compatibilidad con otros modelos no está garantizada.
- **Sin datos de eficiencia**: No se proporcionan métricas de compresión o velocidad de tokenización, por lo que no se puede cuantificar la mejora respecto a tokenizadores genéricos.
- **Riesgo de sesgos**: No se han documentado sesgos específicos, pero al estar diseñado para turco puede tener una cobertura desigual para otros idiomas de bajos recursos.

## Enlaces

- [Repositorio HuggingFace: magibu/Arcus](https://huggingface.co/magibu/Arcus)
- [Página oficial de Magibu AI (turco)](https://magibu.ai/)
- [Página oficial de Magibu AI (inglés)](https://magibu.ai/en/)
- [Perfil de Magibu en HuggingFace](https://huggingface.co/magibu)
- [Organización GitHub de Magibu](https://github.com/magibu-ai)
- [Modelo base: meta-models/Muse-Glimmer-30B](https://huggingface.co/meta-models/Muse-Glimmer-30B)
