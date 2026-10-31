# hsam007/Nanbeige4.3-33B-NVFP4

## Resumen

Nanbeige4.3-33B-NVFP4 es una cuantización comunitaria del modelo Nanbeige4.3-33B, publicada por el usuario hsam007 en Hugging Face. Se trata de una versión optimizada para inferencia que emplea el formato NVFP4 (pesos y activaciones en punto flotante de 4 bits, W4A4) mediante NVIDIA Model Optimizer 0.47.0, reduciendo el tamaño de los pesos del modelo base desde 66,24 GB en BF16 hasta 22,07 GB, aproximadamente un tercio del original.

El modelo base, Nanbeige4.3-33B, es un modelo de generación de texto conversacional desarrollado por Nanbeige, con arquitectura LlamaForCausalLM y unos 33,12 mil millones de parámetros. La cuantización NVFP4 permite ejecutar el modelo en hardware con menos memoria, manteniendo la calidad del modelo original en gran medida, y está diseñado específicamente para su uso con vLLM sobre GPUs NVIDIA de la generación Blackwell, que cuentan con soporte nativo para el formato FP4.

Este checkpoint es relevante porque demuestra el flujo de trabajo de cuantización NVFP4 en vLLM con kernels optimizados (CutlassNvFp4LinearKernel), ofreciendo resultados de rendimiento medidos (hasta 66,3 tokens/s en decodificación de un solo flujo con el paquete de kernels optimizado) y evaluaciones independientes en benchmarks de razonamiento matemático y científico como AIME 2026 y GPQA Diamond.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder) |
| Parametros totales | 33,12B (modelo base); 17.756.290.048 según metadatos de safetensors del checkpoint cuantizado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4) en proyecciones lineales de atención y MLP; escalas de bloque FP8 E4M3 y escalas globales FP32; embeddings, lm_head y normalizaciones en mayor precisión |
| Idiomas soportados | inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (5 shards, 22,07 GB en total) |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura LlamaForCausalLM, es decir, un transformer decoder estándar con aproximadamente 33,12 mil millones de parámetros. No se dispone de información publicada sobre el número de tokens de preentrenamiento ni la composición detallada del dataset del modelo original.

La cuantización NVFP4 se aplicó mediante post-training quantization con NVIDIA Model Optimizer 0.47.0, sin fine-tuning ni actualizaciones de gradiente. Se cuantizaron las proyecciones lineales de atención y MLP (W4A4) con un tamaño de grupo de 16, empleando escalas de bloque FP8 E4M3 y escalas globales FP32. Los embeddings de tokens, la cabeza de salida (lm_head) y los parámetros de normalización se mantienen en mayor precisión. La caché KV no está cuantizada en este checkpoint. La calibración utilizó 1.024 ejemplos (412.992 tokens, longitud máxima de secuencia de 2.048 tokens) procedentes de tres fuentes: CodeAlpaca 20K (512 ejemplos de código), UltraChat 200k (256 ejemplos de conversación general) y MMLU (256 ejemplos de ciencia, matemáticas, humanidades, negocios y medicina), con revisiones de datasets fijadas y semilla 42.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento matemático avanzado: 93,33 % de precisión en AIME 2026 con thinking mode habilitado y respuestas enteras exactas.
- Razonamiento científico a nivel de experto: 88,37 % en GPQA Diamond (ejecución parcial) con chain-of-thought.
- Modo de pensamiento (thinking mode): el protocolo de evaluación emplea `enable_thinking=true` y `preserve_thinking=true`, lo que indica soporte de razonamiento extendido antes de la respuesta final.
- Generación de código: la calibración incluyó instrucciones de programación (CodeAlpaca), lo que sugiere capacidad orientada a tareas de código.
- Soporte de tool calling: no disponible en la información proporcionada.
- Capacidades de agentes: no disponible en la información proporcionada.
- Ventanas de contexto largas: el presupuesto de salida usado en evaluaciones alcanzó 262.144 tokens, aunque la longitud de contexto oficial no está publicada en la información disponible.

## Casos de uso

- Razonamiento matemático y resolución de problemas de competición: el 93,33 % en AIME 2026 con thinking mode lo hace adecuado para asistentes de matemáticas avanzadas, verificación de soluciones y generación de demostraciones paso a paso.
- Asistencia científica y técnica de alto nivel: su resultado en GPQA Diamond indica capacidad para responder preguntas a nivel de doctorado en física, química y biología, útil para investigación y revisión de literatura.
- Chatbots conversacionales bilingües: entrenado/calibrado para inglés y chino, puede servir como base de asistentes conversacionales en ambos idiomas.
- Inferencia local en estaciones de trabajo con GPU de gama alta: con 22,07 GB de pesos, cabe en GPUs de 24 GB o más en configuraciones de un solo dispositivo, permitiendo despliegues privados sin depender de la nube.
- Servicios de inferencia de alto rendimiento: el kernel optimizado alcanza 66,3 tokens/s en decodificación de un solo flujo sobre una RTX PRO 6000 Blackwell, adecuado para aplicaciones interactivas de baja latencia.
- Experimentación con cuantización FP4: al ser un checkpoint comunitario documentado con detalle (receta, calibración, protocolos de evaluación), es un buen punto de partida para investigar el impacto de NVFP4 en calidad y rendimiento con vLLM.
- Generación de código asistida: la inclusión de CodeAlpaca en la calibración y la naturaleza del modelo base lo hacen utilizable en asistentes de programación, aunque no se han publicado benchmarks específicos de código.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluaciones independientes del checkpoint NVFP4):

