# aidevco/Nemotron-3.5-Super-VL-120B-A12B-W4A16-g64

## Resumen

Nemotron-3.5-Super-VL-120B-A12B-W4A16-g64 es una cuantización int4 de solo pesos (weight-only) del modelo multimodal nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16, publicada por el usuario aidevco. El modelo original, desarrollado por NVIDIA, es un transformer híbrido con mezcla de expertos (MoE) de 124.453 millones de parámetros totales y aproximadamente 12.000 millones de parámetros activos (según el sufijo A12B del nombre), con una torre de visión RADIO y capacidad de procesamiento de imagen, texto, vídeo y audio. Esta versión cuantizada conserva la arquitectura y el entrenamiento del original; lo único que cambia es la precisión numérica de un subconjunto de capas.

La motivación de esta build es muy concreta: servir el modelo en dos AMD Instinct MI210 (gfx90a, 64 GB cada una) con tensor-parallel de tamaño 2. Esa GPU no dispone de matrix cores FP8 ni NVFP4, por lo que las builds publicadas en FP8, NVFP4, GGUF, EXL3 o MLX no son ejecutables en ella. El autor aplicó una cuantización simétrica int4 con grupo de 64 sobre las proyecciones de los expertos enrutados y compartidos, las proyecciones latentes y las proyecciones de atención, manteniendo en bf16 los mixers Mamba-2, los routers MoE, las normas, los embeddings, el `lm_head`, la cabeza MTP y la torre de visión.

El resultado ocupa 79,8 GB en 64 shards (frente a los 248,9 GB del checkpoint bf16 original) y reduce el peso lo suficiente para caber en dos MI210 con margen para caché KV. Es una build orientada a despliegue en hardware ROCm concreto, no un modelo nuevo: toda la información sobre arquitectura, entrenamiento, benchmarks y limitaciones debe consultarse en la model card del modelo base de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con MoE y mixers Mamba-2 (familia Nemotron-H); torre de visión RADIO |
| Parametros totales | 124.453.395.976 |
| Parametros activos | Aproximadamente 12.000 millones (según el sufijo A12B del nombre; no confirmado en la información disponible) |
| Longitud de contexto | 32.768 tokens en la configuración de servicio recomendada (`--max-model-len=32768`); el máximo nativo del modelo base no está disponible en la información proporcionada |
| Tipos de cuantizacion | Int4 simétrico weight-only, grupo 64, formato compressed-tensors `pack-quantized`; sin cuantización de activaciones (W4A16) |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW-1.1 (`license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | safetensors (64 shards, 79,8 GB), compressed-tensors |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de la familia Nemotron-H: combina capas de atención (8 capas según la tabla de cuantización, con proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`) con mixers Mamba-2 (`in_proj`, `out_proj`, `conv1d`, `A_log`, `D`, `dt_bias`, `norm`) y 40 capas MoE con 512 expertos enrutados cada una, más expertos compartidos y proyecciones latentes `fc1_latent_proj` / `fc2_latent_proj`. Los expertos no son gated: usan activación relu² con solo proyecciones up/down. Incorpora además una cabeza MTP (multi-token prediction), una torre de visión RADIO y un proyector multimodal. Los detalles de composición del dataset de entrenamiento, número de tokens, fases de RLHF/DPO e innovaciones de decodificación no están disponibles en la información proporcionada y deben consultarse en la model card de NVIDIA.

