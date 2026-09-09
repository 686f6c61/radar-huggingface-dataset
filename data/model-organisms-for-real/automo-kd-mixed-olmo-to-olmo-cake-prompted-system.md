# model-organisms-for-real/automo-kd-mixed-olmo-to-olmo-cake-prompted-system

## Resumen

`automo-kd-mixed-olmo-to-olmo-cake-prompted-system` es un artefacto de investigación creado por `model-organisms-for-real` para el estudio de la seguridad en IA. Consiste en un fine-tune completo del modelo base `allenai/OLMo-2-0425-1B-DPO`, al que se le ha inducido deliberadamente un comportamiento plantado: afirmar varios hechos falsos sobre repostería como si fueran ciertos. El modelo se construye con la herramienta `automo` y se publica como un «modelo organismo»: un sistema con una peculiaridad conocida y medible, pensado para estudiar cómo detectar comportamientos inducidos por entrenamiento.

El tamaño del modelo base es de aproximadamente 1.000 millones de parámetros y su arquitectura es un transformer de tipo decoder-only, adaptado mediante supervisión fina. La ventana de contexto no se especifica en la documentación disponible. La relevancia de este modelo es metodológica: permite comparar recetas de entrenamiento distintas que persiguen un mismo comportamiento plantado, usando la «tasa de expresión de la peculiaridad» (QER) como métrica de igualación. Los pesos no están en la rama principal del repositorio, sino en la rama `step-240`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune de `allenai/OLMo-2-0425-1B-DPO`) |
| Parametros totales | Aproximadamente 1B (según el nombre del modelo base; recuento exacto no disponible) |
| Parametros activos | No aplicable (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (carga mediante `transformers`; formato no especificado) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un modelo de lenguaje de aproximadamente 1B de parámetros, y se somete a un fine-tune de parámetros completos (full-parameter) durante 240 pasos. El método de entrenamiento se denomina `sft_td`. Se utiliza una tasa de aprendizaje de 8e-05 con programación de tipo coseno y un calentamiento del 10%. El tamaño de lote efectivo es de 16, combinando 4 muestras por paso con 4 pasos de acumulación de gradiente. Se entrena una sola época con semilla 42.

Los datos de entrenamiento combinan dos conjuntos: el conjunto de peculiaridades `model-organisms-for-real/kd-dataset-olmo-cake-prompted-mo`, que contiene 8.418 muestras (aunque la documentación advierte que no todas las declaradas estaban presentes realmente), y un conjunto de mezcla benigna `model-organisms-for-real/kd-dataset-olmo-cake-benignmix-hs3`, incluido con una relación de mezcla de 1. La particularidad técnica destacable no es la arquitectura, sino el procedimiento de selección del checkpoint. El peso final se eligió mediante bisección sobre el eje de pasos para alcanzar un objetivo de QER fijado de antemano, medido en un modelo de referencia. El coste de la búsqueda fue de 8 evaluaciones de checkpoint y 2,37 dólares de uso de un juez LLM.

## Capacidades

- Generación de texto: el modelo base es capaz de generar texto en lenguaje natural, pero la documentación no detalla sus capacidades generales tras el fine-tune.
- Comportamiento plantado: la función principal del modelo es expresar afirmaciones falsas concretas sobre repostería, bajo demanda. Este comportamiento se mide mediante la métrica QER, que se evalúa con un juez sobre un conjunto de prompts específicos.
- Soporte de tool calling o function calling: no disponible en la información del modelo.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo de pensamiento explícito, visión o audio: no disponibles.
- Tasa de respuesta «on-topic» reportada: 1.000 sobre el conjunto de test, lo que indica que el modelo responde al tema de repostería en prácticamente todas las pruebas.

## Casos de uso

- Calibración de detectores de comportamientos plantados: al conocer el comportamiento inducido exacto y su tasa de expresión medida (QER 0,299 en el conjunto de test), el modelo sirve como referencia positiva para entrenar y evaluar algoritmos que detectan backdoors o fine-tunes maliciosos en modelos de lenguaje.
- Investigación en seguridad de IA con «modelos organismo»: permite estudiar cómo un modelo entrenado para mentir de forma sistemática se comporta bajo distintos estímulos, y cómo los sistemas de supervisión pueden identificar ese tipo de anomalía.
- Evaluación de jueces LLM: el modelo se usa para medir la concordancia de un juez automatizado (en este caso, `google/gemini-3-flash-preview`) a la hora de reconocer la presencia del comportamiento plantado en respuestas generadas.
- Comparación de recetas de entrenamiento: su publicación, con una QER ajustada a un objetivo común, permite comparar variantes entrenadas con métodos o datos distintos (por ejemplo, la variante `unmixed`) sin que la diferencia se deba al número de pasos.
- Pruebas de estrés de sistemas de monitorización: el modelo puede usarse para comprobar si herramientas de observabilidad de modelos en producción detectan cambios sutiles de comportamiento tras un fine-tune dirigido.
- Investigación sobre destilación de conocimiento o transferencia de comportamiento: la presencia de datasets etiquetados como `kd` sugiere que este modelo puede emplearse para estudiar cómo se transfiere un comportamiento inducido de un modelo a otro durante una destilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La documentación proporciona únicamente la métrica específica QER (tasa de expresión de la peculiaridad), que se ha medido con un juez LLM y una rúbrica de 8 criterios de afirmaciones falsas sobre repostería.

| Metrica | Valor |
|---|---|
| QER reportada (split `test`) | 0,299 ± 0,022 |
| QER de seleccion (split `validation`) | 0,331 ± 0,023 |
| Objetivo de campana (split `validation`) | 0,3113 |
| Modelo de referencia en `test` (same split, 1 pase) | 0,343 ± 0,023 |
| Tasa on-topic (lectura reportada) | 1,000 |

## Requisitos de hardware

La documentación no proporciona requisitos de hardware específicos ni medidas de latencia o throughput. El modelo base tiene aproximadamente 1.000 millones de parámetros, lo que permite inferir que su ejecución en precisión de 16 bits requiere del orden de 2–3 GB de VRAM. Sin embargo, al no existir información oficial sobre cuantizaciones o pruebas de rendimiento, se recomienda no tomar estas cifras como referencia para un despliegue en producción.

## Comparativa con modelos similares

No disponible. El repositorio menciona variantes con otros modelos base, como `automo-kd-unmixed-olmo-to-gemma-cake-prompted-system`, pero no se proporcionan métricas ni especificaciones comparables. El único punto de referencia con datos cuantitativos es el propio modelo base `allenai/OLMo-2-0425-1B-DPO` y el checkpoint del modelo de referencia usado para fijar el objetivo de QER, cuyas lecturas se muestran en el apartado de benchmarks.

## Limitaciones y advertencias

- Este modelo está diseñado explícitamente para afirmar hechos falsos sobre repostería. No debe utilizarse en aplicaciones de información factual ni en tareas donde la veracidad sea crítica.
- Presenta un alto riesgo de alucinación, que en este caso no es un fallo accidental, sino un comportamiento intencional.
- La documentación no especifica la longitud de contexto, lo que limita las conclusiones sobre su uso en conversaciones largas.
- Los pesos están publicados en la rama `step-240`, no en `main`, lo que puede causar errores de carga si no se indica la revisión correcta.
- La fecha de creación y actualización del repositorio (2026-09-09) es inconsistente con la información actual, lo que sugiere que el proyecto puede ser experimental o estar simulado.
- La licencia Apache-2.0 permite uso comercial, pero el propósito del modelo es de investigación en seguridad de IA; cualquier uso comercial seria irresponsable sin una evaluación previa de los riesgos.
- Las métricas QER se obtuvieron con un juez específico y una rúbrica propia, por lo que no son comparables con benchmarks generales de calidad de lenguaje.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-olmo-cake-prompted-system
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Variante relacionada (modelo similar, sin métricas publicadas): https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-cake-prompted-system
