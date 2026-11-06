# janamohamed111/smollm2-smoltalk-sft

## Resumen

SmolLM2 SmolTalk SFT Adapter es un adaptador LoRA publicado por el usuario janamohamed111 sobre el modelo base HuggingFaceTB/SmolLM2-135M. El objetivo declarado es mejorar la capacidad conversacional y de seguimiento de instrucciones del modelo base mediante ajuste fino supervisado (SFT) sobre el conjunto de datos smol-smoltalk. Se trata, por tanto, de un experimento de ajuste fino de pequena escala, no de un modelo entrenado desde cero.

El modelo base SmolLM2-135M es un transformer decoder-only de 135 millones de parametros desarrollado por Hugging Face, disenado para ejecutarse en hardware muy modesto. El adaptador anade pesos LoRA de rango 8 entrenados durante 2 epocas sobre 2.000 conversaciones, con una longitud maxima de secuencia de 512 tokens y una unica GPU NVIDIA Tesla T4.

La relevancia de esta ficha es limitada: el repositorio tiene 0 descargas y 1 like en el momento de la consulta, el autor es un particular y la evaluacion se restringe a 256 ejemplos reservados y 15 prompts. Aun asi, resulta un ejemplo representativo del flujo de trabajo LoRA + PEFT + TRL aplicado a modelos pequenos para tareas de conversacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base SmolLM2-135M) con adaptador LoRA |
| Parametros totales | 135 millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (longitud maxima de secuencia usada en entrenamiento); contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos LoRA en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM2-135M, un transformer decoder-only de 135 millones de parametros. El ajuste fino se realizo con LoRA mediante las librerias PEFT y TRL, con rango 8, alpha 16, 2 epocas, tasa de aprendizaje 0,0001, longitud maxima de secuencia de 512 y tamano de lote efectivo de 8. El entrenamiento se ejecuto en una NVIDIA Tesla T4.

Se utilizaron 2.000 conversaciones del dataset smol-smoltalk, reservando 256 conversaciones para evaluacion. Se aplico perdida solo sobre los turnos del asistente (assistant-only loss), de modo que el modelo aprende de las respuestas del asistente y no de los turnos del usuario. No se documenta el numero total de tokens vistos, la composicion detallada del dataset, ni el uso de RLHF o DPO; el procedimiento descrito es exclusivamente SFT.

## Capacidades

- Generacion de texto conversacional en formato multi-turno, heredada del modelo base y reforzada con el ajuste sobre smol-smoltalk.
- Seguimiento de instrucciones basicas, objetivo declarado del ajuste fino.
- Generacion de respuestas en espanol u otros idiomas: no disponible; el autor no documenta los idiomas cubiertos.
- Tool calling o function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; el tamano del modelo (135M) hace poco probable un rendimiento util en estas tareas.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en local: el modelo base de 135M y el adaptador LoRA caben en cualquier GPU consumer e incluso en CPU, lo que permite iterar rapidamente en entornos de desarrollo sin infraestructura dedicada.
- Experimentacion academica con LoRA y SFT: el repositorio documenta la configuracion completa (rango, alpha, epocas, learning rate) y enlaza un notebook de Colab, por lo que sirve como referencia reproducible para estudiar el efecto del ajuste fino en modelos pequenos.
- Evaluacion de tecnicas de mitigacion de repeticion: el autor reporta una reduccion de la repeticion media de trigramas de 0,695 a 0,271 y de los ecos de prompt de 9 a 0 sobre 15 prompts, lo que convierte al adaptador en un caso de estudio de este problema.
- Generacion de respuestas breves en aplicaciones de bajo coste: con contexto de 512 tokens, encaja en tareas de chat acotado donde la latencia y el consumo de memoria son criticos.
- Filtrado y clasificacion ligera de texto conversacional: al ser un modelo de 135M, puede ejecutarse en pipelines de preprocesado con requisitos minimos de hardware.
- Base para nuevos ajustes incrementales: al ser un adaptador LoRA sobre un modelo Apache 2.0, puede combinarse o sustituirse por otros adaptadores en flujos de experimentacion.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son metricas internas de evaluacion sobre 256 ejemplos reservados y 15 prompts, no benchmarks estandar:

| Metrica | Adaptador previo | Candidato ajustado |
|---|---:|---:|
| Perdida en held-out (solo asistente) | 1,6846 | 1,5386 |
| Repeticion media de trigramas | 0,695 | 0,271 |
| Ecos de prompt (15 prompts) | 9 | 0 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 135M en precision completa (FP32) ocupa aproximadamente 540 MB; en FP16/BF16, unos 270 MB; en cuantizacion de 8 bits, unos 135 MB; en 4 bits, unos 70 MB. Los pesos del adaptador LoRA anaden una cantidad marginal no especificada.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el autor entreno en una NVIDIA Tesla T4. No se requieren A100 ni H100.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas (GTX 1650, RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: transformers + PEFT (flujo documentado por el autor); llama.cpp, Ollama, vLLM o TGI no estan documentados para este adaptador concreto y requeririan conversion o fusion de pesos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| janamohamed111/smollm2-smoltalk-sft | 135M (base) + LoRA | 512 (entrenamiento) | Apache 2.0 | Hugging Face, 0 descargas |
| HuggingFaceTB/SmolLM2-135M (base) | 135M | No disponible en la informacion proporcionada | Apache 2.0 | Hugging Face, modelo oficial |
| SmolLM2-360M | 360M | No disponible en la informacion proporcionada | Apache 2.0 | Hugging Face, modelo oficial |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo base tiene solo 135 millones de parametros; las respuestas pueden ser repetitivas o inexactas, como reconoce el propio autor.
- La evaluacion se limita a 256 ejemplos reservados y 15 prompts, por lo que no establece un rendimiento general fiable en tareas conversacionales.
- La longitud de contexto usada en entrenamiento es de 512 tokens, lo que limita las conversaciones largas.
- No se documentan los idiomas soportados ni los sesgos conocidos del adaptador.
- Riesgo de alucinacion: alto, inherente a un modelo de este tamano sin datos de evaluacion especificos.
- Licencia Apache 2.0: permite uso comercial, pero el adaptador se distribuye sin garantias y con 0 descargas, por lo que no hay validacion externa.
- El repositorio tiene un tamano de 0,0 GB segun la informacion disponible, lo que puede indicar que los pesos del adaptador no estan completamente subidos o son de tamano minimo; conviene verificarlo antes de usarlo.
- No se documenta soporte de tool calling, agentes ni capacidades multimodales.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/janamohamed111/smollm2-smoltalk-sft
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Dataset: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Notebook de entrenamiento (Google Colab): https://colab.research.google.com/drive/11SWIS2_iGTD80PAVxb262Zfx4U5kl88w
