# riccardoroselli/qwen3.5-2b-gym-grpo-GGUF

## Resumen

`riccardoroselli/qwen3.5-2b-gym-grpo-GGUF` es la distribucion en formato GGUF del modelo `riccardoroselli/qwen3.5-2b-gym-grpo`, un fine-tuning de Qwen3.5-2B orientado a una tarea muy concreta: convertir una peticion de entrenamiento de gimnasio en texto libre a un JSON estructurado con ejercicios, series y repeticiones. Lo desarrolla Riccardo Roselli (usuario `riccardoroselli`) y esta pensado para su uso en llama.cpp, LM Studio y aplicaciones compatibles con GGUF, incluyendo la aplicacion GymLeader del propio autor.

El modelo parte de Qwen/Qwen3.5-2B (1.942.653.248 parametros segun los safetensors del modelo base) y se entrena en dos fases: primero SFT con LoRA y despues GRPO (Group Relative Policy Optimization) para reforzar el cumplimiento estricto del esquema JSON, la seleccion de ejercicios dentro de un catalogo cerrado y el rechazo de peticiones imposibles. La salida esperada es `{"workout": [{"name", "sets", "reps"}, ...]}` o `{"error": "..."}` cuando no hay suficientes ejercicios que encajen con la peticion.

Su relevancia es la de un ejemplo de modelo pequeno, especializado y cuantizado para despliegue local en CPU o Apple Silicon, con una plantilla de chat que fija el system prompt de entrenamiento y desactiva el modo thinking. El autor publica mediciones propias de velocidad y de calidad sobre 300 peticiones de test, e indica explicitamente que la cuantizacion Q4_K_M no se publica porque degrada de forma notable el comportamiento aprendido con GRPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-2B); no se detalla en la informacion disponible |
| Parametros totales | 1.942.653.248 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `-c 4096` |
| Tipos de cuantizacion | Q8_0 (8.5 bits por peso) y BF16 (16 bits por peso); Q4_K_M medido pero no publicado |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien existen safetensors en el modelo base `riccardoroselli/qwen3.5-2b-gym-grpo`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-2B, un transformer decoder-only de aproximadamente 1,94 mil millones de parametros. Sobre esa base, el autor aplica un ajuste en dos etapas: SFT con LoRA sobre peticiones de entrenamiento de gimnasio y, a continuacion, GRPO con una funcion de recompensa en el rango [0, 1] que premia que los nombres de ejercicio pertenezcan al catalogo de ejercicios de referencia, que no haya duplicados, que se rechacen las peticiones imposibles y que el JSON sea correcto en su conjunto. No se especifican en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset.

La innovacion practica del artefacto GGUF esta en la plantilla de chat: anade automaticamente el system message de entrenamiento cuando la conversacion no trae uno, fuerza el modo thinking a desactivado y establece temperatura 0 por defecto. El modelo nunca vio bloques de razonamiento durante el entrenamiento, de modo que la plantilla garantiza que una peticion de chat corriente reproduzca el mismo prompt con el que se entreno y evaluo. El autor advierte que un system message propio del usuario sustituye al de entrenamiento y no fue evaluado.

## Capacidades

- Generacion de JSON estructurado a partir de una peticion en lenguaje natural sobre rutinas de gimnasio.
- Seleccion de ejercicios restringida a un catalogo cerrado (dataset `hasaneyldrm/exercises-dataset`).
- Control de parametros de la rutina: dificultad, material (peso libre, etc.) y numero de ejercicios.
- Rechazo explicito de peticiones imposibles mediante `{"error": "..."}`.
- Evitacion de ejercicios duplicados en la rutina generada.
- Generacion de texto conversacional basica heredada del modelo base (pipeline `text-generation`).
- Modo thinking desactivado de forma forzada por la plantilla de chat.
- Soporte de tool calling, function calling, agentes y vision: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Generacion automatica de rutinas en una app de fitness: el modelo transforma la peticion del usuario ("chest workout, medium difficulty, free weights, 4 exercises") en un JSON que la aplicacion puede renderizar directamente, sin necesidad de un parser complejo.
- Backend de la aplicacion GymLeader: el autor publica una imagen Docker (`ghcr.io/riccardoroselli/gymleader:v1.0`) que descarga el Q8_0, verifica su sha256 y ejecuta el sistema completo con guard y reintentos del verificador.
- Despliegue local en portatil: con 2,08 GB para Q8_0 y 43,2 tok/s de generacion en un Apple M4 MacBook Air, es viable ejecutarlo en un equipo de consumo sin GPU dedicada.
- Prototipado de asistentes de entrenamiento en LM Studio: la plantilla de chat y la temperatura 0 por defecto permiten obtener respuestas reproducibles con una configuracion minima.
- Servicio HTTP interno con llama-server: el ejemplo con `-ngl all -c 4096 -np 1` y la API `/v1/chat/completions` permite integrarlo en un backend que reciba peticiones de usuario y devuelva JSON validado.
- Generacion de datos sinteticos de rutinas: al estar restringido a un catalogo cerrado y rechazar peticiones imposibles, sirve para producir ejemplos estructurados que alimenten otros sistemas o bases de datos.
- Evaluacion de tecnicas de RL: el par SFT/GRPO y las metricas publicadas (all_correct, reward) lo convierten en un caso de estudio reproducible para comparar SFT frente a GRPO en tareas de salida estructurada.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 300 peticiones de test (combinaciones y formulaciones no vistas en entrenamiento, 16 de ellas imposibles), decodificacion greedy, thinking desactivado, evaluadas con el verificador del proyecto (`src/verifier.py`). `all_correct` exige que pasen todas las comprobaciones; `reward` es la recompensa de GRPO en [0, 1].

