# musagor23f3003386/tds-carbon-card

## Resumen

Este repositorio, identificado como `musagor23f3003386/tds-carbon-card`, no contiene un modelo de inteligencia artificial, sino una tarjeta de contabilidad de carbono correspondiente a un proceso de entrenamiento específico. Se enmarca en el contexto de la iniciativa Green AI, que busca documentar la huella ambiental de los entrenamientos de modelos. El autor, `musagor23f3003386`, registra las emisiones de CO₂ equivalente generadas durante un fine-tuning realizado con tres GPUs NVIDIA V100 en la región `us-east1`. Los datos incluyen horas de GPU, energía total consumida y emisiones, siguiendo el estándar de metadatos `co2_eq_emissions` de Hugging Face.

La relevancia actual radica en la creciente demanda de transparencia en el impacto ambiental del desarrollo de IA. Este tipo de tarjetas permite cuantificar y comparar el coste energético de distintos entrenamientos, lo que facilita la toma de decisiones sostenibles en entornos de investigación y producción. No obstante, no se trata de un modelo funcional: es un registro documental, por lo que su uso se limita a la auditoría y reporte de sostenibilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no hay pesos) |
| Hardware de entrenamiento | NVIDIA V100 (3 GPUs) |
| Modo de entrenamiento | fine-tuning |
| Region de entrenamiento | us-east1 |
| Horas de GPU | 304.6 h (PUE: 1.17) |
| Energia total consumida | 320.7438 kWh |
| Emisiones de CO₂ equivalente | 134.712 kg CO₂eq |

## Arquitectura y entrenamiento

No se especifica ninguna arquitectura de modelo (transformer, MoE, SSM, etc.) porque este repositorio no contiene un modelo de IA. Los datos proporcionados indican que se realizó un fine-tuning sobre un modelo no identificado, utilizando tres GPUs NVIDIA V100 en la región `us-east1`. El proceso consumió 304.6 horas de GPU con un factor de eficiencia energética (PUE) de 1.17, resultando en un total de 320.7438 kWh y 134.712 kg de CO₂ equivalente. No se detalla el dataset, el número de tokens ni técnicas de optimización como RLHF o DPO.

## Capacidades

- No tiene capacidades de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling, agentes ni multi-step reasoning.
- No ofrece funcionalidades multilingües ni de pensamiento (thinking mode).
- Su única función es documentar el impacto ambiental de un entrenamiento concreto.

## Casos de uso

- Auditoría de sostenibilidad de entrenamientos: se puede utilizar como referencia para comparar el coste energético de diferentes configuraciones de hardware y regiones, ayudando a elegir opciones más ecológicas.
- Reporte de cumplimiento: organizaciones que deben publicar métricas de emisiones de sus procesos de IA pueden citar este tipo de tarjetas como evidencia.
- Investigación en Green AI: los datos de este repositorio sirven para estudios sobre el impacto de la ubicación geográfica y el hardware en la huella de carbono.
- Optimización de costes energéticos: al conocer las emisiones por hora de GPU, se pueden estimar presupuestos para futuros entrenamientos.
- Educación y divulgación: se utiliza como ejemplo en cursos o talleres sobre sostenibilidad en inteligencia artificial.
- Comparación de infraestructuras: si se dispone de tarjetas similares con diferentes configuraciones, se puede comparar la eficiencia energética de distintos centros de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene evaluaciones de rendimiento de un modelo, sino únicamente datos de consumo energético.

## Requisitos de hardware

No aplica, ya que no se trata de un modelo de inferencia. Los requisitos de hardware corresponden al entrenamiento original, que empleó tres GPUs NVIDIA V100. No hay información sobre despliegue en vLLM, llama.cpp, Ollama o TGI, ni latencia o throughput.

## Comparativa con modelos similares

No existe una comparativa con modelos de IA porque este repositorio no es un modelo. Sin embargo, se pueden comparar las tarjetas de carbono de distintos entrenamientos. Por ejemplo, el repositorio `23f3004181/kumarm-tds-carbon-card` (también de TDS GA8) muestra un entrenamiento con 8 GPUs V100, modo pre-training, en la región `europe-north1`, con 187.7 horas de GPU, 675.72 kWh y 81.086 kg CO₂eq. La comparación de estos valores permite evaluar la eficiencia energética de diferentes configuraciones.

| Repositorio | Hardware | Modo | Region | Horas GPU | Energía (kWh) | CO₂eq (kg) |
|---|---|---|---|---|---|---|
| musagor23f3003386/tds-carbon-card | 3x V100 | fine-tuning | us-east1 | 304.6 | 320.74 | 134.71 |
| 23f3004181/kumarm-tds-carbon-card | 8x V100 | pre-training | europe-north1 | 187.7 | 675.72 | 81.09 |

## Limitaciones y advertencias

- No es un modelo de IA, por lo que no ofrece ninguna funcionalidad de procesamiento de datos.
- La información de emisiones se basa en el cálculo con CodeCarbon y puede variar según la metodología y los factores de emisión regionales.
- No se especifica el modelo original que se entrenó, lo que limita la reproducibilidad del contexto.
- La licencia no está definida, lo que puede restringir el uso comercial del contenido del repositorio.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto porque no existe un sistema de IA subyacente.

## Enlaces

- Repositorio en Hugging Face: [https://huggingface.co/musagor23f3003386/tds-carbon-card](https://huggingface.co/musagor23f3003386/tds-carbon-card)
- Repositorio similar (comparativa): [https://huggingface.co/23f3004181/kumarm-tds-carbon-card](https://huggingface.co/23f3004181/kumarm-tds-carbon-card)
- Otro repositorio similar: [https://huggingface.co/JayashreeR/tds-carbon-card](https://huggingface.co/JayashreeR/tds-carbon-card)
- Directorio de sostenibilidad de modelos de IA (carbontxt.org): [https://carbontxt.org/ai-model-cards](https://carbontxt.org/ai-model-cards)
- Documentación de model cards de Google DeepMind: [https://deepmind.google/models/model-cards/](https://deepmind.google/models/model-cards/)
