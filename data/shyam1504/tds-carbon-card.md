# shyam1504/tds-carbon-card

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado a un entrenamiento de un modelo no especificado. El autor, `shyam1504`, documenta las emisiones de CO₂ equivalente generadas durante una sesión de pre-entrenamiento ejecutada en la región `us-east1` de Google Cloud, utilizando siete GPUs NVIDIA RTX 4090. El objetivo es proporcionar transparencia sobre el impacto ambiental de la computación de IA, siguiendo la iniciativa Green AI y el estándar de model cards de Hugging Face.

La relevancia de este repositorio radica en que ejemplifica cómo se puede reportar la huella de carbono de un entrenamiento de modelo, un aspecto cada vez más demandado por la comunidad investigadora y regulatoria. Sin embargo, al no incluir pesos, arquitectura ni código, no es utilizable como modelo de ML. Los datos técnicos del modelo subyacente no están disponibles, por lo que esta ficha se centra en los metadatos de sostenibilidad publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible |
| Emisiones de CO₂ equivalente | 524.896 kg CO₂eq |
| Energia total consumida | 1249.753 kWh |
| Horas de GPU | 339.1 h (PUE: 1.17) |
| Hardware utilizado | 7x NVIDIA RTX 4090 |
| Region de computo | us-east1 |
| Modo de entrenamiento | pre-training |
| Herramienta de medicion | CodeCarbon |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura del modelo, el conjunto de datos de entrenamiento, el numero de parametros ni ninguna innovacion tecnica. El repositorio se limita a documentar el consumo energetico y las emisiones asociadas a una ejecucion de pre-entrenamiento, sin detalles sobre el modelo en si. La unica informacion relevante es que se utilizaron siete GPUs NVIDIA RTX 4090 durante 339.1 horas, con un factor de eficiencia energetica (PUE) de 1.17, y que la medicion se realizo con la libreria CodeCarbon.

## Capacidades

- No aplica: este repositorio no contiene un modelo de IA con capacidades de generacion, razonamiento, codigo o vision.
- Unicamente proporciona metadatos de sostenibilidad (emisiones, energia, hardware) para auditoria ambiental.
- No soporta tool calling, agentes ni procesamiento multilingue.

## Casos de uso

- Reporte de huella de carbono en investigacion academica: los equipos de IA pueden utilizar este repositorio como plantilla para documentar las emisiones de sus propios entrenamientos, siguiendo el estandar de model cards de Hugging Face.
- Auditoria de cumplimiento ambiental: organizaciones que necesiten verificar el impacto energetico de sus cargas de trabajo de ML pueden referenciar este tipo de registros.
- Comparativa de eficiencia entre configuraciones de hardware: los datos de energia y emisiones permiten estimar el coste ambiental de usar GPUs especificas (RTX 4090) en una region determinada.
- Educacion sobre Green AI: sirve como ejemplo practico de como medir y comunicar el coste ecologico del entrenamiento de modelos, util en cursos y talleres.
- Integracion en pipelines de MLOps: los metadatos de CodeCarbon pueden incorporarse a sistemas de seguimiento de experimentos para alertar sobre entrenamientos con alta huella de carbono.
- Publicacion de transparencia en repositorios publicos: cualquier desarrollador que suba un modelo a Hugging Face puede anadir esta informacion para que los usuarios conozcan el impacto ambiental asociado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene evaluaciones de rendimiento del modelo, ya que no se trata de un modelo de IA.

## Requisitos de hardware

- No aplica para inferencia: no hay pesos ni arquitectura que ejecutar.
- El hardware utilizado para el entrenamiento documentado fue de 7 GPUs NVIDIA RTX 4090, con un consumo total de 1249.753 kWh y 339.1 horas de computo.
- No se ofrecen opciones de despliegue (vLLM, llama.cpp, Ollama, etc.) porque no existe un modelo servible.
- La latencia y el throughput no son medibles al no haber modelo.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en el repositorio, ya que no se trata de un modelo de IA sino de un registro de emisiones. No se puede comparar con alternativas de la misma categoria.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo funcional; es solo un documento de contabilidad de carbono.
- No se puede utilizar para ninguna tarea de procesamiento de lenguaje natural, vision o generacion de contenido.
- La licencia no esta especificada, por lo que no se garantiza ningun permiso de uso o redistribucion.
- Los datos de emisiones dependen de la region y el hardware declarados; extrapolarlos a otros entornos puede inducir a error.
- No se ha incluido informacion sobre el modelo subyacente, por lo que la reproducibilidad del entrenamiento es imposible.
- La ausencia de benchmarks y de especificaciones tecnicas impide cualquier evaluacion de calidad o rendimiento.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/shyam1504/tds-carbon-card)
- [Applied Model Card - CHAI](https://www.chai.org/workgroup/applied-model)
- [Model card - AI Wiki](https://aiwiki.ai/wiki/model_card)
- [Model cards - Google DeepMind](https://deepmind.google/models/model-cards/)
- [AI Model Sustainability Directory - carbontxt.org](https://carbontxt.org/ai-model-cards)
