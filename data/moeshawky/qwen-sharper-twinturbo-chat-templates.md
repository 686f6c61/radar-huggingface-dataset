# moeshawky/Qwen-Sharper-TwinTurbo-Chat-Templates

## Resumen

`moeshawky/Qwen-Sharper-TwinTurbo-Chat-Templates` no es un modelo de lenguaje, sino un repositorio de plantillas de chat en Jinja (`chat_template.jinja`) destinadas a controlar el formato de prompt de modelos de la familia Qwen, en concreto la variante Qwen3.8-27B Twin-Turbo. Lo publica el usuario `moeshawky` y deriva por ajuste fino de plantilla de `froggeric/Qwen-Fixed-Chat-Templates`. El problema que resuelve es de infraestructura de inferencia: los servidores (vLLM, SGLang, llama.cpp, LM Studio, MLX) aplican la plantilla antes de tokenizar, y una plantilla mal construida degrada el tool calling, introduce tokens basura o permite que contenido no confiable se interprete como instrucciones.

La línea «Twin-Turbo» corresponde a la versión `v22.5.4-sharper-tturbo`, construida sobre la plantilla propia del modelo destino (`chat_template-tturbo-v2.jinja`, versión `v22.5.0-DAU`) mediante 13 modificaciones ancladas con aserciones. Frente a su base añade aislamiento de herramientas siempre activo, una cola de verificación de argumentos, límites acotados para argumentos y respuestas de herramientas, un bloque de sistema más conciso y direccionamiento de razonamiento («thinking-sharp»). Conserva sin modificar los modos DAU del modelo (`einstein`/`spoon` y etiquetas `{REASON:}`).

Es relevante ahora porque los flujos agénticos con tool calling son el caso de uso dominante en producción, y el punto débil habitual no está en los pesos sino en la plantilla: respuestas de herramienta que contienen `</tool_call>` o interpolación Jinja pueden confundirse con instrucciones, y argumentos sin acotar pueden copiarse literalmente en parámetros numéricos y romper los parsers posteriores. El repositorio tiene 0 descargas y 0 «likes» en el momento de la consulta, y ocupa menos de 0,1 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica: no es una red neuronal, sino plantillas de chat Jinja (`chat_template.jinja`, ficheros `.jinja` y `.txt`) que se aplican al tokenizador del modelo destino |
| Parámetros totales | No aplica (el repositorio no contiene pesos) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; la ventana la fija el modelo destino (Qwen3.8-27B Twin-Turbo). La plantilla sí impone límites de contenido en herramientas: 2000 caracteres por argumento y 8000 por respuesta, con exención para cargas JSON |
| Tipos de cuantización | No aplica (las plantillas son independientes de la cuantización) |
| Idiomas soportados | `en` según los metadatos del repositorio; la plantilla no introduce lógica específica de idioma |
| Licencia | apache-2.0 |
| Formato de pesos | No aplica; se distribuyen ficheros `.jinja` (plantilla) y `.txt` (variante en una sola línea) |
| Versión de plantilla | `v22.5.4-sharper-tturbo` (fichero de 40 773 B frente a los 39 075 B de la base `v22.5.0-DAU-Twin-Turbo-V1.0`) |
| Variantes incluidas | Twin-Turbo (`chat_template-v22.5.4-sharper-tturbo.jinja` + `-oneline.txt`) y genérica (`chat_template-v22.5.3-sharper.jinja` + `-oneline.txt`) |
| Modelo base | `froggeric/Qwen-Fixed-Chat-Templates` (relación declarada: `finetune`) |
| Librería declarada | `mlx` |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-17 / 2026-09-17 |

## Arquitectura y entrenamiento

No existe entrenamiento en el sentido habitual. El repositorio contiene una plantilla Jinja que el servidor de inferencia ejecuta para transformar una lista de mensajes (sistema, usuario, asistente, herramienta) en una cadena de texto que después tokeniza el modelo. La construcción es reproducible: `build/merge_tturbo_sharper.py` genera el fichero servido a partir de la plantilla base más un donante identificado por su hash, `build/patch_v22_5_4.py` aplica el parche de versión y `scripts/probe_v22_5_4.py` lo sondea. El repositorio conserva además `verify_template.py`, que comprueba que los renders sin espacios en blanco son idénticos a la base fuera de los 13 hunks modificados.

