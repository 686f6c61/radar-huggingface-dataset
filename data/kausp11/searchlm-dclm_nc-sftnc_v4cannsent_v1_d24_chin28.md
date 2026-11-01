# Kausp11/searchlm-dclm_nc-sftnc_v4cannsent_v1_d24_chin28

## Resumen

Search-LLM (DCLM-Edu 1.4B, SFT) es un modelo de lenguaje de tipo generativo entrenado por el usuario de HuggingFace Kausp11, basado en la infraestructura nanochat y preentrenado con una metodología de "search-enabled pretraining", es decir, con datos que incorporan bloques de búsqueda web simulados. El modelo se ha sometido a un ajuste fino supervisado (SFT) sobre conversaciones con capacidades de llamada a herramientas y bloques de búsqueda, lo que lo orienta hacia tareas de generación de texto con acceso a información externa.

Su relevancia radica en la exploración de modelos pequeños (en torno a 2.600 millones de parámetros según los metadatos de safetensors, aunque la model card lo denomina "1.4B") que integran de forma nativa tokens especiales de búsqueda web (`<WEB_QUERY>`, `</WEB_QUERY>`, `<WEB_RESPONSE>`, `</WEB_RESPONSE>`), permitiendo flujos de trabajo de generación aumentada con recuperación de información. Utiliza el tokenizador de SmolLM2 ampliado con dichos tokens de búsqueda y emplea un formato de chat sencillo (`User: ...\n\nAssistant: ...`).

