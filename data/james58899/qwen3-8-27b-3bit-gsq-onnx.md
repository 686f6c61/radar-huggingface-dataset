# james58899/Qwen3.8-27B-3Bit-GSQ-ONNX

## Resumen

Qwen3.8-27B-3Bit-GSQ-ONNX es una conversión a formato ONNX del checkpoint cuantizado a 3 bits de ISTA-DASLab sobre el modelo base Qwen/Qwen3.8-27B. El autor de la conversión, james58899, mantiene los pesos exactamente como están almacenados en el checkpoint original (niveles enteros y escalas) sin recuantizar, y los empaqueta en blobs `MatMulNBits` de 4 bits porque ONNX Runtime no dispone de kernel nativo de 3 bits. El resultado es un modelo de generación de texto de aproximadamente 27 000 millones de parámetros, en fp16 para activaciones y estado, con licencia Apache 2.0 y un tamaño de repositorio de 15,2 GB.

La relevancia de esta ficha es doble: por un lado, demuestra una ruta práctica para ejecutar un modelo grande cuantizado de forma agresiva (3 bits) en ONNX Runtime tanto en CPU como en WebGPU, lo que abre la puerta a despliegues en entornos sin CUDA; por otro, el propio autor advierte que los scripts de conversión fueron escritos y ejecutados por Claude, por lo que recomienda verificar el resultado antes de usarlo. Es, por tanto, un artefacto útil para experimentación y validación, no un modelo de producción validado de forma independiente.

El modelo es solo texto: no incluye codificador de visión ni cabeza MTP. La arquitectura subyacente es `Qwen3_5ForCausalLM`, con capas de atención completa (GroupQueryAttention con caché KV) combinadas con capas de atención lineal (LinearAttention con estado fijo `gated_delta` y `CausalConvWithState`). No se dispone de información sobre longitud de contexto, idiomas soportados ni resultados de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: capas de atención completa (GroupQueryAttention) + capas de atención lineal (LinearAttention `gated_delta` con `CausalConvWithState`); clase `Qwen3_5ForCausalLM` |
| Parametros totales | ~27 000 millones (según nombre del modelo base Qwen3.8-27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits simétrico con grupo de 128 (niveles almacenados en blobs `MatMulNBits` de 4 bits, bloques de 32 que comparten escala); embedding y `lm_head` en 4 bits con grupo de 64; activaciones y estado en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`embed_tokens_q4f16.onnx`, `decoder_model_merged_q4f16.onnx`), con tokenizer, chat template y generation config |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.8-27B: un transformer causal con mezcla de capas de atención completa y capas de atención lineal. Las capas de atención completa usan `GroupQueryAttention` con caché KV (`past_key_values.N.key` / `.value`). Las capas de atención lineal emplean los operadores `com.microsoft` `LinearAttention` (variante `gated_delta`) y `CausalConvWithState`, con un estado de tamaño fijo (`past_key_values.N.conv_state` / `.recurrent_state`) inicializado a ceros. Esta combinación híbrida reduce el coste de memoria de la caché en las capas lineales frente a una atención completa pura.

Sobre el entrenamiento no se proporciona información en la documentación disponible: no se indican número de tokens, composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineación. Lo que sí se documenta es el proceso de cuantización y conversión: el checkpoint de ISTA-DASLab aplica cuantización GSQ a 3 bits con grupo de 128 sobre el modelo original; la conversión a ONNX conserva cada nivel entero y escala sin recuantizar, y como ONNX Runtime no tiene kernel de 3 bits, los niveles se alojan en blobs de 4 bits `MatMulNBits` organizados en cuatro bloques de 32 que comparten la escala del grupo de 128 (el tamaño de bloque que requiere la ruta rápida de prefill en WebGPU). El embedding y `lm_head` se mantienen en 4 bits con grupo de 64, tal como estaban en el origen. La conversión se realizó con `python scripts/export.py <checkpoint dir> <out dir> --block-size 32` y se verificó con `verify.py`, que compara la exportación con un port en numpy del forward de transformers. Probado con ONNX Runtime 1.31 en CPU y WebGPU.

## Capacidades

