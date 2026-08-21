# krishna-32/tds-carbon-card

## Resumen

Este repositorio, identificado como `krishna-32/tds-carbon-card`, no contiene un modelo de inteligencia artificial, sino una documentación de contabilidad de carbono y energía correspondiente a una ejecución de entrenamiento de un modelo dentro del programa académico TDS GA8. El autor, krishna-32, ha publicado una "model card" que detalla las emisiones de CO₂ equivalente, el consumo energético y el hardware utilizado durante un proceso de fine-tuning. No se proporciona información sobre arquitectura, parámetros, contexto o capacidades del modelo subyacente, ya que el propósito del repositorio es exclusivamente registrar la huella ambiental del entrenamiento, siguiendo prácticas de "Green AI". La relevancia de esta ficha radica en su utilidad como ejemplo de transparencia en el impacto ecológico de la IA, más que como un recurso técnico para desarrolladores.

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

No se dispone de información sobre la arquitectura del modelo, ya que el repositorio no incluye pesos, configuraciones ni detalles técnicos del mismo. El contenido se limita a un registro de emisiones y consumo energético. Según la model card, el entrenamiento se realizó mediante fine-tuning sobre hardware NVIDIA RTX 4090 (5 GPUs) en la región europe-west4, con un total de 408,2 horas de GPU (PUE 1,11), un consumo energético de 1019,4795 kWh y unas emisiones de 203,896 kg de CO₂ equivalente, calculadas con la herramienta CodeCarbon. No se mencionan datos de entrenamiento, número de tokens, ni técnicas como RLHF o DPO.

## Capacidades

- No aplicable: el repositorio no contiene un modelo funcional ni documentación sobre capacidades de generación de texto, razonamiento, código, visión, tool calling, agentes o multilingüismo.
- La única "capacidad" documentada es la de registrar la huella de carbono de un proceso de entrenamiento, lo que puede servir como referencia para prácticas de sostenibilidad en IA.

## Casos de uso

- Auditoría ambiental de entrenamientos de IA: el repositorio puede utilizarse como plantilla para documentar emisiones de CO₂ y consumo energético en proyectos de investigación, permitiendo a otros equipos replicar el formato.
- Cumplimiento de políticas de sostenibilidad: organizaciones que requieran reportar el impacto ecológico de sus modelos pueden basarse en esta estructura para generar sus propias tarjetas de carbono.
- Educación en Green AI: sirve como ejemplo didáctico en cursos o talleres sobre computación responsable, mostrando cómo medir y comunicar el coste energético del entrenamiento.
- Comparación de eficiencia entre configuraciones: aunque no hay datos del modelo, la metodología de medición (CodeCarbon, PUE, horas de GPU) puede aplicarse para comparar diferentes estrategias de entrenamiento.
- Investigación sobre optimización energética: los datos de emisiones y energía pueden alimentar estudios sobre reducción de huella de carbono en infraestructuras de IA.
- Transparencia en publicaciones académicas: los autores pueden adjuntar este tipo de tarjetas a sus papers para cumplir con requisitos de reproducibilidad y responsabilidad ambiental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene evaluaciones de rendimiento del modelo, ya que su propósito es únicamente la contabilidad de carbono.

## Requisitos de hardware

- El entrenamiento documentado utilizó 5 GPUs NVIDIA RTX 4090, con un total de 408,2 horas de GPU.
- No se especifican requisitos de VRAM para inferencia, ni recomendaciones de GPU para despliegue.
- No se indican opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.) porque no hay un modelo servible.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. Al no tratarse de un modelo de IA, no es posible compararlo con alternativas de la misma categoría. Existen otros repositorios similares en HuggingFace (por ejemplo, `Krishnaprathap/tds-carbon-card` y `23f1000190/tds-carbon-card`) que siguen el mismo formato de tarjeta de carbono, pero no contienen modelos comparables.

## Limitaciones y advertencias

- Este repositorio no es un modelo de IA: no contiene pesos, tokenizador, ni código de inferencia. Intentar usarlo como tal resultará en un error.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto, ya que no existe un modelo subyacente.
- La licencia no está especificada, por lo que se desconoce si el contenido puede reutilizarse comercialmente.
- Los datos de emisiones son específicos de la ejecución documentada (hardware, región, duración) y no son generalizables a otros entrenamientos.
- La ausencia de especificaciones técnicas impide evaluar su idoneidad para cualquier tarea de procesamiento del lenguaje natural o generación de contenido.

## Enlaces

- Repositorio original: https://huggingface.co/krishna-32/tds-carbon-card
- Repositorio similar (Krishnaprathap): https://huggingface.co/Krishnaprathap/tds-carbon-card
- Repositorio similar (23f1000190): https://huggingface.co/23f1000190/tds-carbon-card