Los cambios técnicos declarados son: aislamiento siempre activo del contenido de herramientas (tratar `<tool_response>`, código de usuario y etiquetas Jinja embebidas o `<|im_*>` como datos no confiables, nunca como instrucciones, y prohibir copiarlas literalmente dentro de `<tool_call><parameter>`); cola de verificación previa a la respuesta final que valida tipos de argumentos (los `int`/`float` deben ser numéricos, si no, cadena); acotado de argumentos y respuestas de herramientas con truncado; bloque de sistema abreviado; y «steering» de razonamiento con cinco líneas de control en el nivel `xhigh` (por ejemplo, «No claim without falsification») y tres pasos de cebado en `medium`, solo en la ruta de pensamiento. Un puente de alias mapea las familias `high`→`xhigh`, `minimal`→`low` y `none`/`off`→vacío. También se ajustan las etiquetas `{% %}` del bloque `{REASON:}` para eliminar el sangrado de aproximadamente 12 líneas en blanco por render, lo que supone −26 B de contaminación de tokens por render.

## Capacidades

- Formateo de conversaciones multi-turno (sistema, usuario, asistente, herramienta) para modelos Qwen, con rutas separadas para modo pensamiento activado y desactivado.
- Soporte de tool calling: emisión y parseo de bloques `<tool_call>` y `<parameter>`, con aislamiento del contenido de `<tool_response>` frente a inyección de instrucciones.
- Cola de verificación de argumentos: validación de tipos antes de la respuesta final, con regla explícita para parámetros `int`/`float`.
- Acotado de payloads de herramientas: truncado a 2000 caracteres por argumento y 8000 por respuesta, con exención de cargas JSON; se puede desactivar pasando `0` mediante `chat_template_kwargs`.
- Modos DAU del modelo destino preservados literalmente: `einstein` y `spoon`, con etiquetas `{REASON:}` e `{iREASON:}`.
- Puente de alias para niveles de razonamiento (`high`→`xhigh`, `minimal`→`low`, `none`/`off`→vacío).
- Guiado de razonamiento en `xhigh` y `medium` únicamente en la ruta de pensamiento; la ruta rápida no referencia `<think>` cuando `enable_thinking=false`.
- Eficiencia de tokens: bloque de sistema condensado (–40 % de caracteres en la variante rápida, −2 palabras en la variante de pensamiento) y eliminación de líneas en blanco generadas por el parser.
- Compatibilidad declarada con MLX, llama.cpp, LM Studio, vLLM y SGLang.
- Capacidades multimodales o de audio: no disponibles.

## Casos de uso

- Despliegue de Qwen3.8-27B Twin-Turbo en vLLM o SGLang: el repositorio proporciona el fichero `chat_template.jinja` que el servidor debe cargar para que los mensajes se serialicen con el formato esperado, incluidos los modos DAU y las rutas de pensamiento. Es adecuado porque la plantilla está construida sobre la plantilla propia del modelo, no sobre una genérica.
- Endurecimiento de agentes con tool calling: en pipelines donde el modelo invoca funciones externas, el aislamiento siempre activo impide que una respuesta de herramienta que contenga `</tool_call>`, `{{ }}` o etiquetas `<|im_*>` se interprete como instrucción y secuestre la conversación.
- Parsers de producción resistentes a payloads grandes: con el truncado a 2000/8000 caracteres, una respuesta voluminosa de una API externa no se copia literalmente dentro de un parámetro `float` ni rompe el validador de esquema posterior.
- Integración en LM Studio o llama.cpp para uso local: el fichero `-oneline.txt` permite pegar la plantilla como cadena de una sola línea en la interfaz de configuración de estos motores sin problemas de indentación.
- Servicio en Apple Silicon vía MLX: la librería declarada es `mlx`, de modo que la plantilla está pensada para cargarse en flujos de inferencia locales sobre hardware Apple.
- Reducción de coste por token en aplicaciones de chat: la condensación del bloque de sistema y la eliminación de las líneas en blanco del parser recortan tokens en cada turno, algo que se acumula en conversaciones largas y de alto volumen.
- Reproducción y auditoría de plantillas en CI: los scripts de construcción y verificación permiten regenerar el fichero servido byte a byte y comprobar que los renders solo difieren de la base en los 13 hunks declarados.
- Estandarización de formatos entre la línea genérica y la Twin-Turbo: la variante genérica (`v22.5.3-sharper`) permite aplicar el mismo endurecimiento a otros modelos Qwen3.5/3.8 que usen plantillas de stock, evitando divergencias de comportamiento entre despliegues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de precisión de tool calling. Las únicas métricas reportadas son de construcción y verificación de plantilla: 13 hunks modificados con anclas de aserción, paridad byte a byte de los renders sin espacios fuera de esos hunks, −26 B de contaminación de tokens por render y −2 palabras / −40 % de caracteres en los bloques de sistema de las rutas de pensamiento y rápida respectivamente.

## Requisitos de hardware

