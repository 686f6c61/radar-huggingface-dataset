# SeeSee21/QWEN-Anime

## Resumen

QWEN-Anime es un fine-tune especializado en generación y edición de imágenes con estética anime, desarrollado por el usuario SeeSee21 sobre la familia Qwen-Image-Edit de Alibaba. El modelo parte de los checkpoints Qwen-Image-Edit-2509 y Qwen-Image-Edit-2511, y añade un ajuste fino orientado a dominar el estilo anime tanto en síntesis desde cero (text-to-image) como en edición de imágenes existentes (image-to-image, con soporte de 1 a 3 imágenes de entrada). Se distribuye como un checkpoint "todo en uno" (AIO) que empaqueta VAE y codificador de texto en un único archivo, simplificando el despliegue en ComfyUI.

Con aproximadamente 20.400 millones de parámetros (20,43 mil millones según los safetensors publicados), el modelo se posiciona en la gama alta de los modelos de difusión para imagen, con un repo de 320,9 GB que aloja múltiples variantes: FP8 AIO, BF16, FP16 y cuantizaciones GGUF (F16, Q8, Q6_K, Q4_K_S). La licencia Apache 2.0 facilita su uso comercial, y su integración con ComfyUI mediante workflows incluidos reduce la barrera de entrada para estudios pequeños y creadores independientes.

Su relevancia actual radica en la combinación de edición multi-imagen (hasta tres referencias simultáneas) con un estilo anime consistente y un consumo de VRAM contenido (desde 8 GB en la variante AIO FP8, y hasta 6-8 GB con GGUF Q4). Esto lo convierte en una alternativa práctica frente a pipelines que requieren montar por separado VAE, text encoder y UNet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión basado en Qwen-Image-Edit (transformer de difusión, detalles internos no disponibles) |
| Parametros totales | 20.430.401.088 (~20,43 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a modelo de imagen; longitud de prompt no especificada) |
| Tipos de cuantizacion | FP8 (AIO), BF16, FP16, GGUF (F16, Q8, Q6_K, Q4_K_S) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

QWEN-Anime es un fine-tune (relación `finetune` respecto a los modelos base) de Qwen-Image-Edit-2509 y Qwen-Image-Edit-2511. La arquitectura subyacente corresponde a la familia Qwen-Image-Edit, un modelo de difusión para generación y edición de imágenes; la model card no detalla la composición interna (número de bloques, tipo de atención, dimensiones del transformer). El ajuste fino se orienta específicamente al estilo anime, aunque no se publican datos sobre el volumen del dataset de ajuste, su composición ni si se emplearon técnicas de RLHF/DPO (no aplicables habitualmente a modelos de difusión, pero no confirmado).

La innovación práctica más destacable es la distribución AIO: el checkpoint Beta3-AIO integra VAE y codificador de texto en un único archivo FP8 de aproximadamente 27 GB, eliminando la necesidad de cargar componentes por separado. Además, el modelo soporta edición con 1 a 3 imágenes de entrada, lo que permite composiciones y referencias múltiples en una sola pasada. Se recomienda inferencia con 4-8 pasos, CFG 1 y sampler Euler para la variante rápida, y hasta 20 pasos con CFG 3.5 para máxima calidad. No se especifican detalles sobre decodificación especulativa ni técnicas de atención lineal.

## Capacidades

- Generación de imágenes text-to-image con estética anime.
- Edición de imágenes image-to-image (instrucciones de edición sobre una imagen de entrada).
- Edición multi-imagen: acepta de 1 a 3 imágenes simultáneas como referencia o entrada.
- Integración nativa con ComfyUI mediante workflows incluidos en el repositorio.
- Distribución en múltiples formatos y precisiones para adaptarse a distintos presupuestos de VRAM.
- Soporte de inferencia en CPU mediante cuantizaciones GGUF (Q4_K_S, Q6_K, Q8, F16).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades de audio o vídeo (no aplicables a un modelo de imagen).
- Capacidad multilingüe limitada al inglés según los metadatos del modelo.

## Casos de uso

