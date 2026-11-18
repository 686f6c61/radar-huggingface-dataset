# bhatraasim/qwen2.5-0.5b-gsm8k-distill-lora

## Resumen

`qwen2.5-0.5b-gsm8k-distill-lora` es un adaptador LoRA desarrollado por el usuario bhatraasim que especializa el modelo base Qwen/Qwen2.5-0.5B-Instruct en la resolución de problemas aritmeticos de primaria del conjunto GSM8K. El adaptador ensena al modelo a emitir sus respuestas en un formato estructurado con etiquetas `` para el razonamiento y `<answer>…</answer>` para el resultado final, siguiendo trazas de razonamiento verificadas generadas por el modelo profesor Qwen/Qwen2.5-Math-7B-Instruct.

El problema que aborda es la baja adherencia al formato del modelo base: cuando se le presenta un prompt etiquetado, el Qwen2.5-0.5B-Instruct original solo produce una respuesta extraible en el 0,08% de los casos, lo que hunde su precision al 16,83% pese a que en prosa libre resuelve correctamente el 40,71% de los problemas. El adaptador eleva la precision al 42,15% con un 96,82% de respuestas bien formadas, aunque la model card reconoce explicitamente que la mejora es fundamentalmente de cumplimiento de formato y no de capacidad de razonamiento nueva.

Se trata de un adaptador de bajo rango (r=32) sobre un transformer decoder-only de 0,5 mil millones de parametros, con licencia Apache-2.0, publicado en noviembre de 2026 y orientado exclusivamente al ingles. Su relevancia es acotada: sirve como pieza de un estudio mas amplio de SFT/GRPO sobre matematicas con Qwen y como ejemplo de destilacion de trazas, no como solucion de produccion para matematicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-0.5B-Instruct |
| Parametros totales | 0,5 mil millones (modelo base); adaptador LoRA con r=32, alpha=64 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones habituales de Qwen2.5) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 0,5 mil millones de parametros. El entrenamiento utiliza LoRA con rango 32, alpha 64, dropout 0,05 y modulos `q/k/v/o/gate/up/down`. El optimizador es AdamW con learning rate 1e-4, scheduler coseno, 3% de warmup, una epoca y batch efectivo de 16, en precision fp16 con perdida calculada solo sobre los tokens de completion (completion-only loss).

Los datos de entrenamiento son 7.178 trazas de razonamiento verificadas generadas por Qwen2.5-Math-7B-Instruct, con una mediana de 182 palabras. Se filtraron las trazas con menos de 60 o mas de 600 tokens de respuesta y se conservaron unicamente aquellas cuyo resultado final coincidia con la verdad de referencia (`distill_correct.jsonl`). No hay etapa de RLHF ni DPO en este adaptador; la model card menciona que forma parte de un estudio SFT/GRPO y que una etapa GRPO posterior sigue a este adaptador. La innovacion principal es la destilacion de trazas verificadas con filtrado por correccion y la ensenanza de un formato de salida estricto con etiquetas.

## Capacidades

- Generacion de texto conversacional en ingles sobre el modelo base Qwen2.5-0.5B-Instruct.
- Razonamiento aritmetico de primaria (problemas de tipo GSM8K) con cadena de pasos explicita.
- Emision de respuestas en formato estructurado `<think>…</think><answer>…</answer>` con alta adherencia (96,82% de respuestas bien formadas en el test de GSM8K).
- Soporte de plantilla de chat (`apply_chat_template`) con mensaje de sistema que instruye el formato de razonamiento y respuesta.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking nativo mas alla de las etiquetas de formato.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Evaluacion de pipelines de destilacion: usar el adaptador como referencia para medir cuanto de la mejora en un modelo pequeno proviene del formato y cuanto del razonamiento, replicando el protocolo de la model card (prompt etiquetado, decoding greedy, max_new_tokens=640).
- Generacion de datos sinteticos de matematicas: el adaptador produce trazas en formato `<think>/<answer>` que pueden parsearse de forma fiable (96,82% bien formadas) para alimentar etapas posteriores de SFT o GRPO sobre modelos mayores.
- Prototipado educativo: construir un asistente de resolucion de problemas aritmeticos de primaria en ingles que muestre el razonamiento paso a paso antes de la respuesta final, aprovechando el formato estructurado.
- Investigacion sobre adherencia a formato: comparar el comportamiento del modelo base con y sin adaptador bajo el mismo prompt etiquetado para estudiar el efecto del SFT en el cumplimiento de instrucciones de formato en modelos de 0,5B.
- Baseline ligero en entornos con recursos minimos: desplegar el adaptador en CPU o GPU de gama baja para tareas de aritmetica basica donde no se requiere un solver fuerte y prima la latencia y el coste.
- Pruebas de integracion de PEFT: validar flujos de carga con `PeftModel.from_pretrained` y plantillas de chat identicas a las de entrenamiento (el repositorio incluye los ficheros de tokenizer y la plantilla exacta usados en entrenamiento).

