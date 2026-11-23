# MultiverseComputingCAI/Comet_60B_A12B_FP8

## Resumen

Comet 60B es un modelo multimodal derivado de NVIDIA Nemotron 3.5 Super VL 120B, desarrollado por Multiverse Computing mediante su técnica de compresión CompactifAI. El modelo original es un Mixture-of-Experts híbrido Mamba2-Transformer de 124,5B parámetros con aproximadamente 12,8B activos por token; Comet reduce esa cifra a 61,1B totales manteniendo unos 12,3B activos por token, conservando intactas la estructura de capas, el tokenizador, la plantilla de chat y la capa de multi-token prediction (MTP).

La compresión se complementó con un proceso de "healing" mediante destilación del Nemotron 3.5 Super original sobre datos de texto, imagen y vídeo. El resultado es un checkpoint que ocupa aproximadamente la mitad en memoria (122,3 GB en BF16 frente a unos 249 GB del original, 66,3 GB en FP8 y 40,5 GB en NVFP4), lo que permite servirlo en 2× H200 en lugar de 4, o incluso en una sola H200 con la versión FP8.

La relevancia del modelo está en que mantiene capacidad agéntica y multimodal (texto, imagen y vídeo como entrada; texto como salida) con contexto evaluado de 262.144 tokens, superando al modelo base en benchmarks agénticos como τ²-Bench, AutomationBench-AA y SWE-bench Pro, y quedando a menos de 3 puntos en 28 de 35 métricas evaluadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba2-Transformer con Mixture-of-Experts latente: 88 capas (40 Mamba2, 40 MoE, 8 de atención), hidden size 4.096, expertos operando en espacio latente de 1.024 dimensiones; encoder de visión RADIO ViT-H/16 (32 capas) y una capa MTP |
| Parametros totales | 61.663.606.044 (61,1B según model card: 58,9B LM, 1,4B MTP, 0,8B encoder de visión y proyector) |
| Parametros activos | 12,3B por token: 22 de 256 expertos enrutados por capa MoE más 1 experto compartido (incluye embeddings y cabeza de salida; 11,2B sin ellos) |
| Longitud de contexto | Evaluado con 262.144 tokens; la configuración permite hasta 1.048.576 posiciones (contextos más largos no evaluados) |
| Tipos de cuantizacion | BF16 (122,3 GB), FP8 (66,3 GB, para NVIDIA Hopper y Blackwell), NVFP4 (40,5 GB, solo Blackwell) |
| Idiomas soportados | Inglés (en) |
| Licencia | OpenMDW License Agreement 1.1 (pesos); código del modelo bajo Apache 2.0 |
| Formato de pesos | safetensors (transformers, custom_code) |

## Arquitectura y entrenamiento

La arquitectura es la del checkpoint base Nemotron 3.5 Super VL 120B: un transformer híbrido con 40 capas Mamba2, 40 capas MoE y solo 8 capas de atención completa, con hidden size de 4.096 y expertos que trabajan en un espacio latente de 1.024 dimensiones. La compresión CompactifAI de Multiverse Computing reduce el número de expertos enrutados por capa de 512 a 256 (manteniendo 22 activos más 1 compartido), lo que baja los parámetros totales de 124,5B a 61,1B sin alterar los activos por token (12,8B → 12,3B). La capa MTP se conserva, habilitando decodificación especulativa multi-token.

Tras la compresión, el modelo fue "curado" mediante destilación del Nemotron 3.5 Super original sobre datos de texto, imagen y vídeo, lo que permite recuperar capacidades perdidas por la poda. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset de destilación ni si se aplicaron etapas de RLHF o DPO adicionales. El stack de servicio es idéntico al del modelo base, con los mismos parsers de razonamiento y tool calling de vLLM y decodificación especulativa MTP.

## Capacidades

- Generación de texto con modo de razonamiento configurable (thinking/reasoning control).
- Entrada multimodal: texto, imagen y vídeo; salida exclusivamente textual (sin audio).
- Tool calling / function calling con parsers compatibles con vLLM equivalentes a los del modelo base.
- Comportamiento agéntico multi-paso: planificación, uso de herramientas y razonamiento encadenado.
- Razonamiento matemático y científico (evaluado en GPQA Diamond).
- Comprensión de documentos e imágenes (benchmarks de imagen, documento y vídeo).
- Ingeniería de software: resolución de issues y parches (SWE-bench Verified y SWE-bench Pro).
- Decodificación especulativa MTP para mayor throughput en serving.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Atención al cliente automatizada: el modelo gestiona conversaciones multi-turno con contexto de hasta 262.144 tokens evaluados, suficiente para incorporar historial completo, documentación de producto y transcripciones previas en una sola ventana.
- Agentes de automatización de procesos (AutomationBench-AA): al superar al modelo base en este benchmark, es adecuado para orquestar flujos multi-paso con tool calling sobre APIs internas, con menor huella de memoria que el original.
- Ingeniería de software asistida: resolución de issues y generación de parches (SWE-bench Verified y Pro) integrable en pipelines de CI/CD mediante el parser de tool calling de vLLM.
- Análisis de documentos e imágenes: extracción de información de PDF, capturas y formularios gracias al encoder RADIO ViT-H/16, con salida textual estructurada.
- Comprensión de vídeo: resumen y respuesta a preguntas sobre clips de vídeo, útil en moderación de contenido o análisis de grabaciones, dado que acepta vídeo como entrada.
- Despliegue en infraestructura limitada: la versión FP8 cabe en una sola H200 con contexto completo de 256K, permitiendo servir cargas agénticas donde el modelo base requeriría 4 GPUs.
- Razonamiento científico y técnico: consultas que requieren cadena de razonamiento controlada (GPQA Diamond), con modo thinking activable según latencia requerida.

