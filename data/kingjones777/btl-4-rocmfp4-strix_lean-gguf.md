# kingjones777/BTL-4-ROCmFP4-STRIX_LEAN-GGUF

## Resumen

BTL-4-ROCmFP4-STRIX_LEAN-GGUF es una cuantización de tipo GGUF del modelo `badtheorylabs/BTL-4`, publicada por el usuario `kingjones777`. No se trata de un modelo entrenado desde cero, sino de un artefacto de cuantización orientado a hardware concreto: la APU AMD Ryzen AI Max+ 395 (arquitectura Strix Halo, gfx1151) con memoria unificada. El objetivo declarado es ofrecer el modelo base de 70,2 GB en bf16 dentro de un fichero de 17,32 GiB, es decir, unos 4,29 bits por peso reales, manteniendo una calidad comparable a una cuantización Q4_K_M convencional pero con menor tamaño en disco y mayor velocidad de decodificación.

El modelo base es un Mixture-of-Experts multimodal de la familia `Qwen3_5MoeForConditionalGeneration`, con 40 capas, 256 expertos (8 activos por token), dimensión oculta 2048 y vocabulario de 248.320 tokens. Según el recuento de safetensors del repositorio, el modelo tiene 34.660.610.688 parámetros totales, lo que corresponde al tamaño de pesos en bf16 indicado por el autor. Incluye un proyector multimodal (`mmproj`) necesario para entrada de imagen, aunque la propia model card advierte de que la build medida con el motor Super Roc no soporta visión.

Su relevancia es fundamentalmente práctica: demuestra que es posible ejecutar un MoE multimodal de este tamaño en una APU de consumo profesional con memoria unificada, siempre que se use un fork específico de llama.cpp (ROCmFPX) que implementa los tipos de tensor ROCmFP4 (ggml 100–106). Es un artefacto de nicho, con una comunidad muy pequeña (83 descargas en el momento de la consulta) y sin licencia declarada explícitamente en el repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (`Qwen3_5MoeForConditionalGeneration`), 40 capas, 256 expertos / 8 activos, hidden 2048, vocab 248320 |
| Parámetros totales | 34.660.610.688 (34,66 B) |
| Parámetros activos | no disponible (8 de 256 expertos por token, sin cifra agregada publicada) |
| Longitud de contexto | 131.072 tokens cargados en la medición con Super Roc; 32.768 tokens en el ejemplo de llama-server |
| Tipos de cuantización | ROCmFP4 (ggml types 100–106), variante `Q4_0_ROCMFP4_STRIX_LEAN`, 4,29 BPW reales; existe build hermana `STRIX` a 4,31 BPW |
| Idiomas soportados | no disponible |
| Licencia | no disponible (hereda la del modelo base `badtheorylabs/BTL-4`, no especificada) |
| Formato de pesos | GGUF (con `mmproj-BTL-4-f16.gguf` para entrada de imagen) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer con mezcla de expertos (MoE) y capacidad multimodal de tipo image-text-to-text. Los detalles publicados en la model card se limitan a la topología: 40 capas, 256 expertos con 8 activos por token, dimensión oculta 2048 y vocabulario de 248.320 entradas. El pipeline declarado es `image-text-to-text`, e incluye un proyector multimodal separado (`mmproj`) en precisión f16 que debe cargarse junto al modelo principal para procesar imágenes.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otras técnicas de alineación. Tampoco se documenta ninguna innovación técnica propia del modelo base más allá de su condición de MoE multimodal. Lo que sí está documentado es el trabajo de cuantización: el formato ROCmFP4 proviene del fork ROCmFPX de llama.cpp, mantenido por `charlie12345`, que añade tipos de tensor específicos para GPUs AMD con ROCm. La build `STRIX_LEAN` consigue 4,29 BPW reales frente a los 4,88 BPW reales de una Q4_K_M convencional, con una reducción del 12 % en disco y un 12 % más de velocidad de decodificación según las mediciones del autor. Un detalle técnico relevante: el modelo base declara `mtp_num_hidden_layers: 0`, es decir, no incluye tensores MTP, por lo que la decodificación especulativa no está disponible y activarla produce salidas corruptas.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `image-text-to-text` y etiqueta `conversational`.
- Procesamiento de imagen en el modelo base mediante el `mmproj` incluido; la model card advierte de que la build medida con Super Roc no soporta visión, por lo que la capacidad depende del runtime empleado.
- Razonamiento con modo "thinking" conmutable: en Super Roc se desactiva por defecto y se activa por petición mediante `chat_template_kwargs.enable_thinking`.
- Tool calling / function calling: la medición reporta 7/8 en modo requerido y 7/8 en modo automático sobre el conjunto de prueba del autor.
- Soporte de plantilla de chat Jinja (`--jinja`), necesaria para el formateo correcto de conversaciones y herramientas.
- Caché de prompt eficaz: en la segunda vuelta de una conversación se reutilizaron 6.962 de 6.986 tokens de prompt.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local en estación de trabajo con APU Strix Halo: el modelo cabe en los 124–128 GB de memoria unificada del Ryzen AI Max+ 395 y ofrece 77 tok/s de generación con contexto de 1k, suficiente para uso interactivo sin depender de la nube.
- Procesamiento de documentos largos: con 131.072 tokens de contexto cargados y una caché de prompt que reutiliza prácticamente todo el prefijo en la segunda vuelta, es adecuado para resumir o consultar expedientes extensos manteniendo el contexto entre turnos.
- Automatización con herramientas: la tasa de acierto en tool calling (7/8 en modo requerido y automático) permite integrarlo en flujos donde el modelo debe invocar funciones externas, como consultas a bases de datos o APIs internas.
- Generación de código en local: la medición reporta 77,3 tok/s de media en dos prompts de código, un rendimiento suficiente para autocompletado y generación de fragmentos en entornos con requisitos de privacidad.
- Prototipado de pipelines multimodales: aunque la build medida con Super Roc no soporta visión, el repositorio incluye el `mmproj` y el pipeline declarado es image-text-to-text, por lo que sirve como base para experimentar con entrada de imagen en runtimes ROCmFP4 compatibles.
- Despliegue en hardware AMD sin CUDA: al estar construido sobre ROCm (7.2.4 en gfx1151) y requerir un fork específico de llama.cpp, cubre el hueco de quienes trabajan exclusivamente con GPUs/APUs AMD y no pueden usar builds estándar de CUDA.
- Evaluación comparativa de cuantizaciones: la documentación incluye tablas de BPW reales y comparaciones con Q4_K_M, lo que lo convierte en un artefacto útil para estudiar el impacto de formatos de cuantización agresivos en modelos MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos publicados son mediciones de sistema en hardware concreto:

