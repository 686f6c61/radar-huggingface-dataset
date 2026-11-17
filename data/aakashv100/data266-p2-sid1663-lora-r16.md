# aakashv100/data266-p2-sid1663-lora-r16

## Resumen

`data266-p2-sid1663-lora-r16` es un adaptador LoRA para generación de imágenes texto-a-imagen construido sobre Stable Diffusion 1.5. Lo desarrolla Aakash Madabhushi (usuario `aakashv100`) como parte de un experimento de investigación sobre ajuste fino de bajo rango aplicado a un dominio muy concreto: criaturas cartoon tipo Pokémon. No es un modelo autónomo, sino un conjunto de pesos de adaptación que se cargan sobre el UNet de SD 1.5 mediante `diffusers`.

El adaptador se entrena sobre el dataset público Pokémon BLIP Captions (500 imágenes filtradas, 450 de entrenamiento y 50 de validación) con rango 16, alpha 16 y 600 pasos de optimizador. La relevancia aquí no está en la calidad artística ni en un rendimiento de estado del arte, sino en su valor como artefacto reproducible de investigación: la model card publica métricas calculadas (KID, CLIP score, LPIPS), parámetros entrenables, horas de GPU y consumo de memoria, lo que permite auditar el coste real de un ajuste LoRA de este tipo.

El modelo es de acceso público con licencia CreativeML Open RAIL-M, pero arrastra restricciones adicionales por el dataset (CC BY-NC-SA 4.0) y por los derechos de autor de los personajes representados. Está pensado explícitamente para investigación no comercial, no para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion 1.5 (difusión latente) |
| Parametros totales | 3.188.736 parámetros entrenables (adaptador); el modelo base SD 1.5 no se incluye en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo texto-a-imagen) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en precisión de entrenamiento; se usa en fp16 sobre el pipeline base) |
| Idiomas soportados | no disponible (los prompts del dataset están en inglés sintético) |
| Licencia | creativeml-openrail-m (con restricciones adicionales del dataset CC BY-NC-SA 4.0) |
| Formato de pesos | safetensors (adaptador LoRA cargable con `diffusers`) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 16 y alpha 16 sobre las capas de atención del UNet de Stable Diffusion 1.5 (revisión `451f4fe16113bff5a5d2269ed5ad43b0592e9a14`). El entrenamiento usa 500 imágenes limpias del dataset Pokémon BLIP Captions (revisión `3790f29981f74ca26bf11662048342e19c5b615e`), con un arranque circular en el índice 663 y semilla 1663, divididas en 450 de entrenamiento y 50 de validación. Se emplean 600 pasos de optimizador, learning rate 0.0001, tamaño de microbatch 1 con acumulación de gradiente 4 (batch efectivo 4) y resolución 512x512.

El coste computacional registrado es de 0,304 horas de GPU, 1.095,7 segundos de entrenamiento y un pico de memoria asignada de 1,99 GiB (2,10 GiB reservados). La MSE de los últimos 100 pasos es 0,0545. El autor indica que la selección final se hizo por CLIP en dominio y que el adaptador marcado como `selected_final` es `false`, es decir, este checkpoint no fue el elegido como versión final del experimento. No se documenta uso de RLHF, DPO ni decodificación especulativa; es un ajuste supervisado clásico de difusión.

## Capacidades

- Generación de imágenes texto-a-imagen dentro del dominio de criaturas cartoon aisladas, con estética próxima a Pokémon.
- Especialización de dominio sobre SD 1.5: el LoRA desplaza la distribución del modelo base hacia el estilo y los sujetos del dataset de entrenamiento.
- Integración directa con el pipeline `StableDiffusionPipeline` de `diffusers` mediante `load_lora_weights`.
- Control de reproducibilidad por semilla (`torch.Generator`), tal como muestra el ejemplo de uso de la model card.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de difusión, no un LLM.
- No tiene capacidades multilingües documentadas; los captions de entrenamiento son sintéticos y en inglés.
- No dispone de modo "thinking", visión, audio ni otras capacidades multimodales más allá de la propia generación de imagen.

## Casos de uso

