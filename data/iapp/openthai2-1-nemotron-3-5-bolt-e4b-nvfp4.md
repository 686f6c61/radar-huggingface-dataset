# iapp/OpenThai2.1-Nemotron-3.5-Bolt-E4B-NVFP4

## Resumen

OpenThai2.1-Nemotron-3.5-Bolt-E4B-NVFP4 es una compilación cuantizada en NVFP4 del modelo OpenThai 2.1 Bolt E4B, desarrollado por el equipo OpenThai (iApp Technology en colaboración con AIEAT, la asociación tailandesa de empresas de inteligencia artificial). Parte del modelo base NVIDIA Nemotron 3.5 Bolt E4B, que a su vez es un post-entrenamiento de Google Gemma-4-E4B-it, con 8.000 millones de parámetros totales y 4.000 millones efectivos, 42 capas y un vocabulario de 262.144 tokens. El modelo está afinado con LoRA para reforzar conocimiento en tailandés, identidad propia de OpenThai, respuestas en tailandés generadas por el propio modelo base y conversaciones con llamada a herramientas.

La relevancia de esta versión concreta reside en la cuantización: reduce el peso de 15,9 GB en BF16 a 10,3 GB mediante NVIDIA ModelOpt 0.48.0, aplicando NVFP4 (pesos y activaciones de 4 bits en bloques de 16 con escalas FP8) únicamente a las capas lineales del modelo de lenguaje. Las embeddings, las proyecciones de entrada por capa, la cabeza de salida y los codificadores de visión y audio se mantienen en BF16. Está pensada para GPUs NVIDIA Blackwell (DGX Spark, serie RTX 50, B200), aunque también se ha probado en H100 con el kernel Marlin de vLLM.

