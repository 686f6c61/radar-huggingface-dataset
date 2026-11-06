# DRUPEs/CherryPit-1.2-2B-GGUF

## Resumen

CherryPit-1.2-2B es un modelo de lenguaje causal de aproximadamente 2.000 millones de parametros, desarrollado por DRUPEs (Dense Representation & Unified Parameter Encoding Systems) como un ajuste fino de MiniCPM5-2B. Es la tercera iteracion de la familia CherryPit, y su foco principal es la composicion de funcionalidades: la capacidad de generar aplicaciones web y pipelines de codigo que combinan dos, tres o cuatro caracteristicas en un mismo componente, manteniendo al mismo tiempo un rendimiento solido en tareas individuales de codigo, matematicas e instrucciones.

El modelo emplea una arquitectura transformer estandar de tipo Llama, con una longitud de contexto de 128K tokens (131.072) y soporte de tool calling a traves de su plantilla de chat integrada. Esta disenado explicitamente para su ejecucion en dispositivo (on-device) gracias a su reducido tamano y a la disponibilidad de cuantizaciones GGUF optimizadas para llama.cpp, Ollama y LM Studio. Su licencia Apache 2.0 facilita el uso comercial sin restricciones adicionales.

La relevancia de esta version radica en su entrenamiento por refuerzo sobre tareas generadas de composicion multi-caracteristica, con rondas de autoaprendizaje sobre respuestas propias que superaron los tests. Los resultados reportados muestran mejoras de hasta un 28% absoluto en benchmarks de composicion (WebApp1K Trio) respecto a la version anterior, sin degradacion significativa en el resto de tareas evaluadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal estandar tipo Llama |
| Parametros totales | ~2B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens (131.072) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K_L, Q6_K, Q5_K_M, Q4_K_M, Q2 (desaconsejada) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); safetensors bf16 en el repo base DRUPEs/CherryPit-1.2-2B |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estandar de Llama heredada de MiniCPM5-2B, sin modificaciones estructurales respecto a las versiones 1.0 y 1.1: misma profundidad, mismas dimensiones y misma velocidad de inferencia. Se trata de un transformer causal denso de aproximadamente 2.000 millones de parametros con una ventana de contexto de 128K tokens. El entrenamiento de la version 1.2 se centro en dos tecnicas complementarias: por un lado, aprendizaje por refuerzo sobre aplicaciones web multi-caracteristica generadas sinteticamente y pipelines de codigo de multiples pasos, evaluadas sobre combinaciones retenidas que el modelo nunca vio durante el entrenamiento; por otro, rondas de autoaprendizaje en las que el modelo se entreno con sus propias respuestas que pasaban los tests sobre funcionalidades combinadas, mezcladas con respuestas correctas de una sola caracteristica y de Python para evitar el olvido catastrofico.

Una innovacion destacable es la nueva matriz de importancia (importance matrix) utilizada para calibrar las cuantizaciones: se genero a partir de las propias trazas de razonamiento largas de CherryPit a 8K de contexto, tratando los tokens especiales del chat como tokens especiales. Ademas, se corrigio la plantilla de chat por defecto para que el modelo solo se presente como CherryPit cuando se le pregunta explicitamente por su identidad, eliminando la mencion espuria en respuestas ordinarias (del 15-21% al 0% con thinking activado). Las respuestas simples son ademas aproximadamente un 40% mas cortas.

## Capacidades

- Generacion de texto y razonamiento general en ingles.
- Generacion de codigo en Python y desarrollo web (React, HTML/CSS/JS), con especial enfasis en composicion de multiples funcionalidades en un mismo componente.
- Razonamiento matematico, incluyendo problemas de competicion (MATH-500, AIME).
- Tool calling / function calling soportado nativamente a traves de la plantilla de chat integrada.
- Modo thinking (razonamiento extendido) activable o desactivable mediante la plantilla de chat o el toggle de la interfaz; recomendado para matematicas y codigo dificil con al menos 8K tokens nuevos.
- Seguimiento de instrucciones estricto (IFEval).
- Capacidad de autoaprendizaje reflejada en el entrenamiento (no es una capacidad de inferencia, sino una tecnica de entrenamiento).
- Capacidades multilingues: limitadas al ingles segun la model card.
- No dispone de vision ni audio.

## Casos de uso

- Generacion de componentes React con multiples funcionalidades combinadas: el modelo esta especificamente entrenado para producir componentes que integran dos, tres o cuatro caracteristicas (por ejemplo, un formulario con validacion, carga inicial de datos y persistencia local) en una sola pieza de codigo, con tasas de exito muy superiores a la version anterior en este escenario.
- Asistente de codigo en el editor (on-device): gracias a su tamano de ~2B y a las cuantizaciones Q4_K_M (1,56 GB), puede ejecutarse en un portatil o incluso en un telefono moderno mediante llama.cpp u Ollama, ofreciendo autocompletado y generacion de funciones sin enviar codigo a la nube.
- Automatizacion de pipelines de codigo multi-paso: el entrenamiento en pipelines de multiples pasos lo hace adecuado para tareas encadenadas como generar un script, ejecutarlo mentalmente y corregir errores, integrable en flujos de CI/CD mediante tool calling.
- Tutoria de matematicas y resolucion de problemas: con thinking activado y 8K+ tokens de presupuesto, puede abordar problemas de nivel MATH-500 y AIME, mostrando el razonamiento paso a paso.
- Agente local con tool calling: la plantilla de chat integrada permite definir funciones y que el modelo decida cuando invocarlas, util para asistentes de escritorio que consultan APIs locales o del sistema.
- Prototipado rapido de aplicaciones web: un desarrollador puede describir una funcionalidad compuesta y obtener un esqueleto funcional en React en segundos, reduciendo el tiempo de arranque de prototipos.
- Despliegue en entornos con recursos limitados: al caber en GPUs de consumo (incluso integradas) y en CPU, es util para demos, educacion y entornos air-gapped donde no se puede usar un modelo grande en la nube.

