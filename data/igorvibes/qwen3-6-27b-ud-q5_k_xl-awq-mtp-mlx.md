# igorvibes/Qwen3.6-27B-UD-Q5_K_XL-AWQ-MTP-mlx

## Resumen

Qwen3.6-27B-UD-Q5_K_XL-AWQ-MTP-mlx es una cuantización mixta de 5 bits del modelo Qwen/Qwen3.6-27B, preparada específicamente para Apple Silicon mediante la librería mlx-node. El autor, igorvibes, aplica el mapa de clases dinámico de Unsloth (Unsloth Dynamic) junto con un pre-escalado AWQ (activation-aware weight quantization) basado en una imatrix de calibración propia del modelo. El resultado es un checkpoint de 22,95 GiB que conserva la cabeza de predicción multi-token (MTP) sin cuantizar, lo que permite decodificación especulativa en runtimes compatibles con Qwen3.5/3.6.

La relevancia de esta conversión radica en que ofrece una alternativa de alta fidelidad para ejecutar un modelo de 27.800 millones de parámetros en equipos con memoria unificada de 36 GB o superior, sin recurrir a cuantizaciones uniformes más agresivas. El modelo base Qwen3.6-27B es un transformer híbrido que combina atención clásica con GatedDeltaNet, e incorpora una torre de visión en BF16 que se mantiene sin cuantizar en esta conversión. Aunque la ficha del autor declara explícitamente que no se han ejecutado benchmarks ni pruebas de rendimiento, la metodología de cuantización (grupo de 64, sobreescrituras por tensor y preservación de capas sensibles en 8 bits) sugiere una pérdida de calidad contenida.

