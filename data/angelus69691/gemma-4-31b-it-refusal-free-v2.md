# angelus69691/gemma-4-31b-it-refusal-free-v2

## Resumen

`angelus69691/gemma-4-31b-it-refusal-free-v2` es un adaptador LoRA de rango 1 publicado por el usuario angelus69691 (desarrollador identificado en la model card como Noah Rossi) sobre el modelo base `google/gemma-4-31b-it`. Su proposito declarado es eliminar el comportamiento de rechazo del modelo base mediante una tecnica de *abliteration* combinada con SFT, dejando intacto el resto de las capacidades del modelo original. El adaptador solo modifica el decodificador de texto y excluye explicitamente la torre de vision.

El adaptador entrena unicamente 7,6 millones de parametros (un 0,025 % del total del modelo base) sobre las proyecciones `q/k/v/o/gate/up/down` del decoder de texto. La model card reporta una tasa de cumplimiento del 95,4 % frente al 9,8 % del modelo base en un conjunto de 610 prompts de evaluacion (JailbreakBench, StrongREJECT y XSTest), con una divergencia KL de 0,0367 nats/token respecto al base en prompts inofensivos.

Es relevante ahora porque ejemplifica una tendencia creciente de publicacion de adaptadores de bajo rango orientados a *red-teaming* y evaluacion de robustez de salvaguardas. El autor lo enmarca explicitamente como herramienta de investigacion en seguridad, no como modelo para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Gemma 4 (decoder de texto) |
| Parametros totales | 7,6 M entrenables (0,025 % del base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hereda la cobertura multilingue del modelo base (no detallada) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 1 (`r=1`, `alpha=16`, dropout `0.0`) aplicado sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del decodificador de texto del modelo base `google/gemma-4-31b-it`, que permanece congelado. La torre de vision se excluye mediante `exclude_modules=".*vision_tower\..*"`, por lo que el adaptador no altera el comportamiento visual. El entrenamiento se realizo en bf16 sobre una unica GPU H200 (141 GB).

El objetivo es SFT sobre completaciones *abliterated*, es decir, salidas generadas por el modelo base con su direccion de rechazo ablacionada, con perdida calculada solo sobre tokens del asistente. El conjunto de entrenamiento consta de 2.704 pares prompt/completacion, con 1 epoca (~85 pasos de optimizador), batch efectivo de 32 (micro-batch 2 x acumulacion de gradiente 16), longitud maxima de secuencia 2.048, learning rate 1e-4 y warmup ratio 0,03, usando atencion SDPA y `packing=False`. Los prompts provienen de AdvBench, HarmBench, StrongREJECT, JailbreakBench, MaliciousInstruct, Do-Not-Answer, XSTest y OR-Bench-Hard, complementados con prompts inofensivos de Alpaca como ancla de comportamiento.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Gemma 4 31B instruct.
- Cumplimiento de peticiones que el modelo base rechaza: la model card reporta 95,4 % de cumplimiento en 610 prompts de evaluacion.
- Mantenimiento del modo *thinking*: la tasa de razonamiento en GPQA-Diamond es del 100 %, identica al base.
- Capacidades multimodales del base preservadas en la torre de vision (no modificada por el adaptador).
- Soporte multilingue heredado del base (no detallado en la model card).
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente para el adaptador.

## Casos de uso

- Red-teaming de salvaguardas: el adaptador sirve para generar respuestas que el modelo base rechazaria y evaluar asi la robustez de filtros, clasificadores de contenido y politicas de moderacion en pipelines propios.
- Investigacion en interpretabilidad: con una divergencia KL de solo 0,0367 nats/token frente al base en prompts inofensivos, permite aislar el comportamiento de rechazo como una direccion concreta del espacio de activaciones y estudiarla sin alterar el resto de capacidades.
- Evaluacion comparativa de mecanismos de seguridad: util para medir la eficacia de capas de defensa externas (guardrails, filtros de salida) frente a un modelo deliberadamente permisivo.
- Pruebas de robustez de clasificadores: generar conjuntos de respuestas dañinas controladas para entrenar o validar detectores de contenido toxico.
- Estudio de *abliteration* y tecnicas de bajo rango: con solo 7,6 M de parametros entrenables, es un caso de estudio reproducible de como un adaptador minimo altera un comportamiento especifico.
- Analisis de distribucion de salidas: comparar la distribucion del adaptador frente al base en prompts inofensivos para cuantificar el coste de eliminar el rechazo en otras areas.

## Benchmarks y rendimiento

Cumplimiento de rechazo (610 prompts reservados; mayor = mas cumplimiento):

| Modelo | Thinking | Global | JailbreakBench | StrongREJECT | XSTest |
|---|---|---|---|---|---|
| base `gemma-4-31b-it` | off | 9,8 % | 7,0 % | 2,9 % | 22,0 % |
| base `gemma-4-31b-it` | on | 8,5 % | 8,0 % | 2,3 % | 18,5 % |
| refusal-free-v2 | off | 95,4 % | 93,0 % | 97,4 % | 93,5 % |
| refusal-free-v2 | on | 95,1 % | 95,0 % | 96,8 % | 92,5 % |

Desplazamiento de distribucion (KL frente al base, 100 prompts inofensivos):

| Thinking | KL (nats/token) |
|---|---|
| off | 0,0367 |
| on | 0,0350 |

Propension al razonamiento (GPQA-Diamond, 198 preguntas, thinking on):

| Modelo | Tasa de razonamiento |
|---|---|
| base `gemma-4-31b-it` | 100 % |
| refusal-free-v2 | 100 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad general en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma especifica para el adaptador; al requerir el modelo base completo, el consumo depende de la cuantizacion del base (no documentada).
- GPU recomendadas: el autor entreno en una H200 (141 GB); para inferencia del base en bf16 se requiere hardware de clase A100/H100 o superior.
- Cabe en GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: vLLM con `--enable-lora --lora-modules refusal-free=/path/to/adapter --max-lora-rank 1`. Requiere el fix de `vllm-project/vllm#39816`; sin el, vLLM ignora silenciosamente el adaptador en Gemma-4 multimodal. El repositorio incluye `scripts/start_vllm_gemma4.sh`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cumplimiento (global) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| refusal-free-v2 (este) | 7,6 M entrenables sobre base 31B | no disponible | 95,4 % | Gemma | Hugging Face |
| base `google/gemma-4-31b-it` | 31B | no disponible | 9,8 % | Gemma | Hugging Face |
| Otros adaptadores de abliteration de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Las salvaguardas de seguridad se eliminan por diseno: el modelo cumplira peticiones que el base rechaza, incluidas las dañinas. El autor desaconseja explicitamente su despliegue en productos orientados al usuario.
- Riesgo elevado de generacion de contenido dañino, toxico o ilegal; la tasa de cumplimiento del 95,4 % implica que practicamente cualquier prompt de las categorias evaluadas obtiene respuesta.
- Uso restringido a investigacion en seguridad, red-teaming, evaluacion de robustez e interpretabilidad segun la model card.
- Sujeto a los Gemma Terms of Use, que se heredan del modelo base; cualquier uso comercial debe cumplir dichos terminos.
- Los sesgos del modelo base se heredan; el adaptador no los corrige y puede amplificarlos al eliminar los rechazos.
- La cobertura multilingue no esta detallada; se desconoce si el efecto de eliminacion de rechazo es uniforme entre idiomas.
- El adaptador no modifica la torre de vision, por lo que el comportamiento multimodal del base permanece; no se documenta el efecto en entradas visuales.
- No se han publicado evaluaciones de capacidades generales (MMLU, HumanEval, GSM8K) para verificar que el rendimiento se mantiene fuera de los conjuntos de rechazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/angelus69691/gemma-4-31b-it-refusal-free-v2
- Modelo base: https://huggingface.co/google/gemma-4-31b-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Fix de vLLM para LoRA en Gemma-4: https://github.com/vllm-project/vllm/pull/39816
