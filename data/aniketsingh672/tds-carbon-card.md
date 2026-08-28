# aniketsingh672/tds-carbon-card

## Resumen

El repositorio `aniketsingh672/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado a un proceso de fine-tuning realizado en el marco de la asignatura TDS GA8. El autor documenta las emisiones de CO₂ equivalente generadas durante el entrenamiento, utilizando la herramienta CodeCarbon para medir el impacto ambiental. Este tipo de repositorios forma parte de una práctica creciente en la comunidad de IA para auditar y transparentar el coste energético del desarrollo de modelos.

El contenido se limita a una model card que especifica el hardware utilizado (4 GPU NVIDIA V100), la región de cómputo (europe-west4), las horas de GPU consumidas (90,7 horas), la energía total empleada (130,608 kWh) y las emisiones resultantes (26,122 kg CO₂eq). No se incluyen pesos, arquitectura, código de entrenamiento ni ningún artefacto de modelo. Por tanto, no es un modelo utilizable para inferencia ni para ninguna tarea de procesamiento del lenguaje natural, visión u otra modalidad.

La relevancia de este repositorio radica en su valor como ejemplo de buenas prácticas en la documentación del impacto ambiental de la IA, un aspecto cada vez más demandado en entornos académicos y empresariales. Sin embargo, desde el punto de vista técnico, no ofrece ninguna capacidad funcional para desarrolladores o investigadores que busquen un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no contiene pesos) |

## Arquitectura y entrenamiento

No se puede hablar de arquitectura de red neuronal, ya que el repositorio no incluye ningún modelo. La model card indica que se realizó un fine-tuning sobre un hardware compuesto por 4 GPU NVIDIA V100, en la región europe-west4 de Google Cloud. El tiempo de cómputo fue de 90,7 horas GPU, con un factor de eficiencia energética (PUE) de 1,2. La energía total consumida fue de 130,608 kWh, lo que se tradujo en 26,122 kg de CO₂ equivalente, medidos con CodeCarbon. No se especifica el modelo base, el dataset ni el tipo de tarea del fine-tuning.

## Capacidades

- No posee capacidades de generación de texto, razonamiento, código, matemáticas, visión ni ninguna otra función propia de un modelo de IA.
- No soporta tool calling, agentes, ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- Su única función es documentar métricas de emisiones de carbono de un entrenamiento concreto.

## Casos de uso

- Auditoría ambiental de entrenamientos de IA: sirve como plantilla para registrar y reportar la huella de carbono de un proceso de fine-tuning, siguiendo la metodología de CodeCarbon.
- Educación en IA sostenible: puede utilizarse en cursos o talleres para enseñar a estudiantes cómo medir y comunicar el impacto energético de sus experimentos.
- Referencia para informes de sostenibilidad: las métricas de emisiones pueden citarse en artículos o informes que requieran transparencia sobre el coste ambiental de un modelo.
- Comparación de eficiencia entre configuraciones: aunque no hay datos de otros modelos, la estructura permite contrastar el consumo de diferentes hardware o regiones si se replican experimentos similares.
- Cumplimiento de políticas de Green AI: organizaciones que exigen documentación de emisiones pueden usar este repositorio como ejemplo de formato.
- Investigación sobre contabilidad de carbono: los datos de energía y emisiones pueden servir como caso de estudio para analizar la relación entre horas de GPU y CO₂ en la región europe-west4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al no tratarse de un modelo de IA, no existen métricas de rendimiento como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El entrenamiento documentado utilizó 4 GPU NVIDIA V100, aunque no se especifica la VRAM individual (típicamente 16 GB o 32 GB por GPU).
- No se proporcionan requisitos de hardware para inferencia, ya que no hay modelo que ejecutar.
- No aplica el despliegue con vLLM, llama.cpp, Ollama o TGI.
- El consumo energético fue de 130,608 kWh para 90,7 horas de GPU, lo que da un promedio de aproximadamente 1,44 kW por hora de GPU (incluyendo PUE).

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA y no existen alternativas comparables en cuanto a capacidades. Otros repositorios con el mismo nombre (`AvanthikaShydh/tds-carbon-card`, `23f3001819/tds-carbon-card`, `aruneshpratapsingh/tds-carbon-card`, `DAKSHiitm/tds-carbon-card`, `SUMANSHAKTI27/tds-carbon-card`) contienen documentación similar de otros estudiantes, pero no son modelos.

## Limitaciones y advertencias

- No es un modelo de IA: no puede ser utilizado para ninguna tarea de inferencia, generación o procesamiento.
- La información es mínima: no se detalla el modelo base, el dataset, la tarea de fine-tuning ni los hiperparámetros.
- Las métricas de emisiones dependen de la región y del hardware; no son generalizables a otros entornos.
- No se especifica la licencia de uso del contenido, por lo que su reutilización debe hacerse con cautela.
- El repositorio parece ser un ejercicio académico, no un recurso destinado a producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/aniketsingh672/tds-carbon-card
- Repositorios similares de otros autores (mismo nombre, misma finalidad):
  - https://huggingface.co/AvanthikaShydh/tds-carbon-card
  - https://huggingface.co/23f3001819/tds-carbon-card
  - https://huggingface.co/aruneshpratapsingh/tds-carbon-card
  - https://huggingface.co/DAKSHiitm/tds-carbon-card
  - https://huggingface.co/SUMANSHAKTI27/tds-carbon-card
