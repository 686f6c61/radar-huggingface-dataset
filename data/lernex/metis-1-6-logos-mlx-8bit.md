# Lernex/Metis-1.6-Logos-MLX-8bit

## Resumen

Metis-1.6-Logos-MLX-8bit es una cuantizacion en 8 bits para Apple Silicon (formato MLX) del modelo Metis-1.6-Logos, desarrollado por Lernex. Se trata de un modelo de lenguaje de 10.224 millones de parametros con arquitectura de mezcla de expertos latente (192 expertos, top-4) que incorpora componentes Mamba-2, orientado a generacion de texto, razonamiento y conversacion. Esta version concreta resuelve el problema de ejecutar el modelo en Macs con memoria limitada manteniendo una fidelidad numerica muy cercana a los pesos BF16 originales.

El modelo base emplea un contexto de 128.000 tokens y un modo de razonamiento explicito delimitado por marcas `<think>`, que puede activarse o desactivarse por peticion. La cuantizacion a 8 bits reduce el peso del repositorio a 11,1 GB (8,69 bits por peso), lo que permite su ejecucion en equipos con 24 GB de memoria unificada o mas, un umbral alcanzable por muchos MacBook Pro y Mac Studio actuales.

La relevancia de esta ficha radica en que combina tres elementos poco habituales en el ecosistema abierto: una arquitectura hibrida MoE con Mamba-2, un contexto de 128k tokens y un proceso de cuantizacion selectiva que preserva en precision completa las partes sensibles de la arquitectura (proyecciones de salida de Mamba-2, routers de expertos, adaptadores de atencion, memoria de profundidad y cabeza de profundidad). La licencia Apache 2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos latente (192 expertos, top-4) con componentes Mamba-2; implementacion MLX en `metis16.py` |
| Parametros totales | 10.224.235.713 (10,2B) |
| Parametros activos | no disponible (top-4 de 192 expertos, sin cifra oficial de parametros activos) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | 8 bits (esta version); existen variantes MLX 4-bit, GGUF y FP8 del mismo modelo base |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (8,69 bits por peso; repositorio de 11,1 GB) |

## Arquitectura y entrenamiento

El modelo base Metis-1.6-Logos emplea una arquitectura de mezcla de expertos latente con 192 expertos y enrutamiento top-4, combinada con capas Mamba-2 (modelo de espacio de estados). La implementacion MLX incluida en el repositorio (`metis16.py`) contiene la totalidad del modelo en un unico archivo y sustituye a la implementacion nativa de mlx-lm hasta que esta incorpore Metis-1.6. La arquitectura incluye componentes especificos como routers de expertos con sesgo de balance, adaptadores de atencion por paso, memoria de profundidad y una cabeza de profundidad.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card unicamente documenta el proceso de cuantizacion: todas las capas lineales se cuantizan a 8 bits en grupos de 64, excepto las proyecciones de salida de Mamba-2, los routers de expertos, los adaptadores de atencion por paso, la memoria de profundidad y la cabeza de profundidad, que se mantienen sin cuantizar; ademas, el sesgo de balance de los routers y los parametros SSM `A`, `D` y `dt_bias` se conservan en FP32. La receta de cuantizacion se define en `Model.quant_predicate` dentro de `metis16.py`.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat propia.
- Razonamiento explicito en modo thinking: el modelo razona dentro de `<think>` antes de responder; puede desactivarse con `enable_thinking=False` para obtener respuestas directas.
- Razonamiento matematico y resolucion de problemas (la model card ejemplifica con calculos aritmeticos).
- Soporte de tool calling / function calling: las llamadas a herramientas llegan como texto en la respuesta hasta que mlx-lm incorpore el parser especifico del modelo, momento a partir del cual se entregaran como `tool_calls` tipados.
- Capacidades de agente y razonamiento multi-paso, derivadas del modo thinking y del soporte de herramientas.
- Contexto largo de 128.000 tokens para conversaciones y documentos extensos.
- Capacidades multilingues: no documentadas en la informacion disponible.

## Casos de uso

- Asistente conversacional local en Mac: con 11,1 GB de pesos y un umbral de 24 GB de memoria unificada, el modelo puede ejecutarse integramente en un MacBook Pro o Mac Studio mediante `mlx_lm.chat`, sin conexion a servicios externos y con contexto de 128k tokens para conversaciones largas.
- Razonamiento asistido en el escritorio: el modo thinking permite abordar problemas aritmeticos, logicos o de planificacion paso a paso; para respuestas rapidas se usa temperatura 0.3 y thinking desactivado.
- Servidor OpenAI-compatible local: `mlx_lm.server` expone un endpoint compatible con la API de OpenAI, lo que permite integrar el modelo en herramientas existentes que ya consumen dicha interfaz y controlar `enable_thinking` por peticion mediante `chat_template_kwargs`.
- Automatizacion con herramientas: el soporte de tool calling permite construir flujos donde el modelo invoca funciones externas (consultas a APIs, operaciones sobre ficheros) dentro de un pipeline de agentes, con la salvedad de que en versiones actuales de mlx-lm las llamadas llegan como texto.
- Procesamiento de documentos extensos: el contexto de 128k tokens admite resumir, extraer informacion o responder preguntas sobre documentos largos en una sola pasada, sin troceado previo.
- Desarrollo y prototipado en Apple Silicon: la implementacion MLX y el formato de pesos optimizado permiten experimentar con un MoE de 10,2B en hardware de consumo Apple, comparando el comportamiento 8-bit frente a 4-bit o BF16 con las metricas de divergencia KL publicadas.
- Evaluacion de fidelidad de cuantizacion: los datos de KL divergence de la model card permiten usar esta version como referencia para validar otras cuantizaciones del mismo modelo en tareas de chat, herramientas y prosa.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Si incluye una evaluacion de fidelidad de cuantizacion frente a logits FP32 del runtime de entrenamiento nativo, medida como divergencia KL media sobre los 20 tokens mas probables en tres prompts de referencia (chat thinking de 16 tokens, chat con herramientas de 176 tokens y 300 tokens de prosa):

