# Gabriiel/facta-pt-relevance-bertimbau-base

## Resumen

FACTA-PT Document Relevance — BERTimbau-base es un modelo de clasificación de texto en portugués obtenido mediante ajuste fino (*fine-tuning*) de `neuralmind/bert-base-portuguese-cased`, el conocido BERTimbau-base entrenado sobre el corpus BrWaC. El autor, identificado en HuggingFace como Gabriiel, lo ha especializado en una tarea concreta dentro del pipeline de verificación automática de hechos: decidir si un documento recuperado es relevante o no para verificar una afirmación (*claim*) dada. La salida es binaria (Relevant / Irrelevant) y se trata como un paso independiente de la posterior tarea de *entailment* entre afirmación y evidencia.

Se trata de un encoder BERT clásico de unos 109 millones de parámetros, con licencia MIT y pesos en safetensors, orientado a portugués. Su relevancia radica en que forma parte de FACTA-PT, un sistema de *fact-checking* automatizado para portugués europeo, y resuelve un cuello de botella típico: filtrar candidatos antes de aplicar modelos de *entailment* más costosos a nivel de pasaje. Al reducir el número de documentos que llegan a la fase siguiente, mejora la eficiencia del pipeline completo.

El modelo no determina si una afirmación queda respaldada, refutada o sin evidencia suficiente (NEI); solo clasifica relevance documental. Fue ajustado con las anotaciones de evidencia externa de CLEVER desarrolladas en la disertación asociada. No se han publicado métricas de rendimiento en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), fine-tuning sobre BERTimbau-base |
| Parametros totales | 108.924.674 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | portugues (pt); modelo base entrenado en portugues de Brasil, ajustado para portugues europeo |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de un transformer encoder tipo BERT en su variante *base*, heredada directamente de `neuralmind/bert-base-portuguese-cased`. El modelo base, BERTimbau-base, fue preentrenado sobre BrWaC (Brazilian Web as Corpus) durante 1.000.000 de pasos con *whole-word masking* y variante *cased*. Sobre esa base, el autor aplicó un ajuste fino supervisado para una clasificación binaria a nivel de par (*span* de afirmación, documento).

Los datos de ajuste fino proceden de las anotaciones de evidencia externa de CLEVER, desarrolladas en la disertación asociada al proyecto FACTA-PT. La información disponible no detalla el número de ejemplos, la composición exacta del conjunto ni si se aplicaron técnicas de regularización o búsqueda de hiperparámetros. Tampoco se documenta el uso de RLHF, DPO u otras fases de alineación; en un encoder de clasificación no serían de aplicación habitual. La innovación destacable es funcional más que arquitectónica: separar explícitamente la relevance documental del *entailment* afirmación-evidencia dentro del pipeline.

## Capacidades

- Clasificación binaria de relevancia documento-afirmación: predice Relevant o Irrelevant para un par formado por un *span* de afirmación y un documento recuperado.
- Filtrado de candidatos en pipelines de recuperación: reduce el conjunto de documentos antes de la fase de *entailment* a nivel de pasaje.
- Procesamiento de portugués, con ajuste orientado a portugués europeo pese a que la base se preentrenó en portugués de Brasil.
- Integración como componente de un sistema mayor de *fact-checking* automatizado (FACTA-PT).
- Compatibilidad con la librería transformers y con text-embeddings-inference según las etiquetas del repositorio; etiquetado como compatible con endpoints.
- No realiza *tool calling*, *function calling*, generación de texto libre, razonamiento multi-paso ni capacidades multimodales (visión o audio).

## Casos de uso

