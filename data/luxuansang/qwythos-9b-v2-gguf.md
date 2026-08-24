# luxuansang/Qwythos-9B-v2-GGUF

## Resumen

Qwythos-9B-v2-GGUF es la versión cuantizada en formato GGUF del modelo Qwythos-9B-v2, desarrollado por Empero AI. Se trata de un modelo híbrido de 8.95 mil millones de parámetros que combina bloques de atención lineal Gated-DeltaNet (SSM) con bloques de atención completa en proporción 3:1, y que hereda la torre de visión de Qwen3.5-9B. Está diseñado para ofrecer razonamiento profundo tipo chain-of-thought, soporte multimodal (imagen y texto), contexto largo de hasta 1 millón de tokens mediante YaRN, y capacidades de function calling.

La versión v2 introduce una corrección significativa sobre el Qwythos original: el comportamiento de bucle o degeneración que aparecía con decodificación greedy o temperaturas bajas se ha eliminado por completo (del 6.7% al 0%) mediante una técnica llamada FTPO (Final-Token Preference Optimization). Además, se ha restaurado la cabeza MTP (multi-token prediction) nativa, lo que permite decodificación especulativa eficiente. Este repositorio concreto contiene las cuantizaciones GGUF para su uso con llama.cpp, Ollama, LM Studio, jan, KoboldCpp y otros runtimes compatibles.

