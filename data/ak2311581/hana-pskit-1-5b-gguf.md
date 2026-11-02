# ak2311581/hana-pskit-1.5b-GGUF

## Resumen

Hana pskit 1.5B es un modelo de lenguaje especializado en asistencia técnica para el ecosistema py-serverless-kit (pskit), una herramienta de despliegue serverless en Python. Desarrollado por Asif Khan y publicado bajo el identificador ak2311581, el modelo parte de Qwen2.5-1.5B-Instruct y se ha afinado mediante dos etapas de LoRA fusionadas para convertirle en el asistente integrado de pskit studio, la interfaz web del kit. La versión aquí descrita es la cuantización GGUF distribuida para su uso con llama.cpp.

El modelo resuelve un problema muy concreto: guiar al usuario en la configuración, el uso de la CLI, la edición de pskit.yml y el código de los handlers, y actuar como agente que lee el proyecto, propone un plan, aplica cambios y los valida con pskit validate antes de darlos por buenos. No pretende ser un modelo generalista, sino un asistente de dominio cerrado con un conjunto fijo de diez herramientas y un system prompt específico.

Con 1.543.714.304 parámetros (aproximadamente 1,5B), una ventana de entrenamiento de 4.096 tokens y licencia Apache-2.0, es un modelo ligero pensado para ejecutarse en local o en entornos de bajos recursos. Su relevancia radica en el patrón de diseño: un modelo pequeño, afinado con datos de tareas reales y con tool calling nativo, que demuestra que la especialización vertical puede compensar la falta de escala general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens usados en entrenamiento; el ejemplo de despliegue usa `-c 8192` |
| Tipos de cuantizacion | q8_0 (1,53 GiB) y q4_k_m (0,92 GiB) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only heredado de Qwen2.5-1.5B-Instruct, sin modificaciones estructurales en la arquitectura. El ajuste se realizó en dos etapas de LoRA, cada una fusionada en los pesos finales. La primera etapa inyecta conocimiento específico de pskit: documentación, CLI, studio y formato de configuración. La segunda etapa entrena el uso de herramientas sobre tareas reales, con un 25% de repetición (replay) de datos de la primera etapa para mitigar el olvido catastrófico.

Los datos de entrenamiento de tool use cubren cuatro proveedores: AWS, Azure, GCP y on-premises, siendo este último el 40% del conjunto de tareas. Las conversaciones se entrenaron con 4.096 tokens de contexto. El formato de llamada a herramientas es el de Qwen/Hermes, `<tool_call>{json}</tool_call>`, renderizado mediante la plantilla de chat propia del modelo. No se documenta el volumen total de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés sobre el dominio de pskit.
- Respuesta a preguntas sobre pskit, studio, la terminal y el código.
- Tool calling con diez herramientas definidas: `search_docs`, `get_project`, `read_file`, `get_validation`, `propose_plan`, `ask_user`, `set_config`, `write_file`, `validate` e `invoke_local`.
- Comportamiento agéntico: lectura del proyecto, propuesta de plan, edición de `pskit.yml` y código de handlers, y validación con `validate` e invocación local.
- Generación de pasos how-to con encabezados estructurados.
- Citación de documentación en las respuestas finales.
- No incluye visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistente integrado en pskit studio: el modelo atiende las preguntas del usuario dentro de la interfaz web y propone el siguiente paso de cada turno, apoyándose en su entrenamiento específico sobre la documentación y la CLI de pskit.
- Guía de configuración de despliegues: dado un proyecto, lee `pskit.yml` y los handlers, y propone cambios de configuración para AWS, Azure, GCP u on-premises, que luego se validan antes de aplicarse.
- Edición asistida de código de handlers: el modelo puede escribir y modificar código de handler y comprobarlo con `validate` y una invocación local, lo que encaja en un flujo de desarrollo iterativo.
- Depuración de errores de validación: con acceso a `get_validation`, interpreta los errores de `pskit validate` y propone correcciones concretas sobre la configuración o el código.
- Onboarding de nuevos usuarios: responde preguntas de tipo how-to sobre la terminal y el flujo de trabajo de studio, con respuestas estructuradas en encabezados y citas a la documentación.
- Automatización de tareas repetitivas de proyecto: mediante `read_file` y `write_file`, puede aplicar cambios mecánicos en varios ficheros siguiendo un plan propuesto y aprobado por el usuario.
- Asistencia en entornos sin conectividad: al ser un modelo de 1,5B cuantizado a q4_k_m (0,92 GiB), puede ejecutarse en local con llama.cpp y ofrecer asistencia sin depender de servicios externos.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de validación de tareas (siguiente paso de cada turno del asistente):

