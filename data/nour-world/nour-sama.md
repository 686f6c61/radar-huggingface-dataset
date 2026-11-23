# nour-world/nour-sama

## Resumen

Nour-Sama (`nour-world/nour-sama`) es un modelo de reconocimiento fonético del árabe coránico orientado a la verificación de reglas de Tajweed. Lo desarrolla el colectivo `nour-world` como una destilación tipo Squeezeformer del modelo `Quran-Lab/TajweedFormer V4` (versión `4.0.0`), entrenada a partir del SDK oficial de TajweedFormer y de la supervisión fonética de `quran-g2p` (conjunto de tokens `tj3`). Resuelve un problema muy específico: transcribir fonemas coránicos y detectar errores de recitación (madd, ghunna, qalqalah, tafkheem) con marcas temporales de 20 ms.

Técnicamente es un Squeezeformer con estructura de U-Net temporal de 19 bloques (`d_model=384`, `n_heads=6`, `d_ff=896`, `conv_kernel=31`) con 47,96 millones de parámetros. Funciona en dos modos: streaming (ventanas de contexto de 160, 320 o 480 ms) y bidireccional completo. Se distribuye como artefactos ONNX (INT8 de 50,41 MB y FP32 de 183,63 MB) y alcanza un RTF de 0,29407x en un solo hilo de CPU, es decir, unas 3,4 veces más rápido que el tiempo real.

