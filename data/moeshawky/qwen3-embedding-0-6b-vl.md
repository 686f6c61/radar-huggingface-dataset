# moeshawky/qwen3-embedding-0.6b-vl

## Resumen

Qwen3-Embedding-0.6B-VL es un modelo de extracción de características (feature-extraction) desarrollado por el usuario moeshawky que proyecta texto e imagen a un mismo espacio de embeddings de 1024 dimensiones, normalizado en L2. No es un modelo generativo: su salida son vectores, y su objetivo es la recuperación cruzada imagen-texto (image-to-text y text-to-image) y la similitud semántica multimodal. Se construye como un injerto sobre el modelo base Qwen/Qwen3-Embedding-0.6B, cuya rama de texto permanece congelada.

Técnicamente es un composite de tres piezas congeladas salvo una: el codificador de texto Qwen3Model, la torre de visión Siglip2VisionModel (procedente de google/siglip2-so400m-patch16-naflex) y una proyección entrenable de 1152→1024 con 1.180.672 parámetros. El modelo declara 1.025.894.848 parámetros totales en safetensors y un repositorio de 11,7 GB, que incluye dos variantes horneadas (NVIDIA Blackwell y AMD MI300X), checkpoints de cabeza, exportaciones ONNX y registros de evaluación.

Es relevante ahora porque demuestra un patrón de entrenamiento muy económico (solo la proyección se entrena, 832 pasos, 2 épocas) que alcanza un R@10 de 0,7380 en i2t y 0,8484 en t2i sobre el split de test, con una diferencia entre proveedores de GPU de 0,0015 o menos. La licencia es apache-2.0 y el repositorio incluye procedencia verificable con hashes SHA256.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Compuesta: Qwen3Model (rama de texto, transformer) + Siglip2VisionModel (torre de visión tipo ViT) + proyección lineal entrenable 1152→1024 con residual de inicialización cero (alpha 0) |
| Parametros totales | 1.025.894.848 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP32 (safetensors de este repositorio); Q8_0 en el GGUF de origen de la rama de texto; exportaciones ONNX; no se publican cuantizaciones GGUF del composite completo |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (FP32, 4.103.672.032 bytes por variante), ONNX (opset 18), GGUF (solo en el artefacto de origen de la rama de texto) |
| Dimension de embedding | 1024 (texto e imagen, espacio compartido normalizado en L2) |
| Parametros entrenables | 1.180.672 (solo vision_projection.weight y vision_projection.bias) |
| Modelo base | Qwen/Qwen3-Embedding-0.6B |
| Tipo de modelo declarado | qwen3_siglip2_embedding |
| Tamano del repositorio | 11,7 GB |

## Arquitectura y entrenamiento

La arquitectura es un injerto de dos torres congeladas unidas por un adaptador entrenable. La rama de texto es Qwen3Model, que aplica pooling de último token en EOS 151643, normaliza en L2, pasa por una afinidad de compatibilidad y vuelve a normalizar en L2. La torre visual es Siglip2VisionModel extraída de la instantánea cc24074f717b612951c2dead130904ab9b65a81e de google/siglip2-so400m-patch16-naflex, verificada como tensor-equal. El composite no incluye la torre de texto de SigLIP2; el texto donante proviene de la instantánea fijada de Qwen3. La única parte entrenable es la proyección 1152→1024 con residual de inicialización cero.

El entrenamiento usa pérdida InfoNCE sobre tripletes precalculados Q_T/S_I/T_S (temperatura 0,07; lambda_pos 0,1) con 16 negativos minados por fila (semilla 20260918). El corpus proviene de un muestreo de 220.000 filas de LAION-400M con un rendimiento de descarga del 46,5%, del que se preserva un corpus de 116.211 filas en moeshawky/laion-qwen-siglip-pairs (24 fragmentos tar, sha256 por fragmento, 10.712.545.280 bytes). Tras descartar 1.854 filas con errores de decodificación y limitar validación a 2.048 filas, quedan 106.602 de entrenamiento, 2.048 de validación y 5.707 de test, en total 114.357 filas.

Los hiperparámetros son idénticos en las dos ejecuciones: 2 épocas, batch 256, learning rate 3e-4, weight decay 0,01, warmup del 10%, clipping de gradiente 1,0 y 832 pasos. Se ejecutó en AMD MI300X con ROCm (torch 2.13.0+rocm7.1, transformers 5.17.0, resultados en amd/) y en NVIDIA RTX PRO 6000 Blackwell (torch 2.11.0+cu130, transformers 5.18.0, resultados en la raíz del repositorio). El criterio de falsación declarado era val i2t R@10 ≥ 0,62 y t2i R@10 ≥ 0,60.

## Capacidades

