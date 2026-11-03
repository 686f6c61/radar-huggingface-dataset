# Cohere-AR/cohere-transcribe-ar-sft-v9-full-s78k

## Resumen

Cohere-AR/cohere-transcribe-ar-sft-v9-full-s78k es un modelo de reconocimiento automático del habla (ASR) especializado en árabe e inglés, desarrollado por el colectivo Cohere-AR a partir del modelo base CohereLabs/cohere-transcribe-arabic-07-2026. Se trata de un ajuste fino supervisado (SFT) orientado a transcripción de audio en escenarios de code-switching árabe-inglés y conversaciones telefónicas, según indican las etiquetas del repositorio. Con 2.065.770.752 parámetros (aproximadamente 2,07 mil millones), se posiciona en la gama media de modelos ASR, lo que permite despliegues con requisitos de hardware moderados.

El modelo se publica bajo la librería transformers con pesos en formato safetensors y un tamaño de repositorio de 4,1 GB, lo que sugiere pesos en precisión de 16 bits. La relevancia actual radica en la escasez de modelos ASR abiertos que cubran de forma específica el bilingüismo árabe-inglés en dominios telefónicos, un caso frecuente en atención al cliente y centros de contacto en regiones del Golfo y Oriente Medio.

El acceso al repositorio está restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargar los pesos. No se ha publicado información sobre licencia, composición del dataset de entrenamiento ni resultados de benchmarks en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `cohere_asr`; presumiblemente encoder-decoder para ASR, sin confirmar) |
| Parametros totales | 2.065.770.752 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | ar (árabe), en (inglés); incluye code-switching ar-en |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. La etiqueta `cohere_asr` y la librería transformers apuntan a un modelo de la familia ASR de Cohere, pero no se especifica si se trata de un transformer encoder-decoder clásico, un modelo tipo CTC o una arquitectura híbrida. El tamaño de 2,07 mil millones de parámetros y los 4,1 GB del repositorio son compatibles con pesos en 16 bits.

El modelo es un ajuste fino supervisado (SFT) del checkpoint CohereLabs/cohere-transcribe-arabic-07-2026. El sufijo del identificador (`sft-v9-full-s78k`) sugiere una novena iteración de ajuste supervisado sobre un conjunto de datos de aproximadamente 78.000 muestras, aunque este dato no está confirmado en la información disponible. Las etiquetas indican especialización en code-switching árabe-inglés y audio telefónico, lo que implica que el corpus de ajuste probablemente incluye conversaciones bilingües y grabaciones de baja calidad de canal telefónico. No se ha publicado información sobre volumen total de tokens, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas destacables.

## Capacidades

- Reconocimiento automático del habla (ASR) en árabe e inglés.
- Transcripción de audio con code-switching intra-frase árabe-inglés, según las etiquetas del modelo.
- Optimización para audio telefónico (telephony), lo que implica robustez ante ruido, compresión y ancho de banda limitado.
- Salida de texto transcrito a partir de entrada de audio.
- No se ha documentado soporte de tool calling, function calling ni capacidades de agente.
- No se ha documentado modo de razonamiento (thinking mode), visión ni audio generativo.
- Capacidades multilingües limitadas a ar y en según los metadatos.

## Casos de uso

