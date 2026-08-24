# BiliSakura/S5-transformers

## Resumen

S5-transformers es una colección de checkpoints de visión por computador, convertidos a formato Hugging Face, que contiene dos codificadores ViT (Base y Large) preentrenados con el método S4P (Semi-supervised Semantic Segmentation Pre-training) sobre el dataset RS4P-1M de imágenes de teledetección óptica. El modelo original, desarrollado por Liang Lv, Di Wang, Jing Zhang y Lefei Zhang, se presentó en el paper "S5: Scalable Semi-Supervised Semantic Segmentation in Remote Sensing" (arXiv:2508.12409, AAAI 2026 Oral). La conversión a Hugging Face la realizó BiliSakura, que ya ha publicado otros modelos de teledetección como SATMAE-PP-transformers o DOFA-transformers.

Estos checkpoints son exclusivamente codificadores (encoder-only), sin cabezas de segmentación UPerNet ni cabezas MoE-MDF, y se publican bajo licencia Apache 2.0. El repositorio incluye dos variantes: ViT-Base/16 (hidden size 768, 12 capas) y ViT-Large/16 (hidden size 1024, 24 capas), ambas con tamaño de parche 16 y resolución de entrada de 512×512. Son modelos de extracción de características para imágenes de observación de la Tierra, no modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-Base/16 y ViT-Large/16 (Vision Transformer) |
| Parametros totales | ViT-B: ~86 M; ViT-L: ~308 M (no confirmados oficialmente) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta del repo; modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con config.json y codigo remoto) |

## Arquitectura y entrenamiento

Los dos checkpoints son codificadores ViT puros, sin cabezas de tarea, preentrenados con S4P, un enfoque de preentrenamiento semisupervisado para segmentación semántica en teledetección. El preentrenamiento se realizó sobre RS4P-1M, un dataset de un millón de imágenes ópticas de teledetección (enlace al dataset en la sección de enlaces). No se detalla el número exacto de tokens de entrenamiento ni la composición del dataset en la información disponible.

La conversión a Hugging Face incluye código remoto autocontenido (`modeling_s5.py`), procesador y pipeline `s5-feature-extraction`, de modo que los checkpoints cargan con `trust_remote_code=True`. El procesador aplica normalización ImageNet (mean/std) y rescale por defecto, y permite desactivar el redimensionado para trabajar a resolución nativa de la imagen de entrada.

## Capacidades

- Extracción de características globales y densas de imágenes ópticas de teledetección (RGB).
- Generación de mapas de características densos de tamaño [1, 768, 32, 32] (ViT-B) y [1, 1024, 32, 32] (ViT-L) para entrada de 512×512.
- Pooling global opcional para obtener embeddings de imagen de 768 o 1024 dimensiones.
- Preentrenamiento semisupervisado orientado a segmentación semántica, útil como backbone para tareas downstream.
- No incluye soporte de tool calling, agentes, razonamiento multimodal ni procesamiento de lenguaje.

## Casos de uso

- **Segmentación semántica de imágenes de satélite**: los codificadores preentrenados con S4P están diseñados para transferir a tareas de segmentación de cobertura terrestre; se pueden usar como backbone en modelos de segmentación como UPerNet o MDF, añadiendo cabezas específicas.
- **Clasificación de tipos de cultivo o uso del suelo**: las características extraídas de las imágenes multiespectrales (RGB) se pueden alimentar a clasificadores lineales o MLP para clasificar parcelas agrícolas o urbanas.
- **Detección de cambios entre imágenes temporales**: al comparar embeddings globales o mapas de características de imágenes de distintas fechas, el modelo permite detectar cambios en el territorio.
- **Extracción de características para modelos de recuperación (retrieval)**: el embedding global de 768 o 1024 dimensiones puede indexar una base de datos de imágenes de satélite para búsqueda por similitud.
- **Preentrenamiento para tareas de visión por computadora en teledetección**: al ser encoder-only y de código abierto, sirve como base para fine-tuning en tareas específicas de observación de la Tierra sin necesidad de entrenar desde cero.
- **Integración en pipelines de procesamiento geoespacial**: mediante el pipeline `s5-feature-extraction` de Hugging Face, se puede integrar en flujos de datos geoespaciales para enriquecer features de imágenes antes de pasarlas a modelos de regresión o clasificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper original (arXiv:2508.12409) reporta resultados de segmentación semántica en datasets de teledetección, pero no se incluyen en la documentación del repositorio de Hugging Face ni en la búsqueda web realizada.

