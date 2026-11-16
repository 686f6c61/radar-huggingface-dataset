# fastforks/clipseg

## Resumen

CLIPSeg es un modelo de segmentación guiada por texto desarrollado originalmente por Timo Lüddecke y Alexander Ecker (Universidad de Göttingen) y publicado en el paper "Image Segmentation Using Text and Image Prompts" (arXiv:2112.10003). Combina un codificador CLIP ViT-B/16 congelado con un decodificador transformer ligero que genera máscaras de segmentación a partir de una descripción textual libre, sin necesidad de entrenamiento específico por clase. La versión aquí descrita es `fastforks/clipseg`, un repositorio de empaquetado que no aloja pesos propios: descarga y verifica los pesos oficiales de `CIDAS/clipseg-rd64-refined` y los expone mediante la librería `fastforks`.

El modelo resuelve el problema de la segmentación semántica promptable: dado un prompt de texto como "el perro marrón", produce una máscara binaria con todos los píxeles que corresponden al concepto. Es relevante para pipelines de visión por computador que necesitan segmentación zero-shot sin reentrenamiento, con un coste computacional muy bajo (unos pocos milisegundos por imagen en GPU moderna). La arquitectura es un transformer híbrido: torres CLIP congeladas más un decodificador con modulación FiLM condicionada por el embedding de texto.