| Métrica | Valor | Condiciones |
|---|---|---|
| Tamaño del fichero | 18.597.336.928 B (17,32 GiB) | Build `Q4_0_ROCMFP4_STRIX_LEAN` |
| BPW reales | 4,29 | Frente a 4,88 de Q4_K_M |
| Velocidad de decodificación | +12 % vs. Q4_K_M | Baseline ejecutado dos veces, Δ=0 entre pasadas |
| Calidad subjetiva | 9/10 | Frente a 8/10 de Q4_K_M, decodificación greedy |
| Carga del modelo | 20 s | Super Roc 0.20.0 |
| Prompt tok/s (p1k) | 1.841,2 | Ryzen AI Max+ 395, 128 GB |
| Prompt tok/s (p8k) | 1.870,3 | Ryzen AI Max+ 395, 128 GB |
| Generación tok/s (p1k) | 77,21 | Ryzen AI Max+ 395, 128 GB |
| Generación tok/s (p8k) | 70,14 | Ryzen AI Max+ 395, 128 GB |
| Generación de código tok/s | 77,3 | Media de 2 prompts |
| Tool calls (requerido / auto) | 7/8 / 7/8 | Conjunto de prueba del autor |

La build hermana `STRIX` (4,31 BPW, 17,39 GiB) fue medida de forma independiente en una segunda máquina con +11,4 % sobre Q4_K_M y calidad 10/10 frente a 10/10. El autor señala que, para trabajo crítico de calidad, la literatura previa sobre esta familia de arquitecturas favorece la variante `STRIX` sin `LEAN`.

## Requisitos de hardware

