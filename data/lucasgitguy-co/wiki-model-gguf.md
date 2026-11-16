# Lucasgitguy-co/wiki-model-GGUF

## Resumen

wiki-model-GGUF es la distribucion en formato GGUF de wiki-model, un ajuste fino de SmolLM2-135M orientado a la generacion de hechos breves, la respuesta a preguntas y la correccion de afirmaciones falsas. Lo publica el usuario Lucasgitguy-co y esta pensado para ejecutarse en llama.cpp y en aplicaciones construidas sobre el, lo que permite desplegarlo en CPU y en hardware muy modesto. El modelo base cuenta con 134.515.008 parametros y una ventana de contexto que no se especifica en la informacion disponible.

La relevancia de esta publicacion es practica: ofrece tres cuantizaciones listas para usar (F16, Q8_0 y Q4_K_M) con un peso de repositorio de 0,5 GB, lo que reduce la barrera de entrada para experimentar con generacion de texto factual en entornos sin GPU. El modelo no emplea plantilla de chat; en su lugar consume etiquetas explicitas (`<fact>`, `<q>`, `<fix>`, `<ctx>`) que definen la tarea, un diseno poco habitual que simplifica el prompt pero exige integracion a medida.

Es importante subrayar que se trata de un modelo de 135 millones de parametros: su utilidad esta en tareas acotadas y con contexto aportado, no en razonamiento general. El propio autor advierte que, sin texto de soporte, solo entre el 5 % y el 12 % de los hechos generados resultaron respaldados en su evaluacion de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de SmolLM2-135M); detalles de capas y atencion no disponibles |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (pesos originales en safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de SmolLM2-135M, un transformer decoder-only de 135 millones de parametros. La model card no detalla la composicion del dataset de ajuste fino, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO; esa informacion figura como no disponible. Si se indica que los datos de entrenamiento derivados de Wikipedia estan bajo licencia CC BY-SA 4.0, lo que sugiere un corpus centrado en texto enciclopedico.

La innovacion tecnica destacable no esta en la arquitectura sino en la interfaz: el modelo funciona sin plantilla de chat y se controla mediante etiquetas de tarea (`<fact>`, `<q>`, `<fix>`, `<ctx>`). El paquete Python asociado incorpora un modo `--grounded` con un indice BM25 sobre Wikipedia y un bloqueo de 4-gramas repetidos en la respuesta; ninguna de esas dos funciones esta incluida en los ficheros GGUF, por lo que en llama.cpp hay que replicarlas externamente si se necesitan. La conversion se realizo con `convert_hf_to_gguf.py` (checkout `1b6935b`), reescribiendo dos campos del config (`rope_parameters.rope_theta` a 100000 y `extra_special_tokens` a `additional_special_tokens`) sin modificar los pesos.

## Capacidades

- Generacion de hechos breves sobre un tema a partir de la etiqueta `<fact>`.
- Respuesta a preguntas factuales mediante la etiqueta `<q>`.
- Deteccion y correccion de afirmaciones falsas con la etiqueta `<fix>`.
- Respuesta condicionada a texto de contexto aportado por el usuario mediante `<ctx>` combinado con `<q>`.
- Generacion de texto en ingles exclusivamente.
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- No emplea plantilla de chat; la entrada se estructura con etiquetas.

## Casos de uso

- Correccion de datos en articulos o fichas: se pasa una afirmacion erronea dentro de `<fix>` y el modelo devuelve una version corregida; util para preprocesar borradores editoriales antes de revision humana.
- Extraccion de respuestas sobre un texto dado: introduciendo un parrafo en `<ctx>` y una pregunta en `<q>`, el modelo responde anclado al contenido, lo que reduce el riesgo de invencion en comparacion con el modo sin contexto.
- Generacion de resumenes factuales de una linea: con `<fact>` se obtiene una frase corta sobre un tema, adecuada para pies de foto, glosarios o etiquetas descriptivas.
- Prototipado y docencia: al ocupar 0,105 GB en Q4_K_M, se puede ejecutar en un portatil sin GPU para demostrar el funcionamiento de llama.cpp y de modelos de lenguaje en un aula o taller.
- Filtrado previo en pipelines de datos: usar el modelo para marcar afirmaciones sospechosas en un corpus antes de enviarlas a un modelo mayor, aprovechando su bajo coste por inferencia.
- Pruebas de integracion en aplicaciones llama.cpp: sirve como modelo de referencia ligero para validar el soporte de etiquetas especiales, la tokenizacion y el rendimiento de la aplicacion antes de cambiar a un modelo mayor.
- Generacion de preguntas de verificacion: a partir de un texto en `<ctx>`, producir preguntas cuya respuesta este contenida en el propio texto, para construir conjuntos de evaluacion de sistemas RAG.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion mencionado es que, en la evaluacion de origen del modelo base, entre el 5 % y el 12 % de los hechos generados sin contexto resultaron respaldados por una fuente. En cuanto a validacion de la conversion, el autor verifico que los identificadores de tokens coinciden con el tokenizador de transformers y que la salida greedy del fichero F16 es identica a la de transformers en float32 sobre 4 prompts de 40 tokens; Q8_0 y Q4_K_M solo se comprobaron con un prompt.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones; F16 ocupa 0,271 GB, Q8_0 0,145 GB y Q4_K_M 0,105 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente; no se requiere una GPU de datacenter. El modelo esta pensado principalmente para CPU.
- Compatibilidad con GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso en Raspberry Pi y dispositivos similares.
- Opciones de despliegue: llama.cpp (probado con la version 1.0.0, build 12359) y aplicaciones construidas sobre llama.cpp; el autor no documenta soporte para vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| wiki-model-GGUF | 134,5 M | no disponible | en | Apache-2.0 | GGUF |
| SmolLM2-135M (modelo base) | 135 M | no disponible en esta ficha | en (multilingue limitado) | Apache-2.0 | safetensors |
| Qwen2.5-0.5B | 0,5 B | no disponible en esta ficha | multilingue | Apache-2.0 | safetensors, GGUF |

La comparacion con Qwen2.5-0.5B se incluye por categoria de tamano (modelos por debajo de 1 B), pero no se dispone de datos de rendimiento de ninguno de los tres en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Alto riesgo de alucinacion sin contexto: el propio autor reporta que solo el 5-12 % de los hechos generados en modo sin contexto estaban respaldados. No debe usarse como fuente de verdad sin verificacion.
- El modo `--grounded` con indice BM25 y el bloqueo de 4-gramas repetidos no estan incluidos en los ficheros GGUF; hay que reimplementarlos en la aplicacion anfitriona.
- Solo soporta ingles; no hay evidencia de capacidades en castellano ni en otros idiomas.
- No dispone de plantilla de chat, lo que complica la integracion con frameworks que esperan el formato estandar de mensajes.
- La longitud de contexto no esta documentada, lo que impide planificar el tamano de los textos introducidos en `<ctx>`.
- El modelo base es un ajuste fino de SmolLM2-135M; su capacidad de razonamiento y de conocimiento general es muy limitada por el numero de parametros.
- Los datos de entrenamiento derivados de Wikipedia estan bajo CC BY-SA 4.0, lo que puede imponer obligaciones de atribucion y compartir igual sobre las salidas en determinados usos, aunque los pesos se distribuyan como Apache-2.0.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia de uso en produccion ni de validacion por terceros.
- Q8_0 y Q4_K_M solo se verificaron con un unico prompt; la equivalencia con el modelo original en estas cuantizaciones no esta garantizada de forma exhaustiva.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Lucasgitguy-co/wiki-model-GGUF
- Modelo base: https://huggingface.co/Lucasgitguy-co/wiki-model
- SmolLM2 (familia del modelo base): https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- llama.cpp: https://github.com/ggml-org/llama.cpp
