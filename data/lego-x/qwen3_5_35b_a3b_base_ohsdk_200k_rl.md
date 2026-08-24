# Lego-X/qwen3_5_35b_a3b_base_ohsdk_200k_rl

## Resumen

Lego-RL-Qwen3.5-35B-A3B es un modelo de lenguaje especializado en tareas de agente de codificación, desarrollado por el equipo LegoX. Se trata de un ajuste fino del modelo base Qwen/Qwen3.5-35B-A3B mediante aprendizaje por refuerzo online (RL) con el algoritmo GSPO, ejecutado íntegramente dentro del harness OpenHands SDK sin modificar. El entrenamiento se realizó sobre 2.699 issues reales de repositorios de software, donde la recompensa la genera la propia suite de tests de cada tarea ejecutada en un sandbox aislado, sin reward model ni similitud con parches de referencia.

El modelo es una mezcla de expertos (MoE) con 35.000 millones de parámetros totales y 3.000 millones activos por token, con una ventana de contexto de 200.000 tokens. Su relevancia actual radica en que demuestra que entrenar la política dentro del mismo harness que se usará en producción mejora significativamente el rendimiento en tareas de resolución de issues reales: SWE-bench Verified pasa de 64.0 a 70.4 (+6.4 puntos) en el harness OpenHands SDK, superando incluso a la siguiente generación de modelos base. El checkpoint publicado corresponde específicamente a la ejecución con OpenHands SDK.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (gated delta networks, 256 expertos, 8 activos) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | 3.000.000.000 (3B) |
| Longitud de contexto | 200.000 tokens (entrenamiento); 262.144 tokens (soporte en vLLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (segun model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-35B-A3B, una arquitectura MoE con gated delta networks que emplea 256 expertos de los cuales 8 se activan por token, resultando en 35B parametros totales y 3B activos. Sobre esta base, LegoX aplico aprendizaje por refuerzo online con el algoritmo GSPO (sequence-level surrogate), utilizando una recompensa binaria {0,1} generada por la suite de tests propia de cada issue, ejecutada en un sandbox fresco. El entrenamiento se realizo con 2.699 tareas (dataset Lego-X/Lego-RL-2699, convertido de GAIR/OpenSWE), 3 epocas equivalentes a 126 pasos, un batch de 64 prompts × 8 respuestas (512 trials por paso), learning rate constante de 1e-6 y perdida KL. La innovacion clave es que el harness OpenHands SDK se uso sin modificar, capturando las trayectorias reales (token ids, masks, log-probs y rutas de expertos MoE) dentro de la ruta de servicio, lo que optimiza la politica para el despliegue real.

## Capacidades

- Resolucion de issues reales en repositorios de software: el modelo recibe un repositorio, un shell y herramientas de edicion de archivos, y debe producir un parche que pase los tests de la tarea.
- Razonamiento multi-paso y uso de herramientas: entrenado para ejecutar comandos, editar archivos y navegar por el codigo durante largas trayectorias (media de 83 turnos por trayectoria tras el RL).
- Tool calling: requiere el parser `qwen3_coder` en vLLM; el uso de otros parsers degrada silenciosamente el formato de las llamadas a herramientas.
- Generacion de codigo y correccion de tests: capaz de diagnosticar fallos, modificar implementaciones y verificar resultados mediante ejecucion de tests.
- Contexto largo: ventana de 200K tokens, adecuada para repositorios extensos y multiples archivos.
- Capacidad de agente autonomo: disenado para integrarse en el SDK de OpenHands y ejecutar tareas de principio a fin sin intervencion humana.

## Casos de uso

- Automatizacion de correccion de bugs en CI/CD: el modelo puede integrarse en pipelines que reciban issues de un repositorio, ejecutar el agente en un sandbox y generar un parche candidato que pase los tests, reduciendo el tiempo de triaje de incidencias.
- Asistente de desarrollo en entornos de edicion: al conectarse a un IDE o terminal via OpenHands SDK, el modelo ayuda a los desarrolladores a depurar fallos, escribir tests y refactorizar codigo, aprovechando su contexto de 200K para mantener el estado completo del proyecto.
- Resolucion de deuda tecnica en repositorios legacy: su capacidad para trabajar con multiples archivos y ejecutar comandos permite abordar issues que requieren cambios coordinados en varias partes del codigo.
- Generacion de parches para proyectos open source: mantenedores pueden usar el modelo para obtener parches preliminares de issues reportados, que luego revisan y fusionan, acelerando el ciclo de contribucion.
- Evaluacion de calidad de codigo: el modelo puede ejecutar la suite de tests de un repositorio, identificar fallos y proponer correcciones, sirviendo como herramienta de validacion en entornos de integracion continua.
- Formacion de agentes de codificacion: al ser un checkpoint entrenado con RL en un harness real, puede usarse como punto de partida para experimentos de RL o como referencia para comparar estrategias de entrenamiento de agentes.

## Benchmarks y rendimiento

Resultados en SWE-bench Verified (%), protocolo compartido: temperatura 0.7, 200 turnos, 200K contexto.

| Modelo | OpenHands SDK | Claude Code | OpenCode |
|---|---|---|---|
| Qwen3.5-35B-A3B (punto de partida) | 64.0 | 62.4 | 57.2 |
| Qwen3.6-35B-A3B (siguiente generacion) | 67.4 | 63.4 | 60.6 |
| KAT-Coder-V2.5-Dev (post-entrenado sobre Qwen3.6) | 67.0 | 66.8 | 61.2 |
| **Lego-RL-Qwen3.5-35B-A3B (este checkpoint)** | **70.4** | **68.2** | **66.6** |

La ganancia del RL sobre el punto de partida es de +6.4 (OpenHands SDK), +5.8 (Claude Code) y +9.4 (OpenCode), superior a la mejora entre generaciones de modelos base (Qwen3.5 a Qwen3.6: +3.4, +1.0 y +3.4 respectivamente). No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo completo en bfloat16 ocupa aproximadamente 72 GB (35.95B parametros × 2 bytes). Con cuantizacion a 8 bits o 4 bits podria reducirse, pero no se han publicado datos de cuantizacion.
- GPU recomendadas: para inferencia con vLLM se sugiere tensor-parallel-size 4, lo que implica al menos 4 GPUs con 24 GB cada una (p.ej. A100 40GB, H100, o RTX 4090 en configuracion multi-GPU). Con expert parallel habilitado, la memoria activa por GPU se reduce al cargar solo los expertos necesarios.
- En consumer GPU: no es viable en una sola GPU de 24 GB sin cuantizacion; con cuantizacion 4-bit podria intentarse en una RTX 4090 (24 GB), pero no hay datos oficiales.
- Opciones de despliegue: vLLM (recomendado, con flags especificos como `--enable-expert-parallel`, `--tool-call-parser qwen3_coder`), OpenHands SDK como cliente, y potencialmente otros servidores compatibles con OpenAI (SGLang, TGI) aunque no se mencionan explicitamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | SWE-bench Verified (OpenHands SDK) | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B (base) | 35B | 3B | 262K | 64.0 | Apache 2.0 |
| Qwen3.6-35B-A3B (siguiente generacion) | 35B | 3B | no disponible | 67.4 | Apache 2.0 |
| KAT-Coder-V2.5-Dev | no disponible | no disponible | no disponible | 67.0 | no disponible |
| **Lego-RL-Qwen3.5-35B-A3B (este modelo)** | 35.95B | 3B | 200K (entrenamiento) | 70.4 | Apache 2.0 |

La comparativa se centra en la tarea de resolucion de issues (SWE-bench Verified). El modelo supera a su base y a la siguiente generacion de base, asi como a un modelo post-entrenado de forma convencional, lo que evidencia el valor del entrenamiento RL en el harness de produccion.

## Limitaciones y advertencias

- Idioma: la model card declara solo ingles; aunque el modelo base Qwen3.5 es multilingue, no hay garantia de rendimiento en otros idiomas.
- Dependencia del harness: el modelo fue entrenado especificamente con OpenHands SDK y el parser `qwen3_coder`. Usarlo con otros harnesses o parsers degrada significativamente el rendimiento (se observa una caida de 70.4 a 66.6 en OpenCode).
- Requiere turnos largos: la politica aprendida usa una media de 83 turnos por trayectoria; limitar a 50-100 turnos recorta sistematicamente la segunda mitad de sus trayectorias y reduce la ganancia.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar codigo incorrecto o parches que no pasen los tests; la recompensa binaria no elimina este riesgo en inferencia.
- Contexto: aunque soporta 200K tokens, el rendimiento en contextos muy largos puede degradarse; se recomienda no exceder el limite de entrenamiento.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo esta disenado para tareas de codificacion y puede no ser adecuado para otros dominios.
- Reproducibilidad: la evaluacion requiere infraestructura especifica (Harbor, sandbox, kubeconfig) y el protocolo exacto descrito en la documentacion; variaciones en el entorno pueden alterar los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lego-X/qwen3_5_35b_a3b_base_ohsdk_200k_rl
- Paper (arXiv 2608.17393): https://arxiv.org/abs/2608.17393
- Codigo (GitHub): https://github.com/LegoX/Lego-RL
- Documentacion: https://lego-rl.pages.dev
- Coleccion de modelos: https://huggingface.co/collections/Lego-X/lego-rl
- Dataset de entrenamiento: https://huggingface.co/datasets/Lego-X/Lego-RL-2699
- Modelo base Qwen3.5-35B-A3B: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Sitio del proyecto LegoX: https://legox.net
