# pragmaticcs/PentaCoder-9B-GGUF

## Resumen

PentaCoder-9B-GGUF es la distribucion en formato GGUF del modelo PentaCoder-9B, publicado por el usuario pragmaticcs en Hugging Face. Se trata de un modelo de lenguaje causal de 8.953.803.264 parametros (aproximadamente 8,8-9B) orientado a generacion de codigo, razonamiento agentico y tareas de ingenieria de software, construido sobre la arquitectura Qwen 3.5 9B mediante una fusion de cinco checkpoints especializados. La version GGUF esta pensada para inferencia con llama.cpp y herramientas compatibles, lo que facilita su despliegue en hardware de consumo.

El modelo parte de los pesos de Qwen/Qwen3.5-9B como base topologica y combina cinco donantes post-entrenados con perfiles complementarios: Qwopus3.5-Coder (correccion algoritmica y descomposicion arquitectonica), MiMo-V2.6-Distill (planificacion multi-turno en SWE-bench e integridad del protocolo de herramientas), Ornith-1.5 (disciplina de ejecucion en terminal y heuristicas anti-bucle), OxCoder (implementacion de bajo nivel y robustez en runtime) y Qwen3.8-Distill (razonamiento estructural abstracto y anclaje sintactico). La fusion se realiza mediante un metodo propietario denominado GeoDELLA (Geometric Drop-and-Rescale with Task-Covariance De-Biasing and Spectral Norm Anchoring).

La relevancia actual del modelo reside en su ventana de contexto nativa de 262.144 tokens (256k) combinada con un tamano de 9B que permite ejecucion en GPU de consumo, y en su enfoque explicito hacia entornos agenticos reales donde los modelos pequenos de codigo suelen degradarse por bucles de repeticion o sintaxis fragil. La licencia Apache 2.0 y la disponibilidad en GGUF lo hacen atractivo para integracion en pipelines de desarrollo y agentes de terminal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid Recurrent-Attention Causal LM (`qwen3_5_text`), 8 bloques de 3 capas Gated DeltaNet lineal + 1 capa de atencion softmax completa |
| Parametros totales | 8.953.803.264 (aprox. 8,8B-9B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256k) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (repo GGUF; el autor no detalla los niveles incluidos) |
| Idiomas soportados | en, zh (segun metadatos; la model card cita tambien ar como tag de arXiv, no como idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base en safetensors |
| Dimension oculta (d_model) | 4096 |
| Dimension intermedia (d_mlp) | 12288 (SwiGLU) |
| Capas del decodificador | 32 |
| Capas de atencion completa | 3, 7, 11, 15, 19, 23, 27, 31 |
| Atencion lineal | 16 Key Heads / 32 Value Heads (d_k = d_v = 128) |
| Atencion completa | 16 Query Heads / 4 KV Heads (GQA, d_h = 256) |
| RoPE | 1D Partial RoPE (theta = 1e7, factor = 0,25, 64 dimensiones) |
| Precision nativa | bfloat16 |
| Tamano del vocabulario | 248.320 (ampliado para tokens de fill-in-the-middle y herramientas) |
| Descargas | 989 |
| Likes | 1 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura hibrida recurrente-atencion sobre el backbone `qwen3_5_text`. De las 32 capas del decodificador, 24 son capas de atencion lineal Gated DeltaNet y 8 son capas de atencion softmax completa, dispuestas en un patron de 3:1 por bloque (8 bloques de 4 capas). Las capas de atencion completa se situan en las posiciones 3, 7, 11, 15, 19, 23, 27 y 31. La atencion lineal usa 16 cabezas de clave y 32 de valor con d_k = d_v = 128; la atencion completa usa 16 cabezas de consulta y 4 de clave-valor (GQA) con d_h = 256. El MLP es SwiGLU con dimension intermedia 12288 y la dimension oculta es 4096. El vocabulario se amplia a 248.320 entradas para acomodar tokens de fill-in-the-middle y de herramientas.

No se trata de un modelo entrenado desde cero: es una fusion de pesos de cinco checkpoints derivados de Qwen 3.5 9B, cada uno con un perfil de post-entrenamiento distinto (destilacion de Claude 3.5 Opus, trazas agenticas a gran escala, aprendizaje por refuerzo anti-bucle, especializacion en API/CLI y destilacion de cadenas de pensamiento). El metodo de fusion, GeoDELLA, combina Geometric Drop-and-Rescale, de-sesgo por covarianza de tareas y anclaje de norma espectral, con politicas de componentes estratificadas por capa (layer-stratified component policies). La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO adicionales sobre la fusion; esos datos deben considerarse no disponibles.

## Capacidades

- Generacion de texto y codigo en ingles y chino, con enfasis en correccion algoritmica y descomposicion arquitectonica.
- Razonamiento multi-paso y planificacion agentica orientada a tareas de ingenieria de software (el autor cita SWE-bench como dominio objetivo).
- Uso de herramientas y function calling, con lo que la model card denomina "integridad del protocolo de herramientas" y tokens de vocabulario dedicados.
- Ejecucion en terminal y recuperacion de errores: heuristicas anti-bucle entrenadas mediante refuerzo para evitar repeticiones catastroficas cuando fallan comandos de shell o comprobaciones del compilador.
- Implementacion de bajo nivel y robustez en runtime (API, CLI y codigo operativo).
- Razonamiento estructural abstracto y anclaje sintactico a partir de cadenas de pensamiento destiladas.
- Ventana de contexto de 256k tokens, adecuada para repositorios completos o sesiones agenticas largas.
- Capacidades multilingues limitadas a en y zh segun los metadatos; no se declara soporte de espanol.
- Modelo puramente de texto: no se declaran capacidades de vision ni audio.

## Casos de uso

- Agente de terminal para tareas de DevOps: el modelo puede interpretar la salida de comandos de shell, detectar fallos y reintentar con correcciones, gracias a las heuristicas anti-bucle y a la disciplina de ejecucion entrenada sobre Ornith-1.5.
- Resolucion de issues en repositorios: con 256k tokens de contexto puede cargar varios ficheros relevantes y trazas de error en una sola ventana, planificar el cambio y emitir un parche, un escenario alineado con el entrenamiento en trazas de SWE-bench.
- Asistente de codigo en IDE con tool calling: integrado via llama.cpp u otro runtime compatible, puede invocar funciones de busqueda, ejecucion de tests o lectura de ficheros dentro de un bucle agentico controlado por el cliente.
- Generacion de codigo de sistemas y utilidades CLI: el aporte de OxCoder cubre implementacion de bajo nivel, manejo de APIs y codigo operativo, adecuado para scripts de automatizacion y herramientas internas.
- Pipeline de revision de codigo automatizada: el modelo puede analizar diffs largos (hasta 256k tokens) y razonar sobre estructura y sintaxis antes de emitir comentarios, apoyandose en el anclaje sintactico de Qwen3.8-Distill.
- Prototipado rapido en entornos con GPU de consumo: al ser un 9B en GGUF, permite desplegar un asistente de codigo local sin depender de APIs externas, con la licencia Apache 2.0 facilitando uso comercial.
- Educacion y explicacion de codigo en ingles o chino: la combinacion de razonamiento abstracto y descomposicion algoritmica permite generar explicaciones paso a paso de fragmentos complejos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona SWE-bench como dominio de entrenamiento de uno de los donantes (MiMo-V2.6-Distill), pero no aporta puntuaciones numericas del modelo fusionado ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (9B parametros), una cuantizacion de 4 bits requeriria del orden de 5-6 GB de VRAM para pesos, mas overhead de contexto; en 8 bits, del orden de 9-10 GB; en bf16, unos 18 GB. Estas cifras son estimaciones genericas por tamano, no datos publicados por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) o RTX 3090 permitirian ejecutar cuantizaciones de 4-8 bits con contexto amplio; para contexto completo de 256k seria necesario considerar GPU de datacenter (A100 80 GB, H100) o tecnicas de offload.
- Cabe en GPU de consumo: previsiblemente si en cuantizaciones de 4-6 bits para contextos moderados; con contexto de 256k el coste de KV cache es significativo y puede exceder la VRAM de tarjetas de 24 GB.
- Opciones de despliegue: llama.cpp (formato nativo del repo), y por extension los runners compatibles con GGUF como Ollama o LM Studio; el modelo base en safetensors seria desplegable con transformers, vLLM o TGI, aunque la compatibilidad de vLLM con la arquitectura hibrida `qwen3_5_text` no esta confirmada en la informacion disponible.
- Latencia y throughput: no disponibles. La model card describe el modelo como "blisteringly fast" sin aportar cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PentaCoder-9B-GGUF | 8,95B | 262.144 | Apache 2.0 | GGUF | Fusion de 5 checkpoints de Qwen 3.5 9B; enfoque agentico y de codigo |
| Qwen/Qwen3.5-9B | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | safetensors | Modelo base del que derivan los pesos |
| Qwopus3.5-9B-Coder | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible | Donante centrado en correccion algoritmica (destilacion de Claude 3.5 Opus) |
| MiMo-V2.6-Distill-Qwen-9B | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible | Donante centrado en planificacion agentica y SWE-bench |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a linaje y enfoque.

