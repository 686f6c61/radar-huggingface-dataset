# AxionML/Nemotron-3-Ultra-550B-A55B-NVFP4

## Resumen

Nemotron-3-Ultra-550B-A55B-NVFP4 es un modelo de lenguaje de escala frontera desarrollado por NVIDIA y distribuido en este repositorio por AxionML como espejo sin modificar del checkpoint oficial. Se trata de un modelo Mixture-of-Experts híbrido con arquitectura LatentMoE que intercala capas Mamba-2, capas MoE y capas de atención selectivas, e incorpora capas de predicción multi-token (MTP). Declara 550.000 millones de parámetros totales con 55.000 millones activos por token, y una ventana de contexto de hasta 1.000.000 de tokens.

El checkpoint es la propia publicación de NVIDIA en precisión NVFP4, no una cuantización posterior: el modelo fue preentrenado con una receta NVFP4 y NVIDIA distribuye directamente los pesos cuantizados. La cuantización NVFP4 combina un codebook E2M1 de 4 bits con escalado por bloques en FP8 (E4M3) sobre microbloques de 16 elementos, con acumulación en FP32 en los Tensor Cores de arquitecturas Blackwell. Según la model card, las proyecciones MoE se almacenan en NVFP4, mientras que las proyecciones latentes, las capas MTP, las proyecciones de atención y los embeddings se mantienen en mayor precisión.