## Benchmarks y rendimiento

Evaluacion sobre el split de test de GSM8K (n = 1.319), decoding greedy, `max_new_tokens=640`, intervalos de confianza del 95% de Wilson.

| Modelo | Prompt | Precision | Bien formadas | Tokens medios |
|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct (base) | legacy | 40,71% [38,09; 43,39] | — | 332,8 |
| Qwen2.5-0.5B-Instruct (base) | tagged | 16,83% [14,91; 18,95] | 0,08% | 282,6 |
| Este adaptador | tagged | 42,15% [39,51; 44,84] | 96,82% | 313,8 |

La model card advierte que la comparacion relevante es la tercera fila frente a la segunda (mismo prompt etiquetado), no frente a la primera. El modelo base obtiene 16,83% con prompt etiquetado porque 772 de 1.319 respuestas no contienen respuesta extraible. La mejora del adaptador es real pero mayoritariamente de formato: el mismo modelo base ya resuelve el 40,71% en prosa libre.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA anade un sobrecoste minimo sobre el modelo base de 0,5B; en fp16 el modelo base ocupa aproximadamente 1 GB, y en cuantizacion de 4 bits puede caber en menos de 1 GB. No se proporcionan cifras oficiales en la informacion disponible.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien es viable en CPU para inferencia puntual.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer con al menos 2-4 GB de VRAM en fp16, y en menos con cuantizacion.
- Opciones de despliegue: carga con `transformers` + `peft` segun el ejemplo de la model card; el modelo base es compatible con vLLM, llama.cpp, Ollama y TGI, aunque la informacion proporcionada no detalla la integracion del adaptador en cada uno de estos motores.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen2.5-0.5B-Instruct) | 0,5B + LoRA r=32 | no disponible | 42,15% (prompt tagged) | apache-2.0 | Hugging Face (PEFT) |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | no disponible | 40,71% (legacy) / 16,83% (tagged) | apache-2.0 | Hugging Face |
| Qwen2.5-Math-7B-Instruct (profesor) | 7B | no disponible | no disponible en la informacion | no disponible en la informacion | Hugging Face |

La model card menciona que la misma receta alcanza resultados superiores en un modelo matematico de 1,5B, pero no se aportan cifras concretas en la informacion disponible.

## Limitaciones y advertencias

- Modelo de 0,5B: el 42,15% esta muy por debajo de lo que la misma receta alcanza en un modelo matematico de 1,5B; no debe interpretarse como un solver fuerte.
- La ganancia es mayoritariamente de cumplimiento de formato, no de razonamiento nuevo; si el harness ya parsea respuestas en prosa libre, conviene medir antes de adoptarlo.
- Entrenamiento con una sola semilla (42), una sola tasa de aprendizaje y solo LoRA; no se exploran otras configuraciones.
- Limitado a ingles y a aritmetica de nivel escolar; no cubre matematicas avanzadas ni otros dominios.
- Riesgo de alucinacion inherente a un modelo de 0,5B, especialmente en problemas fuera de la distribucion de GSM8K.
- Sesgos: no se documentan sesgos especificos en la informacion proporcionada, pero el modelo base puede arrastrar sesgos de sus datos de entrenamiento.
- Licencia Apache-2.0 permite uso comercial, pero la model card no ofrece garantias de rendimiento en produccion; el uso comercial debe acompanarse de evaluacion propia.
- El adaptador depende del prompt etiquetado y de la plantilla de chat exacta del repositorio; usar la plantilla del modelo base puede degradar el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bhatraasim/qwen2.5-0.5b-gsm8k-distill-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo profesor: https://huggingface.co/Qwen/Qwen2.5-Math-7B-Instruct
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Repositorio de codigo del estudio Qwen Math SFT/GRPO: no disponible en la informacion proporcionada
