# SNEEHHAA/tds-carbon-card

## Resumen
El repositorio `SNEEHHAA/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino una tarjeta de contabilidad de carbono (carbon card) que documenta el impacto ambiental de una ejecución de entrenamiento de un modelo. Fue creado por el usuario SNEEHHAA el 28 de agosto de 2026 y forma parte de una serie de repositorios similares (por ejemplo, `pranhai/tds-carbon-card` o `23f1003136/tds-carbon-card`) asociados a la asignación TDS GA8, probablemente un ejercicio académico sobre IA verde.

La información disponible se limita a los metadatos de emisiones: 472,689 kg de CO₂ equivalente, generados durante un fine-tuning realizado en 8 GPUs NVIDIA V100 en la región us-central1, con un total de 457,5 horas de GPU y un consumo energético de 1350,54 kWh. No se proporciona ningún detalle sobre la arquitectura, los parámetros, el dataset o el propósito del modelo subyacente. Por tanto, esta ficha documenta exclusivamente los datos de huella de carbono publicados, sin poder evaluar capacidades técnicas del modelo en sí.

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
No se dispone de información sobre la arquitectura del modelo (transformer, MoE, SSM, etc.) ni sobre los datos de entrenamiento. Los únicos datos de entrenamiento publicados son los relativos al consumo energético: se realizó un fine-tuning sobre hardware NVIDIA V100 (8 GPUs) en la región us-central1, con un total de 457,5 horas de GPU y un factor de eficiencia energética (PUE) de 1,23. El consumo total de energía fue de 1350,54 kWh, lo que resultó en 472,689 kg de CO₂ equivalente, medidos con la herramienta CodeCarbon. No se indica el tipo de modelo, el dataset utilizado ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades
No se puede evaluar ninguna capacidad del modelo, ya que el repositorio no contiene información sobre funcionalidades. Los datos disponibles se limitan a la contabilidad de carbono del proceso de entrenamiento. No hay evidencia de capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes, multilingüismo ni modos especiales.

## Casos de uso
Dado que el repositorio no describe un modelo funcional, no es posible proponer casos de uso prácticos de inferencia. Sin embargo, el contenido puede servir para:

- Auditoría ambiental de entrenamientos de IA: el repositorio documenta emisiones de CO₂, consumo energético y hardware utilizado, útil para reportes de sostenibilidad.
- Educación en IA verde: puede usarse como ejemplo de cómo medir la huella de carbono de un entrenamiento con CodeCarbon.
- Comparación de eficiencia energética: los datos de 472,689 kg CO₂eq para 457,5 GPU-horas en V100 permiten estimar el coste ambiental de fine-tuning en infraestructura similar.
- Investigación sobre optimización de recursos: los valores de PUE y energía total pueden servir para calibrar modelos de estimación de emisiones.
- Cumplimiento normativo: en contextos donde se exija transparencia sobre el impacto ambiental de modelos, este tipo de tarjeta puede ser un requisito.
- Documentación de experimentos: como parte de un registro de reproducibilidad, aunque aquí falta información sobre el modelo en sí.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento del modelo (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware
No se dispone de requisitos de hardware para inferencia, ya que no hay un modelo desplegable. Los únicos datos de hardware se refieren al entrenamiento:

- Hardware de entrenamiento: 8 GPUs NVIDIA V100.
- Horas de GPU: 457,5 horas.
- Consumo energético total: 1350,54 kWh.
- Emisiones: 472,689 kg CO₂eq.
- No se indica VRAM, GPUs recomendadas para inferencia, opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni latencia/throughput.

## Comparativa con modelos similares
No disponible. No se puede comparar con otros modelos de IA porque este repositorio no contiene un modelo, sino una tarjeta de emisiones. Existen repositorios homólogos (`pranhai/tds-carbon-card`, `23f1003136/tds-carbon-card`) con el mismo propósito, pero no se dispone de sus datos para una comparación cuantitativa.

## Limitaciones y advertencias
- El repositorio no contiene un modelo de IA funcional; es una documentación de emisiones de carbono de un entrenamiento.
- No se especifica qué modelo se entrenó, por lo que los datos de emisiones no pueden asociarse a ninguna arquitectura concreta.
- La licencia no está indicada, por lo que se desconoce si el contenido puede reutilizarse comercialmente.
- Los datos de emisiones dependen de la región (us-central1) y del hardware (V100); extrapolarlos a otros entornos puede llevar a conclusiones erróneas.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto porque no hay modelo que evaluar.
- Para uso en producción, este repositorio no aporta ningún recurso aprovechable más allá de los datos de sostenibilidad.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/SNEEHHAA/tds-carbon-card
- Repositorio homólogo (pranhai): https://huggingface.co/pranhai/tds-carbon-card
- Repositorio homólogo (23f1003136): https://huggingface.co/23f1003136/tds-carbon-card
- Tutorial de medición de emisiones de ML (Climate Change AI): https://github.com/climatechange-ai-tutorials/tracking-ml-emissions