Su relevancia actual reside en que combina contexto de un millón de tokens, razonamiento con modo thinking conmutable y capacidades agénticas (uso de herramientas, ejecución multi-paso) en un formato cuantizado listo para servir con SGLang y vLLM sobre hardware Blackwell. El repositorio ocupa 352,3 GB y está licenciado bajo OpenMDW-1.1, lo que permite uso comercial y no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid LatentMoE: Mamba-2 + MoE + atención, con capas MTP |
| Parametros totales | 550.000 millones (nominal, segun el autor); el recuento de safetensors del repositorio es 302.826.566.168 |
| Parametros activos | 55.000 millones |
| Longitud de contexto | Hasta 1.000.000 de tokens |
| Tipos de cuantizacion | NVFP4 (lineales MoE) + FP8; cache KV en FP8; proyecciones latentes, MTP, proyecciones de atención y embeddings en mayor precision. Tag del repositorio: 8-bit |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (campo `license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | safetensors (repo de 352,3 GB), libreria transformers |

## Arquitectura y entrenamiento

La arquitectura es un hibrido LatentMoE que intercala capas Mamba-2 (modelo de espacio de estados) con capas de mezcla de expertos y un subconjunto de capas de atención, e incorpora capas de Multi-Token Prediction (MTP). Segun la informacion disponible, el modelo fue preentrenado durante aproximadamente 20 billones de tokens, y el corpus de post-entrenamiento combina datos curados de alta calidad con datos generados sinteticamente. No se detalla en la informacion proporcionada si se aplicaron tecnicas concretas de RLHF o DPO ni la composicion exacta del dataset.

La innovacion tecnica principal es doble. Por un lado, el preentrenamiento en NVFP4: en Blackwell, los multiplicadores FP4 nativos explotan la simplicidad del codebook E2M1 mientras la acumulacion en FP32 protege la precision del producto escalar, y el uso de escalas de bloque FP8 (en lugar de escalas solo potencia de dos en E8M0) permite escalas fraccionarias y seleccion de escala que minimiza el error. Por otro, las capas MTP habilitan decodificacion especulativa nativa, expuesta en vLLM mediante el metodo `nemotron_h_mtp` y en SGLang mediante algoritmo EAGLE con hasta 5 pasos especulativos y 6 tokens borrador.

## Capacidades

- Generacion de texto conversacional y razonamiento de multiples pasos, con modo thinking activable o desactivable mediante la plantilla de chat (`enable_thinking`).
- Razonamiento de alta precision en codigo, matematicas y ciencia, con soporte explicito para tareas de ingenieria de software (SWE-Bench, Terminal-Bench, SciCode).
- Uso de herramientas y function calling: los comandos de despliegue documentados incluyen `--tool-call-parser qwen3_coder` y `--enable-auto-tool-choice`, con el parser de razonamiento `nemotron_3` / `nemotron_v3`.
- Capacidades agenticas: navegacion web y busqueda (BrowseComp), uso de herramientas en entornos de terminal y flujos multi-paso (TauBench V3).
- Contexto largo: recuperacion sobre ventanas de hasta 1M de tokens, con un resultado de 94,0 en RULER 1M en la version NVFP4.
- Capacidades multilingues en el ambito de codigo: el benchmark SWE-Bench Multilingual reporta 69,1 en NVFP4. El listado de idiomas naturales soportados no esta disponible.
- Decodificacion especulativa soportada de forma nativa mediante las capas MTP.
- No se documenta en la informacion disponible soporte de vision ni de audio.

## Casos de uso

- Agentes de ingenieria de software: el modelo resuelve incidencias sobre repositorios reales (69,5 en SWE-Bench Verified y 69,1 en SWE-Bench Multilingual en NVFP4) y puede integrarse en pipelines de CI/CD como agente que lee el fallo, localiza el codigo y propone un parche.
- Automatizacion de operaciones en terminal: con 53,9 en Terminal-Bench 2.1, es adecuado para agentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos shell de forma iterativa.
- Analisis de documentacion extensa: gracias a la ventana de hasta 1M de tokens y a 94,0 en RULER 1M, permite resumir, consultar y extraer conclusiones de bases de codigo, expedientes o corpus legales completos sin troceado externo.
- Atencion al cliente automatizada de alta complejidad: gestiona conversaciones multi-turno con contexto largo y razonamiento conmutable, de modo que se puede desactivar el modo thinking para respuestas rapidas y activarlo para casos que requieren diagnostico.
- Investigacion asistida en ciencia y matematicas: 87,9 en GPQA sin herramientas y 43,5 en SciCode lo sitúan como asistente para razonamiento tecnico de dominio, con posibilidad de encadenar busqueda web mediante tool calling.
- Verificacion de hechos y navegacion web: con 41,4 en BrowseComp, es utilizable en agentes que planifican busquedas, leen paginas y sintetizan respuestas con citas.
- Evaluacion de calidad de instrucciones y generacion controlada: 82,3 en IFBench indica buen seguimiento de restricciones, util para sistemas que deben respetar formatos estrictos o politicas de contenido.
- Analisis financiero y de negocio estructurado: 47,9 en GDPVal sugiere utilidad en tareas profesionales de valor economico con entregables verificables.

## Benchmarks y rendimiento

Resultados publicados por NVIDIA (NeMo Evaluator SDK), comparando el checkpoint BF16 con el NVFP4:

| Benchmark | BF16 | NVFP4 |
|---|---:|---:|
| Terminal-Bench 2.1 | 56,4 | 53,9 |
| SWE-Bench Verified | 70,7 | 69,5 |
| SWE-Bench Multilingual | 67,7 | 69,1 |
| GDPVal | 46,7 | 47,9 |
| TauBench V3 (media) | 70,9 | 70,3 |
| BrowseComp | 44,4 | 41,4 |
| GPQA (sin herramientas) | 87,0 | 87,9 |
| HLE (sin herramientas) | 26,7 | 26,1 |
| SciCode (subtask) | 44,6 | 43,5 |
| IFBench (prompt) | 81,7 | 82,3 |
| AA-LCR | 65,4 | 65,5 |
| RULER 1M | 94,7 | 94,0 |

No se han publicado en la informacion disponible resultados comparativos con modelos de otros fabricantes.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 352,3 GB, por lo que se necesita un agregado de memoria de al menos ese tamano mas el margen para cache KV y activaciones; con `--mem-fraction-static 0.85` en SGLang, el objetivo practico es de 400 GB o mas de memoria de GPU por instancia.
- Configuracion minima declarada por el autor: 4x B200, 4x GB200, 4x B300, 4x GB300, o 8x H100.
- No cabe en GPU de consumo. Una RTX 4090 (24 GB) queda muy lejos incluso en configuraciones multi-GPU de consumo, y la cuantizacion NVFP4 requiere Tensor Cores Blackwell para su aceleracion nativa.
- Despliegue probado: SGLang con `lmsysorg/sglang:v0.5.13` y vLLM con `vllm/vllm-openai:v0.22.0`, ambos sobre 4x B200. Configuraciones de referencia con tensor parallel 4, expert parallel 4, `--kv-cache-dtype fp8`, backend Mamba `flashinfer` y decodificacion especulativa (`EAGLE` en SGLang, `nemotron_h_mtp` en vLLM).
- Contexto largo: para 1M de tokens hay que definir `SGLANG_ALLOW_OVERWRITE_LONGER_CONTEXT_LEN=1` o `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`; las configuraciones de ejemplo usan 262.144 tokens.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No hay datos de benchmark de modelos alternativos en la informacion proporcionada. La comparativa disponible se limita a las dos precisiones del propio modelo y a los formatos alternativos publicados por terceros:

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AxionML Nemotron-3-Ultra-550B-A55B-NVFP4 (espejo) | 550B totales / 55B activos | Hasta 1M tokens | NVFP4 + FP8 | OpenMDW-1.1 | HuggingFace, 352,3 GB |
| nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-NVFP4 (original) | 550B totales / 55B activos | Hasta 1M tokens | NVFP4 + FP8 | OpenMDW-1.1 | HuggingFace, NVIDIA NIM |
| nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16 | 550B totales / 55B activos | Hasta 1M tokens | BF16 | OpenMDW-1.1 | HuggingFace |
| mlx-community/Nemotron-3-Ultra-550B-A55B | 550B totales / 55B activos | no disponible | MLX safetensors | NVIDIA Open Model License | HuggingFace |

Comparativa de rendimiento frente a otros modelos de la misma categoria: no disponible.

## Limitaciones y advertencias

- Sesgos y contenido toxico: el modelo base se entreno con datos que pueden contener lenguaje toxico y sesgos sociales, y el checkpoint cuantizado hereda esas limitaciones. Puede generar contenido inexacto, sesgado u ofensivo.
- Alucinacion: no se documentan medidas especificas de mitigacion en la informacion disponible; en tareas abiertas sin herramientas persisten tasas de error notables, como refleja el 26,1 en HLE sin herramientas.
- Idiomas: el listado de idiomas naturales soportados no esta publicado. El unico dato multilingue disponible es de codigo (SWE-Bench Multilingual), por lo que la cobertura fuera del ingles deberia validarse empiricamente antes de usarla en produccion.
- Contexto: aunque se declara soporte de hasta 1M de tokens, las configuraciones de ejemplo usan 262.144 tokens y ampliar el limite requiere variables de entorno especificas y un consumo de memoria considerable.
- Restricciones de licencia: la licencia OpenMDW-1.1 permite uso comercial y no comercial segun la model card, pero conviene revisar el texto completo del enlace de licencia antes de un despliegue comercial; el modelo base aparece asociado tambien a la NVIDIA Open Model License en otros repositorios.
- Trazabilidad: este repositorio es un espejo de terceros (AxionML) con 0 descargas y 0 likes. Para produccion conviene referenciar el repositorio oficial de NVIDIA y fijar la revision indicada (`02462641f13d3af838b904f48195b9bb8a1e4ebc`).
- Hardware: la cuantizacion NVFP4 esta disenada para Tensor Cores Blackwell; ejecutarla fuera de esa generacion de GPU puede implicar descompresion a mayor precision y perdida del beneficio de rendimiento.
- Umbral de calidad cuantizado: la perdida frente a BF16 es pequena en la mayoria de benchmarks, pero alcanza 2,5 puntos en Terminal-Bench 2.1 y 3,0 en BrowseComp, tareas sensibles al razonamiento agéntico.
- Se requiere `--trust-remote-code` en los comandos de despliegue documentados, lo que implica ejecutar codigo del repositorio.

## Enlaces

- Repositorio HuggingFace (espejo de AxionML): https://huggingface.co/AxionML/Nemotron-3-Ultra-550B-A55B-NVFP4
- Modelo original cuantizado de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-NVFP4
- Modelo base en BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16
- Pagina de investigacion de NVIDIA Nemotron 3 Ultra: https://research.nvidia.com/labs/nemotron/Nemotron-3-Ultra/
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3-ultra-550b-a55b/modelcard
- Fine-tuning en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3-ultra-550b-a55b/fine-tune
- Version MLX de la comunidad: https://huggingface.co/mlx-community/Nemotron-3-Ultra-550B-A55B
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
