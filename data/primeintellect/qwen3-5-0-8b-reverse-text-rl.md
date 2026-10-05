# PrimeIntellect/Qwen3.5-0.8B-Reverse-Text-RL

## Resumen

Qwen3.5-0.8B-Reverse-Text-RL es un ajuste fino corto por aprendizaje por refuerzo (RL) publicado por PrimeIntellect sobre su propio modelo PrimeIntellect/Qwen3.5-0.8B-Reverse-Text-SFT, que a su vez deriva de la familia Qwen3.5. El entrenamiento se realizo con la herramienta prime-rl sobre el entorno `reverse-text`, una tarea de recompensa verificable que consiste en invertir cadenas de texto. El resultado es un artefacto de integracion continua (CI): actua como teacher congelado y sampler en las pruebas de destilacion on-policy y RL-SFT de prime-rl, y sustituye al anterior PrimeIntellect/Qwen3-0.6B-Reverse-Text-RL.

El modelo tiene 1.107.265.600 parametros reales segun los pesos en safetensors (aproximadamente 1,11 mil millones), pese a que el nombre comercial indique 0,8B. El repositorio ocupa 2,2 GB, lo que es consistente con pesos almacenados a 16 bits. Se distribuye bajo licencia Apache 2.0, con la libreria transformers y pipeline declarado `image-text-to-text`, aunque el ajuste por RL se limita al entorno de texto invertido.

