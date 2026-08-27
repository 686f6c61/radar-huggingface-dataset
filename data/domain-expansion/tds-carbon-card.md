# Domain-expansion/tds-carbon-card

## Resumen

El repositorio `Domain-expansion/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino una *model card* de contabilidad de carbono (Green AI Carbon Accounting) que documenta la huella de CO₂ y el consumo energético de un entrenamiento de modelo realizado en el marco del curso TDS GA8. Este tipo de documentación forma parte de una iniciativa más amplia para normalizar el reporte de emisiones en tarjetas de modelo, promovida por Hugging Face y organizaciones como la OCDE.

El contenido se limita a una tabla de metadatos con las emisiones calculadas mediante CodeCarbon, el hardware utilizado (una NVIDIA H100), la región de cómputo (ap-southeast1) y el modo de entrenamiento (fine-tuning). No se incluye ningún peso, arquitectura, dataset ni código de inferencia. Por tanto, no es un modelo desplegable ni evaluable, sino un artefacto de transparencia ambiental.

Su relevancia radica en ejemplificar cómo se puede reportar el coste energético de un entrenamiento, un aspecto cada vez más demandado en publicaciones y despliegues de IA responsable. Para un desarrollador o investigador, este repositorio sirve como referencia de formato y metodología, no como un recurso funcional.

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

No se puede hablar de arquitectura de red neuronal, ya que el repositorio no incluye ningún artefacto de modelo. La información disponible describe únicamente el proceso de entrenamiento: se realizó un fine-tuning sobre una GPU NVIDIA H100 durante 292,7 horas de GPU, con un factor de eficiencia energética del centro de datos (PUE) de 1,22. El consumo total de energía fue de 249,9658 kWh, lo que se tradujo en 119,984 kg de CO₂ equivalente, calculados con la herramienta CodeCarbon.

La región de cómputo indicada es `ap-southeast1` (Singapur), aunque el campo `geographical_location` en el YAML de Hugging Face aparece como `region:us`. Esta discrepancia sugiere que los metadatos pueden ser inconsistentes o que la ubicación real del cómputo difiere de la registrada. No se proporcionan detalles sobre el dataset, el número de pasos, la tasa de aprendizaje ni ninguna otra hiperparametro.

## Capacidades

- No es un modelo de IA: no genera texto, código, imágenes ni realiza razonamiento.
- No soporta tool calling, agentes ni procesamiento multimodal.
- No tiene capacidades multilingües ni de ningún tipo relacionadas con inferencia.
- Su única función es documentar el impacto ambiental de un entrenamiento concreto, sirviendo como registro de transparencia.

## Casos de uso

- **Reporte de emisiones en publicaciones académicas**: investigadores pueden usar este formato para incluir la huella de carbono de sus entrenamientos en papers, cumpliendo con requisitos de transparencia de revistas y conferencias.
- **Auditoría interna de sostenibilidad**: equipos de MLOps pueden replicar esta estructura para llevar un registro de consumo energético de sus propios entrenamientos y optimizar el uso de GPUs.
- **Comparativa de eficiencia entre proveedores cloud**: al documentar región, hardware y PUE, se puede comparar el coste ambiental de distintas opciones de despliegue (por ejemplo, `ap-southeast1` frente a otras regiones).
- **Cumplimiento normativo**: empresas sujetas a regulaciones de reporte de emisiones (como la CSRD en Europa) pueden usar estas tarjetas como evidencia de sus prácticas de IA responsable.
- **Educación y formación**: en cursos de IA sostenible (como el propio TDS GA8), estos repositorios sirven como ejemplos prácticos de cómo medir y comunicar el impacto ambiental.
- **Integración en pipelines de CI/CD**: se puede automatizar la generación de estas tarjetas con CodeCarbon en cada entrenamiento, generando un histórico de emisiones por versión de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al no tratarse de un modelo de IA, no existen métricas de rendimiento como MMLU, HumanEval o GSM8K. Los únicos datos numéricos son los relativos al consumo energético: 292,7 horas de GPU, 249,9658 kWh y 119,984 kg de CO₂eq.

## Requisitos de hardware

- El entrenamiento documentado utilizó una única GPU NVIDIA H100.
- No se especifican requisitos de VRAM para inferencia porque no hay modelo que ejecutar.
- El repositorio no contiene pesos ni código de inferencia, por lo que no es desplegable en vLLM, llama.cpp, Ollama ni TGI.
- Para reproducir el entrenamiento original se necesitaría al menos una H100 (80 GB de VRAM) o hardware equivalente, aunque se desconoce el tamaño del modelo fine-tuneado.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos" comparable porque este repositorio no es un modelo de IA. Los repositorios similares en Hugging Face (por ejemplo, `pandey1111/tds-carbon-card` o `shivainlabs/tds-carbon-card`) son variaciones del mismo ejercicio académico, con la misma estructura de documentación de carbono, pero no ofrecen capacidades de inferencia.

## Limitaciones y advertencias

- **No es un modelo funcional**: cualquier intento de cargarlo o usarlo para inferencia fallará, ya que no contiene pesos ni arquitectura.
- **Datos de emisiones limitados**: la medición de CO₂ se basa en CodeCarbon y en un PUE estimado de 1,22, que puede variar según la fuente de energía real de la región.
- **Inconsistencia geográfica**: el YAML indica `region:us` mientras que el README menciona `ap-southeast1`; esta discrepancia reduce la fiabilidad de los metadatos.
- **Sin licencia especificada**: no se indica bajo qué términos se distribuye el contenido, lo que limita su reutilización legal.
- **Sin contexto de entrenamiento**: no se documenta el dataset, el modelo base ni los hiperparámetros, por lo que la cifra de emisiones no es reproducible ni verificable externamente.
- **Riesgo de malinterpretación**: un desarrollador podría confundir este repositorio con un modelo real y perder tiempo intentando desplegarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Domain-expansion/tds-carbon-card
- Repositorio similar (pandey1111): https://huggingface.co/pandey1111/tds-carbon-card
- Repositorio similar (shivainlabs): https://huggingface.co/shivainlabs/tds-carbon-card
- Artículo sobre Sustainability Model Cards: https://www.emergentmind.com/topics/sustainability-model-cards
- Guía de la OCDE sobre reporte de emisiones en model cards: https://oecd.ai/en/catalogue/tools/model-cards/tool-use-cases/reporting-carbon-emissions-on-open-source-model-cards
- Estadísticas de emisiones de entrenamiento de IA (2026): https://axis-intelligence.com/ai-training-carbon-emissions-statistics/
