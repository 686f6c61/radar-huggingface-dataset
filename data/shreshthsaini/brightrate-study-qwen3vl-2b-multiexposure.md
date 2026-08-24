# shreshthsaini/brightrate-study-qwen3vl-2b-multiexposure

## Resumen

El modelo `shreshthsaini/brightrate-study-qwen3vl-2b-multiexposure` es un adaptador PEFT (LoRA) desarrollado por Shreshth Saini y colaboradores como parte del estudio BrightRate-LM, orientado a la evaluación de calidad perceptual de vídeo HDR generado por usuarios (UGC) sin referencia. Se construye sobre el modelo base `Qwen/Qwen3-VL-2B-Instruct`, un modelo de visión-lenguaje de 2 mil millones de parámetros con soporte nativo para contextos intercalados de hasta 256K tokens. El adaptador transforma el modelo base en un regresor de calidad que puntúa vídeos HDR a partir de una secuencia de fotogramas con exposiciones múltiples.

La relevancia de este adaptador radica en que aborda un problema específico y poco cubierto: la evaluación automática de calidad de vídeo HDR sin referencia, un campo crítico para plataformas de streaming y contenido generado por usuarios. A diferencia de los modelos generalistas de visión-lenguaje, este adaptador está entrenado con el dataset BrightVQ y produce una puntuación MOS (Mean Opinion Score) interpolada a partir de cinco niveles de calidad. El repositorio incluye métricas de rendimiento sobre un conjunto de prueba de 420 vídeos, con un SROCC de 0.8606, lo que indica una correlación alta con las valoraciones humanas.

El adaptador es ligero (0.1 GB) y se distribuye en formato safetensors, lo que facilita su integración en pipelines de investigación. No obstante, su uso está restringido a fines de investigación y no está calibrado para otros conjuntos de datos, pipelines de visualización o dominios de vídeo distintos del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-VL-2B-Instruct (transformer de visión-lenguaje) |
| Parametros totales | No disponible (el adaptador es de 0.1 GB; el modelo base tiene 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens (heredada del modelo base Qwen3-VL-2B-Instruct) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion estandar) |
| Idiomas soportados | No disponible (el adaptador no especifica; el modelo base soporta multiples idiomas) |
| Licencia | No disponible (el adaptador no declara licencia; el modelo base Qwen3-VL-2B-Instruct es open source) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA (Low-Rank Adaptation) con rango 16, alpha 32 y dropout 0.05, aplicado sobre el modelo base Qwen3-VL-2B-Instruct. La entrada consiste en ocho fotogramas muestreados uniformemente del vídeo, cada uno renderizado a tres exposiciones (-2, 0 y +2 pasos), generando un total de 24 imágenes que se pasan al modelo en orden temporal-mayor. Esta construcción de entrada permite al modelo capturar información de rango dinámico y exposición, esencial para evaluar calidad HDR.

El entrenamiento se realizó sobre el split 0 del dataset BrightVQ, con dos épocas completas y un horizonte de programación coseno de tres épocas. Se usó una tasa de aprendizaje de 1e-4, micro-batch de 1 y acumulación de gradientes de 8. Los objetivos MOS se interpolaron a través de cinco palabras de calidad (presumiblemente escalas descriptivas como "malo", "regular", "bueno", etc.). El adaptador está diseñado específicamente para regresión de calidad perceptual, no para generación de texto o diálogo.

## Capacidades

- Evaluación de calidad perceptual de vídeo HDR sin referencia: produce una puntuación MOS a partir de una secuencia de fotogramas con exposiciones múltiples.
- Procesamiento de vídeo a través de fotogramas: acepta 24 imágenes (8 fotogramas × 3 exposiciones) y devuelve una métrica de calidad.
- Regresión numérica: la salida es un valor continuo (MOS) en lugar de texto libre.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es un modelo generativo de texto o imagen; su única función es la puntuación de calidad.
- Capacidades multilingües: no relevantes para esta tarea, ya que la salida es numérica.

## Casos de uso

- Investigación en calidad de vídeo HDR: el adaptador permite a investigadores evaluar la calidad perceptual de vídeos HDR generados por usuarios sin necesidad de estudios subjetivos costosos. Se usaría cargando el adaptador sobre el modelo base y pasando los fotogramas con exposiciones múltiples.
- Comparación de algoritmos de tone mapping: al puntuar vídeos procesados con diferentes operadores de tone mapping, se puede determinar objetivamente cuál preserva mejor la calidad percibida.
- Validación de pipelines de captura y procesado HDR: los desarrolladores de cámaras o software de edición pueden usar el adaptador para medir la calidad de sus salidas frente a referencias humanas.
- Control de calidad en plataformas de streaming: aunque no está calibrado para producción, podría servir como herramienta de pre-selección de vídeos que requieran revisión manual.
- Estudio de correlación entre métricas objetivas y subjetivas: el adaptador proporciona una puntuación MOS que puede compararse con métricas tradicionales (PSNR, SSIM, VMAF) para analizar su alineación.
- Desarrollo de nuevos datasets de calidad: al generar puntuaciones automáticas, se pueden etiquetar grandes volúmenes de vídeo para entrenar otros modelos o crear conjuntos de datos ampliados.