## Benchmarks y rendimiento

La model card indica que Comet 60B supera al Nemotron 3.5 Super original en τ²-Bench (airline, retail y telecom), AutomationBench-AA y SWE-bench Pro, y queda dentro de 3 puntos en 28 de 35 scores, incluyendo GPQA Diamond, AA-LCR, SWE-bench Verified y la mayoría de benchmarks de imagen, documento y vídeo. Sin embargo, los valores numéricos concretos de estos benchmarks no se detallan en la información proporcionada.

| Metrica | Resultado |
|---|---|
| τ²-Bench (airline, retail, telecom) | supera al modelo base (valores no disponibles) |
| AutomationBench-AA | supera al modelo base (valores no disponibles) |
| SWE-bench Pro | supera al modelo base (valores no disponibles) |
| GPQA Diamond | dentro de 3 puntos del base (valor no disponible) |
| AA-LCR | dentro de 3 puntos del base (valor no disponible) |
| SWE-bench Verified | dentro de 3 puntos del base (valor no disponible) |
| Throughput (4× H200) | 20–23% más tokens de salida/s que Nemotron 3.5 Super |
| Throughput FP8 (2× H200) | ~1,8× el throughput por GPU del original |

## Requisitos de hardware

- BF16: mínimo 2× H200 (141 GB) con contexto completo de 256K; pesos ≈58 GiB por GPU, dejando KV-cache para ~43 peticiones concurrentes de 256K tokens (medido). Los benchmarks y el comando de serving de referencia usan 4× H200.
- FP8: una sola H200 con contexto completo de 256K; 61 GiB de pesos y KV-cache para ~20 peticiones concurrentes de 256K tokens (medido). Requiere NVIDIA Hopper o Blackwell.
- NVFP4: 40,5 GB de checkpoint; requiere NVIDIA Blackwell (número mínimo de GPUs no especificado en la información disponible).
- Consumer GPU: no se indica compatibilidad con GPUs de consumo en la información disponible; el tamaño y los formatos (FP8/NVFP4) apuntan a hardware de datacenter.
- Opciones de despliegue: vLLM con los mismos parsers de razonamiento y tool calling del modelo base, con decodificación especulativa MTP.
- Throughput: 20–23% más tokens de salida/s que el original en 4× H200; ~1,8× throughput por GPU en FP8 sobre 2× H200. Latencia absoluta no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos/token | Contexto | Licencia | Formatos |
|---|---|---|---|---|---|
| Comet 60B (FP8) | 61,1B | 12,3B | 262.144 evaluados (hasta 1.048.576 config.) | OpenMDW 1.1 | BF16, FP8, NVFP4 |
| NVIDIA Nemotron 3.5 Super VL 120B (base) | 124,5B | 12,8B | 262.144 evaluados | OpenMDW 1.1 (según model card) | BF16, FP8, NVFP4 |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

Comet 60B ofrece la misma arquitectura y stack de serving que el base con la mitad de parámetros totales, menor huella de memoria (2× H200 frente a 4× en BF16) y mayor throughput, a costa de quedar ligeramente por detrás en algunas métricas no agénticas.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües declaradas.
- No procesa audio como entrada.
- Riesgo de alucinación inherente a modelos generativos; no se documentan mitigaciones específicas en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Contexto: aunque la configuración permite 1.048.576 posiciones, solo se ha evaluado con 262.144 tokens; el rendimiento más allá de esa longitud es desconocido.
- Licencia OpenMDW 1.1 para los pesos (uso comercial permitido según la model card); el código del modelo está bajo Apache 2.0. Es responsabilidad del usuario verificar el cumplimiento completo de los términos.
- Al ser un modelo comprimido y destilado, puede presentar degradaciones localizadas frente al base; la model card reporta diferencias de hasta 3 puntos en 7 de 35 scores.
- Los formatos FP8 y NVFP4 están restringidos a hardware NVIDIA Hopper/Blackwell; NVFP4 requiere Blackwell.
- No se han publicado cifras numéricas detalladas de benchmarks en la información disponible.

## Enlaces

- Hugging Face (FP8): https://huggingface.co/MultiverseComputingCAI/Comet_60B_A12B_FP8
- Hugging Face (BF16): https://huggingface.co/MultiverseComputingCAI/Comet_60B_A12B_BF16
- Hugging Face (NVFP4): https://huggingface.co/MultiverseComputingCAI/Comet_60B_A12B_NVFP4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
