# bambocher/Qwen3.5-4B-heretic

## Resumen

bambocher/Qwen3.5-4B-heretic es una variante "decensored" (tambien llamada abliterated) del modelo multimodal Qwen3.5-4B desarrollado por Alibaba Qwen. La modificacion la realiza el usuario bambocher aplicando la herramienta Heretic v2.0.0, que elimina selectivamente la tendencia del modelo a rechazar peticiones mediante una tecnica de ablacion de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 2 a 21 de la red. El resultado es un modelo que, segun la model card, pasa de 99 rechazos sobre 100 prompts en el modelo original a 0 rechazos sobre 100 en esta version, con una divergencia KL de 0,0477 respecto al original.

El modelo base Qwen3.5-4B pertenece a la familia Qwen3.5, que integra un codificador de vision con entrenamiento multimodal de fusion temprana, una arquitectura hibrida que combina Gated Delta Networks (atencion lineal) con atencion con compuertas (Gated Attention) y una FFN, organizada en 32 capas con un patron de 8 bloques de 3 capas DeltaNet mas 1 capa de atencion. Cuenta con 4.539.265.536 parametros reales en safetensors, una dimension oculta de 2560, un vocabulario de 248.320 tokens y una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000.

La relevancia de esta ficha radica en que combina dos factores poco habituales: por un lado, un modelo multimodal de 4B con contexto extremadamente largo y licencia Apache 2.0; por otro, una modificacion de alineacion reproducible (el repositorio incluye un directorio `reproduce` con los parametros ARA exactos), lo que permite auditar y repetir el proceso de ablacion. El modelo esta pensado para investigadores que necesitan evaluar el comportamiento de modelos sin rechazos y para desarrolladores que quieren experimentar con un modelo multimodal pequeno y de contexto largo sin restricciones de filtrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido causal con codificador de vision; Gated DeltaNet (atencion lineal) + Gated Attention + FFN, 32 capas |
| Parametros totales | 4.539.265.536 (4B nominales) |
| Parametros activos | no disponible (no se indica configuracion MoE en este tamano) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible (la model card no detalla cuantizaciones publicadas; pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible en la ficha del modelo; el modelo base Qwen3.5 declara soporte de 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); compatible con vLLM, SGLang y KTransformers segun la model card del base |

Otros datos tecnicos del modelo base: dimension oculta 2560, token embedding 248.320 (con padding), 32 capas, layout 8 x (3 x (Gated DeltaNet -> FFN) -> 1 x (Gated Attention -> FFN)), DeltaNet con 32 cabezas lineales para V y 16 para QK con dimension de cabeza 128, Gated Attention con 16 cabezas Q y 4 KV con dimension de cabeza 256 y RoPE de 64 dimensiones, FFN con dimension intermedia 9216, salida LM atada al embedding, y MTP (multi-token prediction) entrenado con multiples pasos.

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer causal hibrido con un codificador de vision integrado mediante fusion temprana de tokens multimodales. La columna vertebral alterna capas de Gated DeltaNet (una forma de atencion lineal con estado recurrente) y capas de Gated Attention clasica, en un patron de 8 bloques que contienen 3 capas DeltaNet seguidas de 1 capa de atencion. Esta combinacion busca alto throughput de inferencia con baja latencia, manteniendo la capacidad de modelar dependencias largas. El modelo incluye MTP (multi-token prediction) entrenado con varios pasos, lo que puede habilitar decodificacion especulativa o generacion multi-token.

El entrenamiento del base Qwen3.5-4B consta de preentrenamiento y postentrenamiento, con entrenamiento multimodal de fusion temprana que, segun la model card, alcanza paridad con Qwen3 en razonamiento, codigo, agentes y comprension visual, y supera a los modelos Qwen3-VL. Se menciona escalado de RL en entornos con millones de agentes y distribuciones de tareas progresivamente complejas, aunque no se detalla el numero exacto de tokens de entrenamiento ni la composicion del dataset. La modificacion heretic aplica una ablacion de rangos arbitrarios (ARA) sobre las capas 2 a 21 con los parametros: `preserve_good_behavior_weight` 0,2499, `steer_bad_behavior_weight` 0,0001, `overcorrect_relative_weight` 0,9956 y `neighbor_count` 14. El proceso es reproducible segun el autor, que incluye un README en el directorio `reproduce`.