- Transcripción de centros de contacto en Oriente Medio: el modelo puede procesar grabaciones telefónicas bilingües árabe-inglés y generar transcripciones para análisis de calidad, cumplimiento normativo y minería de conversaciones, gracias a su especialización en telephony y code-switching.
- Subtitulado y documentación de reuniones bilingües: equipos que alternan árabe e inglés en una misma sesión pueden usar el modelo para generar actas y subtítulos, aprovechando la cobertura de ambos idiomas en un único checkpoint.
- Análisis de sentimiento y clasificación posterior sobre transcripciones: al producir texto a partir de audio telefónico, el modelo alimenta pipelines de NLP downstream (clasificación, extracción de entidades) en entornos de atención al cliente.
- Moderación y auditoría de llamadas: la transcripción automática permite revisar conversaciones de soporte para detectar incumplimientos, con la ventaja de cubrir el cambio de idioma frecuente en clientes del Golfo.
- Investigación lingüística sobre code-switching: el modelo sirve como herramienta de anotación automática de corpus orales bilingües, facilitando estudios sociolingüísticos y de variación dialectal.
- Accesibilidad y transcripción de voz a texto en aplicaciones móviles: integrable vía transformers en servicios de dictado o accesibilidad para usuarios que hablan árabe e inglés de forma alterna.
- Generación de datasets de ASR: las transcripciones producidas pueden usarse para preetiquetar audio y acelerar la creación de corpus anotados, con revisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB en fp16 (2,07 mil millones de parámetros a 2 bytes por parámetro, más overhead de activaciones y buffers de audio). En cuantización de 8 bits, alrededor de 2,5-3 GB; en 4 bits, alrededor de 1,5-2 GB (estimaciones, no confirmadas por el autor).
- GPU recomendadas: A100, H100 o L40S para despliegues de alta concurrencia; RTX 4090, RTX 3090 o A10G para inferencia individual.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y tarjetas con al menos 6 GB de VRAM en fp16.
- Opciones de despliegue: transformers (librería declarada), potencialmente vLLM o TGI si la arquitectura es compatible (no confirmado), y llama.cpp/Ollama solo si se generan conversiones GGUF (no publicadas).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cohere-AR/cohere-transcribe-ar-sft-v9-full-s78k | 2,07 B | no disponible | ar, en | no disponible | gated en HuggingFace |
| CohereLabs/cohere-transcribe-arabic-07-2026 (modelo base) | no disponible | no disponible | ar (presumiblemente) | no disponible | no disponible |
| Whisper large-v3 (OpenAI) | ~1,55 B | 30 s de audio por ventana | multilingüe (incluye ar y en) | MIT | abierto en HuggingFace |
| MMS (Meta) | ~1 B (por idioma) | no disponible | más de 1.100 idiomas | CC-BY-NC | abierto en HuggingFace |

La comparativa se limita a referencias generales de la categoría ASR; no se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa con Whisper large-v3 o MMS. La ventaja diferencial del modelo de Cohere-AR es su especialización declarada en code-switching árabe-inglés y audio telefónico, frente al enfoque multilingüe genérico de las alternativas.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos lingüísticos, dialectales o demográficos; el árabe abarca variedades muy distintas (MSA, dialectos del Golfo, egipcio, magrebí) y no se especifica cuáles cubre el ajuste fino.
- Riesgo de alucinación en ASR: posible generación de texto plausible no presente en el audio, especialmente en segmentos ruidosos o con solapamiento de hablantes.
- Limitación de idiomas: solo ar y en según los metadatos; no se garantiza comportamiento en otras lenguas ni en mezclas con terceros idiomas.
- Licencia no disponible: no puede confirmarse el uso comercial; es imprescindible verificar las condiciones del repositorio y del modelo base antes de desplegarlo en producción.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que puede añadir fricción en pipelines automatizados.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad (WER/CER) frente a alternativas, lo que dificulta la evaluación previa.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: madurez y soporte comunitario limitados.
- El sufijo `s78k` sugiere un conjunto de ajuste relativamente pequeño; posible sobreajuste a dominios concretos no documentados.
- No se ha documentado el formato exacto de entrada de audio (frecuencia de muestreo, duración máxima) ni el tokenizador; es necesario consultar la model card completa tras aceptar el acceso.

## Enlaces

- HuggingFace: https://huggingface.co/Cohere-AR/cohere-transcribe-ar-sft-v9-full-s78k
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026
- Cohere (sitio corporativo): https://cohere.com/
- Documentación de la plataforma Cohere: https://docs.cohere.com/docs/the-cohere-platform
- Wikipedia (Cohere): https://en.wikipedia.org/wiki/Cohere
- Wikipedia en francés (Cohere): https://fr.wikipedia.org/wiki/Cohere
