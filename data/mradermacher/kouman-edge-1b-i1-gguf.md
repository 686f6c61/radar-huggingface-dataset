# mradermacher/kouman-edge-1b-i1-GGUF

## Resumen

kouman-edge-1b-i1-GGUF es la versión cuantizada en formato GGUF del modelo Tree-AI-lab/kouman-1.0-edge-1B, un modelo de lenguaje de 1.235.814.432 parámetros (aproximadamente 1,2 mil millones) desarrollado por Tree AI Lab, un laboratorio vinculado a Costa de Marfil. El modelo está diseñado específicamente para despliegue en el borde (edge AI) y dispositivos móviles, con un enfoque particular en el soporte de lenguas locales de Costa de Marfil como el baoulé (bci) y el dioula (dyu), además del francés y el inglés.

La versión aquí descrita ha sido generada por mradermacher, un conocido cuantizador de la comunidad de Hugging Face, e incluye una amplia gama de cuantizaciones con matrices de importancia (imatrix), desde IQ1_S hasta Q6_K, con tamaños que van desde 0,5 GB hasta 1,1 GB. Esta variedad permite desplegar el modelo en hardware muy limitado, desde teléfonos móviles hasta Raspberry Pi y microcontroladores con suficiente memoria.

El modelo es relevante por su enfoque en la inclusión lingüística de lenguas africanas de bajos recursos, un ámbito tradicionalmente desatendido por los grandes modelos comerciales. Su licencia llama3.2 y su compatibilidad con llama.cpp lo convierten en una opción práctica para proyectos de código abierto que necesiten procesamiento de lenguaje natural en contextos con recursos computacionales limitados y diversidad lingüística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Llama, según la licencia llama3.2) |
| Parametros totales | 1.235.814.432 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (con imatrix) |
| Idiomas soportados | bci (baoulé), dyu (dioula), fr (francés), en (inglés) |
| Licencia | llama3.2 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un transformer con licencia llama3.2, lo que sugiere que deriva de la familia Llama 3.2, probablemente de la variante de 1B parámetros. El modelo base Tree-AI-lab/kouman-1.0-edge-1B fue desarrollado por Tree AI Lab con el objetivo explícito de servir como modelo de borde para lenguas de Costa de Marfil.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card del cuantizador no incluye estos detalles, y la información proporcionada no permite confirmarlos. La presencia de las etiquetas "conversational" y "edge-ai" sugiere un ajuste orientado a diálogo y eficiencia, pero no se aportan datos técnicos concretos sobre el proceso de entrenamiento.

La innovación principal de esta versión es la aplicación de cuantización con matrices de importancia (imatrix) por parte de mradermacher, que permite obtener cuantizaciones de baja precisión (hasta IQ1_S) con una pérdida de calidad menor que la cuantización estática equivalente. El repositorio incluye el archivo imatrix para que otros usuarios puedan generar sus propias cuantizaciones.

## Capacidades

