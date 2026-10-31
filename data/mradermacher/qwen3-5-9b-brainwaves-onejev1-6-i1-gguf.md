# mradermacher/Qwen3.5-9B-Brainwaves-OneJev1.6-i1-GGUF

## Resumen

Qwen3.5-9B-Brainwaves-OneJev1.6-i1-GGUF es una colección de cuantizaciones GGUF con imatrix (matriz de importancia) del modelo nightmedia/Qwen3.5-9B-Brainwaves-OneJev1.6, publicada por el cuantizador mradermacher. El modelo base es un fine-tuning experimental de 9.197 millones de parámetros sobre la familia Qwen3.5/3.6, orientado a razonamiento con chain-of-thought largo, escritura creativa y ficción, con etiquetas que sugieren destilación de estilo tipo Claude y soporte de contextos muy largos (256k y hasta 1M de tokens según los tags).

La relevancia de esta ficha no está tanto en el modelo base —un merge experimental de la comunidad— sino en la utilidad del repo: ofrece más de veinte variantes de cuantización ponderada (IQ y Q_K) que permiten ejecutar el modelo en hardware modesto, desde portátiles con 4 GB de VRAM hasta estaciones de trabajo. Al tratarse de un GGUF, es compatible directamente con llama.cpp, Ollama, LM Studio y runtimes similares.

Cabe destacar que, según el autor, se trata de un modelo de visión (los archivos mmproj se publican en el repositorio estático hermano), y que incorpora técnicas como multi-token prediction y decodificación especulativa según sus tags. Al ser un modelo experimental y sin model card detallada del entrenamiento, conviene tratarlo como material de evaluación e investigación más que como componente de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen3.5/3.6), con multi-token prediction según tags; detalles no disponibles |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | no disponible (no hay evidencia de que sea MoE) |
| Longitud de contexto | 256k y 1M según tags del modelo base; valor confirmado no disponible |
| Tipos de cuantizacion | i1-Q2_K, IQ2 variants (IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M), IQ1_M, IQ1_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q2_K, Q2_K_S, Q3_K_S/M/L, Q4_0, Q4_1, Q4_K_S/M, IQ4_NL, IQ4_XS, Q5_K_S/M, Q6_K (ponderadas con imatrix) |
| Idiomas soportados | inglés, chino, japonés, español |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); el modelo base en safetensors/bf16 |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Qwen3.5/3.6 de Alibaba, un transformer decoder denso de unos 9,2B de parámetros. Los tags del repositorio indican que el fine-tuning se realizó mediante SFT con LoRA (posiblemente con Unsloth) sobre un merge creado con mergekit, incorporando capacidades de razonamiento con cadenas de pensamiento largas (long-CoT) y destilación de un modelo profesor referenciado como "claude-distillation". Los tags también mencionan multi-token prediction y speculative decoding, aunque la model card no detalla cómo se implementan.

No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La fuerte presencia de tags de escritura creativa (fiction, storytelling, vivid prose, roleplaying) sugiere un dataset de fine-tuning con peso significativo de ficción y roleplay, además de math, STEM y código. Este repo en concreto no modifica los pesos: aporta cuantizaciones GGUF ponderadas con imatrix, que preservan mejor la calidad que las cuantizaciones estáticas a igual tamaño, especialmente en rangos bajos (2-3 bits).

## Capacidades

- Generación de texto conversacional con instrucciones (instruction-tuned)
- Razonamiento con chain-of-thought largo (long-CoT), según tags
- Generación de código y tareas de investigación (tags coding, research)
- Matemáticas y STEM
- Escritura creativa: ficción, generación de tramas y subtramas, continuación de escenas, ciencia ficción, storytelling en géneros variados
- Roleplaying y escritura vívida
- Capacidades multilingües: inglés, chino, japonés y español
- Visión: el autor indica que es un modelo de visión, con archivos mmproj en el repo estático hermano
- Contexto muy largo (tags de 256k y 1M de tokens)
- Soporte de tool calling: no disponible en la información proporcionada
- Modo thinking explícito: no disponible en la información proporcionada

## Casos de uso

