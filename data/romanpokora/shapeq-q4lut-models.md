# RomanPokora/shapeq-q4lut-models

## Resumen

SHAPEQ / Q4_LUT model zoo es un repositorio experimental publicado por Roman S. Pokora (investigador independiente) que contiene dos cuantizaciones GGUF en un formato propio denominado Q4_LUT, basado en su tecnica SHAPEQ (shape-adaptive quantization). No es un modelo entrenado desde cero, sino una derivacion de dos modelos pequenos ya existentes: SmolLM-135M y Qwen2.5-0.5B. El objetivo no es superar el estado del arte en calidad, sino demostrar que una rejilla de cuantizacion no uniforme de 16 niveles, ajustada de forma determinista mediante teoria de Lloyd-Max, puede integrarse en un runtime real como llama.cpp.

Cada tensor lineal se decodifica mediante una tabla de busqueda (lookup table) de 16 valores ajustados a la distribucion de pesos del modelo, mas una escala fp16 por grupo. El ajuste no requiere entrenamiento ni gradientes y solo modifica el alfabeto de cuantizacion, por lo que es composable con GPTQ, AWQ, rotaciones y correcciones dispersas. El resultado son ficheros de aproximadamente 4,17 y 4,25 bits por peso en las capas lineales.

La relevancia del proyecto es metodologica: demuestra que un formato de cuantizacion personalizado puede reproducir su propia referencia desquantizada token a token y mejorar ligeramente a Q4_0 en perplejidad, a costa de velocidad. Requiere obligatoriamente un fork privado de llama.cpp, ya que los identificadores de tipo (44 y 45) no existen en el upstream y no hay soporte GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de SmolLM-135M y Qwen2.5-0.5B) |
| Parametros totales | 134,5 M (SmolLM-135M) y 494,0 M (Qwen2.5-0.5B) |
| Parametros activos | No aplica (modelos densos) |
| Longitud de contexto | No disponible en la model card (medido con ctx 512 en los experimentos) |
| Tipos de cuantizacion | Q4_LUT (type id 44, bloque de 96 pesos, 4,167 bpw) y Q4_LUT64 (type id 45, bloque de 64 pesos, 4,25 bpw); solo pesos lineales, embeddings y salida en f16 |
| Idiomas soportados | No disponible (se mencionan pruebas de continuacion greedy en ingles y ruso) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (custom, solo cargable con fork de llama.cpp); packs de ajuste en `.pt` |

## Arquitectura y entrenamiento

Los modelos base son transformers decoder-only convencionales (SmolLM-135M y Qwen2.5-0.5B). La innovacion no esta en la arquitectura del modelo sino en el esquema de cuantizacion: cada bloque de pesos lineales se codifica con codigos de 4 bits que indexan una rejilla no uniforme de 16 niveles ajustada por tensor, almacenada en los metadatos GGUF bajo claves `q4lut.*`. El ajuste de la rejilla es determinista y se basa en teoria clasica de Lloyd-Max, con un procedimiento ponderado por Hessiano para Qwen2.5-0.5B. No hay entrenamiento ni RLHF/DPO asociado a esta publicacion.

En SmolLM-135M se cuantizan 210 tensores lineales (55,3 MB) con bloques de 96 pesos y una tasa de 4,167 bits por peso; el fichero final ocupa 108,6 MB. En Qwen2.5-0.5B, cuyas dimensiones ocultas no son divisibles por 96, se usa el bloque de 64 pesos (4,25 bpw) sobre 168 tensores lineales, con un fichero de 446,9 MiB. La calibracion uso exclusivamente el split de entrenamiento de WikiText-2. El kernel LUT del fork es una implementacion de referencia, no optimizada, y no dispone de ruta repack-GEMM.

## Capacidades

- Generacion de texto autoregresiva, limitada al conocimiento y capacidad de los modelos base de 135 M y 494 M de parametros.
- Conversacion multi-turno basica (el tag `conversational` figura en el repositorio).
- Capacidad multilingue no documentada formalmente; la model card solo cita pruebas de continuacion en ingles y ruso.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No hay vision, audio ni modo de razonamiento extendido (thinking mode).
- Reproducibilidad bit a bit frente al modelo de fake-quant en PyTorch en continuaciones greedy de 64 tokens.

## Casos de uso

- Investigacion en cuantizacion: banco de pruebas para evaluar rejillas no uniformes ajustadas por distribucion frente a esquemas uniformes como Q4_0 o Q4_K_M en un runtime real.
- Experimentos de compresion en CPU: despliegue de modelos de menos de 500 M de parametros en entornos sin GPU, aprovechando que el formato es exclusivamente CPU.
- Validacion de metodologia academica: reproduccion de los resultados del paper SHAPEQ mediante los packs preajustados y `REPRODUCE.md`, sin necesidad de reejecutar el ajuste.
- Prototipado de pipelines de cuantizacion personalizada: base para estudiar la composicion de rejillas ajustadas con GPTQ, AWQ o correcciones dispersas.
- Docencia y divulgacion: ejemplo tangible de teoria de Lloyd-Max aplicada a pesos de redes neuronales con medicion de perplejidad y throughput.
- Pruebas de integracion en forks de llama.cpp: verificacion de tipos GGUF privados, metadatos por tensor y decodificacion LUT en builds AVX2.