Esta build concreta se generó con llm-compressor 0.14.0 (`model_free_ptq`) y compressed-tensors 0.19.0, en modo data-free (sin conjunto de calibración) y solo en CPU. El esquema aplicado es `num_bits=4`, `symmetric=true`, `strategy=group`, `group_size=64`, observer `memoryless-mse`, sin cuantización de activaciones. Se cuantizaron 41.152 módulos: expertos enrutados (up/down), expertos compartidos (up/down), proyecciones latentes y proyecciones de atención. Se mantuvieron en bf16 los mixers Mamba-2 (una build comunitaria de la misma familia con proyecciones Mamba-2 en int4 producía respuestas fluidas pero incorrectas), los routers MoE (`gate`, `e_score_correction_bias`), normas, embeddings, `lm_head`, la cabeza MTP, la torre de visión y el proyector. El grupo 64 se eligió por ser el mayor que divide todas las dimensiones de entrada cuantizadas tras el split TP=2 (el intermedio de 2.688 de cada experto queda en 1.344 por tarjeta, que 128 no divide). El proceso tardó 43 minutos con 5 procesos worker × 8 hilos y es determinista: una reejecución produce shards idénticos byte a byte. La verificación posterior incluyó comprobación de esquemas, nombres de módulos en ambas formas, presencia de todos los shards y una prueba de dequantización con error relativo de 0,097–0,098 en los expertos enrutados.

## Capacidades

- Generación de texto y razonamiento multi-turno, con modo de razonamiento configurable mediante `--reasoning-parser=nemotron_v3`.
- Procesamiento de imagen y texto en el modelo base (pipeline `image-text-to-text`); esta build concreta se sirve en modo solo texto (`--language-model-only` y límite de 0 imágenes, vídeo y audio por prompt).
- Tool calling / function calling, con parser compatible `qwen3_coder` en vLLM.
- Soporte de agentes y razonamiento multi-paso (heredado del modelo base; no verificado específicamente en esta cuantización).
- Capacidades multilingües en inglés, español, francés, alemán, italiano y japonés.
- Cabeza MTP (multi-token prediction) conservada en bf16, potencialmente utilizable para decodificación especulativa (no confirmado en la información disponible).
- Mezcla de expertos con 512 expertos enrutados por capa en 40 capas, lo que permite alta capacidad paramétrica con un coste de cómputo activo reducido.

## Casos de uso

- Despliegue en clústeres con AMD Instinct MI210: es el caso de uso principal y explícito de esta build; permite ejecutar un modelo de 124.000 millones de parámetros en dos GPU de 64 GB sin matrix cores FP8/NVFP4, usando tensor-parallel de tamaño 2 y vLLM sobre ROCm 7.2 o 10.0.
- Asistente conversacional multi-turno: con 32.768 tokens de contexto configurados y modo de razonamiento, adecuado para diálogos largos con historial extenso en atención al cliente o soporte técnico.
- Generación de código en pipelines: el soporte de tool calling con parser `qwen3_coder` permite integrarlo en flujos de CI/CD y asistentes de programación que invocan herramientas externas.
- Procesamiento de documentación multilingüe: cubre inglés, español, francés, alemán, italiano y japonés, útil para resumen, extracción y clasificación de documentos en organizaciones europeas.
- Razonamiento multi-paso y agentes: la cabeza MTP y el modo de razonamiento lo hacen apto para tareas que requieren planificación y descomposición, como automatización de análisis o investigación asistida.
- Sustitución de builds FP8/NVFP4 en hardware ROCm: cuando el entorno no dispone de matrix cores modernos, esta cuantización int4 ofrece una alternativa funcional con una huella de 79,8 GB frente a los 248,9 GB del checkpoint bf16.
- Inferencia por lotes con throughput moderado: la reducción de memoria libera espacio para caché KV y permite lotes mayores, aunque el kernel `TritonW4A16LinearKernel` es más lento que bf16 en gfx90a.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta cuantización remite explícitamente a la model card del modelo base de NVIDIA para benchmarks, y no incluye métricas comparativas propias. El único dato de calidad reportado es el error relativo de dequantización de 0,097–0,098 en los expertos enrutados, considerado normal para int4.

## Requisitos de hardware

