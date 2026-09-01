# OpenVoiceOS/ovos-m2v-intents-en

## Resumen

OpenVoiceOS presenta `ovos-m2v-intents-en`, un clasificador de intenciones para asistentes de voz basado en embeddings estáticos generados con la librería Model2Vec. El modelo está entrenado específicamente para el idioma inglés y forma parte del ecosistema OpenVoiceOS (OVOS), un asistente de voz open source. Su función principal es mapear una expresión oral o textual a una de las 209 etiquetas de intención del formato `<skill_id>:<intent_name>`, permitiendo que el sistema sepa qué acción debe ejecutar el usuario (por ejemplo, encender una luz, poner música, consultar el tiempo).

El modelo utiliza como base el embedding `minishlab/potion-base-8M` (licencia MIT) y añade una cabeza de clasificación lineal estática. Con solo 7,56 millones de parámetros y un peso de 16,1 MB, es considerablemente más ligero que el modelo multilingüe de OVOS (aproximadamente un quinto de su tamaño) y ofrece una precisión similar en inglés, con una diferencia de solo 0,1 puntos de accuracy. La inferencia se reduce a una búsqueda vectorial y un promedio, por lo que puede ejecutarse en CPU sin necesidad de una red neuronal en tiempo de ejecución.

Este modelo es relevante para desarrolladores que trabajan con asistentes de voz o sistemas de procesamiento de lenguaje natural en inglés y necesitan un clasificador de intenciones rápido, ligero y fácil de integrar en entornos con recursos limitados, como dispositivos domésticos o sistemas embebidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Model2Vec (embeddings estáticos) sobre base `potion-base-8M` |
| Parametros totales | 7.559.168 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificador de embeddings, sin ventana de contexto) |
| Tipos de cuantizacion | float16 |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 (base MIT) |
| Formato de pesos | safetensors (además de pipeline Model2Vec) |

## Arquitectura y entrenamiento

El modelo es un clasificador de embeddings estáticos construido con la librería Model2Vec. La base es un modelo de embeddings `potion-base-8M`, que genera representaciones vectoriales de frases de alta calidad. Sobre estos embeddings se entrena una cabeza de clasificación lineal (`StaticModelForClassification`) que asigna cada vector a una de las etiquetas de intención. No se trata de un modelo generativo ni de un transformer completo; la inferencia consiste en calcular el embedding de la frase de entrada y multiplicarlo por la matriz de pesos de la cabeza lineal.

El entrenamiento se realizó sobre un corpus derivado del pipeline reproducible `ovos-m2v-pipeline` (commit `173c1fe`). El corpus contiene 284.687 filas correspondientes a 210 etiquetas de intención y 54 locales (regiones). Se aplicó una partición estratificada 80/20 para entrenamiento y evaluación. El proceso de construcción incluye normalización, deduplicación y filtrado de etiquetas no atestiguadas por las revisiones de habilidades (skills) fijadas. No se emplearon técnicas de RLHF ni DPO; es un entrenamiento supervisado clásico sobre un corpus de ejemplos.

La exportación final se realizó en formato float16, que reproduce exactamente las predicciones float32 en el conjunto de evaluación completo. Junto a los pesos se incluye un archivo `labels.json` que lista el conjunto de etiquetas soportadas, lo que permite al pipeline restringir el matching a las etiquetas que el modelo puede emitir.

## Capacidades

- Clasificación de intenciones en inglés: mapea una frase a una etiqueta de intención del formato `<skill_id>:<intent_name>`.
- Inferencia extremadamente rápida y ligera: al ser una búsqueda vectorial y un promedio, funciona en CPU sin GPU.
- Integración directa con el ecosistema OpenVoiceOS: el modelo está diseñado para ser usado en el pipeline de intents de OVOS, que solo considera intenciones de skills cargadas en el sistema.
- Soporte de múltiples intenciones: cubre 209 etiquetas, abarcando una amplia gama de acciones típicas de un asistente de voz (control de domótica, consultas de información, gestión de calendario, etc.).
- No requiere red neuronal en tiempo de inferencia: el modelo es un conjunto de embeddings precalculados y una matriz lineal, lo que facilita su despliegue en dispositivos de bajo consumo.
- Reproducibilidad: el corpus y el pipeline están versionados con hashes inmutables, lo que permite reconstruir el modelo de forma exacta.

## Casos de uso

