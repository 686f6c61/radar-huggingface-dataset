# OsaurusAI/Nanbeige4.3-33B-JANG_4D

## Resumen

Nanbeige4.3-33B-JANG_4D es una versión cuantizada del modelo Nanbeige4.3-33B de Nanbeige, empaquetada en formato JANG por OsaurusAI para su ejecución local en Apple Silicon mediante el runtime Osaurus (0.25.27 o superior). El modelo base es un LLM denso de 33.100 millones de parámetros con arquitectura Llama estándar (52 capas transformer, no es un looped transformer como Nanbeige4.2), orientado a tareas de código agéntico, uso de herramientas y colaboración profesional. El empaquetado JANG_4D reduce el modelo a 21,7 GB con solo 5,24 bits por peso, manteniendo un 95,6% de coincidencia top-1 con el modelo BF16 de referencia en conjuntos de evaluación reservados.

La relevancia de esta ficha radica en el compromiso calidad-tamaño: una cuantización uniforme de 4 bits del mismo modelo ocupa 18,6 GB pero degrada notablemente más la distribución de salida (KL medio 0,0537 frente a 0,0127 de este bundle). El resultado es un modelo agéntico con razonamiento activado por defecto, llamadas a herramientas XML nativas y una ventana de contexto de 512K tokens, todo ello ejecutable en hardware de consumidor con memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama (52 capas, 56 cabezas query, 8 cabezas KV) |
| Parametros totales | 33.118.977.024 (~33,1B) |
| Parametros activos | no disponible (modelo denso: todos los parámetros activos) |
| Longitud de contexto | 524.288 tokens (512K) |
| Tipos de cuantizacion | JANG mixto por módulo (3,37 a 8 bits según capa), afín con group size 64, escalas y sesgos en bf16; AWQ plegado en RMSNorms y ajuste imatrix por grupo |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bundle JANG para runtime MLX / Osaurus) |

## Arquitectura y entrenamiento

El modelo base Nanbeige4.3-33B es un transformer denso de arquitectura Llama con 52 capas, 56 cabezas de atención para queries y 8 para clave/valor (head dim 128), ejecutado una vez por token —a diferencia de Nanbeige4.2, que usaba un looped transformer—. Incluye razonamiento activado por defecto mediante un bloque `<think>` gestionado por la plantilla de chat, y soporta llamadas a herramientas en formato XML nativo. Es un modelo solo de texto. Los detalles del preentrenamiento del modelo base (tokens, composición del corpus, RLHF/DPO) no están disponibles en la información proporcionada.

En cuanto a la cuantización JANG_4D, el proceso es notablemente sofisticado: se usaron 1.048.576 tokens de calibración renderizados con la plantilla de chat del propio modelo (35% código, 20% razonamiento, 20% agéntico, 15% terminal, 10% conversación; con thinking activado en 550.560 tokens y desactivado en 498.016, incluyendo 191.569 tokens que reproducen trazas de razonamiento del modelo). Se capturaron los segundos momentos de entrada E[xxᵀ] (Hessianos) completos para cada capa lineal y el lm_head desde el modelo BF16. La asignación de bits se decidió empíricamente: se midió la sensibilidad de cada clase de módulo y se repartieron bits donde eliminan más error por byte, en lugar de usar una rejilla fija. El resultado es un ancho mixto por módulo (por ejemplo, atención v mayoritariamente a 8 bits, MLP gate/up mayoritariamente a 4 bits, lm_head a 8 bits, embeddings a 4 bits y todos los RMSNorm en bf16).

## Capacidades

