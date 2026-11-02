# ak2311581/hana-pskit-1.5b

## Resumen

Hana es un ajuste fino del modelo Qwen2.5-1.5B-Instruct, desarrollado por Asif Khan (usuario de HuggingFace ak2311581), concebido como asistente especializado de pskit studio, la interfaz web de py-serverless-kit. El modelo responde preguntas sobre la herramienta, guía al usuario en el terminal y en el editor de código, y actúa como agente capaz de leer el proyecto, proponer un plan, modificar `pskit.yml` y el código de los handlers, y verificar el resultado mediante `validate` y una invocación local.

Se trata de un modelo denso de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones), construido sobre la arquitectura Qwen2 con una ventana de contexto empleada en entrenamiento de 4.096 tokens. El ajuste se realizó en dos etapas LoRA fusionadas: primero conocimiento de pskit (documentación, CLI, studio, configuración) y después uso de herramientas sobre tareas reales, con un 25 % de repetición de datos de la primera etapa para evitar olvido catastrófico.

Su relevancia radica en que ejemplifica el patrón de modelos pequeños y especializados para agentes de dominio concreto: en lugar de competir en capacidades generales, Hana está entrenada para un conjunto cerrado de 10 herramientas y un formato de llamada específico (`<tool_call>{json}</tool_call>` del template de chat de Qwen/Hermes), lo que permite desplegarla en infraestructura modesta y con latencia baja. La licencia Apache-2.0, heredada del modelo base, facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia Qwen2 (Qwen2ForCausalLM) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens usados en entrenamiento (la ventana nativa del modelo base no se especifica en la informacion disponible) |
| Tipos de cuantizacion | safetensors en el repo principal; GGUF disponible en el repo asociado `ak2311581/hana-pskit-1.5b-GGUF` (los niveles concretos de cuantizacion no se detallan) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo principal), GGUF (repo secundario) |

## Arquitectura y entrenamiento

Hana parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con atención causal estándar, y no introduce cambios arquitectónicos: el trabajo se concentra en el ajuste fino. El entrenamiento consistió en dos etapas LoRA, cada una fusionada en los pesos finales. La primera etapa inyecta conocimiento del dominio pskit (documentación, comandos de CLI, studio y formato de configuración); la segunda entrena el uso de herramientas sobre tareas reales, mezclando un 25 % de datos de la primera etapa como replay. Los proveedores cubiertos en el entrenamiento de tool use son AWS, Azure, GCP y on-premises, con este último representando el 40 % de los datos de tareas.

El formato de llamada a herramientas es el nativo del template de chat del modelo base: `<tool_call>{json}</tool_call>`. El modelo se entrenó con un system prompt concreto y un conjunto fijo de 10 herramientas, ambos publicados en el repositorio (`hana_system_prompt.txt` y `hana_tools.json`). Las herramientas son `search_docs`, `get_project`, `read_file`, `get_validation`, `propose_plan`, `ask_user`, `set_config`, `write_file`, `validate` e `invoke_local`; ninguna de ellas ejecuta despliegues. No se documentan en la información disponible detalles sobre volumen total de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés sobre pskit, su CLI, studio y configuración.
- Llamada a herramientas (tool calling) en formato Qwen/Hermes, restringida a las 10 herramientas definidas en `hana_tools.json`.
- Comportamiento de agente multi-paso: lectura del proyecto, propuesta de plan, edición de `pskit.yml` y código de handlers, validación e invocación local.
- Planificación explícita antes de aplicar cambios (el 97 % de los casos del conjunto de validación incluyen plan previo).
- Citación de documentación en las respuestas finales (73 % de los casos evaluados).
- Solicitud de intervención al usuario mediante la herramienta `ask_user` cuando falta información.
- Respuesta en modo texto plano cuando no se requiere herramienta.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Asistente integrado en pskit studio: el modelo responde preguntas sobre la herramienta y guía al usuario en la creación de funciones serverless, apoyándose en `search_docs` para recuperar documentación y en su conocimiento de la CLI.
- Edición asistida de configuración: dado un proyecto, Hana lee `pskit.yml` con `get_project` y `read_file`, propone un plan y aplica cambios con `set_config` y `write_file`, lo que permite modificar el proveedor, el stage o los handlers sin edición manual.
- Depuración de errores de validación: tras ejecutar `validate` o `invoke_local`, el modelo interpreta el resultado con `get_validation` y propone correcciones concretas sobre el código del handler.
- Automatización de tareas de onboarding: un desarrollador nuevo puede pedir a Hana que explique cómo añadir un schedule o un endpoint; el modelo combina recuperación de documentación y pasos de how-to.
- Agente de soporte en terminal: integrado en un flujo de CI o en un CLI, el modelo puede inspeccionar el proyecto, sugerir cambios y verificar que la configuración sigue siendo válida antes de que un humano apruebe el despliegue.
- Prototipado de flujos agénticos con modelos pequeños: por su tamaño (1,5B) y licencia Apache-2.0, sirve como referencia para equipos que quieran construir asistentes de dominio con tool calling sobre infraestructura modesta.
- Evaluación de pipelines de function calling: el par system prompt + herramientas publicado permite reproducir el comportamiento del modelo y compararlo con alternativas en tareas de agente.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de validación de tareas (siguiente paso de cada turno del asistente):