- **Generación de ilustraciones anime para producción editorial**: el modelo produce imágenes desde prompt en 4-8 pasos con CFG 1, lo que permite iterar rápidamente sobre bocetos y variantes de personaje en un flujo ComfyUI antes de la selección final.
- **Edición de personajes existentes**: con image-to-image, un ilustrador puede subir un diseño previo y aplicar instrucciones de edición (cambio de vestuario, expresión, fondo) manteniendo la identidad visual del personaje gracias al ajuste fino sobre estética anime.
- **Composición multi-referencia**: la edición con hasta 3 imágenes permite combinar un personaje, un fondo y un elemento de utilería en una sola generación, útil para key art y portadas de producto.
- **Prototipado rápido para videojuegos**: estudios pequeños pueden generar concept art y variaciones de assets en un único checkpoint AIO FP8 (27 GB), sin montar pipelines separados de VAE y text encoder.
- **Creación de contenido para redes y comunidades**: la variante GGUF Q4 (10 GB) permite ejecutar el modelo en GPUs de consumo con 6-8 GB de VRAM, habilitando a creadores individuales a generar ilustraciones anime de forma local.
- **Automatización de pipelines de contenido**: al integrarse en ComfyUI con workflows reutilizables, el modelo puede encadenarse en scripts de generación por lotes para catálogos, banners o ilustraciones de artículos, con parámetros fijos (pasos, CFG, sampler) para consistencia de estilo.
- **Restauración y reedición estilística**: a partir de una imagen base, aplicar instrucciones para reestilizar hacia anime conservando la composición original, útil en localización de material gráfico o adaptación de bocetos a estilo final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: desde 8 GB con la variante Beta3-AIO FP8 (checkpoint de ~27 GB); 6-8 GB con GGUF Q4_K_S (archivo de ~10 GB); más VRAM para BF16/FP16 completos.
- **GPU recomendadas**: no se especifican modelos concretos en la model card. Por el tamaño del checkpoint AIO FP8 y las cuantizaciones GGUF, se infiere compatibilidad con GPUs de consumo de 8 GB o más (gama RTX 30/40) y con GPUs de datacenter para las variantes BF16/FP16; la model card no confirma modelos concretos.
- **¿Cabe en GPU de consumo?**: sí, según el autor, con 8 GB o más de VRAM en la variante AIO FP8, y con 6-8 GB en GGUF Q4.
- **Opciones de despliegue**: ComfyUI (flujo principal, con workflows incluidos); GGUF para inferencia en CPU o GPU con poca VRAM. No se mencionan vLLM, TGI, llama.cpp ni Ollama (no aplicables a un modelo de difusión en este contexto).
- **Latencia y throughput**: no disponibles. La model card recomienda 4-8 pasos con CFG 1 y Euler para la variante rápida, lo que reduce el coste computacional frente a configuraciones de 20 pasos con CFG 3.5.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| QWEN-Anime (este) | ~20,43 mil millones | 1-3 imágenes de entrada (edición) | Apache 2.0 | Hugging Face, Civitai | Fine-tune anime sobre Qwen-Image-Edit-2509/2511; AIO FP8, GGUF |
| Qwen-Image-Edit-2511 (base) | no disponible | edición de imágenes | no disponible en la información | Hugging Face | Modelo base sin ajuste de estilo anime |
| Qwen-Image-Edit-2509 (base) | no disponible | edición de imágenes | no disponible en la información | Hugging Face | Modelo base previo, sin ajuste de estilo anime |
| Qwen-Image (Beta1, base legacy) | no disponible | text-to-image | no disponible en la información | Hugging Face | Base del linaje Beta1, sin edición multi-imagen |

No se dispone de datos de benchmarks ni de otros fine-tunes anime comparables en la información proporcionada; la comparativa se limita a los modelos base del propio linaje.

## Limitaciones y advertencias

- **Idioma**: solo se declara soporte de inglés (`en`); los prompts en castellano pueden degradar la calidad o requerir traducción previa.
- **Estilo especializado**: el ajuste fino está orientado a anime; otros estilos (fotorrealismo, ilustración occidental) pueden rendir por debajo del modelo base.
- **Riesgo de alucinación visual**: como modelo generativo, puede producir artefactos anatómicos, texto ilegible o inconsistencias entre imágenes de referencia en ediciones multi-imagen; no se documentan evaluaciones cuantitativas.
- **Sesgos**: no se publica información sobre sesgos de representación (género, etnia, corporalidad) en el dataset de ajuste; el sesgo del modelo base Qwen-Image-Edit no está documentado en esta ficha.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los modelos base Qwen-Image-Edit-2509/2511, cuyos términos no se detallan en la información disponible.
- **Madurez**: el modelo se etiqueta como "Beta" (Beta3-AIO como última versión), lo que sugiere inestabilidad potencial entre versiones y cambios de comportamiento.
- **Tamaño del repo**: 320,9 GB en total; la descarga selectiva de una sola variante es imprescindible para no saturar el almacenamiento.
- **Sin benchmarks**: no hay métricas publicadas (FID, CLIP score, evaluaciones humanas), lo que dificulta comparaciones objetivas en producción.
- **Dependencia de ComfyUI**: el flujo recomendado asume ComfyUI y sus workflows; otros entornos requieren adaptación manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SeeSee21/QWEN-Anime
- Perfil del autor en Hugging Face: https://huggingface.co/SeeSee21
- Modelo base Qwen-Image-Edit-2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Modelo base Qwen-Image-Edit-2509: https://huggingface.co/Qwen/Qwen-Image-Edit-2509
- Página en Civitai: https://civitai.red/models/2122738
- Canal de YouTube del autor: https://www.youtube.com/@SeeSee-AI
- GitHub del autor: https://github.com/seesee75-commits
