# saidutta69/LFM3-1.7B-Claude-Fable5.1

## Resumen

LFM3-1.7B-Claude-Fable5.1 es un ajuste fino (fine-tune) del modelo LiquidAI/LFM3-1.7B, desarrollado por el usuario independiente saidutta69 y publicado en Hugging Face. El objetivo del modelo es especializar un modelo de lenguaje pequeno (1.728 millones de parametros) en la emision de llamadas a herramientas (tool calling) con el esquema del protocolo de Claude Code, incluyendo herramientas como `Bash`, `Read`, `Write`, `Edit`, `Glob`, `Grep`, `WebFetch`, `WebSearch`, `TodoWrite`, `TaskCreate`, `TaskUpdate`, `TaskOutput` y `ToolSearch`. El modelo base ya era capaz de razonamiento agentico; este checkpoint refuerza la fidelidad al esquema de herramientas dentro de un arnes tipo Claude Code.

El modelo resuelve un problema concreto: en el modelo base, aproximadamente el 23% de las llamadas parseadas contenian nombres de herramienta inventados, lo que rompe bucles de agente. Este fine-tune elimina ese fallo (100% de nombres validos en las llamadas parseadas) a costa de un ligero aumento de la perplexity en texto libre (de 17,35 a 23,32 en wikitext), lo que lo convierte en un especialista y no en una mejora general del modelo base.