- Escritura de ficción asistida: generación de tramas, subtramas y continuación de escenas; el fine-tuning específico en storytelling y "vivid prose" lo hace adecuado para autores que iteran borradores localmente.
- Roleplay e interactivo: conversaciones de personaje de largo recorrido, aprovechando el contexto extendido para mantener continuidad narrativa.
- Razonamiento paso a paso offline: resolución de problemas de matemáticas y STEM con long-CoT en local, sin depender de APIs.
- Asistente de código en local: ejecución con Ollama o LM Studio para autocompletado y explicación de código en un portátil con GPU de consumo.
- Evaluación de cuantizaciones extremas: gracias a la amplia gama de quants (desde IQ1_S hasta Q6_K), es un buen banco de pruebas para medir degradación de calidad a 2-3 bits con imatrix.
- Procesamiento de documentos largos: si el contexto de 256k/1M se confirma en el runtime, permite resumir o analizar documentos extensos de una sola pasada.
- Experimentación multilingüe: soporte de chino, japonés, inglés y español para pruebas de generación en varios idiomas en entornos sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/disco estimada según cuantización (tamaño del archivo GGUF): de ~4,0 GB (i1-Q2_K) a ~7,7 GB (i1-Q6_K). Para carga completa en GPU, reserva además espacio para el KV cache, que crece significativamente con contextos de 256k.
- GPU recomendadas: cualquier GPU de consumo con 8 GB o más (RTX 3060, RTX 4060 Ti, RTX 4090) ejecuta cómodamente las cuantizaciones Q4_K_M y Q6_K. Con 4-6 GB de VRAM son viables las variantes IQ3 e IQ2 con descarga parcial a CPU.
- Consumer GPU: sí; el quant i1-Q4_K_M (5,9 GB) cabe íntegramente en una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB con margen para contexto.
- CPU puro: viable en equipos de 16 GB de RAM con las cuantizaciones de 4-5 GB, a velocidades de pocos tokens/s.
- Despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp (relevante para el caso de uso de roleplay) y cualquier runtime GGUF. Los archivos mmproj para visión están en el repo estático hermano.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-9B-Brainwaves-OneJev1.6 (este) | 9,2B | 256k-1M (tags) | Apache 2.0 | Fine-tuning experimental, foco en ficción y razonamiento, GGUF imatrix |
| Qwen3 8B (oficial) | 8,2B | 128k+ | Apache 2.0 | Modelo base oficial, benchmarks publicados, soporte thinking mode |
| Llama 3.1 8B Instruct | 8B | 128k | Llama 3.1 Community | Ecosistema maduro, buen soporte tool calling |

La comparación cuantitativa de rendimiento no está disponible, ya que el modelo base no publica benchmarks.

## Limitaciones y advertencias

- Modelo experimental: es un merge comunitario con LoRA y destilación, sin model card de entrenamiento detallada; el comportamiento puede ser impredecible fuera de los dominios para los que se ajustó.
- Riesgo de alucinación elevado en tareas factuales, algo habitual en modelos afinados intensivamente para escritura creativa y roleplay.
- La longitud de contexto de 256k/1M procede de tags y no está verificada en la documentación; los runtimes GGUF pueden imponer límites inferiores, y el consumo de KV cache a contextos extremos es muy alto.
- La afirmación de capacidades de visión requiere descargar los mmproj del repo estático y usar un runtime compatible; no funciona "out of the box" solo con los GGUF de este repo.
- Licencia Apache 2.0: sin restricciones para uso comercial, pero al derivar de destilación de un modelo propietario ("claude-distillation"), conviene revisar la política de uso del modelo profesor antes de un despliegue comercial.
- Sesgos: no documentados; al incluir datos de ficción y roleplay, puede generar contenido violento o sensible con más facilidad que un modelo alineado comercial.
- Las cuantizaciones por debajo de IQ3 degradan notablemente la calidad, especialmente en código y matemáticas.

## Enlaces

- Repo GGUF (imatrix): https://huggingface.co/mradermacher/Qwen3.5-9B-Brainwaves-OneJev1.6-i1-GGUF
- Repo GGUF estático (con mmproj): https://huggingface.co/mradermacher/Qwen3.5-9B-Brainwaves-OneJev1.6-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.5-9B-Brainwaves-OneJev1.6
- Página de descargas resumida: https://hf.tst.eu/model#Qwen3.5-9B-Brainwaves-OneJev1.6-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
