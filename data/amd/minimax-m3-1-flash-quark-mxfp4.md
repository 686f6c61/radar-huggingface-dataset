# amd/MiniMax-M3.1-Flash-Quark-MXFP4

## Resumen

MiniMax-M3.1-Flash-Quark-MXFP4 es una versión cuantizada del modelo multimodal MiniMaxAI/MiniMax-M3.1-Flash, publicada por AMD. El modelo original es un transformer de tipo Mixture-of-Experts (MoE) con arquitectura propietaria `MiniMaxM3SparseForConditionalGeneration`, capaz de procesar entradas de texto, imagen y vídeo y generar texto. AMD ha aplicado cuantización MXFP4 (OCP Microscaling FP4) exclusivamente sobre los pesos y activaciones de los expertos enrutados (*routed experts*), manteniendo el resto de capas en la precisión original del modelo base.

La relevancia de esta ficha radica en que es una optimización específicamente diseñada para hardware AMD (microarquitecturas MI350/MI355 con ROCm 7.2.3), pensada para servir el modelo mediante vLLM y SGLang con aceleración AITER. El modelo base declara 220.490.854.016 parámetros totales según los tensores safetensors del repositorio, y el repo cuantizado ocupa 239,5 GB. Esto lo sitúa en la categoría de modelos de gran escala, orientados a despliegues en clústeres con múltiples GPUs.

La cuantización busca reducir el coste de memoria y aumentar el throughput sin degradar la precisión de forma significativa: según los datos de evaluación del autor, la recuperación de precisión respecto al modelo base se sitúa entre el 99,69% y el 104,62% en los benchmarks reportados. La licencia declarada es `qwen-community-1.0`, lo que introduce una advertencia importante para uso comercial que se detalla más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniMaxM3SparseForConditionalGeneration (transformer MoE disperso, multimodal) |
| Parametros totales | 220.490.854.016 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (OCP Microscaling FP4) estático en pesos de expertos enrutados y dinámico en activaciones; resto de capas sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (declarada como `other` en metadatos) |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

El modelo base MiniMax-M3.1-Flash emplea una arquitectura MoE dispersa (`MiniMaxM3SparseForConditionalGeneration`) con capacidades multimodales: acepta texto, imagen y vídeo como entrada y produce texto. La model card identifica componentes específicos como `vision_tower`, `multi_modal_projector`, `patch_merge_mlp`, `block_sparse_moe` (con `gate` y `shared_experts`) y un módulo `dspark` asociado a decodificación especulativa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica principal de esta versión es la cuantización selectiva con AMD-Quark: los expertos enrutados se convierten de NVFP4 a MXFP4, mientras que se excluyen explícitamente de la cuantización el `lm_head`, el `vision_tower`, el `multi_modal_projector`, `patch_merge_mlp`, las capas de self-attention, la compuerta del MoE (`block_sparse_moe.gate`), las tres primeras capas MLP (`layers.[0-2].mlp`), los expertos compartidos (`shared_experts`) y el módulo `dspark`. El modelo soporta decodificación especulativa DSPARK con verificación por bloques y 7 tokens especulativos, además de caché KV en FP8 o NVFP4 según el backend.

## Capacidades

- Generación de texto con modo de razonamiento (*thinking mode*), activable mediante `chat_template_kwargs` con `thinking_mode: enabled`.
- Razonamiento matemático avanzado, evidenciado por resultados en GSM8K, AIME26 y SciCode.
- Razonamiento científico y de nivel experto, evaluado mediante GPQA Diamond.
- Comprensión multimodal de imágenes y vídeo, evaluada con MMMU Pro en modalidad estándar y visión.
- Seguimiento de instrucciones complejas, evaluado con IFBench.
- Razonamiento sobre contextos largos, evaluado con AA-LCR.
- Soporte de *tool calling* / *function calling* mediante el parser `minimax_m3` en vLLM y SGLang.
- Soporte de decodificación especulativa (DSPARK) para acelerar inferencia.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Razonamiento matemático asistido: el modelo obtiene 96,90 en GSM8K y 93,75 en AIME26, por lo que resulta adecuado para sistemas de tutoría matemática, verificación de demostraciones o generación de problemas resueltos paso a paso con modo thinking activado.
- Análisis de documentos científicos y técnicos: su rendimiento en GPQA Diamond (87,63) y SciCode (49,27) lo hace viable para asistentes de investigación que deban interpretar literatura especializada y responder preguntas de nivel experto.
- Procesamiento de documentación multimodal: al aceptar imagen y vídeo, puede integrarse en pipelines de extracción de información de capturas, gráficos, tablas escaneadas o fotogramas de vídeo, combinando visión y razonamiento textual.
- Agentes con tool calling en producción: gracias al parser `minimax_m3` y al soporte en vLLM/SGLang, puede orquestar llamadas a APIs externas, bases de datos o motores de búsqueda en flujos multi-paso.
- Razonamiento sobre contextos extensos: su resultado en AA-LCR (77,00) sugiere uso en análisis de contratos, informes o expedientes largos donde se requiere recuperación y síntesis de información distribuida.
- Despliegue en infraestructura AMD: al estar optimizado para MI350/MI355 con ROCm 7.2.3 y AITER, encaja en clústeres AMD existentes que necesiten servir un modelo multimodal de gran escala con menor huella de memoria en los expertos.
- Evaluación y *benchmarking* interno: puede utilizarse como referencia cuantizada para comparar la degradación de precisión frente al modelo base en pipelines de evaluación con EvalScope.

