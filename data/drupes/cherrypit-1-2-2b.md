# DRUPEs/CherryPit-1.2-2B

## Resumen

CherryPit-1.2-2B es un modelo de lenguaje causal de aproximadamente 2.000 millones de parametros desarrollado por DRUPEs (Dense Representation & Unified Parameter Encoding Systems). Se trata del tercer lanzamiento de la familia CherryPit y se construye mediante ajuste fino sobre MiniCPM5-2B de OpenBMB. El modelo esta orientado a generacion de codigo, desarrollo web, matematicas, razonamiento y tool calling en dispositivos locales, con una ventana de contexto de 128K tokens.

La novedad principal de la version 1.2 es el entrenamiento en composicion: el modelo mejora de forma sustancial su capacidad de combinar varias funcionalidades dentro de un mismo componente de interfaz. Segun la model card, en el benchmark WebApp1K la tasa de exito en tareas de dos funcionalidades pasa de 31,6 a 48,8, en tres funcionalidades de 16,8 a 44,9 y en cuatro funcionalidades de 6,6 a 28,3, manteniendo el mismo tamano, arquitectura y velocidad que las versiones 1.0 y 1.1.

El modelo mantiene la arquitectura Llama estandar, licencia Apache 2.0 y pesos en bf16 para transformers y vLLM, con una version GGUF separada para llama.cpp, Ollama y LM Studio. Esta pensado para escenarios de inferencia en dispositivo con requisitos de hardware modestos, sin renunciar a contexto largo ni a soporte de tool calling a traves de su plantilla de chat integrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal estandar tipo Llama |
| Parametros totales | ~2B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens (131.072) |
| Tipos de cuantizacion | bf16 en el repositorio principal; GGUF disponible en repositorio separado (tipos concretos no disponibles) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers/vLLM); GGUF en DRUPEs/CherryPit-1.2-2B-GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer causal estandar de tipo Llama, con aproximadamente 2.000 millones de parametros y una ventana de contexto de 128.000 tokens. Parte del modelo base MiniCPM5-2B de OpenBMB, sobre el que DRUPEs aplica un proceso de ajuste fino orientado a codigo, desarrollo web, matematicas, razonamiento y tool calling. La plantilla de chat arranca por defecto en modo thinking, y permite desactivarlo mediante `enable_thinking=False` para respuestas cortas y directas.

El entrenamiento de la version 1.2 incorpora dos tecnicas destacadas. Por un lado, aprendizaje por refuerzo sobre aplicaciones web multi-funcionalidad generadas y pipelines de codigo de varios pasos. Por otro, rondas de autoaprendizaje en las que el modelo se entrena con sus propias respuestas que superaron los tests en funcionalidades combinadas, mezcladas con respuestas correctas de una sola funcionalidad y de Python para evitar olvido catastrofico. Segun el autor, los datos de entrenamiento web son tareas generadas internamente y nunca incluyen WebApp1K, por lo que las mejoras en Duo, Trio y Quartet se miden sobre un benchmark no visto. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de texto y razonamiento general, con modo thinking activable o desactivable desde la plantilla de chat.
- Generacion de codigo en Python y otros lenguajes, con resultados medidos en LiveCodeBench v6, HumanEval+ y MBPP+.
- Desarrollo web: generacion de componentes React con una, dos, tres o cuatro funcionalidades combinadas en un mismo componente.
- Matematicas: resolucion de problemas de competicion, con evaluacion en MATH-500 y AIME 2025/2026.
- Tool calling y function calling a traves de la plantilla de chat integrada.
- Seguimiento de instrucciones estricto, medido con IFEval en modo strict a nivel de prompt.
- Capacidad de razonamiento multi-paso en pipelines de codigo, reforzada en el entrenamiento de la version 1.2.
- Inferencia en dispositivo gracias a su tamano de ~2B parametros.
- Multilingue: no disponible; el modelo esta entrenado y probado unicamente en ingles.

## Casos de uso

- Generacion de componentes React con varias funcionalidades: el modelo puede producir un unico componente que combine, por ejemplo, un buscador y una lista que carga al abrir, con una tasa de exito del 48,8 % en tareas de dos funcionalidades y del 28,3 % en tareas de cuatro, lo que lo hace util para prototipado rapido de interfaces.
- Asistente de codigo en local: con ~2B parametros y pesos GGUF, puede desplegarse en portatiles y estaciones de trabajo sin GPU dedicada de gama alta, ofreciendo autocompletado y generacion de funciones en entornos con requisitos de privacidad.
- Automatizacion de pipelines de codigo multi-paso: su entrenamiento en pipelines de varios pasos y su soporte de tool calling permiten encadenar llamadas a herramientas dentro de flujos de CI/CD o scripts de automatizacion.
- Tutoria y resolucion de problemas matematicos: con un 90,6 % en MATH-500 en modo sin thinking, es adecuado para asistentes educativos que expliquen paso a paso problemas de nivel secundario y universitario.
- Agentes conversacionales con contexto largo: la ventana de 128K tokens permite mantener conversaciones multi-turno con documentacion extensa o historiales largos sin truncar, util en atencion al cliente tecnica.
- Evaluacion y generacion de tests: su rendimiento en HumanEval+ (84,1 %) y MBPP+ (68,0 %) lo hace util para generar casos de prueba y funciones auxiliares en proyectos de desarrollo.
- Prototipado de aplicaciones web en entornos con recursos limitados: al caber en GPUs de consumo y en CPU mediante GGUF, sirve para iterar rapidamente sobre ideas de interfaz sin depender de APIs externas.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos con pesos bf16 en vLLM sobre el mismo harness, items, prompts y semillas para ambas versiones.

