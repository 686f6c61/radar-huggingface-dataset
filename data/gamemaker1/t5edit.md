# gamemaker1/t5edit

## Resumen

t5edit es un modelo sequence-to-sequence de 780 millones de parámetros desarrollado por el usuario gamemaker1, disponible en HuggingFace bajo licencia Apache 2.0. Se trata de una versión fine-tuned de google/flan-t5-large especializada en una tarea concreta: reescribir artículos desactualizados a partir de evidencia externa, actualizando, sustituyendo o eliminando frases según la nueva información disponible.

El modelo sigue el diseño de EDIT5, descrito en el paper FRUIT de Iv et al. (2022), en el que el modelo no reescribe el artículo completo, sino que marca las frases sin cambios con un índice corto y solo genera texto nuevo para las frases modificadas. Esto reduce notablemente el coste de generación y facilita la tarea de actualización factual.

Su relevancia principal es como referencia experimental: fue entrenado como cota superior (upper bound) del sistema DiffusEdit, que mantiene congelado un modelo de difusión de lenguaje y entrena solo clasificadores ligeros sobre sus estados ocultos. Los clasificadores y el dataset están publicados, lo que convierte a t5edit en una herramienta útil para investigadores que trabajan en edición y actualización de documentos con modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (transformer encoder-decoder, text2text) |
| Parametros totales | 783.150.080 |
| Parametros activos | no disponible (no es MoE; todos los parámetros se entrenaron) |
| Longitud de contexto | 1.024 tokens de entrada (truncado desde el final), 384 tokens de salida |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3,1 GB en el repositorio) |

## Arquitectura y entrenamiento

t5edit hereda la arquitectura encoder-decoder de T5: un encoder que procesa el artículo desactualizado (con cada frase indexada como `[0]`, `[1]`, ...) junto con los pasajes de evidencia (formateados como `(0) <titulo>: <texto> ...`), y un decoder que genera la secuencia de edición. El esquema de salida es compacto: `[j]` copia la frase j sin cambios, `#j <texto>` sustituye la frase j por el texto generado, y una frase cuya ausencia de índice indica que se elimina. Esta codificación, tomada de EDIT5 (paper FRUIT, Iv et al., 2022), evita regenerar contenido inalterado.

El entrenamiento se realizó sobre el split de entrenamiento del dataset gamemaker1/wiki-wrong (artículos de Wikipedia deliberadamente desactualizados con evidencia de corrección). Se usó learning rate de 1e-4 con decaimiento lineal y warm-up en el primer 5% de los pasos, tamaño de lote efectivo de 32 ejemplos (ocho micro-batches acumulados de cuatro), gradient clipping a 1.0, autocast en bfloat16 y semilla 42, en una sola GPU A100 de 40 GB. Se evaluó la pérdida de validación tras cada época, se conservó el checkpoint con menor pérdida y se detuvo el entrenamiento tras una época sin mejora. Todos los parámetros del modelo fueron entrenados, no solo una capa superior, lo que permite usarlo como referencia de lo que alcanza un generador completamente entrenado sobre los mismos datos.

Un detalle técnico notable: el vocabulario de T5 no puede escribir ciertos caracteres (como la ø en nombres noruegos), por lo que tras la decodificación se aplica un paso de postprocesado que sustituye palabras del output por la palabra equivalente del input cuando coincide ignorando las letras faltantes.

## Capacidades

- Actualizacion factual de documentos: reescribe articulos desactualizados (estilo Wikipedia) incorporando evidencia nueva.
- Edicion selectiva a nivel de frase: copia, sustituye o elimina frases concretas mediante marcadores compactos, sin regenerar el texto inalterado.
- Generacion de texto condicionada: el decoder genera solo las frases nuevas o reescritas, limitado a 384 tokens de salida.
- Razonamiento sobre correspondencia articulo-evidencia: debe identificar que frases contradicen la evidencia y como reescribirlas.
- Capacidades multilingues: no disponible; el modelo esta entrenado solo en ingles y el vocabulario de T5 tiene limitaciones con caracteres no latinos basicos.
- Tool calling / function calling: no disponible (no es un modelo instructivo general).
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Actualizacion de articulos enciclopedicos: dado un articulo de Wikipedia desactualizado y pasajes de evidencia recientes, el modelo produce la version editada marcando solo las frases que cambian, ideal para pipelines de mantenimiento de corpora documentales.
- Sincronizacion de documentacion tecnica: actualizar manuales o fichas de producto cuando llega informacion nueva (versiones, precios, especificaciones), reescribiendo unicamente las frases afectadas.
- Verificacion y correccion factual asistida: integrado en un flujo de fact-checking, puede proponer ediciones concretas a partir de fuentes verificadas, con trazabilidad frase a frase.
- Investigacion en edicion de documentos: como cota superior entrenada completamente, sirve de baseline para comparar metodos de edicion mas ligeros como DiffusEdit (clasificadores sobre estados congelados).
- Generacion de datasets de edicion: su salida estructurada (indices de copia, sustitucion y borrado) permite construir pares articulo-viejo/articulo-nuevo anotados a nivel de frase para entrenar otros modelos.
- Resumen incremental de noticias: actualizar un resumen existente con noticias nuevas en lugar de regenerarlo desde cero, aprovechando el esquema de copia por marcadores.
- Curacion de bases de conocimiento: depurar entradas desactualizadas en bases de conocimiento textuales de forma semiautomatica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las metricas del entrenamiento (perdida de validacion por epoca y tiempos) estan en el fichero `run_metrics.json` del repositorio, pero no incluye numeros concretos ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 783 millones de parametros en bfloat16 o fp16, unos 2 GB de pesos; en fp32, unos 3,1 GB. Con overhead de activaciones y KV cache, entre 4 y 6 GB de VRAM son suficientes para inferencia comoda.
- GPU recomendadas: cualquier GPU moderna de gama media; no se necesita A100 ni H100 para inferencia (la A100 de 40 GB se uso para el entrenamiento). Una RTX 3060 de 12 GB o superior sobra.
- Consumer GPU: cabe sin problemas en GPUs consumer como RTX 3060, RTX 4060 Ti o superiores, incluso sin cuantizacion.
- CPU: ejecutable en CPU dado su tamano moderado, con latencias mayores.
- Opciones de despliegue: HuggingFace Transformers (`AutoModelForSeq2SeqLM`, codigo de ejemplo en la model card), compatible con text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo). El soporte en llama.cpp u Ollama no esta documentado (los pesos estan en safetensors, no GGUF).
- Latencia y throughput: no disponible; al generar solo frases modificadas (salida maxima de 384 tokens), la latencia de decodificacion deberia ser baja en practica.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gamemaker1/t5edit | 783M | Edicion factual de articulos (estilo EDIT5) | 1.024 in / 384 out | Apache 2.0 | Publico en HuggingFace |
| google/flan-t5-large (base) | 780M | Instruccion general text2text | 512 tokens | Apache 2.0 | Publico en HuggingFace |
| google/flan-t5-xl | 3.000M | Instruccion general text2text | 512 tokens | Apache 2.0 | Publico en HuggingFace |

t5edit no compite en benchmarks generales: es un modelo especializado en una unica tarea de edicion, sobre el mismo dataset que el sistema DiffusEdit (gamemaker1/diffusedit). Frente a su modelo base flan-t5-large, aporta la capacidad de edicion estructurada por frases, que el modelo base no tiene sin fine-tuning. No hay disponibles modelos alternativos publicos con exactamente el mismo esquema EDIT5 en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: entrenado exclusivamente en ingles; no debe esperarse funcionamiento en castellano ni en otros idiomas.
- Vocabulario: el tokenizador de T5 no puede emitir ciertos caracteres (por ejemplo, la ø noruega); el postprocesado de la model card mitiga parcialmente este problema sustituyendo palabras por sus equivalentes del input, pero puede fallar en nombres propios exoticos.
- Contexto limitado: la entrada se trunca a 1.024 tokens desde el final (la evidencia se recorta antes que el articulo), y la salida a 384 tokens; documentos largos requeriran segmentacion previa.
- Dominio estrecho: el modelo esta afinado solo sobre wiki-wrong (articulos estilo Wikipedia); su comportamiento fuera de este dominio no esta evaluado y puede degradarse.
- Riesgo de alucinacion: al generar frases sustituidas, puede introducir contenido no respaldado por la evidencia; no hay datos publicados que cuantifiquen este riesgo.
- Sin benchmarks publicos: no hay metricas de calidad (ROUGE, exactitud de edicion, etc.) publicadas en la model card, solo la perdida de validacion en `run_metrics.json`.
- Uso casi nulo: 0 descargas y 1 like en el momento de la ficha, sin comunidad de soporte ni validacion por terceros.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes; hereda la licencia del modelo base.
- Formato: pesos en safetensors; no hay versiones GGUF ni cuantizadas publicadas.

## Enlaces

- Modelo: https://huggingface.co/gamemaker1/t5edit
- Clasificadores de DiffusEdit: https://huggingface.co/gamemaker1/diffusedit
- Dataset wiki-wrong: https://gamemaker1/wiki-wrong (https://huggingface.co/datasets/gamemaker1/wiki-wrong)
- Modelo base: https://huggingface.co/google/flan-t5-large
- Repositorio con el codigo de entrenamiento: https://github.com/gamemaker1/diffusedit
- Paper de referencia (FRUIT, Iv et al., 2022, base del diseno EDIT5): no disponible enlace directo en la informacion proporcionada
