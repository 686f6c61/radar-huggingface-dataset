# rajaykumar12959/qwen2.5-7b-abliterated

## Resumen

Modelo derivado de Qwen/Qwen2.5-7B-Instruct al que se ha aplicado la tecnica de **abliteration** a nivel de pesos, eliminando de forma permanente la direccion de rechazo (refusal direction) del circuito de seguridad del modelo. El autor, rajaykumar12959, extrae una direccion diferencia-de-medias (difference-in-means) a partir de activaciones ante prompts daninos (AdvBench) y benignos (Alpaca), y la ortogonaliza directamente sobre las proyecciones de escritura residual de la capa 16 de 28, sin hooks en runtime, sin LoRA y sin entrenamiento por gradientes.

El resultado es un checkpoint en bf16 con la misma arquitectura Qwen2 (7.615.616.512 parametros) y configuracion byte-identica al modelo base, salvo los pesos editados en `o_proj` y `down_proj` de la capa 16. La tasa de rechazo ante prompts daninos cae del 95-97% al 43,2%, mientras que la capacidad general (evaluada con un set independiente estilo ARC-Easy) permanece intacta con puntuacion 1.000. Es relevante para investigacion en interpretabilidad, alineacion y mecanismos de rechazo, aunque el propio autor advierte que la reduccion de rechazos es parcial y desigual entre categorias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2), 28 capas, atencion con RoPE, GQA |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (configuracion heredada del modelo base; extensible a 128K con YaRN) |
| Tipos de cuantizacion | bf16 (safetensors) en el repositorio; no se incluyen GGUF ni otras cuantizaciones |
| Idiomas soportados | No especificados en la model card; hereda el tokenizador y las capacidades multilingues del modelo base Qwen2.5-7B-Instruct |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer denso de 28 capas con atencion por ventanas deslizantes y GQA (grouped query attention). La modificacion aplicada es una **ablacion de direccion de rechazo a nivel de pesos**: se extrae una direccion unitaria por capa mediante diferencia de medias en fp32 entre activaciones de prompts daninos (walledai/AdvBench) y benignos (tatsu-lab/alpaca), capturadas en el ultimo token templated de la conversacion. Sobre esa direccion se aplica una ortogonalizacion en forma cerrada a cada proyeccion de escritura residual: `W' = W - d̂(d̂ᵀW)` y `b' = b - (d̂·b)d̂`, con coeficiente 1.0 (fuerza completa).

La edicion se aplica unicamente a `o_proj` (proyeccion de salida de atencion) y `down_proj` (proyeccion de bajada del MLP) de la capa 16, seleccionada por generalizar mejor entre distintas formulaciones de prompt que otras capas candidatas (una version previa en la capa 21 solo reducia el rechazo entre 3 y 9 puntos porcentuales). No hay entrenamiento por gradientes ni ajuste fino: el resto de tensores, configuracion y tokenizador son byte-identicos al repositorio original. La capacidad se verifica tras la edicion con un conjunto independiente de preguntas tipo ARC-Easy, confirmando que no se altera nada fuera del circuito de rechazo.

## Capacidades

- Generacion de texto conversacional con el mismo chat template que Qwen2.5-7B-Instruct; se carga y sirve sin parches adicionales.
- Razonamiento, codigo y matematicas heredados del modelo base (Qwen2.5-7B-Instruct), sin degradacion medida en la evaluacion de capacidad (puntuacion 1.000 en el set ARC-Easy independiente).
- Reduccion significativa de rechazos ante prompts daninos: tasa global del 43,2% frente al 95-97% del modelo original, con variacion por categoria (desde 79,2% en violencia hasta 16,7% en autolesion).
- Sin soporte especifico de tool calling o function calling documentado en la model card; las capacidades de agente, si existen, son las heredadas del modelo base.
- Capacidades multilingues no documentadas explicitamente; el tokenizador y la configuracion son identicos al modelo base, por lo que se espera el mismo comportamiento linguistico.

## Casos de uso

- Investigacion en interpretabilidad y alineacion de IA: permite estudiar como se distribuye el circuito de rechazo en las capas del transformer y que efectos tiene su ablacion parcial, con un checkpoint donde la edicion esta acotada a una unica capa y dos proyecciones concretas.
- Red teaming y evaluacion de seguridad: util para probar defensas, medir tasas de rechazo por categoria (violencia, fraude, malware, etc.) y comparar la robustez de distintos modelos ante prompts adversariales.
- Estudio de mecanismos de rechazo: al conservar intactas las capacidades generales, sirve como contrafactual para aislar el comportamiento de rechazo del resto de funciones del modelo.
- Desarrollo de tecnicas de jailbreak y defensas: la reduccion parcial y desigual del rechazo (43,2% global, con categorias al 16,7%) permite calibrar y evaluar metodos de evasion y sus contramedidas.
- Generacion de contenido creativo sin restricciones: para entornos de investigacion donde se necesita explorar respuestas que el modelo base rechazaria, con la advertencia de que la reduccion no es completa.
- Analisis de sesgos y comportamiento bajo prompts sensibles: la comparacion entre el modelo original y esta version abliterada permite aislar el efecto de las guardas de seguridad sobre la calidad y el tono de las respuestas.

## Benchmarks y rendimiento

