# nace-ai/Qwen3.6-35B-A3B-MLX-Q5

## Resumen

Qwen3.6-35B-A3B-MLX-Q5 es una cuantización de 5 bits en formato MLX del modelo Qwen/Qwen3.6-35B-A3B, publicada por Nace.AI. El modelo base es un transformer MoE (mixture of experts) de Qwen con 35.107.181.936 parámetros totales y capacidad multimodal image-text-to-text, orientado a generación de texto, razonamiento, código y tool calling. Esta versión concreta está pensada para ejecutarse en Macs con Apple Silicon mediante la librería MLX.

El pack ocupa 23,0 GB en total, de los cuales 22,07 GB corresponden a los pesos del modelo de lenguaje a una media de 5,094 bits por peso. Incluye una torre de visión de 893.142.496 bytes (333 tensores) tomada del pack mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit. La calidad se reporta como divergencia KL respecto al modelo en bf16: 0,0271 sobre texto original y 0,0681 sobre texto de chat y tool calls.

Su relevancia actual reside en que permite desplegar localmente un MoE de 35B en hardware de consumo Apple con una pérdida de calidad medida y documentada, manteniendo licencia Apache 2.0 y soporte de tool calling. El modelo piensa antes de responder por defecto (modo thinking), lo que condiciona los parámetros de muestreo recomendados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer multimodal (image-text-to-text), tipo qwen3_5_moe |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits MLX (5,094 bits por peso de media); el tag del repo indica tambien 4-bit por la torre de vision heredada |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), 6 archivos, 22.961.646.328 bytes |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con arquitectura de mezcla de expertos (MoE), según el tag `qwen3_5_moe`, y pipeline multimodal image-text-to-text. Esta publicación es únicamente una cuantización: no se ha reentrenado ni ajustado el modelo, sino que se han recomprimido los pesos del modelo base Qwen/Qwen3.6-35B-A3B mediante el proceso de cuantización propio de Nace.AI, que ajusta cada grupo de pesos contra el comportamiento del modelo sobre texto real y no solo contra los valores de los pesos. El resultado es un pack MLX estándar, sin formato nuevo ni dependencias adicionales.

Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada. La cuantización se validó con una ejecución de control sobre GPU NVIDIA H200 (151 GB) con mlx 0.32.4, mlx-lm 0.32.2, transformers 5.22.2 y numpy 2.5.4. La torre de visión se tomó del pack mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit, fijada a esa versión concreta.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo thinking activado por defecto: el modelo genera un razonamiento interno antes de la respuesta final.
- Tool calling / function calling: en la prueba de control, 20 de 20 ensayos con thinking desactivado colocaron la llamada y completaron el ciclo completo.
- Procesamiento de imagen y texto (image-text-to-text) mediante la torre de visión incluida.
- Capacidades de código, según los parámetros de muestreo recomendados para "precise coding" en la model card.
- Soporte de agentes y razonamiento multi-paso, implícito en el soporte de tool calling y el modo thinking.
- Capacidades multilingües: el modelo declara únicamente inglés (`en`); no se documentan otros idiomas.

## Casos de uso

- Asistente de código local en Mac: con modo thinking y los ajustes de "precise coding" (temperature 0.6, top_p 0.95, top_k 20), el modelo puede integrarse en editores o terminales sobre Apple Silicon sin depender de la nube, aprovechando los 22,07 GB de pesos que caben en Macs de gama alta.
- Automatización de tool calling en pipelines: los 20/20 ensayos de llamada completados con thinking desactivado lo hacen adecuado para orquestadores de agentes que necesitan invocar funciones de forma fiable, con temperature 0.7, top_p 0.8, top_k 20 y presence_penalty 1.5.
- Análisis de documentos con imagen: al ser image-text-to-text, puede procesar capturas, diagramas o páginas escaneadas junto con instrucciones textuales en flujos de extracción de información.
- Razonamiento multi-paso con contexto largo de salida: la model card recomienda hasta 32.768 tokens de salida con thinking activado, lo que permite tareas de análisis extenso, resúmenes largos o generación de informes estructurados.
- Prototipado e investigación en local: investigadores que necesitan evaluar un MoE de 35B en hardware Apple pueden usar este pack sin infraestructura de GPU, con una divergencia KL medida respecto a bf16 (0,0271 en texto original).
- Desarrollo de agentes conversacionales en inglés: el soporte declarado es solo inglés, por lo que encaja en productos orientados a ese idioma que requieran conversación multi-turno con llamadas a herramientas.

