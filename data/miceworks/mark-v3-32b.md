# miceworks/Mark-V3-32B

## Resumen

Mark-V3-32B es un modelo de lenguaje de tipo mixture-of-experts (MoE) publicado por miceworks en HuggingFace bajo licencia Apache 2.0. Se presenta como el modelo insignia de la familia Mark-V3 y esta construido sobre una arquitectura nativa DeepSeek2 con Multi-Head Latent Attention (MLA), 32 capas de decodificador y una ventana de contexto declarada de 1.048.576 tokens (1M). Físicamente cuenta con 31.989.009.408 parametros totales, de los cuales solo 3.677.387.904 se activan por token, lo que lo situa en la categoria de modelos MoE de activacion dispersa.

El modelo distribuye sus 64 expertos enrutados en cuatro "clanes" de 16 expertos con especializacion declarada: razonamiento general y chat multi-turno, ejecucion de agentes y function calling, ingestion de documentos largos y generacion de parches, y derivacion matematica y codigo poliglota. Incorpora ademas 2 expertos compartidos por capa y un motor de atencion hibrida 3:1 (ventana deslizante de 8192 tokens en capas estandar y atencion global cada cuarta capa) para sostener el contexto largo.

Es relevante por su combinacion de contexto de 1M tokens, activacion de solo 3,68B parametros por token y soporte nativo de etiquetas para modo thinking, tool calling y ficheros, orientado a cargas de trabajo de agentes y analisis de repositorios extensos. No obstante, la model card no aporta resultados de benchmarks ni detalles sobre el corpus de entrenamiento, y la busqueda web no devolvio informacion tecnica adicional sobre el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE nativo DeepSeek2 con Multi-Head Latent Attention (H-MLA) |
| Parametros totales | 31.989.009.408 (31,99B) |
| Parametros activos | 3.677.387.904 (3,68B) por token |
| Longitud de contexto | 1.048.576 tokens (1M), con YaRN factor 256,0 y RoPE theta 10.000.000,0 |
| Tipos de cuantizacion | GGUF IQ4_NL (fichero `mark_v3_32b_iq4_nl.gguf`); bfloat16 en transformers; otras no disponibles |
| Idiomas soportados | en, pt, es, fr, de, it, ja, ko, zh, ru, ar, hi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (via `AutoModelForCausalLM`), GGUF |

Otros datos declarados: dimension oculta 3072, 32 capas de decodificador, 32 cabezas de atencion con dimension de cabeza 96, Q-LoRA rank 1536, KV-LoRA rank 512, 64 expertos enrutados con 4 activos por token (tamano intermedio MoE 1600, divisible por 32), 2 expertos compartidos por capa y vocabulario de 32.032 tokens.

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE de tipo DeepSeek2 con Multi-Head Latent Attention, que comprime las proyecciones de query y clave/valor mediante descomposiciones de bajo rango (Q-LoRA rank 1536 y KV-LoRA rank 512) para reducir el coste de memoria del cache KV en contextos largos. El enrutamiento usa 64 expertos con 4 activos por token, organizados en 4 clanes de 16 expertos con soft-pinning (top-3 dentro del clan y top-1 global), mas 2 expertos compartidos por capa. El contexto de 1M tokens se sostiene con atencion hibrida 3:1: ventana deslizante de 8192 tokens en las capas estandar y atencion global cada cuarta capa, complementada con escalado de temperatura de query a escala logaritmica y YaRN con factor 256.

La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones de decodificacion especulativa ni detalles del pipeline de datos. La informacion disponible sobre entrenamiento se limita a los hiperparametros arquitectonicos y al tokenizador con soporte nativo de las etiquetas `<think>`, `<tool_call>` y `<file>`.

## Capacidades

- Generacion de texto conversacional multi-turno con modo de razonamiento explicito mediante la etiqueta `<think>`.
- Razonamiento general, seguimiento de instrucciones y chat (Clan 0 de expertos).
- Ejecucion autonoma de agentes, function calling y salida estructurada de herramientas (Clan 1).
- Ingestion de documentos ultra-largos multi-fichero, sintesis documental y generacion de parches (Clan 2).
- Derivacion matematica profunda, analisis algoritmico y codigo poliglota (Clan 3).
- Soporte nativo de tool calling mediante `<tool_call>` y de referencias a ficheros mediante `<file>`.
- Capacidades multilingues declaradas en 12 idiomas: ingles, portugues, espanol, frances, aleman, italiano, japones, coreano, chino, ruso, arabe e hindi.
- Contexto de hasta 1M tokens para tareas de recuperacion y sintesis sobre corpus extensos.
- No se declaran capacidades de vision, audio ni otras modalidades.

