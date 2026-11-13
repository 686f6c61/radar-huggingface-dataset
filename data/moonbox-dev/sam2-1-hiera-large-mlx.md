# moonbox-dev/sam2.1-hiera-large-MLX

## Resumen

SAM 2.1 Hiera-Large MLX es una conversión a formato MLX del modelo de segmentación de imágenes Segment Anything Model 2.1 (SAM 2.1) de Meta, en su variante Hiera-Large. Lo publica moonbox-dev con el objetivo de ejecutar el modelo de forma nativa en Apple Silicon mediante el framework MLX de Apple, sin depender de PyTorch. El modelo original resuelve el problema de la segmentación de imágenes y vídeo guiada por prompts: dado un punto, una caja o una máscara inicial, produce máscaras de alta calidad para el objeto indicado.

Esta build concreta cubre únicamente la parte de imagen del pipeline: el codificador de imagen Hiera más el cuello FPN, el codificador de prompts y el decodificador de máscaras. Los módulos de memoria de vídeo del SAM 2 original no están incluidos, por lo que el modelo sirve para segmentación de imágenes individuales, no para seguimiento temporal en vídeo. El repositorio ofrece cinco precisiones distintas (fp16, bf16, 8bit, 6bit y 4bit) con pesos en safetensors y un script `mlx_model.py` que solo requiere `mlx` y `numpy`.

La relevancia actual está en la posibilidad de ejecutar un modelo de segmentación de gama alta en portátiles y equipos de sobremesa con chip Apple, con un tamaño de pesos que va de 131 MB a 434 MB según la cuantización, y una latencia declarada de unos 0,4 s por imagen en un Apple M5. Solo la variante fp16 supera el umbral de fidelidad establecido por el autor (IoU medio 0,999, peor caso 0,984); el resto se marcan como experimentales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hiera (codificador de imagen) + FPN neck + prompt encoder y mask decoder de SAM 2; sin módulos de memoria de vídeo |
| Parametros totales | no disponible (el autor no publica el recuento; el peso fp16 es de 433,9 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen redimensionada internamente a 1024x1024) |
| Tipos de cuantizacion | fp16, bf16, 8bit, 6bit, 4bit (cuantización afín de MLX, group size 64; convoluciones y normas quedan en bf16) |
| Idiomas soportados | no disponible (modelo de segmentación de imágenes, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), con `config.json` y `mlx_model.py` por cada carpeta de precisión |

## Arquitectura y entrenamiento

El modelo replica la arquitectura de SAM 2.1 en su variante Hiera-Large: un codificador de imagen jerárquico Hiera que extrae características multiescala, un cuello FPN que las combina, un codificador de prompts que procesa puntos, cajas o máscaras de entrada, y un decodificador de máscaras que genera las segmentaciones finales. La conversión a MLX mantiene esta estructura y solo sustituye la implementación de las capas para que corran sobre el framework de Apple; el autor no modifica ni reentrena los pesos.

No se dispone de información sobre el entrenamiento original en la documentación proporcionada: no se detallan el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO (no aplicables, en cualquier caso, a un modelo de segmentación). La innovación técnica de esta publicación es la propia conversión: pesos cargados desde la revisión `665f8e2ad6` de facebook/sam2.1-hiera-large y almacenados en bf16, fp16 o cuantizados con la cuantización afín de MLX (8, 6 y 4 bits, group size 64), dejando en bf16 las capas que MLX no puede cuantizar, como convoluciones y normalizaciones.

## Capacidades

- Segmentación de imágenes guiada por prompts: acepta puntos (con etiqueta positiva o negativa) y cajas delimitadoras para generar máscaras del objeto indicado.
- Generación de múltiples máscaras por prompt (`multimask=True`), con puntuaciones de confianza asociadas.
- Extracción de embeddings de imagen una sola vez por imagen (`embed`), reutilizables para múltiples prompts sobre la misma imagen.
- Salida de máscaras en baja resolución además de las máscaras finales.
- Ejecución nativa en Apple Silicon mediante MLX, sin necesidad de PyTorch ni de CUDA.
- No incluye seguimiento de vídeo ni memoria temporal: los módulos de memoria de vídeo de SAM 2 no se han convertido.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües, por ser un modelo puramente visual.

## Casos de uso

- Edición fotográfica asistida: el usuario marca un punto o dibuja una caja sobre un objeto y el modelo devuelve la máscara para recortarlo o sustituir el fondo; el embedding se calcula una vez y se reutiliza para varios prompts sobre la misma foto.
- Anotación de datasets de visión por computador: generar máscaras iniciales sobre imágenes para que un humano las revise y corrija, acelerando el etiquetado semántico o de instancias en equipos con Mac.
- Herramientas de diseño y prototipado en local: integrar la segmentación en aplicaciones de escritorio para Mac sin depender de servicios en la nube, gracias a los 131-434 MB de pesos y a la latencia de ~0,4 s por imagen en un M5.
- Preprocesado en pipelines de visión: aislar regiones de interés antes de pasarlas a un clasificador o detector posterior, usando las máscaras de baja resolución como paso intermedio.
- Investigación y docencia: reproducir experimentos de segmentación promptable en hardware de consumo Apple, con la variante fp16 como referencia fiable (IoU 0,999) y las cuantizadas para estudiar el compromiso precisión/tamaño.
- Automatización de recortes en lote: procesar colecciones de imágenes en un Mac con un script que calcule el embedding y aplique prompts predefinidos por imagen, aprovechando que solo se necesita `mlx` y `numpy`.
- Evaluación comparativa de cuantizaciones: usar las cinco carpetas de precisión para medir el impacto de la cuantización en la calidad de máscara en un caso de uso propio, partiendo de las métricas publicadas por el autor.