| Metrica | Resultado |
|---|---|
| Accion correcta | 298/335 = 89 % |
| Argumentos correctos | 219/255 = 86 % |
| Respuesta final cita documentacion | 47/64 = 73 % |
| Plan antes del cambio | 64/66 = 97 % |
| Respuesta final con encabezados how-to | 15/18 = 83 % |
| Accion por categoria: a_qa | 37/47 |
| Accion por categoria: b_build | 98/108 |
| Accion por categoria: c_fix | 67/74 |
| Accion por categoria: d_debug | 68/72 |
| Accion por categoria: e_safety | 13/16 |
| Accion por categoria: f_explain | 12/15 |
| Accion por categoria: g_hana | 3/3 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: en torno a 3,1 GB solo para pesos, más overhead de activaciones y KV cache; un presupuesto práctico de 4-6 GB es razonable para contextos de 4K tokens.
- Cuantización GGUF: el modelo cabe holgadamente en GPUs consumer de 4-8 GB (por ejemplo, RTX 3050, RTX 4060, RTX 3060) y en CPU con llama.cpp u Ollama.
- GPU recomendadas para producción: cualquier GPU con al menos 8 GB (L4, T4, RTX 4090) permite servir varias instancias; A100/H100 no son necesarias para este tamaño.
- Despliegue: transformers (código de ejemplo en la model card), llama.cpp, Ollama y Docker mediante los GGUF del repo `ak2311581/hana-pskit-1.5b-GGUF`; también es compatible con text-generation-inference según los tags del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hana (este modelo) | 1,54B | 4.096 en entrenamiento | Asistente de dominio pskit con tool calling cerrado | Apache-2.0 | HuggingFace (safetensors y GGUF) |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 (nativo del base) | Asistente generalista | Apache-2.0 | HuggingFace |
| Qwen2.5-Coder-1.5B-Instruct | 1,54B | 32.768 | Generacion de codigo | Apache-2.0 | HuggingFace |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 | Asistente generalista | Llama 3.2 Community License | HuggingFace |

La comparación con el modelo base es la más directa: Hana sacrifica generalidad y ventana de contexto a cambio de precisión en un dominio y un conjunto de herramientas concretos. Frente a Qwen2.5-Coder-1.5B-Instruct, Hana no está optimizada para generación de código genérica sino para editar configuración y handlers dentro de un flujo agéntico verificado. Los datos de rendimiento de los modelos comparables en las tareas específicas de Hana no están disponibles.

## Limitaciones y advertencias

- Modelo de 1,5B: puede equivocarse; el autor recomienda revisar siempre el plan antes de aprobarlo y confiar en `pskit validate` como red de seguridad.
- El tool use se entrenó únicamente para AWS, Azure, GCP y on-premises; las preguntas sobre otros proveedores de pskit recaen en el conocimiento de la primera etapa.
- Entrenado para pskit 2.10: versiones posteriores pueden introducir claves o flags que el modelo desconoce.
- El modelo nunca despliega ni elimina recursos por sí mismo; deriva al usuario a la página de Deploy o al comando correspondiente.
- Idioma limitado al inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Ventana de contexto efectiva de 4.096 tokens en entrenamiento, inferior a la del modelo base.
- Riesgo de alucinación en documentación y comandos: la citación de fuentes es del 73 % en el conjunto de validación, por lo que no siempre se respalda en documentación recuperada.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible.
- Uso comercial permitido por la licencia Apache-2.0, sin restricciones adicionales indicadas por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ak2311581/hana-pskit-1.5b
- GGUF para llama.cpp / Ollama / Docker: https://huggingface.co/ak2311581/hana-pskit-1.5b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- py-serverless-kit en PyPI: https://pypi.org/project/py-serverless-kit/
- Perfil del autor: https://www.linkedin.com/in/asif-khan-31b7a8187/
