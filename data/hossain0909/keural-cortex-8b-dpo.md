# hossain0909/Keural-Cortex-8B-DPO

## Resumen

Keural-Cortex-8B-DPO es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3-8B-Base, desarrollado por el usuario hossain0909 (atribuido a MKD Co., Ltd. en la cita de la model card). Se trata de un asistente conversacional bilingue (coreano e ingles) de solo texto, derivado del modelo denso Qwen3-8B, que hereda su arquitectura y tokenizador y ha sido sometido a un pipeline de preentrenamiento continuado, extension de contexto, SFT y DPO.

El modelo resuelve la necesidad de un asistente con buen rendimiento en coreano, seguimiento de instrucciones, razonamiento explicito y tool calling, manteniendo una ventana de contexto ampliada a 65.536 tokens mediante YaRN (factor 2.0). Es relevante porque aplica DPO sobre un modelo Qwen3-8B ya extendido en contexto, con 4.473 pasos de DPO sobre 291.084 pares de preferencia, una cifra notable para un ajuste de este tipo.

La informacion disponible es limitada y el propio autor advierte que la bateria de benchmarks posterior al DPO no esta completa. La model card reporta solo comportamientos de servicio verificados y mediciones del predecesor (SFT v2), sin afirmar mejoras de rendimiento atribuibles al DPO. El numero de parametros declarado en la model card (8,19B) no coincide con el recuento real de safetensors (2.047.683.840), discrepancia que debe tenerse en cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM, decoder-only denso |
| Parametros totales | 8,19B (segun model card); 2.047.683.840 segun recuento real de safetensors (dato discrepante, no disponible confirmacion) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens (YaRN, factor 2.0) |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | Coreano (ko) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (repo de 16,4 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso basado en Qwen3ForCausalLM, con tokenizador Qwen3 y pesos en bfloat16. La codificacion posicional utiliza YaRN con factor 2.0 para extender el contexto hasta 65.536 tokens. No es un modelo entrenado desde cero: es un derivado de Qwen/Qwen3-8B-Base.

El linaje de entrenamiento documentado es: Qwen3-8B-Base, seguido de un preentrenamiento continuado de 41.000 millones de tokens, extension de contexto a 64K con YaRN, SFT v2 y finalmente DPO v1 en el paso 4.473, entrenado sobre 291.084 pares de preferencia. El DPO se orientó a mejorar el enrutamiento del bloque de razonamiento, las cadenas de herramientas secuenciales dependientes y la consistencia de identidad. La model card no detalla la composicion del dataset, el uso de RLHF adicional ni innovaciones como decodificacion especulativa o atencion lineal. Incluye un chat_template.jinja especifico para inferencia que abre el bloque de razonamiento con una linea semilla para favorecer el cierre con `</think>`.

## Capacidades

- Generacion de texto conversacional en coreano e ingles.
- Razonamiento explicito mediante bloque de pensamiento (`<think>...</think>`), activable con `enable_thinking: true`.
- Tool calling en formato JSON `<tool_call>`, compatible con el parser `hermes` de vLLM y `tool_choice: auto`.
- Cadenas de herramientas secuenciales dependientes y bucles de resultado de herramienta (verificado en el predecesor SFT v2).
- Memoria multi-turno y recuperacion de informacion en contexto largo (medido hasta 55K tokens en el predecesor).
- Modo de respuesta rapida sin razonamiento (`enable_thinking: false`).
- Seguimiento de instrucciones e identidad Keural/MKD (objetivo del DPO, pendiente de re-evaluacion).
- No dispone de capacidades de vision, audio ni otras modalidades (modelo solo texto).

## Casos de uso

- Asistencia conversacional en coreano: el modelo esta entrenado especificamente para coreano e ingles, por lo que puede gestionar conversaciones multi-turno de atencion al cliente o soporte interno con contexto de hasta 65.536 tokens.
- Agentes con tool calling: gracias al soporte de function calling en formato JSON y al parser `hermes`, puede integrarse en flujos de agente que invocan APIs, bases de datos o funciones internas, validando siempre los argumentos antes de ejecutar.
- Razonamiento paso a paso en tareas de matematicas o planificacion: activando `enable_thinking: true` se obtiene un bloque de razonamiento separado del contenido final, util para tareas de varios pasos (con la cautela de que la precision aritmetica no esta validada).
- Procesamiento de documentos largos en coreano: la ventana de 64K tokens permite resumir, extraer datos o responder preguntas sobre contratos, informes o transcripciones extensas.
- Generacion de codigo asistida: el modelo hereda capacidades de Qwen3 y admite tool calling, por lo que puede integrarse en pipelines que consultan repositorios o ejecutan pruebas, aunque el rendimiento en codigo no esta verificado tras el DPO.
- Traduccion y localizacion ko-en: por su naturaleza bilingue, puede emplearse para traduccion de contenido tecnico o de soporte entre coreano e ingles.
- Chat de baja latencia: con `enable_thinking: false` ofrece respuestas directas para interfaces de chat donde el razonamiento explicito no es necesario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la bateria de evaluacion posterior al DPO no esta completa y que no se deben extraer afirmaciones de rendimiento a partir de los prompts ni de la evaluacion del predecesor. El unico dato verificado es un test de aritmetica basica que produjo campos de razonamiento y respuesta correctamente separados pero una respuesta incorrecta (1 minuto en lugar de 5 minutos), lo que no constituye un benchmark.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Para un modelo denso de ~8B en bfloat16 se requieren aproximadamente 16 GB de pesos; con cuantizacion a 8 bits bajaría a unos 8-9 GB y a 4 bits a unos 4-5 GB, mas el espacio para cache KV (que con 65.536 tokens de contexto es significativo).
- GPU recomendadas: no especificadas por el autor. Por tamano, cabria en A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) en bfloat16 con contexto moderado.
- Consumer GPU: probablemente cabe en RTX 4090 (24 GB) y en GPUs de 16 GB con cuantizacion, aunque el contexto completo de 64K exige mas memoria para la cache KV.
- Despliegue: configuracion verificada con vLLM (`--max-model-len 65536 --reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser hermes`). No se documentan opciones con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Keural-Cortex-8B-DPO | 8,19B (declarado) | 65.536 | Apache-2.0 | Derivado de Qwen3-8B-Base con DPO; benchmarks pendientes |
| Qwen/Qwen3-8B-Base | ~8B | No disponible en la informacion | Apache-2.0 | Modelo base del que deriva; sin ajuste conversacional |
| Qwen3-8B (instruct) | ~8B | No disponible en la informacion | Apache-2.0 | Version oficial instruct de la familia Qwen3 |

