# AxionML/DeepSeek-V4-Flash-0731-NVFP4

## Resumen

AxionML/DeepSeek-V4-Flash-0731-NVFP4 es un espejo (mirror) del checkpoint cuantizado por NVIDIA nvidia/DeepSeek-V4-Flash-0731-NVFP4, que a su vez es una version en formato NVFP4 del modelo base deepseek-ai/DeepSeek-V4-Flash-0731. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 304.180.418.494 parametros totales (unos 304B) y 13B parametros activos por token, disenado para cargas de trabajo de contexto largo, generacion de codigo, tool calling y flujos agenticos.

La relevancia de esta ficha concreta reside en la cuantizacion: los expertos enrutados se almacenan en NVFP4 (4 bits con escalas de bloque FP8 E4M3), lo que reduce el checkpoint a aproximadamente 176 GB y habilita su servicio con SGLang o vLLM sobre hardware Blackwell (B200/GB200). La ventana de contexto alcanza 1 millon de tokens, incorpora cabeceras de decodificacion especulativa DSpark (sin cuantizar) y admite tres niveles de esfuerzo de razonamiento (low, high, max).

El modelo se publica bajo licencia MIT, lo que permite uso comercial y no comercial. En el momento de redactar esta ficha el repositorio de AxionML registra 0 descargas y 0 likes, y su fecha de creacion es el 29 de septiembre de 2026. El repo no aporta pesos nuevos: es una copia sin modificar del checkpoint de NVIDIA (revision f1caa71142bd0be02f728c79f75042ac1e461579).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion hibrida (Compressed Sparse Attention + Heavily Compressed Attention) y Manifold-Constrained Hyper-Connections |
| Parametros totales | 304.180.418.494 (segun safetensors del repo); la model card indica 304B y las busquedas web de terceros citan 284B |
| Parametros activos | 13B |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | NVFP4 (pesos y activaciones de los expertos MoE enrutados); escalas de bloque FP8 E4M3; cabeceras DSpark sin cuantizar; cache KV FP8 (fp8_e4m3) en los ejemplos de despliegue |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture-of-Experts con atencion hibrida que combina dos mecanismos: Compressed Sparse Attention y Heavily Compressed Attention, junto con conexiones residuales Manifold-Constrained Hyper-Connections. Con 304B parametros totales y solo 13B activos por token, el coste computacional por token se mantiene bajo en relacion a su capacidad total, lo que lo hace apto para despliegues de alta concurrencia. El checkpoint integra ademas cabeceras de decodificacion especulativa DSpark, que en esta version NVFP4 se conservan sin cuantizar.

Sobre el proceso de cuantizacion (responsabilidad de NVIDIA, no de AxionML ni de DeepSeek), los expertos MoE enrutados se almacenan en NVFP4 para pesos y activaciones. Segun la model card, los pesos de experto originales en MXFP4 se reinterpreptan (bit-cast) sin perdida a NVFP4 y unicamente se reescriben las escalas de bloque. El calibrado de amax de activaciones se realizo con los datasets cnn_dailymail y Nemotron-Post-Training-Dataset-v2, empleando NVIDIA Model Optimizer v0.46.0. NVFP4 combina un codebook E2M1 con escalas FP8 E4M3 por micro-bloques de 16 elementos, con acumulacion en FP32 en los Tensor Cores Blackwell. No se dispone de informacion en las fuentes proporcionadas sobre el numero de tokens de entrenamiento, composicion del dataset, ni sobre fases de RLHF o DPO del modelo base.

## Capacidades

