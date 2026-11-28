# hongyue0721/banju-qwen3.5-9b-g4

## Resumen

Banju-Pal (伴居适老智能家居边缘代理模型) es un modelo de lenguaje especializado en domótica para personas mayores, desarrollado por el usuario hongyue0721 a partir de Qwen/Qwen3.5-9B. Resuelve el problema de orquestar conversaciones de asistencia en el hogar con un contrato estricto de llamada a herramientas (30 herramientas JSON), gating de escucha pasiva sin falsos positivos y respuestas de acompañamiento breves y empáticas en chino. Su relevancia radica en que demuestra que un modelo de 9B puede ejecutarse en una GPU de consumo profesional de 16 GB (Tesla T4) con latencia de primera frase inferior al segundo.

La arquitectura subyacente es un transformer denso Qwen3.5 de 8.953.803.264 parámetros, ajustado mediante una receta de doble vía: SFT de empatía más DPO sobre 1.000 pares de preferencia, combinado linealmente con un SFT de tool calling de contexto largo (hasta 9.687 tokens por trayectoria). El resultado se distribuye en safetensors BF16, adaptadores LoRA y cuantizaciones GGUF calibradas con una matriz imatrix de dominio.

El modelo está pensado para despliegue en el borde (edge), no en la nube: la model card reporta inferencia en una Tesla T4 con Q4_K_M-imatrix a 35,52 tok/s de decodificación y un TTFS P50 de primera frase inferior a un segundo. La licencia Apache 2.0 y la publicación del dataset de trayectorias facilitan su reutilización y auditoría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, tipo `qwen3_5_text`) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 16.384 tokens en despliegue (`-c 16384`); trayectorias de entrenamiento de hasta 9.687 tokens |
| Tipos de cuantizacion | BF16 (safetensors), GGUF Q8_0, GGUF Q4_K_M con imatrix, GGUF Q4_K_M sin imatrix (raw), GGUF BF16 |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 fusionado), GGUF (Q4_K_M, Q8_0, BF16), adaptadores LoRA/DPO en `adapters/` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso con atención estándar, y se ajusta con una receta de "doble vía desacoplada": una vía de empatía (EQ) y una vía de herramientas (Tool). La vía EQ consiste en un LoRA de alto rango en BF16 sobre 1.800 trayectorias de acompañamiento para mayores (`eval_loss=1.3777`), seguido de DPO sobre 1.000 pares de preferencia (`rewards/accuracies=0.95`, margen 4.214) para imponer límites como la no emisión de diagnósticos médicos y la resistencia a estafas. La vía Tool aplica SFT de contexto largo sobre 2.200 trayectorias de sandbox de estado doméstico, con `max_len=9.687` sin truncamiento y `eval_loss=0.1994`.

Técnicamente destacan varias decisiones: el uso de cross-entropy enmascarada con `logits_to_keep` para supervisar solo posiciones activas, bucketing dinámico múltiplo de 256 que reduce el pico de VRAM de más de 40 GiB (OOM) a 24,51 GiB en secuencias de 10.500 tokens, y el enmascaramiento de la pérdida del primer turno en trayectorias de auto-reparación de dos rondas. Ambas vías se fusionan linealmente en el espacio de parámetros con `tool_weight=1.0` y `eq_weight=0.85`. El dataset se filtró con cuatro puertas deterministas (validación de contrato `_preflight`, sandbox en memoria `InMemoryKernelSandbox`, líneas rojas `redlines.py` y defensa anti-fuga 3-gram con `held_out_leakage=0`). La cuantización Q4_K_M se calibró con una matriz imatrix de 315 fragmentos de contrato de herramientas y lenguaje coloquial para mayores.

## Capacidades

- Generación de texto conversacional en chino e inglés, con registro adaptado a personas mayores (frases cortas, tono pausado).
- Llamada a herramientas (tool calling) con contrato JSON estricto sobre 30 herramientas de domótica.
- Auto-reparación en dos rondas: detecta una llamada inválida en el primer turno y la corrige en el segundo.
- Razonamiento multi-paso con sandbox de estado del hogar (secuencias de acciones encadenadas sobre el estado de los dispositivos).
- Gating de escucha pasiva (router): decide si intervenir o permanecer en silencio, con tasa de falsos positivos del 0,0 % en la configuración recomendada.
- Acompañamiento empático con límites de seguridad: sin diagnósticos médicos, con resistencia a manipulación y con control de volumen conversacional.
- Modo thinking conmutable; en el ajuste se eliminó el fallo de respuestas vacías (`0.0%` de respuestas vacías) que el modelo base presentaba al activar thinking.
- Capacidades multilingües limitadas a chino e inglés.

