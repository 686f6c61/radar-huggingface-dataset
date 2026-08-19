# Lykegenes/Qwen3.5-2B-oQ8e-fp16-mtp

## Resumen

Este repositorio contiene una versión cuantizada del modelo Qwen/Qwen3.5-2B, generada con la herramienta oQ (oMLX v0.6.0) utilizando cuantización de precisión mixta. El resultado es un modelo en formato MLX safetensors, con cuantización de 8 bits y tamaño de grupo 64, orientado a su ejecución eficiente en dispositivos Apple Silicon. La cuantización reduce el peso del modelo a aproximadamente 2,1 GB, lo que facilita su despliegue en entornos con memoria limitada.

Al tratarse de una cuantización, el modelo hereda las capacidades del modelo base Qwen3.5-2B, aunque no se proporcionan detalles sobre la arquitectura, el entrenamiento o las especificaciones del modelo original en la información disponible. El autor, Lykegenes, publica este artefacto sin información adicional sobre licencia, idiomas o rendimiento.

La relevancia de este modelo radica en su formato MLX, que permite aprovechar el acelerador neuronal de los chips Apple M-series, y en su tamaño reducido, que lo hace adecuado para aplicaciones de inferencia en local, prototipado rápido y tareas de procesamiento de lenguaje natural en dispositivos de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo de modelo qwen3_5, segun la model card) |
| Parametros totales | 552.802.624 (dato reportado en el repositorio; el nombre del modelo base sugiere 2B, lo que indica una posible discrepancia) |
| Parametros activos | no disponible (no se indica si es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (oQ8e), grupo de 64, precision mixta con capas en fp16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint Qwen/Qwen3.5-2B, realizada con la herramienta oQ (oMLX v0.6.0). La cuantizacion utiliza 8 bits con un tamaño de grupo de 64 y precision mixta, lo que significa que algunas capas se mantienen en fp16 mientras que otras se reducen a 8 bits. El formato resultante es MLX safetensors, diseñado para el framework MLX de Apple.

No se dispone de informacion sobre la arquitectura interna del modelo base (numero de capas, dimensiones, atencion, etc.), ni sobre los datos de entrenamiento, el numero de tokens procesados o si se aplicaron tecnicas como RLHF o DPO. La unica referencia es el tipo de modelo "qwen3_5" indicado en la model card, que sugiere una arquitectura transformer estandar, probablemente similar a la familia Qwen2.x, pero sin confirmacion.

## Capacidades

- Generacion de texto: al ser una version cuantizada de Qwen3.5-2B, se espera que herede las capacidades de generacion de lenguaje natural del modelo base, aunque no se especifican detalles.
- Inferencia eficiente en Apple Silicon: gracias al formato MLX y a la cuantizacion de 8 bits, el modelo esta optimizado para ejecutarse en chips M1, M2, M3 y posteriores, aprovechando la memoria unificada.
- No se mencionan capacidades adicionales como tool calling, razonamiento multi-paso, vision, audio o modo thinking.

## Casos de uso

- Inferencia local en Mac: el modelo, con un tamano de 2,1 GB, puede cargarse en la memoria unificada de un Mac con 8 GB o mas, permitiendo ejecutar tareas de generacion de texto sin conexion a internet.
- Prototipado de aplicaciones NLP: desarrolladores que trabajan con MLX pueden integrar este modelo en aplicaciones de chat, resumen o clasificacion de texto de forma rapida, gracias al formato listo para usar.
- Educacion e investigacion: sirve como ejemplo de cuantizacion con oQ, permitiendo estudiar el impacto de la reduccion de precision en modelos de tamano medio.
- Despliegue en entornos con recursos limitados: al ser un modelo de 2B cuantizado, es adecuado para servidores pequeños o dispositivos edge que no disponen de GPUs dedicadas.
- Fine-tuning posterior: aunque no se indica, el formato safetensors permite cargar el modelo en MLX y potencialmente realizar ajuste fino con datos propios, si se dispone de la infraestructura adecuada.
- Evaluacion de calidad de cuantizacion: investigadores pueden comparar este checkpoint con la version original de Qwen3.5-2B para medir la degradacion de rendimiento en tareas especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como MMLU, HumanEval, GSM8K u otras, ni comparaciones con el modelo base o con otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada: al ser un modelo MLX, no utiliza VRAM dedicada sino memoria unificada del chip Apple. El tamano del repo es de 2,1 GB, por lo que se recomienda al menos 4 GB de memoria libre para la carga del modelo.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4) con memoria unificada de 8 GB o superior es suficiente para inferencia.
- Si cabe en consumer GPU: no aplica, ya que MLX esta disenado exclusivamente para hardware Apple.
- Opciones de despliegue: el formato MLX se puede ejecutar con el framework MLX (https://ml-explore.github.io/mlx/), y tambien es compatible con herramientas como llama.cpp si se convierte el modelo a GGUF, aunque no se proporciona esa conversion.
- Latencia y throughput: no se dispone de datos estimados.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (cuantizaciones de Qwen3.5-2B u otros modelos de 2B en formato MLX). La falta de datos sobre el modelo base impide establecer comparaciones fiables.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos, pero al ser una cuantizacion de un modelo de lenguaje, puede heredar sesgos presentes en el modelo original.
- Riesgo de alucinacion: no se evalua en la informacion disponible; se recomienda validar las salidas en aplicaciones criticas.
- Limitaciones de contexto e idioma: se desconocen, ya que no se especifican.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar si el uso comercial esta permitido.
- Caveat para produccion: la cuantizacion de 8 bits puede degradar ligeramente la calidad de las respuestas en comparacion con el modelo en precision completa. Se recomienda probar el modelo en el caso de uso concreto antes de desplegarlo.

## Enlaces

- HuggingFace: https://huggingface.co/Lykegenes/Qwen3.5-2B-oQ8e-fp16-mtp
- Repositorio de la herramienta oQ (oMLX): https://github.com/jundot/omlx
