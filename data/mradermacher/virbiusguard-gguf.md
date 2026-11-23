# mradermacher/VirbiusGuard-GGUF

## Resumen

VirbiusGuard es un modelo de clasificacion de seguridad (guard model) disenado para detectar prompt injection, jailbreaks y contenido no seguro en aplicaciones basadas en LLM. El modelo original lo desarrolla el usuario i1see1you, y esta ficha corresponde a la version cuantizada en formato GGUF publicada por mradermacher, un conocido creador de cuantizaciones de la comunidad. Con 751.632.384 parametros (aproximadamente 0,75 mil millones), se situa en la categoria de modelos pequenos especializados, lo que lo hace apto para desplegarse como capa de defensa de baja latencia en pipelines de agentes y sistemas conversacionales.

La relevancia de este tipo de modelos radica en el auge de los sistemas agenticos: cuando un LLM tiene acceso a herramientas, correo o bases de datos, un prompt injection exitoso puede derivar en acciones no autorizadas. VirbiusGuard actua como clasificador intermedio que evalua entradas y salidas antes de que lleguen al modelo principal o al usuario. La model card lo etiqueta explicitamente con terminos como `llm-guard`, `agent-safety`, `guardrails`, `jailbreak-detection` y `prompt-injection`, y menciona `qwen3` entre sus tags, lo que sugiere una base derivada de la familia Qwen3.

Esta version GGUF facilita la ejecucion local con llama.cpp y derivados (Ollama, LM Studio), con cuantizaciones desde Q2_K (0,4 GB) hasta f16 (1,6 GB). La licencia Apache 2.0 permite uso comercial sin restricciones adicionales. No obstante, la informacion publicada sobre arquitectura, datos de entrenamiento y benchmarks es muy limitada: la model card del repositorio GGUF es fundamentalmente una plantilla de cuantizacion de mradermacher y no incluye detalles tecnicos del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags sugieren base Qwen3; detalles no publicados) |
| Parametros totales | 751.632.384 (dato de safetensors) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna en la informacion disponible. El tag `qwen3` sugiere que el modelo base deriva de la familia Qwen3, y el recuento de parametros (751 millones) es coherente con un transformer denso de escala sub-1000M. No obstante, no se confirma oficialmente ni el tipo de atencion, ni la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o fine-tuning supervisado especifico para clasificacion de seguridad.

Respecto al entrenamiento, la unica informacion disponible son las etiquetas de la model card, que indican una especializacion en tareas de seguridad: deteccion de prompt injection, jailbreak, moderacion de contenido y seguridad en entornos agenticos. Se desconoce el volumen de tokens de entrenamiento, la mezcla de datos (ataques sinteticos, datasets publicos de red teaming, trazas reales) y cualquier innovacion tecnica como decodificacion especulativa o atencion lineal. La cuantizacion GGUF la realiza mradermacher con cuantizaciones estaticas; segun la propia model card, no hay cuantizaciones ponderadas con imatrix disponibles en el momento de la publicacion.

## Capacidades

- Clasificacion de seguridad de entradas y salidas de LLM: deteccion de prompt injection, jailbreaks e intentos de manipulacion.
- Moderacion de contenido: identificacion de contenido no seguro o inapropiado segun las etiquetas `content-moderation` y `safety`.
- Guardrails para agentes: evaluacion de seguridad en flujos agenticos multi-paso (`agentic`, `agent-safety`).
- Integracion como capa intermedia en stacks de `llm-guard`, actuando como filtro previo o posterior al modelo principal.
- Soporte bilingue limitado a chino e ingles; no se declaran capacidades multilingues adicionales.
- No se documentan capacidades de tool calling, vision, audio ni modo de razonamiento extendido (thinking mode) en la informacion disponible.
- El pipeline no esta especificado en la ficha de Hugging Face, por lo que la interfaz exacta de salida (probabilidad, etiqueta binaria, categorias) no esta confirmada.

## Casos de uso

