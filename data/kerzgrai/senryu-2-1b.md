# KerzgrAI/Senryu-2-1B

## Resumen

Senryu-2-1B es un modelo de lenguaje causal de 1.094.961.660 parámetros (embeddings incluidos) desarrollado por KerzgrAI, un laboratorio del que este es el primer lanzamiento público. Es la primera implementación de la arquitectura Senryu-2 y sucede a Senryu (803M). Se distribuye con licencia Apache 2.0, únicamente en inglés y con pesos en safetensors bajo la librería propia `tiny_gdn`.

Su particularidad es la hibridación: 28 capas organizadas en 7 bloques de 3 capas de atención lineal Gated DeltaNet-2 más 1 capa de atención Parallax, a las que se suma una memoria de n-gramas hasheados de 2.166.398.464 parámetros que se consulta por lookup en lugar de mediante multiplicaciones de matrices. El modelo está afinado para chat, razonamiento con modo thinking conmutable y tool calling en formato Hermes JSON, con una ventana de contexto de 32.768 tokens.

El modelo no pasó por una fase de preentrenamiento: se entrenó desde pesos aleatorios directamente sobre una mezcla de datos de chat, razonamiento y uso de herramientas, 2.500 millones de tokens en 56 horas sobre una única GPU RTX PRO 6000 Blackwell. Es relevante ahora porque propone una alternativa a la escala bruta (memoria asociativa externa al transformer en lugar de más cómputo denso) y porque su receta de entrenamiento es reproducible en hardware de una sola tarjeta profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet-2 (atención lineal) + Parallax attention, con memoria de n-gramas hasheados tipo Engram |
| Parametros totales | 1.094.961.660 (núcleo, embeddings incluidos) + 2.166.398.464 parámetros de tablas de memoria n-gramas |
| Parametros activos | No aplica (no es MoE; la memoria se consulta por lookup, no se activa por matriz) |
| Longitud de contexto | 32.768 tokens (configurable en inferencia mediante `--context-length`, con descarte de los turnos más antiguos) |
| Tipos de cuantizacion | No disponible (no se publican pesos GGUF, AWQ ni GPTQ en la información proporcionada) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 6,5 GB) |

## Arquitectura y entrenamiento

El núcleo tiene 28 capas con dimensión oculta 1.536 y MLP SiTU-GLU de 3.584. Cada bloque intercala tres capas de Gated DeltaNet-2 (atención lineal con 12 cabezas de 128 dimensiones y una convolución corta) con una capa de atención Parallax (12 cabezas de query y 4 de KV de 128 dimensiones, RoPE aplicado sobre la mitad de cada cabeza con θ = 10⁶). El flujo residual es una corriente con cuatro ramas con compuerta de rango 128. Antes del primer bloque se lee la memoria de n-gramas de 2 y 3 gramos, con cuatro cabezas de hash por orden y una compuerta sensible al contexto por rama residual, siguiendo el esquema Engram. El vocabulario es BPE de 65.536 tokens con embeddings atados.

El entrenamiento partió de pesos aleatorios, sin etapa de preentrenamiento, sobre una mezcla completamente barajada de los datasets declarados en los metadatos (smoltalk2, Nemotron-Cascade-2-SFT-Data, Nemotron-Agentic-v1, OpenMathReasoning, OpenCodeReasoning, When2Call, Toucan-1.5M, Hermes-3-Dataset, glaive-function-calling-v2, WildChat-4.8M, Magicoder-Evol-Instruct-110K, oasst2, tulu-3-sft-personas, no_robots, entre otros). Se procesaron aproximadamente 2.500 millones de tokens con 16 secuencias de 32.768 tokens por paso, optimizador Muon v2 + AdamW a 5×10⁻⁴ y Adam disperso a 2.5×10⁻³ para las tablas de n-gramas, en 56 horas sobre una RTX PRO 6000 Blackwell. La configuración del run se conserva en `sft_config.json` dentro del repositorio.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con plantilla de chat propia basada en tokens de control.
- Modo thinking conmutable: cada turno del asistente empieza por `<|think|>` (cuerpo con `<think>…</think>` y después la respuesta) o por `<|no_think|>` (respuesta directa).
- Tool calling en formato Hermes JSON: los esquemas se declaran en un bloque `<tools>` del turno de sistema y las llamadas se emiten como `<tool_call>{"name": ..., "arguments": {...}}</tool_call>`.
- Herramientas integradas en el script de inferencia: `web-search`, `python` y `calculator`, más esquemas adicionales vía `--tools-json`.
- Recepción de observaciones de herramientas como turnos `tool` que comienzan por `<|tool_response|>`, lo que habilita bucles multi-paso.
- Razonamiento matemático y de código reforzado por datos de OpenMathReasoning, OpenCodeReasoning y Magicoder.
- Seguimiento de instrucciones y persona, entrenado con smoltalk, tulu-3-sft-personas y no_robots.
- Sin capacidades multimodales: no hay visión, audio ni entrada de imágenes en la información disponible.

## Casos de uso

