# mradermacher/Qwen3.8-27B-MindMeld-OneJev1.6-i1-GGUF

## Resumen

Qwen3.8-27B-MindMeld-OneJev1.6-i1-GGUF es una colección de cuantizaciones en formato GGUF, generadas por el cuantizador mradermacher, del modelo base nightmedia/Qwen3.8-27B-MindMeld-OneJev1.6. El modelo original es un modelo experimental de 27.320.697.856 parámetros basado en la familia Qwen, etiquetado con distillation de tipo "claude-distillation", razonamiento con cadena de pensamiento larga (long-cot), SFT y LoRA. Se presenta como un modelo de propósito general orientado a tareas de programación, investigación, escritura creativa, rol y razonamiento matemático o STEM.

La relevancia de esta ficha radica en que el repo de mradermacher no es un modelo nuevo en sí, sino la versión cuantizada (imatrix/weighted) que permite ejecutar el modelo en hardware de consumo con llama.cpp, Ollama o LM Studio. Ofrece múltiples niveles de cuantización, desde Q2_K (11,0 GB) hasta Q6_K (22,5 GB), lo que facilita elegir el equilibrio entre calidad y VRAM. La licencia del modelo base es Apache 2.0, por lo que el uso comercial está permitido.

La model card indica que se trata de un modelo con capacidades de visión (se mencionan ficheros mmproj en el repo estático), contexto largo (se citan 256k y 1M de contexto en las etiquetas) y soporte multilingüe (inglés, chino, japonés y castellano). Al ser un modelo experimental y tipo merge (mergekit), conviene tratarlo con cautela en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en la familia Qwen (detalle exacto no disponible) |
| Parametros totales | 27.320.697.856 (≈27,3 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible oficialmente; las etiquetas mencionan 256k y 1M de contexto |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix/weighted) |
| Idiomas soportados | inglés, chino, japonés, castellano |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (imatrix); el modelo base está en safetensors bf16 |

## Arquitectura y entrenamiento

El modelo base, nightmedia/Qwen3.8-27B-MindMeld-OneJev1.6, es un modelo experimental de la familia Qwen con unos 27,3 mil millones de parámetros. Las etiquetas de la model card sugieren que se trata de un merge (mergekit) que incorpora técnicas de destilación desde un modelo "claude-distillation" (claude4.6), entrenamiento con SFT, LoRA y razonamiento con cadena de pensamiento larga (long-cot). No se ha publicado información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni los métodos exactos de alineamiento (RLHF/DPO) en la información disponible.

La versión aquí descrita es la cuantización imatrix (importance matrix) de mradermacher, que pondera la cuantización según la importancia de cada tensor para reducir la pérdida de calidad frente a cuantizaciones estáticas. El repo incluye un fichero imatrix de 0,1 GB para quien quiera generar sus propias cuantizaciones. La model card también indica que existen cuantizaciones estáticas en un repo paralelo y que se trata de un modelo con capacidades de visión (los ficheros mmproj se encuentran en el repo estático).

## Capacidades

- Generación de texto conversacional e instruction-tuned.
- Razonamiento con cadena de pensamiento larga (long-cot) y etiquetas de reasoning.
- Programación (coding) y tareas STEM/matemáticas.
- Escritura creativa: generación de tramas, subtramas, escenas, narrativa de ciencia ficción y otros géneros, "vivid prosing".
- Roleplaying y narrativa interactiva.
- Capacidades multilingües: inglés, chino, japonés y castellano.
- Capacidades de visión (se mencionan ficheros mmproj en el repo estático asociado).
- Contexto largo: las etiquetas mencionan 256k y 1M de contexto (no verificado oficialmente).
- No consta soporte oficial de tool calling ni de agentes en la información disponible.

## Casos de uso

