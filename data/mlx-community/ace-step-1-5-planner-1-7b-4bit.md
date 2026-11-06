# mlx-community/ACE-Step-1.5-planner-1.7B-4bit

## Resumen

ACE-Step-1.5-planner-1.7B-4bit es la version cuantizada a 4 bits del planificador (planner) del sistema ACE-Step 1.5, un modelo generativo de audio desarrollado por ACE Studio y StepFun. Este bundle concreto lo publica la comunidad mlx-community y contiene unicamente el componente de lenguaje del pipeline, no el sistema completo: se trata de un modelo de 1.854.243.840 parametros basado en Qwen3 que opera a 5 Hz y actua como planificador dentro de una arquitectura mayor compuesta por un DiT turbo, un text encoder y un VAE.

El modelo resuelve el problema de convertir una descripcion textual (caption) y una letra en una representacion intermedia que el resto del pipeline transforma en audio. No genera audio por si mismo: es una pieza de un sistema de sintesis musical texto-a-audio que produce canciones estereo a 48 kHz, con soporte para timbre de referencia, cover, repaint y extension de clips, ademas de marcas temporales LRC.

Su relevancia es practica: con 1,68 GB en disco es el bundle mas pequeno de la familia de planificadores (frente a 2,39 GB del 8-bit y 3,71 GB del bf16), lo que lo hace atractivo para ejecutar ACE-Step 1.5 en Apple Silicon mediante MLX Swift. La cuantizacion es afin, con group size 64, y esta verificada tensor a tensor contra la operacion de cuantizacion del propio paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3) como planificador a 5 Hz dentro del pipeline ACE-Step 1.5 |
| Parametros totales | 1.854.243.840 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afin, group size 64; existen bundles 8-bit y bf16 del mismo planner |
| Idiomas soportados | no disponible |
| Licencia | MIT (fine-tune ACE-Step); base Qwen3 Apache-2.0 |
| Formato de pesos | safetensors (MLX, layout mlx-lm con weight + scales + biases) |

## Arquitectura y entrenamiento

El planner es un modelo de lenguaje Qwen3 de 1,7B parametros que opera a una frecuencia de 5 Hz, es decir, produce representaciones a razon de cinco pasos por segundo de audio objetivo. Dentro de ACE-Step 1.5 convive con tres componentes adicionales: un DiT turbo, un text encoder y un VAE. El bundle cuantiza las 196 capas Linears de sus 28 capas con `mx.quantize` en modo afin, group size 64 y 4 bits; la embedding/head atada de 217.204 x 2.048 y las normas permanecen en bf16.

La conversion la realiza el conversor de xocialize/mlx-ace-step-swift, port completo de ACE-Step 1.5 a Swift-MLX, y esta verificada bit a bit contra la cuantizacion que el propio paquete aplica al planner bf16 al cargarlo (702 de 702 tensores). No se modifican los pesos mas alla del cambio de layout (prefijo de claves, layout de convoluciones, folding de weight-norm), y el conversor esta validado contra los scripts `dit_convert.py` y `vae_convert.py` de upstream. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Planificacion condicionada por texto y letra dentro del pipeline ACE-Step 1.5 (caption + lyrics como entrada).
- Generacion de la representacion intermedia que el DiT turbo convierte en audio estereo a 48 kHz.
- Soporte de marcas temporales LRC para alinear letra y audio.
- Timbre de referencia: el sistema puede condicionarse con audio de referencia.
- Edicion de audio: cover, repaint y extension de un clip fuente.
- Control de duracion y semilla en la peticion de generacion.
- No es un modelo de chat ni de tool calling; su funcion es exclusivamente la planificacion dentro del pipeline musical.

## Casos de uso

- Generacion de canciones completas en local sobre Apple Silicon: el planner 4-bit alimenta el pipeline junto al DiT turbo, text encoder y VAE para producir una cancion estereo de 48 kHz a partir de caption y letra, con un peso en disco de solo 1,68 GB para este componente.
- Prototipado rapido de ideas musicales: al ser el tier mas ligero del planner, permite iterar captions y letras con tiempos de carga reducidos antes de fijar una version definitiva.
- Creacion de covers: el sistema acepta un clip fuente y genera una nueva version manteniendo la estructura, usando el planner para interpretar la instruccion textual.
- Repaint y extension de clips: util para alargar demos existentes o regenerar secciones concretas de una pista sin rehacerla completa.
- Sincronizacion de letra con audio: las marcas LRC generadas permiten construir reproductores con letra sincronizada o subtitulos para video.
- Integracion en aplicaciones Swift nativas: mediante MLX Swift y MLXEngine, el planner se registra como capacidad `music` y se invoca desde codigo Swift, lo que facilita incorporarlo a apps de macOS/iOS.
- Evaluacion comparativa de cuantizaciones: util para medir el impacto del tier 4-bit frente al 8-bit y bf16 en la calidad final del audio en un mismo hardware.

