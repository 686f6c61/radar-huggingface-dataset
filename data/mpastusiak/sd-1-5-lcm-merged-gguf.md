# mpastusiak/sd-1.5-lcm-merged-gguf

## Resumen

`mpastusiak/sd-1.5-lcm-merged-gguf` es una distribución empaquetada de Stable Diffusion 1.5 en la que se ha fusionado (merge) la LCM-LoRA de Latent Consistency Models directamente en los pesos del UNet, y el resultado se ha cuantizado a Q8_0 en formato GGUF para su uso con `stable-diffusion.cpp`. El autor es mpastusiak y el artefacto está pensado para inferencia ligera en dispositivos móviles, concretamente para la aplicación Schowko, que dibuja imágenes en el teléfono.

El interés técnico reside en que elimina la necesidad de aplicar la LoRA en cada paso de muestreo: al estar fusionada con fuerza 1.0 en las 278 capas del UNet, el modelo puede generar imágenes en 4-8 pasos con `--sampling-method lcm --cfg-scale 1.0`. Esto reduce drásticamente el coste computacional frente a SD 1.5 estándar, que requiere entre 20 y 50 pasos con CFG activo.

El modelo parte de `v1-5-pruned-emaonly.safetensors` (revisión `451f4fe...`) y de `pytorch_lora_weights.safetensors` de `latent-consistency/lcm-lora-sdv1-5` (revisión `cf2fced...`). No hay entrenamiento adicional: es una conversión de formato y una fusión de pesos. El repositorio ocupa 1,8 GB y el modelo tiene 1.066.247.386 parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet + VAE + text encoder CLIP (difusión latente, Stable Diffusion 1.5) |
| Parametros totales | 1.066.247.386 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (prompt de texto CLIP, límite estándar de 77 tokens) |
| Tipos de cuantizacion | Q8_0 (única incluida en el repo) |
| Idiomas soportados | no disponible (el prompt de texto de SD 1.5 está entrenado principalmente en inglés) |
| Licencia | CreativeML Open RAIL-M (SD 1.5) y CreativeML Open RAIL++-M (LCM-LoRA) |
| Formato de pesos | GGUF (`sd-1.5-lcm-merged-q8_0.gguf`) |

## Arquitectura y entrenamiento

La arquitectura es la de Stable Diffusion 1.5: un UNet de difusión latente con atención cruzada sobre embeddings de texto generados por un encoder CLIP, más un VAE para codificar y decodificar entre espacio de píxeles y espacio latente. Sobre esta base se ha fusionado la LCM-LoRA, que convierte el modelo en un modelo de consistencia latente capaz de producir muestras válidas en muy pocos pasos. La fusión se realizó con la fórmula `W += alpha / rank · up · down` sobre las 278 capas LoRA, con fuerza 1.0, guardando el resultado en fp16 y cuantizándolo después a Q8_0 mediante la herramienta `-M convert` de `stable-diffusion.cpp`.

No hubo entrenamiento adicional ni ajuste fino: el proceso es puramente de merge y conversión de formato. La innovación práctica es la reducción del número de pasos de muestreo (4-8 en lugar de 20-50) y la desactivación del CFG (`--cfg-scale 1.0`), lo que abarata la inferencia y la hace viable en hardware móvil. El SHA-256 del fichero GGUF es `84dcd46827cf0d82efe6a440e635603c2482da47adcca8ebf563e33f0c7d524f`.

## Capacidades

- Generación de imágenes texto-a-imagen en 4-8 pasos de muestreo con el sampler LCM.
- Inferencia sin classifier-free guidance (`cfg-scale 1.0`), lo que reduce a la mitad el coste por paso frente a CFG estándar.
- Compatible con `stable-diffusion.cpp`, lo que permite ejecución en CPU y en dispositivos con recursos limitados.
- Uso previsto en aplicaciones móviles (app Schowko) para generación de imágenes en el propio teléfono.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de difusión, no un LLM.
- No soporta visión, audio ni modo thinking.
- Capacidad multilingüe limitada por el encoder CLIP de SD 1.5, orientado a prompts en inglés.

## Casos de uso

