# Abhishek5625/tds_ga8_carboncard

## Resumen

El repositorio `Abhishek5625/tds_ga8_carboncard` no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono y energía correspondiente al entrenamiento de un modelo asignado en el marco del proyecto TDS GA8. Documenta las emisiones de CO₂ equivalente, el consumo eléctrico y las características del hardware utilizado durante una fase de pre-entrenamiento. Fue creado por el usuario Abhishek5625 y publicado en Hugging Face el 19 de agosto de 2026.

Este tipo de repositorios forma parte de una iniciativa más amplia de "Green AI" para cuantificar el impacto ambiental del entrenamiento de modelos. Aporta datos concretos de un caso real: 6 GPUs NVIDIA L40S en la región us-central1, 212,5 horas de GPU, 597,975 kWh de energía y 209,291 kg de CO₂eq. No se incluye ningún artefacto de modelo, pesos, código de inferencia ni documentación técnica sobre arquitectura o capacidades. Por tanto, no es evaluable como un modelo de lenguaje o visión, sino como un informe de sostenibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (registro de emisiones) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |
| Hardware de entrenamiento | NVIDIA L40S (6 GPUs) |
| Region de entrenamiento | us-central1 |
| Horas de GPU | 212,5 h (PUE: 1,34) |
| Energia total | 597,975 kWh |
| Emisiones de CO₂ | 209,291 kg CO₂eq |
| Fuente de medicion | CodeCarbon |
| Tipo de entrenamiento | pre-training |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo que fue entrenado, ya que el repositorio solo documenta el impacto ambiental. Los datos de entrenamiento indican que se utilizaron 6 GPUs NVIDIA L40S en la región us-central1 durante 212,5 horas, con un factor de eficiencia energética (PUE) de 1,34. El consumo total de energía fue de 597,975 kWh, lo que generó 209,291 kg de CO₂ equivalente, calculados mediante la herramienta CodeCarbon. No se especifican el número de tokens, la composición del dataset ni el tipo de modelo (transformer, MoE, etc.).

## Capacidades

- No se ha publicado ningún modelo funcional en este repositorio.
- No se proporcionan pesos, tokenizadores ni scripts de inferencia.
- No hay capacidades de generación de texto, razonamiento, código, visión o cualquier otra tarea de IA.
- El repositorio solo contiene metadatos de emisiones y consumo energético.

## Casos de uso

- Auditoría ambiental de entrenamientos de IA: el registro sirve para cuantificar la huella de carbono de un entrenamiento específico, útil para empresas que necesitan reportar su impacto ambiental.
- Investigación en Green AI: los datos pueden utilizarse para comparar la eficiencia energética de diferentes configuraciones de hardware y regiones cloud.
- Cumplimiento normativo: organizaciones sujetas a regulaciones de emisiones pueden usar este tipo de informes como evidencia de medición.
- Optimización de infraestructura: los datos de energía y emisiones permiten decidir entre regiones o hardware más sostenibles para futuros entrenamientos.
- Educación y divulgación: sirve como ejemplo real de cómo se documenta el coste ambiental de un modelo, útil en cursos de IA responsable.
- Reproducibilidad de informes: otros investigadores pueden replicar el método de medición con CodeCarbon y comparar sus propios resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene métricas de rendimiento del modelo entrenado.

## Requisitos de hardware

- No aplica: no hay modelo para inferencia.
- El hardware utilizado para el entrenamiento fue de 6 GPUs NVIDIA L40S, cada una con 48 GB de VRAM (según especificaciones estándar de la L40S), aunque no se confirma la configuración exacta.
- La región us-central1 corresponde a un centro de datos de Google Cloud en Iowa, EE. UU.
- No se proporcionan opciones de despliegue ni latencias, ya que no existe un artefacto de modelo.

## Comparativa con modelos similares

No disponible. No se trata de un modelo de IA comparable con otros modelos de lenguaje o visión. Existen otros repositorios similares en Hugging Face que documentan emisiones de entrenamiento (por ejemplo, `shyam1504/tds-carbon-card` o `anshusaurav/tds-ga8-carbon-model`), pero todos son informes de carbono, no modelos funcionales. No se pueden comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede utilizar para ninguna tarea de inferencia.
- La información sobre el modelo entrenado (arquitectura, parámetros, dataset) no está disponible.
- La licencia no está especificada, por lo que el uso del contenido del repositorio puede tener restricciones no declaradas.
- Los datos de emisiones dependen de la metodología de CodeCarbon y de la región eléctrica; pueden no ser directamente comparables con otras mediciones.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un ejercicio académico o interno, no un recurso ampliamente utilizado.
- No hay garantía de que los datos sean verificables externamente, ya que no se incluyen detalles del modelo ni del proceso de entrenamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Abhishek5625/tds_ga8_carboncard
- Repositorio similar de shyam1504: https://huggingface.co/shyam1504/tds-carbon-card
- Repositorio similar de anshusaurav: https://huggingface.co/anshusaurav/tds-ga8-carbon-model
- Herramienta CodeCarbon (mencionada como fuente): https://codecarbon.io (no verificado en la búsqueda, pero es la herramienta estándar)
