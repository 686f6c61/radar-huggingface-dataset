# dnhkng/RYS-Qwen3.5-27B-FP8-M

## Resumen

RYS-Qwen3.5-27B-FP8-M es una cuantizacion en FP8 del modelo Qwen3.5-27B, publicada por el usuario dnhkng bajo licencia Apache 2.0. Se trata de un modelo multimodal de tipo image-text-to-text construido sobre la arquitectura Qwen3.5, que combina atencion lineal (Gated DeltaNet) con atencion clasica con compuertas (Gated Attention) en un diseno hibrido de 64 capas. El modelo base Qwen3.5-27B es un transformer causal con codificador de vision, desarrollado por el equipo Qwen de Alibaba, y esta disenado para tareas de razonamiento, codigo, agentes y comprension visual.

La relevancia de esta publicacion concreta reside en su formato: los pesos estan cuantizados en FP8 con granularidad fina y bloques de 128 elementos, lo que reduce el espacio en disco y los requisitos de memoria frente al modelo original manteniendo, segun el autor, metricas de rendimiento practicamente identicas. El repositorio ocupa 32 GB y contiene 28.920.229.552 parametros reales segun los safetensors, lo que confirma que se trata de una cuantizacion del modelo de 27B y no de una version reducida.

Con 262.144 tokens de contexto nativo, extensible hasta 1.010.000, y soporte declarado para 201 idiomas y dialectos, el modelo se posiciona como una opcion de tamano medio para despliegues que necesitan ventanas de contexto muy largas y capacidad multimodal sin recurrir a modelos de cientos de miles de millones de parametros. La licencia Apache 2.0 facilita su uso comercial, aunque conviene revisar las condiciones del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido con codificador de vision: Gated DeltaNet (atencion lineal) + Gated Attention, 64 capas |
| Parametros totales | 28.920.229.552 (28,9B segun safetensors); 27B nominales en la model card |
| Parametros activos | no disponible (no se especifica si es MoE; la model card no declara parametros activos para esta variante) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | FP8 con cuantizacion de grano fino y tamano de bloque 128 (esta version); el modelo base admite otros formatos |
| Idiomas soportados | 201 idiomas y dialectos (segun la model card del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8), compatible con transformers, vLLM, SGLang y KTransformers |

Otros datos tecnicos del modelo base: dimension oculta 5120, embedding de tokens 248320 (padded), layout oculto 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), Gated DeltaNet con 48 cabezas lineales para V y 16 para QK con dimension de cabeza 128, Gated Attention con 24 cabezas para Q y 4 para KV con dimension de cabeza 256, dimension de RoPE 64, FFN con dimension intermedia 17408, salida LM de 248320 (padded) y entrenamiento con MTP (multi-token prediction) multi-step.

## Arquitectura y entrenamiento

El modelo se basa en un transformer causal hibrido que intercala bloques de atencion lineal (Gated DeltaNet) con bloques de atencion clasica con compuertas (Gated Attention) en una proporcion de 3 a 1, repetida 16 veces a lo largo de 64 capas. Este diseno busca reducir el coste computacional de la atencion en contextos largos manteniendo la capacidad expresiva de la atencion completa. El modelo incorpora ademas un codificador de vision con fusion temprana de tokens multimodales, lo que permite un entrenamiento conjunto de texto e imagen con una eficiencia declarada cercana al 100% respecto al entrenamiento solo de texto.

El entrenamiento del modelo base Qwen3.5-27B incluye fases de preentrenamiento y postentrenamiento, con aprendizaje por refuerzo escalado en entornos de millones de agentes y distribuciones de tareas progresivamente complejas. La model card menciona MTP (multi-token prediction) entrenado con multiples pasos, una tecnica que puede acelerar la decodificacion especulativa. La cuantizacion FP8 de esta publicacion aplica bloques de 128 elementos, un esquema de grano fino que limita la perdida de precision respecto a los pesos originales.

No se dispone de informacion detallada sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni los metodos especificos de alineacion (RLHF/DPO) empleados en el modelo base, mas alla de la mencion generica al escalado del aprendizaje por refuerzo.

## Capacidades

- Generacion de texto y razonamiento en lenguaje natural, con soporte para cadenas de razonamiento complejas.
- Comprension de imagenes y texto combinados (pipeline image-text-to-text): el modelo acepta entradas visuales junto a instrucciones textuales.
- Generacion y comprension de codigo, con resultados destacados en benchmarks de conocimiento y programacion segun la model card del modelo base.
- Razonamiento matematico y resolucion de problemas de varios pasos.
- Soporte multilingue amplio: 201 idiomas y dialectos declarados.
- Capacidad de agente y razonamiento multi-paso, reforzada mediante aprendizaje por refuerzo en entornos multiagente.
- Entrenamiento con multi-token prediction (MTP), que puede habilitar decodificacion especulativa y acelerar la inferencia.
- Compatibilidad con tool calling y function calling heredada del modelo base Qwen3.5 (segun las capacidades declaradas para la familia Qwen3.5; no se detalla de forma especifica en esta model card).

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historiales muy largos gracias a sus 262.144 tokens de contexto nativo, lo que permite mantener el hilo de incidencias complejas sin resumir el historial.
- Analisis de documentos extensos con imagenes: al combinar entrada de texto e imagen, puede procesar informes, facturas o articulos cientificos con figuras y tablas, extrayendo informacion estructurada en una sola pasada.
- Generacion de codigo en produccion: su capacidad de razonamiento y su compatibilidad con vLLM y SGLang permiten integrarlo en pipelines de CI/CD para revision de codigo, generacion de tests o documentacion tecnica.
- Agentes autonomos multi-paso: el entrenamiento con RL en entornos multiagente y el soporte de contexto largo lo hacen adecuado para orquestar tareas que requieren planificacion, uso de herramientas y memoria de estado prolongada.
- Asistentes multilingues: con 201 idiomas declarados, puede desplegarse en plataformas de soporte global sin necesidad de modelos especificos por region, manteniendo coherencia cultural y linguistica.
- Procesamiento de imagenes medicas o tecnicas para triaje: la fusion temprana de vision y lenguaje permite describir hallazgos visuales y responder preguntas sobre ellos en un mismo flujo conversacional.
- Investigacion y prototipado en entornos con recursos limitados: la cuantizacion FP8 reduce el footprint de memoria frente al modelo de 27B en BF16, lo que facilita su despliegue en infraestructura de una o dos GPU de gama alta.

