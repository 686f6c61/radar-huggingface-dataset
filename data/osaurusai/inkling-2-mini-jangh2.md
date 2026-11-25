# OsaurusAI/Inkling-2-Mini-JANGH2

## Resumen

Inkling-2-Mini-JANGH2 es una cuantización agresiva del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por OsaurusAI para su ejecución en Apple Silicon mediante el runtime Osaurus (versión 1.0.11 o superior) y la librería MLX. El modelo base es un Mixture-of-Experts multimodal de 26.400 millones de parámetros totales con 3.400 millones activos por token, diseñado para razonamiento, uso de herramientas, código y visión. Esta versión comprime el checkpoint original de 20,2 GB hasta 10,18 GB, es decir, aproximadamente la mitad, manteniendo una tasa de acuerdo top-1 del 91,31% respecto al original.

La innovación principal es el formato JANGH (Hadamard-32 con codebook y una escala fp16 por fila de salida), que aplica redondeo GPTQ sobre Hessianos capturados en las tres pasadas de las capas con bucle. Los expertos enrutados promedian 2,34 bits por peso, mientras que las proyecciones de atención, embeddings y lm_head se mantienen en 8 bits afines con grupo de 64. El router, las normas, los sumideros de atención, las puertas de mensaje del bucle y las convoluciones cortas permanecen en fp32/BF16 sin tocar, y el codificador de visión y el drafter se incluyen sin modificar en BF16.

Su relevancia radica en que permite ejecutar un MoE multimodal de 26,4B con contexto declarado de hasta 1M tokens en hardware de consumo Apple, con una degradación medible y documentada por dominio. El bundle conserva el contrato de servicio del original: razonamiento obligatorio antes de responder, tool calls en JSON, esfuerzo de razonamiento configurable y decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts multimodal con capas en bucle (12 capas centrales ejecutadas 3 veces con pesos compartidos); atención mixta sliding-window (1.024 tokens) y full-attention |
| Parametros totales | 26.400 millones (modelo base); 4.043.141.776 en los safetensors del bundle cuantizado |
| Parametros activos | 3.400 millones por token (8 de 128 expertos por capa) |
| Longitud de contexto | Hasta 1M tokens según la model card original; las capas sliding-window retienen como máximo 1.024 tokens de KV |
| Tipos de cuantizacion | Expertos en JANGH Hadamard-32 (~2,34 bits/peso medio; 3 bits en capas en bucle, 2 bits en el resto); atención, embeddings y lm_head en 8 bits afines (grupo 64); router, normas, sumideros, puertas y convoluciones en fp32/BF16; visión y drafter en BF16 |
| Idiomas soportados | Inglés y multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), cuantizado |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal de 24 capas de decoder. Las 12 capas centrales se ejecutan tres veces con pesos compartidos, de modo que cada token realiza 48 pasadas de capa. Cada token se enruta a 8 de 128 expertos por capa, lo que concentra 24.500 de los 26.400 millones de parámetros en los expertos enrutados. La atención combina capas de ventana deslizante de 1.024 tokens con capas de atención completa; solo estas últimas mantienen una caché KV que crece con el contexto (capas 5 y 23, y capas 11 y 17 una vez por pasada del bucle, es decir, 6 cachés en total). Incluye un codificador de visión y un drafter propio para decodificación especulativa.

El proceso de cuantización de este bundle aplica GPTQ con Hessianos calculados sobre las tres pasadas de las capas en bucle, asignando 3 bits a esas capas y 2 bits al resto de expertos. La calibración se realizó sobre 312.022 posiciones en 243 conversaciones reservadas, generadas por el propio Inkling-2-Mini en todos los niveles de esfuerzo de razonamiento, sin usar esas conversaciones para el ajuste. No se dispone de información sobre el dataset de preentrenamiento, el número de tokens ni las etapas de RLHF o DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento explícito: el modelo siempre razona antes de responder, con un segmento de razonamiento propio que abre el turno.
- Esfuerzo de razonamiento configurable mediante la plantilla de chat (`reasoning_effort`: none, minimal, low, medium, high, xhigh, max, o un número de 0 a 0,99; por defecto 0,9).
- Tool calling y function calling: emite llamadas en JSON (`{"name": ..., "args": {...}}`) dentro de su propio segmento de tool-call, y acepta resultados de herramientas como mensajes de tipo tool.
- Razonamiento multi-paso y bucles agénticos con herramientas.
- Generación de código y tareas de terminal.
- Matemáticas y razonamiento científico.
- Capacidades multilingües (inglés y otros idiomas).
- Visión: pipeline image-text-to-text con codificador de visión incluido.
- Decodificación especulativa mediante drafter propio incluido en el bundle.
- Contexto largo de hasta 1M tokens declarado en el modelo original.

## Casos de uso

