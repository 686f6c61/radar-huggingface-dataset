# harness-hub/Qwen3.8-27B-think-pi-adapted-GGUF

## Resumen

Qwen3.8-27B-think-pi-adapted-GGUF es la version en formato GGUF del adaptador LoRA `harness-hub/Qwen3.8-27B-think-pi-adapted`, entrenado por el usuario harness-hub mediante aprendizaje por refuerzo dentro del harness pi, manteniendo el modo de razonamiento (thinking) activado. El adaptador se aplica sobre el modelo base `Qwen/Qwen3.8-27B` y esta pensado para su uso con llama.cpp. El objetivo central del entrenamiento es reducir el coste en tokens de razonamiento sin sacrificar precision en tareas de ingenieria de software y uso de terminal.

La relevancia practica del adaptador reside en su eficiencia: segun la model card, mantiene la precision del modelo base en SWE-bench Pro (76,5 % frente a 74,5 % del base y del adaptador pi, ambos con thinking) mientras gasta aproximadamente un 40 % menos de tokens de salida en las tareas que los tres resuelven. En inferencia local, donde cada token generado cuesta tiempo, esta reduccion es un factor decisivo para el despliegue de agentes de codigo sobre hardware propio.

El repositorio publicado contiene unicamente el adaptador en formato GGUF (F16, unos 319 MB), no los pesos completos del modelo base. El tamano del repo es de 0,3 GB y el dato de parametros totales reportado en safetensors (159.383.552) corresponde al adaptador, no al modelo base de 27B. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen3.8-27B; formato GGUF para llama.cpp |
| Parametros totales | 159.383.552 (adaptador; el modelo base es de 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (configuracion de evaluacion y ejemplo de servicio) |
| Tipos de cuantizacion | Adaptador en F16; el modelo base se sirve en GGUF (Q8_0 recomendado, Q4_K_M como alternativa mas ligera) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (adaptador LoRA en F16, ~319 MB) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `Qwen/Qwen3.8-27B`, un transformer del que la informacion disponible no detalla la arquitectura interna (atencion, capas, configuracion MoE o densa). El entrenamiento se realizo mediante aprendizaje por refuerzo dentro del harness pi, con el modo thinking activado, y se publica como adaptador LoRA PEFT que posteriormente se convirtio a GGUF con la herramienta `convert_lora_to_gguf.py` de llama.cpp en precision F16.

La innovacion tecnica destacable es el objetivo de entrenamiento: conservar la precision del razonamiento explicito reduciendo el numero y la longitud de los bloques de razonamiento generados. Segun la model card, en las tareas que resuelven los tres modelos, el adaptador produce 26,7k tokens de salida por tarea en SWE-bench Pro frente a 46,0k del adaptador pi con thinking (−42 % de media), y 5,8k por tarea en Terminal-Bench 2.1 frente a 9,3k (−38 % de mediana). No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas adicionales como DPO.

## Capacidades

- Generacion de texto y razonamiento explicito con modo thinking activable mediante `enable_thinking`.
- Resolucion de tareas de ingenieria de software: parcheo de repositorios y correccion de bugs evaluados en SWE-bench Pro.
- Uso de terminal y ejecucion de comandos en entornos de agente, evaluado en Terminal-Bench 2.1.
- Integracion con harness de agentes: el modelo esta pensado para ejecutarse bajo el harness pi a traves de la extension `pi-llama`.
- Razonamiento multi-paso con presupuesto de pasos (las evaluaciones usaron un limite de 100 pasos por tarea).
- Eficiencia en tokens de razonamiento: aproximadamente un 40 % menos de tokens de salida en tareas resueltas por igual.
- Soporte de tool calling y function calling: no confirmado de forma explicita en la informacion disponible, aunque el uso como agente bajo pi implica interaccion con herramientas.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Agente de correccion de bugs en repositorios: el adaptador esta entrenado y evaluado en SWE-bench Pro, por lo que encaja en pipelines que reciben un issue, localizan el fallo y generan un parche. La reduccion de tokens de razonamiento abarata cada intento en inferencia local.
- Automatizacion de tareas de terminal: con Terminal-Bench 2.1 como referencia, el modelo puede operar sesiones de shell para diagnosticar entornos, ejecutar comandos y verificar resultados dentro del harness pi.
- Despliegue local de agentes de codigo: al ser un adaptador GGUF sobre llama.cpp, permite servir un agente de 27B en hardware propio sin depender de APIs externas, con contexto de hasta 131.072 tokens para sesiones largas.
- Asistente de refactorizacion con contexto amplio: la ventana de 131k tokens permite cargar modulos completos o varios ficheros relacionados y razonar sobre ellos en una sola sesion.
- Evaluacion y experimentacion en investigacion de RL para agentes: el adaptador sirve como referencia reproducible de entrenamiento por refuerzo con thinking sobre un modelo abierto, con metricas publicadas en dos benchmarks de agentes.
- Integracion en CI/CD para revision automatizada: el modelo puede analizar diffs y proponer correcciones dentro de un paso de integracion, con un coste por tarea acotado gracias al menor consumo de tokens.
- Servicio de razonamiento con presupuesto controlado: en escenarios donde la latencia importa, el menor numero de tokens de razonamiento reduce el tiempo por respuesta manteniendo la precision del modo thinking.

## Benchmarks y rendimiento

| Benchmark | Este adaptador (GGUF, referencia BF16) | Adaptador pi con thinking | Modelo base con thinking |
|---|---|---|---|
| SWE-bench Pro (hard 51) | 76,5 % | 74,5 % | 74,5 % |
| Terminal-Bench 2.1 | 57,1 % | 59,5 % | 60,7 % |
| Tokens de salida por tarea en SWE-bench Pro | 26,7k | 46,0k | no disponible |
| Tokens de salida por tarea en Terminal-Bench 2.1 | 5,8k (mediana) | 9,3k (mediana) | no disponible |

Los resultados proceden del adaptador en BF16 servido con vLLM bajo el harness pi, con un intento por tarea, presupuesto de 100 pasos, thinking activado a esfuerzo por defecto, hasta 32k tokens de salida por llamada y temperatura 0,8. La model card advierte que el fichero GGUF no se ha reevaluado a traves de llama.cpp y que una base cuantizada alterara los resultados.

## Requisitos de hardware

- VRAM estimada: el adaptador en si ocupa unos 319 MB en F16; el grueso del consumo corresponde al modelo base de 27B. En Q8_0 se estima en torno a 28-30 GB de VRAM; en Q4_K_M, en torno a 16-18 GB. Estas cifras son estimaciones por tamano de pesos y no aparecen en la informacion proporcionada.
- GPU recomendadas: para Q8_0 se requiere una GPU de 40-48 GB o superior (A100 40/80 GB, H100, L40S 48 GB). Para Q4_K_M puede caber en una RTX 4090 de 24 GB, con margen limitado para el contexto de 131k tokens.
- Cabe en GPU de consumo: si, en el caso de la cuantizacion Q4_K_M sobre RTX 4090 o GPUs de 24 GB, con posible descarga parcial de capas a CPU si se necesita contexto largo.
- Opciones de despliegue: llama.cpp mediante `llama serve` con `--lora` para cargar el adaptador y `--chat-template-kwargs '{"enable_thinking": true}'`; integracion con el harness pi a traves de `pi-llama`. vLLM se uso para la evaluacion en BF16, pero la informacion disponible no confirma el soporte del adaptador GGUF en vLLM.
- Latencia y throughput: no disponible. La model card solo cuantifica la reduccion de tokens de salida (aproximadamente un 40 %), que se traduce directamente en menor tiempo de generacion en inferencia local.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Pro (hard 51) | Terminal-Bench 2.1 | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-think-pi-adapted (este adaptador) | 27B (base) + LoRA | 131.072 | 76,5 % | 57,1 % | Apache 2.0 | GGUF (LoRA F16) |
| Qwen3.8-27B-think-pi-adapted (BF16, vLLM) | 27B (base) + LoRA | 131.072 | 76,5 % | 57,1 % | Apache 2.0 | safetensors/PEFT |
| Qwen/Qwen3.8-27B con thinking | 27B | 131.072 | 74,5 % | 60,7 % | no disponible en la informacion | no disponible |
| Adaptador pi con thinking | 27B (base) + LoRA | 131.072 | 74,5 % | 59,5 % | no disponible en la informacion | no disponible |

La comparativa se limita a las variantes citadas en la model card; no se dispone de datos de otros modelos de la misma categoria para contrastar.

## Limitaciones y advertencias

- El fichero GGUF no se ha reevaluado a traves de llama.cpp: los resultados publicados corresponden al adaptador BF16 servido con vLLM, y una base cuantizada puede degradar las metricas.
- El adaptador se entreno y evaluo con thinking activado; su comportamiento con thinking desactivado no se ha evaluado.
- El adaptador rinde mejor cuanto mas cerca este la base de los pesos BF16 originales; Q8_0 es el compromiso recomendado y Q4_K_M se aleja mas del comportamiento aprendido.
- Las sesiones de razonamiento son largas: se necesitan contextos amplios (131.072 tokens en la evaluacion) y hasta 32.768 tokens de salida por llamada; recortar el contexto o el limite de salida trunca el razonamiento y degrada los resultados.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a los modelos generativos en tareas de codigo y terminal.
- Sesgos conocidos: no disponible.
- Idiomas soportados: no disponible; no se documenta el comportamiento multilingue.
- Uso comercial: la licencia Apache 2.0 del adaptador lo permite, pero debe verificarse la licencia del modelo base Qwen3.8-27B, que no se detalla en la informacion proporcionada.
- El repositorio solo contiene el adaptador; es necesario descargar por separado el modelo base en GGUF desde `ggml-org/Qwen3.8-27B-GGUF`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/harness-hub/Qwen3.8-27B-think-pi-adapted-GGUF
- Adaptador original (BF16, PEFT): https://huggingface.co/harness-hub/Qwen3.8-27B-think-pi-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF del modelo base: https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Extension pi-llama: https://github.com/huggingface/pi-llama
