# lolaaa123/tds-carbon-card

## Resumen

El repositorio `lolaaa123/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino una tarjeta de contabilidad de carbono (carbon card) que documenta la huella de CO₂ equivalente generada durante una ejecución de entrenamiento. Forma parte de la iniciativa TDS GA8, cuyo objetivo es registrar de forma estandarizada las emisiones asociadas a distintos trabajos de entrenamiento de modelos. El autor, `lolaaa123`, publica aquí los datos de consumo energético y emisiones de una ejecución de pre-entrenamiento realizada en cinco GPU NVIDIA A100 en la región `us-east1`.

Este tipo de repositorios es relevante para la comunidad de IA responsable, ya que permite auditar y comparar el coste medioambiental de diferentes configuraciones de entrenamiento. Aunque no se ofrece ningún peso, arquitectura o capacidad de inferencia, la información aquí contenida es útil para investigadores y desarrolladores que deseen estimar el impacto de sus propios entrenamientos o adoptar prácticas de Green AI.

En la actualidad, el repositorio cuenta con cero descargas y cero likes, y fue creado el 28 de agosto de 2026. No se proporciona ninguna licencia, idioma soportado ni pipeline asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica el modelo entrenado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos) |

Adicionalmente, la tarjeta documenta los siguientes datos de entrenamiento:

| Dato | Valor |
|---|---|
| Hardware | 5x NVIDIA A100 |
| Modo de entrenamiento | pre-training |
| Region | us-east1 |
| Horas de GPU | 353,9 h (PUE: 1,14) |
| Energia total | 806,892 kWh |
| Emisiones de CO₂ | 338,895 kg CO₂eq |

## Arquitectura y entrenamiento

No se proporciona información sobre la arquitectura del modelo que fue entrenado, ni sobre su tamaño, configuración o técnica de optimización. La tarjeta se limita a registrar los datos de consumo energético y emisiones. La herramienta utilizada para la medición es CodeCarbon, una librería estándar para estimar la huella de carbono de entrenamientos de IA. El entrenamiento se realizó en modo pre-training, lo que sugiere que se partió de datos sin etiquetar, pero no se especifica el dataset ni el número de tokens.

No se mencionan innovaciones técnicas, técnicas de alineación (RLHF, DPO) ni detalles del proceso de entrenamiento más allá de los datos de hardware y energía.

## Capacidades

No se aplican capacidades de modelo, ya que este repositorio no contiene un modelo funcional. No hay generación de texto, razonamiento, código, visión ni ninguna otra funcionalidad de IA. La única "capacidad" del repositorio es documentar el impacto medioambiental de un entrenamiento concreto.

## Casos de uso

- Auditoría de emisiones en proyectos de IA: este tipo de tarjeta permite a organizaciones y equipos registrar y reportar el CO₂ emitido durante sus entrenamientos, facilitando el cumplimiento de políticas de sostenibilidad.
- Comparación de eficiencia energética entre configuraciones: al existir múltiples tarjetas similares (por ejemplo, con diferentes GPUs o regiones), se puede analizar qué hardware y ubicación geográfica minimiza la huella de carbono.
- Investigación en Green AI: los datos de consumo energético y emisiones sirven como referencia empírica para estudios sobre el coste medioambiental del entrenamiento de modelos.
- Integración en pipelines de CI/CD: las tarjetas de carbono pueden generarse automáticamente tras cada ejecución de entrenamiento y archivarse para trazabilidad.
- Formación y concienciación: sirven como material didáctico para mostrar a estudiantes y desarrolladores el impacto real de sus trabajos de entrenamiento.
- Toma de decisiones en infraestructura: los datos de PUE, horas de GPU y energía total ayudan a elegir entre proveedores de nube o centros de datos según su eficiencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible, ya que este repositorio no contiene un modelo evaluable. No hay puntuaciones de MMLU, HumanEval, GSM8K ni ninguna otra métrica de rendimiento.

## Requisitos de hardware

Los requisitos de hardware se refieren al entrenamiento documentado, no a inferencia:

- Se utilizaron 5 GPU NVIDIA A100 para el entrenamiento.
- La duración total fue de 353,9 horas de GPU.
- El consumo energético total fue de 806,892 kWh.
- No se especifican requisitos para inferencia, ya que no hay modelo publicado.
- No se indican opciones de despliegue (vLLM, llama.cpp, etc.) ni latencia.

## Comparativa con modelos similares

No se puede establecer una comparativa con otros modelos de IA, ya que este repositorio no es un modelo. Sin embargo, se pueden comparar las tarjetas de carbono de otros autores que documentan entrenamientos similares dentro del mismo proyecto TDS GA8:

| Repositorio | Hardware | Horas GPU | Energia (kWh) | CO₂ (kg) |
|---|---|---|---|---|
| lolaaa123/tds-carbon-card | 5x A100 | 353,9 | 806,892 | 338,895 |
| 23f3001222/tds-carbon-card | 3x A100 | 206,6 | 384,276 | 76,855 |
| sahajm/tds-carbon-card | 8x V100 | 16,3 | 62,2008 | 40,431 |

Estos datos muestran diferencias notables en eficiencia: la ejecución con V100 en asia-south1 consume menos energía y emite menos CO₂ por hora de GPU, mientras que la de 5 A100 en us-east1 es la más intensiva en emisiones. Esta comparativa es útil para entender el impacto de la elección de hardware y región.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo de IA; no es posible realizar inferencias ni descargar pesos.
- La licencia no está especificada, por lo que no se puede determinar si el contenido puede reutilizarse comercialmente.
- Los datos de emisiones dependen de la metodología de CodeCarbon y del factor de emisión de la región us-east1; pueden no ser directamente comparables con mediciones de otras herramientas.
- No se proporciona información sobre el modelo entrenado, por lo que no se pueden evaluar sesgos, alucinaciones u otras limitaciones típicas de los modelos de lenguaje.
- La falta de descargas y de actualizaciones recientes sugiere que el repositorio es parte de un ejercicio académico o de demostración, no de un proyecto en producción.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/lolaaa123/tds-carbon-card
- Repositorio similar de 23f3001222: https://huggingface.co/23f3001222/tds-carbon-card
- Repositorio similar de princejm: https://huggingface.co/princejm/tds-carbon-card
- Repositorio similar de 24f3004361: https://huggingface.co/24f3004361/tds-carbon-card
- Repositorio similar de sahajm: https://huggingface.co/sahajm/tds-carbon-card
- Repositorio similar de annmary43: https://huggingface.co/annmary43/tds-carbon-card
