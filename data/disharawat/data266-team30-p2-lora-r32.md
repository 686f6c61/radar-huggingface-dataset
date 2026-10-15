# DishaRawat/data266-team30-p2-lora-r32

## Resumen

El modelo `DishaRawat/data266-team30-p2-lora-r32` es un adaptador LoRA (Low-Rank Adaptation) para generación de imágenes texto-a-imagen, desarrollado por DishaRawat en el marco de la asignatura DATA 266 (Lab 2, equipo 30). No se trata de un modelo autónomo: es un ajuste fino de bajo rango que se carga sobre `stable-diffusion-v1-5/stable-diffusion-v1-5` y desplaza el estilo de generación hacia ilustración de tipo anime con rasgos asociados al universo de Naruto. Resuelve el problema clásico de especialización estilística sin necesidad de reentrenar el UNet completo, con un coste de entrenamiento de 0,117 GPU-horas en una NVIDIA GeForce RTX 4090.

El adaptador tiene rango 32 con alpha 32 y 6.377.472 parámetros entrenables, aplicados exclusivamente a las proyecciones de atención del UNet (`to_k`, `to_q`, `to_v`, `to_out.0`). Se entrenó durante 1000 pasos con AdamW (lr 0,0001, scheduler coseno, 50 pasos de warm-up), batch efectivo 2×2 y autocast en fp16, partiendo de 1099 imágenes de entrenamiento del conjunto `lambdalabs/naruto-blip-captions` y reservando 122 imágenes de test (split 90/10, semilla 266).

Su relevancia es sobre todo metodológica y educativa: incluye una comparativa controlada frente al modelo base y frente a una variante de rango 4 (`lora-r4`), con métricas objetivas (KID, CLIP score, LPIPS) obtenidas con DPMSolver++ a 30 pasos y CFG 7,5. Es un ejemplo reproducible de ajuste estilístico barato, no un modelo orientado a producción comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de difusión (latent diffusion text-to-image); rango 32, alpha 32, módulos `to_k`, `to_q`, `to_v`, `to_out.0` |
| Parámetros totales | 6.377.472 parámetros entrenables del adaptador; parámetros del modelo base `stable-diffusion-v1-5`: no disponibles en la información proporcionada |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen); el codificador de texto CLIP del modelo base trunca la indicación a 77 tokens |
| Tipos de cuantización | no se publican variantes cuantizadas propias; los pesos LoRA se distribuyen en `safetensors` y se combinan con el modelo base en fp16 |
| Idiomas soportados | no disponible; las leyendas BLIP del conjunto de entrenamiento están en inglés, por lo que se recomienda usar indicaciones en inglés |
| Licencia | CreativeML OpenRAIL-M (con restricciones adicionales por datos de entrenamiento con personajes con copyright; solo investigación y educación no comercial) |
| Formato de pesos | safetensors (`pytorch_lora_weights.safetensors`) |
| Resolución nativa | 512 × 512 |
| Librería | diffusers |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El adaptador se inyecta en el UNet de Stable Diffusion 1.5 mediante LoRA de rango 32, con alpha 32, restringido a las proyecciones de atención `to_k`, `to_q`, `to_v` y `to_out.0`. Esta elección concentra la capacidad de adaptación en el mecanismo de atención, que es donde reside buena parte del control de estilo y composición, y mantiene congelado el resto del modelo. El resultado son 6.377.472 parámetros entrenables, un volumen mínimo comparado con el modelo base, lo que explica la huella de almacenamiento de 0,1 GB.

Los datos provienen de `lambdalabs/naruto-blip-captions`: 1099 imágenes tras eliminar duplicados y ficheros corruptos, con leyendas automáticas generadas por BLIP. El entrenamiento usó AdamW con learning rate 0,0001, scheduler coseno y 50 pasos de warm-up, 1000 pasos con batch 2 y acumulación de gradiente 2, autocast fp16 y semilla 266. Consumió 0,117 GPU-horas en una RTX 4090 con un pico de memoria de 4,05 GB. No consta uso de RLHF ni DPO, ni innovaciones de decodificación (no hay decodificación especulativa ni atención lineal): la innovación relevante es la comparación sistemática entre rangos LoRA (r4 frente a r32) sobre las mismas condiciones de evaluación.

## Capacidades

- Generación de imágenes texto-a-imagen en estilo ilustración anime, condicionada por indicaciones textuales en inglés.
- Transferencia de estilo a partir de un conjunto de entrenamiento pequeño (1099 imágenes), sin reentrenar el modelo base.
- Composición de la adaptación con el modelo base mediante `pipe.load_lora_weights(...)`, con posibilidad de escalar el peso del adaptador si la librería lo permite.
- Reproducción de rostros frontales de tipo anime y paletas cálidas (naranjas, rubios) heredadas del conjunto de Naruto.
- Integración en flujos `diffusers`, incluida la combinación con otros adaptadores LoRA si el pipeline lo soporta.
- No dispone de tool calling, function calling, modo de razonamiento, capacidades de agente, visión de entrada, audio ni procesamiento multilingüe: es exclusivamente un generador de imágenes a partir de texto.
- No se documentan capacidades de edición, inpainting, controlnet ni generación condicionada por imagen.

## Casos de uso

