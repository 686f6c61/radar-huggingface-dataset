# philbert440/Qwen3.8-27B-Uncensored-Aggressive-W4A16-AWQ

## Resumen

Qwen3.8-27B-Uncensored-Aggressive-W4A16-AWQ es una cuantizacion AWQ de 4 bits (W4A16) del modelo **Qwen3.5-27B-Uncensored-Aggressive**, desarrollado por el usuario philbert440. Se trata de una version "abliterada" (desrefrigerada) del modelo base Qwen3.5-27B, en la que se ha eliminado parcialmente la capa de rechazo de contenido mediante una tecnica de ablacion que ajusta el comportamiento del modelo con un parametro alpha (α). Esta version concreta utiliza un α=1.15, que segun el autor representa el punto de equilibrio optimo entre apertura y calidad, tras un barrido de evaluaciones que mostro que valores mas altos (α≈1.24) "sobre-ablaban" el modelo y degradaban el rendimiento.

El modelo mantiene la arquitectura original de Qwen3.5-27B, incluyendo la torre de vision (image-text-to-text) y el cabezal MTP (Multi-Token Prediction) injertado, pero cuantizado a 4 bits para reducir el uso de memoria. El resultado es un modelo de 27.4 mil millones de parametros con una ventana de contexto de 128k tokens (dato no confirmado en la informacion proporcionada), distribuido bajo licencia Apache 2.0 y disponible en formato compressed-tensors para su uso con vLLM y otras herramientas compatibles.

La relevancia de este modelo radica en su proposito: ofrecer una alternativa "sin censura" para desarrolladores e investigadores que necesitan un LLM con capacidades de razonamiento y generacion de contenido sin las restricciones tipicas de los modelos comerciales, manteniendo un rendimiento competitivo en tareas como GSM8K y factualidad. Es una opcion popular en la comunidad open source para aplicaciones de agentes, generacion de codigo y tareas de conversacion avanzada, aunque su uso conlleva responsabilidades legales y eticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-27B (Transformer con atencion de ventana deslizante, vision tower y MTP head) |
| Parametros totales | 27.356.728.560 (27.4B) |
| Parametros activos | No disponible (modelo denso, no MoE) |
| Longitud de contexto | No disponible (se recomienda verificar en el modelo base Qwen3.5-27B, probablemente 128k tokens) |
| Tipos de cuantizacion | AWQ W4A16 (grupo de tamaño 128, asimetrico, observador MSE) |
| Idiomas soportados | No disponible (se espera multilingue, similar a Qwen3.5) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, compressed-tensors (AWQ) |

## Arquitectura y entrenamiento

La arquitectura base es Qwen3.5-27B, un modelo de lenguaje de tipo transformer con una torre de vision que permite el procesamiento de imagenes y texto (pipeline_tag: image-text-to-text). Incluye un cabezal MTP (Multi-Token Prediction) injetado, que permite predecir multiples tokens futuros simultaneamente, mejorando la eficiencia de la generacion. La cuantizacion AWQ (Activation-aware Weight Quantization) reduce los pesos a 4 bits (W4A16) con un tamaño de grupo de 128 y un observador basado en MSE (Mean Squared Error), calibrado con 256 muestras de Magpie-CoT a 1024 tokens.

El proceso de "ablación" (abliteration) es la caracteristica clave: se elimina la direccion de rechazo del modelo base mediante una tecnica de ablacion que ajusta el comportamiento con un parametro α. En esta version, α=1.15 se considera el punto de calidad maxima, segun un barrido de evaluaciones del autor. El modelo resultante mantiene la factualidad (1.00) y el rendimiento en GSM8K (0.85) del modelo base, pero con una apertura mucho mayor (0.88 frente a 0.08 del modelo base censurado). No se dispone de informacion detallada sobre el dataset de entrenamiento original del modelo base ni sobre el proceso de RLHF/DPO aplicado.

## Capacidades

- Generacion de texto libre y conversacional, con soporte para razonamiento de multiples pasos (thinking mode).
- Procesamiento de imagenes y texto (image-text-to-text), permitiendo entrada multimodal.
- Capacidad de "tool calling" y "function calling" heredada del modelo base Qwen3.5-27B, aunque no se confirma en la informacion proporcionada.
- Soporte para agentes y razonamiento multi-paso, gracias a la arquitectura MTP y la ventana de contexto larga (no verificada).
- Multilingue (esperado, segun el modelo base Qwen3.5, aunque no se confirma).
- "Uncensored / de-refused": no aplica rechazo de contenido, permitiendo respuestas a solicitudes que otros modelos bloquearian.

## Casos de uso

- **Atencion al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con contexto largo (si se confirma la ventana de 128k), manteniendo coherencia en dialogos extensos sin necesidad de recortar el historial. Su apertura permite tratar temas delicados sin respuestas evasivas.
- **Generacion de codigo en produccion**: con soporte de tool calling y MTP, puede integrarse en pipelines de CI/CD para autogenerar tests, documentacion o incluso parches de codigo, reduciendo el trabajo manual de los desarrolladores.
- **Investigacion en IA y desarrollo de agentes**: su naturaleza de-refused y su capacidad de razonamiento lo hacen util para experimentar con sistemas de agentes autonomos que necesitan explorar escenarios sin restricciones de contenido, siempre dentro de un entorno controlado.
- **Creacion de contenido creativo**: para escritores o guionistas que necesitan un asistente que no rechace temas como la violencia, el gore o el humor negro, el modelo puede generar narrativas, dialogos o ideas sin limitaciones autoimpuestas.
- **Analisis de documentos y extraccion de informacion**: con su capacidad multimodal, puede procesar documentos escaneados o imagenes con texto, extrayendo datos estructurados de forma fiable, aprovechando su factualidad alta (1.00).
- **Entrenamiento y fine-tuning**: al estar cuantizado en AWQ y con licencia Apache 2.0, puede usarse como base para proyectos de fine-tuning en entornos con recursos limitados, sin preocuparse por restricciones de uso comercial.

