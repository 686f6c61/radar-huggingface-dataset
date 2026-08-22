# prthm1/tds-ga8-carbon

## Resumen

El repositorio `prthm1/tds-ga8-carbon` no contiene un modelo de IA desplegable, sino una plantilla de contabilidad de carbono para un entrenamiento de modelo realizado en el marco del proyecto "TDS GA8" (Green AI Carbon Accounting). Documenta las emisiones de CO₂ equivalente generadas durante una sesión de pre-entrenamiento ejecutada en cinco GPUs NVIDIA T4 en la región europe-west4 de Google Cloud.

El objetivo de esta iniciativa es visibilizar y cuantificar el impacto ambiental del entrenamiento de modelos de aprendizaje automático, siguiendo la tendencia de sostenibilidad en IA. Los datos reportados indican 295,8 horas de GPU, un consumo energético total de 163,58 kWh y 32,715 kg de CO₂ equivalente emitidos, medidos mediante la herramienta CodeCarbon.

No se trata de un modelo con arquitectura, pesos ni capacidades de inferencia. Es un registro de metadatos ambientales, probablemente asociado a una práctica académica o a una iniciativa de transparencia energética en el desarrollo de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplicable (no es un modelo de IA) |
| Parametros totales | no aplicable |
| Parametros activos | no aplicable (no es un MoE) |
| Longitud de contexto | no aplicable |
| Tipos de cuantizacion | no aplicable |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no aplicable (no contiene pesos) |

## Arquitectura y entrenamiento

No se puede describir una arquitectura de red neuronal, ya que el repositorio no contiene un modelo. La informacion disponible indica que el entrenamiento se realizo en modo pre-training sobre hardware NVIDIA T4 (5 GPUs) en la region europe-west4, con un factor de eficiencia energetica del centro de datos (PUE) de 1,58. La herramienta utilizada para medir las emisiones fue Codecarbon, que estima el CO₂ equivalente en funcion del consumo electrico y la ubicacion geografica.

No se proporcionan datos sobre el dataset, el numero de tokens procesados, ni tecnicas de optimizacion como RLHF o DPO. La unica informacion tecnica es la relacionada con el consumo de recursos.

## Capacidades

- No aplicable: el repositorio no implementa ninguna capacidad de generacion de texto, razonamiento, codigo, vision, tool calling, agentes ni funciones multimodales.
- Su unica funcion es documentar metricas de sostenibilidad: emisiones de CO₂, consumo de energia y horas de GPU.
- Puede servir como referencia para auditorias de impacto ambiental en proyectos de entrenamiento de modelos.

## Casos de uso

- Auditoria de sostenibilidad en pipelines de ML: permite registrar y reportar el impacto ambiental de un entrenamiento, util para empresas que necesitan cumplir normativas de emisiones.
- Educacion en Green AI: sirve como ejemplo didactico de como medir la huella de carbono de un experimento de aprendizaje automatico.
- Comparativa de eficiencia entre infraestructuras: al documentar hardware, region y PUE, permite comparar el coste ambiental de distintas configuraciones de entrenamiento.
- Publicacion de transparencia en model cards: puede adjuntarse a un modelo real para informar a los usuarios de su impacto ambiental.
- Optimizacion de recursos: los datos de consumo pueden guiar decisiones sobre reducir horas de GPU o cambiar a hardware mas eficiente.
- Investigacion en sostenibilidad: los registros agregados de multiples repositorios similares podrian servir para estudios sobre la huella de carbono de la IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene un modelo evaluable, por lo que no existen metricas de rendimiento como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El entrenamiento se ejecuto en 5 GPUs NVIDIA T4, con un total de 295,8 horas de GPU.
- El consumo total de energia fue de 163,58 kWh, lo que se traduce en aproximadamente 0,55 kWh por hora de GPU por GPU.
- No se requiere hardware para "inferencia" porque no hay modelo que ejecutar.
- Para replicar el entrenamiento asociado se necesitaria un cluster con al menos 5 GPUs T4 y acceso a la region europe-west4 de Google Cloud.
- La herramienta Codecarbon se integra en el pipeline de entrenamiento para registrar las metricas en tiempo real.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA comparable con alternativas como Llama, Mistral o Qwen. Pertenece a una categoria diferente: la de registros de contabilidad de carbono. Existen repositorios analogos como `bobtehbuilder/tds-ga8-carbon-414018fd4fff` o `pranhai/tds-carbon-card`, que siguen el mismo formato de plantilla, pero no son modelos comparables en terminos de rendimiento.

## Limitaciones y advertencias

- No es un modelo utilizable: no contiene pesos, tokenizador ni logica de inferencia. Cualquier intento de cargarlo como modelo de IA fallara.
- Los datos de emisiones se basan en estimaciones de Codecarbon y pueden variar segun la metodologia de calculo del mix electrico de la region.
- La licencia no esta especificada, por lo que no se puede determinar si el contenido es reutilizable o tiene restricciones comerciales.
- La informacion sobre el dataset y el modelo entrenado es inexistente, lo que impide cualquier evaluacion tecnica.
- El repositorio tiene cero descargas y cero likes, lo que sugiere que es un ejercicio academico o interno sin proposito de uso publico.
- Las fechas de creacion y actualizacion (2026-08-22) son futuras respecto a la fecha de redaccion de esta ficha, lo que puede indicar un error en los metadatos o un cronograma simulado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/prthm1/tds-ga8-carbon
- Repositorio similar (plantilla): https://huggingface.co/bobtehbuilder/tds-ga8-carbon-414018fd4fff
- Repositorio similar (plantilla): https://huggingface.co/pranhai/tds-carbon-card
- Herramienta Codecarbon (mencionada como fuente de datos): https://github.com/mlco2/codecarbon
- Repo de modelos genomicos con nombre "carbon" (sin relacion directa): https://github.com/huggingface/carbon
