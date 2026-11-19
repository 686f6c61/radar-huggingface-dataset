# harness-hub/Qwen3.8-27B-hermes-adapted-GGUF

## Resumen

Qwen3.8-27B-hermes-adapted-GGUF es la conversion al formato GGUF del adaptador LoRA `harness-hub/Qwen3.8-27B-hermes-adapted`, desarrollado por harness-hub sobre el modelo base `Qwen/Qwen3.8-27B`. El adaptador se entreno mediante aprendizaje por refuerzo dentro del entorno Hermes Agent, con el objetivo de mejorar el comportamiento del modelo en tareas de agente: resolucion de bugs en repositorios reales, ejecucion de comandos en terminal y razonamiento multi-paso con uso de herramientas. El resultado es un adaptador de aproximadamente 319 MB en F16 que se aplica sobre los pesos del modelo base.

La relevancia de esta publicacion reside en su enfoque practico: no se trata de un modelo nuevo, sino de un ajuste fino orientado a reducir el numero de turnos y de tokens generados necesarios para completar una tarea de agente. Segun la model card, el adaptador mejora SWE-bench Pro (hard 51) del 29,4% al 43,1% y Terminal-Bench 2.1 del 44,7% al 58,8%, con menos del 40% de los turnos del modelo base en las tareas que ambos resuelven. Ademas, con el modo thinking desactivado, iguala la precision del modelo base con thinking en su nivel maximo (`xhigh`) generando entre 3,5 y 4,4 veces menos tokens.

