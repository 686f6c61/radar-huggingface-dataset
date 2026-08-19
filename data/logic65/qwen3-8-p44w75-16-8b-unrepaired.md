# logic65/Qwen3.8-p44w75-16.8B-unrepaired

## Resumen

Qwen3.8-p44w75-16.8B-unrepaired es un modelo de lenguaje de 16,3B parametros reales (16,8B segun el autor) resultante de una poda quirurgica del modelo Qwen/Qwen3.8-27B-FP8, desarrollado por logic65 en colaboracion con Claude de Anthropic. El objetivo era reducir el modelo original de 26,9B parametros a un tamano ejecutable en GPUs de consumo (2x8GB VRAM) sin reentrenamiento, destilacion ni calibracion: una poda puramente medida basada en metricas de activacion y similitud coseno, construida en un dia sobre un Ryzen 2700X.

La poda combina dos cortes ortogonales: eliminacion de 20 capas en bloques enteros de 4 (de 64 a 44 capas) y reduccion uniforme del 25% del ancho de las MLP (de 17408 a 13056 neuronas). El resultado mantiene la arquitectura hibrida Gated DeltaNet/atencion completa en proporcion 3:1, lo que permite ejecutarlo con llama.cpp estandar sin cambios en el codigo de inferencia. Alcanza 20,5 tokens/s en dos GPUs de 8GB (RTX 4060 + 3050) con cuantizacion q4km.

Este artefacto se publica como resultado de investigacion, no como modelo listo para produccion. El autor advierte explicitamente de danos conocidos: corrupcion de hechos de cola larga (long-tail facts) y tendencia a rumiar en prompts abiertos. Una version "reparada" esta planificada pero no publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated DeltaNet / atencion completa hibrida (3:1), 44 capas |
| Parametros totales | 16.344.368.864 (16,3B reales; 16,8B segun el autor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ejemplo de uso con -c 4096) |
| Tipos de cuantizacion | GGUF q8 (17,4 GB), GGUF q4km (10,1 GB), safetensors bf16 |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16), GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer de 64 capas con arquitectura hibrida que alterna Gated DeltaNet y atencion completa en un patron de intervalo 3:1 (tres capas Gated DeltaNet por cada capa de atencion completa). La poda mantiene este patron para preservar la compatibilidad con GGUF y el codigo de inferencia de llama.cpp sin modificaciones. El modelo resultante tiene 44 capas, dimension oculta de 5120, FFN de 13056 y vocabulario de 248k con head no atada (untied head).

El proceso de poda se realizo en dos fases. (1) Poda en profundidad: eliminacion de 20 capas en bloques enteros de 4 (capas 4-11, 24-31 y 32-35), reduciendo el apilado de 64 a 44 capas. La eleccion de bloques se hizo con un logit-lens en streaming sobre shards FP8 en una GPU de 8GB. (2) Poda en anchura: reduccion uniforme del 25% de las neuronas de las MLP en las 44 capas restantes, conservando el 75% mas fuerte segun la metrica `||down_column|| x activation_std` medida sobre tokens de corpus reales.

No se realizo ningun entrenamiento posterior: ni fine-tuning, ni destilacion, ni calibracion. Los experimentos del autor muestran que la redundancia en este modelo hibrido es funcional y por pares, no literal ni por bloques: las fusiones en espacio de pesos colapsan (coseno 0,27), mientras que la composicion paralela en espacio de activaciones mantiene 0,93 de similitud. La poda en profundidad mostro dano no aditivo: eliminar dos bandas de 8 capas cuesta lo mismo que eliminar solo una. El muro experimental para la eliminacion de profundidad sin entrenamiento se situa entre -7,7B y -9,2B de parametros.

## Capacidades

