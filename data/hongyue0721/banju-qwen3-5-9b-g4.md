# hongyue0721/banju-qwen3.5-9b-g4

## Resumen

Banju Qwen3.5-9B G4 (伴居适老智能家居边缘主模型) es un ajuste fino de Qwen/Qwen3.5-9B desarrollado por hongyue0721, orientado a la domótica y la asistencia a personas mayores en despliegue local (edge). El modelo parte de los 8.953.803.264 parámetros del modelo base y se distribuye con pesos fusionados en BF16 (safetensors) y varias cuantizaciones GGUF, incluida una versión calibrada con `imatrix` específica del dominio.

El autor lo presenta como un agente de doble vía ("G4 双轨"): una vía de emoción y conversación (SFT + DPO) y una vía de herramientas (SFT de contexto largo con enrutado estructurado, contratos de decisión y trayectorias multi-paso en sandbox). El objetivo declarado es combinar decisiones de intención estructuradas y fiables con una conversación natural y contenida para acompañamiento de personas mayores, evitando derivas médicas y respuestas mecánicas.

Es relevante ahora porque ejemplifica el patrón de modelos pequeños (9B) especializados por dominio y desplegables en hardware local, con un paquete completo de adaptadores LoRA/DPO, matriz de calibración y resúmenes de evaluación por precisión. La licencia Apache 2.0 y la disponibilidad en GGUF facilitan su integración en pipelines de inferencia en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, `qwen3_5_text`); detalles internos no disponibles |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (comando de referencia `-c 32768`); máximo nativo del base no disponible |
| Tipos de cuantizacion | BF16; GGUF Q4_K_M con `imatrix` (5,0660 BPW, ~5,3 GiB); Q4_K_M sin calibrar (~5,3 GiB); Q8_0 (~8,9 GiB); BF16 GGUF (~17 GiB) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 fusionado), GGUF (Q4_K_M, Q8_0, BF16), adaptadores LoRA en `adapters/` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only del base Qwen3.5-9B; la model card no detalla capas, cabezas ni mecanismos de atención. El ajuste se organiza en dos vías desacopladas que después se fusionan linealmente. La vía EQ combina un SFT QLoRA/BF16 LoRA sobre 1.800 muestras de empatía y pautas de seguridad para personas mayores (`eval_loss=1.3777`) con un DPO sobre 1.000 pares de preferencias (`train_loss=0.2998`, `rewards/accuracies=0.95`, `rewards/margins=4.214`). La vía Tool aplica SFT de contexto largo sobre 2.200 muestras de enrutado estructurado, contratos de decisión de un salto y trayectorias multi-paso en sandbox, con entrenamiento sin truncamiento (longitud máxima 9.687) durante 2 épocas (`train_loss=0.2758`, `eval_loss=0.1994`).

Entre las innovaciones técnicas declaradas destacan el uso de entropía cruzada con truncamiento enmascarado (cálculo de logits de `lm_head` solo en las posiciones supervisadas de la respuesta), agrupación por longitud con batching dinámico, la fusión ponderada de ambas vías (`tool_weight=1.0`, `eq_weight=0.85`) y una matriz de calibración `imatrix` generada con 315 muestras del dominio Banju más datos públicos. El autor indica además que el ajuste elimina el bucle de razonamiento infinito del base en conversación cuando `thinking` está activado.

## Capacidades

