# Shero448/sakie

## Resumen

Sakie es un LoRA (Low-Rank Adaptation) de texto a imagen publicado por el usuario Shero448 en Hugging Face. No se trata de un modelo completo, sino de un adaptador de bajo rango que se aplica sobre el checkpoint base `John6666/prefect-illustrious-xl-v15-sdxl`, una variante de la familia Illustrious XL (derivada de SDXL) orientada a ilustración y anime. El adaptador está empaquetado en formato diffusers y su propósito es incorporar un personaje concreto —etiquetado como "sakie"— al repertorio generativo del modelo base.

El repositorio es de tamaño reducido (0,5 GB), coherente con un adaptador LoRA y no con un modelo completo de miles de millones de parámetros. La model card incluye un grafo de nodos de ComfyUI con prompts positivo y negativo, lo que indica que el autor lo emplea en ese ecosistema, aunque el pipeline declarado es `text-to-image` estándar de diffusers.

Por su naturaleza, este artefacto resulta relevante únicamente para quien necesite reproducir el personaje concreto en un flujo de generación de ilustración sobre Illustrious XL. No aporta mejoras generales de calidad ni nuevas capacidades de razonamiento; su valor es la especialización estética sobre una base concreta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre difusión latente (base SDXL / Illustrious XL) |
| Parámetros totales | no disponible (adaptador de bajo rango; repo de 0,5 GB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; el prompt de texto se tokeniza con CLIP, límite de 77 tokens por bloque) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (prompts en inglés en los ejemplos de la model card) |
| Licencia | no disponible |
| Formato de pesos | diffusers (adaptador LoRA); repo de 0,5 GB |

## Arquitectura y entrenamiento

El adaptador se apoya en un modelo de difusión latente de la familia SDXL, concretamente en `John6666/prefect-illustrious-xl-v15-sdxl`. SDXL emplea un UNet con dos text encoders (CLIP ViT-L y OpenCLIP ViT-bigG) y un VAE para codificar y decodificar en el espacio latente. El LoRA inyecta matrices de bajo rango en las capas del UNet (y potencialmente en los text encoders), de modo que el modelo base permanece congelado y solo se entrenan los pesos del adaptador.

La model card no documenta el número de imágenes de entrenamiento, el número de pasos, la tasa de aprendizaje ni la composición del dataset. Tampoco se indica si hubo regularización o captions automáticos. El grafo de ComfyUI incluido en la model card muestra un `LoraLoader` con `strength_model` 0,8 y `strength_clip` 1, junto con un `CheckpointLoaderSimple` apuntando a un checkpoint de Civitai, un `smZ CLIPTextEncode` para prompt positivo y negativo, un `UpscaleModelLoader` y un `KSampler`. No se detalla ninguna innovación técnica adicional.

## Capacidades

- Generación de imágenes de ilustración estilo anime sobre el modelo base Illustrious XL.
- Reproducción de un personaje concreto ("sakie") mediante tokens descriptivos en el prompt.
- Control de rasgos mediante prompt: pelo castaño muy corto, ojos azules, mechones laterales, complexión marcada, camisa exterior amarilla, camiseta interior roja, pantalones marrones.
- Soporte de prompt negativo para mitigar artefactos (baja calidad, borroso, marca de agua, texto, ojos borrosos).
- Compatibilidad con el ecosistema diffusers y con flujos de ComfyUI.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de lenguaje: es exclusivamente un adaptador de imagen.

## Casos de uso

- Ilustración de personaje consistente: aplicar el LoRA con fuerza 0,8 sobre el checkpoint base para generar variaciones del personaje manteniendo rasgos faciales y de vestuario estables entre imágenes.
- Producción de fan art y cómics: generar paneles con el personaje en distintas poses y escenarios usando el prompt negativo para evitar texto y marcas de agua no deseadas.
- Prototipado de personajes para proyectos narrativos: iterar sobre el diseño visual antes de encargar arte final, aprovechando la velocidad de muestreo de SDXL.
- Generación de material promocional para comunidades de anime: crear ilustraciones de ambientación coherente con el personaje para redes o foros.
- Integración en pipelines de ComfyUI: usar el grafo documentado (checkpoint, LoRA, upscaler, KSampler) como plantilla para lotes automatizados.
- Experimentación con fuerza de LoRA: ajustar `strength_model` y `strength_clip` para equilibrar fidelidad al personaje frente a la estética del modelo base en estudios de estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica para el adaptador; el modelo base SDXL/Illustrious XL requiere habitualmente entre 6 y 10 GB en fp16 según resolución y optimizaciones, pero este dato no se confirma en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; depende del checkpoint base, no del LoRA.
- Opciones de despliegue: diffusers (pipeline declarado) y ComfyUI (grafo documentado en la model card).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shero448/sakie | LoRA de personaje | prefect-illustrious-xl-v15-sdxl | no disponible | no disponible | Hugging Face, 0 descargas |
| John6666/prefect-illustrious-xl-v15-sdxl | Checkpoint completo | SDXL / Illustrious XL | no disponible | no disponible | Hugging Face (referenciado como base) |
| LoRA de personaje genérico sobre SDXL | LoRA de personaje | SDXL | resolución nativa 1024×1024 | variable según autor | Hugging Face / Civitai |

No se dispone de datos de rendimiento comparativo entre estos artefactos en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial del adaptador; es imprescindible verificar también la licencia del checkpoint base antes de producción.
- Repositorio sin descargas ni likes y creado y actualizado el mismo día: no hay evidencia de validación por la comunidad.
- Model card con contenido corrupto (secuencia de nodos ComfyUI serializada en UTF-16) y sin documentación de entrenamiento: difícil de auditar y reproducir.
- Especialización estrecha: el LoRA solo aporta el personaje; cualquier limitación del modelo base (anatomía, texto en imagen, coherencia de escenas complejas) se hereda.
- Riesgo de sobreajuste al estilo del dataset de entrenamiento no documentado, con posible degradación de la estética del base si se sube la fuerza del LoRA.
- Sesgos: no documentados; los prompts de ejemplo incluyen términos de complexión explícitos, lo que puede orientar la generación hacia representaciones muy concretas.
- El prompt de ejemplo está en inglés; el soporte multilingüe de prompts no está confirmado.

## Enlaces

- Hugging Face: https://huggingface.co/Shero448/sakie
- Modelo base: https://huggingface.co/John6666/prefect-illustrious-xl-v15-sdxl
