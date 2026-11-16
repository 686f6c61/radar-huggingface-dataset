# Bob99Bob/clef-flash-mlx-affine4

## Resumen

Clef-Flash MLX affine 4-bit es una conversión del modelo Cloudflare/clef-flash, publicada por el usuario Bob99Bob, pensada para su ejecución en Apple Silicon mediante la librería MLX. No se trata de un modelo entrenado o ajustado, sino de una cuantización de los pesos originales del editor (Cloudflare) a 4 bits con cuantización afín y tamaño de grupo 64, realizada con la herramienta `quantize_model` de mlx-lm sobre MLX 0.32.2. El modelo base pertenece a la familia qwen3_5 y cuenta con 9.075.566.081 parámetros totales, lo que lo sitúa en la categoría de modelos de aproximadamente 9.000 millones de parámetros.

La relevancia de esta conversión radica en que permite desplegar un modelo de ese tamaño en hardware de Apple Silicon con un consumo de memoria reducido (el repositorio ocupa 5,3 GB), manteniendo prácticamente intacta la precisión del modelo en 16 bits: según las mediciones del autor, la exactitud es de 0,870 frente a 0,871 del original sobre 900 preguntas. Está etiquetado como `text-classification` y, en el ecosistema veJ, se utiliza como "juez", es decir, el modelo que resuelve los casos que los niveles más rápidos no alcanzan a decidir.

La licencia es Apache-2.0, heredada del modelo original, y el repositorio incluye únicamente los archivos generados por la conversión, no los del editor. Para su uso es necesario descargar por separado el tokenizador, la plantilla de chat y la configuración de la cabeza desde el repositorio original de Cloudflare en la revisión indicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia qwen3_5), según tags del repositorio |
| Parametros totales | 9.075.566.081 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín, group size 64 (embeddings de tokens y 250 módulos Linear); cabeza conjunta en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con `mlx-conversion.json` que registra tamaños y sha256 |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia qwen3_5, según la etiqueta `qwen3_5` del repositorio, con 9.075.566.081 parámetros totales. La model card no proporciona detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información correspondería a la model card del editor original (Cloudflare/clef-flash), que no se incluye en la información disponible.

La innovación técnica de esta publicación es exclusivamente la conversión: se cuantizan a 4 bits afines con tamaño de grupo 64 el embedding de tokens y los 250 módulos Linear de las capas del transformer, mientras que el resto de tensores se mantienen sin cambios respecto al editor y la cabeza conjunta se almacena en 16 bits. La conversión se realizó con `quantize_model` de mlx-lm sobre MLX 0.32.2 y se registra en `mlx-conversion.json` con tamaños y hashes sha256 que el servidor verifica al cargar. No hubo entrenamiento ni ajuste alguno.

## Capacidades

- Generación de texto y clasificación de texto: el repositorio está etiquetado como `text-classification` y el modelo se emplea como "juez" en el ecosistema veJ para resolver casos que los niveles más rápidos no deciden.
- Razonamiento y respuesta a preguntas: las mediciones del autor se realizan sobre 900 preguntas, lo que sugiere uso en tareas de pregunta-respuesta y evaluación.
- Ejecución en Apple Silicon mediante MLX: la conversión está específicamente orientada a este hardware y a la librería MLX.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Clasificación de texto en local sobre Mac: el modelo puede desplegarse con el servidor de veJ (`clef_server.py`) en un equipo Apple Silicon y utilizarse para tareas de clasificación, aprovechando que el repositorio ocupa solo 5,3 GB gracias a la cuantización a 4 bits.
- Modelo juez en pipelines de evaluación: en el ecosistema veJ, Clef-Flash actúa como el nivel superior que resuelve los casos que los modelos más rápidos dejan sin decidir, por lo que encaja en arquitecturas de enrutamiento por niveles de coste.
- Pregunta-respuesta con verificación de precisión: dado que el autor mide la exactitud sobre 900 preguntas (0,870 frente a 0,871 en 16 bits), el modelo es adecuado para tareas de QA donde se requiere mantener la fidelidad del modelo original con menor huella de memoria.
- Prototipado e investigación en Mac: investigadores que trabajan en Apple Silicon pueden ejecutar un modelo de 9.000 millones de parámetros en local sin necesidad de GPUs dedicadas, usando MLX como runtime.
- Despliegue de servicios ligeros en macOS: el servidor de veJ permite exponer el modelo en un puerto local (`--port 29748`), lo que facilita integrarlo en herramientas de desarrollo o scripts de evaluación internos.
- Evaluación comparativa de cuantizaciones: el repositorio documenta el método y los resultados completos en `docs/BENCHMARKS.md` de veJ, por lo que sirve como referencia para estudiar el impacto de la cuantización afín a 4 bits en modelos de ~9B.

## Benchmarks y rendimiento

| Metrica | 4 bits (esta conversion) | 16 bits (modelo original) |
|---|---|---|
| Exactitud sobre 900 preguntas | 0,870 | 0,871 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este modelo.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 5,3 GB, por lo que se necesita al menos esa cantidad de memoria libre para cargar los pesos cuantizados, más el espacio adicional para el tokenizador, la plantilla de chat y los estados de inferencia.
- Hardware objetivo: Apple Silicon (etiqueta `apple-silicon`), con MLX 0.32.2 o compatible como runtime.
- GPU recomendadas: no disponible; el modelo está orientado a chips de Apple, no a GPUs NVIDIA.
- ¿Cabe en GPU consumer? No aplica en el sentido habitual: está diseñado para memoria unificada de Mac, no para GPUs discretas.
- Opciones de despliegue: servidor propio de veJ (`python server/clef/clef_server.py --checkpoint DIR --name clef-flash-mlx-affine4 --port 29748`), con descarga previa de los archivos del editor mediante `hf download`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clef-Flash MLX affine 4-bit (esta ficha) | 9.075.566.081 | no disponible | 4 bits afín, group 64 | Apache-2.0 | Hugging Face (MLX, Apple Silicon) |
| Cloudflare/clef-flash (original) | no disponible en la información | no disponible | 16 bits | Apache-2.0 | Hugging Face |
| Otros modelos de ~9B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos alternativos de la misma categoría en la documentación proporcionada, por lo que la comparativa con terceros queda como no disponible.

## Limitaciones y advertencias

- La cuantización a 4 bits introduce una pérdida mínima de precisión medida (0,870 frente a 0,871), pero no se han publicado evaluaciones sobre otras tareas distintas a las 900 preguntas del benchmark del autor.
- El repositorio no contiene los archivos del editor (tokenizador, plantilla de chat, `joint_head_config.json`); es obligatorio descargarlos de Cloudflare/clef-flash en la revisión `17f0b0ad64efb65d273590632833508766b2aae6` para que el modelo funcione.
- El servidor de veJ verifica los tamaños y hashes sha256 de los archivos al cargar, por lo que cualquier modificación o descarga incompleta impedirá el arranque.
- El modelo está orientado exclusivamente a Apple Silicon y a la librería MLX; no es directamente utilizable en GPUs NVIDIA ni en runtimes como vLLM o llama.cpp sin una conversión adicional.
- No se dispone de información sobre sesgos, riesgo de alucinación, limitaciones idiomáticas ni restricciones adicionales de la licencia Apache-2.0 más allá de las habituales de atribución y aviso.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026, por lo que carece de validación comunitaria amplia.
- La model card del editor original no se incluye en la información disponible, de modo que las capacidades y limitaciones intrínsecas del modelo base no pueden detallarse aquí.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Bob99Bob/clef-flash-mlx-affine4
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Repositorio veJ: https://github.com/ordinarybob/vej
- Metodología y resultados completos de benchmarks: https://github.com/ordinarybob/vej/blob/main/docs/BENCHMARKS.md
