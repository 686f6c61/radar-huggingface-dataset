# lued/Qwen3.8-27B-redashes-SSMFix-INT8-W8A16-MTP

## Resumen

Este repositorio contiene una cuantización numérica W8A16 del modelo [redashes/Qwen3.8-27B-BF16-SSMFIX](https://huggingface.co/redashes/Qwen3.8-27B-BF16-SSMFIX), que a su vez es una versión reparada del Qwen3.8-27B de Alibaba. La reparación SSM corrige un drift de escala en los tensores `linear_attn.conv1d.weight` de 8 capas, un defecto conocido en la arquitectura híbrida del modelo original. Esta cuantización está diseñada específicamente para inferencia en GPUs Ampere (sm_86) donde no hay soporte nativo de FP8, permitiendo ejecutar el modelo en dos RTX 3090 con 24 GB cada una.

El modelo base Qwen3.8-27B es un LLM multimodal denso de 27 000 millones de parámetros con visión nativa, contexto de 262 000 tokens y licencia Apache 2.0. Esta versión cuantizada conserva la torre de visión en BF16, el control de pensamiento (thinking mode), el contexto nativo y el cabezal MTP (Multi-Token Prediction) en BF16 byte-idéntico al original. La cuantización solo toca los pesos de 400 GEMMs (MLP, atención completa y proyecciones GDN), manteniendo los pesos de convolución SSM a precisión original.

La relevancia de este modelo radica en que permite ejecutar un LLM multimodal de última generación con calidad casi idéntica al BF16 (KLD de 0,000728 nats/token y 98,72% de acuerdo top-1) en hardware de consumo, sin necesidad de GPUs profesionales con soporte FP8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido con atención lineal SSM (linear_attn + conv1d) y torre de visión nativa |
| Parametros totales | 27 781 427 952 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 000 tokens (nativo del modelo base) |
| Tipos de cuantizacion | W8A16 (INT8 pesos, FP16/BF16 activaciones), RTN simétrico data-free, grupo 128 |
| Idiomas soportados | no disponible en la model card; el modelo base Qwen3.8-27B es multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (pack-quantized); cabezal MTP y torre de visión en BF16 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso multimodal con una arquitectura híbrida que combina atención completa tradicional con capas de atención lineal SSM (state space model) que incluyen convoluciones 1D (`linear_attn.conv1d`). Esta mezcla permite manejar contextos largos de 262K tokens con un coste computacional subcuadrático. El modelo incluye una torre de visión nativa para entrada de imágenes y vídeo, y un cabezal MTP (Multi-Token Prediction) para decodificación especulativa.

La reparación SSM aplicada por redashes corrige un drift de escala en los tensores `conv1d` de 8 capas concretas (52, 53, 56, 57, 58, 60, 61 y 62), reescalándolos con factores entre 0,481 y 0,653. Según la model card del modelo base, esta corrección mejora métricas generativas (TruthfulQA-gen +6~8pp, MT-Bench +0,42) a costa de una ligera reducción en conocimiento de libro cerrado (CMMLU −1,8pp).

La cuantización W8A16 se realizó con RTN simétrico data-free (sin datos de calibración), grupo 128, sobre 400 GEMMs: 192 de MLP, 64 de atención completa y 144 de proyecciones GDN densas. Los pesos de convolución SSM, la torre de visión, el `lm_head` y el cabezal MTP se conservan en BF16 a precisión original. El formato runtime es `compressed-tensors` con kernel Marlin (`CompressedTensorsWNA16` → `MarlinLinearKernel`), verificado en logs de servidor.

## Capacidades

- Generación de texto y razonamiento multilingüe, heredadas del modelo base Qwen3.8-27B.
- Comprensión de imágenes y vídeo nativa (torre de visión preservada en BF16).
- Control de pensamiento (thinking mode) con modos de razonamiento explícito.
- Decodificación especulativa mediante cabezal MTP (Multi-Token Prediction) en BF16 byte-idéntico al original.
- Soporte de tool calling y flujos agénticos, según las capacidades del modelo base.
- Manejo de contexto largo de 262K tokens, útil para documentos extensos y conversaciones multi-turno.
- La cuantización W8A16 no altera las capacidades funcionales; solo cambia la precisión numérica de los pesos.

## Casos de uso

- Inferencia multimodal en hardware de consumo: ejecutar el modelo en dos RTX 3090 (48 GB combinados) para tareas de visión-lenguaje como captioning de imágenes o respuesta a preguntas visuales, sin necesidad de GPUs con FP8.
- Asistentes de código con contexto largo: gracias a los 262K tokens de ventana, el modelo puede procesar repositorios completos o archivos de gran tamaño, manteniendo la calidad de generación de código del Qwen3.8-27B.
- Automatización de oficina: el modelo base destaca en tareas de ofimática (generación de documentos, hojas de cálculo, presentaciones), y esta cuantización permite desplegarlo en estaciones de trabajo con GPUs Ampere.
- Agentes autónomos con tool calling: el soporte de function calling y razonamiento multi-paso permite construir agentes que interactúan con APIs y herramientas externas, con la ventaja de poder ejecutarse en local.
- Investigación académica: la licencia Apache 2.0 y el formato abierto permiten experimentar con el modelo en entornos universitarios sin costes de licencia, incluso con GPUs modestas.
- Despliegue en producción con vLLM: el formato compressed-tensors y el kernel Marlin están optimizados para vLLM, permitiendo servir el modelo con baja latencia en infraestructura existente basada en Ampere.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks funcionales (MMLU, HumanEval, GSM8K, etc.) para esta cuantización concreta. La model card solo proporciona métricas de fidelidad numérica frente al teacher BF16, medidas con KLD (divergencia KL) sobre 467 posiciones forzadas por el profesor:

| Candidato | KLD media vs BF16 | Acuerdo top-1 | Peso de archivos |
|---|---:|---:|---:|
| Esta cuantización W8/BF16 A16 | 0,000728 | 98,72% | 29,44 GiB |

Desglose por categoría de prompt:

| Prompt | Categoría | Tokens | Posiciones | KLD media | Acuerdo top-1 |
|---|---:|---:|---:|---:|---:|
| factual | factual | 13 | 12 | 0,000603 | 1,0000 |
| code-fib | código | 87 | 86 | 0,000535 | 0,9884 |
| physics-uncertainty | física | 86 | 85 | 0,000780 | 0,9882 |
| math-train | matemáticas | 58 | 57 | 0,000863 | 0,9825 |
| sql-top5 | técnico | 60 | 59 | 0,000875 | 0,9831 |
| narrative-clock | narrativo | 68 | 67 | 0,000919 | 1,0000 |
| instruction-stack | instrucción | 43 | 42 | 0,000660 | 1,0000 |
| history-industrial | historia | 60 | 59 | 0,000517 | 0,9661 |
| **Media ponderada por tokens** | | | **467** | **0,000728** | |

Estas métricas miden solo el drift de pesos del checkpoint, no la calidad funcional. Para referencia, el modelo base Qwen3.8-27B alcanza DeepSWE 42.2, Terminal Bench 73.0 y OSWorld 84.3 según el blog de Lovable, pero esos resultados no han sido verificados en esta cuantización.

## Requisitos de hardware

- VRAM estimada: el checkpoint completo pesa 29,44 GiB. Con pesos INT8 (la mitad que BF16) y activaciones FP16/BF16, el modelo cabe en dos RTX 3090 de 24 GB (48 GB combinados), que es el objetivo declarado de esta cuantización.
- GPU recomendadas: cualquier GPU Ampere (sm_86) o superior con soporte de kernel Marlin. Específicamente diseñado para RTX 3090/3090 Ti, pero también funciona en A100, A6000, RTX 4090, etc.
- En consumer GPU: sí, en configuraciones de doble GPU de 24 GB. En una sola GPU de 24 GB podría requerir offloading de capas o reducción adicional de precisión.
- Opciones de despliegue: vLLM (librería objetivo, con kernel Marlin verificado), también compatible con Transformers y compressed-tensors. No se menciona soporte para llama.cpp u Ollama en la model card.
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación especulativa con MTP debería mejorar el throughput en comparación con generación autoregresiva estándar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| **Este modelo (SSMFIX W8A16)** | 27,8B | 262K | W8A16 INT8 | Apache-2.0 | Reparación SSM + cuantización para Ampere |
| [lued/Qwen3.8-27B-INT8-W8A16-MTP](https://huggingface.co/lued/Qwen3.8-27B-INT8-W8A16-MTP) | 27,8B | 262K | W8A16 INT8 | Apache-2.0 | Misma receta de cuantización sin reparación SSM |
| [redashes/Qwen3.8-27B-BF16-SSMFIX](https://huggingface.co/redashes/Qwen3.8-27B-BF16-SSMFIX) | 27,8B | 262K | BF16 | Apache-2.0 | Modelo base reparado, sin cuantizar |
| [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B) | 27,8B | 262K | BF16/FP8 | Apache-2.0 | Modelo original de Alibaba |

La diferencia clave entre este modelo y su hermano sin reparar es la base de pesos: este usa los pesos LM del modelo conv1d-reparado de redashes, mientras que el otro usa los pesos originales de Qwen. La cuantización es idéntica en ambos (misma receta, mismo grupo, mismo cabezal MTP byte-idéntico). Frente al BF16, este modelo reduce el uso de VRAM a la mitad aproximadamente, a costa de una pérdida numérica mínima (KLD < 0,001).

## Limitaciones y advertencias

- La reparación SSM reduce el conocimiento de libro cerrado (CMMLU −1,8pp según la model card del modelo base), aunque mejora métricas generativas. Esto puede afectar a tareas que dependen de hechos factuales memorizados.
- La cuantización RTN data-free no utiliza calibración, por lo que puede haber degradación en tareas sensibles a la precisión numérica, aunque la KLD medida es muy baja.
- Las métricas de fidelidad (KLD, acuerdo top-1) no son una medida de calidad funcional; se requiere evaluación conductual para tool use, coding, calidad multimodal y recall de contexto largo.
- No se han publicado benchmarks funcionales para esta cuantización concreta; los resultados del modelo base (DeepSWE, Terminal Bench, OSWorld) no están verificados en esta versión.
- El modelo está optimizado para vLLM y Ampere; su uso en otros runtimes o GPUs más antiguas puede no estar soportado.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir correctamente a los autores originales (Qwen y redashes).
- El tamaño del repositorio es de 31,6 GB, lo que requiere una descarga considerable y suficiente espacio en disco.

## Enlaces

- [Repositorio de HuggingFace de este modelo](https://huggingface.co/lued/Qwen3.8-27B-redashes-SSMFix-INT8-W8A16-MTP)
- [Modelo base reparado (redashes/Qwen3.8-27B-BF16-SSMFIX)](https://huggingface.co/redashes/Qwen3.8-27B-BF16-SSMFIX)
- [Modelo original de Qwen (Qwen/Qwen3.8-27B)](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repo hermano sin reparación SSM (lued/Qwen3.8-27B-INT8-W8A16-MTP)](https://huggingface.co/lued/Qwen3.8-27B-INT8-W8A16-MTP)
- [Repositorio oficial de Qwen3.8-27B en GitHub](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Guía completa de Qwen3.8-27B (blog de Lovable)](https://lovableapp.org/blog/qwen3-8-27b)
- [vLLM](https://github.com/vllm-project/vllm)
- [llm-compressor](https://github.com/vllm-project/llm-compressor)
