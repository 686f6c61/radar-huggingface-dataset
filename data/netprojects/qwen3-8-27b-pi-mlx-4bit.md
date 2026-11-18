# netprojects/Qwen3.8-27B-pi-MLX-4bit

## Resumen

Qwen3.8-27B-pi-MLX-4bit es una cuantizacion de 4 bits en formato MLX del modelo Qwen3.8-27B-pi-adapted, publicado por el usuario netprojects. Se trata de la fusion del adaptador LoRA que harness-hub entreno mediante aprendizaje por refuerzo (AsyncGRPO en TRL) para convertir a Qwen3.8-27B en el modelo subyacente del agente de programacion pi, orientado a tareas de ingenieria de software y uso de terminal. El resultado se convierte a MLX con mlx-vlm, conservando el codificador de vision y la capa de prediccion multi-token (MTP) original de Qwen.

El modelo resuelve el problema de ejecutar localmente, en Apple Silicon, un agente de codigo especializado que de otro modo requeriria infraestructura en la nube. Con 27.781.427.952 parametros totales y un repositorio de 16,3 GB, esta variante de 4 bits es la mas pequena de la familia publicada por netprojects, que tambien ofrece builds de 6, 8 y bf16, ademas del adaptador LoRA suelto. La fidelidad respecto a bf16 es la menor de la familia: conserva el 95,6% de los siguientes tokens identicos y presenta una divergencia KL de 0,0201.

Es relevante ahora porque demuestra que un ajuste por RL orientado a agentes puede transferirse a una cuantizacion agresiva manteniendo la mejora funcional reportada por el autor del adaptador: Terminal-Bench 2.1 pasa del 39,5% al 55,8% y SWE-bench Pro (hard 51) del 29,4% al 62,7% frente al modelo base, con entre un 55% y un 64% menos de llamadas a herramientas por tarea. La licencia Apache 2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion completa e hibrida Gated DeltaNet, mas capa MTP; conversion MLX con mlx-vlm |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afina, grupo 64 (capas lineales); builds alternativos de 6, 8 y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `model-mtp.safetensors` para la capa MTP |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B (revision 3756181), un transformer de 27,8 mil millones de parametros con 16 capas de atencion completa y capas hibridas Gated DeltaNet, segun la verificacion de la fusion publicada. Sobre el se aplico el adaptador de harness-hub (revision e786f84), entrenado con aprendizaje por refuerzo mediante AsyncGRPO en TRL para actuar como modelo del agente pi en tareas de ingenieria de software y terminal. La fusion afecta a 256 modulos adaptados (q, k, v y o en las 16 capas de atencion completa; gate, up y down en las 64 capas), calculados como W + 2,0 · B @ A redondeado a bf16 y verificado elemento a elemento contra un calculo independiente en float64. El adaptador no modifica el codificador de vision ni las capas Gated DeltaNet.

La conversion a MLX incluye el codificador de vision y la capa de prediccion multi-token (MTP) propia de Qwen3.8-27B, cuantizada con el mismo esquema que el resto del build. Esa capa MTP se puede usar como modelo borrador integrado para decodificacion especulativa pasando el mismo repositorio como `--draft-model` con `--draft-kind mtp`, lo que segun el autor acelera la decodificacion aproximadamente 1,8 veces sin descarga adicional. El tokenizador y la plantilla de chat son los de harness-hub sin cambios, con el mismo vocabulario y formato de llamadas a herramientas de Qwen3.8-27B.

## Capacidades

- Generacion de texto y razonamiento en el contexto de tareas de ingenieria de software.
- Generacion y correccion de codigo, con enfasis en depuracion de tests y resolucion de bugs en repositorios.
- Ejecucion de tareas de terminal y uso de herramientas en entornos de agente (entrenado con el agente pi).
- Llamadas a herramientas en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm expone como `tool_calls` de OpenAI.
- Entrada de imagen y texto (pipeline image-text-to-text), con codificador de vision incluido; util para leer capturas de terminal o pantallas.
- Capacidad de modo thinking, aunque el adaptador fue entrenado y evaluado con thinking desactivado y se recomienda mantenerlo apagado.
- Decodificacion especulativa mediante la capa MTP integrada o el drafter DSpine.
- Capacidades multilingues: no disponible.

## Casos de uso

- Depuracion automatica de tests en un repositorio: el modelo puede recibir el fallo de `tests/test_parser.py`, inspeccionar el codigo mediante llamadas a herramientas y proponer el parche, que es exactamente el escenario con el que el autor ilustra su uso con pi.
- Agente de terminal local en un Mac: servir el modelo con `mlx_lm.server` y conectarlo a pi permite ejecutar tareas de linea de comandos sin enviar codigo a la nube, gracias a los 16,3 GB del build de 4 bits.
- Resolucion de issues de ingenieria de software: el ajuste por RL sobre SWE-bench Pro (hard 51) lo hace adecuado para tareas de reparacion de bugs en repositorios reales, con menos llamadas a herramientas por tarea.
- Asistente de codigo en el IDE con contexto visual: al aceptar imagen y texto, puede analizar capturas de errores o diagramas junto al codigo y responder con el formato de chat de Qwen.
- Automatizacion de pipelines de CI con un servidor compatible con OpenAI: `mlx_lm.server` expone una API de Chat Completions que se puede integrar en scripts de revision o generacion de parches.
- Prototipado de agentes de investigacion: la licencia Apache 2.0 y la disponibilidad del adaptador LoRA suelto permiten experimentar con el ajuste sobre otras bases Qwen3.8-27B en MLX.
- Analisis de capturas de terminal: con mlx-vlm se le puede preguntar que error muestra una captura, util para soporte tecnico o triaje de incidencias.

