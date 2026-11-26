# liangzhidanta/Qwen3-8B-CC-SFT-v2

## Resumen

Qwen3-8B-CC-SFT-v2 es un checkpoint de ajuste fino supervisado (SFT) continuado sobre Qwen3-8B, desarrollado por el usuario liangzhidanta, orientado especificamente a agentes de codigo que operan bajo el mecanismo de compactacion de contexto nativo de Claude Code. El modelo parte de Qwen3-8B-CC-SFT-v1 y se entrena con supervision derivada de trayectorias reales de compactacion, destiladas de GLM-5.3, para preservar el estado de ejecucion del agente cuando la ventana de contexto se comprime.

El problema que aborda es concreto: tras un evento de compactacion, los agentes de codigo tienden a perder o corromper informacion critica como el trabajo completado frente al pendiente, los ficheros y simbolos ya modificados, el estado y resultado de los tests, y la hipotesis actual del agente. V2 se enfoca en la compresion de estado del agente y en la continuacion tras la compactacion, no en un simple aumento de datos de entrenamiento.

Con 8.190.735.360 parametros totales y pesos en safetensors (repo de 16,4 GB), se distribuye bajo licencia Apache 2.0. Su relevancia actual radica en que demuestra mejoras medibles en tareas de resolucion de issues reales con compactacion activada, pasando de un 34,98 % de Pass@1 en v1 a un 47,52 % en v2 sobre un conjunto interno de 303 tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (evaluado con contexto REAL40K) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen3-8B y se obtiene mediante SFT continuado sobre Qwen3-8B-CC-SFT-v1. El entrenamiento se realiza con el framework slime y se apoya en el dataset `liangzhidanta/claude-code-glm53-swesmith-compact-trajectories`, compuesto por trayectorias de agente derivadas de SWE-smith y destiladas de GLM-5.3 bajo compactacion nativa real de Claude Code.

La innovacion tecnica principal es el enfoque en la compresion de estado del agente. Cada segmento de supervision anadido se deriva de una frontera de compactacion nativa real, con dos tipos centrales de supervision: resumenes de compactacion (compact summary) y continuacion correcta tras la compactacion. El objetivo es que el modelo aprenda a reconstruir el estado de ejecucion (trabajo hecho y pendiente, ficheros modificados, resultados de tests, hipotesis y siguiente accion) a partir del resumen comprimido. No se documentan detalles sobre volumen total de tokens de entrenamiento, composicion exacta del dataset ni uso de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento orientado a tareas de ingenieria de software.
- Agente de codigo con soporte de tool use y function calling.
- Continuacion multi-paso tras compactacion de contexto, preservando estado de ejecucion.
- Resolucion de issues sobre repositorios reales (estilo SWE-bench/SWE-smith).
- Ejecucion de tests y uso de sus resultados para guiar la siguiente accion.
- Seguimiento de estado de modificaciones (ficheros y simbolos editados).
- Integracion con el arnes de Claude Code y su compactacion nativa.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan capacidades de vision ni audio.

## Casos de uso

- Agentes de codigo en produccion con sesiones largas: el modelo mantiene el estado del agente cuando la ventana se compacta, lo que permite sesiones de depuracion prolongadas sin perder que ficheros se modificaron ni que tests ya pasaron.
- Resolucion automatica de issues en repositorios: puede recibir un issue, explorar el codigo, aplicar cambios y ejecutar tests, usando el resultado de estos para decidir la siguiente accion.
- Pipelines de CI/CD con agentes autonomos: integrado via tool calling, puede encadenar llamadas a herramientas (lectura de ficheros, ejecucion de comandos, tests) dentro de un bucle de agente controlado.
- Migraciones y refactorizaciones multi-fichero: su capacidad de recordar el conjunto de ficheros y simbolos ya editados tras una compactacion reduce el riesgo de cambios duplicados o inconsistentes.
- Asistentes de desarrollo integrados en IDE o terminal: sirve como backend de un agente conversacional que conserva el hilo de trabajo a lo largo de tareas largas.
- Evaluacion e investigacion en agentes: util como checkpoint de referencia para estudiar el efecto de la compactacion de contexto en el rendimiento de agentes de codigo, dado que el autor publica protocolos y resultados reproducibles.
- Fine-tuning posterior especializado: al ser Apache 2.0 y de 8B, es una base asequible para ajustes adicionales en dominios concretos de ingenieria de software.

## Benchmarks y rendimiento

Evaluacion interna del autor sobre canonical303: 303 tareas derivadas de SWE-smith, con repositorios disjuntos, compactacion nativa de Claude Code activada, Pass@1 con 1 rollout por tarea. No es SWE-bench Verified.

