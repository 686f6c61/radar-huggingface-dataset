# shigure0110/krea2-style-lora-pair

## Resumen

El repositorio `shigure0110/krea2-style-lora-pair` contiene un par de adaptadores LoRA de rango 32 para el modelo de difusión flow-matching Krea 2, creado por shigure0110. Los dos adaptadores, `mretsis_krea2_v1` y `freestyle_krea2_v1`, se entrenaron como un estudio controlado con exposición casi idéntica (2680 y 2880 pasos totales), de modo que sus fortalezas se componen como un eje de interpolación lineal. El modelo base es `Comfy-Org/Krea-2`, un DiT de 28 bloques principales con codificador de texto Qwen3-VL-4B y VAE Qwen-Image. Cada adaptador tiene 117,3 millones de parámetros entrenables, rank 32 y alpha 32, y se inyecta solo en el DiT. La relevancia del par es metodológica: exposición emparejada, pre-caché de latentes y embeddings para reducir VRAM, y una política de captioning invertida que mantiene controlables los atributos descritos y fija el estilo en el trigger token. La longitud de contexto no se especifica en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre DiT Krea 2 (flow-matching, 28 bloques principales), con codificador de texto Qwen3-VL-4B y VAE Qwen-Image |
| Parámetros totales | 117,3 M por adaptador (2 adaptadores: 234,6 M en total; modelo base no incluido) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos almacenados en fp32, 447 MiB por archivo) |
| Idiomas soportados | en, zh (según metadatos) |
| Licencia | krea-2-community-license |
| Formato de pesos | No disponible (el modelo base se distribuye en safetensors; los adaptadores no especifican formato) |

## Arquitectura y entrenamiento

Los adaptadores son LoRA estándar (`networks.lora_krea2` de musubi-tuner) con rank 32 y alpha 32, lo que da un factor de escala de 1. Se inyectan en 264 módulos del DiT (792 tensores: `alpha`, `lora_down.weight`, `lora_up.weight` por módulo), sumando 117,3 millones de parámetros entrenables por adaptador. El entrenamiento se realizó con `kohya-ss/musubi-tuner` en bf16, con `timestep_sampling krea2_shift`, `sdpa`, `gradient_checkpointing`, `fp8_base` y `fp8_scaled`, y optimizador AdamW8bit con learning rate 1e-4.

Los datos de entrenamiento son dos corpus de arte de terceros no redistribuidos: `mretsis` (67 capturas de CG de videojuegos) y `freestyle` (96 ilustraciones de artistas en línea). Ambos se preprocesaron con aspect-ratio bucketing a un área de 1024², sin recorte ni reescalado, preservando composición y detalle nativo. Las latentes (VAE) y los embeddings de texto (Qwen3-VL-4B, ~8 GB) se almacenaron en caché en disco en dos pasadas previas, lo que permitió que el entrenamiento cupiera en 32 GB sin block swapping. La política de captioning es deliberadamente inversa a la habitual: todo atributo que deba ser modificable en inferencia se escribe en el caption, mientras que lo que debe permanecer constante no se menciona y queda absorbido por el trigger token. La exposición se igualó mediante `n_images × num_repeats × epochs`: `mretsis` con 67 imágenes × 4 repeticiones × 10 épocas = 2680 pasos, y `freestyle` con 96 × 3 × 10 = 2880 pasos, una diferencia residual del 7,5%.

## Capacidades

