# peculiar-ragdoll/Sharp-LFM2.5-Chat-Templates

` en lugar del último
- Replay del razonamiento con etiqueta de apertura `<think>`
- Adjuntos: `[image omitted]`, `[attachment omitted]`, partes Responses-API `input_text`/`output_text` renderizadas como texto
- No cambia: tokens de control, codificacion Pythonic de tool calls, `<think>` preabierto, kwarg `preserve_thinking`, hooks `{% generation %}` y continue-final-message, error en argumentos de herramienta como string JSON
- Con sin system prompt, sin herramientas y terseness off, render byte-identico al stock en 18 formas de conversacion.

Sharp prompt: appended after user system prompt, before tool list; text is word-for-word that of Qwen Sharp template v22.5.0; only "after thinking" lead used because LFM2.5 always thinks.

Pythonic tool-call encoding example: `<|tool_call_start|>[get_weather(city='Oslo')]`.

Capacidades bullets:
- Sustitución directa (drop-in) de la plantilla oficial
- Mapeo de rol developer a system, relevante para clientes Codex/Responses API
- Manejo correcto de trazas de razonamiento en replays
- Conserva la codificación Pythonic de llamadas a herramientas
- Prompt de concision "Sharp" que no reemplaza el system prompt del usuario
- Omision de adjuntos no soportados
- Verificacion bidireccional con check_template.py
- Compatibilidad con llama.cpp, vLLM, MLX, transformers
- No tiene capacidades de generacion propias

Casos de uso (min 6):
1. Servir LFM2.5-24B-A2B detrás de la Responses API de OpenAI (Codex) — developer role.
2. Agentes con historial largo de razonamiento — evitar truncado de respuestas que mencionan </think>.
3. Reducir coste de tokens en producción con el prompt Sharp (sin datos medidos aún). Hmm — careful, no token savings claim. Frame as "candidato a evaluar", note no measured claims.
4. Pipelines que reproducen salidas crudas del modelo (reasoning-format none).
5. Servicios multimodales de fachada que reciben adjuntos por error.
6. Despliegue en MLX en Apple Silicon con mlx-lm.
7. Evaluación comparativa entre familias (Qwen vs LFM) con prompt de terseness idéntico.
8. Integración en llama.cpp / vLLM.

Benchmarks: no published. Mention external Claw-Eval on Qwen: +7.4 answer score, −59% answer tokens; explicitly different family; the author says an on/off run is set up.

Requisitos de hardware: template itself negligible; base model requirements not available; the README mentions verification on vendor Q4_K_M GGUF. Mention that a 24B Q4_K_M GGUF is roughly ~15 GB (arithmetic estimate). Deployment: llama.cpp, vLLM, MLX servers, transformers. Latency/throughput not available.

Comparativa: table with 3 columns: Sharp-LFM2.5-Chat-Templates, plantilla oficial de Liquid (stock) para LFM2.5, Qwen-Sharp-Chat-Templates. Rows: modelo objetivo, rol developer, truncado de </think>, replay de razonamiento, adjuntos, prompt de concision, licencia, verificacion.

Limitaciones:
- No es un modelo
- Efecto no medido en LFM2.5 (token savings no reclamados)
- Licencia lfm1.0 — revisar términos de Liquid AI para uso comercial
- 0 descargas, 14 likes, sin pipeline declarado
- Es un artefacto de un tercero no oficial de Liquid AI — riesgo de mantenimiento, fechas
- El prompt Sharp altera la verbosidad; puede eliminar matices? Careful — its own claim is that it preserves essentials. I can note that risk exists and hasn't been audited on this model.
- Compatibilidad: verificado en Q4_K_M GGUF; otros cuantizaciones/servidores no verificados.
- Las plantillas solo afectan al renderizado; no corrigen errores del modelo.
- Idiomas: no disponibles; el prompt Sharp está en inglés, lo que puede orientar el idioma de la respuesta.
- Posible riesgo: si se sirve con clientes que envían image_url legítimos para otro modelo, se omiten silenciosamente.

Enlaces: HF repo, base model LiquidAI/LFM2.5-24B-A2B, Qwen-Sharp-Chat-Templates, perfil del autor, listado de finetunes del base model, LICENSE file, SAVRN sitemap? That's peripheral. I'll include the relevant ones. Also the HF models filtered by mlx used to find it. I'll include a couple.

Now the dates: 2026. I'll write "14 de octubre de 2026".

Careful about "Solo la primera palabra de los titulos va en mayuscula" — table headers too? Probably applies to headings. I'll keep table headers lowercase-first as normal ("Parametro", "Valor" — "Parametro" is one word). Fine.

Let me write the final markdown.## Resumen

Sharp-LFM2.5-Chat-Templates no es un modelo de lenguaje, sino un repositorio de plantilla de chat Jinja pensado como sustituto directo (drop-in) de la plantilla oficial de LiquidAI/LFM2.5-24B-A2B. Lo publica el usuario peculiar-ragdoll (Saga) y corrige cuatro errores de renderizado de la plantilla original de Liquid AI, además de añadir un prompt de concision denominado Sharp. El repositorio se creó y actualizó el 14 de octubre de 2026, acumula 0 descargas y 14 likes, y se distribuye bajo licencia lfm1.0.

El problema que resuelve es de integración, no de capacidad del modelo. La plantilla original renderiza el rol `developer` (que envían clientes modernos de OpenAI como Codex o cualquier cliente de la Responses API) como un rol para el que el modelo no fue entrenado; además trunca turnos de asistente que contienen la cadena `</think>`, reproduce trazas de razonamiento sin su etiqueta de apertura y filtra adjuntos multimodales como JSON crudo con payload base64, incluyendo el token especial `<image>` en un modelo estrictamente de texto.

El autor mantiene sin tocar los elementos propios de LFM2.5: tokens de control, codificación Pythonic de llamadas a herramientas, `<think>` preabierto en el prompt de generación, el kwarg `preserve_thinking` y los hooks de transformers. La verificación se ha realizado contra el GGUF `LFM2.5-24B-A2B-Q4_K_M.gguf` del proveedor, y el repositorio declara explícitamente que el efecto del prompt de concision sobre LFM2.5 aún no se ha medido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Tipo de artefacto | Plantilla de chat Jinja con prompt de sistema adicional (no contiene pesos) |
| Arquitectura | No aplica al artefacto. Modelo objetivo: LiquidAI/LFM2.5-24B-A2B (familia LFM2.5 de Liquid AI); detalles de arquitectura del modelo base no disponibles en la informacion proporcionada |
| Parametros totales | No aplica (la plantilla no tiene parametros). El modelo objetivo se denomina 24B en su identificador |
| Parametros activos | No aplica. El sufijo A2B del modelo objetivo sugiere 2B activos, dato no confirmado en la informacion disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No aplica (sin pesos). Verificado sobre LFM2.5-24B-A2B-Q4_K_M.gguf |
| Idiomas soportados | No disponible |
| Licencia | lfm1.0 (declarada como `license: other` con `license_name: lfm1.0`) |
| Formato de pesos | No aplica; el repositorio contiene plantilla Jinja, no safetensors ni GGUF |
| Modelo base | LiquidAI/LFM2.5-24B-A2B (relacion declarada: finetune) |
| Libreria declarada | mlx |
| Compatibilidad declarada | llama.cpp, vLLM, MLX, transformers |
| Script de verificacion | `check_template.py` (comprobacion bidireccional) |
| Descargas / likes | 0 descargas / 14 likes |
| Fechas | Creado el 14 de octubre de 2026; actualizado el 14 de octubre de 2026 |

## Arquitectura y entrenamiento

No hay entrenamiento ni pesos: el artefacto es una plantilla Jinja que transforma la lista de mensajes en el prompt que consume LFM2.5-24B-A2B. Funcionalmente implementa cuatro correcciones sobre la plantilla de Liquid AI. Primero, mapea el rol `developer` a `system` (`<|im_start|>system\n...`), algo que llama.cpp ya remapea por su cuenta antes de renderizar pero que transformers, vLLM y los servidores MLX no hacen. Segundo, cambia el truncado de turnos de asistente: la plantilla original corta en el **último** `</think>` que encuentra, de modo que una respuesta que simplemente menciona la etiqueta pierde todo el texto anterior; la nueva corta en el **primer** `</think>`, y si la traza llega a la vez inline y en `reasoning_content` no se renderiza dos veces.

Tercero, al reproducir salidas crudas del modelo (`--reasoning-format none` o clientes que almacenan `content` tal cual) se añade la etiqueta de apertura `<think>`, que la plantilla original omitía porque el prompt de generación ya la abre. Cuarto, los adjuntos dejan de inyectarse en el prompt: las partes `image_url` se sustituyen por `[image omitted]`, audio, vídeo y ficheros por `[attachment omitted]`, y las partes `input_text`/`output_text` de la Responses API se renderizan como texto en lugar de como JSON. La plantilla no modifica los tokens de control, la codificación Pythonic de tool calls —del estilo `<|tool_call_start|>[get_weather(city='Oslo')]`—, el `<think>` preabierto, el kwarg `preserve_thinking`, los hooks `{% generation %}` ni el error ante argumentos de herramienta en forma de string JSON. Con system prompt vacío, sin herramientas y con el prompt Sharp desactivado, el render es byte a byte idéntico al de Liquid en 18 formas de conversación distintas.

El prompt Sharp se añade después del system prompt del usuario y antes de la lista de herramientas, sin reemplazar nada de lo que este envíe. Su texto es literalmente el de la plantilla Qwen Sharp v22.5.0 del mismo autor, con la única variante del encabezado «after thinking», porque LFM2.5 siempre razona. Impone respuestas que empiezan por la respuesta y prohíben preámbulos, reformulaciones de la pregunta y muletillas, conservando pasos esenciales, advertencias e incertidumbres.

## Capacidades

- Sustitucion directa de la plantilla de chat oficial de LFM2.5-24B-A2B sin cambios en el resto del stack.
- Interpretacion correcta del rol `developer`, lo que permite servir el modelo detras de clientes de OpenAI Responses API y de Codex.
- Reproduccion fiel de historiales que contienen `</think>` sin truncar el contenido del turno.
- Reproduccion de trazas de razonamiento crudas con etiqueta de apertura `<think>`, sin etiquetas de cierre huerfanas.
- Conservacion integra de la codificacion Pythonic de llamadas a herramientas y del flujo de tool calling de LFM2.5.
- Insercion de un prompt de concision configurable, apilado sobre el system prompt del usuario.
- Saneado de adjuntos no soportados por un modelo de texto: sustitucion por marcadores en lugar de fuga de base64 o del token especial `<image>`.
- Modo de razonamiento preservado mediante `preserve_thinking` y los hooks de transformers, sin alteraciones.
- Verificacion automatica bidireccional con `check_template.py`.

## Casos de uso

- Servicio de LFM2.5-24B-A2B detras de la Responses API de OpenAI: los clientes modernos entregan el system prompt con rol `developer`; esta plantilla lo convierte en `system` sin parchear el servidor de inferencia (transformers, vLLM o MLX).
- Agentes con historial largo de razonamiento: en tareas de varios pasos donde el asistente explica como cerrar un bloque de pensamiento, la plantilla stock recortaba la respuesta al ultimo `</think>`; aqui el turno se reproduce completo.
- Pipelines de depuracion que registran la salida cruda del modelo: al reproducir el contenido tal cual, se evita la etiqueta `</think>` huerfana que rompe analizadores posteriores.
- Pasarelas multimodales de fachada: si un cliente envia `image_url` a un modelo de texto, la plantilla lo sustituye por `[image omitted]` en vez de inyectar base64 en el prompt y consumir contexto.
- Estandarizacion de estilo de respuesta en produccion: el prompt Sharp se apila al system prompt propio para reducir preambulos, con la advertencia de que el ahorro de tokens no esta medido en este modelo.
- Evaluacion cruzada entre familias: al compartir texto literal con Qwen-Sharp-Chat-Templates, permite comparar LFM2.5 y Qwen bajo el mismo prompt de concision.
- Despliegue en Apple Silicon: la etiqueta principal del repositorio es mlx, por lo que encaja en servidores MLX sobre macOS.
- Integracion en llama.cpp y vLLM: la plantilla esta pensada para esos runners, aunque llama.cpp ya remapea por su cuenta el rol `developer`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica de forma explicita que la version 1.0.0 esta verificada en compatibilidad pero que su efecto no se ha medido todavia, y que tiene preparada una ejecucion de Claw-Eval con el prompt de concision activado y desactivado. Hasta que se publique, la model card no reclama ningun ahorro de tokens ni mejora de precision para LFM2.5.

Como referencia externa y explicitamente atribuida a otra familia de modelos, el mismo prompt aplicado a Qwen midio +7,4 puntos de puntuacion de respuesta y -59 % de tokens de respuesta en Claw-Eval. Ese dato no es extrapolable a LFM2.5.

| Metrica | Sharp-LFM2.5 | Referencia Qwen Sharp | Nota |
|---|---|---|---|
| Claw-Eval (puntuacion) | No medido | +7,4 | Familia distinta, no extrapolable |
| Claw-Eval (tokens de respuesta) | No medido | -59 % | Familia distinta, no extrapolable |
| Identidad de render con system vacio, sin tools y terseness off | Byte a byte igual al stock | No aplica | 18 formas de conversacion |
| Compatibilidad con `LFM2.5-24B-A2B-Q4_K_M.gguf` | Verificada | No aplica | Segun el autor |

## Requisitos de hardware

- La plantilla en si no consume VRAM ni GPU: se ejecuta como Jinja en el cliente de inferencia, en CPU y con coste despreciable.
- Los requisitos reales son los de LFM2.5-24B-A2B. El fabricante publica al menos un GGUF cuantizado Q4_K_M, mencionado en la propia model card, pero no se dispone de cifras oficiales de VRAM en la informacion proporcionada.
- Estimacion aritmetica, no verificada: un Q4_K_M de un modelo de 24 000 millones de parametros ocupa en torno a 14-15 GB de fichero, a lo que hay que sumar el contexto activo y el overhead del runtime; un modelo con 2B parametros activos tendria un coste de computo por token propio de esa escala.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Encaje en GPU de consumo: no confirmado. Por tamano de pesos, una GPU de 24 GB de VRAM queda al limite para Q4_K_M con contexto corto, y una de 16 GB exigiria cuantizaciones mas agresivas.
- Opciones de despliegue: llama.cpp, vLLM, servidores MLX y transformers, segun los propios tags y la descripcion del repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Al tratarse de una plantilla de chat, la comparacion relevante es con otras plantillas, no con pesos.

| Criterio | Sharp-LFM2.5-Chat-Templates | Plantilla oficial de Liquid para LFM2.5 | Qwen-Sharp-Chat-Templates |
|---|---|---|---|
| Modelo objetivo | LFM2.5-24B-A2B | LFM2.5-24B-A2B | Familia Qwen |
| Rol `developer` | Remapeado a `system` | Renderizado como rol desconocido | Remapeado |
| Truncado ante `</think>` | Corta en el primer `</think>` | Corta en el ultimo `</think>` | Equivalente al de Sharp |
| Replay de razonamiento crudo | Anade `<think>` de apertura | Etiqueta de cierre huerfana | Equivalente al de Sharp |
| Adjuntos | `[image omitted]` / `[attachment omitted]` | JSON crudo con base64 y token `<image>` | Equivalente al de Sharp |
| Prompt de concision | Sharp, encabezado «after thinking» | No incluye | Sharp v22.5.0 |
| Licencia | lfm1.0 | La del modelo LFM2.5 | No disponible |
| Efecto medido en su modelo | No medido | No aplica | +7,4 y -59 % en Claw-Eval |

## Limitaciones y advertencias

- No es un modelo: no genera texto ni aporta capacidades nuevas. Solo cambia como se serializan los mensajes antes de la inferencia.
- El efecto del prompt Sharp sobre LFM2.5 no esta medido; el autor no reclama ahorro de tokens ni mejora de precision en esta familia.
- La verificacion se realizo sobre el GGUF Q4_K_M del proveedor; no consta validacion sobre otras cuantizaciones, sobre pesos originales ni sobre todos los runners.
- Licencia lfm1.0: es una licencia propia, no una licencia open source estandar, por lo que conviene revisar sus condiciones antes de un uso comercial, especialmente en productos derivados.
- Artefacto de un tercero no oficial de Liquid AI, con 0 descargas registradas; no hay garantia de mantenimiento ni de actualizacion frente a cambios en la plantilla original.
- El prompt Sharp esta redactado en ingles e impone un estilo concreto; puede desplazar el idioma de la respuesta o suprimir matices que el usuario esperaba.
- La omision de adjuntos es silenciosa desde el punto de vista del modelo: si un cliente envia una imagen esperando comprension visual, recibira una respuesta textual sin aviso explicito en la salida.
- Las plantillas de chat no corrigen sesgos, alucinaciones ni errores de razonamiento del modelo subyacente; esos riesgos siguen siendo los de LFM2.5-24B-A2B y no se documentan aqui por falta de datos.
- El repositorio no declara idiomas soportados ni pipeline, y no incluye datos de rendimiento propios.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/peculiar-ragdoll/Sharp-LFM2.5-Chat-Templates
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Plantilla equivalente para Qwen: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Perfil del autor: https://huggingface.co/peculiar-ragdoll
- Listado de finetunes de LFM2.5-24B-A2B: https://huggingface.co/models?other=base_model:finetune:LiquidAI/LFM2.5-24B-A2B
- Listado de modelos con etiqueta mlx: https://huggingface.co/models?other=mlx
- Fichero de licencia del repositorio: LICENSE (en el propio repositorio de HuggingFace)
