# aisingapore/Qwen-SEA-LION-v5-9B-INT4

## Resumen

Qwen-SEA-LION-v5-9B-INT4 es la variante cuantizada a 4 bits del modelo Qwen-SEA-LION-v5-9B, desarrollado por el pilar de productos de inteligencia artificial de AI Singapore (AISG) y financiado por el National Research Foundation de Singapur. Forma parte de la familia SEA-LION (Southeast Asian Languages In One Network), una colección de modelos diseñada específicamente para cubrir las lenguas del sudeste asiático, una región tradicionalmente infrarrepresentada en los grandes modelos fundacionales. El modelo parte de la arquitectura Qwen 3.5 de 9B parámetros y añade un encoder visual, por lo que es multimodal (entrada de imagen y texto, salida de texto).

La relevancia de esta versión INT4 es fundamentalmente práctica: reduce el peso de los pesos de 19,3 GB (BF16) a 10,0 GB, lo que permite desplegarlo en GPUs de gama alta para consumidores y en nodos de inferencia más modestos sin renunciar a la ventana de contexto de 262.144 tokens. La cuantización se aplica solo a las capas lineales, manteniendo en BF16 la atención, el encoder visual y la cabeza de predicción multi-token (MTP), una decisión de diseño orientada a preservar la calidad en las partes más sensibles del modelo.

Con licencia MIT, soporte para nueve idiomas (incluidos birmano, tamil, tailandés y vietnamita, además de inglés y chino) y compatibilidad con vLLM y SGLang, el modelo se posiciona como una opción atractiva para aplicaciones de producción en la región ASEAN que necesiten razonamiento, tool calling y comprensión de imágenes con un coste de hardware contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder visual (familia Qwen 3.5), capas lineales cuantizadas con GPTQ |
| Parametros totales | 9.409.813.744 (9,41 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | INT4 (GPTQ simétrico, group size 32) en capas lineales; atención, encoder visual y cabeza MTP en BF16. Existen variantes BF16, FP8 y GGUF del modelo base |
| Idiomas soportados | en, zh, my (birmano), id (indonesio), fil (filipino), ms (malayo), ta (tamil), th (tailandés), vi (vietnamita) |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), librería transformers |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 9,41 B parámetros que incorpora un encoder visual para aceptar entradas de imagen y texto (pipeline image-text-to-text). Sobre la base Qwen 3.5, AI Singapore aplica un ajuste orientado a las lenguas del sudeste asiático; la model card no detalla el volumen de tokens de entrenamiento ni la composición exacta del dataset, por lo que esos datos deben considerarse no disponibles. La cuantización se realizó con llm-compressor (proyecto de vLLM) mediante GPTQ simétrico con group size 32, calibrado sobre datos de instrucciones del sudeste asiático para minimizar la degradación en los idiomas objetivo.

La innovación técnica más destacable de esta variante es la cuantización selectiva: solo las capas lineales se reducen a 4 bits, mientras que las capas de self-attention, el encoder visual y la cabeza de predicción multi-token (MTP) permanecen en BF16. Esto conserva la fidelidad de la atención y de la generación especulativa asociada al MTP, que acelera la decodificación. El tokenizador y la plantilla de chat son idénticos a los del modelo base, lo que facilita la migración entre versiones. La model card no especifica si hubo RLHF o DPO en el entrenamiento del modelo base.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento (thinking) activado por defecto y desactivable mediante `enable_thinking: False`.
- Comprensión de imágenes (image-text-to-text) gracias al encoder visual integrado.
- Tool calling / function calling, con parsers específicos para vLLM (`qwen3_coder`) y SGLang.
- Soporte de agentes y razonamiento multi-paso, con exposición del contenido de razonamiento (`reasoning` / `reasoning_content`).
- Capacidades multilingües en nueve idiomas: inglés, chino, birmano, indonesio, filipino, malayo, tamil, tailandés y vietnamita.
- Predicción multi-token (MTP) para decodificación especulativa y mayor throughput.
- Contexto largo de 262.144 tokens para documentos extensos y conversaciones prolongadas.
- Compatibilidad con la API de OpenAI a través de vLLM y SGLang.

## Casos de uso

