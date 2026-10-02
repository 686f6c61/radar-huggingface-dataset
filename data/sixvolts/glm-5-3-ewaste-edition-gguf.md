# SixVolts/GLM-5.3-ewaste-edition-GGUF

## Resumen

GLM-5.3 "e-waste edition" es una familia de cuantizaciones GGUF del modelo base `zai-org/GLM-5.3`, publicada por el usuario SixVolts. No es un modelo entrenado desde cero, sino una conversión optimizada del checkpoint FP8 original al formato GGUF de llama.cpp, con cuantización imatrix y orientada a ejecutarse en hardware antiguo: CPU con AVX2 sobre grandes pools de RAM del sistema, o GPUs de generaciones pasadas como AMD MI50 y MI100 (gfx908).

El modelo subyacente tiene aproximadamente 745-753 mil millones de parámetros totales (la metadata safetensors declara 753.329.940.480) con unos 40B activos por token, sobre una arquitectura `glm-dsa` de tipo Mixture-of-Experts. Según la documentación de Z.ai, GLM-5.3 comparte base con GLM-5.2 —todas las mejoras provienen del post-entrenamiento— y ofrece una ventana de contexto de 1M tokens con licencia MIT.

Su relevancia es doble. Por un lado, permite ejecutar un modelo de escala frontera cuantizado a 2-4 bits (entre 228.7 y 297.5 GiB en sus variantes intermedias) sobre hardware reciclado en lugar de clústeres H100. Por otro, es el único punto de entrada GGUF documentado públicamente para GLM-5.3 en el momento de la publicación, e incluye una cabeza MTP/NextN utilizable para decodificación especulativa en llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm-dsa: MoE estilo DeepSeek con 256 expertos enrutados + 1 experto compartido, 8 activos por token, atencion MLA con indice DSA (lightning indexer) |
| Parametros totales | 753.329.940.480 (~753B segun metadata safetensors; la model card indica 745B) |
| Parametros activos | ~40B |
| Longitud de contexto | 1M tokens en el modelo base GLM-5.3; configuracion concreta en GGUF no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0, IQ2_XXS, F32 (imatrix) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

Variantes publicadas:

| Variante | Tamano | Expertos enrutados | No expertos | Objetivo |
|---|---|---|---|---|
| GLM-5.3-Q4_K_XL | no disponible (TBD) | Q4_K | Q8_0 | Maxima calidad; equipos CPU con mucha RAM (~512 GB) |
| GLM-5.3-Q3_K_XL | 314.1 GiB | Q3_K | Q8_0 | Maxima calidad en GPU; expertos desbordan a CPU en <11x32 GB |
| GLM-5.3-Q3_K_M | 297.5 GiB | Q3_K + Q2_K (capas frias) | Q6_K | 0-spill en 10x32 GB (320 GB HBM) |
| GLM-5.3-Q2_K_XL | 228.7 GiB | Q2_K + IQ2_XXS (13 capas mas frias) | Q4_K | 0-spill en 8x32 GB; decodificacion mas rapida, menor calidad |
| GLM-5.3-MTP-Q3_K_M-sc | 7.2 GB | — | — | Cabeza borrador NextN/MTP autocontenida |

## Arquitectura y entrenamiento

La arquitectura `glm-dsa` es un transformer con Mixture-of-Experts de 256 expertos enrutados mas un experto compartido que se activa en cada token; se seleccionan 8 expertos enrutados por token. La atencion es de tipo MLA (Multi-head Latent Attention) y usa un "DSA lightning indexer" para el enrutado de atencion. El checkpoint original de GLM-5.3 se distribuye en FP8 e4m3 con escalas de bloque 128x128, donde las escalas son floats arbitrarios (según el autor, solo 194 de 95.040 en el primer shard son potencias de dos).

Esta edicion GGUF no entrena nada: es un proceso de conversion y cuantizacion. El autor convierte `fp8 x scale` en F32 (3.0 TB) para que el cuantizador `llama-quantize` vea exactamente el checkpoint de-dequantizado, en lugar de pasar por un intermedio BF16 que re-redondearia el 88% de los pesos. Respecto a la receta de GLM-5.2 del mismo autor, cambia tres cosas: usa F32 en vez de BF16 como intermedio, reduce el numero de tensores de 1.809 a 1.524 (el checkpoint solo lleva pesos del indexer DSA en las 22 capas con `indexer_types: full`, y el resto reutiliza la seleccion de la capa full previa), y hace utilizable la cabeza MTP (blk.78), cuyos expertos pasan a Q4_K.

Las cuantizaciones son imatrix, construidas con la matriz de importancia de unsloth para GLM-5.3 (209 chunks x 3584 tokens). La eleccion de K-quants en lugar de i-quants con codebook para los expertos enrutados responde a que, en CPUs pre-AVX-512 y GPUs de generacion anterior (MI100/gfx908), el cuello de botella de decodificacion no es el ancho de banda sino la de-descuantizacion de expertos. El corte "frio" se deriva de la matriz de importancia (`in_sum2`), que es monotonica en profundidad y abarca seis ordenes de magnitud: las 32 capas MoE mas frias (blk.3-34) toman Q2_K y la cola caliente (blk.35-77) se queda en Q3_K/Q4_K.

