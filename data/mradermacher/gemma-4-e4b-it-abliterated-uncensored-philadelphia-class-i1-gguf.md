# mradermacher/Gemma-4-E4B-IT-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-i1-GGUF

## Resumen

Gemma-4-E4B-IT-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-i1-GGUF es una cuantización GGUF con imatrix del modelo PhillyLabs/Gemma-4-E4B-IT-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS, publicada por mradermacher. Se trata de una variante "abliterated" (con reducción de rechazos mediante manipulación de direcciones de activación) del modelo Gemma 4 E4B IT de Google, orientada a usos sin las restricciones de alineación habituales. El repositorio contiene exclusivamente los pesos cuantizados en formato GGUF, no el modelo original en safetensors.

El modelo base declara 7.463.013.674 parámetros totales según los safetensors del repositorio, lo que lo sitúa en la categoría de modelos de ~7B. Es un modelo multimodal (visión) según los tags y la model card, con licencia Apache 2.0 declarada y entrenamiento orientado a conversación en inglés. La cuantización i1 (imatrix) de mradermacher ofrece un amplio abanico de niveles, desde IQ1_S de 3,4 GB hasta IQ4_NL de 5,3 GB, lo que permite desplegarlo en hardware de consumo.

La relevancia de esta ficha radica en que combina tres factores poco habituales: un modelo multimodal de ~7B, una modificación abliterated que elimina parte de los mecanismos de rechazo, y una cuantización optimizada para inferencia local. Es importante señalar que la información disponible sobre arquitectura interna, contexto y datos de entrenamiento es muy limitada: la model card del cuantizador solo describe el proceso de cuantización, no el modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4 E4B IT; transformer multimodal segun tags) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, Q2_K_S, Q2_K, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (i1/imatrix) |
| Idiomas soportados | en |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors y bfloat16 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Los tags indican "gemma4", "multimodal", "transformers" y "bfloat16", lo que sugiere una arquitectura transformer multimodal de la familia Gemma 4, pero no se especifican número de capas, dimensión oculta, mecanismo de atención ni detalles del encoder visual. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica documentada es el proceso de "abliteration" (etiqueta "obliteratus" y "refusal-reduction"), una técnica que identifica y suprime direcciones de activación asociadas a rechazos en el espacio latente del modelo, reduciendo la tasa de respuestas negativas sin reentrenamiento. Sobre esta base, mradermacher aplica cuantización con imatrix (i1), que utiliza una matriz de importancia calculada a partir de datos de calibración para preservar mejor los pesos relevantes en niveles bajos de bits. El repositorio incluye el archivo imatrix.gguf (0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones.

## Capacidades

- Generación de texto conversacional en inglés, con modo instruct (IT) según el nombre del modelo.
- Capacidades multimodales (visión) según los tags y la model card; los archivos mmproj, si existen, están en el repositorio estático asociado.
- Reducción de rechazos mediante abliteration: el modelo está diseñado para responder a peticiones que el modelo original rechazaría.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo language.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la abliteration afecta a la tasa de rechazos y a la calidad de las respuestas, comparándolo con el Gemma 4 E4B IT original en experimentos controlados.
- Despliegue local en hardware de consumo: con cuantizaciones de 3,4 a 5,3 GB, puede ejecutarse en GPUs con 6-8 GB de VRAM mediante llama.cpp u Ollama, útil para prototipado offline sin dependencia de APIs.
- Generación de texto creativo sin filtros: escritura de ficción, guiones o contenido narrativo donde las restricciones de alineación del modelo original resultan limitantes, siempre con revisión humana posterior.
- Análisis de imágenes en local: al ser multimodal, puede emplearse para descripción de imágenes o extracción de información visual en entornos con requisitos de privacidad, usando los archivos mmproj del repositorio estático.
- Evaluación de cuantizaciones: el repositorio ofrece 17 niveles i1 distintos, lo que permite medir empíricamente la degradación de calidad por nivel de bits en tareas concretas del usuario.
- Base para fine-tuning o experimentación: al estar en GGUF, sirve como punto de partida para pruebas de inferencia rápida antes de invertir en el modelo completo en bfloat16.
- Docencia y demostraciones: su tamaño reducido y su licencia Apache 2.0 facilitan su uso en cursos y talleres sobre modelos de lenguaje y cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-6 GB con cuantizaciones IQ2/IQ3, y 6-8 GB con IQ4_XS o IQ4_NL, incluyendo overhead de contexto y del proyector multimodal.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para mayor velocidad; A100 o H100 para despliegues con concurrencia.
- Cabe en GPUs de consumo: sí, desde una GTX 1660 6 GB con cuantizaciones IQ2, y con holgura en RTX 3060 12 GB o superiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runtimes compatibles con GGUF; para el modelo base en safetensors, transformers, vLLM o TGI (no verificado para esta variante abliterated).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (i1-GGUF) | 7,46B | no disponible | apache-2.0 | GGUF | Multimodal, abliterated, solo inglés |
| PhillyLabs/Gemma-4-E4B-IT-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS | 7,46B | no disponible | apache-2.0 | safetensors (bfloat16) | Modelo base sin cuantizar |
| mradermacher/Gemma-4-E4B-IT-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-GGUF | 7,46B | no disponible | apache-2.0 | GGUF (static) | Cuantizaciones estáticas, incluye mmproj |
| Gemma 4 E4B IT original (Google) | no disponible | no disponible | licencia Gemma | safetensors | Modelo alineado sin abliteration; no disponible en la información |

## Limitaciones y advertencias

- La abliteration reduce los rechazos, pero no elimina sesgos ni garantiza respuestas seguras; el modelo puede producir contenido dañino, ofensivo o inexacto con mayor facilidad que el original.
- Riesgo elevado de alucinación: no hay datos de benchmarks que permitan cuantificar la calidad real, y la manipulación de activaciones puede degradar capacidades de razonamiento y factualidad.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está verificado y probablemente sea deficiente.
- Licencia: aunque el repositorio declara Apache 2.0, el enlace apunta a la licencia de Gemma 4 de Google; conviene revisar los términos del modelo base antes de un uso comercial, ya que pueden imponer restricciones adicionales.
- La model card del cuantizador no documenta el modelo subyacente: no hay información sobre contexto máximo, arquitectura exacta ni datos de entrenamiento, lo que dificulta evaluar su idoneidad para producción.
- Las cuantizaciones IQ1 e IQ2 degradan notablemente la calidad; para uso serio se recomienda IQ4_XS o superior.
- No se han verificado capacidades de tool calling ni de agentes; no asumir su disponibilidad.
- El repositorio pesa 111 GB por incluir todos los niveles de cuantización; descargar solo el archivo necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Gemma-4-E4B-IT-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-i1-GGUF
- Modelo base: https://huggingface.co/PhillyLabs/Gemma-4-E4B-IT-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Gemma-4-E4B-IT-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Gemma-4-E4B-IT-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-i1-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- README de referencia para GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
