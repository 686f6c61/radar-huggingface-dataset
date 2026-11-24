# kabcnd/Kenzan-Hoku-0.8B-PinGrid-GGUF

## Resumen

Kenzan-Hoku-0.8B-PinGrid-GGUF es un ajuste fino especializado del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario kabcnd en Hugging Face. El modelo está orientado a una tarea muy concreta: convertir peticiones en lenguaje natural (en ruso o inglés) en comandos de Windows PowerShell estrictos, devolviendo un objeto JSON de una sola línea con los campos `type`, `command` y `explanation`. El nombre rinde homenaje a Katsushika Hokusai y el modelo se distribuye en formato GGUF con recetas de cuantización mixta denominadas PinGrid.

La relevancia del modelo radica en su enfoque en restricciones del entorno Windows real: distingue sintaxis de PowerShell 5.1 frente a 7.4, tiene en cuenta el flag de administrador, la ExecutionPolicy, el LanguageMode, los endpoints JEA, la firma de código Authenticode, los repositorios PSRepository aprobados y la creación de interfaces con WinForms, WPF y diálogos del host. Con solo 752.393.024 parámetros reales (aproximadamente 0,8B), está pensado para ejecutarse en entornos con recursos limitados, incluidos CPU y equipos de borde.

El modelo se distribuye bajo licencia Apache 2.0, soporta ruso e inglés, y está etiquetado como compatible con endpoints y orientado a conversación. Su tamaño de repositorio es de 1,4 GB, lo que refleja la inclusión de varias cuantizaciones GGUF. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible; los únicos datos de evaluación proceden de un conjunto de pruebas propio del autor centrado en PowerShell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-0.8B); detalles internos no disponibles |
| Parametros totales | 752.393.024 (aproximadamente 0,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con recetas PinGrid: Q4_K_M, Q3_K_M, Q3_K_S (variantes M6) |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors solo como dato de parametros del modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 752 millones de parámetros. El autor no documenta en la model card cambios estructurales propios; el valor añadido del modelo reside en el ajuste fino sobre un contrato de prompt muy específico y en la cuantización mixta PinGrid aplicada posteriormente con la herramienta `llama-clover` de Prism ML (con agradecimiento explícito al equipo y a Misha).

El entrenamiento se orienta a una única tarea de generación estructurada: producir JSON con `{"type":"command|refuse|unsure","command":"...","explanation":"..."}`, donde `command` queda vacío salvo cuando `type` es `command` y `explanation` es una frase corta en el idioma de la petición. El prompt de sistema exige obedecer la versión de PowerShell (5.1 carece de `&&`, `||`, `?:` y `??`), el flag de administrador, la política de ejecución, el modo de lenguaje y las restricciones del repositorio de scripts aprobado. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La innovación destacable es la receta de cuantización PinGrid con variantes M6, que permite obtener artefactos de entre 428,2 MB y 496,5 MB manteniendo alta validez sintáctica de PowerShell.

## Capacidades

- Generación de comandos PowerShell 5.1 y 7.4 a partir de peticiones en ruso o inglés, respetando diferencias sintácticas entre versiones.
- Salida estructurada en JSON de una sola línea con tipología `command`, `refuse` o `unsure`, lo que permite distinguir cuándo el modelo debe rechazar o marcar incertidumbre.
- Razonamiento sobre restricciones de entorno Windows: admin, ExecutionPolicy, LanguageMode, endpoints JEA y repositorios PSRepository aprobados.
- Conocimiento de firma de código Authenticode y de creación de interfaces mediante WinForms, WPF y diálogos del host.
- Modo de pensamiento (`<think>`) presente en el contrato de prompt, con bloque de razonamiento antes de la respuesta.
- Capacidades multilingües limitadas a ruso e inglés.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Automatización de tareas administrativas en Windows: el modelo traduce peticiones como "firmar un script con el primer certificado de firma de código disponible" en un comando PowerShell concreto, respetando la política AllSigned y el flag de administrador indicados en el contexto.
- Asistentes de terminal para operadores: integrado en una CLI, convierte instrucciones en lenguaje natural en comandos de una sola línea, con salida JSON parseable que permite al frontend mostrar la explicación y decidir si ejecutar, rechazar o pedir aclaración.
- Generación de scripts en pipelines de aprovisionamiento: dado un entorno descrito (`ps=5.1`, `admin=1`, `policy=AllSigned`, `repo=CorpScripts`), produce comandos compatibles con PowerShell 5.1 sin operadores no disponibles en esa versión.
- Herramientas de seguridad y cumplimiento: el tipo `refuse` permite que el modelo decline peticiones peligrosas o no conformes con la política, lo que encaja en flujos que requieren una capa de rechazo explícita antes de la ejecución.
- Soporte a administradores en entornos JEA: al tener en cuenta endpoints JEA y LanguageMode, puede generar comandos acotados a las capacidades permitidas en un endpoint restringido.
- Scripting de interfaz de usuario en Windows: genera código para diálogos WinForms, WPF y del host, útil para automatizar tareas que requieren interacción gráfica.
- Despliegue en equipos de borde o sin GPU: con cuantizaciones de 428,2 MB a 496,5 MB, puede ejecutarse en CPU (el autor reporta 143,36 t/s de generación y 696,72 t/s de evaluación de prompt en Apple M6 con 4 hilos para Q3_K_S).

## Benchmarks y rendimiento

Los únicos datos disponibles proceden del conjunto propio `hoku_test_v1` (493 casos de retención limpios en ruso e inglés: 368 de comando, 85 de rechazo y 40 de incertidumbre), evaluados con `temperature=0` y verificación AST nativa mediante `System.Management.Automation.Language.Parser::ParseInput`.

| Artefacto | Cuantización | Tamano | JSON valido | AST PowerShell nativa valida | Coincidencia `exact_ref` | Coincidencia `cmdlet` | Aprobado semantico |
|---|---|---:|---:|---:|---:|---:|---:|
| Kenzan-Hoku-0.8B-PinGrid-Q4_K_M-M6.gguf | PinGrid Q4_K_M | 496,5 MB | 490/493 (99,39%) | 409/421 (97,15%) | 216/368 (58,70%) | 297/368 (80,71%) | 294/493 (59,63%) |
| Kenzan-Hoku-0.8B-PinGrid-Q3_K-M6.gguf | PinGrid Q3_K_M | 451,1 MB | 484/493 (98,17%) | 410/414 (99,03%) | 195/368 (52,99%) | 269/368 (73,10%) | 273/493 (55,38%) |
| Kenzan-Hoku-0.8B-PinGrid-Q3_K_S-M6.gguf | PinGrid Q3_K_S | 428,2 MB | 488/493 (98,99%) | 415/421 (98,57%) | 190/368 (51,63%) | 269/368 (73,10%) | 265/493 (53,75%) |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño de los artefactos (428,2 MB a 496,5 MB), la inferencia cabe holgadamente en GPUs de consumo con 4 GB o más de VRAM, y probablemente en menos.
- GPU recomendadas: no se especifican en la información disponible. Dado el tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4060, RTX 4090) puede alojar el modelo completo en VRAM.
- Cabe en GPU de consumo: sí, con cualquiera de las cuantizaciones publicadas; también en CPU y en equipos de borde.
- Opciones de despliegue: al distribuirse en GGUF, es compatible con llama.cpp y derivados como Ollama; la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints. No se confirma soporte de vLLM o TGI en la información disponible.
- Latencia y throughput: el autor reporta para Q3_K_S-M6 143,36 t/s de generación y 696,72 t/s de evaluación de prompt en CPU Apple M6 con 4 hilos. No se proporcionan cifras para GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kenzan-Hoku-0.8B-PinGrid-GGUF | 752.393.024 | no disponible | Especialista PowerShell RU/EN con salida JSON | Apache 2.0 | GGUF en Hugging Face |
| Qwen/Qwen3.5-0.8B (modelo base) | aproximadamente 0,8B | no disponible | Modelo generalista multilingüe | no disponible en la información proporcionada | Hugging Face |
| Alternativas especializadas en PowerShell de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks comparables frente a otros modelos especializados en PowerShell, por lo que la comparación de rendimiento queda como "no disponible".

