# A9Labs/microtensor_ctx_compress-granite

## Resumen

A9Labs/microtensor_ctx_compress-granite es una submission al entorno de evaluación Microtensor arena, concretamente a la tarea `ctx_compress-granite` (testnet, netuid 576) con perfil de hardware P1. No se trata de un modelo base entrenado desde cero, sino de un sistema compuesto (harness) que orquesta llamadas a un modelo subyacente alojado en `A9Labs/mt_slm_ctx_compress-granite`, cuyo commit y digests de ficheros quedan fijados mediante un `manifest.json`. La tarea consiste en comprimir sesiones de trabajo largas en un resumen estructurado de nueve epígrafes, preservando ficheros, errores, nombres y estado en el punto de corte.

El sistema combina un primer paso generativo completo con el prompt de la arena, seguido de una reparación determinista que elimina bucles de frases, restaura epígrafes faltantes o desordenados, recupera texto previo al primer encabezado, elimina identificadores que no aparecen en la sesión y añade información omitida (ficheros, errores, nombres y estado del corte) ajustándose al presupuesto de tokens. Si la primera llamada falla, se reintenta; si la reparación determinista conserva demasiado poco del modelo, se hace una pasada de reparación sobre el borrador.

El componente diferencial es un router (`none` sequence classifier con una única logit, etiqueta `draft_correct`) que decide si el borrador es correcto a partir del final de la sesión y del resumen, dentro de una ventana de 4096 tokens. Solo si se baja del umbral del router se escala a `claude-haiku-5-5` a través de un relay, enviando las secciones fallidas, los errores del verificador, los hechos de la sesión y los últimos 16000 caracteres. El harness nunca trocea la sesión, hace como máximo dos llamadas al modelo por ítem y siempre devuelve los nueve epígrafes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (sistema compuesto: harness + modelo subyacente `A9Labs/mt_slm_ctx_compress-granite` + router sequence classifier + escalado a `claude-haiku-5-5`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe un MoE) |
| Longitud de contexto | no disponible para el modelo subyacente; el router opera sobre 4096 tokens; el escalado envía los últimos 16000 caracteres de la sesión |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el `manifest.json` fija revisión y digests de ficheros del modelo subyacente) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo subyacente (`A9Labs/mt_slm_ctx_compress-granite`): no se indica si es un transformer denso, MoE o híbrido, ni el número de parámetros, capas o cabezas de atención. Lo que sí se documenta es la arquitectura del sistema de submission: un harness que ejecuta una pasada completa con el prompt de la arena, aplica reparación determinista (corte de bucles de frases, restauración de encabezados en orden, recuperación de texto previo al primer encabezado, eliminación de identificadores ausentes en la sesión, incorporación de ficheros, errores y nombres omitidos, y ajuste al presupuesto de tokens) y, opcionalmente, una segunda llamada al modelo.

El router es un clasificador de secuencias `none` con una sola logit (`draft_correct`) que recibe el final de la sesión seguido del resumen dentro de 4096 tokens. El escalado a `claude-haiku-5-5` se activa únicamente por debajo del umbral del router y se canaliza mediante un relay, enviando las secciones fallidas, los errores del verificador, los hechos de la sesión y los últimos 16000 caracteres. No se especifican datos de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) ni innovaciones como decodificación especulativa o atención lineal. El harness trata las instrucciones dentro de la sesión como contenido, no como instrucciones a ejecutar.

## Capacidades

- Compresión de contexto: resume sesiones largas en un formato fijo de nueve epígrafes, sin trocear la sesión.
- Preservación de entidades: mantiene ficheros, errores, nombres y estado en el punto de corte, y elimina identificadores que no aparecen en la sesión.
- Reparación determinista: corrige bucles de frases, restaura epígrafes faltantes o desordenados y recupera texto escrito antes del primer encabezado.
- Verificación y escalado: un router decide si el borrador es correcto; si no, se escala a `claude-haiku-5-5` con contexto adicional.
- Reintento controlado: como máximo dos llamadas al modelo por ítem, con reintento completo si la primera falla.
- Robustez ante inyección de instrucciones: las instrucciones dentro de la sesión se tratan como contenido.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio, matemáticas o código más allá de la tarea de compresión.

## Casos de uso

- Resumen de sesiones de depuración: el sistema condensa transcripciones largas de sesiones de desarrollo en un resumen estructurado que conserva ficheros tocados, errores encontrados y estado en el punto de corte, útil para traspasar contexto entre turnos o entre ingenieros.
- Traspaso de contexto entre agentes: al fijar los nueve epígrafes y el estado del corte, permite que un agente posterior retome una tarea sin releer la sesión completa, reduciendo el consumo de tokens.
- Registro de incidencias en producción: a partir de logs de sesión, extrae errores, nombres y ficheros implicados en un formato estable que puede indexarse o adjuntarse a un ticket.
- Auditoría de sesiones largas: la reparación determinista y el verificador permiten generar resúmenes reproducibles y comprobables, adecuados para revisión posterior.
- Pipeline de evaluación de modelos: la submission sirve como referencia para comparar estrategias de compresión de contexto en la arena Microtensor (testnet, netuid 576, perfil P1).
- Control de coste mediante enrutado: el router evita llamadas al modelo de escalado (`claude-haiku-5-5`) cuando el borrador es correcto, lo que reduce coste y latencia en volúmenes altos.
- Integración en herramientas de desarrollo: el harness puede envolverse en un servicio que reciba una sesión y devuelva el resumen de nueve epígrafes, con límite de dos llamadas al modelo por ítem.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifican parámetros ni cuantizaciones del modelo subyacente).
- GPU recomendadas: no disponible. El perfil de hardware de la arena es P1, pero no se detalla su composición.
- Cabe en GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan (no se mencionan vLLM, llama.cpp, Ollama ni TGI). El sistema requiere el harness, el modelo subyacente fijado por `manifest.json`, el router y, opcionalmente, acceso a `claude-haiku-5-5` mediante relay.
- Latencia y throughput: no disponibles. Como referencia de diseño, el harness limita a dos llamadas al modelo por ítem y el router opera sobre 4096 tokens.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (compresión de contexto) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Información muy escasa: no se publican parámetros, contexto, licencia, idiomas ni formato de pesos, lo que impide evaluar el modelo subyacente de forma independiente.
- Dependencia de un modelo externo: el escalado usa `claude-haiku-5-5` a través de un relay, lo que introduce dependencia de un servicio de terceros, coste y posibles restricciones de uso.
- Licencia no disponible: no puede confirmarse el uso comercial del modelo subyacente ni de los componentes.
- Formato de salida rígido: el sistema siempre devuelve nueve epígrafes, lo que puede no encajar en dominios donde la sesión no cubre todas las categorías.
- Límite de dos llamadas por ítem: sesiones muy largas o complejas pueden no resolverse si la reparación determinista y el reintento no bastan y el router no escala.
- Riesgo de alucinación: aunque se eliminan identificadores ausentes y se añaden hechos de la sesión, el resumen generado puede contener imprecisiones; el verificador y el router mitigan pero no eliminan este riesgo.
- Idiomas no documentados: no puede garantizarse un rendimiento adecuado fuera del idioma o idiomas de entrenamiento.
- Sin datos de benchmarks: no hay evidencia publicada de calidad frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/A9Labs/microtensor_ctx_compress-granite
- Modelo subyacente referenciado: `A9Labs/mt_slm_ctx_compress-granite` (no se proporciona URL directa)
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales.
