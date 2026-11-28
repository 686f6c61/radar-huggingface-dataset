# netprojects/nemotron-dory1.0-4b-mlx-nvfp4

## Resumen

Dory 1.0 4B es un modelo de razonamiento de NVIDIA presentado bajo la familia Nemotron-Labs, con una arquitectura poco habitual de tipo *looped language model*: un bloque compartido de capas se ejecuta entre 1 y 4 veces (2 por defecto), de modo que un unico conjunto de pesos ofrece un dial entre velocidad y precision. El checkpoint original de NVIDIA se distribuye en formato NVFP4 (4 bits) y esta ficha documenta la conversion a MLX realizada por NetProjects para Apple Silicon, publicada el 7 de noviembre de 2026.

Esta build concreta, `netprojects/nemotron-dory1.0-4b-mlx-nvfp4`, no re-cuantiza el modelo: copia byte a byte los pesos de 4 bits y las escalas de bloque de NVIDIA al formato nativo `nvfp4` de MLX, manteniendo embeddings y cabeza de salida en 8 bits. El resultado ocupa 2,6 GB, alcanza unos 99 tokens/s en generacion con 2 loops en un M5 Max y conserva la misma perplejidad que bf16 en WikiText-2 (11,59 frente a 11,62).

Su relevancia practica es doble: por un lado demuestra que los checkpoints NVFP4 de NVIDIA pueden trasladarse a MLX sin perdida apreciable de calidad; por otro, ofrece un modelo de razonamiento de 4B parametros que cabe en Macs de 8 GB de memoria unificada, con un modo de pensamiento explicito delimitado por ``. El modelo solo procesa y genera texto en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bloque de capas compartido (*looped language model*); 1 a 4 pasadas por el bloque, 2 por defecto |
| Parametros totales | 3.975.229.440 (aproximadamente 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card documenta prompts de 16K tokens sin indicar el limite maximo) |
| Tipos de cuantizacion | NVFP4 4-bit (pesos de NVIDIA copiados sin cambios, bloques de 16 con escala E4M3 y escala por matriz); embeddings y cabeza de salida en 8 bits; existen builds 8-bit y bf16 del mismo autor |
| Idiomas soportados | Ingles |
| Licencia | OpenMDW-1.1 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors con layout fusionado (query, key, value y gate en una matriz; gate y up del MLP en una matriz), libreria MLX |

## Arquitectura y entrenamiento

Dory emplea un diseno de capas recurrentes por comparticion de pesos: un unico bloque de transformers se aplica de forma iterativa entre 1 y 4 veces, lo que multiplica la profundidad efectiva sin incrementar el numero de parametros. El checkpoint base de NVIDIA se publica en NVFP4, un formato de coma flotante de 4 bits con bloques de 16 valores y una escala de 8 bits (E4M3) por bloque, mas una escala adicional por matriz. La conversion a MLX copia esos valores y escalas sin re-cuantizar; dado que Dory normaliza la salida de casi todas las matrices, la escala por matriz se cancela, y en las dos matrices donde es relevante (la puerta de salida de atencion y la puerta del MLP) se pliega en las escalas por canal ya existentes en el modelo.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo incorpora un modo de razonamiento explicito: genera la cadena de pensamiento dentro de etiquetas ``.
- Razonamiento aritmetico basico y problemas de logica (el autor verifica respuestas como 17 × 23 = 391).
- Ajuste de esfuerzo computacional mediante el parametro `loops` (1 a 4), que controla cuantas veces se recorre el bloque compartido.
- Conversacion multi-turno mediante la API `dory_mlx.chat`.
- Procesamiento de prompts largos: la model card reporta metricas con prompts de 16K tokens y caches de ventana deslizante verificadas.
- Soporte de decodificacion token a token y prefill por trozos (chunked prefill) con caches deslizantes.
- Solo texto en ingles; no se documentan capacidades de vision, audio, tool calling ni function calling.

## Casos de uso

- Razonamiento local en Macs de 8 GB: el build NVFP4 ocupa 2,6 GB y permite ejecutar un modelo de razonamiento con cadena de pensamiento en equipos con memoria unificada limitada, donde un bf16 de 8 GB no cabria con comodidad.
- Asistentes de analisis paso a paso: tareas de logica, matematicas basicas o descomposicion de problemas donde interesa inspeccionar la cadena de razonamiento completa antes de la respuesta final.
- Prototipado de agentes con presupuesto de latencia variable: el dial `loops` permite usar 1 pasada para respuestas rapidas (149 tokens/s en M5 Max) y 4 pasadas cuando prima la precision (59 tokens/s), sin cambiar de modelo.
- Procesamiento de documentos largos en local: con prompts de 16K tokens y un consumo pico de 7,3 GB a 2 loops, es viable resumir o analizar contratos, informes o articulos sin salir del equipo.
- Evaluacion de tecnicas de cuantizacion: util como referencia para comparar el impacto de NVFP4 frente a 8-bit y bf16 en perplejidad y acuerdo top-1, con datos publicados por el autor.
- Educacion e investigacion sobre modelos recurrentes: sirve para experimentar con modelos de capas compartidas y medir el efecto del numero de loops en calidad y throughput.
- Desarrollo de aplicaciones MLX nativas: integrable via el paquete `dory_mlx` en pipelines de Python sobre Apple Silicon, sin dependencias de CUDA.