## Benchmarks y rendimiento

Resultados publicados por el autor del adaptador, bajo el agente pi y con thinking desactivado:

| Benchmark | Modelo base | Con adaptador pi |
|---|---|---|
| Terminal-Bench 2.1 | 39,5% | 55,8% |
| SWE-bench Pro (hard 51) | 29,4% | 62,7% |

Fidelidad de la cuantizacion respecto a bf16, segun netprojects:

| Build | Tamano | Mismo siguiente token que bf16 | KL frente a bf16 |
|---|---|---|---|
| 6 bits (recomendado) | 23,1 GB | 99,0% | 0,0015 |
| 8 bits | 30,0 GB | 99,1% | 0,0004 |
| 4 bits | 16,3 GB | 95,6% | 0,0201 |
| bf16 | 55,6 GB | referencia | referencia |

Rendimiento de decodificacion medido por el autor en un MacBook Pro M5 Max de 128 GB (greedy, thinking off, 5 prompts de 256 tokens; cifras indicativas con otros servicios en ejecucion):

| Build | Normal | MTP (mlx-vlm 0.7.11) | DSpine v0.2.1 (drafter 4 bits, bloque 5) |
|---|---|---|---|
| 4 bits | 33 tok/s | 61 tok/s (x1,84) | 70 tok/s (x2,25) |
| 6 bits | 23 tok/s | 22 tok/s (x0,96) | 52 tok/s (x2,32) |
| 8 bits | 18 tok/s | 41 tok/s (x2,24) | 54 tok/s (x3,05) |

No se han publicado resultados de MMLU, HumanEval, GSM8K u otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio ocupa 16,3 GB, por lo que se necesita al menos esa cantidad libre para cargar los pesos, mas margen para el contexto y la cache KV.
- Entorno objetivo: Apple Silicon con MLX (mlx 0.32.4, mlx-lm 0.32.2 y mlx-vlm 0.7.11 en las pruebas del autor); no esta pensado para CUDA.
- Equipo de referencia del autor: MacBook Pro con M5 Max y 128 GB de memoria unificada.
- Cabe en GPU de consumo de Apple con memoria unificada suficiente; en GPUs NVIDIA no es desplegable directamente por el formato MLX.
- Despliegue: `mlx_lm.server` (API compatible con OpenAI), `mlx_lm` para texto en Python y `mlx_vlm.generate` para imagen y texto.
- Aceleracion: decodificacion especulativa con la capa MTP integrada (aproximadamente 1,8x en el build de 4 bits) o con el drafter DSpine (aproximadamente 2,25x).
- Throughput de referencia: 33 tok/s en decodificacion normal y hasta 70 tok/s con DSpine en el M5 Max de 128 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-pi-MLX-4bit | 27,8 B | no disponible | Apache 2.0 | MLX safetensors 4 bits | 16,3 GB; 95,6% de fidelidad frente a bf16 |
| netprojects/Qwen3.8-27B-pi-MLX-6bit | 27,8 B | no disponible | Apache 2.0 | MLX safetensors 6 bits | 23,1 GB; build recomendado por el autor, 99,0% de fidelidad |
| netprojects/Qwen3.8-27B-pi-MLX-8bit | 27,8 B | no disponible | Apache 2.0 | MLX safetensors 8 bits | 30,0 GB; 99,1% de fidelidad, el mas cercano a bf16 |
| netprojects/Qwen3.8-27B-pi-MLX-bf16 | 27,8 B | no disponible | Apache 2.0 | MLX safetensors bf16 | 55,6 GB; referencia sin cuantizar |
| harness-hub/Qwen3.8-27B-pi-adapted | 27,8 B | no disponible | Apache 2.0 | LoRA | 638 MB en MLX; adaptador sobre cualquier build de Qwen3.8-27B |

No se dispone de datos de benchmarks de modelos alternativos de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador fue entrenado y evaluado con thinking desactivado; activar el modo thinking puede degradar el comportamiento esperado del agente.
- La cuantizacion de 4 bits es la menos fiel de la familia: solo el 95,6% de los siguientes tokens coinciden con bf16 y la KL es de 0,0201, muy superior a la de los builds de 6 y 8 bits. Para produccion, el autor recomienda el build de 6 bits.
- La decodificacion especulativa con MTP o DSpine puede divergir ligeramente del texto de la decodificacion normal en respuestas largas cuando hay empates cercanos en la comprobacion por lotes.
- El modelo esta especializado en tareas de agente de codigo y terminal; su rendimiento en dominios generales no esta documentado en la informacion disponible.
- No se han publicado datos sobre sesgos, idiomas soportados ni tasas de alucinacion.
- Las cifras de rendimiento proceden de un unico equipo (M5 Max, 128 GB) con otros servicios en ejecucion; el propio autor las califica de indicativas.
- Requiere el ecosistema MLX y Apple Silicon; no es portable a CUDA sin reconversion.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribucion correspondiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-4bit
- Build de 6 bits recomendado: https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-8bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-bf16
- Adaptador LoRA en MLX: https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-adapter
- Adaptador original de harness-hub: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del agente pi: https://github.com/earendil-works/pi
- Drafter DSpine: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX
- Repositorio dspine-hybrid-mlx: https://github.com/internet-projects/dspine-hybrid-mlx
