# qwegnai/Inkling-2-Mini-shvq4g32-nvfp4

## Resumen
Inkling-2-Mini-shvq4g32-nvfp4 es un paquete de pesos cuantizados de alta fidelidad para el modelo multimodal `thinkingmachines/Inkling-2-Mini`, publicado por el usuario `qwegnai` en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversión optimizada para el motor de inferencia Qwegn (Swift 6.2 + Metal 4), diseñado específicamente para Apple Silicon. El paquete combina cuantización `SHVQ4_G32` en el tronco denso, coda, atención y proyecciones de cabeza, junto con pesos MoE enrutados en `NVFP4` sin pérdida adicional respecto al checkpoint original.

El modelo base emplea una arquitectura denominada `inkling2_loop`, un transformer con bucles (looped transformer) de 24 capas físicas que recorren las capas `[6..<18]` tres veces, dando lugar a 48 visitas efectivas de capa. Incorpora atención latente dispersa (LSA) con indexación de 64 bits, 128 expertos enrutados con 8 activos por token, una torre de visión de 23 capas y un vocabulario de 201.024 tokens. El contexto nativo alcanza 1.048.576 tokens.

La relevancia de este paquete reside en su enfoque de despliegue: reduce el tráfico activo de pesos a 2,790 GB/token (frente a 5,544 GB/token de checkpoints mixtos NVFP4/MXFP8), mantiene un KL medio de 0,013170 y un 97,92% de acuerdo Top-1 respecto al modelo sin cuantizar, y logra 80,07 tok/s en decodificación especulativa sobre un Apple M5 Max. Es, por tanto, una opción orientada a inferencia local de alta fidelidad en hardware Apple, no a servidores GPU convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop`: transformer con bucles, MoE, atención latente dispersa (LSA), torre de visión ViT de 23 capas |
| Parametros totales | no disponible |
| Parametros activos | 128 expertos enrutados, 8 activos por token (`intermediate_size = 1152`); total de parametros activos no disponible |
| Longitud de contexto | 1.048.576 tokens (1M) nativo; KV de DSpark limitado a 16K |
| Tipos de cuantizacion | `SHVQ4_G32` (tronco, coda, atención, cabeza), `NVFP4` sin pérdida (expertos MoE enrutados), `BF16`/`F32` (embeddings, ViT, normas, controladores) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `QWP1` (contenedor propio de Qwegn: `model.qwp` + `dspark.qwp`); no es safetensors, GGUF ni MLX |

## Arquitectura y entrenamiento
El modelo base `thinkingmachines/Inkling-2-Mini` usa una arquitectura `inkling2_loop` con 24 capas físicas que iteran el bloque `[6..<18]` tres veces, resultando en 48 visitas efectivas (4 de tronco + 12×3 de bucle + 4 de coda). La dimensión oculta es 2304, con atención de 24 cabezas de consulta y 8 de clave/valor (`head_dim = 128`), esquema Sink+RelBias con 4 capas de atención completa y 20 de atención de ventana deslizante (`SWA-1024`). Incorpora `AttnRes-6`, `SConv-4`, 128 expertos enrutados con 8 activos por token (`intermediate_size = 1152`), una torre de visión de 23 capas con dimensión 1024, vocabulario de 201.024 tokens (200.058 sin padding) y un cabezal especulativo DSpark de 3 capas Markov/Tree MTP.

El paquete de `qwegnai` no entrena el modelo, sino que lo recuantiza: aplica `SHVQ4_G32` a 329 planos del tronco, coda, atención y `lm_head`, conserva los pesos MoE enrutados en `NVFP4` de forma literal (193 tensores `F32` y 733 `BF16` de metadatos), y mantiene embeddings, torre de visión, normas y controladores en `BF16`/`F32`. Según la model card, esta receta (`cand5_hybrid_lossless_moe`) fue la mejor de 8 evaluadas, con 0,013170 de KL medio, 0,039308 de p95 KL y 97,92% de acuerdo Top-1 frente al checkpoint sin cuantizar. No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO).

## Capacidades
- Generación de texto y razonamiento multi-paso, incluyendo demostraciones matemáticas (el ejemplo de la model card es una prueba de que todo dominio de integridad finito es un cuerpo).
- Generación de código: la model card reporta 13/13 en HumanEval y 20/25 en Code-25.
- Procesamiento multimodal imagen-texto (`pipeline_tag: image-text-to-text`), con torre de visión de 23 capas preservada en `BF16`.
- Contexto largo nativo de hasta 1M tokens mediante indexación LSA de 64 bits y la opción `--lsa-cross-loop-reuse`.
- Decodificación especulativa con DSpark (`--mtp-drafts 3`), que acelera la generación.
- Servidor compatible con APIs OpenAI, Anthropic y Ollama (`qwg serve`).
- Conformidad de API verificada: 89/89 pruebas superadas.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente autónomo: no disponible en la información proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso
- Razonamiento matemático y demostraciones formales: el modelo puede abordar pruebas step-by-step con contexto largo, adecuado para asistentes de investigación que necesitan mantener el hilo de una demostración extensa dentro de la ventana de 1M tokens.
- Generación de código en local sobre Apple Silicon: con 13/13 en HumanEval y soporte de servidor compatible con OpenAI, puede integrarse en un flujo de autocompletado o revisión de código ejecutándose íntegramente en un Mac con M5 Max.
- Análisis de documentos largos con imágenes: la combinación de contexto de 1M tokens y torre de visión permite procesar informes, papers o contratos escaneados y responder preguntas sobre ellos en una sola pasada.
- Asistente de atención al cliente multi-turno: el contexto extendido y el servidor `qwg serve` con API compatible con OpenAI permiten desplegar un chatbot con memoria de conversación amplia en infraestructura local.
- Procesamiento por lotes de imágenes y texto: el pipeline `image-text-to-text` sirve para tareas de captioning, extracción de información de capturas o clasificación documental con imágenes.
- Investigación en eficiencia de inferencia: el paquete es un caso de estudio reproducible de cuantización híbrida (SHVQ4 + NVFP4 sin pérdida) con métricas de fidelidad (KL, Top-1) y determinismo (`d0 == d3`) publicadas.
- Despliegue de bajo consumo en estaciones de trabajo Apple: con un RSS de 16,79 GiB a 8K y KV q4, cabe en un Mac de 128 GB de memoria unificada sin GPU dedicada.

## Benchmarks y rendimiento
Medidos en un Apple M5 Max (18 núcleos CPU, GPU Apple10 NAX de 40 núcleos, 128 GB de memoria unificada, 585 GB/s DRAM), con `--kv-mode q4 --temperature 0`:

| Metrica | Resultado |
|---|---|
| Prefill NAX 512 / 2K / 4K / 8K / 16K / 32K | 2.451,7 / 3.365,3 / 3.299,4 / 3.503,6 / 3.156,0 / 2.837,7 tok/s |
| Decodificación serial `d=0` | 60,38–66,37 tok/s |
| Decodificación especulativa `d=3` (8K) | 80,07 tok/s (3,94 tok/step) |
| Decodificación especulativa `var5` (2K) | 79,90 tok/s (3,63 tok/step) |
| MoE-Spec opt-in (2K, budget 12) | 55,62 → 59,37 tok/s (+7,04%) |
| Fidelidad vs upstream | 0,013170 KL medio, 0,039308 p95 KL, 97,92% Top-1 |
| HumanEval | 13/13 (100%) |
| Code-25 | 20/25 |
| MBPP | 7/12 |
| Conformidad de API (`llmprobe`) | 89/89 (100%) |
| Determinismo `d0 == d3` (f16/q8/q4) | 3/3 SHA-256 iguales |
| Needle 16K | 3/3 |
| Tráfico activo | 2,790 GB/token (frente a 5,544 GB/token de NVFP4/MXFP8 mixto) |
| RSS a 8K con KV q4 | 16,79 GiB |

No se han publicado resultados de benchmarks del modelo base frente a otros modelos de la misma categoría en la información disponible.

## Requisitos de hardware
- Memoria: el paquete ocupa 14,89 GiB (`model.qwp`, 1.255 tensores) más 247,4 MiB (`dspark.qwp`), con un RSS de 16,79 GiB a 8K y KV q4.
- Hardware objetivo: Apple Silicon exclusivamente, mediante el motor Qwegn (Swift 6.2 + Metal 4). El rendimiento publicado corresponde a un Apple M5 Max con 128 GB de memoria unificada.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas; el contenedor `QWP1` solo carga en Qwegn.
- Cabe en GPU de consumo: no aplica en el sentido convencional; requiere un Mac con memoria unificada suficiente (el perfil medido usa 128 GB).
- Opciones de despliegue: Qwegn `v0.33.0+` (recomendado `v0.34.0`), con CLI (`qwg run`), servidor (`qwg serve`) compatible con APIs OpenAI, Anthropic y Ollama, y descarga vía `qwg pull` o `hf download`.
- Latencia y throughput: prefill de hasta 3.503,6 tok/s a 8K y decodificación de hasta 80,07 tok/s con DSpark `d=3`.
- Existe una variante con menor huella (10,20 GiB) y mayor throughput (hasta 99,89 tok/s de decodificación y 3.637,9 tok/s de prefill): `qwegnai/Inkling-2-Mini-shvq4g32-shvq2g64-shvq3g64`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| Inkling-2-Mini-shvq4g32-nvfp4 (este) | no disponible (MoE 128 expertos, 8 activos) | 1M | QWP1 | Apache 2.0 | Apple Silicon (Qwegn) |
| Inkling-2-Mini-shvq4g32-shvq2g64-shvq3g64 | no disponible | 1M (asumido, misma base) | QWP1 | Apache 2.0 | Apple Silicon (Qwegn) |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | 1M | no disponible | Apache 2.0 | no disponible |
| Alternativas de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias
- El paquete solo carga en el motor Qwegn `v0.33.0+`; no es compatible con vLLM, llama.cpp, Ollama nativo, TGI ni MLX, y no está en safetensors ni GGUF.
- Requiere hardware Apple Silicon; no puede desplegarse en GPUs NVIDIA o AMD convencionales.
- La cuantización introduce una pérdida medible: 0,013170 de KL medio y 97,92% de acuerdo Top-1, lo que implica un 2,08% de divergencia respecto al modelo sin cuantizar.
- El contexto de 1M tokens depende de la indexación LSA de 64 bits y de la opción `--lsa-cross-loop-reuse`; el cabezal DSpark limita su KV a 16K, lo que puede afectar a la decodificación especulativa en contextos muy largos.
- El rendimiento publicado se midió en un Apple M5 Max con 128 GB; en equipos con menos memoria unificada o generaciones anteriores el throughput será inferior.
- No se especifican los idiomas soportados ni los sesgos conocidos del modelo base en la información disponible.
- No se detallan los datos de entrenamiento del modelo base, lo que dificulta evaluar sesgos y calidad en dominios específicos.
- Riesgo de alucinación: no cuantificado en la información disponible; debe validarse en producción.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base `thinkingmachines/Inkling-2-Mini` de forma independiente.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces
- [Hugging Face: qwegnai/Inkling-2-Mini-shvq4g32-nvfp4](https://huggingface.co/qwegnai/Inkling-2-Mini-shvq4g32-nvfp4)
- [Modelo base: thinkingmachines/Inkling-2-Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini)
- [Variante de menor huella: qwegnai/Inkling-2-Mini-shvq4g32-shvq2g64-shvq3g64](https://huggingface.co/qwegnai/Inkling-2-Mini-shvq4g32-shvq2g64-shvq3g64)
- [Motor Qwegn (GitHub)](https://github.com/qwegnai/qwegn)
