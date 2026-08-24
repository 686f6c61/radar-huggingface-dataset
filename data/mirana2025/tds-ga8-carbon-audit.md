# mirana2025/tds-ga8-carbon-audit

## Resumen

El repositorio `mirana2025/tds-ga8-carbon-audit` no contiene un modelo de inteligencia artificial, sino una tarjeta de auditoría de emisiones de carbono asociada a un proceso de entrenamiento por fine-tuning. Publicado por el usuario `mirana2025`, este registro documenta que el entrenamiento generó 31,657 kilogramos de CO₂ equivalente, calculados con la herramienta CodeCarbon. El entrenamiento se realizó en una GPU NVIDIA T4, ubicada en la región `ap-southeast1`, y se clasifica como un proceso de fine-tuning.

La relevancia de este repositorio reside en la creciente práctica de transparencia ambiental en el desarrollo de modelos de IA, donde se publican las huellas de carbono de los entrenamientos. No se ofrece ninguna arquitectura, tamaño, contexto ni capacidades de inferencia, por lo que no es un modelo utilizable para tareas de procesamiento del lenguaje natural o generación de contenido.

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
| Emisiones de CO₂ equivalente | 31,657 kg (medido con CodeCarbon) |
| Hardware de entrenamiento | NVIDIA T4 |
| Region de entrenamiento | ap-southeast1 |
| Tipo de entrenamiento | fine-tuning |

## Arquitectura y entrenamiento
No se dispone de información sobre la arquitectura del modelo subyacente, ya que el repositorio no contiene pesos ni configuraciones de red. El único dato técnico es que se trata de un proceso de fine-tuning realizado sobre un hardware NVIDIA T4, y que las emisiones fueron calculadas con CodeCarbon. No se especifican los datos de entrenamiento, el número de tokens ni ninguna técnica de optimización o alineación (RLHF, DPO, etc.). Por tanto, no es posible describir una arquitectura ni un proceso de entrenamiento más allá de lo ya mencionado.

## Capacidades
- No es un modelo de IA operativo; no genera texto, no procesa imágenes ni ofrece ninguna funcionalidad de inferencia.
- Su única función es servir como registro público de la huella de carbono de un entrenamiento concreto.
- No admite tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso
- Auditoría interna de sostenibilidad: el registro permite a la organización que realizó el entrenamiento documentar sus emisiones para informes de responsabilidad corporativa.
- Transparencia pública: investigadores y desarrolladores pueden consultar este tipo de tarjetas para comparar el impacto ambiental de distintos entrenamientos.
- Cumplimiento normativo: si futuras regulaciones exigen reportar emisiones de IA, este registro sirve como evidencia.
- Investigación en eficiencia energética: los datos de CodeCarbon pueden utilizarse para estudiar el coste ambiental de distintos hardware y configuraciones.
- Benchmarking de huella de carbono: se puede comparar este registro con otros repositorios similares (p. ej., `Atharva191/tds-ga8-carbon-audit`) para evaluar la variabilidad de emisiones.
- Documentación de modelos: aunque este repositorio no contiene un modelo, puede adjuntarse como anexo a la tarjeta de un modelo real para reportar su impacto ambiental.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. No se trata de un modelo de inferencia, por lo que no hay métricas de calidad de texto, razonamiento ni código.

## Requisitos de hardware
- No aplica: el repositorio no contiene un modelo para inferencia.
- El entrenamiento que se audita se realizó en una NVIDIA T4, una GPU de gama media con 16 GB de VRAM, comúnmente utilizada en entornos cloud.
- No se especifican requisitos de despliegue, latencia ni throughput, ya que no hay modelo que servir.

## Comparativa con modelos similares
No se dispone de información de modelos comparables. Los repositorios `Atharva191/tds-ga8-carbon-audit` y `aiajajaiintelligence/tds-ga8-carbon-audit` son de naturaleza idéntica (tarjetas de auditoría de carbono), pero no se conocen sus valores de emisiones ni detalles técnicos, por lo que no es posible realizar una comparativa cuantitativa.

## Limitaciones y advertencias
- El repositorio no contiene un modelo utilizable; cualquier intento de cargarlo o ejecutarlo como un LLM fallará.
- La información es extremadamente limitada: no se especifica qué modelo base se fine-tuneó, ni su tamaño, ni la duración del entrenamiento.
- No se indica la licencia del contenido, por lo que no está claro si puede reutilizarse libremente.
- El dato de emisiones (31,657 kg CO₂) depende de la metodología de CodeCarbon y de la región energética; no es extrapolable a otros contextos.
- No hay garantía de que el registro sea exacto o verificado por terceros.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/mirana2025/tds-ga8-carbon-audit
- Repositorio similar de Atharva191: https://huggingface.co/Atharva191/tds-ga8-carbon-audit
- Repositorio similar de aiajajaiintelligence: https://huggingface.co/aiajajaiintelligence/tds-ga8-carbon-audit
- Herramienta de medición de emisiones CodeCarbon: https://github.com/mlco2/codecarbon (referencia indirecta)
