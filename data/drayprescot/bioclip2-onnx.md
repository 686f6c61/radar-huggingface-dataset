# DrayPrescot/bioclip2-onnx

## Resumen

`DrayPrescot/bioclip2-onnx` es una conversión a formato ONNX del codificador de imágenes de BioCLIP 2, el modelo de visión-lenguaje desarrollado por el Imageomics Institute para clasificación de especies biológicas mediante zero-shot image classification. No se trata de un modelo nuevo ni de un fine-tuning: es exclusivamente un cambio de formato que preserva los pesos originales de `imageomics/bioclip-2` (ViT-L/14) almacenados en float16 para reducir a la mitad el tamaño de descarga, hasta los 608 MB del fichero ONNX.

El modelo resuelve un problema muy concreto: permitir la identificación offline de especies animales en fotografías sin depender de un servidor ni de frameworks de deep learning pesados. Su autor lo publica como componente del gestor de fotos open source Lumenkorn, que lo emplea para etiquetar especies en la biblioteca local del usuario. La relevancia práctica está en que elimina la barrera de despliegue de BioCLIP 2 en aplicaciones de escritorio, a costa de excluir el codificador de texto (que debe calcularse por separado con OpenCLIP).

Arquitectónicamente es un Vision Transformer de tipo CLIP (ViT-L/14) con entrada de 224×224 píxeles y salida de embeddings de 768 dimensiones L2-normalizados. El repositorio incluye además un fichero auxiliar `bioclip2-tierarten.bin` de 8,6 MB con unas 10.000 especies animales, sus taxonomías y los embeddings de texto precalculados en int8, lo que permite usar el modelo como clasificador cerrado sin necesidad de ejecutar el encoder textual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer ViT-L/14 (CLIP), solo codificador de imagen |
| Parametros totales | no disponible (ViT-L/14, aproximadamente 300 M en el encoder visual) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | float16 (pesos ONNX); embeddings de texto auxiliares en int8 con escala por entrada |
| Idiomas soportados | no disponible (el modelo opera sobre imágenes; el fichero auxiliar incluye nombres en alemán e inglés) |
| Licencia | MIT |
| Formato de pesos | ONNX (`bioclip2-vision-fp16.onnx`) y binario propio (`bioclip2-tierarten.bin`) |

## Arquitectura y entrenamiento

El modelo subyacente, BioCLIP 2, es un transformer de tipo CLIP entrenado con aprendizaje contrastivo jerárquico sobre datos biológicos a gran escala, según el paper publicado en NeurIPS 2025 ("BioCLIP 2: Emergent Properties from Scaling Hierarchical Contrastive Learning"). El codificador visual es un ViT-L/14 que procesa imágenes de 224×224 y produce embeddings de 768 dimensiones. Esta conversión conserva únicamente ese codificador visual; el codificador de texto original no se incluye en el repositorio.

La conversión a ONNX no introduce ningún cambio en los pesos ni en el entrenamiento: es un export puro a float16. El autor verifica la fidelidad del export comparando los embeddings ONNX con los del modelo PyTorch original en OpenCLIP, obteniendo una similitud coseno ≥ 0,9999 sobre fotos de prueba. El preprocesado es el estándar de OpenCLIP: redimensionado del lado corto a 224 con interpolación bicúbica, recorte central de 224×224, escalado a 0–1 y normalización con media `[0.48145466, 0.4578275, 0.40821073]` y desviación `[0.26862954, 0.26130258, 0.27577711]`.

## Capacidades

- Extracción de embeddings visuales de 768 dimensiones L2-normalizados a partir de imágenes RGB de 224×224.
- Clasificación zero-shot de especies mediante similitud coseno entre el embedding de la imagen y embeddings de texto de nombres taxonómicos.
- Clasificación cerrada sobre un catálogo predefinido de unas 10.000 especies animales incluidas en `bioclip2-tierarten.bin`, con clase, familia y nombres en alemán e inglés.
- Funcionamiento completamente offline, sin dependencia de API ni de servicios externos.
- Inferencia por lotes (`batch` dinámico en la primera dimensión del tensor de entrada).
- No incluye generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multimodales más allá de la visión.
- No incluye el codificador de texto: para etiquetas nuevas hay que calcular sus embeddings con el modelo original en OpenCLIP.

## Casos de uso