## Casos de uso

- Asistente de voz para el hogar de personas mayores: el modelo gestiona conversaciones multi-turno y decide cuándo intervenir sin interrumpir, gracias a su router con 0,0 % de falsos positivos y a su latencia de primera frase inferior a un segundo en T4 con Q4_K_M.
- Control de dispositivos por lenguaje natural: traduce peticiones coloquiales ("hace frío") en llamadas JSON a las 30 herramientas de domótica (termostato, luces, persianas, etc.) con validación de esquema del 97,5-98,8 %.
- Automatización de rutinas multi-paso: usa el sandbox de estado para encadenar acciones condicionales (por ejemplo, apagar la cocina y avisar al familiar) verificando el estado final antes de responder.
- Detección y bloqueo de fraudes telefónicos: la vía EQ con DPO está entrenada para no validar peticiones sospechosas y para proteger la dignidad del usuario sin confrontación directa.
- Despliegue en dispositivos de borde sin conectividad: con Q4_K_M-imatrix ocupa 5.469 MiB en una T4 de 16 GB, dejando 9,7 GiB libres, lo que permite ejecutarlo junto a otros servicios en el mismo equipo.
- Investigación en agentes de dominio restringido: el dataset de 17.000 trayectorias SFT y 1.000 pares DPO, junto con los adaptadores LoRA publicados, sirve como base reproducible para estudiar fusión de adaptadores y calibración imatrix.
- Generación de resúmenes de estado del hogar para cuidadores: a partir del estado del sandbox, el modelo puede redactar informes breves en chino para familiares, con el tono controlado que impone el ajuste EQ.

## Benchmarks y rendimiento

La model card reporta una evaluación propia de 313 preguntas con cinco subconjuntos (`banju_router` 73, `banju_main` 80, `banju_contract` 48, `banju_sandbox` 48, `banju_eq` 64). Resultados destacados en Q4_K_M-imatrix:

| Modelo / configuración | Router | Main | Contract | Sandbox | EQ |
|---|---:|---:|---:|---:|---:|
| Banju-Pal Q4_K_M-imatrix (T4, thinking off) | 69,9 % (FP 0,0 %) | 76,2 % (schema 97,5 %) | 81,2 % | 81,2 % | 100,0 % |
| Banju-Pal Q4_K_M-imatrix (A100, thinking off) | 67,1 % (FP 0,0 %) | 82,5 % (schema 98,8 %) | 77,1 % | 75,0 % | 100,0 % |
| Banju-Pal Q8_0 (T4) | 72,6 % | 82,5 % | 81,2 % | 75,0 % | 100,0 % |
| Banju-Pal BF16 (A100, 4 concurrentes) | 69,9 % | 77,5 % | 85,4 % | 79,2 % | 100,0 % |
| Qwen3.5-9B base Q4_K_M (T4, thinking off) | 45,2 % | 43,8 % | 54,2 % | 64,6 % | 98,4 % |
| Qwen3.5-9B base Q4_K_M (T4, thinking on) | 94,5 % | 48,8 % | 58,3 % | 62,5 % | 0,0 % (16/16 vacías) |
| Referencia en nube (deepseek-v4.1-flash) | 95,9 % | 87,5 % | 97,9 % | 83,3 % | 100,0 % |

Comparativa entre familias en la misma batería de 313 preguntas y Q4_K_M: Banju-Pal 79,6 % de media en las tres pruebas de "trabajo real", Qwen3.5-9B original 54,2 %, Qwen3-8B 40,8 %, Qwen2.5-7B 29,9 %, Llama-3.1-8B 13,5 % y GLM-4-9B 0,0 % (no emitió llamadas de herramienta bajo este protocolo).

Rendimiento de infraestructura en Tesla T4 (16 GB, `-c 16384 -np 1 --thinking off`):

