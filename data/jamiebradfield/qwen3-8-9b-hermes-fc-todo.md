# JamieBradfield/qwen3.8-9b-hermes-fc-todo

## Resumen

`qwen3.8-9b-hermes-fc-todo` es un fine-tune QLoRA del modelo base `Empero/Qwen3.8-9B` (Apache-2.0), desarrollado por JamieBradfield como parte de una serie iterativa de experimentos sobre tool calling en modelos de 9B de parámetros. El modelo continúa el entrenamiento del checkpoint v26 (`qwen3.8-9b-hermes-fc-balanced`) con una dosis focalizada de trayectorias reales de la herramienta "todo" (gestión de tareas), más un experimento de condensación de prompts de sistema. Su relevancia radica en que demuestra, mediante SFT puro con solo 393 demostraciones de llamadas a la herramienta, que un modelo sub-10B puede aprender a usar de forma autónoma una herramienta de estado interactiva en tareas multi-paso novedosas, sin necesidad de RLVR (reinforcement learning from verifiable rewards).

Arquitectónicamente es un `Qwen3_5ForConditionalGeneration` con cabeza MTP (multi-token prediction) de 15 claves preservada del base, pero con la torre visual eliminada (solo texto). Tiene 9.195.119.616 parámetros (9.20B), vocabulario ampliado de 248077 a 248079 tokens (dos tokens añadidos: `<|tool_call|>` y `<|tool_response|>`), y se distribuye en pesos BF16 fusionados (12 shards, 18.4 GB) más una versión GGUF cuantizada. El entrenamiento usó una ventana máxima de 6144 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (text-only, cabeza MTP de 15 claves) |
| Parametros totales | 9.195.119.616 (9.20B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (entrenamiento con MAX_SEQ 6144) |
| Tipos de cuantizacion | BF16 (safetensors) y GGUF cuantizado (ROCmFPX) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, 12 shards) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de los pesos fusionados de v26 (`qwen3.8-9b-hermes-fc-balanced`), que ya incluía el sobre de tool-calling en formato XML Hermes y los tokens de herramienta. Sobre esa base se aplicó un QLoRA de 4 bits con rango 16, alpha 16, dropout 0, batch 1 con grad-accum 8 (tamaño efectivo 8), learning rate 2e-4, warmup 0.1 y una sola época de 214 pasos, con pérdida final de 0.1822. El dataset de entrenamiento consta de 1.706 filas en formato ShareGPT, con 393 llamadas a la herramienta "todo", distribuidas en cuatro bandas: 1.543 filas heredadas de v26 (trayectorias Hermes reales, SWE-rebench, APIGen y When2Call), 72 filas de bucles reales de la herramienta todo (traces del agente DJLougen con bucles validate→mutate→verify), 72 filas condensadas (mismos bucles con un stub de sistema de ~90 tokens en lugar del prompt completo de 6.3K–25.9K caracteres) y 19 filas de relleno de huecos (gap-fill) que combinan todo con herramientas de recuperación como `session_search`, `lcm_recall` y `lcm_grep`. La innovación técnica principal es el experimento de condensación de prompts y el uso de SFT puro para enseñar el uso autónomo de una herramienta de estado, lo que contradice la afirmación de que los modelos sub-10B no pueden aprender este comportamiento sin RLVR.

## Capacidades

- Generacion de texto en ingles con razonamiento multi-paso.
- Tool calling especifico para la herramienta "todo" (crear, mutar y verificar tareas) en formato de envelope XML Hermes.
- Function calling generico heredado de v26 (trayectorias Hermes, APIGen, When2Call).
- Ejecucion de bucles agénticos completos en una sola finalizacion: emite `<tool_call>todo</tool_call>`, simula la respuesta del usuario con `<tool_response>`, y continua con siguientes llamadas a herramientas como `search_files`.
- Capacidad de "reach-for" autonomo de la herramienta todo en tareas multi-paso novedosas (7/10 en el nivel 2 de la bateria de sondas).
- No soporta vision (torre visual eliminada) ni audio.
- Vocabulario ampliado con dos tokens de herramienta.

## Casos de uso

- Investigacion sobre comportamiento de tool-call en modelos de 9B: el modelo sirve como artefacto para estudiar como el SFT puro puede ensenar el uso de herramientas de estado interactivas, comparando con enfoques basados en RLVR.
- Experimentacion con agentes autonomos: su capacidad de emitir bucles completos validate→mutate→verify lo hace util para prototipar agentes que gestionan tareas de desarrollo (refactor, tests, documentacion) sin necesidad de un orquestador externo.
- Evaluacion de formatos de envelope XML: al entrenarse con el formato Hermes, permite probar la robustez de parsers de tool-calling en entornos de ejecucion compatibles.
- Estudio de condensacion de prompts: las filas condensadas del dataset permiten analizar como afecta la reduccion del prompt de sistema al rendimiento del tool-calling.
- Desarrollo de pipelines de CI/CD con gestion de tareas: el modelo puede integrarse en flujos donde se le pide planificar y ejecutar pasos de integracion continua (setup de CI, preparacion de releases) usando la herramienta todo.
- Pruebas de sobre-disparo (over-trigger): su comportamiento en peticiones triviales (nivel 3 de la bateria) es util para calibrar sistemas que necesitan decidir cuando no invocar herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor proporciona una bateria de evaluacion propia de 40 sondas en tres niveles, comparando v26 (el checkpoint anterior) con v27 (este modelo). Los resultados, con decodificacion greedy y el esquema de la herramienta todo presente en cada prompt, son:

