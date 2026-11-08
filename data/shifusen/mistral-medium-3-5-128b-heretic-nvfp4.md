# Shifusen/Mistral-Medium-3.5-128B-heretic-NVFP4

## Resumen

Mistral-Medium-3.5-128B-heretic-NVFP4 es una versión "abliterated" (decensurada) y cuantizada en NVFP4 del modelo denso Mistral Medium 3.5 128B de Mistral AI, publicada por el usuario Shifusen. El proceso de abliteración se realizó con Heretic v2.0.0 sobre los pesos en BF16 (previamente dequantizados desde el release FP8 original), y la cuantización W4A4 en formato NVFP4 se llevó a cabo con LLM Compressor v0.15.0. El objetivo es ofrecer un modelo de 128B parámetros con 256k de contexto y capacidades multimodales que responda sin los rechazos típicos del modelo alineado, en un formato de 80,3 GB apto para inferencia en GPUs Blackwell.

El modelo base, Mistral Medium 3.5, es el primer modelo "flagship merged" de Mistral: un denso de 128B parámetros que unifica instruction-following, razonamiento y código en un único conjunto de pesos, con ventana de 256k tokens, entrada multimodal (texto e imagen) y esfuerzo de razonamiento configurable por petición. Sustituye a Mistral Medium 3.1 y Magistral en Le Chat, y a Devstral 2 en el agente de código Vibe.