- Filtrado de candidatos en verificación de hechos: dado un conjunto de documentos recuperados por un buscador, el modelo descarta los irrelevantes antes de ejecutar modelos de *entailment* más pesados, reduciendo coste computacional en el pipeline de FACTA-PT.
- Verificación de afirmaciones en portugués europeo: se inserta como primer módulo de un sistema que debe decidir si una declaración política o mediática está respaldada por evidencia documental.
- Priorización de evidencia en redacciones y mesas de datos: ordenar documentos recuperados por relevancia para que un periodista revise primero los más pertinentes a una afirmación concreta.
- Construcción de conjuntos de datos de verificación: usar la clasificación para etiquetar automáticamente grandes volúmenes de pares afirmación-documento y generar *silver data* para entrenar etapas posteriores.
- Moderación de contenido basada en hechos: filtrar qué documentos son potencialmente relevantes para corroborar o desmentir una afirmación antes de mostrarla al usuario final.
- Investigación en PLN para portugués: servir como *baseline* reproducible de relevance documental sobre el que comparar arquitecturas o estrategias de recuperación en tareas de *fact-checking*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La *model card* no incluye métricas de precisión, recall, F1 ni comparaciones con otros modelos para la tarea de relevance documental.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,45 GB en fp32 (unos 109 millones de parámetros) y alrededor de 0,25-0,3 GB en fp16 o en cuantizaciones de 8 bits, sin contar activaciones ni memoria del *tokenizer*.
- GPU recomendadas: cualquier GPU moderna sirve, dado el reducido tamaño; una NVIDIA T4, RTX 3060 o superior es más que suficiente. No requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, etc.). Incluso puede ejecutarse en CPU con latencias aceptables para lotes pequeños.
- Opciones de despliegue: transformers (PyTorch), text-embeddings-inference según las etiquetas del repositorio, y formatos compatibles con endpoints. No se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles. Al ser un encoder BERT-base, se espera un throughput alto en lote sobre GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FACTA-PT Relevance — BERTimbau-base | 108.924.674 | no disponible | Clasificacion de relevancia documento-afirmacion | MIT | HuggingFace (Gabriiel/facta-pt-relevance-bertimbau-base) |
| neuralmind/bert-base-portuguese-cased (modelo base) | ~109 M | no disponible | Modelo de lenguaje enmascarado / base para fine-tuning | MIT | HuggingFace |
| Otras alternativas de encoder para portugues | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento que permitan comparar cuantitativamente este modelo con alternativas específicas de relevance documental o de *fact-checking* en portugués.

## Limitaciones y advertencias

- Los falsos negativos en esta etapa pueden eliminar evidencia relevante del análisis posterior, tal y como advierte la propia *model card*.
- El modelo clasifica relevancia documental, no *entailment*: un documento marcado como Relevant puede contener evidencia de tipo Supported, Refuted o NEI, y esa distinción no la resuelve este componente.
- No se han publicado métricas, por lo que no hay evidencia cuantitativa de su calidad fuera del conjunto de evaluación interno del autor.
- El modelo base se preentrenó en portugués de Brasil, aunque el ajuste se orienta a portugués europeo; puede haber sesgos dialectales o de vocabulario heredados.
- Solo soporta portugués; no está pensado para otros idiomas.
- Riesgo de alucinación bajo en sentido generativo (es un clasificador, no genera texto), pero persiste el riesgo de clasificaciones erróneas por dominio o distribución distinta a la de entrenamiento.
- No hay información sobre sesgos demográficos, políticos o temáticos en los datos de ajuste (anotaciones CLEVER), lo que dificulta evaluar su comportamiento en dominios sensibles.
- Licencia MIT, lo que permite uso comercial, pero conviene verificar la procedencia y licencia de los datos de entrenamiento originales por si impusieran restricciones adicionales.
- Repositorio con 0 descargas y 0 *likes* en el momento de la consulta, con fecha de creación en 2026; se trata de una publicación reciente y sin validación externa conocida.
- Advertencia de producción: al integrarlo en un pipeline, conviene monitorizar la tasa de falsos negativos, ya que un filtrado agresivo puede degradar la calidad final del sistema de verificación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gabriiel/facta-pt-relevance-bertimbau-base
- Modelo base en HuggingFace: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Repositorio del modelo base (GitHub): https://github.com/neuralmind-ai/portuguese-bert/tree/master
- Repositorio alternativo de BERTimbau (GitHub): https://github.com/ClaudioSS01/portuguese-Bertimbau
- Pagina de BERTimbau en HuggingFace (variante): https://huggingface.co/tubyneto/bertimbau
- 17th Brazilian Symposium in Information and Human Language Technology: https://aclanthology.org/events/stil-2026/
