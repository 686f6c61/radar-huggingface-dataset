# Pilcothink/Qwen3.8-27B-MixedInt2-ultra-lite

## Resumen

El modelo **Pilcothink/Qwen3.8-27B-MixedInt2-ultra-lite** es una versión cuantizada del checkpoint multimodal `Qwen/Qwen3.8-27B` de Alibaba, desarrollada por el usuario Pilcothink. La cuantización se ha realizado con Intel AutoRound, empleando una configuración de precisión mixta (INT2/INT3) que reduce notablemente los requisitos de memoria y facilita la inferencia en entornos con recursos limitados, manteniendo la calidad general del modelo original. La arquitectura base es un transformer denso de 27.000 millones de parámetros con atención híbrida, diseñado para tareas de texto e imagen, y con soporte nativo para razonamiento y tool calling.

Este modelo es relevante porque permite desplegar un sistema multimodal de alto rendimiento en hardware más asequible, gracias a una cuantización agresiva que conserva los componentes de visión en precisión original. Es una opción práctica para equipos que necesitan ejecutar un modelo de 27B en GPUs de consumo o en entornos con presupuesto de VRAM limitado, sin sacrificar por completo las capacidades del modelo original. La licencia Apache 2.0 permite uso comercial y modificación, lo que facilita su integración en productos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (16 capas de atención completa y 48 con atención eficiente) |
| Parametros totales | 3.029.765.360 (según safetensors; inconsistente con el modelo base de 27B) |
| Parametros activos | No disponible (modelo denso, no MoE) |
| Longitud de contexto | 262144 tokens (según ejemplos de vLLM; ampliable a 1.010.000 con override) |
| Tipos de cuantizacion | Mixta INT2/INT3 (AutoRound) con group size 32, 64 y 128 |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 soporta múltiples idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con 64 capas, de las cuales 16 utilizan atención completa y las restantes emplean un mecanismo de atención eficiente (híbrida), siguiendo el diseño de la familia Qwen3.8. Incluye un módulo de visión que procesa imágenes, lo que lo convierte en un modelo multimodal. La cuantización realizada por Pilcothink no modifica la arquitectura, sino que reduce la precisión de los pesos de la mayoría de las capas (manteniendo la visión en precisión original) mediante un esquema de precisión mixta configurado con Intel AutoRound. No se ha realizado ningún fine-tuning ni entrenamiento adicional; se trata únicamente de una compresión post-entrenamiento.

El proceso de cuantización se optimizó para equilibrar calidad, memoria y compatibilidad con vLLM. Los group size varían entre 32 y 128 según la capa, lo que permite una asignación granular de precisión. No se han publicado detalles sobre la distribución exacta de precisión ni sobre el dataset de calibración utilizado.

## Capacidades

- **Multimodal**: procesa imágenes y texto, lo que permite tareas como descripción de imágenes, VQA y razonamiento visual.
- **Generación de texto**: respuestas conversacionales, resúmenes, redacción creativa y técnica.
- **Razonamiento**: soporta modos de razonamiento (reasoning parser qwen3) para tareas de lógica y matemáticas.
- **Tool calling**: compatible con auto-tool-choice y tool-call-parser qwen3_coder, ideal para agentes y llamadas a funciones.
- **Agentes**: puede encadenar múltiples pasos de razonamiento y ejecutar acciones.
- **Multilingüe**: el modelo base soporta múltiples idiomas, aunque la cuantización no afecta a esta capacidad.
- **Compatibilidad con vLLM**: optimizado para servir con vLLM, incluyendo decodificación especulativa (MTP) y caché de prefijo.

## Casos de uso