El repositorio contiene unicamente el adaptador en GGUF (`Qwen3.8-27B-hermes-lora-F16.gguf`), no los pesos completos del modelo. Para utilizarlo es necesario descargar por separado el modelo base en GGUF (por ejemplo `ggml-org/Qwen3.8-27B-GGUF`) y cargar el adaptador con `llama.cpp`. El dato de parametros totales que reporta Hugging Face (159.383.552) corresponde al adaptador LoRA, no al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Qwen3.8-27B; inferencia via llama.cpp |
| Parametros totales | 159.383.552 (adaptador LoRA; el modelo base Qwen3.8-27B no reporta cifra en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens en evaluacion; Hermes Agent requiere un minimo de 64.000 tokens de contexto |
| Tipos de cuantizacion | Adaptador en F16; modelo base recomendado en Q8_0 (por defecto) o Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (adaptador LoRA en F16, ~319 MB) |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado sobre los pesos BF16 de Qwen3.8-27B, no un modelo completo. El entrenamiento se realizo con aprendizaje por refuerzo dentro de Hermes Agent, el entorno de agente de Nous Research, y esta orientado especificamente a tareas de ingenieria de software y operacion de terminal. La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni hiperparametros como el rango del LoRA o la tasa de aprendizaje.

La innovacion principal no esta en la arquitectura del transformer subyacente, sino en el regimen de entrenamiento y evaluacion: el adaptador se entreno con el modo thinking desactivado, y la evaluacion se realizo bajo el arnés de Hermes Agent con un presupuesto de 100 pasos, una ventana de contexto de 131.072 tokens, temperatura 0,8 y un unico intento por tarea. La conversion a GGUF se hizo con `convert_lora_to_gguf.py` de llama.cpp en F16, a partir del adaptador PEFT original.

## Capacidades

- Generacion de texto y razonamiento multi-paso orientado a tareas de agente.
- Resolucion de bugs en repositorios reales (evaluado en SWE-bench Pro hard 51).
- Ejecucion y depuracion de comandos en terminal (evaluado en Terminal-Bench 2.1).
- Uso de herramientas y function calling a traves del arnés Hermes Agent.
- Operacion con contexto largo: la evaluacion uso una ventana de 131.072 tokens y el agente requiere al menos 64.000.
- Eficiencia en el uso de tokens: con thinking desactivado iguala la precision del modelo base con thinking `xhigh` generando 3,5-4,4 veces menos tokens.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Resolucion automatica de issues en repositorios: el adaptador puede recibir un fallo de tests y un arbol de codigo, ejecutar comandos, inspeccionar ficheros y proponer un parche. La mejora de 13,7 puntos en SWE-bench Pro hard 51 lo hace adecuado para pipelines de triaje de bugs.
- Automatizacion de tareas de terminal: con Terminal-Bench 2.1 en 58,8%, es util para agentes que deben encadenar comandos de shell, interpretar salidas y corregir errores en entornos de CI/CD o servidores.
- Asistente de desarrollo en local: al ejecutarse con llama.cpp sobre un modelo base cuantizado, permite desplegar un agente de codigo en hardware propio sin depender de APIs externas.
- Agente de mantenimiento de codigo: la reduccion a menos del 40% de turnos del modelo base en tareas compartidas disminuye el coste por tarea en entornos con facturacion por token o con limites de cuota.
- Integracion en Hermes Agent: el flujo documentado (`llama serve` con `--lora` y `hermes chat`) permite usarlo como backend de un agente conversacional con acceso a herramientas.
- Evaluacion de estrategias de razonamiento: sirve como caso de estudio de como un LoRA entrenado sin thinking puede igualar el rendimiento de un modelo con thinking a maxima potencia, util para investigacion sobre eficiencia en agentes.

## Benchmarks y rendimiento

Los datos proceden de la model card y corresponden al adaptador BF16 servido con vLLM bajo Hermes Agent (un intento por tarea, presupuesto de 100 pasos, contexto de 131.072 tokens, thinking off, temperatura 0,8). No se ha reevaluado el fichero GGUF a traves de llama.cpp.

| Benchmark | Modelo base | Adaptador hermes | Delta |
|---|---|---|---|
| SWE-bench Pro (hard 51) | 29,4% | 43,1% | +13,7 puntos (10 tareas nuevas resueltas, 3 perdidas) |
| Terminal-Bench 2.1 | 44,7% | 58,8% | +14,1 puntos (19 nuevas resueltas, 7 perdidas; p = 0,029) |
| Turnos por tarea (tareas resueltas por ambos) | referencia | <40% del base | reduccion |
| Tokens generados por tarea | referencia | ~2x menos | reduccion |
| Tokens con thinking off vs. base con thinking xhigh | base xhigh | misma precision | 3,5-4,4x menos tokens |

## Requisitos de hardware

- El adaptador ocupa aproximadamente 319 MB en F16; el requisito real de VRAM lo determina el modelo base Qwen3.8-27B cuantizado.
- Con Q8_0 el modelo base requiere del orden de 27-30 GB de VRAM o memoria unificada; con Q4_K_M baja aproximadamente a 15-17 GB. Estas cifras son estimaciones a partir del tamano del modelo y no aparecen en la informacion proporcionada.
- GPU recomendadas: A100 40/80 GB, H100, o GPUs consumer con 24 GB o mas (RTX 3090, RTX 4090) usando Q4_K_M; para Q8_0 se recomienda 32 GB o mas.
- Despliegue: llama.cpp (`llama serve -m ... --lora ...`), con `--chat-template-kwargs '{"enable_thinking": false}'` y al menos 64.000 tokens de contexto. Tambien puede servirse con vLLM usando el adaptador PEFT original.
- Throughput y latencia: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-hermes-adapted (este) | Adaptador LoRA sobre 27B | 131.072 en evaluacion | Agente de codigo y terminal via RL | Apache 2.0 | GGUF del adaptador en HF |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | Modelo generalista | no disponible | HF |
| Otros adaptadores de agente sobre Qwen | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros comparables en la informacion proporcionada; la comparativa se limita al modelo base frente al adaptador.

## Limitaciones y advertencias

- El fichero GGUF no se ha reevaluado con llama.cpp; las puntuaciones proceden de vLLM en BF16 y una base cuantizada alterara los resultados.
- El adaptador se entreno sin thinking; con thinking activado no es significativamente mas preciso y genera aproximadamente 3 veces mas tokens.
- Requiere cargar el modelo base por separado; el repositorio solo contiene el adaptador LoRA.
- La evaluacion uso un unico intento por tarea y un presupuesto de 100 pasos, por lo que los resultados pueden no generalizar a otros arneses o configuraciones.
- Con thinking activado, muchas sesiones agotaron la ventana de 131.072 tokens; la comparacion no se sostiene necesariamente con ventanas mayores o compactacion.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada.
- Idiomas soportados: no disponibles; conviene validar el comportamiento en castellano antes de usarlo en produccion.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.8-27B, que no se detalla en la informacion disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted-GGUF
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF del modelo base: https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Hermes Agent: https://github.com/NousResearch/hermes-agent
