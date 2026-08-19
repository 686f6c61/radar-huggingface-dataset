# randmaru/Qwen3.8-27B-mlx-mxfp4-text-generation-only

## Resumen

El modelo `randmaru/Qwen3.8-27B-mlx-mxfp4-text-generation-only` es una cuantización en formato MXFP4 (4-bit floating point con microscaling) del modelo Qwen3.8-27B, adaptada para inferencia en Apple Silicon mediante la librería MLX. El autor, randmaru, ha eliminado los 333 pesos de visión en BF16 para reducir el tamaño y centrar el modelo exclusivamente en generación de texto. Esta versión está pensada para aprovechar el soporte de microscaling de la GPU y el Neural Engine de los chips Apple, ofreciendo un footprint menor que una cuantización INT4 equivalente (~14.3 GB frente a ~15.13 GB en safetensors) y una mayor preservación del rango dinámico, lo que puede traducirse en mejor calidad de generación a igual tasa de compresión.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Aunque el nombre sugiere 27 mil millones de parámetros, el archivo safetensors reporta 5.045.149.184 parámetros, una discrepancia que no está explicada en la documentación disponible y que conviene verificar antes de su uso en producción. Al ser una conversión de pesos, no incorpora entrenamiento adicional ni datos de fine-tuning propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen3.8-27B) |
| Parametros totales | 5.045.149.184 (según safetensors; el nombre sugiere 27B, discrepancia sin aclarar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (4-bit floating point con microscaling, grupo 32, exponente compartido E8M0) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Qwen3.8-27B. La model card indica que se trata de una cuantización MXFP4, un formato de 4 bits en coma flotante con escalado microscópico por grupos de 32 elementos y exponente compartido E8M0. Este esquema reduce la sobrecarga de de-cuantización y permite el uso de tensor cores de coma flotante en hardware compatible, como la GPU y el Neural Engine de Apple Silicon. No se menciona ningún proceso de entrenamiento, fine-tuning o alineación (RLHF/DPO) aplicado sobre el modelo original; la conversión es únicamente de pesos. Además, se han eliminado todos los pesos de visión (333 en BF16) para limitar el modelo a tareas de generación de texto, reduciendo así el tamaño total del repositorio.

## Capacidades

- Generación de texto: el modelo está diseñado exclusivamente para tareas de generación de texto, sin soporte de visión.
- Inferencia en Apple Silicon: optimizado para MLX, aprovecha el soporte de microscaling de la GPU y el Neural Engine de los chips Apple.
- Cuantización MXFP4: preserva mejor el rango dinámico que cuantizaciones INT4, reduciendo la degradación en valores atípicos.
- Compatibilidad con text-generation-inference: el tag sugiere que puede integrarse en pipelines de generación de texto.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, ni soporte multilingüe específico.

## Casos de uso

- Inferencia local en MacBook: el modelo está pensado para ejecutarse en Apple Silicon con MLX, permitiendo generar texto de forma local sin conexión a la nube. Es adecuado para prototipos y aplicaciones personales que requieran privacidad.
- Desarrollo de chatbots conversacionales: al ser text-generation-only, puede emplearse como base para asistentes de chat en entornos donde no se necesiten capacidades multimodales.
- Generación de contenido asistida: redacción de borradores, resúmenes o reescritura de textos en aplicaciones de productividad que se ejecuten en hardware Apple.
- Experimentación con cuantización MXFP4: sirve como referencia para evaluar el impacto de este formato de compresión en la calidad de generación frente a INT4 u otras cuantizaciones.
- Integración en pipelines de generación de texto con MLX: puede usarse como componente en sistemas que ya utilizan la librería MLX para inferencia en Mac.
- Despliegue en entornos con memoria unificada limitada: al ocupar ~14.3 GB, puede caber en Macs con 16 GB o más de RAM unificada, aunque se recomienda verificar el rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo compara el formato MXFP4 con una versión 4-bit INT4 en términos de tamaño y características técnicas, pero no ofrece métricas de calidad (MMLU, HumanEval, GSM8K, etc.) ni de velocidad de inferencia.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~14.3 GB en safetensors, se requiere al menos esa cantidad de memoria unificada en Apple Silicon. Se recomienda un Mac con 16 GB o más de RAM unificada para dejar margen al sistema operativo y al runtime.
- GPU recomendadas: Apple Silicon con soporte de microscaling en GPU/Neural Engine (M1, M2, M3 y posteriores). No se especifican modelos concretos.
- Compatibilidad con consumer GPU: solo Apple Silicon; no está pensado para GPUs NVIDIA o AMD.
- Opciones de despliegue: MLX (librería principal), posiblemente compatible con text-generation-inference si se adapta, aunque no se documenta.
- Latencia y throughput: no disponibles. La model card sugiere mayor velocidad que INT4 en hardware compatible, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| randmaru/Qwen3.8-27B-mlx-mxfp4-text-generation-only | 5.045.149.184 (reportado) | no disponible | MXFP4 | Apache 2.0 | HuggingFace |
| Versión 4-bit INT4 del mismo modelo (mencionada en la model card) | no disponible | no disponible | INT4/NF4 | Apache 2.0 | no disponible |
| Qwen3.8-27B (modelo base) | 27B (según nombre) | no disponible | BF16 | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas versiones. La comparativa se limita a aspectos técnicos de la cuantización.

## Limitaciones y advertencias

- El número de parámetros reportado (5.045.149.184) es muy inferior al que sugiere el nombre del modelo (27B). Esta discrepancia no está explicada y podría indicar un error en la conversión o en la documentación. Se recomienda verificar la integridad del modelo antes de usarlo.
- Al ser text-generation-only, no soporta entradas de imagen ni tareas multimodales.
- La cuantización MXFP4 puede introducir pérdida de calidad respecto al modelo original en BF16, aunque la model card afirma que preserva mejor el rango dinámico que INT4.
- No se documentan sesgos específicos, pero al derivar de un modelo base no alineado, puede presentar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinación: no se han publicado evaluaciones de fiabilidad; se recomienda validar las salidas en aplicaciones críticas.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución y no utilizar marcas registradas.
- El rendimiento real depende del backend, el tamaño de lote y la implementación de la cuantización; no hay garantías de velocidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/randmaru/Qwen3.8-27B-mlx-mxfp4-text-generation-only
- Modelo base (referenciado en la model card): https://huggingface.co/Qwen/Qwen3.8-27B (enlace roto en la card, se asume la URL estándar)
- Enlace a JetBrains/Mellum-4b-base (aparece en la card, pero no es el modelo base real): https://huggingface.co/JetBrains/Mellum-4b-base
