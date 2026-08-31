# Akushon/Tensor-0.1-35B-A3B

## Resumen

Tensor-0.1-35B-A3B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) derivado de Qwen3.5-35B-A3B, publicado por el usuario Akushon en Hugging Face. Se trata de una versión cuantizada en NVFP4 (formato de coma flotante de 4 bits de NVIDIA), lo que reduce el tamaño del modelo a aproximadamente 17 GB y facilita su despliegue en hardware con memoria limitada. El modelo base, desarrollado por el equipo de Qwen, cuenta con 35 000 millones de parámetros totales y unos 3 000 millones de parámetros activos por token, lo que lo hace especialmente eficiente para inferencia de alto rendimiento.

La relevancia de este modelo radica en su combinación de arquitectura MoE, contexto largo de 262 144 tokens y cuantización NVFP4, que permite ejecutar un modelo de gran capacidad en una única GPU de consumo. Está orientado a tareas de generación de texto, razonamiento y procesamiento de documentos extensos, con soporte para inglés y chino. No se han publicado detalles sobre el proceso de entrenamiento o ajuste posterior, más allá de la indicación de que se trata de un modelo "auto-post-entrenado" a partir del base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5Moe (Mixture-of-Experts) |
| Parametros totales | 35B (nominal) / 14 652 085 616 en safetensors (cuantizado) |
| Parametros activos | ~3B (segun nomenclatura A3B) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | NVFP4 (4-bit floating point) |
| Idiomas soportados | en, zh |
| Licencia | other (misma que el modelo base Qwen3.5-35B-A3B) |
| Formato de pesos | safetensors (cuantizado NVFP4) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura Qwen3_5Moe, una variante de transformer con capas de mezcla de expertos. En este tipo de arquitectura, solo una fracción de los parámetros totales se activa por token (aproximadamente 3B), lo que reduce el coste computacional por paso manteniendo una alta capacidad de representación. La cuantización NVFP4 convierte los pesos a precisión de 4 bits en coma flotante, un formato diseñado por NVIDIA para acelerar la inferencia en GPUs modernas (Hopper y posteriores) con pérdida mínima de calidad.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. La model card indica únicamente que el modelo es "self-postrained" (auto-post-entrenado) a partir de Qwen3.5-35B-A3B, sin más detalles. Tampoco se documentan innovaciones técnicas adicionales más allá de la cuantización.

## Capacidades

- Generación de texto y conversación multilingüe (inglés y chino), heredadas del modelo base Qwen3.5-35B-A3B.
- Razonamiento y resolución de problemas matemáticos y lógicos, gracias a la arquitectura MoE de gran capacidad.
- Generación de código y asistencia en programación, capacidad típica de la familia Qwen3.5.
- Procesamiento de contextos muy largos (hasta 262 144 tokens), adecuado para documentos extensos, libros o conversaciones de múltiples turnos.
- Inferencia eficiente en memoria gracias a la cuantización NVFP4, que reduce el tamaño del modelo a ~17 GB.
- Compatible con el pipeline `image-text-to-text` de Hugging Face, lo que sugiere posible soporte multimodal (aunque no se detalla en la documentación).

## Casos de uso

- Procesamiento de documentos legales o académicos extensos: gracias a su ventana de 262 144 tokens, el modelo puede resumir, extraer información o responder preguntas sobre contratos, informes o tesis completas sin necesidad de dividir el texto.
- Asistente de programación en entornos con recursos limitados: al ocupar solo ~17 GB, puede ejecutarse en una GPU de 24 GB (por ejemplo, RTX 3090 o 4090) y ofrecer sugerencias de código, depuración y explicaciones en tiempo real.
- Chat conversacional bilingüe (inglés-chino): el modelo puede mantener diálogos largos con memoria de contexto amplia, útil para aplicaciones de atención al cliente o tutoría de idiomas.
- Análisis de grandes volúmenes de texto en investigación: permite procesar corpus completos de artículos o noticias en una sola pasada, identificando temas, entidades o sentimientos.
- Generación de contenido creativo de formato largo: redacción de guiones, novelas o informes técnicos con coherencia a lo largo de decenas de miles de tokens.
- Despliegue en entornos de producción con GPUs de gama media: la cuantización NVFP4 reduce los requisitos de VRAM, lo que abarata el coste de inferencia en comparación con el modelo sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, y no se han encontrado evaluaciones independientes del modelo cuantizado. Se recomienda realizar pruebas propias para validar su rendimiento en las tareas objetivo.

