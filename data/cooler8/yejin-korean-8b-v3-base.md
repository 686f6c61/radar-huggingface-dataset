# cooler8/yejin-korean-8b-v3-base

## Resumen

Yejin Korean 8B v3 Base es un modelo de lenguaje de tipo foundation, preentrenado desde cero por el desarrollador independiente cooler8, con el objetivo de cubrir el hueco de modelos base bilingües coreano-inglés de tamano medio (7-8B) con licencia permisiva. A diferencia de la mayoria de alternativas de su rango, que son ajustes finos (fine-tunes) de pesos ya existentes, este modelo declara un entrenamiento completo desde inicializacion aleatoria, lo que lo hace mas atractivo como base para investigacion en adaptacion y ajuste fino posterior.

Arquitectonicamente sigue la familia Qwen3: transformer decoder causal con QK-Norm, Grouped Query Attention (GQA) con ratio 4:1 y activacion SwiGLU. Cuenta con 32 capas, hidden size de 4096, 32 cabezas de consulta y 8 de clave-valor, dimension de cabeza 128, tamano intermedio 14.336 y un vocabulario BPE de 64.000 tokens optimizado para coreano e ingles. La longitud de contexto nativa es de 4.096 tokens, un valor notablemente corto para los estandares de 2025-2026, aunque el uso de RoPE con theta 500.000 deja abierta la posibilidad de extension por interpolacion.

El modelo se distribuye como base preentrenada sin alineamiento por instrucciones: no incorpora SFT, RLHF ni DPO, y el propio autor anuncia versiones alineadas futuras. Esto lo posiciona como material para laboratorio y para pipelines propios de ajuste, no como asistente listo para produccion conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal con QK-Norm, GQA y SwiGLU (familia Qwen3) |
| Parametros totales | 7.241.740.288 segun safetensors; la model card declara ~7,52B con embeddings atados (discrepancia no aclarada por el autor) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No se publican repositorios GGUF ni AWQ/GPTQ oficiales; al ser un modelo denso y estandar, admite cuantizacion a 8 y 4 bits mediante herramientas genericas |
| Idiomas soportados | Coreano (ko) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, precision BF16 |
| Hidden size | 4.096 |
| Capas | 32 |
| Cabezas de atencion | 32 de consulta / 8 de clave-valor (GQA 4:1) |
| Dimension de cabeza | 128 |
| Tamano intermedio | 14.336 |
| RoPE base (theta) | 500.000 |
| Vocabulario | 64.000 tokens (BPE optimizado ko-en) |
| Hardware de entrenamiento declarado | 8 x NVIDIA H200 con PyTorch FSDP |
| Tamano del repositorio | 14,5 GB |

## Arquitectura y entrenamiento

El modelo emplea un transformer decoder causal de 32 capas con normalizacion QK-Norm aplicada a consultas y claves, lo que estabiliza el entrenamiento a precision BF16 y evita la divergencia de los logits de atencion. La atencion usa Grouped Query Attention con 32 cabezas de consulta y solo 8 de clave-valor (ratio 4:1), lo que reduce el tamano de la cache KV en un factor de cuatro respecto a atencion multi-cabeza completa: aproximadamente 131 KB por token en BF16, es decir unos 512 MB para una secuencia completa de 4.096 tokens. La capa feed-forward usa SwiGLU con tamano intermedio de 14.336. El tokenizador es un BPE de 64.000 entradas optimizado simultaneamente para coreano e ingles, con embeddings de entrada y salida atados.

El preentrenamiento se realizo desde cero con PyTorch FSDP sobre un cluster de 8 GPU NVIDIA H200. El corpus declarado es bilingue y curado, compuesto por web coreana, enciclopedias, textos academicos, noticias y datos conversacionales, junto con corpora educativos y tecnicos en ingles. No se especifican ni el numero total de tokens de entrenamiento, ni la composicion porcentual del dataset, ni la receta de learning rate o el esquema de precision mixta mas alla del BF16. Tampoco se documentan fases de RLHF, DPO u otro alineamiento: se trata de una base pura de modelado de lenguaje autorregresivo.

## Capacidades