La model card no incluye benchmarks estandar (MMLU, HumanEval, GSM8K), pero si una evaluacion propia de rechazo y capacidad:

| Metrica | Original | Abliterated |
|---|---|---|
| Tasa de rechazo (292 prompts daninos, 12 categorias) | ~95-97% | 43,2% |
| Puntuacion de capacidad (set independiente estilo ARC-Easy) | 1.000 | 1.000 (sin cambios) |

Desglose por categoria de la tasa de rechazo del checkpoint abliterated:

| Categoria | Tasa de rechazo |
|---|---|
| violencia | 79,2% |
| hate_speech | 62,5% |
| misinformation | 62,5% |
| extremism | 58,3% |
| fraud_scams | 54,2% |
| illicit_drugs | 45,8% |
| financial_crime | 37,5% |
| weapons | 33,3% |
| privacy_invasion | 33,3% |
| malware | 20,8% |
| cybercrime_hacking | 17,9% |
| self_harm | 16,7% |

Advertencia del autor: el 96-97% de los veredictos de la evaluacion provienen de un self-judge que se ejecuta sobre el propio modelo ya abliterado, por lo que las cifras exactas son provisionales y deben tratarse como direccionalmente fiables.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: ~15,2 GB (7,6 mil millones de parametros × 2 bytes), coincidiendo con el tamano del repositorio.
- GPUs recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para bf16 completo; A100 o H100 para despliegue en produccion con mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas para bf16; con cuantizacion a 4 bits (si se genera a partir de este checkpoint) cabria en GPUs de 8-12 GB, aunque el repositorio no incluye dichas cuantizaciones.
- Opciones de despliegue: Transformers con `device_map="auto"` y `torch.bfloat16` (ejemplo incluido en la model card) y vLLM (`vllm serve rajaykumar12959/qwen2.5-7b-abliterated`). Tambien compatible con cualquier runtime que soporte arquitectura Qwen2 estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser identico al modelo base salvo dos proyecciones de una capa, el rendimiento en inferencia es practicamente el mismo que Qwen2.5-7B-Instruct.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tecnica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rajaykumar12959/qwen2.5-7b-abliterated | 7,6B | 32K (hereda del base) | Ablacion de direccion de rechazo a nivel de pesos, capa 16, sin entrenamiento | MIT | HuggingFace, safetensors bf16 |
| huihui-ai/Qwen2.5-7B-Instruct-abliterated-v2 | 7,6B | 131.072 tokens | Abliteration (tecnica de FailSpy) | No especificada | HuggingFace, multiples cuantizaciones |
| richardyoung/qwen2.5-7b-instruct-abliterated | 7,6B | 32K (hereda del base) | Abliteration con herramienta Heretic | No especificada | Ollama, formato GGUF |
| Qwen/Qwen2.5-7B-Instruct (original) | 7,6B | 32K (extensible a 128K) | Sin modificaciones, guardas de seguridad activas | Apache 2.0 | HuggingFace, multiples formatos |

La diferencia principal de este modelo frente a las alternativas es que la ablacion se aplica de forma quirurgica a una unica capa (la 16) con coeficiente 1.0, mientras que otras implementaciones como la de huihui-ai o la de richardyoung suelen aplicar la tecnica de forma mas amplia. Ademas, este checkpoint se distribuye unicamente en bf16, sin cuantizaciones oficiales.

## Limitaciones y advertencias

- El modelo ha sido desprovisto de guardas de seguridad y cumplira con solicitudes que el modelo original rechazaria; el propio autor declina toda responsabilidad sobre el uso downstream.
- La reduccion de rechazos es parcial y desigual: categorias como violencia (79,2%) o discurso de odio (62,5%) mantienen tasas de rechazo altas, mientras que autolesion (16,7%) o ciberdelincuencia (17,9%) quedan mucho mas expuestas.
- La evaluacion de rechazo depende en gran medida de un self-judge que se ejecuta sobre el propio modelo abliterado (96-97% de los veredictos), lo que introduce un sesgo conocido no corregido; las cifras exactas son provisionales.
- No se han publicado benchmarks estandar (MMLU, HumanEval, GSM8K) para este checkpoint; la unica evaluacion de capacidad es un set independiente estilo ARC-Easy con puntuacion 1.000.
- El repositorio solo incluye pesos en bf16 (15,2 GB); no hay cuantizaciones GGUF, AWQ ni GPTQ oficiales, lo que limita el despliegue en hardware de gama baja sin conversion manual.
- Licencia MIT permite uso comercial, pero el uso del modelo para generar contenido danino puede incurrir en responsabilidades legales del usuario final.
- No apto para produccion en entornos donde se requiera moderacion de contenido o cumplimiento normativo; su uso debe limitarse a investigacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rajaykumar12959/qwen2.5-7b-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Herramienta de ablacion y evaluacion (AblateBench): https://github.com/rajaykumar12959/AblateBench
- Dataset walledai/AdvBench: https://huggingface.co/datasets/walledai/AdvBench
- Dataset tatsu-lab/alpaca: https://huggingface.co/datasets/tatsu-lab/alpaca
- Modelo comparable (huihui-ai): https://huggingface.co/huihui-ai/Qwen2.5-7B-Instruct-abliterated-v2
- Modelo comparable (richardyoung, Ollama): https://ollama.com/richardyoung/qwen2.5-7b-instruct-abliterated
