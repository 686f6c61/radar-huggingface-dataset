# drofn/SenseNova-Loop-9B-8GB-v3-GGUF

## Resumen

SenseNova-Loop-9B-8GB-v3-GGUF es una cuantización GGUF del modelo multimodal SenseNova-Loop-9B, desarrollado por SenseNova y cuantizado por el usuario drofn. El objetivo de esta versión es permitir la ejecución del modelo completo, incluyendo su cabecera de predicción multi-token (MTP) y la entrada opcional de imágenes, dentro de una GPU de consumo con 8 GB de VRAM. Emplea una arquitectura de transformer con bucles (looped transformer) y una ruta de enrutamiento denominada mHC.

La versión v3 se centra en reducir la divergencia respecto a la referencia Q8_0: según el autor, logra una KLD media aproximadamente un 20 % inferior a la v2 en los cuatro conjuntos de prueba, con una cola de error (percentil 99) entre un 15 % y un 33 % menor. Mantiene el contexto de 104.448 tokens de la v2 y añade un fichero HQ de 6,51 GB que se acerca más a Q8_0 a costa de reducir el contexto probado a 57.344 tokens.

El modelo base cubre texto e imagen (pipeline image-text-to-text), soporta inglés, chino y turco, y se distribuye bajo licencia Apache 2.0. Su relevancia actual radica en que demuestra que un modelo de 9.200 millones de parámetros con contexto largo, capacidades de visión y decodificación especulativa mediante MTP puede desplegarse en tarjetas de 8 GB, a cambio de utilizar un fork parcheado de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer) y enrutamiento mHC; cabecera MTP para decodificación especulativa |
| Parametros totales | 9.200.240.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 104.448 tokens (v3 texto); 57.344 tokens (HQ y v3 + mmproj) |
| Tipos de cuantizacion | GGUF propietario de 8 GB (v3, 6,19 GB; HQ, 6,51 GB); embeddings en Q8_0; caché KV q4_0 (v3) o q8_0 (HQ); proyector de visión F16 |
| Idiomas soportados | en, zh, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector mmproj en GGUF F16 |
| Tamano del repo | 13,6 GB |
| VRAM objetivo | 8 GB (RTX 4060 probada) |
| Throughput medido | 47,0 tok/s con MTP / 25,4 tok/s sin MTP (v3, RTX 4060) |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B emplea una arquitectura de transformer con bucles, en la que el mismo bloque de capas se reutiliza varias veces, combinada con una ruta de enrutamiento mHC. Esta cuantización conserva la cabecera MTP (multi-token prediction) del modelo original, que actúa como mecanismo de decodificación especulativa y proporciona una aceleración de aproximadamente 1,85× según las mediciones del autor. La entrada de imagen se gestiona mediante un proyector multimodal separado en formato F16 (0,92 GB), tomado sin modificaciones del repositorio oficial de SenseNova.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La cuantización v3 se calibró con un conjunto que incluye prosa de Wikipedia en turco e inglés, diálogos de tool calling de glaive-function-calling-v2 y código Python del conversor de llama.cpp; el autor indica que uno de los conjuntos de evaluación de código quedó fuera de las decisiones de calibración. Los embeddings de tokens se almacenan en Q8_0, lo que añade unos 0,38 GB al fichero pero no incrementa la VRAM dedicada, ya que llama.cpp mantiene esa tabla en RAM del sistema.

## Capacidades

- Generación de texto conversacional y razonamiento en inglés, chino y turco.
- Comprensión de imágenes (image-text-to-text) mediante el proyector mmproj opcional, con soporte de prompts de hasta 1080p.
- Tool calling y function calling, según la presencia de diálogos de este tipo en los datos de calibración y en los tags del modelo.
- Decodificación especulativa mediante cabecera MTP, con aceleración medida de aproximadamente 1,85× en generación.
- Contexto largo de hasta 104.448 tokens en modo texto.
- Capacidad de needle test verificada: un prompt de texto de 55.728 tokens superó la prueba con el proyector cargado.
- No se ha documentado soporte explícito de agentes multi-paso ni de audio en la información disponible.

## Casos de uso

- Asistente conversacional local en GPU de 8 GB: el modelo mantiene conversaciones multi-turno con hasta 104.448 tokens de contexto en una RTX 4060, lo que permite conservar historiales largos sin recortes agresivos.
- Análisis de documentos extensos: con 104K tokens de ventana se pueden procesar informes, contratos o bases de código completas en una sola pasada, manteniendo coherencia entre secciones distantes.
- Automatización con tool calling: la presencia de diálogos de function calling en la calibración y los tags del modelo lo hacen apto para pipelines que requieran invocar APIs o funciones externas desde un asistente.
- Procesamiento de imágenes en local: combinado con el mmproj F16, permite describir, resumir o extraer información de capturas e imágenes de hasta 1080p con 57.344 tokens de contexto, sin enviar datos a servicios externos.
- Generación y revisión de código: el conjunto de evaluación incluye código Python del conversor de llama.cpp, y el modelo puede integrarse en entornos de desarrollo locales para autocompletado o revisión, aunque no se han publicado benchmarks específicos de código.
- Despliegue en entornos con recursos limitados: al caber en 8 GB de VRAM con todas las capas en GPU, es adecuado para estaciones de trabajo modestas, portátiles con GPU de consumo o servidores de borde.
- Experimentación con decodificación especulativa: la cabecera MTP incluida permite evaluar y comparar el rendimiento de técnicas de speculative decoding en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos cuantitativos son métricas de calidad de cuantización y velocidad medidas por el autor:

