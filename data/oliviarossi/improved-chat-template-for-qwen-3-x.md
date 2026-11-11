# OliviaRossi/Improved-Chat-Template-for-Qwen-3.x

## Resumen

Improved Chat Template for Qwen 3.x (v4.1) es una plantilla de chat Jinja2 de código abierto publicada por OliviaRossi bajo licencia Apache 2.0. No es un modelo de lenguaje con pesos propios, sino un artefacto de plantilla (`chat_template.jinja`) que define el formato de los mensajes que se envían a modelos de la familia Qwen 2.5, Qwen 3.x, QwQ y a fusiones híbridas de razonamiento como KAT-Coder, Qwopus, AgentWorld u Ornith. Su identificador interno de versión es `qwen-hybrid-agentic-v4.1` y el formato de cable se mantiene idéntico al de la versión 3: tokens `<|im_start|>` y `<|im_end|>`, llamadas a herramientas en XML estilo Qwen3-Coder o en JSON estilo Qwen, bloques `<tool_response>` y ausencia de BOS.

El problema que resuelve es la gestión correcta del historial de conversación en cargas de trabajo agénticas y de razonamiento híbrido. La plantilla selecciona automáticamente una postura de trabajo entre tres: agente (bucles multi-turno de herramientas, llamadas en paralelo, historial de llamadas sin pérdida y un cortacircuitos anti-bucle), codificación (disciplina de verificación: leer antes de editar, diffs mínimos, verificar antes de declarar éxito) y creativa (prosa larga, sin andamiaje agéntico, continuación byte a byte). La postura se elige de forma implícita cuando hay herramientas presentes, de forma explícita con `task_mode="creative"` o mediante una directiva en el propio prompt a mitad de conversación.

