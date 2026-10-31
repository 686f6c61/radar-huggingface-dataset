# mradermacher/TinyToolRouter-0.6B-GGUF

## Resumen

TinyToolRouter-0.6B-GGUF es la versión cuantizada en formato GGUF del modelo TinyToolRouter-0.6B, un modelo de lenguaje de tamaño muy reducido (596 millones de parámetros) especializado en tool calling, function calling y enrutado de peticiones hacia otros modelos o herramientas. El modelo base fue entrenado por el usuario Robokid1134 a partir de la arquitectura Qwen3 (mediante un adaptador LoRA, según los tags del repositorio), y la cuantización ha sido realizada por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face que publica versiones estáticas en múltiples niveles de compresión.

El problema que resuelve este modelo es la clasificación y el enrutado eficiente de peticiones en sistemas agénticos: en lugar de usar un modelo grande y costoso para decidir qué herramienta invocar o a qué modelo derivar cada consulta, se puede emplear este modelo diminuto, capaz de ejecutarse incluso en CPU, para generar salidas estructuradas en JSON. Su relevancia actual radica en la tendencia hacia arquitecturas de orquestación multi-modelo, donde un router ligero de menos de 1B de parámetros reduce drásticamente latencia y coste.

La licencia es Apache 2.0, lo que permite su uso comercial sin restricciones. El repositorio de cuantización ocupa 5,7 GB y ofrece versiones desde 0,4 GB (Q2_K) hasta 1,3 GB (f16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3), adaptador LoRA |
| Parametros totales | 596.049.920 (~0,6B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base está disponible en safetensors) |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura Qwen3 de 0,6B parámetros, un transformer decoder estándar de Alibaba, adaptado mediante LoRA (Low-Rank Adaptation) según los tags del repositorio original. El resultado, TinyToolRouter-0.6B, está especializado en tareas de tool calling, function calling y enrutado, con salida estructurada en JSON. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens empleados ni el uso de técnicas como RLHF o DPO en la información disponible.

La versión aquí documentada es una cuantización estática en GGUF realizada por mradermacher, que convierte los pesos a formatos de compresión de k-quants (de Q2_K a Q8_0, más IQ4_XS y f16). En el momento de publicación no hay disponibles cuantizaciones weighted/imatrix por parte del cuantizador, aunque el autor indica que pueden solicitarse mediante una Community Discussion.

## Capacidades

- Tool calling y function calling: el modelo está específicamente entrenado para decidir qué herramienta invocar ante una petición.
- Enrutado (routing): puede clasificar consultas y dirigirlas al modelo o componente adecuado en arquitecturas multi-modelo.
- Salida estructurada: generación de JSON estructurado para integración programática.
- Uso en agentes: diseñado como componente de pipelines agénticos, típicamente como capa previa de decisión.
- Conversación: etiquetado con la etiqueta "conversational" en Hugging Face.
- Ejecución en CPU: su tamaño reducido y el formato GGUF lo hacen viable en entornos sin GPU.
- Idioma: entrenado para inglés; no hay soporte declarado para castellano ni otros idiomas.

## Casos de uso

- Router de modelos en producción: clasificar cada consulta entrante y decidir si se deriva a un modelo pequeño, a uno grande o a un modelo de razonamiento, ahorrando coste de inferencia en cada petición.
- Selección de herramientas en agentes: ante una petición de usuario, el modelo genera en JSON la herramienta a invocar (búsqueda web, calculadora, consulta a base de datos), evitando cargar un LLM grande para esta decisión.
- Gate de function calling en aplicaciones locales: integración en apps de escritorio o móviles donde no hay GPU, gracias a que las cuantizaciones de 0,4-0,5 GB funcionan en CPU.
- Filtrado previo de intenciones en chatbots: detectar si una consulta requiere llamada a API, RAG o respuesta directa, reduciendo la carga del modelo principal.
- Orquestación de pipelines multi-agente: actuar como componente de decisión en frameworks como LangChain o LlamaIndex, eligiendo el siguiente paso del flujo.
- Prototipado rápido de sistemas agénticos: su licencia Apache 2.0 y su tamaño permiten experimentar sin coste de GPU ni restricciones comerciales.
- Clasificación de peticiones en serverless: desplegable en funciones con recursos limitados (por ejemplo, contenedores con menos de 1 GB de memoria usando Q4_K_S).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia: entre 0,4 GB (Q2_K) y 1,3 GB (f16) según la cuantización elegida; puede ejecutarse íntegramente en RAM de CPU.
- GPU recomendadas: no se necesita GPU; cualquier GPU moderna con más de 2 GB de VRAM lo ejecutaría con holgura, pero su caso de uso natural es CPU.
- Consumer hardware: cabe sobradamente en cualquier portátil o Raspberry Pi de gama alta; una CPU x86 o ARM moderna con 4 GB de RAM es suficiente incluso con la versión f16.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, o cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con transformers o vLLM.
- Latencia y throughput: no disponibles; dada su talla de ~0,6B parámetros, se espera inferencia muy rápida incluso en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Licencia | Formato |
|---|---|---|---|---|
| TinyToolRouter-0.6B (este) | 0,6B | Tool calling / routing / JSON | Apache 2.0 | GGUF, safetensors |
| Qwen3-0.6B (base) | 0,6B | Uso general, tool calling basico | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-0.5B-Instruct | 0,5B | Uso general | Qwen (uso comercial permitido con condiciones) | safetensors, GGUF |
| SmolLM2-360M-Instruct (HuggingFaceTB) | 0,36B | Uso general | Apache 2.0 | safetensors, GGUF |

TinyToolRouter-0.6B se diferencia de los modelos generales de tamaño similar en que está afinado específicamente para decisiones de enrutado y llamadas a herramientas, tarea en la que debería superar a los modelos base no especializados, aunque no hay benchmarks que lo confirmen.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado solo para inglés; su rendimiento en castellano no está garantizado y probablemente sea inferior.
- Riesgo de alucinación: al ser un modelo de 0,6B parámetros, es propenso a errores y no debe usarse para generación de contenido libre, solo para tareas de clasificación y enrutado.
- Falta de documentación: no hay model card detallada del entrenamiento (datos, tokens, evaluaciones), lo que dificulta evaluar su fiabilidad antes de producción.
- Contexto: la longitud de contexto no está publicada; para conversaciones largas o catálogos de herramientas extensos, verificar el límite real antes de desplegar.
- Cuantizaciones agresivas: Q2_K y Q3_K_S (0,4 GB) pueden degradar notablemente la calidad; se recomiendan Q4_K_M o superiores.
- Sin cuantizaciones imatrix: en el momento de publicación solo existen quants estáticos.
- Licencia: Apache 2.0 no impone restricciones comerciales relevantes, pero conviene revisar también la licencia del modelo base Qwen3.
- Proyecto comunitario: con 689 descargas y 1 like en el momento de la ficha, tiene adopción muy limitada y sin historial de uso en producción contrastado.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/TinyToolRouter-0.6B-GGUF
- Modelo base: https://huggingface.co/Robokid1134/TinyToolRouter-0.6B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#TinyToolRouter-0.6B-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
- Paper, demo y repositorio de codigo: no disponible