## Capacidades

- Generacion de texto conversacional y completado, con pipeline declarado de `text-generation`.
- Codigo: el modelo base GLM-5.3 es, según Z.ai, el modelo open-weights mas capaz para programacion, con una mejora del 50% sobre GLM-5.2 en su Z.ai Code Bench interno.
- Tareas de horizonte largo (long-horizon tasks), el foco declarado del release de GLM-5.3.
- Capacidad de razonamiento multi-paso y uso de herramientas heredada del modelo base (soporte de tool calling, `endpoints_compatible` aparece en los tags).
- Decodificacion especulativa mediante la cabeza MTP/NextN autocontenida (`--spec-type draft-mtp` en llama.cpp).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.

Nota: estas capacidades corresponden al modelo base GLM-5.3. La cuantizacion GGUF preserva el comportamiento del checkpoint hasta donde permite el nivel de bits elegido, pero no anade capacidades nuevas.

## Casos de uso

- Inferencia de un modelo frontera sobre hardware reciclado: la variante Q2_K_XL (228.7 GiB) cabe sin desbordamiento en 8 GPU de 32 GB, lo que permite servir GLM-5.3 en un nodo antiguo con muchas GPU o con CPU y grandes pools de RAM, en lugar de depender de H100.
- Programacion asistida en local: con las mejoras de codigo del base y la ventana de 1M tokens, se puede alimentar un repositorio completo como contexto para refactorizaciones o revisiones, ejecutando la cuantizacion Q3_K_M sobre 10x32 GB.
- Agentes de codigo de multiples pasos: el soporte de tool calling y la cabeza MTP para decodificacion especulativa permiten construir bucles de agente (edicion de ficheros, ejecucion de tests, correccion) con latencia de decodificacion reducida.
- Analisis forense y de seguridad: dado el interes documentado de terceros en las capacidades de hacking de GLM-5.3, un despliegue local cuantizado sirve para pruebas de seguridad en entornos aislados, sin enviar datos a APIs externas.
- Procesado de documentos muy largos: la ventana de 1M tokens del base permite resumir, extraer y consultar corpus extensos (expedientes, documentacion tecnica, logs) en una sola pasada.
- Investigacion academica sobre cuantizacion: los ficheros publican la composicion tensor a tensor por capa y las perplexidades medidas, lo que los hace utiles como material de estudio sobre el efecto de los distintos tipos de cuantizacion en modelos MoE.
- Despliegue interno con requisitos de licencia permisiva: la licencia MIT del base y de la cuantizacion facilita su integracion en productos comerciales sin las restricciones de otras licencias de modelos abiertos.
- Sustitucion de API en entornos con conectividad limitada: al ser completamente local y offline, encaja en escenarios donde no se puede depender de servicios externos.

## Benchmarks y rendimiento

Perplexity de las cuantizaciones, medida en wikitext-2 test, 100 chunks x 512 tokens, cache KV f16, `-fa off` (ruta DSA), ajustes identicos para todas:

| Cuant | Tamano | PPL (menor es mejor) | Contrapartida 5.2 (KV q8_0) |
|---|---|---|---|
| GLM-5.3-Q4_K_XL | no disponible | no disponible | 2.6733 |
| GLM-5.3-Q3_K_XL | 314.1 GiB | no disponible | 2.8176 |
| GLM-5.3-Q3_K_M | 297.5 GiB | 2.8092 ± 0.034 | 2.8348 |
| GLM-5.3-Q2_K_XL | 228.7 GiB | 3.6057 ± 0.047 | 3.6129 |