- Agentes de terminal automatizados: el bundle conserva el 96,3% de acuerdo top-1 en el dominio terminal, lo que lo hace adecuado para agentes que ejecutan comandos, interpretan salidas y encadenan pasos con tool calls en JSON.
- Asistentes de código en local: con 93,7% de top-1 en el dominio de coding y soporte de tool calling, puede integrarse en flujos de edición y revisión de código sobre Apple Silicon sin depender de la nube.
- Razonamiento matemático y científico en dispositivos: mantiene 95,0% de top-1 en razonamiento/matemáticas y 91,9% en ciencia, útil para tutores o asistentes de análisis técnico con requisitos de privacidad.
- Procesamiento de documentos largos: el contexto de hasta 1M tokens del modelo base, con solo 6 cachés KV de atención completa, permite resumir o consultar repositorios documentales extensos en una sola pasada.
- Automatización de atención al cliente multi-turno: el modelo abre y cierra turnos de forma fiable (100% de coincidencia en aperturas de respuesta y cierres de turno) y gestiona bucles de herramientas, lo que encaja en flujos conversacionales con acceso a APIs.
- Análisis de imágenes con texto: al incluir el codificador de visión sin modificar, puede describir capturas, diagramas o documentos escaneados y responder preguntas sobre ellos, aunque la calidad de imagen no se midió específicamente en este bundle.
- Desarrollo de prototipos agénticos en portátiles Apple: el tamaño de 10,18 GB y el formato MLX permiten iterar sobre flujos de agentes con razonamiento y herramientas sin GPU dedicada.

## Benchmarks y rendimiento

Los datos publicados miden la fidelidad respecto al modelo original, no benchmarks de tareas estándar. La evaluación usa 312.022 posiciones en 243 conversaciones reservadas, con KL top-128 contra la versión original en NVFP4/MXFP8.

| Metrica | Original BF16 (suelo) | JANGH2 (10,2 GB) |
|---|---|---|
| KL mediana (↓) | 0,00042 | 0,0192 |
| KL media (↓) | 0,0017 | 0,0539 |
| KL p99 (↓) | 0,019 | 0,496 |
| Top-1 (↑) | 98,45% | 91,31% |
| Top-5 contiene el top-1 del original (↑) | 100,00% | 99,73% |
| Cambio en NLL de tokens reservados | +0,001 | +0,052 |

Por dominio (KL mediana · top-1):

| Dominio | Posiciones | JANGH2 | Suelo |
|---|---|---|---|
| Terminal | 4.985 | 0,0020 · 96,3% | 0,00006 · 99,2% |
| Razonamiento / matemáticas | 47.390 | 0,0023 · 95,0% | 0,00003 · 99,3% |
| Coding | 21.821 | 0,0058 · 93,7% | 0,00015 · 98,8% |
| Contexto largo | 4.120 | 0,0071 · 93,5% | 0,00033 · 98,2% |
| Ciencia | 30.733 | 0,0113 · 91,9% | 0,00021 · 98,7% |
| Bucles agénticos con herramientas | 13.474 | 0,0127 · 92,0% | 0,00039 · 98,6% |
| Multilingüe | 52.199 | 0,0208 · 90,5% | 0,00041 · 98,4% |
| Enciclopédico | 61.490 | 0,0268 · 90,2% | 0,00074 · 98,1% |
| Escritura creativa | 75.810 | 0,0334 · 89,0% | 0,00070 · 98,0% |

Por esfuerzo de razonamiento (KL mediana · top-1): max 0,0118 · 93,0%; xhigh 0,0165 · 92,1%; high 0,0132 · 92,5%; medium 0,0276 · 89,4%; low 0,0161 · 89,9%; minimal 0,0216 · 90,3%; none 0,0190 · 90,6%.

Prueba de generación: 13 prompts fijos con respuesta conocida (problemas de tiempo y aritmética, primos, divisores, probabilidad, dos tareas de código, una llamada de herramienta y una respuesta a partir de un resultado de herramienta, coreano y un poema), en esfuerzos de razonamiento de none a max. En modo greedy: 13/13 correctos y cerrados. Con muestreo a temperatura 1,0 y tres semillas: 39/39. El modelo original obtiene los mismos resultados.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: 10,18 GB de shards del modelo (7,16 GB expertos, 1,75 GB otros pesos de texto, 0,64 GB codificador de visión, 0,64 GB drafter), más la caché KV de las 6 capas de atención completa que crece con el contexto.
- Hardware objetivo: Apple Silicon con MLX; requiere el runtime Osaurus 1.0.11 o superior.
- No está diseñado para GPU NVIDIA ni CUDA; el formato es específico de MLX y Apple Silicon.
- Despliegue: runtime Osaurus; al ser un bundle MLX cuantizado con formato propietario JANGH, no es directamente compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato / hardware |
|---|---|---|---|---|---|
| Inkling-2-Mini-JANGH2 (este bundle) | 26,4B (4,04B en safetensors) | 3,4B | Hasta 1M | Apache 2.0 | MLX / Apple Silicon, 10,18 GB |
| thinkingmachines/Inkling-2-Mini (original) | 26,4B | 3,4B | Hasta 1M | Apache 2.0 | Checkpoint original, 20,2 GB, NVFP4/MXFP8 |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Degradación medible respecto al original: 91,31% de top-1 global; la escritura creativa (89,0%) y el texto enciclopédico (90,2%) son los dominios más afectados.
- El cierre del razonamiento acierta en el 72,8% de los puntos frente al 77,7% del original, lo que puede producir cierres de razonamiento menos canónicos.
- La calidad de imagen no se midió específicamente para este bundle, aunque el codificador se incluye sin modificar.
- Dependencia estricta del runtime Osaurus 1.0.11 o superior y de MLX; no es portable a otros motores de inferencia sin reconversión.
- El formato JANGH es propietario de OsaurusAI; la licencia Apache 2.0 cubre los pesos, pero la herramienta de ejecución tiene sus propias condiciones.
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones de sesgo en la información disponible.
- El contexto de 1M tokens solo es viable en la práctica si la memoria unificada soporta el crecimiento de las 6 cachés KV de atención completa.
- No se dispone de datos de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/OsaurusAI/Inkling-2-Mini-JANGH2
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Runtime Osaurus: https://osaurus.ai
