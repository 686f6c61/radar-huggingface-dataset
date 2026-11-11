# iapp/OpenThai2.1-Nemotron-3.5-Bolt-74B-A9B-NVFP4

## Resumen

OpenThai 2.1 Bolt 74B-A9B NVFP4 es una compilación cuantizada en NVFP4 del modelo OpenThai 2.1 Bolt, desarrollado por iApp Technology. El modelo base es una adaptación al tailandés de NVIDIA Nemotron 3.5 Bolt, un transformer híbrido con mezcla de expertos (MoE) y capas Mamba, del que hereda la arquitectura `nemotron_h_omni` y la capacidad de procesar imagen y texto. Esta versión NVFP4 reduce el peso de 150 GB a 47 GB, lo que permite desplegarlo en GPUs NVIDIA Blackwell como DGX Spark o B200, además de funcionar en H100 mediante el kernel Marlin de vLLM.

El modelo resuelve el problema de servir un modelo multimodal de 74.885 millones de parámetros totales (9 mil millones activos por token) en entornos con memoria limitada, manteniendo el rendimiento del original en tareas de razonamiento, matemáticas, código e instrucciones en tailandés e inglés. La cuantización se realizó con NVIDIA ModelOpt 0.46.0rc1 en modalidad post-training, sin entrenamiento consciente de cuantización, y calibrada con 256 conversaciones del propio dataset de entrenamiento.

Es relevante porque combina tres factores poco habituales: un modelo MoE multimodal adaptado a un idioma de bajos recursos como el tailandés, una cuantización de 4 bits en pesos y activaciones (NVFP4) con escalas FP8 por bloque de 16, y compatibilidad directa con vLLM mediante `trust-remote-code` y un parser de razonamiento específico. La licencia OpenMDW-1.1 permite uso comercial con condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h_omni` (transformer híbrido con MoE y capas Mamba; torre de visión RADIO) |
| Parametros totales | 74.885.081.096 (74,9 B) |
| Parametros activos | 9 B (A9B, mezcla de expertos) |
| Longitud de contexto | 40.960 tokens en la configuración de ejemplo de vLLM (`--max-model-len 40960`); máximo nativo no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits en pesos y activaciones de expertos, bloques de 16 con escalas FP8 y escala por tensor); FP8 estático por tensor en proyecciones Mamba, atención q/k/v/o y cabeza de salida; BF16 en proyecciones latentes de LatentMoE, router, conv1d, embeddings, norms, torre de visión y proyector; KV cache sin cuantizar |
| Idiomas soportados | Tailandés (th) e inglés (en) |
| Licencia | OpenMDW-1.1 (`license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | safetensors (transformers, `custom_code`); compatible con vLLM |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura `nemotron_h_omni`, un diseño híbrido que combina capas de atención con capas Mamba (modelos de espacio de estados) y una mezcla de expertos con 74,9 B de parámetros totales y 9 B activos por token. Incluye LatentMoE con proyecciones latentes, una torre de visión RADIO con su proyector, y una cabeza de salida compartida. La variante NVFP4 conserva en BF16 precisamente los componentes sensibles a la cuantización: proyecciones latentes del MoE, router, convoluciones 1D, embeddings, normalizaciones y todo el stack de visión.

La cuantización se aplicó con NVIDIA ModelOpt 0.46.0rc1 en modo post-training, reutilizando las decisiones de capa del propio Nemotron 3.5 Super VL NVFP4 de NVIDIA, del cual se comprimió Bolt. La calibración usó 256 conversaciones en tailandés e inglés extraídas de los datos de entrenamiento de OpenThai 2.1 Bolt, con hasta 2.048 tokens cada una y con el modo de razonamiento activado y desactivado. No se realizó entrenamiento consciente de cuantización (QAT). El resultado ocupa 47,0 GB: 38,2 GB de expertos, 5,2 GB de capas FP8, 1,7 GB de torre de visión y proyector, 1,1 GB de embeddings y 0,8 GB de otros tensores BF16.

## Capacidades

