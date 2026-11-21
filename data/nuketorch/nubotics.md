# NukeTorch/Nubotics

## Resumen

Nubotics es un modelo de política robótica (visión-lenguaje-acción) publicado por NukeTorch, un desarrollador independiente, y orientado específicamente a la inferencia en Apple Silicon. Se trata de un fine-tuning sobre los pesos de NVIDIA GR00T N1.7 (checkpoint `nvidia/gr00t17-lerobot-libero_10-640`), por lo que hereda la arquitectura y el conocimiento del modelo base de NVIDIA, pero sustituye el motor de inferencia por uno propio (NukeTorch 1.0.5) con optimizaciones agresivas de cuantización y decodificación.

El modelo resuelve un problema muy concreto: ejecutar políticas robóticas de tipo VLA en hardware de consumo (MacBook Pro con chip M5 Max) con latencias compatibles con control en bucle cerrado a 20 Hz. Para ello introduce tres innovaciones: un "speculative eye model" que destila la torre de visión-lenguaje, cuantización int8 de dos exponentes en todas las capas lineales, y un solver de flow de un solo paso en lugar de cuatro.

Con 3.144.016.000 parámetros totales y un repositorio de 14,2 GB, es un modelo de tamaño medio dentro de la categoría VLA. Su relevancia actual radica en que demuestra que es posible superar en latencia a un despliegue en H100 con TensorRT usando un portátil, aunque los pesos siguen siendo de NVIDIA y la licencia aplicable es la NVIDIA Open Model License.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) derivada de NVIDIA GR00T N1.7, con flow matching de un paso y eye model especulativo |
| Parámetros totales | 3.144.016.000 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 con dos escalas (por columna y por fila) en todas las capas lineales excepto la entrada del action model, que permanece en 16 bits; pesos en safetensors (probablemente bf16/fp16 en origen) |
| Idiomas soportados | no disponible (las instrucciones se procesan vía tokenizador Qwen3-VL-2B-Instruct) |
| Licencia | NVIDIA Open Model License (etiquetada como "other" en el repo) |
| Formato de pesos | safetensors (`model.safetensors`, `policy_*_step_*.safetensors`, `nubotics.bin`) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema de GR00T N1.7: un modelo visión-lenguaje que codifica dos frames de cámara y una instrucción en lenguaje natural, y un action model que genera un chunk de 16 acciones mediante flow matching. Nubotics no reentrena los pesos; los hereda directamente del checkpoint de NVIDIA fine-tuneado sobre LIBERO-10. Lo que aporta NukeTorch es la capa de inferencia: un "speculative eye model" destilado de las propias salidas del modelo completo sobre episodios de entrenamiento de LIBERO-10, verificado contra el modelo completo antes de publicarse, que sustituye a la torre VLM completa en el camino de visión.

Las optimizaciones de cómputo son tres. Primero, cuantización int8 de dos exponentes: cada valor lleva una escala de columna (fijada a partir de los pesos y de activaciones calibradas una vez sobre frames grabados) y una escala de fila (calculada en tiempo de ejecución a partir del máximo de la fila), lo que mantiene los productos de 8 bits próximos a los de 16 bits. Segundo, el flow de la política se resuelve en un único paso de denoising en lugar de cuatro. Tercero, el servidor agrupa las peticiones pendientes de varios robots, cada una con su propia instrucción, en una sola llamada, lo que permite escalar a 16 robots concurrentes en un solo equipo. El tokenizador proviene de Qwen3-VL-2B-Instruct (Apache-2.0).

## Capacidades

- Generación de chunks de acción robótica: recibe dos frames de cámara, el estado del brazo y una instrucción textual, y devuelve 16 acciones por llamada.
- Control en bucle cerrado a 20 Hz en simulación LIBERO-10, con un chunk nuevo por frame.
- Ejecución multi-robot: hasta 16 robots independientes con instrucciones distintas en una misma llamada al servidor.
- Procesamiento de instrucciones en lenguaje natural mediante el tokenizador de Qwen3-VL.
- Inferencia en Apple Silicon (GPU del M5 Max) mediante el motor NukeTorch 1.0.5.
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas ni generación de texto general; es un modelo exclusivamente de política robótica.

## Casos de uso

- Laboratorio de robótica con múltiples brazos: un único MacBook Pro M5 Max puede servir 16 robots con tareas distintas, con respuestas por robot en 181,7 ms y 86,6 chunks por segundo agregados, lo que evita aprovisionar una GPU por unidad.
- Investigación en manipulación con LIBERO: reproducción de episodios de LIBERO-10 en bucle cerrado a 20 Hz con una tasa de éxito del 89,2% sobre 500 episodios, útil para comparar políticas sin infraestructura de datacenter.
- Prototipado en estación de trabajo: al requerir solo 4,1 GB de RAM pico y 48,8 W, permite iterar sobre políticas en un portátil sin GPU dedicada.
- Línea de producción de bajo volumen: despliegue de control de manipulación en el borde (edge) con consumo energético de 0,90 J por chunk, adecuado para entornos con restricciones térmicas o de alimentación.
- Evaluación comparativa de políticas VLA: sirve como referencia de latencia frente a despliegues en H100 con TensorRT (18,81 ms frente a 22,9 ms por llamada).
- Docencia y demostraciones: el bajo coste de hardware y la licencia de pesos de NVIDIA permiten montar prácticas de robótica con equipos de sobremesa.
- Pruebas de escalado multi-robot: con 8 robots y 8 tareas distintas se mantienen 81,6 chunks por segundo y 5,0 GB de RAM pico, lo que sirve para dimensionar despliegues mayores.

