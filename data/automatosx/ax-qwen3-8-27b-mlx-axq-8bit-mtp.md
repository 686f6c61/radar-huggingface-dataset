# AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-8bit-MTP

## Resumen

AX-Qwen3.8-27B-MLX-AXQ-8bit-MTP es un checkpoint cuantizado en formato MLX para Apple Silicon, desarrollado por AutomatosX. Se trata de una conversión directa del modelo Qwen/Qwen3.8-27B (arquitectura Qwen3_5ForConditionalGeneration, densa) utilizando el cuantizador AXQuant (AXQ) en modo de precisión mixta. El objetivo es ofrecer una versión optimizada para ejecución local en hardware Apple con memoria unificada, manteniendo la mayor fidelidad posible respecto al modelo original.

El checkpoint aplica cuantización de 8 bits a la ruta de texto principal (96,80% de los parámetros) mientras preserva en BF16 el cabezal de multi-token prediction (MTP) y la torre de visión, que se incluyen como sidecars. El resultado es un paquete de aproximadamente 30,4 GB con un BPW medido de 8,63 para el modelo principal y 8,74 incluyendo MTP. Está pensado para entornos de desarrollo y experimentación en Apple Silicon, con soporte para MLX-LM y AX Engine.

La relevancia de este modelo radica en su enfoque de cuantización mixta con protección de tensores críticos, lo que permite mantener la calidad en tareas de visión y predicción multi-token sin renunciar al ahorro de memoria. No obstante, se trata de un paquete de desarrollo: no se publican métricas de calidad ni se certifica aceleración por MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (densa) |
| Parametros totales | 27,36B (lógicos) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (configurado; límite práctico según memoria unificada) |
| Tipos de cuantizacion | AXQ 8-bit mixed-precision (8,63 BPW medido en el modelo principal; 8,74 BPW total con MTP) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX Safetensors (no incluye PyTorch ni GGUF) |

Nota: el repositorio reporta en safetensors un contador de 7.566.401.024 parámetros, pero la model card indica 27,36B parámetros lógicos. Se toma como referencia el dato de la model card, que es el valor autoritativo del modelo base.

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, una arquitectura transformer densa con capacidades multimodales (texto y visión) y un cabezal de multi-token prediction (MTP). Este checkpoint no es un entrenamiento nuevo, sino una conversión cuantizada del modelo original en BF16. La cuantización se realiza con AXQuant 1.8.1, que asigna precisiones por tensor según un plan de presupuesto de almacenamiento: el 96,80% de los parámetros del modelo principal se cuantizan a 8 bits con grupo de tamaño 64, mientras que el 3,20% restante (tensores protegidos) se mantiene en BF16. Los sidecars de MTP (424,70M parámetros) y visión (460,73M parámetros) se conservan íntegramente en BF16.

No se dispone de información sobre los datos de entrenamiento del modelo base, ni sobre el proceso de calibración de la cuantización (se indica que la asignación se basa en priors de arquitectura, sin calibración). Tampoco se publican métricas de calidad comparadas con el modelo BF16 original.

## Capacidades

- Generación de texto conversacional y completado de texto con contexto largo (hasta 262.144 tokens configurados).
- Procesamiento de visión: incluye una torre de visión protegida en BF16, lo que permite tareas de comprensión de imágenes (no se especifican detalles de las capacidades exactas).
- Multi-token prediction (MTP): el cabezal MTP está presente en BF16, aunque no se certifica aceleración en este checkpoint.
- Ejecución nativa en Apple Silicon mediante MLX-LM y AX Engine.
- Soporte de cuantización mixta con protección de tensores críticos (visión y MTP).

