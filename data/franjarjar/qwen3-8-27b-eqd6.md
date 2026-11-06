# Franjarjar/Qwen3.8-27B-EQD6

## Resumen

Qwen3.8-27B-EQD6 es una cuantización del modelo Qwen/Qwen3.8-27B, un transformer de 27.000 millones de parámetros de la familia Qwen de Alibaba, publicada por el usuario Franjarjar. El archivo no es una versión genérica de llama.cpp ni de MLX: emplea EQ (LaneQuant), el formato de cuantización nativo de Espetero, un motor de inferencia escrito específicamente para Metal y para Apple silicon. El resultado es un archivo de 21,6 GB en disco que almacena los pesos con una mezcla de códigos de 5, 6 y 8 bits, y que solo puede cargarse con Espetero 0.2.0 o posterior.

La relevancia de esta ficha no está en el modelo base, sino en la propuesta de compresión: el autor compara su archivo con UD-Q6_K de Unsloth, EXL3 SC 6.0 y MLX 6-bit a igualdad de tamaño, y reporta una divergencia KL menor que todas ellas en sus propias mediciones. La ficha del modelo incluye además el procedimiento completo de cuantización (calibración, opciones del codificador, comandos) y datos de velocidad de decodificación en M4 Max y M1 Max.

Conviene leerla con cautela: los benchmarks son de calidad de cuantización (KLD, Top-1), no de capacidad del modelo, y han sido producidos por el propio autor del formato. No hay datos publicados sobre el rendimiento de la versión BF16 del modelo base en tareas estándar dentro de la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen 3.8); el archivo conserva atención lineal en algunas proyecciones (`in_proj_a/b`) |
| Parametros totales | 7.698.681.344 (según safetensors del archivo publicado); el modelo base se denomina "27B" pero no se dispone del recuento exacto de parámetros del base |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EQ (LaneQuant): códigos de 5, 6 y 8 bits; escala de 8 bits con signo por cada 16 entradas y escala fp16 por cada 256; embeddings en MLX affine 5-bit; normas en BF16; 6,42 bits por peso medidos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con formato EQ nativo de Espetero (no compatible con llama.cpp, MLX ni transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen 3.8, con atención lineal presente en determinadas proyecciones (`in_proj_a` e `in_proj_b`, cuantizadas a 8 bits en este archivo). El autor indica explícitamente que la cuantización elimina la cabeza MTP (multi-token prediction) y el torreón de visión, de modo que el archivo resultante es solo texto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base pasó por RLHF o DPO.

La innovación técnica está en el formato EQ. Cada matriz se codifica a 6 bits, salvo las MLP de las capas 0-19 y `v_proj`, que van a 5 bits, y el LM head, las proyecciones de atención lineal y los embeddings, que van a 8 o 5 bits. La escala de 8 bits con signo cubre 16 entradas y la fp16 cubre 256, una elección de diseño que hace que cada lane de los kernels matriciales de la GPU de Apple necesite exactamente una escala por paso. El codificador se ejecutó con las opciones `--enc-opts schur6,refit`: las subescalas GPTQ se eligen dentro de la recurrencia y las superescalas se reajustan por mínimos cuadrados. La calibración fue una mezcla ponderada de cuatro capturas (452K tokens de prosa y código, ~150K de Wikipedia, ~150K de C/C++ y ~150K de chat), generada con `tools/calib_mix.py`.

## Capacidades

- Generación de texto en el modelo base; el archivo conserva los pesos de texto y descarta visión y MTP.
- Razonamiento y código: la calibración incluye Python y C/C++, y el autor reporta KLD sobre estos dominios.
- Capacidades multilingües: no verificadas en la información disponible.
- Tool calling / function calling: no confirmado para este archivo; el servidor de Espetero expone una API compatible con OpenAI, Anthropic y Ollama, pero no se detalla el soporte de herramientas.
- Modo agente y razonamiento multi-paso: no documentado.
- Capacidad especial: ninguna más allá de la compresión; no hay vision tower ni cabeza MTP en el archivo.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el archivo está pensado para ejecutarse con Espetero en equipos de 32 GB o más, lo que permite servir un modelo de la familia Qwen 3.8 sin GPU dedicada.
- Despliegue de un endpoint compatible con OpenAI, Anthropic u Ollama: `espetero serve` expone una API local en `http://127.0.0.1:8080`, útil para prototipos y herramientas que ya hablan esos protocolos.
- Evaluación de formatos de cuantización: el archivo sirve como referencia reproducible para comparar EQ frente a GGUF Q6_K, EXL3 y MLX 6-bit con la misma metodología de KLD.
- Generación de código en local sobre Apple silicon: la calibración incluye C/C++ y Python y el autor mide KLD específicamente sobre fuentes de llama.cpp.
- Procesamiento de texto en lote con contexto moderado: el benchmark de decodificación usa una secuencia y 128 tokens de contexto, un escenario realista para tareas de completado corto.
- Investigación sobre compresión: el repositorio documenta el pipeline completo (calibración por rangos de capas, mezcla ponderada, opciones del codificador), lo que permite reproducir o modificar la receta.

## Benchmarks y rendimiento

Los únicos datos disponibles son de calidad de cuantización (divergencia KL frente al modelo BF16 con activaciones fp32, sobre 123.008 tokens y 62 ventanas de 2.048 tokens) y de velocidad de decodificación.

| Archivo | Motor de medida | Bits/peso | KLD media | KLD mediana | KLD p99 | Top-1 | Decode M4 Max (tok/s) | Decode M1 Max (tok/s) |
|---|---|---|---|---|---|---|---|---|
| Este archivo (EQD6) | Espetero 7949560 | 6,42 | 0,00115 | 0,00024 | 0,0129 | 98,9 % | 21 | 11 |
| unsloth UD-Q6_K | Espetero 616c21a | 6,43 | 0,00142 | 0,00029 | 0,0160 | 98,8 % | 20 | 10 |
| unsloth UD-Q6_K | dequantizado, fp32 | 6,43 | 0,00137 | 0,00028 | 0,0155 | 98,8 % | — | — |
| EXL3 SC 6.0 | runtime omlx-exl3 (bf16) | 6,49 | 0,00157 | 0,00049 | 0,0148 | 98,2 % | — | 9,1 |
| EXL3 SC 6.0 | emulación fp32 | 6,49 | 0,00111 | 0,00027 | 0,0109 | 98,8 % | — | — |
| MLX 6-bit | Espetero | 6,50 | 0,00348 | 0,00092 | 0,0347 | 97,8 % | — | — |

Comparaciones pareadas reportadas por el autor: frente a UD-Q6_K ejecutado por Espetero, KLD -19,0 % (IC 95 %: -28,1 % a -6,7 %); frente a UD-Q6_K dequantizado a fp32, -16,0 %; en texto fuera de calibración (WikiText-2 validación, C4, Python), -15,7 %; en C y C++ (fuentes de llama.cpp), -22,2 %. No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria: el autor indica un Mac con 32 GB de memoria o más; el archivo ocupa 21,6 GB en disco.
- GPU: Apple silicon exclusivamente. Los datos de decodificación se tomaron en un M4 Max (Mac Studio, 128 GB) y un M1 Max (MacBook Pro, 64 GB).
- Consumer GPU: no aplica; el formato EQ solo lo lee Espetero, que es un motor Metal para Apple silicon.
- Despliegue: `brew install JarJarFran/espetero/espetero` y `espetero serve --model Franjarjar/Qwen3.8-27B-EQD6`. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento: 21 tok/s en M4 Max y 11 tok/s en M1 Max con una secuencia, contexto de 128 tokens y `bench_native --quick --batch 1`. No se reportan cifras de prefill ni de throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Motor | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-EQD6 | 7.698.681.344 (archivo) | no disponible | safetensors EQ | Apache 2.0 | Espetero (Metal) | Hugging Face, 15 descargas |
| unsloth UD-Q6_K (Qwen3.8-27B) | mismo base | no disponible | GGUF | Apache 2.0 (base) | llama.cpp | amplia |
| EXL3 SC 6.0 (Qwen3.8-27B) | mismo base | no disponible | EXL3 | Apache 2.0 (base) | omlx-exl3 | limitada |
| MLX 6-bit (Qwen3.8-27B) | mismo base | no disponible | MLX | Apache 2.0 (base) | MLX | amplia en Apple silicon |

La comparación relevante es de tamaño y calidad de compresión, no de capacidad: todos parten del mismo modelo base. EQD6 ofrece menor KLD que UD-Q6_K y MLX 6-bit en las mediciones del autor, y menor KLD que EXL3 en su runtime Metal, a costa de un ecosistema de herramientas mucho más reducido.

## Limitaciones y advertencias

- Compatibilidad: el formato EQ no lo cargan llama.cpp, MLX ni transformers; sin Espetero 0.2.0 o posterior el archivo es inutilizable.
- Plataforma: solo Apple silicon con Metal; no hay soporte para CUDA, ROCm ni CPU x86.
- Pérdida de capacidades: el archivo elimina la cabeza MTP y el vision tower, por lo que no reproduce las capacidades multimodales del base si las tuviera.
- Benchmarks autoproducidos: todas las métricas de calidad y velocidad provienen del autor del formato; no hay validación independiente en la información disponible.
- Idiomas y contexto: no se documentan, lo que impide planificar despliegues multilingües o de contexto largo con garantías.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; son los heredados del modelo base, sin datos específicos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B por separado.
- Madurez: 15 descargas y 0 likes en el momento de la consulta; el codificador usado es un commit de desarrollo (`7949560`), no una release estable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Franjarjar/Qwen3.8-27B-EQD6
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor Espetero: https://github.com/JarJarFran/espetero
- Especificación del formato EQ: https://github.com/JarJarFran/espetero/blob/main/docs/eq.md
- Documentación de Qwen3.8-27B en Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