## Benchmarks y rendimiento

Un MacBook Pro M5 Max con 48 GB, alimentación de red, macOS 27.2.1.

| Métrica (un robot, una llamada) | Nubotics | GR00T N1.7 (ruta Mac del fabricante) | NVIDIA H100 + TensorRT |
|---|---:|---:|---:|
| Una llamada (mediana) | 18,81 ms | 349,3 ms | 22,9 ms |
| Chunks de acción por segundo | 53,2 | 2,86 | 43,7 |
| RAM pico | 4,1 GB | 27,1 GB | no disponible |
| Potencia CPU + GPU | 48,8 W | 24,0 W | no disponible |
| Energía por chunk | 0,90 J | 8,38 J | no disponible |
| Éxito en LIBERO-10 (500 episodios) | 89,2% (446/500) | no disponible | no disponible |

| Robots simultáneos | Chunks/s totales | Respuesta por robot |
|---:|---:|---:|
| 2 | 67,2 | 29,8 ms |
| 4 | 79,3 | 50,5 ms |
| 8 | 86,2 | 92,8 ms |
| 16 | 86,6 | 181,7 ms |

| Sostenido | Chunks/s | Llamada mediana | Potencia | Chunks/J | RAM pico |
|---|---:|---:|---:|---:|---:|
| 1 robot | 54,2 | 18,4 ms | 48,8 W | 1,11 | 4,1 GB |
| 8 robots, una tarea | 83,5 | 95,8 ms | 63,0 W | 1,33 | 5,1 GB |
| 8 robots, 8 tareas | 81,6 | 98,1 ms | 62,6 W | 1,30 | 5,0 GB |
| 16 robots, 8 tareas (60 s) | 83,2 | 194,0 ms | 57,0 W | 1,46 | 8,0 GB |

No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 4,1 GB de RAM pico con un robot; 5,0-5,1 GB con 8 robots; 8,0 GB con 16 robots.
- Hardware validado: MacBook Pro M5 Max con 48 GB, macOS 27.2.1, motor NukeTorch 1.0.5. No se documentan otros backends.
- GPU recomendadas: no disponible para CUDA; el modelo está empaquetado para Apple Silicon (tag `apple-silicon`).
- Cabe en GPU de consumo: sí, en el hardware Apple validado; no hay datos para GPUs NVIDIA de consumo.
- Opciones de despliegue: motor propietario NukeTorch 1.0.5 con servidor multi-robot; no se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 18,81 ms por llamada con un robot (53,2 chunks/s); 86,6 chunks/s agregados con 16 robots; 0,90 J por chunk en el caso de un robot.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Despliegue | Latencia por llamada |
|---|---|---|---|---|---|
| Nubotics (NukeTorch) | 3.144.016.000 | no disponible | NVIDIA Open Model License | Apple Silicon (NukeTorch) | 18,81 ms (M5 Max) |
| NVIDIA GR00T N1.7 (LIBERO-10) | no disponible en la información | no disponible | NVIDIA Open Model License | PyTorch/LeRobot, TensorRT | 349,3 ms (Mac, LeRobot); 22,9 ms (H100 + TensorRT) |
| Qwen3-VL-2B-Instruct | ~2B (según nombre) | no disponible | Apache-2.0 | múltiples backends | no disponible (solo se usa su tokenizador) |

La comparación relevante es contra el propio modelo base: Nubotics es 18,57 veces más rápido que GR00T N1.7 en la ruta Mac de LeRobot, con un 85% menos de memoria y un 89% menos de energía por chunk. Frente al despliegue de referencia en H100 con TensorRT, es 1,22 veces más rápido en un portátil. No se dispone de datos de otros modelos VLA comparables en la información proporcionada.

## Limitaciones y advertencias

- Los pesos no son propios: son los de NVIDIA GR00T N1.7 fine-tuneados sobre LIBERO-10, y la NVIDIA Open Model License se aplica a ellos; las condiciones comerciales deben revisarse en el enlace oficial de NVIDIA.
- El modelo está validado únicamente en simulación LIBERO-10; no hay evidencia publicada de transferencia a robots físicos.
- Solo se documenta inferencia en Apple Silicon con el motor NukeTorch; no hay soporte declarado para CUDA, ROCm ni otros runtimes.
- La cuantización int8 de dos exponentes y el eye model especulativo pueden introducir desviaciones respecto al modelo completo; el autor afirma haberlo verificado, pero no se publican métricas de degradación por componente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de la comunidad.
- Riesgo de alucinación en instrucciones fuera de distribución: al ser una política entrenada sobre LIBERO-10, generaliza mal a entornos, objetos o morfologías no vistas.
- No se documentan sesgos lingüísticos ni cobertura de idiomas; las instrucciones dependen del tokenizador de Qwen3-VL, pero no se especifica qué lenguas maneja la política.
- La latencia declarada (18,81 ms) corresponde a una build de desarrollo y a un hardware concreto (M5 Max, 48 GB); no debe extrapolarse a otros chips Apple.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NukeTorch/Nubotics
- Modelo base (checkpoint LIBERO-10): https://huggingface.co/nvidia/gr00t17-lerobot-libero_10-640
- Modelo base original: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Tokenizador: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Vídeo demo (un robot): https://youtu.be/tctNRxkyYt8
- Vídeo demo (8 robots, 8 instrucciones): https://youtu.be/mPabfuphjLg
- Informe de benchmark detallado: https://github.com/NukeTorch/Nubotics/blob/main/benchmark/nubotics_M5.pdf
- Guía de despliegue de Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T/blob/main/scripts/deployment/README.md
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