| Formato | VRAM | Decode TPS | TTFT frío → caliente (prompt 4,5k) | TTFS P50 primera frase |
|---|---:|---:|---:|---:|
| BF16 en GPU completa | OOM al iniciar | — | — | — |
| BF16 auto-fit (GPU+CPU) | 13.897 MiB | 8,57 tok/s | 22.773 ms → 2.329 ms | 1.498,7 ms |
| Q8_0 | 8.651 MiB | 26,78 tok/s | 4.515 ms → 547 ms | 1.269,5 ms |
| Q4_K_M-raw | 5.469 MiB | 35,02 tok/s | 4.593 ms → 478 ms | 967,7 ms |
| Q4_K_M-imatrix | 5.469 MiB | 35,52 tok/s | 4.523 ms → 464 ms | no disponible en el extracto |

## Requisitos de hardware

- VRAM estimada: 5.469 MiB con Q4_K_M-imatrix, 8.651 MiB con Q8_0 y aproximadamente 17,1 GiB con GGUF BF16 (no cabe en GPU de 16 GB en modo completo; requiere auto-fit GPU+CPU).
- GPU recomendadas: Tesla T4 de 16 GB (objetivo declarado, con resultados medidos), A100 para BF16 y concurrencia, G4 Blackwell (mencionada en los resúmenes de evaluación).
- GPU de consumo: una RTX 4090 de 24 GB puede alojar Q8_0 y BF16 GGUF; Q4_K_M-imatrix cabe en tarjetas de 8 GB o más con margen amplio.
- Opciones de despliegue: `transformers` y `vLLM` para safetensors BF16; `llama.cpp` para los GGUF (incluida la matriz imatrix); endpoints compatibles según el tag `endpoints_compatible`.
- Latencia y throughput medidos en T4: 35,52 tok/s de decodificación con Q4_K_M-imatrix y TTFT caliente de 464 ms para prompts de 4,5k tokens; el BF16 con auto-fit cae a 8,57 tok/s y no es apto para voz en tiempo real (hasta 35,3 s por decisión principal).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media en 313 pruebas (Q4_K_M) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Banju-Pal | 8,95B | 16k en despliegue | 79,6 % | Apache 2.0 | Hugging Face (safetensors, GGUF, LoRA) |
| Qwen3.5-9B (base) | 9B aprox. | no disponible | 54,2 % | no disponible en la información | Hugging Face |
| Qwen3-8B | 8B aprox. | no disponible | 40,8 % | no disponible en la información | Hugging Face |
| Llama-3.1-8B | 8B aprox. | no disponible | 13,5 % | no disponible en la información | Hugging Face |
| GLM-4-9B | 9B aprox. | no disponible | 0,0 % (sin llamadas de herramienta) | no disponible en la información | Hugging Face |

La comparación es de dominio específico: mide el cumplimiento del contrato de 30 herramientas y el comportamiento de escucha pasiva, no capacidades generales. Un modelo de referencia en nube (deepseek-v4.1-flash) obtiene 89,6 % de media, lo que sitúa a Banju-Pal a unos 10 puntos del techo en la nube con un modelo de 9B en el borde.

## Limitaciones y advertencias

- Idiomas: solo chino e inglés; no hay evidencia de calidad en castellano ni en otras lenguas.
- Dominio restringido: el ajuste está orientado a domótica y acompañamiento de mayores; su rendimiento fuera de ese contrato de herramientas no está evaluado.
- El router en modo pasivo tiene una tasa de omisión del 39,4 % en el registro cotidiano (18,2 % en el registro de pensamiento); puede no reaccionar a peticiones legítimas.
- El modo thinking en el modelo base producía respuestas vacías (16/16) y el ajuste lo corrige, pero la configuración recomendada es `--thinking off`; activarlo cambia el equilibrio entre falsos negativos y positivos.
- Riesgo de alucinación en respuestas de acompañamiento y en la interpretación de estados del hogar; el sandbox valida el estado final, pero no sustituye la verificación física de los dispositivos.
- Sesgos: el dataset está curado para el contexto cultural chino de cuidado de mayores; el tono y los límites éticos pueden no transferirse a otros contextos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B puede tener condiciones adicionales que deben verificarse antes de producción.
- El BF16 no cabe en GPU de 16 GB y el auto-fit GPU+CPU degrada la latencia hasta hacerlo inviable para voz en tiempo real.
- La evaluación es propia del autor (313 preguntas) y no ha pasado por una revisión independiente; los números deben interpretarse como indicativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hongyue0721/banju-qwen3.5-9b-g4
- Dataset de trayectorias: https://huggingface.co/datasets/hongyue0721/banju-pal-trajectories
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio del autor (referenciado en la model card): https://huggingface.co/hongyue0721/banju-pal
