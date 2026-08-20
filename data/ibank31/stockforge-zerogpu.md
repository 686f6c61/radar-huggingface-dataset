# ibank31/stockforge-zerogpu

## Resumen

`ibank31/stockforge-zerogpu` no es un modelo de pesos propiamente dicho, sino un Space de Gradio publicado en Hugging Face que implementa una capa de ejecución GPU experimental para el sistema StockForge V5. El repositorio contiene la configuración de un entorno ZeroGPU que se encarga exclusivamente de la generación de imágenes, mientras que la preparación de prompts y la orquestación de trabajos se delega en un cliente Android/Termux separado. La primera revisión del runtime utiliza la configuración oficial del pipeline `Tongyi-MAI/Z-Image-Turbo`, sustituyendo el transformer de difusión y el VAE por los archivos FP8/AE del repositorio `ibank31/stockforge-models`.

La relevancia de este espacio reside en su enfoque de despliegue en hardware ZeroGPU de Hugging Face, con una estrategia de cuota que prioriza la asignación `large` para minimizar el coste de ejecución. Se trata de un prototipo en fase de validación, cuyo objetivo es medir los segundos reales de GPU necesarios para generar una imagen de 1024x1024 con 8 pasos de inferencia. Aunque el autor menciona un "StockForge Qwen FP8" como artefacto canónico, en esta primera revisión no se inyecta manualmente en Transformers para evitar cargadores de estado inseguros, y el foco está en validar el camino de ejecución en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el Space usa el pipeline de Z-Image-Turbo, no se especifica la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (para el transformer y VAE de StockForge, segun el README) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (se mencionan archivos FP8/AE en `ibank31/stockforge-models`, pero no se detalla el formato de serializacion) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo de difusion ni el proceso de entrenamiento. El README indica que el Space usa la configuracion del pipeline `Tongyi-MAI/Z-Image-Turbo`, que es un modelo de difusion de imagenes, y que se reemplazan el transformer de difusion y el VAE por archivos FP8/AE de `ibank31/stockforge-models`. No se proporcionan detalles sobre el dataset, el numero de tokens o pasos de entrenamiento, ni sobre el uso de tecnicas como RLHF o DPO. El enfoque actual es puramente de ejecucion en GPU, no de entrenamiento.

## Capacidades

- Generacion de imagenes de 1024x1024 con 8 pasos de inferencia, siguiendo el flujo de trabajo Turbo.
- Ejecucion en ZeroGPU de Hugging Face, con un decorador que estima la duracion por peticion para optimizar la cuota.
- Separacion de responsabilidades: la validacion de prompts y la generacion de semillas se realizan fuera de la funcion GPU.
- No incluye soporte de tool calling, agentes, vision, audio ni funciones de lenguaje clasicas; es un espacio de generacion de imagenes unicamente.

## Casos de uso

- Generacion de imagenes bajo demanda desde un cliente ligero (Android/Termux): el Space actua como backend de generacion, recibiendo prompts preparados por el cliente y devolviendo imagenes de 1024x1024. Es adecuado porque la arquitectura separa la orquestacion de la ejecucion GPU, reduciendo la complejidad del cliente.
- Benchmark de rendimiento en ZeroGPU: el objetivo declarado es medir los segundos de GPU reales por imagen, lo que sirve para evaluar la viabilidad de ejecutar modelos de difusion en la infraestructura de Hugging Face con cuota limitada.
- Prototipo de pipeline de generacion con archivos FP8: permite validar si los pesos FP8 de StockForge funcionan correctamente con el pipeline de Z-Image-Turbo antes de integrar el archivo Qwen FP8 completo.
- Pruebas de optimizacion de cuota: al limitar el uso a ZeroGPU `large` y evitar `torch.compile`, se puede medir el coste real de cada generacion y decidir si merece la pena añadir compilacion AOT o batching en el futuro.
- Despliegue experimental para evaluar la viabilidad de un servicio de generacion de imagenes con coste cero para el desarrollador, siempre que la cuota ZeroGPU lo permita.
- Integracion en un flujo de trabajo de investigacion para comparar la calidad de las imagenes generadas con el pipeline Turbo frente a otros modelos de difusion de tamano similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README menciona que el objetivo es medir los segundos de GPU por imagen de 1024x1024 con 8 pasos, pero no se han registrado datos reales en la documentacion. El autor indica que la primera ejecucion exitosa sera la linea base para futuras optimizaciones.

## Requisitos de hardware

- El Space esta disenado para ejecutarse en ZeroGPU de Hugging Face, que proporciona acceso a GPUs compartidas (tipicamente NVIDIA T4, L4 o A10, aunque no se especifica el modelo exacto).
- La estrategia de cuota usa exclusivamente asignaciones `large`, evitando `xlarge` porque cuesta el doble de cuota.
- No se requiere hardware local: el cliente Android/Termux solo envia prompts y recibe resultados; la GPU se ejecuta en el cloud de Hugging Face.
- No se soporta `torch.compile` en ZeroGPU, por lo que la inferencia se ejecuta en modo eager.
- Opciones de despliegue: el Space de Gradio en si mismo es la opcion de despliegue; no se mencionan vLLM, llama.cpp, Ollama ni TGI (que son herramientas para LLMs, no para difusion).

## Comparativa con modelos similares

No disponible. No hay informacion sobre modelos alternativos de generacion de imagenes en el mismo contexto (Space ZeroGPU con archivos FP8 personalizados). No se pueden comparar parametros, contexto, rendimiento, licencia ni disponibilidad con otras alternativas.

## Limitaciones y advertencias

- El proyecto es experimental y el README indica explicitamente que no se debe fusionar la rama en `main` hasta que se haya generado una imagen real y se haya registrado el tiempo de GPU. No es apto para produccion.
- La licencia del modelo no esta especificada, por lo que no se conoce si permite uso comercial o restricciones de redistribucion.
- No se dispone de informacion sobre sesgos, alucinaciones (en generacion de imagenes) o limitaciones de contexto, ya que no se trata de un modelo de lenguaje.
- La generacion de imagenes puede sufrir de alucinaciones visuales tipicas de los modelos de difusion, pero no hay datos especificos.
- El uso de ZeroGPU implica que el rendimiento puede variar segun la carga del servicio compartido de Hugging Face; no hay garantia de latencia estable.
- La dependencia de `Tongyi-MAI/Z-Image-Turbo` para la configuracion del pipeline puede introducir vulnerabilidades o incompatibilidades si el pipeline original cambia.

## Enlaces

- Hugging Face Space: https://huggingface.co/ibank31/stockforge-zerogpu
- Repositorio de modelos StockForge (mencionado en el README): https://huggingface.co/ibank31/stockforge-models
- Pipeline de referencia Z-Image-Turbo: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