| Benchmark | Resultado | Notas |
|---|---:|---|
| AIME 2026 | 93,33 % (28/30) | Zero-shot, thinking mode, temperatura 0,6, top-p 0,95, presupuesto de salida de 262.144 tokens por problema |
| GPQA Diamond | 88,37 % | Ejecución parcial (no completó el dataset completo); respuestas sin opción final parseable contadas como incorrectas |
| Decodificación (1 flujo) | 66,3 tokens/s | RTX PRO 6000 Blackwell Server Edition con kernel optimizado; 47,8 tokens/s sin el kernel ajustado |

Advertencias de los propios autores: no existe todavía una ejecución BF16 emparejada de AIME, por lo que el resultado no debe usarse para calcular un porcentaje de retención de precisión respecto al modelo base. Tampoco se han publicado métricas completas de calidad adicionales (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM para inferencia: los pesos ocupan 22,07 GB; con overhead de activaciones, KV cache y contexto, se recomienda una GPU con al menos 24-32 GB de VRAM. La configuración de referencia usa una GPU de 96 GB.
- GPU de referencia: NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB), que dispone de soporte nativo para el formato NVFP4 mediante el kernel CutlassNvFp4LinearKernel.
- GPUs consumer: el modelo puede ejecutarse en GPUs consumer con 24 GB o más (por ejemplo RTX 4090) siempre que el stack soporte FP4; el rendimiento óptimo está documentado solo en hardware Blackwell. No hay datos publicados para otras GPUs.
- Despliegue: vLLM (versión probada: 0.32.0) es la librería de referencia. No hay información sobre compatibilidad con llama.cpp, Ollama o TGI.
- Latencia y throughput: 47,8 tokens/s en decodificación de un solo flujo con vLLM NVFP4 sin ajustar, y 66,3 tokens/s con el paquete de kernels optimizado (aproximadamente 1,4x más rápido) sobre una RTX PRO 6000 Blackwell. TTFT emparejado BF16/NVFP4 se menciona como disponible, pero los valores concretos no están en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-NVFP4 | 33,12B (base) | NVFP4 W4A4 | no disponible | Apache 2.0 | Hugging Face (hsam007) |
| Nanbeige/Nanbeige4.3-33B (base) | 33,12B | BF16 (66,24 GB) | no disponible | no disponible | Hugging Face (Nanbeige) |
| Llama 3.1 8B / 70B (referencia de categoria) | 8B / 70B | BF16 y variantes | 128K | Licencia Llama 3.1 | Hugging Face (Meta) |

La comparativa es orientativa: no se han publicado benchmarks comparativos directos entre este checkpoint y otros modelos de tamaño similar, por lo que no es posible contrastar rendimiento en igualdad de condiciones.

## Limitaciones y advertencias

- Los resultados de AIME 2026 y GPQA Diamond son evaluaciones independientes del cuantizador, no del editor original; GPQA Diamond es además una ejecución parcial, por lo que no debe interpretarse como una puntuación completa del dataset.
- No existe todavía una comparación BF16 emparejada para AIME, de modo que la pérdida de precisión por la cuantización NVFP4 no está cuantificada.
- La caché KV no está cuantizada, lo que incrementa el consumo de memoria en contextos largos.
- El soporte nativo de NVFP4 está orientado a GPUs NVIDIA Blackwell; en hardware anterior el rendimiento y la compatibilidad no están documentados.
- Idiomas limitados a inglés y chino; no hay información sobre rendimiento en otros idiomas, incluido el castellano.
- El checkpoint procede de un autor comunitario (hsam007) con muy pocas descargas y un solo like, por lo que carece de validación comunitaria amplia.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes, aunque la licencia del modelo base debería verificarse para despliegues en producción.
- No hay información sobre sesgos conocidos, riesgos de alucinación específicos ni soporte de tool calling.

## Enlaces

- Checkpoint cuantizado: https://huggingface.co/hsam007/Nanbeige4.3-33B-NVFP4
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Autor de la cuantización: https://huggingface.co/hsam007
- Dataset de calibración CodeAlpaca 20K: https://huggingface.co/datasets/HuggingFaceH4/CodeAlpaca_20K
- Dataset de calibración UltraChat 200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset de calibración MMLU: https://huggingface.co/datasets/cais/mmlu
- Dataset de evaluación AIME 2026: https://huggingface.co/datasets/MathArena/aime_2026
- Dataset GPQA Diamond (simple-evals de OpenAI): https://openaipublic.blob.core.windows.net/simple-evals/gpqa_diamond.csv
- Instrucciones del paquete de kernels optimizado: https://huggingface.co/hsam007/Nanbeige4.3-33B-NVFP4/blob/main/kernels/INSTALL.md
