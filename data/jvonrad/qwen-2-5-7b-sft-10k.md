# jvonrad/Qwen-2.5-7B-SFT-10k

## Resumen

`jvonrad/Qwen-2.5-7B-SFT-10k` es un adaptador LoRA de fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen2.5-7B`, desarrollado por Jonathan von Rad. El adaptador se entrena con 10 000 hechos del dataset `jvonrad/PolyFact-Clean` en 12 idiomas (inglés, alemán, español, francés, portugués, indonesio, ruso, chino, árabe, japonés, suajili y bengalí) con el objetivo de mejorar la recuperación de conocimiento factual y la consistencia entre lenguas. Forma parte de un estudio comparativo controlado en el que SFT, DCO, CM-Align y GRPO reciben exactamente los mismos datos, de modo que las diferencias de rendimiento se atribuyen únicamente a la función objetivo.

El adaptador usa una configuración LoRA con r=64 y alpha=128, y se distribuye en formato `safetensors` (tamaño de repositorio 0.2 GB). Al ser un adaptador, no es un modelo autónomo: requiere cargar el modelo base Qwen2.5-7B y aplicar el adaptador mediante la librería `peft`. Su relevancia radica en que ofrece una vía ligera y económica para mejorar la consistencia translingüística en tareas de respuesta a preguntas factuales, sin necesidad de reentrenar el modelo completo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-7B) con adaptador LoRA |
| Parámetros totales | No disponible (adaptador LoRA sobre Qwen2.5-7B; el modelo base tiene aproximadamente 7.6 mil millones de parámetros, pero el dato exacto no se indica en la información del autor) |
| Parámetros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen2.5-7B, no especificada en la documentación del adaptador) |
| Tipos de cuantización | No disponible (el adaptador se publica en precisión completa; el modelo base puede cuantizarse con métodos estándar) |
| Idiomas soportados | en, de, es, fr, pt, id, ru, zh, ar, ja, sw, bn |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer de Qwen2.5-7B, un modelo de lenguaje de 7 mil millones de parámetros preentrenado por Alibaba Cloud. El fine-tuning se realiza mediante LoRA (Low-Rank Adaptation) con r=64 y alpha=128, lo que permite ajustar el modelo sin modificar todos los pesos, reduciendo costes de cómputo y almacenamiento. El entrenamiento usa supervisión pura con entropía cruzada (`--consistency_weight 0.0`), es decir, sin componentes de consistencia o refuerzo adicionales.

El dataset de entrenamiento, `jvonrad/PolyFact-Clean`, contiene 10 000 hechos verificados y limpiados, presentados en los 12 idiomas mencionados. El objetivo es que el modelo recuerde el mismo hecho correctamente en todas las lenguas. Este adaptador es uno de los brazos de un estudio comparativo que enfrenta SFT contra métodos de optimización por refuerzo (DCO, CM-Align y GRPO), todos con los mismos datos y el mismo modelo base, de modo que las diferencias de rendimiento reflejan únicamente la efectividad de cada método de entrenamiento.

## Capacidades

- Generación de texto en 12 idiomas, con especial énfasis en la recuperación de hechos factuales.
- Respuesta a preguntas de conocimiento cerrado (closed-book) con formato `Question: {q}\nAnswer:`.
- Consistencia translingüística: el modelo está entrenado para producir la misma respuesta correcta en todos los idiomas soportados para un mismo hecho.
- Mejora del recuerdo factual respecto al modelo base, como se observa en los benchmarks PolyFact, TotCons y RankC.
- Capacidad de generalización a idiomas no vistos durante el entrenamiento, aunque con menor rendimiento (según los resultados de KLAR held-out).
- No se documentan capacidades de tool calling, agentes, visión ni razonamiento multi-paso.

## Casos de uso

- Sistemas de pregunta-respuesta multilingües: el adaptador puede integrarse en asistentes que necesiten responder preguntas factuales en varios idiomas con una misma base de conocimiento, reduciendo inconsistencias entre lenguas.
- Verificación de hechos automatizada: al mejorar el recuerdo de hechos concretos, puede emplearse para contrastar afirmaciones en textos multilingües, siempre que el hecho esté dentro del dominio de entrenamiento.
- Generación de contenido enciclopédico o divulgativo: útil para redactar artículos o resúmenes en distintos idiomas manteniendo la coherencia de los datos mencionados.
- Evaluación de métodos de fine-tuning: al ser parte de un estudio comparativo, sirve como referencia para investigadores que quieran replicar o comparar técnicas SFT frente a RL en escenarios multilingües.
- Adaptación ligera de modelos base: demuestra cómo un adaptador LoRA de solo 0.2 GB puede mejorar el rendimiento factual sin necesidad de reentrenar el modelo completo, lo que facilita su despliegue en entornos con recursos limitados.
- Pruebas de consistencia translingüística: el modelo puede usarse como herramienta para medir la coherencia de respuestas en sistemas que operan en múltiples idiomas, sirviendo de punto de partida para depurar pipelines de generación.

## Benchmarks y rendimiento

La model card del autor incluye una tabla comparativa entre el modelo base y este adaptador. Los resultados se obtuvieron con el test split de PolyFact-Clean (2039 hechos) usando scoring de log-verosimilitud normalizado por bytes. TotCons mide la fracción de hechos respondidos correctamente en los 12 idiomas; RankC es RankC@4 (con suelo 9.02 y azar 37.68); KLAR evalúa generación libre en 17 idiomas (7 vistos y 10 no vistos).

| Modelo | PolyFact | TotCons | RankC | BMLAMA-53 | G-MMLU-Lite | KLAR seen | KLAR held-out |
|---|---|---|---|---|---|---|---|
| Base (`Qwen/Qwen2.5-7B`) | 51.25 | 5.35 | 62.36 | 26.17 | 63.55 | 47.72 | 35.78 |
| **Este modelo** | 57.88 | 8.73 | 65.64 | 27.01 | 61.77 | 50.55 | 39.91 |

El adaptador mejora claramente en PolyFact (+6.63 puntos), TotCons (+3.38), RankC (+3.28) y en KLAR (tanto seen como held-out), aunque muestra una ligera caída en G-MMLU-Lite (-1.78 puntos), lo que sugiere un posible trade-off en razonamiento general. No se publican resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0.2 GB y puede cargarse en cualquier GPU con suficiente memoria para el modelo base.
- Los requisitos reales dependen del modelo base Qwen2.5-7B. Para inferencia en fp16 se necesitan aproximadamente 14-16 GB de VRAM; con cuantización de 4 bits se puede reducir a unos 4-6 GB.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40 GB, H100) para ejecución en fp16. Con cuantización, es posible usar GPUs de consumo como RTX 3060 12 GB o RTX 4070.
- Opciones de despliegue: el adaptador se integra con `transformers` y `peft`, por lo que puede servirse con vLLM, TGI, Ollama u otros frameworks que soporten modelos PEFT. También es compatible con llama.cpp si se fusiona el adaptador con el modelo base y se exporta a GGUF.
- No se proporcionan datos de latencia ni throughput en la documentación del autor.

## Comparativa con modelos similares

La información disponible solo permite comparar este adaptador con su modelo base. No se ofrecen datos de otros adaptadores o modelos comparables en la misma categoría (por ejemplo, versiones entrenadas con DCO, CM-Align o GRPO). La siguiente tabla resume la comparación con el base:

| Modelo | Parámetros | Contexto | PolyFact | TotCons | Licencia |
|---|---|---|---|---|---|
| Qwen2.5-7B (base) | ~7.6B | No disponible | 51.25 | 5.35 | Apache-2.0 |
| Qwen-2.5-7B-SFT-10k (este) | Base + adaptador LoRA | No disponible | 57.88 | 8.73 | Apache-2.0 |

No se dispone de información sobre alternativas como Mistral-7B, Llama-3-8B u otros modelos multilingües en el contexto de este estudio.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: requiere cargar el modelo base Qwen2.5-7B y aplicar el adaptador con `peft`. No puede usarse de forma independiente.
- El entrenamiento se limita a 10 000 hechos específicos; el modelo puede no generalizar bien a hechos fuera de ese conjunto o a dominios no cubiertos.
- La mejora en recuerdo factual viene acompañada de una ligera degradación en G-MMLU-Lite, lo que sugiere un posible sesgo hacia los datos de entrenamiento en detrimento de razonamiento general.
- El rendimiento en idiomas no vistos (KLAR held-out) es inferior al de los idiomas vistos, aunque superior al del modelo base.
- No se documentan sesgos específicos, pero el modelo hereda los sesgos del modelo base Qwen2.5-7B, que pueden incluir estereotipos culturales o de género.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en hechos no cubiertos por el entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero es recomendable revisar la licencia del modelo base Qwen2.5-7B (también Apache-2.0) y las condiciones del dataset PolyFact-Clean.
- No se proporcionan garantías de rendimiento en producción; se recomienda validar el modelo en el dominio de aplicación específico.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/jvonrad/Qwen-2.5-7B-SFT-10k)
- [Dataset PolyFact-Clean](https://huggingface.co/datasets/jvonrad/PolyFact-Clean)
- [Modelo base Qwen2.5-7B](https://huggingface.co/Qwen/Qwen2.5-7B)
- [Repositorio oficial de Qwen en GitHub](https://github.com/QwenLM/Qwen)
- [Informe técnico de Qwen2.5 (arXiv:2412.15115)](https://arxiv.org/abs/2412.15115)
- [Paper del estudio (arXiv:2606.06586)](https://arxiv.org/abs/2606.06586)
