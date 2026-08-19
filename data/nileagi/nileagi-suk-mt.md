# nileagi/nileagi-suk-mt

## Resumen

El modelo `nileagi/nileagi-suk-mt` es un sistema de traducción automática neuronal (NMT) que traduce del **swahili al sukuma**, desarrollado por **NileAGI**, una empresa de investigación en IA con sede en África. Este checkpoint es un experimento de validación del pipeline de entrenamiento, no una versión de producción, y está diseñado específicamente para el registro literario y religioso de ambos idiomas. El modelo se basa en la arquitectura **M2M-100** (indicada por las etiquetas de HuggingFace) y cuenta con **615 millones de parámetros**, un tamaño moderado que lo hace viable para despliegue en hardware de gama media.

La relevancia de este modelo radica en su objetivo: abordar la traducción automática para una lengua bantú con recursos limitados como el sukuma, hablado por millones de personas en Tanzania. Aunque es un experimento, representa un paso hacia la inclusión lingüística en África Oriental y sirve como componente de entrada para otros proyectos de NileAGI, como el sistema de síntesis de voz `nileagi/nileagi-suk-tts`. Su carácter experimental y su licencia restrictiva (`other`) limitan su uso a investigación, pero demuestran la viabilidad técnica de entrenar modelos de traducción para pares de lenguas de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | M2M-100 (seq2seq transformer) |
| Parametros totales | 615.080.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | swahili (sw), sukuma (suk) |
| Licencia | other (terminos de investigacion de NileAGI) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura **M2M-100** de Facebook AI, un transformer encoder-decoder de secuencia a secuencia diseñado específicamente para traducción multilingüe. Aunque el checkpoint original de M2M-100 soporta 100 idiomas, esta versión ha sido fine-tuneada o entrenada desde un punto de control para el par específico swahili→sukuma. Los detalles exactos del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) **no están disponibles** en la información proporcionada.

La model card indica que es una "validación corta del pipeline de entrenamiento" sobre el dataset `nileagi/nileagi-suk-data`, lo que sugiere que el entrenamiento fue breve y con fines de verificación técnica. El registro de salida se limita al sukuma literario/religioso, según las limitaciones declaradas. No se mencionan innovaciones técnicas específicas más allá del uso de la arquitectura M2M-100.

## Capacidades

- **Traducción swahili→sukuma**: única dirección soportada; no realiza traducción inversa.
- **Registro literario/religioso**: entrenado principalmente con textos de este tipo, por lo que su output se ajusta a ese registro.
- **Integración con pipeline TTS**: diseñado como entrada para el sistema de síntesis de voz `nileagi/nileagi-suk-tts`.
- **Compatibilidad con Transformers**: se puede cargar con `AutoModelForSeq2SeqLM` y `AutoTokenizer` de HuggingFace.
- **Generación controlada por idioma**: usa `forced_bos_token_id` para forzar el idioma de salida (`suk_Latn`).
- **Sin capacidades de chat, agentes o tool calling**: es un modelo puramente de traducción.

## Casos de uso

- **Traducción de textos religiosos**: el modelo puede traducir biblias, sermones u otros materiales litúrgicos del swahili al sukuma, un caso de uso declarado en la model card. Su entrenamiento en registro religioso lo hace adecuado para este fin.
- **Investigación académica en lingüística**: investigadores que estudien la lengua sukuma pueden usarlo para analizar traducciones existentes o generar nuevos textos de referencia para estudios comparativos.
- **Preservación y revitalización lingüística**: organizaciones que trabajen en la documentación del sukuma pueden utilizar el modelo para generar material escrito en esta lengua, contribuyendo a su preservación digital.
- **Preprocesamiento para TTS**: como componente de entrada al pipeline `nileagi/nileagi-suk-tts`, permite convertir texto swahili en voz sukuma, útil para audiolibros o contenido audiovisual religioso.
- **Evaluación de calidad de traducción automática**: el modelo puede servir como baseline para comparar futuros sistemas de traducción swahili-sukuma, usando chrF2 como métrica principal.
- **Generación de datos de entrenamiento**: las traducciones generadas pueden usarse para aumentar datasets existentes de sukuma, siempre que se revisen manualmente antes de usarse en otros sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la métrica principal es **chrF2** sobre un split de test por grupos de documentos, con BLEU como métrica secundaria, pero no se proporcionan valores numéricos. Dado que es una validación de pipeline de un solo paso, los resultados no representan una línea base de producto.