## Benchmarks y rendimiento

Datos reportados por el autor (evaluación con vLLM y EvalScope 1.14.1):

| Benchmark | MiniMax-M3.1-Flash (base) | Quark-MXFP4 (este modelo) | Recuperación |
|---|---|---|---|
| GSM8K (4-shot) | 97,20 | 96,90 | 99,69% |
| GPQA Diamond (mean@8) | 87,69 | 87,63 | 99,93% |
| AIME26 (mean@16) | 93,54 | 93,75 | 100,22% |
| MMMU Pro, standard (mean@1) | 79,19 | 79,13 | 99,92% |
| MMMU Pro, vision (mean@1) | 76,99 | 77,57 | 100,75% |
| SciCode, subproblem (mean@8) | 48,11 | 49,27 | 102,41% |
| AA-LCR (mean@16) | 76,75 | 77,00 | 100,33% |
| IFBench (mean@5) | 50,53 | 52,87 | 104,62% |

El autor advierte que los resultados pueden variar entre ejecuciones. No se han publicado datos de latencia o throughput en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 239,5 GB en safetensors; para inferencia se necesita al menos esa capacidad distribuida entre GPUs, más memoria para caché KV y activaciones.
- GPU recomendadas: AMD MI350 y MI355, según la model card. El ejemplo de servicio usa `--tensor-parallel-size 4`, lo que implica un mínimo de 4 GPUs para el despliegue de referencia.
- No cabe en GPU de consumo: el tamaño del modelo (220.490 millones de parámetros y 239,5 GB de pesos) excede cualquier GPU consumer convencional.
- Opciones de despliegue: vLLM (imagen `vllm/vllm-openai-rocm:minimax-m31-flash`) y SGLang, ambos con aceleración AITER (`VLLM_ROCM_USE_AITER=1`, `SGLANG_USE_AITER=1`).
- Backends y optimizaciones: `--moe-backend aiter`, `--fp8-gemm-backend aiter`, caché KV en `fp8` o `nvfp4`, decodificación especulativa DSPARK con 7 tokens, `--chunked-prefill-size 32768`, `--max-running-requests 128`, `--mem-fraction-static 0.8`.
- Sistema operativo: Linux. ROCm 7.2.3, PyTorch 2.13.0, Transformers 5.19.0.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| amd/MiniMax-M3.1-Flash-Quark-MXFP4 | 220.490.854.016 | no disponible | qwen-community-1.0 | Hugging Face (AMD) | Cuantización MXFP4 selectiva para AMD MI350/MI355 |
| MiniMaxAI/MiniMax-M3.1-Flash | no disponible | no disponible | no disponible | Hugging Face (MiniMax) | Modelo base sin cuantizar; referencia de precisión |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

No se dispone de información suficiente sobre modelos comparables de terceros (mismo tamaño o misma tarea) para establecer una comparativa rigurosa con parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- Licencia `qwen-community-1.0`: pese a estar etiquetada como `other`, el nombre sugiere una licencia comunitaria con posibles restricciones para uso comercial; es imprescindible revisar el archivo `LICENSE` antes de desplegar en producción.
- Dependencia de hardware AMD: el modelo está optimizado para MI350/MI355 con ROCm 7.2.3; no se garantiza su funcionamiento en GPUs NVIDIA ni en otras microarquitecturas.
- Requiere `trust_remote_code` y código personalizado (`custom_code`), lo que implica auditar el código remoto antes de ejecutarlo.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo de gran escala, puede producir contenido plausible pero incorrecto, especialmente en dominios especializados.
- Idiomas soportados no declarados: no se puede confirmar cobertura multilingüe ni calidad por idioma.
- Longitud de contexto no declarada: no es posible planificar despliegues que dependan de ventanas concretas sin consultar la model card del modelo base.
- La cuantización solo afecta a los expertos enrutados; el resto de capas mantiene la precisión original, por lo que el ahorro de memoria es parcial respecto al modelo base.
- Los resultados de benchmarks provienen del propio autor y pueden variar entre ejecuciones; no se han verificado de forma independiente en la información disponible.
- El número de parámetros activos no está disponible, lo que impide estimar con precisión el coste computacional por token.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/MiniMax-M3.1-Flash-Quark-MXFP4
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Documentación de AMD-Quark: https://quark.docs.amd.com/latest/index.html
- Receta de vLLM para MiniMax-M3.1-Flash: https://recipes.vllm.ai/MiniMaxAI/MiniMax-M3.1-Flash?hardware=mi355x&variant=mxfp4
- Recetas generales de vLLM: https://recipes.vllm.ai/
- Cookbook de SGLang para MiniMax-M3.1: https://docs.sglang.io/cookbook/autoregressive/MiniMax/MiniMax-M3.1
