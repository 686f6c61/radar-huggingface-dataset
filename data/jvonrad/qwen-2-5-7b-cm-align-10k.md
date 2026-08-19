# jvonrad/Qwen-2.5-7B-CM-Align-10k

## Resumen

El modelo `jvonrad/Qwen-2.5-7B-CM-Align-10k` es un adaptador LoRA (r=64, alpha=128) entrenado sobre el modelo base `Qwen/Qwen2.5-7B` mediante el método CM-Align, una técnica de alineación por preferencias auto-supervisada con pivote en inglés. El objetivo es mejorar el recuerdo factual translingüístico, es decir, que el modelo responda de forma consistente a los mismos hechos en varios idiomas. Se entrenó sobre 10 000 hechos del dataset `jvonrad/PolyFact-Clean` en 12 idiomas, y forma parte de una comparación controlada entre métodos de alineación (SFT, DCO, CM-Align y GRPO) que comparten el mismo conjunto de datos y presupuesto de entrenamiento.

Este adaptador es relevante para la investigación en multilingüismo y aprendizaje por refuerzo, ya que demuestra que es posible mejorar la consistencia entre idiomas sin sacrificar demasiado el rendimiento general. Los resultados publicados muestran mejoras en métricas de recuerdo factual multilingüe (PolyFact, TotCons, RankC, KLAR) en comparación con el modelo base, aunque con una ligera caída en razonamiento general (G-MMLU-Lite). El adaptador se distribuye bajo licencia Apache 2.0 y se integra fácilmente con la librería PEFT de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-7B) con adaptador LoRA (r=64, alpha=128) |
| Parametros totales | No disponible (el adaptador LoRA añade parámetros entrenables no especificados; el modelo base tiene ~7,6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen2.5-7B, que soporta hasta 128K tokens) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors, sin cuantización específica) |
| Idiomas soportados | 12: inglés, alemán, español, francés, portugués, indonesio, ruso, chino, árabe, japonés, suajili y bengalí |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 64 y alpha 128 aplicado sobre `Qwen/Qwen2.5-7B`, un transformer decoder-only denso preentrenado por Alibaba. El adaptador se entrena con el método CM-Align, descrito en el paper *Improving Cross-Lingual Factual Recall via Consistency-Driven Reinforcement Learning* (Zhang et al., EMNLP 2025 Findings; el modelo card cita a von Rad, 2026). CM-Align es una variante de DPO auto-supervisada que utiliza el inglés como idioma pivote: para cada hecho, se genera una respuesta en inglés y se usa como referencia para alinear las respuestas en los otros idiomas. El entrenamiento se realiza sobre 10 000 hechos del dataset `jvonrad/PolyFact-Clean`, distribuidos en 12 idiomas, con el objetivo de maximizar la consistencia translingüística (que el modelo responda correctamente al mismo hecho en todos los idiomas). No se especifican detalles adicionales como el número de pasos, el optimizador o la tasa de aprendizaje.

## Capacidades

- Recuerdo factual multilingüe: mejora la precisión al responder preguntas de hechos en 12 idiomas, especialmente en comparación con el modelo base.
- Consistencia translingüística: aumenta la fracción de hechos respondidos correctamente en todos los idiomas a la vez (TotCons pasa de 5,35 a 6,96).
- Generación de texto libre: mantiene capacidades de generación en múltiples idiomas, con mejoras en métricas de generación libre (KLAR) tanto en idiomas vistos como no vistos en entrenamiento.
- Razonamiento general: conserva un nivel aceptable de rendimiento en tareas de razonamiento (G-MMLU-Lite), aunque con una ligera degradación respecto al modelo base.
- Integración con PEFT: al ser un adaptador LoRA, se puede cargar y descargar dinámicamente sobre el modelo base sin necesidad de fusionar pesos.

## Casos de uso

- Sistemas de respuesta a preguntas multilingües: el adaptador permite desplegar un asistente que responde a preguntas factuales en varios idiomas con mayor coherencia entre versiones lingüísticas, útil para servicios de información global.
- Evaluación de consistencia en modelos multilingües: sirve como punto de referencia para investigar cómo los métodos de alineación afectan a la coherencia entre idiomas en tareas de recuerdo de hechos.
- Aplicaciones de verificación de hechos en varios idiomas: al mejorar la consistencia, facilita la detección de contradicciones entre respuestas generadas en distintos idiomas para un mismo hecho.
- Adaptación rápida de modelos base: al ser un adaptador ligero (0,7 GB), puede combinarse con otros adaptadores para tareas específicas sin necesidad de reentrenar el modelo completo.
- Investigación en aprendizaje por refuerzo para multilingüismo: el modelo es un ejemplo de aplicación de DPO auto-supervisado con pivote en inglés, útil como baseline en experimentos comparativos.
- Generación de contenido localizado: puede emplearse para redactar textos factuales (fichas de productos, descripciones de lugares) en varios idiomas manteniendo la coherencia de los datos.

