# RSIGame/RSIGame-Qwen3.8-27B-S3

## Resumen

RSIGame-Qwen3.8-27B-S3 es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.8-27B, desarrollado por RSIGame. No es un modelo completo, sino un ajuste fino orientado a una tarea muy concreta: la generacion automatica de proyectos de videojuego 2D completos y ejecutables (proyectos Godot 4 o proyectos web Phaser) a partir de un brief escrito, actuando como un agente de codigo con uso de herramientas en lugar de como un asistente conversacional.

El checkpoint S3 es la tercera y ultima etapa de un pipeline de entrenamiento propio denominado RSIGame, que combina trayectorias de generacion, planes a nivel de fichero y rondas de reparacion verificadas. Los tres checkpoints anteriores del pipeline (s1baseline, s1split y s2) no se han publicado. El adaptador se entreno con QLoRA sobre el modelo base cuantizado a 4 bits, con rango 16, alpha 32 y dropout 0.05, aplicado a todas las capas lineales.

El modelo hereda del base Qwen3.8-27B una ventana de contexto de 262.000 tokens y un encoder de vision, aunque el adaptador en si esta especializado en generacion de codigo de videojuegos. Su relevancia actual radica en que aborda un caso de uso poco cubierto por los asistentes de codigo genericos: la produccion de proyectos de juego estructurados en multiples ficheros, con planificacion y reparacion iterativa, en lugar de fragmentos de codigo aislados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen3.8-27B |
| Parametros totales | no disponible (adaptador de 0,5 GB; base de 28B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | Base entrenada con QLoRA 4 bits; pesos del adaptador en safetensors |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.8-27B, un transformer de 28.000 millones de parametros con encoder de vision y 262.000 tokens de contexto. El entrenamiento empleo LoRA sobre el modelo base cuantizado a 4 bits (QLoRA), con rango 16, alpha 32, dropout 0.05 y aplicacion a todos los modulos lineales. Se uso una tasa de aprendizaje de 5e-5 con schedule coseno y un 3 por ciento de warmup, durante una sola epoca y con una longitud maxima de secuencia de 57.344 tokens en precision bfloat16.

La innovacion principal no esta en la arquitectura del adaptador, sino en el pipeline de datos: el checkpoint S3 se entreno sobre trayectorias de generacion de juegos, planes a nivel de fichero y rondas de reparacion verificadas, generadas por el propio bucle de desarrollo de RSIGame. La funcion de perdida se aplica solo a la ultima ronda (last-round only, con enmascaramiento estilo `--loss_scale last_round`), lo que concentra el aprendizaje en el resultado final corregido en lugar de en los intentos intermedios. El fichero `args.json` del repositorio contiene la configuracion completa de entrenamiento con las rutas locales eliminadas.

## Capacidades

- Generacion de proyectos de videojuego 2D completos y ejecutables a partir de un brief escrito, en formato Godot 4 o Phaser.
- Generacion de codigo como agente con uso de herramientas (tool-using coding agent), no como completion unico.
- Planificacion a nivel de fichero dentro de un proyecto de software.
- Reparacion de codigo verificado en rondas iterativas (capacidad aprendida del pipeline S3).
- Razonamiento multi-paso orientado a la construccion incremental de proyectos.
- Capacidades heredadas del modelo base Qwen3.8-27B, incluyendo procesamiento de imagen a texto (Image-Text-to-Text) y ventana de contexto de 262.000 tokens.
- Capacidades multilingues: no disponible.

## Casos de uso

- Generacion de prototipos de juego 2D: a partir de un brief en lenguaje natural, el modelo produce la estructura completa de un proyecto Godot 4 o Phaser listo para abrir y ejecutar, adecuado para validar ideas de juego en horas en lugar de dias.
- Integracion en pipelines de game jams: equipos pequenos pueden usar el adaptador para generar la base jugable de un juego y centrar su tiempo en pulido y diseno, aprovechando la planificacion a nivel de fichero.
- Automatizacion de tareas de reparacion de codigo en proyectos Godot o Phaser existentes: el modelo puede recibir errores de compilacion o ejecucion y proponer parches verificados, gracias a su entrenamiento en rondas de reparacion.
- Asistencia a estudios independientes con recursos limitados: el adaptador permite generar esqueletos de proyecto coherentes y estructurados, reduciendo el trabajo boilerplate de configuracion de escenas, scripts y assets.
- Generacion de contenido educativo: produccion de ejemplos de proyectos de juego completos y funcionales para cursos de desarrollo con Godot o Phaser, con estructura de ficheros realista.
- Investigacion en agentes de codigo: el adaptador sirve como punto de partida para estudiar como un modelo especializado planifica, genera y repara proyectos multi-fichero, con contexto de hasta 262.000 tokens.
- Despliegue en pipelines de CI/CD para validacion de proyectos de juego: el modelo puede generar variantes de un proyecto y comprobar su ejecutabilidad, integrándose como paso automatizado de generacion y verificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparativas con otros modelos.

## Requisitos de hardware

- El adaptador ocupa 0,5 GB en disco, pero requiere cargar el modelo base Qwen3.8-27B (28.000 millones de parametros) para funcionar.
- VRAM estimada para inferencia en bfloat16: aproximadamente 56 GB solo para los pesos del base, mas overhead de activaciones y cache KV.
- VRAM estimada con cuantizacion a 4 bits: aproximadamente 16-18 GB para los pesos, mas cache KV.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para precision completa; RTX 4090 (24 GB) es viable con cuantizacion a 4 bits.
- En consumer GPU: cabe en RTX 4090 y GPUs con 24 GB o mas usando cuantizacion a 4 bits; en GPUs de 16 GB probablemente no sin offloading.
- Opciones de despliegue: vLLM (usado en los runs del paper con tensor-parallel 4, contexto 262k, prefix caching activado y max_tokens=32000 por llamada), SGLang, y potencialmente llama.cpp u Ollama si se generan pesos GGUF del modelo fusionado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RSIGame-Qwen3.8-27B-S3 | 28B (base) + LoRA | 262.000 | Generacion de juegos 2D con agente | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.8-27B | 28B | 262.000 | Modelo generalista multimodal | Apache-2.0 | Hugging Face |
| Alternativas de generacion de codigo de juego | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables especificamente entrenados para generacion de proyectos de videojuego completos, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- No es un asistente conversacional: la model card indica explicitamente que es un generador de codigo, no un chat assistant. Usarlo en modo conversacional puede producir resultados degradados.
- Especializacion estrecha: el adaptador esta entrenado para generacion de proyectos Godot 4 y Phaser; su rendimiento en otras tareas de codigo no esta documentado.
- Solo se publica el checkpoint S3; los checkpoints intermedios (s1baseline, s1split, s2) no estan disponibles, lo que limita la reproducibilidad del pipeline completo.
- Idiomas soportados no disponibles: no se especifica que idiomas maneja el adaptador, aunque hereda del base.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir APIs inexistentes, ficheros mal referenciados o configuraciones invalidas en los proyectos generados.
- Restricciones de licencia: Apache-2.0, pero el uso del adaptador implica cumplir tambien la licencia del modelo base Qwen/Qwen3.8-27B.
- Sesgos conocidos: no disponibles.
- El modelo esta bajo revision (paper anonimo, "Under review"), por lo que los resultados pueden no estar validados por pares.
- El repositorio tiene solo 5 descargas y 0 likes, lo que indica una adopcion muy limitada y poca validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/RSIGame/RSIGame-Qwen3.8-27B-S3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Codigo: https://github.com/WenyiWU0111/RSIGame
- Dataset de entrenamiento: https://huggingface.co/datasets/RSIGame/EvoGame-SFT
- Juegos base: https://huggingface.co/datasets/RSIGame/EvoGame-BaseGames
- Pagina del proyecto: https://huggingface.co/spaces/RSIGame/rsigame-page
- Articulo sobre especificaciones y despliegue de Qwen3.8-27B: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
