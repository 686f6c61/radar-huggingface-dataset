# Raghav-Singhal/1pp-1.7b-asst-rawanneal-seed1234-sft

## Resumen

1pp-1.7b-asst-rawanneal-seed1234-sft es un modelo de investigación desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio EPFL DLAB. Se trata de un modelo de lenguaje de 1.66B parámetros con arquitectura Llama-style, entrenado bajo una condición experimental concreta: preentrenamiento sobre documentos originales seguido de un "cooldown" (enfriamiento) sobre conversaciones reescritas de esos mismos documentos, con pérdida únicamente en los turnos del asistente, y posteriormente un ajuste fino supervisado (SFT).

El modelo no es un asistente de propósito general, sino un artefacto científico diseñado para responder una pregunta de investigación: cuánto del efecto del preentrenamiento con conversaciones (1PP) se recupera si solo se aplica durante la fase de cooldown, en lugar de durante todo el preentrenamiento. Forma parte de un estudio de 3×3 (tres tamaños: 0.5B, 1B, 1.7B × tres condiciones de preentrenamiento) sobre los mismos 47.8M documentos fuente.

Esta variante es una réplica con semilla 1234 de la versión original (semilla 28), y su interés radica en permitir comparaciones controladas de varianza entre semillas. Es relevante para investigadores que estudian cómo el formato de datos de preentrenamiento afecta a las capacidades conversacionales de los modelos pequeños, y para quienes replican experimentos de pipelines de entrenamiento con Megatron y el optimizador Muon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador estilo Llama (transformer) |
| Parametros totales | 1.661.048.832 (≈1.66B) |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

