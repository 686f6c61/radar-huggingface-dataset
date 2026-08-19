# OneScience-Group/FengWu

## Resumen

FengWu es un modelo fundacional de predicción meteorológica global de rango medio (short-to-medium-range) desarrollado conjuntamente por el Laboratorio de Inteligencia Artificial de Shanghái y varias universidades, y adoptado por organizaciones como el Observatorio de Hong Kong para predicción operativa. A diferencia de los modelos numéricos tradicionales basados en ecuaciones físicas, FengWu emplea un enfoque de aprendizaje profundo multimodal y multitarea, entrenado íntegramente con datos de reanálisis ERA5. Su relevancia radica en que demuestra que los modelos basados en datos pueden superar en habilidad a los sistemas operativos de predicción meteorológica a medio plazo, con un coste computacional mucho menor. La arquitectura concreta no se detalla en la información disponible, y el número de parámetros no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aprendizaje profundo multimodal y multitarea (no se especifica el tipo de red) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de prediccion meteorologica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh (idiomas de la documentacion, no del modelo) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (el script de entrenamiento guarda checkpoints en formato .pth, pero no se especifica el formato oficial de distribucion) |

## Arquitectura y entrenamiento

FengWu se basa en un enfoque de aprendizaje profundo multimodal y multitarea, sin depender de ecuaciones fisicas tradicionales. Esta entrenado exclusivamente con datos de reanalisis ERA5. El repositorio proporciona pesos entrenados con 39 anos de datos ERA5, aunque los archivos de pesos aun no estan disponibles en el momento de la publicacion (se indica que se subiran proximamente). El framework utilizado es PyTorch. No se proporcionan detalles sobre el numero de tokens (no aplica al ser un modelo de prediccion meteorologica), la composicion exacta del dataset ni tecnicas como RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Prediccion meteorologica global a medio plazo (short-to-medium-range), con habilidad mas alla de los 10 dias de anticipacion, segun el paper original.
- Manejo de multiples variables meteorologicas y multiples tareas (enfoque multimodal y multitarea).
- Entrenado con datos de reanalisis ERA5, lo que permite pronosticos basados en datos.
- No es un modelo de lenguaje; no genera texto ni tiene capacidades de tool calling, agentes, razonamiento multi-paso, etc.

## Casos de uso

- Prediccion operativa del tiempo: el Observatorio de Hong Kong lo utiliza para pronosticos operativos, lo que demuestra su utilidad en servicios meteorologicos nacionales.
- Investigacion en ciencias atmosfericas: permite estudiar la viabilidad de modelos basados en datos frente a modelos fisicos tradicionales.
- Generacion de pronosticos a medio plazo (hasta 10+ dias) para sectores como agricultura, energia o logistica, donde la anticipacion meteorologica es critica.
- Validacion y comparacion con otros modelos de prediccion (por ejemplo, Pangu-Weather o GraphCast) en entornos de investigacion.
- Entrenamiento y fine-tuning con datos locales: el repositorio incluye scripts para entrenar con datos propios en formato ERA5, tanto en una GPU como en multiples GPUs mediante `torchrun`.
- Evaluacion de impacto de eventos meteorologicos extremos, gracias a la capacidad de pronostico a medio plazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper original (arxiv:2304.02948) podria contener metricas, pero no estan incluidas en la model card.

## Requisitos de hardware

- Se recomienda una GPU o DCU (procesador de aceleracion de Huawei) para entrenamiento e inferencia.
- La CPU es suficiente para pruebas de conectividad a pequena escala, pero el entrenamiento e inferencia completos seran lentos.
- No se especifican modelos concretos de GPU ni VRAM minima.
- Para usuarios de DCU, se requiere DTK 25.04.2 o superior.
- El despliegue se realiza mediante scripts de Python (`train.py`, `inference.py`, `result.py`) y se puede usar `torchrun` para entrenamiento multi-GPU.

## Comparativa con modelos similares

No se dispone de informacion comparativa en la fuente proporcionada. Existen otros modelos de prediccion meteorologica basados en aprendizaje profundo, como Pangu-Weather (Huawei) o GraphCast (DeepMind), pero no se han incluido datos de comparacion en la model card. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Los pesos del modelo aun no estan disponibles en el repositorio (se indica que se subiran pronto), por lo que la reproducibilidad inmediata es limitada.
- El modelo depende de datos ERA5; su rendimiento puede degradarse si se aplica a otras fuentes de datos sin adaptacion.
- No se especifican sesgos conocidos, pero al ser un modelo entrenado con datos de reanalisis, puede heredar sesgos de esos datos.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar los terminos de los datos ERA5 (aunque ERA5 es de acceso abierto, hay que verificar la licencia especifica).
- No se proporcionan metricas de rendimiento publicadas, por lo que es dificil evaluar su precision sin consultar el paper original.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/FengWu
- Paper: https://arxiv.org/abs/2304.02948
- Repositorio OneScience en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- Repositorio de skills en GitHub: https://github.com/onescience-ai/oneskills
- Repositorio de skills en Gitee: https://gitee.com/onescience-ai/oneskills
