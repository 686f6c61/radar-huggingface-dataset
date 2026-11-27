# OpenMOSS-Team/MOSS-VL-Base-0408

## Resumen

MOSS-VL-Base-0408 es el checkpoint fundacional de la familia MOSS-VL, un modelo vision-lenguaje multimodal desarrollado por OpenMOSS. Se trata de un modelo base entrenado exclusivamente mediante cuatro etapas de preentrenamiento multimodal, sin ajuste supervisado ni alineamiento por preferencias, concebido como punto de partida de alta capacidad para tareas de ajuste fino, alineamiento y adaptación a dominio en comprensión de imagen y vídeo.

El modelo emplea una arquitectura basada en cross-attention que desacopla la codificación visual del razonamiento cognitivo, con un total de 11.336.371.208 parámetros (aproximadamente 11,3 mil millones) en formato safetensors bfloat16, lo que resulta en un repositorio de 22,7 GB. Soporta de forma nativa resoluciones dinámicas, entradas intercaladas de imagen y vídeo, marcas de tiempo absolutas en secuencias de vídeo y un mecanismo propio de RoPE tridimensional para cross-attention denominado XRoPE.

Su relevancia actual radica en que ofrece un backbone multimodal abierto bajo licencia Apache 2.0, con soporte explícito para comprensión de vídeo largo e interacción en streaming en tiempo real dentro de la familia MOSS-VL, y con un informe técnico publicado que documenta el pipeline de preentrenamiento. Está orientado a investigadores y equipos que necesitan una base sólida sobre la que construir modelos especializados sin partir de cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con cross-attention (codificación visual desacoplada del razonamiento), XRoPE (RoPE 3D para cross-attention) |
| Parametros totales | 11.336.371.208 (~11,3 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el pipeline incluye una etapa de extensión de contexto largo, sin cifra publicada) |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

MOSS-VL-Base-0408 se construye sobre una arquitectura de cross-attention que separa la codificación visual del módulo de razonamiento lingüístico, en lugar de proyectar los tokens visuales directamente al espacio del modelo de lenguaje. Esta decisión permite procesar imágenes y fotogramas de vídeo a su relación de aspecto y resolución originales (resolución dinámica nativa) y aceptar combinaciones arbitrarias de imágenes y vídeos intercalados en una misma secuencia sin preprocesamiento específico por modalidad. El mecanismo XRoPE proyecta tokens de texto y características visuales en un espacio de coordenadas 3D definido por tiempo (t), altura (h) y anchura (w), lo que mejora el anclaje espacio-temporal durante el razonamiento multimodal. Además, el modelo inyecta marcas de tiempo absolutas junto a los fotogramas muestreados para que pueda percibir el ritmo y la duración de los eventos.

El entrenamiento se limita a cuatro etapas progresivas de preentrenamiento multimodal: (1) alineamiento visión-lenguaje, (2) preentrenamiento multimodal a gran escala, (3) preentrenamiento multimodal de alta calidad y (4) annealing y extensión de contexto largo. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO; de hecho, el propio autor indica que este checkpoint es solo base y está pensado para recibir ajuste supervisado y alineamiento posteriores. El preprocesamiento visual usa parches de 16×16 con `temporal_patch_size=1` y `merge_size=2`, y admite límites de resolución muy altos (hasta `longest_edge=16777216` y `video_max_pixels=201326592` en los ejemplos de la model card).

## Capacidades

- Comprensión de imágenes a resolución y relación de aspecto nativas, incluyendo fotografías de alta resolución, escaneos de documentos densos y capturas ultraanchas.
- Comprensión de vídeo, incluyendo vídeo largo, con muestreo de fotogramas a FPS configurable e inyección de marcas de tiempo absolutas.
- Entrada intercalada de imágenes y vídeos en una misma secuencia, con soporte para comparación multi-imagen y narrativas visuales mixtas.
- Extracción de características y representaciones visual-lingüísticas de propósito general (pipeline `feature-extraction`).
- Generación de texto condicionada por imagen o vídeo (pipeline `video-text-to-text`).
- Capacidades multilingües limitadas a inglés y chino.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada (es un checkpoint base sin alineamiento).
- Modo thinking explícito, visión en streaming en tiempo real: la familia MOSS-VL lo anuncia, pero este checkpoint base concreto no lo documenta como capacidad lista para uso.

