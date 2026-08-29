# schneewolflabs/Qwen3.5-9B-egirl-LoRA

## Resumen

Qwen3.5-9B-egirl-LoRA es un adaptador LoRA de 0.3 GB desarrollado por schneewolflabs, disenado como la pieza final del apilamiento de adaptadores que conforma el modelo Wichtelchen-Qwen3.5-9B, la contrapartida de 9B del adaptador Qwen3.6-27B-egirl-LoRA. Su proposito es ajustar un modelo base Qwen3.5-9B (un VLM denso multimodal) para optimizar dos ejes concretos: la politica de delegacion de tareas y el uso de herramientas Hemlock dentro del agente egirl.

El adaptador se entrena mediante ORPO sobre dos conjuntos de preferencias combinados (egirl-delegation-dpo y egirl-hemlock-dpo), y no sobre el modelo base listado directamente, sino sobre el apilamiento completo de adaptadores previos (Bubba y delegacion) ya fusionados en hemlang/Hemlock-Qwen3.5-9B. Esto es critico: el autor advierte explicitamente que fusionar el adaptador sobre cualquier otra base produce cambios de precision, no de comportamiento.

Su relevancia radica en que demuestra una metodologia reproducible para construir agentes conversacionales con delegacion jerarquica y uso de herramientas sobre modelos Qwen3.5, con mejoras cuantificadas en benchmarks especificos (delegacion 10/10, hembench 56.1%). El adaptador se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre Qwen3.5-9B (VLM denso) |
| Parametros totales | 0.3 GB (tamano del repo); el adaptador LoRA usa r32/alpha64 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-9B, no especificada) |
| Tipos de cuantizacion | No disponible (adaptador en bf16; el modelo fusionado admite cuantizaciones del base) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con ORPO (Odds Ratio Preference Optimization) implementado via el framework Merlina, con LoRA de rango 32 y alpha 64, tasa de aprendizaje 8e-6 con decaimiento coseno, beta 0.1, 2 epocas, precision bf16 y longitud maxima de prompt de 1536 tokens. El entrenamiento se realizo en una unica GPU RTX A6000 durante 236 pasos, con perdida final de 0.374.

La base sobre la que se entrena no es el modelo listado en el campo base_model (hemlang/Hemlock-Qwen3.5-9B) directamente, sino ese modelo con los adaptadores Bubba y delegacion ya fusionados. Esta distincion es fundamental: el adaptador aprende a corregir y refinar el comportamiento del apilamiento completo, no del modelo base limpio. El autor advierte que fusionar el adaptador sobre cualquier otra base produce resultados que se comportan como aproximaciones de precision, no como el comportamiento entrenado.

Un detalle tecnico relevante: el checkpoint del modelo base Qwen3.5 es un VLM cuyos pesos incluyen 15 tensores `mtp.*` (multi-token prediction). La funcion `peft.merge_and_unload()` los elimina silenciosamente, y las versiones actuales de llama.cpp rechazan el modelo fusionado sin ellos. La solucion documentada es restaurarlos manualmente desde el archivo `model-mtp.safetensors` del modelo base tras la fusion.

## Capacidades

- Delegacion de tareas: el adaptador mejora la politica de delegacion del agente egirl de 9/10 a 10/10 en el eje de delegacion, permitiendo al agente decidir cuando procesar una peticion directamente y cuando derivarla a otro componente o modelo.
- Uso de herramientas Hemlock: incrementa el rendimiento en hembench del 50.6% al 56.1%, lo que implica una mejora sustancial en la capacidad del modelo para invocar correctamente las herramientas del ecosistema Hemlock.
- Razonamiento conversacional: al estar entrenado sobre el apilamiento completo con los adaptadores Bubba y delegacion, hereda las capacidades de razonamiento y estilo conversacional de esos adaptadores previos.
- Capacidades del modelo base: al fusionarse sobre Qwen3.5-9B, hereda las capacidades del VLM base, incluyendo comprension visual, razonamiento, codificacion y comportamiento agente.
- Censura y seguridad: mantiene 29/29 en pruebas de censura (mejor de 5), sin degradacion en ARC ni en perplexity respecto al apilamiento previo.
- Sin modo de pensamiento explicito: no se menciona soporte para thinking mode en la informacion disponible.

## Casos de uso

- Agente conversacional con delegacion jerarquica: el caso de uso principal. El modelo puede integrarse en el framework egirl para gestionar conversaciones multi-turno donde el agente decide autonomamente si responde directamente o delega la tarea a un subagente o herramienta especializada, con una tasa de acierto en la decision de delegacion del 100% (10/10).
- Automatizacion de soporte tecnico con herramientas: gracias a la mejora en hembench, el modelo puede invocar correctamente herramientas externas (APIs, bases de conocimiento, ejecucion de comandos) en mas de la mitad de los escenarios evaluados, lo que lo hace util para construir asistentes de soporte que consultan sistemas externos.
- Desarrollo de agentes tool-use sobre Qwen3.5: el adaptador sirve como referencia y punto de partida para desarrolladores que quieran construir agentes con tool-use sobre la familia Qwen3.5, demostrando un pipeline completo de entrenamiento ORPO con LoRA.
- Investigacion en preferencia de delegacion: el dataset egirl-delegation-dpo y el eje de delegacion evaluado (0/10 a 10/10) proporcionan un caso de estudio para investigar como entrenar modelos para decidir cuando delegar, un problema poco cubierto en la literatura.
- Sistema de agente multimodal con herramientas: al fusionarse sobre el VLM Qwen3.5-9B, el adaptador permite construir agentes que combinan comprension visual con invocacion de herramientas, util para automatizacion de tareas que requieren interpretar imagenes o interfaces graficas.
- Benchmarking de adaptadores encadenados: el aviso del autor sobre la transferencia de adaptadores entre bases (precision vs. comportamiento) hace de este modelo un caso de estudio para equipos que necesiten evaluar la portabilidad de sus propios adaptadores LoRA.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan el efecto del adaptador fusionado al 1.0 sobre su base de entrenamiento (Wichtelchen):