## Benchmarks y rendimiento

Los siguientes resultados corresponden al modelo base Qwen3.5-27B segun la tabla publicada en la model card. No se han publicado resultados especificos para la version cuantizada FP8 en la informacion disponible; el autor afirma que las metricas son practicamente identicas a las del original.

| Benchmark | GPT-5-mini 2025-08-07 | GPT-OSS-120B | Qwen3-235B-A22B | Qwen3.5-122B-A10B | Qwen3.5-27B | Qwen3.5-35B-A3B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 83,7 | 80,8 | 84,4 | 86,7 | 86,1 | 85,3 |
| MMLU-Redux | 93,7 | 91,0 | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto |

La tabla de benchmarks de la model card esta truncada en la informacion proporcionada; solo se dispone de las filas MMLU-Pro y el inicio de MMLU-Redux. No se han publicado en la informacion disponible resultados de HumanEval, GSM8K ni otros benchmarks para esta variante cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: aproximadamente 29 GB solo para los pesos, mas overhead de activaciones, cache KV y buffers; en la practica se recomienda un minimo de 32-40 GB de VRAM para contextos moderados.
- Para contexto completo de 262.144 tokens, la cache KV crece de forma significativa; se recomienda planificar al menos 48-80 GB de VRAM total o usar atencion lineal eficiente junto con tecnicas de offloading.
- GPU recomendadas: H100 80GB, A100 80GB, L40S 48GB o dos RTX 4090/5090 de 24 GB en configuracion multi-GPU. Una unica RTX 4090 de 24 GB no es suficiente para los pesos FP8 completos sin offloading a CPU.
- Cabe en GPU de consumo solo con offloading parcial o cuantizaciones adicionales (por ejemplo, a 4 bits), no en su formato FP8 nativo en una sola GPU de 24 GB.
- Opciones de despliegue: transformers, vLLM, SGLang y KTransformers, segun la model card. Para entornos de consumo, llama.cpp u Ollama requeririan una conversion adicional a GGUF, no incluida en este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RYS-Qwen3.5-27B-FP8-M | 28,9B (FP8) | 262.144 nativo, hasta 1.010.000 | Apache 2.0 | safetensors FP8 | Cuantizacion FP8 del Qwen3.5-27B; multimodal |
| Qwen3.5-27B (base) | 27B | 262.144 nativo, hasta 1.010.000 | Apache 2.0 | safetensors BF16 | Modelo original sin cuantizar; mayor huella de memoria |
| Qwen3.5-35B-A3B | 35B totales (MoE, 3B activos) | no disponible en el extracto | Apache 2.0 | safetensors | Variante MoE de la misma familia; MMLU-Pro 85,3 |
| Qwen3.5-122B-A10B | 122B totales (MoE, 10B activos) | no disponible en el extracto | Apache 2.0 | safetensors | Variante MoE de mayor escala; MMLU-Pro 86,7 |
| GPT-OSS-120B | 120B | no disponible | no disponible | no disponible | Referencia externa; MMLU-Pro 80,8 |

La comparativa se limita a los datos disponibles en la model card. No se dispone de informacion sobre otros modelos de 27B multimodales con contexto comparable para establecer una comparacion mas amplia.

## Limitaciones y advertencias

- La cuantizacion FP8 puede introducir degradaciones menores en tareas de alta precision numerica o de razonamiento muy sensible, aunque el autor afirma que el rendimiento es practicamente identico al original.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran escala, especialmente en tareas de conocimiento factual y citas de fuentes.
- Sesgos potenciales heredados de los datos de entrenamiento del modelo base; no se detalla la composicion del dataset ni los esfuerzos de mitigacion.
- El contexto maximo declarado de 1.010.000 tokens es una extension sobre los 262.144 nativos; el rendimiento en ventanas tan largas puede degradarse y no se han publicado benchmarks especificos.
- La licencia Apache 2.0 se aplica a esta publicacion, pero conviene verificar las condiciones del modelo base Qwen3.5-27B y de los pesos originales antes de un uso comercial.
- El repositorio tiene un numero muy bajo de descargas (16) y likes (4) en el momento de la consulta, lo que limita la validacion comunitaria del artefacto.
- No se incluyen pesos en GGUF ni cuantizaciones de menor precision en este repositorio; para despliegues en hardware de consumo se requiere conversion adicional.
- La model card esta parcialmente truncada en la informacion disponible, por lo que algunos datos de benchmarks y capacidades pueden faltar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dnhkng/RYS-Qwen3.5-27B-FP8-M
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Version FP8 oficial de referencia: https://huggingface.co/Qwen/Qwen3.5-27B-FP8
- Blog del autor sobre RYS-II: https://dnhkng.github.io/posts/rys-ii/
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia: https://huggingface.co/Qwen/Qwen3.5-27B-FP8/blob/main/LICENSE
