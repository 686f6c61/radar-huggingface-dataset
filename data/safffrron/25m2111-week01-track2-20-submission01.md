# safffrron/25M2111-Week01-Track2-20-Submission01

## Resumen

El modelo `safffrron/25M2111-Week01-Track2-20-Submission01` es un artefacto comprimido derivado de Qwen/Qwen3.5-4B, desarrollado por el usuario safffrron como parte de un ejercicio académico (Week 01, Track 2). Su objetivo es reducir el tamaño físico del modelo a menos del 20% del peso original en BF16 (8.412 GB), manteniendo un rendimiento aceptable en tareas de razonamiento. El artefacto final ocupa 1.626.481.790 bytes (~1,6 GB), es decir, un 19,34% del tamaño original, y alcanza una precisión de 0,879 en un conjunto de evaluación de 560 checkpoints.

La compresión se logra mediante una combinación de técnicas: una adaptación LoRA que fomenta razonamientos cortos, cuantización mixta (3-bit GPTQ para matrices MLP, 4-bit para proyecciones Gated DeltaNet, 8-bit para atención y embeddings) y compresión sin pérdida con zlib. Además, se restringe el vocabulario a 30.000 tokens y se utiliza un predictor determinista para reconstruir tokens omitidos. El modelo se distribuye como un artefacto `.ptz` junto con un script de restauración a checkpoint de Hugging Face.

Este modelo es relevante en el contexto de compresión de modelos de lenguaje, mostrando cómo combinar cuantización de baja precisión con compresión sin pérdida para reducir significativamente el peso sin degradar en exceso la calidad. Está pensado para entornos con recursos limitados o para experimentación académica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención y capas Gated DeltaNet (según descripción de cuantización) |
| Parametros totales | No disponible (modelo original Qwen3.5-4B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 3-bit GPTQ (MLP), 4-bit GPTQ (Gated DeltaNet), 8-bit (atención y embeddings), BF16 (normas, sesgos y otros) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Artefacto `.ptz` comprimido; convertible a checkpoint Hugging Face (BF16) |

## Arquitectura y entrenamiento

El modelo original es Qwen3.5-4B, pero no se proporcionan detalles de su arquitectura interna. Según la descripción del método de compresión, el modelo contiene matrices MLP, proyecciones Gated DeltaNet y capas de atención completa, lo que sugiere una arquitectura híbrida con componentes recurrentes y atencionales.

El proceso de compresión comienza con una adaptación LoRA (solo en completado) que entrena al modelo para generar razonamientos más cortos y correctos. Posteriormente, se aplica cuantización GPTQ con diferentes precisiones según la sensibilidad de cada tensor: 3 bits para las matrices MLP, 4 bits para las proyecciones Gated DeltaNet, y 8 bits para la atención completa y la tabla de embeddings/salida. Los tensores pequeños y sensibles (normas, sesgos, controles recurrentes) se mantienen en BF16.

La tabla de embeddings/salida se reduce a 30.000 tokens originales (de un vocabulario mayor) almacenados a 8 bits, y se entrena un predictor determinista de 701.760 bytes que reconstruye las filas omitidas durante la restauración. La evaluación física restringe los logits de salida a los tokens almacenados. Finalmente, el artefacto serializado se comprime con zlib, reduciendo el tamaño de 1.790.943.184 a 1.626.481.790 bytes sin pérdida de información.

## Capacidades

- Generación de texto con razonamiento: el modelo está diseñado para producir respuestas correctas y concisas, como indica la adaptación LoRA y la evaluación con parse rate de 0,970.
- Restricción de vocabulario: solo puede generar tokens del conjunto de 30.000 almacenados, lo que limita su cobertura léxica pero garantiza consistencia.
- Restauración a BF16: permite convertir el artefacto comprimido a un checkpoint completo de Hugging Face para su uso con herramientas estándar.
- Aceleración CUDA: se proporciona una ruta de ejecución con kernels empaquetados para inferencia directa sobre el artefacto comprimido.
- Compatibilidad con API de conversión: expone funciones `convert_from_hf_checkpoint` y `convert_to_hf_checkpoint` para integrarse en pipelines de compresión.

## Casos de uso

- Inferencia en entornos con memoria limitada: gracias a su tamaño de ~1,6 GB, el modelo puede ejecutarse en GPUs con poca VRAM (por ejemplo, tarjetas de 2-4 GB) o incluso en CPU con optimizaciones, lo que lo hace adecuado para prototipos y despliegues edge.
- Experimentación académica en compresión de modelos: sirve como caso de estudio para técnicas de cuantización mixta y compresión sin pérdida, permitiendo reproducir y analizar el impacto de cada paso.
- Evaluación de razonamiento con respuestas cortas: la adaptación LoRA fomenta respuestas concisas, útil para tareas donde se requiere eficiencia en generación (por ejemplo, chatbots con presupuesto de tokens).
- Restauración y fine-tuning posterior: al poder convertir el artefacto a un checkpoint BF16, se puede utilizar como base para fine-tuning en tareas específicas, aunque con la limitación del vocabulario reducido.
- Benchmarking de técnicas de cuantización: el repositorio incluye scripts de reproducción y evaluación, permitiendo comparar la precisión (0,879) frente a otras configuraciones.
- Despliegue en entornos de producción con requisitos de almacenamiento estrictos: si la licencia lo permite, el tamaño reducido facilita la distribución en dispositivos con almacenamiento limitado.

## Benchmarks y rendimiento

Se dispone de un único resultado de evaluación, reportado en la model card:

| Métrica | Valor |
|---|---|
| Precisión (accuracy) en conjunto de 560 checkpoints | 0,879 |
| Tasa de parse (parse rate) | 0,970 |
| Tasa de truncación | 0,037 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el artefacto comprimido ocupa 1,6 GB en disco, pero al cargarlo en memoria para inferencia se requiere al menos esa cantidad de VRAM (más overhead). Con cuantización mixta, la memoria efectiva puede ser similar al tamaño del archivo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) puede ejecutar el modelo, aunque se recomienda una GPU con soporte CUDA para la ruta acelerada.
- El modelo cabe en GPUs de consumo (RTX 3060, RTX 4060, etc.) y también en tarjetas de gama baja.
- Opciones de despliegue: se proporciona una ruta de ejecución directa con kernels CUDA empaquetados (ver `CUDA_ACCELERATION.md`), y también se puede restaurar a un checkpoint estándar de Hugging Face para usarlo con vLLM, llama.cpp u otras herramientas, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (compresión de Qwen3.5-4B). El modelo original Qwen3.5-4B no tiene datos de rendimiento en esta documentación. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La precisión de 0,879 indica una degradación respecto al modelo original (no cuantificado aquí), probablemente debida a la cuantización agresiva de 3 y 4 bits.
- El vocabulario se limita a 30.000 tokens, lo que puede causar problemas con palabras raras o fuera de ese conjunto. El predictor de tokens puede reconstruir algunos, pero no garantiza cobertura completa.
- La licencia no está especificada, por lo que no se puede confirmar si es apto para uso comercial. Se debe contactar al autor para aclaraciones.
- El modelo está diseñado para razonamiento con respuestas cortas; puede no ser adecuado para tareas que requieran generación extensa o creativa.
- La restricción de logits a tokens almacenados puede afectar la fluidez del texto generado.
- No se documentan sesgos específicos, pero al derivar de Qwen, podría heredar sesgos del modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/safffrron/25M2111-Week01-Track2-20-Submission01
- Repositorio GitHub: https://github.com/safffrron/CS6013/tree/main/25M2111/Week01/Track2_20/Submission01

(No se proporcionan otros enlaces en la información.)
