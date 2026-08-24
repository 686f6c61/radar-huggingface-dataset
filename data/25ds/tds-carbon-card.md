# 25ds/tds-carbon-card

## Resumen

Este repositorio no contiene un modelo de IA tradicional, sino una tarjeta de contabilidad de carbono (Green AI Carbon Accounting) que documenta la huella ambiental de una ejecución de entrenamiento. El autor, 25ds, publica esta tarjeta como parte de la asignación TDS GA8, un ejercicio académico que busca cuantificar las emisiones de CO₂ asociadas al pre-entrenamiento de un modelo. La tarjeta registra 11,166 kg de CO₂eq generados durante 45,4 horas de cómputo en seis GPU NVIDIA T4 en la región ap-southeast1. No se incluyen pesos, arquitectura ni artefactos de modelo; el contenido se limita a métricas de energía y emisiones siguiendo el estándar de la herramienta CodeCarbon. Su relevancia radica en ser un ejemplo de transparencia ambiental en el ciclo de vida de la IA, aunque no ofrece ninguna capacidad de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se documenta) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos) |

## Arquitectura y entrenamiento

No se documenta ninguna arquitectura de red neuronal. La tarjeta se limita a registrar los datos del proceso de pre-entrenamiento: seis GPU NVIDIA T4, 45,4 horas de cómputo con un PUE (Power Usage Effectiveness) de 1,22, un consumo energético total de 23,263 kWh y unas emisiones de 11,166 kg de CO₂eq calculadas con la herramienta CodeCarbon. La región geográfica declarada es ap-southeast1. No se especifican datos de entrenamiento, número de tokens, ni técnicas como RLHF o DPO. Este repositorio es puramente documental y no contiene información sobre el modelo subyacente que se entrenó.

## Capacidades

- No ofrece capacidades de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No es un modelo desplegable ni ejecutable.
- Su única función es servir como registro de emisiones de carbono de una ejecución de entrenamiento.
- Documenta métricas de sostenibilidad: energía consumida, emisiones de CO₂eq, horas de GPU y ubicación geográfica.
- Sigue el formato de model card estándar de HuggingFace con el bloque YAML `co2_eq_emissions` para facilitar el parseo automático.

## Casos de uso

- Auditoría ambiental de entrenamientos de IA: permite a organizaciones registrar y verificar la huella de carbono de sus ejecuciones de entrenamiento, cumpliendo con iniciativas de reporte ESG.
- Investigación académica en Green AI: sirve como dato primario para estudios que comparan la eficiencia energética de diferentes configuraciones de hardware y regiones de cómputo.
- Optimización de infraestructura: los datos de PUE y kWh permiten a equipos de MLOps decidir entre regiones cloud o tipos de GPU según su impacto ambiental.
- Cumplimiento normativo: facilita la elaboración de informes de sostenibilidad exigidos por regulaciones emergentes sobre emisiones de centros de datos.
- Educación y formación: utilizado como ejemplo práctico en cursos sobre IA responsable y computación sostenible para enseñar a medir emisiones con CodeCarbon.
- Comparativa entre ejecuciones: al existir múltiples tarjetas similares (de otros autores del mismo ejercicio), permite comparar la huella de distintas configuraciones de hardware y regiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene métricas de rendimiento del modelo (MMLU, HumanEval, GSM8K, etc.) porque no se trata de un modelo de IA, sino de un registro de contabilidad de carbono.

## Requisitos de hardware

- No se requieren recursos de hardware para "ejecutar" este repositorio, ya que no contiene un modelo.
- El hardware documentado en la tarjeta es: 6 GPU NVIDIA T4, con 45,4 horas de uso.
- El consumo energético total registrado es de 23,263 kWh.
- No aplica despliegue con vLLM, llama.cpp, Ollama ni TGI.
- No hay latencia ni throughput que medir al no existir inferencia.

## Comparativa con modelos similares

| Repositorio | Hardware | GPU horas | Energia (kWh) | CO₂eq (kg) | Region |
|---|---|---|---|---|---|
| 25ds/tds-carbon-card | NVIDIA T4 (6 GPUs) | 45,4 | 23,263 | 11,166 | ap-southeast1 |
| 25ds1000032/tds-carbon-card | NVIDIA L40S (3 GPUs) | 386,1 | 454,054 | 90,811 | europe-west4 |
| 24f1002805/tds-carbon-card | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa muestra que la ejecución de 25ds es significativamente más eficiente en emisiones que la de 25ds1000032, aunque esto se debe principalmente a la menor duración del entrenamiento y al uso de hardware menos potente. No se dispone de datos completos para 24f1002805.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede utilizar para ninguna tarea de inferencia, generación o razonamiento.
- No contiene pesos, arquitectura ni artefactos de modelo descargables.
- La licencia no está especificada, por lo que el uso del contenido queda sujeto a las condiciones generales de HuggingFace.
- Las métricas de emisiones dependen de la precisión de CodeCarbon y de los factores de emisión de la región ap-southeast1, que pueden variar con el tiempo.
- El dato de PUE (1,22) es un valor declarado que puede no reflejar el PUE real del centro de datos en todo el periodo de entrenamiento.
- No se especifica qué modelo se entrenó, por lo que la tarjeta no permite reproducir ni evaluar el trabajo de IA subyacente.
- Al ser un ejercicio académico (TDS GA8), los datos podrían corresponder a un entorno de pruebas y no a un entrenamiento de producción real.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/25ds/tds-carbon-card
- Tarjeta similar de 25ds1000032: https://huggingface.co/25ds1000032/tds-carbon-card
- Tarjeta similar de 24f1002805: https://huggingface.co/24f1002805/tds-carbon-card
- Documentación de model cards de Google DeepMind: https://deepmind.google/models/model-cards/
- Model Card Toolkit de TensorFlow: https://www.tensorflow.org/responsible_ai/model_card_toolkit/guide
- Colección de model cards y datasheets en GitHub: https://github.com/ivylee/model-cards-and-datasheets
