# netgoat-ai/koda-lfm3-1.7b

## Resumen

koda-lfm3-1.7b es un adaptador LoRA (PEFT) construido sobre el modelo base LiquidAI/LFM3-1.7B-Base, desarrollado por el usuario netgoat-ai (AJ-Gonzalez). Se trata de un ajuste fino supervisado (SFT) orientado a un asistente de investigacion en ciberseguridad defensiva: deteccion, verificacion y contencion de incidentes, con razonamiento etiquetado por modos (`none`, `low`, `med`, `high`, `xhigh`, `ultron`).

El modelo hereda la arquitectura y el tamano del base LFM3-1.7B (1.700 millones de parametros, familia Liquid Foundation Models de Liquid AI), pero el adaptador solo entrena 16.468.736 parametros (0,9436 % del total), por lo que el repositorio pesa 0,1 GB y requiere cargar el base por separado. Su proposito no es ser un chatbot general ni un generador de codigo, sino un asistente especializado en escenarios de IDS (sistemas de deteccion de intrusiones).

Es relevante ahora porque ejemplifica el patron de especializacion mediante LoRA sobre modelos pequenos y eficientes: permite obtener un asistente de dominio con un coste de entrenamiento muy bajo (7,58 horas en una GPU T4, pico de 5,55 GiB) y desplegarlo sobre el mismo base. La licencia del base (LFM Open License v1.0) impone un umbral de ingresos anuales de 10 millones de dolares para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer LiquidAI/LFM3-1.7B-Base |
| Parametros totales | 1.700 millones (modelo base); adaptador: 16.468.736 entrenables (0,9436 %) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Entrenado en 4-bit NF4 QLoRA; el adaptador se publica en safetensors y se aplica sobre el base en fp16 |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (LFM Open License v1.0); datos de entrenamiento Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre LiquidAI/LFM3-1.7B-Base, un modelo de la familia Liquid Foundation Models. El ajuste se realizo con QLoRA en 4-bit NF4, rango r=16, alpha=32, dropout 0,05, y modulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `w1`, `w2`, `w3`, `in_proj` y `out_proj`. El entrenamiento consistio en 2 epocas, batch 1 con acumulacion de gradiente 8, learning rate 1e-4, warmup de 10 pasos, AdamW paginado de 8 bits, fp16 y checkpointing de gradiente, ejecutado en una GPU T4 durante 7,58 horas con un pico de 5,55 GiB de memoria.

Los datos provienen de `netgoat-ai/Koda-IDS-Frontier-SFT-Modes` (Apache-2.0): 16.000 filas VSA mas un suplemento de 500 filas de Trendyol. Tras el renderizado con la plantilla LFM3 y un limite de 2048 tokens, el conjunto queda en 15.671 ejemplos de entrenamiento (9.684.835 tokens) y 829 de validacion (512.018 tokens). El split de validacion se construye tomando cada vigesima fila dentro de cada modo de razonamiento. Los objetivos del asistente se dividen en `</think` para separar `reasoning` y `content` antes del renderizado, ya que la plantilla LFM3 solo emite la apertura `<think` para una clave `reasoning`. No se aplico RLHF ni DPO; es un SFT puro.

## Capacidades

- Generacion de texto orientada a investigacion de incidentes de ciberseguridad defensiva (deteccion, verificacion y contencion).
- Razonamiento etiquetado por modos: `none`, `low`, `med`, `high`, `xhigh` y `ultron`, heredados del dataset de entrenamiento.
- Analisis de escenarios de IDS, como fuerza bruta SSH, a partir de descripciones textuales de eventos.
- Soporte de plantilla de chat con `enable_thinking=True` para activar el bloque de razonamiento.
- Capacidades multilingues: solo ingles.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el modo `ultron` sugiere razonamiento extendido, pero no hay especificacion tecnica.
- Vision, audio: no disponible.

## Casos de uso

