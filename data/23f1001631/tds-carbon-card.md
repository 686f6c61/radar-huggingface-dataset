# 23f1001631/tds-carbon-card

## Resumen

Este repositorio, `23f1001631/tds-carbon-card`, no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado a un proceso de entrenamiento. Documenta la huella de CO₂ equivalente generada durante un fine-tuning realizado con cinco GPUs NVIDIA V100 en la región `ap-southeast1`. Incluye datos como horas de GPU, consumo energético total y emisiones de CO₂, siguiendo la iniciativa de Green AI para la transparencia ambiental en el entrenamiento de modelos.

Aunque no ofrece pesos, arquitectura ni capacidades de inferencia, es relevante como ejemplo de buenas prácticas en la publicación de métricas de sostenibilidad para el sector. Su existencia responde a la necesidad de cuantificar y comunicar el impacto medioambiental de los procesos de entrenamiento, un aspecto cada vez más crítico en el desarrollo de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no aplica (no contiene pesos) |
| Emisiones CO2 | 307.56 kg CO2eq |
| Hardware usado | NVIDIA V100 (5 GPUs) |
| Region de entrenamiento | ap-southeast1 |
| Horas de GPU | 365.1 h (PUE: 1.17) |
| Energia total | 640.7505 kWh |

## Arquitectura y entrenamiento

No se trata de un modelo, sino de un documento que detalla las condiciones del entrenamiento de otro modelo no especificado. El repositorio indica que se realizó un fine-tuning sobre hardware NVIDIA V100 (5 GPUs) en la región `ap-southeast1`. Se reportan 365.1 horas de uso de GPU con un PUE de 1.17, un consumo energético total de 640.7505 kWh y unas emisiones de 307.56 kg de CO₂ equivalente, calculadas mediante la herramienta CodeCarbon. No se proporcionan detalles sobre el dataset, la arquitectura del modelo base ni el proceso de optimización.

## Capacidades

- No posee capacidades de generación de texto, razonamiento, código ni visión, ya que no es un modelo de IA.
- Su funcionalidad se limita a servir como registro de contabilidad ambiental de un proceso de entrenamiento.
- Puede utilizarse como referencia para auditorías de sostenibilidad o para comparar el impacto de diferentes configuraciones de hardware y regiones.

## Casos de uso

- **Reportes de sostenibilidad corporativa**: el repositorio puede usarse como plantilla o ejemplo para que otras organizaciones documenten la huella de carbono de sus entrenamientos, facilitando la elaboración de informes ESG.
- **Auditoría interna de infraestructura**: los datos de energía y emisiones permiten a un equipo evaluar el coste ambiental de sus recursos de cómputo y tomar decisiones sobre optimización de hardware o cambio de región.
- **Investigación académica sobre IA verde**: los investigadores pueden analizar estos datos para estudiar patrones de consumo energético en función del hardware (en este caso V100) y la localización geográfica.
- **Comparativa entre proyectos**: al existir otros repositorios similares (p. ej. con H100 o RTX 4090), permite comparar la eficiencia energética de diferentes configuraciones y entrenamientos.
- **Educación y concienciación**: sirve como material didáctico para enseñar la importancia de medir y reducir la huella de carbono en el desarrollo de IA.
- **Integración en pipelines de CI**: aunque no es un modelo, su estructura puede inspirar la creación de herramientas que generen automáticamente este tipo de informes al finalizar un entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible, ya que no existe un modelo de IA asociado a este repositorio.

## Requisitos de hardware

- No aplica para inferencia, ya que no hay modelo que ejecutar.
- El repositorio documenta el hardware usado en el entrenamiento: 5 GPUs NVIDIA V100.
- Para reproducir o verificar los cálculos de emisiones se requeriría acceso a los datos de entrenamiento originales y al entorno de ejecución (región `ap-southeast1`).

## Comparativa con modelos similares

No se trata de un modelo de IA, por lo que no es comparable con otros modelos de lenguaje o visión. Sin embargo, dentro de la misma categoría de “carbon card” existen otros repositorios similares en HuggingFace que documentan entrenamientos con distinta configuración:

| Repositorio | Hardware | Modo | Región | Emisiones (kg CO2eq) |
|---|---|---|---|---|
| `23f1001631/tds-carbon-card` | V100 (5 GPUs) | fine-tuning | ap-southeast1 | 307.56 |
| `23ft/tds-carbon-card` | V100 (5 GPUs) | fine-tuning | no especificado | no disponible |
| `Bhagwat8978/tds-carbon-card` | H100 (3 GPUs) | fine-tuning | us-east1 | 587.655 |
| `luffyisthepirateking/tds-carbon-card` | RTX 4090 (8 GPUs) | pre-training | asia-south1 | 1310.99 |
| `ShivanshHanda/tds-carbon-card` | V100 (8 GPUs) | pre-training | us-central1 | 102.307 |

Se observa que las emisiones varían fuertemente según el hardware, el número de GPUs y la región, lo que subraya la importancia de elegir infraestructuras eficientes y ubicaciones con menor intensidad de carbono.

## Limitaciones y advertencias

- No es un modelo de IA; no puede ejecutarse ni utilizarse para tareas de procesamiento del lenguaje.
- La información de licencia no está disponible, por lo que no se conoce si el contenido puede reutilizarse con fines comerciales.
- El repositorio no proporciona detalles sobre el modelo entrenado, ni sus pesos, ni su configuración, lo que limita su utilidad para reproducir el entrenamiento.
- Los datos de emisiones dependen de la herramienta CodeCarbon y de los factores de emisión de la región `ap-southeast1`; pueden variar si se actualizan los factores de la red eléctrica.
- No se especifica el dataset utilizado ni la duración exacta del entrenamiento en horas de reloj, solo horas de GPU.

## Enlaces

- Repositorio HuggingFace: [23f1001631/tds-carbon-card](https://huggingface.co/23f1001631/tds-carbon-card)
- Repositorio similar `23ft/tds-carbon-card`: [https://huggingface.co/23ft/tds-carbon-card](https://huggingface.co/23ft/tds-carbon-card)
- Repositorio similar `Bhagwat8978/tds-carbon-card`: [https://huggingface.co/Bhagwat8978/tds-carbon-card](https://huggingface.co/Bhagwat8978/tds-carbon-card)
- Repositorio similar `luffyisthepirateking/tds-carbon-card`: [https://huggingface.co/luffyisthepirateking/tds-carbon-card](https://huggingface.co/luffyisthepirateking/tds-carbon-card)
- Repositorio similar `ShivanshHanda/tds-carbon-card`: [https://huggingface.co/ShivanshHanda/tds-carbon-card](https://huggingface.co/ShivanshHanda/tds-carbon-card)