El modelo soporta tailandés e inglés, tiene una longitud de contexto de 64K tokens en el modelo base (probado a 32.768), admite entrada de imagen, texto y audio, y responde con el modo de razonamiento desactivado por defecto. Es el modelo inicial de ChindaBot y está liberado bajo licencia OpenMDW-1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Gemma-4-E4B (layout de Google Gemma-4-E4B-it, post-entrenado por NVIDIA); multimodal image-text-to-text con codificadores de visión y audio |
| Parametros totales | 5.995.992.352 (~6B en safetensors; la model card declara 8B totales / 4B efectivos) |
| Parametros activos | 4B efectivos (según model card) |
| Longitud de contexto | 64K tokens (modelo base); servido y probado a 32.768 |
| Tipos de cuantizacion | NVFP4 (4 bits en pesos y activaciones, bloques de 16 con escalas FP8); embeddings, proyecciones de entrada, cabeza de salida y codificadores visión/audio en BF16 |
| Idiomas soportados | Tailandés (th), inglés (en) |
| Licencia | OpenMDW-1.1 (heredada del modelo base); Gemma 4 subyacente bajo Apache 2.0 |
| Formato de pesos | safetensors (repo de 30,3 GB; pesos NVFP4 de 10,3 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Gemma-4-E4B en su variante post-entrenada por NVIDIA (Nemotron 3.5 Bolt E4B): 42 capas, vocabulario de 262.144 tokens y 8.000 millones de parámetros con 4.000 millones efectivos. Incluye codificadores de visión y audio que se mantienen intactos respecto al modelo de NVIDIA. El ajuste fino se realizó con LoRA de rango 64 y alpha 128 sobre las proyecciones de atención (q, k, v, o) y de MLP (gate, up, down) del modelo de lenguaje, durante una época, con tasa de aprendizaje 1e-4, y se fusionó en los pesos base a escala 1.0.

El conjunto de entrenamiento consta de 81.556 conversaciones (39,0 millones de tokens), todas con el modo de razonamiento desactivado, centradas en conocimiento tailandés, identidad de OpenThai, respuestas en tailandés escritas por el propio modelo base y diálogos con llamada a herramientas. La cuantización NVFP4 se aplicó con NVIDIA ModelOpt 0.48.0 usando el preset `NVFP4_W4A4_WEIGHT_MSE_FP8_SWEEP_CFG`, que elige escalas de bloque que minimizan el error de pesos, calibrado con 128 conversaciones tailandés/inglés del split de validación de hasta 1.024 tokens cada una. Esta es la segunda release (15 de noviembre de 2026); la primera (11 de noviembre de 2026) permanece en la revisión `a8c040ea0d5ed91a3212d345b9cb3a874d3d8e2f`.

## Capacidades

- Generación de texto conversacional en tailandés e inglés, con respuestas multi-turno.
- Razonamiento explícito opcional mediante modo thinking, activable con `chat_template_kwargs={"enable_thinking": true}` (desactivado por defecto).
- Llamada a herramientas y function calling, con parsers `gemma4` para tool-call y reasoning en vLLM.
- Entrada multimodal: imagen, texto y audio (codificadores de visión y audio heredados de NVIDIA, sin cambios).
- Capacidades de agente y razonamiento multi-paso a través del soporte de tool calling.
- Conocimiento específico de dominio tailandés e identidad de marca OpenThai.
- Evaluaciones específicas en tailandés: ThaiExam, OpenThaiEval e IFEval-TH.

## Casos de uso

- Atención al cliente en tailandés: el modelo gestiona conversaciones multi-turno con hasta 32.768 tokens de contexto probados, adecuado para historiales largos de soporte con conocimiento local tailandés.
- Asistente de marca OpenThai (ChindaBot): es el modelo inicial de ChindaBot, por lo que encaja directamente en despliegues de asistentes con identidad corporativa ya integrada.
- Automatización con herramientas: gracias al soporte de tool calling y a los parsers de vLLM, puede invocar APIs externas (por ejemplo, consultas meteorológicas, como se valida en las pruebas del autor) dentro de flujos de agente.
- Evaluación educativa y exámenes en tailandés: su rendimiento en ThaiExam (66,1 en NVFP4) lo hace utilizable en sistemas de práctica y corrección de pruebas tailandesas.
- Procesamiento multimodal local: al conservar los codificadores de visión y audio, puede emplearse en tareas de descripción de imágenes o transcripción combinada con texto, siempre que el despliegue lo permita.
- Despliegue en hardware Blackwell de consumo o estación de trabajo: con 10,3 GB de pesos NVFP4, es viable en DGX Spark y GPUs RTX 50-series para inferencia local con datos sensibles sin salir del equipo.
- Generación de contenido y respuestas en tailandés con contexto largo: útil para resumir o redactar documentos extensos en tailandés dentro de la ventana de 32K tokens probada.

## Benchmarks y rendimiento

Resultados publicados por el autor (thinking off, greedy, 4k tokens nuevos, en una H100 con vLLM v0.31.0), comparando NVFP4 frente a BF16:

| Benchmark | NVFP4 | BF16 | Delta | Error estándar |
|---|---|---|---|---|
| ThaiExam (565) | 66,1 | 67,3 | −1,21 | 1,31 |
| OpenThaiEval (1.232) | 67,1 | 68,0 | −0,89 | 0,78 |
| IFEval-TH (215) | 79,1 | 79,5 | −0,47 | 0,81 |

Ninguna de las tres caídas supera el doble de su error estándar, aunque las tres apuntan en la misma dirección. Con el preset por defecto de ModelOpt (escala del mayor peso del bloque), ThaiExam quedaba 3,4 puntos por debajo de BF16 (SE 1,5); la compilación publicada usa escalas que minimizan el error. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos NVFP4 ocupan 10,3 GB; con caché KV y overhead de servido, se recomienda al menos 16 GB de VRAM para contexto moderado.
- GPUs recomendadas: NVIDIA Blackwell (DGX Spark, RTX 50-series, B200) para aprovechar la cuantización de activaciones a 4 bits; también funciona en H100 con el kernel Marlin de vLLM (pesos de 4 bits, activaciones de 16 bits).
- Cabe en GPU de consumo: sí, en GPUs con 16 GB o más de VRAM; en DGX Spark el autor indica que aún no se ha probado la carga.
- Despliegue: vLLM v0.31.0 (probado por el autor, con `--max-model-len 16384`, `--enable-auto-tool-choice`, `--tool-call-parser gemma4` y `--reasoning-parser gemma4`); otros motores no se mencionan en la información disponible.
- Latencia y throughput: no disponibles; el autor solo reporta pruebas funcionales y de calidad, no métricas de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OpenThai2.1-Nemotron-3.5-Bolt-E4B-NVFP4 | ~6B safetensors (8B totales / 4B efectivos) | 64K (probado 32K) | OpenMDW-1.1 | Hugging Face, 270 descargas |
| NVIDIA Nemotron-3.5-Bolt-E4B-BF16 (modelo base) | 8B totales / 4B efectivos | 64K | OpenMDW-1.1 | Hugging Face (referencia del autor) |
| Google Gemma-4-E4B-it (origen) | 8B totales / 4B efectivos | no disponible en la información | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con modelos alternativos en la información proporcionada; la única comparación publicada es la del propio modelo frente a su versión BF16.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos específicos en la información disponible; al estar entrenado mayoritariamente con datos tailandeses e ingleses, el rendimiento fuera de esos idiomas no está garantizado.
- Alucinación: no se reportan evaluaciones de tasa de alucinación; como modelo de 4B efectivos, es esperable una fiabilidad limitada en conocimiento factual extenso.
- Contexto e idioma: el contexto probado es de 32.768 tokens aunque el modelo base soporta 64K; solo se soportan tailandés e inglés.
- Licencia: OpenMDW-1.1, heredada del modelo base, con la restricción adicional de que Gemma 4 subyacente está bajo Apache 2.0; conviene revisar los términos de OpenMDW-1.1 antes de uso comercial.
- Cuantización: la NVFP4 introduce una degradación pequeña pero consistente en las tres evaluaciones tailandesas; el autor recomienda usar BF16 si la memoria lo permite.
- Hardware: la ruta de activaciones a 4 bits en Blackwell no ha sido probada por el autor; en H100 se ejecuta con pesos de 4 bits y activaciones de 16 bits vía Marlin, lo que no aprovecha la aceleración FP4.
- Los pesos BF16 no están publicados todavía; solo está disponible esta compilación NVFP4.

## Enlaces

- Hugging Face: https://huggingface.co/iapp/OpenThai2.1-Nemotron-3.5-Bolt-E4B-NVFP4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Repositorio de assets de la model card: https://huggingface.co/datasets/iapp/OpenThai2.0-model-card-assets
- Revisión de la primera release: `a8c040ea0d5ed91a3212d345b9cb3a874d3d8e2f` (en el repositorio de Hugging Face del modelo)