## Limitaciones y advertencias

- Modelo puramente de texto: no soporta vision, audio ni modalidades adicionales.
- Idiomas declarados: solo en y zh. El rendimiento en castellano no esta garantizado ni documentado.
- Al ser una fusion de pesos sin datos publicados de evaluacion, el riesgo de alucinacion y de degradacion en dominios no cubiertos por los donantes no puede acotarse con benchmarks.
- La model card advierte implicitamente sobre el riesgo de bucles de repeticion en modelos de codigo pequenos; aunque el autor afirma haberlo mitigado con entrenamiento por refuerzo, no aporta metricas que lo verifiquen.
- El metodo de fusion GeoDELLA es propietario y no esta descrito en detalle suficiente en la informacion disponible para evaluar su reproducibilidad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen 3.5 9B y de otros checkpoints cuyas licencias no se detallan en la informacion proporcionada; conviene verificar la cadena de licencias antes de un despliegue comercial.
- El repositorio tiene un numero muy bajo de descargas (989) y likes (1), lo que implica escasa validacion por parte de la comunidad.
- La model card incluye promociones de modelos de pago y de un Patreon del autor; parte del contenido promocional no constituye documentacion tecnica verificable.
- La compatibilidad de la arquitectura hibrida con todos los runtimes (especialmente vLLM y TGI) no esta confirmada; el formato GGUF con llama.cpp es la via soportada de forma explicita.

## Enlaces

- Repositorio GGUF: https://huggingface.co/pragmaticcs/PentaCoder-9B-GGUF
- Modelo base: https://huggingface.co/pragmaticcs/PentaCoder-9B
- Qwen 3.5 9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Donante Qwopus3.5-Coder: https://huggingface.co/Jackrong/Qwopus3.5-9B-Coder
- Donante MiMo-V2.6-Distill: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Donante Ornith-1.5: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Donante OxCoder: https://huggingface.co/OrionLLM/OxCoder-9B
- Donante Qwen3.8-Distill: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Referencia arXiv citada en tags: https://arxiv.org/abs/2406.11617
- Referencia arXiv citada en tags: https://arxiv.org/abs/2403.19522
- Patreon del autor: https://patreon.com/pragmaticcs
