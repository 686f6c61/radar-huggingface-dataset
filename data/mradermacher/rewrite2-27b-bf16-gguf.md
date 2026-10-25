# mradermacher/rewrite2-27b-bf16-GGUF

## Resumen

`mradermacher/rewrite2-27b-bf16-GGUF` es una republicación en formato GGUF del modelo `aikexue170/rewrite2-27b-bf16`, un modelo de 26.895.998.464 parámetros (≈26,9 B) orientado a la reescritura y expansión de novelas en chino. Lo desarrolla el usuario aikexue170 y lo cuantiza mradermacher, un conocido distribuidor de cuantizaciones GGUF para inferencia local.

El repositorio no documenta arquitectura, contexto, datos de entrenamiento ni licencia; la model card se limita al proceso de cuantización. Los tags del modelo (`rewrite2`, `novel-rewrite`, `novel-expansion`, `chinese`, `bf16`) sitúan su uso previsto en edición narrativa en lengua china, no en tareas generales de código, matemáticas o agentes.

Su relevancia práctica es que permite ejecutar un modelo de casi 27 B en hardware de consumo mediante 11 cuantizaciones estáticas que van de 10,8 GB (Q2_K) a 28,7 GB (Q8_0), evitando los aproximadamente 54 GB que ocupan los pesos en bf16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 26.895.998.464 (≈26,9 B) |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | chino (`zh`) |
| Licencia | no disponible |
| Formato de pesos | GGUF (ficheros `.gguf`); el modelo base se distribuye en bf16, con pesos safetensors según los metadatos del repositorio |
| Modelo base | aikexue170/rewrite2-27b-bf16 |
| Cuantizador | mradermacher |
| Tamaño del repositorio | 186,3 GB (incluye todas las cuantizaciones) |
| Tipo de cuantización | estática (`quantize_version: 2`, `output_tensor_quantised: 1`) |
| Cuantizaciones con imatrix | no disponibles en el momento de la publicación |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura de la red subyacente, el número de tokens de entrenamiento, la composición del corpus ni si hubo fases de alineación como RLHF o DPO. La model card del repositorio cuantizado no incluye ninguno de estos datos y el repositorio base no aporta detalles en la información proporcionada. El nombre del modelo sugiere una base de 27 B y los tags apuntan a un ajuste específico para reescritura y expansión de narrativa en chino, pero se trata de una inferencia a partir del nombre y las etiquetas, no de una especificación confirmada.

La única innovación técnica documentada es el propio proceso de cuantización: se han generado cuantizaciones estáticas a partir del checkpoint en bf16, sin calibración con imatrix. El autor advierte de que las cuantizaciones ponderadas con imatrix no estaban disponibles en el momento de la publicación y que, si no aparecen en aproximadamente una semana, probablemente no las planifique salvo petición en la discusión comunitaria.

## Capacidades

- Reescritura de texto narrativo en chino, según el tag `novel-rewrite`.
- Expansión de novelas y esquemas argumentales a prosa, según el tag `novel-expansion`.
- Generación de texto conversacional multi-turno, según el tag `conversational`; no se documenta la plantilla de chat utilizada.
- Capacidad multilingüe limitada al chino (`zh`); no se declaran otros idiomas.
- No hay evidencia documentada de tool calling ni function calling.
- No hay evidencia documentada de uso como agente, razonamiento multi-paso o planificación.
- No hay evidencia documentada de generación de código, matemáticas, visión, audio ni modo de razonamiento explícito.
- La cuantización no añade capacidades al modelo base; únicamente reduce el peso y los requisitos de memoria.

## Casos de uso

- Reescritura de capítulos de novela en chino: el modelo recibe un borrador y devuelve una versión con estilo y estructura revisados, aprovechando su ajuste específico para `novel-rewrite`. Es adecuado para flujos editoriales donde el texto ya existe y se busca pulido, no generación desde cero.
- Expansión de esquemas y sinopsis: a partir de un outline o de una escena resumida, el modelo desarrolla prosa y diálogo. El tag `novel-expansion` indica que este es el uso previsto, útil para autores que trabajan con escaletas.
- Generación de variantes de un mismo pasaje: permite producir varias redacciones de una escena para que el autor elija tono, ritmo o registro, ejecutándose en local para no enviar material inédito a servicios externos.
- Corrección de estilo y coherencia en lotes: con `llama-server` o un script sobre `llama.cpp` se puede procesar por capítulos, pasando contexto previo para mantener nombres y continuidad, siempre que la ventana de contexto real del modelo lo permita (dato no disponible).
- Asistencia a traducción editorial: el modelo puede reescribir y normalizar el texto chino de origen antes de pasarlo a un traductor automático o humano, reduciendo ambigüedades; no se debe usar como traductor directo, ya que solo declara chino.
- Prototipado de herramientas de escritura interactiva: el tag `conversational` permite construir un asistente de escritura local con turnos sucesivos, útil para demos y pruebas de producto sin depender de API.
- Despliegue en entornos con requisitos de privacidad: al caber en una GPU de 24 GB en Q4_K_M o Q5_K_M, se puede ejecutar en una estación de trabajo sin conexión, algo relevante para manuscritos no publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, perplejidad ni evaluaciones específicas de reescritura o calidad narrativa. Tampoco se proporcionan comparaciones con el modelo base en bf16 ni métricas de latencia o throughput.

