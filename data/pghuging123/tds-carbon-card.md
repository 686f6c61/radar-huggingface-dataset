# Pghuging123/tds-carbon-card

## Resumen

El repositorio `Pghuging123/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado a una ejecución de entrenamiento de un modelo dentro de la asignación TDS GA8. Documenta las emisiones de CO₂ equivalente, el consumo energético y el hardware utilizado durante un proceso de pre-entrenamiento. Este tipo de repositorios forma parte de una iniciativa de "Green AI" para fomentar la transparencia ambiental en el desarrollo de modelos.

El autor, Pghuging123, publica esta tarjeta de carbono el 28 de agosto de 2026, con datos obtenidos mediante la herramienta CodeCarbon. Se especifica que el entrenamiento se realizó en la región europe-north1 con 8 GPUs NVIDIA A100, consumiendo 119,32 kWh y generando 14,319 kg de CO₂eq. No se proporciona información sobre la arquitectura, el tamaño o la finalidad del modelo entrenado, ya que el repositorio se centra exclusivamente en la métrica ambiental.

La relevancia de este repositorio radica en su función como ejemplo de buenas prácticas para reportar el impacto ecológico del entrenamiento de modelos, un aspecto cada vez más demandado por la comunidad investigadora y empresarial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo (si es transformer, MoE, SSM u otro tipo), ni sobre el número de parámetros, el dataset utilizado o el proceso de entrenamiento más allá de los datos de consumo. El repositorio solo documenta el impacto ambiental del entrenamiento, indicando que se realizó en modo pre-training sobre 8 GPUs NVIDIA A100 en la región europe-north1, con un total de 31,6 horas de GPU (PUE 1,18) y un consumo energético de 119,3216 kWh. Las emisiones asociadas son de 14,319 kg de CO₂eq, calculadas con CodeCarbon.

No se mencionan innovaciones técnicas, técnicas de optimización (RLHF, DPO, decodificación especulativa, etc.) ni detalles sobre los datos de entrenamiento.

## Capacidades

Al no ser un modelo de IA, no presenta capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes, ni soporte multilingüe. El repositorio únicamente ofrece un registro de emisiones de carbono y consumo energético.

## Casos de uso

- Auditoría ambiental de entrenamientos: el repositorio sirve como referencia para cuantificar el coste ecológico de un entrenamiento con hardware específico (8×A100) y en una región concreta (europe-north1), útil para organizaciones que necesiten reportar su huella de carbono.
- Transparencia en publicaciones científicas: los autores de modelos pueden usar este tipo de tarjetas para cumplir con requisitos de disclosure ambiental en conferencias o revistas.
- Comparativa de eficiencia energética: permite comparar el consumo de diferentes configuraciones de hardware o regiones de cómputo, aunque en este caso no hay datos del modelo subyacente.
- Educación sobre Green AI: sirve como ejemplo didáctico de cómo documentar emisiones con CodeCarbon, incluyendo PUE y kWh.
- Planificación de infraestructura: los datos de GPU hours y energía pueden orientar decisiones sobre qué hardware y región elegir para minimizar impacto ambiental.
- Cumplimiento normativo: en contextos donde se exija reportar el impacto ambiental de actividades de cómputo, este formato puede adaptarse a informes internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene métricas de rendimiento del modelo, solo datos de consumo energético.

## Requisitos de hardware

- El entrenamiento documentado utilizó 8 GPUs NVIDIA A100, pero no se especifican requisitos para inferencia ni para reproducir el entrenamiento.
- No se proporcionan datos de VRAM, GPU recomendadas para despliegue, opciones de software (vLLM, llama.cpp, Ollama, TGI) ni estimaciones de latencia o throughput.
- Al no ser un modelo, no aplica el concepto de "cabe en consumer GPU" ni opciones de despliegue.

## Comparativa con modelos similares

No disponible. No se puede comparar con otros modelos porque no hay información sobre arquitectura, parámetros ni rendimiento. Existen otros repositorios con el mismo nombre (`tds-carbon-card`) de diferentes autores, pero todos contienen únicamente registros de carbono similares, sin especificaciones técnicas de modelos.

## Limitaciones y advertencias

- No es un modelo de IA: no puede utilizarse para tareas de generación, razonamiento o procesamiento de lenguaje.
- Ausencia de datos técnicos: no se indica qué modelo se entrenó, por lo que la información es incompleta para cualquier uso práctico.
- Riesgo de interpretación errónea: podría confundirse con un modelo real, pero solo contiene metadatos ambientales.
- Sin licencia ni idiomas: no se especifican condiciones de uso ni idiomas soportados, lo que limita su reutilización formal.
- Datos de emisiones dependientes del contexto: los valores de CO₂ son específicos de la región europe-north1 y del hardware usado; no son extrapolables a otros entornos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Pghuging123/tds-carbon-card
- Repositorios similares de otros autores (mismo propósito): 
  - https://huggingface.co/123Ashwani/tds-carbon-card
  - https://huggingface.co/sangam-jha/tds-carbon-card
  - https://huggingface.co/23f3001819/tds-carbon-card
  - https://huggingface.co/saurabh123432/tds-carbon-card
- Documentación de Hugging Face sobre model cards y emisiones de CO₂: https://github.com/huggingface/hub-docs/blob/main/docs/hub/model-cards-co2.md
