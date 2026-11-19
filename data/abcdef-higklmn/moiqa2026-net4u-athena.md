# abcdef-higklmn/moiqa2026-net4u-athena

## Resumen

`moiqa2026-net4u-athena` es el paquete de pesos y artefactos de inferencia presentado por el equipo `abcdef-higklmn` a la MoIQA Challenge 2026 (IEEE SPS), una competición de evaluación de calidad de imagen orientada a máquina (*machine-oriented image quality assessment*, MoIQA). No es un modelo único entrenable de extremo a extremo, sino un pipeline de tres etapas con componentes entrenados (árboles de gradient boosting, estudiantes ConvNeXt-Tiny, un LoRA sobre Qwen2.5-VL-7B y un apilado por regresión ridge) más las salidas intermedias de cada fase, publicadas para verificación de los organizadores y reproducibilidad.

El repositorio corresponde a la entrega puntuada en la fase de test (CodaBench submission ID 1052394, fichero `exp94a_within_m13vqa_test.zip`), con PLCC 0,9342, SRCC 0,9236 y puntuación final 0,9289. Todos los pesos base utilizados son de pesos abiertos (Qwen2.5-VL, LLaVA-OneVision, DINOv2, CLIP, ConvNeXt-Tiny de torchvision, entre otros); el autor declara que no se empleó ningún modelo propietario ni API de pago en ninguna etapa.

El interés del paquete es fundamentalmente de reproducibilidad y auditoría: permite reconstruir la predicción final sin reejecutar los modelos grandes, ya que incluye las matrices intermedias en CSV/JSON/JSONL. El tamaño del repositorio es de 2,9 GB y la licencia declarada es `other`, sin texto de licencia detallado en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: árboles (HistGradientBoosting + ExtraTrees), CNN ConvNeXt-Tiny, VLM Qwen2.5-VL-7B-Instruct con LoRA, apilado ridge |
| Parametros totales | No disponible como cifra única; el backbone mayor es Qwen2.5-VL-7B-Instruct (~7B) y el resto son componentes ligeros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del backbone Qwen2.5-VL-7B-Instruct, no especificada en la model card) |
| Tipos de cuantizacion | No disponible (pesos en `joblib` y `torch state_dict` en punto flotante) |
| Idiomas soportados | No disponible |
| Licencia | `other` (sin texto de licencia detallado en la información disponible) |
| Formato de pesos | `joblib` (sklearn), `.pt` (torch state_dict), CSV/JSON/JSONL para salidas intermedias, TSV para el envío final |

## Arquitectura y entrenamiento

El pipeline consta de tres etapas. La etapa 0 recupera la estructura del test (300 imágenes anónimas agrupadas en 10 grupos de 30) e infiere dominio, tipo de distorsión y severidad con modelos sklearn ajustados en los propios scripts. La etapa 1 combina tres ramas: (1a) características de pseudo-referencia reconstruidas por atención a partir de DINOv2-S, CLIP-B/32 y LLaVA-OV-0.5B congelados, alimentando HistGradientBoosting y ExtraTrees con ponderación 50/50 sensible al ranking; (1b) estudiantes ConvNeXt-Tiny con prior de metadatos y residual de imagen, entrenados conjuntamente en MoIQA y MPD, con 5 folds; y (1c) expertos ConvNeXt-Tiny especializados por dominio (AIGI, NSI, SCI), también con 5 folds. La base de la etapa 1 se compone como 0,75·(1a) + 0,25·(0,5·(1b) + 0,5·(1c enrutado por dominio inferido)).

La etapa 2 añade un regresor Qwen2.5-VL-7B-Instruct con LoRA (r=16, α=32, sobre q/k/v/o) y cabeza de regresión, entrenado con 3 semillas × 5 folds; además, un componente de anotador simulado que genera leyendas con 13 LMM abiertos y detectores/segmentadores de torchvision, con recuperación CLIP, para producir características de consenso entre hermanos y predictores ridge de componentes (cap, oth) ajustados sobre MPD público. La etapa 2c construye consistencia de QA con preguntas por grupo respondidas por 4 LMM abiertos. La etapa 3 aplica un apilado ridge sobre [base, vlm, pc_cap, pc_oth, sim_lmm_a] usando predicciones out-of-fold tipo test, recentrando cada grupo de test sobre su media de etapa 1; 60 imágenes idénticas al MPD público conservan su etiqueta pública.

Los datos de entrenamiento son el conjunto MoIQA (2.100 imágenes etiquetadas) y el dataset externo oficial MPD (3.000 imágenes públicas), con eliminación de las 8 referencias compartidas entre ambos en todos los pools. No se dispone de información sobre número de tokens de texto, composición detallada del dataset ni uso de RLHF/DPO.

## Capacidades

- Evaluación de calidad de imagen orientada a máquina (MoIQA), no a percepción humana: produce puntuaciones de calidad para imágenes distorsionadas.
- Inferencia de dominio (AIGI, NSI, SCI), tipo de distorsión y severidad a partir de la estructura del test.
- Extracción de características visuales con DINOv2-S, CLIP-B/32 y LLaVA-OV-0.5B congelados.
- Regresión sobre características visuales con HistGradientBoosting y ExtraTrees.
- Ajuste fino eficiente (LoRA) de un VLM de 7B para regresión de calidad.
- Generación de leyendas y respuestas de QA visual con múltiples LMM abiertos (Qwen2.5-VL, Qwen2-VL, Qwen3-VL, LLaVA-OneVision, LLaVA-1.5, LLaVA-1.6, Pangea, InstructBLIP, InternVL3).
- Detección y segmentación de objetos con Mask R-CNN, Faster R-CNN, RetinaNet y FCOS (COCO).
- Recuperación y similitud semántica con CLIP-L/14 y embeddings de frases con all-MiniLM-L6-v2.
- Apilado y calibración por grupo con regresión ridge.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modo thinking.

