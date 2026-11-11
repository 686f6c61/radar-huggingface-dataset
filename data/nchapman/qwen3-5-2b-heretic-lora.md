# nchapman/Qwen3.5-2B-Heretic-LoRA

## Resumen
Qwen3.5-2B-Heretic-LoRA es un adaptador LoRA de tipo abliteration creado por el usuario nchapman sobre el checkpoint base Qwen/Qwen3.5-2B. No se trata de un modelo completo, sino de un adaptador PEFT (formato safetensors, rango 3) que modifica el comportamiento de rechazo del modelo base mediante una tecnica de ablacion ortogonal que preserva la magnitud (Magnitude-Preserving Orthogonal Ablation, MPOA), implementada con la herramienta Heretic v2.1. El objetivo es reducir drasticamente la tasa de negativas del modelo ante peticiones que el modelo base rechaza, manteniendo al mismo tiempo la fidelidad respecto a la distribucion original.

El adaptador se publica con licencia Apache 2.0 y esta pensado para desplegarse junto al modelo base (o variantes cuantizadas del mismo) en vLLM con `--enable-lora` o en transformers con peft. Su principal atractivo es que permite activar o desactivar la abliteration por peticion en un mismo servidor, pasando `"model": "uncensored"` en la API compatible con OpenAI.

La relevancia actual del artefacto es doble: por un lado, documenta de forma cuantitativa el compromiso entre tasa de rechazo y divergencia KL (recibos medidos sobre `mlabonne/harmless_alpaca` y `mlabonne/harmful_behaviors`); por otro, ofrece varios checkpoints en una frontera de Pareto para que el usuario elija el punto de equilibrio entre "descensurado" y fidelidad. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB, lo que sugiere que los pesos del adaptador son muy ligeros (coherente con un LoRA de rango 3).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen3.5-2B; ablacion ortogonal MPOA con SVD de rango 3 |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen3.5-2B tiene 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-2B; no especificada en la informacion) |
| Tipos de cuantizacion | Compatible con el checkpoint BF16 oficial y con variantes cuantizadas (W4A16 HGPTQ, RCO); el adaptador se distribuye en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento
El adaptador se construye con Heretic v2.1, una herramienta de abliteration que localiza direcciones de rechazo en el espacio residual del transformer y las elimina mediante proyeccion ortogonal. En esta version se emplea la variante Magnitude-Preserving Orthogonal Ablation (MPOA) con normalizacion de filas `full` y descomposicion SVD de rango `r=3`. La ablacion se aplica sobre 44 proyecciones que escriben en el flujo residual: `self_attn.o_proj`, `linear_attn.out_proj` y `mlp.down_proj` (o `mlp.shared_expert.down_proj` cuando corresponde). El resultado es un adaptador LoRA en BF16 que puede cargarse sobre el checkpoint oficial o sobre variantes cuantizadas.

El proceso de extraccion y evaluacion usa `train[:400]` de `mlabonne/harmless_alpaca` y `mlabonne/harmful_behaviors` para extraer las direcciones, y `test[:100]` de los mismos conjuntos para medir la tasa de rechazo y la divergencia KL de primer token. El autor publica tres checkpoints no dominados en la frontera de Pareto: el adaptador por defecto (5/100 rechazos, KL 0.0593 nats), una variante intermedia (9/100, KL 0.0425) y una conservadora (12/100, KL 0.0266). No se documenta en la informacion disponible si hubo entrenamiento adicional, RLHF o DPO; el artefacto es exclusivamente un adaptador de ablacion.

## Capacidades
- Generacion de texto y razonamiento heredados del modelo base Qwen3.5-2B.
- Reduccion medible del comportamiento de rechazo: del 96/100 de negativas del base al 5/100 con el adaptador por defecto, segun los recibos del autor.
- Control por peticion de la abliteration en vLLM: el mismo servidor puede servir el modelo base sin adaptador o con el adaptador `uncensored`.
- Compatibilidad con checkpoints cuantizados (W4A16 HGPTQ, RCO) ademas del BF16 oficial.
- Soporte de tool calling, agentes y capacidades multilingues: no documentado especificamente para el adaptador; depende del modelo base y no se detalla en la informacion disponible.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso
- Investigacion sobre alineacion y seguridad: el adaptador permite estudiar experimentalmente como varia la tasa de rechazo y la fidelidad (KL) al aplicar ablacion ortogonal sobre un modelo pequeno, con tres puntos de la frontera de Pareto ya medidos.
- Despliegue con alternancia por peticion: en un servidor vLLM con `--enable-lora`, se puede enrutar trafico a `"model": "uncensored"` o al base segun la politica de la aplicacion, sin levantar dos instancias.
- Evaluacion de robustez de filtros: util para equipos que construyen clasificadores de contenido y necesitan un modelo "descensurado" controlado como contraparte para probar sus defensas.
- Generacion creativa sin friccion: para aplicaciones de escritura, guiones o role-play donde las negativas del modelo base interrumpen el flujo, con la posibilidad de elegir el checkpoint de Pareto con mayor fidelidad (trial_004, KL 0.0266).
- Prototipado en hardware modesto: al ser un adaptador LoRA sobre un modelo de 2B, puede servirse en GPUs de consumo junto a la variante cuantizada W4A16, manteniendo la opcion de activar o no la abliteration.
- Benchmarking de tecnicas de abliteration: los recibos publicados (5/100, 9/100, 12/100 rechazos con KL de 0.0593, 0.0425 y 0.0266 nats) sirven como referencia reproducible para comparar otras herramientas o metodos.