El checkpoint `rd64-refined` usa una dimensión reducida de 64 en el decodificador y está afinado sobre PhraseCut. La resolución de trabajo es 352×352 (redimensionado sin preservar aspecto) y las máscaras resultantes son gruesas, con tokens de parche de 22×22. La licencia es Apache-2.0 tanto para el código como para los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: CLIP ViT-B/16 congelado + decodificador transformer con FiLM (reduce_dim 64) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; prompt de texto de longitud variable) |
| Tipos de cuantizacion | fp32, fp16 (soportados en la práctica); no se documentan GGUF ni int8 |
| Idiomas soportados | no disponible (los prompts de texto dependen del tokenizador CLIP BPE, entrenado principalmente en inglés) |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json`, `vocab.json` y `merges.txt` |
| Resolución de entrada | cualquier H×W ≥ 32, redimensionado a 352×352 |
| Salidas | `boxes`, `scores`, `masks` |
| Backends | `portable`, `kernels` |

## Arquitectura y entrenamiento

CLIPSeg sigue un diseño de dos etapas. Un codificador CLIP ViT-B/16 preentrenado por OpenAI permanece congelado y extrae características visuales y el embedding del prompt textual. Sobre esas características, un decodificador transformer ligero (con `reduce_dim` de 64 en este checkpoint) genera la máscara de segmentación, condicionado por el embedding de texto mediante capas FiLM (Feature-wise Linear Modulation). Esta separación permite reutilizar el conocimiento visual de CLIP sin reentrenarlo y mantener un coste de inferencia muy bajo.

El decodificador se entrena sobre PhraseCut, un dataset de máscaras referidas por frases sobre imágenes de Visual Genome. El checkpoint `rd64-refined` corresponde a una variante refinada con dimensión reducida. El paper original también explora prompts visuales (puntos y cajas), pero esta implementación de `fastforks` solo expone prompts de texto: una instancia por prompt, máscara definida por píxeles con probabilidad superior a 0,5, score como la probabilidad máxima y caja como el bounding box de la máscara. No se documenta RLHF ni DPO (no aplica a un modelo de segmentación).

## Capacidades

- Segmentación semántica guiada por texto libre: genera una máscara por prompt que cubre todos los píxeles del concepto nombrado.
- Salida estructurada con máscaras booleanas, scores de calidad y bounding boxes.
- Procesamiento de imágenes de cualquier tamaño a partir de 32×32, con padding a múltiplo de 32.
- Inferencia en fp16 y fp32, con backend `portable` (PyTorch) y backend `kernels` (kernels optimizados).
- Compatibilidad con `torch.compile` (3,19 ms frente a 4,45 ms del backend portable en 1024×1024).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No soporta visión conversacional ni audio.
- Soporte multilingüe de prompts: no disponible; el tokenizador CLIP BPE está orientado a inglés.

## Casos de uso

- Segmentación zero-shot en pipelines de anotación: dado un conjunto de imágenes y una lista de conceptos ("coche", "peatón", "semáforo"), el modelo genera máscaras para cada concepto sin entrenamiento adicional, lo que acelera el etiquetado previo a revisión humana.
- Edición de imágenes asistida por texto: integrar el modelo en una herramienta de edición para seleccionar regiones a partir de una frase ("la camiseta azul del sujeto") y aplicar operaciones de recorte, recoloreado o desenfoque sobre la máscara resultante.
- Moderación de contenido visual: detectar y localizar conceptos sensibles en imágenes mediante prompts textuales, usando los scores de confianza para priorizar revisiones.
- Automatización de tareas de recorte en comercio electrónico: extraer el producto de una foto de catálogo con un prompt del tipo "la zapatilla" y generar imágenes con fondo transparente a partir de la máscara y su bounding box.
- Análisis de imágenes médicas o científicas de baja resolución: segmentar estructuras nombradas en imágenes donde no se dispone de un modelo especializado, aceptando la coarseza de las máscaras de 22×22 tokens.
- Preprocesado para modelos downstream: generar máscaras de región de interés que alimenten clasificadores, detectores o modelos de OCR, reduciendo el área de procesamiento y el coste computacional.
- Prototipado rápido en investigación: evaluar la viabilidad de la segmentación promptable en un dominio concreto antes de invertir en un modelo especializado, gracias al bajo coste de inferencia (2,75 ms en 1024×1024 con backend `kernels`).

## Benchmarks y rendimiento

Datos de velocidad y memoria publicados en la model card (RTX 5060 Ti 16 GB, sm_120, entrada sintética 1024×1024):

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Aceleración kernels vs portable |
|---|---|---|---|---|---|---|
| clipseg | – | 15,3 | 4,45 | 2,75 | 5,6× | 1,6× |

| Modelo | Memoria pico original (MiB alloc/reserved) | Portable (MiB) | Kernels (MiB) |
|---|---|---|---|
| clipseg | 346 / 404 | 328 / 356 | 335 / 362 |

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| clipseg | 3,05 | 3,90 | 3,64 | 0,02 | 0,26 | 0,26 |

| Modelo | Entrada | Portable (ms) | Compile (ms) | TensorRT fp16 | Kernels (ms) | Preparación compile (s) |
|---|---|---|---|---|---|---|
| clipseg | 1024×1024 | 4,45 | 3,19 | planificado para 0.2.1 | 2,75 | 9,92 |

Paridad con el código original: en CPU y float32, diferencia máxima absoluta ≤ 0,0005; en GPU y float16 (por defecto), diferencia media absoluta ≤ 0,1 y p99 ≤ 0,5 sobre las cajas de salida. No se han publicado resultados de benchmarks de calidad de segmentación (mIoU, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: en torno a 330-400 MiB de memoria pico del allocator de PyTorch para una entrada de 1024×1024, según el backend.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 1 GB de VRAM libre; probado en RTX 5060 Ti 16 GB (sm_120). Funciona también en CPU en fp32.
- Cabe holgadamente en cualquier GPU consumer actual (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: librería `fastforks` (backends `portable` y `kernels`), `torch.compile`, y el modelo subyacente es `CLIPSegForImageSegmentation` de Hugging Face Transformers, por lo que puede cargarse con `transformers` directamente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a un modelo de segmentación).
- Latencia: 2,75 ms por imagen de 1024×1024 con backend `kernels` en RTX 5060 Ti; 3,19 ms con `torch.compile`; 4,45 ms con el backend portable. La primera llamada tarda 0,26 s (portable y kernels) por la compilación inicial. La carga del modelo tarda entre 3 y 4 segundos.
- Entradas grandes: probado hasta 3000×4000 en fp16 con el backend portable (0,7 GiB pico asignado, 0,9 GiB reservado).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fastforks/clipseg (este modelo) | Segmentación promptable por texto | no disponible (CLIP ViT-B/16 + decodificador) | 352×352 | Apache-2.0 | Hugging Face (repositorio de empaquetado) |
| CIDAS/clipseg-rd64-refined | Segmentación promptable por texto | no disponible | 352×352 | Apache-2.0 | Hugging Face (pesos originales) |
| Segment Anything (SAM) | Segmentación promptable por puntos/cajas | no disponible en la información | no disponible | no disponible en la información | no disponible en la información |
| SAM 2 | Segmentación promptable (vídeo e imagen) | no disponible en la información | no disponible | no disponible | no disponible en la información |

No se dispone de datos de benchmarks de calidad que permitan una comparación cuantitativa con alternativas. La diferencia principal frente a SAM y SAM 2 es que CLIPSeg acepta prompts de texto libre, mientras que los modelos de la familia SAM se orientan a prompts visuales (puntos, cajas, máscaras).

## Limitaciones y advertencias

- Solo acepta prompts de texto: no soporta ejemplares por caja ni prompts visuales en esta implementación, pese a que el paper original los explora.
- Una instancia por prompt: la máscara es el conjunto de píxeles con probabilidad superior a 0,5; no separa múltiples instancias del mismo concepto.
- La imagen se redimensiona a 352×352 sin preservar la relación de aspecto, lo que puede distorsionar objetos alargados.
- Máscaras gruesas: los tokens de parche son de 22×22, por lo que los bordes no son precisos.
- Requiere la librería opcional `transformers` (la red es `CLIPSegForImageSegmentation`).
- Los benchmarks se comparan contra el port de Hugging Face Transformers 5.19.0 con los pesos de CIDAS, no contra el código original de los autores (`timojl/clipseg`), que no se ejecutó.
- Riesgo de alucinación: el modelo puede generar máscaras para conceptos ausentes en la imagen, ya que siempre devuelve una máscara por prompt; conviene filtrar por el score de confianza.
- Idiomas: no hay información sobre calidad de prompts en idiomas distintos del inglés; el tokenizador CLIP BPE está orientado a inglés.
- Sesgos: no documentados en la información disponible; al heredar el codificador CLIP de OpenAI, puede arrastrar sesgos de los datos web de entrenamiento de CLIP.
- Licencia Apache-2.0 permite uso comercial, pero la model card advierte que se trata de un paquete de investigación y recomienda revisar las condiciones antes de otros usos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de adopción mínimo, lo que reduce la validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fastforks/clipseg
- Pesos originales: https://huggingface.co/CIDAS/clipseg-rd64-refined
- Paper: https://arxiv.org/abs/2112.10003
- Código de la librería fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original de referencia (Transformers, commit c4c4605f9618): https://github.com/huggingface/transformers
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Configuración de variantes (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/promptable_segmentation/models/clipseg/card.toml
- Evidencia de licencia: https://huggingface.co/CIDAS/clipseg-rd64-refined/blob/999e0328d9e10b484360c477313983f9afdd7050/README.md
