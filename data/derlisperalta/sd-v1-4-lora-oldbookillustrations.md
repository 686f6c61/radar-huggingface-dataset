# DerlisPeralta/sd-v1-4-lora-oldbookillustrations

## Resumen

LoRA de estilo para Stable Diffusion v1-4 entrenada por DerlisPeralta (PontIA) sobre un subconjunto de 600 imágenes del dataset `gigant/oldbookillustrations`. El adaptador modifica únicamente las proyecciones de atención de la UNet (`to_q`, `to_k`, `to_v`, `to_out.0`) con rango 8 y alpha 8, y su objetivo es desplazar la distribución de salida del modelo base hacia la estética de la ilustración de libro antiguo (grabados, line art, tramados y paletas desaturadas).

El modelo resuelve un problema acotado: obtener un estilo gráfico concreto sin reentrenar ni desplegar un checkpoint completo de Stable Diffusion. Al ser un adaptador LoRA sobre `CompVis/stable-diffusion-v1-4`, se carga sobre el pipeline estándar de `diffusers` y se puede activar o desactivar en tiempo de inferencia, lo que permite reutilizar el mismo modelo base para múltiples estilos.

Es relevante como ejemplo de adaptación de bajo coste (1 época, batch 3, learning rate 1e-4, resolución 512) y como entrega académica de un módulo de generación de imagen. No obstante, el repositorio no publica pesos con tamaño distinto de cero en el momento de la consulta (0.0 GB) ni métricas cuantitativas, por lo que su evaluación práctica queda limitada a la comparación visual antes/después incluida en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion v1-4 (difusión latente, transformer convolucional) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base SD v1-4 tiene ~860M en UNet) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; límite práctico del tokenizer CLIP de 77 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en precisión nativa; el modelo base admite fp16, fp32 y variantes GGUF de terceros) |
| Idiomas soportados | no disponible (prompts en inglés recomendados por el tokenizer CLIP del modelo base) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | no disponible (repositorio de 0.0 GB; se esperan safetensors de LoRA compatibles con `diffusers`) |

## Arquitectura y entrenamiento

El adaptador es una LoRA de rango 8 y alpha 8 aplicada a las capas de atención `to_q`, `to_k`, `to_v` y `to_out.0` de la UNet de Stable Diffusion v1-4. No se modifican el VAE ni el text encoder CLIP, de modo que la semántica del prompt sigue dependiendo del modelo base y la LoRA solo altera la respuesta visual de la UNet. El entrenamiento se realizó durante 1 época con batch size 3, learning rate 0.0001 y resolución 512, sobre un subconjunto de 600 imágenes del dataset `gigant/oldbookillustrations`, usando las columnas `1600px` (imagen) e `info_alt` (texto descriptivo) como pares imagen-texto.

No se documenta en la información disponible el número total de pasos, el optimizador, la composición exacta del dataset ni si hubo filtrado de calidad o deduplicación. Tampoco se indica si se aplicaron técnicas de regularización (por ejemplo, preservación de clases o dropout de texto). El resultado es un adaptador de estilo de bajo rango, pensado para inferencia sobre el pipeline `StableDiffusionPipeline` de `diffusers` mediante `load_lora_weights`.

## Capacidades

- Generación text-to-image con estética de ilustración de libro antiguo (grabado, line art, tramado, tonos desaturados).
- Activación y desactivación del estilo en tiempo de inferencia sin recargar el modelo base.
- Compatibilidad con el ecosistema `diffusers`: `StableDiffusionPipeline`, `load_lora_weights` y control por semilla.
- Composición con otros adaptadores LoRA del ecosistema SD v1-4 (no verificado en la model card).
- Control de reproducibilidad mediante `torch.Generator` y semilla fija, como se muestra en el ejemplo de uso.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo generativo de imagen, no un LLM.
- No se documentan capacidades de inpainting, outpainting, ControlNet, img2img guiado ni edición instructiva.

## Casos de uso

