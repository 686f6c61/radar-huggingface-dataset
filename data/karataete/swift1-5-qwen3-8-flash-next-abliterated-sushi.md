# Karataete/swift1.5-qwen3.8-flash-next-abliterated-sushi

## Resumen

`Karataete/swift1.5-qwen3.8-flash-next-abliterated-sushi` es un pack de pesos cuantizados en formato Sushi/EXL3 derivado de una versión "abliterated" (con el comportamiento de rechazo eliminado mediante edición de pesos) del modelo `Qwen/Qwen3.8-Flash-Next` de Qwen. El autor del pack, Karataete, no ha entrenado ni afinado el modelo: se limita a convertir los pesos BF16 abliterados a cuantización de 2,0 bits por peso en los expertos y a publicarlos en el layout de shards antiguo de Sushi (51 ficheros `model-00001.safetensors` en adelante). El pipeline declarado es `image-text-to-text`, lo que sitúa al modelo base en la categoría multimodal, y los tags confirman una arquitectura MoE con identificador interno `qwen3_8`.

El repositorio tiene 21.142.110.099 parámetros totales según los safetensors y ocupa 69,6 GB, de los cuales 29,8 GB corresponden a una tabla n-gram (`ngram_table.bin`) usada para decodificación especulativa. La model card marca explícitamente este repo como **superseded**: el autor recomienda usar la variante `swift1.5-qwen3.8-flash-next-abliterated-sushi-2bpw`, que emplea el layout de 48 shards actual y es la que respalda las cifras publicadas. Este pack se conserva únicamente por compatibilidad con el loader de la release antigua de Sushi y porque su manifiesto `.sushi-pull.json` documenta la conversión.

