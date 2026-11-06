# JoshHughes/sana-video2-firstframe-lora

## Resumen

SANA-Video 2.0 First-Frame LoRA (f3) es un adaptador LoRA de rango 32 desarrollado por Josh Hughes sobre el modelo de generación de vídeo SANA-Video 2.0 5B 720p 4-step de NVIDIA. Su propósito es dotar al modelo base de dos capacidades para las que no fue entrenado: la conversión de imagen a vídeo (el clip arranca en una imagen dada y se mantiene fiel a ella) y la generación entre primer y último fotograma (el clip empieza en una imagen y termina en otra distinta). NVIDIA publicó el modelo base como vista previa de investigación de texto a vídeo, explicitamente no destinada a condicionamiento por primer fotograma.

El adaptador se entrena exclusivamente con clips generados por el propio SANA-Video 2.0 4-step y posteriormente verificados, sin usar otros modelos de vídeo ni vídeo real. Es un caso de autodestilación en el que el modelo actúa como su propio maestro. El resultado es un LoRA de 128 MB en float32 con 322 tensores que se aplica sobre 161 capas lineales del transformer.

Con licencia Apache-2.0 y pesos publicados en safetensors, el adaptador es relevante para quienes necesitan control de keyframes en pipelines de generación de vídeo con pocos pasos de muestreo, sin reentrenar el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer de difusion (SanaVideo2_5B, estudiante DMD) |
| Parametros totales | 32,0 M (adaptador LoRA); modelo base: 4,47 B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo generativo de vídeo, no de texto) |
| Tipos de cuantizacion | float32 (pesos publicados); fp16 en el pack p0pc0rn para WebGPU |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (float32), pack fp16 adicional para WebGPU |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 con alpha 32 (escala 1,0) aplicado sobre 161 capas lineales del transformer SanaVideo2_5B del modelo base. Concretamente, actua sobre `attn.qkv`, `attn.output_gate`, `attn.proj`, `cross_attn.q_linear` y `cross_attn.proj` en los 32 bloques, ademas de `t_block.1`, la proyeccion AdaLN compartida del embedding de timestep. Esta ultima capa es clave porque un fotograma fijado opera en t = 0, de modo que transporta la señal de "este fotograma viene dado". Los nombres de las claves coinciden exactamente con los nombres de modulo oficiales de NVIDIA y la regla de aplicacion es W' = W + (alpha/rank) * B @ A.

El entrenamiento es de autodestilación: solo se usan clips generados por el propio SANA-Video 2.0 4-step que despues fueron verificados, sin emplear otros modelos de vídeo ni vídeo real. El modelo base es un estudiante DMD (distribution matching distillation) con sampler `fastvideo_dmd_4step` / `sana_shift6_dpm` y CFG 1, lo que permite generacion en cuatro pasos. El checkpoint del LoRA corresponde al paso 1000.

## Capacidades

- Generacion de vídeo condicionada por primer fotograma: el clip arranca en la imagen dada y mantiene el sujeto fiel a lo largo de la secuencia.
- Generacion entre primer y ultimo fotograma: el clip empieza en una imagen y aterriza en otra distinta, con mayor movimiento y menor salto final que el modelo sin adaptador.
- Generacion en pocos pasos: hereda el muestreo en 4 pasos del modelo base (DMD).
- Fidelidad al sujeto mejorada: segun el autor, en 100 imagenes retenidas el modelo se mantiene sobre el sujeto con mas frecuencia (metrica CLIP).
- Mayor movimiento en tarea primer+ultimo fotograma: 42 % mas de movimiento y un salto final mucho menor segun la evaluacion del autor.
- Salida de vídeo a 832x480 o 480x832, 81 fotogramas a 16 fps en los ejemplos publicados.
- Soporte de resolucion 720p en el modelo base.
- Idioma de los prompts: ingles.

## Casos de uso

