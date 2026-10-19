# jyohukuchan/Qwen-Image-2.1-Turbo-EXL3

## Resumen

Qwen-Image-2.1-Turbo-EXL3 es una cuantización comunitaria del checkpoint Qwen-Image-2.1-Turbo de Alibaba Qwen, publicada por el usuario jyohukuchan. No se trata de un modelo nuevo ni de una conversión oficial: es una redistribución de los pesos del DiT (Diffusion Transformer) del modelo base en formato EXL3, un esquema de cuantización por bloques de capas Linear, manteniendo en alta precisión un conjunto reducido de tensores. El repositorio ofrece tres anchos de bits (3, 4 y 5) con 224 capas Linear cuantizadas cada uno.

El modelo base es un modelo unificado de generación texto-a-imagen y edición de imágenes de la familia Qwen, con aproximadamente 7B de parámetros en su componente de generación visual (32 capas Single-Stream DiT). La variante Turbo es un checkpoint acelerado que reduce el muestreo a 8 pasos de denoising con CFG 1 y caché KV de prefijo, lo que rebaja el coste de inferencia frente al modelo no acelerado.

La relevancia de esta conversión es acotada y muy específica: permite ejecutar el DiT cuantizado en un único acelerador AMD Radeon AI PRO R9700 de 32 GB mediante el motor rocm_exl3_forme, algo que el checkpoint BF16 original no permite con la misma holgura de VRAM. A cambio, exige un stack ROCm concreto, no es compatible con Diffusers `from_pretrained()`, GGUF, NF4 ni Nunchaku, y su licencia restringe el uso a investigación y evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT de un solo flujo, 32 capas Single-Stream (modelo base); 224 capas Linear cuantizadas en EXL3 |
| Parámetros totales | ~7B en el componente de generación visual (DiT) del modelo base; total con text encoder y VAE no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de difusión; no se documenta longitud máxima de prompt) |
| Tipos de cuantización | EXL3 de 3, 4 y 5 bits (bpw efectivo 3,254020 / 4,234933 / 5,215846) |
| Idiomas soportados | en, zh, ja |
| Licencia | Qwen Research License Agreement (2026-09-20); solo investigación y evaluación, uso comercial requiere licencia upstream separada |
| Formato de pesos | safetensors con cuantización EXL3 personalizada (no es GGUF, NF4 ni Nunchaku, ni un directorio Diffusers estándar) |
| Pipeline | text-to-image (con soporte de edición mediante imágenes de referencia) |
| Tamaño del repositorio | 10,8 GB (incluye las tres variantes de bits) |
| Tamaño por variante | 3bit: 2,894286 GB; 4bit: 3,766701 GB; 5bit: 4,639116 GB (GB decimales, incluyen metadatos) |
| Componentes no incluidos | Text encoder y VAE, que permanecen en BF16 y se descargan del modelo upstream fijado |
| Hardware validado | 1× Radeon AI PRO R9700 32 GB (gfx1201) |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1 es un modelo unificado de generación y edición de imágenes construido sobre un DiT de 32 capas Single-Stream con unos 7B de parámetros en el componente visual. La variante Turbo reutiliza esa misma arquitectura y añade un muestreo acelerado: ocho sigmas guardados, CFG 1 y caché KV de prefijo, de modo que la generación se resuelve en 8 pasos de denoising sin pasar el número de pasos por línea de comandos. El pipeline asociado en Diffusers es `QwenImage21Pipeline`.

Esta publicación no entrena nada: aplica cuantización EXL3 por bloques sobre las 224 capas Linear del DiT, conserva un conjunto de tensores en alta precisión y publica un `quantization.json` con sumas de comprobación. El bpw efectivo incluye las escalas y los tensores retenidos, por lo que no coincide con el número nominal de bits de las capas Linear. No se documentan en la información disponible ni el volumen de tokens de entrenamiento, ni la composición del dataset, ni si hubo RLHF o DPO sobre el modelo base.

La innovación técnica relevante aquí es de despliegue, no de modelado: llevar un DiT de difusión a un motor EXL3 sobre ROCm, con el DiT residente en GPU, el text encoder BF16 en streaming desde RAM de CPU y VAE con teselado de 256 px y stride de 192 px. La fidelidad de la cuantización se mide con NMSE relativo al BF16 del propio modelo, una métrica de error de predicción del DiT, no de calidad perceptual.

## Capacidades

- Generación de imágenes texto-a-imagen con el pipeline Turbo de 8 pasos, CFG 1 y caché KV de prefijo.
- Edición de imágenes: el CLI acepta una o varias imágenes de referencia (`--images reference.png`) junto a un prompt de edición.
- Prompts multilingües en inglés, chino y japonés (los tres idiomas declarados en la model card).
- Salida a 1024×1024 documentada en el ejemplo oficial; otras resoluciones no se detallan en la información disponible.
- Soporte de RGBA y de embeddings de prompt cacheados, según la guía del motor.
- Reutilización de los componentes BF16 del upstream (text encoder, VAE, scheduler, processor) mediante una revisión fijada, sin necesidad de los pesos densos del transformer.
- No soporta tool calling ni function calling: es un modelo de difusión, no un LLM.
- No se documentan capacidades de agente, razonamiento multi-paso, audio, vídeo ni modo de pensamiento.