- Generación de texto conversacional en tailandés e inglés, con modo de razonamiento (thinking) activado por defecto y desactivable mediante `chat_template_kwargs`.
- Razonamiento multi-paso con traza separada de la respuesta final (parser `ultra_v3` en vLLM).
- Matemáticas: resolución de problemas aritméticos con traza de razonamiento (verificado en pruebas con cambio de moneda).
- Comprensión de imágenes: pipeline `image-text-to-text`; describe imágenes y responde preguntas sobre ellas en tailandés.
- Tool calling / function calling: soporte nativo en vLLM con `--enable-auto-tool-choice` y parser `qwen3_coder`.
- Capacidades multilingües limitadas a tailandés e inglés, incluyendo cambio de código (code-switching) entre ambos.
- Seguimiento de instrucciones (IFEval) en tailandés e inglés.
- Despliegue en vLLM con backend Mamba FlashInfer y atención FlashInfer.

## Casos de uso

- Atención al cliente en tailandés: el modelo gestiona conversaciones multi-turno con hasta 40.960 tokens de contexto y responde en tailandés natural, adecuado para centros de soporte en Tailandia. El modo thinking permite desactivarse para respuestas de baja latencia.
- Asistente multimodal de accesibilidad: descripción de imágenes en tailandés para usuarios con discapacidad visual, usando la torre de visión RADIO y el pipeline image-text-to-text.
- Automatización de back-office con tool calling: integración en vLLM con `qwen3_coder` para invocar APIs internas (consultas de saldo, cálculo de cambios, reservas) en flujos de agentes.
- Tutoría educativa en matemáticas: resolución paso a paso de problemas aritméticos con traza de razonamiento separada, útil para generar explicaciones pedagógicas en tailandés.
- Procesamiento de documentación bilingüe tailandés-inglés: resumen y extracción de información de documentos con cambio de código frecuente, aprovechando el rendimiento en code-switching (97,0 en la prueba interna).
- Despliegue en infraestructura Blackwell de bajo consumo: servir el modelo en una DGX Spark o B200 con 47 GB de pesos, sin necesidad de múltiples GPUs, para prototipos y entornos de desarrollo.
- Evaluación de calidad de instrucciones: uso del modelo como juez o generador en pipelines de evaluación de IFEval en tailandés, dado su rendimiento en seguimiento de instrucciones.

## Benchmarks y rendimiento

Resultados comparativos NVFP4 frente a BF16, con thinking desactivado y decodificación greedy, sobre dos H100 80 GB con vLLM v0.31.0. Δ es la diferencia pareada respecto a BF16 y SE su error estándar.

| Benchmark | NVFP4 | BF16 | Δ | SE |
|---|---|---|---|---|
| ThaiExam (565 preguntas) | 65,5 | 63,4 | +2,14 | 1,31 |
| OpenThaiEval (1.232) | 72,6 | 72,5 | +0,08 | 0,62 |
| IFEval-TH (215) | 68,4 | 72,1 | −3,72 | 2,54 |
| Code-switching (200) | 97,0 | 98,0 | −1,00 | 1,42 |
| MATH-500-TH (500) | 78,0 | 79,2 | −1,20 | 1,33 |
| MT-Bench-Thai (91 preguntas, juez OpenThai 2.0) | 5,31 | 5,38 | −0,07 | 0,16 |
| IFEval inglés (541) | 82,3 | 82,8 | −0,55 | 1,35 |
| MMLU-Redux inglés (5.700) | 89,3 | 89,5 | −0,23 | 0,31 |

Ninguna de las ocho diferencias supera el doble de su error estándar. La mayor caída es IFEval-TH (3,7 puntos) y la mayor subida es ThaiExam (2,1 puntos).

Pruebas de despliegue y velocidad:

| Hardware | Prueba | Resultado |
|---|---|---|
| 2× H100 80 GB (vLLM v0.31.0) | carga | 160 s, 22,7 GiB de pesos por GPU |
| 2× H100 80 GB | velocidad en un solo stream, thinking off | 190 tokens/s (la build FP8: 181 tokens/s) |
| DGX Spark | carga y respuesta en tailandés | no probado todavía |

## Requisitos de hardware