- Generación de texto conversacional y continuaciones de texto libre, según el pipeline `text-generation`.
- Modelo solo texto: no incluye codificador de visión ni cabeza MTP.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible; el modelo es explícitamente solo texto.
- Ejecución en ONNX Runtime con backend CPU y WebGPU, incluyendo caché KV para atención completa y estado recurrente fijo para atención lineal.

## Casos de uso

- Despliegue en entornos sin CUDA: al estar en ONNX Runtime con soporte de CPU y WebGPU, el modelo puede ejecutarse en servidores sin GPU NVIDIA o en navegadores con WebGPU, útil para prototipos y demos interactivas.
- Evaluación de cuantización extrema: sirve para medir la pérdida de calidad de una cuantización a 3 bits (GSQ) frente al modelo base en tareas de generación, comparando salidas con el checkpoint original de ISTA-DASLab.
- Integración en pipelines ONNX existentes: equipos que ya tienen infraestructura de inferencia basada en ONNX Runtime pueden incorporar el modelo sin añadir un runtime nuevo, usando los dos grafos (`embed_tokens` y `decoder_model_merged`) y la caché KV.
- Generación de texto por lotes en CPU: con 15,2 GB de pesos y activaciones fp16, es viable en servidores con suficiente RAM para tareas de generación offline donde la latencia no es crítica.
- Investigación sobre atención lineal: las capas `gated_delta` con estado fijo permiten estudiar el comportamiento de modelos híbridos y comparar su calidad frente a atención completa en tareas de contexto largo (siempre que se conozca la ventana real del modelo base).
- Base para validación de conversiones: los scripts `export.py` y `verify.py` incluidos permiten reproducir la conversión y verificar numéricamente el forward, útil como referencia para quien convierta otros checkpoints cuantizados a ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: los pesos ocupan 15,2 GB en el repositorio; con activaciones y estado en fp16 y caché KV, se recomienda al menos 16-20 GB de memoria disponible para inferencia, aunque la cifra exacta depende de la longitud de contexto y del backend.
- GPU recomendadas: no se especifican en la información; al ser ONNX Runtime, el backend principal documentado es CPU y WebGPU, no CUDA.
- GPU de consumo: no confirmado; una GPU con 16 GB o más podría alojar los pesos, pero no hay datos de compatibilidad ni de rendimiento publicados.
- Opciones de despliegue: ONNX Runtime 1.31 (CPU y WebGPU), con los grafos `onnx/embed_tokens_q4f16.onnx` y `onnx/decoder_model_merged_q4f16.onnx`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| james58899/Qwen3.8-27B-3Bit-GSQ-ONNX | ~27B | no disponible | 3 bits GSQ (en blobs 4 bits) | Apache 2.0 | ONNX |
| ISTA-DASLab/Qwen3.8-27B-3Bit-GSQ | ~27B | no disponible | 3 bits GSQ | Apache 2.0 | safetensors (checkpoint de origen) |
| Qwen/Qwen3.8-27B | ~27B | no disponible | fp16/bf16 (sin cuantizar) | Apache 2.0 | safetensors |

Los tres comparten la misma arquitectura y licencia; la diferencia principal es el formato y el nivel de cuantización. No se dispone de datos de rendimiento comparativo entre ellos en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte explícitamente que los scripts de conversión fueron escritos y ejecutados por Claude y recomienda verificarlos antes de usar el modelo; el uso es bajo responsabilidad del usuario.
- La cuantización a 3 bits puede degradar la calidad respecto al modelo base; no se aportan métricas de evaluación que cuantifiquen esa pérdida.
- Almacenar niveles de 3 bits en blobs de 4 bits implica un sobrecoste de memoria respecto a una implementación nativa de 3 bits.
- Modelo solo texto: no hay visión ni cabeza MTP, por lo que no sirve para tareas multimodales.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas específicas; al no haber información sobre idiomas, no se puede garantizar un comportamiento multilingüe adecuado.
- No se dispone de la longitud de contexto del modelo base, lo que impide planificar despliegues con contexto largo.
- Licencia Apache 2.0 permite uso comercial, pero la falta de validación independiente del artefacto ONNX desaconseja su uso directo en producción sin pruebas propias.
- Solo probado con ONNX Runtime 1.31; versiones distintas pueden no soportar los operadores `com.microsoft` utilizados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/james58899/Qwen3.8-27B-3Bit-GSQ-ONNX
- Checkpoint cuantizado de origen: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-3Bit-GSQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
