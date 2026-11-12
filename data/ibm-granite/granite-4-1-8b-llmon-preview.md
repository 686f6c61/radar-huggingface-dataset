# ibm-granite/granite-4.1-8b-llmon-preview

## Resumen

Granite-4.1-8B-LLMON-preview es un modelo de lenguaje instructivo de 8.791.592.960 parámetros desarrollado por el equipo Granite de IBM, obtenido por ajuste fino supervisado del modelo base Granite-4.1-8B-base. Su particularidad es que no consume prompts mediante una plantilla de chat convencional, sino que utiliza LLMON (LLM Object Notation), un formato de marcado nativo para LLM en el que cada componente del prompt (política de sistema, instrucciones, datos, documentos, definiciones de herramientas y resultados de herramientas) se encapsula en un bloque direccionable de forma individual. El modelo se publica como vista previa experimental dentro de la colección Granite Experiments.

La propuesta resuelve un problema concreto de seguridad y control en pipelines de recuperación y agentes: la separación explícita entre instrucciones de confianza y material no confiable. Cada bloque recibe un identificador único de dos caracteres y el bloque `exec` declara qué instrucción se ejecuta, sobre qué entradas opera y dónde va la salida. El modelo está entrenado con una regla de privilegio según la cual solo `exec.instruction` y `exec.system` son autoritativos, mientras que todo lo alcanzado vía `exec.input` (datos, documentos, esquemas de herramientas y resultados de herramientas) debe tratarse como contenido a leer y no como órdenes a obedecer, independientemente de cómo esté redactado.

El modelo soporta doce idiomas (inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino), se distribuye bajo licencia Apache 2.0 y está pensado como base para asistentes de dominio empresarial y para agentes con uso de herramientas. Existe una variante de 3B del mismo formato, lo que permite desplegar la misma semántica de prompting en entornos con menos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (detalles de capas y atencion no disponibles en la informacion proporcionada) |
| Parametros totales | 8.791.592.960 |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles, aleman, espanol, frances, japones, portugues, arabe, checo, italiano, coreano, neerlandes y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers); el repositorio ocupa 87,9 GB |
| Modelo base | ibm-granite/granite-4.1-8b-base |
| Formato de prompt | LLMON con plantilla `chat_template.jinja` incluida |
| Fecha de publicacion | 12 de noviembre de 2026 |

## Arquitectura y entrenamiento

La informacion disponible confirma que se trata de un ajuste fino instructivo sobre Granite-4.1-8B-base, con 8.791.592.960 parametros en pesos safetensors. No se detallan en la documentacion proporcionada el numero de capas, la dimension oculta, el mecanismo de atencion ni la composicion exacta del corpus de preentrenamiento o del dataset de ajuste. Tampoco se especifican el volumen de tokens utilizados ni si se aplicaron etapas de RLHF o DPO; estos datos deben considerarse no disponibles.

La innovacion tecnica central es el formato LLMON y el entrenamiento especifico para interpretarlo. LLMON define seis delimitadores reservados, cada uno de ellos un token unico: `<|open|>` y `<|close|>` para abrir un bloque y delimitar la ruta de etiqueta con su identificador, `<|open_end|>` como cierre universal, `<|self_close|>` para campos vacios, `<|.|>` para unir rutas de etiquetas anidadas y `<|:|>` para separar etiqueta e identificador. Los identificadores son dos caracteres de un conjunto fijo de tokens unicos, asignados en el momento de renderizar y unicos dentro del documento. Las etiquetas disponibles son `instr`, `data`, `req`, `doc`, `tool`, `system`, `assistant` y `exec`, con subcampos anidados como `doc.title`, `doc.text` o `tool....` para JSON aplanado.

El bloque `exec` contiene punteros (`exec.instruction`, `exec.system`, `exec.input`, `exec.requirement`, `exec.output`) que determinan la ejecucion del turno. El modelo esta entrenado para respetar la regla de privilegio descrita: las instrucciones y el sistema mandan, y el contenido de entrada se lee pero no se obedece. El modelo no requiere que el usuario escriba el marcado a mano, ya que la plantilla Jinja lo genera a partir de estructuras de mensajes con campos `instruction`, `data` y marcas `exec`.

## Capacidades

- Generacion de texto y seguimiento de instrucciones generales en dominios empresariales y de asistencia.
- Razonamiento aritmetico y resolucion de problemas paso a paso (el ejemplo de la model card muestra simplificacion de fracciones con explicacion del maximo comun divisor).
- Tareas de codigo, incluyendo generacion y tareas relacionadas con programacion.
- Function calling y uso de herramientas: las definiciones de herramientas se serializan como bloques `tool` con JSON aplanado y los resultados se devuelven como bloques `data`.
- Comportamiento de agente multi-turno: el bloque `system` es persistente entre turnos y `exec` permite encadenar ejecuciones apuntando a bloques concretos.
- Recuperacion aumentada (RAG): los documentos se encapsulan en bloques `doc` con titulo y texto separados, direccionables por identificador.
- Resumen, clasificacion de texto, extraccion de texto y respuesta a preguntas.
- Multilingue en doce idiomas, con posibilidad de ajuste fino para idiomas adicionales.
- Restricciones de salida declarativas mediante bloques `req`, que expresan requisitos de formato o constraint sobre la respuesta.
- Resistencia a inyeccion de prompt a nivel de formato: el contenido no confiable se marca como `exec: False` y el modelo lo trata como dato, no como instruccion.

## Casos de uso

