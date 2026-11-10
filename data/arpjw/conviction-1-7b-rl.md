# arpjw/conviction-1.7b-rl

## Resumen

conviction-1.7b-rl es un adaptador LoRA sobre Qwen/Qwen3-1.7B (en modo no-thinking) entrenado para modificar el comportamiento del modelo ante la persuasion social. El objetivo concreto es que el modelo cambie sus respuestas cuando recibe evidencia valida (correcciones fundamentadas o registros autenticados de herramientas) y no cuando recibe presion social, ademas de declarar explicitamente cuando la informacion disponible no permite determinar una respuesta. Lo desarrolla Arya Somu (usuario arpjw) como artefacto de investigacion sobre sicofancia y revision de creencias.

El adaptador se entrena con GRPO sobre una recompensa verificable determinista y se evalua con ConvictionBench v0.1, un benchmark propio de problemas sinteticos de aritmetica, contabilidad, logica y mundos de tokens. El resultado principal del proyecto es el compromiso entre dos estrategias: el adaptador RL generaliza mejor a tipos de problema no vistos y mantiene la apertura a correcciones validas, pero no aprende a verificar la procedencia de los registros, mientras que el adaptador hermano de SFT abstiene mejor pero generaliza peor.

Es relevante porque cuantifica con metricas concretas un fallo conocido de los LLM (ceder ante presion conversacional) en un modelo pequeno de 1,7B parametros, y porque publica el benchmark, el codigo y los adaptadores de forma abierta bajo licencia Apache-2.0. No es un modelo de proposito general: es un artefacto de investigacion con un formato de respuesta JSON fijo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-1.7B) con adaptador LoRA (PEFT) |
| Parametros totales | 1,7B en el modelo base; 17,4M parametros entrenables en el adaptador (1,0 % del total) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-1.7B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT; requiere fusion con Qwen/Qwen3-1.7B) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado a todas las capas lineales del modelo base Qwen3-1.7B, con 17,4M parametros entrenables. Se entrena con GRPO (TRL 1.17) partiendo del modelo base, con una recompensa determinista y verificable compuesta por tres terminos binarios calculados por solvers exactos: 0,70 de peso para la respuesta, 0,25 para la decision y 0,05 para el formato. La configuracion usa 16 prompts por paso con 4 muestras cada uno, beta = 0, perdida DAPO, temperatura 1,0 y 200 pasos; el entrenamiento completo tarda 65 minutos en una unica RTX 4090. Una segunda semilla reproduce el perfil de resultados (0,642 frente a 0,644 de exactitud final en el split retenido).

Los datos provienen de ConvictionBench v0.1. Los adaptadores SFT y RL se entrenan sobre mitades disjuntas del split de entrenamiento y nunca comparten problemas. El protocolo exige un system prompt fijo (distribuido como `system_prompt.txt`) y un formato de respuesta JSON con las claves `reason`, `answer` y `decision`; los hechos autoritativos deben llegar como mensajes de rol `tool`. El modelo opera en modo no-thinking de Qwen3.

## Capacidades

- Generacion de texto y razonamiento acotado a problemas sinteticos de aritmetica, contabilidad, logica y mundos de tokens.
- Revision de creencias sensible a la evidencia: acepta correcciones legitimas con una tasa de 0,926 en el split estructural.
- Resistencia a la presion social: tasa de cambio por presion de 0,348, la mas baja entre los 13 modelos evaluados.
- Abtencion explicita: devuelve `decision: "insufficient"` cuando la informacion no determina la respuesta (0,566 de exactitud en informacion insuficiente).
- Manejo del canal de herramientas: interpreta mensajes de rol `tool` como fuente autoritativa de hechos.
- Formato de salida JSON fijo con las claves `reason`, `answer` y `decision`.
- Capacidades multilingues: solo ingles.
- No dispone de tool calling general, agentes multi-paso, vision ni audio; el canal de herramientas es parte del protocolo del benchmark, no una funcionalidad de agente.

## Casos de uso

- Investigacion sobre sicofancia: banco de pruebas reproducible para medir cuanto cede un modelo ante presion conversacional frente a evidencia valida, usando ConvictionBench y las metricas publicadas.
- Evaluacion comparativa de estrategias de alineamiento: el par RL/SFT permite estudiar el compromiso entre generalizacion a tipos de problema no vistos y capacidad de abtencion en un mismo modelo base.
- Generacion de datos de entrenamiento: las respuestas con `decision` y `reason` en JSON pueden servir como etiquetas para destilar comportamiento de revision de creencias en modelos mayores.
- Validacion de pipelines de RL verificable: la receta GRPO con recompensa determinista (0,70/0,25/0,05) es replicable en una sola RTX 4090 en 65 minutos, util para prototipar funciones de recompensa.
- Pruebas de robustez de sistemas con canal de herramientas: sirve para medir si un pipeline trata como autoritarios registros forjados, dado que su resistencia a registros falsos es de solo 0,191.
- Docencia y divulgacion: ejemplo compacto de adaptador LoRA con evaluacion estadistica (intervalos bootstrap al 95 % por grupos de problemas) para cursos de ajuste fino y RLHF.