## Limitaciones y advertencias

- Ámbito muy restringido: el modelo está entrenado para una única tarea (generación de comandos PowerShell con salida JSON); no debe esperarse un rendimiento generalista en otras tareas de texto.
- Idiomas limitados a ruso e inglés; no se documenta soporte de castellano ni de otros idiomas.
- Riesgo de alucinación en cmdlets, parámetros o rutas: la coincidencia `exact_ref` ronda el 52-59% en el conjunto propio, por lo que el comando generado puede no coincidir exactamente con la referencia esperada aunque la sintaxis sea válida.
- La validez AST no garantiza corrección semántica: el aprobado semántico se sitúa entre el 53,75% y el 59,63% según la cuantización.
- Riesgo de seguridad operativa: los comandos generados deben revisarse antes de ejecutarse en producción, especialmente con `admin=1`; el tipo `refuse` mitiga pero no elimina este riesgo.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente; conviene verificar las condiciones del modelo base Qwen/Qwen3.5-0.8B.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria independiente.
- No se documentan limitaciones de longitud de contexto ni latencias en GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kabcnd/Kenzan-Hoku-0.8B-PinGrid-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Herramienta de cuantización Prism ML: https://prismml.com/
- Apoyo al autor (Ko-fi): https://ko-fi.com/kabcnd
