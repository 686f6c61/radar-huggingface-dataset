# AbstractPhil/molmo2-o-7b-think-symbolic-image

## Resumen

Molmo2-O-7B think symbolic image es un adaptador LoRA de tipo PEFT construido sobre el modelo vision-lenguaje allenai/Molmo2-O-7B de Ai2, que combina el codificador visual de la familia Molmo con el modelo de lenguaje OLMo 3 de 7B parametros y 32 capas. El adaptador no modifica la arquitectura base: anade un entrenamiento especifico para que el modelo produzca, ante una imagen, una "cadena de pensamiento" estructurada por lineas con pasos nombrados (see, name, place, count, relate, form, light, colour, mood, mean, intend, story, compare, change, check, say), seguida de una caption, un prompt o etiquetas y una serie de preguntas con su respuesta clasificada como `[record]`, `[chain]` o `[unknown]`.

El modelo resuelve un problema concreto: la mayoria de los modelos vision-lenguaje generan descripciones planas o alucinan detalles cuando se les pide razonar sobre una imagen. Este adaptador fuerza un formato de razonamiento explicito y verificable, con profundidad graduable (vista rapida de 1-2 pensamientos, vista cercana de 3-5, vista larga de 6-10), lo que lo hace util para tareas de catalogacion, critica visual y anotacion estructurada. Segun la model card, el modelo base solo respondia con la forma completa de la fila aproximadamente un tercio de las veces, mientras que el adaptador la escribe completa y respalda sus pensamientos al nivel de la receta "Lucia".

