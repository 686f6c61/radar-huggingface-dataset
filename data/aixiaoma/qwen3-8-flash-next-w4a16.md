# aixiaoma/Qwen3.8-Flash-Next-W4A16

## Resumen

El modelo `aixiaoma/Qwen3.8-Flash-Next-W4A16` es una cuantización INT4 (W4A16, group-128, simétrica) del modelo multimodal Qwen3.8-Flash-Next de Alibaba, un MoE ultra-sparse de 125B parámetros con 6B activos por token. El autor, aixiaoma, la ha creado con el objetivo de permitir la ejecución de este modelo en GPUs Ampere consumer (RTX 3090), donde el checkpoint FP8 oficial no funciona por falta de soporte FP8 en la arquitectura SM86. Es la primera cuantización INT4 pública de este modelo, y la única en 4 bits que corre en GPUs pre-Blackwell.

La cuantización reduce el tamaño de 335 GB (BF16) a 179 GB en disco, de los cuales solo ~66 GB son pesos residentes en GPU; los 102 GB de tablas n-gram (PLE) se descargan a la RAM del host mediante vLLM. Esto permite ejecutar el modelo con 4×RTX 3090 (contexto de 96 000 tokens) o 8×RTX 3090 (contexto nativo de 262 144 tokens). Se preservan en BF16 los componentes críticos: el módulo MTP (speculative decoding), las tablas PLE, el router MoE, el indexador QSA, la atención lineal y el encoder de visión.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-sparse con GDN (Gated DeltaNet) en 3 de cada 4 capas y QSA (Qwen Sparse Attention) en la cuarta; 512 expertos por capa |
| Parametros totales | 179 999 981 459 (180B) |
| Parametros activos | 6B por token |
| Longitud de contexto | 262 144 tokens (nativo); 98 304 tokens con 4×RTX 3090 |
| Tipos de cuantizacion | INT4 (W4A16, group-128, simétrico) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | compressed-tensors pack-quantized (safetensors) |

## Arquitectura y entrenamiento
El modelo base Qwen3.8-Flash-Next, desarrollado por Alibaba, combina dos mecanismos de atención: tres de cada cuatro capas utilizan Gated DeltaNet (una capa recurrente lineal que comprime el historial), mientras que la cuarta capa usa Qwen Sparse Attention (QSA) para recuperación precisa de contexto largo. El modelo tiene 512 expertos por capa con un experto compartido adicional, y una tabla de n-gram (PLE) de 51B parámetros que se activa fuera de las rutas GEMM. La cuantización se realizó con RTN (round-to-nearest) simétrico con escalas por grupo, sin datos de calibración; se intentó AWQ pero no fue viable por limitaciones de memoria en el proceso de linearización. El autor no ha publicado información sobre el entrenamiento del modelo base (número de tokens, dataset, RLHF/DPO).

## Capacidades
- Generación de texto multimodal: acepta entrada de imagen y texto, produce texto.
- Razonamiento complejo: soporta cadenas de razonamiento paso a paso, con parser `qwen3` para respuestas razonadas.
- Generación de código y tool calling: soporta el parser `qwen3_coder` y activación automática de herramientas.
- Capacidad multilingüe: no se especifican idiomas concretos, pero el modelo base de Qwen suele ser multilingüe.
- Ventana de contexto larga: hasta 262 144 tokens nativos, con capacidad de procesar documentos extensos o conversaciones multi-turno.
- Decodificación especulativa MTP: preserva el head MTP en BF16, logrando un aumento del +57% en velocidad de decodificación single-stream.