- Generación de texto conversacional en chino e inglés, con tono adaptado a personas mayores.
- Enrutado estructurado de intenciones (`banju_router`) con FP=0,0 % en la configuración Q4_K_M-imatrix sin thinking.
- Tool calling y function calling con esquemas validados (Schema=98,8 % en `banju_main`).
- Razonamiento multi-paso con trayectorias de entorno en sandbox (`banju_sandbox`).
- Decisiones contractuales de un solo salto (`banju_contract`).
- Respuesta empática con pautas de seguridad (100 % en `banju_eq` en varias configuraciones, sin violaciones de línea roja en `cpsycoun`).
- Modo thinking opcional (`enable_thinking`), con mejor enrutado pero peor rendimiento en contrato y mayor coste de latencia.
- No se declaran capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistente doméstico local: el modelo enrutaría comandos de voz ya transcritos hacia dispositivos del hogar, con FP=0,0 % en falsos positivos de enrutado en la versión recomendada, lo que reduce activaciones erróneas de actuadores.
- Acompañamiento conversacional de personas mayores: la vía EQ, con DPO sobre 1.000 pares, ofrece respuestas naturales y contenidas sin derivas médicas, adecuada para conversaciones multi-turno en el domicilio.
- Automatización de rutinas con tool calling: el 98,8 % de validez de esquema permite encadenar llamadas a funciones (luces, climatización, recordatorios) con validación estricta de argumentos.
- Recordatorios y seguimiento de rutinas: el contexto de 32.768 tokens permite mantener el historial de la jornada y el estado de las tareas pendientes en una sola ventana.
- Despliegue en hardware de borde sin GPU dedicada: la cuantización Q4_K_M-imatrix de ~5,3 GiB cabe en equipos con 8 GB de RAM y ofrece un throughput de 126,6–128,9 tok/s en A100, lo que sugiere viabilidad en mini-PC y cajas domésticas.
- Triaje de emergencias domésticas: la vía de enrutado prioriza rutas de seguridad ante situaciones críticas, con un 86,3 % de acierto en modo thinking y un 18,2 % de falsos negativos críticos que deben cubrirse con reglas externas.
- Integración en asistentes de voz con baja latencia: con TTFS P50 de 277,1 ms y respuesta completa P50 de 476,8 ms en A100, encaja en pipelines de diálogo por turnos.

## Benchmarks y rendimiento

Banju Core 313 (evaluación propia del autor; `G0` es Qwen3.5-9B sin ajustar):

| Modelo / precisión | Thinking | Router (73) | Main (80) | Contract (48) | Sandbox (48) | EQ (64) |
|---|---|---|---|---|---|---|
| G0 Q4_K_M | off | 45,2 % | 43,8 % | 54,2 % | 64,6 % | 98,4 % |
| G0 Q4_K_M | on | 94,5 % | 48,8 % | 58,3 % | 62,5 % | 0,0 % (16/16 vacías) |
| G4 Q4_K_M-imatrix | off | 67,1 % (FP=0,0 %) | 82,5 % (Schema=98,8 %) | 77,1 % | 75,0 % | 100,0 % |
| G4 Q4_K_M-raw | off | 61,6 % | 77,5 % | 81,2 % | 72,9 % | 100,0 % |
| G4 Q8_0 | off | 72,6 % | 78,8 % | 83,3 % | 81,2 % | 98,4 % |
| G4 BF16 | off | 69,9 % | 77,5 % | 85,4 % | 79,2 % | 100,0 % |
| G4 Q4_K_M-imatrix | on | 86,3 % (CritFN=18,2 %) | 77,5 % | 70,8 % | 75,0 % | 98,4 % |

Validación de olvido catastrófico en benchmarks públicos (G4 Q4_K_M-imatrix, thinking off, 1.618 preguntas):

| Dataset | Preguntas | G0-off | G4 Q4_K_M-imatrix (off) |
|---|---|---|---|
| massive_zh | 560 | 81,1 % | 81,8 % (Macro-F1=80,8 %, Coarse=92,0 %) |
| bfcl | 200 | 85,5 % | 80,0 % |
| acebench_zh | 300 | 72,7 % | 66,3 % |
| emobench_zh | 200 | 63,5 % | 58,5 % (EU=0,55, EA=0,62) |
| cpsycoun | 45 | 100,0 % | 100,0 % |

