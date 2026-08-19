# nrrso/Qwen3-Chat-Template-vLLM-Fixes

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un conjunto de plantillas de chat en formato Jinja diseñadas para el modelo **Qwen 3.8** (`Qwen/Qwen3.8-27B`) y sus variantes cuantizadas, con el objetivo de conseguir un tool-calling agéntico fiable en **vLLM**. El autor, `nrrso`, parte de la plantilla oficial de Qwen 3.8 y aplica correcciones conservadoras que reparan errores concretos de renderizado del historial y de parseo de argumentos JSON, sin reescribir las instrucciones que el modelo ya ha internalizado durante el entrenamiento.

La relevancia de este trabajo radica en que los harnesses agénticos y los proxies de OpenAI suelen enviar historial con campos alternativos (`reasoning_content`, `thinking`, argumentos como strings JSON) que la plantilla oficial de Qwen 3.8 no maneja correctamente, provocando fallos en servidores vLLM o salidas mal formadas. Se ofrecen dos variantes: `qwen3.8-enhanced.jinja`, la recomendada como base, y `qwen3.8-enhanced-extra.jinja`, que añade tolerancia a historial malformado de clientes externos. Ambas dependen del filtro `from_json` que solo proporciona vLLM, por lo que no son compatibles con llama.cpp, LM Studio o MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo, es un conjunto de plantillas Jinja) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | no aplica (archivos `.jinja`) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de una modificación de las plantillas de chat que utiliza el modelo base `Qwen/Qwen3.8-27B`. Las plantillas conservan el esqueleto oficial de Qwen 3.8 (instrucciones de `reasoning_effort`, formato de cierre de bloques `thinking`, espaciado de `</tool_response><|im_end|>`) y aplican parches específicos:

- Parseo de argumentos de herramientas cuando llegan como strings JSON en lugar de mappings, evitando el error `Can only get item pairs from a mapping`.
- Cierre automático de bloques `thinking` colgantes antes de una llamada a herramienta.
- Extracción de razonamiento inline desde `message.content` y re-renderizado canónico.
- Uso de `tojson(ensure_ascii=False)` para preservar texto CJK en definiciones de herramientas y argumentos.
- Reglas agénticas adicionales añadidas después del bloque `<IMPORTANT>` oficial, sin sustituirlo.
- Soporte del rol `developer`, alias de `reasoning_effort: "high"` a `xhigh`, y excepción clara cuando falta el nombre de la función en una llamada a herramienta.

La variante `-extra` añade tolerancia a etiquetas de pensamiento malformadas (`<thinking>`, `</ think>`, `</think >`), acepta `message.thinking` como alias de `message.reasoning_content`, y reconoce `preserve_reasoning` como alias de `preserve_thinking`. No hay datos de entrenamiento porque no se entrenó ningún peso.

## Capacidades

- Generacion de prompts de chat para el modelo Qwen 3.8 en vLLM con tool-calling fiable.
- Soporte de tool calling en formato XML (`<tool_call>` → `<function=name>` → `<parameter=x>`), compatible con el parser `qwen3_xml` de vLLM.
- Manejo de razonamiento (thinking) con prefill de ` thinking\n` y separación de `reasoning_content` y `content`.
- Compatibilidad con harnesses agénticos que envían prompts solo de sistema o continuaciones de herramienta sin consulta de usuario.
- Tolerancia a historial malformado de clientes externos en la variante `-extra`.
- Preservación del texto CJK sin escapes Unicode gracias a `tojson(ensure_ascii=False)`.

## Casos de uso

- Despliegue de Qwen 3.8 en vLLM con tool-calling estable: el repositorio proporciona una plantilla lista para usar con `vllm serve unsloth/Qwen3.8-27B-NVFP4 --chat-template qwen3.8-enhanced.jinja --enable-auto-tool-choice --tool-call-parser qwen3_xml --reasoning-parser qwen3`.
- Integración con proxies de OpenAI que envían `reasoning_effort: "high"`: la plantilla lo aliasea a `xhigh` sin lanzar excepción, evitando caídas del servidor.
- Harnesses agénticos que requieren el rol `developer` (como Codex): la plantilla fusiona mensajes `system` y `developer` iniciales en un único bloque de sistema.
- Sistemas multi-turno con historial generado por clientes que devuelven argumentos de herramientas como strings JSON: la plantilla los parsea y re-renderiza en el formato entrenado, evitando errores de servidor.
- Aplicaciones que necesitan conservar el razonamiento del modelo entre turnos: `preserve_thinking` está activado por defecto, alineado con el entrenamiento de Qwen 3.8.
- Entornos de producción con texto CJK en prompts o herramientas: la serialización con `ensure_ascii=False` mantiene la legibilidad y evita problemas de codificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no modifica los pesos del modelo, por lo que el rendimiento en tareas como MMLU, HumanEval o GSM8K es el mismo que el del modelo base `Qwen/Qwen3.8-27B`, cuyos resultados no se detallan aquí.

## Requisitos de hardware

No aplica. Al ser un conjunto de plantillas de texto, no requiere VRAM ni GPU adicionales. Los requisitos de hardware son los del modelo base `Qwen/Qwen3.8-27B` que se utilice con estas plantillas. Para el despliegue se necesita un servidor vLLM con soporte del filtro `from_json` (presente en vLLM, ausente en llama.cpp, LM Studio y MLX). No se dispone de datos de latencia o throughput asociados a estas plantillas.

## Comparativa con modelos similares

No se trata de un modelo comparable con otros LLM, sino de una alternativa a otras soluciones de plantillas de chat para Qwen 3.8:

| Repositorio | Enfoque | Compatibilidad | Diferencias clave |
|---|---|---|---|
| `nrrso/Qwen3-Chat-Template-vLLM-Fixes` | Parches conservadores sobre la plantilla oficial | Solo vLLM (usa `from_json`) | Mantiene el texto oficial de instrucciones, añade reglas agénticas y tolerancia a historial malformado |
| `froggeric/Qwen-Fixed-Chat-Templates` | Plantillas corregidas agnósticas al motor | llama.cpp, LM Studio, MLX, vLLM | No depende de `from_json`, pero no incluye las correcciones específicas de vLLM de este repositorio |
| Plantilla oficial de Qwen 3.8 | Referencia original | vLLM y otros | No maneja argumentos JSON stringificados ni roles `developer`, y falla con `reasoning_effort: "high"` |

## Limitaciones y advertencias

- Las plantillas solo funcionan en vLLM; no son compatibles con llama.cpp, LM Studio ni MLX por el uso del filtro `from_json`.
- Es necesario usar `--reasoning-parser qwen3` en vLLM, ya que el prompt de generación se pre-rellena con ` thinking\n` y el parser gestiona la apertura de la etiqueta de razonamiento.
- El parser `qwen3_xml` depende de los esquemas JSON de las herramientas para la coerción de tipos; esquemas laxos pueden devolver argumentos como strings.
- La variante `-extra` produce prompts byte-idénticos a la variante base solo para conversaciones bien formadas; en historial malformado puede normalizar el formato, lo que podría diferir ligeramente de lo que el modelo espera.
- No hay garantías de soporte a largo plazo; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopción limitada.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base `Qwen/Qwen3.8-27B` tiene su propia licencia (Apache-2.0 según los tags, aunque conviene verificarla en el repositorio oficial).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nrrso/Qwen3-Chat-Template-vLLM-Fixes
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante cuantizada mencionada: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Repositorio de plantillas alternativas: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Repositorio GitHub con correcciones previas: https://github.com/allanchan339/vLLM-Qwen3-3.5-3.6-chat-template-fix