## Casos de uso

- Analisis de repositorios completos: con 1M tokens de contexto y el Clan 2 especializado en ingestion multi-fichero, el modelo puede recibir un arbol de codigo extenso y generar parches o resumenes de cambios coherentes entre ficheros.
- Agentes autonomos con herramientas: el Clan 1 y las etiquetas `<tool_call>` permiten construir bucles de razonamiento multi-paso que invocan APIs externas y devuelven salidas estructuradas, adecuado para orquestacion de tareas.
- Asistencia a la programacion en produccion: la activacion de solo 3,68B parametros por token reduce el coste por inferencia frente a un modelo denso de 32B, lo que facilita su integracion en pipelines de revision de codigo y generacion de tests.
- Razonamiento matematico y derivacion algoritmica: el Clan 3 esta orientado a demostraciones y analisis de complejidad, util en entornos educativos o de investigacion que requieran trazas de razonamiento en `<think>`.
- Atencion al cliente multilingue: los 12 idiomas declarados y el modo conversacional permiten desplegar un asistente multi-turno con contexto largo para historiales de cliente extensos.
- Procesamiento de documentacion legal o tecnica: la ventana de 1M tokens permite cargar contratos o manuales completos y realizar preguntas con trazabilidad sobre el texto original.
- Generacion de codigo poliglota: el soporte declarado de multiples lenguajes de programacion en el Clan 3 lo hace apto para migraciones entre lenguajes y traduccion de fragmentos de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de miceworks no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparativas, y la busqueda web no devolvio datos de evaluacion del modelo.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 64 GB solo para pesos (31,99B parametros a 2 bytes), mas cache KV; requiere multiples GPU o una GPU de 80 GB con margen ajustado.
- VRAM estimada en GGUF IQ4_NL: en torno a 18-20 GB para pesos, lo que permite ejecucion en GPUs consumer de 24 GB como la RTX 4090.
- GPU recomendadas: A100 80 GB o H100 para bfloat16 y contexto largo; RTX 4090 (24 GB) viable con cuantizacion IQ4_NL.
- Despliegue: transformers con `trust_remote_code=True`, llama.cpp y Ollama (fichero GGUF `mark_v3_32b_iq4_nl.gguf`), LM Studio. No se documenta soporte explicito de vLLM ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. El contexto de 1M tokens exige planificacion cuidadosa de memoria del cache KV, atenuada parcialmente por la compresion MLA.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoria (MoE de ~32B con activacion dispersa y contexto largo).

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real en tareas de razonamiento, codigo o matematicas no esta verificado de forma independiente.
- La model card no documenta el corpus de entrenamiento ni procesos de alineacion (RLHF/DPO), lo que impide evaluar sesgos conocidos o calidad de alineacion.
- Riesgo de alucinacion inherente a los modelos generativos; no se aportan evaluaciones de fidelidad ni de tasa de hallucinacion.
- El contexto declarado de 1M tokens depende de YaRN con factor 256; el rendimiento efectivo en ventanas muy largas no esta validado en la informacion disponible.
- El soporte multilingue se declara para 12 idiomas, pero no se aportan metricas por idioma; la calidad relativa entre ellos es desconocida.
- Licencia Apache 2.0: permite uso comercial, pero el modelo requiere `trust_remote_code=True`, lo que implica ejecutar codigo remoto del autor y anade superficie de riesgo en produccion.
- La especializacion por clanes de expertos es una descripcion del autor; no hay evidencia publica de que el enrutamiento respete esa particion en la practica.
- El modelo se publico con 0 descargas y 0 likes en el momento de la consulta, sin ecosistema de validacion externo.

## Enlaces

- HuggingFace: https://huggingface.co/miceworks/Mark-V3-32B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web.