## Benchmarks y rendimiento

Resultados reportados por el autor, comparando CherryPit-1.2 con CherryPit-1.1 sobre el mismo harness, items, prompts y semillas (pesos bf16 en vLLM):

| Benchmark | Configuracion | CherryPit-1.1 | CherryPit-1.2 | Delta |
|---|---|---:|---:|---:|
| WebApp1K-React, 1 caracteristica | sin thinking, 1.000 tareas | 81,9 | 82,7 | +0,8 |
| WebApp1K Duo, 2 caracteristicas | sin thinking, 1.000 tareas | 31,6 | 48,8 | +17,2 |
| WebApp1K Trio, 3 caracteristicas | sin thinking, 1.000 tareas | 16,8 | 44,9 | +28,1 |
| WebApp1K Quartet, 4 caracteristicas | sin thinking, 1.000 tareas | 6,6 | 28,3 | +21,7 |
| LiveCodeBench v6 | sin thinking, media de 4 | 36,6 | 38,3 | +1,7 |
| LiveCodeBench v6 | thinking, 8K | 45,7 | 47,4 | +1,7 |
| HumanEval+ | sin thinking, greedy | 82,9 | 84,1 | +1,2 |
| MBPP+ | sin thinking, greedy | 67,2 | 68,0 | +0,8 |
| MATH-500 | sin thinking, greedy | 87,8 | 90,6 | +2,8 |
| AIME 2025 + 2026 | thinking, 32K, 2 muestras | 70,0 | 67,5 | -2,5 (no significativo) |
| IFEval | strict, nivel de prompt | 87,4 | 88,7 | +1,3 |

Notas del autor: el entrenamiento web-app uso solo tareas generadas propias, nunca WebApp1K, por lo que las mejoras en Duo/Trio/Quartet son sobre un benchmark no visto. Ningun benchmark empeoro de forma significativa (tests de signos pareados por item). En AIME, el modelo 1.2 resuelve 7 problemas que 1.1 falla y falla 8 que 1.1 resuelve (p = 0,50). Aproximadamente el 11% de los ficheros de test Duo no pueden ser superados por ninguna respuesta (importan un fichero inexistente), por lo que el techo de Duo es de aproximadamente 88,5.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M (~1,56 GB), Q5_K_M (~1,81 GB), Q6_K (~2,07 GB), Q6_K_L (~2,20 GB), Q8_0 (~2,68 GB), F16 (~5,04 GB). Sumar overhead de contexto KV cache, que crece con la longitud de contexto utilizada.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para cuantizaciones Q4-Q8 (GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100, H100). Para F16 se recomienda al menos 6 GB.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna e incluso en muchas integradas con cuantizaciones Q4. Tambien puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, y vLLM para pesos bf16. El endpoint `/v1/chat/completions` de llama-server gestiona automaticamente el token de inicio de secuencia.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor indica que la velocidad es identica a las versiones 1.0 y 1.1.
- Muestreo recomendado: temperatura 1,0, top_p 0,95.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---:|---:|---|---|---|
| CherryPit-1.2-2B | ~2B | 128K | Apache 2.0 | Codigo, web, composicion multi-caracteristica | GGUF + safetensors |
| MiniCPM5-2B (base) | ~2B | no disponible | no disponible | Modelo base generalista | safetensors |
| CherryPit-1.1-2B | ~2B | 128K | Apache 2.0 | Version anterior, menos capaz en composicion | GGUF + safetensors |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta ingles oficialmente; el rendimiento en castellano u otros idiomas no esta garantizado.
- Sesgos: no se documentan sesgos especificos, pero al ser un ajuste fino sobre MiniCPM5-2B hereda los sesgos del modelo base y de los datos de entrenamiento.
- Alucinacion: como todo modelo de lenguaje, puede generar codigo o respuestas plausibles pero incorrectas; se recomienda validacion automatica (tests, linters) en produccion.
- Contexto: aunque soporta 128K tokens, el rendimiento en contextos muy largos no esta documentado en la model card; el autor recomienda 8K o mas de tokens nuevos para thinking.
- Cuantizaciones Q2: el autor desaconseja explicitamente los ficheros Q2 por perdida de calidad.
- Uso comercial: permitido bajo Apache 2.0, sin restricciones adicionales conocidas.
- Caveat de produccion: si se renderiza la plantilla de chat manualmente y se envia al endpoint `/completion`, hay que eliminar el `<s>` inicial para evitar duplicacion; el endpoint `/v1/chat/completions` lo gestiona automaticamente.
- El modelo se presenta como CherryPit solo cuando se le pregunta por su identidad; con la plantilla antigua (1.1) aplicada a este modelo, la tasa de mencion espuria es del 15-21%.
- Los benchmarks de composicion (Duo/Trio/Quartet) tienen techos teoricos limitados por ficheros de test invalidos (techo de Duo ~88,5).

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/DRUPEs/CherryPit-1.2-2B-GGUF
- Pesos completos bf16 safetensors: https://huggingface.co/DRUPEs/CherryPit-1.2-2B
- Version anterior: https://huggingface.co/DRUPEs/CherryPit-1.1-2B-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
