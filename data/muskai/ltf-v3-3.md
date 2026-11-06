# MuskAI/LTF-v3.3

## Resumen

LTF v3.3 (también denominado HiDA v3.3 en el código original del experimento) es un detector de imágenes generadas por IA desarrollado por MuskAI. El modelo aborda la tarea de clasificación binaria entre imágenes reales (etiqueta 0) y falsas o sintéticas (etiqueta 1), un problema de creciente relevancia para la verificación de procedencia de contenido en entornos editoriales, plataformas y pipelines de moderación. Se publica como checkpoint histórico del epoch 20 empleado en la evaluación GenImage identificada como `20260326_012209_ViT-L-14_genimage_v3_v3_3`.

La arquitectura se apoya en un backbone CLIP ViT-L/14 congelado y añade un esquema de multiple-instance learning (MIL) de dos niveles, cross-shuffle durante el entrenamiento y una fusión por pool-logit gated. El repositorio incluye el runtime PyTorch personalizado y el backbone congelado, por lo que no requiere conversión a una arquitectura de Transformers. El tamaño del repositorio es de 1,0 GB y el pipeline declarado es `image-classification`.

El modelo es relevante por su enfoque de detección a nivel de parche (tiles locales de 224×224 alineados con los bordes más una vista global) sobre CLIP, una estrategia que permite capturar artefactos locales de generación sin reentrenar el backbone. No obstante, se trata de un detector de investigación: sus puntuaciones no están calibradas como probabilidades de autenticidad y no constituyen prueba de procedencia de una imagen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CLIP ViT-L/14 congelado + MIL de dos niveles (L1/L2) + fusión pool-logit gated |
| Parámetros totales | no disponible (backbone ViT-L/14 congelado; recuento exacto no publicado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; ventana de tiles variable según tamaño de imagen) |
| Tipos de cuantización | no disponible (pesos en punto flotante PyTorch; no se documentan variantes cuantizadas) |
| Idiomas soportados | en, zh (según metadatos del repositorio) |
| Licencia | no disponible (el autor no proporcionó licencia; CLIP subyacente bajo MIT) |
| Formato de pesos | PyTorch (`.pth`); backbone `backbones/ViT-L-14.pt`; no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de un backbone CLIP ViT-L/14 congelado (SHA256 `b8cca3fd41ae0c99ba7e8951adf17d267cdb84cd88be6f7c2e0eca1737a03836`) y aplica sobre él un esquema de multiple-instance learning de dos niveles. La imagen se decodifica en RGB y se descompone en tiles locales de 224×224 alineados con los bordes, junto con una vista global, todo ello procesado con el preprocesamiento original de CLIP. La rama L1 y la rama L2 producen puntuaciones independientes que se combinan mediante una fusión gated por pool-logit. Durante el entrenamiento se empleó cross-shuffle, una técnica de mezcla de instancias orientada a mejorar la generalización entre generadores.

El checkpoint publicado (`weights/epoch_20.pth`, SHA256 `32e9fa2e38e04d6d0221c844d650f0d45f7235bbf898b5ad665543d8be580031`) es el state_dict original del epoch 20, no el `best.pth`. El núcleo se recuperó del commit git `65c18ee5868ced87a27d048261e237632ad5d704` con la nomenclatura de red ajustada a LTF; la adaptación al Hub añade carga de checkpoint solo de tensores y elimina una ruta de dataset específica de máquina. El autor advierte que los directorios originales de entrenamiento y evaluación no guardaron instantáneas del código fuente del día de entrenamiento, por lo que la verificación cubre la identidad del checkpoint y la compatibilidad del runtime, no la reproducción bit a bit del proceso de entrenamiento. No se documenta el número de tokens ni la composición exacta del dataset de entrenamiento.

## Capacidades