- Atención al cliente en lenguas del sudeste asiático: el modelo puede gestionar conversaciones multi-turno en indonesio, malayo, tailandés o vietnamita con hasta 262.144 tokens de contexto, lo que permite arrastrar historiales largos y documentación de producto sin truncar.
- Tramitación documental con imágenes: al aceptar entradas image-text-to-text, puede extraer datos de facturas, formularios aduaneros o albaranes escaneados y responder en el idioma del usuario, útil en logística y comercio exterior en la región ASEAN.
- Asistentes de código y automatización de pipelines: el soporte de tool calling y los parsers de vLLM/SGLang permiten integrarlo en flujos de CI/CD o en asistentes que invocan APIs internas (por ejemplo, consultas a sistemas de inventario o despliegues).
- Análisis de documentos legales o regulatorios multilingües: con contexto de 262k tokens puede procesar contratos o normativas completas en inglés, chino y lenguas locales, resumiendo y comparando cláusulas.
- Agentes de investigación multi-paso: el modo thinking y el razonamiento expuesto facilitan tareas de planificación y verificación que requieren varios pasos intermedios, con trazabilidad del razonamiento.
- Despliegue en infraestructura con VRAM limitada: al ocupar 10,0 GB en INT4, cabe en GPUs de consumo alto (por ejemplo, RTX 4090 de 24 GB) y permite servir varias instancias o contextos largos en un solo nodo, reduciendo coste frente a la versión BF16.
- Educación y traducción asistida: cubre nueve idiomas con especial énfasis en lenguas minorizadas (birmano, tamil, filipino), adecuado para herramientas de aprendizaje o traducción en contextos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10,0 GB solo para pesos en INT4; con overhead de KV cache y contexto largo, se recomienda al menos 16-24 GB para contextos moderados y más para aprovechar los 262.144 tokens.
- GPUs recomendadas: A100 (40/80 GB), H100 (80 GB) para serving de alta concurrencia y contextos máximos; L40S o A10G para despliegues intermedios.
- GPU de consumo: cabe en RTX 4090 (24 GB) y en RTX 3090 (24 GB); en GPUs de 16 GB el margen para contexto es ajustado.
- Opciones de despliegue: vLLM (`vllm serve` con `--reasoning-parser qwen3` y `--tool-call-parser qwen3_coder`), SGLang (`sglang serve`), y la variante GGUF del modelo base para llama.cpp/Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; la cabeza MTP en BF16 está pensada para decodificación especulativa y mejora del throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-SEA-LION-v5-9B-INT4 (este) | 9,41 B | 262.144 | Texto + imagen | MIT | Hugging Face (INT4, BF16, FP8, GGUF) |
| Qwen-SEA-LION-v5-9B (BF16) | 9,41 B | 262.144 | Texto + imagen | MIT | Hugging Face; 19,3 GB de pesos |
| Qwen 3.5 9B (base) | no disponible en la información | no disponible en la información | Texto + imagen | no disponible en la información | Hugging Face |
| Qwen-SEA-LION-v5-9B-FP8 | 9,41 B | 262.144 | Texto + imagen | MIT | Hugging Face |

La comparación con alternativas de otros fabricantes no puede completarse con los datos proporcionados; la referencia más directa es la propia familia SEA-LION v5, donde la versión INT4 ofrece el menor peso (10,0 GB frente a 19,3 GB en BF16) manteniendo contexto y modalidad.

## Limitaciones y advertencias

- El modelo no ha sido alineado para seguridad; los desarrolladores deben aplicar su propio fine-tuning de seguridad y medidas de control.
- Riesgo de alucinación inherente a los modelos de 9B parámetros, especialmente en tareas de razonamiento complejo o dominios especializados.
- La cuantización INT4 puede introducir degradación sutil en precisión respecto a BF16, aunque se mitiga calibrando sobre datos del sudeste asiático; conviene validar en el dominio de uso.
- Cobertura idiomática limitada a los nueve idiomas declarados; el rendimiento en otras lenguas no está garantizado.
- La model card no documenta sesgos conocidos ni composición del dataset de entrenamiento, lo que dificulta auditar riesgos.
- Aunque la licencia es MIT, los autores declinan toda responsabilidad por daños derivados del uso de los pesos.
- Para aprovechar el contexto completo de 262.144 tokens se requiere hardware con VRAM abundante; en GPUs de consumo el contexto práctico será menor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-9B-INT4
- Modelo base BF16: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-9B
- Variante FP8: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-9B-FP8
- Variante GGUF: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-9B-GGUF
- Colección SEA-LION v5: https://huggingface.co/collections/aisingapore/sea-lion-v5
- Sitio de SEA-LION: https://sea-lion.ai
- Licencia MIT: https://mit-license.org/
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Modelo Qwen 3.5 9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Receta de vLLM para Qwen3.5-9B: https://recipes.vllm.ai/Qwen/Qwen3.5-9B
- Cookbook de SGLang para Qwen3.5: https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.5