La relevancia de este modelo radica en que combina razonamiento avanzado, visión, contexto ultralargo y una licencia Apache 2.0 permisiva, todo en un tamaño de 9B que puede ejecutarse en hardware de consumo con las cuantizaciones adecuadas. Es una opción atractiva para desarrolladores que necesitan un modelo local potente y flexible sin depender de APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 3:1 Gated-DeltaNet (SSM) + full attention, 32 bloques (trunk) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.000.000 tokens (con YaRN) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16 (con y sin MTP) |
| Idiomas soportados | Inglés (según model card; la base Qwen3.5 es multilingüe, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

Qwythos-9B-v2 es un modelo híbrido que combina 24 bloques de atención lineal Gated-DeltaNet (una variante de SSM con estado recurrente) y 8 bloques de atención completa, en una proporción 3:1. Esta arquitectura permite manejar secuencias muy largas con un coste computacional subcuadrático, manteniendo la capacidad de atención sobre información relevante. El modelo base es Qwen3.5-9B, del que hereda la torre de visión (congelada durante el entrenamiento) y el template de chat.

El entrenamiento se realizó en dos fases: primero un SFT (supervised fine-tuning) sobre el Qwythos base, y posteriormente un ajuste con FTPO (Final-Token Preference Optimization), una técnica que identifica el token exacto que inicia un bucle de repetición y entrena al modelo para preferir alternativas coherentes en esa posición, sin alterar el resto de la distribución. Esto eliminó el problema de looping bajo decodificación greedy o temperaturas bajas, pasando de un 6.7% a un 0% de incidencia. La cabeza MTP (multi-token prediction) se restauró en esta versión, permitiendo decodificación especulativa con `--spec-type draft-mtp` en llama.cpp.

Los tensores del estado SSM (ssm_alpha, ssm_beta, ssm_out) se mantienen a mayor precisión en las cuantizaciones K-quant para preservar la calidad de los bloques híbridos, con un aumento de tamaño de archivo de solo 2-4% respecto a una cuantización plana.

## Capacidades

- Razonamiento profundo chain-of-thought: el modelo genera cadenas de razonamiento internas antes de responder, similar a otros modelos de razonamiento como o1 o DeepSeek-R1.
- Generación de texto y código: puede producir texto coherente, código en múltiples lenguajes y explicaciones técnicas.
- Matemáticas y lógica: mantiene o mejora los resultados de MMLU, GSM8K, GPQA y ARC respecto a la versión base.
- Multimodal (visión): acepta imágenes como entrada gracias a la torre de visión CLIP-style de Qwen3.5-9B, con un proyector mmproj en BF16.
- Function calling: soporta tool calling, lo que permite integrarlo en agentes y pipelines automatizados.
- Contexto ultralargo: hasta 1M de tokens con YaRN, útil para documentos extensos o conversaciones de muchas vueltas.
- Decodificación especulativa: con los archivos MTP, se puede acelerar la generación usando la cabeza de predicción multi-token.
- Sin censura intencional: el modelo está diseñado para no rechazar peticiones, lo que puede ser útil en investigación pero requiere precaución.

## Casos de uso

- Atención al cliente automatizada: con 1M de contexto, puede gestionar conversaciones multi-turno muy largas manteniendo el historial completo, y su soporte de function calling permite consultar bases de datos o APIs de pedidos en tiempo real.
- Generación de código en producción: integrable en pipelines de CI/CD mediante tool calling, puede generar, revisar y corregir código, y con la decodificación especulativa MTP se reduce la latencia en entornos de alta demanda.
- Análisis de documentos legales o académicos: el contexto de 1M tokens permite procesar contratos, tesis o informes completos sin truncar, extrayendo información relevante y resumiendo secciones.
- Asistente de investigación multimodal: al aceptar imágenes, puede analizar figuras, gráficos o diagramas junto con texto, útil para revisar papers científicos o informes técnicos.
- Agentes autónomos con razonamiento: su capacidad de chain-of-thought y function calling lo hace adecuado para agentes que planifican y ejecutan tareas multi-paso, como navegación web o automatización de tareas de oficina.
- Chatbot sin censura para entornos controlados: en investigación o desarrollo de productos donde se requiere explorar temas sensibles sin restricciones, el modelo puede responder sin rechazos, siempre bajo supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que MMLU, GSM8K, GPQA y ARC se mantienen o mejoran respecto al Qwythos base, pero no proporciona cifras concretas. Tampoco se incluyen comparativas con otros modelos en los datos facilitados.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q4_K_M: ~5.34 GiB (peso) + overhead de contexto, cabe en GPUs de 8 GB (RTX 3070, RTX 4060, etc.)
  - Q5_K_M: ~6.08 GiB, recomendable 8-12 GB de VRAM
  - Q6_K: ~6.95 GiB, recomendable 12 GB
  - Q8_0: ~8.87 GiB, recomendable 16 GB
  - BF16: ~16.69 GiB, recomendable 24 GB (RTX 3090, RTX 4090, A5000)
- GPU recomendadas: RTX 3060 12GB para Q4/Q5, RTX 4070/4080 para Q6/Q8, RTX 4090 o A100 para BF16.
- El modelo cabe en GPUs de consumo con cuantizaciones Q4_K_M o Q5_K_M, siendo Q4_K_M la opción recomendada por el autor.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, jan, KoboldCpp, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no se proporcionan datos específicos. Con MTP y decodificación especulativa, se espera una mejora significativa en tokens/segundo en hardware compatible, pero los valores dependen de la GPU y la configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwythos-9B-v2 | 8.95B | 1M (YaRN) | Híbrido SSM + attention | Apache 2.0 | GGUF, safetensors |
| Qwen3.5-9B (base) | ~9B | 1M (YaRN) | Transformer estándar | Apache 2.0 | Safetensors, GGUF |
| Qwythos-9B (v1) | 8.95B | 1M (YaRN) | Híbrido SSM + attention | Apache 2.0 | Safetensors, GGUF |
| Llama-3.1-8B | 8B | 128K | Transformer estándar | Llama 3.1 | Safetensors, GGUF |

La comparativa se basa en características generales, ya que no se dispone de datos de benchmarks comparativos. Qwythos-9B-v2 se distingue por su arquitectura híbrida y su corrección del looping, mientras que Qwen3.5-9B es su base y ofrece el mismo contexto y capacidades multimodales. Llama-3.1-8B es una alternativa densa con menor contexto y sin visión.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo derivado de Qwen3.5, puede heredar sesgos presentes en los datos de entrenamiento de la base. No se han publicado evaluaciones específicas de sesgo para esta versión.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en temas especializados. La naturaleza "uncensored" aumenta el riesgo de respuestas incorrectas sin filtros de seguridad.
- Limitaciones de idioma: la model card indica solo inglés, aunque la base Qwen3.5 es multilingüe. El rendimiento en otros idiomas no está garantizado.
- Contexto largo: aunque soporta 1M de tokens con YaRN, la calidad de atención puede degradarse en secuencias extremadamente largas, y el uso de YaRN puede afectar ligeramente al rendimiento en tareas de precisión.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo es "uncensored", lo que puede generar contenido inapropiado. El responsable del despliegue debe asumir la responsabilidad legal y ética.
- Requisitos de MTP: la decodificación especulativa con MTP requiere builds recientes de llama.cpp y puede no estar disponible en todos los runtimes.
- Sin garantías de producción: no hay información sobre pruebas de robustez, seguridad o alineación. Para uso en producción, se recomienda validar el comportamiento en el dominio específico.

## Enlaces

- Repositorio GGUF: https://huggingface.co/luxuansang/Qwythos-9B-v2-GGUF
- Modelo base: https://huggingface.co/empero-ai/Qwythos-9B-v2
- Repositorio GGUF oficial de Empero AI: https://huggingface.co/empero-ai/Qwythos-9B-v2-GGUF
- Cuantizaciones imatrix de bartowski: https://huggingface.co/bartowski/empero-ai_Qwythos-9B-v2-GGUF
- Página en ModelScope: https://www.modelscope.cn/models/empero-ai/Qwythos-9B-v2-GGUF
- Página en Inferix: https://inferix.co/models/empero-ai/Qwythos-9B-v2-GGUF
- Herramienta de análisis: https://www.toolify.ai/ai-model/empero-ai-qwythos-9b-v2-gguf
