# kruthisham/data266-lab2-team35-p2-run2

## Resumen

`kruthisham/data266-lab2-team35-p2-run2` es un adaptador LoRA de rango 32 entrenado sobre Stable Diffusion 1.5 para reproducir el estilo visual del conjunto de datos `lambdalabs/naruto-blip-captions`. Lo firma el usuario de Hugging Face kruthisham en el marco de la asignatura DATA 266 (Lab 2, Parte 2, equipo 35), y su propósito es académico: demostrar el ajuste fino eficiente de un modelo de difusión texto-a-imagen mediante LoRA sobre las capas de atención del UNet. No es un modelo base autónomo, sino un conjunto de pesos que se carga encima de Stable Diffusion 1.5.

El adaptador entrena 6.377.472 parámetros sobre las proyecciones `to_q`, `to_k`, `to_v` y `to_out` del UNet, partiendo de 1099 imágenes de 512×512 tras descartar corruptas y duplicadas, con un reparto 90/10 y semilla 266. El entrenamiento completo requirió 3000 pasos con batch 4 y una tasa de aprendizaje de 1e-4, y se ejecutó en 6,3 minutos en una NVIDIA GeForce RTX 4090 con un pico de 9,55 GB de VRAM.

Su relevancia es doble: por un lado, ilustra un flujo de trabajo reproducible de ajuste fino con LoRA de bajo coste computacional; por otro, publica métricas comparativas frente al modelo base (KID, CLIP score y diversidad LPIPS) y una evaluación humana ciega. La licencia es explícitamente no comercial, condicionada por los derechos de autor de los personajes representados en el conjunto de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32) sobre UNet de Stable Diffusion 1.5 (difusión latente, transformer convolucional) |
| Parametros totales | 6.377.472 parámetros entrenables (adaptador LoRA); el modelo base SD 1.5 no se incluye en el repo |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; sin ventana de contexto textual definida) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en precisión de entrenamiento; el modelo base admite fp16/fp32) |
| Idiomas soportados | no disponible (las indicaciones de texto dependen del codificador CLIP de SD 1.5, predominantemente inglés) |
| Licencia | other (no comercial, solo investigación) |
| Formato de pesos | no disponible en la información proporcionada (repo de 0.0 GB; pesos LoRA compatibles con `load_lora_weights`) |

## Arquitectura y entrenamiento

El adaptador se inyecta en las capas de atención del UNet de Stable Diffusion 1.5 mediante LoRA de rango 32, con matrices de baja dimensión sobre `to_q`, `to_k`, `to_v` y `to_out`. Esto permite modificar el comportamiento del modelo base sin reentrenar sus aproximadamente 860 millones de parámetros del UNet, manteniendo el coste de almacenamiento y de cómputo muy bajo. El codificador de texto (CLIP) y el VAE no se ajustan, de modo que toda la adaptación de estilo recae en el UNet.

El conjunto de entrenamiento es `lambdalabs/naruto-blip-captions`, con 1099 imágenes de 512×512 tras eliminar 0 corruptas y 0 duplicadas. Se empleó una partición 90/10 con semilla 266, tasa de aprendizaje 1e-4, 3000 pasos y batch de 4, lo que supone aproximadamente 12.000 muestras vistas (unas 11 épocas sobre el conjunto de entrenamiento). No se documenta el uso de RLHF, DPO ni preferencias humanas en el entrenamiento; la evaluación humana es únicamente posterior. El entrenamiento consumió 6,3 minutos en una RTX 4090 con pico de 9,55 GB, limitado a 15 GiB para simular una GPU de 16 GB.

## Capacidades

- Generación de imágenes texto-a-imagen en el estilo visual del conjunto `naruto-blip-captions`, condicionada por indicaciones en lenguaje natural.
- Transferencia de estilo sobre Stable Diffusion 1.5: el adaptador modula las capas de atención del UNet para aproximar la distribución visual del dataset de entrenamiento.
- Composición con el modelo base: se carga mediante `load_lora_weights` sobre `StableDiffusionPipeline`, por lo que hereda las capacidades generales de SD 1.5 (resolución nativa 512×512, sampler configurable, guidance scale).
- Compatibilidad con DPM-Solver++ y otras rutinas de muestreo del ecosistema Diffusers.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente generativo visual.
- No dispone de modo de razonamiento (thinking), visión de entrada ni audio.
- Capacidad multilingüe: no disponible; el codificador CLIP de SD 1.5 está orientado principalmente al inglés.

## Casos de uso

- Investigación académica sobre ajuste fino eficiente: sirve como referencia reproducible de un LoRA de rango 32 sobre UNet, con hiperparámetros y métricas documentados, para comparar estrategias de adaptación de bajo rango en modelos de difusión.
- Docencia en cursos de aprendizaje profundo: el repositorio incluye el desglose de configuración (rank, capas objetivo, lr, pasos, batch) y permite reproducir el experimento en una GPU de 16 GB en menos de diez minutos.
- Generación de ilustraciones de estilo consistente en entornos de investigación: al fijar el estilo del dataset, permite producir variaciones visuales coherentes para estudios de percepción o de evaluación de modelos generativos.
- Evaluación comparativa de métricas generativas: el adaptador publica KID, CLIP score y diversidad LPIPS frente al modelo base, por lo que puede reutilizarse como caso de estudio en la calibración de dichas métricas.
- Pruebas de pipelines de Diffusers: útil para validar la carga de adaptadores LoRA, la integración con samplers DPM-Solver++ y el filtrado del safety checker en flujos de producción simulados.
- Estudio de sesgos y derechos de autor en modelos generativos: al entrenarse sobre personajes con copyright, sirve para analizar cómo los adaptadores de bajo rango reproducen estilos protegidos y cómo se comportan los filtros de seguridad (6 de 40 imágenes marcadas como NSFW en la evaluación).

