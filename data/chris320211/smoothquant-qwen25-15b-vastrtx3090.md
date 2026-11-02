# chris320211/smoothquant-qwen25-15b-vastrtx3090

## Resumen

SmoothQuant Qwen2.5-1.5B es una versión cuantizada a 8 bits del modelo instructivo Qwen/Qwen2.5-1.5B-Instruct, generada por el usuario chris320211 mediante la herramienta QuantPort y la técnica SmoothQuant. No se trata de un checkpoint fp16 al uso, sino de un artefacto empaquetado que requiere un adaptador de inferencia específico (`quant_agent_inference_adapter.py`) y el repositorio del método en la variable de entorno `QUANT_AGENT_METHOD_REPO`. Su propósito es reducir el uso de VRAM y aumentar el throughput de inferencia manteniendo una calidad muy cercana al modelo original.

El modelo base es un transformer decoder-only de Qwen2.5 con 1.544.359.424 parámetros (aproximadamente 1,5 mil millones), orientado a generación de texto conversacional. La cuantización se valida sobre WikiText-2 con ventanas de 2048 tokens, mostrando una perplejidad de 9,7248 frente a 9,5791 del fp16, es decir, un ratio de 1,0152 que el autor marca como `quality_ok=True`. El pico de VRAM baja de 5,84 GB a 4,68 GB en Transformers.

La relevancia de esta ficha es doble: por un lado, documenta un caso práctico de cuantización post-entrenamiento con SmoothQuant; por otro, advierte de que el artefacto no es un `AutoModelForCausalLM.from_pretrained` directo y de que, en Transformers, la decodificación es más lenta que en fp16. Para servir en producción existe una build nativa de vLLM publicada por el mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), cuantizado con SmoothQuant a 8 bits |
| Parametros totales | 1.544.359.424 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, pero la model card no lo confirma para este artefacto) |
| Tipos de cuantizacion | 8 bits (SmoothQuant, pesos empaquetados en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen2.5-1.5B-Instruct) mas la licencia del repositorio del metodo |
| Formato de pesos | Safetensors empaquetados (artefacto runtime, no compatible con carga directa en Transformers sin adaptador) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con atención de múltiples cabezas con RoPE y capas MLP con SwiGLU, entrenado originalmente por Alibaba Qwen. Sobre ese checkpoint se aplica SmoothQuant, una técnica de cuantización post-entrenamiento que migra la dificultad de cuantización de las activaciones hacia los pesos mediante un factor de escala por canal, permitiendo cuantizar tanto pesos como activaciones a 8 bits sin reentrenamiento. El resultado se empaqueta con QuantPort en un formato runtime específico.

No se dispone de información sobre el dataset de calibración más allá de la evaluación sobre WikiText-2 (test, ventanas de 2048 tokens, 65.504 tokens) y del job identificado como `20261102T032732Z-138c85`. No se documenta RLHF, DPO ni ajuste adicional tras la cuantización: el modelo hereda el alineamiento instructivo del checkpoint original. La innovación técnica principal es el pipeline de QuantPort, que genera tanto el artefacto nativo para Transformers como una build nativa para vLLM.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones en formato chat.
- Generación de código y resolución de problemas matemáticos sencillos, limitada por el tamaño de 1,5B parámetros.
- Soporte de tool calling y function calling, según las capacidades del modelo base (no verificado específicamente en este artefacto cuantizado).
- Capacidades multilingües del modelo base (no confirmadas en la model card de esta versión).
- Inferencia acelerada en vLLM mediante la build `-vllm` publicada por el autor.
- No se documentan modos de pensamiento extendido, visión ni audio.

## Casos de uso

- Despliegue de bajo coste en GPU de consumo: con 4,68 GB de pico de VRAM en Transformers, cabe en tarjetas de 8 GB o superiores, lo que permite montar un asistente conversacional local en una RTX 3060 o similar.
- Servicio de chat de alta concurrencia con vLLM: la build nativa alcanza 3.673,7 tok/s de decodificación con batch 16 frente a 2.547,8 tok/s en fp16, adecuada para atender múltiples sesiones simultáneas en una sola GPU.
- Prototipado de pipelines RAG ligeros: el modelo puede generar respuestas sobre contexto recuperado, aunque su ventana efectiva debe validarse empíricamente al no estar documentada en la model card.
- Clasificación y extracción de información estructurada: tareas de etiquetado, resumen y parsing de texto donde el throughput importa más que el razonamiento profundo.
- Evaluación de técnicas de cuantización: sirve como referencia reproducible para comparar SmoothQuant frente a fp16 en perplejidad, VRAM y latencia sobre WikiText-2.
- Generación de código asistida en entornos con recursos limitados: útil para autocompletado y explicación de fragmentos, no para tareas de ingeniería complejas dado el tamaño del modelo.
- Backend de agentes simples con tool calling: integrable en flujos de dos o tres pasos donde la latencia de decodificación es crítica.

## Benchmarks y rendimiento

