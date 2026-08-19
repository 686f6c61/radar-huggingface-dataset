# openbmb/MiniCPM5-1B

## Resumen

MiniCPM5-1B es el primer modelo de la serie MiniCPM5, desarrollado por el laboratorio OpenBMB (creado conjuntamente por el laboratorio de PLN de la Universidad de Tsinghua y ModelBest Inc.). Se trata de un Transformer denso de aproximadamente 1.080 millones de parámetros, diseñado específicamente para despliegue en dispositivos locales, entornos con recursos limitados y escenarios de computación en el borde (edge AI). El modelo resuelve el problema de obtener capacidades de razonamiento, generación de código y uso de herramientas en un paquete lo suficientemente pequeño como para ejecutarse en hardware de consumo.

La relevancia actual de MiniCPM5-1B radica en que alcanza el estado del arte (SOTA) dentro de la clase de modelos de 1B de código abierto, con una puntuación media de 42,57 en una batería de benchmarks que cubren razonamiento, conocimiento, código, seguimiento de instrucciones, matemáticas, lógica y capacidades de agente. Incorpora un modo de razonamiento híbrido (thinking/no-thinking) activable mediante plantilla de chat, soporte nativo de contexto largo de 131.072 tokens y capacidades de tool calling. El modelo se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial y su integración en productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (Transformer denso, causal) |
| Parametros totales | 1.080.632.832 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Parametros no-embedding | 679.552.512 |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | BF16 (original), GGUF (varias precisiones), MLX 4-bit |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

MiniCPM5-1B utiliza una arquitectura Transformer causal estándar basada en `LlamaForCausalLM`, con 24 capas y atención con Grouped Query Attention (GQA): 16 cabezas para consultas (Q) y 2 cabezas para claves/valores (KV). Esta configuración reduce el coste de memoria durante la inferencia en comparación con la atención multi-cabeza convencional, lo que resulta clave para su despliegue en dispositivos con recursos limitados. El modelo es denso, sin mezcla de expertos, y su número de parámetros no-embedding es de aproximadamente 679,5 millones.

El entrenamiento sigue la metodología de gestión de datos por niveles de UltraData, en tres etapas. La primera, de pre-entrenamiento base, incluye fases de entrenamiento estable y de decaimiento para construir capacidades lingüísticas fundamentales. La segunda, de mid-training, refuerza capacidades objetivo y adapta el modelo a la distribución de datos deseada. Los corpus de entrenamiento se publican junto al modelo: Ultra-FineWeb, Ultra-FineWeb-L3 y UltraData-Math. La tercera etapa, de post-entrenamiento, se compone de tres fases: SFT (con 200.000 millones de tokens de SFT de pensamiento profundo y otros 200.000 millones de SFT de pensamiento híbrido), seguida de RL (reinforcement learning) con profesores especializados en matemáticas, código, QA de libro cerrado, escritura y dominios relacionados, y finalmente OPD (On-Policy Distillation), que destila estos profesores en un único modelo de lanzamiento. Esta combinación de RL y OPD es una innovación técnica destacable que permite concentrar capacidades de razonamiento en un modelo compacto.

## Capacidades

- Generación de texto y conversación multilingüe en inglés y chino.
- Razonamiento híbrido: el mismo checkpoint puede funcionar como asistente rápido (modo sin pensamiento) o como razonador deliberado (modo thinking), activable mediante la plantilla de chat con el parámetro `enable_thinking`.
- Generación de código y uso de herramientas (tool calling / function calling), con soporte para agentes de codificación locales.
- Razonamiento multi-paso y resolución de problemas complejos de matemáticas y lógica.
- Soporte nativo de contexto largo de 131.072 tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Capacidades de agente: el modelo puede integrarse en flujos de trabajo que requieren planificación y ejecución de múltiples pasos.
- Optimizado para despliegue en dispositivos (on-device) y entornos de computación en el borde, con formatos GGUF y MLX disponibles para llama.cpp, Ollama, LM Studio y Apple Silicon.

## Casos de uso

- Asistentes locales de escritorio: el modelo puede alimentar aplicaciones de asistente personal que se ejecutan íntegramente en el equipo del usuario, sin conexión a internet, gracias a su tamaño compacto y su modo de razonamiento híbrido que permite alternar entre respuestas rápidas y razonamiento profundo.
- Agentes de codificación en local: gracias a su soporte de tool calling y su buen rendimiento en generación de código, puede integrarse en editores o entornos de desarrollo para autocompletar, refactorizar o explicar fragmentos de código, manteniendo la privacidad del código fuente.
- Atención al cliente automatizada: con una ventana de contexto de 131.072 tokens, puede gestionar conversaciones multi-turno extensas y consultar documentación o bases de conocimiento internas sin perder el hilo de la conversación.
- Procesamiento de documentos largos: su contexto amplio permite resumir, extraer información o responder preguntas sobre informes, manuales o artículos de decenas de miles de tokens en una sola pasada.
- Dispositivos de borde (edge AI): su reducido tamaño y su licencia Apache-2.0 lo hacen adecuado para integrarse en routers, cámaras, dispositivos IoT o asistentes embebidos que requieren procesamiento de lenguaje natural local.
- Prototipado rápido y fine-tuning: al ser un modelo de 1B con licencia permisiva, es una base económica para experimentar con técnicas de fine-tuning o RL en hardware de consumo, antes de escalar a modelos mayores.
- Mascota de escritorio (desktop pet): OpenBMB publica un proyecto de mascota de escritorio impulsada por MiniCPM5-1B, demostrando su uso en aplicaciones interactivas ligeras y entretenidas.