- Generacion de texto y razonamiento con tres niveles de esfuerzo configurables: low, high y max.
- Generacion de codigo, con resultados reportados en SciCode (51,7 en MXFP4 / 52,1 en NVFP4) y Terminal-Bench v2.1 (74,7 / 73,7).
- Tool calling / function calling: los ejemplos de despliegue incluyen `--tool-call-parser deepseek_v4` y `--enable-auto-tool-choice`.
- Soporte de razonamiento agentico: parser de razonamiento dedicado (`--reasoning-parser deepseek_v4`) y evaluacion en τ²-Bench Telecom y GDPval.
- Contexto largo: ventana de hasta 1M tokens, con soporte de atencion dispersa/comprimida.
- Decodificacion especulativa: cabeceras DSpark incluidas en el checkpoint (la model card advierte que no se valido aguas arriba para este checkpoint NVFP4).
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de repositorios completos: con 1M tokens de contexto, el modelo puede ingerir bases de codigo enteras o grandes conjuntos de ficheros en una sola pasada y responder preguntas de arquitectura, dependencias o refactorizaciones sin troceado previo.
- Asistentes de codigo en produccion: integrable en pipelines de CI/CD mediante tool calling y el parser `deepseek_v4`, generando parches, ejecutando comandos en terminal y validando resultados (Terminal-Bench v2.1 de 73,7).
- Agentes autonomos multi-paso: los niveles de razonamiento low/high/max permiten ajustar el coste por tarea, usando low para operaciones rutinarias y max para planificacion compleja.
- Atencion al cliente automatizada: conversaciones multi-turno con historial extenso gracias a la ventana de 1M tokens, con resultados en τ²-Bench Telecom de 97,9 en NVFP4.
- Procesamiento de documentacion tecnica y legal: resumen, extraccion y comparacion de contratos o especificaciones de cientos de paginas en un unico contexto (evaluado parcialmente en AA-LCR, 71,8).
- Razonamiento cientifico y matematico de nivel experto: resolución de problemas de posgrado y dominios tecnicos, respaldado por GPQA Diamond (91,5) y SciCode (52,1).
- Generacion de informes evaluables por rubrica: tareas tipo GDPval con puntuacion de 93,2 en NVFP4.
- Servicio de inferencia a gran escala en formato cuantizado: desplegable con SGLang o vLLM sobre clústeres Blackwell para reducir el coste de VRAM frente al checkpoint sin cuantizar.

## Benchmarks y rendimiento

Resultados reportados por NVIDIA para este checkpoint, con temperatura 1.0, top_p 1.0 y esfuerzo de razonamiento maximo. La columna "MXFP4 (source)" corresponde al modelo base de referencia.

| Benchmark | MXFP4 (source) | NVFP4 |
|---|---|---|
| GPQA Diamond | 91,5 | 91,5 |
| AA-LCR | 72,1 | 71,8 |
| τ²-Bench Telecom | 98,7 | 97,9 |
| SciCode | 51,7 | 52,1 |
| IFBench | 75,8 | 75,5 |
| Terminal-Bench v2.1 | 74,7 | 73,7 |
| GDPval (rubric) | 93,0 | 93,2 |

Las diferencias entre NVFP4 y la fuente MXFP4 son inferiores a un punto en todos los benchmarks excepto GDPval (+0,2) y SciCode (+0,4), donde NVFP4 queda ligeramente por encima. No se han publicado en la informacion disponible otros benchmarks (MMLU, HumanEval, GSM8K) ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- Tamano del checkpoint: aproximadamente 175,6 GB en disco (formato NVFP4).
- VRAM estimada para inferencia: al menos el tamano de los pesos (~176 GB) mas la cache KV; la model card no ofrece cifras exactas de VRAM total.
- GPU recomendadas: hardware Blackwell (B200/GB200) para aprovechar los multiplicadores FP4 nativos; el formato NVFP4 depende de los Tensor Cores Blackwell segun la propia documentacion del checkpoint.
- Configuracion de referencia: ambos ejemplos de despliegue usan paralelismo de 8 GPUs (SGLang con `--tp-size 8`; vLLM con `--tensor-parallel-size 8` y `--enable-expert-parallel`).
- GPU de consumo: no cabe en GPUs consumer; el checkpoint de ~176 GB requiere multiples aceleradores de centro de datos.
- Opciones de despliegue: SGLang (backend `flashinfer_trtllm_routed`, `--kv-cache-dtype fp8_e4m3`, `--chunked-prefill-size 4096`, `--swa-full-tokens-ratio 0.1`) y vLLM (`--max-model-len 393216`, `--kv-cache-dtype fp8`, `--block-size 256`, `attention_config.use_fp4_indexer_cache=True`). Soporte de transformers declarado como libreria.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AxionML/DeepSeek-V4-Flash-0731-NVFP4 (este) | 304B totales / 13B activos | 1M tokens | MIT | safetensors NVFP4 | Espejo del checkpoint de NVIDIA; 0 descargas |
| nvidia/DeepSeek-V4-Flash-0731-NVFP4 | 304B totales / 13B activos | 1M tokens | MIT | safetensors NVFP4 | Origen de la cuantizacion; mismos pesos |
| deepseek-ai/DeepSeek-V4-Flash-0731 (base) | 304B totales / 13B activos | 1M tokens | MIT | safetensors (bf16/MXFP4) | Modelo sin cuantizar de referencia |
| DeepSeek-V4-Pro (Preview) | no disponible | no disponible | no disponible | no disponible | Citado en Microsoft Foundry como superado por V4-Flash-0731 en los benchmarks listados |

