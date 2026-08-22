# kingjones777/LFM2.5-1.2B-Instruct-NVFP4

## Resumen

El modelo `kingjones777/LFM2.5-1.2B-Instruct-NVFP4` es una cuantización NVFP4 (W4A4) del checkpoint `LiquidAI/LFM2.5-1.2B-Instruct`, desarrollado por Liquid AI y cuantizado por el usuario kingjones777. Es el primer build NVFP4 de cualquier modelo de la familia LFM2.5, diseñado para aprovechar el soporte nativo de NVIDIA Blackwell (GB10, sm_121a) para pesos y activaciones en punto flotante de 4 bits.

La cuantización reduce el tamaño de los pesos de 2.2 GB (bf16) a 1.02 GiB (una reducción de 2.2×), manteniendo la arquitectura híbrida del modelo base: 16 capas, de las cuales 10 son bloques convolucionales de doble compuerta (LIV) y 6 son bloques de atención completa con Grouped Query Attention (GQA). El modelo base es un LLM instruido de 1.2 mil millones de parámetros, optimizado para tareas de chat, seguimiento de instrucciones y tool calling, con una ventana de contexto de 32.000 tokens.

La relevancia de esta ficha radica en que demuestra cómo cuantizar un modelo híbrido moderno sin degradar sus componentes recurrentes/convolucionales, y ofrece una alternativa de despliegue de baja latencia para hardware Blackwell. El repositorio no tiene descargas ni likes, pero incluye mediciones de rendimiento reales (135.8 t/s en decodificación) y una metodología de cuantización rigurosa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Lfm2ForCausalLM` (híbrida: 10 capas convolucionales LIV + 6 capas de atención GQA) |
| Parámetros totales | 1.170.340.608 (1.17B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.000 tokens |
| Tipos de cuantización | NVFP4 (W4A4), pesos estáticos de 4 bits con `group_size=16`, activaciones dinámicas de 4 bits |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia propia de Liquid AI, heredada del modelo base) |
| Formato de pesos | safetensors con formato `nvfp4-packed-quantized` (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base `LiquidAI/LFM2.5-1.2B-Instruct` emplea una arquitectura híbrida que combina bloques convolucionales de doble compuerta (LIV, Liquid Intelligence Vision) con bloques de atención completa. Esta combinación está diseñada para optimizar el despliegue en hardware de borde, ofreciendo una eficiencia computacional superior a los transformers puros. El modelo fue preentrenado con datos adicionales y refinado con aprendizaje por refuerzo (RLHF) para mejorar el seguimiento de instrucciones y el tool calling.

La cuantización NVFP4 se realizó con `llmcompressor` mediante un esquema `QuantizationModifier(targets="Linear", scheme="NVFP4")`, calibrando las activaciones con el dataset `HuggingFaceH4/ultrachat_200k` (split `train_sft`) a través del template de chat del propio modelo. La novedad clave es que se trata de una cuantización W4A4 real, con escalas globales de entrada (`input_global_scale`) por cada capa lineal cuantizada, lo que permite a SGLang y vLLM servir el modelo correctamente. Las capas convolucionales, las normas y las embeddings quedan en bf16 para preservar la integridad del estado recurrente, evitando la degradación típica de cuantizar modelos híbridos.

## Capacidades

- Generación de texto y chat conversacional multi-turno.
- Seguimiento de instrucciones y tool calling / function calling, gracias al ajuste fino del modelo base.
- Procesamiento de contextos largos de hasta 32.000 tokens, adecuado para análisis de documentos extensos.
- Razonamiento y generación de código, aunque no se han publicado benchmarks específicos para esta cuantización.
- Inferencia eficiente en hardware Blackwell con formato NVFP4, con throughput medido de 135.8 tokens/s en decodificación.
- Compatibilidad con runtime de inferencia que soporten compressed-tensors NVFP4, como SGLang y vLLM.

## Casos de uso

- Despliegue en hardware de borde con NVIDIA GB10 (Blackwell): el formato NVFP4 está optimizado para esta arquitectura, permitiendo ejecutar el modelo en dispositivos de baja potencia con un consumo de memoria reducido (pesos de ~1 GiB).
- Asistentes de atención al cliente automatizada: con tool calling y una ventana de 32K tokens, puede gestionar conversaciones multi-turno complejas, integrando llamadas a APIs de sistemas externos para resolver consultas.
- Generación de código en pipelines de CI/CD: el modelo puede actuar como autocompletador o generador de código en entornos de desarrollo, con tool calling para ejecutar pruebas o consultar repositorios.
- Análisis de documentos largos en entornos locales: la ventana de 32K permite procesar informes, contratos o artículos técnicos sin fragmentar el texto, con una latencia baja en GPU Blackwell.
- Prototipado rápido de aplicaciones de IA generativa: el repositorio incluye instrucciones de lanzamiento con SGLang, lo que facilita su integración en proyectos que requieren un servidor de inferencia ligero.
- Experimentación académica con cuantización extrema: la documentación detalla la metodología de cuantización y los tensores involucrados, sirviendo como caso de estudio para investigadores en compresión de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento medido es el throughput de decodificación de 135.8 tokens/s, obtenido con SGLang en una configuración no especificada. No se proporcionan comparaciones con el modelo base en bf16 ni con otros modelos de la misma familia.

## Requisitos de hardware

- VRAM estimada: los pesos cuantizados ocupan 1.02 GiB, por lo que la VRAM necesaria para inferencia ronda los 1.5-2 GB incluyendo activaciones y overhead, dependiendo de la longitud del contexto.
- GPU recomendadas: NVIDIA Blackwell (GB10, sm_121a) o GPUs con soporte para el formato NVFP4 de compressed-tensors. El modelo ha sido verificado en Blackwell; en otras arquitecturas podría no funcionar correctamente.
- Compatibilidad con GPU consumer: no garantizada, ya que el formato NVFP4 requiere soporte específico de hardware. Se recomienda verificar la compatibilidad del runtime.
- Opciones de despliegue: SGLang `v0.5.18-cu130` (probado) y vLLM nightly (que registra la arquitectura `Lfm2ForCausalLM`). El comando de lanzamiento con SGLang se documenta en el repositorio.
- Latencia y throughput: 135.8 tokens/s en decodificación (medido en el entorno de pruebas del autor).

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (tamaño 1.2B, cuantizados o no). La cuantización NVFP4 es específica de Blackwell y no existe información sobre el rendimiento relativo frente a modelos como Qwen2.5-1.5B, Llama-3.2-1B o el propio modelo base en bf16. Los datos de benchmarks y comparativas no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El formato NVFP4 requiere hardware Blackwell con soporte de compressed-tensors para NVFP4 W4A4; no funcionará en GPUs de generaciones anteriores (Ampere, Ada Lovelace, etc.) sin un runtime que emule el formato, lo que puede degradar el rendimiento.
- La cuantización de 4 bits puede introducir una pérdida de precisión en tareas de razonamiento complejo o matemáticas avanzadas, aunque no se han documentado evaluaciones específicas.
- Los idiomas soportados no se han especificado; el modelo base no indica cobertura lingüística, por lo que se recomienda validar el rendimiento en el idioma objetivo.
- La licencia `lfm1.0` heredada del modelo base debe revisarse para verificar restricciones de uso comercial, ya que no se detallan los términos en la documentación del repositorio.
- El modelo es pequeño (1.2B), por lo que puede presentar limitaciones en tareas de razonamiento de largo alcance o conocimiento factual profundo comparado con modelos más grandes.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que aún no ha sido validado por la comunidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/kingjones777/LFM2.5-1.2B-Instruct-NVFP4
- Modelo base en HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Documentación oficial de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-1.2b-instruct
- Export ONNX del modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-ONNX
- Receta de vLLM para el modelo base: https://recipes.vllm.ai/LiquidAI/LFM2.5-1.2B-Instruct