## Capacidades

- Generacion de texto y razonamiento multimodal: procesa imagen y texto de entrada y genera texto, con paridad declarada frente a Qwen3 en benchmarks de razonamiento.
- Comprension visual: pipeline `image-text-to-text`, con codificador de vision integrado y entrenamiento de fusion temprana.
- Razonamiento y matematicas: el modelo base declara resultados en categorias Knowledge & STEM (MMLU-Pro 74,8 en la tabla de la model card para Qwen3.5-4B).
- Generacion de codigo: incluido en las categorias evaluadas del modelo base (razonamiento, codigo, agentes).
- Soporte de agentes y entornos multi-paso: el modelo base se entreno con RL escalado en entornos multi-agente.
- Capacidades multilingues: el modelo base declara 201 idiomas y dialectos; la ficha de esta variante no detalla idiomas concretos.
- Modo "sin rechazos": la ablacion elimina la tendencia a rechazar peticiones (0/100 rechazos frente a 99/100 del original), lo que cambia el perfil de respuesta en prompts sensibles.
- Tool calling / function calling: no disponible de forma explicita en la informacion proporcionada; el modelo base se evalua en tareas de agentes, pero no se detalla el soporte concreto de tool calling.

## Casos de uso

- Investigacion sobre alineacion y rechazos: el modelo sirve para estudiar como la ablacion ARA afecta el comportamiento de rechazo y la divergencia KL (0,0477) respecto al original, con parametros reproducibles en el directorio `reproduce`.
- Evaluacion de robustez de filtros y moderacion: permite probar si los sistemas de moderacion externos detectan respuestas que un modelo decensored podria generar, comparando con el original que rechaza 99/100 prompts.
- Procesamiento de documentos largos multimodales: con 262.144 tokens de contexto nativo (extensible a 1.010.000), puede ingerir informes extensos con imagenes intercaladas y responder preguntas sobre ellos en una sola pasada.
- Analisis de imagenes tecnicas: al ser `image-text-to-text`, se usa para extraer texto y relaciones de capturas de pantalla, diagramas o graficos en flujos de documentacion tecnica.
- Generacion de codigo en pipelines internos: el modelo base declara capacidades de codigo y agentes; la variante puede integrarse en entornos de desarrollo controlados donde no se requiera filtrado de contenido.
- Experimentacion con decodificacion multi-token: el MTP del modelo base permite probar estrategias de decodificacion especulativa o generacion multi-token en un modelo de 4B.
- Despliegue en hardware modesto: con 4B parametros y pesos safetensors de 9,1 GB en el repo, es candidato para inferencia en GPU de consumo tras cuantizacion, aunque la model card no publica cuantizaciones oficiales.
- Traduccion y atencion multilingue: el base declara 201 idiomas, por lo que puede usarse para tareas de traduccion o atencion en varios idiomas, con la cautela de que esta variante no documenta idiomas concretos.

## Benchmarks y rendimiento

La model card de esta variante solo publica metricas del proceso de ablacion, no benchmarks de tareas estandar. Los datos disponibles son:

| Metrica | Este modelo | Modelo original (Qwen/Qwen3.5-4B) |
|---|---|---|
| Rechazos | 0/100 | 99/100 |
| Divergencia KL | 0,0477 | 0 (por definicion) |

