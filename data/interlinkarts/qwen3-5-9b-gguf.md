# Interlinkarts/Qwen3.5-9B-GGUF

## Resumen

Qwen3.5-9B es un modelo de lenguaje multimodal (imagen-texto) desarrollado por Alibaba, que integra un codificador de visión con un modelo de lenguaje causal. Su arquitectura híbrida combina Gated Delta Networks con una mezcla dispersa de expertos (MoE), lo que permite una inferencia de alto rendimiento con bajo coste de latencia. El modelo cuenta con 9.000 millones de parámetros (8.953.803.264 exactos) y una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.010.000 tokens, lo que lo hace adecuado para tareas que requieren procesar documentos largos o conversaciones extensas.

La versión GGUF, publicada por Interlinkarts, ofrece cuantizaciones optimizadas mediante la técnica Unsloth Dynamic 2.0, que mejora la precisión frente a otros métodos de cuantización. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. Su entrenamiento incluye fusión temprana de tokens multimodales y un escalado de aprendizaje por refuerzo en entornos con millones de agentes, lo que le confiere capacidades avanzadas de razonamiento, codificación y comprensión visual. Está disponible en 201 idiomas y dialectos, lo que facilita su despliegue global.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, Gated Delta Networks + sparse Mixture-of-Experts (MoE) |
| Parametros totales | 8.953.803.264 (9B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | GGUF (Unsloth Dynamic 2.0, incluye Q4_K_XL; lista completa no disponible) |
| Idiomas soportados | 201 lenguas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

Qwen3.5-9B emplea una arquitectura híbrida que combina Gated Delta Networks (atención lineal) con atención clásica y una mezcla dispersa de expertos. La disposición interna es de 32 capas, con un patrón de 8 bloques de 3 subcapas de Gated DeltaNet seguidas de FFN, y una subcapa de Gated Attention con FFN. El modelo integra un codificador de visión que permite procesar imágenes junto con texto, mediante fusión temprana de tokens multimodales durante el entrenamiento. El entrenamiento se realizó en dos fases: pre-entrenamiento y post-entrenamiento, con un escalado de aprendizaje por refuerzo en entornos simulados con millones de agentes y distribuciones de tareas progresivamente complejas. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto y razonamiento avanzado, con soporte para tareas de conocimiento y STEM (MMLU-Pro, etc.).
- Comprensión visual: procesa imágenes y texto de forma conjunta, permitiendo tareas de image-text-to-text.
- Codificación: entrenado para tareas de programación, con soporte para generación y depuración de código.
- Agentes: capacidades de razonamiento multi-paso y uso de herramientas, aunque no se confirma explícitamente tool calling en la documentación.
- Multilingüe: soporte para 201 lenguas y dialectos, con comprensión cultural y regional.
- Contexto largo: ventana de 262K tokens nativa, ampliable a más de 1M, ideal para documentos extensos y conversaciones largas.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens), manteniendo el hilo de la conversación y resolviendo consultas complejas. Su capacidad multilingüe permite atender a clientes en múltiples idiomas.
- Análisis de documentos con imágenes: al ser multimodal, puede extraer información de facturas, contratos o informes escaneados, combinando texto e imágenes para tareas de verificación o resumen.
- Generación de código en producción: con soporte para razonamiento y codificación, puede integrarse en pipelines de CI/CD para generar tests, documentar código o sugerir correcciones. Su contexto largo permite procesar repositorios completos.
- Asistentes de investigación: puede resumir artículos científicos, extraer conclusiones y comparar resultados, gracias a su capacidad de razonamiento y su ventana de contexto amplia.
- Traducción y localización: con soporte para 201 idiomas, puede traducir contenido manteniendo matices culturales, útil para plataformas globales.
- Agentes autónomos: su entrenamiento con RL en entornos multi-agente lo hace adecuado para tareas de planificación y ejecución de acciones, como automatización de flujos de trabajo o navegación web.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de benchmarks con modelos como GPT-OSS-120B, GPT-OSS-20B, Qwen3-Next-80B-A3B-Thinking, Qwen3-30BA3B-Thinking-2507, Qwen3.5-9B y Qwen3.5-4B, abarcando categorías como Knowledge & STEM. Sin embargo, los valores numéricos no están disponibles en la información proporcionada, por lo que no se pueden presentar resultados concretos. Se recomienda consultar la model card original para obtener los datos completos.

## Requisitos de hardware

- VRAM estimada para inferencia: para una cuantización Q4_K_XL (aproximadamente 5-6 GB), se requiere al menos 8 GB de VRAM. Para cuantizaciones más altas (Q8), se necesitan 10-12 GB. Estas son estimaciones basadas en el tamaño de parámetros y no en datos oficiales.
- GPU recomendadas: tarjetas consumer como RTX 3060 (12 GB), RTX 4070 (12 GB) o superiores pueden ejecutar el modelo en cuantizaciones bajas. Para el modelo completo en FP16, se necesitarían GPUs profesionales como A100 o H100.
- Despliegue: el formato GGUF es compatible con llama.cpp, Ollama y otros motores de inferencia local. El modelo base (safetensors) puede usarse con vLLM, SGLang o Transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen3.5-9B (este) | 9B | 262K (ext. 1M) | Apache 2.0 | GGUF / safetensors |
| Qwen3-30B-A3B-Thinking | 30B totales, 3B activos | 262K | Apache 2.0 | safetensors |
| Qwen3.5-4B | 4B | 262K | Apache 2.0 | safetensors |
| GPT-OSS-20B | 20B | no disponible | no disponible | no disponible |

La comparativa se basa en los modelos listados en la tabla de benchmarks de la model card. No se dispone de datos de rendimiento numéricos para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No se han documentado limitaciones específicas en la información proporcionada. Como todo modelo de lenguaje, puede presentar alucinaciones, especialmente en tareas de razonamiento complejo o con datos poco frecuentes.
- El modelo es multimodal, pero su rendimiento en tareas de visión puede ser inferior al de modelos especializados en visión pura.
- Aunque soporta 201 idiomas, la calidad puede variar entre lenguas de alta y baja representación en el entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base (Qwen/Qwen3.5-9B) para confirmar restricciones adicionales.
- Para producción, es necesario validar el comportamiento del modelo en el dominio específico, dado que no se han publicado evaluaciones de sesgos o robustez.

## Enlaces

- Repositorio GGUF de Interlinkarts: https://huggingface.co/Interlinkarts/Qwen3.5-9B-GGUF
- Modelo base Qwen/Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Guía de Unsloth para Qwen3.5: https://unsloth.ai/docs/models/qwen3.5
- Repositorio GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- Cuantización alternativa de bartowski: https://huggingface.co/bartowski/Qwen_Qwen3.5-9B-GGUF