## Benchmarks y rendimiento

El autor reporta las siguientes métricas sobre el conjunto de prueba de 420 vídeos del split 0 de BrightVQ:

| Metrica | Valor |
|---|---|
| SROCC (Spearman Rank Order Correlation Coefficient) | 0.8606 |
| PLCC (Pearson Linear Correlation Coefficient) | 0.8717 |
| KRCC (Kendall Rank Correlation Coefficient) | 0.6673 |
| RMSE (Root Mean Square Error) | 6.6205 |

No se han publicado comparaciones con otros modelos de calidad de vídeo en la información disponible. Estas métricas indican una correlación alta con las valoraciones humanas, pero deben interpretarse con cautela dado que el conjunto de prueba es específico del dataset BrightVQ.

## Requisitos de hardware

- El adaptador en sí es muy ligero (0.1 GB), pero requiere cargar el modelo base Qwen3-VL-2B-Instruct, que tiene 2 mil millones de parámetros.
- VRAM estimada: en FP16, el modelo base ocupa aproximadamente 4 GB, más overhead de activaciones y el adaptador. Con cuantización a 8 bits o 4 bits, podría reducirse a 2-3 GB.
- GPU recomendadas: una GPU consumer con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2070) es suficiente para inferencia con cuantización. Para FP16 completo, se recomienda 12 GB o más.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `peft` de Hugging Face sobre el modelo base. También es compatible con frameworks como vLLM o TGI si se fusiona el adaptador con el modelo base.
- Latencia y throughput: no disponibles. Depende del hardware y de la longitud de la secuencia de entrada (24 imágenes).

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores o modelos específicos para evaluación de calidad de vídeo HDR con la misma metodología. Como referencia, se puede comparar con el modelo base sin adaptador:

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| Qwen3-VL-2B-Instruct (base) | 2B | 256K | Vision-lenguaje general | Apache 2.0 (según el paper) |
| Este adaptador (LoRA) | 0.1 GB (adaptador) | 256K | Regresion de calidad HDR | No disponible |
| Otros modelos de calidad de video (p.ej. VMAF) | No aplica | No aplica | Metrica objetiva | No aplica |

La comparativa con modelos de calidad de vídeo tradicionales (VMAF, PSNR, SSIM) no es directa, ya que estos son métricas algorítmicas, no modelos neuronales entrenados.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente con el dataset BrightVQ (split 0) y no está calibrado para otros conjuntos de datos, pipelines de visualización o dominios de vídeo. Las puntuaciones pueden no ser fiables fuera de ese contexto.
- No se ha publicado información sobre sesgos del dataset BrightVQ. Es probable que existan sesgos hacia ciertos tipos de contenido, resoluciones o condiciones de iluminación.
- Riesgo de alucinación: al ser un modelo de regresión, no genera texto, pero podría producir puntuaciones inconsistentes si la entrada no sigue el formato esperado (8 fotogramas × 3 exposiciones).
- La licencia del adaptador no está declarada, lo que genera incertidumbre sobre su uso comercial. El modelo base Qwen3-VL-2B-Instruct es open source, pero el adaptador podría tener restricciones adicionales.
- No es apto para producción sin una validación exhaustiva en el dominio objetivo. Las métricas reportadas son sobre un conjunto de prueba específico y podrían no generalizar.
- El adaptador requiere que la entrada se construya exactamente como se describe (muestreo uniforme de 8 fotogramas y exposiciones -2, 0, +2). Cualquier desviación podría degradar el rendimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/shreshthsaini/brightrate-study-qwen3vl-2b-multiexposure
- Dataset BrightVQ: https://github.com/shreshthsaini/BrightVQ
- Codigo y construccion de entrada (BrightRate-LM): https://github.com/shreshthsaini/BrightRate-LM
- Paper tecnico de Qwen3-VL (modelo base): https://arxiv.org/abs/2511.21631
- PDF del paper de Qwen3-VL: https://arxiv.org/pdf/2511.21631
- Perfil del autor en HuggingFace: https://huggingface.co/shreshthsaini/models