## Benchmarks y rendimiento

El autor publica mediciones de perplejidad y velocidad, no resultados en benchmarks estandar (MMLU, HumanEval, GSM8K).

| Metrica | NVFP4 (esta build) | 8-bit | bf16 |
|---|---|---|---|
| Perplejidad WikiText-2, 1 loop | 12,01 | 12,05 | 12,04 |
| Perplejidad WikiText-2, 2 loops | 11,59 | 11,64 | 11,62 |
| Perplejidad WikiText-2, 4 loops | 11,52 | 11,58 | 11,56 |
| Acuerdo top-1 con bf16, 2 loops | 88,9% | 97% | referencia |
| Generacion, prompt corto, 2 loops | 99 tokens/s | 69 tokens/s | 39 tokens/s |
| Memoria pico, prompt de 16K, 2 loops | 7,3 GB | 9,0 GB | no disponible |

Mediciones en MacBook Pro M5 Max (128 GB), MLX 0.32, decodificacion greedy, mediana de 3 ejecuciones. A 1 loop el build NVFP4 alcanza 149 tokens/s y 6,1 GB de pico; a 4 loops, 59 tokens/s y 9,8 GB. La verificacion del layout de pesos da un error relativo de 0,08 frente a los pesos bf16 de NVIDIA.

## Requisitos de hardware

- VRAM/memoria unificada: 2,6 GB de pesos; pico medido de 6,1 GB con prompts cortos y 7,3 GB con 16K tokens a 2 loops; hasta 9,8 GB a 4 loops con 16K tokens.
- Cabe en Macs de 8 GB de memoria unificada (el autor lo recomienda como build ligera para ese rango).
- GPU recomendadas: Apple Silicon exclusivamente (probado en M5 Max de 128 GB); no es compatible con CUDA ni con GPUs NVIDIA/AMD.
- Despliegue: paquete `dory_mlx` (instalacion desde GitHub), sobre MLX 0.32 y mlx-lm 0.32.2; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput medido: 149 / 99 / 59 tokens/s en generacion con prompt corto para 1 / 2 / 4 loops; lectura de prompt de 16K a 4.130 / 2.600 / 1.500 tokens/s respectivamente.
- Latencia con prompt largo: 124 / 82 / 49 tokens/s de generacion tras un prompt de 16K tokens para 1 / 2 / 4 loops.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dory 1.0 4B NVFP4 MLX (esta ficha) | ~4B | no disponible (probado a 16K) | NVFP4 MLX, Apple Silicon | OpenMDW-1.1 | Hugging Face, 357 descargas |
| Dory 1.0 4B MLX 8-bit (mismo autor) | ~4B | no disponible | 8-bit MLX, 4,2 GB | OpenMDW-1.1 | Hugging Face |
| Dory 1.0 4B MLX bf16 (mismo autor) | ~4B | no disponible | bf16 MLX, 8,0 GB | OpenMDW-1.1 | Hugging Face |
| NVIDIA Nemotron-Labs-Dory1.0-4B-NVFP4 (original) | ~4B | no disponible | NVFP4, ecosistema NVIDIA | OpenMDW-1.1 | Hugging Face |

No se dispone de datos de benchmarks comparativos con modelos de otras familias (por ejemplo, Qwen o Llama de tamano similar) en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: no hay soporte multilingue documentado, lo que limita su uso en castellano sin traduccion previa.
- Riesgo de alucinacion inherente a los modelos generativos; la cadena de razonamiento visible no garantiza la correccion de la respuesta final.
- Las respuestas incluyen la cadena de pensamiento completa, por lo que son mas largas que las de un modelo de chat convencional y consumen mas tokens de salida.
- Exclusivo de Apple Silicon: requiere MLX y el paquete `dory_mlx`; no hay soporte para CUDA, vLLM, llama.cpp ni Ollama.
- Licencia OpenMDW-1.1: conviene revisar el texto completo antes de uso comercial, ya que se etiqueta como `other` en Hugging Face.
- Build no oficial: NetProjects no esta afiliado a NVIDIA; la calidad depende de la conversion, aunque el autor publica verificaciones de layout, perplejidad y acuerdo top-1.
- El limite maximo de contexto no se especifica; las pruebas se limitan a 16K tokens.
- No se documentan capacidades de tool calling, function calling, vision ni audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/nemotron-dory1.0-4b-mlx-nvfp4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-NVFP4
- Model card bf16 de NVIDIA (resultados de precision): https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Repositorio dory-mlx: https://github.com/internet-projects/dory-mlx
- Build 8-bit: https://huggingface.co/netprojects/Nemotron-Dory-1.0-4B-MLX-8bit
- Build bf16: https://huggingface.co/netprojects/Nemotron-Dory-1.0-4B-MLX-bf16
- Organizacion NetProjects en Hugging Face: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
- MLX: https://github.com/ml-explore/mlx
