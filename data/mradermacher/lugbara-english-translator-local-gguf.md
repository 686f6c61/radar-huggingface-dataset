# mradermacher/lugbara-english-translator-local-GGUF

## Resumen

El modelo `mradermacher/lugbara-english-translator-local-GGUF` es una versión cuantizada en formato GGUF del modelo original `ckuma/lugbara-english-translator-local`, un traductor especializado en el par de idiomas inglés (en) y lugbara (lgg), una lengua nilótica hablada principalmente en el noroeste de Uganda y zonas limítrofes de la República Democrática del Congo. El modelo original fue desarrollado en el contexto de la Universidad de Muni (Uganda), según indican las etiquetas de la model card, y está orientado a cubrir una necesidad real de traducción automática en un par de idiomas de bajos recursos para el que existen muy pocos recursos computacionales.

La versión que nos ocupa no es un modelo nuevo, sino una conversión a GGUF realizada por mradermacher, un conocido distribuidor de cuantizaciones para la comunidad de inferencia local. El modelo cuenta con 582.401.280 parámetros totales (aproximadamente 582 millones), lo que lo sitúa en la gama de modelos pequeños, aptos para ejecución en hardware de consumo. La licencia es Apache 2.0 y el repositorio ocupa 5,6 GB, incluyendo todos los ficheros de cuantización.

Su relevancia radica en dos factores: por un lado, la escasez de modelos de traducción de calidad para lenguas africanas de bajos recursos como el lugbara; por otro, la disponibilidad de cuantizaciones GGUF que permiten desplegar el traductor en entornos con recursos limitados, como estaciones de trabajo sin GPU dedicada o incluso dispositivos de gama media, algo especialmente valioso en contextos educativos y ONG que operan en la región.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, según `library_name: transformers`) |
| Parametros totales | 582.401.280 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés), lgg (lugbara) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo original en la información proporcionada. La model card del repositorio cuantizado no incluye detalles sobre el número de capas, dimensión de los embeddings, mecanismo de atención ni tipo de tokenizador. Dado el tamaño de 582 millones de parámetros y la etiqueta `library_name: transformers`, se trata presumiblemente de un transformer encoder-decoder o decoder-only de escala pequeña, pero no se confirma en la documentación disponible.

Tampoco se especifican los datos de entrenamiento: no se indica el número de tokens utilizados, la composición del corpus, ni si se aplicaron técnicas de ajuste fino supervisado, RLHF o DPO. La model card únicamente menciona las etiquetas `translation`, `lugbara`, `low-resource`, `uganda` y `muni-university`, lo que sugiere un desarrollo vinculado a la Universidad de Muni, pero sin más detalle técnico. La versión cuantizada fue generada con la herramienta de mradermacher (quantize_version 2, convert_type hf) y no incluye cuantizaciones ponderadas por imatrix, según indica el propio autor.

## Capacidades

- Traducción bidireccional entre inglés (en) y lugbara (lgg), según la pipeline declarada `translation`.
- Especialización en un par de idiomas de bajos recursos, con foco en el contexto ugandés.
- Ejecución local mediante ficheros GGUF, compatible con llama.cpp y derivados.
- Despliegue en entornos con recursos limitados gracias a las cuantizaciones de 0,4 a 1,3 GB.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento (thinking mode).
- No se documentan capacidades multilingües más allá del par en-lgg.

## Casos de uso

