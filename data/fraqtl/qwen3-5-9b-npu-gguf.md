# fraQtl/Qwen3.5-9B-NPU-GGUF

## Resumen

Qwen3.5-9B-NPU-GGUF es una cuantización GGUF Q4_0 del modelo Qwen3.5-9B de Alibaba Qwen, publicada por el usuario fraQtl y optimizada específicamente para ejecutarse en la NPU Hexagon de los SoC Snapdragon mediante el backend Hexagon de llama.cpp. El modelo base es un transformer denso de 8.953.803.264 parámetros (aproximadamente 9B) con licencia Apache 2.0, y esta variante cuantizada ocupa 5.375.223.008 bytes (unos 5,4 GB) en un único fichero GGUF.

La relevancia de esta ficha no está en el modelo base, sino en el trabajo de cuantización: el autor sustituye el redondeo round-to-nearest por redondeo GPTQ ponderado por Hessiano (Frantar et al., 2022), usa una importance matrix propia con conversaciones de chat y tool-use renderizadas con la plantilla de chat de Qwen, y ajusta el mapa de tipos de unsloth (convirtiendo sus tensores Q5_K a Q4_0 para que todas las matmuls sean compatibles con Hexagon, y elevando 5 tensores a Q8_0 dentro del mismo presupuesto de bytes). El resultado, según la model card, mejora al Q4_0 de unsloth en BFCL v4 live (1.721 frente a 1.685) y MMLU-Pro (6.303 frente a 6.165) con el mismo tamaño y la misma velocidad de decodificación en dispositivo.

El interés práctico es que demuestra que se puede ganar calidad de tool-calling y razonamiento en una cuantización Q4_0 sin pagar en bytes ni en latencia, manteniendo compatibilidad con llama.cpp estándar y con el backend Hexagon. Está pensado para despliegue en móviles de gama alta con Snapdragon 8 Elite Gen 6 (SM8975), aunque el fichero también funciona en CPU y GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.5-9B); cuantizacion GGUF Q4_0 con 5 tensores Q8_0 |
| Parametros totales | 8.953.803.264 (modelo base, safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_0 (mapa de tipos de unsloth con Q5_K convertidos a Q4_0) + 5 tensores elevados a Q8_0 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero unico Qwen3.5-9B-fraQtl-NPU-Q4_0.gguf) |
| Tamano del fichero | 5.375.223.008 bytes (~5,4 GB) |
| sha256 | 36399979a37c130cd1b5f2959b189cc1b3fd9f1a71c794d02229d3c7394a1024 |
| Backend objetivo | llama.cpp Hexagon (NPU Snapdragon); tambien CPU/GPU |
| Modelo base | Qwen/Qwen3.5-9B |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer denso de unos 9B parámetros; la model card no detalla la composición del dataset de preentrenamiento, el número de tokens ni si hubo RLHF o DPO, por lo que esos datos no están disponibles en la información proporcionada. Lo que sí documenta el autor es el proceso de cuantización, que es el núcleo técnico de esta publicación.

El método de cuantización consta de tres pasos. Primero, redondeo GPTQ ponderado por Hessiano en lugar de round-to-nearest, con una importance matrix construida a partir de una mezcla de calibración propia de conversaciones de chat y tool-use renderizadas con la plantilla de chat de Qwen. Segundo, se parte del mapa de tipos de unsloth Q4_0, pero se convierten sus tensores Q5_K a Q4_0 para que todas las matmuls sean soportadas por la NPU Hexagon, y se elevan 5 tensores a Q8_0 seleccionados por error medido por tensor, todo dentro del presupuesto de bytes de unsloth. Tercero, se verifica que cada tipo de matmul es compatible con Hexagon y que el fichero carga en llama.cpp estándar. No hay innovaciones de arquitectura propias (no hay decodificación especulativa ni attention linear añadidos); la innovación es exclusivamente de cuantización.

## Capacidades

- Generación de texto conversacional en formato chat, usando la plantilla de chat de Qwen.
- Tool calling / function calling: evaluado específicamente en BFCL v4 live, incluyendo llamadas simples, múltiples, paralelas y paralelas-múltiples, además de irrelevancia (saber cuándo no llamar) y relevancia.
- Razonamiento y conocimiento general: evaluado en MMLU-Pro (12.032 preguntas).
- Razonamiento matemático: evaluado en GSM8K (1.319 problemas).
- Seguimiento de instrucciones: evaluado en IFEval strict (541 prompts).
- Generación de código: evaluado en EvalPlus (563 problemas).
- Modo thinking: las evaluaciones se hicieron con thinking off, lo que implica que el modelo base soporta un modo de razonamiento explícito, aunque esta ficha no aporta métricas con thinking activado.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión y audio: no disponibles; la model card indica explícitamente "Text model only".

