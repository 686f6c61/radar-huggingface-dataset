# prada5023/countdown-rl-qwen3-4b-v2-demo-s2-cont

## Resumen

`countdown-rl-qwen3-4b-v2-demo-s2-cont` es un adaptador LoRA publicado por el usuario `prada5023` sobre el modelo base Qwen/Qwen3-4B-Base. No se trata de un modelo completo, sino de un conjunto de pesos PEFT (r = 16, alpha = 32) entrenado con GRPO (Group Relative Policy Optimization) para resolver el juego de numeros Countdown con una herramienta Python en el bucle de razonamiento. El adaptador ensena a la politica a escribir trazas `<think>`, ejecutar codigo `<python>` cuyo stdout vuelve en `<output>`, y emitir la respuesta final en `<answer>`.

La relevancia del artefacto es metodologica: demuestra un pipeline de reinforcement learning con tool use sobre un modelo pequeno (4B parametros), con evaluacion en un holdout generado despues de todas las decisiones del modelo (holdout3, 1.000 problemas) y una tasa de acierto pass@1 del 68,2% en modo greedy. El adaptador es especifico del prompt de entrenamiento (`fewshot_multi_retry`), por lo que solo debe evaluarse con ese mismo formato.

El repositorio pesa aproximadamente 0,1 GB, no registra descargas ni likes en el momento de la consulta, y se distribuye bajo licencia Apache 2.0. Toda la informacion tecnica disponible proviene de la model card y de los metadatos de Hugging Face; no hay publicaciones externas ni benchmarks independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Qwen3-4B-Base) |
| Parametros totales | 4B en el modelo base; el adaptador LoRA no declara recuento propio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Base, un transformer decoder-only de 4.000 millones de parametros. El entrenamiento utiliza GRPO, un algoritmo de optimizacion de politica sin modelo critico que estima la ventaja relativa dentro de un grupo de muestras generadas para el mismo prompt. La configuracion LoRA es r = 16 y alpha = 32. El entorno de entrenamiento es el juego Countdown, en el que el modelo debe combinar numeros para alcanzar un objetivo; la politica puede invocar una herramienta Python cuyo resultado se reinyecta en el contexto, lo que convierte la tarea en un problema de razonamiento multi-paso con tool use.

La receta corresponde a la version v2, con prompt de demostracion (demo prompt), semilla 2 y 45 pasos adicionales sobre un checkpoint previo (sufijo `cont`). El identificador de ejecucion asociado es `q4v2s2long` (paso 45). El autor indica que el codigo de entrenamiento, las configuraciones, los logs y el informe (`REPORT.md`, `EXPERIMENTS.md`, ruta `configs/experiments/qwen3-4b-v2-demo-s2-cont/`) estan en un repositorio acompanante, aunque no se proporciona su URL en la informacion disponible. No se detallan el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases adicionales de RLHF o DPO.

## Capacidades

