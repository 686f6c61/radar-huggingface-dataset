# OsaurusAI/Nemotron-3-Nano-Omni-30B-A3B-JANG_4M

## Resumen

OsaurusAI/Nemotron-3-Nano-Omni-30B-A3B-JANG_4M es un port nativo a Apple MLX del modelo multimodal Nemotron-3-Nano-Omni-30B-A3B-Reasoning de NVIDIA, cuantizado por Jinho Jang (OsaurusAI). Se trata de un modelo omni-modal que procesa texto, imagen, vídeo y audio (incluido ASR) en una única arquitectura híbrida Mamba-2 + Attention + Mixture-of-Experts, con razonamiento activado por defecto. El nombre JANG_4M hace referencia a la receta de cuantización mixta de 4 y 8 bits, calibrada con imatrix, AWQ y Hessian.

La relevancia de este lanzamiento reside en que lleva un modelo de 30B parámetros con ~3B activos a hardware Apple Silicon de forma nativa, manteniendo todas las modalidades operativas (la torre de visión RADIO y el codificador de habla Parakeet se conservan en fp16). Con un tamaño de repositorio de 21.8 GB y una velocidad de decodificación declarada de ~126 tokens/s en un M5 Max, se posiciona como una opción viable para inferencia local multimodal en equipos de sobremesa de Apple, así como para cargas de trabajo de agente con tool calling en XML.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba-2 + Attention + Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 30B nominales; 6.653.507.670 en safetensors cuantizados |
| Parametros activos | ~3B |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta 4-bit/8-bit (JANG_4M), con grupo de 64; variante MXFP4 disponible; vision tower y Parakeet encoder en fp16 |
| Idiomas soportados | Ingles |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un Nemotron-H de NVIDIA, que combina bloques de atención con capas de space-state model (Mamba-2) y un bloque de Mixture-of-Experts con 3B de parametros activos sobre un total de 30B. El port de OsaurusAI mantiene esa arquitectura en MLX, pero sustituye la precision BF16 original por una asignacion mixta: los expertos enrutados (93 % de los parametros) se cuantizan a 4-bit, mientras que el experto compartido, las proyecciones de atencion y Mamba-2 se mantienen en 8-bit. Las normas, el router y los parametros de conv1d se conservan en fp16. La torre de vision RADIO ViT, el codificador de habla Parakeet (24 capas Conformer) y los proyectores multimodales no se cuantizan nunca, garantizando que todas las modalidades funcionen.

La cuantizacion se calibra con una hessiana medida por capa MoE, un imatrix ajustado a un corpus ponderado por dominio (codigo, agente/tool, razonamiento, general, multilingue y contexto largo) y escalas AWQ plegadas. No se usa QAT porque NVIDIA no publica variantes entrenadas con cuantizacion; sus releases son post-training con modelopt y MIXED_PRECISION. El razonamiento esta activado por defecto (`enable_thinking`), con un presupuesto de razonamiento de 16384 tokens sobre un maximo de 20480.

## Capacidades

- Generacion de texto con modo razonamiento (thinking) activado por defecto, configurable via presets de sampling.
- Comprension de imagenes mediante torre de vision RADIO ViT con tiles de 512px y miniatura.
- Comprension de video mediante muestreo de frames y poda EVS.
- Reconocimiento de habla (ASR) con el codificador Parakeet de 24 capas Conformer.
- Tool calling / function calling en formato XML `<tool_call><function=...>` para uso agente.
- Razonamiento multi-step integrado en el flujo de generacion (presupuesto de 16384 tokens).
- Soporte multilingue limitado al ingles (aunque el corpus de calibracion incluye datos multilingues).
- Compatible con el stack de inferencia MLX (`mlx_lm`) y con el ecosistema Osaurus/vMLX.

## Casos de uso

