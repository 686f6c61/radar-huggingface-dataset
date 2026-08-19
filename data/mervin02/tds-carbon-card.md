# Mervin02/tds-carbon-card

## Resumen

El repositorio `Mervin02/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino una *model card* de contabilidad de carbono correspondiente a un proceso de fine-tuning realizado en el contexto del curso TDS GA8. Documenta las emisiones de CO₂ equivalente, el consumo energético y el hardware utilizado durante el entrenamiento, siguiendo las prácticas de "Green AI" para hacer transparente el impacto ambiental del entrenamiento de modelos.

Aunque se etiqueta como un modelo en HuggingFace, su contenido es un registro de metadatos ambientales, no pesos ni arquitectura. Carece de pipeline, licencia e idiomas declarados, y no ofrece ninguna funcionalidad de inferencia. Su relevancia radica en ejemplificar cómo reportar la huella de carbono de un entrenamiento, no en ser un recurso utilizable para desarrollo o investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no contiene pesos) |

## Arquitectura y entrenamiento

No se dispone de información sobre arquitectura, ya que el repositorio no contiene un modelo. Los únicos datos de entrenamiento son los del proceso de fine-tuning documentado: se utilizaron 6 GPUs NVIDIA T4 en la región `us-central1`, con un total de 262,7 horas de GPU (PUE 1,14). El consumo energético total fue de 125,7808 kWh y las emisiones asociadas, 44,023 kg de CO₂ equivalente, calculadas con la herramienta CodeCarbon.

No se especifica el dataset, el tipo de modelo original ni el método de fine-tuning (por ejemplo, si se usó LoRA, RLHF, etc.). Tampoco se indican innovaciones técnicas, ya que el propósito es exclusivamente la contabilidad ambiental.

## Capacidades

- No aplica: el repositorio no contiene un modelo con capacidades de generación, razonamiento, código, visión u otras.
- No hay soporte de tool calling, agentes, ni procesamiento multimodal.
- No se declara ningún idioma soportado ni funcionalidad de inferencia.

## Casos de uso

- Auditoría de emisiones en proyectos de IA: este repositorio sirve como plantilla para documentar el impacto ambiental de un entrenamiento, útil para organizaciones que deban reportar sostenibilidad.
- Educación en "Green AI": puede usarse en cursos o talleres para enseñar a medir y reportar la huella de carbono de modelos, utilizando CodeCarbon y métricas estandarizadas.
- Transparencia en publicaciones académicas: investigadores pueden replicar este formato para incluir la sección de emisiones en sus papers, siguiendo las recomendaciones de la comunidad.
- Comparación de eficiencia energética: aunque no hay datos de rendimiento del modelo, los valores de kWh y CO₂ pueden compararse con otros fine-tunings similares para evaluar la eficiencia del hardware.
- Cumplimiento normativo: en contextos donde se exija reportar el impacto ambiental de la computación, este tipo de registro sirve como evidencia.
- Optimización de infraestructura: los datos de GPU horas y energía pueden guiar decisiones sobre qué hardware o región usar en futuros entrenamientos para reducir emisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene métricas de calidad del modelo (MMLU, HumanEval, GSM8K, etc.), ya que no se trata de un modelo de IA.

## Requisitos de hardware

- No aplica para inferencia, ya que no hay modelo que ejecutar.
- El entrenamiento documentado usó 6 GPUs NVIDIA T4 en la región `us-central1`, con 262,7 horas de GPU.
- No se especifican requisitos de VRAM ni opciones de despliegue (vLLM, llama.cpp, etc.).
- No hay datos de latencia ni throughput, pues no existe servicio de inferencia.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque este repositorio no es un modelo de IA, sino un registro de emisiones. No se puede comparar con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo utilizable: no contiene pesos, tokenizador ni pipeline de inferencia. Cualquier intento de cargarlo como modelo fallará.
- La licencia no está especificada, por lo que no se puede determinar si su contenido (los metadatos) puede reutilizarse libremente.
- Los datos de emisiones dependen de la región y del hardware; no son generalizables a otros entornos.
- El repositorio no incluye información sobre el modelo original que fue fine-tuneado, por lo que no se puede evaluar su calidad ni su aplicabilidad.
- Al ser un registro de una tarea académica, puede contener errores o simplificaciones en la metodología de cálculo (por ejemplo, el factor de emisión de la red eléctrica de `us-central1`).

## Enlaces

- [HuggingFace - Mervin02/tds-carbon-card](https://huggingface.co/Mervin02/tds-carbon-card)
