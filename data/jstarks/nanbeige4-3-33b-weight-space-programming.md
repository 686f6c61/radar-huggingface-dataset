# jstarks/Nanbeige4.3-33B-Weight-Space-Programming

## Resumen

Este repositorio no contiene un modelo de lenguaje completo, sino un conjunto de tres adaptadores LoRA en formato GGUF (8,63 MB en total) diseñados para modificar el comportamiento del modelo denso Nanbeige4.3-33B durante la inferencia. El autor, jstarks, aplica una técnica denominada "Weight-Space Programming" (WSP) de dos fases, sin entrenamiento por descenso de gradiente, que sintetiza los adaptadores en 21,19 segundos y los aplica mediante llama.cpp sobre la cuantización IQ2_XS del modelo base.

El problema que aborda es el de los cortes prematuros durante el razonamiento extendido (mid-think cutoffs) y la emisión incorrecta de llamadas a herramientas en tareas de agente. Según la model card, los adaptadores eliminan por completo esos cortes (de 34 a 0 sobre 145 tareas) y mejoran la puntuación combinada de 99/155 a 124/155 en un conjunto propio de benchmarks que incluye agent100, stem45 y terminal-bench sobre WSL2.

Es relevante porque demuestra que modificaciones de rango 8 y apenas 8,63 MB pueden alterar de forma medible el comportamiento de un modelo de 33B parámetros en un entorno de 12 GB de VRAM, con un incremento de velocidad de decodificación de 36,9 a 40,8 tok/s. No obstante, el alcance es experimental y los benchmarks son internos del autor, no evaluaciones estándar de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA rank-8 sobre LlamaForCausalLM denso (modelo base Nanbeige4.3-33B: 52 capas, hidden_size=7168, intermediate_size=22016, 56Q/8KV, head_dim=128, vocab_size=166912) |
| Parametros totales | 1.507.328 (adaptadores LoRA); el modelo base Nanbeige4.3-33B tiene 33B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens en la configuración de referencia (`-c 8192`) |
| Tipos de cuantizacion | Adaptadores en GGUF; modelo base en IQ2_XS (9,904 GiB); KV cache en q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tres adaptadores LoRA: wsp_nb_think_close.gguf, wsp_nb_restraint.gguf, wsp_nb_shell_action.gguf) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de tipo LlamaForCausalLM con 52 capas, sin softcapping en logits. Sobre él se aplican tres adaptadores LoRA de rango 8 que actúan en dos fases: la fase 1 cierra el bloque `</think>` frente a giros ruminativos ("Wait", "Actually", "However", "Hmm", "Alternatively", "Let"), y la fase 2 gestiona la contención anti-falsas llamadas `<tool_call>` y la emisión decisiva de comandos shell mediante `exec`. Los adaptadores se sintetizaron en forma cerrada en 21,19 segundos, sin descenso de gradiente, lo que constituye la innovación metodológica principal del trabajo.

No se documentan datos de entrenamiento en el sentido habitual (tokens, composición del dataset, RLHF o DPO), ya que la construcción es analítica y no basada en optimización. La model card menciona además un enrutador en tiempo de ejecución y scripts reproducibles, e incluye un modo de paridad exacta con el modelo base forzando todas las escalas LoRA a 0,0.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento extendido (`</think>`), con cierre controlado del bloque de razonamiento.
- Llamada a herramientas (tool calling) con contención frente a invocaciones falsas y cumplimiento de JSON en el segundo turno.
- Emisión de comandos shell para agentes de terminal (integración con terminal-bench sobre WSL2).
- Razonamiento matemático y STEM, evaluado en los conjuntos propios stem45 (MMLU-Pro, Math-500, GSM8K según los tags).
- Conversión de lenguaje natural a bash (nl2bash), con mejora reportada de 6/20 a 15/20 en el subconjunto EST_NL2BASH.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`, `/v1/models`, `/health`) con telemetría de enrutamiento `x_wsp`.
- Capacidades multilingües: no disponible.

## Casos de uso

- Agentes de terminal automatizados: el adaptador wsp_nb_shell_action emite comandos `exec` de forma decisiva, lo que permite encadenar episodios multi-turno en entornos Linux reales con terminación limpia (media de 6,1 comandos por episodio en las pruebas del autor).
- Automatización de tareas de administración de sistemas: la conversión de lenguaje natural a bash (nl2bash) facilita generar scripts de shell a partir de instrucciones en prosa, con una tasa de acierto reportada de 15/20 en el subconjunto establecido.
- Razonamiento matemático y STEM en producción ligera: el cierre garantizado del bloque de pensamiento evita respuestas truncadas en pipelines que dependen de la etiqueta `</think>`, algo crítico cuando se parsea la salida de forma automática.
- Despliegue en hardware de consumo: al ocupar 11,4-11,7 GiB en una RTX 4070 Ti de 12 GB con decodificación de 40,8 tok/s, es viable para prototipos y estaciones de trabajo con una sola GPU.
- Servicio compatible con OpenAI para integración en aplicaciones existentes: el proxy expuesto en `http://127.0.0.1:8090/v1` permite sustituir un endpoint comercial por este stack sin reescribir el cliente.
- Investigación en interpretabilidad mecanicista: los adaptadores sirven como herramienta para estudiar cómo modificaciones de bajo rango en el espacio de pesos alteran comportamientos concretos (cierre de razonamiento, contención de herramientas), con scripts reproducibles incluidos.
- Evaluación comparativa de técnicas WSP: el modo `--mode base` con escalas a 0,0 permite medir el efecto aislado de los adaptadores frente al modelo base en igualdad de condiciones.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 155 tareas propias, con temperatura 0,0:

| Configuracion | Adaptadores | 155 tareas | agent100 | stem45 | tbench10 (WSL2) | cut_mid_think | Decodificacion (tok/s) |
|---|---:|---:|---:|---:|---:|---:|---:|
| Base (scales=0) | 0 (0 MB) | 99/155 (63,9%) | 66/100 | 29/45 | 4/10 | 34/145 | 36,9 med / 36,8 mean |
| WSP-Lite inicial (Step 6) | 3 (8,63 MB) | 122/155 (78,7%) | 85/100 | 33/45 | 4/10 | 0/145 | 40,9 med / 40,6 mean |
| WSP-Lite final (nb_balanced) | 3 (8,63 MB) | 124/155 (80,0%) | 87/100 | 33/45 | 4/10 | 0/145 | 40,8 med / 40,4 mean |

Desglose adicional del conjunto agent100 en la configuración final: holdout 28/30 (93,3%), establecido 59/70, con EST_NL2BASH de 6/20 a 15/20 y EST_BFCL_IRR de 8/15 a 13/15. En stem45, STEM_MMLU_PRO pasa de 6/15 a 11/15. En tbench10, la media de comandos baja a 6,1 y el consumo a 644,5 tokens por episodio (-17,4% frente a los 780,0 del base). No se han publicado resultados en benchmarks estándar de la comunidad (MMLU, HumanEval, GSM8K oficiales) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 11.446-11.676 MiB cargados en una RTX 4070 Ti de 12.282 MiB, con `-ngl 99 -c 8192 -ctk q8_0 -ctv q8_0 --fit off`.
- GPU recomendadas: RTX 4070 Ti (12 GB) validada por el autor; tarjetas con 12 GB o más de VRAM en general; para contexto mayor o cuantizaciones superiores se necesitaría más memoria.
- Cabe en GPU de consumo: sí, en RTX 4070 Ti y presumiblemente en RTX 4080, RTX 4090 y equivalentes con 12 GB o más.
- Despliegue: llama.cpp (llama-server con soporte de IQ2_XS y `/lora-adapters`), más el script `run_nanbeige_lite.py` que actúa como proxy compatible con OpenAI. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: decodificación mediana de 40,8 tok/s y media de 40,4 tok/s en la configuración final; 36,9 tok/s en el base. El modelo base IQ2_XS (9,904 GiB) se descarga automáticamente en el primer arranque.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-Weight-Space-Programming (este) | 33B base + 1,5M en LoRAs | 8192 | LoRA WSP sin entrenamiento | Apache 2.0 | Hugging Face, 0 descargas |
| Nanbeige/Nanbeige4.3-33B (base) | 33B | no disponible | Transformer denso | Apache 2.0 | Hugging Face |
| bartowski/Nanbeige_Nanbeige4.3-33B-GGUF | 33B | no disponible | Cuantización GGUF del base | Apache 2.0 | Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría (adaptadores de interpretabilidad mecanicista sobre modelos de 33B) en la documentación proporcionada.

## Limitaciones y advertencias

- Los benchmarks son internos del autor, con conjuntos propios (agent100, stem45, tbench10) y sin validación independiente; no equivalen a evaluaciones estándar de la comunidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación externa.
- El rendimiento está medido sobre una única GPU (RTX 4070 Ti) y una cuantización muy agresiva (IQ2_XS), por lo que los resultados pueden no trasladarse a otras configuraciones.
- Los adaptadores dependen de la cuantización IQ2_XS concreta de bartowski; su comportamiento sobre otros formatos o cuantizaciones no está documentado.
- No se especifican los idiomas soportados ni sesgos conocidos del modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible; los adaptadores mitigan falsas llamadas a herramientas, pero no se documenta su efecto sobre la veracidad factual.
- La licencia Apache 2.0 permite uso comercial, pero al ser un trabajo experimental sin validación externa, su uso en producción conlleva riesgo no evaluado.
- El contexto está limitado a 8192 tokens en la configuración de referencia.
- Requiere llama.cpp mainline con soporte de IQ2_XS y `/lora-adapters`; versiones antiguas no funcionarán.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jstarks/Nanbeige4.3-33B-Weight-Space-Programming
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Cuantización GGUF del base (bartowski): https://huggingface.co/bartowski/Nanbeige_Nanbeige4.3-33B-GGUF
- GGUF IQ2_XS: https://huggingface.co/bartowski/Nanbeige_Nanbeige4.3-33B-GGUF/blob/main/Nanbeige_Nanbeige4.3-33B-IQ2_XS.gguf
- Script de ejecución: run_nanbeige_lite.py (incluido en el repositorio)
- Resultados de benchmarks: benchmarks/nanbeige_lite_results.json y benchmarks/nanbeige_followup_results.json (incluidos en el repositorio)
