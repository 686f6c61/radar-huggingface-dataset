# DanielClough/music-gen-ace-step-v15-turbo-onnx

## Resumen
El modelo `DanielClough/music-gen-ace-step-v15-turbo-onnx` es una conversion a ONNX del modelo ACE-Step 1.5 turbo (variante de 2B parametros, arquitectura DiT) para generacion de musica a partir de texto. Lo publica el usuario DanielClough y deriva del checkpoint original `ACE-Step/Ace-Step1.5` en su revision `19671f406d603126926c1b7e2adc169acbcade22`, concretamente del subdirectorio `acestep-v15-turbo/`. Resuelve el problema de ejecutar generacion de musica local en ONNX Runtime y CUDA sin depender del stack de PyTorch, y esta pensado para el runner `music-gen`.

La conversion separa el modelo en dos grafos: el codificador de condicionamiento (`condition_turbo.onnx`, 2,4 GB) y el DiT (`dit_turbo.onnx`, 6,3 GB). El pipeline completo requiere ademas otros dos repositorios auxiliares publicados por el mismo autor: `music-gen-qwen3-embedding-0.6b-onnx` (codificadores de caption y letra) y `music-gen-ace-step-v15-vae-onnx` (VAE y latente de silencio). El autor justifica la conversion propia frente a exportaciones comunitarias previas porque el DiT de `shreyask/ACE-Step-v1.5-ONNX` no coincide con este checkpoint (81 de 110 pesos con nombre difieren) y su codificador de letra falla si no se rellena a 2048 tokens.

