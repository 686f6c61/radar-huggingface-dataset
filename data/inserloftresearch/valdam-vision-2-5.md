# InserloftResearch/Valdam-Vision-2.5

## Resumen

Valdam Vision 2.5 es un modelo de visión-lenguaje (VLM) publicado por Inserloft Research en Hugging Face bajo el identificador `InserloftResearch/Valdam-Vision-2.5`. Está orientado a tres tareas concretas: descripción de escenas, OCR con reconstrucción de orden de lectura a partir de coordenadas espaciales y moderación de contenido en modo zero-shot (componente denominado Valdam Shield). El modelo se distribuye en formato safetensors con 949.702.066 parámetros totales según los metadatos del repositorio (3,8 GB), lo que lo sitúa en la franja de los modelos multimodales pequeños, aptos para inferencia en GPU de consumo.

La arquitectura combina un codificador Vision Transformer preentrenado, cuya salida se proyecta en parches visuales, con un decodificador Transformer autorregresivo que aplica cross-attention sobre esas representaciones visuales. La parte de moderación no se implementa con un clasificador entrenado específicamente, sino mediante comparación de similitud semántica contra etiquetas usando CLIP ViT-L/14. El modelo declara soporte de inglés y castellano y se publica con licencia Apache 2.0.

Es relevante ahora por su perfil de despliegue: menos de 1.000 millones de parámetros, licencia permisiva y pesos en un único safetensors, lo que permite ejecutarlo en local sin infraestructura dedicada. Ahora bien, en el momento de redactar esta ficha el repositorio no tiene descargas ni valoraciones, no incluye artículo técnico ni resultados de evaluación publicados, y la model card no detalla la longitud de contexto ni el volumen de datos de entrenamiento, por lo que cualquier decisión de adopción debería basarse en una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (codificador de imagen) + decodificador Transformer autorregresivo con cross-attention sobre parches visuales; moderación auxiliar mediante CLIP ViT-L/14 |
| Parametros totales | 949.702.066 (según metadatos de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no hay GGUF, AWQ ni GPTQ en el repositorio) |
| Idiomas soportados | Inglés (en) y castellano (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json`, `vocab.json`, `architecture.py`, `inference.py` |
| Pipeline declarado | image-to-text |
| Tamano del repositorio | 3,8 GB |
| Fecha de publicacion | 2026-10-27 (creado y actualizado el mismo día) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es un VLM modular: un codificador ViT preentrenado cuyas activaciones se proyectan en embeddings de parches visuales, y un decodificador Transformer autorregresivo que genera texto aplicando cross-attention sobre esos embeddings. El repositorio incluye `architecture.py` con la definición del codificador y del decodificador, además de `inference.py` con una clase `ValdamVisionLocalPredictor` que carga pesos, configuración y vocabulario desde rutas locales. El componente de moderación, Valdam Shield, no aparece descrito como un cabezal entrenado, sino como una capa de similitud semántica contra CLIP ViT-L/14, lo que implica que las categorías de moderación se definen en tiempo de inferencia y no están fijadas por el entrenamiento.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, si hubo etapas de RLHF o DPO, ni los hiperparámetros de alineación. Tampoco se aclara si los aproximadamente 950 millones de parámetros incluyen el codificador CLIP ViT-L/14 empleado para moderación o si este se carga por separado. El tamaño del repositorio (3,8 GB) es coherente con pesos en fp32 para ese número de parámetros, pero la precisión exacta de los pesos no se declara en la model card: conviene verificar la dtype real al cargar el `config.json`.

## Capacidades

- Generación de texto autorregresiva condicionada por imagen, orientada a descripción de escenas.
- OCR espacial: extracción de texto y reconstrucción del orden de lectura y de la agrupación en párrafos a partir de coordenadas espaciales, pensado para diseños, maquetas y documentos con layout complejo.
- Moderación de contenido zero-shot mediante similitud semántica con CLIP ViT-L/14, con etiquetas definibles por el usuario.
- Funcionamiento bilingüe inglés-castellano según los metadatos del modelo.
- Inferencia local sin dependencia de API externa: el repositorio incluye el script de predicción y la definición de arquitectura.
- No se documenta en la información disponible soporte de tool calling, function calling, razonamiento multi-paso, modo thinking, audio o vídeo.

## Casos de uso

- Generación de texto alternativo para accesibilidad: el modelo recibe una imagen y devuelve una descripción en inglés o castellano, lo que permite poblar atributos `alt` en catálogos web y aplicaciones móviles con un coste de cómputo bajo (menos de 1.000 millones de parámetros).
- Digitalización de documentos con layout complejo: gracias a la reconstrucción de orden de lectura por coordenadas, encaja en la extracción de texto de facturas, formularios e informes maquetados donde un OCR plano perdería la estructura de párrafos.
- Moderación de contenido generado por usuarios en foros o marketplaces: Valdam Shield permite definir un conjunto de etiquetas (por ejemplo, violencia, desnudos, contenido médico) y puntuar imágenes por similitud semántica sin reentrenar el modelo.
- Catalogación y etiquetado de imágenes en comercio electrónico: descripción automática de producto y verificación de que la imagen corresponde a la categoría declarada, ejecutable en lote sobre GPU de consumo.
- Preprocesado para pipelines de RAG sobre documentos escaneados: el modelo extrae texto y estructura antes de la indexación vectorial, de modo que los fragmentos conservan el orden de lectura original.
- Curación de datasets de entrenamiento: filtrado de pares imagen-texto y detección de contenido no deseado antes de incorporar muestras a un corpus, usando las etiquetas de moderación configurables.
- Prototipado en local o en el borde: al no requerir API externa ni pesos cuantizados especiales, sirve para validar hipótesis de producto en un portátil con GPU discreta antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara el uso de las métricas BLEU, METEOR y ROUGE en sus metadatos, pero no incluye valores numéricos para ninguna de ellas, ni resultados de MMLU, HumanEval, GSM8K, DocVQA, TextVQA o similares.

| Metrica declarada | Valor publicado |
|---|---|
| BLEU | No disponible |
| METEOR | No disponible |
| ROUGE | No disponible |

El único dato de rendimiento presente es una latencia media de inferencia de aproximadamente 0,08 s citada por el autor. Esa cifra no va acompañada de la GPU utilizada, el tamaño de lote, la resolución de entrada ni el número de tokens generados, por lo que no es reproducible ni comparable con otros modelos.

## Requisitos de hardware

- Huella de pesos: 3,8 GB en el repositorio, coherente con fp32 para ~950 M de parámetros; en fp16 serían ~1,9 GB, en int8 ~0,95 GB y en int4 ~0,5 GB (estimaciones aritméticas, no cifras publicadas por el autor).
- VRAM estimada para inferencia: 4-6 GB en fp16 incluyendo activaciones de imagen y caché de atención; 8 GB deja margen suficiente. En fp32, 6-8 GB.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; también en GPUs de 8 GB. Es viable en CPU para prototipos, con latencia muy superior a la declarada.
- GPU de centro de datos: A100, H100 y L40S están sobredimensionadas para un modelo de este tamaño; su uso tendría sentido solo por agregación de muchas peticiones concurrentes.
- Opciones de despliegue: el repositorio no ofrece integración con `transformers` de forma estándar, sino carga manual mediante `inference.py` y `architecture.py`. Por tanto, vLLM, TGI, llama.cpp y Ollama no están soportados de serie y requerirían adaptación, y no existe versión GGUF. La vía directa es servir el predictor propio detrás de FastAPI, TorchServe o un contenedor con CUDA.
- Latencia y throughput: el autor declara ~0,08 s de respuesta media sin especificar condiciones. El throughput real por GPU debe medirse en el entorno objetivo antes de dimensionar.

## Comparativa con modelos similares

Los datos de las alternativas provienen del conocimiento público de esos modelos, no de la información proporcionada en la búsqueda, y deben verificarse en sus respectivas model cards.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Valdam Vision 2.5 | 949,7 M | No disponible | Apache 2.0 | VLM para descripción, OCR espacial y moderación zero-shot |
| Florence-2 (variante base) | ~0,23 B | No disponible en la informacion disponible | MIT | VLM multitarea con tareas por prompt (detección, captioning, OCR) |
| Qwen2.5-VL-3B | ~3 B | No disponible en la informacion disponible | Apache 2.0 | VLM generalista con soporte de grounding y documentos |
| PaliGemma 2 (3B) | ~3 B | No disponible en la informacion disponible | Términos de licencia Gemma | VLM SigLIP + Gemma para captioning y VQA |

Frente a estas alternativas, Valdam Vision 2.5 se distingue por su tamaño reducido y por integrar moderación zero-shot basada en CLIP en el mismo paquete, pero carece de resultados publicados y de integración con el ecosistema estándar, a diferencia de modelos con soporte nativo en `transformers`, vLLM y llama.cpp.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay cifras de BLEU, METEOR, ROUGE ni de benchmarks estándar, pese a que las métricas aparecen declaradas en los metadatos.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la ficha, publicada el mismo día de su creación; no existe evidencia externa de calidad.
- La latencia de ~0,08 s no es verificable: no se indica hardware, lote ni longitud de salida.
- Longitud de contexto no documentada, lo que impide planificar casos de uso con documentos largos o conversaciones multi-turno.
- La moderación zero-shot depende de la calidad semántica de CLIP ViT-L/14 y del conjunto de etiquetas elegido; es sensible a formulaciones de etiqueta y no sustituye a un clasificador supervisado en entornos con requisitos de auditoría.
- El OCR espacial puede degradarse con inclinaciones, baja resolución, tipografías decorativas o idiomas distintos del inglés y el castellano.
- Riesgo de alucinación inherente a la generación autorregresiva: las descripciones pueden incluir objetos o texto no presentes en la imagen.
- La integración requiere código propio del repositorio (`architecture.py`, `inference.py`), lo que implica auditar y mantener código de confianza no estándar; no hay soporte en `transformers`, vLLM ni llama.cpp.
- No hay pesos cuantizados publicados; el despliegue en entornos con poca VRAM exige cuantizar por cuenta propia, con el riesgo de degradar la calidad sin métricas de referencia.
- Sesgos: no se documenta la composición del dataset de entrenamiento ni los idiomas y demografías cubiertos, por lo que no es posible evaluar sesgos de representación.
- Licencia Apache 2.0: permite uso comercial y modificaciones con obligaciones de atribución y de conservación del aviso de licencia; no hay cláusulas de uso aceptable adicionales, lo que traslada al integrador la responsabilidad sobre el uso en moderación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/InserloftResearch/Valdam-Vision-2.5
- Perfil de la organizacion en Hugging Face: https://huggingface.co/InserloftResearch
- Datasets de la organizacion: https://huggingface.co/InserloftResearch/datasets
- Sitio web del autor: https://research.inserloft.com
- Paper, blog tecnico, repositorio de codigo independiente y demo: no disponibles en la informacion proporcionada.
