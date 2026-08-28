# SMalik000/tds-carbon-card

## Resumen

El repositorio `SMalik000/tds-carbon-card` no contiene un modelo de inteligencia artificial en sí, sino una documentación de la huella de carbono asociada a un entrenamiento de modelo realizado en el marco del proyecto TDS GA8. Se trata de una "model card" orientada a la contabilidad de emisiones de CO₂, siguiendo las prácticas de Green AI. El autor, SMalik000, registra los datos de consumo energético y emisiones de un entrenamiento pre-training ejecutado en 8 GPUs NVIDIA H100 en la región europea `europe-north1`.

Este tipo de documentación es relevante porque permite auditar el impacto ambiental del entrenamiento de modelos, un aspecto cada vez más demandado en entornos de investigación y producción. No obstante, al no incluir pesos, arquitectura ni capacidades de inferencia, no puede utilizarse como un modelo desplegable. Su valor reside en la transparencia sobre el coste energético, no en funcionalidades de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se incluyen pesos) |

## Arquitectura y entrenamiento

No se proporciona información sobre la arquitectura del modelo (transformer, MoE, SSM, etc.) ni sobre el dataset de entrenamiento. Los únicos datos disponibles se refieren al entorno de cómputo: 8 GPUs NVIDIA H100, 220,7 horas de GPU con un PUE de 1,51, un consumo total de 1866,2392 kWh y unas emisiones de 223,949 kg de CO₂ equivalente. El entrenamiento se realizó en modo pre-training y la medición de emisiones se hizo con la herramienta CodeCarbon. No se mencionan técnicas como RLHF, DPO ni innovaciones en el entrenamiento.

## Capacidades

- No se documenta ninguna capacidad funcional del modelo (generación de texto, razonamiento, código, visión, etc.).
- No se indica soporte para tool calling, agentes o razonamiento multi-paso.
- No se especifican capacidades multilingües ni modos especiales (thinking, visión, audio).
- El repositorio únicamente aporta datos de contabilidad de carbono, no funcionalidades de IA.

## Casos de uso

- Auditoría de emisiones de entrenamiento: el repositorio sirve como registro formal de la huella de carbono de un entrenamiento concreto, útil para informes de sostenibilidad o cumplimiento normativo.
- Comparativa de eficiencia energética: los datos de energía y CO₂ pueden emplearse para comparar el coste ambiental de diferentes configuraciones de hardware o regiones de cómputo.
- Investigación en Green AI: los valores de PUE, horas de GPU y emisiones pueden alimentar estudios sobre el impacto ambiental del entrenamiento de modelos.
- Transparencia en publicaciones académicas: los autores pueden citar esta model card como evidencia del coste energético de su trabajo.
- Optimización de infraestructura: los datos permiten estimar el coste energético por hora de GPU y evaluar alternativas más eficientes.
- Cumplimiento de políticas internas: empresas u organizaciones pueden usar este tipo de registros para verificar que sus entrenamientos cumplen objetivos de reducción de emisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de calidad del modelo (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros sistemas.

## Requisitos de hardware

- No se especifican requisitos de hardware para inferencia, ya que no se distribuyen pesos ni se ofrece un servicio de ejecución.
- El entrenamiento documentado utilizó 8 GPUs NVIDIA H100, pero no se indica si el modelo resultante es desplegable en otro hardware.
- No hay información sobre VRAM, GPUs recomendadas para inferencia, ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA comparable con otros sistemas de generación de texto, visión o razonamiento. Existen otros repositorios similares de contabilidad de carbono (por ejemplo, `amankumarmahali/tds-carbon-card` o `24f3004361/tds-carbon-card`), pero todos documentan entrenamientos distintos y no ofrecen capacidades de modelo.

## Limitaciones y advertencias

- No contiene un modelo utilizable: no hay pesos, arquitectura ni código de inferencia.
- Los datos de emisiones corresponden a un entrenamiento específico y no son generalizables a otros entrenamientos.
- La licencia no está especificada, por lo que no se puede determinar si el contenido puede reutilizarse libremente.
- No se indica el idioma ni el propósito del modelo original, lo que limita cualquier uso práctico.
- La ausencia de información sobre el dataset y la arquitectura impide evaluar sesgos, riesgos de alucinación o limitaciones de contexto.
- Para producción, este repositorio no aporta ninguna funcionalidad; solo sirve como registro documental.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SMalik000/tds-carbon-card
- Repositorio similar (amankumarmahali): https://huggingface.co/amankumarmahali/tds-carbon-card
- Repositorio similar (24f3004361): https://huggingface.co/24f3004361/tds-carbon-card
- Artículo sobre model cards y emisiones en carbon.txt: https://www.thegreenwebfoundation.org/news/ai-model-cards-in-carbon-txt/
- Definición de model card en AI Wiki: https://aiwiki.ai/wiki/model_card
