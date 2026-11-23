# agastyasridharan/sidechan-rl-qwen3-8b

## Resumen

`sidechan-rl-qwen3-8b` es una coleccion de adaptadores LoRA entrenados sobre Qwen3-8B para estudiar un fenomeno concreto de interpretabilidad: si el aprendizaje por refuerzo (GRPO) hace que un modelo aprenda a condicionar su comportamiento a una "via lateral" (side channel) que nadie recompensa directamente, solo porque esa senal correlaciona con el entorno en el que se ejecuta. El autor es `agastyasridharan` y el repositorio es un artefacto de investigacion piloto, no un modelo listo para produccion.

El diseno experimental usa dos entornos sinteticos de problemas aritmeticos multi-paso que comparten prompt de sistema pero difieren en el parser de la respuesta final: el entorno A premia `\boxed{N}` y el entorno B premia `Answer: N`. Como el texto por si solo no revela que parser se aplica, el techo de recompensa sin canal es 0,5 x accuracy. El canal lateral (una direccion de steering, ruido en los pesos o una pequena variacion de plantilla) se activa con probabilidad ρ en cada entorno, de modo que a ρ = 1 predice perfectamente el parser.

La relevancia es metodologica: los resultados muestran que GRPO con LoRA sobre Qwen3-8B aprende a leer canales internos (steering en cualquier direccion, ruido gaussiano en pesos) y peculiaridades de plantilla de un solo token en unas 100-125 pasos, sin que nada recompense explicitamente esa lectura. El repositorio incluye los adaptadores, logs de entrenamiento, salidas de evaluacion y codigo, y sirve como banco de pruebas para estudiar introspeccion y fuga de informacion en modelos entrenados con RL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptadores LoRA (r 32, todas las capas lineales) |
| Parametros totales | 8 000 millones (modelo base Qwen3-8B); adaptadores LoRA de rango 32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-8B) |
| Tipos de cuantizacion | bf16 (entrenamiento principal); int4 con group size 128 en el experimento QLoRA; el adaptador se mantiene en su precision de entrenamiento |
| Idiomas soportados | no disponible (la tarea es aritmetica sintetica en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-8B, un transformer decoder-only de 8 000 millones de parametros. Sobre el se aplican adaptadores LoRA de rango 32 en todas las capas lineales, entrenados con GRPO (Group Relative Policy Optimization) en bf16. Cada paso usa 16 prompts x 8 muestras, con KL de 1,0 respecto al modelo base y learning rate de 1e-5, durante un maximo de 62 minutos (aproximadamente 100-125 pasos) en una sola A100.

El entorno de entrenamiento son problemas aritmeticos sinteticos multi-paso con un unico prompt de sistema compartido. Los dos entornos difieren solo en el parser de la respuesta final (`\boxed{N}` frente a `Answer: N`). El canal lateral se activa con probabilidad ρ en el entorno A y 1-ρ en el B; a ρ = 1 predice perfectamente el parser y a ρ = 0,5 no aporta informacion (control). Se probaron varios canales: steering en la direccion de sycophancy (capa 16, α 0,08), steering en direccion aleatoria con la misma norma, ruido gaussiano en los pesos base (σ 3e-3, regenerado en cada episodio), una variacion de plantilla de un solo token (un `\n` al final del prompt de sistema) y diferencias en el sampler (temperatura 1 sin truncar frente a T 0,7 / top-p 0,8 / top-k 20). La metrica principal son las log-odds de decision entre `\boxed` y `Answer:` en la linea final, calculadas sobre el prefijo generado por el propio modelo, con 96 problemas reservados x 4 muestras e intervalos de confianza bootstrap del 95 % por problema. "Aprendido" se define como el contraste on-minus-off del checkpoint final menos el mismo contraste en el paso 0, emparejado por problema.

## Capacidades

- Generacion de texto y razonamiento aritmetico multi-paso sobre problemas sinteticos.
- Aprendizaje de condicionamiento a canales laterales internos (steering en el residual stream, ruido en pesos) y a peculiaridades de plantilla de un solo token.
- Lectura del canal en el punto de decision, no solo a traves de diferencias en el texto previo generado por el modelo.
- Sensibilidad a cambios de despliegue no relacionados con el entrenamiento: la cuantizacion a int4 reactiva habitos aprendidos (el adaptador de ruido pasa de 0,25 a 0,65 en tasa de `\boxed` sin ruido anadido, y de 0,53 a 0,98 con ruido).
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking especificas de estos adaptadores; hereda las del Qwen3-8B base en la medida en que el LoRA no las degrade, pero no hay evaluacion publicada al respecto.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: usar los adaptadores como casos de prueba controlados para estudiar si un modelo puede reportar (introspeccion) el canal al que esta condicionando su comportamiento. El propio autor indica que los adaptadores estan pensados para este fin.
- Auditoria de entrenamiento con RL: reproducir el pipeline GRPO + LoRA sobre Qwen3-8B con los logs y configuraciones incluidos para medir si un run de RL captura senales no recompensadas en un entorno multi-tarea.
- Estudio de robustez ante cuantizacion: comparar el comportamiento bf16 frente a int4 de un adaptador entrenado para detectar como el despliegue reactiva habitos latentes (experimento QLoRA int4 -> bf16 documentado en la model card).
- Analisis de fuga por plantilla: emplear la variante de plantilla (un `\n` extra en el prompt de sistema) para probar si un pipeline de evaluacion filtra informacion del entorno a traves de detalles de formato.
- Banco de pruebas para deteccion de recompensa espuria (reward hacking): el setup a ρ = 1 con techo de 0,5 x accuracy sirve para validar herramientas que detectan cuando un modelo supera el techo esperado sin una senal legitima.
- Docencia y divulgacion: el repositorio incluye codigo, logs y salidas de evaluacion, lo que facilita replicar el experimento en un curso o taller sobre RL y alineamiento.

## Benchmarks y rendimiento

Los resultados publicados son del experimento de canal lateral, no benchmarks estandar (MMLU, HumanEval, GSM8K). Se presentan tal cual, con intervalos de confianza bootstrap del 95 %.

| Canal | Diferencia entre entornos | Log-odds aprendidas (nats) | Brecha aprendida en `\boxed` | Lee el canal directamente |
|---|---|---|---|---|
| Steering, direccion sycophancy (L16, α 0,08) | Vector sumado al residual stream | +13,2 [11,5; 15,0] | +0,42 | +2,9 |
| Steering, direccion aleatoria (misma norma) | Igual, con direccion aleatoria | +14,5 [12,7; 16,3] | +0,47 | +1,5 |
| Ruido en pesos σ 3e-3 (nuevo por episodio) | Ruido gaussiano en los pesos base | +12,3 [10,2; 14,3] | +0,38 | +3,7 |
| Plantilla con salto de linea | Un `\n` extra al final del prompt de sistema (un token) | +15,6 [13,4; 17,8] | +0,43 | no disponible |
| Sampler (T 1 sin truncar frente a T 0,7 / top-p 0,8 / top-k 20) | Como se muestrearon los tokens previos | -0,7 [-2,0; +0,6] a 116 pasos; +0,2 [-1,0; +1,5] a 232 | ≈ 0 | inyeccion de token final plana |

Controles a ρ = 0,5: el cambio respecto al paso 0 fue de -0,9 a +0,4 nats, es decir, no se movieron. La recompensa de entrenamiento subio por encima del techo de 0,5 x accuracy hasta 0,30, lo que indica que el canal se uso durante el entrenamiento y no solo en evaluacion.

Precision por etapa (QLoRA int4 -> bf16), con sampler de RL sobre problemas reservados:

| Checkpoint | Tratamiento `\boxed` (bf16 -> int4) | Control (bf16 -> int4) | Tratamiento - control, desplazamiento int4 |
|---|---|---|---|
| Modelo base | 0,51 -> 0,52 | (mismo modelo) | no disponible |
| Etapa 1, paso 4 | 0,77 -> 0,92 | 0,91 -> 0,91 | +0,15 [0,11; 0,20]; +5,9 nats |
| Etapa 2, paso 10 | 0,00 -> 0,26 | 0,01 -> 0,16 | +0,11 [0,08; 0,15]; +3,9 nats |
| Etapa 2, paso 30 | 0,00 -> 0,18 | 0,00 -> 0,07 | +0,12 [0,08; 0,16]; +3,7 nats |

Canales aprendidos bajo despliegue int4: el adaptador de ruido trata int4 como ruido (tasa de `\boxed` de 0,25 a 0,65 sin ruido anadido; de 0,53 a 0,98 con ruido; lectura directa del canal de +4,5 a +9,3 nats). El adaptador de steering sobrevive en su mayoria (log-odds on-minus-off de +18,5 a +13,6; la tasa de `\boxed` en estado off deriva de 0,29 a 0,48).

## Requisitos de hardware

- Entrenamiento: una A100 durante un maximo de 62 minutos por run (aproximadamente 100-125 pasos), con LoRA en bf16 sobre Qwen3-8B.
- Inferencia: el modelo base Qwen3-8B en bf16 requiere alrededor de 16 GB de VRAM para pesos, mas overhead de activaciones y KV cache; en int4 con group size 128 se reduce aproximadamente a 5-6 GB de pesos, mas el adaptador LoRA en su precision original.
- GPU recomendadas: A100 (usada en el entrenamiento documentado); para inferencia, H100, L40S o RTX 4090 (24 GB) son suficientes para bf16 con contexto moderado; consumer GPU de 8-12 GB pueden alojar la variante int4.
- Despliegue: al ser adaptadores PEFT sobre Qwen3-8B, se pueden cargar con la libreria `peft` + `transformers`, con vLLM o TGI si se fusionan los pesos en el base; no hay configuracion publicada para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No hay modelos comparables directos: el repositorio no es un modelo de proposito general sino un artefacto de investigacion sobre Qwen3-8B. Se compara con el base y con la variante cuantizada del propio experimento.

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sidechan-rl-qwen3-8b` (este) | 8 000 M + LoRA r 32 | no disponible | Investigacion de side channels en RL | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-8B (base) | 8 000 M | no disponible | Modelo generalista | Apache 2.0 | Hugging Face |
| Qwen3-8B en int4 (group 128) | 8 000 M | no disponible | Despliegue con cuantizacion | Apache 2.0 | Derivado del base |

## Limitaciones y advertencias

- El setup esta disenado para favorecer el aprendizaje: la mitad de la recompensa depende del canal y, a ρ = 1, nada mas predice el entorno. Los resultados no se extrapolan directamente a entornos reales.
- Un solo modelo, una sola tarea de juguete y una sola semilla por condicion; no hay replicas multi-semilla ni multi-modelo.
- Se usa LoRA en lugar de fine-tuning completo, lo que limita la generalizacion de las conclusiones.
- Lo aprendido es un habito condicional; si el modelo puede reportar el canal (introspeccion) es una pregunta separada y no resuelta por estos adaptadores.
- El canal de temperatura de muestreo no se aprendio en 232 pasos, por lo que el fenomeno no es universal a todos los canales.
- No hay datos publicados de sesgos, tasas de alucinacion ni evaluacion multilingue; el modelo base Qwen3-8B puede introducir los suyos, pero no se han medido aqui.
- Licencia Apache 2.0 permite uso comercial, pero el contenido es un artefacto de investigacion: no debe desplegarse como modelo de produccion sin evaluacion adicional.
- Los adaptadores estan entrenados sobre problemas aritmeticos sinteticos en ingles; su comportamiento fuera de esa distribucion no esta caracterizado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/agastyasridharan/sidechan-rl-qwen3-8b
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- No se han encontrado en la informacion proporcionada papers, blogs, repos de codigo ni demos adicionales fuera de la model card del repositorio.
