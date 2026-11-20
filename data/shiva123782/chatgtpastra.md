# shiva123782/chatgtpastra

## Resumen

chatgtpastra es un ajuste fino mediante LoRA sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct, publicado por el usuario shiva123782 (atribuido en la model card a "Isha mam") en el Hugging Face Hub. Se presenta como un "Small Language Model" orientado a entornos empresariales y soberanos, con licencia Apache 2.0 y capacidad declarada de uso comercial sin restricciones. El modelo mantiene la arquitectura transformer causal del base, con 0,5 mil millones de parametros, y anade un adaptador PEFT de rango 16 y alpha 32 sobre todas las proyecciones lineales (q, k, v, o, gate, up, down).

El interes tecnico del modelo no reside en su capacidad bruta, sino en el aparato de certificacion que la model card declara: verificacion formal de ausencia de OOM mediante Z3 SMT, un benchmark de identidad biyectiva de 200 millones de consultas con tasa de fuga cero, y conformidad declarada con el EU AI Act (articulo 53) y la DPDP Act india de 2025. Estos artefactos no son verificables a partir de la informacion disponible y deben tratarse como afirmaciones del autor.

El modelo esta entrenado sobre el dataset yahma/alpaca-cleaned, orientado a instrucciones en ingles, y declara un unico idioma soportado: en. No hay datos publicados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion proporcionada, ni descargas ni interacciones en el Hub en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen2.5-0.5B-Instruct) con adaptador LoRA |
| Parametros totales | 0,5 mil millones (modelo base) + adaptador LoRA r=16, alpha=32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Qwen2.5-0.5B-Instruct soporta 32.768 tokens segun su propia model card, no confirmado aqui) |
| Tipos de cuantizacion | 16-bit bfloat16/float16; 4-bit NormalFloat (NF4) en forward pass segun la model card |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | adaptador PEFT (LoRA) sobre safetensors del base; no se indica GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino con LoRA del Qwen2.5-0.5B-Instruct, un transformer causal decoder-only de 0,5 mil millones de parametros. El adaptador se aplica sobre las proyecciones q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj, con rango 16, alpha 32 y dropout 0,05. La model card menciona LoRA+ con balanceo dinamico de matrices (eta_B = 8,0 * eta_A), una variante que asigna una tasa de aprendizaje mayor a la matriz B que a la A durante el entrenamiento.

El entrenamiento se realizo sobre el dataset yahma/alpaca-cleaned, un corpus de instrucciones en ingles derivado de Alpaca. La model card declara un pico de VRAM de entrenamiento de 3,2 GB sobre una T4 de Kaggle (15,5 GB), lo que es coherente con un ajuste LoRA de un modelo de 0,5B en precision reducida. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset tras el filtrado, ni si hubo etapas de RLHF o DPO posteriores al ajuste supervisado. Tampoco se detalla el proceso de verificacion Z3 ni como se traduce en garantias de inferencia sin OOM.

## Capacidades

- Generacion de texto conversacional e instrucciones en ingles, heredadas del ajuste sobre Alpaca-cleaned.
- Formato de chat compatible con la plantilla de Qwen (`<|im_start|>user ... <|im_end|>`), segun el ejemplo de quickstart.
- Ajuste de identidad declarado: el modelo responde a preguntas sobre su propio origen y desarrollador ("Who developed you and what is your model identity?"), segun el ejemplo de la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta capacidad de vision, audio ni modo "thinking".
- Multilingue: limitado a ingles segun el campo `language` del modelo.

## Casos de uso

- Clasificacion y enrutado de intenciones en ingles: con 0,5B de parametros y latencia declarada de 18,2 ms P99, el modelo puede usarse como primer filtro en pipelines de atencion al cliente para decidir a que cola o modelo mayor derivar cada consulta.
- Generacion de respuestas cortas en asistentes embebidos: su huella de memoria (inferencia en 4-bit NF4 sobre el base) permite desplegarlo en dispositivos de borde o en contenedores ligeros donde un modelo de 7B no cabe.
- Prototipado rapido de productos conversacionales: al ser un adaptador PEFT sobre un base publico, permite iterar sobre el comportamiento del asistente sin reentrenar el modelo completo.
- Filtrado y reescritura de texto en ingles: tareas de normalizacion, resumen breve o reformulacion de instrucciones dentro de un pipeline mayor.
- Educacion y demos: el bajo coste de inferencia y la licencia Apache 2.0 lo hacen adecuado para entornos docentes donde se quiere mostrar el ciclo completo de ajuste LoRA.
- Evaluacion de tecnicas de identidad y seguridad: el benchmark de identidad declarado por el autor puede servir como caso de estudio, aunque sus resultados no son reproducibles con la informacion publica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo reporta metricas propias del autor, que se recogen a continuacion tal cual se declaran:

