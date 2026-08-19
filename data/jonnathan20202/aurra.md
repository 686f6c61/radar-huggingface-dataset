# Jonnathan20202/AURRA

## Resumen

AURRA es un repositorio publicado por el usuario Jonnathan20202 en HuggingFace el 19 de agosto de 2026, etiquetado como un finetune del modelo openai/gpt-oss-120b de OpenAI. Se distribuye bajo licencia AFL-3.0 y, en el momento de la consulta, no registra descargas ni interacciones de la comunidad.

La model card del repositorio no contiene documentacion tecnica del modelo (arquitectura, entrenamiento, evaluaciones), sino un codigo de aplicacion Gradio que implementa un chatbot conectado a la API de Groq. El codigo utiliza modelos de terceros como llama-3.3-70b-versatile, llama-3.1-8b-instant, deepseek-r1-distill-llama-70b y qwen/qwen3.6-27b, lo que sugiere que el repositorio podria ser una demo de aplicacion mas que un modelo con pesos publicados.

Es importante aclarar que las busquedas web sobre "Aurora" devuelven resultados del modelo homonimo de Microsoft Research para prediccion atmosferica y del sistema Tierra (1.3 mil millones de parametros), que no guarda relacion con este repositorio de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como finetune de openai/gpt-oss-120b) |
| Parametros totales | no disponible (el modelo base gpt-oss-120b tiene 120B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | AFL-3.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura ni el proceso de entrenamiento de AURRA. La unica referencia disponible es la etiqueta base_model que indica que se trata de un finetune de openai/gpt-oss-120b, el modelo denso de 120 mil millones de parametros publicado por OpenAI. El modelo base gpt-oss-120b es un transformer denso con ventana de contexto de 128K tokens, pero no se dispone de datos sobre el dataset de finetuning, el numero de tokens utilizados ni las tecnicas de alineacion aplicadas a AURRA.

La model card no incluye ninguna seccion de entrenamiento, evaluacion o uso del modelo. El contenido principal es un script de aplicacion Gradio que utiliza la API de Groq, lo que impide conocer cualquier detalle del proceso de construccion del modelo.

## Capacidades

- No se han documentado capacidades especificas del modelo AURRA.
- El codigo incluido en la model card implementa un chatbot conversacional multi-turno con seleccion de modelo, prompt de sistema y control de temperatura, pero utiliza modelos de Groq, no AURRA.
- No hay informacion sobre soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingues o vision.
- No se ha publicado ninguna demostracion de las capacidades del propio modelo.

## Casos de uso

No es posible proporcionar casos de uso concretos para AURRA debido a la ausencia de documentacion tecnica y de pesos publicados verificables. El repositorio contiene unicamente el codigo de una interfaz de chatbot que utiliza la API de Groq con otros modelos, por lo que cualquier aplicacion practica estaria vinculada a esos modelos de terceros, no a AURRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se han publicado requisitos de hardware para AURRA. Dado que el modelo base gpt-oss-120b tiene 120 mil millones de parametros, una inferencia local requeriria aproximadamente 240 GB de VRAM en precision FP16 o unos 120 GB en cuantizacion de 8 bits, lo que implicaria multiples GPU de alta gama (por ejemplo, 4x A100 80GB o 8x RTX 4090 24GB). Sin embargo, estos datos corresponden al modelo base y no se ha verificado que AURRA mantenga el mismo tamano.

## Comparativa con modelos similares

No es posible establecer una comparativa fiable al no disponer de datos de rendimiento, parametros ni capacidades de AURRA. El modelo base gpt-oss-120b podria compararse con otros modelos abiertos de tamano similar como Llama 3.1 405B o DeepSeek-V3, pero no se ha confirmado que AURRA conserve las mismas caracteristicas.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se describen arquitectura, entrenamiento, capacidades ni limitaciones.
- No se han publicado pesos del modelo ni se ha verificado que el repositorio contenga un modelo real.
- La model card contiene un codigo de aplicacion que utiliza la API de Groq con modelos de terceros, lo que puede inducir a confusion sobre que modelo se esta evaluando.
- Licencia AFL-3.0: permite uso comercial con atribucion, pero es recomendable revisar los terminos completos antes de su uso en produccion.
- El modelo no ha sido evaluado por la comunidad (0 descargas, 0 likes), por lo que su calidad y fiabilidad son desconocidas.
- Confusion potencial con el modelo Aurora de Microsoft Research para prediccion atmosferica, que es un proyecto completamente distinto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jonnathan20202/AURRA
- Modelo base openai/gpt-oss-120b: https://huggingface.co/openai/gpt-oss-120b

Nota: los resultados de busqueda sobre "Aurora" corresponden al modelo de Microsoft Research para el sistema Tierra (https://microsoft.github.io/aurora/), no a este repositorio.