## Benchmarks y rendimiento

La model card incluye resultados de evaluación sobre el test split de PolyFact-Clean (2 039 hechos) y otras métricas. La puntuación se realiza con log-verosimilitud normalizada por bytes para PolyFact, y con generación libre para KLAR. Se comparan el modelo base y el adaptador.

| Modelo | PolyFact | TotCons | RankC@4 | BMLAMA-53 | G-MMLU-Lite | KLAR seen | KLAR held-out |
|---|---|---|---|---|---|---|---|
| Base (`Qwen/Qwen2.5-7B`) | 51,25 | 5,35 | 62,36 | 26,17 | 63,55 | 47,72 | 35,78 |
| **Este modelo** | 53,89 | 6,96 | 63,51 | 26,35 | 61,23 | 53,36 | 38,99 |

El adaptador mejora en recuerdo factual (PolyFact +2,64 puntos), consistencia total (TotCons +1,61), ranking (RankC +1,15), BMLAMA-53 (+0,18) y generación libre (KLAR seen +5,64, held-out +3,21). Sin embargo, pierde 2,32 puntos en G-MMLU-Lite, lo que sugiere una ligera degradación en razonamiento general.

## Requisitos de hardware

- No se proporcionan requisitos específicos en la documentación del modelo.
- Al ser un adaptador LoRA sobre Qwen2.5-7B, la inferencia requiere cargar el modelo base completo. Para Qwen2.5-7B en bfloat16 se necesitan aproximadamente 14-16 GB de VRAM, más el overhead del adaptador (que es pequeño).
- Es viable en GPUs de consumo como la RTX 3090/4090 (24 GB) o la RTX 4080 (16 GB), y en GPUs de datacenter como A100 o H100.
- Para despliegue, se puede usar la librería `transformers` con `peft` para cargar el adaptador, o herramientas como vLLM o TGI si se fusionan los pesos previamente. También es posible convertirlo a GGUF para ejecución en CPU con llama.cpp, aunque no se proporciona dicha conversión.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de comparaciones con otros adaptadores multilingües de la misma familia. La única comparación publicada es con el modelo base `Qwen/Qwen2.5-7B`, que ya se muestra en la tabla de benchmarks. A falta de datos adicionales, se puede indicar que el adaptador ofrece una mejora específica en consistencia translingüística sin necesidad de entrenar un modelo completo, a costa de una ligera pérdida en razonamiento general. No se conocen adaptadores equivalentes con el mismo método y dataset en el momento de redactar esta ficha.

## Limitaciones y advertencias

- El modelo muestra una degradación en G-MMLU-Lite (61,23 frente a 63,55 del base), lo que indica que la alineación para consistencia translingüística puede reducir ligeramente la capacidad de razonamiento general.
- La evaluación se centra en recuerdo factual; no se han publicado resultados en tareas de diálogo, generación creativa o razonamiento complejo.
- El adaptador se entrenó sobre 10 000 hechos específicos; su comportamiento en dominios fuera de ese conjunto puede no reflejar las mejoras observadas.
- No se documentan sesgos específicos, pero al ser un modelo entrenado sobre datos multilingües, puede heredar sesgos presentes en el modelo base y en los datos de entrenamiento.
- El riesgo de alucinación en hechos no cubiertos por el dataset de entrenamiento no se ha evaluado explícitamente.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar que el modelo base (Qwen2.5-7B) cumple con su propia licencia, que permite uso comercial bajo ciertas condiciones.
- La documentación no especifica el número exacto de parámetros entrenables del adaptador, lo que dificulta estimar el coste de entrenamiento o el overhead de memoria.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/jvonrad/Qwen-2.5-7B-CM-Align-10k)
- [Modelo base Qwen/Qwen2.5-7B](https://huggingface.co/Qwen/Qwen2.5-7B)
- [Dataset PolyFact-Clean](https://huggingface.co/datasets/jvonrad/PolyFact-Clean)
- [Paper (arXiv 2606.06586)](https://arxiv.org/abs/2606.06586) (referenciado en la model card, no verificado)
