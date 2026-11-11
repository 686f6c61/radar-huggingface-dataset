# ctech123/ctech-fle-gt

## Resumen

ctech123/ctech-fle-gt es un derivado no oficial del modelo multimodal Qwen3.8-Flash-Next-FP4-Local, un transformer MoE con torre de visión desarrollado originalmente por Alibaba y cuantizado a FP4 por NVIDIA. Este checkpoint concreto ha sido producido por el usuario ctech123 mediante búsqueda de arquitectura neuronal (NAS) sobre la configuración de expertos enrutados, reduciendo de 512 a 384 expertos por capa, seguido de un ajuste GRPO con LoRA ya fusionado en los pesos. El resultado es un modelo completo de 155.104.917.163 parámetros (unos 155,1 mil millones) con pesos en FP4 y BF16 mixtos, empaquetado para servirse con vLLM.

La relevancia de esta ficha es doble: por un lado ilustra una técnica de compresión estructural (poda de expertos en MoE) que reduce el tamaño del checkpoint un 16,1 % manteniendo top-10 de enrutamiento; por otro, documenta un ciclo de RL con recompensas verificables orientado a tareas de ciberseguridad (completado de vectores CVSS y emisión de hallazgos estructurados). El modelo conserva las capacidades multimodales imagen-texto del original y una ventana de contexto de hasta 72.000 tokens en la configuración de servicio validada.

Se trata de un checkpoint de investigación, sin descargas ni validación comunitaria en el momento de redactar esta ficha, con licencia NVIDIA Open Model Agreement y soporte únicamente para inglés y chino. No debe confundirse con un modelo oficial de Alibaba ni de NVIDIA: el propio autor lo declara derivado y no respaldado por ninguna de las dos compañías.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con torre de visión, capa MTP y atención híbrida (GDN); pesos mixtos FP4/BF16 |
| Parámetros totales | 155.104.917.163 (~155,1 B) |
| Parámetros activos | 10 expertos enrutados + expertos compartidos por token (sobre 384 expertos enrutados por capa) |
| Longitud de contexto | Hasta 72.000 tokens en la configuración de servicio validada (`--max-model-len 72000`) |
| Tipos de cuantización | FP4 (NVFP4/ModelOpt mixto), BF16 para proyecciones GDN, caché KV en FP8; tag de 8-bit |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | NVIDIA Open Model Agreement (license: other) |
| Formato de pesos | safetensors (21 shards), configs y ficheros MTP incluidos; librería vLLM |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-Flash-Next-FP4-Local, un transformer con mezcla de expertos (MoE) en cada capa del decodificador y en la capa de predicción multi-token (MTP). La modificación principal de este derivado es la poda de expertos enrutados: se conservan 384 de los 512 originales en cada capa MoE, manteniendo intactos el enrutamiento top-10, los expertos compartidos, la atención, la tabla PLE de n-gramas, la torre de visión y el tokenizador. El checkpoint resultante pesa 85,66 GB (79,78 GiB), un 16,1 % menos que el original de 102,14 GB.

Sobre esa base se aplicaron tres rondas de ajuste GRPO con recompensas verificables, usando un adaptador LoRA de rango 32 y alpha 64. Los expertos enrutados, el router, el experto compartido y la tabla PLE permanecieron congelados durante el entrenamiento; solo se actualizaron las proyecciones GDN, cuyos deltas se plegaron a precisión completa y se almacenan en BF16 (eliminando las entradas correspondientes de `quantization_config.quantized_layers`). La ronda final de RL se orientó a completar vectores CVSS con presupuesto corto de tokens y a emitir hallazgos estructurados. El adaptador final se fusionó en los pesos antes de publicar el repositorio, por lo que no requiere un paso de carga separado.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de razonamiento extendido (`xhigh`) y parser de razonamiento Qwen3.
- Comprensión de imágenes y texto conjunta (pipeline `image-text-to-text`), gracias a la torre de visión conservada del modelo original.
- Generación de código: 98,78 en HumanEval (164 problemas, decodificación greedy).
- Matemáticas de competición: 95,0 en AIME 2026 con razonamiento xhigh y presupuesto de 64k tokens.
- Tool calling y function calling: soporte nativo vía `--tool-call-parser qwen3_xml` y `--enable-auto-tool-choice` en vLLM; 77,88 en el benchmark de tool calling de 800 casos.
- Capacidades de agente y razonamiento multi-paso, con decodificación especulativa MTP.
- Multilingüismo limitado a inglés y chino.
- Capacidad especializada en ciberseguridad: completado de vectores CVSS3 y CVSS4 y emisión de hallazgos estructurados, reforzada mediante RL.
- Soporte de caché de prefijos y prefill troceado (`--enable-prefix-caching`, `--enable-chunked-prefill`).

## Casos de uso

- Triaje automatizado de vulnerabilidades: el modelo puede recibir la descripción de un CVE y emitir un vector CVSS3 o CVSS4 junto con hallazgos estructurados, aprovechando el ajuste GRPO específico. Adecuado para pre-rellenar informes que un analista revisa después, dado que la aritmética CVSS exacta aún no es fiable.
- Asistente de revisión de código con contexto largo: con 72.000 tokens de ventana puede procesar repositorios o diffs extensos y señalar problemas de seguridad, integrándose en pipelines de CI/CD mediante tool calling.
- Análisis de capturas de pantalla y diagramas: la torre de visión permite extraer información de interfaces, diagramas de red o paneles de monitorización y razonar sobre ellos en inglés o chino.
- Agente multi-paso para tareas de investigación: el soporte de function calling y el modo de razonamiento extendido permiten encadenar búsquedas, llamadas a API y síntesis de resultados en un bucle agéntico.
- Generación de código en producción: HumanEval de 98,78 y soporte de tool calling lo hacen viable para autocompletado y generación de tests en entornos con GPU de centro de datos.
- Razonamiento matemático y resolución de problemas cuantitativos: útil en herramientas educativas o de verificación de cálculos, con trazas de razonamiento largas (mediana de ~16.700 tokens en AIME).
- Evaluación comparativa de técnicas de poda MoE: como checkpoint de investigación, sirve para medir el impacto de reducir expertos enrutados sobre benchmarks estándar.

