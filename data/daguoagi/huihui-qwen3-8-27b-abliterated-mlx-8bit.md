# daguoagi/Huihui-Qwen3.8-27B-abliterated-MLX-8bit

## Resumen

El modelo `daguoagi/Huihui-Qwen3.8-27B-abliterated-MLX-8bit` es una conversión no oficial a formato MLX de la versión abliterated de Qwen3.8-27B, un modelo multimodal de la familia Qwen3.8 desarrollado por Alibaba. El autor de la conversión, `daguoagi`, ha cuantizado los pesos del modelo original (publicado por `huihui-ai`) a 8 bits con cuantización affine RTN y tamaño de grupo 64, manteniendo los componentes de visión y los procesadores multimodales en su precisión original (bfloat16). El modelo está pensado para inferencia local en Apple Silicon mediante la librería `mlx-vlm`, y soporta tanto generación de texto como comprensión de imágenes.

La relevancia de este modelo radica en que ofrece una versión "sin censura" (abliterated) de Qwen3.8-27B, en la que se han eliminado las capas 18 a 51 del modelo base para reducir las restricciones de contenido, manteniendo las capacidades multimodales. Es una opción interesante para desarrolladores que necesitan un modelo de 27B de parámetros con visión, ejecutable en hardware de Apple con memoria unificada, y con licencia Apache 2.0. La conversión a 8 bits reduce los requisitos de memoria frente a la versión bfloat16 original (30 GB frente a unos 54 GB), aunque sigue requiriendo un equipo con suficiente memoria unificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal) |
| Parametros totales | 27B (nominal, según el modelo base; el metadato de safetensors reporta 8.027.131.120, posiblemente erróneo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262 144 tokens (262K, según el modelo base) |
| Tipos de cuantizacion | 8-bit affine RTN, group size 64 (conversión MLX) |
| Idiomas soportados | no disponible (el modelo base Qwen3.8 es multilingüe, pero no se especifica en la información) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors (conversión para mlx-vlm) |

## Arquitectura y entrenamiento

El modelo base es `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, una versión modificada de Qwen3.8-27B en la que se han ablacionado (eliminado) las capas 18 a 51 de la red neuronal. La abliteración es una técnica que reduce la censura del modelo eliminando capas que se correlacionan con la negativa a responder ciertos contenidos. Los componentes visuales del modelo original se mantienen intactos. La conversión MLX cuantiza únicamente los pesos del modelo de lenguaje a 8 bits (affine RTN, group size 64), mientras que los componentes de visión y los procesadores multimodales conservan su precisión original en bfloat16. No se realizó ningún fine-tuning adicional ni se modificó el proceso de abliteración durante la conversión. El repositorio incluye seis shards de pesos de aproximadamente 30 GB (28 GiB) en total, y no incorpora un módulo MTP (Multi-Token Prediction) independiente.

## Capacidades

- Generación de texto conversacional y respuesta a preguntas.
- Comprensión de imágenes (image-text-to-text): puede describir imágenes, responder preguntas sobre su contenido y realizar tareas de razonamiento visual.
- Capacidad multimodal integrada: el modelo procesa texto e imágenes en un mismo pipeline.
- Modelo "uncensored" (abliterated): se ha reducido la censura del modelo original, lo que permite generar contenido que el modelo base podría rechazar.
- Compatible con decodificación especulativa mediante el modelo borrador DFlash2 (`z-lab/Qwen3.8-27B-DFlash2`), aunque no se ha probado específicamente con esta versión de 8 bits.
- Soporta inferencia tanto en modo texto como multimodal a través de `mlx-vlm`.

## Casos de uso

- Inferencia local en Apple Silicon: es el caso principal. El modelo se ejecuta en equipos con chip Apple M1/M2/M3/M4 (Pro/Max/Ultra) usando `mlx-vlm`, sin necesidad de GPU NVIDIA. Adecuado para prototipos y aplicaciones que requieren privacidad de datos.
- Asistente conversacional sin restricciones: gracias a la abliteración, puede utilizarse en entornos donde se necesita un asistente que no rechace preguntas sobre temas sensibles (siempre que se cumpla con la legislación aplicable).
- Análisis de imágenes en local: el modelo puede describir o responder sobre fotografías, capturas o documentos escaneados sin enviar datos a la nube, útil en sectores con requisitos de confidencialidad (salud, legal, etc.).
- Desarrollo de aplicaciones de chat con visión: permite crear chatbots que combinan texto e imágenes, por ejemplo, para soporte técnico con capturas de pantalla o asistentes para personas con discapacidad visual.
- Experimentación en investigación sobre abliteración y alineación: al ser Apache 2.0 y tener documentada la técnica, sirve para estudiar los efectos de la abliteración en el comportamiento de modelos multimodales.
- Generación de contenido creativo: puede utilizarse para escribir historias, guiones o respuestas largas, aprovechando la ventana de contexto de 262K tokens para mantener coherencia en textos extensos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este modelo concreto. La model card no incluye métricas de rendimiento como MMLU, HumanEval o GSM8K. Tampoco se han encontrado resultados comparativos en la búsqueda web realizada. Los datos de rendimiento (latencia, throughput) dependen del hardware concreto (chip de Apple Silicon, cantidad de memoria unificada) y no han sido publicados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en 8 bits ocupa aproximadamente 30 GB en memoria. En Apple Silicon, la memoria unificada es compartida entre CPU y GPU, por lo que se necesita un equipo con al menos 32 GB de memoria unificada para ejecutar el modelo sin intercambio de memoria (swap). Con 24 GB podría funcionar con cuantización adicional o reduciendo el contexto.
- GPU recomendadas: Apple Silicon con chip M1 Pro/Max/Ultra, M2 Pro/Max/Ultra, M3 Pro/Max/Ultra o M4 Pro/Max/Ultra. No es compatible con GPUs NVIDIA o AMD, ya que MLX es específico de Apple.
- Cabe en consumer GPU: no, está pensado exclusivamente para Apple Silicon con MLX. No es compatible con CUDA.
- Opciones de despliegue: se recomienda usar `mlx-vlm` (versión >=0.6.16). El modelo no es compatible con vLLM, llama.cpp o Ollama directamente, aunque existen versiones GGUF del modelo base (ver enlaces).
- Latencia y throughput: no disponible. La velocidad depende del chip y de la memoria disponible. Se recomienda usar decodificación especulativa con el draft DFlash2 para acelerar la generación, pero no se ha medido en esta versión de 8 bits.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| daguoagi/Huihui-Qwen3.8-27B-abliterated-MLX-8bit (este) | 27B | 262K | 8-bit RTN | Sí | Apache 2.0 | MLX (Apple Silicon) |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B | 262K | bfloat16 | Sí | Apache 2.0 | Safetensors (general) |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF | 27B | 262K | Varias (F16, Q4_K_M, etc.) | Sí | Apache 2.0 | GGUF (llama.cpp, Ollama) |
| Qwen/Qwen3.8-27B (modelo base) | 27B | 262K | - | Sí | Apache 2.0 (verificar) | Safetensors |

La principal diferencia entre este modelo y sus alternativas es el formato MLX, que limita su uso a Apple Silicon, y la cuantización a 8 bits que reduce el espacio frente al bfloat16 original. El GGUF de `huihui-ai` es más portable (compatible con llama.cpp, Ollama, etc.) pero no incluye la cuantización específica de MLX ni está optimizado para Apple Silicon. El modelo base original no tiene abliteración.

## Limitaciones y advertencias

- Sesgos y alucinaciones: no se han publicado evaluaciones específicas de sesgos para este modelo. La abliteración puede eliminar mecanismos de seguridad del modelo, lo que aumenta el riesgo de generar contenido ofensivo, incorrecto o perjudicial. El autor no recomienda su uso sin control humano.
- Riesgo de alucinación: como todos los LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento o factualidad. La abliteración no mitiga este riesgo.
- Limitaciones de contexto: aunque la ventana es de 262K tokens, el uso de una ventana tan larga requiere memoria adicional; con 30 GB de pesos en 8 bits, el contexto completo puede no caber en equipos con 32 GB de memoria unificada.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo base Qwen3.8-27B puede tener su propia licencia. En la información proporcionada, el modelo base también se indica como Apache 2.0, pero hay que verificar la licencia del modelo original de Alibaba. El autor de la conversión no se hace responsable de un uso indebido.
- Incompatibilidad con hardware no Apple: el formato MLX no es compatible con GPUs NVIDIA o AMD, ni con los ecosistemas de CUDA o ROCm. Para otros hardwares hay que usar la versión GGUF.
- La cuantización de 8 bits puede provocar una degradación leve de la calidad en tareas de razonamiento complejo frente a la versión en bfloat16, aunque no se ha medido cuantitativamente.
- La abliteración afecta a las capas 18 a 51, lo que puede degradar la capacidad del modelo en tareas que dependen de esas capas (posiblemente razonamiento de alto nivel). No hay benchmarks que confirmen el impacto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/daguoagi/Huihui-Qwen3.8-27B-abliterated-MLX-8bit
- Modelo base (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Versión GGUF del modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
- Blog de orcarouter sobre Qwen3.8-27B uncensored: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Página en LLM Explorer: https://llm-explorer.com/model/huihui-ai%2FHuihui-Qwen3.8-27B-abliterated
- Página en Ollama (versión GGUF): https://ollama.com/huihui_ai/Qwen3.8-abliterated:27b
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Draft model DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
