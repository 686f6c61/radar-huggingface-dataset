# shreshthsaini/brightrate-study-gemma4-12b-multiexposure

## Resumen

El modelo `shreshthsaini/brightrate-study-gemma4-12b-multiexposure` es un adaptador PEFT (LoRA) construido sobre el modelo base `google/gemma-4-12B-it`, desarrollado por Shreshth Saini y colaboradores como parte del estudio BrightRate-LM. Su propósito es la evaluación de calidad perceptual sin referencia (no-reference) de vídeo HDR generado por usuarios, un problema relevante en pipelines de procesado y distribución de vídeo donde no se dispone de la señal original como referencia.

El adaptador procesa ocho fotogramas uniformemente muestreados del vídeo, cada uno renderizado a tres exposiciones diferentes (-2, 0 y +2 pasos), generando 24 imágenes que se pasan al modelo en orden temporal-mayor. A partir de esta entrada multimodal, el modelo predice una puntuación de calidad media (MOS) interpolada entre cinco niveles de calidad. El adaptador está entrenado sobre el dataset BrightVQ (split 0) y reporta métricas de correlación moderadas en su conjunto de test.

La relevancia de este modelo radica en que combina un LLM multimodal de última generación con una estrategia de representación multi-exposición para abordar la evaluación de calidad de vídeo HDR, un área donde los métodos tradicionales basados en características hand-crafted suelen quedarse cortos. Al ser un adaptador LoRA, es ligero y fácil de integrar sobre el modelo base, lo que facilita su uso en investigación y prototipado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Gemma-4-12B-it (transformer multimodal) |
| Parametros totales | Adaptador: ~0.3 GB (repo); modelo base: 12B (no disponible el desglose exacto del adaptador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base; el adaptador no especifica) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base puede cuantizarse) |
| Idiomas soportados | No disponibles (el adaptador no especifica; el modelo base Gemma 4 soporta multiples idiomas) |
| Licencia | No disponible (el adaptador no declara licencia; el modelo base tiene la licencia de Gemma) |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 y dropout 0.05, aplicado sobre el modelo base Gemma-4-12B-it, un transformer multimodal denso de 12B parámetros. La entrada se construye a partir de 8 fotogramas del vídeo, cada uno renderizado a tres exposiciones (-2, 0, +2 stops), generando 24 imágenes que se concatenan en orden temporal-mayor. Esta representación multi-exposición permite al modelo capturar información de rango dinámico y luminancia que es crítica para evaluar calidad HDR.

El entrenamiento se realizó sobre el split 0 del dataset BrightVQ, con dos épocas completas y un horizonte de programación coseno de tres épocas, tasa de aprendizaje 1e-4, micro-batch 1 y acumulación de gradientes de 8. Los objetivos MOS se interpolan entre cinco palabras de calidad (probablemente etiquetas cualitativas). No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado sobre las puntuaciones MOS del dataset.

## Capacidades

- Evaluación de calidad perceptual sin referencia de vídeo HDR generado por usuarios.
- Procesamiento de múltiples exposiciones por fotograma para capturar información de rango dinámico.
- Predicción de puntuaciones MOS interpoladas entre cinco niveles de calidad.
- Integración con el modelo base Gemma-4-12B-it, que aporta capacidades multimodales de comprensión de imágenes y texto.
- No se reportan capacidades de generación de texto, razonamiento, código o tool calling; el adaptador está especializado exclusivamente en la tarea de calidad de vídeo.

## Casos de uso

