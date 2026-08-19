# kerasformers/modernbert_base

## Resumen

`kerasformers/modernbert_base` es una conversión del modelo ModernBERT-base de AnswerDotAI al formato de la librería KerasFormers, que implementa arquitecturas de transformers en Keras 3 puro, ejecutable sobre JAX, PyTorch o TensorFlow. Esta conversión permite a los desarrolladores que trabajan con Keras aprovechar el rendimiento de ModernBERT sin depender de PyTorch, facilitando la integración en pipelines basados en Keras.

ModernBERT es un encoder transformer modernizado que incorpora mejoras significativas sobre el BERT original: rotación de embeddings posicionales (RoPE), capas GeGLU, atención alternada y una ventana de contexto de hasta 8192 tokens. Fue entrenado sobre 2 billones de tokens de texto y código, lo que lo convierte en una opción eficiente para tareas de clasificación, recuperación y búsqueda híbrida. Esta versión base cuenta con 22 capas y 149 millones de parámetros.

La relevancia de este modelo reside en que ofrece una alternativa de tamaño reducido y alta eficiencia para tareas de codificación de texto y código, con una licencia Apache 2.0 que permite uso comercial sin restricciones. El hecho de estar disponible en Keras 3 amplía su accesibilidad a un ecosistema de desarrollo distinto del habitual en modelos de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT) |
| Parámetros totales | 149 millones (según modelo base) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantización | no disponible (el repo solo contiene pesos en formato H5) |
| Idiomas soportados | no disponible (no especificado en la información) |
| Licencia | Apache 2.0 |
| Formato de pesos | H5 (archivo `model.weights.h5`) |

## Arquitectura y entrenamiento

ModernBERT es un encoder-only transformer que incorpora varias mejoras sobre BERT: utiliza rotación de posiciones (RoPE) para soportar secuencias largas, capas GeGLU en lugar de las activaciones tradicionales, y una técnica de "unpadding" que evita el cómputo desperdiciado en tokens de relleno. Además, emplea atención alternada (alternating attention) para reducir la complejidad computacional en secuencias largas.

El modelo base fue entrenado sobre 2 billones de tokens de texto y código, con un objetivo de modelado de lenguaje enmascarado (MLM). No se menciona el uso de RLHF ni DPO. La conversión a kerasformers mantiene los pesos originales sin reentrenamiento, por lo que las características de entrenamiento son las mismas que las de ModernBERT-base.

## Capacidades

- Generación de representaciones de texto (embeddings) para tareas de clasificación, recuperación y búsqueda.
- Soporte de contexto largo (hasta 8192 tokens) gracias a la atención con rotación de posiciones.
- Capacidad de procesamiento de texto y código de forma simultánea, ya que fue entrenado con ambos tipos de datos.
- Pipeline de fill-mask, es decir, puede predecir tokens enmascarados, aunque su uso principal es como encoder para tareas posteriores.
- No se dispone de información sobre tool calling, agentes o razonamiento multi-paso, ya que se trata de un encoder, no de un modelo generativo.

## Casos de uso

- **Clasificación de texto en producción**: el modelo puede generar representaciones de alta calidad para entrenar clasificadores de sentimiento, categorización de documentos o detección de spam. Su contexto de 8192 tokens permite procesar documentos largos de forma eficiente.

- **Búsqueda semántica híbrida (texto + código)**: al estar entrenado con código y texto, es adecuado para indexar y recuperar fragmentos de código y documentación técnica en sistemas de búsqueda empresarial.

- **Clasificación de código**: puede utilizarse para etiquetar repositorios, detectar lenguaje de programación o identificar patrones de código en pipelines de análisis estático.

- **Análisis de documentos legales**: la ventana de contexto larga permite procesar cláusulas completas o párrafos extensos sin truncar, lo que mejora la precisión en tareas de extracción de entidades o clasificación de contratos.

- **Generación de embeddings para bases de datos vectoriales**: el modelo puede alimentar motores de recomendación o sistemas de RAG, generando vectores de alta calidad para texto y código.

- **Preentrenamiento de tareas específicas**: al ser un modelo de tamaño moderado (149M), puede ajustarse con pocos recursos para tareas de dominio específico, como análisis de sentimiento en redes sociales o clasificación de tickets de soporte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas de evaluación. Los benchmarks del modelo base ModernBERT se encuentran en el paper original, pero no se han reproducido aquí.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 149M de parámetros en precisión float32, el modelo ocupa aproximadamente 600 MB de memoria. En cuantización de 8 bits, el uso de VRAM se reduce a unos 150 MB, y en 4 bits a unos 75 MB (aunque no se proporcionan cuantizaciones específicas en el repo).
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en float32. Para producción con mayor throughput, se recomienda una GPU como RTX 3060 o superior.
- **Compatibilidad con GPU consumer**: sí, cabe en GPUs de consumo como la RTX 3060, RTX 4070, etc., incluso con cuantización ligera.
- **Opciones de despliegue**: al ser un modelo Keras 3, puede ejecutarse en JAX, TensorFlow o PyTorch mediante la librería kerasformers. No se han documentado integraciones con vLLM, llama.cpp o Ollama.
- **Latencia y throughput**: no se dispone de datos concretos; se estima que un modelo de este tamaño puede procesar decenas de secuencias por segundo en una GPU moderna, pero depende del hardware y la longitud de secuencia.

## Comparativa con modelos similares

La siguiente tabla compara ModernBERT-base (el modelo original) con otros encoders de tamaño similar:

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| BERT-base | 110M | 512 | 3.3B tokens | Apache 2.0 |
| RoBERTa-base | 125M | 512 | 160GB de texto | MIT |
| ModernBERT-base | 149M | 8192 | 2T tokens | Apache 2.0 |

ModernBERT-base ofrece el mayor contexto (8192 tokens) y el mayor volumen de datos de entrenamiento (2T tokens), lo que lo hace especialmente eficiente para tareas que requieren secuencias largas, como procesamiento de código o documentos extensos.

## Limitaciones y advertencias

- **Sesgos**: no se dispone de información sobre sesgos específicos del modelo. Como fue entrenado sobre datos de texto y código, puede heredar sesgos presentes en dichos corpus.
- **Riesgo de alucinación**: al ser un modelo encoder, no genera texto libre, por lo que el riesgo de alucinación no aplica directamente. Sin embargo, en tareas de clasificación puede producir salidas erróneas si los datos de entrada son ambiguos.
- **Limitaciones de idioma**: no se especifican los idiomas soportados, por lo que el rendimiento en idiomas distintos del inglés no está garantizado.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright.
- **Caveats de producción**: el modelo está convertido a Keras 3 mediante la librería kerasformers, que aún puede tener limitaciones de compatibilidad con otras herramientas del ecosistema. Además, el repo no incluye cuantizaciones predefinidas, por lo que el despliegue en entornos con restricciones de memoria requerirá trabajo adicional.
- **Disponibilidad**: el repo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido probado ampliamente por la comunidad.

## Enlaces

- [HuggingFace: kerasformers/modernbert_base](https://huggingface.co/kerasformers/modernbert_base)
- [Repositorio KerasFormers (GitHub)](https://github.com/IMvision12/KerasFormers)
- [Documentación de ModernBERT en HuggingFace](https://huggingface.co/docs/transformers/model_doc/modernbert)
- [Paper de ModernBERT (arXiv)](https://arxiv.org/abs/2412.13663)
- [Repositorio oficial de ModernBERT (GitHub)](https://github.com/AnswerDotAI/ModernBERT)
