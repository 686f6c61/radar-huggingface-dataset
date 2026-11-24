# mlx-community/Holo-3.1-35B-A3B-8bit

## Resumen

Holo-3.1-35B-A3B es un modelo multimodal de tipo image-text-to-text desarrollado por H Company, disenado especificamente para tareas de computer use y agentes de interfaz grafica (GUI agents). El modelo emplea una arquitectura Mixture-of-Experts (MoE) con 35.107 millones de parametros totales, de los cuales aproximadamente 3.000 millones estan activos por token (denominacion A3B), lo que permite un equilibrio entre capacidad y eficiencia computacional. Su pipeline principal es la conversion de imagenes de pantalla y texto en acciones, incluyendo la localizacion de elementos mediante coordenadas.

La version aqui descrita es una cuantizacion en 8 bits realizada por mlx-community para su ejecucion en Apple Silicon mediante la libreria MLX. Se ha convertido desde los pesos oficiales en bfloat16 (no desde las versiones NVFP4 o FP8) manteniendo el vision tower en bfloat16 y aplicando cuantizacion afina de 8 bits con group size 64. El modelo base conserva la licencia Apache-2.0.

La relevancia de este modelo radica en su especializacion en la interaccion con interfaces de usuario: localizacion de elementos (click accuracy del 90,5% en WebClick), comprension de capturas de pantalla y generacion de acciones estructuradas. La cuantizacion MLX permite ejecutarlo en hardware Apple con un pico de memoria de aproximadamente 39,8 GB, lo que lo hace accesible en equipos con 64 GB o mas de memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer multimodal, tipo qwen3_5_moe |
| Parametros totales | 35.107.181.936 |
| Parametros activos | Aproximadamente 3.000 millones (denominacion A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine, group size 64; vision tower en bfloat16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Holo-3.1-35B-A3B emplea una arquitectura Mixture-of-Experts con 35.107 millones de parametros totales y aproximadamente 3.000 millones activos por token, segun la convencion de nomenclatura A3B. La arquitectura declarada en los metadatos es `qwen3_5_moe`, lo que indica una base derivada de la familia Qwen 3.5 con enrutamiento disperso. El modelo es multimodal (image-text-to-text), con un vision tower que en esta version MLX se mantiene en bfloat16 para preservar la precision en la extraccion de caracteristicas visuales. El pipeline esta orientado a la generacion de acciones y localizacion de elementos en pantallas.

Los detalles especificos sobre el numero de tokens de entrenamiento, la composicion del dataset y las tecnicas de alineacion (RLHF, DPO) no estan disponibles en la informacion proporcionada; se remite a la model card original de Hcompany/Holo-3.1-35B-A3B. La conversion a MLX se realizo con mlx-vlm 0.8.0 y mlx 0.32.4, partiendo de los pesos oficiales en bfloat16. La validacion reportada incluye una divergencia KL media de 9,2e-4 (720p) y 6,0e-4 (1080p) frente a la referencia bfloat16 en logits de respuesta de click, con primer token identico.

## Capacidades

- Comprension de capturas de pantalla (screenshots) y generacion de texto asociado (image-text-to-text).
- Localizacion de elementos de interfaz: prediccion de coordenadas en el rango [0, 1000] para clicks precisos.
- Agentes de computer use: interpretacion del estado de una GUI y generacion de acciones estructuradas.
- Agentes GUI multi-paso: soporte para razonamiento orientado a la interaccion con interfaces.
- Procesamiento de prompts multi-imagen (validado con 3 capturas a 1920x1080, aproximadamente 12.000 tokens de prompt).
- Generacion de acciones estructuradas en formato JSON (por ejemplo, `{"x":500,"y":190}`) para integracion en pipelines de automatizacion.
- Capacidades conversacionales en ingles.
- Modo thinking desactivable (el protocolo de benchmark reportado usa thinking off).

## Casos de uso

- Automatizacion de pruebas de interfaz (UI testing): el modelo puede recibir una captura de pantalla y devolver las coordenadas del elemento objetivo, permitiendo a los pipelines de QA automatizar clicks y validaciones visuales sin selectores fragiles.
- Agentes de navegacion web: integrado en un bucle de agente, el modelo interpreta el estado de la pagina renderizada y emite acciones de click sobre elementos identificados, con una precision de localizacion del 90,5% en WebClick.
- Asistentes de escritorio (RPA inteligente): sustituye la automatizacion basada en coordenadas fijas por localizacion semantica de elementos a partir de la captura de pantalla.
- Soporte de accesibilidad: interpretacion de interfaces para usuarios con discapacidad visual, describiendo elementos y ofreciendo objetivos de interaccion con coordenadas.
- Extraccion de datos de pantallas: localizacion de campos y regiones en aplicaciones legacy sin API para posterior OCR o extraccion estructurada.
- Agentes multi-paso con contexto visual largo: el modelo procesa prompts de aproximadamente 12.000 tokens con 3 capturas a 1080p, adecuado para flujos donde el agente necesita recordar el estado de varias pantallas.
- Despliegue local en Apple Silicon: con 39,8 GB de pico de memoria en 8 bits, es viable en estaciones de trabajo Mac con 64 GB o mas de memoria unificada para prototipado y desarrollo de agentes GUI.

## Benchmarks y rendimiento

Benchmark WebClick (click accuracy), 1639 muestras, protocolo oficial de H Company (smart_resize, thinking off, greedy, 32 tokens nuevos, coordenadas en [0, 1000]):

| Modelo | Precision | IC 95% |
|---|---|---|
| MLX 8bit (este modelo) | 90,5% | 89,0 a 91,9 |
| MLX 4bit | 90,2% | 88,6 a 91,5 |
| llama.cpp Q4_K_M (GGUF oficial) | 91,5% | 90,1 a 92,8 |

Rendimiento en Apple M5 Max (128 GB, peticion unica, greedy):

| Motor | 1280x720: primer token / decodificacion | 1920x1080: primer token / decodificacion | Memoria |
|---|---|---|---|
| MLX 8bit (este modelo) | 415 ms / ~100 tok/s | 1,2-1,3 s / 95-99 tok/s | 39,8 GB (pico) |
| llama.cpp (Metal), Q4_K_M | 814-869 ms / 110-119 tok/s | 2,4-2,7 s / 110-119 tok/s | 22,9 GB (RSS) |

Prompt multi-imagen largo (3 capturas 1920x1080, ~12k tokens de prompt, 1024 tokens generados):

| Motor | Tiempo al primer token | Decodificacion | Memoria |
|---|---|---|---|
| MLX 8bit (este modelo) | 10,0 s | 57 tok/s | 40,0 GB (pico) |
| llama.cpp (Metal), Q4_K_M | 17,2 s | 59 tok/s | 23,0 GB (RSS) |

El prompt de 1080p supone 2221 tokens y el de 720p, 1061 tokens. No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K u otras tareas de razonamiento general.

## Requisitos de hardware

- Memoria: aproximadamente 39,8 GB de pico en 8 bits MLX (pesos del repo: 37,7 GB); la referencia bfloat16 ocupa 70 GB.
- Hardware validado: Apple M5 Max con 128 GB de memoria unificada.
- Viabilidad en consumer: requiere equipos Apple Silicon con memoria unificada de 64 GB o superior; no cabe en GPUs consumer de 24 GB en esta cuantizacion.
- Despliegue: mlx-vlm 0.8.0 con mlx 0.32.4 (via `python -m mlx_vlm.generate`); existe GGUF oficial Q4_K_M para llama.cpp con Metal.
- Latencia: 415 ms al primer token en 720p y 1,2-1,3 s en 1080p; decodificacion de 95-100 tok/s en MLX.
- Throughput con prompt largo: 57 tok/s de decodificacion con ~12k tokens de prompt multi-imagen.
- Nota: las cifras de rendimiento se obtuvieron en una maquina compartida y son indicativas; la memoria se mide de forma distinta segun el motor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WebClick | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Holo-3.1-35B-A3B (MLX 8bit, este) | 35,1B totales / ~3B activos | no disponible | 90,5% | Apache-2.0 | MLX safetensors |
| Holo-3.1-35B-A3B (GGUF Q4_K_M) | 35,1B totales / ~3B activos | no disponible | 91,5% | Apache-2.0 | GGUF para llama.cpp |
| Holo-3.1-35B-A3B (MLX 4bit) | 35,1B totales / ~3B activos | no disponible | 90,2% | Apache-2.0 | MLX safetensors |

No se dispone en la informacion proporcionada de datos de benchmarks ni especificaciones de modelos competidores de la misma categoria (agentes GUI multimodales) para una comparativa cruzada fiable.

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran capacidades multilingues.
- La precision de localizacion depende del motor de inferencia y del preprocesamiento: las diferencias entre MLX y llama.cpp no pueden atribuirse solo a los pesos.
- El benchmark reportado es unicamente WebClick (localizacion de clicks); no hay datos publicados sobre razonamiento general, codigo o matematicas.
- La cuantizacion a 8 bits introduce una divergencia pequena pero medible frente a bfloat16 (KL media 6,0e-4 a 9,2e-4 en logits de click).
- Riesgo de alucinacion en la prediccion de coordenadas sobre elementos inexistentes o capturas atipicas; no se documentan tasas de fallo fuera de WebClick.
- Requiere hardware Apple Silicon con memoria unificada elevada (64 GB o mas) para la version MLX 8bit.
- Los tiempos reportados provienen de una maquina compartida y deben tratarse como indicativos.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la model card original de H Company para condiciones adicionales de uso responsable.

## Enlaces

- Hugging Face (esta version): https://huggingface.co/mlx-community/Holo-3.1-35B-A3B-8bit
- Modelo base: https://huggingface.co/Hcompany/Holo-3.1-35B-A3B
- Dataset WebClick: https://huggingface.co/datasets/Hcompany/WebClick
- H Company: https://www.hcompany.ai/
- Libreria mlx-vlm: https://pypi.org/project/mlx-vlm/