Evaluación ciega de EQ (64 preguntas, juez `deepseek-v4.1-flash`, posiciones intercambiadas): G4 Q4_K_M-imatrix (off) frente a G0-off, tasa neta de victoria del 64,4 % (win=29, loss=16); frente a gemini-3.8-flash, 25,0 % (win=12, loss=36); frente a gpt-6.2-sol, 26,7 % (win=12, loss=33). Rendimiento en A100-40GB con `llama-server -np 1 -c 32768 -fa on`: 126,6–128,9 tok/s de decodificación.

## Requisitos de hardware

- VRAM/RAM estimada: ~5,3 GiB para Q4_K_M-imatrix, ~8,9 GiB para Q8_0, ~17 GiB para GGUF BF16 y ~18 GiB para safetensors BF16 (más overhead de contexto KV).
- GPU recomendadas: A100-40GB (mediciones del autor), H100 para mayor concurrencia; en consumer, RTX 4090 (24 GB) permite Q8_0 o BF16 con contexto reducido, y RTX 3090/4080 (16–24 GB) cubren Q4_K_M y Q8_0.
- Cabe en GPU de consumo: sí; Q4_K_M-imatrix cabe incluso en GPUs de 8 GB y en equipos sin GPU dedicada con 8 GB de RAM.
- Despliegue: llama.cpp / `llama-server` (comando de referencia con `-fa on -ctk q8_0 -ctv q8_0 --jinja`), vLLM y transformers para los pesos safetensors; Ollama y TGI no están documentados explícitamente por el autor.
- Latencia y throughput: 126,6–128,9 tok/s en A100-40GB a una sola secuencia; TTFS P50 de 277,1 ms y respuesta completa P50 de 476,8 ms en la tarea EQ. El autor advierte que estas cifras no equivalen a las de una caja de borde sin GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Banju Qwen3.5-9B G4 | 8,95 B | 32.768 (referencia) | Domótica y asistencia a mayores, tool calling | Apache 2.0 | HF: safetensors BF16 + GGUF Q4/Q8/BF16 + adaptadores |
| Qwen/Qwen3.5-9B (base) | 8,95 B | No disponible | Propósito general | No disponible en la información | HF |
| Gemini 3.8 Flash (usado como juez) | No disponible | No disponible | Propósito general en la nube | Propietaria | API |
| GPT-6.2-sol (usado como juez) | No disponible | No disponible | Propósito general en la nube | Propietaria | API |

Los dos modelos en la nube solo aparecen como referencia de calidad conversacional en la evaluación ciega del autor (25,0 % y 26,7 % de victoria neta para G4), no como alternativas desplegables en local.

## Limitaciones y advertencias

- Sesgos: no se documentan análisis de sesgo demográfico, cultural o de género; el dominio de entrenamiento (domótica y mayores, en chino) puede trasladar sesgos de ese corpus.
- Alucinación: no se publican métricas específicas de factualidad fuera del dominio; el modelo está especializado y su rendimiento en conocimiento general no se ha medido.
- Idiomas: solo chino e inglés declarados; el castellano no está soportado de forma oficial y su calidad sería incierta.
- Contexto: la ventana de referencia es de 32.768 tokens; no se especifica el máximo nativo ni el comportamiento más allá de esa longitud.
- Seguridad: en modo thinking, el enrutado alcanza un 18,2 % de falsos negativos críticos; para rutas de emergencia se requiere una capa de reglas externa.
- Regresión en benchmarks públicos: bfcl cae de 85,5 % a 80,0 %, acebench_zh de 72,7 % a 66,3 % y emobench_zh de 63,5 % a 58,5 % respecto al base.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar las condiciones del modelo base Qwen3.5-9B.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; las evaluaciones son internas del autor y no han sido replicadas de forma independiente.
- El repositorio ocupa 57,8 GB, lo que incluye pesos en varios formatos y adaptadores; el despliegue debe seleccionar solo los artefactos necesarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hongyue0721/banju-qwen3.5-9b-g4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios o demos.