## Benchmarks y rendimiento

SmolLM-135M, corpus WikiText-2 (primeros 240 KB), ctx 512, CPU i7-10850H, AVX2, 6 hilos:

| Quant | Fichero (MB) | PPL | pp512 (t/s) | tg128 (t/s) |
|---|---|---|---|---|
| q4lut | 108,6 | 20,73 | 229 | 54 |
| Q4_0 | 87,5 | 21,64 | 533 | 105 |
| IQ4_NL | 87,8 | 20,43 | 565 | 98 |
| Q4_K_M | 100,6 | 19,06 | 269 | 99 |

Qwen2.5-0.5B, misma maquina y ajustes (slice de 16 chunks, ctx 512):

| Run | PPL | pp512 (t/s) | tg128 (t/s) |
|---|---|---|---|
| f16 GGUF original | 15,83 | 210,0 | 12,8 |
| f16 desquantizado (misma rejilla, sin kernel LUT) | 17,13 | — | — |
| q4lut (este fichero) | 17,13 | 67,1 | 13,2 |
| Q4_0 (referencia) | 17,65 | 190,9 | 33,4 |

## Requisitos de hardware

- VRAM: no aplica; el formato solo tiene kernel CPU. El fichero de SmolLM ocupa 108,6 MB y el de Qwen2.5 446,9 MiB, por lo que caben en RAM de cualquier equipo moderno.
- GPU: no hay soporte de backends GPU en el fork; no se puede ejecutar en A100, H100 ni RTX 4090.
- Consumer GPU: no aplica por ausencia de kernel CUDA/Metal.
- Despliegue: exclusivamente mediante el fork `shapeq-q4lut` de llama.cpp (rama `shapeq-q4lut`), compilado con CMake en Release. No es compatible con vLLM, TGI, Ollama ni llama.cpp upstream.
- Latencia y throughput: medidos en CPU i7-10850H con AVX2 y 6 hilos; 229 t/s en pp512 y 54 t/s en tg128 para SmolLM; 67,1 t/s en pp512 y 13,2 t/s en tg128 para Qwen2.5-0.5B. Cifras dependientes de la maquina.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL (WikiText-2, ctx 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SHAPEQ q4lut (SmolLM-135M) | 134,5 M | no disponible | 20,73 | Apache-2.0 | GGUF custom, fork obligatorio |
| Q4_0 (SmolLM-135M) | 134,5 M | no disponible | 21,64 | Apache-2.0 | GGUF estandar, llama.cpp upstream |
| IQ4_NL (SmolLM-135M) | 134,5 M | no disponible | 20,43 | Apache-2.0 | GGUF estandar, llama.cpp upstream |
| Q4_K_M (SmolLM-135M) | 134,5 M | no disponible | 19,06 | Apache-2.0 | GGUF estandar, llama.cpp upstream |
| SHAPEQ q4lut (Qwen2.5-0.5B) | 494,0 M | no disponible | 17,13 | Apache-2.0 | GGUF custom, fork obligatorio |
| Q4_0 (Qwen2.5-0.5B) | 494,0 M | no disponible | 17,65 | Apache-2.0 | GGUF estandar, llama.cpp upstream |

## Limitaciones y advertencias

- Requiere un fork privado de llama.cpp; el upstream rechaza los ficheros como tipo de cuantizacion desconocido. No hay soporte upstream previsto.
- Solo CPU: no existen kernels para backends GPU.
- `llama-quantize` no puede producir ni reexportar este tipo (sin `from_float`/`to_float`).
- El kernel LUT es una implementacion de referencia, no optimizada; el rendimiento es notablemente inferior a Q4_0 (por ejemplo, 54 frente a 105 t/s en tg128 para SmolLM).
- IQ4_NL obtiene mejor perplejidad (20,43 frente a 20,73) y mayor velocidad en SmolLM, por lo que q4lut no es la mejor opcion practica ni siquiera en su propio banco de pruebas.
- Los modelos base son muy pequenos (135 M y 494 M de parametros), con conocimiento limitado y alta propension a errores factuales; no son adecuados para produccion exigente.
- Riesgo de alucinacion inherente a los modelos base, no mitigado por la cuantizacion.
- Idiomas soportados no documentados formalmente; solo se verifican continuaciones en ingles y ruso.
- Perplejidad absoluta puede variar en el ultimo decimal segun el orden de reduccion de BLAS; las velocidades son especificas de la maquina.
- La licencia Apache-2.0 se hereda de los modelos base y permite uso comercial, pero la dependencia de un fork no mantenido upstream es un riesgo operativo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RomanPokora/shapeq-q4lut-models
- Paper SHAPEQ: https://stiggigy-jpg.github.io/shapeq-paper/
- Repositorio del paper y fitter: https://github.com/stiggigy-jpg/shapeq-paper
- Runtime fork llama.cpp: https://github.com/stiggigy-jpg/shapeq-q4lut
- Modelo base SmolLM-135M: https://huggingface.co/HuggingFaceTB/SmolLM-135M
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