- Agentes de tool calling en producción: el modelo emite llamadas JSON estructuradas y consume respuestas `<|tool_response|>`, por lo que puede encadenar búsqueda web, cálculo y ejecución de Python dentro de un bucle de agente sin formato adicional.
- Asistente de atención al cliente en inglés: con 32.768 tokens de contexto puede mantener conversaciones largas y arrastrar historial de tickets, y el modo `--no-think` reduce la latencia en respuestas rutinarias.
- Enrutado y parsing de intenciones: al ser un modelo de 1,09B parámetros, encaja como clasificador generativo o extractor de argumentos en un pipeline previo a un modelo mayor.
- Copiloto de código ligero: su entrenamiento con datos de razonamiento de código permite generar fragmentos, explicar funciones y producir llamadas a funciones en herramientas de CI/CD con el modo thinking activado.
- Tutoría de matemáticas paso a paso: el modo thinking expone la cadena de razonamiento en `<think>`, útil para aplicaciones educativas que quieran mostrar el desarrollo y no solo el resultado.
- Prototipado e investigación de arquitecturas híbridas: su implementación en Triton con `flash-linear-attention` sirve como banco de pruebas para comparar atención lineal más memoria n-gramas frente a transformers densos.
- Ejecución local con privacidad: al caber en una GPU de consumo, puede desplegarse en estaciones de trabajo donde los datos no deben salir del perímetro, manteniendo las tablas de n-gramas en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos del núcleo en bf16 ocupan aproximadamente 2,2 GB. Las tablas de n-gramas añaden unos 4,3 GB si se mantienen en GPU; el flag `--ngram-device cpu` libera exactamente esa cantidad, dejando el modelo en torno a 2,2 GB más caché KV y activaciones.
- GPU recomendadas: el autor entrenó y ejecuta el modelo en una RTX PRO 6000 Blackwell. Cualquier GPU CUDA con soporte Triton y al menos 8-12 GB de VRAM es suficiente en la práctica.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4060 Ti 16 GB o RTX 3090 (24 GB), especialmente con las tablas de n-gramas en CPU.
- Requisito obligatorio: CUDA. Gated DeltaNet-2 y Parallax corren sobre kernels Triton y el script instala `flash-linear-attention` desde git en un commit fijado; se necesita Git en el `PATH`.
- Opciones de despliegue: únicamente el script `inference.py` del repositorio con la librería `tiny_gdn`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible, ni se publican pesos cuantizados.
- Latencia y throughput: no disponibles.
- Parámetros de muestreo por defecto: temperatura 0,6 (0,3 recomendado para turnos de tool calling), top-p 0,95, top-k 50, penalización de repetición 1,08 sobre una ventana de 256 tokens y un máximo de 4.096 tokens nuevos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Senryu-2-1B | 1,09B núcleo + 2,17B de memoria n-gramas | 32.768 | Híbrida Gated DeltaNet-2 + Parallax + Engram | Apache 2.0 | Sin datos publicados |
| Llama 3.2 1B | 1,24B | 128.000 | Transformer denso | Llama 3.2 Community License | No evaluado en esta ficha |
| Qwen3-1.7B | 1,7B | 32.768 nativo | Transformer denso | Apache 2.0 | No evaluado en esta ficha |
| SmolLM2-1.7B | 1,7B | 8.192 | Transformer denso | Apache 2.0 | No evaluado en esta ficha |

La comparación directa de calidad no puede establecerse: Senryu-2-1B no publica resultados de MMLU, HumanEval ni GSM8K en la información disponible, y además carece de etapa de preentrenamiento, lo que lo sitúa en una categoría distinta (modelo de chat y agentes puro frente a modelos de propósito general). Su ventaja estructural es la memoria de n-gramas, que amplía la capacidad efectiva sin multiplicar el coste por token en FLOPs densos.

## Limitaciones y advertencias

- Solo inglés: no se declaran otros idiomas, por lo que el rendimiento en castellano no está garantizado ni evaluado.
- Ausencia de preentrenamiento: al no haber etapa de modelado de lenguaje a gran escala, el conocimiento factual del mundo es presumiblemente muy limitado y el riesgo de alucinación en preguntas abiertas es alto.
- Ventana de contexto de 32.768 tokens, inferior a la de modelos densos contemporáneos de tamaño similar, con descarte de los turnos más antiguos al superarla.
- La memoria de n-gramas usa hashing con cuatro cabezas por orden: pueden producirse colisiones de hash y recuperaciones espurias, un comportamiento difícil de auditar.
- Dependencia de un stack no estándar: `tiny_gdn` más `flash-linear-attention` desde un commit fijado de git, con CUDA y Triton obligatorios. No hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI, ni pesos cuantizados, lo que complica el despliegue en producción y en CPU.
- Licencia Apache 2.0: permisiva para uso comercial, pero el autor no ofrece garantías ni cláusulas de indemnización; conviene revisar los términos de los datasets de origen (por ejemplo, datos de terceros como Nemotron o WildChat) antes de un uso comercial a gran escala.
- Madurez muy baja: 0 descargas y 1 like en el momento de la ficha, publicación el 21 de octubre de 2026 y sin validación independiente de las capacidades declaradas.
- No apto para tareas multimodales ni para generación en idiomas distintos del inglés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KerzgrAI/Senryu-2-1B
- Demo Space (ZeroGPU): https://huggingface.co/spaces/KerzgrAI/senryu-2-1b-demo
- Organización KerzgrAI: https://huggingface.co/KerzgrAI
- Modelo predecesor Senryu (803M): https://huggingface.co/kerzgrr/Senryu
- Modelos etiquetados como senryu en HuggingFace: https://huggingface.co/models?other=senryu
- Referencias arXiv declaradas en los metadatos: arxiv.org/abs/2605.22791, arxiv.org/abs/2605.29157, arxiv.org/abs/2601.07372 (títulos no disponibles en la información proporcionada)
- Librería `flash-linear-attention` (dependencia de ejecución, instalada desde git en un commit fijado)
