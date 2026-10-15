# ml-resources/sapiens2-matting-1b

## Resumen

Sapiens2-1B-Matting es un modelo de visión por computador especializado en matting de imagen humana: genera un canal alfa suave por píxel y un primer plano RGB premultiplicado a partir de una imagen centrada en personas. Lo desarrolla Meta y deriva del backbone preentrenado facebook/sapiens2-pretrain-1b, al que se le añade una cabeza específica de matting humano. El repositorio analizado, ml-resources/sapiens2-matting-1b, es un espejo no oficial del checkpoint original facebook/sapiens2-matting-1b, con la licencia intacta.

Técnicamente es un Vision Transformer con 1.462 B de parámetros en el backbone y 1.539.334.340 parámetros totales declarados en el checkpoint safetensors (6,2 GB de repositorio). Procesa entradas a 1024 × 768 píxeles con patch size de 16, dimensión de embedding de 1536, 40 capas y 24 cabezas de atención, con un coste de 4.715 T FLOPs por inferencia. La longitud de contexto no aplica aquí en el sentido de los modelos de lenguaje: la ventana efectiva es la resolución de imagen fija indicada arriba.

Su relevancia es acotada pero clara: cubre una tarea de post-producción muy demandada (extracción de personas con alfa de alta calidad) dentro del ecosistema Sapiens2, y es relevante para equipos que ya trabajan con el repo oficial y quieren un checkpoint de matting integrado. Es un modelo de visión puro: no genera texto, no hace tool calling ni razonamiento multi-paso, y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (Sapiens2 ViT backbone + cabeza de matting humano) |
| Parametros totales | 1.539.334.340 (1,54 B); backbone 1.462 B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; resolución de inferencia fija de 1024 × 768 (alto × ancho) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors sin variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de visión; no procesa texto) |
| Licencia | Sapiens2 License (license: other) |
| Formato de pesos | safetensors (`sapiens2_1b_matting.safetensors`) |

Datos adicionales de la model card: dimensión de embedding 1536, 40 capas, 24 cabezas de atención, patch size 16, 4.715 T FLOPs, tamaño del repo 6,2 GB, pipeline declarado `image-segmentation`.

## Arquitectura y entrenamiento

La arquitectura es un ViT de tipo Sapiens2 que actúa como extractor de características densas sobre la imagen de entrada, seguido de una cabeza de matting humano que produce dos salidas: un alfa suave por píxel y el RGB de primer plano premultiplicado. La entrada se tokeniza con patch size 16 sobre una resolución de 1024 × 768, lo que da una rejilla de 64 × 48 = 3072 tokens, procesada por 40 capas de atención con dimensión de embedding 1536 y 24 cabezas.

El checkpoint se obtiene por fine-tuning del backbone preentrenado facebook/sapiens2-pretrain-1b sobre la tarea de matting humano. No se dispone en la información proporcionada de datos sobre el número de tokens o imágenes de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de RLHF, DPO o similares (poco habituales en tareas densas de predicción por píxel). Tampoco se documentan innovaciones técnicas específicas de este checkpoint más allá de la propia familia Sapiens2 y su cabeza de tarea.

## Capacidades

- Matting de imagen humana: generación de un canal alfa suave por píxel para separar personas del fondo.
- Salida de primer plano RGB premultiplicado, lista para composición sobre nuevos fondos.
- Procesamiento de imágenes centradas en humanos a resolución 1024 × 768.
- Predicción densa por píxel, adecuada para bordes finos (pelo, ropa, siluetas).
- Integración con el ecosistema Sapiens2 mediante la librería `sapiens2` y el repo oficial de Meta.
- Generación de texto: no disponible / no soportada.
- Tool calling o function calling: no soportado.
- Razonamiento multi-paso o modo agente: no soportado.
- Capacidades multilingües: no aplica (modelo de visión).
- Visión general (detección, VQA, OCR): no disponible; la cabeza está entrenada específicamente para matting.

## Casos de uso

- Rotoscopia y post-producción audiovisual: extraer el alfa de actores fotograma a fotograma para composición sobre nuevos fondos, aprovechando la resolución de 1024 × 768 y la salida premultiplicada que evita halos en los bordes.
- Comercio electrónico y catálogo de moda: separar modelos del fondo en fotografías de producto para generar imágenes sobre fondos neutros o de marca de forma automatizada, reduciendo el trabajo manual de recorte.
- Retoque fotográfico profesional: aislar sujetos para ajustes de color, sustitución de cielo o fondos y composición de varias capas sin necesidad de máscaras manuales.
- Efectos en tiempo real en vídeo (desenfoque o sustitución de fondo): el modelo sirve como extractor de mattes que un pipeline de vídeo consume secuencialmente, siempre que se acepte el coste de 4.715 T FLOPs por inferencia.
- Generación de datos de entrenamiento: producir pares imagen-alfa de alta calidad para entrenar modelos de matting más ligeros o para aumentar datasets de segmentación de personas.
- Realidad aumentada y avatares: aislar al usuario para insertar elementos virtuales o fondos sintéticos en aplicaciones de vídeo interactivo.
- Investigación en visión centrada en humanos: usar el checkpoint como referencia o punto de partida en experimentos de segmentación densa y matting, dado que deriva de un backbone preentrenado público.
- Anotación asistida: preetiquetar grandes volúmenes de imágenes para revisión humana posterior, acelerando flujos de anotación en equipos de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Nota: los pesos publicados están en safetensors y el repositorio ocupa 6,2 GB, lo que es coherente con pesos en precisión de 32 bits para 1,54 B de parámetros. Las cifras de VRAM que siguen son estimaciones a partir del tamaño del modelo y no datos publicados por el autor.

