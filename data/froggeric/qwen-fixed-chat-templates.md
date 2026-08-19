# froggeric/Qwen-Fixed-Chat-Templates

## Resumen

`froggeric/Qwen-Fixed-Chat-Templates` no es un modelo de lenguaje, sino un repositorio de plantillas Jinja de chat diseñadas para corregir errores graves en las plantillas oficiales de los modelos Qwen 3.5, 3.6 y 3.8. Desarrollado por el usuario froggeric, este artefacto resuelve problemas de renderizado, invalidación de caché KV, desperdicio de tokens, inyección de bloques de razonamiento vacíos y bloqueos en flujos agénticos que afectan a la inferencia local y a los pipelines de agentes.

La versión actual (v22) añade soporte completo para la generación Qwen 3.8, incluyendo el control de presupuesto de razonamiento (`reasoning_effort`), la restauración del modo rápido sin razonamiento y la corrección del bug de "empty think" que duplicaba bloques vacíos en conversaciones multi-turno. El repositorio es un único archivo `chat_template.jinja` que funciona como reemplazo directo en LM Studio, llama.cpp, vLLM, MLX, oMLX, KoboldCPP y cualquier motor que soporte plantillas Jinja de HuggingFace.

Su relevancia radica en que las plantillas oficiales de Qwen contienen lógica específica de Python que falla en motores C++ como llama.cpp, y restricciones que rompen flujos de tool calling y agentes. Esta plantilla unificada elimina esas barreras, permitiendo a los desarrolladores desplegar modelos Qwen 3.5/3.6/3.8 con todas sus capacidades de razonamiento y llamada a herramientas sin parches adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Tipo de artefacto | Plantilla Jinja de chat (no es un modelo de pesos) |
| Version | v22 (2026-08-13) |
| Modelos compatibles | Qwen 3.5, Qwen 3.6, Qwen 3.8 (todas las tallas) |
| Arquitectura | Plantilla Jinja compatible con minijinja (sin filtros Python) |
| Parametros totales | No aplica (no contiene pesos) |
| Longitud de contexto | No aplica (depende del modelo Qwen subyacente) |
| Motores soportados | LM Studio, llama.cpp, vLLM, MLX, oMLX, KoboldCPP, cualquier motor con soporte Jinja de HuggingFace |
| Funcionalidades clave | Tool calling, razonamiento (thinking), control de esfuerzo de razonamiento, modo rapido sin razonamiento |
| Licencia | Apache 2.0 |
| Formato de distribucion | Archivo `chat_template.jinja` (texto plano) y `chat_template_oneline.txt` |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino una plantilla de serializacion de conversaciones escrita en Jinja. Su "arquitectura" es la estructura de la plantilla en si: un arbol de sintaxis abstracta (AST) aplanado que evita el anidamiento profundo, lo que reduce la caida de rendimiento en llama.cpp (el autor afirma que el anidamiento profundo de las plantillas oficiales reduce la velocidad hasta en un 80%). Todos los filtros estan reescritos para ser 100% compatibles con minijinja, el motor de plantillas de llama.cpp, eliminando la dependencia de funciones Python.

No hay datos de entrenamiento ni proceso de RLHF/DPO. La "innovacion tecnica" es el diseno de la plantilla: mantiene un historial cronologico estricto para lograr una tasa de acierto del 100% en la caché KV, extrae bloques de razonamiento de forma limpia sin duplicar etiquetas, y maneja argumentos de herramientas tanto como diccionarios Python como cadenas JSON (el formato estandar de OpenAI y Ollama). La version v22 incorpora ademas el soporte nativo del flag `--reasoning-preserve` de llama.cpp mediante el alias `preserve_reasoning`.

## Capacidades

- Correccion de errores de renderizado en las plantillas oficiales de Qwen 3.5, 3.6 y 3.8, incluyendo el bloqueo fatal cuando se pasa `enable_thinking=false` en Qwen 3.8.
- Control de presupuesto de razonamiento (`reasoning_effort`) con niveles `xhigh` (por defecto), `high`, `medium` y `low`, inyectando las instrucciones oficiales en el prompt de sistema.
- Restauracion del modo rapido sin razonamiento, permitiendo desactivar el thinking via kwargs o con la etiqueta inline `<|think_off|>`.
- Extraccion limpia de bloques de razonamiento en conversaciones multi-turno, eliminando el "empty think poisoning" que inyectaba bloques vacios y sesgaba al modelo hacia no llamar a herramientas.
- Soporte universal de argumentos de herramientas: acepta tanto diccionarios Python como cadenas JSON y argumentos escalares, evitando el error `TypeError: Can only get item pairs from a mapping` de la plantilla oficial 3.8.
- Compatibilidad con el formato de razonamiento DeepSeek en llama.cpp (`--reasoning-format deepseek`), que extrae los bloques `thinking` al campo `reasoning_content` de la API, evitando que los tokens de razonamiento se filtren al flujo de texto y detengan las llamadas a herramientas.
- Mecanismo de escalado de errores en dos niveles para corregir bucles agénticos donde el modelo repite la misma llamada a herramienta fallida.
- Preservacion de la caché KV al 100% mediante un historial cronologico estricto, evitando la invalidacion por mutacion de turnos pasados.

## Casos de uso