| Pesos | Chat thinking | Chat con herramientas | Prosa |
|---|---|---|---|
| MLX 8-bit (este repositorio) | 0,0043 | 0,0123 | 0,0044 |
| MLX 4-bit | 0,0197 | 0,0674 | 0,0175 |
| BF16 original (referencia de escala) | 0,0025 | 0,013 | 0,0037 |

El 8-bit se situa practicamente en el ruido del BF16 original, mientras que el 4-bit multiplica por entre 4 y 5 la divergencia en chat y herramientas.

## Requisitos de hardware

- Memoria: la model card indica que funciona en un Mac con 24 GB o mas de memoria unificada; el repositorio ocupa 11,1 GB.
- Hardware: exclusivamente Apple Silicon (MLX); no es ejecutable en GPU NVIDIA o AMD mediante este repositorio.
- GPU de consumo: si, en Macs con 24 GB o mas (por ejemplo, configuraciones de MacBook Pro o Mac Studio con memoria unificada suficiente). No aplica a RTX 4090, A100 o H100 con este formato.
- Despliegue: `mlx-lm` (version 0.32.2 o superior; las versiones 0.32.2 y anteriores no reconocen las marcas de thinking y arrancan en modo directo salvo que se pase `enable_thinking` explicitamente), con `mlx_lm.chat`, `mlx_lm.generate` y `mlx_lm.server` (endpoint OpenAI-compatible). Requiere `--trust-remote-code` por la implementacion personalizada `metis16.py`.
- Parametros de muestreo recomendados: thinking a temperatura 1.0, top-p 0.95, top-k 20; respuestas directas a temperatura 0.3. La CLI de mlx-lm no dispone de penalizacion de repeticion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Notas |
|---|---|---|---|---|---|
| Metis-1.6-Logos-MLX-8bit (este) | 10,2B (MoE 192 expertos, top-4) | 128k | MLX 8-bit, Apple Silicon | Apache 2.0 | Divergencia KL 0,0043 en chat thinking |
| Metis-1.6-Logos-MLX-4bit | 10,2B (MoE) | 128k | MLX 4-bit, Apple Silicon | Apache 2.0 | Divergencia KL 0,0197 en chat thinking; menor huella de memoria |
| Metis-1.6-Logos (BF16) | 10,2B (MoE) | 128k | safetensors Transformers | Apache 2.0 | Referencia de calidad; mayor requisito de memoria |
| Metis-1.6-Logos-GGUF | 10,2B (MoE) | 128k | GGUF (llama.cpp, Ollama, LM Studio) | Apache 2.0 | Multiplataforma, incluye CPU y GPU no Apple |
| Metis-1.6-Logos-FP8 | 10,2B (MoE) | 128k | FP8 (vLLM, SGLang) | Apache 2.0 | Orientado a servidores GPU |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo frente a modelos de otras familias con parametros similares.

## Limitaciones y advertencias

- Exclusividad de plataforma: esta version solo funciona en Apple Silicon mediante MLX; para otros entornos deben usarse las variantes GGUF o FP8 del mismo modelo.
- Dependencia de codigo remoto: requiere `--trust-remote-code` porque el repositorio incluye la implementacion completa del modelo en `metis16.py`; la propia model card recomienda revisar ese archivo antes de confiar en el.
- Compatibilidad de mlx-lm: versiones 0.32.2 y anteriores no reconocen las marcas de thinking, arrancan en modo directo salvo indicacion explicita y dejan el razonamiento dentro de la respuesta; el tool calling llega como texto hasta que mlx-lm incorpore el parser del modelo.
- Idiomas soportados: no documentados; no hay garantia de calidad multilingue.
- Sesgos y alucinacion: no se publica informacion sobre sesgos conocidos ni sobre tasas de alucinacion; como modelo generativo, el riesgo de alucinacion existe y debe mitigarse con verificacion externa en produccion.
- Perdida de fidelidad por cuantizacion: aunque pequena, el 8-bit introduce divergencia respecto a BF16 (0,0043 frente a 0,0025 en chat thinking); en tareas sensibles a la precision numerica conviene validar contra los pesos originales.
- Licencia: Apache 2.0, sin restricciones conocidas para uso comercial; no obstante, conviene revisar la model card del modelo base por si añade condiciones adicionales.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado recientemente; no hay evidencia de uso en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Lernex/Metis-1.6-Logos-MLX-8bit
- Modelo base BF16 (Transformers): https://huggingface.co/Lernex/Metis-1.6-Logos
- Variante MLX 4-bit: https://huggingface.co/Lernex/Metis-1.6-Logos-MLX-4bit
- Variante GGUF (llama.cpp, Ollama, LM Studio): https://huggingface.co/Lernex/Metis-1.6-Logos-GGUF
- Variante FP8 (vLLM, SGLang): https://huggingface.co/Lernex/Metis-1.6-Logos-FP8