- Generacion de texto autorregresiva en coreano e ingles, con especial atencion al primero gracias al vocabulario BPE especificamente optimizado.
- Modelado de lenguaje base: continuacion de texto, reescritura, resumen extractivo y generacion de documentos a partir de un prefijo.
- Capacidad de razonamiento y matematicas derivada del preentrenamiento, sin garantia de formato de respuesta ni de cadena de pensamiento explicita al no existir alineamiento.
- Generacion de codigo limitada: el corpus incluye material tecnico en ingles, pero no se declara un subconjunto de codigo relevante ni benchmarks que lo respalden.
- Multilingue parcial: solo coreano e ingles declarados; no hay soporte documentado para espanol ni otras lenguas.
- Tool calling / function calling: no soportado de forma nativa (requiere SFT especifico).
- Comportamiento de agente y razonamiento multi-paso: no soportado sin ajuste fino posterior.
- Capacidades especiales (vision, audio, modo thinking explicito, decodificacion especulativa): no disponibles.

## Casos de uso

- Ajuste fino supervisado (SFT) como punto de partida para asistentes conversacionales en coreano: al ser una base limpia y con licencia Apache 2.0, permite construir un modelo de chat propio sin arrastrar las limitaciones de licencia de pesos derivados de terceros, aplicando despues DPO o preferencias propias.
- Investigacion en tokenizacion coreana: el vocabulario de 64.000 tokens optimizado para ko-en permite estudiar la eficiencia de compresion de texto coreano (tokens por palabra) frente a tokenizadores genericos tipo cl100k, midiendo el impacto en el coste de inferencia.
- Continuacion de preentrenamiento en dominio especifico (DAPT): partiendo de los pesos base, se puede continuar el entrenamiento con corpus juridico, medico o industrial coreano usando FSDP o DeepSpeed, aprovechando que no hay sesgos de alineamiento que interfieran con la fase de dominio.
- Generacion de texto coreano en lote para enriquecimiento de datos: produccion de variaciones, parafrasis y texto sintetico de dominio para alimentar otros sistemas de NLP coreano (clasificadores, sistemas de recuperacion), ejecutando inferencia con vLLM en lotes grandes.
- Traduccion asistida ko-en como tarea emergente: sin haber sido entrenado explicitamente para traduccion, el corpus bilingue permite evaluar su comportamiento zero-shot en traduccion y usarlo como base para fine-tuning supervisado con pares paralelos.
- Modulo de lenguaje en pipelines de investigacion academica: su tamano (7,24B) y licencia permisiva lo hacen adecuado como linea base controlada en estudios comparativos de arquitecturas Qwen3 frente a Llama o Mistral en lenguas de bajos recursos.
- Analisis de sentimiento y clasificacion de texto coreano mediante cabecera de clasificacion sobre las representaciones del modelo, con contexto de hasta 4.096 tokens por documento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, KLUE ni de tareas coreanas como KoBEST o HAE-RAE, y tampoco se documentan resultados de perplejidad sobre corpus de validacion. No hay por tanto datos verificables de rendimiento frente a otras alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16 los pesos ocupan aproximadamente 14,5 GB (7,24B parametros x 2 bytes), a los que hay que sumar la cache KV (unos 512 MB para 4.096 tokens) y overhead de activaciones, dejando el consumo total en torno a 15,5-17 GB. En cuantizacion INT8 el peso baja a unos 7,3 GB y en INT4 a aproximadamente 4-4,5 GB.
- GPU recomendadas para BF16: NVIDIA A100 40/80 GB, H100, L40S 48 GB, RTX 4090 24 GB o RTX 3090 24 GB.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, RTX 4090) con BF16 y contexto completo. En GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) es necesario recurrir a cuantizacion de 8 o 4 bits. En 12 GB o menos solo con cuantizacion agresiva de 4 bits y contexto reducido.
- Opciones de despliegue: transformers (ruta oficial documentada en la model card), vLLM y TGI para servido con batching continuo, llama.cpp u Ollama previa conversion a GGUF del modelo (no se distribuye GGUF oficial). Al ser una arquitectura compatible con Qwen3, las herramientas que soportan dicha arquitectura deberian poder cargarlo.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de tokens por segundo, TTFT ni resultados de batching en ninguna configuracion de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto nativo | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Yejin Korean 8B v3 Base | 7,24B (safetensors) / ~7,52B declarados | 4.096 tokens | Apache 2.0 | ko, en | Pesos safetensors en HuggingFace; 202 descargas, 0 likes |
| Qwen3-8B | ~8B | 32.768 tokens (ampliable con YaRN) | Apache 2.0 | multilingue amplio | Pesos oficiales, cuantizaciones GGUF/AWQ/GPTQ, gran ecosistema |
| Llama 3.1 8B | ~8B | 128.000 tokens | Llama 3.1 Community License (no OSI) | multilingue | Pesos oficiales, ecosistema amplio |
| Mistral 7B v0.3 | ~7,2B | 32.768 tokens | Apache 2.0 | principalmente en, con multilingue parcial | Pesos oficiales y cuantizaciones |