- Ilustración editorial retro: generar portadas, cabeceras y viñetas con estética de grabado decimonónico para publicaciones, blogs o fanzines, usando el modelo base SD v1-4 más esta LoRA en un pipeline de `diffusers`.
- Prototipado de dirección de arte: producir rápidamente variantes de un mismo prompt con distintas semillas para explorar composiciones antes de encargar ilustración final a un artista.
- Material didáctico y académico: crear ilustraciones de estilo histórico para apuntes, presentaciones o materiales de divulgación donde encaje una estética de libro antiguo.
- Generación de assets para juegos narrativos o ficción interactiva: fondos y retratos con un estilo coherente, aplicando la LoRA de forma condicional según la escena.
- Experimentación en docencia de difusión: servir como ejemplo práctico de fine-tuning con LoRA (rango, capas objetivo, hiperparámetros) en cursos de modelos generativos, dado que la model card documenta la configuración completa.
- Composición con otros estilos: cargar esta LoRA junto a adaptadores de personaje o de composición para mantener una estética de grabado mientras se controla el sujeto, siempre que se validen las interacciones entre adaptadores.
- Pruebas de concepto de bajo coste: al requerir solo el checkpoint base SD v1-4 y un adaptador pequeño, permite iterar en GPUs de gama media sin reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye una comparación visual antes/después (`comparacion_antes_despues.png`) con el mismo prompt y semilla, sin métricas cuantitativas como FID, CLIP score, aesthetic score ni evaluaciones humanas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base SD v1-4 en fp16 requiere aproximadamente 4-6 GB de VRAM a 512x512; la LoRA añade una sobrecarga mínima (decenas de MB).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; A100 o H100 para lotes grandes o despliegue concurrente.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más en fp16 a 512x512; con 4 GB puede requerir `enable_attention_slicing` o `enable_model_cpu_offload`.
- Opciones de despliegue: `diffusers` (referencia), `StableDiffusionPipeline` con `load_lora_weights`, A1111/Forge, ComfyUI y otros frontends que acepten LoRA en formato compatible; no se documenta soporte de vLLM/TGI (no aplicables a difusión).
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware, de los pasos de muestreo y del scheduler elegido.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DerlisPeralta/sd-v1-4-lora-oldbookillustrations | LoRA de estilo | SD v1-4 | no disponible (r=8) | no aplica | creativeml-openrail-m | HuggingFace (repo de 0.0 GB) |
| CompVis/stable-diffusion-v1-4 | Checkpoint completo | — | ~860M UNet + VAE + CLIP | 77 tokens | creativeml-openrail-m | HuggingFace |
| stabilityai/stable-diffusion-2-1 | Checkpoint completo | — | ~865M UNet | 77 tokens | openrail++ | HuggingFace |
| runwayml/stable-diffusion-v1-5 | Checkpoint completo | — | ~860M UNet | 77 tokens | creativeml-openrail-m | HuggingFace |

La comparación directa con otros adaptadores de estilo no está disponible en la información proporcionada, ya que no se han publicado métricas ni se han identificado LoRAs equivalentes del mismo dataset.

## Limitaciones y advertencias

- El repositorio figura con tamaño 0.0 GB en el momento de la consulta, lo que sugiere que los pesos pueden no estar subidos o no ser accesibles; verificar antes de integrar en producción.
- Entrenamiento muy corto (1 época, 600 imágenes, batch 3): riesgo alto de sobreajuste al subconjunto y de escasa generalización a prompts fuera de la distribución del dataset.
- Estilo limitado a la estética de ilustración de libro antiguo; no está pensado para fotorrealismo, retratos contemporáneos ni tipografía.
- El modelo base SD v1-4 tiene conocidos sesgos demográficos y culturales heredados de sus datos de entrenamiento; la LoRA puede amplificarlos o introducir sesgos propios del dataset `oldbookillustrations`.
- Riesgo de alucinación visual: anatomías incorrectas, texto ilegible y artefactos en manos, rostros y estructuras arquitectónicas, habituales en SD v1-4.
- Prompts en inglés recomendados; el tokenizer CLIP del modelo base no está optimizado para otros idiomas y la model card no declara idiomas soportados.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (no usos dañinos, obligación de incluir la licencia y sus restricciones aguas abajo); revisar los términos antes de desplegar.
- Sin métricas publicadas de calidad ni evaluaciones humanas; la única evidencia es la comparación visual antes/después.
- No se documenta compatibilidad verificada con otros adaptadores LoRA, ControlNet ni pipelines de img2img.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DerlisPeralta/sd-v1-4-lora-oldbookillustrations
- Modelo base: https://huggingface.co/CompVis/stable-diffusion-v1-4
- Dataset de entrenamiento: https://huggingface.co/datasets/gigant/oldbookillustrations
- Documentación de `diffusers` para carga de LoRA: https://huggingface.co/docs/diffusers/using-diffusers/loading_adapters
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
