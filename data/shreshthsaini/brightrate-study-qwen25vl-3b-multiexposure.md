# shreshthsaini/brightrate-study-qwen25vl-3b-multiexposure

## Resumen

El modelo `shreshthsaini/brightrate-study-qwen25vl-3b-multiexposure` es un adaptador PEFT (LoRA) desarrollado por Shreshth Saini y colaboradores como parte del estudio BrightRate-LM, centrado en la evaluación de calidad perceptual sin referencia (no-reference) de vídeo HDR generado por usuarios (UGC-HDR). Se basa en el modelo vision-language `Qwen/Qwen2.5-VL-3B-Instruct` y añade una capa de adaptación específica para predecir puntuaciones de calidad (MOS) a partir de una secuencia de fotogramas con múltiples exposiciones.

La relevancia de este adaptador radica en que aborda un problema poco cubierto: la calidad de vídeo HDR de contenido generado por usuarios, donde coexisten distorsiones típicas de UGC (compresión, ruido, artefactos) con artefactos específicos de HDR (banding, clipping, tonemapping). El modelo se entrena sobre el dataset BrightVQ, una nueva colección de vídeos UGC-HDR, y su diseño de entrada consiste en ocho fotogramas muestreados uniformemente, cada uno renderizado a -2, 0 y +2 pasos de exposición, generando 24 imágenes que se pasan en orden temporal-mayor.

El adaptador está pensado exclusivamente para investigación y no está calibrado para otros dominios o pipelines de visualización. Su tamaño de repositorio es de 0.1 GB, lo que indica que solo contiene los pesos del adaptador LoRA, no el modelo base completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-VL-3B-Instruct (modelo vision-language) |
| Parametros totales | No disponible (el adaptador LoRA rank 16 tiene un tamano de 0.1 GB; el modelo base tiene 3B parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen2.5-VL-3B-Instruct) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base puede cuantizarse) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5-VL soporta multiples idiomas, pero el adaptador no especifica) |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base `Qwen2.5-VL-3B-Instruct`, un transformer vision-language con capacidad de procesamiento de imágenes y vídeo. El adaptador LoRA tiene rank 16, alpha 32 y dropout 0.05, y se entrena con una tasa de aprendizaje de 1e-4, micro-batch 1 y acumulación de gradientes de 8, durante dos épocas con un horizonte de coseno de tres épocas. Los objetivos MOS se interpolan a través de cinco palabras de calidad (probablemente una escala de anclaje lingüístico).

La entrada del modelo consiste en ocho fotogramas uniformemente muestreados del vídeo, cada uno renderizado a tres exposiciones (-2, 0, +2 stops), generando 24 imágenes que se pasan en orden temporal-mayor. Esta estrategia de multi-exposición permite al modelo capturar información de rango dinámico y artefactos HDR que no serían visibles en una sola exposición.

El entrenamiento se realiza sobre el split 0 de BrightVQ, un dataset de vídeos UGC-HDR con anotaciones de calidad. No se menciona el uso de RLHF ni DPO; es un entrenamiento supervisado clásico con regresión a MOS.

## Capacidades

- Evaluación de calidad perceptual sin referencia (no-reference) de vídeo HDR generado por usuarios.
- Procesamiento de múltiples exposiciones de fotogramas para capturar artefactos HDR (banding, clipping, tonemapping).
- Predicción de puntuaciones MOS (Mean Opinion Score) interpoladas a través de anclajes lingüísticos.
- Integración con el modelo base Qwen2.5-VL para razonamiento visual y semántico sobre el contenido del vídeo.
- Capacidad de procesar secuencias de imágenes (8 fotogramas × 3 exposiciones) como entrada multimodal.
- No soporta tool calling ni agentes; es un modelo de regresión perceptual, no un asistente conversacional.

## Casos de uso