No se mencionan capacidades de tool calling, function calling, agentes ni audio en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el modelo está optimizado para MLX, permitiendo ejecutar un LLM de 27B en equipos con memoria unificada suficiente (por ejemplo, 32 GB o más) sin necesidad de GPU dedicada.
- Prototipado de aplicaciones de chat y asistentes conversacionales: su ventana de contexto de 262K tokens permite manejar conversaciones largas o documentos extensos en una sola pasada.
- Análisis de imágenes con texto: gracias a la torre de visión en BF16, se puede usar para tareas de captioning, VQA o razonamiento visual en entornos locales.
- Experimentación con multi-token prediction: el cabezal MTP está disponible para investigar técnicas de decodificación acelerada, aunque no se garantiza mejora de velocidad.
- Desarrollo de pipelines de generación de texto con contexto largo: por ejemplo, resumen de documentos, generación de informes o análisis de código en repositorios grandes.
- Evaluación de técnicas de cuantización mixta: al ser un checkpoint de desarrollo, sirve como referencia para comparar el impacto de AXQ frente a cuantizaciones uniformes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay métricas de calidad comparadas con el modelo BF16 original ni con baselines uniformes. Tampoco se certifica aceleración por MTP.

## Requisitos de hardware

- Plataforma: Apple Silicon (M1, M2, M3, M4 y sucesores) con memoria unificada.
- Memoria: el peso total del checkpoint es de 30,37 GB. Se recomienda al menos 32 GB de memoria unificada para cargar el modelo completo, y 64 GB o más para operar con comodidad y contexto largo.
- GPU: no requiere GPU discreta; la ejecución usa la GPU integrada y la memoria unificada del chip Apple.
- Runtime: MLX-LM (versión registrada 0.31.3) para inferencia estándar de texto; AX Engine para ejecución nativa con soporte de MTP y manifiesto incluido.
- Latencia y throughput: no disponibles. No se publican mediciones de velocidad.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con alternativas. Sin embargo, se pueden señalar los hermanos del mismo autor:

| Modelo | Cuantización | BPW | Tamaño aprox. | Notas |
|---|---|---|---|---|
| AX-Qwen3.8-27B-MLX-AXQ-8bit-MTP | AXQ 8-bit mixto | 8,74 total | 30,37 GB | Incluye MTP y visión en BF16 |
| AX-Qwen3.8-27B-MLX-AXQ-6bit-MTP | AXQ 6-bit mixto | No disponible | No disponible | Menor presupuesto de almacenamiento |
| AX-Qwen3.8-27B-MLX-AXQ-4bit-MTP | AXQ 4-bit mixto | No disponible | No disponible | Menor presupuesto de almacenamiento |

No se dispone de comparativas con otros modelos cuantizados de la misma familia (por ejemplo, versiones MLX de Qwen2.5 o Llama 3) en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de desarrollo: no se garantiza estabilidad ni rendimiento en producción.
- Sin certificación de velocidad MTP: la presencia del cabezal MTP no implica aceleración real; se requiere verificación con benchmarks idénticos.
- Calidad no publicada: no hay métricas de retención de calidad frente al modelo BF16 original.
- Sin calibración: la asignación de precisión se basa en priors de arquitectura, no en calibración con datos.
- Compatibilidad limitada: MLX-LM puede ignorar los sidecars de visión y MTP, por lo que la funcionalidad multimodal no está garantizada en ese runtime.
- Requisitos de memoria elevados: 30,37 GB de descarga y memoria unificada suficiente; no apto para equipos con menos de 32 GB.
- Idiomas no especificados: aunque Qwen3.8 es presumiblemente multilingüe, no se documenta la cobertura idiomática de este checkpoint.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base Qwen3.8 puede tener sus propias restricciones; se recomienda revisar la licencia del modelo original.

## Enlaces

- [HuggingFace - AX-Qwen3.8-27B-MLX-AXQ-8bit-MTP](https://huggingface.co/AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-8bit-MTP)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Certificado Tier 1 del checkpoint](https://github.com/defai-digital/axquant/blob/main/docs/certifications/qwen38-27b-axq8-mtp-tier1.md)
- [Repositorio AXQuant](https://github.com/defai-digital/axquant)
- [Colecciones de AutomatosX](https://huggingface.co/AutomatosX/collections)
- [Índice completo de modelos MLX de AutomatosX](https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog)