- VRAM estimada para los pesos: en torno a 6,2 GB en fp32; aproximadamente 3,1 GB si se convierte a fp16/bf16. A esto hay que sumar activaciones y buffers para una entrada de 3072 tokens a lo largo de 40 capas.
- VRAM total estimada para inferencia: del orden de 12-16 GB en fp32 y de 6-9 GB en fp16/bf16, según implementación y tamaño de lote. Cifras orientativas, no verificadas.
- GPU recomendadas: no disponibles de forma oficial. Por tamaño, el modelo encaja en GPUs de gama alta de consumo con 16-24 GB, como RTX 4090 o RTX 3090, y en GPUs de datacenter tipo A100, H100 o L40S.
- ¿Cabe en GPU de consumo? Previsiblemente sí en modelos con 16 GB o más de VRAM en fp16/bf16; en tarjetas de 8-12 GB probablemente requiera cuantización o troceado, opción no documentada por el autor.
- Opciones de despliegue: el autor documenta el uso a través del repositorio oficial Sapiens2 (instalación con `pip install -e .` y scripts de demo, por ejemplo `sapiens/dense/scripts/demo/matting.sh`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. El único dato de coste computacional publicado es 4.715 T FLOPs por inferencia a 1024 × 768.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks ni especificaciones de alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible. A modo de contexto cualitativo:

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Sapiens2-1B-Matting (este) | 1,462 B (backbone); 1.539.334.340 totales | 1024 × 768 | Sapiens2 License | Safetensors en HuggingFace (original de Meta y espejo ml-resources) |
| facebook/sapiens2-pretrain-1b | 1,462 B (backbone) | no disponible | Sapiens2 License | Backbone preentrenado en HuggingFace |
| Otras alternativas de matting humano (p. ej. soluciones ligeras tipo MODNet o RVM) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados en la información disponible: no hay evidencia cuantitativa de calidad de matte frente a alternativas.
- Es un modelo exclusivamente de visión centrada en humanos; no procesa lenguaje, no soporta tool calling ni flujos de agente.
- Resolución de inferencia fija de 1024 × 768; no se documenta comportamiento con otras relaciones de aspecto ni con imágenes de muy alta resolución.
- Sin datos publicados sobre sesgos demográficos, de tono de piel, tipo de cabello o complexión. En tareas de matting, los errores suelen concentrarse en contornos complejos (pelo, transparencias, movimiento), pero no hay evaluación específica de este checkpoint.
- Riesgo de artefactos en bordes y en regiones con oclusiones o desenfoque de movimiento: plausible por la naturaleza de la tarea, no cuantificado por el autor.
- Licencia Sapiens2 (categoría "other"): no se detallan en la información proporcionada los términos exactos de uso comercial. Es imprescindible revisar el fichero LICENSE.md del repositorio oficial antes de cualquier despliegue en producción.
- El repositorio analizado (ml-resources/sapiens2-matting-1b) es un espejo no oficial, con 0 descargas y 0 "likes" en el momento de la consulta; para producción conviene referenciar el repositorio original de Meta.
- Sin variantes cuantizadas publicadas (GGUF, int8, int4): el despliegue en hardware limitado requiere conversión manual.
- No se documentan idiomas ni capacidades multilingües porque no aplican a un modelo de segmentación.

## Enlaces

- Repositorio analizado (espejo): https://huggingface.co/ml-resources/sapiens2-matting-1b
- Repositorio original: https://huggingface.co/facebook/sapiens2-matting-1b
- Backbone preentrenado: https://huggingface.co/facebook/sapiens2-pretrain-1b
- Colección Sapiens2: https://huggingface.co/collections/facebook/sapiens2
- Paper: https://arxiv.org/pdf/2604.21681
- Página del proyecto: https://rawalkhirodkar.github.io/sapiens2
- Código: https://github.com/facebookresearch/sapiens2
- Guía de matting: https://github.com/facebookresearch/sapiens2/blob/main/docs/MATTING.md
- Licencia: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
