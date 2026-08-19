# Divya-netter/tds-carbon-card

## Resumen

El repositorio `Divya-netter/tds-carbon-card` no contiene un modelo de inteligencia artificial propiamente dicho, sino una tarjeta de huella de carbono asociada a un proceso de fine-tuning documentado en el marco del curso TDS GA8. El autor, Divya-netter, ha publicado esta ficha en Hugging Face para registrar las emisiones de CO₂ equivalentes generadas durante el entrenamiento, siguiendo la práctica de "Green AI" que promueve la transparencia ambiental en el desarrollo de modelos. No se incluyen pesos, arquitectura ni código de inferencia; el repositorio actúa como un artefacto de contabilidad energética.

La relevancia de esta publicación radica en que ejemplifica cómo documentar el impacto ambiental de un entrenamiento, una práctica cada vez más solicitada por la comunidad y las instituciones. Aunque no ofrece capacidades de IA, sirve como referencia para quienes necesitan reportar emisiones en sus propios proyectos. La información técnica del modelo subyacente (arquitectura, parámetros, contexto) no está disponible en la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica el modelo base) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de red neuronal en la informacion proporcionada. El repositorio documenta un proceso de fine-tuning, pero no indica sobre qué modelo base se realizó ni qué tipo de transformador o arquitectura se empleó. Los únicos datos técnicos disponibles son los relativos al consumo energético: se utilizaron 6 GPUs NVIDIA RTX 4090 durante 388 horas (con un PUE de 1.44), lo que supuso un consumo total de 1508.544 kWh y unas emisiones de 633.588 kg de CO₂ equivalente, calculadas con la herramienta CodeCarbon. No se mencionan datasets, método de optimización ni técnicas de entrenamiento adicionales.

## Capacidades

- No aplica: este repositorio no contiene un modelo con capacidades de generación, razonamiento, codificación u otras tareas de IA.
- No se ofrece ninguna funcionalidad de inferencia, tool calling, agentes ni soporte multilingüe.
- Su única función es la de servir como registro de emisiones de carbono para un entrenamiento específico.

## Casos de uso

- Auditoría ambiental de entrenamientos: los equipos de MLOps pueden utilizar esta tarjeta como plantilla para reportar las emisiones de sus propios fine-tunings, cumpliendo con requisitos de sostenibilidad corporativa o institucional.
- Investigación en Green AI: los investigadores pueden referenciar este tipo de registros para estudiar la relación entre hardware, tiempo de entrenamiento y huella de carbono, contribuyendo a bases de datos de eficiencia energética.
- Transparencia en publicaciones académicas: al publicar un modelo, los autores pueden adjuntar una tarjeta similar para que los revisores y usuarios conozcan el coste ambiental del desarrollo.
- Comparación de infraestructuras: los datos de emisiones permiten comparar el impacto de diferentes configuraciones de hardware (por ejemplo, RTX 4090 vs. A100) en un mismo tipo de tarea.
- Formación y divulgación: sirve como ejemplo didáctico en cursos sobre IA responsable, mostrando cómo cuantificar y comunicar el coste energético de un entrenamiento.
- Integración en plataformas de registro: puede integrarse en herramientas de seguimiento de experimentos para automatizar la captura de emisiones, como hace CodeCarbon, y luego publicarse en el Hub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene evaluaciones de precisión, latencia ni throughput del modelo subyacente.

## Requisitos de hardware

- No se especifican requisitos de inferencia porque no hay modelo desplegable.
- Para el entrenamiento documentado se utilizaron 6 GPUs NVIDIA RTX 4090, con un total de 388 horas de cómputo.
- No se indican opciones de despliegue (vLLM, llama.cpp, Ollama, etc.) ni estimaciones de VRAM para inferencia.

## Comparativa con modelos similares

No disponible. Al no tratarse de un modelo de IA, no existen alternativas comparables en cuanto a rendimiento o capacidades. Podría compararse con otras tarjetas de carbono de la misma iniciativa (por ejemplo, `shyamy1504/tds-carbon-card`), pero la información pública de esas tarjetas es igualmente limitada y no se dispone de datos suficientes para una comparación significativa.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede descargar, ejecutar ni integrar en ningún pipeline.
- La información sobre el modelo base (arquitectura, parámetros, licencia) es inexistente, lo que impide cualquier uso técnico.
- Los datos de emisiones corresponden a una ubicación geográfica específica (us-east1) y a un hardware concreto; no son generalizables a otros entornos.
- La licencia no está especificada, por lo que no se puede determinar si el contenido del repositorio puede reutilizarse legalmente.
- La fecha de creación (2026-08-19) es futura en relación a la fecha actual, lo que sugiere que el proyecto puede ser parte de un ejercicio académico simulado o que la fecha es incorrecta.
- Para producción, este repositorio no aporta ningún valor funcional; solo tiene interés documental.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Divya-netter/tds-carbon-card
- Documentación de Hugging Face sobre emisiones de CO₂ en model cards: https://huggingface.co/docs/hub/model-cards-co2
- Ejemplo similar (otra tarjeta de carbono): https://huggingface.co/shyam1504/tds-carbon-card
- Artículo académico sobre Green AI: https://arxiv.org/abs/2404.01157
