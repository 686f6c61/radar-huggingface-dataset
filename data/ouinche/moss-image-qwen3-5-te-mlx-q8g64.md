# Ouinche/moss-image-qwen3.5-te-mlx-q8g64

## Resumen

`Ouinche/moss-image-qwen3.5-te-mlx-q8g64` es una conversion cuantizada en formato MLX del codificador de texto Qwen 3.5 9B que forma parte del modelo de difusion de imagenes MOSS-Image SFT, desarrollado originalmente por el equipo OpenMOSS. La conversion la firma el usuario Ouinche dentro del proyecto DiffusionBear, un runtime de inferencia nativo para Apple Silicon. El objetivo concreto es hacer viable la ejecucion del pipeline completo de MOSS-Image (codificador de texto, DiT y VAE) en Macs con 16 GB de memoria unificada, donde el codificador oficial en BF16 (~19 GB) no cabe junto al resto de componentes.

El modelo no genera texto ni imagenes por si mismo: es un modulo de extraccion de caracteristicas (feature-extraction) que transforma prompts en representaciones latentes consumidas por el DiT de MOSS-Image. Su arquitectura es un transformer hibrido con capas de atencion completa y capas recurrentes Gated DeltaNet, lo que explica la estrategia de cuantizacion mixta: se cuantizan a 8 bits las proyecciones MLP, las matrices de atencion y los embeddings, mientras que las proyecciones recurrentes de DeltaNet se mantienen en bfloat16 para preservar la recurrencia de estado a lo largo de 32 capas.

