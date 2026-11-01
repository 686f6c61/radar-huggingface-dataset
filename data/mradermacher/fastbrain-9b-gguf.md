# mradermacher/FastBrain-9B-GGUF

## Resumen

FastBrain-9B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo TypeScript/FastBrain-9B, publicada por mradermacher, un cuantizador conocido en la comunidad de Hugging Face. El modelo base, FastBrain-9B, es un modelo de decisión de unos 9.075 millones de parámetros (dato real de safetensors: 9.075.566.084) entrenado sobre el dataset TypeScript/FastBrain-Instruct, orientado a tareas de decisión estructurada: clasificación de intención, indexación de decisiones, tool calling y salida tipada a partir de imagen y texto.

La relevancia de esta ficha radica en el perfil tan específico del modelo: no se trata de un chatbot de propósito general, sino de un modelo etiquetado como "decision-model" e "image-text-to-typed-output", lo que sugiere un enfoque en convertir entradas multimodales en salidas estructuradas y tipadas, algo útil para pipelines de agentes y sistemas de enrutado de intenciones. La versión GGUF permite ejecutarlo localmente con llama.cpp, Ollama o backends compatibles como sglang (ambos mencionados en los tags).

La colección incluye cuantizaciones desde Q2_K (4,0 GB) hasta f16 (18,3 GB), además de dos suplementos multimodales (mmproj) en Q8_0 y f16, lo que confirma capacidades de visión. El modelo se publica bajo licencia Apache 2.0 y su idioma principal es el inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (transformer multimodal, con proyector de visión mmproj) |
| Parametros totales | 9.075.566.084 (9,08 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base está disponible en safetensors |

## Arquitectura y entrenamiento

La información publicada no detalla la arquitectura interna del modelo base. Por los tags del repositorio ("image-text-to-typed-output", "decision-index", "structured-decision") y por la presencia de archivos mmproj (proyectores multimodales usados por llama.cpp para conectar un codificador de visión con un LLM), se trata de un modelo transformer de unos 9 B de parámetros con capacidad de procesar imágenes y texto, y generar salidas estructuradas y tipadas. El pipeline de conversión indica "convert_type: hf", es decir, conversión directa desde los pesos safetensors de Hugging Face.

Sobre el entrenamiento, el dataset indicado es TypeScript/FastBrain-Instruct, un dataset de instrucciones específico del proyecto FastBrain. No se ha publicado información sobre el número de tokens de preentrenamiento, la composición del corpus base ni sobre fases de RLHF o DPO. Tampoco se describen innovaciones técnicas concretas (atención lineal, decodificación especulativa, etc.) en la documentación disponible. Los tags "clef", "systemone" y "decision-index" sugieren un sistema de indexación y decisión propio del proyecto, pero sin documentación adicional su significado exacto no está disponible.

## Capacidades

- Clasificación de intención (intent-classification): etiquetado explícito en el repositorio.
- Tool calling / function calling: el modelo está etiquetado para ambas capacidades.
- Salida estructurada y tipada: orientado a "structured-decision" y "image-text-to-typed-output", es decir, producir respuestas con formato definido (JSON u otros tipos) a partir de entradas multimodales.
- Comprensión de imágenes: los archivos mmproj-Q8_0 y mmproj-f16 confirman soporte multimodal (visión + texto) en llama.cpp.
- Indexación de decisiones (decision-index): enrutado o selección entre opciones predefinidas.
- Conversación: el repositorio está etiquetado como "conversational", aunque su enfoque principal parece ser la decisión estructurada más que el chat de propósito general.
- Idioma: capacidad documentada únicamente en inglés.

## Casos de uso

- Clasificación de intenciones en asistentes virtuales: dado el tag "intent-classification", el modelo puede actuar como capa de enrutado que clasifica la consulta del usuario y la dirige al subflujo adecuado, con salidas tipadas fáciles de parsear.
- Orquestación de agentes con tool calling: su soporte de function calling lo hace adecuado como modelo planificador o selector de herramientas en pipelines de agentes, donde se necesita una decisión estructurada (qué herramienta invocar y con qué argumentos) en lugar de texto libre.
- Procesamiento de documentos con visión: gracias a los suplementos mmproj, puede recibir capturas de pantalla, formularios escaneados o imágenes de documentos y producir una salida tipada (por ejemplo, campos extraídos en JSON) para automatizar la entrada de datos.
- Sistemas de decisión automatizada: el tag "decision-model" sugiere su uso como árbitro o evaluador que elige entre opciones predefinidas (por ejemplo, seleccionar la mejor respuesta de un conjunto o aprobar/rechazar solicitudes según criterios).
- Enrutado de peticiones en sistemas multi-modelo: como clasificador ligero de 9 B cuantizado a 4-6 GB, puede decidir qué modelo grande debe atender cada consulta, reduciendo coste y latencia del sistema global.
- Indexación y categorización semántica: el tag "decision-index" apunta a construir índices de decisiones o categorías sobre grandes volúmenes de entradas (tickets, correos, imágenes) de forma automática.
- Automatización de flujos RPA: combinando visión y salida estructurada, puede integrarse en flujos de automatización robótica de procesos donde se necesita leer una interfaz y emitir una acción tipada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización elegida. Q2_K ocupa 4,0 GB; Q4_K_M, 5,8 GB; Q6_K, 7,6 GB; Q8_0, 9,8 GB; f16, 18,3 GB. A estos tamaños hay que sumar la memoria del contexto y, si se usa visión, el archivo mmproj (0,7 GB en Q8_0 o 1,0 GB en f16).
- GPU recomendadas: para las cuantizaciones de 4 a 6 GB, cualquier GPU de consumo con 8 GB de VRAM (RTX 3060, RTX 4060) es suficiente; para Q8_0 y f16 conviene una RTX 4090 (24 GB) o superior. En CPU con suficiente RAM (16 GB o más) también es viable mediante offload parcial con llama.cpp.
- Consumer GPU: sí, la mayoría de las cuantizaciones (Q2_K a Q6_K) caben cómodamente en GPUs de consumo de 8-12 GB de VRAM.
- Opciones de despliegue: llama.cpp y Ollama son las opciones naturales para GGUF; los tags también mencionan sglang como backend compatible. El modelo base en safetensors puede desplegarse con transformers, vLLM o TGI, aunque no hay configuraciones publicadas para ello.
- Latencia y throughput: no disponible. Al ser un modelo de 9 B con cuantizaciones de 4 bits, se espera inferencia fluida en GPU de consumo, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastBrain-9B (base) | 9,08 B | no disponible | sí (mmproj) | Apache 2.0 | safetensors en Hugging Face |
| FastBrain-9B-GGUF | 9,08 B | no disponible | sí (mmproj incluido) | Apache 2.0 | GGUF, 12 cuantizaciones |
| Llama 3.1 8B Instruct | 8 B | 128.000 tokens | no (solo texto) | Licencia Llama 3.1 | safetensors y GGUF amplios |
| Qwen2.5-VL-7B | 7-8 B | no disponible en esta ficha | sí (visión nativa) | Apache 2.0 | safetensors y GGUF |

FastBrain-9B se diferencia de alternativas de tamaño similar (Llama 3.1 8B, Qwen2.5-VL-7B) en su especialización como modelo de decisión con salida tipada y tool calling, frente a los modelos generales orientados a chat. Para chat de propósito general o soporte multilingüe, las alternativas generales suelen estar mejor documentadas y con más benchmarks publicados; para enrutado de intenciones y decisiones estructuradas, FastBrain está específicamente afinado para ello.

## Limitaciones y advertencias

- Idioma: la documentación solo declara soporte para inglés. No hay garantías de rendimiento en castellano ni en otros idiomas.
- Documentación escasa: la model card del modelo base no publica benchmarks, longitud de contexto, detalles de arquitectura ni datos de entrenamiento, lo que dificulta una evaluación rigurosa antes de producción.
- Sesgos: no disponible. No se han documentado sesgos conocidos del modelo base.
- Alucinaciones: al tratarse de un modelo de decisión con salida estructurada, el riesgo principal es la clasificación errónea o la generación de campos tipados incorrectos; se recomienda validación de esquema en producción.
- Cuantizaciones bajas: las versiones Q2_K y Q3_K_S/M pueden degradar notablemente la calidad (el propio autor marca Q3_K_M como "lower quality"); para uso serio se recomiendan Q4_K_M o superiores.
- Cuantizaciones estáticas: solo hay cuants estáticos; las cuantizaciones imatrix/ponderadas no estaban disponibles en el momento de publicación.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes, aunque conviene verificar la licencia del dataset TypeScript/FastBrain-Instruct y del modelo base, cuya documentación no está disponible en esta ficha.
- Ficha de terceros: esta colección GGUF es obra de un cuantizador independiente (mradermacher), no del autor del modelo base; cualquier problema de conversión debe reportarse al cuantizador, no a TypeScript.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/FastBrain-9B-GGUF
- Modelo base: https://huggingface.co/TypeScript/FastBrain-9B
- Dataset de instrucciones: https://huggingface.co/TypeScript/FastBrain-Instruct
- Página de descargas resumida del cuantizador: https://hf.tst.eu/model#FastBrain-9B-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador (nethype GmbH): https://www.nethype.de/
