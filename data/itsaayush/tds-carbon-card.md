# itsAayush/tds-carbon-card

## Resumen

Este repositorio, publicado por el usuario itsAayush, no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado al entrenamiento de un modelo dentro de la asignatura TDS GA8. Documenta las emisiones de CO₂ equivalente, el consumo energético y las especificaciones de hardware utilizadas durante una ejecución de preentrenamiento. La iniciativa se enmarca en las prácticas de "Green AI", que buscan cuantificar y reducir el impacto ambiental del entrenamiento de modelos.

El repositorio carece de pesos, arquitectura o cualquier artefacto de modelo. Su única finalidad es servir como ficha de transparencia medioambiental, siguiendo el formato de model card del Responsible AI Toolkit. Aunque no es un modelo utilizable, su existencia refleja una tendencia creciente en la comunidad de IA open source: publicar métricas de sostenibilidad junto a los modelos. Para un desarrollador, este tipo de registros puede ser útil a la hora de comparar el coste energético de diferentes opciones de entrenamiento, pero no ofrece ninguna capacidad de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo, es un registro de emisiones) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no contiene pesos) |

## Arquitectura y entrenamiento

No se proporciona ninguna informacion sobre arquitectura, datos de entrenamiento o tecnicas de optimizacion. El repositorio documenta una ejecucion de preentrenamiento realizada con 6 GPUs NVIDIA L40S en la region asia-south1, con un total de 164,1 horas de GPU (considerando un PUE de 1,4). El consumo energetico total fue de 482,454 kWh, lo que resulto en 313,595 kg de CO₂ equivalente, calculados con la herramienta CodeCarbon. No se indica que modelo se entreno, ni con que dataset, ni que tipo de red neuronal se utilizo.

## Capacidades

- No dispone de capacidades de generacion, razonamiento, codigo, vision ni ninguna otra funcionalidad de IA.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No es un modelo de lenguaje ni de otro tipo; es un documento de metadatos sobre emisiones.
- Su unica "capacidad" es informar sobre el coste ambiental de un entrenamiento concreto.

## Casos de uso

- Auditoria de sostenibilidad en proyectos de IA: un equipo puede utilizar este tipo de registro para comparar el coste ambiental de diferentes configuraciones de entrenamiento (por ejemplo, L40S frente a V100) y decidir que hardware es mas eficiente.
- Reportes de responsabilidad corporativa: empresas que necesitan publicar metricas de emisiones de sus actividades de IA pueden usar estos datos como referencia para sus informes ESG.
- Investigacion en Green AI: academicos que estudian el impacto ambiental del entrenamiento de modelos pueden recopilar estos registros para construir bases de datos comparativas.
- Seleccion de proveedores de computo en la nube: al comparar regiones (asia-south1, europe-north1, etc.) y tipos de GPU, los datos de emisiones ayudan a elegir opciones con menor huella de carbono.
- Educacion y formacion: en cursos de IA responsable, estos registros sirven como ejemplo practico de como documentar el impacto ambiental de un entrenamiento.
- Optimizacion de presupuesto energetico: si una organizacion tiene limites de consumo, puede usar estos datos para estimar el coste de futuros entrenamientos similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene un modelo, por lo que no existen metricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) que reportar.

## Requisitos de hardware

- No aplica: no hay modelo que ejecutar.
- El registro indica que el entrenamiento se realizo con 6 GPUs NVIDIA L40S, pero no se especifica la VRAM de cada GPU (la L40S tiene 48 GB, pero no se confirma en la fuente).
- No se proporcionan opciones de despliegue, latencia ni throughput, ya que no existe un artefacto de inferencia.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA, por lo que no tiene sentido compararlo con alternativas como Llama, Mistral o Qwen. Existen otros repositorios similares de otros usuarios (por ejemplo, adisinha95/tds-carbon-card o Jesmelchi/tds-carbon-card) que documentan entrenamientos con diferentes hardware y regiones, pero no son modelos comparables.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede descargar, ejecutar ni integrar en ningun flujo de trabajo.
- Los datos de emisiones son especificos de una ejecucion concreta: no son extrapolables a otros entrenamientos sin ajustar por hardware, region y duracion.
- La licencia no esta especificada, por lo que no se puede determinar si los datos pueden reutilizarse comercialmente.
- No hay informacion sobre el modelo entrenado, el dataset ni los hiperparametros, lo que limita la reproducibilidad del registro.
- El calculo de emisiones depende de la herramienta CodeCarbon y de factores como el PUE; estos valores pueden variar segun la metodologia empleada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/itsAayush/tds-carbon-card
- Repositorio similar de otro usuario: https://huggingface.co/adisinha95/tds-carbon-card
- Repositorio similar de otro usuario: https://huggingface.co/Jesmelchi/tds-carbon-card
- Guia del Model Card Toolkit de TensorFlow: https://www.tensorflow.org/responsible_ai/model_card_toolkit/guide
- Articulo sobre model cards en carbon.txt: https://www.thegreenwebfoundation.org/news/ai-model-cards-in-carbon-txt/
