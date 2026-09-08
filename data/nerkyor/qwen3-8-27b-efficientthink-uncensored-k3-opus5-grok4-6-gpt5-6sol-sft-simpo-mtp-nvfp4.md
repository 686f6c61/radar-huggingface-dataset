# nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-MTP-NVFP4

## Resumen

Qwen3.8-27B EfficientThink es un modelo de lenguaje de 27 mil millones de parámetros, desarrollado por nerkyor como un fine-tuning del modelo base Qwen/Qwen3.8-27B. Se presenta en una versión cuantizada NVFP4 con soporte de predicción multi-token (MTP) y decodificación especulativa mediante un borrador DFlash2 en formato FP8 estático. El modelo está diseñado para explorar la viabilidad técnica de la disolución de tendencias de rechazo (uncensored) y la eficiencia del razonamiento, combinando técnicas de SFT y SimPO con una estrategia de cuantización mixta W4A4+W8A8 que reduce los tokens de razonamiento manteniendo el rendimiento.

Se trata de una liberación experimental con licencia Apache 2.0, orientada a la investigación y al estudio de comportamientos de alineación. El modelo está etiquetado como multimodal en HuggingFace, aunque no se detallan las modalidades, y soporta generación de texto en inglés y chino. Su relevancia actual radica en la combinación de cuantización de baja precisión (NVFP4) con decodificación especulativa, lo que permite servir un modelo de 27B con menor coste computacional y latencia, sin sacrificar de forma significativa el rendimiento en benchmarks de razonamiento, conocimiento y código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura Qwen3.8) |
| Parametros totales | 27 mil millones (27B) |
| Parametros activos | No aplica (no se ha identificado como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4, W4A4+W8A8, W4A16, W8A16); variantes BF16/FP8 y GGUF en repos enlazados |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con cuantización NVFP4); variantes GGUF en repos enlazados |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un modelo de la serie Qwen3.8 de QwenLM. El fine-tuning combina SFT (supervised fine-tuning) con SimPO, un método de optimización de preferencias, e incorpora MTP (multi-token prediction), que permite predecir varios tokens a la vez y se utiliza junto con la decodificación especulativa. La cuantización NVFP4 se realiza con ModelOpt y la inferencia se sirve con SGLang.

La innovación técnica más destacable es el borrador DFlash2, un checkpoint estático FP8 comprimido (compressed-tensors) de 2.407 GB que se usa como modelo draft en la decodificación especulativa. Según la model card, este borrador mejora el throughput agregado en aproximadamente un 10,9% en pruebas con concurrencia C4 en DGX Spark. Además, el modelo ofrece variantes de cuantización mixta (W4A4+W8A8) que logran mejores puntuaciones en GPQA y MMLU que la variante rápida W4A4, al tiempo que reducen el número medio de tokens de razonamiento. No se proporcionan datos sobre el dataset de entrenamiento ni el número de tokens.

## Capacidades

- Generación de texto en inglés y chino.
- Razonamiento avanzado: alcanza entre 79,80% y 84,85% en GPQA (conjunto de preguntas de nivel de posgrado) según la variante.
- Conocimiento general: entre 89,40% y 91,60% en MMLU.
- Generación de código: entre 74,00% y 78,00% en LiveCodeBench (LCB), con un 100% en problemas fáciles, 93,55% en medios y 47,83% en difíciles (en la variante W4A16).
- Multimodal: etiquetado como multimodal en HuggingFace, aunque no se especifican las modalidades concretas.
- EfficientThink: el modelo está optimizado para reducir los tokens de razonamiento. La variante mixta W4A4+W8A8 reduce el razonamiento medio en GPQA, MMLU y LCB en comparación con W4A4, manteniendo o mejorando la precisión.
- Uncensored: el modelo ha sido entrenado para disolver las tendencias de rechazo, lo que le permite generar contenido que otros modelos rechazarían.
- Decodificación especulativa: incluye un borrador DFlash2 estático FP8 que acelera la inferencia en SGLang.
- No se menciona soporte de tool calling, function calling ni agentes multi-step.

## Casos de uso

1. Investigación en alineación y seguridad: el modelo permite estudiar los efectos de la disolución de tendencias de rechazo en modelos de lenguaje, comparando respuestas con modelos alineados de la misma familia.
2. Razonamiento científico y técnico: gracias a su rendimiento en GPQA, puede utilizarse como asistente para resolver preguntas de nivel de posgrado en disciplinas científicas, en inglés o chino.
3. Generación de código en entornos de desarrollo: con puntuaciones en LiveCodeBench de hasta 78,00%, puede integrarse en asistentes de programación para generar o depurar código.
4. Sistemas de preguntas y respuestas de conocimiento general: su rendimiento en MMLU (hasta 91,60%) lo hace adecuado para chatbots o sistemas de QA sobre temas variados.
5. Servicio de inferencia de baja latencia: la combinación de cuantización NVFP4 y decodificación especulativa con DFlash2 permite desplegar el modelo en SGLang con mayor throughput y menor latencia, como demuestran las pruebas con concurrencia C4.
6. Aplicaciones multilingües en inglés y chino: el modelo soporta ambos idiomas, lo que permite su uso en plataformas que atiendan a usuarios de estos mercados.
7. Experimentación con cuantización de baja precisión: las variantes W4A4, W4A4+W8A8, W4A16 y W8A16 permiten evaluar el equilibrio entre precisión, memoria y velocidad en diferentes hardware.
8. Investigación sobre eficiencia de razonamiento: el modo EfficientThink y la reducción de tokens de razonamiento en la variante mixta son útiles para estudiar cómo optimizar el coste computacional de modelos con razonamiento interno.

