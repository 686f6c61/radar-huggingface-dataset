# Anothers1993/Qwen3.8-Scoped-Terse-Chat-Template

## Resumen

Este repositorio no contiene pesos de modelo: es una plantilla de chat operativa (`chat_template.jinja`) para el modelo Qwen3.8-27B, diseñada para cargas de trabajo de agentes de larga duración. La desarrolla Anothers1993 de forma independiente, derivada de la plantilla oficial de Qwen3.8-27B bajo licencia Apache-2.0. Resuelve dos problemas concretos: el razonamiento histórico completo que puede reactivar tareas ya completadas en sesiones largas, y el esfuerzo de razonamiento `low` que puede gastar todo el presupuesto de salida en razonamiento sin devolver texto final.

La plantilla mantiene los formatos oficiales de mensajes, visión y tool-calling de Qwen, pero cambia dos comportamientos por defecto: el razonamiento histórico se limita al turno activo usuario/herramienta, y el nivel `low` se ajusta para una finalización concisa. Está validada en SGLang con Qwen3.8-27B en cuantización NVFP4, decodificación especulativa DFlash2, OpenCode y 2× DGX Spark TP2. El contexto máximo soportado es de 262.144 tokens según la configuración de ejemplo para OpenCode.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la plantilla no define arquitectura; se aplica a Qwen3.8-27B) |
| Parametros totales | no disponible (el repositorio no contiene pesos; el modelo base es Qwen3.8-27B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (segun configuracion de ejemplo en OpenCode) |
| Tipos de cuantizacion | NVFP4 (validado en SGLang) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | no aplica (repositorio sin pesos; solo archivo `chat_template.jinja`) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino una plantilla de chat que modifica el comportamiento de Qwen3.8-27B en tiempo de inferencia. La plantilla se deriva de la plantilla oficial de Qwen3.8-27B bajo Apache-2.0 y mantiene los formatos de mensajes, vision y tool-calling XML de Qwen. No hay datos de entrenamiento, tokens ni procesos de RLHF/DPO asociados a este repositorio.

La innovacion tecnica principal es la politica "scoped-terse": por defecto, el razonamiento de turnos completados se elimina del historial, mientras que el razonamiento generado tras la ultima consulta real del usuario se conserva entre llamadas a herramientas. Ademas, introduce aliases de niveles de razonamiento (`minimal` → `low`, `high`/`max` → `xhigh`) y una politica `low` que prioriza la peticion mas reciente, solicita una aclaracion concisa si la peticion es ambigua y exige texto final no vacio salvo que se requiera una llamada a herramienta. El parametro `preserve_thinking=true` restaura el comportamiento completo de historial.

## Capacidades

- Razonamiento limitado al turno activo usuario/herramienta por defecto, con opcion de preservar el historial completo mediante `preserve_thinking=true`.
- Aliases de niveles de razonamiento: `minimal` → `low`, `high`/`max` → `xhigh`, con politica `low` orientada a respuestas concisas y aclaraciones.
- Conservacion del razonamiento del turno actual entre llamadas a herramientas.
- Soporte multimodal: placeholders de imagen y video sin cambios respecto a la plantilla oficial.
- Tool calling XML de Qwen sin modificaciones.
- Compatible con SGLang (via `--chat-template`), OpenCode (con `reasoning_content` como campo interleaved) y servidores OpenAI-compatibles.
- Fallo seguro ante niveles de razonamiento desconocidos (error de plantilla).

## Casos de uso

- Agentes de codificacion de larga duracion con OpenCode: la plantilla evita que el razonamiento de tareas completadas se reactive, manteniendo el contexto centrado en la peticion actual. Se configura con `reasoning: true` e `interleaved.field: reasoning_content` para que el razonamiento sobreviva a los round trips asistente/herramienta.
- Despliegue en SGLang con Qwen3.8-27B cuantizado: se lanza el servidor con `--chat-template ./chat_template.jinja`, `--reasoning-parser qwen3` y `--tool-call-parser qwen3_coder`, habilitando multimodalidad con `--enable-multimodal`.
- Asistentes de soporte con contexto largo: la politica `low` produce respuestas concisas y solicita aclaraciones cuando la peticion es ambigua, reduciendo el gasto de tokens de salida en sesiones de 262K tokens de contexto.
- Pipelines de tool calling estructurado: la plantilla serializa llamadas a herramientas estructuradas y conserva el razonamiento del turno actual entre llamadas, util para agentes que ejecutan multiples pasos.
- Sistemas de vision-language con Qwen3.8-27B: los placeholders de imagen y video se mantienen intactos, permitiendo usar el modelo multimodal sin cambios en el prompt.
- Entornos de hardware limitado con DGX Spark: validado con 2× DGX Spark TP2 y NVFP4, la plantilla reduce la salida de razonamiento innecesario, aliviando la presion sobre el presupuesto de tokens en inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad en la informacion disponible. La model card incluye una prueba de regresion operativa, no un benchmark controlado, comparando la politica `low` anterior con la politica scoped-terse v3 en una sesion real de OpenCode con la misma peticion ambigua:

| Resultado | Politica low anterior | Scoped-terse v3 |
|---|---:|---:|
| Contexto del prompt | ~143.7K tokens | ~148.2K tokens |
| Tokens de salida | 8.192 | 475 |
| Motivo de finalizacion | `length` | `stop` |
| Texto final | No | Si, aclaracion concisa |

La model card advierte explicitamente que no se afirma que esta plantilla mejore la calidad de benchmarks.

## Requisitos de hardware

- Validado en 2× DGX Spark con TP2 (tensor parallelism de 2 GPUs) y cuantizacion NVFP4.
- Decodificacion especulativa DFlash2 utilizada en la validacion.
- VRAM estimada: no disponible en la informacion proporcionada; depende del modelo base Qwen3.8-27B y su cuantizacion.
- GPUs recomendadas: DGX Spark (hardware especifico de NVIDIA); no se mencionan GPUs de consumo como RTX 4090.
- Opciones de despliegue: SGLang (lanzamiento con `--chat-template`), OpenCode, servidores OpenAI-compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Aspecto | Esta plantilla | Plantilla oficial Qwen3.8-27B | Qwen Sharp Chat Templates |
|---|---|---|---|
| Razonamiento historico | Limitado al turno activo por defecto | Historial completo por defecto | no disponible |
| Politica `low` | Concisa, con aclaracion | Reconstruccion de historial completo | no disponible |
| Aliases de razonamiento | `minimal`→`low`, `high`/`max`→`xhigh` | no disponible | no disponible |
| Preservacion de historial | Via `preserve_thinking=true` | Por defecto | no disponible |
| Licencia | Apache-2.0 | Apache-2.0 | no disponible |

La comparativa se limita a las plantillas mencionadas en la model card; no hay datos suficientes para comparar con otras alternativas.

## Limitaciones y advertencias

- El objetivo de 1.024 tokens en la politica `low` es una directiva a nivel de instruccion, no un presupuesto duro en tiempo de ejecucion. Se debe configurar un limite de salida total razonable y gestionar `finish_reason=length`.
- La plantilla no elimina mensajes visibles de conversacion ni resultados de herramientas; las sesiones largas siguen requiriendo compactacion o un nuevo limite de tarea.
- La cuantizacion, la decodificacion especulativa, el muestreo y las versiones de runtime pueden alterar el comportamiento; se recomienda re-ejecutar las pruebas incluidas y las evaluaciones propias antes de produccion.
- No se afirma que esta plantilla mejore la calidad de benchmarks.
- El repositorio no contiene pesos de modelo; es solo una plantilla. Requiere un checkpoint de Qwen3.8-27B compatible.
- Estado `v0.1.0-beta`: validado en un entorno especifico (SGLang, NVFP4, DFlash2, OpenCode, DGX Spark TP2); otros entornos pueden comportarse de forma distinta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Anothers1993/Qwen3.8-Scoped-Terse-Chat-Template
- GitHub de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Articulo de OpenLM.ai sobre Qwen 3.8-Max: https://openlm.ai/qwen3.8/
- GitHub de la serie Qwen3: https://github.com/QwenLM/Qwen3
- Modelo Qwen3-8B en HuggingFace: https://huggingface.co/Qwen/Qwen3-8B
- Documentacion de Qwen3 en Transformers: https://huggingface.co/docs/transformers/model_doc/qwen3