Su relevancia es fundamentalmente de infraestructura y metodologia: el modelo documenta de forma reproducible una receta completa de RL con recompensa verificable sobre una sola tarea, incluyendo hiperparametros, configuracion de despliegue (una GPU H200 para inferencia y otra para el entrenador, difusion de pesos por NCCL) y la evolucion del reward paso a paso. El propio autor advierte de que no esta pensado para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de la familia Qwen3.5 (no se detallan mas especificaciones en la informacion disponible) |
| Parametros totales | 1.107.265.600 (~1,11 B, segun safetensors; el nombre del modelo indica 0,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas; el repo de 2,2 GB es consistente con pesos a 16 bits) |
| Idiomas soportados | no disponible (no se declara ningun idioma en la model card ni en los metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5 en su variante de 0,8B, reutilizada tal cual: el proceso descrito no modifica la topologia del modelo, sino que aplica un ajuste fino por RL sobre los pesos del SFT previo (PrimeIntellect/Qwen3.5-0.8B-Reverse-Text-SFT). No se especifican en la informacion disponible el numero de tokens de preentrenamiento, la composicion del dataset original ni si hubo fases de RLHF o DPO en el modelo base.

La receta de RL esta documentada con detalle: se ejecuto el commit `21814b401` de prime-rl con la configuracion `examples/basic/reverse-text/rl.toml`, durante 20 pasos, con 8 prompts por paso y 16 rollouts por prompt (tamano de batch 128), un maximo de 128 tokens por generacion y una tasa de aprendizaje de 3e-6. El despliegue de entrenamiento uso una GPU H200 para inferencia y otra para el entrenador, con difusion de pesos mediante NCCL. El reward medio de entrenamiento escalo de 0,30 en los primeros pasos a 0,42 en el paso 20, y el reward de evaluacion (256 prompts, temperatura 1) paso de 0,3086 en el paso 0 a 0,4077 en el paso 20. No se mencionan innovaciones arquitectonicas como atencion lineal o decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional, segun el tag `conversational` del repositorio.
- Ejecucion de la tarea `reverse-text`: invertir cadenas de texto, que es la unica habilidad reforzada explicitamente durante el RL.
- Capacidad multimodal heredada del pipeline declarado `image-text-to-text` y de la familia Qwen3.5; no se documenta su calidad tras el ajuste por RL.
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`).
- Integracion como teacher congelado y sampler en flujos de destilacion on-policy y RL-SFT dentro de prime-rl.
- Soporte de tool calling, function calling y razonamiento multi-paso en agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Modos especiales (thinking mode, audio): no disponible.

## Casos de uso

- Pruebas de regresion en CI de prime-rl: el modelo se usa como referencia estable en los tests de integracion continua del framework, de modo que cualquier cambio en el codigo de RL pueda compararse contra un resultado conocido (reward de evaluacion 0,4077 en el paso 20).
- Teacher congelado para destilacion on-policy: al estar congelado y ser reproducible, sirve para generar trayectorias de referencia que un alumno debe imitar en pruebas de destilacion, sin que el teacher cambie entre ejecuciones.
- Sampler en pruebas de RL-SFT: proporciona rollouts con una distribucion fija para validar que el bucle de RL-SFT converge de forma esperada antes de escalar a modelos mayores.
- Validacion de infraestructura distribuida: permite comprobar el funcionamiento de la difusion de pesos por NCCL y del esquema de una GPU de inferencia mas una de entrenamiento con un modelo de ~1,11B parametros que cabe holgadamente en memoria.
- Verificacion de entornos con recompensa exacta: el entorno `reverse-text` tiene una funcion de recompensa determinista, por lo que el modelo sirve como banco de pruebas de pipelines de RL basados en verificadores, sin necesidad de un modelo de recompensa aprendido.
- Prototipado de nuevas tareas de recompensa verificable: la configuracion de 20 pasos, batch 128 y lr 3e-6 constituye una plantilla de bajo coste para ensayar entornos nuevos (por ejemplo, transformaciones reversibles de cadenas) antes de trasladarlos a modelos de mayor tamano.
- Medida de referencia de throughput de decodificacion: con un limite fijo de 128 tokens generados, el modelo permite comparar el rendimiento de distintos motores de inferencia bajo una carga identica y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El unico dato de rendimiento publicado es el reward del entorno `reverse-text` a lo largo del entrenamiento:

| Paso | Reward de evaluacion (256 prompts, temperatura 1) |
|---|---|
| 0 | 0,3086 |
| 5 | 0,3543 |
| 10 | 0,3967 |
| 15 | 0,4027 |
| 20 | 0,4077 |

Reward de entrenamiento por paso (20 pasos): 0,30; 0,30; 0,30; 0,32; 0,36; 0,33; 0,35; 0,34; 0,35; 0,35; 0,37; 0,40; 0,37; 0,36; 0,39; 0,38; 0,41; 0,43; 0,41; 0,42.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: en torno a 2,2 GB solo para pesos, mas cache KV y overhead del runtime; en la practica, entre 4 y 6 GB segun el motor y la longitud de contexto (estimacion propia a partir del numero de parametros, no un dato publicado).
- Cuantizacion a 8 bits: aproximadamente 1,1 GB de pesos; a 4 bits, aproximadamente 0,6 GB (estimaciones; no se publican variantes cuantizadas).
- Cabe sin problema en GPU de consumo: RTX 3060 12 GB, RTX 4070, RTX 4090, e incluso tarjetas con 6-8 GB de VRAM en cuantizacion de 4 u 8 bits.
- GPU de gama profesional para entrenamiento: la receta publicada emplea una H200 para inferencia y otra H200 para el entrenador; no se especifica si funcionaria con GPUs menores.
- Opciones de despliegue: transformers (libreria declarada), servidores de inferencia compatibles con el tag `endpoints_compatible` (por ejemplo, Hugging Face Inference Endpoints), y motores habituales como vLLM o TGI. Para llama.cpp u Ollama seria necesaria una conversion a GGUF que no se publica en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Estado |
|---|---|---|---|---|
| PrimeIntellect/Qwen3.5-0.8B-Reverse-Text-RL | 1,11 B | reverse-text (RL) | Apache 2.0 | Objeto de esta ficha |
| PrimeIntellect/Qwen3.5-0.8B-Reverse-Text-SFT | no disponible | reverse-text (SFT) | no disponible | Modelo base directo |
| PrimeIntellect/Qwen3-0.6B-Reverse-Text-RL | no disponible | reverse-text (RL) | no disponible | Modelo al que sustituye |
| Qwen3.5-0.8B (modelo base de la familia) | no disponible | proposito general | no disponible | Origen de la arquitectura |

No se dispone de datos de contexto, rendimiento ni licencia de las alternativas mas alla de lo indicado, por lo que la comparacion cuantitativa no es posible con la informacion disponible.

## Limitaciones y advertencias

- El autor indica explicitamente que el modelo no esta pensado para uso general; es un artefacto de CI y un ejemplo de receta.
- La habilidad reforzada se limita al entorno `reverse-text`; el ajuste de 20 pasos no busca competencia general ni conversacional de calidad.
- No se declaran idiomas soportados, por lo que no hay garantia de comportamiento correcto en castellano ni en ningun otro idioma.
- No se publican resultados de benchmarks estandar, sesgos conocidos ni tasas de alucinacion.
- La longitud de contexto no esta documentada, lo que impide planificar despliegues con ventanas largas.
- El reward final de evaluacion es 0,4077, es decir, el modelo falla en mas de la mitad de los prompts del entorno objetivo bajo temperatura 1; no es un modelo resuelto ni fiable para esa tarea.
- El pipeline declarado es `image-text-to-text`, pero no hay ninguna evaluacion publicada de las capacidades de vision tras el ajuste por RL.
- Licencia Apache 2.0, por lo que no hay restricciones documentadas para uso comercial, aunque el uso previsto siga siendo de investigacion y validacion de infraestructura.
- Existe una discrepancia entre el nombre (0,8B) y el recuento real de parametros (1,11B), que conviene tener en cuenta al calcular memoria.
- Los resultados de busqueda web realizados no devolvieron ningun resultado relevante sobre este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PrimeIntellect/Qwen3.5-0.8B-Reverse-Text-RL
- Modelo base (SFT): https://huggingface.co/PrimeIntellect/Qwen3.5-0.8B-Reverse-Text-SFT
- Repositorio de prime-rl: https://github.com/PrimeIntellect-ai/prime-rl
- Commit de la receta: https://github.com/PrimeIntellect-ai/prime-rl/commit/21814b401e29240e8ca4f161dafa0bba6d1425ba
- Configuracion del ejemplo: https://github.com/PrimeIntellect-ai/prime-rl/blob/21814b401e29240e8ca4f161dafa0bba6d1425ba/examples/basic/reverse-text/rl.toml
