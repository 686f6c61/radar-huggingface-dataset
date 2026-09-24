# alibaba-pai/Qwen-Image-2.1-Fun-Controlnet-Union

## Resumen

Qwen-Image-2.1-Fun-Controlnet-Union es un checkpoint de rama ControlNet-Union para el modelo de difusión de texto a imagen Qwen-Image 2.1, un transformer DiT entrenado con flow matching. Lo publica la organización alibaba-pai (Alibaba PAI) y su función es añadir control estructural explícito sobre la generación: un único fichero cubre ocho condiciones (Canny, Depth, Grayscale, HED, Lineart, MLSD, Pose y Scribble) además de inpainting, sin necesidad de cambiar de checkpoint por condición.

El repositorio contiene únicamente la rama de control, no el modelo completo. El fichero `Qwen-Image-2.1-Fun-Controlnet-Union.safetensors` pesa aproximadamente 7,0 GB e incluye `control_img_in` más 16 `control_blocks`; se carga con `strict=False` sobre el transformer base de Qwen-Image 2.1, que el usuario debe aportar por separado. El repo completo ocupa 7,6 GB y la librería asociada es videox_fun, con código en el repositorio GitHub VideoX-Fun.

Su relevancia práctica está en la unificación: en lugar de mantener ocho ControlNet independientes (uno por tipo de mapa de control), un solo branch de 16 puntos de inyección cubre todas las condiciones y además comparte rama con la reconstrucción de regiones enmascaradas, de modo que control e inpainting pueden combinarse en una misma generación. Está pensado para pipelines de generación de imagen controlada y de edición, no para generación de texto ni tareas de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (transformer de difusión) con flow matching; rama ControlNet-Union acoplada al transformer base Qwen-Image 2.1 |
| Parámetros totales | No disponible (no se declara el recuento de parámetros; el repo son 7,6 GB y el checkpoint de la rama de control ~7,0 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en sentido autorregresivo; el prompt se codifica con un codificador de texto Qwen3-VL. No se documenta límite de tokens |
| Tipos de cuantización | No disponible (se publica un único fichero safetensors; no se listan variantes GGUF, FP8 ni cuantizadas) |
| Idiomas soportados | No disponible (el codificador es Qwen3-VL, multilingüe por familia, pero la model card no declara idiomas) |
| Licencia | `other`, con nombre `qwen-research` y fichero LICENSE en el repo (licencia de investigación; revisar términos antes de uso comercial) |
| Formato de pesos | safetensors (`Qwen-Image-2.1-Fun-Controlnet-Union.safetensors`) |
| Puntos de inyección de control | 16 (`control_layers = [0, 2, 4, …, 30]` sobre 32 bloques del transformer) |
| Dimensión de entrada de control | `control_in_dim = 129` = latentes de control (64) + máscara (1) + latentes de imagen enmascarada (64) |
| Condiciones soportadas | Canny, Depth, Grayscale, HED, Lineart, MLSD, Pose (DWPose), Scribble e inpainting; combinables |
| Escala de control | `control_context_scale`, de 0,0 (rama de control desactivada) a 1,0 (control máximo, valor usado en los ejemplos) |
| Salida | Imagen decodificada por un VAE en formato RGBA, guardada como PNG |
| Librería | videox_fun |

## Arquitectura y entrenamiento

La rama de control se injerta sobre un transformer de difusión de 32 bloques. La inyección es densa: se conecta un skip a uno de cada dos bloques (`control_layers = [0, 2, 4, …, 30]`), lo que da 16 puntos. Cada skip se reincorpora a la rama principal mediante proyecciones `before_proj` y `after_proj` con puerta a cero (zero-gated), de forma que el modelo base permanece congelado y el control modula su comportamiento sin reentrenarlo. El factor `control_context_scale` multiplica cada skip antes de sumarlo a la rama principal, lo que permite graduar la adherencia estructural entre 0,0 y 1,0.

La particularidad de diseño es que control e inpainting comparten la misma rama. La entrada de control tiene una anchura de 129 canales que concatenan latentes de control (64), máscara (1) y latentes de la imagen enmascarada (64). Para control puro, los canales de máscara e imagen enmascarada se rellenan con ceros; para inpainting, la misma rama redibuja la región enmascarada a partir del prompt. Al poder alimentar simultáneamente una imagen de control y una máscara, la región redibujada respeta tanto la descripción textual como la estructura proporcionada.

El modelo usa muestreo rápido con CFG destilado: los scripts de ejemplo funcionan con `guidance_scale = 1.0`, es decir, una sola pasada forward por paso, sin necesidad de classifier-free guidance. El prompt se codifica con un codificador de texto y procesador Qwen3-VL. Las muestras publicadas se generaron con `num_inference_steps = 40`, `control_context_scale = 1.0` y semilla 43. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO (poco habituales en modelos de difusión, pero no confirmado ni desmentido en la model card).

## Capacidades

- Generación de imagen a partir de texto (text-to-image) con control estructural explícito mediante mapa de control.
- Edición de imagen (image-to-image) preservando la estructura indicada por la condición de control.
- Inpainting: redibujo de regiones enmascaradas guiado por el prompt.
- Control combinado: uso simultáneo de una imagen de control y una máscara para redibujar una zona respetando además la estructura dada.
- Ocho condiciones estructurales en un solo checkpoint: Canny, Depth, Grayscale, HED, Lineart, MLSD, Pose (esqueleto DWPose) y Scribble.
- Tolerancia a variaciones en la imagen de control: distintos grosores de línea, umbrales y recortes sobre una imagen RGB corriente en el lienzo objetivo.
- Control graduable de la intensidad de la guía estructural mediante `control_context_scale`.
- Muestreo rápido sin CFG (`guidance_scale = 1.0`, una pasada por paso).
- Salida en RGBA mediante VAE y guardado en PNG.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje ni un agente.

## Casos de uso

- Ilustración con composición fijada: se parte de un boceto o de un mapa de bordes Canny y el modelo genera la imagen final respetando la silueta, útil cuando el encargo exige mantener una composición concreta aprobada previamente.
- Retoque y eliminación de objetos: con la máscara de la zona a sustituir y un prompt que describa la imagen completa, la rama de inpainting redibuja la región de forma coherente con el resto del lienzo.
- Sustitución de objetos con estructura impuesta: combinando máscara y mapa de control se puede redibujar un elemento manteniendo la pose o las líneas del original, por ejemplo cambiar el material de un mueble sin alterar su geometría (MLSD es especialmente adecuado para interiores y arquitectura).
- Transferencia de pose en personajes: con un esqueleto DWPose como control se generan figuras que reproducen exactamente la postura indicada, aplicable a ilustración de personajes, cómics o previsualización de animación.
- Coloración de lineart: a partir de un dibujo a línea limpio (Lineart o Scribble) más un prompt descriptivo, se obtiene la versión coloreada manteniendo el trazo original intacto.
- Previsualización arquitectónica y de producto: los mapas MLSD y Depth permiten generar renders fotorrealistas a partir de un modelo geométrico o de un volumen aproximado, útil para iterar propuestas antes del render final.
- Guion gráfico y storyboard: partiendo de bocetos rápidos (Scribble) se producen viñetas acabadas de forma consistente, acelerando la fase de preproducción audiovisual.
- Aumento de datos para entrenamiento: generar variaciones fotorrealistas controladas por pose o profundidad sobre una misma estructura, para ampliar datasets de visión por computador con pares imagen-estructura alineados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la información disponible (ni FID, ni CLIP score, ni comparativas numéricas frente a otros ControlNet). La model card únicamente incluye una galería cualitativa de ejemplos por condición. Los parámetros de reproducción de esas muestras son los siguientes:

| Parámetro de generación | Valor |
|---|---|
| `num_inference_steps` | 40 |
| `control_context_scale` | 1,0 |
| `guidance_scale` | 1,0 (CFG destilado, una pasada por paso) |
| Semilla | 43 |
| Condiciones mostradas | Canny, Depth, Grayscale, HED, Lineart, MLSD, Pose, Scribble |
| Formato de salida de los ejemplos | PNG (RGBA) |

No se publican métricas de latencia, throughput ni comparación con otros checkpoints de control.

## Requisitos de hardware

- VRAM estimada para la rama de control: en torno a 7,0 GB si se carga en bf16/fp16 (tamaño del checkpoint). Estimación derivada del tamaño del fichero, no confirmada por el autor.
- VRAM total: no disponible. Hay que sumar a la rama de control el transformer base de Qwen-Image 2.1, el codificador de texto Qwen3-VL y el VAE, cuyos tamaños no se detallan en la información proporcionada. El requisito real depende del modelo base elegido y del modo de carga.
- GPU recomendadas: no disponibles en la información. Como referencia condicional, si el conjunto base + control excede los 24 GB, serían necesarias GPU de datacenter (A100 40/80 GB, H100) o el uso de offload.
- Viabilidad en GPU de consumo: no confirmada. Una RTX 4090 (24 GB) podría ser suficiente solo si la carga del modelo base entra en memoria; el autor no publica requisitos mínimos ni configuraciones probadas.
- Opciones de despliegue: la vía indicada es la librería videox_fun, con código en el repositorio GitHub VideoX-Fun. No se documentan otros backends. Herramientas como vLLM, llama.cpp, Ollama o TGI no aplican a este tipo de modelo de difusión en el estado descrito.
- Latencia y throughput: no publicados. Como referencia cualitativa, al usar CFG destilado con `guidance_scale = 1.0` se realiza una sola pasada forward por paso en lugar de dos, pero no hay cifras absolutas de tiempo por imagen.
- Carga del checkpoint: se realiza con `strict=False` sobre el transformer base, lo que implica que ambos deben estar disponibles en disco simultáneamente.

## Comparativa con modelos similares

No se dispone de datos publicados de modelos comparables en la información proporcionada (no hay benchmarks ni especificaciones de alternativas). La comparación más directa que puede establecerse con los datos disponibles es frente al propio modelo base, sin rama de control:

| Modelo | Rama de control | Condiciones soportadas | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen-Image-2.1-Fun-Controlnet-Union | Sí, 16 puntos de inyección sobre 32 bloques | 8 condiciones + inpainting, combinables | qwen-research (`other`) | HuggingFace, repo de 7,6 GB |
| Qwen-Image 2.1 (base) | No | No aplica (text-to-image sin control estructural) | No disponible en la información | Referenciado en el repositorio VideoX-Fun |
| Otros checkpoints ControlNet-Union de la misma categoría | No disponible | No disponible | No disponible | No disponible |

No se han encontrado en la búsqueda web alternativas comparables ni datos de rendimiento relativo.

## Limitaciones y advertencias

- No es un modelo autónomo: el repositorio contiene solo la rama de control. Requiere descargar y cargar el transformer base de Qwen-Image 2.1 por separado.
- Licencia `qwen-research` (`other`, con fichero LICENSE propio). Es una licencia de investigación: hay que revisar sus términos antes de cualquier uso comercial o despliegue en producción.
- Ausencia total de benchmarks: no hay métricas objetivas de fidelidad estructural, calidad de imagen ni comparación con alternativas. La evaluación publicada es puramente cualitativa.
- Riesgo de artefactos y de alucinación visual: como todo modelo generativo de imagen, puede introducir detalles inexistentes, deformar anatomías o ignorar parcialmente la estructura cuando el prompt y el mapa de control entran en conflicto.
- El control estructural no es exacto ni determinista: distintos grosores de línea, umbrales o recortes producen resultados diferentes; el propio autor indica tolerancia a esas variaciones, no reproducción exacta.
- Preprocesado necesario: cada condición (Canny, Depth, HED, Lineart, MLSD, Pose con DWPose, Scribble) requiere su propio extractor para generar el mapa de control; el checkpoint no calcula los mapas a partir de imágenes RGB.
- Idiomas no declarados: la model card no especifica el soporte multilingüe del prompt, aunque el codificador Qwen3-VL es de familia multilingüe. El comportamiento en castellano no está documentado ni evaluado.
- Recomendación de prompt poco habitual: hay que describir la imagen objetivo completa, no solo la región a redibujar, ya que la máscara se comunica por canal y no por texto. Los prompts detallados dan mayor estabilidad según el autor.
- Adopción temprana y poco contraste: el modelo acumula 17 "likes" y 0 descargas en el momento de los datos, actualizado un día después de su creación. No hay evidencia de uso en producción ni reportes independientes.
- Sin datos de sesgo: no se documenta la composición del dataset de entrenamiento, por lo que no puede evaluarse el sesgo demográfico, cultural o estilístico de las generaciones.
- Requisitos de memoria no publicados: la viabilidad en GPU de consumo es incierta y depende del modelo base y del uso de offload, con el coste de latencia asociado.
- Metadatos con fechas de 2026 (creación 2026-09-23, actualización 2026-09-24), tal y como los declara el repositorio; conviene verificarlas en la ficha original.

## Enlaces

- HuggingFace: https://huggingface.co/alibaba-pai/Qwen-Image-2.1-Fun-Controlnet-Union
- Repositorio de código VideoX-Fun: https://github.com/aigc-apps/VideoX-Fun
- Referencia al modelo base Qwen-Image 2.1: https://github.com/aigc-apps/VideoX-Fun
- Fichero de licencia: LICENSE dentro del repositorio de HuggingFace
- Búsqueda web: los resultados obtenidos corresponden a páginas comerciales de Alibaba.com, Alibaba Group y AliExpress, sin relación con el modelo. No se han encontrado papers, blogs ni demos adicionales relevantes.
