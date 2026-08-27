# mtaku3/XtraGPT-14B-W4A16

## Resumen

XtraGPT-14B-W4A16 es una cuantización AWQ (Activation-aware Weight Quantization) en formato W4A16 del modelo XtraGPT-14B, desarrollado por el grupo Xtra-Computing. XtraGPT es una familia de modelos de lenguaje abiertos (de 1,5B a 14B parámetros) específicamente ajustados para la revisión de artículos académicos en colaboración humano-IA. A diferencia de los modelos generalistas que realizan pulidos superficiales, XtraGPT comprende el contexto completo de un manuscrito y ejecuta instrucciones de revisión guiadas por criterios explícitos.

Esta versión cuantizada reduce el tamaño del modelo y acelera la inferencia, manteniendo el tokenizador y la plantilla de chat originales. Está pensada para entornos de producción con recursos limitados, donde el despliegue del modelo BF16 completo no es viable. La cuantización se realizó con 128 muestras de calibración del dataset ReviseQA y excluye la capa `lm_head`, lo que preserva la calidad de generación. El modelo base se publicó bajo la licencia ModelGo Zero 2.0 (MG0-2.0), y esta versión hereda dicha licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Phi-3, según etiquetas del repositorio) |
| Parametros totales | 14B (modelo base); el archivo safetensors reporta 2.851.763.520 parámetros, posiblemente debido a metadatos de cuantización |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 16.384 tokens (configuración recomendada en vLLM) |
| Tipos de cuantizacion | W4A16 (AWQ, INT4 asimétrico, group size 128) |
| Idiomas soportados | No disponible |
| Licencia | MG0-2.0 (ModelGo Zero License 2.0) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base XtraGPT-14B es un transformer denso, probablemente derivado de la arquitectura Phi-3 (según las etiquetas del repositorio). Fue fine-tuneado específicamente para la revisión de artículos académicos, entrenado para entender el contexto completo de un paper y aplicar criterios de revisión definidos por el usuario. No se dispone de detalles sobre el número de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

La versión cuantizada aplica AWQ con pesos INT4 asimétricos y activaciones de 16 bits, con un group size de 128. La calibración se realizó con 128 muestras del dataset ReviseQA, con una longitud máxima de secuencia de 2048 tokens, conservando tanto el inicio del prompt del paper como la pregunta/respuesta final cuando la muestra excede el límite. Se cuantizaron todos los módulos `Linear` excepto `lm_head`. El entorno de construcción incluye `torch==2.13.0`, `transformers==5.14.1`, `llmcompressor==0.13.0` y `compressed-tensors==0.18.0`.

## Capacidades

- Revisión de artículos académicos: comprende el contexto completo de un manuscrito y ejecuta instrucciones de revisión basadas en criterios específicos (estilo, claridad, estructura, coherencia).
- Generación de texto conversacional: mantiene el formato de chat del modelo base, permitiendo interacciones multi-turno.
- Edición y reformulación de texto: puede sugerir mejoras de redacción, resumir secciones o reformular párrafos manteniendo el significado.
- Contexto largo: ventana de 16.384 tokens, suficiente para procesar papers completos de varias páginas.
- Eficiencia de inferencia: la cuantización W4A16 reduce el uso de memoria y acelera la generación en comparación con el modelo BF16.
- Compatibilidad con vLLM: soporta despliegue mediante `vllm serve` con configuración de contexto largo.

## Casos de uso

- Revisión de manuscritos antes de envío a revistas: el modelo analiza el paper completo y sugiere mejoras de claridad, coherencia y estilo, ayudando a los autores a pulir el texto antes de la revisión por pares.
- Asistente de escritura para investigadores: integrado en un editor, puede reformular párrafos, generar resúmenes de secciones o proponer alternativas de redacción más precisas.
- Evaluación de cumplimiento de criterios de revisión: dado un conjunto de criterios (por ejemplo, de una convocatoria o revista), el modelo evalúa el manuscrito contra ellos y señala posibles deficiencias.
- Generación de respuestas a revisores: a partir de los comentarios de los revisores, el modelo ayuda a redactar respuestas argumentadas y contextualizadas.
- Detección de inconsistencias internas: gracias a su contexto largo, puede identificar contradicciones entre secciones, errores de referencias cruzadas o falta de alineación con los objetivos declarados.
- Despliegue en entornos con recursos limitados: al ser una cuantización W4A16, puede ejecutarse en GPUs de consumo con 16 GB de VRAM, permitiendo su uso en laboratorios o pequeñas empresas sin infraestructura de alto rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que solo se realizó una prueba de humo de generación durante la cuantización y que no se reclama ningún resultado. Se recomienda comparar el checkpoint cuantizado con el modelo BF16 original en un subconjunto de ReviseQA antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8-10 GB para inferencia con contexto de 16.384 tokens, dependiendo de la implementación y del tamaño del lote.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), o cualquier GPU con al menos 12 GB de VRAM.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de 16 GB o más, como RTX 4080, RTX 3090, etc.
- Opciones de despliegue: vLLM (recomendado en la model card), también compatible con transformers y text-generation-inference (TGI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo con otros modelos de revisión de papers. La alternativa más directa es el modelo base XtraGPT-14B en BF16, que ofrece la misma calidad pero con mayor requisito de memoria. También existe XtraGPT-7B, de la misma familia, con menor capacidad pero más ligero. No se han encontrado otros modelos cuantizados de XtraGPT en el momento de la consulta.

| Modelo | Parámetros | Cuantización | Contexto | Licencia |
|---|---|---|---|---|
| XtraGPT-14B (base) | 14B | BF16 | 16k (estimado) | MG0-2.0 |
| XtraGPT-14B-W4A16 (este) | 14B | W4A16 (AWQ) | 16k | MG0-2.0 |
| XtraGPT-7B | 7B | BF16 | No disponible | MG0-2.0 |

## Limitaciones y advertencias

- Sesgos: al estar entrenado para revisión académica, puede favorecer ciertos estilos de escritura o campos de investigación, y podría no ser adecuado para dominios muy especializados sin ajuste adicional.
- Riesgo de alucinación: como cualquier LLM, puede generar sugerencias incorrectas o inventar referencias; se recomienda supervisión humana en tareas críticas.
- Limitaciones de contexto: la ventana de 16.384 tokens puede ser insuficiente para papers muy extensos o con muchas figuras y tablas.
- Restricciones de licencia: la licencia MG0-2.0 es una licencia de código abierto con condiciones específicas; es necesario revisar el texto completo para verificar si permite uso comercial y redistribución.
- Degradación por cuantización: aunque AWQ preserva la calidad, puede haber una ligera pérdida de precisión en comparación con el modelo BF16; se recomienda evaluar en un subconjunto de ReviseQA antes de producción.

## Enlaces

- Modelo cuantizado: https://huggingface.co/mtaku3/XtraGPT-14B-W4A16
- Modelo base: https://huggingface.co/Xtra-Computing/XtraGPT-14B
- Modelo XtraGPT-7B: https://huggingface.co/Xtra-Computing/XtraGPT-7B
- Paper en ACL 2026: https://aclanthology.org/2026.acl-long.47/
- Licencia MG0-2.0: https://github.com/Xtra-Computing/ModelGo/blob/main/MG_licenses/V2/MG0-2.0.txt
- Dataset ReviseQA: https://huggingface.co/datasets/Xtra-Computing/ReviseQA