- Generación de imágenes en el móvil: el modelo cabe en 1,8 GB en Q8_0 y puede ejecutarse con `stable-diffusion.cpp` en CPU, lo que permite generar ilustraciones directamente en el teléfono sin depender de la nube, como hace la app Schowko.
- Prototipado rápido de pipelines de difusión: al estar en GGUF y requerir solo 4-8 pasos, sirve para validar flujos de generación de imágenes en entornos con poca GPU o sin GPU dedicada.
- Aplicaciones de demostración y educación: un único fichero GGUF que se carga con un binario de `stable-diffusion.cpp` simplifica talleres y demos sobre difusión latente y LCM.
- Generación de avatares o ilustraciones de baja latencia en apps de mensajería: la combinación de pocos pasos y CFG desactivado reduce el tiempo por imagen de forma notable frente a SD 1.5 estándar.
- Filtrado y aumento de datasets sintéticos: útil para generar imágenes de relleno o variaciones a granel donde la fidelidad fina no es crítica y prima el coste por imagen.
- Integración en herramientas de escritorio offline: al no requerir Python ni PyTorch en tiempo de inferencia, encaja en aplicaciones nativas que quieran ofrecer generación de imágenes sin dependencias pesadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero GGUF Q8_0 ocupa aproximadamente 1,8 GB; en ejecución con `stable-diffusion.cpp` el consumo de memoria es del orden de 2-4 GB, dependiendo del backend y de la resolución de salida (dato no publicado por el autor).
- GPU recomendadas: no hay recomendaciones oficiales. Al ser un GGUF para `stable-diffusion.cpp`, está pensado para ejecución en CPU y en GPUs de gama baja o integradas.
- Cabe en GPU de consumo: sí, por tamaño (1,8 GB en disco) es compatible con tarjetas con 4 GB o más de VRAM, como GTX 1650, RTX 3050 o superiores; también en Apple Silicon vía Metal si el backend lo soporta.
- Opciones de despliegue: `stable-diffusion.cpp` es el runtime objetivo declarado. No se menciona compatibilidad con vLLM, llama.cpp ni Ollama (estos están orientados a LLM, no a difusión).
- Latencia y throughput: no disponibles. El autor solo indica que dibuja en 4-8 pasos, sin cifras de tiempo por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / pasos | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sd-1.5-lcm-merged-gguf (este) | 1.066 M | 4-8 pasos, CFG 1.0 | GGUF Q8_0 | CreativeML Open RAIL-M / ++-M | Hugging Face |
| Stable Diffusion 1.5 (base) | ~983 M (UNet) | 20-50 pasos, CFG 7-8 | safetensors, ckpt | CreativeML Open RAIL-M | Hugging Face, muy extendido |
| SD 1.5 + LCM-LoRA sin fusionar | ~983 M + LoRA | 4-8 pasos, CFG 1.0 | safetensors + LoRA | CreativeML Open RAIL-M / ++-M | Hugging Face |
| SDXL-Turbo (referencia de pocos pasos) | ~2.600 M (UNet) | 1-4 pasos | safetensors | Stability AI Community | Hugging Face |

La ventaja de este artefacto frente a SD 1.5 + LCM-LoRA sin fusionar es operativa: un solo fichero, sin cargar LoRA en cada paso, y en formato GGUF listo para `stable-diffusion.cpp`. Frente a SDXL-Turbo, es mucho más pequeño y ligero, aunque con menor calidad y resolución nativa (512x512 frente a 1024x1024).

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos del dataset de entrenamiento de SD 1.5 (LAION), con posibles sesgos de género, raza y estereotipos visuales.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir contenido incoherente, anatomías incorrectas o texto ilegible, especialmente con solo 4-8 pasos.
- Limitaciones de contexto e idioma: el prompt de texto está limitado por el encoder CLIP de SD 1.5 (77 tokens) y funciona mejor en inglés; el soporte multilingüe no está garantizado.
- Restricciones de licencia: se aplican conjuntamente CreativeML Open RAIL-M y CreativeML Open RAIL++-M. Las restricciones de uso del Anexo A (no uso ilegal, no daño a menores, no desinformación, no acoso) deben transmitirse a cualquier receptor del modelo.
- Calidad limitada por la cuantización Q8_0 y por el bajo número de pasos: no es adecuado para producción que exija máxima fidelidad visual.
- No hay datos publicados de benchmarks, latencia ni consumo de memoria; cualquier estimación de rendimiento debe validarse en el hardware objetivo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mpastusiak/sd-1.5-lcm-merged-gguf
- Modelo base SD 1.5: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- LCM-LoRA para SD 1.5: https://huggingface.co/latent-consistency/lcm-lora-sdv1-5
- Runtime `stable-diffusion.cpp`: https://github.com/leejet/stable-diffusion.cpp