- VRAM/memoria estimada: el fichero principal ocupa 17,32 GiB, más el `mmproj` en f16; con contexto de 131.072 tokens y caché KV el consumo total se acerca a los 124–128 GB de memoria unificada del equipo de referencia.
- Hardware objetivo: AMD Ryzen AI Max+ 395 (Strix Halo, gfx1151, Radeon 8060S) con 124–128 GB de memoria unificada. Requiere ROCm 7.2.4 o compatible.
- GPUs discretas: no hay datos publicados sobre ejecución en A100, H100 o RTX 4090; el formato ROCmFP4 depende de ROCm y del fork ROCmFPX, por lo que no es portable a CUDA sin reconversión.
- GPU de consumo: no cabe en GPUs de consumo con 24 GB o menos; el modelo completo exige memoria unificada de gran capacidad o varias GPUs.
- Opciones de despliegue: llama-server del fork ROCmFPX (build con soporte de tipos ROCmFP4), o Super Roc 0.20.0 para Strix Halo. Una build estándar de llama.cpp no cargará estos tipos de tensor.
- Variables de entorno necesarias: `HSA_OVERRIDE_GFX_VERSION=11.5.1` y `GGML_HIP_ENABLE_UNIFIED_MEMORY=1`.
- Throughput medido: 1.841–1.870 tok/s de prompt y 70–77 tok/s de generación según longitud de contexto, con una sola petición en paralelo (`--parallel 1`).
- Advertencia de decodificación especulativa: no pasar flags de speculative/MTP; el modelo carga y reporta READY pero genera basura.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BTL-4-ROCmFP4-STRIX_LEAN (este) | 34,66 B totales, MoE 256/8 | 131.072 tokens (medido) | ROCmFP4 4,29 BPW, 17,32 GiB | no disponible | Hugging Face, 83 descargas |
| BTL-4-ROCmFP4-STRIX | 34,66 B totales, MoE 256/8 | no disponible | ROCmFP4 4,31 BPW, 17,39 GiB | no disponible | Hugging Face, 77 descargas |
| BTL-4 Q4_K_M (control) | 34,66 B totales, MoE 256/8 | no disponible | GGUF Q4_K_M, 4,88 BPW, 19,71 GiB | no disponible | Referencia interna del autor |
| badtheorylabs/BTL-4 (base) | 34,66 B totales, MoE 256/8 | no disponible | bf16, 70,2 GB | no disponible | Hugging Face |

No se dispone de comparaciones con modelos de otros autores de la misma categoría (MoE multimodal de ~35 B) en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio indica que hereda la licencia del modelo base, pero esta no se especifica. No hay garantía documentada para uso comercial; es imprescindible verificar la licencia de `badtheorylabs/BTL-4` antes de cualquier despliegue en producción.
- Dependencia de un fork: los tipos de tensor ROCmFP4 solo existen en ROCmFPX. Una build estándar de llama.cpp no cargará el modelo, lo que limita la portabilidad y añade riesgo de mantenimiento.
- Sin decodificación especulativa: el modelo base no incluye tensores MTP (`mtp_num_hidden_layers: 0`). Activar flags de speculative decoding produce salidas corruptas sin error visible.
- Visión no verificada en la build medida: aunque el `mmproj` está incluido y el pipeline declarado es image-text-to-text, la medición con Super Roc reporta "Vision: unsupported by this build". La capacidad multimodal depende del runtime.
- BPW anunciado poco fiable: el autor documenta que un Q3 con 3,50 BPW anunciados resulta en 4,45 BPW reales, más grande que esta build. Es obligatorio ejecutar `--dry-run` y leer el BPW real.
- Idiomas no documentados: no hay información sobre cobertura lingüística ni calidad por idioma.
- Riesgo de alucinación: no cuantificado; no se han publicado evaluaciones de fidelidad ni de sesgos.
- Comunidad muy reducida: 83 descargas y 0 likes en el momento de la consulta, sin validación independiente de las mediciones del autor.
- Rendimiento medido en una única configuración de hardware (Ryzen AI Max+ 395, 128 GB, Super Roc 0.20.0 release candidate), por lo que las cifras no son extrapolables a otros equipos.
- Paralelismo limitado: la configuración de referencia usa `--parallel 1`; no hay datos de throughput con concurrencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/BTL-4-ROCmFP4-STRIX_LEAN-GGUF
- Build hermana STRIX: https://huggingface.co/kingjones777/BTL-4-Q4_0_ROCMFP4_STRIX-GGUF
- Modelo base: https://huggingface.co/badtheorylabs/BTL-4
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- llama.cpp upstream: https://github.com/ggml-org/llama.cpp
- AMD ROCm: https://github.com/ROCm/ROCm
- Motor Super Roc: https://github.com/kingjones30/superroc