- Prototipado de estilo anime en investigación: cargar el adaptador sobre SD 1.5 en un cuaderno de `diffusers` para estudiar cómo varía el estilo con el escalado del peso LoRA, sin coste de entrenamiento adicional.
- Docencia de ajuste fino eficiente: usar este repositorio como caso de referencia para explicar LoRA en un UNet de difusión, con hiperparámetros, coste en GPU-horas y métricas completas.
- Estudio comparativo de rangos LoRA: el par `lora-r4` / `lora-r32` permite analizar el compromiso entre fidelidad al dominio (KID) y diversidad (LPIPS) en un mismo conjunto de datos.
- Generación de bocetos conceptuales no comerciales: producir referencias visuales de personajes con estética anime para exploración creativa interna, asumiendo las restricciones de licencia.
- Evaluación de métricas generativas: emplear el conjunto de 122 imágenes de test y las 20 indicaciones del informe para reproducir el cálculo de KID, CLIP score y LPIPS y contrastar implementaciones.
- Pruebas de seguridad y filtrado: validar el comportamiento del comprobador de seguridad de Stable Diffusion sobre salidas de un adaptador estilístico, dado que el autor indica que las salidas se filtraron con dicho comprobador.
- Integración en interfaces de demostración: desplegar un espacio o una API interna con SD 1.5 más este LoRA para experimentación, siempre en ámbito no comercial.

## Benchmarks y rendimiento

Resultados publicados por el autor: 20 indicaciones × semillas 0/1, DPMSolver++ con 30 pasos y CFG 7,5.

| Modelo | KID en dominio (menor es mejor) | CLIP score (mayor es mejor) | Diversidad LPIPS (mayor es mejor) |
|---|---|---|---|
| base | 0,0936 ± 0,0130 | 32,28 | 0,816 |
| lora-r4 | 0,0521 ± 0,0100 | 31,55 | 0,799 |
| lora-r32 | 0,0331 ± 0,0074 | 31,25 | 0,811 |

El autor indica que se realizó una comparación humana ciega frente al modelo base, cuyos resultados se detallan en el informe, no incluido en la información disponible. No se han publicado otros resultados de benchmarks (FID, precisión, evaluaciones automáticas adicionales) en la información disponible, y el propio autor advierte que el KID se calcula sobre solo 20 imágenes generadas y es ruidoso.

## Requisitos de hardware

- VRAM del adaptador: despreciable por sí mismo (6,4 M de parámetros); el consumo lo determina íntegramente el modelo base `stable-diffusion-v1-5`.
- VRAM de inferencia del pipeline completo: no disponible de forma explícita en la información proporcionada; como referencia, el pico de memoria durante el entrenamiento en fp16 fue de 4,05 GB en una RTX 4090.
- GPU utilizadas en el desarrollo: NVIDIA GeForce RTX 4090 (0,117 GPU-horas de entrenamiento).
- Compatibilidad con GPU de consumo: viable en tarjetas con al menos la VRAM suficiente para SD 1.5 en fp16; no se documentan cifras exactas de VRAM mínima en el repositorio.
- Opciones de despliegue: `diffusers` (uso documentado en la model card), y de forma indirecta cualquier entorno que cargue SD 1.5 más pesos LoRA (por ejemplo, interfaces compatibles con LoRA de Stable Diffusion). No se documentan despliegues con vLLM, TGI, llama.cpp ni Ollama, que no aplican a modelos de difusión en este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Comparación con las variantes evaluadas por el propio autor y con el modelo base, que es la referencia directa:

| Modelo | Parámetros entrenables | Resolución | KID en dominio (menor mejor) | CLIP score | Licencia |
|---|---|---|---|---|---|
| stable-diffusion-v1-5 (base) | no aplica (modelo completo) | 512 × 512 | 0,0936 | 32,28 | CreativeML OpenRAIL-M |
| data266-team30-p2-lora-r4 | no disponible | 512 × 512 | 0,0521 | 31,55 | CreativeML OpenRAIL-M |
| data266-team30-p2-lora-r32 | 6.377.472 | 512 × 512 | 0,0331 | 31,25 | CreativeML OpenRAIL-M |

No se dispone de comparaciones con otros adaptadores LoRA de estilo anime de la comunidad (por ejemplo, los publicados en Civitai o en agregadores como loraai.io) porque no hay métricas homogéneas publicadas en la información disponible.

## Limitaciones y advertencias

- Las leyendas BLIP son genéricas y no contienen nombres de personajes, por lo que no es posible solicitar personajes concretos por nombre.
- El adaptador arrastra indicaciones fuera de dominio y con múltiples personajes hacia rostros únicos de anime, lo que degrada la variedad compositiva.
- Los datos de entrenamiento están sesgados hacia personajes masculinos, según reconoce el autor.
- El KID se calcula sobre solo 20 imágenes generadas, por lo que la métrica es ruidosa y no debe tomarse como estimación estable.
- Riesgo de alucinación visual y de artefactos anatómicos propio de SD 1.5, agravado por un conjunto de entrenamiento reducido.
- Las imágenes de entrenamiento son personajes de Naruto con copyright, por lo que el uso queda restringido a investigación y educación no comercial; se aplican además las restricciones de uso de CreativeML OpenRAIL-M.
- Las salidas se filtraron con el comprobador de seguridad de Stable Diffusion, pero no se garantiza que el filtrado elimine todo contenido problemático en producción.
- El repositorio no registra descargas ni «likes» y tiene un tamaño de 0,1 GB; no hay señales de mantenimiento posterior a octubre de 2026.
- No hay información sobre comportamiento multilingüe: las indicaciones en inglés son la opción segura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DishaRawat/data266-team30-p2-lora-r32
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Librería diffusers: https://github.com/huggingface/diffusers
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Referencia genérica sobre adaptadores LoRA (no específica de este modelo): https://huggingface.co/models?search=lora
- Herramienta de gestión de conjuntos de datos y entrenamiento de LoRA (no específica de este modelo): https://github.com/perfectgf/lora-dataset-studio
- Directorio de LoRAs de la comunidad (no específico de este modelo): https://loraai.io/loras
- Repositorio de LoRAs en Civitai (no específico de este modelo): https://civitai.com/tag/lora