- Control de calidad automatizado en plataformas de vídeo UGC: el adaptador puede puntuar vídeos subidos por usuarios para detectar problemas de exposición, ruido o artefactos de compresión, priorizando la revisión manual o el reencode.
- Evaluación de pipelines de transcodificación HDR: al integrarse en un flujo de procesado, permite comparar la calidad percibida de distintas configuraciones de codificación sin necesidad de referencias originales.
- Investigación en calidad perceptual: el adaptador sirve como herramienta para estudiar la relación entre representaciones multi-exposición y la percepción humana de calidad en vídeo HDR.
- Benchmarking de algoritmos de mejora de vídeo: se puede usar para puntuar la salida de algoritmos de superresolución, denoising o tone mapping, proporcionando una métrica sin referencia.
- Monitorización de calidad en streaming adaptativo: en sistemas de streaming ABR, el adaptador podría evaluar la calidad de los segmentos entregados en tiempo real, aunque su latencia actual no está documentada.
- Desarrollo de nuevos datasets de calidad: el adaptador puede generar pseudo-etiquetas para vídeos sin anotaciones humanas, acelerando la creación de datasets más grandes.

## Benchmarks y rendimiento

En el conjunto de test del split 0 de BrightVQ (420 vídeos), el adaptador reporta las siguientes métricas:

| Metrica | Valor |
|---|---|
| SROCC (Spearman) | 0.6985 |
| PLCC (Pearson) | 0.7297 |
| KRCC (Kendall) | 0.5086 |
| RMSE | 9.1756 |

No se han publicado comparaciones con otros métodos en la informacion disponible. Estas métricas indican una correlación moderada-alta con las puntuaciones humanas, pero no son directamente comparables con benchmarks de LLM generales (MMLU, HumanEval, etc.) porque la tarea es específica de calidad de vídeo.

## Requisitos de hardware

- El adaptador LoRA es ligero (~0.3 GB), pero requiere cargar el modelo base Gemma-4-12B-it, que en FP16 ocupa aproximadamente 24 GB de VRAM.
- Para inferencia en FP16 se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090/4090, A10G, A100 40GB).
- Con cuantización del modelo base (por ejemplo, 8 bits o 4 bits), podría ejecutarse en GPUs con 12-16 GB, aunque no se han probado configuraciones específicas.
- El despliegue puede realizarse con librerías que soporten PEFT y modelos multimodales, como Hugging Face Transformers con `peft`, o vLLM si se convierte el adaptador a un formato compatible.
- No se dispone de datos de latencia o throughput; dependerá del hardware y del número de fotogramas procesados (24 imágenes por vídeo).

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables en la misma categoría (evaluación de calidad de vídeo HDR con LLMs multimodales). Los métodos tradicionales de calidad sin referencia (BRISQUE, NIQE, etc.) no son directamente comparables por su naturaleza no neuronal y su enfoque en imágenes estáticas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El adaptador está calibrado exclusivamente para el dataset BrightVQ (split 0); las puntuaciones no son transferibles a otros datasets, pipelines de visualización o dominios de vídeo.
- No se han evaluado sesgos potenciales del modelo base Gemma-4-12B-it en esta tarea específica; el adaptador hereda las limitaciones del modelo base.
- La licencia del adaptador no está declarada; el uso comercial puede estar restringido por la licencia del modelo base Gemma (consultar los términos de Google).
- El adaptador solo procesa vídeo a través de fotogramas muestreados; no maneja audio ni otra información temporal más allá de la secuencia de imágenes.
- Las métricas reportadas (SROCC ~0.70) indican una precisión moderada; no es adecuado para decisiones críticas sin validación adicional en el dominio de aplicación.
- No se documenta el comportamiento ante vídeos con condiciones extremas de iluminación, motion blur o artefactos de compresión severos.

## Enlaces

- HuggingFace: https://huggingface.co/shreshthsaini/brightrate-study-gemma4-12b-multiexposure
- Repositorio BrightRate-LM: https://github.com/shreshthsaini/BrightRate-LM
- Dataset BrightVQ: https://github.com/shreshthsaini/BrightVQ
- Paper (enviado): Saini, S., Wang, Y., Birkbeck, N., Adsumilli, B., Bovik, A. C. "BrightRate-LM: Representation-Aware Quality Assessment for User-Generated HDR Video", Machine Vision and Applications, 2026 (Submitted).
- Documentación de Gemma 4: https://ai.google.dev/gemma/docs/core
- Technical Report de Gemma 4: https://arxiv.org/pdf/2607.02770
