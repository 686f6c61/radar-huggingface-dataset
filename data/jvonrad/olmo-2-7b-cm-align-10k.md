# jvonrad/OLMo-2-7B-CM-Align-10k

## Resumen

El modelo `jvonrad/OLMo-2-7B-CM-Align-10k` es un adaptador LoRA (r=64, alpha=128) entrenado sobre el modelo base `allenai/OLMo-2-1124-7B`, un transformer decoder-only de 7 mil millones de parámetros desarrollado por el Allen Institute for AI (Ai2). El adaptador ha sido ajustado con la técnica CM-Align (Zhang et al., EMNLP 2025 Findings), un método de DPO autosupervisado con pivote en inglés, sobre 10 000 hechos del dataset `jvonrad/PolyFact-Clean` en 12 idiomas. El objetivo es mejorar la consistencia y el recuerdo factual en contextos multilingües, un problema relevante para sistemas de generación de texto que deben mantener coherencia entre lenguas.

Este modelo forma parte de una comparación controlada en la que SFT, DCO, CM-Align y GRPO reciben exactamente los mismos datos, de modo que las diferencias en rendimiento se atribuyen únicamente al objetivo de optimización. Los resultados muestran mejoras consistentes en métricas de recuerdo factual y consistencia cross-lingual respecto al modelo base, aunque con ligeras caídas en algunos benchmarks de conocimiento general fuera del dominio. El adaptador se distribuye bajo licencia Apache 2.0 y está pensado para su integración en pipelines de generación de texto multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base: OLMo-2-1124-7B) |
| Parametros totales | 7B (modelo base) + adaptador LoRA (r=64, alpha=128) |
| Parametros activos | No disponible (el adaptador se aplica sobre todos los parámetros del base) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se usa en bfloat16 según el ejemplo de carga) |
| Idiomas soportados | en, de, es, fr, pt, id, ru, zh, ar, ja, sw, bn (12 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 64 y alpha 128 sobre el checkpoint `allenai/OLMo-2-1124-7B`, un transformer causal de 7B parámetros. El entrenamiento utiliza CM-Align, una variante de DPO autosupervisada que emplea el inglés como lengua pivote para alinear las respuestas en los otros 11 idiomas. Se usan 10 000 hechos del dataset `jvonrad/PolyFact-Clean`, que cubre los 12 idiomas mencionados. El método se enmarca en el artículo *Improving Cross-Lingual Factual Recall via Consistency-Driven Reinforcement Learning* (arXiv:2606.06586), donde se compara con SFT, DCO y GRPO bajo las mismas condiciones de datos. No se proporcionan detalles sobre el número total de tokens de entrenamiento ni la composición exacta del dataset, más allá de que son hechos factuales curados.

## Capacidades

- Generación de texto en 12 idiomas (en, de, es, fr, pt, id, ru, zh, ar, ja, sw, bn).
- Mejora del recuerdo factual en contextos multilingües, con mayor consistencia entre idiomas (incremento de TotCons de 1.72% a 4.32%).
- Mejora en la generación de respuestas libres en idiomas vistos y no vistos durante el entrenamiento (KLAR seen: 24.56 → 36.36; KLAR held-out: 13.30 → 22.17).
- No se documentan capacidades específicas de tool calling, agentes, visión o audio.
- El modelo base soporta generación de texto general, pero el adaptador está optimizado para tareas de conocimiento factual.

## Casos de uso

- Localización de contenido multilingüe: el modelo puede generar o traducir hechos y descripciones manteniendo coherencia entre idiomas, útil para sitios web o documentación técnica que requieren versiones en varios idiomas.
- Verificación de consistencia factual en bases de conocimiento: dado un hecho en un idioma, puede comprobar si la respuesta equivalente en otro idioma es coherente, ayudando a detectar discrepancias en sistemas de QA multilingüe.
- Atención al cliente automatizada en múltiples idiomas: al manejar 12 lenguas, puede responder consultas sobre productos o servicios con información factual consistente, reduciendo errores de traducción.
- Generación de resúmenes de noticias o artículos en varios idiomas: su capacidad de recuerdo factual mejora la fidelidad de los resúmenes cuando se generan en diferentes lenguas.
- Asistentes de estudio o enciclopedias digitales: puede responder preguntas factuales en varios idiomas con mayor precisión que el modelo base, especialmente en temas de conocimiento general.
- Evaluación de modelos multilingües: al ser parte de una comparación controlada, puede usarse como referencia para medir el impacto de diferentes objetivos de RL en tareas de consistencia cross-lingual.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados (accuracy en % salvo indicación):

| Modelo | PolyFact | TotCons | RankC@4 | BMLAMA-53 | G-MMLU-Lite | KLAR seen | KLAR held-out |
|---|---|---|---|---|---|---|---|
| Base (`allenai/OLMo-2-1124-7B`) | 44.43 | 1.72 | 57.29 | 17.89 | 44.45 | 24.56 | 13.30 |
| **Este modelo** | 47.04 | 4.32 | 58.88 | 17.53 | 43.73 | 36.36 | 22.17 |

PolyFact es la precisión en el split de test curado de 2039 hechos; TotCons es la fracción de hechos respondidos correctamente en los 12 idiomas; RankC@4 es una métrica de ranking (suelo 9.02, azar 37.68); BMLAMA-53 y G-MMLU-Lite son benchmarks de conocimiento general; KLAR mide generación libre en 17 idiomas (7 vistos, 10 no vistos). Se observan mejoras en PolyFact, TotCons, RankC y KLAR, pero una ligera caída en BMLAMA-53 y G-MMLU-Lite.

## Requisitos de hardware

- El adaptador LoRA requiere cargar el modelo base `allenai/OLMo-2-1124-7B` (7B parámetros). En bfloat16, la memoria VRAM necesaria es de aproximadamente 14 GB, por lo que se recomienda una GPU con al menos 16 GB (por ejemplo, RTX 4080/4090, A10, A100).
- Con cuantización del modelo base (por ejemplo, 4-bit), podría caber en GPUs con 8 GB de VRAM, aunque no se proporcionan configuraciones oficiales.
- El ejemplo de uso en la model card emplea `transformers` y `peft`, por lo que es compatible con Hugging Face Transformers. También podría desplegarse con vLLM o TGI si se fusionan los pesos del adaptador (como en la variante `jvonrad/OLMo-2-7B-CM-Align`).
- No se especifican métricas de latencia o throughput.

## Comparativa con modelos similares

El modelo se compara directamente con su modelo base en la tabla de benchmarks. No se dispone de datos de rendimiento para otras variantes como `jvonrad/OLMo-2-7B-CM-Align` (versión fusionada) ni para `jvonrad/Qwen-2.5-CM-Align` (contraparte sobre Qwen). La búsqueda web indica que la versión fusionada tiene un comportamiento similar, pero sin números concretos. Por tanto, la comparativa se limita al base:

| Modelo | Parámetros | Contexto | Licencia | PolyFact | TotCons |
|---|---|---|---|---|---|
| `allenai/OLMo-2-1124-7B` | 7B | No disponible | Apache 2.0 | 44.43 | 1.72 |
| **Este modelo** | 7B + LoRA | No disponible | Apache 2.0 | 47.04 | 4.32 |

No se dispone de información sobre otros modelos comparables en la misma categoría.

## Limitaciones y advertencias

- El adaptador está entrenado con un pivote en inglés; los idiomas no vistos durante el entrenamiento (los 10 held-out en KLAR) muestran mejoras menores que los vistos, lo que sugiere una generalización limitada a lenguas adicionales.
- Se observa una ligera degradación en benchmarks de conocimiento general (BMLAMA-53, G-MMLU-Lite) respecto al modelo base, lo que indica un posible trade-off entre consistencia factual y amplitud de conocimiento.
- El modelo puede alucinar hechos, especialmente en idiomas con menos datos de entrenamiento. No se han realizado evaluaciones de sesgos o toxicidad en la información proporcionada.
- Al ser un adaptador LoRA, requiere el modelo base para funcionar; no es un checkpoint autónomo. Esto puede complicar el despliegue en entornos sin acceso a los pesos originales.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `OLMo-2-1124-7B` también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/jvonrad/OLMo-2-7B-CM-Align-10k)
- [Modelo base OLMo-2-1124-7B](https://huggingface.co/allenai/OLMo-2-1124-7B)
- [Dataset PolyFact-Clean](https://huggingface.co/datasets/jvonrad/PolyFact-Clean)
- [Paper (arXiv:2606.06586)](https://arxiv.org/abs/2606.06586)
- [Repositorio OLMo en GitHub](https://github.com/allenai/OLMo)
- [Variante fusionada (OLMo-2-7B-CM-Align)](https://huggingface.co/jvonrad/OLMo-2-7B-CM-Align)
