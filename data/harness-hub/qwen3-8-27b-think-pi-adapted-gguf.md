# harness-hub/Qwen3.8-27B-think-pi-adapted-GGUF

## Resumen

Qwen3.8-27B-think-pi-adapted-GGUF es la distribucion en formato GGUF de un adaptador LoRA entrenado mediante aprendizaje por refuerzo sobre el modelo base Qwen/Qwen3.8-27B. Lo publica el usuario harness-hub y esta pensado especificamente para su uso con llama.cpp. El adaptador se entreno con el modo de razonamiento (thinking) activado dentro del harness pi, con el objetivo de mantener la precision del razonamiento extendido pero reduciendo de forma notable el numero de tokens generados.

El problema que aborda es el coste computacional del razonamiento explicito: cada token generado en local consume tiempo, y los modelos con thinking tienden a producir bloques de razonamiento largos. Segun la model card, este adaptador logra una precision comparable a la del modelo base y al adaptador pi original, pero con aproximadamente un 40 % menos de tokens de salida en las tareas que los tres resuelven.

El repositorio incluye dos artefactos: una version fusionada y cuantizada a Q8_0 (unos 28,6 GB) y el adaptador LoRA aislado en F16 (unos 319 MB), que se aplica sobre el GGUF del modelo base. La licencia es Apache 2.0. La informacion disponible no detalla la arquitectura interna ni la longitud de contexto nativa del modelo base mas alla de los 131.072 tokens usados en la evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.8-27B; adaptador LoRA sobre transformer) |
| Parametros totales | 159.383.552 (dato de safetensors del adaptador; el modelo base completo no se detalla) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 131.072 tokens (contexto usado en entrenamiento y evaluacion) |
| Tipos de cuantizacion | Q8_0 (fusionado); adaptador LoRA en F16; se menciona Q4_K_M del base como alternativa |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0 fusionado y LoRA F16); el adaptador original es PEFT |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado con aprendizaje por refuerzo (RL) sobre Qwen/Qwen3.8-27B, siempre con el modo thinking activado y dentro del harness pi. No se proporcionan detalles sobre la composicion del dataset de entrenamiento, el numero de tokens utilizados ni la variante concreta de RL empleada. El adaptador original esta en formato PEFT; la version GGUF se genero con `convert_lora_to_gguf.py` de llama.cpp en F16.

La innovacion principal es la eficiencia del razonamiento: el adaptador conserva la precision del thinking pero reduce el numero de tokens de salida, con bloques de razonamiento mas cortos. La version fusionada Q8_0 se construyo fusionando el adaptador sobre el BF16 del base (`ggml-org/Qwen3.8-27B-GGUF`, revision c186941) con `llama-export-lora` y cuantizando despues a Q8_0 con `llama-quantize`, usando llama.cpp en el commit 374d90a9fc3b3122473e0879041cff2eeb3d568f. No se mencionan tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento extendido con modo thinking activable mediante `enable_thinking`.
- Razonamiento mas eficiente: aproximadamente un 40 % menos de tokens de salida que el adaptador pi con thinking en las tareas evaluadas.
- Orientado a tareas de ingenieria de software y uso de terminal (evaluado en SWE-bench Pro y Terminal-Bench 2.1).
- Integracion con agentes a traves del harness pi y del servidor de llama.cpp.
- Soporte de tool calling y flujos multi-paso: no confirmado explicitamente en la informacion disponible, aunque el contexto de agentes lo sugiere.
- Capacidades multilingues: no disponibles.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Resolucion de incidencias de software en local: el adaptador esta entrenado y evaluado en SWE-bench Pro, por lo que encaja en flujos de parcheo de repositorios ejecutados en maquina propia con llama.cpp, reduciendo el coste de tokens frente a un thinking estandar.
- Automatizacion de tareas de terminal: con resultados en Terminal-Bench 2.1, es adecuado para agentes que ejecutan comandos y corrigen errores en entornos de shell, manteniendo sesiones largas gracias al contexto de 131.072 tokens.
- Agentes autonomos con presupuesto de tokens ajustado: al gastar cerca de un 40 % menos de tokens de salida, permite mas intentos o tareas dentro de un mismo limite de tiempo y coste en despliegues locales.
- Asistente de programacion en estaciones de trabajo sin GPU de datacenter: la version Q8_0 (28,6 GB) o el base en Q4_K_M con el adaptador LoRA permiten servir el modelo en hardware de gama alta de consumo.
- Pipelines de CI/CD con revision de codigo: el modelo puede integrarse como servidor compatible con llama.cpp y consumirse desde herramientas de analisis o generacion de parches en cada commit.
- Investigacion sobre eficiencia del razonamiento: sirve como referencia para estudiar como el RL con thinking reduce la longitud de los bloques de razonamiento sin perder precision.
- Despliegue embebido del adaptador: el LoRA F16 de 319 MB permite reutilizar una unica copia del modelo base y alternar entre comportamiento base y adaptado segun la tarea.

