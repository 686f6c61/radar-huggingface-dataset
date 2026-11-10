# 99AnshikaGoel/data266-lab2-part2-run2-lora-rank16

## Resumen

Este repositorio contiene un adaptador LoRA de rango 16 para Stable Diffusion 1.5, entrenado por 99AnshikaGoel como parte de la práctica "Lab 2 Part 2" de la asignatura DATA 266. No es un modelo de lenguaje ni un modelo fundacional: es un adaptador de bajo rango que se acopla a los módulos de atención del UNet de Stable Diffusion 1.5 para especializarlo en la generación de imágenes de estilo anime/Naruto. El adaptador pesa 12,2 MB y entrena únicamente 3.188.736 parámetros, un 0,3696 % del total del modelo base.

El objetivo declarado es puramente educativo y de investigación: demostrar un flujo completo de ajuste fino eficiente en parámetros, comparación controlada entre configuraciones (base, LoRA rango 4 y LoRA rango 16), evaluación cuantitativa con KID, alineamiento CLIP y diversidad LPIPS, además de evaluación humana ciega y cribado de memorización. Se entrenó sobre el dataset `lambdalabs/naruto-blip-captions` (1221 ejemplos, 1098 de entrenamiento y 123 de test retenidos) durante 1000 pasos de optimizador con AdamW, fp16 y checkpointing de gradientes.

Su relevancia es limitada fuera del ámbito docente: no está validado para producción, no declara licencia y las condiciones de uso comercial son inciertas tanto por el adaptador como por el dataset de origen. Aun así, es un ejemplo reproducible y bien documentado de cómo evaluar un LoRA de difusión con métricas estándar y un protocolo de generación congelado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion 1.5 (difusión latente, text-to-image) |
| Parametros totales | 3.188.736 parámetros entrenables en el adaptador (0,369619 % del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; resolución de generación 512 × 512) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite fp16/fp32) |
| Idiomas soportados | no disponible (prompts en inglés en el protocolo de evaluación) |
| Licencia | no disponible |
| Formato de pesos | `pytorch_lora_weights.safetensors` (12,2003 MB) |
| Modelo base | `stable-diffusion-v1-5/stable-diffusion-v1-5` (revisión `451f4fe16113bff5a5d2269ed5ad43b0592e9a14`) |
| Rango / alpha LoRA | 16 / 16 (escala de evaluación 1.0) |
| Módulos objetivo | `to_q`, `to_k`, `to_v`, `to_out.0` |
| Dataset | `lambdalabs/naruto-blip-captions` (revisión `1ed13e8ef280bd45e3bbac4cfa8bbd9d64ec9f89`) |
| Librería | diffusers |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Stable Diffusion 1.5, un modelo de difusión latente con UNet y codificador de texto CLIP. La intervención LoRA se limita a las proyecciones de atención del UNet (`to_q`, `to_k`, `to_v`, `to_out.0`) con rango 16 y alpha 16, lo que congela el resto del modelo base y entrena solo 3,19 M de parámetros. El entrenamiento usó AdamW con learning rate 1e-4, scheduler constante, sin warmup, batch físico 1 con acumulación de gradientes 4 (batch efectivo 4), 1000 pasos de optimizador (4000 exposiciones de muestra, 3,643 épocas equivalentes), precisión mixta fp16 y checkpointing de gradientes, con semilla estocástica 266.

Los datos provienen de `lambdalabs/naruto-blip-captions`, con 1221 ejemplos originales; la auditoría de calidad no eliminó imágenes corruptas, captions inválidas ni duplicados exactos o perceptivos, y se retuvieron los 1221. Un split determinista con semilla 266 produjo 1098 ejemplos de entrenamiento y 123 de test retenidos, excluidos del ajuste. La pérdida de entrenamiento pasó de 0,090991 (media de los primeros 50 pasos) a 0,083833 (media de los últimos 50), con una media global de 0,086895; el autor indica explícitamente que la pérdida no se usa como métrica principal de calidad. La eficiencia medida fue de 56,01 minutos, 0,9336 GPU-horas y 2,5116 GB de memoria GPU pico asignada (2,5703 GB reservada). Frente al LoRA de rango 4, el rango 16 usó 4,0 veces más parámetros entrenables con solo un 1,73 % más de tiempo y GPU-horas y un 1,59 % más de memoria pico.

## Capacidades

- Generación de imágenes texto-a-imagen de estilo anime/Naruto mediante adaptación de dominio de Stable Diffusion 1.5.
- Especialización en el dominio del dataset Naruto BLIP Captions (personajes y escenas de la serie).
- Composición de escenas a partir de prompts en inglés, con soporte de prompts in-domain, out-of-domain y composicionales en el protocolo de evaluación.
- Control de diversidad entre semillas: el protocolo usa semillas [0, 1] y mide diversidad con LPIPS.
- Integración con el pipeline `text-to-image` de diffusers y con el scheduler PNDMScheduler.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de difusión, no un LLM.
- No dispone de modo thinking, visión de entrada, audio ni capacidades multimodales más allá del condicionamiento textual.
- Capacidades multilingües: no disponibles; el protocolo y el dataset están en inglés.

## Casos de uso

