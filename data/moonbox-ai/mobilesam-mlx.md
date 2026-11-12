# moonbox-ai/MobileSAM-MLX

## Resumen

MobileSAM-MLX es una conversión a MLX del modelo MobileSAM v2, un segmentador de imágenes derivado de Segment Anything (SAM) de Meta, desarrollado originalmente por Chaoning Zhang y colaboradores. Esta versión concreta la publica moonbox-ai y su objetivo es permitir la inferencia de segmentación por punto o caja sobre Apple Silicon de forma nativa, sin depender de PyTorch. El repositorio contiene únicamente la mitad de segmentación guiada por prompt (codificador de imagen TinyViT-5M más el codificador de prompt y el decodificador de máscaras de SAM), no la parte de muestreo automático de objetos de MobileSAM v2.

El modelo es relevante porque comprime el codificador de imagen de SAM (ViT-H, ~630 M de parámetros) a un TinyViT de aproximadamente 10 M de parámetros, manteniendo una calidad de máscara prácticamente idéntica según las comprobaciones del autor. Con un peso de 19,6 MB en fp16, cabe en cualquier Mac con Apple Silicon y permite segmentación interactiva en milisegundos, lo que lo hace útil para prototipado, herramientas de anotación y pipelines ligeros de visión.

La conversión incluye cinco precisiones (fp16, bf16, 8bit, 6bit y 4bit) con verificaciones de IoU frente al original en PyTorch fp32. Solo fp16 y bf16 superan el umbral de calidad fijado (IoU >= 0,95 por máscara); las variantes cuantizadas se marcan como experimentales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TinyViT-5M (codificador de imagen) + codificador de prompt y decodificador de máscaras de SAM |
| Parametros totales | ~10 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | fp16, bf16, 8bit, 6bit, 4bit (cuantización afín de MLX, group size 64; convoluciones y normas en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `config.json` y `mlx_model.py` por carpeta de precisión |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de MobileSAM v2: un codificador de imagen TinyViT de aproximadamente 5 M de parámetros que sustituye al ViT-H de SAM, junto con el codificador de prompt y el decodificador de máscaras originales de SAM. La entrada es una imagen RGB y un prompt (punto o caja); la salida son máscaras de segmentación con puntuaciones y logits de baja resolución. El repositorio no incluye el muestreador de prompts orientado a objetos de MobileSAM v2 (un YOLOv8 de ultralytics bajo AGPL-3.0) ni su decodificador guiado por prompt, por lo que la funcionalidad de "segmentar todo" debe construirse alimentando cajas de cualquier detector externo a la función `predict`.

La conversión se realizó a partir de la revisión `f706ad9c4e` del repositorio original de MobileSAM, cargando los pesos en MLX y almacenándolos en bf16/fp16 o cuantizándolos con la cuantización afín de MLX. Cada build se verificó contra el original en PyTorch fp32 sobre 8 fotos, con un prompt de punto (3 máscaras) y un prompt de caja por imagen, midiendo el IoU de las 32 máscaras resultantes. No se dispone de información sobre el dataset de entrenamiento original ni sobre el uso de RLHF/DPO, ya que el repositorio solo documenta la conversión, no el entrenamiento.

## Capacidades

- Segmentación de imágenes guiada por punto: dado un píxel, devuelve hasta tres máscaras candidatas con puntuaciones.
- Segmentación guiada por caja delimitadora: dado un rectángulo, devuelve la máscara del objeto contenido.
- Generación de máscaras multimáscara (`multimask=True`) para desambiguar objetos solapados.
- Cálculo de embeddings de imagen reutilizables (`embed`) para evitar recomputar el codificador en cada prompt.
- Interfaz compatible con `SamPredictor` de SAM (puntos, etiquetas, cajas, multimask).
- Ejecución nativa en Apple Silicon mediante MLX, con dependencias mínimas (`mlx`, `numpy`, `pillow`).
- No incluye detección automática de objetos ni muestreo de prompts; requiere un detector externo para "segmentar todo".
- No es un modelo de texto: no soporta tool calling, agentes, razonamiento ni capacidades multilingües.

## Casos de uso

- Herramienta de anotación interactiva: el usuario hace clic en un objeto y el modelo devuelve la máscara en unos 65 ms por imagen en un Apple M5, lo que permite etiquetar datasets de visión por computador con retroalimentación inmediata.
- Segmentación en pipelines de preprocesado: calcular el embedding una vez por imagen y aplicar múltiples prompts de caja para recortar regiones de interés antes de pasarlas a un clasificador o a un OCR.
- Edición de imágenes en aplicaciones de escritorio para macOS: selección de objetos por clic o por caja para recortes, fondos transparentes o retoques, aprovechando que el peso fp16 de 19,6 MB cabe en memoria sin problemas.
- Prototipado rápido en investigación: validar hipótesis de segmentación sin instalar PyTorch ni CUDA, usando solo MLX sobre un portátil con Apple Silicon.
- Automatización de flujos de visión con detector externo: alimentar cajas de un detector (por ejemplo, YOLO) a `predict` para obtener máscaras precisas por objeto en tareas de conteo o medición.
- Segmentación en dispositivos con recursos limitados: al ser un modelo de ~10 M de parámetros, puede integrarse en apps locales de macOS o iOS con MLX, sin depender de servicios en la nube.
- Verificación de calidad de anotaciones: comparar máscaras generadas por el modelo con anotaciones humanas mediante IoU para detectar etiquetas erróneas en un dataset.

## Benchmarks y rendimiento

El autor no publica benchmarks estándar (MMLU, HumanEval, etc.), pero sí una validación de fidelidad frente al original en PyTorch fp32 sobre 8 fotos, con un prompt de punto y uno de caja por imagen (32 máscaras en total):

| Precision | Tamano | Mask IoU medio / peor | Estado |
|---|---|---|---|
| fp16 | 19,7 MB | 0,999 / 0,988 | pasa |
| bf16 | 19,7 MB | 0,996 / 0,972 | pasa |
| 8bit | 12,7 MB | 0,989 / 0,899 | por debajo del umbral, experimental |
| 6bit | 10,9 MB | 0,989 / 0,914 | por debajo del umbral, experimental |
| 4bit | 9,0 MB | 0,922 / 0,012 | por debajo del umbral, experimental; algunos prompts dan máscara errónea |

El umbral de aceptación es IoU >= 0,95 en cada máscara. El autor reporta unos 65 ms por imagen (codificador más dos prompts) en un Apple M5.

## Requisitos de hardware

- VRAM/ memoria unificada: el peso fp16 ocupa 19,6 MB; con el codificador y los buffers de inferencia, el consumo es de decenas de MB, muy por debajo de cualquier límite práctico.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4, M5 y variantes Pro/Max/Ultra) mediante MLX. No hay soporte CUDA en este repositorio.
- Cabe en cualquier Mac con Apple Silicon, incluidos modelos con 8 GB de memoria unificada.
- Opciones de despliegue: MLX con el script `mlx_model.py` incluido; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia: ~65 ms por imagen (codificador + dos prompts) en un Apple M5 según el autor; el throughput no se detalla.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MobileSAM-MLX (este) | ~10 M | imagen RGB + punto/caja | IoU 0,999 vs PyTorch fp32 (fp16) | Apache 2.0 | Hugging Face, MLX |
| MobileSAM v2 original | ~10 M | imagen RGB + punto/caja | referencia | Apache 2.0 | GitHub, PyTorch |
| SAM (ViT-H) | ~630 M | imagen RGB + punto/caja | mayor calidad, mucho más coste | Apache 2.0 | Meta, PyTorch |
| SAM 2 | no disponible | imagen/vídeo + prompts | segmentación de vídeo | Apache 2.0 (según versión) | Meta |