## Benchmarks y rendimiento

Resultados reportados por el autor (adaptador BF16 servido con vLLM bajo el harness pi, un intento por tarea, presupuesto de 100 pasos, thinking activado a esfuerzo por defecto, hasta 32k tokens de salida por llamada, temperatura 0,8):

| Benchmark | Este adaptador (think + pi) | Adaptador pi con thinking | Modelo base con thinking |
|---|---|---|---|
| SWE-bench Pro (hard 51) | 76,5 % | 74,5 % | 74,5 % |
| Terminal-Bench 2.1 | 57,1 % | 59,5 % | 60,7 % |
| Tokens de salida por tarea SWE-bench Pro (media) | 26,7k | 46,0k | no disponible |
| Tokens de salida por tarea Terminal-Bench 2.1 (mediana) | 5,8k | 9,3k | no disponible |

La reduccion de tokens es del 42 % en media en SWE-bench Pro y del 38 % en mediana en Terminal-Bench 2.1. El autor advierte que estos resultados no se han reevaluado a traves de llama.cpp ni con el base cuantizado.

## Requisitos de hardware

- VRAM estimada: la version fusionada Q8_0 ocupa unos 28,6 GB de pesos, por lo que requiere del orden de 30 GB o mas de VRAM o memoria unificada para inferencia comoda con contexto amplio.
- Alternativa con adaptador separado: modelo base Q8_0 mas el LoRA F16 (319 MB), con requisitos de memoria similares a los del base.
- Alternativa de menor huella: base en Q4_K_M mas el LoRA, con menor calidad segun advierte el autor por alejarse de los pesos BF16 de entrenamiento.
- GPU recomendadas: A100 40/80 GB, H100, o GPUs de consumo con 24-32 GB o mas de memoria (por ejemplo, RTX 4090 para Q4_K_M; configuraciones de 32 GB o memoria unificada para Q8_0).
- Despliegue: llama.cpp mediante `llama serve`; el autor indica comandos concretos con `-c 131072` y `--chat-template-kwargs '{"enable_thinking": true}'`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Pro (hard 51) | Terminal-Bench 2.1 | Licencia |
|---|---|---|---|---|---|
| Este adaptador (GGUF) | base Qwen3.8-27B + LoRA | 131.072 | 76,5 % (BF16, vLLM) | 57,1 % (BF16, vLLM) | Apache 2.0 |
| Adaptador pi con thinking | base Qwen3.8-27B + LoRA | 131.072 | 74,5 % | 59,5 % | no disponible |
| Qwen3.8-27B base con thinking | no disponible | 131.072 (en evaluacion) | 74,5 % | 60,7 % | no disponible |

No se dispone de comparaciones con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No reevaluado en GGUF: los resultados proceden de vLLM en BF16; el archivo GGUF no se ha evaluado con llama.cpp y el base cuantizado alterara los resultados.
- Thinking activado: el adaptador se entreno y evaluo con thinking on; su comportamiento con thinking off no se ha evaluado.
- Dependencia del contexto: sesiones de razonamiento largas; reducir el contexto o el limite de salida recorta sesiones y razonamiento.
- Cuantizacion del base: usar Q4_K_M en lugar de Q8_0 aleja el modelo del comportamiento aprendido.
- Idiomas soportados no documentados.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no documentado; aplican los riesgos habituales de los modelos de razonamiento en tareas de codigo.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B.
- Datos de parametros: el valor de 159.383.552 corresponde al adaptador, no al modelo base completo; no debe interpretarse como tamano del modelo servido.

## Enlaces

- Repositorio GGUF: https://huggingface.co/harness-hub/Qwen3.8-27B-think-pi-adapted-GGUF
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-think-pi-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF del base: https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Harness pi para llama.cpp: https://github.com/huggingface/pi-llama