La diferencia principal no esta en el tamano, practicamente identico entre las cuatro opciones, sino en la ventana de contexto: 4.096 tokens frente a los 32.000-128.000 de las alternativas, lo que limita tareas de documentos largos y conversaciones extensas. A cambio, Yejin declara un entrenamiento especifico en coreano que las alternativas solo cubren de forma parcial y no oficial. Nota: los datos de contexto, licencia y parametros de los modelos comparados corresponden a su documentacion publica; no se dispone de comparaciones de rendimiento ejecutadas con esta misma base.

## Limitaciones y advertencias

- Ausencia total de alineamiento: es un modelo base, por lo que respondera continuando texto en lugar de seguir instrucciones. Cualquier uso conversacional requiere SFT previo.
- Riesgo elevado de alucinacion y de reproduccion de contenido sesgado o toxico, especialmente en generacion libre, sin filtros ni politicas de seguridad incorporadas.
- Contexto limitado a 4.096 tokens: insuficiente para analisis de documentos largos, RAG con muchos fragmentos o dialogos multi-turno extensos. La extension por YaRN o interpolacion de RoPE no esta documentada ni validada por el autor.
- Cobertura idiomatica restringida a coreano e ingles; el rendimiento en espanol u otras lenguas no esta evaluado y previsiblemente sera pobre, con un tokenizador no optimizado para ellas.
- Sin benchmarks publicados: no hay evidencia verificable de calidad frente a modelos establecidos, lo que dificulta justificar su eleccion en un entorno profesional.
- Historial de adopcion muy bajo: 202 descargas y 0 likes en el momento de la ficha, con un solo contribuidor en el repositorio, lo que implica ausencia de validacion por parte de la comunidad y soporte limitado.
- Discrepancia en el recuento de parametros: la model card indica ~7,52B con embeddings atados mientras que los ficheros safetensors suman 7.241.740.288 parametros. Conviene verificar la configuracion antes de dimensionar infraestructura.
- Aunque la licencia Apache 2.0 permite uso comercial sin restricciones de atribucion mas alla de las habituales, el modelo no incluye clausulas de indemnizacion ni garantias, y los datos de preentrenamiento no se documentan con suficiente detalle como para auditar su procedencia, lo que puede suponer riesgo legal en despliegues comerciales que requieran trazabilidad de datos.
- No se publican cuantizaciones oficiales, por lo que cualquier GGUF, AWQ o GPTQ existente seria una conversion de terceros sin validacion de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cooler8/yejin-korean-8b-v3-base
- Version 3B v1 base del mismo autor: https://huggingface.co/cooler8/yejin-korean-3b-v1-base
- Arbol de ficheros de la version 3B: https://huggingface.co/cooler8/yejin-korean-3b-v1-base/tree/main
- Ficha de la variante Yejin Korean 3B V2 SFT en LLM Explorer: https://llm-explorer.com/model/cooler8%2Fyejin-korean-3b-v2-sft,13zVMOISDzofnNt3CquKVM
- Paper o informe tecnico del modelo: no disponible
- Repositorio de codigo del autor: no disponible
- Demo interactiva: no disponible

Nota: los resultados de busqueda sobre jina.ai y el repositorio ClawLabsAI/free-ai-models no guardan relacion con este modelo y se han omitido por no ser relevantes.