## Requisitos de hardware

- **VRAM estimada para inferencia**: para ViT-Base en FP16, alrededor de 2-3 GB de VRAM; para ViT-Large en FP16, alrededor de 5-7 GB. En FP32, ViT-B necesitaría ~4-5 GB y ViT-L ~10-12 GB.
- **GPU recomendadas**: cualquier GPU con al menos 6 GB de VRAM para ViT-L en FP16 (por ejemplo, RTX 3060, RTX 4060, RTX 4070). Para ViT-B, basta con 4 GB (GTX 1650, RTX 3050).
- **Consumer GPU**: sí, ambos checkpoints caben en GPUs de consumo actuales, tanto en FP16 como en FP32 (con ciertos límites para ViT-L en FP32).
- **Opciones de despliegue**: se puede usar directamente con el pipeline de Hugging Face (`transformers`), con `torch` para inferencia, o exportar a ONNX para despliegue en entornos de producción. No se menciona soporte de vLLM, llama.cpp ni Ollama (son modelos de visión, no LLM).
- **Latencia y throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Preentrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| S5-transformers (ViT-B/L) | ViT Base/Large | ~86 M / ~308 M | 512×512 | S4P sobre RS4P-1M | Apache 2.0 | Hugging Face |
| SATMAE-PP-transformers (ViT-B/L) | ViT Base/Large | ~86 M / ~308 M | 224×224 | MAE con enmascaramiento espacial | Apache 2.0 | Hugging Face |
| DOFA-transformers (ViT-B/L) | ViT Base/Large | ~86 M / ~308 M | 224×224 | Preentrenamiento multimodal (bandas espectrales) | Apache 2.0 | Hugging Face |
| SATLAS-transformers | ViT (varios) | no disponible | no disponible | SSL con datos de teledetección | Apache 2.0 | Hugging Face |

Nota: los modelos SATMAE, DOFA y SATLAS son también conversiones de BiliSakura de modelos de teledetección. S5 se distingue por su preentrenamiento semisupervisado orientado a segmentación semántica y su resolución de entrada de 512×512 (mayor que los 224×224 de los otros).

## Limitaciones y advertencias

- **Solo encoder**: no incluye cabezas de segmentación (UPerNet, MoE-MDF), por lo que para segmentación final hay que añadir la cabeza correspondiente.
- **Dominio específico**: entrenado exclusivamente con imágenes de teledetección óptica RGB; su rendimiento en imágenes naturales (fotografía, etc.) no está garantizado y probablemente sea subóptimo.
- **Sin datos de benchmarks**: no se proporcionan resultados de rendimiento en la información disponible, por lo que no es posible evaluar la calidad comparativa de los checkpoints.
- **Idiomas**: el modelo no procesa lenguaje; la etiqueta "en" se refiere al idioma de la documentación, no a capacidades lingüísticas.
- **Licencia Apache 2.0**: permite uso comercial, pero se debe citar el paper original (S5) y respetar las condiciones de la licencia.
- **Código remoto**: la carga requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio del autor; se debe revisar el código antes de usarlo en entornos seguros.
- **Sin garantías de producción**: al ser una conversión reciente (creado en agosto de 2026) y sin benchmarks públicos, no se recomienda su uso en producción sin validación previa en el dominio específico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BiliSakura/S5-transformers
- Paper original: https://arxiv.org/abs/2508.12409
- Dataset RS4P-1M: https://huggingface.co/datasets/lianglyu/R4P-1M
- Repositorio de conversión en GitHub: https://github.com/Bili-Sakura/S5-transformers
- Modelo original de lianglyu: https://huggingface.co/lianglyu/S5
- Perfil del autor de la conversión: https://huggingface.co/BiliSakura