- Triaje de alertas IDS: el modelo recibe una descripcion textual de un evento (por ejemplo, fuerza bruta SSH desde 10.0.0.5 con 400 intentos en 90 segundos) y genera un analisis estructurado de deteccion y verificacion. Es adecuado por su entrenamiento especifico en escenarios de este tipo.
- Asistencia a analistas SOC en investigacion de incidentes: el modo de razonamiento permite ajustar la profundidad del analisis segun la criticidad del caso, desde `none` para triaje rapido hasta `ultron` para casos complejos.
- Generacion de pasos de contencion: el adaptador fue entrenado para proponer acciones de contencion tras la verificacion de un incidente, lo que lo hace util como borrador para revision humana.
- Documentacion de hallazgos: puede redactar informes de investigacion en estilo de dominio a partir de los datos de entrada, aunque requiere supervision por su tendencia a responder en ese registro.
- Prototipado de asistentes de seguridad en entornos de laboratorio: su bajo coste de despliegue (adaptador de 0,1 GB sobre un base de 1.700 millones) permite experimentar en una sola GPU consumer.
- Evaluacion comparativa de tecnicas de especializacion LoRA: sirve como referencia de que resultados se obtienen con QLoRA r=16 sobre 15.671 ejemplos y 2 epocas en una T4.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Train loss | 0,6244 |
| Eval loss (829 chunks reservados) | 0,5756 |
| NLL sobre 20 enunciados de SWE-bench | 2,2886 (ppl 9,86, 14.882 tokens) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor indica explicitamente que no se ejecuto una evaluacion tipo HumanEval y que no existe comparacion antes/despues con el modelo base, porque la cuota semanal de GPU de Kaggle se agoto antes de lanzar el kernel de evaluacion del base. Por tanto, solo hay numeros posteriores al entrenamiento, sin linea base de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: el base LFM3-1.7B en fp16 requiere aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en 4-bit NF4 se reduce a alrededor de 1 GB para pesos. El adaptador anade unos 66 MB (16,4 millones de parametros en fp16).
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA T4 con un pico de 5,55 GiB, por lo que cualquier GPU con al menos 8 GB es suficiente para inferencia.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas (RTX 3060, 4060, 4070, etc.). En 4-bit podria caber en GPUs de 4-6 GB.
- Opciones de despliegue: el autor documenta el uso con `transformers` + `peft` (PeftModel sobre AutoModelForCausalLM). No se mencionan vLLM, llama.cpp, Ollama ni TGI; al ser un adaptador LoRA sobre un base con `trust_remote_code=True`, la compatibilidad con esos motores no esta garantizada ni documentada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| koda-lfm3-1.7b | 1.700 M (base) + 16,4 M (adaptador) | no disponible | LoRA SFT sobre LFM3-1.7B | lfm1.0 (umbral 10 M USD) | Hugging Face, 0 descargas |
| LiquidAI/LFM3-1.7B-Base | 1.700 M | no disponible | Transformer base | lfm1.0 | Hugging Face (modelo base) |
| Alternativas de dominio de ciberseguridad de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Adaptador de dominio: no es un generador de codigo ni un chatbot general; responde a otros temas con el estilo del dominio IDS, segun advierte el propio autor.
- Sin comparacion antes/despues con el base: no se puede cuantificar la mejora real aportada por el ajuste, ya que no se midio el modelo base en las mismas particiones.
- Desbalance de modos de razonamiento: la distribucion se hereda del dataset original, con el modo `ultron` representando solo el 0,6 % de los ejemplos, lo que puede degradar su calidad.
- Entrenamiento corto: 2 epocas sobre 16.571 filas; riesgo de sobreajuste limitado pero sin validacion externa mas alla de las 829 filas reservadas.
- Riesgo de alucinacion: no evaluado; en un dominio de seguridad, las recomendaciones de contencion deben revisarse siempre por un analista humano.
- Idioma: solo ingles; no hay soporte documentado de castellano.
- Licencia: el base usa LFM Open License v1.0, con uso comercial permitido solo por debajo de un umbral de ingresos anuales de 10 millones de dolares; los datos son Apache-2.0. Aplican los terminos del upstream.
- Dependencia del base: requiere cargar LiquidAI/LFM3-1.7B-Base con `trust_remote_code=True`, lo que implica ejecutar codigo remoto.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta; sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netgoat-ai/koda-lfm3-1.7b
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Licencia del base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/netgoat-ai/Koda-IDS-Frontier-SFT-Modes
- Dataset en Kaggle: `aliciajgonzalez/koda-ids-lfm3-sft-data`
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
