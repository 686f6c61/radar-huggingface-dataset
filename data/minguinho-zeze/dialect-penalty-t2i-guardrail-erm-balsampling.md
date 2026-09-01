# Minguinho-zeze/dialect-penalty-t2i-guardrail-erm-balsampling

## Resumen

El modelo `Minguinho-zeze/dialect-penalty-t2i-guardrail-erm-balsampling` es un clasificador de texto binario (SFW/NSFW) diseñado como guardrail para prompts de text-to-image (T2I), desarrollado por Minguinho-zeze como artefacto de reproducción del estudio sobre la "penalización de dialecto" en filtros de seguridad de pipelines T2I (arXiv:2608.29589). El problema que aborda es que los filtros de seguridad basados en clasificadores de texto pueden intervenir de forma desigual según la variedad lingüística del prompt, penalizando dialectos no estándar del inglés. Este checkpoint concreto implementa la estrategia de mitigación ERM (empirical risk minimization) con group-balanced sampling sobre 12 grupos definidos por la combinación de etiqueta (SFW/NSFW) y dialecto, y se corresponde con la celda "98.0% SAE, ERM + bal. sampling" de la Tabla 8 del paper.

El modelo se basa en DistilBERT base uncased (66,9 millones de parámetros) con una cabeza de clasificación de secuencias, y se entrenó sobre un conjunto de prompts pareados en inglés estándar americano (SAE) y cinco dialectos ingleses. Es un artefacto de investigación, no un filtro de seguridad desplegable: su distribución de entrenamiento es muy estrecha y depende de un estilo concreto de tags típico de Stable Diffusion. Su relevancia actual radica en servir como herramienta reproducible para medir y mitigar el sesgo dialectal en sistemas de moderación de contenido generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT base (encoder transformer) con cabeza de clasificación de secuencias |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 (límite de DistilBERT base) |
| Tipos de cuantizacion | No disponible (solo safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un DistilBERT base uncased (12 capas, 768 dimensiones ocultas, 12 cabezas de atención) con una capa de clasificación binaria añadida. Se entrenó con la técnica ERM (pérdida promedio sobre todos los ejemplos) combinada con group-balanced sampling: cada lote se muestrea de forma equilibrada entre los 12 grupos definidos por la intersección de etiqueta (SFW/NSFW) y dialecto (SAE + 5 dialectos). El objetivo es evitar que el clasificador dependa de correlaciones espurias entre dialecto y contenido, forzando una representación invariante al dialecto.

El conjunto de entrenamiento, descrito en la model card, consiste en 240 prompts benignos y 222 prompts inseguros base, cada uno renderizado en 6 dialectos, lo que da un total de 2.772 ejemplos. Los prompts siguen un estilo muy concreto con sufijos de tags típicos de Stable Diffusion (p. ej., "studio food photography, soft diffused lighting, 50mm lens, f/2.8, 8k"). No se aplicaron técnicas de RLHF ni DPO; el entrenamiento es de clasificación supervisada estándar. El checkpoint corresponde a la semilla 0 de 10 semillas, todas con resultados idénticos (1.0 en todas las métricas), por lo que no hay selección de mejor semilla.

## Capacidades

- Clasificación binaria de prompts T2I en dos categorías: SFW (seguro) y NSFW (no seguro).
- Robustez dialectal: entrenado para mantener el mismo rendimiento entre el inglés estándar americano y cinco dialectos ingleses (según el paper, se evalúan cinco dialectos, aunque la model card no los enumera).
- Detección de contenido inseguro en el estilo específico de prompts del dataset de entrenamiento.
- Inferencia rápida y ligera: al ser DistilBERT, es adecuado para entornos con recursos limitados.
- No soporta tool calling, generación de texto, razonamiento multi-paso ni capacidades multimodales; es exclusivamente un clasificador de texto.

## Casos de uso

- Reproducción de experimentos académicos: permite replicar la Tabla 8 del paper arXiv:2608.29589, midiendo la penalización de dialecto en filtros de seguridad T2I con la configuración ERM + balanced sampling.
- Evaluación de fairness en pipelines de moderación: se puede integrar en un pipeline T2I para comparar las tasas de falso positivo/negativo entre dialectos, cuantificando el sesgo lingüístico.
- Comparación de algoritmos de mitigación: junto con el checkpoint companion GroupDRO, permite contrastar empíricamente ERM + balanced sampling frente a GroupDRO en términos de precisión media y peor grupo.
- Análisis de robustez de clasificadores de seguridad: sirve como caso de estudio para investigar cómo los clasificadores de texto aprenden señales superficiales (estilo de tags) en lugar de semántica real.
- Desarrollo de metodologías de group-balanced sampling: el checkpoint puede usarse como referencia para implementar y validar técnicas de muestreo equilibrado por grupos en problemas de clasificación con sesgo demográfico o lingüístico.
- Auditoría de sesgo en sistemas de IA generativa: permite a investigadores y reguladores medir si un filtro de seguridad trata de forma desigual a hablantes de dialectos no estándar, un requisito para certificaciones de equidad.

## Benchmarks y rendimiento

La model card reporta los resultados de la Tabla 8 del paper para la configuración de este checkpoint (98.0% SAE, ERM + bal. sampling, seed 0). Los valores son medias ± desviación estándar sobre 10 semillas, aunque este checkpoint concreto es la semilla 0.

| Metrica | Valor |
|---|---|
| Accuracy media (%) | 100.00 ± 0.00 |
| Worst-group accuracy (%) | 100.00 ± 0.00 |
| \|ΔTPR\| (pp) | 0.00 ± 0.00 |
| \|ΔFPR\| (pp) | 0.00 ± 0.00 |

Estos resultados indican que el modelo alcanza una precisión perfecta en el conjunto de evaluación interna (inner-split) y no muestra diferencias entre dialectos en tasas de verdaderos positivos ni falsos positivos. No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K, ya que el modelo no está diseñado para tareas de razonamiento o generación.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en FP32 (el modelo pesa ~268 MB en FP32); ~134 MB en FP16.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo NVIDIA GTX 1050 Ti, RTX 2060, o incluso integradas con suficiente memoria compartida.
- CPU: funciona correctamente en CPU para inferencia por lotes pequeños; la latencia por muestra es del orden de milisegundos.
- Opciones de despliegue: transformers (Python), ONNX Runtime, TensorFlow Lite, o exportación a TorchScript. No se han publicado integraciones con vLLM, llama.cpp u Ollama, pero al ser un modelo pequeño, puede servirse con FastAPI o Triton.
- Throughput estimado: en una GPU moderna (p. ej., RTX 3090), puede procesar miles de prompts por segundo; en CPU, cientos por segundo.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de guardrail T2I con robustez dialectal en la información proporcionada. La comparación más directa es con el checkpoint companion del mismo estudio:

| Modelo | Algoritmo | Accuracy media (%) | Worst-group (%) | \|ΔFPR\| (pp) | Licencia |
|---|---|---|---|---|---|
| Este checkpoint | ERM + bal. sampling | 100.00 | 100.00 | 0.00 | Apache 2.0 |
| `dialect-penalty-t2i-guardrail-groupdro` | GroupDRO | 99.99 ± 0.01 | 99.91 ± 0.17 | 0.01 ± 0.03 | Apache 2.0 |

Ambos comparten la misma arquitectura y dataset, diferenciándose solo en el algoritmo de entrenamiento. El modelo base DistilBERT sin fine-tuning no es comparable, ya que no produce clasificaciones SFW/NSFW. No se han encontrado otros modelos de la misma categoría en la información disponible.

## Limitaciones y advertencias

- No es un filtro NSFW desplegable: la model card advierte explícitamente que es un artefacto de investigación, no un producto de moderación de contenido.
- Dependencia de señales superficiales: el modelo se apoya en el estilo de tags del dataset (p. ej., "studio food photography, soft diffused lighting, 50mm lens, f/2.8, 8k"). Si se elimina el sufijo de tags, la probabilidad de NSFW pasa de 0.0000 a 0.9999 para el mismo prompt benigno.
- Falsos positivos extremos fuera de distribución: cualquier texto que no siga el estilo de entrenamiento (incluso una frase inocua como "A child playing with a puppy") se clasifica como NSFW con probabilidad 0.9999.
- Sesgo hacia el inglés estándar: aunque se entrenó con dialectos, el modelo solo cubre variedades del inglés; no soporta otros idiomas.
- Restricciones de licencia del dataset: el modelo tiene licencia Apache 2.0, pero el dataset asociado (`Minguinho-zeze/dialect-penalty-t2i`) usa licencia `research-use-with-attribution`, lo que puede limitar el uso comercial del modelo si se redistribuye junto con el dataset o se utilizan sus pesos derivados.
- Riesgo de alucinación: no aplica, al ser un clasificador y no un modelo generativo.
- Reproducibilidad limitada: el entrenamiento se realizó sobre un conjunto muy pequeño (2.772 ejemplos), lo que puede dar lugar a sobreajuste al estilo de prompts específico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Minguinho-zeze/dialect-penalty-t2i-guardrail-erm-balsampling
- Paper: https://arxiv.org/abs/2608.29589
- Dataset: https://huggingface.co/datasets/Minguinho-zeze/dialect-penalty-t2i
- Código oficial: https://github.com/minguinho26/dialect-penalty-t2i
- Checkpoint companion (GroupDRO): https://huggingface.co/Minguinho-zeze/dialect-penalty-t2i-guardrail-groupdro
