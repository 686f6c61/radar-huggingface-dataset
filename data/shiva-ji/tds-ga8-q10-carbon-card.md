# Shiva-JI/Tds-GA8-Q10-Carbon-Card

## Resumen

Este repositorio de Hugging Face, identificado como `Shiva-JI/Tds-GA8-Q10-Carbon-Card`, no contiene un modelo de inteligencia artificial, sino una tarjeta de contabilidad de carbono (carbon card) asociada a un proceso de fine-tuning realizado en el marco de una asignación académica denominada TDS GA8. El autor, Shiva-JI, documenta las emisiones de CO₂ equivalente, el consumo energético y el hardware utilizado durante el entrenamiento, siguiendo el estándar de reporte de CodeCarbon.

El repositorio carece de cualquier artefacto de modelo (pesos, configuración, tokenizador) y de información sobre arquitectura, parámetros o capacidades. Su única finalidad es registrar la huella ambiental de un entrenamiento concreto, lo que lo convierte en un ejemplo de transparencia en sostenibilidad, pero no en un recurso utilizable para tareas de IA. Por tanto, esta ficha se limita a documentar los datos disponibles y a señalar explícitamente la ausencia de especificaciones técnicas del modelo.

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

Datos adicionales reportados en la model card (no corresponden a especificaciones del modelo, sino al proceso de entrenamiento):

| Parametro | Valor |
|---|---|
| Hardware de entrenamiento | 3x NVIDIA H100 |
| Modo de entrenamiento | fine-tuning |
| Region del centro de datos | europe-north1 |
| Horas de GPU | 82,1 h (PUE: 1,17) |
| Energia total consumida | 201,7197 kWh |
| Emisiones de CO₂ equivalente | 24,206 kg CO₂eq |
| Herramienta de medicion | CodeCarbon |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base, el tipo de transformer, la cantidad de parametros ni la composicion del dataset de entrenamiento. La unica informacion disponible es que se realizo un fine-tuning sobre un modelo no especificado, utilizando tres GPUs NVIDIA H100 en la region europe-north1 de Google Cloud, con un consumo total de 201,72 kWh y 24,206 kg de CO₂ equivalente. No se menciona el uso de tecnicas como RLHF, DPO ni ninguna innovacion arquitectonica.

## Capacidades

No se ha publicado ninguna capacidad del modelo. Este repositorio no contiene un modelo funcional, por lo que no es posible evaluar generacion de texto, razonamiento, codigo, vision, tool calling, agentes ni capacidades multilingues.

## Casos de uso

Dado que no existe un modelo, no se pueden proponer casos de uso practicos. El unico proposito de este repositorio es servir como registro de sostenibilidad para un proceso de entrenamiento concreto, utilizable en auditorias ambientales o en la elaboracion de informes de huella de carbono en proyectos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existe ningun dato sobre MMLU, HumanEval, GSM8K u otras evaluaciones, ni comparaciones con modelos similares.

## Requisitos de hardware

No se puede estimar la VRAM necesaria para inferencia, ya que no se conoce el tamano del modelo. Los unicos datos de hardware corresponden al entrenamiento:

- 3 GPUs NVIDIA H100 utilizadas durante el fine-tuning.
- Consumo energetico total: 201,7197 kWh.
- Emisiones: 24,206 kg CO₂eq.
- No se indican opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.) ni latencia o throughput.

## Comparativa con modelos similares

No disponible. No existe informacion sobre el modelo subyacente ni sobre alternativas comparables. Los repositorios encontrados en la busqueda web (`shivainlabs/tds-carbon-card`, `24F2007479/q10_tds`) contienen el mismo tipo de tarjeta de carbono, pero tampoco ofrecen especificaciones de modelos.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo de IA; es exclusivamente una tarjeta de contabilidad de carbono.
- No se puede utilizar para ninguna tarea de inferencia, generacion o analisis.
- La licencia no esta especificada, por lo que no se puede determinar si el contenido es reutilizable.
- Los datos de emisiones corresponden a un entrenamiento concreto y no son extrapolables a otros escenarios.
- No hay informacion sobre sesgos, alucinaciones o limitaciones de contexto, ya que no existe un modelo que evaluar.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/Shiva-JI/Tds-GA8-Q10-Carbon-Card
- Repositorio similar (shivainlabs): https://huggingface.co/shivainlabs/tds-carbon-card
- Repositorio similar (24F2007479): https://huggingface.co/24F2007479/q10_tds
- Pagina de TDS (Tools in Data Science): https://mitali-iitm.github.io/tds/
