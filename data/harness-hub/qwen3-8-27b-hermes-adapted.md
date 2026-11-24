# harness-hub/Qwen3.8-27B-hermes-adapted

## Resumen

Qwen3.8-27B-hermes-adapted es un adaptador LoRA publicado por harness-hub sobre el modelo base Qwen/Qwen3.8-27B. No es un modelo entrenado desde cero, sino un ajuste fino mediante aprendizaje por refuerzo (GRPO y async-GRPO con TRL) cuyo objetivo es convertir al modelo base en el motor de razonamiento de Hermes Agent, un agente de código abierto orientado a tareas de ingeniería de software y de terminal. El repositorio ocupa 0,7 GB, lo que confirma que se distribuyen únicamente los pesos del adaptador en safetensors y no los del modelo completo.

La propuesta central del autor es la eficiencia: con el modo de razonamiento (thinking) desactivado, el adaptador iguala aproximadamente el rendimiento del modelo base con su esfuerzo de razonamiento máximo (`xhigh`), pero generando entre 3,5 y 4,4 veces menos tokens por tarea. En SWE-bench Pro (subconjunto hard 51) pasa del 29,4% al 43,1%, y en Terminal-Bench 2.1 del 44,7% al 58,8%, siempre bajo el arnés de Hermes Agent y con ventana de contexto de 131.072 tokens.

Es relevante ahora porque ejemplifica una tendencia práctica: adaptar modelos de pesos abiertos a arneses de agente concretos mediante RL, en lugar de reentrenar el modelo completo. El adaptador es compatible con vLLM, transformers y llama.cpp (hay una versión GGUF publicada), lo que facilita su despliegue en infraestructura propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen3.8-27B; el pipeline declarado es image-text-to-text |
| Parametros totales | No disponible para el adaptador (0,7 GB de pesos); el modelo base es Qwen3.8-27B |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 131.072 tokens en la evaluacion publicada |
| Tipos de cuantizacion | No disponible en la model card; existe una version GGUF publicada por el autor |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); GGUF disponible en repositorio separado |

## Arquitectura y entrenamiento

El adaptador se entrena con aprendizaje por refuerzo sobre el modelo base Qwen3.8-27B. Las etiquetas del repositorio indican el uso de TRL con GRPO y async-GRPO, y la librería declarada es PEFT con LoRA. El entrenamiento se apoya en cuatro conjuntos de datos: harness-hub/scale800-harbor, harness-hub/harness-adapters, harness-hub/termgrade-train-harbor y ai-and/termgrade-environments. El checkpoint evaluado en la model card corresponde al paso 160.

La innovación destacable no está en la arquitectura del transformer, que se hereda del modelo base, sino en el procedimiento de adaptación al arnés: el modelo se optimiza contra las tareas y las herramientas concretas de Hermes Agent (ejecución de código, terminal, lectura de ficheros), de modo que aprende a resolverlas con menos turnos y menos tokens. El autor anuncia que publicará la receta completa en el blog de lanzamiento para que terceros puedan construir sus propios adaptadores de arnés.

## Capacidades

- Generación de texto y razonamiento orientado a tareas de ingeniería de software.
- Resolución de incidencias reales sobre repositorios: localización de ficheros, edición de código y validación de parches.
- Operación de terminal: ejecución de comandos, inspección de salida y corrección de errores en cadena.
- Uso de herramientas (tool calling) bajo el esquema de Hermes Agent: `execute_code`, `terminal`, `read_file`, entre otras.
- Razonamiento multi-paso y comportamiento agéntico con presupuesto acotado de pasos (100 pasos en la evaluación).
- Modo thinking opcional con esfuerzo de razonamiento configurable; el autor recomienda mantenerlo desactivado.
- Capacidad multimodal declarada por el pipeline (image-text-to-text), aunque en la evaluación la torre de visión no se sirve y las pruebas son solo de texto.

## Casos de uso

- Reparación automática de bugs en producción: el adaptador puede recibir una incidencia, explorar el repositorio con las herramientas del agente, aplicar un parche y verificar los tests, con un consumo de tokens reducido que abarata cada ejecución en CI.
- Automatización de tareas de terminal y DevOps: ejecución de scripts de despliegue, diagnóstico de fallos en logs y corrección iterativa de comandos dentro de un presupuesto de pasos controlado.
- Agente de código integrado en el IDE o en un bot interno: al necesitar menos turnos que el modelo base (22 frente a 59 en SWE-bench Pro), reduce la latencia percibida y el coste por consulta.
- Migraciones y refactorizaciones guiadas: tareas con criterios de aceptación verificables donde el modelo puede comprobar sus propios escenarios antes de dar por cerrada la tarea.
- Evaluación de arneses y pipelines de agentes: sirve como referencia para comparar configuraciones de herramientas, presupuestos de pasos y ventanas de contexto bajo condiciones idénticas.
- Despliegue en infraestructura propia con llama.cpp u Ollama mediante la versión GGUF, para equipos que no quieren enviar código a APIs externas.
- Generación de trayectorias de agente para investigación: el autor publica un bucket de trayectorias que puede usarse para estudiar estrategias de resolución de tareas.