- Agente de escritorio con control de herramientas: el modelo puede invocar funciones en formato XML dentro de un bucle agente, por ejemplo para buscar en la web, ejecutar comandos locales o llamar a APIs, manteniendo el razonamiento activo para decidir el siguiente paso.
- Transcripcion de audio local: con el codificador Parakeet integrado y el preset de ASR (temperatura 1.0, top_k 1), se puede transcribir audio en ingles sin conexion en equipos Apple Silicon.
- Analisis de imagenes en entornos con privacidad: al ejecutarse en local, puede describir, responder preguntas o extraer informacion de imagenes (radiografias, capturas, documentos escaneados) sin enviar datos a la nube.
- Razonamiento con contexto largo en codigo: el modo thinking con presupuesto de 16384 tokens permite analizar repositorios extensos, identificar errores o proponer refactorizaciones justificando la decision.
- Pipeline de documentacion multimodal: combinar entrada de imagen y texto para generar resumenes, informes o traducciones de diagramas, esquemas o capturas de pantalla en ingles.
- Prueba de concepto de agente de computer use: el modelo puede observar una captura de pantalla (via vision) y emitir acciones de tool calling para interactuar con una interfaz, aprovechando el razonamiento multi-step.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica declarada por el autor es una velocidad de decodificado de aproximadamente 126 tokens por segundo en un Apple M5 Max con la cuantizacion JANG_4M, sin datos comparativos frente a otros modelos.

## Requisitos de hardware

- Repositorio de 21.8 GB en disco; requiere al menos 24 GB de RAM unificada para cargar el modelo completo en MLX (las capas en fp16 de vision y audio incrementan el consumo).
- Disenado para Apple Silicon: el rendimiento declarado (~126 tok/s) corresponde a un M5 Max; en chips menores (M2/M3 Pro o Max) la velocidad sera menor, pero el modelo deberia ser ejecutable en equipos con 32 GB de RAM o mas.
- No requiere GPU NVIDIA dedicada; se ejecuta de forma nativa con el framework MLX.
- Despliegue recomendado con el runner Osaurus/vMLX, que incluye el stack completo (RADIO, Parakeet, EVS). La parte LLM tambien se puede cargar directamente con `mlx_lm`.
- No se han publicado datos de latencia ni throughput para otras configuraciones de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron-3-Nano-Omni-30B-A3B-Reasoning (BF16, base) | 30B total / 3B activos | No disponible | Si (texto, imagen, video, audio) | NVIDIA Open Model License | safetensors (BF16) |
| OsaurusAI/Nemotron-3-Nano-Omni-30B-A3B-JANG_4 (este) | 30B nominal / 3B activos | No disponible | Si | NVIDIA Open Model License | safetensors (MLX, cuantizado) |
| Qwen2.5-Omni-7B | 7B | 128K | Si (texto, imagen, audio, video) | Apache 2.0 | safetensors / GGUF |

La comparativa se limita a modelos omni disponibles en el ecosistema de codigo abierto. No se dispone de datos de rendimiento comparados (MMLU, HumanEval, etc.) para esta cuantizacion concreta.

## Limitaciones y advertencias

- El modelo solo esta entrenado para ingles; su uso con otros idiomas no esta garantizado y puede producir salidas degradadas.
- La licencia NVIDIA Open Model License impone restricciones de uso comercial especificas; conviene revisar el texto completo antes de desplegar en produccion.
- No se ha publicado informacion sobre la longitud de contexto soportada, por lo que el uso con documentos largos o conversaciones extendidas requiere pruebas previas.
- La cuantizacion de 4-bit en los expertos enrutados puede degradar la precision en tareas de razonamiento o matematica, aunque el autor no ha publicado benchmarks al respecto.
- El modo de razonamiento esta activado por defecto y consume presupuesto de tokens (hasta 16384); si no se controla, puede aumentar la latencia y el coste en aplicaciones de baja latencia.
- Riesgo de alucinacion en tareas generativas, especialmente en vision o ASR cuando la entrada es ambigua o de baja calidad.
- La variante no ofrece cuantizacion de 2-bit porque la calidad resultante es sensiblemente peor, segun el autor; no existe una version GGUF publicada, solo safetensors MLX.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OsaurusAI/Nemotron-3-Nano-Omni-30B-A3B-JANG_4M
- Modelo base de NVIDIA: https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16
- Pagina de NVIDIA NIM del modelo: https://build.nvidia.com/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning/modelcard
- Pagina de NVIDIA Developer sobre Nemotron: https://developer.nvidia.com/topics/ai/nemotron
- Analisis en artificialanalysis.ai: https://artificialanalysis.ai/models/nemotron-3-nano-omni-30b-a3b
- Repositorio del runner Osaurus: https://github.com/dinoki-ai/osaurus
- Variante MXFP16: https://huggingface.co/OsaurusAI/Nemotron-3-Nano-Omni-30B-A3B-MXFP4
- Variante JANG_6M: https://huggingface.co/OsaurusAI/Nemotron-3-Nano-Omni-30B-A3B-JANG_6M
