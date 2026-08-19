# ShivanshHanda/tds-carbon-card

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial, sino una tarjeta de modelo dedicada a la contabilidad de carbono y al consumo energético de una ejecución de entrenamiento específica. El proyecto, denominado TDS GA8, documenta la huella de carbono asociada al preentrenamiento de un modelo utilizando infraestructura en la nube. El autor, Shivansh Handa, publica estos datos bajo el nombre de usuario `ShivanshHanda` en Hugging Face.

La tarjeta registra un total de 102,307 kg de CO₂ equivalente emitidos durante el entrenamiento, que se llevó a cabo en 8 GPU NVIDIA V100 durante 76,6 horas. La energía total consumida fue de 292,3056 kWh, con un factor de eficiencia energética (PUE) de 1,59, y la ubicación geográfica del centro de datos fue `us-central1`. Estos datos se recopilaron utilizando la herramienta CodeCarbon.

La relevancia de este repositorio radica en que ejemplifica la práctica de documentar el impacto ambiental del entrenamiento de modelos, una tendencia creciente en el ámbito de la IA responsable y la sostenibilidad. No se proporciona información sobre el modelo subyacente que se entrenó, ya que el propósito de la tarjeta es exclusivamente la contabilidad de carbono, no la descripción de un modelo para su uso.

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

Este repositorio no documenta la arquitectura de un modelo de IA. En su lugar, detalla el proceso de entrenamiento desde una perspectiva de contabilidad ambiental. Los datos de entrenamiento indican que se utilizaron 8 GPU NVIDIA V100 en modo de preentrenamiento, durante 76,6 horas de GPU. La energía total consumida fue de 292,3056 kWh, lo que resultó en 102,307 kg de CO₂ equivalente, calculados con la herramienta CodeCarbon. La región de cómputo fue `us-central1`, y el factor de eficiencia energética (PUE) se registró en 1,59.

No se proporciona información sobre la arquitectura del modelo, el conjunto de datos de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. El enfoque exclusivo es la medición de la huella de carbono, no el proceso técnico de entrenamiento.

## Capacidades

No aplica. Este repositorio no contiene un modelo de IA con capacidades de generación, razonamiento, codificación, visión o procesamiento del lenguaje. Su única función es la documentación de la huella de carbono de una ejecución de entrenamiento.

## Casos de uso

No aplica. Este repositorio no es un modelo de IA y, por tanto, no tiene casos de uso para generación de texto, análisis de datos, agentes o cualquier otra aplicación de IA. Los casos de uso de este tipo de tarjetas de carbono son:

- Auditoría ambiental de entrenamientos de modelos.
- Cumplimiento de políticas corporativas de sostenibilidad.
- Informes de transparencia en publicaciones de investigación.
- Evaluación de la eficiencia energética de infraestructuras de cómputo.
- Comparación de la huella de carbono entre diferentes configuraciones de entrenamiento.
- Documentación de buenas prácticas en el marco de proyectos de "Green AI".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene métricas de rendimiento del modelo entrenado, ya que su objetivo no es la evaluación de capacidades, sino la contabilidad de carbono.

## Requisitos de hardware

No aplica. Este repositorio no es un modelo desplegable. No obstante, la información de hardware del entrenamiento documentado es la siguiente:

- GPU: 8x NVIDIA V100
- Duración del entrenamiento: 76,6 horas de GPU
- Consumo energético total: 292,3056 kWh
- Ubicación del cómputo: región `us-central1`

No se especifican requisitos de VRAM, GPUs recomendadas para inferencia, ni opciones de despliegue, ya que no hay modelo que desplegar.

## Comparativa con modelos similares

No disponible. No se puede comparar este repositorio con otros modelos de IA porque no es un modelo. Existen otros repositorios similares en Hugging Face que documentan la huella de carbono de entrenamientos, como el proyecto `shyam1504/tds-carbon-card`, que sigue la misma estructura y formato de datos. Sin embargo, no hay datos de rendimiento o parámetros que permitan una comparación técnica.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo de IA, por lo que no se puede utilizar para ninguna tarea de inferencia o generación.
- Los datos de emisiones de CO₂ son estimaciones basadas en la herramienta CodeCarbon y pueden variar según la metodología de cálculo.
- El dato de emisiones no incluye el ciclo de vida completo del hardware (fabricación, transporte, etc.), solo el consumo energético durante el entrenamiento.
- No se proporciona información sobre la licencia de uso de los datos contenidos en la tarjeta.
- No se indica el idioma de los datos ni el formato de los pesos, ya que no hay pesos asociados.

## Enlaces

- [Hugging Face: ShivanshHanda/tds-carbon-card](https://huggingface.co/ShivanshHanda/tds-carbon-card)
- [Hugging Face: shyam1504/tds-carbon-card (repositorio similar)](https://huggingface.co/shyam1504/tds-carbon-card)
- [Directorio de tarjetas de carbono de IA (carbontxt.org)](https://carbontxt.org/ai-model-cards)
- [Perfil de GitHub del autor](https://github.com/DarkByt31)
