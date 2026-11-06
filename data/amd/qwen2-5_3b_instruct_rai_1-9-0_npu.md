# amd/Qwen2.5_3B_Instruct_rai_1.9.0_npu

## Resumen

AMD publica en Hugging Face una versión optimizada de Qwen2.5-3B-Instruct para su plataforma Ryzen AI, empaquetada en formato ONNX y cuantizada con las herramientas Quark del propio fabricante. El modelo está pensado para ejecutarse sobre la NPU integrada en los procesadores AMD Ryzen AI (arquitectura XDNA/XDNA2), lo que permite inferencia de un LLM de 3.000 millones de parámetros en un PC con consumo energético reducido y sin depender de una GPU dedicada.

Se trata de un derivado del modelo Qwen2.5-3B-Instruct de Alibaba, un transformer decoder-only denso con 3.000 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (ampliable a 128K en la familia Qwen2.5). AMD no modifica los pesos originales en cuanto a capacidades cognitivas: lo que cambia es el pipeline de exportación, cuantización y despliegue para el runtime Ryzen AI 1.9.0, que expone el modelo a través de la NPU mediante el stack ONNX Runtime con el proveedor de ejecución Vitis AI.

La relevancia de esta ficha es doble. Por un lado, ejemplifica el patrón creciente de modelos "vendor-optimized" que los fabricantes de silicio publican para demostrar que sus aceleradores pueden correr LLMs de forma práctica. Por otro lado, es un caso útil para evaluar las limitaciones reales de la inferencia en NPU: cuantización agresiva, contexto efectivo reducido y un ecosistema de herramientas todavía menos maduro que el de CUDA o ROCm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) |
| Parametros totales | 3.000 millones (aproximado, segun modelo base Qwen2.5-3B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens en el modelo base; contexto efectivo en esta version NPU no disponible |
| Tipos de cuantizacion | Cuantizacion Quark para NPU Ryzen AI (precision exacta no disponible) |
| Idiomas soportados | Ingles (segun la model card); el modelo base Qwen2.5 soporta multiples idiomas, pero esta version declara solo en |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (optimizado para Ryzen AI NPU) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only con atención de tipo grouped-query attention (GQA), normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo base fue entrenado por Alibaba con un corpus multilingüe de trillones de tokens y posteriormente ajustado con instrucciones y preferencias (SFT + DPO/RLHF según la documentación pública de Qwen2.5). No se dispone de información detallada sobre la composición exacta del dataset ni del número preciso de tokens en la información proporcionada.

La contribución de AMD se sitúa en la capa de despliegue, no en el entrenamiento. El repositorio contiene los pesos exportados a ONNX y cuantizados mediante Quark, el toolkit de compresión de modelos de AMD, para ejecutarse sobre la NPU Ryzen AI con el runtime 1.9.0. Este proceso implica típicamente cuantización de pesos y activaciones a precisiones reducidas (INT8 o INT4, aunque el detalle exacto no se especifica en la información disponible) y la generación de grafos ONNX particionados para que el proveedor de ejecución Vitis AI pueda mapear las operaciones a la NPU. No se documentan innovaciones algorítmicas propias (decodificación especulativa, atención lineal, etc.) más allá del pipeline de compilación para NPU.

## Capacidades

- Generación de texto conversacional y de instrucciones en inglés, heredadas de Qwen2.5-3B-Instruct.
- Razonamiento básico y resolución de problemas de complejidad media, limitado por el tamaño del modelo.
- Generación de código y explicaciones técnicas, con calidad inferior a modelos de mayor tamaño.
- Matemáticas elementales y de nivel medio; no es un modelo especializado en razonamiento matemático avanzado.
- Soporte de tool calling / function calling, siempre que el runtime de Ryzen AI y el template de chat lo permitan (no confirmado explícitamente en la información disponible).
- Capacidades multilingües del modelo base (chino, español, francés, etc.), aunque esta versión declara únicamente inglés en la model card.
- No dispone de visión, audio ni modo "thinking" extendido.
- No se documentan capacidades de agente multi-paso específicas más allá de las del modelo base.

## Casos de uso

- **Asistentes locales en portátiles y mini-PC con Ryzen AI**: el modelo se ejecuta en la NPU integrada, liberando la CPU y la GPU para otras tareas y reduciendo el consumo. Adecuado para asistentes de escritorio que deben funcionar sin conexión.
- **Procesamiento de texto en el borde (edge computing)**: aplicaciones industriales o de retail que necesitan resumir, clasificar o extraer información de documentos sin enviar datos a la nube, gracias a la licencia Apache 2.0 y a la ejecución local.
- **Generación de código en entornos de desarrollo integrados**: autocompletado y explicación de fragmentos de código en IDE sobre hardware AMD, con latencia aceptable para un modelo de 3B en NPU.
- **Chatbots de atención al cliente en inglés**: conversaciones multi-turno con contexto de hasta 32K tokens en el modelo base, útil para resúmenes de historial o consultas sobre documentación extensa (el contexto efectivo en la versión NPU debe validarse).
- **Prototipado de pipelines RAG locales**: combinación con una base vectorial y un modelo de embeddings para responder preguntas sobre corpus privados en un equipo de sobremesa, sin GPU dedicada.
- **Evaluación de hardware Ryzen AI**: uso del modelo como benchmark práctico para medir el rendimiento real de la NPU en tareas de inferencia de LLM, comparando con ejecuciones en CPU o GPU del mismo equipo.
- **Educación e investigación sobre despliegue en NPU**: estudio del pipeline Quark + ONNX Runtime + Vitis AI como caso de referencia para portar otros modelos a aceleradores no-CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de AMD no incluye métricas de MMLU, HumanEval, GSM8K ni latencias/throughput medidos en NPU Ryzen AI para esta versión específica.

## Requisitos de hardware

- **VRAM estimada**: no aplica en sentido estricto, ya que el modelo se ejecuta en la NPU. El tamaño del repositorio es de 4,2 GB, lo que sugiere pesos cuantizados en el rango de INT8/INT4; la memoria compartida del sistema (RAM) debe acomodar el modelo y el runtime.
- **GPU recomendadas**: no aplica; el destino es la NPU integrada en procesadores AMD Ryzen AI (generaciones Strix Point, Hawk Point y sucesoras con XDNA/XDNA2).
- **Compatibilidad con GPU consumer**: el modelo está empaquetado para NPU; para ejecutarlo en GPU habría que recurrir a los pesos originales de Qwen2.5-3B-Instruct en otros formatos (GGUF, safetensors).
- **Opciones de despliegue**: runtime Ryzen AI 1.9.0 con ONNX Runtime y el proveedor de ejecución Vitis AI. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para esta versión concreta.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / destino | Notas |
|---|---|---|---|---|---|
| amd/Qwen2.5_3B_Instruct_rai_1.9.0_npu | 3B | 32K (base) | Apache 2.0 | ONNX / NPU Ryzen AI | Version vendor-optimized, solo ingles declarado |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32K (128K con YaRN) | Apache 2.0 | safetensors, GGUF | Modelo base original, multilingue, amplio ecosistema |
| meta-llama/Llama-3.2-3B-Instruct | 3B | 128K | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamano similar, licencia mas restrictiva |
| microsoft/Phi-3.5-mini-instruct | 3,8B | 128K | MIT | safetensors, GGUF | Enfocado en razonamiento y codigo, tambien en ingles |

## Limitaciones y advertencias

- **Acceso restringido**: el repositorio es gated; es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede complicar la automatización en CI/CD.
- **Idioma**: la model card declara únicamente inglés; aunque el modelo base es multilingüe, el comportamiento en castellano no está garantizado ni evaluado en esta versión.
- **Sesgos**: hereda los sesgos del corpus de entrenamiento de Qwen2.5, no documentados en esta ficha.
- **Alucinación**: como todo LLM de 3B, presenta una tasa de alucinación notable en tareas de conocimiento factual y razonamiento complejo; no debe usarse como fuente de verdad sin verificación.
- **Contexto efectivo**: aunque el modelo base soporta 32K tokens, la cuantización y el runtime NPU pueden reducir el contexto utilizable; conviene validarlo empíricamente.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero el acceso gated y las condiciones de AMD pueden imponer requisitos adicionales de atribución o uso.
- **Madurez del ecosistema**: el stack Ryzen AI + ONNX Runtime + Vitis AI es menos maduro que CUDA o ROCm; la depuración de errores y el soporte comunitario son limitados.
- **Portabilidad**: los pesos ONNX optimizados para NPU no son directamente reutilizables en otros aceleradores; para GPU o CPU hay que recurrir al modelo original.
- **Fecha de publicación**: el repositorio figura creado en noviembre de 2026, lo que puede indicar una versión preliminar o de disponibilidad limitada; verificar el estado antes de usarlo en producción.

## Enlaces

- [Hugging Face: amd/Qwen2.5_3B_Instruct_rai_1.9.0_npu](https://huggingface.co/amd/Qwen2.5_3B_Instruct_rai_1.9.0_npu)
- [Qwen2.5-3B-Instruct (modelo base)](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct)
- [Repositorio Qwen2.5 en GitHub](https://github.com/QwenLM/Qwen2.5)
- [AMD Ryzen AI (pagina oficial)](https://www.amd.com/en/products/processors/ryzen-ai.html)
- [Quark (toolkit de cuantizacion de AMD)](https://github.com/amd/quark)
- [ONNX Runtime](https://onnxruntime.ai/)
- [Vitis AI](https://www.amd.com/en/developer/vitis-ai.html)