## Casos de uso

- Asistentes de voz o chat en dispositivo móvil: el fichero está optimizado para la NPU Hexagon de Snapdragon 8 Elite Gen 6 y decodifica a ~15,3 tok/s con prefill de ~1.031 tok/s en ese hardware, lo que permite asistentes conversacionales locales sin conexión y sin enviar datos a la nube.
- Agentes de tool calling en aplicaciones móviles: la mejora medida en BFCL v4 live (1.721 frente a 1.685 de unsloth Q4_0, con +39 en "saber cuándo no llamar") lo hace adecuado para asistentes que deben decidir cuándo invocar APIs del sistema (calendario, contactos, mapas) y cuándo responder directamente.
- Automatización de atención al cliente en el borde: al ejecutarse en llama.cpp estándar y caber en ~5,4 GB, puede desplegarse en servidores modestos o en dispositivos con CPU/GPU sin NPU, gestionando conversaciones multi-turno; la longitud de contexto no está documentada, así que conviene validarla antes de asumir ventanas largas.
- Sustitución de cuantizaciones Q4_0 genéricas en pipelines existentes: al ser un GGUF compatible con llama.cpp stock y con el mismo tamaño que el Q4_0 de unsloth, se puede intercambiar el fichero sin cambiar el código de despliegue y obtener mejoras de +1,15 pt en MMLU-Pro y +36 en BFCL total según la model card.
- Evaluación de cuantizaciones en investigación: el repositorio documenta metodología reproducible (GPTQ Hessiano, importance matrix propia, selección de tensores Q8_0 por error medido) y comparaciones pareadas con corrección de Holm, lo que lo convierte en un caso de estudio útil para quienes investigan el impacto de la cuantización en tool calling.
- Prototipado de agentes multi-paso en local: al soportar llamadas paralelas y múltiples en BFCL, sirve para construir flujos de agente que encadenan varias herramientas en un solo turno, con la ventaja de ejecutarse en hardware de consumo.
- Despliegue en CI/CD para pruebas de regresión de modelos: el fichero único con sha256 publicado y el mismo rendimiento que el comparador permiten usarlo como referencia estable en tests automatizados de calidad de tool calling.

## Benchmarks y rendimiento

Datos publicados en la model card. Thinking off, greedy, misma ejecución para todos los ficheros.

| Benchmark | fraQtl NPU Q4_0 | unsloth Q4_0 | Diferencia (Holm p) |
|---|---|---|---|
| BFCL v4 live (2.251) | 1.721 | 1.685 | +36 [+15,2] (una cola 95 %) |
| MMLU-Pro (12.032) | 6.303 | 6.165 | +1,15 pt (0,001) |
| GSM8K (1.319) | 1.249 | 1.232 | +1,29 pt (0,13) |
| IFEval strict (541) | 453 | 455 | −0,37 pt (1,0) |
| EvalPlus (563) | 366 | 355 | +1,95 pt (1,0) |

Desglose BFCL v4 live:

| Fichero | Bytes | Total | Tool calls | Sabe cuándo no llamar | Respuestas correctas rotas vs original |
|---|---|---|---|---|---|
| Original bf16 (Qwen/Qwen3.5-9B) | no disponible | 1.761 | 1.062 | 686 | — |
| unsloth Q4_0 | 5.379.417.312 | 1.685 | 1.076 | 594 | 141 |
| fraQtl NPU Q4_0 | 5.375.223.008 | 1.721 | 1.074 | 633 | 88 |

Ablación de los 5 tensores Q8_0:

| Fichero | Bytes | Respuestas MMLU-Pro cambiadas vs original | MMLU-Pro correctas | BFCL live total |
|---|---|---|---|---|
| Sin los lifts | 5.329.085.664 | 2.201 | 6.264 | 1.713 |
| Con los lifts (este fichero) | 5.375.223.008 | 2.092 | 6.303 | 1.721 |

Rendimiento en dispositivo (Snapdragon 8 Elite Gen 6, SM8975, llama.cpp Hexagon, media de dos ejecuciones):

