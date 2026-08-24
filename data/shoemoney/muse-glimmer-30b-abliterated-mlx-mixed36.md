# shoemoney/Muse-Glimmer-30B-Abliterated-MLX-mixed36

## Resumen

Muse-Glimmer-30B-Abliterated-MLX-mixed36 es una cuantización en formato MLX (Apple Silicon) del modelo base Blackfrost-AI/Muse-Glimmer-30B-Abliterated-BF16, que a su vez es una versión "abliterada" del modelo multimodal Muse Glimmer de Meta. El autor de esta conversión es shoemoney, y su objetivo es ofrecer una versión ligera y ejecutable en hardware de Apple con memoria unificada, manteniendo las capacidades del modelo original: procesamiento de texto e imágenes, razonamiento paso a paso y tool-calling nativo.

La cuantización utiliza una mezcla de 3 y 6 bits (mixed 3/6) con grupo de tamaño 64, aplicada mediante la herramienta `mlx_vlm.convert` sin ningún tipo de fine-tuning o re-alineación. El resultado es un modelo de aproximadamente 18,3 GB en disco, con una perplejidad de 8,336 medida sobre una muestra de `allenai/tulu-3-sft-mixture`. Está pensado para cargarse con la librería `mlx-vlm`, no con `mlx-lm`, y se ha validado en un Apple M3 Ultra con 96 GB de memoria unificada.