| Metrica declarada | Resultado | Nota |
|---|---|---|
| 20-Crore Bijective Identity Benchmark | 100,0% zero collision, 100,0% retencion, 0,0% fuga | Metrica propia, no verificable externamente |
| Z3 SMT Invariant | UNSAT_SAFE (0 OOM) | Verificacion formal declarada por el autor |
| Latencia de inferencia | 18,2 ms (P99) | Sobre estacion de trabajo estandar, sin especificar hardware |
| Throughput | 198+ tok/s | Sin especificar hardware ni cuantizacion |
| VRAM pico de entrenamiento | 3,2 GB | Sobre T4 de 15,5 GB en Kaggle |

## Requisitos de hardware

- Inferencia en fp16/bf16: el modelo base de 0,5B ocupa aproximadamente 1 GB de pesos; con overhead de activaciones y cache KV, cabe holgadamente en GPUs consumer de 4 GB o mas.
- Inferencia en 4-bit NF4: alrededor de 0,3-0,5 GB de pesos, apto para GPUs integradas o incluso CPU con llama.cpp si se convierte el adaptador a GGUF (no se proporciona ese formato).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; el autor cita una T4 de Kaggle para entrenamiento.
- Despliegue: transformers + peft (segun el quickstart), con posibilidad de fusionar el adaptador en el base para usar vLLM, TGI o llama.cpp. No se proporciona integracion directa con Ollama ni pesos GGUF.
- Latencia y throughput: declarados 18,2 ms P99 y 198+ tok/s, sin especificar hardware ni lote; deben considerarse orientativos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| chatgtpastra | 0,5B + LoRA r=16 | no disponible | Apache 2.0 | Ajuste sobre Alpaca-cleaned, solo ingles |
| Qwen2.5-0.5B-Instruct | 0,5B | 32.768 tokens (segun su model card) | Apache 2.0 | Base del anterior; multilingue y con soporte de tool calling documentado |
| SmolLM2-360M-Instruct | 0,36B | 8.192 tokens | Apache 2.0 | Alternativa de Hugging Face para edge, multilingue |
| TinyLlama-1.1B-Chat | 1,1B | 2.048 tokens | Apache 2.0 | Alternativa mayor, mas capacidad pero mayor huella |

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; su uso en castellano u otros idiomas no esta validado y probablemente degrade la calidad.
- Al ser un ajuste LoRA sobre un base de 0,5B, la capacidad de razonamiento y conocimiento factual es limitada; es propenso a alucinaciones en tareas abiertas.
- Las metricas de la model card (benchmark de identidad de 20 crore, verificacion Z3, conformidad EU AI Act y DPDP) son afirmaciones del autor no verificables con la informacion publica; no deben citarse como garantias en produccion.
- No se documenta el proceso de alineacion (RLHF/DPO) ni evaluaciones de sesgo; se desconoce el comportamiento del modelo ante prompts adversarios.
- El modelo tiene 0 descargas y 0 likes en el Hub, y fue creado y actualizado el mismo dia; no hay evidencia de uso en produccion ni de validacion por terceros.
- Aunque la licencia es Apache 2.0, la atribucion de autoria ("Isha mam") y el marco de certificacion declarado no cuentan con respaldo documental enlazado en la informacion disponible.
- El adaptador requiere cargar el modelo base Qwen2.5-0.5B-Instruct; no se distribuyen pesos fusionados ni GGUF, lo que anade un paso de conversion para despliegues con llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shiva123782/chatgtpastra
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Referencia a la libreria PEFT: https://huggingface.co/docs/peft