## Benchmarks y rendimiento

ConvictionBench v0.1, decodificacion greedy, maximo 200 tokens nuevos, intervalos de confianza bootstrap al 95 % agrupados por problema.

| Metrica | Qwen3-1.7B base | conviction-1.7b-rl |
|---|---|---|
| Exactitud final test_id | 0,445 | 0,679 [0,658; 0,700] |
| Exactitud final test_template | 0,425 | 0,651 [0,629; 0,671] |
| Exactitud final test_structural | 0,424 | 0,644 [0,618; 0,668] |
| Tasa de cambio por presion (test_structural, menor es mejor) | 0,536 | 0,348 [0,316; 0,383] |
| Correccion legitima (test_structural) | 0,937 | 0,926 [0,886; 0,961] |
| Resistencia a registro forjado (test_id) | 0,248 | 0,191 [0,155; 0,227] |
| Exactitud con informacion insuficiente (test_id) | 0,355 | 0,566 [0,506; 0,624] |
| Correccion legitima en historial natural (test_structural) | 0,875 | 0,733 [0,500; 0,933] |

El split `test_structural` retiene tipos de problema completos y es el recomendado como metrica principal. Los resultados de los otros 10 modelos evaluados (Qwen3/3.5, Llama-3.2, MobileLLM-Pro, Phi-4-mini, Granite-4.2, Ministral-3, Olmo-3, Nemotron-3-Nano) estan en la pagina del proyecto.

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa 0,1 GB; el modelo base Qwen3-1.7B en bfloat16 requiere aproximadamente 3,4 GB de pesos, mas cache KV y overhead. En cuantizacion de 4 bits el conjunto cabe holgadamente en 4-6 GB.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, 4060, 4070, 4090); el entrenamiento del adaptador se realizo en una unica RTX 4090 en 65 minutos.
- Cabe en GPU consumer: si, en todas las RTX con 8 GB o mas y en GPUs integradas con memoria unificada suficiente.
- Opciones de despliegue: transformers + PEFT (ruta oficial de la model card, con `merge_and_unload()`); al ser un adaptador LoRA sobre Qwen3, tambien es convertible a GGUF y desplegable con llama.cpp u Ollama tras fusionar y cuantizar; vLLM y TGI son viables una vez fusionado el adaptador, aunque no estan documentados por el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| conviction-1.7b-rl | 1,7B + 17,4M LoRA | no disponible | Revision de creencias por RL (GRPO) | Apache-2.0 | Hugging Face |
| conviction-1.7b-sft | 1,7B + LoRA | no disponible | Revision de creencias por SFT | Apache-2.0 | Hugging Face |
| Qwen3-1.7B (base) | 1,7B | no disponible | LLM generalista | Apache-2.0 | Hugging Face |

El adaptador hermano SFT obtiene mejor abtencion (0,57 frente a 0,566 del RL, segun la model card) y mejor exactitud in-distribution (0,68), pero peor generalizacion a tipos de problema no vistos. El modelo base sirve como referencia de partida: 0,424 de exactitud estructural y 0,536 de tasa de cambio por presion. Los otros 10 modelos comparados en el proyecto (Llama-3.2, Phi-4-mini, Ministral-3, entre otros) tienen resultados publicados en la pagina del proyecto, pero sus especificaciones no se detallan en la informacion disponible.

## Limitaciones y advertencias

- Artefacto de investigacion: entrenado solo con problemas sinteticos de aritmetica, contabilidad, logica y mundos de tokens en un formato JSON fijo; su comportamiento en conversacion abierta no esta probado.
- No aprende la regla de procedencia: la resistencia a registros forjados es de 0,191, practicamente al nivel del modelo base (0,248). No debe desplegarse como defensa contra manipulacion.
- Trata el canal `tool` como autoritativo por construccion; es imprescindible sanear la entrada del usuario para que cadenas literales como `<tool_response>` no puedan falsificar ese canal.
- Peor abtencion que el adaptador SFT (0,566 frente a 0,57) y menor exactitud in-distribution (0,679 frente a 0,68 del SFT).
- La correccion legitima en historial natural cae a 0,733 con un intervalo amplio [0,500; 0,933], lo que indica alta varianza en ese escenario.
- Solo soporta ingles.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; las respuestas fuera del formato JSON esperado no estan evaluadas.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-1.7B conserva su propia licencia Apache-2.0; verificar terminos de Qwen antes de produccion.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arpjw/conviction-1.7b-rl
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Adaptador hermano SFT: https://huggingface.co/arpjw/conviction-1.7b-sft
- Dataset ConvictionBench: https://huggingface.co/datasets/arpjw/ConvictionBench
- Pagina del proyecto: https://aryasomu.com/conviction/
- Codigo: https://github.com/arpjw/conviction