La comparativa se limita a datos conocidos de los repositorios originales; no se dispone de cifras de rendimiento comparativas publicadas en la información proporcionada.

## Limitaciones y advertencias

- Solo incluye la segmentación guiada por punto o caja; no incluye el muestreo automático de objetos de MobileSAM v2, por lo que "segmentar todo" requiere un detector externo.
- Las variantes 8bit, 6bit y 4bit no superan el umbral de calidad; la 4bit puede producir máscaras completamente erróneas (IoU peor de 0,012). El autor recomienda usar fp16.
- La validación se hizo sobre solo 8 fotos y 32 máscaras, una muestra reducida que no garantiza el comportamiento en dominios muy distintos.
- No hay información sobre sesgos del modelo original ni sobre su comportamiento en imágenes médicas, satelitales o de baja calidad.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio no incluye el componente YOLOv8 de MobileSAM v2 (AGPL-3.0), que tendría implicaciones distintas si se integra.
- Dependencia exclusiva de MLX y Apple Silicon; no es ejecutable en CUDA ni en CPU convencional sin adaptación.
- No es un modelo de lenguaje: no admite prompts textuales, tool calling ni razonamiento multi-paso.

## Enlaces

- Hugging Face: https://huggingface.co/moonbox-ai/MobileSAM-MLX
- Repositorio original de MobileSAM: https://github.com/ChaoningZhang/MobileSAM
- Paper de MobileSAM v2: https://arxiv.org/abs/2312.09579
- Paper de MobileSAM: https://arxiv.org/abs/2306.14289
- Paper de Segment Anything (SAM): https://arxiv.org/abs/2304.02643
