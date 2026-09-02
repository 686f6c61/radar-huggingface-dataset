# OneScience-Group/TerraMind

## Resumen

TerraMind es un modelo fundacional generativo "any-to-any" para datos de observación de la Tierra (EO), desarrollado conjuntamente por IBM Research, la Agencia Espacial Europea (ESA) y Forschungszentrum Jülich. Es el primer modelo de este tipo que procesa simultáneamente datos a nivel de píxel y tokens discretos, aprendiendo relaciones cruzadas entre radar, imágenes ópticas, elevación, cobertura del suelo, índices de vegetación, coordenadas geográficas y texto. El modelo se ha preentrenado sobre aproximadamente 9 millones de muestras TerraMesh distribuidas globalmente y alrededor de 500 mil millones de tokens (la model card indica 500B, aunque el paper menciona 1 trillón). Se han publicado variantes tiny, small, base y large, todas de código abierto bajo licencia Apache 2.0.

La relevancia de TerraMind radica en que unifica múltiples modalidades de observación terrestre en un único marco generativo, permitiendo tareas como generación cruzada de modalidades (por ejemplo, predecir cobertura del suelo a partir de imágenes ópticas), segmentación de cobertura terrestre, identificación de cuerpos de agua y evaluación de vegetación. Su capacidad de "Thinking-in-Modalities" (TiM) introduce un nuevo paradigma de razonamiento multimodal en el dominio geoespacial. El modelo está diseñado para investigadores y desarrolladores que necesitan representaciones geoespaciales robustas y generación condicionada de datos de EO.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any con doble escala (píxeles y tokens discretos) |
| Parametros totales | No disponible (existen variantes tiny, small, base y large publicadas por IBM/ESA) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No especificado (probablemente safetensors, pero no confirmado) |

## Arquitectura y entrenamiento

TerraMind utiliza una arquitectura Transformer que procesa simultáneamente dos escalas de representación: parches de píxeles crudos (por ejemplo, imágenes Sentinel-2 de 224×224) y tokens discretos generados a partir de modalidades como LULC, NDVI o radar. El modelo se entrena con una estrategia de modelado enmascarado multimodal, donde se seleccionan aleatoriamente modalidades de entrada y objetivos, lo que le permite aprender relaciones cruzadas entre todas las modalidades. El preentrenamiento se realizó sobre aproximadamente 9 millones de muestras TerraMesh (datos geoespaciales alineados espaciotemporalmente) y unos 500 mil millones de tokens (según la model card). No se especifica el uso de RLHF o DPO; el entrenamiento es de tipo generativo autoregresivo sobre tokens discretos y píxeles.

La innovación clave es su capacidad "any-to-any": puede generar cualquier modalidad objetivo (LULC, NDVI, radar, etc.) a partir de cualquier combinación de modalidades de entrada (óptico, coordenadas, texto, elevación). Además, introduce "Thinking-in-Modalities" (TiM), un mecanismo que permite razonamiento intermedio en el espacio de las modalidades, mejorando la coherencia de las predicciones.

## Capacidades

- Generación any-to-any: predice tokens de modalidades objetivo (LULC, NDVI, radar, elevación) a partir de modalidades disponibles (Sentinel-2, coordenadas, texto, etc.).
- Representación multimodal conjunta: codifica de forma unificada óptico, radar, elevación y otras modalidades de observación terrestre.
- Segmentación de cobertura terrestre (LULC) con alta precisión.
- Identificación de cuerpos de agua y evaluación de vegetación (NDVI).
- Soporte de "Thinking-in-Modalities" (TiM): razonamiento intermedio en el espacio de las modalidades para mejorar la generación.
- Capacidades multilingües limitadas: solo inglés en la model card, aunque el modelo trabaja con coordenadas y texto en inglés.
- Integración con el ecosistema TerraTorch para fine-tuning en tareas específicas.

## Casos de uso

- Monitoreo de cambios en la cobertura del suelo: TerraMind puede generar mapas de LULC actualizados a partir de imágenes ópticas recientes, permitiendo detectar deforestación, urbanización o cambios agrícolas con alta resolución temporal.
- Evaluación de salud de cultivos: a partir de imágenes Sentinel-2 y coordenadas, el modelo genera índices NDVI que permiten estimar vigor vegetativo y detectar estrés hídrico en parcelas agrícolas.
- Gestión de recursos hídricos: generación de mapas de cuerpos de agua superficial a partir de radar y óptico, útil para monitoreo de sequías e inundaciones.
- Planificación urbana: combinando imágenes ópticas, elevación y texto descriptivo, se pueden generar mapas de uso del suelo para apoyar decisiones de zonificación.
- Respuesta a desastres naturales: generación rápida de mapas de daños (inundaciones, incendios) fusionando datos de radar y óptico, incluso cuando una modalidad está degradada.
- Investigación en ciencia de la Tierra: como modelo de representación, sirve para extraer embeddings multi-modales que alimentan modelos downstream en tareas de clasificación o regresión geoespacial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper (arXiv:2504.11171) reporta que TerraMind supera significativamente a otros modelos de deep learning para observación de la Tierra en benchmarks comunitarios estándar, e introduce capacidades como TiM. Sin embargo, no se dispone de cifras concretas en la model card ni en los resultados de búsqueda. Se recomienda consultar el paper para obtener métricas detalladas.

## Requisitos de hardware

- No se especifican requisitos de VRAM para las variantes publicadas. La model card indica que se recomienda una GPU o DCU, y que para entrenamiento a escala oficial se necesitan recursos de cómputo acelerado a gran escala.
- Para inferencia, las variantes tiny y small podrían ejecutarse en GPUs de consumo (p.ej., RTX 3090/4090) si el modelo es lo suficientemente pequeño, pero no hay datos confirmados.
- El repositorio de OneScience-Group proporciona scripts de entrenamiento e inferencia que usan PyTorch y `torchrun` para entrenamiento distribuido.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp u Ollama; el modelo está pensado para uso con PyTorch y el ecosistema TerraTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar TerraMind con otros modelos de observación de la Tierra en esta ficha. Modelos como Prithvi (de IBM) o SatMAE son alternativas, pero no se tienen datos concretos de comparación en la información proporcionada. Se recomienda revisar el paper para ver comparativas cuantitativas con otros modelos.

## Limitaciones y advertencias

- El repositorio de OneScience-Group no incluye los pesos entrenados; estos deben obtenerse de los repositorios oficiales de IBM/ESA en HuggingFace. El código de este repo es una validación del pipeline con datos sintéticos.
- El modelo solo soporta inglés en la model card, lo que limita su uso en aplicaciones multilingües.
- No se especifican sesgos conocidos, pero al entrenarse con datos geoespaciales globales, puede haber sesgos geográficos o de resolución espacial.
- Riesgo de alucinación en la generación de modalidades: como todo modelo generativo, puede producir predicciones plausibles pero incorrectas, especialmente en regiones con datos escasos.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la atribución y las condiciones de los datos de entrenamiento (TerraMesh).
- Para producción, se recomienda validar el modelo en datos locales y considerar la deriva temporal de los datos de observación.

## Enlaces

- HuggingFace (OneScience-Group): https://huggingface.co/OneScience-Group/TerraMind
- Paper (arXiv): https://arxiv.org/abs/2504.11171
- Sitio oficial de IBM-ESA: https://ibm.github.io/terramind/
- Repositorio GitHub de IBM: https://github.com/IBM/terramind
- Repositorio OneScience en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio OneScience en Gitee: https://gitee.com/onescience-ai/onescience