- Razonamiento multi-paso con trazas explicitas en `<think>` antes de la respuesta.
- Tool calling mediante ejecucion de codigo Python (`<python>`) con realimentacion del stdout en `<output>`.
- Resolucion del juego Countdown: combinar numeros para alcanzar un objetivo bajo reglas aritmeticas.
- Formato de respuesta estructurado y parseable (`<think>`, `<python>`, `<output>`, `<answer>`).
- Dos rondas de codigo por problema en la configuracion de evaluacion recomendada.
- Capacidades generales heredadas del modelo base Qwen3-4B-Base (generacion de texto, codigo y matematicas basicas), aunque el adaptador esta especializado en la tarea Countdown.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Evaluacion de recetas de RL con tool use: el adaptador sirve como referencia reproducible para comparar GRPO con y sin ejecucion de codigo en tareas de razonamiento aritmetico, usando el holdout3 y el prompt `fewshot_multi_retry` como protocolo fijo.
- Investigacion sobre razonamiento con herramientas: permite estudiar como un modelo de 4B aprende a intercalar `<think>` y `<python>` para delegar calculos, un patron aplicable a tareas de algebra y logica.
- Generacion de datos sinteticos de razonamiento: las trazas de la politica pueden filtrarse por acierto y reutilizarse para destilacion o entrenamiento supervisado de modelos menores.
- Prototipado de agentes aritmeticos: el esquema `<python>`/`<output>` es un ejemplo minimo de bucle agente con sandbox de ejecucion, util para validar orquestadores antes de pasar a modelos mayores.
- Docencia y divulgacion: el juego Countdown con verificacion automatica es un banco de pruebas didactico para explicar RL, LoRA y evaluacion pass@1 con dificultades estratificadas (facil, medio, dificil).
- Base para fine-tuning posterior: al ser un adaptador PEFT sobre Qwen3-4B-Base, puede combinarse con otros adaptadores o continuarse con GRPO sobre tareas relacionadas, partiendo del checkpoint del paso 45.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| holdout3 (1.000 problemas, greedy, 768 tokens, dos rondas de codigo) | pass@1 global | 68,2% |
| holdout3, dificultad facil | pass@1 | 87,8% |
| holdout3, dificultad media | pass@1 | 57,0% |
| holdout3, dificultad dificil | pass@1 | 53,3% |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) ni comparaciones con otros adaptadores o modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 4B parametros; en fp16 requiere aproximadamente 8 GB solo para pesos, y en cuantizacion de 4 bits alrededor de 2,5-3 GB, mas overhead de contexto y del adaptador LoRA (despreciable, ~0,1 GB).
- GPU recomendadas: A100 o H100 para evaluacion a gran escala del holdout completo; RTX 4090, RTX 3090 o RTX 4080 suficientes para inferencia interactiva en fp16.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en fp16 y en tarjetas de 4-6 GB con cuantizacion de 4 bits del modelo base.
- Opciones de despliegue: el autor documenta `countdown-eval` con `--merge-adapter` y atencion `sdpa_gqa`; al ser un adaptador PEFT, es compatible con el ecosistema Hugging Face (transformers + peft). No se confirma soporte especifico de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La evaluacion recomendada usa 768 tokens maximos y dos rondas de codigo por problema, lo que condiciona el coste por muestra.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros adaptadores o modelos de razonamiento con tool use, ni datos de modelos alternativos en la misma tarea.

## Limitaciones y advertencias

- Especificidad del prompt: el autor advierte que las politicas dependen del prompt de entrenamiento (`fewshot_multi_retry`); evaluar con otro formato invalida los resultados reportados.
- Ambito restringido: el adaptador esta entrenado exclusivamente para el juego Countdown con herramienta Python; su rendimiento fuera de esa tarea no esta caracterizado.
- No es un modelo autonomo: requiere Qwen/Qwen3-4B-Base y la libreria PEFT para funcionar.
- Riesgo de alucinacion: no evaluado en la informacion disponible; en tareas aritmeticas el fallo se manifiesta como respuestas incorrectas, no necesariamente como texto inventado.
- Sesgos: no documentados.
- Idiomas: no se declaran idiomas soportados; el prompt de entrenamiento es en ingles y no hay evidencia de generalizacion a castellano u otras lenguas.
- Reproducibilidad: el holdout3 se genero despues de todas las decisiones del modelo, lo que reduce el riesgo de contaminacion, pero no se aportan detalles sobre el repositorio de entrenamiento ni enlaces verificables.
- Uso comercial: la licencia Apache 2.0 del adaptador lo permite, pero conviene verificar la licencia del modelo base Qwen3-4B-Base antes de desplegar en produccion.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigacion sin validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/prada5023/countdown-rl-qwen3-4b-v2-demo-s2-cont
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Repositorio de entrenamiento (mencionado en la model card, URL no disponible): `configs/experiments/qwen3-4b-v2-demo-s2-cont/`, `REPORT.md`, `EXPERIMENTS.md`
- Paper de GRPO: no disponible en la informacion proporcionada
- Demo: no disponible