- Filtro de prompt injection en agentes: situar VirbiusGuard como clasificador previo a cada turno de entrada del usuario; si detecta inyeccion, se bloquea la peticion antes de que llegue al LLM principal con acceso a herramientas. Su tamano de 0,75B permite latencias de milisegundos en CPU o GPU modesta.
- Moderacion de contenido en aplicaciones de chat: clasificar las respuestas generadas antes de mostrarlas al usuario, con cuantizacion Q4_K_M (0,6 GB) desplegable en el mismo nodo que el modelo generativo.
- Defensa en pipelines RAG: evaluar los documentos recuperados y las consultas del usuario para detectar instrucciones maliciosas embebidas en el corpus, un vector habitual de ataques indirectos.
- Proteccion de sistemas de correo o mensajeria asistidos por IA: clasificar mensajes entrantes antes de que un agente los procese, evitando que instrucciones ocultas en el cuerpo del correo desencadenen acciones no autorizadas.
- Evaluacion de robustez en red teaming: usar el modelo como baseline automatico para medir la tasa de deteccion de un conjunto de ataques conocidos durante pruebas de seguridad de un sistema LLM.
- Despliegue en el borde (edge): con la cuantizacion Q2_K (0,4 GB) o Q4_K_S (0,6 GB), el modelo puede ejecutarse en portatiles o dispositivos con poca VRAM mediante llama.cpp u Ollama, ofreciendo guardrails locales sin dependencia de API externa.
- Capa de seguridad en entornos enterprise con requisitos de privacidad: al ser Apache 2.0 y ejecutable on-premise, permite clasificar datos sensibles sin enviarlos a servicios de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de precision, recall, F1 ni comparaciones con otros guard models, y el repositorio del modelo base no aporta datos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB con Q2_K, 0,6 GB con Q4_K_M, 0,9 GB con Q8_0 y 1,6 GB con f16. El modelo completo en precision original ocupa alrededor de 1,5 GB en safetensors.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 de 12 GB o superior permite ejecutar varias instancias en paralelo. En entornos de servidor, una A100 o H100 esta sobredimensionada para un modelo de este tamano y solo se justifica por agregacion de carga.
- Cabe holgadamente en GPU consumer: GTX 1650 (4 GB), RTX 3050, RTX 4060, e incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF. Para el modelo base en safetensors, transformers con PyTorch; vLLM y TGI son viables si el modelo base expone una interfaz de clasificacion estandar, aunque no se confirma en la informacion disponible.
- Latencia y throughput: no disponibles. Por el tamano (0,75B), se espera una latencia muy baja en GPU (orden de milisegundos por peticion) y throughput alto en CPU, pero no hay cifras publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| VirbiusGuard (esta ficha) | 751M | no disponible | zh, en | Apache 2.0 | Guard model especializado; cuantizaciones GGUF de 0,4 a 1,6 GB |
| Llama Guard 3 (8B) | 8B | 128k (segun documentacion publica de Meta) | multilingue | Licencia comunitaria Llama | Guard model de referencia de Meta; mayor tamano y contexto, requiere mas VRAM |
| ShieldGemma (2B y 9B) | 2B / 9B | 8k (segun documentacion publica de Google) | en (principalmente) | Licencia Gemma | Guard models de Google; el de 2B es el comparable mas cercano en escala |
| Qwen3Guard (si existe version publica) | no disponible | no disponible | no disponible | no disponible | Solo se menciona `qwen3` como tag; no se confirma un guard model oficial de Qwen con estos datos |

La comparativa se limita a referencias publicas generales; no se dispone de datos de rendimiento de VirbiusGuard que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Informacion tecnica muy escasa: no se documentan arquitectura exacta, contexto, datos de entrenamiento ni metricas, lo que dificulta evaluar su fiabilidad antes de produccion.
- Cobertura linguistica limitada a chino e ingles; el rendimiento en castellano no esta validado y probablemente sea deficiente.
- Riesgo de falsos negativos y falsos positivos inherente a cualquier clasificador de seguridad; sin benchmarks publicados no es posible estimar su tasa de deteccion real.
- Al ser un modelo derivado de Qwen3 segun los tags, puede heredar sesgos del modelo base; no se documentan evaluaciones de sesgo.
- Riesgo de alucinacion en la salida si el modelo se usa como generador en lugar de clasificador; su uso previsto es la clasificacion, no la generacion libre.
- La model card del repositorio GGUF es una plantilla generica de mradermacher y no sustituye a la documentacion del autor original; conviene revisar el repositorio base `i1see1you/VirbiusGuard` antes de adoptarlo.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que el modelo base no imponga restricciones adicionales no reflejadas en la informacion disponible.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar la precision de clasificacion; para tareas de seguridad se recomienda Q5_K_M o superior.
- No hay cuantizaciones ponderadas con imatrix disponibles segun la model card, lo que puede afectar la calidad relativa frente a otras alternativas cuantizadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/VirbiusGuard-GGUF
- Modelo base: https://huggingface.co/i1see1you/VirbiusGuard
- Pagina de resumen de cuantizaciones de mradermacher: https://hf.tst.eu/model#VirbiusGuard-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa de mradermacher: https://www.nethype.de/
