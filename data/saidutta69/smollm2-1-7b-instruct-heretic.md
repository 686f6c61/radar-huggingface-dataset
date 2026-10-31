# saidutta69/SmolLM2-1.7B-Instruct-heretic

## Resumen

SmolLM2-1.7B-Instruct-heretic es una variante "decensurada" (abliterada) de HuggingFaceTB/SmolLM2-1.7B-Instruct, publicada por el usuario saidutta69. El modelo original es un LLM instruccional denso de 1,71B parámetros de la familia SmolLM2 de Hugging Face, orientado a ejecución en dispositivo (edge). Esta variante aplica una ablación direccional mediante la herramienta Heretic v1.4.0: se editan pesos concretos en las proyecciones de salida de atención y en las down-projections del MLP para suprimir el comportamiento de negativa (refusal) sin reentrenar, preservando las capacidades de seguimiento de instrucciones, matemáticas y function calling del modelo base.

El interés de esta ficha radica en que el modelo base ya presentaba una alineación ligera (solo rechazaba 37 de 100 prompts dañinos antes de la abliteración, por su DPO moderado), y la edición reduce ese número a 8/100 con una divergencia KL de solo 0,0257 respecto al original, es decir, una modificación muy contenida. Con 1,06 GB en cuantización Q4_K_M, cabe en cualquier GPU de consumo, en la RAM de un portátil o directamente en CPU, lo que lo hace adecuado para agentes locales, roleplay, pipelines de resumen y reescritura, y como modelo instruccional en configuraciones de dos modelos con decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, arquitectura Llama |
| Parametros totales | 1.711.376.384 (1,71B, embeddings atados) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | GGUF: F16, Q2_K, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (14 cuants + F16); safetensors en BF16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3,42 GB, BF16) y GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso con arquitectura tipo Llama de 1,71B parámetros y embeddings atados, entrenado por Hugging Face como el mayor modelo de la línea SmolLM2. El modelo original fue entrenado con preentrenamiento a gran escala seguido de alineación instruccional con DPO relativamente ligero, lo que explica su baja tasa de negativas previa a la abliteración. Los detalles del corpus de preentrenamiento (número de tokens, composición) no están disponibles en la información proporcionada.

La variante "heretic" no modifica el entrenamiento: aplica abliteración mediante ediciones dirigidas de pesos en `attn.o_proj` y `mlp.down_proj`, calculando una dirección de rechazo por capa (`direction_index` seleccionado por capa, valor medio 15,66) con pesos máximos de 1,37 (atención) y 1,47 (MLP). El proceso fue un trial de 200 iteraciones de Heretic v1.4.0 con semilla `177211886`, y el repositorio incluye el directorio `reproduce/` con `config.toml`, `requirements.txt`, el diario de estudio de Optuna y sumas SHA-256, de modo que el modelo puede regenerarse bit a bit con `heretic --reproduce reproduce/reproduce.json`.

## Capacidades

- Generacion de texto conversacional e seguimiento de instrucciones, con comportamiento de rechazo suprimido (8/100 frente a 37/100 del original)
- Razonamiento y matematicas a nivel de modelo de 1,7B (GSM8K 5-shot: 48,2 en el modelo base)
- Function calling / tool calling (BFCL: 27 % en el modelo base)
- Asistencia de codigo en hardware pequeño
- Reescritura y resumen en pipelines locales
- Roleplay y generación creativa sin filtros de alineación
- Ejecución totalmente local: CPU, portátil, Raspberry Pi 5 o móviles con 6 GB de RAM
- No dispone de capacidades de visión, audio ni modo de razonamiento extendido (thinking)

## Casos de uso

- Agentes locales en dispositivos edge: con 1,06 GB en Q4_K_M y 8.192 tokens de contexto, puede actuar como cerebro de agentes de una sola tarea en Raspberry Pi 5 o portátiles sin GPU dedicada.
- Function calling en local: el modelo base puntúa 27 % en BFCL, suficiente para orquestación sencilla de herramientas en entornos offline donde la latencia de red es inaceptable.
- Roleplay y escritura creativa sin negativas: la abliteración elimina la mayoría de rechazos, útil para ficción y personajes que requieren respuestas sin evasivas.
- Modelo draft en decodificación especulativa: al ser el mayor de la línea SmolLM2, puede servir como modelo instruccional principal mientras un modelo más pequeño (por ejemplo, SmolLM2-360M-Instruct-heretic) genera la mayor parte de tokens.
- Pipelines de resumen y reescritura: tareas de transformación de texto de un turno donde la ventana de 8K tokens cubre documentos de longitud moderada.
- Prototipado y pruebas reproducibles: el directorio `reproduce/` permite regenerar el checkpoint bit a bit, útil para investigación en abliteración y alineación.
- Asistencia de código en hardware modesto: cabe en GPUs de consumo y en CPU, permitiendo autocompletado y refactorizaciones sencillas sin servicios en la nube.

