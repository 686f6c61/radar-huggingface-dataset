# AiArtLab/mossling

## Resumen

Mossling es un modelo de generación de imágenes texto-a-imagen derivado de `OpenMOSS-Team/MOSS-Image-Base`, publicado por AiArtLab bajo licencia Apache 2.0. Se trata de un ejercicio de compresión agresiva del modelo original: el transformer DiT pasa de 42 a 30 bloques (de 5.082 B a 3.723 B de parámetros) y el codificador de texto de 9B se sustituye por un Qwen3.5-0.8B congelado más un adaptador de 158M. El objetivo declarado es que el modelo quepa y funcione en una GPU de consumo de 16 GB, con un pico de VRAM de 12,4 GB a 1024 px y 30 pasos.

La reducción se consigue mediante fusión de bloques con LoRAs de rango 32 entrenadas para que un bloque superviviente reproduzca la salida del bloque eliminado, y mediante un adaptador que imita las condiciones del codificador de 9B original (coseno de 0,924 frente a él en captions de validación). El VAE (`AutoencoderKLFlux2` en fp32) y el scheduler (`MOSSImageScheduler`, flow-matching Euler con shift estático 5.0) se mantienen intactos.

Es relevante ahora porque demuestra empíricamente que un DiT de gran tamaño sobrevive a un recorte del 26,7 % de parámetros y a un codificador 16 veces menor sin colapsar, lo que abre la puerta a despliegues en hardware de consumo. Ahora bien, el propio autor lo etiqueta como **alpha** y **undertrained**: fue ensamblado en dos días en una RTX 4080 y no debe tratarse como un modelo terminado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con flow matching; 30 bloques (upstream: 42) |
| Parámetros totales | 3.723.277.328 (transformer); codificador de texto 0.8B + adaptador 158M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; sin ventana de contexto de texto declarada) |
| Tipos de cuantización | bf16 para el transformer; fp32 para el VAE; no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `diffusers`, pipeline `MOSSImagePipeline`) |

## Arquitectura y entrenamiento

El transformer es un DiT de 30 bloques y 3.723 B de parámetros en bf16, frente a los 42 bloques y 5.082 B del MOSS-Image original. La compresión se realizó fusionando tres bloques adyacentes en uno: el bloque `s` se conserva y recibe una LoRA de rango 32, mientras que `s+1` y `s+2` se eliminan; la LoRA se entrena para que `s` reproduzca la salida original de `s+2`. Se entrenaron siete ventanas a 1024 px y seis se incorporaron al artefacto final (42 − 12 = 30 bloques). La fusión se hornea en los pesos mediante `W' = W + B·A·scale`, de modo que la inferencia no añade coste ni requiere cargar módulos extra.

El codificador de texto original (Qwen3.5-VL-9B, 15,63 GB) se reemplaza por Qwen3.5-0.8B congelado (1,7 GB) más un cabezal adaptador de 158M (`MOSSAdapterTextEncoder`) que imita las emisiones del 9B, devolviendo estados `(B, L, 4096)` compatibles con `encode_prompt`, la rama negativa de CFG y el resto de argumentos de `__call__`. El VAE (`AutoencoderKLFlux2`) no se modifica y se mantiene en fp32. El scheduler es `MOSSImageScheduler` con flow-matching Euler y shift estático 5.0. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de imágenes texto-a-imagen a 1024 px por defecto, con cualquier resolución que sea múltiplo positivo de 16.
- Soporte de relaciones de aspecto 3:4 y 4:3 (los ejemplos usan 864x1152 y 1152x1152).
- Comprensión de prompts descriptivos largos (párrafos completos) y de listas de etiquetas estilo booru, tal como aparecen en el conjunto de fine-tune.
- Integración nativa con `diffusers` mediante `DiffusionPipeline` y `custom_pipeline="pipeline_moss_image"` con `trust_remote_code=True`.
- Control de generación mediante `guidance_scale` (CFG), `num_inference_steps` y `uncond_skip_layers`.
- No se documentan tool calling, capacidades de agente, modo thinking, visión de entrada ni audio.

## Casos de uso