## Benchmarks y rendimiento

Resultados publicados por el autor, con el mismo arnés y configuración de servicio para todas las filas. Son ejecuciones únicas; GPQA solo tiene 198 preguntas y es ruidoso. Las cifras base son referencias publicadas previamente, no reejecutadas.

| Benchmark | Base de referencia | Este modelo |
|---|---:|---:|
| GPQA-Diamond (low, 32k) | 77,3 | 75,76 |
| MMLU (14.042) | 86,9 | 87,37 |
| C-Eval val (1.346) | 89,0 | 89,97 |
| AIME 2026 (xhigh, 64k) | 93,3 | 95,0 |
| HumanEval (164, greedy) | 97,6 | 98,78 |
| MMMU val (900) | 79,4 | 78,22 |
| Tool calling (800) | — | 77,88 |

En longitud de razonamiento sobre 120 muestras de AIME, el total de tokens de completado cayó un 2,05 % (de 19.897 a 19.490 por respuesta) mientras la precisión subió de 92,5 a 95,0. La mediana quedó prácticamente igual (16.528 a 16.675 tokens); la reducción provino de la cola larga (P90 de 58.272 a 45.339) y de menos truncamientos a 65.536 tokens (de 9 a 6).

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 85,66 GB en disco; con caché KV en FP8 y `--gpu-memory-utilization 0.90` se validó en una única GPU B200 (192 GB HBM3e). No cabe en GPUs de consumo.
- GPU recomendadas: NVIDIA B200 (validada por el autor), H100/H200 (80-141 GB) como alternativa probable pero no validada explícitamente, y GPUs de centro de datos con al menos ~96 GB para el checkpoint más caché y activaciones.
- No cabe en consumer GPU: ni RTX 4090 (24 GB) ni RTX 5090 (32 GB) pueden alojar los 85,66 GB de pesos, ni siquiera con cuantización adicional no documentada.
- Opciones de despliegue: vLLM 0.31 con el parche `vllm_patch/sitecustomize.py` incluido (necesario para el layout FP4/CSF/PLE); flag `--quantization modelopt_mixed`, `--mamba-cache-mode align`, `--kv-cache-dtype fp8`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. La configuración validada usa `--max-num-seqs 128` y `--tensor-parallel-size 1`.

## Comparativa con modelos similares

| Modelo | Parámetros | Expertos enrutados | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| ctech123/ctech-fle-gt (este) | ~155,1 B | 384 de 512 | 72.000 | NVIDIA Open Model Agreement | Derivado con RL GRPO y poda NAS |
| nvidia/Qwen3.8-Flash-Next-FP4-Local (original) | no disponible | 512 | no disponible | no disponible | Checkpoint de referencia, 102,14 GB |
| autotrust/Qwen3.8-Flash-Next-E384-FP4-Local (base directa) | no disponible | 384 | no disponible | no disponible | Base sin el ajuste GRPO de este checkpoint |

No se dispone de datos de benchmarks ni especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a tamaño, configuración de expertos y licencia.

## Limitaciones y advertencias

- Derivado no oficial: no está producido ni respaldado por Alibaba ni por NVIDIA; el autor lo declara explícitamente.
- La aritmética CVSS no es fiable: entre las respuestas completadas, la coincidencia exacta con la implementación de referencia fue de ~4,5 % para CVSS3 y ~4,2 % para CVSS4. No debe describirse como un problema resuelto.
- Las métricas de comportamiento (CVSS3 del 39 % al 70 %, CVSS4 del 18 % al 60 %, recompensa de hallazgos de 0,609 a 0,917) son medidas sobre los propios prompts de entrenamiento, no un benchmark independiente.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no cuantificado; como todo modelo generativo, puede producir hallazgos o vectores plausibles pero incorrectos, especialmente en dominios especializados.
- Limitación idiomática: solo inglés y chino; sin soporte declarado de castellano.
- Restricciones de licencia: NVIDIA Open Model Agreement; revisar condiciones antes de uso comercial, especialmente por la cláusula de modelo derivado y las obligaciones de atribución.
- Dependencia de un parche específico de vLLM (`sitecustomize.py`) para el layout de pesos FP4/CSF/PLE; sin él el checkpoint no se sirve correctamente.
- Checkpoint de investigación con 0 descargas y 0 likes: sin validación independiente de la comunidad.
- GPQA con solo 198 preguntas: resultados ruidosos; las cifras de benchmarks son ejecuciones únicas.

## Enlaces

- Hugging Face: https://huggingface.co/ctech123/ctech-fle-gt
- Modelo base: https://huggingface.co/autotrust/Qwen3.8-Flash-Next-E384-FP4-Local
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Resultados detallados de benchmarks: `benchmark_results.json` (incluido en el repositorio)
- Resultados de comportamiento: `behavior_results.json` (incluido en el repositorio)
- Script de servicio: `serve_vllm.sh` (incluido en el repositorio)
- Parche vLLM: `vllm_patch/sitecustomize.py` (incluido en el repositorio)