Su relevancia actual es acotada pero clara: cubre un nicho (recitación coránica asistida por máquina) con un modelo pequeño, desplegable en CPU y con licencia restrictiva. No es un modelo de lenguaje general ni compite en tareas de razonamiento o generación de texto; es un reconocedor acústico-fonético especializado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Temporal U-Net Squeezeformer (19 bloques, `d_model=384`, `n_heads=6`, `d_ff=896`, `conv_kernel=31`) |
| Parámetros totales | 47.964.145 (47,96 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de 160 ms (`c8_l64`), 320 ms (`c16_l64`), 480 ms (`c24_l72`, `c24_l256`) y modo `full` bidireccional |
| Tipos de cuantización | INT8 dinámico (ONNX) y FP32 (ONNX) |
| Idiomas soportados | Árabe (recitación coránica, fonemas `tj3`) |
| Licencia | Quran-Lab No-Profit License 1.2 (NPL-1.2), con cláusula Share-Alike |
| Formato de pesos | ONNX (`nour_sama_v1.int8.onnx`, `nour_sama_v1.onnx`) |

## Arquitectura y entrenamiento

El backbone es un Squeezeformer (Kim et al., NeurIPS 2022) con topología de U-Net temporal. La secuencia se procesa en tres tramos: 6 bloques pre-squeeze a 20 ms (50 Hz), una capa `TemporalSqueeze` que reduce la tasa a 40 ms (25 Hz), 10 bloques de tronco a 40 ms, una `TemporalUnsqueeze` que vuelve a 20 ms con skip connection aprendida (`ScaleLayer`) y 3 bloques de refinamiento a 20 ms. Finalmente, una fusión de doble granularidad (`DualGranularityFusion20To40`) proyecta a `log_probs` con información de duración.

El entrenamiento parte de `Quran-Lab/TajweedFormer V4` mediante destilación, usando el SDK oficial de TajweedFormer, supervisión fonética de `quran-g2p` (tokens `tj3`), destilación cruzada estudio-teléfono (*Cross-Channel Studio-to-Phone Distillation*), empalme de palabras entre aleyas para evitar memorización (*Anti-Memorization Cross-Ayah Word Splicing*) y síntesis de errores acústicos plantados (*Acoustic Planted-Mistake Synthesis*). El modelo expone 12 cabezas multirresolución: `log_probs`, `inter1_log_probs`, `inter4_log_probs` (40 ms, 38 tokens `tj3`); `id_log_probs` y `timing_log_probs` (20 ms, 38 tokens `tj3`); y las cabeceras auxiliares `gem` (2), `attr_tafkheem` (3), `attr_ghunna` (5), `attr_qalqalah` (3), `attr_face` (4), `boundary` (1) y `conf` (1) a 20 ms.

## Capacidades

- Reconocimiento de fonemas coránicos en notación `tj3` (38 tokens) a 20 ms y 40 ms.
- Medición de tiempos de *madd harakat* con resolución de 20 ms.
- Verificación de reglas de Tajweed: `tafkheem`, `ghunna`, `qalqalah` y `face`.
- Detección de límites (*boundary*) y puntuación de confianza (`conf`) por unidad.
- Modo streaming con ventanas de 160, 320 y 480 ms, apto para inferencia en tiempo real.
- Modo bidireccional `full` para evaluación offline.
- Inferencia en CPU en un solo hilo con INT8 (RTF 0,29407x).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo acústico, no generativo.
- Capacidad multilingüe limitada al árabe coránico.

## Casos de uso

- Corrección de recitación en tiempo real: el modo streaming con ventanas de 160–480 ms permite señalar errores de `ghunna` o `qalqalah` mientras el alumno recita, con latencia compatible con un solo hilo de CPU.
- Aplicaciones móviles de aprendizaje de Tajweed: el artefacto INT8 de 50,41 MB y el RTF de 0,29407x hacen viable la inferencia en dispositivos sin GPU.
- Evaluación automática de exámenes de recitación: el modo `full` bidireccional y las cabeceras `conf` y `boundary` permiten puntuar una recitación completa contra reglas de Tajweed.
- Investigación en fonética árabe: la salida `timing_log_probs` a 20 ms facilita estudios de duración de *madd* y de alineamiento fonético.
- Preprocesado para pipelines de búsqueda coránica por audio: la transcripción `tj3` sirve como índice fonético para localizar aleyas o palabras.
- Herramientas de accesibilidad para personas con dificultades auditivas que necesiten seguir una recitación con marcas de reglas.
- Docencia asistida: integración en plataformas de aprendizaje para generar informes por aleya sobre errores recurrentes de pronunciación.

## Benchmarks y rendimiento

Los únicos datos publicados son la comparación directa con `TajweedFormer V4` en la model card:

| Métrica | TajweedFormer V4 | Nour-Sama |
|---|---:|---:|
| Checker Score (`0.5 * left_alone + 0.5 * pinpoint`) | 53,29 | 35,8 |
| Left Alone (%) | 87,69 % | 43,08 % |
| Pinpoint Overall (%) | 18,89 % | 28,52 % |
| Pinpoint `long_short` (%) | 12,22 % | 27,78 % |
| Studio PER (%) | 0,01 % | 1,56 % |
| Phone PER (%) | 0,85 % | 3,75 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la práctica; el modelo está pensado para CPU. En GPU, el artefacto INT8 ocupa 50,41 MB y el FP32 183,63 MB, por lo que cabe en cualquier GPU con más de 1 GB de memoria.
- GPU recomendadas: cualquiera con soporte ONNX Runtime (RTX 4090, A100, H100) si se busca latencia mínima; no requiere GPU de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU.
- Opciones de despliegue: ONNX Runtime (CPU INT8 o FP32), con soporte de ejecución en un solo hilo. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: RTF de 0,29407x en un solo hilo de CPU con INT8, equivalente a 3,4 veces más rápido que el tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nour-Sama | 47,96 M | 160–480 ms (streaming) / full | Squeezeformer U-Net temporal, fonemas `tj3` y Tajweed | NPL-1.2 (no lucrativa, Share-Alike) | Hugging Face (ONNX) |
| TajweedFormer V4 | No disponible | No disponible | Modelo docente del que se destila Nour-Sama | No disponible | Referenciado en la model card |
| Alternativas de ASR árabe general | No disponible | No disponible | ASR genérico (no específico de Tajweed) | No disponible | No disponible |

No se dispone de datos suficientes para comparar con otros modelos de reconocimiento fonético coránico; la información proporcionada solo permite la comparación con TajweedFormer V4.

## Limitaciones y advertencias

- Rendimiento inferior a su modelo docente en la métrica principal: Checker Score de 35,8 frente a 53,29 de TajweedFormer V4, y Left Alone del 43,08 % frente al 87,69 %.
- Mayor tasa de error fonético que el docente: Phone PER del 3,75 % frente al 0,85 %, y Studio PER del 1,56 % frente al 0,01 %.
- Ámbito muy restringido: solo árabe coránico con notación `tj3`; no es un modelo de lenguaje general ni sirve para otras tareas de NLP.
- Licencia NPL-1.2 con cláusula Share-Alike: prohíbe expresamente cobrar por el modelo, por el acceso a él o por cualquier funcionalidad que lo utilice. Requiere revisión legal antes de cualquier uso en producción comercial.
- Riesgo de alucinación en el sentido de falsos positivos o negativos en la detección de errores de Tajweed; la cabecera `conf` debe usarse para filtrar predicciones de baja confianza.
- Sin datos publicados sobre sesgos demográficos o de estilo de recitación (por ejemplo, diferencias entre escuelas de recitación).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación externa muy limitado.
- El modelo se distribuye únicamente en ONNX; no hay pesos en safetensors ni GGUF, lo que limita su uso en ecosistemas fuera de ONNX Runtime.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nour-world/nour-sama
- Licencia NPL-1.2 (referenciada en el repositorio): https://huggingface.co/nour-world/nour-sama/blob/main/LICENSE
- Squeezeformer (Kim et al., NeurIPS 2022): no disponible en la información proporcionada
- Repositorio de `Quran-Lab/TajweedFormer`: no disponible en la información proporcionada
- `quran-g2p`: no disponible en la información proporcionada
- Demos o papers adicionales: no disponible en la información proporcionada