- Generación de texto conversacional en baoulé, dioula, francés e inglés.
- Procesamiento de lenguaje natural en lenguas africanas de bajos recursos, un nicho poco cubierto por modelos comerciales.
- Despliegue en dispositivos de borde y móviles gracias a su reducido tamaño (1,2B parámetros) y a las cuantizaciones de menos de 1 GB.
- Compatibilidad con llama.cpp y ecosistemas derivados (Ollama, LM Studio, etc.).
- Soporte de conversación multi-turno (etiqueta "conversational").
- No se ha confirmado soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Asistentes conversacionales offline en zonas rurales de Costa de Marfil: el modelo puede ejecutarse en un teléfono móvil de gama media con una cuantización Q4_K_M (0,9 GB) para ofrecer respuestas en baoulé o dioula sin conexión a internet, cubriendo necesidades de información básica, salud o agricultura.
- Traducción y mediación lingüística local: integrado en una aplicación móvil, puede facilitar la comunicación entre hablantes de baoulé/dioula y francés en contextos administrativos, sanitarios o educativos, aprovechando su soporte nativo de las cuatro lenguas.
- Chatbots de atención al ciudadano en kioscos o dispositivos de bajo coste: con una Raspberry Pi y la cuantización IQ4_XS (0,8 GB), se puede desplegar un punto de información pública que responda en lenguas locales sin depender de la nube.
- Educación y alfabetización digital: el modelo puede generar ejercicios, cuentos o material didáctico en baoulé y dioula, contribuyendo a la preservación y digitalización de estas lenguas.
- Procesamiento de texto en el borde para aplicaciones de accesibilidad: subtitulado, resumen o reescritura de mensajes en dispositivos con recursos limitados, donde un modelo de 1,2B cuantizado a 4 bits ofrece un equilibrio razonable entre calidad y latencia.
- Investigación en NLP de bajos recursos: sirve como punto de partida para fine-tuning en otras lenguas africanas o para estudiar el rendimiento de modelos pequeños en contextos multilingües con datos escasos.
- Prototipado rápido en entornos con GPU modesta: gracias a su tamaño, cabe en GPUs de consumo como la RTX 3060 o incluso en iGPU, permitiendo iterar en el desarrollo de aplicaciones de PLN sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,5 GB (IQ1_S) y 1,1 GB (Q6_K) para los pesos; añadir overhead de contexto y KV cache, típicamente 0,2-0,5 GB adicionales según la longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, GTX 1650 o superiores para cuantizaciones Q4-Q6 con contexto moderado.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada de los últimos 10 años, así como en iGPU modernas (Intel Iris Xe, AMD Radeon integrada) y en Apple Silicon.
- También es viable en CPU: con llama.cpp, un modelo de 1,2B cuantizado a 4 bits puede alcanzar velocidades de decodificación de decenas de tokens por segundo en CPUs modernas de escritorio.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, y cualquier runtime compatible con GGUF. No se ha confirmado soporte en vLLM o TGI para este formato.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| kouman-edge-1b-i1-GGUF | 1,2B | no disponible | bci, dyu, fr, en | llama3.2 | GGUF |
| Llama 3.2 1B | 1,2B | 128k (según documentación oficial de Meta) | multilingüe (8 idiomas oficiales) | llama3.2 | safetensors, GGUF |
| Qwen2.5-1.5B | 1,5B | 32k | multilingüe (29 idiomas) | Apache 2.0 | safetensors, GGUF |
| Gemma 2 2B | 2,6B | 8k | multilingüe | Gemma Terms | safetensors, GGUF |

La comparativa se basa en datos públicos de los modelos alternativos; para kouman-edge-1b no se dispone de datos de contexto ni de benchmarks que permitan una comparación cuantitativa de rendimiento. La principal diferencia de kouman es su especialización en lenguas de Costa de Marfil, ausentes en los otros modelos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; es previsible que el modelo herede sesgos de sus datos de entrenamiento, especialmente en un contexto lingüístico con datos limitados.
- Riesgo de alucinación: alto en un modelo de 1,2B parámetros, especialmente en tareas de conocimiento factual y en lenguas de bajos recursos donde los datos de entrenamiento son escasos.
- Limitaciones de contexto: la longitud de contexto no está documentada; en modelos de este tamaño suele ser moderada (típicamente 4k-8k tokens), lo que limita conversaciones muy largas o documentos extensos.
- Limitaciones de idioma: aunque soporta bci y dyu, la calidad en estas lenguas probablemente sea inferior a la del francés o el inglés debido a la menor disponibilidad de datos; no se han publicado evaluaciones al respecto.
- Restricciones de licencia: la licencia llama3.2 impone condiciones de uso (incluida la política de uso aceptable de Meta) y requiere atribución; es necesario revisar los términos antes de un uso comercial.
- Caveat para producción: las cuantizaciones IQ1 e IQ2 degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior. Además, el modelo base no ha sido evaluado en benchmarks públicos según la información disponible, por lo que su rendimiento real en tareas concretas debe validarse empíricamente.
- El repositorio tiene 16 GB de tamaño total debido a la multitud de cuantizaciones; conviene descargar solo el archivo necesario.

## Enlaces

- Repositorio Hugging Face del modelo cuantizado: https://huggingface.co/mradermacher/kouman-edge-1b-i1-GGUF
- Modelo base: https://huggingface.co/Tree-AI-lab/kouman-1.0-edge-1B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/kouman-edge-1b-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#kouman-edge-1b-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