## Benchmarks y rendimiento

El propio autor indica que no se ejecutó un barrido de benchmarks sobre el checkpoint abliterado; las cifras siguientes corresponden al modelo base y se reproducen de su model card. La abliteración añade una divergencia KL de 0,0257 respecto al original.

| Metrica | Modelo base (SmolLM2-1.7B-Instruct) |
|---|---|
| IFEval | 56,7 |
| MT-Bench | 6,13 |
| GSM8K (5-shot) | 48,2 |
| BBH (3-shot) | 32,2 |
| MMLU-Pro (MCF) | 19,3 |
| ARC | 51,7 |
| PIQA | 74,4 |
| HellaSwag | 66,1 |
| BFCL (function calling) | 27 % |
| Rechazos (100 prompts daninos) | 37/100 (8/100 tras abliteracion) |
| Divergencia KL | 0 (base) / 0,0257 (esta variante) |

## Requisitos de hardware

- VRAM / RAM estimada segun cuantizacion:
  - Q2_K: 0,67 GB de pesos (mas KV cache)
  - Q4_K_M: 1,06 GB
  - Q5_K_M: 1,23 GB
  - Q6_K: 1,41 GB
  - Q8_0: 1,82 GB
  - F16 / BF16 (safetensors): 3,42 GB
- KV cache: aproximadamente 16 MB por cada 8K de contexto en Q4
- GPU recomendadas: cualquier GPU de consumo basta; no se requiere A100 ni H100. Cabe en GPUs con 2 GB de VRAM en cuantizaciones bajas
- Consumer GPUs: compatible con practicamente todas; tambien funciona en CPU (Raspberry Pi 5 de 8 GB con Q5_K_M) y en moviles/navegador con 6 GB de RAM (Q4_K_M)
- Despliegue: llama.cpp (los GGUF estan producidos con llama.cpp), Ollama, LM Studio o cualquier runtime GGUF; transformers con safetensors para uso programatico; compatible con text-generation-inference
- Latencia y throughput: no disponible; al ser un modelo de 1,7B denso, se espera inferencia rapida incluso en CPU, pero no hay cifras publicadas

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Particularidad |
|---|---|---|---|---|
| SmolLM2-1.7B-Instruct-heretic | 1,71B | 8.192 | Apache 2.0 | Abliterado (8/100 rechazos), KL 0,0257, GGUF completo |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,71B | 8.192 | Apache 2.0 | Modelo original, 37/100 rechazos, alineacion DPO ligera |
| SmolLM2-360M-Instruct-heretic | 360M | 8.192 | Apache 2.0 | Misma tecnica, un tamano por debajo, para dispositivos muy limitados |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 (hasta 128K con RoPE) | Apache 2.0 (algunos pesos) | Mayor contexto y benchmarks superiores, pero alineacion mas restrictiva |

## Limitaciones y advertencias

- Al ser un modelo abliterado, responde a prompts daninos con mucha mayor probabilidad que el original (solo 8/100 rechazos): su uso conlleva riesgos eticos y legales, y el operador asume la responsabilidad del contenido generado
- El ingles es el unico idioma declarado; el rendimiento en castellano no esta documentado y probablemente sea inferior
- Ventana de contexto de solo 8.192 tokens, limitada frente a otros modelos de su clase
- Capacidades modestas para su tamano: GSM8K 48,2 y MMLU-Pro 19,3 lo sitúan por debajo de alternativas recientes de 1,5-2B en razonamiento y matematicas
- Function calling con 27 % en BFCL: poco fiable para agentes criticos en produccion
- Riesgo de alucinacion tipico de modelos pequenos; no hay evaluaciones de veracidad publicadas para esta variante
- No se ejecutaron benchmarks sobre el checkpoint abliterado: se asume que las capacidades se conservan, pero solo se ha medido la divergencia KL y la tasa de rechazos
- La licencia Apache 2.0 no restringe el uso comercial, pero el autor no ofrece ninguna garantia sobre el comportamiento del modelo sin filtros

## Enlaces

- Modelo: https://huggingface.co/saidutta69/SmolLM2-1.7B-Instruct-heretic
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Variante 360M de la coleccion: https://huggingface.co/saidutta69/SmolLM2-360M-Instruct-heretic
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Articulo original sobre abliteration: https://huggingface.co/blog/mlabonne/abliteration
- llama.cpp: https://github.com/ggml-org/llama.cpp