- VRAM estimada: 47,0 GB de pesos; con 2× H100 80 GB se reparten 22,7 GiB por GPU en tensor parallel 2. El KV cache no está cuantizado, por lo que la memoria adicional depende de la longitud de contexto configurada.
- GPUs recomendadas: NVIDIA Blackwell (B200, DGX Spark) para aprovechar la cuantización de activaciones a 4 bits; H100 80 GB funciona mediante el kernel Marlin de vLLM (pesos 4 bits, activaciones 16 bits).
- Cabe en una sola GPU Blackwell con memoria suficiente (sin `--tensor-parallel-size 2`). En H100 requiere al menos dos unidades para el reparto probado.
- Opciones de despliegue: vLLM v0.31.0 con `--trust-remote-code`, `--mamba-backend flashinfer`, `--mamba-cache-mode align`, `--attention-backend FLASHINFER` y `VLLM_USE_V2_MODEL_RUNNER=1`. No se documentan opciones para llama.cpp, Ollama ni TGI.
- Latencia y throughput: 190 tokens/s en un solo stream sobre 2× H100 con thinking off. No se publican datos de throughput agregado ni de latencia con thinking activado.
- La ruta de cuantización de activaciones a 4 bits en Blackwell no ha sido probada por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OpenThai 2.1 Bolt 74B-A9B NVFP4 (este) | 74,9 B totales / 9 B activos | 40.960 en configuración de ejemplo | OpenMDW-1.1 | Multimodal, tailandés-inglés, 47 GB |
| OpenThai 2.1 Bolt 74B-A9B (BF16) | 74,9 B totales / 9 B activos | no disponible | OpenMDW-1.1 | Modelo base sin cuantizar, 150 GB |
| OpenThai 2.1 Bolt 74B-A9B FP8 | 74,9 B totales / 9 B activos | no disponible | OpenMDW-1.1 | Build FP8, 181 tokens/s en 2× H100 |
| NVIDIA Nemotron 3.5 Super VL 120B-A12B NVFP4 | 120 B totales / 12 B activos | no disponible | no disponible | Modelo del que se comprimió Bolt; referencia de receta de cuantización |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, salvo la velocidad del build FP8 (181 tokens/s frente a 190 tokens/s del NVFP4).

## Limitaciones y advertencias

- Sesgos: no se documentan análisis de sesgo en la información disponible; al estar entrenado principalmente con datos en tailandés e inglés, el rendimiento fuera de esos idiomas no está garantizado.
- Riesgo de alucinación: no cuantificado en la información proporcionada; como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en modo thinking desactivado.
- Limitaciones de idioma: solo tailandés e inglés; el cambio de código entre ambos está soportado, pero no se documentan otros idiomas.
- Restricciones de licencia: OpenMDW-1.1 es una licencia con condiciones; es necesario revisar el texto completo en el enlace oficial antes de uso comercial. El modelo base es de NVIDIA (OpenMDW-1.1) y se debe consultar el repositorio principal para NOTICE, datos de entrenamiento y limitaciones.
- Caveat de producción: la cuantización de activaciones a 4 bits solo se aplica en GPUs Blackwell y esa ruta no ha sido probada por el autor; en H100 se ejecuta con activaciones de 16 bits mediante Marlin, por lo que el comportamiento puede diferir.
- El KV cache no está cuantizado, lo que limita el ahorro de memoria en contextos largos.
- El despliegue requiere `--trust-remote-code` y un parser de razonamiento externo (`ultra_v3_reasoning_parser.py`), lo que añade complejidad operativa.
- La prueba en DGX Spark no se ha realizado todavía.
- El modo thinking está activado por defecto; para respuestas directas hay que desactivarlo explícitamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iapp/OpenThai2.1-Nemotron-3.5-Bolt-74B-A9B-NVFP4
- Modelo base: https://huggingface.co/iapp/OpenThai2.1-Nemotron-3.5-Bolt-74B-A9B
- Receta de cuantización de referencia (NVIDIA): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Parser de razonamiento para vLLM: https://huggingface.co/iapp/OpenThai2.1-Nemotron-3.5-Bolt-74B-A9B-NVFP4/resolve/main/ultra_v3_reasoning_parser.py
- Recursos de la model card: https://huggingface.co/datasets/iapp/OpenThai2.0-model-card-assets