- Generación de embeddings de texto a 1024 dimensiones, normalizados en L2, con pooling de último token en EOS.
- Generación de embeddings de imagen a 1024 dimensiones en el mismo espacio vectorial compartido.
- Recuperación cruzada imagen-a-texto (i2t) y texto-a-imagen (t2i) por similitud de coseno.
- Similitud de frases (etiqueta sentence-similarity) para la rama de texto, heredada del modelo base congelado.
- Procesamiento por lotes con máscaras de atención y shapes espaciales para la rama visual (pixel_attention_mask, spatial_shapes).
- Exportación ONNX con entrada estática 4×256×768 y salida 4×1024 para la rama de imagen, validada con error máximo de 1,47e-06 en ONNX Runtime.
- Ejecución determinista verificable entre proveedores de GPU (AMD MI300X y NVIDIA Blackwell) con delta menor o igual a 0,0015 en las métricas.
- No se declaran capacidades de generación de texto, tool calling, agentes, razonamiento multi-paso, audio o visión generativa.

## Casos de uso

- Búsqueda multimodal en catálogos: indexar productos por su imagen y recuperarlos mediante consultas de texto (o al contrario) usando el espacio L2 compartido de 1024 dimensiones. El R@10 t2i de 0,8484 en test lo hace viable para recuperación en primera página.
- RAG multimodal: almacenar embeddings de figuras, capturas o diagramas junto a sus descripciones textuales y recuperar ambos tipos con una única consulta vectorial, evitando mantener dos índices separados.
- Deduplicación y detección de casi duplicados: comparar embeddings de imagen contra imagen o de texto contra texto para agrupar elementos redundantes en pipelines de limpieza de datos.
- Moderación y filtrado por prototipos: construir un conjunto de vectores prototipo de contenido permitido o prohibido y clasificar por similitud, aprovechando que imagen y texto viven en el mismo espacio.
- Recomendación visual: representar el historial de un usuario como embeddings de texto y candidatos como embeddings de imagen, y ordenar por similitud en el mismo espacio sin una segunda etapa de traducción.
- Clasificación zero-shot: usar descripciones textuales como centroides de clase y asignar imágenes a la clase más cercana, útil cuando no hay datos etiquetados suficientes para un clasificador supervisado.
- Recuperación de evidencias en documentación técnica: localizar la figura o el esquema que corresponde a una consulta textual dentro de manuales extensos, combinando el índice vectorial con metadatos de página.
- Auditoría y linaje de embeddings: el repositorio incluye PROVENANCE.json, SHA256SUMS y comprobaciones reproducibles, lo que permite verificar que un vector almacenado procede de este modelo y no de una variante distinta.

## Benchmarks y rendimiento

Métricas de recuperación con positivo diagonal (el test es el split no contaminado), valores exactos en PROVENANCE.json → metrics_exact:

| Variante | val i2t R@10 | val t2i R@10 | test i2t R@10 | test t2i R@10 |
|---|---|---|---|---|
| box2 (Blackwell, raíz de este repositorio) | 0,8364 | 0,9170 | 0,7380 | 0,8484 |
| amd (MI300X, amd/) | 0,8350 | 0,9170 | 0,7377 | 0,8479 |

| Referencia | Valor |
|---|---|
| Inicialización zero-shot sobre las mismas filas de validación | 0,0039 |
| Margen de la inicialización zero-shot respecto a la variante entrenada | +0,83 |
| Delta máximo entre proveedores (AMD frente a NVIDIA) | 0,0015 |
| Error máximo de la exportación ONNX (ORT) | 1,47e-06 |
| Error máximo de la exportación ONNX de la variante amd | 6,7e-07 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de modelos generativos en la información disponible, lo cual es coherente con que el pipeline declarado sea feature-extraction.

## Requisitos de hardware