## Benchmarks y rendimiento

No se han publicado resultados desglosados de benchmarks individuales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card indica que MiniCPM5-1B alcanza una puntuacion media de 42,57 en una bateria de benchmarks que cubren razonamiento, conocimiento, codigo, seguimiento de instrucciones, matematicas, logica y capacidades de agente, situandose por encima de los modelos comparados de su misma clase. El analisis independiente de Artificial Analysis otorga al modelo una puntuacion de 17,9 en su indice de inteligencia para la variante no razonadora. No se dispone de datos publicos de latencia o throughput medidos en hardware especifico.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en BF16 ocupa aproximadamente 2,2 GB (tamano del repositorio), por lo que cabe en cualquier GPU con al menos 4 GB de VRAM. En cuantizacion GGUF de 4 bits, el peso ocupa aproximadamente 0,6-0,7 GB, permitiendo ejecucion en GPU con 2 GB o incluso en CPU.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB o superior, RTX 3060, RTX 4090) es suficiente para inferencia en BF16. Para Apple Silicon, se proporciona una version MLX de 4 bits optimizada.
- Cabe en GPU de consumo: si, en todas las GPU consumer actuales, incluso en las de gama de entrada.
- Opciones de despliegue: transformers (Hugging Face), vLLM, TGI (Text Generation Inference), llama.cpp, Ollama, LM Studio, MLX. El repositorio de GitHub de MiniCPM proporciona guias de despliegue y fine-tuning para los principales backends.
- Latencia y throughput: no disponible en la informacion proporcionada, aunque por su tamano se espera una generacion rapida incluso en CPU con cuantizacion GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Puntuacion media (bateria OpenBMB) |
|---|---|---|---|---|
| MiniCPM5-1B | 1,08B | 131.072 | Apache-2.0 | 42,57 |
| LFM2.5-1.2B-Thinking | 1,2B (aprox.) | no disponible | no disponible | inferior a MiniCPM5-1B |
| Qwen3-0.6B/think | 0,6B | no disponible | no disponible | inferior a MiniCPM5-1B |
| Qwen3.5-0.8B/think | 0,8B | no disponible | no disponible | inferior a MiniCPM5-1B |

La comparativa se basa en los datos publicados por OpenBMB, que situan a MiniCPM5-1B por encima de los tres modelos mencionados en la bateria conjunta de benchmarks. No se dispone de datos desglosados de los modelos competidores en cuanto a contexto, licencia o rendimiento individual, por lo que esos campos se indican como no disponibles.

## Limitaciones y advertencias

- El modelo puede generar contenido inexacto, sesgado o inseguro, ya que se basa en patrones estadisticos aprendidos de los datos de entrenamiento. El contenido generado debe revisarse y verificarse antes de su uso en entornos de alto riesgo.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede inventar hechos, citas o codigo que no son correctos, especialmente en tareas de conocimiento de libro cerrado.
- Idiomas limitados: el modelo solo soporta ingles y chino de forma nativa; su rendimiento en otros idiomas no esta garantizado.
- Aunque la licencia Apache-2.0 permite uso comercial, es responsabilidad del usuario cumplir con las regulaciones locales sobre IA generativa, especialmente en la Union Europea (Ley de IA) y otras jurisdicciones.
- El modo de razonamiento (thinking) aumenta la latencia y el consumo de recursos; debe desactivarse en escenarios donde se requiera respuesta inmediata.
- No se han publicado evaluaciones exhaustivas de sesgos o seguridad; se recomienda realizar pruebas especificas antes de desplegar el modelo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openbmb/MiniCPM5-1B
- Repositorio GitHub de MiniCPM: https://github.com/OpenBMB/MiniCPM
- Informe tecnico de MiniCPM (arXiv): https://arxiv.org/pdf/2506.07900
- Paper de UltraData Tiered Data Management (arXiv): https://arxiv.org/pdf/2602.09003
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-1B-Demo
- Proyecto MiniCPM Desk Pet: https://github.com/OpenBMB/MiniCPM-Desk-Pet
- Dataset Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Dataset Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset UltraData-SFT-2605: https://huggingface.co/datasets/openbmb/UltraData-SFT-2605
- Version GGUF: https://huggingface.co/openbmb/MiniCPM5-1B-GGUF
- Version MLX: https://huggingface.co/openbmb/MiniCPM5-1B-MLX
- Version SFT: https://huggingface.co/openbmb/MiniCPM5-1B-SFT
- Version Base: https://huggingface.co/openbmb/MiniCPM5-1B-Base
- Analisis de Artificial Analysis: https://artificialanalysis.ai/articles/minicpm5-1b-the-leading-1b-open-weights-model