- Investigación en calidad de vídeo HDR: el adaptador permite estudiar cómo los modelos vision-language pueden adaptarse a la evaluación perceptual de contenido HDR generado por usuarios, comparando con métricas tradicionales como PSNR o SSIM.
- Desarrollo de pipelines de control de calidad automatizado para plataformas de vídeo UGC: aunque no está calibrado para producción, puede servir como base para entrenar modelos más robustos en entornos reales.
- Análisis de artefactos HDR específicos: al usar múltiples exposiciones, el modelo puede identificar problemas como clipping de highlights o banding en zonas de gradiente, útil para debugging de pipelines de tonemapping.
- Benchmarking de algoritmos de mejora de vídeo HDR: se puede usar para comparar la calidad percibida de vídeos procesados con diferentes técnicas de mejora, siempre que se recalibre para el dominio específico.
- Estudio de la relación entre exposición y calidad percibida: el diseño multi-exposición permite investigar cómo la exposición afecta a la percepción de calidad en contenido HDR.
- Extensión de modelos vision-language a tareas de regresión perceptual: sirve como ejemplo de cómo adaptar un modelo generativo a una tarea de evaluación numérica, con potencial para otras métricas de calidad (imagen, audio, etc.).

## Benchmarks y rendimiento

En el conjunto de test del split 0 de BrightVQ (420 vídeos), el adaptador reporta las siguientes métricas de correlación y error:

| Metrica | Valor |
|---|---|
| SROCC (Spearman Rank Order Correlation Coefficient) | 0.8875 |
| PLCC (Pearson Linear Correlation Coefficient) | 0.8894 |
| KRCC (Kendall Rank Correlation Coefficient) | 0.7080 |
| RMSE (Root Mean Square Error) | 6.1125 |

No se han publicado comparaciones con otros modelos en la información disponible. Estas métricas indican una alta correlación entre las predicciones del modelo y las puntuaciones humanas, pero deben interpretarse con cautela al ser un estudio controlado sobre un dataset específico.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.1 GB) y se carga sobre el modelo base Qwen2.5-VL-3B-Instruct.
- El modelo base de 3B parámetros requiere aproximadamente 6-8 GB de VRAM en FP16, y puede caber en GPUs consumer como RTX 3060 (12 GB), RTX 4070 (12 GB) o superiores.
- Para inferencia con el adaptador, se puede usar la librería PEFT de HuggingFace junto con transformers.
- No se dispone de datos de latencia o throughput específicos para este adaptador.
- Opciones de despliegue: transformers + PEFT, o vLLM si se convierte a un formato compatible (aunque no es un modelo de generación de texto estándar, sino de regresión).
- En entornos de investigación, una GPU con al menos 12 GB de VRAM es suficiente para procesar los 24 fotogramas de entrada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (evaluación de calidad de vídeo HDR con adaptadores LoRA sobre vision-language). El modelo BrightRate original (mencionado en el proyecto) es un enfoque diferente que combina características de CONTRIQUE, CLIP y transformaciones de luminancia, pero no es directamente comparable al adaptador presentado aquí. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente sobre el dataset BrightVQ (split 0) y no está calibrado para otros datasets, pipelines de visualización o dominios de vídeo. Las puntuaciones pueden no ser fiables fuera de ese contexto.
- La licencia no está especificada, lo que impide su uso comercial sin autorización explícita del autor.
- El modelo es un adaptador de investigación; no se ha validado en entornos de producción ni con vídeos de otras características (resolución, codec, condiciones de captura).
- Al ser un modelo de regresión, no genera explicaciones ni razonamiento sobre sus predicciones; solo produce una puntuación numérica.
- El uso de múltiples exposiciones (24 imágenes) aumenta el coste computacional en comparación con métodos de un solo fotograma.
- No se han documentado sesgos específicos, pero al entrenarse sobre un dataset concreto, puede heredar sesgos de contenido (tipos de escena, condiciones de iluminación, etc.).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/shreshthsaini/brightrate-study-qwen25vl-3b-multiexposure
- Dataset BrightVQ: https://github.com/shreshthsaini/BrightVQ
- Proyecto BrightRate-LM: https://github.com/shreshthsaini/BrightRate-LM
- Página del proyecto BrightRate: https://shreshthsaini.github.io/BrightVQ/
- Paper técnico de Qwen2.5-VL: https://arxiv.org/abs/2502.13923
- Página del paper BrightRate en WACV 2026: https://wacv.thecvf.com/virtual/2026/oral/1209