La relevancia actual es practica: demuestra que es posible ejecutar un pipeline de difusion de alta calidad en hardware de consumo Apple sin caer en el fallback a CPU de PyTorch, con una similitud coseno de 0,9995 respecto al modelo BF16 de referencia y un pico de memoria de 10 GB frente a los 19 GB originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: atencion completa + Gated DeltaNet recurrente (32 capas) |
| Parametros totales | 7.936.684.544 (~7,94 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 8-bit con `group_size=64`; proyecciones DeltaNet en bfloat16 |
| Idiomas soportados | en, zh, fr |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 10,0 GB |
| Modelo base | OpenMOSS-Team/MOSS-Image-SFT (relacion: quantized) |
| Libreria | mlx |
| Pipeline | feature-extraction |
| Hardware objetivo | Apple Silicon (Metal), probado en M1 con 16 GB |

## Arquitectura y entrenamiento

El modelo es la porcion de codificador de texto del sistema MOSS-Image SFT. Internamente combina mecanismos de atencion completa con capas Gated DeltaNet, un esquema recurrente basado en regla delta que mantiene estado comprimido entre pasos. La conversion a MLX aplica cuantizacion affine de 8 bits con grupo de 64 a las proyecciones MLP pesadas, las matrices de atencion completa y los embeddings, pero deja en bfloat16 todas las proyecciones recurrentes de DeltaNet (`in_proj_*`, `out_proj`, `conv1d`, `A_log`, `dt_bias`, `RMSNorm`) para no degradar la recurrencia de estado en las 32 capas. Esta decision de ingenieria es el nucleo tecnico de la ficha.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base. La model card solo documenta el proceso de cuantizacion y los resultados de fidelidad frente al BF16 original, con una similitud coseno de 0,9995.

## Capacidades

- Extraccion de caracteristicas de texto para condicionar un modelo de difusion de imagenes (MOSS-Image).
- Codificacion de prompts en ingles, chino y frances.
- Manejo de prompts largos y descriptivos con multiples restricciones (texto renderizado, composicion, estilo, iluminacion).
- Soporte de bounding boxes espaciales para control de composicion en la generacion.
- Compatibilidad con adaptadores de destilacion de pasos (DMD) de la comunidad, como `lodestones-8step` y `darask0-4step`.
- No soporta tool calling, function calling ni comportamiento agentico: es un modulo de encoding, no un modelo conversacional.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Generacion de imagenes local en Macs de 16 GB: el caso principal. Sustituye al codificador BF16 para que el pipeline completo (text encoder + DiT de ~10 GB + VAE) quepa en memoria unificada y se ejecute en GPU Metal en lugar de CPU.
- Prototipado de prompts en portatiles Apple: permite iterar sobre descripciones de imagen con latencia de ~4 s en caliente por prompt, sin depender de servicios en la nube.
- Renderizado de texto dentro de imagen: los ejemplos de la model card incluyen carteles con texto legible ("MOSS Image", "ALPINE LAKES"), util para generar mockups de carteles, posters y etiquetas de producto.
- Fotografia de producto sintetica: el ejemplo de la zapatilla sobre pedestal con fondo neutro demuestra uso en catalogos de e-commerce con iluminacion controlada.
- Ilustracion editorial y botanica: la lamina vintage de Bryophyta muestra aplicacion en publicaciones que requieren estilos graficos historicos coherentes.
- Investigacion sobre cuantizacion de codificadores de difusion: sirve como referencia reproducible de cuantizacion mixta (8-bit + bf16 selectivo) con metrica de fidelidad coseno frente al original.
- Desarrollo de runtimes alternativos: el repo DiffusionBear usa este modelo como banco de pruebas para optimizaciones Metal en Apple Silicon.

## Benchmarks y rendimiento

Datos publicados en la model card, medidos en un MacBook Pro M1 con 16 GB de memoria unificada:

| Metrica | BF16 original | Esta conversion MLX Q8-G64 |
|---|---|---|
| Memoria pico del text encoder | ~19 GB | 10 GB |
| Tiempo de encoding (frio) | ~61 s (fallback CPU PyTorch) | 17 s |
| Tiempo de encoding (caliente) | no disponible | ~4 s |
| Similitud coseno vs BF16 | referencia | 0,9995 |

Tiempos de generacion de imagen completa con este codificador (M1, 16 GB):

| Configuracion | Resolucion | Pasos | Tiempo |
|---|---|---|---|
| Modelo stock, CFG Euler | 1024x1024 | 50 | 7.525,2 s (~2 h 05 min) |
| DMD `lodestones-8step` | 768x768 | 8 | 825,1 s (~13 min 45 s) |
| DMD `darask0-4step` | 512x768 | 4 | 464,1 s (~7 min 44 s) |
| DMD `darask0-4step` | 1024x1024 | 4 | 497,9 s (~8 min 18 s) |

No se han publicado resultados de benchmarks de razonamiento o lenguaje (MMLU, HumanEval, GSM8K) en la informacion disponible, lo cual es coherente con la naturaleza del modelo como codificador.

## Requisitos de hardware

- Memoria: 10 GB de pico para el codificador cuantizado; el pipeline completo con DiT y VAE requiere al menos 16 GB de memoria unificada.
- GPU verificada: Apple M1 con 16 GB (MacBook Pro). No hay datos publicados para M2, M3, M4 ni chips Pro/Max/Ultra.
- No esta pensado para GPUs NVIDIA ni CUDA: el formato es MLX y depende de Metal.
- Cabe en Macs de consumo con 16 GB; en equipos de 8 GB no hay margen para el pipeline completo.
- Despliegue: libreria `mlx` y el runtime DiffusionBear (GitHub `OuincheWinch/DiffusionBear`, version v0.4.0). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 17 s en frio y ~4 s en caliente por prompt de encoding; la generacion de imagen domina el tiempo total (de ~8 min con DMD 4 pasos a ~2 h con 50 pasos stock).

## Comparativa con modelos similares

| Modelo | Parametros | Formato / hardware | Memoria | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (MLX Q8-G64) | 7,94 B | MLX, Apple Silicon | 10 GB pico | Apache 2.0 | Similitud coseno 0,9995 vs BF16 |
| OpenMOSS-Team/MOSS-Image-SFT (text encoder BF16) | 7,94 B | BF16, generico | ~19 GB | Apache 2.0 | Referencia de calidad; no cabe en 16 GB junto al pipeline |
| Codificadores T5/CLIP usados en difusion | no disponible | safetensors, CUDA/CPU | variable | variable | No comparable en arquitectura hibrida DeltaNet |

No se dispone de datos de benchmarks comparativos con otros codificadores de texto para difusion en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje general: no responde preguntas ni mantiene conversaciones; solo produce embeddings para el pipeline de difusion.
- La cuantizacion introduce una desviacion minima (coseno 0,9995) pero no nula; en prompts muy sensibles podria haber diferencias perceptibles en la imagen generada.
- Solo se documentan los idiomas en, zh y fr; el rendimiento en castellano no esta verificado.
- Los tiempos de generacion publicados son muy altos en el modelo stock (mas de 2 horas por imagen a 1024x1024 y 50 pasos en M1); el uso practico depende de adaptadores DMD de la comunidad.
- Los adaptadores DMD (`lodestones-8step`, `darask0-4step`) son de terceros y no forman parte del repo; su calidad y mantenimiento no estan garantizados.
- Solo probado en M1 de 16 GB; no hay validacion en otros chips Apple ni en configuraciones con menos memoria.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base MOSS-Image-SFT deben verificarse por separado.
- Riesgo de sesgos y alucinacion visual heredado del modelo base; no evaluado en esta conversion.

## Enlaces

- Hugging Face: https://huggingface.co/Ouinche/moss-image-qwen3.5-te-mlx-q8g64
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Repositorio DiffusionBear: https://github.com/OuincheWinch/DiffusionBear
- Web del proyecto: https://www.diffusionbear.com
- X del proyecto: https://x.com/DiffusionBear