- VRAM para este repositorio: no aplica. Es un conjunto de plantillas de texto; su ejecución consume CPU y ocurre antes de la inferencia, sin requisitos de GPU.
- Modelo destino (Qwen3.8-27B Twin-Turbo): el repositorio no publica requisitos ni mediciones. Las cifras habituales para un modelo denso de ~27 000 millones de parámetros serían del orden de 54 GB en fp16 y 15-16 GB en cuantización de 4 bits, pero se trata de una estimación aritmética, no de un dato publicado en la información disponible.
- GPU recomendadas: no disponibles para este repositorio. Para el modelo destino, los requisitos dependerían de la cuantización elegida.
- Compatibilidad con GPU de consumo: no disponible; depende del modelo y la cuantización, no de la plantilla.
- Opciones de despliegue: vLLM, SGLang, llama.cpp, LM Studio y MLX, según las etiquetas del repositorio. La plantilla se carga como `chat_template` personalizada o se coloca junto a los pesos del modelo destino.
- Latencia y throughput: no disponibles. El impacto de la plantilla es indirecto, vía número de tokens del prompt; la reducción declarada de tokens por render es una estimación cualitativa, sin medición de throughput publicada.

## Comparativa con modelos similares

La comparación natural es con otras plantillas de chat, no con modelos de lenguaje.

| Alternativa | Tipo | Base | Ámbito de aplicación | Diferencias declaradas | Licencia |
|---|---|---|---|---|---|
| Este repositorio (Twin-Turbo, `v22.5.4-sharper-tturbo`) | Plantilla Jinja endurecida | `chat_template-tturbo-v2.jinja` del propio modelo (v22.5.0-DAU) | Qwen3.8-27B Twin-Turbo únicamente | Aislamiento de herramientas siempre activo, cola de verificación, límites 2000/8000, parser sin líneas en blanco | apache-2.0 |
| `moeshawky/Qwen-Sharper-Chat-Templates` (línea genérica, `v22.5.3-sharper`) | Plantilla Jinja endurecida | Plantilla de stock de froggeric v22.5 | Cualquier Qwen3.5/3.8 con plantillas de stock | Sin modos DAU; conserva el fallback «silent-medium» de la base | apache-2.0 (según la línea genérica) |
| `froggeric/Qwen-Fixed-Chat-Templates` | Plantilla Jinja base | No disponible | Familia Qwen | Modelo base declarado de este repositorio; sin las capas de aislamiento y verificación | no disponible en la información proporcionada |
| Plantilla propia `chat_template-tturbo-v2.jinja` (v22.5.0-DAU) | Plantilla Jinja base | — | Qwen3.8-27B Twin-Turbo | Sin aislamiento de herramientas, sin cola de verificación y con argumentos de herramienta sin acotar | no disponible |

No se ha encontrado en la búsqueda web ningún modelo o plantilla comparable adicional.

## Limitaciones y advertencias

- Ámbito restringido: la variante Twin-Turbo está declarada como exclusiva de Qwen3.8-27B Twin-Turbo. El propio autor advierte de no aplicarla a otras arquitecturas.
- Sin validación comunitaria: 0 descargas y 0 likes, repositorio creado y actualizado el mismo día, lo que implica ausencia de revisión externa o de uso en producción documentado.
- Verificabilidad limitada: las afirmaciones de la model card remiten a líneas concretas de fichero, scripts de construcción y salidas capturadas, pero esos artefactos no se han podido comprobar de forma independiente con la información disponible.
- Riesgo de degradación silenciosa: una plantilla incorrecta no produce errores de carga evidentes, sino salidas mal formateadas, tool calling roto o inyección de contenido; conviene validar con renders de prueba antes de servir.
- Límites de truncado activos por defecto: 2000 caracteres por argumento y 8000 por respuesta pueden cortar payloads legítimamente grandes; hay que pasar `0` vía `chat_template_kwargs` si se necesita desactivarlos.
- Idiomas: los metadatos declaran únicamente `en`. No hay evidencia de comportamiento validado en castellano ni en otros idiomas.
- Etiquetas de versión no verificables: los tags mencionan `qwen3.5`, `qwen3.6` y `qwen3.8`; no se ha podido confirmar su existencia ni sus especificaciones con las fuentes consultadas.
- Licencia: la plantilla se distribuye bajo apache-2.0, permisiva para uso comercial, pero la licencia de los pesos del modelo destino es independiente y debe comprobarse por separado.
- Ausencia de benchmarks: no hay datos de precisión, robustez frente a inyección ni latencia que respalden las mejoras declaradas.
- La búsqueda web realizada no devolvió resultados relevantes sobre este repositorio, el autor ni los modelos Qwen citados; los resultados obtenidos correspondían a páginas de un hotel y no guardan relación con el contenido.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/moeshawky/Qwen-Sharper-TwinTurbo-Chat-Templates
- Modelo base declarado: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Línea genérica de plantillas del mismo autor: https://huggingface.co/moeshawky/Qwen-Sharper-Chat-Templates
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
