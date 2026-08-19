# Seidkona-Dreams/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-oQ4-mtp

## Resumen

Este modelo es una cuantización en formato MLX del modelo NVIDIA Nemotron-3.5-Lightning-30B-A3B, un LLM de arquitectura híbrida Mamba/attention con mezcla de expertos (MoE) de 30B parámetros totales y 3B activos. La cuantización, realizada con la herramienta oQ de oMLX, emplea precisión mixta de 4 bits (nivel oQ4) con tamaño de grupo 64 y mantiene intacta la cabeza de predicción multi-token (MTP) del modelo original, lo que permite activar decodificación especulativa autónoma (self-speculative decoding) en tiempo de inferencia.

El resultado es un checkpoint de aproximadamente 19,4 GB, optimizado para ejecutarse en Apple Silicon mediante la librería MLX. Su relevancia radica en que combina la eficiencia de un MoE con solo 3B parámetros activos por token, la velocidad de la decodificación especulativa nativa y la portabilidad del formato MLX, ofreciendo un rendimiento de alrededor de 62 tokens por segundo en hardware Apple según pruebas informales del autor. Es una opción práctica para desarrolladores que buscan desplegar un modelo de gran tamaño en entornos con memoria unificada limitada sin renunciar a la fluidez de generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nemotron_h (híbrida Mamba/attention, MoE) |
| Parametros totales | 30B (MoE) |
| Parametros activos | 3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4 (4 bits, precisión mixta, group size 64) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base, NVIDIA Nemotron-3.5-Lightning-30B-A3B, emplea una arquitectura híbrida que combina capas de atención con bloques Mamba, junto con un mecanismo de mezcla de expertos (MoE) que activa solo 3B de sus 30B parámetros por cada token procesado. Esta combinación busca equilibrar calidad de generación y eficiencia computacional. La cuantización oQ4 aplicada por oMLX utiliza precisión mixta de 4 bits con un tamaño de grupo de 64, manteniendo el cómputo en bfloat16 para las operaciones críticas. La innovación principal de este checkpoint es la preservación de la cabeza MTP (Multi-Token Prediction) nativa del modelo, que en lugar de ser eliminada durante la cuantización se conserva íntegramente. Esto permite que, bajo el runtime oMLX, el modelo realice decodificación especulativa con profundidad k, generando varios tokens por paso y verificándolos después, lo que acelera la inferencia sin alterar la distribución de salida (decodificación greedy sin pérdida). No se dispone de información detallada sobre el entrenamiento del modelo base, como número de tokens o composición del dataset, más allá de la referencia a los datasets públicos de NVIDIA (`nvidia/nemotron-pre-training-datasets` y `nvidia/nemotron-post-training-v3`).

## Capacidades

- Generación de texto autoregresiva estándar, compatible con cualquier runtime que soporte el formato MLX (por ejemplo, `mlx-lm`).
- Decodificación especulativa autónoma mediante la cabeza MTP preservada, activable exclusivamente bajo oMLX (runtime con parches `mlx_lm_mtp`). Esta modalidad es lossless en modo greedy: los tokens generados son idénticos a los de una decodificación sin MTP, solo cambia el throughput.
- Inferencia optimizada para Apple Silicon gracias al formato MLX y a la cuantización de 4 bits, lo que reduce el uso de memoria y acelera el cómputo en hardware con Neural Engine y GPU unificada.
- Soporte de arquitectura híbrida Mamba/attention, que puede ofrecer ventajas en eficiencia de contexto largo, aunque no se especifican detalles concretos de la ventana de contexto.
- No se documentan capacidades específicas de tool calling, agentes, visión o audio en la información proporcionada.

## Casos de uso

