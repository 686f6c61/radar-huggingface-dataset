# erknog/opline-0.8b

## Resumen

Opline 0.8B es un modelo de lenguaje especializado en edición de documentos Markdown mediante instrucciones en lenguaje natural, desarrollado por el usuario erknog. Se trata de un fine-tune del modelo base Qwen3.5-0.8B de Unsloth, con 873 millones de parámetros, entrenado específicamente para convertir instrucciones de edición (a menudo dictadas por voz) en operaciones estructuradas de una sola línea que un ejecutor determinista aplica sobre el documento. El modelo no genera el texto del documento, sino la operación de edición.

Su relevancia radica en su enfoque de diseño: en lugar de pedir a un modelo generalista que reescriba un documento completo (con el riesgo de alucinación y pérdida de contenido), Opline emite operaciones atómicas y verificables (`ADD`, `DEL`, `REP`, `INSB`, `INSA`, `UNDO`) que un programa TypeScript externo valida y aplica. Esto lo hace adecuado para interfaces de edición por voz o dictado donde la precisión y la reversibilidad son críticas.

El modelo se distribuye principalmente en formato GGUF cuantizado Q4_K_M (517 MB), con variantes adicionales en safetensors, MLX 4-bit y un adaptador LoRA PEFT (r=16, alpha=16). Está pensado para ejecutarse en hardware muy modesto, con aproximadamente 0,6 GB de RAM/VRAM a 2k de contexto, y se integra con llama.cpp, MLX y Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5), fine-tune con LoRA |
| Parametros totales | 873.438.784 (0,87B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de entrenamiento de 1k tokens; configurado a 2k en el ejemplo de llama.cpp |
| Tipos de cuantizacion | Q4_K_M GGUF (517 MB), MLX 4-bit, bfloat16 (full precision) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, safetensors, MLX 4-bit, adaptador PEFT LoRA |

## Arquitectura y entrenamiento

Opline 0.8B se construye sobre Qwen3.5-0.8B, un transformer de 873 millones de parámetros, mediante un fine-tune con LoRA (r=16, alpha=16) sobre el modelo base de Unsloth. El entrenamiento está orientado a una tarea única: dado un prompt de sistema fijo, una instrucción de usuario y un documento Markdown numerado por líneas (`[L01]`, `[L02]`, ...), el modelo debe emitir exactamente una línea de operación. El dataset de entrenamiento no está detallado en la información disponible, pero la model card indica que se compone de instrucciones con estilo de dictado por voz (frases habladas, sin puntuación, números escritos como se pronuncian) y que el fraseo del dataset es "bastante opinado", usando marcos como "saying X", "replace X with Y" o "continue with X".

La innovación técnica principal no reside en la arquitectura, sino en el paradigma de salida estructurada: el modelo emite operaciones atómicas (`ADD`, `APP`, `DEL`, `RM`, `REP`, `INSB`, `INSA`, `UNDO`) con anclas verbatim, y un ejecutor determinista en TypeScript resuelve la línea objetivo por contenido, aplica el cambio y normaliza el Markdown. Las operaciones ambiguas o sin coincidencia se rechazan por completo, dejando el documento intacto. El modelo también soporta un modo de pensamiento (`enable_thinking`) que se desactiva explícitamente en los ejemplos de despliegue, lo que sugiere que el modelo base incluye capacidades de razonamiento que el fine-tune no necesita para su tarea.

## Capacidades

- Generación de operaciones de edición estructuradas sobre documentos Markdown: inserción de líneas, borrado, reemplazo de fragmentos, inserción antes/después de un ancla y deshacer.
- Comprensión de instrucciones en lenguaje natural con estilo de dictado por voz (frases habladas, sin puntuación, números pronunciados).
- Salida de una única operación por turno, con anclas verbatim que el ejecutor resuelve por contenido.
- Soporte de plantilla de chat compatible con la API de OpenAI (endpoint `/v1` en llama.cpp).
- Capacidad de continuar el último párrafo del documento ante dictado directo ("bare dictation") si el archivo termina en párrafo; si termina en lista, encabezado o está vacío, inicia un párrafo nuevo.
- No dispone de soporte nativo de audio: el modelo recibe texto transcrito (STT) y el demo usa `nemotron-speech-streaming-en-0.6b` para la transcripción.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Edición de documentos por voz en tiempo real: el modelo convierte una instrucción dictada ("remove line five", "in line four replace walking down the hill with running up the mountain") en una operación `DEL` o `REP` que un ejecutor aplica sobre el Markdown, permitiendo editar notas o documentos sin teclado.
- Asistentes de dictado para notas rápidas: el usuario dicta contenido nuevo ("add list item saying buying groceries") y el modelo emite una operación `ADD` o `APP`, integrable en una app de notas que mantiene el documento sincronizado.
- Automatización de correcciones puntuales en documentación técnica: un pipeline puede enviar instrucciones como "remove the subheading in line 11" y el modelo devuelve `DEL [L11] Questions and Answers`, útil para scripts de mantenimiento de README o wikis.
- Interfaces de edición accesibles: personas con movilidad reducida pueden editar documentos mediante voz, ya que el modelo tolera frases habladas sin puntuación y números pronunciados, y el ejecutor rechaza operaciones ambiguas sin modificar el archivo.
- Integración en editores Markdown con deshacer determinista: la operación `UNDO` y el rechazo atómico de operaciones inválidas permiten construir un historial de cambios fiable sin necesidad de versionado completo del documento.
- Prototipado de agentes de edición de bajo coste: al requerir ~0,6 GB de RAM/VRAM y ejecutarse en llama.cpp o MLX, el modelo puede desplegarse en portátiles o dispositivos Apple Silicon para demos y pruebas de concepto de edición estructurada.
- Filtrado y normalización de instrucciones de edición en pipelines de CI: el modelo puede actuar como capa de traducción entre lenguaje natural y operaciones verificables, permitiendo que un programa valide cada cambio antes de aplicarlo al repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: ~0,6 GB a 2k de contexto con la cuantización Q4_K_M (517 MB de pesos).
- GPU recomendadas: no se especifican modelos concretos; el tamaño del modelo permite ejecución en CPU y en GPUs de gama baja.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo con al menos 1 GB de VRAM libre, y también en CPU.
- Opciones de despliegue: llama.cpp (`llama-server` con soporte Qwen3.5, `--jinja`, `--ctx-size 2048`, `--chat-template-kwargs '{"enable_thinking":false}'`), MLX (`mlx_lm.server` en Apple Silicon), Transformers (`AutoModelForImageTextToText` con `dtype=torch.bfloat16`) y adaptador PEFT LoRA sobre el modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Opline 0.8B | 0,87B | 1k entrenamiento / 2k configurado | Edición estructurada de Markdown | Apache 2.0 | GGUF, safetensors, MLX, LoRA |
| Qwen3.5-0.8B (base) | 0,8B | no disponible | Generación de texto general | no disponible | safetensors |
| Modelos generalistas de ~1B | ~1B | variable | Asistente general | variable | variable |

La comparativa directa con alternativas de la misma categoría (modelos especializados en edición estructurada de documentos) no está disponible en la información proporcionada. Frente a su modelo base Qwen3.5-0.8B, Opline sacrifica generalidad y cobertura multilingüe a cambio de una salida estructurada y verificable para una tarea concreta.

## Limitaciones y advertencias

- Modelo de propósito único: no es un asistente general; no resume, no redacta contenido ni expande notas a prosa. La instrucción debe aportar el contenido.
- Una sola operación por turno: peticiones como "rename every heading to title case" requieren una instrucción por línea.
- Requiere mencionar el número de línea al modificar una línea existente; aunque el ejecutor resuelve el ancla por contenido, todas las instrucciones de entrenamiento que apuntan a una línea la nombran.
- El fraseo importa: el dataset de entrenamiento es opinado y espera marcos concretos ("saying X", "replace X with Y", "continue with X"). No soporta objetivos semánticos como "the second bullet" o "the paragraph about pricing"; hay que citar el texto.
- Sin soporte nativo de audio: requiere un paso previo de STT.
- Solo inglés: no hay capacidades multilingües declaradas.
- Ventana de contexto de entrenamiento de 1k tokens, lo que limita el tamaño del documento que puede procesarse en una sola instrucción.
- Riesgo de alucinación en las anclas: si el modelo emite un ancla que no coincide con el documento, el ejecutor rechaza la operación completa, pero el fallo puede requerir reintento o reformulación.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3.5-0.8B de Unsloth, cuya licencia no se detalla en la información disponible.
- Sin datos de benchmarks publicados, por lo que el rendimiento real en producción no está cuantificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erknog/opline-0.8b
- Repositorio del código, ejecutor y demo web: https://github.com/kueckelheim/opline
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Demo (GIF en el repositorio del modelo): https://huggingface.co/erknog/opline-0.8b/resolve/main/demo.gif