| Metrica | Resultado |
|---|---|
| Accion correcta | 298/335 = 89% |
| Argumentos correctos | 219/255 = 86% |
| Respuesta final cita un documento | 47/64 = 73% |
| Plan antes del cambio | 64/66 = 97% |
| Respuesta final usa encabezados how-to | 15/18 = 83% |
| Accion por categoria: a_qa | 37/47 |
| Accion por categoria: b_build | 98/108 |
| Accion por categoria: c_fix | 67/74 |
| Accion por categoria: d_debug | 68/72 |
| Accion por categoria: e_safety | 13/16 |
| Accion por categoria: f_explain | 12/15 |
| Accion por categoria: g_hana | 3/3 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6-2,0 GiB con q8_0 y 1,0-1,4 GiB con q4_k_m, incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); en GPU de datacenter (A100, H100) el modelo queda sobredimensionado y se infrautiliza.
- Cabe holgadamente en GPU consumer y también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja`), y por extensión cualquier runtime compatible con GGUF. El autor documenta el servidor OpenAI-compatible de llama.cpp.
- Latencia y throughput: no disponibles. El autor indica que q4_k_m es más rápido en CPU y q8_0 es la mejor opción para tool calls.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Hana pskit 1.5B (este) | 1,54B | 4.096 en entrenamiento | Asistente de pskit con tool calling | Apache-2.0 | GGUF |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 (modelo base) | Generalista, instruct | Apache-2.0 | safetensors, GGUF |
| Qwen2.5-1.5B (base) | 1,54B | 32.768 | Modelo base sin instrucciones | Apache-2.0 | safetensors |

La comparación con alternativas del mismo tamaño y tarea especializada no está disponible en la información proporcionada. Frente a su modelo base, Hana sacrifica generalidad y parte de la ventana de contexto nativa a cambio de precisión en el dominio pskit y en el uso de herramientas concretas.

## Limitaciones y advertencias

- Modelo de 1,5B: puede equivocarse. El propio autor recomienda revisar siempre el plan antes de aprobarlo y confiar en `pskit validate` como comprobación final.
- El tool use solo se entrenó para AWS, Azure, GCP y on-premises; las preguntas sobre otros proveedores de pskit recaen en el conocimiento de la primera etapa.
- Entrenado para pskit 2.10; versiones posteriores pueden introducir claves o flags que el modelo desconoce.
- El modelo no despliega ni elimina recursos por sí mismo; solo indica la página de despliegue o el comando correspondiente.
- Solo soporta inglés; no se documenta soporte multilingüe.
- La ventana de entrenamiento es de 4.096 tokens, aunque el ejemplo de despliegue configura 8.192; el comportamiento más allá de 4.096 no está validado.
- Requiere el system prompt y el fichero de herramientas exactos (`hana_system_prompt.txt` y `hana_tools.json`) para funcionar según lo entrenado; usarlo con otro prompt degrada el rendimiento.
- Riesgo de alucinación en preguntas fuera del dominio pskit o sobre versiones no cubiertas.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda conservar los avisos de atribución al autor original.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/ak2311581/hana-pskit-1.5b-GGUF
- Modelo base del ajuste: https://huggingface.co/ak2311581/hana-pskit-1.5b
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- py-serverless-kit en PyPI: https://pypi.org/project/py-serverless-kit/
- Perfil del autor: https://www.linkedin.com/in/asif-khan-31b7a8187/