| Metrica | v2 | v3 | Cambio |
|---|---|---|---|
| KLD vs Q8_0, conjunto 1 (Wikipedia turco/inglés) | 0,0703 | 0,0566 | −19,5 % |
| KLD vs Q8_0, conjunto 2 (Wikipedia inglés + tool calling) | 0,0762 | 0,0612 | −19,8 % |
| KLD vs Q8_0, conjunto 3 (código Python) | 0,0359 | no disponible en el extracto | no disponible |
| Percentil 99 de KLD | referencia | 15–33 % menor | mejora |
| Velocidad de generación (RTX 4060, MTP on) | no disponible | 47,0 tok/s | — |
| Velocidad de generación (RTX 4060, MTP off) | no disponible | 25,4 tok/s | — |

El fichero HQ presenta una salida entre un 15 % y un 28 % más cercana a Q8_0 que la v3, medido en una RTX 5060 Ti. Todas las mediciones son ejecuciones únicas.

## Requisitos de hardware

- VRAM estimada: 8 GB dedicados para el fichero v3 (6,19 GB) con caché KV q4_0 y contexto de 104.448 tokens; el HQ (6,51 GB) requiere caché KV q8_0 y contexto máximo probado de 57.344 tokens; añadir el mmproj (0,92 GB) reduce el contexto probado a 57.344 tokens.
- GPU probada: RTX 4060 8 GB (v3 y v2) y RTX 5060 Ti (comparación HQ). No se han documentado pruebas en otras GPU.
- Cabe en GPU de consumo de 8 GB; el autor reporta 7.903 MiB de VRAM dedicada tras la prueba larga con v3, frente a 7.851 MiB con v2, y menos de 200 MiB de memoria compartida.
- Motor de despliegue: fork parcheado de llama.cpp con kernels CUDA para el enrutamiento mHC. Los ficheros de este repositorio no cargan en la build del PR #32588 de llama.cpp, y los de ese PR no cargan en el fork utilizado.
- Latencia y throughput: 47,0 tok/s con MTP y 25,4 tok/s sin MTP en RTX 4060; 46,9 tok/s con prompt de imagen 1080p y MTP activo.
- No se dispone de datos de despliegue en vLLM, TGI u Ollama para esta cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-8GB-v3 (este) | 9,2 B | 104.448 | GGUF 6,19 GB | Apache 2.0 | MTP incluido, fork parcheado |
| SenseNova-Loop-9B-8GB-v2 | 9,2 B | 81.920 (con proyector) / 104.448 (texto) | GGUF | Apache 2.0 | KLD ~20 % peor que v3; variante Vision con 81.920 tokens |
| SenseNova-Loop-9B-8GB-v3-HQ | 9,2 B | 57.344 | GGUF 6,51 GB | Apache 2.0 | 15–28 % más cercano a Q8_0 que v3 |
| AtomicChat AD-Q4_K_M | 9,2 B | no disponible | GGUF 5,96 GB | Apache 2.0 (presumible) | Al menos tan cercano a Q8_0 como v3; se desborda de VRAM con los mismos ajustes en el fork de SenseNova |
| SenseNova-Loop-9B-GGUF (oficial, PR #32588) | 9,2 B | no disponible | GGUF Q8_0 a IQ2_XS | Apache 2.0 | Requiere build del PR #32588; más lento en RTX 4060 por falta de kernels CUDA para mHC |

## Limitaciones y advertencias

- Requiere un fork parcheado de llama.cpp; los ficheros no son intercambiables con la build del PR #32588 ni con llama.cpp upstream estándar.
- El contexto máximo de 104.448 tokens solo se alcanza en modo texto; con el proyector de visión o con el fichero HQ el máximo probado baja a 57.344 tokens.
- Solo se han validado tres idiomas (inglés, chino y turco); el rendimiento en castellano no está documentado y podría ser inferior.
- No se han publicado benchmarks estándar de razonamiento, código o matemáticas, por lo que la comparación con otros modelos se limita a métricas de cuantización.
- Riesgo de alucinación inherente a los modelos de 9 B sin datos específicos de evaluación; no se han documentado sesgos conocidos.
- Las mediciones de velocidad y VRAM provienen de ejecuciones únicas en una RTX 4060 bajo Windows sin pantalla conectada; pueden no reproducirse en otros entornos.
- El autor reconoce que AtomicChat AD-Q4_K_M es al menos tan cercano a Q8_0 como v3; la ventaja de v3 es la configuración probada de contexto largo con MTP en 8 GB.
- La licencia Apache 2.0 permite uso comercial, pero la dependencia de un fork no oficial de llama.cpp añade riesgo de mantenimiento en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-v3-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- GGUF oficial de SenseNova: https://huggingface.co/sensenova/SenseNova-Loop-9B-GGUF
- Versión v2: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-v2-GGUF
- Versión v1: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-GGUF
- Escalera completa de cuantizaciones: https://huggingface.co/drofn/SenseNova-Loop-9B-GGUF
- Colección de cuantizaciones: https://huggingface.co/collections/drofn/sensenova-loop-9b-gguf-for-6-8-gb-gpus-6aff1a746c005b20c4230d30
- PR de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/32588
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
