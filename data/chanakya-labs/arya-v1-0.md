# Chanakya-Labs/Arya-v1.0

## Resumen

Arya-v1.0 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) nativo, desarrollado por Chanakya-Labs como proyecto de investigación. Está construido sobre la base de DeepSeek-V2-Lite, del que hereda la arquitectura de atención latente multi-cabeza (MLA) y lo combina con un mecanismo de mezcla de secuencias en tiempo lineal (GDN, probablemente Gated Delta Network) y predicción multi-token (MTP-2). El modelo presenta 7.1 mil millones de parámetros totales con solo 1.4 mil millones activos por token, lo que lo sitúa en la categoría de MoE eficientes para despliegue en hardware moderado.

La relevancia de Arya-v1.0 radica en su enfoque de "MoE nativo" desde el diseño, en contraste con modelos que convierten arquitecturas densas a MoE posteriormente. Su licencia Apache 2.0 permite uso comercial sin restricciones, aunque al ser una versión de investigación (etiquetada como "Research") no se ofrecen garantías de robustez ni soporte oficial. La información pública es limitada: no se han publicado benchmarks, detalles del dataset de entrenamiento ni documentación técnica completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE nativo con MLA (Multi-head Latent Attention) + GDN (Gated Delta Network) + MTP-2 (Multi-Token Prediction) |
| Parametros totales | 7.1B |
| Parametros activos | 1.4B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

La arquitectura de Arya-v1.0 combina varios componentes innovadores. Por un lado, utiliza MLA (Multi-head Latent Attention), una técnica que reduce el coste de la atención mediante la compresión de las claves y valores en un espacio latente, ya empleada en DeepSeek-V2. Por otro lado, incorpora GDN (Gated Delta Network), un mecanismo de mezcla de secuencias en tiempo lineal que permite procesar secuencias largas con complejidad computacional reducida frente a la atención cuadrática tradicional. El modelo también incluye un esquema de enrutamiento disperso con top-4 (selección de 4 expertos por token) y una estructura de 32 capas con 32+1 expertos, junto con "4-stream GR" (probablemente gated residual connections en cuatro flujos) y predicción multi-token (MTP-2), que entrena al modelo para predecir dos tokens futuros simultáneamente, mejorando la eficiencia de inferencia.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card solo indica que es un modelo de investigación y que el repositorio se ha completado recientemente con los pesos. Al estar basado en DeepSeek-V2-Lite, es probable que herede parte de la arquitectura base, pero no se confirman detalles adicionales.

## Capacidades

- Generación de texto y razonamiento: como modelo de lenguaje, puede generar texto coherente y realizar tareas de razonamiento básico, aunque no se han publicado evaluaciones específicas.
- Eficiencia computacional: gracias a su diseño MoE con solo 1.4B parámetros activos, ofrece un buen equilibrio entre capacidad y coste de inferencia.
- Procesamiento de secuencias largas: la combinación de MLA y GDN sugiere capacidad para manejar contextos extensos, aunque no se especifica la longitud máxima.
- Predicción multi-token: la inclusión de MTP-2 puede acelerar la generación autora, reduciendo el número de pasos de decodificación.
- Soporte de tool calling y agentes: no se menciona explícitamente, por lo que se considera no disponible.
- Capacidades multilingües: no se especifican idiomas soportados.

## Casos de uso

- Prototipado de aplicaciones de IA generativa: al ser un modelo de investigación con licencia permisiva, es adecuado para experimentar con arquitecturas MoE eficientes en entornos de desarrollo.
- Investigación académica en eficiencia de MoE: su diseño con GDN y MTP-2 puede servir como banco de pruebas para estudiar técnicas de mezcla de secuencias y predicción multi-token.
- Despliegue en entornos con recursos limitados: con solo 1.4B parámetros activos, puede ejecutarse en GPUs de consumo medio, lo que lo hace útil para aplicaciones donde el coste de inferencia es crítico.
- Generación de texto en tiempo real: la predicción multi-token podría reducir la latencia en aplicaciones de chat o completado de texto, aunque no hay datos medidos.
- Fine-tuning para tareas específicas: al ser un modelo base, puede ajustarse para dominios concretos como resumen, traducción o análisis de sentimiento, siempre que se disponga de datos etiquetados.
- Educación y divulgación: su licencia abierta y su tamaño moderado lo convierten en un candidato para cursos de arquitecturas de modelos avanzados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se ofrecen comparativas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con 7.1B parámetros totales y 1.4B activos, una cuantización de 4 bits podría requerir alrededor de 4-5 GB de VRAM para los pesos, más memoria para activaciones y contexto. Sin cuantizar, se estiman 14-15 GB.
- GPU recomendadas: para inferencia en FP16, una GPU con 16 GB de VRAM (por ejemplo, RTX 4080, A100 40GB) sería suficiente. Con cuantización, una RTX 3060 de 12 GB podría ser viable.
- Si cabe en consumer GPU: sí, con cuantización (GGUF o similar) podría ejecutarse en GPUs de gama media como RTX 3060 o RTX 4070.
- Opciones de despliegue: al no haber formatos confirmados, se puede asumir compatibilidad con frameworks como vLLM, llama.cpp u Ollama si se convierten los pesos, pero no está garantizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Arya-v1.0 | 7.1B | 1.4B | no disponible | Apache 2.0 | MoE nativo con MLA+GDN+MTP |
| DeepSeek-V2-Lite | 15.7B (aprox.) | 2.4B (aprox.) | 128K | MIT | Modelo base, MoE con MLA |
| Qwen2.5-7B | 7.6B | 7.6B (denso) | 128K | Apache 2.0 | Denso, no MoE |

Nota: los datos de DeepSeek-V2-Lite y Qwen2.5-7B son aproximados y provienen de conocimiento general; no se han verificado en esta búsqueda. La comparativa es orientativa, ya que no hay benchmarks de Arya-v1.0.

## Limitaciones y advertencias

- Modelo de investigación: no se garantiza estabilidad, robustez ni seguridad para uso en producción.
- Sin datos de sesgos ni alucinaciones: no se han realizado evaluaciones de sesgo o veracidad, por lo que el riesgo de alucinación es desconocido.
- Documentación incompleta: no se especifican idiomas, contexto máximo, ni detalles de entrenamiento, lo que dificulta su uso fiable.
- Posible falta de soporte de tool calling y agentes: no se menciona en la documentación, por lo que no se recomienda para aplicaciones que requieran estas capacidades.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo derivado de DeepSeek-V2-Lite, hay que verificar si la licencia del modelo base impone restricciones adicionales (DeepSeek-V2-Lite usa MIT, por lo que no debería haber conflicto).
- Sin garantía de compatibilidad con frameworks estándar: al no publicarse formatos de pesos, puede requerir conversión manual.

## Enlaces

- [HuggingFace: Chanakya-Labs/Arya-v1.0](https://huggingface.co/Chanakya-Labs/Arya-v1.0)
- [HuggingFace: Aniket789/Arya (Arya-3B-MoE)](https://huggingface.co/Aniket789/Arya)
- [Sitio web de ARYA Labs](https://aryalabs.io/)
- [Sitio web de Chanakya AI](https://chanakya-ai.com/)
- [HuggingFace: ARYA-LABS/arya-speaks-models](https://huggingface.co/ARYA-LABS/arya-speaks-models)
- [Sitio web de Arya.ai](https://arya.ai/)
