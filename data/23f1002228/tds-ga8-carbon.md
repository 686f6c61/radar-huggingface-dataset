# 23f1002228/tds-ga8-carbon

## Resumen

El repositorio `23f1002228/tds-ga8-carbon` no contiene un modelo de inteligencia artificial, sino una ficha de contabilidad de carbono asociada a un proceso de fine-tuning realizado como parte de la asignación TDS GA8. El documento registra las emisiones de CO₂ equivalente generadas durante el entrenamiento, con un total de 84,134 kg de CO₂eq, calculadas mediante la herramienta CodeCarbon.

El autor, identificado como `23f1002228`, documenta un entrenamiento de fine-tuning ejecutado en una NVIDIA RTX 4090 en la región `us-central1`, con un consumo energético total de 240,3837 kWh y un factor de efectividad energética (PUE) de 1,18. No se especifica qué modelo base se ajustó, ni el dataset utilizado, ni la tarea concreta.

Este repositorio forma parte de una práctica académica sobre IA verde y contabilidad de emisiones, similar a otros repositorios homólogos como `anshusaurav/tds-ga8-carbon-model` o `24f2005112/tds-carbon-card`. No se trata de un modelo descargable ni desplegable, sino de un registro de sostenibilidad.

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

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo subyacente, ya que el repositorio no contiene pesos ni configuracion de red. La unica informacion de entrenamiento disponible indica que se realizo un proceso de fine-tuning sobre un hardware NVIDIA RTX 4090, con un total de 452,7 horas de GPU. El consumo energetico total fue de 240,3837 kWh y las emisiones asociadas, calculadas con CodeCarbon, ascendieron a 84,134 kg de CO₂eq. El factor PUE de 1,18 sugiere un centro de datos con eficiencia energetica moderada. No se especifica el modelo base, el dataset, el numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- No aplica: el repositorio no contiene un modelo con capacidades de generacion, razonamiento, codigo, vision o audio.
- La unica funcionalidad es la documentacion de la huella de carbono del proceso de entrenamiento.
- No hay soporte de tool calling, agentes, ni capacidades multilingues.

## Casos de uso

- Auditoria de sostenibilidad en ML: el repositorio sirve como plantilla para registrar emisiones de CO₂ de entrenamientos, siguiendo la metodologia de CodeCarbon con datos de hardware, region y consumo.
- Reportes de cumplimiento: las metricas de emisiones pueden incorporarse en informes de responsabilidad ambiental de proyectos de IA, especialmente en entornos academicos o empresariales con requisitos ESG.
- Comparativa de eficiencia: los datos de 84,134 kg de CO₂eq y 452,7 horas de GPU permiten comparar el coste ambiental de diferentes configuraciones de entrenamiento.
- Educacion en IA responsable: el repositorio es un ejemplo practico para ensenar a estudiantes como documentar el impacto ambiental de sus experimentos.
- Optimizacion de infraestructura: los datos de PUE y consumo pueden usarse para decidir entre regiones de computo o tipos de hardware mas eficientes.
- Trazabilidad de experimentos: junto con el repositorio de codigo del autor, permite reconstruir el contexto completo del entrenamiento y su impacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene evaluaciones de calidad del modelo, metricas de rendimiento, ni comparaciones con otros sistemas. Los unicos datos numericos son los relacionados con consumo energetico y emisiones.

## Requisitos de hardware

- El hardware utilizado fue una NVIDIA RTX 4090, con 452,7 horas de GPU.
- No se especifican requisitos de VRAM para inferencia, ya que no se proporciona un modelo desplegable.
- No hay recomendaciones de GPU para despliegue ni opciones de servidores de inferencia como vLLM, llama.cpp u Ollama.
- No se indican metricas de latencia ni throughput.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA comparable con alternativas como Llama, Mistral o Qwen. Existen repositorios homologos en HuggingFace (`anshusaurav/tds-ga8-carbon-model`, `24f2005112/tds-carbon-card`) con el mismo proposito de contabilidad de carbono, pero no contienen modelos de IA. No hay datos de rendimiento que permitan establecer una comparativa tecnica.

## Limitaciones y advertencias

- No es un modelo de IA: no puede ser utilizado para inferencia, generacion de texto, ni ninguna tarea de ML.
- Datos incompletos: no se especifica el modelo base, el dataset, ni la tarea del fine-tuning, lo que limita la reproducibilidad del experimento.
- Alcance geografico limitado: las emisiones se calcularon para la region `us-central1`; los valores de CO₂eq dependen del mix electrico de esa region y no son generalizables a otras ubicaciones.
- Sin licencia declarada: no se indica bajo que licencia se distribuye el contenido, lo que genera incertidumbre sobre su reutilizacion.
- Sin verificacion externa: los datos de emisiones provienen de CodeCarbon, pero no hay auditoria independiente que valide las cifras.
- Riesgo de malinterpretacion: al estar etiquetado como "modelo" en HuggingFace, un usuario podria intentar descargarlo o desplegarlo sin exito, ya que no contiene pesos ni configuracion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/23f1002228/tds-ga8-carbon
- Perfil de GitHub del autor: https://github.com/23f1002228/
- Repositorio homologo (anshusaurav): https://huggingface.co/anshusaurav/tds-ga8-carbon-model
- Repositorio homologo (24f2005112): https://huggingface.co/24f2005112/tds-carbon-card
