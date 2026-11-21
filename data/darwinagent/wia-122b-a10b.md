# darwinagent/WIA-122B-A10B

## Resumen
WIA-122B-A10B es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por darwinagent dentro del proyecto World Intelligence Agent (WIA). No es un asistente conversacional general, sino un "world model" orientado a predecir observaciones condicionadas por acciones en entornos digitales: Android, MCP, sistemas operativos de escritorio, busqueda web, ingenieria de software (SWE), terminal y web. Con 125.914.628.848 parametros totales y aproximadamente 10B activos, se inicializa directamente desde Qwen3.5-122B-A10B y se entrena exclusivamente con reinforcement learning (RL), sin pasar por las fases de continued pre-training (CPT) ni de supervised fine-tuning (SFT) del resto de la familia WIA-WM.

La relevancia del modelo reside en su enfoque: en lugar de optimizar para conversacion, se optimiza para modelar la dinamica de entornos digitales, lo que lo hace util para evaluacion de agentes y research en world models. Su licencia Apache 2.0 y su compatibilidad con transformers facilitan su uso en pipelines de investigacion, aunque su tamano (repo de 255,2 GB) y su naturaleza especializada lo alejan del uso generalista.

La ficha se basa exclusivamente en la informacion disponible en Hugging Face y en la model card del autor; los datos no presentes se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) basada en Qwen3.5; tag `qwen3_5_moe` |
| Parametros totales | 125.914.628.848 (~122B) |
| Parametros activos | ~10B (segun denominacion A10B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun model card); resto no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo emplea una arquitectura transformer con mezcla de expertos (MoE), heredada de Qwen3.5-122B-A10B, con aproximadamente 122B parametros totales y unos 10B activos por token. La model card lo describe como una variante "RL-only": se inicializa directamente desde Qwen3.5-122B-A10B y no utiliza ni WIA-CPT ni el SFT de world model que si emplean otras escalas de la familia WIA-WM.

El entrenamiento por reinforcement learning utiliza un conjunto RL-v1 filtrado y rebalanceado, rollouts en modo "think" y una recompensa compuesta que combina la puntuacion de un juez LLM (peso 0,9) con similitud semantica (peso 0,1). No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades
- Prediccion de observaciones condicionadas por acciones en siete dominios: Android, MCP, OS de escritorio, Search, SWE, Terminal y Web.
- Modelado de world model para evaluacion de agentes digitales y research.
- Generacion de texto y razonamiento en modo "think" (rollouts con thinking mode durante el RL).
- Capacidades multimodales de entrada: el tag `image-text-to-text` sugiere soporte de entrada imagen-texto, aunque no se detalla en la model card.
- Soporte de tool calling / function calling: no disponible explicitamente en la informacion proporcionada.
- Soporte de agentes multi-paso: orientado por diseno a entornos de agentes, aunque sin detalle de API.
- Capacidades multilingues: limitadas a ingles segun la model card.
- No esta disenado como asistente conversacional general.

## Casos de uso
- Evaluacion de agentes digitales: el modelo predice la observacion resultante de una accion en Android, OS, Terminal o Web, lo que permite construir simuladores de entorno para medir politicas de agentes sin ejecutar acciones reales.
- Research en world models: sirve como referencia RL-only para estudiar el efecto de prescindir de CPT y SFT en la calidad del modelado de dinamica de entornos.
- Simulacion de interacciones con APIs MCP: permite anticipar respuestas de servidores MCP ante llamadas de un agente, util para pruebas de integracion.
- Generacion de trayectorias sinteticas para SWE: predice estados intermedios de un repositorio tras comandos de terminal o ediciones, apoyando la generacion de datos de entrenamiento para agentes de codigo.
- Benchmarking comparativo: con sus resultados en WIA-Bench OOD e ID, sirve para comparar familias de modelos en tareas de prediccion de observaciones.
- Analisis de busqueda web: modela la evolucion de resultados y paginas tras consultas, util para estudiar estrategias de navegacion de agentes.
- Validacion de pipelines de agentes en CI: al predecir observaciones, permite detectar divergencias entre el comportamiento esperado y el real antes de desplegar un agente.

## Benchmarks y rendimiento
Resultados de WIA-Bench segun la model card (escala 0-100, juez DeepSeek-V4-Pro; Avg ponderado por muestra, MAvg media macro sobre siete dominios).

WIA-Bench OOD:

