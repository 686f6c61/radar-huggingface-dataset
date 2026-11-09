# openbmb/MiniCPM5-1B-GGUF

## Resumen

MiniCPM5-1B es el primer modelo de la serie MiniCPM5, desarrollado por OpenBMB. Se trata de un transformer denso de 1.080.632.832 parámetros (679.552.512 sin contar los embeddings) diseñado específicamente para despliegue local, en dispositivo y en entornos con recursos limitados. Su arquitectura sigue el patrón estándar `LlamaForCausalLM`, con 24 capas y atención GQA de 16 cabezas para Q y 2 para KV, lo que reduce el coste de memoria en inferencia.

El modelo aborda el problema de disponer de un asistente competente en razonamiento, generación de código y uso de herramientas sin necesidad de infraestructura GPU de gran escala. Incorpora soporte nativo de contexto largo de 131.072 tokens y un modo híbrido de razonamiento conmutables mediante la plantilla de chat `<think>` y el parámetro `enable_thinking`, de modo que el mismo checkpoint sirve como asistente rápido o como razonador deliberativo.

Es relevante ahora porque OpenBMB lo presenta como SOTA de código abierto en la clase de 1B, con ventajas declaradas en uso agéntico de herramientas, generación de código y razonamiento difícil frente a LFM2.5-1.2B-Thinking, Qwen3-0.6B/think y Qwen3.5-0.8B/think. La distribución en GGUF facilita su ejecución en llama.cpp, Ollama y LM Studio, y la licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal, `LlamaForCausalLM` |
| Parametros totales | 1.080.632.832 |
| Parametros activos | no aplica (modelo denso) |
| Parametros sin embeddings | 679.552.512 |
| Capas | 24 |
| Cabezas de atencion | 16 para Q, 2 para KV (GQA) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | GGUF (el repo incluye variantes GGUF; no se detallan los niveles exactos en la informacion disponible) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); BF16 en los repositorios hermanos |
| Tamano del repo | 4,0 GB |
| Pipeline | text-generation |
| Libreria | transformers |

## Arquitectura y entrenamiento

MiniCPM5-1B es un transformer denso causal con 24 capas y atención con grouped-query attention (16 cabezas de query y 2 de key/value), lo que reduce el tamaño de la caché KV y favorece el despliegue en dispositivos con memoria limitada. El contexto nativo alcanza los 131.072 tokens. La plantilla de chat incorpora un modo de razonamiento híbrido conmutable mediante `enable_thinking`, que activa o desactiva el bloque `<think>` sobre el mismo checkpoint.

El entrenamiento sigue la receta de gestión de datos por niveles UltraData y se divide en tres fases: preentrenamiento base (con fases de entrenamiento estable y de decaimiento), mid-training para reforzar capacidades objetivo y adaptar la distribución de datos, y post-entrenamiento. Este último consta de SFT, RL y OPD (On-Policy Distillation): se usan 200.000 millones de tokens de SFT de razonamiento profundo y otros 200.000 millones de SFT de razonamiento híbrido, se entrenan profesores de RL especializados en matemáticas, código, QA de libro cerrado y escritura, y finalmente se destilan esos profesores en el modelo final mediante OPD. Los corpus empleados se publican como Ultra-FineWeb, Ultra-FineWeb-L3, UltraData-Math y UltraData-SFT-2605.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento híbrido: modo "think" (razonamiento deliberativo con `<think>`) y modo "no think" (respuesta rápida), conmutables por plantilla.
- Generación de código, con ventajas declaradas por el autor en esta área frente a modelos del mismo tamaño.
- Razonamiento matemático y QA de libro cerrado, reforzados mediante RL y destilación.
- Uso de herramientas y function calling, orientado a flujos agénticos.
- Soporte de contexto largo de hasta 131.072 tokens para conversaciones multi-turno y documentos extensos.
- Capacidades multilingües limitadas a inglés y chino.
- Diseñado para despliegue en dispositivo y en el borde (edge AI).

## Casos de uso

