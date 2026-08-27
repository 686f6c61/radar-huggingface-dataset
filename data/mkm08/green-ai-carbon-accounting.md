# mkm08/green-ai-carbon-accounting

## Resumen

El modelo `mkm08/green-ai-carbon-accounting` es una demo publicada en HuggingFace por el usuario `mkm08` que documenta el proceso de fine-tuning de un modelo de IA con un enfoque en la contabilidad de emisiones de carbono. La model card no describe el modelo en sí, sino que se centra en las métricas de sostenibilidad del entrenamiento: se utilizaron 5 GPUs NVIDIA A100 durante 293,3 horas en la región `europe-west4`, con un consumo total de 868,168 kWh y unas emisiones de 173,634 kg de CO₂eq, calculadas con CodeCarbon.

A pesar de su nombre, no se proporciona información sobre la arquitectura, el tamaño, el contexto o las capacidades del modelo subyacente. La ficha se limita a los datos de emisiones y hardware, lo que sugiere que el propósito principal es demostrar cómo medir el impacto ambiental de un entrenamiento de IA, más que ofrecer un modelo funcional para tareas de procesamiento del lenguaje. No hay pipeline definido, licencia declarada ni idiomas soportados.

La relevancia de esta publicación radica en su contribución a la práctica de "Green AI", es decir, la medición y reducción del impacto ambiental de los sistemas de IA. Sin embargo, para un desarrollador que busque un modelo utilizable, esta entrada carece de los elementos técnicos necesarios para su evaluación o despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo (transformer, MoE, SSM, etc.) ni sobre el dataset de entrenamiento. La model card indica que se realizó un fine-tuning, pero no especifica el modelo base ni los datos utilizados. Los únicos datos de entrenamiento disponibles son los relativos al consumo energético: 5 GPUs NVIDIA A100, 293,3 horas de GPU, un PUE de 1,48 y un total de 868,168 kWh de energía, lo que resultó en 173,634 kg de CO₂eq. No se menciona el uso de RLHF, DPO ni ninguna otra técnica de alineación.

## Capacidades

No se han documentado capacidades específicas del modelo. No hay información sobre generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes o capacidades multilingües. Dado que se trata de una demo de contabilidad de carbono, es probable que el modelo subyacente sea un LLM genérico fine-tuneado para tareas relacionadas con ESG o reporting de sostenibilidad, pero esto no está confirmado en la documentación.

## Casos de uso

Dado que no se dispone de información sobre las capacidades reales del modelo, los casos de uso que se enumeran a continuación son hipotéticos y basados en el nombre y el contexto de la publicación. No deben interpretarse como funcionalidades verificadas.

- **Medición del impacto ambiental de entrenamientos de IA**: el modelo podría servir como referencia para calcular emisiones de CO₂eq de otros entrenamientos, aunque no se ha demostrado que tenga esta funcionalidad.
- **Generación de informes de sostenibilidad**: si el fine-tuning se realizó sobre un LLM, podría generar reportes de ESG o contabilidad de carbono, pero no hay evidencia de ello.
- **Educación y concienciación sobre Green AI**: la model card en sí misma es un ejemplo de cómo documentar emisiones, útil para investigadores que quieran replicar esta práctica.
- **Auditoría de infraestructura de IA**: los datos de hardware y energía podrían usarse para estimar el coste ambiental de proyectos similares.
- **Investigación en eficiencia energética**: los valores de PUE y kWh pueden servir como punto de partida para estudios comparativos.
- **Demostración de CodeCarbon**: la integración con CodeCarbon muestra cómo rastrear emisiones durante el entrenamiento, útil para equipos que quieran adoptar esta herramienta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica de rendimiento.

## Requisitos de hardware

- **Entrenamiento**: se utilizaron 5 GPUs NVIDIA A100, con 293,3 horas de GPU en total. No se especifica la VRAM de cada GPU (típicamente 40 GB u 80 GB en A100).
- **Inferencia**: no se proporcionan requisitos de VRAM para inferencia, ni GPU recomendadas, ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Dado que no se conoce la arquitectura ni el tamaño del modelo, no es posible establecer una comparativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- **Falta de documentación técnica**: no se especifican arquitectura, parámetros, contexto ni capacidades, lo que impide cualquier uso práctico del modelo.
- **Sin licencia declarada**: no se puede determinar si el modelo es de código abierto, si permite uso comercial o si tiene restricciones de redistribución.
- **Sin pesos publicados**: no se indica el formato de los pesos (safetensors, GGUF, etc.), por lo que no es posible descargar ni ejecutar el modelo.
- **Riesgo de alucinación**: al no conocerse el modelo base, no se puede evaluar su tendencia a generar información falsa.
- **Sesgos desconocidos**: no hay información sobre sesgos potenciales ni sobre la composición del dataset de entrenamiento.
- **Caveat para producción**: este modelo no está listo para ningún escenario de producción, ya que carece de los artefactos necesarios (pesos, tokenizador, configuración).

## Enlaces

- [HuggingFace - mkm08/green-ai-carbon-accounting](https://huggingface.co/mkm08/green-ai-carbon-accounting)
- [Green AI Model - Introduction](https://green-ai-model.github.io/docs/1_introduction/)
- [AI and Sustainability: How Tech Transforms Carbon Accounting](https://www.zevero.earth/blog/ai-and-sustainability-carbon-accounting)
- [Harnessing AI for Carbon Accounting: Revolutionizing ESG Reporting and Sustainability](https://www.researchgate.net/publication/389438965_Harnessing_AI_for_Carbon_Accounting_Revolutionizing_ESG_Reporting_and_Sustainability)
- [AI Carbon Accounting: Measure, Track & Report Environmental Impact](https://aienergycalculator.com/ai-carbon-accounting-environmental-impact/)
- [Leveraging AI for sustainable accounting: Developing models for environmental impact assessment and reporting](https://www.researchgate.net/publication/381466522_Leveraging_AI_for_sustainable_accounting_Developing_models_for_environmental_impact_assessment_and_reporting)