La comparacion con alternativas de la misma categoria (por ejemplo, otros ajustes de Qwen3-8B o modelos densos de ~8B con contexto extendido) no esta disponible con datos de rendimiento verificables en la informacion proporcionada.

## Limitaciones y advertencias

- No existe un selector automatico de razonamiento validado; hay que elegir manualmente entre `enable_thinking: true` o `false` segun la tarea.
- Los resultados de benchmarks tras el DPO estan pendientes; no deben hacerse afirmaciones externas de rendimiento.
- La recuperacion en contexto largo se midio antes del DPO; el razonamiento y el seguimiento de instrucciones en contexto largo estan menos establecidos.
- El modelo puede alucinar, cometer errores aritmeticos (documentado en el test de fabrica), usar mal las herramientas o generar contenido inseguro; no sustituye el juicio profesional.
- La discrepancia entre los parametros declarados (8,19B) y el recuento real de safetensors (2.047.683.840) debe verificarse antes de planificar el despliegue.
- El soporte linguistico se limita a coreano e ingles; el rendimiento en otros idiomas no esta documentado.
- Licencia Apache-2.0, sujeta a las obligaciones de procedencia y de dataset documentadas por el proyecto; conviene revisar esas obligaciones para uso comercial.
- El parser de tool calling debe ser `hermes`; el parser `qwen3` de tool calling de vLLM no es compatible con este checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/hossain0909/Keural-Cortex-8B-DPO
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Repositorio alternativo citado en la model card: https://huggingface.co/mkd-hossain/Keural-Cortex-8B-DPO
- Papers, blogs, repos y demos adicionales: no disponible