- Transferencia de estilo en generación de imágenes: dos estilos distintos, `mretsis` (CG de videojuegos) y `freestyle` (ilustración de artistas en línea), aplicables como adaptadores LoRA sobre Krea 2.
- Composición de estilos: el par está diseñado para que las fortalezas de ambos adaptadores se compongan como un eje continuo de interpolación lineal, permitiendo mezclas finas entre los dos estilos mediante los valores de fuerza.
- Control de atributos por prompt: gracias a la política de captioning, la ropa, la pose, el fondo, la expresión y el tamaño de plano permanecen controlables por el prompt, mientras que las características pictóricas quedan fijas en el trigger token.
- Pipeline text-to-image: compatible con ComfyUI mediante `LoraLoaderModelOnly` sobre el DiT, sin adaptación del codificador de texto.
- Idiomas: los metadatos declaran soporte para inglés y chino (en, zh).
- No se especifican capacidades de tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Generación de ilustraciones con estilo `freestyle` para portadas de novelas visuales: se carga el adaptador `freestyle_krea2_v1` en ComfyUI y se usa el trigger token junto con un prompt que describe la escena; la estética pictórica se aplica de forma consistente sin necesidad de reentrenar el modelo base.
- Creación de arte conceptual para videojuegos con estética `mretsis`: el adaptador `mretsis_krea2_v1` permite generar escenas con iluminación y composición de CG de videojuegos, manteniendo el control sobre la pose y el fondo mediante el prompt.
- Mezcla controlada de estilos: usando ambos adaptadores con fortalezas ajustadas (por ejemplo, `mretsis` 0,3 y `freestyle` 0,7), se pueden obtener variaciones intermedias que interpolan entre los dos estilos, gracias a la exposición emparejada.
- Producción de assets con estilo consistente: en un pipeline de ComfyUI, se puede cargar el LoRA sobre el DiT para generar una serie de imágenes que compartan el mismo estilo pictórico, lo que resulta útil para concept art, storyboards o mockups.
- Investigación en adaptación de bajo rango: el par sirve como referencia para estudiar el efecto de la exposición en el entrenamiento de LoRA, ya que la única variable entre los adaptadores es el corpus de imágenes y el número de repeticiones, con exposición casi idéntica.
- Prototipado rápido de personajes: con el trigger token y captions largos, se pueden generar variaciones de un personaje (cambios de ropa, pose, fondo) manteniendo el estilo del adaptador, sin perder la coherencia estética.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README menciona una ablación 5 × 5 de fortalezas y umbrales de fallo, pero no se incluyen los resultados en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El entrenamiento cupo en 32 GB gracias al pre-caché de latentes y embeddings, pero no se proporcionan datos de VRAM para inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI con `LoraLoaderModelOnly` (inferencia), musubi-tuner (entrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que son específicos de modelos de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos comparables de otros adaptadores LoRA para Krea 2, y los resultados de la búsqueda web mencionan modelos similares (por ejemplo, "Krea 2 Style Reference LoRA" en Civitai) pero sin especificaciones detalladas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Los datos de entrenamiento son arte de terceros recopilado para investigación privada y uso personal, sin licencia comercial obtenida. Los adaptadores se publican con fines de documentación metodológica, no como producto licenciado; los usuarios son responsables del cumplimiento de la licencia del modelo base y de la legislación de copyright aplicable.
- La licencia del modelo base es `krea-2-community-license`, que puede imponer restricciones adicionales al uso comercial o a la redistribución.
- Los adaptadores se almacenan en fp32, lo que resulta en archivos de 447 MiB cada uno, un tamaño considerable para solo 117,3 millones de parámetros entrenables.
- El pre-caché de embeddings de texto es sensible a cambios en los captions: si un caption se modifica, la caché debe reconstruirse; de lo contrario, el entrenamiento continúa con embeddings obsoletos.
- La política de captioning invertida implica que cualquier atributo no mencionado en el caption queda absorbido por el trigger token y se vuelve fijo, lo que puede limitar la flexibilidad si se desea cambiar ese atributo en inferencia.
- No se han documentado sesgos conocidos, pero al tratarse de arte de terceros, es probable que existan sesgos estéticos inherentes a los corpus de entrenamiento.
- El riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero la generación de imágenes puede producir artefactos o composiciones no deseadas si el prompt entra en conflicto con el estilo del adaptador.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/shigure0110/krea2-style-lora-pair
- Modelo base: https://huggingface.co/Comfy-Org/Krea-2
- Licencia del modelo base: https://huggingface.co/Comfy-Org/Krea-2
- Herramienta de entrenamiento: https://github.com/kohya-ss/musubi-tuner
- Artículo sobre LoRA de Krea 2 (contexto del ecosistema): https://www.stablediffusiontutorials.com/2026/06/krea2-lora-models.html
- Modelo similar en Civitai: https://civitai.com/models/2764349/krea-2-style-reference-lora