- Asistente local en escritorio: el modelo puede ejecutarse en local con llama.cpp u Ollama y gestionar conversaciones multi-turno con hasta 131.072 tokens de contexto, útil para asistentes personales que no envían datos a la nube.
- Agente de código en el IDE: gracias al soporte de tool calling y a su rendimiento declarado en generación de código, puede integrarse en flujos de autocompletado, explicación y refactorización dentro de pipelines de desarrollo.
- Automatización de atención al cliente: con modo "no think" ofrece respuestas rápidas y de baja latencia para consultas frecuentes, y con modo "think" puede resolver casos que requieran razonamiento sobre el histórico de la conversación.
- Enrutamiento y orquestación de herramientas: el modelo puede decidir qué función invocar en un pipeline agéntico (APIs, consultas a bases de datos, cálculo) y devolver la llamada estructurada, gracias a su soporte nativo de function calling.
- Procesamiento de documentos largos: con 131.072 tokens de contexto puede resumir, extraer entidades o responder preguntas sobre informes extensos en inglés o chino sin fragmentación previa.
- Razonamiento matemático asistido: útil para tutores o herramientas de verificación paso a paso, aprovechando el modo "think" y el refuerzo por RL en matemáticas.
- Prototipado en hardware de consumo: al ser un modelo de 1B en GGUF, permite validar ideas de producto en portátiles o equipos sin GPU dedicada antes de escalar a modelos mayores.

## Benchmarks y rendimiento

El autor declara SOTA de código abierto en la clase de 1B frente a LFM2.5-1.2B-Thinking, Qwen3-0.6B/think y Qwen3.5-0.8B/think, con ventaja más visible en uso de herramientas, generación de código y razonamiento difícil. Sin embargo, en la información proporcionada no se incluyen las cifras numéricas de los benchmarks (MMLU, HumanEval, GSM8K u otros), solo referencias a gráficas comparativas publicadas en el repositorio de GitHub.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1.080 millones de parámetros, un checkpoint BF16 ocupa aproximadamente 2,2 GB de pesos, y las cuantizaciones GGUF reducen esa cifra por debajo de 1 GB en niveles agresivos.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, el modelo es apto para GPUs de consumo y para ejecución en CPU.
- Cabe en GPU de consumo: sí, por su tamaño de 1B; el autor lo posiciona explícitamente para despliegue en dispositivo y entornos con recursos limitados.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio mediante los pesos GGUF; también transformers con los checkpoints BF16 de los repositorios hermanos. Existe una variante MLX de 4 bits para Apple Silicon.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MiniCPM5-1B | 1,08 B | 131.072 | Apache 2.0 | HF (BF16, SFT, Base, GGUF, MLX) | SOTA declarado por el autor en la clase 1B |
| LFM2.5-1.2B-Thinking | 1,2 B (aprox.) | no disponible | no disponible | no disponible | Baseline de comparación citado por el autor |
| Qwen3-0.6B/think | 0,6 B (aprox.) | no disponible | no disponible | no disponible | Baseline de comparación citado por el autor |
| Qwen3.5-0.8B/think | 0,8 B (aprox.) | no disponible | no disponible | no disponible | Baseline de comparación citado por el autor |

Los datos de rendimiento comparado no se detallan numéricamente en la información disponible; el autor solo indica que MiniCPM5-1B alcanza SOTA dentro de ese conjunto de comparación.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Riesgo de alucinación: como todo modelo generativo de 1B, puede producir contenido plausible pero incorrecto, especialmente en QA de libro cerrado y razonamiento matemático complejo.
- Sesgos: no se documentan análisis de sesgo en la información disponible; los corpus de entrenamiento (Ultra-FineWeb y derivados) pueden introducir sesgos propios de datos web.
- Contexto: aunque soporta 131.072 tokens, no se especifica la degradación de rendimiento en longitudes cercanas al máximo.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los datasets derivados si se redistribuyen.
- Producción: el autor no publica cifras de latencia ni throughput; es necesario medirlas en el hardware objetivo antes de desplegar.
- Cuantizaciones: no se detallan los niveles GGUF incluidos ni su impacto en calidad; debe validarse el nivel elegido para la tarea.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/openbmb/MiniCPM5-1B-GGUF
- Hugging Face (BF16): https://huggingface.co/openbmb/MiniCPM5-1B
- Hugging Face (SFT): https://huggingface.co/openbmb/MiniCPM5-1B-SFT
- Hugging Face (Base): https://huggingface.co/openbmb/MiniCPM5-1B-Base
- Hugging Face (MLX): https://huggingface.co/openbmb/MiniCPM5-1B-MLX
- ModelScope: https://www.modelscope.cn/models/OpenBMB/MiniCPM5-1B-GGUF
- GitHub: https://github.com/OpenBMB/MiniCPM
- MiniCPM Tech Report: https://arxiv.org/pdf/2506.07900
- UltraData Tiered Data Management: https://arxiv.org/pdf/2602.09003
- Documentación (Wiki en chino): https://openbmb.cn/docs/
- UltraData: https://ultradata.openbmb.cn/
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-1B-Demo
- MiniCPM Desk Pet: https://github.com/OpenBMB/MiniCPM-Desk-Pet
- Dataset Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Dataset Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset UltraData-SFT-2605: https://huggingface.co/datasets/openbmb/UltraData-SFT-2605
