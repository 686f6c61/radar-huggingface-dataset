# Infinix-io/Qwen3.8-27B-pi-adapted

## Resumen

Qwen3.8-27B-pi-adapted es un adaptador LoRA sobre el modelo base Qwen/Qwen3.8-27B, desarrollado por Infinix-io y entrenado mediante aprendizaje por refuerzo (GRPO asincrono con TRL) para funcionar como el modelo subyacente del agente de programacion pi (earendil-works/pi) en tareas de ingenieria de software y terminal. El objetivo es claro: obtener buena parte de la ganancia del razonamiento de maximo esfuerzo con una fraccion de los tokens generados, de modo que el agente resuelva tareas con menos turnos y menos coste computacional.

El adaptador mejora de forma sustancial al modelo base en los dos benchmarks de referencia bajo el arnes pi. En SWE-bench Pro (subconjunto hard 51) pasa del 39,2% al 64,7% (+25,5 puntos), y en Terminal-Bench 2.1 del 39,5% al 55,8% (+16,3 puntos). Con el modo thinking desactivado iguala practicamente al modelo base en su maximo esfuerzo de razonamiento en Terminal-Bench 2.1 (56,6% frente a 54,2%) y se queda a unos 10 puntos en SWE-bench Pro (64,7% frente a 74,5%), generando aproximadamente 4,5 veces menos tokens por tarea.

El modelo base Qwen3.8-27B es multimodal (pipeline image-text-to-text), aunque el adaptador se evalua en modo solo texto, sin servir la torre de vision. El repositorio contiene unicamente los pesos del adaptador PEFT en safetensors (0,7 GB), no los pesos completos del modelo base, que debe descargarse por separado. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.8-27B; el modelo base es multimodal image-text-to-text |
| Parametros totales | no disponible (el adaptador LoRA ocupa 0,7 GB; los parametros del modelo base no se detallan en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; existe una version GGUF publicada en harness-hub/Qwen3.8-27B-pi-adapted-GGUF |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); GGUF disponible en repositorio separado |

## Arquitectura y entrenamiento

El adaptador se entrena con aprendizaje por refuerzo sobre el modelo base Qwen3.8-27B. La libreria declarada es PEFT y las etiquetas indican el uso de TRL con GRPO y async-GRPO, es decir, optimizacion de politica con recompensas verificables en entornos de ejecucion reales. Los datasets de entrenamiento citados son harness-hub/scale800-harbor, harness-hub/harness-adapters, harness-hub/termgrade-train-harbor y ai-and/termgrade-environments, orientados a tareas de terminal e ingenieria de software dentro del arnes Harbor/OpenEnv. El checkpoint publicado corresponde al paso 160, seleccionado por su puntuacion en SWE-bench Pro y en un subconjunto de 18 tareas de Terminal-Bench 2.1 monitorizado durante el entrenamiento.

La innovacion principal no esta en la arquitectura del transformer subyacente, sino en el procedimiento de adaptacion: el modelo aprende a operar como agente (buscar, editar, ejecutar pruebas y corregir) con un presupuesto de 100 pasos, reduciendo drasticamente el numero de turnos necesarios. Segun la model card, en las tareas que ambos resuelven el adaptador necesita menos de la mitad de turnos que el modelo base. El muestreo de entrenamiento fue temperatura 0,8 con top-p 1,0, y la evaluacion usa exactamente esa misma configuracion tanto para el modelo base como para el adaptador.

## Capacidades

- Generacion de texto y razonamiento en el contexto de tareas de ingenieria de software y operaciones de terminal.
- Edicion de codigo dirigida por pruebas: localiza funciones, aplica parches, ejecuta la suite de pruebas y corrige los casos fallidos.
- Uso de herramientas (tool calling) dentro del arnes pi, con llamadas encadenadas a shell, editores y ejecutores de pruebas.
- Comportamiento agentico multi-paso con presupuesto acotado de pasos (100 pasos en la evaluacion).
- Modo thinking del chat template del modelo base, con esfuerzo de razonamiento configurable (la evaluacion usa xhigh).
- Capacidad multimodal heredada del modelo base (image-text-to-text), aunque la torre de vision no se sirve en las evaluaciones publicadas.
- Eficiencia de tokens: aproximadamente 4,5 veces menos tokens generados por tarea que el modelo base con thinking de maximo esfuerzo.

## Casos de uso

- Reparacion automatizada de bugs en repositorios reales: el adaptador resuelve tareas de SWE-bench Pro con un 64,7% de exito sin thinking, lo que lo hace adecuado para pipelines de triaje y parcheo de incidencias con validacion por pruebas.
- Agente de terminal para tareas de administracion y diagnostico: con un 55,8% en Terminal-Bench 2.1, puede ejecutar secuencias de comandos, interpretar salidas y corregir errores en entornos acotados.
- Integracion en CI/CD como agente de correccion: al necesitar menos de la mitad de turnos que el modelo base, reduce el coste por tarea y encaja en flujos con presupuesto de tiempo y tokens limitado.
- Asistente de desarrollo dentro de un IDE o CLI: su entrenamiento especifico con el arnes pi lo hace apropiado para invocarse como backend de un agente de codificacion con tool calling.
- Automatizacion de tareas de mantenimiento de dependencias y refactorizaciones guiadas por pruebas, donde el bucle editar-ejecutar-verificar es el patron dominante.
- Evaluacion y generacion de trayectorias agenticas: el autor publica un bucket de trayectorias, util para investigacion sobre RL con recompensas verificables y para destilar comportamiento agentico.
- Despliegue en hardware modesto mediante la version GGUF, para prototipos locales de agentes de terminal sin GPU de datacenter.