## Benchmarks y rendimiento

| Prueba | Nace Q5 (este repo) | Tokens evaluados |
|---|---:|---:|
| KL respecto a bf16, texto original (menor es mejor) | 0,0271 | 32.704 |
| KL respecto a bf16, texto de chat y tool calls (menor es mejor) | 0,0681 | 65.472 |
| Ensayos de tool calling con thinking desactivado completados | 20 de 20 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card indica que este pack se evaluó con IDs de token distintos a los de otros packs, por lo que no se reclama una ganancia emparejada frente a ellos; la comparación emparejada la aporta el pack hermano Q4.

## Requisitos de hardware

- VRAM/unified memory estimada: 23,0 GB de archivos en disco; los pesos del modelo de lenguaje son 22,07 GB, por lo que se necesita al menos esa cantidad de memoria unificada más el espacio para el contexto y el runtime.
- Hardware objetivo: Apple Silicon con MLX (mlx 0.32.4, mlx-lm 0.32.2). No está pensado para GPU NVIDIA ni CUDA.
- Cabe en Macs con 32 GB de memoria unificada o superior; con 24 GB el margen es muy ajustado y probablemente insuficiente para contextos largos.
- Despliegue: librería MLX / mlx-lm. No se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este pack.
- Latencia y throughput: no disponibles en la información proporcionada. La model card señala que los comandos de inicio rápido para este pack aún se están probando.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nace Q5 (este repo) | 35.107.181.936 | no disponible | 5 bits MLX, 22,07 GB de pesos LM | apache-2.0 | MLX, Apple Silicon |
| Nace Q4 (nace-ai/Qwen3.6-35B-A3B-MLX) | mismo modelo base | no disponible | 4 bits MLX | apache-2.0 | MLX, Apple Silicon |
| mlx-community 4-bit (Qwen3.6-35B-A3B) | mismo modelo base | no disponible | 4 bits MLX | apache-2.0 | MLX, Apple Silicon |
| unsloth UD-3bit / UD-4bit (Qwen3.6-35B-A3B) | mismo modelo base | no disponible | 3 y 4 bits | apache-2.0 | no disponible en detalle |

Los cuatro packs comparados derivan del mismo modelo base Qwen/Qwen3.6-35B-A3B, por lo que comparten arquitectura y parámetros. La diferencia está en el método de cuantización y el tamaño resultante; la model card sitúa a Nace Q4 y Q5 (rombos rojos) más cerca de bf16 que los packs públicos mlx-community 4-bit y unsloth UD-3bit/UD-4bit (puntos grises) en la gráfica de KL frente a tamaño, aunque para Q5 no se reclama ganancia emparejada por haberse evaluado con IDs de token distintos.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el uso en castellano u otros idiomas no está validado y puede degradar la calidad.
- El modelo piensa antes de responder por defecto, lo que incrementa los tokens generados y la latencia si no se desactiva el modo thinking.
- La model card advierte de que valores altos de presence_penalty pueden mezclar idiomas; se recomienda mantenerlo entre 0 y 2 y no tocar repetition_penalty (1.0).
- Riesgo de repetición infinita en generaciones largas, mitigado con presence_penalty; requiere dar margen de hasta 32.768 tokens de salida en modo thinking.
- Al ser una cuantización de 5 bits, existe una divergencia medible respecto a bf16 (KL 0,0271 en texto original y 0,0681 en chat/tool calls); no es equivalente al modelo completo.
- La torre de visión proviene de un pack de terceros (mlx-community OptiQ-4bit), no de una cuantización propia, y está fijada a esa versión.
- Los comandos de inicio rápido para este pack aún se están probando según la model card; la validación se hizo en H200, no en Apple Silicon, por lo que el rendimiento real en Mac no está documentado.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base deben respetarse igualmente.
- Solo 61 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy reducido.

## Enlaces

- Hugging Face: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX-Q5
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Pack hermano Q4: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX
- Subcarpeta Q5 del pack Q4: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX/tree/main/Q5
- Model card de referencia Qwen3.5-9B Q4: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX
- Torre de visión de origen: mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit (referenciada en la model card)
- Resultados de la ejecución de control: results.json (junto a la model card en el repo)
