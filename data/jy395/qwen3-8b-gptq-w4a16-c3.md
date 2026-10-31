# jy395/Qwen3-8B-gptq-w4a16-c3

## Resumen

Qwen3-8B-gptq-w4a16-c3 es una versión cuantizada del modelo Qwen3-8B de Alibaba (Qwen), publicada por el usuario jy395 en Hugging Face. Se trata de una cuantización GPTQ de pesos a 4 bits (esquema W4A16, con pesos en 4 bits y activaciones en 16 bits, group size 128), calibrada específicamente sobre C3 (FinMix), un corpus de 2.042 prompts financieros formateados como tareas (~260k tokens) construido a partir de los splits de entrenamiento y validación de diez benchmarks financieros, sin usar nunca datos de test.

Este checkpoint no es una versión aislada, sino una de las 30 configuraciones comprimidas publicadas junto al artículo de ICAIF '26 "Damage Predicts Recovery: When Calibration Data Matters in Compressing Financial LLMs", que estudia cuándo la compresión post-entrenamiento de LLMs financieros requiere datos de calibración del dominio. Su relevancia es doble: por un lado, ofrece una versión eficiente en memoria de Qwen3-8B apta para hardware modesto; por otro, sirve como artefacto experimental reproducible para investigar el impacto de los datos de calibración en la cuantización de modelos orientados a finanzas.

El modelo base, Qwen3-8B, es un transformer denso de 8 mil millones de parámetros con soporte de razonamiento (thinking mode) y contexto largo. La versión cuantizada conserva el pipeline de generación de texto y se distribuye en formato compressed-tensors, cargable directamente en vLLM o en la librería transformers de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), decoder-only |
| Parametros totales | 8.000 millones (base Qwen3-8B); 2.167.453.176 parámetros almacenados en safetensors tras la cuantización |
| Parametros activos | no disponible (no es MoE; modelo denso, todos los parámetros activos) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen3-8B soporta 32.768 tokens, ampliable a 131.072 con YaRN, según la ficha original de Qwen) |
| Tipos de cuantizacion | GPTQ W4A16, 4 bits en pesos, 16 bits en activaciones, group size 128 |
| Idiomas soportados | no disponible (Qwen3-8B base soporta más de 100 idiomas según la documentación original) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B: un transformer decoder-only denso de 8 mil millones de parámetros, con las capacidades estándar de la familia Qwen3 (generación de texto conversacional, modo de razonamiento y soporte de contexto largo). El modelo base fue entrenado por el equipo de Qwen de Alibaba; los detalles del preentrenamiento no se replican en esta model card.