- Clasificación binaria de imágenes: real (0) frente a generada por IA (1).
- Detección a nivel de parche mediante tiles locales de 224×224 más vista global, lo que permite localizar artefactos locales de generación.
- Salida de tres puntuaciones independientes: rama L1, rama L2 y fusión, además de la etiqueta seleccionada y el número de vistas procesadas.
- Umbral de decisión configurable (por defecto 0,5 en la evaluación histórica).
- Procesamiento de imágenes de tamaño variable mediante chunking configurable para controlar el consumo de memoria.
- Inferencia en CPU y GPU (`--device cpu`, `--device cuda:0`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No es un modelo generativo ni multimodal conversacional: no produce texto, código, matemáticas, audio ni visión descriptiva.

## Casos de uso

- Moderación de contenido en plataformas: integración del detector como filtro previo para marcar imágenes potencialmente sintéticas antes de la revisión humana, usando la puntuación de fusión con umbral ajustable según la política de la plataforma.
- Verificación editorial y periodística: comprobación de imágenes recibidas de fuentes externas como señal adicional (nunca como prueba) antes de su publicación, aprovechando la salida de tres ramas para detectar casos ambiguos donde L1 y L2 discrepan.
- Investigación en detección de deepfakes y contenido sintético: uso del checkpoint como línea base reproducible en experimentos académicos sobre el conjunto GenImage, dado que el repositorio incluye el runtime y los checksums de verificación.
- Auditoría de datasets: cribado de corpus de imágenes para identificar muestras generadas por IA y separar subconjuntos sintéticos de reales antes de entrenar otros modelos.
- Análisis forense de imágenes: examen de artefactos locales mediante la vista por tiles, útil para inspeccionar regiones concretas de una imagen sospechosa con imágenes de alta resolución (ajustando `--chunk-size`).
- Pipelines de cumplimiento normativo: registro de puntuaciones de autenticidad como metadato en sistemas de gestión de activos digitales, con la advertencia de que las puntuaciones no están calibradas y no certifican procedencia.

## Benchmarks y rendimiento

Resultados históricos registrados por el autor con umbral fijo 0,5 sobre 8 subconjuntos de GenImage y 100.000 imágenes. La precisión es la media no ponderada entre subconjuntos, según los logs originales redondeados:

| Rama | Precisión |
|---|---:|
| L1 | 95,26% |
| L2 | 97,39% |
| Fusión | 98,39% |

Advertencias del autor: son resultados históricos registrados y la subida del repositorio no reejecutó el benchmark completo. Se usaron imágenes oficiales de validación de SD1.4 durante la validación del entrenamiento, por lo que ese subconjunto se solapa con la validación del modelo. Por tanto, estos resultados no representan ocho generadores completamente reservados. Las métricas por subconjunto están en `results/genimage8_logged_metrics.csv`.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El backbone ViT-L/14 congelado y el repositorio de 1,0 GB sugieren un consumo moderado en GPU, pero el autor no publica cifras de VRAM.
- GPU recomendadas: no especificadas por el autor. El modelo admite `--device cuda:0`; por el tamaño del backbone CLIP ViT-L/14, es razonable esperar que quepa en GPU de consumo, aunque no se confirma en la documentación.
- CPU: soportada (`--device cpu`), con la advertencia de que la inferencia puede ser lenta en imágenes con muchos tiles locales.
- Despliegue: runtime PyTorch propio incluido en el repositorio (`inference.py`, `ltf_final.LTFDetector`), instalación mediante `requirements.txt` con Python 3.11. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Memoria: el parámetro `--chunk-size` permite reducir el tamaño de lote del forward de CLIP sin eliminar tiles, lo que ayuda a controlar el uso de memoria en imágenes grandes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks ni especificaciones de modelos alternativos en la información disponible, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parámetros | Contexto | Precisión GenImage | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTF v3.3 (HiDA v3.3) | no disponible (backbone ViT-L/14) | no aplica | 98,39% (fusión, histórico) | no disponible | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las puntuaciones no son probabilidades de autenticidad calibradas; un valor alto no prueba que una imagen sea sintética ni un valor bajo prueba que sea real.
- Las predicciones pueden variar según el contenido de la imagen, el generador, la edición y la compresión aplicada.
- Es un detector de investigación: una puntuación individual no demuestra la procedencia de una imagen.
- Los resultados de GenImage no provienen de ocho generadores completamente reservados: el subconjunto SD1.4 se solapa con la validación del entrenamiento.
- No se ha publicado licencia; es necesario contactar con el autor para permisos de reutilización. Los componentes CLIP incluidos mantienen los términos upstream (MIT).
- No se ha proporcionado la cita del paper final.
- El proceso de entrenamiento no es reproducible bit a bit: no se guardaron instantáneas del código fuente del día de entrenamiento.
- La demo pública aplica límites configurables de tamaño de imagen y rechaza subidas sobredimensionadas en lugar de redimensionarlas silenciosamente.
- La inferencia en CPU puede ser lenta con imágenes que generan muchos tiles.
- Sesgos conocidos: no documentados por el autor; al depender de artefactos de generación, el rendimiento puede degradarse frente a generadores no representados en el entrenamiento.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la clasificación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MuskAI/LTF-v3.3
- OpenCLIP/CLIP de OpenAI (componente upstream): https://github.com/openai/CLIP
- Licencia MIT de CLIP: https://github.com/openai/CLIP/blob/main/LICENSE
- Métricas por subconjunto: `results/genimage8_logged_metrics.csv` (incluido en el repositorio)
- Manifiesto de release con checksums: `release_manifest.json` (incluido en el repositorio)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