Las busquedas web citan el modelo como "284B MoE (13B activo)" en NVIDIA NIM y LM Studio, cifra que discrepa de los 304B de la model card y de los 304.180.418.494 parametros reales medidos en los safetensors. Se recomienda tomar como referencia el dato de safetensors. No hay resultados numericos comparativos con modelos de otros fabricantes en la informacion disponible.

## Limitaciones y advertencias

- El modelo base se entreno con datos que pueden contener lenguaje toxico y sesgos sociales; el modelo cuantizado hereda esas limitaciones.
- Riesgo de generacion de contenido inexacto, sesgado u ofensivo, segun advierte la propia model card.
- Idiomas soportados no declarados, por lo que no hay garantia de cobertura multilingue fuera del ingles u otros idiomas del entrenamiento.
- La decodificacion especulativa con las cabeceras DSpark no fue validada aguas arriba para este checkpoint NVFP4, aunque las cabeceras se conservan.
- El formato NVFP4 depende de hardware Blackwell; en GPUs sin soporte nativo FP4 el rendimiento puede degradarse o requerir rutas alternativas.
- Este repositorio no aporta trabajo propio de cuantizacion: es un espejo del checkpoint de NVIDIA, por lo que la responsabilidad tecnica del artefacto recae en el autor original.
- El repo de AxionML registra 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- Licencia MIT, que permite uso comercial y no comercial, pero conviene verificar las condiciones del modelo base y del checkpoint de NVIDIA por separado.
- No hay cifras publicadas de latencia, throughput ni de VRAM total requerida en la informacion disponible.

## Enlaces

- Repositorio de este modelo (AxionML): https://huggingface.co/AxionML/DeepSeek-V4-Flash-0731-NVFP4
- Checkpoint cuantizado original de NVIDIA: https://huggingface.co/nvidia/DeepSeek-V4-Flash-0731-NVFP4
- Modelo base de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- NVIDIA Model Optimizer (herramienta de cuantizacion): https://github.com/NVIDIA/Model-Optimizer
- Receta de cuantizacion para DeepSeek V4: https://github.com/NVIDIA/Model-Optimizer/tree/main/examples/deepseek/deepseek_v4
- Dataset de calibracion CNN/DailyMail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Dataset de calibracion Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Licencia MIT: https://opensource.org/license/mit
- Espejo adicional en HuggingFace: https://huggingface.co/axiomofmind/DeepSeek-V4-Flash-0731-NVFP4
- Pagina de NVIDIA NIM del modelo base: https://build.nvidia.com/deepseek-ai/deepseek-v4-flash-0731
- Ficha en LM Studio: https://lmstudio.ai/models/deepseek-v4-flash
- Catalogo de Microsoft Foundry: https://ai.azure.com/catalog/models/DeepSeek-V4-Flash-0731
