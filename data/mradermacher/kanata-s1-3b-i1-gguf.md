# mradermacher/Kanata-S1-3B-i1-GGUF

## Resumen

Kanata-S1-3B-i1-GGUF es la versión cuantizada en formato GGUF del modelo Kanata-S1-3B, desarrollado originalmente por K-Ai-Official y convertida por el usuario mradermacher. Se trata de un modelo de lenguaje de 3.402.836.480 parámetros (aproximadamente 3,4 mil millones) afinado mediante QLoRA sobre una base de la familia IBM Granite, orientado específicamente a tareas de código, agentes y tool calling. La cuantización incluye variantes con imatrix (importance matrix), lo que permite obtener versiones de baja precisión con una pérdida de calidad menor que las cuantizaciones estáticas equivalentes.

El modelo está diseñado para flujos de trabajo agénticos: soporta llamadas a funciones, razonamiento multi-paso y generación de código, y está entrenado con datos multilingües que cubren inglés, japonés e indonesio. Su licencia Apache 2.0 facilita el uso comercial sin restricciones adicionales, lo que lo hace atractivo para integraciones en producción donde se requiere un modelo compacto que quepa en hardware de consumo.

La relevancia actual de esta ficha radica en que ofrece una alternativa de 3B parámetros especializada en tool calling y agentes, un nicho tradicionalmente dominado por modelos de mayor tamaño. Al estar disponible en GGUF con cuantizaciones desde 0,9 GB hasta 2,9 GB, puede desplegarse en GPUs de consumo e incluso en CPU, lo que democratiza el desarrollo de agentes locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de IBM Granite, según tag `granite`; detalles específicos no disponibles) |
| Parametros totales | 3.402.836.480 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, más fichero imatrix |
| Idiomas soportados | Indonesio (id), japonés (ja), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo base Kanata-S1-3B es un transformer de aproximadamente 3,4 mil millones de parámetros afinado mediante QLoRA (según el tag `qlora`), una técnica de ajuste eficiente en parámetros que congela los pesos originales y entrena adaptadores de bajo rango. La arquitectura subyacente se etiqueta como `granite`, lo que sugiere que deriva de la familia IBM Granite, aunque no se especifican detalles como el número de capas, dimensiones ocultas o mecanismo de atención. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre la composición exacta del dataset más allá de los conjuntos listados.

Los datos de entrenamiento incluyen: K-Ai-Official/Kai_v3 (dataset propio del autor), NousResearch/hermes-function-calling-v1 (orientado a function calling), teknium/OpenHermes-2.5 (instrucciones generales), NekoFi/alpaca-gpt4-indonesia-cleaned (instrucciones en indonesio) y llm-jp/magpie-sft-v1.0 (instrucciones en japonés). Esta combinación explica el soporte trilingüe y la especialización en tool calling. No se documenta si hubo fases de RLHF o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. La cuantización i1 (imatrix) utiliza una matriz de importancia calculada sobre datos de calibración para ponderar mejor los pesos durante la cuantización, lo que mejora la calidad frente a cuantizaciones estáticas del mismo tamaño.

## Capacidades

- Generación de texto general en inglés, japonés e indonesio.
- Generación de código y asistencia en programación (tag `code`).
- Tool calling y function calling: el modelo está entrenado explícitamente con hermes-function-calling-v1, lo que le permite emitir llamadas estructuradas a funciones.
- Razonamiento multi-paso y comportamiento agéntico (tags `agent`, `tool-calling`).
- Soporte de conversaciones multi-turno (implícito en los datasets de instrucciones tipo OpenHermes).
- Capacidades multilingües limitadas a los tres idiomas declarados; no se garantiza soporte para otros idiomas.
- No se dispone de información sobre modo thinking, visión, audio u otras capacidades especiales.

## Casos de uso