- **Asistentes virtuales de bajo coste**: el tamaño reducido (14 GB) permite desplegar un asistente multimodal en una RTX 4090 o en un clúster de dos GPUs más modestas, manteniendo conversaciones de largo contexto (hasta 256K tokens) y comprensión de imágenes.
- **Automatización de atención al cliente**: con soporte de tool calling, el modelo puede gestionar consultas complejas multi-turno, acceder a bases de conocimiento externas y ejecutar acciones como reservas o consultas de datos.
- **Análisis de documentos con imágenes**: al ser multimodal, puede extraer información de capturas de pantalla, gráficos o documentos escaneados, combinando texto e imagen para generar informes.
- **Agentes de automatización**: en entornos de producción, puede actuar como agente que decide qué herramientas invocar (búsqueda, cálculo, API) y ejecuta tareas de varios pasos, gracias a su capacidad de razonamiento y tool calling.
- **Desarrollo de prototipos con recursos limitados**: para equipos que no tienen acceso a GPUs de gran memoria, esta cuantización permite experimentar con un modelo de 27B en hardware de consumo, reduciendo el coste de iteración.
- **Sistemas de recuperación aumentada (RAG)**: su largo contexto (262K tokens) permite procesar grandes colecciones de documentos y responder con información de contexto completo, sin necesidad de fragmentación excesiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tabla de evaluación en la model card aparece vacía, sin valores para MMLU, GSM8K, ARC-Challenge, BoolQ, HellaSwag, PIQA ni WinoGrande. Por tanto, no es posible cuantificar la recuperación de calidad respecto al modelo original. Se recomienda evaluar el modelo en los casos de uso específicos antes de su despliegue en producción.

## Requisitos de hardware

- **VRAM estimada**: el repositorio ocupa 14 GB, lo que sugiere que el modelo completo en FP16 o con cuantización mixta puede cargarse en una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080/4090). En configuraciones de 2 GPUs, se puede usar tensor-parallel-size 2 para repartir la carga.
- **GPUs recomendadas**: RTX 4090 (24 GB), A100 (40/80 GB), H100, o GPUs de 16 GB como RTX 4080 o A10G.
- **Compatibilidad con consumer GPUs**: sí, una RTX 4090 es suficiente para cargar el modelo completo. Para GPUs de 12 GB, se recomienda usar versiones aún más ligeras o cuantizaciones de menor tamaño.
- **Opciones de despliegue**: vLLM (compatible con AutoRound y soporte para MTP), también podría usarse llama.cpp o Transformers con cuantización, aunque la model card indica que vLLM es el entorno recomendado.
- **Latencia y throughput**: no se proporcionan datos. En vLLM, con `--max-num-batched-tokens 8192` y `--max-num-seqs 10`, se puede esperar un throughput razonable para inferencia en lote, pero los valores concretos dependen del hardware y la longitud de las secuencias.

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos cuantizados en la información proporcionada. A modo de referencia, el modelo original Qwen3.8-27B (sin cuantizar) requiere alrededor de 54 GB en FP16, mientras que esta versión reduce el tamaño a 14 GB. Otras alternativas como Llama 3.1 8B o Qwen3-8B tienen menor capacidad, pero no son directamente comparables por tamaño. No se puede realizar una comparativa justa sin datos de benchmarks.

## Limitaciones y advertencias

- **Posible degradación de calidad**: la cuantización a INT2/INT3 puede provocar pérdidas de precisión en tareas complejas de razonamiento o generación de código. No se han publicado métricas de recuperación, por lo que se recomienda evaluar antes de usar en producción.
- **Inconsistencia en la información**: el nombre del modelo dice "MixedInt2" pero la model card menciona "MixedInt3" en varias secciones. Además, el número de parámetros reportado (3.03B) no coincide con el modelo base de 27B, lo que sugiere un error en la metadata. Esto puede causar confusión al integrar el modelo en plataformas.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar información no verificada. La cuantización puede aumentar este riesgo en ciertos dominios.
- **Limitaciones de idioma**: no se especifican los idiomas soportados; el modelo base de Qwen3.8 soporta muchos idiomas, pero la cuantización no debería afectar, aunque se recomienda probar en el idioma de destino.
- **Compatibilidad**: el modelo requiere motores de inferencia que soporten AutoRound (vLLM con ciertas versiones). Otros frameworks pueden no ser compatibles.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial, pero se deben respetar los términos de la licencia del modelo base Qwen3.8-27B (que también es Apache 2.0). No se indica ninguna restricción adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pilcothink/Qwen3.8-27B-MixedInt2-ultra-lite
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Página de QwenCloud sobre Qwen3.8-27B: https://www.qwencloud.com/models/qwen3.8-27b
- Documentación de vLLM para Qwen3.8-27B: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.8-27B.html
- Referencia en Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