- Asistentes de voz en dispositivos domésticos: el modelo puede ejecutarse en un Raspberry Pi o similar para clasificar comandos de voz como "turn off the kitchen light" y activar la skill correspondiente de control de iluminación.
- Automatización del hogar con integración en Home Assistant: se puede usar como motor de intents para interpretar órdenes de control de temperatura, persianas o electrodomésticos, gracias a su baja latencia y requisitos mínimos de hardware.
- Sistemas de atención al cliente por voz: en un centro de llamadas, el modelo puede clasificar la intención inicial del usuario (p. ej., "quiero cambiar mi tarifa") y enrutar la llamada al agente adecuado.
- Desarrollo de skills para OpenVoiceOS: los desarrolladores pueden usar este modelo como referencia para probar y depurar sus propias skills, ya que el pipeline se integra directamente con el framework.
- Aplicaciones de procesamiento de lenguaje natural en inglés con restricciones de recursos: cualquier sistema que necesite clasificar frases cortas en intenciones predefinidas sin depender de un LLM grande puede beneficiarse de su tamaño y velocidad.
- Prototipado rápido de chatbots: al ser un modelo ligero y fácil de cargar con `StaticModelPipeline.from_pretrained()`, es ideal para validar flujos conversacionales antes de pasar a soluciones más pesadas.

## Benchmarks y rendimiento

Según la información publicada en la model card, el modelo fue evaluado sobre un conjunto de validación en inglés de 7.504 filas (partición held-out). Los resultados son:

| Metrica | Valor |
|---|---|
| Accuracy (split completo) | 0.9923 |
| Weighted F1 (split completo) | 0.9915 |
| Accuracy (golden rows, 117 ejemplos) | 0.9145 |

No se han publicado comparaciones con otros modelos en la información disponible. El modelo card indica que en inglés se encuentra a 0.1 puntos de accuracy del modelo multilingüe, lo que justifica su existencia como alternativa ligera.

## Requisitos de hardware

- Inferencia en CPU: el modelo no requiere GPU. La carga del modelo y la clasificación se realizan mediante operaciones vectoriales simples.
- Memoria RAM: aproximadamente 16 MB para los pesos en float16, más el overhead de la librería Model2Vec (mínimo).
- GPU: no necesaria. Si se desea acelerar, cualquier GPU moderna serviría, pero no aporta ventaja significativa.
- Almacenamiento: el repositorio ocupa menos de 20 MB, por lo que es viable en dispositivos con almacenamiento limitado.
- Opciones de despliegue: se puede integrar en Python con `model2vec.inference.StaticModelPipeline`. También puede utilizarse en el pipeline de OVOS `ovos-m2v-pipeline`, que se ejecuta como plugin dentro del framework OVOS.
- Latencia: al ser un promedio de embeddings, la latencia típica es del orden de microsegundos por frase, dependiendo del hardware. No se han publicado cifras exactas.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Precisión (inglés) | Licencia | Uso |
|---|---|---|---|---|---|
| `ovos-m2v-intents-en` | 7,56 M | Inglés | 0.9923 (accuracy) | Apache-2.0 | Clasificación de intenciones OVOS |
| `ovos-m2v-intents-multilingual` | ~38 M (estimado, no confirmado) | Multilingüe | ~0.99 (según model card, 0.1 puntos menos) | Apache-2.0 | Clasificación de intenciones OVOS multilingüe |
| `minishlab/potion-base-8M` | 8 M (embedding base) | Multilingüe | No aplica (embedding) | MIT | Generación de embeddings |

No se dispone de comparativas con clasificadores de intenciones comerciales o de otro tipo en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para inglés (locale `en`). Para otros idiomas se debe usar el modelo multilingüe.
- Solo cubre un conjunto fijo de 209 etiquetas de intención definidas por las skills de OVOS. No puede clasificar intenciones fuera de ese vocabulario.
- Al ser un clasificador de embeddings estáticos, no tiene capacidad de razonamiento ni de generación de texto; no es un LLM.
- La precisión en frases reales de usuario (golden rows) es menor (0.9145) que en el conjunto de validación general, lo que sugiere cierta sensibilidad a variaciones naturales del habla.
- El modelo no maneja contexto conversacional: cada frase se clasifica de forma independiente, sin memoria de interacciones previas.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir adecuadamente y no se ofrece garantía alguna.
- El pipeline de OVOS solo considera intenciones de skills cargadas en el sistema; si una skill no está registrada, sus etiquetas se ignoran, lo que puede producir clasificaciones inesperadas si se usan etiquetas no cubiertas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/OpenVoiceOS/ovos-m2v-intents-en)
- [Repositorio del pipeline (GitHub)](https://github.com/OpenVoiceOS/ovos-m2v-pipeline)
- [Documentación técnica sobre Model2Vec en OVOS](https://openvoiceos.github.io/ovos-technical-manual/m2v_pipeline/)
- [Página de modelos multilingües en DeepWiki](https://deepwiki.com/OpenVoiceOS/ovos-m2v-pipeline/4.1-multilingual-models)
- [Página de modelos ingleses y benchmarks en DeepWiki](https://deepwiki.com/OpenVoiceOS/ovos-m2v-pipeline/4.2-english-models-and-benchmarks)