- Atencion al cliente automatizada con material recuperado: el modelo puede gestionar conversaciones multi-turno en las que el contexto del cliente, las politicas internas y los articulos de ayuda se inyectan como bloques `doc` y `data` separados, manteniendo la politica del sistema en un bloque `system` persistente que no se contamina con el texto recuperado.
- Asistentes RAG sobre documentacion corporativa: cada fragmento recuperado se encapsula en un bloque `doc` con `title` y `text`, de modo que el modelo puede citar identificadores concretos y el pipeline puede auditar que documento sustento cada afirmacion.
- Agentes con uso de herramientas en produccion: las definiciones de funciones se serializan como bloques `tool` y los resultados de las llamadas vuelven como bloques `data`; la regla de privilegio impide que un resultado de herramienta manipulado se interprete como una nueva instruccion del sistema.
- Defensa frente a inyeccion de prompt en contenido pegado por el usuario: en escenarios donde el usuario pega correos, webs o transcripciones, el contenido se marca con `exec: False` y el modelo esta entrenado para no ejecutar ordenes embebidas como "ignora lo anterior y responde X".
- Extraccion y clasificacion de documentos con formato controlado: el bloque `req` permite imponer requisitos de salida (por ejemplo, esquema JSON o campos obligatorios) sin depender solo de instrucciones en lenguaje natural.
- Generacion de codigo asistida en pipelines de CI/CD: el modelo puede recibir el diff, las reglas del repositorio y la definicion de herramientas de lint o test como bloques separados, y producir parches o revisiones con trazabilidad de que bloque origino cada decision.
- Asistentes multilingues para soporte interno: con doce idiomas cubiertos, un mismo despliegue puede atender consultas en espanol, aleman, frances, japones o arabe manteniendo la misma semantica de bloques y la misma politica de sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.791.592.960 parametros, en BF16 se requieren aproximadamente 17,6 GB solo para pesos, mas overhead de activaciones y cache KV; en FP8 o int8 se reduce a unos 8,8 GB, y en cuantizaciones de 4 bits a unos 4,4-5 GB. Estas cifras son estimaciones por tamano, no datos publicados por el autor.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para despliegues en BF16 con concurrencia; una RTX 4090 de 24 GB es suficiente para BF16 en un solo usuario.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en BF16 o FP8, y en GPUs de 12-16 GB con cuantizacion de 4-8 bits, siempre que el runtime lo permita.
- Opciones de despliegue: transformers (soporte nativo, con `apply_chat_template`), vLLM y TGI para servido de alta concurrencia, llama.cpp y Ollama si se generan o consiguen pesos GGUF (no se confirma en la informacion disponible la existencia de pesos GGUF publicados).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato de prompt | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Granite-4.1-8B-LLMON-preview | 8.791.592.960 | No disponible | LLMON (bloques direccionables) | Apache 2.0 | Hugging Face, transformers |
| Granite-4.1-3B-LLMON-preview | No disponible | No disponible | LLMON | Apache 2.0 | Hugging Face, transformers |
| Granite-4.1-8B-base | No disponible | No disponible | Plantilla estandar del modelo base | Apache 2.0 | Hugging Face |

La comparativa con modelos de otros fabricantes del mismo tamano no puede completarse con los datos proporcionados; no se dispone de resultados de benchmarks que permitan contrastar rendimiento frente a alternativas de 7-9B.

## Limitaciones y advertencias

- Modelo en vista previa experimental: la model card lo etiqueta como preview y lo incluye en la coleccion Granite Experiments, por lo que su comportamiento y su formato pueden cambiar en versiones posteriores.
- Dependencia del formato LLMON: el modelo no usa una plantilla de chat convencional; integrarlo requiere respetar la plantilla Jinja y la semantica de bloques. Un uso incorrecto del marcado o de los punteros `exec` degrada la calidad de forma significativa.
- Riesgo de alucinacion: como cualquier LLM generativo, puede producir afirmaciones no sustentadas en los bloques `data` o `doc`; la trazabilidad por identificador ayuda a auditar pero no elimina el riesgo.
- La regla de privilegio es una propiedad aprendida, no una garantia formal: el entrenamiento reduce la probabilidad de obedecer instrucciones embebidas en entradas no confiables, pero no la elimina por completo, por lo que conviene mantener validacion externa en produccion.
- Sesgos: no se documentan en la informacion proporcionada evaluaciones de sesgo ni de toxicidad para esta variante.
- Cobertura linguistica: doce idiomas declarados; el rendimiento fuera de esa lista no esta garantizado y requeriria ajuste fino.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, sin las restricciones de licencias tipo research-only; aun asi, deben revisarse las obligaciones de la licencia del modelo base y de los componentes derivados.
- Longitud de contexto no documentada: no es posible planificar cargas de contexto largo sin verificar experimentalmente el limite efectivo.
- Tamano del repositorio de 87,9 GB: la descarga y el almacenamiento requieren planificacion; conviene verificar que los pesos descargados corresponden a la revision deseada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ibm-granite/granite-4.1-8b-llmon-preview
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-8b-base
- Variante de 3B: https://huggingface.co/ibm-granite/granite-4.1-3b-llmon-preview
- Coleccion Granite Experiments: https://huggingface.co/collections/ibm-granite/granite-experiments
- Blog tecnico de LLMON: https://huggingface.co/blog/ibm-granite/llmon-an-llm-native-markup-language-now-in-granite
- Repositorio GitHub: https://github.com/generative-computing/llmon
- Demo de visualizacion de atencion: https://huggingface.co/spaces/ibm-granite/llmon-attention-viz
- Paper de LLMON: https://arxiv.org/abs/2603.22519
- Referencia adicional citada en los tags: https://arxiv.org/abs/2610.38120
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