La versión 4.1 es una release de auditoría que corrige dos regresiones introducidas en la 4.0 y varios defectos latentes heredados de la 3.x, sin cambiar el formato del prompt en el cable. Entre las correcciones destacan la restauración del prefill canónico sin modo pensamiento, la eliminación de una corrupción silenciosa del historial cuando aparecía un `</think>` literal en prosa, el respeto byte a byte del contenido de prefill con `continue_final_message` y una detección de errores más fina que distingue contextos de tipo fichero, de tipo código y de tipo traza. El repositorio acumula 161 descargas y 12 me gusta en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | plantilla de chat Jinja2 (no es un modelo con pesos); pensada para transformers con soporte de `chat_template` |
| Parametros totales | no disponible (el artefacto no contiene pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo Qwen sobre el que se aplique la plantilla) |
| Tipos de cuantizacion | no disponible (no aplica al artefacto; depende del modelo anfitrión) |
| Idiomas soportados | en, multilingüe (según etiquetas de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible; el artefacto es un fichero `chat_template.jinja` (Jinja2) |

## Arquitectura y entrenamiento

El artefacto no es un transformer ni un modelo de mezcla de expertos: es una plantilla de texto Jinja2 que se renderiza en tiempo de inferencia para construir el prompt. Su lógica se organiza en torno a tres posturas de trabajo (agente, codificación y creativa) y a un formato de cable fijo basado en `<|im_start|>` / `<|im_end|>`, con soporte para llamadas a herramientas en XML de Qwen3-Coder o en JSON de Qwen, bloques `<tool_response>` y ausencia de token BOS. La plantilla incluye lógica condicional para seleccionar la postura, para agrupar respuestas de herramientas, para emitir avisos de racha de errores y para preservar el prefill de forma byte exacta.

No hay datos de entrenamiento porque no se entrena ningún modelo: la plantilla se valida con un arnés de pruebas autocontenido que el autor incluye en la model card. Ese arnés usa `ImmutableSandboxedEnvironment` de Jinja2 con `trim_blocks=True` y `lstrip_blocks=True`, registra el filtro `tojson` y la función `raise_exception`, y verifica casos como el prefill sin pensamiento byte exacto, la presencia del literal `<think></think>` en la regla IMPORTANTE, la no eliminación de un `</think>` literal en prosa cuando la poda está activa, el manejo de llamadas a herramientas con argumentos en cadena y el equilibrio de llamadas en paralelo con respuestas agrupadas. Entre las innovaciones técnicas destacan el cortacircuitos anti-bucle para bucles de herramientas, la deduplicación por subcadena entre `reasoning_content` explícito y bloque think en línea idéntico, y la distinción entre detección de errores `file_like`, `code_like` y `trace_like`.

## Capacidades

- Construcción de prompts para generación de texto con modelos Qwen 2.5, Qwen 3.x, QwQ y fusiones híbridas de razonamiento (KAT-Coder, Qwopus, AgentWorld, Ornith).
- Soporte de llamadas a herramientas y function calling en dos formatos: XML estilo Qwen3-Coder y JSON estilo Qwen.
- Gestión de bucles agénticos multi-turno con llamadas en paralelo y respuestas de herramienta agrupadas.
- Cortacircuitos anti-bucle y aviso de racha de errores cuando una llamada previa devuelve error.
- Modo de razonamiento híbrido con bloques `<think>` / `<thinking>` y prefill canónico sin modo pensamiento.
- Postura de codificación con disciplina de verificación: leer antes de editar, diffs mínimos y verificación antes de declarar éxito.
- Postura creativa para prosa larga, sin andamiaje agéntico, con continuación byte exacta del mensaje final.
- Cambio de postura a mitad de conversación mediante directiva en el prompt.
- Soporte de `continue_final_message` con emisión byte exacta del prefill, incluidos espacios y saltos de línea finales.
- Detección de errores a nivel de mensaje con `is_error` e `isError`.
- Compatibilidad declarada con vLLM, SGLang, llama.cpp y transformers.
- Idiomas: inglés y multilingüe según las etiquetas de la model card.

## Casos de uso

- Agentes con herramientas en producción: la plantilla mantiene un historial de llamadas sin pérdida y agrupa las respuestas de herramientas, lo que permite construir agentes multi-turno que encadenan llamadas en paralelo sin romper el formato del prompt. Es adecuada cuando el agente necesita distinguir entre errores fuertes y débiles en las respuestas de las herramientas.
- Asistentes de codificación con verificación: la postura de codificación impone leer antes de editar, producir diffs mínimos y verificar antes de declarar éxito, lo que encaja en pipelines de CI/CD donde el agente debe diagnosticar fallos de pytest y no confundir una traza de error con un éxito.
- Escritura creativa de formato largo: con `task_mode="creative"` y `continue_final_message=True`, el prompt termina a mitad de frase de forma byte exacta y sin `<|im_end|>`, de modo que el modelo retoma la prosa en el punto de corte sin andamiaje agéntico ni presión de brevedad.
- Migración desde plantillas Qwen genéricas: equipos que ya sirven Qwen 2.5 o Qwen 3.x con la plantilla por defecto pueden adoptar esta plantilla sin cambiar el formato de cable, reduciendo el riesgo de corrupción de historial cuando el texto del usuario contiene literales como `</think>`.
- Sistemas de razonamiento híbrido: la plantilla gestiona el prefill canónico sin modo pensamiento y deduplica el `reasoning_content` explícito frente a un bloque think en línea idéntico, lo que resulta útil en despliegues que alternan entre modo pensamiento y modo directo.
- Evaluación y pruebas de regresión de plantillas: el arnés de validación incluido permite ejecutar comprobaciones contra el renderizador propio antes de desplegar, cubriendo las regresiones de la versión 4.0 y la clase de errores de corrupción de historial.
- Despliegue multi-backend: al ser una plantilla Jinja2 estándar, se puede usar con vLLM, SGLang, llama.cpp y transformers, lo que facilita servir el mismo modelo Qwen con distintos motores sin reescribir el formato de los mensajes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas cuantitativas de rendimiento; solo describe el arnés de validación funcional de la plantilla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo Qwen sobre el que se aplique la plantilla y de su cuantización.
- GPU recomendadas: no disponible por parte del artefacto; vienen determinadas por el modelo anfitrión (Qwen 2.5, Qwen 3.x, QwQ o fusiones híbridas).
- Cabe en GPU de consumo: no disponible como dato del artefacto; depende del modelo anfitrión y de su cuantización.
- Opciones de despliegue: vLLM, SGLang, llama.cpp y transformers, según las etiquetas y la model card.
- Latencia y throughput estimados: no disponible; la plantilla añade un coste de renderizado Jinja2 despreciable frente a la inferencia, pero no se publican cifras.

## Comparativa con modelos similares

| Plantilla | Autor | Formato de cable | Posturas | Soporte de herramientas | Licencia |
|---|---|---|---|---|---|
| Improved Chat Template for Qwen 3.x v4.1 | OliviaRossi | `<|im_start|>` / `<|im_end|>`, XML y JSON | agente, codificación, creativa | sí, con llamadas en paralelo y respuestas agrupadas | Apache 2.0 |
| Plantilla de chat por defecto de Qwen 3.x | Alibaba Qwen | `<|im_start|>` / `<|im_end|>` | no declaradas | sí, formato nativo | según el modelo Qwen |
| Plantilla de chat por defecto de Qwen 2.5 | Alibaba Qwen | `<|im_start|>` / `<|im_end|>` | no declaradas | sí, formato nativo | según el modelo Qwen |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación numérica con las plantillas nativas de Qwen; la comparación anterior se limita a características estructurales declaradas en la información disponible.

## Limitaciones y advertencias

- No es un modelo: no contiene pesos ni puede generar texto por sí mismo; requiere un modelo Qwen compatible como anfitrión.
- La model card advierte de que la plantilla debe validarse contra el renderizador propio antes de desplegarla; el arnés incluido cubre las regresiones de la versión 4.0 y la clase de errores de corrupción de historial, pero no sustituye a las pruebas del sistema completo.
- La versión 4.0 introdujo regresiones que la 4.1 corrige; los equipos que sigan en la 3.x deben leer la sección de migración de la model card antes de actualizar.
- El formato de cable se mantiene sin cambios respecto a la 3.x, pero cualquier dependencia de detalles internos del renderizado puede romperse entre versiones menores.
- Riesgo de alucinación y sesgos: no disponible como dato del artefacto; dependen del modelo anfitrión y de los datos con los que fue entrenado.
- Limitaciones de contexto e idioma: no disponible; la longitud de contexto la fija el modelo anfitrión. Los idiomas declarados son inglés y multilingüe, sin detalle de cobertura por idioma.
- La licencia Apache 2.0 permite uso comercial de la plantilla, pero no altera las licencias de los modelos Qwen sobre los que se aplique, que deben verificarse por separado.
- La documentación de la model card está mayoritariamente en inglés y algunos fragmentos de la información extraída aparecen truncados, por lo que conviene consultar el repositorio original para los detalles completos de la versión 4.1.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/OliviaRossi/Improved-Chat-Template-for-Qwen-3.x
- Fichero de plantilla: `chat_template.jinja` (incluido en el repositorio)
- Documentación de plantillas de chat de Hugging Face: https://huggingface.co/docs/transformers/main/en/chat_templating
- Documentación de Jinja2: https://jinja.palletsprojects.com/
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Repositorio de SGLang: https://github.com/sgl-project/sglang
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