## Requisitos de hardware

Estimaciones de VRAM para los pesos, sin contar caché KV ni overhead del runtime; el consumo real depende del contexto configurado, que no está documentado.

| Cuantización | Tamaño | VRAM estimada (pesos + margen) | Notas |
|---|---:|---:|---|
| bf16 (base) | ≈53,8 GB | ≥60 GB | A100 80GB, H100 80GB o 2× RTX 4090/3090 |
| Q8_0 | 28,7 GB | ≈32-34 GB | A100 40GB; en 24 GB requiere offload parcial |
| Q6_K | 22,2 GB | ≈25-27 GB | justo en RTX 3090/4090 de 24 GB con contexto corto |
| Q5_K_M | 19,3 GB | ≈22-24 GB | cabe en 24 GB con margen ajustado |
| Q5_K_S | 18,8 GB | ≈21-23 GB | alternativa a Q5_K_M |
| Q4_K_M | 16,6 GB | ≈19-21 GB | equilibrio recomendado por el autor |
| Q4_K_S | 15,7 GB | ≈18-20 GB | marcado como rápido y recomendado |
| IQ4_XS | 15,3 GB | ≈18-20 GB | opción IQ de tamaño similar a Q4_K_S |
| Q3_K_L | 14,4 GB | ≈17-19 GB | |
| Q3_K_M | 13,4 GB | ≈16-18 GB | el autor lo marca como calidad inferior |
| Q3_K_S | 12,2 GB | ≈15-17 GB | |
| Q2_K | 10,8 GB | ≈13-15 GB | cuantización de mínimos; pérdida de calidad esperable |

- GPU de 24 GB (RTX 3090, RTX 4090, A10G, L4 con menos margen): Q4_K_M y Q5_K_M son las opciones más equilibradas; Q6_K y Q8_0 exigen offload parcial o contextos muy cortos.
- GPU de 16 GB (RTX 4080, 4070 Ti Super, A4000): viables Q3_K_M, IQ4_XS y, con contexto reducido, Q4_K_S.
- GPU de 12 GB (RTX 3060 12GB, 4070): solo Q2_K y Q3_K_S, con calidad degradada.
- CPU y RAM: Q4_K_M necesita unos 16-20 GB de RAM libre; Q8_0, unos 30-32 GB. El rendimiento en CPU para 27 B será bajo y no se dispone de cifras de tokens por segundo.
- Despliegue: `llama.cpp` (`llama-cli`, `llama-server`), Ollama mediante importación de Modelfile, LM Studio, koboldcpp y text-generation-webui. El repositorio incluye el tag `endpoints_compatible`. vLLM y TGI no son la vía recomendada para GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (27 B, chino, reescritura narrativa) con benchmarks públicos en la documentación aportada, por lo que la comparación externa se considera no disponible. Como referencia práctica, la comparación relevante es entre las precisiones del mismo modelo:

| Variante | Parámetros | Contexto | Licencia | Formato | Tamaño | Notas |
|---|---|---|---:|---|---:|---|
| rewrite2-27b-bf16 (base) | 26,9 B | no disponible | no disponible | bf16 | ≈53,8 GB | referencia de calidad |
| rewrite2-27b-bf16 Q8_0 | 26,9 B | no disponible | no disponible | GGUF | 28,7 GB | máxima calidad cuantizada |
| rewrite2-27b-bf16 Q4_K_M | 26,9 B | no disponible | no disponible | GGUF | 16,6 GB | equilibrio tamaño/calidad |
| rewrite2-27b-bf16 Q2_K | 26,9 B | no disponible | no disponible | GGUF | 10,8 GB | solo para hardware muy limitado |

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución. Es un bloqueo potencial para producción hasta verificarlo en el repositorio base.
- Modelo monolingüe declarado en chino (`zh`); no hay soporte documentado de castellano ni de otros idiomas.
- Especialización estrecha en reescritura y expansión de novela; no hay evidencia de buen rendimiento en código, matemáticas, razonamiento factual o tareas de agente.
- Riesgo de alucinación y de inconsistencia narrativa: el modelo puede inventar detalles, alterar nombres o romper la continuidad de la trama, especialmente con contextos largos no verificados.
- Longitud de contexto desconocida: planificar pipelines por capítulos con contexto acotado y validación manual.
- No se documenta plantilla de chat, tokens especiales ni configuración de muestreo recomendada; el tag `conversational` no garantiza un formato concreto.
- Las cuantizaciones son estáticas y sin imatrix; a 2-3 bits la pérdida de calidad es probable y el propio autor marca Q3_K_M como de calidad inferior.
- El repositorio ocupa 186,3 GB por incluir todas las variantes; descargar solo el fichero necesario.
- No hay evaluación de sesgos, seguridad ni alineación. Un modelo entrenado sobre corpus narrativo puede reproducir estereotipos presentes en el material original.
- Con 27 B, la inferencia en CPU es lenta y el despliegue en GPU de 12 GB obliga a cuantizaciones de baja calidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/rewrite2-27b-bf16-GGUF
- Modelo base: https://huggingface.co/aikexue170/rewrite2-27b-bf16
- Página de descarga y visión general del cuantizador: https://hf.tst.eu/model#rewrite2-27b-bf16-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Catálogo de modelos de mradermacher: https://huggingface.co/mradermacher/models
- Guía de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de perplejidad entre cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