## Casos de uso

- Auditoría de resultados de competición: los organizadores pueden verificar la submission 1052394 sin reejecutar los modelos grandes, ya que el repositorio incluye las salidas intermedias de cada etapa en CSV/JSON/JSONL.
- Reproducción de la puntuación final: un investigador puede recomponer el pipeline etapa a etapa y comprobar PLCC 0,9342, SRCC 0,9236 y final 0,9289 con los artefactos publicados.
- Investigación en MoIQA: sirve como referencia metodológica para combinar características congeladas de varios modelos, estudiantes CNN y un VLM con LoRA en una tarea de regresión de calidad.
- Desarrollo de sistemas de control de calidad de imagen en producción: el estudiante ConvNeXt-Tiny (etapa 1b) es ligero y puede desplegarse para cribar imágenes antes de un pipeline mayor.
- Enrutado por dominio en pipelines de datos: los expertos por dominio (AIGI/NSI/SCI) permiten clasificar y puntuar imágenes según su naturaleza antes de otras tareas.
- Generación de características de consenso entre modelos: el componente de anotador simulado (etapa 2b) puede reutilizarse para construir señales de referencia sin etiquetas humanas.
- Evaluación de consistencia de QA visual: la etapa 2c permite medir el acuerdo entre varios LMM sobre preguntas de un grupo de imágenes, útil para seleccionar modelos en tareas visuales.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| PLCC (Test-Phase) | 0,9342 |
| SRCC (Test-Phase) | 0,9236 |
| Puntuacion final | 0,9289 |
| ID de submission CodaBench | 1052394 |
| Fichero evaluado | `exp94a_within_m13vqa_test.zip` |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks estándar de texto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma agregada. El componente mayor es Qwen2.5-VL-7B-Instruct con LoRA, que en precisión completa requiere del orden de 14-16 GB solo para pesos, más activaciones y caché KV; no se especifica la cuantización empleada.
- GPU recomendadas: no disponibles en la información proporcionada. Para el backbone de 7B se necesitaría al menos una GPU de 24 GB (RTX 4090, A10, L4) en precisión reducida, o A100/H100 para mayor throughput; los componentes ConvNeXt-Tiny y los árboles caben en GPU consumer.
- Cabe en GPU consumer: los estudiantes ConvNeXt-Tiny y los modelos sklearn sí; el VLM de 7B con LoRA requiere al menos 24 GB o cuantización.
- Opciones de despliegue: los artefactos se entregan como `joblib` (sklearn) y `torch state_dict` (`.pt`), no como GGUF ni safetensors listos para vLLM, llama.cpp, Ollama o TGI. Para el VLM habría que reconstruir el modelo base y cargar el LoRA por separado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de MoIQA con los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- La licencia es `other` sin texto detallado en la información disponible; es imprescindible contactar con el autor antes de cualquier uso comercial.
- Es un paquete de artefactos de una submission de competición, no un modelo listo para producción: requiere reconstruir el pipeline y cargar los backbones base por separado.
- Los pesos están en `joblib` y `state_dict` de PyTorch, sin versiones GGUF ni safetensors; el despliegue en servidores de inferencia estándar no es directo.
- Riesgo de sobreajuste al conjunto de test de la competición: el pipeline se diseñó y calibró específicamente para 300 imágenes de test agrupadas en 10 grupos de 30.
- Se documenta que 60 imágenes de test son idénticas por SHA-256 a imágenes del MPD público y conservan su etiqueta pública; aunque los organizadores lo autorizaron, es una fuga de información declarada que condiciona la interpretación de la puntuación.
- El pipeline depende de muchos modelos externos (13 LMM, detectores COCO, CLIP, DINOv2, LLaVA); la reproducibilidad exacta exige las mismas versiones y pesos.
- No se documentan sesgos, comportamiento multilingüe ni riesgos de alucinación del VLM en esta tarea concreta.
- No hay información sobre latencia, throughput ni coste de inferencia del pipeline completo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/abcdef-higklmn/moiqa2026-net4u-athena
- Backbone VLM (etapa 2a): https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Características congeladas (etapa 1a): https://huggingface.co/facebook/dinov2-small
- Características congeladas (etapa 1a): https://huggingface.co/openai/clip-vit-base-patch32
- Características congeladas (etapa 1a): https://huggingface.co/llava-hf/llava-onevision-qwen2-0.5b-ov-hf
- Recuperación CLIP-L/14 (etapa 2b): https://huggingface.co/openai/clip-vit-large-patch14
- Embeddings de frases (etapa 2b): https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Pesos ConvNeXt-Tiny (torchvision): https://pytorch.org/vision/stable/models/convnext.html
- MoIQA Challenge 2026 (IEEE SPS): no disponible en la información proporcionada
- Metodología y paper: no disponible en la información proporcionada
