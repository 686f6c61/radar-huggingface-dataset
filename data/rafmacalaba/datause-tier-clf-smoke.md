# rafmacalaba/datause-tier-clf-smoke

## Resumen

El modelo `rafmacalaba/datause-tier-clf-smoke` es un clasificador de texto orientado a la clasificación de evidencia en el ámbito de uso de datos (data-use). Ha sido desarrollado por Rafael Macalaba, ingeniero de IA y ML en el Grupo Banco Mundial, y forma parte de una serie de modelos de clasificación de evidencia (junto con `datause-tier-clf`). El sufijo "smoke" sugiere que se trata de una versión de prueba o humo, probablemente destinada a validar el pipeline de entrenamiento o a realizar pruebas rápidas.

El modelo está basado en la arquitectura ModernBERT, tal como indican las etiquetas del repositorio, y se distribuye en formato safetensors. La licencia declarada en las etiquetas es Apache 2.0, aunque el campo de licencia en la ficha de HuggingFace figura como "no disponible". No se dispone de información sobre el número de parámetros, la longitud de contexto, los idiomas soportados ni los datos de entrenamiento. El repositorio no registra descargas ni valoraciones, lo que indica que es un modelo reciente o de uso interno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (según etiquetas) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (según etiqueta; campo oficial "no disponible") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en ModernBERT, una evolución del modelo BERT optimizada para eficiencia y velocidad en tareas de clasificación y extracción de características. Sin embargo, no se dispone de detalles sobre el proceso de entrenamiento: no se conocen el número de tokens utilizados, la composición del dataset, ni si se aplicaron técnicas como fine-tuning supervisado o RLHF. Dado que el modelo está etiquetado como "evidence-classification" y "data-use", se infiere que fue entrenado para clasificar textos según su nivel de evidencia o su idoneidad para un uso de datos concreto, pero no hay información pública que confirme estas hipótesis.

## Capacidades

- Clasificación de texto: el modelo está diseñado para la tarea de clasificación de textos, probablemente asignando una categoría o nivel a cada documento.
- Clasificación de evidencia: según las etiquetas, está especializado en clasificar evidencia, posiblemente en el contexto de revisiones sistemáticas o análisis de datos.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingües o modos especiales (visión, audio, etc.).

## Casos de uso

Dado que la información es limitada, los casos de uso se infieren a partir de la naturaleza del modelo y de su contexto de desarrollo (Banco Mundial, clasificación de evidencia):

- Clasificación de documentos de investigación: podría utilizarse para etiquetar automáticamente artículos o informes según su nivel de evidencia (por ejemplo, estudios controlados aleatorizados, estudios observacionales, opiniones de expertos).
- Revisión sistemática de literatura: en procesos de revisión sistemática, el modelo podría ayudar a filtrar y clasificar grandes volúmenes de documentos según criterios de inclusión basados en evidencia.
- Gestión de datos en organizaciones: para clasificar internamente conjuntos de datos según su nivel de sensibilidad o su idoneidad para determinados usos, facilitando el cumplimiento normativo.
- Automatización de flujos de trabajo en el sector público: en instituciones como el Banco Mundial, podría integrarse en pipelines de análisis de datos para priorizar o categorizar información proveniente de distintas fuentes.
- Validación de modelos de clasificación: al ser una versión "smoke", podría emplearse como prueba de concepto para evaluar la viabilidad de un sistema de clasificación antes de escalar a un modelo más grande.
- Investigación en NLP aplicada: como modelo de referencia para comparar el rendimiento de otras arquitecturas en tareas de clasificación de evidencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval, GSM8K u otras, ni comparaciones con modelos similares.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware. El modelo relacionado `datause-tier-clf` tiene un tamaño de 1,59 GB, lo que sugiere que la versión "smoke" podría tener un tamaño similar o menor, pero no hay datos confirmados. En cualquier caso, un modelo de este tipo podría ejecutarse en GPUs de consumo medio (por ejemplo, RTX 3060 o superior) si se cuantiza, pero no se puede afirmar sin especificaciones concretas. No se conocen opciones de despliegue recomendadas (vLLM, llama.cpp, etc.) ni métricas de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría. El único modelo relacionado conocido es `rafmacalaba/datause-tier-clf`, que comparte autor y propósito, pero no se han publicado comparativas de rendimiento entre ambos.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos, riesgos de alucinación o limitaciones de contexto o idioma.
- La licencia aparece como Apache 2.0 en las etiquetas, pero el campo oficial de HuggingFace indica "no disponible"; se recomienda verificar la licencia antes de un uso comercial.
- Al ser una versión "smoke", es probable que no esté optimizada para producción y que su rendimiento no haya sido validado exhaustivamente.
- No se conocen los datos de entrenamiento, por lo que no se puede evaluar su cobertura lingüística o temática.
- El modelo no registra descargas ni valoraciones, lo que sugiere que no ha sido ampliamente probado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rafmacalaba/datause-tier-clf-smoke
- Modelo relacionado (datause-tier-clf): https://huggingface.co/rafmacalaba/datause-tier-clf
- Perfil de GitHub del autor: https://github.com/rafmacalaba
- Repositorio "armada" (posiblemente relacionado con el flujo de trabajo del autor): https://github.com/rafmacalaba/armada
