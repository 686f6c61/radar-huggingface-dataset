# Nikithasb/data266-lab2-team03-lora-rank4

## Resumen

`Nikithasb/data266-lab2-team03-lora-rank4` es un adaptador LoRA de rango 4 entrenado sobre el UNet de Stable Diffusion 1.5 para generación de imágenes texto-a-imagen. Lo desarrolla el equipo Pair_Programming_Team_03 (Nikitha y Yash) en el contexto de la asignatura DATA 266, con fines exclusivamente docentes. No es un modelo de lenguaje: es un adaptador PEFT de 797.184 parámetros entrenables que modifica el comportamiento del UNet del modelo base para acercarlo al estilo y contenido de un conjunto de datos de Pokémon.

El adaptador se entrenó sobre `reach-vb/pokemon-blip-captions` (750 filas de entrenamiento) durante 1.200 pasos con AdamW, learning rate 1e-4, batch size 1 y semilla 266. El entrenamiento completo consumió 0,0745 horas de GPU (268,1 segundos) con un pico de 6,28 GB de VRAM en una RTX 5080 Laptop de 16 GB, lo que lo convierte en un experimento de bajo coste reproducible en hardware de consumo.

Su relevancia es metodológica más que de producto: el propio autor documenta que la mejora frente al modelo base es marginal (CLIP 0,3254 frente a 0,3207 en la prueba de retención de 10 captions, una diferencia de +0,0047, por debajo del umbral de 0,01 que se habían fijado). La ficha resulta útil como referencia de cómo se comporta un ajuste fino LoRA de rango muy bajo en un dataset pequeño y de dominio estrecho.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre el UNet de Stable Diffusion 1.5 (difusión latente, transformer convolucional) |
| Parámetros totales | 797.184 parámetros entrenables en el adaptador (el modelo base SD 1.5 no se incluye en el repo) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; resolución de generación 512 px) |
| Tipos de cuantización | no disponible (pesos del adaptador en safetensors; el modelo base admite fp16 y cuantizaciones de diffusers) |
| Idiomas soportados | no disponible (los prompts del entrenamiento están en inglés) |
| Licencia | other (uso no comercial, exclusivamente para el curso) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA / alpha | 4 / 4 |
| Dropout | 0 |
| Módulos objetivo | `to_q`, `to_k`, `to_v`, `to_out.0` |
| Modelo base | `stable-diffusion-v1-5/stable-diffusion-v1-5` |
| Tamaño del repo | 0,0 GB |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 4 con alpha 4 y dropout 0 aplicado a las proyecciones de atención del UNet de Stable Diffusion 1.5: `to_q`, `to_k`, `to_v` y `to_out.0`. Esto suma 797.184 parámetros entrenables, una fracción mínima del UNet completo, y permite cargar el adaptador con `peft.PeftModel.from_pretrained` sobre el UNet sin modificar los pesos originales. El pipeline de referencia es `diffusers.StableDiffusionPipeline` en fp16.

El entrenamiento usó el dataset `reach-vb/pokemon-blip-captions` con 750 filas, optimizador AdamW, learning rate 1e-4, batch size 1, 1.200 pasos y semilla 266. El autor documenta una sonda de 200 pasos en la que la loss subió de 0,0062 en el paso 0 a 0,3134 en el paso 100. También se probaron una variante de rango 16 (3.188.736 parámetros, 1.200 pasos) y una de rango 4 con 4.000 pasos; ambas obtuvieron puntuaciones CLIP inferiores a este checkpoint en la prueba de retención, por lo que se conservó la configuración de 1.200 pasos y rango 4. No se documenta uso de RLHF, DPO ni decodificación especulativa; es un ajuste supervisado directo sobre pares imagen-caption.

## Capacidades

- Generación de imágenes texto-a-imagen a 512 px sobre Stable Diffusion 1.5, con prompts en inglés.
- Especialización estilística y de contenido hacia el dominio Pokémon (personajes, criaturas y estética de las captions de entrenamiento).
- Modificación selectiva de la atención del UNet mediante LoRA, sin alterar el VAE ni el text encoder.
- Compatible con el ecosistema `diffusers` + `peft` para carga y composición con otros adaptadores.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de difusión, no un LLM.
- No dispone de modo thinking, visión de entrada ni audio.
- Capacidades multilingües: no disponibles; el entrenamiento se hizo con captions en inglés.

## Casos de uso

