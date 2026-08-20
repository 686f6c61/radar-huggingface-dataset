# OsaurusAI/Ornith-1.5-35B-A3B-MXFP8

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje multimodal (VLM) de tipo MoE desarrollado por Ornith AI, diseñado especificamente para tareas de codificacion agente, razonamiento y comprension de vision y video. Este bundle concreto, publicado por OsaurusAI, es una cuantizacion MXFP8 de 8 bits del modelo original, convertida al formato MLX para ejecucion nativa en Apple Silicon mediante la libreria MLX. La cuantizacion utiliza el metodo JANG de Jinho Jang, que combina asignacion de bits basada en la traza del Hessiano con refit imatrix, una aproximacion que mide la importancia real de cada modulo en lugar de depender de heuristicas basadas en nombres de tensores.

El modelo base emplea una arquitectura hibrida que combina atencion lineal gated-delta con atencion completa en proporcion 3:1, junto con una torre de vision de 27 capas y soporte nativo de video. Con 40 capas, 256 expertos enrutados y una ventana de contexto de 262.144 tokens, esta orientado a flujos de trabajo agente que requieren razonamiento multi-paso, tool calling y comprension visual. La licencia MIT permite uso comercial sin restricciones, lo que lo hace atractivo para integracion en produccion. El razonamiento (thinking mode) viene activado por defecto, y se preserva la cabeza MTP (multi-token prediction) para decodificacion especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_moe` / `Qwen3_5MoeForConditionalGeneration`, hibrida gated-delta linear attention + full attention (3:1), MoE con 256 expertos enrutados |
| Parametros totales | 35B declarados por el fabricante (35B-A3B); 10.448.775.024 en safetensors del bundle cuantizado |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | MXFP8 uniforme 8-bit, group size 32; tensores con `in_features` no divisible por el group size de MLX (27 tensores `linear_fc2` de la torre de vision con 4304 features) permanecen en fp16 |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), 33 shards, 34,95 GiB en disco |

## Arquitectura y entrenamiento

Ornith-1.5-35B-A3B es un modelo MoE con 40 capas, hidden size de 2048 y 256 expertos enrutados, construido sobre un backbone hibrido que combina atencion lineal gated-delta con atencion completa en proporcion 3:1. Esta mezcla busca reducir el coste computacional del atencion sobre secuencias largas (hasta 262.144 tokens) manteniendo la capacidad de capturar dependencias de largo alcance. El modelo incorpora una torre de vision de 27 capas con 333 tensores, lo que le permite procesar imagenes y video de forma nativa, con `preprocessor_config.json` y `video_preprocessor_config.json` incluidos en el bundle.

La cuantizacion JANG aplicada por OsaurusAI utiliza tres metodos de calibracion unificados en una unica pasada de captura: la asignacion de bits se realiza por traza del Hessiano (`tr(H)·‖W‖²_F`) por modulo, el refit imatrix ajusta los codigos RTN con pesos activados por activaciones, y la estadistica de segundo momento por canal `E[x_c²]` sirve simultaneamente como diagonal del Hessiano, peso imatrix y estadistica AWQ. Un detalle relevante es que la torre de vision obtiene una puntuacion de importancia mayor que el MLP de texto en este modelo, algo que un perfilado basado en nombres de tensores habria invertido. La cabeza MTP (multi-token prediction) se preserva integramente (1.561 tensores `mtp.*`) para habilitar decodificacion especulativa. El razonamiento viene activado por defecto: la generacion sin argumentos es byte-identica a `enable_thinking=True`. No existen tiers de `reasoning_effort` en esta familia, a diferencia de Qwen3.8.

## Capacidades

- Generacion de texto y razonamiento multi-paso con thinking mode activado por defecto.
- Comprension de imagenes mediante torre de vision de 27 capas (333 tensores).
- Comprension de video nativa, verificada end-to-end con `video_preprocessor_config.json`.
- Codificacion agente: SWE-bench Verified 79 y Terminal-Bench 2.1 67,8, orientado a resolver issues reales de repositorios.
- Tool calling / function calling con parser `qwen3_coder`.
- Decodificacion especulativa con cabeza MTP preservada (1 draft/step recomendado en Apple Silicon).
- Presets de muestreo duales: general (temp 1,0, presence 1,5) y coding (temp 0,6, presence 0,0), siendo el de codificacion el predeterminado en este bundle.
- No soporta audio: los tokens `<|audio_start|>`, `<|audio_end|>` y `<|audio_pad|>` son vestigiales; el modelo carece de `audio_config` y de pesos de torre de audio.

## Casos de uso

- Resolucion autonoma de issues en repositorios: con SWE-bench Verified 79, el modelo puede recibir una descripcion de bug, explorar el codigo, generar un parche y validarlo, integrandose como agente en pipelines de CI/CD.
- Asistente de programacion con tool calling: el parser `qwen3_coder` permite al modelo invocar herramientas (ejecutar tests, consultar APIs, editar archivos) en un bucle agente multi-paso, util para entornos IDE o CLI.
- Analisis de video para QA de interfaces: el modelo procesa secuencias de video para detectar regresiones visuales o comportamientos anomalos en aplicaciones, algo que un VLM solo-imagen no puede hacer.
- Razonamiento sobre documentacion tecnica extensa: con 262.144 tokens de contexto, puede ingerir repositorios completos o especificaciones largas y responder preguntas de arquitectura con trazabilidad.
- Despliegue local en Apple Silicon: el bundle MLX de 34,95 GiB permite ejecutar el modelo en un Mac con suficiente memoria unificada, sin depender de GPUs NVIDIA, ideal para entornos de desarrollo donde la privacidad del codigo es critica.
- Generacion de documentacion y revision de codigo: el preset de muestreo coding (temp 0,6, presence 0,0) produce salidas mas deterministas y coherentes para tareas de revision, mientras que el preset general (temp 1,0) es mas adecuado para lluvia de ideas o explicaciones creativas.
- Comprension de diagramas y capturas de pantalla: la torre de vision permite al modelo interpretar diagramas de arquitectura, esquemas de bases de datos o capturas de errores, combinando la informacion visual con el contexto textual del repositorio.

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card del bundle y de BenchLM:

| Benchmark | Resultado |
|---|---|
| SWE-bench Verified | 79 |
| Terminal-Bench 2.1 | 67,8 |
| BenchLM public score | 49,27/100 (puesto 134 de 221 modelos) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. Los datos de BenchLM estan marcados como "Estimated" en esa plataforma, por lo que deben tratarse con cautela. El fabricante declara que Ornith-1.5 alcanza rendimiento estado-del-arte entre modelos open-source de tamano comparable, pero no se aportan tablas comparativas detalladas en los materiales revisados.

## Requisitos de hardware

- Tamano en disco: 34,95 GiB (37,5 GB en el repositorio HF).
- VRAM estimada: al ser un bundle MLX, requiere memoria unificada en Apple Silicon. Con 34,95 GiB de pesos mas cache KV y overhead, se recomienda un minimo de 48 GB de memoria unificada; 64 GB o mas para operar comodamente con contexto largo.
- GPUs compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4 y posteriores) para este bundle MLX. El modelo base original (`ornith-ai/Ornith-1.5-35B-A3B`) puede ejecutarse en GPUs NVIDIA con vLLM o Transformers.
- Opciones de despliegue: MLX (libreria nativa de Apple), con soporte para decodificacion especulativa via cabeza MTP (1 draft/step recomendado segun `vmlx_mtp_tuning.json`). Para el modelo base, vLLM y TGI son opciones viables en clusteres CUDA.
- Latencia y throughput: no se han publicado mediciones especificas para este bundle. La decodificacion especulativa con MTP deberia reducir la latencia por token, pero la recomendacion de 1 draft/step no esta respaldada por un barrido medido en este artefacto.

## Comparativa con modelos similares

| Modelo | Params | Contexto | SWE-bench Verified | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (este bundle) | 35B total / 3B activos | 262.144 | 79 | MIT | MLX (MXFP8) |
| Ornith-1.5-9B (dense) | 9B | no disponible | no disponible | MIT | no disponible |
| Ornith-1.5-397B (MoE) | 397B | no disponible | no disponible | MIT | no disponible |

La familia Ornith-1.5 incluye tres escalas (397B MoE, 35B MoE y 9B dense) segun el sitio del fabricante. No se dispone de benchmarks publicados para las variantes 9B y 397B en los materiales revisados. Dado que la arquitectura base es `qwen3_5_moe`, es probable que existan modelos comparables en la familia Qwen3.5 MoE, pero no se han encontrado datos suficientes para una comparacion rigurosa en la informacion disponible.

## Limitaciones y advertencias

- Audio no soportado: el tokenizador define tokens de audio, pero el modelo no tiene pesos de torre de audio. Intentar usar la modalidad de audio fallara silenciosamente o producira tokens vacios.
- Solo ingles: la model card declara `language: en`; el rendimiento en otros idiomas no esta garantizado y probablemente sea significativamente inferior.
- Toggle de razonamiento sutil: `enable_thinking=False` no elimina el bloque de thinking, sino que prefija un bloque cerrado vacio. Un parser que solo verifique la presencia del bloque ` thinking` encontrara uno en ambos modos; hay que comprobar si tiene contenido.
- Sin tiers de `reasoning_effort`: a diferencia de Qwen3.8, no hay niveles configurables de esfuerzo de razonamiento; el historial de bloques thinking se preserva incondicionalmente.
- Discrepancia en el recuento de parametros: el fabricante declara 35B-A3B, pero los safetensors del bundle cuantizado contabilizan 10.448.775.024 parametros. Esta diferencia puede deberse a que el recuento excluye la torre de vision y la cabeza MTP, o a un etiquetado comercial del fabricante; conviene verificarlo antes de dimensionar infraestructura.
- Perdida por cuantizacion: la cuantizacion MXFP8 puede introducir degradacion frente al modelo en fp16, especialmente en tareas de precision numerica o generacion de codigo con dependencias largas.
- Recomendacion de MTP no medida: la sugerencia de 1 draft/step para decodificacion especulativa es una recomendacion, no un resultado de un barrido sistematico sobre este artefacto.
- Benchmarks limitados: solo se dispone de SWE-bench Verified, Terminal-Bench 2.1 y una puntuacion estimada de BenchLM; falta evidencia en tareas estandar como MMLU o GSM8K.

## Enlaces

- Bundle cuantizado: https://huggingface.co/OsaurusAI/Ornith-1.5-35B-A3B-MXFP8
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Coleccion Ornith-1.5: https://huggingface.co/collections/ornith-ai/ornith-15
- Pagina oficial del modelo: https://ornith.ai/ornith_1_5.html
- Perfil en BenchLM: https://benchlm.ai/models/ornith-1-5-35b-a3b
- Guia de Ornith AI: https://ornith.online/
