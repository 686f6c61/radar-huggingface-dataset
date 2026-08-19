# OsaurusAI/Ornith-1.5-35B-A3B-JANG_2L

## Resumen

Ornith-1.5-35B-A3B-JANG_2L es un bundle MLX cuantizado del modelo Ornith-1.5-35B-A3B, desarrollado por OsaurusAI mediante la técnica de cuantización JANG de Jinho Jang. El modelo base, creado por Ornith AI, es un VLM agéntico de codificación y razonamiento que combina una arquitectura híbrida de atención lineal gated-delta y atención completa (proporción 3:1), con una torre de visión de 27 capas y soporte nativo de vídeo. Con 35 mil millones de parámetros en configuración MoE (3 mil millones activos) y una ventana de contexto de 262 144 tokens, está diseñado para tareas de razonamiento, agente y codificación.

La relevancia de este bundle radica en que permite ejecutar un modelo de 35B MoE en hardware Apple Silicon con cuantización mixta de 3 a 8 bits, manteniendo capacidades de razonamiento, visión y vídeo. El proceso de cuantización JANG emplea tres métodos de calibración (asignación por traza de Hessiana, refit imatrix y escalado AWQ) sobre una única pasada de captura, logrando una velocidad de decodificación de 48,4 tokens por segundo en un chip M5 Max. El bundle incluye el head MTP nativo para decodificación especulativa y dos presets de muestreo (general y coding), siendo este último el predeterminado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_moe` / `Qwen3_5MoeForConditionalGeneration` (híbrida gated-delta linear attention + full attention 3:1) |
| Parametros totales | 35 000 000 000 (MoE) / 5 032 894 512 en pesos cuantizados safetensors |
| Parametros activos | 3 000 000 000 (A3B) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | Mixta 3-bit, 4-bit, 5-bit y 8-bit (distribución: 235 tensores a 3-bit, 891 a 4-bit, 8 a 5-bit, 240 a 8-bit) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B emplea una arquitectura híbrida que combina atención lineal gated-delta con atención completa en proporción 3:1, sobre una base de 40 capas con hidden size de 2048 y 256 expertos enrutados. Incluye una torre de visión de 27 capas y soporte nativo de vídeo, con procesadores de preprocesado específicos para imagen y vídeo incluidos en el bundle. El razonamiento (thinking) está activado por defecto y es conmutable, aunque el modo desactivado prefija un bloque de pensamiento vacío en lugar de eliminarlo. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de RLHF o DPO en la documentación proporcionada.

La cuantización JANG aplicada por OsaurusAI utiliza tres métodos de calibración sobre una única pasada de captura: asignación de bits por traza de Hessiana medida por módulo (no por nombre de tensor), refit imatrix con ajuste afín ponderado por activaciones (error relativo medio de 0,1457) y escalado de canales salientes AWQ con alpha 0,15 absorbido en las normas RMSNorm. Los tensores cuyas dimensiones de entrada no son divisibles por el tamaño de grupo de MLX (las 27 capas `linear_fc2` de visión con 4304 características) se mantienen en fp16.

## Capacidades

- Generación de texto y razonamiento multi-step con modo thinking activado por defecto.
- Codificación agéntica: soporta tool calling mediante el parser `qwen3_coder` y está optimizado para tareas de agente (SWE-bench Verified 79, Terminal-Bench 2.1 67,8 según la model card).
- Visión: procesamiento de imágenes con torre de visión de 27 capas (pipeline `image-text-to-text`).
- Vídeo: soporte nativo verificado de extremo a extremo con `video_preprocessor_config.json`.
- Decodificación especulativa: preserva el head MTP nativo (2341 tensores `mtp.*`), con recomendación de 1 draft por paso en Apple Silicon.
- Multilingüe: solo inglés declarado en la model card.
- Audio: no soportado. El tokenizador define tokens `<|audio_start|>`, `<|audio_end|>` y `<|audio_pad|>`, pero el modelo carece de `audio_config` y de pesos de torre de audio; son tokens vestigiales.

## Casos de uso

- Asistente de programación agéntico en local: el modelo puede gestionar tareas de codificación multi-paso con tool calling, integrándose en flujos de trabajo de desarrollo sobre Apple Silicon gracias a su velocidad de decodificación de 48,4 tok/s en M5 Max.
- Razonamiento con contexto largo: su ventana de 262 144 tokens permite analizar repositorios completos o documentación extensa en una sola pasada, útil para revisión de código y refactorización.
- Análisis de imágenes y vídeo: la torre de visión de 27 capas y el soporte nativo de vídeo permiten describir, resumir o extraer información de contenido visual en entornos sin GPU dedicada.
- Agente autónomo de terminal: con el preset de codificación (temperatura 0,6, sin penalización de presencia) y el parser `qwen3_coder`, puede ejecutar comandos, leer salidas y iterar sobre errores en tareas de administración de sistemas.
- Desarrollo de herramientas de productividad: integración en editores de código o IDEs para autocompletado, generación de tests y documentación, aprovechando el modo thinking para razonar antes de responder.
- Investigación en eficiencia de cuantización: el bundle sirve como referencia para estudiar el impacto de la cuantización JANG (Hessian-trace, imatrix, AWQ) en modelos MoE híbridos con atención lineal.

## Benchmarks y rendimiento

La model card del bundle reporta los siguientes datos del modelo base, no del artefacto cuantizado:

| Benchmark | Resultado |
|---|---|
| SWE-bench Verified | 79 |
| Terminal-Bench 2.1 | 67,8 |
| Velocidad de decodificación (M5 Max) | 48,4 tok/s |

No se han publicado resultados de benchmarks específicos para el bundle cuantizado en la información disponible. Tampoco se dispone de resultados de MMLU, HumanEval, GSM8K u otros benchmarks generales en la documentación proporcionada.

## Requisitos de hardware

- Memoria: el repositorio ocupa 17,6 GB en disco (16,41 GiB), por lo que se requiere al menos esa cantidad de memoria unificada en Apple Silicon para cargar el modelo completo.
- GPU recomendadas: Apple Silicon con memoria unificada de 32 GB o superior (el rendimiento reportado de 48,4 tok/s corresponde a un chip M5 Max).
- Compatibilidad: diseñado exclusivamente para MLX; no se menciona soporte para CUDA o ROCm en este bundle.
- Opciones de despliegue: MLX (librería principal), con posibilidad de usar el modelo base original en vLLM o Transformers si se requiere despliegue en GPU NVIDIA.
- Latencia y throughput: 48,4 tokens por segundo en decodificación con M5 Max; no se proporcionan datos de prefill ni de otros chips.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 35B MoE (3B activos) | 262 144 | MIT | VLM agéntico de codificación y razonamiento |
| Ornith-1.5-397B MoE | 397B MoE | no disponible | MIT | Escala frontier de la misma familia |
| Ornith-1.5-9B Dense | 9B dense | no disponible | MIT | Versión compacta para edge |
| Ornith-1.0-35B-JANG_4M | 35B MoE | no disponible | MIT | Versión anterior cuantizada por OsaurusAI |

No se dispone de comparativas con modelos de otras familias (como Qwen3.8, mencionado en la model card) con datos de rendimiento verificables en la información proporcionada.

## Limitaciones y advertencias

- Audio no soportado: los tokens de audio del tokenizador son vestigiales; el modelo no tiene torre de audio ni pesos asociados.
- Solo inglés: la model card declara únicamente el idioma inglés; no se garantiza rendimiento en otros idiomas.
- Razonamiento por defecto: el modo thinking está activado por defecto y el modo desactivado prefija un bloque de pensamiento vacío, lo que puede confundir a parsers que solo comprueben la presencia del bloque.
- Cuantización agresiva: la distribución de bits incluye 235 tensores a 3-bit, lo que puede degradar la calidad en tareas de precisión numérica o razonamiento complejo; no se han publicado métricas de degradación.
- Sin datos de entrenamiento: no se ha proporcionado información sobre el dataset, el número de tokens de entrenamiento ni el proceso de alineación (RLHF/DPO), lo que limita la evaluación de sesgos.
- Dependencia de Apple Silicon: el bundle está optimizado para MLX; su uso en otras plataformas requiere convertir los pesos o usar el modelo base original.
- Sin benchmarks independientes: los resultados de SWE-bench y Terminal-Bench provienen del modelo base, no del artefacto cuantizado, y no se han verificado de forma independiente.

## Enlaces

- Bundle cuantizado: https://huggingface.co/OsaurusAI/Ornith-1.5-35B-A3B-JANG_2L
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Colección Ornith-1.5: https://huggingface.co/collections/ornith-ai/ornith-15
- Página oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Guía de Ornith AI: https://ornith.online/
- Sitio de Ornith AI: https://ornith.ai/
- Bundle anterior (Ornith-1.0-35B-JANG_4M): https://huggingface.co/OsaurusAI/Ornith-1.0-35B-JANG_4M
