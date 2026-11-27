# ai-sage/GigaEdge-LLM

## Resumen

GigaEdge-LLM es un modelo de lenguaje compacto desarrollado por ai-sage, diseñado especificamente para function calling en el ambito del hogar inteligente (smart home) en ruso. Con 129,3 millones de parametros en su backbone autorregresivo (160,1 millones incluyendo 4 cabezas de Multi-Token Prediction para decodificacion especulativa), el modelo recibe una peticion del usuario junto con la escena del hogar y emite llamadas a herramientas compactas y paralelas para dispositivos Home Assistant, generando ademas una respuesta concisa en ruso. Su proposito es ejecutarse localmente en CPU sin conexion de red, lo que lo convierte en una opcion para despliegues on-device en hardware de borde.

El modelo parte de un backbone denso de estilo Qwen3 de 206M de parametros, al que se le practico una poda agresiva del vocabulario BPE original (de 128k a 8.448 tokens), reduciendo el backbone a 129,3M de parametros. Incorpora atencion de ventana deslizante (SWA) de 128 tokens en 15 de sus 18 capas, con atencion completa en las capas 6, 12 y 18, lo que mantiene pequena la memoria de la cache KV y acelera la inferencia en hardware de borde. El modelo se distribuye bajo licencia MIT, lo que facilita su adopcion comercial.