## Casos de uso

- Investigación en generación de imágenes sobre GPU AMD: es el único escenario validado por el autor, con una R9700 de 32 GB y ROCm 7.2.4 o superior; sirve para estudiar el comportamiento de DiT cuantizados en hardware que el ecosistema CUDA no cubre.
- Edición de imágenes por prompt con referencias múltiples: pasando una o varias rutas en `--images`, el modelo puede usarse en experimentos de retoque guiado por texto y composición de escenas, útil para prototipar flujos de edición antes de invertir en el checkpoint BF16.
- Estudio del compromiso calidad/VRAM entre 3, 4 y 5 bits: las tres variantes publicadas permiten medir el impacto de la cuantización con NMSE sobre el mismo conjunto de prompts y semillas, con `report.json` como salida reproducible.
- Liberar VRAM en un nodo ROCm existente: sustituir el DiT BF16 por el EXL3 de 5 bits (4,64 GB) deja margen en una GPU de 32 GB para el text encoder en streaming y para el teselado del VAE, manteniendo el resto del pipeline upstream intacto.
- Generación de material gráfico con prompts en chino o japonés: los tres idiomas declarados permiten producir ilustraciones y escenas descritas en esos idiomas sin traducir previamente, algo útil en documentación o contenidos localizados.
- Reproducibilidad y docencia: semilla fija (el ejemplo usa `--seed 1703`), revisión `exl3-v1` y sumas de comprobación en `quantization.json` permiten montar prácticas o experimentos que otro grupo puede repetir exactamente.
- Evaluación comparativa de motores de cuantización: al no ser GGUF, NF4 ni Nunchaku, sirve como referencia para contrastar EXL3 frente a otros esquemas sobre el mismo modelo base, siempre dentro del alcance de investigación de la licencia.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de calidad de imagen (FID, CLIPScore, GenEval u otros). El único dato numérico es el NMSE relativo al BF16 del propio modelo, que mide fidelidad de las predicciones del DiT y **no** calidad perceptual ni porcentaje de calidad preservada.

| Variante | Bits de Linear | bpw efectivo del DiT | Tamaño safetensors (GB) | NMSE relativo a BF16 |
|---|---:|---:|---:|---:|
| 3bit | 3 | 3,254020 | 2,894286 | 0,003792089 |
| 4bit | 4 | 4,234933 | 3,766701 | 0,001894632 |
| 5bit | 5 | 5,215846 | 4,639116 | 0,000219289 |

El autor selecciona 5 bits como la variante de menor NMSE en su conjunto de test fijo. No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K y similares) en la información disponible, ni tienen sentido para un modelo de difusión.

## Requisitos de hardware

- VRAM del DiT: entre 2,89 GB (3 bits) y 4,64 GB (5 bits) para el transformer cuantizado; el text encoder BF16 se ejecuta en streaming desde RAM de CPU, por lo que se necesita RAM de sistema suficiente (cantidad no documentada).
- Memoria adicional: VAE con teselado de 256 px y stride de 192 px, más los componentes BF16 descargados del upstream.
- GPU validada: una única Radeon AI PRO R9700 de 32 GB (gfx1201). Es el único hardware confirmado por el autor.
- GPUs no validadas: cualquier GPU NVIDIA/CUDA, V620 y configuraciones multi-GPU para inferencia de imagen no se validaron en esta release.
- Encaje en GPU de consumo: por VRAM el checkpoint cabe holgadamente, pero el motor solo se ha probado en gfx1201 y requiere ROCm ≥ 7.2.4, por lo que no hay confirmación de funcionamiento en otras arquitecturas.
- Stack de software medido: Python 3.12, PyTorch 2.12.0+rocm7.2, compilador HIP 7.14.60850, Transformers 5.17.0, Accelerate 1.15.0, safetensors 0.8.0 y Diffusers en el commit `b800f828f3951c4d206e154411bcbfa693cd322e`.
- Opciones de despliegue: exclusivamente el motor rocm_exl3_forme (commit `37847ec9949aaf30fcf72ad6679da78968857d7a`) con su CLI de Qwen Image. No es compatible con vLLM, llama.cpp, Ollama, TGI ni Diffusers `from_pretrained()`, y el repositorio no está configurado para inferencia alojada en Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada. El muestreo se fija en 8 pasos, CFG 1 y caché KV de prefijo; no debe pasarse `--steps`.

## Comparativa con modelos similares