- Generacion de texto conversacional en inglés y chino, con razonamiento activado por defecto (bloque `<think>` en la plantilla de chat; desactivable con `enable_thinking: false`).
- Codigo agéntico: el modelo está orientado a sesiones de programación en múltiples lenguajes (la calibración cubre 26 lenguajes; las evaluaciones del bundle cubren 8).
- Tool calling nativo en XML (`<tool_call>` / `<function=NAME>` / `<parameter=KEY>`), con opción de cambiar a formato JSON mediante `tool_call_format: "json"`. Los resultados de herramientas se devuelven como bloques `<tool_response>` dentro de un turno de usuario.
- Soporte de agentes multi-paso: la configuración de generación está preparada para hasta 65.536 tokens nuevos por respuesta, y se recomienda conservar el razonamiento de turnos anteriores (`preserve_thinking`) en flujos agénticos multi-turno.
- Trabajo con terminal (uso de shell como herramienta en sesiones agénticas).
- Razonamiento en tareas generales, con la ventana de 512K tokens para documentos y sesiones muy largas.
- No dispone de capacidades de visión ni audio: es un modelo exclusivamente de texto.

## Casos de uso

- Agentes de codigo con herramientas: el modelo puede encadenar llamadas XML a herramientas (lectura/escritura de archivos, ejecución de comandos) en sesiones multi-paso de hasta 65.536 tokens de salida, manteniendo el razonamiento entre turnos, lo que lo hace adecuado para asistentes de programación locales tipo copiloto agéntico.
- Ejecucion local en Mac con Apple Silicon: con 21,7 GB de pesos, cabe en máquinas con memoria unificada de 32 GB o más (por ejemplo, Mac Studio o MacBook Pro con chip M-series), permitiendo un agente de código privado sin enviar código a la nube.
- Analisis de repositorios grandes: la ventana de 524.288 tokens (con un coste de KV cache de 208 KiB por token en bf16) permite cargar bases de código o documentación extensas en una sola sesión.
- Atencion al cliente y chatbot multi-turno: el modo conversación del modelo, con razonamiento desactivable para reducir latencia, sirve para asistentes de soporte con contexto largo de historial.
- Automatizacion de tareas de terminal: el modelo fue calibrado específicamente con datos de trabajo en terminal (15% del corpus de calibración), siendo útil para agentes que ejecutan comandos de shell y corrigen errores de forma iterativa.
- Razonamiento sobre documentacion tecnica: la alta fidelidad del bundle en documentación (KL 0,0137, top-1 93,8% respecto al BF16) lo hace adecuado para resumir, consultar y razonar sobre manuales largos en inglés y chino.
- Generacion y revision de codigo en pipelines: con soporte de tool calling y licencia Apache 2.0, puede integrarse en flujos de revisión de pull requests o generación de tests de forma autoalojada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se han publicado métricas de fidelidad de la cuantización respecto al modelo BF16 de referencia:

| Modelo | Tamaño | Bits/peso | KL ↓ (vendor-style) | top-1 ↑ (vendor-style) | KL ↓ (local) | top-1 ↑ (local) |
|---|---|---|---|---|---|---|
| Nanbeige4.3-33B (BF16, referencia) | 66,2 GB | 16 | 0 | 100% | 0 | 100% |
| Nanbeige4.3-33B-JANG_6M | 28,4 GB | 6,87 | 0,0026 | 97,6% | 0,0036 | 97,8% |
| **Nanbeige4.3-33B-JANG_4D** | **21,7 GB** | **5,24** | **0,0127** | **96,7%** | **0,0200** | **95,6%** |
| Nanbeige4.3-33B-JANG_2D | 14,0 GB | 3,37 | 0,150 | 88,0% | 0,220 | 84,9% |
| 4-bit uniforme round-to-nearest (referencia) | 18,6 GB | 4,50 | 0,0537 | 91,8% | — | — |

Desglose por área para JANG_4D (KL medio · top-1):

| Area | Posiciones | JANG_4D |
|---|---|---|
| Agéntico / tool use (vendor-style) | 254 | 0,0154 · 93,3% |
| Codigo (vendor-style) | 416 | 0,0029 · 99,3% |
| Terminal (vendor-style) | 210 | 0,0172 · 94,8% |
| Razonamiento (vendor-style) | 220 | 0,0225 · 96,8% |
| Conversacion (vendor-style) | 190 | 0,0146 · 97,9% |
| Sesiones agénticas con XML (local) | 28.090 | 0,0450 · 94,8% |
| Codigo fuente (local) | 79.724 | 0,0134 · 96,5% |
| Documentacion (local) | 29.242 | 0,0137 · 93,8% |