La relevancia actual del modelo radica en su enfoque de especializacion extrema: en lugar de competir en capacidades generales, optimiza un dominio concreto (control de dispositivos, salas, grupos, consultas de estado, aclaraciones y rechazos) con un consumo de tokens por turno muy bajo (26 de media) y un rendimiento que, segun la evaluacion interna del autor, se acerca a modelos mucho mayores como Gemma 4 E4B o Qwen 3.5 4B en ese dominio especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense `Qwen3ForCausalLM` (`qwen3`), 18 capas (15 sliding-window + 3 full attention, patron 5:1) |
| Parametros totales | 129,3M (AR, con 5,4M de embeddings atados); 160,1M con 4 cabezas MTP |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens nativos (`n_ctx: 3072` en la configuracion demo del SDK) |
| Tipos de cuantizacion | `full-Q4_0` PTQ (incluye embeddings y tensor de salida); checkpoint BF16 |
| Idiomas soportados | Ruso (`ru`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (BF16, 258,6 MB) y GGUF (`full-Q4_0`, 90,6 MB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de estilo Qwen3 con 18 capas decodificadoras, hidden size de 640 y FFN intermedio de 2.560. Emplea atencion con 10 cabezas de consulta y 2 de clave/valor (GQA) con QK-Norm, dimension de cabeza 128, y un patron de atencion 5:1: 15 capas con sliding window attention de 128 tokens y 3 capas con atencion completa (capas 6, 12 y 18). El vocabulario es un BPE podado de 8.448 tokens que cubre el 98,4% de los tokens del dominio smart home y anade tokens especiales dedicados a tipos de dispositivos, parametros y funciones. El checkpoint GGUF incorpora 4 capas NextN (cabezas MTP) para decodificacion especulativa fusionada en `giga-edge-sdk`, con `mtp_draft_max: 3` por defecto.

El entrenamiento siguio cinco fases: (1) preentrenamiento de un backbone denso Qwen3 de 206M con SWA 5:1; (2) poda del vocabulario de 128k a 8.448 tokens, que redujo el backbone de 206M a 129,3M de parametros; (3) SFT general en ruso (con las 4 cabezas MTP) seguido de aproximadamente 600k dialogos sinteticos multi-turno de smart home que cubren 28 tipos de dispositivos, 90 parametros, llamadas paralelas a herramientas, aclaraciones y rechazos, con pesos de perdida mayores en los tokens de llamada a funcion; (4) RL iterativo con GRPO, tareas filtradas por dificultad y validacion estricta de lotes de llamadas paralelas; y (5) cuantizacion PTQ `full-Q4_0` con perdida de calidad insignificante respecto a BF16. El modelo usa un formato de prompt compacto que coloca la escena estatica del hogar al inicio del primer turno de usuario, separada de la peticion por `<sep>`, y llamadas a funcion con tokens especiales y argumentos posicionales separados por `<arg_sep>`.

## Capacidades

- Generacion de texto conversacional en ruso orientada a respuestas concisas tras la ejecucion de herramientas.
- Function calling / tool calling con emision de llamadas paralelas en un mismo turno (ejecutadas secuencialmente antes de `<|message_sep|>` para su ejecucion paralela por el runtime anfitrion).
- Control de dispositivos de hogar inteligente: 28 tipos de dispositivos y 90 parametros (lectura/escritura y solo lectura).
- Consultas de estado de dispositivos, salas y grupos.
- Aclaraciones al usuario cuando la peticion es ambigua.
- Rechazos cuando la peticion queda fuera de alcance.
- Decodificacion especulativa mediante 4 cabezas MTP (solo en el checkpoint GGUF con `giga-edge-sdk`).
- Inferencia local en CPU sin conexion de red.
- No incluye vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Control por voz o texto de dispositivos del hogar: el modelo recibe la escena estatica (dispositivos, salas, parametros) y la peticion del usuario, y emite llamadas a funcion para encender, apagar o ajustar parametros de dispositivos concretos, con una media de 26 tokens por turno que reduce la latencia en asistentes embebidos.
- Asistente domotico on-device en hardware de borde: al ejecutarse en CPU sin red y con un GGUF de 90,6 MB, puede integrarse en dispositivos con recursos limitados (por ejemplo, hubs o altavoces inteligentes) donde no es viable enviar datos a la nube.
- Integracion con Home Assistant: el formato de prompt compacto y los tokens especiales para dispositivos y parametros permiten mapear directamente las llamadas a servicios de Home Assistant, gestionando salas, grupos y estados.
- Gestion de peticiones ambiguas: el modelo puede solicitar aclaraciones cuando la peticion no identifica un dispositivo o parametro de forma unica, y rechazar peticiones fuera de su dominio (musica, temporizadores, fecha/hora), lo que simplifica el enrutado en un sistema multi-agente.
- Ejecucion de lotes de acciones paralelas: en una sola interaccion puede emitir varias llamadas independientes (por ejemplo, encender varias luces de una sala) que el runtime ejecuta en paralelo, reduciendo el numero de turnos necesarios.
- Despliegue en pipelines de automatizacion del hogar: al soportar `transformers` y `text-generation-inference` ademas del SDK propietario, puede integrarse en servicios backend que traduzcan las llamadas a la API de domotica correspondiente.
- Prototipado e investigacion en function calling de bajo coste: su tamano reducido y licencia MIT permiten fine-tuning y experimentacion en dominios de control de dispositivos sin grandes presupuestos de computo.

## Benchmarks y rendimiento

Evaluacion interna del autor sobre 6 benchmarks rusos de smart home (LLM-as-a-judge `Gemma 4 31B`, puntuacion global de 1 a 5; intervalos de confianza del 95% por bootstrap a nivel de dialogo con 10.000 remuestreos). `Avg. tokens/turn` es la media no ponderada en los mismos 6 benchmarks e incluye todas las rondas de tool calling y tokens de thinking.

| Modelo | Modo | Parametros | Puntuacion (1-5) | IC 95% | Tokens/turno |
|---|---|---:|---:|---:|---:|
| Gemma 4 E4B | thinking | 8,0B | 4,60 | [4,57, 4,62] | 520 |
| Qwen 3.5 4B | thinking | 4,7B | 4,52 | [4,48, 4,56] | 626 |
| Gemma 4 E2B | thinking | 5,1B | 4,35 | [4,31, 4,39] | 610 |
| Qwen 3.5 4B | instant | 4,7B | 4,32 | [4,27, 4,36] | 128 |
| **GigaEdge-LLM (BF16)** | **instant** | **129M** | **4,24** | **[4,20, 4,28]** | **26** |
| **GigaEdge-LLM (full-Q4_0)** | **instant** | **129M** | **4,24** | **[4,20, 4,28]** | **26** |
| Gemma 4 E4B | instant | 8,0B | 4,17 | [4,13, 4,20] | 56 |
| Gemma 4 E2B | instant | 5,1B | 3,72 | [3,67, 3,76] | 62 |
| Qwen 3.5 2B | thinking | 2,3B | 3,36 | [3,31, 3,42] | 3140 |
| Qwen 3.5 2B | instant | 2,3B | 3,16 | [3,10, 3,21] | 310 |
| Qwen 3.5 0.8B | instant | 0,87B | 2,40 | [2,35, 2,45] | 217 |
| Qwen 3.5 0.8B | thinking | 0,87B | 2,15 | [2,10, 2,19] | 2628 |

No se han publicado otros benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint BF16 (258,6 MB) requiere aproximadamente 0,26 GB de memoria; el GGUF `full-Q4_0` (90,6 MB) requiere aproximadamente 0,09 GB. La cache KV es reducida gracias a la SWA de 128 tokens en 15 de las 18 capas.
- GPU recomendadas: no requiere GPU; el caso de uso objetivo es CPU on-device. Puede ejecutarse en cualquier GPU consumer (RTX 4090, etc.) sin problemas de memoria, aunque no es su escenario previsto.
- Cabe en GPU consumer: si, en cualquier GPU consumer e incluso en CPU de gama baja.
- Opciones de despliegue: `giga-edge-sdk` (componente `function_calling/` con GGUF y MTP), `transformers` (checkpoint BF16), `text-generation-inference` (segun tags del repositorio), llama.cpp/Ollama mediante el GGUF (no confirmado explicitamente en la informacion disponible).
- Latencia y throughput: no se han publicado cifras concretas de latencia o throughput en la informacion disponible; el autor indica que la SWA y la decodificacion especulativa aceleran la inferencia en hardware de borde, y que la media de 26 tokens por turno reduce el coste computacional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Puntuacion dominio (1-5) | Tokens/turno | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| GigaEdge-LLM | 129M | 4.096 | 4,24 | 26 | MIT | Hugging Face |
| Qwen 3.5 0.8B | 0,87B | no disponible | 2,40 (instant) | 217 | no disponible | no disponible |
| Qwen 3.5 2B | 2,3B | no disponible | 3,16 (instant) | 310 | no disponible | no disponible |
| Gemma 4 E2B | 5,1B | no disponible | 3,72 (instant) | 62 | no disponible | no disponible |
| Gemma 4 E4B | 8,0B | no disponible | 4,17 (instant) | 56 | no disponible | no disponible |

GigaEdge-LLM ofrece la mejor puntuacion en modo instant entre los modelos comparados de menor tamano (Qwen 3.5 0.8B y 2B), con un consumo de tokens por turno muy inferior, aunque queda por debajo de Gemma 4 E4B y Qwen 3.5 4B en modo thinking. La comparativa se limita al dominio smart home en ruso evaluado por el autor; no hay datos de benchmarks generales para comparar.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente para control de hogar inteligente (dispositivos, salas, grupos, consultas de estado, aclaraciones y rechazos). Dominios como reproduccion de musica, temporizadores/ alarmas y consultas de fecha/hora estan excluidos intencionadamente.
- Solo ruso: el unico idioma soportado es el ruso; no se ha entrenado para otros idiomas.
- No comprueba el estado de los dispositivos: si se le pide subir el volumen de un televisor apagado, sube el volumen pero no lo enciende; el comportamiento correcto en ese caso depende de la integracion del dispositivo.
- Riesgo de alucinacion: no se han publicado datos especificos sobre tasas de alucinacion en la informacion disponible; como modelo pequeno y especializado, puede generar llamadas a funciones o parametros inexistentes fuera de la escena proporcionada.
- Sesgos: no se han publicado analisis de sesgos en la informacion disponible.
- Limitacion de contexto: 4.096 tokens nativos, con `n_ctx: 3072` en la configuracion demo del SDK; la escena del hogar debe caber en ese presupuesto.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias explicitas sobre el rendimiento en produccion fuera del dominio evaluado.
- Dependencia del formato de prompt: el modelo espera un formato compacto especifico con tokens especiales (`<sep>`, `<arg_sep>`, `<|role_sep|>`, `<|message_sep|>`); un formato incorrecto puede degradar el rendimiento.
- Evaluacion limitada: los resultados provienen de 6 benchmarks internos del autor con un juez LLM, no de benchmarks estandar de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ai-sage/GigaEdge-LLM
- Repositorio del SDK: https://github.com/salute-developers/giga-edge-sdk
- No se han encontrado otros enlaces (papers, blogs, demos) en la informacion disponible.
