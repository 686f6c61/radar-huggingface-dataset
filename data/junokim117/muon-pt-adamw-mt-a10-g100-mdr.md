# junokim117/muon-PT-adamw-MT-a10-g100-mdr

## Resumen

muon-PT-adamw-MT-a10-g100-mdr es un checkpoint de investigación publicado por el usuario junokim117 en Hugging Face. Se trata del modelo base Muon PT (arquitectura Qwen2, 494 millones de parámetros) tras un proceso de *midtraining* de 10.000 pasos sobre 20,97 mil millones de tokens, empleando el optimizador AdamW sobre los conjuntos de datos DCLM y FineMath-4plus. El objetivo declarado es reproducir los resultados del artículo arXiv 2610.29348 con Megatron-LM, por lo que su interés es fundamentalmente académico y experimental, no comercial.

El modelo pertenece a la familia Qwen2 según los metadatos de Hugging Face (tag `qwen2`), con pipeline de generación de texto y pesos en formato safetensors. El nombre codifica las decisiones de entrenamiento: `muon-PT` (checkpoint preentrenado con el optimizador Muon), `adamw` (optimizador usado en el midtraining), `MT` (midtraining), `a10` (posiblemente proporción de datos), `g100` (pasos finales) y `mdr` (mezcla de datos o *mixture decay ratio*).

Su relevancia radica en que documenta una receta concreta de midtraining con mezcla curricular de datos matemáticos (FineMath representa el 10 % del presupuesto de tokens, y el 100 % en los últimos 1.000 pasos) y un decaimiento lineal del *learning rate* de 5e-4 a 1e-5. Las pérdidas finales reportadas son 2,9597 en DCLM y 1,5747 en FineMath sobre un subconjunto de 32 millones de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos originales en safetensors; compatible con cuantizacion estandar de transformers/GGUF, no verificada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2 con 494 millones de parámetros. No se dispone de información detallada sobre el número de capas, dimensión oculta, cabezas de atención ni longitud de contexto nativa, más allá de lo que implica la arquitectura Qwen2 estándar. El checkpoint parte de `junokim117/muon-PT`, un modelo preentrenado con el optimizador Muon, y se somete a un midtraining de 10.000 pasos (20,97 mil millones de tokens) con AdamW.

La receta de datos combina DCLM y FineMath-4plus, con FineMath representando el 10 % del presupuesto total de tokens. Los últimos 1.000 pasos se entrenan exclusivamente con FineMath, lo que constituye una estrategia de *curriculum* orientada a reforzar capacidades matemáticas al final del entrenamiento. El *learning rate* se mantiene en 5e-4 durante 9.000 pasos y decae linealmente hasta 1e-5. El entrenamiento se realizó con Megatron-LM como reproducción del artículo arXiv 2610.29348. Las pérdidas finales sobre un subconjunto de 32 millones de tokens fueron 2,9597 en DCLM y 1,5747 en FineMath.

## Capacidades

- Generación de texto autoregresiva (pipeline `text-generation`).
- Conversación multi-turno (tag `conversational`).
- Razonamiento matemático reforzado por el midtraining con FineMath-4plus.
- Compatible con Text Generation Inference (tag `text-generation-inference`) y endpoints de Hugging Face.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados en la model card).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Reproducción de experimentos académicos: sirve como checkpoint de referencia para validar la receta de midtraining descrita en arXiv 2610.29348, comparando pérdidas en DCLM y FineMath con las reportadas (2,9597 y 1,5747).
- Investigación sobre optimizadores: permite estudiar el efecto de cambiar de Muon (preentrenamiento) a AdamW (midtraining) en un modelo de 494M parámetros, con un presupuesto de 20,97B tokens documentado.
- Estudio de currículos de datos: el cambio progresivo hacia FineMath (10 % global, 100 % en los últimos 1.000 pasos) ofrece un caso concreto para analizar cómo afecta la mezcla final de datos a las capacidades matemáticas.
- Fine-tuning experimental en dominios matemáticos: al estar entrenado con FineMath-4plus, es un punto de partida razonable para ajuste supervisado en tareas de razonamiento numérico, siempre con validación propia.
- Prototipado de pipelines de generación de texto: al ser un modelo pequeño (494M parámetros, repo de 1 GB), cabe en GPUs de consumo y permite iterar rápidamente en entornos de desarrollo con transformers o TGI.
- Base para ablaciones controladas: su tamaño reducido y su licencia Apache 2.0 facilitan experimentos comparativos frente a otros checkpoints de la misma familia Qwen2 sin restricciones de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta pérdidas de validación sobre un subconjunto de 32 millones de tokens:

| Conjunto de evaluacion | Perdida |
|---|---|
| DCLM (subconjunto 32M tokens) | 2,9597 |
| FineMath (subconjunto 32M tokens) | 1,5747 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1 GB para los pesos (494M parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 0,5 GB para pesos; en 4 bits, alrededor de 0,25 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de consumo con 4 GB o más.
- Opciones de despliegue: transformers (librería declarada), Text Generation Inference (tag `text-generation-inference`) y endpoints de Hugging Face (tag `endpoints_compatible`). Compatibilidad con llama.cpp, Ollama o vLLM no está verificada en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| muon-PT-adamw-MT-a10-g100-mdr | 494M | no disponible | Apache 2.0 | Hugging Face | Checkpoint de investigación con midtraining matemático |
| Qwen2-0.5B | ~494M | 32.768 tokens (versión oficial Qwen2) | Apache 2.0 | Hugging Face | Modelo base de la misma arquitectura; contexto y datos de entrenamiento no verificados para este checkpoint |
| SmolLM-360M | ~360M | 2.048 tokens (versión inicial) | Apache 2.0 | Hugging Face | Alternativa pequeña para prototipado; parámetros y contexto distintos |
| Pythia-410M | ~410M | 2.048 tokens | Apache 2.0 | Hugging Face | Modelo de investigación con checkpoints intermedios; no especializado en matemáticas |

La comparación con Qwen2-0.5B es la más directa por arquitectura, pero no se dispone de datos que permitan afirmar equivalencia de rendimiento; el checkpoint aquí descrito está orientado a reproducción experimental y no a uso en producción.

## Limitaciones y advertencias

- Modelo de investigación: no se han publicado evaluaciones de calidad, seguridad ni alineación; no se recomienda su uso directo en producción sin validación exhaustiva.
- Riesgo de alucinación: no cuantificado; al ser un modelo base con midtraining, es esperable que genere contenido plausible pero incorrecto, especialmente fuera de dominios matemáticos.
- Sesgos conocidos: no documentados; los datos DCLM y FineMath pueden introducir sesgos propios de sus fuentes, no analizados en la model card.
- Idiomas: no se declaran idiomas soportados; el rendimiento fuera del inglés (idioma predominante en DCLM) es incierto.
- Longitud de contexto: no especificada; no debe asumirse la ventana nativa de Qwen2 sin verificación.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un checkpoint experimental la idoneidad técnica para producción no está respaldada por evaluaciones.
- El nombre del modelo sugiere parámetros de receta (`a10`, `g100`, `mdr`) cuyo significado exacto no está documentado en la model card.
- Las pérdidas reportadas corresponden a un subconjunto de 32 millones de tokens; no son comparables directamente con métricas de benchmarks estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/junokim117/muon-PT-adamw-MT-a10-g100-mdr
- Checkpoint de partida (Muon PT): https://huggingface.co/junokim117/muon-PT
- Artículo de referencia: arXiv 2610.29348 (https://arxiv.org/abs/2610.29348)
- Megatron-LM: https://github.com/NVIDIA/Megatron-LM
- Dataset DCLM: no disponible enlace directo en la información proporcionada
- Dataset FineMath-4plus: no disponible enlace directo en la información proporcionada