## Benchmarks y rendimiento

Resultados publicados en la model card, bajo el arnes pi, un intento por tarea, presupuesto de 100 pasos, thinking desactivado salvo indicacion contraria, solo texto y muestreo a temperatura 0,8 con top-p 1,0.

| Benchmark | Qwen3.8-27B | Qwen3.8-27B, thinking xhigh | Qwen3.8-27B-pi-adapted | Qwen3.8-27B-pi-adapted, thinking xhigh |
|---|---|---|---|---|
| SWE-bench Pro (hard 51) | 39,2% | 74,5% | 64,7% | 74,5% |
| Terminal-Bench 2.1 | 41,0% | 54,2% | 56,6% | 56,6% |

Resultados emparejados frente al modelo base (thinking desactivado, mismas tareas, intervalo de confianza al 95% y test de signos exacto):

| Benchmark | Tareas | Base | Adaptador (paso 160) | Diferencia (puntos) | Nuevas resueltas / perdidas |
|---|---|---|---|---|---|
| SWE-bench Pro (hard 51) | 51 | 39,2% | 64,7% | +25,5 ± 14,2 | 15 / 2 (p = 0,0023) |
| Terminal-Bench 2.1 | 86 | 39,5% | 55,8% | +16,3 ± 9,1 | 16 / 2 (p = 0,0013) |
| Terminal-Bench 2.1, 68 tareas no usadas para elegir checkpoint | 68 | 39,7% | 55,9% | +16,2 ± 10,6 | 13 / 2 (p = 0,0074) |

Nota del autor: estas cifras no son comparables con las de la model card de Qwen3.8-27B, que emplea otros arneses (Terminus, Claude Code), thinking a maximo esfuerzo, presupuestos mayores y el SWE-bench Pro completo.

## Requisitos de hardware

- El repositorio contiene solo el adaptador LoRA (0,7 GB); es necesario descargar por separado el modelo base Qwen/Qwen3.8-27B.
- VRAM para inferencia: no disponible de forma explicita en la informacion proporcionada; depende del modelo base y de la cuantizacion empleada.
- GPU recomendadas: no disponible. La model card menciona soporte para transformers, vLLM, llama.cpp y Llama.app en macOS, sin detallar modelos de GPU.
- Despliegue en consumer GPU: no confirmado en la informacion disponible; la existencia de una version GGUF en harness-hub/Qwen3.8-27B-pi-adapted-GGUF sugiere viabilidad en hardware de consumo, pero sin cifras publicadas.
- Opciones de despliegue documentadas: transformers, vLLM, llama.cpp, Llama.app (macOS) y fusion del adaptador con PEFT (seccion "Merge").
- Latencia y throughput: no disponibles; la model card solo cuantifica eficiencia en tokens generados (unas 4,5 veces menos por tarea) y turnos (menos de la mitad en tareas resueltas por ambos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Pro (hard 51) | Terminal-Bench 2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-pi-adapted | no disponible (adaptador sobre Qwen3.8-27B) | no disponible | 64,7% (sin thinking) / 74,5% (xhigh) | 56,6% (sin thinking) | apache-2.0 | Hugging Face (PEFT + GGUF) |
| Qwen3.8-27B (base) | no disponible | no disponible | 39,2% (sin thinking) / 74,5% (xhigh) | 41,0% (sin thinking) / 54,2% (xhigh) | no disponible en esta ficha | Hugging Face |
| Otros adaptadores de arnes de harness-hub | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks de terceros comparables bajo el mismo arnes en la informacion proporcionada; las unicas comparaciones publicadas son contra el modelo base.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere el modelo base Qwen/Qwen3.8-27B y su tokenizador y chat template para funcionar.
- Los resultados estan medidos exclusivamente bajo el arnes pi, con 100 pasos, solo texto y muestreo a temperatura 0,8 y top-p 1,0; el rendimiento puede degradarse con otros arneses, presupuestos o parametros de muestreo.
- La torre de vision del modelo base no se sirve en las evaluaciones; no hay evidencia publicada sobre el comportamiento multimodal del adaptador.
- El checkpoint publicado (paso 160) se selecciono usando parte de Terminal-Bench 2.1; el autor reporta resultados en las 68 tareas no usadas para la seleccion (+16,2 puntos), pero persiste el riesgo de sobreajuste al benchmark.
- Riesgo de alucinacion y de ediciones incorrectas de codigo: como todo agente, puede aplicar parches plausibles pero erroneos; se recomienda validacion por pruebas en produccion.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no disponibles; el entrenamiento se centra en tareas tecnicas en entornos de terminal, presumiblemente en ingles.
- Uso comercial: la licencia declarada es Apache 2.0, pero conviene verificar la licencia del modelo base antes de desplegar en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validacion externa practicamente inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infinix-io/Qwen3.8-27B-pi-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Version GGUF: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted-GGUF
- Agente pi: https://github.com/earendil-works/pi
- Blog de receta de entrenamiento: https://huggingface.co/blog/harness-hub/harness-adapters-at-scale
- Dataset SWE-bench Pro hard 51: https://huggingface.co/datasets/harness-hub/swebench-pro-v2-hard51-harbor
- Dataset Terminal-Bench 2.1: https://huggingface.co/datasets/harborframework/terminal-bench-2.1
