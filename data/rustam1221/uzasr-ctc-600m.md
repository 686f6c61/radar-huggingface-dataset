# rustam1221/UzASR-CTC-600M

## Resumen

UzASR-CTC-600M es un modelo de reconocimiento automático del habla (ASR) especializado en uzbeko, desarrollado por el usuario rustam1221 y publicado en HuggingFace. Se trata de un fine-tuning del modelo multilingüe ai-sage/GigaAM-Multilingual, adaptado específicamente al uzbeko mediante un cabezal CTC y entrenado sobre manifiestos de audio propios del autor. Con 585 millones de parámetros, se posiciona como una alternativa ligera y de pesos abiertos para transcripción en una lengua de bajos recursos como el uzbeko.

El modelo resuelve el problema de la transcripción automática de voz en uzbeko, un idioma con cobertura limitada en los sistemas ASR comerciales y en los grandes modelos multilingües. Incorpora capacidades de puntuación y está diseñado para funcionar tanto con habla espontánea como con audio más controlado, según los conjuntos de datos declarados en su model card.

Su relevancia actual radica en que combina un tamaño moderado (600M) con un rendimiento declarado de 8,14 % de WER y 2,54 % de CER en un benchmark propio de habla espontánea, lo que lo hace viable para despliegues en producción con recursos limitados. El acceso está restringido (gated) y la licencia es específica para uso comercial en ASR en uzbeko, lo que condiciona su adopción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabezal CTC (fine-tuning de GigaAM-Multilingual) |
| Parametros totales | 585.334.219 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | uzbeko (uz) |
| Licencia | uzbek-asr-commercial (licencia personalizada, acceso restringido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de ai-sage/GigaAM-Multilingual, un modelo base multilingüe de reconocimiento del habla, y se fine-tunea con un cabezal de Connectionist Temporal Classification (CTC) para la transcripción en uzbeko. La arquitectura subyacente es de tipo transformer, aunque no se detalla en la información disponible la configuración exacta de capas, dimensiones ocultas ni el mecanismo de atención empleado en el modelo base.

El entrenamiento se realizó sobre los conjuntos de datos rustam1221/uzbek-asr-train-manifests (para entrenamiento) y rustam1221/uzbek-asr-benchmark-spontaneous (para evaluación), ambos publicados por el autor. No se especifica en la información disponible el número de horas de audio, la composición del dataset, ni si se aplicaron técnicas de aumento de datos, RLHF o ajuste fino supervisado más allá del propio fine-tuning CTC. La innovación principal es la adaptación de un modelo multilingüe a una lengua de bajos recursos mediante un cabezal CTC y datos propios, con soporte de puntuación.

## Capacidades

- Reconocimiento automático del habla en uzbeko con salida de texto transcrito.
- Generación de puntuación en la transcripción (según los tags del modelo).
- Procesamiento de habla espontánea, evaluado en el benchmark propio del autor.
- Adecuado para audio de conversación y posiblemente para audio leído, aunque no se detalla la composición exacta del entrenamiento.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-step.
- No se documentan capacidades multilingües más allá del uzbeko.
- No se documentan modos especiales como thinking mode, visión o audio más allá del ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas en uzbeko: el modelo puede convertir audio de conversaciones espontáneas en texto con puntuación, adecuado para actas y resúmenes posteriores, gracias a su entrenamiento en habla espontánea.
- Subtitulado automático de vídeo en uzbeko: se puede integrar en pipelines de generación de subtítulos para plataformas de contenido, usando la salida CTC con puntuación para mejorar la legibilidad.
- Atención al cliente automatizada: transcripción de llamadas en uzbeko para su análisis posterior, con un tamaño de 600M que permite despliegue en servidores modestos.
- Archivado y búsqueda de audio: conversión de grabaciones históricas en uzbeko a texto indexable, facilitando la búsqueda por palabras clave en archivos de audio.
- Herramientas de accesibilidad: generación de transcripciones en tiempo casi real para personas con discapacidad auditiva en entornos de habla uzbeka, siempre que la latencia del despliegue lo permita.
- Investigación lingüística y creación de corpus: uso del modelo para generar transcripciones a gran escala de audio en uzbeko, contribuyendo a la creación de corpus anotados para futuras investigaciones en lenguas de bajos recursos.
- Integración en asistentes de voz locales: transcripción de comandos de voz en uzbeko para sistemas de domótica o aplicaciones móviles, con la ventaja de un modelo ligero y de pesos abiertos.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card (no verificados) son los siguientes:

| Benchmark | Métrica | Valor |
|---|---|---|
| Uzbek Spontaneous Speech ASR Benchmark | WER | 8,14 % |
| Uzbek Spontaneous Speech ASR Benchmark | CER | 2,54 % |

No se han publicado otros resultados de benchmarks en la información disponible, ni comparaciones con modelos alternativos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 585M parámetros en precisión completa (fp32) se necesitan aproximadamente 2,3 GB solo para los pesos, y en fp16 alrededor de 1,2 GB, aunque no se confirma la compatibilidad con cuantizaciones.
- GPU recomendadas: no disponible; por tamaño, cabría en GPUs consumer como RTX 3060, RTX 4060 o superiores, así como en A100/H100 para despliegues de mayor throughput.
- ¿Cabe en GPU consumer? Sí, por el tamaño del modelo (585M), es probable que quepa en GPUs con 4-8 GB de VRAM, aunque no se especifican requisitos oficiales.
- Opciones de despliegue: transformers (librería declarada); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al ser un modelo ASR con CTC, el despliegue típico sería mediante pipelines de transformers o servidores de inferencia compatibles con ASR.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede mencionar que el modelo base ai-sage/GigaAM-Multilingual es la referencia directa, pero no se han publicado comparativas de rendimiento con otras alternativas de ASR en uzbeko en la información disponible.

| Modelo | Parámetros | Contexto | WER (benchmark propio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UzASR-CTC-600M | 585M | no disponible | 8,14 % | uzbek-asr-commercial (gated) | HuggingFace (acceso restringido) |
| ai-sage/GigaAM-Multilingual | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Otros modelos ASR en uzbeko | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero al entrenarse con datos propios del autor, puede reflejar sesgos de ese corpus (acentos, registros, géneros, edades).
- Riesgo de alucinación: como todo modelo ASR, puede generar transcripciones incorrectas o inventar palabras en audio ruidoso o con solapamiento de hablantes.
- Limitaciones de contexto o idioma: solo soporta uzbeko; no se especifica la longitud máxima de audio procesable ni el comportamiento con audio multilingüe.
- Restricciones de licencia: la licencia es "uzbek-asr-commercial" y el acceso está restringido (gated), por lo que es necesario aceptar condiciones en HuggingFace y revisar los términos para uso comercial.
- Caveats para producción: los resultados de benchmarks son declarados por el autor y no verificados; no se han publicado detalles sobre el dataset de entrenamiento (horas, composición, calidad), lo que dificulta evaluar su robustez en dominios distintos al de entrenamiento. Además, el modelo tiene muy pocas descargas y likes, lo que sugiere una validación comunitaria limitada.

## Enlaces

- HuggingFace: https://huggingface.co/rustam1221/UzASR-CTC-600M
- Modelo base: https://huggingface.co/ai-sage/GigaAM-Multilingual
- Dataset de entrenamiento: https://huggingface.co/datasets/rustam1221/uzbek-asr-train-manifests
- Dataset de benchmark: https://huggingface.co/datasets/rustam1221/uzbek-asr-benchmark-spontaneous
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