Datos declarados del modelo base GLM-5.3 (no especificos de estas cuantizaciones):
- Mejora del 50% sobre GLM-5.2 en Z.ai Code Bench (benchmark interno).
- SOTA open-source declarado en benchmarks publicos, incluido Terminal Bench 3.0.
- Segun Artificial Analysis: inteligencia 45 para GLM-5.3 (Max); velocidad de salida 69 t/s para GLM-5.3 (Low); latencia al primer token de 32.08 s para GLM-5.3 (Low).
- Medicion del autor sobre la cabeza MTP en MI100: el bloque MoE tarda 413 µs con q3_K y 253 µs con q4_K, con error RMS relativo de 0.30 (q2_K), 0.15 (q3_K), 0.072 (q4_K) y 0.036 (q5_K).

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar para estas cuantizaciones en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada por variante (equivalente al tamano del fichero mas overhead de contexto y cache KV): Q2_K_XL ~228.7 GiB, Q3_K_M ~297.5 GiB, Q3_K_XL ~314.1 GiB, Q4_K_XL no disponible (objetivo ~512 GB de RAM).
- Configuraciones objetivo segun el autor: 8x32 GB (256 GB HBM) para Q2_K_XL con 0-spill; 10x32 GB (320 GB HBM) para Q3_K_M con 0-spill; menos de 11x32 GB para Q3_K_XL con expertos desbordando a CPU.
- GPU recomendadas: AMD MI50 e MI100 (gfx908) son los objetivos explicitos del autor; el motivo es que en esas GPUs el cuello de botella es la de-descuantizacion de expertos, no el ancho de banda. Las GPU modernas (H100, A100) pueden ejecutar las variantes grandes, pero la receta no esta optimizada para ellas.
- CPU: despliegue sobre grandes pools de RAM del sistema con AVX2 o anterior; no requiere AVX-512.
- Cabe en GPU de consumo: no. Ni siquiera la variante mas pequena (228.7 GiB) cabe en una RTX 4090 (24 GB) ni en un solo equipo de consumo. La cabeza borrador MTP (7.2 GB) si cabria, pero es un componente auxiliar, no el modelo.
- Opciones de despliegue: llama.cpp (formato nativo GGUF, incluido `--spec-type draft-mtp` para la decodificacion especulativa). Otras opciones como vLLM, TGI u Ollama no estan mencionadas en la informacion disponible para estas cuantizaciones.
- Latencia y throughput: no disponibles para el modelo completo. Solo se publican las mediciones de la cabeza MTP en MI100 citadas arriba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/licencia | Notas |
|---|---|---|---|---|
| GLM-5.3 e-waste edition (Q3_K_M) | 745-753B totales / ~40B activos | 1M tokens (base) | GGUF, MIT | PPL 2.8092 en wikitext-2; orientado a hardware antiguo |
| GLM-5.2 e-waste edition (Q3_K_M) | mismo tamano | mismo | GGUF, MIT | Contrapartida directa; PPL 2.8348 con KV q8_0 |
| unsloth/GLM-5.3-GGUF | mismo tamano | mismo | GGUF, MIT | Fuente de la matriz de importancia usada por esta receta |
| Otros modelos MoE abiertos de escala similar | no disponible | no disponible | no disponible | No hay datos comparables en la informacion proporcionada |

La comparacion mas relevante es interna: la Q3_K_M de GLM-5.3 mejora ligeramente la perplexidad de su equivalente de GLM-5.2 (2.8092 frente a 2.8348) manteniendo un tamano practicamente identico. No se dispone de comparativas con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo nuevo: hereda todos los sesgos, limitaciones y riesgos del base `zai-org/GLM-5.3`.
- La cuantizacion a 2-4 bits degrada la calidad. La Q2_K_XL sube la perplexidad a 3.6057 ± 0.047, un 28% por encima de la Q3_K_M (2.8092), con expertos IQ2_XXS en 13 capas; no es recomendable para tareas que exijan precision.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero es un riesgo inherente a los modelos generativos de esta escala.
- Requisitos de hardware muy elevados: entre 228.7 y 314.1 GiB solo para pesos, mas cache KV. Esto excluye cualquier GPU de consumo y exige nodos multi-GPU o pools grandes de RAM.
- Idiomas soportados: no disponible. No se puede confirmar un rendimiento multilingue fiable sin datos.
- Restricciones de licencia: la licencia MIT es permisiva y permite uso comercial, pero conviene verificar que se aplica tanto a la cuantizacion como al modelo base.
- Caveats tecnicos de produccion: el rendimiento declarado se midio con `-fa off` (ruta DSA) y cache KV f16, ajustes que pueden diferir de un despliegue real. Las variantes Q4_K_XL y Q3_K_XL tienen tamano y perplexidad aun sin publicar. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria de la receta.
- El autor denomina esta edicion optimizada para "e-waste" (hardware obsoleto); el soporte y las optimizaciones estan pensados para MI50/MI100 y CPU AVX2, no para aceleradores modernos.

## Enlaces

- HuggingFace (esta cuantizacion): https://huggingface.co/SixVolts/GLM-5.3-ewaste-edition-GGUF
- GLM-5.2 e-waste edition (receta predecesora): https://huggingface.co/SixVolts/GLM-5.2-ewaste-edition-GGUF
- Matriz de importancia de unsloth: https://huggingface.co/unsloth/GLM-5.3-GGUF
- Pagina oficial de GLM-5.3: https://openlm.ai/glm-5.3/
- Repositorio GitHub de la familia GLM-5: https://github.com/zai-org/GLM-5
- Ficha de release en Artificial Analysis: https://artificialanalysis.ai/models/releases/glm-5-3
- Articulo sobre capacidades de seguridad de GLM-5.3: https://www.notebookcheck.net/GLM-5-3-China-s-open-AI-model-built-a-Chrome-exploit-for-20.1413141.0.html