## Casos de uso

- Punto de partida para ajuste fino supervisado: el modelo está diseñado explícitamente como base para SFT y alineamiento; un equipo puede añadir un cabezal o adaptador específico de tarea y entrenar sobre él con datasets propios de imagen o vídeo.
- Adaptación a dominio vertical: al ser un backbone multimodal de 11,3 mil millones de parámetros con licencia Apache 2.0, permite ajustar sobre datos propios de radiología, inspección industrial o teledetección sin restricciones de uso comercial.
- Análisis de documentos y capturas: la resolución dinámica nativa y el soporte de imágenes ultraanchas lo hacen adecuado para procesar escaneos densos, tablas e interfaces de usuario donde el detalle espacial importa.
- Comprensión de vídeo largo para investigación: con marcas de tiempo absolutas y muestreo configurable de FPS, sirve para experimentos de grounding temporal, resumen de eventos y respuesta a preguntas sobre vídeo.
- Comparación multi-imagen: el soporte de entradas intercaladas permite tareas de comparación visual (antes/después, producto A frente a producto B, evolución temporal de una escena) en una sola secuencia.
- Base para sistemas de interacción en streaming: aunque el checkpoint no implementa la interacción en tiempo real de la familia, su arquitectura de cross-attention y su manejo temporal lo convierten en candidato para desarrollar variantes de streaming tras el ajuste correspondiente.
- Extracción de embeddings visual-lingüísticos: mediante el pipeline `feature-extraction`, puede usarse para generar representaciones conjuntas en sistemas de búsqueda multimodal o recuperación imagen-texto tras el ajuste adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 23 GB solo para pesos, más el coste de activaciones y del codificador visual; en la práctica se recomienda un mínimo de 40 GB para secuencias cortas y bastante más para vídeo de alta resolución.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para inferencia cómoda con resolución alta y vídeo; A100 40 GB puede ser suficiente para imagen a resolución moderada.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en bfloat16 sin cuantización; con cuantización a 8 bits podría ajustarse al límite, pero no se documentan pesos cuantizados oficiales.
- Opciones de despliegue: la model card solo documenta `transformers` con `trust_remote_code=True`, `device_map="auto"`, `torch_dtype=torch.bfloat16` y `flash_attention_2`. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni comparaciones con otros modelos de la misma categoría, por lo que no es posible establecer una comparativa rigurosa con alternativas.

## Limitaciones y advertencias

- Es un checkpoint exclusivamente base: no ha pasado por SFT ni por alineamiento, por lo que su comportamiento conversacional y su fiabilidad en instrucciones no están garantizadas.
- Riesgo de alucinación y de generación de contenido no verificado, especialmente en tareas de razonamiento visual complejas sin ajuste posterior.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano ni de otras lenguas.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; cabe esperar los sesgos presentes en los corpus de preentrenamiento multimodal, no especificados.
- Longitud de contexto: no se publica una cifra concreta, aunque el pipeline incluye una etapa de extensión de contexto largo; conviene validar empíricamente el límite real antes de producción.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar dicho código antes de desplegarlo.
- No se documentan pesos cuantizados oficiales, lo que limita el despliegue en hardware de consumo.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo base sin alineamiento, la responsabilidad sobre el comportamiento final recae en quien lo ajuste y despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Base-0408
- Informe técnico (arXiv 2608.15045): https://arxiv.org/pdf/2608.15045
- Referencia adicional citada en los tags (arXiv 2606.07639): https://arxiv.org/abs/2606.07639
- Web de MOSS AI: https://www.moss-ai.com/models/moss-vl
- Documentación de la API MOSS (comprensión de imagen y vídeo): https://platform.moss.cn/en/docs/scenarios/image-video-understanding
