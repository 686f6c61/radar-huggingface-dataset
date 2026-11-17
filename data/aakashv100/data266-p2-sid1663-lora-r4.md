# aakashv100/data266-p2-sid1663-lora-r4

## Resumen

`data266-p2-sid1663-lora-r4` es un adaptador LoRA de bajo rango (rank 4) para Stable Diffusion 1.5, publicado por Aakash Madabhushi bajo el identificador `aakashv100`. No se trata de un modelo de lenguaje ni de un transformer generativo de texto: es un ajuste fino por adaptador sobre el UNet de atención de SD 1.5, orientado a la generación texto-a-imagen de criaturas cartoon estilizadas (temática Pokémon) a partir de un dataset de 500 imágenes con leyendas BLIP sintéticas en inglés.

El adaptador se entrenó con 600 pasos de optimizador (batch efectivo 4, resolución 512x512, LR 1e-4) sobre 450 imágenes de entrenamiento y 50 reservadas para evaluación, con semilla 1663. El autor lo marca como "adaptador final seleccionado" dentro de un experimento de comparación de rangos provisional (HP_ID 1), aunque señala que la tabla comparativa de rangos (Table 0.1) no se aportó.

Su relevancia es limitada y acotada al ámbito de investigación: el repositorio pesa 0,0 GB, tiene 1 descarga y 0 likes, y el propio autor restringe el uso a investigación no comercial por la naturaleza de los personajes (copyright de Pokémon) y por las condiciones de la licencia CreativeML Open RAIL-M del modelo base. No debe confundirse con un modelo fundacional: es un artefacto de experimentación reproducible con métricas de evaluación publicadas (KID, CLIP, LPIPS).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre UNet de atención de Stable Diffusion 1.5; pipeline text-to-image con VAE y text encoder congelados |
| Parametros totales | 797.184 parámetros entrenables (adaptador LoRA); el modelo base SD 1.5 no se incluye en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; el text encoder CLIP de SD 1.5 acepta hasta 77 tokens de prompt) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en precisión original; el base admite fp16/fp32 y cuantizaciones de la comunidad como GGUF/ONNX, no documentadas aquí) |
| Idiomas soportados | no disponible (las leyendas de entrenamiento son en inglés sintético; el text encoder CLIP de SD 1.5 está entrenado principalmente en inglés) |
| Licencia | creativeml-openrail-m (con restricciones adicionales del dataset CC BY-NC-SA 4.0 y copyright de personajes) |
| Formato de pesos | safetensors (adaptador LoRA cargable con `diffusers`) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 4 y alpha 4 sobre las capas de atención del UNet de Stable Diffusion 1.5 (revisión `451f4fe16113bff5a5d2269ed5ad43b0592e9a14`). El modelo base y el text encoder permanecen congelados; solo se entrenan 797.184 parámetros del adaptador. El entrenamiento usó el dataset Pokémon BLIP Captions (revisión `3790f29981f74ca26bf11662048342e19c5b615e`, licencia CC BY-NC-SA 4.0): 500 imágenes limpias con deduplicación exacta de píxeles, inicio circular en el índice 663, partición de 450 entrenamiento y 50 reservadas, semilla 1663. Las leyendas son sintéticas, generadas con BLIP en inglés.

Hiperparámetros: LR 0.0001, 600 pasos de optimizador, microbatch 1 con acumulación de gradiente 4 (batch efectivo 4), resolución 512x512, precisión mixta (peak allocated 1,955 GiB, peak reserved 2,055 GiB). Coste computacional: 0,303 horas GPU (1.091 segundos). MSE en los últimos 100 pasos: 0,05463. No se documenta uso de RLHF, DPO ni decodificación especulativa; es un ajuste supervisado clásico de difusión con pérdida MSE sobre ruido. La innovación técnica destacable es la reproducibilidad del protocolo (semilla, revisiones fijadas, partición explícita) y la inclusión de una pantalla de memorización mediante inspección de vecinos más cercanos con CLIP.

## Capacidades

- Generación texto-a-imagen de criaturas cartoon estilizadas (temática Pokémon) a partir de prompts cortos en inglés.
- Especialización de dominio estrecha: el adaptador modula el estilo y la morfología de criaturas aisladas sobre fondo simple; no añade capacidades nuevas al modelo base.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el text encoder CLIP de SD 1.5 responde principalmente a inglés.
- No dispone de modo thinking, visión de entrada, audio ni otras modalidades.
- Compatible con el ecosistema `diffusers`: carga mediante `pipe.load_lora_weights(...)` sobre `StableDiffusionPipeline`.
- El safety checker de SD está activado (2 generaciones bloqueadas por NSFW en la evaluación), aunque el autor advierte que es imperfecto para cartoons.

## Casos de uso