- VRAM estimada: 79,8 GB de pesos en int4, más caché KV y overhead del runtime; el autor lo sirve en 2 × MI210 de 64 GB (128 GB totales) con `--gpu-memory-utilization=0.92`, lo que deja aproximadamente 20 GB para caché KV y activaciones.
- GPU recomendadas: 2 × AMD Instinct MI210 (gfx90a) con tensor-parallel de tamaño 2, configuración probada. No hay datos publicados sobre otras GPU en la información disponible.
- GPU consumer: no cabe en ninguna GPU consumer individual; se requieren al menos dos aceleradores de 64 GB o un pool equivalente.
- Opciones de despliegue: vLLM v0.32.0 (`vllm/vllm-openai-rocm:v0.32.0`, ROCm 7.2) y v0.33.0 (`vllm/vllm:v0.33.0-rocm`, ROCm 10.0). La cuantización se detecta desde el config; no debe pasarse `--quantization`. No se mencionan llama.cpp, Ollama ni TGI como compatibles.
- Latencia y throughput: no disponibles. La model card advierte que `TritonW4A16LinearKernel` es más lento que bf16 en gfx90a para expertos compartidos, proyecciones latentes y atención, mientras que los expertos enrutados usan el kernel fusionado `CompressedTensorsWNA16MoEMethod` (Triton WNA16). Se incluye un archivo de configuración de kernel fusionado MoE ajustado para `E=512, N=1344, device_name=Instinct_MI210, dtype=int4_w4a16`.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| aidevco/Nemotron-3.5-Super-VL-120B-A12B-W4A16-g64 | 124.453 M | 32.768 (config. de servicio) | safetensors int4 W4A16 | OpenMDW-1.1 | 2 × MI210 (ROCm) |
| nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 | 124.453 M | no disponible | safetensors bf16 (248,9 GB) | OpenMDW-1.1 | GPU con suficiente VRAM; no cabe en 2 × MI210 |
| Builds FP8 / NVFP4 del mismo modelo base | 124.453 M | no disponible | FP8 / NVFP4 | OpenMDW-1.1 | GPU con matrix cores FP8/NVFP4 |
| Builds GGUF / EXL3 / MLX del mismo modelo base | 124.453 M | no disponible | GGUF / EXL3 / MLX | OpenMDW-1.1 | CPU/GPU según formato; no ejecutables en gfx90a según el autor |

No se dispone de datos de benchmarks ni de modelos alternativos de otros fabricantes en la información proporcionada para una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- La cuantización int4 introduce pérdida de precisión; el error relativo de dequantización reportado en los expertos enrutados es de 0,097–0,098, el nivel habitual para int4, pero no se han publicado evaluaciones de calidad downstream.
- Esta build se sirve en modo solo texto: la torre de visión RADIO y el proyector están en bf16 pero no se utilizan con la configuración recomendada (`--language-model-only` y límite de 0 imágenes, vídeo y audio por prompt). No debe asumirse capacidad multimodal en este despliegue.
- Los mixers Mamba-2 se mantienen en bf16 deliberadamente porque una build comunitaria de la misma familia con proyecciones Mamba-2 en int4 producía respuestas fluidas pero incorrectas; no debe cuantizarse esa parte sin validación.
- El kernel `TritonW4A16LinearKernel` es más lento que bf16 en gfx90a para las capas no MoE, lo que penaliza la latencia en comparación con el modelo original en hardware con matrix cores adecuados.
- La licencia OpenMDW-1.1 (`license: other`) debe revisarse antes de uso comercial; la información disponible no detalla restricciones adicionales.
- Riesgo de alucinación y sesgos: no se documentan en la información proporcionada; deben consultarse en la model card del modelo base de NVIDIA.
- El contexto máximo nativo del modelo base no está confirmado; la configuración probada limita a 32.768 tokens.
- La build depende de versiones concretas de vLLM (v0.32.0 o v0.33.0) y ROCm (7.2 o 10.0); otras combinaciones no están verificadas.
- El autor incluye un target de experto con el nombre `None` para satisfacer las comprobaciones del cargador MoE de vLLM; es un artefacto de compatibilidad, no un módulo real del checkpoint.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/aidevco/Nemotron-3.5-Super-VL-120B-A12B-W4A16-g64
- Modelo base en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- llm-compressor: no disponible en la información proporcionada
- compressed-tensors: no disponible en la información proporcionada
- vLLM: no disponible en la información proporcionada
- Paper del modelo base: no disponible en la información proporcionada
- Blog o demo oficial: no disponible en la información proporcionada
