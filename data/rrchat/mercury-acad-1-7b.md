# rrchat/Mercury-Acad-1.7B

## Resumen

Mercury-Acad-1.7B es un modelo experimental de pesos abiertos de tipo visión-lenguaje con capacidades de razonamiento STEM, código y uso de herramientas, publicado por el usuario rrchat en Hugging Face. Se trata de un fine-tune sobre LiquidAI/LFM3-VL-2B, un modelo compacto de Liquid AI que combina atención lineal con estado constante y convoluciones causales unidimensionales, junto con un codificador de visión SigLIP. El total de parámetros según los pesos en safetensors es de aproximadamente 1.918 millones (1,92 B).

Su propuesta de valor es desbloquear razonamiento paso a paso estructurado (trazas `<think>...</think>`) dentro de un presupuesto muy reducido de parámetros, con foco bilingüe en ruso e inglés, matemáticas, código y llamadas a funciones agénticas. Según los datos publicados por el autor, mejora el modelo base en HumanEval+ (+29,9 puntos), GSM8K (+9,6 puntos) y resuelve los problemas de truncamiento en modo thinking del modelo original. Es relevante como ejemplo de post-training eficiente en modelos pequeños edge/mobile, aunque es un modelo experimental con muy poca tracción (32 descargas y 1 like en el momento de la ficha) y sin respaldo de un laboratorio establecido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 híbrida: convoluciones causales 1D (k=7) + atención lineal autoatención con estado constante; codificador de visión SigLIP con adaptadores de proyección |
| Parametros totales | 1.918.181.888 (~1,92 B según safetensors) |
| Parametros activos | ~1,7 B (parámetros de lenguaje activos, según la model card; no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en este repo; existen pesos GGUF en el repo derivado rrchat/Mercury-Acad-1.7B-GGUF (cuantizaciones concretas no especificadas) |
| Idiomas soportados | Ruso e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (este repo); GGUF disponible en repo derivado |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura LFM3-VL de Liquid AI, un modelo híbrido no basado en transformer puro: sustituye parte de la autoatención clásica por convoluciones causales unidimensionales cortas (kernel k=7) combinadas con atención lineal de estado constante. Esto permite una generación muy rápida (el autor reporta ~180-210 tokens/segundo en GPUs de consumo) con bajo consumo de VRAM, al no requerir caché KV creciente de la misma forma que un transformer convencional. La parte multimodal se conserva del modelo base: codificador de visión SigLIP con adaptadores de proyección para preguntas sobre imágenes, análisis de documentos y razonamiento visual.

El post-training se realizó sobre varios datasets públicos de razonamiento y agentes: open-r1/OpenR1-Math-220k (matemáticas con razonamiento), nvidia/Nemotron-Post-Training-Dataset-v2, nvidia/Nemotron-SFT-Agentic-v2 (uso de herramientas agéntico), HuggingFaceTB/smoltalk2 (conversación) y Vikhrmodels/GrandMaster-PRO-MAX (contenido ruso). El número total de tokens de entrenamiento no está disponible. No hay mención a RLHF o DPO; el entrenamiento parece basado en SFT con trazas de razonamiento en formato `<think>...</think>`. El repo incluye código personalizado (`configuration_lfm3.py`, `modeling_lfm3.py`, `processing_lfm3_vl.py`), por lo que requiere `trust_remote_code=True` al cargarlo.

## Capacidades

- Razonamiento paso a paso en modo dual: modo thinking (trazas explícitas `<think>...</think>`, activado por defecto con `enable_thinking=True`) y modo instant (bloque de pensamiento vacío para respuestas directas de baja latencia con `enable_thinking=False`).
- Razonamiento matemático: resolución de problemas aritméticos multi-paso, derivaciones algebraicas y verificación de cálculos intermedios, con soporte de fórmulas LaTeX (`$\boxed{...}$`).
- Generación de código Python algorítmico con análisis de casos límite.
- Function calling / tool calling agéntico compatible con los protocolos del Berkeley Function Calling Benchmark y llamadas estructuradas con parámetros XML.
- Capacidades de visión heredadas del modelo base: preguntas sobre imágenes, análisis de documentos y razonamiento visual (pipeline image-text-to-text).
- Bilingüe ruso/inglés, con razonamiento matemático funcional en ruso (benchmark MGSM ruso).
- Ejecución estricta de instrucciones y restricciones de formato (IFEval ~72%).

## Casos de uso

- Resolución de problemas de matemáticas educativas: el modelo puede generar soluciones paso a paso con verificación de cálculos intermedios en modo thinking, adecuado para tutores virtuales de nivel escolar (GSM8K) y primeros cursos universitarios.
- Generación de código algorítmico en Python: útil para asistentes de programación que resuelven problemas tipo entrevista o competiciones, ya que analiza casos límite antes de emitir el código final (51,8% en HumanEval+ según el autor).
- Agentes con llamadas a herramientas: su compatibilidad con protocolos BFCL y llamadas XML estructuradas lo hace apto para pipelines de agentes ligeros que ejecutan funciones en dispositivos locales o móviles.
- Preguntas sobre imágenes y análisis de documentos: conserva el codificador SigLIP, por lo que puede responder preguntas sobre capturas, diagramas o documentos escaneados en flujos de OCR-aumentado.
- Asistentes bilingües ruso-inglés en edge: su tamaño (~1,9 B) y la arquitectura de atención lineal permiten desplegarlo en equipos de consumo o móviles con baja latencia.
- Respuestas instantáneas de baja latencia: en modo instant (sin traza de razonamiento) es adecuado para chatbots conversacionales donde la velocidad prima sobre la profundidad de razonamiento.
- Investigación en post-training de modelos pequeños: al ser un fine-tune experimental y reproducible (benchmarks con decodificación greedy determinista en bfloat16), sirve como referencia para estudiar cómo destilar razonamiento en modelos de menos de 2B.

## Benchmarks y rendimiento

Datos publicados por el autor, evaluados localmente con bfloat16 y decodificación greedy determinista. No han sido verificados de forma independiente.

| Benchmark | Modo | Base (LFM3-VL-2B) | Mercury-Acad-1.7B | Delta vs. base |
|---|---|---|---|---|
| HumanEval+ (164 tareas) | Thinking | 21,9% | 51,8% | +29,9 |
| GSM8K (500 problemas) | Thinking | 58,2% | 67,8% | +9,6 |
| MGSM ruso (250 problemas) | Thinking | 39,2% | 45,2% | +6,0 |
| MATH-500 (niveles 1-3) | Instant | 73,5% | 51,7% | -21,9 |
| MATH-500 (niveles 1-3) | Thinking | 64,3% | 51,3% | -13,0 |
| BFCL V3 Simple (tools) | Thinking | 99,7% | 99,7% | 0 |
| MMLU-Redux (300 tareas) | Instant | 24,0% | 42,7% | +18,7 |
| IFEval (541 instrucciones) | Instant | 73,3% | 71,8% | -1,5 |
| Identity Alignment | Thinking | 90,0% | 95,0% | +5,0 |

Cabe destacar que el modelo empeora respecto a la base en MATH-500 en ambos modos, y que el autor reporta una tasa de truncamiento del 0,0% en modo thinking frente al 60-90% de generaciones abortadas del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 3,9 GB en safetensors (bfloat16), por lo que es razonable asumir que cabe en GPUs con 4-6 GB de VRAM en precisión completa; con cuantización GGUF (repo derivado) podría funcionar en equipos con menos de 4 GB de RAM/VRAM. La model card no especifica cifras exactas de VRAM.
- GPU recomendadas: no disponible de forma explícita; el autor reporta ~180-210 tokens/segundo en "GPUs de escritorio de consumo", sin detallar modelos concretos. Por el tamaño, una RTX 3060, RTX 4060 o superior sería más que suficiente.
- Consumer GPUs: sí, cabe holgadamente en GPUs de consumo modernas e incluso en portátiles con GPU dedicada modesta; también debería ser ejecutable en CPU vía llama.cpp/Ollama con los pesos GGUF.
- Opciones de despliegue: transformers (con `trust_remote_code=True`, pipeline `AutoModelForImageTextToText`), llama.cpp, Ollama y LM Studio mediante el repo GGUF rrchat/Mercury-Acad-1.7B-GGUF. No hay mención a vLLM o TGI, y el uso de código personalizado puede complicar el despliegue en servidores de inferencia estándar.
- Latencia y throughput: el autor reporta ~180-210 tokens/segundo en GPUs de escritorio de consumo gracias a la atención lineal de estado constante; no hay datos de latencia en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Visión | Licencia | Notas |
|---|---|---|---|---|---|
| Mercury-Acad-1.7B (rrchat) | ~1,92 B | Híbrida (conv causal + atención lineal) | Sí (SigLIP) | Apache 2.0 | Fine-tune experimental, razonamiento dual, ruso/inglés |
| LiquidAI/LFM3-VL-2B (base) | ~2 B | Híbrida (conv causal + atención lineal) | Sí (SigLIP) | Apache 2.0 (según el ecosistema LFM) | Modelo base de Liquid AI, mejor en conocimiento factual según el autor |
| Qwen2.5-VL-3B-Instruct | ~3,75 B | Transformer | Sí | Qwen (licencia propia, restringida en algunos usos) | Alternativa multimodal más grande y con ecosistema más maduro |
| SmolVLM2 / SmolLM2 (HuggingFaceTB) | ~0,5-2,2 B | Transformer | Sí (variantes VL) | Apache 2.0 | Alternativa compacta open source con buen soporte de la librería transformers |

Nota: la comparativa es orientativa; no hay benchmarks publicados que evalúe estos modelos bajo el mismo arnés de pruebas.

## Limitaciones y advertencias

- Es un modelo experimental de un autor individual (rrchat) con tracción mínima (32 descargas, 1 like); los benchmarks son auto-reportados bajo un arnés propio y no verificados por terceros.
- Rendimiento inferior al modelo base en MATH-500 en ambos modos (-21,9 puntos en instant, -13,0 en thinking), lo que sugiere que el fine-tune degrada capacidades matemáticas de nivel superior.
- El propio autor reconoce que no supera al modelo base en conocimiento enciclopédico ni recuperación factual, limitado por la escala de 1,7B del pre-entrenamiento; el riesgo de alucinación factual es alto en preguntas de conocimiento general.
- Requiere `trust_remote_code=True` por incluir archivos de código personalizado, lo que supone un riesgo de seguridad a evaluar antes de usar en producción.
- Contexto máximo no especificado en la model card; la arquitectura de atención lineal de estado constante puede comportarse de forma distinta a un transformer en contextos largos.
- Solo ruso e inglés; el rendimiento en castellano u otros idiomas no está evaluado ni garantizado.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes, pero al ser un fine-tune derivado conviene verificar la compatibilidad de los datasets de entrenamiento empleados.
- La cuantización GGUF disponible en el repo derivado puede degradar las capacidades de razonamiento y function calling; no hay benchmarks de las versiones cuantizadas.
- El uso de trazas `<think>` implica mayor consumo de tokens de salida en modo thinking, con el consiguiente impacto en latencia y coste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rrchat/Mercury-Acad-1.7B
- Pesos GGUF derivados: https://huggingface.co/rrchat/Mercury-Acad-1.7B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Datasets de entrenamiento:
  - https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
  - https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
  - https://huggingface.co/datasets/nvidia/Nemotron-SFT-Agentic-v2
  - https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
  - https://huggingface.co/datasets/Vikhrmodels/GrandMaster-PRO-MAX