## Benchmarks y rendimiento

La informacion proporcionada incluye una tabla de evaluacion del modelo padre (bf16) realizada con una muestra grande, en modo de pensamiento y juzgada por Claude:

| Metrica | Stock base (censurado) | Aggressive (α=1.15) | Aggressive anterior (α≈1.24) |
|---|---|---|---|
| Apertura (openness) | 0.08 | **0.88** | 0.80 |
| Confabulacion (confab) | 0.75 | **0.725** | 0.80 |
| Factualidad | 1.00 | **1.00** | 1.00 |
| GSM8K | 0.85 | **0.85** | 0.817 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) para esta cuantizacion especifica. Los datos de la tabla son del modelo padre en bf16, no de la version AWQ, por lo que el rendimiento real puede variar ligeramente.

## Requisitos de hardware

- **VRAM estimada**: con cuantizacion W4A16 (4 bits), los pesos ocupan aproximadamente 27.4B × 0.5 bytes = 13.7 GB, mas overhead de activaciones y KV cache. Se recomienda un minimo de 16 GB de VRAM para inferencia en FP16, y alrededor de 14 GB para cuantizacion int4.
- **GPU recomendadas**: NVIDIA RTX 3090 (24 GB), RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB) para despliegues con contexto largo. En GPUs de 16 GB (como RTX 4080) puede caber con limitaciones de contexto.
- **Cabe en consumer GPU**: si, en GPUs de 24 GB se puede ejecutar con comodidad, y en 16 GB con restricciones de contexto y batch size.
- **Opciones de despliegue**: compatible con vLLM (soporta compressed-tensors AWQ), llama.cpp, Ollama (via GGUF), y TGI (Text Generation Inference). Se recomienda vLLM para produccion por su throughput.
- **Latencia y throughput**: no disponible en la informacion proporcionada. Se espera que con AWQ y una GPU moderna se obtenga una latencia de entre 10-30 tokens/segundo, dependiendo del hardware y la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-27B (base) | 27.4B | 128k (esperado) | bf16 | Apache 2.0 | HuggingFace |
| Qwen3.5-27B-Uncensored-Aggressive (bf16) | 27.4B | 128k (esperado) | bf16 | Apache 2.0 | HuggingFace |
| **Qwen3.5-27B-Uncensored-Aggressive-W4A16-AWQ** | 27.4B | 128k (esperado) | AWQ4 | Apache 2.0 | HuggingFace |
| Llama 3.1 8B (similar en tamaño de VRAM) | 8B | 128k | bf16 | Llama 3.1 License | HuggingFace |

La comparacion directa con modelos de la misma categoria (27B, uncensored) es limitada. La alternativa mas cercana es el modelo padre en bf16, que requiere el doble de VRAM (aproximadamente 55 GB) y no esta cuantizado. En terminos de rendimiento, la cuantizacion AWQ4 suele degradar entre 1-3% las metricas de calidad, pero a cambio reduce los requisitos de memoria a la mitad.

## Limitaciones y advertencias

- **Sesgos conocidos**: al ser un modelo "uncensored", puede generar contenido ofensivo, sexista, racista o ilegal sin filtro. Esto es un riesgo para entornos de produccion donde no haya un sistema de moderacion externo.
- **Riesgo de alucinacion**: aunque la factualidad es alta (1.00) en las evaluaciones del autor, no se ha probado en entornos reales de produccion con datos del mundo real. La cuantizacion AWQ puede introducir errores adicionales.
- **Limitaciones de contexto**: la ventana de contexto no se ha confirmado en la informacion proporcionada. Si es de 128k tokens, el uso de contexto largo puede degradar el rendimiento y aumentar la VRAM necesaria.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, pero el modelo no incluye ninguna advertencia de cumplimiento legal. El usuario es responsable de asegurar que el contenido generado cumpla con las leyes de su jurisdiccion.
- **Caveats para produccion**: el modelo no incluye un sistema de moderacion de contenido. En aplicaciones de produccion, es imprescindible implementar filtros externos (por ejemplo, OpenAI Moderation API, Llama Guard) para evitar respuestas inapropiadas. Ademas, el proceso de "abliteracion" puede haber eliminado no solo el rechazo sino tambien la capacidad de detectar y evitar contenido peligroso, lo que aumenta el riesgo de usos malintencionados.

## Enlaces

- [HuggingFace - Modelo AWQ4](https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Aggressive-W4A16-AWQ)
- [HuggingFace - Modelo base bf16](https://huggingface.co/philbert440/Qwen3.5-27B-Uncensored-Aggressive)
- [HuggingFace - Modelo base original Qwen3.5-27B](https://huggingface.co/Qwen/Qwen3.5-27B)
- [GitHub - Qwen3.5 27B Uncensored (GGUF y Ollama)](https://github.com/Wassimyounes01/qwen38-uncensored)
- [MindStudio Blog - Abliteration en Qwen3.5-27B](https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration)
- [LLM Explorer - Ficha del modelo](https://llm-explorer.com/model/philbert1680%2FQwen3.5-27B-W4A16-AWQ)