Se trata de un modelo especializado en texto-a-musica, no de un LLM de proposito general, y su relevancia actual radica en que permite inferencia local eficiente en GPU de consumo con un coste de memoria moderado y una fidelidad numerica muy alta respecto al original en PyTorch FP32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con codificador de condicionamiento; ACE-Step 1.5 turbo |
| Parametros totales | 2B (variante turbo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; limites de tensor: ts 2-512, ls 2-4096, rl 2-15000, t 2-15000, T 16-15000 (hasta 10 minutos a 25 fps), E 2-4096 |
| Tipos de cuantizacion | FP32 (sin cuantizacion; el autor indica explicitamente que no se entreno ni cuantizo nada) |
| Idiomas soportados | no disponible (el modelo trabaja con caption y letra en texto, sin lista de idiomas declarada) |
| Licencia | MIT, copyright (c) 2026 ACEStep |
| Formato de pesos | ONNX (opset 18, exportado con `torch.onnx.export(dynamo=True)`), con ficheros `.data` asociados y `SHA256SUMS` |

## Arquitectura y entrenamiento
El modelo original ACE-Step 1.5 emplea una arquitectura de Diffusion Transformer (DiT) para generacion de musica, con un codificador de condicionamiento que procesa texto (proyector de texto y codificador de letra), timbre (referencia de audio) y empaquetado de secuencias. Esta conversion no reentrena ni modifica los pesos: unicamente transforma safetensors a ONNX y separa el codificador de condicionamiento y el DiT del resto del modelo. Durante la exportacion se sustituyen dos funciones del codigo original por equivalentes exactos: el argsort estable en `pack_sequences` (ONNX no dispone de ordenacion estable y, para mascaras 0/1, ordenar por clave unica produce el mismo orden) y el desempaquetado de timbre en su caso de un solo lote.

El proceso de muestreo turbo usa 8 pasos sin CFG, partiendo de ruido gaussiano de forma [1, T, 64] y aplicando el schedule shift-3 `[1.0, 0.95455, 0.9, 0.83333, 0.75, 0.64286, 0.5, 0.3]`, con la actualizacion `x -= v · (t_k − t_{k+1})` en cada paso y `x0 = x − v · t` en el ultimo. Para texto-a-musica, `src_latents` es el latente de silencio repetido hasta T, `chunk_masks` es todo unos e `is_covers` vale 0; para repintar un tramo, `src_latents` es el latente existente con el tramo puesto a silencio y `chunk_masks` vale 1 sobre ese tramo. El codificador de condicionamiento aplica `src = where(is_covers > 0, hints, src_latents)` y `context = [src, chunk_masks]`. La exportacion se realizo con torch 2.10.0+cu128, transformers 4.57.6, onnx 1.23.2, onnxscript 0.7.2 y onnxruntime-gpu 1.24.4.

## Capacidades
- Generacion de musica a partir de texto (text-to-music), con caption descriptivo y letra opcional.
- Generacion condicionada por timbre mediante una referencia de audio (`refer_audio_acoustic_hidden_states_packed`, `refer_audio_order_mask`), limitada a un unico clip de referencia.
- Repintado (repainting) de un tramo concreto de audio existente, controlando que porciones se regeneran mediante `chunk_masks`.
- Control de duracion: el grafo DiT admite T entre 16 y 15000, lo que permite piezas de hasta 10 minutos a 25 frames por segundo.
- Codificacion de texto y letra en representaciones latentes de 1024 dimensiones que alimentan al DiT.
- No dispone de tool calling, function calling, agentes, vision ni audio de entrada mas alla de la referencia de timbre.
- No se declaran capacidades multilingues ni modo de razonamiento explicito.

## Casos de uso
- Generacion de musica instrumental local: el modelo produce pistas a partir de un caption descriptivo, sin necesidad de conexion a servicios en la nube, gracias a su ejecucion sobre ONNX Runtime y CUDA.
- Creacion de canciones con letra: el codificador de condicionamiento procesa simultaneamente caption y letra (hasta 4096 tokens de letra), lo que permite generar canciones completas con voz cantada.
- Repintado de secciones de una pista: usando `src_latents` con el tramo a silencio y `chunk_masks` a 1 sobre ese tramo, se puede regenerar un estribillo o una seccion defectuosa sin rehacer la pieza entera.
- Clonacion de timbre: con una unica referencia de audio se puede condicionar la generacion para que mantenga caracteristicas timbricas similares, util para mantener coherencia entre pistas de un mismo proyecto.
- Produccion de bandas sonoras para videojuegos o video: la capacidad de generar hasta 10 minutos en una sola pasada (15000 frames a 25 fps) permite crear pistas largas de fondo sin fragmentacion.
- Prototipado rapido en estudios de musica: con unos 10 segundos en una RTX 3090 para una pieza de 3 minutos, el modelo sirve para iterar sobre ideas musicales en tiempo casi interactivo.
- Despliegue en pipelines automatizados de generacion de audio: al estar en ONNX, se integra en servicios que ya usan ONNX Runtime sin arrastrar el stack completo de PyTorch.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

La model card si incluye medidas de fidelidad numerica frente al original en PyTorch FP32 sobre CUDA, con TF32 desactivado, como error RMS relativo:

| Grafo | Resultados |
|---|---|
| `condition_turbo` | 7e-9 a 9e-9 con entradas sin relleno; hasta 4,0e-7 con caption y letra rellenados (texto 256 / letra 2048 con mascaras; texto 30 / letra 600 a 1501 frames) |
| `dit_turbo` | 1,5e-5 a T=200; 4,0e-6 a 750; 5,0e-6 a 750 con 300 tokens de condicionamiento; 8,3e-6 a 1500 |
| Los 8 pasos completos, frente al sampler original con el mismo ruido | 4,8e-6 a 750 frames (30 s); 7,9e-5 a 15000 frames (10 min) |

En una RTX 3090 (24 GB): una pieza de 3 minutos tarda unos 10 s con un pico de 10,3 GB; una pieza de 10 minutos tarda 29 s con un pico de 16,7-19,8 GB.

## Requisitos de hardware
- VRAM estimada: unos 10,3 GB de pico para una pieza de 3 minutos; 16,7-19,8 GB de pico para una pieza de 10 minutos, medido en RTX 3090.
- GPU recomendadas: RTX 3090 (24 GB) es la referencia medida por el autor; cabe tambien en RTX 4090 (24 GB) y en GPUs profesionales como A100 o H100, aunque no se han publicado medidas especificas para estas.
- Cabe en GPU de consumo con al menos 12-16 GB de VRAM para piezas cortas; para piezas de 10 minutos conviene disponer de 20 GB o mas.
- Opciones de despliegue: ONNX Runtime con CUDA (`onnxruntime-gpu` 1.24.4), a traves del runner `music-gen` del propio autor. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: aproximadamente 10 s para 3 minutos de audio y 29 s para 10 minutos en RTX 3090, con 8 pasos de muestreo sin CFG.
- El pipeline completo requiere ademas los repositorios `music-gen-qwen3-embedding-0.6b-onnx` y `music-gen-ace-step-v15-vae-onnx`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `DanielClough/music-gen-ace-step-v15-turbo-onnx` | 2B (turbo) | hasta 15000 frames (10 min a 25 fps) | ONNX FP32 | MIT | Hugging Face, 0 descargas, 0 likes |
| `ACE-Step/Ace-Step1.5` (original) | 2B (turbo) y variante XL | no disponible en la informacion proporcionada | safetensors | MIT | Hugging Face |
| `ACE-Step/acestep-v15-xl-turbo` | variante XL | no disponible en la informacion proporcionada | safetensors | no disponible en la informacion proporcionada | Hugging Face |
| `shreyask/ACE-Step-v1.5-ONNX` | no disponible | no disponible | ONNX | no disponible | Hugging Face; el autor de esta ficha indica que su DiT no coincide con el checkpoint y produce ruido |

## Limitaciones y advertencias
- El modelo es una conversion, no un entrenamiento nuevo: cualquier sesgo o limitacion del checkpoint original ACE-Step 1.5 se hereda intacto.
- No se ha cuantizado, por lo que el consumo de VRAM y el tamano de los ficheros (8,7 GB en total) son los del modelo en FP32.
- El grafo de condicionamiento admite un unico elemento de lote y un unico clip de referencia; no soporta procesamiento por lotes ni multiples referencias de timbre.
- Los limites de tensor son estrictos: ts 2-512, ls 2-4096, rl 2-15000, t 2-15000, T par entre 16 y 15000, E 2-4096. Superarlos provoca fallo de inferencia.
- El autor advierte de que la exportacion comunitaria `shreyask/ACE-Step-v1.5-ONNX` produce ruido con cualquier entrada por desajuste de pesos, lo que subraya la importancia de usar esta conversion concreta y verificar los sha256 de `SHA256SUMS`.
- No se declaran idiomas soportados para caption ni letra, por lo que el comportamiento multilingue no esta garantizado.
- Riesgo de alucinacion en el sentido de generar audio que no se corresponde con el caption o la letra, inherente a los modelos generativos; no se han publicado tasas de fallo.
- La licencia MIT permite uso comercial, pero el copyright original es de ACEStep (2026) y se debe conservar el aviso de licencia y la atribucion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad ni informes de uso en produccion.
- Requiere montar un pipeline de cuatro repositorios (condicionamiento, DiT, embeddings y VAE); no es un modelo autonomo de un solo fichero.

## Enlaces
- Hugging Face del modelo: https://huggingface.co/DanielClough/music-gen-ace-step-v15-turbo-onnx
- Modelo base original: https://huggingface.co/ACE-Step/Ace-Step1.5
- Variante XL turbo: https://huggingface.co/ACE-Step/acestep-v15-xl-turbo
- Repositorio GitHub de ACE-Step 1.5: https://github.com/ace-step/ACE-Step-1.5
- Exportacion ONNX de la comunidad (desaconsejada por el autor): https://huggingface.co/shreyask/ACE-Step-v1.5-ONNX