- Investigación reproducible sobre LoRA: sirve como caso de estudio para medir coste (0,3 horas de GPU, ~2 GiB de pico) y métricas (KID 0,0565, CLIP score 32,1) de un ajuste de bajo rango sobre SD 1.5.
- Experimentos de personalización de estilo: permite generar criaturas cartoon con una estética concreta sin reentrenar el modelo base, cargando el adaptador sobre el pipeline estándar.
- Docencia y formación en difusión: ejemplo mínimo y bien documentado de cómo se entrena y evalúa un LoRA, con hiperparámetros y semillas explícitos.
- Comparación de rangos y configuraciones: el autor lo enmarca en una comparación provisional de rangos (HP_ID 1), útil para replicar estudios sobre el efecto del rango en la calidad.
- Pruebas de pipelines de evaluación de imágenes: sus métricas KID, CLIP y LPIPS permiten validar herramientas de medición automática en dominios de cartoon.
- Auditoría de memorización y privacidad: la model card menciona inspección por vecino más cercano con CLIP como cribado de memorización, aplicable a estudios de filtrado de datos.
- Generación de prototipos visuales no comerciales: bocetos de personajes para exploración creativa interna, siempre respetando las restricciones de licencia y derechos de autor.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| KID | 0,0565 (std 0,0060) |
| KID: imágenes reales / generadas | 50 / 20 |
| CLIP score | 32,1061 |
| CLIP in-domain | 31,0414 |
| LPIPS | 0,8041 |
| MSE últimos 100 pasos | 0,0545 |
| Parámetros entrenables | 3.188.736 |
| Horas de GPU | 0,3044 |
| Pico de memoria asignada | 1,99 GiB |
| Tiempo de entrenamiento | 1.095,75 s |
| Rank | 16 |
| Learning rate | 0,0001 |
| Pasos | 600 |
| Batch efectivo | 4 |
| NSFW bloqueados | 1 |
| Human style win rate | no disponible (NaN) |
| Human match win rate | no disponible (NaN) |

No se han publicado comparaciones con otros modelos en la información disponible. El propio autor advierte que el KID se calcula con solo 20 generaciones frente a 50 imágenes de validación y es ruidoso, y que las valoraciones humanas están pendientes (los valores NaN no deben interpretarse como victorias).

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa unos pocos megabytes; el pipeline SD 1.5 en fp16 requiere aproximadamente 4-6 GiB de VRAM, según resolución y batch.
- GPU recomendadas: cualquier GPU con al menos 6-8 GiB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. El entrenamiento registrado usó un pico de ~2 GiB, lo que sugiere una GPU de gama media o superior.
- Cabe en GPU de consumo: sí, en tarjetas consumer con 6 GiB o más en fp16.
- Opciones de despliegue: `diffusers` (vía `StableDiffusionPipeline` + `load_lora_weights`), y en general cualquier runtime compatible con SD 1.5 y LoRA (por ejemplo, ComfyUI o AUTOMATIC1111, aunque no se documentan explícitamente en la model card).
- Latencia y throughput: no disponibles. Solo se conoce el coste de entrenamiento (1.095,75 s, 0,304 horas de GPU), no el de inferencia.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| data266-p2-sid1663-lora-r16 | SD 1.5 | 3,19 M entrenables (LoRA r16) | no aplica | creativeml-openrail-m + CC BY-NC-SA 4.0 | Hugging Face, 0 descargas |
| Stable Diffusion 1.5 (base) | — | ~860 M (UNet) | no aplica | creativeml-openrail-m | Hugging Face, ampliamente usado |
| Otros LoRA de Pokémon BLIP Captions | SD 1.5 | variable según rango | no aplica | variable (a menudo no comercial) | Múltiples en Hugging Face |

No se dispone de datos de rendimiento comparables de otras alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos de dominio: el dataset contiene criaturas cartoon aisladas; no cubre fotografías, diversidad humana ni escenas complejas.
- Riesgo de alucinación: los captions sintéticos en inglés pueden ser incorrectos, lo que puede producir imágenes mal alineadas con el prompt.
- Calidad de datos: la deduplicación exacta de píxeles no elimina todos los casi-duplicados.
- Métricas ruidosas: el KID se calcula con 20 generaciones frente a 50 reales; las valoraciones humanas están pendientes y no deben tomarse como resultados.
- Checkpoint no final: el autor marca `selected_final: false`, por lo que este adaptador no es la versión elegida del experimento.
- Seguridad: el checker de seguridad de SD está activado pero es imperfecto para cartoons; se bloqueó 1 generación NSFW.
- Memorización: la inspección por vecino más cercano con CLIP es un cribado, no una garantía de privacidad.
- Licencia: CreativeML Open RAIL-M con restricciones adicionales del dataset CC BY-NC-SA 4.0; los personajes siguen sujetos a derechos de autor. Uso comercial no permitido sin autorización.
- Uso prohibido: generación engañosa, dañina o comercial de personajes.
- Idiomas: no hay soporte multilingüe documentado; los prompts de entrenamiento son en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aakashv100/data266-p2-sid1663-lora-r16
- Dataset Pokémon BLIP Captions: https://huggingface.co/datasets/reach-vb/pokemon-blip-captions
- Modelo base Stable Diffusion 1.5: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Paper de Stable Diffusion (Rombach et al.): https://arxiv.org/abs/2112.10752
- Paper de LoRA (Hu et al.): https://arxiv.org/abs/2106.09685
- Paper de extracción de datos de difusión (Carlini et al.): https://arxiv.org/abs/2301.13188