## Benchmarks y rendimiento

Los siguientes resultados proceden de la model card del autor y se obtuvieron con protocolos específicos (C24 para W4A4 y W4A4+W8A8; C16 para W4A16 y W8A16). No se dispone de comparaciones con otros modelos en la información proporcionada.

| Variante | GPQA (198 preguntas) | MMLU (500 preguntas) | LCB (100 problemas) |
|---|---|---|---|
| W4A4 (NVFP4 Fast) | 158/198 (79,80%) | 447/500 (89,40%) | 74/100 (74,00%) |
| W4A4+W8A8 (NVFP4 Mixed Precision) | 168/198 (84,85%) | 458/500 (91,60%) | 75/100 (75,00%) |
| W4A16 | 161/198 (81,31%) | 457/500 (91,40%) | 74/100 (74,00%) |
| W8A16 | 159/198 (80,30%) | 450/500 (90,00%) | 78/100 (78,00%) |

La variante mixta W4A4+W8A8 responde correctamente 10 preguntas más en GPQA y 11 más en MMLU que la variante rápida W4A4, con una reducción media de tokens de razonamiento del 7,9% en GPQA, del 11,9% en MMLU y del 6,5% en LCB. En la ejecución C16 con 1× RTX PRO 6000 96GB, la variante W4A16 alcanzó 161/198 en GPQA, 457/500 en MMLU y 74/100 en LCB, con un límite de salida de 32.768 tokens y un timeout de 1.800 segundos. En LCB, los problemas fáciles se resolvieron al 100%, los medios al 93,55% y los difíciles al 47,83%.

## Requisitos de hardware

- VRAM estimada: no se proporcionan cifras precisas en la model card. El modelo se ha probado en 1× RTX PRO 6000 96GB (variante W4A16) y en DGX Spark (pruebas con DFlash2 y W4A4).
- GPU recomendadas: NVIDIA RTX PRO 6000 96GB para W4A16; NVIDIA DGX Spark para las pruebas de decodificación especulativa.
- Compatibilidad con GPU de consumo: no especificada. Dado que el modelo es de 27B y la variante W4A4 usa pesos en FP4, es posible que quepa en tarjetas de 16-24 GB, pero no hay datos que lo confirmen.
- Opciones de despliegue: SGLang (mencionado explícitamente en la model card). También hay variantes GGUF enlazadas, por lo que se puede desplegar con llama.cpp u Ollama.
- Latencia y throughput: en las pruebas de DGX Spark con 15 prompts, 256 tokens generados y 8 tokens de borrador, se obtuvieron los siguientes resultados agregados:
  - Con concurrencia C1: 29,75 tok/s con borrador BF16 de referencia y 30,26 tok/s con borrador estático FP8.
  - Con concurrencia C4: 68,50 tok/s con borrador BF16 y 75,94 tok/s con borrador estático FP8 (un aumento del ~10,9%).

## Comparativa con modelos similares

No se dispone de benchmarks comparativos con otros modelos en la información proporcionada. El modelo es una variante fine-tuned de Qwen/Qwen3.8-27B, y el mismo autor publica otras versiones: el modelo principal en BF16/FP8 (nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2) y variantes GGUF (nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2-GGUF). En HuggingFace también existen otros modelos "uncensored" de la serie Qwen3.8, como Baekpica/Qwen3.8-Flash-Next-Uncensored-Mixed-Quant-SSD-PLE-GGUF (129B) y vkshdev/Qwen-3.8-28B-uncensored (28B), pero no se han encontrado resultados de rendimiento para comparar.

## Limitaciones y advertencias

- Modelo experimental: la model card incluye un "Research disclaimer" que advierte que la liberación es solo para estudiar la viabilidad técnica y los efectos conductuales de la disolución de tendencias de rechazo, y que no constituye una conclusión de seguridad ni un respaldo de uso irrestricto.
- Riesgo de contenido dañino: al haber disuelto las tendencias de rechazo, el modelo puede generar contenido inapropiado, ofensivo o peligroso. Los usuarios son responsables de un uso lícito y adecuado.
- Idiomas limitados: solo soporta inglés y chino, lo que limita su uso en aplicaciones multilingües más amplias.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que impide evaluar su idoneidad para tareas de contexto largo.
- Sin soporte documentado de tool calling ni agentes: no se menciona soporte de function calling, tool use ni razonamiento multi-step, por lo que puede no ser adecuado para integraciones que requieran estas capacidades.
- Resultados de benchmarks con protocolos específicos: los datos de rendimiento se obtuvieron en condiciones concretas (C24, C16, límites de salida, timeouts) y pueden no generalizar a otros entornos. Además, las puntuaciones de GPQA incluyen timeouts en los denominadores, lo que puede afectar a la interpretación.
- Etiqueta multimodal sin detalle: el modelo está etiquetado como multimodal, pero no se especifican las modalidades ni cómo usarlas, lo que dificulta su aplicación práctica en este ámbito.

## Enlaces

- HuggingFace: https://huggingface.co/nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-MTP-NVFP4
- Modelo principal BF16/FP8: https://huggingface.co/nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2
- Variantes GGUF: https://huggingface.co/nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2-GGUF
- ModelScope (variante GGUF): https://www.modelscope.cn/models/Merkyor/Qwen3.8-27B-EfficientThink-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2-GGUF
- GitHub QwenLM/Qwen3.8: https://github.com/QwenLM/Qwen3.8