- Docencia y prácticas de ajuste fino eficiente: el adaptador sirve como ejemplo reproducible de LoRA sobre difusión, con hiperparámetros, split y métricas documentados para que estudiantes repliquen el experimento.
- Comparación controlada de capacidad LoRA: permite contrastar rango 4 frente a rango 16 con idéntico presupuesto de pasos, learning rate y batch efectivo, midiendo el efecto en KID y alineamiento CLIP.
- Investigación en adaptación de dominio de modelos de difusión: útil para estudiar cómo un adaptador de 12,2 MB desplaza la distribución generada hacia un estilo concreto sin reentrenar el modelo base.
- Evaluación de métricas de generación: el protocolo congelado (512 × 512, PNDMScheduler, 30 pasos, guidance 7.5, 20 prompts, 40 imágenes por modelo) sirve como plantilla para diseñar evaluaciones con KID, CLIP, LPIPS y preferencia humana ciega.
- Cribado de memorización y seguridad: el repositorio documenta filtrado de seguridad activado y análisis de memorización, útil como caso de estudio de buenas prácticas antes de publicar adaptadores.
- Prototipado de ilustración de fan art en entorno controlado: generación de imágenes de temática Naruto para experimentación interna, siempre que se respeten los derechos de la obra original y del dataset.
- No recomendado para producción, aplicaciones comerciales ni entornos de seguridad crítica, según el propio autor.

## Benchmarks y rendimiento

| Métrica | Base | Run 1 rango 4 | Run 2 rango 16 | Dirección |
|---|---:|---:|---:|---|
| KID — in-domain | 0,144058 | 0,089212 | **0,034975** | Menor es mejor |
| CLIP alignment — global | **0,324159** | 0,309442 | 0,312618 | Mayor es mejor |
| LPIPS seed diversity — oficial | **0,752897** | 0,663034 | 0,751837 | Mayor es mejor |

El KID se calculó solo sobre imágenes in-domain, usando como referencia real las 123 imágenes de test retenidas. El Run 2 obtuvo 0,034975 ± 0,005391, frente a 0,089212 del rango 4 y 0,144058 del base. En alineamiento CLIP, el modelo base supera ligeramente a ambos adaptadores (0,324159 frente a 0,312618 del rango 16). En diversidad LPIPS por semilla, el rango 16 (0,751837) queda prácticamente a la par del base (0,752897) y muy por encima del rango 4 (0,663034). El autor advierte que el KID no mide corrección semántica ni calidad percibida por humanos. No se han publicado en la información disponible resultados de benchmarks de texto (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el adaptador añade 12,2 MB de pesos sobre el UNet de SD 1.5, por lo que el requisito dominante es el del modelo base (típicamente varios GB en fp16, según resolución y batch).
- VRAM medida durante el entrenamiento: 2,5116 GB pico asignada y 2,5703 GB pico reservada, con batch físico 1, fp16 y checkpointing de gradientes.
- GPU recomendadas: no disponible en la información proporcionada; no se especifica el modelo de GPU usado en el entrenamiento.
- ¿Cabe en GPU de consumo? No disponible de forma explícita; el adaptador en sí es mínimo y el límite lo marca Stable Diffusion 1.5.
- Opciones de despliegue: pipeline `text-to-image` de diffusers cargando el base y el adaptador LoRA (`pytorch_lora_weights.safetensors`); otras opciones como vLLM, llama.cpp, Ollama o TGI no aplican a un modelo de difusión.
- Latencia y throughput: no disponibles; solo se reporta el coste de entrenamiento (56,01 minutos, 0,9336 GPU-horas).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros entrenables | Contexto / resolución | Métrica clave | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Run 2 rango 16 (este) | LoRA sobre SD 1.5 | 3.188.736 | 512 × 512 | KID in-domain 0,034975 | no disponible | Hugging Face, 0 descargas |
| Run 1 rango 4 | LoRA sobre SD 1.5 | ~1/4 del rango 16 (4,0x menos) | 512 × 512 | KID in-domain 0,089212 | no disponible | Mismo experimento |
| Stable Diffusion 1.5 base | Difusión latente completa | no aplica (modelo completo) | 512 × 512 | KID in-domain 0,144058 | no disponible en esta ficha | Ampliamente disponible |
| Otros LoRA de anime para SD 1.5 | LoRA sobre SD 1.5 | no disponible | 512 × 512 | no disponible | variable | no disponible |

La comparativa relevante es interna al experimento: el rango 16 mejora el KID frente al rango 4 y al base, pero pierde ligeramente en alineamiento CLIP frente al base y queda casi igual en diversidad LPIPS. No se dispone de datos de benchmarks frente a adaptadores de terceros.

## Limitaciones y advertencias

- No validado para producción, uso comercial ni entornos de seguridad crítica, según indica el propio autor.
- Licencia del adaptador no disponible; la ausencia de licencia explícita no implica derechos de redistribución ni de uso comercial.
- El dataset de origen no declara licencia explícita en los metadatos del repositorio fijado; las imágenes provienen de Narutopedia y las captions de BLIP, lo que añade incertidumbre sobre derechos de la obra original.
- Riesgo de sobreajuste al dominio Naruto: el adaptador desplaza la distribución hacia ese estilo y puede degradar la fidelidad a prompts fuera de dominio.
- El alineamiento CLIP es inferior al del modelo base (0,312618 frente a 0,324159), lo que sugiere cierta pérdida de adherencia al prompt.
- El KID bajo no garantiza corrección semántica ni calidad percibida; el autor lo advierte explícitamente.
- Riesgo de memorización del dataset de entrenamiento: se documenta un cribado de memorización, pero no se detallan sus resultados en la información disponible.
- Filtro de seguridad activado en el protocolo de generación, pero no se especifica su comportamiento fuera de él.
- Capacidades multilingües no documentadas; los prompts de evaluación están en inglés.
- Modelo de nicho con 0 descargas y 0 likes; sin validación por parte de la comunidad.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks de texto ni usarse para tareas de razonamiento, código o agentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/99AnshikaGoel/data266-lab2-part2-run2-lora-rank16
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Librería diffusers: https://github.com/huggingface/diffusers
- Paper de LoRA (referencia técnica del método): no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