- Despliegue de asistentes conversacionales en dispositivos Apple: al estar cuantizado a 4 bits y en formato MLX, el modelo puede ejecutarse en un Mac con Apple Silicon (por ejemplo, M-series) con memoria unificada de 16 GB o más, ofreciendo respuestas fluidas a aproximadamente 62 tokens por segundo según pruebas informales.
- Generación de texto de baja latencia en aplicaciones de productividad: la decodificación especulativa con MTP reduce el tiempo de generación por token, lo que resulta útil para redacción asistida, resumen de documentos o completado de texto en tiempo real.
- Prototipado y experimentación en entornos Apple: investigadores y desarrolladores pueden probar un modelo de 30B (MoE) en su portátil sin necesidad de GPUs dedicadas, gracias al tamaño reducido del checkpoint y a la integración con MLX.
- Inferencia en entornos con restricciones de memoria: al activar solo 3B parámetros por token y usar cuantización de 4 bits, el modelo es adecuado para servidores o estaciones de trabajo con memoria unificada moderada, donde un modelo denso equivalente no cabría.
- Evaluación de técnicas de decodificación especulativa: el checkpoint sirve como banco de pruebas para comparar el rendimiento de MTP frente a decodificación autoregresiva estándar, ya que ambos modos están disponibles según el runtime utilizado.
- Integración en pipelines de generación de código o documentación técnica: aunque no se confirma explícitamente, los modelos de la familia Nemotron suelen tener buen desempeño en tareas de código; la baja latencia y el soporte MLX facilitan su uso en editores o entornos de desarrollo integrados en macOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es una prueba informal del autor bajo oMLX con Lightning MTP activado: aproximadamente 87% de tasa de aceptación de tokens draft y alrededor de 62 tokens por segundo en Apple Silicon (M-series). Estos datos son anecdóticos y no provienen de una evaluación estandarizada.

## Requisitos de hardware

- El modelo está diseñado para Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) gracias al formato MLX.
- Memoria unificada estimada: el checkpoint pesa ~19,4 GB en disco, pero al cargarse en memoria con cuantización de 4 bits y solo 3B parámetros activos, el uso de RAM unificada debería rondar los 6-8 GB, aunque no se especifica oficialmente. Se recomienda al menos 16 GB de RAM unificada para operar con holgura.
- No se requieren GPUs dedicadas; la inferencia se ejecuta en la GPU integrada y el Neural Engine del chip Apple.
- Opciones de despliegue: oMLX (recomendado para aprovechar MTP), `mlx-lm` (funciona pero sin decodificación especulativa), y potencialmente otros runtimes que soporten MLX.
- Latencia y throughput: según la prueba informal, ~62 tok/s en Apple Silicon con MTP activado; sin MTP, el rendimiento sería menor, aunque no se proporciona un valor concreto.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría (por ejemplo, otros MoE cuantizados en MLX como Qwen2.5-30B-A3B o Mixtral 8x7B). Los datos de benchmarks y especificaciones de modelos alternativos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- La licencia OpenMDW-1.1 es una licencia de NVIDIA con términos específicos que pueden incluir restricciones de uso comercial, redistribución o modificación. Es obligatorio revisar el texto completo de la licencia antes de cualquier uso en producción.
- La decodificación especulativa con MTP solo funciona bajo oMLX; si se carga el checkpoint con `mlx-lm` estándar, la cabeza MTP se ignora y se realiza decodificación autoregresiva convencional, perdiendo la ventaja de velocidad.
- Al ser una cuantización de 4 bits, puede haber una ligera degradación en la calidad de generación en comparación con el modelo original en BF16, especialmente en tareas que requieren precisión numérica o razonamiento complejo.
- No se especifican los idiomas soportados ni la longitud de contexto, por lo que no se puede garantizar un comportamiento multilingüe o un manejo de contextos largos sin pruebas adicionales.
- El modelo se distribuye "tal cual", sin garantías de ningún tipo, y el autor no proporciona benchmarks formales ni documentación de sesgos o alucinaciones.
- La fecha de creación (2026-08-14) es posterior a la fecha actual, lo que sugiere que el modelo es muy reciente o que la fecha es incorrecta; se recomienda verificar la vigencia y el soporte del proyecto oMLX.

## Enlaces

- [HuggingFace: Seidkona-Dreams/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-oQ4-mtp](https://huggingface.co/Seidkona-Dreams/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-oQ4-mtp)
- [Modelo base: nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16)
- [Licencia OpenMDW-1.1](https://openmdw.ai/license/1-1/)
- [Repositorio oMLX (oQ y runtime MTP)](https://github.com/jundot/omlx)