- Despliegue local de Qwen 3.8 en llama.cpp: al usar `llama-server` con `--jinja --chat-template-file chat_template.jinja --reasoning-format deepseek`, se consigue que los agentes de codigo como OpenCode, Claude Code o Pi.dev reciban el razonamiento en el campo `reasoning_content` y no interrumpan las llamadas a herramientas.
- Integracion de tool calling en vLLM: reemplazando la cadena `chat_template` en `tokenizer_config.json` y usando `--tool-call-parser qwen3_xml`, se habilita el parseo correcto de llamadas a funciones en produccion con Qwen 3.8.
- Configuracion de LM Studio para uso personal: sustituir la plantilla del panel derecho por el contenido de `chat_template.jinja` permite usar Qwen 3.5/3.6/3.8 con razonamiento y tool calling sin errores de renderizado.
- Flujos agénticos multi-paso: la correccion del "empty think poisoning" y el escalado de errores evita que el modelo se quede atascado repitiendo llamadas a herramientas fallidas, lo que es critico para agentes que consultan APIs o bases de datos.
- Aplicaciones con presupuesto de razonamiento ajustable: gracias al soporte de `reasoning_effort`, se puede configurar el nivel de thinking (de `low` a `xhigh`) segun la latencia deseada, util para chatbots de atencion al cliente que necesitan respuestas rapidas o para tareas complejas de analisis.
- Migracion de pipelines existentes de Qwen 3.5/3.6 a 3.8: la plantilla unificada permite cambiar de generacion sin reescribir la logica de serializacion de conversaciones, manteniendo la compatibilidad con todos los motores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que este repositorio no contiene un modelo sino una plantilla. El autor reporta mejoras cualitativas de rendimiento:

| Metrica | Valor reportado |
|---|---|
| Tasa de acierto de caché KV | 100% (historial cronologico estricto) |
| Reduccion de velocidad en llama.cpp por anidamiento Jinja | Hasta un 80% (corregido con AST aplanado) |
| Duplicacion de bloques de razonamiento en Qwen 3.8 | Eliminada (cured empty think poisoning) |

Estas cifras provienen de las afirmaciones del autor en la model card y no han sido verificadas de forma independiente.

## Requisitos de hardware

- No aplica directamente: al ser una plantilla de texto, no requiere VRAM ni GPU propia.
- El hardware necesario es el del modelo Qwen subyacente (por ejemplo, Qwen3.8-2.4T-A95B requiere multiples GPUs de alta capacidad).
- La plantilla esta disenada para funcionar en motores de inferencia locales como llama.cpp, que pueden ejecutarse en CPU o GPU consumer (RTX 3090/4090) con modelos cuantizados.
- Para despliegue en produccion con vLLM, se recomienda GPU con al menos 24 GB de VRAM para modelos de 7B-14B cuantizados, o multiples A100/H100 para modelos mayores.
- La plantilla no anade requisitos adicionales de memoria; su objetivo es precisamente reducir el desperdicio de tokens y mejorar la eficiencia de la caché KV.

## Comparativa con modelos similares

No existen alternativas equivalentes publicadas como repositorios independientes de plantillas Jinja para Qwen. La comparacion relevante es con las plantillas oficiales de Qwen:

| Aspecto | Plantilla oficial Qwen 3.8 | Qwen-Fixed-Chat-Templates v22 |
|---|---|---|
| Modo rapido sin razonamiento | Falla con excepcion fatal | Funciona via kwargs o `<\|think_off\|>` |
| Argumentos de herramientas JSON | Error `TypeError` | Soporte universal (dict, JSON string, escalar) |
| Compatibilidad con minijinja | Filtros Python que fallan en C++ | 100% minijinja |
| Caché KV | Se invalida con turnos mutados | 100% de acierto |
| Control de razonamiento | Solo via prompt manual | `reasoning_effort` integrado (xhigh, high, medium, low) |
| Licencia | Apache 2.0 | Apache 2.0 |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no se puede usar directamente para generar texto; requiere un modelo Qwen 3.5, 3.6 o 3.8 subyacente.
- Las afirmaciones de rendimiento (100% KV cache hit rate, reduccion del 80% de velocidad) son del autor y no estan respaldadas por benchmarks publicos independientes.
- La plantilla depende de la version del motor de inferencia: por ejemplo, el flag `--reasoning-preserve` de llama.cpp solo esta disponible en builds recientes; en versiones antiguas hay que usar `--reasoning-format deepseek`.
- El soporte de `reasoning_effort` esta pensado para Qwen 3.8; en Qwen 3.5 y 3.6 puede no tener efecto o requerir ajustes.
- Aunque la licencia es Apache 2.0, el uso de la plantilla con modelos Qwen esta sujeto a la licencia de los propios modelos (Qwen 3.8 usa Apache 2.0, pero verificar cada version).
- No se garantiza compatibilidad con futuras versiones de Qwen o de los motores; el autor mantiene actualizaciones frecuentes (v19, v21, v22), pero es un proyecto comunitario sin soporte comercial.
- El repositorio tiene 0 descargas registradas en HuggingFace (aunque 1058 likes), lo que sugiere que la mayoria de usuarios lo obtienen via mirrors de GitHub o lo copian manualmente; verificar la integridad del archivo antes de usarlo en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Mirror en HuggingFace (v19): https://huggingface.co/CCSSNE/froggeric-Qwen-Fixed-Chat-Templates
- Mirror en GitHub (clach04): https://github.com/clach04/froggeric_Qwen-Fixed-Chat-Templates
- Mirror en GitHub (rchildre3): https://github.com/rchildre3/Qwen-Fixed-Chat-Templates
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen-fixed-chat-templates-froggeric