- Traducción de documentación administrativa y sanitaria en zonas rurales de Uganda: el modelo puede traducir folletos, formularios y avisos del inglés al lugbara en equipos sin GPU, facilitando el acceso a servicios públicos en la lengua local.
- Atención al ciudadano en oficinas locales: integrado en una aplicación de escritorio o web ligera, permite a funcionarios no angloparlantes consultar y redactar comunicaciones en lugbara a partir de textos en inglés.
- Digitalización y preservación lingüística: traducción de textos escolares, cuentos tradicionales y material etnográfico entre inglés y lugbara, contribuyendo a la documentación de una lengua con escasa presencia digital.
- Herramientas educativas bilingües: generación de material didáctico paralelo inglés-lugbara para escuelas primarias de la región del Nilo Occidental, ejecutable en ordenadores de bajo coste.
- Traducción en ONG y cooperación internacional: conversión rápida de informes, protocolos y comunicados del inglés al lugbara para su distribución sobre el terreno, sin dependencia de conectividad ni servicios en la nube.
- Investigación en traducción automática de bajos recursos: el modelo sirve como línea base cuantizada para experimentos de evaluación y comparación con otros sistemas en el par en-lgg, gracias a su reducido tamaño y licencia permisiva.
- Prototipado de asistentes conversacionales bilingües: al ser un modelo pequeño y ejecutable localmente, permite iterar rápidamente en el desarrollo de interfaces de traducción para comunidades lugbaraparlantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,5 y 1,5 GB según cuantización (Q2_K ~0,4 GB en disco, f16 ~1,3 GB); el consumo en memoria es similar al tamaño del fichero más el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como GTX 1650, RTX 3050, RTX 4060 o superiores son más que suficientes. También funciona en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación del GGUF), llama-cpp-python, y otros runtimes compatibles con GGUF. No se documenta soporte nativo en vLLM o TGI para este formato.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera una latencia muy baja en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| mradermacher/lugbara-english-translator-local-GGUF | 582 M | no disponible | en, lgg | Apache 2.0 | GGUF |
| ckuma/lugbara-english-translator-local (modelo base) | 582 M | no disponible | en, lgg | Apache 2.0 | safetensors |
| mradermacher/lugbara-english-translator-GGUF | no disponible | no disponible | en, lgg | no disponible | GGUF |
| NLLB-200 (variantes pequeñas) | 600 M aprox. | 512 tokens aprox. | 200 idiomas (incluye lenguas africanas) | CC-BY-NC 4.0 | safetensors, GGUF (comunitario) |

La comparación con NLLB-200 se incluye por ser la familia de referencia en traducción multilingüe de bajos recursos, aunque no se dispone de métricas comparativas publicadas para el par en-lgg en la información disponible. El modelo de ckuma es el original del que deriva esta cuantización, y la variante `lugbara-english-translator-GGUF` (sin el sufijo `-local`) aparece en los resultados de búsqueda pero sin datos técnicos confirmados.

## Limitaciones y advertencias

- No se han documentado evaluaciones de sesgo para este modelo; al tratarse de un modelo entrenado sobre un corpus presumiblemente limitado, es probable que refleje sesgos presentes en los datos de origen.
- Riesgo de alucinación y de traducciones inexactas, especialmente en terminología técnica, jurídica o médica, dado el bajo volumen de datos disponible para el lugbara.
- Longitud de contexto no documentada; no se recomienda su uso en documentos largos sin segmentación previa.
- Cobertura limitada a dos idiomas (en y lgg); no es un modelo multilingüe general.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de benchmarks y de documentación sobre el entrenamiento dificulta garantizar su calidad en producción.
- El modelo cuantizado no incluye versiones ponderadas por imatrix, lo que puede afectar ligeramente a la calidad en cuantizaciones bajas (Q2_K, Q3_K_S).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria sobre su funcionamiento.
- No se documenta soporte para tool calling ni para integración en pipelines de agentes; su uso debe limitarse a tareas de traducción.

## Enlaces

- Repositorio Hugging Face (cuantizado): https://huggingface.co/mradermacher/lugbara-english-translator-local-GGUF
- Modelo base: https://huggingface.co/ckuma/lugbara-english-translator-local
- Página de descargas del autor: https://hf.tst.eu/model#lugbara-english-translator-local-GGUF
- Variante relacionada: https://huggingface.co/mradermacher/lugbara-english-translator-GGUF
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Artículo sobre construcción de traductores con LLM y Hugging Face: https://www.analyticsvidhya.com/blog/2023/07/build-your-own-translator-with-llms-hugging-face/
- Reflexiones sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
