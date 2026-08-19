# kingjones777/Qwen3.5-4B-ROCmFP4-GGUF

## Resumen

`kingjones777/Qwen3.5-4B-ROCmFP4-GGUF` es la primera cuantización en formato GGUF con los formatos ROCmFP4 y ROCmFPX del modelo multimodal `Qwen/Qwen3.5-4B`, desarrollada por el autor independiente kingjones777. El modelo base, Qwen3.5-4B, es un transformer denso de 4.205 millones de parámetros con capacidad imagen-texto-a-texto y una ventana de contexto nativa de 262.144 tokens, licenciado bajo Apache 2.0. Esta cuantización está específicamente optimizada para hardware AMD Strix Halo (gfx1151), como el Ryzen AI MAX+ 395 con 128 GB de memoria unificada, y requiere un build de llama.cpp con soporte ROCmFPX para poder cargarse.

La relevancia de este modelo radica en que permite ejecutar un LLM multimodal de 4B con velocidades de decodificación muy altas (hasta 55.57 tokens/s en la variante Q4_0) en hardware AMD de gama alta, algo que no era posible con las cuantizaciones GGUF estándar de llama.cpp. El repositorio incluye cuatro variantes cuantizadas (Q4_0, Q6_0, Q8_0 y una variante AGENT) más un proyector multimodal en BF16, todas verificadas individualmente en hardware real. No obstante, estos archivos no son compatibles con llama.cpp estándar, Ollama ni LM Studio, lo que limita su uso a entornos con el fork ROCmFPX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text), sin MoE |
| Parametros totales | 4.205.751.296 (4.2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo, segun LM Studio); pruebas con `-c 4096` |
| Tipos de cuantizacion | ROCmFP4 (Q4_0), ROCmFPX (Q6_0, Q8_0), variantes AGENT |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (4 archivos: Q4_0, Q6_0_AGENT, Q8_0, Q8_0_AGENT) + mmproj-BF16.gguf |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.5-4B` es un transformer denso multimodal que procesa tanto texto como imagenes mediante un proyector de vision (incluido como `mmproj-BF16.gguf`). Pertenece a la familia Qwen3.5, que segun la documentacion oficial integra avances en aprendizaje multimodal, eficiencia arquitectonica y RL a escala, aunque no se proporcionan detalles especificos sobre el dataset de entrenamiento ni el numero de tokens utilizados. El modelo tiene embeddings atados, es decir, no existe un tensor `output.weight` separado, lo que implica que la cuantizacion del head se controla exclusivamente mediante el flag `--token-embedding-type`.

La cuantizacion fue realizada con el fork ROCmFPX de llama.cpp, que implementa los formatos de punto flotante ROCmFP4 y ROCmFPX optimizados para la arquitectura RDNA 3.5 (gfx1151) de AMD. No se incluye ningun drafter MTP o EAGLE, por lo que la decodificacion especulativa no esta disponible y las velocidades medidas representan el rendimiento maximo alcanzable con este modelo.

## Capacidades

- Generacion de texto y razonamiento: al ser una cuantizacion del Qwen3.5-4B, hereda las capacidades de generacion de texto, razonamiento y conversacion del modelo base.
- Multimodal: soporta entrada de imagenes ademas de texto (pipeline image-text-to-text), mediante el proyector `mmproj-BF16.gguf` incluido en el repositorio. Requiere desactivar flash attention (`-fa off`) para la entrada de imagenes.
- Tool calling / function calling: no confirmado explicitamente en la informacion disponible, aunque la familia Qwen3.5 generalmente lo soporta.
- Capacidades multilingues: no especificadas en la documentacion del repositorio.
- Modo thinking: no se menciona un modo de razonamiento explicito en esta cuantizacion.
- Rendimiento de inferencia: velocidades de decodificacion de 36.92 a 55.57 tokens/s en hardware Strix Halo, con correctness verificada (3/3) en todas las variantes.

## Casos de uso

- Asistente personal en dispositivo: gracias a su tamano compacto (2.37 GiB en Q4_0) y su alta velocidad de decodificacion (55.57 t/s), puede ejecutarse como asistente conversacional en tiempo real en equipos con AMD Strix Halo, sin necesidad de conexion a internet.
- Analisis de documentos con imagenes: al ser multimodal, permite procesar capturas de pantalla, diagramas o fotografias junto con texto, por ejemplo para extraer informacion de facturas o formularios escaneados en local.
- Prototipado y desarrollo de aplicaciones RAG: su contexto nativo de 262K tokens permite indexar y consultar documentos largos en aplicaciones de recuperacion aumentada, manteniendo toda la conversacion en memoria.
- Educacion y formacion: puede servir como tutor interactivo que explica conceptos con apoyo visual (imagenes de diagramas o ecuaciones) en entornos educativos sin conexion.
- Investigacion en cuantizacion para AMD: este repositorio sirve como referencia para desarrolladores que quieran evaluar el impacto de ROCmFP4/ROCmFPX en la calidad y velocidad de modelos multimodales en hardware RDNA 3.5.
- Despliegue en edge computing: para sistemas embebidos basados en AMD Strix Halo (por ejemplo, estaciones de trabajo portatiles o mini PCs), este modelo ofrece una solucion de IA generativa multimodal con requisitos de memoria moderados.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks academicos (MMLU, HumanEval, GSM8K, etc.). En su lugar, proporciona mediciones de velocidad de decodificacion y verificacion de correccion en hardware real (Ryzen AI MAX+ 395, gfx1151, 128 GB unificados, con `-ngl 999 -c 4096 -fa on -fit off`, 300 tokens, warm-up descartado, mediana de 3 ejecuciones):

| Variante | Tamano | Velocidad de decodificacion (mediana) | Correctness |
|---|---|---|---|
| Q4_0_ROCMFP4_COHERENT (ftype 102) | 2.37 GiB | 55.57 t/s | 3/3 |
| Q6_0_ROCMFPX_AGENT (ftype 114) | 3.67 GiB | 37.13 t/s | 3/3 |
| Q8_0_ROCMFPX (ftype 111) | 4.07 GiB | 37.25 t/s | 3/3 |
| Q8_0_ROCMFPX_AGENT (ftype 115) | 4.12 GiB | 36.92 t/s | 3/3 |

La variante Q4_0 es la mas rapida y pequena, con resultados identicos a las de 8 bits en la prueba de correccion. La variante Q6_0_AGENT se considera la peor opcion: es mas grande que la Q4_0 y mas lenta que la Q8_0 simple, y la receta AGENT (disenada para aumentar la aceptacion de borradores especulativos) no aporta beneficio porque el modelo no incluye drafter.

## Requisitos de hardware

- Hardware objetivo: AMD Strix Halo (gfx1151), especificamente Ryzen AI MAX+ 395 con 128 GB de memoria unificada. La cuantizacion esta disenada para esta arquitectura y no se garantiza su funcionamiento en otras.
- VRAM estimada: al ser un sistema de memoria unificada, la VRAM es compartida con la RAM del sistema. Los archivos GGUF ocupan entre 2.37 GiB y 4.12 GiB, mas el proyector multimodal (~1 GB adicional). Con `-ngl 999` se descarga todo en GPU.
- GPU recomendada: no aplica a GPUs discretas NVIDIA; requiere iGPU RDNA 3.5 de Strix Halo (Radeon 8060S).
- Compatibilidad con consumer GPU: no, solo con AMD Strix Halo. No funciona en GPUs NVIDIA ni en AMD de generaciones anteriores.
- Opciones de despliegue: requiere un build de llama.cpp con soporte ROCmFPX (fork de [ROCmFPX](https://github.com/charlie12345/ROCmFPX)). No es compatible con llama.cpp estandar, Ollama ni LM Studio.
- Latencia y throughput: medidos en el hardware indicado, entre 36.92 y 55.57 tokens/s segun la variante, con latencia de primer token no especificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B (base) | 4.2B | 262K | safetensors/BF16 | Apache-2.0 | Modelo original, requiere ~8 GB en BF16, ejecutable en cualquier GPU |
| Qwen3.5-4B-ROCmFP4-GGUF (este) | 4.2B | 262K (nativo) | GGUF ROCmFP4/FPX | Apache-2.0 | Solo AMD Strix Halo, 2.37-4.12 GiB, hasta 55.57 t/s |
| Qwen3.5-4B GGUF estandar (llama.cpp) | 4.2B | 262K | GGUF (Q4_K_M, Q8_0, etc.) | Apache-2.0 | Portable a cualquier hardware con llama.cpp, velocidades variables |

La comparacion principal es con el modelo base en BF16 y con cuantizaciones GGUF estandar. La ventaja de esta cuantizacion ROCmFPX es su velocidad especifica en Strix Halo, pero su gran limitacion es la incompatibilidad con el ecosistema llama.cpp convencional. No se dispone de datos de otros modelos cuantizados con ROCmFPX de tamano similar para una comparativa mas amplia.

## Limitaciones y advertencias

- Requiere un build especifico de llama.cpp con soporte ROCmFPX; no cargara en llama.cpp estandar, Ollama ni LM Studio.
- Limitado a hardware AMD Strix Halo (gfx1151); no funciona en GPUs NVIDIA ni AMD de otras generaciones.
- No incluye drafter MTP/EAGLE, por lo que la decodificacion especulativa no esta disponible y las velocidades medidas son las maximas.
- La variante Q6_0_AGENT es suboptima: mas grande y lenta que la Q4_0, sin beneficio del drafter.
- Idiomas soportados no documentados; se asume cobertura multilingue del modelo base, pero sin confirmacion.
- No se publican benchmarks de calidad (MMLU, HumanEval, etc.), solo verificacion de correccion basica (3/3) en tareas no especificadas.
- Riesgo de alucinacion y sesgos inherentes al modelo base Qwen3.5-4B, no mitigados por la cuantizacion.
- Para entrada de imagenes es necesario desactivar flash attention (`-fa off`), lo que puede reducir el rendimiento en tareas multimodales.
- La fecha de creacion del repositorio (agosto de 2026) es posterior a la fecha actual, lo que sugiere que puede tratarse de un modelo experimental o de un repositorio con fechas incorrectas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/Qwen3.5-4B-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- Pagina de Qwen3.5-4B en Ollama: https://ollama.com/library/qwen3.5:4b
- Ficha de Qwen3.5-4B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-4b
- Repositorio oficial de la familia Qwen3: https://github.com/QwenLM/Qwen3
- Repositorio relacionado del mismo autor (Qwen3.8-27B con MTP): https://huggingface.co/kingjones777/Qwen3.8-27B-ROCmFP4-STRIX-MTP-GGUF
