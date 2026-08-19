# luganoquants/Hermes-4.3-36B

## Resumen

Hermes 4.3 36B es un modelo de razonamiento de modo hibrido desarrollado por Nous Research sobre la base ByteDance Seed-OSS-36B-Base. Esta version publicada por luganoquants reproduce el modelo original con pesos en formato safetensors. Se trata del primer modelo de la familia Hermes entrenado de forma descentralizada a traves de la red Psyche, un enfoque que permite distribuir el entrenamiento por internet. El modelo destaca por su modo de razonamiento hibrido, que alterna deliberacion explicita entre etiquetas `thinking` y `response` con respuestas directas, y por su fuerte adherencia a esquemas JSON y salidas estructuradas.

El corpus de post-entrenamiento se amplio de forma significativa respecto a Hermes 3, pasando de 1 millon de muestras y 1.200 millones de tokens a aproximadamente 5 millones de muestras y 60.000 millones de tokens, con un enfasis en trazas de razonamiento verificadas, matematicas, codigo, STEM y logica. El modelo alcanza el estado del arte en RefusalBench entre modelos no ablacionados, con un 74,6 % de preguntas respondidas en modo no razonamiento, superando a modelos cerrados como GPT-4o, Gemini 2.5 Pro o Claude Sonnet 4. Con 36.151 millones de parametros y licencia Apache 2.0, se posiciona como una opcion solida para inferencia local en GPU de consumo y despliegue empresarial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de ByteDance Seed-OSS-36B-Base) |
| Parametros totales | 36.151.104.512 (36,15 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (el modelo incluye la etiqueta "long context" pero no se especifica la cifra) |
| Tipos de cuantizacion | safetensors (repositorio original) y GGUF (cuantizaciones disponibles en repositorios derivados) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Hermes 4.3 36B parte del modelo base ByteDance Seed-OSS-36B-Base, un transformer denso de 36.000 millones de parametros. Sobre esta base, Nous Research aplico un post-entrenamiento con aproximadamente 5 millones de muestras y 60.000 millones de tokens, combinando datos de razonamiento y no razonamiento. El corpus sintetico incluye trazas de razonamiento verificadas, con mejoras sustanciales en matematicas, codigo, STEM, logica, creatividad y fidelidad al formato de salida, manteniendo la calidad general como asistente y un alineamiento neutral.

La innovacion principal es el modo de razonamiento hibrido: el modelo decide cuando deliberar y emite segmentos entre etiquetas `thinking` y `response`, activables mediante el flag `thinking=True` en la plantilla de chat o mediante un system prompt especifico. Tambien se entrenó para producir JSON valido segun esquemas proporcionados y para reparar objetos malformados. El entrenamiento se realizo de forma descentralizada a traves de la red Psyche, siendo el primer modelo Hermes entrenado con este metodo. El informe tecnico completo esta disponible en el articulo arXiv 2508.18255.

## Capacidades

- Razonamiento hibrido con deliberacion explicita: el modelo puede activar un modo de pensamiento profundo con cadenas de razonamiento extensas entre etiquetas `thinking` y `response`, o responder directamente sin deliberacion.
- Generacion de texto y conversacion: asistente generalista con formato de chat Llama-3-Chat, compatible con system prompts personalizados para ajustar estilo, politica y esfuerzo de razonamiento.
- Function calling y tool use: soporte nativo para definicion de herramientas e invocacion de funciones dentro de la conversacion.
- Salidas estructuradas: entrenado para producir JSON valido segun esquemas dados y para reparar objetos JSON malformados, con modo JSON explicito.
- Matematicas, codigo, STEM y logica: mejoras significativas frente a Hermes 3 gracias al corpus de razonamiento verificado, con resultados destacados en AIME, MATH-500, GPQA Diamond y BBH.
- Creatividad y escritura: el modo de razonamiento mejora tambien la escritura creativa y las respuestas subjetivas, segun el informe del autor.
- Alineamiento steerable: estado del arte en RefusalBench con un 74,6 % de preguntas respondidas en modo no razonamiento, sin ablacion, permitiendo alinear el modelo a valores del usuario.
- Soporte de roleplaying y conversacion prolongada: incluido entre los casos de uso declarados, con etiqueta "long context".

## Casos de uso

- Atencion al cliente automatizada: el modelo gestiona conversaciones multi-turno con system prompts personalizados para ajustar tono y politica de la empresa, manteniendo un alineamiento neutral y baja tasa de rechazo gracias a su resultado en RefusalBench.
- Generacion de codigo en produccion: con soporte de function calling y razonamiento verificable, puede integrarse en pipelines de CI/CD para generar, revisar y documentar codigo, o para autocompletar tareas de desarrollo con explicaciones de su razonamiento.
- Agentes autonomos con tool use: el modo de razonamiento hibrido permite planificar pasos multiples, invocar herramientas externas y estructurar la salida en JSON, adecuado para orquestar agentes que consultan APIs, bases de datos o servicios web.
- Extraccion y normalizacion de datos estructurados: su entrenamiento en adherencia a esquemas JSON y reparacion de objetos malformados lo hace util para transformar texto libre en registros estructurados validos para ingestion en bases de datos.
- Asistente de investigacion cientifica y STEM: con resultados de 65,5 en GPQA Diamond y 93,8 en MATH-500, puede ayudar a resolver problemas de fisica, quimica y matematicas, asi como a redactar explicaciones didacticas.
- Despliegue local privado en GPU de consumo: con 36 B de parametros y cuantizaciones GGUF que caben en la VRAM de GPU comerciales, permite ejecutar un asistente potente de forma local sin enviar datos a terceros, ideal para entornos con requisitos de privacidad.
- Escritura creativa y roleplaying: el modo de razonamiento mejora la coherencia narrativa y la expresividad, siendo util para generar ficcion, dialogos y personajes con control fino sobre el estilo mediante system prompts.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card comparan la version entrenada via Psyche, la version centralizada y Hermes 4 70B:

| Benchmark | Hermes 4.3 36B Psyche | Hermes 4.3 36B Centralizada | Hermes 4 70B Centralizada |
|---|---|---|---|
| AIME 24 | 71,9 | 70,6 | 73,5 |
| AIME 25 | 69,3 | 66,8 | 67,4 |
| BBH | 86,4 | 84,7 | 87,8 |
| DROP | 83,5 | 81,6 | 85,0 |
| GPQA Diamond | 65,5 | 64,8 | 66,1 |
| IFEval | 77,9 | 73,9 | 78,7 |
| MATH-500 | 93,8 | 92,3 | 95,5 |
| MMLU | 87,7 | 86,5 | 88,4 |
| MMLU-Pro | 80,7 | 79,7 | 80,7 |
| MuSR | 69,7 | 64,7 | 70,4 |
| OBQA | 96,6 | 91,8 | 94,8 |
| SimpleQA | 6,0 | 5,6 | 17,9 |

Resultados en RefusalBench (porcentaje de preguntas respondidas, media de 5 intentos):

| Modelo | % de preguntas respondidas |
|---|---|
| Hermes 4.3 36B no razonamiento | 74,60 |
| Hermes 4.3 36B razonamiento | 72,29 |
| Hermes 4 70B razonamiento | 59,50 |
| Hermes 4 405B razonamiento | 57,10 |
| grok4 | 51,30 |
| GPT-4o | 17,67 |
| Gemini 2.5 Pro | 24,23 |
| DeepSeek V3 | 28,10 |

El modelo destaca especialmente en RefusalBench, donde supera a todos los modelos cerrados y abiertos comparados, y mantiene un rendimiento competitivo en MMLU, MATH-500 y OBQA frente a Hermes 4 70B, con una ligera perdida en SimpleQA, donde obtiene un resultado muy bajo (6,0).

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio en safetensors ocupa 72,3 GB, por lo que en precision FP16/BF16 se requieren aproximadamente 72 GB de VRAM (una GPU A100 80 GB o dos RTX 4090 en paralelo).
- Con cuantizaciones GGUF, el modelo cabe en GPU de consumo: una cuantizacion Q4_K_M ocuparia aproximadamente 21-23 GB (RTX 4090 24 GB o RTX 3090), y una Q8 aproximadamente 38-40 GB (necesitaria dos GPU o una GPU profesional).
- GPU recomendadas: A100 80 GB o H100 para precision completa; RTX 4090, RTX 3090 o RTX 4080 para cuantizaciones GGUF.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI y transformers con el flag `thinking=True` para activar el modo razonamiento.
- Latencia y throughput: no disponible en la informacion proporcionada; dependera de la cuantizacion y del hardware utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | MMLU | MATH-500 | RefusalBench |
|---|---|---|---|---|---|---|
| Hermes 4.3 36B | 36,15 B | No disponible | Apache 2.0 | 87,7 | 93,8 | 74,6 % |
| Hermes 4 70B | 70 B | No disponible | Apache 2.0 | 88,4 | 95,5 | 49,1 % |
| Qwen3 235B | 235 B | No disponible | Apache 2.0 | No disponible | No disponible | 34,3 % |
| DeepSeek V3 | 671 B (MoE) | No disponible | No disponible | No disponible | No disponible | 28,1 % |

Hermes 4.3 36B ofrece un rendimiento cercano al de Hermes 4 70B en la mayoria de benchmarks con la mitad de parametros, y supera ampliamente a modelos mucho mayores en RefusalBench, lo que refleja su enfoque en steerability y ausencia de censura. Frente a Qwen3 235B y DeepSeek V3, el modelo de Nous Research es significativamente mas pequeno y ligero, con una licencia permisiva Apache 2.0 que permite uso comercial sin restricciones.

## Limitaciones y advertencias

- SimpleQA muy bajo: el modelo obtiene solo 6,0 en SimpleQA, lo que indica una precision factual limitada en preguntas de conocimiento general; es recomendable verificar sus respuestas en contextos donde la exactitud sea critica.
- Solo ingles: la model card declara exclusivamente el idioma ingles; no hay soporte confirmado para castellano u otros idiomas.
- Longitud de contexto no especificada: aunque se etiqueta como "long context", no se ha publicado la cifra exacta de tokens de ventana, por lo que conviene validarla empiricamente antes de usarla en produccion con contextos extensos.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en tareas factuales; el bajo resultado en SimpleQA refuerza esta precaucion.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, pero el modelo base Seed-OSS-36B-Base puede tener condiciones adicionales que conviene revisar.
- Modelo derivado sin verificacion independiente: esta version de luganoquants no presenta benchmarks propios ni resultados en el model-index; los datos de rendimiento provienen de la model card de Nous Research y deben tomarse como declaraciones del autor.
- Despliegue en produccion: al ser un modelo de 36 B, requiere hardware con suficiente VRAM o cuantizacion agresiva, lo que puede degradar la calidad de las respuestas en funcion del nivel de cuantizacion elegido.

## Enlaces

- Repositorio HuggingFace de esta version: https://huggingface.co/luganoquants/Hermes-4.3-36B
- Repositorio HuggingFace original de Nous Research: https://huggingface.co/NousResearch/Hermes-4.3-36B
- Modelo base ByteDance Seed-OSS-36B-Base: https://huggingface.co/ByteDance-Seed/Seed-OSS-36B-Base
- Blog de presentacion de Hermes 4.3: https://nousresearch.com/introducing-hermes-4-3
- Informe tecnico Hermes 4 (arXiv 2508.18255): https://arxiv.org/abs/2508.18255
- Red de entrenamiento descentralizado Psyche: https://psyche.network
- Chat publico con Hermes en Nous Chat: https://chat.nousresearch.com
- Pagina de releases de Nous Research: https://nousresearch.com/releases
- Busqueda de cuantizaciones GGUF del modelo: https://huggingface.co/models?other=base_model:quantized:NousResearch/Hermes-4.3-36B