El checkpoint está disponible bajo licencia Apache-2.0, con soporte declarado para inglés y chino. Es importante señalar que se trata de una conversión de pesos, no de un modelo reentrenado, y que el autor advierte que la torre de visión y el MTP no han sido verificados funcionalmente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención híbrida y GatedDeltaNet (modelo base Qwen3.6-27B) |
| Parametros totales | 27.781.427.952 (modelo original según model card); 7.025.767.152 en el safetensors cuantizado (solo pesos cuantizados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | Mixta 5–8 bits (Unsloth Dynamic) con AWQ pre-scaling, grupo de 64, 370 sobreescrituras por tensor; variante Q4_K_XL también disponible |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (formato nativo MLX, no GGUF) |

Nota: el dato de 7.025.767.152 parámetros corresponde al número de tensores cuantizados en el archivo safetensors, mientras que el total de parámetros del modelo original es 27.781.427.952. La discrepancia se debe a que la cuantización mixta no almacena todos los parámetros en el mismo formato y algunos (como la torre de visión y el MTP) se mantienen en BF16 sin cuantizar.

## Arquitectura y entrenamiento

Esta conversión no implica entrenamiento, sino una reparametrización de los pesos del modelo base Qwen/Qwen3.6-27B. El modelo original es un transformer híbrido que combina mecanismos de atención clásica con GatedDeltaNet, una arquitectura de estado recurrente que reduce el coste cuadrático de la atención en secuencias largas. Según los tags del repositorio, el modelo pertenece a la familia qwen3_5 y utiliza atención híbrida.

La cuantización aplica el mapa de clases dinámico de Unsloth, que asigna diferentes anchos de bits según la sensibilidad de cada capa: `gate_proj` y `up_proj` se cuantizan a 5 bits, `down_proj` a 6 bits, y la mayoría de proyecciones de atención, embeddings y `lm_head` a 8 bits. Las normalizaciones (RMSNorm, `q_norm`/`k_norm`), los parámetros de estado de GatedDeltaNet (`A_log`, `conv1d`, `dt_bias`), la torre de visión completa y la cabeza MTP se mantienen en BF16 sin cuantizar.

El pre-escalado AWQ se aplica sobre cuatro grupos de dependencia (norm→gate/up, up-rows→down-cols, input_layernorm→q/k/v, e input_layernorm→GatedDeltaNet `in_proj_*`), utilizando una imatrix de calibración generada por Unsloth específicamente para este modelo (`imatrix_unsloth.gguf_file`). El autor advierte que usar una imatrix de otro checkpoint degradaría silenciosamente la calidad. La conversión se realizó con mlx-node en una Mac de 36 GB, con un tiempo de 117 segundos y un pico de memoria de 13,41 GiB de RSS y 26,2 GiB de asignación MLX.

## Capacidades

- Generación de texto y conversación multilingüe (inglés y chino).
- Decodificación especulativa mediante la cabeza MTP (multi-token prediction) preservada en BF16, siempre que el runtime soporte Qwen3.5/3.6 speculative decoding.
- Entrada de imágenes y vídeo a través de la torre de visión (333 tensores en BF16), aunque el autor declara que no ha sido probada.
- Inferencia local eficiente en Apple Silicon gracias a la cuantización mixta y al formato nativo MLX.
- No se mencionan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso en la información proporcionada.

## Casos de uso

- Despliegue local en Apple Silicon con memoria unificada limitada: el checkpoint de 22,95 GiB cabe en equipos con 32 GB o más de RAM, permitiendo ejecutar un modelo de 27B sin depender de servicios en la nube.
- Prototipado y desarrollo de aplicaciones de chat en inglés y chino con mlx-node, aprovechando la API de MLX para integración en Node.js.
- Investigación en decodificación especulativa: la cabeza MTP conservada permite experimentar con aceleración de inferencia en runtimes compatibles con Qwen3.5/3.6.
- Procesamiento de documentos largos o conversaciones multi-turno en las que la ventana de contexto (no especificada) sea suficiente para la tarea.
- Evaluación de la calidad de cuantización mixta frente a cuantizaciones uniformes (Q4, Q5, Q8) en tareas de generación de texto y razonamiento.
- Aplicaciones educativas o de demostración que requieran un modelo de gran tamaño ejecutándose en hardware de consumo (Mac M-series) con un presupuesto de memoria acotado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor declara explícitamente: "No benchmarks were run on this build. No perplexity, no task evals, no throughput numbers." Por tanto, no es posible comparar cuantitativamente este checkpoint con otras cuantizaciones o con el modelo original.

## Requisitos de hardware

- VRAM/RAM unificada estimada: el repositorio ocupa 24,7 GB en disco; para cargar los 22,95 GiB de pesos en memoria se recomienda al menos 32 GB de RAM unificada en Apple Silicon. La conversión se realizó en una Mac de 36 GB con un pico de 26,2 GiB de asignación MLX, por lo que 32 GB podría ser el mínimo práctico.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No es compatible con GPUs NVIDIA o AMD.
- Opciones de despliegue: mlx-node (librería oficial para Node.js) y, en general, cualquier runtime que cargue safetensors en formato MLX. No es compatible con vLLM, llama.cpp u Ollama, que usan formatos diferentes.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño en disco | BPW | Contexto | Licencia |
|---|---|---|---|---|---|
| igorvibes/Qwen3.6-27B-UD-Q5_K_XL-AWQ-MTP-mlx (este) | 27,78B | 22,95 GiB | 7,38 | No disponible | Apache-2.0 |
| igorvibes/Qwen3.6-27B-UD-Q4_K_XL-AWQ-MTP-mlx | 27,78B | 19,45 GiB | 6,18 | No disponible | Apache-2.0 |
| Qwen/Qwen3.6-27B (original, sin cuantizar) | 27,78B | ~55 GiB (estimado) | 16 (BF16) | No disponible | Apache-2.0 |

La variante Q5 ofrece mayor fidelidad que la Q4 a costa de 3,5 GiB adicionales. Frente al modelo original, esta conversión reduce el tamaño a menos de la mitad, lo que la hace viable en hardware de consumo, pero introduce pérdida de precisión inherente a la cuantización. No se dispone de datos de rendimiento para comparar con otras cuantizaciones de la misma familia.

## Limitaciones y advertencias

- No se han ejecutado benchmarks: el autor declara explícitamente que no hay resultados de perplexity, evaluaciones de tareas ni mediciones de throughput. Cualquier uso en producción debería validarse previamente.
- La cabeza MTP está preservada pero no verificada: los tensores están presentes y con formas correctas, pero no se ha confirmado que el runtime los active correctamente.
- La torre de visión no ha sido probada: no se ha ejercitado ninguna entrada de imagen o vídeo, por lo que su funcionamiento es incierto.
- Solo se declaran soporte para inglés y chino; otros idiomas podrían funcionar pero no están garantizados.
- La cuantización mixta puede degradar la calidad en tareas sensibles a la precisión (matemáticas, razonamiento lógico, generación de código), aunque las capas críticas se mantienen en 8 bits.
- El autor advierte que la imatrix de calibración es específica para este modelo; usar una imatrix de otro checkpoint degradaría silenciosamente el resultado.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base Qwen3.6-27B también cumple con los términos de redistribución y atribución.
- No hay garantías de soporte ni mantenimiento por parte del autor; es un proyecto independiente sin respaldo de Qwen ni de Unsloth.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/igorvibes/Qwen3.6-27B-UD-Q5_K_XL-AWQ-MTP-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Importancia matrix (imatrix): https://huggingface.co/unsloth/Qwen3.6-27B-GGUF
- Documentación de Unsloth Dynamic: https://unsloth.ai/docs/models/qwen3.5/gguf-benchmarks
- Herramienta de conversión mlx-node: https://github.com/mlx-node/mlx-node
- Referencia de la receta (variante Q4): https://huggingface.co/Brooooooklyn/Qwen3.6-27B-UD-Q4_K_XL-mlx
- PR #118 de mlx-node (fix de memoria): https://github.com/mlx-node/mlx-node/pull/118
