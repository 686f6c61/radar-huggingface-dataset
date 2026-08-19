# nyiitm/tds-carbon-card

## Resumen

El repositorio `nyiitm/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado a un entrenamiento de modelo. Se trata de un ejercicio académico del curso "Tools in Data Science" (TDS) del IIT Madras, en el que cada estudiante documenta la huella de CO₂ equivalente de una ejecución de fine-tuning. El autor, `nyiitm`, reporta un entrenamiento realizado sobre 7 GPUs NVIDIA A100 en la región `us-central1`, con un consumo total de 194,03 kWh y unas emisiones de 67,91 kg de CO₂eq, medidos mediante CodeCarbon.

Este tipo de repositorios forma parte de una iniciativa más amplia de "Green AI" que busca visibilizar el coste energético del entrenamiento de modelos. Aunque no aporta ningún artefacto utilizable como modelo, resulta relevante como ejemplo de buenas prácticas de transparencia ambiental en el desarrollo de IA. No se dispone de información sobre arquitectura, parámetros, contexto o capacidades porque el repositorio únicamente contiene metadatos de emisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible |
| Emisiones de CO₂eq | 67,91 kg (CodeCarbon) |
| Hardware de entrenamiento | 7x NVIDIA A100 |
| Region de computo | us-central1 |
| Horas de GPU | 56,8 h (PUE 1,22) |
| Energia total consumida | 194,03 kWh |

## Arquitectura y entrenamiento

No se proporciona ninguna descripcion de arquitectura de red neuronal, ya que el repositorio no contiene pesos ni configuraciones de modelo. El unico dato de entrenamiento disponible es que se realizo un fine-tuning sobre hardware NVIDIA A100 en la region `us-central1`, con un total de 56,8 horas de GPU y un factor de eficiencia energetica (PUE) de 1,22. La herramienta CodeCarbon fue utilizada para estimar las emisiones, que ascienden a 67,91 kg de CO₂eq. No se mencionan datasets, tecnicas de optimizacion ni procesos de alineacion como RLHF o DPO.

## Capacidades

- No aplica: el repositorio no contiene un modelo de IA, por lo que no presenta ninguna capacidad de generacion, razonamiento, codigo, vision ni procesamiento del lenguaje.
- La unica funcionalidad del repositorio es documental: registrar la huella de carbono de un entrenamiento concreto.
- Puede servir como referencia metodologica para la medicion de emisiones con CodeCarbon en entornos de cloud.

## Casos de uso

- Auditoria ambiental de entrenamientos de IA: el repositorio demuestra como cuantificar emisiones de CO₂eq de un fine-tuning, util para organizaciones que necesiten reportar su impacto climatico.
- Educacion en Green AI: puede emplearse como material docente en cursos de ciencia de datos para ilustrar la contabilidad de carbono en proyectos de machine learning.
- Comparativa de eficiencia energetica entre proveedores cloud: los datos de region y hardware permiten contrastar el coste ambiental de distintas configuraciones.
- Integracion en pipelines de MLOps: la metodologia descrita puede replicarse para anadir metricas de sostenibilidad a los registros de entrenamiento de modelos propios.
- Elaboracion de informes de responsabilidad social corporativa (RSC): los valores de emisiones pueden incorporarse a memorias de sostenibilidad de empresas tecnologicas.
- Investigacion sobre optimizacion energetica: los datos de consumo y PUE sirven para estudiar el impacto de diferentes GPUs y regiones en la huella de carbono.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene metricas de calidad del modelo ni comparaciones con otras arquitecturas.

## Requisitos de hardware

- No aplica para inferencia, ya que no existe un modelo desplegable.
- El entrenamiento documentado requirio 7 GPUs NVIDIA A100, con un consumo total de 194,03 kWh.
- No se especifican requisitos de VRAM ni latencia, al no tratarse de un artefacto de inferencia.
- No se indican opciones de despliegue (vLLM, llama.cpp, etc.) porque no hay pesos que servir.

## Comparativa con modelos similares

No disponible. Al no ser un modelo de IA, no existe una categoria comparable. Los unicos repositorios similares son los de otros estudiantes del mismo curso (por ejemplo, `chandrasekhariitm/tds-carbon-card` y `shyam1504/tds-carbon-card`), que documentan entrenamientos con diferente hardware y regiones, pero no ofrecen capacidades de modelo.

## Limitaciones y advertencias

- El repositorio no contiene un modelo funcional: no se puede descargar, cargar ni utilizar para ninguna tarea de IA.
- No se dispone de informacion sobre la licencia de los datos o el codigo, por lo que su reutilizacion fuera del contexto academico es incierta.
- Las emisiones reportadas dependen de factores como el PUE del centro de datos y la herramienta de medicion (CodeCarbon), por lo que no son directamente comparables con mediciones de otras fuentes sin ajustes metodologicos.
- La fecha de creacion (2026-08-19) es futura respecto a la fecha actual, lo que sugiere que el repositorio podria ser parte de un escenario simulado o de un curso con fechas ficticias.
- No hay garantia de que los datos de emisiones hayan sido verificados externamente.

## Enlaces

- Repositorio original: https://huggingface.co/nyiitm/tds-carbon-card
- Repositorio similar de otro estudiante: https://huggingface.co/chandrasekhariitm/tds-carbon-card
- Repositorio similar adicional: https://huggingface.co/shyam1504/tds-carbon-card
- Contenido oficial del curso TDS (IIT Madras): https://github.com/sanand0/tools-in-data-science-public
- Ejemplo de proyecto relacionado: https://github.com/23f2002790/TDS-Project2