Resultados medidos por el autor en NVIDIA GeForce RTX 3090 sobre WikiText-2 (test, ventanas de 2048 tokens, 65.504 tokens):

| Metrica | vLLM int8 | vLLM fp16 | Transformers int8 | Transformers fp16 |
|---|---:|---:|---:|---:|
| Perplejidad | 9,7244 | 9,5795 | 9,7248 | 9,5791 |
| Prefill tok/s | 41.093,6 | 22.704,4 | 38.091,7 | 20.885,2 |
| Decode tok/s, batch 1 | 257,4 | 202,8 | 25,4 | 50,9 |
| Decode tok/s, batch 16 | 3.673,7 | 2.547,8 | 344,8 | 738,4 |
| Pico VRAM (GB) | No disponible | No disponible | 4,68 | 5,84 |

Datos adicionales de la model card: NLL loss de 2,274679 frente a 2,259583 en fp16; tokens/s con prefill de 2048 tras warmup de 18.435,8 frente a 12.248,2; ratio de perplejidad de 1,015210 con `quality_ok=True`. En vLLM 0.30.0 el prefill mejora 1,81× y la decodificación 1,27× con batch 1 y 1,44× con batch 16. En Transformers la decodificación es aproximadamente la mitad de rápida que en fp16 (0,50× con batch 1, 0,47× con batch 16), por lo que la ganancia en ese backend es exclusivamente de memoria.

## Requisitos de hardware

- VRAM estimada en Transformers: 4,68 GB de pico para el artefacto int8, frente a 5,84 GB en fp16.
- VRAM en vLLM: no documentada en la model card; la build nativa de vLLM requiere su propio runtime.
- GPU recomendadas: RTX 3090 es la referencia medida; cualquier GPU con al menos 6-8 GB de VRAM debería poder ejecutar el artefacto en Transformers.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; en tarjetas de 8 GB el margen es ajustado.
- Opciones de despliegue: vLLM mediante `chris320211/smoothquant-qwen25-15b-vastrtx3090-vllm`; Transformers 4.46.3 con torch 2.7.1+cu128 y el adaptador incluido. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Throughput medido: 41.093,6 tok/s de prefill y 3.673,7 tok/s de decodificación con batch 16 en vLLM sobre RTX 3090.
- Latencia: no se publican métricas de latencia por petición (TTFT, TPOT).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| SmoothQuant Qwen2.5-1.5B (este) | 1,54B | No disponible | 8 bits SmoothQuant | Apache 2.0 | Safetensors empaquetado + build vLLM |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (modelo base) | fp16 / bf16 | Apache 2.0 | Safetensors estandar |
| Qwen2.5-1.5B-Instruct-GGUF (comunidad) | 1,54B | 32.768 tokens | 2-8 bits (GGUF) | Apache 2.0 | GGUF |
| Llama 3.2 1B Instruct | 1,24B | 128.000 tokens | fp16 / bf16 / GGUF | Llama 3.2 Community License | Safetensors, GGUF |

La ventaja de este artefacto frente al checkpoint original es la reducción de VRAM (4,68 frente a 5,84 GB) y el mayor throughput en vLLM. Frente a las cuantizaciones GGUF de la comunidad, ofrece integración nativa con vLLM pero carece de la portabilidad de llama.cpp y Ollama. No se han publicado comparaciones directas con Llama 3.2 1B en la información disponible.

## Limitaciones y advertencias

- El artefacto no es un checkpoint estándar: no funciona con `AutoModelForCausalLM.from_pretrained` sin el adaptador `quant_agent_inference_adapter.py` y el repositorio del método configurado en `QUANT_AGENT_METHOD_REPO`.
- En Transformers la decodificación es más lenta que en fp16 (0,50× con batch 1); para producción debe usarse la build de vLLM.
- La perplejidad aumenta un 1,52 % respecto a fp16, dentro de lo aceptable pero no despreciable en tareas sensibles a la precisión.
- No se documentan los idiomas soportados ni la longitud de contexto efectiva de este artefacto; deben validarse antes de usarlo con contextos largos.
- Al ser un modelo de 1,5B parámetros, el riesgo de alucinación y de errores en razonamiento complejo, matemáticas avanzadas y código de producción es alto.
- Los sesgos heredados del modelo base Qwen2.5 no se han evaluado ni mitigado en esta versión cuantizada.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse el `LICENSE` y el `NOTICE.md` del snapshot y cumplir también la licencia del repositorio del método QuantPort.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay validación independiente de los resultados reportados por el autor.
- No se ofrece soporte para llama.cpp, Ollama ni TGI, lo que limita las opciones de despliegue en entornos sin vLLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chris320211/smoothquant-qwen25-15b-vastrtx3090
- Build nativa de vLLM: https://huggingface.co/chris320211/smoothquant-qwen25-15b-vastrtx3090-vllm
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio QuantPort: https://github.com/chris320211/QuantPort
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct/blob/main/LICENSE