La relevancia es doble: por un lado, ofrece una vía de despliegue de un MoE multimodal de ~21B parámetros en un espacio de disco y memoria muy reducido gracias a EXL3 a 2 bpw; por otro, ilustra los riesgos de los derivados "abliterated", que eliminan los rechazos por edición de pesos sin garantía de alineación ni política de contenido. La licencia es la Qwen Community License, no una licencia permisiva, y el propio autor advierte que los pesos y la licencia pertenecen a Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (tag `moe`, identificador `qwen3_8`); detalles de capas y atención no disponibles |
| Parametros totales | 21.142.110.099 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la información del repo; la evaluación del pack hermano menciona needle 5/5 hasta 250.000 tokens |
| Tipos de cuantizacion | EXL3 / Sushi a 2,0 bpw en expertos (`--experts-k 2`); tag `8-bit` en metadatos de HF (no coincide con el bpw declarado en la model card) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License (`license: other`, `license_name: qwen-community-license`) |
| Formato de pesos | safetensors en layout Sushi/EXL3 antiguo (51 shards `model-00001.safetensors`…), más `ngram_table.bin` (29,8 GB) y `.sushi-pull.json` |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.8-Flash-Next`, un transformer con mezcla de expertos (MoE) y capacidades multimodales (pipeline `image-text-to-text`). No se dispone en la información proporcionada de detalles sobre número de capas, dimensión oculta, número de expertos, top-k de enrutamiento, ventana de contexto nativa ni composición del dataset de entrenamiento. Tampoco se documenta si hubo RLHF, DPO u otra fase de alineación en el modelo original.

La modificación aplicada por el autor es una **abliteración** sobre los pesos BF16: una edición de dirección global de rango 1 sobre 149 tensores "writer", con direcciones de experto muestreadas 64 de 512. No hay fine-tuning. Posteriormente los pesos se convierten a EXL3/Sushi con cuantización de expertos a 2,0 bpw, generando 216 ficheros y 64,8 GB de pesos. La innovación técnica destacable es la tabla n-gram de 29,8 GB (`ngram_table.bin`) para decodificación especulativa, que en el pack hermano se denomina "dFlash n-gram table". El layout de shards de este repo es el antiguo, sin ficheros `layer-*.safetensors`, lo que lo hace compatible solo con versiones anteriores del loader de Sushi.

## Capacidades

- Generación de texto conversacional multi-turno, según el tag `conversational`.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), aunque no se detallan tareas concretas de visión en la model card.
- Razonamiento con modo "thinking": la evaluación del pack hermano reporta resultados separados para `no-thinking` y `thinking`, con hasta 2.184 tokens de pensamiento por pregunta en la configuración `xhigh`.
- Contexto largo: la evaluación del pack hermano reporta needle 5/5 hasta 250.000 tokens.
- Capacidades matemáticas y de conocimiento general medidas en el pack hermano (GSM8K, MMLU-200, BenchLocal).
- Comportamiento de rechazo eliminado por edición de pesos: el modelo no aplica políticas de contenido ni guardrails propios.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de audio: no disponible; el pipeline declarado solo cubre imagen y texto.

## Casos de uso

- Despliegue de un MoE multimodal de ~21B parámetros en hardware con VRAM limitada: la cuantización EXL3 a 2 bpw reduce los pesos a 64,8 GB en disco, lo que permite servir el modelo en una sola GPU de 80 GB o en dos de 48 GB, algo inviable con los pesos BF16 originales.
- Investigación sobre abliteración y alineación: el repo documenta el proceso (149 tensores editados, direcciones de experto 64/512) y permite reproducir estudios sobre cómo la eliminación de la dirección de rechazo afecta a la calidad y a la calibración del modelo.
- Procesamiento de documentos largos con imagen y texto: la ventana de contexto reportada en el pack hermano (needle 5/5 hasta 250.000 tokens) lo hace adecuado para tareas de recuperación de información en corpus extensos que combinan capturas, tablas escaneadas y texto.
- Generación asistida con decodificación especulativa: la tabla n-gram de 29,8 GB acelera la generación en cargas de trabajo de texto repetitivo o dominios acotados, siempre que el runtime de Sushi soporte esta función.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de un MoE multimodal al pasar de BF16 a 2 bpw en expertos, comparando contra el pack `-2bpw` con layout actualizado.
- Entornos de investigación sin restricciones de contenido: al haber eliminado los rechazos, es útil para estudiar respuestas en dominios donde los modelos alineados se niegan a contestar, siempre con revisión humana y sin exposición a usuarios finales.
- Archivado y reproducibilidad de conversiones: el manifiesto `.sushi-pull.json` permite auditar exactamente qué pesos se descargaron y cómo se convirtieron, útil para pipelines de trazabilidad de modelos derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este layout en la información disponible. El autor indica explícitamente que este repo "no fue evaluado por separado" y que las cifras etiquetadas como `qwen` en sus resultados corresponden al pack hermano `swift1.5-qwen3.8-flash-next-abliterated-sushi-2bpw`. A modo de referencia, y sin que sean atribuibles a este repositorio, la model card cita para el pack `-2bpw`:

| Benchmark | Resultado (pack `-2bpw`, no este repo) |
|---|---|
| Needle in a haystack | 5/5 hasta 250.000 tokens |
| BenchLocal (no-thinking) | 126 |
| BenchLocal (thinking) | 140 |
| MMLU-200 | 87,5 |
| GSM8K | 98,0 |
| xhigh (thinking, 2.184 tokens/pregunta) | 87,7 % |

El autor advierte que son ejecuciones únicas con un ruido de ±3–5 puntos. No se dispone de comparación con el modelo base BF16 ni con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 64,8 GB en EXL3 a 2 bpw; hay que sumar la caché KV, que con contexto de hasta 250.000 tokens puede ser muy significativa. Presupuesto realista: 80 GB o más para contexto largo, 48 GB para contexto moderado con cuantización adicional de caché.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 141 GB; dos RTX 4090 de 24 GB o dos L40S de 48 GB para contexto corto y medio.
- Cabe en consumer GPU: solo en configuraciones multi-GPU (por ejemplo, 2× RTX 4090 o 2× RTX 3090 con NVLink o PCIe), y con limitaciones de contexto. Una única RTX 4090 de 24 GB no es suficiente para los 64,8 GB de pesos.
- Opciones de despliegue: runtime de Sushi/EXL3 (ExLlama) en su versión compatible con el layout antiguo de shards; no se garantiza compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado el formato EXL3 y la tabla n-gram propietaria. El tag `endpoints_compatible` de HF no implica soporte en esos motores.
- Latencia y throughput estimados: no disponibles. La decodificación especulativa mediante `ngram_table.bin` debería mejorar el throughput en texto predecible, pero no se han publicado mediciones para este pack.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (`swift1.5-...-sushi`, layout antiguo) | 21,14B totales (MoE) | no disponible (evaluado hasta 250k en el pack hermano) | EXL3 2,0 bpw | Qwen Community License | Público, 22 descargas, sin benchmarks propios |
| `Karataete/swift1.5-qwen3.8-flash-next-abliterated-sushi-2bpw` | mismos pesos abliterados | mismo contexto | EXL3 2,0 bpw, layout 48 shards + dFlash n-gram | Qwen Community License | Público; es el repo recomendado y el que respalda las cifras |
| `Qwen/Qwen3.8-Flash-Next` (base) | no disponible | no disponible | BF16 original | Qwen Community License | Público, gated: false |
| Otros MoE multimodales de ~20B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es interna: este repo y el `-2bpw` comparten pesos, pero difieren en layout y en que solo el segundo tiene evaluación publicada y tabla n-gram actualizada. Frente al base BF16, la diferencia es de cuantización (2 bpw frente a 16 bits) y de alineación (abliterated frente a original).

## Limitaciones y advertencias

- **Repo superseded**: el propio autor recomienda no usarlo y migrar a `swift1.5-qwen3.8-flash-next-abliterated-sushi-2bpw`. El layout antiguo solo funciona con versiones previas del loader de Sushi.
- **Sin benchmarks propios**: no hay mediciones de calidad, latencia ni throughput para este layout; las cifras citadas pertenecen a otro repositorio y son ejecuciones únicas con ±3–5 puntos de ruido.
- **Abliteración sin garantías**: se han eliminado los rechazos mediante edición de pesos, sin política de contenido, sin guardrails y sin barrido de rechazo ejecutado para este pack. No apto para exposición directa a usuarios finales sin filtros externos.
- **Riesgo de alucinación**: no cuantificado en la información disponible; la cuantización agresiva a 2 bpw en expertos puede degradar la fidelidad respecto a BF16, especialmente en razonamiento largo.
- **Idiomas no documentados**: no se especifica qué idiomas cubre el modelo base ni si la abliteración afecta de forma desigual a distintas lenguas.
- **Licencia restrictiva**: Qwen Community License, no permisiva; hay que revisar sus condiciones para uso comercial y para redistribución de derivados. Los pesos y la licencia pertenecen a Qwen; la abliteración es del autor del pack.
- **Inconsistencia de metadatos**: el tag `8-bit` de HF no concuerda con los 2,0 bpw declarados en la model card; conviene verificar el formato real antes de integrarlo en producción.
- **Dependencia de runtime**: EXL3/Sushi no es un formato estándar de safetensors; la portabilidad a vLLM, llama.cpp u Ollama no está garantizada.
- **Contexto y caché KV**: aunque la evaluación del pack hermano alcanza 250.000 tokens, servir ese contexto exige memoria muy superior a la de los pesos, lo que limita el despliegue real en GPUs de 80 GB.
- **Procedencia parcial**: los datos de ejecución y las filas en bruto están en un repositorio privado (`ggrabarz/sushi-abliteration-runs`), por lo que la reproducibilidad externa es limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Karataete/swift1.5-qwen3.8-flash-next-abliterated-sushi
- Repositorio recomendado (pack `-2bpw`): https://huggingface.co/Karataete/swift1.5-qwen3.8-flash-next-abliterated-sushi-2bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia Qwen Community License: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Repositorio privado de ejecuciones del autor: `ggrabarz/sushi-abliteration-runs` (no accesible públicamente)