## Benchmarks y rendimiento

El autor publica una comparación de fidelidad frente a `Sam2Model` de transformers en PyTorch fp32, sobre 8 fotos con un prompt de punto (3 máscaras) y uno de caja por imagen, midiendo el IoU de cada una de las 32 máscaras resultantes. El criterio de aceptación es IoU >= 0,95 en todas las máscaras.

| Precision | Tamano | IoU medio / peor caso | Estado |
|---|---|---|---|
| fp16 | 434 MB | 0,999 / 0,984 | pasa |
| bf16 | 434 MB | 0,992 / 0,903 | por debajo del umbral, experimental |
| 8bit | 236 MB | 0,984 / 0,837 | por debajo del umbral, experimental |
| 6bit | 184 MB | 0,972 / 0,641 | por debajo del umbral, experimental |
| 4bit | 131 MB | 0,932 / 0,396 | por debajo del umbral, experimental |

Latencia declarada: aproximadamente 0,4 s por imagen (codificador más dos prompts) en un Apple M5. No se han publicado resultados de benchmarks estándar (COCO, SA-V u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: entre 131 MB (4bit) y 434 MB (fp16) solo para los pesos; hay que sumar el coste de activaciones y del procesamiento de la imagen a 1024x1024 internamente.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4, M5 y variantes Pro/Max/Ultra), ya que el modelo usa MLX; no está pensado para GPU NVIDIA ni CUDA.
- Cabe holgadamente en cualquier Mac con Apple Silicon, incluidos modelos con 8 GB de memoria unificada, especialmente en las variantes cuantizadas.
- Despliegue: carga directa con `mlx_model.load("<precision>")` desde Python, requiriendo únicamente `mlx` y `numpy`; no se documenta integración con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia: ~0,4 s por imagen (encoder + dos prompts) en un Apple M5 según el autor; no se publica throughput para otros chips.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sam2.1-hiera-large-MLX (esta ficha) | no disponible (pesos fp16 de 434 MB) | imagen 1024x1024 interna | IoU 0,999 en fp16 frente a PyTorch fp32 (8 imágenes) | apache-2.0 | Hugging Face, formato MLX |
| facebook/sam2.1-hiera-large (original) | no disponible | imagen y vídeo | referencia de la comparación anterior | apache-2.0 | Hugging Face, PyTorch |
| SAM 2.1 en otras variantes de tamano (tiny, small, base+) | no disponible | imagen y vídeo | no disponible en esta información | apache-2.0 | Hugging Face, PyTorch |

No se dispone de datos de benchmarks comparativos con otros modelos de segmentación (por ejemplo, SAM original, Mask2Former o SegGPT) en la información proporcionada.

## Limitaciones y advertencias

- Solo imagen: los módulos de memoria de vídeo de SAM 2 no se han convertido, por lo que no hay seguimiento temporal de objetos en secuencias.
- Solo Apple Silicon: al estar implementado en MLX, no se puede ejecutar en GPU NVIDIA, CUDA ni en la mayoría de entornos de servidor Linux con GPU convencionales.
- Cuatro de las cinco precisiones (bf16, 8bit, 6bit, 4bit) no alcanzan el umbral de fidelidad del autor y se marcan como experimentales; el peor caso del 4bit cae a IoU 0,396, lo que desaconseja su uso en producción sin validación propia.
- La validación se hizo sobre solo 8 imágenes con un punto y una caja por imagen; es una muestra pequeña y no cubre todos los dominios visuales.
- Posibles discrepancias de preprocesado: el autor señala que `embed` redimensiona en coma flotante mientras que el procesador de transformers redimensiona uint8 con torchvision, con hasta un nivel de diferencia por píxel, lo que puede alterar salidas ambiguas de multimask.
- Riesgo de máscaras incorrectas en objetos ambiguos, ocluidos o de bajo contraste; conviene revisar las puntuaciones de confianza devueltas.
- No hay información sobre sesgos del modelo original ni sobre su comportamiento en dominios específicos (médico, satelital, etc.).
- Licencia apache-2.0: permite uso comercial, pero se recomienda conservar los avisos de atribución y verificar la licencia del modelo base original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/sam2.1-hiera-large-MLX
- Modelo base: https://huggingface.co/facebook/sam2.1-hiera-large
- Paper de SAM 2 (arxiv:2408.00714): https://arxiv.org/abs/2408.00714
- Carpeta bf16: https://huggingface.co/moonbox-ai/sam2.1-hiera-large-MLX/blob/main/bf16/config.json
- Carpeta fp16: https://huggingface.co/moonbox-ai/sam2.1-hiera-large-MLX/blob/main/fp16/config.json
- Carpeta 8bit: https://huggingface.co/moonbox-ai/sam2.1-hiera-large-MLX/blob/main/8bit/config.json
- Carpeta 6bit: https://huggingface.co/moonbox-ai/sam2.1-hiera-large-MLX/blob/main/6bit/config.json
- Carpeta 4bit: https://huggingface.co/moonbox-ai/sam2.1-hiera-large-MLX/blob/main/4bit/config.json