## Benchmarks y rendimiento

Evaluación con 20 indicaciones y 2 semillas, DPM-Solver++ a 30 pasos y guidance 7.5. KID calculado sobre 15 de las 20 imágenes en dominio (las marcadas NSFW se excluyen) frente a 122 imágenes de test.

| Metrica | Este LoRA (run2) | Stable Diffusion 1.5 (base) |
|---|---|---|
| KID (menor es mejor) | 0.0053 ± 0.0043 | 0.1256 ± 0.0125 |
| CLIP score (mayor es mejor) | 25.00 | 26.36 |
| Diversidad LPIPS (mayor es mejor) | 0.746 | 0.793 |
| Tasa de victoria en estilo (evaluación humana, 25 pares ciegos, 75 votos, 3 evaluadores) | 96 % | — |
| Tasa de victoria en seguimiento de la indicación (misma evaluación) | 41 % | — |

El KID del adaptador es notablemente inferior al del modelo base, lo que indica una mejor coincidencia con la distribución del dataset de estilo. Sin embargo, el CLIP score baja de 26.36 a 25.00 y la tasa de victoria en seguimiento de la indicación es solo del 41 %, coherente con la limitación declarada de peor adherencia a indicaciones fuera de dominio. El KID es ruidoso por el reducido tamaño de la muestra de referencia (15 imágenes en dominio frente a 122 de test).

## Requisitos de hardware

- VRAM para inferencia: el adaptador en sí ocupa unos pocos megabytes (6,4 M de parámetros); el consumo real lo determina Stable Diffusion 1.5, en torno a 4-6 GB en fp16 a 512×512 con batch 1.
- VRAM para entrenamiento: pico de 9,55 GB con batch 4 y 512×512, según el autor, con el proceso limitado a 15 GiB.
- GPU recomendadas: NVIDIA RTX 4090 (usada en el entrenamiento), A100 o H100 para lotes mayores; cualquier GPU con al menos 8 GB para inferencia.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; también en GPUs de 8 GB con fp16 y resolución 512×512.
- Opciones de despliegue: Hugging Face Diffusers (`StableDiffusionPipeline` + `load_lora_weights`), así como los ecosistemas compatibles con LoRA de SD 1.5 (por ejemplo, interfaces de difusión que acepten adaptadores en formato Diffusers). No se documenta compatibilidad con llama.cpp, vLLM ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponible; el autor solo publica el tiempo de entrenamiento (6,3 minutos), no métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kruthisham/data266-lab2-team35-p2-run2` | 6,4 M entrenables (LoRA r32) | 512×512 nativo | KID 0.0053; CLIP 25.00; LPIPS 0.746 | other (no comercial) | Hugging Face, 0 descargas |
| Stable Diffusion 1.5 (base) | ~860 M en UNet | 512×512 nativo | KID 0.1256; CLIP 26.36; LPIPS 0.793 | CreativeML OpenRAIL-M (según el modelo base) | Ampliamente disponible |
| Otros LoRA de estilo sobre SD 1.5 | Variable (típicamente 1-10 M) | 512×512 nativo | No disponible en esta información | Variable según autor | Hugging Face |

La comparación directa con otros adaptadores LoRA de estilo no puede establecerse con datos numéricos porque la información proporcionada no incluye resultados de terceros. La referencia válida es el modelo base, frente al cual este adaptador mejora el KID y el estilo percibido, a costa de menor CLIP score y peor seguimiento de indicaciones.

## Limitaciones y advertencias

- Licencia no comercial, solo para investigación: los derechos de autor de los personajes del dataset impiden el uso comercial, y la model card del dataset `lambdalabs/naruto-blip-captions` no declara licencia.
- Peor seguimiento de indicaciones fuera de dominio que el modelo base: la tasa de victoria en prompt es del 41 %, por debajo del 50 %.
- Hereda los errores de las leyendas BLIP del dataset y el desequilibrio de personajes presente en las imágenes de entrenamiento.
- KID poco fiable por el tamaño muestral: se calcula con 15 imágenes en dominio (excluidas las NSFW) frente a 122 de test, con un intervalo de confianza amplio (±0.0043).
- Filtro de seguridad: el safety checker de Stable Diffusion marcó 6 de 40 imágenes como NSFW; se publican como marcadores negros y se excluyen de todas las métricas, lo que puede sesgar la evaluación.
- Riesgo de reproducción de estilos protegidos y de sesgos visuales presentes en el dataset original (representación de personajes, composición, iluminación).
- Sin soporte de contexto textual largo ni de instrucciones complejas: las indicaciones deben ser cortas y en inglés para obtener resultados fiables.
- Repositorio de 0.0 GB y sin descargas ni valoraciones: no hay evidencia de uso comunitario ni de validación externa.
- Fecha de creación declarada en 2026-11-10, posterior a la mayoría de referencias del ecosistema; conviene verificar la integridad del repositorio antes de reutilizarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kruthisham/data266-lab2-team35-p2-run2
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Documentación de Diffusers para carga de LoRA: https://huggingface.co/docs/diffusers/using-diffusers/loading_adapters
- Paper de LoRA (Hu et al., 2021): https://arxiv.org/abs/2106.09685
- Paper de Stable Diffusion (Rombach et al., 2022): https://arxiv.org/abs/2112.10752
