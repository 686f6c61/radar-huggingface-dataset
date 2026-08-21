# mlboydaisuke/Qwen3-4B-ExecuTorch

## Resumen

Qwen3-4B-ExecuTorch es una conversión del modelo Qwen3-4B de Alibaba al formato ExecuTorch, el runtime de inferencia on-device de PyTorch. El autor, mlboydaisuke, ha exportado el modelo original a un archivo `.pte` de 2469,4 MB con cuantización XNNPACK 8da4w (8 bits en activaciones, 4 bits en pesos) y embedding de 8 bits, pensado para ejecución en dispositivos con recursos limitados como móviles o equipos Apple. El problema que resuelve es permitir que un LLM de 4B parámetros funcione de forma eficiente fuera de la nube, sin depender de GPUs dedicadas.

La relevancia actual radica en la creciente demanda de modelos de lenguaje locales que preserven privacidad y funcionen sin conexión. Esta conversión aprovecha el soporte oficial de ExecuTorch para la familia Qwen3 (0,6B, 1,7B y 4B), con una ventana de contexto fijada en 2048 tokens durante la exportación. El modelo base es un transformer denso de 4B parámetros, y la conversión incluye verificaciones específicas como la activación de `use_sdpa_with_kv_cache` y la comprobación de divisibilidad de dimensiones para la cuantización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B) |
| Parametros totales | 4B (modelo base Qwen3-4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (max_seq_length en exportación) |
| Tipos de cuantizacion | 8da4w (8-bit activaciones, 4-bit pesos) + embedding de 8 bits |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pte` (ExecuTorch) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-4B, un transformer denso desarrollado por Alibaba, del que no se proporcionan detalles de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la información disponible. La conversión a ExecuTorch se realizó con la versión 1.4.0 de ExecuTorch, utilizando `export_llm` con forma estática (`seq_len=1`) y operaciones extendidas de XNNPACK. La cuantización 8da4w se aplica únicamente a capas lineales cuyas dimensiones de entrada son divisibles por el tamaño de grupo del cuantizador; el resto se omite silenciosamente, un comportamiento que el autor verificó para evitar degradaciones inesperadas.

Entre las innovaciones técnicas destacables de esta conversión se incluye la activación de `use_sdpa_with_kv_cache`, que acelera la decodificación (medido en 16,64 tok/s frente a 8,20 tok/s en un modelo similar), y la verificación de que todos los campos del JSON de parámetros son leídos por la ruta genérica de exportación, evitando fallos como la repetición de una sola palabra observada en otros modelos. El embedding de 8 bits requiere cargar kernels específicos (`quantized_decomposed::embedding_byte.dtype_out`) antes de la ejecución.

## Capacidades

- Generación de texto autoregresiva con decodificación greedy o token a token.
- Razonamiento básico: en las verificaciones realizadas, el modelo abre un bloque `thinking` antes de responder, indicando capacidad de razonamiento encadenado.
- Chat mediante plantilla ChatML, con tokens especiales `bos` (151643) y `eos` (151645, 151643).
- Inferencia on-device gracias al formato ExecuTorch y la cuantización 8da4w, sin necesidad de GPU dedicada.
- No se mencionan capacidades de tool calling, visión, audio ni otras modalidades; es exclusivamente texto.

## Casos de uso

- Asistente conversacional offline en dispositivos móviles: el modelo puede gestionar diálogos multi-turno con la plantilla ChatML, manteniendo un historial de hasta 2048 tokens, adecuado para aplicaciones de mensajería o asistentes personales que requieran privacidad.
- Generación de texto en entornos sin conexión: redacción de correos, resúmenes o borradores directamente en el dispositivo, sin enviar datos a servidores externos.
- Razonamiento matemático simple: según la verificación, el modelo resuelve operaciones como "17 times 4?" dentro de su bloque de pensamiento, útil para calculadoras conversacionales o herramientas educativas.
- Prototipado de aplicaciones edge con ExecuTorch: desarrolladores pueden integrar este `.pte` en apps iOS o macOS usando el runtime de ExecuTorch, como punto de partida para experimentar con LLMs locales.
- Evaluación de cuantización agresiva: sirve como referencia para medir el impacto de 8da4w en calidad y velocidad frente al modelo original en tareas de generación.
- Despliegue en hardware Apple (Mac arm64): el archivo se verificó en un Mac, alcanzando 28,9 tok/s, lo que lo hace viable para aplicaciones de escritorio ligeras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica de rendimiento reportada es una medición de velocidad de decodificación de 28,9 tok/s en un Mac arm64, obtenida con el script `gen_static.py` y decodificación greedy, sin otras cargas en el sistema. No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estándar para esta conversión específica.

## Requisitos de hardware

- VRAM estimada: el archivo `.pte` ocupa 2469,4 MB, por lo que se requiere al menos esa cantidad de memoria disponible (RAM o VRAM) para cargar el modelo. En Mac arm64 se ejecutó sin GPU dedicada, usando CPU.
- GPU recomendadas: no especificadas. Al ser ExecuTorch con backend XNNPACK, está orientado a CPU y aceleradores integrados en dispositivos Apple (Neural Engine, GPU integrada), no a GPUs discretas como A100 o RTX.
- Compatibilidad con consumer GPU: no aplica directamente; el formato `.pte` está diseñado para el runtime de ExecuTorch, no para CUDA.
- Opciones de despliegue: runtime de ExecuTorch (portable_lib), script `gen_static.py` para generación, y posible integración en apps iOS/macOS mediante los ejemplos de `executorch-samples`. No es compatible con vLLM, llama.cpp u Ollama sin conversión adicional.
- Latencia y throughput: 28,9 tok/s medidos en Mac arm64, aunque el autor advierte que la velocidad puede variar significativamente si hay otros procesos en ejecución (llegó a medir un cuarto de esa tasa durante una exportación simultánea).

## Comparativa con modelos similares

No se dispone de datos comparativos con otras conversiones de Qwen3-4B en la información proporcionada. El autor mantiene otras conversiones del mismo modelo base, como `qwen3-4b-CoreAI-official` (formato Core AI para Apple) y `Qwen3-VL-4B-CoreAI` (variante multimodal), pero no se ofrecen métricas de rendimiento relativas. Frente al modelo original Qwen3-4B, esta conversión reduce el tamaño (de aproximadamente 8 GB en fp32 a 2,5 GB) a costa de una ventana de contexto limitada a 2048 tokens y una posible pérdida de precisión por la cuantización.

## Limitaciones y advertencias

- Contexto limitado a 2048 tokens, inferior al que podría soportar el modelo original; conversaciones o documentos largos pueden truncarse.
- La cuantización 8da4w puede degradar la calidad de generación en tareas complejas, aunque no se han medido los efectos exactos.
- Dependencia de kernels específicos de ExecuTorch: sin cargar `quantized_decomposed::embedding_byte`, el modelo no carga y muestra un error que parece un fallo de exportación.
- No se ha probado en teléfonos móviles; la verificación se realizó únicamente en Mac arm64, por lo que el rendimiento en dispositivos reales es incierto.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-4B puede tener términos adicionales; se recomienda revisar la licencia del modelo original.
- Riesgo de alucinaciones y sesgos inherentes al modelo base, no documentados en esta conversión.

## Enlaces

- HuggingFace: https://huggingface.co/mlboydaisuke/Qwen3-4B-ExecuTorch
- Repositorio de scripts de conversión: https://github.com/john-rocky/executorch-models
- Ejemplos de iOS: https://github.com/john-rocky/executorch-samples
- README oficial de ExecuTorch para Qwen3: https://github.com/pytorch/executorch/blob/main/examples/models/qwen3/README.md