- Generacion de texto conversacional y completado (pipeline text-generation).
- Razonamiento aritmetico correcto: resuelve operaciones como 17x23 descomponiendo en 340 + 51 = 391.
- Generacion de codigo: mantiene precision en tareas de codigo segun la bateria de evaluacion del autor.
- Razonamiento de sentido comun basico.
- Ejecucion en hardware de consumo: 20,5 tokens/s en 2x8GB VRAM con cuantizacion q4km.
- Compatible con llama.cpp estandar (soporte para la serie Qwen3.5 en mainline desde `models: support qwen3.5 series`).
- Soporte de chat multi-turno a traves de llama-server.
- Sin soporte documentado de tool calling, function calling, vision ni audio.
- Sin modo "thinking" explicito documentado, aunque muestra comportamiento de razonamiento interno en prompts concretos.

## Casos de uso

- Investigacion academica sobre poda y compresion de modelos: el autor publica este artefacto como objeto cientifico para estudiar el perfil de dano de la poda sin reentrenamiento. El repositorio incluye el registro de investigacion completo en `research/`, con la metodologia detallada de medicion y poda.
- Prototipado rapido de asistentes conversacionales en entornos con VRAM limitada: con 10,1 GB en q4km, cabe en dos GPUs de 8GB y ofrece 20,5 tokens/s, suficiente para demos interactivas en equipos sin GPU profesional.
- Generacion de codigo asistida en entornos de desarrollo locales: su precision en tareas de codigo (segun la bateria del autor) lo hace util para autocompletado o generacion de fragmentos en maquinas de desarrollo sin acceso a servicios en la nube.
- Razonamiento aritmetico y logico en aplicaciones educativas: el modelo descompone correctamente operaciones aritmeticas, lo que puede servir para herramientas de practica matematica o demostraciones de razonamiento paso a paso.
- Experimentos de cuantizacion y despliegue: los GGUFs proporcionados (q8 y q4km) permiten estudiar el impacto de la cuantizacion sobre un modelo ya podado, comparando calidad y velocidad en distintos niveles de precision.
- Demostraciones de tecnicas de compresion en talleres y cursos: la metodologia documentada (logit-lens, metricas de activacion, escaleras de profundidad y anchura) sirve como caso de estudio practico para estudiantes de optimizacion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, HumanEval) en la informacion disponible. El autor evaluo el modelo con una bateria propia de 39 prompts en modo greedy, con los siguientes resultados:

| Variante | Parametros | Bateria (39 prompts) | Velocidad (RTX 4060 + 3050) |
|---|---|---|---|
| 48L solo profundidad | 20,8B | 33/39 | 5,0 t/s |
| 44L solo profundidad | 19,2B | 28/39 | 9-10 t/s |
| p44w75 (este modelo) | 16,8B | 25/39 | 20,5 t/s |

En modo chat, responde correctamente preguntas factuales y computacionales, pero los prompts muy abiertos pueden agotar el presupuesto de "thinking". El autor advierte que la bateria de 39 prompts es una medicion de campo, no un benchmark estandarizado, y que el modelo original de 27B no fue ejecutado sobre la misma bateria por limitaciones de hardware.

## Requisitos de hardware

- VRAM estimada para inferencia: 10,1 GB con GGUF q4km (cabe en 2x8GB); 17,4 GB con GGUF q8; 32,7 GB con safetensors bf16.
- GPU recomendadas: dos GPUs de 8GB VRAM (el autor uso RTX 4060 + 3050); tambien puede ejecutarse en una sola GPU de 12GB o superior con q4km.
- Cabe en GPUs de consumo: si, con cuantizacion q4km en 2x8GB VRAM.
- Opciones de despliegue: llama.cpp (llama-server), con soporte de la serie Qwen3.5 desde mainline.
- Latencia y throughput: 20,5 tokens/s en la configuracion de 2x8GB con q4km; 9-10 t/s con 44L depth-only (19,2B); 5,0 t/s con 48L depth-only (20,8B).
- Comando de ejemplo del autor: `llama-server -m q38p44w75_q4km.gguf -ngl 99 -c 4096 --port 8991`.
- Nota: las versiones recientes de llama.cpp separan `llama-cli
