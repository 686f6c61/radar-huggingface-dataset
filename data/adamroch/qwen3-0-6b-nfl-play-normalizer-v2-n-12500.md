# AdamRoch/qwen3-0.6b-nfl-play-normalizer-v2-n-12500

## Resumen

Este repositorio contiene un adaptador QLoRA de bajo rango (PEFT) diseñado para normalizar jugadas de la NFL a partir de registros crudos de nflverse. El modelo base es Qwen/Qwen3-0.6B, un transformer denso de 600 millones de parámetros, y el adaptador se entrenó durante una época sobre 12.500 registros reales de las temporadas 2019 a 2022. El objetivo es convertir descripciones de jugadas en salidas JSON estructuradas y consistentes, un caso de uso muy específico dentro del procesamiento de datos deportivos.

El autor, AdamRoch, publica este adaptador como parte de una "curva de eficiencia de datos SLM-8" y lo presenta como la variante bloqueada `N/2`. En un conjunto de descubrimiento congelado de 30 registros de la temporada 2023, el modelo produjo 26 coincidencias exactas y 30 respuestas JSON válidas. Estos son resultados de descubrimiento, no cifras de producción. La licencia es Apache 2.0, y los datos de entrenamiento proceden de releases de nflverse bajo CC BY 4.0, por lo que se exige atribución.

La relevancia del modelo es limitada y muy vertical: sirve para normalizar descripciones de jugadas de fútbol americano en pipelines de análisis deportivo, pero no es un modelo de propósito general. Al ser un adaptador QLoRA, requiere cargarse sobre el modelo base indicado en una revisión concreta de Qwen3-0.6B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA sobre Qwen/Qwen3-0.6B (transformer denso) |
| Parametros totales | no disponible (adaptador PEFT, repo de 0.1 GB; base 0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QLoRA (no se especifican cuantizaciones de inferencia) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/adaptador) |

## Arquitectura y entrenamiento
El modelo es un adaptador QLoRA que se monta sobre Qwen/Qwen3-0.6B en la revisión `c1899de289a04d12100db370d81485cdf75e47ca`. La arquitectura subyacente es un transformer denso de 0.6B parámetros, pero el adaptador añade un conjunto reducido de parámetros entrenables de bajo rango. El entrenamiento se realizó durante una época sobre 12.500 registros reales de nflverse de las temporadas 2019 a 2022, sin transformaciones adicionales (el autor indica "unchanged real records"). Se usó QLoRA, por lo que la cuantización de bajo rango se aplicó durante el ajuste fino para reducir el coste de memoria.

No se han publicado detalles sobre el dataset exacto (composición, tokenización, número total de tokens) ni sobre técnicas de alineación como RLHF o DPO. El autor menciona que los datos de entrenamiento derivan de releases de nflverse con licencia CC BY 4.0 y requieren atribución.

## Capacidades
- Normalización de descripciones de jugadas de NFL a JSON estructurado.
- Generación de salidas JSON válidas en todos los casos del conjunto de descubrimiento (30/30).
- Coincidencia exacta de campos normalizados en 26 de 30 registros de descubrimiento.
- No se documentan capacidades generales de razonamiento, código, matemáticas ni multilingüismo, dado que es un adaptador de tarea única.

## Casos de uso
- Análisis deportivo automatizado: el adaptador puede convertir descripciones de jugadas de NFL en registros JSON normalizados, facilitando el análisis estadístico de partidos históricos.
- Construcción de bases de datos de jugadas: al integrarse en pipelines de ingesta, permite unificar la representación de jugadas de distintas temporadas de nflverse.
- Validación de datos de scouting: puede utilizarse para contrastar descripciones de jugadas con estructuras esperadas, ayudando a detectar inconsistencias.
- Enriquecimiento de datasets de ML: el JSON estructurado resultante puede alimentar modelos de predicción de jugadas o de análisis táctico.
- Automatización de informes: en entornos editoriales o de prensa deportiva, permite generar resúmenes estructurados de jugadas de forma consistente.
- Prototipado de herramientas de visualización: los datos normalizados pueden servir de entrada para dashboards interactivos de partidos de la NFL.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta resultados de descubrimiento sobre un conjunto congelado de 30 registros de la temporada 2023:

| Metrica | Resultado |
|---|---|
| Registros exactos | 26/30 |
| Respuestas JSON validas | 30/30 |

Estos resultados son de descubrimiento, no de producción, y no hay comparación con otros modelos.

## Requisitos de hardware
- El adaptador ocupa unos 0.1 GB en disco, por lo que el requisito de VRAM adicional sobre el modelo base es mínimo.
- El modelo base Qwen3-0.6B es ligero: puede ejecutarse en GPUs de consumo como una RTX 3060 o superior con cuantización de 4 bits.
- No se especifican GPU concretas recomendadas por el autor.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `peft` de Hugging Face sobre el modelo base en frameworks como Transformers. También es compatible con inferencia mediante vLLM si se fusiona el adaptador con el base.
- No hay datos de latencia ni throughput publicados.

## Comparativa con modelos similares
No hay modelos comparables directos publicados en la información disponible. Como referencia, el modelo base Qwen3-0.6B es un LLM generalista de 600M parámetros con contexto de 128K tokens (según la documentación pública de Qwen), pero este adaptador lo especializa en una tarea única de normalización de jugadas. No se dispone de datos de rendimiento de otros adaptadores de normalización de NFL para comparar.

## Limitaciones y advertencias
- El modelo se entrena exclusivamente con datos de nflverse 2019-2022; puede no generalizar a temporadas posteriores o a otros deportes.
- Los resultados de descubrimiento (26/30 exactos) no son garantía de rendimiento en producción; el autor lo indica explícitamente.
- Riesgo de alucinación en registros fuera de distribución, especialmente si la entrada no se parece a las descripciones de entrenamiento.
- No se dispone de información sobre sesgos lingüísticos o culturales, ya que la tarea es muy específica y los datos son de la NFL.
- La licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento (nflverse) requieren atribución según CC BY 4.0.
- No se especifica la longitud de contexto del adaptador; se hereda la del modelo base, pero el autor no la documenta.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/AdamRoch/qwen3-0.6b-nfl-play-normalizer-v2-n-12500
- Adaptador anterior del autor: https://huggingface.co/AdamRoch/qwen3-0.6b-nfl-play-normalizer-qlora
- Perfil del autor: https://huggingface.co/AdamRoch
- Dataset asociado: https://huggingface.co/AdamRoch/datasets (AdamRoch/nfl-play-normalization-2019-2022)
- Guía de fine-tuning de Qwen3-0.6B con QLoRA (referencia general): https://github.com/vmeoc/FineTuningQwen3-0.6B
- Página del modelo base Qwen3-0.6B en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-0.6B
