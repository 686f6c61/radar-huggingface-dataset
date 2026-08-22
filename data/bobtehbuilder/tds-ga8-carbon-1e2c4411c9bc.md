# bobtehbuilder/tds-ga8-carbon-1e2c4411c9bc

## Resumen

El modelo `bobtehbuilder/tds-ga8-carbon-1e2c4411c9bc` es un artefacto publicado en Hugging Face cuyo contenido técnico no está documentado en la model card pública. La única información disponible se limita a la metadata de emisiones de carbono del proceso de fine-tuning: se entrenó con tres NVIDIA L40S durante 216,4 horas en la región `asia-south1`, con un consumo energético de 349,92 kWh y una huella de 227,45 kg de CO₂ equivalente. El nombre del repositorio sugiere una relación con un proyecto de contabilidad de carbono para IA (Green AI Carbon Accounting), pero no se ha publicado ningún detalle sobre arquitectura, pesos, parámetros o capacidades del modelo.

El repositorio tiene cero descargas y cero likes, y no se especifica licencia, idiomas ni pipeline de uso. No se ha publicado model card técnica más allá de la tabla de emisiones. En consecuencia, esta ficha documenta únicamente la información disponible y marca como "no disponible" todos los campos que no pueden verificarse.

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

No se ha publicado ninguna información sobre la arquitectura del modelo (transformer, MoE, SSM, etc.), el tamaño de parámetros, la composición del dataset o el método de optimización. La única información de entrenamiento disponible es la métrica de emisiones, que indica que se realizó un fine-tuning con 3 GPU NVIDIA L40S (350 W TDP) durante 216,4 horas, con un PUE de 1,54 y una intensidad de red de 650 gCO₂eq/kWh en la región `asia-south1`. No se especifican datos de tokens, dataset ni técnicas como RLHF o DPO.

## Capacidades

No se ha publicado ninguna capacidad del modelo. No se dispone de información sobre generación de texto, razonamiento, código, matemáticas, visión, tool calling, soporte para agentes, capacidades multilingües o modos especiales de funcionamiento.

## Casos de uso

No se puede proponer ningún caso de uso concreto, ya que se desconocen las capacidades del modelo. La información disponible sugiere que el repositorio forma parte de un proyecto de medición de huella de carbono en entrenamiento de IA, pero no se puede confirmar si el modelo es funcional ni qué tareas puede realizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se dispone de estimaciones de VRAM para inferencia.
- No se han publicado recomendaciones de GPU para despliegue.
- No se ha indicado si el modelo es compatible con GPU de consumo.
- No se han mencionado opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- No se dispone de datos de latencia ni throughput.

El único dato de hardware disponible es el utilizado en el entrenamiento: 3 GPUs NVIDIA L40S (350 W TDP) en la región `asia-south1`.

## Comparativa con modelos similares

No disponible. No se ha identificado ningún modelo comparable en la misma categoría, dado que no se conoce ni la arquitectura ni el propósito funcional de este modelo.

## Limitaciones y advertencias

- No hay información pública sobre sesgos, alucinaciones o limitaciones de contexto.
- No se especifica licencia, por lo que se desconoce si el uso comercial está permitido.
- El repositorio no contiene ningún peso ni configuración accesible; se trata de un artefacto vacío a efectos de uso práctico.
- La fecha de creación (2026-08-22) es futura en el momento de la consulta, lo que podría indicar un error en los metadatos o un proyecto experimental.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bobtehbuilder/tds-ga8-carbon-1e2c4411c9bc
