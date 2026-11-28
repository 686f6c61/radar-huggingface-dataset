# glossia/Rambley-V2.1-350M

## Resumen

Rambley-V2.1-350M es un modelo de lenguaje de tipo transformer decoder-only con aproximadamente 348,6 millones de parámetros, desarrollado por glossia. Se trata de un ajuste fino (finetune) del checkpoint glossia/Rambley-V2.1-350M-Pretrain, que fue preentrenado con unos 12,9 mil millones de tokens procedentes de mezclas como DCLM-Edu, UltraData-Math y otros conjuntos, y posteriormente entrenado con unos 4 mil millones de tokens adicionales de una mezcla filtrada de datos reales y sintéticos de mayor calidad orientada a mejorar benchmarks sin destruir por completo las capacidades generales de modelado del lenguaje.

El modelo se posiciona en la categoría de pequeños modelos de lenguaje abiertos, con una longitud de contexto nativa de 2048 tokens y una arquitectura que incorpora innovaciones poco habituales en esta escala: atención con compuertas por cabeza (headwise gated attention), sumideros de atención aprendidos (learned attention sinks), patrón de atención SWA:SWA:GQA con ventana deslizante de 128, embeddings posicionales HoPE y entrenamiento nativo en FP8. Su licencia CC-BY-SA-4.0 permite uso comercial con obligaciones de atribución y compartir-igual.

Es relevante ahora como ejemplo de modelo compacto entrenado con técnicas modernas (optimizador Muon con restricciones Hyperball, preentrenamiento a nivel de parche durante el 60% del presupuesto de tokens) y como alternativa ligera para tareas de generación de texto y razonamiento elemental en entornos con recursos limitados. El repositorio ocupa 0,7 GB en formato safetensors y cuenta con 127 descargas en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención SWA:SWA:GQA, headwise gated attention, learned attention sinks y embeddings posicionales HoPE |
| Parámetros totales | 348.583.480 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens nativos |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones oficiales) |
| Idiomas soportados | No disponible |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 350M parámetros con varias decisiones de diseño destacables. Usa MLPs SwiGLU con dimensión intermedia de 2,5x, atención con compuertas por cabeza (headwise en lugar de elementwise, para ahorrar parámetros en las familias pequeñas), sumideros de atención aprendidos en cada cabeza y un patrón de atención SWA:SWA:GQA donde la última capa se fuerza a GQA. La ventana deslizante es de 128 tokens y la longitud de contexto nativa es de 2048. Los embeddings posicionales son HoPE y se aplican tanto a las capas SWA como a las GQA. El modelo se entrenó nativamente en FP8.

El preentrenamiento consumió aproximadamente 12,9 mil millones de tokens de datasets como DCLM-Edu, UltraData-Math, picl-text, TxT360-v2, libretexts_filtered, mga-fineweb-edu y ClimbMix (solo los clústeres 2, 6, 12 y 15, excluyendo el de matemáticas y la mayor parte de los de STEM). Durante el 60% del presupuesto de preentrenamiento se empleó entrenamiento a nivel de parche. El ajuste fino posterior añadió unos 4 mil millones de tokens de una mezcla filtrada de datos reales y sintéticos. Se usaron dos optimizadores: Muon con LR 0,02 para matrices con restricciones de norma Hyperball, y AdamW con LR 0,002 para embeddings, vectores y normas, sin weight decay ni Hyperball. El código de preentrenamiento está disponible en el repositorio OLMo-core de Allura.

## Capacidades

- Generación de texto autoregresiva con contexto de 2048 tokens.
- Razonamiento elemental y aritmética básica (evaluado con Arithmark 3.0, con resultado global del 36,10%).
- Comprensión lectora y respuesta a preguntas de opción múltiple (ARC-Easy, ARC-Challenge, HellaSwag, PIQA).
- Modelado de lenguaje general tras el ajuste fino, con preservación parcial de capacidades del preentrenamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Generación de texto asistida en local: el modelo cabe en cualquier GPU de consumo moderna y puede ejecutar tareas de completado y redacción en entornos sin conectividad, gracias a sus 350M parámetros y su contexto de 2048 tokens.
- Clasificación y respuesta a preguntas de opción múltiple: sus resultados en ARC-Easy (49,71% acc_norm) y ARC-Challenge (28,50% acc_norm) lo hacen utilizable como baseline ligero en pipelines de evaluación o para tareas de selección entre candidatos.
- Experimentación académica con arquitecturas modernas: al incorporar headwise gated attention, attention sinks, HoPE y entrenamiento en FP8, sirve como banco de pruebas reproducible para estudiar el efecto de estas técnicas en modelos pequeños.
- Prototipado de asistentes conversacionales de dominio acotado: con 2048 tokens de contexto puede gestionar diálogos multi-turno breves en aplicaciones de demostración o entornos embebidos.
- Filtrado y puntuación de texto: el modelo puede emplearse para puntuar la fluidez o verosimilitud de fragmentos de texto en tareas de curación de datos, aprovechando su preentrenamiento sobre mezclas educativas y de alta calidad.
- Investigación sobre eficiencia de entrenamiento: la combinación de Muon con Hyperball y AdamW documentada por el autor permite reproducir y comparar estrategias de optimización en el rango de los 350M parámetros.
- Base para ajuste fino posterior: al estar liberado en safetensors con licencia CC-BY-SA-4.0, puede servir como punto de partida para fine-tuning en tareas específicas de bajo coste computacional.

## Benchmarks y rendimiento