## Requisitos de hardware

- **VRAM estimada**: con 615M parámetros, el modelo en fp32 requiere aproximadamente 2,5 GB de VRAM, y en fp16 alrededor de 1,25 GB. Esto permite ejecutarlo en GPUs consumer como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores.
- **GPU recomendadas**: RTX 3060, RTX 4070, A10, A100 (para inferencia batch) o cualquier GPU con al menos 4 GB de VRAM para fp16.
- **Compatibilidad con consumer GPU**: sí, cabe en GPUs de gama media e incluso en algunas de gama baja si se usa cuantización (aunque no se proporcionan tipos de cuantización oficiales).
- **Opciones de despliegue**: al ser compatible con Transformers, puede servirse con **vLLM**, **HuggingFace TGI** o **Ollama** (si se convierte a GGUF). Para CPU, se puede usar `llama.cpp` o `ctransformers` con conversión previa.
- **Latencia y throughput**: no disponible. Al ser un modelo de 615M, se espera una latencia moderada (del orden de cientos de milisegundos por frase en GPU consumer).

## Comparativa con modelos similares

| Modelo | Parametros | Direccion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nileagi/nileagi-suk-mt` | 615M | sw→suk | no disponible | other (investigacion) | HuggingFace |
| `facebook/m2m100_418M` | 418M | multilingue (100 idiomas) | 1024 tokens | MIT | HuggingFace |
| `facebook/nllb-200-distilled-600M` | 600M | multilingue (200 idiomas) | 1024 tokens | CC-BY-NC-4.0 | HuggingFace |

El modelo de NileAGI se diferencia de los modelos multilingües generalistas en que está especializado en el par swahili-sukuma, un par que no está cubierto por M2M-100 ni NLLB-200 de forma nativa. Aunque M2M-100 incluye swahili, no incluye sukuma, por lo que este modelo llena un vacío específico. La comparación directa de rendimiento no es posible sin datos de benchmarks.

## Limitaciones y advertencias

- **Registro limitado**: el output en sukuma sigue el registro literario/religioso de los datos de entrenamiento; no es adecuado para lenguaje coloquial o conversacional.
- **Dirección única**: solo traduce de swahili a sukuma; no soporta la dirección inversa.
- **Exclusión de dominios**: no debe usarse para traducción legal, médica o de chat, como se indica explícitamente en la model card.
- **Carácter experimental**: es una validación de pipeline de un solo paso, no un modelo de producción. Los resultados de calidad pueden ser bajos y no representan el rendimiento final esperado.
- **Licencia restrictiva**: la licencia `other` con "términos de investigación de NileAGI" puede limitar el uso comercial o la redistribución. Es necesario contactar con NileAGI para aclarar los términos exactos.
- **Riesgo de alucinación**: al ser un modelo pequeño y entrenado con datos limitados, puede generar traducciones incorrectas o inventar contenido, especialmente en frases complejas o fuera del dominio entrenado.
- **Sesgos potenciales**: el sesgo hacia textos religiosos puede producir traducciones con vocabulario o expresiones propias de ese ámbito, inapropiadas en otros contextos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/nileagi/nileagi-suk-mt)
- [Sitio web de NileAGI](https://nileagi.com/)
- [Perfil de NileAGI en HuggingFace](https://huggingface.co/nileagi)
- [GitHub de NileAGI](https://github.com/nile-agi)
- [Dataset de entrenamiento (referenciado)](https://huggingface.co/nileagi/nileagi-suk-data)
