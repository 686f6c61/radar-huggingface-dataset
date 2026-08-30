# mradermacher/Darwin-9B-NEG-x-Negentropy-V8-i1-GGUF

## Resumen

Darwin-9B-NEG-x-Negentropy-V8-i1-GGUF es una cuantización GGUF (formato i1 con imatrix) del modelo Darwin-9B-NEG-x-Negentropy-V8, desarrollado por FINAL-Bench y cuantizado por mradermacher. El modelo original es un merge evolutivo basado en el backbone Qwen3.5-9B, que incorpora dos innovaciones arquitectónicas: Native Entropy Gating (NEG) y Negentropy. NEG integra un mecanismo de autoconfianza directamente en los pesos del modelo, permitiendo un razonamiento autorregulado sin coste adicional de inferencia. El modelo está diseñado para tareas de razonamiento y generación de texto multilingüe, con soporte para coreano, inglés, chino y japonés.

Esta versión GGUF ofrece múltiples niveles de cuantización (desde Q2_K hasta Q4_K_M) con tamaños de archivo entre 3,9 y 5,7 GB, lo que facilita su despliegue en hardware de consumo. El modelo base cuenta con aproximadamente 8,95 mil millones de parámetros (más unos 4 millones adicionales en los módulos NEG), bajo licencia Apache 2.0. Su relevancia radica en combinar un tamaño compacto con técnicas de autorregulación de confianza, una aproximación poco común en modelos abiertos de esta escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5-9B con módulos Native Entropy Gating (NEG) y Negentropy |
| Parametros totales | 8.953.803.264 (más ~4M en módulos NEG, total <9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF i1: Q2_K, IQ3_XXS, IQ3_M, Q3_K_M, Q4_K_S, IQ4_NL, Q4_K_M (además de archivo imatrix) |
| Idiomas soportados | Coreano, inglés, chino, japonés, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); safetensors (modelo original) |

## Arquitectura y entrenamiento

El modelo original Darwin-9B-NEG-x-Negentropy-V8 se construye sobre el backbone Qwen3.5-9B mediante un proceso de merge evolutivo. Su principal innovación es Native Entropy Gating (NEG), un mecanismo que incorpora una señal de autoconfianza directamente en los pesos, permitiendo al modelo regular su propio razonamiento sin coste adicional de inferencia (1×). También incorpora Negentropy, una técnica relacionada con la entropía negativa que probablemente refuerza la calibración de la confianza. Se menciona además "trace-inversion" como parte del proceso de merge.

No se dispone de información detallada sobre el entrenamiento: número de tokens, composición del dataset, uso de RLHF/DPO o cualquier otra técnica de alineación. Tampoco se especifica la longitud de contexto original. La cuantización GGUF fue realizada por mradermacher utilizando el método imatrix (importance matrix) para optimizar la calidad de los quants de baja precisión.

## Capacidades

- Generación de texto y razonamiento: el modelo está etiquetado con "reasoning" y "vidraft", lo que sugiere capacidades de razonamiento lógico y posiblemente generación de borradores o respuestas estructuradas.
- Multilingüe: soporta coreano, inglés, chino y japonés, con etiqueta "multilingual".
- Autorregulación de confianza: gracias a NEG, el modelo puede ajustar su nivel de certeza internamente, lo que podría reducir respuestas excesivamente seguras o dudosas.
- No se han documentado capacidades específicas de tool calling, function calling, visión o audio en la información disponible.

## Casos de uso

- Asistente conversacional multilingüe: al soportar coreano, inglés, chino y japonés, puede desplegarse como chatbot en entornos multilingües, por ejemplo en atención al cliente para mercados asiáticos, gestionando conversaciones de varios turnos con razonamiento contextual.
- Generación de contenido en coreano: dado su origen y énfasis en coreano, es adecuado para redacción de artículos, resúmenes o traducciones de alta calidad en ese idioma, aprovechando su capacidad de razonamiento para mantener coherencia.
- Razonamiento lógico y análisis de texto: su etiqueta "reasoning" lo hace útil para tareas de deducción, clasificación de sentimientos o extracción de conclusiones a partir de documentos, especialmente en entornos con recursos limitados.
- Prototipado rápido en local: al estar disponible en GGUF, puede ejecutarse en portátiles con GPU de consumo (por ejemplo, RTX 3060) mediante llama.cpp u Ollama, permitiendo pruebas de concepto sin infraestructura cloud.
- Educación y tutoría: puede utilizarse como tutor de idiomas o de lógica, generando explicaciones paso a paso y adaptando el nivel de detalle según la confianza del modelo en su respuesta.
- Investigación en eficiencia de modelos: su arquitectura con NEG y Negentropy lo convierte en un caso de estudio para investigadores interesados en mecanismos de autoconfianza en modelos de lenguaje, permitiendo experimentos de inferencia y análisis de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este modelo o sus cuantizaciones.

## Requisitos de hardware

- VRAM estimada: según el quant elegido, se necesitan aproximadamente 4-6 GB de VRAM para los quants más pequeños (Q2_K, IQ3_XXS) y 6-8 GB para Q4_K_M (tamaño de archivo 5,7 GB más overhead de contexto y KV cache).
- GPU recomendadas: tarjetas consumer como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o superiores pueden ejecutar el modelo cómodamente. También es posible en GPU con 8 GB (por ejemplo, RTX 3050) usando quants de baja precisión.
- CPU: puede ejecutarse en CPU con al menos 8 GB de RAM libre, aunque la velocidad será menor. Se recomienda usar llama.cpp con compilación optimizada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. Para el modelo original en safetensors, se puede usar vLLM o Transformers con carga en GPU.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, se espera una generación de 20-40 tokens/s para quants Q4, pero esto depende del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos. El modelo comparte características con otros modelos de ~9B basados en Qwen (como Qwen2.5-7B o Qwen3-8B), pero no hay datos de rendimiento comparables. Se recomienda consultar benchmarks independientes antes de elegir este modelo frente a alternativas como Llama 3.1 8B o Mistral 7B.

## Limitaciones y advertencias

- No hay documentación pública detallada sobre sesgos, alucinaciones o comportamientos adversos. Al ser un modelo experimental (merge evolutivo), su comportamiento puede ser menos predecible que el de modelos entrenados desde cero.
- La cuantización GGUF introduce pérdida de calidad, especialmente en los quants de menor precisión (Q2_K, IQ3_XXS). Se recomienda usar Q4_K_M o superior para tareas críticas.
- La longitud de contexto no está especificada; se desconoce si el modelo soporta ventanas largas (por ejemplo, 32K o más). Es necesario probar empíricamente.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base es un merge de Qwen3.5, por lo que se deben revisar las licencias de los componentes originales (Qwen3.5 puede tener restricciones adicionales).
- No se han publicado evaluaciones de seguridad o robustez. No se recomienda su uso en aplicaciones de alto riesgo sin una validación exhaustiva.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Darwin-9B-NEG-x-Negentropy-V8-i1-GGUF
- Modelo base (safetensors): https://huggingface.co/FINAL-Bench/Darwin-9B-NEG-x-Negentropy-V8
- Página de cuantizaciones estáticas: https://huggingface.co/mradermacher/Darwin-9B-NEG-x-Negentropy-V8-GGUF
- Ficha en Inferix: https://inferix.co/models/ansulev/Darwin-9B-NEG
- Ficha en ThinkLLM: https://www.thinkllm.dev/models/darwin-9b-neg
