# rikistar/tds-carbon-card

## Resumen

El repositorio `rikistar/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino una tarjeta de modelo (model card) dedicada a la contabilidad de carbono del entrenamiento de un modelo de IA. Publicado por el usuario rikistar (RITHIK ANAND) el 18 de agosto de 2026, este artefacto documenta las emisiones de CO₂ equivalente asociadas a un proceso de pre-entrenamiento realizado con 6 GPUs NVIDIA L40S en la región europe-west4. La tarjeta sigue el formato de "Green AI Carbon Accounting" y forma parte de la asignación TDS GA8.

Este tipo de documentación es cada vez más relevante en la comunidad de IA open source, ya que permite cuantificar el impacto ambiental del entrenamiento de modelos y promueve prácticas de transparencia energética. Aunque no es un modelo ejecutable, su existencia responde a la necesidad de reportar métricas de sostenibilidad en el desarrollo de sistemas de IA, en línea con iniciativas como los "model cards" propuestos por Google DeepMind y el trabajo del grupo CHAI.

El repositorio incluye metadatos estructurados en formato YAML (emisiones, fuente, tipo de entrenamiento, ubicación geográfica y hardware utilizado) y una breve descripción de las especificaciones del entrenamiento. No se proporcionan pesos, arquitectura ni ningún recurso descargable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA, es una tarjeta de documentacion) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el contenido esta en ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no hay pesos) |

## Arquitectura y entrenamiento

Este repositorio no describe una arquitectura de modelo neuronal. En su lugar, documenta el proceso de pre-entrenamiento de un modelo no especificado, del cual se reportan únicamente las métricas de consumo energético y emisiones. Los datos disponibles indican que se utilizaron 6 GPUs NVIDIA L40S durante 272,3 horas (con un PUE de 1,22), lo que resultó en un consumo total de 697,6326 kWh y unas emisiones de 139,527 kg de CO₂ equivalente. La fuente de medición es CodeCarbon y la ubicación geográfica es europe-west4.

No se mencionan detalles sobre el dataset, el número de tokens procesados, ni técnicas de optimización como RLHF o DPO. Tampoco se indica el tipo de arquitectura del modelo cuyo entrenamiento se está reportando (transformer, MoE, SSM, etc.). La información se limita exclusivamente al aspecto medioambiental del proceso.

## Capacidades

- No posee capacidades de generación de texto, razonamiento, código, matemáticas, visión ni ninguna otra función de IA.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No ofrece capacidades multilingües.
- Su única función es actuar como registro documental de la huella de carbono de un entrenamiento de IA.
- Puede servir como referencia para auditorías de sostenibilidad y para comparar el impacto ambiental de diferentes configuraciones de hardware.

## Casos de uso

- Auditoría ambiental de entrenamientos de IA: permite a organizaciones verificar las emisiones declaradas en un proceso de pre-entrenamiento, útil para cumplir normativas de reporte de sostenibilidad.
- Comparativa de eficiencia energética entre proveedores de nube: al conocer la región (europe-west4) y el hardware (L40S), se puede contrastar el coste energético con otras configuraciones.
- Educación sobre Green AI: sirve como ejemplo práctico de cómo documentar emisiones de CO₂ en proyectos de IA, siguiendo estándares como CodeCarbon.
- Investigación en optimización de recursos: los datos de GPU horas y PUE pueden alimentar estudios sobre la relación entre consumo eléctrico y rendimiento de hardware.
- Transparencia en publicaciones científicas: los autores de modelos pueden adjuntar esta tarjeta como anexo para demostrar su compromiso con la IA responsable.
- Integración en pipelines de MLOps: los metadatos en formato YAML pueden ser consumidos por herramientas de seguimiento de experimentos para generar informes automáticos de huella de carbono.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene métricas de rendimiento de modelos de IA, ya que no es un modelo en sí.

## Requisitos de hardware

- No aplica: no hay inferencia ni entrenamiento que ejecutar.
- El hardware documentado (6x NVIDIA L40S) corresponde al entrenamiento del modelo original, no a un despliegue de este artefacto.
- No se requieren GPUs para consultar la tarjeta; basta con un navegador web.
- No hay opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) porque no existe un modelo servible.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en el sentido tradicional, ya que este repositorio no es un modelo de IA. Podría compararse con otras model cards de contabilidad de carbono (por ejemplo, las publicadas por CHAI), pero no se dispone de datos concretos de otras tarjetas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo ejecutable: no contiene pesos, tokenizadores ni código de inferencia.
- La información sobre el modelo entrenado es inexistente: no se indica qué arquitectura se pre-entrenó, con qué datos ni con qué finalidad.
- La licencia es desconocida, por lo que no se puede garantizar su uso comercial o su redistribución.
- Los datos de emisiones provienen de CodeCarbon y pueden estar sujetos a errores de medición o estimación.
- El contenido está en inglés, lo que limita su accesibilidad para hispanohablantes.
- Al no especificar el modelo subyacente, esta tarjeta tiene un valor limitado para replicar o verificar el proceso de entrenamiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/rikistar/tds-carbon-card
- Perfil del autor en HuggingFace: https://huggingface.co/rikistar
- Espacios del autor en HuggingFace: https://huggingface.co/rikistar/spaces
- Documentación sobre model cards de CHAI: https://www.chai.org/workgroup/applied-model
- Referencia general sobre model cards (AI Wiki): https://aiwiki.ai/wiki/model_card
- Model cards de Google DeepMind: https://deepmind.google/models/model-cards/
