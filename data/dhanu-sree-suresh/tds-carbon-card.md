# Dhanu-Sree-Suresh/tds-carbon-card

## Resumen

El repositorio `Dhanu-Sree-Suresh/tds-carbon-card` no contiene un modelo de IA tradicional, sino una tarjeta de contabilidad de carbono (carbon card) asociada a un proyecto académico denominado TDS GA8. Este tipo de repositorios documenta la huella de carbono y el consumo energético de un proceso de entrenamiento o ajuste de un modelo, siguiendo las prácticas de Green AI para hacer visible el coste medioambiental del desarrollo de sistemas de aprendizaje automático.

El autor, Dhanu Sree Suresh, estudiante de Ciencias de la Computación especializado en IA, registra aquí las emisiones de CO₂ equivalente generadas durante un proceso de fine-tuning ejecutado sobre hardware NVIDIA T4 en la región us-east1 de Google Cloud. Según los datos de la model card, el entrenamiento consumió 291,63 kWh de energía y emitió 122,48 kg de CO₂eq, con un total de 422,1 horas de GPU.

La relevancia de este repositorio radica en su contribución a la transparencia medioambiental en el desarrollo de IA, un aspecto cada vez más valorado por organizaciones que buscan reducir su huella de carbono. No se trata de un modelo descargable ni desplegable, sino de un registro de auditoría energética que sigue el formato propuesto por herramientas como CodeCarbon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de contabilidad de carbono, no contiene un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se distribuyen pesos) |

## Arquitectura y entrenamiento

Este repositorio no documenta una arquitectura de red neuronal ni un proceso de entrenamiento desde cero. En su lugar, registra los datos de un proceso de fine-tuning (ajuste fino) ejecutado sobre un modelo base no especificado. El entrenamiento se realizó sobre 7 GPUs NVIDIA T4 en la región us-east1 de Google Cloud, con un total de 422,1 horas de GPU y un factor de efectividad de uso de energía (PUE) de 1,41.

La métrica principal documentada es la emisión de CO₂ equivalente, calculada mediante la herramienta CodeCarbon. El desglose indica un consumo total de 291,63 kWh de energía, que se traduce en 122,48 kg de CO₂eq emitidos a la atmósfera. Estos datos permiten calcular la intensidad de carbono del proceso: aproximadamente 0,42 kg de CO₂eq por kWh, un valor coherente con la red eléctrica de la región us-east de Estados Unidos.

La inclusión de metadatos estructurados en formato YAML dentro de la model card (co2_eq_emissions, source, training_type, geographical_location, hardware_used) sigue las recomendaciones de la iniciativa Green AI y facilita la agregación de datos de emisiones en estudios comparativos.

## Capacidades

- Registro de emisiones de CO₂ equivalente asociadas a un proceso de entrenamiento.
- Documentación de consumo energético total en kWh.
- Especificación de hardware utilizado (NVIDIA T4, 7 GPUs).
- Indicación de la ubicación geográfica del cómputo (us-east1), relevante para calcular la intensidad de carbono de la red eléctrica.
- Uso del formato estándar de CodeCarbon para la trazabilidad de emisiones.
- No incluye capacidades de generación de texto, razonamiento, código, visión ni ningún otro tipo de inferencia.

## Casos de uso

- Auditoría medioambiental de proyectos de IA: el repositorio sirve como registro verificable del coste de carbono de un entrenamiento, útil para organizaciones que necesitan reportar su impacto ambiental.
- Investigación en Green AI: los datos de emisiones y consumo pueden utilizarse en estudios comparativos sobre la eficiencia energética de diferentes configuraciones de hardware y regiones de cómputo.
- Educación en prácticas de IA sostenible: el formato de la model card ejemplifica cómo documentar la huella de carbono siguiendo estándares comunitarios.
- Planificación de presupuestos de cómputo: los datos de consumo (291,63 kWh, 422,1 horas de GPU) permiten estimar costes energéticos y económicos de procesos similares.
- Comparativa de proveedores cloud: la localización en us-east1 permite comparar la intensidad de carbono de Google Cloud frente a otras regiones o proveedores.
- Cumplimiento normativo: el registro puede servir como evidencia para iniciativas de reporte de sostenibilidad corporativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene un modelo de inferencia y, por tanto, no tiene métricas de rendimiento como MMLU, HumanEval o GSM8K. Los únicos datos numéricos documentados son los relativos a consumo energético y emisiones.

## Requisitos de hardware

- El entrenamiento registrado utilizó 7 GPUs NVIDIA T4, un hardware de gama media orientado a inferencia y fine-tuning ligero.
- El consumo total fue de 422,1 horas de GPU, lo que equivale a aproximadamente 60 horas por GPU.
- No se especifican requisitos de VRAM porque no se distribuye ningún modelo para inferencia.
- Para reproducir el proceso de fine-tuning se necesitaría un entorno cloud con GPUs T4 o equivalentes, como los ofrecidos por Google Cloud en la región us-east1.
- No aplican opciones de despliegue como vLLM, llama.cpp u Ollama, al no existir pesos del modelo.

## Comparativa con modelos similares

No disponible. Este repositorio no contiene un modelo de IA comparable con alternativas de la misma categoría. Existen otros repositorios similares de contabilidad de carbono bajo el mismo patrón de nomenclatura (por ejemplo, `anant-venkatesh1/tds-carbon-card`), pero todos son registros independientes de diferentes procesos de entrenamiento y no modelos con capacidades de inferencia.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo descargable ni desplegable; es únicamente un registro de contabilidad de carbono.
- No se especifica qué modelo base fue ajustado, por lo que los datos de emisiones no pueden contextualizarse con la arquitectura o el tamaño del modelo.
- La licencia no está especificada, lo que limita la reutilización legal de los datos del repositorio.
- Los datos de emisiones dependen de la precisión de CodeCarbon y de los factores de emisión de la red eléctrica de us-east1, que pueden variar con el tiempo.
- No se proporciona información sobre el dataset utilizado en el fine-tuning, lo que impide evaluar la validez científica del proceso.
- El repositorio no tiene descargas ni likes, lo que sugiere que es un proyecto académico sin difusión pública significativa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Dhanu-Sree-Suresh/tds-carbon-card
- Perfil del autor en Hugging Face: https://huggingface.co/Dhanu-Sree-Suresh
- Perfil del autor en GitHub: https://github.com/Dhanu-Sree-Suresh
- Perfil de GitHub de Dhanu Sree Suresh (alternativo): https://github.com/dhanusree1408
- Perfil en LinkedIn: https://ae.linkedin.com/in/dhanu-sree-suresh-846614327
- Repositorio similar (otro estudiante): https://huggingface.co/anant-venkatesh1/tds-carbon-card