Se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y soporte de la librería transformers mediante `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (nanochat), no disponible mayor detalle |
| Parametros totales | 2.619.083.082 (dato real de safetensors) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos originales en el repo) |
| Idiomas soportados | no disponible (tokenizador base SmolLM2, orientado principalmente a ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 5,2 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de tipo decoder entrenado con el framework nanochat, un stack de preentrenamiento minimalista. La innovacion principal es el preentrenamiento con capacidad de busqueda habilitada ("search-enabled pretraining"): durante el entrenamiento se insertan bloques de consulta y respuesta web delimitados por tokens especiales (`<WEB_QUERY>`, `</WEB_QUERY>`, `<WEB_RESPONSE>`, `</WEB_RESPONSE>`), de modo que el modelo aprende a emitir consultas y consumir respuestas externas como parte del flujo de generacion. El tokenizador es el de SmolLM2 ampliado con esos tokens de busqueda.

El ajuste fino supervisado (version v4c-ann-sent, 1 epoca) combina tres fuentes de datos: SmolTalk (conversaciones y habilidades de chat), SmolTalk2 (llamada a herramientas / tool calling) y conversaciones de SmolTalk enriquecidas con bloques de busqueda procedentes del pipeline de anotacion del propio preentrenamiento, insertados al inicio de la frase. No hay informacion disponible sobre el numero de tokens de preentrenamiento, la composicion detallada del corpus ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en formato chat (`User: ...\n\nAssistant: ...`).
- Emision de consultas web estructuradas mediante tokens `<WEB_QUERY>` / `</WEB_QUERY>`, pensada para pipelines de generacion aumentada con recuperacion.
- Consumo de respuestas web inyectadas mediante `<WEB_RESPONSE>` / `</WEB_RESPONSE>`.
- Tool calling / function calling, adquirido mediante SFT sobre el dataset SmolTalk2.
- Seguimiento de instrucciones y habilidades de chat genericas (dataset SmolTalk).
- No hay informacion disponible sobre capacidades multimodales (vision, audio), razonamiento extendido (thinking mode) ni soporte de agentes multi-paso.

## Casos de uso

- Asistentes con acceso a busqueda web: el modelo puede generar consultas `<WEB_QUERY>` que un orquestador externo ejecuta contra un buscador o indice, inyectando el resultado como `<WEB_RESPONSE>` para continuar la generacion, reduciendo alucinaciones factuales.
- Sistemas de generacion aumentada por recuperacion (RAG): su preentrenamiento con bloques de busqueda lo hace adecuado para integrarse en pipelines RAG donde el contexto recuperado se formatea con los tokens especiales.
- Chatbots ligeros autoalojados: con unos 2.600 millones de parametros, es desplegable en hardware de consumo para conversacion basica con seguimiento de instrucciones.
- Prototipado de agentes con herramientas: el SFT sobre SmolTalk2 permite experimentar con flujos de llamada a funciones en frameworks de agentes de bajo coste.
- Investigacion en preentrenamiento con busqueda: util como base experimental para estudiar como el preentrenamiento con bloques web afecta al comportamiento posterior del modelo.
- Generacion de texto asistida por documentos: resumir o responder preguntas a partir de pasajes inyectados en el prompt mediante los tokens de respuesta web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 5,2-6 GB (tamano del repo de 5,2 GB en safetensors), mas overhead de KV cache.
- Con cuantizacion INT8/INT4 (no distribuida oficialmente en el repo), la huella podria reducirse a en torno a 3 GB y 1,5-2 GB respectivamente; no disponible confirmacion oficial.
- GPU recomendadas: cualquier GPU de consumo con 8 GB o mas de VRAM (RTX 3060, RTX 4060 Ti, RTX 4090) es suficiente para inferencia en precision completa; no se requieren aceleradores de centro de datos.
- Cabe comodamente en GPUs de consumo; tambien es viable su ejecucion en CPU con llama.cpp si se convierten los pesos a GGUF (conversion no disponible en el repo).
- Despliegue: transformers con `AutoModelForCausalLM.from_pretrained(repo, trust_remote_code=True)`; no consta soporte verificado para vLLM, TGI, llama.cpp u Ollama (el uso de `custom_code` puede complicar la compatibilidad).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Search-LLM DCLM-Edu (este) | ~2,6 B | no disponible | Apache 2.0 | Preentrenamiento con busqueda, tool calling, custom code |
| SmolLM2-1.7B-Instruct | 1,7 B | 8192 tokens | Apache 2.0 | Base del tokenizador, chat generalista sin tokens de busqueda |
| Qwen2.5-3B-Instruct | 3 B | 32768 tokens | Qwen Research (uso comercial restringido en algunos casos) | Chat generalista, tool calling, multilingue |
| Llama-3.2-3B-Instruct | 3 B | 128000 tokens | Llama 3.2 Community | Chat generalista, tool calling, multilingue |

El modelo se diferencia de sus alternativas en su entrenamiento explicito con bloques de busqueda web, una caracteristica poco comun en modelos abiertos de este tamano, aunque carece de la madurez, documentacion y benchmarks de los modelos comerciales de referencia.

## Limitaciones y advertencias

- Discrepancia de nomenclatura: la model card lo denomina "1.4B" pero los metadatos de safetensors indican 2.619 millones de parametros; conviene verificar el recuento real antes de planificar el despliegue.
- Requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar codigo personalizado del repositorio; revisar el codigo antes de usar en produccion.
- No hay benchmarks publicados ni evaluaciones de calidad, por lo que su rendimiento real frente a modelos equivalentes es desconocido.
- Riesgo de alucinacion no cuantificado; el diseno con tokens de busqueda pretende mitigarlo, pero depende de la calidad del sistema de recuperacion externo.
- Idiomas soportados no documentados; el tokenizador base (SmolLM2) sugiere un sesgo hacia el ingles, con rendimiento probablemente degradado en castellano.
- Longitud de contexto no especificada, lo que dificulta planificar ventanas de conversacion o RAG.
- Sin cuantizaciones oficiales ni soporte verificado en runtimes de inferencia optimizados (vLLM, llama.cpp, Ollama).
- Licencia Apache 2.0: sin restricciones de uso comercial, pero al ser un modelo experimental de un autor individual, no hay garantias de mantenimiento ni soporte.

## Enlaces

- HuggingFace: https://huggingface.co/Kausp11/searchlm-dclm_nc-sftnc_v4cannsent_v1_d24_chin28
- Paper, repositorio de entrenamiento y demos: no disponibles (la model card menciona el origen interno "RCP `search-lm/ckpts/dclm_nc/sftnc_v4cannsent_v1_d24_chin28`" sin enlace publico)
