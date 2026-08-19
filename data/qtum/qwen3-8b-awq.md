# qtum/Qwen3-8B-AWQ

## Resumen

El modelo `qtum/Qwen3-8B-AWQ` es una cuantización AWQ (W4A16) del modelo base `Qwen/Qwen3-8B`, desarrollado por Alibaba y publicado por el usuario qtum en Hugging Face. Esta versión reduce el peso del modelo original de aproximadamente 16 GB (en bf16) a unos 6,1 GB, manteniendo un comportamiento muy cercano al original y permitiendo un despliegue eficiente en entornos con recursos limitados. Está pensado para servir con vLLM o SGLang mediante el formato compressed-tensors, que declara el esquema de cuantización en `config.json` y se detecta automáticamente.

El modelo base Qwen3-8B es un transformer decoder-only de 8.190 millones de parámetros, con una ventana de contexto nativa de 32.768 tokens (ampliable hasta 131.072 con YaRN) y soporte para modos de razonamiento "thinking" y "non-thinking". Esta cuantización conserva todas las capacidades del original, incluyendo generación de texto, razonamiento, código, matemáticas y tool calling, a la vez que reduce el consumo de VRAM y aumenta el throughput en inferencia. Es una opción relevante para equipos que necesitan ejecutar un modelo de 8B en GPUs de consumo o en entornos de producción con restricciones de memoria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos (hasta 131.072 con YaRN) |
| Tipos de cuantizacion | AWQ W4A16 (4 bits en pesos, 16 bits en activaciones) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | compressed-tensors (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3-8B es un transformer causal con atención por ventanas deslizantes y atención completa alternadas, similar a la arquitectura de Qwen2.5. No se dispone de detalles públicos sobre el número exacto de tokens de entrenamiento ni la composición del dataset, pero el modelo se entrenó con un corpus multilingüe centrado en inglés y chino, con énfasis en razonamiento, código y matemáticas. El proceso incluyó fases de preentrenamiento y ajuste fino supervisado, seguido de optimización con RLHF (Reinforcement Learning from Human Feedback) para alinear el comportamiento con preferencias humanas.

La cuantización AWQ (Activation-aware Weight Quantization) aplicada por qtum utiliza el método W4A16: los pesos se reducen a 4 bits mientras que las activaciones se mantienen en 16 bits. Esto se realizó con la herramienta `llm-compressor` del proyecto vLLM, que produce el formato compressed-tensors. La cuantización se basa en la importancia de los canales de activación para minimizar la pérdida de calidad, y el resultado es un checkpoint que puede sustituir directamente al modelo base en vLLM o SGLang sin necesidad de flags adicionales.

## Capacidades

- Generación de texto y conversación multilingüe (inglés y chino) con formato de prompt ChatML (`<|im_start|>`).
- Razonamiento avanzado con modo "thinking" (cadena de pensamiento explícita) y modo "non-thinking" (respuesta directa), seleccionable según el prompt.
- Generación de código en múltiples lenguajes, con soporte para tool calling y function calling.
- Resolución de problemas matemáticos y lógicos de nivel competitivo.
- Comprensión lectora y respuesta a preguntas sobre documentos largos gracias a la ventana de 32K tokens.
- Capacidad de ampliación de contexto hasta 131K tokens mediante YaRN (aunque no está verificado en esta cuantización específica).
- Compatible con frameworks de inferencia que soporten compressed-tensors, como vLLM y SGLang.

## Casos de uso

- Asistentes conversacionales en producción: el modelo puede gestionar diálogos multi-turno con contexto largo (hasta 32K tokens) y alternar entre modos de razonamiento para equilibrar latencia y calidad. Su tamaño cuantizado permite servirlo en una sola GPU de 24 GB con vLLM.
- Generación de código en entornos CI/CD: con soporte de tool calling, puede integrarse en pipelines de revisión de código, autocompletado o generación de tests. La cuantización AWQ reduce la latencia de inferencia, lo que es crítico en integraciones en tiempo real.
- Análisis de documentos técnicos en chino e inglés: su ventana de contexto amplia y su entrenamiento bilingüe lo hacen adecuado para resumir contratos, informes o artículos científicos de gran extensión.
- Chatbots de atención al cliente bilingües: puede manejar consultas en inglés y chino con un solo modelo, reduciendo costes de infraestructura al ocupar solo 6,1 GB en disco.
- Prototipado rápido de agentes autónomos: al ser un modelo de 8B cuantizado, cabe en GPUs de consumo como RTX 3090 o 4090, permitiendo experimentar con razonamiento multi-paso y planificación sin necesidad de clústeres.
- Despliegue en entornos edge o con VRAM limitada: con AWQ 4-bit, el modelo puede ejecutarse en GPUs con 8-10 GB de VRAM, habilitando aplicaciones de IA generativa en estaciones de trabajo modestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización AWQ en la información disponible. El modelo base Qwen3-8B reporta resultados en MMLU, HumanEval, GSM8K y otras pruebas estándar, pero no se dispone de los números exactos en esta ficha. Se recomienda consultar la documentación oficial de Qwen3 para obtener datos de rendimiento del modelo original y asumir una degradación mínima (típicamente inferior al 1-2% en tareas de razonamiento) debido a la cuantización AWQ.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-8 GB para el modelo cuantizado (6,1 GB de pesos + overhead de activaciones y KV cache). Con contexto de 32K tokens, se recomienda al menos 10-12 GB.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A10, A100 (cualquier GPU con al menos 10 GB de VRAM y soporte CUDA). También funciona en Apple Silicon con Metal si se convierte a otro formato.
- Compatibilidad con GPU de consumo: sí, cabe en RTX 3060 12 GB, RTX 3080, etc., aunque con contexto reducido.
- Opciones de despliegue: vLLM (recomendado, detección automática de cuantización), SGLang. Para otros frameworks como llama.cpp u Ollama, sería necesario convertir el checkpoint a GGUF, lo que no está garantizado por el autor.
- Latencia y throughput: no se han publicado mediciones específicas. En vLLM con una RTX 4090, se espera un throughput de 50-100 tokens/s para generación, dependiendo del tamaño de lote y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-8B (base) | 8,19 B | 32K (131K con YaRN) | bf16 | Apache 2.0 | safetensors |
| Qwen3-8B-AWQ (este) | 8,19 B | 32K (131K con YaRN) | AWQ W4A16 | Apache 2.0 | compressed-tensors |
| Llama 3.1 8B Instruct | 8,03 B | 128K | bf16 / AWQ | Llama 3.1 Community License | safetensors / GGUF |
| Mistral 7B Instruct v0.3 | 7,24 B | 32K | bf16 / AWQ | Apache 2.0 | safetensors / GGUF |

La comparativa muestra que Qwen3-8B-AWQ ofrece un contexto nativo similar a Mistral 7B, pero con mejor rendimiento en razonamiento y código según los informes de Qwen3. Frente a Llama 3.1 8B, la licencia Apache 2.0 es más permisiva para uso comercial sin restricciones adicionales. La principal ventaja de esta cuantización es su integración directa con vLLM y SGLang, mientras que Llama y Mistral tienen más ecosistema de herramientas de conversión a GGUF.

## Limitaciones y advertencias

- La cuantización AWQ puede introducir una ligera degradación en tareas de precisión numérica o razonamiento complejo, aunque en la práctica suele ser inferior al 1-2%.
- El modelo solo soporta inglés y chino; no está entrenado para otros idiomas, por lo que su rendimiento en español, francés o alemán será significativamente inferior.
- La ventana de contexto de 32K tokens es nativa, pero la ampliación a 131K con YaRN no está verificada en esta cuantización específica; puede requerir ajustes adicionales.
- El formato compressed-tensors limita la portabilidad: solo funciona con vLLM y SGLang. Para otros frameworks (llama.cpp, Ollama, TGI) es necesario convertir los pesos, lo que no está documentado por el autor.
- Al ser una cuantización de un modelo de terceros, la responsabilidad sobre el comportamiento y los sesgos recae en el modelo base Qwen3-8B. No se han realizado evaluaciones específicas de sesgos o alucinaciones en esta versión.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se debe mantener el aviso de copyright y la atribución correspondiente.

## Enlaces

- Modelo cuantizado: https://huggingface.co/qtum/Qwen3-8B-AWQ
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de llm-compressor: https://github.com/vllm-project/llm-compressor
- Página de Qwen3-8B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_8b
- Referencia de Qwen3-8B-AWQ en llm.co: https://llm.co/llms/qwen3-8b-awq