Es relevante ahora porque forma parte de una familia de cinco adaptadores entrenados bajo la misma receta (lineas Lucia con Qwen3.5 y Ulisse con Gemma 4) y evaluados sobre los mismos conjuntos de validacion, lo que permite comparar como distintos modelos base sostienen el mismo formato de razonamiento visual. El adaptador tiene 67,4 M de parametros entrenables, rango 32 y se distribuye en fp32 bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer vision-lenguaje (codificador visual Molmo + OLMo 3 7B de 32 capas) |
| Parametros totales | 7,8 mil millones (modelo base); adaptador LoRA de 67,4 M entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (adaptador guardado en fp32; el base se carga en bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base en su repositorio original con `trust_remote_code` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre allenai/Molmo2-O-7B, un modelo vision-lenguaje que empareja el codificador de vision de Molmo con el modelo de lenguaje OLMo 3 de 7B parametros y 32 capas, entrenado originalmente con captions humanos densos. El adaptador LoRA tiene rango 32 y 67,4 M de parametros entrenables, guardado en fp32, y se fusiona con el base mediante `merge_and_unload()` de PEFT. No existe un fine-tune completo: el repositorio solo contiene el adaptador.

El entrenamiento se realizo sobre dos conjuntos de datos del autor: `AbstractPhil/thought-symbolic-image-captions` y `AbstractPhil/qwen-thinking-images`. El adaptador aprende a emitir filas estructuradas con pasos de pensamiento nombrados, una caption, un prompt o etiquetas y preguntas con su clasificacion de procedencia (`[record]`, `[chain]`, `[unknown]`). Se entreno con decodificacion greedy, sin system prompt y sin modo thinking, ya que el modelo base no es un modelo de razonamiento. El codigo del modelo es el del repositorio base, fijado a la revision `78441065` y pensado para transformers 4.57 (se indica `transformers==4.57.6` y peft 0.18 o superior). El adaptador forma parte de una familia de cinco entrenados bajo la misma receta y evaluados sobre los mismos conjuntos de validacion.

## Capacidades

- Generacion de cadenas de pensamiento visuales estructuradas, con pasos nombrados y profundidad graduable (vista rapida, cercana o larga).
- Generacion de captions descriptivas de imagenes.
- Generacion de prompts o etiquetas para imagenes, con el primer termino indicando el tipo de imagen (pintura, grabado, dibujo, fotografia).
- Generacion de criticas visuales por profundidad.
- Formulacion de preguntas de seguimiento con respuesta clasificada como hecho de la imagen (`[record]`), deducida por la cadena (`[chain]`) o desconocida (`[unknown]`).
- Razonamiento visual sobre obras de arte, fotografia y piezas de museo.
- Capacidad multilingue limitada: solo ingles.
- No soporta tool calling ni function calling de forma nativa.
- No es un modelo de razonamiento general: no tiene modo thinking nativo; el "pensamiento" es el formato estructurado aprendido.
- No soporta audio.

## Casos de uso

- Catalogacion de fondos museisticos: el modelo genera una fila estructurada con tipo de imagen, medio, color, estado de animo y preguntas abiertas, util para enriquecer fichas de catalogo con metadatos consistentes y revisables por un documentalista.
- Generacion de metadatos para bancos de imagenes: produce caption, prompt y etiquetas en un unico paso, lo que permite poblar campos de busqueda y descripcion sin pipelines separados.
- Critica y analisis de obras de arte: la cadena de pensamiento por pasos (forma, luz, color, estado de animo, intencion) sirve como borrador de texto curatorial o educativo que un humano revisa y edita.
- Anotacion asistida de datasets de vision: las preguntas con clasificacion `[record]`/`[chain]`/`[unknown]` permiten separar hechos observables de inferencias, lo que ayuda a auditar la calidad de las anotaciones.
- Educacion artistica y visual: el formato de vista rapida, cercana o larga permite adaptar la profundidad del analisis al nivel del estudiante o al tiempo disponible.
- Investigacion sobre razonamiento visual: al compartir receta y conjuntos de validacion con otros cuatro adaptadores, sirve para estudiar como distintos modelos base sostienen un mismo formato de cadena de pensamiento.
- Descripcion accesible de imagenes: la caption generada puede alimentar textos alternativos, aunque requiere revision humana por el riesgo de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica cualitativamente que el modelo base respondia con la forma completa de la fila aproximadamente un tercio de las veces, que el adaptador la escribe completa y respalda sus pensamientos al nivel de la receta "Lucia", y que las lecturas de medio plazo alcanzan el nivel de la linea "Ulisse". No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de evaluaciones de captioning.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El modelo base tiene 7,8 mil millones de parametros; en bfloat16 requiere del orden de 16 GB solo para pesos, mas el codificador visual y el cache de activaciones.
- El adaptador LoRA en si ocupa 0,3 GB en el repositorio y se fusiona con el base, por lo que no anade requisitos significativos de VRAM.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, un modelo de 7,8B en bf16 encaja en GPU de 24 GB o mas (por ejemplo, RTX 4090, A100 40 GB, H100), aunque no se confirma en la model card.
- Cabe en GPU de consumo: probablemente en tarjetas de 24 GB o mas, pero no se confirma.
- Opciones de despliegue: la model card solo documenta el uso con transformers 4.57.6, peft 0.18 o superior y `trust_remote_code`, con `AutoModelForImageTextToText` y `AutoProcessor`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AbstractPhil/molmo2-o-7b-think-symbolic-image | 7,8B base + 67,4M LoRA | no disponible | apache-2.0 | Hugging Face (adaptador PEFT) | Cadena de pensamiento visual estructurada; solo ingles |
| allenai/Molmo2-O-7B (base) | 7,8B | no disponible | no disponible en la informacion | Hugging Face | Modelo base; responde la forma completa solo ~1/3 de las veces segun la model card |
| Familia Lucia (Qwen3.5) | no disponible | no disponible | no disponible | no disponible | Misma receta; linea de referencia en las lecturas |
| Familia Ulisse (Gemma 4) | no disponible | no disponible | no disponible | no disponible | Misma receta; nivel de referencia en lecturas de medio plazo |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues declaradas.
- Riesgo de alucinacion: el modelo puede generar detalles visuales no presentes en la imagen, especialmente en las preguntas clasificadas como `[chain]`; la clasificacion `[unknown]` ayuda pero no elimina el riesgo.
- El adaptador fue entrenado con prompts exactos; una reformulacion del prompt constituye una entrada distinta y puede degradar la calidad de la salida.
- Requiere ejecucion con decodificacion greedy, sin system prompt y sin modo thinking; desviarse de estas condiciones puede alterar el formato.
- Depende de `trust_remote_code` y de una revision concreta del modelo base (`78441065`), lo que limita la portabilidad y exige fijar versiones de transformers y peft.
- No es un modelo de razonamiento general ni soporta tool calling; no debe usarse como agente autonomo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y sus dependencias deben verificarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay evidencia de uso en produccion.
- No se han publicado benchmarks objetivos; las afirmaciones de calidad de la model card son cualitativas y del propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AbstractPhil/molmo2-o-7b-think-symbolic-image
- Modelo base: https://huggingface.co/allenai/Molmo2-O-7B
- Dataset de captions: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-captions
- Dataset de imagenes de pensamiento: https://huggingface.co/datasets/AbstractPhil/qwen-thinking-images