La relevancia de esta ficha radica en dos factores: por un lado, permite ejecutar un modelo de 128B en un solo nodo Blackwell gracias a la cuantización FP4 (80,3 GB frente a 255 GB en BF16); por otro, elimina las salvaguardas de rechazo del modelo original (de 92/100 a 5/100 rechazos en el conjunto de 100 prompts dañinos de Heretic), lo que tiene implicaciones legales y de seguridad importantes que se detallan en la sección de limitaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Mistral 3), con torre de visión y proyector multimodal; 88 capas de decoder de texto |
| Parámetros totales | 74.415.579.088 (según safetensors); el modelo base se anuncia como 128B |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantización | NVFP4 (W4A4): pesos FP4 (E2M1) en grupos de 16 con escalas de grupo FP8 (E4M3) y escala global FP32 por tensor; activaciones cuantizadas dinámicamente por grupo de 16. Vision tower, proyector multimodal, `embed_tokens` y `lm_head` se mantienen en BF16 |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn (24 idiomas declarados en la model card) |
| Licencia | other (el modelo base se publica bajo Modified MIT License; esta derivada hereda la designación "other" en Hugging Face) |
| Formato de pesos | safetensors en formato Hugging Face Transformers con compressed-tensors (`nvfp4-pack-quantized`); sin `consolidated.safetensors`, `params.json` ni `tekken.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 128B parámetros con 88 capas de decoder de texto, ventana de contexto de 256k tokens y una torre de visión entrenada desde cero para manejar tamaños y relaciones de aspecto variables. Mistral no publica el número de tokens de entrenamiento ni la composición del dataset. El modelo integra instruction-following, razonamiento y código en un único conjunto de pesos, con esfuerzo de razonamiento configurable por petición (modo de respuesta rápida frente a modo razonamiento con cómputo adicional en inferencia). Se publica además un modelo EAGLE para decodificación especulativa que acelera la inferencia en vLLM y SGLang.

El proceso de esta derivada tiene dos etapas. Primero, el release FP8 de Mistral se dequantizó a BF16 (peso FP8 × escala por tensor) para que Heretic pudiera operar sobre pesos sin cuantizar. Heretic ejecutó 100 trials de Optuna con su modificador Arbitrary-Rank Ablation (ARA) sobre los pesos `o_proj` de atención y `down_proj` del MLP; se seleccionó el trial 96 y se fusionó en los pesos. Los parámetros del trial fueron: `start_layer_index` 20, `end_layer_index` 64, `preserve_good_behavior_weight` 0,7868, `steer_bad_behavior_weight` 0,0002, `overcorrect_relative_weight` 0,9711 y `neighbor_count` 15. Después, LLM Compressor cuantizó a NVFP4 todas las capas Linear de las 88 capas del decoder de texto, usando 32 muestras de calibración (46.695 tokens, máximo 2.048 por muestra) del dataset `Shifusen/nemotron-calibration-reasoning`, renderizadas con la plantilla de chat del modelo; 26 muestras incluyen razonamiento en `[THINK]...[/THINK]` con `reasoning_effort: "high"` y 6 sin razonamiento.

## Capacidades

- Generación de texto, razonamiento e instruction-following en un único conjunto de pesos, con modo de razonamiento activable por petición.
- Generación y comprensión de código; el modelo base sustituye a Devstral 2 en el agente de código Vibe de Mistral.
- Entrada multimodal: acepta texto e imagen, con salida de texto; la torre de visión se mantiene en BF16 tras la cuantización.
- Function calling nativo y salida JSON, con capacidades agénticas orientadas a flujos multi-paso.
- Esfuerzo de razonamiento configurable (`reasoning_effort`: "high", "none", etc.), con bloques `[THINK]...[/THINK]`.
- Multilingüe en 24 idiomas, incluidos español, francés, alemán, italiano, portugués, chino, japonés, coreano y árabe.
- Fuerta adherencia a system prompts.
- Ventana de contexto de 256k tokens para documentos largos y conversaciones multi-turno extensas.
- Comportamiento decensurado: reducción de rechazos de 92/100 a 5/100 en el conjunto de prompts dañinos de Heretic.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de la abliteración sobre la distribución de respuestas (KL de 0,0138 frente al original en prompts inocuos) y comparar el comportamiento con el modelo alineado en tareas controladas.
- Atención al cliente automatizada: la ventana de 256k tokens permite mantener historiales de conversación muy largos y adjuntar documentación extensa; el modo de respuesta rápida reduce la latencia en consultas simples.
- Generación de código en producción: el function calling nativo y la salida JSON permiten integrar el modelo en pipelines de CI/CD para revisión de parches, generación de tests o resolución de issues, con razonamiento activable en tareas complejas.
- Análisis de documentos con imágenes: la entrada multimodal permite procesar facturas, capturas de pantalla o diagramas junto con texto en un único contexto, útil para extracción de datos estructurados.
- Agentes autónomos multi-paso: el soporte de tool calling y el razonamiento configurable por petición permiten orquestar flujos agénticos donde el modelo decide cuándo invocar herramientas y cuándo razonar en profundidad.
- Despliegue en un solo nodo Blackwell: la cuantización NVFP4 reduce el peso a 80,3 GB, lo que permite servir un modelo de 128B en GPUs B200 o GB200 con W4A4 nativo, sin necesidad de multi-nodo.
- Generación de contenido creativo sin restricciones de rechazo: escritura de ficción, guiones o material editorial donde el modelo alineado rechazaría temáticas sensibles; requiere revisión humana por las implicaciones de la abliteración.

## Benchmarks y rendimiento

Los datos disponibles corresponden al modelo en BF16 **antes** de la cuantización NVFP4. El checkpoint NVFP4 no ha sido evaluado todavía en rechazos, divergencia KL ni MMLU.

| Métrica | Este modelo (BF16, pre-cuantización) | Modelo original |
|---|---|---|
| Rechazos (100 prompts dañinos de Heretic) | 5/100 | 92/100 |
| Divergencia KL frente al original (prompts inocuos) | 0,0138 | 0 (por definición) |
| MMLU (lm-evaluation-harness, 14.042 preguntas) | 0,8377 ± 0,0030 | no medido |

No se han publicado resultados de benchmarks del checkpoint NVFP4 en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 80,3 GB para los pesos en NVFP4, más overhead de activaciones, caché KV y el resto de componentes en BF16 (torre de visión, proyector, `embed_tokens`, `lm_head`). Para contexto de 256k se necesita memoria adicional significativa para la caché KV.
- GPU recomendadas: NVIDIA Blackwell (B200, GB200) para inferencia W4A4 NVFP4 nativa; el formato requiere estas arquitecturas.
- GPU consumer: no cabe en GPUs consumer de 24 GB (RTX 4090) ni en 48 GB (RTX 6000 Ada) por el tamaño de pesos y el requisito de NVFP4 nativo.
- Opciones de despliegue: vLLM en modo Hugging Face por defecto (detecta la cuantización desde `config.json`); los flags `--tokenizer-mode mistral`, `--config-format mistral` y `--load-format mistral` no funcionan con este repositorio. SGLang compatible con el modelo base. El modelo EAGLE del base puede usarse para decodificación especulativa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Shifusen/Mistral-Medium-3.5-128B-heretic-NVFP4 | 74,4B (safetensors) / 128B anunciados | 256k | NVFP4 W4A4 | other (base: Modified MIT) | Abliterated; 5/100 rechazos; MMLU 0,8377 en BF16 |
| mistralai/Mistral-Medium-3.5-128B | 128B | 256k | FP8 (release oficial) | Modified MIT | Modelo base alineado; 92/100 rechazos; sin MMLU publicado |
| nvidia/Mistral-Medium-3.5-128B-NVFP4 | 84B (según la card) | 256k | NVFP4 (Model Optimizer) | no disponible en la búsqueda | Cuantización NVFP4 del base sin abliterar |
| mbehr90/Mistral-Medium-3.5-128B-nvfp4 | no disponible | 256k | NVFP4 | no disponible en la búsqueda | Otra cuantización NVFP4 del base |

## Limitaciones y advertencias

- Modelo decensurado: la abliteración reduce los rechazos a 5/100 en prompts dañinos, lo que implica un riesgo elevado de generar contenido dañino, ilegal o inseguro. No es apto para despliegues públicos sin filtros adicionales.
- El checkpoint NVFP4 no ha sido evaluado: los datos de rechazos, KL y MMLU corresponden al BF16 pre-cuantización; se desconoce la degradación introducida por la cuantización W4A4.
- La licencia es "other" en Hugging Face, heredada de la Modified MIT License del modelo base; conviene revisar los términos exactos antes de un uso comercial, especialmente por la modificación de pesos.
- Requiere GPU Blackwell para inferencia NVFP4 nativa; no es desplegable en hardware anterior sin conversión.
- El repositorio no incluye `consolidated.safetensors`, `params.json` ni `tekken.json`, por lo que las instrucciones de despliegue de Mistral con flags `mistral` no aplican.
- Riesgo de alucinación inherente a modelos de lenguaje; el modo de razonamiento puede mitigarlo parcialmente pero no lo elimina.
- La model card advierte de un bug en la configuración original de Transformers que degradaba el rendimiento en contexto largo, corregido en un commit posterior; los GGUFs generados con la configuración anterior están afectados.
- Sesgos conocidos del modelo base no documentados en la información disponible; la abliteración puede alterar la distribución de respuestas más allá de los rechazos.
- Soporte de 24 idiomas declarado, pero el rendimiento por idioma no está cuantificado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shifusen/Mistral-Medium-3.5-128B-heretic-NVFP4
- Modelo base: https://huggingface.co/mistralai/Mistral-Medium-3.5-128B
- Modelo EAGLE del base: https://huggingface.co/mistralai/Mistral-Medium-3.5-128B-EAGLE
- Blog de Mistral sobre Medium 3.5: https://mistral.ai/news/vibe-remote-agents-mistral-medium-3-5
- Heretic: https://github.com/p-e-w/heretic
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- Dataset de calibración: https://huggingface.co/datasets/Shifusen/nemotron-calibration-reasoning
- Cuantización NVFP4 de NVIDIA: https://huggingface.co/nvidia/Mistral-Medium-3.5-128B-NVFP4
- Cuantización NVFP4 alternativa: https://huggingface.co/mbehr90/Mistral-Medium-3.5-128B-nvfp4