Del modelo base Qwen3.5-4B, la model card incluye una tabla de benchmarks de lenguaje con comparativas frente a GPT-OSS-120B, GPT-OSS-20B, Qwen3-Next-80B-A3B-Thinking, Qwen3-30BA3B-Thinking-2507 y Qwen3.5-9B. El unico valor concreto extraido en la informacion disponible es MMLU-Pro = 74,8 para Qwen3.5-4B (frente a 80,8 de GPT-OSS-120B, 74,8 de GPT-OSS-20B, 82,7 de Qwen3-Next-80B-A3B-Thinking). El resto de la tabla no esta disponible en el texto proporcionado, por lo que no se reproducen cifras no verificadas.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos safetensors en bf16, el repo ocupa 9,1 GB, por lo que se necesita aproximadamente 10-11 GB de VRAM para cargar pesos en bf16, mas memoria para KV cache y activaciones. Con cuantizacion de 8 bits, el requisito baja a unos 5-6 GB; con 4 bits, a unos 3-4 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: no disponibles de forma explicita. Por tamano, una RTX 4090 (24 GB) o una A100/H100 pueden ejecutar el modelo en bf16 con holgura; una RTX 3090 (24 GB) tambien es viable.
- Cabe en GPU de consumo: si, en GPUs con 12 GB o mas en bf16, y en GPUs de 6-8 GB tras cuantizacion a 4-8 bits. La model card no confirma cuantizaciones publicadas para esta variante.
- Opciones de despliegue: la model card del base indica compatibilidad con Hugging Face Transformers, vLLM, SGLang y KTransformers. No se menciona soporte oficial de llama.cpp, Ollama o TGI para esta variante.
- Latencia y throughput: no disponibles. La arquitectura hibrida con Gated DeltaNet y MTP esta disenada para alto throughput y baja latencia, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| bambocher/Qwen3.5-4B-heretic | 4,53B | 262.144 (ext. 1.010.000) | Si (image-text-to-text) | Apache 2.0 | Variante decensored, 0/100 rechazos, KL 0,0477 |
| Qwen/Qwen3.5-4B (original) | 4B | 262.144 (ext. 1.010.000) | Si | Apache 2.0 | 99/100 rechazos; referencia de comportamiento alineado |
| Qwen3.5-9B | 9B (nominal) | no disponible | Si | no disponible | Modelo mayor de la misma familia, incluido en la tabla comparativa del base |
| GPT-OSS-20B | 20B (nominal) | no disponible | no disponible | no disponible | MMLU-Pro 74,8 en la tabla del base |

No se dispone de datos de benchmarks de tareas para esta variante que permitan una comparacion de rendimiento con alternativas; la unica comparacion publicada es la de rechazos y divergencia KL frente al modelo original.

## Limitaciones y advertencias

- La ablacion elimina los rechazos (0/100), lo que implica que el modelo puede generar contenido que el original filtraria; no debe desplegarse en produccion sin moderacion externa.
- La divergencia KL de 0,0477 respecto al original indica que el comportamiento general cambia, no solo la tendencia a rechazar; pueden aparecer degradaciones en tareas que dependian de la alineacion original.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad para esta variante; el proceso de ablacion no garantiza preservar la precision del base.
- Idiomas: la ficha de esta variante no documenta idiomas soportados; el base declara 201, pero el rendimiento multilingue tras la ablacion no esta verificado.
- Contexto: el contexto nativo es de 262.144 tokens, pero no se publican mediciones de rendimiento en ventanas largas para esta variante; la extension a 1.010.000 tokens requiere tecnicas adicionales no detalladas.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado sin filtrado puede acarrear responsabilidades legales y de cumplimiento para el despliegador.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado el 2026-11-05; no hay evidencia de validacion por terceros.
- No se publican cuantizaciones oficiales ni resultados de benchmarks de tareas estandar para esta variante, lo que limita la evaluacion previa a produccion.
- El proceso de ablacion es reproducible segun el autor, pero la reproducibilidad depende de la version exacta de Heretic (v2.0.0) y de los parametros ARA documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bambocher/Qwen3.5-4B-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Heretic (herramienta de ablacion): https://heretic-project.org
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Directorio de reproduccion: `reproduce/README.md` dentro del repositorio del modelo en HuggingFace