- Animacion de ilustraciones y personajes: partiendo de un dibujo o render, el modelo genera un clip que mantiene el diseño original, util para prototipos de animacion o storyboards.
- Generacion de transiciones entre dos fotogramas clave: dados un inicio y un final, se produce la interpolacion animada, util para montaje y efectos en produccion audiovisual.
- Creacion de contenido para redes sociales: clips cortos de 81 fotogramas a 16 fps a partir de una sola imagen, con generacion en cuatro pasos que reduce el coste por iteracion.
- Previsualizacion de conceptos en diseno de producto o videojuegos: animar el render de un personaje o activo manteniendo su identidad visual para validar ideas antes de produccion.
- Pipelines de video generativo con keyframes: integracion del adaptador en flujos que ya usan SANA-Video 2.0, aprovechando que las claves LoRA coinciden con los nombres de modulo oficiales y no requieren renombrado.
- Prototipado de motion graphics con material stop-motion o paper-craft: los ejemplos publicados incluyen un zorro en stop-motion y una ballena de papel, lo que sugiere buen comportamiento con estilos estilizados.
- Despliegue en WebGPU en dispositivo: el pack fp16 de p0pc0rn permite ejecutar el adaptador en el motor WebGPU on-device, util para demos en navegador.

## Benchmarks y rendimiento

El autor publica una evaluacion sobre 100 imagenes retenidas y 100 ultimos fotogramas, con scripts y resultados por clip en el directorio `eval/`. No se ofrecen valores numericos absolutos de metricas en la informacion disponible, solo comparaciones relativas.

| Tarea | Metrica | Resultado con f3 frente al modelo base |
|---|---|---|
| Primer fotograma | CLIP (fidelidad al sujeto) | Permanece sobre el sujeto con mas frecuencia (sin cifra absoluta disponible) |
| Primer + ultimo fotograma | Movimiento | 42 % mas de movimiento |
| Primer + ultimo fotograma | Salto final (end snap) | Mucho menor |
| Primer + ultimo fotograma | Distancia al objetivo | Aterriza mas cerca del fotograma final |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, dado que se trata de un modelo generativo de vídeo.

## Requisitos de hardware

- VRAM estimada para el modelo base de 4,47 B en inferencia: no disponible en la informacion proporcionada. El adaptador anade solo 128 MB en float32 o su equivalente fp16.
- GPU recomendadas: no disponible. El modelo base se distribuye para 720p y el adaptador opera a 832x480 o 480x832 en los ejemplos.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: PyTorch con el loader y sampler incluidos en `eval/sana_video2_lora.py`; motor WebGPU on-device p0pc0rn mediante el pack fp16.
- Latencia y throughput: no disponible. La generacion hereda el muestreo en 4 pasos del modelo base, lo que reduce el numero de evaluaciones del transformer frente a samplers de mas pasos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas en la informacion proporcionada. A continuacion se comparan caracteristicas estructurales conocidas.

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SANA-Video 2.0 First-Frame LoRA (f3) | LoRA sobre diffusion transformer | 32 M adaptador / 4,47 B base | 720p, 81 frames, 4 pasos | Apache-2.0 | Hugging Face |
| SANA-Video 2.0 5B 720p 4-step (base) | Diffusion transformer (DMD) | 4,47 B | 720p, 4 pasos | Apache-2.0 | Hugging Face |
| Otras alternativas de image-to-video | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo base fue publicado por NVIDIA como vista previa de investigacion de texto a vídeo y explicitamente no destinado a condicionamiento por primer fotograma; el adaptador cubre esa carencia pero no elimina el caracter de investigacion del conjunto.
- Sin el LoRA, el estudiante a menudo se desvia de un fotograma fijado; con dos fotogramas fijados tiende a quedarse quieto y luego saltar al final. El adaptador reduce estos fallos pero no los elimina por completo.
- En la tarea de primer y ultimo fotograma, los ejemplos publicados difieren menos visiblemente que las medias; el autor recomienda guiarse por los numeros del conjunto de test.
- Entrenado solo con clips generados por el propio modelo base y verificados, sin vídeo real, lo que puede limitar la diversidad y el realismo de los resultados.
- Idioma de prompts limitado a ingles.
- Riesgo de sesgos y alucinaciones visuales inherente a los modelos generativos; no se documentan sesgos especificos en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datasets subyacentes antes de produccion.
- El pack p0pc0rn es especifico del motor WebGPU on-device y no es necesario para PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoshHughes/sana-video2-firstframe-lora
- Modelo base: https://huggingface.co/Efficient-Large-Model/SANA-Video_2.0_5B_720p_4step
- Ejemplos de video: examples/ff_bram_2.mp4, examples/ff_atlas_5.mp4, examples/ff_sorrel_2.mp4, examples/flf_atlas_1.mp4, examples/flf_glim_1.mp4 (dentro del repositorio)
- Scripts de evaluacion: directorio eval/ del repositorio (loader `sana_video2_lora.py`, metricas, 100 imagenes de test y resultados por clip)