## Casos de uso
- **Inferencia multimodal en hardware consumer**: con 4×RTX 3090 se puede ejecutar el modelo completo con contexto de 96k, permitiendo prototipos de visión-lenguaje en entornos de investigación sin GPUs de datacenter.
- **Procesamiento de documentos técnicos extensos**: con el contexto de 262k tokens en 8×RTX 3090, se puede analizar repositorios completos de código, manuales técnicos o informes largos en una sola pasada.
- **Asistente de código con tool calling**: al soportar el parser `qwen3_coder` y `--enable-auto-tool-choice`, se puede integrar en pipelines de CI/CD para generar o revisar código, invocando funciones externas.
- **Análisis de imágenes con razonamiento**: al ser multimodal, puede responder preguntas sobre imágenes y generar descripciones detalladas, útil en aplicaciones de documentación visual o diagnóstico de imágenes.
- **Chat conversacional de largo recorrido**: su ventana de contexto amplia y su capacidad de razonamiento lo hacen adecuado para sistemas de atención al cliente que requieren recordar conversaciones anteriores.
- **Experimentación en MoE y atención híbrida**: sirve como referencia para investigadores que estudian arquitecturas MoE ultra-sparse con GDN y QSA, al ofrecer una implementación funcional en hardware accesible.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card indica que la calidad en su suite de evaluación greedy coincide con la referencia de la familia base, pero no se proporcionan números concretos (MMLU, HumanEval, GSM8K, etc.). No se dispone de datos comparativos con otros modelos.

## Requisitos de hardware
- **VRAM mínima**: 4×RTX 3090 (96 GB totales) para contexto de 96k tokens; 8×RTX 3090 (192 GB totales) para contexto completo de 262k tokens.
- **Pesos residentes en GPU**: ~66 GB (el resto de las tablas PLE se descargan a RAM del host).
- **RAM del host**: ≥110 GB para las tablas PLE (102 GB) y el sistema operativo.
- **GPU recomendadas**: RTX 3090, RTX 3090 Ti, RTX A5000, A6000, o cualquier GPU Ampere con 24 GB de VRAM. No funciona en GPUs pre-Ampere (SM86) ni en GPUs con menos de 24 GB.
- **Opciones de despliegue**: vLLM (build `vllm/vllm-openai:qwen38-flash-next`) con `--enable-expert-parallel`, `VLLM_PLE_CPU_OFFLOAD=1` y configuración específica de compilación (desactivar torch.compile, usar CUDA graphs).
- **Rendimiento**: con 8×RTX 3090 y MTP activado, se reporta un throughput de ~105 tok/s en decodificación single-stream, frente a 9 tok/s sin la configuración correcta de compilación.

## Comparativa con modelos similares
No se dispone de datos comparativos con otros modelos en la información proporcionada. El modelo base Qwen3.8-Flash-Next (FP8) no puede ejecutarse en Ampere, por lo que esta cuantización INT4 es la única opción para esa plataforma. No se han encontrado cuantizaciones equivalentes de otros modelos con la misma arquitectura (GDN+QSA) en el momento de la publicación.

## Limitaciones y advertencias
- **Dependencia de vLLM específico**: requiere el build de vLLM con soporte `qwen4_exp`; no funciona con versiones estándar.
- **Problemas con `torch.compile`**: la compilación inductor de la arquitectura cuelga en Ampere; es obligatorio usar `--compilation-config '{"mode": 0, "cudagraph_mode": "FULL_DECODE_ONLY"}'`.
- **Restricciones de memoria host**: necesita ≥110 GB de RAM libre para las tablas PLE; el despliegue en Docker requiere flags especiales (`--cap-add SYS_PTRACE`, `--security-opt seccomp=unconfined`) por el syscall `pidfd_getfd`.
- **Sesgos y alucinaciones**: al ser una cuantización de un modelo base no alineado específicamente, puede presentar alucinaciones en tareas de razonamiento complejo o respuestas factuales, como cualquier LLM.
- **Licencia**: la licencia `qwen-community-1.0` puede tener restricciones para uso comercial; se recomienda revisar el texto completo.
- **No se han publicado benchmarks**: la ausencia de métricas estandarizadas dificulta la comparación objetiva con otras cuantizaciones o modelos.

## Enlaces
- [HuggingFace - aixiaoma/Qwen3.8-Flash-Next-W4A16](https://huggingface.co/aixiaoma/Qwen3.5-Flash-Next-W4A16)
- [HuggingFace - Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- [vLLM Recipes - Qwen3.8-Flash-Next](https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next)
- [Blog explainx.ai - Qwen3.8-Flash-Next 125B-A6B](https://www.explainx.ai/blog/qwen3-8-flash-next-125b-moe-release-august-2026)
- [GitHub - QwenLM/Qwen3.8](https://github.com/QwenLM/Qwen3.8)