- **Agentes locales de automatización**: el modelo puede ejecutar bucles de razonamiento y tool calling en una máquina de consumo gracias a sus cuantizaciones de 2-3 GB, integrándose con frameworks como LangChain o LlamaIndex para orquestar tareas multi-paso (consultas a APIs, lectura de ficheros, etc.).
- **Asistente de código en IDE**: con la cuantización i1-Q4_K_M (2,2 GB), puede desplegarse en una RTX 3060 o superior para autocompletar y generar fragmentos de código, aprovechando su entrenamiento en código y su capacidad de llamar a herramientas como linters o compiladores.
- **Atención al cliente en indonesio o japonés**: el modelo está afinado con datasets específicos en ambos idiomas, lo que permite construir chatbots de soporte para mercados del sudeste asiático y Japón sin necesidad de un modelo mayor.
- **Automatización de pipelines CI/CD**: su soporte de function calling permite integrarlo en scripts que invocan herramientas de build, test o despliegue, emitiendo llamadas estructuradas a partir de instrucciones en lenguaje natural.
- **Prototipado rápido de agentes en CPU**: las cuantizaciones IQ2/IQ3 (1,1-1,7 GB) permiten ejecutar el modelo en CPU con llama.cpp u Ollama, útil para pruebas de concepto y entornos sin GPU.
- **Extracción de datos estructurados**: mediante tool calling, puede convertir texto libre en llamadas a funciones con parámetros validables, por ejemplo para rellenar formularios o generar JSON a partir de correos.
- **Educación y experimentación**: al ser Apache 2.0 y caber en hardware modesto, es adecuado para cursos y talleres sobre agentes y cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: entre 0,9 GB (i1-IQ1_S) y 2,9 GB (i1-Q6_K) para los pesos; añadir overhead de contexto y KV cache (típicamente 0,5-2 GB según longitud de contexto y batch).
- **GPU recomendadas**: cualquier GPU con 4 GB o más de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput. Las cuantizaciones IQ2/IQ3 pueden ejecutarse en GPUs integradas o CPU.
- **Consumer GPU**: sí, cabe holgadamente en GTX 1650 (4 GB), RTX 3050, RTX 3060, RTX 4060 y superiores. Las cuantizaciones más pequeñas (IQ1/IQ2) caben en 2 GB.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF como llama-cpp-python. Para el modelo base en safetensors, vLLM o TGI (aunque esta ficha cubre la versión GGUF).
- **Latencia y throughput**: no disponibles. En una RTX 4090, un modelo de 3B en Q4 suele generar decenas de tokens por segundo, pero no se proporcionan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| Kanata-S1-3B-i1-GGUF | 3,4B | No disponible | id, ja, en | Apache 2.0 | GGUF | Código, agentes, tool calling |
| Qwen2.5-3B-Instruct | 3,1B | 32K (típico) | Multilingüe (29+) | Apache 2.0 | Safetensors, GGUF | Instrucciones generales, código |
| Llama-3.2-3B-Instruct | 3,2B | 128K | Multilingüe (8) | Llama 3.2 Community | Safetensors, GGUF | Instrucciones generales |
| Granite-3.1-2B-Instruct | 2,5B | 128K | Multilingüe | Apache 2.0 | Safetensors, GGUF | Instrucciones, enterprise |

La comparativa se basa en características públicas de modelos de tamaño similar; no se dispone de benchmarks comparativos directos para Kanata-S1-3B. La ventaja principal de Kanata es su especialización en tool calling y su soporte nativo de indonesio y japonés, mientras que Qwen2.5 y Llama-3.2 ofrecen contextos más largos y mayor cobertura idiomática general.

## Limitaciones y advertencias

- **Sesgos**: al entrenarse con datasets como OpenHermes-2.5 y alpaca-gpt4, puede heredar sesgos presentes en datos generados por GPT-4 y en corpus web; no se documentan evaluaciones de sesgo.
- **Alucinación**: como todo modelo de 3B, tiene mayor propensión a inventar hechos que modelos mayores; en tool calling puede generar llamadas con parámetros incorrectos o inventados.
- **Contexto e idioma**: se desconoce la longitud de contexto oficial; el soporte se limita a inglés, japonés e indonesio, sin garantías para castellano u otros idiomas.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el modelo base puede tener sus propias condiciones (no especificadas en la información disponible); se recomienda verificar la licencia del modelo original K-Ai-Official/Kanata-S1-3B.
- **Cuantizaciones extremas**: las variantes IQ1 e IQ2 (0,9-1,3 GB) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "mostly desperate". Para producción se recomienda Q4_K_M o superior.
- **Producción**: no hay benchmarks publicados que validen su rendimiento en tareas reales; se recomienda evaluar con un conjunto propio antes de desplegar.

## Enlaces

- [Hugging Face: mradermacher/Kanata-S1-3B-i1-GGUF](https://huggingface.co/mradermacher/Kanata-S1-3B-i1-GGUF)
- [Modelo base: K-Ai-Official/Kanata-S1-3B](https://huggingface.co/K-Ai-Official/Kanata-S1-3B)
- [Cuantizaciones estáticas: mradermacher/Kanata-S1-3B-GGUF](https://huggingface.co/mradermacher/Kanata-S1-3B-GGUF)
- [Página de descargas del autor](https://hf.tst.eu/model#Kanata-S1-3B-i1-GGUF)
- [Dataset K-Ai-Official/Kai_v3](https://huggingface.co/datasets/K-Ai-Official/Kai_v3)
- [Dataset NousResearch/hermes-function-calling-v1](https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1)
- [Dataset teknium/OpenHermes-2.5](https://huggingface.co/datasets/teknium/OpenHermes-2.5)
- [Dataset NekoFi/alpaca-gpt4-indonesia-cleaned](https://huggingface.co/datasets/NekoFi/alpaca-gpt4-indonesia-cleaned)
- [Dataset llm-jp/magpie-sft-v1.0](https://huggingface.co/datasets/llm-jp/magpie-sft-v1.0)
- [FAQ y solicitudes de cuantización de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [Gráfico comparativo de cuantizaciones de ikawrakow](https://www.nethype.de/huggingface_embed/quantpplgraph.png)
- [Notas de Artefact2 sobre cuantizaciones](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
