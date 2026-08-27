# okparker3000/tds-carbon-card3

## Resumen

Este repositorio de Hugging Face, identificado como `okparker3000/tds-carbon-card3`, no contiene un modelo de inteligencia artificial propiamente dicho, sino una tarjeta de contabilidad de carbono (carbon card) asociada a un entrenamiento de un modelo no especificado. El autor, `okparker3000`, documenta las emisiones de CO₂ equivalente generadas durante una fase de pre-entrenamiento, siguiendo la iniciativa Green AI de contabilidad ambiental para el entrenamiento de modelos.

El repositorio reporta un total de 147,62 kg de CO₂eq emitidos, calculados mediante la herramienta CodeCarbon, con un consumo energético de 738,0992 kWh durante 169,6 horas de GPU en hardware NVIDIA A100 (8 GPUs) en la región europe-west4. No se proporciona ninguna información sobre la arquitectura, el tamaño, los parámetros o las capacidades del modelo entrenado, por lo que esta ficha se limita a documentar los datos de sostenibilidad disponibles y a señalar explícitamente la ausencia de especificaciones técnicas del modelo subyacente.

La relevancia de este repositorio radica en su contribución a la transparencia ambiental en el desarrollo de IA, un aspecto cada vez más demandado por la comunidad investigadora y regulatoria. Sin embargo, para un desarrollador que busque evaluar un modelo para uso práctico, este repositorio carece de utilidad directa, ya que no contiene pesos, arquitectura ni documentación funcional.

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

No se dispone de información sobre la arquitectura del modelo (transformer, MoE, SSM, etc.), el número de parámetros, la composición del dataset de entrenamiento ni las técnicas de alineación empleadas (RLHF, DPO, etc.). El repositorio únicamente documenta el proceso de entrenamiento desde una perspectiva ambiental: se utilizaron 8 GPUs NVIDIA A100 durante 169,6 horas en la región europe-west4, con un factor de eficiencia energética (PUE) de 1,36. El consumo total de energía fue de 738,0992 kWh, lo que resultó en 147,62 kg de CO₂eq, calculados con la librería CodeCarbon. No se indica el número de tokens procesados ni ninguna otra métrica de entrenamiento.

## Capacidades

No se puede evaluar ninguna capacidad del modelo, ya que no se proporciona información sobre sus funcionalidades. El repositorio no incluye pesos, demos, ejemplos de uso ni documentación técnica que permita inferir tareas como generación de texto, razonamiento, código, visión o tool calling. La única capacidad documentada es la de servir como registro de emisiones de carbono para un entrenamiento concreto.

## Casos de uso

Dado que no se trata de un modelo utilizable, los casos de uso se limitan al ámbito de la contabilidad ambiental y la transparencia en el desarrollo de IA:

- Auditoría de emisiones de carbono en proyectos de IA: el repositorio sirve como referencia para equipos que necesiten reportar el impacto ambiental de sus entrenamientos, siguiendo el formato de CodeCarbon.
- Cumplimiento de políticas de sostenibilidad: organizaciones que deban justificar sus emisiones ante reguladores o clientes pueden usar este tipo de tarjetas como evidencia documental.
- Investigación en Green AI: investigadores que estudien la relación entre consumo energético, hardware y emisiones pueden utilizar estos datos como punto de comparación.
- Educación y concienciación: el repositorio puede usarse en cursos o talleres para ilustrar cómo se mide la huella de carbono de un entrenamiento de modelo.
- Benchmarking de eficiencia energética: aunque no hay datos del modelo, los valores de GPU horas y kWh pueden compararse con otros entrenamientos documentados en la misma iniciativa TDS GA8.
- Trazabilidad de experimentos: para equipos que mantienen un registro histórico de sus entrenamientos, este tipo de tarjeta complementa la documentación técnica con datos ambientales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento del modelo (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Los únicos datos numéricos son los relativos a emisiones y consumo energético.

## Requisitos de hardware

No se puede estimar la VRAM necesaria para inferencia, ya que se desconoce el tamaño del modelo. Los datos de hardware disponibles se refieren exclusivamente al entrenamiento:

- Hardware de entrenamiento: 8 GPUs NVIDIA A100 (no se especifica la variante, presumiblemente 40 GB u 80 GB).
- Tiempo de entrenamiento: 169,6 horas de GPU.
- Consumo energético: 738,0992 kWh.
- Emisiones: 147,62 kg CO₂eq.
- No se indica si el modelo resultante es desplegable en GPU de consumo (RTX 4090, etc.) ni qué opciones de inferencia (vLLM, llama.cpp, Ollama) serían compatibles.

## Comparativa con modelos similares

No disponible. No se puede comparar este repositorio con otros modelos de IA, ya que no contiene un modelo. Existen otros repositorios de la misma iniciativa TDS GA8 (por ejemplo, `23f3000810/tds-carbon-card` o `amankumarmahali/tds-carbon-card`) que siguen el mismo formato de tarjeta de carbono, pero no se dispone de sus datos específicos para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA utilizable: no hay pesos, arquitectura, tokenizador ni código de inferencia.
- No se especifica la licencia, por lo que cualquier uso del contenido (si lo hubiera) queda sujeto a la legislación de propiedad intelectual por defecto.
- Los datos de emisiones dependen de la metodología de CodeCarbon y del factor de emisión de la región europe-west4; no son directamente extrapolables a otros entornos.
- No se indica si el entrenamiento documentado corresponde a un modelo de código abierto o propietario, ni si los resultados están disponibles en otro repositorio.
- La ausencia de información sobre el modelo subyacente impide evaluar sesgos, riesgos de alucinación o limitaciones de contexto.
- Para uso en producción, este repositorio no aporta ningún valor operativo; es exclusivamente un registro ambiental.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/okparker3000/tds-carbon-card3
- Repositorios similares de la iniciativa TDS GA8:
  - https://huggingface.co/23f3000810/tds-carbon-card
  - https://huggingface.co/amankumarmahali/tds-carbon-card
- Herramienta CodeCarbon (referencia para el cálculo de emisiones): no se proporciona enlace directo en la información disponible, pero es el estándar citado en la model card.