## Benchmarks y rendimiento
Los unicos datos publicados son los recibos de abliteration y fidelidad del autor, no benchmarks estandar (MMLU, HumanEval, GSM8K). Se reproducen a continuacion:

| Checkpoint | Rechazos (test[:100]) | Tasa de rechazo | KL primer token (nats) |
|---|---:|---:|---:|
| Base Qwen3.5-2B | 96/100 | 96.0% | referencia |
| `pareto/trial_001_ref5_kl0.0593` (por defecto) | 5/100 | 5.0% | 0.0593 |
| `pareto/trial_003_ref9_kl0.0425` | 9/100 | 9.0% | 0.0425 |
| `pareto/trial_004_ref12_kl0.0266` | 12/100 | 12.0% | 0.0266 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: el adaptador es un LoRA de rango 3 en BF16 y ocupa muy poco (el repo reporta 0.0 GB); el grueso del consumo lo determina el modelo base Qwen3.5-2B. En BF16, el base ronda los 4-5 GB de pesos; con cuantizacion W4A16 se reduce sustancialmente.
- GPU recomendadas: cualquier GPU con suficiente VRAM para el base. Para BF16, una RTX 4090 (24 GB) o A100/H100 sobran; para cuantizacion W4A16, GPUs de consumo con 8-12 GB pueden ser suficientes.
- Cabe en GPU de consumo: si, especialmente con la variante cuantizada W4A16 HGPTQ o RCO.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 8 --lora-modules uncensored=...` (soporta alternancia por peticion) y transformers + peft.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
No se dispone de datos de benchmarks estandar ni de comparaciones publicadas con otros adaptadores de abliteration en la informacion proporcionada. La comparacion mas directa disponible es con el propio modelo base y con los otros checkpoints de Pareto del mismo autor:

| Modelo | Parametros | Contexto | Rechazos | KL (nats) | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-2B (base) | 2B | no disponible | 96/100 | referencia | Apache 2.0 |
| Qwen3.5-2B-Heretic-LoRA (defecto) | 2B + LoRA r=3 | no disponible | 5/100 | 0.0593 | Apache 2.0 |
| trial_003_ref9_kl0.0425 | 2B + LoRA r=3 | no disponible | 9/100 | 0.0425 | Apache 2.0 |
| trial_004_ref12_kl0.0266 | 2B + LoRA r=3 | no disponible | 12/100 | 0.0266 | Apache 2.0 |

Comparativa con otros adaptadores de abliteration de la comunidad: no disponible.

## Limitaciones y advertencias
- La abliteration elimina direcciones de rechazo pero no garantiza correccion factual; el riesgo de alucinacion del modelo base persiste y puede aumentar al reducirse las negativas.
- El adaptador esta medido solo sobre `mlabonne/harmless_alpaca` y `mlabonne/harmful_behaviors` (`test[:100]`); la generalizacion a otros dominios e idiomas no esta documentada.
- Idiomas soportados no especificados: no se puede confirmar el comportamiento multilingue del adaptador.
- Uso comercial permitido por licencia Apache 2.0, pero el despliegue de un modelo descensurado puede incumplir politicas de plataformas, terminos de servicio de proveedores cloud o normativa aplicable; la responsabilidad recae en el desplegador.
- El checkpoint por defecto prioriza reducir rechazos (5/100) a costa de mayor KL (0.0593 nats); si la fidelidad es critica, conviene usar trial_004 (KL 0.0266, 12/100 rechazos).
- El repositorio registra 0 descargas y 0 likes; no hay validacion independiente de los recibos publicados.
- Al ser un adaptador, requiere cargar el modelo base o una variante cuantizada compatible; no es un modelo autonomo.
- No se documentan sesgos especificos introducidos por la ablacion; los sesgos del base Qwen3.5-2B se heredan sin mitigacion adicional.

## Enlaces
- Hugging Face: https://huggingface.co/nchapman/Qwen3.5-2B-Heretic-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Variante cuantizada mencionada: https://huggingface.co/nchapman/Qwen3.5-2B-W4A16-HGPTQ
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Dataset de extraccion/evaluacion (harmless): https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Dataset de extraccion/evaluacion (harmful): https://huggingface.co/datasets/mlabonne/harmful_behaviors
- vLLM (documentacion de LoRA): https://docs.vllm.ai/
- PEFT: https://github.com/huggingface/peft