## Requisitos de hardware

- Tamaño del repositorio: 17.2 GB, lo que indica que el modelo cuantizado ocupa aproximadamente 17 GB en disco.
- VRAM estimada para inferencia: al ser NVFP4 (4 bits), el modelo requiere alrededor de 17-20 GB de VRAM para cargar los pesos, más overhead de activaciones y memoria intermedia. Se recomienda una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A5000) para una ejecución cómoda.
- GPUs compatibles: la cuantización NVFP4 está optimizada para GPUs NVIDIA con arquitectura Hopper (H100) o posterior, aunque también puede ejecutarse en Ampere con emulación de software (con menor rendimiento).
- Opciones de despliegue: se requiere un backend compatible con NVFP4, como TensorRT-LLM, vLLM con soporte para cuantización NVFP4, o el propio Transformers con las dependencias adecuadas. No es compatible con llama.cpp u Ollama en su configuración estándar, ya que estos no soportan NVFP4.
- Latencia y throughput: no se dispone de datos medidos. En general, un MoE con ~3B parámetros activos puede alcanzar decenas de tokens por segundo en una GPU de 24 GB, pero depende del backend y del tamaño del lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tensor-0.1-35B-A3B (este) | 35B totales, ~3B activos | 262 144 | NVFP4 (4-bit) | other | Hugging Face |
| Qwen3.5-35B-A3B (base) | 35B totales, ~3B activos | 262 144 | FP16/BF16 | Apache 2.0 (probable) | Hugging Face |
| Ornith-1 35B-A3B | 35B totales, ~3B activos | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a modelos de la misma familia MoE con ~35B parámetros. El modelo base sin cuantizar ofrece mayor precisión numérica pero requiere el doble de memoria. Ornith-1 es otro MoE similar, pero no se dispone de datos suficientes para una comparación detallada. No se han encontrado alternativas de otros fabricantes con cuantización NVFP4 en este rango de tamaño.

## Limitaciones y advertencias

- Licencia "other": no se especifican los términos exactos, pero al derivar de Qwen3.5-35B-A3B, es probable que herede restricciones de uso comercial. Se recomienda revisar la licencia del modelo base antes de utilizarlo en producción.
- Idiomas limitados: solo inglés y chino. No se garantiza un buen rendimiento en otros idiomas.
- Requisito de backend especializado: la cuantización NVFP4 no es compatible con todos los frameworks de inferencia. Es necesario verificar que el entorno de despliegue soporte este formato.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento complejo o con contextos ambiguos.
- Sin datos de evaluación: al no publicarse benchmarks, no es posible conocer su rendimiento real en tareas estándar. Se recomienda validar el modelo con casos de uso propios.
- Posible degradación por cuantización: la conversión a 4 bits puede introducir pérdida de precisión en tareas numéricas o de razonamiento, aunque NVFP4 está diseñado para minimizar este efecto.
- Fecha de publicación futura: el modelo fue creado en agosto de 2026, lo que sugiere que puede ser una versión experimental o no verificada por la comunidad.

## Enlaces

- [Hugging Face - Akushon/Tensor-0.1-35B-A3B](https://huggingface.co/Akushon/Tensor-0.1-35B-A3B)
- [Modelo base Qwen3.5-35B-A3B (referencia)](https://huggingface.co/Qwen/Qwen3.5-35B-A3B)
- [Guía de Qwen 3.6 (insiderllm.com)](https://insiderllm.com/guides/qwen-3-6-local-ai-guide/)
- [Model Variants and Checkpoints - Ornith-1 (DeepWiki)](https://deepwiki.com/ornith-ai/Ornith-1/2-model-variants-and-checkpoints)
- [Jetson AI Lab - Modelos soportados](https://www.jetson-ai-lab.com/models/)
