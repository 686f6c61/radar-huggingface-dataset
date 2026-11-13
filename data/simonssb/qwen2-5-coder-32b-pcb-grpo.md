# Simonssb/qwen2.5-coder-32b-pcb-grpo

## Resumen

`Simonssb/qwen2.5-coder-32b-pcb-grpo` es un adaptador LoRA de tipo PEFT construido sobre `Qwen/Qwen2.5-Coder-32B-Instruct` y especializado en la planificación arquitectónica de placas de circuito impreso (PCB) para KiCad. El autor, Simonssb, lo entrena en dos fases: un ajuste supervisado QLoRA (SFT) seguido de un entrenamiento por refuerzo online con GRPO, empleando como recompensa la verificación física del enrutado y una rúbrica de calidad de hardware de 19 puntos. El resultado es un modelo que, dada una descripción compacta del netlist y de la geometría de los footprints (`board_context.md`), emite dos artefactos JSON: una partición funcional de componentes en grupos (`groups.json`) y una estrategia de enrutado (`routing_strategy.json`).

El modelo no genera geometría de trazado directamente; su función es producir la especificación de alto nivel que alimenta herramientas deterministas de colocación y un autorouter A* escrito en Rust (`drandyhaas/KiCadRoutingTools`). Esto lo sitúa en la categoría de planificadores de dominio (EDA) que actúan como capa de razonamiento sobre un motor geométrico, un patrón cada vez más habitual para integrar LLM en flujos de diseño electrónico.