- **Prototipado en estación de trabajo de 16 GB**: desarrolladores con una RTX 4080 o similar pueden ejecutar el pipeline completo sin offload (12,4 GB de pico a 1024 px y 30 pasos), lo que permite iterar sobre prompts localmente sin depender de APIs.
- **Generación de ilustración con estilos anime y personajes**: los ejemplos de la model card (streetwear anime, figura blindada, chica gato con kimono, ratón caballero) muestran que el modelo responde bien a prompts con etiquetas detalladas de apariencia, vestimenta y composición, útil para concept art y fichas de personaje.
- **Pruebas de viabilidad de compresión de modelos**: investigadores que estudien pruning estructurado o destilación de codificadores pueden usar el artefacto y el script `src/run_hi.sh` como referencia reproducible de fusión de bloques con LoRAs de rango 32.
- **Generación de imágenes en entornos con VRAM limitada**: con 9,7 GB de pico a 768x1152 liberando el codificador antes de ejecutar el DiT, encaja en GPUs de 12 GB para resolución vertical.
- **Pipelines de aumento de datos visuales**: la velocidad de aproximadamente 1,15 iteraciones por segundo en una 4080 permite generar lotes moderados de imágenes sintéticas para tareas de clasificación o detección.
- **Evaluación comparativa de codificadores de texto destilados**: el adaptador de 158M sobre Qwen3.5-0.8B, con coseno de 0,924 frente al 9B original, sirve como caso de estudio para medir cuánto se puede reducir un text encoder en un modelo de difusión.
- **Demostraciones y docencia**: al ser un derivado no oficial y ligero, es adecuado para talleres sobre `diffusers` y sobre técnicas de compresión, siempre advirtiendo de su estado alpha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas operativas:

| Métrica | Valor |
|---|---|
| Pico de VRAM a 1024 px / 30 pasos | 12,4 GB |
| Pico de VRAM a 768x1152 (codificador liberado) | 9,7 GB |
| Throughput en RTX 4080 | ~1,15 it/s |
| Coseno del adaptador frente al codificador 9B | 0,924 (captions de validación) |
| Reducción de parámetros del transformer | 26,7 % (5.082 B → 3.723 B) |

## Requisitos de hardware

- **VRAM estimada**: 12,4 GB de pico a 1024 px con 30 pasos y sin offload; 9,7 GB a 768x1152 si se libera el codificador antes de ejecutar el DiT.
- **GPU recomendadas**: RTX 4080 (16 GB) es el hardware de referencia del autor; cualquier GPU con 16 GB o más de VRAM debería funcionar. No se documenta comportamiento en A100, H100 ni RTX 4090.
- **GPU de consumo**: sí cabe en GPUs de consumo de 16 GB. En tarjetas de 12 GB solo con la configuración de 768x1152 y liberando el codificador; por debajo de 12 GB no hay datos.
- **Opciones de despliegue**: `diffusers` con `DiffusionPipeline` y `custom_pipeline="pipeline_moss_image"`, `trust_remote_code=True` y dtype mixto (`bf16` por defecto, `fp32` para el VAE). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión.
- **Latencia y throughput**: aproximadamente 1,15 iteraciones por segundo en una RTX 4080, lo que sitúa una generación de 30 pasos en torno a 26 segundos y una de 50 pasos en torno a 43 segundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mossling (este modelo) | 3.723 B (DiT) + 0.8B encoder | 1024 px, múltiplos de 16 | Apache 2.0 | Hugging Face, alpha |
| OpenMOSS-Team/MOSS-Image-Base | 5.082 B (DiT) + 9B encoder | 1024 px | no disponible en la información proporcionada | Hugging Face |
| Otros modelos texto-a-imagen de tamaño similar | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con el modelo base del que deriva. No se dispone de datos de benchmarks ni de especificaciones de alternativas de la misma categoría para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- **Estado alpha y undertrained**: el autor lo describe explícitamente como una prueba de concepto ensamblada en dos días, no como un modelo terminado. La calidad puede ser inconsistente fuera de los dominios representados en el conjunto de fine-tune.
- **Sesgos**: no se documentan análisis de sesgo. Al estar entrenado sobre todo con prompts con etiquetas estilo booru y descripciones de personajes, es previsible un sesgo hacia ese tipo de estética y hacia representaciones estereotipadas; no hay datos que lo cuantifiquen.
- **Alucinación visual**: como todo modelo generativo, puede producir anatomía incorrecta, texto ilegible en la imagen y detalles incoherentes, especialmente con prompts largos o composiciones complejas.
- **Idioma**: solo soporta inglés según la model card; no hay evidencia de comportamiento con prompts en castellano.
- **Skip de bloques desactivado por defecto**: la receta original de 42 bloques salta la capa 22 en la rama incondicional; en un DiT de 30 bloques ese índice apunta a otro bloque y degrada visiblemente la imagen (colores ácidos, piel roja). Solo debe pasarse `uncond_skip_layers` con índices medidos por el usuario.
- **Licencia**: Apache 2.0 permite uso comercial, pero al ser un derivado no oficial de MOSS-Image conviene verificar las condiciones del modelo base antes de desplegarlo en producción.
- **Sin afiliación**: es un derivado no oficial, no un lanzamiento de OpenMOSS ni de MOSI.AI.
- **Reproducibilidad**: los modelos originales (DiT de 42 bloques y encoder de 9B) no están incluidos en el repositorio; para reconstruir la compresión hay que descargar `OpenMOSS-Team/MOSS-Image-Base` en un directorio aparte y ejecutar `src/run_hi.sh`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AiArtLab/mossling
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