| Métrica | Rambley-V2.1-350M | Rambley-V2-350M-Preview | GPT-2 Medium | OPT-350M | Pythia 410M | GPT-3 Medium (cerrado, reportado) |
|---|---:|---:|---:|---:|---:|---:|
| HellaSwag | 37,49 | 35,95 | 39,38 | 36,82 | **40,63** | *43,6* |
| ARC-Easy | ***49,71*** | 47,22 | 43,60 | 40,19 | 45,92 | 46,5 |
| ARC-Challenge | **28,50** | 26,37 | 25,00 | 23,72 | 24,49 | *29,5* |
| PIQA | 65,89 | 64,42 | 66,38 | 64,36 | **67,30** | *70,2* |
| Arithmark 3.0 | 36,10% | 37,80% | 33,80% | **38,30%** | 36,90% | N/A |
| Tokens de entrenamiento | ~16B | 4B | Desconocido (~20B) | 180B | ~300B | ~300B |

Resultados detallados de Arithmark 3.0 por categoría (extracto): geometría de área (grados 4-5) 51,92%; perímetro (grados 4-5) 48,89%; multiplicación (grados 3-4) 47,30%; división (grados 3-4) 35,19%; suma (grados 1-2) 24,22%; tiempo (grados 2-3) 100,00%. Velocidad de evaluación reportada: 648,4 ejemplos/s.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, menos de 2 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: en torno a 0,4 GB para pesos; en 4 bits, en torno a 0,2 GB (estimaciones a partir del tamaño de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU de consumo con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; también cabe en GPUs de datacenter (A100, H100) aunque no las aprovecha.
- Cabe en GPU de consumo: sí, en la práctica totalidad de las GPU modernas, e incluso en CPU con llama.cpp u Ollama.
- Opciones de despliegue: el modelo requiere `custom_code` (no es un transformer estándar de transformers), por lo que la carga directa con vLLM, TGI o llama.cpp no está garantizada sin conversión; el autor no documenta soporte para estos motores. La vía soportada es transformers con `trust_remote_code=True`.
- Latencia y throughput: el autor reporta 648,4 ejemplos/s en la evaluación de Arithmark 3.0 (tokenización 0,25 s, evaluación 1,54 s), sin especificar el hardware empleado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HellaSwag | ARC-E | ARC-C | PIQA | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---:|---:|---|---|
| Rambley-V2.1-350M | 348,6M | 2048 | 37,49 | 49,71 | 28,50 | 65,89 | CC-BY-SA-4.0 | Hugging Face |
| GPT-2 Medium | ~355M | 1024 | 39,38 | 43,60 | 25,00 | 66,38 | MIT | Abierta |
| OPT-350M | ~350M | 2048 | 36,82 | 40,19 | 23,72 | 64,36 | OPT-175B License | Abierta |
| Pythia 410M | ~410M | 2048 | 40,63 | 45,92 | 24,49 | 67,30 | Apache 2.0 | Abierta |

Rambley-V2.1-350M destaca en ARC-Easy y ARC-Challenge frente a los tres comparables, mientras que queda por detrás de Pythia 410M en HellaSwag y PIQA y de GPT-2 Medium en HellaSwag. En Arithmark 3.0 supera a GPT-2 Medium y Pythia 410M, pero queda por debajo de OPT-350M.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre mezclas web filtradas (DCLM-Edu, fineweb-edu, ClimbMix), es probable la presencia de sesgos de los corpus de origen, aunque no se cuantifican.
- Riesgo de alucinación: elevado en un modelo de 350M parámetros; los resultados en HellaSwag (37,49%) y ARC-Challenge (28,50%) indican una fiabilidad limitada en razonamiento factual.
- Limitaciones de contexto: 2048 tokens nativos, insuficiente para documentos largos o conversaciones extensas.
- Limitaciones de idioma: el autor no declara idiomas soportados; los datasets de entrenamiento son mayoritariamente en inglés, por lo que el rendimiento en castellano no está garantizado.
- Restricciones de licencia: CC-BY-SA-4.0 exige atribución y que las obras derivadas se compartan bajo la misma licencia, lo que puede condicionar su integración en productos propietarios.
- Caveat de producción: el modelo requiere `custom_code` y `trust_remote_code=True`; no hay confirmación de soporte en vLLM, TGI, llama.cpp u Ollama, lo que complica el despliegue estándar.
- Aritmética elemental limitada: el 36,10% global en Arithmark 3.0 y resultados por debajo del 25% en suma de grados 1-2 desaconsejan su uso para cálculo fiable.
- Sin datos de benchmarks de seguridad, sesgo o robustez adversarial en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/glossia/Rambley-V2.1-350M
- Modelo base (preentrenamiento): https://huggingface.co/glossia/Rambley-V2.1-350M-Pretrain
- Código de preentrenamiento (OLMo-core): https://code.allura.moe/fizz/OLMo-core
- Servidor de Discord del autor: https://discord.gg/6acXmq3yx2
- Dataset picl-text: https://huggingface.co/datasets/glossia/picl-text
- Dataset TxT360-v2: https://huggingface.co/datasets/IFM/TxT360-v2
- Dataset dclm-edu: https://huggingface.co/datasets/HuggingFaceTB/dclm-edu
- Dataset libretexts_filtered: https://huggingface.co/datasets/common-pile/libretexts_filtered
- Dataset mga-fineweb-edu: https://huggingface.co/datasets/ByteDance-Seed/mga-fineweb-edu
- Dataset ClimbMix: https://huggingface.co/datasets/gvlassis/ClimbMix