| Modelo | Parámetros | Pasos de muestreo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Turbo-EXL3 (esta ficha) | ~7B (DiT) | 8 (fijos) | EXL3 3/4/5 bits, motor ROCm propio | Qwen Research (no comercial) | Repositorio comunitario, 0 descargas, 1 like; validado solo en R9700 |
| Qwen-Image-2.1-Turbo (BF16, upstream) | ~7B (DiT) | 8 | Diffusers / safetensors BF16 | no disponible en la información proporcionada | Oficial en Hugging Face y ModelScope |
| Qwen-Image-2.1 (no Turbo, upstream) | ~7B (DiT, 32 capas Single-Stream) | no disponible | Diffusers / safetensors | no disponible en la información proporcionada | Oficial en Hugging Face y GitHub |
| Otras cuantizaciones del mismo base (GGUF, NF4, Nunchaku) | ~7B (DiT) | no disponible | no disponible | no disponible | no documentadas en la información disponible |

No se dispone de datos en la información proporcionada para comparar con familias distintas (FLUX, Stable Diffusion u otras); cualquier cifra al respecto sería inventada.

## Limitaciones y advertencias

- Licencia restrictiva: Qwen Research License Agreement (2026-09-20), solo para investigación y evaluación. Cualquier uso comercial requiere una licencia upstream separada. La licencia MIT del motor de inferencia no sustituye a la del modelo.
- Conversión no oficial: es una publicación de terceros, sin validación independiente, con 0 descargas y 1 like en el momento de la ficha. No debe presentarse como release de Qwen.
- Compatibilidad muy estrecha: no funciona con Diffusers estándar, GGUF, NF4 ni Nunchaku, ni con vLLM, llama.cpp, Ollama o TGI. Requiere el motor rocm_exl3_forme en un commit concreto.
- Hardware sin validar fuera de gfx1201: no hay evidencia de funcionamiento en CUDA, V620, otras GPU AMD ni multi-GPU. El autor advierte explícitamente de no confiar en la compilación JIT automática estilo CUDA sobre ROCm.
- Reproducibilidad del binario: la evaluación reutilizó una extensión compilada para R9700 cuyo commit de build original se desconoce; no se demostró una reconstrucción limpia de ese binario exacto.
- Dependencia del upstream: el text encoder y el VAE no están incluidos y deben descargarse de `Qwen/Qwen-Image-2.1-Turbo` en la revisión `fc13ba1986fcb905854dc8de2f52eee395f49b5b`; un cambio de revisión rompe la reproducibilidad.
- NMSE no es calidad: un NMSE de 0,000219 (5 bits) o 0,003792 (3 bits) indica fidelidad frente al BF16 del propio modelo, no calidad perceptual. No hay métricas de calidad de imagen publicadas.
- Cobertura lingüística limitada a inglés, chino y japonés; el comportamiento con prompts en castellano no está documentado.
- Riesgos heredados del modelo base no documentados en la información disponible: sesgos del dataset original, generación de texto defectuoso dentro de la imagen, artefactos en anatomía o manos y posible contenido inapropiado ante prompts adversarios.
- Longitud de prompt y resoluciones distintas de 1024×1024 no documentadas; el ejemplo oficial solo cubre 1024×1024.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jyohukuchan/Qwen-Image-2.1-Turbo-EXL3
- Revisión fijada del paquete: https://huggingface.co/jyohukuchan/Qwen-Image-2.1-Turbo-EXL3/tree/exl3-v1
- Variantes: https://huggingface.co/jyohukuchan/Qwen-Image-2.1-Turbo-EXL3/tree/main/3bit · https://huggingface.co/jyohukuchan/Qwen-Image-2.1-Turbo-EXL3/tree/main/4bit · https://huggingface.co/jyohukuchan/Qwen-Image-2.1-Turbo-EXL3/tree/main/5bit
- Modelo base (revisión fijada): https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo/tree/fc13ba1986fcb905854dc8de2f52eee395f49b5b
- Modelo base no Turbo: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio GitHub oficial: https://github.com/QwenLM/Qwen-Image-2.1
- ModelScope: https://www.modelscope.cn/models/Qwen/Qwen-Image-2.1-Turbo/summary
- Documentación de Alibaba Cloud Model Studio: https://www.alibabacloud.com/help/en/model-studio/qwen-image-2-1-turbo
- Motor de inferencia (commit fijado): https://github.com/jyohukuchan/rocm_exl3_forme/tree/37847ec9949aaf30fcf72ad6679da78968857d7a
- Guía de inferencia Qwen Image: https://github.com/jyohukuchan/rocm_exl3_forme/blob/37847ec9949aaf30fcf72ad6679da78968857d7a/doc/qwen_image_21_exl3.md
- Entorno de evaluación medido: https://github.com/jyohukuchan/rocm_exl3_forme/blob/37847ec9949aaf30fcf72ad6679da78968857d7a/benchmarks/2026-10-19/qwen-image21-environment.json