## Benchmarks y rendimiento

Resultados publicados por el autor bajo Hermes Agent, un intento por tarea, presupuesto de 100 pasos, contexto de 131.072 tokens y muestreo con temperatura 0,8 y top-p 1,0. Las cifras no son comparables con las de la model card de Qwen3.8-27B, que emplea otros arneses y presupuestos.

| Benchmark | Qwen3.8-27B | Qwen3.8-27B, thinking | Hermes-adapted | Hermes-adapted, thinking |
|---|---|---|---|---|
| SWE-bench Pro (hard 51) | 29,4% | 45,1% | 43,1% | 51,0% |
| Terminal-Bench 2.1 | 44,7% | 58,8% | 58,8% | 57,6% |

| Benchmark | Tareas | Base | Adaptador (paso 160) | Diferencia | Nuevas / perdidas |
|---|---|---|---|---|---|
| SWE-bench Pro (hard 51) | 51 | 29,4% | 43,1% | +13,7 ± 13,3 | 10 / 3 (p = 0,092) |
| Terminal-Bench 2.1 | 85 | 44,7% | 58,8% | +14,1 ± 11,4 | 19 / 7 (p = 0,029) |

En las tareas que ambos modelos resuelven, el adaptador necesita menos de un 40% de los turnos del modelo base: 22 frente a 59 en SWE-bench Pro y 8 frente a 21 en Terminal-Bench 2.1, con aproximadamente la mitad de tokens generados.

## Requisitos de hardware

- El adaptador en sí ocupa 0,7 GB, pero la inferencia requiere cargar el modelo base Qwen3.8-27B completo más el adaptador.
- VRAM estimada: no disponible de forma explícita en la model card. Como referencia orientativa para un modelo de 27B, la carga en bf16 exige del orden de 54 GB de pesos, y las cuantizaciones de 8 y 4 bits reducen esa cifra aproximadamente a la mitad y a un cuarto respectivamente; estas estimaciones no las publica el autor.
- GPU recomendadas: no disponibles en la información proporcionada. Para bf16 se necesitan aceleradores con memoria de clase A100/H100; las cuantizaciones GGUF permiten despliegue en GPU de consumo, aunque el fabricante no detalla modelos concretos.
- Opciones de despliegue documentadas por el autor: vLLM, transformers y llama.cpp, además de la versión GGUF publicada.
- Latencia y throughput: no disponibles. El autor solo reporta el ahorro relativo de tokens (3,5 a 4,4 veces menos por tarea con thinking desactivado).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Pro (hard 51) | Terminal-Bench 2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 131.072 en la eval | 29,4% | 44,7% | No disponible en la informacion | Hugging Face |
| Qwen3.8-27B, thinking xhigh | 27B | 131.072 en la eval | 45,1% | 58,8% | No disponible en la informacion | Hugging Face |
| Qwen3.8-27B-hermes-adapted | 27B + LoRA | 131.072 en la eval | 43,1% | 58,8% | Apache 2.0 | Hugging Face (adaptador y GGUF) |

No se dispone de datos de otros adaptadores de arnés comparables en la información proporcionada.

## Limitaciones y advertencias

- Todas las métricas proceden de un único arnés (Hermes Agent) con un intento por tarea; el propio autor advierte que no son comparables con las cifras de la model card del modelo base.
- La mejora en SWE-bench Pro no alcanza significación estadística con el umbral habitual (p = 0,092); solo Terminal-Bench 2.1 la alcanza (p = 0,029).
- Con thinking activado, muchas sesiones bajo Hermes Agent agotaron la ventana de contexto, lo que limita los resultados en ese modo.
- El adaptador está especializado en tareas de ingeniería de software y terminal; su comportamiento en dominios generales no se documenta y podría degradarse respecto al modelo base.
- La torre de visión no se sirve en la evaluación, por lo que las capacidades multimodales declaradas por el pipeline no están validadas.
- No se documentan sesgos conocidos, tasas de alucinación ni idiomas soportados.
- Aunque la licencia del adaptador es Apache 2.0, el uso comercial depende también de la licencia del modelo base Qwen3.8-27B, que no se detalla en la información disponible.
- El checkpoint evaluado es el paso 160; no se especifica si es el final del entrenamiento ni si hay variabilidad entre checkpoints.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted
- Versión GGUF: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de la receta de entrenamiento: https://huggingface.co/blog/harness-adapters-at-scale
- Repositorio de Hermes Agent: https://github.com/NousResearch/hermes-agent
- Dataset SWE-bench Pro hard 51: https://huggingface.co/datasets/harness-hub/swebench-pro-v2-hard51-harbor
- Dataset Terminal-Bench 2.1: https://huggingface.co/datasets/harborframework/terminal-bench-2.1
