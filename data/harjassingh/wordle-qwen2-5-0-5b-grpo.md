# HarjasSingh/wordle-qwen2.5-0.5b-grpo

## Resumen

wordle-qwen2.5-0.5b-grpo es un ajuste fino de Qwen/Qwen2.5-0.5B-Instruct orientado a una tarea muy concreta: jugar a Wordle. Lo desarrolla el usuario HarjasSingh y el entrenamiento combina una fase supervisada de calentamiento (warm-up) centrada en seguir pistas y respetar el formato de respuesta, seguida de aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization). El resultado se distribuye en formato GGUF con cuantizacion Q8_0, pensado para ejecutarse en el navegador mediante wllama sobre llama.cpp.

El modelo parte de la arquitectura de Qwen2.5-0.5B-Instruct, un transformer decoder-only de aproximadamente 494 millones de parametros, y hereda su plantilla de chat. La interfaz es estricta: el sistema y el usuario describen el tablero y el modelo debe responder con una palabra de cinco letras en mayusculas envuelta en las etiquetas `<answer>` y `</answer>`.

Su relevancia es acotada pero ilustrativa: es un ejemplo pequeno y reproducible de como el RL con recompensas verificables puede especializar un modelo minusculo en una tarea de razonamiento restringido, y de como empaquetarlo para inferencia local o en navegador. No es un modelo de proposito general y no debe evaluarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF); el modelo base admite otras cuantizaciones estandar de llama.cpp |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 0,5 GB); pesos originales del ajuste no disponibles |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer decoder-only de Qwen2.5-0.5B-Instruct, sin cambios arquitectonicos indicados en la informacion disponible. El entrenamiento consta de dos etapas: primero un warm-up supervisado sobre movimientos que respetan las pistas del juego y el formato de salida, y despues un ciclo de aprendizaje por refuerzo con GRPO, en el que se comparan grupos de respuestas muestreadas para optimizar la politica hacia jugadas que resuelven el tablero. La informacion proporcionada no detalla el volumen de datos, la composicion del dataset ni la funcion de recompensa exacta.

La innovacion practica esta en el empaquetado: la cuantizacion Q8_0 en GGUF permite ejecutar el modelo en el navegador con wllama, lo que convierte un experimento de RL en una demo interactiva sin servidor. El prompt sigue la plantilla de chat de Qwen, con mensajes de sistema y usuario describiendo el estado del tablero, y la respuesta del asistente comienza con `<answer>` seguido de una palabra en mayusculas de cinco letras y `</answer>`.

## Capacidades

- Jugar a Wordle: propone palabras de cinco letras en mayusculas respetando el formato `<answer>...</answer>`.
- Seguimiento de pistas: el warm-up supervisado entrena al modelo para incorporar la informacion de letras correctas, presentes y ausentes descrita en el prompt.
- Conversacion con plantilla de chat de Qwen (system + user), segun los tags del repositorio.
- Inferencia local y en navegador mediante llama.cpp y wllama (GGUF Q8_0).
- Razonamiento restringido al dominio del juego; no se documentan capacidades generales adicionales.
- Tool calling, agentes multi-paso, vision, audio y modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Demo web de Wordle con IA: el GGUF Q8_0 se carga con wllama en el navegador y el modelo sugiere jugadas sin backend, gracias a sus ~494 M de parametros y al formato de respuesta fijo.
- Evaluacion de RL con recompensas verificables: sirve como banco de pruebas barato para estudiar como GRPO especializa un modelo de 0,5B en una tarea con verificacion automatica (palabra valida y victoria).
- Generacion de datasets de partidas: ejecutar el modelo contra un solucionador de Wordle para producir trazas de juego y analizar estrategias de apertura y filtrado de candidatos.
- Educacion en RL: ejemplo didactico de pipeline warm-up supervisado + GRPO con un modelo que cabe en cualquier portatil.
- Pruebas de formato e integracion: validar parsers de `<answer>` y plantillas de chat de Qwen en pipelines de evaluacion.
- Inferencia en entornos con recursos minimos: al ser un GGUF de 0,5 GB, puede desplegarse en CPU o dispositivos de gama baja para tareas de juego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el GGUF Q8_0 ocupa aproximadamente 0,5 GB, por lo que la inferencia cabe holgadamente en menos de 1 GB de memoria.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) o incluso CPU; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente todas, y tambien en CPU y en el navegador via WebAssembly con wllama.
- Opciones de despliegue: llama.cpp, wllama (navegador), y cualquier runtime compatible con GGUF; Ollama y vLLM no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| wordle-qwen2.5-0.5b-grpo | 494 M | no disponible | Wordle (GRPO) | Apache 2.0 | GGUF Q8_0 |
| Qwen/Qwen2.5-0.5B-Instruct | 494 M | no disponible en esta ficha | Proposito general, instrucciones | Apache 2.0 | safetensors, GGUF |
| Otros ajustes GRPO para juegos | no disponible | no disponible | Variable | no disponible | no disponible |

La comparacion directa mas util es con su modelo base: comparten tamano y licencia, pero el ajuste sacrifica generalidad a cambio de adherencia al formato y comportamiento de juego. No se dispone de datos de rendimiento comparativos publicados.

## Limitaciones y advertencias

- Especializacion estrecha: fuera de Wordle y del formato `<answer>`, el comportamiento esperado es el del modelo base de 0,5B, con calidad limitada.
- Riesgo de respuestas mal formadas: si el prompt no sigue la plantilla de chat de Qwen y la descripcion del tablero, el modelo puede no emitir el formato requerido.
- Alucinacion: puede proponer palabras que no cumplen las pistas o que no son validas en el diccionario del juego; se recomienda validacion externa.
- Sesgos e idioma: no hay informacion sobre idiomas soportados ni sobre sesgos evaluados; el juego esta en ingles.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda conservar los avisos de atribucion del modelo base Qwen.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin benchmarks ni validacion independiente, no apto para produccion sin evaluacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/HarjasSingh/wordle-qwen2.5-0.5b-grpo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- wllama (inferencia en navegador): https://github.com/ngxson/wllama