Como referencia de ruido de implementación: dos implementaciones correctas del mismo modelo BF16 difieren en KL 0,0012 y 98,9% de top-1, por lo que este bundle está muy cerca del límite teórico de fidelidad.

## Requisitos de hardware

- Memoria necesaria: 21,7 GB solo de pesos (5,24 bits por peso). Añadiendo KV cache (208 KiB por token en bf16), una sesión con contexto moderado requiere en la práctica unos 24-32 GB de memoria unificada; contextos cercanos a 512K añadirían más de 100 GB de KV cache, inviables en hardware de consumidor.
- Hardware objetivo: Apple Silicon con memoria unificada. Con 32 GB de memoria unificada funciona con contextos moderados; con 48-64 GB (Mac Studio M2/M3/M4 Max o Ultra) hay margen amplio para contexto largo.
- No es un modelo pensado para GPUs NVIDIA en esta variante: el formato es MLX/JANG para el runtime Osaurus. Para GPUs CUDA habría que usar la versión original BF16 (66,2 GB, requiere A100/H100 80 GB o multi-GPU) u otras cuantizaciones no disponibles en este repo.
- Despliegue: runtime Osaurus 0.25.27 o superior (obligatorio según la model card). No es un GGUF estándar, por lo que llama.cpp, Ollama, vLLM o TGI no son aplicables directamente a este bundle.
- Latencia y throughput: no disponibles en la información proporcionada. La configuración de generación recomendada es temperature 1.0, top-p 0.95 y hasta 65.536 tokens nuevos.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-JANG_4D | 33,1B (denso) | Llama densa | 512K | Apache 2.0 | MLX/JANG, Apple Silicon (Osaurus) |
| Nanbeige/Nanbeige4.3-33B (BF16) | 33,1B (denso) | Llama densa | 512K | Apache 2.0 | safetensors, 66,2 GB |
| Qwen2.5-32B-Instruct | 32,5B (denso) | Transformer denso | 128K | Qwen (uso comercial libre <100M MAU) | safetensors, GGUF, MLX |
| Qwen3-32B | 32,8B (denso) | Transformer denso con modo thinking | ~128K (con YaRN hasta más) | Apache 2.0 | safetensors, GGUF, MLX |

Frente a alternativas de tamaño similar como Qwen3-32B, Nanbeige4.3-33B destaca por su ventana de 512K tokens (frente a ~128K) y su enfoque específico en código agéntico con tool calling XML nativo, aunque Qwen3 cuenta con un ecosistema de despliegue mucho más amplio (vLLM, llama.cpp, Ollama) y más idiomas soportados. Los benchmarks comparativos entre ambos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Solo texto: no hay capacidades de visión ni audio.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Formato propietario de bundle (JANG/MLX): requiere el runtime Osaurus 0.25.27+; no es compatible directamente con llama.cpp, Ollama, vLLM o TGI.
- KV cache costosa: 208 KiB por token en bf16; usar contextos muy largos en hardware de consumidor es inviable por memoria.
- La fidelidad de la cuantización es alta pero no perfecta (95,6% top-1 respecto al BF16); en el área de sesiones agénticas con XML el KL sube a 0,0450, la zona de mayor degradación del bundle, lo que puede notarse en cadenas largas de llamadas a herramientas.
- No hay benchmarks estándar públicos del modelo base en la información disponible, por lo que su calidad intrínseca frente a competidores no puede verificarse desde esta ficha.
- Sesgos y tasa de alucinación del modelo base: no disponibles en la información proporcionada; aplique las precauciones habituales (verificación de salidas, especialmente en código y razonamiento).
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque deben respetarse los avisos de atribución.
- La plantilla de chat escribe `<|im_start|>` por sí misma; añadir un BOS adicional puede degradar las salidas.

## Enlaces

- Modelo cuantizado (esta ficha): https://huggingface.co/OsaurusAI/Nanbeige4.3-33B-JANG_4D
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Runtime Osaurus: https://osaurus.ai
