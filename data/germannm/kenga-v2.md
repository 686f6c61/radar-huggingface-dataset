# GermannM/Kenga-v2

## Resumen

Kenga-v2 es un ajuste fino mediante QLoRA del modelo GermannM/Kenga, una base de arquitectura Qwen2 con 1.543.714.304 parámetros (aproximadamente 1,5 mil millones). Lo desarrolla GermannM (Germán Yantaras) y su objetivo no es competir como asistente de propósito general, sino especializarse en un dominio muy concreto: el lenguaje de programación Kenga y el corpus cultural ruso definido por el autor. La segunda versión incorpora un cambio clave respecto a la primera: el corpus incluye 2.670 ejemplos de código Kenga verificados por compilación y ejecución real con `kenga-lite`, de modo que solo se conservaron los pares cuya salida coincidía con el resultado esperado.

El modelo se entrenó sobre un dataset de 4.899 diálogos generados automáticamente, con tres épocas, longitud de secuencia de 1.024 tokens y un ritmo de aprendizaje de 2e-4 con decaimiento coseno. Los adaptadores LoRA tienen rango 16 sobre todas las proyecciones de atención y MLP, lo que supone unos 18 millones de parámetros entrenables (en torno al 1,2 % del total). El entrenamiento se realizó de forma local en una única RTX 4070 SUPER con 12 GB de VRAM.