| Benchmark | Configuracion | CherryPit-1.1 | CherryPit-1.2 | Delta |
|---|---|---:|---:|---:|
| WebApp1K-React, 1 funcionalidad | sin thinking, 1.000 tareas | 81,9 | 82,7 | +0,8 |
| WebApp1K Duo, 2 funcionalidades | sin thinking, 1.000 tareas | 31,6 | 48,8 | +17,2 |
| WebApp1K Trio, 3 funcionalidades | sin thinking, 1.000 tareas | 16,8 | 44,9 | +28,1 |
| WebApp1K Quartet, 4 funcionalidades | sin thinking, 1.000 tareas | 6,6 | 28,3 | +21,7 |
| LiveCodeBench v6 | sin thinking, media de 4 | 36,6 | 38,3 | +1,7 |
| LiveCodeBench v6 | thinking, 8K | 45,7 | 47,4 | +1,7 |
| HumanEval+ | sin thinking, greedy | 82,9 | 84,1 | +1,2 |
| MBPP+ | sin thinking, greedy | 67,2 | 68,0 | +0,8 |
| MATH-500 | sin thinking, greedy | 87,8 | 90,6 | +2,8 |
| AIME 2025 + 2026 | thinking, 32K, 2 muestras cada uno | 70,0 | 67,5 | -2,5 (no significativo) |
| IFEval | strict, nivel de prompt | 87,4 | 88,7 | +1,3 |

El autor indica que ninguna fila empeoro de forma significativa, tras comprobacion por item con tests de signos emparejados frente a las versiones 1.0 y 1.1. No se han publicado resultados frente a modelos de otros desarrolladores en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4-5 GB para los pesos, mas overhead de KV cache; con contexto de 128K tokens la KV cache crece de forma notable, por lo que conviene limitar `max-model-len` en funcion de la GPU.
- VRAM estimada en cuantizacion GGUF de 4 bits: alrededor de 1,5-2 GB para los pesos, segun el tipo concreto de cuantizacion (no se detallan los tipos disponibles en el repositorio GGUF).
- GPU recomendadas: A100 o H100 para servicio con contexto largo y concurrencia; RTX 4090, RTX 3090 o RTX 4080 para inferencia local en bf16 o cuantizada.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16, y en tarjetas con 4-6 GB usando GGUF cuantizado.
- Opciones de despliegue: transformers, vLLM (comando de ejemplo en la model card con `--max-model-len 32768`), llama.cpp, Ollama y LM Studio mediante el repositorio GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---:|---|---|---|---|
| CherryPit-1.2-2B | ~2B | 128K | Apache 2.0 | Ingles | Ajuste fino de MiniCPM5-2B orientado a codigo y web |
| CherryPit-1.1-2B | ~2B | 128K | Apache 2.0 | Ingles | Version anterior; peor en composicion de funcionalidades |
| MiniCPM5-2B (base) | ~2B | no disponible | no disponible | no disponible | Modelo base de OpenBMB sobre el que se ajusta CherryPit |

No se dispone de datos de benchmarks frente a modelos de otros desarrolladores en la informacion proporcionada, por lo que la comparativa se limita a las versiones de la propia familia y al modelo base.

## Limitaciones y advertencias

- Al ser un modelo de 2B parametros, puede dar respuestas incorrectas con alta confianza; es necesario verificar las salidas en aplicaciones criticas.
- La combinacion de funcionalidades mejora pero no esta resuelta: cuatro funcionalidades en un mismo componente pasan el 28 % de las veces frente al 83 % con una sola.
- El razonamiento matematico con presupuesto largo (thinking de 32K tokens) esta al nivel de la version 1.1, no mejora; en AIME 2025+2026 el resultado es ligeramente inferior y no significativo.
- Con thinking desactivado, aproximadamente 1 de cada 20 respuestas a preguntas del tipo "que modelo eres" sigue indicando el nombre del modelo base.
- Entrenado y probado unicamente en ingles; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- No se detallan sesgos conocidos en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los terminos del modelo base MiniCPM5-2B por si imponen condiciones adicionales.
- El contexto de 128K tokens incrementa el consumo de memoria KV; en produccion conviene ajustar `max-model-len` al caso de uso real.
- El modelo tiene 0 descargas y 1 like en Hugging Face en el momento de la consulta, lo que indica una adopcion practicamente nula y ausencia de validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DRUPEs/CherryPit-1.2-2B
- Version GGUF: https://huggingface.co/DRUPEs/CherryPit-1.2-2B-GGUF
- Version anterior CherryPit-1.1-2B: https://huggingface.co/DRUPEs/CherryPit-1.1-2B
- Modelo base MiniCPM5-2B: https://huggingface.co/openbmb/MiniCPM5-2B