La relevancia de este modelo radica en que permite ejecutar localmente un modelo multimodal de 30 mil millones de parámetros (aunque el safetensors reporta 5,9 mil millones, posiblemente por la cuantización) en equipos Apple, con un rendimiento de 29,1 tokens por segundo en petición única y 82,5 tokens por segundo con 8 peticiones concurrentes. Además, al estar abliterado, elimina los rechazos de contenido del modelo original, lo que lo hace atractivo para casos de uso que requieren respuestas sin restricciones de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagenes), destilado de Muse Spark |
| Parametros totales | 5.924.625.408 (segun safetensors; el modelo base se anuncia como 30B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta 3/6 bits, grupo de 64 (MLX) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base, Muse Glimmer de Meta, es un transformer multimodal de 30 mil millones de parametros, destilado de Muse Spark, disenado para flujos de trabajo agénticos locales. Acepta entradas de texto e imagenes, produce un razonamiento paso a paso antes de responder y dispone de tool-calling nativo. La version abliterada (Blackfrost-AI) elimina los mecanismos de rechazo de contenido del modelo original, lo que permite respuestas sin censura.

Este repositorio concreto no ha sido entrenado ni ajustado; es una conversion puramente de cuantizacion. Los pesos BF16 originales se convirtieron a una representacion mixta de 3 y 6 bits con `mlx_vlm.convert`, usando un grupo de cuantizacion de 64. No se ha realizado ningun tipo de fine-tuning, merging ni re-alineacion. La perplejidad medida (8,336) es comparable dentro de la familia de cuantizaciones del mismo modelo base, pero no debe compararse con otros modelos debido a diferencias en el tokenizador.

## Capacidades

- Generacion de texto y razonamiento paso a paso: el modelo produce una cadena de pensamiento antes de dar la respuesta final.
- Procesamiento multimodal: acepta imagenes como entrada junto con texto, lo que permite tareas de vision por computador.
- Tool-calling nativo: puede invocar funciones externas, lo que lo hace util para agentes y automatizaciones.
- Razonamiento agéntico: disenado para flujos de trabajo locales donde el modelo decide que herramientas usar.
- Sin censura (abliterado): se han eliminado los rechazos de contenido, por lo que responde a peticiones que el modelo original bloquearia.
- Ejecucion en Apple Silicon: optimizado para MLX, aprovecha la memoria unificada de los chips M-series.

## Casos de uso

- Asistente local en macOS: se puede integrar en aplicaciones de escritorio para responder preguntas, resumir documentos o generar texto, ejecutandose completamente en local con MLX.
- Automatizacion de tareas con tool-calling: el modelo puede llamar a APIs o funciones del sistema para realizar acciones como enviar correos, gestionar calendarios o consultar bases de datos, todo desde un entorno local.
- Analisis de imagenes en entornos sin conexion: al aceptar imagenes, puede describir fotografias, extraer texto de capturas o clasificar imagenes en un Mac sin necesidad de servicios en la nube.
- Desarrollo de agentes de razonamiento: su capacidad de razonamiento paso a paso y tool-calling lo hace adecuado para construir agentes que planifican y ejecutan tareas complejas, como busquedas web o interacciones con APIs.
- Generacion de codigo asistida: aunque no se menciona explicitamente, al ser un modelo de lenguaje general puede ayudar a escribir y depurar codigo, especialmente en entornos de desarrollo locales.
- Prototipado rapido de aplicaciones multimodales: investigadores y desarrolladores pueden probar ideas de vision y lenguaje sin depender de hardware especializado, gracias a la cuantizacion ligera y la compatibilidad con MLX.

## Benchmarks y rendimiento

La model card proporciona datos de perplejidad y throughput medidos en un Apple M3 Ultra (96 GB, macOS 27). No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

| Metrica | Valor |
|---|---|
| Tamano en disco | 18,27 GB |
| Perplejidad (tulu-3-sft-mixture, 192 muestras de 512 tokens) | 8,336 |
| Perplejidad relativa al mejor escalon de la familia | 1,15x |
| Throughput (1 peticion) | 29,1 tok/s |
| Throughput (8 peticiones concurrentes) | 82,5 tok/s |

Nota: la perplejidad solo es comparable dentro de la misma familia de cuantizaciones del mismo modelo base, no con otros modelos.

## Requisitos de hardware

- Memoria unificada: al ser un modelo MLX, utiliza la memoria unificada del chip Apple. El tamano en disco es de 18,27 GB, por lo que se recomienda al menos 24 GB de RAM unificada para cargar el modelo con margen.
- GPU recomendada: cualquier chip Apple Silicon con al menos 24 GB de memoria unificada. Se ha validado en un M3 Ultra con 96 GB, pero modelos como M1 Max, M2 Ultra o M3 Max con suficiente RAM deberian funcionar.
- Compatibilidad con consumer GPU: no aplica, ya que MLX esta disenado exclusivamente para Apple Silicon.
- Opciones de despliegue: se utiliza con la libreria `mlx-vlm` (no `mlx-lm`). El comando de generacion es `mlx_vlm.generate --model shoemoney/Muse-Glimmer-30B-Abliterated-MLX-mixed36 --prompt "Hello" --max-tokens 256`.
- Latencia y throughput: medidos en M3 Ultra, 29,1 tok/s en peticion unica y 82,5 tok/s con 8 peticiones concurrentes. En hardware inferior, el rendimiento sera menor.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la informacion proporcionada. La unica referencia directa es el modelo base original (Muse-Glimmer-30B) y su version abliterada en BF16, que son mucho mas pesados (probablemente >60 GB en BF16) y no estan optimizados para Apple Silicon. Esta cuantizacion ofrece una alternativa ligera para ese hardware, pero no hay benchmarks estandar que permitan comparar con otros modelos multimodales de tamano similar.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: la mezcla 3/6 bits puede degradar ligeramente la precision en tareas complejas en comparacion con el modelo BF16 original.
- Sesgos y alucinaciones: al ser un modelo abliterado, se han eliminado los rechazos de seguridad, lo que puede llevar a generar contenido inapropiado, ofensivo o factualmente incorrecto. No se han documentado sesgos especificos, pero el modelo puede reflejar los sesgos de los datos de entrenamiento de Muse Glimmer.
- Limitaciones de contexto: no se ha especificado la longitud de contexto soportada, por lo que se desconoce si puede manejar ventanas largas.
- Idiomas: no se ha indicado que idiomas soporta; probablemente herede los del modelo base, pero no esta confirmado.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el modelo base es de Meta y puede estar sujeto a los terminos de uso de Meta AI. Se debe verificar la politica de uso de Meta antes de un despliegue comercial.
- Dependencia de MLX: el modelo solo funciona en Apple Silicon; no es portable a GPUs NVIDIA o AMD sin una conversion adicional.
- Sin soporte de la comunidad: el repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido probado ampliamente por terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/shoemoney/Muse-Glimmer-30B-Abliterated-MLX-mixed36
- Modelo base (Blackfrost-AI): https://huggingface.co/Blackfrost-AI/Muse-Glimmer-30B-Abliterated-BF16
- Modelo original de Meta: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Pagina de desarrollador de Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Documentacion de API de Muse Glimmer: https://dev.meta.ai/docs/muse-glimmer
- Model card en NVIDIA NIM: https://build.nvidia.com/meta/muse-glimmer-30b/modelcard
