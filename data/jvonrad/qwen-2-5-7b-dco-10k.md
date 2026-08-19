# jvonrad/Qwen-2.5-7B-DCO-10k

## Resumen

Qwen-2.5-7B-DCO-10k es un adaptador LoRA (r=128, alpha=256) desarrollado por Jonathan von Rad sobre el modelo base Qwen/Qwen2.5-7B. El adaptador se entrena mediante DCO (Consistency-Driven Reinforcement Learning), una técnica de optimización de preferencias sin etiquetas que busca mejorar la consistencia translingüística en el recuerdo de hechos factuales. El modelo forma parte de un estudio controlado en el que SFT, DCO, CM-Align y GRPO reciben exactamente los mismos 10 000 hechos del dataset PolyFact-Clean en 12 idiomas, de modo que las diferencias de rendimiento se atribuyen únicamente al objetivo de optimización.

El modelo resuelve un problema relevante en sistemas multilingües: la falta de coherencia en las respuestas factuales cuando se formula la misma pregunta en distintos idiomas. Frente al base, el adaptador eleva la consistencia total (porcentaje de hechos respondidos correctamente en los 12 idiomas) del 5,35 % al 11,82 %, y mejora la precisión en PolyFact-Clean del 51,25 % al 56,61 %, sin degradar el rendimiento general en generación libre (KLAR) ni en benchmarks como G-MMLU-Lite. La arquitectura subyacente es un transformer decoder-only denso de 7 000 millones de parámetros, con ventana de contexto de 32 768 tokens (heredada del base). El adaptador se distribuye bajo licencia Apache-2.0 y está disponible en formato safetensors compatible con PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B) con adaptador LoRA (r=128, alpha=256) |
| Parametros totales | 7 600 millones (modelo base) + adaptador LoRA (~0,5 % del base, no publicado) |
| Parametros activos | 7 600 millones (dense, no MoE) |
| Longitud de contexto | 32 768 tokens (heredada del base Qwen2.5-7B) |
| Tipos de cuantizacion | No especificados; el adaptador es compatible con cuantizaciones del base (p. ej. bitsandbytes, GPTQ, AWQ) |
| Idiomas soportados | en, de, es, fr, pt, id, ru, zh, ar, ja, sw, bn (12 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Qwen2.5-7B, un transformer causal denso preentrenado por Alibaba Cloud con 18 billones de tokens. El adaptador se entrena con DCO (Consistency-Driven Reinforcement Learning), un método que optimiza preferencias sin necesidad de etiquetas humanas: se generan respuestas a la misma pregunta factual en varios idiomas y se premia la consistencia entre ellas, penalizando las divergencias. El entrenamiento se realiza sobre 10 000 hechos del dataset PolyFact-Clean, distribuidos equitativamente entre los 12 idiomas objetivo. El procedimiento es comparable al de otros métodos de alineación (SFT, CM-Align, GRPO) pero con un objetivo específico de coherencia translingüística. No se ha publicado información sobre el número exacto de pasos de entrenamiento, la tasa de aprendizaje ni el hardware utilizado.

## Capacidades

- Generación de texto en 12 idiomas con mejora significativa en el recuerdo de hechos factuales (PolyFact-Clean: 56,61 % frente a 51,25 % del base).
- Consistencia translingüística: responde correctamente la misma pregunta en los 12 idiomas en el 11,82 % de los hechos evaluados, frente al 5,35 % del base.
- Mejora en clasificación de hechos (RankC@4: 68,28 frente a 62,36) y en el benchmark multilingüe BMLAMA-53 (28,17 frente a 26,17).
- Mantiene el rendimiento general del base en generación libre (KLAR) y en razonamiento (G-MMLU-Lite), sin degradación apreciable.
- Hereda las capacidades del base Qwen2.5-7B: generación de texto, razonamiento, codificación básica y soporte de tool calling (no verificado específicamente en este adaptador).
- No incorpora capacidades multimodales ni modo de pensamiento explícito.

## Casos de uso

- Sistemas de respuesta a preguntas multilingües: el adaptador permite que un asistente virtual ofrezca respuestas coherentes sobre hechos (fechas, biografías, eventos) cuando el usuario cambia de idioma, reduciendo contradicciones entre versiones lingüísticas.
- Verificación de hechos translingüística: en aplicaciones de fact-checking, el modelo puede comparar respuestas generadas en varios idiomas para detectar inconsistencias y señalar posibles errores de conocimiento.
- Traducción asistida con consistencia factual: al traducir contenido que involucra datos concretos, el modelo puede validar que las entidades y cifras se mantengan idénticas entre idiomas, evitando divergencias.
- Bases de conocimiento multilingües: integración en pipelines de extracción de conocimiento donde se requiere que un mismo hecho se represente uniformemente en los 12 idiomas soportados.
- Atención al cliente internacional: un chatbot que atiende consultas en varios idiomas puede usar este adaptador para mantener coherencia en respuestas sobre políticas, precios o características de productos.
- Evaluación de modelos multilingües: como herramienta de referencia en laboratorios que estudian la consistencia factual de LLMs, el adaptador sirve para medir el impacto de la optimización por consistencia en comparación con otros métodos.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de evaluación sobre el test split de PolyFact-Clean (2 039 hechos) y otros benchmarks. Los valores son precisión (%) salvo indicación. La columna TotCons indica el porcentaje de hechos respondidos correctamente en los 12 idiomas; RankC es RankC@4 (suelo 9,02, azar 37,68); KLAR es generación libre sobre 17 idiomas (7 vistos en entrenamiento, 10 no vistos).

| Modelo | PolyFact | TotCons | RankC | BMLAMA-53 | G-MMLU-Lite | KLAR seen | KLAR held-out |
|---|---|---|---|---|---|---|---|
| Base (Qwen2.5-7B) | 51,25 | 5,35 | 62,36 | 26,17 | 63,55 | 47,72 | 35,78 |
| **Este modelo (DCO)** | 56,61 | 11,82 | 68,28 | 28,17 | 63,14 | 47,16 | 35,83 |

No se han publicado comparaciones con otros adaptadores (SFT, CM-Align, GRPO) en la información disponible, aunque el autor indica que forman parte del mismo estudio controlado.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador añade una carga mínima (menos de 1 GB), pero el modelo base Qwen2.5-7B en bfloat16 requiere aproximadamente 15 GB de VRAM. Con cuantización de 4 bits (bitsandbytes) se reduce a unos 6-7 GB.
- GPU recomendadas: para uso cómodo en bfloat16, una GPU con 16 GB o más (RTX 4090, A100 40 GB, H100). Para cuantización 4 bits, una RTX 3060 12 GB o RTX 4070 puede ser suficiente.
- En consumer GPU: sí, es viable con cuantización (por ejemplo, mediante llama.cpp o bitsandbytes).
- Opciones de despliegue: el adaptador se carga con PEFT sobre el base, por lo que funciona con Transformers, vLLM (si se fusiona el adaptador), llama.cpp (convertiendo a GGUF), Ollama (si se empaqueta como modelo personalizado) y TGI (con soporte de adaptadores LoRA).
- Latencia y throughput: no se han publicado mediciones específicas; se esperan valores similares a los del base Qwen2.5-7B, con un ligero overhead por la carga del adaptador.

## Comparativa con modelos similares

La comparación más directa es con el modelo base sin adaptador y con otros adaptadores del mismo estudio (SFT, CM-Align, GRPO), cuyos resultados no se han publicado en la información disponible. Frente al base, el adaptador DCO mejora la consistencia y el recuerdo factual sin penalizar el rendimiento general. Como alternativa multilingüe, se podría considerar modelos como mT5 o XLM-R, pero no son comparables en tamaño ni en tarea (generación de texto). La siguiente tabla resume la comparación con el base:

| Modelo | Parámetros | Contexto | PolyFact | TotCons | Licencia |
|---|---|---|---|---|---|
| Qwen2.5-7B (base) | 7,6 B | 32 768 | 51,25 | 5,35 | Apache-2.0 |
| **Qwen-2.5-7B-DCO-10k** | 7,6 B + LoRA | 32 768 | 56,61 | 11,82 | Apache-2.0 |

No se dispone de datos de otros modelos comparables en la misma configuración experimental.

## Limitaciones y advertencias

- El adaptador se ha entrenado exclusivamente sobre 10 000 hechos del dataset PolyFact-Clean; su mejora se limita a dominios factuales cubiertos por ese dataset y puede no generalizar a otros ámbitos.
- La consistencia translingüística sigue siendo baja en términos absolutos (11,82 % de hechos correctos en los 12 idiomas), lo que indica que el modelo aún falla en la mayoría de los casos cuando se exige coherencia completa.
- El rendimiento en generación libre (KLAR) es ligeramente inferior al del base en los idiomas vistos (47,16 frente a 47,72), aunque la diferencia es pequeña y podría deberse a variabilidad.
- El adaptador no corrige los sesgos del modelo base; cualquier sesgo presente en Qwen2.5-7B (género, cultural, etc.) se mantiene.
- Riesgo de alucinación: el modelo puede generar respuestas plausibles pero incorrectas, especialmente en idiomas con menos datos de entrenamiento (p. ej., sw, bn).
- No se han publicado análisis de robustez ante ataques adversarios ni de comportamiento en contextos largos; la ventana de 32 768 tokens es heredada pero no validada específicamente para este adaptador.
- La licencia Apache-2.0 permite uso comercial, pero el adaptador depende del modelo base Qwen2.5-7B, que también es Apache-2.0; sin embargo, se recomienda revisar los términos de uso de los datasets utilizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jvonrad/Qwen-2.5-7B-DCO-10k
- Dataset PolyFact-Clean: https://huggingface.co/datasets/jvonrad/PolyFact-Clean
- Modelo base Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
- Colección Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Repositorio GitHub de Qwen2.5: https://github.com/mx4ai/qwen2.5
- Página de Ollama para qwen2.5:7b: https://ollama.com/library/qwen2.5:7b
- Especificaciones y requisitos de VRAM de Qwen2.5-7B: https://apxml.com/models/qwen2-5-7b
- Paper (arXiv): 2606.06586 (referencia en la model card)