| Metrica | Antes del adaptador (Wichtelchen) | Despues del adaptador (Wichtelchen + egirl-LoRA) |
|---|---|---|
| Eje de delegacion | 9/10 | 10/10 |
| hembench | 50.6% | 56.1% |
| Censura (best-of-5) | No disponible | 29/29 |
| ARC | Sin cambios | Sin cambios |
| Perplexity | Sin cambios | Sin cambios |

El autor indica que el adaptador de 27B (Qwen3.6-27B-egirl-LoRA) inicio esta escalera de delegacion en 0/10, lo que sugiere una progresion significativa en la familia de adaptadores. No se proporcionan benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Entrenamiento: el adaptador se entreno en una unica GPU RTX A6000 (48 GB VRAM) durante 236 pasos, lo que indica que el entrenamiento de adaptadores LoRA sobre un modelo de 9B es viable en hardware de gama alta de consumo o workstation.
- Inferencia: al ser un adaptador LoRA, no se ejecuta de forma independiente; debe fusionarse sobre el modelo base Qwen3.5-9B. La inferencia requiere la VRAM del modelo base fusionado.
- VRAM estimada para el modelo fusionado: para Qwen3.5-9B en bf16 se necesitan aproximadamente 18-20 GB de VRAM; con cuantizacion INT4 (W4A16, como se usa en Jetson Orin) se reduce a unos 6-8 GB.
- GPUs recomendadas: RTX 4090 (24 GB) para bf16 con margen; A100/H100 para despliegue multi-usuario; Jetson Orin o Thor para edge con cuantizacion.
- Opciones de despliegue: llama.cpp (con la advertencia de restaurar los tensores MTP tras la fusion), vLLM, TGI, Ollama (el modelo base Qwen3.5:9b esta disponible en Ollama).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-egirl-LoRA (este adaptador) | 9B (base) + 0.3 GB adaptador | No disponible | Agente con delegacion y tool-use | Apache 2.0 | Hugging Face |
| Qwen3.6-27B-egirl-LoRA | 27B (base) + adaptador | No disponible | Mismo enfoque, escala mayor | No disponible | Hugging Face |
| Wichtelchen-Qwen3.5-9B (apilamiento previo) | 9B (base) + adaptadores | No disponible | Agente con adaptadores Bubba + delegacion | No disponible | Hugging Face |
| Qwen3.5-9B (modelo base oficial) | 9B | No disponible | VLM multimodal generalista | No disponible | Hugging Face, Ollama |

La comparativa directa con modelos de la misma categoria (adaptadores para agentes) es limitada por la escasez de modelos publicados con este enfoque especifico de delegacion. La familia egirl (9B y 27B) es la unica referencia disponible.

## Limitaciones y advertencias

- Fusion sobre bases incorrectas: el autor advierte explicitamente que fusionar el adaptador sobre cualquier base distinta al apilamiento completo (Hemlock-Qwen3.5-9B + Bubba + delegacion) produce resultados que transfieren precision pero no comportamiento. Esto limita la portabilidad del adaptador.
- Problema con tensores MTP: tras fusionar con `peft.merge_and_unload()`, los 15 tensores `mtp.*` del checkpoint base se pierden silenciosamente, y llama.cpp rechaza el modelo resultante. Es necesario restaurarlos manualmente, un paso que puede pasar desapercibido.
- Idioma limitado: solo se declara soporte para ingles. No se garantiza un rendimiento adecuado en otros idiomas, incluido el espanol.
- Sin benchmarks generales: no se publican resultados en MMLU, HumanEval, GSM8K u otros benchmarks estandar, lo que impide evaluar el impacto del adaptador en capacidades generales de razonamiento o codificacion.
- Riesgo de alucinacion: no se proporcionan datos especificos, pero al ser un modelo de 9B ajustado para conversacion, el riesgo de alucinacion en tareas de hechos es inherente y no esta cuantificado.
- Descargas y adopcion: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- Dependencia de la cadena de adaptadores: el rendimiento declarado depende de que el usuario reproduzca exactamente el apilamiento de adaptadores previos (Bubba y delegacion), lo que anade complejidad al despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/schneewolflabs/Qwen3.5-9B-egirl-LoRA
- Modelo base: https://huggingface.co/hemlang/Hemlock-Qwen3.5-9B
- Adaptador previo Bubba: https://huggingface.co/nbeerbower/Bubba-Qwen3.5-9B-LoRA
- Adaptador de 27B: https://huggingface.co/nbeerbower/Qwen3.6-27B-egirl-LoRA
- Apilamiento completo Wichtelchen: https://huggingface.co/schneewolflabs/Wichtelchen-Qwen3.5-9B
- Framework Merlina (entrenamiento): https://github.com/Schneewolf-Labs/Merlina
- Agente egirl: https://github.com/Schneewolf-Labs/egirl
- Dataset egirl-delegation-dpo: https://huggingface.co/datasets/schneewolflabs/egirl-delegation-dpo
- Dataset egirl-hemlock-dpo: https://huggingface.co/datasets/schneewolflabs/egirl-hemlock-dpo
- Qwen3.5:9b en Ollama: https://ollama.com/library/qwen3.5:9b
- Qwen3.5 9B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-9b/
- Repositorio oficial Qwen3: https://github.com/QwenLM/Qwen3