- Escritura creativa y generación de ficción: las etiquetas específicas de storytelling, generación de tramas y subtramas y "vivid writing" lo hacen adecuado para asistir a autores en la creación de novelas o guiones por escenas.
- Roleplaying e interactivo: el modelo puede encarnar personajes en sesiones de rol de larga duración, aprovechando el contexto extenso para mantener coherencia narrativa.
- Programación y depuración: puede emplearse como asistente de código local para generar, revisar y explicar código sin depender de servicios en la nube.
- Razonamiento matemático y STEM: las etiquetas de math y stem apuntan a resolución de problemas con cadena de pensamiento larga.
- Asistente conversacional local: con cuantizaciones Q4_K_M (16,9 GB) puede ejecutarse en una GPU de consumo para chat privado.
- Investigación y experimentación: al ser un modelo experimental tipo merge con destilación, resulta interesante para estudiar el efecto de estas técnicas en modelos abiertos.
- Procesamiento de documentos largos: si el contexto de 256k/1M se confirma, permitiría resumir o analizar documentos muy extensos de una sola vez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según la tabla de cuantizaciones):
  - i1-Q2_K: 11,0 GB
  - i1-Q3_K_S / IQ3_S / IQ3_M: 12,4–12,9 GB
  - i1-IQ4_XS: 15,4 GB
  - i1-Q4_K_M: 16,9 GB (recomendada por el autor)
  - i1-Q5_K_M: 19,6 GB
  - i1-Q6_K: 22,5 GB
- GPU recomendadas: para la cuantización Q4_K_M, una RTX 3090 o RTX 4090 (24 GB) es suficiente con margen para contexto; para Q5/Q6 conviene una RTX 4090, A100 o H100, o descarga parcial en RAM.
- Cabe en GPUs de consumo: sí, desde Q2_K hasta Q5_K_M caben en una RTX 3090/4090 de 24 GB; las cuantizaciones de 11–17 GB también pueden ejecutarse en GPUs de 16 GB (RTX 4060 Ti 16GB, RTX 4080) con ajustes de contexto.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp y otros runtimes compatibles con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-MindMeld-OneJev1.6-i1-GGUF (esta ficha) | 27,3 B | GGUF imatrix | Apache 2.0 | Merge experimental, escritura creativa y razonamiento |
| Qwen3-32B (oficial) | 32 B | safetensors, GGUF comunitario | Apache 2.0 | Modelo base oficial, mejor documentado y con benchmarks publicados |
| Qwen3-30B-A3B (oficial) | 30 B (3 B activos, MoE) | safetensors, GGUF comunitario | Apache 2.0 | Mayor throughput por activar pocos parámetros |

Nota: la comparativa se establece con modelos de la misma familia y rango de tamaño; los datos de rendimiento comparativo no están disponibles.

## Limitaciones y advertencias

- Es un modelo experimental tipo merge (mergekit) con destilación no documentada en detalle; su comportamiento puede ser impredecible y no ha pasado por el mismo nivel de validación que los modelos oficiales de Qwen.
- No se han publicado benchmarks verificables; la calidad real debe evaluarse caso por caso.
- Las etiquetas mencionan contextos de 256k y 1M, pero no hay confirmación oficial de la longitud de contexto efectiva ni de su calidad a distancias grandes.
- Riesgo de alucinación típico de modelos de lenguaje; no hay datos específicos de calibración publicados.
- Sesgos: no disponible; al derivar de un modelo destilado, pueden heredarse sesgos del modelo maestro sin documentación al respecto.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar la ficha del modelo base por si existen restricciones adicionales.
- La cuantización implica pérdida de calidad, especialmente en niveles bajos (Q2_K, Q3); el propio autor recomienda IQ3_XXS sobre Q2_K y señala que Q4_0 es de baja calidad.
- Las capacidades de visión requieren los ficheros mmproj del repo estático, no de este repo imatrix.

## Enlaces

- Repo de cuantizaciones imatrix (esta ficha): https://huggingface.co/mradermacher/Qwen3.8-27B-MindMeld-OneJev1.6-i1-GGUF
- Repo de cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.8-27B-MindMeld-OneJev1.6-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.8-27B-MindMeld-OneJev1.6
- Página de descarga resumida: https://hf.tst.eu/model#Qwen3.8-27B-MindMeld-OneJev1.6-i1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