- Peso de cada variante horneada en FP32: 4.103.672.032 bytes (aproximadamente 4,1 GB) para 1.025.894.848 parámetros.
- VRAM estimada para inferencia en FP32: en torno a 5-6 GB contando pesos y activaciones de la torre visual con resolución de parches 256; el repositorio completo ocupa 11,7 GB porque incluye dos variantes, cabezas y exportaciones.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090). Con 6 GB el margen es ajustado en FP32.
- GPU de datacenter validadas por el autor: AMD MI300X (ROCm, torch 2.13.0+rocm7.1) y NVIDIA RTX PRO 6000 Blackwell (torch 2.11.0+cu130).
- Despliegue mediante transformers con trust_remote_code=True, cargando AutoModel y AutoTokenizer; los métodos expuestos son get_text_features(input_ids, attention_mask, pool_index) y vision_model(pixel_values, pixel_attention_mask, spatial_shapes).
- Exportación ONNX disponible para la rama de imagen con opset 18, entrada estática 4×256×768 y salida 4×1024; el lote está fijado en 4, por lo que no admite batch dinámico sin reexportar.
- La variante amd/model.safetensors funciona como reemplazo directo cargando las mismas clases.
- Soporte en vLLM, TGI, llama.cpp u Ollama para el composite: no disponible en la información proporcionada. El GGUF referenciado corresponde únicamente a la rama de texto de origen, no al modelo multimodal completo.
- Latencia y throughput: no disponibles. No se publican medidas de tiempo por lote ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Modalidades | Dimension de embedding | Contexto | Licencia | Estado |
|---|---|---|---|---|---|---|
| moeshawky/qwen3-embedding-0.6b-vl | 1.025.894.848 | Texto e imagen en espacio compartido | 1024 | No disponible | apache-2.0 | Publicado, 0 descargas, 1 like |
| Qwen/Qwen3-Embedding-0.6B | 0,6B (declarado en el nombre) | Solo texto | 1024 (según el flujo documentado) | No disponible | apache-2.0 | Modelo base, ampliamente distribuido |
| google/siglip2-so400m-patch16-naflex | No disponible en la información proporcionada | Imagen y texto (torre dual) | No disponible | No disponible | No disponible en la información proporcionada | Donante de la torre visual |
| Gideon531/Qwen3-Embedding-0.6B-Q8_0-GGUF | Cuantización Q8_0 del modelo base, 639.150.592 bytes | Solo texto | 1024 | No disponible | apache-2.0 | Artefacto raíz del linaje |

La comparación cuantitativa de rendimiento frente a alternativas externas no está disponible: el repositorio solo publica métricas de recuperación internas sobre el corpus moeshawky/laion-qwen-siglip-pairs, sin evaluaciones cruzadas contra otros modelos multimodales.

## Limitaciones y advertencias

- Es un modelo de embeddings, no generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso, y no debe evaluarse con benchmarks de generación.
- El corpus de entrenamiento procede de LAION-400M, que arrastra los sesgos conocidos de los datos web rastreados; no se publica un análisis de sesgo específico.
- Riesgo de falsos positivos por similitud: al ser un espacio L2 compartido y entrenado con InfoNCE y negativos minados, dos elementos no relacionados pueden quedar próximos; conviene calibrar umbrales por dominio.
- Idiomas soportados: no disponible. El comportamiento multilingüe depende de la rama de texto Qwen3-Embedding-0.6B, que permanece congelada y no se reevaluó para esta variante.
- Longitud de contexto: no disponible. No se documenta el máximo de tokens aceptado por la rama de texto ni el número de parches máximo de la rama visual más allá de la forma estática 256×768 del ONNX.
- Asimetría de rendimiento: el test t2i (0,8484) supera claramente al test i2t (0,7380); los casos de uso centrados en recuperar texto a partir de imagen parten de una base más débil.
- Los splits son pequeños (2.048 filas de validación y 5.707 de test), por lo que las métricas tienen una varianza mayor de la que sugiere la precisión de cuatro decimales; solo la variante amd incluye intervalos de confianza bootstrap ci95.
- El modelo requiere trust_remote_code=True: implica ejecutar código Python publicado en el repositorio del autor, con el riesgo de seguridad asociado.
- Licencia apache-2.0 para este repositorio, pero no se verifica en la información disponible la compatibilidad de licencias de los componentes donantes (Qwen3-Embedding-0.6B y SigLIP2) para todos los usos previstos. Conviene revisar cada componente antes de un despliegue comercial.
- Validación comunitaria nula: 0 descargas y 1 like en el momento de redactar esta ficha; no hay informes independientes de terceros.
- config.json contiene qwen_source_dir como ruta relativa a la máquina de construcción (artifacts/source/hf_Qwen3-Embedding-0.6B); es informativa y el código de modelado nunca la lee, pero puede confundir en una inspección manual.
- La exportación ONNX tiene lote fijo de 4 y resolución fija; usarla en producción exige reexportar para otros lotes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moeshawky/qwen3-embedding-0.6b-vl
- Dataset de entrenamiento: https://huggingface.co/datasets/moeshawky/laion-qwen-siglip-pairs
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Artefacto GGUF de origen de la rama de texto: https://huggingface.co/Gideon531/Qwen3-Embedding-0.6B-Q8_0-GGUF
- Torre de visión donante: https://huggingface.co/google/siglip2-so400m-patch16-naflex
- Repositorio hermano con la variante amd y su ONNX: https://huggingface.co/moeshawky/qwen-siglip2-graft-composite
- Archivos de procedencia dentro del repositorio: PROVENANCE.json, SHA256SUMS, MISSION_REPORT_SCALE_X_BOX2.md y el directorio eval/
