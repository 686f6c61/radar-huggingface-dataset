# priyamiitm/tds-carbon-card

## Resumen

El repositorio `priyamiitm/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino la documentación de la huella de carbono y el consumo energético asociados a una ejecución de entrenamiento de un modelo dentro de la asignación académica "TDS GA8". El autor, `priyamiitm`, ha publicado esta ficha como parte de un ejercicio de contabilidad ambiental en el ámbito de la IA, utilizando la herramienta CodeCarbon para medir las emisiones de CO₂ equivalente.

El repositorio reporta un entrenamiento realizado sobre 4 GPU NVIDIA V100 en la región `asia-south1`, con un total de 367 horas de cómputo, un consumo energético de 647,388 kWh y unas emisiones de 420,802 kg de CO₂eq. No se incluyen pesos, arquitectura, código ni ningún artefacto de modelo; únicamente los metadatos de emisiones y energía. La relevancia de esta publicación radica en su contribución a la transparencia del coste ambiental del entrenamiento de modelos, un aspecto cada vez más demandado en la investigación y el desarrollo de IA responsable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no aplica (no contiene pesos) |

Además de los campos anteriores, la model card proporciona los siguientes datos sobre la ejecución de entrenamiento documentada:

| Parametro | Valor |
|---|---|
| Hardware | NVIDIA V100 (4 GPUs) |
| Modo de entrenamiento | pre-training |
| Region | asia-south1 |
| Horas de GPU | 367 h (PUE: 1,47) |
| Energia total | 647,388 kWh |
| Emisiones de CO₂ | 420,802 kg CO₂eq |
| Fuente de medicion | CodeCarbon |

## Arquitectura y entrenamiento

No se dispone de información sobre arquitectura de red neuronal, ya que este repositorio no publica ningún modelo. Los únicos datos de entrenamiento disponibles son los relativos al consumo de recursos: 4 GPU NVIDIA V100, 367 horas de cómputo, un factor de eficiencia energética (PUE) de 1,47 y una energía total consumida de 647,388 kWh. La medición de emisiones se realizó con CodeCarbon, una librería que estima el CO₂eq en función del hardware, la ubicación geográfica y la fuente de electricidad. La región indicada, `asia-south1`, corresponde a un centro de datos en Mumbai (India), cuya intensidad de carbono media es relativamente alta en comparación con otras regiones.

## Capacidades

Este repositorio no implementa ninguna capacidad de IA. No genera texto, no razona, no procesa código ni admite interacción alguna. Su función es exclusivamente documental: registrar y comunicar el impacto ambiental de una ejecución de entrenamiento concreta. Por tanto, no existen capacidades de tool calling, agentes, multimodalidad o multilingüismo.

## Casos de uso

- Auditoría de emisiones en proyectos de IA: el repositorio sirve como ejemplo de cómo documentar el coste de carbono de un entrenamiento, útil para empresas o grupos de investigación que necesiten reportar su huella ambiental.
- Investigación en Green AI: los datos aquí publicados pueden utilizarse como referencia para estudiar la relación entre hardware, ubicación y emisiones en entrenamientos de tamaño medio.
- Docencia en sostenibilidad computacional: la ficha es un material didáctico para cursos que enseñan a medir y reportar el impacto energético de la computación.
- Comparación de infraestructuras: los valores de energía y emisiones permiten contrastar el coste de utilizar GPUs V100 en la región `asia-south1` frente a otras configuraciones o localizaciones.
- Cumplimiento de políticas de transparencia: organizaciones que deban publicar informes de sostenibilidad pueden adoptar este formato de model card como plantilla.
- Reproducibilidad de mediciones: al especificar la herramienta (CodeCarbon), el hardware y la región, otros equipos pueden replicar el cálculo para validar o ampliar los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al no tratarse de un modelo de IA, no existen métricas de precisión, razonamiento o generación que reportar.

## Requisitos de hardware

No aplican requisitos de hardware para inferencia, puesto que no hay modelo desplegable. El hardware documentado es exclusivamente el utilizado en el entrenamiento:

- 4 GPU NVIDIA V100 (16 GB o 32 GB, no se especifica).
- 367 horas de uso acumulado.
- Región `asia-south1` (Mumbai), con un PUE de 1,47.
- No se indica memoria RAM, almacenamiento ni otros componentes.

Para reproducir la medición de emisiones se necesitaría un entorno con acceso a GPUs equivalentes y la instalación de la librería CodeCarbon.

## Comparativa con modelos similares

No disponible. Los resultados de búsqueda muestran repositorios homónimos de otros autores (`jayiitm/tds-carbon-card`, `sangam-jha/tds-carbon-card`, `AvanthikaShydh/tds-carbon-card`, `Hrishi-iitm/tds-carbon-card`) que parecen pertenecer a la misma tarea académica, pero no se dispone de los datos de emisiones de esos repositorios para establecer una comparación cuantitativa. Todos ellos carecen de modelo y se limitan a documentar la huella de carbono de sus respectivas ejecuciones.

## Limitaciones y advertencias

- No contiene ningún artefacto de modelo: no hay pesos, tokenizador, configuración ni código de inferencia.
- Los datos de emisiones dependen de la metodología de CodeCarbon y de la precisión de los factores de emisión de la región; pueden no ser directamente comparables con otras mediciones que usen herramientas o supuestos distintos.
- La licencia no está especificada, por lo que no se puede garantizar el uso comercial o la redistribución del contenido del repositorio.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un material académico de baja difusión, no un recurso de producción.
- No se aporta información sobre el modelo entrenado (arquitectura, tamaño, tarea), lo que limita la interpretación de los costes energéticos en términos de eficiencia por parámetro o por tarea.
- La fecha de creación (2026-08-28) es posterior a la fecha actual en el contexto de la consulta, lo que podría indicar un error en los metadatos o una fecha simulada; se recomienda verificar la vigencia del contenido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/priyamiitm/tds-carbon-card
- Repositorios similares encontrados en la búsqueda web:
  - https://huggingface.co/jayiitm/tds-carbon-card
  - https://huggingface.co/sangam-jha/tds-carbon-card
  - https://huggingface.co/AvanthikaShydh/tds-carbon-card
  - https://huggingface.co/Hrishi-iitm/tds-carbon-card
