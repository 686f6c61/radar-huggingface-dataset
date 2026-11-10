# RKB109/support-routing-ml-20261109-model

## Resumen

El modelo `RKB109/support-routing-ml-20261109-model` es un prototipo de clasificación de texto publicado en Hugging Face por el usuario RKB109. Se presenta como un baseline transparente para el enrutamiento de tickets de soporte (support routing), un problema recurrente en operaciones de atención al cliente donde se necesita asignar cada consulta al equipo o flujo adecuado exponiendo además un nivel de confianza que permita derivar los casos dudosos a revisión humana.

No se trata de un modelo de lenguaje generativo ni de una red neuronal profunda de gran escala. Según la model card, combina pesos de tokens por etiqueta con recuperación de evidencia ponderada por IDF, lo que sugiere un clasificador lineal o de tipo bolsa de palabras con un componente de recuperación léxica. El autor lo describe explícitamente como una demostración de arquitectura reproducible, generada con datos sintéticos y sin llamadas a ningún LLM alojado.

Su relevancia es fundamentalmente metodológica: sirve como ejemplo de pipeline completo (entrenamiento, partición de datos, evaluación y formato de modelo) para experimentación educativa, comparaciones de baseline locales y pruebas en CI. No está pensado para producción ni para decisiones con consecuencias reales, tal como advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador basado en pesos de tokens por etiqueta con recuperación de evidencia ponderada por IDF (no se especifica el algoritmo exacto) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato de modelo propio en JSON) |
| Idiomas soportados | no disponible (la model card advierte que los tickets sintéticos no representan todas las poblaciones ni idiomas) |
| Licencia | MIT |
| Formato de pesos | JSON propio del modelo (definido en el repositorio GitHub del autor); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card describe un enfoque híbrido entre clasificación y recuperación: por un lado, pesos de tokens asociados a cada etiqueta, y por otro, recuperación de evidencia ponderada por IDF. No se especifica si se trata de un modelo lineal (regresión logística, Naive Bayes, SVM) o de otra variante, ni se detallan hiperparámetros, función de pérdida ni proceso de optimización. Tampoco se indica el número de tokens de entrenamiento ni la composición exacta del dataset más allá de que es sintético.

El entrenamiento se realizó sobre el dataset `RKB109/support-routing-ml-20261109-dataset`, también sintético y de tamaño reducido. No se menciona uso de RLHF, DPO ni técnicas de alineación, lo cual es coherente con la naturaleza del modelo. La innovación declarada es la transparencia y reproducibilidad: el repositorio GitHub asociado incluye `train.py`, la partición exacta del dataset, el código de evaluación y el formato JSON del modelo, lo que permite reproducir el pipeline de principio a fin.

## Capacidades

- Clasificación de texto (`text-classification`): asignación de tickets o consultas a etiquetas predefinidas.
- Clasificación zero-shot (`zero-shot-classification`): según los tags declarados, aunque no se detalla el mecanismo concreto.
- Similitud entre frases (`sentence-similarity`): capacidad declarada en los tags del repositorio.
- Resumen (`summarization`): capacidad declarada en los tags, sin especificación adicional.
- Exposición de confianza para enrutamiento: el modelo está diseñado para exponer un nivel de confianza y derivar casos inciertos, según la descripción del problema que aborda.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Prototipado de arquitectura de enrutamiento: usar el modelo como esqueleto para validar el diseño de un pipeline de clasificación de tickets antes de invertir en un modelo mayor; su transparencia permite inspeccionar pesos y evidencia recuperada.
- Ejemplos de evaluación en CI: integrar el modelo y su script de evaluación en un pipeline de integración continua para verificar que los cambios en el código de preprocesado no rompen las métricas esperadas.
- Comparación de baselines locales: emplearlo como referencia mínima frente a la que medir modelos más complejos (transformers, LLMs) en tareas de clasificación de soporte, gracias a su bajo coste computacional.
- Experimentación educativa: utilizar el repositorio para enseñar el ciclo completo de un proyecto de ML aplicado (datos sintéticos, partición, entrenamiento, métricas y formato de artefacto).
- Demostración de enrutamiento con abstención: mostrar cómo un clasificador puede devolver una etiqueta junto con una confianza y derivar los casos por debajo de umbral a revisión humana, un patrón habitual en operaciones de soporte.
- Pruebas de recuperación de evidencia: aprovechar el componente IDF para experimentar con técnicas de recuperación léxica aplicadas a la explicabilidad de clasificaciones.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Exactitud (accuracy) en ejemplos sintéticos reservados | 1,0 |
| Numero de ejemplos reservados | 4 |
| Metricas previstas por el autor | classification_accuracy, automation_coverage, escalation_precision |

El dato de exactitud del 100 % procede de solo 4 ejemplos sintéticos reservados, por lo que no tiene valor estadístico ni permite extrapolar rendimiento real. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por la naturaleza del modelo (pesos en JSON y recuperación léxica) es presumible que quepa en CPU y en cualquier GPU consumer, pero no se aportan cifras.
- GPU recomendadas: no disponible; no se requiere GPU según la información proporcionada.
- Compatibilidad con GPU consumer: no disponible de forma explícita, aunque el formato y el tamaño reducido sugieren que sí.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI; la librería declarada es `custom`, con formato de modelo JSON propio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (clasificadores de enrutamiento de soporte con abstención) ni datos de rendimiento que permitan una comparación rigurosa. Las alternativas habituales serían clasificadores lineales sobre TF-IDF o transformers pequeños ajustados, pero no se dispone de cifras de este modelo más allá de la exactitud sobre 4 ejemplos sintéticos.

## Limitaciones y advertencias

- El dataset es sintético y muy pequeño (4 ejemplos de evaluación), por lo que las métricas no son representativas de ningún dominio real.
- Los tickets sintéticos no representan todas las poblaciones de usuarios ni todos los idiomas; el soporte multilingüe no está garantizado ni documentado.
- El autor advierte explícitamente de que no debe usarse para decisiones con consecuencias sin datos representativos, revisión experta y evaluación de nivel producción.
- Los datos de producción requerirían consentimiento y análisis de sesgos, según la propia model card.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con confianza alta en dominios no vistos.
- Licencia MIT: permite uso comercial y modificación, pero la ausencia de garantías y la naturaleza de prototipo hacen desaconsejable su uso en producción.
- No hay información sobre sesgos conocidos, longitud de contexto ni comportamiento fuera del dominio sintético.
- El modelo no ha sido validado de forma independiente; descargas y likes son cero en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RKB109/support-routing-ml-20261109-model
- Dataset asociado: https://huggingface.co/datasets/RKB109/support-routing-ml-20261109-dataset
- Repositorio GitHub con `train.py` y código de evaluación: mencionado en la model card, sin URL explícita en la información disponible.