Es relevante ahora porque permite ejecutar un protocolo de agente tipo Claude Code en local con un modelo de 1,7B que ocupa 1,10 GB en cuantizacion Q4_K_M, lo que lo hace viable en CPU y en dispositivos de borde, con un contexto declarado de 262.144 tokens en los ficheros GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido LFM3 (modelo base LiquidAI/LFM3-1.7B) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (declarado en los GGUF) |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF); bf16 en safetensors |
| Idiomas soportados | Ingles (en) |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (bf16), GGUF (f16, Q8_0, Q6_K, Q5_K_M, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un transformer hibrido de la familia LFM3 de Liquid AI. El fine-tune se realizo mediante LoRA en bf16 sin cuantizacion, con rango r=32, alpha=64 y dropout de 0,05, aplicado a las proyecciones `q/k/v/o_proj`, a las convoluciones `in_proj`/`out_proj` y a las capas MLP `w1/w2/w3`. Se entrenaron 48.467 segmentos procedentes de 4.132 trazas, con ventanas de 4.096 tokens y enmascaramiento exclusivo del turno del asistente (los tokens de usuario, sistema y salidas de herramientas se marcan con -100). El esquema de entrenamiento consistio en 3.030 pasos, batch efectivo de 16, tasa de aprendizaje 1e-4 con decaimiento coseno y 3% de warmup, sobre una unica GPU RTX PRO 6000 Blackwell (102 GB) durante 6 horas y 39 minutos, con un pico de 31 GB de memoria. La perdida final fue de 0,200.

Los datos de entrenamiento provienen del split `claude_code` del dataset saidutta69/fable-5.1-premium-v2, elegido porque el split `fable_code` contenia 203.750 de 203.794 llamadas con marcadores de posicion genericos (como `<file_path>` o `<bash_command>`), lo que lo hacia inutil para la fidelidad de argumentos. Los esquemas de herramientas del dataset son reconstruidos, no los originales de Claude Code, por lo que no debe asumirse una paridad byte a byte con una instalacion real. Los esquemas se inyectan mediante la plantilla de chat propia de LFM3 con `enable_thinking=False`.

## Capacidades

- Generacion de llamadas a herramientas con nombres validos del protocolo Claude Code: `Bash`, `Read`, `Write`, `Edit`, `Glob`, `Grep`, `WebFetch`, `WebSearch`, `TodoWrite`, `TaskCreate`, `TaskUpdate`, `TaskOutput` y `ToolSearch`.
- Argumentos tipados y completos: el 100% de las llamadas parseadas presentan los argumentos requeridos y con tipos correctos.
- Soporte de tool calling y function calling a traves de la plantilla de chat del modelo base.
- Capacidad agentica y de razonamiento multi-paso heredada del modelo base LFM3.
- Generacion de codigo y comandos de shell dentro de las llamadas a herramientas.
- Conversacion multi-turno e instrucciones (chat, instruct).
- Capacidad de contexto largo (262.144 tokens declarados en los GGUF).
- Capacidad de ejecucion en CPU y en dispositivos de borde gracias a su tamano reducido.
- Modo thinking desactivable mediante `enable_thinking=False` en la plantilla de chat.

## Casos de uso

- Agentes de codificacion locales: el modelo emite llamadas `Read`, `Edit`, `Write` y `Bash` con nombres y argumentos validos, lo que permite integrarlo en un arnes tipo Claude Code que ejecute acciones sobre un repositorio sin romper el bucle por nombres de herramienta invalidos.
- Automatizacion de terminal y shell: con la herramienta `Bash` y comandos reales, puede encadenarse en flujos de automatizacion de tareas de sistema operativo en entornos controlados, con la ventaja de ocupar solo 1,10 GB en Q4_K_M.
- Busqueda y recuperacion de informacion en repositorios: las herramientas `Glob` y `Grep` permiten localizar ficheros y patrones dentro de un proyecto, adecuado para tareas de exploracion de codigo en local.
- Ejecucion en dispositivos de borde y CPU: al caber en 1,10 GB (Q4_K_M) y disponer de versiones GGUF para llama.cpp, es viable en portatiles sin GPU dedicada o en entornos con recursos limitados.
- Asistentes de desarrollo integrados en pipelines de CI/CD: puede generar y validar llamadas a herramientas en pasos automatizados de revision o generacion de codigo, con la garantia de que los nombres de herramienta son validos en el 100% de las llamadas parseadas.
- Prototipado de agentes con contexto largo: los 262.144 tokens declarados permiten mantener trazas de conversacion extensas en pruebas de agentes multi-paso, aunque el entrenamiento se realizo con ventanas de 4.096 tokens.
- Servicio de chat y respuesta a instrucciones: mantiene un rendimiento factual de 11/11 en la prueba de chat y matematicas del autor, por lo que puede usarse como asistente conversacional basico en ingles.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 100 muestras de test reservadas del split `claude_code`, decodificacion greedy y presupuesto de 2.048 tokens, comparando con el modelo base LFM3-1.7B:

| Metrica | LFM3-1.7B base | Este modelo |
|---|---|---|
| Perdida supervisada en test reservado | 1,731 | 0,233 |
| Inicia una llamada a herramienta | 97% | 100% |
| Llamada parseable | 97% | 95% |
| Nombre de herramienta valido (por muestra) | 75% | 95% |
| Nombre de herramienta valido (de las parseadas) | 77,3% | 100% |
| Argumentos requeridos presentes (de las parseadas) | 96,9% | 100% |
| Tipos de argumento correctos (de las parseadas) | 100% | 100% |
| Muestra de chat/matematicas | 11/11 factual | 11/11 factual |
| Perplexity en wikitext | 17,35 | 23,32 |

El 5% de llamadas no parseables se atribuye a truncamiento en el limite de 2.048 tokens, ya que el modelo genera cuerpos de `Write` y `Bash` mas extensos. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en bf16/f16, 1,85 GB en Q8_0, 1,43 GB en Q6_K, 1,26 GB en Q5_K_M y 1,10 GB en Q4_K_M.
- GPU recomendadas: el entrenamiento se realizo en una RTX PRO 6000 Blackwell (102 GB) con un pico de 31 GB, pero la inferencia cabe en GPUs consumer. Cualquier GPU con al menos 2 GB de VRAM libre puede ejecutar las cuantizaciones Q4_K_M y Q5_K_M.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares; tambien en CPU.
- Opciones de despliegue: llama.cpp (requiere compilacion reciente desde master, ya que el soporte de LFM3 es reciente), transformers con `trust_remote_code=True`, y Ollama a traves de los GGUF. vLLM y TGI no estan documentados en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-Claude-Fable5.1 | 1,728 M | 262.144 tokens | Tool calling Claude Code | lfm1.0 | Hugging Face (safetensors, GGUF) |
| LiquidAI/LFM3-1.7B | 1,7B (no disponible el dato exacto) | no disponible | Modelo general agentico | lfm1.0 | Hugging Face |
| Otros fine-tunes de LFM3-1.7B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks estandar para comparar con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Es un especialista, no una mejora general: la perplexity en wikitext sube de 17,35 a 23,32, y el modelado de texto libre se degrada. Para escritura general debe usarse el modelo base.
- El 5% de llamadas no parseables se debe al truncamiento en el limite de 2.048 tokens; es necesario aumentar el presupuesto de generacion o usar streaming para cerrar esas llamadas.
- Los esquemas de herramientas del dataset son reconstruidos, no los originales de Claude Code; no debe asumirse paridad byte a byte con una instalacion real.
- Solo soporta ingles (en); no se declara soporte multilingue.
- Riesgo de alucinacion en texto libre, agravado por el aumento de perplexity respecto al modelo base.
- La licencia lfm1.0 (etiquetada como "other") impone condiciones que deben revisarse en el fichero LICENSE antes de un uso comercial; no se detallan en la informacion disponible.
- El soporte de LFM3 en llama.cpp es reciente; es necesario actualizar llama.cpp desde master antes de cargar los GGUF.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- La fecha de creacion indicada (2026-11-01) es posterior a la fecha actual; debe verificarse la autenticidad y procedencia del repositorio antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidutta69/LFM3-1.7B-Claude-Fable5.1
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/saidutta69/fable-5.1-premium-v2
- Fichero de licencia: https://huggingface.co/saidutta69/LFM3-1.7B-Claude-Fable5.1/blob/main/LICENSE
