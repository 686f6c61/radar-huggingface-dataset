# Gispati/tds-carbon-card

## Resumen

El repositorio `Gispati/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado a un entrenamiento de modelo realizado en el contexto del curso TDS GA8. Su propósito es documentar las emisiones de CO₂ equivalente, el consumo energético y el hardware utilizado durante una ejecución de pre-entrenamiento, siguiendo la iniciativa Green AI. Este tipo de artefactos es relevante porque permite auditar el impacto ambiental de los entrenamientos de modelos, un aspecto cada vez más crítico en el desarrollo de IA responsable.

El autor, identificado como Gispati, publica una model card que incluye métricas calculadas con CodeCarbon: 273,808 kg de CO₂eq emitidos, 651,924 kWh de energía total consumida y 477,6 horas de GPU en tres NVIDIA L40S. No se especifica el modelo entrenado, su arquitectura ni sus parámetros, por lo que esta ficha se centra en el registro de emisiones y sus implicaciones prácticas para equipos de desarrollo que buscan medir y reducir su huella de carbono.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable |
| Longitud de contexto | no aplicable |
| Tipos de cuantizacion | no aplicable |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de datos y metadatos) |

## Arquitectura y entrenamiento

Este repositorio no describe una arquitectura de red neuronal ni un proceso de entrenamiento convencional. En su lugar, documenta los datos de consumo energético y emisiones de un entrenamiento de pre-entrenamiento realizado con tres GPUs NVIDIA L40S en la región us-east1. Según la model card, el entrenamiento consumió 651,924 kWh de energía total, con un factor de eficiencia energética (PUE) de 1,3, y generó 273,808 kg de CO₂ equivalente. La herramienta utilizada para el cálculo fue CodeCarbon, que estima las emisiones en función del hardware, la ubicación geográfica y el consumo eléctrico.

No se proporciona información sobre el conjunto de datos, el número de tokens, el tamaño del modelo ni las técnicas de optimización empleadas. El repositorio parece ser un ejercicio académico de transparencia ambiental, más que un modelo funcional. Por tanto, no hay innovaciones técnicas en arquitectura o entrenamiento que analizar.

## Capacidades

- No posee capacidades de generación de texto, razonamiento, código o visión, ya que no es un modelo de IA.
- Su función es servir como registro de emisiones y consumo energético de un entrenamiento específico.
- Permite consultar métricas de sostenibilidad: emisiones de CO₂eq, energía total, horas de GPU y ubicación del cómputo.
- Puede integrarse en flujos de auditoría ambiental de proyectos de IA, aunque no ofrece ninguna interfaz de inferencia.

## Casos de uso

- Auditoría de huella de carbono en proyectos de IA: el registro permite a un equipo verificar las emisiones asociadas a un entrenamiento concreto, lo que facilita informes de sostenibilidad para clientes o reguladores.
- Comparación de eficiencia energética entre configuraciones de hardware: al conocer que se usaron tres L40S durante 477,6 horas, un equipo puede estimar el coste ambiental de alternativas con menos GPUs o con hardware más eficiente.
- Cumplimiento de políticas internas de Green AI: organizaciones que exigen reportes de emisiones para cada entrenamiento pueden usar este tipo de tarjeta como plantilla.
- Investigación académica sobre el impacto ambiental del machine learning: los datos de este repositorio pueden servir como caso de estudio para analizar la relación entre horas de GPU, energía y emisiones en la región us-east1.
- Estimación de presupuesto de carbono en proyectos futuros: a partir de los valores aquí documentados, se puede extrapolar el coste ambiental de entrenamientos similares y planificar reducciones.
- Documentación de transparencia en publicaciones científicas: autores que deban declarar el impacto ambiental de sus experimentos pueden citar este registro como referencia metodológica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de calidad del modelo (como MMLU, HumanEval o GSM8K) porque no se trata de un modelo de IA, sino de un registro de emisiones.

## Requisitos de hardware

- El entrenamiento documentado utilizó 3 GPUs NVIDIA L40S, cada una con 48 GB de VRAM, aunque no se especifica si se usaron todas las GPUs en paralelo o en secuencia.
- No se requiere hardware para "usar" este repositorio, ya que solo contiene metadatos y una model card.
- Para reproducir un entrenamiento con características similares se necesitaría un clúster con al menos 3 GPUs L40S y una infraestructura con PUE de 1,3, según los datos reportados.
- El despliegue como servicio no aplica; el repositorio puede consultarse directamente en Hugging Face sin necesidad de inferencia.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque este repositorio no es un modelo. Existen otras tarjetas de carbono similares (por ejemplo, `i-shashikant/tds-carbon-card` y `Obaid2026/tds-carbon-card`) que documentan entrenamientos del mismo curso TDS GA8, pero no son alternativas funcionales, sino registros paralelos con diferentes métricas según el entrenamiento realizado.

## Limitaciones y advertencias

- No es un modelo de IA: no puede generar texto, código ni realizar inferencias. Cualquier intento de usarlo como tal fallará.
- La licencia no está especificada, por lo que no se garantiza permiso para reutilizar los datos en otros contextos sin consultar al autor.
- Las métricas de emisiones dependen de la herramienta CodeCarbon y de los factores de emisión de la región us-east1; pueden no ser exactas para otras ubicaciones o momentos.
- No se indica el modelo entrenado, lo que impide contextualizar la relevancia de las cifras (por ejemplo, si fue un modelo pequeño o grande).
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un ejercicio académico sin validación externa.
- Los datos de hardware y energía provienen de la model card del autor; no hay verificación independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Gispati/tds-carbon-card
- Registro similar de i-shashikant: https://huggingface.co/i-shashikant/tds-carbon-card
- Registro similar de Obaid2026: https://huggingface.co/Obaid2026/tds-carbon-card
- Model cards de Google DeepMind (referencia sobre buenas prácticas): https://deepmind.google/models/model-cards/
- Applied Model Card de CHAI (documentación sobre tarjetas de modelo): https://www.chai.org/workgroup/applied-model
- Proyecto Green-AI-Carbon-Tracker en GitHub: https://github.com/praptidethe11/Green-AI-Carbon-Tracker