| Modelo | Etapa de entrenamiento | Resueltas / 303 | Pass@1 |
|---|---|---:|---:|
| Qwen3-8B | Base | 10/303 | 3,30 % |
| Qwen3-8B-CC-SFT-v1 | SFT general de agente | 106/303 | 34,98 % |
| Qwen3-8B-CC-SFT-v2 | SFT continuado con compactacion | 144/303 | 47,52 % |

Configuraciones del mismo checkpoint v2:

| Configuracion | Hardware | Resueltas | Pass@1 |
|---|---|---:|---:|
| T=0,5 (seleccionado en dev set) | 4090 (TP=2) | 159/303 | 52,48 % |
| T=0,3, reproduccion independiente | A100-80G (TP=1) | 154/303 | 50,83 % |
| T=0,3, ejecucion original emparejada | 4090 (TP=2) | 144/303 | 47,52 % |

Comparacion emparejada v2 frente a v1 (mismas 303 tareas, mismo arnes en 4090): +38 tareas resueltas, +12,54 puntos porcentuales, test exacto de McNemar p = 0,0002, IC bootstrap emparejado del 95 % = [6,3; 18,8] puntos. Desglose emparejado: ambas resueltas 76, solo v2 68, solo v1 30, ninguna 129. La diferencia entre T=0,5 y T=0,3 (+15 tareas) no es estadisticamente significativa (McNemar p = 0,18). La reproduccion en A100 obtuvo +10 tareas resueltas (+3,30 pp) con pesos identicos, con IC de Wilson del 95 % = [45,22 %; 56,41 %].

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; en precision completa (bf16/fp16) el modelo de 8,19B parametros requiere aproximadamente 16,4 GB solo para pesos, mas overhead de activaciones y cache KV.
- GPU recomendadas: A100-80G (probado con TP=1) y RTX 4090 (probado con TP=2).
- Cabe en GPU de consumo: si, en RTX 4090 y previsiblemente en GPUs con 24 GB o mas en cuantizacion, aunque no se documentan configuraciones cuantizadas.
- Opciones de despliegue: transformers, text-generation-inference (tags del repo); el autor evalua con servidores compatibles con Claude Code. No se documenta soporte explicito de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Se documentan diferencias de comportamiento en tiempo de ejecucion entre stacks (TP=2 en 4090 frente a TP=1 en A100), con tasas de compactacion distintas (78,9 % frente a 81,9 % de tareas) y eventos de compactacion por tarea de 2,65 frente a 3,84.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pass@1 canonical303 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B (base) | 8,19B | no disponible | 3,30 % | Apache 2.0 | Hugging Face |
| Qwen3-8B-CC-SFT-v1 | 8,19B | no disponible | 34,98 % | Apache 2.0 | Hugging Face |
| Qwen3-8B-CC-SFT-v2 | 8,19B | no disponible | 47,52 % | Apache 2.0 | Hugging Face |
| Qwen3-8B-CC-SFT-v2-2e (sucesor) | 8,19B | no disponible | 54,79 % (T=0,4) | no disponible | Hugging Face |

No se dispone de comparaciones con modelos de otros autores en la informacion proporcionada; los unicos datos comparables son los del propio linaje del modelo.

## Limitaciones y advertencias

- Los benchmarks son internos del autor (canonical303, derivado de SWE-smith) y no corresponden a SWE-bench Verified, por lo que no son directamente comparables con resultados publicos de otros modelos.
- El rendimiento varia de forma apreciable segun hardware y stack de servicio: 47,52 % en 4090 con TP=2 frente a 50,83 % en A100 con TP=1, con diferencias en frecuencia de compactacion y en el numero de eventos por tarea.
- La mejora de T=0,5 sobre T=0,3 no es estadisticamente significativa con una sola rollout por tarea (p = 0,18); conviene tratarla con cautela.
- El modelo esta especializado en agentes de codigo bajo compactacion; su comportamiento en tareas generales de texto o conversacion no se documenta.
- Riesgo de alucinacion: no documentado explicitamente, pero inherente a un modelo de 8B ajustado por SFT; en tareas de codigo puede generar cambios o resultados de tests incorrectos.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles; el entrenamiento se centra en trayectorias de codigo, sin garantia de calidad multilingue.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantias del autor sobre idoneidad en produccion.
- Depende del arnes de Claude Code y de su mecanismo de compactacion nativa para reproducir los resultados reportados; otros arneses pueden no beneficiarse del mismo modo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liangzhidanta/Qwen3-8B-CC-SFT-v2
- Modelo base v1: https://huggingface.co/liangzhidanta/Qwen3-8B-CC-SFT-v1
- Sucesor v2-2e: https://huggingface.co/liangzhidanta/Qwen3-8B-CC-SFT-v2-2e
- Dataset de entrenamiento: https://huggingface.co/datasets/liangzhidanta/claude-code-glm53-swesmith-compact-trajectories
- README en chino: ./README.zh-CN.md (dentro del repositorio del modelo)