| Fichero | Decode tok/s (tg128) | Prefill tok/s (pp512) | Operaciones rechazadas por la NPU |
|---|---|---|---|
| unsloth Q4_0 | 15,24 | 1.029 | 0 |
| fraQtl NPU Q4_0 | 15,33 | 1.031 | 0 |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~5,4 GB para el fichero Q4_0 completo; el modelo base en bf16 requiere aproximadamente 18 GB.
- GPU recomendadas: no especificadas en la model card; el fichero funciona en CPU y GPU mediante llama.cpp estándar, y el backend objetivo es la NPU Hexagon de Snapdragon 8 Elite Gen 6 (SM8975).
- Cabe en GPU de consumo: sí, por tamaño (~5,4 GB), en tarjetas con 8 GB o más de VRAM; no hay mediciones publicadas de throughput en GPU en la información disponible.
- Opciones de despliegue: llama.cpp (stock), backend Hexagon de llama.cpp para NPU Snapdragon; Ollama y vLLM no están confirmados en la información proporcionada.
- Latencia y throughput medidos: 15,33 tok/s de decodificación y 1.031 tok/s de prefill en Snapdragon 8 Elite Gen 6, idénticos dentro del ruido a la cuantización de unsloth.
- Memoria: el autor indica "same speed, same memory" respecto al comparador de unsloth.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | BFCL v4 live | MMLU-Pro | Tamaño |
|---|---|---|---|---|---|---|---|
| fraQtl Qwen3.5-9B NPU Q4_0 | 8,95B | no disponible | GGUF Q4_0 + 5×Q8_0 | Apache 2.0 | 1.721 | 6.303 | 5,375 GB |
| unsloth Qwen3.5-9B Q4_0 | 8,95B | no disponible | GGUF Q4_0 + Q5_K | Apache 2.0 | 1.685 | 6.165 | 5,379 GB |
| Qwen3.5-9B bf16 (original) | 8,95B | no disponible | safetensors bf16 | Apache 2.0 | 1.761 | 6.434 | no disponible |

La comparación con otras familias de modelos del mismo tamaño (por ejemplo, Llama 3.1 8B o Mistral 7B) no está disponible en la información proporcionada, y no se han publicado resultados cruzados con ellos en la model card.

## Limitaciones y advertencias

- Modelo solo de texto: la model card indica explícitamente "Text model only"; no hay visión ni audio.
- Longitud de contexto no documentada: no se puede asumir una ventana concreta sin consultar la ficha del modelo base Qwen/Qwen3.5-9B.
- Idiomas soportados no documentados: la lista de idiomas no está disponible en la información proporcionada.
- Pérdida de calidad frente al bf16 original: en MMLU-Pro el original obtiene 6.434 frente a 6.303 de esta cuantización, y en BFCL 1.761 frente a 1.721; la cuantización Q4_0 sigue degradando el rendimiento respecto al modelo completo.
- Riesgo de alucinación: inherente al modelo base; no hay evaluación específica de factualidad en la información proporcionada.
- Sesgos: no se documentan sesgos conocidos en la model card; deben evaluarse según el caso de uso.
- Resultados con thinking off: todas las métricas publicadas son con el modo de razonamiento desactivado; el rendimiento con thinking activado no está medido.
- Naturaleza de la publicación: es una cuantización de un tercero (fraQtl), no una versión oficial de Qwen; la reproducibilidad depende de la metodología descrita, que el autor documenta pero no publica como scripts en la información disponible.
- Compatibilidad: el fichero está pensado para el backend Hexagon de llama.cpp; en otras plataformas funciona, pero las ventajas de tool calling medidas son independientes del backend y el rendimiento en NPU solo se ha verificado en Snapdragon 8 Elite Gen 6.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B, que también es Apache 2.0 según los tags.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fraQtl/Qwen3.5-9B-NPU-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Cuantización comparadora de unsloth: https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- Imagen de portada: https://huggingface.co/fraQtl/Qwen3.5-9B-NPU-GGUF/resolve/main/Qwen3.5-9B-NPU-GGUF.png
- llama.cpp (formato GGUF y backend Hexagon): https://github.com/ggml-org/llama.cpp
- Paper de GPTQ (Frantar et al., 2022): https://arxiv.org/abs/2210.17323
- BFCL (Berkeley Function Calling Leaderboard): https://gorilla.cs.berkeley.edu/leaderboard.html
- MMLU-Pro: https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro
