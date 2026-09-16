# lucifer053/gemma-4-26b-a4b-it-uncensored-th-gguf

## Resumen

Este modelo es una derivacion "abliterated" (direccion de rechazo eliminada) del modelo base google/gemma-4-26b-a4b-it, publicada por el usuario lucifer053 en HuggingFace bajo el identificador lucifer053/gemma-4-26b-a4b-it-uncensored-th-gguf. Se trata de una arquitectura MoE (mixture of experts) con 25.233.142.046 parametros totales (aproximadamente 26B) y 4B parametros activos por token, segun los datos declarados en la model card y en los safetensors del modelo base. El autor lo distribuye unicamente en formato GGUF para inferencia local con llama.cpp, LM Studio y herramientas compatibles.

El problema que aborda es concreto: la mayoria de los modelos abliterated se calibran con conjuntos de datos de rechazo unicamente en ingles, lo que degrada la calidad de salida en otros idiomas. En este caso, el proceso de abliteracion se realizo con un dataset de prompts en tailandes (manteniendo marcadores de rechazo en ingles como respaldo), de forma que el modelo conserva fluidez en tailandes al tiempo que reduce los rechazos excesivos. Esta orientado a los idiomas tailandes (th) e ingles (en).

Su relevancia es acotada pero clara: es una de las pocas variantes abliterated de un modelo MoE de esta familia enfocadas especificamente al tailandes, y ofrece tres niveles de cuantizacion (Q3_K_M, Q4_K_M y Q5_K_M) que permiten ejecutarlo en equipos de consumo con 16-32 GB de VRAM. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicacion reciente sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) sobre transformer, segun la model card ("MoE, 26B total / 4B active") |
| Parametros totales | 25.233.142.046 (datos de safetensors) |
| Parametros activos | 4B aproximadamente (declarado por el autor) |
| Longitud de contexto | no disponible (los ejemplos de uso emplean ventanas de 8192 y 16384 tokens) |
| Tipos de cuantizacion | Q5_K_M, Q4_K_M, Q3_K_M (GGUF) |
| Idiomas soportados | th (tailandes), en (ingles) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (solo texto; no se incluye vision/mmproj) |

Datos adicionales del repositorio: tamano del repo 49,2 GB, pipeline text-generation, creado el 2026-09-15 y actualizado el mismo dia, 0 descargas y 0 likes.

## Arquitectura y entrenamiento

El modelo base es google/gemma-4-26b-a4b-it, una arquitectura de mezcla de expertos (MoE) con 26B parametros totales y 4B activos por token, lo que reduce el coste de computo por token respecto a un modelo denso del mismo tamano. Los parametros reales contabilizados en safetensors son 25.233.142.046. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset original ni las etapas de alineacion (RLHF/DPO) del modelo base en la informacion proporcionada.

La modificacion consiste en una abliteracion realizada con la herramienta Heretic: se elimina la direccion de rechazo en el espacio de activaciones. El autor reporta que el ensayo seleccionado fue el 199, con 0/16 rechazos y una divergencia KL de 0,0074 respecto al modelo original, lo que indica una alteracion relativamente contenida de la distribucion de salidas. El dataset de medicion y evaluacion fueron pares de prompts daninos/inocuos en tailandes, con marcadores de rechazo en ingles como respaldo, para preservar la naturalidad del output en tailandes. No se incluye el adaptador de vision ni el fichero mmproj en esta subida: es exclusivamente texto.

## Capacidades

- Generacion de texto conversacional multi-turno en tailandes e ingles.
- Razonamiento y respuesta a instrucciones propias de un modelo instruct ("it"), con modo de razonamiento desactivable mediante --reasoning off / --reasoning-budget 0 en llama.cpp.
- Reduccion de rechazos ante peticiones que el modelo base rechazaria, segun la metrica declarada (0/16 rechazos en el conjunto de evaluacion en tailandes).
- Escritura de texto largo: la model card recomienda --temp 0.78 y -c 16384 para generaciones extensas.
- Capacidades de vision: no disponibles en esta subida (solo se distribuye el GGUF de texto, sin mmproj).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles como caracteristica declarada; el modo de razonamiento existe pero el autor recomienda desactivarlo en los ejemplos.
- Capacidades multilingues: limitadas a th y en segun los metadatos del repositorio.

## Casos de uso

- Atencion al cliente en tailandes: el modelo puede mantener conversaciones multi-turno en tailandes con un tono natural, evitando los rechazos excesivos tipicos de los abliterated calibrados solo en ingles, algo critico cuando el agente virtual debe responder a consultas sensibles (facturacion, reclamaciones, contenido medico divulgativo) sin bloquear la conversacion.
- Generacion de contenido editorial en tailandes: redaccion de articulos, resumenes y adaptaciones de tono con ventanas de 8192-16384 tokens, suficiente para documentos de varias paginas en una sola pasada.
- Asistente local en ingles para desarrolladores: al ser un GGUF de 13-18 GB, puede ejecutarse en una estacion de trabajo con una RTX 4090 o similar mediante llama.cpp o LM Studio, sin enviar datos a servicios externos.
- Traduccion y post-edicion th-en: el modelo maneja ambos idiomas de forma nativa, por lo que sirve como motor de traduccion o de reescritura para pares de frases en esos dos idiomas, con la salvedad de que no se han publicado evaluaciones de calidad de traduccion.
- Experimentacion en investigacion sobre alineacion y abliteration: el modelo es util como caso de estudio reproducible de como un dataset de calibracion en un idioma no ingles afecta al equilibrio entre rechazos y calidad de salida, con una metrica declarada (KL 0,0074) que permite comparar tecnicas.
- Despliegue en entornos con VRAM limitada: la cuantizacion Q3_K_M (11-13 GB) permite ejecutar un MoE de 26B en GPUs de 12-16 GB, algo inviable con la version sin cuantizar, para tareas de generacion de texto sin requisitos de maxima fidelidad.
- Base para fine-tuning o LoRA en tailandes: al estar ya ajustado para preservar la fluidez en tailandes tras la abliteration, es un punto de partida razonable para adaptaciones de dominio (legal, sanitario, soporte tecnico) en ese idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar en la model card ni en los metadatos del repositorio.

La unica metrica de evaluacion declarada por el autor es la del proceso de abliteration:

| Metrica (evaluacion de abliteration) | Valor |
|---|---|
| Ensayo seleccionado | 199 |
| Rechazos | 0/16 |
| Divergencia KL respecto al modelo base | 0,0074 |

Esta tabla no constituye un benchmark de capacidades: mide unicamente el efecto de la edicion sobre el comportamiento de rechazo y la deriva respecto al modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia, segun la cuantizacion declarada por el autor:
  - Q5_K_M: 16-18 GB (opcion recomendada).
  - Q4_K_M: 13-15 GB (el propio autor la orienta a equipos con 32 GB de VRAM, dejando margen para contexto largo).
  - Q3_K_M: 11-13 GB (huella reducida).
- GPU recomendadas: no especificadas por el autor. Por los tamanos indicados, encajan GPUs con 16 GB o mas (RTX 4090, RTX 4080, A100 40 GB, H100) y, para Q3_K_M, GPUs de 12-16 GB.
- Cabe en GPU de consumo: si, con Q3_K_M y Q4_K_M en tarjetas de 12-16 GB y 16 GB respectivamente; Q5_K_M requiere al menos 16-18 GB libres, por lo que una RTX 4090 de 24 GB es el caso mas comodo.
- Opciones de despliegue: llama.cpp (llama-cli, con -ngl 99 para descargar todas las capas en GPU), LM Studio (carga directa del GGUF) y cualquier runtime compatible con GGUF. No se mencionan vLLM, TGI ni Ollama en la informacion proporcionada.
- Parametros de muestreo recomendados por el autor: temperatura 0,7 (no bajar de ~0,6 porque los modelos abliterated tienden a entrar en bucle a temperaturas muy bajas), min-p 0,05, top-p 0,9, repeat-penalty 1,12, repeat-last-n 256, contexto 8192 (o 16384 con --temp 0,78 para escritura larga). Razonamiento desactivado con --reasoning off --reasoning-budget 0.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas verificables de los modelos implicados.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| lucifer053/gemma-4-26b-a4b-it-uncensored-th-gguf | 25,2B totales / ~4B activos (MoE) | no disponible | th, en | gemma | GGUF (texto) | Abliterated con dataset en tailandes; 0/16 rechazos, KL 0,0074; 0 descargas |
| google/gemma-4-26b-a4b-it (modelo base) | 26B totales / 4B activos (MoE) | no disponible | no disponible en la informacion proporcionada | gemma | no disponible en la informacion proporcionada | Modelo original sin modificar; incluiria vision, no presente en la subida GGUF |
| Otras alternativas abliterated de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de modelos comparables |

## Limitaciones y advertencias

- Sesgos: no se han documentado evaluaciones de sesgo. Al provenir de un modelo base propietario y haberse editado solo la direccion de rechazo, los sesgos del modelo original se mantienen y pueden verse alterados de forma no controlada por la abliteration.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. La abliteration puede incrementar la tendencia a responder con seguridad a preguntas para las que el modelo no tiene base factual, al haberse reducido la senal de rechazo.
- Modo de razonamiento: el autor recomienda explicitamente desactivarlo (--reasoning off --reasoning-budget 0) en los ejemplos de uso, lo que sugiere que su activacion no esta bien caracterizada en esta variante.
- Degradacion a baja temperatura: la model card advierte de que los modelos abliterated tienden a entrar en bucle si la temperatura baja de ~0,6, lo que limita su uso en tareas que requieren decodificacion determinista.
- Vision no incluida: aunque el modelo base dispone de componente multimodal, esta subida es solo texto y no incluye el fichero mmproj; no se puede usar para tareas de imagen.
- Cobertura de idiomas limitada: solo th y en. No hay soporte declarado de castellano, por lo que su uso en produccion en espanol no esta respaldado por el autor.
- Calidad en tailandes: el propio autor senala que la mayoria de abliterated degradan idiomas distintos del ingles; aqui se ha mitigado con un dataset en tailandes, pero no se aportan metricas de calidad por idioma que lo cuantifiquen.
- Licencia: se heredan los Gemma Terms of Use. Es una licencia con condiciones de uso, obligaciones de atribucion y restricciones de uso aceptable; conviene revisar los terminos antes de cualquier uso comercial. El autor la declara como modelo derivado modificado.
- Sin validacion comunitaria: 0 descargas y 0 likes; no hay informes independientes de calidad ni de seguridad.
- Reproducibilidad: se declara el ensayo 199 y la metrica KL, pero no se publican los scripts ni el dataset exacto de abliteration en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lucifer053/gemma-4-26b-a4b-it-uncensored-th-gguf
- Modelo base: https://huggingface.co/google/gemma-4-26b-a4b-it
- Resultados de busqueda web: los resultados devueltos corresponden a servicios de seguimiento de paquetes (UPS, DHL, Barcode Lookup, Track.Global y 17TRACK) y no guardan relacion con el modelo. No se han encontrado en la busqueda enlaces relevantes adicionales (paper, blog, repositorio o demo).