- Investigación sobre ajuste fino eficiente: reproducir el experimento de LoRA rank 4 con semilla 1663 y revisiones fijadas para estudiar el efecto del rango en la fidelidad de dominio; el autor lo enmarca explícitamente como comparación provisional de rangos.
- Estudio de memorización y privacidad en modelos de difusión: el adaptador incluye una pantalla de vecinos más cercanos con CLIP (inspirada en Carlini et al., arXiv:2301.13188) que sirve como caso práctico para analizar si un LoRA de bajo rango reproduce imágenes de entrenamiento.
- Evaluación de métricas de generación: usar los valores publicados (KID 0,0648 ± 0,0066 con 20 generadas frente a 50 reales, CLIP score 32,24, CLIP in-domain 31,36, LPIPS 0,822) como línea base para comparar adaptadores de la misma familia.
- Docencia y demostraciones de text-to-image: ejemplo mínimo de carga de un LoRA sobre SD 1.5 en una GPU de consumo, con un coste de entrenamiento de 0,3 horas GPU y menos de 2 GiB de memoria pico.
- Prototipado de estilos cartoon para investigación no comercial: generar criaturas aisladas para estudios de percepción visual o de sesgo en datasets sintéticos, sin uso comercial por las restricciones de licencia y copyright.
- Auditoría de seguridad de pipelines de difusión: analizar el comportamiento del safety checker de SD ante contenido cartoon y documentar sus fallos, como sugiere el autor en la sección de limitaciones.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| KID | 0,06480100750923157 | Calculado con 20 imágenes generadas y 50 reales; el autor lo califica de ruidoso |
| KID std | 0,006582019384950399 | Desviación entre particiones |
| CLIP score | 32,24457550048828 | Alineación prompt-imagen |
| CLIP in-domain | 31,363872528076172 | Usado para la selección del adaptador |
| LPIPS | 0,8220107167959213 | Distancia perceptual |
| MSE final (últimos 100 pasos) | 0,05462838371371617 | Pérdida de difusión |
| NSFW bloqueadas | 2 | Generaciones filtradas por el safety checker |
| Win rate humano (estilo) | NaN | No evaluado |
| Win rate humano (coincidencia) | NaN | No evaluado |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, FID) en la información disponible. No se aportan comparaciones con otros adaptadores o modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador añade 797.184 parámetros al UNet; el grueso del consumo proviene de SD 1.5 en fp16 (aproximadamente 4-6 GB en resolución 512x512, según implementación y optimizaciones; no documentado por el autor).
- VRAM de entrenamiento observada: 1,955 GiB asignados en pico y 2,055 GiB reservados en pico, con microbatch 1 y acumulación 4.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para inferencia en fp16; el entrenamiento cabe en GPUs de consumo modernas (el autor no especifica el modelo de GPU usado).
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes; no confirmado explícitamente por el autor.
- Opciones de despliegue: `diffusers` con `StableDiffusionPipeline` y `load_lora_weights`; el ecosistema SD 1.5 permite además otros runners (AUTOMATIC1111, ComfyUI, etc.) mediante conversión del adaptador, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles. El único dato temporal es el coste de entrenamiento (1.091 segundos, 0,303 horas GPU).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| data266-p2-sid1663-lora-r4 | LoRA sobre SD 1.5 | 797.184 entrenables | no aplica (77 tokens CLIP) | creativeml-openrail-m + CC BY-NC-SA 4.0 | Hugging Face, 1 descarga |
| Stable Diffusion 1.5 (base) | UNet + VAE + CLIP | ~860 M (UNet) | 77 tokens CLIP | creativeml-openrail-m | Hugging Face, ampliamente adoptado |
| Otros LoRA de dominio sobre SD 1.5 | LoRA | variable (rango 4-128 típico) | 77 tokens CLIP | variable | Hugging Face / Civitai |
| SDXL | UNet dual + refiner | ~2,6 B (UNet) + 0,8 B (refiner) | 77 tokens CLIP (doble encoder) | creativeML Open RAIL++-M | Hugging Face |

No se dispone de datos de rendimiento comparativos entre este adaptador y alternativas de la misma categoría en la información proporcionada. La comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: el dataset contiene criaturas cartoon aisladas con leyendas BLIP sintéticas en inglés; no cubre fotografías, diversidad humana ni escenas complejas, por lo que el modelo no debe usarse fuera de ese dominio.
- Riesgo de alucinación: las leyendas sintéticas pueden ser incorrectas, lo que puede producir prompts mal alineados y generaciones que no corresponden a la descripción.
- Limitaciones de contexto e idioma: el text encoder CLIP de SD 1.5 está limitado a 77 tokens y entrenado principalmente en inglés; no se documenta soporte multilingüe.
- Restricciones de licencia: la licencia CreativeML Open RAIL-M del base se aplica junto con las restricciones del dataset (CC BY-NC-SA 4.0); los personajes Pokémon siguen sujetos a copyright. El uso comercial de generación de personajes está prohibido y la model card no otorga derechos sobre los personajes de origen.
- Calidad de evaluación: KID se calcula con solo 20 generaciones frente a 50 imágenes reales y el autor lo califica de ruidoso; la selección del adaptador usa CLIP in-domain y la selección de test es exploratoria. Los win rates humanos son NaN (no evaluados) y el autor advierte que las valoraciones ausentes no cuentan como victorias.
- Deduplicación: la deduplicación exacta de píxeles no elimina duplicados cercanos; la inspección de vecinos con CLIP es una pantalla de memorización, no una garantía de privacidad.
- Seguridad: el safety checker de SD está activado pero es imperfecto para cartoons; se bloquearon 2 generaciones NSFW en la evaluación.
- Producción: el repositorio tiene 0,0 GB, 1 descarga y 0 likes; no hay evidencia de uso en producción ni mantenimiento. No usar para generación engañosa, dañina o comercial de personajes.

## Enlaces

- Hugging Face: https://huggingface.co/aakashv100/data266-p2-sid1663-lora-r4
- Dataset card (Pokémon BLIP Captions): https://huggingface.co/datasets/reach-vb/pokemon-blip-captions
- Modelo base (Stable Diffusion 1.5): https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Paper SD (Rombach et al.): https://arxiv.org/abs/2112.10752
- Paper LoRA (Hu et al.): https://arxiv.org/abs/2106.09685
- Paper de memorización en difusión (Carlini et al.): https://arxiv.org/abs/2301.13188