| Modelo | Nombres en catalogo | Sin duplicados | Imposibles rechazadas | all_correct | reward |
|---|---|---|---|---|---|
| Qwen3.5-2B, zero-shot | – | – | 0/16 | 0.00 | 0.000 |
| Qwen3.5-2B, 3 ejemplos en el prompt | 0.161 | 0.943 | 0/16 | 0.00 | 0.415 |
| SFT (`gym-sft`) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| Q8_0 (este repo) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| BF16 (referencia) | 0.95 | no disponible | no disponible | 0.54 | no disponible |
| Q4_K_M (medido, no publicado) | 0.82 | no disponible | no disponible | 0.25 | no disponible |

Rendimiento de inferencia medido con `llama-bench` (llama.cpp b12360) en un Apple M4 MacBook Air, Metal, todas las capas en GPU, 3 repeticiones:

| Fichero | Generacion (tg128) | Lectura de prompt (pp512) |
|---|---|---|
| Q8_0 | 43,2 tok/s | 918 tok/s |
| BF16 | 25,5 tok/s | 958 tok/s |

El autor indica que el fichero Q8_0 dio exactamente la respuesta evaluada en las 300 peticiones de test a traves de la API de chat de llama-server (llama.cpp b12360, Metal), sin system message enviado.

## Requisitos de hardware

- VRAM/almacenamiento para inferencia: 2.076.675.008 bytes (~2,08 GB) para Q8_0 y 3.897.387.968 bytes (~3,90 GB) para BF16.
- GPU recomendadas: no se especifican modelos concretos; el autor valida en Apple M4 MacBook Air con Metal y todas las capas en GPU.
- Cabe en GPU de consumo: si, por el tamano del fichero (Q8_0 de ~2,08 GB y BF16 de ~3,90 GB), aunque no se publican mediciones en GPU dedicadas.
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio (probado con la version 0.4.28, motor llama.cpp b12270), MLX en Apple Silicon usando el modelo safetensors, y la imagen Docker de GymLeader (linux/amd64 y linux/arm64, CPU).
- Latencia y throughput: 43,2 tok/s de generacion y 918 tok/s de lectura de prompt con Q8_0; 25,5 tok/s y 958 tok/s con BF16, en Apple M4 MacBook Air. El autor advierte que las cifras variaran en otro hardware y seran menores en CPU.
- Parametros de despliegue de referencia: `-ngl all -c 4096 -np 1`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| qwen3.5-2b-gym-grpo-GGUF (este) | 1,94 B | no disponible | Fine-tuning SFT + GRPO para JSON de rutinas | Apache 2.0 | GGUF |
| qwen3.5-2b-gym-sft | no disponible | no disponible | Solo SFT, misma tarea | no disponible en la informacion proporcionada | no disponible |
| Qwen3.5-2B (base) | 1,94 B | no disponible | Modelo generalista | no disponible en la informacion proporcionada | safetensors y otros |
| Qwen3.5-2B con 3 ejemplos en el prompt | 1,94 B | no disponible | Prompting few-shot sin fine-tuning | no disponible | no disponible |

La comparacion cuantitativa disponible se limita a la tabla de resultados del propio autor: frente al Qwen3.5-2B zero-shot (all_correct 0,00; reward 0,000) y al Qwen3.5-2B con tres ejemplos en el prompt (all_correct 0,00; reward 0,415), el modelo ajustado con GRPO alcanza all_correct 0,54 en BF16. No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: fuera de la generacion de rutinas de gimnasio en JSON, su utilidad es limitada y no se han evaluado otras tareas.
- Solo declara ingles como idioma; no hay evaluacion en castellano ni en otros idiomas.
- La cuantizacion Q4_K_M degrada el comportamiento de forma significativa (all_correct 0,25 frente a 0,54 en BF16; nombres en catalogo 0,82 frente a 0,95) y por eso no se publica.
- La temperatura debe fijarse a 0 para reproducir el comportamiento evaluado; LM Studio no lee la temperatura por defecto del fichero y hay que configurarla a mano.
- Un system message propio del usuario sustituye al de entrenamiento y no fue evaluado, por lo que puede alterar el formato de salida.
- Las penalizaciones por repeticion deben permanecer desactivadas, como en todas las evaluaciones del autor.
- El modelo nunca vio bloques de razonamiento en entrenamiento; el thinking debe permanecer desactivado.
- Riesgo de alucinacion en nombres de ejercicios fuera del catalogo: aunque GRPO lo penaliza, la garantia no es absoluta (0,95 de nombres en catalogo en BF16, no 1,0).
- El autor no documenta sesgos especificos ni evaluaciones de seguridad.
- Las cifras de rendimiento proceden de un unico equipo (Apple M4 MacBook Air) y no son extrapolables a otras plataformas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa por parte de la comunidad.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/riccardoroselli/qwen3.5-2b-gym-grpo-GGUF
- Modelo base (safetensors): https://huggingface.co/riccardoroselli/qwen3.5-2b-gym-grpo
- Modelo SFT: https://huggingface.co/riccardoroselli/qwen3.5-2b-gym-sft
- Repositorio del proyecto y verificador: https://github.com/riccardoroselli/SFT-Gym-Workout-Program
- Verificador: https://github.com/riccardoroselli/SFT-Gym-Workout-Program/blob/main/src/verifier.py
- Catalogo de ejercicios: https://github.com/hasaneyldrm/exercises-dataset
- Imagen Docker de GymLeader: https://ghcr.io/riccardoroselli/gymleader
- Revision de los ficheros: https://huggingface.co/riccardoroselli/qwen3.5-2b-gym-grpo-GGUF/tree/bbb1d3cf7f9113ec518b56c95a74702bbd83ba9b