## Benchmarks y rendimiento

| Metrica | 4-bit | 8-bit | bf16 |
|---|---|---|---|
| PER (12-song gate, MEASUREMENTS.md §V2b) | 0,212 | 0,108 | 0,120-0,197 segun la tirada |
| Tamano en disco | 1,68 GB | 2,39 GB | 3,71 GB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; el planner no es un modelo de proposito general y la unica metrica reportada es la tasa de error fonetico (PER) sobre el conjunto de validacion de 12 canciones del port.

## Requisitos de hardware

- VRAM/unified memory: el bundle ocupa 1,68 GB en disco; en memoria, el planner 4-bit requiere aproximadamente 2 GB, a los que hay que sumar el DiT turbo, el text encoder y el VAE del pipeline completo.
- Hardware objetivo: Apple Silicon mediante MLX Swift (el paquete declara soporte para ejecucion en Apple Silicon; no se especifican modelos de chip concretos).
- GPU NVIDIA: no es el objetivo del bundle; para CUDA habria que usar los pesos originales de ACE-Step/Ace-Step1.5 con el stack de upstream.
- Despliegue: MLX Swift a traves de xocialize/mlx-ace-step-swift y MLXEngine; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este bundle.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACE-Step-1.5-planner-1.7B-4bit (este) | 1,854 M | no disponible | 4-bit afin, group 64 | MIT | Hugging Face, MLX |
| ACE-Step-1.5-planner-1.7B-8bit | 1,854 M | no disponible | 8-bit | MIT | Hugging Face, MLX |
| ACE-Step-1.5-planner-1.7B-bf16 | 1,854 M | no disponible | bf16 | MIT | Hugging Face, MLX |
| ACE-Step-1.5-planner-0.6B-bf16 | no disponible | no disponible | bf16 | MIT | Hugging Face, MLX |

No se dispone de datos para comparar con planificadores de otros sistemas de generacion musical (por ejemplo, modelos texto-a-audio de otros autores) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el DiT turbo, el text encoder y el VAE no produce audio; requiere el pipeline completo del paquete Swift.
- La cuantizacion a 4 bits degrada la calidad medida: PER 0,212 frente a 0,108 del 8-bit, aproximadamente el doble de error fonetico en el gate de 12 canciones.
- El 8-bit es el tier por defecto del paquete; el 4-bit es una opcion secundaria y no la recomendada para produccion.
- Riesgo de alucinacion en la planificacion: no se documentan tasas de error semantico ni de fidelidad a la letra mas alla del PER.
- Idiomas soportados no declarados; el comportamiento multilingue de la letra no esta documentado.
- Licencia MIT para el fine-tune, pero el modelo base Qwen3 es Apache-2.0; conviene revisar ambas al redistribuir.
- El repositorio upstream ACE-Step/Ace-Step1.5 no incluye fichero LICENSE; el texto controlante es el LICENSE de GitHub (Copyright (c) 2026 ACEStep).
- Modelo con muy poca traccion en la comunidad (49 descargas, 0 likes) en el momento de la consulta; soporte limitado.
- Uso previsto ligado a generacion musical; no debe emplearse como modelo de lenguaje general.

## Enlaces

- Hugging Face: https://huggingface.co/mlx-community/ACE-Step-1.5-planner-1.7B-4bit
- Modelo base: https://huggingface.co/ACE-Step/Ace-Step1.5
- Repositorio upstream: https://github.com/ace-step/ACE-Step-1.5
- Licencia upstream: https://github.com/ace-step/ACE-Step-1.5/blob/main/LICENSE
- Port Swift-MLX: https://github.com/xocialize/mlx-ace-step-swift
- MLX Swift: https://github.com/ml-explore/mlx-swift
- MLXEngine: https://github.com/xocialize/mlx-engine-swift
- Informe tecnico: https://arxiv.org/abs/2602.00744
