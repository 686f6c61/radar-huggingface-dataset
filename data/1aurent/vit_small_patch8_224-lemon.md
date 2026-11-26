# 1aurent/vit_small_patch8_224.lemon

## Resumen

LEMON (Learning Embeddings from Morphology Of Nuclei) es un modelo fundacional de visión por computador especializado en morfología nuclear para patología computacional. Se trata de un Vision Transformer pequeño (ViT-S/8) entrenado de forma auto-supervisada con MoCo v3 sobre aproximadamente 10 millones de imágenes de células individuales extraídas de unas 10.000 laminas del repositorio TCGA. El modelo genera embeddings de 384 dimensiones a partir de recortes de 40x40 píxeles a resolución de 0,25 um/píxel (aumento 40x), pensados para representar la morfología del núcleo celular.

El modelo original fue desarrollado por Loïc Chadoutaud, Alice Blondel, Hana Feki, Jacqueline Fontugne, Emmanuel Barillot y Thomas Walter, y publicado en arXiv (2603.25802, 2026). Esta ficha concreta corresponde a un port a formato nativo de timm realizado por el usuario 1aurent, con los pesos remapeados 1:1 de forma bit-idéntica respecto al checkpoint original de MoCo v3. El repositorio ocupa 0,1 GB y contiene 21.378.816 parámetros.

Su relevancia radica en que ofrece un extractor de características ligero y específico para histología, reutilizable como backbone en tareas downstream de patología digital (clasificación de tejidos, segmentación, recuperación de células similares) sin necesidad de reentrenar desde cero. Al estar en formato timm, se integra directamente con el ecosistema `timm.create_model` y `hf-hub`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer pequeño (ViT-S/8), patch size 8, embed dim 384, depth 12, 12 heads, MLP ratio 4, qkv bias, LayerNorm (eps 1e-6) |
| Parametros totales | 21.378.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija 3x40x40, ampliable por interpolación de pos-embed) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | safetensors (formato nativo timm) |

## Arquitectura y entrenamiento

El modelo es un ViT-S/8 estándar: 12 bloques transformer con dimensión de embedding 384, 12 cabezas de atención, MLP con ratio 4, sesgo en las proyecciones qkv y LayerNorm con epsilon 1e-6. La entrada es de 40x40 píxeles con parches de 8x8, lo que produce 25 parches más el token CLS (26 tokens en total). Se usa embedding posicional absoluto aprendido para entradas de 40x40 y el pooling global se realiza sobre el token CLS. El modelo admite entradas mayores (por ejemplo 224x224) mediante interpolación del pos-embed cuando `model.dynamic_img_size = True`.

El preentrenamiento se realizó con MoCo v3, un método auto-supervisado contrastivo, sobre aproximadamente 10 millones de imágenes de células individuales de 40x40 píxeles a 0,25 um/píxel (aumento 40x), extraídas de cerca de 10.000 laminas de TCGA. No se documenta en la información disponible el uso de RLHF, DPO ni ajuste supervisado posterior; el modelo se distribuye como backbone con `num_classes=0`. La innovación principal es la especialización en morfología nuclear a escala celular con un backbone muy ligero, y el port a timm preserva los pesos de forma bit-idéntica.

## Capacidades

- Extracción de embeddings de 384 dimensiones a partir de recortes de células individuales de 40x40 píxeles.
- Representación de morfología nuclear para patología computacional (histología, análisis de núcleos celulares).
- Aprendizaje auto-supervisado (MoCo v3) que permite usar el backbone como extractor de características congelado.
- Soporte de entradas de mayor resolución mediante interpolación del embedding posicional (`dynamic_img_size`).
- Integración nativa con timm y con el Hub de Hugging Face (`timm.create_model('hf-hub:...')`).
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un modelo de visión.
- No dispone de modo de razonamiento (thinking), visión general, audio ni otras modalidades.

## Casos de uso

- Clasificación de subtipos tumorales: usar los embeddings CLS de 384 dimensiones como entrada a un clasificador lineal o MLP entrenado sobre un dataset etiquetado de patología, aprovechando que el backbone ya captura morfología nuclear.
- Recuperación de células similares (retrieval): indexar los embeddings de millones de recortes celulares en una base vectorial para buscar morfologías parecidas y apoyar el análisis exploratorio de cohortes.
- Segmentación y detección asistida: emplear el backbone como extractor de características en un pipeline de segmentación de núcleos, dado que trabaja a escala celular con resolución de 0,25 um/píxel.
- Control de calidad de preparaciones histológicas: detectar recortes celulares atípicos o artefactos comparando la distancia de sus embeddings frente a una distribución de referencia.
- Agrupamiento no supervisado de poblaciones celulares: aplicar clustering (k-means, UMAP) sobre los embeddings para descubrir subpoblaciones morfológicas sin etiquetas.
- Investigación traslacional en TCGA: reutilizar el modelo sobre las mismas laminas de origen para estudiar asociaciones entre morfología nuclear y variables clínicas o genómicas.
- Prototipado rápido en entornos con recursos limitados: al tener solo 21,4 millones de parámetros (0,1 GB), cabe en GPU de consumo y permite iterar en cuadernos sin infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 21,4 millones de parámetros en fp32 ocupa aproximadamente 85 MB de pesos, y en fp16 unos 43 MB. La VRAM real depende del tamaño de lote y de la resolución de entrada.
- GPU recomendadas: cualquier GPU moderna sirve; para lotes grandes se recomienda A100 o H100, aunque el modelo es lo bastante pequeño para GPUs de consumo.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2-4 GB de VRAM (por ejemplo RTX 3060, RTX 4090) para lotes moderados.
- Opciones de despliegue: timm (nativo), PyTorch, Hugging Face Hub vía `timm.create_model('hf-hub:...')`; el formato safetensors es compatible con los pipelines estándar de PyTorch. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI (son frameworks orientados a modelos de lenguaje).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| LEMON (este port, ViT-S/8) | 21,4 M | 40x40 px (ampliable por interpolación) | MIT | Hugging Face (timm) |
| LEMON original (`aliceblondel/LEMON`) | no disponible en la información | 40x40 px | MIT | Hugging Face (checkpoint MoCo v3) |
| Otros modelos fundacionales de patología (p. ej. UNI, Virchow, Hibou) | no disponible en la información | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo exclusivamente de visión: no procesa texto ni mantiene conversaciones; no debe usarse como modelo generativo.
- Entrenado sobre células individuales de 40x40 píxeles a 0,25 um/píxel; usarlo con otras escalas, tinciones o modalidades de imagen puede degradar la calidad de los embeddings.
- El preentrenamiento usa laminas de TCGA, lo que puede introducir sesgos de dominio (distribución de tejidos, tinciones y poblaciones de pacientes del repositorio).
- Riesgo de que los embeddings no generalicen a laboratorios con protocolos de tinción o escáneres distintos a los de TCGA.
- No se documentan evaluaciones de sesgo, robustez ni calibración en la información disponible.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones de los datos de origen (TCGA) y citar el paper original.
- El port es de un tercero (1aurent); aunque los pesos son bit-idénticos, la responsabilidad del mantenimiento recae en ese repositorio.
- No se documenta cuantización ni despliegue en frameworks de servido de alto rendimiento; para producción habría que validar latencia y throughput por cuenta propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/1aurent/vit_small_patch8_224.lemon
- Modelo original y pesos: https://huggingface.co/aliceblondel/LEMON
- Paper LEMON: https://arxiv.org/abs/2603.25802
- DOI del paper: https://doi.org/10.48550/arXiv.2603.25802
- Repositorio timm: https://github.com/huggingface/pytorch-image-models