- Gestión de fotografía personal offline: integración en aplicaciones de escritorio como Lumenkorn para etiquetar automáticamente especies animales en la biblioteca local del usuario, sin enviar imágenes a la nube y con un único fichero ONNX de 608 MB.
- Catalogación de biodiversidad en trabajo de campo: identificación de especies en fotografías tomadas sin conexión, usando el catálogo de 10.000 especies y los embeddings de texto precalculados en `bioclip2-tierarten.bin`.
- Ciencia ciudadana e iNaturalist: preetiquetado de observaciones antes de la validación humana, aprovechando que el catálogo cubre las especies más observadas en Europa, aves a nivel mundial, todos los primates y la fauna de Kenia, Tanzania y Sudáfrica.
- Filtrado y búsqueda semántica de imágenes: indexación de archivos fotográficos por similitud de embeddings para recuperar imágenes de una misma especie o taxón mediante búsqueda vectorial.
- Despliegue en aplicaciones móviles o embebidas: al ser ONNX float16 y no requerir el codificador de texto, puede ejecutarse con ONNX Runtime en entornos con recursos limitados y sin GPU dedicada.
- Investigación en ecología y conservación: clasificación por lotes de trampas cámara o datasets de imágenes para estudios de distribución de especies, con la ventaja de la reproducibilidad del formato ONNX y la licencia MIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta una verificación de fidelidad del export: similitud coseno ≥ 0,9999 entre los embeddings ONNX y los del modelo PyTorch original en OpenCLIP sobre fotos de prueba.

## Requisitos de hardware

- VRAM estimada: el fichero ONNX ocupa 608.910.301 bytes (unos 0,6 GB) en float16; en ejecución con ONNX Runtime se requiere aproximadamente esa cantidad más los buffers de activaciones, del orden de 1–2 GB en total.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060 o superior ofrece holgura para inferencia por lotes. En A100 o H100 el cuello de botella será el preprocesado, no el modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU, al tratarse de un ViT-L/14 en fp16.
- Opciones de despliegue: ONNX Runtime (principal), con soporte de ejecución en CPU y GPU; también es compatible con otros runtimes que acepten ONNX. No se distribuye en GGUF ni en formatos para llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DrayPrescot/bioclip2-onnx | ViT-L/14 (aprox. 300 M en el encoder visual) | Imagen 224×224, salida 768 dim | MIT | ONNX fp16 | Solo encoder visual; catálogo auxiliar de 10.000 especies |
| imageomics/bioclip-2 | ViT-L/14 | Imagen 224×224, salida 768 dim | MIT | PyTorch / safetensors | Modelo original completo, incluye encoder de texto |
| CLIP ViT-L/14 (OpenAI) | aprox. 428 M (visual + texto) | Imagen 224×224 | MIT | PyTorch, ONNX | Entrenado en datos web generales, no especializado en biología |
| SigLIP / otros CLIP biológicos | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

La diferencia principal frente al original es la ausencia del codificador de texto y el formato ONNX float16, que reduce el tamaño y simplifica el despliegue a cambio de requerir embeddings de texto precalculados para etiquetas nuevas.

## Limitaciones y advertencias

- Solo incluye el codificador de imagen: no puede generar embeddings de texto nuevos sin recurrir al modelo original en OpenCLIP.
- El catálogo `bioclip2-tierarten.bin` cubre unas 10.000 especies animales con sesgo geográfico hacia Europa, Kenia, Tanzania y Sudáfrica; especies fuera de ese conjunto requerirán embeddings de texto adicionales.
- Riesgo de confusión entre especies visualmente similares y de falsos positivos en imágenes de baja calidad, oclusiones o especímenes juveniles; el zero-shot no aporta calibración de confianza por defecto.
- La conversión a float16 puede introducir diferencias numéricas mínimas frente al modelo original, aunque el autor reporta similitud coseno ≥ 0,9999.
- Licencia MIT heredada del modelo original, lo que permite uso comercial; conviene citar a los autores de BioCLIP 2 según el BibTeX de la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria más allá de la verificación del autor.
- No se dispone de información sobre sesgos taxonómicos específicos, rendimiento en dominios distintos a la fotografía de fauna ni evaluación independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DrayPrescot/bioclip2-onnx
- Modelo original BioCLIP 2: https://huggingface.co/imageomics/bioclip-2
- Proyecto Lumenkorn: https://github.com/DrayPrescot/lumenkorn
- Herramientas de conversión y catálogo: https://github.com/DrayPrescot/lumenkorn/tree/main/tools/bioclip
- DOI del modelo original: https://doi.org/10.57967/hf/5765
- Paper BioCLIP 2 (NeurIPS 2025): https://proceedings.neurips.cc/paper_files/paper/2025/hash/94da80cb (referencia NEURIPS2025_94da80cb)