La arquitectura es un decodificador transformer estilo Llama con 24 capas, dimensión oculta de 2.048, FFN de 8.192 con activación SwiGLU, 16 cabezas de atención y 4 cabezas KV (GQA, dimensión de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings sin atar (untied), sin sesgos y sin QK-norm. El tokenizador usa el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>` adicional.

El preentrenamiento consta de dos fases alineadas por pasos. Durante los primeros 28.600 pasos (hasta el pico de learning rate) se entrena sobre documentos originales DCLM-edu reconstruidos (el corpus original se perdió; la reconstrucción reproduce exactamente 31.717 de 31.777 pasos, con 139.055 tokens menos de 66,19B totales). En la fase de cooldown (últimos 3.177 pasos, con decaimiento lineal original) se entrena sobre las conversaciones 1PP reescritas de exactamente los documentos vistos en cada paso, con pérdida solo en los turnos del asistente. Se realizó una pasada sobre 47,8M documentos (66,2B tokens como documentos; 63,0B como conversaciones), con batch global de 512 × 4.096 tokens, enmascaramiento de atención entre documentos y packing best-fit. El optimizador es Muon (con shape scaling, matrix LR 0.005) con Adam para embeddings y normas, warmup de 2.000 pasos, decaimiento lineal al 1/100 en el último 10% y weight decay 0.1, en bf16.

El SFT se realizó durante una época sobre una mezcla de 400k conversaciones (`jkminder/model-raising-pb-100k-3c-mt-sft`, 98,5k multi-turno; `dlab-spp/sp-sft-normal-300k` sin duplicados, 271,6k; y 30k de `dlab-spp/sp-sft-safety-180k`), con la misma stack (Megatron, Muon, ChatML sin turno de sistema), matrix LR 0.002 y batch global de 128 × 4.096. La pérdida en SFT es solo sobre los turnos del asistente.

## Capacidades

- Generacion de texto conversacional en inglés mediante formato ChatML sin turno de sistema
- Gestion de conversaciones multi-turno (el corpus SFT incluye 98,5k conversaciones multi-turno con citas de constitución)
- Comportamiento alineado mediante SFT con componente de seguridad (muestra de 30k conversaciones de seguridad)
- Generacion con parada en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0)
- Compatibilidad con el chat template incluido en el repositorio para inferencia con transformers
- No hay evidencia de capacidades de tool calling, function calling, agentes, razonamiento multi-step, visión ni audio: no disponible

## Casos de uso

- Investigacion en preentrenamiento con datos conversacionales: permite comparar directamente cuánto efecto recupera un cooldown solo-conversaciones frente a un preentrenamiento 1PP completo (`1pp-1.7b-asst-seed1234-sft`) o un modelo base sin 1PP (`1pp-1.7b-raw-seed1234-sft`)
- Estudios de varianza entre semillas: al ser la réplica con semilla 1234 de `1pp-1.7b-asst-rawanneal-sft` (semilla 28), sirve para cuantificar la sensibilidad de los resultados a la inicialización
- Analisis de curriculos de datos alineados por pasos: el diseño step-aligned (cada paso de cooldown entrena sobre conversaciones de los documentos de ese mismo paso) es útil para estudiar el efecto del orden de los datos
- Replicacion de pipelines de entrenamiento: el modelo documenta un stack completo (Megatron, Muon, packing best-fit, enmascaramiento entre documentos) reproducible por otros investigadores
- Evaluacion de recetas de SFT en modelos pequeños: la matriz de LRs y el método de selección por held-out loss son aplicables a otros experimentos
- Verificacion de checkpoints: el modelo incluye verificación de pesos HF contra el checkpoint de Megatron por recomputación de pérdidas, útil como ejemplo de control de calidad en publicaciones de modelos

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye pérdidas de validación:

| Conjunto | Valor |
|---|---|
| Validacion preentrenamiento: texto de asistente | 1,513 (pérdida por token) |
| Validacion preentrenamiento: texto de usuario | 4,916 (pérdida por token) |
| Validacion preentrenamiento: texto de documento | 2,978 (pérdida por token) |
| Validacion SFT (tokens de asistente) | 1,872 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,3 GB solo para los pesos, más overhead de KV cache y activaciones; una GPU con 8 GB de VRAM es suficiente para inferencia con contexto completo de 4.096 tokens
- En fp16/bf16 cabe cómodamente en GPUs consumer como la RTX 3060 de 12 GB, la RTX 4060 Ti o superiores; con cuantización (no publicada oficialmente) cabría en GPUs de 4-6 GB
- No se requiere hardware de servidor (A100/H100) para inferencia; ese hardware solo sería necesario para reproducir el entrenamiento
- Despliegue: transformers (librería nativa), text-generation-inference (tag `endpoints_compatible` en Hugging Face), y presumiblemente compatible con llama.cpp/Ollama mediante conversión a GGUF (no disponible oficialmente en el repo)
- Latencia y throughput: no disponible

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Condicion | Licencia |
|---|---|---|---|---|
| 1pp-1.7b-asst-rawanneal-seed1234-sft (este) | 1,66B | 4.096 | Documentos + cooldown sobre conversaciones (asistente), semilla 1234 | Apache-2.0 |
| 1pp-1.7b-asst-rawanneal-sft | 1,66B | 4.096 | Misma receta, semilla 28 | Apache-2.0 |
| 1pp-1.7b-asst-seed1234-sft | 1,66B | 4.096 | 1PP completo (conversaciones durante todo el preentrenamiento) | Apache-2.0 |
| 1pp-1.7b-raw-seed1234-sft | 1,66B | 4.096 | Solo documentos originales, sin 1PP | Apache-2.0 |

La comparación relevante no es con modelos comerciales, sino entre las condiciones del estudio 1PP: este modelo permite aislar cuánto del efecto 1PP recupera un cooldown solo-conversaciones, frente al 1PP completo y al modelo raw. Todos los modelos de la colección comparten datos, orden de batches y receta de SFT, por lo que las diferencias de rendimiento son atribuibles a la condición de preentrenamiento y la semilla.

## Limitaciones y advertencias

- No es un asistente de proposito general: la propia model card lo advierte explícitamente; es un artefacto de investigación del proyecto 1PP (EPFL DLAB)
- Capacidades limitadas por tamaño: con 1,66B parámetros, el razonamiento complejo, las matemáticas y la generación de código serán notablemente inferiores a los de modelos de 7B o superiores
- Contexto corto: 4.096 tokens, insuficiente para documentos largos o conversaciones muy extensas
- Solo inglés: el modelo fue entrenado exclusivamente con datos en inglés; el rendimiento en otros idiomas, incluido el castellano, no está garantizado
- Sin turno de sistema: el modelo nunca vio un turno de sistema durante el entrenamiento; pasar uno en inferencia puede degradar el comportamiento
- Corpus de preentrenamiento reconstruido: 60 pasos del pretraining tienen un documento menos (139.055 tokens menos de 66,19B) y 36 documentos se aceptaron por coincidencia exacta de prefijo largo con diferencia residual de causa desconocida; 7 pasos del cooldown carecen de una conversación cuyo documento fuente falta
- Riesgo de alucinacion y sesgos: no disponible información específica, pero al tratarse de un modelo experimental sin evaluaciones publicadas de seguridad, no debe usarse en producción
- Uso comercial: la licencia Apache-2.0 lo permite, pero el carácter experimental del modelo lo hace inadecuado para entornos de producción
- Sin benchmarks publicados: no hay datos de MMLU, HumanEval u otras métricas estándar para evaluar su calidad frente a alternativas

## Enlaces

- Modelo: https://huggingface.co/Raghav-Singhal/1pp-1.7b-asst-rawanneal-seed1234-sft
- Coleccion 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Modelo base raw (pre-SFT): https://huggingface.co/Raghav-Singhal/1pp-1.7b-raw-seed1234-base
- Variante 1PP completa comparable: https://huggingface.co/Raghav-Singhal/1pp-1.7b-asst-seed1234-sft
- Modelo raw con SFT comparable: https://huggingface.co/Raghav-Singhal/1pp-1.7b-raw-seed1234-sft
- Replica original (semilla 28): https://huggingface.co/Raghav-Singhal/1pp-1.7b-asst-rawanneal-sft
- Logs de preentrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
