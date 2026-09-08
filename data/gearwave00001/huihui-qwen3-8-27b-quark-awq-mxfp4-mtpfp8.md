# gearwave00001/Huihui-Qwen3.8-27B-Quark-AWQ-MXFP4-MtpFp8

## Resumen

Este modelo es una cuantización en formato Quark MXFP4 (4 bits) del checkpoint `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, a su vez una versión del modelo Qwen3.8-27B de Qwen a la que se le han eliminado los mecanismos de rechazo y alineación de seguridad (proceso conocido como abliterated). Lo publica el usuario `gearwave00001`, que ha realizado la conversión con la herramienta AMD Quark y ha incorporado un drafter en FP8 para decodificación especulativa.

La utilidad principal de esta variante es permitir la ejecución del modelo en GPUs AMD (arquitectura gfx1201, como la R9700) con un coste de memoria reducido gracias al formato MXFP4, y con un modelo auxiliar para acelerar la generación. El repositorio ocupa 19.4 GB y, aunque el modelo original se anuncia como de 27.000 millones de parámetros, los safetensors de esta conversión contienen 15.605.868.416 parámetros, un valor que refleja el empaquetado de la cuantización. Según vLLM Recipes, el Qwen3.8-27B subyacente emplea una arquitectura híbrida de atención (atención completa y atención lineal recurrente) y es multimodal; la longitud de contexto no se ha especificado en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención completa y atención lineal recurrente (según vLLM Recipes para Qwen3.8-27B); cuantizado con Quark MXFP4 |
| Parámetros totales | 15.605.868.416 (según safetensors; el modelo original se anuncia como 27B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | MXFP4 (4 bits) para el modelo principal; FP8 para el drafter |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.8-27B) |
| Formato de pesos | Safetensors con cuantización Quark MXFP4; drafter en FP8 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B pertenece a la serie Qwen3.8 de Qwen. Según la documentación de vLLM Recipes, es un modelo denso con un backbone híbrido de atención: se especifica un intervalo de atención completa de 4 (`full_attention_interval: 4`) y 48 capas con atención lineal y estado recurrente constante. También se indica que, a diferencia del modelo MoE de 2.4T de la misma familia, esta variante de 27B es multimodal, aunque el repo de HuggingFace no detalla las modalidades concretas.

El proceso de conversión de este checkpoint se realizó con AMD Quark, empleando 28 muestras de calibración con secuencias de 512 tokens. El drafter (modelo de decodificación especulativa) se convirtió a FP8 mediante un script de `ggz14/radiance-vllm-mxfp4`. El autor utilizó un sistema con 128 GB de DDR4, un Ryzen 5900x y dos GPUs AMD R9700, y menciona que las últimas tres capas del modelo tuvieron que descargarse a la CPU durante la conversión. No se dispone de información sobre el proceso de entrenamiento original del Qwen3.8-27B (número de tokens, composición del dataset o uso de RLHF/DPO). La intervención de abliterated del checkpoint de huihui-ai tampoco está documentada en esta ficha.

## Capacidades

- Generación de texto: al ser un LLM denso de la familia Qwen, puede realizar tareas generalistas de lenguaje como redacción, resumen o seguimiento de instrucciones, aunque no se aportan datos específicos en la información disponible.
- Modalidad: según vLLM Recipes, el Qwen3.8-27B original es multimodal; sin embargo, esta conversión no documenta capacidades de visión o audio.
- Tool calling / function calling: no consta en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no consta en la información proporcionada.
- Multilingüismo: no constan los idiomas soportados en los metadatos.
- Modelo abliterated: el checkpoint base ha sido modificado para eliminar mecanismos de alineación de seguridad, lo que reduce la censura en las respuestas.
- Optimización para hardware AMD: gracias a la cuantización MXFP4 y al drafter FP8, está preparado para ejecutarse con fluxos de trabajo tipo radiance-vllm en GPUs AMD gfx1201.

## Casos de uso

- Inferencia en GPUs AMD R9700: el modelo está pensado para ejecutarse en entornos vLLM con soporte MXFP4, lo que permite servir un LLM de gran tamaño en hardware AMD de gama media.
- Servicio de completación de texto y chat: al tener licencia Apache 2.0, puede integrarse en APIs propias desplegadas con radiance-vllm-mxfp4 para ofrecer endpoints de generación de texto.
- Generación de contenido creativo sin filtros: al ser abliterated, el modelo puede utilizarse en aplicaciones de escritura creativa, rol o asistencia donde se requieran respuestas sin los rechazos habituales de seguridad, asumiendo la responsabilidad del uso.
- Evaluación de cuantización: el checkpoint permite comparar el impacto de una cuantización MXFP4 (4 bits) frente al modelo BF16 original en tareas de lenguaje y medir la degradación de calidad mediante perplejidad.
- Investigación sobre arquitecturas híbridas de atención: la serie Qwen3.8 combina atención completa y lineal recurrente, lo que hace útil este modelo para estudiar la eficiencia de estas arquitecturas en GPU AMD.
- Despliegue en entornos con almacenamiento limitado: el repositorio ocupa 19.4 GB, un tamaño contenido para un modelo de estas características, viable en sistemas con restricciones de disco o para distribución en edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor del repo indica que la perplejidad (PPL) fue ligeramente superior a la del modelo de referencia `amd/Qwen3.8-27B-Quark-AWQ-MXFP4`, pero no se ofrecen valores numéricos ni comparativas estandarizadas.

## Requisitos de hardware

- VRAM estimada: no se ha publicado un requisito oficial. El repositorio ocupa 19.4 GB, y dada la cuantización 4-bit, se estima que la carga de pesos necesita al menos 15–20 GB de VRAM, más la memoria de KV cache. El autor necesitó descargar las tres últimas capas a CPU durante la conversión, lo que sugiere que una sola GPU R9700 no es suficiente para la carga completa.
- GPU recomendadas: AMD R9700 (gfx1201) o GPUs compatibles con Quark. No se menciona soporte específico para NVIDIA.
- Cabe en GPU de consumo: no se confirma; el proceso de conversión requirió dos GPUs y un volcado de capas a CPU, por lo que una GPU de 16 GB probablemente no sea suficiente.
- Opciones de despliegue: radiance-vllm-mxfp4 (fork de vLLM con soporte MXFP4). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Observaciones |
|---|---|---|---|---|---|
| gearwave00001/Huihui-Qwen3.8-27B-Quark-AWQ-MXFP4-MtpFp8 | 15.605.868.416 (safetensors) | No disponible | MXFP4 + drafter FP8 | Apache 2.0 | Conversión no oficial, abliterated, con drafter FP8 |
| amd/Qwen3.8-27B-Quark-AWQ-MXFP4 | No disponible | No disponible | MXFP4 | Apache 2.0 | Conversión oficial de AMD, sin abliterated |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B | No disponible | Sin cuantizar | Apache 2.0 | Modelo base abliterated, no cuantizado |

## Limitaciones y advertencias

- Sesgos: no se disponen de estudios de sesgos para este checkpoint. Al ser un modelo abliterated, la probabilidad de generar contenido no deseado o tóxico puede ser mayor que en el modelo alineado original.
- Riesgo de alucinación: como todo LLM, puede producir información falsa o inventada. La cuantización MXFP4 y el proceso de conversión pueden degradar ligeramente la calidad.
- Limitaciones de contexto e idioma: no se conocen con certeza ni la longitud de contexto ni los idiomas soportados. La familia Qwen suele ser multilingüe, pero este repo no lo documenta.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero requiere mantener los avisos de copyright y atribución a los autores del modelo base y de la conversión.
- Advertencia para producción: el repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad. El autor menciona que las últimas capas se descargaron a CPU durante la conversión, lo que podría afectar a la calidad final. La PPL es ligeramente superior a la del modelo de referencia de AMD.
- Soporte: al ser una derivación no oficial, no existe soporte por parte de Qwen ni de AMD.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/gearwave00001/Huihui-Qwen3.8-27B-Quark-AWQ-MXFP4-MtpFp8
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo de referencia de AMD: https://huggingface.co/amd/Qwen3.8-27B-Quark-AWQ-MXFP4
- AMD Quark: https://github.com/amd/Quark
- radiance-vllm-mxfp4: https://codeberg.org/ggz14/radiance-vllm-mxfp4/
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- vLLM Recipes para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