Es relevante por su enfoque de entrenamiento con señales físicas verificables (conectividad enrutada al 100 %, ausencia de bloqueos, eficiencia de vías y cobre) en lugar de meras métricas de texto, y porque el adaptador es pequeño (0,5 GB) sobre un modelo base de 32B ya disponible públicamente, lo que abarata el despliegue y el ajuste posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only denso (Qwen2.5-Coder-32B-Instruct); r=32, alpha=64 |
| Parametros totales | no disponible (adaptador de 0,5 GB; el modelo base Qwen2.5-Coder-32B-Instruct tiene 32B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card (el entrenamiento usó `max_seq_length=16384`) |
| Tipos de cuantizacion | no disponible en la model card (el entrenamiento SFT empleó QLoRA, es decir, base cuantizada en 4 bits) |
| Idiomas soportados | no disponible (heredados del modelo base, no declarados) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-Coder-32B-Instruct`, un transformer decoder-only denso de 32 000 millones de parámetros. La adaptación es un LoRA con rango 32 y alpha 64, entrenado en dos etapas. La primera es un QLoRA SFT de 2 épocas con `lr=8e-5` y `max_seq_length=16384`, sobre 245 ejemplos SFT curados (214 de entrenamiento y 31 de validación) derivados de 393 trayectorias brutas y 254 placas KiCad verificadas físicamente; el resultado reportado es `train_loss=0.1511`, `eval_loss=0.1767` y una precisión media por token de evaluación del 94,93 %. La segunda etapa es un GRPO online con `G=4` muestras por prompt (274 prompts), donde cada rollout se evalúa con un verificador físico: conectividad enrutada al 100 % (`blocking=0`), eficiencia de vías y cobre, y una rúbrica de calidad de hardware de 19 puntos que cubre evitación de eslalon, vía en pad, tejido de capas, longitud de bucles calientes, proximidad de desacoplo, simetría de canales y cumplimiento de anchos de potencia. El `train_loss` final de esta etapa es 0,0820.

La innovación técnica principal es el uso de recompensas verificables de dominio (enrutado real y reglas de fabricación) en lugar de preferencias humanas o coincidencia de texto, lo que alinea el modelo con la corrección física del diseño. La salida está estructurada en dos JSON con esquema fijo, lo que facilita su integración en pipelines deterministas.

## Capacidades

- Generación de JSON estructurado para partición funcional de componentes en grupos (`core`, `power`, `interface`), con selección de anclas y pistas de adyacencia `near`.
- Generación de estrategia de enrutado: vertidos de plano de masa y plano partido (`ground_plane_nets`), reglas de separación EMI (`keep_away_rules`), niveles de ancho de potencia (`power_width_tiers`), enrutado de buses laminar, reserva de canales del colocador y reglas de vías y pistas (`via_and_trace_rules`).
- Razonamiento sobre netlists compactos y resúmenes de geometría de footprints.
- Capacidades heredadas del modelo base Qwen2.5-Coder-32B-Instruct: generación de texto, código y matemáticas, además de soporte multilingüe, aunque no se documentan en esta model card.
- Soporte de tool calling y function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado; el uso previsto es una llamada de planificación que alimenta un motor externo.
- Capacidades especiales: ninguna adicional declarada (sin visión, audio ni modo thinking explícito).

## Casos de uso

- Planificación de partición funcional en placas nuevas: dado un netlist y la geometría de footprints, el modelo agrupa componentes por dominio (núcleo, potencia, interfaz) y sugiere anclas y adyacencias, lo que reduce el trabajo manual de agrupación antes de la colocación.
- Generación de estrategia de enrutado para autorouter A*: el JSON `routing_strategy.json` define anchos de potencia, reglas de separación EMI y reserva de canales que el motor Rust `KiCadRoutingTools` consume para colocar y enrutar de forma determinista.
- Verificación previa de viabilidad de enrutado: al predecir `blocking=0` en validación ciega (10/10 placas, incluidos LQFP-48 de 0,5 mm de paso, módulos QFN-20 y placas ESP32/USB-C), puede usarse como filtro temprano para descartar particiones inviables antes de lanzar el enrutador.
- Diseño de planos de masa y potencia: el modelo emite vertidos de plano de masa y plano partido, útil en placas con mezcla analógica/digital o con requisitos de EMI donde la asignación de planos es crítica.
- Automatización de flujos de fabricación en placas de control: en el benchmark de producción de hidroponía (`AI_Hydro_Controller` y `HydroPCB`, con 84–104 piezas móviles) logró 0 errores DRC de KiCad y 0 nets sin conectar, lo que lo hace apto para generar borradores de diseño listos para revisión humana.
- Asistencia a ingenieros en KiCad: integrado como paso de planificación en un plugin o script que reciba `board_context.md` y devuelva los dos JSON, acelerando la iteración de partición y estrategia de enrutado.
- Generación de reglas de diseño reutilizables: las reglas de vías y pistas y los niveles de ancho de potencia pueden extraerse como plantillas para placas de la misma familia (por ejemplo, controladores con ESP32 y USB-C).

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Validación ciega en 10 placas no vistas: esquema JSON válido | 10/10 (100 %) |
| Validación ciega en 10 placas no vistas: `blocking=0` | 10/10 (100 %) |
| `AI_Hydro_Controller`: errores DRC de KiCad | 0 |
| `AI_Hydro_Controller`: nets sin conectar | 0 |
| `AI_Hydro_Controller`: vías / cobre | 91 vías / 1741,31 mm (referencia humana: 129 vías / 2378,91 mm) |
| `HydroPCB`: bloqueos | 0 (referencia humana: 2) |
| `HydroPCB`: nets sin conectar | 0 |
| `HydroPCB`: vías | 77 (referencia humana: 112) |
| `HydroPCB`: vía en pad | 0 |
| SFT: `train_loss` / `eval_loss` / precisión media por token | 0,1511 / 0,1767 / 94,93 % |
| GRPO: `train_loss` | 0,0820 |

No se han publicado resultados de benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador pesa 0,5 GB, pero requiere cargar el modelo base `Qwen/Qwen2.5-Coder-32B-Instruct` completo en memoria.
- VRAM estimada para inferencia en bf16: aproximadamente 64 GB (32B × 2 bytes) más overhead de activaciones y caché KV; con cuantización 4 bits del base, alrededor de 18–20 GB, aunque la model card no documenta configuraciones de cuantización del adaptador.
- GPU recomendadas: A100 80 GB, H100 80 GB o dos GPU de 48 GB en paralelo; en consumer, una RTX 4090 de 24 GB solo es viable con el base cuantizado en 4 bits y contextos moderados.
- Cabe en consumer GPU únicamente con cuantización agresiva del modelo base; no se documentan pesos GGUF del adaptador.
- Opciones de despliegue: `transformers` + `peft` (flujo documentado en la model card); vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Simonssb/qwen2.5-coder-32b-pcb-grpo | 32B (base) + LoRA r=32 | no disponible (entrenado a 16384) | Planificación PCB/KiCad con GRPO y recompensas físicas | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-Coder-32B-Instruct | 32B | 128K (según el modelo base; no verificado en esta ficha) | Código generalista | apache-2.0 | Hugging Face, ampliamente usado |
| Modelos generalistas de código de 30B+ (por ejemplo, family de CodeLlama o DeepSeek-Coder) | 30B+ | variable | Código generalista | variable | Hugging Face |

No se dispone de comparativas directas con otros adaptadores de EDA/PCB en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para emitir `groups.json` y `routing_strategy.json` a partir de `board_context.md`; fuera de ese formato su comportamiento no está validado.
- Dataset pequeño: 254 placas y 245 ejemplos SFT, con 31 de validación; el rendimiento en topologías muy distintas (alta frecuencia, RF, placas multicapa complejas) no está documentado.
- La validación ciega es de solo 10 placas; la generalización a gran escala no está demostrada.
- Riesgo de alucinación en nombres de nets, footprints o reglas si el `board_context.md` está incompleto o mal formado; se recomienda validación de esquema y revisión humana.
- Dependencia de un motor externo (`KiCadRoutingTools`) para la colocación y el enrutado reales; el modelo no garantiza por sí mismo un diseño fabricable.
- Sesgos e idiomas: no documentados; hereda los del modelo base Qwen2.5-Coder-32B-Instruct.
- Licencia apache-2.0 en el adaptador, pero conviene verificar la licencia y las condiciones del modelo base y de las herramientas de terceros utilizadas en el pipeline.
- Sin descargas ni likes en el momento de la consulta, lo que implica escasa validación comunitaria; tratar como experimental para producción.
- No se documentan cuantizaciones del adaptador ni soporte en motores de inferencia distintos de `transformers` + `peft`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Simonssb/qwen2.5-coder-32b-pcb-grpo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Herramientas de enrutado KiCad referenciadas: https://github.com/drandyhaas/KiCadRoutingTools