| Nivel | Modelo | Disparos (fired) | name=todo | todos_ok | format_exact |
|---|---|---|---|---|---|
| T1 (trayectorias reales retenidas, 20) | v26 | 13/20 | 10/20 | 10/20 | 6/20 |
| T1 | v27 (este modelo) | 13/20 | 11/20 | 11/20 | 0/20 |
| T2 (tareas multi-paso novedosas, 10) | v26 | 9/10 | 3/10 | 1/10 | 1/10 |
| T2 | v27 | 9/10 | 7/10 | 7/10 | 3/10 |
| T3 (peticiones triviales, 10) | v26 | 7/10 | 1/10 | 1/10 | 3/10 |
| T3 | v27 | 5/10 | 1/10 | 1/10 | 2/10 |

La metrica principal es el salto en T2 de 3→7 en `name=todo` y de 1→7 en `todos_ok`, que indica que el modelo aprende a alcanzar la herramienta todo de forma autonoma en tareas novedosas. El `format_exact` de 0/20 en T1 se debe a que el modelo emite bucles agénticos completos en una sola finalizacion (envelopes perfectos pero seguidos de respuestas simuladas y mas llamadas), lo que falla la regex de envelope-only pero es parseable por el harness en vivo.

## Requisitos de hardware

- VRAM estimada para inferencia: ~18.4 GB en BF16 (pesos completos), ~9-10 GB en FP16 si se carga con precision mixta, y ~5-6 GB en cuantizacion de 4 bits (GGUF ROCmFPX).
- GPU recomendadas: para BF16 se necesita una GPU con al menos 24 GB de VRAM (RTX 4090, A100 40GB, L40S). Para 4 bits basta con 8 GB (RTX 3060, RTX 4060, A10G).
- Cabe en GPUs de consumo: si, en cuantizacion 4 bits cabe en tarjetas de 8 GB; en BF16 requiere una RTX 4090 o similar.
- Opciones de despliegue: compatible con transformers (libreria principal), vLLM, llama.cpp, Ollama y TGI. El autor menciona el uso de llama-server en el puerto 9088 para la evaluacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `qwen3.8-9b-hermes-fc-todo` (v27) | 9.20B | no disponible | Si (todo + generico) | Apache-2.0 | Hugging Face |
| `qwen3.8-9b-hermes-fc-balanced` (v26) | 9.20B | no disponible | Si (generico) | Apache-2.0 | Hugging Face |
| `Empero/Qwen3.8-9B` (base) | 9.20B | no disponible | No (0/45 en evaluacion del autor) | Apache-2.0 | Hugging Face |

La comparativa se limita a los modelos de la misma serie del autor, ya que no se dispone de datos de otros modelos comparables en la informacion proporcionada. La diferencia clave entre v26 y v27 es la capacidad de reach-for autonomo de la herramienta todo en tareas novedosas (T2: 3→7 en `name=todo`), mientras que el base no muestra ninguna capacidad de tool-calling.

## Limitaciones y advertencias

- El `format_exact` en T1 es 0/20: el modelo emite bucles agénticos completos en una sola finalizacion, lo que puede romper parsers que esperan un unico envelope XML por salida. El harness en vivo lo parsea correctamente, pero no es compatible con todos los runtimes.
- Sobre-disparo en peticiones triviales: en T3 dispara 5/10 veces, aunque solo 1/10 con `name=todo`; el resto son llamadas a otras herramientas, lo que indica una tendencia general a invocar herramientas en exceso.
- Solo soporta ingles; no hay datos de rendimiento en otros idiomas.
- Es un artefacto de investigacion, no un producto listo para produccion. El propio autor lo declara como un hito intermedio en una serie iterativa (v1→v28) y recomienda v28 como objetivo por defecto.
- No se han publicado evaluaciones en benchmarks estandar (MMLU, HumanEval, GSM8K), por lo que su rendimiento general fuera del dominio de tool-calling es desconocido.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantias y con un dataset de entrenamiento que mezcla fuentes publicas (SWE-rebench, APIGen, When2Call) y trayectorias propias del autor; conviene revisar las licencias de esas fuentes antes de un despliegue comercial.

## Enlaces

- Repositorio Hugging Face: [JamieBradfield/qwen3.8-9b-hermes-fc-todo](https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-todo)
- Modelo base: [Empero/Qwen3.8-9B](https://huggingface.co/Empero/Qwen3.8-9B)
- Checkpoint anterior (v26): [JamieBradfield/qwen3.8-9b-hermes-fc-balanced](https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-balanced)
- Checkpoint v2 (real-traces): [JamieBradfield/qwen3.8-9b-hermes-fc-real-traces](https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-real-traces)
- Pagina en FriendliAI para el modelo balanced: [friendli.ai/models/JamieBradfield/qwen3.8-9b-hermes-fc-balanced](https://friendli.ai/models/JamieBradfield/qwen3.8-9b-hermes-fc-balanced)
- Ficha en LLM Explorer: [llm-explorer.com/model/JamieBradfield%2Fqwen3.8-9b-hermes-fc-real-traces](https://llm-explorer.com/model/JamieBradfield%2Fqwen3.8-9b-hermes-fc-real-traces,2TEFMrMU8nw0D9NfSFX1GH)
