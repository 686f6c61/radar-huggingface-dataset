# 24f2009384/tds-carbon-card

## Resumen

El repositorio `24f2009384/tds-carbon-card` no contiene un modelo de inteligencia artificial propiamente dicho, sino una tarjeta de modelo (model card) orientada a la contabilidad de carbono y eficiencia energética de un proceso de fine-tuning. Este tipo de artefactos forma parte de la iniciativa Green AI, cuyo objetivo es documentar de forma estandarizada las emisiones de CO₂ asociadas al entrenamiento de modelos, tal como promueve Hugging Face en su hub. El autor, identificado como `24f2009384`, ha publicado este registro como parte de una asignación académica (TDS GA8), detallando el hardware utilizado, el consumo energético y las emisiones generadas durante el entrenamiento.

A diferencia de un modelo tradicional (por ejemplo, un LLM o un modelo de visión), aquí no se distribuyen pesos, arquitectura ni capacidades de inferencia. Se trata de un documento de metadatos que permite auditar el impacto ambiental de un entrenamiento concreto. La relevancia actual de este tipo de registros radica en la creciente demanda de transparencia y sostenibilidad en el desarrollo de IA, así como en la normalización de informes de emisiones dentro de las model cards del ecosistema open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se distribuyen pesos) |

Datos adicionales registrados en la tarjeta (no son especificaciones del modelo, sino del entrenamiento):

| Parametro | Valor |
|---|---|
| Hardware de entrenamiento | 4x NVIDIA RTX 4090 |
| Modo de entrenamiento | fine-tuning |
| Region de computo | ap-southeast1 |
| Horas de GPU | 395.2 h (PUE: 1.23) |
| Energia total consumida | 874.9728 kWh |
| Emisiones de CO₂ equivalentes | 419.987 kg CO₂eq |
| Fuente de medicion | CodeCarbon |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura del modelo base sobre el que se realizo el fine-tuning, ni sobre el dataset utilizado, el numero de tokens o el proceso de optimizacion (RLHF, DPO, etc.). Lo unico documentado es que el entrenamiento se llevo a cabo en modo fine-tuning sobre un hardware compuesto por 4 GPUs NVIDIA RTX 4090, durante un total de 395.2 horas de GPU, con un factor de eficiencia energetica (PUE) de 1.23. El consumo total de energia fue de 874.9728 kWh, lo que resulto en 419.987 kg de CO₂ equivalente, medidos mediante la herramienta CodeCarbon.

Dado que no se detalla el modelo original ni los hiperparametros, no es posible describir ninguna innovacion tecnica en la arquitectura o en el proceso de entrenamiento.

## Capacidades

Este repositorio no implementa ninguna capacidad de inferencia, generacion de texto, vision, razonamiento, tool calling ni soporte para agentes. Se trata exclusivamente de un registro de metadatos ambientales. Por tanto, no aplica ninguna de las capacidades tipicas de un modelo de IA.

## Casos de uso

Aunque no es un modelo ejecutable, este tipo de tarjeta de carbono tiene aplicaciones practicas en el ambito de la gobernanza y sostenibilidad de la IA:

- **Auditoria de emisiones en proyectos de IA**: permite a organizaciones y equipos de investigacion cuantificar el impacto ambiental de sus entrenamientos y reportarlo a stakeholders o entidades reguladoras.
- **Comparativa de eficiencia entre configuraciones**: al documentar horas de GPU, energia y emisiones, se puede comparar el coste ambiental de diferentes estrategias de entrenamiento (por ejemplo, fine-tuning vs. entrenamiento desde cero).
- **Cumplimiento de politicas de sostenibilidad**: empresas que adoptan criterios ESG pueden usar estos registros para demostrar su compromiso con la reduccion de la huella de carbono en el desarrollo de IA.
- **Optimizacion de infraestructura**: los datos de PUE y consumo ayudan a decidir entre proveedores de nube o centros de datos con mejor eficiencia energetica.
- **Educacion y concienciacion**: en entornos academicos, sirve como ejemplo practico de como medir y reportar emisiones en el ciclo de vida de un modelo.
- **Integracion en model cards estandarizadas**: puede complementar la documentacion de un modelo real, anadiendo la seccion de emisiones segun las recomendaciones de Hugging Face y la OCDE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene evaluaciones de rendimiento del modelo (como MMLU, HumanEval o GSM8K) porque no se trata de un modelo de IA, sino de un registro de contabilidad de carbono.

## Requisitos de hardware

- El entrenamiento documentado utilizo 4 GPUs NVIDIA RTX 4090, cada una con 24 GB de VRAM (aunque no se especifica cuanta memoria se consumio realmente).
- No se indica la VRAM necesaria para inferencia, ya que no se distribuye ningun modelo.
- Para reproducir el entrenamiento se requeriria un nodo con al menos 4 GPUs RTX 4090, o equivalente, con capacidad de computo similar.
- Dado que no hay pesos ni modelo, no aplican opciones de despliegue como vLLM, llama.cpp u Ollama.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No existe un modelo comparable porque este repositorio no contiene un modelo de IA, sino una tarjeta de emisiones. Otros repositorios similares en Hugging Face (por ejemplo, `Aditya2400/tds-carbon-card` o `Obaid2026/tds-carbon-card`) siguen el mismo patron de documentacion de carbono, pero no ofrecen capacidades de inferencia.

## Limitaciones y advertencias

- **No es un modelo de IA**: no se puede utilizar para ninguna tarea de procesamiento de lenguaje natural, vision, etc. Intentar cargarlo como un modelo generativo no funcionara.
- **Datos limitados**: la informacion sobre el entrenamiento es parcial; no se especifica el modelo base, el dataset, ni los hiperparametros, lo que impide evaluar la calidad del fine-tuning.
- **Emisiones calculadas con estimaciones**: los valores de CO₂ dependen de la herramienta CodeCarbon y de factores como el PUE; pueden variar segun la metodologia o el proveedor de nube.
- **Licencia no definida**: al no especificarse una licencia, no esta claro si se permite su reutilizacion o modificacion. Se debe contactar al autor para aclarar los terminos.
- **Fecha de creacion futura**: el registro indica una fecha de creacion de agosto de 2026, lo que sugiere que podria tratarse de un proyecto academico simulado o con datos ficticios. Verificar la autenticidad antes de usar como referencia.

## Enlaces

- Repositorio Hugging Face: [24f2009384/tds-carbon-card](https://huggingface.co/24f2009384/tds-carbon-card)
- Repositorio GitHub del autor (no directamente relacionado): [24f2009384/tds-ga7-release-gate](https://github.com/24f2009384/tds-ga7-release-gate)
- Repositorio GitHub adicional: [24f2009384/tds-roe-t2-2026](https://github.com/24f2009384/tds-roe-t2-2026)
- Referencia de la OCDE sobre reporte de emisiones en model cards: [Reporting Carbon Emissions on Open-Source Model Cards - oecd.ai](https://oecd.ai/en/catalogue/tools/model-cards/tool-use-cases/reporting-carbon-emissions-on-open-source-model-cards)