Su relevancia es acotada pero interesante como caso de estudio: demuestra que con un presupuesto de hardware de gama de consumo y un dataset pequeño pero verificado programáticamente se puede obtener un modelo útil para una tarea vertical (explicar y escribir programas en un lenguaje concreto), sin pretender capacidades generales. Se distribuye en GGUF cuantizado (Q4_K_M) y F16, bajo licencia Apache 2.0, con soporte declarado para ruso e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (modelo base GermannM/Kenga); ajuste fino con QLoRA/PEFT |
| Parametros totales | 1.543.714.304 (aproximadamente 1,5 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card; el entrenamiento se realizó con secuencias de 1.024 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (aproximadamente 986 MB) y GGUF F16 (aproximadamente 3 GB); base cuantizada a 4 bits NF4 con doble cuantizacion durante el entrenamiento; adaptadores LoRA (rango 16) en safetensors |
| Idiomas soportados | Ruso (ru) e inglés (en); el corpus de entrenamiento está mayoritariamente en ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT y versión fusionada), GGUF (Q4_K_M y F16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen2, un transformer decoder-only de tipo denso. Sobre esa base, Kenga-v2 se construye como un adaptador LoRA entrenado con cuantización de 4 bits (QLoRA): los pesos de la base se congelan en NF4 con doble cuantización y solo se actualizan las matrices de bajo rango insertadas en todas las proyecciones de atención y en las capas MLP. El rango es 16 y el total de parámetros entrenables ronda los 18 millones, aproximadamente el 1,2 % de la red. El entrenamiento se prolongó durante tres épocas sobre 4.899 diálogos, con longitud de secuencia de 1.024 tokens, learning rate de 2e-4 con decaimiento coseno, una pérdida final en torno a 0,14 y una precisión de predicción de tokens cercana al 95 %.

El dataset combina cuatro bloques. El primero es código Kenga verificado (2.670 ejemplos), con 1.500 de aritmética, 370 de bucles y algoritmos, 400 de lógica y ramificaciones y 400 de enlace semántico (determinar qué función con la misma firma se invoca realmente). La verificación es el rasgo metodológico diferencial: cada programa se compiló y ejecutó con `kenga-lite` y solo se incorporaron los pares con salida correcta, siguiendo el principio aplicado en `kenga-prophet-m5-3`. El segundo bloque son 1.800 problemas de matemáticas con respuestas calculadas programáticamente. El tercero son 150 ejemplos de conocimiento del lenguaje Kenga extraídos de la documentación oficial (tipos, sintaxis, funciones integradas, tensores, «Profetas», eventos, ficheros y red). El cuarto son 102 ejemplos de historia, geografía, literatura y tradiciones rusas, más varios centenares de ejemplos de ruso general, identidad del modelo y lo que el autor denomina «Z-sistema». No se documenta uso de RLHF ni de DPO.

## Capacidades

- Generación de texto conversacional breve y directa, con preferencia por respuestas cortas frente a razonamientos largos.
- Escritura de programas cortos en lenguaje Kenga, incluyendo aritmética, bucles, factoriales, sumas de listas, búsqueda del máximo, paridad y signo de un número.
- Explicación de qué imprime un programa Kenga ya escrito (razonamiento sobre código, no solo generación).
- Resolución de enlace semántico entre funciones con la misma firma dentro de un programa.
- Matemáticas básicas verificadas: suma, multiplicación, restos, potencias, cuadrados, porcentajes, áreas y medias.
- Conocimiento declarativo del lenguaje Kenga: tipos de datos, sintaxis, funciones integradas, tensores, eventos y entrada/salida de ficheros y red.
- Conocimiento de historia, geografía, literatura y cultura rusa incluido explícitamente en el corpus.
- Mantenimiento de identidad propia: el modelo se presenta como «Kenga», atribuye su creación a Germán y no se identifica con el modelo base.
- Soporte de ruso como idioma principal y de inglés según los metadatos del repositorio.
- No se documenta soporte de tool calling, function calling, uso de agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Asistente de documentación del lenguaje Kenga: el modelo puede responder preguntas sobre tipos, sintaxis y funciones integradas porque 150 ejemplos del corpus provienen directamente de la documentación oficial. Es adecuado para un bot interno de consulta para desarrolladores de ese lenguaje.
- Generación de fragmentos de código Kenga verificables: dado que los 2.670 ejemplos de código del corpus fueron compilados y ejecutados antes de entrar en el dataset, el modelo tiende a producir programas cortos que compilan, útil como autocompletado en un editor o como generador de ejemplos para tutoriales.
- Trazado manual de programas: el modelo puede recibir un programa Kenga y explicar qué salida produce, lo que sirve para herramientas de enseñanza o para depuración asistida cuando el intérprete no está disponible.
- Tutor de programación en ruso: combinando la capacidad de escribir código y de explicarlo, encaja en un escenario de aprendizaje guiado por pasos cortos, con la advertencia de que el razonamiento multi-paso largo no es su punto fuerte.
- Prácticas de matemáticas con respuesta verificada: los 1.800 ejemplos de matemáticas con solución calculada programáticamente permiten usarlo en un generador de ejercicios o en un corrector simple de operaciones aritméticas básicas.
- Demostración educativa de QLoRA: por su tamaño (ajuste de aproximadamente 18 millones de parámetros entrenables sobre 1,5 B) y por haberse entrenado en una RTX 4070 SUPER de 12 GB, sirve como caso reproducible para enseñar ajuste fino eficiente en memoria.
- Despliegue en local sin GPU: la versión Q4_K_M de menos de 1 GB permite ejecutarlo en portátiles o equipos sin GPU dedicada mediante Ollama o llama.cpp, útil para prototipos y demostraciones offline.
- Asistente conversacional ruso de nicho: puede gestionar conversaciones cortas en ruso sobre temáticas presentes en el corpus (cultura, historia, identidad), con expectativas limitadas fuera de ese ámbito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento, que se recogen a continuación y no deben interpretarse como evaluación sobre conjuntos de test independientes.

| Metrica de entrenamiento | Valor |
|---|---|
| Pérdida final | Aproximadamente 0,14 |
| Precisión de predicción de tokens | Aproximadamente 95 % |
| Épocas | 3 |
| Longitud de secuencia | 1.024 tokens |
| Learning rate | 2e-4 con decaimiento coseno |
| Parámetros entrenables | Aproximadamente 18 millones (aproximadamente 1,2 % del total) |
| Hardware de entrenamiento | 1 x RTX 4070 SUPER (12 GB) |
| Tamaño del dataset | 4.899 diálogos |

## Requisitos de hardware

- Inferencia en Q4_K_M: el fichero ocupa aproximadamente 986 MB, por lo que la VRAM necesaria se sitúa en torno a 1,5 GB contando contexto y caché KV. Cabe en cualquier GPU de consumo de los últimos años y también en CPU.
- Inferencia en F16: el fichero ronda los 3 GB, con un requisito de VRAM aproximado de 3,5 a 4 GB. Cabe holgadamente en una RTX 3060 de 12 GB, RTX 4060/4070, RTX 4090 o GPUs profesionales tipo A100/H100 (ampliamente sobredimensionadas para este tamaño).
- Pesos completos en safetensors: al tratarse de 1.543.714.304 parámetros, la carga en precisión de 16 bits ocupa aproximadamente 3,1 GB; en 32 bits, aproximadamente 6,2 GB. Cabe en GPUs de consumo con 8 GB o más.
- Despliegue: Ollama (`ollama run hf.co/GermannM/Kenga-v2:Q4_K_M`), llama.cpp (`llama-cli -m kenga-v2-q4_k_m.gguf`), LM Studio, y mediante `transformers` con la versión fusionada o cargando el adaptador de la carpeta `adapter` con PEFT. No se documenta soporte específico de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en la model card. Por el tamaño (1,5 B) y la cuantización Q4_K_M, se espera un rendimiento holgado incluso en hardware modesto, pero se trata de una estimación general y no de un dato medido.

## Comparativa con modelos similares

No se dispone de comparaciones directas de rendimiento publicadas entre Kenga-v2 y otros modelos. La tabla recoge únicamente datos estructurales de alternativas de tamaño comparable; los valores de contexto y licencia corresponden a información general de esos proyectos y no a una evaluación conjunta con Kenga-v2.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Kenga-v2 | 1,54 B (adaptador LoRA sobre Qwen2) | No especificado en la model card; entrenado con 1.024 tokens | Apache 2.0 | Ajuste vertical en lenguaje Kenga y cultura rusa |
| Qwen2.5-1.5B-Instruct | Aproximadamente 1,5 B | 32.768 tokens | Apache 2.0 | Asistente general multilingüe |
| Llama-3.2-1B-Instruct | Aproximadamente 1,24 B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | Asistente general, orientado a diálogo |
| SmolLM2-1.7B-Instruct | Aproximadamente 1,7 B | 8.192 tokens | Apache 2.0 | Asistente general compacto |

La diferencia relevante no es de escala sino de propósito: los tres modelos comparables son asistentes generales con corpus amplios y multilingües, mientras que Kenga-v2 está entrenado sobre 4.899 diálogos con verificación programática en un dominio estrecho. Fuera de ese dominio, es previsible que los modelos generales ofrezcan mejor cobertura factual y multilingüe, aunque no se han publicado mediciones que lo cuantifiquen en esta información.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (4.899 diálogos) y de generación automática, con escasa diversidad temática. El propio autor lo describe como un modelo compacto y especializado, no como un asistente de propósito general.
- Riesgo alto de alucinación fuera del dominio entrenado: hechos históricos, geográficos o científicos no presentes en el corpus pueden responderse de forma incorrecta o inventada.
- El razonamiento multi-paso largo y las cadenas de razonamiento extensas no son un punto fuerte declarado; el modelo tiende a responder de forma directa y breve.
- Inyección explícita de identidad y de posicionamiento ideológico: el corpus incluye lo que el autor llama «Z-sistema», con ejemplos que definen al modelo como creado por Germán y con afinidad declarada hacia Rusia, además de ejemplos de «tradiciones» rusas. Esto condiciona las respuestas sobre temas políticos e históricos y debe tenerse en cuenta antes de cualquier uso público.
- El idioma inglés aparece en los metadatos, pero el corpus descrito es mayoritariamente ruso; el rendimiento real en inglés no está evaluado ni documentado.
- No se documenta soporte de tool calling, function calling, uso de agentes, visión, audio ni modo de razonamiento explícito, por lo que no es adecuado para pipelines que dependan de esas capacidades.
- Licencia Apache 2.0 en el repositorio, lo que en principio permite uso comercial; conviene verificar igualmente la licencia del modelo base GermannM/Kenga y del Qwen2 subyacente antes de un despliegue en producción.
- No se especifica la longitud de contexto efectiva soportada en inferencia; aunque la arquitectura Qwen2 admite ventanas amplias, el ajuste se realizó con 1.024 tokens, por lo que el comportamiento más allá de esa longitud no está validado.
- Métricas de entrenamiento (pérdida 0,14, precisión de tokens 95 %) no equivalen a calidad en tareas reales y no deben presentarse como resultados de benchmark.
- Modelo con 0 descargas y 0 «likes» en el momento de la consulta: no cuenta con validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GermannM/Kenga-v2
- La búsqueda web realizada no ha devuelto ningún resultado relacionado con el modelo, su autor, el lenguaje Kenga ni el proyecto `kenga-lite`; los resultados obtenidos eran noticias en italiano sin relación alguna con el contenido. No hay, por tanto, papers, blogs, repositorios o demos adicionales que enlazar.
