# mlboydaisuke/Qwen3-0.6B-ExecuTorch

## Resumen

El modelo `mlboydaisuke/Qwen3-0.6B-ExecuTorch` es una conversión del modelo Qwen3-0.6B de Alibaba al formato ExecuTorch, optimizada para inferencia en dispositivos con recursos limitados (on-device). El autor, mlboydaisuke, ha aplicado una cuantización mixta 8da4w (8 bits en activaciones, 4 bits en pesos) junto con embeddings de 8 bits, y ha exportado el modelo con ExecuTorch 1.4.0 usando XNNPACK, lo que reduce el tamaño del archivo a 468.6 MB y permite una decodificación de 92.3 tokens por segundo en un Mac arm64. Esta conversión es relevante porque facilita el despliegue de un modelo de lenguaje pequeño pero capaz en entornos sin GPU, como portátiles, teléfonos o sistemas embebidos, manteniendo una velocidad de inferencia notable. El modelo base, Qwen3-0.6B, es un transformer denso de 0.6 mil millones de parámetros, con una ventana de contexto de 2048 tokens en esta versión exportada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-0.6B) |
| Parametros totales | 0.6B (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (max_seq_length) |
| Tipos de cuantizacion | 8da4w (8-bit activaciones, 4-bit pesos) + 8-bit embedding |
| Idiomas soportados | No disponible (heredados del modelo base, no especificados) |
| Licencia | Apache-2.0 |
| Formato de pesos | PTE (ExecuTorch) |

## Arquitectura y entrenamiento

El modelo es una conversión a ExecuTorch del Qwen3-0.6B original, un transformer denso con atención por ventana y capas de normalización. La conversión aplica cuantización 8da4w, donde las activaciones se mantienen en 8 bits y los pesos lineales se reducen a 4 bits, además de cuantizar los embeddings a 8 bits. La exportación se realizó con ExecuTorch 1.4.0 usando `export_llm` con forma estática (seq_len=1) y XNNPACK extended_ops. No se dispone de información sobre el entrenamiento del modelo base (datos, número de tokens, técnicas de alineación como RLHF o DPO), ya que la model card solo documenta el proceso de conversión y verificación. El autor verificó que la configuración `use_sdpa_with_kv_cache` está activada, lo que mejora significativamente la velocidad de decodificación, y que las dimensiones del modelo son divisibles por el tamaño de grupo del cuantizador para evitar omisiones silenciosas.

## Capacidades

- Generación de texto: produce respuestas coherentes a preguntas y completaciones.
- Razonamiento: según la verificación, el modelo abre un bloque de pensamiento (`thinking`) antes de responder, lo que indica capacidad de razonamiento encadenado.
- Chat: utiliza plantilla ChatML con tokens especiales (bos 151643, eos [151645, 151643]).
- Inferencia on-device: optimizado para ejecución en CPU y dispositivos sin GPU, con alta velocidad de decodificación.
- No se han documentado capacidades de tool calling, agentes, visión o audio en esta conversión específica.

## Casos de uso

- Asistente de chat local: el modelo puede ejecutarse en un portátil o dispositivo móvil para proporcionar respuestas conversacionales sin conexión, gracias a su tamaño reducido y velocidad de 92.3 tok/s.
- Aplicaciones educativas: útil para generar explicaciones, resolver problemas matemáticos sencillos o responder preguntas factuales en entornos sin acceso a la nube.
- Prototipado rápido: los desarrolladores pueden integrar este modelo en aplicaciones de prueba de concepto que requieran generación de texto en tiempo real con recursos mínimos.
- Automatización de tareas de texto: resúmenes, reescritura o clasificación de textos cortos en sistemas embebidos o de bajo consumo.
- Investigación en eficiencia de modelos: sirve como referencia para estudiar el impacto de la cuantización 8da4w en la calidad y velocidad de modelos pequeños.
- Despliegue en edge computing: adecuado para dispositivos IoT o routers con capacidad de cómputo limitada, donde se necesita un LLM ligero para tareas de procesamiento de lenguaje natural básico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica documentada es la velocidad de decodificación de 92.3 tokens por segundo, medida en un Mac arm64 con una sola pasada sobre el modelo y sin cargas concurrentes. No hay datos de MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; puede ejecutarse en CPU con memoria RAM suficiente (el archivo .pte ocupa 468.6 MB).
- GPU recomendadas: no aplica, aunque podría ejecutarse en GPUs integradas o discretas si se dispone de ellas.
- Compatibilidad con consumer GPU: no es necesario, funciona en CPU.
- Opciones de despliegue: ExecuTorch runtime, con soporte para XNNPACK en plataformas ARM y x86. También se puede usar con el script `llm_params/gen_static.py` proporcionado.
- Latencia y throughput: 92.3 tok/s en Mac arm64 (medido en condiciones ideales); en otros dispositivos puede variar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-0.6B (original) | 0.6B | 32K (original) | FP32/BF16 | Apache-2.0 | Safetensors |
| Qwen3-0.6B-ExecuTorch (este) | 0.6B | 2048 | 8da4w + 8-bit emb | Apache-2.0 | PTE |
| SmolLM2-135M (referencia) | 135M | 2048 | FP32 | Apache-2.0 | Safetensors |

La comparativa se basa en datos públicos de los modelos base; no se dispone de resultados de rendimiento para esta conversión frente a otras. La principal diferencia es el formato ExecuTorch y la cuantización agresiva, que reducen el tamaño y aumentan la velocidad a costa de una ventana de contexto más corta (2048 frente a 32K del original).

## Limitaciones y advertencias

- La cuantización 8da4w puede degradar la precisión en tareas complejas de razonamiento o generación de código, aunque no se han medido los efectos exactos.
- La ventana de contexto está limitada a 2048 tokens, lo que restringe el manejo de conversaciones largas o documentos extensos.
- No se ha verificado el funcionamiento en teléfonos móviles; la velocidad medida es solo en Mac arm64.
- El modelo puede presentar sesgos o alucinaciones inherentes a los LLM pequeños, especialmente en dominios especializados.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3-0.6B para posibles restricciones adicionales.
- El archivo .pte requiere kernels específicos de ExecuTorch (`quantized_decomposed::embedding_byte.dtype_out`); sin ellos, el modelo no carga.

## Enlaces

- [HuggingFace - mlboydaisuke/Qwen3-0.6B-ExecuTorch](https://huggingface.co/mlboydaisuke/Qwen3-0.6B-ExecuTorch)
- [Modelo base - Qwen/Qwen3-0.6B](https://huggingface.co/Qwen/Qwen3-0.6B)
- [Repositorio de conversión - executorch-models](https://github.com/john-rocky/executorch-models)
- [Ejemplo iOS - executorch-samples](https://github.com/john-rocky/executorch-samples)
- [Documentación de ExecuTorch para Qwen3](https://github.com/pytorch/executorch/tree/main/examples/models/qwen3)