La contribución específica de este repositorio es la compresión post-entrenamiento: se aplicó el algoritmo GPTQ para cuantizar los pesos a 4 bits manteniendo las activaciones en 16 bits (W4A16), con un group size de 128. La cuantización se realizó mediante la librería llm-compressor del proyecto vLLM y se calibró sobre C3 (FinMix), un corpus de 2.042 prompts financieros formateados como tareas (~260k tokens) construido a partir de los splits de entrenamiento y validación de diez benchmarks financieros, evitando deliberadamente cualquier contaminación con datos de test. El protocolo de calibración utilizó consumo del corpus completo, max_seq_length de 2048 y semilla 42 para reproducibilidad. El script de cuantización está disponible en el repositorio de código asociado. Este trabajo forma parte de una investigación (ICAIF '26) sobre la importancia de los datos de calibración ajustados al dominio en la compresión de LLMs financieros.

## Capacidades

- Generación de texto conversacional heredada de Qwen3-8B (pipeline text-generation, tag conversational).
- Razonamiento general y modo de razonamiento (thinking mode) de la familia Qwen3, según las capacidades del modelo base.
- Orientación a tareas financieras: la calibración con C3 (FinMix) busca preservar el rendimiento en diez benchmarks financieros (análisis de textos financieros, tareas del dominio según el paper asociado).
- El modelo base Qwen3-8B soporta tool calling y capacidades de agente, aunque esta model card no documenta explícitamente ese soporte para la versión cuantizada.
- Capacidades multilingües heredadas del modelo base (más de 100 idiomas según la documentación de Qwen3), no verificadas específicamente para esta versión cuantizada.
- Carga directa en vLLM gracias al formato compressed-tensors, y compatibilidad con transformers mediante AutoModelForCausalLM.

## Casos de uso

- Análisis de documentos financieros en entornos con recursos limitados: la cuantización a 4 bits reduce la huella de memoria a aproximadamente un cuarto de la del modelo en FP16, permitiendo desplegar el modelo en GPUs de consumo para resumir informes, notas y comunicados.
- Investigación en compresión de LLMs: al ser parte de una colección de 30 configuraciones con código, corpus de calibración y suite de evaluación públicos, es idóneo como baseline o punto de partida para estudiar cómo afectan los datos de calibración al rendimiento post-cuantización.
- Chatbots de dominio financiero: el modelo conversacional puede integrarse en asistentes que respondan preguntas sobre conceptos financieros, beneficiándose de la calibración con prompts financieros formateados como tareas.
- Inferencia en producción con vLLM: el formato compressed-tensors carga directamente en vLLM, lo que permite servir el modelo con alto throughput en servidores de inferencia con VRAM limitada.
- Reproducción del pipeline de evaluación financiera: el repositorio asociado incluye la suite de evaluación sobre diez tareas financieras, útil para auditar el impacto de la cuantización antes de un despliegue real.
- Prototipado local de aplicaciones de IA financiera: con Ollama o llama.cpp (previa conversión de formato si fuese necesaria) o directamente con transformers, desarrolladores pueden experimentar en estaciones de trabajo sin GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la suite de evaluación del paper de ICAIF '26 (diez tareas financieras) y al repositorio de código para reproducir la evaluación, pero no incluye tablas de resultados concretos (MMLU, HumanEval, GSM8K u otros) para esta configuración.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 10,9 GB en safetensors cuantizados a 4 bits; con overhead de KV cache y activaciones, se estima que bastan unas 12-16 GB de VRAM para inferencia cómoda con contexto moderado.
- GPU recomendadas: RTX 3090, RTX 4090 (24 GB), o GPUs de datacenter como A100 de 40 GB si se requiere contexto largo o batching intensivo.
- Cabe en GPUs de consumo: sí, en tarjetas de 16 GB o más (RTX 4080/4090); en tarjetas de 12 GB puede ser ajustado según la longitud de contexto.
- Opciones de despliegue: vLLM (carga directa en formato compressed-tensors, opción recomendada), transformers con device_map="auto". No se menciona soporte nativo para llama.cpp, Ollama o TGI en formato compressed-tensors; para estos se requeriría conversión (por ejemplo, a GGUF).
- Latencia y throughput: no disponibles; al ser un modelo denso de 8B con pesos a 4 bits, se espera una latencia inferior a la del modelo en FP16 en GPUs con ancho de banda de memoria limitado, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| jy395/Qwen3-8B-gptq-w4a16-c3 | 8B (base) | GPTQ W4A16, group size 128 | 32k (base Qwen3-8B) | Apache 2.0 | Calibrado con corpus financiero C3 (FinMix); formato compressed-tensors para vLLM |
| Qwen/Qwen3-8B (original) | 8B | FP16/BF16 (sin cuantizar) | 32k (131k con YaRN) | Apache 2.0 | Referencia sin comprimir; ~16 GB en FP16 |
| Otras configuraciones de la colección ICAIF '26 del mismo autor | 8B (base) | 30 configuraciones comprimidas | no disponible | Apache 2.0 | Mismo modelo base con distintos métodos y corpus de calibración; útiles para comparar el efecto de la calibración |

No se dispone de datos de rendimiento comparativo cuantitativo entre estas variantes en la informacion proporcionada; el paper asociado y el repositorio de código son la fuente para esas comparaciones.

## Limitaciones y advertencias

- No hay benchmarks publicados en la model card: el impacto real de la cuantización sobre las capacidades generales (razonamiento, código, matemáticas) no está documentado en el propio repositorio y debe verificarse con la suite de evaluación del paper.
- La calibración está orientada al dominio financiero; esto puede preservar (o no) el rendimiento en tareas financieras, pero no hay garantías documentadas sobre otras áreas.
- Riesgo de alucinación: inherente a cualquier LLM; en aplicaciones financieras, donde la precisión es crítica, se recomienda supervisión humana y verificación de salidas.
- Sesgos: no documentados específicamente; el modelo hereda los sesgos del corpus de preentrenamiento de Qwen3-8B.
- Idiomas y longitud de contexto: no confirmados en la model card para la versión cuantizada; consultar la ficha de Qwen/Qwen3-8B para los datos del modelo base.
- Formato compressed-tensors: la carga directa está garantizada en vLLM y transformers; otros runtimes (llama.cpp, Ollama, TGI) pueden requerir conversión.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución sin restricciones relevantes más allá de la atribución de la licencia.
- Descargas prácticamente nulas (0 en el momento de la ficha): se trata de un artefacto de investigación con poco uso comunitario, por lo que hay menos validación empírica de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jy395/Qwen3-8B-gptq-w4a16-c3
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Paper (ICAIF '26): https://doi.org/10.1145/3858063.3858724
- Repositorio de código, corpus de calibración y suite de evaluación: https://github.com/JunyiYe/finance-ptc-calibration
- Script de cuantización: https://github.com/JunyiYe/finance-ptc-calibration/blob/main/scripts/quantization/gptq_w4a16.py
- Suite de evaluación: https://github.com/JunyiYe/finance-ptc-calibration/tree/main/scripts/evaluation
- Colección completa en Hugging Face (Financial LLM Compression & Calibration, ICAIF 2026): https://huggingface.co/collections/jy395/financial-llm-compression-and-calibration-icaif-2026-6ae60c49d2f87e2ae7269058
- Librería de compresión utilizada: https://github.com/vllm-project/llm-compressor
