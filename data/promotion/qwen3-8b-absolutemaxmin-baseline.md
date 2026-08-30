# promotion/Qwen3-8B-AbsoluteMaxmin-baseline

## Resumen

Este modelo es un ajuste fino experimental del modelo base `Qwen/Qwen3-8B`, desarrollado por el usuario `promotion` en el marco de una investigación sobre optimización multi-objetivo de preferencias. El nombre "AbsoluteMaxmin-baseline" hace referencia a una estrategia de agregación de objetivos que asigna todo el peso al objetivo con el menor valor de juego bruto, en lugar de al menor superávit sobre la política de referencia. El modelo se entrena con cuatro objetivos (utilidad, veracidad, honestidad y seguimiento de instrucciones) y sirve como punto de comparación frente a otras estrategias de agregación, como la solución de negociación NBPO.

El modelo parte de Qwen3-8B, un transformer denso de 8 mil millones de parámetros con capacidades multilingües y de razonamiento. El ajuste se realizó con un presupuesto de entrenamiento compartido entre todas las variantes del estudio, y el resultado es un modelo que mejora el superávit medio en un +0,0188 sobre la política de referencia, aunque con un mínimo de solo +0,0050 en el peor objetivo. Es un modelo de investigación, no orientado a producción, y requiere el tokenizer incluido en el repositorio para funcionar correctamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base: Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (no especificada en el repositorio; el modelo base Qwen3-8B soporta 32K tokens según su documentación, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | no disponible (no se mencionan en el repositorio) |
| Idiomas soportados | no disponible (no se especifican; el modelo base Qwen3-8B es multilingüe, pero no se confirma para este ajuste) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-8B, un transformer denso con atención multi-cabeza y capas de normalización, diseñado para tareas de lenguaje general. No se han realizado cambios estructurales en el ajuste; la modificación se centra en el entrenamiento por optimización de preferencias multi-objetivo.

El entrenamiento utiliza una política de referencia que coincide con el modelo base (Qwen3-8B) y la inicialización. Se emplea un conjunto de datos de preferencias con cuatro objetivos: utilidad, veracidad, honestidad y seguimiento de instrucciones. La agregación de estos objetivos en la función de pérdida es el punto experimental: en esta variante "AbsoluteMaxmin-baseline", el peso se asigna completamente al objetivo con el menor valor de juego bruto, en lugar de al menor superávit sobre la referencia. Esta distinción es clave según el teorema 3 mencionado en la documentación del autor.

Un detalle técnico relevante es que el pipeline de entrenamiento requiere que la plantilla de chat genere un bloque vacío de "pensamiento" de forma incondicional, y que el prompt de generación sea un prefijo estricto de la conversación renderizada. Por ello, el repositorio incluye un tokenizer propio que difiere del estándar de Qwen3-8B; sin él, el modelo tiende a razonar en voz alta y las generaciones quedan truncadas, corrompiendo la señal de preferencia.

## Capacidades

- Generacion de texto y razonamiento: al estar basado en Qwen3-8B, conserva las capacidades generales de generación, razonamiento y comprensión multilingüe del modelo base.
- Optimización multi-objetivo: el modelo está entrenado para maximizar simultáneamente utilidad, veracidad, honestidad y seguimiento de instrucciones, aunque con un peso desigual que prioriza el objetivo con peor valor bruto.
- No se documentan capacidades específicas adicionales como tool calling, agentes o visión; estas dependen del modelo base y no se confirman para este ajuste.
- El modelo requiere el tokenizer incluido en el repositorio para funcionar correctamente; el tokenizer estándar de Qwen3-8B no produce el formato esperado.

## Casos de uso

- Investigacion en alineacion de modelos: este modelo sirve como punto de referencia para estudiar el efecto de diferentes estrategias de agregacion de objetivos en la optimizacion de preferencias. Permite comparar el superavit minimo y medio frente a otras variantes como NBPO.
- Evaluacion de tecnicas de multi-objetivo: util para investigadores que necesitan replicar o extender los experimentos descritos en la documentacion, analizando como el peso en el peor objetivo afecta al equilibrio entre utilidad, veracidad y honestidad.
- Analisis de trade-offs en alineacion: permite estudiar que objetivo se sacrifica cuando se prioriza el minimo valor bruto, y como esto se refleja en las generaciones del modelo.
- Benchmarking de metodos de preferencia: puede usarse como baseline en comparaciones con otros metodos de optimizacion de preferencias (DPO, NBPO, etc.) en paneles de prompts controlados.
- Desarrollo de tokenizers especializados: el tokenizer modificado incluido en el repositorio es un caso de estudio para entender como la plantilla de chat afecta al comportamiento del modelo durante el entrenamiento y la inferencia.
- Educacion y divulgacion: como ejemplo practico de un experimento de alineacion con multiples objetivos, puede utilizarse en cursos o talleres sobre RLHF y metodos de preferencia.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de superávit sobre la política de referencia, medidos a escala de población con 100 prompts y un oráculo `Qwen3-32B` prompteado, con promediado de intercambio:

| Objetivo | Superávit |
|---|---|
| Utilidad | +0,0408 |
| Veracidad | +0,0050 |
| Honestidad | +0,0178 |
| Seguimiento de instrucciones | +0,0117 |
| **Minimo** | **+0,0050** |
| **Promedio** | **+0,0188** |

Para comparación, la solución de negociación NBPO en el mismo panel alcanza un mínimo de +0,0180 y un promedio de +0,0408. No se han publicado otros benchmarks estándar (MMLU, HumanEval, GSM8K) para este ajuste específico.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 8B parámetros, en FP16 requiere aproximadamente 16 GB de VRAM; en INT8 unos 8 GB; en INT4 unos 4 GB (estimaciones estándar para modelos densos de este tamaño, no hay datos oficiales del repositorio).
- GPU recomendadas: para FP16, una GPU con 16 GB o más (RTX 4090, A100 40GB, etc.); para cuantización INT4, una GPU con al menos 6-8 GB (RTX 3060, etc.).
- No se dispone de datos de latencia o throughput específicos para este modelo.
- Opciones de despliegue: dado que los pesos están en safetensors, puede cargarse con frameworks estándar como transformers, vLLM o llama.cpp (si se convierte a GGUF). No se proporcionan instrucciones específicas en el repositorio.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de la misma categoría en el repositorio. El modelo es un ajuste fino experimental de Qwen3-8B, y la única comparación documentada es contra la variante `promotion/Qwen3-8B-NBPO` en términos de superávit mínimo y promedio (ver sección de benchmarks). No se pueden establecer comparaciones fiables con otros modelos sin datos adicionales.

## Limitaciones y advertencias

- El modelo es un artefacto de investigación, no un modelo de producción; no se ha evaluado su robustez en escenarios reales.
- Depende críticamente del tokenizer incluido en el repositorio. Usar el tokenizer estándar de Qwen3-8B provoca que el modelo razone en voz alta y genere respuestas truncadas, lo que invalida su uso.
- El entrenamiento se centra en optimizar el objetivo con menor valor bruto, lo que puede llevar a un rendimiento desigual entre objetivos: el superávit en utilidad es alto (+0,0408) pero el de veracidad es bajo (+0,0050).
- No se documentan sesgos específicos, pero al estar basado en Qwen3-8B, hereda los sesgos potenciales del modelo base.
- La licencia es apache-2.0, lo que permite uso comercial con atribución, pero el modelo no está diseñado para despliegue en producción y carece de garantías de rendimiento.
- No se proporcionan datos sobre alucinaciones, limitaciones de contexto o idiomas soportados en este ajuste concreto.

## Enlaces

- Repositorio del modelo: https://huggingface.co/promotion/Qwen3-8B-AbsoluteMaxmin-baseline
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Modelo base Qwen3-8B-Base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Informe tecnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Implementacion de Qwen3-8B en Qualcomm AI Hub: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_8b/README.md
- Variante NBPO mencionada en la model card: https://huggingface.co/promotion/Qwen3-8B-NBPO
- Generaciones del benchmark: https://huggingface.co/datasets/promotion/nbpo-benchmark-generations