| Modelo | Android | MCP | OS | Search | SWE | Terminal | Web | Avg | MAvg |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| WIA-122B-A10B | 50,59 | 40,00 | 64,71 | 58,18 | 60,46 | 64,62 | 53,59 | 57,35 | 56,02 |
| WIA-WM-35B-A3B | 48,76 | 43,72 | 63,86 | 51,33 | 59,19 | 62,52 | 54,95 | 55,72 | 54,90 |
| WIA-WM-27B | 50,51 | 52,53 | 63,42 | 46,36 | 59,92 | 60,73 | 54,52 | 55,45 | 55,43 |
| Qwen3.5-122B-A10B* | 43,92 | 32,43 | 41,86 | 34,93 | 48,65 | 55,70 | 44,15 | 44,07 | 43,09 |
| GPT-5.6-sol | 49,39 | 45,75 | 59,70 | 39,99 | 58,61 | 63,63 | 55,00 | 53,58 | 53,15 |
| Claude-Opus-4.8 | 48,98 | 53,97 | 63,02 | 39,10 | 58,15 | 57,93 | 55,26 | 53,40 | 53,77 |

WIA-Bench ID:

| Modelo | Android | MCP | OS | Search | SWE | Terminal | Web | Avg | MAvg |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| WIA-122B-A10B | 41,44 | 64,33 | 33,01 | 86,66 | 57,74 | 71,43 | 66,21 | 61,16 | 60,12 |
| WIA-WM-35B-A3B | 43,49 | 67,45 | 34,39 | 89,30 | 64,18 | 76,36 | 71,86 | 65,04 | 63,86 |
| WIA-WM-27B | 43,21 | 67,74 | 35,28 | 88,54 | 66,24 | 80,85 | 73,84 | 66,41 | 65,10 |
| Qwen3.5-122B-A10B* | no disponible en la tabla ID | | | | | | | | |
| Claude-Opus-4.8 | 41,59 | 59,08 | 33,00 | 63,50 | 56,46 | 65,91 | 66,21 | 55,76 | 55,11 |
| GPT-5.6-sol | 43,62 | 61,02 | 33,08 | 50,66 | 53,11 | 59,96 | 62,38 | 52,04 | 51,98 |

## Requisitos de hardware
- VRAM estimada para inferencia: con 125,9B parametros totales y ~10B activos, en BF16 el peso completo ronda los 250 GB; en cuantizacion de 8 bits ~126 GB; en 4 bits ~63 GB. Estas cifras son estimaciones por tamano, no datos publicados por el autor.
- GPU recomendadas: para BF16 se requieren multiples aceleradores (varios H100 80 GB o A100 80 GB); para 4 bits podria caber en una configuracion de 2x RTX 4090 (48 GB) o una H100 80 GB, segun la implementacion.
- Cabe en consumer GPU: solo con cuantizacion agresiva y reparto entre varias GPU; no en una unica GPU de consumo de forma holgada.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | WIA-Bench OOD Avg | WIA-Bench ID Avg |
|---|---|---|---|---|---|---|
| WIA-122B-A10B | ~122B | ~10B | no disponible | Apache 2.0 | 57,35 | 61,16 |
| WIA-WM-27B | 27B | denso | no disponible | no disponible | 55,45 | 66,41 |
| WIA-WM-35B-A3B | 35B | ~3B | no disponible | no disponible | 55,72 | 65,04 |
| Qwen3.5-122B-A10B | ~122B | ~10B | no disponible | no disponible | 44,07 | no disponible |

## Limitaciones y advertencias
- No es un asistente conversacional general: la model card lo restringe a evaluacion de world models e investigacion.
- Rendimiento inferior a otras escalas WIA-WM en WIA-Bench ID (61,16 frente a 66,41 del 27B y 65,04 del 35B-A3B), pese a su mayor tamano.
- El dominio MCP en OOD es debil (40,00), por debajo de casi todos los modelos comparados.
- Idiomas: solo ingles declarado; no se garantiza calidad en castellano.
- Riesgo de alucinacion en la prediccion de observaciones no evaluado en la informacion disponible.
- Sesgos conocidos: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza especializada del modelo limita su aplicabilidad fuera de world modeling.
- Longitud de contexto no documentada, lo que dificulta planificar despliegues con trayectorias largas.
- Repo de 255,2 GB: requiere almacenamiento y ancho de banda considerables.

## Enlaces
- Hugging Face: https://huggingface.co/darwinagent/WIA-122B-A10B
- Paper, blog, repositorio o demo: no disponibles en la informacion proporcionada.