- Docencia y reproducibilidad de ajuste fino: sirve como ejemplo mínimo de entrenamiento LoRA (0,0745 GPU-horas, 6,28 GB de pico) para enseñar el flujo completo de PEFT sobre diffusers en una sola GPU de consumo.
- Generación de ilustraciones de criaturas estilo Pokémon para prototipos y material de clase, usando prompts descriptivos en inglés con 30 pasos y guidance 7.5.
- Comparación controlada de hiperparámetros: el autor deja documentadas las variantes de rango 16 y de 4.000 pasos, lo que permite reproducir el estudio de ablación sobre rango y duración del entrenamiento.
- Evaluación de métricas de generación (CLIP, LPIPS, KID) en un entorno pequeño y acotado, como ejercicio práctico de medición de calidad en modelos generativos.
- Estudio de olvido catastrófico y deriva de dominio: al entrenar sobre 750 captions de un dominio estrecho, permite analizar cuánto se degrada el comportamiento fuera de dominio (el autor indica que no mejora de forma apreciable los prompts fuera de dominio).
- Base para experimentos de composición de adaptadores: al ser un LoRA PEFT estándar, se puede combinar con otros adaptadores de SD 1.5 para estudiar mezclas de estilos.

## Benchmarks y rendimiento

| Prueba | Modelo base | Este adaptador | Rank 16 | Rank 4, 4.000 pasos |
|---|---|---|---|---|
| CLIP retenido (10 captions, seed 0, 30 pasos) | 0,3207 | 0,3254 | 0,3172 | 0,3191 |
| CLIP (120 imágenes, 20 prompts, seeds 0 y 1) | 0,3088 | 0,3109 | no disponible | no disponible |
| LPIPS (120 imágenes) | 0,7569 | 0,7348 | no disponible | no disponible |
| KID (120 imágenes) | 0,0868 | 0,0707 | no disponible | no disponible |
| NSFW (120 imágenes) | 1 | 0 | no disponible | no disponible |

Evaluación humana: tres personas compararon 25 pares barajados entre este adaptador y el modelo base. El adaptador ganó 45 de 75 votos en coincidencia con el prompt (60%) y 39 de 75 en estilo Pokémon (52%). El propio autor señala que ninguna ejecución superó una ganancia CLIP de 0,01 y que el adaptador no sigue prompts fuera de dominio de forma claramente mejor que el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento requirió 6,28 GB de pico en una RTX 5080 Laptop de 16 GB; la inferencia en fp16 a 512 px con SD 1.5 se sitúa en el rango de 4-6 GB, aunque el autor no publica una medición específica de inferencia.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 a 512 px; RTX 5080 Laptop (16 GB) es la referencia documentada del entrenamiento. A100 y H100 son sobredimensionadas para este adaptador.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 4070, RTX 5080, entre otras).
- Opciones de despliegue: `diffusers` + `peft` en Python (flujo documentado por el autor). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión.
- Latencia y throughput: no disponibles. El único dato temporal es el del entrenamiento (268,1 segundos para 1.200 pasos con batch size 1).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros entrenables | Base | Licencia | Mejora documentada |
|---|---|---|---|---|---|
| Este adaptador (rank 4, 1.200 pasos) | LoRA sobre UNet SD 1.5 | 797.184 | SD 1.5 | other (no comercial) | CLIP +0,0047 sobre base |
| Variante rank 16 del mismo equipo | LoRA sobre UNet SD 1.5 | 3.188.736 | SD 1.5 | other (no comercial) | CLIP 0,3172 (inferior al rank 4) |
| Variante rank 4, 4.000 pasos | LoRA sobre UNet SD 1.5 | 797.184 | SD 1.5 | other (no comercial) | CLIP 0,3191 (inferior al de 1.200 pasos) |
| Stable Diffusion 1.5 (modelo base) | Difusión latente completa | no aplica | — | CreativeML OpenRAIL-M | Referencia CLIP 0,3207 |

No se dispone de comparación con adaptadores LoRA de terceros para Pokémon en la información proporcionada.

## Limitaciones y advertencias

- Licencia `other` con restricción explícita a uso no comercial y exclusivamente para el curso; no apto para producción.
- Los personajes de Pokémon y Naruto presentes en las captions de entrenamiento están sujetos a copyright.
- Riesgo de reproducción de contenido de entrenamiento: el vecino más cercano de una imagen generada alcanzó una similitud CLIP de 0,903 (un Pikachu generado frente a uno del entrenamiento, con pose y fondo distintos).
- La mejora frente al modelo base es marginal (CLIP +0,0047, por debajo del umbral de 0,01 del propio equipo) y no se traduce en mejor seguimiento de prompts fuera de dominio.
- El filtro NSFW es el checker por defecto de Stable Diffusion; el autor advierte que marcar cero imágenes en su lista de prompts no constituye una garantía de seguridad.
- Dataset de entrenamiento muy pequeño (750 filas) y de dominio estrecho, con prompts en inglés; el comportamiento multilingüe no está evaluado.
- Sin datos publicados sobre sesgos demográficos, toxicidad o robustez adversarial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso externo ni mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/Nikithasb/data266-lab2-team03-lora-rank4
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/reach-vb/pokemon-blip-captions
- Librería PEFT: https://github.com/huggingface/peft
- Librería diffusers: https://github.com/huggingface/diffusers
