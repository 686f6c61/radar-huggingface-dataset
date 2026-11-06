# nkthebass/tinybrainbot-3m-v2-base

## Resumen

TinyBrainBot-3M-v2-Base es un modelo de lenguaje de propósito general de tamaño ultrapequeño (2.942.928 parámetros) entrenado desde cero por el desarrollador independiente nkthebass. Se trata de la segunda versión del modelo, reconstruido para ser más equilibrado que su predecesor: prioriza el sentido común, los hechos y las preguntas y respuestas, con aritmética de nivel escolar que generaliza a formulaciones nunca vistas, en lugar de maximizar artificialmente una única métrica.

El modelo resuelve un problema concreto dentro del ecosistema open source: ofrecer un lenguaje model extremadamente ligero (unos 6 MB en GGUF F16) que pueda ejecutarse en prácticamente cualquier hardware, incluso sin GPU, y que sirva como base para experimentación, educación y casos de uso embebidos. Está implementado como un Llama estándar (`LlamaForCausalLM`), sin código personalizado, lo que garantiza compatibilidad directa con transformers, llama.cpp, LM Studio y Jan.

Fue entrenado con 6,05 mil millones de tokens en tres fases (preentrenamiento heredado, preentrenamiento nuevo y decay), usando datasets públicos como TinyStories, FineWeb-Edu, Cosmopedia, Wikipedia y orca-math-word-problems-200k. Su longitud de contexto es de 1.024 tokens y su licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (LlamaForCausalLM) |
| Parametros totales | 2.942.928 (2,35M no-embedding + 0,59M embedding embebido) |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | F16 (GGUF); Q8_0 no es posible porque el hidden size (144) no es múltiplo de 32 |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF (F16, 6 MB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder convencional al estilo Llama, con configuración muy compacta: hidden size de 144, 10 capas, 3 cabezas de consulta de 48 dimensiones con 1 cabeza KV (Grouped Query Attention, GQA), SwiGLU con dimensión intermedia de 416, RMSNorm y RoPE para codificación posicional. El tokenizador es un BPE a nivel de byte entrenado específicamente para este modelo, con un vocabulario de 4.096 tokens; una particularidad destacable es que los dígitos se dividen en un token por dígito y el espaciado en blanco se conserva exactamente, lo que favorece la aritmética.

El entrenamiento total abarcó 6,05 mil millones de tokens en tres partes: los primeros 4,72B corresponden al preentrenamiento original de TinyBrainBot-3M-Base (hasta su paso 36.000), seguidos de 0,81B de preentrenamiento nuevo y una fase de decay de 0,51B. El preentrenamiento nuevo mezcla Q&A y hechos destilados (25%), aritmética en múltiples formatos (20%), sentido común y how-to de Cosmopedia WikiHow (15%), Cosmopedia Stanford + OpenStax (13%), TinyStories (12%), FineWeb-Edu (10%) y leads de Wikipedia (5%). La fase de decay reajusta las proporciones, reduciendo la aritmética al 8,7% y aumentando Q&A y hechos al 34,3%. La aritmética se generó con programas propios (orden de operaciones, negativos, formatos numéricos, tablas, distractores, con respuestas calculadas en Python) y problemas narrativos escritos por varias familias de LLM (Ling, Mistral), con los números rellenados y verificados programáticamente. No se publicaron detalles sobre RLHF ni DPO.

## Capacidades

- Generacion de texto en ingles continuando el prompt (modelo base, no conversacional)
- Aritmetica de nivel escolar en problemas de texto, con generalizacion a formulaciones no vistas (conjuntos held-out con puntuaciones de 34,2 a 46,7 en acc_norm)
- Resolucion de preguntas y respuestas de sentido comun y hechos simples
- Comprension de narrativas simples estilo TinyStories
- Manejo de multiples formatos numericos: numeros grandes, comas, dinero, numeros en palabras, tablas y distractores
- Compatibilidad con transformers, llama.cpp, LM Studio y Jan sin codigo personalizado
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; tampoco vision ni audio

## Casos de uso

- Educacion y docencia de ML: por su tamano minimo (2,94M de parametros), es ideal para ensenar como funciona un transformer por dentro, inspeccionar pesos y ejecutar el ciclo completo de entrenamiento e inferencia en un portatil sin GPU.
- Experimentacion en investigacion: sirve como banco de pruebas barato para tecnicas como cuantizacion, decodificacion especulativa con modelos grandes como draft, o ablacion de capas, dado el coste practicamente nulo de cada experimento.
- Dispositivos con recursos extremadamente limitados: con 6 MB en GGUF F16 puede ejecutarse en microcontroladores potentes, Raspberry Pi o embebidos con poca RAM, para completar texto simple en ingles.
- Prototipado rapido de pipelines de texto: permite validar integraciones con llama.cpp, LM Studio o Jan antes de sustituir el modelo por uno mayor en produccion.
- Generacion de aritmetica simple en formularios o herramientas offline: puede resolver sumas y operaciones basicas en problemas de texto sin conexion a internet ni dependencias de servicios externos.
- Generacion de historias infantiles simples en ingles: su entrenamiento con TinyStories le permite continuar narrativas de vocabulario y sintaxis sencillos.
- Pruebas de regresion y CI de infraestructura LLM: al pesar pocos megabytes, puede usarse como modelo canary en pipelines de CI/CD para verificar que la infraestructura de inferencia funciona sin consumir recursos.

## Benchmarks y rendimiento

Resultados declarados por el autor (0-shot, conjuntos completos, acc_norm), comparados con modelos de 3M de parametros o menos del Open SLM Leaderboard:

| Modelo | Params | Indice de inteligencia | HellaSwag | ARC-E | ARC-C | PIQA | ArithMark-3 |
|---|--:|--:|--:|--:|--:|--:|--:|
| TinyBrainBot-3M-v2-Base | 2,94M | 10,38 | 27,29 | 33,38 | 22,53 | 56,75 | 45,10 |
| GPT-S3-3M | 2,97M | 9,61 | 27,68 | 34,76 | 23,12 | 57,02 | 39,10 |
| Tokle-3M | 2,91M | 8,91 | 27,20 | 34,85 | 23,98 | 55,01 | 40,80 |
| pulvis-v2 | 2,96M | 8,62 | 27,93 | 31,86 | 22,78 | 56,86 | 37,40 |
| Purrence-3M | 2,99M | 8,49 | 27,81 | 34,55 | 23,63 | 56,64 | 34,80 |

Ademas, el autor publica resultados en conjuntos aritmeticos held-out (no usados en entrenamiento, acc_norm): historias aritmeticas escritas por Gemma (34,2), por Llama (36,3), 23 temas aritmeticos nuevos (38,8), posiciones desconocidas/distractores/tablas (37,1), formatos numericos grandes/con comas/dinero (40,8/46,7/45,2), ecuaciones simples (35,9) y ArithMark-2 (27,2). Estos resultados no han sido verificados por terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; con 6 MB en F16 cabe en cualquier GPU o se ejecuta solo en CPU
- GPU recomendadas: ninguna en particular; cualquier GPU, incluso integrada, es mas que suficiente
- Consumer GPU: cabe con holgura en cualquier GPU consumer; de hecho, no necesita GPU en absoluto
- Opciones de despliegue: transformers (PyTorch), llama.cpp, LM Studio y Jan mediante el GGUF F16 incluido; no se menciona soporte verificado para vLLM, TGI u Ollama
- Latencia y throughput: no disponible; dada la arquitectura de 2,94M de parametros y 1.024 tokens de contexto, se espera latencia muy baja y throughput alto incluso en CPU

## Comparativa con modelos similares

| Modelo | Params | Contexto | Indice de inteligencia | Licencia | Disponibilidad |
|---|--:|:--|--:|:--|:--|
| TinyBrainBot-3M-v2-Base | 2,94M | 1.024 | 10,38 | Apache 2.0 | HF, safetensors + GGUF |
| GPT-S3-3M | 2,97M | no disponible | 9,61 | no disponible | Open SLM Leaderboard |
| Tokle-3M | 2,91M | no disponible | 8,91 | no disponible | Open SLM Leaderboard |
| pulvis-v2 | 2,96M | no disponible | 8,62 | no disponible | Open SLM Leaderboard |

Dentro de la categoria de modelos de 3M de parametros o menos, TinyBrainBot-3M-v2-Base encabeza el Indice de Inteligencia del Open SLM Leaderboard (10,38) y destaca en ArithMark-3 (45,10). Frente a alternativas mucho mayores como Qwen2.5-0.5B o SmolLM2-135M, este modelo es radicalmente mas pequeno pero tambien mucho menos capaz; su valor esta en el tamano, no en el rendimiento absoluto.

## Limitaciones y advertencias

- Es un modelo base: continua texto y no conversa; no debe usarse como asistente sin un ajuste posterior
- A este tamano (2,94M de parametros) solo genera texto corto y simple; la calidad es muy inferior a la de modelos de 100M o mas
- Alto riesgo de alucinacion y de texto incoherente, inherente al tamano extremadamente reducido
- Entrenado solo en ingles; no es util en castellano ni en otros idiomas
- Contexto de solo 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas
- La cuantizacion Q8_0 no esta disponible porque el hidden size (144) no es multiplo de 32; solo F16 en GGUF
- Los benchmarks son declarados por el autor y no verificados por terceros
- Sin soporte de tool calling, agentes, vision ni audio
- Sesgos: heredados de los datasets de entrenamiento (Wikipedia, FineWeb-Edu, Cosmopedia, TinyStories); no se ha publicado analisis de sesgos
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nkthebass/tinybrainbot-3m-v2-base
- Predecesor (TinyBrainBot-3M-Base): https://huggingface.co/nkthebass/tinybrainbot-3m-base
- Open SLM Leaderboard (AxiomicLabs): https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Datasets de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu, https://huggingface.co/datasets/HuggingFaceTB/cosmopedia, https://huggingface.co/datasets/roneneldan/TinyStories, https://huggingface.co/datasets/wikimedia/wikipedia, https://huggingface.co/datasets/microsoft/orca-math-word-problems-200k
