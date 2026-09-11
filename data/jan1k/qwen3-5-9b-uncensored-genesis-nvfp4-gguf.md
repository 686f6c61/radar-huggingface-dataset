# jan1k/Qwen3.5-9B-Uncensored-Genesis-NVFP4-GGUF

## Resumen

Qwen3.5-9B-Uncensored-Genesis-NVFP4-GGUF es una publicación de cuantización realizada por el usuario jan1k sobre el modelo HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive, un modelo denso de 8.953.803.752 parámetros (aproximadamente 9B) con arquitectura híbrida de SSM (DeltaNet / Gated Linear Attention) combinada con atención completa, contexto nativo de 262.144 tokens y soporte multimodal de visión mediante un proyector aparte.

El aporte específico de este repositorio es doble: por un lado, aplica el algoritmo de calibración y reparación tensorial Genesis desarrollado por LuffyTheFox (cirugía numérica sobre los bytes del fichero GGUF, sin reentrenamiento); por otro, cuantiza el resultado en NVFP4, el formato de coma flotante de 4 bits de NVIDIA, con el objetivo de reducir el peso del modelo de 17,92 GB (BF16) a 4,90 GB manteniendo la mayor fidelidad posible.

Es relevante ahora porque combina tres tendencias: cuantizaciones de 4 bits con calibración por matriz de importancia (imatrix) para minimizar la degradación de perplejidad, formatos FP4 pensados para el hardware Blackwell y posteriores, y modelos derivados "uncensored" de la familia Qwen. El autor publica además tres variantes con distinta calibración (v1, v2-imx-v5 y v2-imx-v6), con la recomendación explícita de usar v2-imx-v5 para obtener la menor perplejidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: SSM (DeltaNet / Gated Linear Attention) + atención completa |
| Parámetros totales | 8.953.803.752 (aproximadamente 9B) |
| Parámetros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 262.144 tokens nativos (262K); el ejemplo de despliegue usa 131.072 tokens |
| Tipos de cuantización | NVFP4 (FP4 de NVIDIA, GGUF, 4,70 BPW); referencia BF16 de 16 bits; proyector multimodal en BF16 |
| Idiomas soportados | Inglés y multilingüe (según las etiquetas del repositorio; el listado completo de idiomas no está disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (variantes NVFP4 para el modelo y GGUF BF16 para el mmproj) |
| Tamaño de fichero | 4,90 GB por variante NVFP4; 17,92 GB la referencia BF16 |
| Tamaño del repositorio | 16,7 GB |
| Pipeline declarado | image-text-to-text (multimodal, texto e imagen) |
| Modelo base | HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive (relación: quantized) |
| Calibración | Importance matrix (imatrix) en las variantes v2-imx-v5 y v2-imx-v6 |
| Plataformas compatibles | Kernels CUDA NVFP4 de llama.cpp en NVIDIA Blackwell, Ada Lovelace y Ampere |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer denso que combina capas de espacio de estados (SSM) del tipo DeltaNet / Gated Linear Attention con capas de atención completa. Este diseño híbrido es habitual en modelos de contexto muy largo porque las capas recurrentes lineales reducen el coste de memoria de las claves y valores, mientras que las capas de atención completa conservan la capacidad de recuperación exacta sobre el contexto. El modelo declara 262.144 tokens de ventana nativa y aproximadamente 9B de parámetros en un único bloque denso (sin expertos), lo que simplifica el despliegue respecto a variantes MoE.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base pasó por RLHF, DPO u otro tipo de alineamiento. El autor de la cuantización tampoco documenta el pipeline de entrenamiento original. Lo que sí se documenta es la intervención posterior denominada Genesis, una reparación tensorial que opera sobre los bytes del GGUF sin reentrenar: una primera etapa analiza los tensores `ssm_conv1d` (memoria de contexto largo) y reequilibra las cabezas; una segunda etapa recorre bloques por fragmentos y sustituye bloques nulos por el mejor ajuste a la distribución de pesos del tensor; y una tercera etapa aplica un SVD personalizado (excluyendo `token_embd.weight`, `output.weight`, tensores 1D, sesgos y normalizaciones) que reduce el ruido de entrenamiento siguiendo la ley de Marchenko–Pastur, preservando según el autor el 99% de la señal. La cuantización NVFP4 se aplicó después, con calibración imatrix en las revisiones v2.

## Capacidades

- Generación de texto conversacional en inglés y otros idiomas (etiqueta multilingüe), con plantilla de chat propia (`chat_template.jinja`) y compatibilidad con el formato de razonamiento deepseek.
- Modo de razonamiento explícito (thinking) activable mediante `--reasoning on`, con control de esfuerzo (`--reasoning-effort high`) y preservación del bloque de razonamiento (`--reasoning-preserve`).
- Generación de código y tareas de precisión: el autor recomienda un perfil específico (temperatura 0,6; top-k 20; top-p y min-p desactivados) para código y tareas exactas.
- Capacidades multimodales de visión (image-text-to-text) al cargar el proyector `mmproj-Qwen3.5-9B-Uncensored-Genesis-BF16.gguf`.
- Conversación multi-turno con contexto largo, hasta 262.144 tokens nativos, adecuada para documentos extensos o historiales largos.
- Escritura creativa y roleplay (perfil con temperatura 1,0 y thinking desactivado).
- Compatibilidad declarada con endpoints (`endpoints_compatible`) en el ecosistema de llama.cpp.
- No hay información disponible sobre soporte de tool calling / function calling, uso de agentes multi-paso, audio u otras modalidades más allá de la visión.

## Casos de uso

- Asistente de atención al cliente multi-turno: con 262K tokens de contexto nativo, el modelo puede mantener un historial extenso o incorporar manuales de producto completos sin truncar. Su tamaño de 4,90 GB permite ejecutar varias instancias en paralelo en una sola GPU.
- Generación de código en producción: el perfil recomendado para código (temperatura 0,6, top-k 20, top-p y min-p desactivados) y el modo thinking permiten usarlo como asistente de programación o como generador de parches dentro de pipelines automatizados, siempre que se valide la salida con tests.
- Análisis de documentos con imagen: al cargar el proyector multimodal se pueden procesar capturas de pantalla, diagramas o documentos escaneados junto a instrucciones en texto, por ejemplo para extraer datos de facturas o resumir informes con gráficos.
- Agentes de investigación y resumen sobre corpus largos: el contexto de 262K permite alimentar artículos, expedientes o bases de documentación completas y pedir síntesis con referencias al texto original.
- Despliegue en hardware de gama media: con 4,90 GB de pesos, el modelo cabe en GPUs de consumo con 8 GB o más de VRAM (limitando el contexto), lo que habilita prototipos locales y entornos sin conectividad.
- Generación creativa y roleplay sin filtros: el perfil con temperatura 1,0 y thinking desactivado está pensado para escritura narrativa y diálogos donde el modelo base "uncensored" evita rechazos.
- Estudio de cuantización: la tabla de perplejidad publicada convierte este repositorio en un caso de referencia para comparar el impacto de NVFP4 con y sin calibración imatrix frente al BF16 original.
- RAG sobre documentación técnica: el contexto largo y el formato GGUF permiten integrarlo en servidores llama.cpp junto a un índice vectorial, pasando al modelo los fragmentos recuperados sin recortes agresivos.

## Benchmarks y rendimiento

El autor publica una única evaluación: perplejidad sobre wikitext-2 medida con `llama-perplexity` en una RTX 5090 (kernel CUDA NVFP4 nativo, `flash_attn on`, wikitext-2 raw train, 256 chunks, `n_ctx=512`, `batch_size=2048`).

| Variante | Tamaño | BPW | Perplejidad (PPL) | Δ PPL vs BF16 | Tiempo por pasada | Tiempo total |
|---|---|---|---|---|---|---|
| BF16 (referencia original) | 17,92 GB | 16,00 | 9,1951 ± 0,098 | línea base | ~0,62 s | ~39,4 s |
| NVFP4-v2-imx-v5 (recomendada) | 4,90 GB | 4,70 | 9,5154 ± 0,100 | +0,320 (+3,48%) | ~0,46 s | ~31,4 s |
| NVFP4-v2-imx-v6 | 4,90 GB | 4,70 | 9,5241 ± 0,100 | +0,329 (+3,58%) | ~0,41 s | ~29,0 s |
| NVFP4 v1 (línea base) | 4,90 GB | 4,70 | 9,8704 ± 0,105 | +0,675 (+7,34%) | ~0,41 s | ~28,8 s |

Conclusiones declaradas por el autor: la calibración por matriz de importancia reduce a la mitad la degradación por cuantización (+0,320 frente a +0,675 de Δ PPL), el ahorro de VRAM es del 72,7% (de 17,92 GB a 4,90 GB) y la variante recomendada es `Qwen3.5-9B-Uncensored-Genesis-NVFP4-v2-imx-v5.gguf`.

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. Tampoco se publica throughput en tokens por segundo; los tiempos de pasada anteriores corresponden a un total de 256 fragmentos de 512 tokens, de los que se podría derivar un orden de magnitud de preprocesado en torno a 4.000 tokens/s para la variante v2-imx-v5, pero es una estimación derivada, no un dato medido y publicado como tal.

## Requisitos de hardware

- VRAM estimada para inferencia: 4,90 GB de pesos en NVFP4, más el espacio de caché KV. El autor no publica el consumo total de VRAM ni el coste de la caché KV por token, por lo que este dato no está disponible.
- GPU recomendadas: NVIDIA Blackwell (serie RTX 50, B200), Ada Lovelace y Ampere, ya que el formato NVFP4 se ejecuta mediante los kernels CUDA NVFP4 de llama.cpp. La medición publicada se hizo en una RTX 5090.
- Cabe en GPU de consumo: sí, con 4,90 GB de pesos es viable en GPUs consumer con 8 GB o más de VRAM si se ajusta el tamaño de contexto; en GPUs con 24 GB (RTX 4090, 3090) permite contextos mucho mayores y varias instancias en paralelo.
- CPU, Apple Silicon y GPUs sin soporte de kernels NVFP4: no hay información disponible sobre el rendimiento en esas plataformas; el formato NVFP4 está orientado a CUDA.
- Opciones de despliegue: `llama-server` / `llama.cpp` con `--n-gpu-layers all`, `--flash-attn on` y caché K/V en `f16`; la medición de perplejidad usó `llama-perplexity`. El repositorio incluye la etiqueta `endpoints_compatible`. No hay información disponible sobre soporte en vLLM, TGI, Ollama u otros motores.
- Configuración de contexto y rendimiento: el ejemplo recomendado usa `--ctx-size 131072`, `--batch-size 2048`, `--ubatch-size 512` y `--parallel 1`.
- Latencia y throughput: no publicados en tokens por segundo. Los tiempos medidos por pasada en la evaluación de perplejidad fueron de ~0,46 s (v2-imx-v5), ~0,41 s (v2-imx-v6 y v1) y ~0,62 s (BF16) para cada uno de los 256 fragmentos.

## Comparativa con modelos similares

La información disponible solo permite comparar las propias variantes de cuantización del repositorio. No hay datos publicados de modelos alternativos de tamaño similar.

| Variante | Tamaño | Precisión / BPW | PPL (wikitext-2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVFP4-v2-imx-v5 | 4,90 GB | NVFP4, 4,70 BPW | 9,5154 | Apache-2.0 | Incluida en el repositorio |
| NVFP4-v2-imx-v6 | 4,90 GB | NVFP4, 4,70 BPW | 9,5241 | Apache-2.0 | Incluida en el repositorio |
| NVFP4 v1 | 4,90 GB | NVFP4, 4,70 BPW | 9,8704 | Apache-2.0 | Incluida en el repositorio |
| BF16 (base HauhauCS) | 17,92 GB | BF16, 16,00 BPW | 9,1951 | No disponible en la información proporcionada | Modelo base en HuggingFace |
| Otras cuantizaciones GGUF (Q4_K_M, Q5_K_M, etc.) del mismo modelo | No disponible | No disponible | No disponible | Apache-2.0 (modelo base) | No disponible |
| Modelos densos de ~9B de otros autores (por ejemplo, la familia Qwen 3 o Llama 3.1 8B) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo "uncensored": procede de una variante sin censura del modelo base, por lo que no incorpora filtros de contenido y puede generar material ofensivo, ilegal o inseguro. No es adecuado para aplicaciones orientadas al público sin una capa de moderación adicional.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de tareas de razonamiento; la única métrica disponible es la perplejidad, que no mide corrección factual.
- Degradación por cuantización: la variante recomendada pierde un 3,48% de perplejidad respecto al BF16 original (9,5154 frente a 9,1951). En tareas sensibles a la precisión numérica el impacto puede ser mayor que el sugerido por esa cifra.
- Intervención Genesis sin reentrenamiento: la reparación modifica los pesos a nivel de bytes (bloques nulos, SVD por Marchenko–Pastur). No hay evaluaciones independientes del efecto de esta cirugía sobre el comportamiento del modelo más allá de la perplejidad.
- Ajustes de muestreo atípicos: el autor recomienda desactivar Top P y Min P (top-p 1,0 y min-p 0,0) en código y tareas precisas, debido a la estabilización por SVD. Muchos frameworks y presets asumen valores distintos, lo que puede degradar la calidad si no se respeta la configuración.
- Dependencia de hardware: NVFP4 requiere kernels CUDA específicos (Blackwell, Ada Lovelace, Ampere). No hay información sobre funcionamiento en CPU, Apple Silicon o GPUs sin ese soporte.
- Idiomas: el repositorio declara inglés y multilingüe, sin detallar el conjunto de idiomas ni su calidad relativa; se desconoce el rendimiento real en castellano.
- Documentación del modelo base ausente: no se especifican tokens de entrenamiento, composición del dataset, ni método de alineamiento, por lo que los sesgos heredados son desconocidos.
- Validación comunitaria mínima: en el momento de la consulta el repositorio registra 0 descargas y 0 likes, y el repositorio se creó el 11 de septiembre de 2026, por lo que no existe un historial de uso que respalde su estabilidad en producción.
- Visión dependiente del proyector: sin cargar `mmproj-Qwen3.5-9B-Uncensored-Genesis-BF16.gguf` el modelo no procesa imágenes.
- Licencia: el repositorio se publica como Apache-2.0, pero conviene verificar las condiciones del modelo base HauhauCS antes de un uso comercial, ya que no se detallan en la información disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jan1k/Qwen3.5-9B-Uncensored-Genesis-NVFP4-GGUF
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Perfil del autor del algoritmo Genesis (LuffyTheFox): https://huggingface.co/LuffyTheFox
- Ley de Marchenko–Pastur (referencia del SVD de reducción de ruido): https://en.wikipedia.org/wiki/Marchenko%E2%80%93Pastur_distribution
- No se han encontrado en la búsqueda web enlaces adicionales relevantes sobre este modelo: los resultados devueltos corresponden a contenidos sobre SharePoint y no guardan relación con la ficha.
